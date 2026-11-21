import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const parentEnv = loadEnv(mode, '..', '');

  // Catch Supabase URL under any variable name provided in Vercel or .env
  const supabaseUrl = (
    process.env.URL ||
    process.env.url ||
    env.URL ||
    env.url ||
    parentEnv.URL ||
    parentEnv.url ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_PROJECT_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    parentEnv.VITE_SUPABASE_URL ||
    parentEnv.SUPABASE_URL ||
    ''
  ).trim();

  // Catch Supabase Key under any variable name provided in Vercel or .env
  const supabaseKey = (
    process.env.key ||
    process.env.KEY ||
    env.key ||
    env.KEY ||
    parentEnv.key ||
    parentEnv.KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    parentEnv.VITE_SUPABASE_ANON_KEY ||
    parentEnv.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  return {
    plugins: [react()],
    define: {
      '__SUPABASE_URL__': JSON.stringify(supabaseUrl),
      '__SUPABASE_KEY__': JSON.stringify(supabaseKey),
    },
    server: {
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/media': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      allowedHosts: true,
    },
  };
});
