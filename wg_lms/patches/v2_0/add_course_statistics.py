import frappe

from wg_lms.lms.api import update_course_statistics


def execute():
	update_course_statistics()
