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
  const [continent, setContinent] = useState(""); 
  const [includeTerritories, setIncludeTerritories] = useState(false); 
  const [health, setHealth] = useState(3); 
  const [gameStarted, setGameStarted] = useState(false); 
  const [buttonsDisabled, setButtonsDisabled] = useState(false); // New state
  const [buttonStyles, setButtonStyles] = useState({});  // New state to store button styles


  useEffect(() => {
    const fetchFlags = async () => {
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
      } else {
        setFlags(data);
        setFilteredFlags(data); 
      }
    };

    fetchFlags();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = flags;

      if (continent) {
        filtered = filtered.filter((flag) => {
          const continentIds = flag.country_continent.map((cc) => cc.continent_id);
          return continentIds.includes(Number(continent));
        });
      }

      if (!includeTerritories) {
        filtered = filtered.filter((flag) => !flag.territory);
      }

      setFilteredFlags(filtered);
    };

    applyFilters();
  }, [continent, includeTerritories, flags]);

  const startGame = () => {
    if (!gameStarted) {
      setScore(0);
      setHealth(3);
      setMessage("");  // Reset message when starting the game
      setGameStarted(true);
    }
  
    if (filteredFlags.length === 0) {
      setMessage("No flags available for selected filters.");
      return;
    }
  
    // Reset the message when a new flag is loaded
    setMessage("");
  
    const randomFlag = filteredFlags[Math.floor(Math.random() * filteredFlags.length)];
    setCurrentFlag(randomFlag);
    const correctCountry = randomFlag.name;
    let incorrectCountries = filteredFlags.filter((flag) => flag.name !== correctCountry);
    incorrectCountries = incorrectCountries.sort(() => Math.random() - 0.5).slice(0, 3);
  
    const allCountries = [correctCountry, ...incorrectCountries.map((flag) => flag.name)];
    const shuffledCountries = allCountries.sort(() => Math.random() - 0.5);
  
    setOptions(shuffledCountries);
  };

  const giveUp = () => {
    setMessage(`You gave up! Final score: ${score}`);
    setGameStarted(false);
  };

  const checkAnswer = (selectedCountry) => {
    if (selectedCountry === currentFlag.name) {
      setScore(score + 1);
      setMessage("Correct!");
      setButtonsDisabled(true);  // Disable buttons after answer
      setButtonStyles({ 
        [selectedCountry]: 'correct' // Style selected button as correct
      });
      setTimeout(() => {
        startGame();  // Load next flag
        setButtonStyles({});  // Reset button styles for next round
        setButtonsDisabled(false);  // Re-enable buttons
      }, 1000);
    } else {
      setMessage("Incorrect! Try again.");
      if (health > 1) {
        setHealth(health - 1);
      } else {
        setMessage(`Game Over! Final score: ${score}`);
        setHealth(0); 
        setGameStarted(false); 
      }
      setButtonStyles({
        [selectedCountry]: 'incorrect' // Style selected button as incorrect
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Show title only if the game is not started */}
      {!gameStarted && (
        <h1 className={styles.title}>Guess the Flag</h1>
      )}
  
      <div className={styles.scoreAndHealth}>
        <p className={styles.score}>Score: {score}</p>
        <div className={styles.health}>
          <h3>Health:</h3>
          <div>
            {Array.from({ length: 3 }).map((_, index) => (
              <span key={index} style={{ color: health > index ? "red" : "gray" }}>
                ♥
              </span>
            ))}
          </div>
        </div>
      </div>
  
      {!gameStarted && (
        <div className={styles.selectContainer}>
          <select
            className={styles.dropdown}
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
          >
            <option value="">World</option>
            <option value="1">Africa</option>
            <option value="2">Asia</option>
            <option value="3">Europe</option>
            <option value="4">North America</option>
            <option value="5">South America</option>
            <option value="6">Oceania</option>
          </select>
  
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeTerritories}
              onChange={() => setIncludeTerritories(!includeTerritories)}
              className={styles.checkbox}
            />
            Include Territories
          </label>
        </div>
      )}
  
      <button
        className={styles.button}
        onClick={gameStarted ? giveUp : startGame}
      >
        {gameStarted ? "Give Up" : "Start Game"}
      </button>
  
      {currentFlag && gameStarted && (
        <div className={styles.flagContainer}>
          <h3>Which country does this flag belong to?</h3>
          <img
            src={currentFlag.image_url}
            alt={currentFlag.name}
            width="300"
          />
        </div>
      )}
  
      {gameStarted && (
        <div className={styles.optionsContainer}>
          <div className={styles.guessButtonsRow}>
            {options.slice(0, 2).map((country, index) => (
              <button
                key={index}
                onClick={() => checkAnswer(country)}
                className={`${styles.button} ${styles.guessButton}`}
                disabled={buttonsDisabled}
              >
                {country}
              </button>
            ))}
          </div>
          <div className={styles.guessButtonsRow}>
            {options.slice(2, 4).map((country, index) => (
              <button
                key={index}
                onClick={() => checkAnswer(country)}
                className={`${styles.button} ${styles.guessButton}`}
                disabled={buttonsDisabled}
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      )}
  
      {message && (
        <p
          className={`${styles.message} ${
            message.includes("Game Over")
              ? styles.gameOver
              : message.includes("Correct")
              ? styles.correct
              : styles.incorrect
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
  
  
};

export default Site1;
