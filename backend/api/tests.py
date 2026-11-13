import io
import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from django.db import IntegrityError, connection, transaction
from django.db.models import ProtectedError

from .models import (
    Competition, CompetitionAward, Drawing, InteriorDesign, InteriorDesignType, Project, ProjectImage, User,
)

TEMP_MEDIA = tempfile.mkdtemp()


def make_image(name="test.jpg"):
    """Build a tiny real JPEG in memory so ImageField validation passes."""
    buffer = io.BytesIO()
    Image.new("RGB", (10, 10), "white").save(buffer, "JPEG")
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/jpeg")


@override_settings(MEDIA_ROOT=TEMP_MEDIA)  # uploaded test files go to a temp folder, not ./media
class ApiTestCase(APITestCase):
    PASSWORD = "Str0ng-pass-123"

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA, ignore_errors=True)

    def setUp(self):
        self.user = User.objects.create_user(
            username="hasan", email="hasan@example.com", password=self.PASSWORD, name="Hasan"
        )

    def login(self):
        """Log in through the real endpoint and attach the token to later requests."""
        response = self.client.post("/api/auth/login/", {"username": "hasan", "password": self.PASSWORD})
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {response.data['token']}")
        return response.data["token"]


# ---------------------------------------------------------------- auth
class AuthTests(ApiTestCase):
    def test_login_returns_token_and_user(self):
        response = self.client.post("/api/auth/login/", {"username": "hasan", "password": self.PASSWORD})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["email"], "hasan@example.com")
        self.assertNotIn("password", response.data["user"])

    def test_login_with_email_works(self):
        response = self.client.post("/api/auth/login/", {"username": "hasan@example.com", "password": self.PASSWORD})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_wrong_password_rejected(self):
        response = self.client.post("/api/auth/login/", {"username": "hasan", "password": "nope"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_login(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, status.HTTP_401_UNAUTHORIZED)
        self.login()
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.data["username"], "hasan")

    def test_logout_invalidates_token(self):
        self.login()
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Token.objects.filter(user=self.user).exists())
        self.assertEqual(self.client.get("/api/auth/me/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_change(self):
        old_token = self.login()
        response = self.client.post(
            "/api/auth/password-change/",
            {"old_password": self.PASSWORD, "new_password": "An0ther-strong-pass"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data["token"], old_token)  # token was rotated

        self.client.credentials()  # forget credentials
        bad = self.client.post("/api/auth/login/", {"username": "hasan", "password": self.PASSWORD})
        good = self.client.post("/api/auth/login/", {"username": "hasan", "password": "An0ther-strong-pass"})
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(good.status_code, status.HTTP_200_OK)

    def test_password_change_rejects_wrong_old_and_weak_new(self):
        self.login()
        wrong_old = self.client.post(
            "/api/auth/password-change/", {"old_password": "bad", "new_password": "An0ther-strong-pass"}
        )
        weak_new = self.client.post(
            "/api/auth/password-change/", {"old_password": self.PASSWORD, "new_password": "123"}
        )
        self.assertEqual(wrong_old.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(weak_new.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------- permissions & CRUD
class ProjectTests(ApiTestCase):
    def test_public_can_read_but_not_write(self):
        self.assertEqual(self.client.get("/api/projects/").status_code, status.HTTP_200_OK)
        response = self.client.post("/api/projects/", {"name": "Hack"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_generates_unique_slugs(self):
        self.login()
        first = self.client.post("/api/projects/", {"name": "Oculus House", "storeys": "G + 4"})
        second = self.client.post("/api/projects/", {"name": "Oculus House"})
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(first.data["slug"], "oculus-house")
        self.assertEqual(second.data["slug"], "oculus-house-2")
        self.assertEqual(first.data["status_display"], "Concept")  # the default status

    def test_update_and_delete(self):
        self.login()
        project = Project.objects.create(name="Old name")
        patch = self.client.patch(f"/api/projects/{project.id}/", {"name": "New name"})
        self.assertEqual(patch.data["name"], "New name")
        self.assertEqual(patch.data["slug"], "old-name")  # slug stays stable on rename
        self.assertEqual(self.client.delete(f"/api/projects/{project.id}/").status_code, 204)
        self.assertFalse(Project.objects.filter(pk=project.id).exists())

    def test_image_upload_and_nested_gallery(self):
        self.login()
        created = self.client.post(
            "/api/projects/", {"name": "With cover", "image": make_image("cover.jpg")}, format="multipart"
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertTrue(created.data["image"].startswith("http://testserver/media/projects/"))

        extra = self.client.post(
            "/api/project-images/",
            {"project": created.data["id"], "image": make_image("v2.jpg"), "caption": "View 2"},
            format="multipart",
        )
        self.assertEqual(extra.status_code, status.HTTP_201_CREATED)

        detail = self.client.get(f"/api/projects/{created.data['id']}/")
        self.assertEqual(len(detail.data["images"]), 1)
        self.assertEqual(detail.data["images"][0]["caption"], "View 2")

    def test_non_image_upload_rejected(self):
        self.login()
        fake = SimpleUploadedFile("evil.jpg", b"not an image", content_type="image/jpeg")
        response = self.client.post("/api/projects/", {"name": "Bad", "image": fake}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class OtherContentTests(ApiTestCase):
    def test_drawing_filter_and_ordering(self):
        Drawing.objects.create(name="B", drawing_type="watercolour", sorting_order=2)
        Drawing.objects.create(name="A", drawing_type="watercolour", sorting_order=1)
        Drawing.objects.create(name="C", drawing_type="concept", sorting_order=0)

        response = self.client.get("/api/drawings/?drawing_type=watercolour")
        self.assertEqual([d["name"] for d in response.data], ["A", "B"])  # sorted by sorting_order
        self.assertEqual(response.data[0]["drawing_type_display"], "Watercolour")

    def test_interior_design_rejects_inactive_type(self):
        self.login()
        active = InteriorDesignType.objects.create(name="Minimal", status=True)
        inactive = InteriorDesignType.objects.create(name="Retired", status=False)

        ok = self.client.post("/api/interior-designs/", {"name": "Flat 4B", "design_type": active.id})
        bad = self.client.post("/api/interior-designs/", {"name": "Flat 5A", "design_type": inactive.id})
        self.assertEqual(ok.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ok.data["design_type_name"], "Minimal")
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_stats_need_login(self):
        self.assertEqual(self.client.get("/api/dashboard/stats/").status_code, status.HTTP_401_UNAUTHORIZED)
        self.login()
        Drawing.objects.create(name="A", drawing_type="concept")
        response = self.client.get("/api/dashboard/stats/")
        self.assertEqual(response.data["drawings"], 1)
        self.assertEqual(response.data["projects"], 0)


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class ProjectAdminTests(APITestCase):
    """The /admin/api/project/add/ page: required fields, image-only uploads, multi-image gallery upload."""

    ADD_URL = "/admin/api/project/add/"

    def setUp(self):
        admin_user = User.objects.create_superuser("boss", "boss@example.com", "Str0ng-pass-123")
        self.client.force_login(admin_user)

    def payload(self, **extra):
        data = {
            "name": "Villa", "slug": "villa", "summary": "s", "description": "d", "project_type": "Residential",
            "storeys": "G + 2", "status": "concept", "sorting_order": "0", "image": make_image("cover.jpg"),
            "in_competition": "False",
            "images-TOTAL_FORMS": "0", "images-INITIAL_FORMS": "0",
            "awards-TOTAL_FORMS": "0", "awards-INITIAL_FORMS": "0",
        }
        data.update(extra)
        return data

    def test_add_page_has_multi_image_picker_in_images_section(self):
        html = self.client.get(self.ADD_URL).content.decode()
        self.assertIn('name="gallery_images"', html)
        self.assertIn("multiple", html.split('name="gallery_images"')[1].split(">")[0])
        self.assertEqual(html.count('name="gallery_images"'), 1)  # only in the images section, not on top

    def test_several_gallery_images_are_saved_at_once(self):
        files = [make_image("a.jpg"), make_image("b.jpg"), make_image("c.jpg")]
        response = self.client.post(self.ADD_URL, self.payload(gallery_images=files))
        self.assertEqual(response.status_code, 302)
        project = Project.objects.get(slug="villa")
        self.assertEqual(project.images.count(), 3)
        self.assertEqual(list(project.images.values_list("sorting_order", flat=True)), [0, 1, 2])

    def test_more_images_can_be_added_later_on_the_edit_page(self):
        self.client.post(self.ADD_URL, self.payload(gallery_images=[make_image("a.jpg")]))
        project = Project.objects.get(slug="villa")
        first = project.images.get()
        data = self.payload(gallery_images=[make_image("b.jpg"), make_image("c.jpg")])
        data.update({
            "images-TOTAL_FORMS": "1", "images-INITIAL_FORMS": "1",
            "images-0-id": str(first.pk), "images-0-project": str(project.pk),
            "images-0-sorting_order": "0", "images-0-caption": "",
        })
        response = self.client.post(f"/admin/api/project/{project.pk}/change/", data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(list(project.images.values_list("sorting_order", flat=True)), [0, 1, 2])

    def test_non_image_in_gallery_blocks_the_whole_submit(self):
        pdf = SimpleUploadedFile("plan.pdf", b"%PDF-1.4 not an image", content_type="application/pdf")
        response = self.client.post(self.ADD_URL, self.payload(gallery_images=[make_image("a.jpg"), pdf]))
        self.assertEqual(response.status_code, 200)  # form shown again with an error
        self.assertContains(response, "plan.pdf")
        self.assertFalse(Project.objects.exists())

    def test_gallery_images_are_optional(self):
        response = self.client.post(self.ADD_URL, self.payload())
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Project.objects.get(slug="villa").images.count(), 0)

    def test_missing_required_field_is_not_saved(self):
        response = self.client.post(self.ADD_URL, self.payload(summary=""))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Project.objects.exists())

    def test_pdf_cover_image_is_rejected(self):
        pdf = SimpleUploadedFile("cover.pdf", b"%PDF-1.4 not an image", content_type="application/pdf")
        response = self.client.post(self.ADD_URL, self.payload(image=pdf))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Project.objects.exists())


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class CompetitionChoiceTests(APITestCase):
    """The "Show in: Competition / None" buttons on the project form decide what the Competitions section shows."""

    PROJECT_ADD = "/admin/api/project/add/"

    def setUp(self):
        self.client.force_login(User.objects.create_superuser("boss", "boss@example.com", "Str0ng-pass-123"))

    def project_payload(self, name, choice, **extra):
        data = {
            "name": name, "slug": name.lower(), "summary": "s", "description": "d", "project_type": "Residential",
            "storeys": "G + 2", "status": "concept", "sorting_order": "0", "image": make_image("cover.jpg"),
            "images-TOTAL_FORMS": "0", "images-INITIAL_FORMS": "0",
            "awards-TOTAL_FORMS": "0", "awards-INITIAL_FORMS": "0",
        }
        if choice is not None:
            data["in_competition"] = choice
        data.update(extra)
        return data

    def add_project(self, name, choice):
        response = self.client.post(self.PROJECT_ADD, self.project_payload(name, choice))
        self.assertEqual(response.status_code, 302, response.content.decode()[:300] if response.status_code != 302 else "")
        return Project.objects.get(slug=name.lower())

    def admin_competition_names(self):
        """Names of the rows listed on the admin Competitions page."""
        changelist = self.client.get("/admin/api/competition/").context["cl"]
        return [competition.name for competition in changelist.result_list]

    def api_rows(self, url):
        rows = self.client.get(url).json()
        return rows["results"] if isinstance(rows, dict) else rows

    def test_form_shows_two_buttons_with_nothing_preselected(self):
        html = self.client.get(self.PROJECT_ADD).content.decode()
        self.assertEqual(html.count('type="radio" name="in_competition"'), 2)
        self.assertIn("Competition", html)
        self.assertIn("None", html)
        self.assertNotIn("checked", "".join(part.split(">")[0] for part in html.split('name="in_competition"')[1:]))

    def test_a_button_must_be_clicked(self):
        response = self.client.post(self.PROJECT_ADD, self.project_payload("Villa", None))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Project.objects.exists())

    def test_competition_choice_shows_project_in_competitions(self):
        tower = self.add_project("Tower", "True")
        self.assertTrue(tower.in_competition)
        competition = Competition.objects.get()
        self.assertEqual(competition.project_id, tower.pk)  # linked by the project's primary key
        self.assertEqual(competition.name, "Tower")
        self.assertEqual(self.admin_competition_names(), ["Tower"])
        rows = self.api_rows("/api/competitions/")
        self.assertEqual([row["project"] for row in rows], [tower.pk])
        self.assertEqual(rows[0]["project_detail"]["slug"], "tower")
        self.assertEqual([row["slug"] for row in self.api_rows("/api/projects/")], ["tower"])  # still in Projects

    def test_none_choice_shows_project_in_projects_only(self):
        villa = self.add_project("Villa", "False")
        self.assertFalse(villa.in_competition)
        self.assertFalse(Competition.objects.exists())
        self.assertEqual(self.api_rows("/api/competitions/"), [])
        self.assertEqual(self.admin_competition_names(), [])
        self.assertEqual([row["slug"] for row in self.api_rows("/api/projects/")], ["villa"])

    def change_choice(self, project, choice):
        data = self.project_payload(project.name, choice, slug=project.slug)
        response = self.client.post(f"/admin/api/project/{project.pk}/change/", data)
        self.assertEqual(response.status_code, 302)

    def test_switching_none_to_competition_and_back(self):
        villa = self.add_project("Villa", "False")
        self.change_choice(villa, "True")  # None -> Competition: now shown
        self.assertEqual([row["project"] for row in self.api_rows("/api/competitions/")], [villa.pk])
        self.change_choice(villa, "False")  # Competition -> None: hidden, but the row is kept
        self.assertEqual(self.api_rows("/api/competitions/"), [])
        self.assertEqual(self.admin_competition_names(), [])
        self.assertEqual(Competition.objects.count(), 1)
        self.change_choice(villa, "True")  # back again: same row returns, no duplicate
        self.assertEqual(len(self.api_rows("/api/competitions/")), 1)
        self.assertEqual(Competition.objects.count(), 1)

    def test_competition_form_only_offers_competition_projects(self):
        tower = self.add_project("Tower", "True")
        villa = self.add_project("Villa", "False")
        html = self.client.get("/admin/api/competition/add/").content.decode()
        self.assertIn(f'<option value="{tower.pk}">Tower</option>', html)
        self.assertNotIn(f'<option value="{villa.pk}">Villa</option>', html)

    def test_deleting_project_deletes_it_from_competitions_too(self):
        tower = self.add_project("Tower", "True")
        villa = self.add_project("Villa", "True")
        self.assertEqual(Competition.objects.count(), 2)
        # delete through the admin, the same way it is done from the Projects section
        response = self.client.post(f"/admin/api/project/{tower.pk}/delete/", {"post": "yes"})
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Project.objects.filter(pk=tower.pk).exists())
        self.assertEqual(self.admin_competition_names(), ["Villa"])  # the other project is untouched
        self.assertEqual([row["project"] for row in self.api_rows("/api/competitions/")], [villa.pk])

    def test_deleting_a_none_project_removes_its_hidden_row(self):
        villa = self.add_project("Villa", "True")
        self.change_choice(villa, "False")  # hidden row still exists in the table
        villa.delete()
        self.assertFalse(Competition.objects.exists())


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class RowDeleteButtonTests(APITestCase):
    """Project and Competition list pages: one Delete button per row instead of the Action dropdown."""

    def setUp(self):
        self.client.force_login(User.objects.create_superuser("boss", "boss@example.com", "Str0ng-pass-123"))
        self.project = Project.objects.create(
            name="Tower", summary="s", description="d", project_type="Office", storeys="G + 9",
            image=make_image("cover.jpg"), in_competition=True,
        )
        self.competition = Competition.objects.get(project=self.project)

    def test_each_row_has_a_delete_button_and_action_dropdown_is_gone(self):
        pages = {
            "/admin/api/project/": f"/admin/api/project/{self.project.pk}/delete/",
            "/admin/api/competition/": f"/admin/api/competition/{self.competition.pk}/delete/",
        }
        for list_url, delete_url in pages.items():
            html = self.client.get(list_url).content.decode()
            self.assertIn(f'href="{delete_url}"', html)
            self.assertNotIn('name="action"', html)  # old "delete selected" dropdown
            self.assertNotIn("action-select", html)  # old row checkboxes
            self.assertLess(html.index("column-updated_at"), html.index("column-delete_button"))  # right of Updated at

    def test_button_asks_for_confirmation_then_deletes_only_that_row(self):
        other = Competition.objects.create(name="Other", project=self.project)
        delete_url = f"/admin/api/competition/{self.competition.pk}/delete/"
        self.assertContains(self.client.get(delete_url), "Are you sure")
        self.assertTrue(Competition.objects.filter(pk=self.competition.pk).exists())  # nothing deleted yet
        response = self.client.post(delete_url, {"post": "yes"})
        self.assertRedirects(response, "/admin/api/competition/")
        self.assertEqual(list(Competition.objects.values_list("pk", flat=True)), [other.pk])
        self.assertTrue(Project.objects.filter(pk=self.project.pk).exists())  # the project itself stays


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class RelationshipTests(APITestCase):
    """Foreign keys: CASCADE / PROTECT behaviour, and in_competition staying in step with the Competition table."""

    def setUp(self):
        self.client.force_login(User.objects.create_superuser("boss", "boss@example.com", "Str0ng-pass-123"))

    def make_project(self, name, in_competition=False):
        return Project.objects.create(
            name=name, summary="s", description="d", project_type="Office", storeys="G + 1",
            image=make_image("cover.jpg"), in_competition=in_competition,
        )

    def test_database_has_the_five_foreign_keys(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                select c.conrelid::regclass::text, a.attname, c.confrelid::regclass::text
                from pg_constraint c
                join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
                where c.contype = 'f' and c.conrelid::regclass::text in
                  ('api_projectimage', 'api_competition', 'api_competitionaward', 'api_interiordesign')
            """)
            found = sorted(cursor.fetchall())
        self.assertEqual(found, [
            ("api_competition", "project_id", "api_project"),
            ("api_competitionaward", "competition_id", "api_competition"),
            ("api_competitionaward", "project_id", "api_project"),
            ("api_interiordesign", "design_type_id", "lkp_interior_design_type"),
            ("api_projectimage", "project_id", "api_project"),
        ])

    def test_database_rejects_a_row_pointing_at_a_missing_project(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Competition.objects.create(name="Ghost", project_id=999999)
            connection.check_constraints()

    def test_deleting_project_cascades_to_images_competitions_and_awards(self):
        tower = self.make_project("Tower", in_competition=True)
        villa = self.make_project("Villa", in_competition=True)
        ProjectImage.objects.create(project=tower, image=make_image("a.jpg"))
        ProjectImage.objects.create(project=villa, image=make_image("b.jpg"))
        CompetitionAward.objects.create(competition=tower.competitions.get(), project=tower, prize="1st Prize")
        # an award for Tower inside Villa's competition must go too, but Villa's competition must stay
        CompetitionAward.objects.create(competition=villa.competitions.get(), project=tower, prize="2nd Prize")
        tower.delete()
        self.assertEqual(list(Project.objects.values_list("name", flat=True)), ["Villa"])
        self.assertEqual(list(Competition.objects.values_list("project_id", flat=True)), [villa.pk])
        self.assertEqual(ProjectImage.objects.count(), 1)
        self.assertEqual(CompetitionAward.objects.count(), 0)
        villa.refresh_from_db()
        self.assertTrue(villa.in_competition)  # the other project is untouched

    def test_interior_design_type_in_use_cannot_be_deleted(self):
        kind = InteriorDesignType.objects.create(name="Living room")
        design = InteriorDesign.objects.create(name="Flat 3B", design_type=kind)
        with self.assertRaises(ProtectedError):
            kind.delete()
        self.assertTrue(InteriorDesignType.objects.filter(pk=kind.pk).exists())
        design.delete()
        kind.delete()  # allowed once nothing uses it
        self.assertFalse(InteriorDesignType.objects.exists())

    def test_deleting_the_competition_switches_the_project_back_to_none(self):
        tower = self.make_project("Tower", in_competition=True)
        competition = tower.competitions.get()
        response = self.client.post(f"/admin/api/competition/{competition.pk}/delete/", {"post": "yes"})
        self.assertEqual(response.status_code, 302)
        tower.refresh_from_db()
        self.assertFalse(tower.in_competition)
        self.assertTrue(Project.objects.filter(pk=tower.pk).exists())  # project itself is kept
        tower.save()  # saving the project again must not bring the competition back
        self.assertFalse(Competition.objects.exists())

    def test_flag_stays_on_while_another_competition_row_remains(self):
        tower = self.make_project("Tower", in_competition=True)
        second = Competition.objects.create(name="Second entry", project=tower)
        tower.competitions.exclude(pk=second.pk).delete()
        tower.refresh_from_db()
        self.assertTrue(tower.in_competition)
        second.delete()
        tower.refresh_from_db()
        self.assertFalse(tower.in_competition)

    def test_api_delete_of_competition_also_clears_the_flag(self):
        tower = self.make_project("Tower", in_competition=True)
        response = self.client.delete(f"/api/competitions/{tower.competitions.get().pk}/")
        self.assertEqual(response.status_code, 204)
        tower.refresh_from_db()
        self.assertFalse(tower.in_competition)
