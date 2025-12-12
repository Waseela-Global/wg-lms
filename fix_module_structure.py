#!/usr/bin/env python3
"""Fix the module directory structure for wg_lms"""

import os
import shutil

# Base paths
app_path = "/Users/saadalikhan/Saad/Office/frappe-bench/apps/wg_lms/wg_lms"
old_doctype_path = os.path.join(app_path, "doctype")
new_module_path = os.path.join(app_path, "waseela_lms")
new_doctype_path = os.path.join(new_module_path, "doctype")

print(f"Creating module directory: {new_module_path}")

# Create the waseela_lms module directory
if not os.path.exists(new_module_path):
    os.makedirs(new_module_path)
    print("✓ Created waseela_lms directory")
else:
    print("✓ waseela_lms directory already exists")

# Create __init__.py in the module directory
init_file = os.path.join(new_module_path, "__init__.py")
if not os.path.exists(init_file):
    with open(init_file, "w") as f:
        f.write("")
    print("✓ Created __init__.py")
else:
    print("✓ __init__.py already exists")

# Move doctypes directory
if os.path.exists(old_doctype_path):
    if os.path.exists(new_doctype_path):
        print(f"⚠ {new_doctype_path} already exists, removing old doctype directory")
        shutil.rmtree(old_doctype_path)
    else:
        print(f"Moving {old_doctype_path} to {new_doctype_path}")
        shutil.move(old_doctype_path, new_doctype_path)
        print("✓ Moved doctype directory")
else:
    print("✓ doctype directory already in correct location")

print("\n✅ Module structure fixed!")
print(f"\nStructure:")
print(f"  {app_path}/")
print(f"    waseela_lms/")
print(f"      __init__.py")
print(f"      doctype/")
print(f"        lms_course/")
print(f"        ...")

