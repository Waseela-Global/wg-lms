"""
Learning Context API
Whitelisted methods for accessing learning context mappings
"""

import frappe
from frappe import _


@frappe.whitelist()
def get_active_mappings():
	"""
	Get all active learning context mappings with roles
	This method is whitelisted so all authenticated users can access it
	"""
	try:
		# Get all active mappings
		mappings = frappe.get_all(
			"Learning Context Mapping",
			fields=[
				"name",
				"app_name",
				"doctype_name",
				"page_or_report",
				"lms_content_url",
				"description",
				"quick_tips",
				"common_mistakes",
				"priority",
				"is_active",
			],
			filters={"is_active": 1},
			limit_page_length=500,
		)

		# Get roles for each mapping
		for mapping in mappings:
			roles = frappe.get_all(
				"Learning Context User Role",
				fields=["role"],
				filters={"parent": mapping.name},
			)
			mapping["user_roles"] = [r.role for r in roles]

		return mappings
	except Exception as e:
		frappe.log_error(f"Error getting learning context mappings: {str(e)}")
		return []

@frappe.whitelist()
def get_course_brief(course_name: str):
	"""
	Get lightweight LMS Course info for quick help.
	Returns safe, non-sensitive fields.
	"""
	if not course_name:
		return {}

	try:
		course = frappe.get_value(
			"LMS Course",
			course_name,
			[
				"name",
				"title",
				"short_introduction",
				"video_link",
				"description",
				"image",
				"category",
				"module_list",
			],
			as_dict=True,
		)
		
		if course:
			# Convert image file path to full URL if it exists
			if course.get("image"):
				course["image"] = frappe.utils.get_url(course["image"])
		
		return course or {}
	except Exception as e:
		frappe.log_error(f"Error fetching course brief for {course_name}: {str(e)}")
		return {}
