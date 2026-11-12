import React, { useRef } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { RotateCcw, Plus, Trash2, GraduationCap, Info, Bold, Italic, Award } from 'lucide-react';
import FormattedText from '../FormattedText';

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

const AboutTab = () => {
    const { portfolio, updateField, resetSection } = usePortfolio();
    const educationList = portfolio.education || [];
    const highlights = portfolio.about_highlights || DEFAULT_HIGHLIGHTS;
    const bioTextareaRef = useRef(null);

    const handleAddEducation = () => {
        const newEdu = {
            degree: 'Degree / Program Name',
            institution: 'University / Institution',
            period: `${new Date().getFullYear()} - Present`,
            details: 'Specialization or notable achievements.'
        };
        updateField('education', [...educationList, newEdu]);
    };

    const handleUpdateEducation = (index, field, value) => {
        const copy = [...educationList];
        copy[index] = { ...copy[index], [field]: value };
        updateField('education', copy);
    };

    const handleRemoveEducation = (index) => {
        updateField('education', educationList.filter((_, i) => i !== index));
    };

    const handleUpdateHighlight = (index, field, value) => {
        const copy = [...highlights];
        copy[index] = { ...copy[index], [field]: value };
        updateField('about_highlights', copy);
    };

    const handleAddHighlight = () => {
        const newH = {
            stat: '100+',
            label: 'New Achievement',
            sub: 'Brief accomplishment description',
            icon: '⭐'
        };
        updateField('about_highlights', [...highlights, newH]);
    };

    const handleRemoveHighlight = (index) => {
        updateField('about_highlights', highlights.filter((_, i) => i !== index));
    };

    const insertFormatting = (prefix, suffix = '') => {
        const textarea = bioTextareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = portfolio.detailed_bio || '';
        const selected = text.substring(start, end);
        const replacement = `${prefix}${selected || 'text'}${suffix}`;
        const newText = text.substring(0, start) + replacement + text.substring(end);
        updateField('detailed_bio', newText);
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
                        About & Education
                    </h2>
                    <p className="text-sm text-navy-500 dark:text-soft-cream-400">
                        Craft your story, quote, highlights, and academic background.
                    </p>
                </div>
                <button
                    onClick={() => resetSection('about')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-600 dark:text-soft-cream-300 bg-soft-cream-200 dark:bg-navy-700 hover:bg-soft-cream-300 dark:hover:bg-navy-600 transition-colors cursor-pointer"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Section
                </button>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-navy-700 dark:text-soft-cream-300">
                    Featured Motto / Quote
                </label>
                <input
                    type="text"
                    value={portfolio.quote ?? '"I build things, break things, and trace things."'}
                    onChange={(e) => updateField('quote', e.target.value)}
                    className="input font-mono text-sm"
                    placeholder='"Your favorite inspiring quote"'
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-navy-700 dark:text-soft-cream-300">
                        Detailed Biography
                    </label>
                    <span className="text-xs text-navy-500 dark:text-soft-cream-400">
                        Supports multiple paragraphs, bold (**text**), and italic (*text*)
                    </span>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 rounded-t-xl bg-soft-cream-200 dark:bg-navy-800 border-t border-l border-r border-soft-cream-300 dark:border-navy-700">
                    <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="p-1.5 rounded-lg hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-xs font-bold text-navy-800 dark:text-soft-cream-200 inline-flex items-center gap-1 cursor-pointer"
                        title="Bold Text"
                    >
                        <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="p-1.5 rounded-lg hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-xs italic text-navy-800 dark:text-soft-cream-200 inline-flex items-center gap-1 cursor-pointer"
                        title="Italic Text"
                    >
                        <Italic className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-navy-300 dark:bg-navy-700 mx-1" />
                    <button
                        type="button"
                        onClick={() => insertFormatting('\n')}
                        className="px-2 py-1 rounded-lg hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-[11px] text-navy-700 dark:text-soft-cream-300 cursor-pointer"
                        title="Insert Line Break"
                    >
                        New Line
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('\n\n')}
                        className="px-2 py-1 rounded-lg hover:bg-soft-cream-300 dark:hover:bg-navy-700 text-[11px] text-navy-700 dark:text-soft-cream-300 cursor-pointer"
                        title="Insert Paragraph Separation"
                    >
                        New Paragraph
                    </button>
                </div>

                <textarea
                    ref={bioTextareaRef}
                    rows={8}
                    value={portfolio.detailed_bio || ''}
                    onChange={(e) => updateField('detailed_bio', e.target.value)}
                    className="input rounded-t-none leading-relaxed font-sans"
                    placeholder="Write anything about yourself here. Press Enter twice for a new paragraph."
                />

                {portfolio.detailed_bio && (
                    <div className="p-4 rounded-xl bg-soft-cream-50 dark:bg-navy-950/40 border border-soft-cream-200 dark:border-navy-800 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
                            <Info className="w-3.5 h-3.5" />
                            <span>Live Render Preview:</span>
                        </div>
                        <div className="text-sm text-navy-700 dark:text-soft-cream-300">
                            <FormattedText text={portfolio.detailed_bio} />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-4 border-t border-soft-cream-200 dark:border-navy-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2">
                            <Award className="w-5 h-5" /> Key Highlights & Metrics ({highlights.length})
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                            Four prominent badge cards shown in the About section.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="btn-secondary py-2 px-3 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Metric
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {highlights.map((h, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-xl glass border border-soft-cream-300 dark:border-navy-700 space-y-2 relative"
                        >
                            <button
                                type="button"
                                onClick={() => handleRemoveHighlight(idx)}
                                className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md cursor-pointer"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[10px] font-semibold text-navy-600 dark:text-soft-cream-400 mb-0.5">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        value={h.icon || '🏆'}
                                        onChange={(e) => handleUpdateHighlight(idx, 'icon', e.target.value)}
                                        className="input py-1 text-xs text-center"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-semibold text-navy-600 dark:text-soft-cream-400 mb-0.5">
                                        Metric Stat
                                    </label>
                                    <input
                                        type="text"
                                        value={h.stat || ''}
                                        onChange={(e) => handleUpdateHighlight(idx, 'stat', e.target.value)}
                                        className="input py-1 text-xs font-mono font-bold"
                                        placeholder="e.g. Top 3"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-navy-600 dark:text-soft-cream-400 mb-0.5">
                                    Label
                                </label>
                                <input
                                    type="text"
                                    value={h.label || ''}
                                    onChange={(e) => handleUpdateHighlight(idx, 'label', e.target.value)}
                                    className="input py-1 text-xs font-semibold"
                                    placeholder="e.g. UK OSINT Community"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-navy-600 dark:text-soft-cream-400 mb-0.5">
                                    Subtext
                                </label>
                                <input
                                    type="text"
                                    value={h.sub || ''}
                                    onChange={(e) => handleUpdateHighlight(idx, 'sub', e.target.value)}
                                    className="input py-1 text-xs"
                                    placeholder="e.g. out of 2,000+ participants"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-soft-cream-200 dark:border-navy-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-navy-800 dark:text-soft-cream-100 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" /> Education & Academic Background
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                            Add your degrees, certifications, or educational milestones.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddEducation}
                        className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Education
                    </button>
                </div>

                {educationList.length === 0 ? (
                    <p className="text-sm text-navy-400 py-4 text-center">No education records added.</p>
                ) : (
                    <div className="space-y-4">
                        {educationList.map((edu, idx) => (
                            <div
                                key={idx}
                                className="p-5 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 space-y-3 relative"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleRemoveEducation(idx)}
                                    className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md cursor-pointer"
                                    title="Delete Entry"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Degree / Program
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.degree || ''}
                                            onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                                            className="input py-2 text-xs"
                                            placeholder="e.g. BS in Data Science"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Institution / University
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.institution || ''}
                                            onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                                            className="input py-2 text-xs"
                                            placeholder="e.g. University of Technology"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Year / Period
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.period || ''}
                                            onChange={(e) => handleUpdateEducation(idx, 'period', e.target.value)}
                                            className="input py-2 text-xs"
                                            placeholder="e.g. 2023 - Present"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            Specialization / Details
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.details || ''}
                                            onChange={(e) => handleUpdateEducation(idx, 'details', e.target.value)}
                                            className="input py-2 text-xs"
                                            placeholder="e.g. Specializing in AI, Machine Learning, and Big Data"
                                        />
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

export default AboutTab;
