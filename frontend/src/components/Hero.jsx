import { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import softPinkLayeredWaves from '../assets/soft-pink-layered-waves.webp';
import softCreamLayeredWaves from '../assets/soft-cream-layered-waves.webp';
import midnightNavyLayeredWaves from '../assets/midnight-navy-layered-waves.webp';

const DEFAULT_TITLES = [
    'AI & Machine Learning Developer',
    'Data Scientist',
    'Full-Stack Software Developer',
    'Cybersecurity & OSINT Researcher',
    'Software Engineer',
    'Python & Backend Developer',
    'AI-Powered Product Builder'
];

const Hero = () => {
    const { isPink, isLight } = useTheme();
    const { portfolio } = usePortfolio();

    const [displayedText, setDisplayedText] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const heroRef = useRef(null);
    const [titleIndex, setTitleIndex] = useState(0);

    const titles = useMemo(() => {
        if (Array.isArray(portfolio?.titles) && portfolio.titles.length > 0) {
            return portfolio.titles;
        }
        return DEFAULT_TITLES;
    }, [portfolio?.titles]);

    const greeting = portfolio?.greeting || "Hi there! I'm";
    const displayName = portfolio?.display_name || portfolio?.full_name || 'Developer Name';
    const shortBio = portfolio?.short_bio || 'Full-stack software engineer specializing in building high-performance web applications, scalable cloud infrastructure, and modern digital experiences.';
    const social = portfolio?.social_links || {};
    const activeFloating = Array.isArray(social.floating_links) ? social.floating_links : [];
    const githubLink = (social.github !== undefined && social.github !== '')
        ? social.github
        : activeFloating.find(l => (l.platform === 'github' || l.name?.toLowerCase() === 'github') && l.enabled !== false)?.url;
    const linkedinLink = (social.linkedin !== undefined && social.linkedin !== '')
        ? social.linkedin
        : activeFloating.find(l => (l.platform === 'linkedin' || l.name?.toLowerCase() === 'linkedin') && l.enabled !== false)?.url;
    const customBg = portfolio?.background_image;
    const profileImage = portfolio?.profile_image;
    const bgSettings = portfolio?.background_settings || { fit: 'cover', position: 'center', overlay: 0.2 };
    const homeTypo = portfolio?.home_typography || {};

    const headingSizeClass = homeTypo.headingSize === 'large'
        ? 'text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[6.5rem]'
        : homeTypo.headingSize === 'compact'
            ? 'text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem]'
            : 'text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-[5.5rem]';

    const headingWeightClass = homeTypo.fontWeight === 'extrabold'
        ? 'font-black'
        : homeTypo.fontWeight === 'semibold'
            ? 'font-semibold'
            : 'font-bold';

    const bgFitClass = bgSettings.fit === 'contain' ? 'bg-contain' : bgSettings.fit === 'fill' ? 'bg-auto' : 'bg-cover';
    const bgPosClass = bgSettings.position === 'top' ? 'bg-top' : bgSettings.position === 'bottom' ? 'bg-bottom' : 'bg-center';
    const overlayOpacity = typeof bgSettings.overlay === 'number' ? bgSettings.overlay : (parseFloat(bgSettings.overlay) || 0);

    useEffect(() => {
        if (!titles || titles.length === 0) return;
        const currentTitle = titles[titleIndex % titles.length] || '';
        let charIndex = 0;

        const typingInterval = setInterval(() => {
            if (charIndex <= currentTitle.length) {
                setDisplayedText(currentTitle.substring(0, charIndex));
                charIndex++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => {
                    setTitleIndex((prev) => (prev + 1) % titles.length);
                }, 3500);
            }
        }, 160);

        return () => clearInterval(typingInterval);
    }, [titleIndex, titles]);

    useEffect(() => {
        let ticking = false;

        const updateScroll = () => {
            if (!heroRef.current) return;
            const heroHeight = heroRef.current.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;

            const transitionDistance = heroHeight - windowHeight;
            if (transitionDistance <= 0) return;

            const progress = Math.min(1, Math.max(0, scrollY / transitionDistance));
            setScrollProgress(progress);
        };

        const handleScroll = () => {
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
    }, []);

    const scrollToProjects = () => {
        const projectsEl = document.getElementById('projects');
        if (projectsEl) {
            const heroHeight = heroRef.current ? heroRef.current.offsetHeight : window.innerHeight * 3;
            const windowHeight = window.innerHeight;
            const targetScroll = Math.max(100, heroHeight - windowHeight) + 15;
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            return;
        }
        const fallback = document.getElementById('about') || document.getElementById('skills') || document.getElementById('certifications') || document.getElementById('contact');
        if (fallback) {
            const top = fallback.getBoundingClientRect().top + window.scrollY - 65;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    };

    const scrollToContact = () => {
        const contactEl = document.getElementById('contact');
        if (contactEl) {
            const top = contactEl.getBoundingClientRect().top + window.scrollY - 65;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    };

    const zoomScale = 1 + scrollProgress * 1.5;
    const contentOpacity = Math.max(0, 1 - scrollProgress * 1.05);
    const isHeroFinished = scrollProgress >= 1;

    return (
        <section
            id="home"
            ref={heroRef}
            className="relative h-[300vh] w-full z-10 pointer-events-none"
        >
            <div
                className={`sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden ${isHeroFinished ? 'invisible pointer-events-none' : 'visible pointer-events-auto'}`}
                style={{
                    pointerEvents: scrollProgress > 0.5 ? 'none' : 'auto',
                }}
            >
                {customBg ? (
                    <div
                        className={`absolute inset-0 ${bgFitClass} ${bgPosClass} bg-no-repeat pointer-events-none transition-opacity duration-300`}
                        style={{
                            backgroundImage: `url(${customBg})`,
                            opacity: Math.max(0, 1 - scrollProgress * 1.2),
                        }}
                    >
                        {overlayOpacity > 0 && (
                            <div
                                className="absolute inset-0 bg-navy-950 pointer-events-none transition-opacity"
                                style={{ opacity: overlayOpacity }}
                            />
                        )}
                    </div>
                ) : isPink ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-300"
                        style={{
                            backgroundImage: `url(${softPinkLayeredWaves})`,
                            opacity: Math.max(0, 1 - scrollProgress * 1.2),
                        }}
                    />
                ) : isLight ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-300"
                        style={{
                            backgroundImage: `url(${softCreamLayeredWaves})`,
                            opacity: Math.max(0, 1 - scrollProgress * 1.2),
                        }}
                    />
                ) : (
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-300"
                        style={{
                            backgroundImage: `url(${midnightNavyLayeredWaves})`,
                            opacity: Math.max(0, 1 - scrollProgress * 1.2),
                        }}
                    />
                )}

                <div
                    className="container-custom relative z-10 w-full will-change-transform"
                    style={{
                        transform: `scale(${zoomScale})`,
                        opacity: contentOpacity,
                        transformOrigin: 'center center',
                        transition: 'none',
                    }}
                >
                    <div className="text-center animate-fade-in flex flex-col items-center">
                        {profileImage && (
                            <div className="mb-4 sm:mb-5 relative group pointer-events-auto animate-slide-down">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-golden-400 via-amber-500 to-rose-400 shadow-xl hover:scale-105 transition-transform duration-300">
                                    <img
                                        src={profileImage}
                                        alt={displayName}
                                        className="w-full h-full object-cover rounded-full bg-soft-cream-100 dark:bg-navy-950"
                                        onError={(e) => { e.currentTarget.parentElement.parentElement.style.display = 'none'; }}
                                    />
                                </div>
                            </div>
                        )}

                        <p
                            className="text-sm sm:text-base md:text-lg font-medium mb-1.5 sm:mb-2 animate-slide-down"
                            style={{ color: homeTypo.subtitleColor || undefined }}
                        >
                            {greeting}
                        </p>

                        <h1 className={`${headingSizeClass} ${headingWeightClass} tracking-tight mb-2 sm:mb-3 animate-slide-up`}>
                            <span className="gradient-text animate-gradient inline-block">
                                {displayName}
                            </span>
                        </h1>

                        <div className="h-9 sm:h-11 md:h-14 mb-3 sm:mb-5 flex items-center justify-center">
                            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[2.6rem] text-navy-800 dark:text-soft-cream-100 font-bold tracking-tight flex items-center">
                                <span>{displayedText}</span>
                                <span className="font-normal text-navy-800 dark:text-soft-cream-200 animate-pulse ml-0.5">|</span>
                            </h2>
                        </div>

                        <p className="text-sm sm:text-base md:text-lg text-navy-600 dark:text-soft-cream-300 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-normal px-4">
                            {shortBio}
                        </p>

                        <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center pointer-events-auto px-4 mb-6 sm:mb-8">
                            <button
                                onClick={scrollToProjects}
                                className="btn-primary px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold hover-lift cursor-pointer shadow-md"
                            >
                                View My Work
                            </button>
                            <button
                                onClick={scrollToContact}
                                className="btn-outline px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold hover-lift cursor-pointer backdrop-blur-sm"
                            >
                                Get in Touch
                            </button>
                        </div>

                        {(githubLink || linkedinLink) && (
                            <div className="flex justify-center items-center gap-3 sm:gap-4 pointer-events-auto mb-6 sm:mb-8">
                                {githubLink && (
                                    <a
                                        href={githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-navy-700 dark:text-soft-cream-200 hover:text-navy-900 dark:hover:text-soft-cream-50"
                                        aria-label="GitHub"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                        </svg>
                                    </a>
                                )}
                                {linkedinLink && (
                                    <a
                                        href={linkedinLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-navy-700 dark:text-soft-cream-200 hover:text-navy-900 dark:hover:text-soft-cream-50"
                                        aria-label="LinkedIn"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        )}

                        <button
                            onClick={scrollToProjects}
                            className="animate-gentle-bounce cursor-pointer p-1 text-navy-500 dark:text-soft-cream-400 hover:text-golden-600 dark:hover:text-golden-300 transition-colors focus:outline-none"
                            aria-label="Scroll to Projects"
                        >
                            <svg
                                className="w-5 h-5 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
