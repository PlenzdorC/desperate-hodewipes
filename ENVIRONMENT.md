# Environment Variables Configuration

This document describes all environment variables used in the Desperate Hordewipes guild website.

## Required Variables

### Supabase Configuration

Get these from your Supabase project settings (Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon/public key (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only, keep secret!)

### Authentication

```env
NEXTAUTH_SECRET=your-random-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
```

- `NEXTAUTH_SECRET`: Random secret for JWT signing (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your application URL (update for production)

### Battle.net OAuth

Create an OAuth client at [Battle.net Developer Portal](https://develop.battle.net/):

1. Go to https://develop.battle.net/
2. Click "Create Client"
3. Fill in the details:
   - **Client Name**: Your guild website name
   - **Redirect URIs**: Add `http://localhost:3000/api/auth/battlenet/callback`
   - **Service URL**: Your website URL
4. Copy the Client ID and Client Secret

```env
BATTLENET_CLIENT_ID=your-battlenet-client-id
BATTLENET_CLIENT_SECRET=your-battlenet-client-secret
BATTLENET_REDIRECT_URI=http://localhost:3000/api/auth/battlenet/callback
BATTLENET_REGION=eu
```

- `BATTLENET_CLIENT_ID`: Your Battle.net OAuth Client ID
- `BATTLENET_CLIENT_SECRET`: Your Battle.net OAuth Client Secret (keep secret!)
- `BATTLENET_REDIRECT_URI`: OAuth callback URL (must match Battle.net settings)
- `BATTLENET_REGION`: Your region (`eu`, `us`, `kr`, `tw`, or `cn`)

## Development Setup

1. Copy the example to create your local environment file:
   ```bash
   cp ENVIRONMENT.md .env.local
   ```

2. Edit `.env.local` and fill in your actual values

3. **Never commit `.env.local` to git!** (it's already in .gitignore)

## Production Setup

For production deployment (e.g., Vercel), update these variables:

```env
NEXTAUTH_URL=https://yourdomain.com
BATTLENET_REDIRECT_URI=https://yourdomain.com/api/auth/battlenet/callback
```

**Important:** Add the production callback URL to your Battle.net OAuth client settings!

## Security Notes

- **Never share your secrets publicly**
- **Never commit `.env.local` or `.env.production` to version control**
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `BATTLENET_CLIENT_SECRET` secure
- Use strong random values for `NEXTAUTH_SECRET`
- Rotate secrets regularly
- Use environment variables in your deployment platform (Vercel, etc.)

## Generating Secrets

Generate a secure random secret for `NEXTAUTH_SECRET`:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Troubleshooting

### "Invalid client credentials" (Battle.net)
- Verify `BATTLENET_CLIENT_ID` and `BATTLENET_CLIENT_SECRET` are correct
- Check that redirect URI matches exactly in Battle.net settings
- Ensure region is correct

### "Supabase connection failed"
- Verify Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure database schema is set up correctly

### "Authentication failed"
- Check `NEXTAUTH_SECRET` is set and consistent
- Clear browser cookies and try again
- Verify `NEXTAUTH_URL` matches your current domain

## Example .env.local

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXTAUTH_SECRET=uX5c8kT9mP2nR7wQ3vY6zA1bD4eF0gH8iJ5kL2mN9oP
NEXTAUTH_URL=http://localhost:3000

# Battle.net
BATTLENET_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0
BATTLENET_CLIENT_SECRET=x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6
BATTLENET_REDIRECT_URI=http://localhost:3000/api/auth/battlenet/callback
BATTLENET_REGION=eu
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Battle.net API Documentation](https://develop.battle.net/documentation)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

