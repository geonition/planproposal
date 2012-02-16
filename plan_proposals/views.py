from base_page.models import CitySetting
from django.shortcuts import render_to_response
from django.template import RequestContext

def planning_project(request, project_name):
    """
    This view serves the main page for a planning project where different
    proposals can be navigated to
    """
    return render_to_response('planning_project.html',
                              {'project_name' : project_name},
                              context_instance=RequestContext(request))

def plan_proposal(request, project_name, proposal_name):
    """
    This is the page of one planning proposal. The proposal
    can also be avaulated and some feedback can be given
    by the user.
    """
    try:
        city_settings = CitySetting.on_site.all()[0]
    except IndexError:
        city_settings = {}

    return render_to_response('proposal_feedback.html',
                              {'project_name' : project_name,
                               'proposal_name' : proposal_name,
                               'city_settings': city_settings},
                              context_instance=RequestContext(request))
