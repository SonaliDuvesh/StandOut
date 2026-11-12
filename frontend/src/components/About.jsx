import React from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';

const DEFAULT_HIGHLIGHTS = [
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
];

const About = () => {
    const { portfolio } = usePortfolio();

    const quote = portfolio?.quote || '"Turning complex challenges into elegant, scalable software."';
    const detailedBio = portfolio?.detailed_bio || (
        "I’m a full-stack software engineer passionate about creating fast, resilient web applications and developer tools. I work across modern frontend frameworks, cloud infrastructure, and distributed backend services to deliver clean, maintainable code.\n\nBeyond building user-facing products, I focus on software architecture, API design, and system performance. I actively contribute to open-source software and enjoy collaborating with teams to build impactful digital solutions."
    );

    const highlights = (Array.isArray(portfolio?.about_highlights) && portfolio.about_highlights.length > 0)
        ? portfolio.about_highlights
        : DEFAULT_HIGHLIGHTS;

    const education = (Array.isArray(portfolio?.education) && portfolio.education[0]) ? portfolio.education[0] : {
        degree: 'BS in Computer Science',
        institution: 'University of Technology',
        details: 'Specializing in Software Systems, Cloud Architecture, and Web Development'
    };

    const paragraphs = detailedBio.split('\n\n').filter(p => p.trim());

    return (
        <section id="about" className="relative z-30 scroll-mt-20 pt-14 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 bg-soft-cream-50 dark:bg-navy-900 transition-colors duration-300">
            <div className="container-custom">
                <div className="text-center mb-8 sm:mb-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">About Me</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-navy-700 via-golden-500 to-navy-700 dark:from-navy-400 dark:via-golden-400 dark:to-navy-400 mx-auto rounded-full"></div>
                </div>

                <div className="max-w-4xl mx-auto mb-12">
                    <div className="card text-center p-6 sm:p-10 border border-golden-300/40 dark:border-navy-700">
                        {quote && (
                            <div className="inline-block px-4 py-1.5 rounded-full bg-golden-100/80 dark:bg-golden-950/70 border border-golden-300/60 dark:border-golden-700/50 mb-6">
                                <p className="text-base sm:text-lg md:text-xl font-mono font-bold text-golden-800 dark:text-golden-300 tracking-wide">
                                    {quote}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {paragraphs.map((p, idx) => (
                                <p
                                    key={idx}
                                    className={`text-base sm:text-lg ${idx === 0 ? 'text-navy-800 dark:text-soft-cream-200' : 'text-navy-700 dark:text-soft-cream-300'} leading-relaxed`}
                                >
                                    {p}
                                </p>
                            ))}
                        </div>

                        {highlights.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-soft-cream-300/60 dark:border-navy-700/80 text-left">
                                {highlights.map((h, i) => (
                                    <div key={i} className="p-3 sm:p-3.5 rounded-xl bg-soft-cream-50/80 dark:bg-navy-800/80 border border-soft-cream-200 dark:border-navy-700">
                                        <div className="text-xl mb-1">{h.icon}</div>
                                        <div className="text-base sm:text-lg font-black font-mono text-golden-800 dark:text-golden-300">{h.stat}</div>
                                        <div className="text-xs font-bold text-navy-800 dark:text-soft-cream-100 truncate">{h.label}</div>
                                        <div className="text-[10px] text-navy-500 dark:text-soft-cream-400 leading-tight mt-0.5">{h.sub}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {education && (
                    <div className="max-w-4xl mx-auto">
                        <div className="card text-center hover-glow p-6 sm:p-8 border border-golden-300/40 dark:border-navy-700">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-golden-600 to-golden-800 dark:from-golden-500 dark:to-golden-700 text-white mx-auto mb-4 shadow-md">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-1.5 gradient-text">
                                {education.degree}
                            </h3>
                            <p className="text-base sm:text-lg text-navy-800 dark:text-soft-cream-200 font-semibold">
                                {education.institution}
                            </p>
                            {education.details && (
                                <p className="text-xs sm:text-sm text-navy-600 dark:text-soft-cream-400 mt-1.5">
                                    {education.details}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default About;
