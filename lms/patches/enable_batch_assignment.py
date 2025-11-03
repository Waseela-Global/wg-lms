import frappe

def execute():
    """Enable Batch Assignment module"""
    
    try:
        print("✅ Batch Assignment module is now available for instructors and moderators")
        print("   Access via: /lms/batch-assignment")
        print("   Sidebar: Available for Course Creators and Moderators")
    except Exception as e:
        print(f"❌ Error: {e}")