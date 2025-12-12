import frappe
from frappe import _
from frappe.utils import today
import json


@frappe.whitelist()
def check_completion_status(enrollment_id):
	"""Check if all completion requirements are met"""
	if not frappe.db.exists("LMS Enrollment", enrollment_id):
		frappe.throw(_("Enrollment not found"))
	
	enrollment = frappe.get_doc("LMS Enrollment", enrollment_id)
	course = frappe.get_doc("LMS Course", enrollment.course)
	
	# Get completion rules
	completion_rules = course.completion_rules or {}
	if isinstance(completion_rules, str):
		completion_rules = json.loads(completion_rules)
	
	# Check lesson completion (always required)
	lessons_completed = enrollment.progress >= 100
	
	if not lessons_completed:
		return {
			"all_met": False,
			"lessons_completed": False,
			"quiz_passed": None,
			"feedback_submitted": None
		}
	
	# Check quiz requirement
	quiz_passed = True
	if completion_rules.get("quiz_required"):
		quiz_attempts = frappe.get_all(
			"LMS Quiz Attempt",
			filters={"student": enrollment.student, "course": enrollment.course},
			fields=["is_passed"]
		)
		quiz_passed = any(a.is_passed for a in quiz_attempts) if quiz_attempts else False
		
		# Check minimum score if specified
		if quiz_passed and completion_rules.get("min_quiz_score"):
			best_attempt = frappe.db.get_value(
				"LMS Quiz Attempt",
				{"student": enrollment.student, "course": enrollment.course},
				"percentage",
				order_by="percentage desc"
			)
			if best_attempt and best_attempt < completion_rules.get("min_quiz_score"):
				quiz_passed = False
	
	# Check feedback requirement
	feedback_submitted = True
	if completion_rules.get("feedback_required"):
		feedback = frappe.db.get_value(
			"LMS Training Feedback",
			{"enrollment": enrollment_id, "feedback_type": "Post"},
			"submitted_on"
		)
		feedback_submitted = bool(feedback)
	
	all_met = lessons_completed and quiz_passed and feedback_submitted
	
	# Auto-complete if all requirements met
	if all_met and not enrollment.is_completed:
		mark_complete_if_eligible(enrollment_id)
	
	return {
		"all_met": all_met,
		"lessons_completed": lessons_completed,
		"quiz_passed": quiz_passed,
		"feedback_submitted": feedback_submitted
	}


@frappe.whitelist()
def mark_complete_if_eligible(enrollment_id):
	"""Mark enrollment as complete if all requirements are met"""
	if not frappe.db.exists("LMS Enrollment", enrollment_id):
		frappe.throw(_("Enrollment not found"))
	
	enrollment = frappe.get_doc("LMS Enrollment", enrollment_id)
	
	if enrollment.is_completed:
		return {"success": True, "message": "Already completed"}
	
	# Check completion status
	status = check_completion_status(enrollment_id)
	
	if not status["all_met"]:
		return {
			"success": False,
			"message": "Completion requirements not met",
			"requirements": status
		}
	
	# Mark as completed
	enrollment.is_completed = 1
	enrollment.completed_on = today()
	enrollment.save(ignore_permissions=True)
	
	# Update assignment status
	if enrollment.assignment:
		try:
			assignment = frappe.get_doc("LMS Training Assignment", enrollment.assignment)
			assignment.status = "Completed"
			assignment.save(ignore_permissions=True)
		except Exception as e:
			frappe.log_error(f"Error updating assignment status: {e}")
	
	# Send completion notification
	try:
		from wg_lms.api.notifications import send_completion_notification
		send_completion_notification(enrollment_id)
	except Exception as e:
		frappe.log_error(f"Error sending completion notification: {e}")
	
	frappe.db.commit()
	
	return {"success": True, "message": "Enrollment marked as complete"}


@frappe.whitelist()
def get_completion_requirements(course_id):
	"""Get completion requirements for a course"""
	if not frappe.db.exists("LMS Course", course_id):
		frappe.throw(_("Course not found"))
	
	course = frappe.get_doc("LMS Course", course_id)
	
	# Get completion rules
	completion_rules = course.completion_rules or {}
	if isinstance(completion_rules, str):
		completion_rules = json.loads(completion_rules)
	
	requirements = {
		"lessons_required": True,
		"quiz_required": completion_rules.get("quiz_required", False),
		"feedback_required": completion_rules.get("feedback_required", False),
		"min_quiz_score": completion_rules.get("min_quiz_score", None)
	}
	
	# Check if course has quiz
	if requirements["quiz_required"]:
		lessons = frappe.get_all(
			"Course Lesson",
			filters={"course": course_id},
			fields=["quiz_id"]
		)
		has_quiz = any(l.quiz_id for l in lessons)
		if not has_quiz:
			requirements["quiz_required"] = False
	
	return requirements
