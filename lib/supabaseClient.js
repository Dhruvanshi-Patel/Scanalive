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

/**
 * Upload a media file (video or photo) to Supabase Storage ('ar-media' bucket)
 */
export const uploadMediaToSupabase = async (file, user) => {
  if (!file) return { error: 'No file selected' };
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${user?.id || 'public'}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('ar-media')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.warn('Storage upload note:', error.message);
      return { error: error.message };
    }

    // Get public accessible URL for sharing
    const { data: publicUrlData } = supabase.storage
      .from('ar-media')
      .getPublicUrl(filePath);

    return { publicUrl: publicUrlData.publicUrl, filePath };
  } catch (err) {
    console.error('Storage upload error:', err);
    return { error: err.message };
  }
};

/**
 * Save media asset metadata into public.media_assets table
 */
export const saveMediaAssetRecord = async ({ user_id, target_index = 0, title, media_url, media_type }) => {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .insert([{
        user_id,
        target_index,
        title,
        media_url,
        media_type,
        created_at: new Date().toISOString()
      }])
      .select();

    return { data, error };
  } catch (err) {
    return { error: err.message };
  }
};

/**
 * Fetch public shared media assets
 */
export const fetchSharedMediaAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
};
