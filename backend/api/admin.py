from django.contrib import admin
from .models import Portfolio, Project, BlogPost, ContactMessage

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'username', 'is_published', 'created_at', 'updated_at']
    list_filter = ['is_published', 'created_at']
    search_fields = ['full_name', 'username', 'short_bio']
    prepopulated_fields = {'username': ('full_name',)}

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'portfolio', 'featured', 'is_live', 'order', 'created_at']
    list_filter = ['featured', 'is_live', 'portfolio', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['featured', 'is_live', 'order']
    ordering = ['-featured', 'order', '-created_at']

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'published_date', 'published']
    list_filter = ['published', 'published_date', 'author']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['published']
    ordering = ['-published_date']

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'portfolio', 'created_at', 'read']
    list_filter = ['read', 'created_at', 'portfolio']
    search_fields = ['name', 'email', 'subject', 'message']
    list_editable = ['read']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
