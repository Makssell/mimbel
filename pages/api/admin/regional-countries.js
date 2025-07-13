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

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get all regional countries
        const { data: countries, error: fetchError } = await supabaseAdmin
          .from('regional_flag_countries')
          .select('*')
          .order('name');

        if (fetchError) throw fetchError;

        return res.status(200).json(countries || []);

      case 'POST':
        // Create new regional country
        const { name, flag_image_url, is_active } = req.body;

        if (!name || !flag_image_url) {
          return res.status(400).json({ error: 'Name and flag image URL are required' });
        }

        const { data: newCountry, error: createError } = await supabaseAdmin
          .from('regional_flag_countries')
          .insert([{
            name,
            flag_image_url,
            is_active: is_active !== undefined ? is_active : true
          }])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json(newCountry);

      case 'PUT':
        // Update regional country
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Country ID is required' });
        }

        const { data: updatedCountry, error: updateError } = await supabaseAdmin
          .from('regional_flag_countries')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.status(200).json(updatedCountry);

      case 'DELETE':
        // Delete regional country
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Country ID is required' });
        }

        const { error: deleteError } = await supabaseAdmin
          .from('regional_flag_countries')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;

        return res.status(200).json({ message: 'Regional country deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Regional countries API error:', error);
    return res.status(500).json({ error: error.message });
  }
} 