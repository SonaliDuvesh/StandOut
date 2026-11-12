from django.db import models

class Portfolio(models.Model):
    """Model representing a user's customizable portfolio"""
    username = models.SlugField(max_length=100, unique=True)
    full_name = models.CharField(max_length=150, default="Developer Name")
    display_name = models.CharField(max_length=150, default="Developer Name")
    greeting = models.CharField(max_length=100, default="Hi there! I'm")
    titles = models.JSONField(default=list)  # Dynamic typing titles: ['Data Science Student', ...]
    short_bio = models.TextField(blank=True)
    detailed_bio = models.TextField(blank=True)
    profile_image = models.TextField(blank=True)
    background_image = models.TextField(blank=True)
    background_settings = models.JSONField(default=dict)  # { fit: 'cover', position: 'center', overlay: 0.2 }
    
    quote = models.TextField(blank=True, default='"Turning complex challenges into elegant software."')
    about_highlights = models.JSONField(default=list)
    home_typography = models.JSONField(default=dict)
    
    appearance = models.JSONField(default=dict)  # colors, fonts, radius
    sections_visibility = models.JSONField(default=dict)  # { hero: true, about: true, ... }
    
    education = models.JSONField(default=list)  # [ { degree, institution, details } ]
    skills_categories = models.JSONField(default=list)  # [ { id, title, icon, skills: [] } ]
    certifications = models.JSONField(default=list)  # [ { id, title, issuer, issueDate, ... } ]
    custom_section = models.JSONField(default=dict)  # { enabled: true, title: '...', content_blocks: [] }
    social_links = models.JSONField(default=dict)  # { github, linkedin, email, medium, twitter }
    
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['username']

    def __str__(self):
        return f"{self.full_name} (@{self.username})"

class Project(models.Model):
    """Model for portfolio projects"""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='projects', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    technologies = models.JSONField(default=list)  # List of technologies used
    image_url = models.TextField(blank=True)
    project_url = models.TextField(blank=True)
    github_url = models.TextField(blank=True)
    featured = models.BooleanField(default=False)
    is_live = models.BooleanField(default=False)
    stars = models.IntegerField(default=0)
    forks = models.IntegerField(default=0)
    source = models.CharField(max_length=50, default='manual')  # 'github' or 'manual'
    order = models.IntegerField(default=0)  # For custom ordering
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-featured', 'order', '-created_at']

    def __str__(self):
        return self.title

class BlogPost(models.Model):
    """Model for blog posts"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    excerpt = models.TextField(max_length=500)
    author = models.CharField(max_length=100, default="Developer Name")
    published_date = models.DateTimeField()
    tags = models.JSONField(default=list)  # List of tags
    featured_image_url = models.TextField(blank=True)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_date']

    def __str__(self):
        return self.title

class ContactMessage(models.Model):
    """Model for contact form messages"""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    recipient_email = models.EmailField(blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"
