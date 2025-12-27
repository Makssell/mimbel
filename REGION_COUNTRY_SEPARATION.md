# Region/Country Separation Solution

## Problem Solved

Previously, the game only rendered single GeoJSON features per country, which meant:
- Territories like Greenland, Martinique, Puerto Rico didn't show up
- Overseas territories were missing from continent views
- Political vs geographic continent confusion

## Solution Overview

We've implemented a **region-based rendering system** that separates:
- **Regions** (geometry): What you draw on the map (all territories, exclaves, overseas territories)
- **Countries** (logic): What you play/guess (sovereign states only)

## Key Changes

### 1. New Utility: `utils/regionUtils.js`

This provides functions to:
- `getRegionsForSovereign()`: Get ALL regions for a sovereign country
- `matchFlagToAllRegions()`: Match a flag to all its regions (not just one feature)
- `getSovereignForFlag()`: Extract sovereign code and name from a flag

### 2. Updated Components

**`components/MapOutlineDisplay.js`** and **`components/MapOutlineButton.js`**:
- Now load ALL regions for the active country
- Render all territories together (e.g., France + Martinique + Guadeloupe + Réunion)
- Still focus bounds on the active country, but show all its territories

## How It Works

### For a Single Country Display

When showing France:
1. System extracts sovereign code `FRA` from flag's `map_outline_match`
2. Finds ALL GeoJSON features where `SOVEREIGNT = "France"` or `ISO_A3 = "FRA"`
3. Renders all of them together:
   - Mainland France
   - Martinique
   - Guadeloupe
   - French Guiana
   - Réunion
   - Mayotte
   - etc.

### For Continent Views

When showing North America:
1. System loads all regions geographically in North America
2. Groups them by sovereign
3. Shows playable countries that have territories there:
   - USA (mainland + Alaska + Hawaii + territories)
   - Canada
   - Mexico
   - France (because Martinique is in North America)
   - Denmark (because Greenland is in North America)
   - etc.

## Benefits

✅ **Geographic correctness**: Territories show up in their geographic continents
✅ **Complete rendering**: All territories render for their sovereign
✅ **No manual merging**: No need to manually combine geometries
✅ **Scalable**: Works for any country with any number of territories
✅ **Maintainable**: Fix one territory, doesn't break the whole country

## Example: Denmark

**Before**: Only Denmark mainland showed (or only Greenland if that's what was assigned)

**After**: When Denmark is the answer:
- Denmark mainland renders
- Greenland renders
- Faroe Islands render (if in GeoJSON)
- All shown together as "Denmark"

## Example: France in North America

**Before**: France wouldn't appear in North America games (political continent = Europe)

**After**: France appears in North America games because:
- Martinique is geographically in North America
- System finds all regions in North America
- Groups by sovereign → finds France
- Includes France as a playable option

## Technical Details

### Sovereign Matching

The system matches regions to sovereigns using:
1. `ISO_A3` code (most reliable)
2. `SOVEREIGNT` field (Natural Earth uses country names here)
3. Fallback to single feature match if sovereign matching fails

### Continent Filtering

Currently uses approximate geographic bounds. For production, you may want to:
- Use a proper continent mapping from GeoJSON `CONTINENT` field
- Or maintain a regions table with explicit continent assignments

## Future Enhancements

1. **Database regions table**: Store all regions with explicit sovereign/continent relationships
2. **Better continent detection**: Use GeoJSON `CONTINENT` field or proper geographic libraries
3. **Territory mode**: Optional game mode where territories are playable answers
4. **Performance optimization**: Cache region lookups

## Testing

To test the changes:

1. **Single country test**: 
   - Play a map-to-flag game with France
   - Should see all French territories rendered

2. **Continent test**:
   - Play a North America continent game
   - Should see France and Denmark as options (because of Martinique/Greenland)

3. **Territory rendering**:
   - Check that Greenland shows when Denmark is the answer
   - Check that Martinique shows when France is the answer

## Notes

- The system gracefully falls back to single-feature matching if sovereign matching fails
- Territories are never playable answers (only sovereign countries)
- All rendering is done at runtime - no geometry merging required
- Performance is good because we're only ever rendering one country's regions at a time

