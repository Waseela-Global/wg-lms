"""
Authentication helpers for LMS integration with Frappe/ERPNext
"""

import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def check_lms_access():
	"""Check if current user has access to LMS"""
	user = frappe.session.user
	
	if user == "Guest":
		return {
			"has_access": False,
			"is_authenticated": False,
			"user": None,
		}
	
	# Check if user has LMS enabled or has LMS role
	has_access = has_app_permission(user)
	
	user_doc = frappe.get_cached_doc("User", user)
	
	return {
		"has_access": has_access,
		"is_authenticated": True,
		"user": {
			"name": user,
			"full_name": user_doc.full_name,
			"email": user_doc.email,
			"user_image": user_doc.user_image,
			"roles": frappe.get_roles(user),
		},
		"lms_enabled": user_doc.get("lms_enabled", 0),
	}


@frappe.whitelist()
def get_user_lms_profile(user=None):
	"""Get LMS-specific profile data for current user or specified user"""
	if not user:
		user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to access your profile"))
	
	user_doc = frappe.get_cached_doc("User", user)
	user_roles = frappe.get_roles(user)
	
	return {
		"name": user,
		"full_name": user_doc.full_name,
		"email": user_doc.email,
		"user_image": user_doc.user_image,
		"lms_enabled": user_doc.get("lms_enabled", 0),
		"lms_bio": user_doc.get("lms_bio", ""),
		"lms_linkedin_url": user_doc.get("lms_linkedin_url", ""),
		"lms_github_url": user_doc.get("lms_github_url", ""),
		"lms_website": user_doc.get("lms_website", ""),
		"lms_phone": user_doc.get("lms_phone", ""),
		"lms_education": user_doc.get("lms_education", ""),
		"lms_work_experience": user_doc.get("lms_work_experience", ""),
		"roles": user_roles,
		"is_instructor": "Instructor" in user_roles,
		"is_student": "Student" in user_roles or "LMS Student" in user_roles,
		"is_admin": "LMS Admin" in user_roles or user == "Administrator",
		"is_course_creator": "Course Creator" in user_roles,
		"is_batch_coordinator": "Batch Coordinator" in user_roles,
	}


def has_app_permission(user=None):
	"""Check if user has permission to access LMS app"""
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

