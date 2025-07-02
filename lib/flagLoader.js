import { supabase } from './supabase';

/**
 * Smart flag loader that handles both global/continent and regional gameplay modes
 * @param {Object} options - Loading options
 * @param {string} options.gameType - "global" or "regional"
 * @param {string} options.selectedContinent - Continent filter for global mode
 * @param {boolean} options.includeTerritories - Include territories in global mode
 * @param {number} options.selectedCountryId - Country ID for regional mode
 * @param {Array} options.selectedDivisionTypes - Division type IDs for regional mode
 * @returns {Promise<Array>} Array of flags with metadata
 */
export const loadFlags = async (options) => {
  const {
    gameType = "global",
    selectedContinent = "world",
    includeTerritories = false,
    selectedCountryId = null,
    selectedDivisionTypes = []
  } = options;

  console.log('Loading flags with options:', options);

  if (gameType === "regional") {
    return await loadRegionalFlags(selectedCountryId, selectedDivisionTypes);
  } else {
    // Handle both "global" and "standard" as the same thing
    return await loadGlobalFlags(selectedContinent, includeTerritories);
  }
};

/**
 * Load global/continent flags (traditional gameplay)
 */
const loadGlobalFlags = async (selectedContinent, includeTerritories) => {
  console.log(`Loading global flags - Continent: ${selectedContinent}, Territories: ${includeTerritories}`);
  
  try {
    let query = supabase
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

    // Apply territory filter
    if (!includeTerritories) {
      query = query.eq('territory', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching global flags:", error);
      throw error;
    }

    // Apply continent filter in memory (since we need to check multiple continents per flag)
    let filteredData = data;
    if (selectedContinent !== "world") {
      console.log(`Filtering for continent ID: ${selectedContinent}`);
      console.log('Sample flag data:', data.slice(0, 3));
      
      filteredData = data.filter((flag) => {
        const continentIds = flag.country_continent.map((cc) => cc.continent_id);
        const isInContinent = continentIds.includes(Number(selectedContinent));
        console.log(`Flag ${flag.name}: continent IDs [${continentIds}], selected: ${selectedContinent}, included: ${isInContinent}`);
        return isInContinent;
      });
      
      console.log(`After filtering: ${filteredData.length} flags for continent ${selectedContinent}`);
    }

    // Add metadata to distinguish from regional flags
    const flagsWithMetadata = filteredData.map(flag => ({
      ...flag,
      type: 'global',
      gameMode: 'standard'
    }));

    console.log(`Loaded ${flagsWithMetadata.length} global flags`);
    return flagsWithMetadata;
  } catch (error) {
    console.error("Error in loadGlobalFlags:", error);
    throw error;
  }
};

/**
 * Load regional flags (subdivisions of a specific country)
 */
const loadRegionalFlags = async (selectedCountryId, selectedDivisionTypes) => {
  console.log(`Loading regional flags - Country: ${selectedCountryId}, Division Types:`, selectedDivisionTypes);
  
  if (!selectedCountryId || !selectedDivisionTypes.length) {
    throw new Error('Country ID and division types are required for regional mode');
  }

  try {
    // Use the new API endpoint for regional flags
    const url = `/api/regional-flags?countryId=${selectedCountryId}&divisionTypes=${selectedDivisionTypes.join(',')}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API response error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch regional flags');
    }

    const regionalFlags = await response.json();
    console.log('Raw regional flags response:', regionalFlags);
    
    // Add metadata to distinguish from global flags
    const flagsWithMetadata = regionalFlags.map(flag => ({
      ...flag,
      type: 'region',
      gameMode: 'regional'
    }));
    
    console.log(`Loaded ${flagsWithMetadata.length} regional flags`);
    return flagsWithMetadata;
  } catch (error) {
    console.error("Error in loadRegionalFlags:", error);
    throw error;
  }
};

/**
 * Get available continents for global mode
 */
export const getContinents = async () => {
  try {
    const { data, error } = await supabase
      .from('continents')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching continents:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getContinents:", error);
    throw error;
  }
};

/**
 * Get available regional countries
 */
export const getRegionalCountries = async () => {
  try {
    const response = await fetch('/api/regional-countries');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch regional countries');
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getRegionalCountries:", error);
    throw error;
  }
};

/**
 * Get division types for a specific country
 */
export const getDivisionTypes = async (countryId = null) => {
  try {
    const response = await fetch('/api/division-types');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch division types');
    }

    const allDivisionTypes = await response.json();
    
    // Filter by country if specified
    if (countryId) {
      return allDivisionTypes.filter(divisionType => divisionType.country_id === countryId);
    }
    
    return allDivisionTypes;
  } catch (error) {
    console.error("Error in getDivisionTypes:", error);
    throw error;
  }
}; 