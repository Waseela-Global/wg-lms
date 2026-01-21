import frappe
from frappe import _
from frappe.utils import now_datetime
import json


@frappe.whitelist()
def get_feedback_form(course_id, feedback_type="Post"):
	"""Get feedback form structure for a course"""
	if not frappe.db.exists("LMS Course", course_id):
		frappe.throw(_("Course not found"))
	
	course = frappe.get_doc("LMS Course", course_id)
	
	# Check if user is enrolled
	user = frappe.session.user
	if user == "Guest":
		frappe.throw(_("Please login to access feedback form"))
	
	enrollment = frappe.db.get_value(
		"LMS Enrollment",
		{"student": user, "course": course_id},
		"name"
	)
	
	if not enrollment:
		frappe.throw(_("You are not enrolled in this course"))
	
	# Get or create feedback form
	feedback = frappe.db.get_value(
		"LMS Training Feedback",
		{"enrollment": enrollment, "feedback_type": feedback_type},
		"name"
	)
	
	if feedback:
		feedback_doc = frappe.get_doc("LMS Training Feedback", feedback)
		questions = []
		for q in feedback_doc.questions:
			questions.append({
				"name": q.name,
				"question": q.question,
				"type": q.type,
				"required": q.required,
				"options": q.options.split(",") if q.options and q.type == "Likert" else None
			})
		
		return {
			"feedback_id": feedback_doc.name,
			"questions": questions,
			"submitted": bool(feedback_doc.submitted_on),
			"responses": json.loads(feedback_doc.responses) if feedback_doc.responses else {}
		}
	
	# Create default feedback form if none exists
	# This would typically be configured per course, but for now we'll use defaults
	default_questions = [
		{
			"question": "How would you rate this training?",
			"type": "Rating",
			"required": True
		},
		{
			"question": "Was the content clear and easy to understand?",
			"type": "Likert",
			"required": True,
			"options": "Strongly Agree,Agree,Neutral,Disagree,Strongly Disagree"
		},
		{
			"question": "What did you like most about this training?",
			"type": "Text",
			"required": False
		},
		{
			"question": "Would you recommend this training to others?",
			"type": "Yes-No",
			"required": True
		}
	]
	
	questions = []
	for q_data in default_questions:
		questions.append({
			"question": q_data["question"],
			"type": q_data["type"],
			"required": q_data.get("required", False),
			"options": q_data.get("options")
		})
	
	return {
		"feedback_id": None,
		"questions": questions,
		"submitted": False,
		"responses": {}
	}


@frappe.whitelist()
def submit_feedback(enrollment_id, feedback_type, responses):
	"""Submit feedback for a training"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to submit feedback"))
	
	if not frappe.db.exists("LMS Enrollment", enrollment_id):
		frappe.throw(_("Enrollment not found"))
	
	enrollment = frappe.get_doc("LMS Enrollment", enrollment_id)
	
	if enrollment.student != user:
		frappe.throw(_("You don't have permission to submit feedback for this enrollment"))
	
	# Parse responses
	if isinstance(responses, str):
		responses = json.loads(responses)
	
	# Get or create feedback
	feedback = frappe.db.get_value(
		"LMS Training Feedback",
		{"enrollment": enrollment_id, "feedback_type": feedback_type},
		"name"
	)
	
	if feedback:
		feedback_doc = frappe.get_doc("LMS Training Feedback", feedback)
		feedback_doc.responses = json.dumps(responses)
		feedback_doc.submitted_on = now_datetime()
		feedback_doc.save(ignore_permissions=True)
	else:
		# Get feedback form structure
		form_data = get_feedback_form(enrollment.course, feedback_type)
		
		# Create feedback
		feedback_doc = frappe.get_doc({
			"doctype": "LMS Training Feedback",
			"enrollment": enrollment_id,
			"course": enrollment.course,
			"student": user,
			"feedback_type": feedback_type,
			"responses": json.dumps(responses),
			"submitted_on": now_datetime()
		})
		
		# Add questions from form
		for q in form_data["questions"]:
			feedback_doc.append("questions", {
				"question": q["question"],
				"type": q["type"],
				"required": q.get("required", False),
				"options": q.get("options", "")
			})
		
		feedback_doc.insert(ignore_permissions=True)
	
	frappe.db.commit()
	
	# Check completion requirements
	try:
		from wg_lms.api.completion import check_completion_status
		check_completion_status(enrollment_id)
	except Exception as e:
		frappe.log_error(f"Error checking completion after feedback: {e}")
	
	return {"success": True, "feedback_id": feedback_doc.name}


@frappe.whitelist()
def check_completion_requirements(enrollment_id):
	"""Check if all completion requirements are met"""
	if not enrollment_id or not frappe.db.exists("LMS Enrollment", enrollment_id):
		# For non-enrolled users or missing enrollment, report requirements as not met
		return {
			"lessons_completed": False,
			"quiz_passed": False,
			"feedback_submitted": False,
			"all_met": False,
			"error": _("Enrollment not found")
		}
	
	enrollment = frappe.get_doc("LMS Enrollment", enrollment_id)
	course = frappe.get_doc("LMS Course", enrollment.course)
	
	# Get completion rules
	completion_rules = course.completion_rules or {}
	if isinstance(completion_rules, str):
		completion_rules = json.loads(completion_rules)
	
	requirements = {
		"lessons_completed": enrollment.progress >= 100,
		"quiz_passed": True,
		"feedback_submitted": True,
		"all_met": False
	}
	
	# Check quiz requirement
	if completion_rules.get("quiz_required"):
		# Get quiz attempts
		quiz_attempts = frappe.get_all(
			"LMS Quiz Attempt",
			filters={"student": enrollment.student, "course": enrollment.course},
			fields=["is_passed"]
		)
		requirements["quiz_passed"] = any(a.is_passed for a in quiz_attempts) if quiz_attempts else False
	else:
		requirements["quiz_passed"] = True
	
	# Check feedback requirement
	if completion_rules.get("feedback_required"):
		feedback = frappe.db.get_value(
			"LMS Training Feedback",
			{"enrollment": enrollment_id, "feedback_type": "Post"},
			"submitted_on"
		)
		requirements["feedback_submitted"] = bool(feedback)
	else:
		requirements["feedback_submitted"] = True
	
	# Check if all requirements met
	requirements["all_met"] = (
		requirements["lessons_completed"] and
		requirements["quiz_passed"] and
		requirements["feedback_submitted"]
	)
	
	return requirements
