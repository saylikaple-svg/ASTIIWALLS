import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { getCustomFirebaseConfig, saveCustomFirebaseConfig } from './storage';

// Helper to get active configuration
export const getActiveFirebaseConfig = () => {
  // 1. Check custom configured in UI/localStorage
  const custom = getCustomFirebaseConfig();
  if (custom && custom.apiKey && custom.projectId) {
    return custom;
  }

  // 2. Check Vite environment variables
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  // 3. Default demo / placeholder config
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
let googleProvider = null;

export const initFirebase = (customConfig = null) => {
  try {
    const config = customConfig || getActiveFirebaseConfig();
    
    // Check if real API key is configured
    const isRealKey = config.apiKey && !config.apiKey.includes('DummyKey');

    if (isRealKey) {
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    }
  } catch (e) {
    console.warn('Firebase initialization note:', e);
  }
};

// Initial setup
initFirebase();

export const onAuthChange = (callback) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
};

/**
 * Real Google Sign-In with Firebase Console Authentication
 */
export const signInWithGoogle = async () => {
  const config = getActiveFirebaseConfig();
  const isRealFirebaseConfigured = config.apiKey && !config.apiKey.includes('DummyKey');

  // If real Firebase Console keys are configured, perform real Google OAuth popup
  if (isRealFirebaseConfigured) {
    try {
      if (!auth) {
        initFirebase();
      }
      if (!auth || !googleProvider) {
        throw new Error("Firebase Auth is not initialized. Please check your Firebase Console keys.");
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
      console.error('Firebase Google Sign-In Error:', error);

      // Friendly diagnostics for Firebase Console configuration
      let userFriendlyMessage = error.message;

      if (error.code === 'auth/unauthorized-domain') {
        userFriendlyMessage = "Domain not authorized! In Firebase Console > Authentication > Settings > Authorized domains, add 'localhost' and your domain.";
      } else if (error.code === 'auth/operation-not-allowed') {
        userFriendlyMessage = "Google Sign-In is disabled! In Firebase Console > Authentication > Sign-in method, click Google and enable it.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = "Google Sign-In popup was closed.";
      } else if (error.code === 'auth/popup-blocked') {
        userFriendlyMessage = "Google Sign-In popup was blocked by browser. Please allow popups for this site.";
      } else if (error.code === 'auth/invalid-api-key') {
        userFriendlyMessage = "Invalid Firebase API key. Please check your Firebase Console project settings.";
      }

      return {
        success: false,
        error: userFriendlyMessage,
        errorCode: error.code,
      };
    }
  } else {
    // If user hasn't added their Firebase keys yet, provide instant development login with instructions
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      user: {
        id: 'google-user-' + Date.now(),
        name: 'Alex Vance',
        email: 'alex.vance@gmail.com',
        username: 'alex_vance',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      isDemoMode: true,
      note: 'To use your real Firebase Console account, add your keys to the .env file or Firebase Configuration in Settings.',
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
 * Update and apply Firebase Console configuration dynamically
 */
export const updateFirebaseConfig = (newConfig) => {
  saveCustomFirebaseConfig(newConfig);
  initFirebase(newConfig);
};
