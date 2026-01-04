/**
 * TBURN Validator Management API
 * Enterprise-Grade Validator Registration and Management
 *
 * Integrates with frontend pages:
 * - /validator - Registration and list
 * - /validator/infrastructure - Infrastructure status
 * - /validator/:id - Individual validator details
 * - /validator-governance - Governance participation
 */
import { Router } from 'express';
export interface ValidatorRegistration {
    id: string;
    name: string;
    address: string;
    publicKey: string;
    stake: string;
    commission: number;
    region: string;
    datacenter: string;
    status: 'pending' | 'active' | 'jailed' | 'tombstoned' | 'inactive';
    registeredAt: Date;
    activatedAt?: Date;
    lastHeartbeat?: Date;
    uptime: number;
    blocksProposed: number;
    blocksMissed: number;
    slashingEvents: number;
    totalRewards: string;
    delegators: number;
    votingPower: string;
    infrastructureScore: number;
    website?: string;
    description?: string;
    contact?: string;
}
export interface InfrastructureStatus {
    validatorId: string;
    nodeVersion: string;
    os: string;
    cpuCores: number;
    memoryGb: number;
    diskGb: number;
    networkMbps: number;
    region: string;
    datacenter: string;
    ipAddress: string;
    p2pPort: number;
    apiPort: number;
    rpcPort: number;
    wsPort: number;
    tlsEnabled: boolean;
    mtlsEnabled: boolean;
    lastUpdate: Date;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    latencyMs: number;
    peersConnected: number;
    syncStatus: 'synced' | 'syncing' | 'behind';
    blockHeight: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
}
export interface GovernanceVote {
    proposalId: string;
    validatorId: string;
    vote: 'yes' | 'no' | 'abstain' | 'no_with_veto';
    votingPower: string;
    timestamp: Date;
    signature: string;
}
export interface GovernanceProposal {
    id: string;
    title: string;
    description: string;
    type: 'parameter_change' | 'software_upgrade' | 'text' | 'community_spend';
    proposer: string;
    status: 'voting' | 'passed' | 'rejected' | 'executed';
    submitTime: Date;
    votingStartTime: Date;
    votingEndTime: Date;
    yesVotes: string;
    noVotes: string;
    abstainVotes: string;
    noWithVetoVotes: string;
    totalVotingPower: string;
    quorumReached: boolean;
    thresholdReached: boolean;
}
export declare function createValidatorManagementRouter(): Router;
export declare function initializeSampleData(): void;
//# sourceMappingURL=validator-management.d.ts.map