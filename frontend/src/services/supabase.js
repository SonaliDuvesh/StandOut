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
 * Save / upsert a portfolio snapshot into Supabase online database
 */
export const savePortfolioToSupabase = async (identifier, portfolioData) => {
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

    // Ensure portfolioData has the latest username assigned
    const finalData = {
        ...portfolioData,
        username: assignedUsername,
        published_slug: portfolioData.published_slug || primarySlug,
    };

    console.log('[StandOut Supabase] Saving portfolio to Supabase table "published_portfolios"...', {
        slug: primarySlug,
        username: assignedUsername,
        name: finalData.full_name || finalData.display_name
    });

    try {
        const rowsToUpsert = [
            {
                slug: primarySlug,
                username: assignedUsername,
                portfolio_data: finalData,
                updated_at: new Date().toISOString(),
            }
        ];

        // Also upsert under the direct username slug if different from primarySlug
        if (assignedUsername && assignedUsername !== primarySlug && assignedUsername !== 'default') {
            rowsToUpsert.push({
                slug: assignedUsername,
                username: assignedUsername,
                portfolio_data: finalData,
                updated_at: new Date().toISOString(),
            });
        }

        // Also upsert normalized slug without hyphens/underscores (e.g. "sonali-duvesh" -> "sonaliduvesh")
        const normalized = assignedUsername.replace(/[-_]/g, '');
        if (normalized && normalized !== assignedUsername && normalized !== primarySlug) {
            rowsToUpsert.push({
                slug: normalized,
                username: assignedUsername,
                portfolio_data: finalData,
                updated_at: new Date().toISOString(),
            });
        }

        let lastError = null;
        for (const row of rowsToUpsert) {
            const { error } = await client
                .from('published_portfolios')
                .upsert(row, { onConflict: 'slug' });
            if (error) {
                lastError = error;
                console.error(`[StandOut Supabase] Error saving row slug="${row.slug}":`, error.message);
            }
        }

        if (lastError) {
            return { success: false, error: lastError.message };
        }

        console.log('[StandOut Supabase] ✅ Successfully saved to Supabase! Rows:', rowsToUpsert.map(r => r.slug));
        return { success: true, slug: primarySlug, username: assignedUsername };
    } catch (err) {
        console.error('[StandOut Supabase] Save exception:', err.message || err);
        return { success: false, error: err.message || 'Network or database error' };
    }
};

/**
 * Retrieve a portfolio snapshot from Supabase by slug, username, or latest record
 */
export const getPortfolioFromSupabase = async (identifier) => {
    const client = getSupabaseClient();
    if (!client) return null;

    const clean = (identifier || '').trim().toLowerCase();

    try {
        // 1. If a specific identifier is provided (not 'username' / 'default')
        if (clean && clean !== 'username' && clean !== 'default') {
            // Check exact slug
            let { data, error } = await client
                .from('published_portfolios')
                .select('portfolio_data')
                .eq('slug', clean)
                .maybeSingle();

            if (data && data.portfolio_data) {
                return data.portfolio_data;
            }

            // Check exact username
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

            // Check normalized without hyphens / underscores
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

            // Check without randomized suffix (e.g. "sonali-a1b2" -> "sonali")
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
        }

        // 2. Fallback: retrieve the most recently updated portfolio in the database
        // (Enables visitors to see the published portfolio when opening root URL '/' or clean site)
        const latestRes = await client
            .from('published_portfolios')
            .select('portfolio_data')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (latestRes.data && latestRes.data.portfolio_data) {
            return latestRes.data.portfolio_data;
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
