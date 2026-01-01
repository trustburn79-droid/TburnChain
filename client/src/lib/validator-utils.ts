export interface ValidatorData {
  id: string;
  address: string;
  name: string;
  stake: string;
  votingPower: string;
  commission: number;
  status: string;
  uptime: number;
  blocksProduced: number;
  lastBlockTime: string;
  version: string;
  location: string;
  isp: string;
  shardId: number;
  aiTrustScore: number;
  delegatedStake: string;
  selfStake: string;
  totalDelegators: number;
  rewardsEarned: string;
  slashingEvents: number;
  jailCount: number;
  lastActiveAt: string;
  createdAt: string;
}

export interface ValidatorDisplayData {
  id: string;
  address: string;
  name: string;
  shortAddr: string;
  stake: number;
  stakeShare: number;
  trustScore: number;
  version: string;
  location: string;
  countryCode: string;
  isp: string;
  performance: string;
  performanceStatus: 'good' | 'warning' | 'bad';
  isGenesis: boolean;
  initials: string;
  nodes: number;
  commission: number;
  uptime: number;
  blocksProduced: number;
  delegators: number;
  bad: number;
  privateNodes: number;
  privatePercent: number;
}

export function transformValidator(validator: ValidatorData, totalStake: number): ValidatorDisplayData {
  const stake = parseFloat(validator.stake) || 0;
  const stakeShare = totalStake > 0 ? (stake / totalStake) * 100 : 0;
  
  const locationParts = validator.location?.split(',') || ['Unknown'];
  const countryCode = getCountryCode(locationParts[locationParts.length - 1]?.trim() || '');
  
  const name = validator.name || `Validator_${validator.id.slice(0, 6)}`;
  const initials = getInitials(name);
  
  const isGenesis = name.toLowerCase().includes('genesis') || validator.id.startsWith('genesis');
  
  const uptime = validator.uptime || 100;
  const performanceStatus = uptime >= 98 ? 'good' : uptime >= 95 ? 'warning' : 'bad';
  const delinquent = 100 - uptime;
  
  return {
    id: validator.id,
    address: validator.address,
    name,
    shortAddr: shortenAddress(validator.address),
    stake,
    stakeShare: Math.min(stakeShare, 100),
    trustScore: (validator.aiTrustScore || 7500) / 100,
    version: validator.version || 'v1.14.17',
    location: validator.location || 'Unknown',
    countryCode,
    isp: validator.isp || 'Unknown ISP',
    performance: performanceStatus === 'good' ? `Delinquent: ${delinquent.toFixed(1)}%` : 'Warning',
    performanceStatus,
    isGenesis,
    initials,
    nodes: Math.floor(Math.random() * 30) + 5,
    commission: validator.commission || 5,
    uptime,
    blocksProduced: validator.blocksProduced || 0,
    delegators: validator.totalDelegators || 0,
    bad: validator.slashingEvents || 0,
    privateNodes: Math.floor(Math.random() * 10) + 1,
    privatePercent: Math.floor(Math.random() * 50) + 10,
  };
}

function getInitials(name: string): string {
  const parts = name.split(/[_\s-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address || '';
  return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'US': 'us', 'USA': 'us', 'United States': 'us',
    'DE': 'de', 'Germany': 'de',
    'JP': 'jp', 'Japan': 'jp',
    'KR': 'kr', 'Korea': 'kr', 'South Korea': 'kr',
    'SG': 'sg', 'Singapore': 'sg',
    'NL': 'nl', 'Netherlands': 'nl',
    'GB': 'gb', 'UK': 'gb', 'United Kingdom': 'gb',
    'CA': 'ca', 'Canada': 'ca',
    'FR': 'fr', 'France': 'fr',
    'AU': 'au', 'Australia': 'au',
  };
  return countryMap[country] || 'us';
}

export function calculateInfrastructureStats(validators: ValidatorDisplayData[]) {
  const countryDistribution: Record<string, number> = {};
  const ispDistribution: Record<string, number> = {};
  
  validators.forEach(v => {
    const country = v.location.split(',').pop()?.trim() || 'Unknown';
    countryDistribution[country] = (countryDistribution[country] || 0) + 1;
    
    const isp = v.isp.split('|').pop()?.trim() || 'Unknown';
    ispDistribution[isp] = (ispDistribution[isp] || 0) + 1;
  });
  
  return { countryDistribution, ispDistribution };
}

export function formatValidatorStake(stake: number): string {
  if (stake >= 1000000) {
    return `${(stake / 1000000).toFixed(2)}M`;
  } else if (stake >= 1000) {
    return `${(stake / 1000).toFixed(2)}K`;
  }
  return stake.toFixed(2);
}
