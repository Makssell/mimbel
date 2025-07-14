import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { category, description, email, gameContext, currentFlag } = req.body;

        if (!category || !description) {
          return res.status(400).json({ error: 'Category and description are required' });
        }

        // Insert feedback into the database
        const { data, error } = await supabaseAdmin
          .from('feedback')
          .insert([
            {
              category,
              description,
              email: email || 'anonymous',
              game_context: gameContext || {},
              current_flag: currentFlag || null,
              status: 'new',
              created_at: new Date().toISOString()
            }
          ])
          .select();

        if (error) {
          console.error('Error inserting feedback:', error);
          throw new Error('Failed to save feedback to database');
        }

        res.status(201).json(data[0]);
        
      } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ error: 'Failed to create feedback' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 