import React, { useState, useRef, useMemo } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { githubAPI, portfolioAPI } from '../../services/api';
import TechIcon from '../TechIcon';
import {
    Search, Plus, Trash2, ArrowUp, ArrowDown,
    ExternalLink, Upload, Star, GitFork, Check, RefreshCw, RotateCcw,
    ChevronDown, CheckSquare, Square, Sparkles, Eye, EyeOff
} from 'lucide-react';

const ProjectsTab = () => {
    const { portfolio, updateField, resetSection } = usePortfolio();
    const currentProjects = portfolio.projects || [];

    const [githubInput, setGithubInput] = useState(
        portfolio.social_links?.github
            ? githubAPI.extractUsername(portfolio.social_links.github)
            : ''
    );
    const [fetchingRepos, setFetchingRepos] = useState(false);
    const [fetchedRepos, setFetchedRepos] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const [selectedRepoMap, setSelectedRepoMap] = useState({});
    const [repoSearch, setRepoSearch] = useState('');
    const [repoLangFilter, setRepoLangFilter] = useState('all');
    const [showDropdown, setShowDropdown] = useState(false);
    const [importSuccessMsg, setImportSuccessMsg] = useState(null);

    const [uploadingProjId, setUploadingProjId] = useState(null);
    const fileInputRefs = useRef({});

    const handleFetchRepos = async () => {
        if (!githubInput.trim()) {
            setFetchError('Please enter a GitHub username or profile URL.');
            return;
        }

        setFetchingRepos(true);
        setFetchError(null);
        try {
            const repos = await githubAPI.fetchUserRepos(githubInput);
            setFetchedRepos(repos);
            const initialMap = {};
            const existingUrls = new Set(currentProjects.map(p => (p.github_url || '').toLowerCase().trim()));
            repos.forEach(r => {
                const rUrl = (r.github_url || '').toLowerCase().trim();
                if (!rUrl || !existingUrls.has(rUrl)) {
                    initialMap[r.id] = true;
                }
            });
            setSelectedRepoMap(initialMap);
            setShowDropdown(true);
        } catch (err) {
            setFetchError(err.message || 'Failed to fetch GitHub repositories.');
        } finally {
            setFetchingRepos(false);
        }
    };

    const handleAddSelectedRepos = () => {
        const toAdd = fetchedRepos.filter(r => selectedRepoMap[r.id]);
        if (toAdd.length === 0) {
            setShowDropdown(false);
            return;
        }

        const existingUrls = new Set(currentProjects.map(p => (p.github_url || '').toLowerCase().trim()));
        const uniqueToAdd = toAdd.filter(r => {
            const rUrl = (r.github_url || '').toLowerCase().trim();
            return !rUrl || !existingUrls.has(rUrl);
        });

        const itemsToAppend = uniqueToAdd.length > 0 ? uniqueToAdd : toAdd;
        const updated = [...currentProjects, ...itemsToAppend];
        updateField('projects', updated);
        setShowDropdown(false);
        setImportSuccessMsg(`Successfully imported ${itemsToAppend.length} repositor${itemsToAppend.length === 1 ? 'y' : 'ies'} into your portfolio!`);
        setTimeout(() => setImportSuccessMsg(null), 5000);
    };

    const handleAddManualProject = () => {
        const newProj = {
            id: `manual-${Date.now()}`,
            title: 'New Project',
            description: 'A brief description of what this project does and the technologies used.',
            technologies: ['React', 'Node.js', 'Tailwind CSS'],
            image_url: '',
            project_url: '',
            github_url: '',
            featured: false,
            is_live: false,
            order: currentProjects.length + 1,
            source: 'manual',
        };
        updateField('projects', [...currentProjects, newProj]);
    };

    const handleUpdateProject = (index, field, value) => {
        const copy = [...currentProjects];
        copy[index] = { ...copy[index], [field]: value };
        updateField('projects', copy);
    };

    const handleRemoveProject = (index) => {
        updateField('projects', currentProjects.filter((_, i) => i !== index));
    };

    const handleMoveProject = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= currentProjects.length) return;
        const copy = [...currentProjects];
        const [moved] = copy.splice(index, 1);
        copy.splice(targetIndex, 0, moved);
        updateField('projects', copy);
    };

    const handleProjectImageUpload = async (e, index, projectId) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingProjId(projectId);
        try {
            const res = await portfolioAPI.uploadFile(file);
            const serverUrl = res.data.url;
            const fullUrl = serverUrl.startsWith('http') ? serverUrl : `http://localhost:8000${serverUrl}`;
            handleUpdateProject(index, 'image_url', fullUrl);
        } catch (err) {
            console.error('Project image upload failed:', err);
            alert('Failed to upload image. Please try another file.');
        } finally {
            setUploadingProjId(null);
        }
    };

    const availableLangs = useMemo(() => {
        return Array.from(
            new Set(fetchedRepos.map(r => r.technologies?.[0]).filter(Boolean))
        );
    }, [fetchedRepos]);

    const filteredFetchedRepos = useMemo(() => {
        return fetchedRepos.filter(r => {
            const matchesSearch = !repoSearch.trim() ||
                (r.title && r.title.toLowerCase().includes(repoSearch.toLowerCase())) ||
                (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase()));
            const matchesLang = repoLangFilter === 'all' || r.technologies?.includes(repoLangFilter);
            return matchesSearch && matchesLang;
        });
    }, [fetchedRepos, repoSearch, repoLangFilter]);

    const isAllSelected = filteredFetchedRepos.length > 0 &&
        filteredFetchedRepos.every(r => selectedRepoMap[r.id]);

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            const newMap = { ...selectedRepoMap };
            filteredFetchedRepos.forEach(r => delete newMap[r.id]);
            setSelectedRepoMap(newMap);
        } else {
            const newMap = { ...selectedRepoMap };
            filteredFetchedRepos.forEach(r => {
                newMap[r.id] = true;
            });
            setSelectedRepoMap(newMap);
        }
    };

    const selectedCount = Object.values(selectedRepoMap).filter(Boolean).length;

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soft-cream-200 dark:border-navy-700">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-navy-800 dark:text-soft-cream-100">
                            Projects & GitHub Integration
                        </h2>
                        <button
                            type="button"
                            onClick={() => updateField('sections_visibility.projects', portfolio.sections_visibility?.projects === false ? true : false)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                portfolio.sections_visibility?.projects !== false
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                            title="Toggle whether Projects is visible in your public portfolio"
                        >
                            {portfolio.sections_visibility?.projects !== false ? (
                                <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Section Visible</span>
                                </>
                            ) : (
                                <>
                                    <EyeOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                    <span>Section Hidden</span>
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-navy-500 dark:text-soft-cream-400 mt-1">
                        Automatically import public projects from GitHub or add custom showcase cards. Beginners with no projects can easily deselect/hide this section.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => updateField('sections_visibility.projects', portfolio.sections_visibility?.projects === false ? true : false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                            portfolio.sections_visibility?.projects !== false
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                        }`}
                    >
                        {portfolio.sections_visibility?.projects !== false ? (
                            <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide Section</span>
                            </>
                        ) : (
                            <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Show Section</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => resetSection('projects')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-600 dark:text-soft-cream-300 bg-soft-cream-200 dark:bg-navy-700 hover:bg-soft-cream-300 dark:hover:bg-navy-600 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                </div>
            </div>

            {portfolio.sections_visibility?.projects === false && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-xl bg-amber-200/70 dark:bg-amber-900/50">
                            <EyeOff className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        </span>
                        <div>
                            <span className="font-bold">Projects section is currently hidden from your live portfolio.</span>
                            <span className="block text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                                Perfect for beginners starting out. Your navbar link and scroll section are omitted from the public site. Click "Show Section" anytime when ready.
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => updateField('sections_visibility.projects', true)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shrink-0 cursor-pointer transition-colors shadow-xs"
                    >
                        Enable Section
                    </button>
                </div>
            )}

            {importSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center justify-between animate-slide-down shadow-sm">
                    <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{importSuccessMsg}</span>
                    </span>
                    <button onClick={() => setImportSuccessMsg(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
                        ✕
                    </button>
                </div>
            )}

            <div className="p-5 sm:p-6 rounded-3xl glass border border-golden-500/30 dark:border-golden-500/20 shadow-md bg-gradient-to-br from-soft-cream-100/70 via-white/50 to-golden-50/30 dark:from-navy-950/80 dark:via-navy-900/60 dark:to-golden-950/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-navy-800 text-white shadow-sm shrink-0">
                            <TechIcon name="github" className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-navy-900 dark:text-soft-cream-100 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-golden-500" />
                                <span>Sync & Auto-Fetch from GitHub</span>
                            </h3>
                            <p className="text-xs text-navy-500 dark:text-soft-cream-400 mt-0.5">
                                Enter your GitHub username or profile link to fetch public repositories. Select and check mark the ones you want.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (!showDropdown && fetchedRepos.length === 0) {
                                handleFetchRepos();
                            } else {
                                setShowDropdown(!showDropdown);
                            }
                        }}
                        className="text-xs font-semibold text-golden-700 dark:text-golden-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                        <span>{showDropdown ? 'Close Dropdown' : 'Open Dropdown Picker'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={githubInput}
                            onChange={(e) => setGithubInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFetchRepos()}
                            placeholder="e.g. username or https://github.com/username"
                            className="input py-2.5 pl-9 text-xs sm:text-sm font-mono shadow-xs"
                        />
                        <Search className="w-4 h-4 text-golden-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <button
                        type="button"
                        onClick={handleFetchRepos}
                        disabled={fetchingRepos}
                        className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-golden-500 to-amber-600 hover:from-amber-600 hover:to-golden-700 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                        {fetchingRepos ? (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Fetching Repositories...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Fetch GitHub Repos</span>
                            </>
                        )}
                    </button>
                </div>

                {fetchError && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-xs">
                        {fetchError}
                    </div>
                )}

                {showDropdown && (
                    <div className="mt-4 pt-4 border-t border-soft-cream-200 dark:border-navy-800 space-y-4 animate-slide-down">
                        <div className="flex flex-col sm:flex-row gap-2.5 bg-white/70 dark:bg-navy-950/70 p-3 rounded-2xl border border-soft-cream-300 dark:border-navy-800">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                                <input
                                    type="text"
                                    value={repoSearch}
                                    onChange={(e) => setRepoSearch(e.target.value)}
                                    placeholder="Filter by repository name or description..."
                                    className="input pl-9 py-2 text-xs"
                                />
                            </div>

                            {availableLangs.length > 0 && (
                                <select
                                    value={repoLangFilter}
                                    onChange={(e) => setRepoLangFilter(e.target.value)}
                                    className="input py-2 px-3 text-xs w-full sm:w-40 font-medium cursor-pointer"
                                >
                                    <option value="all">All Languages</option>
                                    {availableLangs.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            )}

                            <button
                                type="button"
                                onClick={handleToggleSelectAll}
                                className="px-3 py-1.5 text-xs rounded-xl bg-soft-cream-200 dark:bg-navy-800 text-navy-700 dark:text-soft-cream-300 font-semibold inline-flex items-center gap-1.5 hover:bg-soft-cream-300 dark:hover:bg-navy-700 transition-colors shrink-0 cursor-pointer"
                            >
                                {isAllSelected ? (
                                    <>
                                        <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Deselect All</span>
                                    </>
                                ) : (
                                    <>
                                        <Square className="w-3.5 h-3.5 text-navy-400" />
                                        <span>Select All ({filteredFetchedRepos.length})</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                            {filteredFetchedRepos.length === 0 ? (
                                <div className="text-center py-8 text-xs text-navy-500 dark:text-soft-cream-400">
                                    {fetchedRepos.length === 0
                                        ? 'No repositories loaded yet. Click "Fetch GitHub Repos" above to load your public repositories.'
                                        : 'No repositories match your search or filter.'}
                                </div>
                            ) : (
                                filteredFetchedRepos.map(repo => {
                                    const isSelected = Boolean(selectedRepoMap[repo.id]);
                                    return (
                                        <div
                                            key={repo.id}
                                            onClick={() => setSelectedRepoMap(prev => ({ ...prev, [repo.id]: !prev[repo.id] }))}
                                            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${isSelected
                                                ? 'border-amber-500/80 bg-amber-50/60 dark:bg-navy-800/90 dark:border-amber-400/80 shadow-xs'
                                                : 'border-soft-cream-200 dark:border-navy-800/80 hover:bg-soft-cream-50 dark:hover:bg-navy-800/40'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }}
                                                className="mt-1 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <h4 className="text-sm font-bold text-navy-900 dark:text-soft-cream-100 truncate">
                                                            {repo.title}
                                                        </h4>
                                                        {repo.github_url && (
                                                            <a
                                                                href={repo.github_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-navy-400 hover:text-navy-700 dark:hover:text-soft-cream-200"
                                                                title="View on GitHub"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-xs text-navy-500 shrink-0">
                                                        {repo.stars > 0 && (
                                                            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                                                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {repo.stars}
                                                            </span>
                                                        )}
                                                        {repo.forks > 0 && (
                                                            <span className="flex items-center gap-0.5 text-navy-500 dark:text-soft-cream-400">
                                                                <GitFork className="w-3.5 h-3.5" /> {repo.forks}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    {repo.project_url ? (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold inline-flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            <span className="truncate max-w-[220px]">Live: {repo.project_url.replace(/^https?:\/\//, '')}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-soft-cream-200/70 dark:bg-navy-800 text-navy-500 dark:text-soft-cream-400 font-medium">
                                                            No Live Demo
                                                        </span>
                                                    )}

                                                    {repo.image_url ? (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold inline-flex items-center gap-1">
                                                            <span>📷 Screenshot Attached</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-soft-cream-200/70 dark:bg-navy-800 text-navy-500 dark:text-soft-cream-400 font-medium">
                                                            No Screenshot (Custom)
                                                        </span>
                                                    )}
                                                </div>

                                                {repo.description && (
                                                    <p className="text-xs text-navy-600 dark:text-soft-cream-400 line-clamp-2 mt-1">
                                                        {repo.description}
                                                    </p>
                                                )}
                                                {Array.isArray(repo.technologies) && repo.technologies.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {repo.technologies.map((tech, i) => (
                                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-soft-cream-200/90 dark:bg-navy-800 text-navy-700 dark:text-soft-cream-300 font-mono">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="pt-3 border-t border-soft-cream-200 dark:border-navy-800 flex flex-wrap justify-between items-center gap-2">
                            <span className="text-xs font-semibold text-navy-600 dark:text-soft-cream-400">
                                {selectedCount} repositor{selectedCount === 1 ? 'y' : 'ies'} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDropdown(false)}
                                    className="px-3.5 py-1.5 text-xs rounded-xl font-medium text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-200 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddSelectedRepos}
                                    disabled={selectedCount === 0}
                                    className="btn-primary py-2 px-5 text-xs font-bold inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-golden-500 to-amber-600 hover:from-amber-600 hover:to-golden-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Add to Portfolio ({selectedCount})</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-navy-800 dark:text-soft-cream-200">
                            Selected Projects ({currentProjects.length})
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-soft-cream-400">
                            These projects appear in your 3D scroll runway showcase on the live portfolio.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddManualProject}
                        className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Add Project Manually
                    </button>
                </div>

                {currentProjects.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-soft-cream-300 dark:border-navy-700 rounded-3xl space-y-3">
                        <p className="text-navy-500 dark:text-soft-cream-400 text-sm font-semibold">
                            No projects added yet.
                        </p>
                        <p className="text-navy-400 dark:text-soft-cream-400 text-xs max-w-sm mx-auto">
                            Fetch your GitHub repositories using the tool above or add a custom project showcase manually.
                        </p>
                        <button
                            onClick={handleAddManualProject}
                            className="btn-primary py-2 px-5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Add First Project
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentProjects.map((project, idx) => (
                            <div
                                key={project.id || idx}
                                className="p-5 rounded-3xl glass border border-soft-cream-300 dark:border-navy-700 space-y-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-2 pb-3 border-b border-soft-cream-200/80 dark:border-navy-800/80">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="w-6 h-6 rounded-lg bg-golden-500/10 text-golden-700 dark:text-golden-400 text-xs font-bold flex items-center justify-center shrink-0">
                                            #{idx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={project.title || ''}
                                            onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                                            className="font-bold text-base bg-transparent border-b border-dashed border-navy-300 dark:border-navy-600 focus:outline-none focus:border-navy-600 text-navy-800 dark:text-soft-cream-100 flex-1 min-w-0"
                                            placeholder="Project Title"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveProject(idx, -1)}
                                            disabled={idx === 0}
                                            className="p-1.5 text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-200 dark:hover:bg-navy-700 rounded-md disabled:opacity-30 cursor-pointer"
                                            title="Move Up"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveProject(idx, 1)}
                                            disabled={idx === currentProjects.length - 1}
                                            className="p-1.5 text-navy-600 dark:text-soft-cream-400 hover:bg-soft-cream-200 dark:hover:bg-navy-700 rounded-md disabled:opacity-30 cursor-pointer"
                                            title="Move Down"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProject(idx)}
                                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md cursor-pointer"
                                            title="Remove Project"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={project.description || ''}
                                        onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                                        className="input py-2 text-xs"
                                        placeholder="Project description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                        Technologies / Tags (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={Array.isArray(project.technologies) ? project.technologies.join(', ') : ''}
                                        onChange={(e) => {
                                            const tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                            handleUpdateProject(idx, 'technologies', tags);
                                        }}
                                        className="input py-2 text-xs"
                                        placeholder="e.g. Python, Flask, Docker, REST APIs"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400 mb-1">
                                            GitHub Repository Link
                                        </label>
                                        <input
                                            type="text"
                                            value={project.github_url || ''}
                                            onChange={(e) => handleUpdateProject(idx, 'github_url', e.target.value)}
                                            className="input py-2 text-xs font-mono"
                                            placeholder="https://github.com/..."
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400">
                                                Live Demo / Project Link
                                            </label>
                                            {project.project_url && (
                                                <a
                                                    href={project.project_url.startsWith('http') ? project.project_url : `https://${project.project_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline flex items-center gap-1 font-mono font-medium cursor-pointer"
                                                    title="Test live demo link in new tab"
                                                >
                                                    <span>Test Link ↗</span>
                                                </a>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={project.project_url || ''}
                                            onChange={(e) => handleUpdateProject(idx, 'project_url', e.target.value)}
                                            onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                                                    handleUpdateProject(idx, 'project_url', `https://${val}`);
                                                }
                                            }}
                                            className="input py-2 text-xs font-mono"
                                            placeholder="https://my-app.example.com"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-soft-cream-200 dark:border-navy-700/60">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {project.image_url ? (
                                            <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-navy-300 dark:border-navy-700 shrink-0">
                                                <img src={project.image_url} alt="screenshot" className="w-full h-full object-cover" />
                                            </div>
                                        ) : null}
                                        <input
                                            type="text"
                                            value={project.image_url || ''}
                                            onChange={(e) => handleUpdateProject(idx, 'image_url', e.target.value)}
                                            placeholder="Screenshot URL"
                                            className="input py-1.5 px-3 text-xs flex-1 sm:w-48 font-mono"
                                        />
                                        <input
                                            ref={(el) => fileInputRefs.current[idx] = el}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleProjectImageUpload(e, idx, project.id)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                            disabled={uploadingProjId === project.id}
                                            className="p-2 text-navy-700 dark:text-soft-cream-300 hover:bg-soft-cream-200 dark:hover:bg-navy-700 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                                            title="Upload screenshot"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>{uploadingProjId === project.id ? 'Uploading...' : 'Upload'}</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(project.featured)}
                                                onChange={(e) => handleUpdateProject(idx, 'featured', e.target.checked)}
                                                className="rounded text-navy-600 focus:ring-navy-500 cursor-pointer"
                                            />
                                            <span className="font-medium text-navy-700 dark:text-soft-cream-300">Featured</span>
                                        </label>

                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(project.is_live)}
                                                onChange={(e) => handleUpdateProject(idx, 'is_live', e.target.checked)}
                                                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">Live Demo Active</span>
                                        </label>
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

export default ProjectsTab;