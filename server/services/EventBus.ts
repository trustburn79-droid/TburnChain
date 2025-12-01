/**
 * TBURN Enterprise Event Bus
 * Unified real-time synchronization across all modules
 */

import type { WebSocket } from 'ws';

export type EventChannel = 
  | 'network.blocks'
  | 'network.transactions'
  | 'network.stats'
  | 'staking.state'
  | 'staking.rewards'
  | 'staking.positions'
  | 'dex.swaps'
  | 'dex.liquidity'
  | 'dex.prices'
  | 'lending.markets'
  | 'lending.positions'
  | 'lending.liquidations'
  | 'nft.listings'
  | 'nft.sales'
  | 'bridge.transfers'
  | 'burn.events'
  | 'validators.state'
  | 'validators.rewards'
  | 'wallets.balance'
  | 'wallets.activity'
  | 'governance.proposals'
  | 'governance.votes'
  | 'ai.decisions'
  | 'sharding.state'
  | 'cross-shard.messages'
  | 'token-system.mint'
  | 'token-system.transfer'
  | 'token-system.burn'
  | 'ai-governance.proposal'
  | 'ai-governance.vote'
  | 'admin.audit'
  | 'admin.health'
  | 'operator.node-status'
  | 'operator.task';

export interface EventPayload {
  channel: EventChannel;
  type: string;
  data: any;
  timestamp: number;
  correlationId?: string;
  sourceModule?: string;
  affectedModules?: string[];
}

export interface EventSubscription {
  channels: EventChannel[];
  callback: (event: EventPayload) => void;
}

export interface ChannelDependency {
  source: EventChannel;
  triggers: EventChannel[];
  transform?: (data: any) => any;
}

const CHANNEL_DEPENDENCIES: ChannelDependency[] = [
  {
    source: 'network.blocks',
    triggers: ['network.stats', 'wallets.balance', 'validators.state'],
    transform: (block) => ({ blockHeight: block.blockNumber, timestamp: block.timestamp })
  },
  {
    source: 'network.transactions',
    triggers: ['wallets.activity', 'wallets.balance', 'network.stats'],
    transform: (tx) => ({ txHash: tx.hash, from: tx.from, to: tx.to, value: tx.value })
  },
  {
    source: 'staking.state',
    triggers: ['validators.state', 'wallets.balance', 'network.stats'],
    transform: (staking) => ({ totalStaked: staking.totalStaked, apy: staking.apy })
  },
  {
    source: 'staking.rewards',
    triggers: ['wallets.balance', 'wallets.activity'],
    transform: (reward) => ({ address: reward.address, amount: reward.amount })
  },
  {
    source: 'dex.swaps',
    triggers: ['dex.prices', 'dex.liquidity', 'wallets.balance', 'wallets.activity'],
    transform: (swap) => ({ poolId: swap.poolId, amountIn: swap.amountIn, amountOut: swap.amountOut })
  },
  {
    source: 'dex.liquidity',
    triggers: ['dex.prices', 'wallets.balance', 'network.stats'],
    transform: (liquidity) => ({ poolId: liquidity.poolId, tvl: liquidity.tvl })
  },
  {
    source: 'lending.markets',
    triggers: ['lending.positions', 'network.stats'],
    transform: (market) => ({ marketId: market.id, totalSupply: market.totalSupply })
  },
  {
    source: 'lending.positions',
    triggers: ['wallets.balance', 'lending.liquidations'],
    transform: (position) => ({ address: position.address, healthFactor: position.healthFactor })
  },
  {
    source: 'nft.sales',
    triggers: ['nft.listings', 'wallets.balance', 'wallets.activity'],
    transform: (sale) => ({ tokenId: sale.tokenId, price: sale.price, seller: sale.seller })
  },
  {
    source: 'bridge.transfers',
    triggers: ['wallets.balance', 'network.stats'],
    transform: (transfer) => ({ from: transfer.from, amount: transfer.amount, chain: transfer.targetChain })
  },
  {
    source: 'burn.events',
    triggers: ['network.stats', 'wallets.balance'],
    transform: (burn) => ({ amount: burn.amount, totalBurned: burn.totalBurned })
  },
  {
    source: 'validators.state',
    triggers: ['staking.state', 'network.stats'],
    transform: (validator) => ({ address: validator.address, stake: validator.stake, status: validator.status })
  },
  {
    source: 'ai.decisions',
    triggers: ['sharding.state', 'validators.state'],
    transform: (decision) => ({ decisionId: decision.id, impact: decision.impact })
  },
  // Token System dependencies
  {
    source: 'token-system.mint',
    triggers: ['network.stats', 'wallets.balance', 'wallets.activity'],
    transform: (mint) => ({ tokenId: mint.tokenId, amount: mint.amount, to: mint.to })
  },
  {
    source: 'token-system.transfer',
    triggers: ['wallets.balance', 'wallets.activity', 'network.stats'],
    transform: (transfer) => ({ tokenId: transfer.tokenId, from: transfer.from, to: transfer.to, amount: transfer.amount })
  },
  {
    source: 'token-system.burn',
    triggers: ['burn.events', 'network.stats', 'wallets.balance'],
    transform: (burn) => ({ tokenId: burn.tokenId, amount: burn.amount, totalBurned: burn.totalBurned })
  },
  // AI Governance dependencies
  {
    source: 'ai-governance.proposal',
    triggers: ['governance.proposals', 'network.stats'],
    transform: (proposal) => ({ proposalId: proposal.id, status: proposal.status, aiScore: proposal.aiAnalysisScore })
  },
  {
    source: 'ai-governance.vote',
    triggers: ['governance.votes', 'ai-governance.proposal', 'wallets.activity'],
    transform: (vote) => ({ proposalId: vote.proposalId, voter: vote.voter, weight: vote.weight })
  },
  // Admin dependencies
  {
    source: 'admin.audit',
    triggers: ['network.stats', 'admin.health'],
    transform: (audit) => ({ action: audit.action, admin: audit.adminId, timestamp: audit.timestamp })
  },
  {
    source: 'admin.health',
    triggers: ['network.stats', 'validators.state'],
    transform: (health) => ({ status: health.status, healthScore: health.healthScore })
  },
  // Operator dependencies
  {
    source: 'operator.node-status',
    triggers: ['validators.state', 'network.stats', 'admin.health'],
    transform: (node) => ({ nodeId: node.nodeId, status: node.status, uptime: node.uptime })
  },
  {
    source: 'operator.task',
    triggers: ['admin.audit', 'operator.node-status'],
    transform: (task) => ({ taskId: task.taskId, operatorId: task.operatorId, status: task.status })
  }
];

class EventBusService {
  private subscribers: Map<EventChannel, Set<(event: EventPayload) => void>> = new Map();
  private wsClients: Map<string, { socket: WebSocket; channels: Set<EventChannel> }> = new Map();
  private eventHistory: EventPayload[] = [];
  private maxHistorySize = 1000;
  private broadcastIntervals: Map<EventChannel, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeChannels();
  }

  private initializeChannels(): void {
    const channels: EventChannel[] = [
      // Core Network
      'network.blocks', 'network.transactions', 'network.stats',
      // Staking Module
      'staking.state', 'staking.rewards', 'staking.positions',
      // DEX Module
      'dex.swaps', 'dex.liquidity', 'dex.prices',
      // Lending Module
      'lending.markets', 'lending.positions', 'lending.liquidations',
      // NFT Module
      'nft.listings', 'nft.sales',
      // Bridge Module
      'bridge.transfers', 'burn.events',
      // Validators
      'validators.state', 'validators.rewards',
      // Wallets
      'wallets.balance', 'wallets.activity',
      // Governance
      'governance.proposals', 'governance.votes',
      // AI & Sharding
      'ai.decisions', 'sharding.state', 'cross-shard.messages',
      // Token System (TBC-20, TBC-721, TBC-1155)
      'token-system.mint', 'token-system.transfer', 'token-system.burn',
      // AI Governance
      'ai-governance.proposal', 'ai-governance.vote',
      // Admin Panel
      'admin.audit', 'admin.health',
      // Operator Portal
      'operator.node-status', 'operator.task'
    ];

    channels.forEach(channel => {
      this.subscribers.set(channel, new Set());
    });

    console.log(`[EventBus] Initialized ${channels.length} event channels for cross-module synchronization`);
  }

  /**
   * Publish event to a channel with automatic cascade to dependent channels
   */
  publish(event: EventPayload): void {
    const timestamp = Date.now();
    event.timestamp = timestamp;

    this.addToHistory(event);
    this.notifySubscribers(event);
    this.broadcastToWebSockets(event);
    this.cascadeToDependentChannels(event);
  }

  /**
   * Subscribe to events on specific channels
   */
  subscribe(channels: EventChannel[], callback: (event: EventPayload) => void): () => void {
    channels.forEach(channel => {
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, new Set());
      }
      this.subscribers.get(channel)!.add(callback);
    });

    return () => {
      channels.forEach(channel => {
        this.subscribers.get(channel)?.delete(callback);
      });
    };
  }

  /**
   * Register WebSocket client for real-time updates
   */
  registerWebSocketClient(clientId: string, socket: WebSocket, channels: EventChannel[]): void {
    this.wsClients.set(clientId, {
      socket,
      channels: new Set(channels)
    });

    socket.on('close', () => {
      this.wsClients.delete(clientId);
    });
  }

  /**
   * Update WebSocket client channel subscriptions
   */
  updateClientChannels(clientId: string, channels: EventChannel[]): void {
    const client = this.wsClients.get(clientId);
    if (client) {
      client.channels = new Set(channels);
    }
  }

  /**
   * Start periodic broadcasting for a channel
   */
  startPeriodicBroadcast(channel: EventChannel, intervalMs: number, dataGenerator: () => any): void {
    if (this.broadcastIntervals.has(channel)) {
      clearInterval(this.broadcastIntervals.get(channel)!);
    }

    const interval = setInterval(() => {
      const data = dataGenerator();
      if (data) {
        this.publish({
          channel,
          type: 'periodic_update',
          data,
          timestamp: Date.now()
        });
      }
    }, intervalMs);

    this.broadcastIntervals.set(channel, interval);
  }

  /**
   * Stop periodic broadcasting for a channel
   */
  stopPeriodicBroadcast(channel: EventChannel): void {
    const interval = this.broadcastIntervals.get(channel);
    if (interval) {
      clearInterval(interval);
      this.broadcastIntervals.delete(channel);
    }
  }

  /**
   * Get recent event history for a channel
   */
  getEventHistory(channel: EventChannel, limit: number = 50): EventPayload[] {
    return this.eventHistory
      .filter(e => e.channel === channel)
      .slice(-limit);
  }

  /**
   * Get all recent events across all channels
   */
  getAllRecentEvents(limit: number = 100): EventPayload[] {
    return this.eventHistory.slice(-limit);
  }

  private notifySubscribers(event: EventPayload): void {
    const channelSubscribers = this.subscribers.get(event.channel);
    channelSubscribers?.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event subscriber for ${event.channel}:`, error);
      }
    });
  }

  private broadcastToWebSockets(event: EventPayload): void {
    this.wsClients.forEach((client, clientId) => {
      if (client.channels.has(event.channel) && client.socket.readyState === 1) {
        try {
          client.socket.send(JSON.stringify({
            type: 'event',
            channel: event.channel,
            payload: event
          }));
        } catch (error) {
          console.error(`Error broadcasting to client ${clientId}:`, error);
        }
      }
    });
  }

  private cascadeToDependentChannels(event: EventPayload): void {
    const dependencies = CHANNEL_DEPENDENCIES.filter(d => d.source === event.channel);
    
    dependencies.forEach(dep => {
      const transformedData = dep.transform ? dep.transform(event.data) : event.data;
      
      dep.triggers.forEach(triggerChannel => {
        const cascadeEvent: EventPayload = {
          channel: triggerChannel,
          type: `cascade_from_${event.channel}`,
          data: transformedData,
          timestamp: Date.now(),
          correlationId: event.correlationId,
          sourceModule: event.sourceModule,
          affectedModules: [triggerChannel.split('.')[0]]
        };

        this.notifySubscribers(cascadeEvent);
        this.broadcastToWebSockets(cascadeEvent);
      });
    });
  }

  private addToHistory(event: EventPayload): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get channel statistics
   */
  getChannelStats(): Record<EventChannel, { subscribers: number; recentEvents: number }> {
    const stats: any = {};
    
    this.subscribers.forEach((subs, channel) => {
      stats[channel] = {
        subscribers: subs.size,
        recentEvents: this.eventHistory.filter(e => e.channel === channel).length
      };
    });

    return stats;
  }

  /**
   * Get WebSocket client count
   */
  getWebSocketClientCount(): number {
    return this.wsClients.size;
  }
}

export const eventBus = new EventBusService();
export default eventBus;
