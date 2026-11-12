import React, { useState, useRef } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { portfolioAPI } from '../../services/api';
import { PRESET_PLATFORMS } from '../../utils/socialPresets';
import {
    Mail, Plus, Trash2, ArrowUp, ArrowDown, Upload, Link as LinkIcon,
    Sparkles, Eye, Check, ExternalLink, Globe, RotateCcw, AlertCircle,
    Type, AlignLeft, EyeOff
} from 'lucide-react';

const DEFAULT_FLOATING_ITEMS = [
    {
        id: 'fl-1',
        name: 'LinkedIn',
        platform: 'linkedin',
        url: 'https://www.linkedin.com/in/username/',
        image_url: '/social/linkedin.png',
        pink_image_url: '/social/pink/linkedin.png',
        enabled: true
    },
    {
        id: 'fl-2',
        name: 'GitHub',
        platform: 'github',
        url: 'https://github.com/username/',
        image_url: '/social/github.png',
        pink_image_url: '/social/pink/github.png',
        enabled: true
    },
    {
        id: 'fl-3',
        name: 'Medium',
        platform: 'medium',
        url: 'https://medium.com/',
        image_url: '/social/medium.png',
        pink_image_url: '/social/pink/medium.png',
        enabled: true
    },
    {
        id: 'fl-4',
        name: 'Devpost',
        platform: 'devpost',
        url: 'https://devpost.com/',
        image_url: '/social/devpost.png',
        pink_image_url: '/social/pink/devpost.png',
        enabled: true
    }
];

const ContactTab = () => {
    const { portfolio, updateField, resetSection } = usePortfolio();
    const social = portfolio.social_links || {};
    const visibility = portfolio.sections_visibility || {};
    const isContactVisible = visibility.contact !== false;

    const floatingLinks = Array.isArray(social.floating_links)
        ? social.floating_links
        : DEFAULT_FLOATING_ITEMS;

    const sectionTitle = social.title !== undefined ? social.title : 'Get In Touch';
    const sectionSubtitle = social.subtitle !== undefined ? social.subtitle : 'Have a question, opportunity, or just want to connect? Drop a message below!';

    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRefs = useRef({});

    const toggleContactVisibility = () => {
        updateField('sections_visibility.contact', !isContactVisible);
    };

    const updateFloatingLinks = (newLinks) => {
        const currentSocial = portfolio.social_links || {};
        const updatedSocial = {
            ...currentSocial,
            floating_links: newLinks,
        };

        ['github', 'linkedin', 'medium', 'devpost', 'twitter'].forEach((key) => {
            const matching = newLinks.find(
                (l) => (l.platform?.toLowerCase() === key || l.name?.toLowerCase() === key) && l.enabled !== false
            );
            updatedSocial[key] = matching ? (matching.url || '') : '';
        });

        updateField('social_links', updatedSocial);
    };

    const handleAddFloatingLink = () => {
        const newId = `fl-${Date.now()}`;
        const newLink = {
            id: newId,
            name: 'GitHub',
            platform: 'github',
            url: 'https://github.com/',
            image_url: '/social/github.png',
            pink_image_url: '/social/pink/github.png',
            enabled: true,
        };
        updateFloatingLinks([...floatingLinks, newLink]);
    };

    const handleRemoveFloatingLink = (index) => {
        const updated = floatingLinks.filter((_, i) => i !== index);
        updateFloatingLinks(updated);
    };

    const handleFieldChange = (index, field, value) => {
        const updated = [...floatingLinks];
        updated[index] = { ...updated[index], [field]: value };
        updateFloatingLinks(updated);
    };

    const handleResetToPresetLogo = (index, preset) => {
        if (!preset) return;
        const updated = [...floatingLinks];
        updated[index] = {
            ...updated[index],
            image_url: preset.src,
            pink_image_url: preset.pinkSrc,
        };
        updateFloatingLinks(updated);
    };

    const handlePlatformChange = (index, platformId) => {
        const preset = PRESET_PLATFORMS.find(p => p.id === platformId);
        const updated = [...floatingLinks];
        const current = updated[index];

        if (preset && preset.id !== 'custom') {
            updated[index] = {
                ...current,
                platform: preset.id,
                name: preset.name,
                image_url: preset.src,
                pink_image_url: preset.pinkSrc,
                url: (!current.url || current.url === 'https://' || current.url.startsWith('https://medium.com/@') || current.url === 'https://github.com/')
                    ? preset.defaultUrl
                    : current.url,
            };
        } else {
            updated[index] = {
                ...current,
                platform: 'custom',
                name: (current.name === 'Medium' || current.name === 'GitHub') ? 'Custom Platform' : current.name,
                image_url: current.image_url || '/social/website.svg',
                pink_image_url: current.pink_image_url || '/social/website.svg',
            };
        }
        updateFloatingLinks(updated);
    };

    const handleMove = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= floatingLinks.length) return;
        const updated = [...floatingLinks];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        updateFloatingLinks(updated);
    };

    const handleFileUpload = async (index, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingIndex(index);
        setUploadError(null);

        try {
            const res = await portfolioAPI.uploadFile(file);
            if (res.data?.url) {
                const updated = [...floatingLinks];
                updated[index] = {
                    ...updated[index],
                    image_url: res.data.url,
                    pink_image_url: res.data.url,
                };
                updateFloatingLinks(updated);
            }
        } catch (err) {
            console.error('Failed to upload logo image:', err);
            setUploadError('Failed to upload image. Please try a valid PNG, JPG, WebP, or SVG file under 10MB.');
            setTimeout(() => setUploadError(null), 5000);
        } finally {
            setUploadingIndex(null);
            if (fileInputRefs.current[index]) {
                fileInputRefs.current[index].value = '';
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-soft-cream-200 dark:border-navy-700">
                <div>
                    <h2 className="text-2xl font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-golden-500" />
                        <span>Contact Section & Floating Socials</span>
                    </h2>
                    <p className="text-sm text-navy-500 dark:text-soft-cream-400 mt-1">
                        Customize your contact page title, email destination, and floating anti-gravity social icons.
                    </p>
                </div>
                <button
                    onClick={() => resetSection('contact')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-600 dark:text-soft-cream-300 bg-soft-cream-200 dark:bg-navy-700 hover:bg-soft-cream-300 dark:hover:bg-navy-600 transition-colors shrink-0 cursor-pointer"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                </button>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm bg-gradient-to-r from-soft-cream-100/60 to-transparent dark:from-navy-900/40 dark:to-transparent">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy-800 dark:text-soft-cream-100">
                            Show Contact Section in Portfolio
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isContactVisible
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                            {isContactVisible ? 'Visible on Website' : 'Hidden from Website'}
                        </span>
                    </div>
                    <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                        When disabled, the Contact section and form are completely omitted from your public portfolio and navigation bar.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={toggleContactVisibility}
                    className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                        isContactVisible
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                >
                    {isContactVisible ? (
                        <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide Contact Section</span>
                        </>
                    ) : (
                        <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Enable Contact Section</span>
                        </>
                    )}
                </button>
            </div>

            <div className="p-5 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-navy-800 dark:text-soft-cream-100 font-bold text-sm">
                    <Type className="w-4 h-4 text-golden-500" />
                    <span>Section Titles & Heading Copy</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-300 mb-1">
                            Main Section Heading
                        </label>
                        <input
                            type="text"
                            value={sectionTitle}
                            onChange={(e) => updateField('social_links.title', e.target.value)}
                            className="input py-2 text-sm font-semibold"
                            placeholder="e.g. Get In Touch, Let's Connect, Reach Out"
                        />
                        <span className="text-[11px] text-navy-400 dark:text-soft-cream-400 mt-1 block">
                            Displayed as the primary section title with gradient styling.
                        </span>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-300 mb-1">
                            Subtitle / Welcome Text
                        </label>
                        <input
                            type="text"
                            value={sectionSubtitle}
                            onChange={(e) => updateField('social_links.subtitle', e.target.value)}
                            className="input py-2 text-xs"
                            placeholder="e.g. Have a question or opportunity? Feel free to reach out!"
                        />
                        <span className="text-[11px] text-navy-400 dark:text-soft-cream-400 mt-1 block">
                            Appears directly below the heading.
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-navy-800 dark:text-soft-cream-100 font-bold text-sm">
                    <Mail className="w-4 h-4 text-golden-500" />
                    <span>Contact Email & Message Destination</span>
                </div>
                <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                    This email is displayed on the contact form card for direct inquiries, and received messages will be associated with this address.
                </p>
                <div className="relative max-w-md">
                    <input
                        type="email"
                        value={social.email !== undefined ? social.email : ''}
                        onChange={(e) => updateField('social_links.email', e.target.value)}
                        className="input py-2 pl-9 text-sm font-mono"
                        placeholder="e.g. yourname@domain.com"
                    />
                    <Mail className="w-4 h-4 text-navy-400 dark:text-soft-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="p-4 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 space-y-2 shadow-sm bg-gradient-to-br from-soft-cream-100/50 via-soft-cream-50/30 to-soft-cream-200/50 dark:from-navy-950/70 dark:via-navy-900/60 dark:to-navy-950/80">
                <div className="flex items-center justify-between text-xs font-bold text-navy-700 dark:text-soft-cream-200">
                    <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-golden-500" />
                        <span>Live Anti-Gravity Floating Preview ({floatingLinks.filter(l => l.enabled !== false).length} Active)</span>
                    </span>
                    <span className="text-[11px] font-normal text-navy-400 dark:text-soft-cream-400">
                        Exact physics rendered in Contact section
                    </span>
                </div>

                <div className="relative w-full h-44 sm:h-52 rounded-xl bg-soft-cream-200/50 dark:bg-navy-950/60 border border-soft-cream-300/80 dark:border-navy-800 overflow-hidden flex items-center justify-center">
                    <div className="text-[11px] font-semibold text-navy-400 dark:text-soft-cream-500/70 select-none pointer-events-none">
                        Anti-Gravity Drift Field
                    </div>

                    {floatingLinks.filter(l => l.enabled !== false).map((item, index) => {
                        const animIndex = (index % 4) + 1;
                        const animClassX = `anti-g-${animIndex}-x`;
                        const animClassY = `anti-g-${animIndex}-y`;
                        const animClassR = `anti-g-${animIndex}-r`;
                        const slots = [
                            'top-[10%] left-[8%]',
                            'top-[10%] right-[8%]',
                            'bottom-[12%] left-[10%]',
                            'bottom-[10%] right-[10%]',
                            'top-[42%] left-[4%]',
                            'top-[40%] right-[4%]',
                            'top-[8%] left-[45%]',
                            'bottom-[8%] left-[45%]',
                        ];
                        const pos = slots[index % slots.length];
                        const src = item.image_url || '/social/website.svg';

                        return (
                            <div
                                key={item.id || index}
                                className={`absolute z-10 select-none ${pos} ${animClassX}`}
                            >
                                <div className={animClassY}>
                                    <div className={animClassR}>
                                        <div className="p-1 rounded-xl glass hover:scale-110 transition-transform shadow-md">
                                            <img
                                                src={src}
                                                alt={item.name}
                                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/social/website.svg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {uploadError && (
                <div className="p-3 rounded-xl bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200 border border-red-300 dark:border-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-navy-800 dark:text-soft-cream-200">
                            Configured Floating Profiles ({floatingLinks.length})
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                            Add, rearrange, upload logos, or edit destination URLs for any platform.
                        </p>
                    </div>
                    <button
                        onClick={handleAddFloatingLink}
                        className="btn-primary py-2 px-3.5 text-xs font-bold inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-golden-600 hover:from-amber-600 hover:to-golden-700 text-white shadow-sm cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Floating Link</span>
                    </button>
                </div>

                <div className="space-y-3">
                    {floatingLinks.map((item, index) => {
                        const activePlatform = PRESET_PLATFORMS.find(p => p.id === item.platform) || PRESET_PLATFORMS.find(p => p.id === 'custom');

                        return (
                            <div
                                key={item.id || index}
                                className={`p-4 sm:p-5 rounded-2xl glass border transition-all ${
                                    item.enabled !== false
                                        ? 'border-soft-cream-300 dark:border-navy-700 shadow-sm'
                                        : 'border-dashed border-soft-cream-200 dark:border-navy-800 opacity-60'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="relative group shrink-0">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 flex items-center justify-center p-2 overflow-hidden shadow-xs bg-white/70 dark:bg-navy-900/70">
                                            {uploadingIndex === index ? (
                                                <div className="w-6 h-6 border-2 border-golden-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <img
                                                    src={item.image_url || '/social/website.svg'}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain filter hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/social/website.svg';
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[index]?.click()}
                                            disabled={uploadingIndex === index}
                                            className="absolute inset-0 bg-navy-950/70 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition-opacity cursor-pointer p-1"
                                            title="Click to change/upload logo image"
                                        >
                                            <Upload className="w-3.5 h-3.5 mb-0.5 text-golden-400" />
                                            <span>Upload</span>
                                        </button>

                                        <input
                                            type="file"
                                            ref={(el) => (fileInputRefs.current[index] = el)}
                                            onChange={(e) => handleFileUpload(index, e)}
                                            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="flex-1 w-full space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                                    Select Platform / Profile
                                                </label>
                                                <select
                                                    value={item.platform || 'custom'}
                                                    onChange={(e) => handlePlatformChange(index, e.target.value)}
                                                    className="input py-1.5 text-xs font-medium cursor-pointer"
                                                >
                                                    {PRESET_PLATFORMS.map((preset) => (
                                                        <option key={preset.id} value={preset.id}>
                                                            {preset.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                                    Display Label
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.name || ''}
                                                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                    className="input py-1.5 text-xs font-medium"
                                                    placeholder="e.g. Medium, Devpost, Substack"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-navy-600 dark:text-soft-cream-400 mb-1 flex items-center justify-between">
                                                <span>Website Destination Link (URL)</span>
                                                {item.url && item.url.startsWith('http') && (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-golden-600 dark:text-golden-400 hover:underline inline-flex items-center gap-1"
                                                    >
                                                        <span>Test Link</span>
                                                        <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                )}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="url"
                                                    value={item.url || ''}
                                                    onChange={(e) => handleFieldChange(index, 'url', e.target.value)}
                                                    className="input py-1.5 pl-8 text-xs font-mono"
                                                    placeholder={activePlatform?.placeholder || 'https://...'}
                                                />
                                                <LinkIcon className="w-3.5 h-3.5 text-navy-400 dark:text-soft-cream-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-soft-cream-200/60 dark:border-navy-800/60 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRefs.current[index]?.click()}
                                                disabled={uploadingIndex === index}
                                                className="px-2.5 py-1 rounded-lg bg-soft-cream-200 dark:bg-navy-800 hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-navy-700 dark:text-soft-cream-300 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <Upload className="w-3 h-3 text-golden-500" />
                                                <span>Upload Logo Image</span>
                                            </button>

                                            {activePlatform && activePlatform.id !== 'custom' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleResetToPresetLogo(index, activePlatform)}
                                                    className="px-2.5 py-1 rounded-lg bg-soft-cream-200 dark:bg-navy-800 hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-navy-700 dark:text-soft-cream-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                                >
                                                    Use Default {activePlatform.name} Logo
                                                </button>
                                            )}

                                            <div className="flex-1 min-w-[200px]">
                                                <input
                                                    type="text"
                                                    value={item.image_url || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const updated = [...floatingLinks];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            image_url: val,
                                                            pink_image_url: val,
                                                        };
                                                        updateFloatingLinks(updated);
                                                    }}
                                                    className="input py-1 text-[11px] font-mono"
                                                    placeholder="Or paste custom image URL..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-soft-cream-200 dark:border-navy-800 pt-2 sm:pt-0 sm:pl-3">
                                        <button
                                            type="button"
                                            onClick={() => handleMove(index, -1)}
                                            disabled={index === 0}
                                            className="p-1.5 rounded-lg text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            title="Move Up"
                                        >
                                            <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMove(index, 1)}
                                            disabled={index === floatingLinks.length - 1}
                                            className="p-1.5 rounded-lg text-navy-600 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            title="Move Down"
                                        >
                                            <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleFieldChange(index, 'enabled', item.enabled === false ? true : false)}
                                            className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                                item.enabled !== false
                                                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                                    : 'text-navy-400 hover:bg-soft-cream-200 dark:hover:bg-navy-800'
                                            }`}
                                            title={item.enabled !== false ? 'Active (click to hide)' : 'Hidden (click to show)'}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFloatingLink(index)}
                                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                            title="Remove Floating Link"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {floatingLinks.length === 0 && (
                    <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-soft-cream-300 dark:border-navy-700 space-y-2">
                        <p className="text-sm font-semibold text-navy-600 dark:text-soft-cream-300">
                            No floating social links configured yet.
                        </p>
                        <p className="text-xs text-navy-400 dark:text-soft-cream-400">
                            If you don't have social links, the contact form on your portfolio will be neatly centered.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={handleAddFloatingLink}
                                className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Your First Floating Link</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactTab;
