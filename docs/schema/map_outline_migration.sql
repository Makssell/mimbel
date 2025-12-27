-- Migration: Add map_outline_match column to flags table
-- This column stores JSON matching criteria to link flags to GeoJSON features
-- Run this migration in your Supabase SQL editor

ALTER TABLE public.flags 
ADD COLUMN IF NOT EXISTS map_outline_match JSONB;

-- Add comment explaining the column
COMMENT ON COLUMN public.flags.map_outline_match IS 
'JSON object storing matching criteria to link this flag to a GeoJSON feature. 
Contains keys like ISO_A3, ISO_A2, NAME, ADMIN, SOVEREIGNT for matching.';

-- Example of what map_outline_match might contain:
-- {
--   "ISO_A3": "USA",
--   "ISO_A2": "US",
--   "NAME": "United States of America",
--   "ADMIN": "United States of America"
-- }

