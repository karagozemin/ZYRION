/**
 * Zyrion Contract Interactions - LIN Token
 * Functions to interact with the Linera smart contract (or mock in mock mode)
 */

import { walletManager } from './wallet';
import { parseLineraAmount } from './linera';
import { isMockMode, emitSimulationEvent } from './mockMode';
import { DEFAULT_MOCK_MARKETS } from './mockMarkets';
import { 
  saveMarketToSupabase, 
  getMarketsFromSupabase, 
  updateMarketInSupabase, 
  SupabaseMarket,
  saveUserBet,
  getUserBetsForMarket,
  calculateAndDistributeRewards,
  claimRewardForBet,
  UserBet,
} from './supabase';

// Contract address - will be set after deployment
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

// Log contract address on load
console.log('Contract Address:', CONTRACT_ADDRESS || 'NOT SET');

// ============================================================================
// Contract Call Functions (Write Operations)
// ============================================================================

// ============================================================================
// Local Storage for Optimistic Updates (MVP)
// ============================================================================

const LOCAL_MARKETS_KEY = 'zyrion_local_markets';

/**
 * Save a market to local storage (optimistic update)
 */
export function saveLocalMarket(market: Market): void {
  try {
    const existing = localStorage.getItem(LOCAL_MARKETS_KEY);
    const markets: Market[] = existing ? JSON.parse(existing) : [];
    
    // Check if market already exists (by id or operationId)
    const exists = markets.some(m => m.id === market.id);
    if (!exists) {
      markets.push(market);
      localStorage.setItem(LOCAL_MARKETS_KEY, JSON.stringify(markets));
      console.log('Market saved to local storage:', market.id);
    }
  } catch (error) {
    console.error('Error saving market to local storage:', error);
  }
}

/**
 * Get all markets from local storage
 */
export function getLocalMarkets(): Market[] {
  try {
    const existing = localStorage.getItem(LOCAL_MARKETS_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error reading markets from local storage:', error);
    return [];
  }
}

/**
 * Remove a market from local storage (after it's confirmed on blockchain)
 */
export function removeLocalMarket(marketId: number): void {
  try {
    const existing = localStorage.getItem(LOCAL_MARKETS_KEY);
    if (existing) {
      const markets: Market[] = JSON.parse(existing);
      const filtered = markets.filter(m => m.id !== marketId);
      localStorage.setItem(LOCAL_MARKETS_KEY, JSON.stringify(filtered));
      console.log('Market removed from local storage:', marketId);
    }
  } catch (error) {
    console.error('Error removing market from local storage:', error);
  }
}

/**
 * Create a new prediction market (question-answer style)
 * Returns operation ID and creates optimistic market entry
 */
export async function createMarket(
  question: string,
  description: string,
  durationMinutes: number,
  options: string[],
  correctAnswer: string,
  maxReward: number = 10, // Default max reward: 10 LIN
): Promise<{ operationId: string; market: Market }> {
  const { address } = walletManager.getState();
  if (!address) {
    throw new Error('Wallet not connected');
  }

  // Mock mode: simulate market creation
  if (isMockMode() || !CONTRACT_ADDRESS) {
    const currentTime = Date.now();
    const endTime = currentTime + (durationMinutes * 60 * 1000);
    const tempId = Math.floor(currentTime / 1000);
    
    const bets: Record<string, string> = {};
    options.forEach(option => {
      bets[option] = '0';
    });

    const mockMarket: Market = {
      id: tempId,
      creator: address,
      question,
      description,
      endTime,
      status: 'Active',
      options,
      correctAnswer,
      bets,
      maxReward,
      createdAt: currentTime,
      resolutionPrice: 0,
      totalPool: '0',
    };

    // Save to local storage
    saveLocalMarket(mockMarket);

    // Save to Supabase if available
    try {
      await saveMarketToSupabase({
        market_id: mockMarket.id,
        creator: mockMarket.creator,
        question: mockMarket.question,
        description: mockMarket.description,
        end_time: mockMarket.endTime,
        status: mockMarket.status,
        options: mockMarket.options,
        correct_answer: mockMarket.correctAnswer,
        bets: mockMarket.bets,
        max_reward: mockMarket.maxReward,
        created_at: mockMarket.createdAt,
        resolution_price: mockMarket.resolutionPrice,
        total_pool: mockMarket.totalPool,
        operation_id: `mock_${tempId}`,
      });
    } catch (error) {
      console.error('Failed to save market to Supabase:', error);
    }

    // Emit simulation event
    emitSimulationEvent('createBet');

    const operationId = `mock_${tempId}`;
    console.log('Market created (mock):', mockMarket.id, 'Operation ID:', operationId);
    return { operationId, market: mockMarket };
  }

  // Real mode: call contract (not implemented yet for Linera)
  throw new Error('Real contract calls not yet implemented for Linera');
}

/**
 * Place a bet on a market
 */
/**
 * Place a bet on a market (question-answer style)
 * Selects an option and bets an amount
 * Sends MAS to contract and updates Supabase
 */
export async function placeBet(
  marketId: number,
  selectedOption: string, // The option string (e.g., 'Option A', 'Option B')
  amount: string,
  options?: {
    onStepChange?: (step: 'placing') => void;
  },
): Promise<string> {
  const { address } = walletManager.getState();
  if (!address) {
    throw new Error('Wallet not connected');
  }

  // Validate market and option
  const allMarkets = await getAllMarkets();
  const market = allMarkets.find(m => m.id === marketId);
  
  if (!market) {
    throw new Error(`Market ${marketId} not found`);
  }
  
  if (!market.options || !market.options.includes(selectedOption)) {
    throw new Error(`Invalid option: ${selectedOption}`);
  }

  if (market.status !== 'Active') {
    throw new Error('Market is not active');
  }

  const amountNano = parseLineraAmount(amount);
  
  // Mock mode: simulate bet placement
  if (isMockMode() || !CONTRACT_ADDRESS) {
    options?.onStepChange?.('placing');
    
    // Update market bets
    if (!market.bets) {
      market.bets = {};
    }
    
    const currentBetAmount = market.bets[selectedOption] || '0';
    const newBetAmount = (BigInt(currentBetAmount) + amountNano).toString();
    market.bets[selectedOption] = newBetAmount;
    
    // Update total pool
    const totalPool = Object.values(market.bets).reduce((sum, bet) => {
      return BigInt(sum) + BigInt(bet);
    }, BigInt(0));
    market.totalPool = totalPool.toString();
    
    // Update in Supabase
    try {
      await updateMarketInSupabase(marketId, {
        bets: market.bets,
        total_pool: market.totalPool,
      });
      
      // Save user bet
      await saveUserBet({
        market_id: marketId,
        user_address: address,
        option: selectedOption,
        amount: amountNano.toString(),
        reward_amount: '0',
        claimed: false,
        created_at: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save bet to Supabase:', error);
    }
    
    // Emit simulation event
    emitSimulationEvent('joinBet');
    
    const operationId = `mock_bet_${marketId}_${Date.now()}`;
    console.log('Bet placed (mock):', { marketId, selectedOption, amount, operationId });
    return operationId;
  }

  // Real mode: call contract (not implemented yet for Linera)
  throw new Error('Real contract calls not yet implemented for Linera');
}

/**
 * Resolve a market (only creator can call)
 */
export async function resolveMarket(
  marketId: number,
  winningOption: 'up' | 'down',
  resolutionPrice: number,
): Promise<string> {
  // Mock mode: simulate market resolution
  if (isMockMode() || !CONTRACT_ADDRESS) {
    // Update market status in Supabase
    try {
      await updateMarketInSupabase(marketId, {
        status: 'Resolved',
        winning_option: winningOption === 'up' ? 'Up' : 'Down',
        resolution_price: resolutionPrice,
      });
      
      const operationId = `mock_resolve_${marketId}_${Date.now()}`;
      console.log('Market resolved (mock):', { marketId, winningOption, resolutionPrice, operationId });
      return operationId;
    } catch (error: any) {
      console.error('Error resolving market:', error);
      throw error;
    }
  }

  // Real mode: call contract (not implemented yet for Linera)
  throw new Error('Real contract calls not yet implemented for Linera');
}

/**
 * Claim reward from a resolved market (question-answer style)
 * Sends reward LIN to user's wallet
 */
export async function claimReward(marketId: number, betId: number): Promise<string> {
  const { address } = walletManager.getState();
  if (!address) {
    throw new Error('Wallet not connected');
  }

  // Get user bet to check reward amount
  const userBets = await getUserBetsForMarket(marketId, address);
  const bet = userBets.find(b => b.id === betId);
  
  if (!bet) {
    throw new Error('Bet not found');
  }

  if (bet.claimed) {
    throw new Error('Reward already claimed');
  }

  if (parseFloat(bet.reward_amount) <= 0) {
    throw new Error('No reward available');
  }

  // Get market to verify it's resolved
  const allMarkets = await getAllMarkets();
  const market = allMarkets.find(m => m.id === marketId);
  
  if (!market) {
    throw new Error('Market not found');
  }

  if (market.status !== 'Locked' && market.status !== 'Resolved') {
    throw new Error('Market is not resolved yet');
  }

  // Check if user bet on correct answer
  if (market.correctAnswer && bet.option !== market.correctAnswer) {
    throw new Error('You did not bet on the correct answer');
  }

  // Calculate reward amount in nanoLIN
  const rewardAmountNano = BigInt(bet.reward_amount);

  // Mock mode: simulate reward claim
  if (isMockMode() || !CONTRACT_ADDRESS) {
    try {
      // Mark as claimed in Supabase
      await claimRewardForBet(betId);
      
      // Emit simulation event
      emitSimulationEvent('claimRewards');
      
      const operationId = `mock_reward_${betId}_${Date.now()}`;
      console.log('Reward claimed (mock):', { 
        marketId, 
        betId, 
        rewardAmount: bet.reward_amount,
        rewardAmountLIN: Number(rewardAmountNano) / 1e9,
        operationId
      });
      
      return operationId;
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  // Real mode: call contract (not implemented yet for Linera)
  throw new Error('Real contract calls not yet implemented for Linera');

  /* 
  // TODO: When contract has transferReward function, uncomment this:
  try {
    // Prepare transfer data: user address
    const args = new Args()
      .addString(address.trim());

    const serializedArgs = args.serialize();
    console.log('Claim reward args:', {
      contractAddress: CONTRACT_ADDRESS.trim(),
      address: address.trim(),
      serializedLength: serializedArgs.length,
      rewardAmountNano: rewardAmountNano.toString(),
      rewardAmountMAS: Number(rewardAmountNano) / 1e9,
    });

    // Call transferReward function with coins - this will transfer MAS to user
    const operationId = await walletManager.sendOperation(
      CONTRACT_ADDRESS.trim(),
      'transferReward',
      serializedArgs,
      rewardAmountNano, // Send reward amount as coins
    );
    
    console.log('Reward transfer sent:', { marketId, betId, rewardAmount: bet.reward_amount, operationId });
    
    // Mark as claimed in Supabase after successful transfer
    await claimRewardForBet(betId);
    
    console.log('Reward claimed:', { marketId, betId, rewardAmount: bet.reward_amount, operationId });
    
    return operationId;
  } catch (error: any) {
    console.error('Error claiming reward:', error);
    throw error;
  }
  */
}

/**
 * Get user's claimable rewards for a market
 */
export async function getClaimableRewards(marketId: number, userAddress: string): Promise<UserBet[]> {
  const userBets = await getUserBetsForMarket(marketId, userAddress);
  
  // Filter for bets with rewards that haven't been claimed
  return userBets.filter(bet => 
    parseFloat(bet.reward_amount) > 0 && !bet.claimed
  );
}

// ============================================================================
// Contract Read Functions (View Operations)
// ============================================================================

export interface Market {
  id: number;
  creator: string;
  question: string;
  description: string;
  endTime: number;
  status: 'Active' | 'Locked' | 'Resolved';
  // Old format (for backward compatibility)
  totalUpBets?: string;
  totalDownBets?: string;
  winningOption?: 'Up' | 'Down' | null;
  // New format (question-answer style)
  options?: string[]; // e.g., ['Option A', 'Option B', 'Option C', 'Option D']
  correctAnswer?: string; // The correct answer selected by creator
  bets?: Record<string, string>; // { option: totalAmount } e.g., { 'Option A': '100', 'Option B': '50' }
  maxReward?: number; // Maximum reward per winner (default: 10 LIN)
  createdAt: number;
  resolutionPrice: number;
  totalPool: string;
}

export interface Bet {
  marketId: number;
  user: string;
  option: 'Up' | 'Down';
  amount: string;
  timestamp: number;
  claimed: boolean;
}

/**
 * Get market details
 * Uses getAllMarkets internally (mock mode compatible)
 */
export async function getMarketDetails(marketId: number): Promise<Market> {
  const allMarkets = await getAllMarkets();
  const market = allMarkets.find(m => m.id === marketId);
  
  if (!market) {
    throw new Error(`Market ${marketId} not found`);
  }
  
  return market;
}

/**
 * Get user bet details
 * Uses Supabase internally (mock mode compatible)
 */
export async function getUserBetDetails(
  marketId: number,
  userAddress: string,
): Promise<Bet> {
  const userBets = await getUserBetsForMarket(marketId, userAddress);
  
  if (userBets.length === 0) {
    throw new Error('No bet found for this user on this market');
  }
  
  // Return first bet (for backward compatibility with old format)
  const bet = userBets[0];
  return {
    marketId,
    user: userAddress,
    option: bet.option === 'Up' || bet.option === 'Down' ? bet.option : 'Up', // Default to Up for new format
    amount: bet.amount,
    timestamp: bet.created_at,
    claimed: bet.claimed,
  };
}

/**
 * Get market count
 * Uses getAllMarkets internally (mock mode compatible)
 */
export async function getMarketCount(): Promise<number> {
  const allMarkets = await getAllMarkets();
  return allMarkets.length;
}

/**
 * Check and update market status based on endTime
 * If endTime has passed and status is Active, change to Locked and calculate rewards
 */
async function checkAndUpdateMarketStatus(market: Market): Promise<Market> {
  const now = Date.now();
  
  // If market is Active and endTime has passed, change to Locked
  if (market.status === 'Active' && market.endTime <= now) {
    console.log(`Market ${market.id} has expired, updating to Locked`);
    
    // Update in Supabase
    try {
      await updateMarketInSupabase(market.id, {
        status: 'Locked',
      });
      
      // If this is a question-answer market with correct answer, calculate rewards
      if (market.options && market.correctAnswer && market.maxReward) {
        console.log('Calculating rewards for market:', market.id);
        await calculateAndDistributeRewards(
          market.id,
          market.correctAnswer,
          market.maxReward
        );
      }
    } catch (error) {
      console.error('Failed to update market status in Supabase:', error);
    }
    
    // Return updated market
    return {
      ...market,
      status: 'Locked',
    };
  }
  
  return market;
}

/**
 * Convert Supabase market to Market interface
 */
function supabaseMarketToMarket(sbMarket: SupabaseMarket): Market {
  // JSONB fields are already parsed by Supabase
  // But handle both string and object formats for safety
  let options: string[] | undefined;
  let bets: Record<string, string> | undefined;
  
  if (sbMarket.options) {
    try {
      if (Array.isArray(sbMarket.options)) {
        options = sbMarket.options;
      } else if (typeof sbMarket.options === 'string') {
        options = JSON.parse(sbMarket.options);
      }
    } catch (e) {
      console.error('Error parsing options:', e);
    }
  }
  
  if (sbMarket.bets) {
    try {
      if (typeof sbMarket.bets === 'object' && !Array.isArray(sbMarket.bets)) {
        bets = sbMarket.bets as Record<string, string>;
      } else if (typeof sbMarket.bets === 'string') {
        bets = JSON.parse(sbMarket.bets);
      }
    } catch (e) {
      console.error('Error parsing bets:', e);
    }
  }

  return {
    id: sbMarket.market_id,
    creator: sbMarket.creator,
    question: sbMarket.question,
    description: sbMarket.description,
    endTime: sbMarket.end_time,
    status: sbMarket.status,
    totalUpBets: sbMarket.total_up_bets,
    totalDownBets: sbMarket.total_down_bets,
    winningOption: sbMarket.winning_option,
    options,
    correctAnswer: sbMarket.correct_answer,
    bets,
    maxReward: sbMarket.max_reward || 10,
    createdAt: sbMarket.created_at,
    resolutionPrice: sbMarket.resolution_price,
    totalPool: sbMarket.total_pool,
  };
}

/**
 * Get all markets
 * Combines markets from Supabase, blockchain, and local storage (optimistic updates)
 */
export async function getAllMarkets(): Promise<Market[]> {
  // Get markets from Supabase first (primary source)
  const supabaseMarkets = await getMarketsFromSupabase();
  console.log('Markets from Supabase:', supabaseMarkets.length);
  
  // Convert Supabase markets to Market format and check/update status
  const marketsFromSupabase = await Promise.all(
    supabaseMarkets.map(async (sbMarket) => {
      const market = supabaseMarketToMarket(sbMarket);
      return await checkAndUpdateMarketStatus(market);
    })
  );
  
  // Get local markets (optimistic updates)
  const localMarkets = getLocalMarkets();
  console.log('Local markets:', localMarkets.length);

  // Add default mock markets if in mock mode (always show in mock mode)
  let mockMarkets: Market[] = [];
  if (isMockMode()) {
    // Convert DEFAULT_MOCK_MARKETS to Market format
    mockMarkets = DEFAULT_MOCK_MARKETS.map((mock, index) => ({
      id: parseInt(mock.id.replace('mock-', '')) || (10000 + index), // Use 10000+ to avoid conflicts
      creator: mock.creator,
      question: mock.question,
      description: mock.description,
      endTime: new Date(mock.endsAt).getTime(),
      status: (mock.status === 'active' ? 'Active' : (mock.status === 'resolved' ? 'Resolved' : 'Locked')) as 'Active' | 'Locked' | 'Resolved',
      options: mock.options,
      correctAnswer: mock.correctAnswer || undefined,
      bets: Object.fromEntries(
        Object.entries(mock.optionAmounts).map(([opt, amt]) => [opt, (amt * 1e9).toString()]) // Convert to nanoLIN
      ),
      maxReward: mock.maxReward,
      createdAt: new Date(mock.createdAt).getTime(),
      resolutionPrice: 0,
      totalPool: (mock.totalPool * 1e9).toString(), // Convert to nanoLIN
    }));
    console.log('Using default mock markets:', mockMarkets.length);
  }

  // Blockchain reading disabled for Linera (not implemented yet)
  // Markets are fetched from Supabase and local storage only

  // Merge all sources: Supabase (primary), local (optimistic), mock (fallback)
  // Priority: Supabase > Local > Mock
  const mergedMarkets = new Map<number, Market>();
  
  // Add Supabase markets (highest priority)
  marketsFromSupabase.forEach(market => {
    mergedMarkets.set(market.id, market);
  });
  
  // Add local markets (if not in Supabase - optimistic updates)
  // Also check and update their status
  for (const localMarket of localMarkets) {
    if (!mergedMarkets.has(localMarket.id)) {
      const updatedMarket = await checkAndUpdateMarketStatus(localMarket);
      mergedMarkets.set(localMarket.id, updatedMarket);
    } else {
      // Remove from local storage if it's now in Supabase
      removeLocalMarket(localMarket.id);
    }
  }
  
  // Add mock markets (if no other markets exist - fallback)
  mockMarkets.forEach(market => {
    if (!mergedMarkets.has(market.id)) {
      mergedMarkets.set(market.id, market);
    }
  });

  // Convert map to array and sort by createdAt (newest first)
  const allMarkets = Array.from(mergedMarkets.values());
  allMarkets.sort((a, b) => b.createdAt - a.createdAt); // Newest first

  console.log('Total markets (Supabase + local + mock):', allMarkets.length);
  return allMarkets;
}

/**
 * Calculate potential reward for a user
 */
export function calculatePotentialReward(
  market: Market,
  betAmount: string,
  betOption: 'up' | 'down',
): string {
  const betAmountBigInt = BigInt(betAmount);
  const totalUpBets = BigInt(market.totalUpBets || '0');
  const totalDownBets = BigInt(market.totalDownBets || '0');

  // Add user's bet to the pool
  let newUpBets = totalUpBets;
  let newDownBets = totalDownBets;

  if (betOption === 'up') {
    newUpBets += betAmountBigInt;
  } else {
    newDownBets += betAmountBigInt;
  }

  const newTotalPool = newUpBets + newDownBets;
  const winningPool = betOption === 'up' ? newUpBets : newDownBets;

  if (winningPool === BigInt(0)) {
    return '0';
  }

  // Reward = (userBet / winningPool) * totalPool
  const reward = (betAmountBigInt * newTotalPool) / winningPool;
  return reward.toString();
}

/**
 * Get market status (helper)
 */
export function getMarketStatus(market: Market): {
  isActive: boolean;
  isEnded: boolean;
  isResolved: boolean;
  timeLeft: number;
} {
  const now = Date.now();
  const endTime = market.endTime;
  const isEnded = now >= endTime;
  const isActive = market.status === 'Active' && !isEnded;
  const isResolved = market.status === 'Resolved';
  const timeLeft = Math.max(0, endTime - now);

  return {
    isActive,
    isEnded,
    isResolved,
    timeLeft,
  };
}
