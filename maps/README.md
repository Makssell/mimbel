# Map Outline System

This system allows you to assign vector map outlines (from GeoJSON data) to countries in your database, and then use those outlines in your game for visual country identification.

## Overview

The map outline system provides two types of views for each country:

1. **Isolated View**: Shows only the country's outline (useful for focused country identification)
2. **Continent View**: Shows the country highlighted within its continent context (useful for geographic context)

## Files

- `countries_10.geojson` - Country boundaries (simplified, 1:10 million scale)
- `regions_10m.geojson` - Admin-1 level boundaries (states/provinces)
- `maptests.js` - Interactive map testing tool component
- `pages/map-test.js` - Page to access the map tester
- `components/MapOutlineSelector.js` - Component for assigning outlines in admin
- `components/MapOutlineViewer.js` - Component for previewing assigned outlines

## Database Schema

The system uses a `map_outline_match` JSONB column in the `flags` table to store matching criteria:

```sql
ALTER TABLE public.flags 
ADD COLUMN IF NOT EXISTS map_outline_match JSONB;
```

The `map_outline_match` column stores JSON like:
```json
{
  "ISO_A3": "USA",
  "ISO_A2": "US",
  "NAME": "United States of America",
  "ADMIN": "United States of America",
  "SOVEREIGNT": "United States of America"
}
```

## Admin Interface

### Assigning Map Outlines

1. Navigate to **Admin → Map Outlines** tab
2. Click **"Assign Outline"** on any country
3. A map modal will open showing all available country outlines
4. Click on a country on the map to select its outline
5. Review the matching properties (ISO codes, names)
6. Click **"Confirm Assignment"** to save

### Viewing Assigned Outlines

1. In the **Map Outlines** tab, countries with assigned outlines will show a green badge
2. Click **"View Outline"** to see a preview
3. Toggle between **"Isolated"** and **"Continent"** views:
   - **Isolated**: Shows only the country outline
   - **Continent**: Shows the country highlighted within its continent (other countries in muted gray)

## Using in Your Game

### Basic Usage

To get a country's map outline in your game:

```javascript
import { supabase } from '../lib/supabase';

// 1. Get the flag with its map outline match data
const { data: flag, error } = await supabase
  .from('flags')
  .select('id, name, map_outline_match')
  .eq('id', flagId)
  .single();

if (error || !flag.map_outline_match) {
  console.log('No map outline assigned for this country');
  return;
}

// 2. Parse the match criteria
const matchCriteria = typeof flag.map_outline_match === 'string'
  ? JSON.parse(flag.map_outline_match)
  : flag.map_outline_match;

// 3. Load the GeoJSON data
const response = await fetch('/api/maps/countries');
const geoData = await response.json();

// 4. Find the matching feature
const matchedFeature = geoData.features.find(f => {
  const props = f.properties;
  return (
    (matchCriteria.ISO_A3 && props.ISO_A3 === matchCriteria.ISO_A3) ||
    (matchCriteria.ISO_A2 && props.ISO_A2 === matchCriteria.ISO_A2) ||
    (matchCriteria.NAME && props.NAME === matchCriteria.NAME) ||
    (matchCriteria.ADMIN && props.ADMIN === matchCriteria.ADMIN)
  );
});

if (matchedFeature) {
  // 5. Use the geometry for display
  const countryGeometry = matchedFeature.geometry;
  // Now you can use this geometry with Leaflet, D3, or any mapping library
}
```

### React Component Example

```javascript
import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { supabase } from '../lib/supabase';

function CountryOutline({ flagId, viewMode = 'isolated' }) {
  const [outline, setOutline] = useState(null);
  const [continentOutlines, setContinentOutlines] = useState([]);

  useEffect(() => {
    const loadOutline = async () => {
      // Get flag with map outline match
      const { data: flag } = await supabase
        .from('flags')
        .select('map_outline_match, country_continent(continents(id, name))')
        .eq('id', flagId)
        .single();

      if (!flag?.map_outline_match) return;

      // Load GeoJSON
      const response = await fetch('/api/maps/countries');
      const geoData = await response.json();

      // Find matching feature
      const match = typeof flag.map_outline_match === 'string'
        ? JSON.parse(flag.map_outline_match)
        : flag.map_outline_match;

      const matched = geoData.features.find(f => {
        const props = f.properties;
        return (
          (match.ISO_A3 && props.ISO_A3 === match.ISO_A3) ||
          (match.ISO_A2 && props.ISO_A2 === match.ISO_A2) ||
          (match.NAME && props.NAME === match.NAME)
        );
      });

      if (matched) {
        setOutline(matched);

        // For continent view, load other countries in the same continent
        if (viewMode === 'continent' && flag.country_continent) {
          const continentIds = flag.country_continent.map(cc => cc.continents.id);
          
          // Get all flags in same continent with outlines
          const { data: continentFlags } = await supabase
            .from('flags')
            .select('map_outline_match, country_continent(continent_id)')
            .not('map_outline_match', 'is', null);

          const continentFeatures = [];
          continentFlags?.forEach(cFlag => {
            if (cFlag.country_continent.some(cc => continentIds.includes(cc.continent_id))) {
              const cMatch = typeof cFlag.map_outline_match === 'string'
                ? JSON.parse(cFlag.map_outline_match)
                : cFlag.map_outline_match;

              const cMatched = geoData.features.find(f => {
                const props = f.properties;
                return (
                  (cMatch.ISO_A3 && props.ISO_A3 === cMatch.ISO_A3) ||
                  (cMatch.ISO_A2 && props.ISO_A2 === cMatch.ISO_A2)
                );
              });

              if (cMatched) continentFeatures.push(cMatched);
            }
          });

          setContinentOutlines(continentFeatures);
        }
      }
    };

    loadOutline();
  }, [flagId, viewMode]);

  if (!outline) return null;

  const getStyle = (feature) => {
    const isSelected = outline.properties.NAME === feature.properties.NAME;
    
    if (viewMode === 'isolated') {
      return {
        fillColor: '#4a90e2',
        weight: 2,
        color: '#2c5aa0',
        fillOpacity: 0.4
      };
    } else {
      // Continent view
      return {
        fillColor: isSelected ? '#4a90e2' : '#d0d0d0',
        weight: isSelected ? 3 : 1,
        color: isSelected ? '#2c5aa0' : '#a0a0a0',
        fillOpacity: isSelected ? 0.6 : 0.15
      };
    }
  };

  const features = viewMode === 'isolated' 
    ? [outline]
    : continentOutlines.length > 0 ? continentOutlines : [outline];

  return (
    <GeoJSON
      data={{
        type: 'FeatureCollection',
        features: features
      }}
      style={getStyle}
    />
  );
}
```

### Game Mode Integration Example

```javascript
// In your game component
function GameScreen({ currentFlagId }) {
  const [showOutline, setShowOutline] = useState(false);
  const [outlineMode, setOutlineMode] = useState('isolated'); // or 'continent'

  return (
    <div>
      {/* Your game UI */}
      <button onClick={() => setShowOutline(!showOutline)}>
        {showOutline ? 'Hide' : 'Show'} Country Outline
      </button>

      {showOutline && (
        <MapContainer center={[20, 0]} zoom={2}>
          <CountryOutline 
            flagId={currentFlagId} 
            viewMode={outlineMode}
          />
        </MapContainer>
      )}
    </div>
  );
}
```

## View Types Explained

### Isolated View
- **Purpose**: Show only the country's boundary
- **Use Case**: When you want to focus on a single country without geographic context
- **Styling**: 
  - Fill: Blue (#4a90e2) at 40% opacity
  - Border: Darker blue (#2c5aa0), 2px width

### Continent View
- **Purpose**: Show the country within its continental context
- **Use Case**: When you want to show geographic context or help players understand location
- **Styling**:
  - **Selected Country**: Blue (#4a90e2) at 60% opacity, 3px border
  - **Other Countries**: Muted gray (#d0d0d0) at 15% opacity, 1px border

## API Endpoints

### Get Map Outlines
```
GET /api/admin/map-outlines
Authorization: Bearer <admin_token>
```

### Assign Map Outline
```
PUT /api/admin/map-outlines
Authorization: Bearer <admin_token>
Body: {
  flag_id: number,
  map_outline_match: {
    ISO_A3?: string,
    ISO_A2?: string,
    NAME?: string,
    ADMIN?: string,
    SOVEREIGNT?: string
  }
}
```

### Get Countries GeoJSON
```
GET /api/maps/countries
```

### Get Admin-1 Regions GeoJSON
```
GET /api/maps/countries?dataset=admin1
```

## Notes

- The GeoJSON files don't contain continent data - continent relationships come from your database
- Only countries with assigned outlines will appear in the continent view
- The matching uses multiple criteria (ISO codes, names) for flexibility
- The system supports countries that span multiple continents (uses first continent for continent view)

## Troubleshooting

**No countries showing in continent view?**
- Make sure other countries in the same continent have map outlines assigned
- Check that continent relationships are set up in the `country_continent` table

**Outline not matching?**
- Verify the ISO codes or names match between your database and GeoJSON
- Check the browser console for matching debug logs
- Try assigning the outline again with a different matching country

**Performance issues?**
- The GeoJSON files are large (24MB for countries_10.geojson)
- Consider caching the GeoJSON data in your application
- For production, you might want to pre-process and store simplified geometries

