import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/site4.module.css";

const Site4 = () => {
  const [flags, setFlags] = useState([]);
  const [filteredFlags, setFilteredFlags] = useState([]);
  const [currentFlag, setCurrentFlag] = useState(null);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [continent, setContinent] = useState("");
  const [includeTerritories, setIncludeTerritories] = useState(false);
  const [infiniteMode, setInfiniteMode] = useState(false);
  const [usedFlags, setUsedFlags] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [buttonStyles, setButtonStyles] = useState({});
  const [gameMode, setGameMode] = useState("flagToCountry"); // "flagToCountry" or "countryToFlag"

  useEffect(() => {
    const fetchFlags = async () => {
      const { data, error } = await supabase.from("flags").select(`
        id,
        name,
        territory,
        image_url,
        country_continent (continent_id)
      `);
      if (!error) {
        setFlags(data);
        setFilteredFlags(data);
      }
    };
    fetchFlags();
  }, []);

  useEffect(() => {
    let filtered = flags;
    if (continent) {
      filtered = filtered.filter((flag) =>
        flag.country_continent.some((cc) => cc.continent_id === Number(continent))
      );
    }
    if (!includeTerritories) {
      filtered = filtered.filter((flag) => !flag.territory);
    }
    setFilteredFlags(filtered);
    setUsedFlags([]);
  }, [continent, includeTerritories, flags]);

  const startGame = () => {
    if (filteredFlags.length === 0) {
      setMessage("No flags available for selected filters.");
      return;
    }
    setGameStarted(true);
    setStartTime(Date.now());
    setScore(0);
    setHealth(3);
    setUsedFlags([]);
    pickNewFlag();
    
  };

  const giveUp = () => {
    setGameStarted(false);
    setMessage("Game Over! You gave up.");
  };

  const pickNewFlag = () => {
    let availableFlags = filteredFlags.filter(
      (flag) => infiniteMode || !usedFlags.includes(flag.id)
    );
    setMessage(""); 
    if (availableFlags.length === 0) {
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      setMessage(`Game Completed! Time: ${elapsedTime} seconds.`);
      setGameStarted(false);
      return;
    }
    const randomFlag = availableFlags[Math.floor(Math.random() * availableFlags.length)];
    setCurrentFlag(randomFlag);
    setUsedFlags([...usedFlags, randomFlag.id]);
    
    if (gameMode === "flagToCountry") {
      // Original mode: flag -> country
      const correctCountry = randomFlag.name;
      let incorrectCountries = filteredFlags.filter((flag) => flag.name !== correctCountry);
      incorrectCountries = incorrectCountries.sort(() => Math.random() - 0.5).slice(0, 3);
      const shuffledCountries = [correctCountry, ...incorrectCountries.map((flag) => flag.name)].sort(() => Math.random() - 0.5);
      setOptions(shuffledCountries);
    } else {
      // New mode: country -> flag
      const correctFlag = randomFlag;
      let incorrectFlags = filteredFlags.filter((flag) => flag.id !== correctFlag.id);
      incorrectFlags = incorrectFlags.sort(() => Math.random() - 0.5).slice(0, 3);
      const shuffledFlags = [correctFlag, ...incorrectFlags].sort(() => Math.random() - 0.5);
      setOptions(shuffledFlags);
    }
  };

  const checkAnswer = (selectedOption) => {
    let isCorrect = false;
    
    if (gameMode === "flagToCountry") {
      isCorrect = selectedOption === currentFlag.name;
    } else {
      isCorrect = selectedOption.id === currentFlag.id;
    }
    
    const newButtonStyles = isCorrect ? 'correct' : 'incorrect';
    
    setButtonStyles({
      [gameMode === "flagToCountry" ? selectedOption : selectedOption.id]: newButtonStyles
    });
  
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setMessage("Correct!");
      setButtonsDisabled(true);
      setTimeout(() => {
        pickNewFlag();
        setButtonStyles({});
        setButtonsDisabled(false);
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
    }
  };
  

  

  return (
    <div>
      {!gameStarted && <h1>Guess the Flag</h1>}  {/* Hide title when the game ends */}
      {gameStarted && <p>Score: {score}</p>}
      {gameStarted && (
        <div>
          <h3>Health:</h3>
          {Array.from({ length: 3 }).map((_, index) => (
            <span key={index} style={{ color: health > index ? "red" : "gray" }}>
              ♥
            </span>
          ))}
        </div>
      )}
      {!gameStarted && (
        <>
          <div>
            <h3>Game Mode:</h3>
            <label>
              <input 
                type="radio" 
                name="gameMode" 
                value="flagToCountry" 
                checked={gameMode === "flagToCountry"} 
                onChange={(e) => setGameMode(e.target.value)} 
              />
              Flag → Country (Guess country from flag)
            </label>
            <br />
            <label>
              <input 
                type="radio" 
                name="gameMode" 
                value="countryToFlag" 
                checked={gameMode === "countryToFlag"} 
                onChange={(e) => setGameMode(e.target.value)} 
              />
              Country → Flag (Guess flag from country)
            </label>
          </div>
          <select value={continent} onChange={(e) => setContinent(e.target.value)}>
            <option value="">World</option>
            <option value="1">Africa</option>
            <option value="2">Asia</option>
            <option value="3">Europe</option>
            <option value="4">North America</option>
            <option value="5">South America</option>
            <option value="6">Oceania</option>
          </select>
          <label>
            <input type="checkbox" checked={includeTerritories} onChange={() => setIncludeTerritories(!includeTerritories)} />
            Include Territories
          </label>
          <label>
            <input type="checkbox" checked={infiniteMode} onChange={() => setInfiniteMode(!infiniteMode)} />
            Infinite Mode
          </label>
        </>
      )}
      <button onClick={gameStarted ? giveUp : startGame}>{gameStarted ? "Give Up" : "Start Game"}</button>
      {gameStarted && currentFlag && (  /* Hide the flag and guess buttons when the game ends */
        <div>
          {gameMode === "flagToCountry" ? (
            // Original mode: show flag, guess country
            <>
              <img src={currentFlag.image_url} alt={currentFlag.name} width="200" />
              <h3>Which country does this flag belong to?</h3>
              <div>
                {options.map((country, index) => (
                  <button 
                    key={index} 
                    onClick={() => checkAnswer(country)} 
                    disabled={buttonsDisabled} 
                    className={`${buttonStyles[country] || ""} ${buttonsDisabled ? "disabled" : ""}`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </>
          ) : (
            // New mode: show country, guess flag
            <>
              <h2>{currentFlag.name}</h2>
              <h3>Which flag belongs to this country?</h3>
              <div>
                {options.map((flag, index) => (
                  <button 
                    key={index} 
                    onClick={() => checkAnswer(flag)} 
                    disabled={buttonsDisabled} 
                    className={`${buttonStyles[flag.id] || ""} ${buttonsDisabled ? "disabled" : ""}`}
                    style={{ padding: "10px", margin: "5px" }}
                  >
                    <img src={flag.image_url} alt={flag.name} width="100" height="60" style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
  
};

export default Site4;
