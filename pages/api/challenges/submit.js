import { supabase } from '../../../lib/supabase';

// Generate or get session ID from cookie
function getSessionId(req, res) {
  const cookieName = 'challenge_session_id';
  
  // Try to get existing cookie from request headers
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...vals] = c.trim().split('=');
      return [key, vals.join('=')];
    })
  );
  
  let sessionId = cookies[cookieName];

  if (!sessionId) {
    // Generate new session ID using crypto
    sessionId = crypto.randomUUID();
    // Set cookie that expires in 30 days (same as challenge expiration)
    const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
    const cookieValue = `${cookieName}=${sessionId}; Path=/; Max-Age=${maxAge}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    res.setHeader('Set-Cookie', cookieValue);
  }

  return sessionId;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { challengeCode, playerName, gameStats } = req.body;

    if (!challengeCode || !playerName || !gameStats) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create session ID
    const sessionId = getSessionId(req, res);

    // Get challenge with expiration check in single query
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, expires_at')
      .eq('challenge_code', challengeCode)
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

    // Check for existing submission from this session
    const { data: existingResult, error: existingError } = await supabase
      .from('challenge_results')
      .select('id, score')
      .eq('challenge_id', challenge.id)
      .eq('session_id', sessionId)
      .limit(1)
      .single();

    // Only one attempt per session - no resubmissions allowed
    if (existingResult && !existingError) {
      return res.status(409).json({ 
        error: 'You have already submitted a score for this challenge. Only one attempt is allowed per session.',
        existing_score: existingResult.score
      });
    }

    // Insert result with session_id
    const { data: result, error: insertError } = await supabase
      .from('challenge_results')
      .insert({
        challenge_id: challenge.id,
        player_name: playerName,
        session_id: sessionId,
        score: gameStats.score,
        accuracy: parseFloat(gameStats.accuracy),
        time_elapsed: gameStats.timeElapsed,
        total_attempts: gameStats.totalAttempts,
        longest_streak: gameStats.longestStreak || 0,
        fastest_guess: gameStats.fastestGuess || null,
        game_stats: gameStats
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error submitting result:', insertError);
      return res.status(500).json({ error: 'Failed to submit result' });
    }

    return res.status(200).json({ 
      success: true,
      result_id: result.id
    });
  } catch (error) {
    console.error('Error in submit challenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

