#!/usr/bin/env python3
"""
Console script to create dummy data for Waseela LMS
Run this from bench root: python3 apps/wg_lms/run_dummy_data.py
Or: cd apps/wg_lms && python3 run_dummy_data.py
"""

import sys
import os

# Get bench root (two levels up from this file)
script_dir = os.path.dirname(os.path.abspath(__file__))
bench_root = os.path.dirname(os.path.dirname(script_dir))
sys.path.insert(0, bench_root)

# Set site from environment or use default
site = os.environ.get('FRAPPE_SITE', 'localhost')

def main():
	"""Main function"""
	try:
		import frappe
		
		# Initialize Frappe
		print(f"Initializing Frappe for site: {site}")
		frappe.init(site=site)
		frappe.connect()
		
		# First, fix any module issues
		print("\n🔧 Checking module references...")
		try:
			# Try to fix module references
			custom_fields = frappe.get_all(
				"Custom Field",
				filters={"module": "LMS"},
				fields=["name"]
			)
			if custom_fields:
				for cf in custom_fields:
					frappe.db.set_value("Custom Field", cf.name, "module", "Waseela LMS")
				print("✓ Fixed Custom Fields")
			
			doctypes = frappe.get_all(
				"DocType",
				filters={"module": "LMS"},
				fields=["name"]
			)
			if doctypes:
				for dt in doctypes:
					frappe.db.set_value("DocType", dt.name, "module", "Waseela LMS")
				print("✓ Fixed DocTypes")
			
			if frappe.db.exists("Module Def", "LMS"):
				frappe.delete_doc("Module Def", "LMS", force=1)
				print("✓ Deleted 'LMS' module definition")
			
			frappe.db.commit()
			frappe.clear_cache()
		except Exception as e:
			print(f"⚠️  Module fix warning: {e}")
			print("Continuing anyway...")
		
		# Now create dummy data
		print("\n🚀 Creating dummy data for Waseela LMS...")
		from wg_lms.utils.dummy_data import create_dummy_data
		create_dummy_data()
		
		print("\n✅ Dummy data created successfully!")
		
	except ImportError as e:
		print(f"❌ Import Error: {e}")
		print("\nMake sure you're running this from the bench root directory")
		print("Or set PYTHONPATH to include the bench root")
		sys.exit(1)
	except Exception as e:
		print(f"\n❌ Error: {e}")
		import traceback
		traceback.print_exc()
		sys.exit(1)
	finally:
		try:
			if 'frappe' in sys.modules and frappe.db:
				frappe.db.close()
		except:
			pass

if __name__ == "__main__":
	main()

