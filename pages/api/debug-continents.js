import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('Debug: Fetching continents and sample flags...');
    
    // Get all continents
    const { data: continents, error: continentsError } = await supabase
      .from('continents')
      .select('*')
      .order('id');

    if (continentsError) {
      console.error('Error fetching continents:', continentsError);
      throw continentsError;
    }

    // Get sample flags with continent data
    const { data: sampleFlags, error: flagsError } = await supabase
      .from('flags')
      .select(`
        id,
        name,
        territory,
        country_continent(
          continent_id
        )
      `)
      .limit(10);

    if (flagsError) {
      console.error('Error fetching sample flags:', flagsError);
      throw flagsError;
    }

    console.log('Continents:', continents);
    console.log('Sample flags with continent data:', sampleFlags);

    return res.status(200).json({
      continents: continents || [],
      sampleFlags: sampleFlags || [],
      mapping: {
        "1": "Africa",
        "2": "Asia", 
        "3": "Europe",
        "4": "North America",
        "5": "South America",
        "6": "Oceania"
      }
    });
  } catch (error) {
    console.error('Debug continents API error:', error);
    return res.status(500).json({ error: error.message });
  }
} 