import { supabase, isSupabaseConfigured } from './supabaseClient';

const GLOBAL_CATALOG_KEY = 'GLOBAL_AR_PAIRINGS_CATALOG';

/**
 * Default Seed Target-Video Pairings
 */
const DEFAULT_GLOBAL_PAIRS = [
  {
    id: 'pair_default_1',
    target_name: 'Sample AR Print #1',
    photo_url: '/targets/sample-target-1.png',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Holographic Showcase Video',
    target_index: 0,
    created_at: new Date().toISOString()
  }
];

/**
 * Get all globally registered photo + video pairs
 */
export const getGlobalARPairings = async () => {
  const supabaseActive = isSupabaseConfigured();

  if (supabaseActive) {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch note:', e);
    }
  }

  // Fallback to central local catalog
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(GLOBAL_CATALOG_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }

  return DEFAULT_GLOBAL_PAIRS;
};

/**
 * Register a new Photo + Video pair globally in the catalog
 */
export const registerGlobalARPairing = async ({ photoUrl, videoUrl, title }) => {
  const newPair = {
    id: 'pair_' + Math.random().toString(36).substring(2, 11),
    target_name: title || 'Custom AR Target Photo',
    photo_url: photoUrl,
    video_url: videoUrl,
    title: title || 'Augmented Video Overlay',
    target_index: 0,
    created_at: new Date().toISOString()
  };

  const supabaseActive = isSupabaseConfigured();
  if (supabaseActive) {
    try {
      await supabase.from('media_assets').insert([{
        title: newPair.title,
        media_url: videoUrl,
        media_type: 'video',
        target_index: 0,
        created_at: newPair.created_at
      }]);
    } catch (e) {
      console.warn('Supabase insert note:', e);
    }
  }

  // Update central local catalog
  if (typeof window !== 'undefined') {
    const existing = await getGlobalARPairings();
    const updated = [newPair, ...existing];
    localStorage.setItem(GLOBAL_CATALOG_KEY, JSON.stringify(updated));
    return updated;
  }

  return [newPair];
};
