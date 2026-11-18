from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import (
    Competition,
    CompetitionAward,
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


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ["id", "image", "caption", "sorting_order"]


class ProjectAwardSerializer(serializers.ModelSerializer):
    """Award as seen from a project: which competition and prize."""

    competition_name = serializers.CharField(source="competition.name", read_only=True)

    class Meta:
        model = CompetitionAward
        fields = ["id", "prize", "competition", "competition_name"]


class ProjectSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)
    awards = serializers.SerializerMethodField()

    @extend_schema_field(ProjectAwardSerializer(many=True))  # tells the API docs what this returns
    def get_awards(self, obj):
        return ProjectAwardSerializer(obj.awards.all(), many=True).data

    class Meta:
        model = Project
        fields = [
            "id", "name", "slug", "summary", "description", "project_type", "storeys",
            "status", "status_display", "image", "in_competition", "images", "awards", "sorting_order",
            "created_at", "updated_at",
        ]
        read_only_fields = ["slug"]


class DrawingSerializer(serializers.ModelSerializer):
    drawing_type_display = serializers.CharField(source="get_drawing_type_display", read_only=True)

    class Meta:
        model = Drawing
        fields = ["id", "name", "drawing_type", "drawing_type_display", "image", "sorting_order", "created_at", "updated_at"]


class PhotographySerializer(serializers.ModelSerializer):
    photography_type_display = serializers.CharField(source="get_photography_type_display", read_only=True)

    class Meta:
        model = Photography
        fields = ["id", "name", "photography_type", "photography_type_display", "image", "sorting_order", "created_at", "updated_at"]


class InteriorDesignTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteriorDesignType
        fields = ["id", "name", "status"]


class InteriorDesignSerializer(serializers.ModelSerializer):
    design_type_name = serializers.CharField(source="design_type.name", read_only=True)

    class Meta:
        model = InteriorDesign
        fields = ["id", "name", "description", "design_type", "design_type_name", "image", "sorting_order", "created_at", "updated_at"]


class AwardProjectSerializer(serializers.ModelSerializer):
    """Small project summary embedded inside an award."""

    class Meta:
        model = Project
        fields = ["id", "name", "slug", "summary", "image"]


class CompetitionAwardSerializer(serializers.ModelSerializer):
    project = AwardProjectSerializer(read_only=True)

    class Meta:
        model = CompetitionAward
        fields = ["id", "prize", "project", "sorting_order"]


class CompetitionSerializer(serializers.ModelSerializer):
    awards = CompetitionAwardSerializer(many=True, read_only=True)
    # "project" is the project's primary key (send this when creating/updating);
    # "project_detail" is the matching row from the Project table, for display.
    project_detail = AwardProjectSerializer(source="project", read_only=True)

    class Meta:
        model = Competition
        fields = [
            "id", "name", "description", "image", "project", "project_detail", "awards",
            "sorting_order", "created_at", "updated_at",
        ]


class ProfessionalExpertiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalExpertise
        fields = ["id", "label", "sorting_order"]


class ProfessionalSerializer(serializers.ModelSerializer):
    expertise = ProfessionalExpertiseSerializer(many=True, read_only=True)

    class Meta:
        model = Professional
        fields = [
            "id", "name", "slug", "designation", "photo", "tagline", "bio",
            "qualifications", "specialization", "experience", "location",
            "email", "phone_no", "linkedin", "website",
            "is_active", "expertise", "sorting_order", "created_at", "updated_at",
        ]
        read_only_fields = ["slug"]


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ["id", "address", "email", "phone_no", "map_location"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone_no", "subject", "message", "is_read", "created_at"]
        read_only_fields = ["created_at"]
        extra_kwargs = {
            "name": {"required": True, "allow_blank": False},
            "email": {"required": True, "allow_blank": False},
            "message": {"required": True, "allow_blank": False},
        }
