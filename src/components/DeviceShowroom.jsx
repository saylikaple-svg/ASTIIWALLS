import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Monitor, 
  Download, 
  Eye, 
  Lock
} from 'lucide-react';
import { DevicePreview } from './DevicePreview';
import { useAuth } from '../context/AuthContext';
import { recordDownload } from '../services/storage';

export const DeviceShowroom = ({ wallpapers, onSelectWallpaper, onNavigateSignIn, playClickSound }) => {
  const [selectedShowcaseId, setSelectedShowcaseId] = useState(wallpapers[0]?.id || '');
  const [deviceMode, setDeviceMode] = useState('laptop'); // default to Laptop for grand desktop view
  const { currentUser, showToast } = useAuth();

  const currentWp = wallpapers.find((w) => w.id === selectedShowcaseId) || wallpapers[0];

  const handleQuickDownload = async () => {
    if (!currentWp) return;
    if (playClickSound) playClickSound();

    if (!currentUser) {
      if (onNavigateSignIn) onNavigateSignIn();
      return;
    }

    try {
      const response = await fetch(currentWp.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanTitle = currentWp.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `astiwalls_${cleanTitle}_4k.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      recordDownload(currentWp.id);
      showToast(`Downloaded "${currentWp.title}" in 4K! 🚀`);
    } catch {
      window.open(currentWp.url, '_blank');
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="bg-yestalgia-dark text-white border-4 border-black rounded-3xl p-6 sm:p-10 shadow-brutal-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b-2 border-zinc-800">
          <div>
            <span className="bg-yestalgia-lime text-black font-mono font-black text-xs px-2.5 py-0.5 rounded uppercase">
              LIVE HARDWARE SHOWROOM
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-tight mt-2">
              Preview Wallpapers on Real Devices
            </h2>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
          {/* Left: Device Stage (with single clean toggle) */}
          <div className="lg:col-span-6 flex items-center justify-center p-4 bg-zinc-950/80 rounded-2xl border-2 border-zinc-800">
            {currentWp && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentWp.id}-${deviceMode}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <DevicePreview
                    wallpaper={currentWp}
                    activePreviewDevice={deviceMode}
                    showToggle={true}
                    onDeviceChange={(mode) => setDeviceMode(mode)}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Right: Info & Wallpaper Picker Grid */}
          <div className="lg:col-span-6 space-y-6">
            {currentWp && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-yestalgia-pink text-black font-mono font-bold text-xs rounded-lg uppercase">
                    {currentWp.category}
                  </span>
                  <span className="px-3 py-1 bg-yestalgia-lime text-black font-mono font-bold text-xs rounded-lg uppercase">
                    {currentWp.resolution || '4K ULTRA HD'}
                  </span>
                </div>

                <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase leading-tight">
                  {currentWp.title}
                </h3>

                <p className="font-body text-sm text-gray-300 leading-relaxed max-w-lg">
                  {currentWp.description}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={handleQuickDownload}
                    className="btn-brutal-lime px-6 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 text-black shadow-brutal cursor-pointer"
                  >
                    {!currentUser ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    <span>{!currentUser ? 'Sign in to Download 4K' : 'Download 4K Ultra HD'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (playClickSound) playClickSound();
                      onSelectWallpaper(currentWp);
                    }}
                    className="btn-brutal bg-white text-black hover:bg-gray-100 px-5 py-3 rounded-xl font-heading font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Inspector</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Picker */}
            <div className="pt-6 border-t border-zinc-800">
              <p className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Select wallpaper to test on {deviceMode === 'laptop' ? 'MacBook' : 'iPhone'}:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {wallpapers.slice(0, 6).map((wp) => {
                  const isSelected = wp.id === selectedShowcaseId;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => {
                        if (playClickSound) playClickSound();
                        setSelectedShowcaseId(wp.id);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-yestalgia-lime ring-2 ring-yestalgia-lime scale-105 shadow-brutal-lime'
                          : 'border-zinc-700 hover:border-white opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={wp.thumbnailUrl || wp.url}
                        alt={wp.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
