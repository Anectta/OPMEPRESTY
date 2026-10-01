import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get config from env variables or custom saved credentials
const getSupabaseConfig = () => {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
  const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;

  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('presty_supabase_url') : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('presty_supabase_key') : null;

  const activeUrl = envUrl || customUrl || 'https://demo-presty-medick.supabase.co';
  const activeKey = envKey || customKey || 'demo-anon-key-presty-medick-1234567890';

  const isConfigured = Boolean(
    (envUrl && envKey && !envUrl.includes('demo-presty-medick') && !envUrl.includes('seu-projeto')) ||
    (customUrl && customKey && !customUrl.includes('demo-presty-medick') && !customUrl.includes('seu-projeto'))
  );

  return { url: activeUrl, key: activeKey, isConfigured };
};

export const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, isConfigured: IS_SUPABASE_CONFIGURED } = getSupabaseConfig();

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('presty_supabase_url', url.trim());
    localStorage.setItem('presty_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('presty_supabase_url');
    localStorage.removeItem('presty_supabase_key');
    window.location.reload();
  }
}
