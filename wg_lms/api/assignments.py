import frappe
from frappe import _
from frappe.utils import now_datetime


@frappe.whitelist()
def get_assignment(assignment_id):
	"""Get assignment details"""
	user = frappe.session.user
	
	if not frappe.db.exists("LMS Assignment", assignment_id):
		frappe.throw(_("Assignment not found"))
	
	assignment_doc = frappe.get_doc("LMS Assignment", assignment_id)
	
	# Get lesson to check access
	lesson = None
	if assignment_doc.get("lesson"):
		lesson = frappe.get_doc("Course Lesson", assignment_doc.lesson)
		if not lesson.include_in_preview:
			if user == "Guest":
				frappe.throw(_("Please login to access this assignment"))
			
			if not frappe.db.exists("LMS Enrollment", {"student": user, "course": lesson.course}):
				frappe.throw(_("Please enroll in the course to access this assignment"))
	
	# Get user's submissions
	submissions = frappe.get_all(
		"LMS Assignment Submission",
		filters={"assignment": assignment_id, "student": user},
		fields=["name", "status", "score", "submitted_on", "feedback"],
		order_by="creation desc"
	)
	
	return {
		"name": assignment_doc.name,
		"title": assignment_doc.title,
		"question": assignment_doc.question,
		"type": assignment_doc.type,
		"grade_assignment": assignment_doc.grade_assignment,
		"show_answer": assignment_doc.show_answer,
		"answer": assignment_doc.answer if assignment_doc.show_answer else None,
		"submissions": submissions,
		"has_submission": len(submissions) > 0,
		"latest_submission": submissions[0] if submissions else None
	}


@frappe.whitelist()
def submit_assignment(assignment_id, submission=None, attachment=None):
	"""Submit assignment"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to submit assignment"))
	
	if not frappe.db.exists("LMS Assignment", assignment_id):
		frappe.throw(_("Assignment not found"))
	
	assignment_doc = frappe.get_doc("LMS Assignment", assignment_id)
	
	# Check if already submitted (allow resubmission if not graded)
	existing_submission = frappe.db.get_value(
		"LMS Assignment Submission",
		{"assignment": assignment_id, "student": user},
		"name",
		order_by="creation desc"
	)
	
	if existing_submission:
		submission_doc = frappe.get_doc("LMS Assignment Submission", existing_submission)
		if submission_doc.status == "Graded":
			frappe.throw(_("Assignment already graded. Cannot resubmit."))
		
		# Update existing submission
		submission_doc.submission = submission
		if attachment:
			submission_doc.attachment = attachment
		submission_doc.status = "Submitted"
		submission_doc.submitted_on = now_datetime()
		submission_doc.save(ignore_permissions=True)
	else:
		# Create new submission
		submission_doc = frappe.get_doc({
			"doctype": "LMS Assignment Submission",
			"assignment": assignment_id,
			"student": user,
			"submission": submission,
			"attachment": attachment,
			"status": "Submitted",
			"submitted_on": now_datetime()
		})
		submission_doc.insert(ignore_permissions=True)
	
	frappe.db.commit()
	
	return {
		"success": True,
		"submission_id": submission_doc.name,
		"message": "Assignment submitted successfully"
	}


@frappe.whitelist()
def get_my_submissions(assignment_id):
	"""Get user's submissions for an assignment"""
	user = frappe.session.user
	
	if user == "Guest":
		return []
	
	if not frappe.db.exists("LMS Assignment", assignment_id):
		frappe.throw(_("Assignment not found"))
	
	submissions = frappe.get_all(
		"LMS Assignment Submission",
		filters={"assignment": assignment_id, "student": user},
		fields=["name", "status", "score", "feedback", "submitted_on", "attachment"],
		order_by="creation desc"
	)
	
	return submissions


@frappe.whitelist()
def get_submission(submission_id):
	"""Get specific submission with feedback"""
	user = frappe.session.user
	
	if not frappe.db.exists("LMS Assignment Submission", submission_id):
		frappe.throw(_("Submission not found"))
	
	submission_doc = frappe.get_doc("LMS Assignment Submission", submission_id)
	
	# Check permission
	if submission_doc.student != user and "LMS Admin" not in frappe.get_roles() and "Instructor" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to view this submission"))
	
	assignment_doc = frappe.get_doc("LMS Assignment", submission_doc.assignment)
	
	return {
		"submission": {
			"name": submission_doc.name,
			"submission": submission_doc.submission,
			"attachment": submission_doc.attachment,
			"status": submission_doc.status,
			"score": submission_doc.score,
			"feedback": submission_doc.feedback,
			"submitted_on": submission_doc.submitted_on
		},
		"assignment": {
			"name": assignment_doc.name,
			"title": assignment_doc.title,
			"question": assignment_doc.question,
			"type": assignment_doc.type,
			"show_answer": assignment_doc.show_answer,
			"answer": assignment_doc.answer if assignment_doc.show_answer else None
		}
	}


@frappe.whitelist()
def grade_assignment(submission_id, score=None, feedback=None):
	"""Grade assignment (instructor/admin only)"""
	user = frappe.session.user
	
	if "LMS Admin" not in frappe.get_roles() and "Instructor" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to grade assignments"))
	
	if not frappe.db.exists("LMS Assignment Submission", submission_id):
		frappe.throw(_("Submission not found"))
	
	submission_doc = frappe.get_doc("LMS Assignment Submission", submission_id)
	
	if submission_doc.status != "Submitted":
		frappe.throw(_("Only submitted assignments can be graded"))
	
	# Update submission
	if score is not None:
		submission_doc.score = score
	if feedback:
		submission_doc.feedback = feedback
	submission_doc.status = "Graded"
	submission_doc.save(ignore_permissions=True)
	frappe.db.commit()
	
	return {
		"success": True,
		"message": "Assignment graded successfully"
	}


@frappe.whitelist()
def get_assignment_submissions(assignment_id):
	"""Get all submissions for an assignment (instructor/admin only)"""
	user = frappe.session.user
	
	if "LMS Admin" not in frappe.get_roles() and "Instructor" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to view submissions"))
	
	if not frappe.db.exists("LMS Assignment", assignment_id):
		frappe.throw(_("Assignment not found"))
	
	submissions = frappe.get_all(
		"LMS Assignment Submission",
		filters={"assignment": assignment_id},
		fields=["name", "student", "status", "score", "submitted_on"],
		order_by="creation desc"
	)
	
	# Add student names
	for submission in submissions:
		user_doc = frappe.get_doc("User", submission.student)
		submission.update({
			"student_name": user_doc.full_name,
			"student_email": user_doc.name
		})
	
	return submissions
