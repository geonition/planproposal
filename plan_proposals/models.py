from django.db import models
from django.contrib.sites.managers import CurrentSiteManager
from django.core.files.storage import FileSystemStorage
from django.contrib.sites.models import Site

class PlanningProject(models.Model):

    name = models.CharField(max_length = 75)
    area = models.CharField(max_length = 40)
    site = models.ForeignKey(Site)
    on_site = CurrentSiteManager()

    def __unicode__(self):
        return self.name


class Proposal(models.Model):

    project = models.ForeignKey(PlanningProject)
    name = models.CharField(max_length = 50)
    short_description = models.TextField()
    detailed_description = models.TextField()

    def __unicode__(self):
        return self.name

    class Meta:
        unique_together = (("project", "name"),)


class Image(models.Model):

    title = models.CharField(max_length = 75)
    image = models.ImageField(upload_to = 'proposal_image')
    proposal = models.ForeignKey(Proposal)

    def __unicode__(self):
        return self.title

# Create your models here.
