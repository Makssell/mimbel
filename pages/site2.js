import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/site2.module.css";

const Site2 = () => {
  const [flags, setFlags] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState(null); // Selected continent filter
  const [includeTerritories, setIncludeTerritories] = useState(true); // Toggle for territories

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
        query = query.eq("territory", false); // Exclude territories
      }

      const { data, error } = await query;
      if (error) console.error("Error fetching flags:", error);
      else setFlags(data);
    };
    fetchFlags();
  }, [selectedContinent, includeTerritories]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Flags</h1>

      {/* Filters Section */}
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
      </div>

      {/* Flags Grid */}
      <div className={styles.flagsContainer}>
        {flags.map((flag) => (
          <div key={flag.id} className={styles.flagCard}>
            <img src={flag.image_url} alt={flag.name} />
            <p>{flag.name}</p>
          </div>
        ))}
      </div>
    </div>
  );


};

export default Site2;
