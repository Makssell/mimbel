/**
 * MapOutlineButton Component
 * Displays a small static country outline as a clickable option (Flag to Map mode)
 */

import { useState, useEffect } from 'react';
import { useMapOutline } from '../hooks/useMapOutline';
import { featureToSVGPath, matchFlagToFeature, isRussia, isKazakhstan, isTurkey, isGeorgia, isFrance, isNorway, isNetherlands, isDenmark, isSpain, calculateBoundsWithDateLine } from '../utils/mapUtils';
import { getFlagSubregion, getFeatureSubregion, filterFeaturesBySubregion } from '../utils/mapSubregions';
import { matchFlagToAllRegions } from '../utils/regionUtils';
import sharedStyles from '../styles/shared.module.css';

export default function MapOutlineButton({ 
  flag, 
  onClick,
  isSelected = false,
  isCorrect = false,
  isIncorrect = false,
  disabled = false,
  outlineOnly = true, // If false, show continent context
  allFlags = [], // All flags with outlines available in the game (for continent view)
  className = ''
}) {
  const { geoData, matchedFeature, loading, error } = useMapOutline(flag);
  const [continentFeatures, setContinentFeatures] = useState([]);
  const [allRegionsForCountry, setAllRegionsForCountry] = useState([]);

  // Load ALL regions for this country (including territories like Greenland, Martinique)
  useEffect(() => {
    const loadAllRegions = async () => {
      if (!flag || !geoData) {
        setAllRegionsForCountry([]);
        return;
      }

      try {
        // Get all regions for this country's sovereign
        const regions = await matchFlagToAllRegions(flag, geoData);
        // Filter out excluded regions (e.g., Antarctica)
        const { shouldExcludeFeature } = await import('../utils/regionUtils');
        const filteredRegions = regions.filter(f => !shouldExcludeFeature(f));
        setAllRegionsForCountry(filteredRegions);
      } catch (err) {
        console.error('Error loading all regions for country:', err);
        // Fallback to single matched feature
        setAllRegionsForCountry(matchedFeature ? [matchedFeature] : []);
      }
    };

    loadAllRegions();
  }, [flag, geoData, matchedFeature]);

  // Load continent features when not in outlineOnly mode
  useEffect(() => {
    const loadContinentFeatures = async () => {
      if (outlineOnly || !matchedFeature || !geoData || !flag || !allFlags || allFlags.length === 0) {
        setContinentFeatures([]);
        return;
      }

      try {
        // Get continent IDs from the current flag
        if (!flag.country_continent || !Array.isArray(flag.country_continent)) {
          setContinentFeatures([]);
          return;
        }

        const continentIds = flag.country_continent.map(cc => {
          if (typeof cc === 'object') {
            return cc.continent_id;
          }
          return cc;
        }).filter(Boolean);

        if (continentIds.length === 0) {
          setContinentFeatures([]);
          return;
        }

        // Filter flags in the same continent that have map outlines
        const continentFlags = allFlags.filter(f => {
          if (!f || !f.map_outline_match || !f.country_continent || !Array.isArray(f.country_continent)) {
            return false;
          }

          const flagContinentIds = f.country_continent.map(cc => {
            if (typeof cc === 'object') {
              return cc.continent_id;
            }
            return cc;
          }).filter(Boolean);

          // Check if any of the flag's continents match our target continent
          return continentIds.some(cid => flagContinentIds.includes(cid));
        });

        // Match these flags to GeoJSON features
        const matchedFeatures = [];
        const { shouldExcludeFeature } = await import('../utils/regionUtils');
        continentFlags.forEach(f => {
          const feature = matchFlagToFeature(f, geoData);
          if (feature && !shouldExcludeFeature(feature)) {
            matchedFeatures.push(feature);
          }
        });

        // Always include the selected country (if not Antarctica)
        const selectedIncluded = matchedFeatures.some(f => {
          if (!f || !f.properties) return false;
          return (
            f.properties.NAME === matchedFeature.properties.NAME ||
            f.properties.ADMIN === matchedFeature.properties.ADMIN ||
            f.properties.ISO_A3 === matchedFeature.properties.ISO_A3 ||
            f.properties.ISO_A2 === matchedFeature.properties.ISO_A2
          );
        });

        if (!selectedIncluded && matchedFeature && !shouldExcludeFeature(matchedFeature)) {
          matchedFeatures.push(matchedFeature);
        }

        // Subregions are used ONLY for map bounds/focus, NOT for filtering displayed countries
        // We always show all continent countries, but use subregion for better bounds calculation
        setContinentFeatures(matchedFeatures);
      } catch (err) {
        console.error('Error loading continent features:', err);
        setContinentFeatures([]);
      }
    };

    loadContinentFeatures();
  }, [outlineOnly, matchedFeature, geoData, flag, allFlags]);

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(flag.id);
    }
  };

  // Determine button style based on state
  const getButtonStyle = () => {
    if (isCorrect) {
      return {
        borderColor: '#28a745',
        borderWidth: '3px',
        boxShadow: '0 0 0 2px rgba(40, 167, 69, 0.3)'
      };
    }
    if (isIncorrect) {
      return {
        borderColor: '#dc3545',
        borderWidth: '3px',
        boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.3)'
      };
    }
    if (isSelected) {
      return {
        borderColor: '#4a90e2',
        borderWidth: '2px'
      };
    }
    return {};
  };

  if (loading) {
    return (
      <button
        className={`${sharedStyles.button} ${className}`}
        disabled={disabled}
        onClick={handleClick}
        style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: 'rgba(21, 21, 21, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          alignSelf: 'center',
          justifySelf: 'center',
          ...getButtonStyle()
        }}
      >
        <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
      </button>
    );
  }

  if (error || !matchedFeature) {
    return (
      <button
        className={`${sharedStyles.button} ${className}`}
        disabled={disabled}
        onClick={handleClick}
        style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: 'rgba(21, 21, 21, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          alignSelf: 'center',
          justifySelf: 'center',
          ...getButtonStyle()
        }}
      >
        <div style={{ fontSize: '12px', color: '#999' }}>No outline</div>
      </button>
    );
  }

  // Determine which features to display
  // For this country, use ALL regions (territories, exclaves, etc.)
  // For other countries in continent view, use their matched features
  const activeCountryFeatures = allRegionsForCountry.length > 0 
    ? allRegionsForCountry 
    : (matchedFeature ? [matchedFeature] : []);
  
  const displayFeatures = outlineOnly 
    ? activeCountryFeatures
    : continentFeatures.length > 0 
      ? [...activeCountryFeatures, ...continentFeatures.filter(f => {
          // Exclude features that are already in activeCountryFeatures
          return !activeCountryFeatures.some(acf => 
            acf.properties && f.properties &&
            (acf.properties.ISO_A3 === f.properties.ISO_A3 ||
             acf.properties.NAME === f.properties.NAME)
          );
        })]
      : activeCountryFeatures;

  // Calculate combined bounds - ALWAYS focus on the active/featured country
  // Use ALL regions of the active country for bounds calculation
  // All other countries are visible but don't affect the bounds/zoom level
  const calculateCombinedBounds = (features) => {
    // Use all regions of the active country for bounds
    const featuresForBounds = activeCountryFeatures.length > 0 
      ? activeCountryFeatures 
      : (matchedFeature ? [matchedFeature] : []);

    if (featuresForBounds.length === 0) {
      // Fallback: calculate bounds from all features if no featured country
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      features.forEach(feature => {
        const featureBounds = calculateBoundsWithDateLine(feature);
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

    featuresForBounds.forEach(feature => {
      const featureBounds = calculateBoundsWithDateLine(feature);
      
      if (featureBounds.minX !== Infinity) {
        minX = Math.min(minX, featureBounds.minX);
        maxX = Math.max(maxX, featureBounds.maxX);
        minY = Math.min(minY, featureBounds.minY);
        maxY = Math.max(maxY, featureBounds.maxY);
      }
    });

    return { minX, maxX, minY, maxY };
  };

  const bounds = calculateCombinedBounds(displayFeatures);
  const padding = 0.5; // Reduced padding to make outlines bigger
  const viewBoxX = bounds.minX - padding;
  const viewBoxY = bounds.minY - padding;
  const viewBoxWidth = bounds.maxX - bounds.minX + (padding * 2);
  const viewBoxHeight = bounds.maxY - bounds.minY + (padding * 2);
  
  // SVG viewBox uses projected coordinates (0, 0, 1000, 1000)
  // The actual geographic bounds are passed to featureToSVGPath for projection
  const viewBox = `0 0 1000 1000`;

  // Generate SVG paths for all features
  const svgPaths = displayFeatures.map((feature, index) => {
    // Check if this feature is part of the active country (any of its regions)
    const isSelectedCountry = activeCountryFeatures.some(acf => 
      acf.properties && feature.properties &&
      (acf.properties.ISO_A3 === feature.properties.ISO_A3 ||
       acf.properties.NAME === feature.properties.NAME ||
       acf.properties.ADMIN === feature.properties.ADMIN ||
       acf.properties.ISO_A2 === feature.properties.ISO_A2)
    );

    // Pass viewBox to path generator
    const path = featureToSVGPath(feature, {
      x: viewBoxX,
      y: viewBoxY,
      width: viewBoxWidth,
      height: viewBoxHeight
    });

    // Style based on state and view mode - matching app's dark theme
    const fillColor = isCorrect 
      ? 'rgba(46, 204, 113, 0.7)' // Green for correct
      : isIncorrect 
        ? 'rgba(231, 76, 60, 0.7)' // Red for incorrect
        : (outlineOnly || isSelectedCountry)
          ? 'rgba(108, 92, 231, 0.6)' // Purple accent matching app theme
          : 'rgba(255, 255, 255, 0.1)'; // Subtle white for continent countries
    const fillOpacity = 1; // Always use full opacity with rgba colors
    const strokeColor = isCorrect 
      ? 'rgba(46, 204, 113, 0.9)' // Brighter green stroke
      : isIncorrect 
        ? 'rgba(231, 76, 60, 0.9)' // Brighter red stroke
        : (outlineOnly || isSelectedCountry)
          ? 'rgba(108, 92, 231, 0.9)' // Brighter purple stroke
          : 'rgba(255, 255, 255, 0.2)'; // Subtle white stroke for continent countries
    const strokeWidth = isCorrect || isIncorrect 
      ? 2.5 
      : (outlineOnly || isSelectedCountry)
        ? 2.5
        : 1.5;

    return (
      <path
        key={index}
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

  return (
    <button
      className={`${sharedStyles.button} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        width: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(21, 21, 21, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        alignSelf: 'center',
        justifySelf: 'center',
        ...getButtonStyle()
      }}
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          pointerEvents: 'none'
        }}
      >
        {svgPaths}
      </svg>
    </button>
  );
}

