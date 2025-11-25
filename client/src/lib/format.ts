// Utility functions for formatting blockchain data

// ============================================
// TBURN GAS UNIT SYSTEM: Ember (EMB)
// ============================================
// 1 TBURN = 1,000,000 Ember (EMB)
// Standard Gas Price: 10 EMB (0.00001 TBURN)
// ============================================

export const EMBER_PER_TBURN = 1_000_000; // 1 TBURN = 1,000,000 EMB
export const DEFAULT_GAS_PRICE_EMBER = 10; // Standard gas price: 10 EMB

// Convert TBURN to Ember
export function tburnToEmber(tburn: number | string): bigint {
  const value = typeof tburn === 'string' ? parseFloat(tburn) : tburn;
  return BigInt(Math.floor(value * EMBER_PER_TBURN));
}

// Convert Ember to TBURN
export function emberToTburn(ember: number | string | bigint): number {
  const value = typeof ember === 'bigint' ? Number(ember) : 
                typeof ember === 'string' ? parseFloat(ember) : ember;
  return value / EMBER_PER_TBURN;
}

// Format Ember amount with abbreviations (K, M, B)
export function formatEmber(ember: number | string | bigint): string {
  const value = typeof ember === 'bigint' ? Number(ember) : 
                typeof ember === 'string' ? parseFloat(ember) : ember;
  if (isNaN(value)) return '0 EMB';
  
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B EMB`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M EMB`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K EMB`;
  return `${value.toLocaleString()} EMB`;
}

// Format gas price in Ember (internal storage is in "wei-like" units)
// gasPrice is stored as wei (1e18 per TBURN), convert to EMB (1e6 per TBURN)
export function formatGasPriceEmber(gasPriceWei: string | number): string {
  try {
    const wei = BigInt(gasPriceWei.toString());
    // Convert wei to EMB: wei / 1e12 (since 1e18 wei = 1 TBURN = 1e6 EMB)
    const ember = Number(wei) / 1e12;
    if (ember >= 1000) {
      return `${(ember / 1000).toFixed(1)}K EMB`;
    }
    return `${ember.toFixed(ember < 1 ? 4 : 0)} EMB`;
  } catch {
    return '0 EMB';
  }
}

// Calculate transaction fee in Ember
export function calculateTransactionFeeEmber(
  gasPriceWei: string,
  gasUsed: number | string
): string {
  try {
    const price = BigInt(gasPriceWei);
    const used = BigInt(gasUsed.toString());
    const feeWei = price * used;
    // Convert to EMB
    const feeEmber = Number(feeWei) / 1e12;
    return formatEmber(feeEmber);
  } catch {
    return '0 EMB';
  }
}

// Format gas used/limit with EMB unit
export function formatGasEmber(gas: number | string): string {
  const g = typeof gas === 'string' ? parseInt(gas) : gas;
  if (isNaN(g)) return '0';
  return g.toLocaleString();
}

export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function formatHash(hash: string): string {
  return formatAddress(hash, 8, 6);
}

export function formatNumber(num: number | string | null | undefined): string {
  if (num == null) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString();
}

export function formatTokenAmount(amount: string | number, decimals = 18, symbol = 'TBURN'): string {
  try {
    const amountStr = amount.toString();
    
    // If it contains decimal point or scientific notation, parse as float
    if (amountStr.includes('.') || amountStr.includes('e') || amountStr.includes('E')) {
      const num = parseFloat(amountStr);
      return `${num.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;
    }
    
    // Otherwise, treat as wei (integer string)
    const value = BigInt(amountStr);
    const divisor = BigInt(10 ** decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    
    if (fraction === BigInt(0)) {
      return `${whole.toLocaleString()} ${symbol}`;
    }
    
    const fractionStr = fraction.toString().padStart(decimals, '0');
    const trimmedFraction = fractionStr.replace(/0+$/, '').slice(0, 4);
    
    return `${whole.toLocaleString()}.${trimmedFraction} ${symbol}`;
  } catch (error) {
    // Fallback for any parsing errors
    const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());
    if (isNaN(num)) return `0 ${symbol}`;
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;
  }
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function formatGas(gas: number | string): string {
  const g = typeof gas === 'string' ? parseInt(gas) : gas;
  return g.toLocaleString();
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatGasPrice(gasPriceWei: string | number): string {
  try {
    const wei = BigInt(gasPriceWei.toString());
    const gwei = Number(wei) / 1e9;
    return `${gwei.toFixed(2)} Gwei`;
  } catch {
    return '0 Gwei';
  }
}

export function calculateTransactionFee(
  gasPriceWei: string,
  gasUsed: number | string
): string {
  try {
    const price = BigInt(gasPriceWei);
    const used = BigInt(gasUsed.toString());
    const feeWei = price * used;
    return formatTokenAmount(feeWei.toString(), 18, 'TBURN');
  } catch {
    return '0 TBURN';
  }
}

export function calculateTransactionFeeValue(
  gasPriceWei: string,
  gasUsed: number | string
): bigint {
  try {
    const price = BigInt(gasPriceWei);
    const used = BigInt(gasUsed.toString());
    return price * used;
  } catch {
    return BigInt(0);
  }
}
