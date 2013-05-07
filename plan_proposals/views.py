from base_page.models import OrganizationSetting
from plan_proposals.models import PlanningProject
from plan_proposals.models import Image
from plan_proposals.models import Proposal
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse
from django.http import Http404
from django.http import HttpResponseNotFound
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from django.template import RequestContext
from django.views.decorators.csrf import ensure_csrf_cookie
from datetime import date
from geonition_utils.http import HttpResponse
import json

def planning_project(request, project_slug):
    """
    This view serves the main page for a planning project where different
    proposals can be navigated to
    """
    # This view is currently not working, use only plan_proposal view as
    # only one proposal per project is possible
    project = Project.on_site.get(slug = project_slug)
    return render_to_response('planning_project.html',
                              {'project_name' : project.name},
                              context_instance = RequestContext(request))

@ensure_csrf_cookie
def plan_proposal(request, project_slug, proposal_slug):
    """
    This is the page of one planning proposal. The proposal
    can also be avaulated and some feedback can be given
    by the user.
    """
    try:
        org_settings = OrganizationSetting.on_site.all()[0]
    except IndexError:
        org_settings = {}

    try:
        proposal = Proposal.objects.select_related().get(
                            project__slug=project_slug,
                            slug=proposal_slug)
    except Proposal.DoesNotExist:
        raise Http404
    
    proposal_image = Image.objects.filter(proposal = proposal.id)

    return render_to_response('proposal_feedback.html',
                              {'proposal_details': proposal,
                               'proposal_image': proposal_image,
                               'project_name' : project_slug,
                               'proposal_name' : proposal_slug,
                               'org_settings': org_settings},
                              context_instance = RequestContext(request))

def get_active_planning_projects(request):
    today = date.today()
    active_projects = PlanningProject.on_site.filter(start_date__lte=today).filter(end_date__gte=today)
    projects = []
    for project in active_projects:
        cur_project = {}
        cur_feature = {"type": "Feature",
                       "id": project.id,
                       "geometry": json.loads(project.area.json),
                       "crs": {"type": "name",
                              "properties": {
                                  "code": "EPSG:" + str(project.area.srid)
                             }}
                       }
        cur_project['name'] = project.name
        cur_project['description'] = project.description
        cur_project['area'] = cur_feature
        proposals = project.proposal_set.all()
        if len(proposals) > 0:
            proposal = proposals[0]
            # NOTE: This is the url to the only proposal
            cur_project['project_url'] = reverse('plan_proposal', 
                                                 kwargs={'project_slug': project.slug,
                                                         'proposal_slug': proposal.slug})
        else:
            cur_project['project_url'] = reverse('planning_project', 
                                                 kwargs={'project_slug': project.slug})

        projects.append(cur_project)

    return HttpResponse(json.dumps({'projectType': 'planningProjects',
                                    'content': projects}))
#    return HttpResponse(json.dumps(questionnaires))
