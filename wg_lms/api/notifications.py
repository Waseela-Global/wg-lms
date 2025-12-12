import frappe
from frappe import _
from frappe.utils import today, getdate, add_days, format_date
from frappe.core.doctype.communication.email import make


@frappe.whitelist()
def send_assignment_notification(assignment_id):
	"""Send email notification when training is assigned"""
	if not frappe.db.exists("LMS Training Assignment", assignment_id):
		return {"success": False, "error": "Assignment not found"}
	
	assignment = frappe.get_doc("LMS Training Assignment", assignment_id)
	course = frappe.get_doc("LMS Course", assignment.course)
	student = frappe.get_doc("User", assignment.student)
	
	# Prepare email content
	subject = f"Training Assigned: {course.title}"
	
	message = f"""
	<p>Dear {student.full_name or student.name},</p>
	
	<p>You have been assigned a training:</p>
	
	<p><strong>{course.title}</strong></p>
	<p>{course.short_introduction}</p>
	
	<p><strong>Due Date:</strong> {format_date(assignment.due_date)}</p>
	<p><strong>Assignment Type:</strong> {assignment.assignment_type}</p>
	
	<p>Please complete this training before the due date.</p>
	
	<p><a href="{frappe.utils.get_url()}/lms/courses/{course.name}">Access Training</a></p>
	
	<p>Best regards,<br>L&D Team</p>
	"""
	
	# Send email
	try:
		frappe.sendmail(
			recipients=[student.email],
			subject=subject,
			message=message,
			reference_doctype="LMS Training Assignment",
			reference_name=assignment_id
		)
		return {"success": True}
	except Exception as e:
		frappe.log_error(f"Error sending assignment notification: {e}")
		return {"success": False, "error": str(e)}


@frappe.whitelist()
def send_reminder_notifications():
	"""Send reminder notifications (3 days before due date and overdue) - Called by scheduled task"""
	reminders_sent = 0
	overdue_sent = 0
	
	# Get assignments due in 3 days
	three_days_from_now = add_days(today(), 3)
	upcoming_assignments = frappe.get_all(
		"LMS Training Assignment",
		filters={
			"status": ["in", ["Assigned", "In Progress"]],
			"due_date": three_days_from_now
		},
		fields=["name", "course", "student", "due_date"]
	)
	
	for assignment in upcoming_assignments:
		try:
			assignment_doc = frappe.get_doc("LMS Training Assignment", assignment.name)
			course = frappe.get_doc("LMS Course", assignment.course)
			student = frappe.get_doc("User", assignment.student)
			
			# Check if reminder already sent today
			existing_comm = frappe.db.exists(
				"Communication",
				{
					"reference_doctype": "LMS Training Assignment",
					"reference_name": assignment.name,
					"communication_type": "Communication",
					"sent_or_received": "Sent",
					"creation": [">=", today()],
					"subject": ["like", "%Reminder%"]
				}
			)
			
			if existing_comm:
				continue
			
			subject = f"Reminder: Training due in 3 days - {course.title}"
			message = f"""
			<p>Dear {student.full_name or student.name},</p>
			
			<p>This is a reminder that your training assignment is due in 3 days:</p>
			
			<p><strong>{course.title}</strong></p>
			<p><strong>Due Date:</strong> {format_date(assignment.due_date)}</p>
			
			<p>Please complete this training before the due date.</p>
			
			<p><a href="{frappe.utils.get_url()}/lms/courses/{course.name}">Access Training</a></p>
			
			<p>Best regards,<br>L&D Team</p>
			"""
			
			frappe.sendmail(
				recipients=[student.email],
				subject=subject,
				message=message,
				reference_doctype="LMS Training Assignment",
				reference_name=assignment.name
			)
			reminders_sent += 1
		except Exception as e:
			frappe.log_error(f"Error sending reminder for {assignment.name}: {e}")
	
	# Get overdue assignments
	overdue_assignments = frappe.get_all(
		"LMS Training Assignment",
		filters={
			"status": ["in", ["Assigned", "In Progress", "Overdue"]],
			"due_date": ["<", today()]
		},
		fields=["name", "course", "student", "due_date"]
	)
	
	for assignment in overdue_assignments:
		try:
			assignment_doc = frappe.get_doc("LMS Training Assignment", assignment.name)
			course = frappe.get_doc("LMS Course", assignment.course)
			student = frappe.get_doc("User", assignment.student)
			
			# Check if overdue notification already sent today
			existing_comm = frappe.db.exists(
				"Communication",
				{
					"reference_doctype": "LMS Training Assignment",
					"reference_name": assignment.name,
					"communication_type": "Communication",
					"sent_or_received": "Sent",
					"creation": [">=", today()],
					"subject": ["like", "%Overdue%"]
				}
			)
			
			if existing_comm:
				continue
			
			subject = f"Action Required: Training is Overdue - {course.title}"
			message = f"""
			<p>Dear {student.full_name or student.name},</p>
			
			<p>Your training assignment is now overdue:</p>
			
			<p><strong>{course.title}</strong></p>
			<p><strong>Due Date:</strong> {format_date(assignment.due_date)} (Overdue)</p>
			
			<p>Please complete this training as soon as possible.</p>
			
			<p><a href="{frappe.utils.get_url()}/lms/courses/{course.name}">Access Training</a></p>
			
			<p>Best regards,<br>L&D Team</p>
			"""
			
			frappe.sendmail(
				recipients=[student.email],
				subject=subject,
				message=message,
				reference_doctype="LMS Training Assignment",
				reference_name=assignment.name
			)
			
			# Update status to Overdue
			if assignment_doc.status != "Overdue":
				assignment_doc.status = "Overdue"
				assignment_doc.save(ignore_permissions=True)
			
			overdue_sent += 1
		except Exception as e:
			frappe.log_error(f"Error sending overdue notification for {assignment.name}: {e}")
	
	frappe.db.commit()
	return {
		"reminders_sent": reminders_sent,
		"overdue_sent": overdue_sent
	}


@frappe.whitelist()
def send_completion_notification(enrollment_id):
	"""Send notification when training is completed"""
	if not frappe.db.exists("LMS Enrollment", enrollment_id):
		return {"success": False, "error": "Enrollment not found"}
	
	enrollment = frappe.get_doc("LMS Enrollment", enrollment_id)
	course = frappe.get_doc("LMS Course", enrollment.course)
	student = frappe.get_doc("User", enrollment.student)
	
	subject = f"Congratulations: You completed {course.title}"
	
	message = f"""
	<p>Dear {student.full_name or student.name},</p>
	
	<p>Congratulations! You have successfully completed the training:</p>
	
	<p><strong>{course.title}</strong></p>
	
	<p>Completion Date: {format_date(enrollment.completed_on)}</p>
	
	<p>Keep up the great work!</p>
	
	<p><a href="{frappe.utils.get_url()}/lms/dashboard">View Dashboard</a></p>
	
	<p>Best regards,<br>L&D Team</p>
	"""
	
	try:
		frappe.sendmail(
			recipients=[student.email],
			subject=subject,
			message=message,
			reference_doctype="LMS Enrollment",
			reference_name=enrollment_id
		)
		
		# Also notify L&D team if assignment exists
		if enrollment.assignment:
			assignment = frappe.get_doc("LMS Training Assignment", enrollment.assignment)
			if assignment.assigned_by:
				assigner = frappe.get_doc("User", assignment.assigned_by)
				notification_subject = f"Training Completed: {course.title}"
				notification_message = f"""
				<p>{student.full_name or student.name} has completed the training:</p>
				<p><strong>{course.title}</strong></p>
				<p>Completion Date: {format_date(enrollment.completed_on)}</p>
				"""
				frappe.sendmail(
					recipients=[assigner.email],
					subject=notification_subject,
					message=notification_message
				)
		
		return {"success": True}
	except Exception as e:
		frappe.log_error(f"Error sending completion notification: {e}")
		return {"success": False, "error": str(e)}
