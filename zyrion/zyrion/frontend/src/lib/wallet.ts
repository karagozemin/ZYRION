/**
 * Mock Linera Wallet Connection
 * Handles mock wallet connection for Vercel deployments
 * Provides simulated wallet functionality without requiring actual Linera wallet
 */

import { useState, useEffect } from 'react';
import { isMockMode, emitSimulationEvent } from './mockMode';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
}

const WALLET_STORAGE_KEY = 'linera_wallet_state';

interface StoredWalletState {
  address: string;
}

/**
 * Generate a mock Linera address
 */
function generateMockAddress(): string {
  const prefix = 'linera_';
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}${randomPart}`;
}

class WalletManager {
  private state: WalletState = {
    isConnected: false,
    address: null,
  };

  private listeners: Array<(state: WalletState) => void> = [];

  /**
   * Load wallet state from localStorage
   */
  private loadStoredState(): StoredWalletState | null {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as StoredWalletState;
      }
    } catch (error) {
      console.error('Failed to load wallet state from localStorage:', error);
    }
    return null;
  }

  /**
   * Save wallet state to localStorage
   */
  private saveStoredState(address: string): void {
    try {
      const state: StoredWalletState = { address };
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save wallet state to localStorage:', error);
    }
  }

  /**
   * Clear stored wallet state
   */
  private clearStoredState(): void {
    try {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear wallet state from localStorage:', error);
    }
  }

  /**
   * Connect to mock Linera wallet
   */
  async connect(): Promise<WalletState> {
    try {
      // Always use mock mode for now
      const mockAddress = generateMockAddress();
      
      this.state = {
        isConnected: true,
        address: mockAddress,
      };

      // Save to localStorage for persistence
      this.saveStoredState(mockAddress);

      // Emit simulation event
      emitSimulationEvent('connectWallet');

      console.log(`✅ Connected to mock Linera wallet with address: ${this.state.address}`);
      this.notifyListeners();
      return this.state;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.state = {
      isConnected: false,
      address: null,
    };
    this.clearStoredState();
    this.notifyListeners();
  }

  /**
   * Auto-reconnect to wallet if previously connected
   */
  async autoReconnect(): Promise<boolean> {
    const stored = this.loadStoredState();
    if (!stored || !stored.address) {
      return false;
    }

    try {
      // Restore from stored state
      this.state = {
        isConnected: true,
        address: stored.address,
      };
      this.notifyListeners();
      return true;
    } catch (error) {
      console.warn('Auto-reconnect failed:', error);
      // Clear stored state if reconnect fails
      this.clearStoredState();
      return false;
    }
  }

  /**
   * Get current wallet state
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Subscribe to wallet state changes
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get connected address
   */
  getAddress(): string | null {
    return this.state.address;
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

// Export singleton instance
export const walletManager = new WalletManager();

// React hook for wallet state
export function useWallet() {
  const [state, setState] = useState<WalletState>(walletManager.getState());
  const [isReconnecting, setIsReconnecting] = useState(true);

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setState);
    
    // Try to auto-reconnect on mount
    walletManager.autoReconnect().finally(() => {
      setIsReconnecting(false);
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    isReconnecting,
    connect: () => walletManager.connect(),
    disconnect: () => walletManager.disconnect(),
  };
}
