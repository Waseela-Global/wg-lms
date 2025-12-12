import frappe
from frappe import _


@frappe.whitelist()
def get_lesson(lesson):
	"""Get lesson content"""
	user = frappe.session.user
	
	if not frappe.db.exists("Course Lesson", lesson):
		frappe.throw(_("Lesson not found"))
	
	lesson_doc = frappe.get_doc("Course Lesson", lesson)
	
	# Check if user has access
	if not lesson_doc.include_in_preview:
		if user == "Guest":
			frappe.throw(_("Please login to access this lesson"))
		
		# Check if enrolled in the course
		if not frappe.db.exists("LMS Enrollment", {"student": user, "course": lesson_doc.course}):
			frappe.throw(_("Please enroll in the course to access this lesson"))
	
	return {
		"name": lesson_doc.name,
		"title": lesson_doc.title,
		"chapter": lesson_doc.chapter,
		"course": lesson_doc.course,
		"content": lesson_doc.content,
		"youtube_url": lesson_doc.youtube_url,
		"quiz_id": lesson_doc.quiz_id,
		"assignment_id": lesson_doc.assignment_id
	}


@frappe.whitelist()
def mark_lesson_complete(lesson):
	"""Mark a lesson as complete"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to mark lessons as complete"))
	
	lesson_doc = frappe.get_doc("Course Lesson", lesson)
	
	# Check if enrolled
	if not frappe.db.exists("LMS Enrollment", {"student": user, "course": lesson_doc.course}):
		frappe.throw(_("You are not enrolled in this course"))
	
	# Check if already completed
	progress = frappe.db.get_value(
		"LMS Lesson Progress",
		{"student": user, "lesson": lesson, "course": lesson_doc.course},
		"name"
	)
	
	if progress:
		# Update existing progress
		progress_doc = frappe.get_doc("LMS Lesson Progress", progress)
		progress_doc.is_complete = 1
		progress_doc.completed_on = frappe.utils.now()
		progress_doc.save(ignore_permissions=True)
	else:
		# Create new progress record
		progress_doc = frappe.get_doc({
			"doctype": "LMS Lesson Progress",
			"student": user,
			"lesson": lesson,
			"course": lesson_doc.course,
			"is_complete": 1,
			"completed_on": frappe.utils.now()
		})
		progress_doc.insert(ignore_permissions=True)
	
	# Update enrollment progress
	update_enrollment_progress(user, lesson_doc.course)
	
	return {"success": True}


def update_enrollment_progress(student, course):
	"""Update overall enrollment progress"""
	enrollment = frappe.get_doc("LMS Enrollment", {"student": student, "course": course})
	
	# Count total lessons in course
	total_lessons = frappe.db.count("Course Lesson", {"course": course})
	
	if total_lessons == 0:
		enrollment.progress = 0
	else:
		# Count completed lessons
		completed_lessons = frappe.db.count(
			"LMS Lesson Progress",
			{"student": student, "course": course, "is_complete": 1}
		)
		enrollment.progress = int((completed_lessons / total_lessons) * 100)
		
		# Check if course is complete
		if enrollment.progress == 100 and not enrollment.is_completed:
			enrollment.is_completed = 1
			enrollment.completed_on = frappe.utils.today()
	
	enrollment.save(ignore_permissions=True)
	
	# Auto-generate certificate if course is completed
	if enrollment.is_completed:
		try:
			from wg_lms.api.certificates import auto_generate_certificate_on_completion
			auto_generate_certificate_on_completion(enrollment)
		except Exception as e:
			frappe.log_error(f"Error auto-generating certificate: {e}")


@frappe.whitelist()
def get_lesson_progress(course):
	"""Get lesson progress for current user in a course"""
	user = frappe.session.user
	
	if user == "Guest":
		return []
	
	progress = frappe.get_all(
		"LMS Lesson Progress",
		filters={"student": user, "course": course},
		fields=["lesson", "is_complete", "completed_on"]
	)
	
	return progress

