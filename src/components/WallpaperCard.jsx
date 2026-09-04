import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Heart, Smartphone, Monitor, Eye, Sparkles, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { recordDownload } from '../services/storage';

export const WallpaperCard = ({ wallpaper, onSelect, onNavigateSignIn, playClickSound }) => {
  const { currentUser, likedIds, toggleLike, showToast } = useAuth();
  const isLiked = likedIds.includes(wallpaper.id);
  const [downloadCount, setDownloadCount] = useState(wallpaper.downloads || 0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    if (playClickSound) playClickSound();
    
    if (!currentUser) {
      if (onNavigateSignIn) onNavigateSignIn();
      return;
    }

    if (!isLiked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { x, y },
        colors: ['#F3AFCC', '#D7DD44', '#00966E', '#F09341'],
      });
    }

    toggleLike(wallpaper.id);
  };

  const handleQuickDownload = async (e) => {
    e.stopPropagation();
    if (playClickSound) playClickSound();

    // Direct to Sign-In page if not logged in
    if (!currentUser) {
      if (onNavigateSignIn) onNavigateSignIn();
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(wallpaper.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanTitle = wallpaper.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `yestalgia_${cleanTitle}_${wallpaper.device}_4k.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      recordDownload(wallpaper.id);
      setDownloadCount((prev) => prev + 1);
      showToast(`Downloaded "${wallpaper.title}" in 4K! 🚀`);
    } catch {
      window.open(wallpaper.url, '_blank');
      showToast(`Opened "${wallpaper.title}" in full resolution`);
    } finally {
      setIsDownloading(false);
    }
  };

  const isMobile = wallpaper.device === 'mobile';
  const isLaptop = wallpaper.device === 'laptop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={() => {
        if (playClickSound) playClickSound();
        onSelect(wallpaper);
      }}
      className="group relative bg-white border-3 border-black rounded-2xl overflow-hidden shadow-brutal hover:shadow-brutal-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Cassette Strip */}
      <div className="bg-yestalgia-dark text-white px-4 py-2 flex items-center justify-between border-b-2 border-black">
        <div className="flex items-center gap-2">
          {isMobile ? (
            <span className="flex items-center gap-1 bg-yestalgia-pink text-black text-xs font-mono font-black px-2 py-0.5 rounded">
              <Smartphone className="w-3.5 h-3.5" /> MOBILE 9:16
            </span>
          ) : isLaptop ? (
            <span className="flex items-center gap-1 bg-yestalgia-lime text-black text-xs font-mono font-black px-2 py-0.5 rounded">
              <Monitor className="w-3.5 h-3.5" /> LAPTOP 16:9
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-yestalgia-teal text-white text-xs font-mono font-black px-2 py-0.5 rounded">
              <Sparkles className="w-3.5 h-3.5" /> UNIVERSAL
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono text-gray-300 truncate max-w-[130px]">
          {wallpaper.resolution ? wallpaper.resolution.split(' ')[0] : '4K UHD'}
        </span>
      </div>

      {/* Image Showcase Container */}
      <div className={`relative overflow-hidden bg-zinc-900 ${isMobile ? 'aspect-[3/4]' : 'aspect-[16/10]'}`}>
        <img
          src={wallpaper.thumbnailUrl || wallpaper.url}
          alt={wallpaper.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
        />

        {/* Hover overlay with live preview CTA */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <span className="btn-brutal-lime bg-white text-black px-4 py-2 font-heading font-black text-xs uppercase flex items-center gap-2 rounded-xl shadow-brutal">
            <Eye className="w-4 h-4" />
            Live Preview
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          aria-label="Like wallpaper"
          className={`absolute top-3 right-3 w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center transition-all z-20 shadow-brutal-sm cursor-pointer ${
            isLiked
              ? 'bg-yestalgia-pink text-black scale-110'
              : 'bg-white/90 hover:bg-white text-black'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-current text-red-600' : 'text-black'
            }`}
          />
        </button>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-3 py-1 bg-black/80 backdrop-blur-md text-white border border-white/30 text-xs font-mono font-bold uppercase rounded-lg shadow-md">
            {wallpaper.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 bg-white border-t-2 border-black flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-heading font-black text-base text-black uppercase truncate group-hover:text-yestalgia-teal transition-colors">
            {wallpaper.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5">
            <img
              src={wallpaper.author?.avatar}
              alt={wallpaper.author?.name}
              className="w-5 h-5 rounded-full object-cover border border-black"
            />
            <span className="text-xs font-body text-gray-700 truncate">
              {wallpaper.author?.name || 'Yestalgia Artist'}
            </span>
          </div>
        </div>

        {/* Card Footer: Color chips & Quick Download Button */}
        <div className="pt-3 border-t border-dashed border-gray-300 flex items-center justify-between gap-2">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {wallpaper.colors &&
              wallpaper.colors.slice(0, 3).map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-black shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
          </div>

          {/* Quick Download Button */}
          <button
            onClick={handleQuickDownload}
            disabled={isDownloading}
            aria-label="Download Wallpaper"
            className="btn-brutal-lime px-3 py-1.5 text-xs font-heading font-black uppercase tracking-wider flex items-center gap-1.5 rounded-lg cursor-pointer"
          >
            {isDownloading ? (
              <span className="flex items-center gap-1 text-xs">
                <span className="animate-spin">⏳</span>
              </span>
            ) : !currentUser ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Get 4K</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{downloadCount}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
