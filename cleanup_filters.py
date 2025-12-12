#!/usr/bin/env python3
"""Cleanup script to remove invalid member_type filters"""

import frappe

def cleanup_invalid_filters():
    """Remove invalid member_type filters from saved filters and workspaces"""
    frappe.connect()
    
    # Delete saved filters with member_type (correct column name: reference_doctype)
    deleted_filters = frappe.db.sql("""
        DELETE FROM `tabList Filter`
        WHERE reference_doctype = 'LMS Enrollment'
        AND (filter_name LIKE '%member_type%' OR filters LIKE '%member_type%')
    """)
    
    print(f"✓ Deleted invalid List Filters")
    
    # Delete workspace shortcuts with invalid filters
    deleted_shortcuts = frappe.db.sql("""
        DELETE FROM `tabWorkspace Shortcut`
        WHERE link_to = 'LMS Enrollment'
        AND filters LIKE '%member_type%'
    """)
    
    print(f"✓ Deleted invalid Workspace Shortcuts")
    
    # Delete workspace links with invalid filters
    deleted_links = frappe.db.sql("""
        DELETE FROM `tabWorkspace Link`
        WHERE link_to = 'LMS Enrollment'
        AND filters LIKE '%member_type%'
    """)
    
    print(f"✓ Deleted invalid Workspace Links")
    
    frappe.db.commit()
    print("\n✅ Cleanup complete!")

if __name__ == "__main__":
    cleanup_invalid_filters()

