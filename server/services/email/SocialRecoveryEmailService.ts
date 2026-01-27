import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export type RecoveryEmailType = 
  | 'RECOVERY_INITIATED'
  | 'APPROVAL_REQUESTED'
  | 'RECOVERY_APPROVED'
  | 'RECOVERY_REJECTED'
  | 'TIMELOCK_STARTED'
  | 'RECOVERY_EXECUTABLE'
  | 'RECOVERY_EXECUTED'
  | 'RECOVERY_CANCELLED'
  | 'GUARDIAN_ADDED'
  | 'GUARDIAN_REMOVED';

interface EmailContext {
  walletAddress: string;
  sessionId?: string;
  guardianEmail?: string;
  newOwner?: string;
  initiatorEmail?: string;
  threshold?: number;
  approvalCount?: number;
  requiredApprovals?: number;
  timelockEndsAt?: Date;
  expiresAt?: Date;
  nickname?: string;
}

class SocialRecoveryEmailService {
  private static instance: SocialRecoveryEmailService;
  private enabled: boolean = true;

  private constructor() {
    console.log('[SocialRecoveryEmail] Service initialized');
  }

  static getInstance(): SocialRecoveryEmailService {
    if (!SocialRecoveryEmailService.instance) {
      SocialRecoveryEmailService.instance = new SocialRecoveryEmailService();
    }
    return SocialRecoveryEmailService.instance;
  }

  async sendEmail(type: RecoveryEmailType, to: string | string[], context: EmailContext): Promise<boolean> {
    if (!this.enabled) {
      console.log(`[SocialRecoveryEmail] Email disabled, skipping ${type} to ${to}`);
      return false;
    }

    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const { subject, html } = this.generateEmailContent(type, context);
      
      const recipients = Array.isArray(to) ? to : [to];
      
      for (const recipient of recipients) {
        await client.emails.send({
          from: fromEmail || 'noreply@tburn.io',
          to: recipient,
          subject,
          html
        });
        console.log(`[SocialRecoveryEmail] Sent ${type} email to ${recipient}`);
      }
      
      return true;
    } catch (error) {
      console.error(`[SocialRecoveryEmail] Failed to send ${type} email:`, error);
      return false;
    }
  }

  private generateEmailContent(type: RecoveryEmailType, context: EmailContext): { subject: string; html: string } {
    const templates: Record<RecoveryEmailType, { subject: string; html: string }> = {
      RECOVERY_INITIATED: {
        subject: '[TBURN] Wallet Recovery Initiated - Action Required',
        html: this.recoveryInitiatedTemplate(context)
      },
      APPROVAL_REQUESTED: {
        subject: '[TBURN] Your Approval Needed for Wallet Recovery',
        html: this.approvalRequestedTemplate(context)
      },
      RECOVERY_APPROVED: {
        subject: '[TBURN] Recovery Approval Received',
        html: this.recoveryApprovedTemplate(context)
      },
      RECOVERY_REJECTED: {
        subject: '[TBURN] Recovery Request Rejected',
        html: this.recoveryRejectedTemplate(context)
      },
      TIMELOCK_STARTED: {
        subject: '[TBURN] Recovery Timelock Period Started',
        html: this.timelockStartedTemplate(context)
      },
      RECOVERY_EXECUTABLE: {
        subject: '[TBURN] Wallet Recovery Ready to Execute',
        html: this.recoveryExecutableTemplate(context)
      },
      RECOVERY_EXECUTED: {
        subject: '[TBURN] Wallet Recovery Successfully Completed',
        html: this.recoveryExecutedTemplate(context)
      },
      RECOVERY_CANCELLED: {
        subject: '[TBURN] Wallet Recovery Cancelled',
        html: this.recoveryCancelledTemplate(context)
      },
      GUARDIAN_ADDED: {
        subject: '[TBURN] You Have Been Added as a Guardian',
        html: this.guardianAddedTemplate(context)
      },
      GUARDIAN_REMOVED: {
        subject: '[TBURN] You Have Been Removed as a Guardian',
        html: this.guardianRemovedTemplate(context)
      }
    };

    return templates[type];
  }

  private baseTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .header .badge { background: #f97316; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-top: 10px; display: inline-block; }
          .content { padding: 30px; color: #333333; }
          .content h2 { color: #1a1a2e; margin-top: 0; }
          .info-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .danger-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          .wallet { font-family: monospace; background: #e5e7eb; padding: 8px 12px; border-radius: 4px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TBURN Blockchain</h1>
            <span class="badge">2026 Next-Gen Technology</span>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>This is an automated message from TBURN Social Recovery System.</p>
            <p>If you did not expect this email, please contact support immediately.</p>
            <p>&copy; 2026 TBURN Blockchain. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private recoveryInitiatedTemplate(context: EmailContext): string {
    return this.baseTemplate('Recovery Initiated', `
      <h2>Wallet Recovery Has Been Initiated</h2>
      <p>A recovery process has been initiated for the following wallet:</p>
      <div class="info-box">
        <p><strong>Wallet Address:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
        <p><strong>Initiated By:</strong> ${context.initiatorEmail || 'Unknown'}</p>
        <p><strong>New Owner:</strong></p>
        <p class="wallet">${context.newOwner || 'Not specified'}</p>
      </div>
      <div class="warning-box">
        <p><strong>Important:</strong> If you did not initiate this recovery or do not recognize this request, please contact support immediately.</p>
      </div>
    `);
  }

  private approvalRequestedTemplate(context: EmailContext): string {
    return this.baseTemplate('Approval Requested', `
      <h2>Your Approval is Needed</h2>
      <p>You have been designated as a guardian for a TBURN wallet, and your approval is needed for a recovery request.</p>
      <div class="info-box">
        <p><strong>Wallet to Recover:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
        <p><strong>New Owner Address:</strong></p>
        <p class="wallet">${context.newOwner || 'Not specified'}</p>
        <p><strong>Approvals:</strong> ${context.approvalCount || 0} / ${context.requiredApprovals || 0}</p>
        ${context.expiresAt ? `<p><strong>Expires:</strong> ${context.expiresAt.toLocaleString()}</p>` : ''}
      </div>
      <div class="warning-box">
        <p><strong>Before approving:</strong></p>
        <ul>
          <li>Verify that the wallet owner actually requested this recovery</li>
          <li>Confirm the new owner address is correct</li>
          <li>Contact the wallet owner through a separate channel if unsure</li>
        </ul>
      </div>
      <p>Log in to TBURN to approve or reject this recovery request.</p>
    `);
  }

  private recoveryApprovedTemplate(context: EmailContext): string {
    return this.baseTemplate('Recovery Approved', `
      <h2>Guardian Approval Received</h2>
      <p>A guardian has approved the recovery request for your wallet.</p>
      <div class="success-box">
        <p><strong>Wallet:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
        <p><strong>Approved By:</strong> ${context.guardianEmail || 'Guardian'}</p>
        <p><strong>Progress:</strong> ${context.approvalCount || 0} / ${context.requiredApprovals || 0} approvals received</p>
      </div>
      ${(context.approvalCount || 0) >= (context.requiredApprovals || 0) ? 
        `<div class="info-box"><p>All required approvals have been received. The timelock period will now begin.</p></div>` : 
        `<p>Waiting for ${(context.requiredApprovals || 0) - (context.approvalCount || 0)} more approval(s).</p>`
      }
    `);
  }

  private recoveryRejectedTemplate(context: EmailContext): string {
    return this.baseTemplate('Recovery Rejected', `
      <h2>Recovery Request Rejected</h2>
      <p>A guardian has rejected the recovery request.</p>
      <div class="danger-box">
        <p><strong>Wallet:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
        <p><strong>Rejected By:</strong> ${context.guardianEmail || 'Guardian'}</p>
      </div>
      <p>The recovery process has been terminated. If this was a legitimate request, please initiate a new recovery.</p>
    `);
  }

  private timelockStartedTemplate(context: EmailContext): string {
    return this.baseTemplate('Timelock Started', `
      <h2>Recovery Timelock Period Has Started</h2>
      <p>All required guardian approvals have been received. The security timelock period has begun.</p>
      <div class="info-box">
        <p><strong>Wallet:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
        ${context.timelockEndsAt ? `<p><strong>Timelock Ends:</strong> ${context.timelockEndsAt.toLocaleString()}</p>` : ''}
      </div>
      <div class="warning-box">
        <p><strong>Note:</strong> During the timelock period, the recovery can still be cancelled by an authorized party. This is a security measure to prevent unauthorized transfers.</p>
      </div>
    `);
  }

  private recoveryExecutableTemplate(context: EmailContext): string {
    return this.baseTemplate('Recovery Ready', `
      <h2>Recovery Ready to Execute</h2>
      <p>The timelock period has ended. The wallet recovery can now be executed.</p>
      <div class="success-box">
        <p><strong>Wallet:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
        <p><strong>New Owner:</strong></p>
        <p class="wallet">${context.newOwner || 'Not specified'}</p>
      </div>
      <p>Log in to TBURN to complete the recovery process.</p>
    `);
  }

  private recoveryExecutedTemplate(context: EmailContext): string {
    return this.baseTemplate('Recovery Complete', `
      <h2>Wallet Recovery Successfully Completed</h2>
      <p>The wallet ownership has been successfully transferred.</p>
      <div class="success-box">
        <p><strong>Wallet:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
        <p><strong>New Owner:</strong></p>
        <p class="wallet">${context.newOwner || 'Not specified'}</p>
      </div>
      <p>The new owner now has full control of the wallet.</p>
    `);
  }

  private recoveryCancelledTemplate(context: EmailContext): string {
    return this.baseTemplate('Recovery Cancelled', `
      <h2>Wallet Recovery Has Been Cancelled</h2>
      <p>The recovery process for the following wallet has been cancelled.</p>
      <div class="info-box">
        <p><strong>Wallet:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
      </div>
      <p>No changes have been made to the wallet ownership.</p>
    `);
  }

  private guardianAddedTemplate(context: EmailContext): string {
    return this.baseTemplate('Guardian Added', `
      <h2>You Have Been Added as a Recovery Guardian</h2>
      <p>You have been designated as a guardian for a TBURN wallet. This means you can help recover the wallet if the owner loses access.</p>
      <div class="info-box">
        <p><strong>Protected Wallet:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
        ${context.nickname ? `<p><strong>Your Nickname:</strong> ${context.nickname}</p>` : ''}
      </div>
      <div class="warning-box">
        <p><strong>Your Responsibilities:</strong></p>
        <ul>
          <li>Keep your email secure - recovery requests will be sent here</li>
          <li>Only approve recovery requests from verified wallet owners</li>
          <li>Contact the wallet owner through a separate channel before approving</li>
        </ul>
      </div>
    `);
  }

  private guardianRemovedTemplate(context: EmailContext): string {
    return this.baseTemplate('Guardian Removed', `
      <h2>You Have Been Removed as a Guardian</h2>
      <p>You are no longer a guardian for the following TBURN wallet.</p>
      <div class="info-box">
        <p><strong>Wallet:</strong></p>
        <p class="wallet">${context.walletAddress}</p>
      </div>
      <p>You will no longer receive recovery requests for this wallet.</p>
    `);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`[SocialRecoveryEmail] Email notifications ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export const socialRecoveryEmailService = SocialRecoveryEmailService.getInstance();
