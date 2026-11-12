import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../../contexts/PortfolioContext';
import TechIcon from '../TechIcon';
import { Plus, Trash2, ArrowUp, ArrowDown, RotateCcw, X, Tag, AlertCircle, AlertTriangle } from 'lucide-react';

const CATEGORY_ICON_OPTIONS = [
    { label: 'Code / Programming', value: 'code' },
    { label: 'Server / Backend', value: 'server' },
    { label: 'Database / Storage', value: 'database' },
    { label: 'AI / Neural / CPU', value: 'cpu' },
    { label: 'Tools / Hardware', value: 'wrench' },
    { label: 'Award / Platform', value: 'award' },
    { label: 'Python', value: 'python' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'React', value: 'react' },
    { label: 'Docker', value: 'docker' },
];

export const deduplicateSkills = (skills = []) => {
    const seen = new Set();
    const result = [];
    for (const skill of skills) {
        if (!skill || typeof skill !== 'string') continue;
        const normalized = skill.trim().toLowerCase();
        if (!normalized) continue;
        if (!seen.has(normalized)) {
            seen.add(normalized);
            result.push(skill.trim());
        }
    }
    return result;
};

const SkillsTab = () => {
    const { portfolio, updateField, resetSection } = usePortfolio();
    const categories = portfolio.skills_categories || [];

    const [newSkillInput, setNewSkillInput] = useState({});
    const [duplicateError, setDuplicateError] = useState(null);
    const [duplicateModal, setDuplicateModal] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && duplicateModal) {
                setDuplicateModal(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [duplicateModal]);

    const handleAddCategory = () => {
        const newCat = {
            id: `cat-${Date.now()}`,
            title: 'New Skill Category',
            icon: 'code',
            skills: []
        };
        updateField('skills_categories', [...categories, newCat]);
    };

    const handleUpdateCategory = (index, field, value) => {
        const copy = [...categories];
        const val = field === 'skills' ? deduplicateSkills(value) : value;
        copy[index] = { ...copy[index], [field]: val };
        updateField('skills_categories', copy);
    };

    const handleRemoveCategory = (index) => {
        updateField('skills_categories', categories.filter((_, i) => i !== index));
        if (duplicateError && duplicateError.catIndex === index) {
            setDuplicateError(null);
        }
    };

    const handleMoveCategory = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= categories.length) return;
        const copy = [...categories];
        const [moved] = copy.splice(index, 1);
        copy.splice(targetIndex, 0, moved);
        updateField('skills_categories', copy);
    };

    const handleAddSkill = (catIndex) => {
        const rawText = (newSkillInput[catIndex] || '').trim();
        if (!rawText) return;

        const normalizedInput = rawText.toLowerCase();
        const cat = categories[catIndex];
        const currentSkills = deduplicateSkills(cat?.skills || []);

        const sameSectionMatch = currentSkills.find(
            s => s.trim().toLowerCase() === normalizedInput
        );

        if (sameSectionMatch) {
            setDuplicateError({
                catIndex,
                message: `"${sameSectionMatch}" is already in this section! Duplicates in the same section are not allowed.`
            });
            setTimeout(() => {
                setDuplicateError(prev => (prev?.catIndex === catIndex ? null : prev));
            }, 4000);
            return;
        }

        const matchingOtherCats = [];
        categories.forEach((otherCat, otherIdx) => {
            if (otherIdx !== catIndex) {
                const match = (otherCat.skills || []).find(
                    s => s.trim().toLowerCase() === normalizedInput
                );
                if (match) {
                    matchingOtherCats.push({
                        catIndex: otherIdx,
                        catTitle: otherCat.title || `Category ${otherIdx + 1}`,
                        skillName: match
                    });
                }
            }
        });

        if (matchingOtherCats.length > 0) {
            setDuplicateModal({
                catIndex,
                skillToAdd: rawText,
                existingSections: matchingOtherCats.map(m => m.catTitle),
                existingSkillName: matchingOtherCats[0].skillName,
                targetSectionTitle: cat.title || `Category ${catIndex + 1}`
            });
            return;
        }

        executeAddSkill(catIndex, rawText);
    };

    const executeAddSkill = (catIndex, skillText) => {
        const cat = categories[catIndex];
        const currentSkills = deduplicateSkills(cat?.skills || []);
        handleUpdateCategory(catIndex, 'skills', [...currentSkills, skillText]);
        setNewSkillInput(prev => ({ ...prev, [catIndex]: '' }));
        setDuplicateError(null);
    };

    const handleConfirmDuplicate = () => {
        if (!duplicateModal) return;
        executeAddSkill(duplicateModal.catIndex, duplicateModal.skillToAdd);
        setDuplicateModal(null);
    };

    const handleCancelDuplicate = () => {
        setDuplicateModal(null);
    };

    const handleRemoveSkill = (catIndex, skillToRemove) => {
        const cat = categories[catIndex];
        const currentSkills = deduplicateSkills(cat?.skills || []);
        const updated = currentSkills.filter(
            s => s.trim().toLowerCase() !== skillToRemove.trim().toLowerCase()
        );
        handleUpdateCategory(catIndex, 'skills', updated);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-soft-cream-200 dark:border-navy-700">
                <div>
                    <h2 className="text-2xl font-bold text-navy-800 dark:text-soft-cream-100">
                        Dynamic Skills Category Builder
                    </h2>
                    <p className="text-sm text-navy-500 dark:text-soft-cream-400">
                        Create custom skill categories, add technologies, and automatically display recognizable logos.
                    </p>
                </div>
                <button
                    onClick={() => resetSection('skills')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-600 dark:text-soft-cream-300 bg-soft-cream-200 dark:bg-navy-700 hover:bg-soft-cream-300 dark:hover:bg-navy-600 transition-colors cursor-pointer"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Section
                </button>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy-800 dark:text-soft-cream-200">
                        Skill Categories ({categories.length})
                    </h3>
                    <button
                        type="button"
                        onClick={handleAddCategory}
                        className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add New Category
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-soft-cream-300 dark:border-navy-700 rounded-2xl">
                        <p className="text-navy-500 dark:text-soft-cream-400 text-sm mb-3">
                            No skill categories yet. Add your first category!
                        </p>
                        <button
                            onClick={handleAddCategory}
                            className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Add Category
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {categories.map((category, idx) => {
                            const cleanedSkills = deduplicateSkills(category.skills || []);

                            return (
                                <div
                                    key={category.id || idx}
                                    className="p-5 rounded-2xl glass border border-soft-cream-300 dark:border-navy-700 space-y-4 shadow-sm"
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-soft-cream-200 dark:bg-navy-700 flex items-center justify-center text-navy-700 dark:text-soft-cream-200 shrink-0">
                                                <TechIcon name={category.icon || category.title} className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={category.title}
                                                onChange={(e) => handleUpdateCategory(idx, 'title', e.target.value)}
                                                className="font-bold text-base bg-transparent border-b border-dashed border-navy-300 dark:border-navy-600 focus:outline-none focus:border-navy-600 text-navy-800 dark:text-soft-cream-100 flex-1"
                                                placeholder="Category Name"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                            <select
                                                value={category.icon || 'code'}
                                                onChange={(e) => handleUpdateCategory(idx, 'icon', e.target.value)}
                                                className="input py-1.5 px-3 text-xs w-36 cursor-pointer"
                                            >
                                                {CATEGORY_ICON_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => handleMoveCategory(idx, -1)}
                                                disabled={idx === 0}
                                                className="p-1.5 text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-200 dark:hover:bg-navy-700 rounded-md disabled:opacity-30 cursor-pointer"
                                                title="Move Up"
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMoveCategory(idx, 1)}
                                                disabled={idx === categories.length - 1}
                                                className="p-1.5 text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-200 dark:hover:bg-navy-700 rounded-md disabled:opacity-30 cursor-pointer"
                                                title="Move Down"
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCategory(idx)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md cursor-pointer"
                                                title="Delete Category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex flex-wrap gap-2 min-h-8">
                                            {cleanedSkills.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="tag inline-flex items-center gap-1.5 py-1 px-3 bg-white dark:bg-navy-800 border border-soft-cream-300 dark:border-navy-600 shadow-xs"
                                                >
                                                    <TechIcon name={skill} className="w-3.5 h-3.5 text-navy-700 dark:text-soft-cream-200" />
                                                    <span className="text-xs font-medium text-navy-800 dark:text-soft-cream-100">{skill}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(idx, skill)}
                                                        className="text-navy-400 hover:text-red-500 ml-1 cursor-pointer"
                                                        title={`Remove ${skill}`}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}

                                            {cleanedSkills.length === 0 && (
                                                <span className="text-xs text-navy-400 dark:text-soft-cream-400 italic py-1">
                                                    No skills added yet in this category.
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-navy-400" />
                                                    <input
                                                        type="text"
                                                        value={newSkillInput[idx] || ''}
                                                        onChange={(e) => {
                                                            setNewSkillInput({ ...newSkillInput, [idx]: e.target.value });
                                                            if (duplicateError && duplicateError.catIndex === idx) {
                                                                setDuplicateError(null);
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddSkill(idx);
                                                            }
                                                        }}
                                                        placeholder="Type a technology (e.g. Docker, Python, HTML) and press Enter"
                                                        className="input pl-8 py-1.5 text-xs"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddSkill(idx)}
                                                    className="btn-secondary py-1.5 px-4 text-xs font-semibold shrink-0 cursor-pointer"
                                                >
                                                    Add Skill
                                                </button>
                                            </div>

                                            {duplicateError && duplicateError.catIndex === idx && (
                                                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-medium animate-fade-in">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{duplicateError.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {duplicateModal && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleCancelDuplicate();
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="duplicate-modal-title"
                        className="glass max-w-md w-full p-6 rounded-3xl border border-soft-cream-300 dark:border-navy-700 shadow-2xl space-y-4 bg-white/95 dark:bg-navy-900/95 animate-scale-up"
                    >
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <h3 id="duplicate-modal-title" className="text-base font-bold text-navy-900 dark:text-soft-cream-100">
                                    Duplicate Skill Detected
                                </h3>
                                <p className="text-xs text-navy-600 dark:text-soft-cream-300 leading-relaxed">
                                    The skill <span className="font-bold text-navy-900 dark:text-soft-cream-100">"{duplicateModal.skillToAdd}"</span> is already in the <span className="font-bold text-golden-600 dark:text-golden-400">"{duplicateModal.existingSections.join(', ')}"</span> section.
                                </p>
                                <p className="text-xs text-navy-500 dark:text-soft-cream-400 leading-relaxed">
                                    Do you still want to add it to <span className="font-semibold text-navy-800 dark:text-soft-cream-200">"{duplicateModal.targetSectionTitle}"</span>?
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-soft-cream-200 dark:border-navy-800">
                            <button
                                type="button"
                                onClick={handleCancelDuplicate}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-navy-700 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                            >
                                No, Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDuplicate}
                                className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md bg-gradient-to-r from-amber-500 to-golden-600 hover:from-amber-600 hover:to-golden-700 text-white"
                            >
                                Yes, Continue & Add
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SkillsTab;
