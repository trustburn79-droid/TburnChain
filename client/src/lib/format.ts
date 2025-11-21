// Utility functions for formatting blockchain data

export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function formatHash(hash: string): string {
  return formatAddress(hash, 8, 6);
}

export function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
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
