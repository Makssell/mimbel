/**
 * Share URL Utilities
 * Functions for generating and parsing share URLs
 */

/**
 * Generate share URL from game state snapshot
 * @param {Object} gameStateSnapshot - Game state snapshot
 * @returns {string} Share URL
 */
export const generateShareUrl = (gameStateSnapshot) => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin + window.location.pathname
    : '';

  const params = new URLSearchParams();
  
  // Add share parameter
  params.set('share', '1');
  
  // Game mode
  const isRegional = gameStateSnapshot.gameMode === 'regional';
  params.set('mode', isRegional ? 'regional' : 'standard');
  
  if (isRegional) {
    // Regional mode parameters
    params.set('type', gameStateSnapshot.gameType || 'flag-to-region');
    if (gameStateSnapshot.selectedRegionalCountry?.id) {
      params.set('country', gameStateSnapshot.selectedRegionalCountry.id.toString());
    }
    if (gameStateSnapshot.selectedDivisionTypes?.length > 0) {
      params.set('divisions', gameStateSnapshot.selectedDivisionTypes.join(','));
    }
    if (gameStateSnapshot.regionalInfiniteMode) {
      params.set('infinite', '1');
    }
    if (gameStateSnapshot.regionalTypingMode) {
      params.set('typing', '1');
    }
    if (gameStateSnapshot.regionalFlashMode) {
      params.set('flash', '1');
    }
  } else {
    // Standard mode parameters
    params.set('type', gameStateSnapshot.gameType || 'flag-to-country');
    if (gameStateSnapshot.selectedContinent) {
      params.set('continent', gameStateSnapshot.selectedContinent);
    }
    if (gameStateSnapshot.includeTerritories) {
      params.set('territories', '1');
    }
    if (gameStateSnapshot.infiniteMode) {
      params.set('infinite', '1');
    }
    if (gameStateSnapshot.typingMode) {
      params.set('typing', '1');
    }
    if (gameStateSnapshot.flashMode) {
      params.set('flash', '1');
    }
  }
  
  // Time attack mode (applies to both)
  if (gameStateSnapshot.timeAttackMode) {
    params.set('timeAttack', '1');
  }
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Parse share URL parameters and return settings object
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object|null} Parsed settings or null if invalid
 */
export const parseShareUrl = (searchParams) => {
  // Check if this is a share link
  if (searchParams.get('share') !== '1') {
    return null;
  }
  
  const mode = searchParams.get('mode') || 'standard';
  const settings = {
    gameMode: mode,
    timeAttackMode: searchParams.get('timeAttack') === '1'
  };
  
  if (mode === 'regional') {
    // Regional mode settings
    settings.gameType = searchParams.get('type') || 'flag-to-region';
    const countryId = searchParams.get('country');
    if (countryId) {
      settings.selectedRegionalCountryId = parseInt(countryId);
    }
    const divisionsParam = searchParams.get('divisions');
    if (divisionsParam) {
      settings.selectedDivisionTypes = divisionsParam.split(',').map(id => parseInt(id));
    }
    settings.regionalInfiniteMode = searchParams.get('infinite') === '1';
    settings.regionalTypingMode = searchParams.get('typing') === '1';
    settings.regionalFlashMode = searchParams.get('flash') === '1';
  } else {
    // Standard mode settings
    settings.gameType = searchParams.get('type') || 'flag-to-country';
    settings.selectedContinent = searchParams.get('continent') || 'world';
    settings.includeTerritories = searchParams.get('territories') === '1';
    settings.infiniteMode = searchParams.get('infinite') === '1';
    settings.typingMode = searchParams.get('typing') === '1';
    settings.flashMode = searchParams.get('flash') === '1';
  }
  
  return settings;
};

/**
 * Copy URL to clipboard
 * @param {string} url - URL to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

