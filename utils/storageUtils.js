/**
 * Storage utility functions for LocalStorage operations
 * Handles game history, best scores, and active game persistence
 */

/**
 * Generate a unique key for game configuration
 * @param {Object} gameSettings - Game settings object
 * @returns {string} 8-character hex hash of the configuration
 */
export const generateGameConfigKey = (gameSettings) => {
  // Create a unique key based on game configuration
  const config = {
    gameMode: gameSettings.gameMode,
    gameType: gameSettings.gameType,
    country: gameSettings.country,
    region: gameSettings.region,
    territories: gameSettings.territories,
    divisionTypes: gameSettings.divisionTypes,
    mode: gameSettings.mode
  };
  
  // Create a hash-like string from the config
  const configString = JSON.stringify(config);
  let hash = 0;
  for (let i = 0; i < configString.length; i++) {
    const char = configString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to a positive hex string and take first 8 characters
  return Math.abs(hash).toString(16).padStart(8, '0');
};

/**
 * Save game to history and update best scores
 * @param {Object} gameStats - Game statistics
 * @param {Object} gameStateSnapshot - Snapshot of game state
 * @param {Function} setGameHistory - State setter for game history
 * @param {Function} updateBestScoresCallback - Callback to update best scores
 */
export const saveGameToHistory = (gameStats, gameStateSnapshot, setGameHistory, updateBestScoresCallback) => {
  try {
    const gameRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      gameStats,
      gameStateSnapshot,
      isActive: false
    };

    const existingHistory = JSON.parse(localStorage.getItem('flagGameHistory') || '[]');
    const updatedHistory = [gameRecord, ...existingHistory].slice(0, 100); // Keep last 100 games
    
    localStorage.setItem('flagGameHistory', JSON.stringify(updatedHistory));
    setGameHistory(updatedHistory);

    // Update best scores
    updateBestScoresCallback(gameStats, gameStateSnapshot);
  } catch (error) {
    console.error('Error saving game to history:', error);
  }
};

/**
 * Update best scores based on game performance
 * @param {Object} gameStats - Game statistics
 * @param {Object} gameStateSnapshot - Snapshot of game state
 * @param {Function} setBestScores - State setter for best scores
 */
export const updateBestScores = (gameStats, gameStateSnapshot, setBestScores) => {
  try {
    // Don't save 0 score games as best scores
    if (gameStats.score <= 0) {
      console.log('Skipping best score update for 0 score game');
      return;
    }

    const configKey = generateGameConfigKey(gameStats.gameSettings);
    const existingBestScores = JSON.parse(localStorage.getItem('flagGameBestScores') || '{}');
    
    const currentBest = existingBestScores[configKey];
    let shouldUpdate = false;

    if (!currentBest) {
      shouldUpdate = true;
    } else {
      // Compare scores based on game mode
      if (gameStats.gameSettings.mode === 'Time Attack') {
        // For Time Attack, higher score is better
        shouldUpdate = gameStats.score > currentBest.score;
      } else {
        // For other modes, use a more nuanced comparison
        const currentAccuracy = parseFloat(currentBest.accuracy);
        const newAccuracy = parseFloat(gameStats.accuracy);
        const accuracyDiff = newAccuracy - currentAccuracy;
        const scoreDiff = gameStats.score - currentBest.score;
        
        // Update if:
        // 1. Accuracy is significantly higher (>5% difference)
        // 2. Accuracy is similar (±5%) but score is higher
        // 3. Score is significantly higher (>10 points) even with slightly lower accuracy
        if (accuracyDiff > 5) {
          shouldUpdate = true;
        } else if (Math.abs(accuracyDiff) <= 5 && scoreDiff > 0) {
          shouldUpdate = true;
        } else if (scoreDiff > 10 && newAccuracy >= 90) {
          // Allow higher scores to replace lower scores if accuracy is still very good (≥90%)
          shouldUpdate = true;
        }
      }
    }

    if (shouldUpdate) {
      const newBestScore = {
        ...gameStats,
        gameStateSnapshot,
        achievedAt: new Date().toISOString()
      };
      
      existingBestScores[configKey] = newBestScore;
      localStorage.setItem('flagGameBestScores', JSON.stringify(existingBestScores));
      setBestScores(existingBestScores);
    }
  } catch (error) {
    console.error('Error updating best scores:', error);
  }
};

/**
 * Load game history and best scores from LocalStorage
 * @param {Function} setGameHistory - State setter for game history
 * @param {Function} setBestScores - State setter for best scores
 */
export const loadGameHistory = (setGameHistory, setBestScores) => {
  try {
    const history = JSON.parse(localStorage.getItem('flagGameHistory') || '[]');
    const bestScores = JSON.parse(localStorage.getItem('flagGameBestScores') || '{}');
    
    setGameHistory(history);
    setBestScores(bestScores);
  } catch (error) {
    console.error('Error loading game history:', error);
    setGameHistory([]);
    setBestScores({});
  }
};

/**
 * Clear game history and best scores
 * @param {Function} setGameHistory - State setter for game history
 * @param {Function} setBestScores - State setter for best scores
 */
export const clearGameHistory = (setGameHistory, setBestScores) => {
  try {
    localStorage.removeItem('flagGameHistory');
    localStorage.removeItem('flagGameBestScores');
    setGameHistory([]);
    setBestScores({});
  } catch (error) {
    console.error('Error clearing game history:', error);
  }
};

/**
 * Save active game to LocalStorage
 * @param {Object} gameState - Current game state
 * @param {Object} gameStats - Current game statistics
 * @param {Function} setActiveGame - State setter for active game
 * @param {Function} setHasActiveGame - State setter for has active game flag
 * @param {Function} buildGameSettings - Function to build game settings
 * @param {Function} getTotalFlagsCount - Function to get total flags count
 * @param {Function} getRemainingFlagsCount - Function to get remaining flags count
 * @param {Function} calculateAverageTime - Function to calculate average time
 */
export const saveActiveGame = (
  gameState,
  gameStats,
  setActiveGame,
  setHasActiveGame,
  buildGameSettings,
  getTotalFlagsCount,
  getRemainingFlagsCount,
  calculateAverageTime
) => {
  if (!gameState.gameStarted) return;
  
  // Don't save Time Attack games - they should be quick, focused sessions
  if (gameState.timeAttackMode) {
    console.log('Skipping save for Time Attack mode');
    return;
  }
  
  try {
    const activeGameData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      gameStats: {
        score: gameStats.score,
        totalAttempts: gameStats.totalAttempts,
        accuracy: gameStats.totalAttempts > 0 ? ((gameStats.score / gameStats.totalAttempts) * 100).toFixed(1) : 0,
        timeElapsed: gameStats.gameStartTime ? Date.now() - gameStats.gameStartTime : 0,
        endState: "active",
        gameType: gameState.gameMode === "regional" ? gameState.regionalGameType : gameState.gameType,
        gameSettings: buildGameSettings(),
        totalFlags: getTotalFlagsCount(),
        remainingFlags: getRemainingFlagsCount(),
        longestStreak: gameStats.longestStreak,
        averageTimePerGuess: calculateAverageTime(),
        fastestGuess: gameStats.fastestGuess
      },
      gameState: {
        gameMode: gameState.gameMode,
        gameType: gameState.gameMode === "regional" ? gameState.regionalGameType : gameState.gameType,
        selectedRegionalCountry: gameState.selectedRegionalCountry,
        selectedDivisionTypes: gameState.selectedDivisionTypes,
        selectedContinent: gameState.selectedContinent,
        includeTerritories: gameState.includeTerritories,
        timeAttackMode: gameState.timeAttackMode,
        regionalInfiniteMode: gameState.regionalInfiniteMode,
        infiniteMode: gameState.infiniteMode,
        typingMode: gameState.typingMode,
        regionalTypingMode: gameState.regionalTypingMode,
        flashMode: gameState.flashMode,
        regionalFlashMode: gameState.regionalFlashMode,
        regionalFlags: gameState.regionalFlags,
        filteredFlags: gameState.filteredFlags,
        usedFlags: gameState.usedFlags,
        currentFlag: gameState.currentFlag,
        options: gameState.options,
        flagOptions: gameState.flagOptions,
        health: gameState.health,
        timeRemaining: gameState.timeRemaining,
        timerStarted: gameState.timerStarted,
        firstGuessMade: gameState.firstGuessMade,
        guessTimes: gameState.guessTimes,
        lastGuessTime: gameState.lastGuessTime,
        resumedQuestionFlagId: gameState.resumedQuestionFlagId
      },
      isActive: true
    };
    
    localStorage.setItem('flagGameActiveGame', JSON.stringify(activeGameData));
    setActiveGame(activeGameData);
    setHasActiveGame(true);
  } catch (error) {
    console.error('Error saving active game:', error);
  }
};

/**
 * Load active game from LocalStorage
 * @param {Function} setActiveGame - State setter for active game
 * @param {Function} setHasActiveGame - State setter for has active game flag
 * @returns {Object|null} Active game data or null
 */
export const loadActiveGame = (setActiveGame, setHasActiveGame) => {
  try {
    const activeGameData = localStorage.getItem('flagGameActiveGame');
    if (activeGameData) {
      const parsed = JSON.parse(activeGameData);
      
      // Check if this is a Time Attack game (which shouldn't be saved)
      if (parsed.isActive && parsed.gameStats?.gameSettings?.mode?.includes('Time Attack')) {
        console.log('Found Time Attack game in localStorage, clearing it...');
        localStorage.removeItem('flagGameActiveGame');
        setHasActiveGame(false);
        setActiveGame(null);
        return null;
      }
      
      if (parsed.isActive) {
        setActiveGame(parsed);
        setHasActiveGame(true);
        return parsed;
      }
    }
    setHasActiveGame(false);
    setActiveGame(null);
    return null;
  } catch (error) {
    console.error('Error loading active game:', error);
    setHasActiveGame(false);
    setActiveGame(null);
    return null;
  }
};

/**
 * Clear active game from LocalStorage
 * @param {Function} setActiveGame - State setter for active game
 * @param {Function} setHasActiveGame - State setter for has active game flag
 */
export const clearActiveGame = (setActiveGame, setHasActiveGame) => {
  try {
    localStorage.removeItem('flagGameActiveGame');
    setHasActiveGame(false);
    setActiveGame(null);
  } catch (error) {
    console.error('Error clearing active game:', error);
  }
};
