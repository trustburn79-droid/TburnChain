/**
 * TBURN User Data API Routes
 * Endpoints for user-specific rewards, staking positions, and activities
 * Provides detailed user-centric data for the /user page
 */

import { Router, Request, Response } from 'express';
import { getEnterpriseNode } from '../services/TBurnEnterpriseNode';

const router = Router();

// Cache for user data
const userDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

function getCachedData(key: string) {
  const cached = userDataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  userDataCache.set(key, { data, timestamp: Date.now() });
}

// Helper to generate consistent address-based seed
function addressSeed(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate a realistic 64-character hex hash from seed values
function generateTxHash(seed: number, index: number): string {
  const segments: string[] = [];
  let current = seed + index * 7919;
  
  for (let i = 0; i < 8; i++) {
    current = (current * 6271 + 2963) & 0xFFFFFFFF;
    segments.push(current.toString(16).padStart(8, '0').slice(-8));
  }
  
  return `0x${segments.join('')}`;
}

// Generate realistic mining rewards for a user
function generateMiningRewards(address: string) {
  const seed = addressSeed(address);
  const now = Date.now();
  const rewards = [];
  
  // Generate last 30 days of mining rewards
  for (let i = 0; i < 30; i++) {
    const dayOffset = i * 24 * 60 * 60 * 1000;
    const dailyReward = (((seed + i) % 100) + 10) / 100; // 0.10 - 1.09 TB per day
    
    rewards.push({
      id: `mr-${address.slice(-8)}-${i}`,
      walletAddress: address,
      amount: dailyReward.toFixed(4),
      source: i % 3 === 0 ? 'block_production' : i % 3 === 1 ? 'validation' : 'fee_share',
      epoch: 1000 + i,
      blockNumber: 35760000 + (i * 1000),
      txHash: generateTxHash(seed, i),
      claimed: i > 3,
      claimedAt: i > 3 ? new Date(now - dayOffset).toISOString() : null,
      createdAt: new Date(now - dayOffset).toISOString(),
    });
  }
  
  return rewards;
}

// Generate staking positions for a user
function generateStakingPositions(address: string) {
  const seed = addressSeed(address);
  const now = Date.now();
  
  const validators = [
    { id: 'val-01', name: 'TBURN Foundation' },
    { id: 'val-02', name: 'Genesis Validator' },
    { id: 'val-03', name: 'Enterprise Node Alpha' },
    { id: 'val-04', name: 'Community Stake Pool' },
  ];
  
  const positions = [];
  const numPositions = (seed % 3) + 1; // 1-3 positions
  
  for (let i = 0; i < numPositions; i++) {
    const validator = validators[(seed + i) % validators.length];
    const stakedAmount = ((seed + i * 1000) % 10000) + 1000; // 1000 - 11000 TB
    const apy = 8 + ((seed + i) % 10); // 8% - 17% APY
    const pendingRewards = (stakedAmount * apy / 100 / 365 * 7).toFixed(4); // ~7 days rewards
    const totalEarned = (stakedAmount * apy / 100 / 365 * 90).toFixed(4); // ~90 days rewards
    
    positions.push({
      id: `pos-${address.slice(-8)}-${i}`,
      walletAddress: address,
      validatorId: validator.id,
      validatorName: validator.name,
      stakedAmount: stakedAmount.toFixed(4),
      shares: (stakedAmount * 1.05).toFixed(4),
      currentValue: (stakedAmount * 1.08).toFixed(4),
      currentApy: `${apy}.${(seed % 10)}`,
      pendingRewards,
      totalRewardsEarned: totalEarned,
      status: i === 0 ? 'active' : i === 1 ? 'locked' : 'active',
      lockPeriodDays: i === 1 ? 30 : 0,
      unlockDate: i === 1 ? new Date(now + 15 * 24 * 60 * 60 * 1000).toISOString() : null,
      stakedAt: new Date(now - (90 + i * 30) * 24 * 60 * 60 * 1000).toISOString(),
      lastRewardAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - (90 + i * 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return positions;
}

// Generate staking rewards history
function generateStakingRewards(address: string) {
  const seed = addressSeed(address);
  const now = Date.now();
  const rewards = [];
  
  // Generate last 90 days of staking rewards (weekly)
  for (let i = 0; i < 13; i++) {
    const weekOffset = i * 7 * 24 * 60 * 60 * 1000;
    const weeklyReward = ((seed + i * 100) % 500 + 100) / 100; // 1.00 - 5.99 TB per week
    
    rewards.push({
      id: `sr-${address.slice(-8)}-${i}`,
      walletAddress: address,
      positionId: `pos-${address.slice(-8)}-0`,
      validatorId: 'val-01',
      amount: weeklyReward.toFixed(4),
      rewardType: i % 4 === 0 ? 'bonus' : i % 4 === 1 ? 'compound' : 'staking_interest',
      epoch: 900 + i,
      apy: `${12 + (i % 5)}.${seed % 10}`,
      txHash: generateTxHash(seed, i + 1000),
      claimed: i > 2,
      claimedAt: i > 2 ? new Date(now - weekOffset).toISOString() : null,
      autoCompounded: i % 3 === 1,
      createdAt: new Date(now - weekOffset).toISOString(),
    });
  }
  
  return rewards;
}

// Generate event participation data
function generateEventParticipation(address: string) {
  const seed = addressSeed(address);
  const now = Date.now();
  
  const events = [
    {
      id: 'evt-airdrop-001',
      eventName: 'TBURN Mainnet 런칭 에어드랍',
      eventType: 'airdrop',
      description: '메인넷 런칭 기념 초기 참여자 에어드랍',
      rewardAmount: '500.0000',
      status: 'claimed',
    },
    {
      id: 'evt-campaign-002',
      eventName: '스테이킹 캠페인 시즌 1',
      eventType: 'campaign',
      description: '첫 스테이킹 사용자 보너스 캠페인',
      rewardAmount: '150.0000',
      status: 'claimed',
    },
    {
      id: 'evt-governance-003',
      eventName: '거버넌스 투표 참여 보상',
      eventType: 'governance_reward',
      description: 'TIP-001 ~ TIP-005 투표 참여 보상',
      rewardAmount: '25.0000',
      status: 'claimed',
    },
    {
      id: 'evt-airdrop-004',
      eventName: '커뮤니티 성장 에어드랍',
      eventType: 'airdrop',
      description: '커뮤니티 기여 보상 2차',
      rewardAmount: '100.0000',
      status: 'eligible',
    },
    {
      id: 'evt-referral-005',
      eventName: '친구 초대 리워드',
      eventType: 'referral',
      description: '3명의 친구를 초대한 보상',
      rewardAmount: '75.0000',
      status: 'pending',
    },
    {
      id: 'evt-campaign-006',
      eventName: '연말 특별 이벤트',
      eventType: 'campaign',
      description: '2024년 연말 스페셜 보너스',
      rewardAmount: '200.0000',
      status: 'pending',
    },
  ];
  
  return events.map((event, i) => ({
    ...event,
    walletAddress: address,
    rewardToken: 'TB',
    rewardTxHash: event.status === 'claimed' ? generateTxHash(seed, i + 500) : null,
    eventStartDate: new Date(now - (180 - i * 30) * 24 * 60 * 60 * 1000).toISOString(),
    eventEndDate: event.status === 'pending' ? new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString() : new Date(now - (150 - i * 30) * 24 * 60 * 60 * 1000).toISOString(),
    claimDeadline: event.status === 'eligible' ? new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString() : null,
    awardedAt: event.status !== 'pending' ? new Date(now - (150 - i * 30) * 24 * 60 * 60 * 1000).toISOString() : null,
    claimedAt: event.status === 'claimed' ? new Date(now - (140 - i * 30) * 24 * 60 * 60 * 1000).toISOString() : null,
    createdAt: new Date(now - (180 - i * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

// Generate user activity log
function generateActivityLog(address: string) {
  const seed = addressSeed(address);
  const now = Date.now();
  const activities = [];
  
  const activityTypes = [
    { type: 'transfer_in', category: 'wallet', title: '입금', amount: '100.0000' },
    { type: 'transfer_out', category: 'wallet', title: '출금', amount: '50.0000' },
    { type: 'stake', category: 'staking', title: '스테이킹', amount: '1000.0000' },
    { type: 'claim_reward', category: 'rewards', title: '리워드 청구', amount: '12.5000' },
    { type: 'vote', category: 'governance', title: '거버넌스 투표', amount: null },
    { type: 'event_participation', category: 'events', title: '이벤트 참여', amount: '100.0000' },
  ];
  
  // Generate last 50 activities
  for (let i = 0; i < 50; i++) {
    const activity = activityTypes[(seed + i) % activityTypes.length];
    const hourOffset = i * 6 * 60 * 60 * 1000; // 6 hours apart
    
    activities.push({
      id: `act-${address.slice(-8)}-${i}`,
      walletAddress: address,
      activityType: activity.type,
      category: activity.category,
      title: activity.title,
      description: `${activity.title} 완료`,
      amount: activity.amount ? ((parseFloat(activity.amount) * (1 + (seed + i) % 10 / 10)).toFixed(4)) : null,
      token: 'TB',
      txHash: generateTxHash(seed, i + 100),
      createdAt: new Date(now - hourOffset).toISOString(),
    });
  }
  
  return activities;
}

// ============================================
// User Overview - Aggregated summary
// ============================================
router.get('/:address/overview', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    const cacheKey = `overview_${address}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }
    
    const seed = addressSeed(address);
    const positions = generateStakingPositions(address);
    const miningRewards = generateMiningRewards(address);
    const stakingRewards = generateStakingRewards(address);
    const events = generateEventParticipation(address);
    
    // Calculate aggregates
    const totalStaked = positions.reduce((sum, p) => sum + parseFloat(p.stakedAmount), 0);
    const pendingRewards = positions.reduce((sum, p) => sum + parseFloat(p.pendingRewards), 0);
    const totalMiningRewards = miningRewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalStakingRewards = stakingRewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const unclaimedMining = miningRewards.filter(r => !r.claimed).reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const unclaimedStaking = stakingRewards.filter(r => !r.claimed).reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const claimableEvents = events.filter(e => e.status === 'eligible').reduce((sum, e) => sum + parseFloat(e.rewardAmount || '0'), 0);
    const totalEventRewards = events.filter(e => e.status === 'claimed').reduce((sum, e) => sum + parseFloat(e.rewardAmount || '0'), 0);
    
    // Liquid balance (simulated)
    const liquidBalance = ((seed % 10000) + 500).toFixed(4);
    
    const overview = {
      address,
      liquidBalance,
      totalStaked: totalStaked.toFixed(4),
      totalPortfolioValue: (parseFloat(liquidBalance) + totalStaked).toFixed(4),
      pendingRewards: pendingRewards.toFixed(4),
      
      miningRewards: {
        total: totalMiningRewards.toFixed(4),
        unclaimed: unclaimedMining.toFixed(4),
        last24h: miningRewards.length > 0 ? miningRewards[0].amount : '0',
        last7d: miningRewards.slice(0, 7).reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      },
      
      stakingRewards: {
        total: totalStakingRewards.toFixed(4),
        unclaimed: unclaimedStaking.toFixed(4),
        averageApy: positions.length > 0 ? (positions.reduce((sum, p) => sum + parseFloat(p.currentApy), 0) / positions.length).toFixed(2) : '0',
        activePositions: positions.filter(p => p.status === 'active').length,
      },
      
      eventRewards: {
        total: totalEventRewards.toFixed(4),
        claimable: claimableEvents.toFixed(4),
        pendingEvents: events.filter(e => e.status === 'pending').length,
        eligibleEvents: events.filter(e => e.status === 'eligible').length,
      },
      
      totalUnclaimedRewards: (unclaimedMining + unclaimedStaking + pendingRewards + claimableEvents).toFixed(4),
    };
    
    setCachedData(cacheKey, overview);
    res.json({ success: true, data: overview });
  } catch (error: any) {
    console.error('[UserData] Overview error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user overview' });
  }
});

// ============================================
// Mining Rewards
// ============================================
router.get('/:address/mining-rewards', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { page = '1', limit = '20' } = req.query;
    
    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    const rewards = generateMiningRewards(address);
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginatedRewards = rewards.slice(start, start + limitNum);
    
    const summary = {
      total: rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      claimed: rewards.filter(r => r.claimed).reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      unclaimed: rewards.filter(r => !r.claimed).reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      bySource: {
        block_production: rewards.filter(r => r.source === 'block_production').reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
        validation: rewards.filter(r => r.source === 'validation').reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
        fee_share: rewards.filter(r => r.source === 'fee_share').reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      },
    };
    
    res.json({
      success: true,
      data: {
        rewards: paginatedRewards,
        summary,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: rewards.length,
          totalPages: Math.ceil(rewards.length / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('[UserData] Mining rewards error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch mining rewards' });
  }
});

// ============================================
// Staking Positions
// ============================================
router.get('/:address/staking-positions', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    const positions = generateStakingPositions(address);
    
    const summary = {
      totalStaked: positions.reduce((sum, p) => sum + parseFloat(p.stakedAmount), 0).toFixed(4),
      totalValue: positions.reduce((sum, p) => sum + parseFloat(p.currentValue), 0).toFixed(4),
      totalPendingRewards: positions.reduce((sum, p) => sum + parseFloat(p.pendingRewards), 0).toFixed(4),
      averageApy: positions.length > 0 ? (positions.reduce((sum, p) => sum + parseFloat(p.currentApy), 0) / positions.length).toFixed(2) : '0',
      activeCount: positions.filter(p => p.status === 'active').length,
      lockedCount: positions.filter(p => p.status === 'locked').length,
    };
    
    res.json({
      success: true,
      data: {
        positions,
        summary,
      },
    });
  } catch (error: any) {
    console.error('[UserData] Staking positions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staking positions' });
  }
});

// ============================================
// Staking Rewards History
// ============================================
router.get('/:address/staking-rewards', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { page = '1', limit = '20' } = req.query;
    
    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    const rewards = generateStakingRewards(address);
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginatedRewards = rewards.slice(start, start + limitNum);
    
    const summary = {
      total: rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      claimed: rewards.filter(r => r.claimed).reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      unclaimed: rewards.filter(r => !r.claimed).reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      autoCompounded: rewards.filter(r => r.autoCompounded).reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      byType: {
        staking_interest: rewards.filter(r => r.rewardType === 'staking_interest').reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
        compound: rewards.filter(r => r.rewardType === 'compound').reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
        bonus: rewards.filter(r => r.rewardType === 'bonus').reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4),
      },
    };
    
    res.json({
      success: true,
      data: {
        rewards: paginatedRewards,
        summary,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: rewards.length,
          totalPages: Math.ceil(rewards.length / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('[UserData] Staking rewards error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staking rewards' });
  }
});

// ============================================
// Event Participation
// ============================================
router.get('/:address/events', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    const events = generateEventParticipation(address);
    
    const summary = {
      total: events.length,
      claimed: events.filter(e => e.status === 'claimed').length,
      eligible: events.filter(e => e.status === 'eligible').length,
      pending: events.filter(e => e.status === 'pending').length,
      totalRewardsClaimed: events.filter(e => e.status === 'claimed').reduce((sum, e) => sum + parseFloat(e.rewardAmount || '0'), 0).toFixed(4),
      totalRewardsClaimable: events.filter(e => e.status === 'eligible').reduce((sum, e) => sum + parseFloat(e.rewardAmount || '0'), 0).toFixed(4),
      byType: {
        airdrop: events.filter(e => e.eventType === 'airdrop').length,
        campaign: events.filter(e => e.eventType === 'campaign').length,
        governance_reward: events.filter(e => e.eventType === 'governance_reward').length,
        referral: events.filter(e => e.eventType === 'referral').length,
      },
    };
    
    res.json({
      success: true,
      data: {
        events,
        summary,
      },
    });
  } catch (error: any) {
    console.error('[UserData] Events error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event participation' });
  }
});

// ============================================
// Activity Log
// ============================================
router.get('/:address/activities', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { page = '1', limit = '20', category } = req.query;
    
    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    let activities = generateActivityLog(address);
    
    // Filter by category if provided
    if (category && typeof category === 'string') {
      activities = activities.filter(a => a.category === category);
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const paginatedActivities = activities.slice(start, start + limitNum);
    
    res.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: activities.length,
          totalPages: Math.ceil(activities.length / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('[UserData] Activities error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activities' });
  }
});

// ============================================
// Create Delegation (POST)
// ============================================
router.post('/:address/delegations', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { validatorAddress, validatorName, amount } = req.body;
    
    // Validate address format (supports both 0x and tb1)
    if (!address || (!address.startsWith('0x') && !address.startsWith('tb1'))) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    // Validate validator address
    if (!validatorAddress || (!validatorAddress.startsWith('0x') && !validatorAddress.startsWith('tb1'))) {
      return res.status(400).json({ success: false, error: 'Invalid validator address' });
    }
    
    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({ success: false, error: 'Minimum delegation amount is 100 TBURN' });
    }
    
    if (parsedAmount > 1000000) {
      return res.status(400).json({ success: false, error: 'Maximum delegation amount is 1,000,000 TBURN' });
    }
    
    // Generate a delegation record
    const now = new Date();
    const delegationId = `del-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    // Simulate processing (in production, this would be blockchain transaction)
    const delegation = {
      id: delegationId,
      delegatorAddress: address,
      validatorAddress,
      validatorName: validatorName || 'Unknown Validator',
      amount: parsedAmount.toFixed(4),
      shares: (parsedAmount * 1.0).toFixed(4),
      status: 'active',
      txHash,
      createdAt: now.toISOString(),
      estimatedApy: '12.5%',
    };
    
    res.json({
      success: true,
      data: {
        delegation,
        message: `Successfully delegated ${parsedAmount.toFixed(4)} TBURN to ${validatorName || validatorAddress}`,
      },
    });
  } catch (error: any) {
    console.error('[UserData] Delegation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create delegation' });
  }
});

// ============================================
// Get User Delegations List
// ============================================
router.get('/:address/delegations', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    if (!address || (!address.startsWith('0x') && !address.startsWith('tb1'))) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    // Generate delegations based on staking positions
    const positions = generateStakingPositions(address);
    const delegations = positions.map(pos => ({
      id: pos.id,
      delegatorAddress: address,
      validatorAddress: `tb1${pos.validatorId.slice(4)}${address.slice(-20)}`,
      validatorName: pos.validatorName,
      amount: pos.stakedAmount,
      shares: pos.shares,
      pendingRewards: pos.pendingRewards,
      currentApy: pos.currentApy,
      status: pos.status,
      createdAt: pos.createdAt,
    }));
    
    const summary = {
      totalDelegations: delegations.length,
      totalDelegated: delegations.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0).toFixed(4),
      totalPendingRewards: delegations.reduce((sum, d) => sum + parseFloat(d.pendingRewards || '0'), 0).toFixed(4),
      avgApy: (delegations.reduce((sum, d) => sum + parseFloat(d.currentApy || '0'), 0) / (delegations.length || 1)).toFixed(2),
    };
    
    res.json({
      success: true,
      data: {
        delegations,
        summary,
      },
    });
  } catch (error: any) {
    console.error('[UserData] Delegations list error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch delegations' });
  }
});

export function registerUserDataRoutes(app: any) {
  app.use('/api/user', router);
  console.log('[UserData] Routes registered successfully');
}

export default router;
