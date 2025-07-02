import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('Testing Europe continent filtering...');
    
    // Test the exact same logic as in loadGlobalFlags
    let query = supabase
      .from("flags")
      .select(`
        id,
        name,
        territory,
        image_url,
        country_continent(
          continent_id
        )
      `);

    // Apply territory filter (exclude territories)
    query = query.eq('territory', false);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching flags:", error);
      throw error;
    }

    console.log(`Total flags fetched: ${data.length}`);

    // Apply continent filter for Europe (continent_id = 3)
    const selectedContinent = "3"; // Europe
    let filteredData = data;
    
    console.log(`Filtering for continent ID: ${selectedContinent}`);
    console.log('Sample flag data:', data.slice(0, 3));
    
    filteredData = data.filter((flag) => {
      const continentIds = flag.country_continent.map((cc) => cc.continent_id);
      const isInContinent = continentIds.includes(Number(selectedContinent));
      console.log(`Flag ${flag.name}: continent IDs [${continentIds}], selected: ${selectedContinent}, included: ${isInContinent}`);
      return isInContinent;
    });
    
    console.log(`After filtering: ${filteredData.length} flags for continent ${selectedContinent}`);

    return res.status(200).json({
      totalFlags: data.length,
      europeFlags: filteredData.length,
      sampleEuropeFlags: filteredData.slice(0, 10),
      sampleAllFlags: data.slice(0, 5)
    });
  } catch (error) {
    console.error('Test Europe filter API error:', error);
    return res.status(500).json({ error: error.message });
  }
} 