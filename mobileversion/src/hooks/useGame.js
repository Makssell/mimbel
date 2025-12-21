import { useState, useEffect, useRef, useCallback } from 'react';
import { Image } from 'react-native';
import flagLoader from '../services/flagLoader';

/**
 * Custom hook that extracts and manages all game logic from site1.js
 * This makes the game logic reusable and testable
 */
export const useGame = (gameSettings, onGameEnd) => {
  // Core game state
  const [flags, setFlags] = useState([]);
  const [filteredFlags, setFilteredFlags] = useState([]);
  const [currentFlag, setCurrentFlag] = useState(null);
  const [options, setOptions] = useState([]);
  const [flagOptions, setFlagOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [message, setMessage] = useState('');
  const [usedFlags, setUsedFlags] = useState([]);
  const [isFlagLoading, setIsFlagLoading] = useState(false);
  const [flagOptionsReady, setFlagOptionsReady] = useState(false);
  const [buttonStyles, setButtonStyles] = useState({});
  const [typingInputStyle, setTypingInputStyle] = useState(null);
  
  // Game statistics
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [guessTimes, setGuessTimes] = useState([]);
  const [fastestGuess, setFastestGuess] = useState(null);
  const [lastGuessTime, setLastGuessTime] = useState(null);
  
  // Time Attack mode
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [timerStarted, setTimerStarted] = useState(false);
  const [firstGuessMade, setFirstGuessMade] = useState(false);
  
  // Typing mode
  const [typedAnswer, setTypedAnswer] = useState('');
  
  // Refs for stable values
  const scoreRef = useRef(0);
  const healthRef = useRef(3);
  const gameStartedRef = useRef(false);
  const flagsRef = useRef([]);
  const usedFlagsRef = useRef([]);
  const timeRemainingRef = useRef(60);
  const currentFlagRef = useRef(null);
  const lastFlagIdRef = useRef(null);
  const timerRef = useRef(null);
  const lastGuessTimeRef = useRef(null);

  // Update refs when state changes
  useEffect(() => {
    scoreRef.current = score;
    healthRef.current = health;
    gameStartedRef.current = gameStarted;
    flagsRef.current = flags;
    usedFlagsRef.current = usedFlags;
    timeRemainingRef.current = timeRemaining;
    currentFlagRef.current = currentFlag;
    lastGuessTimeRef.current = lastGuessTime;
  }, [score, health, gameStarted, flags, usedFlags, timeRemaining, currentFlag, lastGuessTime]);

  // Load flags based on game settings
  const loadGameFlags = useCallback(async () => {
    try {
      const loadedFlags = await flagLoader.loadFlags({
        gameMode: gameSettings?.gameMode || 'standard',
        selectedContinent: gameSettings?.selectedContinent || 'world',
        includeTerritories: gameSettings?.includeTerritories || false,
        selectedCountryId: gameSettings?.selectedCountryId || null,
        selectedDivisionTypes: gameSettings?.selectedDivisionTypes || [],
      });

      if (loadedFlags && loadedFlags.length > 0) {
        setFlags(loadedFlags);
        setFilteredFlags(loadedFlags);
        flagsRef.current = loadedFlags;
        setMessage('');
      } else {
        setMessage('No flags available for selected settings.');
      }
      return loadedFlags || [];
    } catch (error) {
      console.error('Error loading flags:', error);
      setMessage('Error loading flags. Please try again.');
      return [];
    }
  }, [gameSettings]);

  // Initialize flags when settings change (only if not already loaded)
  useEffect(() => {
    if (gameSettings && flags.length === 0) {
      loadGameFlags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSettings]);

  // Time Attack timer
  useEffect(() => {
    if (gameSettings?.timeAttackMode && timerStarted && gameStarted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            endTimeAttackGame();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameSettings?.timeAttackMode, timerStarted, gameStarted]);

  // Update streak tracking
  const updateStreak = useCallback((isCorrect) => {
    if (isCorrect) {
      setCurrentStreak(prev => {
        const newStreak = prev + 1;
        setLongestStreak(prevLongest => Math.max(prevLongest, newStreak));
        return newStreak;
      });
    } else {
      setCurrentStreak(0);
    }
  }, []);

  // Record guess time
  const recordGuessTime = useCallback((isCorrect) => {
    if (isCorrect && lastGuessTimeRef.current) {
      const timeTaken = (Date.now() - lastGuessTimeRef.current) / 1000; // in seconds
      setGuessTimes(prev => [...prev, timeTaken]);
      
      setFastestGuess(prev => {
        if (!prev || timeTaken < prev) {
          return timeTaken;
        }
        return prev;
      });
    }
    setLastGuessTime(Date.now());
  }, []);

  // Calculate average time per guess
  const calculateAverageTime = useCallback(() => {
    if (guessTimes.length === 0) return 0;
    const sum = guessTimes.reduce((a, b) => a + b, 0);
    return (sum / guessTimes.length).toFixed(2);
  }, [guessTimes]);

  // Load next question
  const loadNextQuestion = useCallback(() => {
    if (!gameStartedRef.current || flagsRef.current.length === 0) return;

    const isInfiniteMode = gameSettings?.infiniteMode || false;
    const availableFlags = isInfiniteMode
      ? flagsRef.current
      : flagsRef.current.filter(flag => !usedFlagsRef.current.includes(flag.id));

    if (availableFlags.length === 0 && !isInfiniteMode) {
      // Game complete - all flags answered
      endGame('allCompleted');
      return;
    }

    // Pick random flag
    const randomIndex = Math.floor(Math.random() * availableFlags.length);
    const flag = availableFlags[randomIndex];
    
    if (!flag) return;

    setCurrentFlag(flag);
    currentFlagRef.current = flag;
    lastFlagIdRef.current = flag.id;
    setLastGuessTime(Date.now()); // Set time for next guess

    // Generate options based on game type
    const gameType = gameSettings?.gameType || 'flag-to-country';
    
    if (gameType === 'flag-to-country' || gameType === 'flag-to-region') {
      // Show flag, guess name
      setIsFlagLoading(true); // Only show loading for main flag image
      const correctName = flag.name;
      const wrongAnswers = flagsRef.current
        .filter(f => f.id !== flag.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(f => f.name);
      
      const allNames = [correctName, ...wrongAnswers];
      setOptions(allNames.sort(() => Math.random() - 0.5));
      setFlagOptions([]);
      
      // Clear flag loading after a short delay (image will load)
      setTimeout(() => {
        setIsFlagLoading(false);
      }, 300);
    } else {
      // Show name, guess flag (country-to-flag or region-to-flag)
      // Preload all 4 flag images so they appear simultaneously
      setIsFlagLoading(false);
      setFlagOptionsReady(false); // Hide options until all images are preloaded
      const correctFlag = flag;
      const wrongFlags = flagsRef.current
        .filter(f => f.id !== flag.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allFlags = [correctFlag, ...wrongFlags];
      const shuffledFlags = allFlags.sort(() => Math.random() - 0.5);
      
      // Preload all flag images before showing them
      Promise.all(
        shuffledFlags.map(flagOption => 
          Image.prefetch(flagOption.image_url).catch(err => {
            console.warn(`Failed to prefetch image: ${flagOption.image_url}`, err);
            return null; // Continue even if one fails
          })
        )
      ).then(() => {
        // All images are preloaded, now show them all at once
        setFlagOptions(shuffledFlags);
        setFlagOptionsReady(true);
      }).catch(err => {
        console.error('Error preloading flag images:', err);
        // Still show options even if prefetch fails
        setFlagOptions(shuffledFlags);
        setFlagOptionsReady(true);
      });
      
      setOptions([]);
    }

    // Add to used flags if not infinite mode
    if (!isInfiniteMode) {
      setUsedFlags(prev => [...prev, flag.id]);
    }
  }, [gameSettings, endGame]);

  // Check answer
  const checkAnswer = useCallback((selectedAnswer) => {
    if (buttonsDisabled || !currentFlagRef.current || !gameStartedRef.current) return;

    setTotalAttempts(prev => prev + 1);
    setButtonsDisabled(true);

    // Start timer on first guess in Time Attack mode
    if (gameSettings?.timeAttackMode && !firstGuessMade) {
      setFirstGuessMade(true);
      setTimerStarted(true);
    }

    const gameType = gameSettings?.gameType || 'flag-to-country';
    const isTypingMode = gameSettings?.typingMode || false;
    let isCorrect = false;

    if (gameType === 'flag-to-country' || gameType === 'flag-to-region') {
      if (isTypingMode) {
        const normalizedAnswer = selectedAnswer.trim().toLowerCase().replace(/\s+/g, '');
        const normalizedCorrect = currentFlagRef.current.name.toLowerCase().replace(/\s+/g, '');
        isCorrect = normalizedAnswer === normalizedCorrect;
      } else {
        isCorrect = selectedAnswer === currentFlagRef.current.name;
      }
    } else {
      // country-to-flag or region-to-flag - selectedAnswer is flag ID
      isCorrect = Number(selectedAnswer) === currentFlagRef.current.id;
    }

    if (isCorrect) {
      // Correct answer
      updateStreak(true);
      recordGuessTime(true);
      
      const newScore = scoreRef.current + 1;
      setScore(newScore);
      setMessage('Correct!');
      setTypedAnswer(''); // Clear typing input
      
      // Apply correct styling
      if (isTypingMode) {
        setTypingInputStyle('correct');
      } else {
        setButtonStyles({ [selectedAnswer]: 'correct' });
      }
      
      setTimeout(() => {
        setMessage('');
        setButtonStyles({});
        setTypingInputStyle(null);
        loadNextQuestion();
        setButtonsDisabled(false);
      }, 1000);
    } else {
      // Incorrect answer
      updateStreak(false);
      recordGuessTime(false);

      // Apply incorrect styling
      if (isTypingMode) {
        setTypingInputStyle('incorrect');
      } else {
        setButtonStyles({ [selectedAnswer]: 'incorrect' });
      }

      if (gameSettings?.timeAttackMode) {
        // Time Attack: deduct 5 seconds
        const newTime = Math.max(0, timeRemainingRef.current - 5);
        setTimeRemaining(newTime);
        setTypedAnswer(''); // Clear typing input
        
        if (newTime === 0) {
          setTimeout(() => {
            setButtonStyles({});
            setTypingInputStyle(null);
            endTimeAttackGame();
          }, 1000);
        } else {
          setMessage('Incorrect! -5 seconds');
          setTimeout(() => {
            setMessage('');
            setButtonStyles({});
            setTypingInputStyle(null);
            setButtonsDisabled(false);
          }, 1000);
        }
      } else {
        // Standard mode: use health system
        if (healthRef.current > 1) {
          setHealth(prev => prev - 1);
          setMessage('Incorrect! Try again.');
          setTypedAnswer(''); // Clear typing input
          setTimeout(() => {
            setMessage('');
            setButtonStyles({});
            setTypingInputStyle(null);
            setButtonsDisabled(false);
          }, 1000);
        } else {
          // Game Over
          setHealth(0);
          setTimeout(() => {
            setButtonStyles({});
            setTypingInputStyle(null);
            endGame('ranOutOfHearts');
          }, 1000);
        }
      }
    }
  }, [buttonsDisabled, gameSettings, updateStreak, recordGuessTime, loadNextQuestion, firstGuessMade, endTimeAttackGame, endGame]);

  // End game handlers
  const endGame = useCallback((endState) => {
    setGameStarted(false);
    
    const gameEndTime = Date.now();
    const timeElapsed = gameStartTime ? gameEndTime - gameStartTime : 0;
    const finalScore = scoreRef.current;
    const finalAttempts = totalAttempts;
    const accuracy = finalAttempts > 0 ? ((finalScore / finalAttempts) * 100).toFixed(1) : 0;

    // Build game settings for display
    const isRegionalMode = gameSettings?.gameMode === 'regional';
    const displayGameSettings = {
      gameMode: isRegionalMode ? 'Regional Flags' : 'Country Flags',
      gameType: (gameSettings?.gameType === 'flag-to-country' ? 'Flag → Country' :
                gameSettings?.gameType === 'country-to-flag' ? 'Country → Flag' :
                gameSettings?.gameType === 'flag-to-region' ? 'Flag → Region' :
                gameSettings?.gameType === 'region-to-flag' ? 'Region → Flag' : 'Unknown'),
      region: !isRegionalMode ? (
        gameSettings?.selectedContinent === 'world' ? 'World' :
        gameSettings?.selectedContinent === '1' ? 'Africa' :
        gameSettings?.selectedContinent === '2' ? 'Asia' :
        gameSettings?.selectedContinent === '3' ? 'Europe' :
        gameSettings?.selectedContinent === '4' ? 'North America' :
        gameSettings?.selectedContinent === '5' ? 'South America' :
        gameSettings?.selectedContinent === '6' ? 'Oceania' : 'Unknown'
      ) : null,
      territories: !isRegionalMode ? (gameSettings?.includeTerritories ? 'Included' : 'Excluded') : null,
      mode: gameSettings?.timeAttackMode ? 'Time Attack' : (gameSettings?.infiniteMode ? 'Infinite' : 'Standard'),
    };

    const gameStats = {
      score: finalScore,
      totalAttempts: finalAttempts,
      accuracy: parseFloat(accuracy),
      timeElapsed,
      endState,
      gameType: gameSettings?.gameType || 'flag-to-country',
      gameSettings: displayGameSettings,
      totalFlags: flagsRef.current.length,
      remainingFlags: flagsRef.current.length - usedFlagsRef.current.length,
      longestStreak,
      averageTimePerGuess: calculateAverageTime(),
      fastestGuess: fastestGuess ? parseFloat(fastestGuess) : null,
      completionTime: timeElapsed,
    };

    if (onGameEnd) {
      onGameEnd(gameStats);
    }
  }, [gameStartTime, gameSettings, longestStreak, calculateAverageTime, fastestGuess, onGameEnd]);

  const endTimeAttackGame = useCallback(() => {
    endGame('timeAttack');
  }, [endGame]);

  const endInfiniteMode = useCallback(() => {
    endGame('infiniteMode');
  }, [endGame]);

  // Start game
  const startGame = useCallback(() => {
    if (flags.length === 0) {
      setMessage('No flags available. Please check your settings.');
      return;
    }

    setGameStarted(true);
    setScore(0);
    setHealth(3);
    setUsedFlags([]);
    setTotalAttempts(0);
    setMessage('');
    setGameStartTime(Date.now());
    setLongestStreak(0);
    setCurrentStreak(0);
    setGuessTimes([]);
    setFastestGuess(null);
    setLastGuessTime(Date.now());
    setTimeRemaining(60);
    setTimerStarted(false);
    setFirstGuessMade(false);
    setFlagOptionsReady(false);
    
    // Update refs immediately before calling loadNextQuestion
    // to ensure they're available synchronously
    gameStartedRef.current = true;
    scoreRef.current = 0;
    healthRef.current = 3;
    usedFlagsRef.current = [];
    timeRemainingRef.current = 60;
    lastGuessTimeRef.current = Date.now();
    flagsRef.current = flags; // Ensure flags ref is up to date
    
    loadNextQuestion();
  }, [flags, loadNextQuestion]);

  return {
    // Game state
    flags,
    currentFlag,
    options,
    flagOptions,
    score,
    health,
    gameStarted,
    buttonsDisabled,
    message,
    usedFlags,
    isFlagLoading,
    
    // Statistics
    totalAttempts,
    gameStartTime,
    longestStreak,
    currentStreak,
    timeRemaining,
    timerStarted,
    
    // Typing mode
    typedAnswer,
    setTypedAnswer,
    
    // Visual feedback
    buttonStyles,
    typingInputStyle,
    
    // Actions
    startGame,
    checkAnswer,
    loadNextQuestion,
    loadGameFlags,
    
    // Flag options ready state
    flagOptionsReady,
  };
};
