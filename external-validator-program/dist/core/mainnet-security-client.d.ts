/**
 * TBURN Mainnet Security Client
 * Communicates with the main system's Validator Security API
 * Syncs security status, receives commands, and reports alerts
 */
import { EventEmitter } from 'events';
export interface MainnetSecurityConfig {
    mainnetApiUrl: string;
    validatorAddress: string;
    nodeId: string;
    apiKey: string;
    syncIntervalMs: number;
    timeout: number;
    enableSync: boolean;
}
export interface SecuritySyncData {
    isBlocked: boolean;
    blockReason?: string;
    rateLimitConfig: {
        requestsPerSecond: number;
        requestsPerMinute: number;
        burstCapacity: number;
    };
    ipWhitelist: string[];
    activeAlerts: SecurityAlert[];
    lastSyncTime: Date;
}
export interface SecurityAlert {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    status: 'active' | 'acknowledged' | 'resolved';
}
export interface SecurityReport {
    validatorAddress: string;
    nodeId: string;
    timestamp: number;
    metrics: {
        signingRequests: number;
        blockedRequests: number;
        rateLimitHits: number;
        replayAttemptsBlocked: number;
        averageLatencyMs: number;
        securityAlertCount: number;
    };
    status: {
        isOperational: boolean;
        securityEnabled: boolean;
        lastSecurityCheck: number;
        uptime: number;
    };
    alerts: Array<{
        type: string;
        severity: string;
        message: string;
        timestamp: number;
    }>;
}
export declare class MainnetSecurityClient extends EventEmitter {
    private config;
    private syncInterval?;
    private lastSyncData;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor(config: MainnetSecurityConfig);
    start(): Promise<boolean>;
    stop(): Promise<void>;
    private startSyncLoop;
    private performSecuritySync;
    reportSecurityStatus(report: SecurityReport): Promise<boolean>;
    acknowledgeAlert(alertId: string): Promise<boolean>;
    private fetchMySecurityStatus;
    sendSecurityHeartbeat(data: {
        nodeId: string;
        uptime: number;
        currentSlot: number;
        securityStats: any;
    }): Promise<any>;
    private httpRequest;
    private signReport;
    getLastSyncData(): SecuritySyncData | null;
    isValidatorBlocked(): boolean;
    getBlockReason(): string | undefined;
    getRateLimitConfig(): {
        requestsPerSecond: number;
        requestsPerMinute: number;
        burstCapacity: number;
    };
    getActiveAlerts(): SecurityAlert[];
    isConnectedToMainnet(): boolean;
    getConfig(): MainnetSecurityConfig;
}
//# sourceMappingURL=mainnet-security-client.d.ts.map