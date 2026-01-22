/**
 * TBURN Custody Admin Routes
 * Manage multisig signers, wallets, and custody operations
 */

import { Router, Request, Response } from "express";
import { db } from "../db";
import { multisigSigners, multisigWallets, custodyTransactions, custodyTransactionApprovals } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";
import crypto from "crypto";
import { z } from "zod";

const router = Router();

// Valid signer roles
const VALID_ROLES = ["board_member", "foundation_officer", "technical_lead", "legal_officer", "community_representative", "security_expert", "strategic_partner"] as const;

// Zod schemas for validation
const addSignerSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(VALID_ROLES, { errorMap: () => ({ message: `Role must be one of: ${VALID_ROLES.join(", ")}` }) }),
  signerAddress: z.string().min(1, "Signer address is required"),
  email: z.string().email().optional().nullable(),
  publicKey: z.string().optional().nullable(),
  canApproveEmergency: z.boolean().optional().default(false),
});

const updateSignerSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(VALID_ROLES).optional(),
  email: z.string().email().optional().nullable(),
  publicKey: z.string().optional().nullable(),
  canApproveEmergency: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// Multisig Wallets (Admin Only)
// ============================================

router.get("/wallets", requireAdmin, async (req: Request, res: Response) => {
  try {
    const wallets = await db.select().from(multisigWallets).orderBy(desc(multisigWallets.createdAt));
    res.json({ success: true, wallets });
  } catch (error: any) {
    console.error("[Custody] Error fetching wallets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/wallets/:walletId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;
    const [wallet] = await db.select().from(multisigWallets).where(eq(multisigWallets.walletId, walletId));
    
    if (!wallet) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }
    
    const signers = await db.select().from(multisigSigners)
      .where(and(eq(multisigSigners.walletId, walletId), eq(multisigSigners.isActive, true)));
    
    res.json({ success: true, wallet, signers, signerCount: signers.length });
  } catch (error: any) {
    console.error("[Custody] Error fetching wallet:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Multisig Signers Management (Admin Only)
// ============================================

router.get("/signers", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { walletId, activeOnly } = req.query;
    
    let query = db.select().from(multisigSigners);
    
    if (walletId) {
      query = query.where(eq(multisigSigners.walletId, walletId as string)) as any;
    }
    
    if (activeOnly === "true") {
      query = query.where(eq(multisigSigners.isActive, true)) as any;
    }
    
    const signers = await query.orderBy(desc(multisigSigners.createdAt));
    res.json({ success: true, signers });
  } catch (error: any) {
    console.error("[Custody] Error fetching signers:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/signers/:signerId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { signerId } = req.params;
    const [signer] = await db.select().from(multisigSigners).where(eq(multisigSigners.signerId, signerId));
    
    if (!signer) {
      return res.status(404).json({ success: false, error: "Signer not found" });
    }
    
    res.json({ success: true, signer });
  } catch (error: any) {
    console.error("[Custody] Error fetching signer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/signers", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body with Zod
    const parseResult = addSignerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => e.message).join(", ");
      return res.status(400).json({ success: false, error: errors });
    }
    
    const { walletId, name, role, signerAddress, email, publicKey, canApproveEmergency } = parseResult.data;
    
    const [wallet] = await db.select().from(multisigWallets).where(eq(multisigWallets.walletId, walletId));
    if (!wallet) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }
    
    const activeSigners = await db.select().from(multisigSigners)
      .where(and(eq(multisigSigners.walletId, walletId), eq(multisigSigners.isActive, true)));
    
    if (activeSigners.length >= wallet.totalSigners) {
      return res.status(400).json({ 
        success: false, 
        error: `Maximum signers (${wallet.totalSigners}) reached for this wallet` 
      });
    }
    
    const signerId = `signer-${crypto.randomBytes(8).toString("hex")}`;
    const adminEmail = (req as any).session?.user?.email || "system";
    
    const [newSigner] = await db.insert(multisigSigners).values({
      signerId,
      walletId,
      name,
      role,
      signerAddress,
      email: email || null,
      publicKey: publicKey || null,
      canApproveEmergency: canApproveEmergency || false,
      isActive: true,
      addedBy: adminEmail,
      addedAt: new Date(),
    }).returning();
    
    console.log(`[Custody] New signer added: ${name} (${role}) to wallet ${walletId} by ${adminEmail}`);
    
    res.json({ success: true, signer: newSigner });
  } catch (error: any) {
    console.error("[Custody] Error adding signer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/signers/:signerId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { signerId } = req.params;
    
    // Validate request body with Zod
    const parseResult = updateSignerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => e.message).join(", ");
      return res.status(400).json({ success: false, error: errors });
    }
    
    const { name, role, email, publicKey, canApproveEmergency, isActive } = parseResult.data;
    
    const [existingSigner] = await db.select().from(multisigSigners).where(eq(multisigSigners.signerId, signerId));
    if (!existingSigner) {
      return res.status(404).json({ success: false, error: "Signer not found" });
    }
    
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (email !== undefined) updateData.email = email;
    if (publicKey !== undefined) updateData.publicKey = publicKey;
    if (canApproveEmergency !== undefined) updateData.canApproveEmergency = canApproveEmergency;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const [updatedSigner] = await db.update(multisigSigners)
      .set(updateData)
      .where(eq(multisigSigners.signerId, signerId))
      .returning();
    
    console.log(`[Custody] Signer updated: ${signerId}`);
    
    res.json({ success: true, signer: updatedSigner });
  } catch (error: any) {
    console.error("[Custody] Error updating signer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/signers/:signerId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { signerId } = req.params;
    const { reason } = req.body;
    
    const [existingSigner] = await db.select().from(multisigSigners).where(eq(multisigSigners.signerId, signerId));
    if (!existingSigner) {
      return res.status(404).json({ success: false, error: "Signer not found" });
    }
    
    const [wallet] = await db.select().from(multisigWallets).where(eq(multisigWallets.walletId, existingSigner.walletId));
    const activeSigners = await db.select().from(multisigSigners)
      .where(and(
        eq(multisigSigners.walletId, existingSigner.walletId), 
        eq(multisigSigners.isActive, true)
      ));
    
    if (activeSigners.length <= (wallet?.signaturesRequired || 7)) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot remove signer. Minimum ${wallet?.signaturesRequired || 7} signers required for threshold.` 
      });
    }
    
    const [removedSigner] = await db.update(multisigSigners)
      .set({ 
        isActive: false, 
        removedAt: new Date(), 
        removalReason: reason || "Removed by admin",
        updatedAt: new Date()
      })
      .where(eq(multisigSigners.signerId, signerId))
      .returning();
    
    console.log(`[Custody] Signer removed: ${signerId}, reason: ${reason || "Admin action"}`);
    
    res.json({ success: true, signer: removedSigner });
  } catch (error: any) {
    console.error("[Custody] Error removing signer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Custody Transactions (7/11 Threshold Approval)
// ============================================

// Zod schema for transaction creation
const createTransactionSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  transactionType: z.enum(["grant_disbursement", "marketing_spend", "partnership_payment", "emergency_transfer", "dao_execution"]),
  recipientAddress: z.string().min(1, "Recipient address is required"),
  recipientName: z.string().optional(),
  // Amount in base units (18 decimals) - must be numeric string, positive (> 0)
  amount: z.string().min(1, "Amount is required").refine((val) => {
    try {
      const parsed = BigInt(val);
      return parsed > 0n; // Must be positive (no zero transfers)
    } catch {
      return false;
    }
  }, { message: "Amount must be a valid positive integer string (greater than 0)" }),
  amountUsd: z.string().optional(),
  purpose: z.string().min(1, "Purpose is required"),
  justification: z.string().optional(),
  documentationUrl: z.string().url().optional(),
});

// Token thresholds with 18 decimals (1 TBURN = 10^18 base units)
// Policy per TBURN Security Spec v1.0:
// - Tier 1 (< 1M tokens): 48 hours timelock - routine operations
// - Tier 2 (1M - 1B tokens): 48 hours timelock - medium operations (implicit default)
// - Tier 3 (> 1B tokens): 168 hours (7 days) timelock - significant operations
// - Tier 4 (> 5B tokens): 720 hours (30 days) timelock - critical operations
const ONE_MILLION_TOKENS = BigInt("1000000") * BigInt("1000000000000000000"); // 1M * 10^18
const ONE_BILLION_TOKENS = BigInt("1000000000") * BigInt("1000000000000000000"); // 1B * 10^18
const FIVE_BILLION_TOKENS = BigInt("5000000000") * BigInt("1000000000000000000"); // 5B * 10^18

/**
 * Calculate timelock hours based on amount using strict > comparisons
 * Note: Amounts in the 1M-1B range use 48h as the implicit default tier
 * Future enhancement: Could add governance-configurable tiers
 */
function calculateTimelockHours(amount: bigint): number {
  if (amount > FIVE_BILLION_TOKENS) {
    return 720; // 30 days for > 5B tokens (Tier 4)
  } else if (amount > ONE_BILLION_TOKENS) {
    return 168; // 7 days for > 1B tokens (Tier 3)
  }
  // Tier 1 & 2: 48h for all amounts <= 1B
  return 48;
}

// Get all transactions
router.get("/transactions", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { walletId, status } = req.query;
    
    let conditions = [];
    if (walletId) conditions.push(eq(custodyTransactions.walletId, walletId as string));
    if (status) conditions.push(eq(custodyTransactions.status, status as string));
    
    const transactions = await db.select()
      .from(custodyTransactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(custodyTransactions.proposedAt));
    
    res.json({ success: true, transactions });
  } catch (error: any) {
    console.error("[Custody] Error fetching transactions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction details with approvals
router.get("/transactions/:transactionId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    const [transaction] = await db.select()
      .from(custodyTransactions)
      .where(eq(custodyTransactions.transactionId, transactionId));
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    
    const approvals = await db.select()
      .from(custodyTransactionApprovals)
      .where(eq(custodyTransactionApprovals.transactionId, transactionId));
    
    res.json({ success: true, transaction, approvals });
  } catch (error: any) {
    console.error("[Custody] Error fetching transaction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new custody transaction (requires threshold approval)
router.post("/transactions", requireAdmin, async (req: Request, res: Response) => {
  try {
    const parseResult = createTransactionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => e.message).join(", ");
      return res.status(400).json({ success: false, error: errors });
    }
    
    const data = parseResult.data;
    
    // Get wallet to determine required approvals
    const [wallet] = await db.select().from(multisigWallets).where(eq(multisigWallets.walletId, data.walletId));
    if (!wallet) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }
    
    // Verify wallet has sufficient balance
    const amount = BigInt(data.amount);
    const walletBalance = BigInt(wallet.remainingAmount);
    if (amount > walletBalance) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient wallet balance. Requested: ${data.amount}, Available: ${wallet.remainingAmount}` 
      });
    }
    
    // Get current active signers count for this wallet
    const activeSigners = await db.select()
      .from(multisigSigners)
      .where(and(eq(multisigSigners.walletId, data.walletId), eq(multisigSigners.isActive, true)));
    const activeSignerCount = activeSigners.length;
    
    // Verify there are enough active signers to meet threshold
    if (activeSignerCount < wallet.signaturesRequired) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient active signers. Required: ${wallet.signaturesRequired}, Active: ${activeSignerCount}` 
      });
    }
    
    // Calculate timelock based on amount using proper thresholds
    const timelockHours = calculateTimelockHours(amount);
    
    const transactionId = `tx-${crypto.randomBytes(12).toString("hex")}`;
    const adminEmail = (req as any).session?.user?.email || "system";
    const timelockExpiresAt = new Date(Date.now() + timelockHours * 60 * 60 * 1000);
    
    const [newTransaction] = await db.insert(custodyTransactions).values({
      transactionId,
      walletId: data.walletId,
      transactionType: data.transactionType,
      recipientAddress: data.recipientAddress,
      recipientName: data.recipientName || null,
      amount: data.amount,
      amountUsd: data.amountUsd || null,
      purpose: data.purpose,
      justification: data.justification || null,
      documentationUrl: data.documentationUrl || null,
      status: "pending_approval",
      approvalCount: 0,
      requiredApprovals: wallet.signaturesRequired, // 7 for foundation wallet
      proposedBy: adminEmail,
      timelockExpiresAt,
    }).returning();
    
    console.log(`[Custody] New transaction created: ${transactionId}, requires ${wallet.signaturesRequired}/${wallet.totalSigners} approvals`);
    console.log(`[Custody] Timelock: ${timelockHours}h (expires: ${timelockExpiresAt.toISOString()})`);
    
    res.json({ 
      success: true, 
      transaction: newTransaction,
      threshold: {
        required: wallet.signaturesRequired,
        total: wallet.totalSigners,
        timelockHours,
        timelockExpiresAt: timelockExpiresAt.toISOString(),
      }
    });
  } catch (error: any) {
    console.error("[Custody] Error creating transaction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve or reject a transaction (by signer)
router.post("/transactions/:transactionId/approve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { signerId, decision, signature, comment } = req.body;
    
    if (!signerId || !decision) {
      return res.status(400).json({ success: false, error: "signerId and decision are required" });
    }
    
    if (!["approve", "reject", "abstain"].includes(decision)) {
      return res.status(400).json({ success: false, error: "decision must be approve, reject, or abstain" });
    }
    
    // Verify transaction exists and is pending
    const [transaction] = await db.select().from(custodyTransactions).where(eq(custodyTransactions.transactionId, transactionId));
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    
    if (transaction.status !== "pending_approval") {
      return res.status(400).json({ success: false, error: `Transaction is ${transaction.status}, cannot approve` });
    }
    
    // Verify signer exists, is active, and belongs to the transaction's wallet
    const [signer] = await db.select().from(multisigSigners).where(eq(multisigSigners.signerId, signerId));
    if (!signer) {
      return res.status(404).json({ success: false, error: "Signer not found" });
    }
    
    if (!signer.isActive) {
      return res.status(400).json({ success: false, error: "Signer is not active" });
    }
    
    if (signer.walletId !== transaction.walletId) {
      return res.status(400).json({ success: false, error: "Signer does not belong to this wallet" });
    }
    
    // Check if signer already voted on this transaction
    const existingApprovals = await db.select()
      .from(custodyTransactionApprovals)
      .where(and(
        eq(custodyTransactionApprovals.transactionId, transactionId),
        eq(custodyTransactionApprovals.signerId, signerId)
      ));
    
    if (existingApprovals.length > 0) {
      return res.status(400).json({ success: false, error: "Signer has already voted on this transaction" });
    }
    
    // Record the approval/rejection
    const approvalId = `approval-${crypto.randomBytes(8).toString("hex")}`;
    
    await db.insert(custodyTransactionApprovals).values({
      approvalId,
      transactionId,
      signerId,
      decision,
      signature: signature || null,
      comment: comment || null,
    });
    
    // Count approvals and update transaction
    const allApprovals = await db.select()
      .from(custodyTransactionApprovals)
      .where(eq(custodyTransactionApprovals.transactionId, transactionId));
    
    const approveCount = allApprovals.filter(a => a.decision === "approve").length;
    const rejectCount = allApprovals.filter(a => a.decision === "reject").length;
    
    // Get wallet and CURRENT active signers to check threshold
    const [wallet] = await db.select().from(multisigWallets).where(eq(multisigWallets.walletId, transaction.walletId));
    const requiredApprovals = wallet?.signaturesRequired || 7;
    
    // Use actual active signer count instead of configured totalSigners
    const activeSigners = await db.select()
      .from(multisigSigners)
      .where(and(eq(multisigSigners.walletId, transaction.walletId), eq(multisigSigners.isActive, true)));
    const totalActiveSigners = activeSigners.length;
    
    // Determine new status
    let newStatus = "pending_approval";
    
    // Check if threshold is met
    if (approveCount >= requiredApprovals) {
      newStatus = "approved";
      console.log(`[Custody] Transaction ${transactionId} APPROVED with ${approveCount}/${requiredApprovals} signatures`);
    }
    
    // Check if mathematically impossible to reach threshold
    // Note: Abstain votes are NEUTRAL - they don't reduce remaining potential approvers
    // Only approve/reject votes consume signer slots for threshold calculation
    const decisionVotes = allApprovals.filter(a => a.decision === "approve" || a.decision === "reject").length;
    const remainingPotentialApprovers = totalActiveSigners - decisionVotes;
    const maxPossibleApprovals = approveCount + remainingPotentialApprovers;
    
    if (maxPossibleApprovals < requiredApprovals && newStatus !== "approved") {
      newStatus = "rejected";
      console.log(`[Custody] Transaction ${transactionId} REJECTED - insufficient remaining signers (${remainingPotentialApprovers} remaining can vote, need ${requiredApprovals - approveCount} more approvals)`);
    }
    
    // Update transaction with new approval count and status
    await db.update(custodyTransactions)
      .set({ 
        approvalCount: approveCount,
        status: newStatus,
        updatedAt: new Date()
      })
      .where(eq(custodyTransactions.transactionId, transactionId));
    
    console.log(`[Custody] Approval recorded: ${signerId} ${decision} on ${transactionId} (${approveCount}/${requiredApprovals})`);
    
    const abstainCount = allApprovals.filter(a => a.decision === "abstain").length;
    
    res.json({ 
      success: true,
      approval: { approvalId, decision },
      thresholdStatus: {
        current: approveCount,
        required: requiredApprovals,
        rejected: rejectCount,
        abstained: abstainCount,
        remainingPotentialApprovers,
        totalActiveSigners,
        status: newStatus,
      }
    });
  } catch (error: any) {
    console.error("[Custody] Error recording approval:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute an approved transaction (only after timelock expires)
router.post("/transactions/:transactionId/execute", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    const [transaction] = await db.select().from(custodyTransactions).where(eq(custodyTransactions.transactionId, transactionId));
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    
    if (transaction.status !== "approved") {
      return res.status(400).json({ success: false, error: `Transaction must be approved first (current: ${transaction.status})` });
    }
    
    // Check timelock
    if (transaction.timelockExpiresAt && new Date() < transaction.timelockExpiresAt) {
      const remainingHours = Math.ceil((transaction.timelockExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60));
      return res.status(400).json({ 
        success: false, 
        error: `Timelock not expired. ${remainingHours} hours remaining until ${transaction.timelockExpiresAt.toISOString()}`
      });
    }
    
    // Get wallet and verify sufficient balance before execution
    const [wallet] = await db.select().from(multisigWallets).where(eq(multisigWallets.walletId, transaction.walletId));
    if (!wallet) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }
    
    // Validate amount and check for underflow
    const transactionAmount = BigInt(transaction.amount);
    const currentBalance = BigInt(wallet.remainingAmount);
    
    if (transactionAmount > currentBalance) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient wallet balance. Transaction: ${transaction.amount}, Available: ${wallet.remainingAmount}` 
      });
    }
    
    const adminEmail = (req as any).session?.user?.email || "system";
    
    // Mark as executed (in real implementation, this would trigger on-chain transfer)
    const executedTxHash = `0x${crypto.randomBytes(32).toString("hex")}`;
    
    // Calculate new balances with underflow protection
    const newRemaining = (currentBalance - transactionAmount).toString();
    const newDistributed = (BigInt(wallet.distributedAmount) + transactionAmount).toString();
    
    // Atomic update: wrap both updates in a transaction for consistency
    // If either update fails, both are rolled back
    await db.transaction(async (tx) => {
      await tx.update(custodyTransactions)
        .set({
          status: "executed",
          executedTxHash,
          executedAt: new Date(),
          executedBy: adminEmail,
          updatedAt: new Date(),
        })
        .where(eq(custodyTransactions.transactionId, transactionId));
        
      await tx.update(multisigWallets)
        .set({
          remainingAmount: newRemaining,
          distributedAmount: newDistributed,
          lastExecutionAt: new Date(),
          executionCount: (wallet.executionCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(multisigWallets.walletId, transaction.walletId));
    });
    
    console.log(`[Custody] Transaction ${transactionId} EXECUTED by ${adminEmail}`);
    console.log(`[Custody] TxHash: ${executedTxHash}, Amount: ${transaction.amount}`);
    
    res.json({ 
      success: true, 
      executed: true,
      txHash: executedTxHash,
      executedAt: new Date().toISOString(),
      executedBy: adminEmail,
    });
  } catch (error: any) {
    console.error("[Custody] Error executing transaction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel a pending transaction
router.post("/transactions/:transactionId/cancel", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    
    const [transaction] = await db.select().from(custodyTransactions).where(eq(custodyTransactions.transactionId, transactionId));
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    
    if (transaction.status === "executed") {
      return res.status(400).json({ success: false, error: "Cannot cancel an executed transaction" });
    }
    
    await db.update(custodyTransactions)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(custodyTransactions.transactionId, transactionId));
    
    console.log(`[Custody] Transaction ${transactionId} CANCELLED: ${reason || "No reason provided"}`);
    
    res.json({ success: true, cancelled: true });
  } catch (error: any) {
    console.error("[Custody] Error cancelling transaction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Custody Statistics
// ============================================

router.get("/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [walletCount] = await db.select({ count: sql<number>`count(*)::int` }).from(multisigWallets);
    const [signerCount] = await db.select({ count: sql<number>`count(*)::int` }).from(multisigSigners).where(eq(multisigSigners.isActive, true));
    const [pendingTxCount] = await db.select({ count: sql<number>`count(*)::int` }).from(custodyTransactions).where(eq(custodyTransactions.status, "pending_approval"));
    
    const [mainWallet] = await db.select().from(multisigWallets).where(eq(multisigWallets.walletId, "foundation-custody-main"));
    
    res.json({
      success: true,
      stats: {
        totalWallets: walletCount?.count || 0,
        activeSigners: signerCount?.count || 0,
        pendingTransactions: pendingTxCount?.count || 0,
        mainWallet: mainWallet ? {
          signaturesRequired: mainWallet.signaturesRequired,
          totalSigners: mainWallet.totalSigners,
          timelockHours: mainWallet.timelockHours,
          allocatedAmount: mainWallet.allocatedAmount,
          remainingAmount: mainWallet.remainingAmount,
        } : null,
      }
    });
  } catch (error: any) {
    console.error("[Custody] Error fetching stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Signer Roles Reference
// ============================================

router.get("/signer-roles", (req: Request, res: Response) => {
  res.json({
    success: true,
    roles: [
      { id: "board_member", name: "이사회 멤버", description: "재단 이사회 구성원", icon: "Building2" },
      { id: "foundation_officer", name: "재단 임원", description: "재단 운영 책임자", icon: "UserCog" },
      { id: "technical_lead", name: "기술 책임자", description: "기술 보안 담당자", icon: "Code" },
      { id: "legal_officer", name: "법률 고문", description: "외부 법률 전문가", icon: "Scale" },
      { id: "community_representative", name: "커뮤니티 대표", description: "커뮤니티 선출 대표", icon: "Users" },
      { id: "security_expert", name: "보안 전문가", description: "외부 보안 파트너", icon: "Shield" },
      { id: "strategic_partner", name: "전략적 파트너", description: "전략 파트너사 대표", icon: "Handshake" },
    ]
  });
});

export default router;
