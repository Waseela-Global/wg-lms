"""
Health Check for Contextual Learning Integration
Verifies that all components are properly installed
"""

import frappe
from frappe import _
import os


def check_contextual_learning():
	"""
	Comprehensive health check for contextual learning integration
	Returns dict with status and details
	"""
	results = {
		"status": "success",
		"checks": [],
		"errors": [],
		"warnings": []
	}
	
	# Check 1: DocType exists
	try:
		if frappe.db.exists("DocType", "Learning Context Mapping"):
			results["checks"].append("✓ Learning Context Mapping DocType exists")
		else:
			results["errors"].append("✗ Learning Context Mapping DocType not found")
			results["status"] = "error"
	except Exception as e:
		results["errors"].append(f"✗ Error checking DocType: {str(e)}")
		results["status"] = "error"
	
	# Check 2: Table exists in database
	try:
		if frappe.db.table_exists("Learning Context Mapping"):
			results["checks"].append("✓ Learning Context Mapping table exists in database")
		else:
			results["errors"].append("✗ Learning Context Mapping table not found in database")
			results["status"] = "error"
	except Exception as e:
		results["errors"].append(f"✗ Error checking database table: {str(e)}")
		results["status"] = "error"
	
	# Check 3: Count existing mappings
	try:
		count = frappe.db.count("Learning Context Mapping")
		active_count = frappe.db.count("Learning Context Mapping", {"is_active": 1})
		results["checks"].append(f"✓ Found {count} total mappings ({active_count} active)")
		
		if count == 0:
			results["warnings"].append("⚠ No mappings created yet. Run create_example_mappings() to create examples.")
	except Exception as e:
		results["errors"].append(f"✗ Error counting mappings: {str(e)}")
		results["status"] = "error"
	
	# Check 4: JS files exist
	app_path = frappe.get_app_path("wg_lms")
	js_files = [
		"public/js/learning_context_detector.js",
		"public/js/learning_resolver.js",
		"public/js/learning_ui.js",
		"public/js/learning_button_injector.js"
	]
	
	for js_file in js_files:
		file_path = os.path.join(app_path, js_file)
		if os.path.exists(file_path):
			results["checks"].append(f"✓ {js_file} exists")
		else:
			results["errors"].append(f"✗ {js_file} not found")
			results["status"] = "error"
	
	# Check 5: API methods exist
	api_methods = [
		"wg_lms.api.learning_analytics.log_learning_interaction",
		"wg_lms.api.learning_analytics.get_learning_stats",
		"wg_lms.api.setup_examples.setup_example_mappings",
		"wg_lms.api.setup_examples.clear_all_mappings"
	]
	
	for method in api_methods:
		try:
			frappe.get_attr(method)
			results["checks"].append(f"✓ API method {method} exists")
		except Exception as e:
			results["errors"].append(f"✗ API method {method} not found: {str(e)}")
			results["status"] = "error"
	
	# Check 6: Permissions
	try:
		if frappe.has_permission("Learning Context Mapping", "read"):
			results["checks"].append("✓ Current user has read permission on Learning Context Mapping")
		else:
			results["warnings"].append("⚠ Current user doesn't have read permission on Learning Context Mapping")
	except Exception as e:
		results["errors"].append(f"✗ Error checking permissions: {str(e)}")
	
	# Summary
	total_checks = len(results["checks"])
	total_errors = len(results["errors"])
	total_warnings = len(results["warnings"])
	
	results["summary"] = f"{total_checks} checks passed, {total_errors} errors, {total_warnings} warnings"
	
	return results


@frappe.whitelist()
def run_health_check():
	"""
	Whitelisted method to run health check from console or UI
	"""
	results = check_contextual_learning()
	
	# Format output
	output = [
		"",
		"═" * 60,
		"  CONTEXTUAL LEARNING INTEGRATION - HEALTH CHECK",
		"═" * 60,
		""
	]
	
	# Checks
	if results["checks"]:
		output.append("PASSED CHECKS:")
		output.append("-" * 60)
		for check in results["checks"]:
			output.append(f"  {check}")
		output.append("")
	
	# Warnings
	if results["warnings"]:
		output.append("WARNINGS:")
		output.append("-" * 60)
		for warning in results["warnings"]:
			output.append(f"  {warning}")
		output.append("")
	
	# Errors
	if results["errors"]:
		output.append("ERRORS:")
		output.append("-" * 60)
		for error in results["errors"]:
			output.append(f"  {error}")
		output.append("")
	
	# Summary
	output.append("SUMMARY:")
	output.append("-" * 60)
	output.append(f"  {results['summary']}")
	output.append(f"  Overall Status: {results['status'].upper()}")
	output.append("")
	
	if results["status"] == "success" and not results["errors"]:
		output.append("✅ All checks passed! Contextual learning is ready to use.")
	elif results["status"] == "success" and results["warnings"]:
		output.append("⚠️  Installation OK but there are warnings to review.")
	else:
		output.append("❌ Installation incomplete. Please fix the errors above.")
	
	output.append("")
	output.append("═" * 60)
	output.append("")
	
	output_str = "\n".join(output)
	print(output_str)
	
	if frappe.request:
		# Called via HTTP, return formatted message
		frappe.msgprint(
			f"<pre>{output_str}</pre>",
			title=_("Health Check Results"),
			indicator="green" if results["status"] == "success" else "red"
		)
	
	return results


def print_setup_instructions():
	"""
	Print setup instructions if health check fails
	"""
	instructions = """
	
	SETUP INSTRUCTIONS:
	═══════════════════════════════════════════════════════════
	
	1. Run migration:
	   bench --site [site-name] migrate
	
	2. Clear cache and build:
	   bench --site [site-name] clear-cache
	   bench build --app wg_lms
	
	3. Create example mappings (optional):
	   bench --site [site-name] console
	   
	   Then run:
	   from wg_lms.api.setup_examples import create_example_mappings
	   result = create_example_mappings()
	   print(f"Created {result['created']} example mappings")
	
	4. Test in browser:
	   - Navigate to any form (e.g., Employee)
	   - Look for "🎓 Learn This" button
	   - Click to open learning drawer
	
	For more details, see:
	- wg_lms/QUICK_START.md
	- wg_lms/CONTEXTUAL_LEARNING.md
	
	═══════════════════════════════════════════════════════════
	"""
	print(instructions)


if __name__ == "__main__":
	# Allow running directly
	results = check_contextual_learning()
	
	for check in results["checks"]:
		print(check)
	
	for warning in results["warnings"]:
		print(warning)
	
	for error in results["errors"]:
		print(error)
	
	print(f"\n{results['summary']}")
	print(f"Status: {results['status'].upper()}\n")
	
	if results["status"] != "success" or results["warnings"]:
		print_setup_instructions()
