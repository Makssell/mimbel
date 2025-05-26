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
      setMessage("Correct!");
      setButtonsDisabled(true);
      setButtonStyles({ 
        [selectedCountry]: styles.correctButton
      });
      setTimeout(() => {
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
          <h1 className={styles.title}>Flag Guesser</h1>
          
          <div className={styles.menuContainer}>
            <div className={styles.continentSection}>
              <h2>Select Region</h2>
              <div className={styles.continentGrid}>
                <button
                  className={`${styles.continentButton} ${selectedContinent === "world" ? styles.selectedContinent : ""}`}
                  onClick={() => setSelectedContinent("world")}
                >
                  World
                </button>
                <button
                  className={`${styles.continentButton} ${selectedContinent === "1" ? styles.selectedContinent : ""}`}
                  onClick={() => setSelectedContinent("1")}
                >
                  Africa
                </button>
                <button
                  className={`${styles.continentButton} ${selectedContinent === "2" ? styles.selectedContinent : ""}`}
                  onClick={() => setSelectedContinent("2")}
                >
                  Asia
                </button>
                <button
                  className={`${styles.continentButton} ${selectedContinent === "3" ? styles.selectedContinent : ""}`}
                  onClick={() => setSelectedContinent("3")}
                >
                  Europe
                </button>
                <button
                  className={`${styles.continentButton} ${selectedContinent === "4" ? styles.selectedContinent : ""}`}
                  onClick={() => setSelectedContinent("4")}
                >
                  North America
                </button>
                <button
                  className={`${styles.continentButton} ${selectedContinent === "5" ? styles.selectedContinent : ""}`}
                  onClick={() => setSelectedContinent("5")}
                >
                  South America
                </button>
                <button
                  className={`${styles.continentButton} ${selectedContinent === "6" ? styles.selectedContinent : ""}`}
                  onClick={() => setSelectedContinent("6")}
                >
                  Oceania
                </button>
              </div>
            </div>

            <div className={styles.settingsSection}>
              <h2>Game Settings</h2>
              <div className={styles.settingsGrid}>
                <label className={styles.settingOption}>
                  <input
                    type="checkbox"
                    checked={includeTerritories}
                    onChange={() => setIncludeTerritories(!includeTerritories)}
                    className={styles.checkbox}
                  />
                  Include Territories
                </label>
                <label className={styles.settingOption}>
                  <input
                    type="checkbox"
                    checked={infiniteMode}
                    onChange={() => setInfiniteMode(!infiniteMode)}
                    className={styles.checkbox}
                  />
                  Infinite Mode
                </label>
              </div>
            </div>

            <button
              className={`${styles.button} ${styles.mainButton}`}
              onClick={startGame}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
  
      {gameStarted && (
        <>
          <div className={styles.gameInfo}>
            <div className={styles.score}>Score: {score}</div>
            <div className={styles.health}>
              {Array.from({ length: 3 }).map((_, index) => (
                <span 
                  key={index} 
                  className={`${styles.heart} ${health > index ? styles.activeHeart : styles.inactiveHeart}`}
                >
                  ♥
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
