import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { loadFlags, getRegionalCountries, getDivisionTypes } from "../lib/flagLoader";
import styles from "../styles/site1.module.css";
import MenuButton from "../components/MenuButton";
import ActionButton from "../components/ActionButton";
import GameButton from "../components/GameButton";
import ContinentButton from "../components/ContinentButton";

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
  const [startScreenStep, setStartScreenStep] = useState(1);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [flagOptions, setFlagOptions] = useState([]);
  const [flagLoadingStates, setFlagLoadingStates] = useState({});
  const [flagErrorStates, setFlagErrorStates] = useState({});
  const flagLoadTimeouts = useRef({});

  // New state variables for end screen
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [endState, setEndState] = useState(null);
  const [gameStats, setGameStats] = useState({});

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

  // Progress bar state
  const [progressBarHover, setProgressBarHover] = useState(false);

  // Transition state variables for smooth animations
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [flagTransitioning, setFlagTransitioning] = useState(false);
  const [optionsTransitioning, setOptionsTransitioning] = useState(false);
  const [messageTransitioning, setMessageTransitioning] = useState(false);

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
    
    const steps = getProgressSteps();
    const currentIndex = getCurrentStepIndex();
    const previousStep = steps[currentIndex - 1];
    
    setMenuStep(previousStep.id);
  };

  const goToNextStep = () => {
    if (!canGoForward()) return;
    
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

  useEffect(() => {
    const fetchFlags = async () => {
      setIsLoading(true);
      try {
        // Load global flags by default
        const globalFlags = await loadFlags({
          gameType: "standard",
          selectedContinent: "world",
          includeTerritories: false
        });
        
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

  // Load regional data from database
  useEffect(() => {
    const loadRegionalData = async () => {
      setIsLoadingRegionalCountries(true);
      
      try {
        // Use the new utility functions
        const countriesData = await getRegionalCountries();
        const divisionTypesData = await getDivisionTypes();
        
        // Calculate total regional flags for each country
        const countriesWithFlagCounts = countriesData.map(country => {
          const countryDivisionTypes = divisionTypesData.filter(
            divisionType => divisionType.country_id === country.id
          );
          const totalFlags = countryDivisionTypes.reduce(
            (sum, divisionType) => sum + (divisionType.flag_count || 0), 
            0
          );
          
          return {
            ...country,
            total_regional_flags: totalFlags
          };
        });
        
        // Add flag counts to division types
        const divisionTypesWithCounts = divisionTypesData.map(divisionType => ({
          ...divisionType,
          flag_count: divisionType.flag_count || 0
        }));
        
        setRegionalCountries(countriesWithFlagCounts);
        setRegionalDivisionTypes(divisionTypesWithCounts);
        
        console.log('Loaded regional data:', {
          countries: countriesWithFlagCounts,
          divisionTypes: divisionTypesWithCounts
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
        // Only apply filters for global mode
        if (gameMode === "standard") {
          const filteredFlags = await loadFlags({
            gameType: "standard",
            selectedContinent: selectedContinent,
            includeTerritories: includeTerritories
          });
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
          // For global mode, load flags with current filters
          const globalFlags = await loadFlags({
            gameType: "standard",
            selectedContinent: selectedContinent,
            includeTerritories: includeTerritories
          });
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

  // Cleanup timeouts when component unmounts or game type changes
  useEffect(() => {
    return () => {
      console.log('Cleaning up flag loading timeouts');
      Object.values(flagLoadTimeouts.current).forEach(timeout => clearTimeout(timeout));
      flagLoadTimeouts.current = {};
    };
  }, [gameType]);

  // Function to set up timeouts for flag images
  const setupFlagTimeouts = () => {
    // Handle both standard and regional flag-to-flag modes
    const isRegionalMode = gameMode === "regional";
    const currentGameType = isRegionalMode ? regionalGameType : gameType;
    const isFlagToFlagMode = currentGameType === "country-to-flag" || currentGameType === "region-to-flag";
    
    if (isFlagToFlagMode && flagOptions.length > 0) {
      console.log(`Setting up timeouts for ${flagOptions.length} flags`);
      
      // Clear timeouts for flags that are no longer in the current options
      const currentFlagIds = flagOptions.map(flag => flag.id);
      Object.keys(flagLoadTimeouts.current).forEach(flagId => {
        if (!currentFlagIds.includes(parseInt(flagId))) {
          console.log(`Clearing stale timeout for flag ID: ${flagId}`);
          clearTimeout(flagLoadTimeouts.current[flagId]);
          delete flagLoadTimeouts.current[flagId];
        }
      });
      
      flagOptions.forEach(flag => {
        // Only set up timeout if the flag is in loading state and no timeout exists
        if (flagLoadingStates[flag.id] && !flagErrorStates[flag.id] && !flagLoadTimeouts.current[flag.id]) {
          console.log(`Setting timeout for flag: ${flag.name} (ID: ${flag.id})`);
          flagLoadTimeouts.current[flag.id] = setTimeout(() => {
            console.log(`Timeout triggered for flag: ${flag.name} (ID: ${flag.id})`);
            handleFlagError(flag.id, flag.name);
          }, 8000); // Increased to 8 seconds for better reliability
        }
      });
    }
    
    // Also set up timeout for the main flag display (currentFlag)
    if (currentFlag && isFlagLoading && !flagErrorStates[currentFlag.id] && !flagLoadTimeouts.current[`main-${currentFlag.id}`]) {
      console.log(`Setting timeout for main flag: ${currentFlag.name} (ID: ${currentFlag.id})`);
      flagLoadTimeouts.current[`main-${currentFlag.id}`] = setTimeout(() => {
        console.log(`Timeout triggered for main flag: ${currentFlag.name} (ID: ${currentFlag.id})`);
        handleFlagError(currentFlag.id, currentFlag.name);
      }, 8000); // 8 seconds
    }
  };

  // Set up timeouts when flagOptions changes or when currentFlag changes
  useEffect(() => {
    const isRegionalMode = gameMode === "regional";
    const currentGameType = isRegionalMode ? regionalGameType : gameType;
    const isFlagToFlagMode = currentGameType === "country-to-flag" || currentGameType === "region-to-flag";
    
    if ((isFlagToFlagMode && flagOptions.length > 0) || currentFlag) {
      // Use setTimeout to ensure this runs after the current render cycle
      setTimeout(() => {
        setupFlagTimeouts();
      }, 0);
    }
  }, [flagOptions, gameType, regionalGameType, gameMode, currentFlag, isFlagLoading]); // Include all relevant dependencies

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
            
            // Add a brief flash effect before ending
            setMessage("⏰ Time's up!");
            
            // Use setTimeout to ensure state updates are processed before ending game
            setTimeout(() => {
              endTimeAttackGame();
            }, 500);
            
            return 0;
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
  }, [timeAttackMode, timerStarted, timeRemaining]);

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
    const gameEndTime = new Date().getTime();
    const timeElapsed = gameEndTime - gameStartTime;
    const finalAttempts = totalAttempts;
    const accuracy = finalAttempts > 0 ? ((score / finalAttempts) * 100).toFixed(1) : 0;
    
    setGameStats({
      score: score,
      totalAttempts: finalAttempts,
      accuracy: accuracy,
      timeElapsed: timeElapsed,
      endState: "infiniteMode",
      gameType: gameMode === "regional" ? regionalGameType : gameType,
      gameSettings: buildGameSettings(),
      totalFlags: getTotalFlagsCount(),
      remainingFlags: getRemainingFlagsCount()
    });
    setEndState("infiniteMode");
    setGameStarted(false);
    setShowEndScreen(true);
  };

  // Function to end Time Attack game
  const endTimeAttackGame = () => {
    console.log('Time Attack: Ending game with final score:', score);
    
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Disable buttons to prevent further interaction
    setButtonsDisabled(true);
    
    // Calculate final statistics
    const gameEndTime = new Date().getTime();
    const timeElapsed = gameEndTime - gameStartTime;
    const finalAttempts = totalAttempts;
    const accuracy = finalAttempts > 0 ? ((score / finalAttempts) * 100).toFixed(1) : 0;
    
    // Create a more engaging final message
    const finalMessage = score > 0 
      ? `⏰ Time's up! Great job! You got ${score} correct answer${score === 1 ? '' : 's'} in 60 seconds!`
      : `⏰ Time's up! Keep practicing - you'll get better!`;
    
    setMessage(finalMessage);
    
    // Add a brief pause to let the user see the final score
    setTimeout(() => {
      setGameStats({
        score: score,
        totalAttempts: finalAttempts,
        accuracy: accuracy,
        timeElapsed: timeElapsed,
        endState: "timeAttack",
        gameType: gameMode === "regional" ? regionalGameType : gameType,
        gameSettings: buildGameSettings(),
        totalFlags: getTotalFlagsCount(),
        remainingFlags: getRemainingFlagsCount()
      });
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
    // Always reset game state when starting a new game
    setScore(0);
    setHealth(3);
    setMessage("");
    setGameStarted(true);
    setUsedFlags([]);
    setGameStartTime(new Date().getTime());
    setTotalAttempts(0);
    setShowEndScreen(false);
    setEndState(null);
    
    // Initialize Time Attack mode
    if (timeAttackMode) {
      console.log('Initializing Time Attack mode with 60 seconds');
      setTimeRemaining(60);
      setTimerStarted(false);
      setFirstGuessMade(false);
    }
    
    // Clear flag loading and error states when starting a new game
    setFlagLoadingStates({});
    setFlagErrorStates({});
    // Clear any existing timeouts
    Object.values(flagLoadTimeouts.current).forEach(timeout => clearTimeout(timeout));
    flagLoadTimeouts.current = {};
    console.log('Cleared all flag loading timeouts for new game');
    
    // Load regional flags if in regional mode
    let loadedFlags = null;
    if (gameMode === "regional" && regionalFlags.length === 0) {
      try {
        loadedFlags = await fetchRegionalFlags();
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
    await loadNextQuestion(currentScore, null);
    // Wait a bit more for content to load, then end transition
    setTimeout(() => {
      endTransition();
    }, 50);
  };

  const loadNextQuestion = async (currentScore = null, resetUsedFlags = null) => {
    // Determine which flags to use based on game mode
    const isRegionalMode = gameMode === "regional";
    let currentFlags;
    let currentInfiniteMode;
    let currentGameType;
    
    if (isRegionalMode) {
      // For regional mode, ensure we have flags loaded
      if (regionalFlags.length === 0) {
        try {
          const loadedFlags = await loadFlags({
            gameType: "regional",
            selectedCountryId: selectedRegionalCountry.id,
            selectedDivisionTypes: selectedDivisionTypes
          });
          
          if (loadedFlags.length === 0) {
            setMessage("No regional flags available for selected filters.");
            return;
          }
          
          setRegionalFlags(loadedFlags);
          setFilteredRegionalFlags(loadedFlags);
          currentFlags = loadedFlags;
        } catch (error) {
          console.error("Error loading regional flags:", error);
          setMessage("Error loading regional flags. Please try again.");
          return;
        }
      } else {
        currentFlags = regionalFlags;
      }
      currentInfiniteMode = regionalInfiniteMode;
      currentGameType = regionalGameType;
    } else {
      // Standard mode
      currentFlags = filteredFlags;
      currentInfiniteMode = infiniteMode;
      currentGameType = gameType;
    }
    
    currentGameFlagsRef.current = currentFlags; // Store for use in checkAnswer
    
    if (currentFlags.length === 0) {
      setMessage("No flags available for selected filters.");
      return;
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
      gameStarted
    });
    
    // Check if we have enough available flags
    if (availableFlags.length === 0 && gameStarted) {
      // No more flags available - game is actually complete
      const gameEndTime = new Date().getTime();
      const timeElapsed = gameEndTime - gameStartTime;
      const finalScore = currentScore !== null ? currentScore : score;
      setGameStats({
        score: finalScore,
        totalAttempts: totalAttempts,
        accuracy: totalAttempts > 0 ? ((finalScore / totalAttempts) * 100).toFixed(1) : 0,
        timeElapsed: timeElapsed,
        remainingFlags: 0,
        endState: "allCompleted",
        gameType: currentGameType,
        gameSettings: buildGameSettings(),
        totalFlags: getTotalFlagsCount()
      });
      setEndState("allCompleted");
      setGameStarted(false);
      setShowEndScreen(true);
      return;
    }
    
    // Ensure we have available flags before proceeding (only if game is started)
    if (availableFlags.length === 0 && gameStarted) {
      console.error('No available flags found. This should not happen after the previous check.');
      setMessage("Error: No flags available. Please try again.");
      setGameStarted(false);
      return;
    }
    
    const randomFlag = availableFlags[Math.floor(Math.random() * availableFlags.length)];
    
    // Additional safety check
    if (!randomFlag || !randomFlag.id) {
      console.error('Invalid flag selected:', randomFlag);
      setMessage("Error: Invalid flag data. Please try again.");
      setGameStarted(false);
      return;
    }
    
    setCurrentFlag(randomFlag);
    setUsedFlags([...flagsToUse, randomFlag.id]);
    
    if (currentGameType === "flag-to-country" || currentGameType === "flag-to-region") {
      // Show flag, guess name (country or region)
      const correctName = randomFlag.name;
      let incorrectNames = currentFlags.filter((flag) => flag.name !== correctName);
      incorrectNames = incorrectNames.sort(() => Math.random() - 0.5).slice(0, 3);
    
      const allNames = [correctName, ...incorrectNames.map((flag) => flag.name)];
      const shuffledNames = allNames.sort(() => Math.random() - 0.5);
    
      setOptions(shuffledNames);
      setFlagOptions([]); // Clear flag options for this mode
      setFlagLoadingStates({}); // Clear loading states
    } else {
      // Show name, guess flag (country-to-flag or region-to-flag)
      const correctFlag = randomFlag;
      let incorrectFlags = currentFlags.filter((flag) => flag.id !== correctFlag.id);
      incorrectFlags = incorrectFlags.sort(() => Math.random() - 0.5).slice(0, 3);
    
      const allFlags = [correctFlag, ...incorrectFlags];
      const shuffledFlags = allFlags.sort(() => Math.random() - 0.5);
    
      setFlagOptions(shuffledFlags);
      setOptions([]); // Clear name options for this mode
      
      // Initialize loading states for all flags
      const initialLoadingStates = {};
      shuffledFlags.forEach(flag => {
        initialLoadingStates[flag.id] = true;
      });
      setFlagLoadingStates(initialLoadingStates);
    }
  };

  const handleFlagLoad = (flagId) => {
    console.log(`Flag loaded successfully: ${flagId}`);
    setFlagLoadingStates(prev => ({
      ...prev,
      [flagId]: false
    }));
    
    // Clear both regular and main flag timeouts
    if (flagLoadTimeouts.current[flagId]) {
      clearTimeout(flagLoadTimeouts.current[flagId]);
      delete flagLoadTimeouts.current[flagId];
      console.log(`Cleared timeout for flag: ${flagId}`);
    }
    if (flagLoadTimeouts.current[`main-${flagId}`]) {
      clearTimeout(flagLoadTimeouts.current[`main-${flagId}`]);
      delete flagLoadTimeouts.current[`main-${flagId}`];
      console.log(`Cleared main flag timeout for: ${flagId}`);
    }
    
    // If this is the main flag, also clear the main loading state
    if (currentFlag && currentFlag.id === flagId) {
      setIsFlagLoading(false);
    }
  };

  const handleFlagError = (flagId, flagName) => {
    console.log(`Flag failed to load: ${flagName} (ID: ${flagId})`);
    setFlagErrorStates(prev => ({
      ...prev,
      [flagId]: true
    }));
    setFlagLoadingStates(prev => ({
      ...prev,
      [flagId]: false
    }));
    
    // Clear both regular and main flag timeouts
    if (flagLoadTimeouts.current[flagId]) {
      clearTimeout(flagLoadTimeouts.current[flagId]);
      delete flagLoadTimeouts.current[flagId];
      console.log(`Cleared timeout for flag: ${flagId} due to error`);
    }
    if (flagLoadTimeouts.current[`main-${flagId}`]) {
      clearTimeout(flagLoadTimeouts.current[`main-${flagId}`]);
      delete flagLoadTimeouts.current[`main-${flagId}`];
      console.log(`Cleared main flag timeout for: ${flagId} due to error`);
    }
    
    // If this is the main flag, also clear the main loading state
    if (currentFlag && currentFlag.id === flagId) {
      setIsFlagLoading(false);
    }
    
    console.error(`Flag image failed to load: ${flagName} (ID: ${flagId})`);
  };

  const retryFlagLoad = (flagId) => {
    console.log(`Retrying flag load for: ${flagId}`);
    setFlagErrorStates(prev => ({
      ...prev,
      [flagId]: false
    }));
    setFlagLoadingStates(prev => ({
      ...prev,
      [flagId]: true
    }));
    
    // Set up a new timeout for the retry
    flagLoadTimeouts.current[flagId] = setTimeout(() => {
      console.log(`Retry timeout triggered for flag: ${flagId}`);
      handleFlagError(flagId, "Unknown");
    }, 8000);
  };

  const replaceFailedFlags = () => {
    console.log("Replacing failed flags with alternatives");
    
    // Check if the main flag (currentFlag) failed to load
    const mainFlagFailed = currentFlag && flagErrorStates[currentFlag.id];
    
    if (mainFlagFailed) {
      console.log("Main flag failed to load, replacing entire question");
      // If the main flag failed, we need to replace the entire question
      loadNextQuestion(null, null);
      return;
    }
    
    // Get current flags and determine which option flags failed
    const isRegionalMode = gameMode === "regional";
    const currentFlags = isRegionalMode ? currentGameFlagsRef.current : filteredFlags;
    const failedFlagIds = flagOptions.filter(flag => flagErrorStates[flag.id]).map(flag => flag.id);
    
    if (failedFlagIds.length === 0) {
      console.log("No failed flags to replace");
      return;
    }
    
    // Get the correct flag (the one that should be the answer)
    const correctFlag = currentFlag;
    
    // Get all available flags that haven't been used and aren't currently in the options
    const usedFlagIds = [...usedFlags, ...flagOptions.map(flag => flag.id)];
    const availableFlags = currentFlags.filter(flag => 
      !usedFlagIds.includes(flag.id) && 
      flag.id !== correctFlag.id &&
      !flagErrorStates[flag.id] // Don't use flags that have already failed
    );
    
    // If we don't have enough alternatives, we need to handle this case
    if (availableFlags.length < failedFlagIds.length) {
      console.log("Not enough alternative flags available, skipping question");
      // In this case, we have no choice but to skip the question
      loadNextQuestion(null, null);
      return;
    }
    
    // Create new flag options by replacing failed flags
    const newFlagOptions = [...flagOptions];
    const shuffledAvailableFlags = availableFlags.sort(() => Math.random() - 0.5);
    
    failedFlagIds.forEach((failedFlagId, index) => {
      const replacementFlag = shuffledAvailableFlags[index];
      if (replacementFlag) {
        // Find the index of the failed flag in the options
        const optionIndex = newFlagOptions.findIndex(flag => flag.id === failedFlagId);
        if (optionIndex !== -1) {
          // Replace the failed flag with the replacement
          newFlagOptions[optionIndex] = replacementFlag;
          
          // Clear error and loading states for the new flag
          setFlagErrorStates(prev => ({
            ...prev,
            [replacementFlag.id]: false
          }));
          setFlagLoadingStates(prev => ({
            ...prev,
            [replacementFlag.id]: true
          }));
          
          // Set up timeout for the new flag
          flagLoadTimeouts.current[replacementFlag.id] = setTimeout(() => {
            console.log(`Timeout triggered for replacement flag: ${replacementFlag.name} (ID: ${replacementFlag.id})`);
            handleFlagError(replacementFlag.id, replacementFlag.name);
          }, 8000);
        }
      }
    });
    
    // Update the flag options
    setFlagOptions(newFlagOptions);
    
    console.log(`Replaced ${failedFlagIds.length} failed flags with alternatives`);
  };

  const checkAnswer = (selectedAnswer) => {
    setTotalAttempts(prev => prev + 1);
    
    // Start timer on first guess in Time Attack mode
    if (timeAttackMode && !firstGuessMade) {
      console.log('Starting Time Attack timer on first guess');
      setFirstGuessMade(true);
      setTimerStarted(true);
    }
    
    let isCorrect = false;
    
    // Determine current game type based on mode
    const isRegionalMode = gameMode === "regional";
    const currentGameType = isRegionalMode ? regionalGameType : gameType;
    
    // Get the current flags for the game
    const currentFlags = isRegionalMode ? currentGameFlagsRef.current : filteredFlags;
    
    if (currentGameType === "flag-to-country" || currentGameType === "flag-to-region") {
      // Check if selected name matches current flag
      isCorrect = selectedAnswer === currentFlag.name;
    } else {
      // Check if selected flag matches current name
      isCorrect = selectedAnswer === currentFlag.id;
    }
    
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
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
      // Handle incorrect answer
      if (timeAttackMode) {
        // In Time Attack mode, deduct 5 seconds from remaining time
        const newTime = Math.max(0, timeRemaining - 5);
        console.log(`Time Attack: Incorrect answer. Time remaining: ${timeRemaining}s -> ${newTime}s`);
        setTimeRemaining(newTime);
        
        // Check if this incorrect answer caused the timer to reach 0
        if (newTime === 0) {
          setMessage("⏰ Time's up! -5 seconds");
          // The timer effect will handle the game end
        } else {
          setMessage("Incorrect! -5 seconds");
        }
        
        setButtonStyles({
          [selectedAnswer]: styles.incorrectButton
        });
        setTimeout(() => {
          setButtonStyles({});
        }, 1000);
      } else {
        // Standard mode - use health system
        if (health > 1) {
          setHealth(health - 1);
          setMessage("Incorrect! Try again.");
          setButtonStyles({
            [selectedAnswer]: styles.incorrectButton
          });
          setTimeout(() => {
            setButtonStyles({});
          }, 1000);
        } else {
          // Game Over - Ran out of hearts
          const gameEndTime = new Date().getTime();
          const timeElapsed = gameEndTime - gameStartTime;
          const finalAttempts = totalAttempts + 1;
          const accuracy = finalAttempts > 0 ? ((score / finalAttempts) * 100).toFixed(1) : 0;
          
          setGameStats({
            score: score,
            totalAttempts: finalAttempts,
            accuracy: accuracy,
            timeElapsed: timeElapsed,
            endState: "ranOutOfHearts",
            gameType: currentGameType,
            gameSettings: buildGameSettings(),
            totalFlags: getTotalFlagsCount(),
            remainingFlags: getRemainingFlagsCount()
          });
          setEndState("ranOutOfHearts");
          setHealth(0);
          setGameStarted(false);
          setShowEndScreen(true);
        }
      }
    }
  };

  // Function to fetch regional flags for the selected country and division types
  const fetchRegionalFlags = async () => {
    if (!selectedRegionalCountry || selectedDivisionTypes.length === 0) {
      console.error("No country or division types selected for regional flags");
      setMessage("Please select a country and division types first.");
      return null;
    }

    setIsLoadingRegionalFlags(true);
    
    try {
      // Use the new smart loadFlags function
      const regionalFlags = await loadFlags({
        gameType: "regional",
        selectedCountryId: selectedRegionalCountry.id,
        selectedDivisionTypes: selectedDivisionTypes
      });
      
      if (regionalFlags.length === 0) {
        setMessage(`No regional flags found for ${selectedRegionalCountry.name} with the selected division types.`);
        setRegionalFlags([]);
        setFilteredRegionalFlags([]);
        return null;
      }
      
      setRegionalFlags(regionalFlags);
      setFilteredRegionalFlags(regionalFlags);
      
      console.log(`Loaded ${regionalFlags.length} regional flags for ${selectedRegionalCountry.name}`);
      return regionalFlags;
    } catch (error) {
      console.error("Error fetching regional flags:", error);
      setMessage("Error loading regional flags. Please try again.");
      setRegionalFlags([]);
      setFilteredRegionalFlags([]);
      return null;
    } finally {
      setIsLoadingRegionalFlags(false);
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

  // Helper function to get total flags count
  const getTotalFlagsCount = () => {
    const isRegionalMode = gameMode === "regional";
    if (isRegionalMode) {
      return regionalFlags.length || 0;
    } else {
      return filteredFlags.length || 0;
    }
  };

  // Helper function to get remaining flags count
  const getRemainingFlagsCount = () => {
    const totalFlags = getTotalFlagsCount();
    return totalFlags - usedFlags.length;
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
                      setSelectedContinent("world");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="Africa"
                    isSelected={selectedContinent === "1"}
                    onClick={() => {
                      setSelectedContinent("1");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="Asia"
                    isSelected={selectedContinent === "2"}
                    onClick={() => {
                      setSelectedContinent("2");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="Europe"
                    isSelected={selectedContinent === "3"}
                    onClick={() => {
                      setSelectedContinent("3");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="North America"
                    isSelected={selectedContinent === "4"}
                    onClick={() => {
                      setSelectedContinent("4");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="South America"
                    isSelected={selectedContinent === "5"}
                    onClick={() => {
                      setSelectedContinent("5");
                      setMenuStep(3);
                    }}
                  />
                  <ContinentButton
                    label="Oceania"
                    isSelected={selectedContinent === "6"}
                    onClick={() => {
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
                    onClick={() => setIncludeTerritories(!includeTerritories)}
                  />
                  <MenuButton
                    type="setting"
                    icon="⏱️"
                    label="Time Attack Mode"
                    description="Race against the clock"
                    isSelected={timeAttackMode}
                    onClick={() => {
                      setTimeAttackMode(!timeAttackMode);
                      if (!timeAttackMode) {
                        setInfiniteMode(true); // Auto-enable infinite mode
                      }
                    }}
                  />
                  <MenuButton
                    type="setting"
                    icon="♾️"
                    label="Infinite Mode"
                    description="Play endlessly without running out of flags"
                    isSelected={infiniteMode}
                    onClick={() => setInfiniteMode(!infiniteMode)}
                    disabled={timeAttackMode} // Disable when time attack is enabled
                  />
                </div>
                <div className={styles.settingsButtons}>
                  <ActionButton onClick={startGame}>
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
                        onClick={() => window.location.reload()}
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
                      onClick={() => setMenuStep("regional-4")}
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
                    description="Race against the clock"
                    isSelected={timeAttackMode}
                    onClick={() => {
                      setTimeAttackMode(!timeAttackMode);
                      if (!timeAttackMode) {
                        setRegionalInfiniteMode(true); // Auto-enable infinite mode
                      }
                    }}
                  />
                  <MenuButton
                    type="setting"
                    icon="♾️"
                    label="Infinite Mode"
                    description="Play endlessly without running out of flags"
                    isSelected={regionalInfiniteMode}
                    onClick={() => setRegionalInfiniteMode(!regionalInfiniteMode)}
                    disabled={timeAttackMode} // Disable when time attack is enabled
                  />
                </div>
                <div className={styles.settingsButtons}>
                  <ActionButton onClick={startGame}>
                    Start Game
                  </ActionButton>
                </div>
              </div>
            )}
            </div>
          </div>
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
                    🌍
                  </span>
                ))}
              </div>
            )}
            {(infiniteMode || regionalInfiniteMode) && !timeAttackMode && (
              <button
                className={`${styles.button} ${styles.endGameButton}`}
                onClick={endInfiniteMode}
                title="End Game"
              >
                🏁 End
              </button>
            )}
          </div>
  
          {currentFlag && (
            <div className={`${styles.flagContainer} ${flagTransitioning ? styles.transitioning : ''}`}>
              {(gameType === "flag-to-country" || regionalGameType === "flag-to-region") ? (
                // Show flag image for flag-to-country or flag-to-region mode
                <>
                  {isFlagLoading && !flagErrorStates[currentFlag.id] && <div className={styles.loadingSpinner}></div>}
                  {flagErrorStates[currentFlag.id] ? (
                    <div className={styles.flagErrorPlaceholder}>
                      <span role="img" aria-label="Flag failed to load">❌</span>
                      <span className={styles.flagErrorText}>Failed to load</span>
                      <div className={styles.flagErrorActions}>
                        <button
                          className={styles.retryButton}
                          onClick={() => retryFlagLoad(currentFlag.id)}
                          title="Retry loading flag"
                        >
                          🔄
                        </button>
                        <button
                          className={`${styles.button} ${styles.skipButton}`}
                          onClick={replaceFailedFlags}
                          title="Replace with different flag"
                        >
                          🔄 Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={currentFlag.image_url}
                      alt={currentFlag.name}
                      className={`${styles.flagImage} ${flagTransitioning ? styles.transitioning : ''}`}
                      onLoad={() => handleFlagLoad(currentFlag.id)}
                      onError={() => handleFlagError(currentFlag.id, currentFlag.name)}
                      style={{ display: isFlagLoading ? 'none' : 'block' }}
                    />
                  )}
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
              // Show flag images as buttons for country-to-flag or region-to-flag mode
              <>
                {flagOptions.map((flag, index) => (
                  <button
                    key={index}
                    onClick={() => checkAnswer(flag.id)}
                    className={`${styles.button} ${styles.flagGuessButton} ${styles.optionsTransition} ${buttonStyles[flag.id] || ''} ${optionsTransitioning ? styles.transitioning : ''}`}
                    disabled={buttonsDisabled || flagLoadingStates[flag.id] || flagErrorStates[flag.id]}
                  >
                    {flagLoadingStates[flag.id] && !flagErrorStates[flag.id] && (
                      <div className={styles.flagLoadingSpinner}></div>
                    )}
                    {flagErrorStates[flag.id] ? (
                      <div className={styles.flagErrorPlaceholder}>
                        <span role="img" aria-label="Flag failed to load">❌</span>
                        <span className={styles.flagErrorText}>Failed to load</span>
                        <button
                          className={styles.retryButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            retryFlagLoad(flag.id);
                          }}
                          title="Retry loading flag"
                        >
                          🔄
                        </button>
                      </div>
                    ) : (
                      <img
                        src={flag.image_url}
                        alt={flag.name}
                        onLoad={() => handleFlagLoad(flag.id)}
                        onError={() => handleFlagError(flag.id, flag.name)}
                        style={{
                          opacity: flagLoadingStates[flag.id] ? 0 : 1,
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                    )}
                  </button>
                ))}
                {/* Show replace button if any flag failed to load */}
                {flagOptions.some(flag => flagErrorStates[flag.id]) && (
                  <button
                    className={`${styles.button} ${styles.skipButton}`}
                    onClick={replaceFailedFlags}
                    title="Replace failed flags with working alternatives"
                  >
                    🔄 Replace Failed
                  </button>
                )}
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
                {endState === "allCompleted" ? (
                  <>
                    <div className={styles.quickStatValue}>{Math.floor(gameStats.timeElapsed / 1000)}s</div>
                    <div className={styles.quickStatLabel}>Completion Time</div>
                  </>
                ) : endState === "ranOutOfHearts" ? (
                  <>
                    <div className={styles.quickStatValue}>{gameStats.accuracy}%</div>
                    <div className={styles.quickStatLabel}>Accuracy</div>
                  </>
                ) : endState === "timeAttack" ? (
                  <>
                    <div className={styles.quickStatValue}>{gameStats.totalAttempts}</div>
                    <div className={styles.quickStatLabel}>Total Attempts</div>
                  </>
                ) : (infiniteMode || regionalInfiniteMode) ? (
                  <>
                    <div className={styles.quickStatValue}>{gameStats.totalAttempts}</div>
                    <div className={styles.quickStatLabel}>Total Attempts</div>
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
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⏱️</div>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Time Elapsed</span>
                    <span className={styles.statValue}>
                      {Math.floor(gameStats.timeElapsed / 1000)}s
                    </span>
                  </div>
                </div>
                {endState === "allCompleted" && (
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏁</div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Completion Time</span>
                      <span className={styles.statValue}>
                        {Math.floor(gameStats.timeElapsed / 1000)}s
                      </span>
                    </div>
                  </div>
                )}
                {!(gameMode === "regional" ? regionalInfiniteMode : infiniteMode) && endState === "ranOutOfHearts" && (
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🚩</div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Remaining</span>
                      <span className={styles.statValue}>
                        {gameStats.remainingFlags !== undefined ? gameStats.remainingFlags : getRemainingFlagsCount()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.endScreenActions}>
              <button
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={() => {
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
                  // Hide the end screen and clear game state immediately
                  setShowEndScreen(false);
                  setGameStats({});
                  setEndState(null);
                  setGameStarted(false);
                  
                  // Wait a moment to ensure state updates are processed
                  await new Promise(resolve => setTimeout(resolve, 50));
                  
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
    </div>
  );
};

export default Site1;
