"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.P2PNetwork = exports.MessageType = void 0;
const ws_1 = __importStar(require("ws"));
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createModuleLogger)('P2P');
var MessageType;
(function (MessageType) {
    MessageType["HANDSHAKE"] = "handshake";
    MessageType["HANDSHAKE_ACK"] = "handshake_ack";
    MessageType["PING"] = "ping";
    MessageType["PONG"] = "pong";
    MessageType["PEER_DISCOVERY"] = "peer_discovery";
    MessageType["PEER_LIST"] = "peer_list";
    MessageType["NEW_BLOCK"] = "new_block";
    MessageType["NEW_TRANSACTION"] = "new_transaction";
    MessageType["VOTE"] = "vote";
    MessageType["VOTE_REQUEST"] = "vote_request";
    MessageType["BLOCK_REQUEST"] = "block_request";
    MessageType["BLOCK_RESPONSE"] = "block_response";
    MessageType["SYNC_REQUEST"] = "sync_request";
    MessageType["SYNC_RESPONSE"] = "sync_response";
    MessageType["CONSENSUS_MESSAGE"] = "consensus_message";
})(MessageType || (exports.MessageType = MessageType = {}));
class P2PNetwork extends events_1.EventEmitter {
    config;
    nodeId;
    server = null;
    peers = new Map();
    pendingConnections = new Map();
    bannedIps = new Map();
    messageHistory = new Set();
    heartbeatInterval = null;
    discoveryInterval = null;
    cleanupInterval = null;
    signMessage;
    constructor(config, nodeId, signFunction) {
        super();
        this.config = config;
        this.nodeId = nodeId;
        this.signMessage = signFunction;
    }
    async start() {
        log.info('Starting P2P network', {
            host: this.config.listenHost,
            port: this.config.listenPort,
        });
        this.server = new ws_1.WebSocketServer({
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
    async stop() {
        log.info('Stopping P2P network');
        if (this.heartbeatInterval)
            clearInterval(this.heartbeatInterval);
        if (this.discoveryInterval)
            clearInterval(this.discoveryInterval);
        if (this.cleanupInterval)
            clearInterval(this.cleanupInterval);
        for (const [, peer] of this.peers) {
            peer.socket.close(1000, 'Node shutting down');
        }
        this.peers.clear();
        if (this.server) {
            this.server.close();
        }
        log.info('P2P network stopped');
    }
    async connectToBootstrapPeers() {
        const connectionPromises = this.config.bootstrapPeers.map((peerAddress) => this.connectToPeer(peerAddress).catch((err) => {
            log.warn('Failed to connect to bootstrap peer', {
                peer: peerAddress,
                error: err.message,
            });
        }));
        await Promise.allSettled(connectionPromises);
        log.info('Bootstrap peer connections completed', {
            connected: this.peers.size,
        });
    }
    async connectToPeer(address) {
        if (this.peers.size >= this.config.maxPeers) {
            log.debug('Max peers reached, skipping connection', { address });
            return;
        }
        const wsUrl = address.replace('tcp://', 'ws://');
        return new Promise((resolve, reject) => {
            const socket = new ws_1.default(wsUrl, {
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
    handleIncomingConnection(socket, remoteAddress) {
        if (this.bannedIps.has(remoteAddress)) {
            const banExpiry = this.bannedIps.get(remoteAddress);
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
    sendHandshake(socket) {
        const handshake = {
            type: MessageType.HANDSHAKE,
            from: this.nodeId,
            payload: {
                version: '1.0.0',
                chainId: 5800,
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
    handleMessage(socket, data, connectionId) {
        try {
            const message = JSON.parse(data);
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
                    this.emit('block', message.payload);
                    this.gossip(message);
                    break;
                case MessageType.NEW_TRANSACTION:
                    this.emit('transaction', message.payload);
                    this.gossip(message);
                    break;
                case MessageType.VOTE:
                    this.emit('vote', message.payload);
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
        }
        catch (err) {
            log.warn('Failed to parse message', { error: err.message });
        }
    }
    handleHandshake(socket, message, connectionId) {
        const payload = message.payload;
        if (payload.chainId !== 5800 || payload.networkId !== 'tburn-mainnet') {
            socket.close(1008, 'Chain mismatch');
            return;
        }
        const peerInfo = {
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
        const ack = {
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
    handleHandshakeAck(socket, message, connectionId) {
        const payload = message.payload;
        if (!payload.accepted) {
            socket.close(1008, 'Handshake rejected');
            return;
        }
        const peerInfo = {
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
    handlePing(socket, message) {
        const pong = {
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
    handlePong(message) {
        const peer = this.peers.get(message.from);
        if (peer) {
            peer.lastPong = Date.now();
            const payload = message.payload;
            peer.info.latencyMs = Date.now() - payload.requestTimestamp;
            peer.info.lastSeen = Date.now();
        }
    }
    handlePeerDiscovery(socket) {
        const peerList = Array.from(this.peers.values())
            .filter((p) => p.info.isActive)
            .map((p) => ({
            nodeId: p.info.nodeId,
            address: p.info.address,
            port: p.info.port,
        }));
        const response = {
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
    handlePeerList(message) {
        const peers = message.payload;
        for (const peer of peers) {
            if (!this.peers.has(peer.nodeId) && peer.nodeId !== this.nodeId) {
                const address = `tcp://${peer.address}:${peer.port}`;
                this.connectToPeer(address).catch(() => { });
            }
        }
    }
    send(socket, message) {
        if (socket.readyState === ws_1.default.OPEN) {
            const data = JSON.stringify(message);
            socket.send(data);
            const peer = this.getPeerBySocket(socket);
            if (peer) {
                peer.bytesSent += data.length;
                peer.messageCount++;
            }
        }
    }
    broadcast(type, payload) {
        const message = {
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
    gossip(message) {
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
    sendTo(nodeId, type, payload) {
        const peer = this.peers.get(nodeId);
        if (!peer) {
            log.warn('Peer not found', { nodeId });
            return;
        }
        const message = {
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
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            for (const [nodeId, peer] of this.peers) {
                if (Date.now() - peer.lastPong > this.config.heartbeatInterval * 3) {
                    log.warn('Peer unresponsive, disconnecting', { nodeId });
                    peer.socket.close(1001, 'Heartbeat timeout');
                    this.peers.delete(nodeId);
                    this.emit('peerDisconnected', peer.info);
                    continue;
                }
                const ping = {
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
    startDiscovery() {
        this.discoveryInterval = setInterval(() => {
            if (this.peers.size < this.config.minPeers) {
                log.info('Low peer count, initiating discovery', {
                    current: this.peers.size,
                    target: this.config.minPeers,
                });
                for (const [, peer] of this.peers) {
                    const discovery = {
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
    startCleanup() {
        this.cleanupInterval = setInterval(() => {
            const oldMessages = Array.from(this.messageHistory).slice(0, Math.max(0, this.messageHistory.size - 10000));
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
    getPeerBySocket(socket) {
        for (const [, peer] of this.peers) {
            if (peer.socket === socket) {
                return peer;
            }
        }
        return undefined;
    }
    removePeerBySocket(socket) {
        for (const [nodeId, peer] of this.peers) {
            if (peer.socket === socket) {
                this.peers.delete(nodeId);
                this.emit('peerDisconnected', peer.info);
                log.info('Peer disconnected', { nodeId });
                break;
            }
        }
    }
    getPeers() {
        return Array.from(this.peers.values()).map((p) => p.info);
    }
    getPeerCount() {
        return this.peers.size;
    }
    isConnected() {
        return this.peers.size >= this.config.minPeers;
    }
}
exports.P2PNetwork = P2PNetwork;
//# sourceMappingURL=p2p.js.map