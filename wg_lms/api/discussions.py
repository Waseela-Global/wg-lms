import frappe
from frappe import _
from frappe.utils import now_datetime


@frappe.whitelist(allow_guest=True)
def get_discussions(course_id=None, lesson_id=None, limit_start=0, limit_page_length=20):
	"""Get discussions for course/lesson"""
	filters = {}
	
	if course_id:
		filters["course"] = course_id
	if lesson_id:
		filters["lesson"] = lesson_id
	
	discussions = frappe.get_all(
		"LMS Discussion",
		filters=filters,
		fields=[
			"name", "title", "content", "owner", "course", "lesson",
			"is_pinned", "is_locked", "view_count", "reply_count", "creation"
		],
		order_by="is_pinned desc, creation desc",
		limit_start=limit_start,
		limit_page_length=limit_page_length
	)
	
	# Add owner details
	for discussion in discussions:
		owner_doc = frappe.get_doc("User", discussion.owner)
		discussion.update({
			"owner_name": owner_doc.full_name,
			"owner_image": owner_doc.user_image
		})
	
	return discussions


@frappe.whitelist()
def create_discussion(course_id=None, lesson_id=None, title=None, content=None):
	"""Create new discussion"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to create a discussion"))
	
	if not title or not content:
		frappe.throw(_("Title and content are required"))
	
	# Validate course/lesson access if provided
	if lesson_id:
		lesson = frappe.get_doc("Course Lesson", lesson_id)
		if not lesson.include_in_preview:
			if not frappe.db.exists("LMS Enrollment", {"student": user, "course": lesson.course}):
				frappe.throw(_("Please enroll in the course to create discussions"))
			course_id = lesson.course
	
	if course_id:
		if not frappe.db.exists("LMS Enrollment", {"student": user, "course": course_id}):
			frappe.throw(_("Please enroll in the course to create discussions"))
	
	# Create discussion
	discussion = frappe.get_doc({
		"doctype": "LMS Discussion",
		"title": title,
		"content": content,
		"owner": user,
		"course": course_id,
		"lesson": lesson_id
	})
	discussion.insert(ignore_permissions=True)
	frappe.db.commit()
	
	return discussion.name


@frappe.whitelist(allow_guest=True)
def get_discussion(discussion_id):
	"""Get discussion with replies"""
	if not frappe.db.exists("LMS Discussion", discussion_id):
		frappe.throw(_("Discussion not found"))
	
	discussion_doc = frappe.get_doc("LMS Discussion", discussion_id)
	
	# Increment view count
	discussion_doc.view_count = (discussion_doc.view_count or 0) + 1
	discussion_doc.save(ignore_permissions=True)
	
	# Get owner details
	owner_doc = frappe.get_doc("User", discussion_doc.owner)
	
	# Get replies
	replies = frappe.get_all(
		"LMS Discussion Reply",
		filters={"discussion": discussion_id},
		fields=["name", "reply", "owner", "is_solution", "creation"],
		order_by="is_solution desc, creation asc"
	)
	
	# Add owner details to replies
	for reply in replies:
		reply_owner = frappe.get_doc("User", reply.owner)
		reply.update({
			"owner_name": reply_owner.full_name,
			"owner_image": reply_owner.user_image
		})
	
	return {
		"name": discussion_doc.name,
		"title": discussion_doc.title,
		"content": discussion_doc.content,
		"owner": discussion_doc.owner,
		"owner_name": owner_doc.full_name,
		"owner_image": owner_doc.user_image,
		"course": discussion_doc.course,
		"lesson": discussion_doc.lesson,
		"is_pinned": discussion_doc.is_pinned,
		"is_locked": discussion_doc.is_locked,
		"view_count": discussion_doc.view_count,
		"reply_count": discussion_doc.reply_count,
		"creation": discussion_doc.creation,
		"replies": replies
	}


@frappe.whitelist()
def add_reply(discussion_id, content):
	"""Add reply to discussion"""
	user = frappe.session.user
	
	if user == "Guest":
		frappe.throw(_("Please login to reply"))
	
	if not content:
		frappe.throw(_("Reply content is required"))
	
	if not frappe.db.exists("LMS Discussion", discussion_id):
		frappe.throw(_("Discussion not found"))
	
	discussion_doc = frappe.get_doc("LMS Discussion", discussion_id)
	
	if discussion_doc.is_locked and "LMS Admin" not in frappe.get_roles() and "Instructor" not in frappe.get_roles():
		frappe.throw(_("This discussion is locked"))
	
	# Create reply
	reply = frappe.get_doc({
		"doctype": "LMS Discussion Reply",
		"discussion": discussion_id,
		"reply": content,
		"owner": user
	})
	reply.insert(ignore_permissions=True)
	
	# Update reply count
	discussion_doc.reply_count = (discussion_doc.reply_count or 0) + 1
	discussion_doc.save(ignore_permissions=True)
	frappe.db.commit()
	
	return reply.name


@frappe.whitelist()
def mark_reply_as_solution(reply_id):
	"""Mark a reply as solution (discussion owner or instructor/admin)"""
	user = frappe.session.user
	
	if not frappe.db.exists("LMS Discussion Reply", reply_id):
		frappe.throw(_("Reply not found"))
	
	reply_doc = frappe.get_doc("LMS Discussion Reply", reply_id)
	discussion_doc = frappe.get_doc("LMS Discussion", reply_doc.discussion)
	
	# Check permission
	can_mark = False
	if discussion_doc.owner == user:
		can_mark = True
	if "LMS Admin" in frappe.get_roles() or "Instructor" in frappe.get_roles():
		can_mark = True
	
	if not can_mark:
		frappe.throw(_("You don't have permission to mark this as solution"))
	
	# Unmark other solutions
	frappe.db.sql("""
		UPDATE `tabLMS Discussion Reply`
		SET is_solution = 0
		WHERE discussion = %s AND name != %s
	""", (reply_doc.discussion, reply_id))
	
	# Mark this as solution
	reply_doc.is_solution = 1
	reply_doc.save(ignore_permissions=True)
	frappe.db.commit()
	
	return {"success": True}


@frappe.whitelist()
def pin_discussion(discussion_id):
	"""Pin/unpin discussion (admin/instructor only)"""
	user = frappe.session.user
	
	if "LMS Admin" not in frappe.get_roles() and "Instructor" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to pin discussions"))
	
	if not frappe.db.exists("LMS Discussion", discussion_id):
		frappe.throw(_("Discussion not found"))
	
	discussion_doc = frappe.get_doc("LMS Discussion", discussion_id)
	discussion_doc.is_pinned = not discussion_doc.is_pinned
	discussion_doc.save(ignore_permissions=True)
	frappe.db.commit()
	
	return {"success": True, "is_pinned": discussion_doc.is_pinned}


@frappe.whitelist()
def lock_discussion(discussion_id):
	"""Lock/unlock discussion (admin/instructor only)"""
	user = frappe.session.user
	
	if "LMS Admin" not in frappe.get_roles() and "Instructor" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to lock discussions"))
	
	if not frappe.db.exists("LMS Discussion", discussion_id):
		frappe.throw(_("Discussion not found"))
	
	discussion_doc = frappe.get_doc("LMS Discussion", discussion_id)
	discussion_doc.is_locked = not discussion_doc.is_locked
	discussion_doc.save(ignore_permissions=True)
	frappe.db.commit()
	
	return {"success": True, "is_locked": discussion_doc.is_locked}
