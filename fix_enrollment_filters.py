#!/usr/bin/env python3
"""Fix invalid filters on LMS Enrollment doctype"""

import frappe


def fix_invalid_filters():
	"""Remove invalid member_type filters from saved filters and workspaces"""
	frappe.connect()

	# Delete saved filters with member_type
	frappe.db.sql("""
        DELETE FROM `tabList Filter`
        WHERE reference_doctype = 'LMS Enrollment'
        AND (filter_name LIKE '%member_type%' OR filters LIKE '%member_type%')
    """)

	# Delete workspace shortcuts with invalid filters (stats_filter is JSON field)
	frappe.db.sql("""
        DELETE FROM `tabWorkspace Shortcut`
        WHERE link_to = 'LMS Enrollment'
        AND stats_filter LIKE '%member_type%'
    """)

	# Delete workspace links with invalid filters
	frappe.db.sql("""
        DELETE FROM `tabWorkspace Link`
        WHERE link_to = 'LMS Enrollment'
        AND filters LIKE '%member_type%'
    """)

	frappe.db.commit()
	print("✓ Cleaned up invalid filters with 'member_type' field")

	# Also check for any other invalid references
	invalid_refs = frappe.db.sql(
		"""
        SELECT name, reference_doctype, filter_name
        FROM `tabList Filter`
        WHERE reference_doctype = 'LMS Enrollment'
        AND filter_name LIKE '%member%'
    """,
		as_dict=True,
	)

	if invalid_refs:
		print(f"\nFound {len(invalid_refs)} more filters with 'member' in name:")
		for ref in invalid_refs:
			print(f"  - {ref.name}: {ref.filter_name}")
			frappe.db.delete("List Filter", ref.name)
		frappe.db.commit()
		print("✓ Cleaned up additional invalid filters")


if __name__ == "__main__":
	fix_invalid_filters()
	print("\n✅ Done!")
