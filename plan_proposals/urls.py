from django.conf.urls import patterns
from django.conf.urls import url
from django.conf import settings

urlpatterns = patterns('plan_proposals.views',
    url(r'^active/$',
        'get_active_planning_projects',
        name='active_planning_projects'),

    url(r'^project/(?P<project_slug>[\w+(+-_)*]+)/$',
        'planning_project',
        name='planning_project'),

    url(r'^proposal/(?P<project_slug>[\w+(+-_)*]+)/(?P<proposal_slug>[\w+(+-_)*]+)/$',
        'plan_proposal',
        name='plan_proposal'),    
    )
    

