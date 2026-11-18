from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.text import slugify


# ---------------------------------------------------------------------------
# Reusable building blocks (abstract = no table of their own; their fields are
# copied into every model that inherits from them)
# ---------------------------------------------------------------------------
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)  # set once, on insert
    updated_at = models.DateTimeField(auto_now=True)  # refreshed on every save

    class Meta:
        abstract = True


class SortableModel(models.Model):
    # Lower number = shown first. The dashboard can let the owner reorder items.
    sorting_order = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True


# Only real image files may be uploaded to a project (no PDF, Word, video, etc.).
# The extension is checked here; ImageField additionally opens the file with Pillow,
# so a PDF renamed to "photo.jpg" is rejected as well.
IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp"]
validate_image_extension = FileExtensionValidator(
    allowed_extensions=IMAGE_EXTENSIONS,
    message="Only image files are allowed (%(allowed_extensions)s). \"%(extension)s\" files are not accepted.",
)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
class User(TimeStampedModel, AbstractUser):
    """
    AbstractUser already gives us: id, username, email, password (hashed),
    first_name, last_name, is_active, is_staff, is_superuser, last_login...
    We add the extra columns from the sketch: name, phone_no, user_type.
    """

    class UserType(models.TextChoices):
        ADMIN = "admin", "Admin"
        EDITOR = "editor", "Editor"

    email = models.EmailField("email address", unique=True)
    name = models.CharField(max_length=150, blank=True)
    phone_no = models.CharField(max_length=20, blank=True)
    user_type = models.CharField(max_length=10, choices=UserType.choices, default=UserType.EDITOR)

    def __str__(self):
        return self.username


# ---------------------------------------------------------------------------
# Project (+ its gallery images)
# ---------------------------------------------------------------------------
class Project(TimeStampedModel, SortableModel):
    class Status(models.TextChoices):
        CONCEPT = "concept", "Concept"
        DESIGN_PROPOSAL = "design_proposal", "Design proposal"
        UNDER_CONSTRUCTION = "under_construction", "Under construction"
        COMPLETED = "completed", "Completed"

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)  # used in the React URL /projects/<slug>
    # All fields below are mandatory: a project cannot be saved until every one is filled in.
    summary = models.CharField(max_length=400)  # one-line teaser for the list page
    description = models.TextField()  # full text; blank line = new paragraph
    project_type = models.CharField(max_length=100)  # e.g. "Residential"
    storeys = models.CharField(max_length=50)  # e.g. "G + 4"
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.CONCEPT)
    # null=True is kept only so older rows saved without a cover image stay valid in the database
    image = models.ImageField(upload_to="projects/", null=True, validators=[validate_image_extension])  # cover image
    # The "Competition / None" choice on the project form.
    # True  = the project is also shown in the Competitions section.
    # False = the project is shown in the Projects section only.
    # db_default: the database itself fills in False ("None") if a row is inserted without this column
    in_competition = models.BooleanField("show in", default=False, db_default=False)

    class Meta:
        ordering = ["sorting_order", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:  # build a unique slug from the name on first save
            base = slugify(self.name) or "project"
            slug, n = base, 2
            while Project.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug, n = f"{base}-{n}", n + 1
            self.slug = slug
        super().save(*args, **kwargs)
        # Runs after every submission (add or edit). If "Competition" was chosen and this project has no
        # row in the Competition table yet, create one linked by competition.project_id = this project's
        # primary key. If "None" was chosen nothing is deleted: the row is simply hidden from the
        # Competitions section (see Competition.visible) and comes back when "Competition" is chosen again.
        if self.in_competition and not self.competitions.exists():
            Competition.objects.create(
                project=self,
                name=self.name,
                description=self.summary,
                image=self.image.name if self.image else None,  # same file as the project's cover image
                sorting_order=self.sorting_order,
            )

    def __str__(self):
        return self.name


class ProjectImage(SortableModel):
    """Extra views for one project (your React detail page shows 1-4 per project)."""

    project = models.ForeignKey(Project, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="projects/", validators=[validate_image_extension])
    caption = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["sorting_order", "id"]

    def __str__(self):
        return f"{self.project.name} – image {self.pk}"


# ---------------------------------------------------------------------------
# Drawing
# ---------------------------------------------------------------------------
class Drawing(TimeStampedModel, SortableModel):
    class DrawingType(models.TextChoices):
        WATERCOLOUR = "watercolour", "Watercolour"
        INK_WASH = "ink_wash", "Ink & wash"
        PEN_STUDIES = "pen_studies", "Pen studies"
        CONCEPT = "concept", "Concept"

    name = models.CharField(max_length=200)
    drawing_type = models.CharField(max_length=20, choices=DrawingType.choices)
    image = models.ImageField(upload_to="drawings/", blank=True, null=True)

    class Meta:
        ordering = ["sorting_order", "-created_at"]

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Photography
# ---------------------------------------------------------------------------
class Photography(TimeStampedModel, SortableModel):
    class PhotographyType(models.TextChoices):
        COLOUR = "colour", "Colour"
        MONOCHROME = "monochrome", "Monochrome"

    name = models.CharField(max_length=200)
    photography_type = models.CharField(max_length=20, choices=PhotographyType.choices)
    image = models.ImageField(upload_to="photography/", blank=True, null=True)

    class Meta:
        ordering = ["sorting_order", "-created_at"]
        verbose_name_plural = "photography"

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Interior design  (design_type is a lookup table, as in your sketch)
# ---------------------------------------------------------------------------
class InteriorDesignType(models.Model):
    """lkp_Interior_design_type: id (= Designtypeid), name, status (True/False)."""

    name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)  # True = active / selectable

    class Meta:
        db_table = "lkp_interior_design_type"  # keep the table name from the sketch
        ordering = ["name"]

    def __str__(self):
        return self.name


class InteriorDesign(TimeStampedModel, SortableModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    # PROTECT: you cannot delete a type while designs still use it
    design_type = models.ForeignKey(InteriorDesignType, related_name="designs", on_delete=models.PROTECT)
    image = models.ImageField(upload_to="interiors/", blank=True, null=True)

    class Meta:
        ordering = ["sorting_order", "-created_at"]

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Professional  (the people shown on the "Our Professionals" page)
# ---------------------------------------------------------------------------
class Professional(TimeStampedModel, SortableModel):
    """A member of the studio. One row = one full profile section on the public page."""

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True, blank=True)
    designation = models.CharField(max_length=150)  # e.g. "Principal Architect"
    photo = models.ImageField(upload_to="professionals/", blank=True, null=True, validators=[validate_image_extension])

    # Short line under the name on the card / section head
    tagline = models.CharField(max_length=250, blank=True)
    # Full text. A blank line starts a new paragraph (same convention as Project.description).
    bio = models.TextField(blank=True)

    qualifications = models.CharField(max_length=300, blank=True)  # e.g. "B.Arch (BUET), M.Arch (NUS)"
    specialization = models.CharField(max_length=300, blank=True)  # e.g. "Residential · Heritage reuse"
    experience = models.CharField(max_length=100, blank=True)  # e.g. "12 years"
    location = models.CharField(max_length=150, blank=True)

    email = models.EmailField(blank=True)
    phone_no = models.CharField(max_length=30, blank=True)
    linkedin = models.URLField(blank=True)
    website = models.URLField(blank=True)

    is_active = models.BooleanField(default=True)  # False = hidden from the public page

    class Meta:
        ordering = ["sorting_order", "id"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or "professional"
            slug, n = base, 2
            while Professional.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug, n = f"{base}-{n}", n + 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} — {self.designation}"


class ProfessionalExpertise(SortableModel):
    """One bullet in the "Areas of expertise" list of a professional."""

    professional = models.ForeignKey(Professional, related_name="expertise", on_delete=models.CASCADE)
    label = models.CharField(max_length=120)

    class Meta:
        ordering = ["sorting_order", "id"]

    def __str__(self):
        return self.label


# ---------------------------------------------------------------------------
# Contact  (studio contact details shown on the Contact page)
# ---------------------------------------------------------------------------
class Contact(models.Model):
    address = models.CharField(max_length=300)
    email = models.EmailField()
    phone_no = models.CharField(max_length=30)
    # What the map pin points at, when that is not simply the address above:
    # "lat,lng" coordinates (most precise) or any Google Maps search text.
    # Left blank, the map falls back to searching for `address`.
    map_location = models.CharField(max_length=300, blank=True)

    def __str__(self):
        return self.email


class ContactMessage(TimeStampedModel):
    """One submission from the "Send us a message" form on the Contact page."""

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone_no = models.CharField(max_length=30, blank=True)
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.subject or 'no subject'}"


# ---------------------------------------------------------------------------
# Competition  (the sketch has no fields yet – this is a starter you can edit)
# ---------------------------------------------------------------------------
class Competition(TimeStampedModel, SortableModel):
    name = models.CharField(max_length=200)
    # Foreign key to the Project table (stored as project_id = the project's primary key).
    # A row is created here automatically when a project is saved with "Competition" chosen (see Project.save).
    # Required in the admin form. CASCADE: deleting a project also deletes its competition row(s)
    # (and the awards inside them), so nothing of a deleted project is left in the Competitions section.
    project = models.ForeignKey(Project, related_name="competitions", on_delete=models.CASCADE, null=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="competitions/", blank=True, null=True)

    class Meta:
        ordering = ["sorting_order", "-created_at"]

    @classmethod
    def visible(cls):
        """Rows shown in the Competitions section: the project chose "Competition" (or the row has no project)."""
        return cls.objects.filter(models.Q(project__isnull=True) | models.Q(project__in_competition=True))

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Picking a project here is the mirror image of choosing "Competition" on the project form:
        # both mean "this project belongs in the Competitions section". Without the flag this row
        # would be filtered out by visible() and disappear the moment it was saved.
        # update() is used rather than project.save() so Project.save() does not run and add a second row.
        if self.project_id:
            Project.objects.filter(pk=self.project_id, in_competition=False).update(in_competition=True)

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Competition award  (links a competition to a project that won a prize in it)
# ---------------------------------------------------------------------------
class CompetitionAward(SortableModel):
    competition = models.ForeignKey(Competition, related_name="awards", on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name="awards", on_delete=models.CASCADE)
    prize = models.CharField(max_length=100)  # e.g. "1st Prize", "Honourable mention"

    class Meta:
        ordering = ["sorting_order", "id"]
        unique_together = ("competition", "project")

    def __str__(self):
        return f"{self.project.name} - {self.prize} ({self.competition.name})"


# ---------------------------------------------------------------------------
# Keep Project.in_competition (boolean) in step with the Competition table (foreign key)
# ---------------------------------------------------------------------------
@receiver(post_delete, sender=Competition)
def clear_competition_flag(sender, instance, **kwargs):
    """
    When a project's last Competition row is deleted, switch the project back to "None".
    Without this the project would still say "Competition" while nothing is shown in the Competitions section.
    Runs for every kind of delete (admin, API, shell). It uses update(), not save(), so no new row is created.
    """
    if instance.project_id and not Competition.objects.filter(project_id=instance.project_id).exists():
        Project.objects.filter(pk=instance.project_id, in_competition=True).update(in_competition=False)
