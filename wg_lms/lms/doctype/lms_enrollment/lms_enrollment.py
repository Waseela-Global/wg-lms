# Copyright (c) 2021, FOSS United and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class LMSEnrollment(Document):
	pass


@frappe.whitelist()
def create_membership(batch=None, course=None, member=None, member_type="Student"):
	"""Create LMS Enrollment record"""
	if not member:
		member = frappe.session.user

	if not course and batch:
		course = frappe.db.get_value("LMS Batch", batch, "course")

	if not course:
		frappe.throw("Course is required to create membership")

	# Check if enrollment already exists
	filters = {"member": member, "course": course}
	if batch:
		filters["batch"] = batch

	if frappe.db.exists("LMS Enrollment", filters):
		return frappe.db.get_value("LMS Enrollment", filters, "name")

	# Create new enrollment
	enrollment = frappe.new_doc("LMS Enrollment")
	enrollment.member = member
	enrollment.course = course
	if batch:
		enrollment.batch = batch
	if member_type:
		enrollment.member_type = member_type
	enrollment.save(ignore_permissions=True)
	return enrollment.name


def update_program_progress(member=None):
	"""Update progress for all programs the member is enrolled in"""
	if not member:
		member = frappe.session.user

	# Check if DocType exists
	if not frappe.db.exists("DocType", "LMS Program Member"):
		return

	# Get all programs the member is enrolled in
	programs = frappe.get_all(
		"LMS Program Member",
		{"member": member},
		pluck="parent"
	)

	for program in programs:
		# Calculate program progress based on course progress
		courses = frappe.get_all(
			"LMS Program Course",
			{"parent": program},
			pluck="course",
			order_by="idx"
		)

		if not courses:
			continue

		total_progress = 0
		for course in courses:
			enrollment = frappe.db.get_value(
				"LMS Enrollment",
				{"member": member, "course": course},
				"progress",
				as_dict=True
			)
			if enrollment:
				total_progress += enrollment.progress or 0

		program_progress = total_progress / len(courses) if courses else 0

		# Update program member progress
		frappe.db.set_value(
			"LMS Program Member",
			{"parent": program, "member": member},
			"progress",
			program_progress
		)

