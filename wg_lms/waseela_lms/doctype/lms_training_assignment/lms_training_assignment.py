import frappe
from frappe.model.document import Document
from frappe.utils import today, getdate, add_months


class LMSTrainingAssignment(Document):
	def validate(self):
		"""Validate assignment data"""
		if self.due_date and self.assigned_date:
			if getdate(self.due_date) < getdate(self.assigned_date):
				frappe.throw("Due date cannot be before assigned date")
		
		# Set next renewal date if auto renewal is enabled
		if self.auto_renewal_period and self.auto_renewal_period > 0:
			if self.status == "Completed":
				self.next_renewal_date = add_months(today(), self.auto_renewal_period)
			else:
				self.next_renewal_date = add_months(getdate(self.due_date), self.auto_renewal_period)
		else:
			self.next_renewal_date = None
	
	def on_update(self):
		"""Update enrollment when assignment is created/updated"""
		# Create or update enrollment
		enrollment = frappe.db.get_value(
			"LMS Enrollment",
			{"student": self.student, "course": self.course},
			"name"
		)
		
		if not enrollment:
			# Create enrollment
			enrollment_doc = frappe.get_doc({
				"doctype": "LMS Enrollment",
				"student": self.student,
				"course": self.course,
				"enrollment_date": self.assigned_date or today(),
				"due_date": self.due_date,
				"assignment_type": self.assignment_type,
				"assignment": self.name
			})
			enrollment_doc.insert(ignore_permissions=True)
		else:
			# Update enrollment
			enrollment_doc = frappe.get_doc("LMS Enrollment", enrollment)
			enrollment_doc.due_date = self.due_date
			enrollment_doc.assignment_type = self.assignment_type
			enrollment_doc.assignment = self.name
			enrollment_doc.save(ignore_permissions=True)
		
		# Update assignment status based on enrollment
		self.update_status()
	
	def update_status(self):
		"""Update assignment status based on enrollment progress"""
		enrollment = frappe.db.get_value(
			"LMS Enrollment",
			{"student": self.student, "course": self.course},
			["is_completed", "progress"],
			as_dict=True
		)
		
		if not enrollment:
			self.status = "Assigned"
		elif enrollment.is_completed:
			self.status = "Completed"
		elif enrollment.progress > 0:
			self.status = "In Progress"
		else:
			# Check if overdue
			if self.due_date and getdate(self.due_date) < today():
				self.status = "Overdue"
			else:
				self.status = "Assigned"
		
		self.save(ignore_permissions=True)
