"""
Patch to fix references from 'LMS' module to 'Waseela LMS' module
This fixes the error: "Module LMS not found" when saving user permissions
"""

import frappe


def execute():
	"""Fix all references from 'LMS' to 'Waseela LMS'"""
	
	# Check if 'Waseela LMS' module exists
	if not frappe.db.exists("Module Def", "Waseela LMS"):
		frappe.throw("'Waseela LMS' module does not exist! Please ensure the module is properly installed.")
	
	fixed_count = 0
	
	# Fix Block Module records (User.block_modules)
	block_modules = frappe.get_all(
		"Block Module",
		fields=["name", "parent"],
		filters={"module": "LMS"}
	)
	for bm in block_modules:
		try:
			frappe.db.set_value("Block Module", bm["name"], "module", "Waseela LMS")
			fixed_count += 1
			frappe.db.commit()
		except Exception as e:
			frappe.log_error(f"Error fixing Block Module {bm['name']}: {e}")
	
	# Fix DocTypes that reference 'LMS' module
	doctypes = frappe.get_all(
		"DocType",
		fields=["name"],
		filters={"module": "LMS"}
	)
	for dt in doctypes:
		try:
			frappe.db.set_value("DocType", dt["name"], "module", "Waseela LMS")
			fixed_count += 1
			frappe.db.commit()
		except Exception as e:
			frappe.log_error(f"Error fixing DocType {dt['name']}: {e}")
	
	# Fix Module Profiles
	module_profiles = frappe.get_all(
		"Module Profile",
		fields=["name"]
	)
	for mp_name in module_profiles:
		try:
			mp = frappe.get_doc("Module Profile", mp_name["name"])
			updated = False
			for bm in mp.block_modules:
				if bm.module == "LMS":
					bm.module = "Waseela LMS"
					updated = True
			if updated:
				mp.save(ignore_permissions=True)
				frappe.db.commit()
				fixed_count += 1
		except Exception as e:
			frappe.log_error(f"Error fixing Module Profile {mp_name['name']}: {e}")
	
	# Clear cache to ensure changes take effect
	frappe.clear_cache()
	
	frappe.msgprint(f"Fixed {fixed_count} references from 'LMS' to 'Waseela LMS' module")
	return fixed_count

