import React, { useState } from 'react';
import { 
  Upload, 
  Smartphone, 
  Monitor, 
  Layers, 
  LogIn, 
  LogOut, 
  User, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({
  activeDeviceFilter,
  setActiveDeviceFilter,
  onOpenUpload,
  onNavigateSignIn,
  currentView,
  setCurrentView,
  playClickSound,
}) => {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleDeviceClick = (device) => {
    if (playClickSound) playClickSound();
    setActiveDeviceFilter(device);
    if (currentView !== 'gallery') {
      setCurrentView('gallery');
    }
  };

  const handleHomeClick = () => {
    if (playClickSound) playClickSound();
    setCurrentView('gallery');
    setActiveDeviceFilter('all');
  };

  const handleProfileClick = () => {
    if (playClickSound) playClickSound();
    if (currentUser) {
      setCurrentView('profile');
    } else {
      onNavigateSignIn();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-yestalgia-bg/95 backdrop-blur-md border-b-3 border-black w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Brand Logo - AstiWalls by webxy */}
        <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2 sm:gap-3 group text-left focus:outline-none cursor-pointer"
          >
            {/* Logo Badge */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yestalgia-dark border-2 border-black rounded-lg sm:rounded-xl shadow-brutal-sm group-hover:shadow-brutal transition-all flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-3.5 sm:w-6 sm:h-4 bg-yestalgia-lime border border-black rounded flex items-center justify-between px-0.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-black flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-yestalgia-pink"></div>
                </div>
                <div className="w-1 h-0.5 bg-black"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-black flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-yestalgia-pink"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-display font-black text-base sm:text-2xl tracking-tight text-black uppercase">
                AstiWalls
              </span>
              <span className="hidden xs:inline-block bg-yestalgia-pink border border-black text-[8px] sm:text-[9px] font-mono font-black px-1 sm:px-1.5 py-0.2 rounded shadow-brutal-sm">
                by webxy
              </span>
            </div>
          </button>

          {/* Desktop Device Filter Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-white border-2 border-black rounded-xl shadow-brutal-sm">
            <button
              onClick={() => handleDeviceClick('all')}
              className={`px-3.5 py-1.5 font-heading font-black text-xs uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                activeDeviceFilter === 'all' && currentView === 'gallery'
                  ? 'bg-yestalgia-dark text-yestalgia-lime shadow-brutal-sm -translate-y-0.5'
                  : 'text-black hover:bg-black/5'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                All Drops
              </span>
            </button>

            <button
              onClick={() => handleDeviceClick('mobile')}
              className={`px-3.5 py-1.5 font-heading font-black text-xs uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                activeDeviceFilter === 'mobile' && currentView === 'gallery'
                  ? 'bg-yestalgia-pink text-black border border-black shadow-brutal-sm -translate-y-0.5'
                  : 'text-black hover:bg-black/5'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </span>
            </button>

            <button
              onClick={() => handleDeviceClick('laptop')}
              className={`px-3.5 py-1.5 font-heading font-black text-xs uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                activeDeviceFilter === 'laptop' && currentView === 'gallery'
                  ? 'bg-yestalgia-teal text-white border border-black shadow-brutal-sm -translate-y-0.5'
                  : 'text-black hover:bg-black/5'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                Laptop
              </span>
            </button>
          </nav>
        </div>

        {/* Right Actions: Direct Profile & Upload & Sign-In */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Direct "My Profile" Button right next to Upload */}
          <button
            onClick={handleProfileClick}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-heading font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
              currentView === 'profile'
                ? 'bg-yestalgia-dark text-yestalgia-lime border-2 border-black shadow-brutal-sm'
                : 'btn-brutal bg-white hover:bg-gray-50 text-black'
            }`}
            title="Open My Profile & Collections"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            <span className="hidden sm:inline">My Profile</span>
            <span className="sm:hidden">Profile</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              if (!currentUser) {
                onNavigateSignIn();
              } else {
                onOpenUpload();
              }
            }}
            className="btn-brutal-pink px-2.5 sm:px-4 py-1.5 sm:py-2 font-heading font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Upload</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* User Profile Avatar Dropdown or Google Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  if (playClickSound) playClickSound();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white border-2 border-black rounded-lg sm:rounded-xl shadow-brutal-sm hover:shadow-brutal transition-all cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg object-cover border border-black"
                />
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-700" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border-3 border-black rounded-2xl shadow-brutal-lg p-3 z-50 animate-fadeIn"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="pb-3 border-b-2 border-black mb-2">
                    <p className="font-heading font-black text-sm text-black truncate">
                      {currentUser.name}
                    </p>
                    <p className="font-mono text-xs text-gray-600 truncate">
                      {currentUser.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        if (playClickSound) playClickSound();
                        setCurrentView('profile');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-heading font-bold uppercase rounded-lg hover:bg-yestalgia-pink/30 transition-colors text-left cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      My Profile & Uploads
                    </button>

                    <button
                      onClick={() => {
                        if (playClickSound) playClickSound();
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-heading font-bold uppercase rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (playClickSound) playClickSound();
                onNavigateSignIn();
              }}
              className="btn-brutal-lime px-2.5 sm:px-4 py-1.5 sm:py-2 font-heading font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Device Filter */}
      <div className="md:hidden px-3 py-2 bg-white flex items-center justify-around gap-1.5 w-full">
        <button
          onClick={() => handleDeviceClick('all')}
          className={`flex-1 py-1.5 text-center font-heading font-black text-[11px] uppercase rounded-lg border-2 border-black transition-all ${
            activeDeviceFilter === 'all' && currentView === 'gallery'
              ? 'bg-yestalgia-dark text-yestalgia-lime shadow-brutal-sm'
              : 'bg-white text-black'
          }`}
        >
          ⚡ All
        </button>
        <button
          onClick={() => handleDeviceClick('mobile')}
          className={`flex-1 py-1.5 text-center font-heading font-black text-[11px] uppercase rounded-lg border-2 border-black transition-all ${
            activeDeviceFilter === 'mobile' && currentView === 'gallery'
              ? 'bg-yestalgia-pink text-black shadow-brutal-sm'
              : 'bg-white text-black'
          }`}
        >
          📱 Mobile
        </button>
        <button
          onClick={() => handleDeviceClick('laptop')}
          className={`flex-1 py-1.5 text-center font-heading font-black text-[11px] uppercase rounded-lg border-2 border-black transition-all ${
            activeDeviceFilter === 'laptop' && currentView === 'gallery'
              ? 'bg-yestalgia-teal text-white shadow-brutal-sm'
              : 'bg-white text-black'
          }`}
        >
          💻 Laptop
        </button>
      </div>
    </header>
  );
};
