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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, fileName } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ error: 'File and fileName are required' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('flags') // Make sure this bucket exists in your Supabase project
      .upload(uniqueFileName, buffer, {
        contentType: 'image/png', // Adjust based on your image type
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('flags')
      .getPublicUrl(uniqueFileName);

    res.status(200).json({ 
      url: urlData.publicUrl,
      fileName: uniqueFileName 
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 