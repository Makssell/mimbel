import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Challenge code is required' });
    }

    // Get challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id')
      .eq('challenge_code', code)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Delete all results first (cascade)
    const { error: resultsError } = await supabase
      .from('challenge_results')
      .delete()
      .eq('challenge_id', challenge.id);

    if (resultsError) {
      console.error('Error deleting results:', resultsError);
    }

    // Delete challenge
    const { error: deleteError } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challenge.id);

    if (deleteError) {
      console.error('Error deleting challenge:', deleteError);
      return res.status(500).json({ error: 'Failed to delete challenge' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in delete challenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

