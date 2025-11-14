# Copyright (c) 2021, FOSS United and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class LMSBatchEnrollment(Document):
	def after_insert(self):
		send_confirmation_email(self)

	def validate(self):
		self.validate_duplicate_members()
		self.validate_course_enrollment()

	def validate_duplicate_members(self):
		if frappe.db.exists(
			"LMS Batch Enrollment",
			{"batch": self.batch, "member": self.member, "name": ["!=", self.name]},
		):
			frappe.throw(_("Member already enrolled in this batch"))

	def validate_course_enrollment(self):
		courses = frappe.get_all("Batch Course", filters={"parent": self.batch}, fields=["course"])

		for course in courses:
			if not frappe.db.exists(
				"LMS Enrollment",
				{"course": course.course, "member": self.member},
			):
				enrollment = frappe.new_doc("LMS Enrollment")
				enrollment.course = course.course
				enrollment.member = self.member
				enrollment.save()


@frappe.whitelist()
def send_confirmation_email(doc):
	if isinstance(doc, str):
		doc = frappe.get_doc("LMS Batch Enrollment", doc)

	batch_title = frappe.db.get_value("LMS Batch", doc.batch, "title")
	member_name = frappe.db.get_value("User", doc.member, "full_name") or doc.member

	template = "batch_enrollment_confirmation"
	args = {
		"member_name": member_name,
		"batch_title": batch_title,
		"batch_name": doc.batch,
	}

	frappe.sendmail(
		recipients=doc.member,
		subject=_("Enrollment Confirmation for {0}").format(batch_title),
		template=template,
		args=args,
		header=[_("Batch Enrollment Confirmation"), "green"],
	)

