import React, { useRef, useState } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { portfolioAPI } from '../../services/api';
import {
    Sparkles, Plus, Trash2, ArrowUp, ArrowDown, Upload,
    ExternalLink, Eye, LayoutGrid, Calendar, BookOpen, Type,
    RotateCcw, Check, Layers
} from 'lucide-react';

const PRESET_TEMPLATES = {
    experience: {
        title: 'Work Experience & Journey',
        subtitle: 'Professional history, leadership milestones, and software engineering roles',
        nav_label: 'Experience',
        slug: 'experience',
        layout: 'timeline',
        badge: 'Career Milestones',
        font_family: 'sans',
        content_blocks: [
            {
                id: 'exp-1',
                title: 'Senior AI & Software Developer',
                subtitle: 'NextGen Autonomous Systems • 2024 - Present',
                description: 'Architecting scalable web tools, real-time multi-agent workflows, and responsive 3D interactive user interfaces.',
                tags: ['React', 'FastAPI', 'Docker', 'WebSockets', 'Python'],
                link_url: '',
                link_text: 'Company Overview',
                image_url: '',
                date_badge: '2024 - Present'
            },
            {
                id: 'exp-2',
                title: 'Data Science & Machine Learning Research Fellow',
                subtitle: 'Applied Intelligence Lab • 2023 - 2024',
                description: 'Engineered high-throughput computer vision pipelines and published reproducible data analysis benchmarks.',
                tags: ['Python', 'PyTorch', 'OpenCV', 'Pandas', 'FastAPI'],
                link_url: '',
                link_text: 'Research Details',
                image_url: '',
                date_badge: '2023 - 2024'
            }
        ]
    },
    publications: {
        title: 'Research & Publications',
        subtitle: 'Peer-reviewed papers, open-source technical whitepapers, and academic contributions',
        nav_label: 'Publications',
        slug: 'publications',
        layout: 'cards',
        badge: 'Scholarly Work',
        font_family: 'serif',
        content_blocks: [
            {
                id: 'pub-1',
                title: 'Anti-Gravity Motion: Physics-Driven Responsive Web Viewports',
                subtitle: 'International Journal of Modern Web Systems (2025)',
                description: 'Investigating real-time CSS GPU transforms, kinetic scroll runways, and adaptive framerate optimization for dynamic web applications.',
                tags: ['Peer-Reviewed', 'Web Performance', 'Computer Graphics'],
                link_url: 'https://arxiv.org',
                link_text: 'Read Paper (PDF)',
                image_url: '',
                date_badge: 'Published 2025'
            },
            {
                id: 'pub-2',
                title: 'Automated OSINT & Cyber Threat Intelligence Mining',
                subtitle: 'Conference on Applied Cybersecurity & Data Science',
                description: 'Empirical assessment of automated entity extraction, threat graph correlation, and open-source intelligence pipelines.',
                tags: ['OSINT', 'Cybersecurity', 'NLP', 'Data Mining'],
                link_url: 'https://arxiv.org',
                link_text: 'Conference Proceedings',
                image_url: '',
                date_badge: 'Presented 2024'
            }
        ]
    },
    services: {
        title: 'Services & What I Offer',
        subtitle: 'End-to-end technical solutions, consulting, and bespoke software development',
        nav_label: 'Services',
        slug: 'services',
        layout: 'cards',
        badge: 'Client Offerings',
        font_family: 'sans',
        content_blocks: [
            {
                id: 'srv-1',
                title: 'Full-Stack Web App Development',
                subtitle: 'Custom Platforms & Interactive Portals',
                description: 'Production-ready web applications built with React, Vite, Node.js/Python, and cloud deployments. Optimized for blistering speed and mobile responsiveness.',
                tags: ['Full-Stack', 'React', 'FastAPI', 'Tailwind CSS'],
                link_url: '#contact',
                link_text: 'Inquire for Project',
                image_url: '',
                date_badge: 'Available Now'
            },
            {
                id: 'srv-2',
                title: 'AI & Data Science Consulting',
                subtitle: 'Machine Learning & Predictive Systems',
                description: 'Fine-tuning AI models, structuring automated data extraction pipelines, and delivering actionable analytics dashboards for complex data.',
                tags: ['AI/ML', 'Data Pipelines', 'Automation', 'Python'],
                link_url: '#contact',
                link_text: 'Book Consultation',
                image_url: '',
                date_badge: 'Available Now'
            }
        ]
    }
};

const CustomPageTab = () => {
    const { portfolio, updateField } = usePortfolio();
    const custom = portfolio.custom_section || {};
    const visibility = portfolio.sections_visibility || {};

    const isEnabled = custom.enabled !== false && visibility.custom_section !== false;
    const blocks = Array.isArray(custom.content_blocks) ? custom.content_blocks : [];

    const fileInputRefs = useRef({});
    const [uploadingId, setUploadingId] = useState(null);

    const handleToggleEnabled = (enabled) => {
        updateField('custom_section.enabled', enabled);
        updateField('sections_visibility.custom_section', enabled);
    };

    const handleApplyTemplate = (key) => {
        const tpl = PRESET_TEMPLATES[key];
        if (!tpl) return;
        updateField('custom_section', {
            ...tpl,
            enabled: true,
        });
        updateField('sections_visibility.custom_section', true);
    };

    const handleAddBlock = () => {
        const newBlock = {
            id: `block-${Date.now()}`,
            title: 'New Milestone / Item',
            subtitle: 'Organization or Context',
            description: 'Provide an engaging description of what you accomplished or what this section represents.',
            tags: ['Skill', 'Tool', 'Highlight'],
            link_url: '',
            link_text: 'Learn More',
            image_url: '',
            date_badge: 'Present'
        };
        updateField('custom_section.content_blocks', [...blocks, newBlock]);
    };

    const handleUpdateBlock = (index, field, value) => {
        const copy = [...blocks];
        copy[index] = { ...copy[index], [field]: value };
        updateField('custom_section.content_blocks', copy);
    };

    const handleRemoveBlock = (index) => {
        updateField('custom_section.content_blocks', blocks.filter((_, i) => i !== index));
    };

    const handleMoveBlock = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= blocks.length) return;
        const copy = [...blocks];
        const [moved] = copy.splice(index, 1);
        copy.splice(targetIndex, 0, moved);
        updateField('custom_section.content_blocks', copy);
    };

    const handleUploadImage = async (e, index, blockId) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(blockId);
        try {
            const res = await portfolioAPI.uploadFile(file);
            const serverUrl = res.data.url;
            const fullUrl = serverUrl.startsWith('http') ? serverUrl : `http://localhost:8000${serverUrl}`;
            handleUpdateBlock(index, 'image_url', fullUrl);
        } catch (err) {
            console.error('Image upload failed:', err);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploadingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soft-cream-200 dark:border-navy-700">
                <div>
                    <h2 className="text-2xl font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2.5">
                        <Sparkles className="w-6 h-6 text-golden-500" />
                        <span>Custom Page & Section Creator</span>
                    </h2>
                    <p className="text-sm text-navy-500 dark:text-soft-cream-400">
                        Add a completely custom page or section to your portfolio (Experience, Publications, Services, Stories, or anything you want).
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/70 dark:bg-navy-900/70 p-2.5 px-4 rounded-2xl border border-soft-cream-300 dark:border-navy-700 shadow-xs">
                    <span className="text-xs font-bold text-navy-800 dark:text-soft-cream-100">
                        Section Active
                    </span>
                    <button
                        type="button"
                        onClick={() => handleToggleEnabled(!isEnabled)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                            isEnabled ? 'bg-emerald-500' : 'bg-navy-300 dark:bg-navy-700'
                        }`}
                        title="Toggle Section Visibility"
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                isEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl glass border border-golden-500/30 dark:border-golden-500/20 bg-gradient-to-r from-soft-cream-100/70 via-white/40 to-golden-50/30 dark:from-navy-950/80 dark:to-golden-950/20 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-golden-700 dark:text-golden-400">
                        ⚡ Quick Start Templates (1-Click Fill)
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                        type="button"
                        onClick={() => handleApplyTemplate('experience')}
                        className="p-3 rounded-2xl bg-white/80 dark:bg-navy-800/80 border border-soft-cream-300 dark:border-navy-700 hover:border-golden-500 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                    >
                        <div className="text-xs font-bold text-navy-900 dark:text-soft-cream-100 flex items-center gap-1.5 mb-1">
                            <span>💼</span> <span>Work Experience</span>
                        </div>
                        <p className="text-[11px] text-navy-500 dark:text-soft-cream-400">
                            Career milestones with vertical connecting timeline.
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleApplyTemplate('publications')}
                        className="p-3 rounded-2xl bg-white/80 dark:bg-navy-800/80 border border-soft-cream-300 dark:border-navy-700 hover:border-golden-500 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                    >
                        <div className="text-xs font-bold text-navy-900 dark:text-soft-cream-100 flex items-center gap-1.5 mb-1">
                            <span>📜</span> <span>Research & Papers</span>
                        </div>
                        <p className="text-[11px] text-navy-500 dark:text-soft-cream-400">
                            Academic papers and scholarly contributions in card deck.
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleApplyTemplate('services')}
                        className="p-3 rounded-2xl bg-white/80 dark:bg-navy-800/80 border border-soft-cream-300 dark:border-navy-700 hover:border-golden-500 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                    >
                        <div className="text-xs font-bold text-navy-900 dark:text-soft-cream-100 flex items-center gap-1.5 mb-1">
                            <span>🚀</span> <span>Services & Offerings</span>
                        </div>
                        <p className="text-[11px] text-navy-500 dark:text-soft-cream-400">
                            What you build, offer, and deliver for clients or teams.
                        </p>
                    </button>
                </div>
            </div>

            <div className="p-6 rounded-3xl glass border border-soft-cream-300 dark:border-navy-700 space-y-5 shadow-sm">
                <h3 className="text-base font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-golden-500" />
                    <span>Section Identity & Navigation</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-1">
                            Section Main Title
                        </label>
                        <input
                            type="text"
                            value={custom.title || ''}
                            onChange={(e) => updateField('custom_section.title', e.target.value)}
                            placeholder="e.g. Work Experience, Publications, Services"
                            className="input py-2 text-xs font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-1">
                            Decorative Badge / Tag
                        </label>
                        <input
                            type="text"
                            value={custom.badge || ''}
                            onChange={(e) => updateField('custom_section.badge', e.target.value)}
                            placeholder="e.g. Career Milestones, Scholarly, Offerings"
                            className="input py-2 text-xs"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-1">
                            Section Subtitle & Tagline
                        </label>
                        <input
                            type="text"
                            value={custom.subtitle || ''}
                            onChange={(e) => updateField('custom_section.subtitle', e.target.value)}
                            placeholder="A concise description introducing this section"
                            className="input py-2 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-1">
                            Navbar Link Label
                        </label>
                        <input
                            type="text"
                            value={custom.nav_label || ''}
                            onChange={(e) => updateField('custom_section.nav_label', e.target.value)}
                            placeholder="e.g. Experience, Services"
                            className="input py-2 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-1">
                            URL Anchor / Slug
                        </label>
                        <input
                            type="text"
                            value={custom.slug || ''}
                            onChange={(e) => updateField('custom_section.slug', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                            placeholder="e.g. experience, services"
                            className="input py-2 text-xs font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-soft-cream-200 dark:border-navy-700/80">
                    <div>
                        <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-2 flex items-center gap-1.5">
                            <LayoutGrid className="w-3.5 h-3.5 text-golden-500" />
                            <span>Visual Layout Mode</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'timeline', label: 'Timeline', icon: Calendar },
                                { id: 'cards', label: 'Cards Grid', icon: LayoutGrid },
                                { id: 'story', label: 'Editorial', icon: BookOpen },
                            ].map((l) => (
                                <button
                                    key={l.id}
                                    type="button"
                                    onClick={() => updateField('custom_section.layout', l.id)}
                                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 text-xs font-semibold transition-all cursor-pointer ${
                                        (custom.layout || 'timeline') === l.id
                                            ? 'border-golden-500 bg-golden-500/10 text-golden-700 dark:text-golden-300 shadow-xs'
                                            : 'border-soft-cream-300 dark:border-navy-700 text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-100 dark:hover:bg-navy-800'
                                    }`}
                                >
                                    <l.icon className="w-4 h-4" />
                                    <span>{l.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-2 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-golden-500" />
                            <span>Section Font Styling</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'sans', label: 'Modern Sans' },
                                { id: 'serif', label: 'Classic Serif' },
                                { id: 'mono', label: 'Tech Mono' },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => updateField('custom_section.font_family', f.id)}
                                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                                        (custom.font_family || 'sans') === f.id
                                            ? 'border-golden-500 bg-golden-500/10 text-golden-700 dark:text-golden-300 shadow-xs'
                                            : 'border-soft-cream-300 dark:border-navy-700 text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-100 dark:hover:bg-navy-800'
                                    }`}
                                >
                                    <span>{f.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-navy-800 dark:text-soft-cream-200">
                            Content Items & Cards ({blocks.length})
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                            Add, arrange, and edit each item in this custom section.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddBlock}
                        className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs bg-gradient-to-r from-amber-500 via-golden-500 to-amber-600 hover:from-amber-600 hover:to-golden-700 text-white font-bold"
                    >
                        <Plus className="w-4 h-4" /> Add Item / Block
                    </button>
                </div>

                {blocks.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-soft-cream-300 dark:border-navy-700 rounded-3xl space-y-3">
                        <Sparkles className="w-8 h-8 text-golden-500 mx-auto opacity-70" />
                        <p className="text-navy-600 dark:text-soft-cream-300 text-sm font-semibold">
                            No content items added to this custom section yet.
                        </p>
                        <p className="text-navy-400 dark:text-soft-cream-400 text-xs max-w-sm mx-auto">
                            Choose a Quick Start template above, or click below to build your first item.
                        </p>
                        <button
                            type="button"
                            onClick={handleAddBlock}
                            className="btn-primary py-2 px-5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Add First Item
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {blocks.map((block, idx) => (
                            <div
                                key={block.id || idx}
                                className="p-5 rounded-3xl glass border border-soft-cream-300 dark:border-navy-700 space-y-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-2 pb-3 border-b border-soft-cream-200/80 dark:border-navy-800/80">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="w-6 h-6 rounded-lg bg-golden-500/10 text-golden-700 dark:text-golden-400 text-xs font-bold flex items-center justify-center shrink-0">
                                            #{idx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={block.title || ''}
                                            onChange={(e) => handleUpdateBlock(idx, 'title', e.target.value)}
                                            placeholder="Item Title (e.g. Role, Publication, Offering)"
                                            className="font-bold text-base bg-transparent border-b border-dashed border-navy-300 dark:border-navy-600 focus:outline-none focus:border-navy-600 text-navy-800 dark:text-soft-cream-100 flex-1 min-w-0"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveBlock(idx, -1)}
                                            disabled={idx === 0}
                                            className="p-1.5 text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-200 dark:hover:bg-navy-700 rounded-md disabled:opacity-30 cursor-pointer"
                                            title="Move Up"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveBlock(idx, 1)}
                                            disabled={idx === blocks.length - 1}
                                            className="p-1.5 text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-200 dark:hover:bg-navy-700 rounded-md disabled:opacity-30 cursor-pointer"
                                            title="Move Down"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBlock(idx)}
                                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md cursor-pointer"
                                            title="Remove Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Subtitle / Organization / Role
                                        </label>
                                        <input
                                            type="text"
                                            value={block.subtitle || ''}
                                            onChange={(e) => handleUpdateBlock(idx, 'subtitle', e.target.value)}
                                            placeholder="e.g. Acme Corp • Engineering Department"
                                            className="input py-2 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Date Badge / Period
                                        </label>
                                        <input
                                            type="text"
                                            value={block.date_badge || ''}
                                            onChange={(e) => handleUpdateBlock(idx, 'date_badge', e.target.value)}
                                            placeholder="e.g. 2024 - Present, Summer 2024"
                                            className="input py-2 text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                        Description & Key Highlights
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={block.description || ''}
                                        onChange={(e) => handleUpdateBlock(idx, 'description', e.target.value)}
                                        placeholder="Detailed explanation, impact, achievements, or deliverables..."
                                        className="input py-2 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                        Tags / Technologies / Skills (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={Array.isArray(block.tags) ? block.tags.join(', ') : ''}
                                        onChange={(e) => {
                                            const tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                            handleUpdateBlock(idx, 'tags', tags);
                                        }}
                                        placeholder="e.g. React, Python, Cloud Architecture, Leadership"
                                        className="input py-2 text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Action Link URL
                                        </label>
                                        <input
                                            type="text"
                                            value={block.link_url || ''}
                                            onChange={(e) => handleUpdateBlock(idx, 'link_url', e.target.value)}
                                            placeholder="https://example.com or #contact"
                                            className="input py-2 text-xs font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Button Text
                                        </label>
                                        <input
                                            type="text"
                                            value={block.link_text || ''}
                                            onChange={(e) => handleUpdateBlock(idx, 'link_text', e.target.value)}
                                            placeholder="e.g. View Project, Read Paper, Hire Me"
                                            className="input py-2 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-soft-cream-200 dark:border-navy-700/60">
                                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                                        {block.image_url ? (
                                            <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-navy-300 dark:border-navy-700 shrink-0">
                                                <img src={block.image_url} alt="media" className="w-full h-full object-cover" />
                                            </div>
                                        ) : null}
                                        <input
                                            type="text"
                                            value={block.image_url || ''}
                                            onChange={(e) => handleUpdateBlock(idx, 'image_url', e.target.value)}
                                            placeholder="Optional Image / Screenshot URL"
                                            className="input py-1.5 px-3 text-xs flex-1 font-mono"
                                        />
                                        <input
                                            ref={(el) => fileInputRefs.current[idx] = el}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleUploadImage(e, idx, block.id)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                            disabled={uploadingId === block.id}
                                            className="p-2 text-navy-700 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-700 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                                            title="Upload image file"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>{uploadingId === block.id ? 'Uploading...' : 'Upload'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomPageTab;
