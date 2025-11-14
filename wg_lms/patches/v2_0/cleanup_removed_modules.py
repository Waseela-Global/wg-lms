"""Clean up data from removed modules (SCORM, Payments, Zoom/Live Classes).

This patch removes:
- SCORM-related data from Course Chapter
- Payment records
- Live class records and zoom settings
- Orphaned child table records
- Custom fields related to removed modules
"""

import frappe


def execute():
	print("Cleaning up removed modules data...")

	# Remove SCORM fields from Course Chapter
	scorm_fields = [
		"is_scorm_package",
		"scorm_package",
		"scorm_package_path",
		"manifest_file",
		"launch_file",
	]

	for field in scorm_fields:
		if frappe.db.has_column("Course Chapter", field):
			frappe.db.sql(f"ALTER TABLE `tabCourse Chapter` DROP COLUMN `{field}`")
			print(f"  Removed SCORM field: {field}")

	# Remove SCORM fields from LMS Course Progress
	scorm_progress_fields = ["is_scorm_chapter", "scorm_content"]

	for field in scorm_progress_fields:
		if frappe.db.has_column("LMS Course Progress", field):
			frappe.db.sql(f"ALTER TABLE `tabLMS Course Progress` DROP COLUMN `{field}`")
			print(f"  Removed SCORM field from progress: {field}")

	# Delete payment records
	if frappe.db.exists("DocType", "LMS Payment"):
		payments = frappe.get_all("LMS Payment", pluck="name")
		if payments:
			for payment in payments:
				frappe.delete_doc("LMS Payment", payment, force=1, ignore_permissions=True)
			print(f"  Deleted {len(payments)} payment records")

	# Delete live class records
	if frappe.db.exists("DocType", "LMS Live Class"):
		live_classes = frappe.get_all("LMS Live Class", pluck="name")
		if live_classes:
			for live_class in live_classes:
				frappe.delete_doc("LMS Live Class", live_class, force=1, ignore_permissions=True)
			print(f"  Deleted {len(live_classes)} live class records")

	# Delete live class participant records
	if frappe.db.exists("DocType", "LMS Live Class Participant"):
		participants = frappe.get_all("LMS Live Class Participant", pluck="name")
		if participants:
			for participant in participants:
				frappe.delete_doc("LMS Live Class Participant", participant, force=1, ignore_permissions=True)
			print(f"  Deleted {len(participants)} live class participant records")

	# Delete zoom settings
	for doctype in ["LMS Zoom Settings", "Zoom Settings"]:
		if frappe.db.exists("DocType", doctype):
			settings = frappe.get_all(doctype, pluck="name")
			if settings:
				for setting in settings:
					frappe.delete_doc(doctype, setting, force=1, ignore_permissions=True)
				print(f"  Deleted {len(settings)} {doctype} records")

	# Remove payment fields from LMS Course
	payment_fields = [
		"paid_course",
		"course_price",
		"currency",
		"amount_usd",
		"paid_certificate",
	]

	for field in payment_fields:
		if frappe.db.has_column("LMS Course", field):
			frappe.db.sql(f"ALTER TABLE `tabLMS Course` DROP COLUMN `{field}`")
			print(f"  Removed payment field from course: {field}")

	# Remove payment-related custom fields
	payment_custom_fields = frappe.get_all(
		"Custom Field",
		filters={
			"fieldname": ["in", payment_fields + scorm_fields],
			"dt": ["in", ["LMS Course", "Course Chapter", "LMS Course Progress"]],
		},
		pluck="name",
	)

	if payment_custom_fields:
		for cf in payment_custom_fields:
			frappe.delete_doc("Custom Field", cf, force=1, ignore_permissions=True)
		print(f"  Deleted {len(payment_custom_fields)} custom fields")

	# Clean up orphaned child table records
	child_tables_to_clean = [
		"Course Instructor",
		"Course Evaluator",
		"Course Lesson",
		"Batch Course",
		"LMS Quiz Question",
		"LMS Option",
		"Related Courses",
		"Chapter Reference",
		"Lesson Reference",
	]

	for table in child_tables_to_clean:
		if frappe.db.exists("DocType", table):
			# Count orphaned records (where parent doesn't exist)
			orphaned = frappe.db.sql(
				f"""
				SELECT COUNT(*) 
				FROM `tab{table}` 
				WHERE parenttype IS NOT NULL 
				AND parent NOT IN (
					SELECT name FROM `tab{{parenttype}}`
				)
			""",
				as_list=True,
			)
			if orphaned and orphaned[0][0] > 0:
				print(f"  Found {orphaned[0][0]} orphaned records in {table}")

	frappe.db.commit()
	print("Cleanup completed!")

