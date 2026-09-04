import React from 'react';
import { Sparkles, Zap, Flame, Monitor, Smartphone, Heart, Download } from 'lucide-react';

export const MarqueeBanner = () => {
  const items = [
    { text: 'DEPUIS 1994 // RETRO ARCHIVES', icon: Sparkles },
    { text: '4K ULTRA HD WALLPAPERS', icon: Monitor },
    { text: 'MOBILE & LAPTOP DROPS', icon: Smartphone },
    { text: 'VINTAGE SPORT × CYBER NOSTALGIA', icon: Zap },
    { text: 'INSTANT 1-CLICK FREE DOWNLOAD', icon: Download },
    { text: 'UPLOAD YOUR CREATIONS', icon: Flame },
    { text: 'SYNTHWAVE // MEMPHIS // PIXEL ART', icon: Heart },
  ];

  return (
    <div className="w-full bg-yestalgia-dark text-yestalgia-lime border-y-3 border-black overflow-hidden py-2 select-none relative z-20">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2 mx-6 font-mono text-xs tracking-wider">
              <Icon className="w-3.5 h-3.5 text-yestalgia-pink flex-shrink-0" />
              <span>{item.text}</span>
              <span className="text-yestalgia-pink ml-4 font-bold">★</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
