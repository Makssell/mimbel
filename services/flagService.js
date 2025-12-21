/**
 * Flag service for fetching flags from Supabase
 * Handles both global and regional flag queries
 */

import { supabase } from "../lib/supabase";

/**
 * Simple direct Supabase query for global flags
 * @param {string} continent - Continent ID or "world"
 * @param {boolean} includeTerritories - Whether to include territories
 * @returns {Promise<Array>} Array of flag objects
 */
export const fetchGlobalFlags = async (continent = "world", includeTerritories = false) => {
  try {
    let query = supabase
      .from("flags")
      .select(`
        id,
        name,
        territory,
        image_url,
        country_continent (continent_id)
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

    // Apply continent filter in memory (like Site4)
    let filteredData = data;
    if (continent !== "world") {
      filteredData = data.filter((flag) =>
        flag.country_continent.some((cc) => cc.continent_id === Number(continent))
      );
    }

    return filteredData || [];
  } catch (error) {
    console.error("Error in fetchGlobalFlags:", error);
    throw error;
  }
};

/**
 * Simple direct Supabase query for regional flags
 * @param {number} countryId - Country ID
 * @param {Array<number>} divisionTypes - Array of division type IDs
 * @returns {Promise<Array>} Array of regional flag objects
 */
export const fetchRegionalFlags = async (countryId, divisionTypes) => {
  try {
    const { data, error } = await supabase
      .from('regional_flags')
      .select(`
        id,
        name,
        image_url,
        division_type_id
      `)
      .eq('country_id', countryId)
      .in('division_type_id', divisionTypes);

    if (error) {
      console.error("Error fetching regional flags:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchRegionalFlags:", error);
    throw error;
  }
};

/**
 * Simple direct Supabase query for regional countries with flag counts
 * @returns {Promise<Array>} Array of country objects with total_regional_flags
 */
export const fetchRegionalCountries = async () => {
  try {
    const { data: countries, error } = await supabase
      .from('regional_flag_countries')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error("Error fetching regional countries:", error);
      throw error;
    }

    // Calculate flag counts for each country
    const countriesWithCounts = await Promise.all(
      countries.map(async (country) => {
        const { count, error: countError } = await supabase
          .from('regional_flags')
          .select('*', { count: 'exact', head: true })
          .eq('country_id', country.id);

        if (countError) {
          console.error(`Error counting flags for country ${country.id}:`, countError);
          return { ...country, total_regional_flags: 0 };
        }

        return { ...country, total_regional_flags: count || 0 };
      })
    );

    // Sort countries by total_regional_flags in descending order (highest first)
    const sortedCountries = countriesWithCounts.sort((a, b) => b.total_regional_flags - a.total_regional_flags);

    return sortedCountries || [];
  } catch (error) {
    console.error("Error in fetchRegionalCountries:", error);
    throw error;
  }
};

/**
 * Fetch featured regional countries from API
 * @returns {Promise<Array>} Array of featured country objects
 */
export const fetchFeaturedCountries = async () => {
  try {
    const response = await fetch('/api/featured-regional-countries');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch featured countries');
    }

    return await response.json();
  } catch (error) {
    console.error("Error in fetchFeaturedCountries:", error);
    throw error;
  }
};

/**
 * Simple direct Supabase query for division types with flag counts
 * @returns {Promise<Array>} Array of division type objects with flag_count
 */
export const fetchDivisionTypes = async () => {
  try {
    const { data: divisionTypes, error } = await supabase
      .from('region_division_types')
      .select('*')
      .eq('is_active', true)
      .order('type_name');

    if (error) {
      console.error("Error fetching division types:", error);
      throw error;
    }

    // Calculate flag counts for each division type
    const divisionTypesWithCounts = await Promise.all(
      divisionTypes.map(async (divisionType) => {
        const { count, error: countError } = await supabase
          .from('regional_flags')
          .select('*', { count: 'exact', head: true })
          .eq('division_type_id', divisionType.id);

        if (countError) {
          console.error(`Error counting flags for division type ${divisionType.id}:`, countError);
          return { ...divisionType, flag_count: 0 };
        }

        return { ...divisionType, flag_count: count || 0 };
      })
    );

    return divisionTypesWithCounts || [];
  } catch (error) {
    console.error("Error in fetchDivisionTypes:", error);
    throw error;
  }
};
