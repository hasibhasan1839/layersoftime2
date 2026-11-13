from rest_framework import viewsets

from .models import (
    Competition,
    Contact,
    Drawing,
    InteriorDesign,
    InteriorDesignType,
    Photography,
    Project,
)
from .serializers import (
    CompetitionSerializer,
    ContactSerializer,
    DrawingSerializer,
    InteriorDesignSerializer,
    InteriorDesignTypeSerializer,
    PhotographySerializer,
    ProjectSerializer,
)

# Public read, authenticated write (see DEFAULT_PERMISSION_CLASSES in settings).


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.prefetch_related("images", "awards__competition")
    serializer_class = ProjectSerializer
    filterset_fields = ["slug", "status", "project_type", "in_competition"]
    search_fields = ["name", "summary", "description"]


class DrawingViewSet(viewsets.ModelViewSet):
    queryset = Drawing.objects.all()
    serializer_class = DrawingSerializer
    filterset_fields = ["drawing_type"]
    search_fields = ["name"]


class PhotographyViewSet(viewsets.ModelViewSet):
    queryset = Photography.objects.all()
    serializer_class = PhotographySerializer
    filterset_fields = ["photography_type"]
    search_fields = ["name"]


class InteriorDesignTypeViewSet(viewsets.ModelViewSet):
    queryset = InteriorDesignType.objects.all()
    serializer_class = InteriorDesignTypeSerializer
    filterset_fields = ["status"]


class InteriorDesignViewSet(viewsets.ModelViewSet):
    queryset = InteriorDesign.objects.select_related("design_type")
    serializer_class = InteriorDesignSerializer
    filterset_fields = ["design_type"]
    search_fields = ["name", "description"]


class CompetitionViewSet(viewsets.ModelViewSet):
    queryset = Competition.visible().select_related("project").prefetch_related("awards__project")
    serializer_class = CompetitionSerializer
    search_fields = ["name", "description"]


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
