from django.conf.urls.defaults import patterns
from django.conf.urls.defaults import url
from django.conf import settings

urlpatterns = patterns('plan_proposals.views',

    url(r'^project/(?P<project_name>[\w+(+-_)*]+)/$',
        'planning_project',
        name='planning_project'),

    url(r'^proposal/(?P<project_name>[\w+(+-_)*]+)/(?P<proposal_name>[\w+(+-_)*]+)/$',
        'plan_proposal',
        name='plan_proposal'),    
    )
    

