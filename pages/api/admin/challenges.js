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
        // Get all challenges with result counts
        const { data: challenges, error: challengesError } = await supabaseAdmin
          .from('challenges')
          .select('*')
          .order('created_at', { ascending: false });

        if (challengesError) throw challengesError;

        // Get result counts for each challenge
        const challengesWithCounts = await Promise.all(
          challenges.map(async (challenge) => {
            const { count, error: countError } = await supabaseAdmin
              .from('challenge_results')
              .select('*', { count: 'exact', head: true })
              .eq('challenge_id', challenge.id);

            if (countError) {
              console.error('Error counting results:', countError);
            }

            // Check if challenge is active (not expired)
            const now = new Date();
            const expiresAt = new Date(challenge.expires_at);
            const isActive = now <= expiresAt;

            return {
              ...challenge,
              result_count: count || 0,
              is_active: isActive
            };
          })
        );

        res.status(200).json(challengesWithCounts);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ error: 'Challenge ID is required' });
        }

        // Delete all results first (cascade)
        const { error: resultsError } = await supabaseAdmin
          .from('challenge_results')
          .delete()
          .eq('challenge_id', id);

        if (resultsError) {
          console.error('Error deleting results:', resultsError);
        }

        // Delete challenge
        const { error: deleteError } = await supabaseAdmin
          .from('challenges')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting challenge:', deleteError);
          return res.status(500).json({ error: 'Failed to delete challenge' });
        }

        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting challenge:', error);
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}













