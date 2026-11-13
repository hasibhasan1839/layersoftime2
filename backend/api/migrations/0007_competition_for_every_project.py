from django.db import migrations


def add_missing_competitions(apps, schema_editor):
    """Projects that were added before the automatic link existed get their Competition row now."""
    Project = apps.get_model("api", "Project")
    Competition = apps.get_model("api", "Competition")
    linked = set(Competition.objects.exclude(project__isnull=True).values_list("project_id", flat=True))
    for project in Project.objects.exclude(pk__in=linked).order_by("pk"):
        Competition.objects.create(
            project=project,
            name=project.name,
            description=project.summary,
            image=project.image.name if project.image else None,
            sorting_order=project.sorting_order,
        )


class Migration(migrations.Migration):
    dependencies = [("api", "0006_competition_project")]
    # Reverse is a no-op on purpose: undoing this migration never deletes competition rows.
    operations = [migrations.RunPython(add_missing_competitions, migrations.RunPython.noop)]
