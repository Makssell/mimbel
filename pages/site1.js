import { useEffect, useState } from "react";
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

  const startGame = () => {
    if (!gameStarted) {
      setScore(0);
      setHealth(3);
      setMessage("");
      setGameStarted(true);
      setUsedFlags([]);
    }
  
    if (filteredFlags.length === 0) {
      setMessage("No flags available for selected filters.");
      return;
    }

    if (!infiniteMode && usedFlags.length >= filteredFlags.length) {
      setMessage(`Game Over! You've seen all flags! Final score: ${score}`);
      setGameStarted(false);
      return;
    }
  
    setMessage("");
    setIsFlagLoading(true);
    let availableFlags = infiniteMode ? filteredFlags : filteredFlags.filter(flag => !usedFlags.includes(flag.id));
    const randomFlag = availableFlags[Math.floor(Math.random() * availableFlags.length)];
    setCurrentFlag(randomFlag);
    setUsedFlags([...usedFlags, randomFlag.id]);
    
    const correctCountry = randomFlag.name;
    let incorrectCountries = filteredFlags.filter((flag) => flag.name !== correctCountry);
    incorrectCountries = incorrectCountries.sort(() => Math.random() - 0.5).slice(0, 3);
  
    const allCountries = [correctCountry, ...incorrectCountries.map((flag) => flag.name)];
    const shuffledCountries = allCountries.sort(() => Math.random() - 0.5);
  
    setOptions(shuffledCountries);
  };

  const checkAnswer = (selectedCountry) => {
    if (selectedCountry === currentFlag.name) {
      setScore(score + 1);
      setScoreAnimation(true);
      setMessage("Correct!");
      setButtonsDisabled(true);
      setButtonStyles({ 
        [selectedCountry]: styles.correctButton
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
      } else {
        setMessage(`Game Over! Score: ${score}`);
        setHealth(0);
        setGameStarted(false);
      }
      setButtonStyles({
        [selectedCountry]: styles.incorrectButton
      });
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
            {startScreenStep === 1 ? (
              <div className={styles.continentSection}>
              
                <div className={styles.continentGrid}>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "world" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("world");
                      setStartScreenStep(2);
                    }}
                  >
                    World
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "1" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("1");
                      setStartScreenStep(2);
                    }}
                  >
                    Africa
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "2" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("2");
                      setStartScreenStep(2);
                    }}
                  >
                    Asia
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "3" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("3");
                      setStartScreenStep(2);
                    }}
                  >
                    Europe
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "4" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("4");
                      setStartScreenStep(2);
                    }}
                  >
                    North America
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "5" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("5");
                      setStartScreenStep(2);
                    }}
                  >
                    South America
                  </button>
                  <button
                    className={`${styles.continentButton} ${selectedContinent === "6" ? styles.selectedContinent : ""}`}
                    onClick={() => {
                      setSelectedContinent("6");
                      setStartScreenStep(2);
                    }}
                  >
                    Oceania
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.settingsSection}>
                
                <div className={styles.settingsGrid}>
                  <div 
                    className={`${styles.settingOption} ${includeTerritories ? styles.settingOptionActive : ''}`}
                    onClick={() => setIncludeTerritories(!includeTerritories)}
                  >
                    <span>Include Territories</span>
                  </div>
                  <div 
                    className={`${styles.settingOption} ${infiniteMode ? styles.settingOptionActive : ''}`}
                    onClick={() => setInfiniteMode(!infiniteMode)}
                  >
                    <span>Infinite Mode</span>
                  </div>
                </div>
                <div className={styles.settingsButtons}>
                  <button
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={() => setStartScreenStep(1)}
                  >
                    Back
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
                  title={`${health > index ? 'Active' : 'Lost'} shield`}
                >
                  ⚔
                </span>
              ))}
            </div>
          </div>
  
          {currentFlag && (
            <div className={styles.flagContainer}>
              {isFlagLoading && <div className={styles.loadingSpinner}></div>}
              <img
                src={currentFlag.image_url}
                alt={currentFlag.name}
                className={styles.flagImage}
                onLoad={() => setIsFlagLoading(false)}
                style={{ display: isFlagLoading ? 'none' : 'block' }}
              />
            </div>
          )}
  
          <div className={styles.optionsContainer}>
            {options.map((country, index) => (
              <button
                key={index}
                onClick={() => checkAnswer(country)}
                className={`${styles.button} ${styles.guessButton} ${buttonStyles[country] || ''}`}
                disabled={buttonsDisabled}
              >
                {country}
              </button>
            ))}
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
    </div>
  );
};

export default Site1;
