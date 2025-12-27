/**
 * useMapOutline Hook
 * Extracts the common logic for loading and matching map outlines
 * 
 * @param {Object} flag - Flag object with map_outline_match property
 * @returns {Object} { geoData, matchedFeature, loading, error }
 */

import { useEffect, useState } from 'react';
import { loadGeoJSON, matchFlagToFeature } from '../utils/mapUtils';

export function useMapOutline(flag) {
  const [geoData, setGeoData] = useState(null);
  const [matchedFeature, setMatchedFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOutline = async () => {
      // Reset state
      setGeoData(null);
      setMatchedFeature(null);
      setError(null);
      
      if (!flag || !flag.map_outline_match) {
        setError('No map outline assigned to this flag');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load GeoJSON (uses cache if already loaded)
        const data = await loadGeoJSON();
        setGeoData(data);

        // Match flag to feature
        const feature = matchFlagToFeature(flag, data);
        if (!feature) {
          setError('Could not find matching outline in GeoJSON data');
          setLoading(false);
          return;
        }

        setMatchedFeature(feature);
        setLoading(false);
      } catch (err) {
        console.error('Error loading map outline:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadOutline();
  }, [flag]);

  return {
    geoData,
    matchedFeature,
    loading,
    error
  };
}

