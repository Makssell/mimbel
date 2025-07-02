import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    console.log('Fetching division types from database...');
    
    // Get all active division types
    const { data: divisionTypes, error: fetchError } = await supabase
      .from('region_division_types')
      .select('*')
      .eq('is_active', true)
      .order('type_name');

    if (fetchError) {
      console.error('Supabase error:', fetchError);
      throw fetchError;
    }

    // Get flag counts for each division type
    const divisionTypesWithCounts = await Promise.all(
      divisionTypes.map(async (divisionType) => {
        const { count, error: countError } = await supabase
          .from('regional_flags')
          .select('*', { count: 'exact', head: true })
          .eq('division_type_id', divisionType.id);

        if (countError) {
          console.error(`Error counting flags for division type ${divisionType.id}:`, countError);
          return { ...divisionType, flag_count: 0 };
        }

        return { ...divisionType, flag_count: count || 0 };
      })
    );

    console.log(`Found ${divisionTypesWithCounts?.length || 0} division types`);
    return res.status(200).json(divisionTypesWithCounts || []);
  } catch (error) {
    console.error('Public division types API error:', error);
    return res.status(500).json({ error: error.message });
  }
} 