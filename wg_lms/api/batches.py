import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def get_batches(search=None, limit_start=0, limit_page_length=20):
	"""Get list of published batches"""
	filters = {"published": 1}
	
	or_filters = None
	if search:
		or_filters = {
			"title": ["like", f"%{search}%"],
			"description": ["like", f"%{search}%"]
		}
	
	batches = frappe.get_all(
		"LMS Batch",
		filters=filters,
		or_filters=or_filters,
		fields=[
			"name", "title", "description", "start_date", "end_date",
			"start_time", "end_time", "medium", "seat_count", "timezone"
		],
		order_by="creation desc",
		limit_start=limit_start,
		limit_page_length=limit_page_length
	)
	
	return batches


@frappe.whitelist(allow_guest=True)
def get_batch_detail(batch):
	"""Get detailed batch information"""
	if not frappe.db.exists("LMS Batch", batch):
		frappe.throw(_("Batch not found"))
	
	batch_doc = frappe.get_doc("LMS Batch", batch)
	
	if not batch_doc.published and frappe.session.user == "Guest":
		frappe.throw(_("Batch not published"))
	
	# Get courses
	courses = []
	for course_ref in batch_doc.courses:
		course = frappe.get_doc("LMS Course", course_ref.course)
		courses.append({
			"name": course.name,
			"title": course.title,
			"short_introduction": course.short_introduction,
			"image": course.image
		})
	
	return {
		"name": batch_doc.name,
		"title": batch_doc.title,
		"description": batch_doc.description,
		"start_date": batch_doc.start_date,
		"end_date": batch_doc.end_date,
		"start_time": batch_doc.start_time,
		"end_time": batch_doc.end_time,
		"timezone": batch_doc.timezone,
		"medium": batch_doc.medium,
		"seat_count": batch_doc.seat_count,
		"published": batch_doc.published,
		"allow_self_enrollment": batch_doc.allow_self_enrollment,
		"courses": courses
	}


@frappe.whitelist()
def create_batch(data):
	"""Create a new batch (Admin/Batch Coordinator only)"""
	if not has_batch_creation_permission():
		frappe.throw(_("You don't have permission to create batches"))
	
	# Handle JSON string or dict
	if isinstance(data, str):
		import json
		data = json.loads(data)
	
	# Convert data dict to proper format
	batch_data = {
		"doctype": "LMS Batch",
		"title": data.get("title"),
		"description": data.get("description"),
		"start_date": data.get("start_date"),
		"end_date": data.get("end_date"),
		"start_time": data.get("start_time"),
		"end_time": data.get("end_time"),
		"timezone": data.get("timezone", "Asia/Karachi"),
		"medium": data.get("medium", "Online"),
		"seat_count": data.get("seat_count", 0),
		"published": data.get("published", 0),
		"allow_self_enrollment": data.get("allow_self_enrollment", 0),
	}
	
	batch = frappe.get_doc(batch_data)
	
	# Add courses if provided (before insert to avoid double save)
	if data.get("courses"):
		for course_name in data.get("courses", []):
			batch.append("courses", {"course": course_name})
	
	# Insert batch - Frappe handles transactions automatically
	batch.insert(ignore_permissions=True)
	frappe.db.commit()
	
	return batch.name


@frappe.whitelist()
def update_batch(batch, data):
	"""Update batch (Admin/Batch Coordinator only)"""
	if not has_batch_edit_permission(batch):
		frappe.throw(_("You don't have permission to edit this batch"))
	
	batch_doc = frappe.get_doc("LMS Batch", batch)
	
	# Update fields
	update_fields = [
		"title", "description", "start_date", "end_date",
		"start_time", "end_time", "timezone", "medium",
		"seat_count", "published", "allow_self_enrollment"
	]
	
	for field in update_fields:
		if field in data:
			batch_doc.set(field, data[field])
	
	batch_doc.save()
	
	return batch_doc.name


def has_batch_creation_permission():
	"""Check if user can create batches"""
	roles = frappe.get_roles()
	return any(role in ["LMS Admin", "Batch Coordinator"] for role in roles)


def has_batch_edit_permission(batch):
	"""Check if user can edit a batch"""
	roles = frappe.get_roles()
	if "LMS Admin" in roles:
		return True
	
	# Batch Coordinators can edit batches they created
	batch_doc = frappe.get_doc("LMS Batch", batch)
	if batch_doc.owner == frappe.session.user:
		return True
	
	return False

