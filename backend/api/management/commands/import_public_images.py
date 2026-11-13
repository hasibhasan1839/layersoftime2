"""
Import the images that live in frontend/public (Project/, Drawing/, photography/)
into the database + media/ folder, so the API serves real image URLs.

    python manage.py import_public_images

Safe to re-run: items that already exist (by name) are skipped.
Edit names / types / descriptions afterwards in the Django admin.
"""

import re
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from api.models import Drawing, Photography, Project, ProjectImage

PUBLIC = Path(settings.BASE_DIR).parent / "frontend" / "public"


def natural_key(path):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", path.stem)]


def attach(instance, path):
    with open(path, "rb") as handle:
        instance.image.save(path.name.replace(" ", "_"), File(handle), save=True)


class Command(BaseCommand):
    help = "Import frontend/public images as Projects, Drawings and Photography."

    def handle(self, *args, **options):
        if not PUBLIC.exists():
            self.stderr.write(f"Not found: {PUBLIC}")
            return

        # --- Projects: "Building1.2.jpeg" / "building1.jpeg" -> group "1"
        groups = {}
        for path in (PUBLIC / "Project").glob("*"):
            match = re.search(r"(\d+)", path.stem)
            if match:
                groups.setdefault(int(match.group(1)), []).append(path)
        added = 0
        for number in sorted(groups):
            name = f"Building {number}"
            if Project.objects.filter(name=name).exists():
                continue
            files = sorted(groups[number], key=natural_key)
            project = Project.objects.create(name=name, project_type="Building", sorting_order=number)
            attach(project, files[0])  # first file = cover
            for position, path in enumerate(files[1:]):
                extra = ProjectImage(project=project, sorting_order=position)
                attach(extra, path)
            added += 1
        self.stdout.write(f"Projects: {added} added")

        # --- Drawings
        added = 0
        for path in sorted((PUBLIC / "Drawing").glob("*"), key=natural_key):
            name = f"Drawing {path.stem}"
            if Drawing.objects.filter(name=name).exists():
                continue
            drawing = Drawing.objects.create(
                name=name, drawing_type=Drawing.DrawingType.WATERCOLOUR, sorting_order=int(path.stem)
            )
            attach(drawing, path)
            added += 1
        self.stdout.write(f"Drawings: {added} added")

        # --- Photography
        added = 0
        for path in sorted((PUBLIC / "photography").glob("*"), key=natural_key):
            name = f"Photograph {path.stem}"
            if Photography.objects.filter(name=name).exists():
                continue
            photo = Photography.objects.create(
                name=name, photography_type=Photography.PhotographyType.COLOUR, sorting_order=int(path.stem)
            )
            attach(photo, path)
            added += 1
        self.stdout.write(f"Photography: {added} added")

        self.stdout.write(self.style.SUCCESS("Done."))
