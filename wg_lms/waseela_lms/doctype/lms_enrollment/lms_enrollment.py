import frappe
from frappe.model.document import Document


class LMSEnrollment(Document):
	def on_update(self):
		"""Auto-generate certificate when course is completed"""
		if self.is_completed and self.has_value_changed("is_completed"):
			try:
				from wg_lms.api.certificates import auto_generate_certificate_on_completion
				auto_generate_certificate_on_completion(self)
			except Exception as e:
				frappe.log_error(f"Error generating certificate: {e}")
