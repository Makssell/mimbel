import { 
  generateToken, 
  checkRateLimit, 
  recordFailedAttempt, 
  clearFailedAttempts,
  getAdminPassword 
} from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ error: rateLimitCheck.message });
    }

    // Verify password
    if (password !== getAdminPassword()) {
      recordFailedAttempt(clientIP);
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(clientIP);

    // Generate JWT token
    const token = generateToken('admin', 'admin');

    res.status(200).json({ 
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 