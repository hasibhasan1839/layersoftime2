from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register("projects", views.ProjectViewSet)
router.register("drawings", views.DrawingViewSet)
router.register("photography", views.PhotographyViewSet)
router.register("interior-design-types", views.InteriorDesignTypeViewSet)
router.register("interior-designs", views.InteriorDesignViewSet)
router.register("competitions", views.CompetitionViewSet)
router.register("contacts", views.ContactViewSet)

urlpatterns = [
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
]
