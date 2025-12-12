"""
Fix module references from "LMS" to "Waseela LMS"
Run: bench execute wg_lms.fix_module_references.fix_all_modules
"""

import frappe


def fix_all_modules():
	"""Fix all module references"""
	frappe.clear_cache()
	
	print("🔧 Fixing module references...")
	
	# Fix Custom Fields
	custom_fields = frappe.get_all(
		"Custom Field",
		filters={"module": "LMS"},
		fields=["name", "module"]
	)
	
	if custom_fields:
		print(f"Found {len(custom_fields)} Custom Fields with module 'LMS'")
		for cf in custom_fields:
			frappe.db.set_value("Custom Field", cf.name, "module", "Waseela LMS")
		print("✓ Fixed Custom Fields")
	
	# Fix DocTypes
	doctypes = frappe.get_all(
		"DocType",
		filters={"module": "LMS"},
		fields=["name", "module"]
	)
	
	if doctypes:
		print(f"Found {len(doctypes)} DocTypes with module 'LMS'")
		for dt in doctypes:
			frappe.db.set_value("DocType", dt.name, "module", "Waseela LMS")
		print("✓ Fixed DocTypes")
	
	# Delete any "LMS" module definition if it exists
	if frappe.db.exists("Module Def", "LMS"):
		frappe.delete_doc("Module Def", "LMS", force=1)
		print("✓ Deleted 'LMS' module definition")
	
	frappe.db.commit()
	frappe.clear_cache()
	
	print("\n✅ Module references fixed!")


@frappe.whitelist()
def fix_modules():
	"""Whitelisted version"""
	fix_all_modules()

