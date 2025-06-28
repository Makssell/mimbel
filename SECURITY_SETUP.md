# Security Setup Guide

## Admin Authentication Security

This application now uses JWT-based authentication with rate limiting to prevent brute force attacks.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# JWT Secret Key (generate a strong random string, at least 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin Password (use a strong password)
ADMIN_PASSWORD=your-secure-admin-password-change-this
```

### Security Features

1. **JWT Tokens**: Secure token-based authentication instead of plain text passwords
2. **Rate Limiting**: Prevents brute force attacks (5 attempts, 15-minute lockout)
3. **Password Protection**: Admin password is not visible in client-side code
4. **Token Expiration**: JWT tokens expire after 24 hours
5. **IP-based Tracking**: Rate limiting is tracked by IP address

### Production Deployment

When deploying to production:

1. **Set Environment Variables**: Configure `JWT_SECRET` and `ADMIN_PASSWORD` on your hosting platform
2. **Use Strong Passwords**: Choose a complex admin password
3. **Generate Strong JWT Secret**: Use a cryptographically secure random string
4. **HTTPS Only**: Ensure your site uses HTTPS in production

### Example Strong JWT Secret

Generate a strong JWT secret using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Rate Limiting Details

- Maximum 5 failed login attempts per IP
- 15-minute lockout period after exceeding limit
- Lockout resets automatically after the time period
- Successful login clears failed attempts

### Security Notes

- The admin button is intentionally subtle to avoid attracting attention
- All API endpoints require valid JWT tokens
- Passwords are never stored in client-side code
- Rate limiting prevents automated attacks
