import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio } from '../contexts/PortfolioContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Projects from '../components/Projects';
import About from '../components/About';
import Skills from '../components/Skills';
import Certifications from '../components/Certifications';
import CustomSection from '../components/CustomSection';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import {
    Monitor, Tablet, Smartphone, CheckCircle2, Share2, ArrowLeft,
    Edit3, Sparkles, Layers, ChevronUp, X, AlertCircle
} from 'lucide-react';

const PortfolioView = ({ isPreview = false, isPublishedView = false }) => {
    const { username, slug } = useParams();
    const {
        portfolio,
        loadPortfolio,
        loadPublishedPortfolio,
        loading,
        deviceMode,
        setDeviceMode
    } = usePortfolio();

    const [shareCopied, setShareCopied] = useState(false);
    const [showQuickMenu, setShowQuickMenu] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const handleLoad = () => {
            if (slug) {
                const hash = window.location.hash || window.location.search;
                loadPublishedPortfolio(slug, hash).then((res) => {
                    if (!isMounted) return;
                    if (!res?.success) {
                        setLoadError(res?.error || 'Failed to load portfolio');
                    } else {
                        setLoadError(null);
                    }
                });
            } else if (username && username !== portfolio.username) {
                loadPortfolio(username);
            }
        };

        handleLoad();
        window.addEventListener('hashchange', handleLoad);
        return () => {
            isMounted = false;
            window.removeEventListener('hashchange', handleLoad);
        };
    }, [slug, username, portfolio.username, loadPortfolio, loadPublishedPortfolio]);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));

        return () => {
            animatedElements.forEach(el => observer.unobserve(el));
        };
    }, [portfolio]);

    const handleShare = () => {
        const url = isPublishedView
            ? window.location.href
            : window.location.origin + '/' + (portfolio.username || 'username');
        navigator.clipboard?.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
    };

    const vis = portfolio.sections_visibility || {};

    const getDeviceContainerClass = () => {
        if (!isPreview) return 'w-full';
        switch (deviceMode) {
            case 'tablet':
                return 'max-w-[768px] mx-auto my-6 rounded-3xl shadow-2xl border-8 border-navy-800 overflow-hidden';
            case 'mobile':
                return 'max-w-[390px] mx-auto my-6 rounded-[40px] shadow-2xl border-8 border-navy-800 overflow-hidden';
            default:
                return 'w-full';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-soft-cream-50 dark:bg-navy-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-navy-300 dark:border-navy-600 border-t-navy-700 dark:border-t-soft-cream-300 rounded-full animate-spin" />
                    <p className="text-sm font-medium text-navy-600 dark:text-soft-cream-400">
                        Loading portfolio...
                    </p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-soft-cream-50 dark:bg-navy-950">
                <div className="max-w-md w-full glass p-8 rounded-3xl text-center space-y-4 border border-soft-cream-300 dark:border-navy-700 shadow-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-soft-cream-100">
                        Portfolio Unavailable
                    </h2>
                    <p className="text-xs sm:text-sm text-navy-600 dark:text-soft-cream-300 leading-relaxed">
                        {loadError}
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                        <Link to="/" className="btn-primary py-2.5 px-4 text-xs font-semibold">
                            Go to Home
                        </Link>
                        <Link to="/builder" className="btn-secondary py-2.5 px-4 text-xs font-semibold">
                            Open Customizer
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-soft-cream-50 dark:bg-navy-900 transition-colors duration-300 relative">
            {!isPublishedView && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-[95vw]">
                    {showQuickMenu && (
                        <div className="glass rounded-2xl p-3 shadow-2xl border border-soft-cream-300 dark:border-navy-700 mb-1 w-72 sm:w-80 animate-slide-up bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-soft-cream-200 dark:border-navy-800 text-xs font-bold text-navy-800 dark:text-soft-cream-100">
                                <span className="flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-golden-500" />
                                    <span>Edit Sections Directly</span>
                                </span>
                                <button
                                    onClick={() => setShowQuickMenu(false)}
                                    className="p-1 text-navy-400 hover:text-navy-700 dark:hover:text-soft-cream-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                                <Link
                                    to="/builder?tab=home"
                                    className="p-2 rounded-xl hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 flex items-center gap-2 text-navy-700 dark:text-soft-cream-300 transition-colors font-medium"
                                >
                                    <span>🏠</span> <span>Hero & Bio</span>
                                </Link>
                                <Link
                                    to="/builder?tab=projects"
                                    className="p-2 rounded-xl hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 flex items-center gap-2 text-navy-700 dark:text-soft-cream-300 transition-colors font-medium"
                                >
                                    <span>💼</span> <span>Projects</span>
                                </Link>
                                <Link
                                    to="/builder?tab=about"
                                    className="p-2 rounded-xl hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 flex items-center gap-2 text-navy-700 dark:text-soft-cream-300 transition-colors font-medium"
                                >
                                    <span>👤</span> <span>About</span>
                                </Link>
                                <Link
                                    to="/builder?tab=skills"
                                    className="p-2 rounded-xl hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 flex items-center gap-2 text-navy-700 dark:text-soft-cream-300 transition-colors font-medium"
                                >
                                    <span>⚡</span> <span>Skills</span>
                                </Link>
                                <Link
                                    to="/builder?tab=certifications"
                                    className="p-2 rounded-xl hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 flex items-center gap-2 text-navy-700 dark:text-soft-cream-300 transition-colors font-medium"
                                >
                                    <span>📜</span> <span>Certifications</span>
                                </Link>
                                <Link
                                    to="/builder?tab=custom"
                                    className="p-2 rounded-xl hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 flex items-center gap-2 text-navy-700 dark:text-soft-cream-300 transition-colors font-medium"
                                >
                                    <span>✨</span> <span>Custom Page</span>
                                </Link>
                                <Link
                                    to="/builder?tab=contact"
                                    className="p-2 rounded-xl hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 flex items-center gap-2 text-navy-700 dark:text-soft-cream-300 transition-colors font-medium"
                                >
                                    <span>📬</span> <span>Contact</span>
                                </Link>
                                <Link
                                    to="/builder?tab=appearance"
                                    className="col-span-2 p-2 rounded-xl hover:bg-soft-cream-200/80 dark:hover:bg-navy-800/80 flex items-center gap-2 text-navy-700 dark:text-soft-cream-300 transition-colors font-medium border-t border-soft-cream-200 dark:border-navy-800"
                                >
                                    <span>🎨</span> <span>Appearance, Fonts & Themes</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="glass py-2 px-3 sm:px-4 rounded-2xl shadow-2xl border border-soft-cream-300/80 dark:border-navy-700/80 flex items-center gap-2 sm:gap-3 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl animate-slide-up">
                        <Link
                            to="/builder"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-golden-500 to-amber-600 hover:from-amber-600 hover:to-golden-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all ring-2 ring-amber-400/40"
                            title="Open StandOut Studio Dashboard"
                        >
                            {isPreview ? (
                                <>
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Back to Dashboard</span>
                                </>
                            ) : (
                                <>
                                    <Edit3 className="w-4 h-4" />
                                    <span>Edit Portfolio</span>
                                </>
                            )}
                        </Link>

                        <button
                            onClick={() => setShowQuickMenu(!showQuickMenu)}
                            className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold text-navy-700 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                            title="Quick jump to edit section"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sections</span>
                            <ChevronUp className={`w-3 h-3 transition-transform ${showQuickMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <div className="flex items-center gap-0.5 sm:gap-1 bg-soft-cream-200 dark:bg-navy-800/80 p-1 rounded-xl">
                            <button
                                onClick={() => setDeviceMode('desktop')}
                                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${deviceMode === 'desktop'
                                    ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-soft-cream-100 shadow-xs'
                                    : 'text-navy-500 hover:text-navy-800 dark:text-soft-cream-400'
                                    }`}
                                title="Desktop View"
                            >
                                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setDeviceMode('tablet')}
                                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${deviceMode === 'tablet'
                                    ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-soft-cream-100 shadow-xs'
                                    : 'text-navy-500 hover:text-navy-800 dark:text-soft-cream-400'
                                    }`}
                                title="Tablet View"
                            >
                                <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setDeviceMode('mobile')}
                                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${deviceMode === 'mobile'
                                    ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-soft-cream-100 shadow-xs'
                                    : 'text-navy-500 hover:text-navy-800 dark:text-soft-cream-400'
                                    }`}
                                title="Mobile View"
                            >
                                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>

                        <button
                            onClick={handleShare}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-navy-700 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Copy Public Link"
                        >
                            {shareCopied ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Share</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <div className={getDeviceContainerClass()}>
                <Navbar />
                <main>
                    {vis.hero !== false && <Hero />}
                    {vis.projects !== false && (portfolio.projects?.length > 0 || isPreview) && <Projects />}
                    {vis.about !== false && <About />}
                    {vis.skills !== false && <Skills />}
                    {vis.certifications !== false && (portfolio.certifications?.length > 0 || isPreview) && <Certifications />}
                    <CustomSection />
                    {vis.blog === true && <Blog />}
                    {vis.contact !== false && <Contact />}
                </main>
            </div>
        </div>
    );
};

export default PortfolioView;
