from setuptools import find_packages, setup

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in wg_lms/__init__.py
from wg_lms import __version__ as version

setup(
	name="wg_lms",
	version=version,
	description="Waseela LMS",
	author="Hapy Co.",
	author_email="admin@hapy.co",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires,
)
