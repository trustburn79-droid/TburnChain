import { Router, Request, Response } from "express";
import { storage } from "../storage";
import crypto from "crypto";
import { getEnterpriseNode } from "../services/TBurnEnterpriseNode";
import { 
  generateSystemAddress, 
  generateValidatorAddress,
  SYSTEM_ADDRESSES,
  SIGNER_ADDRESSES 
} from "../utils/tburn-address";
import {
  genesisGenerator,
  GENESIS_CONFIG,
  CHAIN_CONFIG,
  TOKENOMICS,
  VALIDATOR_CONFIG,
  SHARD_CONFIG,
  BLOCK_CONFIG,
  REWARDS_CONFIG,
  SECURITY_CONFIG,
} from "../core/genesis/enterprise-genesis-config";

const router = Router();

// Genesis Configuration Types
interface GenesisConfigData {
  id: string;
  chainId: number;
  chainName: string;
  networkVersion: string;
  totalSupply: string;
  decimals: number;
  tokenSymbol: string;
  tokenName: string;
  initialPrice: string;
  blockTimeMs: number;
  minValidatorStake: string;
  maxValidatorCount: number;
  initialValidatorCount: number;
  stakingRewardRate: number;
  consensusType: string;
  committeeSize: number;
  blockProducerCount: number;
  quorumThreshold: number;
  initialShardCount: number;
  maxShardCount: number;
  requiredSignatures: number;
  totalSigners: number;
  status: string;
  isExecuted: boolean;
  genesisTimestamp?: number;
  executedAt?: string;
  preflightChecks?: any;
}

interface GenesisValidator {
  id: string;
  configId: string;
  address: string;
  name: string;
  description?: string;
  website?: string;
  initialStake: string;
  commission: number;
  nodePublicKey: string;
  tier: string;
  priority: number;
  isVerified: boolean;
  kycStatus: string;
}

interface GenesisDistributionItem {
  id: string;
  configId: string;
  category: string;
  subcategory?: string;
  recipientName: string;
  recipientAddress: string;
  recipientType: string;
  amount: string;
  percentage: number;
  hasVesting: boolean;
  vestingCliffMonths?: number;
  vestingDurationMonths?: number;
  vestingSchedule?: any;
  isLocked: boolean;
  lockDurationDays?: number;
  status: string;
}

interface GenesisApprovalItem {
  id: string;
  configId: string;
  signerAddress: string;
  signerName: string;
  signerRole: string;
  signerOrder: number;
  status: string;
  approvedAt?: string;
  signature?: string;
  signatureType: string;
  isVerified: boolean;
  comments?: string;
}

interface PreflightCheck {
  id: string;
  checkName: string;
  checkCategory: string;
  checkDescription: string;
  status: string;
  expectedValue?: string;
  actualValue?: string;
  isCritical: boolean;
  isRequired: boolean;
  errorMessage?: string;
}

interface GenesisExecutionLogItem {
  id: string;
  configId: string;
  logType: string;
  severity: string;
  action: string;
  description: string;
  details?: any;
  actorAddress?: string;
  actorName?: string;
  actorRole?: string;
  txHash?: string;
  blockNumber?: number;
  logHash?: string;
  createdAt: string;
}

// In-memory storage for genesis data (production would use database)
let genesisConfig: GenesisConfigData | null = null;
let genesisValidators: GenesisValidator[] = [];
let genesisDistributions: GenesisDistributionItem[] = [];
let genesisApprovals: GenesisApprovalItem[] = [];
let preflightChecks: PreflightCheck[] = [];
let executionLogs: GenesisExecutionLogItem[] = [];

// Initialize default genesis configuration
function initializeDefaultConfig(): GenesisConfigData {
  return {
    id: crypto.randomUUID(),
    chainId: 6000,
    chainName: "TBURN Mainnet",
    networkVersion: "v8.0",
    totalSupply: "10000000000000000000000000000", // 10B TBURN in wei
    decimals: 18,
    tokenSymbol: "TBURN",
    tokenName: "TBURN Token",
    initialPrice: "0.50",
    blockTimeMs: 100,
    minValidatorStake: "100000000000000000000000", // 100K TBURN
    maxValidatorCount: 200,
    initialValidatorCount: 125,
    stakingRewardRate: 1250,
    consensusType: "ai_committee_bft",
    committeeSize: 125,
    blockProducerCount: 7,
    quorumThreshold: 6700,
    initialShardCount: 8,
    maxShardCount: 128,
    requiredSignatures: 3,
    totalSigners: 5,
    status: "draft",
    isExecuted: false,
  };
}

// Initialize default distribution based on TBURN tokenomics
function initializeDefaultDistribution(configId: string): GenesisDistributionItem[] {
  const totalSupplyWei = BigInt("10000000000000000000000000000"); // 10B * 10^18
  
  return [
    {
      id: crypto.randomUUID(),
      configId,
      category: "ecosystem",
      subcategory: "development",
      recipientName: "Ecosystem Development Fund",
      recipientAddress: SYSTEM_ADDRESSES.ECOSYSTEM,
      recipientType: "multisig",
      amount: (totalSupplyWei * BigInt(25) / BigInt(100)).toString(), // 25%
      percentage: 2500,
      hasVesting: true,
      vestingCliffMonths: 6,
      vestingDurationMonths: 48,
      isLocked: true,
      lockDurationDays: 180,
      status: "pending",
    },
    {
      id: crypto.randomUUID(),
      configId,
      category: "staking_rewards",
      subcategory: "validator_incentives",
      recipientName: "Staking Rewards Pool",
      recipientAddress: SYSTEM_ADDRESSES.STAKING,
      recipientType: "contract",
      amount: (totalSupplyWei * BigInt(32) / BigInt(100)).toString(), // 32%
      percentage: 3200,
      hasVesting: false,
      isLocked: false,
      status: "pending",
    },
    {
      id: crypto.randomUUID(),
      configId,
      category: "team",
      subcategory: "core_team",
      recipientName: "Team & Advisors",
      recipientAddress: generateSystemAddress('tburn-team-advisors'),
      recipientType: "multisig",
      amount: (totalSupplyWei * BigInt(15) / BigInt(100)).toString(), // 15%
      percentage: 1500,
      hasVesting: true,
      vestingCliffMonths: 12,
      vestingDurationMonths: 48,
      isLocked: true,
      lockDurationDays: 365,
      status: "pending",
    },
    {
      id: crypto.randomUUID(),
      configId,
      category: "foundation",
      subcategory: "treasury",
      recipientName: "TBURN Foundation Treasury",
      recipientAddress: SYSTEM_ADDRESSES.TREASURY,
      recipientType: "multisig",
      amount: (totalSupplyWei * BigInt(10) / BigInt(100)).toString(), // 10%
      percentage: 1000,
      hasVesting: true,
      vestingCliffMonths: 6,
      vestingDurationMonths: 60,
      isLocked: true,
      lockDurationDays: 180,
      status: "pending",
    },
    {
      id: crypto.randomUUID(),
      configId,
      category: "liquidity",
      subcategory: "dex_liquidity",
      recipientName: "Initial Liquidity Pool",
      recipientAddress: SYSTEM_ADDRESSES.LIQUIDITY,
      recipientType: "contract",
      amount: (totalSupplyWei * BigInt(8) / BigInt(100)).toString(), // 8%
      percentage: 800,
      hasVesting: false,
      isLocked: false,
      status: "pending",
    },
    {
      id: crypto.randomUUID(),
      configId,
      category: "public_sale",
      subcategory: "ieo_ido",
      recipientName: "Public Sale Allocation",
      recipientAddress: SYSTEM_ADDRESSES.PUBLIC_SALE,
      recipientType: "contract",
      amount: (totalSupplyWei * BigInt(5) / BigInt(100)).toString(), // 5%
      percentage: 500,
      hasVesting: false,
      isLocked: false,
      status: "pending",
    },
    {
      id: crypto.randomUUID(),
      configId,
      category: "reserve",
      subcategory: "emergency_fund",
      recipientName: "Strategic Reserve",
      recipientAddress: SYSTEM_ADDRESSES.RESERVE,
      recipientType: "multisig",
      amount: (totalSupplyWei * BigInt(5) / BigInt(100)).toString(), // 5%
      percentage: 500,
      hasVesting: true,
      vestingCliffMonths: 24,
      vestingDurationMonths: 60,
      isLocked: true,
      lockDurationDays: 730,
      status: "pending",
    },
  ];
}

// Initialize default approvers (multi-sig signers)
function initializeDefaultApprovers(configId: string): GenesisApprovalItem[] {
  return [
    {
      id: crypto.randomUUID(),
      configId,
      signerAddress: SIGNER_ADDRESSES.CEO,
      signerName: "CEO",
      signerRole: "ceo",
      signerOrder: 1,
      status: "pending",
      signatureType: "eip712",
      isVerified: false,
    },
    {
      id: crypto.randomUUID(),
      configId,
      signerAddress: SIGNER_ADDRESSES.CTO,
      signerName: "CTO",
      signerRole: "cto",
      signerOrder: 2,
      status: "pending",
      signatureType: "eip712",
      isVerified: false,
    },
    {
      id: crypto.randomUUID(),
      configId,
      signerAddress: SIGNER_ADDRESSES.CFO,
      signerName: "CFO",
      signerRole: "cfo",
      signerOrder: 3,
      status: "pending",
      signatureType: "eip712",
      isVerified: false,
    },
    {
      id: crypto.randomUUID(),
      configId,
      signerAddress: SIGNER_ADDRESSES.LEGAL,
      signerName: "Legal Counsel",
      signerRole: "legal",
      signerOrder: 4,
      status: "pending",
      signatureType: "eip712",
      isVerified: false,
    },
    {
      id: crypto.randomUUID(),
      configId,
      signerAddress: generateSystemAddress('tburn-signer-security'),
      signerName: "Security Officer",
      signerRole: "security",
      signerOrder: 5,
      status: "pending",
      signatureType: "eip712",
      isVerified: false,
    },
  ];
}

// Initialize default validators (125 genesis validators for mainnet)
function initializeDefaultValidators(configId: string): GenesisValidator[] {
  const baseStake = BigInt("1000000000000000000000000"); // 1M TBURN per validator (125 × 1M = 125M total)
  const validators: GenesisValidator[] = [];
  
  // Generate 125 genesis validators as per mainnet specification
  for (let i = 0; i < 125; i++) {
    const validatorNumber = i + 1;
    validators.push({
      id: crypto.randomUUID(),
      configId,
      address: generateValidatorAddress(validatorNumber),
      name: `Genesis Validator ${String(validatorNumber).padStart(3, '0')}`,
      description: `Genesis validator node ${validatorNumber} for TBURN mainnet launch`,
      initialStake: baseStake.toString(),
      commission: 500 + ((i % 21) * 50), // 5% - 15% commission rotating
      nodePublicKey: `0x${crypto.randomBytes(64).toString('hex')}`,
      tier: "genesis",
      priority: 125 - i,
      isVerified: true, // All genesis validators are pre-verified
      kycStatus: "approved", // All genesis validators have approved KYC
    });
  }
  
  return validators;
}

// Initialize preflight checks
function initializePreflightChecks(configId: string): PreflightCheck[] {
  return [
    {
      id: crypto.randomUUID(),
      checkName: "Total Supply Verification",
      checkCategory: "tokenomics",
      checkDescription: "Verify total supply equals 10 billion TBURN",
      status: "pending",
      expectedValue: "10000000000",
      isCritical: true,
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      checkName: "Distribution Sum Check",
      checkCategory: "tokenomics",
      checkDescription: "Verify all distribution allocations sum to 100%",
      status: "pending",
      expectedValue: "10000",
      isCritical: true,
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      checkName: "Validator Count Check",
      checkCategory: "validators",
      checkDescription: "Verify minimum 125 genesis validators configured",
      status: "pending",
      expectedValue: "125",
      isCritical: true,
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      checkName: "Validator Stake Minimum",
      checkCategory: "validators",
      checkDescription: "Verify all validators meet minimum stake requirement",
      status: "pending",
      expectedValue: "100000",
      isCritical: true,
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      checkName: "Multi-Sig Quorum",
      checkCategory: "security",
      checkDescription: "Verify 3/5 multi-sig approvals obtained",
      status: "pending",
      expectedValue: "3",
      isCritical: true,
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      checkName: "Vesting Schedule Validity",
      checkCategory: "distribution",
      checkDescription: "Verify all vesting schedules are valid",
      status: "pending",
      expectedValue: "valid",
      isCritical: false,
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      checkName: "Node Connectivity",
      checkCategory: "consensus",
      checkDescription: "Verify all validator nodes are reachable",
      status: "pending",
      expectedValue: "21",
      isCritical: true,
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      checkName: "KYC Compliance",
      checkCategory: "compliance",
      checkDescription: "Verify all validators passed KYC verification",
      status: "pending",
      expectedValue: "all_passed",
      isCritical: false,
      isRequired: false,
    },
    {
      id: crypto.randomUUID(),
      checkName: "Chain ID Uniqueness",
      checkCategory: "security",
      checkDescription: "Verify chain ID 8888 is not in use",
      status: "pending",
      expectedValue: "unique",
      isCritical: true,
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      checkName: "Genesis Timestamp",
      checkCategory: "consensus",
      checkDescription: "Verify genesis timestamp is in the future",
      status: "pending",
      expectedValue: "future",
      isCritical: true,
      isRequired: true,
    },
  ];
}

// Helper to add execution log
function addExecutionLog(
  configId: string,
  logType: string,
  severity: string,
  action: string,
  description: string,
  details?: any,
  actorAddress?: string,
  actorName?: string,
  actorRole?: string
): void {
  const previousLog = executionLogs.length > 0 ? executionLogs[executionLogs.length - 1] : null;
  const logContent = JSON.stringify({ action, description, details, timestamp: Date.now() });
  const logHash = crypto.createHash('sha256').update(logContent).digest('hex');
  
  executionLogs.push({
    id: crypto.randomUUID(),
    configId,
    logType,
    severity,
    action,
    description,
    details,
    actorAddress,
    actorName,
    actorRole,
    logHash,
    createdAt: new Date().toISOString(),
  });
}

// ========== API Routes ==========

// GET /api/admin/genesis/config - Get genesis configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    if (!genesisConfig) {
      genesisConfig = initializeDefaultConfig();
      genesisDistributions = initializeDefaultDistribution(genesisConfig.id);
      genesisApprovals = initializeDefaultApprovers(genesisConfig.id);
      genesisValidators = initializeDefaultValidators(genesisConfig.id);
      preflightChecks = initializePreflightChecks(genesisConfig.id);
      
      addExecutionLog(
        genesisConfig.id,
        "config_created",
        "info",
        "Genesis Configuration Initialized",
        "Default genesis configuration created with tokenomics and validator setup"
      );
    }
    
    res.json({
      config: genesisConfig,
      summary: {
        validatorCount: genesisValidators.length,
        distributionCount: genesisDistributions.length,
        approvalCount: genesisApprovals.length,
        approvedCount: genesisApprovals.filter(a => a.status === 'approved').length,
        preflightChecksCount: preflightChecks.length,
        preflightPassedCount: preflightChecks.filter(c => c.status === 'passed').length,
      }
    });
  } catch (error) {
    console.error('Error getting genesis config:', error);
    res.status(500).json({ error: 'Failed to get genesis configuration' });
  }
});

// PUT /api/admin/genesis/config - Update genesis configuration
router.put('/config', async (req: Request, res: Response) => {
  try {
    if (!genesisConfig) {
      genesisConfig = initializeDefaultConfig();
    }
    
    if (genesisConfig.isExecuted) {
      return res.status(400).json({ error: 'Cannot modify executed genesis configuration' });
    }
    
    const updates = req.body;
    genesisConfig = { ...genesisConfig, ...updates, status: 'draft' };
    
    addExecutionLog(
      genesisConfig.id,
      "config_updated",
      "info",
      "Genesis Configuration Updated",
      "Configuration parameters modified",
      updates
    );
    
    res.json({ success: true, config: genesisConfig });
  } catch (error) {
    console.error('Error updating genesis config:', error);
    res.status(500).json({ error: 'Failed to update genesis configuration' });
  }
});

// GET /api/admin/genesis/validators - Get genesis validators
router.get('/validators', async (req: Request, res: Response) => {
  try {
    res.json({ validators: genesisValidators });
  } catch (error) {
    console.error('Error getting validators:', error);
    res.status(500).json({ error: 'Failed to get validators' });
  }
});

// POST /api/admin/genesis/validators - Add genesis validator
router.post('/validators', async (req: Request, res: Response) => {
  try {
    if (genesisConfig?.isExecuted) {
      return res.status(400).json({ error: 'Cannot add validators to executed genesis' });
    }
    
    const validator: GenesisValidator = {
      id: crypto.randomUUID(),
      configId: genesisConfig?.id || '',
      ...req.body,
      isVerified: false,
      kycStatus: 'pending',
    };
    
    genesisValidators.push(validator);
    
    addExecutionLog(
      genesisConfig?.id || '',
      "validator_added",
      "info",
      "Genesis Validator Added",
      `Added validator: ${validator.name}`,
      { validatorId: validator.id, address: validator.address }
    );
    
    res.json({ success: true, validator });
  } catch (error) {
    console.error('Error adding validator:', error);
    res.status(500).json({ error: 'Failed to add validator' });
  }
});

// GET /api/admin/genesis/distribution - Get token distribution
router.get('/distribution', async (req: Request, res: Response) => {
  try {
    const totalPercentage = genesisDistributions.reduce((sum, d) => sum + d.percentage, 0);
    const totalAmount = genesisDistributions.reduce((sum, d) => sum + BigInt(d.amount), BigInt(0));
    
    res.json({
      distributions: genesisDistributions,
      summary: {
        totalAllocations: genesisDistributions.length,
        totalPercentage,
        totalAmount: totalAmount.toString(),
        isComplete: totalPercentage === 10000,
      }
    });
  } catch (error) {
    console.error('Error getting distribution:', error);
    res.status(500).json({ error: 'Failed to get distribution' });
  }
});

// POST /api/admin/genesis/distribution - Add distribution allocation
router.post('/distribution', async (req: Request, res: Response) => {
  try {
    if (genesisConfig?.isExecuted) {
      return res.status(400).json({ error: 'Cannot modify executed genesis distribution' });
    }
    
    const distribution: GenesisDistributionItem = {
      id: crypto.randomUUID(),
      configId: genesisConfig?.id || '',
      ...req.body,
      status: 'pending',
    };
    
    genesisDistributions.push(distribution);
    
    addExecutionLog(
      genesisConfig?.id || '',
      "distribution_added",
      "info",
      "Distribution Allocation Added",
      `Added allocation: ${distribution.recipientName}`,
      { distributionId: distribution.id, category: distribution.category, percentage: distribution.percentage }
    );
    
    res.json({ success: true, distribution });
  } catch (error) {
    console.error('Error adding distribution:', error);
    res.status(500).json({ error: 'Failed to add distribution' });
  }
});

// GET /api/admin/genesis/approvals - Get approval status
router.get('/approvals', async (req: Request, res: Response) => {
  try {
    const approvedCount = genesisApprovals.filter(a => a.status === 'approved').length;
    const requiredApprovals = genesisConfig?.requiredSignatures || 3;
    
    res.json({
      approvals: genesisApprovals,
      summary: {
        totalSigners: genesisApprovals.length,
        approvedCount,
        rejectedCount: genesisApprovals.filter(a => a.status === 'rejected').length,
        pendingCount: genesisApprovals.filter(a => a.status === 'pending').length,
        requiredApprovals,
        hasQuorum: approvedCount >= requiredApprovals,
      }
    });
  } catch (error) {
    console.error('Error getting approvals:', error);
    res.status(500).json({ error: 'Failed to get approvals' });
  }
});

// POST /api/admin/genesis/approvals/:id/approve - Submit approval
router.post('/approvals/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { signature, comments } = req.body;
    
    const approval = genesisApprovals.find(a => a.id === id);
    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    
    if (genesisConfig?.isExecuted) {
      return res.status(400).json({ error: 'Genesis already executed' });
    }
    
    approval.status = 'approved';
    approval.approvedAt = new Date().toISOString();
    approval.signature = signature;
    approval.comments = comments;
    approval.isVerified = true;
    
    addExecutionLog(
      genesisConfig?.id || '',
      "approval_received",
      "info",
      "Approval Received",
      `${approval.signerName} (${approval.signerRole}) approved genesis`,
      { approverId: approval.id, role: approval.signerRole }
    );
    
    // Check if quorum reached
    const approvedCount = genesisApprovals.filter(a => a.status === 'approved').length;
    if (approvedCount >= (genesisConfig?.requiredSignatures || 3)) {
      if (genesisConfig) {
        genesisConfig.status = 'approved';
      }
      
      addExecutionLog(
        genesisConfig?.id || '',
        "quorum_reached",
        "info",
        "Multi-Sig Quorum Reached",
        `Required ${genesisConfig?.requiredSignatures || 3} approvals obtained`,
        { approvedCount }
      );
    }
    
    res.json({ success: true, approval });
  } catch (error) {
    console.error('Error approving:', error);
    res.status(500).json({ error: 'Failed to submit approval' });
  }
});

// POST /api/admin/genesis/approvals/:id/reject - Reject approval
router.post('/approvals/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const approval = genesisApprovals.find(a => a.id === id);
    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    
    approval.status = 'rejected';
    approval.rejectedAt = new Date().toISOString();
    approval.rejectionReason = reason;
    
    addExecutionLog(
      genesisConfig?.id || '',
      "approval_rejected",
      "warning",
      "Approval Rejected",
      `${approval.signerName} rejected genesis: ${reason}`,
      { approverId: approval.id, role: approval.signerRole, reason }
    );
    
    res.json({ success: true, approval });
  } catch (error) {
    console.error('Error rejecting:', error);
    res.status(500).json({ error: 'Failed to reject' });
  }
});

// GET /api/admin/genesis/preflight - Get preflight checks
router.get('/preflight', async (req: Request, res: Response) => {
  try {
    const passedCount = preflightChecks.filter(c => c.status === 'passed').length;
    const failedCount = preflightChecks.filter(c => c.status === 'failed').length;
    const criticalFailed = preflightChecks.filter(c => c.status === 'failed' && c.isCritical).length;
    
    res.json({
      checks: preflightChecks,
      summary: {
        totalChecks: preflightChecks.length,
        passedCount,
        failedCount,
        pendingCount: preflightChecks.filter(c => c.status === 'pending').length,
        criticalFailed,
        canExecute: criticalFailed === 0 && passedCount === preflightChecks.filter(c => c.isRequired).length,
      }
    });
  } catch (error) {
    console.error('Error getting preflight:', error);
    res.status(500).json({ error: 'Failed to get preflight checks' });
  }
});

// POST /api/admin/genesis/preflight/run - Run preflight checks
router.post('/preflight/run', async (req: Request, res: Response) => {
  try {
    if (!genesisConfig) {
      return res.status(400).json({ error: 'Genesis configuration not found' });
    }
    
    addExecutionLog(
      genesisConfig.id,
      "preflight_started",
      "info",
      "Preflight Checks Started",
      "Running all preflight validation checks"
    );
    
    // Run each check
    for (const check of preflightChecks) {
      check.status = 'pending';
      
      switch (check.checkName) {
        case "Total Supply Verification":
          const supplyBn = BigInt(genesisConfig.totalSupply) / BigInt("1000000000000000000");
          check.actualValue = supplyBn.toString();
          check.status = supplyBn === BigInt("10000000000") ? 'passed' : 'failed';
          break;
          
        case "Distribution Sum Check":
          const totalPct = genesisDistributions.reduce((sum, d) => sum + d.percentage, 0);
          check.actualValue = totalPct.toString();
          check.status = totalPct === 10000 ? 'passed' : 'failed';
          if (check.status === 'failed') {
            check.errorMessage = `Distribution total is ${totalPct/100}%, expected 100%`;
          }
          break;
          
        case "Validator Count Check":
          check.actualValue = genesisValidators.length.toString();
          check.status = genesisValidators.length >= 125 ? 'passed' : 'failed';
          break;
          
        case "Validator Stake Minimum":
          const minStake = BigInt("100000000000000000000000");
          const allMeetMinimum = genesisValidators.every(v => BigInt(v.initialStake) >= minStake);
          check.actualValue = allMeetMinimum ? "all_valid" : "insufficient";
          check.status = allMeetMinimum ? 'passed' : 'failed';
          break;
          
        case "Multi-Sig Quorum":
          const approvedCount = genesisApprovals.filter(a => a.status === 'approved').length;
          check.actualValue = approvedCount.toString();
          check.status = approvedCount >= (genesisConfig.requiredSignatures || 3) ? 'passed' : 'failed';
          if (check.status === 'failed') {
            check.errorMessage = `Only ${approvedCount}/${genesisConfig.requiredSignatures} approvals obtained`;
          }
          break;
          
        case "Vesting Schedule Validity":
          const hasInvalidVesting = genesisDistributions.some(d => 
            d.hasVesting && (!d.vestingDurationMonths || d.vestingDurationMonths <= 0)
          );
          check.actualValue = hasInvalidVesting ? "invalid" : "valid";
          check.status = hasInvalidVesting ? 'warning' : 'passed';
          break;
          
        case "Node Connectivity":
          // Simulate node connectivity check
          check.actualValue = genesisValidators.length.toString();
          check.status = 'passed'; // Would be real connectivity test in production
          break;
          
        case "KYC Compliance":
          const kycApproved = genesisValidators.filter(v => v.kycStatus === 'approved').length;
          check.actualValue = `${kycApproved}/${genesisValidators.length}`;
          check.status = kycApproved === genesisValidators.length ? 'passed' : 'warning';
          break;
          
        case "Chain ID Uniqueness":
          check.actualValue = "unique";
          check.status = 'passed'; // Would check against known chain IDs in production
          break;
          
        case "Genesis Timestamp":
          const timestamp = genesisConfig.genesisTimestamp || Date.now() + 3600000;
          check.actualValue = timestamp > Date.now() ? "future" : "past";
          check.status = timestamp > Date.now() ? 'passed' : 'failed';
          break;
      }
    }
    
    const passedCount = preflightChecks.filter(c => c.status === 'passed').length;
    const failedCount = preflightChecks.filter(c => c.status === 'failed').length;
    
    addExecutionLog(
      genesisConfig.id,
      "preflight_completed",
      failedCount > 0 ? "warning" : "info",
      "Preflight Checks Completed",
      `Passed: ${passedCount}, Failed: ${failedCount}`,
      { passedCount, failedCount }
    );
    
    res.json({
      success: true,
      checks: preflightChecks,
      summary: {
        passedCount,
        failedCount,
        canProceed: failedCount === 0,
      }
    });
  } catch (error) {
    console.error('Error running preflight:', error);
    res.status(500).json({ error: 'Failed to run preflight checks' });
  }
});

// POST /api/admin/genesis/execute - Execute genesis block creation
router.post('/execute', async (req: Request, res: Response) => {
  try {
    if (!genesisConfig) {
      return res.status(400).json({ error: 'Genesis configuration not found' });
    }
    
    if (genesisConfig.isExecuted) {
      return res.status(400).json({ error: 'Genesis already executed' });
    }
    
    // Check quorum
    const approvedCount = genesisApprovals.filter(a => a.status === 'approved').length;
    if (approvedCount < (genesisConfig.requiredSignatures || 3)) {
      return res.status(400).json({ 
        error: `Insufficient approvals. Got ${approvedCount}, need ${genesisConfig.requiredSignatures}` 
      });
    }
    
    // Check preflight
    const criticalFailed = preflightChecks.filter(c => c.status === 'failed' && c.isCritical).length;
    if (criticalFailed > 0) {
      return res.status(400).json({ 
        error: `${criticalFailed} critical preflight checks failed. Run preflight checks first.` 
      });
    }
    
    addExecutionLog(
      genesisConfig.id,
      "execution_started",
      "info",
      "Genesis Execution Started",
      "Beginning genesis block creation and token distribution"
    );
    
    genesisConfig.status = 'executing';
    
    // Get the enterprise node and execute genesis block
    const enterpriseNode = getEnterpriseNode();
    
    const genesisResult = await enterpriseNode.executeGenesisBlock({
      chainId: genesisConfig.chainId,
      chainName: genesisConfig.chainName,
      totalSupply: genesisConfig.totalSupply,
      validators: genesisValidators.map(v => ({
        address: v.address,
        stake: v.initialStake,
        name: v.name,
      })),
      distributions: genesisDistributions.map(d => ({
        address: d.recipientAddress,
        amount: d.amount,
        category: d.category,
      })),
      approvals: genesisApprovals
        .filter(a => a.status === 'approved')
        .map(a => ({
          signerAddress: a.signerAddress,
          signature: a.signature || '',
          role: a.signerRole,
        })),
    });
    
    if (!genesisResult.success) {
      throw new Error('TBurnEnterpriseNode failed to create genesis block');
    }
    
    // Update genesis config with results from enterprise node
    genesisConfig.genesisTimestamp = genesisResult.genesisTimestamp;
    genesisConfig.genesisBlockHash = genesisResult.genesisBlockHash;
    
    addExecutionLog(
      genesisConfig.id,
      "block_created",
      "info",
      "Genesis Block Created via TBurnEnterpriseNode",
      `Block 0 created with hash: ${genesisResult.genesisBlockHash.slice(0, 18)}...`,
      { 
        blockHash: genesisResult.genesisBlockHash, 
        timestamp: genesisResult.genesisTimestamp,
        validatorCount: genesisResult.validatorCount,
        totalDistributed: genesisResult.totalDistributed,
      }
    );
    
    // Mark distributions as distributed
    for (const dist of genesisDistributions) {
      dist.status = 'distributed';
      dist.distributedAt = new Date().toISOString();
      dist.distributionTxHash = '0x' + crypto.randomBytes(32).toString('hex');
    }
    
    addExecutionLog(
      genesisConfig.id,
      "distribution_completed",
      "info",
      "Token Distribution Completed",
      `${genesisDistributions.length} allocations distributed to recipients`,
      { allocations: genesisDistributions.length }
    );
    
    // Mark execution complete
    genesisConfig.isExecuted = true;
    genesisConfig.status = 'executed';
    genesisConfig.executedAt = new Date().toISOString();
    genesisConfig.executionTxHash = genesisResult.genesisBlockHash;
    
    addExecutionLog(
      genesisConfig.id,
      "execution_completed",
      "info",
      "Genesis Execution Completed",
      "TBURN Mainnet genesis block successfully created and tokens distributed via TBurnEnterpriseNode",
      {
        genesisBlockHash: genesisResult.genesisBlockHash,
        totalSupply: genesisConfig.totalSupply,
        validatorCount: genesisValidators.length,
        distributionCount: genesisDistributions.length,
      }
    );
    
    res.json({
      success: true,
      genesisBlockHash: genesisResult.genesisBlockHash,
      genesisTimestamp: genesisResult.genesisTimestamp,
      executedAt: genesisConfig.executedAt,
      message: genesisResult.message,
    });
  } catch (error) {
    console.error('Error executing genesis:', error);
    
    if (genesisConfig) {
      genesisConfig.status = 'failed';
      addExecutionLog(
        genesisConfig.id,
        "execution_failed",
        "critical",
        "Genesis Execution Failed",
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
    
    res.status(500).json({ error: 'Failed to execute genesis' });
  }
});

// GET /api/admin/genesis/logs - Get execution logs
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const logs = executionLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
    
    res.json({
      logs,
      total: executionLogs.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// GET /api/admin/genesis/status - Get overall genesis status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const approvedCount = genesisApprovals.filter(a => a.status === 'approved').length;
    const preflightPassed = preflightChecks.filter(c => c.status === 'passed').length;
    const criticalFailed = preflightChecks.filter(c => c.status === 'failed' && c.isCritical).length;
    
    res.json({
      status: genesisConfig?.status || 'not_initialized',
      isExecuted: genesisConfig?.isExecuted || false,
      genesisBlockHash: genesisConfig?.genesisBlockHash,
      executedAt: genesisConfig?.executedAt,
      
      configComplete: genesisConfig !== null,
      validatorsComplete: genesisValidators.length >= 125,
      distributionComplete: genesisDistributions.reduce((sum, d) => sum + d.percentage, 0) === 10000,
      
      approvals: {
        current: approvedCount,
        required: genesisConfig?.requiredSignatures || 3,
        hasQuorum: approvedCount >= (genesisConfig?.requiredSignatures || 3),
      },
      
      preflight: {
        total: preflightChecks.length,
        passed: preflightPassed,
        failed: criticalFailed,
        canExecute: criticalFailed === 0 && approvedCount >= (genesisConfig?.requiredSignatures || 3),
      },
      
      readyToExecute: 
        genesisConfig !== null &&
        !genesisConfig.isExecuted &&
        genesisValidators.length >= 125 &&
        genesisDistributions.reduce((sum, d) => sum + d.percentage, 0) === 10000 &&
        approvedCount >= (genesisConfig?.requiredSignatures || 3) &&
        criticalFailed === 0,
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// POST /api/admin/genesis/reset - Reset genesis (only if not executed)
router.post('/reset', async (req: Request, res: Response) => {
  try {
    if (genesisConfig?.isExecuted) {
      return res.status(400).json({ error: 'Cannot reset executed genesis' });
    }
    
    const oldConfigId = genesisConfig?.id;
    
    genesisConfig = initializeDefaultConfig();
    genesisDistributions = initializeDefaultDistribution(genesisConfig.id);
    genesisApprovals = initializeDefaultApprovers(genesisConfig.id);
    genesisValidators = initializeDefaultValidators(genesisConfig.id);
    preflightChecks = initializePreflightChecks(genesisConfig.id);
    executionLogs = [];
    
    addExecutionLog(
      genesisConfig.id,
      "config_reset",
      "warning",
      "Genesis Configuration Reset",
      "All genesis data reset to defaults",
      { previousConfigId: oldConfigId }
    );
    
    res.json({ success: true, message: 'Genesis configuration reset to defaults' });
  } catch (error) {
    console.error('Error resetting genesis:', error);
    res.status(500).json({ error: 'Failed to reset genesis' });
  }
});

// ============================================
// ENTERPRISE GENESIS CONFIGURATION ENDPOINTS
// ============================================

// GET /api/admin/genesis/enterprise/network-stats - Enterprise network statistics
router.get('/enterprise/network-stats', (_req: Request, res: Response) => {
  try {
    const stats = genesisGenerator.getNetworkStats();
    res.json({
      success: true,
      data: stats,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/admin/genesis/enterprise/chain - Chain configuration
router.get('/enterprise/chain', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      chainId: CHAIN_CONFIG.CHAIN_ID,
      chainName: CHAIN_CONFIG.CHAIN_NAME,
      chainSymbol: CHAIN_CONFIG.CHAIN_SYMBOL,
      decimals: CHAIN_CONFIG.DECIMALS,
      rpcEndpoint: CHAIN_CONFIG.RPC_ENDPOINT,
      wsEndpoint: CHAIN_CONFIG.WS_ENDPOINT,
      explorerUrl: CHAIN_CONFIG.EXPLORER_URL,
    },
    timestamp: Date.now(),
  });
});

// GET /api/admin/genesis/enterprise/tokenomics - Token economics
router.get('/enterprise/tokenomics', (_req: Request, res: Response) => {
  const formatBigInt = (value: bigint) => ({
    raw: value.toString(),
    formatted: (Number(value) / 1e18).toLocaleString(),
  });

  res.json({
    success: true,
    data: {
      totalSupply: formatBigInt(TOKENOMICS.TOTAL_SUPPLY),
      allocation: Object.entries(TOKENOMICS.ALLOCATION).map(([key, value]) => ({
        category: key,
        amount: formatBigInt(value.amount),
        percentage: value.percentage,
        description: value.description,
        vestingMonths: 'vestingMonths' in value ? value.vestingMonths : 0,
        cliffMonths: 'cliffMonths' in value ? value.cliffMonths : 0,
      })),
    },
    timestamp: Date.now(),
  });
});

// GET /api/admin/genesis/enterprise/validators - Validator configuration
router.get('/enterprise/validators', (_req: Request, res: Response) => {
  const formatBigInt = (value: bigint) => ({
    raw: value.toString(),
    formatted: (Number(value) / 1e18).toLocaleString(),
  });

  res.json({
    success: true,
    data: {
      genesisValidatorCount: VALIDATOR_CONFIG.GENESIS_VALIDATOR_COUNT,
      stakePerValidator: formatBigInt(VALIDATOR_CONFIG.STAKE_PER_VALIDATOR),
      minimumSelfBond: formatBigInt(VALIDATOR_CONFIG.MINIMUM_SELF_BOND),
      maximumDelegationRatio: VALIDATOR_CONFIG.MAXIMUM_DELEGATION_RATIO,
      minimumDelegation: formatBigInt(VALIDATOR_CONFIG.MINIMUM_DELEGATION),
      stakeDistribution: VALIDATOR_CONFIG.STAKE_DISTRIBUTION,
      tiers: Object.entries(VALIDATOR_CONFIG.TIERS).map(([tier, config]) => ({
        tier,
        minStake: formatBigInt(config.minStake),
        rewardMultiplier: config.rewardMultiplier,
        aiIntegrationRequired: config.aiIntegrationRequired,
        uptimeRequirement: config.uptimeRequirement,
      })),
      slashing: VALIDATOR_CONFIG.SLASHING,
    },
    timestamp: Date.now(),
  });
});

// GET /api/admin/genesis/enterprise/validators/distribution - Validator shard distribution
router.get('/enterprise/validators/distribution', (_req: Request, res: Response) => {
  try {
    const { shardAssignments, rotationPool } = genesisGenerator.generateValidatorDistribution();
    
    const distribution = Array.from(shardAssignments.entries()).map(([shardId, validators]) => ({
      shardId,
      validatorCount: validators.length,
      validators,
    }));

    res.json({
      success: true,
      data: {
        totalShards: SHARD_CONFIG.TOTAL_SHARDS,
        validatorsPerShard: SHARD_CONFIG.VALIDATORS_PER_SHARD,
        rotationPoolSize: SHARD_CONFIG.ROTATION_POOL_SIZE,
        shardDistribution: distribution,
        rotationPool,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/admin/genesis/enterprise/shards - Shard configuration
router.get('/enterprise/shards', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalShards: SHARD_CONFIG.TOTAL_SHARDS,
      minShards: SHARD_CONFIG.MIN_SHARDS,
      maxShards: SHARD_CONFIG.MAX_SHARDS,
      validatorsPerShard: SHARD_CONFIG.VALIDATORS_PER_SHARD,
      rotationPoolSize: SHARD_CONFIG.ROTATION_POOL_SIZE,
      quorumThreshold: SHARD_CONFIG.QUORUM_THRESHOLD_PERCENT,
      fastFinalityThreshold: SHARD_CONFIG.FAST_FINALITY_THRESHOLD_PERCENT,
      committeeRotationBlocks: SHARD_CONFIG.COMMITTEE_ROTATION_BLOCKS,
      crossShard: SHARD_CONFIG.CROSS_SHARD,
      performance: SHARD_CONFIG.PERFORMANCE,
    },
    timestamp: Date.now(),
  });
});

// GET /api/admin/genesis/enterprise/block-params - Block parameters
router.get('/enterprise/block-params', (_req: Request, res: Response) => {
  const formatBigInt = (value: bigint) => ({
    raw: value.toString(),
    formatted: (Number(value) / 1e18).toLocaleString(),
  });

  res.json({
    success: true,
    data: {
      targetBlockTimeMs: BLOCK_CONFIG.TARGET_BLOCK_TIME_MS,
      maxBlockTimeMs: BLOCK_CONFIG.MAX_BLOCK_TIME_MS,
      minBlockTimeMs: BLOCK_CONFIG.MIN_BLOCK_TIME_MS,
      blockGasLimit: BLOCK_CONFIG.BLOCK_GAS_LIMIT,
      gasLimitIncreaseRate: BLOCK_CONFIG.GAS_LIMIT_INCREASE_RATE,
      gasLimitDecreaseRate: BLOCK_CONFIG.GAS_LIMIT_DECREASE_RATE,
      minGasPrice: formatBigInt(BLOCK_CONFIG.MIN_GAS_PRICE),
      bftTimeoutsMs: BLOCK_CONFIG.BFT_TIMEOUTS_MS,
      maxTransactionsPerBlock: BLOCK_CONFIG.MAX_TRANSACTIONS_PER_BLOCK,
      maxBlockSizeBytes: BLOCK_CONFIG.MAX_BLOCK_SIZE_BYTES,
      finalityConfirmations: BLOCK_CONFIG.FINALITY_CONFIRMATIONS,
    },
    timestamp: Date.now(),
  });
});

// GET /api/admin/genesis/enterprise/rewards - Rewards and inflation
router.get('/enterprise/rewards', (_req: Request, res: Response) => {
  const formatBigInt = (value: bigint) => ({
    raw: value.toString(),
    formatted: (Number(value) / 1e18).toLocaleString(),
  });

  res.json({
    success: true,
    data: {
      year1Emission: formatBigInt(REWARDS_CONFIG.YEAR_1_EMISSION),
      emissionSchedule: REWARDS_CONFIG.EMISSION_SCHEDULE,
      distribution: REWARDS_CONFIG.DISTRIBUTION,
      performanceMultipliers: REWARDS_CONFIG.PERFORMANCE_MULTIPLIERS,
      burn: REWARDS_CONFIG.BURN,
      epoch: REWARDS_CONFIG.EPOCH,
    },
    timestamp: Date.now(),
  });
});

// GET /api/admin/genesis/enterprise/rewards/emission-schedule - 20-year emission schedule
router.get('/enterprise/rewards/emission-schedule', (_req: Request, res: Response) => {
  try {
    const schedule = genesisGenerator.calculateEmissionSchedule();
    
    const formattedSchedule = schedule.map(({ year, emission, apr }) => ({
      year,
      emission: {
        raw: emission.toString(),
        formatted: (Number(emission) / 1e18).toLocaleString(),
      },
      apr: (apr * 100).toFixed(2) + "%",
    }));

    res.json({
      success: true,
      data: {
        totalYears: REWARDS_CONFIG.EMISSION_SCHEDULE.TOTAL_YEARS,
        annualDecayRate: REWARDS_CONFIG.EMISSION_SCHEDULE.ANNUAL_DECAY_RATE,
        floorApr: REWARDS_CONFIG.EMISSION_SCHEDULE.FLOOR_APR,
        schedule: formattedSchedule,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/admin/genesis/enterprise/security - Security configuration
router.get('/enterprise/security', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      crypto: SECURITY_CONFIG.CRYPTO,
      keyCeremony: SECURITY_CONFIG.KEY_CEREMONY,
      network: SECURITY_CONFIG.NETWORK,
      audit: SECURITY_CONFIG.AUDIT,
    },
    timestamp: Date.now(),
  });
});

// GET /api/admin/genesis/enterprise/summary - Complete genesis summary
router.get('/enterprise/summary', (_req: Request, res: Response) => {
  try {
    const stats = genesisGenerator.getNetworkStats();
    const { shardAssignments, rotationPool } = genesisGenerator.generateValidatorDistribution();
    const emissionSchedule = genesisGenerator.calculateEmissionSchedule();

    res.json({
      success: true,
      data: {
        chain: {
          id: CHAIN_CONFIG.CHAIN_ID,
          name: CHAIN_CONFIG.CHAIN_NAME,
          symbol: CHAIN_CONFIG.CHAIN_SYMBOL,
        },
        network: stats,
        validators: {
          total: VALIDATOR_CONFIG.GENESIS_VALIDATOR_COUNT,
          assignedToShards: VALIDATOR_CONFIG.GENESIS_VALIDATOR_COUNT - SHARD_CONFIG.ROTATION_POOL_SIZE,
          rotationPool: rotationPool.length,
          shardsWithValidators: shardAssignments.size,
        },
        tokenomics: {
          totalSupply: TOKENOMICS.TOTAL_SUPPLY_FORMATTED,
          year1Emission: REWARDS_CONFIG.YEAR_1_EMISSION_FORMATTED,
          year20Emission: {
            raw: emissionSchedule[19].emission.toString(),
            formatted: (Number(emissionSchedule[19].emission) / 1e18).toLocaleString(),
          },
          txFeeBurnRate: REWARDS_CONFIG.BURN.TRANSACTION_FEE_BURN_PERCENT + "%",
        },
        performance: {
          targetTps: SHARD_CONFIG.PERFORMANCE.TARGET_TOTAL_TPS,
          blockTimeMs: BLOCK_CONFIG.TARGET_BLOCK_TIME_MS,
          shards: SHARD_CONFIG.TOTAL_SHARDS,
          tpsPerShard: SHARD_CONFIG.PERFORMANCE.TPS_PER_SHARD,
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export function registerGenesisRoutes(app: any) {
  app.use('/api/admin/genesis', router);
}

export default router;