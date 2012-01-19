from django.conf.urls.defaults import patterns
from django.conf.urls.defaults import url

urlpatterns = patterns('plan_proposals.views',

    url(r'^planning_project/(?P<project_name>[\w+(+-_)*]+)/$',
        'planning_project',
        name='planning_project'),

    url(r'^plan_proposal/(?P<proposal_name>[\w+(+-_)*]+)/$',
        'plan_proposal',
        name='plan_proposal'),
    
    url(r'^quest_spec.js$',
        'quest_spec_js',
        name='quest_spec_js'),
    
    url(r'^overview.js$',
        'overview_js',
        name="overview_js"),
        
    url(r'^quest_default.js$',
        'quest_default_js',
        name="quest_default_js"),

        
    
    )
