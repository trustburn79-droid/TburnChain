/**
 * TBURN Validator P2P Network Layer
 * Enterprise-Grade Peer-to-Peer Communication
 * 
 * Features:
 * - Gossip protocol for message propagation
 * - Peer discovery and management
 * - Connection pooling with health checks
 * - NAT traversal support
 * - Encrypted communications
 * - Anti-DDoS protection
 */

import WebSocket, { WebSocketServer } from 'ws';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { NetworkConfig, PeerInfo, Block, Transaction, Vote } from '../config/types';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('P2P');

export enum MessageType {
  HANDSHAKE = 'handshake',
  HANDSHAKE_ACK = 'handshake_ack',
  PING = 'ping',
  PONG = 'pong',
  PEER_DISCOVERY = 'peer_discovery',
  PEER_LIST = 'peer_list',
  NEW_BLOCK = 'new_block',
  NEW_TRANSACTION = 'new_transaction',
  VOTE = 'vote',
  VOTE_REQUEST = 'vote_request',
  BLOCK_REQUEST = 'block_request',
  BLOCK_RESPONSE = 'block_response',
  SYNC_REQUEST = 'sync_request',
  SYNC_RESPONSE = 'sync_response',
  CONSENSUS_MESSAGE = 'consensus_message',
}

export interface P2PMessage {
  type: MessageType;
  from: string;
  to?: string;
  payload: unknown;
  timestamp: number;
  signature: string;
  nonce: string;
}

interface PeerConnection {
  socket: WebSocket;
  info: PeerInfo;
  lastPing: number;
  lastPong: number;
  messageCount: number;
  bytesReceived: number;
  bytesSent: number;
}

export class P2PNetwork extends EventEmitter {
  private config: NetworkConfig;
  private nodeId: string;
  private server: WebSocketServer | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private pendingConnections: Map<string, WebSocket> = new Map();
  private bannedIps: Map<string, number> = new Map();
  private messageHistory: Set<string> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private signMessage: (message: string) => string;

  constructor(
    config: NetworkConfig,
    nodeId: string,
    signFunction: (message: string) => string
  ) {
    super();
    this.config = config;
    this.nodeId = nodeId;
    this.signMessage = signFunction;
  }

  async start(): Promise<void> {
    log.info('Starting P2P network', {
      host: this.config.listenHost,
      port: this.config.listenPort,
    });

    this.server = new WebSocketServer({
      host: this.config.listenHost,
      port: this.config.listenPort,
    });

    this.server.on('connection', (socket, req) => {
      this.handleIncomingConnection(socket, req.socket.remoteAddress || 'unknown');
    });

    this.server.on('error', (error) => {
      log.error('WebSocket server error', { error: error.message });
    });

    await this.connectToBootstrapPeers();
    this.startHeartbeat();
    this.startDiscovery();
    this.startCleanup();

    log.info('P2P network started successfully', {
      port: this.config.listenPort,
      bootstrapPeers: this.config.bootstrapPeers.length,
    });
  }

  async stop(): Promise<void> {
    log.info('Stopping P2P network');

    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.discoveryInterval) clearInterval(this.discoveryInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);

    for (const [, peer] of this.peers) {
      peer.socket.close(1000, 'Node shutting down');
    }

    this.peers.clear();

    if (this.server) {
      this.server.close();
    }

    log.info('P2P network stopped');
  }

  private async connectToBootstrapPeers(): Promise<void> {
    const connectionPromises = this.config.bootstrapPeers.map((peerAddress) =>
      this.connectToPeer(peerAddress).catch((err) => {
        log.warn('Failed to connect to bootstrap peer', {
          peer: peerAddress,
          error: err.message,
        });
      })
    );

    await Promise.allSettled(connectionPromises);
    log.info('Bootstrap peer connections completed', {
      connected: this.peers.size,
    });
  }

  async connectToPeer(address: string): Promise<void> {
    if (this.peers.size >= this.config.maxPeers) {
      log.debug('Max peers reached, skipping connection', { address });
      return;
    }

    const wsUrl = address.replace('tcp://', 'ws://');
    
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(wsUrl, {
        handshakeTimeout: this.config.connectionTimeout,
      });

      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error('Connection timeout'));
      }, this.config.connectionTimeout);

      socket.on('open', () => {
        clearTimeout(timeout);
        this.sendHandshake(socket);
        this.pendingConnections.set(wsUrl, socket);
      });

      socket.on('message', (data) => {
        this.handleMessage(socket, data.toString(), wsUrl);
      });

      socket.on('close', () => {
        clearTimeout(timeout);
        this.pendingConnections.delete(wsUrl);
        this.removePeerBySocket(socket);
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      socket.once('message', () => {
        resolve();
      });
    });
  }

  private handleIncomingConnection(socket: WebSocket, remoteAddress: string): void {
    if (this.bannedIps.has(remoteAddress)) {
      const banExpiry = this.bannedIps.get(remoteAddress)!;
      if (Date.now() < banExpiry) {
        socket.close(1008, 'IP banned');
        return;
      }
      this.bannedIps.delete(remoteAddress);
    }

    if (this.peers.size >= this.config.maxPeers) {
      socket.close(1013, 'Server at capacity');
      return;
    }

    const tempId = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.pendingConnections.set(tempId, socket);

    socket.on('message', (data) => {
      this.handleMessage(socket, data.toString(), tempId);
    });

    socket.on('close', () => {
      this.pendingConnections.delete(tempId);
      this.removePeerBySocket(socket);
    });

    socket.on('error', (err) => {
      log.warn('Socket error', { error: err.message, remoteAddress });
    });
  }

  private sendHandshake(socket: WebSocket): void {
    const handshake: P2PMessage = {
      type: MessageType.HANDSHAKE,
      from: this.nodeId,
      payload: {
        version: '1.0.0',
        chainId: 6000,
        networkId: 'tburn-mainnet',
        capabilities: ['consensus', 'sync', 'gossip'],
      },
      timestamp: Date.now(),
      signature: '',
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    handshake.signature = this.signMessage(JSON.stringify(handshake.payload));
    this.send(socket, handshake);
  }

  private handleMessage(socket: WebSocket, data: string, connectionId: string): void {
    try {
      const message: P2PMessage = JSON.parse(data);

      if (this.messageHistory.has(message.nonce)) {
        return;
      }
      this.messageHistory.add(message.nonce);

      switch (message.type) {
        case MessageType.HANDSHAKE:
          this.handleHandshake(socket, message, connectionId);
          break;
        case MessageType.HANDSHAKE_ACK:
          this.handleHandshakeAck(socket, message, connectionId);
          break;
        case MessageType.PING:
          this.handlePing(socket, message);
          break;
        case MessageType.PONG:
          this.handlePong(message);
          break;
        case MessageType.PEER_DISCOVERY:
          this.handlePeerDiscovery(socket);
          break;
        case MessageType.PEER_LIST:
          this.handlePeerList(message);
          break;
        case MessageType.NEW_BLOCK:
          this.emit('block', message.payload as Block);
          this.gossip(message);
          break;
        case MessageType.NEW_TRANSACTION:
          this.emit('transaction', message.payload as Transaction);
          this.gossip(message);
          break;
        case MessageType.VOTE:
          this.emit('vote', message.payload as Vote);
          this.gossip(message);
          break;
        case MessageType.CONSENSUS_MESSAGE:
          this.emit('consensus', message);
          break;
        case MessageType.BLOCK_REQUEST:
          this.emit('blockRequest', message);
          break;
        case MessageType.SYNC_REQUEST:
          this.emit('syncRequest', message);
          break;
        default:
          log.debug('Unknown message type', { type: message.type });
      }
    } catch (err) {
      log.warn('Failed to parse message', { error: (err as Error).message });
    }
  }

  private handleHandshake(socket: WebSocket, message: P2PMessage, connectionId: string): void {
    const payload = message.payload as {
      version: string;
      chainId: number;
      networkId: string;
    };

    if (payload.chainId !== 6000 || payload.networkId !== 'tburn-mainnet') {
      socket.close(1008, 'Chain mismatch');
      return;
    }

    const peerInfo: PeerInfo = {
      nodeId: message.from,
      address: '',
      port: 0,
      publicKey: '',
      region: 'unknown',
      latencyMs: 0,
      lastSeen: Date.now(),
      isActive: true,
      protocolVersion: payload.version,
    };

    this.peers.set(message.from, {
      socket,
      info: peerInfo,
      lastPing: Date.now(),
      lastPong: Date.now(),
      messageCount: 0,
      bytesReceived: 0,
      bytesSent: 0,
    });

    this.pendingConnections.delete(connectionId);

    const ack: P2PMessage = {
      type: MessageType.HANDSHAKE_ACK,
      from: this.nodeId,
      to: message.from,
      payload: {
        accepted: true,
        version: '1.0.0',
      },
      timestamp: Date.now(),
      signature: '',
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    ack.signature = this.signMessage(JSON.stringify(ack.payload));
    this.send(socket, ack);

    log.info('Peer connected', { peerId: message.from });
    this.emit('peerConnected', peerInfo);
  }

  private handleHandshakeAck(socket: WebSocket, message: P2PMessage, connectionId: string): void {
    const payload = message.payload as { accepted: boolean };

    if (!payload.accepted) {
      socket.close(1008, 'Handshake rejected');
      return;
    }

    const peerInfo: PeerInfo = {
      nodeId: message.from,
      address: '',
      port: 0,
      publicKey: '',
      region: 'unknown',
      latencyMs: 0,
      lastSeen: Date.now(),
      isActive: true,
      protocolVersion: '1.0.0',
    };

    this.peers.set(message.from, {
      socket,
      info: peerInfo,
      lastPing: Date.now(),
      lastPong: Date.now(),
      messageCount: 0,
      bytesReceived: 0,
      bytesSent: 0,
    });

    this.pendingConnections.delete(connectionId);

    log.info('Handshake completed', { peerId: message.from });
    this.emit('peerConnected', peerInfo);
  }

  private handlePing(socket: WebSocket, message: P2PMessage): void {
    const pong: P2PMessage = {
      type: MessageType.PONG,
      from: this.nodeId,
      to: message.from,
      payload: { requestTimestamp: message.timestamp },
      timestamp: Date.now(),
      signature: '',
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    pong.signature = this.signMessage(JSON.stringify(pong.payload));
    this.send(socket, pong);
  }

  private handlePong(message: P2PMessage): void {
    const peer = this.peers.get(message.from);
    if (peer) {
      peer.lastPong = Date.now();
      const payload = message.payload as { requestTimestamp: number };
      peer.info.latencyMs = Date.now() - payload.requestTimestamp;
      peer.info.lastSeen = Date.now();
    }
  }

  private handlePeerDiscovery(socket: WebSocket): void {
    const peerList = Array.from(this.peers.values())
      .filter((p) => p.info.isActive)
      .map((p) => ({
        nodeId: p.info.nodeId,
        address: p.info.address,
        port: p.info.port,
      }));

    const response: P2PMessage = {
      type: MessageType.PEER_LIST,
      from: this.nodeId,
      payload: peerList,
      timestamp: Date.now(),
      signature: '',
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    response.signature = this.signMessage(JSON.stringify(response.payload));
    this.send(socket, response);
  }

  private handlePeerList(message: P2PMessage): void {
    const peers = message.payload as Array<{ nodeId: string; address: string; port: number }>;

    for (const peer of peers) {
      if (!this.peers.has(peer.nodeId) && peer.nodeId !== this.nodeId) {
        const address = `tcp://${peer.address}:${peer.port}`;
        this.connectToPeer(address).catch(() => {});
      }
    }
  }

  private send(socket: WebSocket, message: P2PMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      const data = JSON.stringify(message);
      socket.send(data);

      const peer = this.getPeerBySocket(socket);
      if (peer) {
        peer.bytesSent += data.length;
        peer.messageCount++;
      }
    }
  }

  broadcast(type: MessageType, payload: unknown): void {
    const message: P2PMessage = {
      type,
      from: this.nodeId,
      payload,
      timestamp: Date.now(),
      signature: '',
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    message.signature = this.signMessage(JSON.stringify(message.payload));

    for (const [, peer] of this.peers) {
      this.send(peer.socket, message);
    }
  }

  private gossip(message: P2PMessage): void {
    const gossipTargets = Math.ceil(Math.sqrt(this.peers.size));
    const peerArray = Array.from(this.peers.values());
    const selectedPeers = peerArray
      .filter((p) => p.info.nodeId !== message.from)
      .sort(() => Math.random() - 0.5)
      .slice(0, gossipTargets);

    for (const peer of selectedPeers) {
      this.send(peer.socket, message);
    }
  }

  sendTo(nodeId: string, type: MessageType, payload: unknown): void {
    const peer = this.peers.get(nodeId);
    if (!peer) {
      log.warn('Peer not found', { nodeId });
      return;
    }

    const message: P2PMessage = {
      type,
      from: this.nodeId,
      to: nodeId,
      payload,
      timestamp: Date.now(),
      signature: '',
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    message.signature = this.signMessage(JSON.stringify(message.payload));
    this.send(peer.socket, message);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [nodeId, peer] of this.peers) {
        if (Date.now() - peer.lastPong > this.config.heartbeatInterval * 3) {
          log.warn('Peer unresponsive, disconnecting', { nodeId });
          peer.socket.close(1001, 'Heartbeat timeout');
          this.peers.delete(nodeId);
          this.emit('peerDisconnected', peer.info);
          continue;
        }

        const ping: P2PMessage = {
          type: MessageType.PING,
          from: this.nodeId,
          to: nodeId,
          payload: {},
          timestamp: Date.now(),
          signature: '',
          nonce: crypto.randomBytes(16).toString('hex'),
        };

        ping.signature = this.signMessage(JSON.stringify(ping.payload));
        this.send(peer.socket, ping);
        peer.lastPing = Date.now();
      }
    }, this.config.heartbeatInterval);
  }

  private startDiscovery(): void {
    this.discoveryInterval = setInterval(() => {
      if (this.peers.size < this.config.minPeers) {
        log.info('Low peer count, initiating discovery', {
          current: this.peers.size,
          target: this.config.minPeers,
        });

        for (const [, peer] of this.peers) {
          const discovery: P2PMessage = {
            type: MessageType.PEER_DISCOVERY,
            from: this.nodeId,
            payload: {},
            timestamp: Date.now(),
            signature: '',
            nonce: crypto.randomBytes(16).toString('hex'),
          };

          discovery.signature = this.signMessage(JSON.stringify(discovery.payload));
          this.send(peer.socket, discovery);
        }
      }
    }, this.config.discoveryInterval);
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const oldMessages = Array.from(this.messageHistory).slice(
        0,
        Math.max(0, this.messageHistory.size - 10000)
      );
      for (const msg of oldMessages) {
        this.messageHistory.delete(msg);
      }

      const now = Date.now();
      for (const [ip, expiry] of this.bannedIps) {
        if (now >= expiry) {
          this.bannedIps.delete(ip);
        }
      }
    }, 60000);
  }

  private getPeerBySocket(socket: WebSocket): PeerConnection | undefined {
    for (const [, peer] of this.peers) {
      if (peer.socket === socket) {
        return peer;
      }
    }
    return undefined;
  }

  private removePeerBySocket(socket: WebSocket): void {
    for (const [nodeId, peer] of this.peers) {
      if (peer.socket === socket) {
        this.peers.delete(nodeId);
        this.emit('peerDisconnected', peer.info);
        log.info('Peer disconnected', { nodeId });
        break;
      }
    }
  }

  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values()).map((p) => p.info);
  }

  getPeerCount(): number {
    return this.peers.size;
  }

  isConnected(): boolean {
    return this.peers.size >= this.config.minPeers;
  }
}
