
const DB_NAME = 'StandOutDB';
const DB_VERSION = 1;
const STORE_DRAFTS = 'portfolio_drafts';
const STORE_PUBLISHED = 'published_cache';

let dbPromise = null;

export const isLegacyOrPersonalIdentifier = (text) => {
    if (!text) return false;
    const str = typeof text === 'string' ? text : JSON.stringify(text);
    const lower = str.toLowerCase();
    return (
        lower.includes('sonali') ||
        lower.includes('duvesh') ||
        lower.includes('garvit') ||
        lower.includes('iitm') ||
        lower.includes('iit madras')
    );
};

export const sanitizeStorage = () => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (isLegacyOrPersonalIdentifier(key)) {
                toRemove.push(key);
                continue;
            }
            const val = localStorage.getItem(key);
            if (val && isLegacyOrPersonalIdentifier(val)) {
                toRemove.push(key);
            }
        }
        toRemove.forEach((k) => {
            try {
                localStorage.removeItem(k);
            } catch (e) {}
        });

        const pubSlug = localStorage.getItem('my_published_portfolio_slug');
        if (pubSlug && isLegacyOrPersonalIdentifier(pubSlug)) {
            localStorage.removeItem('my_published_portfolio_slug');
            localStorage.removeItem('my_published_portfolio_url');
        }

        const lastUser = localStorage.getItem('portfolio_last_active_user');
        if (lastUser && isLegacyOrPersonalIdentifier(lastUser)) {
            localStorage.removeItem('portfolio_last_active_user');
        }
    } catch (e) {
        console.warn('Storage sanitization note:', e);
    }
};

export const cleanIndexedDBPersonalData = async () => {
    try {
        const db = await getIndexedDB();
        if (!db) return;
        const tx = db.transaction([STORE_DRAFTS, STORE_PUBLISHED], 'readwrite');
        const draftStore = tx.objectStore(STORE_DRAFTS);
        const pubStore = tx.objectStore(STORE_PUBLISHED);

        const draftReq = draftStore.getAll();
        draftReq.onsuccess = () => {
            const drafts = draftReq.result || [];
            drafts.forEach((d) => {
                if (isLegacyOrPersonalIdentifier(d)) {
                    if (d.username) draftStore.delete(d.username);
                }
            });
        };

        const pubReq = pubStore.getAll();
        pubReq.onsuccess = () => {
            const pubs = pubReq.result || [];
            pubs.forEach((p) => {
                if (isLegacyOrPersonalIdentifier(p)) {
                    if (p.slug) pubStore.delete(p.slug);
                }
            });
        };
    } catch (e) {
        console.warn('IndexedDB cleanup note:', e);
    }
};

export const getIndexedDB = () => {
    if (typeof window === 'undefined' || !window.indexedDB) {
        return Promise.resolve(null);
    }
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve) => {
        try {
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
                    db.createObjectStore(STORE_DRAFTS, { keyPath: 'username' });
                }
                if (!db.objectStoreNames.contains(STORE_PUBLISHED)) {
                    db.createObjectStore(STORE_PUBLISHED, { keyPath: 'slug' });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.warn('IndexedDB open error, falling back to LocalStorage:', event.target.error);
                resolve(null);
            };
        } catch (e) {
            console.warn('IndexedDB exception, falling back to LocalStorage:', e);
            resolve(null);
        }
    });

    return dbPromise;
};

export const saveDraftToStorage = async (username, portfolioData) => {
    if (!username || !portfolioData) return false;
    const cleanUser = username.trim().toLowerCase();
    const payload = {
        ...portfolioData,
        username: cleanUser,
        _updatedAt: Date.now(),
    };

    try {
        const serialized = JSON.stringify(payload);
        localStorage.setItem(`portfolio_draft_${cleanUser}`, serialized);
        localStorage.setItem('portfolio_draft_latest', serialized);
        localStorage.setItem('portfolio_last_active_user', cleanUser);
    } catch (e) {
        console.warn('LocalStorage draft write warning (possibly quota):', e.message);
    }

    try {
        const db = await getIndexedDB();
        if (db) {
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_DRAFTS, 'readwrite');
                const store = tx.objectStore(STORE_DRAFTS);
                const req = store.put(payload);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        }
    } catch (e) {
        console.warn('IndexedDB saveDraft error:', e);
    }

    return true;
};

export const loadDraftFromStorage = async (username) => {
    if (!username || isLegacyOrPersonalIdentifier(username)) return null;
    const cleanUser = username.trim().toLowerCase();

    try {
        const db = await getIndexedDB();
        if (db) {
            const result = await new Promise((resolve) => {
                const tx = db.transaction(STORE_DRAFTS, 'readonly');
                const store = tx.objectStore(STORE_DRAFTS);
                const req = store.get(cleanUser);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
            if (result && !isLegacyOrPersonalIdentifier(result)) return result;
        }
    } catch (e) {
        console.warn('IndexedDB loadDraft error:', e);
    }

    try {
        const raw = localStorage.getItem(`portfolio_draft_${cleanUser}`) || localStorage.getItem('portfolio_draft_latest');
        if (raw && !isLegacyOrPersonalIdentifier(raw)) return JSON.parse(raw);
    } catch (e) {}

    return null;
};

export const loadLatestDraftFromStorage = async () => {
    const lastUser = (typeof localStorage !== 'undefined') ? localStorage.getItem('portfolio_last_active_user') : null;
    if (lastUser && !isLegacyOrPersonalIdentifier(lastUser)) {
        const draft = await loadDraftFromStorage(lastUser);
        if (draft && !isLegacyOrPersonalIdentifier(draft)) return draft;
    }

    try {
        const db = await getIndexedDB();
        if (db) {
            const allDrafts = await new Promise((resolve) => {
                const tx = db.transaction(STORE_DRAFTS, 'readonly');
                const store = tx.objectStore(STORE_DRAFTS);
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            });
            const validDrafts = (allDrafts || []).filter(d => d && !isLegacyOrPersonalIdentifier(d));
            if (validDrafts.length > 0) {
                validDrafts.sort((a, b) => (b._updatedAt || 0) - (a._updatedAt || 0));
                return validDrafts[0];
            }
        }
    } catch (e) {}

    try {
        const raw = localStorage.getItem('portfolio_draft_latest');
        if (raw && !isLegacyOrPersonalIdentifier(raw)) return JSON.parse(raw);
    } catch (e) {}

    return null;
};

export const savePublishedCache = async (slug, portfolioData) => {
    if (!slug || !portfolioData) return false;
    const cleanSlug = slug.trim().toLowerCase();
    const payload = {
        ...portfolioData,
        slug: cleanSlug,
        _cachedAt: Date.now(),
    };

    try {
        localStorage.setItem(`published_portfolio_${cleanSlug}`, JSON.stringify(payload));
    } catch (e) {}

    try {
        const db = await getIndexedDB();
        if (db) {
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_PUBLISHED, 'readwrite');
                const store = tx.objectStore(STORE_PUBLISHED);
                const req = store.put(payload);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        }
    } catch (e) {}

    return true;
};

export const loadPublishedCache = async (slug) => {
    if (!slug) return null;
    const cleanSlug = slug.trim().toLowerCase();

    try {
        const db = await getIndexedDB();
        if (db) {
            const cached = await new Promise((resolve) => {
                const tx = db.transaction(STORE_PUBLISHED, 'readonly');
                const store = tx.objectStore(STORE_PUBLISHED);
                const req = store.get(cleanSlug);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
            if (cached) return cached;
        }
    } catch (e) {}

    try {
        const raw = localStorage.getItem(`published_portfolio_${cleanSlug}`);
        if (raw) return JSON.parse(raw);
    } catch (e) {}

    return null;
};
