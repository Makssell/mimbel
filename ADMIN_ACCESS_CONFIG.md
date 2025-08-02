# Admin Access Configuration

## Overview

The admin panel can be configured to allow or restrict access based on your security requirements.

## Environment Variables

### `NEXT_PUBLIC_RESTRICT_ADMIN_TO_LOCALHOST`

Controls whether admin access is restricted to localhost only.

**Values:**

- `true` (default): Admin access only allowed from `localhost` and `127.0.0.1`
- `false`: Admin access allowed from any domain

**Example:**

```bash
# Restrict to localhost only (default behavior)
NEXT_PUBLIC_RESTRICT_ADMIN_TO_LOCALHOST=true

# Allow access from any domain
NEXT_PUBLIC_RESTRICT_ADMIN_TO_LOCALHOST=false
```

## Security Considerations

### When to restrict to localhost:

- Development environments
- When you want to ensure admin access only from your local machine
- Additional security layer for sensitive operations

### When to allow external access:

- Production environments where you need remote admin access
- When deploying to platforms like Vercel, Netlify, etc.
- When you have proper authentication and authorization in place

## Authentication

Regardless of the domain restriction, admin access still requires:

1. Valid admin password (set via `ADMIN_PASSWORD` environment variable)
2. JWT token authentication
3. Rate limiting protection against brute force attacks

## Setup Instructions

1. **For localhost-only access (default):**

   ```bash
   # No additional configuration needed
   ```

2. **For external domain access:**

   ```bash
   # Add to your .env.local file
   NEXT_PUBLIC_RESTRICT_ADMIN_TO_LOCALHOST=false
   ```

3. **For production deployment:**
   ```bash
   # Set in your hosting platform's environment variables
   NEXT_PUBLIC_RESTRICT_ADMIN_TO_LOCALHOST=false
   ADMIN_PASSWORD=your_secure_password_here
   JWT_SECRET=your_32_character_jwt_secret_here
   ```

## Troubleshooting

### "Admin Access Restricted" message appears

- Check if `NEXT_PUBLIC_RESTRICT_ADMIN_TO_LOCALHOST` is set to `true`
- Ensure you're accessing from an allowed domain
- Verify environment variables are properly loaded

### Admin login fails

- Verify `ADMIN_PASSWORD` is set correctly
- Check that `JWT_SECRET` is at least 32 characters long
- Ensure you're not being rate-limited due to failed attempts
