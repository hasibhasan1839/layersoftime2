from django.db import migrations


def add_award(apps, schema_editor):
    Project = apps.get_model("api", "Project")
    Competition = apps.get_model("api", "Competition")
    CompetitionAward = apps.get_model("api", "CompetitionAward")

    project = Project.objects.filter(name="Building 1").first()
    if project is None:
        return
    competition = Competition.objects.first() or Competition.objects.create(
        name="Sample Design Competition",
        description="Placeholder competition - edit the name and description in the admin.",
    )
    CompetitionAward.objects.get_or_create(
        competition=competition, project=project, defaults={"prize": "1st Prize"}
    )


def remove_award(apps, schema_editor):
    apps.get_model("api", "CompetitionAward").objects.filter(
        project__name="Building 1", prize="1st Prize"
    ).delete()


class Migration(migrations.Migration):
    dependencies = [("api", "0002_competition_award")]
    operations = [migrations.RunPython(add_award, remove_award)]
