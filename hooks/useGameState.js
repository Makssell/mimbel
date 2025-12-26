/**
 * useGameState Hook
 * Manages all game state variables and refs
 */

import { useState, useRef } from "react";

export const useGameState = () => {
  // Check for challenge code immediately to prevent main menu from showing
  const hasChallengeCode = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('challenge') !== null
    : false;

  // Core game state
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

  // End screen state
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [endState, setEndState] = useState(null);
  const [gameStats, setGameStats] = useState({});
  const [gameStateSnapshot, setGameStateSnapshot] = useState({});
  
  // Challenge state
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [challengeSettings, setChallengeSettings] = useState(null);
  const [showChallengeScreen, setShowChallengeScreen] = useState(hasChallengeCode);
  
  // Statistics tracking
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [guessTimes, setGuessTimes] = useState([]);
  const [fastestGuess, setFastestGuess] = useState(null);
  const [lastGuessTime, setLastGuessTime] = useState(null);

  // Time Attack mode state
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [timerStarted, setTimerStarted] = useState(false);
  const [firstGuessMade, setFirstGuessMade] = useState(false);
  const timerRef = useRef(null);

  // Menu flow state
  const [menuStep, setMenuStep] = useState(0);
  const [gameType, setGameType] = useState(null);
  const [gameMode, setGameMode] = useState("standard");
  const [regionalGameType, setRegionalGameType] = useState(null);
  
  // Regional mode state
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
  
  // Progress bar state
  const [progressBarHover, setProgressBarHover] = useState(false);

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [flagTransitioning, setFlagTransitioning] = useState(false);
  const [optionsTransitioning, setOptionsTransitioning] = useState(false);
  const [messageTransitioning, setMessageTransitioning] = useState(false);

  // Audio state
  const audioContextRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Floating menu state
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  // Game history state
  const [gameHistory, setGameHistory] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [gamesView, setGamesView] = useState('history');
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  // Active game state
  const [activeGame, setActiveGame] = useState(null);
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [resumedQuestionFlagId, setResumedQuestionFlagId] = useState(null);

  // Challenge-related state (loaded from API)
  const [challengeData, setChallengeData] = useState(null);
  const [challengeResults, setChallengeResults] = useState([]);
  const [challengeLoading, setChallengeLoading] = useState(hasChallengeCode);
  const [challengePlayerName, setChallengePlayerName] = useState('');
  const [challengeScoreSubmitted, setChallengeScoreSubmitted] = useState(false);
  const [hasPlayedChallenge, setHasPlayedChallenge] = useState(false);

  // Refs to track current state values for keyboard handler and other uses
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

  // Performance refs
  const currentGameFlagsRef = useRef([]);
  const currentScoreRef = useRef(0);
  const imageCache = useRef(new Map());
  const loadingFlags = useRef(new Set());
  const updateTimeoutRef = useRef(null);

  return {
    // Core game state
    flags, setFlags,
    filteredFlags, setFilteredFlags,
    currentFlag, setCurrentFlag,
    options, setOptions,
    message, setMessage,
    score, setScore,
    health, setHealth,
    gameStarted, setGameStarted,
    buttonsDisabled, setButtonsDisabled,
    buttonStyles, setButtonStyles,
    typingInputStyle, setTypingInputStyle,
    isLoading, setIsLoading,
    selectedContinent, setSelectedContinent,
    includeTerritories, setIncludeTerritories,
    infiniteMode, setInfiniteMode,
    timeAttackMode, setTimeAttackMode,
    typingMode, setTypingMode,
    regionalTypingMode, setRegionalTypingMode,
    flashMode, setFlashMode,
    regionalFlashMode, setRegionalFlashMode,
    typedAnswer, setTypedAnswer,
    typingInputRef,
    usedFlags, setUsedFlags,
    isFlagLoading, setIsFlagLoading,
    flagLoadingTimeout, setFlagLoadingTimeout,
    lastFlagId, setLastFlagId,
    startScreenStep, setStartScreenStep,
    scoreAnimation, setScoreAnimation,
    flagOptions, setFlagOptions,

    // End screen state
    showEndScreen, setShowEndScreen,
    gameStartTime, setGameStartTime,
    totalAttempts, setTotalAttempts,
    endState, setEndState,
    gameStats, setGameStats,
    gameStateSnapshot, setGameStateSnapshot,
    
    // Challenge state
    isChallengeMode, setIsChallengeMode,
    challengeSettings, setChallengeSettings,
    showChallengeScreen, setShowChallengeScreen,
    hasChallengeCode,
    challengeData, setChallengeData,
    challengeResults, setChallengeResults,
    challengeLoading, setChallengeLoading,
    challengePlayerName, setChallengePlayerName,
    challengeScoreSubmitted, setChallengeScoreSubmitted,
    hasPlayedChallenge, setHasPlayedChallenge,
    
    // Statistics
    longestStreak, setLongestStreak,
    currentStreak, setCurrentStreak,
    guessTimes, setGuessTimes,
    fastestGuess, setFastestGuess,
    lastGuessTime, setLastGuessTime,

    // Time Attack
    timeRemaining, setTimeRemaining,
    timerStarted, setTimerStarted,
    firstGuessMade, setFirstGuessMade,
    timerRef,

    // Menu flow
    menuStep, setMenuStep,
    gameType, setGameType,
    gameMode, setGameMode,
    regionalGameType, setRegionalGameType,
    
    // Regional mode
    regionalCountries, setRegionalCountries,
    selectedRegionalCountry, setSelectedRegionalCountry,
    isLoadingRegionalCountries, setIsLoadingRegionalCountries,
    regionalDivisionTypes, setRegionalDivisionTypes,
    selectedDivisionTypes, setSelectedDivisionTypes,
    regionalInfiniteMode, setRegionalInfiniteMode,
    regionalFlags, setRegionalFlags,
    filteredRegionalFlags, setFilteredRegionalFlags,
    isLoadingRegionalFlags, setIsLoadingRegionalFlags,
    
    // Featured countries
    featuredCountries, setFeaturedCountries,
    showAllCountriesModal, setShowAllCountriesModal,
    isLoadingFeaturedCountries, setIsLoadingFeaturedCountries,
    
    // Progress bar
    progressBarHover, setProgressBarHover,

    // Transitions
    isTransitioning, setIsTransitioning,
    flagTransitioning, setFlagTransitioning,
    optionsTransitioning, setOptionsTransitioning,
    messageTransitioning, setMessageTransitioning,

    // Audio
    audioContextRef,
    audioEnabled, setAudioEnabled,

    // Floating menu
    showFloatingMenu, setShowFloatingMenu,
    showModal, setShowModal,
    modalType, setModalType,

    // Game history
    gameHistory, setGameHistory,
    bestScores, setBestScores,
    gamesView, setGamesView,
    isLoadingGames, setIsLoadingGames,

    // Active game
    activeGame, setActiveGame,
    hasActiveGame, setHasActiveGame,
    resumedQuestionFlagId, setResumedQuestionFlagId,

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
    currentGameFlagsRef,
    currentScoreRef,
    imageCache,
    loadingFlags,
    updateTimeoutRef
  };
};
