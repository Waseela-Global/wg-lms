import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class LMSTrainingFeedback(Document):
	def before_save(self):
		"""Set submitted date when feedback is saved"""
		if not self.submitted_on:
			self.submitted_on = now_datetime()
	
	def on_update(self):
		"""Check if completion requirements are met after feedback submission"""
		if self.submitted_on:
			# Trigger completion check
			from wg_lms.api.completion import check_completion_status
			try:
				enrollment = frappe.get_doc("LMS Enrollment", self.enrollment)
				check_completion_status(enrollment.name)
			except Exception as e:
				frappe.log_error(f"Error checking completion after feedback: {e}")
