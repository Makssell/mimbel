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
        // Get regional flags for a specific division type
        const { division_type_id } = req.query;

        console.log('Fetching regional flags for division_type_id:', division_type_id);

        if (!division_type_id) {
          return res.status(400).json({ error: 'Division type ID is required' });
        }

        const { data: regionalFlags, error: fetchError } = await supabase
          .from('regional_flags')
          .select('*')
          .eq('division_type_id', division_type_id)
          .order('name');

        if (fetchError) {
          console.error('Supabase error fetching regional flags:', fetchError);
          throw fetchError;
        }

        console.log(`Found ${regionalFlags?.length || 0} regional flags`);
        return res.status(200).json(regionalFlags || []);

      case 'POST':
        // Create new regional flag
        const { name, image_url, abbreviation, code, country_id, division_type_id: createDivisionTypeId } = req.body;

        console.log('Creating regional flag with data:', {
          name,
          image_url,
          abbreviation,
          code,
          country_id,
          division_type_id: createDivisionTypeId
        });

        if (!name || !image_url || !country_id || !createDivisionTypeId) {
          return res.status(400).json({ error: 'Name, image URL, country ID, and division type ID are required' });
        }

        // Build insert data with only required fields
        const insertData = {
          name,
          image_url,
          country_id,
          division_type_id: createDivisionTypeId
        };

        // Only add optional fields if they have values
        if (abbreviation && abbreviation.trim()) {
          insertData.abbreviation = abbreviation.trim();
        }
        if (code && code.trim()) {
          insertData.code = code.trim();
        }

        const { data: newRegionalFlag, error: createError } = await supabase
          .from('regional_flags')
          .insert([insertData])
          .select()
          .single();

        if (createError) {
          console.error('Supabase error creating regional flag:', createError);
          throw createError;
        }

        console.log('Successfully created regional flag:', newRegionalFlag);
        return res.status(201).json(newRegionalFlag);

      case 'PUT':
        // Update regional flag
        const { id: updateId, name: updateName, image_url: updateImageUrl, abbreviation: updateAbbreviation, code: updateCode } = req.body;

        if (!updateId) {
          return res.status(400).json({ error: 'Regional flag ID is required' });
        }

        // Build update data with only provided fields
        const updateData = {};
        if (updateName !== undefined) updateData.name = updateName;
        if (updateImageUrl !== undefined) updateData.image_url = updateImageUrl;
        if (updateAbbreviation !== undefined) updateData.abbreviation = updateAbbreviation;
        if (updateCode !== undefined) updateData.code = updateCode;

        const { data: updatedRegionalFlag, error: updateError } = await supabase
          .from('regional_flags')
          .update(updateData)
          .eq('id', updateId)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.status(200).json(updatedRegionalFlag);

      case 'DELETE':
        // Delete regional flag
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Regional flag ID is required' });
        }

        const { error: deleteError } = await supabase
          .from('regional_flags')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;

        return res.status(200).json({ message: 'Regional flag deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Regional flags API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details
    });
    return res.status(500).json({ error: error.message });
  }
} 