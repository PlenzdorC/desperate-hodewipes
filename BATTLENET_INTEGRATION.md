# Battle.net OAuth Integration - Implementation Guide

## Overview

This document describes the complete Battle.net OAuth integration that allows guild members to log in with their Battle.net accounts, sync their WoW characters, and track weekly activities (Mythic+, Raids, Great Vault progress).

## Features Implemented

### ✅ Battle.net OAuth Authentication
- Secure OAuth 2.0 login flow
- Automatic token refresh
- Session management with JWT
- Separate authentication from admin login

### ✅ Character Management
- Automatic character synchronization from Battle.net API
- Support for multiple characters per account
- Main character designation
- Real-time character data updates (ilvl, spec, achievements)
- Character equipment tracking

### ✅ Weekly Activity Tracking
- Mythic+ runs and highest key level
- Raid boss kills and difficulty
- Great Vault progress (M+, Raid, PvP tiers)
- Week-over-week comparison
- Guild-wide leaderboards

### ✅ Member Dashboard
- Personal character overview
- One-click character synchronization
- Weekly activity summary
- Character-specific refresh options

### ✅ Guild Overview
- View all members' weekly activities
- Sortable leaderboards (M+, Raid, iLvl)
- Statistics and metrics
- Activity tracking for roster management

## File Structure

```
desperate-hordewipes-nextjs/
├── src/
│   ├── lib/
│   │   └── battlenet.ts                    # Battle.net API utilities
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── battlenet/
│   │   │   │   │   ├── route.ts           # OAuth initiation
│   │   │   │   │   └── callback/
│   │   │   │   │       └── route.ts       # OAuth callback
│   │   │   │   ├── check-member-auth/
│   │   │   │   │   └── route.ts           # Auth verification
│   │   │   │   └── member-logout/
│   │   │   │       └── route.ts           # Member logout
│   │   │   └── member/
│   │   │       ├── characters/
│   │   │       │   ├── route.ts           # List/sync characters
│   │   │       │   └── [characterId]/
│   │   │       │       ├── refresh/
│   │   │       │       │   └── route.ts   # Refresh character data
│   │   │       │       ├── set-main/
│   │   │       │       │   └── route.ts   # Set main character
│   │   │       │       └── weekly-activity/
│   │   │       │           └── route.ts   # Weekly activity
│   │   │       └── weekly-overview/
│   │   │           └── route.ts           # Guild overview
│   │   └── member/
│   │       ├── login/
│   │       │   └── page.tsx               # Login page
│   │       ├── dashboard/
│   │       │   └── page.tsx               # Member dashboard
│   │       └── weekly-overview/
│   │           └── page.tsx               # Guild overview page
│   ├── types/
│   │   └── database.ts                    # Updated with new tables
│   └── components/
│       └── layout/
│           └── Navbar.tsx                 # Updated with member login link
├── supabase/
│   └── schema.sql                         # Updated database schema
├── ENVIRONMENT.md                         # Environment variables guide
└── README.md                             # Updated documentation
```

## Database Schema

### New Tables

#### `battle_net_users`
Stores Battle.net authenticated users with OAuth tokens.

```sql
- id (UUID, primary key)
- battlenet_id (BIGINT, unique)
- battletag (TEXT)
- access_token (TEXT)
- refresh_token (TEXT)
- token_expires_at (TIMESTAMP)
- region (TEXT)
- created_at, last_login, updated_at (TIMESTAMP)
```

#### `user_characters`
Stores all WoW characters for authenticated users.

```sql
- id (UUID, primary key)
- user_id (UUID, foreign key to battle_net_users)
- character_id (BIGINT)
- name, realm, realm_slug (TEXT)
- faction, race, character_class (TEXT)
- active_spec, gender (TEXT, nullable)
- level, average_item_level, equipped_item_level (INTEGER)
- achievement_points (INTEGER)
- thumbnail_url, avatar_url (TEXT)
- is_main (BOOLEAN)
- last_login_timestamp (BIGINT)
- created_at, updated_at (TIMESTAMP)
```

#### `weekly_activities`
Tracks weekly progress for each character.

```sql
- id (UUID, primary key)
- character_id (UUID, foreign key to user_characters)
- week_start, week_end (DATE)
- mythic_plus_runs, highest_key_level, total_keys_completed (INTEGER)
- raid_bosses_killed (INTEGER)
- raid_difficulty (TEXT)
- vault_mythic_plus_tier, vault_raid_tier, vault_pvp_tier (INTEGER)
- raw_data (JSONB)
- created_at, updated_at (TIMESTAMP)
```

#### `character_equipment`
Stores character equipment details.

```sql
- id (UUID, primary key)
- character_id (UUID, foreign key to user_characters)
- slot, item_name (TEXT)
- item_id, item_level (INTEGER)
- quality (TEXT)
- icon_url (TEXT)
- enchantments, gems (JSONB)
- created_at, updated_at (TIMESTAMP)
```

## Setup Instructions

### 1. Update Database Schema

Run the updated schema in your Supabase SQL Editor:

```bash
# The file supabase/schema.sql has been updated with all new tables
```

### 2. Configure Battle.net OAuth

1. Go to [Battle.net Developer Portal](https://develop.battle.net/)
2. Create a new OAuth Client
3. Add redirect URIs:
   - Development: `http://localhost:3000/api/auth/battlenet/callback`
   - Production: `https://yourdomain.com/api/auth/battlenet/callback`
4. Copy Client ID and Client Secret

### 3. Set Environment Variables

Create/update `.env.local` with:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# New Battle.net variables
BATTLENET_CLIENT_ID=your_client_id
BATTLENET_CLIENT_SECRET=your_client_secret
BATTLENET_REDIRECT_URI=http://localhost:3000/api/auth/battlenet/callback
BATTLENET_REGION=eu
```

See `ENVIRONMENT.md` for detailed configuration guide.

### 4. Install Dependencies (if needed)

All required dependencies are already in package.json. Just run:

```bash
npm install
```

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Test the Implementation

1. Visit http://localhost:3000
2. Click "Member Login" in the navbar
3. Click "Mit Battle.net anmelden"
4. Authorize the application
5. You'll be redirected to your dashboard
6. Click "Jetzt synchronisieren" to import your characters
7. Click "Aktivität laden" on a character to fetch weekly data

## API Endpoints

### Authentication

- `GET /api/auth/battlenet` - Initiate OAuth flow
- `GET /api/auth/battlenet/callback` - Handle OAuth callback
- `GET /api/auth/check-member-auth` - Check authentication status
- `POST /api/auth/member-logout` - Logout member

### Character Management

- `GET /api/member/characters` - Get user's characters
- `POST /api/member/characters` - Sync characters from Battle.net
- `POST /api/member/characters/[id]/refresh` - Refresh character data
- `POST /api/member/characters/[id]/set-main` - Set main character
- `GET /api/member/characters/[id]/weekly-activity` - Get weekly activity
- `POST /api/member/characters/[id]/weekly-activity` - Update weekly activity

### Guild Overview

- `GET /api/member/weekly-overview` - Get all members' weekly activities

## User Flow

### 1. Member Login
1. User clicks "Member Login" in navbar
2. Redirected to `/member/login`
3. Clicks "Mit Battle.net anmelden"
4. Redirected to Battle.net OAuth page
5. Authorizes the application
6. Redirected back to `/member/dashboard`

### 2. Character Sync
1. On dashboard, click "Jetzt synchronisieren"
2. System fetches all WoW characters from Battle.net API
3. For each character:
   - Fetches detailed profile (spec, ilvl, etc.)
   - Fetches character media (avatar, render)
   - Stores in database
4. Characters displayed in dashboard

### 3. Weekly Activity Tracking
1. Click "Aktivität laden" on a character
2. System fetches:
   - Mythic+ profile (runs, key levels)
   - Raid progress (boss kills, difficulty)
   - Calculates Great Vault tiers
3. Stores weekly snapshot in database
4. Displays progress summary

### 4. Guild Overview
1. Navigate to `/member/weekly-overview`
2. View all members' activities for current week
3. Sort by different metrics (M+, Raid, iLvl)
4. See guild-wide statistics

## Security Features

- **OAuth 2.0** - Secure third-party authentication
- **CSRF Protection** - State parameter validation
- **HTTP-only Cookies** - Session tokens not accessible via JavaScript
- **Token Refresh** - Automatic refresh of expired Battle.net tokens
- **Row Level Security** - Database-level access control
- **Separate Sessions** - Member and admin sessions are independent

## API Rate Limits

Battle.net API has rate limits. The implementation includes:

- Caching of character data (update manually, not on every page load)
- Token reuse (refresh only when expired)
- Batch operations where possible

**Recommendation:** Don't refresh all characters automatically. Let users manually trigger updates.

## Troubleshooting

### "Invalid client credentials"
- Check `BATTLENET_CLIENT_ID` and `BATTLENET_CLIENT_SECRET`
- Ensure redirect URI matches exactly in Battle.net settings

### "No characters found"
- User may not have any WoW characters on their Battle.net account
- Check that the Battle.net account has an active WoW subscription
- Verify the region is correct

### "Token expired"
- The system should auto-refresh tokens
- If persistent, check `BATTLENET_CLIENT_SECRET` is correct
- User may need to re-authenticate

### Characters not updating
- Click "Daten aktualisieren" on individual characters
- Check Battle.net API status: https://develop.battle.net/
- Verify API credentials and region

## Future Enhancements

Potential additions:

- **Auto-refresh** - Scheduled character updates (cron jobs)
- **PvP Tracking** - Rating, arena stats
- **Raider.IO Integration** - M+ scores and rankings
- **WarcraftLogs Integration** - Parse logs, DPS rankings
- **Gear Optimizer** - Recommend upgrades
- **Attendance Tracking** - Track raid/event attendance
- **Loot Council** - Integrated loot management
- **Discord Integration** - Sync roles based on rank/activity

## Support

For issues or questions:

1. Check `ENVIRONMENT.md` for configuration
2. Review error messages in browser console
3. Check Next.js server logs
4. Verify Supabase logs in dashboard
5. Test API endpoints directly with Postman/curl

## Resources

- [Battle.net API Documentation](https://develop.battle.net/documentation)
- [WoW Profile API Guide](https://develop.battle.net/documentation/world-of-warcraft/profile-apis)
- [OAuth 2.0 Guide](https://oauth.net/2/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**For the Horde! 🗡️**

