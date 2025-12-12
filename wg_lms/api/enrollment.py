import frappe
from frappe import _


@frappe.whitelist()
def enroll_in_course(course):
	"""Enroll current user in a course"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to enroll"))
	
	if not frappe.db.exists("LMS Course", course):
		frappe.throw(_("Course not found"))
	
	# Check if already enrolled
	if frappe.db.exists("LMS Enrollment", {"student": user, "course": course}):
		frappe.throw(_("Already enrolled in this course"))
	
	# Create enrollment
	enrollment = frappe.get_doc({
		"doctype": "LMS Enrollment",
		"student": user,
		"course": course,
		"enrollment_date": frappe.utils.today()
	})
	enrollment.insert(ignore_permissions=True)
	
	return enrollment.name


@frappe.whitelist()
def enroll_in_batch(batch):
	"""Enroll current user in a batch"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to enroll"))
	
	if not frappe.db.exists("LMS Batch", batch):
		frappe.throw(_("Batch not found"))
	
	batch_doc = frappe.get_doc("LMS Batch", batch)
	
	# Check if batch allows self enrollment
	if not batch_doc.allow_self_enrollment:
		frappe.throw(_("This batch does not allow self enrollment"))
	
	# Check if already enrolled
	if frappe.db.exists("LMS Batch Enrollment", {"student": user, "batch": batch}):
		frappe.throw(_("Already enrolled in this batch"))
	
	# Check seat availability
	current_enrollments = frappe.db.count("LMS Batch Enrollment", {"batch": batch, "status": "Enrolled"})
	if batch_doc.seat_count and current_enrollments >= batch_doc.seat_count:
		frappe.throw(_("Batch is full"))
	
	# Create batch enrollment
	enrollment = frappe.get_doc({
		"doctype": "LMS Batch Enrollment",
		"student": user,
		"batch": batch,
		"enrollment_date": frappe.utils.today(),
		"status": "Enrolled"
	})
	enrollment.insert(ignore_permissions=True)
	
	# Also enroll in all batch courses
	for course_ref in batch_doc.courses:
		if not frappe.db.exists("LMS Enrollment", {"student": user, "course": course_ref.course}):
			course_enrollment = frappe.get_doc({
				"doctype": "LMS Enrollment",
				"student": user,
				"course": course_ref.course,
				"enrollment_date": frappe.utils.today()
			})
			course_enrollment.insert(ignore_permissions=True)
	
	return enrollment.name


@frappe.whitelist()
def get_my_courses():
	"""Get courses enrolled by current user"""
	user = frappe.session.user
	
	if user == "Guest":
		return []
	
	enrollments = frappe.get_all(
		"LMS Enrollment",
		filters={"student": user},
		fields=["course", "enrollment_date", "progress", "is_completed", "completed_on"]
	)
	
	courses = []
	for enrollment in enrollments:
		course = frappe.get_doc("LMS Course", enrollment.course)
		courses.append({
			"name": course.name,
			"title": course.title,
			"short_introduction": course.short_introduction,
			"image": course.image,
			"progress": enrollment.progress,
			"is_completed": enrollment.is_completed,
			"enrollment_date": enrollment.enrollment_date
		})
	
	return courses


@frappe.whitelist()
def get_my_batches():
	"""Get batches enrolled by current user"""
	user = frappe.session.user
	
	if user == "Guest":
		return []
	
	enrollments = frappe.get_all(
		"LMS Batch Enrollment",
		filters={"student": user},
		fields=["batch", "enrollment_date", "status", "progress"]
	)
	
	batches = []
	for enrollment in enrollments:
		batch = frappe.get_doc("LMS Batch", enrollment.batch)
		batches.append({
			"name": batch.name,
			"title": batch.title,
			"description": batch.description,
			"start_date": batch.start_date,
			"end_date": batch.end_date,
			"status": enrollment.status,
			"progress": enrollment.progress,
			"enrollment_date": enrollment.enrollment_date
		})
	
	return batches

