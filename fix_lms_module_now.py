"""
Quick fix script to resolve "Module LMS not found" error
Run this with: bench --site [site-name] execute fix_lms_module_now.execute
Or: bench --site [site-name] console, then: exec(open('apps/wg_lms/fix_lms_module_now.py').read())
"""

import frappe


def execute():
	"""Fix all references from 'LMS' to 'Waseela LMS'"""
	
	frappe.connect()
	
	# Check if 'Waseela LMS' module exists
	if not frappe.db.exists("Module Def", "Waseela LMS"):
		print("ERROR: 'Waseela LMS' module does not exist!")
		print("Please ensure the module is properly installed.")
		return
	
	print("Found 'Waseela LMS' module. Proceeding with fixes...\n")
	
	fixed_count = 0
	
	# Fix Block Module records (User.block_modules)
	block_modules = frappe.get_all(
		"Block Module",
		fields=["name", "parent"],
		filters={"module": "LMS"}
	)
	if block_modules:
		print(f"Found {len(block_modules)} Block Module records to fix...")
		for bm in block_modules:
			try:
				frappe.db.set_value("Block Module", bm["name"], "module", "Waseela LMS")
				fixed_count += 1
				print(f"  ✓ Fixed Block Module: {bm['name']} (User: {bm['parent']})")
			except Exception as e:
				print(f"  ✗ Error fixing Block Module {bm['name']}: {e}")
	
	# Fix DocTypes that reference 'LMS' module
	doctypes = frappe.get_all(
		"DocType",
		fields=["name"],
		filters={"module": "LMS"}
	)
	if doctypes:
		print(f"\nFound {len(doctypes)} DocTypes to fix...")
		for dt in doctypes:
			try:
				frappe.db.set_value("DocType", dt["name"], "module", "Waseela LMS")
				fixed_count += 1
				print(f"  ✓ Fixed DocType: {dt['name']}")
			except Exception as e:
				print(f"  ✗ Error fixing DocType {dt['name']}: {e}")
	
	# Fix Module Profiles
	module_profiles = frappe.get_all(
		"Module Profile",
		fields=["name"]
	)
	mp_fixed = 0
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
				mp_fixed += 1
				fixed_count += 1
				print(f"  ✓ Fixed Module Profile: {mp.name}")
		except Exception as e:
			print(f"  ✗ Error fixing Module Profile {mp_name['name']}: {e}")
	
	if mp_fixed:
		print(f"\nFixed {mp_fixed} Module Profile(s)")
	
	# Commit all changes
	frappe.db.commit()
	
	# Clear cache to ensure changes take effect
	frappe.clear_cache()
	
	print(f"\n{'='*50}")
	print(f"Successfully fixed {fixed_count} references from 'LMS' to 'Waseela LMS'")
	print(f"{'='*50}")
	
	return fixed_count

