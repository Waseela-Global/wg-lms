#!/usr/bin/env python3
"""
Console script to create dummy data for Waseela LMS
Run this directly: python3 create_dummy_data_console.py
"""

import sys
import os

# Add bench to path
bench_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, bench_path)

import frappe

def init_frappe():
	"""Initialize Frappe"""
	site = os.environ.get('FRAPPE_SITE', 'localhost')
	frappe.init(site=site)
	frappe.connect()

def main():
	"""Main function"""
	try:
		init_frappe()
		print("🚀 Creating dummy data for Waseela LMS...")
		
		# Import and run the dummy data creation
		from wg_lms.utils.dummy_data import create_dummy_data
		create_dummy_data()
		
		print("\n✅ Dummy data created successfully!")
		
	except Exception as e:
		print(f"\n❌ Error: {e}")
		import traceback
		traceback.print_exc()
		sys.exit(1)
	finally:
		if frappe.db:
			frappe.db.close()

if __name__ == "__main__":
	main()

