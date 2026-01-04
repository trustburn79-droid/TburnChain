"use strict";
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
exports.createValidatorManagementRouter = createValidatorManagementRouter;
exports.initializeSampleData = initializeSampleData;
const express_1 = __importStar(require("express"));
const crypto = __importStar(require("crypto"));
const logger_1 = require("../utils/logger");
const rate_limiter_1 = require("../security/rate-limiter");
const log = (0, logger_1.createModuleLogger)('ValidatorManagement');
// In-memory storage (replace with database in production)
const validators = new Map();
const infrastructureStatus = new Map();
const proposals = new Map();
const votes = new Map();
const rateLimiter = new rate_limiter_1.AdvancedRateLimiter({
    windowMs: 60000,
    maxRequests: 100,
    burstLimit: 20,
});
function createValidatorManagementRouter() {
    const router = (0, express_1.Router)();
    // Rate limiting middleware
    router.use((req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const result = rateLimiter.check(ip);
        if (!result.allowed) {
            res.status(429).json({ error: 'Rate limit exceeded', retryAfter: result.retryAfterMs });
            return;
        }
        next();
    });
    // ============================================
    // VALIDATOR REGISTRATION ENDPOINTS
    // For /validator page
    // ============================================
    // Get all validators (for list view)
    router.get('/validators', async (_req, res) => {
        try {
            const validatorList = Array.from(validators.values())
                .sort((a, b) => parseFloat(b.votingPower) - parseFloat(a.votingPower));
            res.json({
                success: true,
                data: {
                    validators: validatorList,
                    total: validatorList.length,
                    active: validatorList.filter(v => v.status === 'active').length,
                    pending: validatorList.filter(v => v.status === 'pending').length,
                    jailed: validatorList.filter(v => v.status === 'jailed').length,
                },
            });
        }
        catch (error) {
            log.error('Failed to get validators', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    // Register new validator (application)
    router.post('/validators/register', express_1.default.json(), async (req, res) => {
        try {
            const { name, address, publicKey, stake, commission, region, datacenter, website, description, contact } = req.body;
            // Validate required fields
            if (!name || !address || !publicKey || !stake || commission === undefined || !region || !datacenter) {
                res.status(400).json({ success: false, error: 'Missing required fields' });
                return;
            }
            // Check if address already registered
            const existing = Array.from(validators.values()).find(v => v.address === address);
            if (existing) {
                res.status(409).json({ success: false, error: 'Address already registered' });
                return;
            }
            // Validate minimum stake
            const minStake = BigInt('1000000000000000000000000'); // 1M TBURN
            if (BigInt(stake) < minStake) {
                res.status(400).json({ success: false, error: 'Stake below minimum requirement' });
                return;
            }
            const validatorId = crypto.randomUUID();
            const validator = {
                id: validatorId,
                name,
                address,
                publicKey,
                stake,
                commission,
                region,
                datacenter,
                status: 'pending',
                registeredAt: new Date(),
                uptime: 0,
                blocksProposed: 0,
                blocksMissed: 0,
                slashingEvents: 0,
                totalRewards: '0',
                delegators: 0,
                votingPower: stake,
                infrastructureScore: 0,
                website,
                description,
                contact,
            };
            validators.set(validatorId, validator);
            log.info('Validator registered', { validatorId, address, name });
            res.status(201).json({
                success: true,
                data: {
                    validatorId,
                    status: 'pending',
                    message: 'Registration submitted. Awaiting stake verification.',
                },
            });
        }
        catch (error) {
            log.error('Failed to register validator', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    // ============================================
    // INDIVIDUAL VALIDATOR ENDPOINTS
    // For /validator/:id page
    // ============================================
    router.get('/validators/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const validator = validators.get(id);
            if (!validator) {
                res.status(404).json({ success: false, error: 'Validator not found' });
                return;
            }
            const infra = infrastructureStatus.get(id);
            const validatorVotes = votes.get(id) || [];
            res.json({
                success: true,
                data: {
                    validator,
                    infrastructure: infra,
                    recentVotes: validatorVotes.slice(-10),
                    performance: {
                        uptime: validator.uptime,
                        blocksProposed: validator.blocksProposed,
                        blocksMissed: validator.blocksMissed,
                        successRate: validator.blocksProposed > 0
                            ? (validator.blocksProposed / (validator.blocksProposed + validator.blocksMissed)) * 100
                            : 0,
                    },
                },
            });
        }
        catch (error) {
            log.error('Failed to get validator', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    // Update validator info
    router.patch('/validators/:id', express_1.default.json(), async (req, res) => {
        try {
            const { id } = req.params;
            const validator = validators.get(id);
            if (!validator) {
                res.status(404).json({ success: false, error: 'Validator not found' });
                return;
            }
            const allowedUpdates = ['name', 'commission', 'website', 'description', 'contact'];
            const updates = req.body;
            for (const key of Object.keys(updates)) {
                if (allowedUpdates.includes(key)) {
                    validator[key] = updates[key];
                }
            }
            validators.set(id, validator);
            res.json({ success: true, data: validator });
        }
        catch (error) {
            log.error('Failed to update validator', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    // ============================================
    // INFRASTRUCTURE ENDPOINTS
    // For /validator/infrastructure page
    // ============================================
    router.get('/infrastructure', async (_req, res) => {
        try {
            const infraList = Array.from(infrastructureStatus.values());
            const summary = {
                total: infraList.length,
                healthy: infraList.filter(i => i.healthStatus === 'healthy').length,
                degraded: infraList.filter(i => i.healthStatus === 'degraded').length,
                unhealthy: infraList.filter(i => i.healthStatus === 'unhealthy').length,
                avgLatency: infraList.length > 0
                    ? infraList.reduce((sum, i) => sum + i.latencyMs, 0) / infraList.length
                    : 0,
                avgCpuUsage: infraList.length > 0
                    ? infraList.reduce((sum, i) => sum + i.cpuUsage, 0) / infraList.length
                    : 0,
                regions: [...new Set(infraList.map(i => i.region))],
            };
            res.json({
                success: true,
                data: {
                    infrastructure: infraList,
                    summary,
                },
            });
        }
        catch (error) {
            log.error('Failed to get infrastructure', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    router.get('/infrastructure/:validatorId', async (req, res) => {
        try {
            const { validatorId } = req.params;
            const infra = infrastructureStatus.get(validatorId);
            if (!infra) {
                res.status(404).json({ success: false, error: 'Infrastructure status not found' });
                return;
            }
            res.json({ success: true, data: infra });
        }
        catch (error) {
            log.error('Failed to get infrastructure status', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    // Heartbeat/status update from validator node
    router.post('/infrastructure/:validatorId/heartbeat', express_1.default.json(), async (req, res) => {
        try {
            const { validatorId } = req.params;
            const status = req.body;
            const validator = validators.get(validatorId);
            if (!validator) {
                res.status(404).json({ success: false, error: 'Validator not found' });
                return;
            }
            const infraStatus = {
                validatorId,
                nodeVersion: status.nodeVersion || '1.0.0',
                os: status.os || 'Linux',
                cpuCores: status.cpuCores || 4,
                memoryGb: status.memoryGb || 16,
                diskGb: status.diskGb || 500,
                networkMbps: status.networkMbps || 1000,
                region: validator.region,
                datacenter: validator.datacenter,
                ipAddress: status.ipAddress || req.ip || 'unknown',
                p2pPort: status.p2pPort || 26656,
                apiPort: status.apiPort || 8080,
                rpcPort: status.rpcPort || 8545,
                wsPort: status.wsPort || 8546,
                tlsEnabled: status.tlsEnabled ?? true,
                mtlsEnabled: status.mtlsEnabled ?? true,
                lastUpdate: new Date(),
                healthStatus: status.healthStatus || 'healthy',
                latencyMs: status.latencyMs || 0,
                peersConnected: status.peersConnected || 0,
                syncStatus: status.syncStatus || 'synced',
                blockHeight: status.blockHeight || 0,
                cpuUsage: status.cpuUsage || 0,
                memoryUsage: status.memoryUsage || 0,
                diskUsage: status.diskUsage || 0,
                networkIn: status.networkIn || 0,
                networkOut: status.networkOut || 0,
            };
            infrastructureStatus.set(validatorId, infraStatus);
            validator.lastHeartbeat = new Date();
            validators.set(validatorId, validator);
            res.json({ success: true, message: 'Heartbeat received' });
        }
        catch (error) {
            log.error('Failed to process heartbeat', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    // ============================================
    // GOVERNANCE ENDPOINTS
    // For /validator-governance page
    // ============================================
    router.get('/governance/proposals', async (req, res) => {
        try {
            const status = req.query.status;
            let proposalList = Array.from(proposals.values());
            if (status) {
                proposalList = proposalList.filter(p => p.status === status);
            }
            proposalList.sort((a, b) => b.submitTime.getTime() - a.submitTime.getTime());
            res.json({
                success: true,
                data: {
                    proposals: proposalList,
                    total: proposalList.length,
                    voting: proposalList.filter(p => p.status === 'voting').length,
                    passed: proposalList.filter(p => p.status === 'passed').length,
                    rejected: proposalList.filter(p => p.status === 'rejected').length,
                },
            });
        }
        catch (error) {
            log.error('Failed to get proposals', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    router.get('/governance/proposals/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const proposal = proposals.get(id);
            if (!proposal) {
                res.status(404).json({ success: false, error: 'Proposal not found' });
                return;
            }
            // Get all votes for this proposal
            const proposalVotes = [];
            for (const [, validatorVotes] of votes) {
                const vote = validatorVotes.find(v => v.proposalId === id);
                if (vote)
                    proposalVotes.push(vote);
            }
            res.json({
                success: true,
                data: {
                    proposal,
                    votes: proposalVotes,
                    voteCount: proposalVotes.length,
                },
            });
        }
        catch (error) {
            log.error('Failed to get proposal', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    // Submit vote
    router.post('/governance/proposals/:id/vote', express_1.default.json(), async (req, res) => {
        try {
            const { id } = req.params;
            const { validatorId, vote: voteChoice, signature } = req.body;
            const proposal = proposals.get(id);
            if (!proposal) {
                res.status(404).json({ success: false, error: 'Proposal not found' });
                return;
            }
            if (proposal.status !== 'voting') {
                res.status(400).json({ success: false, error: 'Voting period ended' });
                return;
            }
            const validator = validators.get(validatorId);
            if (!validator) {
                res.status(404).json({ success: false, error: 'Validator not found' });
                return;
            }
            if (validator.status !== 'active') {
                res.status(403).json({ success: false, error: 'Only active validators can vote' });
                return;
            }
            const validVotes = ['yes', 'no', 'abstain', 'no_with_veto'];
            if (!validVotes.includes(voteChoice)) {
                res.status(400).json({ success: false, error: 'Invalid vote choice' });
                return;
            }
            const newVote = {
                proposalId: id,
                validatorId,
                vote: voteChoice,
                votingPower: validator.votingPower,
                timestamp: new Date(),
                signature: signature || '',
            };
            // Store vote
            const validatorVotes = votes.get(validatorId) || [];
            const existingIndex = validatorVotes.findIndex(v => v.proposalId === id);
            if (existingIndex >= 0) {
                validatorVotes[existingIndex] = newVote;
            }
            else {
                validatorVotes.push(newVote);
            }
            votes.set(validatorId, validatorVotes);
            // Update proposal vote counts
            const power = BigInt(validator.votingPower);
            switch (voteChoice) {
                case 'yes':
                    proposal.yesVotes = (BigInt(proposal.yesVotes) + power).toString();
                    break;
                case 'no':
                    proposal.noVotes = (BigInt(proposal.noVotes) + power).toString();
                    break;
                case 'abstain':
                    proposal.abstainVotes = (BigInt(proposal.abstainVotes) + power).toString();
                    break;
                case 'no_with_veto':
                    proposal.noWithVetoVotes = (BigInt(proposal.noWithVetoVotes) + power).toString();
                    break;
            }
            proposals.set(id, proposal);
            log.info('Vote submitted', { proposalId: id, validatorId, vote: voteChoice });
            res.json({ success: true, data: newVote });
        }
        catch (error) {
            log.error('Failed to submit vote', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    // Get validator's voting history
    router.get('/governance/validators/:validatorId/votes', async (req, res) => {
        try {
            const { validatorId } = req.params;
            const validatorVotes = votes.get(validatorId) || [];
            res.json({
                success: true,
                data: {
                    votes: validatorVotes,
                    total: validatorVotes.length,
                },
            });
        }
        catch (error) {
            log.error('Failed to get voting history', { error: error.message });
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
    return router;
}
// Initialize with sample data for testing
function initializeSampleData() {
    // Sample validators
    for (let i = 0; i < 10; i++) {
        const id = crypto.randomUUID();
        const regions = ['asia-northeast1', 'asia-northeast2', 'us-east1', 'europe-west1'];
        const datacenters = ['Seoul', 'Tokyo', 'New York', 'Frankfurt'];
        const regionIndex = i % 4;
        validators.set(id, {
            id,
            name: `TBURN Validator ${i + 1}`,
            address: `tb1${crypto.randomBytes(19).toString('hex')}`,
            publicKey: crypto.randomBytes(33).toString('hex'),
            stake: (BigInt(1000000 + i * 100000) * BigInt(10 ** 18)).toString(),
            commission: 0.05 + (i * 0.01),
            region: regions[regionIndex],
            datacenter: datacenters[regionIndex],
            status: i < 8 ? 'active' : 'pending',
            registeredAt: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
            activatedAt: i < 8 ? new Date(Date.now() - (25 - i) * 24 * 60 * 60 * 1000) : undefined,
            lastHeartbeat: i < 8 ? new Date() : undefined,
            uptime: 99.5 + Math.random() * 0.5,
            blocksProposed: Math.floor(Math.random() * 10000),
            blocksMissed: Math.floor(Math.random() * 100),
            slashingEvents: 0,
            totalRewards: (BigInt(Math.floor(Math.random() * 1000000)) * BigInt(10 ** 18)).toString(),
            delegators: Math.floor(Math.random() * 500),
            votingPower: (BigInt(1000000 + i * 100000) * BigInt(10 ** 18)).toString(),
            infrastructureScore: 85 + Math.random() * 15,
        });
    }
    // Sample proposal
    const proposalId = crypto.randomUUID();
    proposals.set(proposalId, {
        id: proposalId,
        title: 'Increase Block Size Limit',
        description: 'Proposal to increase the maximum block size from 5MB to 10MB to accommodate higher transaction throughput.',
        type: 'parameter_change',
        proposer: Array.from(validators.values())[0]?.address || '',
        status: 'voting',
        submitTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        votingStartTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        votingEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        yesVotes: '0',
        noVotes: '0',
        abstainVotes: '0',
        noWithVetoVotes: '0',
        totalVotingPower: Array.from(validators.values())
            .filter(v => v.status === 'active')
            .reduce((sum, v) => sum + BigInt(v.votingPower), BigInt(0))
            .toString(),
        quorumReached: false,
        thresholdReached: false,
    });
    log.info('Sample data initialized', {
        validators: validators.size,
        proposals: proposals.size,
    });
}
//# sourceMappingURL=validator-management.js.map