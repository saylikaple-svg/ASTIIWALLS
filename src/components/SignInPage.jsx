import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Smartphone, 
  Monitor, 
  Upload, 
  Heart, 
  ShieldCheck, 
  Sparkles,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_WALLPAPERS } from '../data/initialWallpapers';
import { getActiveFirebaseConfig } from '../services/firebase';

export const SignInPage = ({ onBack, onLoginSuccess, onOpenFirebaseConfig, playClickSound }) => {
  const { loginWithGoogle, authLoading, showToast } = useAuth();
  const [activeWallpaperIndex, setActiveWallpaperIndex] = useState(0);

  const showcaseWallpapers = INITIAL_WALLPAPERS.slice(0, 6);
  const isCustomFirebaseSet = !getActiveFirebaseConfig().apiKey?.includes('DummyKey');

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWallpaperIndex((prev) => (prev + 1) % showcaseWallpapers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [showcaseWallpapers.length]);

  const handleGoogleClick = async () => {
    if (playClickSound) playClickSound();
    const res = await loginWithGoogle();
    if (res && res.success) {
      if (res.note) {
        showToast(res.note, 'success');
      }
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  const activeWp = showcaseWallpapers[activeWallpaperIndex];

  return (
    <div className="min-h-screen bg-retro-grid flex flex-col justify-between selection:bg-yestalgia-pink selection:text-black animate-fadeIn">
      {/* Top Nav */}
      <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => {
            if (playClickSound) playClickSound();
            onBack();
          }}
          className="btn-brutal bg-white hover:bg-gray-50 px-4 py-2 rounded-xl font-heading font-black text-xs uppercase flex items-center gap-2 cursor-pointer shadow-brutal-sm hover:shadow-brutal transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Wallpapers</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              if (onOpenFirebaseConfig) onOpenFirebaseConfig();
            }}
            className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isCustomFirebaseSet
                ? 'bg-green-100 text-green-800 border-green-800 shadow-sm'
                : 'bg-white hover:bg-yestalgia-lime text-black shadow-brutal-sm'
            }`}
            title="Configure Real Firebase Project"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isCustomFirebaseSet ? 'Firebase: Connected' : 'Firebase Console Setup'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl text-black uppercase tracking-tight">
              AstiWalls
            </span>
            <span className="bg-yestalgia-pink text-black font-mono font-black text-[10px] px-2 py-0.5 rounded border border-black shadow-sm">
              by webxy
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Screen */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center">
        <div className="w-full bg-white border-4 border-black rounded-3xl shadow-brutal-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT SIDE: GOOGLE SIGN-IN & PERKS */}
          <div className="lg:col-span-6 p-8 sm:p-12 md:p-14 flex flex-col justify-between bg-yestalgia-bg border-b-4 lg:border-b-0 lg:border-r-4 border-black">
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 bg-yestalgia-dark text-yestalgia-lime px-3 py-1 rounded-full font-mono font-bold text-xs uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ASTIWALLS BY WEBXY // 4K ACCESS</span>
              </div>

              {/* Punchy Title */}
              <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-black leading-[0.95] tracking-tight">
                Sign in to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yestalgia-pink via-purple-600 to-yestalgia-orange">
                  Download in 4K
                </span>
              </h1>

              <p className="font-body text-sm sm:text-base text-gray-700 leading-relaxed max-w-md">
                Get free, unlimited access to full-resolution 4K & Retina wallpapers for mobile phones and laptops with 1-click Google Sign-In.
              </p>

              {/* Feature Perks */}
              <div className="space-y-3.5 pt-2 font-heading font-bold text-xs sm:text-sm text-black">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yestalgia-lime border-2 border-black flex items-center justify-center shadow-brutal-sm flex-shrink-0">
                    <Download className="w-4 h-4 text-black" />
                  </div>
                  <span>Instant 1-Click 4K Ultra HD & 5K Downloads</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yestalgia-pink border-2 border-black flex items-center justify-center shadow-brutal-sm flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-black" />
                  </div>
                  <span>Tailored Mobile (9:16) & Laptop (16:9) Screen Cuts</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yestalgia-teal text-white border-2 border-black flex items-center justify-center shadow-brutal-sm flex-shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span>Upload & Publish Your Own Wallpaper Creations</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yestalgia-orange text-black border-2 border-black flex items-center justify-center shadow-brutal-sm flex-shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span>Save & Sync Your Favorite Wallpaper Vault</span>
                </div>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div className="pt-8 space-y-3">
              <button
                onClick={handleGoogleClick}
                disabled={authLoading}
                className="w-full btn-brutal bg-white hover:bg-gray-50 py-4 px-6 rounded-2xl font-heading font-black text-sm text-black flex items-center justify-center gap-3 shadow-brutal hover:shadow-brutal-lg transition-all cursor-pointer"
              >
                {/* Official Google G SVG */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{authLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center justify-between text-xs font-mono text-gray-500 pt-1">
                <div className="flex items-center gap-1 text-green-700 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Firebase Google Auth</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenFirebaseConfig) onOpenFirebaseConfig();
                  }}
                  className="text-xs font-mono text-gray-600 hover:text-black underline cursor-pointer"
                >
                  Firebase Settings ⚙️
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: ANIMATED WALLPAPER SHOWCASE */}
          <div className="lg:col-span-6 p-8 sm:p-10 bg-yestalgia-dark flex flex-col justify-between relative overflow-hidden text-white min-h-[480px]">
            <AnimatePresence mode="wait">
              {activeWp && (
                <motion.img
                  key={activeWp.id}
                  src={activeWp.url}
                  alt={activeWp.title}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 0.25, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none filter blur-sm"
                />
              )}
            </AnimatePresence>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-yestalgia-lime text-black font-mono font-black text-xs px-3 py-1 rounded-lg">
                  ASTIWALLS 4K VAULT
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {activeWallpaperIndex + 1} / {showcaseWallpapers.length}
                </span>
              </div>

              {/* Main Featured Showcase Card */}
              <div className="pt-2">
                <AnimatePresence mode="wait">
                  {activeWp && (
                    <motion.div
                      key={activeWp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="bg-black/60 backdrop-blur-xl border-3 border-zinc-700 rounded-2xl overflow-hidden shadow-2xl p-3"
                    >
                      <div className="aspect-[16/10] rounded-xl overflow-hidden relative">
                        <img
                          src={activeWp.url}
                          alt={activeWp.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-yestalgia-pink text-black text-[10px] font-mono font-black px-2 py-0.5 rounded shadow">
                          {activeWp.category}
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-yestalgia-lime text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          {activeWp.resolution?.split(' ')[0] || '4K UHD'}
                        </div>
                      </div>

                      <div className="pt-3 pb-1 px-1 flex items-center justify-between">
                        <div>
                          <h3 className="font-heading font-black text-sm text-white uppercase truncate">
                            {activeWp.title}
                          </h3>
                          <p className="font-mono text-[11px] text-gray-400">
                            By @{activeWp.author?.username}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-yestalgia-lime font-bold">
                          {activeWp.downloads} Downloads
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-6 gap-2 pt-2">
                {showcaseWallpapers.map((wp, idx) => (
                  <button
                    key={wp.id}
                    onClick={() => setActiveWallpaperIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeWallpaperIndex
                        ? 'border-yestalgia-lime scale-105 shadow-brutal-lime'
                        : 'border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={wp.thumbnailUrl || wp.url}
                      alt={wp.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Slogan */}
            <div className="relative z-10 pt-6 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-gray-400">
              <span>AstiWalls by webxy</span>
              <span className="text-yestalgia-lime font-bold">Free 4K Access</span>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="p-4 text-center text-xs font-mono text-gray-500">
        © 2026 AstiWalls by webxy // 4K Wallpapers for Mobile & Laptop
      </footer>
    </div>
  );
};
