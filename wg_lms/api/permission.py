import frappe


def has_app_permission(user=None):
	"""
	Check if user has permission to access LMS app
	This is used by Frappe's Apps screen to show/hide the LMS app
	"""
	if not user:
		user = frappe.session.user
	
	if user == "Administrator":
		return True
	
	# Check if user has LMS enabled
	user_doc = frappe.get_cached_doc("User", user)
	if user_doc.get("lms_enabled"):
		return True
	
	# Check if user has any LMS role
	lms_roles = ["LMS Admin", "Course Creator", "Instructor", "Student", "Batch Coordinator"]
	user_roles = frappe.get_roles(user)
	
	return any(role in lms_roles for role in user_roles)

