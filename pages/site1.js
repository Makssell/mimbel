import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/site1.module.css";
import MenuButton from "../components/MenuButton";
import ActionButton from "../components/ActionButton";
import GameButton from "../components/GameButton";
import ContinentButton from "../components/ContinentButton";
import FeedbackModal from "../components/FeedbackModal";

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContinent, setSelectedContinent] = useState("world");
  const [includeTerritories, setIncludeTerritories] = useState(false);
  const [infiniteMode, setInfiniteMode] = useState(false);
  const [timeAttackMode, setTimeAttackMode] = useState(false);
  const [usedFlags, setUsedFlags] = useState([]);
  const [isFlagLoading, setIsFlagLoading] = useState(true);
  const [flagLoadingTimeout, setFlagLoadingTimeout] = useState(null);
  const [lastFlagId, setLastFlagId] = useState(null);
  const [startScreenStep, setStartScreenStep] = useState(1);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [flagOptions, setFlagOptions] = useState([]);

  // New state variables for end screen
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [endState, setEndState] = useState(null);
  const [gameStats, setGameStats] = useState({});

  // Game state snapshot for end screen (to avoid state changes affecting display)
  const [gameStateSnapshot, setGameStateSnapshot] = useState({});
  
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
  const [modalType, setModalType] = useState(null); // 'feedback', 'help', 'settings'

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
      const floatingMenu = document.querySelector(`.${styles.floatingMenuContainer}`);
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

  // Sound generation functions with mystical characteristics
  const playTone = (frequency, duration = 200, type = 'sine', volume = 0.15, reverb = false) => {
    if (!audioEnabled || !audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      const filter = audioContextRef.current.createBiquadFilter();
      
      // Create a slight detune effect for mystical feel
      const detune = (Math.random() - 0.5) * 10; // ±5 cents
      const detunedFreq = frequency * Math.pow(2, detune / 1200);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(detunedFreq, audioContextRef.current.currentTime);
      oscillator.type = type;
      
      // Apply gentle lowpass filter for mystical darkness
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, audioContextRef.current.currentTime);
      filter.Q.setValueAtTime(0.5, audioContextRef.current.currentTime);
      
      // Fade in and out for smooth sound
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration / 1000);
      
      // Add reverb effect if requested
      if (reverb) {
        const delay = audioContextRef.current.createDelay();
        const feedback = audioContextRef.current.createGain();
        
        delay.delayTime.setValueAtTime(0.1, audioContextRef.current.currentTime);
        feedback.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        
        gainNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(audioContextRef.current.destination);
      }
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  };

  // 1. Menu Interaction (hover/select) - Very short soft chime
  const playMenuClickSound = () => {
    // D#5 (~622 Hz) sine wave, 100ms, with gentle fade out
    playTone(622, 100, 'sine', 0.08, true);
  };

  // 2. Correct Guess - Soft two-note upward interval A4 → C5
  const playCorrectSound = () => {
    // A4 (440 Hz) → C5 (523 Hz), each 150ms, legato
    playTone(440, 150, 'triangle', 0.12, true);
    setTimeout(() => {
      playTone(523, 150, 'triangle', 0.12, true);
    }, 150);
  };

  // 3. Wrong Guess - Quick minor downward interval C5 → G#4
  const playIncorrectSound = () => {
    // C5 (523 Hz) → G#4 (415 Hz), ~150ms each, with soft dark filter
    playTone(523, 150, 'triangle', 0.1, true);
    setTimeout(() => {
      playTone(415, 150, 'triangle', 0.1, true);
    }, 150);
  };

  // 4. Losing All Hearts - Low gentle 3-note descending motif
  const playGameOverSound = () => {
    // A4 → F#4 → D4 (440 → 370 → 294 Hz), 250ms per note with reverb
    playTone(440, 250, 'sine', 0.15, true);
    setTimeout(() => {
      playTone(370, 250, 'sine', 0.15, true);
    }, 250);
    setTimeout(() => {
      playTone(294, 250, 'sine', 0.15, true);
    }, 500);
  };

  // 5. Finishing All Flags (Victory) - Soft arpeggiated upward minor 7 chord
  const playVictorySound = () => {
    // A4 → C5 → E5 → G5, each ~200ms with shimmering reverb
    const frequencies = [440, 523, 659, 784];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 200, 'triangle', 0.12, true);
      }, index * 200);
    });
  };

  const playMenuHoverSound = () => {
    // Subtle hover sound - even softer than click
    playTone(622, 50, 'sine', 0.04, true);
  };

  const playGameStartSound = () => {
    // Gentle ascending sequence for game start
    playTone(440, 150, 'triangle', 0.12, true);
    setTimeout(() => playTone(523, 150, 'triangle', 0.12, true), 150);
    setTimeout(() => playTone(659, 200, 'triangle', 0.12, true), 300);
  };

  const playTimeWarningSound = () => {
    // Gentle warning beep for low time
    playTone(523, 100, 'triangle', 0.1, true);
  };

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

  // Progress Bar Component
  const ProgressBar = () => {
    const steps = getProgressSteps();
    const currentIndex = getCurrentStepIndex();
    const completedSteps = getCompletedSteps();

    return (
      <div 
        className={styles.progressBarContainer}
        onMouseEnter={() => setProgressBarHover(true)}
        onMouseLeave={() => setProgressBarHover(false)}
      >
        {/* Left Arrow (Desktop only) */}
        {progressBarHover && canGoBack() && (
          <button
            className={styles.progressArrow}
            onClick={goToPreviousStep}
            aria-label="Go to previous step"
          >
            ←
          </button>
        )}
        
        {/* Progress Steps */}
        <div className={styles.progressSteps}>
          {steps.map((step, index) => {
            const isCurrent = step.id === menuStep;
            const isCompleted = completedSteps.includes(step.id);
            const isFuture = index > currentIndex;
            const isTappable = index <= currentIndex; // Can tap current and completed steps
            
            return (
              <div key={step.id} className={styles.progressStepWrapper}>
                <div
                  className={`${styles.progressStep} ${
                    isCurrent ? styles.currentStep :
                    isCompleted ? styles.completedStep :
                    styles.futureStep
                  } ${isTappable ? styles.tappableStep : ''}`}
                  onClick={isTappable ? () => handleProgressStepClick(step.id) : undefined}
                  role={isTappable ? "button" : undefined}
                  tabIndex={isTappable ? 0 : undefined}
                  aria-label={isTappable ? `Go to ${step.name} step` : undefined}
                />
                {index < steps.length - 1 && (
                  <div className={`${styles.progressLine} ${
                    isCompleted ? styles.completedLine : styles.futureLine
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Right Arrow (Desktop only) */}
        {progressBarHover && canGoForward() && (
          <button
            className={styles.progressArrow}
            onClick={goToNextStep}
            aria-label="Go to next step"
          >
            →
          </button>
        )}
      </div>
    );
  };

  // Floating Menu Component
  const FloatingMenu = () => {
    const handleFeedback = () => {
      console.log('Feedback clicked');
      playMenuClickSound();
      setModalType('feedback');
      setShowModal(true);
    };

    const handleHelp = () => {
      console.log('Help clicked');
      playMenuClickSound();
      setModalType('help');
      setShowModal(true);
    };

    return (
      <div className={styles.floatingMenuContainer}>
        {/* Main floating button */}
        <button
          className={styles.floatingMenuButton}
          onClick={() => {
            playMenuClickSound();
            setShowFloatingMenu(!showFloatingMenu);
          }}
          aria-label="Open menu"
          title="Menu"
        >
          🌍
        </button>
        
        {/* Dropdown menu */}
        {showFloatingMenu && (
          <div className={styles.floatingMenuDropdown}>
            <button
              className={styles.floatingMenuItem}
              onClick={handleFeedback}
              aria-label="Send feedback"
            >
              💬 Feedback
            </button>
            <button
              className={styles.floatingMenuItem}
              onClick={handleHelp}
              aria-label="Get help"
            >
              ❓ Help
            </button>
          </div>
        )}
      </div>
    );
  };

  // Modal Components

  const HelpModal = () => {
    return (
      <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>❓ Help & How to Play</h2>
            <button
              className={styles.closeButton}
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          <form className={styles.modalForm}>
            <div className={styles.helpSection}>
              <h3>🎮 Controls & Navigation</h3>
              <div className={styles.helpItem}>
                <strong>Mouse:</strong> Click on your answer
              </div>
              <div className={styles.helpItem}>
                <strong>Keyboard:</strong> Press 1, 2, 3, or 4 to select answers
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={`${styles.button} ${styles.mainButton}`}
                onClick={() => setShowModal(false)}
              >
                Ok
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };



  // Simple direct Supabase query for global flags (Site4 style)
  const fetchGlobalFlags = async (continent = "world", includeTerritories = false) => {
    try {
      let query = supabase
        .from("flags")
        .select(`
          id,
          name,
          territory,
          image_url,
          country_continent (continent_id)
        `);

      // Apply territory filter
      if (!includeTerritories) {
        query = query.eq('territory', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching global flags:", error);
        throw error;
      }

      // Apply continent filter in memory (like Site4)
      let filteredData = data;
      if (continent !== "world") {
        filteredData = data.filter((flag) =>
          flag.country_continent.some((cc) => cc.continent_id === Number(continent))
        );
      }

      return filteredData || [];
    } catch (error) {
      console.error("Error in fetchGlobalFlags:", error);
      throw error;
    }
  };

  // Simple direct Supabase query for regional flags (Site4 style)
  const fetchRegionalFlags = async (countryId, divisionTypes) => {
    try {
      const { data, error } = await supabase
        .from('regional_flags')
        .select(`
          id,
          name,
          image_url,
          division_type_id
        `)
        .eq('country_id', countryId)
        .in('division_type_id', divisionTypes);

      if (error) {
        console.error("Error fetching regional flags:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in fetchRegionalFlags:", error);
      throw error;
    }
  };

  // Simple direct Supabase query for regional countries with flag counts (Site4 style)
  const fetchRegionalCountries = async () => {
    try {
      const { data: countries, error } = await supabase
        .from('regional_flag_countries')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error("Error fetching regional countries:", error);
        throw error;
      }

      // Calculate flag counts for each country
      const countriesWithCounts = await Promise.all(
        countries.map(async (country) => {
          const { count, error: countError } = await supabase
            .from('regional_flags')
            .select('*', { count: 'exact', head: true })
            .eq('country_id', country.id);

          if (countError) {
            console.error(`Error counting flags for country ${country.id}:`, countError);
            return { ...country, total_regional_flags: 0 };
          }

          return { ...country, total_regional_flags: count || 0 };
        })
      );

      // Sort countries by total_regional_flags in descending order (highest first)
      const sortedCountries = countriesWithCounts.sort((a, b) => b.total_regional_flags - a.total_regional_flags);

      return sortedCountries || [];
    } catch (error) {
      console.error("Error in fetchRegionalCountries:", error);
      throw error;
    }
  };

  // Simple direct Supabase query for division types with flag counts (Site4 style)
  const fetchDivisionTypes = async () => {
    try {
      const { data: divisionTypes, error } = await supabase
        .from('region_division_types')
        .select('*')
        .eq('is_active', true)
        .order('type_name');

      if (error) {
        console.error("Error fetching division types:", error);
        throw error;
      }

      // Calculate flag counts for each division type
      const divisionTypesWithCounts = await Promise.all(
        divisionTypes.map(async (divisionType) => {
          const { count, error: countError } = await supabase
            .from('regional_flags')
            .select('*', { count: 'exact', head: true })
            .eq('division_type_id', divisionType.id);

          if (countError) {
            console.error(`Error counting flags for division type ${divisionType.id}:`, countError);
            return { ...divisionType, flag_count: 0 };
          }

          return { ...divisionType, flag_count: count || 0 };
        })
      );

      return divisionTypesWithCounts || [];
    } catch (error) {
      console.error("Error in fetchDivisionTypes:", error);
      throw error;
    }
  };

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
      
      try {
        // Use simple direct queries with flag counts
        const countriesData = await fetchRegionalCountries();
        const divisionTypesData = await fetchDivisionTypes();
        
        setRegionalCountries(countriesData);
        setRegionalDivisionTypes(divisionTypesData);
        
        console.log('Loaded regional data:', {
          countries: countriesData,
          divisionTypes: divisionTypesData
        });
        
      } catch (error) {
        console.error('Error loading regional data:', error);
        // Fallback to empty arrays if API fails
        setRegionalCountries([]);
        setRegionalDivisionTypes([]);
      } finally {
        setIsLoadingRegionalCountries(false);
      }
    };

    loadRegionalData();
  }, []);

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

  // Simple cleanup when component unmounts (Site4 style)
  useEffect(() => {
    return () => {
      // No complex timeout management needed
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

  // Function to end infinite mode game
  const endInfiniteMode = () => {
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
      selectedContinent: selectedContinent,
      includeTerritories: includeTerritories,
      timeAttackMode: timeAttackMode,
      regionalInfiniteMode: regionalInfiniteMode,
      infiniteMode: infiniteMode,
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
      fastestGuess: fastestGuess
    };
    
    console.log('Infinite Mode End - Final game stats:', finalGameStats);
    console.log('Infinite Mode End - Current game state:', currentGameState);
    
    setGameStats(finalGameStats);
    setGameStateSnapshot(currentGameState);
    setEndState("infiniteMode");
    setGameStarted(false);
    setShowEndScreen(true);
  };

  // Function to end Time Attack game
  const endTimeAttackGame = () => {
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
        selectedContinent: selectedContinent,
        includeTerritories: includeTerritories,
        timeAttackMode: timeAttackMode,
        regionalInfiniteMode: regionalInfiniteMode,
        infiniteMode: infiniteMode,
        regionalFlags: regionalFlags,
        filteredFlags: filteredFlags,
        usedFlags: usedFlags // Include usedFlags in the snapshot
      };
      
      setGameStats({
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
        averageTimePerGuess: calculateAverageTime(),
        fastestGuess: fastestGuess
      });
      setGameStateSnapshot(currentGameState);
      setEndState("timeAttack");
      setGameStarted(false);
      setShowEndScreen(true);
      setTimerStarted(false);
      setFirstGuessMade(false);
      setButtonsDisabled(false);
      setMessage("");
    }, 2500); // Show final message for 2.5 seconds
  };

  const startGame = async () => {
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
    const currentFlags = isRegionalMode ? (loadedFlags || regionalFlags) : filteredFlags;
    
    if (!currentFlags || currentFlags.length === 0) {
      console.error('No flags available when starting game');
      setMessage("Error: No flags available. Please try again.");
      setGameStarted(false);
      return;
    }
    
    // Load the next question with reset usedFlags
    await loadNextQuestion(null, []);
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

  const transitionToNextQuestion = async (currentScore = null) => {
    startTransition();
    // Wait for transition out animation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Load next question and get the new flag options
    // Don't reset usedFlags here - let it use the current state
    const newFlagOptions = await loadNextQuestion(currentScore, null);
    
    // Preload flag images for country-to-flag mode before ending transition
    const isRegionalMode = gameModeRef.current === "regional";
    const currentGameType = isRegionalMode ? regionalGameTypeRef.current : gameTypeRef.current;
    
    if ((currentGameType === "country-to-flag" || currentGameType === "region-to-flag") && newFlagOptions && newFlagOptions.length > 0) {
      // Preload flag images using the new flag options
      const preloadPromises = newFlagOptions.map(flag => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't block on errors
          img.src = flag.image_url;
        });
      });
      
      // Wait for all flags to load (with a timeout)
      await Promise.race([
        Promise.all(preloadPromises),
        new Promise(resolve => setTimeout(resolve, 1000)) // 1 second timeout
      ]);
    }
    
    // End transition after flags are loaded
    setTimeout(() => {
      endTransition();
    }, 50);
  };

  const loadNextQuestion = async (currentScore = null, resetUsedFlags = null) => {
    console.log(`loadNextQuestion: called with currentScore=${currentScore}, resetUsedFlags=${resetUsedFlags}, current scoreRef=${scoreRef.current}, gameStarted=${gameStartedRef.current}`);
    
    // Safety check: if game is not started and this is not the initial load, return
    if (!gameStartedRef.current && resetUsedFlags === null) {
      console.log('loadNextQuestion: Game not started, skipping');
      return null;
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
    
    if (isRegionalMode) {
      // For regional mode, ensure we have flags loaded
      if (regionalFlagsRef.current.length === 0) {
        try {
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
    
    currentGameFlagsRef.current = currentFlags; // Store for use in checkAnswer
    
    if (currentFlags.length === 0) {
      setMessage("No flags available for selected filters.");
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
    if (availableFlags.length === 0 && gameStarted) {
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
        selectedContinent: selectedContinent,
        includeTerritories: includeTerritories,
        timeAttackMode: timeAttackMode,
        regionalInfiniteMode: regionalInfiniteMode,
        infiniteMode: infiniteMode,
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
        fastestGuess: fastestGuess,
        completionTime: timeElapsed
      });
      setGameStateSnapshot(currentGameState);
      setEndState("allCompleted");
      setGameStarted(false);
      setShowEndScreen(true);
      return null;
    }
    
    // Ensure we have available flags before proceeding (only if game is started)
    if (availableFlags.length === 0 && gameStarted) {
      console.error('No available flags found. This should not happen after the previous check.');
      setMessage("Error: No flags available. Please try again.");
      setGameStarted(false);
      return null;
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
    
    // Always use the current usedFlags state to ensure we don't lose track
    setUsedFlags(prevUsedFlags => [...prevUsedFlags, randomFlag.id]);
    setLastGuessTime(Date.now()); // Set time for next guess
    
    // Add a fallback timer to clear loading state for consecutive flags
    // This prevents the loading spinner from getting stuck when the same flag appears consecutively
    const loadingTimeout = setTimeout(() => {
      setIsFlagLoading(false);
    }, 500); // 500ms fallback
    
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
    }
    
    return newFlagOptions;
  };

  // Simple flag load handler (Site4 style)
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

  const checkAnswer = (selectedAnswer) => {
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
      isCorrect = selectedAnswer === currentFlagValue.name;
    } else {
      // Check if selected flag matches current name
      isCorrect = selectedAnswer === currentFlagValue.id;
    }
    
    if (isCorrect) {
      // Play correct sound
      playCorrectSound();
      
      // Update streak for correct answer
      updateStreak(true);
      
      // Record guess time for correct answers
      recordGuessTime(true);
      
      const newScore = scoreRef.current + 1;
      console.log(`checkAnswer: Correct! Score updated from ${scoreRef.current} to ${newScore}`);
      setScore(newScore);
      currentScoreRef.current = newScore; // Update ref immediately
      setScoreAnimation(true);
      setMessage("Correct!");
      setButtonsDisabled(true);
      setButtonStyles({ 
        [selectedAnswer]: styles.correctButton
      });
      setTimeout(() => {
        setScoreAnimation(false);
        transitionToNextQuestion(newScore);
        setButtonStyles({});
        setButtonsDisabled(false);
      }, 1000);
    } else {
      // Play incorrect sound
      playIncorrectSound();
      
      // Update streak for incorrect answer
      updateStreak(false);
      
      // Handle incorrect answer
      if (timeAttackModeRef.current) {
        // In Time Attack mode, deduct 5 seconds from remaining time
        const newTime = Math.max(0, timeRemainingRef.current - 5);
        console.log(`Time Attack: Incorrect answer. Time remaining: ${timeRemainingRef.current}s -> ${newTime}s`);
        setTimeRemaining(newTime);
        
        // Check if this incorrect answer caused the timer to reach 0
        if (newTime === 0) {
          // Don't set message here - let the timer effect handle the game end
          setButtonStyles({
            [selectedAnswer]: styles.incorrectButton
          });
          setTimeout(() => {
            setButtonStyles({});
          }, 1000);
        } else {
          setMessage("Incorrect! -5 seconds");
          setButtonStyles({
            [selectedAnswer]: styles.incorrectButton
          });
          setTimeout(() => {
            setButtonStyles({});
          }, 1000);
        }
      } else {
        // Standard mode - use health system
        if (healthRef.current > 1) {
          setHealth(healthRef.current - 1);
          setMessage("Incorrect! Try again.");
          setButtonStyles({
            [selectedAnswer]: styles.incorrectButton
          });
          setTimeout(() => {
            setButtonStyles({});
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
            selectedContinent: selectedContinent,
            includeTerritories: includeTerritories,
            timeAttackMode: timeAttackMode,
            regionalInfiniteMode: regionalInfiniteMode,
            infiniteMode: infiniteMode,
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
            averageTimePerGuess: calculateAverageTime(),
            fastestGuess: fastestGuess
          };
          
          console.log('Game Over - Final game stats:', finalGameStats);
          console.log('Game Over - Current game state:', currentGameState);
          
          setGameStats(finalGameStats);
          setGameStateSnapshot(currentGameState);
          setEndState("ranOutOfHearts");
          setHealth(0);
          setGameStarted(false);
          setShowEndScreen(true);
        }
      }
    }
  };

  // Helper function to build game settings for end screen
  const buildGameSettings = () => {
    const isRegionalMode = gameMode === "regional";
    const currentGameType = isRegionalMode ? regionalGameType : gameType;
    
    return {
      gameMode: isRegionalMode ? "Regional Flags" : "Country Flags",
      gameType: currentGameType === "flag-to-country" ? "Flag → Country" : 
                currentGameType === "country-to-flag" ? "Country → Flag" :
                currentGameType === "flag-to-region" ? "Flag → Region" :
                currentGameType === "region-to-flag" ? "Region → Flag" : "Unknown",
      country: isRegionalMode && selectedRegionalCountry ? selectedRegionalCountry.name : null,
      region: !isRegionalMode ? (
        selectedContinent === "world" ? "World" :
        selectedContinent === "1" ? "Africa" :
        selectedContinent === "2" ? "Asia" :
        selectedContinent === "3" ? "Europe" :
        selectedContinent === "4" ? "North America" :
        selectedContinent === "5" ? "South America" :
        selectedContinent === "6" ? "Oceania" : "Unknown"
      ) : null,
      territories: !isRegionalMode ? (includeTerritories ? "Included" : "Excluded") : null,
      mode: timeAttackMode ? "Time Attack" : (isRegionalMode ? regionalInfiniteMode : infiniteMode) ? "Infinite" : "Standard"
    };
  };

  // Helper function to build game settings from snapshot (for end screen)
  const buildGameSettingsFromSnapshot = (gameState) => {
    const isRegionalMode = gameState.gameMode === "regional";
    const currentGameType = gameState.gameType;
    
    return {
      gameMode: isRegionalMode ? "Regional Flags" : "Country Flags",
      gameType: currentGameType === "flag-to-country" ? "Flag → Country" : 
                currentGameType === "country-to-flag" ? "Country → Flag" :
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
      mode: gameState.timeAttackMode ? "Time Attack" : (isRegionalMode ? gameState.regionalInfiniteMode : gameState.infiniteMode) ? "Infinite" : "Standard"
    };
  };

  // Helper function to get total flags count
  const getTotalFlagsCount = () => {
    const isRegionalMode = gameMode === "regional";
    if (isRegionalMode) {
      return regionalFlags.length || 0;
    } else {
      return filteredFlags.length || 0;
    }
  };

  // Helper function to get total flags count from snapshot
  const getTotalFlagsCountFromSnapshot = (gameState) => {
    const isRegionalMode = gameState.gameMode === "regional";
    if (isRegionalMode) {
      return gameState.regionalFlags.length || 0;
    } else {
      return gameState.filteredFlags.length || 0;
    }
  };

  // Helper function to get remaining flags count
  const getRemainingFlagsCount = () => {
    const totalFlags = getTotalFlagsCount();
    return totalFlags - usedFlags.length;
  };

  // Helper function to get remaining flags count from snapshot
  const getRemainingFlagsCountFromSnapshot = (gameState, usedFlagsCount) => {
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

  // Helper function to calculate average time per guess
  const calculateAverageTime = () => {
    if (guessTimes.length === 0) return 0;
    const totalTime = guessTimes.reduce((sum, time) => sum + time, 0);
    return Math.round(totalTime / guessTimes.length / 1000); // Convert to seconds
  };

  // Helper function to update streak tracking
  const updateStreak = (isCorrect) => {
    if (isCorrect) {
      const newCurrentStreak = currentStreak + 1;
      setCurrentStreak(newCurrentStreak);
      if (newCurrentStreak > longestStreak) {
        setLongestStreak(newCurrentStreak);
      }
    } else {
      setCurrentStreak(0);
    }
  };

  // Helper function to record guess time
  const recordGuessTime = (isCorrect) => {
    if (lastGuessTime && isCorrect) {
      const guessTime = Date.now() - lastGuessTime;
      setGuessTimes(prev => [...prev, guessTime]);
      
      // Update fastest guess if this is faster (store in seconds for consistency)
      const guessTimeSeconds = Math.round(guessTime / 1000);
      if (!fastestGuess || guessTimeSeconds < fastestGuess) {
        setFastestGuess(guessTimeSeconds);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!gameStarted && (
        <div className={styles.startScreen}>
          {/* Fixed Progress Bar */}
          <div className={styles.fixedProgressBar}>
            <ProgressBar />
          </div>
          
          {/* Consistent Content Area */}
          <div className={styles.contentArea}>
            <div className={styles.menuContainer}>
            {menuStep === 0 && (
              <div className={styles.modeSelectionSection}>
                <div className={styles.modeSelectionGrid}>
                  <MenuButton
                    type="mode"
                    icon="🌐"
                    label="Country Flags"
                    description="Play with national flags and territories"
                    isSelected={gameMode === "standard"}
                    onClick={() => {
                      playMenuClickSound();
                      setGameMode("standard");
                      setMenuStep(1);
                    }}
                  />
                  <MenuButton
                    type="mode"
                    icon="🏳️"
                    label="Regional Flags"
                    description="Play with state, province, and regional flags"
                    isSelected={gameMode === "regional"}
                    onClick={() => {
                      playMenuClickSound();
                      setGameMode("regional");
                      setMenuStep("regional-1");
                    }}
                  />
                </div>
              </div>
            )}
            {menuStep === 1 && (
              <div className={styles.gameTypeSection}>
                <div className={styles.gameTypeGrid}>
                  <MenuButton
                    type="gameType"
                    icon="🎯"
                    label="Flag to Country"
                    description="Guess the country name from the flag"
                    isSelected={gameType === "flag-to-country"}
                    onClick={() => {
                      playMenuClickSound();
                      setGameType("flag-to-country");
                      setMenuStep(2);
                    }}
                  />
                  <MenuButton
                    type="gameType"
                    icon="🗺️"
                    label="Country to Flag"
                    description="Guess the flag from the country name"
                    isSelected={gameType === "country-to-flag"}
                    onClick={() => {
                      playMenuClickSound();
                      setGameType("country-to-flag");
                      setMenuStep(2);
                    }}
                  />
                </div>
              </div>
            )}
            {menuStep === 2 && (
              <div className={styles.continentSection}>
                <div className={styles.continentGrid}>
                  <ContinentButton
                    label="World"
                    isSelected={selectedContinent === "world"}
                    onClick={() => {
                      playMenuClickSound();
                      setSelectedContinent("world");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="Africa"
                    isSelected={selectedContinent === "1"}
                    onClick={() => {
                      playMenuClickSound();
                      setSelectedContinent("1");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="Asia"
                    isSelected={selectedContinent === "2"}
                    onClick={() => {
                      playMenuClickSound();
                      setSelectedContinent("2");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="Europe"
                    isSelected={selectedContinent === "3"}
                    onClick={() => {
                      playMenuClickSound();
                      setSelectedContinent("3");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="North America"
                    isSelected={selectedContinent === "4"}
                    onClick={() => {
                      playMenuClickSound();
                      setSelectedContinent("4");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="South America"
                    isSelected={selectedContinent === "5"}
                    onClick={() => {
                      playMenuClickSound();
                      setSelectedContinent("5");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="Oceania"
                    isSelected={selectedContinent === "6"}
                    onClick={() => {
                      playMenuClickSound();
                      setSelectedContinent("6");
                      setMenuStep(3);
                    }}
                  />
                </div>
              </div>
            )}
            {menuStep === 3 && (
              <div className={styles.settingsSection}>
                <div className={styles.settingsGrid}>
                  <MenuButton
                    type="setting"
                    icon="🏝️"
                    label="Include Territories"
                    description="Play with territories and dependencies"
                    isSelected={includeTerritories}
                    onClick={() => {
                      playMenuClickSound();
                      setIncludeTerritories(!includeTerritories);
                    }}
                  />
                  <MenuButton
                    type="setting"
                    icon="⏱️"
                    label="Time Attack Mode"
                    description="Get the highest score in 1 minute"
                    isSelected={timeAttackMode}
                    onClick={() => {
                      playMenuClickSound();
                      setTimeAttackMode(!timeAttackMode);
                      if (!timeAttackMode) {
                        setInfiniteMode(true); // Auto-enable infinite mode
                      } else {
                        setInfiniteMode(false); // Reset to standard mode when disabling time attack
                      }
                    }}
                  />
                  <MenuButton
                    type="setting"
                    icon="♾️"
                    label="Infinite Mode"
                    description="Play endlessly without running out of flags"
                    isSelected={infiniteMode}
                    onClick={() => {
                      playMenuClickSound();
                      setInfiniteMode(!infiniteMode);
                    }}
                    disabled={timeAttackMode} // Disable when time attack is enabled
                  />
                </div>
                <div className={styles.settingsButtons}>
                  <ActionButton onClick={() => {
                    playMenuClickSound();
                    startGame();
                  }}>
                    Start Game
                  </ActionButton>
                </div>
              </div>
            )}
            
            {/* Regional Mode Menu Steps */}
            {menuStep === "regional-1" && (
              <div className={styles.gameTypeSection}>
                <div className={styles.gameTypeGrid}>
                  <MenuButton
                    type="gameType"
                    icon="🎯"
                    label="Flag to Region"
                    description="Guess the region name from the flag"
                    isSelected={regionalGameType === "flag-to-region"}
                    onClick={() => {
                      playMenuClickSound();
                      setRegionalGameType("flag-to-region");
                      setMenuStep("regional-2");
                    }}
                  />
                  <MenuButton
                    type="gameType"
                    icon="🗺️"
                    label="Region to Flag"
                    description="Guess the flag from the region name"
                    isSelected={regionalGameType === "region-to-flag"}
                    onClick={() => {
                      playMenuClickSound();
                      setRegionalGameType("region-to-flag");
                      setMenuStep("regional-2");
                    }}
                  />
                </div>
              </div>
            )}
            
            {menuStep === "regional-2" && (
              <div className={styles.regionalCountrySection}>
                <div className={styles.regionalCountryList}>
                  {isLoadingRegionalCountries ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>⏳</div>
                      <div className={styles.emptyStateTitle}>Loading countries...</div>
                      <div className={styles.emptyStateDescription}>Please wait while we fetch available countries</div>
                    </div>
                  ) : regionalCountries.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>🌍</div>
                      <div className={styles.emptyStateTitle}>No countries found</div>
                      <div className={styles.emptyStateDescription}>Please check your data or try refreshing the page</div>
                      <ActionButton
                        variant="secondary"
                        onClick={() => {
                          playMenuClickSound();
                          window.location.reload();
                        }}
                        className={styles.refreshButton}
                      >
                        🔄 Refresh Page
                      </ActionButton>
                    </div>
                  ) : regionalCountries.filter(country => country.is_active).length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>🚫</div>
                      <div className={styles.emptyStateTitle}>No active countries</div>
                      <div className={styles.emptyStateDescription}>All countries are currently inactive. Please contact an administrator.</div>
                    </div>
                  ) : (
                    regionalCountries
                      .filter(country => country.is_active)
                      .map(country => (
                      <div
                        key={country.id}
                        className={styles.regionalCountryItem}
                        onClick={() => {
                          playMenuClickSound();
                          setSelectedRegionalCountry(country);
                          // Check if this country has only one division type group
                          const countryDivisionTypes = regionalDivisionTypes.filter(
                            divisionType => divisionType.country_id === country.id
                          );
                          
                          if (countryDivisionTypes.length === 1) {
                            // Skip toggles step, go straight to game settings
                            setSelectedDivisionTypes([countryDivisionTypes[0].id]);
                            setMenuStep("regional-4");
                          } else {
                            // Go to division type selection
                            setMenuStep("regional-3");
                          }
                        }}
                      >
                        <img
                          src={country.flag_image_url}
                          alt={country.name}
                          className={styles.regionalCountryFlag}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className={styles.regionalCountryFlagFallback} style={{ display: 'none' }}>
                          🌍
                        </div>
                        <div className={styles.regionalCountryInfo}>
                          <div className={styles.regionalCountryName}>{country.name}</div>
                          <div className={styles.regionalCountryCount}>{country.total_regional_flags} regional flags</div>
                        </div>
                        <span className={styles.regionalCountryArrow}>→</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {menuStep === "regional-3" && (
              <div className={styles.divisionTypeSection}>
                {/* Only shown if country has >1 division type */}
                <div className={styles.divisionTypeList}>
                  {isLoadingRegionalCountries ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>⏳</div>
                      <div className={styles.emptyStateTitle}>Loading division types...</div>
                      <div className={styles.emptyStateDescription}>Please wait while we fetch available divisions</div>
                    </div>
                  ) : !selectedRegionalCountry ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>⚠️</div>
                      <div className={styles.emptyStateTitle}>No country selected</div>
                      <div className={styles.emptyStateDescription}>Please go back and select a country first</div>
                      <ActionButton
                        variant="secondary"
                        onClick={() => setMenuStep("regional-2")}
                        className={styles.backButton}
                      >
                        ← Back to Countries
                      </ActionButton>
                    </div>
                  ) : regionalDivisionTypes.filter(divisionType => 
                      divisionType.country_id === selectedRegionalCountry?.id && 
                      divisionType.is_active
                    ).length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>🏛️</div>
                      <div className={styles.emptyStateTitle}>No divisions available</div>
                      <div className={styles.emptyStateDescription}>
                        No active divisions found for {selectedRegionalCountry.name}. 
                        This country may not have regional flags configured.
                      </div>
                      <ActionButton
                        variant="secondary"
                        onClick={() => setMenuStep("regional-2")}
                        className={styles.backButton}
                      >
                        ← Back to Countries
                      </ActionButton>
                    </div>
                  ) : (
                    regionalDivisionTypes
                      .filter(divisionType => divisionType.country_id === selectedRegionalCountry?.id && divisionType.is_active)
                      .map(divisionType => (
                      <div
                        key={divisionType.id}
                        className={`${styles.divisionTypeItem} ${selectedDivisionTypes.includes(divisionType.id) ? styles.selected : ''}`}
                        onClick={() => {
                          playMenuClickSound();
                          if (selectedDivisionTypes.includes(divisionType.id)) {
                            setSelectedDivisionTypes(selectedDivisionTypes.filter(id => id !== divisionType.id));
                          } else {
                            setSelectedDivisionTypes([...selectedDivisionTypes, divisionType.id]);
                          }
                        }}
                      >
                        <div className={styles.divisionTypeCheckbox}></div>
                        <div className={styles.divisionTypeInfo}>
                          <div className={styles.divisionTypeName}>{divisionType.type_name}</div>
                          <div className={styles.divisionTypeCount}>{divisionType.flag_count} regional flags</div>
                        </div>
                        <span className={styles.divisionTypeIcon}>✓</span>
                      </div>
                    ))
                  )}
                </div>
                {selectedDivisionTypes.length > 0 && (
                  <div className={styles.settingsButtons}>
                    <button
                      className={`${styles.button} ${styles.mainButton}`}
                      onClick={() => {
                        playMenuClickSound();
                        setMenuStep("regional-4");
                      }}
                      disabled={selectedDivisionTypes.length === 0}
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {menuStep === "regional-4" && (
              <div className={styles.settingsSection}>
                <div className={styles.settingsGrid}>
                  <MenuButton
                    type="setting"
                    icon="⏱️"
                    label="Time Attack Mode"
                    description="Get the highest score in 1 minute"
                    isSelected={timeAttackMode}
                    onClick={() => {
                      playMenuClickSound();
                      setTimeAttackMode(!timeAttackMode);
                      if (!timeAttackMode) {
                        setRegionalInfiniteMode(true); // Auto-enable infinite mode
                      } else {
                        setRegionalInfiniteMode(false); // Reset to standard mode when disabling time attack
                      }
                    }}
                  />
                  <MenuButton
                    type="setting"
                    icon="♾️"
                    label="Infinite Mode"
                    description="Play endlessly without running out of flags"
                    isSelected={regionalInfiniteMode}
                    onClick={() => {
                      playMenuClickSound();
                      setRegionalInfiniteMode(!regionalInfiniteMode);
                    }}
                    disabled={timeAttackMode} // Disable when time attack is enabled
                  />
                </div>
                <div className={styles.settingsButtons}>
                  <ActionButton onClick={() => {
                    playMenuClickSound();
                    startGame();
                  }}>
                    Start Game
                  </ActionButton>
                </div>
              </div>
            )}
            </div>
          </div>
          
          {/* Floating Menu - only shown when not in game */}
          <FloatingMenu />
        </div>
      )}
  
      {gameStarted && (
        <>
          <div className={styles.gameInfo}>
            <div className={styles.score}>
              <span className={styles.scoreLabel}>Score:</span>
              <span className={`${styles.scoreValue} ${scoreAnimation ? styles.increase : ''}`}>
                {score}
              </span>
            </div>
            {timeAttackMode && (
              <div className={styles.timer}>
                <span className={styles.timerLabel}>⏱️ Time:</span>
                <span className={`${styles.timerValue} ${timeRemaining <= 10 ? styles.timerWarning : ''} ${timeRemaining <= 5 ? styles.timerCritical : ''}`}>
                  {timeRemaining}s
                </span>
                {timeRemaining <= 5 && (
                  <span className={styles.timerCountdown}>⚠️</span>
                )}
              </div>
            )}
            {!timeAttackMode && (
              <div className={styles.health}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <span 
                    key={index} 
                    className={`${styles.heart} ${health > index ? styles.activeHeart : styles.inactiveHeart}`}
                    title={`${health > index ? 'Active' : 'Lost'} life`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            )}
            {(infiniteMode || regionalInfiniteMode) && !timeAttackMode && (
              <button
                className={`${styles.button} ${styles.endGameButton}`}
                onClick={() => {
                  playMenuClickSound();
                  endInfiniteMode();
                }}
                title="End Game"
              >
                🏁 End
              </button>
            )}
          </div>
  
          {currentFlag && (
            <div className={`${styles.flagContainer} ${flagTransitioning ? styles.transitioning : ''}`}>
              {(gameType === "flag-to-country" || regionalGameType === "flag-to-region") ? (
                // Show flag image for flag-to-country or flag-to-region mode (Site4 style)
                <>
                  {isFlagLoading && <div className={styles.loadingSpinner}></div>}
                  <img
                    src={currentFlag.image_url}
                    alt={currentFlag.name}
                    className={`${styles.flagImage} ${flagTransitioning ? styles.transitioning : ''}`}
                    onLoad={() => handleFlagLoad(lastFlagId)}
                    onError={() => handleFlagError(lastFlagId, currentFlag.name)}
                    style={{ display: isFlagLoading ? 'none' : 'block' }}
                  />
                </>
              ) : (
                // Show name for country-to-flag or region-to-flag mode
                <div key={currentFlag.name} className={`${styles.countryText} ${flagTransitioning ? styles.transitioning : ''}`}>
                  {currentFlag.name}
                </div>
              )}
            </div>
          )}
  
          <div className={`${styles.optionsContainer} ${optionsTransitioning ? styles.transitioning : ''}`}>
            {(gameType === "flag-to-country" || regionalGameType === "flag-to-region") ? (
              // Show names as buttons for flag-to-country or flag-to-region mode
              options.map((name, index) => (
                <button
                  key={index}
                  onClick={() => checkAnswer(name)}
                  className={`${styles.button} ${styles.guessButton} ${styles.optionsTransition} ${buttonStyles[name] || ''} ${optionsTransitioning ? styles.transitioning : ''}`}
                  disabled={buttonsDisabled}
                >
                  {name}
                </button>
              ))
            ) : (
              // Show flag images as buttons for country-to-flag or region-to-flag mode (Site4 style)
              <>
                {flagOptions.map((flag, index) => (
                  <button
                    key={index}
                    onClick={() => checkAnswer(flag.id)}
                    className={`${styles.button} ${styles.flagGuessButton} ${styles.optionsTransition} ${buttonStyles[flag.id] || ''} ${optionsTransitioning ? styles.transitioning : ''}`}
                    disabled={buttonsDisabled}
                  >
                    <img
                      src={flag.image_url}
                      alt={flag.name}
                      onLoad={() => handleFlagLoad(flag.id)}
                      onError={() => handleFlagError(flag.id, flag.name)}
                    />
                  </button>
                ))}
              </>
            )}
          </div>
  
          {message && (
            <p className={`${styles.message} ${messageTransitioning ? styles.transitioning : ''} ${
              message.includes("Game Over")
                ? styles.gameOver
                : message.includes("Correct")
                ? styles.correct
                : styles.incorrect
            }`}>
              {message}
            </p>
          )}
        </>
      )}
  
      {showEndScreen && (
        <div className={styles.endScreen}>
          {(() => {
            console.log('End screen remaining flags calculation:', {
              gameStatsRemainingFlags: gameStats.remainingFlags,
              calculatedRemaining: gameStats.totalFlags - gameStats.remainingFlags,
              finalRemaining: gameStats.remainingFlags !== undefined ? gameStats.remainingFlags : 0
            });
            return null;
          })()}
          <div className={styles.endScreenContent}>
            <div className={styles.endScreenHeader}>
              {endState === "ranOutOfHearts" && (
                <>
                  <div className={`${styles.endStateIcon} ${styles.gameOverIcon}`}>💀</div>
                  <h2 className={styles.endStateTitle}>Game Over!</h2>
                  <p className={styles.endStateSubtitle}>You ran out of hearts!</p>
                </>
              )}
              {endState === "allCompleted" && (
                <>
                  <div className={`${styles.endStateIcon} ${styles.completedIcon}`}>🏆</div>
                  <h2 className={styles.endStateTitle}>All Done!</h2>
                  <p className={styles.endStateSubtitle}>You've completed all flags!</p>
                </>
              )}
              {endState === "infiniteMode" && (
                <>
                  <div className={`${styles.endStateIcon} ${styles.infiniteIcon}`}>♾️</div>
                  <h2 className={styles.endStateTitle}>Run Complete!</h2>
                  <p className={styles.endStateSubtitle}>Great job on your infinite run!</p>
                </>
              )}
              {endState === "timeAttack" && (
                <>
                  <div className={`${styles.endStateIcon} ${styles.timeAttackIcon}`}>⏱️</div>
                  <h2 className={styles.endStateTitle}>Time's Up!</h2>
                  <p className={styles.endStateSubtitle}>Great job on your time attack run!</p>
                </>
              )}
            </div>

            <div className={styles.quickStatsSection}>
              <div className={styles.quickStatCard}>
                <div className={styles.quickStatValue}>{gameStats.score}</div>
                <div className={styles.quickStatLabel}>Points</div>
              </div>
              <div className={styles.quickStatCard}>
                {endState === "ranOutOfHearts" ? (
                  <>
                    <div className={styles.quickStatValue}>{gameStats.accuracy}%</div>
                    <div className={styles.quickStatLabel}>Accuracy</div>
                  </>
                ) : endState === "allCompleted" ? (
                  <>
                    <div className={styles.quickStatValue}>{Math.floor(gameStats.timeElapsed / 1000)}s</div>
                    <div className={styles.quickStatLabel}>Completion Time</div>
                  </>
                ) : endState === "infiniteMode" ? (
                  <>
                    <div className={styles.quickStatValue}>{gameStats.longestStreak || 0}</div>
                    <div className={styles.quickStatLabel}>Longest Streak ⚡</div>
                  </>
                ) : endState === "timeAttack" ? (
                  <>
                    <div className={styles.quickStatValue}>{gameStats.averageTimePerGuess || 0}s</div>
                    <div className={styles.quickStatLabel}>Avg Time per Guess ⏱️</div>
                  </>
                ) : (
                  <>
                    <div className={styles.quickStatValue}>{gameStats.accuracy}%</div>
                    <div className={styles.quickStatLabel}>Accuracy</div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.gameSettings}>
              <h3>Game Settings</h3>
              <div className={styles.settingsInfo}>
                <div className={styles.settingItem}>
                  <span className={styles.endScreenSettingLabel}>Game Mode:</span>
                  <span className={styles.endScreenSettingValue}>
                    {gameStats.gameSettings?.gameMode || (gameMode === "regional" ? "Regional Flags" : "Country Flags")}
                  </span>
                </div>
                <div className={styles.settingItem}>
                  <span className={styles.endScreenSettingLabel}>Game Type:</span>
                  <span className={styles.endScreenSettingValue}>
                    {gameStats.gameSettings?.gameType || 
                     (gameStats.gameType === "flag-to-country" ? "Flag → Country" : 
                      gameStats.gameType === "country-to-flag" ? "Country → Flag" :
                      gameStats.gameType === "flag-to-region" ? "Flag → Region" :
                      gameStats.gameType === "region-to-flag" ? "Region → Flag" : "Unknown")}
                  </span>
                </div>
                {gameStats.gameSettings?.country && (
                  <div className={styles.settingItem}>
                    <span className={styles.endScreenSettingLabel}>Country:</span>
                    <span className={styles.endScreenSettingValue}>
                      {gameStats.gameSettings.country}
                    </span>
                  </div>
                )}
                {gameStats.gameSettings?.region && (
                  <div className={styles.settingItem}>
                    <span className={styles.endScreenSettingLabel}>Region:</span>
                    <span className={styles.endScreenSettingValue}>
                      {gameStats.gameSettings.region}
                    </span>
                  </div>
                )}
                {gameStats.gameSettings?.territories && (
                  <div className={styles.settingItem}>
                    <span className={styles.endScreenSettingLabel}>Territories:</span>
                    <span className={styles.endScreenSettingValue}>
                      {gameStats.gameSettings.territories}
                    </span>
                  </div>
                )}
                <div className={styles.settingItem}>
                  <span className={styles.endScreenSettingLabel}>Mode:</span>
                  <span className={styles.endScreenSettingValue}>
                    {gameStats.gameSettings?.mode || ((gameMode === "regional" ? regionalInfiniteMode : infiniteMode) ? "Infinite" : "Standard")}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.gameStats}>
              <h3>Statistics</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎯</div>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Total Score</span>
                    <span className={styles.statValue}>{gameStats.score}</span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📊</div>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Accuracy</span>
                    <span className={styles.statValue}>{gameStats.accuracy}%</span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎲</div>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Total Attempts</span>
                    <span className={styles.statValue}>{gameStats.totalAttempts}</span>
                  </div>
                </div>
                
                {/* Mode-specific statistics */}
                {endState === "ranOutOfHearts" && (
                  <>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>⏱️</div>
                      <div className={styles.statContent}>
                        <span className={styles.statLabel}>Time Elapsed</span>
                        <span className={styles.statValue}>
                          {Math.floor(gameStats.timeElapsed / 1000)}s
                        </span>
                      </div>
                    </div>
                    {!(gameMode === "regional" ? regionalInfiniteMode : infiniteMode) && (
                      <div className={styles.statCard}>
                        <div className={styles.statIcon}>🚩</div>
                        <div className={styles.statContent}>
                          <span className={styles.statLabel}>Remaining</span>
                          <span className={styles.statValue}>
                            {gameStats.remainingFlags !== undefined ? gameStats.remainingFlags : 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {endState === "allCompleted" && (
                  <>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>🏁</div>
                      <div className={styles.statContent}>
                        <span className={styles.statLabel}>Completion Time</span>
                        <span className={styles.statValue}>
                          {Math.floor(gameStats.timeElapsed / 1000)}s
                        </span>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>⏱️</div>
                      <div className={styles.statContent}>
                        <span className={styles.statLabel}>Avg Time per Guess</span>
                        <span className={styles.statValue}>
                          {gameStats.averageTimePerGuess || 0}s
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                {endState === "infiniteMode" && (
                  <>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>⏱️</div>
                      <div className={styles.statContent}>
                        <span className={styles.statLabel}>Time Elapsed</span>
                        <span className={styles.statValue}>
                          {Math.floor(gameStats.timeElapsed / 1000)}s
                        </span>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>⚡</div>
                      <div className={styles.statContent}>
                        <span className={styles.statLabel}>Longest Streak</span>
                        <span className={styles.statValue}>
                          {gameStats.longestStreak || 0}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                {endState === "timeAttack" && (
                  <>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>⏱️</div>
                      <div className={styles.statContent}>
                        <span className={styles.statLabel}>Avg Time per Guess</span>
                        <span className={styles.statValue}>
                          {gameStats.averageTimePerGuess || 0}s
                        </span>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>🏃</div>
                      <div className={styles.statContent}>
                        <span className={styles.statLabel}>Fastest Guess</span>
                        <span className={styles.statValue}>
                          {gameStats.fastestGuess || 0}s
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.endScreenActions}>
              <button
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={() => {
                  playMenuClickSound();
                  setShowEndScreen(false);
                  setMenuStep(0);
                  setGameMode("standard");
                  setGameType(null);
                  setRegionalGameType(null);
                  setSelectedRegionalCountry(null);
                  setSelectedDivisionTypes([]);
                }}
              >
                New Game
              </button>
              <button
                className={`${styles.button} ${styles.mainButton}`}
                onClick={async () => {
                  playMenuClickSound();
                  
                  // Hide the end screen immediately
                  setShowEndScreen(false);
                  setGameStats({});
                  setEndState(null);
                  
                  // Restore the game state from the snapshot for the new game
                  if (gameStateSnapshot.gameMode) {
                    console.log('Play Again: Restoring game state from snapshot:', gameStateSnapshot);
                    
                    // Restore all the game settings
                    setGameMode(gameStateSnapshot.gameMode);
                    setTimeAttackMode(gameStateSnapshot.timeAttackMode);
                    setRegionalInfiniteMode(gameStateSnapshot.regionalInfiniteMode);
                    setInfiniteMode(gameStateSnapshot.infiniteMode);
                    
                    if (gameStateSnapshot.gameMode === "regional") {
                      setRegionalGameType(gameStateSnapshot.gameType);
                      setSelectedRegionalCountry(gameStateSnapshot.selectedRegionalCountry);
                      setRegionalFlags(gameStateSnapshot.regionalFlags);
                      setFilteredRegionalFlags(gameStateSnapshot.regionalFlags);
                    } else {
                      setGameType(gameStateSnapshot.gameType);
                      setSelectedContinent(gameStateSnapshot.selectedContinent);
                      setIncludeTerritories(gameStateSnapshot.includeTerritories);
                      setFilteredFlags(gameStateSnapshot.filteredFlags);
                    }
                  }
                  
                  // Wait a moment to ensure state updates are processed
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  // Start the new game (this will reset all game state)
                  await startGame();
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

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
          {modalType === 'help' && <HelpModal />}
        </>
      )}
      

    </div>
  );
};

export default Site1;
