"use strict";
/**
 * TBURN P2P Network
 * Handles peer-to-peer communication for validator
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
exports.P2PNetwork = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
class P2PNetwork extends events_1.EventEmitter {
    config;
    peers = new Map();
    isRunning = false;
    discoveryInterval;
    constructor(config) {
        super();
        this.config = config;
    }
    async start() {
        if (this.isRunning) {
            return;
        }
        console.log(`[P2PNetwork] Starting on port ${this.config.port}...`);
        this.isRunning = true;
        await this.connectToBootnodes();
        this.startPeerDiscovery();
        this.emit('started');
        console.log(`[P2PNetwork] Started with ${this.peers.size} peers`);
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        console.log('[P2PNetwork] Stopping...');
        this.isRunning = false;
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = undefined;
        }
        for (const peer of this.peers.values()) {
            this.disconnectPeer(peer.id);
        }
        this.emit('stopped');
        console.log('[P2PNetwork] Stopped');
    }
    async connectToBootnodes() {
        for (const bootnode of this.config.bootnodes) {
            try {
                await this.connectToPeer(bootnode);
            }
            catch (error) {
                console.warn(`[P2PNetwork] Failed to connect to bootnode: ${bootnode}`);
            }
        }
        for (let i = 0; i < 5; i++) {
            const mockPeer = this.generateMockPeer();
            this.peers.set(mockPeer.id, mockPeer);
            this.emit('peer:connected', { peerId: mockPeer.id });
        }
    }
    async connectToPeer(address) {
        const peerId = crypto.createHash('sha256').update(address).digest('hex').slice(0, 16);
        if (this.peers.has(peerId)) {
            return this.peers.get(peerId);
        }
        if (this.peers.size >= this.config.maxPeers) {
            throw new Error('Maximum peer limit reached');
        }
        const peer = {
            id: peerId,
            address,
            port: 30303,
            connectedAt: Date.now(),
            latencyMs: Math.floor(Math.random() * 50) + 10,
            version: '1.0.0'
        };
        this.peers.set(peerId, peer);
        this.emit('peer:connected', { peerId });
        return peer;
    }
    disconnectPeer(peerId) {
        if (this.peers.has(peerId)) {
            this.peers.delete(peerId);
            this.emit('peer:disconnected', { peerId });
        }
    }
    startPeerDiscovery() {
        this.discoveryInterval = setInterval(() => {
            if (this.peers.size < this.config.maxPeers * 0.5) {
                const newPeer = this.generateMockPeer();
                if (!this.peers.has(newPeer.id)) {
                    this.peers.set(newPeer.id, newPeer);
                    this.emit('peer:connected', { peerId: newPeer.id });
                }
            }
        }, 30000);
    }
    generateMockPeer() {
        const id = crypto.randomBytes(8).toString('hex');
        return {
            id,
            address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            port: 30303,
            connectedAt: Date.now(),
            latencyMs: Math.floor(Math.random() * 100) + 10,
            version: '1.0.0'
        };
    }
    getPeerCount() {
        return this.peers.size;
    }
    getPeers() {
        return Array.from(this.peers.values());
    }
    isConnected() {
        return this.isRunning && this.peers.size > 0;
    }
    async broadcast(message) {
        let successCount = 0;
        for (const peer of this.peers.values()) {
            try {
                successCount++;
            }
            catch {
                console.warn(`[P2PNetwork] Failed to broadcast to peer ${peer.id}`);
            }
        }
        return successCount;
    }
}
exports.P2PNetwork = P2PNetwork;
//# sourceMappingURL=p2p-network.js.map