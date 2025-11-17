/**
 * Mock Mode Configuration and Simulation
 * Provides mock simulation for wallet and betting operations when deployed to Vercel
 */

export type SimulationAction = 'connectWallet' | 'createBet' | 'joinBet' | 'claimRewards';

export interface SimulationEvent {
  action: SimulationAction;
  title: string;
  message: string;
  timestamp: number;
  points?: number;
}

// Simulation messages for different actions
export const SIMULATION_MESSAGES: Record<SimulationAction, string> = {
  connectWallet: 'Wallet connected successfully! Mock Linera wallet is now active.',
  createBet: 'Market created successfully! Your prediction market is now live.',
  joinBet: 'Bet placed successfully! Your bet has been recorded.',
  claimRewards: 'Rewards claimed successfully! Your winnings have been added to your balance.',
};

export const SIMULATION_TITLES: Record<SimulationAction, string> = {
  connectWallet: 'Wallet Connected',
  createBet: 'Market Created',
  joinBet: 'Bet Placed',
  claimRewards: 'Rewards Claimed',
};

// Points configuration
export const POINTS_CONFIG: Record<SimulationAction, number> = {
  connectWallet: 100,
  createBet: 500,
  joinBet: 200,
  claimRewards: 400,
};

// Check if we're in mock mode (Vercel deployment or no contract address)
export function isMockMode(): boolean {
  // Check if we're on Vercel
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return true;
  }
  
  // Check if contract address is not set
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (!contractAddress || contractAddress.trim() === '') {
    return true;
  }
  
  return false;
}

/**
 * Award points for an action
 */
export function awardPoints(action: SimulationAction): number {
  const points = POINTS_CONFIG[action];
  const pointsKey = 'zyrion_points';
  const historyKey = 'zyrion_points_history';
  
  try {
    // Get current points
    const currentPoints = parseInt(localStorage.getItem(pointsKey) || '0', 10);
    const newPoints = currentPoints + points;
    
    // Save new points
    localStorage.setItem(pointsKey, newPoints.toString());
    
    // Add to history
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.unshift({
      action,
      points,
      timestamp: Date.now(),
      title: SIMULATION_TITLES[action],
    });
    
    // Keep only last 10 entries
    if (history.length > 10) {
      history.pop();
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('pointsUpdated', { detail: { points: newPoints, action } }));
    
    return newPoints;
  } catch (error) {
    console.error('Failed to award points:', error);
    return 0;
  }
}

/**
 * Get current points
 */
export function getCurrentPoints(): number {
  try {
    return parseInt(localStorage.getItem('zyrion_points') || '0', 10);
  } catch {
    return 0;
  }
}

/**
 * Get points history
 */
export function getPointsHistory(): Array<{ action: SimulationAction; points: number; timestamp: number; title: string }> {
  try {
    return JSON.parse(localStorage.getItem('zyrion_points_history') || '[]');
  } catch {
    return [];
  }
}

/**
 * Emit simulation event
 */
export function emitSimulationEvent(action: SimulationAction): void {
  const event: SimulationEvent = {
    action,
    title: SIMULATION_TITLES[action],
    message: SIMULATION_MESSAGES[action],
    timestamp: Date.now(),
    points: POINTS_CONFIG[action],
  };
  
  // Dispatch custom event for SimulationFeed component
  window.dispatchEvent(new CustomEvent('simulationEvent', { detail: event }));
  
  // Award points
  awardPoints(action);
}

