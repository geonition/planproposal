from django.db import models
from django.conf import settings
from django.contrib.gis.db import models as geomodel
from django.contrib.sites.managers import CurrentSiteManager
from django.core.files.storage import FileSystemStorage
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse
from django.template.defaultfilters import slugify


class PlanningProject(models.Model):

    name = models.CharField(max_length = 75,
                            unique=True)
    slug = models.SlugField(max_length = 75,
                            editable=False)
    area = geomodel.PolygonField(srid = getattr(settings, 'SPATIAL_REFERENCE_SYSTEM_ID', 4326))
    site = models.ForeignKey(Site)
    on_site = CurrentSiteManager()

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)

        super(PlanningProject, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.name


class Proposal(models.Model):

    project = models.ForeignKey(PlanningProject)
    name = models.CharField(max_length = 50)
    slug = models.SlugField(editable=False)
    short_description = models.TextField()
    detailed_description = models.TextField()
    
    def get_absolute_url(self):
        """
        Returns the absolute url for this plan_proposal for
        preview purposes.
        """
        return reverse('plan_proposal',
                       kwargs = {'project_name': self.project.slug,
                                 'proposal_name': self.slug})

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)

        super(Proposal, self).save(*args, **kwargs)

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

