import { supabase } from '../../../lib/supabase';
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

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName } = req.query;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('flags')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete file' });
    }

    res.status(200).json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 