import { CERTIFICATIONS_DATA } from '../services/api.js';

export const DEFAULT_PORTFOLIO = {
    username: 'username',
    full_name: 'Developer Name',
    display_name: 'Developer Name',
    greeting: "Hi there! I'm",
    titles: [
        'Full-Stack Developer',
        'Software Engineer',
        'Cloud Solutions Architect',
        'UI/UX Craftsman',
        'Open Source Contributor'
    ],
    short_bio: 'Full-stack software engineer specializing in building high-performance web applications, scalable cloud infrastructure, and modern digital experiences.',
    quote: '"Turning complex problems into elegant, scalable software solutions."',
    detailed_bio: "I am a full-stack software engineer with a strong foundation in modern web development, distributed backend architecture, and cloud systems. I build responsive, accessible web applications and reliable microservices that scale smoothly.\n\nWhen I'm not writing code, I enjoy exploring new engineering paradigms, contributing to open-source software, and collaborating with cross-functional teams to bring creative products to life.",
    about_highlights: [
        {
            stat: '5+ Years',
            label: 'Engineering Experience',
            sub: 'Building scalable web applications',
            icon: '💻',
        },
        {
            stat: '50+',
            label: 'Projects Delivered',
            sub: 'Full-stack & open source systems',
            icon: '🚀',
        },
        {
            stat: '99.9%',
            label: 'System Reliability',
            sub: 'High availability cloud deployments',
            icon: '⚡',
        },
        {
            stat: 'BS',
            label: 'Computer Science',
            sub: 'Software Systems & Architecture',
            icon: '🎓',
        },
    ],
    profile_image: '',
    background_image: '',
    background_settings: {
        fit: 'cover',
        position: 'center',
        overlay: 0.2
    },
    home_typography: {
        headingSize: 'standard',
        fontWeight: 'bold',
        subtitleColor: '#486581'
    },
    appearance: {
        fontFamily: 'Inter',
        headingFont: 'Inter',
        primaryColor: '#627D98',
        secondaryColor: '#EDE0C9',
        accentColor: '#DFCBA6',
        bgLight: '#FDFBF7',
        bgDark: '#102A43',
        textLight: '#102A43',
        textDark: '#F0F4F8',
        borderRadius: '1rem'
    },
    sections_visibility: {
        hero: true,
        projects: true,
        about: true,
        skills: true,
        certifications: true,
        contact: true,
        custom_section: false,
        blog: false
    },
    custom_section: {
        enabled: false,
        title: 'Experience & Milestones',
        subtitle: 'Career timeline, research initiatives, and professional achievements',
        nav_label: 'Experience',
        slug: 'experience',
        layout: 'timeline',
        badge: 'Highlights',
        font_family: 'sans',
        content_blocks: [
            {
                id: 'custom-1',
                title: 'Senior Software Engineer',
                subtitle: 'Tech Innovations Corp • 2024 - Present',
                description: 'Leading front-end architecture, building reusable component libraries, and designing scalable API endpoints for enterprise customers.',
                tags: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind CSS'],
                link_url: 'https://github.com/username',
                link_text: 'View Profile',
                image_url: '',
                date_badge: '2024 - Present'
            },
            {
                id: 'custom-2',
                title: 'Full-Stack Developer',
                subtitle: 'Digital Products Lab • 2022 - 2024',
                description: 'Engineered responsive web applications and integrated cloud storage and payment gateways for international client projects.',
                tags: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
                link_url: 'https://github.com/username',
                link_text: 'View Code',
                image_url: '',
                date_badge: '2022 - 2024'
            }
        ]
    },
    education: [
        {
            degree: 'BS in Computer Science',
            institution: 'University of Technology',
            period: '2020 - 2024',
            details: 'Specializing in Software Systems, Cloud Architecture, and Web Development'
        }
    ],
    skills_categories: [
        {
            id: 'frontend',
            title: 'Frontend Development',
            icon: '🌐',
            skills: ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Next.js', 'Vite'],
        },
        {
            id: 'backend',
            title: 'Backend & APIs',
            icon: '💻',
            skills: ['Python', 'Node.js', 'Django', 'FastAPI', 'Express', 'REST APIs', 'GraphQL'],
        },
        {
            id: 'database',
            title: 'Databases & Storage',
            icon: '🗄️',
            skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'ORM / Prisma'],
        },
        {
            id: 'devops',
            title: 'DevOps & Cloud',
            icon: '⚡',
            skills: ['Docker', 'AWS', 'Google Cloud', 'CI/CD Pipelines', 'Git', 'GitHub Actions', 'Linux'],
        },
        {
            id: 'tools',
            title: 'Developer Tools',
            icon: '🛠️',
            skills: ['VS Code', 'Postman', 'Figma', 'Webpack', 'Jest', 'npm'],
        },
    ],
    certifications: CERTIFICATIONS_DATA,
    projects: [
        {
            id: 'project-cloudflow',
            name: 'CloudFlow',
            title: 'CloudFlow - Workflow Engine',
            description: 'Distributed event-driven workflow automation system with dynamic task orchestration, real-time telemetry, and microservices architecture.',
            technologies: ['TypeScript', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
            github_url: 'https://github.com/username/cloudflow',
            project_url: 'https://example.com/demo/cloudflow',
            readme_image: '',
            stars: 128,
            forks: 34,
            featured: true,
        },
        {
            id: 'project-devpulse',
            name: 'DevPulse',
            title: 'DevPulse - Realtime Analytics',
            description: 'High-throughput metrics dashboard featuring interactive data visualizations, websocket streaming, and custom reporting analytics.',
            technologies: ['React', 'Python', 'FastAPI', 'Redis', 'Chart.js', 'Tailwind CSS'],
            github_url: 'https://github.com/username/devpulse',
            project_url: 'https://example.com/demo/devpulse',
            readme_image: '',
            stars: 95,
            forks: 18,
            featured: true,
        },
        {
            id: 'project-devcanvas',
            name: 'DevCanvas',
            title: 'DevCanvas - Collaborative Code Studio',
            description: 'Browser-based real-time collaborative workspace with syntax highlighting, visual canvas tools, and responsive multi-touch controls.',
            technologies: ['JavaScript', 'React', 'WebSockets', 'Canvas API', 'Tailwind CSS'],
            github_url: 'https://github.com/username/devcanvas',
            project_url: 'https://example.com/demo/devcanvas',
            readme_image: '',
            stars: 84,
            forks: 12,
            featured: true,
        },
        {
            id: 'project-securevault',
            name: 'SecureVault',
            title: 'SecureVault - Client-Side Cryptography',
            description: 'Enterprise-grade zero-knowledge client encryption utility for secure file transfer, credential management, and audit logging.',
            technologies: ['TypeScript', 'React', 'WebAssembly', 'Cryptography', 'Tailwind CSS'],
            github_url: 'https://github.com/username/securevault',
            project_url: 'https://example.com/demo/securevault',
            readme_image: '',
            stars: 110,
            forks: 22,
            featured: true,
        },
    ],
    social_links: {
        title: 'Get In Touch',
        subtitle: 'Have a project in mind, a question, or just want to connect? Drop a message below!',
        github: 'https://github.com/username',
        linkedin: 'https://www.linkedin.com/in/username',
        medium: 'https://medium.com/',
        devpost: 'https://devpost.com/',
        email: 'testing@gmail.com',
        floating_links: [
            {
                id: 'fl-1',
                name: 'LinkedIn',
                platform: 'linkedin',
                url: 'https://www.linkedin.com/in/username',
                image_url: '/social/linkedin.png',
                pink_image_url: '/social/pink/linkedin.png',
                enabled: true
            },
            {
                id: 'fl-2',
                name: 'GitHub',
                platform: 'github',
                url: 'https://github.com/username',
                image_url: '/social/github.png',
                pink_image_url: '/social/pink/github.png',
                enabled: true
            },
            {
                id: 'fl-3',
                name: 'Medium',
                platform: 'medium',
                url: 'https://medium.com/',
                image_url: '/social/medium.png',
                pink_image_url: '/social/pink/medium.png',
                enabled: true
            },
            {
                id: 'fl-4',
                name: 'Devpost',
                platform: 'devpost',
                url: 'https://devpost.com/',
                image_url: '/social/devpost.png',
                pink_image_url: '/social/pink/devpost.png',
                enabled: true
            }
        ]
    }
};
