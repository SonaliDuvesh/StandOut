import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Portfolio, Project, BlogPost, ContactMessage
from .serializers import (
    PortfolioSerializer, PortfolioListSerializer,
    ProjectSerializer, BlogPostSerializer,
    BlogPostListSerializer, ContactMessageSerializer
)

class PortfolioViewSet(viewsets.ModelViewSet):
    """
    API endpoint for customizable portfolios.
    Lookup supports both username (slug) and numeric id.
    """
    queryset = Portfolio.objects.all().prefetch_related('projects')
    lookup_field = 'username'

    def get_serializer_class(self):
        if self.action == 'list':
            return PortfolioListSerializer
        return PortfolioSerializer

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        try:
            if lookup_value.isdigit():
                return self.queryset.get(id=lookup_value)
            return self.queryset.get(username__iexact=lookup_value)
        except Portfolio.DoesNotExist:
            return None

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            if self.queryset.count() == 1:
                instance = self.queryset.first()
            else:
                return Response(
                    {"detail": "Portfolio not found for this username."},
                    status=status.HTTP_404_NOT_FOUND
                )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            portfolio_id = request.data.get('id')
            if portfolio_id:
                try:
                    instance = self.queryset.get(id=portfolio_id)
                except Portfolio.DoesNotExist:
                    instance = None
            if instance is None and self.queryset.count() == 1:
                instance = self.queryset.first()

        new_username = request.data.get('username') or kwargs.get(self.lookup_field) or 'username'

        if instance is None:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(username=new_username)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(username=new_username)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get the default or first published portfolio"""
        portfolio = self.queryset.filter(username__iexact='username').first()
        if not portfolio:
            portfolio = self.queryset.filter(is_published=True).first()
        if not portfolio:
            portfolio = self.queryset.first()
        if not portfolio:
            return Response({"detail": "No portfolio available."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data)

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint for projects.
    Provides list, create, update, delete, and featured filter.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        username = self.request.query_params.get('username')
        if username:
            qs = qs.filter(portfolio__username__iexact=username)
        return qs

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured projects only"""
        featured_projects = self.get_queryset().filter(featured=True)
        serializer = self.get_serializer(featured_projects, many=True)
        return Response(serializer.data)

class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for blog posts
    """
    queryset = BlogPost.objects.filter(published=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer
    
    def retrieve(self, request, *args, **kwargs):
        lookup_value = kwargs.get('pk')
        try:
            if lookup_value.isdigit():
                instance = self.queryset.get(id=lookup_value)
            else:
                instance = self.queryset.get(slug=lookup_value)
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except BlogPost.DoesNotExist:
            return Response(
                {"detail": "Blog post not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def recent(self, request):
        recent_posts = BlogPost.objects.filter(published=True)[:5]
        serializer = BlogPostListSerializer(recent_posts, many=True)
        return Response(serializer.data)

class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for contact messages.
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Thank you for your message! I'll get back to you soon."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FileUploadView(APIView):
    """
    Secure file upload view for images (backgrounds, project screenshots, avatars, certs)
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        if file_obj.size > 10 * 1024 * 1024:
            return Response({"error": "File size exceeds 10MB limit"}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(file_obj.name)[1].lower()
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']
        if ext not in allowed_extensions:
            return Response(
                {"error": f"Invalid file type {ext}. Allowed: JPG, PNG, WebP, SVG, GIF"},
                status=status.HTTP_400_BAD_REQUEST
            )

        unique_name = f"{uuid.uuid4().hex}{ext}"
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, unique_name)
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        file_url = f"{settings.MEDIA_URL}uploads/{unique_name}"
        return Response({
            "url": file_url,
            "filename": unique_name,
            "size": file_obj.size
        }, status=status.HTTP_201_CREATED)
