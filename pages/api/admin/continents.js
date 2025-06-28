import { supabase } from '../../../lib/supabase';
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
        const { data, error } = await supabase
          .from('continents')
          .select('*')
          .order('name');

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      try {
        const { name } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Continent name is required' });
        }

        const { data, error } = await supabase
          .from('continents')
          .insert({ name })
          .select();

        if (error) throw error;
        res.status(201).json(data[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id, name } = req.body;

        if (!id || !name) {
          return res.status(400).json({ error: 'ID and continent name are required' });
        }

        const { error } = await supabase
          .from('continents')
          .update({ name })
          .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Continent updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ error: 'Continent ID is required' });
        }

        // Check if continent is being used by any flags
        const { data: usedFlags, error: checkError } = await supabase
          .from('country_continent')
          .select('country_id')
          .eq('continent_id', id);

        if (checkError) throw checkError;

        if (usedFlags && usedFlags.length > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete continent that is assigned to flags' 
          });
        }

        const { error } = await supabase
          .from('continents')
          .delete()
          .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Continent deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 