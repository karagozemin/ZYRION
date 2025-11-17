-- Add missing columns to markets table if they don't exist
-- Run this in Supabase SQL Editor if you get "Could not find the 'bets' column" error

-- Add options column (JSONB)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'options'
  ) THEN
    ALTER TABLE markets ADD COLUMN options JSONB DEFAULT NULL;
  END IF;
END $$;

-- Add correct_answer column (TEXT)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'correct_answer'
  ) THEN
    ALTER TABLE markets ADD COLUMN correct_answer TEXT DEFAULT NULL;
  END IF;
END $$;

-- Add bets column (JSONB)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'bets'
  ) THEN
    ALTER TABLE markets ADD COLUMN bets JSONB DEFAULT NULL;
  END IF;
END $$;

-- Add max_reward column (BIGINT)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'markets' AND column_name = 'max_reward'
  ) THEN
    ALTER TABLE markets ADD COLUMN max_reward BIGINT DEFAULT 10;
  END IF;
END $$;

-- Refresh schema cache (PostgREST will auto-refresh, but this helps)
NOTIFY pgrst, 'reload schema';

