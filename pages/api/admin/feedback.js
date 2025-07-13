import { supabaseAdmin } from '../../../lib/supabase-admin';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  // Check if admin password is provided in headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  
  // Simple token validation (you might want to use proper JWT validation)
  if (token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabaseAdmin
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data || []);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
      }
      break;

    case 'POST':
      try {
        const { category, description, email, gameContext, currentFlag } = req.body;

        if (!category || !description) {
          return res.status(400).json({ error: 'Category and description are required' });
        }

        const { data, error } = await supabaseAdmin
          .from('feedback')
          .insert([
            {
              category,
              description,
              email: email || 'anonymous',
              game_context: gameContext || {},
              current_flag: currentFlag || null,
              status: 'new'
            }
          ])
          .select();

        if (error) throw error;

        res.status(201).json(data[0]);
      } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ error: 'Failed to create feedback' });
      }
      break;

    case 'PUT':
      try {
        const { id, status, admin_notes } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Feedback ID is required' });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

        const { data, error } = await supabaseAdmin
          .from('feedback')
          .update(updateData)
          .eq('id', id)
          .select();

        if (error) throw error;

        res.status(200).json(data[0]);
      } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ error: 'Failed to update feedback' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ error: 'Feedback ID is required' });
        }

        const { error } = await supabaseAdmin
          .from('feedback')
          .delete()
          .eq('id', id);

        if (error) throw error;

        res.status(200).json({ message: 'Feedback deleted successfully' });
      } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 