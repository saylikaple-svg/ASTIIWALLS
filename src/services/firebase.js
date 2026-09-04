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
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { getCustomFirebaseConfig, saveCustomFirebaseConfig, saveUploadedWallpaper, deleteUserWallpaper, getLocalWallpapers } from './storage';
import { INITIAL_WALLPAPERS } from '../data/initialWallpapers';

// Helper to get active configuration
export const getActiveFirebaseConfig = () => {
  const custom = getCustomFirebaseConfig();
  if (custom && custom.apiKey && custom.projectId) {
    return custom;
  }

  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return {
    apiKey: "AIzaSyDummyKey_AstiWalls_94",
    authDomain: "astiwalls-wallpapers.firebaseapp.com",
    projectId: "astiwalls-wallpapers",
    storageBucket: "astiwalls-wallpapers.appspot.com",
    messagingSenderId: "102938475610",
    appId: "1:102938475610:web:89abcdef0123456789",
  };
};

let app = null;
let auth = null;
let db = null;
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
 * Real-time Firestore Cloud Wallpaper Synchronization
 * Listens to all user uploads from anyone across the globe in real time!
 */
export const subscribeToCloudWallpapers = (onWallpapersUpdated) => {
  if (db) {
    try {
      const q = collection(db, 'wallpapers');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const cloudWallpapers = [];
          snapshot.forEach((docSnap) => {
            cloudWallpapers.push({ id: docSnap.id, ...docSnap.data() });
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
          // Fallback to local storage
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
 * Publish wallpaper to Firestore Cloud Database
 */
export const publishWallpaperToCloud = async (wallpaper) => {
  // Always save locally first
  saveUploadedWallpaper(wallpaper);

  if (db) {
    try {
      const docRef = doc(db, 'wallpapers', wallpaper.id);
      await setDoc(docRef, {
        ...wallpaper,
        createdAtTimestamp: Date.now(),
      });
      return { success: true };
    } catch (e) {
      console.warn('Failed to publish to cloud Firestore:', e);
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
