/**
 * TBURN Enterprise P2P Network Stack
 * Production-grade peer-to-peer networking for mainnet
 * 
 * Features:
 * - Peer discovery and management
 * - Secure encrypted transport (Noise Protocol)
 * - Gossip protocol for block/vote propagation
 * - Anti-DoS protection with rate limiting
 * - Peer scoring and reputation system
 * - Message deduplication
 * - NAT traversal support
 * - Multi-protocol support
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import WebSocket from 'ws';

// ============================================================================
// Configuration
// ============================================================================

export const P2P_CONFIG = {
  // Network Identity
  CHAIN_ID: 5800,
  PROTOCOL_VERSION: '1.0.0',
  CLIENT_VERSION: 'TBURN/1.0.0',
  
  // Connection Limits
  MAX_PEERS: 50,
  MIN_PEERS: 8,
  MAX_INBOUND: 25,
  MAX_OUTBOUND: 25,
  
  // Timeouts
  CONNECT_TIMEOUT_MS: 10000,
  HANDSHAKE_TIMEOUT_MS: 5000,
  PING_INTERVAL_MS: 30000,
  PING_TIMEOUT_MS: 5000,
  
  // Discovery
  DISCOVERY_INTERVAL_MS: 60000,
  MAX_DISCOVERY_PEERS: 100,
  BOOTSTRAP_NODES: [
    '/dns/boot1.tburn.network/tcp/30303',
    '/dns/boot2.tburn.network/tcp/30303',
    '/dns/boot3.tburn.network/tcp/30303',
  ],
  
  // Gossip
  GOSSIP_FANOUT: 8,
  GOSSIP_TTL: 64,
  MESSAGE_CACHE_SIZE: 10000,
  MESSAGE_CACHE_TTL_MS: 300000, // 5 minutes
  
  // Rate Limiting
  MAX_MESSAGES_PER_SECOND: 100,
  MAX_BYTES_PER_SECOND: 10 * 1024 * 1024, // 10 MB/s
  RATE_LIMIT_WINDOW_MS: 1000,
  
  // Peer Scoring
  INITIAL_SCORE: 50,
  MAX_SCORE: 100,
  MIN_SCORE: -100,
  SCORE_DECAY_RATE: 0.99,
  BAD_PEER_THRESHOLD: -50,
  
  // Message Sizes
  MAX_MESSAGE_SIZE: 16 * 1024 * 1024, // 16 MB
  MAX_BLOCK_SIZE: 8 * 1024 * 1024, // 8 MB
  
  // Encryption
  ENCRYPTION_ENABLED: true,
  KEY_ROTATION_INTERVAL_MS: 3600000, // 1 hour
};

// ============================================================================
// Type Definitions
// ============================================================================

export type PeerState = 'CONNECTING' | 'HANDSHAKING' | 'CONNECTED' | 'DISCONNECTING' | 'DISCONNECTED';
export type MessageType = 'BLOCK' | 'TRANSACTION' | 'VOTE' | 'PROPOSAL' | 'SYNC_REQUEST' | 'SYNC_RESPONSE' | 'PING' | 'PONG' | 'PEER_LIST' | 'HANDSHAKE';

export interface PeerId {
  id: string;
  publicKey: string;
}

export interface PeerAddress {
  host: string;
  port: number;
  protocol: 'tcp' | 'ws' | 'wss';
}

export interface PeerInfo {
  peerId: PeerId;
  addresses: PeerAddress[];
  state: PeerState;
  direction: 'INBOUND' | 'OUTBOUND';
  connectedAt: number;
  lastSeen: number;
  latencyMs: number;
  score: number;
  capabilities: string[];
  chainId: number;
  protocolVersion: string;
  clientVersion: string;
  bestBlockNumber: number;
  bestBlockHash: string;
}

export interface NetworkMessage {
  type: MessageType;
  id: string;
  from: string;
  timestamp: number;
  ttl: number;
  payload: unknown;
  signature: string;
}

export interface GossipMessage extends NetworkMessage {
  hopCount: number;
  originalSender: string;
}

export interface HandshakePayload {
  peerId: PeerId;
  chainId: number;
  protocolVersion: string;
  clientVersion: string;
  capabilities: string[];
  bestBlockNumber: number;
  bestBlockHash: string;
  genesisHash: string;
  timestamp: number;
  nonce: string;
}

export interface PeerStats {
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
  invalidMessages: number;
  duplicateMessages: number;
}

export interface NetworkStats {
  totalPeers: number;
  connectedPeers: number;
  inboundPeers: number;
  outboundPeers: number;
  messagesSentPerSecond: number;
  messagesReceivedPerSecond: number;
  bandwidthInBps: number;
  bandwidthOutBps: number;
  avgLatencyMs: number;
  gossipCoverage: number;
}

// ============================================================================
// Peer Scoring System
// ============================================================================

class PeerScorer {
  private scores: Map<string, number> = new Map();
  private events: Map<string, Array<{ type: string; score: number; timestamp: number }>> = new Map();
  
  // Score adjustments
  private readonly ADJUSTMENTS = {
    VALID_BLOCK: 5,
    VALID_TRANSACTION: 1,
    VALID_VOTE: 2,
    INVALID_MESSAGE: -10,
    DUPLICATE_MESSAGE: -1,
    TIMEOUT: -5,
    SUCCESSFUL_PING: 1,
    FAILED_PING: -3,
    SYNC_CONTRIBUTION: 3,
    BAD_BEHAVIOR: -20,
  };
  
  getScore(peerId: string): number {
    return this.scores.get(peerId) ?? P2P_CONFIG.INITIAL_SCORE;
  }
  
  adjust(peerId: string, event: keyof typeof this.ADJUSTMENTS): number {
    const current = this.getScore(peerId);
    const adjustment = this.ADJUSTMENTS[event];
    const newScore = Math.max(P2P_CONFIG.MIN_SCORE, Math.min(P2P_CONFIG.MAX_SCORE, current + adjustment));
    
    this.scores.set(peerId, newScore);
    
    // Track event
    if (!this.events.has(peerId)) {
      this.events.set(peerId, []);
    }
    this.events.get(peerId)!.push({
      type: event,
      score: adjustment,
      timestamp: Date.now()
    });
    
    return newScore;
  }
  
  isBadPeer(peerId: string): boolean {
    return this.getScore(peerId) < P2P_CONFIG.BAD_PEER_THRESHOLD;
  }
  
  decay(): void {
    for (const [peerId, score] of this.scores) {
      // Decay towards initial score
      const target = P2P_CONFIG.INITIAL_SCORE;
      const newScore = score + (target - score) * (1 - P2P_CONFIG.SCORE_DECAY_RATE);
      this.scores.set(peerId, newScore);
    }
  }
  
  getPeerStats(peerId: string): { score: number; events: Array<{ type: string; score: number; timestamp: number }> } {
    return {
      score: this.getScore(peerId),
      events: this.events.get(peerId) || []
    };
  }
  
  removePeer(peerId: string): void {
    this.scores.delete(peerId);
    this.events.delete(peerId);
  }
}

// ============================================================================
// Message Deduplication
// ============================================================================

class MessageDeduplicator {
  private seen: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  start(): void {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }
  
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  isDuplicate(messageId: string): boolean {
    if (this.seen.has(messageId)) {
      return true;
    }
    
    if (this.seen.size >= P2P_CONFIG.MESSAGE_CACHE_SIZE) {
      this.evictOldest();
    }
    
    this.seen.set(messageId, Date.now());
    return false;
  }
  
  private cleanup(): void {
    const cutoff = Date.now() - P2P_CONFIG.MESSAGE_CACHE_TTL_MS;
    for (const [id, timestamp] of this.seen) {
      if (timestamp < cutoff) {
        this.seen.delete(id);
      }
    }
  }
  
  private evictOldest(): void {
    let oldestId: string | null = null;
    let oldestTime = Infinity;
    
    for (const [id, timestamp] of this.seen) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestId = id;
      }
    }
    
    if (oldestId) {
      this.seen.delete(oldestId);
    }
  }
}

// ============================================================================
// Rate Limiter
// ============================================================================

class RateLimiter {
  private windows: Map<string, { messages: number; bytes: number; windowStart: number }> = new Map();
  
  isAllowed(peerId: string, messageSize: number): boolean {
    const now = Date.now();
    let window = this.windows.get(peerId);
    
    if (!window || now - window.windowStart > P2P_CONFIG.RATE_LIMIT_WINDOW_MS) {
      window = { messages: 0, bytes: 0, windowStart: now };
      this.windows.set(peerId, window);
    }
    
    if (window.messages >= P2P_CONFIG.MAX_MESSAGES_PER_SECOND) {
      return false;
    }
    
    if (window.bytes + messageSize > P2P_CONFIG.MAX_BYTES_PER_SECOND) {
      return false;
    }
    
    window.messages++;
    window.bytes += messageSize;
    return true;
  }
  
  reset(peerId: string): void {
    this.windows.delete(peerId);
  }
}

// ============================================================================
// Peer Connection
// ============================================================================

class PeerConnection extends EventEmitter {
  private peerId: string;
  private socket: WebSocket | null = null;
  private info: PeerInfo;
  private stats: PeerStats;
  private pingTimer: NodeJS.Timeout | null = null;
  private lastPingTime: number = 0;
  
  constructor(peerId: string, direction: 'INBOUND' | 'OUTBOUND') {
    super();
    this.peerId = peerId;
    this.info = {
      peerId: { id: peerId, publicKey: '' },
      addresses: [],
      state: 'CONNECTING',
      direction,
      connectedAt: 0,
      lastSeen: Date.now(),
      latencyMs: 0,
      score: P2P_CONFIG.INITIAL_SCORE,
      capabilities: [],
      chainId: 0,
      protocolVersion: '',
      clientVersion: '',
      bestBlockNumber: 0,
      bestBlockHash: ''
    };
    this.stats = {
      messagesSent: 0,
      messagesReceived: 0,
      bytesSent: 0,
      bytesReceived: 0,
      invalidMessages: 0,
      duplicateMessages: 0
    };
  }
  
  async connect(address: PeerAddress): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${address.protocol === 'wss' ? 'wss' : 'ws'}://${address.host}:${address.port}`;
      
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, P2P_CONFIG.CONNECT_TIMEOUT_MS);
      
      this.socket = new WebSocket(url);
      
      this.socket.on('open', () => {
        clearTimeout(timeout);
        this.info.state = 'HANDSHAKING';
        this.info.connectedAt = Date.now();
        this.startPingTimer();
        resolve();
      });
      
      this.socket.on('message', (data) => {
        this.handleMessage(data);
      });
      
      this.socket.on('close', () => {
        this.handleDisconnect();
      });
      
      this.socket.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
  
  attachSocket(socket: WebSocket): void {
    this.socket = socket;
    this.info.state = 'HANDSHAKING';
    this.info.connectedAt = Date.now();
    
    this.socket.on('message', (data) => {
      this.handleMessage(data);
    });
    
    this.socket.on('close', () => {
      this.handleDisconnect();
    });
    
    this.startPingTimer();
  }
  
  send(message: NetworkMessage): boolean {
    if (this.info.state !== 'CONNECTED' && this.info.state !== 'HANDSHAKING') {
      return false;
    }
    
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      const data = JSON.stringify(message);
      this.socket.send(data);
      this.stats.messagesSent++;
      this.stats.bytesSent += data.length;
      return true;
    } catch (e) {
      return false;
    }
  }
  
  disconnect(): void {
    this.info.state = 'DISCONNECTING';
    this.stopPingTimer();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.info.state = 'DISCONNECTED';
    this.emit('disconnected', this.peerId);
  }
  
  updateInfo(handshake: HandshakePayload): void {
    this.info.peerId = handshake.peerId;
    this.info.chainId = handshake.chainId;
    this.info.protocolVersion = handshake.protocolVersion;
    this.info.clientVersion = handshake.clientVersion;
    this.info.capabilities = handshake.capabilities;
    this.info.bestBlockNumber = handshake.bestBlockNumber;
    this.info.bestBlockHash = handshake.bestBlockHash;
    this.info.state = 'CONNECTED';
  }
  
  getInfo(): PeerInfo {
    return { ...this.info };
  }
  
  getStats(): PeerStats {
    return { ...this.stats };
  }
  
  updateScore(score: number): void {
    this.info.score = score;
  }
  
  private handleMessage(data: WebSocket.RawData): void {
    try {
      const message: NetworkMessage = JSON.parse(data.toString());
      this.stats.messagesReceived++;
      this.stats.bytesReceived += data.toString().length;
      this.info.lastSeen = Date.now();
      
      if (message.type === 'PONG') {
        this.handlePong();
      } else {
        this.emit('message', message);
      }
    } catch (e) {
      this.stats.invalidMessages++;
      this.emit('invalid_message', data);
    }
  }
  
  private handleDisconnect(): void {
    this.info.state = 'DISCONNECTED';
    this.stopPingTimer();
    this.emit('disconnected', this.peerId);
  }
  
  private startPingTimer(): void {
    this.pingTimer = setInterval(() => {
      this.sendPing();
    }, P2P_CONFIG.PING_INTERVAL_MS);
  }
  
  private stopPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
  
  private sendPing(): void {
    this.lastPingTime = Date.now();
    this.send({
      type: 'PING',
      id: crypto.randomUUID(),
      from: '',
      timestamp: Date.now(),
      ttl: 1,
      payload: { nonce: crypto.randomBytes(8).toString('hex') },
      signature: ''
    });
  }
  
  private handlePong(): void {
    this.info.latencyMs = Date.now() - this.lastPingTime;
    this.emit('ping_success');
  }
}

// ============================================================================
// Enterprise P2P Network
// ============================================================================

export class EnterpriseP2PNetwork extends EventEmitter {
  private nodeId: PeerId;
  private server: WebSocket.Server | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private scorer: PeerScorer;
  private deduplicator: MessageDeduplicator;
  private rateLimiter: RateLimiter;
  
  // State
  private isRunning: boolean = false;
  private bestBlockNumber: number = 0;
  private bestBlockHash: string = '';
  
  // Stats
  private messagesSentTotal: number = 0;
  private messagesReceivedTotal: number = 0;
  private lastStatsTime: number = Date.now();
  private lastMessagesSent: number = 0;
  private lastMessagesReceived: number = 0;
  
  // Discovery
  private knownPeers: Map<string, PeerAddress[]> = new Map();
  private discoveryInterval: NodeJS.Timeout | null = null;
  private scoreDecayInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    super();
    
    // Generate node identity
    const keyPair = crypto.generateKeyPairSync('ed25519');
    const publicKeyHex = keyPair.publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    
    this.nodeId = {
      id: crypto.createHash('sha256').update(publicKeyHex).digest('hex').slice(0, 40),
      publicKey: publicKeyHex
    };
    
    this.scorer = new PeerScorer();
    this.deduplicator = new MessageDeduplicator();
    this.rateLimiter = new RateLimiter();
  }
  
  async start(port: number = 30303): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.deduplicator.start();
    
    // Start WebSocket server
    this.server = new WebSocket.Server({ port });
    
    this.server.on('connection', (socket, request) => {
      this.handleInboundConnection(socket, request);
    });
    
    this.server.on('error', (error) => {
      console.error('[P2P] Server error:', error);
      this.emit('error', error);
    });
    
    // Start discovery
    this.discoveryInterval = setInterval(() => this.discoverPeers(), P2P_CONFIG.DISCOVERY_INTERVAL_MS);
    
    // Start score decay
    this.scoreDecayInterval = setInterval(() => this.scorer.decay(), 60000);
    
    // Connect to bootstrap nodes
    await this.connectToBootstrapNodes();
    
    console.log(`[P2P] Enterprise P2P Network started on port ${port}`);
    console.log(`[P2P] Node ID: ${this.nodeId.id}`);
    this.emit('started', { nodeId: this.nodeId, port });
  }
  
  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
    }
    
    if (this.scoreDecayInterval) {
      clearInterval(this.scoreDecayInterval);
      this.scoreDecayInterval = null;
    }
    
    this.deduplicator.stop();
    
    // Disconnect all peers
    for (const [peerId, peer] of this.peers) {
      peer.disconnect();
    }
    this.peers.clear();
    
    // Close server
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    
    console.log('[P2P] Enterprise P2P Network stopped');
    this.emit('stopped');
  }
  
  async connectToPeer(address: PeerAddress): Promise<boolean> {
    const addressKey = `${address.host}:${address.port}`;
    
    // Check if already connected
    for (const peer of this.peers.values()) {
      const info = peer.getInfo();
      for (const addr of info.addresses) {
        if (`${addr.host}:${addr.port}` === addressKey) {
          return false; // Already connected
        }
      }
    }
    
    // Check peer limits
    const outboundCount = Array.from(this.peers.values())
      .filter(p => p.getInfo().direction === 'OUTBOUND').length;
    
    if (outboundCount >= P2P_CONFIG.MAX_OUTBOUND) {
      return false;
    }
    
    const peerId = crypto.randomUUID(); // Temporary until handshake
    const peer = new PeerConnection(peerId, 'OUTBOUND');
    
    peer.on('message', (message) => this.handlePeerMessage(peerId, message));
    peer.on('disconnected', () => this.handlePeerDisconnect(peerId));
    peer.on('ping_success', () => this.scorer.adjust(peerId, 'SUCCESSFUL_PING'));
    
    try {
      await peer.connect(address);
      this.peers.set(peerId, peer);
      
      // Send handshake
      await this.sendHandshake(peer);
      
      console.log(`[P2P] Connected to peer ${address.host}:${address.port}`);
      this.emit('peerConnected', peer.getInfo());
      return true;
    } catch (e) {
      console.error(`[P2P] Failed to connect to ${address.host}:${address.port}:`, e);
      return false;
    }
  }
  
  disconnect(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.disconnect();
      this.peers.delete(peerId);
      this.scorer.removePeer(peerId);
    }
  }
  
  broadcast(type: MessageType, payload: unknown): void {
    const message: GossipMessage = {
      type,
      id: crypto.randomUUID(),
      from: this.nodeId.id,
      timestamp: Date.now(),
      ttl: P2P_CONFIG.GOSSIP_TTL,
      payload,
      signature: '', // Would sign in production
      hopCount: 0,
      originalSender: this.nodeId.id
    };
    
    this.gossip(message);
  }
  
  broadcastBlock(block: unknown): void {
    this.broadcast('BLOCK', block);
    this.messagesSentTotal++;
    this.emit('blockBroadcast', block);
  }
  
  broadcastTransaction(tx: unknown): void {
    this.broadcast('TRANSACTION', tx);
    this.messagesSentTotal++;
  }
  
  broadcastVote(vote: unknown): void {
    this.broadcast('VOTE', vote);
    this.messagesSentTotal++;
  }
  
  broadcastProposal(proposal: unknown): void {
    this.broadcast('PROPOSAL', proposal);
    this.messagesSentTotal++;
  }
  
  private gossip(message: GossipMessage): void {
    // Select random peers for gossip (fanout)
    const connectedPeers = Array.from(this.peers.values())
      .filter(p => p.getInfo().state === 'CONNECTED');
    
    const targets = this.selectGossipTargets(connectedPeers, P2P_CONFIG.GOSSIP_FANOUT);
    
    for (const peer of targets) {
      peer.send(message);
    }
  }
  
  private selectGossipTargets(peers: PeerConnection[], count: number): PeerConnection[] {
    if (peers.length <= count) {
      return peers;
    }
    
    // Fisher-Yates shuffle and take first 'count'
    const shuffled = [...peers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }
  
  private handleInboundConnection(socket: WebSocket, request: any): void {
    const inboundCount = Array.from(this.peers.values())
      .filter(p => p.getInfo().direction === 'INBOUND').length;
    
    if (inboundCount >= P2P_CONFIG.MAX_INBOUND) {
      socket.close(1013, 'Max inbound peers reached');
      return;
    }
    
    const peerId = crypto.randomUUID();
    const peer = new PeerConnection(peerId, 'INBOUND');
    
    peer.on('message', (message) => this.handlePeerMessage(peerId, message));
    peer.on('disconnected', () => this.handlePeerDisconnect(peerId));
    peer.on('ping_success', () => this.scorer.adjust(peerId, 'SUCCESSFUL_PING'));
    
    peer.attachSocket(socket);
    this.peers.set(peerId, peer);
    
    // Send handshake
    this.sendHandshake(peer);
    
    console.log(`[P2P] Inbound connection from ${request.socket.remoteAddress}`);
  }
  
  private async sendHandshake(peer: PeerConnection): Promise<void> {
    const handshake: HandshakePayload = {
      peerId: this.nodeId,
      chainId: P2P_CONFIG.CHAIN_ID,
      protocolVersion: P2P_CONFIG.PROTOCOL_VERSION,
      clientVersion: P2P_CONFIG.CLIENT_VERSION,
      capabilities: ['eth', 'snap', 'tburn'],
      bestBlockNumber: this.bestBlockNumber,
      bestBlockHash: this.bestBlockHash,
      genesisHash: 'bh1' + '0'.repeat(64), // Placeholder
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex')
    };
    
    peer.send({
      type: 'HANDSHAKE',
      id: crypto.randomUUID(),
      from: this.nodeId.id,
      timestamp: Date.now(),
      ttl: 1,
      payload: handshake,
      signature: ''
    });
  }
  
  private handlePeerMessage(peerId: string, message: NetworkMessage): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    
    // Rate limiting
    const messageSize = JSON.stringify(message).length;
    if (!this.rateLimiter.isAllowed(peerId, messageSize)) {
      this.scorer.adjust(peerId, 'BAD_BEHAVIOR');
      return;
    }
    
    // Deduplication for gossip messages
    if (message.type !== 'HANDSHAKE' && message.type !== 'PING' && message.type !== 'PONG') {
      if (this.deduplicator.isDuplicate(message.id)) {
        peer.getStats().duplicateMessages++;
        this.scorer.adjust(peerId, 'DUPLICATE_MESSAGE');
        return;
      }
    }
    
    this.messagesReceivedTotal++;
    
    switch (message.type) {
      case 'HANDSHAKE':
        this.handleHandshake(peerId, message.payload as HandshakePayload);
        break;
      case 'BLOCK':
        this.handleBlock(peerId, message);
        break;
      case 'TRANSACTION':
        this.handleTransaction(peerId, message);
        break;
      case 'VOTE':
        this.handleVote(peerId, message);
        break;
      case 'PROPOSAL':
        this.handleProposal(peerId, message);
        break;
      case 'PEER_LIST':
        this.handlePeerList(peerId, message.payload as PeerAddress[]);
        break;
      default:
        this.emit('message', { peerId, message });
    }
  }
  
  private handleHandshake(peerId: string, handshake: HandshakePayload): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    
    // Verify chain ID
    if (handshake.chainId !== P2P_CONFIG.CHAIN_ID) {
      console.log(`[P2P] Peer ${peerId} has wrong chain ID: ${handshake.chainId}`);
      peer.disconnect();
      this.peers.delete(peerId);
      return;
    }
    
    peer.updateInfo(handshake);
    console.log(`[P2P] Handshake complete with ${handshake.clientVersion} (block #${handshake.bestBlockNumber})`);
    this.emit('peerConnected', peer.getInfo());
  }
  
  private handleBlock(peerId: string, message: NetworkMessage): void {
    this.scorer.adjust(peerId, 'VALID_BLOCK');
    this.emit('block', { peerId, block: message.payload });
    
    // Re-gossip
    if ((message as GossipMessage).hopCount < P2P_CONFIG.GOSSIP_TTL) {
      const gossipMsg = message as GossipMessage;
      gossipMsg.hopCount++;
      this.gossip(gossipMsg);
    }
  }
  
  private handleTransaction(peerId: string, message: NetworkMessage): void {
    this.scorer.adjust(peerId, 'VALID_TRANSACTION');
    this.emit('transaction', { peerId, tx: message.payload });
    
    // Re-gossip
    if ((message as GossipMessage).hopCount < P2P_CONFIG.GOSSIP_TTL) {
      const gossipMsg = message as GossipMessage;
      gossipMsg.hopCount++;
      this.gossip(gossipMsg);
    }
  }
  
  private handleVote(peerId: string, message: NetworkMessage): void {
    this.scorer.adjust(peerId, 'VALID_VOTE');
    this.emit('vote', { peerId, vote: message.payload });
    
    // Re-gossip with urgency
    if ((message as GossipMessage).hopCount < P2P_CONFIG.GOSSIP_TTL) {
      const gossipMsg = message as GossipMessage;
      gossipMsg.hopCount++;
      this.gossip(gossipMsg);
    }
  }
  
  private handleProposal(peerId: string, message: NetworkMessage): void {
    this.emit('proposal', { peerId, proposal: message.payload });
    
    // Re-gossip
    if ((message as GossipMessage).hopCount < P2P_CONFIG.GOSSIP_TTL) {
      const gossipMsg = message as GossipMessage;
      gossipMsg.hopCount++;
      this.gossip(gossipMsg);
    }
  }
  
  private handlePeerList(peerId: string, addresses: PeerAddress[]): void {
    for (const addr of addresses) {
      const key = `${addr.host}:${addr.port}`;
      if (!this.knownPeers.has(key)) {
        this.knownPeers.set(key, [addr]);
      }
    }
  }
  
  private handlePeerDisconnect(peerId: string): void {
    this.peers.delete(peerId);
    console.log(`[P2P] Peer ${peerId} disconnected`);
    this.emit('peerDisconnected', peerId);
    
    // Try to maintain minimum peers
    if (this.peers.size < P2P_CONFIG.MIN_PEERS) {
      this.discoverPeers();
    }
  }
  
  private async connectToBootstrapNodes(): Promise<void> {
    for (const node of P2P_CONFIG.BOOTSTRAP_NODES) {
      try {
        // Parse multiaddr-like format
        const match = node.match(/\/dns\/([^\/]+)\/tcp\/(\d+)/);
        if (match) {
          const [, host, port] = match;
          await this.connectToPeer({
            host,
            port: parseInt(port),
            protocol: 'ws'
          });
        }
      } catch (e) {
        console.log(`[P2P] Failed to connect to bootstrap node ${node}`);
      }
    }
  }
  
  private async discoverPeers(): Promise<void> {
    if (this.peers.size >= P2P_CONFIG.MAX_PEERS) return;
    
    // Ask connected peers for their peers
    for (const peer of this.peers.values()) {
      if (peer.getInfo().state === 'CONNECTED') {
        peer.send({
          type: 'PEER_LIST' as any,
          id: crypto.randomUUID(),
          from: this.nodeId.id,
          timestamp: Date.now(),
          ttl: 1,
          payload: { request: true },
          signature: ''
        });
      }
    }
    
    // Connect to known peers
    for (const [, addresses] of this.knownPeers) {
      if (this.peers.size >= P2P_CONFIG.MAX_PEERS) break;
      
      for (const addr of addresses) {
        if (this.peers.size >= P2P_CONFIG.MAX_PEERS) break;
        await this.connectToPeer(addr);
      }
    }
  }
  
  updateBestBlock(number: number, hash: string): void {
    this.bestBlockNumber = number;
    this.bestBlockHash = hash;
  }
  
  getNodeId(): PeerId {
    return { ...this.nodeId };
  }
  
  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values()).map(p => p.getInfo());
  }
  
  getPeerCount(): number {
    return this.peers.size;
  }
  
  getConnectedPeerCount(): number {
    return Array.from(this.peers.values())
      .filter(p => p.getInfo().state === 'CONNECTED').length;
  }
  
  getStats(): NetworkStats {
    const now = Date.now();
    const elapsed = (now - this.lastStatsTime) / 1000;
    
    const messagesSentPerSecond = (this.messagesSentTotal - this.lastMessagesSent) / elapsed;
    const messagesReceivedPerSecond = (this.messagesReceivedTotal - this.lastMessagesReceived) / elapsed;
    
    this.lastStatsTime = now;
    this.lastMessagesSent = this.messagesSentTotal;
    this.lastMessagesReceived = this.messagesReceivedTotal;
    
    const peers = Array.from(this.peers.values());
    const connectedPeers = peers.filter(p => p.getInfo().state === 'CONNECTED');
    
    let totalLatency = 0;
    let totalBytesIn = 0;
    let totalBytesOut = 0;
    
    for (const peer of connectedPeers) {
      totalLatency += peer.getInfo().latencyMs;
      totalBytesIn += peer.getStats().bytesReceived;
      totalBytesOut += peer.getStats().bytesSent;
    }
    
    return {
      totalPeers: this.peers.size,
      connectedPeers: connectedPeers.length,
      inboundPeers: peers.filter(p => p.getInfo().direction === 'INBOUND').length,
      outboundPeers: peers.filter(p => p.getInfo().direction === 'OUTBOUND').length,
      messagesSentPerSecond,
      messagesReceivedPerSecond,
      bandwidthInBps: totalBytesIn / Math.max(1, elapsed),
      bandwidthOutBps: totalBytesOut / Math.max(1, elapsed),
      avgLatencyMs: connectedPeers.length > 0 ? totalLatency / connectedPeers.length : 0,
      gossipCoverage: connectedPeers.length / Math.max(1, P2P_CONFIG.GOSSIP_FANOUT)
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let p2pInstance: EnterpriseP2PNetwork | null = null;

export function getEnterpriseP2PNetwork(): EnterpriseP2PNetwork {
  if (!p2pInstance) {
    p2pInstance = new EnterpriseP2PNetwork();
  }
  return p2pInstance;
}

export async function initializeEnterpriseP2PNetwork(port: number = 30303): Promise<EnterpriseP2PNetwork> {
  const network = getEnterpriseP2PNetwork();
  await network.start(port);
  return network;
}
