"""
Setup Example Learning Context Mappings
Run this to create example mappings for demonstration
"""

import frappe
from frappe import _


def create_example_mappings():
	"""
	Create example learning context mappings
	This can be run manually or as part of setup
	"""
examples = [
	{
		"app_name": "Waseela HR",
		"doctype_name": "Employee",
		"lms_content_url": "Employee Management Basics",
		"priority": 50,
		"is_active": 1,
		"user_roles": []
	},
	{
		"app_name": "Waseela HR",
		"doctype_name": "Performance Dialogue",
		"lms_content_url": "Performance Management",
		"priority": 50,
		"is_active": 1,
		"user_roles": []
	},
	{
		"app_name": "Waseela HR",
		"doctype_name": "Performance Dialogue",
		"lms_content_url": "Performance Management Advanced",
		"priority": 80,
		"is_active": 1,
		"user_roles": ["HR Manager"]
	},
	{
		"app_name": "Accounts",
		"doctype_name": "Sales Invoice",
		"lms_content_url": "Sales Invoice Basics",
		"priority": 50,
		"is_active": 1,
		"user_roles": []
	},
	{
		"app_name": "Stock",
		"doctype_name": "Stock Entry",
		"lms_content_url": "Stock Management",
		"priority": 50,
		"is_active": 1,
		"user_roles": []
	},
	{
		"app_name": "Waseela LMS",
		"doctype_name": "LMS Course",
		"lms_content_url": "Course Creation",
		"priority": 50,
		"is_active": 1,
		"user_roles": []
	},
	{
		"app_name": "Waseela Core",
		"lms_content_url": "Waseela OS Getting Started",
		"priority": 10,
		"is_active": 1,
		"user_roles": []
	},
	{
		"app_name": "Desk",
		"page_or_report": "Workspace",
		"lms_content_url": "Workspace Basics",
		"priority": 20,
		"is_active": 1,
		"user_roles": []
	}
]
	
	created_count = 0
	skipped_count = 0
	
	for example in examples:
		try:
			# Check if similar mapping already exists
			filters = {
				"app_name": example.get("app_name"),
			}
			
			if example.get("doctype_name"):
				filters["doctype_name"] = example["doctype_name"]
			
			if example.get("page_or_report"):
				filters["page_or_report"] = example["page_or_report"]
			
			existing = frappe.db.exists("Learning Context Mapping", filters)
			
			if existing:
				skipped_count += 1
				continue
			
			# Extract user_roles from example
			user_roles = example.pop("user_roles", [])
			
			# Create new mapping
			doc = frappe.get_doc({
				"doctype": "Learning Context Mapping",
				**example
			})
			
			# Add child table entries for roles
			for role in user_roles:
				doc.append("user_role", {
					"role": role
				})
			
			doc.insert(ignore_permissions=True)
			created_count += 1
			
		except Exception as e:
			frappe.log_error(f"Error creating example mapping: {str(e)}")
			print(f"Error creating example: {str(e)}")
	
	frappe.db.commit()
	
	return {
		"created": created_count,
		"skipped": skipped_count,
		"total": len(examples)
	}


@frappe.whitelist()
def setup_example_mappings():
	"""
	Whitelisted method to create example mappings
	Requires System Manager permissions
	"""
	if "System Manager" not in frappe.get_roles():
		frappe.throw(_("Only System Managers can create example mappings"))
	
	result = create_example_mappings()
	
	frappe.msgprint(
		_(f"Created {result['created']} example mappings. Skipped {result['skipped']} existing mappings."),
		title=_("Example Mappings Setup Complete"),
		indicator="green"
	)
	
	return result


@frappe.whitelist()
def clear_all_mappings():
	"""
	Clear all learning context mappings (for testing/reset)
	Requires System Manager permissions
	"""
	if "System Manager" not in frappe.get_roles():
		frappe.throw(_("Only System Managers can clear mappings"))
	
	mappings = frappe.get_all("Learning Context Mapping", pluck="name")
	
	for mapping in mappings:
		frappe.delete_doc("Learning Context Mapping", mapping, force=True)
	
	frappe.db.commit()
	
	frappe.msgprint(
		_(f"Cleared {len(mappings)} learning context mappings."),
		title=_("Mappings Cleared"),
		indicator="orange"
	)
	
	return {"cleared": len(mappings)}
