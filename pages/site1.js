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

  useEffect(() => {
    const fetchFlags = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("flags")
        .select(`
          id,
          name,
          image_url
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

  const startGame = () => {
    if (!gameStarted) {
      setScore(0);
      setHealth(3);
      setMessage("");
      setGameStarted(true);
    }
  
    if (filteredFlags.length === 0) {
      setMessage("No flags available.");
      return;
    }
  
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
          <button
            className={`${styles.button} ${styles.mainButton}`}
            onClick={startGame}
          >
            Start Game
          </button>
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
              <img
                src={currentFlag.image_url}
                alt={currentFlag.name}
                className={styles.flagImage}
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
