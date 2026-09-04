import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  Monitor, 
  Eye, 
  Heart,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SpotlightCarousel = ({ wallpapers, onSelectWallpaper, onNavigateSignIn, playClickSound }) => {
  const carouselRef = useRef(null);
  const { currentUser, likedIds, toggleLike } = useAuth();

  const featuredWallpapers = wallpapers.filter((w) => w.featured).slice(0, 6);

  const scroll = (direction) => {
    if (playClickSound) playClickSound();
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-yestalgia-pink text-black text-xs font-mono font-black px-2.5 py-0.5 rounded border border-black shadow-brutal-sm flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              HOT DROPS // LOOKBOOK
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-black uppercase tracking-tight">
            Featured Capsule Drops
          </h2>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous Slide"
            className="btn-brutal bg-white hover:bg-yestalgia-lime p-3 rounded-xl border-3 border-black text-black shadow-brutal hover:shadow-brutal-md transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Next Slide"
            className="btn-brutal bg-white hover:bg-yestalgia-lime p-3 rounded-xl border-3 border-black text-black shadow-brutal hover:shadow-brutal-md transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none select-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featuredWallpapers.map((wp, idx) => {
          const isLiked = likedIds.includes(wp.id);
          const isMobile = wp.device === 'mobile';

          return (
            <motion.div
              key={wp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => {
                if (playClickSound) playClickSound();
                onSelectWallpaper(wp);
              }}
              className="flex-shrink-0 w-[290px] sm:w-[360px] snap-start group relative bg-white border-3 border-black rounded-2xl overflow-hidden shadow-brutal hover:shadow-brutal-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Header Ribbon */}
              <div className="bg-yestalgia-dark text-white px-4 py-2 flex items-center justify-between border-b-2 border-black">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-yestalgia-lime">
                  {isMobile ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                  {isMobile ? 'MOBILE 9:16' : 'LAPTOP 16:9'}
                </span>
                <span className="text-[11px] font-mono text-gray-300">
                  {wp.resolution?.split(' ')[0] || '4K UHD'}
                </span>
              </div>

              {/* Image */}
              <div className="relative aspect-[16/11] overflow-hidden bg-zinc-900">
                <img
                  src={wp.thumbnailUrl || wp.url}
                  alt={wp.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />

                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-yestalgia-pink text-black text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full border-2 border-black shadow-brutal-sm uppercase">
                    {wp.category}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playClickSound) playClickSound();
                    if (!currentUser) {
                      if (onNavigateSignIn) onNavigateSignIn();
                    } else {
                      toggleLike(wp.id);
                    }
                  }}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center transition-all z-20 shadow-brutal-sm cursor-pointer ${
                    isLiked ? 'bg-yestalgia-pink text-black' : 'bg-white/90 hover:bg-white text-black'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? 'fill-current text-red-600' : 'text-black'}`}
                  />
                </button>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="btn-brutal-lime px-4 py-2 rounded-xl font-heading font-black text-xs uppercase flex items-center gap-1.5 shadow-brutal text-black">
                    <Eye className="w-4 h-4" />
                    Open Live Preview
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-white border-t-2 border-black space-y-2">
                <h3 className="font-display font-black text-lg text-black uppercase truncate group-hover:text-yestalgia-teal transition-colors">
                  {wp.title}
                </h3>

                <div className="flex items-center justify-between text-xs font-mono text-gray-700">
                  <div className="flex items-center gap-2">
                    <img
                      src={wp.author?.avatar}
                      alt={wp.author?.name}
                      className="w-5 h-5 rounded-full object-cover border border-black"
                    />
                    <span className="truncate max-w-[120px]">{wp.author?.name}</span>
                  </div>

                  <span className="bg-yestalgia-bg px-2 py-0.5 border border-black rounded text-[10px] font-bold">
                    {wp.downloads} Downloads
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
