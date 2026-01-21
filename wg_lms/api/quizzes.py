import frappe
from frappe import _
import json
from frappe.utils import now_datetime, get_datetime, time_diff_in_seconds


@frappe.whitelist()
def get_quiz(quiz_id):
	"""Get quiz with questions and options"""
	try:
		user = frappe.session.user
		
		if not quiz_id:
			frappe.throw(_("Quiz ID is required"))
		
		if not frappe.db.exists("LMS Quiz", quiz_id):
			frappe.throw(_("Quiz not found"))
		
		quiz_doc = frappe.get_doc("LMS Quiz", quiz_id)
		
		# Check if user has access (enrolled in course or lesson is preview)
		if quiz_doc.lesson:
			try:
				lesson = frappe.get_doc("Course Lesson", quiz_doc.lesson)
				if not lesson.include_in_preview:
					if user == "Guest":
						frappe.throw(_("Please login to access this quiz"))
					
					if not frappe.db.exists("LMS Enrollment", {"student": user, "course": quiz_doc.course}):
						frappe.throw(_("Please enroll in the course to access this quiz"))
			except frappe.DoesNotExistError:
				frappe.throw(_("Lesson not found"))
			except Exception as e:
				frappe.log_error(f"Error checking lesson access: {e}")
				frappe.throw(_("Error checking access permissions"))
		
		# Get questions with options
		questions = []
		if not quiz_doc.questions:
			frappe.throw(_("Quiz has no questions"))
		
		for quiz_question in quiz_doc.questions:
			if not quiz_question.question:
				continue
			
			try:
				question_doc = frappe.get_doc("LMS Question", quiz_question.question)
				options = []
				
				if question_doc.options:
					for option in question_doc.options:
						options.append({
							"name": option.name,
							"option": option.option or "",
							"is_correct": option.is_correct if quiz_doc.show_answers else None
						})
				
				question_marks = quiz_question.marks if quiz_question.marks else (question_doc.marks if question_doc.marks else 1)
				
				questions.append({
					"name": question_doc.name,
					"question": question_doc.question or "",
					"type": question_doc.type or "Single Choice",
					"marks": question_marks,
					"options": options,
					"explanation": question_doc.explanation if quiz_doc.show_answers else None
				})
			except frappe.DoesNotExistError:
				frappe.log_error(f"Question not found: {quiz_question.question}")
				continue
			except Exception as e:
				frappe.log_error(f"Error loading question {quiz_question.question}: {e}")
				continue
		
		if not questions:
			frappe.throw(_("No valid questions found in quiz"))
		
		# Shuffle questions if enabled
		if quiz_doc.shuffle_questions:
			import random
			random.shuffle(questions)
		
		# Check attempt limits
		attempts = []
		if user != "Guest":
			try:
				attempts = frappe.get_all(
					"LMS Quiz Attempt",
					filters={"quiz": quiz_id, "student": user},
					order_by="creation desc",
					limit_page_length=1000
				)
			except Exception as e:
				frappe.log_error(f"Error fetching attempts: {e}")
				attempts = []
		
		can_attempt = True
		if quiz_doc.max_attempts and quiz_doc.max_attempts > 0:
			if len(attempts) >= quiz_doc.max_attempts:
				can_attempt = False
		
		total_marks = sum(q.get("marks", 1) for q in questions) if questions else 0
		
		return {
			"name": quiz_doc.name,
			"title": quiz_doc.title or "",
			"course": quiz_doc.course or None,
			"lesson": quiz_doc.lesson or None,
			"passing_percentage": quiz_doc.passing_percentage or 0,
			"duration": quiz_doc.duration or 0,
			"max_attempts": quiz_doc.max_attempts or 0,
			"show_answers": quiz_doc.show_answers or False,
			"questions": questions,
			"total_questions": len(questions),
			"total_marks": total_marks,
			"attempts_count": len(attempts),
			"can_attempt": can_attempt,
			"last_attempt": attempts[0].name if attempts else None
		}
	except frappe.ValidationError:
		raise
	except Exception as e:
		frappe.log_error(f"Error in get_quiz: {e}")
		frappe.throw(_("An error occurred while loading the quiz. Please try again."))


@frappe.whitelist()
def start_quiz(quiz_id):
	"""Start a quiz attempt"""
	try:
		user = frappe.session.user
		
		if user == "Guest":
			frappe.throw(_("Please login to take quiz"))
		
		if not quiz_id:
			frappe.throw(_("Quiz ID is required"))
		
		if not frappe.db.exists("LMS Quiz", quiz_id):
			frappe.throw(_("Quiz not found"))
		
		quiz_doc = frappe.get_doc("LMS Quiz", quiz_id)
		
		# Check attempt limits
		if quiz_doc.max_attempts and quiz_doc.max_attempts > 0:
			try:
				attempts = frappe.db.count("LMS Quiz Attempt", {"quiz": quiz_id, "student": user})
				if attempts >= quiz_doc.max_attempts:
					frappe.throw(_("Maximum attempts reached for this quiz"))
			except Exception as e:
				frappe.log_error(f"Error checking attempt limits: {e}")
				# Continue if count fails, but log the error
		
		# Create quiz attempt
		attempt_data = {
			"doctype": "LMS Quiz Attempt",
			"quiz": quiz_id,
			"student": user,
			"started_at": now_datetime(),
			"answers": json.dumps({})
		}
		
		# Add optional fields only if they exist
		if quiz_doc.course:
			attempt_data["course"] = quiz_doc.course
		if quiz_doc.lesson:
			attempt_data["lesson"] = quiz_doc.lesson
		
		attempt = frappe.get_doc(attempt_data)
		attempt.insert(ignore_permissions=True)
		frappe.db.commit()
		
		return attempt.name
	except frappe.ValidationError:
		raise
	except Exception as e:
		frappe.log_error(f"Error in start_quiz: {e}")
		frappe.throw(_("An error occurred while starting the quiz. Please try again."))


@frappe.whitelist()
def submit_quiz(attempt_id, answers):
	"""Submit quiz answers and calculate score"""
	try:
		user = frappe.session.user
		
		if user == "Guest":
			frappe.throw(_("Please login to submit quiz"))
		
		if not attempt_id:
			frappe.throw(_("Attempt ID is required"))
		
		if not frappe.db.exists("LMS Quiz Attempt", attempt_id):
			frappe.throw(_("Quiz attempt not found"))
		
		attempt_doc = frappe.get_doc("LMS Quiz Attempt", attempt_id)
		
		if attempt_doc.student != user:
			frappe.throw(_("You don't have permission to submit this quiz"))
		
		if attempt_doc.submitted_at:
			frappe.throw(_("Quiz already submitted"))
		
		# Parse answers
		if isinstance(answers, str):
			try:
				answers = json.loads(answers)
			except json.JSONDecodeError:
				frappe.throw(_("Invalid answers format"))
		elif not isinstance(answers, dict):
			answers = {}
		
		if not attempt_doc.quiz:
			frappe.throw(_("Quiz not found for this attempt"))
		
		quiz_doc = frappe.get_doc("LMS Quiz", attempt_doc.quiz)
		
		if not quiz_doc.questions:
			frappe.throw(_("Quiz has no questions"))
		
		# Calculate score
		total_marks = 0
		obtained_marks = 0
		
		for quiz_question in quiz_doc.questions:
			if not quiz_question.question:
				continue
			
			try:
				question_doc = frappe.get_doc("LMS Question", quiz_question.question)
				question_marks = quiz_question.marks if quiz_question.marks else (question_doc.marks if question_doc.marks else 1)
				total_marks += question_marks
				
				user_answer = answers.get(question_doc.name)
				if user_answer:
					# Check if answer is correct
					if question_doc.type == "Single Choice":
						# Find correct option
						correct_option = None
						if question_doc.options:
							for option in question_doc.options:
								if option.is_correct:
									correct_option = option.name
									break
						
						if user_answer == correct_option:
							obtained_marks += question_marks
					
					elif question_doc.type == "Multiple Choice":
						# Get all correct options
						correct_options = []
						if question_doc.options:
							correct_options = [opt.name for opt in question_doc.options if opt.is_correct]
						
						user_options = user_answer if isinstance(user_answer, list) else [user_answer]
						
						if set(user_options) == set(correct_options) and len(correct_options) > 0:
							obtained_marks += question_marks
					
					elif question_doc.type == "True/False":
						correct_option = None
						if question_doc.options:
							for option in question_doc.options:
								if option.is_correct:
									correct_option = option.name
									break
						
						if user_answer == correct_option:
							obtained_marks += question_marks
			except frappe.DoesNotExistError:
				frappe.log_error(f"Question not found: {quiz_question.question}")
				continue
			except Exception as e:
				frappe.log_error(f"Error processing question {quiz_question.question}: {e}")
				continue
		
		# Calculate percentage
		percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0
		passing_percentage = quiz_doc.passing_percentage or 0
		is_passed = percentage >= passing_percentage
		
		# Calculate time taken
		time_taken = 0
		if attempt_doc.started_at:
			try:
				time_taken = int(time_diff_in_seconds(now_datetime(), attempt_doc.started_at))
				if time_taken < 0:
					time_taken = 0
			except Exception as e:
				frappe.log_error(f"Error calculating time taken: {e}")
				time_taken = 0
		
		# Update attempt
		try:
			attempt_doc.answers = json.dumps(answers)
			attempt_doc.score = obtained_marks
			attempt_doc.percentage = percentage
			attempt_doc.is_passed = is_passed
			attempt_doc.submitted_at = now_datetime()
			attempt_doc.time_taken = time_taken
			attempt_doc.save(ignore_permissions=True)
			frappe.db.commit()
		except Exception as e:
			frappe.log_error(f"Error saving quiz attempt: {e}")
			frappe.throw(_("Error saving quiz submission. Please try again."))
		
		return {
			"success": True,
			"score": obtained_marks,
			"total_marks": total_marks,
			"percentage": round(percentage, 2),
			"is_passed": is_passed,
			"passing_percentage": passing_percentage
		}
	except frappe.ValidationError:
		raise
	except Exception as e:
		frappe.log_error(f"Error in submit_quiz: {e}")
		frappe.throw(_("An error occurred while submitting the quiz. Please try again."))


@frappe.whitelist()
def get_quiz_results(quiz_id):
	"""Get user's quiz results"""
	try:
		user = frappe.session.user
		
		if user == "Guest":
			return []
		
		if not quiz_id:
			return []
		
		if not frappe.db.exists("LMS Quiz", quiz_id):
			frappe.throw(_("Quiz not found"))
		
		try:
			attempts = frappe.get_all(
				"LMS Quiz Attempt",
				filters={"quiz": quiz_id, "student": user},
				fields=["name", "score", "percentage", "is_passed", "submitted_at", "time_taken"],
				order_by="creation desc",
				limit_page_length=1000
			)
		except Exception as e:
			frappe.log_error(f"Error fetching quiz results: {e}")
			return []
		
		return attempts or []
	except frappe.ValidationError:
		raise
	except Exception as e:
		frappe.log_error(f"Error in get_quiz_results: {e}")
		return []


@frappe.whitelist()
def get_quiz_attempt(attempt_id):
	"""Get specific quiz attempt with answers"""
	try:
		user = frappe.session.user
		
		if not attempt_id:
			frappe.throw(_("Attempt ID is required"))
		
		if not frappe.db.exists("LMS Quiz Attempt", attempt_id):
			frappe.throw(_("Quiz attempt not found"))
		
		attempt_doc = frappe.get_doc("LMS Quiz Attempt", attempt_id)
		
		if attempt_doc.student != user and "LMS Admin" not in frappe.get_roles():
			frappe.throw(_("You don't have permission to view this attempt"))
		
		if not attempt_doc.quiz:
			frappe.throw(_("Quiz not found for this attempt"))
		
		quiz_doc = frappe.get_doc("LMS Quiz", attempt_doc.quiz)
		
		# Get questions with correct answers and user answers
		questions = []
		answers = {}
		
		if attempt_doc.answers:
			try:
				answers = json.loads(attempt_doc.answers)
			except (json.JSONDecodeError, TypeError):
				frappe.log_error(f"Invalid answers JSON in attempt {attempt_id}")
				answers = {}
		
		if not quiz_doc.questions:
			frappe.throw(_("Quiz has no questions"))
		
		for quiz_question in quiz_doc.questions:
			if not quiz_question.question:
				continue
			
			try:
				question_doc = frappe.get_doc("LMS Question", quiz_question.question)
				options = []
				
				if question_doc.options:
					for option in question_doc.options:
						options.append({
							"name": option.name,
							"option": option.option or "",
							"is_correct": option.is_correct or False
						})
				
				question_marks = quiz_question.marks if quiz_question.marks else (question_doc.marks if question_doc.marks else 1)
				user_answer = answers.get(question_doc.name)
				
				questions.append({
					"name": question_doc.name,
					"question": question_doc.question or "",
					"type": question_doc.type or "Single Choice",
					"marks": question_marks,
					"options": options,
					"explanation": question_doc.explanation or None,
					"user_answer": user_answer
				})
			except frappe.DoesNotExistError:
				frappe.log_error(f"Question not found: {quiz_question.question}")
				continue
			except Exception as e:
				frappe.log_error(f"Error loading question {quiz_question.question}: {e}")
				continue
		
		return {
			"attempt": {
				"name": attempt_doc.name,
				"score": attempt_doc.score or 0,
				"percentage": attempt_doc.percentage or 0,
				"is_passed": attempt_doc.is_passed or False,
				"submitted_at": attempt_doc.submitted_at,
				"time_taken": attempt_doc.time_taken or 0
			},
			"quiz": {
				"title": quiz_doc.title or "",
				"passing_percentage": quiz_doc.passing_percentage or 0
			},
			"questions": questions
		}
	except frappe.ValidationError:
		raise
	except Exception as e:
		frappe.log_error(f"Error in get_quiz_attempt: {e}")
		frappe.throw(_("An error occurred while loading the quiz attempt. Please try again."))
