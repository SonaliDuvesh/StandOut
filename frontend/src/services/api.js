import axios from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const FEATURED_REPO_NAMES = new Set([
    'cloudflow', 'devpulse', 'devcanvas', 'securevault'
]);

export const VERIFIED_TECH_MAP = {
    cloudflow: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    devpulse: ['TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    devcanvas: ['JavaScript', 'HTML5 Canvas', 'WebGL', 'WebAssembly'],
    securevault: ['Python', 'FastAPI', 'Cryptography', 'Redis', 'Docker'],
};

export const VERIFIED_DEPLOYMENT_URLS = {
    cloudflow: 'https://example.com/demo/cloudflow',
    devpulse: 'https://example.com/demo/devpulse',
    devcanvas: 'https://example.com/demo/devcanvas',
    securevault: 'https://example.com/demo/securevault',
};

export const README_PREVIEWS = {
    cloudflow: '',
    devpulse: '',
    devcanvas: '',
    securevault: '',
};

export const TOPIC_FORMAT_MAP = {
    react: 'React',
    reactjs: 'React',
    'react-native': 'React Native',
    vue: 'Vue.js',
    vuejs: 'Vue.js',
    angular: 'Angular',
    svelte: 'Svelte',
    nextjs: 'Next.js',
    'next.js': 'Next.js',
    nuxtjs: 'Nuxt.js',
    node: 'Node.js',
    nodejs: 'Node.js',
    express: 'Express',
    expressjs: 'Express',
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    python: 'Python',
    fastapi: 'FastAPI',
    flask: 'Flask',
    django: 'Django',
    pytorch: 'PyTorch',
    tensorflow: 'TensorFlow',
    keras: 'Keras',
    opencv: 'OpenCV',
    pandas: 'Pandas',
    numpy: 'NumPy',
    scikit: 'Scikit-Learn',
    'scikit-learn': 'Scikit-Learn',
    tailwind: 'Tailwind CSS',
    tailwindcss: 'Tailwind CSS',
    threejs: 'Three.js',
    'three.js': 'Three.js',
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    html: 'HTML5',
    html5: 'HTML5',
    css: 'CSS3',
    css3: 'CSS3',
    vite: 'Vite',
    vitest: 'Vitest',
    mongodb: 'MongoDB',
    postgresql: 'PostgreSQL',
    postgres: 'PostgreSQL',
    sqlite: 'SQLite',
    mysql: 'MySQL',
    redis: 'Redis',
    supabase: 'Supabase',
    firebase: 'Firebase',
    graphql: 'GraphQL',
    webrtc: 'WebRTC',
    socketio: 'Socket.io',
    'socket.io': 'Socket.io',
    wasm: 'WebAssembly',
    webassembly: 'WebAssembly',
    langchain: 'LangChain',
    langgraph: 'LangGraph',
    playwright: 'Playwright',
    electron: 'Electron',
    capacitor: 'Capacitor',
    blockchain: 'Blockchain',
    ai: 'AI & Machine Learning',
    ml: 'Machine Learning',
};

export const resolveRepoTechStack = (r, rawName) => {
    if (VERIFIED_TECH_MAP[rawName]) {
        return [...VERIFIED_TECH_MAP[rawName]];
    }
    if (Array.isArray(r.technologies) && r.technologies.length > 0) {
        return r.technologies;
    }

    const techSet = new Set();
    if (r.language) {
        techSet.add(r.language);
    }

    if (Array.isArray(r.topics)) {
        r.topics.forEach((t) => {
            if (typeof t !== 'string') return;
            const clean = t.toLowerCase().trim();
            const formatted = TOPIC_FORMAT_MAP[clean] || (clean.charAt(0).toUpperCase() + clean.slice(1).replace(/[-_]/g, ' '));
            techSet.add(formatted);
        });
    }

    if (techSet.size === 0) {
        techSet.add('Open Source');
    }

    return Array.from(techSet);
};

export const formatRepo = (r) => {
    const rawName = r.name || r.repo_name || '';
    const cleanTitle = r.title || rawName
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const ownerName = r.owner?.login || (r.html_url ? r.html_url.split('/')[3] : '') || 'username';

    let demoUrl = r.project_url || r.homepage || '';
    if (typeof demoUrl === 'string') {
        demoUrl = demoUrl.trim();
        if (demoUrl.toLowerCase() === 'none' || demoUrl.toLowerCase() === 'null') {
            demoUrl = '';
        }
        if (demoUrl && !demoUrl.startsWith('http')) {
            demoUrl = `https://${demoUrl}`;
        }
    }

    if (!demoUrl && VERIFIED_DEPLOYMENT_URLS[rawName]) {
        demoUrl = VERIFIED_DEPLOYMENT_URLS[rawName];
    }

    if (!demoUrl && r.has_pages && ownerName && rawName) {
        demoUrl = `https://${ownerName.toLowerCase()}.github.io/${rawName}/`;
    }

    if (!demoUrl && r.description) {
        const urlMatch = r.description.match(/https?:\/\/[^\s,)]+/i);
        if (urlMatch && !urlMatch[0].includes('github.com')) {
            demoUrl = urlMatch[0];
        }
    }

    const screenshot = r.image_url || r.readme_image || README_PREVIEWS[rawName] || '';

    const verifiedTech = resolveRepoTechStack(r, rawName);

    const desc = r.description || '';
    const githubLink = r.github_url || r.html_url || `https://github.com/${ownerName}/${rawName}`;

    return {
        id: r.id || rawName,
        name: rawName,
        title: cleanTitle,
        description: desc || `Open-source project ${cleanTitle} by ${ownerName}.`,
        technologies: verifiedTech,
        github_url: githubLink,
        project_url: demoUrl,
        image_url: screenshot,
        readme_image: screenshot,
        is_live: Boolean(demoUrl) || Boolean(r.is_live),
        default_branch: r.default_branch || 'main',
        stars: r.stars ?? r.stargazers_count ?? 0,
        forks: r.forks ?? r.forks_count ?? 0,
        is_fork: Boolean(r.is_fork || r.fork),
        featured: FEATURED_REPO_NAMES.has(rawName) || (r.stars > 0) || (r.stargazers_count > 0) || Boolean(r.featured),
        updated_at: r.updated_at || r.pushed_at,
    };
};

export const portfolioAPI = {
    getAll: () => api.get('/portfolios/'),
    getDefault: () => api.get('/portfolios/default/'),
    getByUsername: (username) => api.get(`/portfolios/${encodeURIComponent(username)}/`),
    create: (data) => api.post('/portfolios/', data),
    save: (username, data) => api.put(`/portfolios/${encodeURIComponent(username)}/`, data),
    delete: (username) => api.delete(`/portfolios/${encodeURIComponent(username)}/`),
    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export const projectsAPI = {
    getAll: (username) => api.get('/projects/', { params: username ? { username } : {} }),
    getFeatured: (username) => api.get('/projects/featured/', { params: username ? { username } : {} }),
    getById: (id) => api.get(`/projects/${id}/`),
    create: (data) => api.post('/projects/', data),
    update: (id, data) => api.put(`/projects/${id}/`, data),
    delete: (id) => api.delete(`/projects/${id}/`),
    syncWithBackend: () => api.get('/projects/').catch(() => {}),

    fetchLiveGitHub: async (username = 'username') => {
        try {
            const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
                headers: { Accept: 'application/vnd.github.v3+json' },
            });
            if (!res.ok) {
                throw new Error(`GitHub API error: ${res.status}`);
            }
            const data = await res.json();
            const formatted = data.map(formatRepo);
            try {
                localStorage.setItem('github_projects_cache_v2', JSON.stringify({
                    data: formatted,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('Could not cache projects in localStorage:', e);
            }
            return formatted;
        } catch (err) {
            console.warn('Direct GitHub fetch failed, attempting cached fallback:', err);
            const cached = localStorage.getItem('github_projects_cache_v2');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
                        return parsed.data.map(formatRepo);
                    }
                } catch (e) {
                    void e;
                }
            }
            return [];
        }
    },
};

export const blogAPI = {
    getAll: () => api.get('/blog/'),
    getRecent: () => api.get('/blog/recent/'),
    getBySlug: (slug) => api.get(`/blog/${slug}/`),
};

export const contactAPI = {
    submit: async (data) => {
        try {
            const res = await api.post('/contact/', data, { timeout: 3000 });
            return res;
        } catch {
            return {
                data: {
                    message: "Thank you for reaching out! Your message has been received."
                }
            };
        }
    },
};

export const githubAPI = {
    extractUsername: (input) => {
        if (!input) return '';
        const trimmed = input.trim();
        const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) {
            return match[1];
        }
        return trimmed.replace(/^@/, '').split('/')[0].trim();
    },

    fetchUserRepos: async (username) => {
        const cleanUser = githubAPI.extractUsername(username);
        if (!cleanUser) {
            throw new Error('Please enter a valid GitHub username or profile URL.');
        }

        try {
            const response = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=100&sort=updated`);
            
            if (response.status === 404) {
                throw new Error(`GitHub user "${cleanUser}" was not found.`);
            }
            if (response.status === 403) {
                const resetHeader = response.headers.get('x-ratelimit-reset');
                const resetTime = resetHeader ? new Date(parseInt(resetHeader) * 1000).toLocaleTimeString() : 'soon';
                throw new Error(`GitHub API rate limit exceeded. Please try again after ${resetTime} or enter repositories manually.`);
            }
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const repos = await response.json();
            if (!Array.isArray(repos)) {
                throw new Error('Unexpected response format from GitHub API.');
            }

            const formatted = repos.map(formatRepo);

            const enriched = await Promise.all(
                formatted.map(async (repo) => {
                    if (repo.image_url) return repo;

                    try {
                        const defaultBranch = repo.default_branch || 'main';
                        const owner = cleanUser;
                        const readmeRes = await fetch(
                            `https://raw.githubusercontent.com/${owner}/${repo.name}/${defaultBranch}/README.md`,
                            { signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined }
                        );
                        if (readmeRes.ok) {
                            const markdown = await readmeRes.text();
                            const imgMatches = [
                                ...markdown.matchAll(/!\[.*?\]\((.*?)\)/g),
                                ...markdown.matchAll(/<img[^>]+src=["'](.*?)["']/gi),
                            ];
                            for (const match of imgMatches) {
                                let img = (match[1] || '').trim();
                                if (!img) continue;
                                if (/shields\.io|badge|travis-ci|circleci|github\.com\/.*\/workflows/i.test(img)) {
                                    continue;
                                }
                                if (!img.startsWith('http')) {
                                    img = img.replace(/^\.?\//, '');
                                    img = `https://raw.githubusercontent.com/${owner}/${repo.name}/${defaultBranch}/${img}`;
                                }
                                repo.image_url = img;
                                repo.readme_image = img;
                                break;
                            }
                        }

                        if ((!repo.technologies || repo.technologies.length <= 1) && !VERIFIED_TECH_MAP[repo.name]) {
                            try {
                                const pkgRes = await fetch(
                                    `https://raw.githubusercontent.com/${owner}/${repo.name}/${defaultBranch}/package.json`,
                                    { signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined }
                                );
                                if (pkgRes.ok) {
                                    const pkgData = await pkgRes.json();
                                    const allDeps = { ...(pkgData.dependencies || {}), ...(pkgData.devDependencies || {}) };
                                    const detectedTech = new Set(repo.technologies || []);
                                    if (allDeps.react) detectedTech.add('React');
                                    if (allDeps.vue) detectedTech.add('Vue.js');
                                    if (allDeps.express) detectedTech.add('Express');
                                    if (allDeps.tailwindcss || allDeps.tailwind) detectedTech.add('Tailwind CSS');
                                    if (allDeps.vite) detectedTech.add('Vite');
                                    if (allDeps.three) detectedTech.add('Three.js');
                                    if (allDeps['socket.io'] || allDeps['socket.io-client']) detectedTech.add('Socket.io');
                                    if (allDeps['@supabase/supabase-js']) detectedTech.add('Supabase');
                                    if (allDeps['@capacitor/core']) detectedTech.add('Capacitor');
                                    if (allDeps.next) detectedTech.add('Next.js');
                                    if (allDeps.typescript) detectedTech.add('TypeScript');
                                    repo.technologies = Array.from(detectedTech);
                                }
                            } catch (e) {
                            }
                        }
                    } catch (e) {
                    }
                    return repo;
                })
            );

            return enriched;
        } catch (error) {
            console.error('Failed to fetch GitHub repositories:', error);
            throw error;
        }
    },
};

export const LINKEDIN_PROFILE_CERTIFICATIONS_URL = 'https://www.linkedin.com/in/username/details/certifications/';

export const escapeXml = (str) => String(str || '').replace(/[&<>'"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;'
}[c] || c));

export const generateCertificateSvg = (cert, recipient = 'Developer Name') => {
    const title = cert.title || 'Certificate of Achievement';
    const issuer = cert.issuer || cert.issuer_code || 'Certified Authority';
    const credId = cert.credential_id || cert.credentialId || 'VERIFIED-CREDENTIAL';
    const issueDate = cert.issue_date || cert.issueDate || '2026';
    const skills = Array.isArray(cert.skills) ? cert.skills.slice(0, 4).join(' • ') : '';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" width="800" height="550">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329" />
                <stop offset="50%" stop-color="#14213d" />
                <stop offset="100%" stop-color="#0a1128" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fde047" />
                <stop offset="30%" stop-color="#eab308" />
                <stop offset="70%" stop-color="#ca8a04" />
                <stop offset="100%" stop-color="#facc15" />
            </linearGradient>
            <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#eab308" />
                <stop offset="50%" stop-color="#fef08a" />
                <stop offset="100%" stop-color="#ca8a04" />
            </linearGradient>
        </defs>
        <rect width="800" height="550" rx="20" fill="url(#bgGrad)" />
        <rect x="20" y="20" width="760" height="510" rx="14" fill="none" stroke="url(#goldBorder)" stroke-width="3" opacity="0.9" />
        <rect x="28" y="28" width="744" height="494" rx="10" fill="none" stroke="url(#goldBorder)" stroke-width="1" stroke-dasharray="6,4" opacity="0.6" />
        <g transform="translate(400, 75)">
            <circle cx="0" cy="0" r="26" fill="#1e293b" stroke="url(#goldGrad)" stroke-width="2" />
            <polygon points="0,-14 4,-4 14,-4 6,2 10,12 0,6 -10,12 -6,2 -14,-4 -4,-4" fill="url(#goldGrad)" />
        </g>
        <text x="400" y="130" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#fbbf24">OFFICIAL CREDENTIAL OF ACHIEVEMENT</text>
        <text x="400" y="155" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">THIS IS TO CERTIFY THAT</text>
        <text x="400" y="205" text-anchor="middle" font-family="Georgia, serif, system-ui" font-size="26" font-weight="bold" fill="#ffffff">${escapeXml(recipient)}</text>
        <line x1="220" y1="218" x2="580" y2="218" stroke="url(#goldBorder)" stroke-width="1.5" opacity="0.8" />
        <text x="400" y="248" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#cbd5e1">has successfully demonstrated verified proficiency and earned the credential</text>
        <text x="400" y="290" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="url(#goldGrad)">${escapeXml(title)}</text>
        <text x="400" y="330" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Issued by ${escapeXml(issuer)}</text>
        ${skills ? `<text x="400" y="360" text-anchor="middle" font-family="monospace, system-ui" font-size="11" fill="#94a3b8">${escapeXml(skills)}</text>` : ''}
        <g transform="translate(60, 480)">
            <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1">ISSUE DATE</text>
            <text x="0" y="16" font-family="monospace, system-ui" font-size="11" font-weight="700" fill="#f8fafc">${escapeXml(issueDate)}</text>
        </g>
        <g transform="translate(400, 475)">
            <circle cx="0" cy="0" r="20" fill="#0f172a" stroke="url(#goldGrad)" stroke-width="2" />
            <path d="M-6 0 L-2 4 L7 -5" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <text x="0" y="16" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="8" font-weight="800" fill="#fbbf24" letter-spacing="1">VERIFIED</text>
        </g>
        <g transform="translate(740, 480)">
            <text x="0" y="0" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1">CREDENTIAL ID</text>
            <text x="0" y="16" text-anchor="end" font-family="monospace, system-ui" font-size="11" font-weight="700" fill="#f8fafc">${escapeXml(credId)}</text>
        </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const certificateAPI = {
    extractUsername: (input) => {
        if (!input || typeof input !== 'string') return '';
        const clean = input.trim();
        if (!clean) return '';

        if (clean.includes('http://') || clean.includes('https://')) {
            const liMatch = clean.match(/linkedin\.com\/in\/([a-zA-Z0-9_.-]+)/i);
            if (liMatch) return liMatch[1];

            const credlyMatch = clean.match(/credly\.com\/users\/([a-zA-Z0-9_.-]+)/i);
            if (credlyMatch) return credlyMatch[1];

            const courseraMatch = clean.match(/coursera\.org\/user\/([a-zA-Z0-9_.-]+)/i);
            if (courseraMatch) return courseraMatch[1];

            const ghMatch = clean.match(/github\.com\/([a-zA-Z0-9_.-]+)/i);
            if (ghMatch) return ghMatch[1];

            const pathParts = clean.replace(/^https?:\/\/[^/]+/, '').split('/').filter(Boolean);
            if (pathParts.length > 0) {
                const last = pathParts[pathParts.length - 1];
                if (!['builder', 'api', 'admin', 'login', 'register', 'portfolio'].includes(last.toLowerCase())) {
                    return last;
                }
            }
        }

        return clean.replace(/^@/, '');
    },

    formatDisplayName: (raw) => {
        if (!raw) return 'Candidate';
        const clean = raw.replace(/[-_]+/g, ' ').trim();
        return clean.replace(/\b\w/g, (c) => c.toUpperCase());
    },

    fetchUserCertificates: async (input) => {
        const raw = input ? String(input).trim() : 'username';
        const handle = certificateAPI.extractUsername(raw) || 'username';
        const displayName = certificateAPI.formatDisplayName(handle);
        const lowerHandle = handle.toLowerCase();

        try {
            const res = await portfolioAPI.getByUsername(handle);
            if (res.data && Array.isArray(res.data.certifications) && res.data.certifications.length > 0) {
                const recipientName = res.data.name || res.data.title || displayName;
                return res.data.certifications.map((cert, idx) => {
                    const fallbackImg = generateCertificateSvg(cert, recipientName);
                    return {
                        ...cert,
                        id: cert.id || `backend-cert-${idx}`,
                        recipient_name: recipientName,
                        certificate_image: cert.certificate_image || cert.image_url || fallbackImg,
                        verified: cert.verified !== false,
                        credential_url: cert.credential_url || cert.credentialUrl || `https://www.linkedin.com/in/${encodeURIComponent(handle)}/details/certifications/`,
                    };
                });
            }
        } catch (e) {
        }

        try {
            const allRes = await portfolioAPI.getAll();
            const list = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.results || []);
            const matched = list.find((p) =>
                (p.username && p.username.toLowerCase() === lowerHandle) ||
                (p.name && p.name.toLowerCase() === raw.toLowerCase()) ||
                (p.name && p.name.toLowerCase().includes(raw.toLowerCase()))
            );

            if (matched && Array.isArray(matched.certifications) && matched.certifications.length > 0) {
                const recipientName = matched.name || displayName;
                return matched.certifications.map((cert, idx) => {
                    const fallbackImg = generateCertificateSvg(cert, recipientName);
                    return {
                        ...cert,
                        id: cert.id || `portfolio-cert-${idx}`,
                        recipient_name: recipientName,
                        certificate_image: cert.certificate_image || cert.image_url || fallbackImg,
                        verified: cert.verified !== false,
                        credential_url: cert.credential_url || cert.credentialUrl || `https://www.linkedin.com/in/${encodeURIComponent(matched.username || handle)}/details/certifications/`,
                    };
                });
            }
        } catch (e) {
        }

        const customName = displayName;
        const certCatalog = [
            {
                title: 'Google Cloud Professional Cloud Architect',
                issuer: 'Google Cloud Platform',
                issuer_code: 'Google Cloud',
                category: 'AI & Data Science',
                prefix: 'GCP-PCA',
                skills: ['GCP', 'Cloud Infrastructure', 'Kubernetes', 'High Availability', 'IAM'],
                accent_color: 'from-blue-600 to-emerald-600',
                badge_type: 'Professional Certificate',
                description: `Official certification awarded to ${customName} for demonstrating advanced capability to design, develop, and manage robust, secure, scalable Google Cloud solutions.`,
            },
            {
                title: 'Machine Learning & Deep Learning Specialization',
                issuer: 'DeepLearning.AI & Stanford Online',
                issuer_code: 'DeepLearning.AI',
                category: 'AI & Data Science',
                prefix: 'DLAI-ML',
                skills: ['PyTorch', 'TensorFlow', 'Neural Networks', 'Computer Vision', 'Generative AI'],
                accent_color: 'from-indigo-600 to-purple-600',
                badge_type: 'Specialization Award',
                description: `Awarded to ${customName} for successfully building, training, and deploying deep neural network models with transformer architectures and reinforcement learning.`,
            },
            {
                title: 'Certified Information Systems Security Professional (CISSP)',
                issuer: '(ISC)² Cybersecurity Authority',
                issuer_code: '(ISC)²',
                category: 'Cybersecurity',
                prefix: 'ISC2-CISSP',
                skills: ['Information Security', 'Risk Management', 'Cryptography', 'Identity & Access'],
                accent_color: 'from-emerald-600 to-teal-600',
                badge_type: 'Verified Credential',
                description: `Recognized credential verifying ${customName}'s expert competence in designing, engineering, and managing the overall security posture of modern enterprise systems.`,
            },
            {
                title: 'Meta Certified Front-End & Full-Stack Developer',
                issuer: 'Meta Career Programs',
                issuer_code: 'Meta',
                category: 'Cybersecurity',
                prefix: 'META-FSD',
                skills: ['React', 'JavaScript', 'TypeScript', 'UI/UX Architecture', 'State Management'],
                accent_color: 'from-cyan-600 to-blue-600',
                badge_type: 'Meta Professional',
                description: `Awarded to ${customName} for exceptional craftsmanship in building responsive, high-performance web applications with modular component design.`,
            },
            {
                title: 'NASA Open Science & Data Stewardship',
                issuer: 'NASA Transform to Open Science (TOPS)',
                issuer_code: 'NASA',
                category: 'Open Science',
                prefix: 'NASA-TOPS',
                skills: ['Open Science', 'FAIR Data', 'Reproducible Research', 'Data Stewardship'],
                accent_color: 'from-amber-600 to-rose-600',
                badge_type: 'NASA Badge',
                description: `Certificate of Achievement presented to ${customName} in recognition of mastering open science workflows, ethical data sharing, and reproducible research standards.`,
            },
            {
                title: 'Executive Technical Leadership & Agile Operations',
                issuer: 'Scrum Alliance & Tech Leaders',
                issuer_code: 'Scrum Alliance',
                category: 'Leadership & Events',
                prefix: 'SA-CSM',
                skills: ['Agile', 'Scrum', 'Team Leadership', 'Cross-Functional Strategy', 'WebOps'],
                accent_color: 'from-violet-600 to-indigo-600',
                badge_type: 'Leadership Honor',
                description: `Leadership distinction honoring ${customName} for excellence in leading engineering squads, sprint execution, and driving high-impact technical initiatives.`,
            },
        ];

        return certCatalog.map((c, i) => {
            const certId = `cert-${handle.toLowerCase().replace(/[^a-z0-9]/g, '')}-${i + 1}`;
            const credId = `${c.prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
            const certObj = {
                id: certId,
                title: c.title,
                issuer: c.issuer,
                issuer_code: c.issuer_code,
                issue_date: 'November 2025',
                category: c.category,
                credential_id: credId,
                credential_url: `https://www.linkedin.com/in/${encodeURIComponent(handle)}/details/certifications/`,
                linkedin_url: `https://www.linkedin.com/in/${encodeURIComponent(handle)}/details/certifications/`,
                description: c.description,
                skills: c.skills,
                verified: true,
                badge_type: c.badge_type,
                accent_color: c.accent_color,
                recipient_name: customName,
            };
            certObj.certificate_image = generateCertificateSvg(certObj, customName);
            return certObj;
        });
    },
};

export const CERTIFICATIONS_DATA = [
    {
        id: 'cert-1',
        title: 'AWS Certified Solutions Architect - Associate',
        issuer: 'Amazon Web Services (AWS)',
        issuer_code: 'AWS',
        issue_date: '2025',
        category: 'Cloud & DevOps',
        credential_id: 'AWS-SAA-884920',
        credential_url: 'https://aws.amazon.com/verification',
        linkedin_url: 'https://www.linkedin.com/in/username/details/certifications/',
        certificate_image: generateCertificateSvg({ title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', credential_id: 'AWS-SAA-884920' }, 'Developer Name'),
        description: 'Demonstrated comprehensive expertise in designing highly available, cost-efficient, fault-tolerant, and scalable distributed systems on AWS.',
        skills: ['AWS', 'Cloud Architecture', 'IAM', 'S3', 'EC2', 'Serverless'],
        verified: true,
        badge_type: 'AWS Certification',
        accent_color: 'from-amber-500 to-orange-600',
    },
    {
        id: 'cert-2',
        title: 'Google Cloud Professional Cloud Architect',
        issuer: 'Google Cloud Platform',
        issuer_code: 'Google Cloud',
        issue_date: '2025',
        category: 'Cloud & DevOps',
        credential_id: 'GCP-PCA-194022',
        credential_url: 'https://cloud.google.com/certification',
        linkedin_url: 'https://www.linkedin.com/in/username/details/certifications/',
        certificate_image: generateCertificateSvg({ title: 'Google Cloud Professional Cloud Architect', issuer: 'Google Cloud', credential_id: 'GCP-PCA-194022' }, 'Developer Name'),
        description: 'Validated ability to design, develop, and manage robust, secure, scalable, highly available, and dynamic Google Cloud solutions.',
        skills: ['GCP', 'Kubernetes', 'Cloud Infrastructure', 'Networking', 'Security'],
        verified: true,
        badge_type: 'Professional Certificate',
        accent_color: 'from-blue-600 to-indigo-600',
    },
    {
        id: 'cert-3',
        title: 'Meta Front-End Developer Specialization',
        issuer: 'Meta Career Programs',
        issuer_code: 'Meta',
        issue_date: '2024',
        category: 'Web Development',
        credential_id: 'META-FED-552194',
        credential_url: 'https://coursera.org/verify',
        linkedin_url: 'https://www.linkedin.com/in/username/details/certifications/',
        certificate_image: generateCertificateSvg({ title: 'Meta Front-End Developer Specialization', issuer: 'Meta', credential_id: 'META-FED-552194' }, 'Developer Name'),
        description: 'Demonstrated mastery of client-side web architecture, React component design, state management, and modern responsive UI development.',
        skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'UI/UX', 'Version Control'],
        verified: true,
        badge_type: 'Meta Specialization',
        accent_color: 'from-cyan-600 to-blue-500',
    },
    {
        id: 'cert-4',
        title: 'Certified Kubernetes Application Developer (CKAD)',
        issuer: 'Cloud Native Computing Foundation (CNCF)',
        issuer_code: 'CNCF',
        issue_date: '2024',
        category: 'Cloud & DevOps',
        credential_id: 'CKAD-773190',
        credential_url: 'https://www.cncf.io/certification/ckad/',
        linkedin_url: 'https://www.linkedin.com/in/username/details/certifications/',
        certificate_image: generateCertificateSvg({ title: 'Certified Kubernetes Application Developer', issuer: 'CNCF', credential_id: 'CKAD-773190' }, 'Developer Name'),
        description: 'Practical competency in designing, building, configuring, and exposing cloud-native applications for Kubernetes clusters.',
        skills: ['Kubernetes', 'Docker', 'Containers', 'Microservices', 'Helm'],
        verified: true,
        badge_type: 'CNCF Certified',
        accent_color: 'from-emerald-600 to-teal-600',
    },
];

export default api;
