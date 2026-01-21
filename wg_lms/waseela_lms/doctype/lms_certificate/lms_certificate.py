import frappe
from frappe.model.document import Document
from frappe.utils import today, getdate, add_months


class LMSCertificate(Document):
	def validate(self):
		"""Calculate expiry date and renewal required"""
		if self.validity_period and self.validity_period > 0:
			if not self.expiry_date and self.issue_date:
				self.expiry_date = add_months(getdate(self.issue_date), self.validity_period)
			
			# Check if renewal is required
			if self.expiry_date:
				self.renewal_required = getdate(self.expiry_date) < getdate(today())
		else:
			self.expiry_date = None
			self.renewal_required = 0
