import * as SQLite from "expo-sqlite";

// Open database (same instance as sync service)
const db = SQLite.openDatabaseSync("mimbel.db");

/**
 * Load flags from local SQLite database based on game settings
 * This replaces the web version's Supabase queries with local database queries
 */
class FlagLoader {
  /**
   * Load global/continent flags from local database
   * @param {string} selectedContinent - Continent ID or "world"
   * @param {boolean} includeTerritories - Include territories
   * @returns {Promise<Array>} Array of flags
   */
  async loadGlobalFlags(selectedContinent = "world", includeTerritories = false) {
    try {
      console.log(`Loading global flags - Continent: ${selectedContinent}, Territories: ${includeTerritories}`);

      // Build query
      let query = `
        SELECT 
          f.id,
          f.name,
          f.territory,
          f.image_url
        FROM flags f
      `;

      const params = [];

      // Apply territory filter
      if (!includeTerritories) {
        query += ` WHERE f.territory = 0`;
      }

      // Apply continent filter if not "world"
      if (selectedContinent !== "world") {
        if (!includeTerritories) {
          query += ` AND EXISTS (
            SELECT 1 FROM flag_continents fc 
            WHERE fc.flag_id = f.id AND fc.continent_id = ?
          )`;
        } else {
          query += ` WHERE EXISTS (
            SELECT 1 FROM flag_continents fc 
            WHERE fc.flag_id = f.id AND fc.continent_id = ?
          )`;
        }
        params.push(Number(selectedContinent));
      }

      query += ` ORDER BY f.name`;

      const flags = db.getAllSync(query, params);

      // Add metadata
      const flagsWithMetadata = flags.map(flag => ({
        ...flag,
        territory: flag.territory === 1,
        type: 'global',
        gameMode: 'standard'
      }));

      console.log(`Loaded ${flagsWithMetadata.length} global flags from local database`);
      return flagsWithMetadata;
    } catch (error) {
      console.error("Error loading global flags:", error);
      throw error;
    }
  }

  /**
   * Load regional flags from local database
   * @param {number} countryId - Regional country ID
   * @param {Array<number>} divisionTypeIds - Division type IDs
   * @returns {Promise<Array>} Array of regional flags
   */
  async loadRegionalFlags(countryId, divisionTypeIds = []) {
    try {
      console.log(`Loading regional flags - Country: ${countryId}, Division Types:`, divisionTypeIds);

      if (!countryId || !divisionTypeIds.length) {
        throw new Error('Country ID and division types are required for regional mode');
      }

      // Build query with IN clause for division types
      const placeholders = divisionTypeIds.map(() => '?').join(',');
      const query = `
        SELECT 
          id,
          country_id,
          division_type_id,
          name,
          image_url
        FROM regional_flags
        WHERE country_id = ? AND division_type_id IN (${placeholders})
        ORDER BY name
      `;

      const params = [countryId, ...divisionTypeIds];
      const flags = db.getAllSync(query, params);

      // Add metadata
      const flagsWithMetadata = flags.map(flag => ({
        ...flag,
        type: 'region',
        gameMode: 'regional'
      }));

      console.log(`Loaded ${flagsWithMetadata.length} regional flags from local database`);
      return flagsWithMetadata;
    } catch (error) {
      console.error("Error loading regional flags:", error);
      throw error;
    }
  }

  /**
   * Get available continents from local database
   * @returns {Promise<Array>} Array of continents
   */
  async getContinents() {
    try {
      const continents = db.getAllSync(
        `SELECT id, name FROM continents ORDER BY name`
      );
      return continents || [];
    } catch (error) {
      console.error("Error getting continents:", error);
      return [];
    }
  }

  /**
   * Get available regional countries from local database
   * @returns {Promise<Array>} Array of regional countries
   */
  async getRegionalCountries() {
    try {
      const countries = db.getAllSync(
        `SELECT id, name, flag_image_url FROM regional_flag_countries WHERE is_active = 1 ORDER BY name`
      );
      return countries || [];
    } catch (error) {
      console.error("Error getting regional countries:", error);
      return [];
    }
  }

  /**
   * Get division types for a country from local database
   * @param {number} countryId - Country ID (optional, if null returns all)
   * @returns {Promise<Array>} Array of division types with flag counts
   */
  async getDivisionTypes(countryId = null) {
    try {
      let query = `
        SELECT 
          dt.id, 
          dt.country_id, 
          dt.type_name,
          COUNT(rf.id) as flag_count
        FROM region_division_types dt
        LEFT JOIN regional_flags rf ON rf.division_type_id = dt.id
        WHERE dt.is_active = 1
      `;
      const params = [];

      if (countryId) {
        query += ` AND dt.country_id = ?`;
        params.push(countryId);
      }

      query += ` GROUP BY dt.id, dt.country_id, dt.type_name ORDER BY dt.type_name`;

      const divisionTypes = db.getAllSync(query, params);
      return divisionTypes.map(dt => ({
        ...dt,
        flag_count: dt.flag_count || 0,
      })) || [];
    } catch (error) {
      console.error("Error getting division types:", error);
      return [];
    }
  }

  /**
   * Get featured regional countries (for menu display)
   * @returns {Promise<Array>} Array of featured regional countries with flag counts
   */
  async getFeaturedRegionalCountries() {
    try {
      // Check if featured column exists
      const tableInfo = db.getAllSync(`PRAGMA table_info(regional_flag_countries)`);
      const hasFeaturedColumn = tableInfo.some(col => col.name === 'featured');
      
      // Get featured countries (or all if featured column doesn't exist)
      let query = `SELECT id, name, flag_image_url, is_active FROM regional_flag_countries WHERE is_active = 1`;
      if (hasFeaturedColumn) {
        query += ` AND featured = 1`;
      }
      query += ` ORDER BY name`;
      
      const countries = db.getAllSync(query);

      // Calculate flag counts for each country
      const countriesWithCounts = countries.map((country) => {
        const count = db.getFirstSync(
          `SELECT COUNT(*) as count FROM regional_flags WHERE country_id = ?`,
          [country.id]
        );
        return {
          ...country,
          total_regional_flags: count ? count.count : 0,
          is_active: country.is_active === 1,
        };
      });

      // Sort by flag count (highest first)
      return countriesWithCounts.sort((a, b) => b.total_regional_flags - a.total_regional_flags);
    } catch (error) {
      console.error("Error getting featured regional countries:", error);
      return [];
    }
  }

  /**
   * Get all regional countries (for Browse All modal)
   * @returns {Promise<Array>} Array of all active regional countries with flag counts
   */
  async getAllRegionalCountries() {
    try {
      // Get all active countries
      const countries = db.getAllSync(
        `SELECT id, name, flag_image_url, is_active FROM regional_flag_countries WHERE is_active = 1 ORDER BY name`
      );

      // Calculate flag counts for each country
      const countriesWithCounts = countries.map((country) => {
        const count = db.getFirstSync(
          `SELECT COUNT(*) as count FROM regional_flags WHERE country_id = ?`,
          [country.id]
        );
        return {
          ...country,
          total_regional_flags: count ? count.count : 0,
          is_active: country.is_active === 1,
        };
      });

      // Sort by flag count (highest first)
      return countriesWithCounts.sort((a, b) => b.total_regional_flags - a.total_regional_flags);
    } catch (error) {
      console.error("Error getting all regional countries:", error);
      return [];
    }
  }

  /**
   * Smart flag loader that handles both global and regional modes
   * @param {Object} options - Loading options
   * @param {string} options.gameMode - "standard" or "regional"
   * @param {string} options.selectedContinent - Continent filter for standard mode
   * @param {boolean} options.includeTerritories - Include territories in standard mode
   * @param {number} options.selectedCountryId - Country ID for regional mode
   * @param {Array} options.selectedDivisionTypes - Division type IDs for regional mode
   * @returns {Promise<Array>} Array of flags with metadata
   */
  async loadFlags(options) {
    const {
      gameMode = "standard",
      selectedContinent = "world",
      includeTerritories = false,
      selectedCountryId = null,
      selectedDivisionTypes = []
    } = options;

    console.log('Loading flags with options:', options);

    if (gameMode === "regional") {
      return await this.loadRegionalFlags(selectedCountryId, selectedDivisionTypes);
    } else {
      return await this.loadGlobalFlags(selectedContinent, includeTerritories);
    }
  }
}

// Export singleton instance
export default new FlagLoader();
