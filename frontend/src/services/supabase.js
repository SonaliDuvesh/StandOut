import { createClient } from '@supabase/supabase-js';

const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : '';

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
        const { data, error } = await client.from('published_portfolios').select('id').limit(1);
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const savePortfolioToSupabase = async (slug, portfolioData) => {
    const client = getSupabaseClient();
    if (!client || !slug || !portfolioData) return false;

    const cleanSlug = slug.trim().toLowerCase();
    try {
        const { error } = await client
            .from('published_portfolios')
            .upsert(
                {
                    slug: cleanSlug,
                    username: portfolioData.username || cleanSlug,
                    portfolio_data: portfolioData,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'slug' }
            );

        if (error) {
            console.warn('Supabase publish note:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('Supabase publish exception:', err.message);
        return false;
    }
};

export const getPortfolioFromSupabase = async (slug) => {
    const client = getSupabaseClient();
    if (!client || !slug) return null;

    const cleanSlug = slug.trim().toLowerCase();
    try {
        const { data, error } = await client
            .from('published_portfolios')
            .select('portfolio_data')
            .eq('slug', cleanSlug)
            .maybeSingle();

        if (error) {
            console.warn('Supabase fetch note:', error.message);
            return null;
        }

        if (data && data.portfolio_data) {
            return data.portfolio_data;
        }
    } catch (err) {
        console.warn('Supabase fetch exception:', err.message);
    }
    return null;
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
