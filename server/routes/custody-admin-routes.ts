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

const router = Router();

// ============================================
// Multisig Wallets
// ============================================

router.get("/wallets", async (req: Request, res: Response) => {
  try {
    const wallets = await db.select().from(multisigWallets).orderBy(desc(multisigWallets.createdAt));
    res.json({ success: true, wallets });
  } catch (error: any) {
    console.error("[Custody] Error fetching wallets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/wallets/:walletId", async (req: Request, res: Response) => {
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

router.get("/signers", async (req: Request, res: Response) => {
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

router.get("/signers/:signerId", async (req: Request, res: Response) => {
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
    const { walletId, name, role, signerAddress, email, publicKey, canApproveEmergency } = req.body;
    
    if (!walletId || !name || !role || !signerAddress) {
      return res.status(400).json({ success: false, error: "Missing required fields: walletId, name, role, signerAddress" });
    }
    
    const validRoles = ["board_member", "foundation_officer", "technical_lead", "legal_officer", "community_representative", "security_expert", "strategic_partner"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }
    
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
    const { name, role, email, publicKey, canApproveEmergency, isActive } = req.body;
    
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
// Custody Statistics
// ============================================

router.get("/stats", async (req: Request, res: Response) => {
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
