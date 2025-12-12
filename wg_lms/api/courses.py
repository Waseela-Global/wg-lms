import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def get_courses(category=None, featured=None, search=None, limit_start=0, limit_page_length=20):
	"""Get list of published courses"""
	filters = {"published": 1}
	
	if category:
		filters["category"] = category
	
	if featured:
		filters["featured"] = 1
	
	or_filters = None
	if search:
		or_filters = {
			"title": ["like", f"%{search}%"],
			"short_introduction": ["like", f"%{search}%"],
			"tags": ["like", f"%{search}%"]
		}
	
	courses = frappe.get_all(
		"LMS Course",
		filters=filters,
		or_filters=or_filters,
		fields=[
			"name", "title", "short_introduction", "image", 
			"category", "total_enrollments", "average_rating", "featured"
		],
		order_by="creation desc",
		limit_start=limit_start,
		limit_page_length=limit_page_length
	)
	
	return courses


@frappe.whitelist(allow_guest=True)
def get_course_detail(course):
	"""Get detailed course information"""
	if not frappe.db.exists("LMS Course", course):
		frappe.throw(_("Course not found"))
	
	course_doc = frappe.get_doc("LMS Course", course)
	
	if not course_doc.published and frappe.session.user == "Guest":
		frappe.throw(_("Course not published"))
	
	# Get chapters with lessons
	chapters = []
	for chapter_ref in course_doc.chapters:
		chapter = frappe.get_doc("Course Chapter", chapter_ref.chapter)
		lessons = []
		
		for lesson_ref in chapter.lessons:
			lesson = frappe.get_doc("Course Lesson", lesson_ref.lesson)
			lessons.append({
				"name": lesson.name,
				"title": lesson.title,
				"include_in_preview": lesson.include_in_preview
			})
		
		chapters.append({
			"name": chapter.name,
			"title": chapter.title,
			"description": chapter.description,
			"lessons": lessons
		})
	
	# Get instructors
	instructors = []
	for instructor_ref in course_doc.instructors:
		user = frappe.get_doc("User", instructor_ref.instructor)
		instructors.append({
			"name": user.name,
			"full_name": user.full_name,
			"user_image": user.user_image
		})
	
	return {
		"name": course_doc.name,
		"title": course_doc.title,
		"short_introduction": course_doc.short_introduction,
		"description": course_doc.description,
		"image": course_doc.image,
		"video_link": course_doc.video_link,
		"category": course_doc.category,
		"published": course_doc.published,
		"featured": course_doc.featured,
		"enable_certificate": course_doc.enable_certificate,
		"total_enrollments": course_doc.total_enrollments,
		"total_lessons": course_doc.total_lessons,
		"average_rating": course_doc.average_rating,
		"tags": course_doc.tags,
		"instructors": instructors,
		"chapters": chapters
	}


@frappe.whitelist()
def create_course(data):
	"""Create a new course (Instructor/Course Creator only)"""
	if not has_course_creation_permission():
		frappe.throw(_("You don't have permission to create courses"))
	
	# Handle JSON string or dict
	if isinstance(data, str):
		import json
		data = json.loads(data)
	
	# Get current user
	user = frappe.session.user
	
	# Prepare course data
	course_data = {
		"doctype": "LMS Course",
		**data
	}
	
	# Create course document
	course = frappe.get_doc(course_data)
	
	# Add current user as instructor if they have instructor role
	if "Instructor" in frappe.get_roles(user) or "Course Creator" in frappe.get_roles(user):
		course.append("instructors", {"instructor": user})
	
	# Insert course - Frappe handles transactions automatically
	course.insert(ignore_permissions=True)
	frappe.db.commit()
	
	return course.name


@frappe.whitelist()
def update_course(course, data):
	"""Update course (Instructor/Course Creator only)"""
	if not has_course_edit_permission(course):
		frappe.throw(_("You don't have permission to edit this course"))
	
	# Handle JSON string or dict
	if isinstance(data, str):
		import json
		data = json.loads(data)
	
	# Get course document and update
	course_doc = frappe.get_doc("LMS Course", course)
	course_doc.update(data)
	course_doc.save(ignore_permissions=True)
	frappe.db.commit()
	
	return course_doc.name


@frappe.whitelist()
def get_course_students(course):
	"""Get list of students enrolled in a course"""
	if not has_course_view_permission(course):
		frappe.throw(_("You don't have permission to view this course"))
	
	enrollments = frappe.get_all(
		"LMS Enrollment",
		filters={"course": course},
		fields=["student", "enrollment_date", "progress", "is_completed", "completed_on"]
	)
	
	for enrollment in enrollments:
		user = frappe.get_doc("User", enrollment.student)
		enrollment.update({
			"full_name": user.full_name,
			"user_image": user.user_image
		})
	
	return enrollments


def has_course_creation_permission():
	"""Check if user can create courses"""
	roles = frappe.get_roles()
	return any(role in ["LMS Admin", "Course Creator", "Instructor"] for role in roles)


def has_course_edit_permission(course):
	"""Check if user can edit a course"""
	if "LMS Admin" in frappe.get_roles():
		return True
	
	course_doc = frappe.get_doc("LMS Course", course)
	user = frappe.session.user
	
	# Check if user is an instructor of this course
	for instructor in course_doc.instructors:
		if instructor.instructor == user:
			return True
	
	return False


def has_course_view_permission(course):
	"""Check if user can view course students"""
	return has_course_edit_permission(course)

