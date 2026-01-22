/**
 * TBURN Custody Admin Routes
 * Manage multisig signers, wallets, and custody operations
 */

import { Router, Request, Response } from "express";
import { db } from "../db";
import { multisigSigners, multisigWallets, custodyTransactions, custodyTransactionApprovals, custodyAuditLogs } from "@shared/schema";
import { eq, and, desc, sql, lt } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";
import crypto from "crypto";
import { z } from "zod";

// ============================================
// TBURN Address Validation (Bech32m tb1 format)
// ============================================

/**
 * Validate TBURN mainnet address format
 * Format: tb1 prefix + 39-59 Bech32m characters (lowercase)
 * Examples: tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
 */
function isValidTburnAddress(address: string): boolean {
  // Must start with tb1 (mainnet prefix)
  if (!address.startsWith("tb1")) return false;
  
  // Total length: 42-62 chars (tb1 + 39-59 data chars)
  if (address.length < 42 || address.length > 62) return false;
  
  // Bech32m charset (lowercase only, no 1, b, i, o)
  const bech32mRegex = /^tb1[02-9ac-hj-np-z]{39,59}$/;
  return bech32mRegex.test(address);
}

/**
 * Validate Ethereum-compatible address (for cross-chain/bridge)
 * Format: 0x prefix + 40 hex characters
 */
function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate any supported address format
 */
function isValidAddress(address: string): { valid: boolean; format: string } {
  if (isValidTburnAddress(address)) {
    return { valid: true, format: "tburn" };
  }
  if (isValidEthAddress(address)) {
    return { valid: true, format: "ethereum" };
  }
  return { valid: false, format: "unknown" };
}

// ============================================
// Audit Logging System
// ============================================

type AuditAction = 
  | "signer_added" | "signer_updated" | "signer_removed"
  | "transaction_created" | "transaction_approved" | "transaction_rejected" 
  | "transaction_executed" | "transaction_cancelled" | "transaction_expired"
  | "wallet_created" | "wallet_updated";

interface AuditLogData {
  action: AuditAction;
  entityType: "signer" | "transaction" | "wallet";
  entityId: string;
  walletId?: string;
  performedBy: string;
  details: Record<string, any>;
  ipAddress?: string;
}

async function recordAuditLog(data: AuditLogData): Promise<void> {
  try {
    const logId = `audit-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    await db.insert(custodyAuditLogs).values({
      logId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      walletId: data.walletId || null,
      performedBy: data.performedBy,
      details: JSON.stringify(data.details),
      ipAddress: data.ipAddress || null,
      createdAt: new Date(),
    });
    console.log(`[Audit] ${data.action}: ${data.entityType}/${data.entityId} by ${data.performedBy}`);
  } catch (error) {
    // Audit log failures should not break main operations
    console.error("[Audit] Failed to record audit log:", error);
  }
}

// ============================================
// Error Codes
// ============================================

const ERROR_CODES = {
  // Validation errors (4xx)
  INVALID_ADDRESS_FORMAT: "CUST-001",
  DUPLICATE_SIGNER_ADDRESS: "CUST-002",
  INSUFFICIENT_BALANCE: "CUST-003",
  INSUFFICIENT_SIGNERS: "CUST-004",
  INVALID_AMOUNT: "CUST-005",
  
  // State errors
  TRANSACTION_NOT_PENDING: "CUST-010",
  TRANSACTION_EXPIRED: "CUST-011",
  TIMELOCK_ACTIVE: "CUST-012",
  ALREADY_VOTED: "CUST-013",
  SIGNER_INACTIVE: "CUST-014",
  
  // Permission errors
  SIGNER_WALLET_MISMATCH: "CUST-020",
  EMERGENCY_NOT_AUTHORIZED: "CUST-021",
  
  // Not found
  WALLET_NOT_FOUND: "CUST-030",
  SIGNER_NOT_FOUND: "CUST-031",
  TRANSACTION_NOT_FOUND: "CUST-032",
} as const;

function errorResponse(code: keyof typeof ERROR_CODES, message: string) {
  return { success: false, error: message, code: ERROR_CODES[code] };
}

const router = Router();

// Valid signer roles
const VALID_ROLES = ["board_member", "foundation_officer", "technical_lead", "legal_officer", "community_representative", "security_expert", "strategic_partner"] as const;

// ============================================
// Zod Schemas with Enhanced Validation
// ============================================

// Custom address validator
const tburnAddressSchema = z.string().min(1, "Signer address is required").refine(
  (val) => isValidAddress(val).valid,
  { message: "Invalid address format. Must be TBURN (tb1...) or Ethereum (0x...) format" }
);

const addSignerSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  role: z.enum(VALID_ROLES, { errorMap: () => ({ message: `Role must be one of: ${VALID_ROLES.join(", ")}` }) }),
  signerAddress: tburnAddressSchema,
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
      return res.status(400).json(errorResponse("INVALID_ADDRESS_FORMAT", errors));
    }
    
    const { walletId, name, role, signerAddress, email, publicKey, canApproveEmergency } = parseResult.data;
    
    const [wallet] = await db.select().from(multisigWallets).where(eq(multisigWallets.walletId, walletId));
    if (!wallet) {
      return res.status(404).json(errorResponse("WALLET_NOT_FOUND", "Wallet not found"));
    }
    
    // Check for duplicate address across all signers for this wallet
    const existingSignerWithAddress = await db.select().from(multisigSigners)
      .where(and(
        eq(multisigSigners.walletId, walletId),
        eq(multisigSigners.signerAddress, signerAddress.toLowerCase())
      ));
    
    if (existingSignerWithAddress.length > 0) {
      return res.status(400).json(errorResponse(
        "DUPLICATE_SIGNER_ADDRESS", 
        "A signer with this address already exists for this wallet"
      ));
    }
    
    const activeSigners = await db.select().from(multisigSigners)
      .where(and(eq(multisigSigners.walletId, walletId), eq(multisigSigners.isActive, true)));
    
    if (activeSigners.length >= wallet.totalSigners) {
      return res.status(400).json(errorResponse(
        "INSUFFICIENT_SIGNERS", 
        `Maximum signers (${wallet.totalSigners}) reached for this wallet`
      ));
    }
    
    const signerId = `signer-${crypto.randomBytes(8).toString("hex")}`;
    const adminEmail = (req as any).session?.user?.email || "system";
    const clientIp = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    
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
    
    // Record audit log (non-blocking)
    recordAuditLog({
      action: "signer_added",
      entityType: "signer",
      entityId: signerId,
      walletId,
      performedBy: adminEmail,
      details: { name, role, signerAddress: signerAddress.slice(0, 20) + "...", canApproveEmergency },
      ipAddress: clientIp,
    });
    
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

// Transaction types with their special handling requirements
const TRANSACTION_TYPES = {
  grant_disbursement: { name: "Grant Disbursement", requiresExtraApproval: false },
  marketing_spend: { name: "Marketing Spend", requiresExtraApproval: false },
  partnership_payment: { name: "Partnership Payment", requiresExtraApproval: false },
  emergency_transfer: { name: "Emergency Transfer", requiresExtraApproval: true, reducedTimelock: 4 }, // 4h instead of 48h
  dao_execution: { name: "DAO Execution", requiresExtraApproval: false },
} as const;

// Zod schema for transaction creation
const createTransactionSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  transactionType: z.enum(["grant_disbursement", "marketing_spend", "partnership_payment", "emergency_transfer", "dao_execution"]),
  recipientAddress: tburnAddressSchema, // Now validates TBURN/ETH format
  recipientName: z.string().optional(),
  // Amount in base units (18 decimals) - must be numeric string, positive (> 0)
  amount: z.string().min(1, "Amount is required").refine((val) => {
    try {
      const parsed = BigInt(val);
      return parsed > BigInt(0); // Must be positive (no zero transfers)
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

// Transaction expiry: 7 days to complete approvals
const TRANSACTION_EXPIRY_HOURS = 168;

/**
 * Calculate timelock hours based on amount using strict > comparisons
 * Note: Amounts in the 1M-1B range use 48h as the implicit default tier
 * @param amount - Transaction amount in base units (18 decimals)
 * @param isEmergency - If true, applies reduced 4h timelock (requires extra approval)
 */
function calculateTimelockHours(amount: bigint, isEmergency: boolean = false): number {
  // Emergency transfers have reduced timelock (4h) but require canApproveEmergency signers
  if (isEmergency) {
    return 4;
  }
  
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
      return res.status(400).json(errorResponse(
        "INSUFFICIENT_SIGNERS",
        `Insufficient active signers. Required: ${wallet.signaturesRequired}, Active: ${activeSignerCount}`
      ));
    }
    
    // Check if this is an emergency transfer
    const isEmergency = data.transactionType === "emergency_transfer";
    
    // For emergency transfers, verify we have enough signers with canApproveEmergency
    if (isEmergency) {
      const emergencyCapableSigners = activeSigners.filter(s => s.canApproveEmergency);
      if (emergencyCapableSigners.length < wallet.signaturesRequired) {
        return res.status(400).json(errorResponse(
          "EMERGENCY_NOT_AUTHORIZED",
          `Emergency transfers require ${wallet.signaturesRequired} signers with emergency approval authority. Available: ${emergencyCapableSigners.length}`
        ));
      }
    }
    
    // Calculate timelock based on amount and transaction type
    const timelockHours = calculateTimelockHours(amount, isEmergency);
    
    const transactionId = `tx-${crypto.randomBytes(12).toString("hex")}`;
    const adminEmail = (req as any).session?.user?.email || "system";
    const clientIp = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    const timelockExpiresAt = new Date(Date.now() + timelockHours * 60 * 60 * 1000);
    const expiresAt = new Date(Date.now() + TRANSACTION_EXPIRY_HOURS * 60 * 60 * 1000);
    
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
    console.log(`[Custody] Timelock: ${timelockHours}h (expires: ${timelockExpiresAt.toISOString()}), Approval expires: ${expiresAt.toISOString()}`);
    
    // Record audit log (non-blocking)
    recordAuditLog({
      action: "transaction_created",
      entityType: "transaction",
      entityId: transactionId,
      walletId: data.walletId,
      performedBy: adminEmail,
      details: { 
        transactionType: data.transactionType,
        amount: data.amount,
        recipientAddress: data.recipientAddress.slice(0, 20) + "...",
        timelockHours,
        isEmergency,
      },
      ipAddress: clientIp,
    });
    
    res.json({ 
      success: true, 
      transaction: newTransaction,
      threshold: {
        required: wallet.signaturesRequired,
        total: wallet.totalSigners,
        timelockHours,
        timelockExpiresAt: timelockExpiresAt.toISOString(),
        approvalExpiresAt: expiresAt.toISOString(),
        isEmergency,
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
    
    // Record audit log (non-blocking)
    const clientIp = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    const auditAction = decision === "approve" ? "transaction_approved" : 
                        decision === "reject" ? "transaction_rejected" : "transaction_approved";
    recordAuditLog({
      action: auditAction as AuditAction,
      entityType: "transaction",
      entityId: transactionId,
      walletId: transaction.walletId,
      performedBy: signer.name,
      details: { 
        signerId,
        decision,
        approvalId,
        currentApprovals: approveCount,
        requiredApprovals,
        newStatus,
        comment: comment || null,
      },
      ipAddress: clientIp,
    });
    
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
      return res.status(404).json(errorResponse("TRANSACTION_NOT_FOUND", "Transaction not found"));
    }
    
    if (transaction.status === "executed") {
      return res.status(400).json(errorResponse("TRANSACTION_NOT_PENDING", "Cannot cancel an executed transaction"));
    }
    
    const adminEmail = (req as any).session?.user?.email || "system";
    const clientIp = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    
    await db.update(custodyTransactions)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(custodyTransactions.transactionId, transactionId));
    
    console.log(`[Custody] Transaction ${transactionId} CANCELLED: ${reason || "No reason provided"}`);
    
    // Record audit log (non-blocking)
    recordAuditLog({
      action: "transaction_cancelled",
      entityType: "transaction",
      entityId: transactionId,
      walletId: transaction.walletId,
      performedBy: adminEmail,
      details: { reason: reason || "No reason provided", previousStatus: transaction.status },
      ipAddress: clientIp,
    });
    
    res.json({ success: true, cancelled: true });
  } catch (error: any) {
    console.error("[Custody] Error cancelling transaction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Expire old pending transactions (automated cleanup)
router.post("/transactions/expire-pending", requireAdmin, async (req: Request, res: Response) => {
  try {
    const adminEmail = (req as any).session?.user?.email || "system";
    const expiryThreshold = new Date(Date.now() - TRANSACTION_EXPIRY_HOURS * 60 * 60 * 1000);
    
    // Find pending transactions older than expiry threshold
    const expiredTransactions = await db.select()
      .from(custodyTransactions)
      .where(and(
        eq(custodyTransactions.status, "pending_approval"),
        lt(custodyTransactions.proposedAt, expiryThreshold)
      ));
    
    if (expiredTransactions.length === 0) {
      return res.json({ success: true, expiredCount: 0, message: "No expired transactions found" });
    }
    
    // Update all expired transactions
    const expiredIds = expiredTransactions.map(t => t.transactionId);
    await db.update(custodyTransactions)
      .set({ status: "expired", updatedAt: new Date() })
      .where(sql`${custodyTransactions.transactionId} = ANY(${expiredIds})`);
    
    // Record audit logs for each expired transaction
    for (const tx of expiredTransactions) {
      recordAuditLog({
        action: "transaction_expired",
        entityType: "transaction",
        entityId: tx.transactionId,
        walletId: tx.walletId,
        performedBy: adminEmail,
        details: { 
          proposedAt: tx.proposedAt?.toISOString(),
          approvalCount: tx.approvalCount,
          requiredApprovals: tx.requiredApprovals,
        },
      });
    }
    
    console.log(`[Custody] Expired ${expiredTransactions.length} pending transactions`);
    
    res.json({ 
      success: true, 
      expiredCount: expiredTransactions.length,
      expiredTransactionIds: expiredIds,
    });
  } catch (error: any) {
    console.error("[Custody] Error expiring transactions:", error);
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

// ============================================
// Audit Logs (Admin Only)
// ============================================

router.get("/audit-logs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { walletId, entityType, action, limit = "100" } = req.query;
    
    let conditions = [];
    if (walletId) conditions.push(eq(custodyAuditLogs.walletId, walletId as string));
    if (entityType) conditions.push(eq(custodyAuditLogs.entityType, entityType as string));
    if (action) conditions.push(eq(custodyAuditLogs.action, action as string));
    
    const logs = await db.select()
      .from(custodyAuditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(custodyAuditLogs.createdAt))
      .limit(parseInt(limit as string, 10) || 100);
    
    // Parse details JSON for each log
    const parsedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));
    
    res.json({ success: true, logs: parsedLogs });
  } catch (error: any) {
    console.error("[Custody] Error fetching audit logs:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Error Codes Reference
// ============================================

router.get("/error-codes", (req: Request, res: Response) => {
  res.json({
    success: true,
    errorCodes: ERROR_CODES,
    description: {
      "CUST-001": "Invalid address format (must be TBURN tb1 or Ethereum 0x)",
      "CUST-002": "Duplicate signer address for this wallet",
      "CUST-003": "Insufficient wallet balance for transaction",
      "CUST-004": "Insufficient active signers to meet threshold",
      "CUST-005": "Invalid amount (must be positive integer)",
      "CUST-010": "Transaction is not in pending approval state",
      "CUST-011": "Transaction has expired (7 day approval window)",
      "CUST-012": "Timelock period has not yet expired",
      "CUST-013": "Signer has already voted on this transaction",
      "CUST-014": "Signer is not active",
      "CUST-020": "Signer does not belong to the transaction's wallet",
      "CUST-021": "Insufficient signers with emergency approval authority",
      "CUST-030": "Wallet not found",
      "CUST-031": "Signer not found",
      "CUST-032": "Transaction not found",
    }
  });
});

export default router;
