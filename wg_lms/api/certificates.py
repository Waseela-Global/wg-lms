import frappe
from frappe import _
from frappe.utils import today, getdate, add_years
import uuid


@frappe.whitelist()
def generate_certificate(course_id, student=None):
	"""Generate certificate for course completion"""
	if not student:
		student = frappe.session.user
	
	if student == "Guest":
		frappe.throw(_("Please login to generate certificate"))
	
	if not frappe.db.exists("LMS Course", course_id):
		frappe.throw(_("Course not found"))
	
	course_doc = frappe.get_doc("LMS Course", course_id)
	
	# Check if course enables certificates
	if not course_doc.enable_certificate:
		frappe.throw(_("This course does not enable certificates"))
	
	# Check if student completed the course
	enrollment = frappe.db.get_value(
		"LMS Enrollment",
		{"student": student, "course": course_id},
		["is_completed", "completed_on"],
		as_dict=True
	)
	
	if not enrollment or not enrollment.is_completed:
		frappe.throw(_("Course must be completed before generating certificate"))
	
	# Check if certificate already exists
	existing_cert = frappe.db.get_value(
		"LMS Certificate",
		{"student": student, "course": course_id},
		"name"
	)
	
	if existing_cert:
		return existing_cert
	
	# Generate certificate number
	certificate_number = f"CERT-{course_id[:4].upper()}-{uuid.uuid4().hex[:8].upper()}"
	
	# Get student details
	student_doc = frappe.get_doc("User", student)
	
	# Generate certificate HTML
	certificate_html = generate_certificate_html(course_doc, student_doc, certificate_number, enrollment.completed_on)
	
	# Create certificate
	certificate = frappe.get_doc({
		"doctype": "LMS Certificate",
		"student": student,
		"course": course_id,
		"certificate_number": certificate_number,
		"issue_date": enrollment.completed_on or today(),
		"certificate_html": certificate_html
	})
	certificate.insert(ignore_permissions=True)
	frappe.db.commit()
	
	return certificate.name


def generate_certificate_html(course, student, certificate_number, completion_date):
	"""Generate HTML template for certificate"""
	html = f"""
	<div style="text-align: center; padding: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 600px; font-family: 'Georgia', serif;">
		<div style="background: white; padding: 50px; margin: 20px auto; max-width: 800px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 10px solid #667eea;">
			<div style="border: 3px solid #667eea; padding: 40px;">
				<h1 style="color: #667eea; font-size: 42px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 3px;">Certificate of Completion</h1>
				<p style="color: #666; font-size: 18px; margin-bottom: 30px;">This is to certify that</p>
				<h2 style="color: #333; font-size: 36px; margin: 30px 0; font-weight: bold; border-bottom: 2px solid #667eea; padding-bottom: 20px; display: inline-block;">
					{student.full_name or student.name}
				</h2>
				<p style="color: #666; font-size: 18px; margin: 30px 0;">has successfully completed the course</p>
				<h3 style="color: #667eea; font-size: 28px; margin: 20px 0; font-weight: bold;">{course.title}</h3>
				<p style="color: #666; font-size: 16px; margin-top: 40px;">Issued on {getdate(completion_date).strftime('%B %d, %Y')}</p>
				<p style="color: #999; font-size: 14px; margin-top: 50px;">Certificate Number: {certificate_number}</p>
			</div>
		</div>
	</div>
	"""
	return html


@frappe.whitelist()
def get_my_certificates():
	"""Get user's certificates"""
	user = frappe.session.user
	
	if user == "Guest":
		return []
	
	certificates = frappe.get_all(
		"LMS Certificate",
		filters={"student": user},
		fields=[
			"name", "course", "certificate_number", "issue_date", 
			"expiry_date", "batch"
		],
		order_by="issue_date desc"
	)
	
	# Add course details
	for cert in certificates:
		if cert.course:
			course = frappe.get_doc("LMS Course", cert.course)
			cert.update({
				"course_title": course.title,
				"course_image": course.image
			})
	
	return certificates


@frappe.whitelist(allow_guest=True)
def get_certificate(certificate_id):
	"""Get certificate details"""
	if not frappe.db.exists("LMS Certificate", certificate_id):
		frappe.throw(_("Certificate not found"))
	
	certificate_doc = frappe.get_doc("LMS Certificate", certificate_id)
	
	# Check permission
	user = frappe.session.user
	if certificate_doc.student != user and "LMS Admin" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to view this certificate"))
	
	# Get course and student details
	course = frappe.get_doc("LMS Course", certificate_doc.course) if certificate_doc.course else None
	student = frappe.get_doc("User", certificate_doc.student)
	
	return {
		"name": certificate_doc.name,
		"certificate_number": certificate_doc.certificate_number,
		"issue_date": certificate_doc.issue_date,
		"expiry_date": certificate_doc.expiry_date,
		"certificate_html": certificate_doc.certificate_html,
		"course": {
			"name": course.name if course else None,
			"title": course.title if course else None
		},
		"student": {
			"name": student.name,
			"full_name": student.full_name
		}
	}


@frappe.whitelist()
def download_certificate(certificate_id):
	"""Generate PDF certificate"""
	if not frappe.db.exists("LMS Certificate", certificate_id):
		frappe.throw(_("Certificate not found"))
	
	certificate_doc = frappe.get_doc("LMS Certificate", certificate_id)
	
	# Check permission
	user = frappe.session.user
	if certificate_doc.student != user and "LMS Admin" not in frappe.get_roles():
		frappe.throw(_("You don't have permission to download this certificate"))
	
	# Generate PDF using Frappe's PDF generation
	from frappe.utils.pdf import get_pdf
	
	html = certificate_doc.certificate_html or ""
	
	# Generate PDF
	pdf = get_pdf(html, {
		"page-size": "A4",
		"orientation": "landscape",
		"margin-top": "0mm",
		"margin-right": "0mm",
		"margin-bottom": "0mm",
		"margin-left": "0mm"
	})
	
	frappe.local.response.filename = f"certificate_{certificate_doc.certificate_number}.pdf"
	frappe.local.response.filecontent = pdf
	frappe.local.response.type = "download"
	
	return pdf


def auto_generate_certificate_on_completion(enrollment_doc):
	"""Auto-generate certificate when course is completed"""
	try:
		course = frappe.get_doc("LMS Course", enrollment_doc.course)
		
		if course.enable_certificate and enrollment_doc.is_completed:
			# Check if certificate already exists
			existing = frappe.db.get_value(
				"LMS Certificate",
				{"student": enrollment_doc.student, "course": enrollment_doc.course},
				"name"
			)
			
			if not existing:
				generate_certificate(enrollment_doc.course, enrollment_doc.student)
	except Exception as e:
		frappe.log_error(f"Error auto-generating certificate: {e}")
