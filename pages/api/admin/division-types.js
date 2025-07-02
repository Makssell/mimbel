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

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get division types for a specific country
        const { country_id } = req.query;

        if (!country_id) {
          return res.status(400).json({ error: 'Country ID is required' });
        }

        const { data: divisionTypes, error: fetchError } = await supabase
          .from('region_division_types')
          .select('*')
          .eq('country_id', country_id)
          .order('type_name');

        if (fetchError) throw fetchError;

        return res.status(200).json(divisionTypes || []);

      case 'POST':
        // Create new division type
        const { type_name, is_active, country_id: createCountryId } = req.body;

        if (!type_name || !createCountryId) {
          return res.status(400).json({ error: 'Type name and country ID are required' });
        }

        const { data: newDivisionType, error: createError } = await supabase
          .from('region_division_types')
          .insert([{
            type_name,
            country_id: createCountryId,
            is_active: is_active !== undefined ? is_active : true
          }])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json(newDivisionType);

      case 'PUT':
        // Update division type
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Division type ID is required' });
        }

        const { data: updatedDivisionType, error: updateError } = await supabase
          .from('region_division_types')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.status(200).json(updatedDivisionType);

      case 'DELETE':
        // Delete division type
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Division type ID is required' });
        }

        const { error: deleteError } = await supabase
          .from('region_division_types')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;

        return res.status(200).json({ message: 'Division type deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Division types API error:', error);
    return res.status(500).json({ error: error.message });
  }
} 