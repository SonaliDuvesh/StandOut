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
    const sanitized = sanitizePortfolioForExport({
        ...portfolio,
        published_slug: slug,
    });

    const jsonString = JSON.stringify(sanitized);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    const compressed = deflate(utf8Bytes, { level: 9 });
    const payload = uint8ToBase64Url(compressed);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
    const path = `/p/${slug}`;
    const fullUrl = `${origin}${path}#data=${payload}`;

    const assetCheck = checkLargeAssets(portfolio);

    return {
        slug,
        payload,
        fullUrl,
        rawBytes: utf8Bytes.length,
        compressedBytes: compressed.length,
        payloadLength: payload.length,
        fullUrlLength: fullUrl.length,
        isOverRecommendedLength: fullUrl.length > 24000,
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

        const merged = {
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
            skills: Array.isArray(parsed.skills) ? parsed.skills : (DEFAULT_PORTFOLIO.skills || []),
            about_highlights: Array.isArray(parsed.about_highlights) ? parsed.about_highlights : (DEFAULT_PORTFOLIO.about_highlights || []),
            education: Array.isArray(parsed.education) ? parsed.education : (DEFAULT_PORTFOLIO.education || []),
        };

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
