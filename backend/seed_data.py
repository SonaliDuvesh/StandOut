"""
Seed data script for portfolio database
Run with: python manage.py shell < seed_data.py
"""
from django.utils import timezone
from api.models import Portfolio, Project, BlogPost

print("Clearing existing data...")
Project.objects.all().delete()
BlogPost.objects.all().delete()
Portfolio.objects.all().delete()

print("Creating default portfolio for Developer...")

portfolio = Portfolio.objects.create(
    username="username",
    full_name="Developer Name",
    display_name="Developer Name",
    greeting="Hi there! I'm",
    titles=[
        "Full-Stack Developer",
        "Software Engineer",
        "Cloud Solutions Architect",
        "Problem Solver"
    ],
    short_bio="Full-stack software engineer specializing in building high-performance web applications, scalable cloud infrastructure, and modern digital experiences.",
    detailed_bio=(
        "I am a full-stack software engineer with a strong foundation in modern web development, distributed backend architecture, and cloud systems. "
        "I build responsive, accessible web applications and reliable microservices that scale smoothly.\n\n"
        "When I'm not writing code, I enjoy exploring new engineering paradigms, contributing to open-source software, and collaborating with cross-functional teams to bring creative products to life."
    ),
    profile_image="",
    background_image="",
    background_settings={
        "fit": "cover",
        "position": "center",
        "overlay": 0.2
    },
    appearance={
        "fontFamily": "Inter",
        "headingFont": "Inter",
        "primaryColor": "#627D98",
        "secondaryColor": "#EDE0C9",
        "accentColor": "#DFCBA6",
        "bgLight": "#FDFBF7",
        "bgDark": "#102A43",
        "textLight": "#102A43",
        "textDark": "#F0F4F8",
        "borderRadius": "1rem"
    },
    sections_visibility={
        "hero": True,
        "about": True,
        "skills": True,
        "projects": True,
        "certifications": True,
        "blog": False,
        "contact": True
    },
    education=[
        {
            "degree": "BS in Computer Science",
            "institution": "University of Technology",
            "period": "2020 - 2024",
            "details": "Specializing in Software Systems, Cloud Architecture, and Web Development"
        }
    ],
    skills_categories=[
        {
            "id": "frontend",
            "title": "Frontend Development",
            "icon": "code",
            "skills": ["HTML5", "CSS3", "JavaScript", "React", "TypeScript", "Tailwind CSS"]
        },
        {
            "id": "backend",
            "title": "Backend & APIs",
            "icon": "server",
            "skills": ["Python", "Node.js", "Django", "FastAPI", "Express", "REST APIs"]
        },
        {
            "id": "database",
            "title": "Data & Databases",
            "icon": "database",
            "skills": ["SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite"]
        },
        {
            "id": "devops",
            "title": "DevOps & Cloud",
            "icon": "cpu",
            "skills": ["Docker", "AWS", "Google Cloud", "Git", "GitHub Actions", "Linux"]
        },
        {
            "id": "tools",
            "title": "Tools & Platforms",
            "icon": "wrench",
            "skills": ["VS Code", "Postman", "Figma", "Webpack", "npm", "Jest"]
        }
    ],
    certifications=[
        {
            "id": "cert-1",
            "title": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services (AWS)",
            "issueDate": "2025",
            "expirationDate": "",
            "credentialId": "AWS-SAA-884920",
            "credentialUrl": "https://aws.amazon.com/verification",
            "issuerLogo": ""
        },
        {
            "id": "cert-2",
            "title": "Google Cloud Professional Cloud Architect",
            "issuer": "Google Cloud Platform",
            "issueDate": "2025",
            "expirationDate": "",
            "credentialId": "GCP-PCA-194022",
            "credentialUrl": "https://cloud.google.com/certification",
            "issuerLogo": ""
        },
        {
            "id": "cert-3",
            "title": "Meta Front-End Developer Specialization",
            "issuer": "Meta Career Programs",
            "issueDate": "2024",
            "expirationDate": "",
            "credentialId": "META-FED-552194",
            "credentialUrl": "https://coursera.org/verify",
            "issuerLogo": ""
        }
    ],
    social_links={
        "github": "https://github.com/username",
        "linkedin": "https://www.linkedin.com/in/username",
        "email": "testing@gmail.com",
        "medium": "",
        "twitter": ""
    },
    is_published=True
)

print(f"Created portfolio: {portfolio.full_name} (@{portfolio.username})")

print("Creating projects...")
projects_data = [
    {
        "title": "CloudFlow - Workflow Engine",
        "description": "Distributed event-driven workflow automation system with dynamic task orchestration, real-time telemetry, and microservices architecture.",
        "technologies": ["TypeScript", "React", "Node.js", "Docker", "PostgreSQL", "Tailwind CSS"],
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        "project_url": "https://example.com/demo/cloudflow",
        "github_url": "https://github.com/username/cloudflow",
        "featured": True,
        "is_live": True,
        "order": 1,
        "source": "github"
    },
    {
        "title": "DevPulse - Realtime Analytics",
        "description": "High-throughput metrics dashboard featuring interactive data visualizations, websocket streaming, and custom reporting analytics.",
        "technologies": ["React", "Python", "FastAPI", "Redis", "Chart.js", "Tailwind CSS"],
        "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        "project_url": "https://example.com/demo/devpulse",
        "github_url": "https://github.com/username/devpulse",
        "featured": True,
        "is_live": True,
        "order": 2,
        "source": "github"
    },
    {
        "title": "DevCanvas - Collaborative Code Studio",
        "description": "Browser-based real-time collaborative workspace with syntax highlighting, visual canvas tools, and responsive multi-touch controls.",
        "technologies": ["JavaScript", "React", "WebSockets", "Canvas API", "Tailwind CSS"],
        "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        "project_url": "https://example.com/demo/devcanvas",
        "github_url": "https://github.com/username/devcanvas",
        "featured": True,
        "is_live": True,
        "order": 3,
        "source": "github"
    },
    {
        "title": "SecureVault - Client-Side Cryptography",
        "description": "Enterprise-grade zero-knowledge client encryption utility for secure file transfer, credential management, and audit logging.",
        "technologies": ["TypeScript", "React", "WebAssembly", "Cryptography", "Tailwind CSS"],
        "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
        "project_url": "https://example.com/demo/securevault",
        "github_url": "https://github.com/username/securevault",
        "featured": False,
        "is_live": True,
        "order": 4,
        "source": "github"
    }
]

for p_data in projects_data:
    Project.objects.create(portfolio=portfolio, **p_data)

print(f"Created {portfolio.projects.count()} projects for portfolio {portfolio.username}!")

print("Creating sample blog posts...")
blog_posts_data = [
    {
        "title": "Building Scalable Distributed Systems",
        "slug": "building-scalable-distributed-systems",
        "excerpt": "Architectural principles, patterns, and trade-offs when designing resilient microservices and high-availability cloud platforms.",
        "content": "Designing software systems that scale gracefully requires thoughtful architecture, solid separation of concerns, and choosing appropriate data stores.",
        "author": "Developer Name",
        "published_date": timezone.now(),
        "tags": ["Architecture", "Cloud", "DistributedSystems"],
        "featured_image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        "published": True
    }
]

for b_data in blog_posts_data:
    BlogPost.objects.create(**b_data)

print("Seed data completed successfully!")
