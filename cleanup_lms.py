#!/usr/bin/env python3
"""Cleanup script to remove LMS custom fields before reinstalling"""

import frappe


def cleanup_lms_custom_fields():
	"""Remove all LMS-related custom fields from User doctype"""
	frappe.connect()

	lms_fieldnames = [
		"User-lms_section",
		"User-lms_enabled",
		"User-lms_bio",
		"User-lms_column_break_1",
		"User-lms_linkedin_url",
		"User-lms_github_url",
		"User-lms_website",
		"User-lms_phone",
		"User-lms_education_section",
		"User-lms_education",
		"User-lms_work_section",
		"User-lms_work_experience",
		"User-lms_preferences_section",
		"User-lms_preferred_industries",
		"User-lms_column_break_2",
		"User-lms_preferred_functions",
	]

	for fieldname in lms_fieldnames:
		try:
			if frappe.db.exists("Custom Field", fieldname):
				frappe.delete_doc("Custom Field", fieldname, force=True, ignore_permissions=True)
				print(f"Deleted: {fieldname}")
		except Exception as e:
			print(f"Error deleting {fieldname}: {str(e)}")

	frappe.db.commit()
	print("\nCleanup completed!")


if __name__ == "__main__":
	cleanup_lms_custom_fields()
