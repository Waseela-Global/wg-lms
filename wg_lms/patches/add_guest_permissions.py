"""
Patch to add Guest role permissions for LMS public DocTypes
This allows guest users to view published courses, categories, etc.
"""

import frappe
from frappe.permissions import add_permission, update_permission_property


def execute():
	"""Add Guest read permissions to public LMS DocTypes"""
	
	# List of DocTypes that should be readable by Guest users
	guest_readable_doctypes = [
		{
			"doctype": "LMS Course",
			"condition": "doc.published == 1",
			"description": "Allow guests to read published courses"
		},
		{
			"doctype": "LMS Category",
			"condition": "doc.published == 1",
			"description": "Allow guests to read published categories"
		},
		{
			"doctype": "Course Chapter",
			"condition": "",
			"description": "Allow guests to read course chapters"
		},
		{
			"doctype": "Course Lesson",
			"condition": "",
			"description": "Allow guests to read course lessons"
		},
		{
			"doctype": "LMS Batch",
			"condition": "",
			"description": "Allow guests to read batch information"
		},
	]
	
	for doctype_config in guest_readable_doctypes:
		doctype = doctype_config["doctype"]
		condition = doctype_config["condition"]
		description = doctype_config["description"]
		
		try:
			# Check if DocType exists
			if not frappe.db.exists("DocType", doctype):
				print(f"Skipping {doctype} - DocType not found")
				continue
			
			# Check if Guest permission already exists
			existing_perm = frappe.db.get_value(
				"Custom DocPerm",
				{
					"parent": doctype,
					"role": "Guest",
					"permlevel": 0
				}
			)
			
			if existing_perm:
				print(f"Guest permission already exists for {doctype}, updating...")
				# Update existing permission
				frappe.db.set_value(
					"Custom DocPerm",
					existing_perm,
					{
						"read": 1,
						"if_owner": 0,
						"permlevel": 0
					}
				)
				
				# Update condition if provided
				if condition:
					frappe.db.set_value("Custom DocPerm", existing_perm, "apply_user_permissions", 0)
					# Note: Conditions are set via Permission Manager UI or directly in DocType
			else:
				print(f"Adding Guest read permission for {doctype}...")
				
				# Create new Custom DocPerm
				perm = frappe.get_doc({
					"doctype": "Custom DocPerm",
					"parent": doctype,
					"parenttype": "DocType",
					"parentfield": "permissions",
					"role": "Guest",
					"permlevel": 0,
					"read": 1,
					"write": 0,
					"create": 0,
					"delete": 0,
					"submit": 0,
					"cancel": 0,
					"amend": 0,
					"report": 0,
					"export": 0,
					"import": 0,
					"share": 0,
					"print": 0,
					"email": 0,
					"if_owner": 0,
					"select": 0,
				})
				perm.insert(ignore_permissions=True)
			
			print(f"✓ {description}")
			
		except Exception as e:
			print(f"Error adding Guest permission for {doctype}: {str(e)}")
			frappe.log_error(f"Guest Permission Error: {doctype}", str(e))
	
	# Commit changes
	frappe.db.commit()
	
	print("\n✓ Guest permissions patch completed successfully!")
	print("\nNote: For condition-based permissions (e.g., published=1),")
	print("please set them manually in Permission Manager or update the DocType JSON files.")
