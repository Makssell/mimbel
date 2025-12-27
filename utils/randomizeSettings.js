/**
 * Randomize Game Settings Utility
 * Randomly selects all game settings for quick start
 */

/**
 * Randomize all game settings and start the game
 * @param {Object} params - All required state and setters
 * @returns {Promise<void>}
 */
export const randomizeSettings = async (params) => {
  const {
    // State values needed for randomization
    featuredCountries,
    regionalDivisionTypes,
    // Setters
    setGameMode,
    setGameType,
    setRegionalGameType,
    setSelectedContinent,
    setIncludeTerritories,
    setTimeAttackMode,
    setInfiniteMode,
    setTypingMode,
    setRegionalInfiniteMode,
    setRegionalTypingMode,
    setSelectedRegionalCountry,
    setSelectedDivisionTypes,
    setOutlineOnly,
    // Functions
    fetchGlobalFlags,
    fetchRegionalFlags,
    setFilteredFlags,
    setRegionalFlags,
    setFilteredRegionalFlags,
    startGame,
    playMenuClickSound
  } = params;

  // Play click sound
  if (playMenuClickSound) {
    playMenuClickSound();
  }

  // Randomly choose game mode (standard or regional)
  const randomGameMode = Math.random() < 0.5 ? "standard" : "regional";
  setGameMode(randomGameMode);

  if (randomGameMode === "standard") {
    // Standard mode randomization
    // Include all game types: flag-to-country, country-to-flag, map-to-flag, flag-to-map
    const gameTypes = ["flag-to-country", "country-to-flag", "map-to-flag", "flag-to-map"];
    const randomGameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    setGameType(randomGameType);

    // For flag-to-map mode, force enable outlines
    if (randomGameType === "flag-to-map" && setOutlineOnly) {
      setOutlineOnly(true);
    } else if (setOutlineOnly) {
      // For other modes, reset to false (user can toggle manually)
      setOutlineOnly(false);
    }

    const continents = ["world", "1", "2", "3", "4", "5", "6"];
    const randomContinent = continents[Math.floor(Math.random() * continents.length)];
    setSelectedContinent(randomContinent);

    const includeTerritories = Math.random() < 0.5;
    setIncludeTerritories(includeTerritories);
    
    // Time attack mode (less common)
    const timeAttack = Math.random() < 0.2;
    setTimeAttackMode(timeAttack);
    
    // Infinite mode (auto-enabled if time attack, otherwise random)
    setInfiniteMode(timeAttack || Math.random() < 0.5);
    
    // Typing mode (only for flag-to-country)
    // TODO: Typing mode for map-to-flag (commented out for now)
    if (randomGameType === "flag-to-country") {
      // || randomGameType === "map-to-flag") {
      setTypingMode(Math.random() < 0.3);
    } else {
      setTypingMode(false);
    }

    // Load flags for the selected continent
    try {
      const flags = await fetchGlobalFlags(randomContinent, includeTerritories);
      setFilteredFlags(flags);
      
      // Wait longer for React state to update (state updates are batched and async)
      await new Promise(resolve => setTimeout(resolve, 200));
      await startGame();
    } catch (error) {
      console.error("Error loading flags:", error);
      setMessage("Error loading flags. Please try again.");
    }
  } else {
    // Regional mode randomization
    const regionalGameTypes = ["flag-to-region", "region-to-flag"];
    const randomRegionalGameType = regionalGameTypes[Math.floor(Math.random() * regionalGameTypes.length)];
    setRegionalGameType(randomRegionalGameType);

    // Randomly select a featured country
    const activeFeaturedCountries = featuredCountries.filter(country => country.is_active);
    if (activeFeaturedCountries.length === 0) {
      console.error("No featured countries available");
      return;
    }

    const randomCountry = activeFeaturedCountries[Math.floor(Math.random() * activeFeaturedCountries.length)];
    setSelectedRegionalCountry(randomCountry);

    // Get division types for the selected country
    const countryDivisionTypes = regionalDivisionTypes.filter(
      divisionType => divisionType.country_id === randomCountry.id && divisionType.is_active
    );

    if (countryDivisionTypes.length === 0) {
      console.error("No division types available for selected country");
      return;
    }

    // Randomly select division types (at least one, up to all)
    const numToSelect = Math.floor(Math.random() * countryDivisionTypes.length) + 1;
    const shuffled = [...countryDivisionTypes].sort(() => Math.random() - 0.5);
    const selectedDivisionIds = shuffled.slice(0, numToSelect).map(dt => dt.id);
    setSelectedDivisionTypes(selectedDivisionIds);

    // Time attack mode (less common)
    const timeAttack = Math.random() < 0.2;
    setTimeAttackMode(timeAttack);
    
    // Regional infinite mode (auto-enabled if time attack, otherwise random)
    setRegionalInfiniteMode(timeAttack || Math.random() < 0.5);
    
    // Regional typing mode (only for flag-to-region)
    if (randomRegionalGameType === "flag-to-region") {
      setRegionalTypingMode(Math.random() < 0.3);
    } else {
      setRegionalTypingMode(false);
    }

    // Load regional flags
    try {
      const flags = await fetchRegionalFlags(randomCountry.id, selectedDivisionIds);
      setRegionalFlags(flags);
      setFilteredRegionalFlags(flags);
      
      // Wait longer for React state to update (state updates are batched and async)
      // This ensures selectedRegionalCountry and regionalFlags are set before startGame runs
      await new Promise(resolve => setTimeout(resolve, 200));
      await startGame();
    } catch (error) {
      console.error("Error loading regional flags:", error);
      setMessage("Error loading regional flags. Please try again.");
    }
  }
};

