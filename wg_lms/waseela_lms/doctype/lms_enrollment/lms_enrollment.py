import frappe
from frappe.model.document import Document
from frappe.utils import today, getdate


class LMSEnrollment(Document):
	def validate(self):
		"""Update overdue status"""
		if self.due_date and not self.is_completed:
			self.is_overdue = getdate(self.due_date) < today()
		else:
			self.is_overdue = 0
	
	def on_update(self):
		"""Auto-generate certificate when course is completed"""
		if self.is_completed and self.has_value_changed("is_completed"):
			try:
				from wg_lms.api.certificates import auto_generate_certificate_on_completion
				auto_generate_certificate_on_completion(self)
			except Exception as e:
				frappe.log_error(f"Error generating certificate: {e}")
		
		# Update assignment status if linked
		if self.assignment:
			try:
				assignment = frappe.get_doc("LMS Training Assignment", self.assignment)
				assignment.update_status()
			except Exception as e:
				frappe.log_error(f"Error updating assignment status: {e}")
