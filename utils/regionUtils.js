/**
 * Region Utilities
 * Functions for working with geographic regions (territories) vs sovereign countries
 * 
 * Key concept: Regions are geometry (what you draw), Countries are logic (what you play)
 */

import { loadGeoJSON } from './mapUtils';

/**
 * Manual mapping of territories/regions to their sovereign countries
 * Used for disputed territories, claimed territories, and special cases
 * Format: { territoryName: { sovereignCode: 'XXX', sovereignName: 'Country Name' } }
 */
const TERRITORY_TO_SOVEREIGN = {
  'Somaliland': { sovereignCode: 'SOM', sovereignName: 'Somalia' },
  'Western Sahara': { sovereignCode: 'ESH', sovereignName: 'Western Sahara' }, // Disputed, but has its own ISO code
  // Add more as needed
};

/**
 * Check if a feature should be excluded from geographic displays
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if feature should be excluded
 */
export function shouldExcludeFeature(feature) {
  if (!feature || !feature.properties) return false;
  
  const props = feature.properties;
  const name = props.NAME || props.ADMIN || props.SOVEREIGNT || '';
  const isoA3 = props.ISO_A3 || '';
  
  // Exclude Antarctica
  if (name.toLowerCase().includes('antarctica') || 
      isoA3 === 'ATA' ||
      name.toLowerCase().includes('antarctic')) {
    return true;
  }
  
  return false;
}

/**
 * Get all regions (GeoJSON features) for a sovereign country
 * This includes all territories, exclaves, and overseas territories
 * 
 * @param {string} sovereignCode - ISO_A3 code of the sovereign country (e.g., "FRA", "DNK", "USA")
 * @param {string} sovereignName - Optional sovereign name (e.g., "France", "Denmark") for matching
 * @param {Object} geoData - GeoJSON data (optional, will load if not provided)
 * @returns {Promise<Array>} Array of GeoJSON features for all regions of that sovereign
 */
export async function getRegionsForSovereign(sovereignCode, sovereignName = null, geoData = null) {
  if (!sovereignCode && !sovereignName) return [];
  
  if (!geoData) {
    geoData = await loadGeoJSON();
  }
  
  if (!geoData || !geoData.features) return [];
  
  // Get sovereign name from code if not provided
  if (!sovereignName && sovereignCode) {
    sovereignName = getSovereignNameFromCode(sovereignCode);
  }
  
  // Find all features where SOVEREIGNT matches the sovereign
  // Natural Earth uses SOVEREIGNT field with country names, not codes
  const regions = geoData.features.filter(feature => {
    if (!feature || !feature.properties) return false;
    
    // Exclude Antarctica and other unwanted regions
    if (shouldExcludeFeature(feature)) {
      return false;
    }
    
    const props = feature.properties;
    
    // Match by ISO_A3 if this is the sovereign itself
    if (sovereignCode && props.ISO_A3 === sovereignCode) {
      return true;
    }
    
    // Match by SOVEREIGNT name (most common case for territories)
    if (sovereignName && props.SOVEREIGNT) {
      // Direct name match
      if (props.SOVEREIGNT === sovereignName) {
        return true;
      }
      // Also check if the code matches (for cases where SOVEREIGNT might have the code)
      if (sovereignCode && getSovereignCode(props.SOVEREIGNT) === sovereignCode) {
        return true;
      }
    }
    
    // Special case: Check manual territory mappings (e.g., Somaliland -> Somalia)
    // Check if this feature's NAME or SOVEREIGNT is a territory that should belong to our sovereign
    const featureName = props.NAME || props.SOVEREIGNT;
    if (featureName && TERRITORY_TO_SOVEREIGN[featureName]) {
      const territoryMapping = TERRITORY_TO_SOVEREIGN[featureName];
      if (territoryMapping.sovereignCode === sovereignCode || 
          territoryMapping.sovereignName === sovereignName) {
        return true;
      }
    }
    
    // Special case: Check ADM0_ISO field (used for claimed territories)
    // Somaliland has ADM0_ISO: "SOM" even though SOVEREIGNT is "Somaliland"
    if (sovereignCode && props.ADM0_ISO === sovereignCode) {
      return true;
    }
    
    // Special case: Check ADM0_A3 field (alternative admin code)
    if (sovereignCode && props.ADM0_A3 === sovereignCode) {
      return true;
    }
    
    return false;
  });
  
  return regions;
}

/**
 * Get sovereign code from a sovereign name
 * Maps common sovereign names to ISO_A3 codes
 * This is a fallback for when we only have names
 */
function getSovereignCode(sovereignName) {
  if (!sovereignName) return null;
  
  const sovereignMap = {
    'France': 'FRA',
    'Denmark': 'DNK',
    'United States of America': 'USA',
    'United States': 'USA',
    'United Kingdom': 'GBR',
    'Netherlands': 'NLD',
    'Spain': 'ESP',
    'Portugal': 'PRT',
    'Norway': 'NOR',
    'Australia': 'AUS',
    'New Zealand': 'NZL',
    'Russia': 'RUS',
    'China': 'CHN',
    'Japan': 'JPN',
    'Brazil': 'BRA',
    'Argentina': 'ARG',
    'Canada': 'CAN',
    'Mexico': 'MEX',
    'India': 'IND',
    'Indonesia': 'IDN',
    'South Africa': 'ZAF',
    'Egypt': 'EGY',
    'Turkey': 'TUR',
    'Saudi Arabia': 'SAU',
    'Iran': 'IRN',
    'Pakistan': 'PAK',
    'Bangladesh': 'BGD',
    'Philippines': 'PHL',
    'Vietnam': 'VNM',
    'Thailand': 'THA',
    'South Korea': 'KOR',
    'North Korea': 'PRK',
    'Italy': 'ITA',
    'Germany': 'DEU',
    'Poland': 'POL',
    'Ukraine': 'UKR',
    'Somalia': 'SOM',
    'Somaliland': 'SOM', // Claimed by Somalia
    'Western Sahara': 'ESH',
    // Add more as needed
  };
  
  return sovereignMap[sovereignName] || null;
}

/**
 * Get sovereign name from ISO_A3 code
 * Reverse mapping for when we have code but need name
 */
function getSovereignNameFromCode(code) {
  if (!code) return null;
  
  const codeToName = {
    'FRA': 'France',
    'DNK': 'Denmark',
    'USA': 'United States of America',
    'GBR': 'United Kingdom',
    'NLD': 'Netherlands',
    'ESP': 'Spain',
    'PRT': 'Portugal',
    'NOR': 'Norway',
    'AUS': 'Australia',
    'NZL': 'New Zealand',
    'RUS': 'Russia',
    'CHN': 'China',
    'JPN': 'Japan',
    'BRA': 'Brazil',
    'ARG': 'Argentina',
    'CAN': 'Canada',
    'MEX': 'Mexico',
    'IND': 'India',
    'IDN': 'Indonesia',
    'ZAF': 'South Africa',
    'EGY': 'Egypt',
    'TUR': 'Turkey',
    'SAU': 'Saudi Arabia',
    'IRN': 'Iran',
    'PAK': 'Pakistan',
    'BGD': 'Bangladesh',
    'PHL': 'Philippines',
    'VNM': 'Vietnam',
    'THA': 'Thailand',
    'KOR': 'South Korea',
    'PRK': 'North Korea',
    'ITA': 'Italy',
    'DEU': 'Germany',
    'POL': 'Poland',
    'UKR': 'Ukraine',
    'SOM': 'Somalia',
    'ESH': 'Western Sahara',
  };
  
  return codeToName[code] || null;
}

/**
 * Get the sovereign code and name for a flag
 * Extracts ISO_A3 and SOVEREIGNT from map_outline_match
 * 
 * @param {Object} flag - Flag object with map_outline_match
 * @returns {Object} { code: string|null, name: string|null }
 */
export function getSovereignForFlag(flag) {
  if (!flag || !flag.map_outline_match) return { code: null, name: null };
  
  const match = typeof flag.map_outline_match === 'string'
    ? JSON.parse(flag.map_outline_match)
    : flag.map_outline_match;
  
  let code = null;
  let name = null;
  
  // Use ISO_A3 if available (most reliable)
  if (match.ISO_A3) {
    code = match.ISO_A3;
    name = getSovereignNameFromCode(code);
  }
  
  // Get SOVEREIGNT name (this is what Natural Earth uses for territories)
  if (match.SOVEREIGNT) {
    name = match.SOVEREIGNT;
    // If we don't have a code yet, try to get it from the name
    if (!code) {
      code = getSovereignCode(name);
    }
  }
  
  return { code, name };
}

/**
 * Get the sovereign code for a flag (backward compatibility)
 * @param {Object} flag - Flag object with map_outline_match
 * @returns {string|null} ISO_A3 code of the sovereign
 */
export function getSovereignCodeForFlag(flag) {
  return getSovereignForFlag(flag).code;
}

/**
 * Get all regions in a geographic continent
 * This is geographic, not political - includes all territories
 * 
 * @param {string|number} continentId - Continent ID or name
 * @param {Object} geoData - GeoJSON data (optional)
 * @returns {Promise<Array>} Array of GeoJSON features in that continent
 */
export async function getRegionsInContinent(continentId, geoData = null) {
  if (!geoData) {
    geoData = await loadGeoJSON();
  }
  
  if (!geoData || !geoData.features) return [];
  
  // Map continent IDs/names to continent names in GeoJSON
  // Natural Earth uses CONTINENT field in some datasets
  // For now, we'll need to filter by geographic bounds or use a mapping
  // This is a simplified version - you may need to enhance based on your GeoJSON structure
  
  const continentBounds = {
    '1': { name: 'North America', minLat: 7.0, maxLat: 83.0, minLon: -180.0, maxLon: -10.0 },
    '2': { name: 'South America', minLat: -56.0, maxLat: 12.0, minLon: -90.0, maxLon: -30.0 },
    '3': { name: 'Europe', minLat: 35.0, maxLat: 72.0, minLon: -25.0, maxLon: 45.0 },
    '4': { name: 'Africa', minLat: -35.0, maxLat: 38.0, minLon: -20.0, maxLon: 55.0 },
    '5': { name: 'Asia', minLat: -10.0, maxLat: 82.0, minLon: 25.0, maxLon: 180.0 },
    '6': { name: 'Oceania', minLat: -50.0, maxLat: 30.0, minLon: 110.0, maxLon: 180.0 },
  };
  
  const bounds = continentBounds[continentId] || continentBounds['1']; // Default to North America
  
  // Filter features by geographic bounds
  // This is approximate - you may want to use a more sophisticated method
  const regions = geoData.features.filter(feature => {
    if (!feature || !feature.geometry) return false;
    
    // Calculate feature bounds
    const coords = feature.geometry.coordinates;
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;
    
    const extractCoords = (arr) => {
      if (typeof arr[0] === 'number') {
        const [lon, lat] = arr;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
      } else {
        arr.forEach(extractCoords);
      }
    };
    
    extractCoords(coords);
    
    // Check if feature overlaps with continent bounds
    // A feature is in the continent if its center or any part is within bounds
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    // For Caribbean and small islands, also check if any point is in bounds
    // This ensures small islands aren't missed
    const hasPointInBounds = (
      (minLat >= bounds.minLat && minLat <= bounds.maxLat && minLon >= bounds.minLon && minLon <= bounds.maxLon) ||
      (maxLat >= bounds.minLat && maxLat <= bounds.maxLat && maxLon >= bounds.minLon && maxLon <= bounds.maxLon)
    );
    
    return (
      (centerLat >= bounds.minLat && centerLat <= bounds.maxLat && centerLon >= bounds.minLon && centerLon <= bounds.maxLon) ||
      hasPointInBounds ||
      // Also include if feature spans across bounds (for large countries)
      (minLat <= bounds.maxLat && maxLat >= bounds.minLat && minLon <= bounds.maxLon && maxLon >= bounds.minLon)
    );
  });
  
  return regions;
}

/**
 * Get playable countries that have regions in a geographic continent
 * This filters flags based on whether any of their regions are in the continent
 * 
 * @param {string|number} continentId - Continent ID
 * @param {Array} flags - Array of flag objects
 * @param {Object} geoData - GeoJSON data (optional)
 * @returns {Promise<Array>} Array of flags that have regions in that continent
 */
export async function getPlayableCountriesInContinent(continentId, flags, geoData = null) {
  if (!geoData) {
    geoData = await loadGeoJSON();
  }
  
  // Get all regions in the continent
  const continentRegions = await getRegionsInContinent(continentId, geoData);
  
  // Extract sovereign codes from regions
  const sovereignCodes = new Set();
  continentRegions.forEach(region => {
    if (region.properties) {
      // Get sovereign from SOVEREIGNT or ISO_A3
      const sovereign = region.properties.SOVEREIGNT;
      if (sovereign) {
        const code = getSovereignCode(sovereign) || region.properties.ISO_A3;
        if (code) sovereignCodes.add(code);
      } else if (region.properties.ISO_A3) {
        sovereignCodes.add(region.properties.ISO_A3);
      }
    }
  });
  
  // Filter flags that match these sovereign codes
  const playableFlags = flags.filter(flag => {
    const flagSovereignCode = getSovereignCodeForFlag(flag);
    return flagSovereignCode && sovereignCodes.has(flagSovereignCode);
  });
  
  return playableFlags;
}

/**
 * Match a flag to all its regions (not just one feature)
 * Returns all GeoJSON features that belong to the flag's sovereign
 * 
 * @param {Object} flag - Flag object
 * @param {Object} geoData - GeoJSON data (optional)
 * @returns {Promise<Array>} Array of GeoJSON features for all regions of that flag's country
 */
export async function matchFlagToAllRegions(flag, geoData = null) {
  if (!flag) return [];
  
  const { code: sovereignCode, name: sovereignName } = getSovereignForFlag(flag);
  
  if (!sovereignCode && !sovereignName) {
    // Fallback: try to match by map_outline_match (single feature)
    if (flag.map_outline_match && geoData) {
      const { matchFlagToFeature } = await import('./mapUtils');
      const singleFeature = matchFlagToFeature(flag, geoData);
      return singleFeature ? [singleFeature] : [];
    }
    return [];
  }
  
  return await getRegionsForSovereign(sovereignCode, sovereignName, geoData);
}

