import { supabase } from './supabase';

/**
 * Load car brands for the quiz game
 */
export const loadCarBrands = async (selectedRegion, includeDefunct) => {
  console.log(`Loading car brands - Region: ${selectedRegion}, Include Defunct: ${includeDefunct}`);
  
  try {
    let query = supabase
      .from("car_brands")
      .select('*')
      .order('name');

    // Apply region filter
    if (selectedRegion && selectedRegion !== 'world') {
      query = query.eq('region', selectedRegion);
    }

    // Apply defunct filter
    if (!includeDefunct) {
      query = query.eq('is_defunct', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching car brands:", error);
      throw error;
    }

    console.log(`Loaded ${data.length} car brands`);
    return data;
  } catch (error) {
    console.error("Error in loadCarBrands:", error);
    throw error;
  }
};

/**
 * Get random car brand for quiz question
 */
export const getRandomCarBrand = (carBrands, usedBrands = []) => {
  if (!carBrands || carBrands.length === 0) {
    return null;
  }

  // Filter out already used brands (for standard mode)
  const availableBrands = carBrands.filter(brand => !usedBrands.includes(brand.id));
  
  // If no brands available, return null (game complete)
  if (availableBrands.length === 0) {
    return null;
  }

  // Pick random brand
  const randomIndex = Math.floor(Math.random() * availableBrands.length);
  return availableBrands[randomIndex];
};

/**
 * Get random incorrect options for multiple choice
 */
export const getRandomOptions = (carBrands, correctBrand, count = 3) => {
  if (!carBrands || carBrands.length === 0) {
    return [];
  }

  // Filter out the correct brand
  const availableBrands = carBrands.filter(brand => brand.id !== correctBrand.id);
  
  // If not enough brands available, return what we have
  if (availableBrands.length < count) {
    return availableBrands;
  }

  // Shuffle and take first 'count' items
  const shuffled = availableBrands.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Create shuffled options array with correct answer
 */
export const createOptionsArray = (correctBrand, incorrectOptions) => {
  const allOptions = [correctBrand, ...incorrectOptions];
  return allOptions.sort(() => 0.5 - Math.random());
};

/**
 * Get regions for filtering
 */
export const getRegions = () => {
  return [
    { id: 'world', name: 'World' },
    { id: 'Europe', name: 'Europe' },
    { id: 'North America', name: 'North America' },
    { id: 'Asia', name: 'Asia' },
    { id: 'Other', name: 'Other' }
  ];
}; 