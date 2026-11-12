from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, ProjectViewSet, BlogPostViewSet, ContactMessageViewSet, FileUploadView

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'blog', BlogPostViewSet, basename='blogpost')
router.register(r'contact', ContactMessageViewSet, basename='contact')

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('', include(router.urls)),
]
