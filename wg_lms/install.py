import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields


def after_install():
	"""Execute after app installation"""
	create_lms_roles()
	create_user_custom_fields()
	frappe.db.commit()


def create_lms_roles():
	"""Create LMS-specific roles"""
	roles = ["LMS Admin", "Course Creator", "Instructor", "Student", "Batch Coordinator"]

	for role in roles:
		if not frappe.db.exists("Role", role):
			frappe.get_doc({"doctype": "Role", "role_name": role, "desk_access": 1}).insert(
				ignore_permissions=True
			)
			print(f"Created role: {role}")


def create_user_custom_fields():
	"""Create custom fields on User doctype for LMS"""
	# First clean up any existing LMS custom fields to avoid duplicates
	cleanup_existing_fields()
	
	custom_fields = {
		"User": [
			{
				"fieldname": "lms_section",
				"label": "LMS Details",
				"fieldtype": "Section Break",
				"insert_after": "bio",
				"collapsible": 1,
			},
			{
				"fieldname": "lms_enabled",
				"label": "Enable LMS Access",
				"fieldtype": "Check",
				"insert_after": "lms_section",
				"default": "0",
			},
			{
				"fieldname": "lms_bio",
				"label": "LMS Biography",
				"fieldtype": "Text",
				"insert_after": "lms_enabled",
			},
			{"fieldname": "lms_column_break_1", "fieldtype": "Column Break", "insert_after": "lms_bio"},
			{
				"fieldname": "lms_linkedin_url",
				"label": "LinkedIn Profile",
				"fieldtype": "Data",
				"insert_after": "lms_column_break_1",
			},
			{
				"fieldname": "lms_github_url",
				"label": "GitHub Profile",
				"fieldtype": "Data",
				"insert_after": "lms_linkedin_url",
			},
			{
				"fieldname": "lms_website",
				"label": "Personal Website",
				"fieldtype": "Data",
				"insert_after": "lms_github_url",
			},
			{
				"fieldname": "lms_phone",
				"label": "LMS Contact Number",
				"fieldtype": "Data",
				"insert_after": "lms_website",
			},
			{
				"fieldname": "lms_education_section",
				"label": "Education",
				"fieldtype": "Section Break",
				"insert_after": "lms_phone",
				"collapsible": 1,
			},
			{
				"fieldname": "lms_education",
				"label": "Education Details",
				"fieldtype": "Table",
				"options": "LMS Education Detail",
				"insert_after": "lms_education_section",
			},
			{
				"fieldname": "lms_work_section",
				"label": "Work Experience",
				"fieldtype": "Section Break",
				"insert_after": "lms_education",
				"collapsible": 1,
			},
			{
				"fieldname": "lms_work_experience",
				"label": "Work Experience",
				"fieldtype": "Table",
				"options": "LMS Work Experience",
				"insert_after": "lms_work_section",
			},
			# Note: Preferred Industries/Functions fields are commented out
			# as they cause module import errors. Uncomment after fixing module references.
			# {
			# 	"fieldname": "lms_preferences_section",
			# 	"label": "Career Preferences",
			# 	"fieldtype": "Section Break",
			# 	"insert_after": "lms_work_experience",
			# 	"collapsible": 1,
			# },
			# {
			# 	"fieldname": "lms_preferred_industries",
			# 	"label": "Preferred Industries",
			# 	"fieldtype": "Table",
			# 	"options": "LMS Preferred Industry",
			# 	"insert_after": "lms_preferences_section",
			# 	"module": "Waseela LMS",
			# },
			# {
			# 	"fieldname": "lms_column_break_2",
			# 	"fieldtype": "Column Break",
			# 	"insert_after": "lms_preferred_industries",
			# },
			# {
			# 	"fieldname": "lms_preferred_functions",
			# 	"label": "Preferred Functions",
			# 	"fieldtype": "Table",
			# 	"options": "LMS Preferred Function",
			# 	"insert_after": "lms_column_break_2",
			# 	"module": "Waseela LMS",
			# },
		]
	}

	create_custom_fields(custom_fields, update=True)
	print("Created LMS custom fields on User doctype")


def cleanup_existing_fields():
	"""Remove existing LMS custom fields to avoid duplicates"""
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
		# "User-lms_preferences_section",
		# "User-lms_preferred_industries",
		# "User-lms_column_break_2",
		# "User-lms_preferred_functions",
	]
	
	for fieldname in lms_fieldnames:
		try:
			if frappe.db.exists("Custom Field", fieldname):
				frappe.delete_doc("Custom Field", fieldname, force=True, ignore_permissions=True)
		except Exception:
			pass
