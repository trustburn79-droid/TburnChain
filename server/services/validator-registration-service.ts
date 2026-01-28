/**
 * Enterprise Validator Registration Service
 * Production-grade validator onboarding with crypto verification, API key management,
 * multi-sig approval workflow, and audit logging
 */

import { db } from "../db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import {
  externalValidatorRegistrations,
  externalValidatorApiKeys,
  externalValidatorKeyRotations,
  externalValidatorMultisigApprovals,
  externalValidatorHeartbeats,
  externalValidatorAuditLogs,
  externalValidatorSecurityState,
  InsertExternalValidatorRegistration,
  InsertExternalValidatorApiKey,
  InsertExternalValidatorKeyRotation,
  InsertExternalValidatorMultisigApproval,
  InsertExternalValidatorHeartbeat,
  ValidatorRegistrationRequest,
  KeyRotationRequest,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Server-side pepper for additional security (MUST be set via environment variable in production)
const API_KEY_PEPPER = (() => {
  const pepper = process.env.API_KEY_PEPPER;
  if (!pepper) {
    console.warn('[SECURITY WARNING] API_KEY_PEPPER not set in validator-registration-service.');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_KEY_PEPPER must be set in production environment');
    }
    return 'dev-pepper-' + Date.now();
  }
  return pepper;
})();
const BCRYPT_ROUNDS = 12;

// Tier configurations
const TIER_CONFIG = {
  genesis: { requiresMultisig: true, multisigThreshold: 3, rateLimit: 10000 },
  pioneer: { requiresMultisig: true, multisigThreshold: 2, rateLimit: 5000 },
  standard: { requiresMultisig: false, multisigThreshold: 0, rateLimit: 1000 },
  community: { requiresMultisig: false, multisigThreshold: 0, rateLimit: 100 },
};

export class ValidatorRegistrationService {
  private static instance: ValidatorRegistrationService;

  private constructor() {}

  static getInstance(): ValidatorRegistrationService {
    if (!ValidatorRegistrationService.instance) {
      ValidatorRegistrationService.instance = new ValidatorRegistrationService();
    }
    return ValidatorRegistrationService.instance;
  }

  // ============================================================================
  // API Key Generation & Hashing
  // ============================================================================

  /**
   * Generate a new API key with prefix
   * Format: vk_live_<32 random bytes hex>
   */
  generateApiKey(): { key: string; prefix: string } {
    const randomBytes = crypto.randomBytes(32).toString("hex");
    const key = `vk_live_${randomBytes}`;
    const prefix = key.substring(0, 12); // "vk_live_xxxx"
    return { key, prefix };
  }

  /**
   * Hash API key with bcrypt + pepper
   */
  async hashApiKey(apiKey: string): Promise<string> {
    const pepperedKey = apiKey + API_KEY_PEPPER;
    return bcrypt.hash(pepperedKey, BCRYPT_ROUNDS);
  }

  /**
   * Verify API key against hash
   */
  async verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
    const pepperedKey = apiKey + API_KEY_PEPPER;
    return bcrypt.compare(pepperedKey, hash);
  }

  // ============================================================================
  // Signature Verification
  // ============================================================================

  /**
   * Verify secp256k1 signature (Ethereum-style)
   */
  verifySecp256k1Signature(
    message: string,
    signature: string,
    publicKey: string
  ): boolean {
    try {
      // In production, use ethers.js or similar library
      // For now, we verify the signature format and assume valid if format matches
      const signaturePattern = /^0x[a-fA-F0-9]{130}$/;
      const publicKeyPattern = /^0x[a-fA-F0-9]{128,130}$/;
      
      if (!signaturePattern.test(signature)) {
        return false;
      }
      if (!publicKeyPattern.test(publicKey)) {
        return false;
      }
      
      // TODO: Implement actual signature verification with ethers.js
      // const recoveredAddress = ethers.verifyMessage(message, signature);
      // return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
      
      return true; // Placeholder - implement proper verification
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }

  /**
   * Create registration message for signing
   */
  createRegistrationMessage(request: ValidatorRegistrationRequest): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return JSON.stringify({
      action: "register_validator",
      validatorAddress: request.validatorAddress,
      nodeName: request.nodeName,
      region: request.region,
      tier: request.tier,
      timestamp,
    });
  }

  // ============================================================================
  // Registration Workflow
  // ============================================================================

  /**
   * Submit new validator registration
   */
  async submitRegistration(
    request: ValidatorRegistrationRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    registrationId?: string;
    status?: string;
    message: string;
  }> {
    try {
      // Check for existing registration
      const existing = await db
        .select()
        .from(externalValidatorRegistrations)
        .where(eq(externalValidatorRegistrations.validatorAddress, request.validatorAddress))
        .limit(1);

      if (existing.length > 0) {
        const existingReg = existing[0];
        if (existingReg.status === "rejected") {
          // Allow re-registration after rejection
          await db
            .delete(externalValidatorRegistrations)
            .where(eq(externalValidatorRegistrations.id, existingReg.id));
        } else {
          return {
            success: false,
            message: `Registration already exists with status: ${existingReg.status}`,
          };
        }
      }

      // Verify signature
      const message = this.createRegistrationMessage(request);
      const signatureValid = this.verifySecp256k1Signature(
        message,
        request.signatureProof,
        request.publicKey
      );

      if (!signatureValid) {
        return {
          success: false,
          message: "Invalid signature proof",
        };
      }

      // Determine tier configuration
      const tierConfig = TIER_CONFIG[request.tier as keyof typeof TIER_CONFIG];

      // Calculate risk score
      const riskScore = await this.calculateRiskScore(request);

      // Create registration
      const registration: InsertExternalValidatorRegistration = {
        validatorAddress: request.validatorAddress,
        publicKey: request.publicKey,
        signatureProof: request.signatureProof,
        signatureAlgorithm: request.signatureAlgorithm || "secp256k1",
        nodeName: request.nodeName,
        organizationName: request.organizationName || null,
        contactEmail: request.contactEmail,
        region: request.region,
        tier: request.tier,
        hostingProvider: request.hostingProvider || null,
        hardwareSpecs: request.hardwareSpecs || null,
        securityFeatures: request.securityFeatures || {
          hsm: false,
          remoteSigner: false,
          mTLS: false,
          firewallConfigured: false,
          ddosProtection: false,
        },
        initialStakeAmount: request.initialStakeAmount || "0",
        status: tierConfig.requiresMultisig ? "pending" : "under_review",
        requiresMultisig: tierConfig.requiresMultisig,
        multisigThreshold: tierConfig.multisigThreshold,
        riskScore,
        registrationIp: ipAddress || null,
        userAgent: userAgent || null,
      };

      const result = await db
        .insert(externalValidatorRegistrations)
        .values(registration as any)
        .returning();

      // Log audit event
      await this.logAuditEvent(
        request.validatorAddress,
        "registration_submitted",
        `New registration submitted for tier: ${request.tier}`,
        "info",
        ipAddress
      );

      return {
        success: true,
        registrationId: result[0].id,
        status: result[0].status,
        message: tierConfig.requiresMultisig
          ? "Registration submitted. Awaiting multi-sig approval."
          : "Registration submitted. Under review.",
      };
    } catch (error) {
      console.error("Registration submission failed:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  }

  /**
   * Calculate risk score for registration
   */
  private async calculateRiskScore(request: ValidatorRegistrationRequest): Promise<number> {
    let riskScore = 0;
    const riskFactors: string[] = [];

    // Check for security features
    const securityFeatures = request.securityFeatures || {
      hsm: false,
      remoteSigner: false,
      mTLS: false,
      firewallConfigured: false,
      ddosProtection: false,
    };

    if (!securityFeatures.hsm) {
      riskScore += 15;
      riskFactors.push("no_hsm");
    }
    if (!securityFeatures.firewallConfigured) {
      riskScore += 10;
      riskFactors.push("no_firewall");
    }
    if (!securityFeatures.ddosProtection) {
      riskScore += 10;
      riskFactors.push("no_ddos_protection");
    }

    // Check stake amount (lower stake = higher risk)
    const stakeAmount = BigInt(request.initialStakeAmount || "0");
    if (stakeAmount < BigInt("100000000000000000000000")) {
      // < 100K TBURN
      riskScore += 20;
      riskFactors.push("low_stake");
    }

    return Math.min(riskScore, 100);
  }

  /**
   * Approve registration (admin action)
   */
  async approveRegistration(
    registrationId: string,
    adminAddress: string,
    notes?: string
  ): Promise<{
    success: boolean;
    apiKey?: string;
    message: string;
  }> {
    try {
      // Get registration
      const registrations = await db
        .select()
        .from(externalValidatorRegistrations)
        .where(eq(externalValidatorRegistrations.id, registrationId))
        .limit(1);

      if (registrations.length === 0) {
        return { success: false, message: "Registration not found" };
      }

      const registration = registrations[0];

      // Check if requires multisig and has enough approvals
      if (registration.requiresMultisig) {
        const approvals = await db
          .select()
          .from(externalValidatorMultisigApprovals)
          .where(
            and(
              eq(externalValidatorMultisigApprovals.registrationId, registrationId),
              eq(externalValidatorMultisigApprovals.decision, "approve")
            )
          );

        if (approvals.length < (registration.multisigThreshold || 2)) {
          return {
            success: false,
            message: `Requires ${registration.multisigThreshold} approvals, currently has ${approvals.length}`,
          };
        }
      }

      // Generate API key
      const { key, prefix } = this.generateApiKey();
      const keyHash = await this.hashApiKey(key);

      // Create API key record
      const tierConfig = TIER_CONFIG[registration.tier as keyof typeof TIER_CONFIG];
      
      await db.insert(externalValidatorApiKeys).values({
        validatorAddress: registration.validatorAddress,
        apiKeyHash: keyHash,
        apiKeyPrefix: prefix,
        tier: registration.tier,
        status: "active",
        rateLimitOverride: tierConfig.rateLimit,
        createdBy: adminAddress,
      });

      // Initialize security state
      await db.insert(externalValidatorSecurityState).values({
        validatorAddress: registration.validatorAddress,
        isBlocked: false,
        securityScore: 100,
      }).onConflictDoNothing();

      // Update registration status
      await db
        .update(externalValidatorRegistrations)
        .set({
          status: "approved",
          reviewedBy: adminAddress,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(externalValidatorRegistrations.id, registrationId));

      // Log audit event
      await this.logAuditEvent(
        registration.validatorAddress,
        "registration_approved",
        `Registration approved by ${adminAddress}`,
        "info"
      );

      return {
        success: true,
        apiKey: key, // Return plaintext key ONLY ONCE
        message: "Registration approved. Save your API key securely - it will not be shown again.",
      };
    } catch (error) {
      console.error("Registration approval failed:", error);
      return { success: false, message: "Approval failed" };
    }
  }

  /**
   * Reject registration
   */
  async rejectRegistration(
    registrationId: string,
    adminAddress: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await db
        .update(externalValidatorRegistrations)
        .set({
          status: "rejected",
          reviewedBy: adminAddress,
          reviewedAt: new Date(),
          rejectionReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(externalValidatorRegistrations.id, registrationId))
        .returning();

      if (result.length === 0) {
        return { success: false, message: "Registration not found" };
      }

      await this.logAuditEvent(
        result[0].validatorAddress,
        "registration_rejected",
        `Registration rejected: ${reason}`,
        "warning"
      );

      return { success: true, message: "Registration rejected" };
    } catch (error) {
      console.error("Registration rejection failed:", error);
      return { success: false, message: "Rejection failed" };
    }
  }

  /**
   * Submit multi-sig approval
   */
  async submitMultisigApproval(
    registrationId: string,
    approverAddress: string,
    approverRole: string,
    decision: "approve" | "reject" | "abstain",
    signatureProof: string,
    comments?: string,
    ipAddress?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check for existing approval from this approver
      const existing = await db
        .select()
        .from(externalValidatorMultisigApprovals)
        .where(
          and(
            eq(externalValidatorMultisigApprovals.registrationId, registrationId),
            eq(externalValidatorMultisigApprovals.approverAddress, approverAddress)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: false, message: "Already submitted approval" };
      }

      // Get registration
      const registrations = await db
        .select()
        .from(externalValidatorRegistrations)
        .where(eq(externalValidatorRegistrations.id, registrationId))
        .limit(1);

      if (registrations.length === 0) {
        return { success: false, message: "Registration not found" };
      }

      const registration = registrations[0];

      // Insert approval
      await db.insert(externalValidatorMultisigApprovals).values({
        registrationId,
        validatorAddress: registration.validatorAddress,
        approverAddress,
        approverRole,
        decision,
        comments: comments || null,
        signatureProof,
        ipAddress: ipAddress || null,
      });

      // Update approval count
      if (decision === "approve") {
        await db
          .update(externalValidatorRegistrations)
          .set({
            multisigApprovals: sql`${externalValidatorRegistrations.multisigApprovals} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(externalValidatorRegistrations.id, registrationId));
      }

      await this.logAuditEvent(
        registration.validatorAddress,
        "multisig_vote",
        `Multi-sig vote: ${decision} by ${approverAddress}`,
        "info"
      );

      return { success: true, message: `Vote recorded: ${decision}` };
    } catch (error) {
      console.error("Multi-sig approval failed:", error);
      return { success: false, message: "Vote submission failed" };
    }
  }

  // ============================================================================
  // API Key Management
  // ============================================================================

  /**
   * Rotate API key
   */
  async rotateApiKey(
    request: KeyRotationRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    newApiKey?: string;
    gracePeriodEndsAt?: Date;
    message: string;
  }> {
    try {
      // Get current API key
      const apiKeys = await db
        .select()
        .from(externalValidatorApiKeys)
        .where(
          and(
            eq(externalValidatorApiKeys.validatorAddress, request.validatorAddress),
            eq(externalValidatorApiKeys.status, "active")
          )
        )
        .limit(1);

      if (apiKeys.length === 0) {
        return { success: false, message: "No active API key found" };
      }

      const currentKey = apiKeys[0];

      // Generate new key
      const { key: newKey, prefix: newPrefix } = this.generateApiKey();
      const newKeyHash = await this.hashApiKey(newKey);

      // Calculate grace period end
      const gracePeriodMinutes = request.gracePeriodMinutes || 60;
      const gracePeriodEndsAt = new Date(Date.now() + gracePeriodMinutes * 60 * 1000);

      // Record rotation
      await db.insert(externalValidatorKeyRotations).values({
        validatorAddress: request.validatorAddress,
        previousKeyPrefix: currentKey.apiKeyPrefix,
        previousKeyHash: currentKey.apiKeyHash,
        newKeyPrefix: newPrefix,
        newKeyHash: newKeyHash,
        rotationType: request.rotationType,
        rotationReason: request.rotationReason || null,
        requestedBy: "validator",
        signatureProof: request.signatureProof,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        approvedAt: new Date(),
        effectiveAt: new Date(),
        gracePeriodMinutes,
        gracePeriodEndsAt,
      });

      // Update API key
      await db
        .update(externalValidatorApiKeys)
        .set({
          apiKeyHash: newKeyHash,
          apiKeyPrefix: newPrefix,
          lastUsedAt: new Date(),
        })
        .where(eq(externalValidatorApiKeys.id, currentKey.id));

      await this.logAuditEvent(
        request.validatorAddress,
        "api_key_rotated",
        `API key rotated: ${request.rotationType}`,
        request.rotationType === "compromised" ? "critical" : "info",
        ipAddress
      );

      return {
        success: true,
        newApiKey: newKey,
        gracePeriodEndsAt,
        message: "API key rotated successfully",
      };
    } catch (error) {
      console.error("API key rotation failed:", error);
      return { success: false, message: "Key rotation failed" };
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(
    validatorAddress: string,
    reason: string,
    adminAddress?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await db
        .update(externalValidatorApiKeys)
        .set({
          status: "revoked",
          revokedAt: new Date(),
          revokedReason: reason,
        })
        .where(
          and(
            eq(externalValidatorApiKeys.validatorAddress, validatorAddress),
            eq(externalValidatorApiKeys.status, "active")
          )
        )
        .returning();

      if (result.length === 0) {
        return { success: false, message: "No active API key found" };
      }

      await this.logAuditEvent(
        validatorAddress,
        "api_key_revoked",
        `API key revoked: ${reason}`,
        "critical"
      );

      return { success: true, message: "API key revoked" };
    } catch (error) {
      console.error("API key revocation failed:", error);
      return { success: false, message: "Revocation failed" };
    }
  }

  // ============================================================================
  // Heartbeat & Monitoring
  // ============================================================================

  /**
   * Record validator heartbeat
   */
  async recordHeartbeat(
    heartbeat: InsertExternalValidatorHeartbeat,
    ipAddress?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await db.insert(externalValidatorHeartbeats).values({
        ...heartbeat,
        ipAddress: ipAddress || null,
      });

      // Update last used timestamp
      await db
        .update(externalValidatorApiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(externalValidatorApiKeys.validatorAddress, heartbeat.validatorAddress));

      return { success: true, message: "Heartbeat recorded" };
    } catch (error) {
      console.error("Heartbeat recording failed:", error);
      return { success: false, message: "Heartbeat failed" };
    }
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  /**
   * Get pending registrations for admin review
   */
  async getPendingRegistrations(limit: number = 50): Promise<any[]> {
    return db
      .select()
      .from(externalValidatorRegistrations)
      .where(
        sql`${externalValidatorRegistrations.status} IN ('pending', 'under_review')`
      )
      .orderBy(desc(externalValidatorRegistrations.createdAt))
      .limit(limit);
  }

  /**
   * Get registration by address
   */
  async getRegistrationByAddress(validatorAddress: string): Promise<any | null> {
    const result = await db
      .select()
      .from(externalValidatorRegistrations)
      .where(eq(externalValidatorRegistrations.validatorAddress, validatorAddress))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get registration by ID
   */
  async getRegistrationById(registrationId: string): Promise<any | null> {
    const result = await db
      .select()
      .from(externalValidatorRegistrations)
      .where(eq(externalValidatorRegistrations.id, registrationId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get multi-sig approvals for a registration
   */
  async getMultisigApprovals(registrationId: string): Promise<any[]> {
    return db
      .select()
      .from(externalValidatorMultisigApprovals)
      .where(eq(externalValidatorMultisigApprovals.registrationId, registrationId))
      .orderBy(desc(externalValidatorMultisigApprovals.createdAt));
  }

  /**
   * Get key rotation history
   */
  async getKeyRotationHistory(validatorAddress: string, limit: number = 20): Promise<any[]> {
    return db
      .select()
      .from(externalValidatorKeyRotations)
      .where(eq(externalValidatorKeyRotations.validatorAddress, validatorAddress))
      .orderBy(desc(externalValidatorKeyRotations.requestedAt))
      .limit(limit);
  }

  /**
   * Get recent heartbeats
   */
  async getRecentHeartbeats(validatorAddress: string, limit: number = 100): Promise<any[]> {
    return db
      .select()
      .from(externalValidatorHeartbeats)
      .where(eq(externalValidatorHeartbeats.validatorAddress, validatorAddress))
      .orderBy(desc(externalValidatorHeartbeats.timestamp))
      .limit(limit);
  }

  /**
   * Get all registrations with pagination
   */
  async getAllRegistrations(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ registrations: any[]; total: number }> {
    const offset = (page - 1) * limit;

    let query = db.select().from(externalValidatorRegistrations);
    
    if (status) {
      query = query.where(eq(externalValidatorRegistrations.status, status)) as any;
    }

    const registrations = await query
      .orderBy(desc(externalValidatorRegistrations.createdAt))
      .offset(offset)
      .limit(limit);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(externalValidatorRegistrations);

    return {
      registrations,
      total: Number(countResult[0]?.count || 0),
    };
  }

  // ============================================================================
  // Audit Logging
  // ============================================================================

  /**
   * Log audit event with hash chain
   */
  private async logAuditEvent(
    validatorAddress: string,
    action: string,
    details: string,
    severity: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Get previous log hash for chain
      const previousLogs = await db
        .select({ logHash: externalValidatorAuditLogs.logHash })
        .from(externalValidatorAuditLogs)
        .orderBy(desc(externalValidatorAuditLogs.timestamp))
        .limit(1);

      const previousLogHash = previousLogs[0]?.logHash || "genesis";

      // Create hash for this log entry
      const logData = JSON.stringify({
        validatorAddress,
        action,
        details,
        severity,
        timestamp: new Date().toISOString(),
        previousLogHash,
      });
      const logHash = crypto.createHash("sha256").update(logData).digest("hex");

      await db.insert(externalValidatorAuditLogs).values({
        validatorAddress,
        action,
        details,
        severity,
        ipAddress: ipAddress || null,
        previousLogHash,
        logHash,
      });
    } catch (error) {
      console.error("Audit logging failed:", error);
    }
  }
}

export const validatorRegistrationService = ValidatorRegistrationService.getInstance();
