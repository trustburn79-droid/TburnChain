// Common formatting functions with null/undefined safety

export const formatAddress = (address: string | undefined | null) => {
  if (!address) return "0x0000...0000";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatHash = (hash: string | undefined | null) => {
  if (!hash) return "0x0000...0000";
  if (hash.length < 14) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};

export const formatTransactionHash = (hash: string | undefined | null) => {
  if (!hash) return "0x0000...0000";
  if (hash.length < 14) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

export const formatNumber = (num: number | string | undefined | null) => {
  if (num === null || num === undefined) return "0";
  const value = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(value)) return "0";
  return new Intl.NumberFormat().format(value);
};

export const formatGas = (gas: number | undefined | null) => {
  if (!gas) return "0 M";
  return (gas / 1e6).toFixed(2) + " M";
};

export const formatSize = (bytes: number | undefined | null) => {
  if (!bytes) return "0 KB";
  return (bytes / 1024).toFixed(2) + " KB";
};

export const formatTimestamp = (timestamp: number | undefined | null) => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatPercentage = (value: number | undefined | null) => {
  if (value === null || value === undefined) return "0%";
  return `${value.toFixed(2)}%`;
};

export const formatAmount = (amount: string | number | undefined | null, decimals: number = 18) => {
  if (!amount) return "0";
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "0";
  const formatted = (value / Math.pow(10, decimals)).toFixed(4);
  return formatted.replace(/\.?0+$/, "");
};

export const formatShortNumber = (num: number | undefined | null): string => {
  if (!num) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
};

export const formatTokenAmount = (amount: string | number | bigint | undefined | null, decimals: number = 18, symbol: string = "TBURN"): string => {
  if (!amount && amount !== 0) return `0 ${symbol}`;
  
  let value: number;
  if (typeof amount === "bigint") {
    value = Number(amount) / Math.pow(10, decimals);
  } else if (typeof amount === "string") {
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return `0 ${symbol}`;
    value = parsed / Math.pow(10, decimals);
  } else {
    value = amount / Math.pow(10, decimals);
  }
  
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B ${symbol}`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M ${symbol}`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K ${symbol}`;
  if (value < 0.0001 && value > 0) return `<0.0001 ${symbol}`;
  return `${value.toFixed(4).replace(/\.?0+$/, "")} ${symbol}`;
};