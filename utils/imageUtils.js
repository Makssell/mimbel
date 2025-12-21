/**
 * Image utility functions for preloading and caching flag images
 */

/**
 * Preload images without blocking the UI
 * @param {Array} flags - Array of flag objects with image_url property
 * @param {Object} imageCacheRef - Ref object containing Map to cache loaded images
 * @param {Object} loadingFlagsRef - Ref object containing Set to track currently loading images
 */
export const preloadImages = (flags, imageCacheRef, loadingFlagsRef) => {
  // Access the actual Map/Set from refs
  const imageCache = imageCacheRef.current || imageCacheRef;
  const loadingFlags = loadingFlagsRef.current || loadingFlagsRef;
  
  flags.forEach(flag => {
    if (!imageCache.has(flag.image_url) && !loadingFlags.has(flag.image_url)) {
      loadingFlags.add(flag.image_url);
      const img = new Image();
      img.onload = () => {
        imageCache.set(flag.image_url, true);
        loadingFlags.delete(flag.image_url);
      };
      img.onerror = () => {
        // Still cache the attempt to avoid repeated failed loads
        imageCache.set(flag.image_url, false);
        loadingFlags.delete(flag.image_url);
      };
      img.src = flag.image_url;
    }
  });
};
