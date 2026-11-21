import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { portfolioAPI } from '../services/api';
import { DEFAULT_PORTFOLIO } from './defaultPortfolio';
import {
    encodePortfolioToUrl,
    decodePortfolioFromUrl,
    generatePortfolioSlug,
    nameToUsernameSlug,
} from '../utils/urlPortfolio.js';
import {
    saveDraftToStorage,
    loadDraftFromStorage,
    loadLatestDraftFromStorage,
    savePublishedCache,
    loadPublishedCache,
    sanitizeStorage,
    cleanIndexedDBPersonalData,
    isLegacyOrPersonalIdentifier,
    saveActiveSession,
    loadActiveSession,
    clearActiveSession,
    saveSessionSnapshot,
    loadSessionSnapshots,
    clearSessionSnapshots,
} from '../utils/portfolioStorage.js';
import {
    savePortfolioToSupabase,
    getPortfolioFromSupabase,
    isSupabaseConfigured
} from '../services/supabase.js';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children, initialUsername = 'username' }) => {
    if (typeof window !== 'undefined') {
        sanitizeStorage();
    }

    const [isPublicMode, setIsPublicMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.location.pathname.startsWith('/p/');
        }
        return false;
    });
    const [portfolio, setPortfolio] = useState(() => {
        if (typeof localStorage !== 'undefined') {
            // First check if an ongoing active session with user progress exists
            const activeSession = loadActiveSession();
            if (activeSession && activeSession.portfolio && !isLegacyOrPersonalIdentifier(activeSession.portfolio)) {
                return {
                    ...DEFAULT_PORTFOLIO,
                    ...activeSession.portfolio,
                };
            }

            const activeUser = localStorage.getItem('portfolio_last_active_user') || initialUsername;
            const saved = localStorage.getItem(`portfolio_draft_${activeUser}`) ||
                          localStorage.getItem('portfolio_draft_latest') ||
                          localStorage.getItem(`portfolio_draft_${initialUsername}`);
            if (saved && !isLegacyOrPersonalIdentifier(saved)) {
                try {
                    const parsed = JSON.parse(saved);
                    if (!isLegacyOrPersonalIdentifier(parsed)) {
                        return {
                            ...DEFAULT_PORTFOLIO,
                            ...parsed
                        };
                    }
                } catch (e) {
                    console.error('Failed to parse cached portfolio', e);
                }
            }
        }
        return DEFAULT_PORTFOLIO;
    });

    const [allPortfolios, setAllPortfolios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [deviceMode, setDeviceMode] = useState('desktop');
    const [activeSection, setActiveSection] = useState(() => {
        if (typeof localStorage !== 'undefined') {
            const activeSession = loadActiveSession();
            if (activeSession && activeSession.activeSection) {
                return activeSession.activeSection;
            }
        }
        return 'home';
    });

    // Session History & Undo/Redo Engine
    const [sessionSnapshots, setSessionSnapshots] = useState(() => {
        return loadSessionSnapshots();
    });
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [recoveredSessionNotice, setRecoveredSessionNotice] = useState(() => {
        if (typeof localStorage !== 'undefined') {
            const active = loadActiveSession();
            if (active && active.portfolio && active.timestamp) {
                return {
                    timestamp: active.timestamp,
                    timeStr: new Date(active.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    label: active.label || 'Auto-saved session progress',
                };
            }
        }
        return null;
    });

    const historyPastRef = useRef([]);
    const historyFutureRef = useRef([]);
    const isHistoryNavigatingRef = useRef(false);
    const lastEditTimeRef = useRef(0);
    const lastEditPathRef = useRef('');
    const portfolioRef = useRef(portfolio);
    const activeSectionRef = useRef(activeSection);

    useEffect(() => {
        portfolioRef.current = portfolio;
    }, [portfolio]);

    useEffect(() => {
        activeSectionRef.current = activeSection;
    }, [activeSection]);

    const pushHistoryState = useCallback((currentState, path = '', forceImmediate = false) => {
        if (isHistoryNavigatingRef.current) {
            isHistoryNavigatingRef.current = false;
            return;
        }

        const now = Date.now();
        const isStructural = forceImmediate || (
            path.includes('projects') ||
            path.includes('skills') ||
            path.includes('certifications') ||
            path.includes('appearance') ||
            path.includes('sections_visibility') ||
            path.includes('titles') ||
            path.includes('education') ||
            path.includes('custom_section') ||
            path.includes('social_links') ||
            path.startsWith('reset_') ||
            path === 'restore_checkpoint' ||
            path === 'import_json'
        );

        const timeSinceLastEdit = now - lastEditTimeRef.current;

        if (isStructural || timeSinceLastEdit > 800 || lastEditPathRef.current !== path) {
            historyPastRef.current.push(JSON.parse(JSON.stringify(currentState)));
            if (historyPastRef.current.length > 50) {
                historyPastRef.current.shift();
            }
            historyFutureRef.current = [];
            setCanUndo(true);
            setCanRedo(false);
        }

        lastEditTimeRef.current = now;
        lastEditPathRef.current = path;
    }, []);

    const undo = useCallback(() => {
        if (historyPastRef.current.length === 0) return false;

        const previousState = historyPastRef.current.pop();
        historyFutureRef.current.push(JSON.parse(JSON.stringify(portfolioRef.current)));
        if (historyFutureRef.current.length > 50) {
            historyFutureRef.current.shift();
        }

        isHistoryNavigatingRef.current = true;
        setPortfolio(previousState);
        setCanUndo(historyPastRef.current.length > 0);
        setCanRedo(true);

        saveActiveSession({
            portfolio: previousState,
            activeSection: activeSectionRef.current,
            timestamp: Date.now(),
            label: 'Undo previous change'
        });

        return true;
    }, []);

    const redo = useCallback(() => {
        if (historyFutureRef.current.length === 0) return false;

        const nextState = historyFutureRef.current.pop();
        historyPastRef.current.push(JSON.parse(JSON.stringify(portfolioRef.current)));
        if (historyPastRef.current.length > 50) {
            historyPastRef.current.shift();
        }

        isHistoryNavigatingRef.current = true;
        setPortfolio(nextState);
        setCanUndo(true);
        setCanRedo(historyFutureRef.current.length > 0);

        saveActiveSession({
            portfolio: nextState,
            activeSection: activeSectionRef.current,
            timestamp: Date.now(),
            label: 'Redo change'
        });

        return true;
    }, []);

    const restoreSessionSnapshot = useCallback((snapshot) => {
        if (!snapshot || !snapshot.portfolio) return false;

        pushHistoryState(portfolioRef.current, 'restore_checkpoint', true);

        isHistoryNavigatingRef.current = true;
        const restored = {
            ...DEFAULT_PORTFOLIO,
            ...snapshot.portfolio,
        };

        setPortfolio(restored);

        saveActiveSession({
            portfolio: restored,
            activeSection: snapshot.activeSection || activeSectionRef.current,
            timestamp: Date.now(),
            label: `Restored: ${snapshot.label || 'Saved Checkpoint'}`
        });

        if (snapshot.activeSection) {
            setActiveSection(snapshot.activeSection);
        }

        setSessionSnapshots(loadSessionSnapshots());
        setSuccess(`Restored session checkpoint: ${snapshot.label || 'Previous progress'}`);
        setTimeout(() => setSuccess(null), 3000);
        return true;
    }, [pushHistoryState]);

    const saveManualCheckpoint = useCallback((customLabel) => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const label = customLabel || `Manual Save (${timeStr})`;
        const snap = saveSessionSnapshot({
            portfolio: portfolioRef.current,
            activeSection: activeSectionRef.current,
            label,
            type: 'manual',
        });
        if (snap) {
            setSessionSnapshots(loadSessionSnapshots());
        }
        setSuccess(`Progress checkpoint saved: "${label}"`);
        setTimeout(() => setSuccess(null), 2500);
        return snap;
    }, []);

    const restoreLastSession = useCallback(() => {
        const active = loadActiveSession();
        if (active && active.portfolio) {
            return restoreSessionSnapshot({
                portfolio: active.portfolio,
                activeSection: active.activeSection,
                label: active.label || 'Active Session Progress',
                timestamp: active.timestamp
            });
        }
        const snaps = loadSessionSnapshots();
        if (snaps.length > 0) {
            return restoreSessionSnapshot(snaps[0]);
        }
        return false;
    }, [restoreSessionSnapshot]);

    const clearSessionHistory = useCallback(() => {
        clearSessionSnapshots();
        setSessionSnapshots([]);
        historyPastRef.current = [];
        historyFutureRef.current = [];
        setCanUndo(false);
        setCanRedo(false);
        setSuccess('Session history cleared.');
        setTimeout(() => setSuccess(null), 2000);
    }, []);

    const [publishedSlug, setPublishedSlug] = useState(() => {
        if (typeof localStorage === 'undefined') return null;
        const slug = localStorage.getItem('my_published_portfolio_slug');
        if (slug && !isLegacyOrPersonalIdentifier(slug)) {
            return slug;
        }
        return null;
    });

    const [publishedUrl, setPublishedUrl] = useState(() => {
        if (typeof localStorage === 'undefined') return null;
        const url = localStorage.getItem('my_published_portfolio_url');
        if (url && !isLegacyOrPersonalIdentifier(url)) {
            return url;
        }
        return null;
    });

    useEffect(() => {
        let isMounted = true;
        cleanIndexedDBPersonalData();
        const hydrateFromIndexedDB = async () => {
            try {
                const latestDraft = await loadLatestDraftFromStorage();
                if (latestDraft && isMounted && !isPublicMode && !isLegacyOrPersonalIdentifier(latestDraft)) {
                    setPortfolio(prev => {
                        const prevTs = prev?._updatedAt || 0;
                        const latestTs = latestDraft._updatedAt || 0;
                        if (latestTs > prevTs) {
                            return {
                                ...DEFAULT_PORTFOLIO,
                                ...latestDraft
                            };
                        }
                        return prev;
                    });
                }
            } catch (e) {
                console.warn('IndexedDB initial hydration note:', e);
            }
        };
        hydrateFromIndexedDB();
        return () => {
            isMounted = false;
        };
    }, [isPublicMode]);

    const fetchPortfoliosList = useCallback(async () => {
        try {
            const res = await portfolioAPI.getAll();
            if (Array.isArray(res.data)) {
                setAllPortfolios(res.data);
            } else if (Array.isArray(res.data?.results)) {
                setAllPortfolios(res.data.results);
            }
        } catch (e) {
            console.warn('Could not list portfolios:', e);
        }
    }, []);

    const loadPortfolio = useCallback(async (usernameToLoad) => {
        let targetUser = usernameToLoad || portfolio?.username || (typeof localStorage !== 'undefined' ? localStorage.getItem('portfolio_last_active_user') : null) || 'username';
        if (isLegacyOrPersonalIdentifier(targetUser)) {
            targetUser = 'username';
        }
        setLoading(true);
        setError(null);
        try {
            const response = await portfolioAPI.getByUsername(targetUser);
            if (response.data) {
                const localDraftRaw = localStorage.getItem(`portfolio_draft_${targetUser}`) || localStorage.getItem('portfolio_draft_latest');
                let localDraft = null;
                if (localDraftRaw && !isLegacyOrPersonalIdentifier(localDraftRaw)) {
                    try {
                        const parsed = JSON.parse(localDraftRaw);
                        if (!isLegacyOrPersonalIdentifier(parsed)) {
                            localDraft = parsed;
                        }
                    } catch (e) {}
                }

                // If active session exists, prioritize it so ongoing session progress is not wiped
                const activeSession = loadActiveSession();
                const sessionDraft = (activeSession && activeSession.portfolio && !isLegacyOrPersonalIdentifier(activeSession.portfolio)) ? activeSession.portfolio : null;
                const effectiveDraft = sessionDraft || localDraft;

                const merged = {
                    ...DEFAULT_PORTFOLIO,
                    ...response.data,
                    ...(effectiveDraft || {}),
                    appearance: {
                        ...DEFAULT_PORTFOLIO.appearance,
                        ...(response.data.appearance || {}),
                        ...(effectiveDraft?.appearance || {})
                    },
                    sections_visibility: {
                        ...DEFAULT_PORTFOLIO.sections_visibility,
                        ...(response.data.sections_visibility || {}),
                        ...(effectiveDraft?.sections_visibility || {})
                    },
                    custom_section: {
                        ...DEFAULT_PORTFOLIO.custom_section,
                        ...(response.data.custom_section || {}),
                        ...(effectiveDraft?.custom_section || {})
                    },
                    social_links: {
                        ...DEFAULT_PORTFOLIO.social_links,
                        ...(response.data.social_links || {}),
                        ...(effectiveDraft?.social_links || {})
                    },
                    home_typography: {
                        ...DEFAULT_PORTFOLIO.home_typography,
                        ...(response.data.home_typography || {}),
                        ...(effectiveDraft?.home_typography || {})
                    },
                    background_settings: {
                        ...DEFAULT_PORTFOLIO.background_settings,
                        ...(response.data.background_settings || {}),
                        ...(effectiveDraft?.background_settings || {})
                    }
                };

                setPortfolio(prev => {
                    if (prev && prev.full_name && prev.full_name !== 'Developer Name' && (!localDraft || !localDraft.full_name)) {
                        merged.full_name = prev.full_name;
                        merged.display_name = prev.display_name || prev.full_name;
                        merged.username = prev.username;
                    }
                    return merged;
                });
            }
        } catch (err) {
            console.warn(`Could not fetch portfolio for "${targetUser}" from server. Using local state.`, err);
            const local = localStorage.getItem(`portfolio_draft_${targetUser}`) || localStorage.getItem('portfolio_draft_latest');
            if (local && !isLegacyOrPersonalIdentifier(local)) {
                try {
                    setPortfolio(JSON.parse(local));
                } catch (e) {
                    setPortfolio(DEFAULT_PORTFOLIO);
                }
            } else if (targetUser === 'username') {
                setPortfolio(DEFAULT_PORTFOLIO);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const hasInitialLoadedRef = useRef(false);

    useEffect(() => {
        if (hasInitialLoadedRef.current) return;
        hasInitialLoadedRef.current = true;
        fetchPortfoliosList();
        const isPublishedRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/p/');
        if (!isPublishedRoute && !isPublicMode) {
            const activeUser = (typeof localStorage !== 'undefined' ? localStorage.getItem('portfolio_last_active_user') : null) || initialUsername || 'username';
            loadPortfolio(activeUser);
        }
    }, [fetchPortfoliosList, loadPortfolio, initialUsername, isPublicMode]);

    const createNewPortfolio = async (newUsername, newFullName) => {
        const cleanUser = newUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!cleanUser) throw new Error('Invalid username');

        const newTemplate = {
            ...DEFAULT_PORTFOLIO,
            username: cleanUser,
            full_name: newFullName || cleanUser,
            display_name: newFullName || cleanUser,
            projects: [],
            certifications: [],
        };

        setPortfolio(newTemplate);
        localStorage.setItem(`portfolio_draft_${cleanUser}`, JSON.stringify(newTemplate));
        await savePortfolio(newTemplate);
        await fetchPortfoliosList();
        return cleanUser;
    };

    const applyAppearance = useCallback((appearance) => {
        if (!appearance || typeof document === 'undefined') return;
        const root = document.documentElement;

        if (appearance.primaryColor) {
            root.style.setProperty('--color-primary', appearance.primaryColor);
        }
        if (appearance.secondaryColor) {
            root.style.setProperty('--color-secondary', appearance.secondaryColor);
        }
        if (appearance.accentColor) {
            root.style.setProperty('--color-accent', appearance.accentColor);
        }
        if (appearance.bgLight) {
            root.style.setProperty('--color-bg-light', appearance.bgLight);
        }
        if (appearance.bgDark) {
            root.style.setProperty('--color-bg-dark', appearance.bgDark);
        }

        const loadGoogleFont = (font) => {
            if (!font || font === 'Inter' || font === 'system-ui') return;
            const fontId = `google-font-${font.replace(/\s+/g, '-').toLowerCase()}`;
            if (!document.getElementById(fontId)) {
                const link = document.createElement('link');
                link.id = fontId;
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700;800;900&display=swap`;
                document.head.appendChild(link);
            }
        };

        const bodyFont = appearance.fontFamily || 'Inter';
        const headingFont = appearance.headingFont || bodyFont;

        loadGoogleFont(bodyFont);
        loadGoogleFont(headingFont);

        root.style.setProperty('--font-body', `"${bodyFont}", system-ui, sans-serif`);
        root.style.setProperty('--font-heading', `"${headingFont}", "${bodyFont}", system-ui, sans-serif`);
        root.style.fontFamily = `"${bodyFont}", system-ui, sans-serif`;
        if (document.body) {
            document.body.style.fontFamily = `"${bodyFont}", system-ui, sans-serif`;
        }
    }, []);

    useEffect(() => {
        if (portfolio?.appearance) {
            applyAppearance(portfolio.appearance);
        }
    }, [portfolio?.appearance, applyAppearance]);

    const isExternalSync = useRef(false);

    useEffect(() => {
        if (isPublicMode) return;
        if (!portfolio?.username) return;
        if (isExternalSync.current) {
            isExternalSync.current = false;
            return;
        }

        saveDraftToStorage(portfolio.username, portfolio).catch(() => {});

        // Save ongoing active session to browser storage immediately
        saveActiveSession({
            portfolio,
            activeSection: activeSectionRef.current,
            timestamp: Date.now(),
            label: 'Ongoing active session'
        });

        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const channel = new BroadcastChannel('portfolio_sync_channel');
                channel.postMessage({ type: 'PORTFOLIO_DRAFT_UPDATED', data: portfolio });
                channel.close();
            } catch (e) {}
        }
    }, [portfolio, isPublicMode]);

    // Auto-save session snapshot timeline (debounced 1200ms)
    const autoSaveSessionTimeoutRef = useRef(null);
    useEffect(() => {
        if (isPublicMode || !portfolio?.username) return;

        if (autoSaveSessionTimeoutRef.current) {
            clearTimeout(autoSaveSessionTimeoutRef.current);
        }

        autoSaveSessionTimeoutRef.current = setTimeout(() => {
            const snap = saveSessionSnapshot({
                portfolio,
                activeSection: activeSectionRef.current,
                label: `Auto-saved session progress`,
                type: 'auto'
            });
            if (snap) {
                setSessionSnapshots(loadSessionSnapshots());
            }
        }, 1200);

        return () => {
            if (autoSaveSessionTimeoutRef.current) {
                clearTimeout(autoSaveSessionTimeoutRef.current);
            }
        };
    }, [portfolio, isPublicMode]);

    useEffect(() => {
        let channel;
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                channel = new BroadcastChannel('portfolio_sync_channel');
                channel.onmessage = (event) => {
                    const incoming = event.data?.data;
                    if (incoming && incoming.username) {
                        setPortfolio(prev => {
                            if (JSON.stringify(prev) === JSON.stringify(incoming)) {
                                return prev;
                            }
                            isExternalSync.current = true;
                            return incoming;
                        });
                    }
                };
            } catch (e) {}
        }

        const handleStorageChange = (e) => {
            if ((e.key === `portfolio_draft_${portfolio?.username}` || e.key === 'portfolio_draft_latest') && e.newValue) {
                try {
                    const updated = JSON.parse(e.newValue);
                    setPortfolio(prev => {
                        if (JSON.stringify(prev) === e.newValue) {
                            return prev;
                        }
                        isExternalSync.current = true;
                        return updated;
                    });
                } catch (err) {
                    console.error('Failed to sync updated portfolio from storage event', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            channel?.close();
        };
    }, [portfolio?.username]);

    const savePortfolio = async (customData = null) => {
        let dataToSave = customData ? { ...customData } : { ...portfolio };
        
        const currentName = (dataToSave.display_name || dataToSave.full_name || '').trim();
        if ((!dataToSave.username || dataToSave.username === 'username') && currentName && currentName !== 'Developer Name') {
            dataToSave.username = nameToUsernameSlug(currentName);
        }

        const activeUsername = dataToSave.username || 'username';
        setSaving(true);
        setError(null);
        setSuccess(null);

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('portfolio_last_active_user', activeUsername);
        }
        await saveDraftToStorage(activeUsername, dataToSave);

        try {
            const response = await portfolioAPI.save(activeUsername, dataToSave);
            setSuccess('Portfolio saved successfully!');
            const merged = {
                ...DEFAULT_PORTFOLIO,
                ...dataToSave,
                ...(response.data || {}),
                username: activeUsername,
                full_name: dataToSave.full_name || response.data?.full_name,
                display_name: dataToSave.display_name || response.data?.display_name || dataToSave.full_name,
                appearance: {
                    ...DEFAULT_PORTFOLIO.appearance,
                    ...(dataToSave.appearance || {}),
                    ...(response.data?.appearance || {})
                },
                sections_visibility: {
                    ...DEFAULT_PORTFOLIO.sections_visibility,
                    ...(dataToSave.sections_visibility || {}),
                    ...(response.data?.sections_visibility || {})
                },
                custom_section: {
                    ...DEFAULT_PORTFOLIO.custom_section,
                    ...(dataToSave.custom_section || {}),
                    ...(response.data?.custom_section || {})
                },
                social_links: {
                    ...DEFAULT_PORTFOLIO.social_links,
                    ...(dataToSave.social_links || {}),
                    ...(response.data?.social_links || {})
                },
                home_typography: {
                    ...DEFAULT_PORTFOLIO.home_typography,
                    ...(dataToSave.home_typography || {}),
                    ...(response.data?.home_typography || {})
                },
                background_settings: {
                    ...DEFAULT_PORTFOLIO.background_settings,
                    ...(dataToSave.background_settings || {}),
                    ...(response.data?.background_settings || {})
                }
            };
            setPortfolio(merged);
            await saveDraftToStorage(activeUsername, merged);
            if (typeof BroadcastChannel !== 'undefined') {
                try {
                    const channel = new BroadcastChannel('portfolio_sync_channel');
                    channel.postMessage({ type: 'PORTFOLIO_SAVED', data: merged });
                    channel.close();
                } catch (e) {}
            }
            setTimeout(() => setSuccess(null), 2500);
            return true;
        } catch (err) {
            console.warn('Server sync note (draft safely persisted locally):', err);
            setPortfolio(dataToSave);
            setSuccess('Portfolio draft saved locally!');
            setTimeout(() => setSuccess(null), 2500);
            return true;
        } finally {
            setSaving(false);
        }
    };

    const updateField = (path, value) => {
        setPortfolio(prev => {
            pushHistoryState(prev, path);
            const copy = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current = copy;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return copy;
        });
    };

    const resetSection = (sectionName) => {
        setPortfolio(prev => {
            pushHistoryState(prev, `reset_${sectionName}`, true);
            const copy = JSON.parse(JSON.stringify(prev));
            switch (sectionName) {
                case 'home':
                    copy.full_name = DEFAULT_PORTFOLIO.full_name;
                    copy.display_name = DEFAULT_PORTFOLIO.display_name;
                    copy.greeting = DEFAULT_PORTFOLIO.greeting;
                    copy.titles = [...DEFAULT_PORTFOLIO.titles];
                    copy.short_bio = DEFAULT_PORTFOLIO.short_bio;
                    copy.background_image = '';
                    copy.profile_image = '';
                    copy.background_settings = { ...DEFAULT_PORTFOLIO.background_settings };
                    copy.home_typography = { ...DEFAULT_PORTFOLIO.home_typography };
                    break;
                case 'about':
                    copy.detailed_bio = DEFAULT_PORTFOLIO.detailed_bio;
                    copy.education = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO.education));
                    break;
                case 'skills':
                    copy.skills_categories = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO.skills_categories));
                    break;
                case 'projects':
                    copy.projects = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO.projects));
                    break;
                case 'certifications':
                    copy.certifications = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO.certifications));
                    break;
                case 'contact':
                    copy.social_links = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO.social_links));
                    break;
                case 'custom':
                case 'custom_section':
                    copy.custom_section = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO.custom_section));
                    break;
                case 'appearance':
                    copy.appearance = { ...DEFAULT_PORTFOLIO.appearance };
                    break;
                default:
                    break;
            }
            return copy;
        });
    };

    const resetAllToDemo = async () => {
        try {
            saveSessionSnapshot({
                portfolio: portfolioRef.current,
                activeSection: activeSectionRef.current,
                label: 'Pre-Reset Demo Backup',
                type: 'backup',
            });
            pushHistoryState(portfolioRef.current, 'reset_all', true);

            if (typeof localStorage !== 'undefined') {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('portfolio_draft_') || key.startsWith('published_portfolio_') || key.startsWith('my_published_') || key === 'portfolio_last_active_user')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(k => {
                    try {
                        localStorage.removeItem(k);
                    } catch (e) {}
                });
            }
            setPortfolio(DEFAULT_PORTFOLIO);
            setPublishedSlug(null);
            setPublishedUrl(null);
            setSuccess('Reset all portfolio sections to clean generic demo data! (Undo anytime via History)');
            setTimeout(() => setSuccess(null), 3500);
        } catch (e) {
            console.error('Failed to reset to demo:', e);
        }
    };

    const publishPortfolio = useCallback((customPortfolio = null) => {
        const current = customPortfolio || portfolio;
        const slug = current.published_slug || publishedSlug || generatePortfolioSlug(current.full_name || current.username);

        const currentWithSlug = {
            ...current,
            published_slug: slug
        };

        const encodeResult = encodePortfolioToUrl(currentWithSlug, slug);

        setPublishedSlug(encodeResult.slug);
        setPublishedUrl(encodeResult.shortUrl || encodeResult.fullUrl);
        setPortfolio(currentWithSlug);

        saveDraftToStorage(currentWithSlug.username, currentWithSlug).catch(() => {});
        savePublishedCache(encodeResult.slug, currentWithSlug).catch(() => {});

        try {
            localStorage.setItem('my_published_portfolio_slug', encodeResult.slug);
            localStorage.setItem('my_published_portfolio_url', encodeResult.shortUrl || encodeResult.fullUrl);
        } catch (e) {
            console.warn('LocalStorage error on publish', e);
        }

        // Save on server for both clean slug and username
        portfolioAPI.save(encodeResult.slug, currentWithSlug).catch(() => {});
        if (currentWithSlug.username && currentWithSlug.username !== encodeResult.slug) {
            portfolioAPI.save(currentWithSlug.username, currentWithSlug).catch(() => {});
        }

        // Save to Supabase for global persistence across any visitor / device
        if (isSupabaseConfigured()) {
            savePortfolioToSupabase(encodeResult.slug, currentWithSlug).catch((err) => {
                console.warn('Supabase publish background sync notice:', err);
            });
            if (currentWithSlug.username && currentWithSlug.username !== encodeResult.slug) {
                savePortfolioToSupabase(currentWithSlug.username, currentWithSlug).catch(() => {});
            }
        }

        return {
            ...encodeResult,
            portfolioData: currentWithSlug,
        };
    }, [portfolio, publishedSlug]);

    const loadPublishedPortfolio = useCallback(async (slug, urlOrHashString = null) => {
        setIsPublicMode(true);
        setLoading(true);
        setError(null);
        try {
            // 1. Direct URL hash fragment (#data=...) if user shared a portable self-contained link
            const source = urlOrHashString || (typeof window !== 'undefined' ? (window.location.hash || window.location.search) : '');
            if (source) {
                const decoded = decodePortfolioFromUrl(source);
                if (decoded.success && decoded.portfolio) {
                    setPortfolio(decoded.portfolio);
                    if (slug) {
                        savePublishedCache(slug, decoded.portfolio).catch(() => {});
                    }
                    setLoading(false);
                    return { success: true, portfolio: decoded.portfolio };
                }
            }

            // 2. Query Supabase (Global cloud storage snapshot so remote visitors on external devices see edited data)
            if (slug && isSupabaseConfigured()) {
                try {
                    let sbData = await getPortfolioFromSupabase(slug);
                    if (!sbData) {
                        const baseUsername = slug.replace(/-[a-z0-9]{3,5}$/, '');
                        if (baseUsername && baseUsername !== slug) {
                            sbData = await getPortfolioFromSupabase(baseUsername);
                        }
                    }
                    if (sbData) {
                        const merged = { ...DEFAULT_PORTFOLIO, ...sbData };
                        setPortfolio(merged);
                        savePublishedCache(slug, merged).catch(() => {});
                        setLoading(false);
                        return { success: true, portfolio: merged };
                    }
                } catch (sbErr) {
                    console.warn('Supabase cloud fetch warning, falling back to local cache/server:', sbErr);
                }
            }

            // 3. Local IndexedDB / LocalStorage cache (immediate local fast load)
            if (slug) {
                const cached = await loadPublishedCache(slug);
                if (cached) {
                    setPortfolio(cached);
                    setLoading(false);
                    return { success: true, portfolio: cached };
                }
            }

            if (slug) {
                try {
                    let serverRes = await portfolioAPI.getByUsername(slug);
                    if (!serverRes?.data) {
                        const baseUsername = slug.replace(/-[a-z0-9]{3,5}$/, '');
                        if (baseUsername && baseUsername !== slug) {
                            serverRes = await portfolioAPI.getByUsername(baseUsername);
                        }
                    }
                    if (serverRes?.data) {
                        const merged = { ...DEFAULT_PORTFOLIO, ...serverRes.data };
                        setPortfolio(merged);
                        savePublishedCache(slug, merged).catch(() => {});
                        setLoading(false);
                        return { success: true, portfolio: merged };
                    }
                } catch (e) {
                    try {
                        const baseUsername = slug.replace(/-[a-z0-9]{3,5}$/, '');
                        if (baseUsername && baseUsername !== slug) {
                            const res = await portfolioAPI.getByUsername(baseUsername);
                            if (res?.data) {
                                const merged = { ...DEFAULT_PORTFOLIO, ...res.data };
                                setPortfolio(merged);
                                savePublishedCache(slug, merged).catch(() => {});
                                setLoading(false);
                                return { success: true, portfolio: merged };
                            }
                        }
                    } catch (err) {}
                }
            }

            setLoading(false);
            return {
                success: false,
                error: `No portfolio configuration found for "${slug}". If this is your portfolio, open the builder to publish and share a fresh link.`
            };
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Failed to load published portfolio.');
            return { success: false, error: err.message };
        }
    }, []);

    const restorePersonalDraft = useCallback(async (targetUsername = null) => {
        setIsPublicMode(false);
        const user = targetUsername || portfolio?.username || initialUsername;
        let draft = await loadDraftFromStorage(user);
        if (!draft && !targetUsername) {
            draft = await loadLatestDraftFromStorage();
        }
        if (draft) {
            setPortfolio(prev => ({
                ...DEFAULT_PORTFOLIO,
                ...draft
            }));
            return draft;
        }
        await loadPortfolio(user);
    }, [initialUsername, loadPortfolio, portfolio?.username]);

    const exportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolio, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${portfolio.username || 'portfolio'}_config.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const importJSON = (jsonString) => {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.username) {
                parsed.username = 'imported_portfolio';
            }
            pushHistoryState(portfolioRef.current, 'import_json', true);
            setPortfolio(parsed);
            setSuccess('Portfolio configuration imported successfully!');
            setTimeout(() => setSuccess(null), 2000);
        } catch (e) {
            setError('Invalid JSON configuration file.');
            setTimeout(() => setError(null), 2500);
        }
    };

    return (
        <PortfolioContext.Provider
            value={{
                portfolio,
                setPortfolio,
                updateField,
                resetSection,
                resetAllToDemo,
                savePortfolio,
                loadPortfolio,
                allPortfolios,
                fetchPortfoliosList,
                createNewPortfolio,
                exportJSON,
                importJSON,
                publishPortfolio,
                loadPublishedPortfolio,
                isSupabaseConfigured,
                savePortfolioToSupabase,
                restorePersonalDraft,
                isPublicMode,
                setIsPublicMode,
                publishedSlug,
                publishedUrl,
                loading,
                saving,
                error,
                setError,
                success,
                setSuccess,
                previewMode,
                setPreviewMode,
                deviceMode,
                setDeviceMode,
                activeSection,
                setActiveSection,
                // Session saving & restore capabilities
                undo,
                redo,
                canUndo,
                canRedo,
                sessionSnapshots,
                restoreSessionSnapshot,
                saveManualCheckpoint,
                restoreLastSession,
                clearSessionHistory,
                recoveredSessionNotice,
                setRecoveredSessionNotice,
            }}
        >
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
};

export default PortfolioContext;
