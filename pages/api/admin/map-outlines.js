import { supabaseAdmin } from '../../../lib/supabase-admin';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  // JWT token authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded || decoded.role !== 'admin') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  switch (req.method) {
    case 'GET':
      try {
        // Get all flags with their map outline assignments and continent data
        const { data, error } = await supabaseAdmin
          .from('flags')
          .select(`
            id, 
            name, 
            map_outline_match,
            country_continent(
              continent_id,
              continents(name, id)
            )
          `)
          .order('name');
        
        // Transform the data to match expected format
        const transformedData = (data || []).map(flag => ({
          ...flag,
          continents: flag.country_continent?.map(cc => cc.continents).filter(Boolean) || []
        }));

        if (error) throw error;
        res.status(200).json(transformedData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { flag_id, map_outline_match } = req.body;

        if (!flag_id) {
          return res.status(400).json({ error: 'flag_id is required' });
        }

        // Update the flag with map outline matching criteria
        const { data, error } = await supabaseAdmin
          .from('flags')
          .update({ map_outline_match: map_outline_match || null })
          .eq('id', flag_id)
          .select()
          .single();

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { flag_id } = req.query;

        if (!flag_id) {
          return res.status(400).json({ error: 'flag_id is required' });
        }

        // Remove map outline assignment
        const { data, error } = await supabaseAdmin
          .from('flags')
          .update({ map_outline_match: null })
          .eq('id', flag_id)
          .select()
          .single();

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

