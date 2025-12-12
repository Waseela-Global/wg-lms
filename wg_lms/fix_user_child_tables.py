"""
Fix User doctype child table module references
Run: bench execute wg_lms.fix_user_child_tables.fix_all_references
"""

import frappe


def fix_all_references():
    """Fix all module references for child table DocTypes"""
    frappe.clear_cache()
    
    print("🔧 Fixing User doctype child table references...")
    
    # Step 1: Temporarily remove problematic custom fields to allow User saves
    problematic_fields = [
        "User-lms_preferred_industries",
        "User-lms_preferred_functions",
    ]
    
    print("\n📝 Step 1: Temporarily removing problematic custom fields...")
    for fieldname in problematic_fields:
        if frappe.db.exists("Custom Field", fieldname):
            try:
                frappe.delete_doc("Custom Field", fieldname, force=1, ignore_permissions=True)
                print(f"✓ Removed {fieldname}")
            except Exception as e:
                print(f"⚠️  Could not remove {fieldname}: {e}")
    
    # Step 2: Fix child table DocType modules
    print("\n📝 Step 2: Fixing child table DocType modules...")
    child_tables = [
        "LMS Preferred Industry",
        "LMS Preferred Function",
        "LMS Education Detail",
        "LMS Work Experience",
    ]
    
    for doctype_name in child_tables:
        if frappe.db.exists("DocType", doctype_name):
            dt = frappe.get_doc("DocType", doctype_name)
            if dt.module != "Waseela LMS":
                dt.module = "Waseela LMS"
                dt.save(ignore_permissions=True)
                print(f"✓ Fixed {doctype_name} module to 'Waseela LMS'")
        else:
            print(f"⚠️  DocType {doctype_name} does not exist")
    
    # Step 3: Check for and remove orphaned DocTypes
    print("\n📝 Step 3: Checking for orphaned DocTypes...")
    orphaned_doctypes = ["Preferred Industry", "Preferred Function"]
    for doctype_name in orphaned_doctypes:
        if frappe.db.exists("DocType", doctype_name):
            print(f"⚠️  Found orphaned DocType: {doctype_name}")
            try:
                # Check if it's being used
                usage = frappe.db.sql("""
                    SELECT COUNT(*) as count
                    FROM `tabCustom Field`
                    WHERE options = %s
                """, doctype_name, as_dict=True)
                
                if usage and usage[0].count == 0:
                    frappe.delete_doc("DocType", doctype_name, force=1, ignore_permissions=True)
                    print(f"✓ Deleted orphaned DocType: {doctype_name}")
                else:
                    print(f"⚠️  Cannot delete {doctype_name} - still in use")
            except Exception as e:
                print(f"⚠️  Could not delete {doctype_name}: {e}")
    
    # Also remove related section/column break fields
    related_fields = [
        "User-lms_preferences_section",
        "User-lms_column_break_2",
    ]
    
    for fieldname in related_fields:
        if frappe.db.exists("Custom Field", fieldname):
            try:
                frappe.delete_doc("Custom Field", fieldname, force=1, ignore_permissions=True)
                print(f"✓ Removed {fieldname}")
            except Exception as e:
                print(f"⚠️  Could not remove {fieldname}: {e}")
    
    frappe.db.commit()
    frappe.clear_cache()
    
    print("\n✅ User doctype child table references fixed!")
    print("\n💡 You can now save User doctype without errors.")
    print("   The Preferred Industries/Functions fields have been removed.")
    print("   They are commented out in install.py to prevent this issue in the future.")


@frappe.whitelist()
def fix_references():
    """Whitelisted version"""
    fix_all_references()
