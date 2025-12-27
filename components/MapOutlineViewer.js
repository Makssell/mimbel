'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Helper function to check if a feature is Russia
function isRussia(feature) {
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

// Helper function to check if a feature is Kazakhstan
function isKazakhstan(feature) {
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

// Helper function to check if a feature is Turkey
function isTurkey(feature) {
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

// Helper function to check if a feature is Georgia
function isGeorgia(feature) {
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

// Helper function to check if a feature is France
function isFrance(feature) {
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

// Helper function to check if a feature is Norway
function isNorway(feature) {
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

// Helper function to check if a feature is Netherlands
function isNetherlands(feature) {
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

// Helper function to check if a feature is Denmark
function isDenmark(feature) {
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

// Helper function to check if a feature is Spain
function isSpain(feature) {
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

// Component to fit bounds to features
function FitBounds({ features, viewMode, isEurope }) {
  const map = useMap();
  
  useEffect(() => {
    if (features && features.length > 0) {
      // When viewing Europe, exclude Russia, Kazakhstan, Turkey, Georgia, France, Norway, Netherlands, Denmark, and Spain from bounds calculation
      // These are transcontinental countries or countries with overseas territories that stretch the Europe view
      const featuresForBounds = isEurope 
        ? features.filter(f => !isRussia(f) && !isKazakhstan(f) && !isTurkey(f) && !isGeorgia(f) && !isFrance(f) && !isNorway(f) && !isNetherlands(f) && !isDenmark(f) && !isSpain(f))
        : features;
      
      // If all features were excluded countries, fall back to all features
      const boundsFeatures = featuresForBounds.length > 0 ? featuresForBounds : features;
      
      if (boundsFeatures.length > 0) {
        const geoJsonLayer = L.geoJSON({ type: 'FeatureCollection', features: boundsFeatures });
        const bounds = geoJsonLayer.getBounds();
        map.flyToBounds(bounds, {
          padding: viewMode === 'continent' ? [30, 30] : [50, 50],
          maxZoom: viewMode === 'continent' ? 4 : 6,
          duration: 1.5
        });
      }
    }
  }, [features, viewMode, map, isEurope]);
  
  return null;
}

export default function MapOutlineViewer({ countryName, mapOutlineMatch, flagId, continents, allFlags }) {
  const [geoData, setGeoData] = useState(null);
  const [matchedFeature, setMatchedFeature] = useState(null);
  const [continentFeatures, setContinentFeatures] = useState([]);
  const [viewMode, setViewMode] = useState('isolated'); // 'isolated' or 'continent'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [continentName, setContinentName] = useState(null);
  const mapRef = useRef(null);
  const geoJsonRef = useRef(null);

  useEffect(() => {
    const loadAndMatch = async () => {
      try {
        setLoading(true);
        
        // Parse the match criteria
        const match = typeof mapOutlineMatch === 'string' 
          ? JSON.parse(mapOutlineMatch) 
          : mapOutlineMatch;

        if (!match) {
          setError('No map outline match data found');
          setLoading(false);
          return;
        }

        // Load GeoJSON directly from static files
        const response = await fetch('/maps/countries_10.geojson');
        if (!response.ok) {
          throw new Error('Failed to load GeoJSON file');
        }
        const data = await response.json();
        setGeoData(data);

        // Find matching feature with priority: ISO codes > NAME > ADMIN > SOVEREIGNT
        // This prevents conflicts like Netherlands matching Sint Maarten
        let matched = null;
        if (data.features) {
          // Priority 1: ISO_A3 (most specific)
          if (match.ISO_A3) {
            matched = data.features.find(f => 
              f && f.properties && f.properties.ISO_A3 === match.ISO_A3
            );
          }
          
          // Priority 2: ISO_A2 (specific)
          if (!matched && match.ISO_A2) {
            matched = data.features.find(f => 
              f && f.properties && f.properties.ISO_A2 === match.ISO_A2
            );
          }
          
          // Priority 3: NAME (specific country name)
          if (!matched && match.NAME) {
            matched = data.features.find(f => 
              f && f.properties && f.properties.NAME === match.NAME
            );
          }
          
          // Priority 4: ADMIN (country admin name)
          if (!matched && match.ADMIN) {
            matched = data.features.find(f => 
              f && f.properties && f.properties.ADMIN === match.ADMIN
            );
          }
          
          // Priority 5: SOVEREIGNT (least specific - only if no other criteria)
          if (!matched && match.SOVEREIGNT && !match.ISO_A3 && !match.ISO_A2 && !match.NAME && !match.ADMIN) {
            matched = data.features.find(f => 
              f && f.properties && f.properties.SOVEREIGNT === match.SOVEREIGNT
            );
          }

          if (matched) {
            setMatchedFeature(matched);
            
            // If we have continent info, find other countries in the same continent
            if (continents && continents.length > 0 && data.features && allFlags) {
              // Extract continent name - handle nested structure
              let continentNameValue = null;
              if (typeof continents[0] === 'object') {
                continentNameValue = continents[0].name || (continents[0].continents && continents[0].continents.name);
              } else {
                continentNameValue = continents[0];
              }
              setContinentName(continentNameValue);
              
              try {
                // Get continent IDs from the continents array - handle nested structure
                const continentIds = continents.map(c => {
                  if (typeof c === 'object') {
                    // Check for nested continents object first
                    if (c.continents && typeof c.continents === 'object') {
                      return c.continents.id || c.continents.continent_id;
                    }
                    return c.id || c.continent_id;
                  }
                  return c;
                }).filter(Boolean);
                
                console.log('Looking for continent IDs:', continentIds);
                console.log('Total flags to check:', allFlags.length);
                
                // Filter flags in the same continent
                const continentFlags = allFlags.filter(flag => {
                  if (!flag.country_continent || !Array.isArray(flag.country_continent)) {
                    return false;
                  }
                  
                  // Extract continent IDs from flag's country_continent relationships
                  const flagContinentIds = flag.country_continent.map(cc => {
                    if (typeof cc === 'object') {
                      // Handle nested structure: country_continent -> continents
                      if (cc.continents && typeof cc.continents === 'object') {
                        return cc.continents.id || cc.continents.continent_id;
                      }
                      // Direct continent_id
                      return cc.continent_id;
                    }
                    return cc;
                  }).filter(Boolean);
                  
                  // Check if any of the flag's continents match our target continent
                  const isInContinent = continentIds.some(cid => flagContinentIds.includes(cid));
                  return isInContinent;
                });
                
                console.log(`Found ${continentFlags.length} flags in continent ${continentNameValue}`);
                
                // Now match these flags to GeoJSON features (only those with assigned outlines)
                const matchedFeatures = [];
                
                continentFlags.forEach(flag => {
                  // Only include flags that have map outlines assigned
                  if (!flag || !flag.map_outline_match) return;
                  
                  try {
                    const flagMatch = typeof flag.map_outline_match === 'string'
                      ? JSON.parse(flag.map_outline_match)
                      : flag.map_outline_match;
                    
                    const matched = data.features.find(f => {
                      if (!f || !f.properties) return false;
                      const props = f.properties;
                      return (
                        (flagMatch.ISO_A3 && props.ISO_A3 === flagMatch.ISO_A3) ||
                        (flagMatch.ISO_A2 && props.ISO_A2 === flagMatch.ISO_A2) ||
                        (flagMatch.NAME && props.NAME === flagMatch.NAME) ||
                        (flagMatch.ADMIN && props.ADMIN === flagMatch.ADMIN)
                      );
                    });
                    
                    if (matched && matched.properties) {
                      matchedFeatures.push(matched);
                    }
                  } catch (err) {
                    console.warn('Error matching flag to GeoJSON:', err, flag);
                  }
                });
                
                // Filter out any null/undefined features
                const validFeatures = matchedFeatures.filter(f => f && f.properties && f.geometry);
                
                console.log(`Matched ${validFeatures.length} GeoJSON features for continent view`);
                
                // Always include the selected country in the continent view (if it's valid)
                if (matchedFeature && matchedFeature.properties) {
                  const selectedIncluded = validFeatures.some(f => {
                    if (!f || !f.properties) return false;
                    return (
                      f.properties.NAME === matchedFeature.properties.NAME ||
                      f.properties.ADMIN === matchedFeature.properties.ADMIN ||
                      f.properties.ISO_A3 === matchedFeature.properties.ISO_A3 ||
                      f.properties.ISO_A2 === matchedFeature.properties.ISO_A2
                    );
                  });
                  
                  if (!selectedIncluded) {
                    validFeatures.push(matchedFeature);
                    console.log('Added selected country to continent view');
                  }
                }
                
                // Only set continent features if we found matches
                // Don't fallback to all countries - show only continent countries
                setContinentFeatures(validFeatures);
              } catch (err) {
                console.error('Error processing continent countries:', err);
                // Don't fallback to all countries - show empty or just selected (if valid)
                if (matchedFeature && matchedFeature.properties) {
                  setContinentFeatures([matchedFeature]);
                } else {
                  setContinentFeatures([]);
                }
              }
            } else {
              // No continent info or allFlags - can't show continent view
              console.log('No continent info or allFlags available');
              // Just show the selected country (if valid)
              if (matchedFeature && matchedFeature.properties) {
                setContinentFeatures([matchedFeature]);
              } else {
                setContinentFeatures([]);
              }
            }
          } else {
            setError('Could not find matching outline in GeoJSON data');
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (mapOutlineMatch) {
      loadAndMatch();
    } else {
      setError('No map outline assigned');
      setLoading(false);
    }
  }, [mapOutlineMatch, flagId, continents, allFlags]);

  // Game-style: Isolated country outline
  const getIsolatedStyle = () => {
    return {
      fillColor: '#4a90e2', // Game blue color
      weight: 2,
      opacity: 1,
      color: '#2c5aa0', // Darker blue border
      dashArray: '',
      fillOpacity: 0.4 // Semi-transparent fill
    };
  };

  // Game-style: Continent view - highlighted country vs others
  const getContinentStyle = (feature) => {
    const isSelected = matchedFeature && (
      matchedFeature.properties.NAME === feature.properties.NAME ||
      matchedFeature.properties.ADMIN === feature.properties.ADMIN ||
      matchedFeature.properties.ISO_A3 === feature.properties.ISO_A3 ||
      matchedFeature.properties.ISO_A2 === feature.properties.ISO_A2
    );

    if (isSelected) {
      // Highlighted country - bright blue
      return {
        fillColor: '#4a90e2',
        weight: 3,
        opacity: 1,
        color: '#2c5aa0',
        dashArray: '',
        fillOpacity: 0.6
      };
    } else {
      // Background countries - muted gray
      return {
        fillColor: '#d0d0d0',
        weight: 1,
        opacity: 0.8,
        color: '#a0a0a0',
        dashArray: '',
        fillOpacity: 0.15 // Very subtle fill
      };
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: '18px'
      }}>
        Loading outline...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: '18px',
        color: 'red',
        padding: '20px'
      }}>
        <div style={{ marginBottom: '10px' }}>⚠️ Error</div>
        <div style={{ fontSize: '14px', textAlign: 'center' }}>{error}</div>
      </div>
    );
  }

  if (!matchedFeature) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: '18px',
        color: '#666'
      }}>
        No matching outline found
      </div>
    );
  }

  // Create feature collections based on view mode
  const isolatedCollection = matchedFeature ? {
    type: 'FeatureCollection',
    features: [matchedFeature]
  } : null;

  // Filter out any invalid features before creating collection
  const validContinentFeatures = continentFeatures.filter(f => 
    f && f.properties && f.geometry && f.type === 'Feature'
  );
  
  const continentCollection = validContinentFeatures.length > 0 ? {
    type: 'FeatureCollection',
    features: validContinentFeatures
  } : null;

  const featureName = matchedFeature?.properties.NAME || matchedFeature?.properties.ADMIN || countryName;
  const featuresToDisplay = viewMode === 'isolated' 
    ? [matchedFeature].filter(Boolean)
    : continentFeatures;

  // Check if we're viewing Europe (continent_id = 3)
  const isViewingEurope = continents?.some(c => {
    const continentId = typeof c === 'object' 
      ? (c.continents?.id || c.continents?.continent_id || c.id || c.continent_id)
      : c;
    return continentId === 3 || continentId === '3';
  }) && viewMode === 'continent';

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'system-ui, sans-serif', flexDirection: 'column' }}>
      {/* Game Preview Header */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Game Preview</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            {viewMode === 'isolated' 
              ? `Isolated outline for <strong>${countryName}</strong>`
              : `Continent view: <strong>${countryName}</strong> highlighted${continentName ? ` in ${continentName}` : ''}`
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#e9ecef',
            borderRadius: '6px',
            padding: '4px',
            gap: '4px'
          }}>
            <button
              onClick={() => setViewMode('isolated')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'isolated' ? '#4a90e2' : 'transparent',
                color: viewMode === 'isolated' ? 'white' : '#666',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: viewMode === 'isolated' ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Isolated
            </button>
            <button
              onClick={() => setViewMode('continent')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'continent' ? '#4a90e2' : 'transparent',
                color: viewMode === 'continent' ? 'white' : '#666',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: viewMode === 'continent' ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Continent
            </button>
          </div>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {featureName}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: '#f5f5f5' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          whenCreated={(map) => { mapRef.current = map; }}
        >
          {/* Display features based on view mode */}
          {viewMode === 'isolated' && isolatedCollection && (
            <GeoJSON
              ref={geoJsonRef}
              data={isolatedCollection}
              style={getIsolatedStyle}
            />
          )}
          
          {viewMode === 'continent' && continentCollection && continentCollection.features.length > 0 && (
            <GeoJSON
              ref={geoJsonRef}
              data={continentCollection}
              style={getContinentStyle}
            />
          )}
          
          {viewMode === 'continent' && (!continentCollection || continentCollection.features.length === 0) && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              textAlign: 'center',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                No other countries found in the same continent with assigned outlines.
              </p>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                Assign outlines to other countries in this continent to see them here.
              </p>
            </div>
          )}
          
          {/* Auto-zoom to features */}
          <FitBounds features={featuresToDisplay} viewMode={viewMode} isEurope={isViewingEurope} />
        </MapContainer>

        {/* Game-style overlay info (optional, can be toggled) */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '14px',
          maxWidth: '300px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Outline Info</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <div><strong>Matched as:</strong> {featureName}</div>
            {matchedFeature.properties.ISO_A3 && (
              <div><strong>ISO A3:</strong> {matchedFeature.properties.ISO_A3}</div>
            )}
            {matchedFeature.properties.ISO_A2 && (
              <div><strong>ISO A2:</strong> {matchedFeature.properties.ISO_A2}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

