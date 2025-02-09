import { corsHeaders } from '../../lib/cors';

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-client-info, apikey');
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
        const response = await fetch(`https://jcucxwulsqjpvlzbpyep.supabase.co/rest/v1/flags${query}`, {
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
            },
        }
      );

      const data = await response.json();

      // Send the response with CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(data);
    } catch (error) {
      // Handle error
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(400).json({ error: error.message });
    }
  } else {
    // Method Not Allowed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
