import { INITIAL_WALLPAPERS } from '../data/initialWallpapers';

const STORAGE_KEYS = {
  WALLPAPERS: 'yestalgia_custom_wallpapers',
  CLOUD_CACHE: 'astiwalls_cloud_wallpapers',
  LIKES: 'yestalgia_user_likes',
  DOWNLOADS: 'yestalgia_user_downloads',
  FIREBASE_CONFIG: 'yestalgia_firebase_custom_config',
};

// Get all wallpapers (Initial Curated + Cloud Cache + Local Custom)
export const getAllWallpapers = () => {
  try {
    const cloud = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLOUD_CACHE) || '[]');
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLPAPERS) || '[]');
    
    // Deduplicate by ID
    const map = new Map();
    [...cloud, ...custom, ...INITIAL_WALLPAPERS].forEach((item) => {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  } catch (e) {
    console.error('Failed to load wallpapers:', e);
    return INITIAL_WALLPAPERS;
  }
};

export const getLocalWallpapers = getAllWallpapers;

// Save a new uploaded wallpaper locally
export const saveUploadedWallpaper = (newWallpaper) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLPAPERS) || '[]');
    const updated = [newWallpaper, ...existing.filter((w) => w.id !== newWallpaper.id)];
    localStorage.setItem(STORAGE_KEYS.WALLPAPERS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save wallpaper locally:', e);
    return [];
  }
};

// Delete user uploaded wallpaper locally
export const deleteUserWallpaper = (id) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLPAPERS) || '[]');
    const updated = existing.filter((wp) => wp.id !== id);
    localStorage.setItem(STORAGE_KEYS.WALLPAPERS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete wallpaper:', e);
    return [];
  }
};

// Get user liked IDs
export const getLikedWallpaperIds = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES) || '[]');
  } catch (e) {
    return [];
  }
};

// Toggle like for a wallpaper
export const toggleLikeWallpaper = (wallpaperId) => {
  try {
    const likes = getLikedWallpaperIds();
    let updated;
    const isLiked = likes.includes(wallpaperId);
    if (isLiked) {
      updated = likes.filter((id) => id !== wallpaperId);
    } else {
      updated = [...likes, wallpaperId];
    }
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(updated));
    return { updatedLikes: updated, isLiked: !isLiked };
  } catch (e) {
    console.error('Failed to toggle like:', e);
    return { updatedLikes: [], isLiked: false };
  }
};

// Track download
export const recordDownload = (wallpaperId) => {
  try {
    const downloads = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOWNLOADS) || '{}');
    downloads[wallpaperId] = (downloads[wallpaperId] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
    return downloads[wallpaperId];
  } catch (e) {
    return 1;
  }
};

// Save/Get custom Firebase config
export const getCustomFirebaseConfig = () => {
  try {
    const cfg = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    return cfg ? JSON.parse(cfg) : null;
  } catch (e) {
    return null;
  }
};

export const saveCustomFirebaseConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
  }
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
};
