import { useState, useMemo } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';

const LOGO_MAP = {
    'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'Java': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg',
    'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    'C++': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg',
    'Rust': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg',
    'Bash': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg',
    'SQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
    'HTML5': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
    'HTML': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
    'CSS3': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    'CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    'Flask': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg',
    'Flask Framework': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg',
    'FastAPI': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg',
    'Vue.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg',
    'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
    'Tailwind CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
    'Jinja2': 'https://cdn.simpleicons.org/jinja',
    'Pandas': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original.svg',
    'NumPy': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original.svg',
    'Scikit-learn': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg',
    'XGBoost': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'LightGBM': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'Google Gemini': 'https://cdn.simpleicons.org/googlegemini',
    'Gemini': 'https://cdn.simpleicons.org/googlegemini',
    'OpenAI': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/networkx/networkx-original.svg',
    'Claude': 'https://cdn.simpleicons.org/anthropic',
    'Ollama': 'https://cdn.simpleicons.org/ollama',
    'LangChain': 'https://cdn.simpleicons.org/langchain',
    'Git': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
    'GitHub': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg',
    'Linux': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg',
    'Linux Basics': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg',
    'Docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',
    'npm': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg',
    'Vercel': 'https://cdn.simpleicons.org/vercel',
    'Render': 'https://cdn.simpleicons.org/render',
    'Anaconda': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/anaconda/anaconda-original.svg',
    'Jupyter': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jupyter/jupyter-original.svg',
    'MySQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
    'Figma': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',
    'Canva': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg',
    'HackerRank': 'https://cdn.simpleicons.org/hackerrank',
    'LeetCode': 'https://cdn.simpleicons.org/leetcode',
    'Wireshark': 'https://cdn.simpleicons.org/wireshark',
    'Burp Suite': 'https://cdn.simpleicons.org/burpsuite',
    'Metasploit': 'https://cdn.simpleicons.org/metasploit',
    'OWASP ZAP': 'https://cdn.simpleicons.org/owasp',
    'Kali Linux': 'https://cdn.simpleicons.org/kalilinux',
    'Nmap': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/networkx/networkx-original.svg',
    'Django': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg',
    'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
    'PostgreSQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
    'SQLite': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg',
    'VS Code': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg',
};

const SkillBadge = ({ skill }) => {
    const [failed, setFailed] = useState(false);
    const logoUrl = LOGO_MAP[skill];

    return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-navy-800/85 border border-soft-cream-300/80 dark:border-navy-700/80 text-navy-800 dark:text-soft-cream-100 hover:border-golden-500/70 dark:hover:border-golden-400/60 hover:scale-105 active:scale-95 transition-all shadow-sm group">
            {logoUrl && !failed ? (
                <img
                    src={logoUrl}
                    alt={`${skill} logo`}
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain shrink-0 group-hover:rotate-6 transition-transform"
                    loading="lazy"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span className="w-2 h-2 rounded-full bg-golden-600 dark:bg-golden-400 shrink-0 group-hover:scale-125 transition-transform" />
            )}
            <span className="truncate">{skill}</span>
        </span>
    );
};

const DEFAULT_SKILL_CATEGORIES = [
    {
        id: 'languages',
        title: 'Languages',
        icon: '💻',
        skills: ['Python', 'Java', 'JavaScript', 'C++', 'Rust', 'Bash', 'SQL', 'HTML5', 'CSS3'],
    },
    {
        id: 'web',
        title: 'Web & Frameworks',
        icon: '🌐',
        skills: [
            'FastAPI', 'Flask', 'Vue.js', 'Tailwind CSS', 'Jinja2', 'REST APIs',
            'Full-Stack Development', 'Frontend Development', 'Backend Development',
            'API Development', 'UI/UX'
        ],
    },
    {
        id: 'data-ai',
        title: 'Data Science & AI',
        icon: '🤖',
        skills: [
            'Data Science', 'Machine Learning', 'Artificial Intelligence (AI)',
            'Large Language Models (LLM)', 'Google Gemini', 'OpenAI', 'Ollama',
            'LangChain', 'Pandas', 'NumPy', 'Scikit-learn', 'XGBoost', 'LightGBM',
            'Data Analysis', 'Data Mining', 'Statistical Analysis'
        ],
    },
    {
        id: 'cybersecurity',
        title: 'Cybersecurity & OSINT',
        icon: '🛡️',
        skills: [
            'Cybersecurity', 'Open Source Intelligence (OSINT)', 'Digital Forensics',
            'Incident Response', 'Threat Hunting', 'Penetration Testing',
            'Network Security', 'Wireshark', 'Burp Suite', 'Metasploit',
            'OWASP ZAP', 'Kali Linux', 'Nmap'
        ],
    },
    {
        id: 'tools',
        title: 'Tools & Platforms',
        icon: '⚡',
        skills: [
            'Git', 'GitHub', 'Linux', 'Docker', 'npm', 'Vercel', 'Render',
            'Anaconda', 'Jupyter', 'MySQL', 'Figma', 'Canva', 'HackerRank', 'LeetCode'
        ],
    },
    {
        id: 'leadership',
        title: 'Leadership & Execution',
        icon: '🌟',
        skills: [
            'Leadership', 'Technical Operations', 'Event Execution', 'Event Management',
            'WebOps', 'Team Coordination', 'Public Speaking', 'Community Building'
        ],
    },
];

const deduplicateSkills = (skills = []) => {
    const seen = new Set();
    const result = [];
    for (const skill of skills) {
        if (!skill || typeof skill !== 'string') continue;
        const normalized = skill.trim().toLowerCase();
        if (!normalized) continue;
        if (!seen.has(normalized)) {
            seen.add(normalized);
            result.push(skill.trim());
        }
    }
    return result;
};

const Skills = () => {
    const { portfolio } = usePortfolio();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = useMemo(() => {
        const raw = (Array.isArray(portfolio?.skills_categories) && portfolio.skills_categories.length > 0)
            ? portfolio.skills_categories
            : DEFAULT_SKILL_CATEGORIES;

        return raw.map(cat => ({
            ...cat,
            skills: deduplicateSkills(cat.skills || [])
        }));
    }, [portfolio?.skills_categories]);

    const totalSkillCount = useMemo(() => {
        const unique = new Set();
        categories.forEach((c) => {
            if (Array.isArray(c.skills)) {
                c.skills.forEach((s) => unique.add(s));
            }
        });
        return unique.size;
    }, [categories]);

    const filteredCategories = useMemo(() => {
        let list = categories;

        if (activeTab !== 'all') {
            list = list.filter((cat) => cat.id === activeTab || cat.title === activeTab);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list
                .map((cat) => ({
                    ...cat,
                    skills: (cat.skills || []).filter((s) => s.toLowerCase().includes(q)),
                }))
                .filter((cat) => cat.skills.length > 0);
        }

        return list;
    }, [categories, activeTab, searchQuery]);

    return (
        <section id="skills" className="relative z-30 scroll-mt-20 pt-14 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 bg-soft-cream-50 dark:bg-navy-900 transition-colors duration-300">
            <div className="container-custom">
                <div className="text-center mb-8 sm:mb-10">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                            Skills & Expertise
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-golden-100 dark:bg-golden-950/70 text-golden-800 dark:text-golden-300 border border-golden-300/60 dark:border-golden-700/50">
                            {totalSkillCount} Skills
                        </span>
                    </div>
                    <div className="w-20 h-1 bg-gradient-to-r from-navy-700 via-golden-500 to-navy-700 dark:from-navy-400 dark:via-golden-400 dark:to-navy-400 mx-auto rounded-full mb-3"></div>
                    <p className="text-xs sm:text-sm md:text-base text-navy-600 dark:text-soft-cream-400 max-w-2xl mx-auto">
                        Verified proficiencies across programming languages, web frameworks, data science, AI/ML, OSINT, and industry tools
                    </p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === 'all'
                                    ? 'bg-golden-700 text-white dark:bg-golden-500 dark:text-navy-950 border-golden-600 dark:border-golden-400 shadow-sm'
                                    : 'bg-white/80 dark:bg-navy-800/80 border-soft-cream-300 dark:border-navy-700 text-navy-700 dark:text-soft-cream-200 hover:border-golden-400'
                            }`}
                        >
                            All ({totalSkillCount})
                        </button>
                        {categories.map((cat) => {
                            const catKey = cat.id || cat.title;
                            const isSelected = activeTab === catKey;
                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setActiveTab(catKey)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-golden-700 text-white dark:bg-golden-500 dark:text-navy-950 border-golden-600 dark:border-golden-400 shadow-sm'
                                            : 'bg-white/80 dark:bg-navy-800/80 border-soft-cream-300 dark:border-navy-700 text-navy-700 dark:text-soft-cream-200 hover:border-golden-400'
                                    }`}
                                >
                                    <span>{cat.icon || '⚡'}</span>
                                    <span>{cat.title}</span>
                                    <span className="text-[10px] opacity-75 font-mono">({(cat.skills || []).length})</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative min-w-[220px] sm:min-w-[260px]">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search skills (e.g. Python, Docker, Nmap)..."
                            className="w-full pl-8 pr-7 py-2 text-xs rounded-xl bg-white/90 dark:bg-navy-800/90 border border-soft-cream-300 dark:border-navy-700 text-navy-800 dark:text-soft-cream-100 placeholder-navy-400 dark:placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-golden-500 shadow-sm"
                        />
                        <svg
                            className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400 dark:text-soft-cream-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-navy-400 hover:text-navy-600 dark:hover:text-soft-cream-200 cursor-pointer"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12 card bg-white/80 dark:bg-navy-800/80">
                        <p className="text-base font-semibold text-navy-700 dark:text-soft-cream-300 mb-2">
                            No skills match "{searchQuery}"
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setActiveTab('all');
                            }}
                            className="text-xs font-bold text-golden-700 dark:text-golden-400 hover:underline cursor-pointer"
                        >
                            Clear search filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                        {filteredCategories.map((category) => (
                            <div
                                key={category.id || category.title}
                                className="card p-5 sm:p-6 border border-soft-cream-200/90 dark:border-navy-700 hover:border-golden-400/50 dark:hover:border-golden-500/40 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-soft-cream-200 dark:border-navy-700/80">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">{category.icon || '⚡'}</span>
                                            <h3 className="text-base sm:text-lg font-bold text-navy-900 dark:text-soft-cream-100">
                                                {category.title}
                                            </h3>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-soft-cream-200 dark:bg-navy-700 text-navy-600 dark:text-soft-cream-300">
                                            {(category.skills || []).length}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {(category.skills || []).map((skill, sIdx) => (
                                            <SkillBadge key={sIdx} skill={skill} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Skills;

