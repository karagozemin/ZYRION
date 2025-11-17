/**
 * Supabase Client Configuration
 * Handles database operations for markets
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client only if both URL and key are provided
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
} else {
  console.warn('Supabase URL or Anon Key not set. Database features will be disabled.');
}

// Export supabase client (can be null if not configured)
export const supabase = supabaseClient as ReturnType<typeof createClient> | null;

// Database types
export interface SupabaseMarket {
  id?: number;
  market_id: number; // Blockchain market ID
  creator: string;
  question: string;
  description: string;
  end_time: number; // Unix timestamp in milliseconds
  status: 'Active' | 'Locked' | 'Resolved';
  // Old format (for backward compatibility)
  total_up_bets?: string;
  total_down_bets?: string;
  winning_option?: 'Up' | 'Down' | null;
  // New format (question-answer style)
  options?: string[]; // JSON array of options
  correct_answer?: string; // The correct answer
  bets?: Record<string, string>; // JSON object: { option: amount }
  max_reward?: number; // Maximum reward per winner (default: 10 LIN)
  created_at: number; // Unix timestamp in milliseconds
  resolution_price: number;
  total_pool: string;
  operation_id: string; // Blockchain operation ID
  created_at_db?: string; // Database timestamp
}

/**
 * Save market to Supabase
 */
export async function saveMarketToSupabase(market: SupabaseMarket): Promise<void> {
  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping database save');
    return;
  }

  try {
    // Build the data object, only including fields that exist
    const marketData: any = {
      market_id: market.market_id,
      creator: market.creator,
      question: market.question,
      description: market.description,
      end_time: market.end_time,
      status: market.status,
      total_up_bets: market.total_up_bets || '0',
      total_down_bets: market.total_down_bets || '0',
      winning_option: market.winning_option || null,
      created_at: market.created_at,
      resolution_price: market.resolution_price,
      total_pool: market.total_pool,
      operation_id: market.operation_id,
    };

    // Only add new format fields if they exist (for backward compatibility)
    if (market.options !== undefined) {
      marketData.options = market.options;
    }
    if (market.correct_answer !== undefined) {
      marketData.correct_answer = market.correct_answer;
    }
    if (market.bets !== undefined) {
      marketData.bets = market.bets;
    }
    if (market.max_reward !== undefined) {
      marketData.max_reward = market.max_reward;
    }

    const client = supabase;
    if (!client) return;
    
    // @ts-ignore - Supabase client type inference issue
    const { error } = await client
      .from('markets')
      .upsert(marketData, {
        onConflict: 'market_id', // Update if market_id already exists
      });

    if (error) {
      console.error('Error saving market to Supabase:', error);
      
      // If it's a column not found error, log a helpful message
      if (error.message && error.message.includes("Could not find the 'bets' column")) {
        console.error('⚠️ Missing columns in Supabase! Please run ADD_BETS_COLUMN.sql in Supabase SQL Editor');
      }
      
      // Don't throw - allow operation to continue even if DB save fails
      // The market will still be saved to local storage and blockchain
      return;
    }

    console.log('Market saved to Supabase:', market.market_id);
  } catch (error) {
    console.error('Failed to save market to Supabase:', error);
    // Don't throw - allow operation to continue even if DB save fails
  }
}

/**
 * Get all markets from Supabase
 */
export async function getMarketsFromSupabase(): Promise<SupabaseMarket[]> {
  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, returning empty array');
    return [];
  }

  try {
    const client = supabase;
    if (!client) return [];
    
    const { data, error } = await client
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching markets from Supabase:', error);
      return [];
    }

    return (data || []) as SupabaseMarket[];
  } catch (error) {
    console.error('Failed to fetch markets from Supabase:', error);
    return [];
  }
}

/**
 * Update market in Supabase
 */
export async function updateMarketInSupabase(
  marketId: number,
  updates: Partial<SupabaseMarket>
): Promise<void> {
  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping database update');
    return;
  }

  try {
    const client = supabase;
    if (!client) return;
    
    // @ts-ignore - Supabase client type inference issue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (client as any)
      .from('markets')
      .update(updates)
      .eq('market_id', marketId);

    if (error) {
      console.error('Error updating market in Supabase:', error);
      throw error;
    }

    console.log('Market updated in Supabase:', marketId);
  } catch (error) {
    console.error('Failed to update market in Supabase:', error);
    // Don't throw - allow operation to continue even if DB update fails
  }
}

// User Bet types
export interface UserBet {
  id?: number;
  market_id: number;
  user_address: string;
  option: string;
  amount: string;
  reward_amount: string;
  claimed: boolean;
  created_at: number;
  created_at_db?: string;
}

/**
 * Save user bet to Supabase
 */
export async function saveUserBet(bet: UserBet): Promise<void> {
  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping user bet save');
    return;
  }

  try {
    const client = supabase;
    if (!client) return;
    
    // @ts-ignore - Supabase client type inference issue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (client as any)
      .from('user_bets')
      .upsert({
        market_id: bet.market_id,
        user_address: bet.user_address,
        option: bet.option,
        amount: bet.amount,
        reward_amount: bet.reward_amount || '0',
        claimed: bet.claimed || false,
        created_at: bet.created_at,
      }, {
        onConflict: 'market_id,user_address,option', // Update if exists
      });

    if (error) {
      console.error('Error saving user bet to Supabase:', error);
      throw error;
    }

    console.log('User bet saved to Supabase:', bet);
  } catch (error) {
    console.error('Failed to save user bet to Supabase:', error);
    // Don't throw - allow operation to continue
  }
}

/**
 * Get user bets for a market
 */
export async function getUserBetsForMarket(marketId: number, userAddress: string): Promise<UserBet[]> {
  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, returning empty array');
    return [];
  }

  try {
    const client = supabase;
    if (!client) return [];
    
    const { data, error } = await client
      .from('user_bets')
      .select('*')
      .eq('market_id', marketId)
      .eq('user_address', userAddress);

    if (error) {
      console.error('Error fetching user bets:', error);
      return [];
    }

    return (data || []) as UserBet[];
  } catch (error) {
    console.error('Failed to fetch user bets:', error);
    return [];
  }
}

/**
 * Calculate and update rewards for winners when market is resolved
 */
export async function calculateAndDistributeRewards(marketId: number, correctAnswer: string, maxReward: number = 10): Promise<void> {
  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping reward calculation');
    return;
  }

  try {
    const client = supabase;
    if (!client) return;
    
    // Get all bets for the correct answer
    // @ts-ignore - Supabase client type inference issue
    const { data: winningBets, error: fetchError } = await client
      .from('user_bets')
      .select('*')
      .eq('market_id', marketId)
      .eq('option', correctAnswer);

    if (fetchError) {
      console.error('Error fetching winning bets:', fetchError);
      throw fetchError;
    }

    if (!winningBets || winningBets.length === 0) {
      console.log('No winning bets found for market:', marketId);
      return;
    }

    // Calculate rewards: 2x bet amount, max maxReward MAS
    // bet.amount is in nanoMAS (string), convert to MAS first
    const updates = (winningBets as UserBet[]).map(bet => {
      const betAmountNano = BigInt(bet.amount);
      const betAmountMAS = Number(betAmountNano) / 1e9; // Convert nanoMAS to MAS
      const rewardAmountMAS = Math.min(betAmountMAS * 2, maxReward);
      const rewardAmountNano = BigInt(Math.floor(rewardAmountMAS * 1e9)); // Convert back to nanoMAS
      
      return {
        id: bet.id,
        reward_amount: rewardAmountNano.toString(), // Store in nanoMAS
      };
    });

    // Update all winning bets with reward amounts
    for (const update of updates) {
      if (!client) continue;
      // @ts-ignore - Supabase client type inference issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (client as any)
        .from('user_bets')
        .update({ reward_amount: update.reward_amount })
        .eq('id', update.id);

      if (updateError) {
        console.error('Error updating reward for bet:', update.id, updateError);
      }
    }

    console.log('Rewards calculated for', updates.length, 'winners in market', marketId);
  } catch (error) {
    console.error('Failed to calculate and distribute rewards:', error);
    // Don't throw - allow operation to continue
  }
}

/**
 * Claim reward for a user bet
 */
export async function claimRewardForBet(betId: number): Promise<void> {
  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping reward claim');
    return;
  }

  try {
    const client = supabase;
    if (!client) return;
    
    // @ts-ignore - Supabase client type inference issue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (client as any)
      .from('user_bets')
      .update({ claimed: true })
      .eq('id', betId);

    if (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }

    console.log('Reward claimed for bet:', betId);
  } catch (error) {
    console.error('Failed to claim reward:', error);
    throw error;
  }
}

