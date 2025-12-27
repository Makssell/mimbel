/**
 * Map Subregions
 * Utilities for working with subregions stored in the database
 * Subregions are used ONLY for map display/view bounds, not for game filtering
 */

/**
 * Get subregion from a flag object
 * @param {Object} flag - Flag object with subregion property
 * @returns {string|null} Subregion name or null
 */
export function getFlagSubregion(flag) {
  if (!flag) return null;
  return flag.subregion || null;
}

/**
 * Get subregion for a GeoJSON feature by matching it to flags
 * @param {Object} feature - GeoJSON feature
 * @param {Array} flags - Array of flag objects with subregion property
 * @returns {string|null} Subregion name or null
 */
export function getFeatureSubregion(feature, flags = []) {
  if (!feature || !feature.properties || !flags || flags.length === 0) return null;
  
  // Try to match feature to a flag by ISO codes
  const isoA3 = feature.properties.ISO_A3;
  const isoA2 = feature.properties.ISO_A2;
  const name = feature.properties.NAME || feature.properties.ADMIN;
  
  // Match with priority: ISO codes > NAME > ADMIN (same as main matching logic)
  let matchedFlag = null;
  
  for (const flag of flags) {
    if (!flag.map_outline_match) continue;
    
    try {
      const match = typeof flag.map_outline_match === 'string'
        ? JSON.parse(flag.map_outline_match)
        : flag.map_outline_match;
      
      // Priority 1: ISO_A3 (most specific)
      if (match.ISO_A3 && isoA3 && match.ISO_A3 === isoA3) {
        matchedFlag = flag;
        break;
      }
      
      // Priority 2: ISO_A2
      if (match.ISO_A2 && isoA2 && match.ISO_A2 === isoA2) {
        matchedFlag = flag;
        break;
      }
      
      // Priority 3: NAME
      if (match.NAME && name && match.NAME === name) {
        matchedFlag = flag;
        break;
      }
      
      // Priority 4: ADMIN
      if (match.ADMIN && name && match.ADMIN === name) {
        matchedFlag = flag;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  return matchedFlag ? getFlagSubregion(matchedFlag) : null;
}

/**
 * Check if features belong to the same subregion
 * @param {Array} features - Array of GeoJSON features
 * @param {Array} flags - Array of flag objects with subregion property
 * @returns {string|null} Common subregion name or null
 */
export function getCommonSubregion(features, flags = []) {
  if (!features || features.length === 0) return null;
  
  const subregions = features
    .map(f => getFeatureSubregion(f, flags))
    .filter(Boolean);
  
  if (subregions.length === 0) return null;
  
  // Check if all features belong to the same subregion
  const firstSubregion = subregions[0];
  const allSame = subregions.every(sr => sr === firstSubregion);
  
  return allSame ? firstSubregion : null;
}

/**
 * Filter features to only those in a specific subregion
 * @param {Array} features - Array of GeoJSON features
 * @param {string} subregion - Subregion name
 * @param {Array} flags - Array of flag objects with subregion property
 * @returns {Array} Filtered features
 */
export function filterFeaturesBySubregion(features, subregion, flags = []) {
  if (!subregion) return features;
  return features.filter(f => getFeatureSubregion(f, flags) === subregion);
}

