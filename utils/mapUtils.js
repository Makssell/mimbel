/**
 * Map Utilities
 * Functions for matching flags to GeoJSON features and converting to SVG
 */

let geoDataCache = null;

/**
 * Load and cache GeoJSON data
 * @param {string} dataset - Optional dataset type ('admin1' or 'regions' for regions, otherwise countries)
 * @returns {Promise<Object>} GeoJSON data
 */
export async function loadGeoJSON(dataset = null) {
  // Use cache key based on dataset
  const cacheKey = dataset || 'countries';
  if (geoDataCache && geoDataCache[cacheKey]) {
    return geoDataCache[cacheKey];
  }

  try {
    // Fetch directly from static files for better performance
    let fileName = 'countries_10.geojson';
    if (dataset === 'admin1' || dataset === 'regions') {
      fileName = 'regions_10m.geojson';
    }
    
    const response = await fetch(`/maps/${fileName}`);
    if (!response.ok) {
      throw new Error('Failed to load GeoJSON file');
    }
    const data = await response.json();
    
    // Initialize cache object if needed
    if (!geoDataCache) {
      geoDataCache = {};
    }
    geoDataCache[cacheKey] = data;
    return data;
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    throw error;
  }
}

/**
 * Match a flag to a GeoJSON feature using map_outline_match
 * @param {Object} flag - Flag object with map_outline_match property
 * @param {Object} geoData - GeoJSON data
 * @returns {Object|null} Matched GeoJSON feature or null
 */
export function matchFlagToFeature(flag, geoData) {
  if (!flag || !flag.map_outline_match || !geoData || !geoData.features) {
    return null;
  }

  // Parse match criteria
  const match = typeof flag.map_outline_match === 'string'
    ? JSON.parse(flag.map_outline_match)
    : flag.map_outline_match;

  if (!match) {
    return null;
  }

  // Find matching feature with priority: ISO codes > NAME > ADMIN > SOVEREIGNT
  // This prevents conflicts like Netherlands matching Sint Maarten (both have SOVEREIGNT = "Netherlands")
  let matched = null;
  
  // Priority 1: ISO_A3 (most specific)
  if (match.ISO_A3) {
    matched = geoData.features.find(f => 
      f && f.properties && f.properties.ISO_A3 === match.ISO_A3
    );
    if (matched) return matched;
  }
  
  // Priority 2: ISO_A2 (specific)
  if (match.ISO_A2) {
    matched = geoData.features.find(f => 
      f && f.properties && f.properties.ISO_A2 === match.ISO_A2
    );
    if (matched) return matched;
  }
  
  // Priority 3: NAME (specific country name)
  if (match.NAME) {
    matched = geoData.features.find(f => 
      f && f.properties && f.properties.NAME === match.NAME
    );
    if (matched) return matched;
  }
  
  // Priority 4: ADMIN (country admin name)
  if (match.ADMIN) {
    matched = geoData.features.find(f => 
      f && f.properties && f.properties.ADMIN === match.ADMIN
    );
    if (matched) return matched;
  }
  
  // Priority 5: SOVEREIGNT (least specific - can match multiple territories)
  // Only use if no other match criteria provided
  if (match.SOVEREIGNT && !match.ISO_A3 && !match.ISO_A2 && !match.NAME && !match.ADMIN) {
    matched = geoData.features.find(f => 
      f && f.properties && f.properties.SOVEREIGNT === match.SOVEREIGNT
    );
  }

  return matched || null;
}

/**
 * Convert GeoJSON coordinates to SVG path string using equirectangular projection
 * @param {Array} coordinates - GeoJSON coordinates
 * @param {Object} bounds - Bounding box {minX, maxX, minY, maxY}
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @returns {string} SVG path string
 */
function coordinatesToPath(coordinates, bounds, width, height) {
  const { minX, maxX, minY, maxY } = bounds;
  
  // Calculate scale to fit bounds in SVG dimensions
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const scaleX = width / rangeX;
  const scaleY = height / rangeY;
  const scale = Math.min(scaleX, scaleY);
  
  // Center the projection
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const offsetX = width / 2;
  const offsetY = height / 2;

  // Equirectangular projection (simple lat/lon to x/y)
  const project = (lon, lat) => {
    const x = offsetX + (lon - centerX) * scale;
    const y = offsetY - (lat - centerY) * scale; // Flip Y axis (SVG Y increases downward)
    return [x, y];
  };

  const processRing = (ring) => {
    if (!ring || ring.length === 0) return '';
    const points = ring.map(([lon, lat]) => {
      const [x, y] = project(lon, lat);
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  // Handle different geometry types
  if (Array.isArray(coordinates[0])) {
    if (typeof coordinates[0][0] === 'number') {
      // Simple ring (array of [lon, lat])
      const path = processRing(coordinates);
      return path ? `M ${path} Z` : '';
    } else {
      // Polygon with holes or MultiPolygon
      return coordinates.map(ring => {
        const path = processRing(ring);
        return path ? `M ${path} Z` : '';
      }).filter(Boolean).join(' ');
    }
  }
  
  return '';
}

/**
 * Calculate bounding box for GeoJSON feature
 * @param {Object} feature - GeoJSON feature
 * @returns {Object} Bounding box {minX, maxX, minY, maxY}
 */
function calculateBounds(feature) {
  // Use the date-line aware version
  return calculateBoundsWithDateLine(feature);
}

/**
 * Convert GeoJSON feature to SVG path with proper projection
 * @param {Object} feature - GeoJSON feature
 * @param {Object} viewBox - ViewBox object {x, y, width, height} in geographic coordinates (lon/lat)
 * @returns {string} SVG path string
 */
export function featureToSVGPath(feature, viewBox) {
  if (!feature || !feature.geometry) {
    return '';
  }

  // Calculate bounds from feature if viewBox not provided
  const bounds = calculateBounds(feature);
  if (bounds.minX === Infinity) {
    return '';
  }

  // Check if feature crosses date line
  const crossesDL = crossesDateLine(feature);

  // Use provided viewBox or calculate from bounds
  const { 
    x: viewBoxX = bounds.minX, 
    y: viewBoxY = bounds.minY, 
    width: viewBoxWidth = bounds.maxX - bounds.minX, 
    height: viewBoxHeight = bounds.maxY - bounds.minY 
  } = viewBox || {};

  // Use a standard SVG size for projection (will be scaled by viewBox)
  // This ensures consistent scaling regardless of geographic extent
  const svgWidth = 1000;
  const svgHeight = 1000;

  // Calculate scale factors to fit geographic bounds into SVG dimensions
  const geoRangeX = viewBoxWidth || (bounds.maxX - bounds.minX);
  const geoRangeY = viewBoxHeight || (bounds.maxY - bounds.minY);
  
  // Use the smaller scale to maintain aspect ratio
  const scaleX = svgWidth / geoRangeX;
  const scaleY = svgHeight / geoRangeY;
  const scale = Math.min(scaleX, scaleY);

  // Calculate center of viewBox (not feature bounds) for proper centering
  const viewBoxCenterX = viewBoxX + geoRangeX / 2;
  const viewBoxCenterY = viewBoxY + geoRangeY / 2;
  const offsetX = svgWidth / 2;
  const offsetY = svgHeight / 2;

  // Normalize longitude for date-line-crossing features
  // Shift coordinates so they appear continuous with the focused portion
  const normalizeLon = (lon) => {
    if (!crossesDL) return lon;
    
    // Determine which portion the viewBox is focused on
    // If viewBox center is negative, focus is on western portion
    // If viewBox center is positive, focus is on eastern portion
    const viewBoxCenterLon = viewBoxX + geoRangeX / 2;
    
    if (viewBoxCenterLon < 0) {
      // Focused on western portion - shift positive longitudes to negative
      if (lon > 0) {
        return lon - 360;
      }
    } else {
      // Focused on eastern portion - shift negative longitudes to positive
      if (lon < 0) {
        return lon + 360;
      }
    }
    
    return lon;
  };

  // Equirectangular projection: project lon/lat to SVG coordinates
  const project = (lon, lat) => {
    // Normalize longitude for date-line-crossing countries
    const normalizedLon = normalizeLon(lon);
    // Scale and center the coordinates relative to viewBox center
    const x = offsetX + (normalizedLon - viewBoxCenterX) * scale;
    // Flip Y axis (SVG Y increases downward, but lat increases upward)
    const y = offsetY - (lat - viewBoxCenterY) * scale;
    return [x, y];
  };

  const processRing = (ring) => {
    if (!ring || ring.length === 0) return '';
    const points = ring.map(([lon, lat]) => {
      const [x, y] = project(lon, lat);
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const paths = [];
  
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates.forEach(ring => {
      const path = processRing(ring);
      if (path) paths.push(`M ${path} Z`);
    });
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach(polygon => {
      polygon.forEach(ring => {
        const path = processRing(ring);
        if (path) paths.push(`M ${path} Z`);
      });
    });
  }

  return paths.join(' ');
}

/**
 * Get SVG viewBox for a feature
 * @param {Object} feature - GeoJSON feature
 * @param {number} padding - Padding in degrees
 * @returns {string} SVG viewBox string
 */
export function getFeatureViewBox(feature, padding = 2) {
  const bounds = calculateBounds(feature);
  
  if (bounds.minX === Infinity) {
    return '0 0 400 300';
  }

  const width = bounds.maxX - bounds.minX + (padding * 2);
  const height = bounds.maxY - bounds.minY + (padding * 2);
  const x = bounds.minX - padding;
  const y = bounds.minY - padding;

  // For SVG, we need to flip Y axis, so adjust
  return `${x} ${-y - height} ${width} ${height}`;
}

/**
 * Check if a feature is Russia
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is Russia
 */
export function isRussia(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'RUS' ||
    props.ISO_A2 === 'RU' ||
    props.NAME === 'Russia' ||
    props.ADMIN === 'Russia' ||
    props.SOVEREIGNT === 'Russia'
  );
}

/**
 * Check if a feature is Kazakhstan
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is Kazakhstan
 */
export function isKazakhstan(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'KAZ' ||
    props.ISO_A2 === 'KZ' ||
    props.NAME === 'Kazakhstan' ||
    props.ADMIN === 'Kazakhstan' ||
    props.SOVEREIGNT === 'Kazakhstan'
  );
}

/**
 * Check if a feature is Turkey
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is Turkey
 */
export function isTurkey(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'TUR' ||
    props.ISO_A2 === 'TR' ||
    props.NAME === 'Turkey' ||
    props.ADMIN === 'Turkey' ||
    props.SOVEREIGNT === 'Turkey'
  );
}

/**
 * Check if a feature is Georgia
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is Georgia
 */
export function isGeorgia(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'GEO' ||
    props.ISO_A2 === 'GE' ||
    props.NAME === 'Georgia' ||
    props.ADMIN === 'Georgia' ||
    props.SOVEREIGNT === 'Georgia'
  );
}

/**
 * Check if a feature is France
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is France
 */
export function isFrance(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'FRA' ||
    props.ISO_A2 === 'FR' ||
    props.NAME === 'France' ||
    props.ADMIN === 'France' ||
    props.SOVEREIGNT === 'France'
  );
}

/**
 * Check if a feature is Norway
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is Norway
 */
export function isNorway(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'NOR' ||
    props.ISO_A2 === 'NO' ||
    props.NAME === 'Norway' ||
    props.ADMIN === 'Norway' ||
    props.SOVEREIGNT === 'Norway'
  );
}

/**
 * Check if a feature is Netherlands
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is Netherlands
 */
export function isNetherlands(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'NLD' ||
    props.ISO_A2 === 'NL' ||
    props.NAME === 'Netherlands' ||
    props.ADMIN === 'Netherlands' ||
    props.SOVEREIGNT === 'Netherlands'
  );
}

/**
 * Check if a feature is Denmark
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is Denmark
 */
export function isDenmark(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'DNK' ||
    props.ISO_A2 === 'DK' ||
    props.NAME === 'Denmark' ||
    props.ADMIN === 'Denmark' ||
    props.SOVEREIGNT === 'Denmark'
  );
}

/**
 * Check if a feature is Spain
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature is Spain
 */
export function isSpain(feature) {
  if (!feature || !feature.properties) return false;
  const props = feature.properties;
  return (
    props.ISO_A3 === 'ESP' ||
    props.ISO_A2 === 'ES' ||
    props.NAME === 'Spain' ||
    props.ADMIN === 'Spain' ||
    props.SOVEREIGNT === 'Spain'
  );
}

/**
 * Check if a feature crosses the International Date Line (180° meridian)
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if the feature crosses the date line
 */
function crossesDateLine(feature) {
  if (!feature || !feature.geometry) return false;
  
  let hasPositive = false;
  let hasNegative = false;
  let maxPositive = -Infinity;
  let minNegative = Infinity;
  
  const processCoordinates = (coords) => {
    if (typeof coords[0] === 'number') {
      const [lon] = coords;
      if (lon > 0) {
        hasPositive = true;
        maxPositive = Math.max(maxPositive, lon);
      }
      if (lon < 0) {
        hasNegative = true;
        minNegative = Math.min(minNegative, lon);
      }
    } else {
      coords.forEach(processCoordinates);
    }
  };
  
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates.forEach(processCoordinates);
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach(polygon => {
      polygon.forEach(processCoordinates);
    });
  }
  
  // Crosses date line if has both positive and negative longitudes
  // and they're far enough apart (not just around 0°)
  if (hasPositive && hasNegative) {
    // If the gap between max positive and min negative is large,
    // it likely crosses the date line
    // e.g., 170°E to -170°E = 340° span, but actual span is only 20°
    const span = maxPositive - minNegative;
    return span > 180; // If span > 180°, it crosses the date line
  }
  
  return false;
}

/**
 * Calculate bounding box for GeoJSON feature, handling date line crossings
 * @param {Object} feature - GeoJSON feature
 * @returns {Object} Bounding box {minX, maxX, minY, maxY}
 */
export function calculateBoundsWithDateLine(feature) {
  if (!feature || !feature.geometry) {
    return { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  }
  
  // First, collect all coordinates to analyze
  const allLongitudes = [];
  const allLatitudes = [];
  
  const collectCoordinates = (coords) => {
    if (typeof coords[0] === 'number') {
      const [lon, lat] = coords;
      allLongitudes.push(lon);
      allLatitudes.push(lat);
    } else {
      coords.forEach(collectCoordinates);
    }
  };
  
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates.forEach(collectCoordinates);
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach(polygon => {
      polygon.forEach(collectCoordinates);
    });
  }
  
  if (allLongitudes.length === 0) {
    return { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  }
  
  // Calculate basic bounds
  let minX = Math.min(...allLongitudes);
  let maxX = Math.max(...allLongitudes);
  const minY = Math.min(...allLatitudes);
  const maxY = Math.max(...allLatitudes);
  
  // Check if this crosses the date line
  // If we have both positive and negative longitudes, and the span is > 180°, it crosses
  const hasPositive = allLongitudes.some(lon => lon > 0);
  const hasNegative = allLongitudes.some(lon => lon < 0);
  const span = maxX - minX;
  
  if (hasPositive && hasNegative && span > 180) {
    // Feature crosses the date line
    // We need to find the actual gap and use the larger portion
    
    // Separate coordinates into eastern (positive) and western (negative) groups
    const easternLons = allLongitudes.filter(lon => lon >= 0);
    const westernLons = allLongitudes.filter(lon => lon < 0);
    
    if (easternLons.length > 0 && westernLons.length > 0) {
      const easternMin = Math.min(...easternLons);
      const easternMax = Math.max(...easternLons);
      const westernMin = Math.min(...westernLons);
      const westernMax = Math.max(...westernLons);
      
      // Calculate the gap: from western max to eastern min (wrapping around)
      // e.g., western max = -170, eastern min = 170, gap = 20°
      const gap = easternMin - (westernMax + 360);
      
      // Calculate widths of each portion
      const easternWidth = easternMax - easternMin;
      const westernWidth = westernMax - westernMin;
      
      // Use the larger portion for bounds
      // For most countries (Russia, Fiji), the eastern portion is usually larger
      if (easternWidth >= westernWidth) {
        // Use eastern portion
        minX = easternMin;
        maxX = easternMax;
      } else {
        // Use western portion
        minX = westernMin;
        maxX = westernMax;
      }
    }
  }
  
  return { minX, maxX, minY, maxY };
}

/**
 * Filter flags to only those with map outlines assigned
 * @param {Array} flags - Array of flag objects
 * @returns {Array} Flags with map_outline_match
 */
export function filterFlagsWithOutlines(flags) {
  if (!flags || !Array.isArray(flags)) {
    return [];
  }
  return flags.filter(flag => 
    flag && 
    flag.map_outline_match !== null && 
    flag.map_outline_match !== undefined
  );
}

/**
 * Match multiple flags to their GeoJSON features
 * @param {Array} flags - Array of flag objects
 * @param {Object} geoData - GeoJSON data
 * @returns {Array} Array of {flag, feature} objects
 */
export function matchFlagsToFeatures(flags, geoData) {
  if (!flags || !Array.isArray(flags) || !geoData) {
    return [];
  }

  return flags
    .map(flag => {
      const feature = matchFlagToFeature(flag, geoData);
      return feature ? { flag, feature } : null;
    })
    .filter(Boolean);
}

