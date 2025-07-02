import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    console.log('Fetching regional countries from database...');
    
    // Get all active regional countries
    const { data: countries, error: fetchError } = await supabase
      .from('regional_flag_countries')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (fetchError) {
      console.error('Supabase error:', fetchError);
      throw fetchError;
    }

    // Get flag counts for each country
    const countriesWithCounts = await Promise.all(
      countries.map(async (country) => {
        const { count, error: countError } = await supabase
          .from('regional_flags')
          .select('*', { count: 'exact', head: true })
          .eq('country_id', country.id);

        if (countError) {
          console.error(`Error counting flags for country ${country.id}:`, countError);
          return { ...country, total_regional_flags: 0 };
        }

        return { ...country, total_regional_flags: count || 0 };
      })
    );

    console.log(`Found ${countriesWithCounts?.length || 0} regional countries`);
    return res.status(200).json(countriesWithCounts || []);
  } catch (error) {
    console.error('Public regional countries API error:', error);
    return res.status(500).json({ error: error.message });
  }
} 