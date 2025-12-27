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

export default function MapOutlineSelector({ countryName, onSelect, currentMatch }) {
  const [geoData, setGeoData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const geoJsonRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        setLoading(true);
        // Load GeoJSON directly from static files for better performance
        const response = await fetch('/maps/countries_10.geojson');
        if (!response.ok) {
          throw new Error('Failed to load GeoJSON file');
        }
        const data = await response.json();
        setGeoData(data);
        
        // If there's a current match, try to find and highlight it
        if (currentMatch) {
          const match = typeof currentMatch === 'string' ? JSON.parse(currentMatch) : currentMatch;
          if (data.features) {
            const matched = data.features.find(f => {
              const props = f.properties;
              return (
                (match.ISO_A3 && props.ISO_A3 === match.ISO_A3) ||
                (match.ISO_A2 && props.ISO_A2 === match.ISO_A2) ||
                (match.NAME && props.NAME === match.NAME) ||
                (match.ADMIN && props.ADMIN === match.ADMIN)
              );
            });
            if (matched) {
              setSelectedFeature(matched);
              // Zoom to the matched feature
              setTimeout(() => {
                if (geoJsonRef.current && mapRef.current) {
                  geoJsonRef.current.eachLayer((layer) => {
                    if (layer.feature === matched) {
                      mapRef.current.flyToBounds(layer.getBounds(), {
                        padding: [50, 50],
                        maxZoom: 6,
                        duration: 1.5
                      });
                    }
                  });
                }
              }, 500);
            }
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, [currentMatch]);

  const getStyle = (feature) => {
    const isSelected = selectedFeature && 
      (selectedFeature.properties.NAME === feature.properties.NAME ||
       selectedFeature.properties.ADMIN === feature.properties.ADMIN);
    
    return {
      fillColor: isSelected ? '#ff6b6b' : '#3388ff',
      weight: isSelected ? 4 : 2,
      opacity: 1,
      color: isSelected ? '#fff' : '#333',
      dashArray: '',
      fillOpacity: isSelected ? 0.7 : 0.3
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    const featureName = props.NAME || props.ADMIN || 'Unknown';
    
    layer.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${featureName}</h3>
        <table style="width: 100%; font-size: 12px;">
          ${props.ISO_A2 ? `<tr><td><strong>ISO A2:</strong></td><td>${props.ISO_A2}</td></tr>` : ''}
          ${props.ISO_A3 ? `<tr><td><strong>ISO A3:</strong></td><td>${props.ISO_A3}</td></tr>` : ''}
          ${props.ADMIN ? `<tr><td><strong>Admin:</strong></td><td>${props.ADMIN}</td></tr>` : ''}
          ${props.SOVEREIGNT ? `<tr><td><strong>Sovereign:</strong></td><td>${props.SOVEREIGNT}</td></tr>` : ''}
        </table>
        <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">
          Click to select this outline
        </p>
      </div>
    `);

    layer.on({
      click: (e) => {
        setSelectedFeature(feature);
        // Zoom to feature
        if (mapRef.current) {
          mapRef.current.flyToBounds(layer.getBounds(), {
            padding: [50, 50],
            maxZoom: 6,
            duration: 1.5
          });
        }
        L.DomEvent.stopPropagation(e);
      },
      mouseover: () => {
        if (!selectedFeature || selectedFeature.properties.NAME !== featureName) {
          layer.setStyle({
            fillOpacity: 0.6,
            weight: 3,
            color: '#fff'
          });
        }
      },
      mouseout: () => {
        if (!selectedFeature || selectedFeature.properties.NAME !== featureName) {
          layer.setStyle({
            fillOpacity: 0.3,
            weight: 2,
            color: '#333'
          });
        }
      }
    });
  };

  const handleConfirm = () => {
    if (!selectedFeature) {
      alert('Please select a country outline from the map');
      return;
    }

    const props = selectedFeature.properties;
    const matchData = {
      ISO_A3: props.ISO_A3 || null,
      ISO_A2: props.ISO_A2 || null,
      NAME: props.NAME || null,
      ADMIN: props.ADMIN || null,
      SOVEREIGNT: props.SOVEREIGNT || null
    };

    onSelect(matchData);
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
        height: '100%',
        fontSize: '18px',
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: '350px',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Select Map Outline</h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            Click on a country on the map to select its outline. The selected outline will be assigned to <strong>{countryName}</strong>.
          </p>
        </div>

        {/* Selected Feature Info */}
        {selectedFeature && (
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #ddd',
            backgroundColor: 'white',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#28a745' }}>
              ✓ Selected: {selectedFeature.properties.NAME || selectedFeature.properties.ADMIN}
            </h4>
            <div style={{ fontSize: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(selectedFeature.properties)
                    .filter(([key]) => ['ISO_A2', 'ISO_A3', 'NAME', 'ADMIN', 'SOVEREIGNT'].includes(key))
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
            <button
              onClick={handleConfirm}
              style={{
                width: '100%',
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Confirm Assignment
            </button>
          </div>
        )}

        {!selectedFeature && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            Click on a country on the map to select its outline
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
          {geoData && (
            <GeoJSON
              ref={geoJsonRef}
              data={geoData}
              style={getStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

