/**
 * Answer Checking Logic
 * Functions for checking answers and handling game outcomes
 */

import { calculateAverageTime } from "../utils/gameUtils";
import { buildGameSettingsFromSnapshot, getTotalFlagsCountFromSnapshot, getRemainingFlagsCountFromSnapshot } from "./gameSettings";

/**
 * Check player's answer and handle the result
 * @param {Object} params - All required state and functions
 * @param {string|number} selectedAnswer - The answer selected by the player
 */
export const checkAnswer = (params, selectedAnswer) => {
  const {
    // Refs
    currentFlagRef,
    gameStartedRef,
    timeAttackModeRef,
    firstGuessMadeRef,
    gameModeRef,
    regionalGameTypeRef,
    gameTypeRef,
    currentGameFlagsRef,
    timeRemainingRef,
    healthRef,
    scoreRef,
    fastestGuessRef,
    // State values
    filteredFlags,
    typingMode,
    regionalTypingMode,
    gameStartTime,
    totalAttempts,
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
    flashMode,
    regionalFlashMode,
    regionalFlags,
    usedFlags,
    longestStreak,
    fastestGuess,
    isChallengeMode,
    lastGuessTime,
    guessTimes,
    currentStreak,
    // Setters
    setTotalAttempts,
    setFirstGuessMade,
    setTimerStarted,
    setScore,
    currentScoreRef,
    setScoreAnimation,
    setMessage,
    setButtonsDisabled,
    setTypingInputStyle,
    setTypedAnswer,
    setButtonStyles,
    setTimeRemaining,
    setHealth,
    setGameStats,
    setGameStateSnapshot,
    setEndState,
    setGameStarted,
    setShowEndScreen,
    setLongestStreak,
    setCurrentStreak,
    setGuessTimes,
    setFastestGuess,
    setLastGuessTime,
    // Audio functions
    playCorrectSound,
    playIncorrectSound,
    playGameOverSound,
    // Game functions
    transitionToNextQuestion,
    submitChallengeScore,
    // Utility functions
    updateStreak,
    recordGuessTime,
    saveGameToHistory,
    clearActiveGame,
    // Styles
    styles
  } = params;

  // Use the ref to get the current flag (avoids closure issues)
  const currentFlagValue = currentFlagRef.current;
  
  // Safety check: ensure we have a current flag
  if (!currentFlagValue) {
    console.error('checkAnswer called without currentFlag, selectedAnswer:', selectedAnswer);
    return;
  }
  
  // Safety check: ensure game is still running
  if (!gameStartedRef.current) {
    console.error('checkAnswer called when game is not started');
    return;
  }
  
  setTotalAttempts(prev => prev + 1);
  
  // Start timer on first guess in Time Attack mode
  if (timeAttackModeRef.current && !firstGuessMadeRef.current) {
    console.log('Starting Time Attack timer on first guess');
    setFirstGuessMade(true);
    setTimerStarted(true);
  }
  
  let isCorrect = false;
  
  // Determine current game type based on mode
  const isRegionalMode = gameModeRef.current === "regional";
  const currentGameType = isRegionalMode ? regionalGameTypeRef.current : gameTypeRef.current;
  
  // Get the current flags for the game
  const currentFlags = isRegionalMode ? currentGameFlagsRef.current : filteredFlags;
  
  if (currentGameType === "flag-to-country" || currentGameType === "flag-to-region") {
    // Check if selected name matches current flag
    // For typing mode, use case-insensitive comparison with spaces removed
    const isTypingMode = (gameModeRef.current === "standard" && typingMode) || 
                        (gameModeRef.current === "regional" && regionalTypingMode);
    if (isTypingMode) {
      // Case-insensitive match with spaces removed for typing mode
      const normalizedAnswer = selectedAnswer.trim().toLowerCase().replace(/\s+/g, '');
      const normalizedCorrect = currentFlagValue.name.toLowerCase().replace(/\s+/g, '');
      isCorrect = normalizedAnswer === normalizedCorrect;
    } else {
      // Exact match for multiple choice mode
      isCorrect = selectedAnswer === currentFlagValue.name;
    }
  } else if (currentGameType === "map-to-flag") {
    // TODO: Typing mode for map-to-flag (commented out for now)
    // For map-to-flag, check typing mode
    // const isTypingMode = (gameModeRef.current === "standard" && typingMode) || 
    //                     (gameModeRef.current === "regional" && regionalTypingMode);
    // if (isTypingMode) {
    //   // In typing mode, check if typed country name matches current flag name
    //   // Case-insensitive match with spaces removed for typing mode
    //   const normalizedAnswer = selectedAnswer.trim().toLowerCase().replace(/\s+/g, '');
    //   const normalizedCorrect = currentFlagValue.name.toLowerCase().replace(/\s+/g, '');
    //   isCorrect = normalizedAnswer === normalizedCorrect;
    // } else {
      // In multiple choice mode, check if selected flag ID matches current flag ID
      isCorrect = selectedAnswer === currentFlagValue.id;
    // }
  } else if (currentGameType === "flag-to-map") {
    // For flag-to-map, check if selected outline (flag ID) matches current flag ID
    isCorrect = selectedAnswer === currentFlagValue.id;
  } else {
    // Check if selected flag matches current name (country-to-flag or region-to-flag)
    isCorrect = selectedAnswer === currentFlagValue.id;
  }
  
  if (isCorrect) {
    // Play correct sound
    playCorrectSound();
    
    // Update streak for correct answer
    const streakResult = updateStreak(true, currentStreak, longestStreak);
    setCurrentStreak(streakResult.currentStreak);
    if (streakResult.longestStreak > longestStreak) {
      setLongestStreak(streakResult.longestStreak);
    }
    
    // Record guess time for correct answers
    const safeGuessTimes = Array.isArray(guessTimes) ? guessTimes : [];
    const guessTimeResult = recordGuessTime(true, lastGuessTime, fastestGuess, safeGuessTimes);
    if (guessTimeResult.guessTimes) {
      setGuessTimes(guessTimeResult.guessTimes);
    }
    if (guessTimeResult.fastestGuess !== undefined) {
      setFastestGuess(guessTimeResult.fastestGuess);
      if (fastestGuessRef) {
        fastestGuessRef.current = guessTimeResult.fastestGuess;
      }
    }
    
    const newScore = scoreRef.current + 1;
    console.log(`checkAnswer: Correct! Score updated from ${scoreRef.current} to ${newScore}`);
    setScore(newScore);
    currentScoreRef.current = newScore; // Update ref immediately
    setScoreAnimation(true);
    setMessage("Correct!");
    setButtonsDisabled(true);
    
    // Apply visual feedback
    const isTypingMode = (gameModeRef.current === "standard" && typingMode) || 
                        (gameModeRef.current === "regional" && regionalTypingMode);
    if (isTypingMode) {
      setTypingInputStyle(styles.correctInput);
    } else {
      setButtonStyles({ 
        [selectedAnswer]: styles.correctButton
      });
    }
    
    setTimeout(() => {
      setScoreAnimation(false);
      setTypedAnswer(""); // Clear typed answer
      setTypingInputStyle(""); // Clear input style
      transitionToNextQuestion(newScore);
      setButtonStyles({});
      setButtonsDisabled(false);
    }, 1000);
  } else {
    // Play incorrect sound
    playIncorrectSound();
    
    // Update streak for incorrect answer
    const streakResult = updateStreak(false, currentStreak, longestStreak);
    setCurrentStreak(streakResult.currentStreak);
    if (streakResult.longestStreak > longestStreak) {
      setLongestStreak(streakResult.longestStreak);
    }
    
    // Record guess time for incorrect answers too
    const safeGuessTimes = Array.isArray(guessTimes) ? guessTimes : [];
    const guessTimeResult = recordGuessTime(false, lastGuessTime, fastestGuess, safeGuessTimes);
    if (guessTimeResult.guessTimes) {
      setGuessTimes(guessTimeResult.guessTimes);
    }
    if (guessTimeResult.fastestGuess !== undefined) {
      setFastestGuess(guessTimeResult.fastestGuess);
      if (fastestGuessRef) {
        fastestGuessRef.current = guessTimeResult.fastestGuess;
      }
    }
    
    // Handle incorrect answer
    if (timeAttackModeRef.current) {
      // In Time Attack mode, deduct 5 seconds from remaining time
      const newTime = Math.max(0, timeRemainingRef.current - 5);
      console.log(`Time Attack: Incorrect answer. Time remaining: ${timeRemainingRef.current}s -> ${newTime}s`);
      setTimeRemaining(newTime);
      
      // Check if this incorrect answer caused the timer to reach 0
      if (newTime === 0) {
        // Don't set message here - let the timer effect handle the game end
        
        // Apply visual feedback
        const isTypingMode = (gameModeRef.current === "standard" && typingMode) || 
                            (gameModeRef.current === "regional" && regionalTypingMode);
        if (isTypingMode) {
          setTypingInputStyle(styles.incorrectInput);
          setTypedAnswer(""); // Clear typed answer
        } else {
          setButtonStyles({
            [selectedAnswer]: styles.incorrectButton
          });
        }
        
        setTimeout(() => {
          setButtonStyles({});
          setTypingInputStyle(""); // Clear input style
        }, 1000);
      } else {
        setMessage("Incorrect! -5 seconds");
        
        // Apply visual feedback
        const isTypingMode = (gameModeRef.current === "standard" && typingMode) || 
                            (gameModeRef.current === "regional" && regionalTypingMode);
        if (isTypingMode) {
          setTypingInputStyle(styles.incorrectInput);
          setTypedAnswer(""); // Clear typed answer
        } else {
          setButtonStyles({
            [selectedAnswer]: styles.incorrectButton
          });
        }
        
        setTimeout(() => {
          setButtonStyles({});
          setTypingInputStyle(""); // Clear input style
        }, 1000);
      }
    } else {
      // Standard mode - use health system
      if (healthRef.current > 1) {
        setHealth(healthRef.current - 1);
        setMessage("Incorrect! Try again.");
        
        // Apply visual feedback
        const isTypingMode = (gameModeRef.current === "standard" && typingMode) || 
                            (gameModeRef.current === "regional" && regionalTypingMode);
        if (isTypingMode) {
          setTypingInputStyle(styles.incorrectInput);
          setTypedAnswer(""); // Clear typed answer
        } else {
          setButtonStyles({
            [selectedAnswer]: styles.incorrectButton
          });
        }
        
        setTimeout(() => {
          setButtonStyles({});
          setTypingInputStyle(""); // Clear input style
        }, 1000);
      } else {
        // Game Over - Ran out of hearts
        playGameOverSound();
        
        const gameEndTime = new Date().getTime();
        const timeElapsed = gameStartTime ? gameEndTime - gameStartTime : 0;
        const finalAttempts = totalAttempts + 1;
        const accuracy = finalAttempts > 0 ? Math.min(((scoreRef.current / finalAttempts) * 100), 100).toFixed(1) : 0;
        
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
        
        console.log('Game Over - Creating snapshot with values:', {
          gameMode,
          currentGameType,
          selectedRegionalCountry: selectedRegionalCountry?.name,
          selectedContinent,
          includeTerritories,
          timeAttackMode,
          regionalInfiniteMode,
          infiniteMode,
          regionalFlagsLength: regionalFlags?.length,
          filteredFlagsLength: filteredFlags?.length,
          usedFlagsLength: usedFlags?.length
        });
        
        const finalGameStats = {
          score: scoreRef.current,
          totalAttempts: finalAttempts,
          accuracy: accuracy,
          timeElapsed: timeElapsed,
          endState: "ranOutOfHearts",
          gameType: currentGameType,
          gameSettings: buildGameSettingsFromSnapshot(currentGameState),
          totalFlags: getTotalFlagsCountFromSnapshot(currentGameState),
          remainingFlags: getRemainingFlagsCountFromSnapshot(currentGameState, currentGameState.usedFlags.length),
          longestStreak: longestStreak,
          averageTimePerGuess: calculateAverageTime(guessTimes),
          fastestGuess: fastestGuessRef.current || fastestGuess
        };
        
        console.log('Game Over - Final game stats:', finalGameStats);
        console.log('Game Over - Current game state:', currentGameState);
        
        setGameStats(finalGameStats);
        setGameStateSnapshot(currentGameState);
        setEndState("ranOutOfHearts");
        setHealth(0);
        setShowEndScreen(true);
        
        // Save game to history
        saveGameToHistory(finalGameStats, currentGameState);
        
        // Submit to challenge if in challenge mode
        if (isChallengeMode) {
          submitChallengeScore(finalGameStats);
        }
        
        // Clear active game since this game is now completed
        clearActiveGame();
      }
    }
  }
};
