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

    const primarySlug = (
        portfolioData.published_slug ||
        identifier ||
        portfolioData.username ||
        'default'
    ).trim().toLowerCase();

    const username = (
        portfolioData.username ||
        identifier ||
        'default'
    ).trim().toLowerCase();

    console.log('[StandOut Supabase] Saving portfolio to Supabase table "published_portfolios"...', {
        slug: primarySlug,
        username,
        name: portfolioData.full_name || portfolioData.display_name
    });

    try {
        // Upsert by primary slug
        const { data, error } = await client
            .from('published_portfolios')
            .upsert(
                {
                    slug: primarySlug,
                    username: username,
                    portfolio_data: portfolioData,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'slug' }
            );

        if (error) {
            console.error('[StandOut Supabase] Save failed with error:', error.message, error);
            return { success: false, error: error.message };
        }

        console.log('[StandOut Supabase] ✅ Successfully saved to Supabase! Row slug:', primarySlug);

        // If username is distinct from slug and not 'username' / 'default', also upsert username key
        // so both /p/:slug and /:username can resolve immediately
        if (username && username !== primarySlug && username !== 'username' && username !== 'default') {
            await client
                .from('published_portfolios')
                .upsert(
                    {
                        slug: username,
                        username: username,
                        portfolio_data: portfolioData,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'slug' }
                );
        }

        return { success: true, slug: primarySlug };
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

            // Check without suffix (e.g. "sonali-a1b2" -> "sonali")
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
