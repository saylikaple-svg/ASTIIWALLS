import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithGoogle, logoutUser, onAuthChange } from '../services/firebase';
import { getLikedWallpaperIds, toggleLikeWallpaper } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('yestalgia_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [likedIds, setLikedIds] = useState(() => getLikedWallpaperIds());
  const [authLoading, setAuthLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('yestalgia_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('yestalgia_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email,
          username: firebaseUser.email ? firebaseUser.email.split('@')[0] : 'user',
          avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        };
        setCurrentUser(userData);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
  };

  const closeToast = () => {
    setToastMessage(null);
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast(`Welcome, ${res.user.name}! 🎉`);
        return { success: true, user: res.user };
      } else {
        showToast(res.error || 'Google Sign-In cancelled', 'error');
        return { success: false, error: res.error };
      }
    } catch (e) {
      showToast(e.message || 'Login failed', 'error');
      return { success: false, error: e.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast('Signed out successfully 👋');
  };

  const handleToggleLike = (wallpaperId) => {
    if (!currentUser) {
      showToast('Please sign in to save your favorite wallpapers', 'error');
      return false;
    }
    const { updatedLikes, isLiked } = toggleLikeWallpaper(wallpaperId);
    setLikedIds(updatedLikes);
    showToast(isLiked ? 'Saved to Favorites ❤️' : 'Removed from Favorites');
    return isLiked;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        likedIds,
        authLoading,
        toastMessage,
        loginWithGoogle: handleGoogleLogin,
        logout: handleLogout,
        toggleLike: handleToggleLike,
        showToast,
        closeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
