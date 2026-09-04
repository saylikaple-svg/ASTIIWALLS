import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Smartphone, 
  Monitor, 
  Layers, 
  Sparkles, 
  Dices, 
  X
} from 'lucide-react';
import { CATEGORIES, COLOR_PALETTES } from '../data/initialWallpapers';

export const HeroSection = ({
  activeDeviceFilter,
  setActiveDeviceFilter,
  selectedCategory,
  setSelectedCategory,
  selectedColor,
  setSelectedColor,
  searchQuery,
  setSearchQuery,
  onRollRandom,
  totalCount,
  playClickSound,
}) => {
  return (
    <section className="relative pt-10 sm:pt-16 pb-12 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Clean Header & Title */}
      <div className="text-center space-y-5">
        {/* Top Tag - AstiWalls by webxy */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <div className="inline-flex items-center gap-2 bg-yestalgia-dark text-yestalgia-lime border-2 border-black px-4 py-1 rounded-full font-mono font-bold text-xs uppercase shadow-brutal-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ASTIWALLS BY WEBXY // 4K ULTRA HD ARCHIVE</span>
          </div>
        </motion.div>

        {/* Clean Responsive Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-1"
        >
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight leading-none text-black">
            AstiWalls
          </h1>
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-yestalgia-pink via-purple-600 to-yestalgia-orange">
            4K Wallpapers for Mobile & Laptop
          </h2>
        </motion.div>

        {/* Subtitle */}
        <p className="font-body font-medium text-sm sm:text-base text-gray-700 max-w-xl mx-auto leading-relaxed">
          Curated 4K wallpapers by webxy for mobile phones & laptops. High-energy 90s aesthetic, neon sportswear vibes, and live device mockups.
        </p>

        {/* Device Switcher Pills Bar */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              setActiveDeviceFilter('all');
            }}
            className={`btn-brutal px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeDeviceFilter === 'all'
                ? 'bg-yestalgia-dark text-yestalgia-lime shadow-brutal-sm -translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Wallpapers ({totalCount})</span>
          </button>

          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              setActiveDeviceFilter('mobile');
            }}
            className={`btn-brutal px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeDeviceFilter === 'mobile'
                ? 'bg-yestalgia-pink text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 Mobile 9:16</span>
          </button>

          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              setActiveDeviceFilter('laptop');
            }}
            className={`btn-brutal px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeDeviceFilter === 'laptop'
                ? 'bg-yestalgia-teal text-white shadow-brutal-sm -translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>💻 Laptop 16:9</span>
          </button>

          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              onRollRandom();
            }}
            className="btn-brutal-lime px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-brutal-sm hover:shadow-brutal cursor-pointer"
            title="Inspect a random surprise wallpaper"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>
        </div>

        {/* Clean Search Input */}
        <div className="pt-3 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wallpapers (e.g. synthwave, cyberpunk, nature)..."
              className="w-full pl-11 pr-10 py-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm font-heading font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-yestalgia-pink placeholder-gray-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  if (playClickSound) playClickSound();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-lg border-2 border-black font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-yestalgia-dark text-yestalgia-lime shadow-brutal-sm -translate-y-0.5'
                    : 'bg-white text-black hover:bg-yestalgia-lime/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Color Palette Chips */}
        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-gray-500 uppercase mr-1">
            Colors:
          </span>

          <button
            onClick={() => setSelectedColor(null)}
            className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-md border-2 cursor-pointer ${
              !selectedColor
                ? 'bg-black text-white border-black shadow-brutal-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-black'
            }`}
          >
            All
          </button>

          {COLOR_PALETTES.map((palette) => {
            const isSelected = selectedColor === palette.hex;
            return (
              <button
                key={palette.hex}
                onClick={() => {
                  if (playClickSound) playClickSound();
                  setSelectedColor(isSelected ? null : palette.hex);
                }}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md border-2 border-black text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected ? 'bg-black text-white shadow-brutal-sm -translate-y-0.5' : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full border border-black shadow-xs"
                  style={{ backgroundColor: palette.hex }}
                />
                <span className="text-[10px] hidden sm:inline">{palette.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
