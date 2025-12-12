#!/usr/bin/env python3
"""
Fix User doctype child table module references
Run: bench execute wg_lms.fix_user_child_tables.fix_module_references
"""

import frappe


def fix_module_references():
    """Fix module references for child table DocTypes"""
    frappe.clear_cache()
    
    print("🔧 Fixing child table module references...")
    
    # Fix LMS Preferred Industry
    if frappe.db.exists("DocType", "LMS Preferred Industry"):
        dt = frappe.get_doc("DocType", "LMS Preferred Industry")
        if dt.module != "Waseela LMS":
            dt.module = "Waseela LMS"
            dt.save(ignore_permissions=True)
            print("✓ Fixed LMS Preferred Industry module")
    
    # Fix LMS Preferred Function
    if frappe.db.exists("DocType", "LMS Preferred Function"):
        dt = frappe.get_doc("DocType", "LMS Preferred Function")
        if dt.module != "Waseela LMS":
            dt.module = "Waseela LMS"
            dt.save(ignore_permissions=True)
            print("✓ Fixed LMS Preferred Function module")
    
    # Check for any "Preferred Industry" without LMS prefix
    if frappe.db.exists("DocType", "Preferred Industry"):
        print("⚠️  Found 'Preferred Industry' DocType (without LMS prefix)")
        # Try to delete it if it's orphaned
        try:
            frappe.delete_doc("DocType", "Preferred Industry", force=1, ignore_permissions=True)
            print("✓ Deleted orphaned 'Preferred Industry' DocType")
        except Exception as e:
            print(f"⚠️  Could not delete 'Preferred Industry': {e}")
    
    # Check for any "Preferred Function" without LMS prefix
    if frappe.db.exists("DocType", "Preferred Function"):
        print("⚠️  Found 'Preferred Function' DocType (without LMS prefix)")
        try:
            frappe.delete_doc("DocType", "Preferred Function", force=1, ignore_permissions=True)
            print("✓ Deleted orphaned 'Preferred Function' DocType")
        except Exception as e:
            print(f"⚠️  Could not delete 'Preferred Function': {e}")
    
    # Fix Custom Fields module references
    custom_fields = frappe.get_all(
        "Custom Field",
        filters={
            "parent": "User",
            "fieldname": ["in", ["lms_preferred_industries", "lms_preferred_functions"]]
        },
        fields=["name", "fieldname", "module"]
    )
    
    for cf in custom_fields:
        if cf.module != "Waseela LMS":
            frappe.db.set_value("Custom Field", cf.name, "module", "Waseela LMS")
            print(f"✓ Fixed Custom Field {cf.fieldname} module")
    
    frappe.db.commit()
    frappe.clear_cache()
    
    print("\n✅ Module references fixed!")


@frappe.whitelist()
def fix_modules():
    """Whitelisted version"""
    fix_module_references()

