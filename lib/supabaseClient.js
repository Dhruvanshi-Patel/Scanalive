import { createClient } from '@supabase/supabase-js';

// Read environment variables or local storage overrides
const getSupabaseConfig = () => {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('CUSTOM_SUPABASE_URL');
    const customKey = localStorage.getItem('CUSTOM_SUPABASE_KEY');
    if (customUrl) url = customUrl;
    if (customKey) key = customKey;
  }

  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

// Fallback dummy values to prevent initialization crashes if env vars aren't set yet
const fallbackUrl = 'https://xyzcompany.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.dummyKey';

export const isSupabaseConfigured = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('CUSTOM_SUPABASE_URL');
    if (customUrl && customUrl.startsWith('https://')) return true;
  }
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://supabase.co' &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xyzcompany')
  );
};

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
);

/**
 * Record a login event into public.login_logs table in Supabase
 */
export const recordLoginAudit = async (user) => {
  if (!user || !user.id) return { error: null };

  const auditEntry = {
    user_id: user.id,
    email: user.email || 'anonymous@user.com',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
    logged_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('login_logs')
      .insert([auditEntry]);

    if (error) {
      console.warn('Supabase audit log insert note:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.error('Audit logging error:', err);
    return { error: err };
  }
};
