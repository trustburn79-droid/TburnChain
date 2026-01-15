/**
 * TBURN P2P Network
 * Handles peer-to-peer communication for validator
 */
import { EventEmitter } from 'events';
export interface P2PNetworkConfig {
    port: number;
    bootnodes: string[];
    maxPeers: number;
    nodeId: string;
}
export interface Peer {
    id: string;
    address: string;
    port: number;
    connectedAt: number;
    latencyMs: number;
    version: string;
}
export declare class P2PNetwork extends EventEmitter {
    private config;
    private peers;
    private isRunning;
    private discoveryInterval?;
    constructor(config: P2PNetworkConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private connectToBootnodes;
    private connectToPeer;
    private disconnectPeer;
    private startPeerDiscovery;
    private generateMockPeer;
    getPeerCount(): number;
    getPeers(): Peer[];
    isConnected(): boolean;
    broadcast(message: unknown): Promise<number>;
}
//# sourceMappingURL=p2p-network.d.ts.map