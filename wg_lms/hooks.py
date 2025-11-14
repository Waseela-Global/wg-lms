from . import __version__ as app_version  # noqa: F401

app_name = "wg_lms"
app_title = "Waseela LMS"
app_publisher = "Hapy Co."
app_description = "Waseela LMS"
app_icon_url = "/assets/wg_lms/images/lms-logo.png"
app_icon_title = "Learning"
app_icon_route = "/lms"
app_color = "grey"
app_email = "admin@hapy.co"
app_license = "proprietary"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/wg_lms/css/lms.css"
# app_include_js = "/assets/wg_lms/js/lms.js"

# include js, css files in header of web template
web_include_css = ["/assets/wg_lms/css/style.css"]
web_include_js = []

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "wg_lms/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "wg_lms.install.before_install"
after_install = "wg_lms.install.after_install"
after_sync = "wg_lms.install.after_sync"
before_uninstall = "wg_lms.install.before_uninstall"
setup_wizard_requires = "assets/wg_lms/js/setup_wizard.js"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "wg_lms.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
	"Web Template": "wg_lms.overrides.web_template.CustomWebTemplate",
}

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"*": {
		# "on_change": [
		# 	"wg_lms.lms.doctype.lms_badge.lms_badge.process_badges",
		# ]
	},
	"Discussion Reply": {"after_insert": "wg_lms.lms.utils.handle_notifications"},
	"Notification Log": {"on_change": "wg_lms.lms.utils.publish_notifications"},
	"User": {
		"validate": "wg_lms.lms.user.validate_username_duplicates",
		"after_insert": "wg_lms.lms.user.after_insert",
	},
}

# Scheduled Tasks
# ---------------
scheduler_events = {
	"hourly": [
		"wg_lms.lms.doctype.lms_certificate_request.lms_certificate_request.schedule_evals",
		"wg_lms.lms.api.update_course_statistics",
		"wg_lms.lms.doctype.lms_certificate_request.lms_certificate_request.mark_eval_as_completed",
	],
	"daily": [],
}

fixtures = ["Custom Field", "Function", "Industry", "LMS Category"]

# Testing
# -------

# before_tests = "wg_lms.install.before_tests"

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
	# "frappe.desk.search.get_names_for_mentions": "wg_lms.lms.utils.get_names_for_mentions",
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "wg_lms.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Add all simple route rules here
website_route_rules = [
	{"from_route": "/lms/<path:app_path>", "to_route": "lms"},
	{
		"from_route": "/courses/<course_name>/<certificate_id>",
		"to_route": "certificate",
	},
]

website_redirects = [
	{"source": "/update-profile", "target": "/edit-profile"},
	{"source": "/courses", "target": "/lms/courses"},
	{
		"source": r"^/courses/.*$",
		"target": "/lms/courses",
	},
	{"source": "/batches", "target": "/lms/batches"},
	{
		"source": r"/batches/(.*)",
		"target": "/lms/batches",
		"match_with_query_string": True,
	},
	{"source": "/statistics", "target": "/lms/statistics"},
]

update_website_context = [
	"wg_lms.widgets.update_website_context",
]

jinja = {
	"methods": [
		"wg_lms.lms.utils.get_signup_optin_checks",
		"wg_lms.lms.utils.get_tags",
		"wg_lms.lms.utils.get_lesson_count",
		"wg_lms.lms.utils.get_instructors",
		"wg_lms.lms.utils.get_lesson_index",
		"wg_lms.lms.utils.get_lesson_url",
		"wg_lms.lms.utils.is_instructor",
		"wg_lms.lms.utils.get_palette",
	],
	"filters": [],
}
## Specify the additional tabs to be included in the user profile page.
## Each entry must be a subclass of wg_lms.lms.plugins.ProfileTab
# profile_tabs = []

## Specify the extension to be used to control what scripts and stylesheets
## to be included in lesson pages. The specified value must be be a
## subclass of lms.plugins.PageExtension
# lms_lesson_page_extension = None

# lms_lesson_page_extensions = [
# 	"wg_lms.plugins.LiveCodeExtension"
# ]

has_website_permission = {
	"LMS Certificate Evaluation": "wg_lms.lms.doctype.lms_certificate_evaluation.lms_certificate_evaluation.has_website_permission",
	"LMS Certificate": "wg_lms.lms.doctype.lms_certificate.lms_certificate.has_website_permission",
}

## Markdown Macros for Lessons
lms_markdown_macro_renderers = {
	"Exercise": "wg_lms.plugins.exercise_renderer",
	"Quiz": "wg_lms.plugins.quiz_renderer",
	"YouTubeVideo": "wg_lms.plugins.youtube_video_renderer",
	"Video": "wg_lms.plugins.video_renderer",
	"Assignment": "wg_lms.plugins.assignment_renderer",
	"Embed": "wg_lms.plugins.embed_renderer",
	"Audio": "wg_lms.plugins.audio_renderer",
	"PDF": "wg_lms.plugins.pdf_renderer",
}

page_renderer = []

# set this to "/" to have profiles on the top-level
profile_url_prefix = "/users/"

signup_form_template = "wg_lms.plugins.show_custom_signup"

on_login = "wg_lms.lms.user.on_login"

get_site_info = "wg_lms.activation.get_site_info"

add_to_apps_screen = [
	{
		"name": "wg_lms",
		"logo": "/assets/wg_lms/frontend/learning.svg",
		"title": "Learning",
		"route": "/lms",
		"has_permission": "wg_lms.lms.api.check_app_permission",
	}
]
