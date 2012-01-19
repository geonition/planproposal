from setuptools import setup
from setuptools import find_packages

setup(
    name='plan_proposals',
    version='1.0.0',
    author='Kristoffer Snabb',
    url='https://github.com/geonition/plan_proposal',
    packages=find_packages(),
    include_package_data=True,
    package_data = {
        "plan_proposals": [
            "templates/*.html",
            "templates/*.js",
            "static/css/*.css",
            "static/javascript/*.js",
            "static/images/*.jpg",
            "static/images/*.gif",
            "static/images/*.png",
            "static/images/buttons/*.png",
            "static/images/placemarks/*.png",
            "static/cursors/*.cur",
        ],
    },
    zip_safe=False,
    install_requires=['django'],
)
