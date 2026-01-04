/**
 * TBURN Enterprise Distribution Programs API Routes
 * Production-grade REST API for 8 token distribution programs
 */

import { Router, Request, Response } from "express";
import {
  distributionProgramsEngine,
  DistributionProgram,
  PROGRAM_CONFIGS,
  ClaimStatus,
} from "../core/genesis/enterprise-distribution-programs";

const router = Router();

// ============================================
// Engine Control Endpoints
// ============================================

router.post("/engine/start", async (req: Request, res: Response) => {
  try {
    distributionProgramsEngine.start();
    res.json({
      success: true,
      message: "Distribution programs engine started",
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post("/engine/stop", async (req: Request, res: Response) => {
  try {
    distributionProgramsEngine.stop();
    res.json({
      success: true,
      message: "Distribution programs engine stopped",
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get("/engine/status", async (req: Request, res: Response) => {
  try {
    const status = distributionProgramsEngine.getEngineStatus();
    res.json({
      success: true,
      data: status,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================
// Program Configuration Endpoints
// ============================================

router.get("/programs", async (req: Request, res: Response) => {
  try {
    const configs = distributionProgramsEngine.getAllProgramConfigs();
    const metrics = distributionProgramsEngine.getAllMetrics();
    
    const programs = Object.values(DistributionProgram).map(program => ({
      config: serializeConfig(configs[program]),
      metrics: serializeMetrics(metrics[program]),
    }));

    res.json({
      success: true,
      data: {
        programs,
        totalPrograms: programs.length,
        enabledPrograms: programs.filter(p => p.config.enabled).length,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get("/programs/:program", async (req: Request, res: Response) => {
  try {
    const program = req.params.program.toUpperCase() as DistributionProgram;
    
    if (!Object.values(DistributionProgram).includes(program)) {
      return res.status(400).json({
        success: false,
        error: `Invalid program: ${req.params.program}`,
        validPrograms: Object.values(DistributionProgram),
      });
    }

    const config = distributionProgramsEngine.getProgramConfig(program);
    const metrics = distributionProgramsEngine.getMetrics(program);

    res.json({
      success: true,
      data: {
        config: {
          ...config,
          totalAllocationWei: config.totalAllocationWei.toString(),
        },
        metrics: {
          ...metrics,
          totalDistributedWei: metrics.totalDistributedWei.toString(),
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post("/programs/:program/enable", async (req: Request, res: Response) => {
  try {
    const program = req.params.program.toUpperCase() as DistributionProgram;
    
    if (!Object.values(DistributionProgram).includes(program)) {
      return res.status(400).json({
        success: false,
        error: `Invalid program: ${req.params.program}`,
      });
    }

    distributionProgramsEngine.enableProgram(program);
    
    res.json({
      success: true,
      message: `Program ${program} enabled`,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post("/programs/:program/disable", async (req: Request, res: Response) => {
  try {
    const program = req.params.program.toUpperCase() as DistributionProgram;
    
    if (!Object.values(DistributionProgram).includes(program)) {
      return res.status(400).json({
        success: false,
        error: `Invalid program: ${req.params.program}`,
      });
    }

    distributionProgramsEngine.disableProgram(program);
    
    res.json({
      success: true,
      message: `Program ${program} disabled`,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post("/programs/:program/reset-circuit-breaker", async (req: Request, res: Response) => {
  try {
    const program = req.params.program.toUpperCase() as DistributionProgram;
    
    if (!Object.values(DistributionProgram).includes(program)) {
      return res.status(400).json({
        success: false,
        error: `Invalid program: ${req.params.program}`,
      });
    }

    distributionProgramsEngine.resetCircuitBreaker(program);
    
    res.json({
      success: true,
      message: `Circuit breaker reset for ${program}`,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================
// Metrics Endpoints
// ============================================

router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const allMetrics = distributionProgramsEngine.getAllMetrics();
    
    let totalDistributed = 0;
    let totalClaims = 0;
    let totalCompleted = 0;
    let totalPending = 0;
    let totalFailed = 0;

    for (const metrics of Object.values(allMetrics)) {
      totalDistributed += metrics.totalDistributed;
      totalClaims += metrics.totalClaims;
      totalCompleted += metrics.completedClaims;
      totalPending += metrics.pendingClaims;
      totalFailed += metrics.failedClaims;
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalDistributed,
          totalClaims,
          totalCompleted,
          totalPending,
          totalFailed,
          successRate: totalClaims > 0 ? (totalCompleted / totalClaims) * 100 : 100,
        },
        programMetrics: Object.entries(allMetrics).map(([program, metrics]) => ({
          program,
          ...serializeMetrics(metrics),
        })),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.get("/metrics/:program", async (req: Request, res: Response) => {
  try {
    const program = req.params.program.toUpperCase() as DistributionProgram;
    
    if (!Object.values(DistributionProgram).includes(program)) {
      return res.status(400).json({
        success: false,
        error: `Invalid program: ${req.params.program}`,
      });
    }

    const metrics = distributionProgramsEngine.getMetrics(program);
    const config = PROGRAM_CONFIGS[program];

    res.json({
      success: true,
      data: {
        ...metrics,
        totalDistributedWei: metrics.totalDistributedWei.toString(),
        totalAllocation: config.totalAllocation,
        totalAllocationFormatted: formatNumber(config.totalAllocation),
        remainingAllocationFormatted: formatNumber(metrics.remainingAllocation),
        totalDistributedFormatted: formatNumber(metrics.totalDistributed),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================
// Claim Submission Endpoints
// ============================================

router.post("/claims/submit", async (req: Request, res: Response) => {
  try {
    const { program, recipientAddress, amount, metadata } = req.body;
    
    if (!program || !recipientAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: program, recipientAddress, amount",
      });
    }

    const programEnum = program.toUpperCase() as DistributionProgram;
    if (!Object.values(DistributionProgram).includes(programEnum)) {
      return res.status(400).json({
        success: false,
        error: `Invalid program: ${program}`,
        validPrograms: Object.values(DistributionProgram),
      });
    }

    const claim = await distributionProgramsEngine.submitClaim(
      programEnum,
      recipientAddress,
      parseFloat(amount),
      metadata || {}
    );

    res.json({
      success: true,
      data: {
        claimId: claim.id,
        program: claim.program,
        recipientAddress: claim.recipientAddress,
        amount: claim.amountTBURN,
        amountWei: claim.amountWei.toString(),
        status: claim.status,
        eligibilityScore: claim.eligibilityScore,
        fraudScore: claim.fraudScore,
        approvalLevel: claim.approvalLevel,
        createdAt: claim.createdAt,
        expiresAt: claim.expiresAt,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post("/claims/:claimId/approve", async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;
    const { approverId, approverName, approverRole, approved, comments } = req.body;

    if (!approverId || !approverName || !approverRole || approved === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: approverId, approverName, approverRole, approved",
      });
    }

    const claim = await distributionProgramsEngine.approveClaim(
      claimId,
      approverId,
      approverName,
      approverRole,
      approved,
      comments
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: `Claim not found: ${claimId}`,
      });
    }

    res.json({
      success: true,
      data: {
        claimId: claim.id,
        status: claim.status,
        approvals: claim.approvals,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================
// Program-Specific Endpoints
// ============================================

// Airdrop Program
router.post("/airdrop/claim", async (req: Request, res: Response) => {
  try {
    const { recipientAddress, amount } = req.body;
    
    const claim = await distributionProgramsEngine.submitClaim(
      DistributionProgram.AIRDROP,
      recipientAddress,
      parseFloat(amount),
      {}
    );

    res.json({
      success: true,
      data: serializeClaim(claim),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Referral Program
router.post("/referral/claim", async (req: Request, res: Response) => {
  try {
    const { recipientAddress, amount, referrerAddress } = req.body;
    
    if (!referrerAddress) {
      return res.status(400).json({
        success: false,
        error: "Referrer address is required",
      });
    }

    const claim = await distributionProgramsEngine.submitClaim(
      DistributionProgram.REFERRAL,
      recipientAddress,
      parseFloat(amount),
      { referrerAddress }
    );

    res.json({
      success: true,
      data: serializeClaim(claim),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Events Program
router.post("/events/claim", async (req: Request, res: Response) => {
  try {
    const { recipientAddress, amount, eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: "Event ID is required",
      });
    }

    const claim = await distributionProgramsEngine.submitClaim(
      DistributionProgram.EVENTS,
      recipientAddress,
      parseFloat(amount),
      { eventId }
    );

    res.json({
      success: true,
      data: serializeClaim(claim),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Community Activity Program
router.post("/community/claim", async (req: Request, res: Response) => {
  try {
    const { recipientAddress, amount, activityType } = req.body;
    
    const claim = await distributionProgramsEngine.submitClaim(
      DistributionProgram.COMMUNITY_ACTIVITY,
      recipientAddress,
      parseFloat(amount),
      { activityType }
    );

    res.json({
      success: true,
      data: serializeClaim(claim),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// DAO Treasury Program
router.post("/dao/claim", async (req: Request, res: Response) => {
  try {
    const { recipientAddress, amount, proposalId } = req.body;
    
    if (!proposalId) {
      return res.status(400).json({
        success: false,
        error: "Proposal ID is required",
      });
    }

    const claim = await distributionProgramsEngine.submitClaim(
      DistributionProgram.DAO_TREASURY,
      recipientAddress,
      parseFloat(amount),
      { proposalId }
    );

    res.json({
      success: true,
      data: serializeClaim(claim),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Block Rewards Program
router.post("/block-rewards/distribute", async (req: Request, res: Response) => {
  try {
    const { validatorAddress, amount, blockNumber } = req.body;
    
    if (!validatorAddress || !blockNumber) {
      return res.status(400).json({
        success: false,
        error: "Validator address and block number are required",
      });
    }

    const claim = await distributionProgramsEngine.submitClaim(
      DistributionProgram.BLOCK_REWARDS,
      validatorAddress,
      parseFloat(amount),
      { validatorAddress }
    );

    res.json({
      success: true,
      data: serializeClaim(claim),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Validator Incentives Program
router.post("/validator/claim", async (req: Request, res: Response) => {
  try {
    const { validatorAddress, amount, performanceScore } = req.body;
    
    if (!validatorAddress) {
      return res.status(400).json({
        success: false,
        error: "Validator address is required",
      });
    }

    const claim = await distributionProgramsEngine.submitClaim(
      DistributionProgram.VALIDATOR_INCENTIVES,
      validatorAddress,
      parseFloat(amount),
      { validatorAddress }
    );

    res.json({
      success: true,
      data: serializeClaim(claim),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Ecosystem Fund (Grants) Program
router.post("/grants/claim", async (req: Request, res: Response) => {
  try {
    const { recipientAddress, recipientName, amount, grantId } = req.body;
    
    if (!grantId) {
      return res.status(400).json({
        success: false,
        error: "Grant ID is required",
      });
    }

    const claim = await distributionProgramsEngine.submitClaim(
      DistributionProgram.ECOSYSTEM_FUND,
      recipientAddress,
      parseFloat(amount),
      { recipientName, grantId }
    );

    res.json({
      success: true,
      data: serializeClaim(claim),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================
// Fraud Management Endpoints
// ============================================

router.post("/blacklist/add", async (req: Request, res: Response) => {
  try {
    const { address, reason } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address is required",
      });
    }

    distributionProgramsEngine.addToBlacklist(address);
    
    res.json({
      success: true,
      message: `Address ${address} added to blacklist`,
      reason,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

router.post("/blacklist/remove", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address is required",
      });
    }

    distributionProgramsEngine.removeFromBlacklist(address);
    
    res.json({
      success: true,
      message: `Address ${address} removed from blacklist`,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// ============================================
// Helper Functions
// ============================================

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
}

function serializeConfig(config: any) {
  return {
    ...config,
    totalAllocationWei: config.totalAllocationWei?.toString() || "0",
  };
}

function serializeMetrics(metrics: any) {
  return {
    ...metrics,
    totalDistributedWei: metrics.totalDistributedWei?.toString() || "0",
  };
}

function serializeClaim(claim: any) {
  return {
    claimId: claim.id,
    program: claim.program,
    recipientAddress: claim.recipientAddress,
    amount: claim.amountTBURN,
    amountWei: claim.amountWei.toString(),
    status: claim.status,
    eligibilityScore: claim.eligibilityScore,
    fraudScore: claim.fraudScore,
    approvalLevel: claim.approvalLevel,
    createdAt: claim.createdAt,
    expiresAt: claim.expiresAt,
  };
}

export default router;
