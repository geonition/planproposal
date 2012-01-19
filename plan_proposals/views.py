# Create your views here.
# Create your views here.
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import HttpResponseBadRequest
from django.http import HttpResponseForbidden
from django.http import HttpResponseNotFound
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.template import loader
from django.shortcuts import render_to_response, redirect
from django.conf import settings
from django.utils import translation
from django.core.urlresolvers import reverse
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from django import forms
from django.contrib.auth import authenticate, login
from django.core.validators import email_re
from django.forms.util import ErrorList
from django.utils import simplejson as json


# set the ugettext _ shortcut
_ = translation.ugettext

def planning_project(request, project_name):
    
    return render_to_response('municipal_project.html',
                              {'debug_mode' :  str(settings.DEBUG).lower(),
                               'project_name' : project_name},
                              context_instance=RequestContext(request))

def plan_proposal(request, proposal_name):
    
    return render_to_response('proposal_feedback.html',
                              {'debug_mode' :  str(settings.DEBUG).lower(),
                               'proposal_name' : proposal_name},
                              context_instance=RequestContext(request))    

def quest_spec_js(request):
    response = render_to_response('quest_spec.js',
                                  {},
                                  context_instance = RequestContext(request))
    response['Content-type'] = 'application/javascript'
    return response
    
def overview_js(request):
    response = render_to_response('overview.js',
                                  {},
                                  context_instance = RequestContext(request))
    response['Content-type'] = 'application/javascript'
    return response

def quest_default_js(request):
    response = render_to_response('quest_default.js',
                                  {},
                                  context_instance = RequestContext(request))
    response['Content-type'] = 'application/javascript'
    return response    
