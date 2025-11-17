# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `lynora-markets` (or any name you prefer)
   - Database Password: (save this securely)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

## 2. Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Run SQL Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `SUPABASE_SCHEMA.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## 4. Configure Environment Variables

1. In your frontend directory, create or update `.env` file:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Replace `xxxxx` with your actual Supabase project URL and key

## 5. Install Dependencies

```bash
cd frontend
npm install
```

This will install `@supabase/supabase-js` package.

## 6. Test the Setup

1. Start your frontend: `npm run dev`
2. Create a new market
3. Check Supabase dashboard → **Table Editor** → **markets** table
4. You should see your newly created market!

## Troubleshooting

### "Supabase not configured" warning
- Make sure `.env` file exists in `frontend/` directory
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart your dev server after adding env variables

### "relation 'markets' does not exist" error
- Make sure you ran the SQL schema in Supabase SQL Editor
- Check that the table was created: Go to **Table Editor** → you should see `markets` table

### Markets not appearing
- Check browser console for errors
- Verify Supabase API keys are correct
- Check Supabase dashboard → **Logs** for any errors

## Database Schema

The `markets` table has the following columns:
- `id` - Auto-incrementing database ID
- `market_id` - Blockchain market ID (unique)
- `creator` - Wallet address of market creator
- `question` - Market question
- `description` - Market description
- `end_time` - Unix timestamp (milliseconds)
- `status` - 'Active', 'Locked', or 'Resolved'
- `total_up_bets` - Total UP bets in MAS (string)
- `total_down_bets` - Total DOWN bets in MAS (string)
- `winning_option` - 'Up', 'Down', or NULL
- `created_at` - Unix timestamp (milliseconds)
- `resolution_price` - Resolution price
- `total_pool` - Total pool in MAS (string)
- `operation_id` - Blockchain operation ID
- `created_at_db` - Database timestamp (auto-generated)

## Row Level Security (RLS)

The table has RLS enabled with the following policies:
- **Anyone can read markets** - Public read access
- **Anyone can insert markets** - Public write access (for market creation)
- **Anyone can update markets** - Public update access (for bet updates, resolution)

This means anyone can create, read, and update markets without authentication.

