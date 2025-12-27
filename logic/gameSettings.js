/**
 * Game Settings Logic
 * Functions for building game settings and calculating flags counts
 */

/**
 * Build game settings object from current state
 * @param {Object} state - Current game state
 * @returns {Object} Formatted game settings
 */
export const buildGameSettings = (state) => {
  const isRegionalMode = state.gameMode === "regional";
  const currentGameType = isRegionalMode ? state.regionalGameType : state.gameType;
  
  return {
    gameMode: isRegionalMode ? "Regional Flags" : "Country Flags",
    gameType: currentGameType === "flag-to-country" ? "Flag → Country" : 
              currentGameType === "country-to-flag" ? "Country → Flag" :
              currentGameType === "map-to-flag" ? "Map → Flag" :
              currentGameType === "flag-to-map" ? "Flag → Map" :
              currentGameType === "flag-to-region" ? "Flag → Region" :
              currentGameType === "region-to-flag" ? "Region → Flag" : "Unknown",
    country: isRegionalMode && state.selectedRegionalCountry ? state.selectedRegionalCountry.name : null,
    region: !isRegionalMode ? (
      state.selectedContinent === "world" ? "World" :
      state.selectedContinent === "1" ? "Africa" :
      state.selectedContinent === "2" ? "Asia" :
      state.selectedContinent === "3" ? "Europe" :
      state.selectedContinent === "4" ? "North America" :
      state.selectedContinent === "5" ? "South America" :
      state.selectedContinent === "6" ? "Oceania" : "Unknown"
    ) : null,
    territories: !isRegionalMode ? (state.includeTerritories ? "Included" : "Excluded") : null,
    divisionTypes: isRegionalMode && state.selectedDivisionTypes.length > 0 ? state.selectedDivisionTypes : null,
    mode: state.timeAttackMode ? "Time Attack" : (isRegionalMode ? state.regionalInfiniteMode : state.infiniteMode) ? "Infinite" : "Standard",
    typingMode: isRegionalMode ? state.regionalTypingMode : state.typingMode,
    flashMode: isRegionalMode ? state.regionalFlashMode : state.flashMode
  };
};

/**
 * Build game settings from snapshot (for end screen)
 * @param {Object} gameState - Game state snapshot
 * @returns {Object} Formatted game settings
 */
export const buildGameSettingsFromSnapshot = (gameState) => {
  const isRegionalMode = gameState.gameMode === "regional";
  const currentGameType = gameState.gameType;
  
  return {
    gameMode: isRegionalMode ? "Regional Flags" : "Country Flags",
    gameType: currentGameType === "flag-to-country" ? "Flag → Country" : 
              currentGameType === "country-to-flag" ? "Country → Flag" :
              currentGameType === "map-to-flag" ? "Map → Flag" :
              currentGameType === "flag-to-map" ? "Flag → Map" :
              currentGameType === "flag-to-region" ? "Flag → Region" :
              currentGameType === "region-to-flag" ? "Region → Flag" : "Unknown",
    country: isRegionalMode && gameState.selectedRegionalCountry ? gameState.selectedRegionalCountry.name : null,
    region: !isRegionalMode ? (
      gameState.selectedContinent === "world" ? "World" :
      gameState.selectedContinent === "1" ? "Africa" :
      gameState.selectedContinent === "2" ? "Asia" :
      gameState.selectedContinent === "3" ? "Europe" :
      gameState.selectedContinent === "4" ? "North America" :
      gameState.selectedContinent === "5" ? "South America" :
      gameState.selectedContinent === "6" ? "Oceania" : "Unknown"
    ) : null,
    territories: !isRegionalMode ? (gameState.includeTerritories ? "Included" : "Excluded") : null,
    divisionTypes: isRegionalMode && gameState.selectedDivisionTypes && gameState.selectedDivisionTypes.length > 0 ? gameState.selectedDivisionTypes : null,
    mode: gameState.timeAttackMode ? "Time Attack" : (isRegionalMode ? gameState.regionalInfiniteMode : gameState.infiniteMode) ? "Infinite" : "Standard",
    typingMode: isRegionalMode ? (gameState.regionalTypingMode || false) : (gameState.typingMode || false),
    flashMode: isRegionalMode ? (gameState.regionalFlashMode || false) : (gameState.flashMode || false)
  };
};

/**
 * Get total flags count from current state
 * @param {Object} state - Current game state
 * @returns {number} Total flags count
 */
export const getTotalFlagsCount = (state) => {
  const isRegionalMode = state.gameMode === "regional";
  if (isRegionalMode) {
    return state.regionalFlags.length || 0;
  } else {
    return state.filteredFlags.length || 0;
  }
};

/**
 * Get total flags count from snapshot
 * @param {Object} gameState - Game state snapshot
 * @returns {number} Total flags count
 */
export const getTotalFlagsCountFromSnapshot = (gameState) => {
  const isRegionalMode = gameState.gameMode === "regional";
  if (isRegionalMode) {
    return gameState.regionalFlags.length || 0;
  } else {
    return gameState.filteredFlags.length || 0;
  }
};

/**
 * Get remaining flags count from current state
 * @param {Object} state - Current game state
 * @returns {number} Remaining flags count
 */
export const getRemainingFlagsCount = (state) => {
  const totalFlags = getTotalFlagsCount(state);
  return totalFlags - state.usedFlags.length;
};

/**
 * Get remaining flags count from snapshot
 * @param {Object} gameState - Game state snapshot
 * @param {number|Array} usedFlagsCount - Count of used flags or array
 * @returns {number} Remaining flags count
 */
export const getRemainingFlagsCountFromSnapshot = (gameState, usedFlagsCount) => {
  const totalFlags = getTotalFlagsCountFromSnapshot(gameState);
  
  // Ensure usedFlagsCount is a number
  let actualUsedFlagsCount = 0;
  if (typeof usedFlagsCount === 'number') {
    actualUsedFlagsCount = usedFlagsCount;
  } else if (Array.isArray(usedFlagsCount)) {
    actualUsedFlagsCount = usedFlagsCount.length;
  } else if (gameState.usedFlags && Array.isArray(gameState.usedFlags)) {
    actualUsedFlagsCount = gameState.usedFlags.length;
  }
  
  console.log('getRemainingFlagsCountFromSnapshot:', {
    totalFlags,
    usedFlagsCount,
    actualUsedFlagsCount,
    gameStateUsedFlags: gameState.usedFlags,
    gameStateUsedFlagsLength: gameState.usedFlags?.length
  });
  
  return totalFlags - actualUsedFlagsCount;
};
