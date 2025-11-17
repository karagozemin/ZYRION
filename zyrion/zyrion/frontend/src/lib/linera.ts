/**
 * Linera Network Configuration
 * Configures connection to Linera Testnet/Mainnet
 */

// Linera Testnet Configuration
export const LINERA_TESTNET_CONFIG = {
  name: 'Linera Testnet',
  chainId: 'testnet',
  rpcUrl: 'https://testnet.linera.net',
  explorerUrl: 'https://testnet-explorer.linera.net',
  faucetUrl: 'https://faucet.linera.net',
};

// Linera MainNet Configuration (for future use)
export const LINERA_MAINNET_CONFIG = {
  name: 'Linera MainNet',
  chainId: 'mainnet',
  rpcUrl: 'https://mainnet.linera.net',
  explorerUrl: 'https://explorer.linera.net',
};

// Current network
export const CURRENT_NETWORK = LINERA_TESTNET_CONFIG;

/**
 * Get Linera Explorer URL for address
 */
export function getExplorerAddressUrl(address: string): string {
  return `${CURRENT_NETWORK.explorerUrl}/address/${address}`;
}

/**
 * Get Linera Explorer URL for operation
 */
export function getExplorerOperationUrl(operationId: string): string {
  return `${CURRENT_NETWORK.explorerUrl}/operation/${operationId}`;
}

/**
 * Format Linera amount (convert from smallest unit to LIN)
 * Linera uses 9 decimals like Massa
 */
export function formatLineraAmount(amount: bigint | string): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** 9); // Linera uses 9 decimals
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(9, '0').replace(/0+$/, '');
  return `${wholePart}.${fractionalStr}`;
}

/**
 * Parse Linera amount (convert from LIN to smallest unit)
 */
export function parseLineraAmount(amount: string): bigint {
  const parts = amount.split('.');
  const wholePart = BigInt(parts[0] || '0');
  const fractionalPart = parts[1] || '0';
  const paddedFractional = fractionalPart.padEnd(9, '0').slice(0, 9);
  
  const multiplier = BigInt(10 ** 9);
  return wholePart * multiplier + BigInt(paddedFractional);
}

/**
 * Short address format (linera_1234...5678)
 */
export function shortAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 10)}...${address.slice(-4)}`;
}

