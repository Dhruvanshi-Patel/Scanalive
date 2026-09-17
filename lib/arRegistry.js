import { supabase, isSupabaseConfigured } from './supabaseClient';

const GLOBAL_CATALOG_KEY = 'GLOBAL_AR_PAIRINGS_CATALOG';

/**
 * Community Seed Target-Video Pairings
 */
const DEFAULT_GLOBAL_PAIRS = [
  {
    id: 'pair_community_1',
    target_name: 'Sample AR Target Print #1',
    photo_url: '/targets/sample-target-1.png',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: '3D Holographic Showcase Video',
    creator: 'LiveMemories Official',
    target_index: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'pair_community_2',
    target_name: 'Wedding Memory Photo Frame',
    photo_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'First Dance Wedding Video',
    creator: 'Sarah & Mark',
    target_index: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'pair_community_3',
    target_name: 'Cyberpunk Artwork Canvas',
    photo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    title: 'Behind-the-Scenes Speedpaint',
    creator: 'Alex Art Studio',
    target_index: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
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

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(GLOBAL_CATALOG_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  return DEFAULT_GLOBAL_PAIRS;
};

/**
 * Register a new Photo + Video pair globally
 */
export const registerGlobalARPairing = async ({ photoUrl, videoUrl, title }) => {
  const newPair = {
    id: 'pair_' + Math.random().toString(36).substring(2, 11),
    target_name: title || 'Custom AR Target Photo',
    photo_url: photoUrl,
    video_url: videoUrl,
    title: title || 'Augmented Video Overlay',
    creator: 'Community Creator',
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

  if (typeof window !== 'undefined') {
    const existing = await getGlobalARPairings();
    const updated = [newPair, ...existing];
    localStorage.setItem(GLOBAL_CATALOG_KEY, JSON.stringify(updated));
    return updated;
  }

  return [newPair];
};

/**
 * Delete a Photo + Video pair
 */
export const removeGlobalARPairing = async (pairId) => {
  const supabaseActive = isSupabaseConfigured();
  if (supabaseActive && pairId) {
    try {
      await supabase.from('media_assets').delete().eq('id', pairId);
    } catch (e) {
      console.warn('Supabase delete note:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const existing = await getGlobalARPairings();
    const updated = existing.filter(item => item.id !== pairId);
    localStorage.setItem(GLOBAL_CATALOG_KEY, JSON.stringify(updated));
    return updated;
  }

  return [];
};
