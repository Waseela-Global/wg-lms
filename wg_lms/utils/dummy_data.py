"""
Create dummy data for Waseela LMS
Run with: bench --site [site-name] execute wg_lms.utils.dummy_data.create_dummy_data
Or in console: from wg_lms.utils.dummy_data import create_dummy_data; create_dummy_data()
"""

import frappe
from frappe.utils import add_days, getdate, today, now_datetime
from random import randint, choice, sample
import json


def create_dummy_data():
	"""Create comprehensive dummy data for LMS"""
	frappe.clear_cache()
	
	print("🚀 Creating dummy data for Waseela LMS...")
	
	# Clear existing dummy data first to avoid duplicates
	print("   🗑️  Clearing existing dummy data...")
	clear_existing_dummy_data()
	
	# Get existing users
	existing_users = get_existing_users()
	print(f"   Found {len(existing_users)} existing users")
	
	# Create categories
	categories = create_categories()
	
	# Create instructors (use existing or create new)
	instructors = create_instructors()
	if existing_users:
		# Add some existing users as instructors
		instructor_candidates = [u for u in existing_users if "Instructor" not in frappe.get_roles(u)]
		if instructor_candidates:
			for user in instructor_candidates[:3]:
				try:
					user_doc = frappe.get_doc("User", user)
					user_doc.add_roles("Instructor")
					instructors.append(user)
				except:
					pass
	
	# Create courses with chapters and lessons
	courses = create_courses(categories, instructors)
	
	# Create batches
	batches = create_batches(courses)
	
	# Create students (use existing or create new)
	students = create_students()
	if existing_users:
		# Add existing users as students
		student_candidates = [u for u in existing_users if "Student" not in frappe.get_roles(u) and u not in instructors]
		for user in student_candidates[:10]:
			try:
				user_doc = frappe.get_doc("User", user)
				user_doc.add_roles("Student")
				students.append(user)
			except:
				pass
	
	create_enrollments(students, courses, batches)
	
	# Create lesson progress
	create_lesson_progress(students, courses)
	
	# Create quizzes
	quizzes_created = create_quiz_data(courses)
	print(f"   - Created {quizzes_created} quizzes")
	
	# Create assignments
	assignments_created = create_assignment_data(courses)
	print(f"   - Created {assignments_created} assignments")
	
	# Create discussions
	discussions_created = create_discussion_data(courses, students + instructors)
	print(f"   - Created {discussions_created} discussions")
	
	# Generate certificates for completed courses
	certificates_created = create_certificate_data(students, courses)
	print(f"   - Generated {certificates_created} certificates")
	
	# Update course statistics
	update_course_statistics()
	
	frappe.db.commit()
	print("✅ Dummy data created successfully!")
	print(f"   - {len(categories)} Categories")
	print(f"   - {len(instructors)} Instructors")
	print(f"   - {len(courses)} Courses")
	print(f"   - {len(batches)} Batches")
	print(f"   - {len(students)} Students")
	print(f"   - Created enrollments, progress, quizzes, assignments, discussions, and certificates")


def create_categories():
	"""Create course categories"""
	categories = [
		"Web Development",
		"Mobile Development",
		"Data Science",
		"Cloud Computing",
		"Digital Marketing",
		"Business Management",
		"Agriculture Technology",
		"Financial Literacy",
		"Entrepreneurship",
		"Language Learning",
	]
	
	created = []
	for cat_name in categories:
		if not frappe.db.exists("LMS Category", cat_name):
			category = frappe.get_doc({
				"doctype": "LMS Category",
				"title": cat_name,  # Use 'title' field, not 'category_name'
				"description": f"Learn {cat_name.lower()} skills and advance your career",
				"published": 1,
			})
			category.insert(ignore_permissions=True)
			created.append(category.name)
		else:
			created.append(cat_name)
	
	return created


def create_instructors():
	"""Create instructor users"""
	instructors_data = [
		{"first_name": "Ahmed", "last_name": "Khan", "email": "ahmed.khan@waseela.com", "bio": "Senior Full-Stack Developer with 10+ years experience"},
		{"first_name": "Fatima", "last_name": "Ali", "email": "fatima.ali@waseela.com", "bio": "Data Scientist and Machine Learning Expert"},
		{"first_name": "Hassan", "last_name": "Raza", "email": "hassan.raza@waseela.com", "bio": "Cloud Architect and DevOps Specialist"},
		{"first_name": "Ayesha", "last_name": "Malik", "email": "ayesha.malik@waseela.com", "bio": "Digital Marketing Strategist"},
		{"first_name": "Usman", "last_name": "Sheikh", "email": "usman.sheikh@waseela.com", "bio": "Business Consultant and Entrepreneur"},
		{"first_name": "Sana", "last_name": "Ahmed", "email": "sana.ahmed@waseela.com", "bio": "Mobile App Developer and UI/UX Designer"},
	]
	
	created = []
	for inst_data in instructors_data:
		email = inst_data["email"]
		if not frappe.db.exists("User", email):
			# Create user using SQL to avoid child table defaults
			try:
				# Insert user directly via SQL to bypass child table defaults
				frappe.db.sql("""
					INSERT INTO `tabUser` 
					(name, email, first_name, last_name, user_type, enabled, send_welcome_email, creation, modified, owner, modified_by)
					VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s, %s)
				""", (
					email, email, inst_data["first_name"], inst_data["last_name"], 
					"Website User", 1, 0, frappe.session.user, frappe.session.user
				))
				frappe.db.commit()
				
				# Get the user doc for role assignment
				user = frappe.get_doc("User", email)
			except Exception as e:
				print(f"Warning: Could not create user {email} via SQL: {e}")
				# Try using frappe.new_doc with skip_defaults
				try:
					user = frappe.new_doc("User")
					user.email = email
					user.first_name = inst_data["first_name"]
					user.last_name = inst_data["last_name"]
					user.user_type = "Website User"
					user.enabled = 1
					user.send_welcome_email = 0
					# Skip child table defaults
					user.flags.skip_defaults = True
					user.flags.ignore_validate = True
					user.flags.ignore_mandatory = True
					user.insert(ignore_permissions=True, ignore_links=True, ignore_validate=True)
				except Exception as e2:
					print(f"Error creating user {email}: {e2}")
					continue
			
			# Add instructor role
			try:
				user.add_roles("Instructor")
			except:
				pass
			
			# Update bio if field exists
			try:
				if frappe.db.exists("Custom Field", "User-lms_bio"):
					user.db_set("lms_bio", inst_data["bio"], update_modified=False)
			except:
				pass
		else:
			user = frappe.get_doc("User", email)
			if "Instructor" not in frappe.get_roles(email):
				try:
					user.add_roles("Instructor")
				except:
					pass
		
		created.append(email)
	
	return created


def create_courses(categories, instructors):
	"""Create courses with chapters and lessons"""
	courses_data = [
		{
			"title": "Complete Web Development Bootcamp",
			"short_introduction": "Master HTML, CSS, JavaScript, React, and Node.js to become a full-stack developer",
			"description": "This comprehensive course covers everything you need to know to become a professional web developer. From frontend to backend, you'll learn modern technologies and build real-world projects.",
			"category": "Web Development",
			"featured": 1,
			"tags": "web development, javascript, react, nodejs, fullstack",
			"chapters": [
				{
					"title": "Introduction to Web Development",
					"description": "Get started with web development fundamentals",
					"lessons": [
						{"title": "What is Web Development?", "content_type": "Article", "duration": 15},
						{"title": "Setting Up Your Development Environment", "content_type": "Article", "duration": 20},
						{"title": "Your First HTML Page", "content_type": "Article", "duration": 25},
					]
				},
				{
					"title": "HTML & CSS Fundamentals",
					"description": "Learn the building blocks of web pages",
					"lessons": [
						{"title": "HTML Structure and Semantics", "content_type": "Article", "duration": 30},
						{"title": "CSS Basics and Styling", "content_type": "Article", "duration": 35},
						{"title": "Responsive Design with CSS", "content_type": "Video", "duration": 40},
					]
				},
				{
					"title": "JavaScript Essentials",
					"description": "Master JavaScript programming",
					"lessons": [
						{"title": "JavaScript Variables and Data Types", "content_type": "Article", "duration": 30},
						{"title": "Functions and Control Flow", "content_type": "Video", "duration": 35},
						{"title": "DOM Manipulation", "content_type": "Video", "duration": 40},
					]
				},
			]
		},
		{
			"title": "Data Science with Python",
			"short_introduction": "Learn data analysis, visualization, and machine learning with Python",
			"description": "Dive into the world of data science using Python. Learn pandas, numpy, matplotlib, and scikit-learn to analyze data and build machine learning models.",
			"category": "Data Science",
			"featured": 1,
			"tags": "python, data science, machine learning, pandas, numpy",
			"chapters": [
				{
					"title": "Python Basics for Data Science",
					"description": "Python fundamentals for data analysis",
					"lessons": [
						{"title": "Introduction to Python", "content_type": "Article", "duration": 20},
						{"title": "Working with Data Structures", "content_type": "Video", "duration": 30},
						{"title": "NumPy Arrays", "content_type": "Video", "duration": 35},
					]
				},
				{
					"title": "Data Analysis with Pandas",
					"description": "Analyze and manipulate data using pandas",
					"lessons": [
						{"title": "Introduction to Pandas", "content_type": "Article", "duration": 25},
						{"title": "Data Cleaning and Preprocessing", "content_type": "Video", "duration": 40},
						{"title": "Data Aggregation and Grouping", "content_type": "Video", "duration": 35},
					]
				},
			]
		},
		{
			"title": "Cloud Computing Fundamentals",
			"short_introduction": "Master AWS, Azure, and Google Cloud platforms",
			"description": "Learn cloud computing concepts and get hands-on experience with major cloud platforms. Deploy applications and manage infrastructure in the cloud.",
			"category": "Cloud Computing",
			"featured": 1,
			"tags": "cloud computing, aws, azure, devops",
			"chapters": [
				{
					"title": "Introduction to Cloud Computing",
					"description": "Understanding cloud concepts and services",
					"lessons": [
						{"title": "What is Cloud Computing?", "content_type": "Article", "duration": 20},
						{"title": "Cloud Service Models", "content_type": "Video", "duration": 25},
					]
				},
			]
		},
		{
			"title": "Mobile App Development with React Native",
			"short_introduction": "Build cross-platform mobile apps with React Native",
			"description": "Create beautiful mobile applications for iOS and Android using React Native. Learn navigation, state management, and native module integration.",
			"category": "Mobile Development",
			"featured": 0,
			"tags": "react native, mobile development, ios, android",
			"chapters": [
				{
					"title": "React Native Basics",
					"description": "Get started with React Native",
					"lessons": [
						{"title": "Setting Up React Native", "content_type": "Article", "duration": 30},
						{"title": "Components and Styling", "content_type": "Video", "duration": 35},
					]
				},
			]
		},
		{
			"title": "Digital Marketing Mastery",
			"short_introduction": "Learn SEO, social media marketing, and content strategy",
			"description": "Master digital marketing strategies to grow your business online. Learn SEO, social media marketing, email campaigns, and analytics.",
			"category": "Digital Marketing",
			"featured": 0,
			"tags": "digital marketing, seo, social media, content marketing",
			"chapters": [
				{
					"title": "Marketing Fundamentals",
					"description": "Core marketing concepts",
					"lessons": [
						{"title": "Introduction to Digital Marketing", "content_type": "Article", "duration": 20},
						{"title": "SEO Basics", "content_type": "Video", "duration": 30},
					]
				},
			]
		},
		{
			"title": "Modern Agriculture Technology",
			"short_introduction": "Learn how technology is transforming agriculture",
			"description": "Explore how modern technology is revolutionizing agriculture. Learn about precision farming, IoT sensors, and data-driven farming practices.",
			"category": "Agriculture Technology",
			"featured": 1,
			"tags": "agriculture, technology, farming, iot",
			"chapters": [
				{
					"title": "Introduction to AgTech",
					"description": "Technology in modern agriculture",
					"lessons": [
						{"title": "The Future of Farming", "content_type": "Article", "duration": 25},
						{"title": "IoT in Agriculture", "content_type": "Video", "duration": 30},
					]
				},
			]
		},
		{
			"title": "Financial Literacy for Entrepreneurs",
			"short_introduction": "Master financial management for your business",
			"description": "Learn essential financial skills to manage your business effectively. Understand accounting, budgeting, cash flow, and financial planning.",
			"category": "Financial Literacy",
			"featured": 0,
			"tags": "finance, entrepreneurship, accounting, business",
			"chapters": [
				{
					"title": "Financial Basics",
					"description": "Understanding business finances",
					"lessons": [
						{"title": "Introduction to Business Finance", "content_type": "Article", "duration": 20},
						{"title": "Reading Financial Statements", "content_type": "Video", "duration": 35},
					]
				},
			]
		},
		{
			"title": "Starting Your Own Business",
			"short_introduction": "From idea to launch - complete entrepreneurship guide",
			"description": "Learn how to start and grow your own business. From validating ideas to scaling operations, this course covers everything you need to know.",
			"category": "Entrepreneurship",
			"featured": 0,
			"tags": "entrepreneurship, startup, business, innovation",
			"chapters": [
				{
					"title": "Business Planning",
					"description": "Create a solid business plan",
					"lessons": [
						{"title": "Validating Your Business Idea", "content_type": "Article", "duration": 25},
						{"title": "Writing a Business Plan", "content_type": "Video", "duration": 40},
					]
				},
			]
		},
	]
	
	created = []
	for course_data in courses_data:
		# Check if course already exists
		existing_course = frappe.db.get_value("LMS Course", {"title": course_data["title"]}, "name")
		if existing_course:
			created.append(existing_course)
			continue
		
		# Get category
		category = course_data["category"]
		if category not in categories:
			category = categories[0]
		
		# Get random instructor
		instructor = choice(instructors)
		
		# Create course
		course = frappe.get_doc({
			"doctype": "LMS Course",
			"title": course_data["title"],
			"short_introduction": course_data["short_introduction"],
			"description": course_data["description"],
			"category": category,
			"featured": course_data.get("featured", 0),
			"tags": course_data.get("tags", ""),
			"published": 1,
			"enable_certificate": 1,
		})
		course.insert(ignore_permissions=True)
		
		# Add instructor
		course.append("instructors", {"instructor": instructor})
		course.save(ignore_permissions=True)
		
		# Create chapters and lessons
		for chapter_data in course_data.get("chapters", []):
			chapter = frappe.get_doc({
				"doctype": "Course Chapter",
				"title": chapter_data["title"],
				"description": chapter_data.get("description", ""),
				"course": course.name,
			})
			chapter.insert(ignore_permissions=True)
			
			# Add chapter to course
			course.append("chapters", {"chapter": chapter.name})
			
			# Create lessons
			for lesson_data in chapter_data.get("lessons", []):
				lesson = frappe.get_doc({
					"doctype": "Course Lesson",
					"title": lesson_data["title"],
					"content_type": lesson_data.get("content_type", "Article"),
					"duration": lesson_data.get("duration", 30),
					"chapter": chapter.name,
					"course": course.name,
					"body": f"# {lesson_data['title']}\n\nThis is the content for {lesson_data['title']}. Learn and practice the concepts covered in this lesson.",
				})
				lesson.insert(ignore_permissions=True)
				
				# Add lesson to chapter
				chapter.append("lessons", {"lesson": lesson.name})
			
			chapter.save(ignore_permissions=True)
		
		course.save(ignore_permissions=True)
		created.append(course.name)
	
	return created


def create_batches(courses):
	"""Create batches"""
	batches_data = [
		{
			"title": "Web Development Bootcamp - January 2025",
			"description": "Intensive 12-week bootcamp for aspiring web developers",
			"start_date": add_days(today(), -30),
			"end_date": add_days(today(), 60),
			"start_time": "09:00:00",
			"end_time": "17:00:00",
			"timezone": "Asia/Karachi",
			"seat_count": 50,
			"published": 1,
			"allow_self_enrollment": 1,
			"courses": courses[:2] if len(courses) >= 2 else courses,
		},
		{
			"title": "Data Science Cohort - February 2025",
			"description": "Learn data science with hands-on projects",
			"start_date": add_days(today(), -10),
			"end_date": add_days(today(), 80),
			"start_time": "10:00:00",
			"end_time": "18:00:00",
			"timezone": "Asia/Karachi",
			"seat_count": 30,
			"published": 1,
			"allow_self_enrollment": 1,
			"courses": courses[1:2] if len(courses) >= 2 else courses[:1],
		},
	]
	
	created = []
	for batch_data in batches_data:
		# Check if batch already exists (title is unique)
		existing_batch_name = frappe.db.get_value("LMS Batch", {"title": batch_data["title"]}, "name")
		if existing_batch_name:
			created.append(existing_batch_name)
			continue
		
		try:
			# First try with medium explicitly set
			batch = frappe.get_doc({
				"doctype": "LMS Batch",
				"title": batch_data["title"],
				"description": batch_data["description"],
				"start_date": batch_data["start_date"],
				"end_date": batch_data["end_date"],
				"start_time": batch_data["start_time"],
				"end_time": batch_data["end_time"],
				"timezone": batch_data["timezone"],
				"medium": "Online",
				"seat_count": batch_data["seat_count"],
				"published": batch_data["published"],
				"allow_self_enrollment": batch_data["allow_self_enrollment"],
			})
			batch.flags.ignore_validate = True
			batch.insert(ignore_permissions=True)
		except Exception as e:
			print(f"   ⚠️  Error creating batch '{batch_data['title']}': {e}")
			print(f"      Trying without explicit medium field...")
			# Try without medium - let default handle it
			try:
				batch = frappe.get_doc({
					"doctype": "LMS Batch",
					"title": batch_data["title"],
					"description": batch_data["description"],
					"start_date": batch_data["start_date"],
					"end_date": batch_data["end_date"],
					"start_time": batch_data["start_time"],
					"end_time": batch_data["end_time"],
					"timezone": batch_data["timezone"],
					"seat_count": batch_data["seat_count"],
					"published": batch_data["published"],
					"allow_self_enrollment": batch_data["allow_self_enrollment"],
				})
				batch.flags.ignore_validate = True
				batch.insert(ignore_permissions=True)
			except Exception as e2:
				print(f"   ❌ Failed to create batch '{batch_data['title']}': {e2}")
				continue
		
		# Add courses
		for course_name in batch_data["courses"]:
			batch.append("courses", {"course": course_name})
		
		batch.save(ignore_permissions=True)
		created.append(batch.name)
	
	return created


def create_students():
	"""Create student users"""
	students_data = [
		{"first_name": "Ali", "last_name": "Ahmed", "email": "ali.ahmed@example.com"},
		{"first_name": "Sara", "last_name": "Khan", "email": "sara.khan@example.com"},
		{"first_name": "Mohammad", "last_name": "Hassan", "email": "mohammad.hassan@example.com"},
		{"first_name": "Ayesha", "last_name": "Raza", "email": "ayesha.raza@example.com"},
		{"first_name": "Usman", "last_name": "Malik", "email": "usman.malik@example.com"},
		{"first_name": "Fatima", "last_name": "Sheikh", "email": "fatima.sheikh@example.com"},
		{"first_name": "Hassan", "last_name": "Ali", "email": "hassan.ali@example.com"},
		{"first_name": "Zainab", "last_name": "Ahmed", "email": "zainab.ahmed@example.com"},
	]
	
	created = []
	for student_data in students_data:
		email = student_data["email"]
		if not frappe.db.exists("User", email):
			# Create user using SQL to avoid child table defaults
			try:
				# Insert user directly via SQL to bypass child table defaults
				frappe.db.sql("""
					INSERT INTO `tabUser` 
					(name, email, first_name, last_name, user_type, enabled, send_welcome_email, creation, modified, owner, modified_by)
					VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s, %s)
				""", (
					email, email, student_data["first_name"], student_data["last_name"], 
					"Website User", 1, 0, frappe.session.user, frappe.session.user
				))
				frappe.db.commit()
				
				# Get the user doc for role assignment
				user = frappe.get_doc("User", email)
			except Exception as e:
				print(f"Warning: Could not create user {email} via SQL: {e}")
				# Try using frappe.new_doc with skip_defaults
				try:
					user = frappe.new_doc("User")
					user.email = email
					user.first_name = student_data["first_name"]
					user.last_name = student_data["last_name"]
					user.user_type = "Website User"
					user.enabled = 1
					user.send_welcome_email = 0
					# Skip child table defaults
					user.flags.skip_defaults = True
					user.flags.ignore_validate = True
					user.flags.ignore_mandatory = True
					user.insert(ignore_permissions=True, ignore_links=True, ignore_validate=True)
				except Exception as e2:
					print(f"Error creating user {email}: {e2}")
					continue
			
			# Add student role
			try:
				user.add_roles("Student")
			except:
				pass
		else:
			user = frappe.get_doc("User", email)
			if "Student" not in frappe.get_roles(email):
				try:
					user.add_roles("Student")
				except:
					pass
		
		created.append(email)
	
	return created


def create_enrollments(students, courses, batches):
	"""Create enrollments for students"""
	# Enroll students in random courses
	for student in students:
		# Enroll in 2-4 random courses
		enrolled_courses = sample(courses, min(randint(2, 4), len(courses)))
		
		for course_name in enrolled_courses:
			if not frappe.db.exists("LMS Enrollment", {"student": student, "course": course_name}):
				enrollment = frappe.get_doc({
					"doctype": "LMS Enrollment",
					"student": student,
					"course": course_name,
					"enrollment_date": add_days(today(), -randint(1, 60)),
				})
				enrollment.insert(ignore_permissions=True)
		
		# Enroll some students in batches
		if batches and randint(0, 1):
			batch = choice(batches)
			if not frappe.db.exists("LMS Batch Enrollment", {"student": student, "batch": batch}):
				enrollment = frappe.get_doc({
					"doctype": "LMS Batch Enrollment",
					"student": student,
					"batch": batch,
					"enrollment_date": add_days(today(), -randint(1, 30)),
					"status": "Enrolled",
				})
				enrollment.insert(ignore_permissions=True)


def create_lesson_progress(students, courses):
	"""Create lesson progress for students"""
	for student in students:
		# Get student's enrollments
		enrollments = frappe.get_all(
			"LMS Enrollment",
			filters={"student": student},
			fields=["course", "name"]
		)
		
		for enrollment in enrollments:
			course_name = enrollment["course"]
			course = frappe.get_doc("LMS Course", course_name)
			
			# Get all lessons in course
			lessons = []
			for chapter_ref in course.chapters:
				chapter = frappe.get_doc("Course Chapter", chapter_ref.chapter)
				for lesson_ref in chapter.lessons:
					lessons.append(lesson_ref.lesson)
			
			# Mark some lessons as completed (random progress)
			completed_count = randint(0, len(lessons))
			completed_lessons = sample(lessons, completed_count) if lessons else []
			
			for lesson_name in completed_lessons:
				if not frappe.db.exists("LMS Lesson Progress", {
					"student": student,
					"lesson": lesson_name
				}):
					progress = frappe.get_doc({
						"doctype": "LMS Lesson Progress",
						"student": student,
						"lesson": lesson_name,
						"course": course_name,
						"status": "Completed",
						"completed_on": add_days(today(), -randint(1, 30)),
					})
					progress.insert(ignore_permissions=True)
			
			# Update enrollment progress
			enrollment_doc = frappe.get_doc("LMS Enrollment", enrollment["name"])
			if lessons:
				progress_percent = int((completed_count / len(lessons)) * 100)
				enrollment_doc.progress = progress_percent
				enrollment_doc.is_completed = (progress_percent == 100)
				if enrollment_doc.is_completed:
					enrollment_doc.completed_on = today()
				enrollment_doc.save(ignore_permissions=True)


def update_course_statistics():
	"""Update course enrollment and rating statistics"""
	courses = frappe.get_all("LMS Course", fields=["name"])
	
	for course in courses:
		course_doc = frappe.get_doc("LMS Course", course.name)
		
		# Count enrollments
		enrollment_count = frappe.db.count("LMS Enrollment", {"course": course.name})
		course_doc.total_enrollments = enrollment_count
		
		# Count lessons
		lesson_count = 0
		for chapter_ref in course_doc.chapters:
			chapter = frappe.get_doc("Course Chapter", chapter_ref.chapter)
			lesson_count += len(chapter.lessons)
		course_doc.total_lessons = lesson_count
		
		# Random average rating (for demo)
		course_doc.average_rating = round(randint(35, 50) / 10, 1)
		
		course_doc.save(ignore_permissions=True)


def get_existing_users():
	"""Get existing users from database with LMS roles or lms_enabled"""
	users = []
	
	# Get users with LMS roles
	lms_roles = ["Student", "Instructor", "Course Creator", "LMS Admin", "Batch Coordinator"]
	for role in lms_roles:
		role_users = frappe.get_all("Has Role", filters={"role": role}, fields=["parent"], distinct=True)
		users.extend([u.parent for u in role_users])
	
	# Get users with lms_enabled field
	if frappe.db.exists("Custom Field", "User-lms_enabled"):
		enabled_users = frappe.get_all("User", filters={"lms_enabled": 1}, fields=["name"])
		users.extend([u.name for u in enabled_users])
	
	# Remove duplicates and guest/admin
	users = list(set([u for u in users if u not in ["Guest", "Administrator"]]))
	
	return users


def create_quiz_data(courses):
	"""Create quizzes for courses"""
	quizzes_created = 0
	
	for course_name in courses[:4]:  # Create quizzes for first 4 courses
		course = frappe.get_doc("LMS Course", course_name)
		
		# Get lessons from course
		lessons = []
		for chapter_ref in course.chapters:
			chapter = frappe.get_doc("Course Chapter", chapter_ref.chapter)
			for lesson_ref in chapter.lessons[:2]:  # Max 2 quizzes per course
				lessons.append(lesson_ref.lesson)
		
		for lesson_name in lessons:
			# Check if quiz already exists for this lesson
			existing_quiz = frappe.db.get_value("LMS Quiz", {"lesson": lesson_name}, "name")
			if existing_quiz:
				quizzes_created += 1
				continue
			
			# Create quiz
			quiz = frappe.get_doc({
				"doctype": "LMS Quiz",
				"title": f"Quiz for {frappe.get_doc('Course Lesson', lesson_name).title}",
				"lesson": lesson_name,
				"course": course_name,
				"passing_percentage": 70,
				"max_attempts": 3,
				"duration": 30,
				"show_answers": 1,
				"shuffle_questions": 0,
			})
			quiz.insert(ignore_permissions=True)
			
			# Create questions
			questions_data = [
				{
					"question": "What is the main purpose of this lesson?",
					"type": "Single Choice",
					"marks": 1,
					"options": [
						{"option": "To learn basic concepts", "is_correct": 1},
						{"option": "To complete the course", "is_correct": 0},
						{"option": "To pass the exam", "is_correct": 0},
						{"option": "To get a certificate", "is_correct": 0},
					],
					"explanation": "This lesson focuses on teaching basic concepts."
				},
				{
					"question": "Which of the following are important?",
					"type": "Multiple Choice",
					"marks": 2,
					"options": [
						{"option": "Understanding concepts", "is_correct": 1},
						{"option": "Practice exercises", "is_correct": 1},
						{"option": "Memorizing facts", "is_correct": 0},
						{"option": "Rushing through", "is_correct": 0},
					],
					"explanation": "Understanding and practice are key to learning."
				},
			]
			
			for q_data in questions_data:
				question = frappe.get_doc({
					"doctype": "LMS Question",
					"question": q_data["question"],
					"type": q_data["type"],
					"marks": q_data["marks"],
					"explanation": q_data.get("explanation", ""),
				})
				question.insert(ignore_permissions=True)
				
				# Add options
				for opt_data in q_data["options"]:
					question.append("options", {
						"option": opt_data["option"],
						"is_correct": opt_data["is_correct"]
					})
				question.save(ignore_permissions=True)
				
				# Add question to quiz
				quiz.append("questions", {
					"question": question.name,
					"marks": q_data["marks"]
				})
			
			quiz.save(ignore_permissions=True)
			
			# Update lesson with quiz
			lesson_doc = frappe.get_doc("Course Lesson", lesson_name)
			lesson_doc.quiz_id = quiz.name
			lesson_doc.save(ignore_permissions=True)
			
			quizzes_created += 1
	
	return quizzes_created


def create_assignment_data(courses):
	"""Create assignments for courses"""
	assignments_created = 0
	
	for course_name in courses[:3]:  # Create assignments for first 3 courses
		course = frappe.get_doc("LMS Course", course_name)
		
		# Get lessons from course
		lessons = []
		for chapter_ref in course.chapters:
			chapter = frappe.get_doc("Course Chapter", chapter_ref.chapter)
			if chapter.lessons:
				lessons.append(chapter.lessons[0].lesson)  # One assignment per course
		
		for lesson_name in lessons:
			# Check if assignment already exists for this lesson
			lesson_doc = frappe.get_doc("Course Lesson", lesson_name)
			if lesson_doc.assignment_id and frappe.db.exists("LMS Assignment", lesson_doc.assignment_id):
				assignments_created += 1
				continue
			
			assignment = frappe.get_doc({
				"doctype": "LMS Assignment",
				"title": f"Assignment: {lesson_doc.title}",
				"question": f"<p>Complete the following assignment based on the lesson content:</p><ol><li>Review the lesson material</li><li>Complete the practice exercises</li><li>Submit your work</li></ol>",
				"type": "Document",
				"grade_assignment": 1,
				"show_answer": 0,
			})
			assignment.insert(ignore_permissions=True)
			
			# Update lesson with assignment
			lesson_doc = frappe.get_doc("Course Lesson", lesson_name)
			lesson_doc.assignment_id = assignment.name
			lesson_doc.save(ignore_permissions=True)
			
			assignments_created += 1
	
	return assignments_created


def create_discussion_data(courses, users):
	"""Create discussion threads"""
	discussions_created = 0
	
	if not users:
		return 0
	
	for course_name in courses[:5]:  # Create discussions for first 5 courses
		course = frappe.get_doc("LMS Course", course_name)
		
		# Create 2-3 discussions per course
		for i in range(randint(2, 3)):
			owner = choice(users)
			
			discussion = frappe.get_doc({
				"doctype": "LMS Discussion",
				"title": f"Question about {course.title} - Topic {i+1}",
				"content": f"<p>I have a question about {course.title}. Can someone help me understand this concept better?</p>",
				"owner": owner,
				"course": course_name,
				"is_pinned": (i == 0),  # Pin first discussion
				"is_locked": 0,
				"view_count": randint(5, 50),
				"reply_count": randint(0, 5),
			})
			discussion.insert(ignore_permissions=True)
			
			# Create some replies
			reply_users = sample([u for u in users if u != owner], min(randint(1, 3), len(users) - 1))
			for reply_user in reply_users:
				reply = frappe.get_doc({
					"doctype": "LMS Discussion Reply",
					"discussion": discussion.name,
					"reply": f"<p>Great question! Here's my answer based on my understanding...</p>",
					"owner": reply_user,
					"is_solution": 0,
				})
				reply.insert(ignore_permissions=True)
			
			discussions_created += 1
	
	return discussions_created


def create_certificate_data(students, courses):
	"""Generate certificates for completed courses"""
	certificates_created = 0
	
	for student in students:
		# Get completed enrollments
		completed_enrollments = frappe.get_all(
			"LMS Enrollment",
			filters={"student": student, "is_completed": 1},
			fields=["course", "name"]
		)
		
		for enrollment in completed_enrollments:
			course_name = enrollment["course"]
			course = frappe.get_doc("LMS Course", course_name)
			
			if course.enable_certificate:
				# Check if certificate already exists
				if not frappe.db.exists("LMS Certificate", {"student": student, "course": course_name}):
					try:
						from wg_lms.api.certificates import generate_certificate
						generate_certificate(course_name, student)
						certificates_created += 1
					except Exception as e:
						frappe.log_error(f"Error generating certificate: {e}")
	
	return certificates_created


def clear_existing_dummy_data():
	"""Clear existing dummy data before creating new data"""
	# Delete in reverse order of dependencies
	doctypes_to_clear = [
		"LMS Quiz Attempt",
		"LMS Assignment Submission",
		"LMS Discussion Reply",
		"LMS Discussion",
		"LMS Certificate",
		"LMS Lesson Progress",
		"LMS Batch Enrollment",
		"LMS Enrollment",
		"Course Lesson",
		"Course Chapter",
		"LMS Batch",
		"LMS Course",
		"LMS Category",
		"LMS Quiz",
		"LMS Question",
		"LMS Assignment",
		"LMS Training Assignment",
		"LMS Training Feedback",
		"LMS Feedback Question",
	]
	
	total_deleted = 0
	for doctype in doctypes_to_clear:
		try:
			count = frappe.db.count(doctype)
			if count > 0:
				frappe.db.sql(f"DELETE FROM `tab{doctype}`")
				total_deleted += count
				print(f"      - Deleted {count} {doctype} records")
		except Exception as e:
			# DocType might not exist, skip silently
			pass
	
	frappe.db.commit()
	if total_deleted > 0:
		print(f"   ✅ Cleared {total_deleted} existing records")
	else:
		print(f"   ✅ No existing data to clear")


@frappe.whitelist()
def clear_dummy_data():
	"""Clear all dummy data (use with caution!)"""
	if not frappe.conf.developer_mode:
		frappe.throw("This function is only available in developer mode")
	
	clear_existing_dummy_data()
	print("✅ Dummy data cleared!")
