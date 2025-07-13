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
        const { data, error } = await supabaseAdmin
          .from('flags')
          .select(`
            *,
            country_continent(
              continent_id
            ),
            continents(
              name
            )
          `)
          .order('name');

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      try {
        const { name, territory, image_url, continent_id, fileName } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Country name is required' });
        }

        // Insert new flag
        const { data: flagData, error: flagError } = await supabaseAdmin
          .from('flags')
          .insert({
            name,
            territory: territory || false,
            image_url: image_url || '',
            fileName: fileName || null
          })
          .select();

        if (flagError) throw flagError;

        // Add continent relationship if provided
        if (continent_id && flagData?.[0]) {
          const { error: continentError } = await supabaseAdmin
            .from('country_continent')
            .insert({
              country_id: flagData[0].id,
              continent_id: parseInt(continent_id)
            });

          if (continentError) throw continentError;
        }

        res.status(201).json(flagData[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id, name, territory, image_url, continent_id, fileName } = req.body;

        if (!id || !name) {
          return res.status(400).json({ error: 'ID and country name are required' });
        }

        // Get the current flag to check if we need to delete the old image
        const { data: currentFlag, error: fetchError } = await supabaseAdmin
          .from('flags')
          .select('fileName')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Update the flag
        const { error: flagError } = await supabaseAdmin
          .from('flags')
          .update({
            name,
            territory: territory || false,
            image_url: image_url || '',
            fileName: fileName || null
          })
          .eq('id', id);

        if (flagError) throw flagError;

        // Delete old image if it exists and is different from the new one
        if (currentFlag?.fileName && currentFlag.fileName !== fileName) {
          try {
            await supabaseAdmin.storage
              .from('flags')
              .remove([currentFlag.fileName]);
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError);
            // Don't throw error here as the flag update was successful
          }
        }

        // Update continent relationship
        if (continent_id !== undefined) {
          // Delete existing continent relationships
          await supabaseAdmin
            .from('country_continent')
            .delete()
            .eq('country_id', id);

          // Add new relationship if continent_id is provided
          if (continent_id) {
            const { error: continentError } = await supabaseAdmin
              .from('country_continent')
              .insert({
                country_id: id,
                continent_id: parseInt(continent_id)
              });

            if (continentError) throw continentError;
          }
        }

        res.status(200).json({ message: 'Flag updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ error: 'Flag ID is required' });
        }

        // Get the flag to check if it has an associated image
        const { data: flag, error: fetchError } = await supabaseAdmin
          .from('flags')
          .select('fileName')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Delete continent relationships first
        await supabaseAdmin
          .from('country_continent')
          .delete()
          .eq('country_id', id);

        // Delete the flag
        const { error } = await supabaseAdmin
          .from('flags')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Delete the associated image if it exists
        if (flag?.fileName) {
          try {
            await supabaseAdmin.storage
              .from('flags')
              .remove([flag.fileName]);
          } catch (deleteError) {
            console.error('Error deleting image:', deleteError);
            // Don't throw error here as the flag deletion was successful
          }
        }

        res.status(200).json({ message: 'Flag deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 