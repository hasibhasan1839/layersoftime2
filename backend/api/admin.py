from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import reverse
from django.utils.html import format_html

from .models import (
    IMAGE_EXTENSIONS,
    validate_image_extension,
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
    User,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Reuse Django's built-in user screens and add our extra columns
    fieldsets = UserAdmin.fieldsets + (("Extra info", {"fields": ("name", "phone_no", "user_type")}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Extra info", {"fields": ("email", "name", "phone_no", "user_type")}),)
    list_display = ("username", "email", "name", "user_type", "is_staff", "is_active")
    list_filter = ("user_type", "is_staff", "is_active")


# The file picker only offers image files; the real check is the validator on the model fields.
class RowDeleteMixin:
    """
    List page: a red Delete button on every row (put "delete_button" last in list_display).
    It replaces Django's "Action: delete selected" dropdown and the row checkboxes.
    The button opens the usual "Are you sure?" page, which lists everything that will be deleted with the row.
    """

    actions = None  # removes the Action dropdown and the checkboxes

    @admin.display(description="Delete")
    def delete_button(self, obj):
        if obj.pk is None:
            return ""
        opts = self.model._meta
        url = reverse(f"admin:{opts.app_label}_{opts.model_name}_delete", args=[obj.pk])
        return format_html(
            '<a class="button" href="{}" style="background: var(--delete-button-bg, #ba2121); color: #fff; '
            'padding: 6px 12px; white-space: nowrap;">Delete</a>',
            url,
        )


IMAGE_ACCEPT = ",".join(f".{ext}" for ext in IMAGE_EXTENSIONS)
image_widget = forms.ClearableFileInput(attrs={"accept": IMAGE_ACCEPT})


class MultipleImageInput(forms.ClearableFileInput):
    allow_multiple_selected = True  # renders <input type="file" multiple>


class MultipleImageField(forms.ImageField):
    """An image field that takes several files in one go and returns them as a list."""

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleImageInput(attrs={"accept": IMAGE_ACCEPT}))
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        files = data if isinstance(data, (list, tuple)) else [data]
        files = [f for f in files if f]
        if not files:
            if self.required:
                raise forms.ValidationError(self.error_messages["required"], code="required")
            return []
        cleaned, errors = [], []
        for f in files:  # every file is checked on its own, so one bad file is named in the error
            try:
                cleaned.append(super().clean(f, initial))
            except forms.ValidationError as exc:
                errors.extend(f"{f.name}: {message}" for message in exc.messages)
        if errors:
            raise forms.ValidationError(errors)
        return cleaned


class ProjectAdminForm(forms.ModelForm):
    # Every field on the Project add/edit page is mandatory (slug is filled in automatically from the name)
    REQUIRED_FIELDS = (
        "name", "slug", "summary", "description", "project_type", "storeys", "status", "image", "sorting_order",
    )

    # Two buttons: "Competition" also shows the project in the Competitions section, "None" keeps it in Projects only
    in_competition = forms.TypedChoiceField(
        label="Show in",
        choices=((True, "Competition"), (False, "None")),
        coerce=lambda value: str(value) == "True",
        widget=forms.RadioSelect,
        required=True,
        help_text="Competition: the project is also shown in the Competitions section. "
        "None: it is shown in the Projects section only.",
    )

    # Shown inside the "Project images" section (see project_images_inline.html), not with the fields above.
    gallery_images = MultipleImageField(
        required=False,
        validators=[validate_image_extension],
        help_text="Select several images at once (hold Ctrl or Shift). They are all added to this project on save.",
    )

    class Meta:
        model = Project
        fields = "__all__"
        widgets = {"image": image_widget}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.REQUIRED_FIELDS:
            if field_name in self.fields:
                self.fields[field_name].required = True
        if self.instance._state.adding:
            self.initial["in_competition"] = None  # new project: nothing pre-selected, one button must be clicked


class ProjectImageInlineForm(forms.ModelForm):
    class Meta:
        model = ProjectImage
        fields = "__all__"
        widgets = {"image": image_widget}


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    form = ProjectImageInlineForm
    template = "admin/api/project_images_inline.html"  # adds the multi-image picker above the table
    extra = 0  # no empty row: new images come from the multi-image picker ("Add another" still works)


@admin.register(Project)
class ProjectAdmin(RowDeleteMixin, admin.ModelAdmin):
    form = ProjectAdminForm
    prepopulated_fields = {"slug": ("name",)}  # slug box fills itself while the name is typed
    list_display = ("name", "project_type", "storeys", "status", "in_competition", "sorting_order", "updated_at", "delete_button")
    list_editable = ("sorting_order",)  # edit the order straight from the list page
    list_filter = ("status", "project_type", "in_competition")
    search_fields = ("name", "description")  # also needed for the award project picker
    inlines = [ProjectImageInline]

    def get_fields(self, request, obj=None):
        # gallery_images is drawn in the "Project images" section, so keep it out of the top field list
        return [f for f in super().get_fields(request, obj) if f != "gallery_images"]

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        # Turn every file from the multi-image picker into its own ProjectImage row, after the existing ones
        project = form.instance
        last = project.images.order_by("-sorting_order").values_list("sorting_order", flat=True).first()
        next_order = 0 if last is None else last + 1
        for offset, image in enumerate(form.cleaned_data.get("gallery_images") or []):
            ProjectImage.objects.create(project=project, image=image, sorting_order=next_order + offset)


@admin.register(Drawing)
class DrawingAdmin(admin.ModelAdmin):
    list_display = ("name", "drawing_type", "sorting_order", "updated_at")
    list_editable = ("sorting_order",)
    list_filter = ("drawing_type",)


@admin.register(Photography)
class PhotographyAdmin(admin.ModelAdmin):
    list_display = ("name", "photography_type", "sorting_order", "updated_at")
    list_editable = ("sorting_order",)
    list_filter = ("photography_type",)


@admin.register(InteriorDesignType)
class InteriorDesignTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "status")
    list_editable = ("status",)


@admin.register(InteriorDesign)
class InteriorDesignAdmin(admin.ModelAdmin):
    list_display = ("name", "design_type", "sorting_order", "updated_at")
    list_editable = ("sorting_order",)
    list_filter = ("design_type",)


class ProfessionalExpertiseInline(admin.TabularInline):
    model = ProfessionalExpertise
    extra = 1


@admin.register(Professional)
class ProfessionalAdmin(admin.ModelAdmin):
    inlines = [ProfessionalExpertiseInline]
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name", "designation", "experience", "is_active", "sorting_order", "updated_at")
    list_editable = ("sorting_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "designation", "specialization")
    fieldsets = (
        ("Identity", {"fields": ("name", "slug", "designation", "photo", "tagline")}),
        ("Profile", {"fields": ("bio", "qualifications", "specialization", "experience", "location")}),
        ("Contact", {"fields": ("email", "phone_no", "linkedin", "website")}),
        ("Display", {"fields": ("is_active", "sorting_order")}),
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("email", "phone_no", "address")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "phone_no", "subject", "message", "created_at")

    def has_add_permission(self, request):
        return False  # messages only ever arrive from the public form


class CompetitionAwardInline(admin.TabularInline):
    model = CompetitionAward
    extra = 1
    autocomplete_fields = ["project"]


@admin.register(Competition)
class CompetitionAdmin(RowDeleteMixin, admin.ModelAdmin):
    inlines = [CompetitionAwardInline]
    fields = ("name", "project", "description", "image", "sorting_order")
    list_display = ("name", "project", "sorting_order", "updated_at", "delete_button")
    list_editable = ("sorting_order",)
    list_filter = (("project", admin.RelatedOnlyFieldListFilter),)  # only projects shown in this list
    list_select_related = ("project",)

    def get_queryset(self, request):
        # Only competitions whose project chose "Competition" (a project set to "None" is hidden here)
        ordering = self.get_ordering(request) or Competition._meta.ordering
        return Competition.visible().order_by(*ordering)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        # Any project may be picked here, not just ones already flagged: saving the competition
        # switches the chosen project to "Competition" for you (see Competition.save).
        if db_field.name == "project":
            kwargs["empty_label"] = "(no project — standalone entry)"
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
