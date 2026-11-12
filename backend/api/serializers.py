from rest_framework import serializers
from .models import Portfolio, Project, BlogPost, ContactMessage

class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model"""
    class Meta:
        model = Project
        fields = [
            'id', 'portfolio', 'title', 'description', 'technologies', 'image_url', 
            'project_url', 'github_url', 'featured', 'is_live', 'stars', 'forks',
            'source', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class PortfolioSerializer(serializers.ModelSerializer):
    """Full Serializer for Portfolio model including nested projects"""
    projects = ProjectSerializer(many=True, required=False)

    class Meta:
        model = Portfolio
        fields = [
            'id', 'username', 'full_name', 'display_name', 'greeting', 'titles',
            'short_bio', 'detailed_bio', 'quote', 'about_highlights', 'profile_image', 'background_image',
            'background_settings', 'home_typography', 'appearance', 'sections_visibility',
            'education', 'skills_categories', 'certifications', 'custom_section', 'social_links',
            'is_published', 'created_at', 'updated_at', 'projects'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        projects_data = validated_data.pop('projects', [])
        portfolio = Portfolio.objects.create(**validated_data)
        for idx, project_data in enumerate(projects_data):
            project_data.setdefault('order', idx)
            Project.objects.create(portfolio=portfolio, **project_data)
        return portfolio

    def update(self, instance, validated_data):
        projects_data = validated_data.pop('projects', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if projects_data is not None:
            instance.projects.all().delete()
            for idx, project_data in enumerate(projects_data):
                project_data.setdefault('order', idx)
                project_data.pop('portfolio', None)
                Project.objects.create(portfolio=instance, **project_data)

        return instance

class PortfolioListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing portfolios"""
    class Meta:
        model = Portfolio
        fields = ['id', 'username', 'full_name', 'display_name', 'is_published', 'created_at']

class BlogPostSerializer(serializers.ModelSerializer):
    """Serializer for BlogPost model"""
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'author', 
            'published_date', 'tags', 'featured_image_url', 'published', 
            'created_at', 'updated_at'
        ]

class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for blog post lists (without full content)"""
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author', 
            'published_date', 'tags', 'featured_image_url'
        ]

class ContactMessageSerializer(serializers.ModelSerializer):
    """Serializer for ContactMessage model"""
    class Meta:
        model = ContactMessage
        fields = ['id', 'portfolio', 'recipient_email', 'name', 'email', 'subject', 'message', 'created_at', 'read']
        read_only_fields = ['id', 'created_at', 'read']
