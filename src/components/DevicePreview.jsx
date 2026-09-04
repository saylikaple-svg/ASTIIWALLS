import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Flashlight, Camera } from 'lucide-react';

export const DevicePreview = ({ wallpaper, activePreviewDevice = 'mobile', showToggle = true, onDeviceChange }) => {
  const [deviceMode, setDeviceMode] = useState(activePreviewDevice);

  // Sync state when activePreviewDevice prop changes
  useEffect(() => {
    setDeviceMode(activePreviewDevice);
  }, [activePreviewDevice]);

  const handleToggle = (mode) => {
    setDeviceMode(mode);
    if (onDeviceChange) onDeviceChange(mode);
  };

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  const dateString = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col items-center w-full max-w-full">
      {/* Device Mode Toggle Tabs */}
      {showToggle && (
        <div className="inline-flex p-1 bg-zinc-900 border-2 border-black rounded-xl shadow-brutal-sm mb-4">
          <button
            type="button"
            onClick={() => handleToggle('mobile')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 font-heading font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-yestalgia-pink text-black shadow-brutal-sm'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Phone Lockscreen</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggle('laptop')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 font-heading font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              deviceMode === 'laptop'
                ? 'bg-yestalgia-lime text-black shadow-brutal-sm'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>MacBook Desktop</span>
          </button>
        </div>
      )}

      {/* RENDER PHONE MOCKUP (Clean, scaled responsively for mobile) */}
      {deviceMode === 'mobile' && (
        <div className="relative w-[230px] xs:w-[260px] sm:w-[300px] h-[460px] xs:h-[520px] sm:h-[600px] bg-black rounded-[38px] sm:rounded-[48px] p-2.5 sm:p-3 border-4 border-black shadow-brutal-xl overflow-hidden select-none transition-all flex-shrink-0">
          <div className="absolute inset-0 rounded-[34px] sm:rounded-[44px] border border-white/20 pointer-events-none z-30"></div>

          <div className="relative w-full h-full rounded-[30px] sm:rounded-[38px] overflow-hidden bg-zinc-900 flex flex-col justify-between p-3 sm:p-4">
            <img
              src={wallpaper.url}
              alt={wallpaper.title}
              className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 z-10 pointer-events-none"></div>

            {/* Top status bar & Dynamic Island */}
            <div className="relative z-20 flex flex-col items-center">
              <div className="w-20 sm:w-24 h-5 sm:h-6 bg-black rounded-full flex items-center justify-between px-2 sm:px-2.5 mx-auto border border-white/10 shadow-lg">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-blue-500/80"></div>
                </div>
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-zinc-800"></div>
              </div>

              <div className="w-full flex items-center justify-between text-white text-[10px] sm:text-[11px] font-mono font-bold mt-1 px-2 sm:px-3">
                <span>{timeString}</span>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <Battery className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* Clean Centered Lockscreen Clock */}
              <div className="text-center mt-6 sm:mt-10 text-white">
                <p className="text-[11px] sm:text-xs font-heading font-semibold tracking-wide uppercase opacity-90 drop-shadow">
                  {dateString}
                </p>
                <h2 className="text-4xl sm:text-6xl font-heading font-black tracking-tight drop-shadow-md leading-none mt-1">
                  {timeString}
                </h2>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-20">
              <div className="flex items-center justify-between px-1 sm:px-2 mb-2 sm:mb-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow">
                  <Flashlight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="w-24 sm:w-32 h-1 bg-white/80 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER LAPTOP MOCKUP */}
      {deviceMode === 'laptop' && (
        <div className="relative w-[300px] xs:w-[340px] sm:w-[480px] md:w-[540px] flex flex-col items-center select-none transition-all flex-shrink-0">
          <div className="w-full h-[180px] xs:h-[210px] sm:h-[290px] md:h-[330px] bg-zinc-950 rounded-t-2xl p-2 border-4 border-black shadow-brutal-xl overflow-hidden relative flex flex-col justify-between">
            <img
              src={wallpaper.url}
              alt={wallpaper.title}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 z-10 pointer-events-none"></div>

            {/* Top Menu Bar */}
            <div className="relative z-20 w-full bg-black/40 backdrop-blur-md border-b border-white/10 px-2.5 py-1 flex items-center justify-between text-white text-[9px] sm:text-[10px] font-sans font-medium">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-bold"></span>
                <span className="font-bold">Finder</span>
                <span className="hidden sm:inline opacity-80">File</span>
                <span className="hidden sm:inline opacity-80">Edit</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[8px] sm:text-[9px]">
                <span className="bg-yestalgia-lime text-black px-1.5 py-0.2 rounded font-bold">4K UHD</span>
                <span>{timeString}</span>
              </div>
            </div>

            {/* Bottom Dock */}
            <div className="relative z-20 pb-1.5 flex justify-center">
              <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 shadow-2xl">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-blue-500 flex items-center justify-center text-white text-[8px] sm:text-[9px] font-bold">
                  Fi
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-yestalgia-pink flex items-center justify-center text-black text-[8px] sm:text-[9px] font-bold">
                  Wp
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-yestalgia-lime flex items-center justify-center text-black text-[8px] sm:text-[9px] font-bold">
                  4K
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-yestalgia-teal flex items-center justify-center text-white text-[8px] sm:text-[9px] font-bold">
                  Dl
                </div>
              </div>
            </div>
          </div>

          <div className="w-[104%] h-3 sm:h-3.5 bg-zinc-300 border-x-4 border-b-4 border-black rounded-b-xl relative shadow-brutal flex justify-center">
            <div className="w-16 sm:w-20 h-1 bg-zinc-400 rounded-b-md"></div>
          </div>
        </div>
      )}
    </div>
  );
};
