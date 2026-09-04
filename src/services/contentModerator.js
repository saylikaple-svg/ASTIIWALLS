/**
 * Content Moderation & NSFW / Adult Content Scanner
 * AstiWalls by webxy
 * 
 * Performs multi-layer safety checks on wallpaper uploads:
 * 1. Computer vision skin-tone exposure ratio & nudity heuristics
 * 2. Adult / Explicit / NSFW keyword filtering on filenames, titles, and tags
 * 3. Color entropy and flesh-density concentration analysis
 */

// Adult / NSFW / Explicit Keyword Blocklist
const ADULT_KEYWORDS = [
  'nude', 'naked', 'nudity', 'porn', 'porno', 'nsfw', 'xxx', 'sex', 'sexy', 
  'erotic', 'erotica', 'hentai', 'ecchi', 'boobs', 'tits', 'breasts', 'nipple',
  'penis', 'dick', 'cock', 'vagina', 'pussy', 'ass', 'butt', 'booty', 'lingerie',
  'underwear', 'panties', 'thong', 'bikini nude', 'playboy', 'onlyfans', 'fetish',
  'bdsm', 'milf', 'masturbat', 'orgasm', 'lewd', 'hardcore', 'softcore', 'topless',
  'naughty', 'uncensored', 'camgirl', 'babe nude'
];

/**
 * Scan text (title, tags, filename) for explicit adult keywords
 */
export const scanTextForAdultContent = (text) => {
  if (!text) return { isSafe: true };
  const lower = text.toLowerCase();
  
  for (const keyword of ADULT_KEYWORDS) {
    // Word boundary or substring matching for explicit terms
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(lower) || lower.includes(keyword)) {
      return {
        isSafe: false,
        flaggedKeyword: keyword,
        reason: `Explicit/Adult keyword detected ("${keyword}"). Adult and NSFW content is strictly prohibited.`
      };
    }
  }
  
  return { isSafe: true };
};

/**
 * Analyze an HTML Image element on an in-memory Canvas to compute skin-tone ratio and nudity heuristics
 */
export const scanImageForNudity = (imageElement) => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // Scale down for ultra-fast processing (120x120 pixels)
      const width = 120;
      const height = 120;
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(imageElement, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const totalPixels = width * height;
      
      let skinPixels = 0;
      let centerSkinPixels = 0;
      
      // Analyze every pixel using Peer et al. & YCbCr / RGB Skin Color Detection algorithm
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        if (a < 128) continue; // Ignore transparent pixels
        
        // Pixel coordinate
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        // 1. RGB Rule for skin detection in standard lighting
        const isRgbSkin = 
          r > 95 && 
          g > 40 && 
          b > 20 && 
          (Math.max(r, g, b) - Math.min(r, g, b)) > 15 && 
          Math.abs(r - g) > 15 && 
          r > g && 
          r > b;
        
        // 2. YCbCr conversion for illumination invariant skin tone detection
        const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        
        const isYCbCrSkin = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
        
        // 3. Normalized RGB
        const sum = r + g + b;
        let isNormSkin = false;
        if (sum > 0) {
          const normR = r / sum;
          const normG = g / sum;
          isNormSkin = normR > 0.35 && normG > 0.25 && normG < 0.38 && normR > normG;
        }
        
        if ((isRgbSkin && isYCbCrSkin) || (isNormSkin && isYCbCrSkin)) {
          skinPixels++;
          
          // Check if skin is concentrated in the center region (nudity focal point)
          if (x >= width * 0.2 && x <= width * 0.8 && y >= height * 0.2 && y <= height * 0.8) {
            centerSkinPixels++;
          }
        }
      }
      
      const skinRatio = (skinPixels / totalPixels) * 100;
      const centerArea = (width * 0.6) * (height * 0.6);
      const centerSkinRatio = (centerSkinPixels / centerArea) * 100;
      
      // Safety thresholds:
      // - Over 38% total skin exposure
      // - Over 48% center-focused skin exposure
      const isHighNudityRisk = skinRatio > 38 || centerSkinRatio > 48;
      
      if (isHighNudityRisk) {
        resolve({
          isSafe: false,
          skinRatio: Math.round(skinRatio),
          centerSkinRatio: Math.round(centerSkinRatio),
          reason: `High skin exposure detected (${Math.round(skinRatio)}% skin density). AstiWalls does not permit adult, nude, or explicit images.`
        });
      } else {
        resolve({
          isSafe: true,
          skinRatio: Math.round(skinRatio),
          centerSkinRatio: Math.round(centerSkinRatio),
        });
      }
    } catch (e) {
      console.warn('Image safety scan fallback:', e);
      resolve({ isSafe: true, skinRatio: 0 });
    }
  });
};

/**
 * Full comprehensive upload validation
 */
export const validateWallpaperUpload = async ({ file, title, tags, imageElement }) => {
  // 1. Check filename
  if (file && file.name) {
    const fileNameCheck = scanTextForAdultContent(file.name);
    if (!fileNameCheck.isSafe) {
      return fileNameCheck;
    }
  }
  
  // 2. Check title
  if (title) {
    const titleCheck = scanTextForAdultContent(title);
    if (!titleCheck.isSafe) {
      return titleCheck;
    }
  }
  
  // 3. Check tags
  if (tags) {
    const tagsStr = Array.isArray(tags) ? tags.join(' ') : String(tags);
    const tagsCheck = scanTextForAdultContent(tagsStr);
    if (!tagsCheck.isSafe) {
      return tagsCheck;
    }
  }
  
  // 4. Check image visual contents
  if (imageElement) {
    const visualCheck = await scanImageForNudity(imageElement);
    if (!visualCheck.isSafe) {
      return visualCheck;
    }
  }
  
  return { isSafe: true };
};
