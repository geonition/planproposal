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
        "plan_proposal": [
            "templates/*.html",
            "static/css/*.css",
            "static/images/*.png",
        ],
    },
    zip_safe=False,
    install_requires=['django'],
)
