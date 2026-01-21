import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def get_lesson(lesson):
	"""Get lesson content - allows view-only access for non-enrolled users"""
	user = frappe.session.user
	
	if not lesson:
		frappe.throw(_("Lesson ID is required"))
	
	# Try to find lesson - handle URL-encoded names
	lesson_name = lesson
	if not frappe.db.exists("Course Lesson", lesson_name):
		# Try URL-decoding if it contains encoded characters
		import urllib.parse
		decoded_lesson = urllib.parse.unquote(lesson_name)
		if decoded_lesson != lesson_name and frappe.db.exists("Course Lesson", decoded_lesson):
			lesson_name = decoded_lesson
		else:
			# Try finding by title if name doesn't work
			lesson_by_title = frappe.db.get_value("Course Lesson", {"title": lesson_name}, "name")
			if lesson_by_title:
				lesson_name = lesson_by_title
			else:
				frappe.throw(_("Lesson not found: {0}").format(lesson))
	
	if not frappe.db.exists("Course Lesson", lesson_name):
		frappe.throw(_("Lesson not found: {0}").format(lesson))
	
	lesson_doc = frappe.get_doc("Course Lesson", lesson_name)
	
	# Check if user is instructor or admin
	user_roles = frappe.get_roles(user)
	is_instructor = "Instructor" in user_roles or "LMS Admin" in user_roles or user == "Administrator"
	is_enrolled = False
	is_view_only = False
	
	# Check enrollment status
	if user != "Guest":
		is_enrolled = frappe.db.exists("LMS Enrollment", {"student": user, "course": lesson_doc.course})
	
	# Determine access level - always allow view, but mark as view-only if not enrolled
	if user == "Guest" and not lesson_doc.include_in_preview:
		frappe.throw(_("Please login to access this lesson"))
	
	# If not enrolled and not instructor/admin, show in view-only mode
	if not is_enrolled and not is_instructor:
		is_view_only = True
	
	result = {
		"name": lesson_doc.name,
		"title": lesson_doc.title,
		"chapter": lesson_doc.chapter,
		"course": lesson_doc.course,
		"content": lesson_doc.content,
		"youtube_url": lesson_doc.youtube_url,
		"quiz_id": lesson_doc.quiz_id,
		"assignment_id": lesson_doc.assignment_id,
		"include_in_preview": lesson_doc.include_in_preview,
		"is_enrolled": is_enrolled,
		"is_view_only": is_view_only
	}
	
	# Include instructor notes only for instructors/admins
	if is_instructor and lesson_doc.instructor_notes:
		result["instructor_notes"] = lesson_doc.instructor_notes
	
	return result


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
		
		# Don't auto-complete here - let completion API check all requirements
		# if enrollment.progress == 100 and not enrollment.is_completed:
		# 	enrollment.is_completed = 1
		# 	enrollment.completed_on = frappe.utils.today()
	
	enrollment.save(ignore_permissions=True)
	
	# Check completion requirements if progress is 100%
	if enrollment.progress == 100 and not enrollment.is_completed:
		try:
			from wg_lms.api.completion import check_completion_status
			check_completion_status(enrollment.name)
		except Exception as e:
			frappe.log_error(f"Error checking completion status: {e}")
	
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

