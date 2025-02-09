import { useState, useEffect } from 'react';
import styles from '../styles/Site1.module.css';  // Import the CSS module

const Site1 = () => {
  const [flags, setFlags] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [showTerritories, setShowTerritories] = useState(false);

  const fetchFlags = async (continent, showTerritories) => {
    let query = "?select=name,continents,image_url,territory";
  
    // Continent filtering
    if (continent && continent !== "All") {
      query += `&continents=cs.like.%${continent}%`;  // Using "like" for continent matching
    }
  
    // Territory filtering
    if (showTerritories) {
      query += "&territory=eq.false";  // Set to false if territories are not to be shown
    }
  
    console.log(`Query: ${query}`);
  
    try {
      const response = await fetch(`https://jcucxwulsqjpvlzbpyep.supabase.co/rest/v1/flags${query}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorMessage = `Failed to fetch flags. Status: ${response.status} - ${response.statusText}`;
        const errorBody = await response.text();
        console.error(errorMessage, errorBody);
        throw new Error(errorMessage);
      }
  
      const flags = await response.json();
  
      if (Array.isArray(flags)) {
        setFlags(flags);
      } else {
        console.error("Fetched data is not an array:", flags);
      }
    } catch (error) {
      console.error("Error fetching flags:", error.message);
    }
  };
  
  useEffect(() => {
    fetchFlags(selectedContinent, showTerritories);
  }, [selectedContinent, showTerritories]);  // This will trigger the effect whenever either value changes

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Flags Display</h1>

      {/* Continent Dropdown */}
      <label htmlFor="continent" className={styles.label}>Select Continent: </label>
      <select
        id="continent"
        value={selectedContinent}
        onChange={(e) => setSelectedContinent(e.target.value)}
        className={styles.select}
      >
        <option value="All">All</option>
        <option value="Europe">Europe</option>
        <option value="Asia">Asia</option>
        <option value="North America">North America</option>
        <option value="South America">South America</option>
        <option value="Africa">Africa</option>
        <option value="Oceania">Oceania</option>
      </select>

      {/* Territory Toggle */}
      <label htmlFor="territory" className={styles.label}>Show Territories: </label>
      <input
        type="checkbox"
        id="territory"
        checked={showTerritories}
        onChange={(e) => setShowTerritories(e.target.checked)}
        className={styles.checkbox}
      />

      {/* Display Flags */}
      <div className={styles.flagsContainer}>
        {flags.length === 0 ? (
          <p>No flags to display.</p>
        ) : (
          flags.map((flag) => (
            <div key={flag.name} className={styles.flag}>
              <img src={flag.image_url} alt={flag.name} />
              <p>{flag.name}</p>
              <p>{flag.continents}</p>
              <p>{flag.territory ? 'Territory' : 'Country'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Site1;
