import { INITIAL_WALLPAPERS } from '../data/initialWallpapers';

const STORAGE_KEYS = {
  WALLPAPERS: 'yestalgia_custom_wallpapers',
  LIKES: 'yestalgia_user_likes',
  DOWNLOADS: 'yestalgia_user_downloads',
  FIREBASE_CONFIG: 'yestalgia_firebase_custom_config',
  ACTIVE_DEMO_USER: 'yestalgia_active_user',
};

// Get all wallpapers (Initial Curated + User Uploaded)
export const getAllWallpapers = () => {
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLPAPERS) || '[]');
    return [...custom, ...INITIAL_WALLPAPERS];
  } catch (e) {
    console.error('Failed to load custom wallpapers:', e);
    return INITIAL_WALLPAPERS;
  }
};

// Save a new uploaded wallpaper
export const saveUploadedWallpaper = (newWallpaper) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLPAPERS) || '[]');
    const updated = [newWallpaper, ...existing];
    localStorage.setItem(STORAGE_KEYS.WALLPAPERS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save wallpaper:', e);
    return [];
  }
};

// Delete user uploaded wallpaper
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
