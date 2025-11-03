from venv import create

import frappe

from wg_lms.install import create_moderator_role


def execute():
	create_moderator_role()
