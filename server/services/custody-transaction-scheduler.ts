/**
 * TBURN Custody Transaction Scheduler
 * Automatically expires pending transactions and handles timelock management
 */

import { db } from "../db";
import { custodyTransactions, custodyAuditLogs } from "@shared/schema";
import { eq, and, lt, or, sql } from "drizzle-orm";

const TRANSACTION_EXPIRY_HOURS = 168;

let schedulerInterval: NodeJS.Timeout | null = null;
let isRunning = false;

async function recordAuditLog(data: {
  action: string;
  entityType: string;
  entityId: string;
  walletId?: string;
  performedBy: string;
  details: Record<string, any>;
}): Promise<void> {
  try {
    await db.execute(sql`
      INSERT INTO custody_audit_logs (action_type, entity_type, entity_id, performed_by, performed_at, details, severity, created_at)
      VALUES (${data.action}, ${data.entityType}, ${data.entityId}, ${data.performedBy}, NOW(), ${JSON.stringify(data.details)}::jsonb, 'info', NOW())
    `);
  } catch (error) {
    console.error("[CustodyScheduler] Failed to record audit log:", error);
  }
}

async function expirePendingTransactions(): Promise<number> {
  if (isRunning) {
    console.log("[CustodyScheduler] Previous run still in progress, skipping...");
    return 0;
  }

  isRunning = true;
  const now = new Date();

  try {
    const expiredTransactions = await db.select()
      .from(custodyTransactions)
      .where(and(
        eq(custodyTransactions.status, "pending_approval"),
        or(
          lt(custodyTransactions.approvalExpiresAt, now),
          and(
            sql`${custodyTransactions.approvalExpiresAt} IS NULL`,
            lt(custodyTransactions.proposedAt, new Date(now.getTime() - TRANSACTION_EXPIRY_HOURS * 60 * 60 * 1000))
          )
        )
      ));

    if (expiredTransactions.length === 0) {
      return 0;
    }

    const expiredIds = expiredTransactions.map(t => t.transactionId);
    
    await db.update(custodyTransactions)
      .set({ status: "expired", updatedAt: new Date() })
      .where(sql`${custodyTransactions.transactionId} = ANY(${expiredIds})`);

    for (const tx of expiredTransactions) {
      await recordAuditLog({
        action: "transaction_expired",
        entityType: "transaction",
        entityId: tx.transactionId,
        walletId: tx.walletId,
        performedBy: "system_scheduler",
        details: {
          proposedAt: tx.proposedAt?.toISOString(),
          approvalCount: tx.approvalCount,
          requiredApprovals: tx.requiredApprovals,
          reason: "Approval window expired (168 hours)",
        },
      });
    }

    console.log(`[CustodyScheduler] Expired ${expiredTransactions.length} pending transactions`);
    return expiredTransactions.length;
  } catch (error) {
    console.error("[CustodyScheduler] Error expiring transactions:", error);
    return 0;
  } finally {
    isRunning = false;
  }
}

export function startCustodyTransactionScheduler(): void {
  if (schedulerInterval) {
    console.log("[CustodyScheduler] Scheduler already running");
    return;
  }

  console.log("[CustodyScheduler] Starting custody transaction scheduler...");
  console.log("[CustodyScheduler] Check interval: 1 hour");
  console.log("[CustodyScheduler] Expiry window: 168 hours (7 days)");

  expirePendingTransactions().then(count => {
    if (count > 0) {
      console.log(`[CustodyScheduler] Initial cleanup: expired ${count} transactions`);
    }
  });

  schedulerInterval = setInterval(async () => {
    const count = await expirePendingTransactions();
    if (count > 0) {
      console.log(`[CustodyScheduler] Scheduled cleanup: expired ${count} transactions`);
    }
  }, 60 * 60 * 1000);

  console.log("[CustodyScheduler] Scheduler started successfully");
}

export function stopCustodyTransactionScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[CustodyScheduler] Scheduler stopped");
  }
}

export async function getSchedulerStatus(): Promise<{
  isRunning: boolean;
  nextRunIn: string;
  lastCheck: string;
}> {
  return {
    isRunning: !!schedulerInterval,
    nextRunIn: schedulerInterval ? "within 1 hour" : "not scheduled",
    lastCheck: new Date().toISOString(),
  };
}

export async function manualExpireCheck(): Promise<number> {
  console.log("[CustodyScheduler] Manual expire check triggered");
  return await expirePendingTransactions();
}
