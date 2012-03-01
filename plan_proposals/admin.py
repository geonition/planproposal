from django.contrib.gis import admin
from models import PlanningProject,Image,Proposal


admin.site.register(PlanningProject,admin.OSMGeoAdmin)
admin.site.register(Image)
admin.site.register(Proposal) 
