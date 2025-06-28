import jwt from 'jsonwebtoken';

// In production, use a strong secret key (at least 32 characters)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-secure-admin-password-change-this';

// Simple in-memory rate limiting (in production, use Redis or database)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export function generateToken(userId, role = 'admin') {
  return jwt.sign(
    { userId, role, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, firstAttempt: now, lockedUntil: 0 };

  // Check if IP is locked out
  if (attempts.lockedUntil > now) {
    const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000 / 60);
    return { allowed: false, message: `Too many failed attempts. Try again in ${remainingTime} minutes.` };
  }

  // Reset if lockout period has passed
  if (attempts.lockedUntil > 0 && attempts.lockedUntil <= now) {
    attempts.count = 0;
    attempts.lockedUntil = 0;
  }

  return { allowed: true, attempts };
}

export function recordFailedAttempt(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, firstAttempt: Date.now(), lockedUntil: 0 };
  attempts.count++;

  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_TIME;
  }

  loginAttempts.set(ip, attempts);
}

export function clearFailedAttempts(ip) {
  loginAttempts.delete(ip);
}

export function getAdminPassword() {
  return ADMIN_PASSWORD;
}

// Clean up old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of loginAttempts.entries()) {
    if (attempts.lockedUntil > 0 && attempts.lockedUntil <= now) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000); 