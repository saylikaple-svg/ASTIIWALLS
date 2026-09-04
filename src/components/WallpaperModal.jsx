import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Heart, 
  Smartphone, 
  Monitor, 
  Share2, 
  Check, 
  Lock,
  LogIn,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DevicePreview } from './DevicePreview';
import { useAuth } from '../context/AuthContext';
import { recordDownload } from '../services/storage';
import { deleteWallpaperFromCloud } from '../services/firebase';

export const WallpaperModal = ({ wallpaper, onClose, onNavigateSignIn, onSelectTag, onWallpaperDeleted, playClickSound }) => {

  if (!wallpaper) return null;

  const { currentUser, likedIds, toggleLike, showToast } = useAuth();
  const isLiked = likedIds.includes(wallpaper.id);
  const [downloadCount, setDownloadCount] = useState(wallpaper.downloads || 0);
  const [activeTab, setActiveTab] = useState('mockup');
  const [copiedColor, setCopiedColor] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isOwner = currentUser && wallpaper.isUserUploaded && (
    wallpaper.author?.id === currentUser.id ||
    wallpaper.author?.email === currentUser.email ||
    wallpaper.author?.username === currentUser.username ||
    !wallpaper.author?.id
  );

  const handleDelete = async () => {
    if (playClickSound) playClickSound();
    if (window.confirm(`Are you sure you want to permanently delete "${wallpaper.title}"?`)) {
      setIsDeleting(true);
      try {
        await deleteWallpaperFromCloud(wallpaper.id);
        if (onWallpaperDeleted) {
          onWallpaperDeleted(wallpaper.id);
        }
        showToast(`"${wallpaper.title}" was deleted.`);
        onClose();
      } catch {
        showToast('Failed to delete wallpaper', 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleLike = () => {
    if (playClickSound) playClickSound();
    if (!currentUser) {
      onClose();
      if (onNavigateSignIn) onNavigateSignIn();
      return;
    }

    if (!isLiked) {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F3AFCC', '#D7DD44', '#00966E', '#F09341'],
      });
    }
    toggleLike(wallpaper.id);
  };

  const handleDownload = async (formatLabel, targetWidth, targetHeight) => {
    if (playClickSound) playClickSound();

    if (!currentUser) {
      onClose();
      if (onNavigateSignIn) onNavigateSignIn();
      return;
    }

    setIsDownloading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = wallpaper.url;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (targetWidth && targetHeight) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const x = (targetWidth - img.width * scale) / 2;
          const y = (targetHeight - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        } else {
          canvas.width = img.naturalWidth || 3840;
          canvas.height = img.naturalHeight || 2160;
          ctx.drawImage(img, 0, 0);
        }

        canvas.toBlob((blob) => {
          if (!blob) {
            window.open(wallpaper.url, '_blank');
            return;
          }
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          const cleanTitle = wallpaper.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
          link.download = `astiwalls_${cleanTitle}_${formatLabel.toLowerCase().replace(/\s+/g, '_')}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);

          recordDownload(wallpaper.id);
          setDownloadCount((prev) => prev + 1);
          showToast(`Downloaded ${wallpaper.title} (${formatLabel})! 🚀`);
          setIsDownloading(false);
        }, 'image/jpeg', 0.95);
      };

      img.onerror = () => {
        window.open(wallpaper.url, '_blank');
        recordDownload(wallpaper.id);
        setDownloadCount((prev) => prev + 1);
        showToast(`Opening original resolution image in new tab`);
        setIsDownloading(false);
      };
    } catch {
      window.open(wallpaper.url, '_blank');
      setIsDownloading(false);
    }
  };

  const handleCopyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    showToast(`Color ${hex} copied! 🎨`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: wallpaper.title + ' - AstiWalls',
        text: `Check out this 4K ${wallpaper.device} wallpaper!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard! 🔗');
    }
  };

  const handleApplyWallpaper = (deviceType) => {
    if (playClickSound) playClickSound();
    if (!currentUser) {
      onClose();
      if (onNavigateSignIn) onNavigateSignIn();
      return;
    }
    const isMobile = deviceType === 'mobile';
    const targetW = isMobile ? 1080 : 1920;
    const targetH = isMobile ? 2400 : 1080;
    const label = isMobile ? 'Phone' : 'Laptop';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = wallpaper.url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetW; canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(targetW / img.width, targetH / img.height);
      ctx.drawImage(img, (targetW - img.width * scale) / 2, (targetH - img.height * scale) / 2, img.width * scale, img.height * scale);
      canvas.toBlob((blob) => {
        if (!blob) { window.open(wallpaper.url, '_blank'); return; }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `astiwalls_${wallpaper.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${label.toLowerCase()}_wallpaper.jpg`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        recordDownload(wallpaper.id);
        setDownloadCount(p => p + 1);
        showToast(`✅ ${label} wallpaper downloaded!`);
      }, 'image/jpeg', 0.95);
    };
    img.onerror = () => window.open(wallpaper.url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">

      <div className="relative w-full max-w-5xl bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl shadow-brutal-xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-yestalgia-dark text-white px-3 sm:px-8 py-3 flex items-center justify-between border-b-3 border-black flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <span className="bg-yestalgia-lime text-black font-mono font-black text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded flex-shrink-0">
              4K ARCHIVE
            </span>
            <h2 className="font-heading font-black text-sm sm:text-lg uppercase tracking-wide truncate text-yestalgia-lime">
              {wallpaper.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 sm:p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl border border-white/20 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold font-mono"
                title="Delete this wallpaper"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-1.5 sm:p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg sm:rounded-xl border border-white/20 transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 bg-yestalgia-pink hover:bg-white text-black font-bold rounded-lg sm:rounded-xl border-2 border-black transition-colors shadow-sm cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y-3 lg:divide-y-0 lg:divide-x-3 divide-black">
          {/* Left Column: Visual Preview Stage */}
          <div className="lg:col-span-7 bg-zinc-950 p-3 sm:p-6 flex flex-col items-center justify-center relative">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20 mb-4 self-center z-20">
              <button
                onClick={() => setActiveTab('mockup')}
                className={`px-3 py-1.5 text-xs font-heading font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'mockup' ? 'bg-yestalgia-lime text-black' : 'text-white hover:bg-white/10'
                }`}
              >
                📱 Live Mockup
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 text-xs font-heading font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'raw' ? 'bg-yestalgia-lime text-black' : 'text-white hover:bg-white/10'
                }`}
              >
                🖼️ Raw 4K View
              </button>
            </div>

            {/* Content Display */}
            {activeTab === 'mockup' ? (
              <div className="w-full flex justify-center py-2">
                <DevicePreview
                  wallpaper={wallpaper}
                  activePreviewDevice={wallpaper.device === 'laptop' ? 'laptop' : 'mobile'}
                  showToggle={false}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2 min-h-[300px]">
                <img
                  src={wallpaper.url}
                  alt={wallpaper.title}
                  className="max-h-[360px] sm:max-h-[480px] w-auto max-w-full object-contain rounded-xl border-2 border-white/20 shadow-2xl"
                />
              </div>
            )}
          </div>

          {/* Right Column: Details & Downloads */}
          <div className="lg:col-span-5 p-4 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              {/* Category tag & Like button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 sm:px-3 py-1 bg-yestalgia-pink text-black text-[11px] sm:text-xs font-mono font-bold uppercase rounded-lg border border-black shadow-brutal-sm">
                    {wallpaper.category}
                  </span>
                  <span className="px-2 sm:px-2.5 py-1 bg-yestalgia-lime text-black text-[11px] sm:text-xs font-mono font-bold uppercase rounded-lg border border-black">
                    {wallpaper.resolution || '4K ULTRA HD'}
                  </span>
                </div>

                <button
                  onClick={handleLike}
                  className={`btn-brutal px-3 sm:px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-heading font-black uppercase cursor-pointer ${
                    isLiked ? 'bg-yestalgia-pink text-black' : 'bg-white text-black'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current text-red-600' : 'text-black'}`}
                  />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="font-display font-black text-2xl sm:text-3xl text-black uppercase tracking-tight leading-tight">
                  {wallpaper.title}
                </h1>
                <p className="font-body text-xs sm:text-sm text-gray-700 mt-1.5 leading-relaxed">
                  {wallpaper.description}
                </p>
              </div>

              {/* Creator Card */}
              <div className="p-3 bg-yestalgia-bg border-2 border-black rounded-2xl shadow-brutal-sm flex items-center gap-3">
                <img
                  src={wallpaper.author?.avatar}
                  alt={wallpaper.author?.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-black"
                />
                <div>
                  <p className="font-heading font-black text-xs text-black uppercase">
                    {wallpaper.author?.name || 'AstiWalls Creator'}
                  </p>
                  <p className="font-mono text-[11px] text-gray-600">
                    @{wallpaper.author?.username || 'artist'}
                  </p>
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <p className="font-mono text-[11px] sm:text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  🎨 Color Palette (Click to Copy)
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {wallpaper.colors?.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyColor(hex)}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white border-2 border-black rounded-lg shadow-brutal-sm hover:shadow-brutal transition-all text-xs font-mono cursor-pointer"
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-bold text-[11px] sm:text-xs">{hex}</span>
                      {copiedColor === hex && <Check className="w-3 h-3 text-green-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Cloud */}
              <div>
                <p className="font-mono text-[11px] sm:text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  🏷️ Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {wallpaper.tags?.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (onSelectTag) onSelectTag(tag);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-yestalgia-lime/60 border border-black text-xs font-mono font-medium rounded-lg transition-colors text-black cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DOWNLOAD HUB (LOGIN GATED) */}
            <div className="pt-4 border-t-2 border-black space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-gray-700">TOTAL DOWNLOADS:</span>
                <span className="bg-black text-yestalgia-lime font-black px-2.5 py-0.5 rounded-md">
                  {downloadCount.toLocaleString()}
                </span>
              </div>

              {!currentUser ? (
                <div className="p-3.5 sm:p-4 bg-yestalgia-lime/20 border-2 border-black rounded-2xl space-y-2.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-heading font-black uppercase text-black">
                    <Lock className="w-3.5 h-3.5 text-black" />
                    <span>Sign in to download in 4K</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateSignIn) onNavigateSignIn();
                    }}
                    className="w-full btn-brutal-lime py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-brutal cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Unlock 4K</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleDownload('Original 4K UHD')}
                    disabled={isDownloading}
                    className="w-full btn-brutal-lime py-3 sm:py-3.5 rounded-xl font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 text-black shadow-brutal hover:shadow-brutal-lg cursor-pointer"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{isDownloading ? 'Preparing 4K File...' : 'Download Original 4K Ultra HD'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload('Laptop 1080p', 1920, 1080)}
                      disabled={isDownloading}
                      className="btn-brutal bg-white hover:bg-yestalgia-teal hover:text-white py-2 sm:py-2.5 px-2.5 rounded-xl font-heading font-bold text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Laptop 1080p</span>
                    </button>

                    <button
                      onClick={() => handleDownload('Mobile QHD', 1080, 2400)}
                      disabled={isDownloading}
                      className="btn-brutal bg-white hover:bg-yestalgia-pink py-2 sm:py-2.5 px-2.5 rounded-xl font-heading font-bold text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile 9:16</span>
                    </button>
                  </div>

                  {/* Apply as Wallpaper Section */}
                  <div className="pt-2 border-t-2 border-black space-y-2">
                    <p className="font-mono text-[11px] font-bold text-black uppercase tracking-wider">
                      🖼️ Apply as Wallpaper
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApplyWallpaper('mobile')}
                        className="btn-brutal bg-yestalgia-pink hover:opacity-90 py-2.5 px-2.5 rounded-xl font-heading font-black text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-brutal-sm"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Set on Phone</span>
                      </button>

                      <button
                        onClick={() => handleApplyWallpaper('laptop')}
                        className="btn-brutal bg-yestalgia-teal text-white hover:opacity-90 py-2.5 px-2.5 rounded-xl font-heading font-black text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-brutal-sm"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Set on PC</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

