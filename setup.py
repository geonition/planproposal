from setuptools import setup
from setuptools import find_packages

setup(
    name='plan_proposals',
    version='4.3.0',
    author='Kristoffer Snabb',
    url='https://github.com/geonition/plan_proposal',
    packages=find_packages(),
    include_package_data=True,
    package_data = {
        "plan_proposals": [
            "templates/*.html",
            "templates/*.js",
            "static/css/*.css",
            "static/js/*.js",
            "static/js/libs/*.js",
            "static/img/*.jpg",
            "static/img/*.gif",
            "static/img/*.png",
            "static/img/buttons/*.png",
            "static/img/placemarks/*.png",
            "static/img/test/*.png",
            "static/cursors/*.cur",
            "locale/*/LC_MESSAGES/*.po",
            "locale/*/LC_MESSAGES/*.mo",
        ],
    },
    zip_safe=False,
    install_requires=['django'],
)
