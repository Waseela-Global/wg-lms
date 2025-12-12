import frappe
from frappe.utils import today, getdate


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


def send_reminder_notifications():
	"""Send reminder notifications (hourly task)"""
	try:
		from wg_lms.api.notifications import send_reminder_notifications as send_reminders
		result = send_reminders()
		frappe.logger().info(f"Reminder notifications sent: {result}")
	except Exception as e:
		frappe.log_error(f"Error in send_reminder_notifications task: {e}")


def update_overdue_status():
	"""Update overdue status for enrollments and assignments (hourly task)"""
	try:
		# Update enrollment overdue status
		enrollments = frappe.get_all(
			"LMS Enrollment",
			filters={
				"is_completed": 0,
				"due_date": ["<", today()]
			},
			fields=["name", "due_date"]
		)
		
		for enrollment in enrollments:
			try:
				enrollment_doc = frappe.get_doc("LMS Enrollment", enrollment.name)
				if not enrollment_doc.is_overdue:
					enrollment_doc.is_overdue = 1
					enrollment_doc.save(ignore_permissions=True)
			except Exception as e:
				frappe.log_error(f"Error updating overdue status for enrollment {enrollment.name}: {e}")
		
		# Update assignment overdue status
		from wg_lms.api.training_assignment import mark_assignment_overdue
		result = mark_assignment_overdue()
		
		frappe.db.commit()
		frappe.logger().info(f"Overdue status updated: {result}")
	except Exception as e:
		frappe.log_error(f"Error in update_overdue_status task: {e}")


def check_and_renew_assignments():
	"""Check and renew recurring assignments (daily task)"""
	try:
		from wg_lms.api.training_assignment import check_and_renew_assignments as renew_assignments
		result = renew_assignments()
		frappe.logger().info(f"Assignments renewed: {result}")
	except Exception as e:
		frappe.log_error(f"Error in check_and_renew_assignments task: {e}")
