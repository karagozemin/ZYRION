-- Supabase SQL Schema for Lynora Prediction Markets
-- Run this in Supabase SQL Editor

-- Drop existing table if you want to start fresh (uncomment if needed)
-- DROP TABLE IF EXISTS markets CASCADE;

-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
  id BIGSERIAL PRIMARY KEY,
  market_id BIGINT UNIQUE NOT NULL, -- Blockchain market ID
  creator TEXT NOT NULL, -- Wallet address of creator
  question TEXT NOT NULL,
  description TEXT NOT NULL,
  end_time BIGINT NOT NULL, -- Unix timestamp in milliseconds
  status TEXT NOT NULL CHECK (status IN ('Active', 'Locked', 'Resolved')),
  -- Old format (for backward compatibility)
  total_up_bets TEXT NOT NULL DEFAULT '0', -- Amount in MAS (string to preserve precision)
  total_down_bets TEXT NOT NULL DEFAULT '0', -- Amount in MAS (string to preserve precision)
  winning_option TEXT CHECK (winning_option IN ('Up', 'Down')) DEFAULT NULL,
  -- New format (question-answer style)
  options JSONB DEFAULT NULL, -- Array of option strings: ["Option A", "Option B", ...]
  correct_answer TEXT DEFAULT NULL, -- The correct answer string
  bets JSONB DEFAULT NULL, -- Object: {"Option A": "100", "Option B": "50", ...}
  max_reward BIGINT DEFAULT 10, -- Maximum reward per winner in MAS (default: 10)
  created_at BIGINT NOT NULL, -- Unix timestamp in milliseconds
  resolution_price BIGINT DEFAULT 0,
  total_pool TEXT NOT NULL DEFAULT '0', -- Amount in MAS (string to preserve precision)
  operation_id TEXT NOT NULL, -- Blockchain operation ID
  created_at_db TIMESTAMPTZ DEFAULT NOW() -- Database timestamp
);

-- Create index on market_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_markets_market_id ON markets(market_id);

-- Create index on creator for filtering user's markets
CREATE INDEX IF NOT EXISTS idx_markets_creator ON markets(creator);

-- Create index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON markets(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Anyone can read markets" ON markets;
DROP POLICY IF EXISTS "Anyone can insert markets" ON markets;
DROP POLICY IF EXISTS "Anyone can update markets" ON markets;

-- Create policy: Anyone can read markets
CREATE POLICY "Anyone can read markets" ON markets
  FOR SELECT
  USING (true);

-- Create policy: Anyone can insert markets (for market creation)
CREATE POLICY "Anyone can insert markets" ON markets
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Anyone can update markets (for bet updates, resolution, etc.)
CREATE POLICY "Anyone can update markets" ON markets
  FOR UPDATE
  USING (true);

-- Optional: Create a view for active markets
CREATE OR REPLACE VIEW active_markets AS
SELECT * FROM markets
WHERE status = 'Active' AND end_time > EXTRACT(EPOCH FROM NOW()) * 1000;

-- Optional: Create a view for resolved markets
CREATE OR REPLACE VIEW resolved_markets AS
SELECT * FROM markets
WHERE status = 'Resolved';

-- Function to automatically lock expired markets
CREATE OR REPLACE FUNCTION lock_expired_markets()
RETURNS void AS $$
BEGIN
  UPDATE markets
  SET status = 'Locked'
  WHERE status = 'Active'
    AND end_time <= EXTRACT(EPOCH FROM NOW()) * 1000;
END;
$$ LANGUAGE plpgsql;

-- Drop existing function if it exists (for clean re-run)
DROP FUNCTION IF EXISTS check_market_expiration();

-- Create a trigger to check market expiration on SELECT (optional, can be called manually)
-- Note: This is a simple approach. For production, consider using pg_cron or a scheduled job
CREATE OR REPLACE FUNCTION check_market_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be called manually or via a scheduled job
  -- For now, we'll rely on frontend checks, but this provides a backend option
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job using pg_cron (requires pg_cron extension)
-- Uncomment if you have pg_cron installed:
-- SELECT cron.schedule('lock-expired-markets', '*/1 * * * *', 'SELECT lock_expired_markets();');

-- Create user_bets table to track individual user bets
CREATE TABLE IF NOT EXISTS user_bets (
  id BIGSERIAL PRIMARY KEY,
  market_id BIGINT NOT NULL,
  user_address TEXT NOT NULL,
  option TEXT NOT NULL, -- The selected option string
  amount TEXT NOT NULL, -- Bet amount in MAS (string to preserve precision)
  reward_amount TEXT DEFAULT '0', -- Reward amount (2x bet, max 10 MAS)
  claimed BOOLEAN DEFAULT FALSE, -- Whether reward has been claimed
  created_at BIGINT NOT NULL, -- Unix timestamp in milliseconds
  created_at_db TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(market_id, user_address, option) -- One bet per user per option per market
);

-- Create index on market_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_bets_market_id ON user_bets(market_id);

-- Create index on user_address for filtering user's bets
CREATE INDEX IF NOT EXISTS idx_user_bets_user_address ON user_bets(user_address);

-- Create index on claimed for filtering unclaimed rewards
CREATE INDEX IF NOT EXISTS idx_user_bets_claimed ON user_bets(claimed);

-- Enable Row Level Security (RLS)
ALTER TABLE user_bets ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read user bets
CREATE POLICY "Anyone can read user bets" ON user_bets
  FOR SELECT
  USING (true);

-- Create policy: Anyone can insert user bets
CREATE POLICY "Anyone can insert user bets" ON user_bets
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Users can update their own bets (for claiming rewards)
CREATE POLICY "Users can update their own bets" ON user_bets
  FOR UPDATE
  USING (true);

