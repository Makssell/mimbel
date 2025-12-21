/**
 * Game utility functions for formatting, calculations, and helpers
 */

/**
 * Format time display in seconds to human-readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "1.5s", "2m 30s")
 */
export const formatTimeDisplay = (seconds) => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
    }
  }
};

/**
 * Calculate average time per guess from array of guess times
 * @param {Array<number>} guessTimes - Array of guess times in milliseconds
 * @returns {string} Formatted average time
 */
export const calculateAverageTime = (guessTimes) => {
  // Ensure guessTimes is an array
  const safeGuessTimes = Array.isArray(guessTimes) ? guessTimes : [];
  if (safeGuessTimes.length === 0) return "0.0s";
  const totalTime = safeGuessTimes.reduce((sum, time) => sum + time, 0);
  const averageSeconds = totalTime / safeGuessTimes.length / 1000;
  return formatTimeDisplay(averageSeconds); // Format with minutes/seconds
};

/**
 * Update streak tracking
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} currentStreak - Current streak count
 * @param {number} longestStreak - Longest streak count
 * @returns {Object} Updated streak values {currentStreak, longestStreak}
 */
export const updateStreak = (isCorrect, currentStreak, longestStreak) => {
  if (isCorrect) {
    const newCurrentStreak = currentStreak + 1;
    const newLongestStreak = newCurrentStreak > longestStreak ? newCurrentStreak : longestStreak;
    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak
    };
  } else {
    return {
      currentStreak: 0,
      longestStreak: longestStreak
    };
  }
};

/**
 * Record guess time and update fastest guess if applicable
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number|null} lastGuessTime - Timestamp of last guess
 * @param {string|null} fastestGuess - Current fastest guess formatted string
 * @param {Array<number>} guessTimes - Array of previous guess times
 * @returns {Object} Updated guess time data {guessTimes, fastestGuess}
 */
export const recordGuessTime = (isCorrect, lastGuessTime, fastestGuess, guessTimes) => {
  // Ensure guessTimes is an array
  const safeGuessTimes = Array.isArray(guessTimes) ? guessTimes : [];
  const newGuessTimes = [...safeGuessTimes];
  let newFastestGuess = fastestGuess;
  
  if (lastGuessTime) {
    const guessTime = Date.now() - lastGuessTime;
    newGuessTimes.push(guessTime);
    
    // Update fastest guess if this is faster (store formatted time for display)
    // Only update fastest guess for correct answers
    if (isCorrect) {
      const guessTimeSeconds = guessTime / 1000;
      const currentFastest = fastestGuess ? parseFloat(fastestGuess.replace(/[ms]/g, '')) : Infinity;
      
      if (guessTimeSeconds < currentFastest) {
        newFastestGuess = formatTimeDisplay(guessTimeSeconds);
      }
    }
  }
  
  return {
    guessTimes: newGuessTimes,
    fastestGuess: newFastestGuess
  };
};

/**
 * Get division type names for display
 * @param {Array<number>} divisionTypeIds - Array of division type IDs
 * @param {Array} regionalDivisionTypes - Array of division type objects
 * @returns {string|null} Comma-separated division type names or null
 */
export const getDivisionTypeNames = (divisionTypeIds, regionalDivisionTypes) => {
  console.log('getDivisionTypeNames called with:', divisionTypeIds);
  console.log('regionalDivisionTypes available:', regionalDivisionTypes);
  
  if (!divisionTypeIds || !Array.isArray(divisionTypeIds) || divisionTypeIds.length === 0) {
    console.log('getDivisionTypeNames returning null - no valid division type IDs');
    return null;
  }
  
  const divisionTypeNames = divisionTypeIds.map(id => {
    const divisionType = regionalDivisionTypes.find(dt => dt.id === id);
    console.log(`Looking for division type ID ${id}, found:`, divisionType);
    return divisionType ? divisionType.type_name : `Unknown (${id})`;
  });
  
  const result = divisionTypeNames.join(', ');
  console.log('getDivisionTypeNames returning:', result);
  return result;
};

/**
 * Check if all divisions are selected for a country
 * @param {string} countryName - Name of the country
 * @param {Array<number>} divisionTypeIds - Array of selected division type IDs
 * @param {Array} regionalCountries - Array of country objects
 * @param {Array} regionalDivisionTypes - Array of division type objects
 * @returns {boolean} Whether all divisions are selected
 */
export const areAllDivisionsSelected = (countryName, divisionTypeIds, regionalCountries, regionalDivisionTypes) => {
  if (!divisionTypeIds || !Array.isArray(divisionTypeIds) || divisionTypeIds.length === 0) {
    return false;
  }
  
  // Find the country
  const country = regionalCountries.find(c => c.name === countryName);
  if (!country) {
    return false;
  }
  
  // Get all active division types for this country
  const allCountryDivisionTypes = regionalDivisionTypes.filter(
    dt => dt.country_id === country.id && dt.is_active
  );
  
  // Check if all division types are selected
  return allCountryDivisionTypes.length > 0 && 
         allCountryDivisionTypes.every(dt => divisionTypeIds.includes(dt.id));
};

/**
 * Format game date for display
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date string (e.g., "5 minutes ago", "2 hours ago", "3 days ago")
 */
export const formatGameDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};
