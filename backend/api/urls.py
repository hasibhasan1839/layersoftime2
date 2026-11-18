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
router.register("contact-messages", views.ContactMessageViewSet)
router.register("professionals", views.ProfessionalViewSet)
router.register("users", views.UserViewSet)

urlpatterns = [
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.me, name="auth_me"),
    path("auth/change-password/", views.change_password, name="change_password"),
    path("projects/<int:project_pk>/images/", views.ProjectImageViewSet.as_view({'get': 'list', 'post': 'create'}), name="project-images-list"),
    path("projects/<int:project_pk>/images/<int:pk>/", views.ProjectImageViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name="project-images-detail"),
    path("professionals/<int:professional_pk>/expertise/", views.ProfessionalExpertiseViewSet.as_view({'get': 'list', 'post': 'create'}), name="professional-expertise-list"),
    path("professionals/<int:professional_pk>/expertise/<int:pk>/", views.ProfessionalExpertiseViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name="professional-expertise-detail"),
    path("", include(router.urls)),
]
