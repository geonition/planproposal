"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.test import TestCase
from django.test.client import Client
from django.contrib.sites.models import Site
import json

from datetime import date
from datetime import timedelta

from plan_proposals.models import PlanningProject

class PlanProposalTest(TestCase):

    def setUp(self):
        self.client = Client()

        #setup a admin
        self.admin_user = User.objects.create_user('admin', '', 'passwd')
        self.admin_user.is_staff = True
        self.admin_user.is_superuser = True
        self.admin_user.save()

    def test_get_active_planning_projects(self):

        site = Site.objects.get(id=1)
        # create test questionnaires
        today = date.today()
        pp1 = PlanningProject(name='test1',
                              slug='test1',
                              area='POLYGON((0 0,1 0,1 1,1 0,0 0))',
                              start_date=today,
                              end_date=today + timedelta(days=4),
                              site=site)
        pp2 = PlanningProject(name='test2',
                              slug='test2',
                              area='POLYGON((0 0,1 0,1 1,1 0,0 0))',
                              start_date=today - timedelta(days=8),
                              end_date=today,
                              site=site )
        pp3 = PlanningProject(name='test3',
                              slug='test3',
                              area='POLYGON((0 0,1 0,1 1,1 0,0 0))',
                              start_date=today - timedelta(days=14),
                              end_date=today - timedelta(days=1),
                              site=site )
        pp1.save()
        pp2.save()
        pp3.save()

        self.client.login(username = 'admin', password = 'passwd')

        response = self.client.get(reverse('active_planning_projects'))
        response_dict = json.loads(response.content)
        self.assertEqual(len(response_dict['content']), 2)
