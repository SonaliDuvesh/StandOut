import { deflate, inflate } from 'pako';
import { DEFAULT_PORTFOLIO } from '../contexts/defaultPortfolio.js';

export const nameToUsernameSlug = (name) => {
    if (!name || typeof name !== 'string') return 'username';
    const clean = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 24);
    return clean || 'username';
};

export const generatePortfolioSlug = (fullNameOrUsername) => {
    const raw = (fullNameOrUsername || 'user').trim();
    const firstToken = raw.split(/[\s_.-]+/)[0] || 'portfolio';
    const clean = firstToken
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 14) || 'user';

    const charset = 'abcdefghjkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
        rand += charset[Math.floor(Math.random() * charset.length)];
    }
    return `${clean}-${rand}`;
};

export const mergePortfolio = (parsed) => {
    if (!parsed || typeof parsed !== 'object') {
        return { ...DEFAULT_PORTFOLIO };
    }
    return {
        ...DEFAULT_PORTFOLIO,
        ...parsed,
        appearance: {
            ...DEFAULT_PORTFOLIO.appearance,
            ...(parsed.appearance || {})
        },
        sections_visibility: {
            ...DEFAULT_PORTFOLIO.sections_visibility,
            ...(parsed.sections_visibility || {})
        },
        custom_section: {
            ...DEFAULT_PORTFOLIO.custom_section,
            ...(parsed.custom_section || {})
        },
        social_links: {
            ...DEFAULT_PORTFOLIO.social_links,
            ...(parsed.social_links || {})
        },
        home_typography: {
            ...DEFAULT_PORTFOLIO.home_typography,
            ...(parsed.home_typography || {})
        },
        background_settings: {
            ...DEFAULT_PORTFOLIO.background_settings,
            ...(parsed.background_settings || {})
        },
        projects: Array.isArray(parsed.projects) ? parsed.projects : (DEFAULT_PORTFOLIO.projects || []),
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : (DEFAULT_PORTFOLIO.certifications || []),
        skills_categories: Array.isArray(parsed.skills_categories) ? parsed.skills_categories : (DEFAULT_PORTFOLIO.skills_categories || []),
        skills: Array.isArray(parsed.skills) ? parsed.skills : (DEFAULT_PORTFOLIO.skills || []),
        about_highlights: Array.isArray(parsed.about_highlights) ? parsed.about_highlights : (DEFAULT_PORTFOLIO.about_highlights || []),
        education: Array.isArray(parsed.education) ? parsed.education : (DEFAULT_PORTFOLIO.education || []),
    };
};

export const uint8ToBase64Url = (uint8Array) => {
    let binary = '';
    const CHUNK_SIZE = 8192;
    for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
        binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + CHUNK_SIZE));
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

export const base64UrlToUint8 = (base64UrlString) => {
    let base64 = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

const sanitizePortfolioForExport = (portfolio) => {
    const clone = JSON.parse(JSON.stringify(portfolio));
    delete clone.id;
    delete clone.created_at;
    delete clone.updated_at;
    return clone;
};

export const minimizePortfolio = (portfolio) => {
    if (!portfolio || typeof portfolio !== 'object') return portfolio;
    const sanitized = sanitizePortfolioForExport(portfolio);
    const min = {};

    for (const [key, val] of Object.entries(sanitized)) {
        if (val === null || val === undefined) continue;

        // Skip fields that are identical to the default template
        if (DEFAULT_PORTFOLIO && DEFAULT_PORTFOLIO[key] !== undefined) {
            try {
                if (JSON.stringify(val) === JSON.stringify(DEFAULT_PORTFOLIO[key])) {
                    continue;
                }
            } catch (e) {}
        }

        // For nested objects (appearance, sections_visibility, etc.), only keep customized keys
        if (
            typeof val === 'object' &&
            !Array.isArray(val) &&
            DEFAULT_PORTFOLIO &&
            DEFAULT_PORTFOLIO[key] &&
            typeof DEFAULT_PORTFOLIO[key] === 'object' &&
            !Array.isArray(DEFAULT_PORTFOLIO[key])
        ) {
            const nestedMin = {};
            let hasChanges = false;
            for (const [subKey, subVal] of Object.entries(val)) {
                if (subVal !== null && subVal !== undefined) {
                    if (JSON.stringify(subVal) !== JSON.stringify(DEFAULT_PORTFOLIO[key][subKey])) {
                        nestedMin[subKey] = subVal;
                        hasChanges = true;
                    }
                }
            }
            if (hasChanges) {
                min[key] = nestedMin;
            }
            continue;
        }

        min[key] = val;
    }

    // Always keep essential identity fields
    min.username = portfolio.username || 'username';
    min.full_name = portfolio.full_name || 'Developer Name';
    if (portfolio.display_name && portfolio.display_name !== min.full_name) {
        min.display_name = portfolio.display_name;
    }
    if (portfolio.published_slug) {
        min.published_slug = portfolio.published_slug;
    }

    return min;
};

export const checkLargeAssets = (portfolio) => {
    let largeAssetCount = 0;
    let approximateAssetBytes = 0;

    const inspectValue = (val) => {
        if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 4096) {
            largeAssetCount++;
            approximateAssetBytes += val.length;
        } else if (Array.isArray(val)) {
            val.forEach(inspectValue);
        } else if (val && typeof val === 'object') {
            Object.values(val).forEach(inspectValue);
        }
    };

    inspectValue(portfolio);
    return {
        hasLargeAssets: largeAssetCount > 0,
        largeAssetCount,
        approximateAssetBytes,
    };
};

export const encodePortfolioToUrl = (portfolio, existingSlug = null) => {
    const slug = existingSlug || portfolio.published_slug || generatePortfolioSlug(portfolio.full_name || portfolio.username);
    
    // Create ultra-compact delta payload (up to 95% smaller!)
    const minimized = minimizePortfolio({
        ...portfolio,
        published_slug: slug,
    });

    const jsonString = JSON.stringify(minimized);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    const compressed = deflate(utf8Bytes, { level: 9 });
    const payload = uint8ToBase64Url(compressed);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
    const path = `/p/${slug}`;
    
    // Clean, short URL (super concise, e.g. /p/alex-3x9a)
    const shortUrl = `${origin}${path}`;
    
    // Portable self-contained link with compressed delta hash
    const fullUrl = `${shortUrl}#data=${payload}`;

    const assetCheck = checkLargeAssets(portfolio);

    return {
        slug,
        payload,
        shortUrl,
        fullUrl,
        url: shortUrl, // Clean short URL is the primary export URL
        rawBytes: utf8Bytes.length,
        compressedBytes: compressed.length,
        payloadLength: payload.length,
        fullUrlLength: fullUrl.length,
        shortUrlLength: shortUrl.length,
        isOverRecommendedLength: fullUrl.length > 12000,
        assetCheck,
    };
};

export const decodePortfolioFromUrl = (urlOrHashString) => {
    if (!urlOrHashString || typeof urlOrHashString !== 'string') {
        return { success: false, error: 'No payload provided' };
    }

    try {
        let rawPayload = '';

        if (urlOrHashString.includes('#')) {
            const hashPart = urlOrHashString.split('#')[1] || '';
            if (hashPart.startsWith('data=')) {
                rawPayload = hashPart.slice(5);
            } else if (hashPart.includes('data=')) {
                const match = hashPart.match(/data=([A-Za-z0-9_-]+)/);
                if (match) rawPayload = match[1];
            } else if (hashPart.trim()) {
                rawPayload = hashPart.trim();
            }
        }

        if (!rawPayload && urlOrHashString.includes('?')) {
            const queryPart = urlOrHashString.split('?')[1]?.split('#')[0] || '';
            const params = new URLSearchParams(queryPart);
            rawPayload = params.get('data') || params.get('d') || '';
        }

        if (!rawPayload && /^[A-Za-z0-9_-]{20,}$/.test(urlOrHashString.trim())) {
            rawPayload = urlOrHashString.trim();
        }

        if (!rawPayload) {
            return { success: false, error: 'Could not extract portfolio data from URL' };
        }

        const compressedU8 = base64UrlToUint8(rawPayload);

        const decompressedU8 = inflate(compressedU8);
        const jsonString = new TextDecoder().decode(decompressedU8);
        const parsed = JSON.parse(jsonString);

        if (!parsed || typeof parsed !== 'object') {
            return { success: false, error: 'Parsed payload is not an object' };
        }

        const merged = mergePortfolio(parsed);

        return {
            success: true,
            portfolio: merged,
            slug: parsed.published_slug || null,
        };
    } catch (err) {
        console.error('Failed to decode portfolio from URL:', err);
        return {
            success: false,
            error: err.message || 'Malformed or corrupted portfolio URL payload',
        };
    }
};
