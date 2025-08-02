# Car Logo Quiz Database Setup

## Overview

This document explains the database structure for the car logo quiz game, which reuses most of the existing flag quiz infrastructure.

## Database Tables

### 1. New Table: `car_brands`

This is the main table for storing car brand information:

```sql
CREATE TABLE car_brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT NOT NULL,
    region VARCHAR(50) NOT NULL, -- 'Europe', 'North America', 'Asia', 'Other'
    is_defunct BOOLEAN DEFAULT FALSE,
    founded_year INTEGER,
    country_of_origin VARCHAR(100),
    parent_company VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Reused Tables

- **`feedback`** - Reuse existing feedback table for bug reports/suggestions
- **`continents`** - Can be reused if you want to map regions to continents later

## API Endpoints

### Public API

- `GET /api/car-brands` - Fetch car brands with optional filtering
  - Query params: `region`, `includeDefunct`

### Admin API

- `GET /api/admin/car-brands` - Fetch all car brands (admin only)
- `POST /api/admin/car-brands` - Create new car brand (admin only)
- `PUT /api/admin/car-brands` - Update car brand (admin only)
- `DELETE /api/admin/car-brands` - Delete car brand (admin only)

## Utility Functions

### `lib/carBrandLoader.js`

- `loadCarBrands(selectedRegion, includeDefunct)` - Load brands with filters
- `getRandomCarBrand(carBrands, usedBrands)` - Get random brand for quiz
- `getRandomOptions(carBrands, correctBrand, count)` - Get incorrect options
- `createOptionsArray(correctBrand, incorrectOptions)` - Create shuffled options
- `getRegions()` - Get available regions for filtering

## Setup Instructions

1. **Run the SQL script** in `car_brands_table.sql` in your Supabase database
2. **Upload car logo images** to your storage bucket (e.g., `/logos/`)
3. **Update the sample data** in the SQL script with actual logo URLs
4. **Test the API endpoints** to ensure they work correctly

## Sample Data Included

The SQL script includes 40+ popular car brands across all regions:

- **Europe**: BMW, Mercedes, Audi, Ferrari, Lamborghini, etc.
- **North America**: Ford, Chevrolet, Tesla, etc.
- **Asia**: Toyota, Honda, Hyundai, etc.
- **Other**: Tata, Geely, BYD, etc.

## Integration with Existing Admin Panel

You can extend the existing admin panel (`pages/admin.js`) to include car brand management by:

1. Adding a new tab for "Car Brands"
2. Reusing the existing image upload functionality
3. Using the same authentication system

## Game Modes Supported

The database structure supports all the requested game modes:

- **Standard Mode**: Use `usedBrands` array to track completed brands
- **Infinite Mode**: Reuse brands by not tracking `usedBrands`
- **Time Attack**: Same logic as standard mode
- **Region Filtering**: Use the `region` field
- **Defunct Brands**: Use the `is_defunct` field

## Next Steps

1. Create the `site3.js` game page using the car brand loader
2. Add car brand management to the admin panel
3. Create car-themed sound effects
4. Design car-themed UI styling
5. Test all game modes and features
