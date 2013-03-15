from modeltranslation.translator import translator
from modeltranslation.translator import TranslationOptions
from plan_proposals.models import PlanningProject

class PlanningProjectTranslationOptions(TranslationOptions):
    fields = ('name',
              'description',
              )
    
translator.register(PlanningProject, PlanningProjectTranslationOptions)

