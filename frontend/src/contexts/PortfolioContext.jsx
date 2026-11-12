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
} from '../utils/portfolioStorage.js';

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
    const [activeSection, setActiveSection] = useState('home');

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

                const merged = {
                    ...DEFAULT_PORTFOLIO,
                    ...response.data,
                    ...(localDraft || {}),
                    appearance: {
                        ...DEFAULT_PORTFOLIO.appearance,
                        ...(response.data.appearance || {}),
                        ...(localDraft?.appearance || {})
                    },
                    sections_visibility: {
                        ...DEFAULT_PORTFOLIO.sections_visibility,
                        ...(response.data.sections_visibility || {}),
                        ...(localDraft?.sections_visibility || {})
                    },
                    custom_section: {
                        ...DEFAULT_PORTFOLIO.custom_section,
                        ...(response.data.custom_section || {}),
                        ...(localDraft?.custom_section || {})
                    },
                    social_links: {
                        ...DEFAULT_PORTFOLIO.social_links,
                        ...(response.data.social_links || {}),
                        ...(localDraft?.social_links || {})
                    },
                    home_typography: {
                        ...DEFAULT_PORTFOLIO.home_typography,
                        ...(response.data.home_typography || {}),
                        ...(localDraft?.home_typography || {})
                    },
                    background_settings: {
                        ...DEFAULT_PORTFOLIO.background_settings,
                        ...(response.data.background_settings || {}),
                        ...(localDraft?.background_settings || {})
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

        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const channel = new BroadcastChannel('portfolio_sync_channel');
                channel.postMessage({ type: 'PORTFOLIO_DRAFT_UPDATED', data: portfolio });
                channel.close();
            } catch (e) {}
        }
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
            setSuccess('Reset all portfolio sections to clean generic demo data!');
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
        setPublishedUrl(encodeResult.fullUrl);
        setPortfolio(currentWithSlug);

        saveDraftToStorage(currentWithSlug.username, currentWithSlug).catch(() => {});
        savePublishedCache(encodeResult.slug, currentWithSlug).catch(() => {});

        try {
            localStorage.setItem('my_published_portfolio_slug', encodeResult.slug);
            localStorage.setItem('my_published_portfolio_url', encodeResult.fullUrl);
        } catch (e) {
            console.warn('LocalStorage error on publish', e);
        }

        portfolioAPI.save(currentWithSlug.username, currentWithSlug).catch(() => {});

        return encodeResult;
    }, [portfolio, publishedSlug]);

    const loadPublishedPortfolio = useCallback(async (slug, urlOrHashString = null) => {
        setIsPublicMode(true);
        setLoading(true);
        setError(null);
        try {
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
                    const serverRes = await portfolioAPI.getByUsername(slug);
                    if (serverRes.data) {
                        const merged = { ...DEFAULT_PORTFOLIO, ...serverRes.data };
                        setPortfolio(merged);
                        savePublishedCache(slug, merged).catch(() => {});
                        setLoading(false);
                        return { success: true, portfolio: merged };
                    }
                } catch (e) {}
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
