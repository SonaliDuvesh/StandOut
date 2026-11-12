import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useSearchParams } from 'react-router-dom';
import HomeTab from '../components/builder/HomeTab';
import ProjectsTab from '../components/builder/ProjectsTab';
import AboutTab from '../components/builder/AboutTab';
import SkillsTab from '../components/builder/SkillsTab';
import CertificationsTab from '../components/builder/CertificationsTab';
import ContactTab from '../components/builder/ContactTab';
import AppearanceTab from '../components/builder/AppearanceTab';
import CustomPageTab from '../components/builder/CustomPageTab';
import FloatingToast from '../components/FloatingToast';
import PublishModal from '../components/builder/PublishModal';
import {
    Home, FolderGit2, User, Cpu, Award, Mail, Palette,
    Save, Eye, ExternalLink, Check, Sun, Moon,
    AlertCircle, CheckCircle2, Globe, Sparkles, X, Rocket, Share2, RefreshCw, RotateCcw
} from 'lucide-react';

const TABS = [
    { id: 'home', label: 'Home', icon: Home, desc: 'Intro & Background' },
    { id: 'projects', label: 'Projects', icon: FolderGit2, desc: 'GitHub & Custom' },
    { id: 'about', label: 'About', icon: User, desc: 'Story & Education' },
    { id: 'skills', label: 'Skills', icon: Cpu, desc: 'Dynamic Categories' },
    { id: 'certifications', label: 'Certifications', icon: Award, desc: 'Credentials & Badges' },
    { id: 'custom', label: 'Custom Page', icon: Sparkles, desc: 'Dynamic Custom Section' },
    { id: 'contact', label: 'Contact', icon: Mail, desc: 'Social & Forms' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & Typography' },
];

const Builder = () => {
    const {
        portfolio,
        updateField,
        resetAllToDemo,
        savePortfolio,
        publishPortfolio,
        restorePersonalDraft,
        isPublicMode,
        publishedSlug,
        publishedUrl,
        saving,
        success,
        setSuccess,
        error,
        setError,
        activeSection,
        setActiveSection,
    } = usePortfolio();

    const { theme, toggleTheme } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [currentTab, setCurrentTab] = useState(
        (tabParam && TABS.some(t => t.id === tabParam)) ? tabParam : (activeSection || 'home')
    );
    const [usernameInput, setUsernameInput] = useState(portfolio.username || 'username');
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishResult, setPublishResult] = useState(null);

    useEffect(() => {
        if (portfolio.username) {
            setUsernameInput(portfolio.username);
        }
    }, [portfolio.username]);

    useEffect(() => {
        if (isPublicMode && restorePersonalDraft) {
            restorePersonalDraft();
        }
    }, [isPublicMode, restorePersonalDraft]);

    useEffect(() => {
        if (tabParam && TABS.some(t => t.id === tabParam) && tabParam !== currentTab) {
            setCurrentTab(tabParam);
            setActiveSection(tabParam);
        }
    }, [tabParam, currentTab, setActiveSection]);

    const handleTabChange = (tabId) => {
        setCurrentTab(tabId);
        setActiveSection(tabId);
        setSearchParams({ tab: tabId });
    };

    const handleSave = async () => {
        await savePortfolio();
    };

    const handlePublish = () => {
        const res = publishPortfolio();
        setPublishResult(res);
        setShowPublishModal(true);
    };

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        const clean = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (clean) {
            updateField('username', clean);
            setShowUserModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-soft-cream-50 dark:bg-navy-950 text-navy-900 dark:text-soft-cream-50 flex flex-col transition-colors duration-300">
            <header className="sticky top-0 z-40 glass border-b border-soft-cream-200 dark:border-navy-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-golden-500 via-amber-500 to-navy-700 flex items-center justify-center text-white shadow-sm font-bold text-sm select-none">
                            {(portfolio.display_name || portfolio.full_name || 'D').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-base font-bold gradient-text leading-tight flex items-center gap-2">
                                <span>{portfolio.display_name || portfolio.full_name || 'StandOut'}</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowUserModal(true)}
                                    className="text-xs text-navy-500 dark:text-soft-cream-400 hover:text-navy-800 dark:hover:text-soft-cream-200 underline decoration-dotted font-mono font-medium"
                                    title="Click to customize portfolio username / slug"
                                >
                                    @{portfolio.username || 'username'}
                                </button>
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    {portfolio.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={handlePublish}
                            className="btn-primary py-2 px-3.5 sm:px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-md bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:scale-105 active:scale-95 transition-all ring-2 ring-emerald-400/30 cursor-pointer"
                            title={publishedSlug ? "Update your published live portfolio URL" : "Publish a personalized live portfolio URL"}
                        >
                            {publishedSlug ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Update Published Portfolio</span>
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-3.5 h-3.5" />
                                    <span>Publish Portfolio</span>
                                </>
                            )}
                        </button>

                        {publishedSlug && (
                            <button
                                type="button"
                                onClick={() => {
                                    const res = publishPortfolio();
                                    setPublishResult(res);
                                    setShowPublishModal(true);
                                }}
                                className="btn-secondary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                                title="View and copy published portfolio URL"
                            >
                                <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="hidden sm:inline">Share Link</span>
                            </button>
                        )}

                        <Link
                            to="/preview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary py-2 px-3 sm:px-4 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                            title="Open live preview in new tab"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Device Preview</span>
                        </Link>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-secondary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                            title="Save local draft changes"
                        >
                            {saving ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-navy-700 dark:border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Save Draft</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm("Reset all customizations and restore clean generic demo data?")) {
                                    resetAllToDemo?.();
                                }
                            }}
                            className="btn-secondary py-2 px-2.5 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs text-navy-600 dark:text-soft-cream-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                            title="Reset entire portfolio to clean demo defaults"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Reset Demo</span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-soft-cream-200 dark:bg-navy-800 text-navy-700 dark:text-soft-cream-300 hover:bg-soft-cream-300 dark:hover:bg-navy-700 transition-colors flex items-center justify-center cursor-pointer"
                            aria-label="Toggle theme"
                            title={`Current: ${theme} (click to toggle)`}
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-golden-400" />
                            ) : theme === 'pink' ? (
                                <span className="text-sm leading-none select-none">🌸</span>
                            ) : (
                                <Moon className="w-4 h-4 text-navy-700" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <FloatingToast
                successMessage={success}
                errorMessage={error}
                onClearSuccess={() => setSuccess?.(null)}
                onClearError={() => setError?.(null)}
            />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
                <aside className="w-full md:w-64 shrink-0">
                    <nav className="glass rounded-2xl p-2.5 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible sticky top-20 shadow-sm">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = currentTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all shrink-0 ${isActive
                                        ? 'bg-navy-600 dark:bg-soft-cream-600 text-soft-cream-50 dark:text-navy-950 font-bold shadow-md'
                                        : 'text-navy-700 dark:text-soft-cream-300 hover:bg-soft-cream-200/60 dark:hover:bg-navy-800/60 font-medium'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-navy-950' : 'text-navy-500 dark:text-soft-cream-400'}`} />
                                    <div>
                                        <div className="text-xs sm:text-sm">{tab.label}</div>
                                        <div className={`text-[10px] hidden md:block opacity-75`}>
                                            {tab.desc}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        <div className="hidden md:block pt-3 mt-3 border-t border-soft-cream-200 dark:border-navy-800/80 px-2">
                            <span className="text-[10px] text-navy-400 uppercase font-semibold block mb-1">
                                Public URL
                            </span>
                            <Link
                                to={`/${portfolio.username || 'username'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-navy-700 dark:text-soft-cream-300 hover:text-navy-900 dark:hover:text-soft-cream-100 flex items-center justify-between gap-1 group py-1 font-mono font-medium"
                                title={`Open public portfolio: /${portfolio.username || 'username'}`}
                            >
                                <span className="truncate">/{portfolio.username || 'username'}</span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                            </Link>
                        </div>
                    </nav>
                </aside>

                <main className="flex-1 glass rounded-3xl p-6 md:p-8 shadow-sm border border-soft-cream-200 dark:border-navy-800">
                    {currentTab === 'home' && <HomeTab />}
                    {currentTab === 'projects' && <ProjectsTab />}
                    {currentTab === 'about' && <AboutTab />}
                    {currentTab === 'skills' && <SkillsTab />}
                    {currentTab === 'certifications' && <CertificationsTab />}
                    {currentTab === 'custom' && <CustomPageTab />}
                    {currentTab === 'contact' && <ContactTab />}
                    {currentTab === 'appearance' && <AppearanceTab />}
                </main>
            </div>

            {showUserModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] bg-navy-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-navy-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-soft-cream-200 dark:border-navy-700 space-y-4 animate-scale-up">
                        <h3 className="text-lg font-bold text-navy-800 dark:text-soft-cream-100">
                            Configure Portfolio Handle / Slug
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-soft-cream-400 leading-relaxed">
                            Each portfolio has a unique handle. Your public portfolio will be accessible at: <code className="bg-soft-cream-200 dark:bg-navy-800 px-1 py-0.5 rounded text-navy-800 dark:text-soft-cream-200 font-mono">/{usernameInput}</code>
                        </p>
                        <form onSubmit={handleUsernameSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-navy-700 dark:text-soft-cream-300 mb-1">
                                    Username / Slug
                                </label>
                                <input
                                    type="text"
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    placeholder="e.g. username"
                                    required
                                    className="input py-2 text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(false)}
                                    className="btn-outline py-2 px-4 text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary py-2 px-5 text-xs"
                                >
                                    Update Handle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            <PublishModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                publishResult={publishResult}
                isUpdate={Boolean(publishedSlug)}
            />
        </div>
    );
};

export default Builder;

