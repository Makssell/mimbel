/**
 * MapOutlineDisplay Component
 * Displays a static country outline for the main question (Map to Flag mode)
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useMapOutline } from '../hooks/useMapOutline';
import { featureToSVGPath, matchFlagToFeature, loadGeoJSON, isRussia, isKazakhstan, isTurkey, isGeorgia, isFrance, isNorway, isNetherlands, isDenmark, isSpain, calculateBoundsWithDateLine } from '../utils/mapUtils';
import { getFlagSubregion, getFeatureSubregion, filterFeaturesBySubregion } from '../utils/mapSubregions';
import { matchFlagToAllRegions, shouldExcludeFeature } from '../utils/regionUtils';

// Cache for bounds calculations to avoid recomputing
const boundsCache = new WeakMap();

// Cache for feature-to-flag matches
const featureMatchCache = new Map();

export default function MapOutlineDisplay({ 
  flag, 
  viewMode = 'isolated', // 'isolated' or 'continent'
  outlineOnly = false, // If true, show only outline without continent context
  allFlags = [], // All flags with outlines available in the game
  className = '',
  style = {}
}) {
  const { geoData, matchedFeature, loading, error } = useMapOutline(flag);
  const [continentFeatures, setContinentFeatures] = useState([]);
  const [allRegionsForCountry, setAllRegionsForCountry] = useState([]);
  
  // Use refs to track previous values and avoid unnecessary recalculations
  const prevFlagRef = useRef(null);
  const prevGeoDataRef = useRef(null);
  const loadingRegionsRef = useRef(false);

  // Memoize flag ID for comparison
  const flagId = useMemo(() => flag?.id || JSON.stringify(flag?.map_outline_match), [flag]);

  // Load ALL regions for the active country (including territories like Greenland, Martinique)
  useEffect(() => {
    // Skip if already loading or if dependencies haven't changed
    if (loadingRegionsRef.current || !flag || !geoData) {
      if (!flag || !geoData) {
        setAllRegionsForCountry([]);
      }
      return;
    }

    // Check if flag or geoData actually changed
    const flagChanged = prevFlagRef.current !== flagId;
    const geoDataChanged = prevGeoDataRef.current !== geoData;
    
    if (!flagChanged && !geoDataChanged && allRegionsForCountry.length > 0) {
      return; // No need to reload
    }

    const loadAllRegions = async () => {
      loadingRegionsRef.current = true;
      try {
        // Get all regions for this country's sovereign
        const regions = await matchFlagToAllRegions(flag, geoData);
        // Filter out excluded regions (e.g., Antarctica) - now using direct import
        const filteredRegions = regions.filter(f => !shouldExcludeFeature(f));
        setAllRegionsForCountry(filteredRegions);
        
        // Update refs
        prevFlagRef.current = flagId;
        prevGeoDataRef.current = geoData;
      } catch (err) {
        console.error('Error loading all regions for country:', err);
        // Fallback to single matched feature
        setAllRegionsForCountry(matchedFeature ? [matchedFeature] : []);
      } finally {
        loadingRegionsRef.current = false;
      }
    };

    loadAllRegions();
  }, [flag, flagId, geoData, matchedFeature, allRegionsForCountry.length]);

  // Memoize flags with outlines to avoid filtering on every render
  const flagsWithOutlines = useMemo(() => {
    if (!allFlags || allFlags.length === 0) return [];
    return allFlags.filter(f => f && f.map_outline_match);
  }, [allFlags]);

  // Cache for feature bounds to avoid recalculating
  const getCachedBounds = useCallback((feature) => {
    if (!feature) return { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    
    if (boundsCache.has(feature)) {
      return boundsCache.get(feature);
    }
    
    const bounds = calculateBoundsWithDateLine(feature);
    boundsCache.set(feature, bounds);
    return bounds;
  }, []);

  // Memoize active country bounds
  const activeBounds = useMemo(() => {
    if (!matchedFeature) return null;
    return getCachedBounds(matchedFeature);
  }, [matchedFeature, getCachedBounds]);

  // Memoize center and radius calculations
  const radiusConfig = useMemo(() => {
    if (!activeBounds || activeBounds.minX === Infinity) return null;
    
    const centerX = (activeBounds.minX + activeBounds.maxX) / 2;
    const centerY = (activeBounds.minY + activeBounds.maxY) / 2;
    const radiusDegrees = 30; // Show countries within 30 degrees (adjustable)
    
    return { centerX, centerY, radiusDegrees, activeBounds };
  }, [activeBounds]);

  // Memoize the isWithinRadius function
  const isWithinRadius = useCallback((feature, config) => {
    if (!config) return false;
    
    const featureBounds = getCachedBounds(feature);
    if (featureBounds.minX === Infinity) return false;

    // Calculate center of feature
    const featureCenterX = (featureBounds.minX + featureBounds.maxX) / 2;
    const featureCenterY = (featureBounds.minY + featureBounds.maxY) / 2;

    // Calculate distance (simple Euclidean distance in degrees)
    const dx = featureCenterX - config.centerX;
    const dy = featureCenterY - config.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Also check if bounding boxes overlap (for nearby countries)
    const boxesOverlap = !(
      featureBounds.maxX < config.activeBounds.minX - config.radiusDegrees ||
      featureBounds.minX > config.activeBounds.maxX + config.radiusDegrees ||
      featureBounds.maxY < config.activeBounds.minY - config.radiusDegrees ||
      featureBounds.minY > config.activeBounds.maxY + config.radiusDegrees
    );

    return distance <= config.radiusDegrees || boxesOverlap;
  }, [getCachedBounds]);

  // Create a cache key for nearby features based on matched feature and flags
  const nearbyFeaturesCacheKey = useMemo(() => {
    if (!matchedFeature || !geoData || !flagsWithOutlines.length) return null;
    const featureId = matchedFeature.properties?.ISO_A3 || matchedFeature.properties?.NAME || '';
    const flagsKey = flagsWithOutlines.map(f => f.id).sort().join(',');
    return `${featureId}-${flagsKey.length}`;
  }, [matchedFeature, geoData, flagsWithOutlines]);

  // Load nearby country features when not in outlineOnly mode
  useEffect(() => {
    if (outlineOnly || !matchedFeature || !geoData || !flagsWithOutlines.length || !radiusConfig) {
      setContinentFeatures([]);
      return;
    }

    // Use a timeout to debounce rapid changes
    const timeoutId = setTimeout(async () => {
      try {
        // Match flags to GeoJSON features and filter by radius
        const nearbyFeatures = [];
        
        // Create a Set of ISO codes and names for quick lookup
        const featureIdentifiers = new Set();
        
        // First pass: match flags to features
        for (const flag of flagsWithOutlines) {
          // Create cache key for flag-to-feature match
          const flagKey = `${flag.id}-${flag.map_outline_match}`;
          let feature = featureMatchCache.get(flagKey);
          
          if (!feature) {
            feature = matchFlagToFeature(flag, geoData);
            if (feature) {
              featureMatchCache.set(flagKey, feature);
            }
          }
          
          if (feature && isWithinRadius(feature, radiusConfig)) {
            const identifier = feature.properties?.ISO_A3 || feature.properties?.NAME;
            if (identifier && !featureIdentifiers.has(identifier)) {
              nearbyFeatures.push(feature);
              featureIdentifiers.add(identifier);
            }
          }
        }

        // Second pass: include ALL geographic regions in the area (small islands, territories)
        // Limit iteration to avoid blocking - only check first 1000 features if dataset is huge
        const maxFeaturesToCheck = Math.min(geoData.features.length, 1000);
        for (let i = 0; i < maxFeaturesToCheck; i++) {
          const feature = geoData.features[i];
          if (!feature || !feature.properties) continue;
          
          const identifier = feature.properties.ISO_A3 || feature.properties.NAME;
          if (featureIdentifiers.has(identifier)) continue; // Already included
          
          if (isWithinRadius(feature, radiusConfig) && !shouldExcludeFeature(feature)) {
            nearbyFeatures.push(feature);
            featureIdentifiers.add(identifier);
          }
        }

        // Always include the selected country if not already included
        const selectedIdentifier = matchedFeature.properties?.ISO_A3 || matchedFeature.properties?.NAME;
        if (selectedIdentifier && !featureIdentifiers.has(selectedIdentifier)) {
          nearbyFeatures.push(matchedFeature);
        }

        setContinentFeatures(nearbyFeatures);
      } catch (err) {
        console.error('Error loading nearby country features:', err);
        setContinentFeatures([]);
      }
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [outlineOnly, matchedFeature, geoData, flagsWithOutlines, radiusConfig, isWithinRadius, nearbyFeaturesCacheKey]);

  // Memoize active country features - must be before early returns (Rules of Hooks)
  const activeCountryFeatures = useMemo(() => {
    if (!matchedFeature) return [];
    return allRegionsForCountry.length > 0 
      ? allRegionsForCountry 
      : [matchedFeature];
  }, [allRegionsForCountry, matchedFeature]);

  // Create a Set for quick lookup of active country identifiers
  const activeCountryIdentifiers = useMemo(() => {
    const identifiers = new Set();
    activeCountryFeatures.forEach(acf => {
      if (acf?.properties) {
        if (acf.properties.ISO_A3) identifiers.add(acf.properties.ISO_A3);
        if (acf.properties.NAME) identifiers.add(acf.properties.NAME);
        if (acf.properties.ADMIN) identifiers.add(acf.properties.ADMIN);
      }
    });
    return identifiers;
  }, [activeCountryFeatures]);

  // Memoize display features
  const displayFeatures = useMemo(() => {
    if (!matchedFeature || activeCountryFeatures.length === 0) return [];
    
    if (outlineOnly || viewMode === 'isolated') {
      return activeCountryFeatures;
    }
    
    if (continentFeatures.length === 0) {
      return activeCountryFeatures;
    }
    
    // Filter out features that are already in activeCountryFeatures using Set lookup
    const additionalFeatures = continentFeatures.filter(f => {
      if (!f?.properties) return false;
      return !(
        (f.properties.ISO_A3 && activeCountryIdentifiers.has(f.properties.ISO_A3)) ||
        (f.properties.NAME && activeCountryIdentifiers.has(f.properties.NAME)) ||
        (f.properties.ADMIN && activeCountryIdentifiers.has(f.properties.ADMIN))
      );
    });
    
    return [...activeCountryFeatures, ...additionalFeatures];
  }, [outlineOnly, viewMode, activeCountryFeatures, continentFeatures, activeCountryIdentifiers, matchedFeature]);

  // Memoize bounds calculation
  const bounds = useMemo(() => {
    if (activeCountryFeatures.length === 0) {
      // Fallback: calculate bounds from all features if no featured country
      if (displayFeatures.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
      }
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      displayFeatures.forEach(feature => {
        const featureBounds = getCachedBounds(feature);
        if (featureBounds.minX !== Infinity) {
          minX = Math.min(minX, featureBounds.minX);
          maxX = Math.max(maxX, featureBounds.maxX);
          minY = Math.min(minY, featureBounds.minY);
          maxY = Math.max(maxY, featureBounds.maxY);
        }
      });
      return { minX, maxX, minY, maxY };
    }

    // Calculate bounds from all regions of the active country
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    activeCountryFeatures.forEach(feature => {
      const featureBounds = getCachedBounds(feature);
      if (featureBounds.minX !== Infinity) {
        minX = Math.min(minX, featureBounds.minX);
        maxX = Math.max(maxX, featureBounds.maxX);
        minY = Math.min(minY, featureBounds.minY);
        maxY = Math.max(maxY, featureBounds.maxY);
      }
    });

    return { minX, maxX, minY, maxY };
  }, [activeCountryFeatures, displayFeatures, getCachedBounds]);

  // Memoize viewBox calculations
  const viewBoxConfig = useMemo(() => {
    const padding = 2; // degrees
    const viewBoxX = bounds.minX - padding;
    const viewBoxY = bounds.minY - padding;
    const viewBoxWidth = bounds.maxX - bounds.minX + (padding * 2);
    const viewBoxHeight = bounds.maxY - bounds.minY + (padding * 2);
    
    return {
      x: viewBoxX,
      y: viewBoxY,
      width: viewBoxWidth,
      height: viewBoxHeight
    };
  }, [bounds]);

  // SVG viewBox uses projected coordinates (0, 0, 1000, 1000)
  const viewBox = `0 0 1000 1000`;

  // Memoize SVG paths - this is the most expensive rendering operation
  const svgPaths = useMemo(() => {
    if (displayFeatures.length === 0) return [];
    
    return displayFeatures.map((feature, index) => {
      // Check if this feature is part of the active country using Set lookup
      const isSelected = feature?.properties && (
        (feature.properties.ISO_A3 && activeCountryIdentifiers.has(feature.properties.ISO_A3)) ||
        (feature.properties.NAME && activeCountryIdentifiers.has(feature.properties.NAME)) ||
        (feature.properties.ADMIN && activeCountryIdentifiers.has(feature.properties.ADMIN))
      );

      // Pass viewBox to path generator
      const path = featureToSVGPath(feature, viewBoxConfig);
      
      // Style based on view mode - matching app's dark theme
      const fillColor = (outlineOnly || viewMode === 'isolated' || isSelected) 
        ? 'rgba(108, 92, 231, 0.6)' // Purple accent matching app theme
        : 'rgba(255, 255, 255, 0.1)'; // Subtle white for other countries
      const fillOpacity = 1;
      const strokeColor = (outlineOnly || viewMode === 'isolated' || isSelected) 
        ? 'rgba(108, 92, 231, 0.9)' // Brighter purple stroke
        : 'rgba(255, 255, 255, 0.2)'; // Subtle white stroke for other countries
      const strokeWidth = (outlineOnly || viewMode === 'isolated' || isSelected) 
        ? 2.5 
        : 1.5;

      // Use feature identifier as key for better React reconciliation
      const featureKey = feature.properties?.ISO_A3 || feature.properties?.NAME || index;

      return (
        <path
          key={featureKey}
          d={path}
          fill={fillColor}
          fillOpacity={fillOpacity}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
    });
  }, [displayFeatures, viewBoxConfig, outlineOnly, viewMode, activeCountryIdentifiers]);

  // Early returns AFTER all hooks (Rules of Hooks)
  if (loading) {
    return (
      <div 
        className={className}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          minHeight: '300px',
          ...style
        }}
      >
        <div style={{ fontSize: '18px', color: '#666' }}>Loading outline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={className}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          minHeight: '300px',
          color: '#dc3545',
          ...style
        }}
      >
        <div style={{ fontSize: '16px', textAlign: 'center' }}>⚠️ {error}</div>
      </div>
    );
  }

  if (!matchedFeature) {
    return null;
  }

  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: '300px',
        backgroundColor: 'rgba(21, 21, 21, 0.7)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...style
      }}
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {svgPaths}
      </svg>
    </div>
  );
}

