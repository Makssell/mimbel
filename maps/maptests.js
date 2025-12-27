'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle zoom to bounds
function ZoomToBounds({ bounds, selectedCountry }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && selectedCountry) {
      // Use flyToBounds for smooth animation
      map.flyToBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 8,
        duration: 1.5
      });
    }
  }, [bounds, selectedCountry, map]);
  
  return null;
}

export default function MapTester() {
  const [countriesData, setCountriesData] = useState(null);
  const [admin1Data, setAdmin1Data] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [filteredStates, setFilteredStates] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [highlightedCountry, setHighlightedCountry] = useState(null);
  const [highlightedState, setHighlightedState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [datasetStats, setDatasetStats] = useState(null);
  const countriesGeoJsonRef = useRef(null);
  const statesGeoJsonRef = useRef(null);
  const mapRef = useRef(null);

  // Load both GeoJSON datasets
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        setLoading(true);
        
        // Load countries directly from static files
        const countriesResponse = await fetch('/maps/countries_10.geojson');
        if (!countriesResponse.ok) {
          throw new Error('Failed to load countries GeoJSON file');
        }
        const countries = await countriesResponse.json();
        setCountriesData(countries);
        
        // Load admin1/regions directly from static files
        let admin1 = null;
        try {
          const admin1Response = await fetch('/maps/regions_10m.geojson');
          if (admin1Response.ok) {
            admin1 = await admin1Response.json();
            setAdmin1Data(admin1);
          } else {
            console.warn('Admin1 data not available');
          }
        } catch (err) {
          console.warn('Error loading admin1 data:', err);
        }
        
        // Calculate dataset statistics
        if (countries.features) {
          const countryList = countries.features.map(feature => ({
            name: feature.properties.NAME || feature.properties.ADMIN || 'Unknown',
            iso2: feature.properties.ISO_A2 || '',
            iso3: feature.properties.ISO_A3 || '',
            admin: feature.properties.ADMIN || '',
            sovereign: feature.properties.SOVEREIGNT || '',
            feature: feature
          }));
          setFilteredCountries(countryList);
          
          // Calculate stats
          const stats = {
            totalCountries: countries.features.length,
            totalStates: admin1?.features?.length || 0,
            geometryTypes: {},
            hasISO2: countries.features.filter(f => f.properties.ISO_A2).length,
            hasISO3: countries.features.filter(f => f.properties.ISO_A3).length,
            uniqueSovereigns: new Set(countries.features.map(f => f.properties.SOVEREIGNT).filter(Boolean)).size,
            sampleProperties: Object.keys(countries.features[0].properties || {}).length
          };
          
          countries.features.forEach(f => {
            const type = f.geometry?.type || 'unknown';
            stats.geometryTypes[type] = (stats.geometryTypes[type] || 0) + 1;
          });
          
          setDatasetStats(stats);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // Update filtered states when country is selected
  useEffect(() => {
    if (selectedCountry && admin1Data?.features) {
      const countryProps = selectedCountry.properties;
      const countryName = countryProps.NAME || countryProps.ADMIN;
      const sovereign = countryProps.SOVEREIGNT;
      const iso3 = countryProps.ISO_A3;
      const admin = countryProps.ADMIN;
      
      // Filter states that belong to this country
      const filtered = admin1Data.features.filter(state => {
        const stateProps = state.properties;
        // Match by SOVEREIGNT, ADMIN, or ISO_A3
        return (
          (sovereign && stateProps.sov_a3 === iso3) ||
          (admin && stateProps.admin === admin) ||
          (iso3 && stateProps.adm0_a3 === iso3) ||
          (stateProps.admin === countryName)
        );
      });
      
      setFilteredStates({
        type: 'FeatureCollection',
        features: filtered
      });
    } else {
      setFilteredStates(null);
    }
  }, [selectedCountry, admin1Data]);

  // Filter countries based on search term
  useEffect(() => {
    if (!countriesData || !searchTerm) {
      if (countriesData && countriesData.features) {
        const countries = countriesData.features.map(feature => ({
          name: feature.properties.NAME || feature.properties.ADMIN || 'Unknown',
          iso2: feature.properties.ISO_A2 || '',
          iso3: feature.properties.ISO_A3 || '',
          admin: feature.properties.ADMIN || '',
          sovereign: feature.properties.SOVEREIGNT || '',
          feature: feature
        }));
        setFilteredCountries(countries);
      }
      return;
    }

    const filtered = countriesData.features
      .filter(feature => {
        const props = feature.properties;
        const searchLower = searchTerm.toLowerCase();
        return (
          (props.NAME && props.NAME.toLowerCase().includes(searchLower)) ||
          (props.ADMIN && props.ADMIN.toLowerCase().includes(searchLower)) ||
          (props.ISO_A2 && props.ISO_A2.toLowerCase().includes(searchLower)) ||
          (props.ISO_A3 && props.ISO_A3.toLowerCase().includes(searchLower)) ||
          (props.SOVEREIGNT && props.SOVEREIGNT.toLowerCase().includes(searchLower))
        );
      })
      .map(feature => ({
        name: feature.properties.NAME || feature.properties.ADMIN || 'Unknown',
        iso2: feature.properties.ISO_A2 || '',
        iso3: feature.properties.ISO_A3 || '',
        admin: feature.properties.ADMIN || '',
        sovereign: feature.properties.SOVEREIGNT || '',
        feature: feature
      }));

    setFilteredCountries(filtered);
  }, [searchTerm, countriesData]);

  // Style function for countries (thicker, darker borders)
  const getCountryStyle = (feature) => {
    const isSelected = selectedCountry && 
      (selectedCountry.properties.NAME === feature.properties.NAME ||
       selectedCountry.properties.ADMIN === feature.properties.ADMIN);
    const isHighlighted = highlightedCountry === (feature.properties.NAME || feature.properties.ADMIN);
    
    return {
      fillColor: isSelected ? '#ff6b6b' : isHighlighted ? '#4ecdc4' : '#3388ff',
      weight: isSelected ? 4 : isHighlighted ? 3 : 2, // Thicker borders for countries
      opacity: 1,
      color: isSelected ? '#fff' : isHighlighted ? '#fff' : '#333', // Darker borders
      dashArray: '',
      fillOpacity: isSelected ? 0.7 : isHighlighted ? 0.6 : 0.3
    };
  };

  // Style function for states/provinces (thinner, lighter borders)
  const getStateStyle = (feature) => {
    const isSelected = selectedState && 
      selectedState.properties.name === feature.properties.name;
    const isHighlighted = highlightedState === feature.properties.name;
    
    return {
      fillColor: isSelected ? '#51cf66' : isHighlighted ? '#ffd43b' : '#69db7c',
      weight: isSelected ? 2 : isHighlighted ? 1.5 : 1, // Thinner borders for states
      opacity: 0.8,
      color: isSelected ? '#2f9e44' : isHighlighted ? '#fab005' : '#868e96', // Lighter borders
      dashArray: '',
      fillOpacity: isSelected ? 0.6 : isHighlighted ? 0.5 : 0.25
    };
  };

  // Event handlers for countries
  const onEachCountryFeature = (feature, layer) => {
    const props = feature.properties;
    const countryName = props.NAME || props.ADMIN || 'Unknown';
    
    // Popup on click
    layer.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${countryName}</h3>
        <table style="width: 100%; font-size: 12px;">
          ${props.ISO_A2 ? `<tr><td><strong>ISO A2:</strong></td><td>${props.ISO_A2}</td></tr>` : ''}
          ${props.ISO_A3 ? `<tr><td><strong>ISO A3:</strong></td><td>${props.ISO_A3}</td></tr>` : ''}
          ${props.ADMIN ? `<tr><td><strong>Admin:</strong></td><td>${props.ADMIN}</td></tr>` : ''}
          ${props.SOVEREIGNT ? `<tr><td><strong>Sovereign:</strong></td><td>${props.SOVEREIGNT}</td></tr>` : ''}
          ${props.TYPE ? `<tr><td><strong>Type:</strong></td><td>${props.TYPE}</td></tr>` : ''}
        </table>
        <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">
          Click to view states/provinces
        </p>
      </div>
    `);

    // Click handler - select country and show states
    layer.on({
      click: (e) => {
        setSelectedCountry(feature);
        setSelectedState(null);
        
        // Zoom to country bounds with animation
        const bounds = layer.getBounds();
        if (mapRef.current) {
          mapRef.current.flyToBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 8,
            duration: 1.5
          });
        }
        
        // Prevent event propagation
        L.DomEvent.stopPropagation(e);
      },
      mouseover: () => {
        if (!selectedCountry || selectedCountry.properties.NAME !== countryName) {
          setHighlightedCountry(countryName);
          layer.setStyle({
            fillOpacity: 0.7,
            weight: 3,
            color: '#fff'
          });
        }
      },
      mouseout: () => {
        setHighlightedCountry(null);
        if (!selectedCountry || selectedCountry.properties.NAME !== countryName) {
          layer.setStyle({
            fillOpacity: 0.3,
            weight: 2,
            color: '#333'
          });
        }
      }
    });
  };

  // Event handlers for states/provinces
  const onEachStateFeature = (feature, layer) => {
    const props = feature.properties;
    const stateName = props.name || 'Unknown';
    const stateType = props.type_en || props.type || '';
    
    // Tooltip on hover
    layer.bindTooltip(stateName, {
      permanent: false,
      direction: 'center',
      className: 'state-tooltip'
    });
    
    // Popup on click
    layer.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${stateName}</h3>
        <table style="width: 100%; font-size: 12px;">
          ${stateType ? `<tr><td><strong>Type:</strong></td><td>${stateType}</td></tr>` : ''}
          ${props.admin ? `<tr><td><strong>Country:</strong></td><td>${props.admin}</td></tr>` : ''}
          ${props.iso_3166_2 ? `<tr><td><strong>ISO 3166-2:</strong></td><td>${props.iso_3166_2}</td></tr>` : ''}
          ${props.code_hasc ? `<tr><td><strong>HASC:</strong></td><td>${props.code_hasc}</td></tr>` : ''}
        </table>
      </div>
    `);

    // Click handler
    layer.on({
      click: (e) => {
        setSelectedState(feature);
        L.DomEvent.stopPropagation(e);
      },
      mouseover: () => {
        setHighlightedState(stateName);
        layer.setStyle({
          fillOpacity: 0.6,
          weight: 2,
          color: '#2f9e44'
        });
      },
      mouseout: () => {
        setHighlightedState(null);
        if (!selectedState || selectedState.properties.name !== stateName) {
          layer.setStyle({
            fillOpacity: 0.25,
            weight: 1,
            color: '#868e96'
          });
        }
      }
    });
  };

  // Handle country selection from list
  const handleCountrySelect = (country) => {
    setSelectedCountry(country.feature);
    setSelectedState(null);
    setSearchTerm(country.name);
    
    // Zoom to country - find layer by feature properties
    if (countriesGeoJsonRef.current && mapRef.current) {
      const featureName = country.feature.properties.NAME || country.feature.properties.ADMIN;
      countriesGeoJsonRef.current.eachLayer((layer) => {
        const layerFeature = layer.feature;
        const layerName = layerFeature?.properties?.NAME || layerFeature?.properties?.ADMIN;
        if (layerName === featureName) {
          const bounds = layer.getBounds();
          mapRef.current.flyToBounds(bounds, { 
            padding: [100, 100], 
            maxZoom: 8,
            duration: 1.5
          });
        }
      });
    }
  };

  // Reset to country view
  const handleReset = () => {
    setSelectedCountry(null);
    setSelectedState(null);
    setFilteredStates(null);
    if (mapRef.current) {
      mapRef.current.setView([20, 0], 2);
    }
  };

  // Get bounds for selected country
  const getSelectedCountryBounds = () => {
    if (selectedCountry && countriesGeoJsonRef.current) {
      const selectedName = selectedCountry.properties.NAME || selectedCountry.properties.ADMIN;
      let bounds = null;
      countriesGeoJsonRef.current.eachLayer((layer) => {
        const layerFeature = layer.feature;
        const layerName = layerFeature?.properties?.NAME || layerFeature?.properties?.ADMIN;
        if (layerName === selectedName) {
          bounds = layer.getBounds();
        }
      });
      return bounds;
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading map data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '350px', 
        borderRight: '1px solid #ddd', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Map Tester</h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: showInfo ? '#e3f2fd' : 'white'
              }}
            >
              {showInfo ? 'Hide' : 'Show'} Info
            </button>
          </div>
          
          {/* Back button when country is selected */}
          {selectedCountry && (
            <button
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                color: '#333'
              }}
            >
              ← Back to Countries View
            </button>
          )}

          {/* Dataset Information Panel */}
          {showInfo && datasetStats && (
            <div style={{
              marginBottom: '15px',
              padding: '12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
                📊 Dataset Information
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>Countries:</strong> {datasetStats.totalCountries}
              </div>
              {datasetStats.totalStates > 0 && (
                <div style={{ marginBottom: '6px' }}>
                  <strong>States/Provinces:</strong> {datasetStats.totalStates}
                </div>
              )}
              {selectedCountry && filteredStates && (
                <div style={{ marginBottom: '6px', paddingTop: '8px', borderTop: '1px solid #ffc107' }}>
                  <strong>States in selected country:</strong> {filteredStates.features.length}
                </div>
              )}
            </div>
          )}
          
          <input
            type="text"
            placeholder={selectedCountry ? "Search states..." : "Search countries..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
            {selectedCountry && filteredStates 
              ? `${filteredStates.features.length} states/provinces found`
              : `${filteredCountries.length} countries found`}
          </p>
        </div>

        {/* Country/State List */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '10px'
        }}>
          {selectedCountry && filteredStates ? (
            // Show states list
            filteredStates.features.map((state, index) => (
              <div
                key={index}
                onClick={() => setSelectedState(state)}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: selectedState && selectedState.properties.name === state.properties.name
                    ? '#d4edda'
                    : 'white',
                  border: selectedState && selectedState.properties.name === state.properties.name
                    ? '2px solid #28a745'
                    : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {state.properties.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {state.properties.type_en || state.properties.type || ''}
                </div>
              </div>
            ))
          ) : (
            // Show countries list
            filteredCountries.map((country, index) => (
              <div
                key={index}
                onClick={() => handleCountrySelect(country)}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: selectedCountry && 
                    (selectedCountry.properties.NAME === country.name || 
                     selectedCountry.properties.ADMIN === country.name)
                    ? '#e3f2fd' 
                    : 'white',
                  border: selectedCountry && 
                    (selectedCountry.properties.NAME === country.name || 
                     selectedCountry.properties.ADMIN === country.name)
                    ? '2px solid #2196f3'
                    : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {country.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {country.iso2 && `ISO2: ${country.iso2}`}
                  {country.iso2 && country.iso3 && ' • '}
                  {country.iso3 && `ISO3: ${country.iso3}`}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Country/State Info */}
        {(selectedCountry || selectedState) && (
          <div style={{ 
            padding: '20px', 
            borderTop: '1px solid #ddd',
            backgroundColor: 'white',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {selectedCountry && (
              <>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
                  {selectedCountry.properties.NAME || selectedCountry.properties.ADMIN}
                </h3>
                {filteredStates && (
                  <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#666' }}>
                    {filteredStates.features.length} states/provinces
                  </p>
                )}
              </>
            )}
            {selectedState && (
              <>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
                  {selectedState.properties.name}
                </h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#666' }}>
                  {selectedState.properties.type_en || selectedState.properties.type || ''}
                </p>
              </>
            )}
            <div style={{ fontSize: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries((selectedState || selectedCountry).properties)
                    .filter(([key]) => !key.startsWith('geometry'))
                    .slice(0, 15) // Limit to first 15 properties
                    .map(([key, value]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ 
                          padding: '6px 0', 
                          fontWeight: 'bold', 
                          width: '40%',
                          verticalAlign: 'top'
                        }}>
                          {key}:
                        </td>
                        <td style={{ 
                          padding: '6px 0', 
                          wordBreak: 'break-word',
                          verticalAlign: 'top'
                        }}>
                          {value !== null && value !== undefined ? String(value) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          whenCreated={(map) => { mapRef.current = map; }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Countries layer - always visible */}
          {countriesData && (
            <GeoJSON
              ref={countriesGeoJsonRef}
              data={countriesData}
              style={getCountryStyle}
              onEachFeature={onEachCountryFeature}
            />
          )}
          
          {/* States layer - only visible when country is selected */}
          {selectedCountry && filteredStates && filteredStates.features.length > 0 && (
            <GeoJSON
              ref={statesGeoJsonRef}
              data={filteredStates}
              style={getStateStyle}
              onEachFeature={onEachStateFeature}
            />
          )}
          
          {/* Zoom to selected country */}
          {selectedCountry && (
            <ZoomToBounds 
              bounds={getSelectedCountryBounds()} 
              selectedCountry={selectedCountry}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
