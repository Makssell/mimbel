import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
      .select('*')
      .eq('challenge_code', code)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Get all results
    const { data: results, error: resultsError } = await supabase
      .from('challenge_results')
      .select('*')
      .eq('challenge_id', challenge.id)
      .order('score', { ascending: false })
      .order('accuracy', { ascending: false });

    if (resultsError) {
      console.error('Error fetching results:', resultsError);
      return res.status(500).json({ error: 'Failed to fetch results' });
    }

    // Format as plain text
    const settings = challenge.game_settings;
    const formatTime = (ms) => {
      const seconds = Math.floor(ms / 1000);
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    };

    let text = 'Challenge Results\n';
    text += '='.repeat(50) + '\n\n';
    
    // Settings
    text += 'Game Settings:\n';
    text += `  Game Mode: ${settings.gameMode || 'N/A'}\n`;
    text += `  Game Type: ${settings.gameType || 'N/A'}\n`;
    if (settings.country) text += `  Country: ${settings.country}\n`;
    if (settings.region) text += `  Region: ${settings.region}\n`;
    if (settings.territories) text += `  Territories: ${settings.territories}\n`;
    text += `  Mode: ${settings.mode || 'N/A'}\n`;
    if (settings.typingMode) text += `  Typing Mode: Enabled\n`;
    text += `  Created: ${new Date(challenge.created_at).toLocaleDateString()}\n\n`;

    // Leaderboard
    text += 'Leaderboard:\n';
    text += '-'.repeat(50) + '\n';
    
    if (!results || results.length === 0) {
      text += 'No players yet.\n';
    } else {
      results.forEach((result, index) => {
        text += `${index + 1}. ${result.player_name}\n`;
        text += `   Score: ${result.score} | `;
        text += `Accuracy: ${result.accuracy}% | `;
        text += `Time: ${formatTime(result.time_elapsed)}\n`;
        if (result.longest_streak > 0) {
          text += `   Longest Streak: ${result.longest_streak}\n`;
        }
        text += '\n';
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="challenge-${code}-results.txt"`);
    
    return res.status(200).send(text);
  } catch (error) {
    console.error('Error in export challenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

