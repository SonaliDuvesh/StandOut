import React, { useRef, useState } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { portfolioAPI } from '../../services/api';
import { nameToUsernameSlug } from '../../utils/urlPortfolio';
import { Plus, Trash2, Upload, Image, RotateCcw, User, Bold, Italic, Type } from 'lucide-react';

const HomeTab = () => {
    const { portfolio, updateField, resetSection } = usePortfolio();
    const [uploadingBg, setUploadingBg] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const bgFileRef = useRef(null);
    const avatarFileRef = useRef(null);
    const bioTextareaRef = useRef(null);

    const titles = portfolio.titles || [];
    const bgSettings = portfolio.background_settings || { fit: 'cover', position: 'center', overlay: 0.2 };
    const homeTypography = portfolio.home_typography || {};

    const handleAddTitle = () => {
        updateField('titles', [...titles, 'New Professional Title']);
    };

    const handleUpdateTitle = (idx, value) => {
        const copy = [...titles];
        copy[idx] = value;
        updateField('titles', copy);
    };

    const handleRemoveTitle = (idx) => {
        updateField('titles', titles.filter((_, i) => i !== idx));
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        if (field === 'background_image') setUploadingBg(true);
        if (field === 'profile_image') setUploadingAvatar(true);

        try {
            const res = await portfolioAPI.uploadFile(file);
            const serverUrl = res.data.url;
            const fullUrl = serverUrl.startsWith('http') ? serverUrl : `http://localhost:8000${serverUrl}`;
            updateField(field, fullUrl);
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadError('Failed to upload file. Please ensure it is an image (<10MB).');
        } finally {
            setUploadingBg(false);
            setUploadingAvatar(false);
        }
    };

    const insertFormatting = (prefix, suffix = '') => {
        const textarea = bioTextareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = portfolio.short_bio || '';
        const selected = text.substring(start, end);
        const replacement = `${prefix}${selected || 'text'}${suffix}`;
        const newText = text.substring(0, start) + replacement + text.substring(end);
        updateField('short_bio', newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
        }, 0);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-soft-cream-200 dark:border-navy-700">
                <div>
                    <h2 className="text-2xl font-bold text-navy-800 dark:text-soft-cream-100">
                        Home & Landing Section
                    </h2>
                    <p className="text-sm text-navy-500 dark:text-soft-cream-400">
                        Customize your greeting, name, rotating professional titles, biography, and background visual.
                    </p>
                </div>
                <button
                    onClick={() => resetSection('home')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-600 dark:text-soft-cream-300 bg-soft-cream-200 dark:bg-navy-700 hover:bg-soft-cream-300 dark:hover:bg-navy-600 transition-colors"
                    title="Reset to default template"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Section
                </button>
            </div>

            {uploadError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                    {uploadError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-navy-700 dark:text-soft-cream-300 mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={portfolio.full_name || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            updateField('full_name', val);
                            const isDefaultDisplay = !portfolio.display_name ||
                                portfolio.display_name === portfolio.full_name ||
                                portfolio.display_name === 'Developer Name';
                            if (isDefaultDisplay) {
                                updateField('display_name', val);
                            }

                            const oldDerived = nameToUsernameSlug(portfolio.full_name || '');
                            const isDefaultUser = !portfolio.username ||
                                portfolio.username === 'username' ||
                                portfolio.username === 'user' ||
                                portfolio.username === oldDerived;
                            if (isDefaultUser && val.trim()) {
                                updateField('username', nameToUsernameSlug(val));
                            }
                        }}
                        className="input"
                        placeholder="e.g. Developer Name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-navy-700 dark:text-soft-cream-300 mb-2">
                        Display / Brand Name
                    </label>
                    <input
                        type="text"
                        value={portfolio.display_name || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            updateField('display_name', val);
                            const isDefaultUser = !portfolio.username ||
                                portfolio.username === 'username' ||
                                portfolio.username === 'user';
                            if (isDefaultUser && val.trim()) {
                                updateField('username', nameToUsernameSlug(val));
                            }
                        }}
                        className="input"
                        placeholder="e.g. Developer Name"
                    />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-navy-700 dark:text-soft-cream-300 mb-2 flex items-center justify-between">
                        <span>Portfolio Handle & Public URL Slug</span>
                        <span className="text-xs text-navy-500 dark:text-soft-cream-400 font-normal">
                            Public URL: <strong className="font-mono text-emerald-600 dark:text-emerald-400">/{portfolio.username || 'username'}</strong>
                        </span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 dark:text-soft-cream-400 font-mono text-sm font-bold">@</span>
                        <input
                            type="text"
                            value={portfolio.username || ''}
                            onChange={(e) => {
                                const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                                updateField('username', clean);
                            }}
                            className="input pl-8 font-mono text-sm"
                            placeholder="e.g. username"
                        />
                    </div>
                    <p className="text-[11px] text-navy-500 dark:text-soft-cream-400 mt-1.5">
                        Controls your public URL (<span className="font-mono">/{portfolio.username || 'username'}</span>) and customizer header handle.
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-soft-cream-300 mb-2">
                    Greeting Line
                </label>
                <input
                    type="text"
                    value={portfolio.greeting || ''}
                    onChange={(e) => updateField('greeting', e.target.value)}
                    className="input"
                    placeholder="e.g. Hi there! I'm"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-navy-700 dark:text-soft-cream-300">
                        Rotating Titles (Animated Typewriter Effect)
                    </label>
                    <button
                        type="button"
                        onClick={handleAddTitle}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-soft-cream-400 hover:text-navy-900 dark:hover:text-soft-cream-100"
                    >
                        <Plus className="w-4 h-4" /> Add Title
                    </button>
                </div>
                <div className="space-y-2">
                    {titles.map((title, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => handleUpdateTitle(idx, e.target.value)}
                                className="input py-2 text-sm"
                                placeholder="e.g. Full-Stack Engineer"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveTitle(idx)}
                                disabled={titles.length <= 1}
                                className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-30 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-navy-700 dark:text-soft-cream-300">
                        Short Introduction / Biography
                    </label>
                    <span className="text-xs text-navy-500 dark:text-soft-cream-400">
                        Exact line arrangement and spacing are preserved
                    </span>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 rounded-t-xl bg-soft-cream-200 dark:bg-navy-800 border-t border-l border-r border-soft-cream-300 dark:border-navy-700">
                    <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="p-1.5 rounded-lg hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-xs font-bold text-navy-800 dark:text-soft-cream-200 inline-flex items-center gap-1"
                        title="Bold Text"
                    >
                        <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="p-1.5 rounded-lg hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-xs italic text-navy-800 dark:text-soft-cream-200 inline-flex items-center gap-1"
                        title="Italic Text"
                    >
                        <Italic className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-navy-300 dark:bg-navy-700 mx-1" />
                    <button
                        type="button"
                        onClick={() => insertFormatting('\n')}
                        className="px-2 py-1 rounded-lg hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-[11px] text-navy-700 dark:text-soft-cream-300"
                        title="Insert Line Break"
                    >
                        New Line
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('\n\n')}
                        className="px-2 py-1 rounded-lg hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-[11px] text-navy-700 dark:text-soft-cream-300"
                        title="Insert Paragraph Separation"
                    >
                        New Paragraph
                    </button>
                </div>

                <textarea
                    ref={bioTextareaRef}
                    rows={4}
                    value={portfolio.short_bio || ''}
                    onChange={(e) => updateField('short_bio', e.target.value)}
                    className="input rounded-t-none leading-relaxed"
                    placeholder="Hello, I'm Alex.&#10;A Computer Science Student.&#10;Interested in AI and Web Development."
                />
            </div>

            <div className="p-5 rounded-2xl border border-soft-cream-300 dark:border-navy-700 bg-white/60 dark:bg-navy-800/60 space-y-4">
                <h3 className="text-base font-bold text-navy-800 dark:text-soft-cream-200 flex items-center gap-2">
                    <Type className="w-4 h-4" /> Home Typography & Styling
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Heading Font Size
                        </label>
                        <select
                            value={homeTypography.headingSize || 'standard'}
                            onChange={(e) => updateField('home_typography.headingSize', e.target.value)}
                            className="input py-2 text-xs"
                        >
                            <option value="standard">Standard (5xl–8xl)</option>
                            <option value="large">Large Hero (6xl–9xl)</option>
                            <option value="compact">Compact (4xl–6xl)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Font Weight
                        </label>
                        <select
                            value={homeTypography.fontWeight || 'bold'}
                            onChange={(e) => updateField('home_typography.fontWeight', e.target.value)}
                            className="input py-2 text-xs"
                        >
                            <option value="bold">Bold (700)</option>
                            <option value="extrabold">Extra Bold (800)</option>
                            <option value="semibold">Semi Bold (600)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                            Greeting & Subtitle Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={homeTypography.subtitleColor || '#486581'}
                                onChange={(e) => updateField('home_typography.subtitleColor', e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-soft-cream-300 dark:border-navy-600 p-0.5 bg-transparent"
                            />
                            <span className="text-xs font-mono text-navy-700 dark:text-soft-cream-300 uppercase">
                                {homeTypography.subtitleColor || '#486581'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-2xl border border-soft-cream-300 dark:border-navy-700 bg-white/60 dark:bg-navy-800/60 space-y-4">
                <h3 className="text-base font-bold text-navy-800 dark:text-soft-cream-200 flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile Avatar / Photo (Optional)
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                    {portfolio.profile_image ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-navy-500 shadow-md shrink-0">
                            <img
                                src={portfolio.profile_image}
                                alt="Profile avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-soft-cream-200 dark:bg-navy-700 flex items-center justify-center text-navy-400 shrink-0">
                            <User className="w-8 h-8" />
                        </div>
                    )}
                    <div className="flex-1 space-y-3 w-full">
                        <input
                            type="text"
                            value={portfolio.profile_image || ''}
                            onChange={(e) => updateField('profile_image', e.target.value)}
                            className="input py-2 text-sm"
                            placeholder="Enter image URL or upload file"
                        />
                        <div className="flex items-center gap-3">
                            <input
                                ref={avatarFileRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'profile_image')}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => avatarFileRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {uploadingAvatar ? 'Uploading...' : 'Upload Avatar Image'}
                            </button>
                            {portfolio.profile_image && (
                                <button
                                    type="button"
                                    onClick={() => updateField('profile_image', '')}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-2xl border border-soft-cream-300 dark:border-navy-700 bg-white/60 dark:bg-navy-800/60 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-navy-800 dark:text-soft-cream-200 flex items-center gap-2">
                        <Image className="w-4 h-4" /> Landing Page Background Image
                    </h3>
                    {portfolio.background_image && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ Custom background active
                        </span>
                    )}
                </div>
                <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                    Upload an image (JPG, PNG, WebP) to replace the default gradient background.
                </p>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={portfolio.background_image || ''}
                            onChange={(e) => updateField('background_image', e.target.value)}
                            className="input py-2 text-sm"
                            placeholder="Image URL or upload a file"
                        />
                        <input
                            ref={bgFileRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'background_image')}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => bgFileRef.current?.click()}
                            disabled={uploadingBg}
                            className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-1.5 shrink-0"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {uploadingBg ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>

                    {portfolio.background_image && (
                        <div className="space-y-4 pt-3 border-t border-soft-cream-200 dark:border-navy-700">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-1">
                                        Background Sizing
                                    </label>
                                    <select
                                        value={bgSettings.fit || 'cover'}
                                        onChange={(e) => updateField('background_settings.fit', e.target.value)}
                                        className="input py-2 text-sm"
                                    >
                                        <option value="cover">Cover (Fill Screen)</option>
                                        <option value="contain">Contain (Fit Aspect)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-1">
                                        Positioning
                                    </label>
                                    <select
                                        value={bgSettings.position || 'center'}
                                        onChange={(e) => updateField('background_settings.position', e.target.value)}
                                        className="input py-2 text-sm"
                                    >
                                        <option value="center">Center</option>
                                        <option value="top">Top</option>
                                        <option value="bottom">Bottom</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300">
                                            Overlay Opacity: {Math.round((bgSettings.overlay ?? 0.2) * 100)}%
                                        </label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.9"
                                        step="0.05"
                                        value={bgSettings.overlay ?? 0.2}
                                        onChange={(e) => updateField('background_settings.overlay', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-soft-cream-300 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => updateField('background_image', '')}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Remove background image (revert to original dynamic gradient)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeTab;
