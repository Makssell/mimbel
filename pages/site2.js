import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/site2.module.css";

const Site2 = () => {
  // Data states
  const [flags, setFlags] = useState([]);
  const [continents, setContinents] = useState([]);
  const [filteredFlags, setFilteredFlags] = useState([]);
  
  // Filter states
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [includeTerritories, setIncludeTerritories] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Display states
  const [showNames, setShowNames] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [focusedFlag, setFocusedFlag] = useState(null);

  // Fetch continents
  useEffect(() => {
    const fetchContinents = async () => {
      const { data, error } = await supabase.from("continents").select("*");
      if (error) console.error("Error fetching continents:", error);
      else setContinents(data);
    };
    fetchContinents();
  }, []);

  // Fetch flags based on selected filters
  useEffect(() => {
    const fetchFlags = async () => {
      let query = supabase
        .from("flags")
        .select("id, name, image_url, territory, country_continent!inner(continent_id)");

      if (selectedContinent) {
        query = query.eq("country_continent.continent_id", selectedContinent);
      }

      if (!includeTerritories) {
        query = query.eq("territory", false);
      }

      const { data, error } = await query;
      if (error) console.error("Error fetching flags:", error);
      else setFlags(data);
    };
    fetchFlags();
  }, [selectedContinent, includeTerritories]);

  // Filter flags based on search query
  useEffect(() => {
    const filtered = flags.filter(flag =>
      flag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Sort alphabetically by name
    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredFlags(sorted);
  }, [flags, searchQuery]);

  // Open focus mode
  const openFocusMode = (flag) => {
    setFocusedFlag(flag);
    setFocusMode(true);
  };

  // Close focus mode
  const closeFocusMode = () => {
    setFocusMode(false);
    setFocusedFlag(null);
  };

  // Get continent name
  const getContinentName = (continentId) => {
    const continent = continents.find(c => c.id === parseInt(continentId));
    return continent ? continent.name : "Unknown";
  };

  return (
    <div className={styles.container}>
      

      {!focusMode && (
        <>
          {/* Filters */}
          <div className={styles.filters}>
            <select
              className={styles.dropdown}
              onChange={(e) => setSelectedContinent(e.target.value || null)}
              defaultValue=""
            >
              <option value="">All Continents</option>
              {continents.map((continent) => (
                <option key={continent.id} value={continent.id}>
                  {continent.name}
                </option>
              ))}
            </select>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeTerritories}
                onChange={() => setIncludeTerritories(!includeTerritories)}
              />
              Include Territories
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showNames}
                onChange={() => setShowNames(!showNames)}
              />
              Show Names
            </label>
          </div>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Active Filters Summary */}
          <div className={styles.filterSummary}>
            <div className={styles.filterChips}>
              {selectedContinent && (
                <span className={styles.filterChip}>
                  🌍 {getContinentName(selectedContinent)}
                </span>
              )}
              {!includeTerritories && (
                <span className={styles.filterChip}>
                  🏝️ No Territories
                </span>
              )}
              {searchQuery && (
                <span className={styles.filterChip}>
                  🔍 "{searchQuery}"
                </span>
              )}
            </div>
            <div className={styles.resultsCount}>
              {filteredFlags.length} flag{filteredFlags.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Flags Grid */}
          <div className={styles.flagsContainer}>
            {filteredFlags.map((flag) => (
              <div 
                key={flag.id} 
                className={styles.flagCard}
                onClick={() => openFocusMode(flag)}
              >
                <img src={flag.image_url} alt={flag.name} />
                {showNames && <p>{flag.name}</p>}
                {flag.territory && <span className={styles.territoryTag}>Territory</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Focus Mode */}
      {focusMode && focusedFlag && (
        <div className={styles.focusOverlay} onClick={closeFocusMode}>
          <div className={styles.focusContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeFocusMode}>
              ×
            </button>
            <img 
              src={focusedFlag.image_url} 
              alt={focusedFlag.name} 
              className={styles.focusFlag}
            />
            <h2>{focusedFlag.name}</h2>
            <div className={styles.focusInfo}>
              <span className={styles.continentInfo}>
                🌍 {getContinentName(focusedFlag.country_continent?.continent_id)}
              </span>
              {focusedFlag.territory && (
                <span className={styles.territoryTag}>Territory</span>
              )}
            </div>
            {/* Future: Add continent info, history, trivia here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Site2;
