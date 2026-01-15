/**
 * TBURN Validator Configuration
 * Loads and validates configuration from environment variables
 */
export type ValidatorTier = 'genesis' | 'pioneer' | 'standard' | 'community';
export type Network = 'mainnet' | 'testnet';
export interface ValidatorConfig {
    network: Network;
    chainId: number;
    validatorAddress: string;
    publicKey: string;
    validatorName: string;
    tier: ValidatorTier;
    nodeId: string;
    signerEndpoint: string;
    caCertPath: string;
    clientCertPath: string;
    clientKeyPath: string;
    gcpProjectId: string;
    gcpRegion: string;
    gcpSecretName: string;
    rpcEndpoint: string;
    wsEndpoint: string;
    bootnodes: string[];
    p2pPort: number;
    rpcPort: number;
    wsPort: number;
    metricsPort: number;
    stakeAmount: bigint;
    commissionRate: number;
    blockTimeMs: number;
    maxTxPerBlock: number;
    heartbeatIntervalMs: number;
    logLevel: string;
    enableCloudLogging: boolean;
    enableCloudMonitoring: boolean;
    enableMetrics: boolean;
    enableRateLimiting: boolean;
    maxSignRequestsPerSec: number;
    mainnetApiUrl: string;
    mainnetApiKey: string;
    enableSecuritySync: boolean;
    securitySyncIntervalMs: number;
}
export declare function loadConfig(): ValidatorConfig;
export declare const TIER_CONFIG: {
    genesis: {
        minStake: bigint;
        maxSlots: number;
        apyRange: string;
        commission: string;
        permissions: string[];
    };
    pioneer: {
        minStake: bigint;
        maxSlots: number;
        apyRange: string;
        commission: string;
        permissions: string[];
    };
    standard: {
        minStake: bigint;
        maxSlots: number;
        apyRange: string;
        commission: string;
        permissions: string[];
    };
    community: {
        minStake: bigint;
        maxSlots: number;
        apyRange: string;
        commission: string;
        permissions: string[];
    };
};
//# sourceMappingURL=validator-config.d.ts.map