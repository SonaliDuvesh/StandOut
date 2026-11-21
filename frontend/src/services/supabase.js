import { createClient } from '@supabase/supabase-js';

// Vite replaces `import.meta.env.VITE_*` and `__SUPABASE_*__` statically at build time.
const envUrl = (
    (typeof __SUPABASE_URL__ !== 'undefined' && __SUPABASE_URL__) ||
    (typeof import.meta !== 'undefined' && import.meta.env && (
        import.meta.env.URL ||
        import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_PROJECT_URL ||
        import.meta.env.VITE_PUBLIC_SUPABASE_URL
    )) ||
    ''
);

const envKey = (
    (typeof __SUPABASE_KEY__ !== 'undefined' && __SUPABASE_KEY__) ||
    (typeof import.meta !== 'undefined' && import.meta.env && (
        import.meta.env.key ||
        import.meta.env.KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_KEY ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
    )) ||
    ''
);

// Allow runtime configuration from localStorage if user enters it in settings or modal
export const getStoredConfig = () => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const url = localStorage.getItem('standout_supabase_url');
            const key = localStorage.getItem('standout_supabase_key');
            if (url && key) return { url, key };
        }
    } catch (e) {}
    return { url: '', key: '' };
};

export const getEffectiveCredentials = () => {
    const stored = getStoredConfig();
    const url = (envUrl || stored.url || '').trim();
    const key = (envKey || stored.key || '').trim();
    return { url, key };
};

let clientInstance = null;

export const getSupabaseClient = () => {
    const { url, key } = getEffectiveCredentials();
    if (!url || !key) return null;

    if (!clientInstance || clientInstance.supabaseUrl !== url) {
        try {
            clientInstance = createClient(url, key, {
                auth: { persistSession: false },
            });
        } catch (err) {
            console.warn('Failed to initialize Supabase client:', err.message);
            clientInstance = null;
        }
    }
    return clientInstance;
};

export const isSupabaseConfigured = () => {
    const { url, key } = getEffectiveCredentials();
    return Boolean(url && key);
};

export const testSupabaseConnection = async () => {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase credentials not configured' };
    try {
        const { error } = await client.from('published_portfolios').select('id').limit(1);
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

/**
 * Generate a clean, secure 6-character user passkey (e.g. STAND-7K9W2P)
 */
export const generatePasskey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const array = new Uint8Array(6);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
        for (let i = 0; i < 6; i++) {
            code += chars[array[i] % chars.length];
        }
    } else {
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return `STAND-${code}`;
};

/**
 * Hash passkey using SHA-256 for secure online database verification
 */
export const hashPasskey = async (passkey) => {
    if (!passkey) return '';
    const clean = String(passkey).trim().toUpperCase();
    if (!clean) return '';
    try {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const msgUint8 = new TextEncoder().encode(clean);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) {}
    // Fallback deterministic hash
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
        hash = ((hash << 5) - hash) + clean.charCodeAt(i);
        hash |= 0;
    }
    return 'fb_' + Math.abs(hash).toString(16);
};

export const getStoredPasskey = (identifier) => {
    if (typeof localStorage === 'undefined' || !identifier) return '';
    const clean = String(identifier).trim().toLowerCase();
    return localStorage.getItem(`standout_passkey_${clean}`) || '';
};

export const setStoredPasskey = (identifier, passkey) => {
    if (typeof localStorage === 'undefined' || !identifier || !passkey) return;
    const clean = String(identifier).trim().toLowerCase();
    localStorage.setItem(`standout_passkey_${clean}`, String(passkey).trim().toUpperCase());
};

/**
 * Save / upsert a portfolio snapshot into Supabase online database with passkey protection
 */
export const savePortfolioToSupabase = async (identifier, portfolioData, customPasskey = null) => {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('[StandOut Supabase] Supabase is not connected. (URL or key is missing in environment)');
        return { success: false, error: 'Supabase credentials not configured or not loaded in build' };
    }
    if (!portfolioData) return { success: false, error: 'No portfolio data to save' };

    // Determine the user's clean username
    const currentName = (portfolioData.display_name || portfolioData.full_name || '').trim();
    let assignedUsername = (portfolioData.username || identifier || '').trim().toLowerCase();
    if ((!assignedUsername || assignedUsername === 'username' || assignedUsername === 'default') && currentName && currentName !== 'Developer Name') {
        assignedUsername = currentName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').replace(/-+/g, '-');
    }
    if (!assignedUsername) assignedUsername = 'default';

    const primarySlug = (
        portfolioData.published_slug ||
        identifier ||
        assignedUsername
    ).trim().toLowerCase();

    // Determine passkey: user provided > localStorage > generate new passkey
    let activePasskey = (
        customPasskey ||
        getStoredPasskey(primarySlug) ||
        getStoredPasskey(assignedUsername) ||
        ''
    ).trim().toUpperCase();

    let isNewPasskey = false;
    if (!activePasskey) {
        activePasskey = generatePasskey();
        isNewPasskey = true;
    }

    // Save active passkey locally so owner stays unlocked on this device
    setStoredPasskey(primarySlug, activePasskey);
    if (assignedUsername && assignedUsername !== 'default') {
        setStoredPasskey(assignedUsername, activePasskey);
    }

    const passkeyHash = await hashPasskey(activePasskey);

    // Ensure portfolioData has the latest username assigned
    const finalData = {
        ...portfolioData,
        username: assignedUsername,
        published_slug: portfolioData.published_slug || primarySlug,
    };

    console.log('[StandOut Supabase] Saving portfolio with passkey verification...', {
        slug: primarySlug,
        username: assignedUsername,
        hasPasskey: Boolean(activePasskey),
    });

    try {
        const rowsToSave = [
            {
                slug: primarySlug,
                username: assignedUsername,
                portfolio_data: finalData,
            }
        ];

        if (assignedUsername && assignedUsername !== primarySlug && assignedUsername !== 'default') {
            rowsToSave.push({
                slug: assignedUsername,
                username: assignedUsername,
                portfolio_data: finalData,
            });
        }

        const normalized = assignedUsername.replace(/[-_]/g, '');
        if (normalized && normalized !== assignedUsername && normalized !== primarySlug) {
            rowsToSave.push({
                slug: normalized,
                username: assignedUsername,
                portfolio_data: finalData,
            });
        }

        let lastError = null;
        for (const row of rowsToSave) {
            // First try secure PostgreSQL RPC function if installed
            const { data: rpcData, error: rpcError } = await client.rpc('save_portfolio_with_passkey', {
                p_slug: row.slug,
                p_username: row.username,
                p_data: row.portfolio_data,
                p_passkey_hash: passkeyHash,
            });

            if (!rpcError) {
                continue;
            }

            // If RPC reported a passkey mismatch, halt and return unauthorized
            if (rpcError.message && rpcError.message.includes('PASSKEY_MISMATCH')) {
                return {
                    success: false,
                    error: 'Unauthorized: Incorrect Edit Passkey. You cannot overwrite this portfolio without the owner passkey.',
                    needsPasskey: true,
                    slug: primarySlug,
                };
            }

            // Fallback for direct table upsert if RPC function is not yet created in SQL
            const { data: existingRecord } = await client
                .from('published_portfolios')
                .select('passkey_hash')
                .eq('slug', row.slug)
                .maybeSingle();

            if (existingRecord && existingRecord.passkey_hash && existingRecord.passkey_hash !== passkeyHash) {
                return {
                    success: false,
                    error: 'Unauthorized: Incorrect Edit Passkey. Enter your secret passkey to update this portfolio.',
                    needsPasskey: true,
                    slug: primarySlug,
                };
            }

            const { error: upsertError } = await client
                .from('published_portfolios')
                .upsert({
                    slug: row.slug,
                    username: row.username,
                    portfolio_data: row.portfolio_data,
                    passkey_hash: existingRecord?.passkey_hash || passkeyHash,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'slug' });

            if (upsertError) {
                lastError = upsertError;
                console.error(`[StandOut Supabase] Save error for slug="${row.slug}":`, upsertError.message);
            }
        }

        if (lastError) {
            return { success: false, error: lastError.message };
        }

        console.log('[StandOut Supabase] ✅ Successfully saved to Supabase with passkey protection! Passkey:', activePasskey);
        return {
            success: true,
            slug: primarySlug,
            username: assignedUsername,
            passkey: activePasskey,
            isNewPasskey,
        };
    } catch (err) {
        console.error('[StandOut Supabase] Save exception:', err.message || err);
        return { success: false, error: err.message || 'Network or database error' };
    }
};

/**
 * Retrieve a portfolio snapshot from Supabase by slug, username
 * NOTE: When identifier is null, empty, or 'username', returns null so the root page ALWAYS shows default showcase template.
 */
export const getPortfolioFromSupabase = async (identifier) => {
    const client = getSupabaseClient();
    if (!client) return null;

    const clean = (identifier || '').trim().toLowerCase();

    // If no specific username/slug was requested, return null so clean default template is used
    if (!clean || clean === 'username' || clean === 'default') {
        return null;
    }

    try {
        // 1. Check exact slug
        let { data, error } = await client
            .from('published_portfolios')
            .select('portfolio_data')
            .eq('slug', clean)
            .maybeSingle();

        if (data && data.portfolio_data) {
            return data.portfolio_data;
        }

        // 2. Check exact username
        const userRes = await client
            .from('published_portfolios')
            .select('portfolio_data')
            .eq('username', clean)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (userRes.data && userRes.data.portfolio_data) {
            return userRes.data.portfolio_data;
        }

        // 3. Check normalized without hyphens / underscores
        const normalized = clean.replace(/[-_]/g, '');
        if (normalized && normalized !== clean) {
            const normRes = await client
                .from('published_portfolios')
                .select('portfolio_data')
                .or(`slug.eq.${normalized},username.eq.${normalized}`)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (normRes.data && normRes.data.portfolio_data) {
                return normRes.data.portfolio_data;
            }
        }

        // 4. Check without randomized suffix (e.g. "sonali-a1b2" -> "sonali")
        const base = clean.replace(/-[a-z0-9]{3,5}$/, '');
        if (base && base !== clean) {
            const baseRes = await client
                .from('published_portfolios')
                .select('portfolio_data')
                .or(`slug.eq.${base},username.eq.${base}`)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (baseRes.data && baseRes.data.portfolio_data) {
                return baseRes.data.portfolio_data;
            }
        }
    } catch (err) {
        console.warn('Supabase fetch exception:', err.message);
    }
    return null;
};

/**
 * Retrieve the most recently updated portfolio from Supabase
 */
export const getLatestPortfolioFromSupabase = async () => {
    return getPortfolioFromSupabase(null);
};

/**
 * List all portfolios saved in Supabase
 */
export const listPortfoliosFromSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
        const { data, error } = await client
            .from('published_portfolios')
            .select('slug, username, updated_at, portfolio_data')
            .order('updated_at', { ascending: false });

        if (error) {
            console.warn('Supabase list note:', error.message);
            return [];
        }

        return (data || []).map(row => ({
            username: row.username || row.slug,
            slug: row.slug,
            full_name: row.portfolio_data?.full_name || row.portfolio_data?.display_name || row.username,
            title: row.portfolio_data?.title || '',
            updated_at: row.updated_at,
        }));
    } catch (err) {
        console.warn('Supabase list error:', err.message);
        return [];
    }
};

export const setSupabaseCredentials = (url, key) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            if (url && key) {
                localStorage.setItem('standout_supabase_url', url.trim());
                localStorage.setItem('standout_supabase_key', key.trim());
            } else {
                localStorage.removeItem('standout_supabase_url');
                localStorage.removeItem('standout_supabase_key');
            }
            clientInstance = null;
        }
    } catch (e) {}
};
