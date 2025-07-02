import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const { countryId, divisionTypes } = req.query;

    if (!countryId || !divisionTypes) {
      return res.status(400).json({ 
        error: 'Missing required parameters: countryId and divisionTypes' 
      });
    }

    // Parse divisionTypes if it's a string (comma-separated)
    const divisionTypeArray = Array.isArray(divisionTypes) 
      ? divisionTypes 
      : divisionTypes.split(',').map(id => parseInt(id.trim()));

    console.log(`Fetching regional flags for country ${countryId} and division types:`, divisionTypeArray);
    
    // Get regional flags with division type information - only select columns that exist
    const { data: regionalFlags, error: fetchError } = await supabase
      .from('regional_flags')
      .select(`
        id,
        name,
        image_url,
        division_type_id,
        region_division_types!inner(
          id,
          type_name
        )
      `)
      .eq('country_id', countryId)
      .in('division_type_id', divisionTypeArray)
      .order('name');

    if (fetchError) {
      console.error('Supabase error:', fetchError);
      throw fetchError;
    }

    // Transform the data to match the expected format
    const transformedFlags = regionalFlags.map(flag => ({
      id: flag.id,
      name: flag.name,
      image_url: flag.image_url,
      division_type_id: flag.division_type_id,
      division_type_name: flag.region_division_types.type_name,
      type: 'region' // Add metadata to distinguish from global flags
    }));

    console.log(`Found ${transformedFlags.length} regional flags`);
    return res.status(200).json(transformedFlags || []);
  } catch (error) {
    console.error('Public regional flags API error:', error);
    return res.status(500).json({ error: error.message });
  }
} 