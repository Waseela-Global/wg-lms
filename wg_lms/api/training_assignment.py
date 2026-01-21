import frappe
from frappe import _
from frappe.utils import today, getdate, add_days, add_months
import json


@frappe.whitelist()
def assign_training(course, assignment_type="Mandatory", filters=None, due_date=None, auto_renewal_period=0):
	"""Assign training to users by role/department/individual"""
	user = frappe.session.user
	
	if "LMS Admin" not in frappe.get_roles() and "Course Creator" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to assign trainings"))
	
	if not frappe.db.exists("LMS Course", course):
		frappe.throw(_("Course not found"))
	
	course_doc = frappe.get_doc("LMS Course", course)
	
	# Parse filters
	if isinstance(filters, str):
		filters = json.loads(filters)
	
	# Get users based on filters
	users = get_users_from_filters(filters)
	
	if not users:
		frappe.throw(_("No users found matching the criteria"))
	
	# Set default due date (30 days from today)
	if not due_date:
		due_date = add_days(today(), 30)
	
	# Get completion rules from course
	completion_rules = course_doc.completion_rules or {}
	if isinstance(completion_rules, str):
		completion_rules = json.loads(completion_rules)
	
	# Create assignments
	created_assignments = []
	for user_email in users:
		# Check if assignment already exists
		existing = frappe.db.get_value(
			"LMS Training Assignment",
			{"course": course, "student": user_email, "status": ["!=", "Completed"]},
			"name"
		)
		
		if existing:
			continue
		
		# Get employee if exists
		employee = frappe.db.get_value("Employee", {"user_id": user_email}, "name")
		
		# Create assignment
		assignment = frappe.get_doc({
			"doctype": "LMS Training Assignment",
			"course": course,
			"student": user_email,
			"employee": employee,
			"assigned_by": user,
			"assigned_date": today(),
			"due_date": due_date,
			"assignment_type": assignment_type,
			"status": "Assigned",
			"auto_renewal_period": auto_renewal_period,
			"completion_rules_json": json.dumps(completion_rules)
		})
		assignment.insert(ignore_permissions=True)
		created_assignments.append(assignment.name)
		
		# Send notification
		try:
			from wg_lms.api.notifications import send_assignment_notification
			send_assignment_notification(assignment.name)
		except Exception as e:
			frappe.log_error(f"Error sending assignment notification: {e}")
	
	frappe.db.commit()
	
	return {
		"success": True,
		"assignments_created": len(created_assignments),
		"assignment_ids": created_assignments
	}


def get_users_from_filters(filters):
	"""Get users based on role/department filters"""
	users = set()
	
	if not filters:
		return []
	
	# Filter by roles
	if filters.get("roles"):
		roles = filters["roles"] if isinstance(filters["roles"], list) else [filters["roles"]]
		for role in roles:
			role_users = frappe.get_all(
				"Has Role",
				filters={"role": role, "parenttype": "User"},
				fields=["parent"],
				pluck="parent"
			)
			users.update(role_users)
	
	# Filter by departments (via Employee)
	if filters.get("departments"):
		departments = filters["departments"] if isinstance(filters["departments"], list) else [filters["departments"]]
		for dept in departments:
			employees = frappe.get_all(
				"Employee",
				filters={"department": dept, "status": "Active"},
				fields=["user_id"],
				pluck="user_id"
			)
			users.update([e for e in employees if e])
	
	# Filter by individual users
	if filters.get("users"):
		user_list = filters["users"] if isinstance(filters["users"], list) else [filters["users"]]
		users.update(user_list)
	
	# Exclude Guest and Administrator
	users.discard("Guest")
	users.discard("Administrator")
	
	return list(users)


@frappe.whitelist()
def bulk_assign_training(course, user_list, due_date=None, assignment_type="Mandatory", auto_renewal_period=0):
	"""Bulk assign training to specific users"""
	user = frappe.session.user
	
	if "LMS Admin" not in frappe.get_roles() and "Course Creator" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to assign trainings"))
	
	if not frappe.db.exists("LMS Course", course):
		frappe.throw(_("Course not found"))
	
	if isinstance(user_list, str):
		user_list = json.loads(user_list)
	
	if not user_list:
		frappe.throw(_("No users provided"))
	
	course_doc = frappe.get_doc("LMS Course", course)
	
	# Set default due date
	if not due_date:
		due_date = add_days(today(), 30)
	
	# Get completion rules
	completion_rules = course_doc.completion_rules or {}
	if isinstance(completion_rules, str):
		completion_rules = json.loads(completion_rules)
	
	created_assignments = []
	for user_email in user_list:
		# Check if assignment already exists
		existing = frappe.db.get_value(
			"LMS Training Assignment",
			{"course": course, "student": user_email, "status": ["!=", "Completed"]},
			"name"
		)
		
		if existing:
			continue
		
		# Get employee if exists
		employee = frappe.db.get_value("Employee", {"user_id": user_email}, "name")
		
		# Create assignment
		assignment = frappe.get_doc({
			"doctype": "LMS Training Assignment",
			"course": course,
			"student": user_email,
			"employee": employee,
			"assigned_by": user,
			"assigned_date": today(),
			"due_date": due_date,
			"assignment_type": assignment_type,
			"status": "Assigned",
			"auto_renewal_period": auto_renewal_period,
			"completion_rules_json": json.dumps(completion_rules)
		})
		assignment.insert(ignore_permissions=True)
		created_assignments.append(assignment.name)
		
		# Send notification
		try:
			from wg_lms.api.notifications import send_assignment_notification
			send_assignment_notification(assignment.name)
		except Exception as e:
			frappe.log_error(f"Error sending assignment notification: {e}")
	
	frappe.db.commit()
	
	return {
		"success": True,
		"assignments_created": len(created_assignments),
		"assignment_ids": created_assignments
	}


@frappe.whitelist()
def get_my_assignments(status=None):
	"""Get user's assigned trainings"""
	user = frappe.session.user
	
	if user == "Guest":
		return []
	
	filters = {"student": user}
	if status:
		filters["status"] = status
	
	assignments = frappe.get_all(
		"LMS Training Assignment",
		filters=filters,
		fields=[
			"name", "course", "assigned_date", "due_date",
			"assignment_type", "status", "auto_renewal_period"
		],
		order_by="due_date asc"
	)
	
	# Add course details
	for assignment in assignments:
		course = frappe.get_doc("LMS Course", assignment.course)
		assignment.update({
			"course_title": course.title,
			"course_image": course.image,
			"short_introduction": course.short_introduction
		})
		
		# Check if overdue
		if assignment.due_date and getdate(assignment.due_date) < getdate(today()) and assignment.status != "Completed":
			assignment["is_overdue"] = True
		else:
			assignment["is_overdue"] = False
	
	return assignments


@frappe.whitelist()
def get_assignment_stats(filters=None):
	"""Get completion stats by role/department"""
	user = frappe.session.user
	
	if "LMS Admin" not in frappe.get_roles() and "Course Creator" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to view assignment stats"))
	
	if isinstance(filters, str):
		filters = json.loads(filters)
	
	# Get all assignments
	assignment_filters = {}
	if filters:
		if filters.get("course"):
			assignment_filters["course"] = filters["course"]
		if filters.get("status"):
			assignment_filters["status"] = filters["status"]
	
	assignments = frappe.get_all(
		"LMS Training Assignment",
		filters=assignment_filters,
		fields=["name", "student", "course", "status", "due_date"]
	)
	
	# Calculate stats
	total = len(assignments)
	completed = len([a for a in assignments if a.status == "Completed"])
	overdue = len([a for a in assignments if a.due_date and getdate(a.due_date) < getdate(today()) and a.status != "Completed"])
	in_progress = len([a for a in assignments if a.status == "In Progress"])
	assigned = len([a for a in assignments if a.status == "Assigned"])
	
	completion_rate = (completed / total * 100) if total > 0 else 0
	
	# Stats by role
	role_stats = {}
	for assignment in assignments:
		user_roles = frappe.get_roles(assignment.student)
		for role in user_roles:
			if role not in ["Guest", "All", "System Manager"]:
				if role not in role_stats:
					role_stats[role] = {"total": 0, "completed": 0, "overdue": 0}
				role_stats[role]["total"] += 1
				if assignment.status == "Completed":
					role_stats[role]["completed"] += 1
				elif assignment.due_date and getdate(assignment.due_date) < getdate(today()):
					role_stats[role]["overdue"] += 1
	
	# Stats by department
	dept_stats = {}
	for assignment in assignments:
		employee = frappe.db.get_value("Employee", {"user_id": assignment.student}, "department")
		if employee:
			dept = employee
			if dept not in dept_stats:
				dept_stats[dept] = {"total": 0, "completed": 0, "overdue": 0}
			dept_stats[dept]["total"] += 1
			if assignment.status == "Completed":
				dept_stats[dept]["completed"] += 1
			elif assignment.due_date and getdate(assignment.due_date) < getdate(today()):
				dept_stats[dept]["overdue"] += 1
	
	return {
		"overall": {
			"total": total,
			"completed": completed,
			"overdue": overdue,
			"in_progress": in_progress,
			"assigned": assigned,
			"completion_rate": round(completion_rate, 2)
		},
		"by_role": role_stats,
		"by_department": dept_stats
	}


@frappe.whitelist()
def check_and_renew_assignments():
	"""Auto-renew recurring assignments (called by scheduled task)"""
	# Get assignments with auto renewal that are completed and past renewal date
	assignments = frappe.get_all(
		"LMS Training Assignment",
		filters={
			"status": "Completed",
			"auto_renewal_period": [">", 0],
			"next_renewal_date": ["<=", today()]
		},
		fields=["name", "course", "student", "auto_renewal_period", "last_renewed_on"]
	)
	
	renewed_count = 0
	for assignment in assignments:
		try:
			assignment_doc = frappe.get_doc("LMS Training Assignment", assignment.name)
			
			# Create new assignment
			new_assignment = frappe.get_doc({
				"doctype": "LMS Training Assignment",
				"course": assignment.course,
				"student": assignment.student,
				"assigned_by": "Administrator",
				"assigned_date": today(),
				"due_date": add_months(today(), assignment.auto_renewal_period),
				"assignment_type": assignment_doc.assignment_type,
				"status": "Assigned",
				"auto_renewal_period": assignment.auto_renewal_period,
				"completion_rules_json": assignment_doc.completion_rules_json
			})
			new_assignment.insert(ignore_permissions=True)
			
			# Update old assignment
			assignment_doc.last_renewed_on = today()
			assignment_doc.next_renewal_date = None
			assignment_doc.save(ignore_permissions=True)
			
			# Send notification
			try:
				from wg_lms.api.notifications import send_assignment_notification
				send_assignment_notification(new_assignment.name)
			except Exception as e:
				frappe.log_error(f"Error sending renewal notification: {e}")
			
			renewed_count += 1
		except Exception as e:
			frappe.log_error(f"Error renewing assignment {assignment.name}: {e}")
	
	frappe.db.commit()
	return {"renewed": renewed_count}


@frappe.whitelist()
def mark_assignment_overdue():
	"""Update overdue status for assignments (called by scheduled task)"""
	# Get assignments that are overdue
	overdue_assignments = frappe.get_all(
		"LMS Training Assignment",
		filters={
			"status": ["in", ["Assigned", "In Progress"]],
			"due_date": ["<", today()]
		},
		fields=["name"]
	)
	
	updated_count = 0
	for assignment in overdue_assignments:
		try:
			assignment_doc = frappe.get_doc("LMS Training Assignment", assignment.name)
			if assignment_doc.status != "Overdue":
				assignment_doc.status = "Overdue"
				assignment_doc.save(ignore_permissions=True)
				updated_count += 1
		except Exception as e:
			frappe.log_error(f"Error updating overdue status for {assignment.name}: {e}")
	
	frappe.db.commit()
	return {"updated": updated_count}
