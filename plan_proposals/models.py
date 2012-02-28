from django.db import models
from django.contrib.sites.managers import CurrentSiteManager
from django.core.files.storage import FileSystemStorage
from django.contrib.sites.models import Site
from dashboard.models import ProjectSetting

class ProjectDetail(models.Model):
    
    site = models.ForeignKey(Site)
    area_name = models.CharField(max_length = 50)
    short_description = models.TextField()
    description_detail = models.TextField()
    
    def __unicode__(self):
        return self.area_name

    
class ProjectImage(models.Model):
    
    project_image_title = models.CharField(max_length = 75)
    project_image = models.ImageField(upload_to = 'Images')
    project = models.ForeignKey(ProjectDetail)
    
    def __unicode__(self):
        return self.project_image_title

# Create your models here.
