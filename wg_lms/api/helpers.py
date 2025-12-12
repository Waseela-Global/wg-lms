import frappe
from frappe import _


@frappe.whitelist()
def get_roles():
	"""Get list of roles for assignment filters"""
	roles = frappe.get_all(
		"Role",
		filters={"name": ["not in", ["Guest", "All", "System Manager"]]},
		fields=["name"],
		order_by="name"
	)
	return [r.name for r in roles]


@frappe.whitelist()
def get_departments():
	"""Get list of departments for assignment filters"""
	if not frappe.db.exists("DocType", "Department"):
		return []
	
	departments = frappe.get_all(
		"Department",
		fields=["name"],
		order_by="name"
	)
	return [d.name for d in departments]


@frappe.whitelist()
def get_users_for_assignment():
	"""Get list of users for assignment (limited to 1000)"""
	users = frappe.get_all(
		"User",
		filters={"enabled": 1, "name": ["not in", ["Guest", "Administrator"]]},
		fields=["name", "full_name"],
		limit_page_length=1000,
		order_by="full_name"
	)
	return users
