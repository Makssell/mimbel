import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gameSettings } = req.body;

    if (!gameSettings) {
      return res.status(400).json({ error: 'Game settings are required' });
    }

    // Generate unique challenge code (6-8 characters)
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let challengeCode = generateCode();
    let codeExists = true;
    
    // Ensure code is unique
    while (codeExists) {
      const { data: existing } = await supabase
        .from('challenges')
        .select('id')
        .eq('challenge_code', challengeCode)
        .single();
      
      if (!existing) {
        codeExists = false;
      } else {
        challengeCode = generateCode();
      }
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Insert challenge
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        challenge_code: challengeCode,
        game_settings: gameSettings,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return res.status(500).json({ error: 'Failed to create challenge' });
    }

    return res.status(200).json({ 
      challenge_code: challengeCode,
      challenge_id: data.id,
      expires_at: data.expires_at
    });
  } catch (error) {
    console.error('Error in create challenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

