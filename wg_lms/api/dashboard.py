"""
Dashboard API endpoints for analytics and statistics
"""

import frappe
from frappe import _
from frappe.utils import getdate, add_days, today
from datetime import datetime, timedelta


@frappe.whitelist()
def get_dashboard_stats():
	"""Get overall dashboard statistics for current user"""
	try:
		user = frappe.session.user
		
		if user == "Guest":
			return {
				"total_courses": 0,
				"courses_in_progress": 0,
				"courses_completed": 0,
				"total_progress": 0,
				"total_lessons_completed": 0,
				"total_time_spent": 0,
				"learning_streak": 0,
			}
		
		# Get enrollments
		enrollments = frappe.get_all(
			"LMS Enrollment",
			filters={"student": user},
			fields=["progress", "is_completed"]
		)
		
		total_courses = len(enrollments)
		courses_completed = len([e for e in enrollments if e.get("is_completed")])
		courses_in_progress = total_courses - courses_completed
		
		# Calculate total progress
		total_progress = 0
		if total_courses > 0:
			total_progress = int(sum(e.get("progress") or 0 for e in enrollments) / total_courses)
		
		# Count completed lessons
		total_lessons_completed = frappe.db.count(
			"LMS Lesson Progress",
			{"student": user, "status": "Completed"}
		) or 0
		
		# Calculate learning streak (days with at least one lesson completed)
		streak = calculate_learning_streak(user)
		
		return {
			"total_courses": total_courses,
			"courses_in_progress": courses_in_progress,
			"courses_completed": courses_completed,
			"total_progress": total_progress,
			"total_lessons_completed": total_lessons_completed,
			"total_time_spent": 0,  # TODO: Calculate from lesson durations
			"learning_streak": streak,
		}
	except Exception as e:
		frappe.log_error(f"Error in get_dashboard_stats: {e}")
		return {
			"total_courses": 0,
			"courses_in_progress": 0,
			"courses_completed": 0,
			"total_progress": 0,
			"total_lessons_completed": 0,
			"total_time_spent": 0,
			"learning_streak": 0,
		}


@frappe.whitelist()
def get_recent_activity(limit=10):
	"""Get recent learning activity"""
	try:
		user = frappe.session.user
		
		if user == "Guest":
			return []
		
		# Get recently completed lessons - try both field names
		recent_lessons = frappe.get_all(
			"LMS Lesson Progress",
			filters={"student": user, "status": "Completed"},
			fields=["lesson", "course", "completion_date", "completed_on"],
			order_by="completion_date desc, completed_on desc",
			limit=limit
		)
		
		activities = []
		for lesson_progress in recent_lessons:
			try:
				# Get lesson and course with error handling
				lesson_name = lesson_progress.lesson
				course_name = lesson_progress.course
				
				if not lesson_name or not course_name:
					continue
				
				lesson = frappe.get_cached_doc("Course Lesson", lesson_name)
				course = frappe.get_cached_doc("LMS Course", course_name)
				
				# Use completion_date or completed_on
				completion_date = lesson_progress.completion_date or lesson_progress.completed_on
				
				activities.append({
					"lesson_title": lesson.title,
					"course_title": course.title,
					"course_name": course.name,
					"completion_date": completion_date,
				})
			except Exception as e:
				# Skip invalid records
				frappe.log_error(f"Error processing lesson progress: {e}")
				continue
		
		return activities
	except Exception as e:
		frappe.log_error(f"Error in get_recent_activity: {e}")
		return []


@frappe.whitelist()
def get_upcoming_deadlines():
	"""Get upcoming deadlines for enrolled batches"""
	user = frappe.session.user
	
	if user == "Guest":
		return []
	
	# Get batch enrollments
	batch_enrollments = frappe.get_all(
		"LMS Batch Enrollment",
		filters={"student": user, "status": "Enrolled"},
		fields=["batch"]
	)
	
	deadlines = []
	for enrollment in batch_enrollments:
		batch = frappe.get_doc("LMS Batch", enrollment.batch)
		
		if batch.end_date and getdate(batch.end_date) >= today():
			deadlines.append({
				"title": batch.title,
				"batch_name": batch.name,
				"deadline": batch.end_date,
				"type": "batch_end",
			})
	
	# Sort by deadline
	deadlines.sort(key=lambda x: getdate(x["deadline"]))
	
	return deadlines[:5]  # Return next 5 deadlines


@frappe.whitelist()
def get_learning_analytics(days=30):
	"""Get learning analytics for the last N days"""
	user = frappe.session.user
	
	if user == "Guest":
		return {
			"daily_completions": [],
			"courses_progress": [],
		}
	
	# Daily lesson completions
	end_date = today()
	start_date = add_days(end_date, -days)
	
	daily_completions = frappe.db.sql("""
		SELECT 
			DATE(completed_on) as date,
			COUNT(*) as count
		FROM `tabLMS Lesson Progress`
		WHERE student = %s
			AND status = 'Completed'
			AND completed_on >= %s
			AND completed_on <= %s
		GROUP BY DATE(completed_on)
		ORDER BY date ASC
	""", (user, start_date, end_date), as_dict=True)
	
	# Course progress
	enrollments = frappe.get_all(
		"LMS Enrollment",
		filters={"student": user},
		fields=["course", "progress", "is_completed"]
	)
	
	courses_progress = []
	for enrollment in enrollments:
		course = frappe.get_doc("LMS Course", enrollment.course)
		courses_progress.append({
			"course": course.title,
			"course_name": course.name,
			"progress": enrollment.progress or 0,
			"is_completed": enrollment.is_completed,
		})
	
	return {
		"daily_completions": daily_completions,
		"courses_progress": courses_progress,
	}


def calculate_learning_streak(user):
	"""Calculate current learning streak in days"""
	try:
		# Get all completed lessons with dates - try both field names
		completed_lessons = frappe.get_all(
			"LMS Lesson Progress",
			filters={"student": user, "status": "Completed"},
			fields=["completion_date", "completed_on"],
			order_by="completion_date desc, completed_on desc"
		)
		
		if not completed_lessons:
			return 0
		
		# Get unique dates
		dates = set()
		for lesson in completed_lessons:
			date_value = lesson.get("completion_date") or lesson.get("completed_on")
			if date_value:
				dates.add(getdate(date_value))
		
		if not dates:
			return 0
		
		# Simple streak calculation: if completed today or yesterday
		dates_list = sorted(dates, reverse=True)
		if not dates_list:
			return 0
		
		latest_date = dates_list[0]
		current_date = today()
		
		# If latest completion was today, streak is at least 1
		if latest_date == current_date:
			return 1
		# If latest completion was yesterday, streak is 2
		elif latest_date == add_days(current_date, -1):
			return 2
		# Otherwise, no active streak
		else:
			return 0
	except Exception as e:
		frappe.log_error(f"Error calculating learning streak: {e}")
		return 0


@frappe.whitelist()
def get_recommended_courses(limit=6):
	"""Get recommended courses for current user"""
	try:
		user = frappe.session.user
		
		if user == "Guest":
			# Return featured courses for guests
			return frappe.get_all(
				"LMS Course",
				filters={"published": 1, "featured": 1},
				fields=["name", "title", "short_introduction", "image"],
				order_by="creation desc",
				limit=limit
			)
		
		# Get categories of enrolled courses
		enrolled_courses = frappe.get_all(
			"LMS Enrollment",
			filters={"student": user},
			fields=["course"]
		)
		
		enrolled_course_names = [e.course for e in enrolled_courses] if enrolled_courses else []
		
		# Get recommended courses (not enrolled, published)
		filters = {
			"published": 1,
		}
		
		if enrolled_course_names:
			filters["name"] = ["not in", enrolled_course_names]
		
		recommended = frappe.get_all(
			"LMS Course",
			filters=filters,
			fields=["name", "title", "short_introduction", "image"],
			order_by="creation desc",
			limit=limit
		)
		
		return recommended
	except Exception as e:
		frappe.log_error(f"Error in get_recommended_courses: {e}")
		# Return empty array on error
		return []

