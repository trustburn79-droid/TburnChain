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
import { EventEmitter } from 'events';
import { NetworkConfig, PeerInfo } from '../config/types';
export declare enum MessageType {
    HANDSHAKE = "handshake",
    HANDSHAKE_ACK = "handshake_ack",
    PING = "ping",
    PONG = "pong",
    PEER_DISCOVERY = "peer_discovery",
    PEER_LIST = "peer_list",
    NEW_BLOCK = "new_block",
    NEW_TRANSACTION = "new_transaction",
    VOTE = "vote",
    VOTE_REQUEST = "vote_request",
    BLOCK_REQUEST = "block_request",
    BLOCK_RESPONSE = "block_response",
    SYNC_REQUEST = "sync_request",
    SYNC_RESPONSE = "sync_response",
    CONSENSUS_MESSAGE = "consensus_message"
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
export declare class P2PNetwork extends EventEmitter {
    private config;
    private nodeId;
    private server;
    private peers;
    private pendingConnections;
    private bannedIps;
    private messageHistory;
    private heartbeatInterval;
    private discoveryInterval;
    private cleanupInterval;
    private signMessage;
    constructor(config: NetworkConfig, nodeId: string, signFunction: (message: string) => string);
    start(): Promise<void>;
    stop(): Promise<void>;
    private connectToBootstrapPeers;
    connectToPeer(address: string): Promise<void>;
    private handleIncomingConnection;
    private sendHandshake;
    private handleMessage;
    private handleHandshake;
    private handleHandshakeAck;
    private handlePing;
    private handlePong;
    private handlePeerDiscovery;
    private handlePeerList;
    private send;
    broadcast(type: MessageType, payload: unknown): void;
    private gossip;
    sendTo(nodeId: string, type: MessageType, payload: unknown): void;
    private startHeartbeat;
    private startDiscovery;
    private startCleanup;
    private getPeerBySocket;
    private removePeerBySocket;
    getPeers(): PeerInfo[];
    getPeerCount(): number;
    isConnected(): boolean;
}
//# sourceMappingURL=p2p.d.ts.map