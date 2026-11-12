import React from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { ExternalLink, Sparkles, Calendar, Tag } from 'lucide-react';

const CustomSection = () => {
    const { portfolio } = usePortfolio();
    const custom = portfolio?.custom_section;
    const vis = portfolio?.sections_visibility || {};

    const isCustomVisible = (custom.enabled !== false || vis.custom_section === true) && vis.custom_section !== false && Boolean(custom.title);

    if (!custom || !isCustomVisible) {
        return null;
    }

    const blocks = Array.isArray(custom.content_blocks) ? custom.content_blocks : [];
    const layout = custom.layout || 'timeline';
    const fontClass = custom.font_family === 'serif'
        ? 'font-serif'
        : custom.font_family === 'mono'
            ? 'font-mono'
            : 'font-sans';

    const sectionSlug = custom.slug || 'experience';

    return (
        <section
            id={sectionSlug}
            className={`relative z-30 scroll-mt-20 py-16 sm:py-20 lg:py-24 bg-soft-cream-50 dark:bg-navy-900 transition-colors duration-300 ${fontClass}`}
        >
            <div className="container-custom">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 animate-on-scroll">
                    {custom.badge && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-golden-500/15 text-golden-700 dark:text-golden-400 border border-golden-500/30 mb-3 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-golden-500" />
                            <span>{custom.badge}</span>
                        </div>
                    )}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
                        {custom.title.includes(' ') ? (
                            <>
                                {custom.title.split(' ').slice(0, -1).join(' ')}{' '}
                                <span className="gradient-text">{custom.title.split(' ').slice(-1)}</span>
                            </>
                        ) : (
                            <span className="gradient-text">{custom.title}</span>
                        )}
                    </h2>
                    {custom.subtitle && (
                        <p className="text-sm md:text-base text-navy-600 dark:text-soft-cream-300 leading-relaxed max-w-2xl mx-auto">
                            {custom.subtitle}
                        </p>
                    )}
                </div>

                {layout === 'timeline' && (
                    <div className="max-w-4xl mx-auto relative pl-6 sm:pl-8 border-l-2 border-golden-500/40 dark:border-golden-400/30 space-y-10 sm:space-y-12">
                        {blocks.map((block, idx) => (
                            <div key={block.id || idx} className="relative group animate-on-scroll">
                                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-golden-500 border-4 border-soft-cream-50 dark:border-navy-900 shadow-md group-hover:scale-125 transition-transform" />

                                <div className="card bg-white/70 dark:bg-navy-800/70 p-5 sm:p-7 border border-soft-cream-300 dark:border-navy-700 shadow-sm hover:shadow-xl transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-soft-cream-200/80 dark:border-navy-700/80">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold text-navy-900 dark:text-soft-cream-100">
                                                {block.title}
                                            </h3>
                                            {block.subtitle && (
                                                <p className="text-xs sm:text-sm font-semibold text-golden-700 dark:text-golden-400 mt-0.5">
                                                    {block.subtitle}
                                                </p>
                                            )}
                                        </div>

                                        {block.date_badge && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-soft-cream-200 dark:bg-navy-900 text-navy-700 dark:text-soft-cream-300 self-start sm:self-auto shrink-0 border border-soft-cream-300/60 dark:border-navy-700/60">
                                                <Calendar className="w-3.5 h-3.5 text-golden-500" />
                                                <span>{block.date_badge}</span>
                                            </span>
                                        )}
                                    </div>

                                    {block.image_url && (
                                        <div className="mb-4 rounded-xl overflow-hidden max-h-60 border border-soft-cream-300 dark:border-navy-700">
                                            <img src={block.image_url} alt={block.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    {block.description && (
                                        <p className="text-xs sm:text-sm text-navy-700 dark:text-soft-cream-200/90 leading-relaxed mb-4 whitespace-pre-line">
                                            {block.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                        {Array.isArray(block.tags) && block.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {block.tags.map((tag, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md bg-soft-cream-200/90 dark:bg-navy-900/90 text-navy-800 dark:text-soft-cream-200 font-medium border border-soft-cream-300/40 dark:border-navy-700/50"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {block.link_url && (
                                            <a
                                                href={block.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-golden-600 hover:from-amber-600 hover:to-golden-700 text-white text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all ml-auto"
                                            >
                                                <span>{block.link_text || 'Learn More'}</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {layout === 'cards' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {blocks.map((block, idx) => (
                            <div
                                key={block.id || idx}
                                className="card bg-white/70 dark:bg-navy-800/70 p-5 sm:p-6 border border-soft-cream-300 dark:border-navy-700 shadow-sm hover:shadow-2xl flex flex-col justify-between transition-all animate-on-scroll"
                            >
                                <div>
                                    {block.image_url && (
                                        <div className="mb-4 rounded-xl overflow-hidden h-44 border border-soft-cream-300 dark:border-navy-700">
                                            <img src={block.image_url} alt={block.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        {block.date_badge ? (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-soft-cream-200 dark:bg-navy-900 text-navy-700 dark:text-soft-cream-300">
                                                {block.date_badge}
                                            </span>
                                        ) : <span />}
                                    </div>

                                    <h3 className="text-lg font-bold text-navy-900 dark:text-soft-cream-100 mb-1">
                                        {block.title}
                                    </h3>
                                    {block.subtitle && (
                                        <p className="text-xs font-semibold text-golden-700 dark:text-golden-400 mb-3">
                                            {block.subtitle}
                                        </p>
                                    )}

                                    {block.description && (
                                        <p className="text-xs sm:text-sm text-navy-600 dark:text-soft-cream-300/90 leading-relaxed mb-4 line-clamp-4">
                                            {block.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-soft-cream-200/80 dark:border-navy-700/80 space-y-3">
                                    {Array.isArray(block.tags) && block.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {block.tags.map((tag, tIdx) => (
                                                <span
                                                    key={tIdx}
                                                    className="text-[10px] px-2 py-0.5 rounded-md bg-soft-cream-200/80 dark:bg-navy-900/80 text-navy-700 dark:text-soft-cream-300"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {block.link_url && (
                                        <a
                                            href={block.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-navy-800 text-white dark:bg-soft-cream-500 dark:text-navy-950 text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xs"
                                        >
                                            <span>{block.link_text || 'View Details'}</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {layout === 'story' && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-on-scroll">
                        {blocks.map((block, idx) => (
                            <article
                                key={block.id || idx}
                                className="card bg-white/70 dark:bg-navy-800/70 p-6 sm:p-8 border border-soft-cream-300 dark:border-navy-700 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <h3 className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-soft-cream-100">
                                        {block.title}
                                    </h3>
                                    {block.date_badge && (
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-golden-500/10 text-golden-700 dark:text-golden-400">
                                            {block.date_badge}
                                        </span>
                                    )}
                                </div>
                                {block.subtitle && (
                                    <p className="text-xs sm:text-sm font-semibold text-golden-700 dark:text-golden-400 mb-4">
                                        {block.subtitle}
                                    </p>
                                )}

                                {block.image_url && (
                                    <div className="mb-4 rounded-2xl overflow-hidden max-h-72 border border-soft-cream-300 dark:border-navy-700">
                                        <img src={block.image_url} alt={block.title} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {block.description && (
                                    <p className="text-sm sm:text-base text-navy-700 dark:text-soft-cream-200 leading-relaxed whitespace-pre-line mb-4">
                                        {block.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-soft-cream-200 dark:border-navy-700">
                                    {Array.isArray(block.tags) && block.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {block.tags.map((tag, tIdx) => (
                                                <span
                                                    key={tIdx}
                                                    className="text-xs px-2.5 py-0.5 rounded-lg bg-soft-cream-200 dark:bg-navy-900 text-navy-800 dark:text-soft-cream-200 font-medium"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {block.link_url && (
                                        <a
                                            href={block.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-golden-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-sm"
                                        >
                                            <span>{block.link_text || 'Read More'}</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CustomSection;
