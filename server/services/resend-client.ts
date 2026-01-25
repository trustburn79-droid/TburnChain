/**
 * Resend Email Client
 * Uses Replit's Resend connector for secure API key management
 */

import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
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

export async function getUncachableResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendVerificationEmail(
  toEmail: string,
  verificationCode: string,
  signerName: string,
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const result = await client.emails.send({
      from: fromEmail || 'TBURN Custody <noreply@tburn.io>',
      to: toEmail,
      subject: `[TBURN Custody] 트랜잭션 승인 인증 코드 - ${verificationCode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 16px; padding: 40px; text-align: center;">
              
              <div style="margin-bottom: 32px;">
                <img src="https://tburn.io/logo.png" alt="TBURN" style="height: 48px; width: auto;" onerror="this.style.display='none'">
                <h1 style="color: #f1f5f9; font-size: 24px; margin: 16px 0 0 0; font-weight: 600;">TBURN Custody System</h1>
              </div>
              
              <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0;">트랜잭션 승인을 위한 인증 코드</p>
                <div style="background: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                  <span style="font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 700; color: #06b6d4; letter-spacing: 8px;">${verificationCode}</span>
                </div>
                <p style="color: #64748b; font-size: 12px; margin: 0;">이 코드는 10분 후 만료됩니다</p>
              </div>
              
              <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left;">
                <p style="color: #fbbf24; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">⚠️ 보안 알림</p>
                <ul style="color: #94a3b8; font-size: 13px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 4px;">이 코드를 다른 사람과 공유하지 마세요</li>
                  <li style="margin-bottom: 4px;">TBURN 팀은 절대 이 코드를 요청하지 않습니다</li>
                  <li>본인이 요청하지 않은 경우 이 이메일을 무시하세요</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #334155; padding-top: 24px;">
                <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
                  서명자: <span style="color: #f1f5f9;">${signerName}</span>
                </p>
                <p style="color: #64748b; font-size: 12px; margin: 0;">
                  트랜잭션 ID: <span style="color: #06b6d4; font-family: monospace;">${transactionId.substring(0, 16)}...</span>
                </p>
              </div>
              
            </div>
            
            <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 24px;">
              © 2026 TBURN Foundation. All rights reserved.<br>
              This is an automated message from the TBURN Custody System.
            </p>
          </div>
        </body>
        </html>
      `
    });

    console.log('[Resend] Verification email sent:', { toEmail, transactionId, messageId: result.data?.id });
    return { success: true };
  } catch (error: any) {
    console.error('[Resend] Failed to send verification email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}
