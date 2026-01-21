"""Utility functions for WG LMS"""

import frappe


def before_request():
	"""
	Hook that runs before each request
	Ensures guest users can access whitelisted API methods
	"""
	# Allow guest access to specific API endpoints
	guest_allowed_endpoints = [
		"wg_lms.api.auth.check_lms_access",
		"wg_lms.api.auth.custom_web_logout",
		"wg_lms.api.courses.get_categories",
		"wg_lms.api.courses.get_courses",
		"wg_lms.api.courses.get_course_detail",
		"wg_lms.api.batches.get_batches",
		"wg_lms.api.certificates.get_public_certificates",
	]
	
	# Get the current request path
	if frappe.request and frappe.request.path:
		path = frappe.request.path
		
		# If it's an API call to a guest-allowed endpoint and user is Guest
		if "/api/method/" in path and frappe.session.user == "Guest":
			# Extract method name from path
			method = path.split("/api/method/")[-1].split("?")[0]
			
			# If method is in allowed list, ensure it can proceed
			if method in guest_allowed_endpoints:
				frappe.flags.ignore_permissions = True
