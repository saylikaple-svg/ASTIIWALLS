import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Sparkles, AlertCircle, RefreshCw, Flame } from 'lucide-react';
import { WallpaperCard } from './WallpaperCard';
import { useAuth } from '../context/AuthContext';

export const WallpaperGrid = ({
  wallpapers,
  activeDeviceFilter,
  selectedCategory,
  selectedColor,
  searchQuery,
  onSelectWallpaper,
  onResetFilters,
  playClickSound,
}) => {
  const { likedIds } = useAuth();
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'downloads' | 'newest' | 'likes'

  // Filter and sort logic
  const filteredWallpapers = useMemo(() => {
    return wallpapers
      .filter((wp) => {
        // Device filter
        if (activeDeviceFilter === 'mobile') {
          if (wp.device !== 'mobile' && wp.device !== 'both') return false;
        } else if (activeDeviceFilter === 'laptop') {
          if (wp.device !== 'laptop' && wp.device !== 'both') return false;
        }

        // Category filter
        if (selectedCategory && selectedCategory !== 'All') {
          if (wp.category !== selectedCategory) return false;
        }

        // Color filter
        if (selectedColor) {
          if (!wp.colors || !wp.colors.some((c) => c.toLowerCase() === selectedColor.toLowerCase())) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = wp.title?.toLowerCase().includes(q);
          const matchDesc = wp.description?.toLowerCase().includes(q);
          const matchCategory = wp.category?.toLowerCase().includes(q);
          const matchAuthor = wp.author?.name?.toLowerCase().includes(q);
          const matchTags = wp.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCategory && !matchAuthor && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') {
          return (b.downloads || 0) - (a.downloads || 0);
        }
        if (sortBy === 'likes') {
          return (b.likes || 0) - (a.likes || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || '2026-01-01') - new Date(a.createdAt || '2026-01-01');
        }
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.downloads || 0) - (a.downloads || 0);
      });
  }, [wallpapers, activeDeviceFilter, selectedCategory, selectedColor, searchQuery, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Subheader Bar with generous breathing room */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-3 border-black mb-10">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black uppercase tracking-tight">
            {activeDeviceFilter === 'mobile'
              ? '📱 Mobile Wallpapers'
              : activeDeviceFilter === 'laptop'
              ? '💻 Laptop Wallpapers'
              : '⚡ All Wallpaper Drops'}
          </h2>
          <span className="bg-yestalgia-pink text-black font-mono font-black text-xs px-3 py-1 rounded-full border-2 border-black shadow-brutal-sm">
            {filteredWallpapers.length} Drops
          </span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-gray-700 uppercase">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              if (playClickSound) playClickSound();
              setSortBy(e.target.value);
            }}
            className="px-4 py-2 bg-white border-2 border-black rounded-xl shadow-brutal-sm font-heading font-black text-xs uppercase focus:outline-none focus:ring-2 focus:ring-yestalgia-pink cursor-pointer"
          >
            <option value="popular">🔥 Trending / Featured</option>
            <option value="downloads">📥 Most Downloaded</option>
            <option value="likes">❤️ Most Liked</option>
            <option value="newest">✨ Newest Drops</option>
          </select>
        </div>
      </div>

      {/* Spacious Wallpapers Grid with generous gaps */}
      {filteredWallpapers.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10"
        >
          <AnimatePresence>
            {filteredWallpapers.map((wallpaper) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                onSelect={onSelectWallpaper}
                playClickSound={playClickSound}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="p-16 text-center bg-white border-4 border-black rounded-3xl shadow-brutal-lg max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 mx-auto bg-yestalgia-lime border-3 border-black rounded-2xl flex items-center justify-center shadow-brutal rotate-3">
            <AlertCircle className="w-8 h-8 text-black" />
          </div>

          <h3 className="font-display font-black text-2xl uppercase text-black">
            No Wallpapers Found
          </h3>

          <p className="font-body text-sm text-gray-700 leading-relaxed">
            No wallpapers matched your active search or filters. Try clearing your search or switching device modes.
          </p>

          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              onResetFilters();
            }}
            className="btn-brutal-pink px-6 py-3 rounded-xl font-heading font-black text-xs uppercase inline-flex items-center gap-2 shadow-brutal"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </section>
  );
};
