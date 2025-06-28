import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/site1.module.css";

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

  // New state for minimal menu flow
  const [menuStep, setMenuStep] = useState(1); // 1: GameType, 2: Continent, 3: Settings
  const [gameType, setGameType] = useState(null); // "flag-to-country" or "country-to-flag"

  useEffect(() => {
    const fetchFlags = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("flags")
        .select(`
          id,
          name,
          territory,
          image_url,
          country_continent(
            continent_id
          ),
          continents(
            name
          )
        `);

      if (error) {
        console.error("Error fetching flags:", error);
        setMessage("Error loading flags. Please try again.");
      } else {
        setFlags(data);
        setFilteredFlags(data);
      }
      setIsLoading(false);
    };

    fetchFlags();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = flags;

      if (selectedContinent !== "world") {
        filtered = filtered.filter((flag) => {
          const continentIds = flag.country_continent.map((cc) => cc.continent_id);
          return continentIds.includes(Number(selectedContinent));
        });
      }

      if (!includeTerritories) {
        filtered = filtered.filter((flag) => !flag.territory);
      }

      setFilteredFlags(filtered);
    };

    applyFilters();
  }, [selectedContinent, includeTerritories, flags]);

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
    if (gameType === "country-to-flag" && flagOptions.length > 0) {
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
          }, 5000); // 5 seconds
        }
      });
    }
  };

  // Set up timeouts when flagOptions changes (but not when loading states change)
  useEffect(() => {
    if (gameType === "country-to-flag" && flagOptions.length > 0) {
      // Use setTimeout to ensure this runs after the current render cycle
      setTimeout(() => {
        setupFlagTimeouts();
      }, 0);
    }
  }, [flagOptions, gameType]); // Only depend on flagOptions and gameType, not loading states

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
      gameType: gameType
    });
    setEndState("infiniteMode");
    setGameStarted(false);
    setShowEndScreen(true);
  };

  const startGame = () => {
    if (!gameStarted) {
      setScore(0);
      setHealth(3);
      setMessage("");
      setGameStarted(true);
      setUsedFlags([]);
      setGameStartTime(new Date().getTime());
      setTotalAttempts(0);
      setShowEndScreen(false);
      setEndState(null);
      // Clear flag loading and error states when starting a new game
      setFlagLoadingStates({});
      setFlagErrorStates({});
      // Clear any existing timeouts
      Object.values(flagLoadTimeouts.current).forEach(timeout => clearTimeout(timeout));
      flagLoadTimeouts.current = {};
      console.log('Cleared all flag loading timeouts for new game');
    }
  
    if (filteredFlags.length === 0) {
      setMessage("No flags available for selected filters.");
      return;
    }

    if (!infiniteMode && usedFlags.length >= filteredFlags.length) {
      const gameEndTime = new Date().getTime();
      const timeElapsed = gameEndTime - gameStartTime;
      setGameStats({
        score: score,
        totalAttempts: totalAttempts,
        accuracy: totalAttempts > 0 ? ((score / totalAttempts) * 100).toFixed(1) : 0,
        timeElapsed: timeElapsed,
        remainingFlags: 0,
        endState: "allCompleted",
        gameType: gameType
      });
      setEndState("allCompleted");
      setGameStarted(false);
      setShowEndScreen(true);
      return;
    }
  
    setMessage("");
    setIsFlagLoading(true);
    let availableFlags = infiniteMode ? filteredFlags : filteredFlags.filter(flag => !usedFlags.includes(flag.id));
    const randomFlag = availableFlags[Math.floor(Math.random() * availableFlags.length)];
    setCurrentFlag(randomFlag);
    setUsedFlags([...usedFlags, randomFlag.id]);
    
    if (gameType === "flag-to-country") {
      // Original mode: show flag, guess country
      const correctCountry = randomFlag.name;
      let incorrectCountries = filteredFlags.filter((flag) => flag.name !== correctCountry);
      incorrectCountries = incorrectCountries.sort(() => Math.random() - 0.5).slice(0, 3);
    
      const allCountries = [correctCountry, ...incorrectCountries.map((flag) => flag.name)];
      const shuffledCountries = allCountries.sort(() => Math.random() - 0.5);
    
      setOptions(shuffledCountries);
      setFlagOptions([]); // Clear flag options for this mode
      setFlagLoadingStates({}); // Clear loading states
    } else {
      // New mode: show country, guess flag
      const correctFlag = randomFlag;
      let incorrectFlags = filteredFlags.filter((flag) => flag.id !== correctFlag.id);
      incorrectFlags = incorrectFlags.sort(() => Math.random() - 0.5).slice(0, 3);
    
      const allFlags = [correctFlag, ...incorrectFlags];
      const shuffledFlags = allFlags.sort(() => Math.random() - 0.5);
    
      setFlagOptions(shuffledFlags);
      setOptions([]); // Clear country options for this mode
      
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
    // Only clear timeout if it still exists
    if (flagLoadTimeouts.current[flagId]) {
      clearTimeout(flagLoadTimeouts.current[flagId]);
      delete flagLoadTimeouts.current[flagId];
      console.log(`Cleared timeout for flag: ${flagId}`);
    } else {
      console.log(`No timeout found for flag: ${flagId} (already cleared or never set)`);
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
    // Only clear timeout if it still exists
    if (flagLoadTimeouts.current[flagId]) {
      clearTimeout(flagLoadTimeouts.current[flagId]);
      delete flagLoadTimeouts.current[flagId];
      console.log(`Cleared timeout for flag: ${flagId} due to error`);
    } else {
      console.log(`No timeout found for flag: ${flagId} (already cleared or never set)`);
    }
    console.error(`Flag image failed to load: ${flagName} (ID: ${flagId})`);
  };

  const checkAnswer = (selectedAnswer) => {
    setTotalAttempts(prev => prev + 1);
    
    let isCorrect = false;
    
    if (gameType === "flag-to-country") {
      // Check if selected country matches current flag
      isCorrect = selectedAnswer === currentFlag.name;
    } else {
      // Check if selected flag matches current country
      isCorrect = selectedAnswer === currentFlag.id;
    }
    
    if (isCorrect) {
      setScore(score + 1);
      setScoreAnimation(true);
      setMessage("Correct!");
      setButtonsDisabled(true);
      setButtonStyles({ 
        [selectedAnswer]: styles.correctButton
      });
      setTimeout(() => {
        setScoreAnimation(false);
        startGame();
        setButtonStyles({});
        setButtonsDisabled(false);
      }, 1000);
    } else {
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
          gameType: gameType
        });
        setEndState("ranOutOfHearts");
        setHealth(0);
        setGameStarted(false);
        setShowEndScreen(true);
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
          <div className={styles.menuContainer}>
            {menuStep === 1 && (
              <div className={styles.gameTypeSection}>
                <div className={styles.gameTypeGrid}>
                  <button
                    className={`${styles.gameTypeButton} ${gameType === "flag-to-country" ? styles.selectedGameType : ""}`}
                    onClick={() => {
                      setGameType("flag-to-country");
                      setMenuStep(2);
                    }}
                    aria-label="Guess Country"
                  >
                    <span className={styles.settingIcon}>🎯</span>
                    <span className={styles.settingLabel}>Flag to Country</span>
                    <span className={styles.settingDescription}>Guess the country name from the flag</span>
                  </button>
                  <button
                    className={`${styles.gameTypeButton} ${gameType === "country-to-flag" ? styles.selectedGameType : ""}`}
                    onClick={() => {
                      setGameType("country-to-flag");
                      setMenuStep(2);
                    }}
                    aria-label="Guess Flag"
                  >
                    <span className={styles.settingIcon}>🗺️</span>
                    <span className={styles.settingLabel}>Country to Flag</span>
                    <span className={styles.settingDescription}>Guess the flag from the country name</span>
                  </button>
                </div>
              </div>
            )}
            {menuStep === 2 && (
              <div className={styles.continentSection}>
                <div className={styles.continentGrid}>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "world" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("world");
                      setMenuStep(3);
                    }}
                  >
                    <span className={styles.continentLabel}>World</span>
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "1" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("1");
                      setMenuStep(3);
                    }}
                  >
                    <span className={styles.continentLabel}>Africa</span>
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "2" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("2");
                      setMenuStep(3);
                    }}
                  >
                    <span className={styles.continentLabel}>Asia</span>
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "3" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("3");
                      setMenuStep(3);
                    }}
                  >
                    <span className={styles.continentLabel}>Europe</span>
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "4" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("4");
                      setMenuStep(3);
                    }}
                  >
                    <span className={styles.continentLabel}>North America</span>
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "5" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("5");
                      setMenuStep(3);
                    }}
                  >
                    <span className={styles.continentLabel}>South America</span>
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "6" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("6");
                      setMenuStep(3);
                    }}
                  >
                    <span className={styles.continentLabel}>Oceania</span>
                  </button>
                </div>
                <div className={styles.settingsButtons}>
                  <button
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={() => setMenuStep(1)}
                    aria-label="Back"
                  >
                    ←
                  </button>
                </div>
              </div>
            )}
            {menuStep === 3 && (
              <div className={styles.settingsSection}>
                <div className={styles.settingsGrid}>
                  <button
                    type="button"
                    className={`${styles.settingOption} ${includeTerritories ? styles.settingOptionActive : ''}`}
                    onClick={() => setIncludeTerritories(!includeTerritories)}
                    aria-pressed={includeTerritories}
                  >
                    <span className={styles.settingIcon}>🏝️</span>
                    <span className={styles.settingLabel}>Include Territories</span>
                    <span className={styles.settingDescription}>Play with territories and dependencies</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.settingOption} ${infiniteMode ? styles.settingOptionActive : ''}`}
                    onClick={() => setInfiniteMode(!infiniteMode)}
                    aria-pressed={infiniteMode}
                  >
                    <span className={styles.settingIcon}>♾️</span>
                    <span className={styles.settingLabel}>Infinite Mode</span>
                    <span className={styles.settingDescription}>Play endlessly without running out of flags</span>
                  </button>
                </div>
                <div className={styles.settingsButtons}>
                  <button
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={() => setMenuStep(2)}
                    aria-label="Back"
                  >
                    ←
                  </button>
                  <button
                    className={`${styles.button} ${styles.mainButton}`}
                    onClick={startGame}
                  >
                    Start Game
                  </button>
                </div>
              </div>
            )}
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
            {infiniteMode && (
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
            <div className={styles.flagContainer}>
              {gameType === "flag-to-country" ? (
                // Show flag image for flag-to-country mode
                <>
                  {isFlagLoading && <div className={styles.loadingSpinner}></div>}
                  <img
                    src={currentFlag.image_url}
                    alt={currentFlag.name}
                    className={styles.flagImage}
                    onLoad={() => setIsFlagLoading(false)}
                    style={{ display: isFlagLoading ? 'none' : 'block' }}
                  />
                </>
              ) : (
                // Show country name for country-to-flag mode
                <div key={currentFlag.name} className={styles.countryText}>
                  {currentFlag.name}
                </div>
              )}
            </div>
          )}
  
          <div className={styles.optionsContainer}>
            {gameType === "flag-to-country" ? (
              // Show country names as buttons for flag-to-country mode
              options.map((country, index) => (
                <button
                  key={index}
                  onClick={() => checkAnswer(country)}
                  className={`${styles.button} ${styles.guessButton} ${buttonStyles[country] || ''}`}
                  disabled={buttonsDisabled}
                >
                  {country}
                </button>
              ))
            ) : (
              // Show flag images as buttons for country-to-flag mode
              <>
                {flagOptions.map((flag, index) => (
                  <button
                    key={index}
                    onClick={() => checkAnswer(flag.id)}
                    className={`${styles.button} ${styles.flagGuessButton} ${buttonStyles[flag.id] || ''}`}
                    disabled={buttonsDisabled || flagLoadingStates[flag.id] || flagErrorStates[flag.id]}
                  >
                    {flagLoadingStates[flag.id] && !flagErrorStates[flag.id] && (
                      <div className={styles.flagLoadingSpinner}></div>
                    )}
                    {flagErrorStates[flag.id] ? (
                      <div className={styles.flagErrorPlaceholder}>
                        <span role="img" aria-label="Flag failed to load">❌</span>
                        <span className={styles.flagErrorText}>Failed to load</span>
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
                {/* Show skip button if any flag failed to load */}
                {flagOptions.some(flag => flagErrorStates[flag.id]) && (
                  <button
                    className={`${styles.button} ${styles.skipButton}`}
                    onClick={startGame}
                  >
                    Skip
                  </button>
                )}
              </>
            )}
          </div>
  
          {message && (
            <p className={`${styles.message} ${
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
            </div>

            <div className={styles.gameSettings}>
              <h3>Game Settings</h3>
              <div className={styles.settingsInfo}>
                <div className={styles.settingItem}>
                  <span className={styles.endScreenSettingLabel}>Game Type:</span>
                  <span className={styles.endScreenSettingValue}>
                    {gameStats.gameType === "flag-to-country" ? "Flag → Country" : 
                     gameStats.gameType === "country-to-flag" ? "Country → Flag" : "Unknown"}
                  </span>
                </div>
                <div className={styles.settingItem}>
                  <span className={styles.endScreenSettingLabel}>Region:</span>
                  <span className={styles.endScreenSettingValue}>
                    {selectedContinent === "world" ? "World" :
                     selectedContinent === "1" ? "Africa" :
                     selectedContinent === "2" ? "Asia" :
                     selectedContinent === "3" ? "Europe" :
                     selectedContinent === "4" ? "North America" :
                     selectedContinent === "5" ? "South America" :
                     selectedContinent === "6" ? "Oceania" : "Unknown"}
                  </span>
                </div>
                <div className={styles.settingItem}>
                  <span className={styles.endScreenSettingLabel}>Territories:</span>
                  <span className={styles.endScreenSettingValue}>
                    {includeTerritories ? "Included" : "Excluded"}
                  </span>
                </div>
                <div className={styles.settingItem}>
                  <span className={styles.endScreenSettingLabel}>Mode:</span>
                  <span className={styles.endScreenSettingValue}>
                    {infiniteMode ? "Infinite" : "Standard"}
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
                {!infiniteMode && endState === "ranOutOfHearts" && (
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🚩</div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Remaining</span>
                      <span className={styles.statValue}>
                        {filteredFlags.length - usedFlags.length}
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
                  setStartScreenStep(1);
                }}
              >
                New Game
              </button>
              <button
                className={`${styles.button} ${styles.mainButton}`}
                onClick={() => {
                  setShowEndScreen(false);
                  startGame();
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
