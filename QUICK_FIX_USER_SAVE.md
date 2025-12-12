# Quick Fix for User Save Error

## Problem
When saving User doctype, you get:
```
ModuleNotFoundError: No module named 'wg_lms.waseela_lms.doctype.preferred_industry'
```

## Solution

Run this command to remove the problematic custom fields:

```bash
bench execute wg_lms.fix_user_child_tables.fix_all_references
```

Or run this in bench console:

```python
# Remove problematic custom fields
frappe.delete_doc("Custom Field", "User-lms_preferred_industries", force=1, ignore_permissions=True)
frappe.delete_doc("Custom Field", "User-lms_preferred_functions", force=1, ignore_permissions=True)
frappe.delete_doc("Custom Field", "User-lms_preferences_section", force=1, ignore_permissions=True)
frappe.delete_doc("Custom Field", "User-lms_column_break_2", force=1, ignore_permissions=True)
frappe.db.commit()
frappe.clear_cache()
```

After running this, you should be able to save User doctype without errors.

## Note
The Preferred Industries and Preferred Functions fields have been temporarily disabled in the install script to prevent this issue. They can be re-enabled later once the module path issues are resolved.

