import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MarqueeBanner } from './components/MarqueeBanner';
import { HeroSection } from './components/HeroSection';
import { SpotlightCarousel } from './components/SpotlightCarousel';
import { DeviceShowroom } from './components/DeviceShowroom';
import { WallpaperGrid } from './components/WallpaperGrid';
import { WallpaperModal } from './components/WallpaperModal';
import { UploadModal } from './components/UploadModal';
import { SignInPage } from './components/SignInPage';
import { UserProfileView } from './components/UserProfileView';
import { Toast } from './components/Toast';
import { useAuth } from './context/AuthContext';
import { getAllWallpapers } from './services/storage';
import { ArrowUp, Smartphone, Monitor, Upload, LogIn } from 'lucide-react';

export function App() {
  const { currentUser, toastMessage, showToast, closeToast } = useAuth();

  const [wallpapers, setWallpapers] = useState(() => getAllWallpapers());
  const [activeDeviceFilter, setActiveDeviceFilter] = useState('all'); // 'all' | 'mobile' | 'laptop'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Views
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentView, setCurrentView] = useState('gallery'); // 'gallery' | 'profile' | 'signin'

  const playClickSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch {
      // Audio context fallback
    }
  }, []);

  const navigateToSignIn = () => {
    setCurrentView('signin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Roll random wallpaper
  const handleRollRandom = () => {
    if (!wallpapers.length) return;
    const randomIndex = Math.floor(Math.random() * wallpapers.length);
    const randomWp = wallpapers[randomIndex];
    setSelectedWallpaper(randomWp);
    showToast(`Rolled surprise wallpaper: "${randomWp.title}"! 🎲`);
  };

  // Reset filters
  const handleResetFilters = () => {
    setActiveDeviceFilter('all');
    setSelectedCategory('All');
    setSelectedColor(null);
    setSearchQuery('');
  };

  // Handle uploaded wallpaper added to state
  const handleUploadSuccess = (newWallpaper) => {
    setWallpapers((prev) => [newWallpaper, ...prev]);
  };

  // Handle deleted wallpaper
  const handleWallpaperDeleted = (id) => {
    setWallpapers((prev) => prev.filter((wp) => wp.id !== id));
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is on the dedicated Sign-In Page
  if (currentView === 'signin') {
    return (
      <>
        <SignInPage
          onBack={() => setCurrentView('gallery')}
          onLoginSuccess={() => setCurrentView('gallery')}
          playClickSound={playClickSound}
        />
        <Toast toast={toastMessage} onClose={closeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-retro-grid text-yestalgia-dark selection:bg-yestalgia-pink selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeDeviceFilter={activeDeviceFilter}
        setActiveDeviceFilter={setActiveDeviceFilter}
        onOpenUpload={() => setIsUploadOpen(true)}
        onNavigateSignIn={navigateToSignIn}
        currentView={currentView}
        setCurrentView={setCurrentView}
        playClickSound={playClickSound}
      />

      {/* Marquee Ticker */}
      <MarqueeBanner />

      {/* Main Content View */}
      <main className="flex-1">
        {currentView === 'gallery' ? (
          <>
            {/* Hero Section */}
            <HeroSection
              activeDeviceFilter={activeDeviceFilter}
              setActiveDeviceFilter={setActiveDeviceFilter}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onRollRandom={handleRollRandom}
              totalCount={wallpapers.length}
              playClickSound={playClickSound}
            />

            {/* Featured Lookbook Spotlight Carousel */}
            {!searchQuery && selectedCategory === 'All' && !selectedColor && (
              <SpotlightCarousel
                wallpapers={wallpapers}
                onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
                onNavigateSignIn={navigateToSignIn}
                playClickSound={playClickSound}
              />
            )}

            {/* Live 3D Device Showroom */}
            {!searchQuery && (
              <DeviceShowroom
                wallpapers={wallpapers}
                onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
                onNavigateSignIn={navigateToSignIn}
                playClickSound={playClickSound}
              />
            )}

            {/* Main Wallpaper Feed Grid */}
            <WallpaperGrid
              wallpapers={wallpapers}
              activeDeviceFilter={activeDeviceFilter}
              selectedCategory={selectedCategory}
              selectedColor={selectedColor}
              searchQuery={searchQuery}
              onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
              onNavigateSignIn={navigateToSignIn}
              onResetFilters={handleResetFilters}
              playClickSound={playClickSound}
            />
          </>
        ) : (
          <UserProfileView
            allWallpapers={wallpapers}
            onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onNavigateSignIn={navigateToSignIn}
            onBackToGallery={() => setCurrentView('gallery')}
            playClickSound={playClickSound}
            onWallpaperDeleted={handleWallpaperDeleted}
          />
        )}
      </main>

      {/* Clean Modern Retro Footer - AstiWalls by webxy */}
      <footer className="bg-yestalgia-dark text-white border-t-4 border-black pt-16 pb-10 px-4 sm:px-6 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-zinc-800">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-3xl text-yestalgia-lime uppercase tracking-tight">
                AstiWalls
              </span>
              <span className="bg-yestalgia-pink text-black text-xs font-mono font-black px-2 py-0.5 rounded shadow-brutal-sm">
                by webxy
              </span>
            </div>
            <p className="font-body text-sm text-gray-400 max-w-sm leading-relaxed">
              Curated 4K Wallpaper drops for Mobile phones and Laptops. Free 4K downloads with Google Sign-In.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-black text-yestalgia-lime uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 font-body text-xs text-gray-300">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('gallery');
                    setActiveDeviceFilter('mobile');
                  }}
                  className="hover:text-yestalgia-pink transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile Wallpapers (9:16)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('gallery');
                    setActiveDeviceFilter('laptop');
                  }}
                  className="hover:text-yestalgia-pink transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Laptop Wallpapers (16:9)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      navigateToSignIn();
                    } else {
                      setIsUploadOpen(true);
                    }
                  }}
                  className="hover:text-yestalgia-pink transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Wallpaper</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Authentication */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-black text-yestalgia-lime uppercase tracking-wider">
              Account
            </h4>
            <ul className="space-y-2 font-body text-xs text-gray-300">
              <li>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      navigateToSignIn();
                    } else {
                      setCurrentView('profile');
                    }
                  }}
                  className="hover:text-yestalgia-pink transition-colors cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{currentUser ? 'My Profile & Uploads' : 'Google Sign-In'}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-400">
          <p>© 2026 AstiWalls by webxy // ALL ASSETS 4K ULTRA HD</p>

          <button
            onClick={scrollToTop}
            className="btn-brutal bg-yestalgia-lime text-black px-4 py-2 rounded-xl text-xs font-mono font-black uppercase flex items-center gap-1.5 hover:bg-white cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Back to Top</span>
          </button>
        </div>
      </footer>

      {/* MODALS */}
      {selectedWallpaper && (
        <WallpaperModal
          wallpaper={selectedWallpaper}
          onClose={() => setSelectedWallpaper(null)}
          onNavigateSignIn={navigateToSignIn}
          onSelectTag={(tag) => setSearchQuery(tag)}
          playClickSound={playClickSound}
        />
      )}

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        playClickSound={playClickSound}
      />

      {/* Toast Notification Container */}
      <Toast toast={toastMessage} onClose={closeToast} />
    </div>
  );
}

export default App;
