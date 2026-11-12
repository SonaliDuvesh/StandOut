import { useState, useMemo } from 'react';
import { contactAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import { PRESET_SOCIAL_LOGOS, getFloatingPositionClass } from '../utils/socialPresets';

const DEFAULT_SOCIAL_PLATFORMS = [
    {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/username/',
        src: '/social/linkedin.png',
        pinkSrc: '/social/pink/linkedin.png',
        positionClass: 'top-[8%] left-[8%] sm:top-[12%] sm:left-[10%]',
        animX: 'anti-g-1-x',
        animY: 'anti-g-1-y',
        animR: 'anti-g-1-r',
    },
    {
        name: 'GitHub',
        url: 'https://github.com/username/',
        src: '/social/github.png',
        pinkSrc: '/social/pink/github.png',
        positionClass: 'top-[6%] right-[8%] sm:top-[10%] sm:right-[10%]',
        animX: 'anti-g-2-x',
        animY: 'anti-g-2-y',
        animR: 'anti-g-2-r',
    },
    {
        name: 'Medium',
        url: 'https://medium.com/',
        src: '/social/medium.png',
        pinkSrc: '/social/pink/medium.png',
        positionClass: 'bottom-[10%] left-[8%] sm:bottom-[12%] sm:left-[10%]',
        animX: 'anti-g-3-x',
        animY: 'anti-g-3-y',
        animR: 'anti-g-3-r',
    },
    {
        name: 'Devpost',
        url: 'https://devpost.com/',
        src: '/social/devpost.png',
        pinkSrc: '/social/pink/devpost.png',
        positionClass: 'bottom-[8%] right-[8%] sm:bottom-[10%] sm:right-[10%]',
        animX: 'anti-g-4-x',
        animY: 'anti-g-4-y',
        animR: 'anti-g-4-r',
    },
];

const Contact = () => {
    const { isPink } = useTheme();
    const { portfolio } = usePortfolio();

    const socialLinks = portfolio?.social_links || {};
    const sectionTitle = socialLinks.title || 'Get In Touch';
    const sectionSubtitle = socialLinks.subtitle;
    const contactEmail = typeof socialLinks.email === 'string'
        ? socialLinks.email.trim()
        : (socialLinks.email || 'testing@gmail.com');
    const rawFloatingLinks = socialLinks.floating_links;

    const renderTitle = (text) => {
        const trimmed = (text || 'Get In Touch').trim();
        const words = trimmed.split(' ');
        if (words.length <= 1) return <span className="gradient-text">{trimmed}</span>;
        const lastWord = words.pop();
        return (
            <>
                {words.join(' ')} <span className="gradient-text">{lastWord}</span>
            </>
        );
    };

    const socialPlatforms = useMemo(() => {
        if (Array.isArray(rawFloatingLinks)) {
            const activeLinks = rawFloatingLinks.filter(item => item && item.enabled !== false && item.url && item.url.trim() !== '');
            return activeLinks.map((item, index) => {
                const platKey = (item.platform || item.name || '').toLowerCase().trim();
                const preset = PRESET_SOCIAL_LOGOS[platKey] || {};
                const isCustomImage = item.image_url && !item.image_url.startsWith('/social/');
                const src = item.image_url || preset.src || '/social/website.svg';
                const pinkSrc = isCustomImage
                    ? (item.pink_image_url && item.pink_image_url.startsWith('/media/uploads/') ? item.pink_image_url : src)
                    : (item.pink_image_url || preset.pinkSrc || src);
                const animIndex = (index % 4) + 1;

                return {
                    id: item.id || `fl-${index}`,
                    name: item.name || 'Profile Link',
                    url: item.url,
                    src,
                    pinkSrc,
                    positionClass: getFloatingPositionClass(index, activeLinks.length),
                    animX: `anti-g-${animIndex}-x`,
                    animY: `anti-g-${animIndex}-y`,
                    animR: `anti-g-${animIndex}-r`,
                };
            });
        }

        return DEFAULT_SOCIAL_PLATFORMS.map((platform, index) => {
            const lowerName = platform.name.toLowerCase();
            const customUrl = socialLinks[lowerName];
            return {
                ...platform,
                id: `default-${index}`,
                url: customUrl || platform.url,
            };
        });
    }, [rawFloatingLinks, socialLinks]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await contactAPI.submit({
                ...formData,
                portfolio: portfolio?.id,
                recipient_email: contactEmail || undefined,
            });
            setStatus({
                type: 'success',
                message: response.data?.message || 'Thank you for your message! I\'ll get back to you soon.'
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Oops! Something went wrong. Please try again later.'
            });
            console.error('Error submitting contact form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            id="contact"
            className="relative z-30 scroll-mt-20 min-h-[calc(100vh-4.5rem)] flex flex-col justify-center pt-8 sm:pt-12 pb-10 sm:pb-14 bg-soft-cream-50 dark:bg-navy-900 transition-colors duration-300"
        >
            <div className="container-custom w-full my-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 animate-on-scroll">
                    {renderTitle(sectionTitle)}
                </h2>

                {sectionSubtitle && (
                    <p className="text-center text-xs sm:text-sm text-navy-600 dark:text-soft-cream-300 max-w-xl mx-auto mb-6 sm:mb-8 animate-on-scroll">
                        {sectionSubtitle}
                    </p>
                )}

                <div className={socialPlatforms.length > 0 ? "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center" : "max-w-xl mx-auto w-full"}>
                    {socialPlatforms.length > 0 && (
                        <div className="relative w-full min-h-[340px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[480px] flex items-center justify-center p-2 sm:p-4 animate-on-scroll overflow-visible">
                            {socialPlatforms.map((item) => (
                                <a
                                    key={item.id || item.name}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Visit my ${item.name}`}
                                    aria-label={item.name}
                                    className={`absolute z-10 inline-block cursor-pointer select-none ${item.positionClass} ${item.animX}`}
                                >
                                    <div className={item.animY}>
                                        <div className={item.animR}>
                                            <img
                                                src={isPink ? (item.pinkSrc || item.src) : item.src}
                                                alt={`${item.name} logo`}
                                                className={`w-20 sm:w-24 md:w-28 lg:w-32 h-auto object-contain pointer-events-auto filter transition-all duration-300 hover:scale-115 active:scale-95 ${
                                                    isPink
                                                        ? 'drop-shadow-[0_8px_18px_rgba(251,113,133,0.35)] hover:drop-shadow-[0_16px_32px_rgba(251,113,133,0.7)]'
                                                        : 'drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] hover:drop-shadow-[0_16px_32px_rgba(237,206,115,0.7)]'
                                                }`}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/social/website.svg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    <div className="card animate-on-scroll bg-white/50 dark:bg-navy-800/50 p-5 sm:p-7 shadow-sm">
                        {contactEmail && (
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-soft-cream-200/80 dark:border-navy-700/80">
                                <span className="text-xs font-semibold text-navy-500 dark:text-soft-cream-400">
                                    Send a message or email directly:
                                </span>
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="text-xs font-mono font-semibold text-golden-700 dark:text-golden-400 hover:underline flex items-center gap-1.5 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{contactEmail}</span>
                                </a>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-navy-700 dark:text-soft-cream-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input py-2.5 px-3.5 text-sm"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-navy-700 dark:text-soft-cream-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input py-2.5 px-3.5 text-sm"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-navy-700 dark:text-soft-cream-300 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="input py-2.5 px-3.5 text-sm"
                                    placeholder="What is this regarding?"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-navy-700 dark:text-soft-cream-300 mb-1">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="input resize-none py-2.5 px-3.5 text-sm"
                                    placeholder="Your message..."
                                />
                            </div>

                            {status.message && (
                                <div
                                    className={`p-3 rounded-xl text-sm ${status.type === 'success'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                                        }`}
                                >
                                    {status.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover-lift cursor-pointer"
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
