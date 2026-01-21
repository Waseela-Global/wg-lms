"""
Patch: rename existing LMS Course records to the new naming rule COURSE-####
"""

import frappe
from frappe.model.naming import make_autoname


def execute():
	# Only act on courses that are not already in the new series
	courses = frappe.get_all("LMS Course", fields=["name"])

	for idx, course in enumerate(courses, start=1):
		old_name = course.name

		# Skip if already follows the pattern
		if str(old_name).startswith("COURSE-"):
			continue

		# Generate next name using the series
		new_name = make_autoname("COURSE-.####")

		try:
			frappe.rename_doc("LMS Course", old_name, new_name, force=True, ignore_permissions=True)
			frappe.db.commit()
		except Exception as e:
			# Log and continue; we don't want the whole patch to fail on one record
			frappe.log_error(
				message=frappe.get_traceback(),
				title=f"Rename LMS Course failed: {old_name} -> {new_name}"
			)

