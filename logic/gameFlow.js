/**
 * Game Flow Logic
 * Functions for starting, ending, and managing game flow
 */

import { fetchRegionalFlags } from "../services/flagService";
import { clearActiveGame } from "../utils/storageUtils";
import { calculateAverageTime } from "../utils/gameUtils";
import { buildGameSettingsFromSnapshot, getTotalFlagsCountFromSnapshot, getRemainingFlagsCountFromSnapshot } from "./gameSettings";
import { filterFlagsWithOutlines } from "../utils/mapUtils";

/**
 * Start a new game
 * @param {Object} params - All required state and functions
 */
export const startGame = async (params) => {
  const {
    // Audio functions
    playGameStartSound,
    // Setters
    setScore,
    setHealth,
    setMessage,
    setGameStarted,
    setUsedFlags,
    setLastFlagId,
    setTypedAnswer,
    setTypingInputStyle,
    setGameStartTime,
    setTotalAttempts,
    setShowEndScreen,
    setEndState,
    setGameStats,
    setGameStateSnapshot,
    setLongestStreak,
    setCurrentStreak,
    setGuessTimes,
    setFastestGuess,
    setLastGuessTime,
    setChallengeScoreSubmitted,
    setTimeRemaining,
    setTimerStarted,
    setFirstGuessMade,
    setIsFlagLoading,
    setRegionalFlags,
    setGameMode,
    setMenuStep,
    // Refs
    currentScoreRef,
    // State values
    timeAttackMode,
    isChallengeMode,
    gameMode,
    regionalFlags,
    selectedRegionalCountry,
    selectedDivisionTypes,
    filteredFlags,
    // Functions
    loadNextQuestion
  } = params;

  // Play game start sound
  playGameStartSound();
  
  console.log('startGame: Resetting all game state');
  
  // Always reset game state when starting a new game
  setScore(0);
  currentScoreRef.current = 0; // Reset score ref
  setHealth(3);
  setMessage("");
  setGameStarted(true);
  setUsedFlags([]);
  setLastFlagId(null); // Reset last flag ID for clean state
  setTypedAnswer(""); // Clear typed answer
  setTypingInputStyle(""); // Clear typing input style
  setGameStartTime(new Date().getTime());
  setTotalAttempts(0);
  setShowEndScreen(false);
  setEndState(null);
  setGameStats({}); // Clear previous game stats
  setGameStateSnapshot({}); // Clear previous game state snapshot
  
  // Reset enhanced tracking variables
  setLongestStreak(0);
  setCurrentStreak(0);
  setGuessTimes([]);
  setFastestGuess(null);
  setLastGuessTime(null);
  
  // Reset challenge submission state for new attempt
  // Note: Don't reset challengePlayerName - it's needed for score submission
  if (isChallengeMode) {
    setChallengeScoreSubmitted(false);
    // Keep challengePlayerName - it was set before starting the game
  }
  
  // Initialize Time Attack mode
  if (timeAttackMode) {
    console.log('Initializing Time Attack mode with 60 seconds');
    setTimeRemaining(60);
    setTimerStarted(false);
    setFirstGuessMade(false);
  }
  
  // Simple flag loading state reset (Site4 style)
  setIsFlagLoading(true);
  
  // Load regional flags if in regional mode
  let loadedFlags = null;
  if (gameMode === "regional" && regionalFlags.length === 0) {
    // Safety check: ensure selectedRegionalCountry exists before accessing its id
    if (!selectedRegionalCountry || !selectedRegionalCountry.id) {
      console.error('Error loading regional flags: selectedRegionalCountry is null or missing id');
      setMessage("Regional country not selected. Please select a country first.");
      setGameStarted(false);
      return;
    }
    
    try {
      loadedFlags = await fetchRegionalFlags(selectedRegionalCountry.id, selectedDivisionTypes);
    } catch (error) {
      console.error('Error loading regional flags:', error);
      setMessage("Regional flags unavailable. Switching to standard mode.");
      // Fallback to standard mode if regional flags fail
      setGameMode("standard");
      setMenuStep(0);
      setGameStarted(false);
      return;
    }
  }
  
  // Ensure we have flags loaded before proceeding
  const isRegionalMode = gameMode === "regional";
  let currentFlags = isRegionalMode ? (loadedFlags || regionalFlags) : filteredFlags;
  
  // For map game types, filter to only flags with map outlines
  // Note: gameType is not in params, so we need to check it from the calling context
  // This check will be done again in loadNextQuestion, but we do a preliminary check here
  // to give better error messages
  
  if (!currentFlags || currentFlags.length === 0) {
    console.error('No flags available when starting game');
    setMessage("Error: No flags available. Please try again.");
    setGameStarted(false);
    return;
  }
  
  // Load the next question with reset usedFlags
  await loadNextQuestion(null, []);
};

/**
 * End Time Attack game mode
 * @param {Object} params - All required state and functions
 */
export const endTimeAttackGame = (params) => {
  const {
    // State checks
    gameStarted,
    showEndScreen,
    // Audio
    playGameOverSound,
    // Refs
    currentScoreRef,
    timerRef,
    totalAttemptsRef,
    fastestGuessRef,
    // Setters
    setButtonsDisabled,
    setMessage,
    setTimeout,
    setGameStats,
    setGameStateSnapshot,
    setEndState,
    setGameStarted,
    setShowEndScreen,
    setTimerStarted,
    setFirstGuessMade,
    // State values
    gameStartTime,
    gameMode,
    regionalGameType,
    gameType,
    selectedRegionalCountry,
    selectedDivisionTypes,
    selectedContinent,
    includeTerritories,
    timeAttackMode,
    regionalInfiniteMode,
    infiniteMode,
    typingMode,
    regionalTypingMode,
    flashMode,
    regionalFlashMode,
    regionalFlags,
    filteredFlags,
    usedFlags,
    longestStreak,
    fastestGuess,
    isChallengeMode,
    // Functions
    calculateAverageTime,
    submitChallengeScore,
    saveGameToHistory,
    clearActiveGame: clearActiveGameFunc
  } = params;

  // Prevent multiple calls
  if (!gameStarted || showEndScreen) {
    return;
  }
  
  // Play game over sound
  playGameOverSound();
  
  const finalScore = currentScoreRef.current; // Use ref for accurate score
  console.log('Time Attack: Ending game with final score:', finalScore);
  
  // Clear the timer
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  
  // Disable buttons to prevent further interaction
  setButtonsDisabled(true);
  
  // Calculate final statistics
  const gameEndTime = new Date().getTime();
  const timeElapsed = gameStartTime ? gameEndTime - gameStartTime : 0;
  const finalAttempts = totalAttemptsRef.current;
  const accuracy = finalAttempts > 0 ? Math.min(((finalScore / finalAttempts) * 100), 100).toFixed(1) : 0;
  
  // Create a more engaging final message
  const finalMessage = finalScore > 0 
    ? `⏰ Time's up! Great job! You got ${finalScore} correct answer${finalScore === 1 ? '' : 's'} in 60 seconds!`
    : `⏰ Time's up! Keep practicing - you'll get better!`;
  
  setMessage(finalMessage);
  
  // Add a brief pause to let the user see the final score
  setTimeout(() => {
    // Create a snapshot of current game state for end screen
    const currentGameState = {
      gameMode: gameMode,
      gameType: gameMode === "regional" ? regionalGameType : gameType,
      selectedRegionalCountry: selectedRegionalCountry,
      selectedDivisionTypes: selectedDivisionTypes,
      selectedContinent: selectedContinent,
      includeTerritories: includeTerritories,
      timeAttackMode: timeAttackMode,
      regionalInfiniteMode: regionalInfiniteMode,
      infiniteMode: infiniteMode,
      typingMode: typingMode,
      regionalTypingMode: regionalTypingMode,
      flashMode: flashMode,
      regionalFlashMode: regionalFlashMode,
      regionalFlags: regionalFlags,
      filteredFlags: filteredFlags,
      usedFlags: usedFlags // Include usedFlags in the snapshot
    };
    
    const avgTime = calculateAverageTime();
    const finalStats = {
      score: finalScore,
      totalAttempts: finalAttempts,
      accuracy: accuracy,
      timeElapsed: timeElapsed,
      endState: "timeAttack",
      gameType: gameMode === "regional" ? regionalGameType : gameType,
      gameSettings: buildGameSettingsFromSnapshot(currentGameState),
      totalFlags: getTotalFlagsCountFromSnapshot(currentGameState),
      remainingFlags: getRemainingFlagsCountFromSnapshot(currentGameState, currentGameState.usedFlags.length),
      longestStreak: longestStreak,
      averageTimePerGuess: avgTime,
      fastestGuess: fastestGuessRef.current || fastestGuess
    };
    
    setGameStats(finalStats);
    setGameStateSnapshot(currentGameState);
    setEndState("timeAttack");
    setShowEndScreen(true);
    setTimerStarted(false);
    setFirstGuessMade(false);
    setButtonsDisabled(false);
    setMessage("");
    
    // Save game to history
    saveGameToHistory(finalStats, currentGameState);
    
    // Submit to challenge if in challenge mode
    if (isChallengeMode) {
      submitChallengeScore(finalStats);
    }
    
    // Clear active game since this game is now completed
    clearActiveGameFunc();
  }, 2500); // Show final message for 2.5 seconds
};

/**
 * End Infinite game mode
 * @param {Object} params - All required state and functions
 */
export const endInfiniteMode = (params) => {
  const {
    // Audio
    playGameOverSound,
    // State values
    gameStartTime,
    totalAttempts,
    score,
    gameMode,
    regionalGameType,
    gameType,
    selectedRegionalCountry,
    selectedDivisionTypes,
    selectedContinent,
    includeTerritories,
    timeAttackMode,
    regionalInfiniteMode,
    infiniteMode,
    typingMode,
    regionalTypingMode,
    regionalFlags,
    filteredFlags,
    usedFlags,
    longestStreak,
    fastestGuess,
    isChallengeMode,
    // Refs
    fastestGuessRef,
    // Setters
    setGameStats,
    setGameStateSnapshot,
    setEndState,
    setGameStarted,
    setShowEndScreen,
    // Functions
    calculateAverageTime,
    submitChallengeScore,
    saveGameToHistory,
    clearActiveGame: clearActiveGameFunc
  } = params;

  // Play game over sound
  playGameOverSound();
  
  const gameEndTime = new Date().getTime();
  const timeElapsed = gameStartTime ? gameEndTime - gameStartTime : 0;
  const finalAttempts = totalAttempts;
  const accuracy = finalAttempts > 0 ? ((score / finalAttempts) * 100).toFixed(1) : 0;
  
  // Create a snapshot of current game state for end screen
  const currentGameState = {
    gameMode: gameMode,
    gameType: gameMode === "regional" ? regionalGameType : gameType,
    selectedRegionalCountry: selectedRegionalCountry,
    selectedDivisionTypes: selectedDivisionTypes,
    selectedContinent: selectedContinent,
    includeTerritories: includeTerritories,
    timeAttackMode: timeAttackMode,
    regionalInfiniteMode: regionalInfiniteMode,
    infiniteMode: infiniteMode,
    typingMode: typingMode,
    regionalTypingMode: regionalTypingMode,
    regionalFlags: regionalFlags,
    filteredFlags: filteredFlags,
    usedFlags: usedFlags // Include usedFlags in the snapshot
  };
  
  const finalGameStats = {
    score: score,
    totalAttempts: finalAttempts,
    accuracy: accuracy,
    timeElapsed: timeElapsed,
    endState: "infiniteMode",
    gameType: gameMode === "regional" ? regionalGameType : gameType,
    gameSettings: buildGameSettingsFromSnapshot(currentGameState),
    totalFlags: getTotalFlagsCountFromSnapshot(currentGameState),
    remainingFlags: getRemainingFlagsCountFromSnapshot(currentGameState, currentGameState.usedFlags.length),
    longestStreak: longestStreak,
    averageTimePerGuess: calculateAverageTime(),
    fastestGuess: fastestGuessRef.current || fastestGuess
  };
  
  console.log('Infinite Mode End - Final game stats:', finalGameStats);
  console.log('Infinite Mode End - Current game state:', currentGameState);
  
  setGameStats(finalGameStats);
  setGameStateSnapshot(currentGameState);
  setEndState("infiniteMode");
  setShowEndScreen(true);
  
  // Save game to history
  saveGameToHistory(finalGameStats, currentGameState);
  
  // Submit to challenge if in challenge mode
  if (isChallengeMode) {
    submitChallengeScore(finalGameStats);
  }
  
  // Clear active game since this game is now completed
  clearActiveGameFunc();
};

/**
 * Start transition animation
 * @param {Object} setters - Transition state setters
 */
export const startTransition = ({ setIsTransitioning, setFlagTransitioning, setOptionsTransitioning, setMessageTransitioning }) => {
  setIsTransitioning(true);
  setFlagTransitioning(true);
  setOptionsTransitioning(true);
  setMessageTransitioning(true);
};

/**
 * End transition animation
 * @param {Object} setters - Transition state setters
 */
export const endTransition = ({ setIsTransitioning, setFlagTransitioning, setOptionsTransitioning, setMessageTransitioning }) => {
  setIsTransitioning(false);
  setFlagTransitioning(false);
  setOptionsTransitioning(false);
  setMessageTransitioning(false);
};

/**
 * Transition to next question with animation
 * @param {Object} params - Required state and functions
 * @param {number} currentScore - Current score value
 */
export const transitionToNextQuestion = async (params, currentScore = null) => {
  const { 
    setIsTransitioning,
    setFlagTransitioning, 
    setOptionsTransitioning, 
    setMessageTransitioning,
    loadNextQuestion,
    preloadImages,
    gameModeRef,
    regionalGameTypeRef,
    gameTypeRef
  } = params;
  
  startTransition({ setIsTransitioning, setFlagTransitioning, setOptionsTransitioning, setMessageTransitioning });
  
  // Wait for transition out animation
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Load next question and get the new flag options
  const newFlagOptions = await loadNextQuestion(currentScore, null);
  
  // Preload flag images asynchronously without blocking
  const isRegionalMode = gameModeRef.current === "regional";
  const currentGameType = isRegionalMode ? regionalGameTypeRef.current : gameTypeRef.current;
  
  if ((currentGameType === "country-to-flag" || currentGameType === "region-to-flag" || currentGameType === "map-to-flag") && newFlagOptions && newFlagOptions.length > 0) {
    // Preload images in background without waiting
    preloadImages(newFlagOptions);
  }
  
  // End transition immediately for smoother experience
  setTimeout(() => {
    endTransition({ setIsTransitioning, setFlagTransitioning, setOptionsTransitioning, setMessageTransitioning });
  }, 50);
};

/**
 * Load next question
 * @param {Object} params - All required state and functions
 * @param {number|null} currentScore - Updated score if correct answer
 * @param {Array|null} resetUsedFlags - Used flags array to reset or null
 * @returns {Array|null} New flag options array or null
 */
export const loadNextQuestion = async (params, currentScore = null, resetUsedFlags = null) => {
  const {
    // Refs
    scoreRef,
    gameStartedRef,
    currentScoreRef,
    gameModeRef,
    regionalFlagsRef,
    regionalInfiniteModeRef,
    regionalGameTypeRef,
    filteredFlagsRef,
    infiniteModeRef,
    gameTypeRef,
    currentGameFlagsRef,
    fastestGuessRef,
    // State values
    selectedRegionalCountry,
    selectedDivisionTypes,
    usedFlags,
    gameStarted,
    gameStartTime,
    score,
    totalAttempts,
    gameMode,
    regionalGameType,
    includeTerritories,
    timeAttackMode,
    regionalInfiniteMode,
    infiniteMode,
    typingMode,
    regionalTypingMode,
    flashMode,
    regionalFlashMode,
    regionalFlags,
    filteredFlags,
    selectedContinent,
    longestStreak,
    fastestGuess,
    isChallengeMode,
    resumedQuestionFlagId,
    lastFlagId,
    // Setters
    setScore,
    setMessage,
    setIsFlagLoading,
    setRegionalFlags,
    setFilteredRegionalFlags,
    setGameStarted,
    setCurrentFlag,
    setLastFlagId,
    setTypedAnswer,
    setUsedFlags,
    setLastGuessTime,
     setFlagLoadingTimeout,
     setOptions,
     setFlagOptions,
     setMapOutlineOptions,
     setGameStats,
    setGameStateSnapshot,
    setEndState,
    setShowEndScreen,
    setResumedQuestionFlagId,
    // Functions
    playVictorySound,
    calculateAverageTime,
    submitChallengeScore,
    preloadImages,
    saveGameToHistory,
    clearActiveGame: clearActiveGameFunc
  } = params;

  console.log(`loadNextQuestion: called with currentScore=${currentScore}, resetUsedFlags=${resetUsedFlags}, current scoreRef=${scoreRef.current}, gameStarted=${gameStartedRef.current}`);
  
  // Safety check: if game is not started and this is not the initial load, return
  // Allow initial load when resetUsedFlags is [] (from startGame) - this indicates startGame is calling
  // Only skip if resetUsedFlags is null AND game is not started (meaning it's a mid-game call)
  const isInitialLoad = Array.isArray(resetUsedFlags) && resetUsedFlags.length === 0;
  if (!gameStartedRef.current && !isInitialLoad && resetUsedFlags === null) {
    console.log('loadNextQuestion: Game not started, skipping');
    return null;
  }
  
  // If this is an initial load from startGame, proceed even if ref isn't updated yet
  if (isInitialLoad) {
    console.log('loadNextQuestion: Initial load from startGame, proceeding');
  }
  
  // Update score if provided (for correct answers)
  if (currentScore !== null) {
    console.log(`loadNextQuestion: Updating score from ${scoreRef.current} to ${currentScore}`);
    setScore(currentScore);
    currentScoreRef.current = currentScore; // Update ref immediately
  }
  
  // Determine which flags to use based on game mode
  const isRegionalMode = gameModeRef.current === "regional";
  let currentFlags;
  let currentInfiniteMode;
  let currentGameType;
  
  console.log('loadNextQuestion: Determining game type', {
    isRegionalMode,
    gameMode: gameModeRef.current,
    gameType: gameTypeRef.current,
    regionalGameType: regionalGameTypeRef.current
  });
  
  if (isRegionalMode) {
    // For regional mode, ensure we have flags loaded
    if (regionalFlagsRef.current.length === 0) {
      try {
        // Safety check for regional country
        if (!selectedRegionalCountry || !selectedRegionalCountry.id) {
          console.error('selectedRegionalCountry is null or missing id:', selectedRegionalCountry);
          setMessage("Error: Regional country data is missing. Please restart the game.");
          setGameStarted(false);
          return null;
        }
        
        const loadedFlags = await fetchRegionalFlags(selectedRegionalCountry.id, selectedDivisionTypes);
        
        if (loadedFlags.length === 0) {
          setMessage("No regional flags available for selected filters.");
          return null;
        }
        
        setRegionalFlags(loadedFlags);
        setFilteredRegionalFlags(loadedFlags);
        currentFlags = loadedFlags;
      } catch (error) {
        console.error("Error loading regional flags:", error);
        setMessage("Error loading regional flags. Please try again.");
        return null;
      }
    } else {
      currentFlags = regionalFlagsRef.current;
    }
    currentInfiniteMode = regionalInfiniteModeRef.current;
    currentGameType = regionalGameTypeRef.current;
  } else {
    // Standard mode
    currentFlags = filteredFlagsRef.current;
    currentInfiniteMode = infiniteModeRef.current;
    currentGameType = gameTypeRef.current;
  }
  
  // For map game types, filter to only flags with map outlines
  if (currentGameType === "map-to-flag" || currentGameType === "flag-to-map") {
    console.log(`Filtering flags for map game type: ${currentGameType}, total flags: ${currentFlags.length}`);
    const flagsWithOutlines = filterFlagsWithOutlines(currentFlags);
    console.log(`Flags with outlines: ${flagsWithOutlines.length}`);
    if (flagsWithOutlines.length === 0) {
      console.error('No flags with map outlines available for map game type');
      setMessage("No flags with map outlines available. Please assign map outlines in admin.");
      setGameStarted(false);
      setIsFlagLoading(false);
      return null;
    }
    // Need at least 4 flags for multiple choice (1 correct + 3 incorrect)
    if (flagsWithOutlines.length < 4) {
      console.error(`Not enough flags with outlines: ${flagsWithOutlines.length}, need at least 4`);
      setMessage(`Not enough flags with map outlines (found ${flagsWithOutlines.length}, need at least 4). Please assign more map outlines in admin.`);
      setGameStarted(false);
      setIsFlagLoading(false);
      return null;
    }
    currentFlags = flagsWithOutlines;
  }
  
  currentGameFlagsRef.current = currentFlags; // Store for use in checkAnswer
  
  if (currentFlags.length === 0) {
    setMessage("No flags available for selected filters.");
    setIsFlagLoading(false);
    return null;
  }

  setMessage("");
  setIsFlagLoading(true);
  const flagsToUse = resetUsedFlags !== null ? resetUsedFlags : usedFlags;
  let availableFlags = currentInfiniteMode ? currentFlags : currentFlags.filter(flag => !flagsToUse.includes(flag.id));
  
  console.log('loadNextQuestion debug:', {
    currentFlags: currentFlags?.length || 0,
    usedFlags: flagsToUse?.length || 0,
    availableFlags: availableFlags?.length || 0,
    currentInfiniteMode,
    gameStarted,
    isRegionalMode,
    regionalInfiniteMode: regionalInfiniteModeRef.current,
    infiniteMode: infiniteModeRef.current
  });
  
  // Check if we have enough available flags
  // Only check for completion if game is actually started (not initial load)
  // On initial load, if availableFlags is 0, it means no flags match the criteria (error case)
  if (availableFlags.length === 0 && gameStartedRef.current && !isInitialLoad) {
    // No more flags available - game is actually complete
    playVictorySound(); // Play victory sound for completing all flags
    
    const gameEndTime = new Date().getTime();
    const timeElapsed = gameStartTime ? gameEndTime - gameStartTime : 0;
    const finalScore = currentScore !== null ? currentScore : score;
    // Include the final correct attempt in total attempts
    const finalTotalAttempts = totalAttempts + 1;
    
    // Create a snapshot of current game state for end screen
    const currentGameState = {
      gameMode: gameMode,
      gameType: currentGameType,
      selectedRegionalCountry: selectedRegionalCountry,
      selectedDivisionTypes: selectedDivisionTypes,
      selectedContinent: selectedContinent,
      includeTerritories: includeTerritories,
      timeAttackMode: timeAttackMode,
      regionalInfiniteMode: regionalInfiniteMode,
      infiniteMode: infiniteMode,
      typingMode: typingMode,
      regionalTypingMode: regionalTypingMode,
      flashMode: flashMode,
      regionalFlashMode: regionalFlashMode,
      regionalFlags: regionalFlags,
      filteredFlags: filteredFlags,
      usedFlags: usedFlags // Include usedFlags in the snapshot
    };
    
    setGameStats({
      score: finalScore,
      totalAttempts: finalTotalAttempts,
      accuracy: finalTotalAttempts > 0 ? ((finalScore / finalTotalAttempts) * 100).toFixed(1) : 0,
      timeElapsed: timeElapsed,
      remainingFlags: 0,
      endState: "allCompleted",
      gameType: currentGameType,
      gameSettings: buildGameSettingsFromSnapshot(currentGameState),
      totalFlags: getTotalFlagsCountFromSnapshot(currentGameState),
      longestStreak: longestStreak,
      averageTimePerGuess: calculateAverageTime(),
      fastestGuess: fastestGuessRef.current || fastestGuess,
      completionTime: timeElapsed
    });
    setGameStateSnapshot(currentGameState);
    setEndState("allCompleted");
    setShowEndScreen(true);
    
    const allCompletedStats = {
      score: finalScore,
      totalAttempts: finalTotalAttempts,
      accuracy: finalTotalAttempts > 0 ? ((finalScore / finalTotalAttempts) * 100).toFixed(1) : 0,
      timeElapsed: timeElapsed,
      remainingFlags: 0,
      endState: "allCompleted",
      gameType: currentGameType,
      gameSettings: buildGameSettingsFromSnapshot(currentGameState),
      totalFlags: getTotalFlagsCountFromSnapshot(currentGameState),
      longestStreak: longestStreak,
      averageTimePerGuess: calculateAverageTime(),
      fastestGuess: fastestGuessRef.current || fastestGuess,
      completionTime: timeElapsed
    };
    
    // Save game to history
    saveGameToHistory(allCompletedStats, currentGameState);
    
    // Submit to challenge if in challenge mode
    if (isChallengeMode) {
      submitChallengeScore(allCompletedStats);
    }
    
    // Clear active game since this game is now completed
    clearActiveGameFunc();
    return null;
  }
  
  // Ensure we have available flags before proceeding
  // On initial load, this is a real error (no flags match criteria)
  // On mid-game, this means we've run out of flags
  if (availableFlags.length === 0) {
    if (isInitialLoad) {
      console.error('No available flags found on initial load - this is an error');
      setMessage("Error: No flags available for selected game type. Please check your settings.");
      setGameStarted(false);
      setIsFlagLoading(false);
      return null;
    } else if (gameStartedRef.current) {
      console.error('No available flags found. This should not happen after the previous check.');
      setMessage("Error: No flags available. Please try again.");
      setGameStarted(false);
      setIsFlagLoading(false);
      return null;
    }
  }
  
  const randomFlag = availableFlags[Math.floor(Math.random() * availableFlags.length)];
  
  // Additional safety check
  if (!randomFlag || !randomFlag.id) {
    console.error('Invalid flag selected:', randomFlag);
    setMessage("Error: Invalid flag data. Please try again.");
    setGameStarted(false);
    return null;
  }
  
  // Check if this is the same flag as the last one (consecutive flag)
  const isConsecutiveFlag = lastFlagId === randomFlag.id;
  
  // Add cache-busting parameter for consecutive flags to force reload
  const flagWithCacheBust = isConsecutiveFlag ? {
    ...randomFlag,
    image_url: `${randomFlag.image_url}?t=${Date.now()}`
  } : randomFlag;
  
  setCurrentFlag(flagWithCacheBust);
  setLastFlagId(randomFlag.id);
  
  // Clear typed answer for new question
  setTypedAnswer("");
  
  // Add flag to usedFlags, but handle resumed questions specially
  setUsedFlags(prevUsedFlags => {
    // If this is a resumed question flag, don't add it to usedFlags
    if (resumedQuestionFlagId === randomFlag.id) {
      console.log('Skipping adding resumed question flag to usedFlags:', randomFlag.id);
      setResumedQuestionFlagId(null); // Clear the flag
      return prevUsedFlags;
    }
    // Otherwise, add it normally
    return [...prevUsedFlags, randomFlag.id];
  });
  setLastGuessTime(Date.now()); // Set time for next guess
  
  // Add a fallback timer to clear loading state for consecutive flags
  // This prevents the loading spinner from getting stuck when the same flag appears consecutively
  const loadingTimeout = setTimeout(() => {
    setIsFlagLoading(false);
  }, 300); // Reduced to 300ms for faster response
  
  // Store the timeout ID to clear it if the flag loads normally
  setFlagLoadingTimeout(loadingTimeout);
  
  let newFlagOptions = null;
  
  if (currentGameType === "flag-to-country" || currentGameType === "flag-to-region") {
    // Show flag, guess name (country or region)
    const correctName = randomFlag.name;
    let incorrectNames = currentFlags.filter((flag) => flag.name !== correctName);
    incorrectNames = incorrectNames.sort(() => Math.random() - 0.5).slice(0, 3);
  
    const allNames = [correctName, ...incorrectNames.map((flag) => flag.name)];
    const shuffledNames = allNames.sort(() => Math.random() - 0.5);
  
    setOptions(shuffledNames);
    setFlagOptions([]); // Clear flag options for this mode
    setMapOutlineOptions([]); // Clear map outline options
  } else if (currentGameType === "map-to-flag") {
    // Show map outline, guess flag
    // TODO: Typing mode for map-to-flag (commented out for now)
    // Check if typing mode is active
    // const isTypingMode = (gameModeRef.current === "standard" && typingMode) || 
    //                     (gameModeRef.current === "regional" && regionalTypingMode);
    // 
    // if (isTypingMode) {
    //   // In typing mode, don't generate flag options - user will type the country name
    //   setFlagOptions([]);
    //   setOptions([]); // Clear name options for this mode
    //   setMapOutlineOptions([]); // Clear map outline options
    //   newFlagOptions = null; // No flag options needed in typing mode
    // } else {
      // In multiple choice mode, generate flag options
      const correctFlag = randomFlag;
      let incorrectFlags = currentFlags.filter((flag) => flag.id !== correctFlag.id);
      incorrectFlags = incorrectFlags.sort(() => Math.random() - 0.5).slice(0, 3);
    
      const allFlags = [correctFlag, ...incorrectFlags];
      const shuffledFlags = allFlags.sort(() => Math.random() - 0.5);
      
      newFlagOptions = shuffledFlags; // Store for return
      setFlagOptions(shuffledFlags);
      setOptions([]); // Clear name options for this mode
      setMapOutlineOptions([]); // Clear map outline options
      
      // Preload flag options immediately for better performance
      if (newFlagOptions && newFlagOptions.length > 0) {
        preloadImages(newFlagOptions);
      }
    // }
  } else if (currentGameType === "flag-to-map") {
    // Show flag, guess map outline
    const correctFlag = randomFlag;
    let incorrectFlags = currentFlags.filter((flag) => flag.id !== correctFlag.id);
    incorrectFlags = incorrectFlags.sort(() => Math.random() - 0.5).slice(0, 3);
  
    const allFlags = [correctFlag, ...incorrectFlags];
    const shuffledFlags = allFlags.sort(() => Math.random() - 0.5);
    
    setMapOutlineOptions(shuffledFlags); // Set map outline options
    setFlagOptions([]); // Clear flag options for this mode
    setOptions([]); // Clear name options for this mode
    
    // No need to preload images for map outlines
  } else {
    // Show name, guess flag (country-to-flag or region-to-flag)
    const correctFlag = randomFlag;
    let incorrectFlags = currentFlags.filter((flag) => flag.id !== correctFlag.id);
    incorrectFlags = incorrectFlags.sort(() => Math.random() - 0.5).slice(0, 3);
  
    const allFlags = [correctFlag, ...incorrectFlags];
    const shuffledFlags = allFlags.sort(() => Math.random() - 0.5);
    
    newFlagOptions = shuffledFlags; // Store for return
    setFlagOptions(shuffledFlags);
    setOptions([]); // Clear name options for this mode
    setMapOutlineOptions([]); // Clear map outline options
    
    // Preload flag options immediately for better performance
    if (newFlagOptions && newFlagOptions.length > 0) {
      preloadImages(newFlagOptions);
    }
  }
  
  return newFlagOptions;
};

/**
 * Handle successful flag image load
 * @param {Object} params - Required state and functions
 * @param {string} flagId - ID of the loaded flag
 */
export const handleFlagLoad = (params, flagId) => {
  const {
    currentFlag,
    lastFlagId,
    flagLoadingTimeout,
    flagOptions,
    imageCache,
    setIsFlagLoading,
    setFlagLoadingTimeout,
    debouncedUpdate
  } = params;

  console.log(`Flag loaded successfully: ${flagId}`);
  
  // If this is the main flag, also clear the main loading state
  // Use lastFlagId for comparison since it's the original flag ID without cache-busting
  if (currentFlag && lastFlagId === flagId) {
    // Clear the fallback timeout since the flag loaded successfully
    if (flagLoadingTimeout) {
      clearTimeout(flagLoadingTimeout);
      setFlagLoadingTimeout(null);
    }
    setIsFlagLoading(false);
  }
  
  // Cache the successfully loaded image
  const flag = currentFlag || flagOptions.find(f => f.id === flagId);
  if (flag) {
    imageCache.current.set(flag.image_url, true);
    // Use debounced update to reduce re-renders
    debouncedUpdate();
  }
};

/**
 * Handle flag image load error
 * @param {Object} params - Required state and functions
 * @param {string} flagId - ID of the flag that failed
 * @param {string} flagName - Name of the flag
 */
export const handleFlagError = (params, flagId, flagName) => {
  const {
    currentFlag,
    lastFlagId,
    flagLoadingTimeout,
    setIsFlagLoading,
    setFlagLoadingTimeout
  } = params;

  console.log(`Flag failed to load: ${flagName} (ID: ${flagId})`);
  
  // If this is the main flag, also clear the main loading state
  // Use lastFlagId for comparison since it's the original flag ID without cache-busting
  if (currentFlag && lastFlagId === flagId) {
    // Clear the fallback timeout since we're handling the error
    if (flagLoadingTimeout) {
      clearTimeout(flagLoadingTimeout);
      setFlagLoadingTimeout(null);
    }
    setIsFlagLoading(false);
  }
  
  console.error(`Flag image failed to load: ${flagName} (ID: ${flagId})`);
};

/**
 * Retry loading a flag
 * @param {Function} loadNextQuestion - Load next question function
 * @param {string} flagId - ID of flag to retry
 */
export const retryFlagLoad = (loadNextQuestion, flagId) => {
  console.log(`Retrying flag load for: ${flagId}`);
  // Simple approach: just load the next question
  loadNextQuestion(null, null);
};


