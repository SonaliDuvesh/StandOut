import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { projectsAPI, formatRepo } from '../services/api';

export const ensureAbsoluteUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'null') return '';
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

const WebsitePreviewFrame = ({ project, isActive = false, heightClass = 'h-32 xs:h-40 sm:h-52 md:h-60 lg:h-72' }) => {
    const [iframeFailed, setIframeFailed] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [isInteractive, setIsInteractive] = useState(false);

    const liveDemoUrl = ensureAbsoluteUrl(project.project_url);
    const githubUrl = ensureAbsoluteUrl(project.github_url);
    const hasLiveUrl = Boolean(liveDemoUrl);
    const previewImg = project.readme_image || project.image_url;
    const hasReadmeImage = Boolean(previewImg) && !imageFailed;
    const repoIdentifier = project.name || project.repo_name || project.title || 'project';

    useEffect(() => {
        if (!isActive) {
            setIsInteractive(false);
        }
    }, [isActive]);

    useEffect(() => {
        setIframeFailed(false);
        setImageFailed(false);
        setIsInteractive(false);
    }, [project.id, project.project_url]);

    const displayUrl = hasLiveUrl
        ? liveDemoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
        : (githubUrl ? githubUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : `github.com/project/${repoIdentifier}`);

    const targetClickUrl = liveDemoUrl || githubUrl;

    return (
        <div className="relative w-full rounded-2xl overflow-hidden border border-soft-cream-300/80 dark:border-navy-700/90 bg-navy-950 shadow-md">
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-soft-cream-200/95 dark:bg-navy-900/95 border-b border-soft-cream-300/60 dark:border-navy-800 flex items-center justify-between gap-1.5 sm:gap-2 relative z-20">
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-400/80 inline-block"></span>
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-400/80 inline-block"></span>
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400/80 inline-block"></span>
                </div>

                {targetClickUrl ? (
                    <a
                        href={targetClickUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 max-w-[200px] xs:max-w-xs sm:max-w-md mx-auto px-2 sm:px-3 py-0.5 sm:py-1 rounded-md bg-white/70 dark:bg-navy-950/70 hover:bg-white dark:hover:bg-navy-950 text-[10px] sm:text-xs font-mono text-navy-600 dark:text-soft-cream-300 truncate text-center transition-all flex items-center justify-center gap-1.5 border border-soft-cream-300/50 dark:border-navy-800 group shadow-inner cursor-pointer"
                        title={hasLiveUrl ? `Open live site: ${liveDemoUrl}` : `Open repository: ${githubUrl}`}
                    >
                        <span className="text-[10px] sm:text-xs opacity-70 group-hover:opacity-100">{hasLiveUrl ? '🔒' : '📦'}</span>
                        <span className="truncate group-hover:underline">{displayUrl}</span>
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                ) : (
                    <div className="flex-1 max-w-[200px] xs:max-w-xs sm:max-w-md mx-auto px-2 sm:px-2.5 py-0.5 rounded-md bg-white/60 dark:bg-navy-950/60 text-[9px] sm:text-xs font-mono text-navy-500 dark:text-soft-cream-400 truncate text-center">
                        {displayUrl}
                    </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                    {hasLiveUrl && (
                        <a
                            href={liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            title="Open live site in new tab"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="hidden xs:inline">Live ↗</span>
                        </a>
                    )}

                    {isActive && hasLiveUrl && !iframeFailed && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsInteractive((prev) => !prev);
                            }}
                            className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                                isInteractive
                                    ? 'bg-amber-400 text-navy-950 border-amber-300 shadow-sm'
                                    : 'bg-soft-cream-300/70 dark:bg-navy-800/80 text-navy-700 dark:text-soft-cream-300 hover:bg-soft-cream-300 dark:hover:bg-navy-700 border-soft-cream-400/50 dark:border-navy-700'
                            }`}
                            title={isInteractive ? 'Interactive mode active: click inside frame to interact. Click to exit.' : 'Click to enable direct interaction inside the preview frame'}
                        >
                            <span>{isInteractive ? '🎮 Live App' : '⚡ Interactive'}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className={`relative w-full ${heightClass} overflow-hidden bg-navy-900/30 dark:bg-navy-950/50 group/frame`}>
                {hasLiveUrl && !iframeFailed ? (
                    <div className="relative w-full h-full bg-slate-900">
                        {hasReadmeImage && (
                            <img
                                src={previewImg}
                                alt={`${project.title} Preview Backdrop`}
                                className="absolute inset-0 w-full h-full object-cover object-top opacity-70 pointer-events-none"
                                loading="lazy"
                                decoding="async"
                            />
                        )}
                        <iframe
                            src={liveDemoUrl}
                            title={`${project.title} Live Preview`}
                            className={`relative z-10 w-full h-full border-0 bg-white transition-opacity duration-300 ${
                                isActive && isInteractive ? 'pointer-events-auto' : 'pointer-events-none select-none'
                            }`}
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            onError={() => setIframeFailed(true)}
                        />
                        {isActive && !isInteractive && (
                            <a
                                href={liveDemoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-0 z-20 flex items-center justify-center bg-navy-950/0 hover:bg-navy-950/40 transition-all cursor-pointer group/overlay pointer-events-auto"
                                title="Click to open live site in new tab"
                            >
                                <span className="opacity-0 group-hover/overlay:opacity-100 transition-all transform translate-y-2 group-hover/overlay:translate-y-0 duration-200 px-3.5 py-1.5 rounded-xl bg-navy-900/90 text-soft-cream-50 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/20">
                                    <span>🚀 Launch Live Site</span>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </span>
                            </a>
                        )}
                    </div>
                ) : hasReadmeImage ? (
                    <div className="relative w-full h-full bg-slate-900">
                        <img
                            src={previewImg}
                            alt={`${project.title} Preview`}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                            decoding="async"
                            onError={() => setImageFailed(true)}
                        />
                        {isActive && targetClickUrl && (
                            <a
                                href={targetClickUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950/0 hover:bg-navy-950/40 transition-all cursor-pointer group/overlay pointer-events-auto"
                                title={hasLiveUrl ? "Click to open live site in new tab" : "Click to view repository"}
                            >
                                <span className="opacity-0 group-hover/overlay:opacity-100 transition-all transform translate-y-2 group-hover/overlay:translate-y-0 duration-200 px-3.5 py-1.5 rounded-xl bg-navy-900/90 text-soft-cream-50 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/20">
                                    <span>{hasLiveUrl ? '🚀 Visit Live Site' : '📦 View Repository'}</span>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </span>
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-br from-navy-900 via-slate-900 to-navy-950 text-white overflow-hidden select-none border border-navy-800/50">
                        <div
                            className="absolute inset-0 opacity-[0.08] pointer-events-none"
                            style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
                                backgroundSize: '16px 16px',
                            }}
                        />
                        <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base sm:text-lg">📦</span>
                                <span className="text-xs sm:text-sm font-mono font-semibold text-soft-cream-200 truncate">
                                    {repoIdentifier}
                                </span>
                            </div>
                            {project.technologies && project.technologies.length > 0 && (
                                <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                    {project.technologies[0]}
                                </span>
                            )}
                        </div>
                        <div className="relative z-10 my-auto py-2 flex flex-col gap-1.5 opacity-90">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-emerald-400 font-bold">$</span>
                                <span className="text-[11px] font-mono text-soft-cream-300 truncate">
                                    git clone {githubUrl || `https://github.com/project/${repoIdentifier}`}
                                </span>
                            </div>
                            <p className="text-xs text-soft-cream-400 line-clamp-2 italic font-sans mt-0.5">
                                {project.description || 'Repository source code and documentation available on GitHub.'}
                            </p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                            <span className="text-[10px] sm:text-xs font-mono text-soft-cream-400 truncate">
                                {displayUrl}
                            </span>
                            {isActive && targetClickUrl && (
                                <a
                                    href={targetClickUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-semibold transition-all shadow-md shrink-0 cursor-pointer pointer-events-auto"
                                >
                                    <span>{hasLiveUrl ? 'Open Site' : 'View Code'}</span>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Projects = () => {
    const { portfolio } = usePortfolio();

    const [projects, setProjects] = useState(() => {
        if (Array.isArray(portfolio?.projects) && portfolio.projects.length > 0) {
            return portfolio.projects.map(formatRepo);
        }
        return [];
    });

    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedTech, setSelectedTech] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [techSearch, setTechSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);

    const [entranceProgress, setEntranceProgress] = useState(0);

    const sectionRef = useRef(null);
    const filterDropdownRef = useRef(null);

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isSwiping = useRef(false);

    useEffect(() => {
        if (Array.isArray(portfolio?.projects)) {
            setProjects(portfolio.projects.map(formatRepo));
        }
    }, [portfolio?.projects]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
                setIsFilterOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsFilterOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const loadProjects = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) setIsSyncing(true);
        try {
            const githubUser = portfolio?.username || 'username';
            const data = await projectsAPI.fetchLiveGitHub(githubUser);
            if (Array.isArray(data) && data.length > 0) {
                setProjects(data);
                const now = new Date();
                setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
        } catch (err) {
            console.error('Failed to load projects:', err);
        } finally {
            setLoading(false);
            if (isManualRefresh) {
                setTimeout(() => setIsSyncing(false), 600);
            }
        }
    }, [portfolio?.username]);

    const dynamicTechnologies = useMemo(() => {
        const counts = new Map();
        projects.forEach((p) => {
            if (Array.isArray(p.technologies)) {
                p.technologies.forEach((t) => {
                    if (typeof t === 'string' && t.trim()) {
                        const trimmed = t.trim();
                        counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
                    }
                });
            }
        });

        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [projects]);

    const categoryCounts = useMemo(() => {
        let featured = 0;
        let ai = 0;
        projects.forEach((p) => {
            if (p.featured) featured++;
            const isAi = (p.technologies?.some((t) =>
                ['ai', 'opencv', 'ml', 'ocr', 'easyocr', 'fastapi', 'computer vision', 'langchain', 'langgraph', 'gemini', 'data science', 'deep learning'].some((kw) =>
                    t.toLowerCase().includes(kw)
                )
            )) || (p.description && /ai|machine learning|computer vision|opencv|ocr|gemini|llm|deep learning/i.test(p.description));
            if (isAi) ai++;
        });
        return {
            all: projects.length,
            featured,
            ai,
        };
    }, [projects]);

    const activeFilterSummary = useMemo(() => {
        if (selectedTech !== 'all' && categoryFilter !== 'all') {
            const catName = categoryFilter === 'featured' ? '★ Featured' : '🤖 AI';
            return `${catName} + ${selectedTech}`;
        }
        if (selectedTech !== 'all') {
            return `Tech: ${selectedTech}`;
        }
        if (categoryFilter === 'featured') return '★ Featured';
        if (categoryFilter === 'ai') return '🤖 AI & Vision';
        return 'All Projects';
    }, [categoryFilter, selectedTech]);

    const visibleTechnologies = useMemo(() => {
        if (!techSearch.trim()) return dynamicTechnologies;
        const q = techSearch.toLowerCase();
        return dynamicTechnologies.filter((t) => t.name.toLowerCase().includes(q));
    }, [dynamicTechnologies, techSearch]);

    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            if (categoryFilter === 'featured' && !p.featured) return false;
            if (categoryFilter === 'ai') {
                const isAi = (p.technologies?.some((t) =>
                    ['ai', 'opencv', 'ml', 'ocr', 'easyocr', 'fastapi', 'computer vision', 'langchain', 'langgraph', 'gemini', 'data science', 'deep learning'].some((kw) =>
                        t.toLowerCase().includes(kw)
                    )
                )) || (p.description && /ai|machine learning|computer vision|opencv|ocr|gemini|llm|deep learning/i.test(p.description));
                if (!isAi) return false;
            }

            if (selectedTech && selectedTech !== 'all') {
                const hasTech = p.technologies?.some(
                    (t) => t.toLowerCase() === selectedTech.toLowerCase()
                );
                if (!hasTech) return false;
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = p.title?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q);
                const matchDesc = p.description?.toLowerCase().includes(q);
                const matchTech = p.technologies?.some((t) => t.toLowerCase().includes(q));
                return matchName || matchDesc || matchTech;
            }

            return true;
        });
    }, [projects, categoryFilter, selectedTech, searchQuery]);

    const isFiltered = categoryFilter !== 'all' || selectedTech !== 'all' || searchQuery.trim().length > 0;

    const isSectionVisible = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                isSectionVisible.current = entry.isIntersecting;
            },
            { rootMargin: '350px 0px 350px 0px' }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const cardSpacing = useMemo(() => {
        if (windowWidth < 480) return windowWidth * 0.90;
        if (windowWidth < 640) return windowWidth * 0.85;
        if (windowWidth < 1024) return Math.min(windowWidth * 0.74, 620);
        return Math.min(windowWidth * 0.65, 780);
    }, [windowWidth]);

    useEffect(() => {
        let ticking = false;
        let lastEntrance = -1;
        let lastProgress = -1;

        const updateScroll = () => {
            const windowHeight = window.innerHeight;
            const currentScrollY = window.scrollY;

            const heroEl = document.getElementById('home');
            const transitionDistance = heroEl
                ? Math.max(100, heroEl.offsetHeight - windowHeight)
                : windowHeight * 2;

            const entrance = Math.min(1, Math.max(0, currentScrollY / transitionDistance));
            if (Math.abs(entrance - lastEntrance) > 0.003) {
                lastEntrance = entrance;
                setEntranceProgress(entrance);
            }

            if (!sectionRef.current) return;

            const sectionHeight = sectionRef.current.offsetHeight;
            const wheelScrollable = sectionHeight - windowHeight - transitionDistance;

            if (wheelScrollable <= 0) {
                if (lastProgress !== 0) {
                    lastProgress = 0;
                    setScrollProgress(0);
                }
                return;
            }

            const cardProgress = Math.min(1, Math.max(0, (currentScrollY - transitionDistance) / wheelScrollable));
            if (Math.abs(cardProgress - lastProgress) > 0.0015) {
                lastProgress = cardProgress;
                setScrollProgress(cardProgress);
            }
        };

        const handleScroll = () => {
            if (window.scrollY < 3500 || isSectionVisible.current) {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        updateScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        updateScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [filteredProjects.length]);

    const totalCount = filteredProjects.length;
    const floatIndex = totalCount > 1 ? scrollProgress * (totalCount - 1) : 0;
    const activeIndex = Math.min(totalCount - 1, Math.max(0, Math.round(floatIndex)));

    const scrollToIndex = useCallback((index) => {
        if (!sectionRef.current || totalCount <= 1) return;
        const windowHeight = window.innerHeight;
        const heroEl = document.getElementById('home');
        const transitionDistance = heroEl
            ? Math.max(100, heroEl.offsetHeight - windowHeight)
            : windowHeight * 2;
        const sectionHeight = sectionRef.current.offsetHeight;
        const wheelScrollable = sectionHeight - windowHeight - transitionDistance;

        const targetProgress = index / (totalCount - 1);
        const targetScrollY = transitionDistance + targetProgress * wheelScrollable + 5;

        window.scrollTo({
            top: targetScrollY,
            behavior: 'smooth'
        });
    }, [totalCount]);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isSwiping.current = true;
    };

    const handleTouchEnd = (e) => {
        if (!isSwiping.current) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchStartX.current - touchEndX;
        const diffY = touchStartY.current - touchEndY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) {
                scrollToIndex(Math.min(filteredProjects.length - 1, activeIndex + 1));
            } else {
                scrollToIndex(Math.max(0, activeIndex - 1));
            }
        }
        isSwiping.current = false;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (filteredProjects.length <= 1) return;
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    scrollToIndex(Math.max(0, activeIndex - 1));
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    scrollToIndex(Math.min(filteredProjects.length - 1, activeIndex + 1));
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredProjects.length, activeIndex, scrollToIndex]);

    if (!projects || projects.length === 0) {
        return null;
    }

    const runwayHeight = `calc(300vh + ${Math.max(120, filteredProjects.length * 40)}vh)`;

    let projectOpacity = 0;
    let projectScale = 0.65;
    let isProjectVisible = false;

    if (entranceProgress >= 0.4) {
        const t = Math.min(1, (entranceProgress - 0.4) / 0.6);
        projectOpacity = t;
        projectScale = 0.65 + t * 0.35;
        isProjectVisible = true;
    }

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="relative -mt-[300vh] w-full z-20 pointer-events-none bg-transparent"
            style={{ height: runwayHeight }}
        >
            <div
                className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden pt-20 sm:pt-24 lg:pt-24 pb-2 sm:pb-3 px-3 sm:px-6 lg:px-8 bg-soft-cream-50/95 dark:bg-navy-900/95"
                style={{
                    opacity: projectOpacity,
                    visibility: !isProjectVisible ? 'hidden' : 'visible',
                    transform: `scale(${projectScale})`,
                    transformOrigin: 'center center',
                    pointerEvents: isProjectVisible && projectOpacity >= 0.4 ? 'auto' : 'none',
                    transition: 'none',
                }}
            >
                <div className="w-full max-w-7xl mx-auto z-20 shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 mb-2 sm:mb-3">
                        <div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black gradient-text">
                                    Projects
                                </h2>
                                <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-soft-cream-300 border border-navy-200 dark:border-navy-700">
                                    {filteredProjects.length === projects.length
                                        ? `${projects.length} Repos`
                                        : `${filteredProjects.length} of ${projects.length} Repos`}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => loadProjects(true)}
                                disabled={isSyncing}
                                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-xs font-medium text-navy-700 dark:text-soft-cream-200 hover:scale-105 transition-all cursor-pointer shadow-sm border border-emerald-500/30"
                                title="Click to refresh live projects from GitHub"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSyncing ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                </span>
                                <span>{isSyncing ? 'Syncing...' : 'GitHub Synced'}</span>
                                <svg
                                    className={`w-3.5 h-3.5 text-navy-500 dark:text-soft-cream-400 transition-transform ${isSyncing ? 'animate-spin text-amber-500' : 'group-hover:rotate-180'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {lastSyncTime && (
                                    <span className="hidden lg:inline text-[10px] text-navy-400 dark:text-soft-cream-500">
                                        ({lastSyncTime})
                                    </span>
                                )}
                            </button>

                            {filteredProjects.length > 0 && (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl glass border border-soft-cream-300 dark:border-navy-700 text-xs font-mono text-navy-700 dark:text-soft-cream-200">
                                    <button
                                        onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                                        disabled={activeIndex <= 0}
                                        aria-label="Previous project"
                                        className="p-1 rounded-lg hover:bg-soft-cream-200 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="px-1.5 font-bold">
                                        {String(activeIndex + 1).padStart(2, '0')} / {String(filteredProjects.length).padStart(2, '0')}
                                    </span>
                                    <button
                                        onClick={() => scrollToIndex(Math.min(filteredProjects.length - 1, activeIndex + 1))}
                                        disabled={activeIndex >= filteredProjects.length - 1}
                                        aria-label="Next project"
                                        className="p-1 rounded-lg hover:bg-soft-cream-200 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <div className="relative min-w-[200px] sm:min-w-[240px]">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        scrollToIndex(0);
                                    }}
                                    placeholder="Search repos, tech..."
                                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl glass border border-soft-cream-300 dark:border-navy-700 text-navy-800 dark:text-soft-cream-100 placeholder-navy-400 dark:placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                                />
                                <svg
                                    className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400 dark:text-soft-cream-400"
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
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pb-2">
                        <div className="relative" ref={filterDropdownRef}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm border ${isFilterOpen || categoryFilter !== 'all' || selectedTech !== 'all'
                                    ? 'bg-navy-800 text-soft-cream-50 dark:bg-soft-cream-500 dark:text-navy-900 border-navy-700 dark:border-soft-cream-400'
                                    : 'glass border-soft-cream-300 dark:border-navy-700 text-navy-700 dark:text-soft-cream-200 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                                    }`}
                                aria-expanded={isFilterOpen}
                                aria-label="Project filter menu"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <span>{activeFilterSummary}</span>
                                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-navy-900/10 dark:bg-soft-cream-100/20">
                                    {filteredProjects.length}
                                </span>
                                <svg
                                    className={`w-3 h-3 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isFilterOpen && (
                                <div className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 shadow-2xl p-3 bg-soft-cream-50/95 dark:bg-navy-900/95 backdrop-blur-xl animate-fade-in text-navy-800 dark:text-soft-cream-100">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-soft-cream-300/60 dark:border-navy-700/80">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 dark:text-soft-cream-400">
                                            Select Filter
                                        </span>
                                        {isFiltered && (
                                             <button
                                                onClick={() => {
                                                    setCategoryFilter('all');
                                                    setSelectedTech('all');
                                                    setSearchQuery('');
                                                    scrollToIndex(0);
                                                }}
                                                className="text-[11px] font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 cursor-pointer"
                                            >
                                                Reset All
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        {[
                                            { key: 'all', label: 'All Projects', count: categoryCounts.all, icon: '🌐' },
                                            { key: 'featured', label: '★ Featured', count: categoryCounts.featured, icon: '⭐' },
                                            { key: 'ai', label: 'AI & Machine Learning', count: categoryCounts.ai, icon: '🤖' },
                                        ].map((cat) => {
                                            const isSelected = categoryFilter === cat.key && selectedTech === 'all';
                                            return (
                                                <button
                                                    key={cat.key}
                                                    onClick={() => {
                                                        setCategoryFilter(cat.key);
                                                        setSelectedTech('all');
                                                        setIsFilterOpen(false);
                                                        scrollToIndex(0);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${isSelected
                                                        ? 'bg-navy-800 text-soft-cream-50 dark:bg-soft-cream-500 dark:text-navy-950 font-semibold shadow-sm'
                                                        : 'hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 text-navy-700 dark:text-soft-cream-200'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span>{cat.icon}</span>
                                                        <span>{cat.label}</span>
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isSelected
                                                        ? 'bg-white/20 dark:bg-navy-900/20'
                                                        : 'bg-soft-cream-200 dark:bg-navy-800 text-navy-500 dark:text-soft-cream-400'
                                                        }`}>
                                                        {cat.count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-2 border-t border-soft-cream-300/60 dark:border-navy-700/80">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 dark:text-soft-cream-400 flex items-center gap-1.5">
                                                <span>⚡ Technologies</span>
                                                <span className="text-[10px] font-normal text-navy-400 dark:text-soft-cream-500">
                                                    ({dynamicTechnologies.length} detected)
                                                </span>
                                            </span>
                                        </div>

                                        {dynamicTechnologies.length > 5 && (
                                            <div className="relative mb-2">
                                                <input
                                                    type="text"
                                                    value={techSearch}
                                                    onChange={(e) => setTechSearch(e.target.value)}
                                                    placeholder="Search technologies..."
                                                    className="w-full pl-7 pr-3 py-1 text-[11px] rounded-lg glass border border-soft-cream-300 dark:border-navy-700 placeholder-navy-400 dark:placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                                                />
                                                <svg
                                                    className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-navy-400 dark:text-soft-cream-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                                            <button
                                                onClick={() => {
                                                    setSelectedTech('all');
                                                    setIsFilterOpen(false);
                                                    scrollToIndex(0);
                                                }}
                                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedTech === 'all'
                                                    ? 'bg-navy-200 dark:bg-navy-800 text-navy-900 dark:text-soft-cream-100 font-semibold'
                                                    : 'hover:bg-soft-cream-200/60 dark:hover:bg-navy-800/60 text-navy-600 dark:text-soft-cream-300'
                                                    }`}
                                            >
                                                <span>All Technologies</span>
                                                <span className="text-[10px] font-mono text-navy-400 dark:text-soft-cream-500">
                                                    {projects.length}
                                                </span>
                                            </button>

                                            {visibleTechnologies.map((t) => {
                                                const isSelected = selectedTech.toLowerCase() === t.name.toLowerCase();
                                                return (
                                                    <button
                                                        key={t.name}
                                                        onClick={() => {
                                                            setSelectedTech(t.name);
                                                            setIsFilterOpen(false);
                                                            scrollToIndex(0);
                                                        }}
                                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isSelected
                                                            ? 'bg-navy-800 text-soft-cream-50 dark:bg-soft-cream-500 dark:text-navy-950 font-semibold shadow-sm'
                                                            : 'hover:bg-soft-cream-200/60 dark:hover:bg-navy-800/60 text-navy-700 dark:text-soft-cream-200'
                                                            }`}
                                                    >
                                                        <span className="truncate">{t.name}</span>
                                                        <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isSelected
                                                            ? 'bg-white/20 dark:bg-navy-900/20'
                                                            : 'bg-soft-cream-200 dark:bg-navy-800 text-navy-500 dark:text-soft-cream-400'
                                                            }`}>
                                                            {t.count}
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            {visibleTechnologies.length === 0 && (
                                                <p className="text-center py-3 text-xs text-navy-400 dark:text-soft-cream-500">
                                                    No technologies match "{techSearch}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative hidden sm:inline-block">
                            <select
                                value={selectedTech}
                                onChange={(e) => {
                                    setSelectedTech(e.target.value);
                                    scrollToIndex(0);
                                }}
                                aria-label="Filter by technology"
                                className="px-3 py-1.5 rounded-xl glass border border-soft-cream-300 dark:border-navy-700 text-xs font-medium text-navy-800 dark:text-soft-cream-100 bg-white/70 dark:bg-navy-800/70 cursor-pointer focus:outline-none focus:ring-1 focus:ring-navy-500"
                            >
                                <option value="all">⚡ All Technologies ({projects.length})</option>
                                {dynamicTechnologies.map((t) => (
                                    <option key={t.name} value={t.name}>
                                        {t.name} ({t.count} {t.count === 1 ? 'project' : 'projects'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isFiltered && (
                            <button
                                onClick={() => {
                                    setCategoryFilter('all');
                                    setSelectedTech('all');
                                    setSearchQuery('');
                                    scrollToIndex(0);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium text-navy-600 dark:text-soft-cream-400 hover:text-navy-900 dark:hover:text-soft-cream-100 glass hover:bg-soft-cream-200 dark:hover:bg-navy-800 border border-soft-cream-300 dark:border-navy-700 transition-all cursor-pointer"
                                title="Reset all filters"
                            >
                                <span>Reset Filters</span>
                                <span className="text-xs">✕</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-navy-300 dark:border-navy-700 border-t-navy-700 dark:border-t-soft-cream-400 rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-navy-600 dark:text-soft-cream-400 animate-pulse">
                            Fetching live GitHub repositories...
                        </p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg font-semibold text-navy-700 dark:text-soft-cream-300 mb-2">
                            No projects match the selected filter
                        </p>
                        <button
                            onClick={() => {
                                setCategoryFilter('all');
                                setSelectedTech('all');
                                setSearchQuery('');
                                scrollToIndex(0);
                            }}
                            className="btn-primary text-xs px-4 py-2 mt-2 cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div
                        className="relative w-full flex-1 flex items-center justify-center perspective-1200 preserve-3d overflow-visible my-auto min-h-0 touch-pan-y"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="absolute w-[300px] sm:w-[600px] h-[200px] sm:h-[350px] bg-soft-cream-400/20 dark:bg-navy-700/30 rounded-full blur-3xl pointer-events-none" />

                        <button
                            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                            disabled={activeIndex <= 0}
                            aria-label="Previous Project"
                            className="hidden md:flex absolute left-2 lg:left-6 z-[120] w-12 h-12 items-center justify-center rounded-full glass border border-soft-cream-300 dark:border-navy-700 text-navy-800 dark:text-soft-cream-100 shadow-2xl hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer transition-all bg-white/90 dark:bg-navy-800/90 pointer-events-auto"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={() => scrollToIndex(Math.min(filteredProjects.length - 1, activeIndex + 1))}
                            disabled={activeIndex >= filteredProjects.length - 1}
                            aria-label="Next Project"
                            className="hidden md:flex absolute right-2 lg:right-6 z-[120] w-12 h-12 items-center justify-center rounded-full glass border border-soft-cream-300 dark:border-navy-700 text-navy-800 dark:text-soft-cream-100 shadow-2xl hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer transition-all bg-white/90 dark:bg-navy-800/90 pointer-events-auto"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {filteredProjects
                            .map((project, index) => {
                                const delta = index - floatIndex;
                                return {
                                    project,
                                    index,
                                    delta,
                                    absDelta: Math.abs(delta),
                                };
                            })
                            .filter((item) => item.absDelta <= 2.6)
                            .sort((a, b) => b.absDelta - a.absDelta)
                            .map(({ project, index, delta, absDelta }) => {
                                const isCurrent = absDelta < 0.45;
                                const rotateY = delta * -22;
                                const translateX = delta * cardSpacing;
                                const translateZ = isCurrent ? 60 : -absDelta * 320 - 150;
                                const scale = isCurrent ? 1 : Math.max(0.72, 1 - absDelta * 0.18);
                                const opacity = Math.max(0, 1 - Math.pow(absDelta / 2.5, 1.4));
                                const zIndex = isCurrent ? 100 : Math.max(1, Math.round(50 - absDelta * 15));

                                const liveDemoUrl = ensureAbsoluteUrl(project.project_url);
                                const githubUrl = ensureAbsoluteUrl(project.github_url);
                                const hasLiveUrl = Boolean(liveDemoUrl);

                                return (
                                    <div
                                        key={project.id ?? project.name ?? project.title ?? index}
                                        onClick={() => {
                                            if (!isCurrent) scrollToIndex(index);
                                        }}
                                        className={`absolute w-full max-w-[94vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl px-1 sm:px-4 will-change-transform ${
                                            isCurrent ? 'cursor-default pointer-events-auto' : 'cursor-pointer pointer-events-auto'
                                        }`}
                                        style={{
                                            transform: `translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                                            opacity,
                                            zIndex,
                                            transformOrigin: 'center center',
                                            backfaceVisibility: 'hidden',
                                            WebkitBackfaceVisibility: 'hidden',
                                        }}
                                    >
                                        <div
                                            className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 glass transition-all duration-200 flex flex-col gap-1.5 sm:gap-2 overflow-hidden ${
                                                isCurrent
                                                    ? 'shadow-2xl ring-2 ring-emerald-500/40 dark:ring-emerald-400/40 bg-white/95 dark:bg-navy-800/95 pointer-events-auto'
                                                    : 'shadow-lg opacity-80 hover:opacity-100 bg-white/75 dark:bg-navy-800/75 pointer-events-none'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 sm:gap-3 relative z-20">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                                        <span className="text-[10px] sm:text-xs font-mono font-bold text-navy-400 dark:text-soft-cream-500">
                                                            #{String(index + 1).padStart(2, '0')}
                                                        </span>
                                                        {project.featured && (
                                                            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-soft-cream-200 font-semibold flex items-center gap-1">
                                                                ★ Featured
                                                            </span>
                                                        )}
                                                        {project.is_fork && (
                                                            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                                                                Fork
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base sm:text-xl lg:text-3xl font-extrabold text-navy-900 dark:text-soft-cream-100 truncate tracking-tight">
                                                        {project.title}
                                                    </h3>
                                                    {githubUrl ? (
                                                        <a
                                                            href={githubUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[10px] sm:text-xs font-mono text-navy-500 dark:text-soft-cream-400 hover:text-navy-900 dark:hover:text-soft-cream-100 truncate inline-block hover:underline cursor-pointer"
                                                        >
                                                            {project.name || project.repo_name || project.title} ↗
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] sm:text-xs font-mono text-navy-400 dark:text-soft-cream-500 truncate block">
                                                            {project.name || project.repo_name || project.title}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 sm:gap-3 text-xs text-navy-500 dark:text-soft-cream-400 shrink-0 pt-1">
                                                    {project.stars > 0 && (
                                                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs">
                                                            <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            {project.stars}
                                                        </span>
                                                    )}
                                                    {project.forks > 0 && (
                                                        <span className="inline-flex items-center gap-1 font-medium text-[11px] sm:text-xs">
                                                            <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                                                            </svg>
                                                            {project.forks}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <WebsitePreviewFrame project={project} isActive={isCurrent} heightClass="h-32 xs:h-40 sm:h-52 md:h-60 lg:h-72" />

                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 relative z-30 pointer-events-auto">
                                                {hasLiveUrl ? (
                                                    <a
                                                        href={liveDemoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] sm:text-xs md:text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                        title={`Open Live Deployed Website: ${liveDemoUrl}`}
                                                    >
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                                        </span>
                                                        <span>Live Demo</span>
                                                        <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-100/70 dark:bg-navy-800/70 text-navy-500 dark:text-soft-cream-400 text-[11px] sm:text-xs font-medium border border-dashed border-navy-300 dark:border-navy-700 cursor-help"
                                                        title="No live demo URL configured for this repository"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-navy-400 dark:bg-navy-500"></span>
                                                        <span>Code Only</span>
                                                    </span>
                                                )}

                                                {githubUrl && (
                                                    <a
                                                        href={githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-navy-900 text-soft-cream-50 dark:bg-soft-cream-500 dark:text-navy-950 text-[11px] sm:text-xs md:text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                                                        title="Open GitHub Repository"
                                                    >
                                                        <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" viewBox="0 0 24 24">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                                        </svg>
                                                        <span>GitHub Repository</span>
                                                    </a>
                                                )}
                                            </div>

                                            <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-navy-700 dark:text-soft-cream-200/90 leading-relaxed line-clamp-2 sm:line-clamp-3">
                                                {project.description}
                                            </p>

                                            <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                                                {project.technologies?.slice(0, 6).map((tech, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium bg-soft-cream-200/80 dark:bg-navy-700/80 text-navy-800 dark:text-soft-cream-200 border border-soft-cream-300/50 dark:border-navy-600"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Projects;
