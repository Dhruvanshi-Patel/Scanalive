// Mock Auth service for demo mode testing without live Supabase credentials
const DEMO_USER_KEY = 'MOCK_AR_USER';
const DEMO_LOGS_KEY = 'MOCK_LOGIN_LOGS';
const DEMO_MEDIA_KEY = 'MOCK_MEDIA_ASSETS';

export const getMockSession = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
};

export const setMockSession = (email) => {
  const user = {
    id: 'usr_' + Math.random().toString(36).substring(2, 11),
    email: email,
    created_at: new Date().toISOString(),
    user_metadata: { name: email.split('@')[0] }
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  addMockLoginLog(user);
  return user;
};

export const clearMockSession = () => {
  localStorage.removeItem(DEMO_USER_KEY);
};

export const getMockLoginLogs = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DEMO_LOGS_KEY);
  if (!stored) return getInitialDefaultLogs();
  try {
    return JSON.parse(stored);
  } catch (e) {
    return getInitialDefaultLogs();
  }
};

export const addMockLoginLog = (user) => {
  const logs = getMockLoginLogs();
  const newLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 11),
    user_id: user.id,
    email: user.email,
    logged_at: new Date().toISOString(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
  };
  const updated = [newLog, ...logs];
  localStorage.setItem(DEMO_LOGS_KEY, JSON.stringify(updated));
  return updated;
};

// Media assets helper
export const getMockMediaAssets = () => {
  if (typeof window === 'undefined') return getDefaultMediaAssets();
  const stored = localStorage.getItem(DEMO_MEDIA_KEY);
  if (!stored) return getDefaultMediaAssets();
  try {
    return JSON.parse(stored);
  } catch (e) {
    return getDefaultMediaAssets();
  }
};

export const addMockMediaAsset = (asset) => {
  const assets = getMockMediaAssets();
  const newAsset = {
    id: 'media_' + Math.random().toString(36).substring(2, 11),
    ...asset,
    created_at: new Date().toISOString()
  };
  const updated = [newAsset, ...assets];
  localStorage.setItem(DEMO_MEDIA_KEY, JSON.stringify(updated));
  return updated;
};

function getDefaultMediaAssets() {
  return [
    {
      id: 'media_sample_video',
      title: '3D Holographic Showcase Video',
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      media_type: 'video',
      target_index: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 'media_sample_photo',
      title: 'Neon Cyberpunk Artwork Photo',
      media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      media_type: 'image',
      target_index: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function getInitialDefaultLogs() {
  return [
    {
      id: 'log_seed1',
      user_id: 'usr_8923a1',
      email: 'alex.ar@example.com',
      logged_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
    },
    {
      id: 'log_seed2',
      user_id: 'usr_4412b9',
      email: 'dev.scanner@arvision.io',
      logged_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  ];
}
