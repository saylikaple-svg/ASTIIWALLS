import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Check,
  ShieldCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '../data/initialWallpapers';
import { useAuth } from '../context/AuthContext';
import { publishWallpaperToCloud } from '../services/firebase';
import { validateWallpaperUpload, scanTextForAdultContent } from '../services/contentModerator';

export const UploadModal = ({ isOpen, onClose, onUploadSuccess, playClickSound }) => {
  if (!isOpen) return null;

  const { currentUser, showToast } = useAuth();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('90s Retro');
  const [deviceType, setDeviceType] = useState('mobile'); // 'mobile' | 'laptop' | 'both'
  const [tagsInput, setTagsInput] = useState('');
  const [extractedColors, setExtractedColors] = useState(['#F3AFCC', '#D7DD44', '#00966E', '#121212']);
  const [detectedResolution, setDetectedResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Content Safety States
  const [isScanningSafety, setIsScanningSafety] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState(null); // null | { isSafe: true } | { isSafe: false, reason: string }

  const compressImageToDataUrl = (img, maxWidth, maxHeight, quality = 0.80) => {
    try {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', quality);
    } catch (e) {
      return img.src;
    }
  };

  const extractColorsFromImage = (imgElement) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(imgElement, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100).data;

      const colors = [];
      const step = Math.floor(imageData.length / 4 / 4);

      for (let i = 0; i < imageData.length; i += step * 4) {
        const r = imageData[i].toString(16).padStart(2, '0');
        const g = imageData[i + 1].toString(16).padStart(2, '0');
        const b = imageData[i + 2].toString(16).padStart(2, '0');
        colors.push(`#${r}${g}${b}`.toUpperCase());
      }

      if (colors.length >= 4) {
        setExtractedColors(colors.slice(0, 4));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleFileProcess = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    // Fast text check on filename for adult content
    const nameCheck = scanTextForAdultContent(file.name);
    if (!nameCheck.isSafe) {
      setSafetyStatus({
        isSafe: false,
        reason: 'Explicit / Adult keyword detected in image filename. AstiWalls is an all-ages platform.'
      });
      showToast('Adult or explicit images are strictly prohibited!', 'error');
      return;
    }

    setIsScanningSafety(true);
    setSafetyStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();

      img.onload = async () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        setDetectedResolution(`${width} x ${height} px`);

        if (height > width * 1.15) {
          setDeviceType('mobile');
        } else if (width > height * 1.15) {
          setDeviceType('laptop');
        } else {
          setDeviceType('both');
        }

        extractColorsFromImage(img);

        // Perform Automated Content Safety / Nudity / Adult Scan
        const safetyResult = await validateWallpaperUpload({
          file,
          title,
          tags: tagsInput,
          imageElement: img,
        });

        setIsScanningSafety(false);

        if (!safetyResult.isSafe) {
          // Flagged for adult content
          setImagePreview(null);
          setThumbnailPreview(null);
          setSafetyStatus({
            isSafe: false,
            reason: safetyResult.reason || 'Image flagged for adult or explicit content.',
          });
          showToast('Upload rejected: Adult/NSFW content detected!', 'error');
        } else {
          // Passed safety check - Fast client compression for instant upload
          const optimizedWallpaper = compressImageToDataUrl(img, 1400, 1400, 0.80);
          const optimizedThumb = compressImageToDataUrl(img, 480, 480, 0.65);

          setImagePreview(optimizedWallpaper);
          setThumbnailPreview(optimizedThumb);
          setSafetyStatus({ isSafe: true });

          if (!title) {
            const fileNameClean = file.name.split('.')[0].replace(/[-_]/g, ' ');
            setTitle(fileNameClean.charAt(0).toUpperCase() + fileNameClean.slice(1));
          }
        }
      };

      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imagePreview) {
      showToast('Please upload an image for your wallpaper', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Please provide a title for your wallpaper', 'error');
      return;
    }

    // Re-verify text safety for title & tags
    const titleCheck = scanTextForAdultContent(title);
    if (!titleCheck.isSafe) {
      showToast('Adult/explicit words in title are not allowed!', 'error');
      return;
    }

    const tagsCheck = scanTextForAdultContent(tagsInput);
    if (!tagsCheck.isSafe) {
      showToast('Adult/explicit words in tags are not allowed!', 'error');
      return;
    }

    setIsSubmitting(true);
    if (playClickSound) playClickSound();

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      if (parsedTags.length === 0) {
        parsedTags.push(category.toLowerCase().replace(/\s+/g, '-'), deviceType, 'wallpaper');
      }

      const newWallpaper = {
        id: 'custom-' + Date.now(),
        title: title.trim(),
        description: `Uploaded by @${currentUser?.username || 'creator'} in high resolution.`,
        device: deviceType,
        category: category,
        tags: parsedTags,
        resolution: detectedResolution || '4K Ultra HD',
        width: deviceType === 'mobile' ? 1440 : 3840,
        height: deviceType === 'mobile' ? 3200 : 2160,
        aspect: deviceType === 'mobile' ? '9:16' : '16:9',
        colors: extractedColors,
        url: imagePreview,
        thumbnailUrl: thumbnailPreview || imagePreview,
        author: {
          id: currentUser?.id || '',
          name: currentUser?.name || 'Explorer',
          username: currentUser?.username || 'user',
          email: currentUser?.email || '',
          avatar:
            currentUser?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        },
        likes: 1,
        downloads: 0,
        featured: true,
        createdAt: new Date().toISOString().split('T')[0],
        createdAtTimestamp: Date.now(),
        isUserUploaded: true,
      };

      // 1. Immediately update gallery feed optimistically
      if (onUploadSuccess) {
        onUploadSuccess(newWallpaper);
      }

      // 2. Confetti celebration
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F3AFCC', '#D7DD44', '#00966E', '#F09341'],
      });

      // 3. Show success notification
      showToast(`Wallpaper "${newWallpaper.title}" published! 🚀`);

      // 4. Close modal immediately (no waiting or freezing)
      onClose();

      // 5. Cloud Firestore persistence in background
      publishWallpaperToCloud(newWallpaper).catch((err) => {
        console.warn('Cloud sync background notice:', err);
      });
    } catch (err) {
      console.error('Publish error:', err);
      showToast('Could not complete publish. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border-4 border-black rounded-3xl shadow-brutal-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-yestalgia-dark text-white px-6 py-4 flex items-center justify-between border-b-3 border-black">
          <div className="flex items-center gap-3">
            <span className="bg-yestalgia-pink text-black font-mono font-black text-xs px-2.5 py-0.5 rounded">
              STUDIO
            </span>
            <h2 className="font-heading font-black text-lg uppercase tracking-wide text-yestalgia-lime">
              Upload 4K Wallpaper
            </h2>
          </div>

          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              onClose();
            }}
            className="p-1.5 bg-yestalgia-pink hover:bg-white text-black font-bold rounded-xl border-2 border-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Guidelines Banner */}
        <div className="bg-zinc-100 border-b-2 border-black px-6 py-2.5 flex items-center justify-between text-xs font-mono text-gray-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Community Guidelines: Safe for all ages • No adult or explicit content</span>
          </div>
          <span className="hidden sm:inline bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold">
            MODERATED
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Dropzone */}
          <div>
            <label className="block font-mono text-xs font-bold text-black uppercase tracking-wider mb-2">
              1. Drop Your Wallpaper File
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-3 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-yestalgia-pink bg-yestalgia-pink/10 scale-[1.01]'
                  : safetyStatus && !safetyStatus.isSafe
                  ? 'border-red-600 bg-red-50'
                  : 'border-black bg-yestalgia-bg hover:bg-yestalgia-bg-muted'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {isScanningSafety ? (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-black animate-spin" />
                  <p className="font-heading font-black text-sm uppercase text-black">
                    🛡️ AI Safety Scan in progress...
                  </p>
                  <p className="font-mono text-xs text-gray-600">
                    Checking image for explicit and adult content
                  </p>
                </div>
              ) : imagePreview ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="relative max-h-44 max-w-[200px] rounded-xl overflow-hidden border-2 border-black shadow-brutal-sm">
                    <img
                      src={imagePreview}
                      alt="Upload Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 border border-green-800 text-xs font-mono font-bold rounded-md">
                      <Check className="w-3.5 h-3.5" /> Passed Safety Check
                    </span>
                    <p className="font-mono text-xs text-gray-700">
                      Resolution: <strong className="text-black">{detectedResolution}</strong>
                    </p>
                    <p className="font-mono text-xs text-gray-700">
                      Format: <strong className="text-black uppercase">{deviceType}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setThumbnailPreview(null);
                        setSafetyStatus(null);
                      }}
                      className="text-xs font-mono text-red-600 hover:underline font-bold cursor-pointer"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-2">
                  <div className="w-12 h-12 mx-auto bg-yestalgia-lime border-2 border-black rounded-xl flex items-center justify-center shadow-brutal-sm">
                    <Upload className="w-6 h-6 text-black" />
                  </div>
                  <p className="font-heading font-black text-base text-black uppercase">
                    Drag & Drop Wallpaper or Click to Browse
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    Supports high-res JPG, PNG, WebP (up to 4K / 5K)
                  </p>
                </div>
              )}
            </div>

            {/* Adult Content Error Alert */}
            {safetyStatus && !safetyStatus.isSafe && (
              <div className="mt-3 p-4 bg-red-100 border-2 border-red-600 rounded-2xl flex items-start gap-3 animate-fadeIn">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-body space-y-1">
                  <p className="font-heading font-black uppercase text-red-700">
                    ⚠️ Upload Rejected: Adult Content Detected
                  </p>
                  <p className="text-red-800 leading-relaxed font-medium">
                    {safetyStatus.reason}
                  </p>
                  <p className="text-gray-600 text-[11px] font-mono">
                    Please upload standard, clean wallpapers suitable for all audiences.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                2. Wallpaper Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Horizon City"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm font-heading font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yestalgia-pink"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                3. Category / Style
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm font-heading font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yestalgia-pink"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Device Target Format */}
          <div>
            <label className="block font-mono text-xs font-bold text-black uppercase tracking-wider mb-2">
              4. Target Device
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDeviceType('mobile')}
                className={`py-3 px-3 rounded-xl border-2 border-black font-heading font-black text-xs uppercase flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  deviceType === 'mobile'
                    ? 'bg-yestalgia-pink text-black shadow-brutal -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>Mobile (9:16)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('laptop')}
                className={`py-3 px-3 rounded-xl border-2 border-black font-heading font-black text-xs uppercase flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  deviceType === 'laptop'
                    ? 'bg-yestalgia-teal text-white shadow-brutal -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>Laptop (16:9)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('both')}
                className={`py-3 px-3 rounded-xl border-2 border-black font-heading font-black text-xs uppercase flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  deviceType === 'both'
                    ? 'bg-yestalgia-lime text-black shadow-brutal -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Universal</span>
              </button>
            </div>
          </div>

          {/* Tags & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                5. Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="synthwave, neon, 4k, landscape"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-yestalgia-pink"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                6. Palette Colors
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl shadow-brutal-sm">
                {extractedColors.map((hex, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div
                      className="w-5 h-5 rounded-md border border-black"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[10px] font-mono">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-brutal bg-white px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !imagePreview || (safetyStatus && !safetyStatus.isSafe)}
              className={`px-6 py-2.5 rounded-xl font-heading font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-brutal transition-all ${
                !imagePreview || (safetyStatus && !safetyStatus.isSafe)
                  ? 'bg-gray-300 text-gray-500 border-2 border-gray-400 cursor-not-allowed'
                  : 'btn-brutal-lime hover:shadow-brutal-lg cursor-pointer'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Wallpaper'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
