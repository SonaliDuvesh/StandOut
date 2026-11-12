import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../contexts/PortfolioContext';
import { CERTIFICATIONS_DATA, LINKEDIN_PROFILE_CERTIFICATIONS_URL, generateCertificateSvg } from '../services/api';

const CertificatePreviewFrame = ({ cert, onExpand, heightClass = 'h-[140px] xs:h-[160px] sm:h-[185px] md:h-[205px] lg:h-[220px] xl:h-[250px]' }) => {
    const { portfolio } = usePortfolio();

    const svgFallback = useMemo(() => {
        return generateCertificateSvg(cert, cert.recipient_name || portfolio?.name || 'Verified Candidate');
    }, [cert, portfolio?.name]);

    const initialSrc = useMemo(() => {
        if (cert.certificate_image) {
            if (cert.certificate_image.startsWith('/certificates/') && !cert.certificate_image.includes('-preview.webp')) {
                return cert.certificate_image.replace(/\.png$/i, '-preview.webp');
            }
            return cert.certificate_image;
        }
        return cert.remote_badge_url || cert.image_url || svgFallback;
    }, [cert, svgFallback]);

    const [currentSrc, setCurrentSrc] = useState(initialSrc);
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setCurrentSrc(initialSrc);
        setImageFailed(false);
    }, [initialSrc]);

    const handleImageError = () => {
        if (currentSrc && currentSrc.includes('-preview.webp') && cert.certificate_image) {
            setCurrentSrc(cert.certificate_image);
        } else if (cert.remote_badge_url && currentSrc !== cert.remote_badge_url) {
            setCurrentSrc(cert.remote_badge_url);
        } else if (cert.image_url && currentSrc !== cert.image_url) {
            setCurrentSrc(cert.image_url);
        } else if (currentSrc !== svgFallback) {
            setCurrentSrc(svgFallback);
        } else {
            setImageFailed(true);
        }
    };

    const targetUrl = cert.credential_url || cert.credentialUrl || cert.linkedin_url || '#';
    const displayUrl = cert.credential_url || cert.credentialUrl
        ? (cert.credential_url || cert.credentialUrl).replace(/^https?:\/\//, '').replace(/\/$/, '')
        : 'verified-credential';

    return (
        <div
            onClick={(e) => {
                if (onExpand) {
                    e.stopPropagation();
                    onExpand(cert);
                }
            }}
            className="group/frame relative w-full rounded-2xl overflow-hidden border border-soft-cream-300/80 dark:border-navy-700/90 bg-navy-950 shadow-md cursor-zoom-in"
            title="Click to view full certificate"
        >
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-soft-cream-200/90 dark:bg-navy-900/90 border-b border-soft-cream-300/60 dark:border-navy-800 flex items-center justify-between gap-1.5 sm:gap-2 relative z-20">
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-400/80 inline-block"></span>
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-400/80 inline-block"></span>
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400/80 inline-block"></span>
                </div>

                <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 max-w-[190px] xs:max-w-xs sm:max-w-md mx-auto px-2 py-0.5 rounded-md bg-white/70 dark:bg-navy-950/70 hover:bg-white dark:hover:bg-navy-950 text-[9px] sm:text-xs font-mono text-navy-600 dark:text-soft-cream-300 truncate text-center transition-all flex items-center justify-center gap-1 border border-soft-cream-300/50 dark:border-navy-800 group cursor-pointer shadow-inner"
                    title={`Open credential link: ${targetUrl}`}
                >
                    <span className="opacity-70 group-hover:opacity-100">🔒</span>
                    <span className="truncate group-hover:underline">{displayUrl}</span>
                    <svg className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>

                <div className="flex items-center gap-1.5 shrink-0">
                    <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[9px] sm:text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        title="Open verification record"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="hidden xs:inline">Verified ↗</span>
                    </a>
                    <span className="p-0.5 rounded text-navy-400 hover:text-navy-700 dark:text-soft-cream-400 dark:hover:text-soft-cream-100 group-hover/frame:scale-110 transition-transform">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </span>
                </div>
            </div>

            <div className={`relative w-full ${heightClass} overflow-hidden bg-navy-900/50 dark:bg-navy-950/80 flex items-center justify-center p-1.5 sm:p-3 select-none`}>
                <img
                    src={currentSrc || svgFallback}
                    alt={`${cert.title} Certificate`}
                    className="w-full h-full object-contain pointer-events-none drop-shadow-md transition-transform duration-300 group-hover/frame:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                />
                <div className="absolute inset-0 bg-navy-950/0 group-hover/frame:bg-navy-950/20 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover/frame:opacity-100 transition-opacity px-2.5 py-1 rounded-lg bg-navy-900/80 text-white text-[10px] sm:text-xs font-mono font-medium backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                        Click to View Full Size
                    </span>
                </div>
            </div>
        </div>
    );
};

const Certifications = () => {
    const { portfolio } = usePortfolio();

    const certifications = useMemo(() => {
        if (Array.isArray(portfolio?.certifications) && portfolio.certifications.length > 0) {
            return portfolio.certifications;
        }
        return CERTIFICATIONS_DATA;
    }, [portfolio?.certifications]);

    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedIssuer, setSelectedIssuer] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [selectedCertForModal, setSelectedCertForModal] = useState(null);

    useEffect(() => {
        if (selectedCertForModal) {
            const originalBodyOverflow = document.body.style.overflow;
            const originalHtmlOverflow = document.documentElement.style.overflow;
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            const preventScroll = (e) => {
                e.preventDefault();
            };

            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    setSelectedCertForModal(null);
                } else if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'].includes(e.key)) {
                    e.preventDefault();
                }
            };

            window.addEventListener('wheel', preventScroll, { passive: false });
            window.addEventListener('touchmove', preventScroll, { passive: false });
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                document.body.style.overflow = originalBodyOverflow;
                document.documentElement.style.overflow = originalHtmlOverflow;
                window.removeEventListener('wheel', preventScroll);
                window.removeEventListener('touchmove', preventScroll);
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [selectedCertForModal]);

    const sectionRef = useRef(null);
    const filterDropdownRef = useRef(null);

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isSwiping = useRef(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
                setIsFilterOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsFilterOpen(false);
                setSelectedCertForModal(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const dynamicIssuers = useMemo(() => {
        const counts = new Map();
        certifications.forEach((c) => {
            const issuer = c.issuer_code || c.issuer;
            if (issuer) {
                counts.set(issuer, (counts.get(issuer) || 0) + 1);
            }
        });
        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [certifications]);

    const categoryCounts = useMemo(() => {
        const counts = {
            all: certifications.length,
            cyber: 0,
            ai: 0,
            science: 0,
            leadership: 0,
        };
        certifications.forEach((c) => {
            const cat = (c.category || '').toLowerCase();
            if (cat.includes('cyber') || cat.includes('osint')) counts.cyber++;
            if (cat.includes('ai') || cat.includes('data')) counts.ai++;
            if (cat.includes('science')) counts.science++;
            if (cat.includes('leadership') || cat.includes('events')) counts.leadership++;
        });
        return counts;
    }, [certifications]);

    const filteredCerts = useMemo(() => {
        return certifications.filter((c) => {
            if (categoryFilter !== 'all') {
                const cat = (c.category || '').toLowerCase();
                if (categoryFilter === 'cyber' && !cat.includes('cyber') && !cat.includes('osint')) return false;
                if (categoryFilter === 'ai' && !cat.includes('ai') && !cat.includes('data')) return false;
                if (categoryFilter === 'science' && !cat.includes('science')) return false;
                if (categoryFilter === 'leadership' && !cat.includes('leadership') && !cat.includes('events')) return false;
            }

            if (selectedIssuer !== 'all') {
                const code = (c.issuer_code || c.issuer || '').toLowerCase();
                if (code !== selectedIssuer.toLowerCase()) return false;
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = (c.title || '').toLowerCase().includes(q);
                const matchIssuer = (c.issuer || '').toLowerCase().includes(q);
                const matchDesc = (c.description || '').toLowerCase().includes(q);
                const matchSkills = c.skills?.some((s) => s.toLowerCase().includes(q));
                return matchTitle || matchIssuer || matchDesc || matchSkills;
            }

            return true;
        });
    }, [certifications, categoryFilter, selectedIssuer, searchQuery]);

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
        let lastProgress = -1;

        const updateScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const sectionHeight = sectionRef.current.offsetHeight;
            const scrollableDistance = sectionHeight - windowHeight;

            if (scrollableDistance <= 0) {
                if (lastProgress !== 0) {
                    lastProgress = 0;
                    setScrollProgress(0);
                }
                return;
            }

            const scrolled = -rect.top;
            const progress = Math.min(1, Math.max(0, scrolled / scrollableDistance));
            if (Math.abs(progress - lastProgress) > 0.0015) {
                lastProgress = progress;
                setScrollProgress(progress);
            }
        };

        const handleScroll = () => {
            if (selectedCertForModal) return;
            if (!isSectionVisible.current) return;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        updateScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [filteredCerts.length, selectedCertForModal]);

    const totalCount = filteredCerts.length;
    const floatIndex = totalCount > 1 ? scrollProgress * (totalCount - 1) : 0;
    const activeIndex = Math.min(totalCount - 1, Math.max(0, Math.round(floatIndex)));

    const scrollToIndex = useCallback((index) => {
        if (!sectionRef.current || totalCount <= 1) return;
        const windowHeight = window.innerHeight;
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const sectionTop = window.scrollY + sectionRect.top;
        const sectionHeight = sectionRef.current.offsetHeight;
        const scrollableDistance = sectionHeight - windowHeight;

        const targetProgress = index / (totalCount - 1);
        const targetScrollY = sectionTop + targetProgress * scrollableDistance + 3;

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
                scrollToIndex(Math.min(filteredCerts.length - 1, activeIndex + 1));
            } else {
                scrollToIndex(Math.max(0, activeIndex - 1));
            }
        }
        isSwiping.current = false;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedCertForModal) return;
            if (filteredCerts.length <= 1) return;
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    scrollToIndex(Math.max(0, activeIndex - 1));
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    scrollToIndex(Math.min(filteredCerts.length - 1, activeIndex + 1));
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredCerts.length, activeIndex, scrollToIndex, selectedCertForModal]);

    const activeFilterLabel = useMemo(() => {
        if (selectedIssuer !== 'all') return `Issuer: ${selectedIssuer}`;
        if (categoryFilter === 'cyber') return 'Cyber & OSINT';
        if (categoryFilter === 'ai') return 'AI & Data Science';
        if (categoryFilter === 'science') return 'Open Science';
        if (categoryFilter === 'leadership') return 'Leadership & Events';
        return 'All Certifications';
    }, [categoryFilter, selectedIssuer]);

    const isFiltered = categoryFilter !== 'all' || selectedIssuer !== 'all' || searchQuery.trim().length > 0;

    const runwayHeight = `calc(100vh + ${Math.max(120, filteredCerts.length * 42)}vh)`;

    if (!certifications || certifications.length === 0) {
        return null;
    }

    return (
        <section
            id="certifications"
            ref={sectionRef}
            className="relative w-full z-10 bg-soft-cream-50 dark:bg-navy-900 transition-colors duration-300"
            style={{ height: runwayHeight }}
        >
            <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden pt-20 sm:pt-24 lg:pt-24 pb-1 px-3 sm:px-6 lg:px-8 bg-soft-cream-50/98 dark:bg-navy-900/98">
                <div className="w-full max-w-7xl mx-auto z-20 shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1 sm:mb-1.5">
                        <div>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black gradient-text">
                                    Certifications
                                </h2>
                                <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-soft-cream-300 border border-navy-200 dark:border-navy-700">
                                    {filteredCerts.length === certifications.length
                                        ? `${certifications.length} Credentials`
                                        : `${filteredCerts.length} of ${certifications.length} Credentials`}
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-navy-600 dark:text-soft-cream-400 mt-0.5 hidden sm:block">
                                Verified professional credentials, NASA digital badges, and cybersecurity achievements
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <a
                                href={portfolio?.social_links?.linkedin ? `${portfolio.social_links.linkedin.replace(/\/$/, '')}/details/certifications/` : LINKEDIN_PROFILE_CERTIFICATIONS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/80 dark:bg-navy-800/80 text-[11px] sm:text-xs font-medium text-navy-700 dark:text-soft-cream-200 hover:scale-105 transition-all cursor-pointer shadow-sm border border-blue-500/30"
                                title="Open verified certifications on LinkedIn"
                            >
                                <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                </svg>
                                <span>LinkedIn</span>
                                <svg className="w-3 h-3 text-navy-400 dark:text-soft-cream-400 group-hover:translate-x-0.5 transition-transform hidden xs:inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>

                            {filteredCerts.length > 0 && (
                                <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-white/80 dark:bg-navy-800/80 border border-soft-cream-300 dark:border-navy-700 text-[11px] sm:text-xs font-mono text-navy-700 dark:text-soft-cream-200">
                                    <button
                                        onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                                        disabled={activeIndex <= 0}
                                        aria-label="Previous certification"
                                        className="p-1 rounded-lg hover:bg-soft-cream-200 dark:hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="px-1 font-bold">
                                        {String(activeIndex + 1).padStart(2, '0')} / {String(filteredCerts.length).padStart(2, '0')}
                                    </span>
                                    <button
                                        onClick={() => scrollToIndex(Math.min(filteredCerts.length - 1, activeIndex + 1))}
                                        disabled={activeIndex >= filteredCerts.length - 1}
                                        aria-label="Next certification"
                                        className="p-1 rounded-lg hover:bg-soft-cream-200 dark:hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <div className="relative min-w-[150px] sm:min-w-[220px]">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        scrollToIndex(0);
                                    }}
                                    placeholder="Search certs..."
                                    className="w-full pl-7 sm:pl-8 pr-6 sm:pr-7 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-xl bg-white/80 dark:bg-navy-800/80 border border-soft-cream-300 dark:border-navy-700 text-navy-800 dark:text-soft-cream-100 placeholder-navy-400 dark:placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                                />
                                <svg
                                    className="w-3 sm:w-3.5 h-3 sm:h-3.5 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-navy-400 dark:text-soft-cream-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            scrollToIndex(0);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-navy-400 hover:text-navy-600 dark:hover:text-soft-cream-200 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pb-0.5 sm:pb-1">
                        <div className="relative" ref={filterDropdownRef}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-sm border ${
                                    isFilterOpen || categoryFilter !== 'all' || selectedIssuer !== 'all'
                                        ? 'bg-golden-700 text-white dark:bg-golden-500 dark:text-navy-950 border-golden-600 dark:border-golden-400'
                                        : 'bg-white/80 dark:bg-navy-800/80 border-soft-cream-300 dark:border-navy-700 text-navy-700 dark:text-soft-cream-200 hover:bg-soft-cream-200 dark:hover:bg-navy-700'
                                }`}
                                aria-expanded={isFilterOpen}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <span className="max-w-[130px] sm:max-w-none truncate">{activeFilterLabel}</span>
                                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-navy-900/10 dark:bg-soft-cream-100/20">
                                    {filteredCerts.length}
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
                                <div className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl bg-white/95 dark:bg-navy-900/95 border border-soft-cream-300 dark:border-navy-700 shadow-2xl p-3 backdrop-blur-md animate-fade-in text-navy-800 dark:text-soft-cream-100">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-soft-cream-300/60 dark:border-navy-700/80">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 dark:text-soft-cream-400">
                                            Domain Category
                                        </span>
                                        {isFiltered && (
                                            <button
                                                onClick={() => {
                                                    setCategoryFilter('all');
                                                    setSelectedIssuer('all');
                                                    setSearchQuery('');
                                                    scrollToIndex(0);
                                                }}
                                                className="text-[11px] font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 cursor-pointer"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-1 mb-2.5">
                                        {[
                                            { key: 'all', label: 'All Certifications', count: categoryCounts.all, icon: '📜' },
                                            { key: 'cyber', label: 'Cybersecurity & OSINT', count: categoryCounts.cyber, icon: '🛡️' },
                                            { key: 'ai', label: 'AI & Data Science', count: categoryCounts.ai, icon: '🧠' },
                                            { key: 'science', label: 'NASA Open Science', count: categoryCounts.science, icon: '🚀' },
                                            { key: 'leadership', label: 'Leadership & Events', count: categoryCounts.leadership, icon: '🏆' },
                                        ].map((cat) => {
                                            const isSelected = categoryFilter === cat.key && selectedIssuer === 'all';
                                            return (
                                                <button
                                                    key={cat.key}
                                                    onClick={() => {
                                                        setCategoryFilter(cat.key);
                                                        setSelectedIssuer('all');
                                                        setIsFilterOpen(false);
                                                        scrollToIndex(0);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-golden-700 text-white dark:bg-golden-500 dark:text-navy-950 font-semibold shadow-sm'
                                                            : 'hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 text-navy-700 dark:text-soft-cream-200'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span>{cat.icon}</span>
                                                        <span>{cat.label}</span>
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                                        isSelected
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
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 dark:text-soft-cream-400 mb-1.5 block">
                                            Issuing Organizations
                                        </span>
                                        <div className="max-h-36 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                                            {dynamicIssuers.map((item) => {
                                                const isSelected = selectedIssuer.toLowerCase() === item.name.toLowerCase();
                                                return (
                                                    <button
                                                        key={item.name}
                                                        onClick={() => {
                                                            setSelectedIssuer(item.name);
                                                            setIsFilterOpen(false);
                                                            scrollToIndex(0);
                                                        }}
                                                        className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-golden-700 text-white dark:bg-golden-500 dark:text-navy-950 font-semibold shadow-sm'
                                                                : 'hover:bg-soft-cream-200/60 dark:hover:bg-navy-800/60 text-navy-700 dark:text-soft-cream-200'
                                                        }`}
                                                    >
                                                        <span className="truncate">{item.name}</span>
                                                        <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-soft-cream-200 dark:bg-navy-800 text-navy-500 dark:text-soft-cream-400">
                                                            {item.count}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative hidden sm:inline-block">
                            <select
                                value={selectedIssuer}
                                onChange={(e) => {
                                    setSelectedIssuer(e.target.value);
                                    scrollToIndex(0);
                                }}
                                aria-label="Filter by issuing organization"
                                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/80 dark:bg-navy-800/80 border border-soft-cream-300 dark:border-navy-700 text-[11px] sm:text-xs font-medium text-navy-800 dark:text-soft-cream-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-navy-500"
                            >
                                <option value="all">🏢 All Issuers ({certifications.length})</option>
                                {dynamicIssuers.map((iss) => (
                                    <option key={iss.name} value={iss.name}>
                                        {iss.name} ({iss.count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isFiltered && (
                            <button
                                onClick={() => {
                                    setCategoryFilter('all');
                                    setSelectedIssuer('all');
                                    setSearchQuery('');
                                    scrollToIndex(0);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-medium text-navy-600 dark:text-soft-cream-400 hover:text-navy-900 dark:hover:text-soft-cream-100 bg-white/80 dark:bg-navy-800/80 border border-soft-cream-300 dark:border-navy-700 transition-all cursor-pointer"
                            >
                                <span>Reset</span>
                                <span className="text-xs">✕</span>
                            </button>
                        )}
                    </div>
                </div>

                {filteredCerts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg font-semibold text-navy-700 dark:text-soft-cream-300 mb-2">
                            No certifications match the selected filter
                        </p>
                        <button
                            onClick={() => {
                                setCategoryFilter('all');
                                setSelectedIssuer('all');
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
                        className="relative w-full flex-1 flex items-center justify-center perspective-1200 preserve-3d overflow-visible -mt-8 sm:-mt-10 lg:-mt-12 mb-0 min-h-0 touch-pan-y"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="absolute w-[300px] sm:w-[600px] h-[200px] sm:h-[350px] bg-soft-cream-400/20 dark:bg-navy-700/30 rounded-full blur-3xl pointer-events-none" />

                        <button
                            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                            disabled={activeIndex <= 0}
                            aria-label="Previous Certificate"
                            className="hidden md:flex absolute left-2 lg:left-6 z-[120] w-12 h-12 items-center justify-center rounded-full glass border border-soft-cream-300 dark:border-navy-700 text-navy-800 dark:text-soft-cream-100 shadow-2xl hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer transition-all bg-white/90 dark:bg-navy-800/90 pointer-events-auto"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={() => scrollToIndex(Math.min(filteredCerts.length - 1, activeIndex + 1))}
                            disabled={activeIndex >= filteredCerts.length - 1}
                            aria-label="Next Certificate"
                            className="hidden md:flex absolute right-2 lg:right-6 z-[120] w-12 h-12 items-center justify-center rounded-full glass border border-soft-cream-300 dark:border-navy-700 text-navy-800 dark:text-soft-cream-100 shadow-2xl hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer transition-all bg-white/90 dark:bg-navy-800/90 pointer-events-auto"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {filteredCerts
                            .map((cert, index) => {
                                const delta = index - floatIndex;
                                return {
                                    cert,
                                    index,
                                    delta,
                                    absDelta: Math.abs(delta),
                                };
                            })
                            .filter((item) => item.absDelta <= 2.6)
                            .sort((a, b) => b.absDelta - a.absDelta)
                            .map(({ cert, index, delta, absDelta }) => {
                                const isCurrent = absDelta < 0.45;
                                const rotateY = delta * -22;
                                const translateX = delta * cardSpacing;
                                const translateZ = isCurrent ? 60 : -absDelta * 320 - 150;
                                const scale = isCurrent ? 1 : Math.max(0.72, 1 - absDelta * 0.18);
                                const opacity = Math.max(0, 1 - Math.pow(absDelta / 2.5, 1.4));
                                const zIndex = isCurrent ? 100 : Math.max(1, Math.round(50 - absDelta * 15));

                                return (
                                    <div
                                        key={cert.id || index}
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
                                            className={`rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 lg:p-4 transition-colors duration-200 flex flex-col gap-1 sm:gap-1.5 overflow-hidden border ${
                                                isCurrent
                                                    ? 'shadow-2xl ring-2 ring-golden-500/50 dark:ring-golden-400/50 bg-white/95 dark:bg-navy-800/95 border-golden-300/60 dark:border-navy-700 pointer-events-auto'
                                                    : 'shadow-lg opacity-85 hover:opacity-100 bg-white/75 dark:bg-navy-800/75 border-soft-cream-200 dark:border-navy-700/60 pointer-events-none'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                                        <span className="text-[10px] sm:text-xs font-mono font-bold text-golden-700 dark:text-golden-400">
                                                            #{String(index + 1).padStart(2, '0')}
                                                        </span>
                                                        <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md bg-golden-100/80 dark:bg-golden-950/70 text-golden-800 dark:text-golden-300 font-semibold border border-golden-300/60 dark:border-golden-700/50 flex items-center gap-1 truncate max-w-[140px] xs:max-w-none">
                                                            ★ {cert.category}
                                                        </span>
                                                        {cert.verified && (
                                                            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
                                                                <svg className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="hidden xs:inline">Verified</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-golden-800 dark:text-golden-300 hover:text-golden-700 dark:hover:text-golden-200 transition-colors truncate tracking-tight">
                                                        {cert.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-navy-600 dark:text-soft-cream-300 truncate">
                                                        <span className="font-semibold text-navy-800 dark:text-soft-cream-200 truncate">
                                                            {cert.issuer}
                                                        </span>
                                                        <span className="text-golden-600 dark:text-golden-400 font-bold">•</span>
                                                        <span className="shrink-0">{cert.issue_date || cert.issueDate}</span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-semibold bg-golden-100/80 dark:bg-golden-950/70 border border-golden-300/70 dark:border-golden-700/60 text-golden-800 dark:text-golden-300 shadow-sm inline-block">
                                                        {cert.issuer_code || 'Verified'}
                                                    </span>
                                                </div>
                                            </div>

                                            <CertificatePreviewFrame key={cert.id || index} cert={cert} onExpand={setSelectedCertForModal} heightClass="h-[140px] xs:h-[160px] sm:h-[185px] md:h-[205px] lg:h-[220px] xl:h-[250px]" />

                                            <div className="flex flex-wrap items-center gap-2 pt-0.5 relative z-30 pointer-events-auto">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCertForModal(cert);
                                                    }}
                                                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-soft-cream-200/90 dark:bg-navy-700/90 border border-soft-cream-300 dark:border-navy-600 text-navy-800 dark:text-soft-cream-200 text-[11px] sm:text-xs font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer pointer-events-auto"
                                                    title="Open high-resolution certificate"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>View Cert</span>
                                                </button>

                                                {(cert.credential_url || cert.credentialUrl) && (
                                                    <a
                                                        href={cert.credential_url || cert.credentialUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-golden-700 to-golden-800 hover:from-golden-800 hover:to-golden-900 text-white dark:from-golden-500 dark:to-golden-600 dark:hover:from-golden-400 dark:hover:to-golden-500 dark:text-navy-950 text-[11px] sm:text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-golden-900/20 pointer-events-auto cursor-pointer"
                                                        title="Verify credential on issuing platform"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                        <span>Verify</span>
                                                    </a>
                                                )}

                                                <a
                                                    href={cert.linkedin_url || (portfolio?.social_links?.linkedin ? `${portfolio.social_links.linkedin.replace(/\/$/, '')}/details/certifications/` : LINKEDIN_PROFILE_CERTIFICATIONS_URL)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-soft-cream-100 dark:bg-navy-700/80 border border-soft-cream-300 dark:border-navy-600 text-navy-900 dark:text-soft-cream-100 text-[11px] sm:text-xs font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm pointer-events-auto cursor-pointer"
                                                    title="View certification record on LinkedIn"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-current" viewBox="0 0 24 24">
                                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                                    </svg>
                                                    <span>LinkedIn</span>
                                                    <svg className="w-3 h-3 text-navy-400 dark:text-soft-cream-400 hidden xs:inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>

                                            <p className="text-[11px] sm:text-xs text-navy-700 dark:text-soft-cream-200 leading-snug line-clamp-2">
                                                {cert.description}
                                            </p>

                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                                {cert.skills?.slice(0, 5).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-medium bg-soft-cream-100 dark:bg-navy-700/80 text-navy-800 dark:text-soft-cream-200 border border-soft-cream-300/70 dark:border-navy-600 hover:border-golden-400/50 transition-colors"
                                                    >
                                                        {skill}
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

            {selectedCertForModal && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-navy-950/95 backdrop-blur-md animate-fade-in select-none"
                    onClick={() => setSelectedCertForModal(null)}
                    onWheel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onTouchMove={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <div
                        className="relative max-w-5xl lg:max-w-6xl w-full max-h-[96vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white dark:bg-navy-900 border border-soft-cream-300 dark:border-navy-700 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-soft-cream-100 dark:bg-navy-950 border-b border-soft-cream-200 dark:border-navy-800 flex items-center justify-between gap-3 shrink-0">
                            <div className="min-w-0">
                                <h4 className="text-sm sm:text-base font-bold text-navy-900 dark:text-soft-cream-100 truncate">
                                    {selectedCertForModal.title}
                                </h4>
                                <p className="text-[11px] sm:text-xs font-mono text-navy-600 dark:text-soft-cream-400 truncate">
                                    {selectedCertForModal.issuer} • {selectedCertForModal.issue_date || selectedCertForModal.issueDate}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {(selectedCertForModal.credential_url || selectedCertForModal.credentialUrl) && (
                                    <a
                                        href={selectedCertForModal.credential_url || selectedCertForModal.credentialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-xl bg-golden-500/10 hover:bg-golden-500/20 text-golden-700 dark:text-golden-400 text-xs font-mono transition-colors flex items-center gap-1.5"
                                        title="Verify credential on issuer website"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span className="hidden sm:inline">Verify Credential</span>
                                    </a>
                                )}
                                <a
                                    href={
                                        selectedCertForModal.certificate_image ||
                                        selectedCertForModal.image_url ||
                                        generateCertificateSvg(selectedCertForModal, selectedCertForModal.recipient_name || portfolio?.name || 'Verified Candidate')
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl bg-soft-cream-200 dark:bg-navy-800 hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-navy-700 dark:text-soft-cream-200 text-xs font-mono transition-colors flex items-center gap-1.5"
                                    title="Open original high-resolution certificate"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span className="hidden sm:inline">Open Certificate</span>
                                </a>
                                <button
                                    onClick={() => setSelectedCertForModal(null)}
                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs transition-colors cursor-pointer flex items-center gap-1"
                                    title="Close and return to main screen (Esc)"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-xs font-medium hidden sm:inline">Close</span>
                                </button>
                            </div>
                        </div>

                        <div
                            className="flex-1 overflow-auto p-2 sm:p-4 bg-navy-950/95 flex items-center justify-center min-h-[300px] cursor-zoom-out"
                            onClick={() => setSelectedCertForModal(null)}
                            title="Click anywhere to return to main screen"
                        >
                            <img
                                src={
                                    selectedCertForModal.certificate_image ||
                                    selectedCertForModal.image_url ||
                                    selectedCertForModal.remote_badge_url ||
                                    generateCertificateSvg(selectedCertForModal, selectedCertForModal.recipient_name || portfolio?.name || 'Verified Candidate')
                                }
                                alt={selectedCertForModal.title}
                                className="max-h-[75vh] sm:max-h-[78vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
                                onClick={(e) => e.stopPropagation()}
                                onError={(e) => {
                                    const fallback = generateCertificateSvg(selectedCertForModal, selectedCertForModal.recipient_name || portfolio?.name || 'Verified Candidate');
                                    if (e.currentTarget.src !== fallback) {
                                        e.currentTarget.src = fallback;
                                    }
                                }}
                            />
                        </div>

                        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-soft-cream-100 dark:bg-navy-950 border-t border-soft-cream-200 dark:border-navy-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-navy-600 dark:text-soft-cream-400">
                                <span>Credential ID:</span>
                                <span className="font-bold text-navy-900 dark:text-soft-cream-200">
                                    {selectedCertForModal.credential_id || selectedCertForModal.credentialId || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] sm:text-xs text-navy-400 dark:text-soft-cream-500 hidden md:inline">
                                    Click anywhere outside or Esc to return
                                </span>
                                {(selectedCertForModal.credential_url || selectedCertForModal.credentialUrl) && (
                                    <a
                                        href={selectedCertForModal.credential_url || selectedCertForModal.credentialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-golden-600 text-white dark:bg-golden-500 dark:text-navy-950 text-xs font-bold hover:scale-105 transition-all shadow-sm"
                                    >
                                        Verify Credential
                                    </a>
                                )}
                                <a
                                    href={selectedCertForModal.linkedin_url || (portfolio?.social_links?.linkedin ? `${portfolio.social_links.linkedin.replace(/\/$/, '')}/details/certifications/` : LINKEDIN_PROFILE_CERTIFICATIONS_URL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-sm"
                                >
                                    LinkedIn Record
                                </a>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default Certifications;
