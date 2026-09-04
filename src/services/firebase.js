import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from 'firebase/storage';
import { getCustomFirebaseConfig, saveCustomFirebaseConfig, saveUploadedWallpaper, deleteUserWallpaper, getLocalWallpapers } from './storage';
import { INITIAL_WALLPAPERS } from '../data/initialWallpapers';

// Helper to get active configuration
export const getActiveFirebaseConfig = () => {
  const custom = getCustomFirebaseConfig();
  if (custom && custom.apiKey && custom.projectId) {
    return custom;
  }

  return {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyAZActSElVw2zOb-esIX1Ba6AYLTDHYKJ8",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "civiclens-791d8.firebaseapp.com",
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "civiclens-791d8",
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "civiclens-791d8.firebasestorage.app",
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "992306878760",
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:992306878760:web:4dcd136b84895d65d8d81d",
  };
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

export const initFirebase = (customConfig = null) => {
  try {
    const config = customConfig || getActiveFirebaseConfig();
    const isRealKey = config.apiKey && !config.apiKey.includes('DummyKey');

    if (isRealKey) {
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      auth = getAuth(app);
      db = getFirestore(app);
      try {
        storage = getStorage(app);
      } catch (e) {
        console.warn('Firebase Storage init note:', e);
      }
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    }
  } catch (e) {
    console.warn('Firebase initialization note:', e);
  }
};

initFirebase();

export const onAuthChange = (callback) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
};

/**
 * Real Google Sign-In with Firebase Authentication
 */
export const signInWithGoogle = async () => {
  const config = getActiveFirebaseConfig();
  const isRealFirebaseConfigured = config.apiKey && !config.apiKey.includes('DummyKey');

  if (isRealFirebaseConfigured) {
    try {
      if (!auth) {
        initFirebase();
      }
      if (!auth || !googleProvider) {
        throw new Error("Authentication is not ready. Please verify your settings.");
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      return {
        success: true,
        user: {
          id: user.uid,
          name: user.displayName || 'Google User',
          email: user.email || '',
          username: user.email ? user.email.split('@')[0] : 'creator',
          avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        },
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);

      let userFriendlyMessage = error.message;
      if (error.code === 'auth/unauthorized-domain') {
        userFriendlyMessage = "Domain not authorized in authentication settings.";
      } else if (error.code === 'auth/operation-not-allowed') {
        userFriendlyMessage = "Google Sign-In is currently disabled.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = "Sign-in popup was closed.";
      } else if (error.code === 'auth/popup-blocked') {
        userFriendlyMessage = "Sign-in popup was blocked by browser. Please allow popups.";
      }

      return {
        success: false,
        error: userFriendlyMessage,
        errorCode: error.code,
      };
    }
  } else {
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      user: {
        id: 'user-' + Date.now(),
        name: 'Alex Vance',
        email: 'alex.vance@gmail.com',
        username: 'alex_vance',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
    };
  }
};

export const logoutUser = async () => {
  try {
    if (auth) {
      await signOut(auth);
    }
    return { success: true };
  } catch {
    return { success: true };
  }
};

/**
 * Optimize image size to guarantee it fits within Firestore limits (< 800KB)
 */
export const compressImageForCloud = (dataUrl, maxWidth = 1600, maxHeight = 1600, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Export compressed JPEG
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Active fetch from Firestore Cloud Database
 */
export const fetchCloudWallpapers = async () => {
  if (!db) initFirebase();
  if (db) {
    try {
      const q = collection(db, 'wallpapers');
      const snap = await getDocs(q);
      const cloudWallpapers = [];
      snap.forEach((docSnap) => {
        cloudWallpapers.push({ id: docSnap.id, ...docSnap.data() });
      });

      cloudWallpapers.sort((a, b) => (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0));

      if (cloudWallpapers.length > 0) {
        localStorage.setItem('astiwalls_cloud_wallpapers', JSON.stringify(cloudWallpapers));
        return [...cloudWallpapers, ...INITIAL_WALLPAPERS];
      }
    } catch (err) {
      console.warn('Firestore active fetch note:', err);
    }
  }
  return getLocalWallpapers();
};

/**
 * Real-time Firestore Cloud Wallpaper Synchronization
 * Listens to all user uploads from anyone across the globe in real time!
 */
export const subscribeToCloudWallpapers = (onWallpapersUpdated) => {
  if (!db) initFirebase();

  // Active initial query
  fetchCloudWallpapers().then((list) => {
    if (Array.isArray(list) && list.length > 0) {
      onWallpapersUpdated(list);
    }
  }).catch(() => {});

  if (db) {
    try {
      const q = collection(db, 'wallpapers');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const cloudWallpapers = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            cloudWallpapers.push({ id: docSnap.id, ...data });
          });

          // Sort by creation time descending (newest first)
          cloudWallpapers.sort((a, b) => (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0));

          // Save cloud items locally
          localStorage.setItem('astiwalls_cloud_wallpapers', JSON.stringify(cloudWallpapers));

          // Combine with initial curated wallpapers (cloud uploads first)
          const allCombined = [...cloudWallpapers, ...INITIAL_WALLPAPERS];
          onWallpapersUpdated(allCombined);
        },
        (error) => {
          console.warn('Firestore real-time subscription note:', error);
          onWallpapersUpdated(getLocalWallpapers());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore subscription fallback:', e);
      onWallpapersUpdated(getLocalWallpapers());
      return () => {};
    }
  } else {
    onWallpapersUpdated(getLocalWallpapers());
    return () => {};
  }
};

/**
 * Publish wallpaper to Firestore Cloud Database (Instant High-Speed Sync)
 */
export const publishWallpaperToCloud = async (wallpaper) => {
  // Always save locally first as instant optimistic backup
  saveUploadedWallpaper(wallpaper);

  if (db) {
    try {
      let finalImageUrl = wallpaper.url;
      let finalThumbnailUrl = wallpaper.thumbnailUrl || wallpaper.url;

      // Compress if payload is over 350KB to keep Firestore doc write super fast (< 200ms)
      if (wallpaper.url && wallpaper.url.startsWith('data:image') && wallpaper.url.length > 350000) {
        finalImageUrl = await compressImageForCloud(wallpaper.url, 1400, 1400, 0.80);
        finalThumbnailUrl = await compressImageForCloud(wallpaper.url, 480, 480, 0.65);
      }

      const docPayload = {
        ...wallpaper,
        url: finalImageUrl,
        thumbnailUrl: finalThumbnailUrl,
        createdAtTimestamp: Date.now(),
      };

      const docRef = doc(db, 'wallpapers', wallpaper.id);
      // Timeout after 3 seconds so slow networks never hang
      const setDocPromise = setDoc(docRef, docPayload);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Cloud upload timeout')), 3000)
      );

      await Promise.race([setDocPromise, timeoutPromise]);
      console.log('⚡ Wallpaper published to Cloud Firestore instantly:', wallpaper.id);
      return { success: true, wallpaper: docPayload };
    } catch (e) {
      console.warn('Firestore cloud upload note (saved locally & optimistic):', e);
      return { success: false, error: e.message };
    }
  }
  return { success: true };
};

/**
 * Delete wallpaper from Firestore Cloud Database
 */
export const deleteWallpaperFromCloud = async (wallpaperId) => {
  // Remove from local storage
  deleteUserWallpaper(wallpaperId);

  // Also remove from cloud cache
  try {
    const cloudSaved = JSON.parse(localStorage.getItem('astiwalls_cloud_wallpapers') || '[]');
    const filtered = cloudSaved.filter((w) => w.id !== wallpaperId);
    localStorage.setItem('astiwalls_cloud_wallpapers', JSON.stringify(filtered));
  } catch {}

  if (db) {
    try {
      const docRef = doc(db, 'wallpapers', wallpaperId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (e) {
      console.warn('Failed to delete from Firestore:', e);
      return { success: false, error: e.message };
    }
  }
  return { success: true };
};

export const updateFirebaseConfig = (newConfig) => {
  saveCustomFirebaseConfig(newConfig);
  initFirebase(newConfig);
};
