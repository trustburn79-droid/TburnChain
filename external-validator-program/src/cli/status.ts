/**
 * TBURN Validator Status CLI
 * Shows detailed validator status and metrics
 */

import * as http from 'http';

const METRICS_PORT = parseInt(process.env.METRICS_PORT || '8080');

interface StatusResponse {
  validatorAddress: string;
  uptime: number;
  metrics: {
    blocksProposed: number;
    attestationsMade: number;
    signingRequests: number;
    signingErrors: number;
    peerCount: number;
    currentSlot: number;
    currentEpoch: number;
  };
  timestamp: string;
}

async function getStatus(): Promise<StatusResponse> {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${METRICS_PORT}/status`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     TBURN Validator Status                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    const status = await getStatus();

    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│                    Validator Info                          │');
    console.log('├────────────────────────────────────────────────────────────┤');
    console.log(`│  Address:    ${status.validatorAddress.padEnd(45)}│`);
    console.log(`│  Uptime:     ${formatUptime(status.uptime).padEnd(45)}│`);
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');

    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│                    Chain Status                            │');
    console.log('├────────────────────────────────────────────────────────────┤');
    console.log(`│  Current Slot:   ${formatNumber(status.metrics.currentSlot).padEnd(40)}│`);
    console.log(`│  Current Epoch:  ${formatNumber(status.metrics.currentEpoch).padEnd(40)}│`);
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');

    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│                    Performance                             │');
    console.log('├────────────────────────────────────────────────────────────┤');
    console.log(`│  Blocks Proposed:    ${formatNumber(status.metrics.blocksProposed).padEnd(36)}│`);
    console.log(`│  Attestations Made:  ${formatNumber(status.metrics.attestationsMade).padEnd(36)}│`);
    console.log(`│  Signing Requests:   ${formatNumber(status.metrics.signingRequests).padEnd(36)}│`);
    console.log(`│  Signing Errors:     ${formatNumber(status.metrics.signingErrors).padEnd(36)}│`);
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');

    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│                    Network                                 │');
    console.log('├────────────────────────────────────────────────────────────┤');
    console.log(`│  Connected Peers:  ${formatNumber(status.metrics.peerCount).padEnd(38)}│`);
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');

    const errorRate = status.metrics.signingRequests > 0
      ? ((status.metrics.signingErrors / status.metrics.signingRequests) * 100).toFixed(2)
      : '0.00';
    
    console.log(`Signing Error Rate: ${errorRate}%`);
    console.log(`Last Updated: ${status.timestamp}`);

  } catch (error) {
    console.error('Failed to get status:', error);
    console.log('');
    console.log('Make sure the validator is running:');
    console.log('  npm run start:mainnet');
    process.exit(1);
  }
}

main().catch(console.error);
