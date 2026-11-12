import React from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { Palette, Type, LayoutGrid, RotateCcw, Check, Sparkles } from 'lucide-react';

const FONT_OPTIONS = [
    { name: 'Inter (Modern Sans)', value: 'Inter' },
    { name: 'Poppins (Geometric & Friendly)', value: 'Poppins' },
    { name: 'Roboto (Clean & Balanced)', value: 'Roboto' },
    { name: 'Montserrat (Editorial & Modern)', value: 'Montserrat' },
    { name: 'Playfair Display (Elegant Serif)', value: 'Playfair Display' },
    { name: 'Fira Code (Developer Monospace)', value: 'Fira Code' },
    { name: 'Outfit (Sleek Minimal)', value: 'Outfit' },
    { name: 'Space Grotesk (Tech & Cyber)', value: 'Space Grotesk' },
    { name: 'Plus Jakarta Sans (Crisp UI)', value: 'Plus Jakarta Sans' },
];

const PALETTE_PRESETS = [
    {
        name: 'Original Navy & Cream',
        primaryColor: '#627D98',
        secondaryColor: '#EDE0C9',
        accentColor: '#DFCBA6',
        bgLight: '#FDFBF7',
        bgDark: '#102A43',
    },
    {
        name: 'Emerald & Warm Slate',
        primaryColor: '#059669',
        secondaryColor: '#E2E8F0',
        accentColor: '#10B981',
        bgLight: '#F8FAFC',
        bgDark: '#0F172A',
    },
    {
        name: 'Cyber Violet & Obsidian',
        primaryColor: '#7C3AED',
        secondaryColor: '#E9D5FF',
        accentColor: '#A855F7',
        bgLight: '#FAF5FF',
        bgDark: '#09090B',
    },
    {
        name: 'Rose & Warm Sand',
        primaryColor: '#BE185D',
        secondaryColor: '#FCE7F3',
        accentColor: '#F43F5E',
        bgLight: '#FFF1F2',
        bgDark: '#1E1B18',
    },
];

const AppearanceTab = () => {
    const { portfolio, updateField, resetSection, setSuccess } = usePortfolio();
    const appearance = portfolio.appearance || {};
    const visibility = portfolio.sections_visibility || {};

    const handleApplyPreset = (preset) => {
        updateField('appearance', {
            ...appearance,
            primaryColor: preset.primaryColor,
            secondaryColor: preset.secondaryColor,
            accentColor: preset.accentColor,
            bgLight: preset.bgLight,
            bgDark: preset.bgDark,
        });
        setSuccess?.(`Applied "${preset.name}" color palette!`);
    };

    const isPresetActive = (preset) => {
        return (
            appearance.primaryColor === preset.primaryColor &&
            appearance.bgDark === preset.bgDark &&
            appearance.accentColor === preset.accentColor
        );
    };

    const toggleSection = (sectionKey) => {
        const isCurrentlyVisible = visibility[sectionKey] !== false;
        const next = !isCurrentlyVisible;
        updateField(`sections_visibility.${sectionKey}`, next);
        if (sectionKey === 'custom_section' && next && portfolio.custom_section) {
            updateField('custom_section.enabled', true);
        }
    };

    const handleReset = () => {
        resetSection('appearance');
        setSuccess?.('Appearance and typography reset to default!');
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-soft-cream-200 dark:border-navy-700">
                <div>
                    <h2 className="text-2xl font-bold text-navy-800 dark:text-soft-cream-100">
                        Appearance & Global Theme
                    </h2>
                    <p className="text-sm text-navy-500 dark:text-soft-cream-400">
                        Customize global typography, color palette, and section visibility. Changes reflect instantly in preview.
                    </p>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-600 dark:text-soft-cream-300 bg-soft-cream-200 dark:bg-navy-700 hover:bg-soft-cream-300 dark:hover:bg-navy-600 transition-colors cursor-pointer"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Theme
                </button>
            </div>

            <div className="p-5 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2">
                    <Type className="w-4 h-4 text-golden-500" /> Global Typography
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Body & Interface Font
                        </label>
                        <select
                            value={appearance.fontFamily || 'Inter'}
                            onChange={(e) => updateField('appearance.fontFamily', e.target.value)}
                            className="input py-2 text-xs"
                        >
                            {FONT_OPTIONS.map(font => (
                                <option key={font.value} value={font.value}>{font.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Heading Font Family
                        </label>
                        <select
                            value={appearance.headingFont || 'Inter'}
                            onChange={(e) => updateField('appearance.headingFont', e.target.value)}
                            className="input py-2 text-xs"
                        >
                            {FONT_OPTIONS.map(font => (
                                <option key={font.value} value={font.value}>{font.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 dark:text-soft-cream-300">
                    <Palette className="w-4 h-4 text-navy-600" />
                    <span>Quick Color Palette Presets:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {PALETTE_PRESETS.map((preset, idx) => {
                        const active = isPresetActive(preset);
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleApplyPreset(preset)}
                                className={`p-3.5 rounded-2xl border text-left hover:scale-[1.02] transition-all glass flex flex-col justify-between cursor-pointer relative ${
                                    active
                                        ? 'border-golden-500 dark:border-golden-400 ring-2 ring-golden-500/40 bg-golden-50/60 dark:bg-golden-950/30 shadow-md'
                                        : 'border-soft-cream-300 dark:border-navy-700'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-navy-800 dark:text-soft-cream-100">
                                        {preset.name}
                                    </span>
                                    {active && (
                                        <Check className="w-3.5 h-3.5 text-golden-600 dark:text-golden-400" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: preset.primaryColor }} title="Primary" />
                                    <span className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: preset.secondaryColor }} title="Secondary" />
                                    <span className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: preset.accentColor }} title="Accent" />
                                    <span className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: preset.bgDark }} title="Dark BG" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-5 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Fine-Grained Color Controls
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Primary Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={appearance.primaryColor || '#627D98'}
                                onChange={(e) => updateField('appearance.primaryColor', e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-soft-cream-300 dark:border-navy-600 p-0.5 bg-transparent"
                            />
                            <span className="text-xs font-mono text-navy-700 dark:text-soft-cream-300 uppercase">
                                {appearance.primaryColor || '#627D98'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Secondary Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={appearance.secondaryColor || '#EDE0C9'}
                                onChange={(e) => updateField('appearance.secondaryColor', e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-soft-cream-300 dark:border-navy-600 p-0.5 bg-transparent"
                            />
                            <span className="text-xs font-mono text-navy-700 dark:text-soft-cream-300 uppercase">
                                {appearance.secondaryColor || '#EDE0C9'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={appearance.accentColor || '#DFCBA6'}
                                onChange={(e) => updateField('appearance.accentColor', e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-soft-cream-300 dark:border-navy-600 p-0.5 bg-transparent"
                            />
                            <span className="text-xs font-mono text-navy-700 dark:text-soft-cream-300 uppercase">
                                {appearance.accentColor || '#DFCBA6'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Light Mode BG
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={appearance.bgLight || '#FDFBF7'}
                                onChange={(e) => updateField('appearance.bgLight', e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-soft-cream-300 dark:border-navy-600 p-0.5 bg-transparent"
                            />
                            <span className="text-xs font-mono text-navy-700 dark:text-soft-cream-300 uppercase">
                                {appearance.bgLight || '#FDFBF7'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Dark Mode BG
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={appearance.bgDark || '#102A43'}
                                onChange={(e) => updateField('appearance.bgDark', e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-soft-cream-300 dark:border-navy-600 p-0.5 bg-transparent"
                            />
                            <span className="text-xs font-mono text-navy-700 dark:text-soft-cream-300 uppercase">
                                {appearance.bgDark || '#102A43'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl glass border border-golden-400/30 dark:border-golden-500/30 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-soft-cream-300/60 dark:border-navy-700/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-golden-700 dark:text-golden-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Live Theme & Font Preview
                    </span>
                    <span className="text-[11px] font-mono text-navy-500 dark:text-soft-cream-400">
                        {appearance.headingFont || 'Inter'} (Heading) • {appearance.fontFamily || 'Inter'} (Body)
                    </span>
                </div>

                <div
                    className="p-5 sm:p-6 rounded-2xl space-y-3 transition-colors border border-black/5 dark:border-white/5"
                    style={{
                        backgroundColor: appearance.bgLight || '#FDFBF7',
                        fontFamily: `"${appearance.fontFamily || 'Inter'}", system-ui, sans-serif`,
                    }}
                >
                    <h3
                        className="text-2xl sm:text-3xl font-black gradient-text"
                        style={{
                            fontFamily: `"${appearance.headingFont || appearance.fontFamily || 'Inter'}", system-ui, sans-serif`,
                        }}
                    >
                        Building Innovative High-Impact Software
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-navy-700">
                        This preview demonstrates your chosen font family, heading typography, and color palette. All changes reflect live across your portfolio.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <span
                            className="py-2 px-4 rounded-xl text-xs font-bold text-white shadow-md inline-block select-none"
                            style={{
                                background: `linear-gradient(135deg, ${appearance.primaryColor || '#627D98'} 0%, ${appearance.accentColor || '#DFCBA6'} 100%)`,
                            }}
                        >
                            Primary Action
                        </span>
                        <span
                            className="px-3 py-1 rounded-full text-xs font-bold border inline-block select-none"
                            style={{
                                backgroundColor: `${appearance.accentColor || '#DFCBA6'}25`,
                                borderColor: `${appearance.accentColor || '#DFCBA6'}80`,
                                color: appearance.accentColor || '#B8860B',
                            }}
                        >
                            Accent Badge
                        </span>
                        <div className="flex items-center gap-1.5 ml-auto">
                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: appearance.primaryColor || '#627D98' }} title="Primary" />
                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: appearance.secondaryColor || '#EDE0C9' }} title="Secondary" />
                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: appearance.accentColor || '#DFCBA6' }} title="Accent" />
                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: appearance.bgDark || '#102A43' }} title="Dark BG" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> Section Visibility Controls
                </h3>
                <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                    Toggle which sections appear in the public generated portfolio.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { key: 'hero', label: 'Home / Hero' },
                        { key: 'about', label: 'About Me' },
                        { key: 'skills', label: 'Skills & Tech' },
                        { key: 'projects', label: 'Projects' },
                        { key: 'certifications', label: 'Certifications' },
                        { key: 'custom_section', label: portfolio.custom_section?.nav_label || portfolio.custom_section?.title || 'Custom Page' },
                        { key: 'blog', label: 'Blog / Articles' },
                        { key: 'contact', label: 'Contact Form' },
                    ].map(({ key, label }) => {
                        const isVisible = visibility[key] !== false;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleSection(key)}
                                className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition-all ${isVisible
                                    ? 'border-navy-600 bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-soft-cream-100 shadow-xs'
                                    : 'border-soft-cream-200 dark:border-navy-700/60 opacity-50 text-navy-400'
                                    }`}
                            >
                                <span>{label}</span>
                                {isVisible && <Check className="w-3.5 h-3.5 text-navy-600 dark:text-soft-cream-300" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AppearanceTab;

