"""
Learning Analytics API
Optional analytics for tracking learning interactions
"""

import frappe
from frappe import _


@frappe.whitelist()
def log_learning_interaction(mapping_name, context, action):
	"""
	Log a learning interaction (optional analytics)
	
	Args:
		mapping_name: Name of the Learning Context Mapping
		context: Dict containing app, module, doctype, etc.
		action: Action performed (e.g., 'open', 'close', 'fullscreen')
	"""
	try:
		# Only log if user is logged in
		if frappe.session.user == "Guest":
			return
		
		# Create a simple log entry (you can expand this to a dedicated DocType later)
		frappe.logger().info(f"Learning interaction: {action} - {mapping_name} by {frappe.session.user}")
		
		# Optional: Store in database for analytics
		# You can create a "Learning Analytics Log" DocType later if needed
		# For now, just use the error log which is searchable
		
	except Exception as e:
		# Silent fail - analytics shouldn't break functionality
		frappe.logger().error(f"Error logging learning interaction: {str(e)}")


@frappe.whitelist()
def get_learning_stats():
	"""
	Get learning statistics (optional feature for admin dashboard)
	"""
	if not frappe.has_permission("Learning Context Mapping", "read"):
		frappe.throw(_("Permission denied"))
	
	try:
		# Get total mappings
		total_mappings = frappe.db.count("Learning Context Mapping", {"is_active": 1})
		
		# Get mappings by content type
		content_types = frappe.db.get_all(
			"Learning Context Mapping",
			filters={"is_active": 1},
			fields=["content_type", "count(name) as count"],
			group_by="content_type"
		)
		
		# Get recent mappings
		recent_mappings = frappe.db.get_all(
			"Learning Context Mapping",
			filters={"is_active": 1},
			fields=["name", "app", "module", "doctype", "content_type", "content_title", "modified"],
			order_by="modified desc",
			limit=10
		)
		
		return {
			"total_mappings": total_mappings,
			"content_types": content_types,
			"recent_mappings": recent_mappings
		}
		
	except Exception as e:
		frappe.log_error(f"Error getting learning stats: {str(e)}")
		return {
			"total_mappings": 0,
			"content_types": [],
			"recent_mappings": []
		}
