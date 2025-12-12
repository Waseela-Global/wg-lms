import frappe
from frappe import _
import json
from frappe.utils import now_datetime, get_datetime, time_diff_in_seconds


@frappe.whitelist()
def get_quiz(quiz_id):
	"""Get quiz with questions and options"""
	user = frappe.session.user
	
	if not frappe.db.exists("LMS Quiz", quiz_id):
		frappe.throw(_("Quiz not found"))
	
	quiz_doc = frappe.get_doc("LMS Quiz", quiz_id)
	
	# Check if user has access (enrolled in course or lesson is preview)
	if quiz_doc.lesson:
		lesson = frappe.get_doc("Course Lesson", quiz_doc.lesson)
		if not lesson.include_in_preview:
			if user == "Guest":
				frappe.throw(_("Please login to access this quiz"))
			
			if not frappe.db.exists("LMS Enrollment", {"student": user, "course": quiz_doc.course}):
				frappe.throw(_("Please enroll in the course to access this quiz"))
	
	# Get questions with options
	questions = []
	for quiz_question in quiz_doc.questions:
		question_doc = frappe.get_doc("LMS Question", quiz_question.question)
		options = []
		
		for option in question_doc.options:
			options.append({
				"name": option.name,
				"option": option.option,
				"is_correct": option.is_correct if quiz_doc.show_answers else None
			})
		
		questions.append({
			"name": question_doc.name,
			"question": question_doc.question,
			"type": question_doc.type,
			"marks": quiz_question.marks or question_doc.marks,
			"options": options,
			"explanation": question_doc.explanation if quiz_doc.show_answers else None
		})
	
	# Shuffle questions if enabled
	if quiz_doc.shuffle_questions:
		import random
		random.shuffle(questions)
	
	# Check attempt limits
	attempts = frappe.get_all(
		"LMS Quiz Attempt",
		filters={"quiz": quiz_id, "student": user},
		order_by="creation desc"
	)
	
	can_attempt = True
	if quiz_doc.max_attempts and quiz_doc.max_attempts > 0:
		if len(attempts) >= quiz_doc.max_attempts:
			can_attempt = False
	
	return {
		"name": quiz_doc.name,
		"title": quiz_doc.title,
		"course": quiz_doc.course,
		"lesson": quiz_doc.lesson,
		"passing_percentage": quiz_doc.passing_percentage,
		"duration": quiz_doc.duration,
		"max_attempts": quiz_doc.max_attempts,
		"show_answers": quiz_doc.show_answers,
		"questions": questions,
		"total_questions": len(questions),
		"total_marks": sum(q.get("marks", 1) for q in questions),
		"attempts_count": len(attempts),
		"can_attempt": can_attempt,
		"last_attempt": attempts[0].name if attempts else None
	}


@frappe.whitelist()
def start_quiz(quiz_id):
	"""Start a quiz attempt"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to take quiz"))
	
	if not frappe.db.exists("LMS Quiz", quiz_id):
		frappe.throw(_("Quiz not found"))
	
	quiz_doc = frappe.get_doc("LMS Quiz", quiz_id)
	
	# Check attempt limits
	if quiz_doc.max_attempts and quiz_doc.max_attempts > 0:
		attempts = frappe.db.count("LMS Quiz Attempt", {"quiz": quiz_id, "student": user})
		if attempts >= quiz_doc.max_attempts:
			frappe.throw(_("Maximum attempts reached for this quiz"))
	
	# Create quiz attempt
	attempt = frappe.get_doc({
		"doctype": "LMS Quiz Attempt",
		"quiz": quiz_id,
		"student": user,
		"course": quiz_doc.course,
		"lesson": quiz_doc.lesson,
		"started_at": now_datetime(),
		"answers": json.dumps({})
	})
	attempt.insert(ignore_permissions=True)
	frappe.db.commit()
	
	return attempt.name


@frappe.whitelist()
def submit_quiz(attempt_id, answers):
	"""Submit quiz answers and calculate score"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to submit quiz"))
	
	if not frappe.db.exists("LMS Quiz Attempt", attempt_id):
		frappe.throw(_("Quiz attempt not found"))
	
	attempt_doc = frappe.get_doc("LMS Quiz Attempt", attempt_id)
	
	if attempt_doc.student != user:
		frappe.throw(_("You don't have permission to submit this quiz"))
	
	if attempt_doc.submitted_at:
		frappe.throw(_("Quiz already submitted"))
	
	# Parse answers
	if isinstance(answers, str):
		answers = json.loads(answers)
	
	quiz_doc = frappe.get_doc("LMS Quiz", attempt_doc.quiz)
	
	# Calculate score
	total_marks = 0
	obtained_marks = 0
	
	for quiz_question in quiz_doc.questions:
		question_doc = frappe.get_doc("LMS Question", quiz_question.question)
		question_marks = quiz_question.marks or question_doc.marks
		total_marks += question_marks
		
		user_answer = answers.get(question_doc.name)
		if user_answer:
			# Check if answer is correct
			if question_doc.type == "Single Choice":
				# Find correct option
				correct_option = None
				for option in question_doc.options:
					if option.is_correct:
						correct_option = option.name
						break
				
				if user_answer == correct_option:
					obtained_marks += question_marks
			
			elif question_doc.type == "Multiple Choice":
				# Get all correct options
				correct_options = [opt.name for opt in question_doc.options if opt.is_correct]
				user_options = user_answer if isinstance(user_answer, list) else [user_answer]
				
				if set(user_options) == set(correct_options):
					obtained_marks += question_marks
			
			elif question_doc.type == "True/False":
				correct_option = None
				for option in question_doc.options:
					if option.is_correct:
						correct_option = option.name
						break
				
				if user_answer == correct_option:
					obtained_marks += question_marks
	
	# Calculate percentage
	percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0
	is_passed = percentage >= quiz_doc.passing_percentage
	
	# Calculate time taken
	time_taken = 0
	if attempt_doc.started_at:
		time_taken = int(time_diff_in_seconds(now_datetime(), attempt_doc.started_at))
	
	# Update attempt
	attempt_doc.answers = json.dumps(answers)
	attempt_doc.score = obtained_marks
	attempt_doc.percentage = percentage
	attempt_doc.is_passed = is_passed
	attempt_doc.submitted_at = now_datetime()
	attempt_doc.time_taken = time_taken
	attempt_doc.save(ignore_permissions=True)
	frappe.db.commit()
	
	return {
		"success": True,
		"score": obtained_marks,
		"total_marks": total_marks,
		"percentage": round(percentage, 2),
		"is_passed": is_passed,
		"passing_percentage": quiz_doc.passing_percentage
	}


@frappe.whitelist()
def get_quiz_results(quiz_id):
	"""Get user's quiz results"""
	user = frappe.session.user
	
	if user == "Guest":
		return []
	
	if not frappe.db.exists("LMS Quiz", quiz_id):
		frappe.throw(_("Quiz not found"))
	
	attempts = frappe.get_all(
		"LMS Quiz Attempt",
		filters={"quiz": quiz_id, "student": user},
		fields=["name", "score", "percentage", "is_passed", "submitted_at", "time_taken"],
		order_by="creation desc"
	)
	
	return attempts


@frappe.whitelist()
def get_quiz_attempt(attempt_id):
	"""Get specific quiz attempt with answers"""
	user = frappe.session.user
	
	if not frappe.db.exists("LMS Quiz Attempt", attempt_id):
		frappe.throw(_("Quiz attempt not found"))
	
	attempt_doc = frappe.get_doc("LMS Quiz Attempt", attempt_id)
	
	if attempt_doc.student != user and "LMS Admin" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to view this attempt"))
	
	quiz_doc = frappe.get_doc("LMS Quiz", attempt_doc.quiz)
	
	# Get questions with correct answers and user answers
	questions = []
	answers = json.loads(attempt_doc.answers) if attempt_doc.answers else {}
	
	for quiz_question in quiz_doc.questions:
		question_doc = frappe.get_doc("LMS Question", quiz_question.question)
		options = []
		
		for option in question_doc.options:
			options.append({
				"name": option.name,
				"option": option.option,
				"is_correct": option.is_correct
			})
		
		user_answer = answers.get(question_doc.name)
		
		questions.append({
			"name": question_doc.name,
			"question": question_doc.question,
			"type": question_doc.type,
			"marks": quiz_question.marks or question_doc.marks,
			"options": options,
			"explanation": question_doc.explanation,
			"user_answer": user_answer
		})
	
	return {
		"attempt": {
			"name": attempt_doc.name,
			"score": attempt_doc.score,
			"percentage": attempt_doc.percentage,
			"is_passed": attempt_doc.is_passed,
			"submitted_at": attempt_doc.submitted_at,
			"time_taken": attempt_doc.time_taken
		},
		"quiz": {
			"title": quiz_doc.title,
			"passing_percentage": quiz_doc.passing_percentage
		},
		"questions": questions
	}
