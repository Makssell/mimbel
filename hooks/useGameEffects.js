/**
 * useGameEffects Hook
 * Contains all useEffect hooks for the game component
 * 
 * This hook manages:
 * - Ref synchronization
 * - Data fetching (flags, regional data)
 * - Timer management
 * - Keyboard handlers
 * - Active game saving/loading
 * - Challenge loading
 */

import { useEffect } from "react";
import { fetchGlobalFlags, fetchRegionalCountries, fetchDivisionTypes, fetchFeaturedCountries } from "../services/flagService";
import { loadGameHistory, loadActiveGame } from "../utils/storageUtils";

export const useGameEffects = ({
  // State
  timeRemaining,
  buttonsDisabled,
  gameStarted,
  gameMode,
  regionalGameType,
  gameType,
  options,
  flagOptions,
  currentFlag,
  score,
  timeAttackMode,
  firstGuessMade,
  health,
  regionalFlags,
  filteredFlags,
  regionalInfiniteMode,
  infiniteMode,
  longestStreak,
  currentStreak,
  guessTimes,
  fastestGuess,
  totalAttempts,
  flagLoadingTimeout,
  typingMode,
  regionalTypingMode,
  selectedContinent,
  includeTerritories,
  hasChallengeCode,
  usedFlags,
  timerStarted,
  regionalCountries,
  
  // Refs
  timeRemainingRef,
  buttonsDisabledRef,
  gameStartedRef,
  gameModeRef,
  regionalGameTypeRef,
  gameTypeRef,
  optionsRef,
  flagOptionsRef,
  currentFlagRef,
  scoreRef,
  timeAttackModeRef,
  firstGuessMadeRef,
  healthRef,
  regionalFlagsRef,
  filteredFlagsRef,
  regionalInfiniteModeRef,
  infiniteModeRef,
  longestStreakRef,
  currentStreakRef,
  guessTimesRef,
  fastestGuessRef,
  totalAttemptsRef,
  timerRef,
  typingInputRef,
  updateTimeoutRef,
  
  // Setters
  setIsLoading,
  setFlags,
  setFilteredFlags,
  setMessage,
  setIsLoadingRegionalCountries,
  setIsLoadingFeaturedCountries,
  setRegionalCountries,
  setRegionalDivisionTypes,
  setFeaturedCountries,
  setRegionalFlags,
  setFilteredRegionalFlags,
  setGameHistory,
  setBestScores,
  setActiveGame,
  setHasActiveGame,
  setTimeRemaining,
  setChallengeLoading,
  setIsChallengeMode,
  setShowChallengeScreen,
  setChallengeData,
  setChallengeResults,
  setHasPlayedChallenge,
  setChallengeSettings,
  setGameMode,
  setTimeAttackMode,
  setRegionalInfiniteMode,
  setInfiniteMode,
  setTypingMode,
  setRegionalTypingMode,
  setRegionalGameType,
  setSelectedRegionalCountry,
  setSelectedDivisionTypes,
  setGameType,
  setSelectedContinent,
  setIncludeTerritories,
  setFilteredFlags: setFilteredFlagsState,
  
  // Functions
  checkAnswer,
  endTimeAttackGame,
  playTimeWarningSound,
  loadChallengeFromURL,
  fetchRegionalFlags,
  saveActiveGame,
  isLoadingRegionalCountries
}) => {
  // Sync refs with state values
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining, timeRemainingRef]);

  useEffect(() => {
    buttonsDisabledRef.current = buttonsDisabled;
  }, [buttonsDisabled, buttonsDisabledRef]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted, gameStartedRef]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode, gameModeRef]);

  useEffect(() => {
    regionalGameTypeRef.current = regionalGameType;
  }, [regionalGameType, regionalGameTypeRef]);

  useEffect(() => {
    gameTypeRef.current = gameType;
  }, [gameType, gameTypeRef]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options, optionsRef]);

  useEffect(() => {
    flagOptionsRef.current = flagOptions;
  }, [flagOptions, flagOptionsRef]);

  useEffect(() => {
    currentFlagRef.current = currentFlag;
  }, [currentFlag, currentFlagRef]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score, scoreRef]);

  useEffect(() => {
    timeAttackModeRef.current = timeAttackMode;
  }, [timeAttackMode, timeAttackModeRef]);

  useEffect(() => {
    firstGuessMadeRef.current = firstGuessMade;
  }, [firstGuessMade, firstGuessMadeRef]);

  useEffect(() => {
    healthRef.current = health;
  }, [health, healthRef]);

  useEffect(() => {
    regionalFlagsRef.current = regionalFlags;
  }, [regionalFlags, regionalFlagsRef]);

  useEffect(() => {
    filteredFlagsRef.current = filteredFlags;
  }, [filteredFlags, filteredFlagsRef]);

  useEffect(() => {
    regionalInfiniteModeRef.current = regionalInfiniteMode;
  }, [regionalInfiniteMode, regionalInfiniteModeRef]);

  useEffect(() => {
    infiniteModeRef.current = infiniteMode;
  }, [infiniteMode, infiniteModeRef]);

  useEffect(() => {
    longestStreakRef.current = longestStreak;
  }, [longestStreak, longestStreakRef]);

  useEffect(() => {
    currentStreakRef.current = currentStreak;
  }, [currentStreak, currentStreakRef]);

  useEffect(() => {
    guessTimesRef.current = guessTimes;
  }, [guessTimes, guessTimesRef]);

  useEffect(() => {
    fastestGuessRef.current = fastestGuess;
  }, [fastestGuess, fastestGuessRef]);

  useEffect(() => {
    totalAttemptsRef.current = totalAttempts;
  }, [totalAttempts, totalAttemptsRef]);

  // Cleanup flag loading timeout when component unmounts or flag changes
  useEffect(() => {
    return () => {
      if (flagLoadingTimeout) {
        clearTimeout(flagLoadingTimeout);
      }
    };
  }, [flagLoadingTimeout]);

  // Auto-focus typing input when new question loads and typing mode is active
  useEffect(() => {
    if (gameStarted && currentFlag && typingInputRef?.current) {
      const isTypingMode = (gameMode === "standard" && typingMode) || 
                          (gameMode === "regional" && regionalTypingMode);
      const isTypingGameType = (gameMode === "standard" && gameType === "flag-to-country") ||
                               (gameMode === "regional" && regionalGameType === "flag-to-region");
      
      if (isTypingMode && isTypingGameType && !buttonsDisabled) {
        // Small delay to ensure input is rendered
        setTimeout(() => {
          typingInputRef.current?.focus();
        }, 100);
      }
    }
  }, [currentFlag, gameStarted, typingMode, regionalTypingMode, gameMode, gameType, regionalGameType, buttonsDisabled, typingInputRef]);

  // Keyboard event handler for number keys 1-4
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle keyboard input when game is started and buttons are not disabled
      if (!gameStartedRef.current || buttonsDisabledRef.current) return;
      
      // Check if the pressed key is 1, 2, 3, or 4
      const keyNumber = parseInt(event.key);
      if (keyNumber >= 1 && keyNumber <= 4) {
        // Get the current options based on game type
        const isRegionalMode = gameModeRef.current === "regional";
        const currentGameType = isRegionalMode ? regionalGameTypeRef.current : gameTypeRef.current;
        
        let currentOptions = [];
        if (currentGameType === "flag-to-country" || currentGameType === "flag-to-region") {
          // For flag-to-country/region mode, options are names
          currentOptions = optionsRef.current || [];
        } else {
          // For country-to-flag/region mode, options are flag IDs
          currentOptions = (flagOptionsRef.current || []).map(flag => flag.id);
        }
        
        // Check if the selected option exists (index is 0-based, so subtract 1)
        const selectedIndex = keyNumber - 1;
        if (selectedIndex < currentOptions.length) {
          const selectedAnswer = currentOptions[selectedIndex];
          checkAnswer(selectedAnswer);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [checkAnswer, gameStartedRef, buttonsDisabledRef, gameModeRef, regionalGameTypeRef, gameTypeRef, optionsRef, flagOptionsRef]);

  // Load global flags on mount
  useEffect(() => {
    const fetchFlags = async () => {
      setIsLoading(true);
      try {
        // Load global flags by default using simple direct query
        const globalFlags = await fetchGlobalFlags("world", false);
        setFlags(globalFlags);
        setFilteredFlagsState(globalFlags);
      } catch (error) {
        console.error("Error fetching flags:", error);
        setMessage("Error loading flags. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlags();
  }, [setIsLoading, setFlags, setFilteredFlagsState, setMessage]);

  // Load regional data from database
  useEffect(() => {
    const loadRegionalData = async () => {
      setIsLoadingRegionalCountries(true);
      setIsLoadingFeaturedCountries(true);
      
      try {
        // Use simple direct queries with flag counts
        const countriesData = await fetchRegionalCountries();
        const divisionTypesData = await fetchDivisionTypes();
        const featuredCountriesData = await fetchFeaturedCountries();
        
        setRegionalCountries(countriesData);
        setRegionalDivisionTypes(divisionTypesData);
        setFeaturedCountries(featuredCountriesData);
        
        console.log('Loaded regional data:', {
          countries: countriesData,
          divisionTypes: divisionTypesData,
          featuredCountries: featuredCountriesData
        });
        
      } catch (error) {
        console.error('Error loading regional data:', error);
        // Fallback to empty arrays if API fails
        setRegionalCountries([]);
        setRegionalDivisionTypes([]);
        setFeaturedCountries([]);
      } finally {
        setIsLoadingRegionalCountries(false);
        setIsLoadingFeaturedCountries(false);
      }
    };

    loadRegionalData();
  }, [setIsLoadingRegionalCountries, setIsLoadingFeaturedCountries, setRegionalCountries, setRegionalDivisionTypes, setFeaturedCountries]);

  // Apply filters when continent or territories change
  useEffect(() => {
    const applyFilters = async () => {
      try {
        // Only apply filters for global mode using simple direct query
        if (gameMode === "standard") {
          const filteredFlags = await fetchGlobalFlags(selectedContinent, includeTerritories);
          setFilteredFlagsState(filteredFlags);
        }
        // For regional mode, filtering is handled by the regional flag loading
      } catch (error) {
        console.error("Error applying filters:", error);
        setMessage("Error applying filters. Please try again.");
      }
    };

    applyFilters();
  }, [selectedContinent, includeTerritories, gameMode, setFilteredFlagsState, setMessage]);

  // Load appropriate flags when game mode changes
  useEffect(() => {
    const loadFlagsForMode = async () => {
      try {
        if (gameMode === "regional") {
          // For regional mode, we'll load flags when a country and division types are selected
          // This is handled in the regional menu flow
          setRegionalFlags([]);
          setFilteredRegionalFlags([]);
        } else {
          // For global mode, load flags with current filters using simple direct query
          const globalFlags = await fetchGlobalFlags(selectedContinent, includeTerritories);
          setFlags(globalFlags);
          setFilteredFlagsState(globalFlags);
        }
      } catch (error) {
        console.error("Error loading flags for mode:", error);
        setMessage("Error loading flags. Please try again.");
      }
    };

    loadFlagsForMode();
  }, [gameMode, selectedContinent, includeTerritories, setFlags, setFilteredFlagsState, setRegionalFlags, setFilteredRegionalFlags, setMessage]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (updateTimeoutRef?.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (flagLoadingTimeout) {
        clearTimeout(flagLoadingTimeout);
      }
    };
  }, [updateTimeoutRef, flagLoadingTimeout]);

  // Time Attack mode timer countdown effect
  useEffect(() => {
    if (timeAttackMode && timerStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer reached 0, end the game
            console.log('Time Attack: Timer reached 0, ending game');
            
            // Clear the timer first
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            // End the game immediately
            endTimeAttackGame();
            
            return 0;
          }
          
          // Play warning sound when time is low
          if (prev <= 5 && prev > 0) {
            playTimeWarningSound();
          }
          
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [timeAttackMode, timerStarted, timeRemaining, setTimeRemaining, timerRef, endTimeAttackGame, playTimeWarningSound]);

  // Cleanup timer when component unmounts or game ends
  useEffect(() => {
    return () => {
      if (timerRef?.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRef]);

  // Load game history and active game on mount
  useEffect(() => {
    loadGameHistory(setGameHistory, setBestScores);
    loadActiveGame(setActiveGame, setHasActiveGame);
  }, [setGameHistory, setBestScores, setActiveGame, setHasActiveGame]);

  // Check for challenge link on component mount
  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const challengeCode = urlParams?.get('challenge');
    
    if (challengeCode) {
      // Wait for regional data to load if needed
      if (!isLoadingRegionalCountries) {
        loadChallengeFromURL();
      }
    }
  }, [hasChallengeCode, isLoadingRegionalCountries, regionalCountries, loadChallengeFromURL]);

  // Save active game when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameStarted) {
        saveActiveGame();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && gameStarted) {
        saveActiveGame();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStarted, score, totalAttempts, usedFlags, longestStreak, guessTimes, fastestGuess, health, timeRemaining, timerStarted, firstGuessMade, currentFlag, options, flagOptions, saveActiveGame]);
};
