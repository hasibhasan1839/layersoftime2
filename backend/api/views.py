from django.contrib.auth import get_user_model
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import (
    Competition,
    Contact,
    ContactMessage,
    Drawing,
    InteriorDesign,
    InteriorDesignType,
    Photography,
    Professional,
    ProfessionalExpertise,
    Project,
    ProjectImage,
)
from .serializers import (
    CompetitionSerializer,
    ContactMessageSerializer,
    ContactSerializer,
    DrawingSerializer,
    InteriorDesignSerializer,
    InteriorDesignTypeSerializer,
    PhotographySerializer,
    ProfessionalExpertiseSerializer,
    ProfessionalSerializer,
    ProjectImageSerializer,
    ProjectSerializer,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'phone_no', 'user_type', 'is_staff', 'date_joined', 'created_at', 'updated_at']
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    current = request.data.get('currentPassword', '')
    new_pw = request.data.get('newPassword', '')
    if not request.user.check_password(current):
        return Response({'currentPassword': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_pw) < 8:
        return Response({'newPassword': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
    request.user.set_password(new_pw)
    request.user.save()
    return Response({'ok': True})


# Public read, authenticated write (see DEFAULT_PERMISSION_CLASSES in settings).


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.prefetch_related("images", "awards__competition")
    serializer_class = ProjectSerializer
    filterset_fields = ["slug", "status", "project_type", "in_competition"]
    search_fields = ["name", "summary", "description"]


class ProjectImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProjectImage.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs['project_pk'])


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


class ProfessionalViewSet(viewsets.ModelViewSet):
    queryset = Professional.objects.prefetch_related("expertise")
    serializer_class = ProfessionalSerializer
    filterset_fields = ["slug", "is_active"]
    search_fields = ["name", "designation", "bio", "specialization"]


class ProfessionalExpertiseViewSet(viewsets.ModelViewSet):
    serializer_class = ProfessionalExpertiseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProfessionalExpertise.objects.filter(professional_id=self.kwargs["professional_pk"])

    def perform_create(self, serializer):
        serializer.save(professional_id=self.kwargs["professional_pk"])


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    """Anyone may send a message; only signed-in staff may read, mark or delete them."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    filterset_fields = ["is_read"]
    search_fields = ["name", "email", "subject", "message"]

    def get_permissions(self):
        return [AllowAny()] if self.action == "create" else [IsAuthenticated()]

    def perform_create(self, serializer):
        # A visitor must never be able to post a message that is already marked read.
        serializer.save(is_read=False)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        password = data.pop('password', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        password = data.pop('password', None)
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
        return Response(UserSerializer(user).data)
