import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { usePortfolio } from '../contexts/PortfolioContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showBrandName, setShowBrandName] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { portfolio } = usePortfolio();
    const location = useLocation();
    const isPublishedRoute = location.pathname.startsWith('/p/');

    const displayName = portfolio?.display_name || portfolio?.full_name || 'Developer Name';
    const vis = portfolio?.sections_visibility || {};

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > 20);

            const heroEl = document.getElementById('home');
            if (heroEl) {
                const transitionDist = heroEl.offsetHeight - window.innerHeight;
                const threshold = Math.max(100, transitionDist * 0.4);
                setShowBrandName(scrollY > threshold);
            } else {
                setShowBrandName(scrollY > 150);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        if (sectionId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsMobileMenuOpen(false);
            return;
        }
        if (sectionId === 'projects') {
            const heroEl = document.getElementById('home');
            const targetScroll = heroEl ? Math.max(100, heroEl.offsetHeight - window.innerHeight) + 15 : window.innerHeight * 2;
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            setIsMobileMenuOpen(false);
            return;
        }
        if (sectionId === 'certifications') {
            const certEl = document.getElementById('certifications');
            if (certEl) {
                const certTop = certEl.getBoundingClientRect().top + window.scrollY - 60;
                window.scrollTo({ top: Math.max(0, certTop), behavior: 'smooth' });
                setIsMobileMenuOpen(false);
                return;
            }
        }
        if (sectionId === 'contact') {
            const contactEl = document.getElementById('contact');
            if (contactEl) {
                const navHeight = 65;
                const contactTop = contactEl.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top: Math.max(0, contactTop), behavior: 'smooth' });
                setIsMobileMenuOpen(false);
                return;
            }
        }
        const customSlug = portfolio?.custom_section?.slug || 'experience';
        if (sectionId === customSlug || sectionId === 'custom-section') {
            const customEl = document.getElementById(customSlug) || document.getElementById('custom-section') || document.getElementById('experience');
            if (customEl) {
                const navHeight = 65;
                const top = customEl.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
                setIsMobileMenuOpen(false);
                return;
            }
        }
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsMobileMenuOpen(false);
        }
    };

    const custom = portfolio?.custom_section || {};
    const hasProjects = Array.isArray(portfolio?.projects) && portfolio.projects.length > 0;
    const hasCerts = Array.isArray(portfolio?.certifications) && portfolio.certifications.length > 0;
    const isCustomVisible = (custom.enabled !== false || vis.custom_section === true) && vis.custom_section !== false && Boolean(custom.title);

    const allLinks = [
        { name: 'Home', id: 'home', show: vis.hero !== false },
        { name: 'Projects', id: 'projects', show: vis.projects !== false && hasProjects },
        { name: 'About', id: 'about', show: vis.about !== false },
        { name: 'Skills', id: 'skills', show: vis.skills !== false },
        { name: 'Certifications', id: 'certifications', show: vis.certifications !== false && hasCerts },
        { name: custom.nav_label || custom.title || 'Experience', id: custom.slug || 'experience', show: isCustomVisible },
        { name: 'Blog', id: 'blog', show: vis.blog === true },
        { name: 'Contact', id: 'contact', show: vis.contact !== false },
    ];
    const navLinks = allLinks.filter(l => l.show);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'glass shadow-lg py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => scrollToSection('home')}
                        className="text-xl sm:text-2xl font-bold gradient-text hover:scale-105 transition-all duration-300 transform cursor-pointer flex items-center gap-2.5 group"
                        title={displayName}
                    >
                        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-navy-700 via-golden-500 to-amber-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:rotate-6 transition-transform">
                            {(displayName || 'D').charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-xs">{displayName}</span>
                    </button>

                    <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className="text-navy-700 dark:text-soft-cream-300 hover:text-navy-900 dark:hover:text-soft-cream-100 font-medium transition-colors duration-300 relative group cursor-pointer text-sm"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-navy-700 dark:bg-soft-cream-300 transition-all duration-300 group-hover:w-full"></span>
                            </button>
                        ))}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-soft-cream-200 dark:bg-navy-700 hover:bg-soft-cream-300 dark:hover:bg-navy-600 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center shadow-sm cursor-pointer"
                            title={
                                theme === 'light'
                                    ? 'Light Theme (click for Dark)'
                                    : theme === 'dark'
                                    ? 'Dark Theme (click for Pink)'
                                    : 'Pink Sakura Theme (click for Light)'
                            }
                            aria-label="Switch theme (Light, Dark, Pink)"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5 text-golden-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : theme === 'pink' ? (
                                <span className="text-xl leading-none select-none inline-flex items-center justify-center hover:scale-110 transition-transform" role="img" aria-label="Cherry blossom">
                                    🌸
                                </span>
                            ) : (
                                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>

                        {!isPublishedRoute && (
                            <Link
                                to="/builder"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-golden-500 to-amber-600 hover:from-amber-600 hover:to-golden-700 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-400/30"
                                title="Open Portfolio Customization Dashboard"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>✏️ Edit Portfolio</span>
                            </Link>
                        )}
                    </div>

                    <div className="md:hidden flex items-center space-x-3">
                        {!isPublishedRoute && (
                            <Link
                                to="/builder"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-golden-600 text-white font-bold text-xs shadow-md ring-2 ring-amber-400/40 hover:scale-105 active:scale-95 transition-all"
                                title="Edit Portfolio"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit</span>
                            </Link>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-soft-cream-200 dark:bg-navy-700 flex items-center justify-center cursor-pointer"
                            title="Switch Theme"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5 text-golden-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : theme === 'pink' ? (
                                <span className="text-lg leading-none select-none inline-flex items-center justify-center" role="img" aria-label="Cherry blossom">
                                    🌸
                                </span>
                            ) : (
                                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg bg-soft-cream-200 dark:bg-navy-700 cursor-pointer"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 glass rounded-2xl p-4 animate-slide-down space-y-1">
                        <Link
                            to="/builder"
                            className="block w-full text-center py-2.5 px-4 mb-2 rounded-xl bg-golden-600 text-white dark:bg-golden-500 dark:text-navy-950 font-bold text-xs shadow-md"
                        >
                            ✏️ Open Customizer Dashboard
                        </Link>
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className="block w-full text-left py-2.5 px-4 rounded-lg hover:bg-soft-cream-200 dark:hover:bg-navy-800 transition-colors duration-200 font-medium text-navy-800 dark:text-soft-cream-100 cursor-pointer text-sm"
                            >
                                {link.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
