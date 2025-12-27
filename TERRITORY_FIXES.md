# Territory and Geographic Region Fixes

## Issues Fixed

### 1. Somaliland
**Problem**: Somaliland wasn't showing when displaying Somalia, even though it's part of Somalia's territory.

**Solution**: 
- Added special case handling for territories with `ADM0_ISO` or `ADM0_A3` fields that link to the sovereign
- Added manual mapping: `Somaliland -> Somalia (SOM)`
- Somaliland now appears when Somalia is displayed

**How it works**: The system now checks:
- `SOVEREIGNT` field (primary)
- `ADM0_ISO` field (for claimed territories like Somaliland)
- `ADM0_A3` field (alternative admin code)
- Manual territory mappings

### 2. Western Sahara
**Problem**: Western Sahara might not have been showing up.

**Solution**:
- Added `Western Sahara` to sovereign name mappings
- Added `ESH` (Western Sahara's ISO code) to code mappings
- Western Sahara will now match if it has a flag with `ISO_A3: "ESH"` or `SOVEREIGNT: "Western Sahara"`

**Note**: If Western Sahara doesn't have a flag in your database, you'll need to:
1. Create a flag entry for Western Sahara
2. Assign a map outline with `ISO_A3: "ESH"` or `SOVEREIGNT: "Western Sahara"`

### 3. Missing Caribbean Islands
**Problem**: Some Caribbean islands weren't showing in geographic views.

**Solution**:
- Updated `MapOutlineDisplay` to include ALL geographic regions in the nearby area, not just those with flags assigned
- This ensures small islands and territories show up as geographic context
- Improved continent bounds calculation to better catch small islands

**How it works**: When showing nearby countries:
1. First, loads all flags with outlines that are nearby
2. Then, scans ALL GeoJSON features in the geographic area
3. Includes any geographic regions that are nearby, even if they don't have flags

## Manual Configuration

### Adding More Territory Mappings

If you find other territories that should be linked to sovereigns, edit `utils/regionUtils.js`:

```javascript
const TERRITORY_TO_SOVEREIGN = {
  'Somaliland': { sovereignCode: 'SOM', sovereignName: 'Somalia' },
  'Western Sahara': { sovereignCode: 'ESH', sovereignName: 'Western Sahara' },
  // Add more here:
  // 'Territory Name': { sovereignCode: 'XXX', sovereignName: 'Country Name' },
};
```

### Adding Sovereign Name Mappings

If a sovereign name isn't recognized, add it to the `getSovereignCode()` function:

```javascript
const sovereignMap = {
  // ... existing entries ...
  'Your Country Name': 'XXX', // ISO_A3 code
};
```

And to `getSovereignNameFromCode()`:

```javascript
const codeToName = {
  // ... existing entries ...
  'XXX': 'Your Country Name',
};
```

## Testing

### Test Somaliland
1. Play a map-to-flag game with Somalia
2. You should see both Somalia mainland and Somaliland region

### Test Western Sahara
1. Ensure Western Sahara has a flag in your database
2. Assign a map outline with `ISO_A3: "ESH"`
3. Play a map-to-flag game - Western Sahara should show

### Test Caribbean
1. Play a map-to-flag game with a Caribbean country (e.g., Jamaica, Cuba)
2. In the nearby/continent view, you should see all nearby Caribbean islands
3. Even small islands without flags should appear as geographic context

## Technical Details

### Territory Matching Priority

The system now matches territories in this order:
1. `ISO_A3` code match (most reliable)
2. `SOVEREIGNT` name match
3. `ADM0_ISO` code match (for claimed territories)
4. `ADM0_A3` code match (alternative admin code)
5. Manual territory mappings (for special cases)

### Geographic Region Inclusion

For continent/nearby views:
- **Playable countries**: Only flags with `map_outline_match` assigned
- **Geographic context**: ALL GeoJSON features in the geographic area
- This ensures complete geographic representation while maintaining game logic

## Common Issues

### "Territory still not showing"

1. **Check if territory has a flag**: Territories without flags won't be playable, but should show as geographic context
2. **Check map_outline_match**: The flag needs a proper `map_outline_match` with correct ISO codes
3. **Check GeoJSON**: Verify the territory exists in `countries_10.geojson` with correct properties
4. **Add manual mapping**: If it's a special case, add it to `TERRITORY_TO_SOVEREIGN`

### "Too many regions showing"

- This is expected for countries with many territories (France, USA, etc.)
- The system shows ALL regions for geographic correctness
- Bounds calculation focuses on the main country, but all territories are visible

## Future Improvements

1. **Database regions table**: Store explicit region-to-sovereign relationships
2. **Admin interface**: UI to manage territory mappings
3. **Automatic detection**: Parse GeoJSON `NOTE_BRK` field for claimed territories
4. **Performance**: Cache region lookups for faster rendering

