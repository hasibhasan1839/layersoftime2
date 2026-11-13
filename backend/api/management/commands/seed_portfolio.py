"""
Import the content that is currently hard-coded in the React app (src/data.js)
into the database, including copying the image files into media/.

    python manage.py seed_portfolio

Safe to run more than once: anything that already exists is skipped.
Data lives in seed_data.json (generated from src/data.js) next to this file.
"""

import json
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from api.models import Contact, Drawing, Photography, Project, ProjectImage

IMAGES_DIR = Path(settings.BASE_DIR).parent / "public" / "images"  # the React app's images


def label_to_value(choices_class):
    """{'Ink & wash': 'ink_wash', ...} so the JSON can use the labels shown on the site."""
    return {label: value for value, label in choices_class.choices}


def attach(instance, field_name, relative_path):
    """Copy a file from public/images into the model's ImageField (-> media/)."""
    source = IMAGES_DIR / relative_path
    with open(source, "rb") as handle:
        getattr(instance, field_name).save(source.name, File(handle), save=True)


class Command(BaseCommand):
    help = "Load the existing portfolio content (projects, drawings, photography, contact)."

    def handle(self, *args, **options):
        data = json.loads((Path(__file__).parent / "seed_data.json").read_text(encoding="utf-8"))

        if not IMAGES_DIR.exists():
            self.stderr.write(f"Images folder not found: {IMAGES_DIR}")
            return

        # --- Contact
        contact, created = Contact.objects.get_or_create(email=data["contact"]["email"], defaults=data["contact"])
        self.stdout.write(f"Contact: {'created' if created else 'already there'}")

        # --- Projects: first image = cover, the rest = gallery (ProjectImage rows)
        statuses = label_to_value(Project.Status)
        added = 0
        for order, item in enumerate(data["projects"]):
            if Project.objects.filter(slug=item["slug"]).exists():
                continue
            project = Project.objects.create(
                name=item["name"], slug=item["slug"], summary=item["summary"],
                description=item["description"], project_type=item["project_type"],
                storeys=item["storeys"], status=statuses[item["status"]], sorting_order=order,
            )
            cover, *gallery = item["images"]
            attach(project, "image", cover)
            for position, path in enumerate(gallery):
                extra = ProjectImage(project=project, sorting_order=position)
                attach(extra, "image", path)
            added += 1
        self.stdout.write(f"Projects: {added} added")

        # --- Drawings
        types = label_to_value(Drawing.DrawingType)
        added = 0
        for order, item in enumerate(data["drawings"]):
            if Drawing.objects.filter(name=item["name"]).exists():
                continue
            drawing = Drawing.objects.create(name=item["name"], drawing_type=types[item["type"]], sorting_order=order)
            attach(drawing, "image", item["image"])
            added += 1
        self.stdout.write(f"Drawings: {added} added")

        # --- Photography
        types = label_to_value(Photography.PhotographyType)
        added = 0
        for order, item in enumerate(data["photographs"]):
            if Photography.objects.filter(name=item["name"]).exists():
                continue
            photo = Photography.objects.create(name=item["name"], photography_type=types[item["type"]], sorting_order=order)
            attach(photo, "image", item["image"])
            added += 1
        self.stdout.write(f"Photography: {added} added")

        self.stdout.write(self.style.SUCCESS("Done."))
