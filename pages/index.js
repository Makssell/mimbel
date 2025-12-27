import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabase";
import sharedStyles from "../styles/shared.module.css";
import modalsStyles from "../styles/modals.module.css";
import challengeScreenStyles from "../styles/challengeScreen.module.css";
import FeedbackModal from "../components/FeedbackModal";

// Import extracted utilities
import { createAudioFunctions } from "../utils/audioUtils";
import { preloadImages } from "../utils/imageUtils";
import { 
  formatTimeDisplay, 
  calculateAverageTime, 
  updateStreak, 
  recordGuessTime,
  getDivisionTypeNames,
  areAllDivisionsSelected,
  formatGameDate
} from "../utils/gameUtils";
import {
  generateGameConfigKey,
  saveGameToHistory as saveGameToHistoryUtil,
  updateBestScores as updateBestScoresUtil,
  loadGameHistory as loadGameHistoryUtil,
  clearGameHistory as clearGameHistoryUtil,
  saveActiveGame as saveActiveGameUtil,
  loadActiveGame as loadActiveGameUtil,
  clearActiveGame as clearActiveGameUtil
} from "../utils/storageUtils";

// Import extracted services
import {
  fetchGlobalFlags,
  fetchRegionalFlags,
  fetchRegionalCountries,
  fetchFeaturedCountries,
  fetchDivisionTypes
} from "../services/flagService";
import {
  submitChallengeScore as submitChallengeScoreService,
  loadChallenge,
  createChallenge,
  hasPlayedChallenge,
  savePlayedChallenge,
  getCreatedChallenges,
  saveCreatedChallenge
} from "../services/challengeService";

// Import extracted components
import ProgressBar from "../components/ProgressBar";
import FloatingMenu from "../components/FloatingMenu";
import HelpModal from "../components/HelpModal";
import GamesModal from "../components/GamesModal";
import ChallengesModal from "../components/ChallengesModal";
import BrowseAllCountriesModal from "../components/BrowseAllCountriesModal";
import ChallengeScreen from "../components/ChallengeScreen";
import GameScreen from "../components/GameScreen";
import EndScreen from "../components/EndScreen";
import StartScreen from "../components/StartScreen";

// Import extracted game logic
import {
  buildGameSettings,
  buildGameSettingsFromSnapshot,
  getTotalFlagsCount as getTotalFlagsCountUtil,
  getTotalFlagsCountFromSnapshot as getTotalFlagsCountFromSnapshotUtil,
  getRemainingFlagsCount as getRemainingFlagsCountUtil,
  getRemainingFlagsCountFromSnapshot as getRemainingFlagsCountFromSnapshotUtil
} from "../logic/gameSettings";
import {
  startGame as startGameUtil,
  loadNextQuestion as loadNextQuestionUtil,
  transitionToNextQuestion as transitionToNextQuestionUtil,
  endTimeAttackGame as endTimeAttackGameUtil,
  endInfiniteMode as endInfiniteModeUtil,
  handleFlagLoad as handleFlagLoadUtil,
  handleFlagError as handleFlagErrorUtil,
  retryFlagLoad as retryFlagLoadUtil
} from "../logic/gameFlow";
import {
  checkAnswer as checkAnswerUtil
} from "../logic/answerChecking";
import {
  randomizeSettings
} from "../utils/randomizeSettings";
import {
  parseShareUrl
} from "../utils/shareUtils";
import { filterFlagsWithOutlines } from "../utils/mapUtils";

const Site1 = () => {
  const [flags, setFlags] = useState([]);
  const [filteredFlags, setFilteredFlags] = useState([]);
  const [currentFlag, setCurrentFlag] = useState(null);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [buttonStyles, setButtonStyles] = useState({});
  const [typingInputStyle, setTypingInputStyle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContinent, setSelectedContinent] = useState("world");
  const [includeTerritories, setIncludeTerritories] = useState(false);
  const [infiniteMode, setInfiniteMode] = useState(false);
  const [timeAttackMode, setTimeAttackMode] = useState(false);
  const [typingMode, setTypingMode] = useState(false);
  const [regionalTypingMode, setRegionalTypingMode] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const [regionalFlashMode, setRegionalFlashMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const typingInputRef = useRef(null);
  const [usedFlags, setUsedFlags] = useState([]);
  const [isFlagLoading, setIsFlagLoading] = useState(true);
  const [flagLoadingTimeout, setFlagLoadingTimeout] = useState(null);
  const [lastFlagId, setLastFlagId] = useState(null);
  const [startScreenStep, setStartScreenStep] = useState(1);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [flagOptions, setFlagOptions] = useState([]);
  const [mapOutlineOptions, setMapOutlineOptions] = useState([]);
  const [outlineOnly, setOutlineOnly] = useState(false); // Show only outline without continent context
  // Load minimized state from localStorage, default to false
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flagGameMinimized');
      return saved === 'true';
    }
    return false;
  });

  // New state variables for end screen
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [endState, setEndState] = useState(null);
  const [gameStats, setGameStats] = useState({});

  // Game state snapshot for end screen (to avoid state changes affecting display)
  const [gameStateSnapshot, setGameStateSnapshot] = useState({});
  
  // Challenge link state
  // Check for challenge code immediately to prevent main menu from showing
  const hasChallengeCode = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('challenge') !== null
    : false;
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [challengeSettings, setChallengeSettings] = useState(null);
  const [showChallengeScreen, setShowChallengeScreen] = useState(hasChallengeCode);
  
  // New tracking variables for enhanced statistics
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [guessTimes, setGuessTimes] = useState([]);
  const [fastestGuess, setFastestGuess] = useState(null);
  const [lastGuessTime, setLastGuessTime] = useState(null);

  // Time Attack mode state variables
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [timerStarted, setTimerStarted] = useState(false);
  const [firstGuessMade, setFirstGuessMade] = useState(false);
  const timerRef = useRef(null);

  // New state for minimal menu flow
  const [menuStep, setMenuStep] = useState(0); // 0: Mode Selection, 1: GameType, 2: Continent, 3: Settings
  const [gameType, setGameType] = useState(null); // "flag-to-country" or "country-to-flag"
  const [gameMode, setGameMode] = useState("standard"); // "standard" or "regional"
  const [regionalGameType, setRegionalGameType] = useState(null); // "flag-to-region" or "region-to-flag"
  
  // Regional mode state variables
  const [regionalCountries, setRegionalCountries] = useState([]);
  const [selectedRegionalCountry, setSelectedRegionalCountry] = useState(null);
  const [isLoadingRegionalCountries, setIsLoadingRegionalCountries] = useState(false);
  const [regionalDivisionTypes, setRegionalDivisionTypes] = useState([]);
  const [selectedDivisionTypes, setSelectedDivisionTypes] = useState([]);
  const [regionalInfiniteMode, setRegionalInfiniteMode] = useState(false);
  
  // Regional flags state
  const [regionalFlags, setRegionalFlags] = useState([]);
  const [filteredRegionalFlags, setFilteredRegionalFlags] = useState([]);
  const [isLoadingRegionalFlags, setIsLoadingRegionalFlags] = useState(false);
  
  // Featured countries state
  const [featuredCountries, setFeaturedCountries] = useState([]);
  const [showAllCountriesModal, setShowAllCountriesModal] = useState(false);
  const [isLoadingFeaturedCountries, setIsLoadingFeaturedCountries] = useState(false);
  
  // Ref to store current game flags (for regional mode)
  const currentGameFlagsRef = useRef([]);
  // Ref to track current score (for Time Attack mode)
  const currentScoreRef = useRef(0);

  // Progress bar state
  const [progressBarHover, setProgressBarHover] = useState(false);

  // Transition state variables for smooth animations
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [flagTransitioning, setFlagTransitioning] = useState(false);
  const [optionsTransitioning, setOptionsTransitioning] = useState(false);
  const [messageTransitioning, setMessageTransitioning] = useState(false);

  // Audio context and sound system
  const audioContextRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // New state for floating menu
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'feedback', 'help', 'settings', 'games'

  // Game history and best scores state
  const [gameHistory, setGameHistory] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [gamesView, setGamesView] = useState('history'); // 'history' or 'best'
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  // Active game state for saving incomplete games
  const [activeGame, setActiveGame] = useState(null);
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [resumedQuestionFlagId, setResumedQuestionFlagId] = useState(null);

  // Track GamesModal last opened state for notifications
  const [gamesModalLastOpened, setGamesModalLastOpened] = useState(null);

  // Refs to track current state values for keyboard handler
  const timeRemainingRef = useRef(timeRemaining);
  const buttonsDisabledRef = useRef(buttonsDisabled);
  const gameStartedRef = useRef(gameStarted);
  const gameModeRef = useRef(gameMode);
  const regionalGameTypeRef = useRef(regionalGameType);
  const gameTypeRef = useRef(gameType);
  const optionsRef = useRef(options);
  const flagOptionsRef = useRef(flagOptions);
  const currentFlagRef = useRef(currentFlag);
  const scoreRef = useRef(score);
  const timeAttackModeRef = useRef(timeAttackMode);
  const firstGuessMadeRef = useRef(firstGuessMade);
  const healthRef = useRef(health);
  const regionalFlagsRef = useRef(regionalFlags);
  const filteredFlagsRef = useRef(filteredFlags);
  const regionalInfiniteModeRef = useRef(regionalInfiniteMode);
  const infiniteModeRef = useRef(infiniteMode);
  const longestStreakRef = useRef(longestStreak);
  const currentStreakRef = useRef(currentStreak);
  const guessTimesRef = useRef(guessTimes);
  const fastestGuessRef = useRef(fastestGuess);
  const totalAttemptsRef = useRef(totalAttempts);

  // Add image cache for better performance
  const imageCache = useRef(new Map());
  const loadingFlags = useRef(new Set());
  const updateTimeoutRef = useRef(null);
  
  // Use imported preloadImages function with our refs
  const preloadImagesWrapper = (flags) => {
    preloadImages(flags, imageCache, loadingFlags);
  };
  
  // Alias for compatibility
  const preloadImagesLocal = preloadImagesWrapper;
  
  // Debounced update function to reduce re-renders
  const debouncedUpdate = () => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      setFlagOptions(prev => [...prev]);
    }, 50);
  };

  // Keep refs in sync with state
  useEffect(() => {
    totalAttemptsRef.current = totalAttempts;
  }, [totalAttempts]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        // Create audio context only when user interacts
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        setAudioEnabled(false);
      }
    };

    // Initialize audio on first user interaction
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Handle clicking outside floating menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const floatingMenu = document.querySelector(`.${modalsStyles.floatingMenuContainer}`);
      if (floatingMenu && !floatingMenu.contains(event.target)) {
        setShowFloatingMenu(false);
      }
    };

    if (showFloatingMenu) {
      // Use a small delay to allow menu item clicks to process first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showFloatingMenu]);

  // Force enable outlines when flag-to-map mode is selected
  useEffect(() => {
    if (gameType === "flag-to-map") {
      setOutlineOnly(true);
    }
  }, [gameType]);

  // Use imported audio functions
  const audioFunctions = createAudioFunctions(audioContextRef, audioEnabled);
  const {
    playMenuClickSound,
    playCorrectSound,
    playIncorrectSound,
    playGameOverSound,
    playVictorySound,
    playMenuHoverSound,
    playGameStartSound,
    playTimeWarningSound
  } = audioFunctions;

  // Update refs when state changes
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    buttonsDisabledRef.current = buttonsDisabled;
  }, [buttonsDisabled]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  useEffect(() => {
    regionalGameTypeRef.current = regionalGameType;
  }, [regionalGameType]);

  useEffect(() => {
    gameTypeRef.current = gameType;
  }, [gameType]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    flagOptionsRef.current = flagOptions;
  }, [flagOptions]);

  useEffect(() => {
    currentFlagRef.current = currentFlag;
  }, [currentFlag]);

  // Cleanup flag loading timeout when component unmounts or flag changes
  useEffect(() => {
    return () => {
      if (flagLoadingTimeout) {
        clearTimeout(flagLoadingTimeout);
      }
    };
  }, [flagLoadingTimeout]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    timeAttackModeRef.current = timeAttackMode;
  }, [timeAttackMode]);

  useEffect(() => {
    firstGuessMadeRef.current = firstGuessMade;
  }, [firstGuessMade]);

  useEffect(() => {
    healthRef.current = health;
  }, [health]);

  useEffect(() => {
    regionalFlagsRef.current = regionalFlags;
  }, [regionalFlags]);

  useEffect(() => {
    filteredFlagsRef.current = filteredFlags;
  }, [filteredFlags]);

  useEffect(() => {
    regionalInfiniteModeRef.current = regionalInfiniteMode;
  }, [regionalInfiniteMode]);

  useEffect(() => {
    infiniteModeRef.current = infiniteMode;
  }, [infiniteMode]);

  useEffect(() => {
    longestStreakRef.current = longestStreak;
  }, [longestStreak]);

  useEffect(() => {
    currentStreakRef.current = currentStreak;
  }, [currentStreak]);

  useEffect(() => {
    guessTimesRef.current = guessTimes;
  }, [guessTimes]);

  useEffect(() => {
    fastestGuessRef.current = fastestGuess;
  }, [fastestGuess]);

  // Auto-focus typing input when new question loads and typing mode is active
  useEffect(() => {
    if (gameStarted && currentFlag && typingInputRef.current) {
      const isTypingMode = (gameMode === "standard" && typingMode) || 
                          (gameMode === "regional" && regionalTypingMode);
      // TODO: Typing mode for map-to-flag (commented out for now)
      const isTypingGameType = (gameMode === "standard" && gameType === "flag-to-country") ||
                               // (gameMode === "standard" && gameType === "map-to-flag") ||
                               (gameMode === "regional" && regionalGameType === "flag-to-region");
      
      if (isTypingMode && isTypingGameType && !buttonsDisabled) {
        // Small delay to ensure input is rendered
        setTimeout(() => {
          typingInputRef.current?.focus();
        }, 100);
      }
    }
  }, [currentFlag, gameStarted, typingMode, regionalTypingMode, gameMode, gameType, regionalGameType, buttonsDisabled]);

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
  }, []); // Empty dependency array since we're using refs

  // Progress bar configuration
  const getProgressSteps = () => {
    if (gameMode === "regional") {
      return [
        { id: 0, name: "mode" },
        { id: "regional-1", name: "gameType" },
        { id: "regional-2", name: "country" },
        { id: "regional-3", name: "divisionType" },
        { id: "regional-4", name: "settings" }
      ];
    } else {
      return [
        { id: 0, name: "mode" },
        { id: 1, name: "gameType" },
        { id: 2, name: "continent" },
        { id: 3, name: "settings" }
      ];
    }
  };

  const getCurrentStepIndex = () => {
    const steps = getProgressSteps();
    return steps.findIndex(step => step.id === menuStep);
  };

  const getCompletedSteps = () => {
    const currentIndex = getCurrentStepIndex();
    const steps = getProgressSteps();
    return steps.slice(0, currentIndex).map(step => step.id);
  };

  const canGoBack = () => {
    return getCurrentStepIndex() > 0;
  };

  const canGoForward = () => {
    const currentIndex = getCurrentStepIndex();
    const steps = getProgressSteps();
    return currentIndex < steps.length - 1;
  };

  const goToPreviousStep = () => {
    if (!canGoBack()) return;
    
    playMenuClickSound();
    
    const steps = getProgressSteps();
    const currentIndex = getCurrentStepIndex();
    const previousStep = steps[currentIndex - 1];
    
    setMenuStep(previousStep.id);
  };

  const goToNextStep = () => {
    if (!canGoForward()) return;
    
    playMenuClickSound();
    
    const steps = getProgressSteps();
    const currentIndex = getCurrentStepIndex();
    const nextStep = steps[currentIndex + 1];
    
    // Only allow forward navigation if current step is valid
    if (menuStep === 0 && gameMode) {
      setMenuStep(nextStep.id);
    } else if (menuStep === 1 && gameType) {
      setMenuStep(nextStep.id);
    } else if (menuStep === 2 && selectedContinent) {
      setMenuStep(nextStep.id);
    } else if (menuStep === "regional-1" && regionalGameType) {
      setMenuStep(nextStep.id);
    } else if (menuStep === "regional-2" && selectedRegionalCountry) {
      setMenuStep(nextStep.id);
    } else if (menuStep === "regional-3" && selectedDivisionTypes.length > 0) {
      setMenuStep(nextStep.id);
    }
  };

  const handleProgressStepClick = (stepId) => {
    const steps = getProgressSteps();
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    
    // Only allow jumping to completed steps or the current step
    if (stepIndex <= currentIndex) {
      playMenuClickSound();
      setMenuStep(stepId);
    }
  };

  // ProgressBar is now imported from ./components/ProgressBar

  // FloatingMenu is now imported from ./components/FloatingMenu

  // HelpModal is now imported from ./components/HelpModal

  // GamesModal is now imported from ./components/GamesModal

  // ChallengesModal is now imported from ./components/ChallengesModal

  // BrowseAllCountriesModal is now imported from ./components/BrowseAllCountriesModal

  // Simple direct Supabase query for global flags (Site4 style)
  // Use imported service functions (fetchGlobalFlags, fetchRegionalFlags, etc. are imported above)

  useEffect(() => {
    const fetchFlags = async () => {
      setIsLoading(true);
      try {
        // Load global flags by default using simple direct query
        const globalFlags = await fetchGlobalFlags("world", false);
        setFlags(globalFlags);
        setFilteredFlags(globalFlags);
      } catch (error) {
        console.error("Error fetching flags:", error);
        setMessage("Error loading flags. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlags();
  }, []);

  // Load regional data from database using simple direct queries
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
  }, []);

  // Handle share URL auto-start
  useEffect(() => {
    const handleShareUrl = async () => {
      // Don't process if challenge code is present (challenge takes priority)
      if (hasChallengeCode) {
        return;
      }

      if (typeof window === 'undefined') return;
      
      const searchParams = new URLSearchParams(window.location.search);
      const shareSettings = parseShareUrl(searchParams);
      
      if (!shareSettings) {
        return; // Not a share link
      }

      console.log('Share URL detected, applying settings:', shareSettings);

      // Apply settings
      setGameMode(shareSettings.gameMode);
      setTimeAttackMode(shareSettings.timeAttackMode);

      if (shareSettings.gameMode === 'regional') {
        // Regional mode
        setRegionalGameType(shareSettings.gameType);
        setRegionalInfiniteMode(shareSettings.regionalInfiniteMode);
        setRegionalTypingMode(shareSettings.regionalTypingMode);
        setRegionalFlashMode(shareSettings.regionalFlashMode || false);

        // Find and set the regional country
        if (shareSettings.selectedRegionalCountryId) {
          // Wait for regional countries to load
          if (regionalCountries.length === 0 && featuredCountries.length === 0) {
            // Wait a bit for data to load, then retry
            const retryTimeout = setTimeout(() => {
              handleShareUrl();
            }, 500);
            return () => clearTimeout(retryTimeout);
          }

          const allCountries = [...regionalCountries, ...featuredCountries];
          const country = allCountries.find(c => c.id === shareSettings.selectedRegionalCountryId);
          
          if (country) {
            setSelectedRegionalCountry(country);
            
            // Set division types
            if (shareSettings.selectedDivisionTypes && shareSettings.selectedDivisionTypes.length > 0) {
              setSelectedDivisionTypes(shareSettings.selectedDivisionTypes);
              
              // Load regional flags
              try {
                const flags = await fetchRegionalFlags(country.id, shareSettings.selectedDivisionTypes);
                setRegionalFlags(flags);
                setFilteredRegionalFlags(flags);
                
                // Wait for state to update, then start game
                await new Promise(resolve => setTimeout(resolve, 200));
                await startGame();
              } catch (error) {
                console.error('Error loading regional flags from share URL:', error);
                setMessage('Error loading game settings from share link.');
              }
            }
          } else {
            console.error('Country not found:', shareSettings.selectedRegionalCountryId);
            setMessage('Invalid share link: Country not found.');
          }
        }
      } else {
        // Standard mode
        setGameType(shareSettings.gameType);
        setSelectedContinent(shareSettings.selectedContinent);
        setIncludeTerritories(shareSettings.includeTerritories);
        setInfiniteMode(shareSettings.infiniteMode);
        setTypingMode(shareSettings.typingMode);
        setFlashMode(shareSettings.flashMode || false);

        // Load flags for the continent
        try {
          const flags = await fetchGlobalFlags(shareSettings.selectedContinent, shareSettings.includeTerritories);
          setFilteredFlags(flags);
          
          // Wait for state to update, then start game
          await new Promise(resolve => setTimeout(resolve, 200));
          await startGame();
        } catch (error) {
          console.error('Error loading flags from share URL:', error);
          setMessage('Error loading game settings from share link.');
        }
      }
    };

    // Only run if not already in a game and not showing challenge screen and data is loaded
    if (!gameStarted && !showChallengeScreen && !isLoading && !isLoadingRegionalCountries && !isLoadingFeaturedCountries) {
      handleShareUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isLoadingRegionalCountries, isLoadingFeaturedCountries, gameStarted, showChallengeScreen, hasChallengeCode, regionalCountries.length, featuredCountries.length]);

  useEffect(() => {
    const applyFilters = async () => {
      try {
        // Only apply filters for global mode using simple direct query
        if (gameMode === "standard") {
          const filteredFlags = await fetchGlobalFlags(selectedContinent, includeTerritories);
          setFilteredFlags(filteredFlags);
        }
        // For regional mode, filtering is handled by the regional flag loading
      } catch (error) {
        console.error("Error applying filters:", error);
        setMessage("Error applying filters. Please try again.");
      }
    };

    applyFilters();
  }, [selectedContinent, includeTerritories, gameMode]);

  // Load appropriate flags when game mode changes using simple direct queries
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
          setFilteredFlags(globalFlags);
        }
      } catch (error) {
        console.error("Error loading flags for mode:", error);
        setMessage("Error loading flags. Please try again.");
      }
    };

    loadFlagsForMode();
  }, [gameMode]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (flagLoadingTimeout) {
        clearTimeout(flagLoadingTimeout);
      }
    };
  }, []);

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
  }, [timeAttackMode, timerStarted]);

  // Cleanup timer when component unmounts or game ends
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Wrapper for imported endInfiniteMode
  const endInfiniteMode = () => {
    endInfiniteModeUtil({
      playGameOverSound,
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
      flashMode,
      regionalFlashMode,
      regionalFlags,
      filteredFlags,
      usedFlags,
      longestStreak,
      fastestGuess,
      isChallengeMode,
      fastestGuessRef,
      setGameStats,
      setGameStateSnapshot,
      setEndState,
      setGameStarted,
      setShowEndScreen,
      calculateAverageTime: calculateAverageTimeWrapper,
      submitChallengeScore,
      saveGameToHistory,
      clearActiveGame,
      buildGameSettingsFromSnapshot: buildGameSettingsFromSnapshotWrapper,
      getTotalFlagsCountFromSnapshot,
      getRemainingFlagsCountFromSnapshot
    });
  };

  // Wrapper for imported endTimeAttackGame
  const endTimeAttackGame = () => {
    endTimeAttackGameUtil({
      gameStarted,
      showEndScreen,
      playGameOverSound,
      currentScoreRef,
      timerRef,
      totalAttemptsRef,
      fastestGuessRef,
      setButtonsDisabled,
      setMessage,
      setTimeout: window.setTimeout,
      setGameStats,
      setGameStateSnapshot,
      setEndState,
      setGameStarted,
      setShowEndScreen,
      setTimerStarted,
      setFirstGuessMade,
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
      calculateAverageTime: calculateAverageTimeWrapper,
      submitChallengeScore,
      saveGameToHistory,
      clearActiveGame,
      buildGameSettingsFromSnapshot: buildGameSettingsFromSnapshotWrapper,
      getTotalFlagsCountFromSnapshot,
      getRemainingFlagsCountFromSnapshot
    });
  };

  // Wrapper for imported startGame
  const startGame = async () => {
    await startGameUtil({
      playGameStartSound,
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
      currentScoreRef,
      timeAttackMode,
      isChallengeMode,
      gameMode,
      regionalFlags,
      selectedRegionalCountry,
      selectedDivisionTypes,
      filteredFlags,
      loadNextQuestion
    });
  };

  // Handler for randomizing settings and starting game
  const handleRandomize = async () => {
    await randomizeSettings({
      featuredCountries,
      regionalDivisionTypes,
      setGameMode,
      setGameType,
      setRegionalGameType,
      setSelectedContinent,
      setIncludeTerritories,
      setTimeAttackMode,
      setInfiniteMode,
      setTypingMode,
      setRegionalInfiniteMode,
      setRegionalTypingMode,
      setSelectedRegionalCountry,
      setSelectedDivisionTypes,
      setOutlineOnly,
      fetchGlobalFlags,
      fetchRegionalFlags,
      setFilteredFlags,
      setRegionalFlags,
      setFilteredRegionalFlags,
      startGame,
      playMenuClickSound
    });
  };

  // Transition functions for smooth animations
  const startTransition = () => {
    setIsTransitioning(true);
    setFlagTransitioning(true);
    setOptionsTransitioning(true);
    setMessageTransitioning(true);
  };

  const endTransition = () => {
    setIsTransitioning(false);
    setFlagTransitioning(false);
    setOptionsTransitioning(false);
    setMessageTransitioning(false);
  };

  // Wrapper for imported transitionToNextQuestion
  const transitionToNextQuestion = async (currentScore = null) => {
    await transitionToNextQuestionUtil({
      setIsTransitioning,
      setFlagTransitioning,
      setOptionsTransitioning,
      setMessageTransitioning,
      loadNextQuestion,
      preloadImages: preloadImagesLocal,
      gameModeRef,
      regionalGameTypeRef,
      gameTypeRef
    }, currentScore);
  };

  // Wrapper for imported loadNextQuestion
  const loadNextQuestion = async (currentScore = null, resetUsedFlags = null) => {
    return await loadNextQuestionUtil({
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
      calculateAverageTime: calculateAverageTimeWrapper,
      submitChallengeScore,
      preloadImages: preloadImagesLocal,
      saveGameToHistory,
      clearActiveGame
    }, currentScore, resetUsedFlags);
  };

  // Optimized flag load handler with reduced state updates
  const handleFlagLoad = (flagId) => {
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

  // Simple flag error handler (Site4 style)
  const handleFlagError = (flagId, flagName) => {
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

  // Simple retry function (Site4 style) - just reload the current question
  const retryFlagLoad = (flagId) => {
    console.log(`Retrying flag load for: ${flagId}`);
    // Simple approach: just load the next question
    loadNextQuestion(null, null);
  };

  // Wrapper for imported updateBestScores
  const updateBestScores = (gameStats, gameStateSnapshot) => {
    updateBestScoresUtil(gameStats, gameStateSnapshot, setBestScores);
  };

  // Wrapper for imported saveGameToHistory
  const saveGameToHistory = (gameStats, gameStateSnapshot) => {
    saveGameToHistoryUtil(gameStats, gameStateSnapshot, setGameHistory, () => {
      updateBestScores(gameStats, gameStateSnapshot);
    });
  };

  // Wrapper for imported checkAnswer
  const checkAnswer = (selectedAnswer) => {
    checkAnswerUtil({
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
      flashMode,
      regionalFlashMode,
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
      styles: sharedStyles,
      // Helper functions
      buildGameSettingsFromSnapshot: buildGameSettingsFromSnapshotWrapper,
      getTotalFlagsCountFromSnapshot,
      getRemainingFlagsCountFromSnapshot,
      calculateAverageTime: calculateAverageTimeWrapper
    }, selectedAnswer);
  };

  // Wrapper functions that maintain same API but use imported logic
  const buildGameSettingsWrapper = () => {
    return buildGameSettings({
      gameMode,
      regionalGameType,
      gameType,
      selectedRegionalCountry,
      selectedContinent,
      includeTerritories,
      selectedDivisionTypes,
      timeAttackMode,
      regionalInfiniteMode,
      infiniteMode,
      typingMode,
      regionalTypingMode,
      flashMode,
      regionalFlashMode
    });
  };

  const buildGameSettingsFromSnapshotWrapper = (gameState) => {
    return buildGameSettingsFromSnapshot(gameState);
  };

  // Use imported game settings functions
  const getTotalFlagsCount = () => {
    return getTotalFlagsCountUtil({ gameMode, regionalFlags, filteredFlags });
  };

  const getTotalFlagsCountFromSnapshot = (gameState) => {
    return getTotalFlagsCountFromSnapshotUtil(gameState);
  };

  const getRemainingFlagsCount = () => {
    return getRemainingFlagsCountUtil({ gameMode, regionalFlags, filteredFlags, usedFlags });
  };

  const getRemainingFlagsCountFromSnapshot = (gameState, usedFlagsCount) => {
    return getRemainingFlagsCountFromSnapshotUtil(gameState, usedFlagsCount);
  };

  // Use imported helper functions with local state
  const calculateAverageTimeWrapper = () => calculateAverageTime(guessTimes);
  
  const updateStreakWrapper = (isCorrect) => {
    const result = updateStreak(isCorrect, currentStreak, longestStreak);
    setCurrentStreak(result.currentStreak);
    if (result.longestStreak > longestStreak) {
      setLongestStreak(result.longestStreak);
    }
  };
  
  const recordGuessTimeWrapper = (isCorrect) => {
    // Ensure guessTimes is an array
    const safeGuessTimes = Array.isArray(guessTimes) ? guessTimes : [];
    const result = recordGuessTime(isCorrect, lastGuessTime, fastestGuess, safeGuessTimes);
    if (result.guessTimes) {
      setGuessTimes(result.guessTimes);
    }
    if (result.fastestGuess !== undefined) {
      setFastestGuess(result.fastestGuess);
      if (fastestGuessRef) {
        fastestGuessRef.current = result.fastestGuess;
      }
    }
  };

  // Use imported generateGameConfigKey (no wrapper needed - same signature)

  // Wrapper for imported submitChallengeScore that handles state updates
  const submitChallengeScore = async (gameStats, playerName = null) => {
    if (!isChallengeMode || !challengeData) {
      console.log('Cannot submit: isChallengeMode=', isChallengeMode, 'challengeData=', challengeData);
      return;
    }
    
    // Use provided player name or state, but require a name
    const nameToUse = playerName || challengePlayerName;
    console.log('Submitting challenge score:', {
      hasName: !!nameToUse,
      name: nameToUse,
      challengeCode: challengeData.challenge_code,
      score: gameStats.score
    });
    
    if (!nameToUse || !nameToUse.trim()) {
      console.error('No player name available for submission');
      setMessage('Please enter your name to submit your score');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    // Call imported submitChallengeScore (renamed to avoid conflict)
    const result = await submitChallengeScoreService(challengeData.challenge_code, nameToUse, gameStats);
    
    if (!result.success) {
      if (result.status === 409) {
        setMessage(result.error);
        setTimeout(() => setMessage(''), 7000);
        return;
      }
      setMessage('Failed to submit score: ' + result.error);
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    console.log('Score submitted successfully:', result.data);

    // Mark as submitted
    setChallengeScoreSubmitted(true);

    // Reload challenge data to update leaderboard
    const challengeResult = await loadChallenge(challengeData.challenge_code);
    if (challengeResult.success) {
      setChallengeResults(challengeResult.results || []);
      console.log('Leaderboard updated, results count:', challengeResult.results.length);
    }
    
    // Save to played challenges using imported function
    savePlayedChallenge(challengeData.challenge_code, gameStats.score);

    // Mark as played
    setHasPlayedChallenge(true);

    setMessage('Score submitted to leaderboard!');
    setTimeout(() => setMessage(''), 3000);
  };


  // Wrappers for imported storage functions
  const loadGameHistory = () => {
    loadGameHistoryUtil(setGameHistory, setBestScores);
  };

  const clearGameHistory = () => {
    clearGameHistoryUtil(setGameHistory, setBestScores);
  };

  const formatGameDate = (timestamp) => {
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

  // Helper function to get division type names for display
  const getDivisionTypeNames = (divisionTypeIds) => {
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

  // Helper function to check if all divisions are selected for a country
  const areAllDivisionsSelected = (countryName, divisionTypeIds) => {
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

  // Challenge link functions
  const handleShareChallenge = async () => {
    if (!gameStateSnapshot.gameMode || !gameStats || !gameStats.score) {
      setMessage('No game results to share. Please finish a game first.');
      return;
    }
    
    try {
      // Check challenge limit (3 active challenges)
      const createdChallenges = JSON.parse(localStorage.getItem('createdChallenges') || '[]');
      const activeChallenges = createdChallenges.filter(c => {
        const expiresAt = new Date(c.expires_at);
        return expiresAt > new Date();
      });
      
      if (activeChallenges.length >= 3) {
        alert('You have 3 active challenges. Delete one to create a new challenge.');
        return;
      }

      // Prompt for player name
      const playerName = prompt('Enter your name for the leaderboard:');
      if (!playerName || !playerName.trim()) {
        return; // User cancelled or entered empty name
      }

      // Build game settings object
      const gameSettings = buildGameSettingsFromSnapshotWrapper(gameStateSnapshot);
      
      // Create challenge via API
      const response = await fetch('/api/challenges/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameSettings })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create challenge');
      }

      const { challenge_code, challenge_id, expires_at } = await response.json();
      
      // Submit current game results to the challenge
      const submitResponse = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeCode: challenge_code,
          playerName: playerName.trim(),
          gameStats: gameStats
        })
      });

      if (!submitResponse.ok) {
        const error = await submitResponse.json();
        console.error('Failed to submit score to challenge:', error);
        // Challenge is created, but score submission failed
        // User can still submit their score manually after the redirect
        setMessage('Challenge created! However, your score submission failed. You can submit it after starting the game.');
        setTimeout(() => setMessage(''), 5000);
      }
      
      // Save to localStorage
      const newChallenge = {
        code: challenge_code,
        id: challenge_id,
        date: new Date().toISOString(),
        expires_at: expires_at,
        settings: gameSettings
      };
      createdChallenges.push(newChallenge);
      localStorage.setItem('createdChallenges', JSON.stringify(createdChallenges));
      
      // Save to played challenges
      const playedChallenges = JSON.parse(localStorage.getItem('playedChallenges') || '[]');
      if (!playedChallenges.find(c => c.code === challenge_code)) {
        playedChallenges.push({
          code: challenge_code,
          date: new Date().toISOString(),
          score: gameStats.score
        });
        localStorage.setItem('playedChallenges', JSON.stringify(playedChallenges));
      }
      
      // Redirect to challenge page
      const baseUrl = window.location.origin + window.location.pathname;
      window.location.href = `${baseUrl}?challenge=${challenge_code}`;
    } catch (error) {
      console.error('Error creating challenge:', error);
      setMessage('Failed to create challenge: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Challenge state
  const [challengeData, setChallengeData] = useState(null);
  const [challengeResults, setChallengeResults] = useState([]);
  const [challengeLoading, setChallengeLoading] = useState(hasChallengeCode);
  const [challengePlayerName, setChallengePlayerName] = useState('');
  const [challengeScoreSubmitted, setChallengeScoreSubmitted] = useState(false);
  const [hasPlayedChallenge, setHasPlayedChallenge] = useState(false);

  const loadChallengeFromURL = async () => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const challengeCode = urlParams.get('challenge');
    
    if (!challengeCode) return;
    
    setChallengeLoading(true);
    setIsChallengeMode(true);
    
    try {
      // Fetch challenge from API
      const response = await fetch(`/api/challenges/get?code=${challengeCode}`);
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 404) {
          setMessage('Challenge not found');
        } else if (response.status === 410) {
          setMessage('Challenge has expired');
        } else {
          setMessage('Failed to load challenge: ' + error.error);
        }
        setChallengeLoading(false);
        setShowChallengeScreen(false);
        setIsChallengeMode(false);
        return;
      }

      const { challenge, results } = await response.json();
      setChallengeData(challenge);
      setChallengeResults(results || []);
      
      // Check if user has already played this challenge
      const playedChallenges = JSON.parse(localStorage.getItem('playedChallenges') || '[]');
      const hasPlayed = playedChallenges.some(c => c.code === challengeCode);
      setHasPlayedChallenge(hasPlayed);
      
      // Extract game settings
      const settings = challenge.game_settings;
      setChallengeSettings({
        gameMode: settings.gameMode === "Regional Flags" ? "regional" : "standard",
        gameType: settings.gameType === "Flag → Country" ? "flag-to-country" :
                 settings.gameType === "Country → Flag" ? "country-to-flag" :
                 settings.gameType === "Flag → Region" ? "flag-to-region" :
                 settings.gameType === "Region → Flag" ? "region-to-flag" : null,
        selectedContinent: settings.region === "World" ? "world" :
                          settings.region === "Africa" ? "1" :
                          settings.region === "Asia" ? "2" :
                          settings.region === "Europe" ? "3" :
                          settings.region === "North America" ? "4" :
                          settings.region === "South America" ? "5" :
                          settings.region === "Oceania" ? "6" : "world",
        includeTerritories: settings.territories === "Included",
        timeAttackMode: settings.mode === "Time Attack",
        infiniteMode: settings.mode === "Infinite",
        regionalInfiniteMode: settings.mode === "Infinite",
        typingMode: settings.typingMode || false,
        regionalTypingMode: settings.typingMode || false,
        flashMode: settings.flashMode || false,
        regionalFlashMode: settings.flashMode || false,
        country: settings.country,
        divisionTypes: settings.divisionTypes
      });
      
      // Restore game settings
      const isRegional = settings.gameMode === "Regional Flags";
      setGameMode(isRegional ? "regional" : "standard");
      setTimeAttackMode(settings.mode === "Time Attack");
      setRegionalInfiniteMode(settings.mode === "Infinite" && isRegional);
      setInfiniteMode(settings.mode === "Infinite" && !isRegional);
      setTypingMode(settings.typingMode && !isRegional);
      setRegionalTypingMode(settings.typingMode && isRegional);
      setFlashMode(settings.flashMode && !isRegional);
      setRegionalFlashMode(settings.flashMode && isRegional);
      
      if (isRegional && settings.country) {
        // Find country by name
        const country = regionalCountries.find(c => c.name === settings.country);
        if (country) {
          setRegionalGameType(settings.gameType === "Flag → Region" ? "flag-to-region" : "region-to-flag");
          setSelectedRegionalCountry(country);
          
          // Fetch division types so we can display their names
          try {
            const divisionTypesData = await fetchDivisionTypes();
            setRegionalDivisionTypes(divisionTypesData);
          } catch (error) {
            console.error('Error loading division types:', error);
          }
          
          // Load division types if specified
          if (settings.divisionTypes && settings.divisionTypes.length > 0) {
            setSelectedDivisionTypes(settings.divisionTypes);
            try {
              const loadedFlags = await fetchRegionalFlags(country.id, settings.divisionTypes);
              setRegionalFlags(loadedFlags);
              setFilteredRegionalFlags(loadedFlags);
            } catch (error) {
              console.error('Error loading regional flags:', error);
            }
          }
        }
      } else {
        const gameType = settings.gameType === "Flag → Country" ? "flag-to-country" : "country-to-flag";
        setGameType(gameType);
        const continent = settings.region === "World" ? "world" :
                          settings.region === "Africa" ? "1" :
                          settings.region === "Asia" ? "2" :
                          settings.region === "Europe" ? "3" :
                          settings.region === "North America" ? "4" :
                          settings.region === "South America" ? "5" :
                          settings.region === "Oceania" ? "6" : "world";
        setSelectedContinent(continent);
        setIncludeTerritories(settings.territories === "Included");
        
        try {
          const globalFlags = await fetchGlobalFlags(continent, settings.territories === "Included");
          setFilteredFlags(globalFlags);
        } catch (error) {
          console.error('Error loading global flags:', error);
        }
      }
      
      // Show challenge screen
      setShowChallengeScreen(true);
    } catch (error) {
      console.error('Error loading challenge:', error);
      setMessage('Failed to load challenge');
      setShowChallengeScreen(false);
      setIsChallengeMode(false);
    } finally {
      setChallengeLoading(false);
    }
  };



  // Save minimized state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flagGameMinimized', isMinimized.toString());
    }
  }, [isMinimized]);

  // Load game history on component mount
  useEffect(() => {
    loadGameHistory();
    loadActiveGame(); // Also load any active game
  }, []);

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
  }, [isLoadingRegionalCountries, regionalCountries]);

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
  }, [gameStarted, score, totalAttempts, usedFlags, longestStreak, guessTimes, fastestGuess, health, timeRemaining, timerStarted, firstGuessMade, currentFlag, options, flagOptions]);

  // Wrappers for imported active game functions
  const saveActiveGame = () => {
    const gameState = {
      gameStarted,
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
      currentFlag,
      options,
      flagOptions,
      mapOutlineOptions,
      health,
      timeRemaining,
      timerStarted,
      firstGuessMade,
      guessTimes,
      lastGuessTime,
      resumedQuestionFlagId
    };
    
    const gameStats = {
      score,
      totalAttempts,
      gameStartTime,
      longestStreak,
      fastestGuess
    };
    
    saveActiveGameUtil(
      gameState,
      gameStats,
      setActiveGame,
      setHasActiveGame,
      buildGameSettingsWrapper,
      getTotalFlagsCount,
      getRemainingFlagsCount,
      calculateAverageTimeWrapper
    );
  };

  const loadActiveGame = () => {
    return loadActiveGameUtil(setActiveGame, setHasActiveGame);
  };

  const continueActiveGame = async (activeGameData) => {
    try {
      const gameState = activeGameData.gameState;
      
      // Restore game state
      setGameMode(gameState.gameMode);
      setTimeAttackMode(gameState.timeAttackMode);
      setRegionalInfiniteMode(gameState.regionalInfiniteMode);
      setInfiniteMode(gameState.infiniteMode);
      setTypingMode(gameState.typingMode || false);
      setRegionalTypingMode(gameState.regionalTypingMode || false);
      setFlashMode(gameState.flashMode || false);
      setRegionalFlashMode(gameState.regionalFlashMode || false);
      
      if (gameState.gameMode === "regional") {
        setRegionalGameType(gameState.gameType);
        setSelectedRegionalCountry(gameState.selectedRegionalCountry);
        setSelectedDivisionTypes(gameState.selectedDivisionTypes || []);
        setRegionalFlags(gameState.regionalFlags);
        setFilteredRegionalFlags(gameState.regionalFlags);
      } else {
        setGameType(gameState.gameType);
        setSelectedContinent(gameState.selectedContinent);
        setIncludeTerritories(gameState.includeTerritories);
        setFilteredFlags(gameState.filteredFlags);
      }
      
      // Restore game progress
      setScore(activeGameData.gameStats.score);
      currentScoreRef.current = activeGameData.gameStats.score;
      setTotalAttempts(activeGameData.gameStats.totalAttempts);
      setLongestStreak(activeGameData.gameStats.longestStreak);
      setGuessTimes(gameState.guessTimes);
      setFastestGuess(activeGameData.gameStats.fastestGuess);
      setLastGuessTime(gameState.lastGuessTime);
      setResumedQuestionFlagId(gameState.resumedQuestionFlagId || null);
      
      // Restore current question
      setCurrentFlag(gameState.currentFlag);
      setOptions(gameState.options);
      setFlagOptions(gameState.flagOptions || []);
      setMapOutlineOptions(gameState.mapOutlineOptions || []);
      
      // Update flagOptionsRef immediately
      if (gameState.flagOptions) {
        flagOptionsRef.current = gameState.flagOptions;
      }
      
      // Preload flag option images for country-to-flag/region-to-flag game types
      // gameState.gameType is already set correctly (regionalGameType for regional, gameType for standard)
      if ((gameState.gameType === "country-to-flag" || gameState.gameType === "region-to-flag") && gameState.flagOptions && gameState.flagOptions.length > 0) {
        // Preload images for all flag options
        console.log('Preloading flag options for continued game:', gameState.flagOptions.length);
        preloadImagesLocal(gameState.flagOptions);
      }
      
      // Restore health and time
      setHealth(gameState.health);
      if (gameState.timeAttackMode) {
        setTimeRemaining(gameState.timeRemaining);
        setTimerStarted(gameState.timerStarted);
        setFirstGuessMade(gameState.firstGuessMade);
      }
      
      // Set game as started
      setGameStarted(true);
      setGameStartTime(Date.now() - activeGameData.gameStats.timeElapsed);
      setShowEndScreen(false);
      setEndState(null);
      setMessage("");
      
      // Close modal
      setShowModal(false);
      setModalType(null);
      
      // IMPORTANT: Update refs to match the restored state
      // This ensures the refs are in sync with the state
      setTimeout(() => {
        // Update refs after state has been set
        gameModeRef.current = gameState.gameMode;
        timeAttackModeRef.current = gameState.timeAttackMode;
        regionalInfiniteModeRef.current = gameState.regionalInfiniteMode;
        infiniteModeRef.current = gameState.infiniteMode;
        
        if (gameState.gameMode === "regional") {
          regionalGameTypeRef.current = gameState.gameType;
          regionalFlagsRef.current = gameState.regionalFlags;
        } else {
          gameTypeRef.current = gameState.gameType;
          filteredFlagsRef.current = gameState.filteredFlags;
        }
        
        // Restore usedFlags AFTER refs are updated
        setUsedFlags(gameState.usedFlags);
        
        // For regional games, ensure we have the necessary data before proceeding
        if (gameState.gameMode === "regional") {
          if (!gameState.selectedRegionalCountry || !gameState.selectedDivisionTypes) {
            console.error('Missing regional game data:', {
              selectedRegionalCountry: gameState.selectedRegionalCountry,
              selectedDivisionTypes: gameState.selectedDivisionTypes
            });
            alert('Error: Missing regional game data. Starting fresh game instead.');
            clearActiveGame();
            return;
          }
        }
        
        // For infinite modes, always show the current flag that was saved
        // Infinite mode reuses flags, so the current flag should always be displayed
        if (gameState.regionalInfiniteMode || gameState.infiniteMode) {
          console.log('Infinite mode: displaying saved current flag...');
          setCurrentFlag(gameState.currentFlag);
          setLastFlagId(gameState.currentFlag.id);
        } else {
          // For non-infinite modes, handle the usedFlags logic
          // Check if the current flag is already in usedFlags
          // This happens when the game was saved after the current flag was already added to usedFlags
          if (gameState.currentFlag && gameState.usedFlags.includes(gameState.currentFlag.id)) {
            console.log('Current flag already in usedFlags, handling...');
            console.log('Non-infinite mode: using current flag without adding to usedFlags...');
            // For non-infinite modes, we need to ensure the current flag is NOT in usedFlags
            // but we also need to prevent it from being added again when answered
            // We'll set a flag to indicate this is a "resumed" question
            setResumedQuestionFlagId(gameState.currentFlag.id);
          }
          
          // If the current flag is NOT in usedFlags, it means it's the current question
          // that should be displayed (the game was saved before answering)
          if (gameState.currentFlag && !gameState.usedFlags.includes(gameState.currentFlag.id)) {
            console.log('Current flag not in usedFlags, displaying current question...');
            setCurrentFlag(gameState.currentFlag);
            setLastFlagId(gameState.currentFlag.id);
          }
        }
        
        console.log('Continued active game with updated refs:', {
          gameMode: gameModeRef.current,
          usedFlags: gameState.usedFlags,
          currentFlag: gameState.currentFlag
        });
      }, 0);
      
      console.log('Continued active game:', activeGameData);
    } catch (error) {
      console.error('Error continuing active game:', error);
      alert('Error continuing game. Starting fresh game instead.');
      // Clear the corrupted active game
      localStorage.removeItem('flagGameActiveGame');
      setHasActiveGame(false);
      setActiveGame(null);
    }
  };

  const clearActiveGame = () => {
    clearActiveGameUtil(setActiveGame, setHasActiveGame);
  };

  // Challenge Screen Component
  // ChallengeScreen is now imported from ./components/ChallengeScreen

  // Show loading spinner if main loading
  if (isLoading) {
    return (
      <div className={sharedStyles.container}>
        <div className={sharedStyles.loadingSpinner}></div>
      </div>
    );
  }

  // Show challenge loading with proper container structure to avoid layout shift
  if (showChallengeScreen && challengeLoading) {
    return (
      <div className={sharedStyles.container}>
        <div className={challengeScreenStyles.challengeScreen}>
          <div className={sharedStyles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌍</text></svg>"
        />
      </Head>
      <div className={sharedStyles.container}>
        {showChallengeScreen && (
          <ChallengeScreen
            challengeData={challengeData}
            challengeResults={challengeResults}
            hasPlayedChallenge={hasPlayedChallenge}
            regionalCountries={regionalCountries}
            isLoadingRegionalCountries={isLoadingRegionalCountries}
            regionalDivisionTypes={regionalDivisionTypes}
            setShowChallengeScreen={setShowChallengeScreen}
            setIsChallengeMode={setIsChallengeMode}
            setChallengeData={setChallengeData}
            setChallengeResults={setChallengeResults}
            setChallengePlayerName={setChallengePlayerName}
            setChallengeScoreSubmitted={setChallengeScoreSubmitted}
            setMenuStep={setMenuStep}
            setGameMode={setGameMode}
            setGameType={setGameType}
            setRegionalGameType={setRegionalGameType}
            setSelectedRegionalCountry={setSelectedRegionalCountry}
            setSelectedDivisionTypes={setSelectedDivisionTypes}
            startGame={startGame}
            playMenuClickSound={playMenuClickSound}
            setMessage={setMessage}
            showFloatingMenu={showFloatingMenu}
            setShowFloatingMenu={setShowFloatingMenu}
            setModalType={setModalType}
            setShowModal={setShowModal}
            setGamesView={setGamesView}
          />
        )}
      {!gameStarted && !showChallengeScreen && !challengeLoading && (
        <StartScreen
          gameMode={gameMode}
          menuStep={menuStep}
          progressBarHover={progressBarHover}
          gameType={gameType}
          selectedContinent={selectedContinent}
          includeTerritories={includeTerritories}
          timeAttackMode={timeAttackMode}
          infiniteMode={infiniteMode}
          typingMode={typingMode}
          flashMode={flashMode}
          outlineOnly={outlineOnly}
          regionalGameType={regionalGameType}
          regionalInfiniteMode={regionalInfiniteMode}
          regionalTypingMode={regionalTypingMode}
          regionalFlashMode={regionalFlashMode}
          selectedRegionalCountry={selectedRegionalCountry}
          selectedDivisionTypes={selectedDivisionTypes}
          isLoadingFeaturedCountries={isLoadingFeaturedCountries}
          featuredCountries={featuredCountries}
          isLoadingRegionalCountries={isLoadingRegionalCountries}
          regionalDivisionTypes={regionalDivisionTypes}
          showFloatingMenu={showFloatingMenu}
          setProgressBarHover={setProgressBarHover}
          setGameMode={setGameMode}
          setMenuStep={setMenuStep}
          setGameType={setGameType}
          setSelectedContinent={setSelectedContinent}
          setIncludeTerritories={setIncludeTerritories}
          setTimeAttackMode={setTimeAttackMode}
          setInfiniteMode={setInfiniteMode}
          setTypingMode={setTypingMode}
          setFlashMode={setFlashMode}
          setOutlineOnly={setOutlineOnly}
          setRegionalGameType={setRegionalGameType}
          setRegionalInfiniteMode={setRegionalInfiniteMode}
          setRegionalTypingMode={setRegionalTypingMode}
          setRegionalFlashMode={setRegionalFlashMode}
          setSelectedRegionalCountry={setSelectedRegionalCountry}
          setSelectedDivisionTypes={setSelectedDivisionTypes}
          setShowAllCountriesModal={setShowAllCountriesModal}
          setShowFloatingMenu={setShowFloatingMenu}
          setModalType={setModalType}
          setShowModal={setShowModal}
          setGamesView={setGamesView}
          gameHistory={gameHistory}
          bestScores={bestScores}
          hasActiveGame={hasActiveGame}
          activeGame={activeGame}
          gamesModalLastOpened={gamesModalLastOpened}
          getProgressSteps={getProgressSteps}
          getCurrentStepIndex={getCurrentStepIndex}
          getCompletedSteps={getCompletedSteps}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          handleProgressStepClick={handleProgressStepClick}
          playMenuClickSound={playMenuClickSound}
          startGame={startGame}
          handleRandomize={handleRandomize}
        />
      )}
  
      {gameStarted && (
        <GameScreen
          score={score}
          scoreAnimation={scoreAnimation}
          timeAttackMode={timeAttackMode}
          timeRemaining={timeRemaining}
          health={health}
          infiniteMode={infiniteMode}
          regionalInfiniteMode={regionalInfiniteMode}
          currentFlag={currentFlag}
          flagTransitioning={flagTransitioning}
          isFlagLoading={isFlagLoading}
          lastFlagId={lastFlagId}
          gameType={gameType}
          regionalGameType={regionalGameType}
          gameMode={gameMode}
          typingMode={typingMode}
          regionalTypingMode={regionalTypingMode}
          flashMode={flashMode}
          regionalFlashMode={regionalFlashMode}
          options={options}
          flagOptions={flagOptions}
          mapOutlineOptions={mapOutlineOptions}
          optionsTransitioning={optionsTransitioning}
          outlineOnly={outlineOnly}
          typedAnswer={typedAnswer}
          setTypedAnswer={setTypedAnswer}
          typingInputStyle={typingInputStyle}
          buttonsDisabled={buttonsDisabled}
          buttonStyles={buttonStyles}
          message={message}
          messageTransitioning={messageTransitioning}
          allFlagsWithOutlines={filterFlagsWithOutlines(filteredFlags)}
          typingInputRef={typingInputRef}
          imageCache={imageCache}
          handleFlagLoad={handleFlagLoad}
          handleFlagError={handleFlagError}
          checkAnswer={checkAnswer}
          endInfiniteMode={endInfiniteMode}
          playMenuClickSound={playMenuClickSound}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
        />
      )}
  
      <EndScreen
        showEndScreen={showEndScreen}
        endState={endState}
        gameStats={gameStats}
        gameStateSnapshot={gameStateSnapshot}
        gameMode={gameMode}
        regionalInfiniteMode={regionalInfiniteMode}
        infiniteMode={infiniteMode}
        isChallengeMode={isChallengeMode}
        challengeData={challengeData}
        setShowEndScreen={setShowEndScreen}
        setShowChallengeScreen={setShowChallengeScreen}
        setChallengeResults={setChallengeResults}
        setHasPlayedChallenge={setHasPlayedChallenge}
        setIsChallengeMode={setIsChallengeMode}
        setChallengeData={setChallengeData}
        setChallengePlayerName={setChallengePlayerName}
        setChallengeScoreSubmitted={setChallengeScoreSubmitted}
        setGameStarted={setGameStarted}
        setMenuStep={setMenuStep}
        setGameMode={setGameMode}
        setGameType={setGameType}
        setRegionalGameType={setRegionalGameType}
        setSelectedRegionalCountry={setSelectedRegionalCountry}
        setSelectedDivisionTypes={setSelectedDivisionTypes}
        setGameStats={setGameStats}
        setEndState={setEndState}
        setTimeAttackMode={setTimeAttackMode}
        setRegionalInfiniteMode={setRegionalInfiniteMode}
        setInfiniteMode={setInfiniteMode}
        setRegionalFlags={setRegionalFlags}
        setFilteredRegionalFlags={setFilteredRegionalFlags}
        setSelectedContinent={setSelectedContinent}
        setIncludeTerritories={setIncludeTerritories}
        setFilteredFlags={setFilteredFlags}
        setMessage={setMessage}
        handleShareChallenge={handleShareChallenge}
        startGame={startGame}
        playMenuClickSound={playMenuClickSound}
      />

      {/* Modal Overlay */}
      {showModal && (
        <>
          {modalType === 'feedback' && (
            <FeedbackModal 
              isOpen={showModal}
              onClose={() => {
                setShowModal(false);
                setModalType(null);
              }}
              currentFlag={currentFlag}
              gameContext={{
                gameMode,
                gameType: gameMode === "regional" ? regionalGameType : gameType,
                selectedContinent,
                includeTerritories,
                timeAttackMode,
                infiniteMode,
                regionalInfiniteMode
              }}
            />
          )}
          {modalType === 'help' && <HelpModal setShowModal={setShowModal} />}
          {modalType === 'games' && (
            <GamesModal
              setShowModal={setShowModal}
              gamesView={gamesView}
              setGamesView={setGamesView}
              hasActiveGame={hasActiveGame}
              activeGame={activeGame}
              gameHistory={gameHistory}
              bestScores={bestScores}
              regionalDivisionTypes={regionalDivisionTypes}
              regionalCountries={regionalCountries}
              clearActiveGame={clearActiveGame}
              continueActiveGame={continueActiveGame}
              playMenuClickSound={playMenuClickSound}
              setModalType={setModalType}
              setGamesModalLastOpened={setGamesModalLastOpened}
            />
          )}
          {modalType === 'challenges' && <ChallengesModal setShowModal={setShowModal} setMessage={setMessage} />}
        </>
      )}

      {/* Browse All Countries Modal */}
      {showAllCountriesModal && (
        <BrowseAllCountriesModal
          showAllCountriesModal={showAllCountriesModal}
          setShowAllCountriesModal={setShowAllCountriesModal}
          isLoadingRegionalCountries={isLoadingRegionalCountries}
          regionalCountries={regionalCountries}
          regionalDivisionTypes={regionalDivisionTypes}
          setSelectedRegionalCountry={setSelectedRegionalCountry}
          setSelectedDivisionTypes={setSelectedDivisionTypes}
          setMenuStep={setMenuStep}
          playMenuClickSound={playMenuClickSound}
        />
      )}
      

      </div>
    </>
  );
};

export default Site1;

