import frappe


def update_course_statistics():
	"""Daily task to update course statistics"""
	courses = frappe.get_all("LMS Course", filters={"published": 1}, pluck="name")

	for course_name in courses:
		course = frappe.get_doc("LMS Course", course_name)

		# Update total enrollments
		course.total_enrollments = frappe.db.count("LMS Enrollment", {"course": course_name})

		# Update total lessons
		course.total_lessons = frappe.db.count("Course Lesson", {"course": course_name})

		# Update average rating (placeholder for future rating system)
		course.average_rating = 0

		course.save(ignore_permissions=True)

	frappe.db.commit()
