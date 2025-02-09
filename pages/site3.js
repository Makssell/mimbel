import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Site3 = () => {
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
    <div>
      <h1>Flags</h1>

      {/* Dropdown for Continent Selection */}
      <select onChange={(e) => setSelectedContinent(e.target.value || null)} defaultValue="">
        <option value="">All Continents</option>
        {continents.map((continent) => (
          <option key={continent.id} value={continent.id}>
            {continent.name}
          </option>
        ))}
      </select>

      {/* Toggle Switch for Territories */}
      <label style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
        <input
          type="checkbox"
          checked={includeTerritories}
          onChange={() => setIncludeTerritories(!includeTerritories)}
          style={{ marginRight: "5px" }}
        />
        Include Territories
      </label>

      {/* Display Flags */}
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}>
        {flags.map((flag) => (
          <div key={flag.id} style={{ margin: "10px", textAlign: "center" }}>
            <img src={flag.image_url} alt={flag.name} width="100" />
            <p>{flag.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Site3;
