import { supabase } from '../../../lib/supabase';

// Get session ID from cookie
function getSessionId(req) {
  const cookieName = 'challenge_session_id';
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...vals] = c.trim().split('=');
      return [key, vals.join('=')];
    })
  );
  return cookies[cookieName] || null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Challenge code is required' });
    }

    // Get current session ID
    const currentSessionId = getSessionId(req);

    // Get challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('challenge_code', code)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(challenge.expires_at);
    if (now > expiresAt) {
      return res.status(410).json({ error: 'Challenge has expired' });
    }

    // Get results/leaderboard - fetch all results first
    const { data: allResults, error: resultsError } = await supabase
      .from('challenge_results')
      .select('*')
      .eq('challenge_id', challenge.id)
      .order('score', { ascending: false })
      .order('accuracy', { ascending: false })
      .order('created_at', { ascending: true });

    if (resultsError) {
      console.error('Error fetching results:', resultsError);
    }

    // Deduplicate: Keep only the best score per player
    // Since results are already sorted by score (desc), we keep the first occurrence of each player
    const playerBestScores = new Map();
    (allResults || []).forEach(result => {
      const playerName = result.player_name;
      if (!playerBestScores.has(playerName)) {
        playerBestScores.set(playerName, result);
      } else {
        // If we already have a score for this player, compare and keep the better one
        const existing = playerBestScores.get(playerName);
        const existingScore = existing.score || 0;
        const newScore = result.score || 0;
        const existingAccuracy = parseFloat(existing.accuracy) || 0;
        const newAccuracy = parseFloat(result.accuracy) || 0;
        
        // Keep the new one if: score is higher, or same score but better accuracy
        if (newScore > existingScore || (newScore === existingScore && newAccuracy > existingAccuracy)) {
          playerBestScores.set(playerName, result);
        }
      }
    });

    // Convert back to array and sort again (in case deduplication changed order)
    const results = Array.from(playerBestScores.values())
      .sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        const accuracyDiff = (parseFloat(b.accuracy) || 0) - (parseFloat(a.accuracy) || 0);
        if (accuracyDiff !== 0) return accuracyDiff;
        return new Date(a.created_at) - new Date(b.created_at);
      })
      .map(result => ({
        ...result,
        // Mark if this is the current session's result
        isCurrentSession: currentSessionId && result.session_id === currentSessionId
      }));

    return res.status(200).json({
      challenge: {
        id: challenge.id,
        challenge_code: challenge.challenge_code,
        game_settings: challenge.game_settings,
        created_at: challenge.created_at,
        expires_at: challenge.expires_at
      },
      results: results || [],
      currentSessionId: currentSessionId // Also return session ID for frontend use
    });
  } catch (error) {
    console.error('Error in get challenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

