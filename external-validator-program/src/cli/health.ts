/**
 * TBURN Validator Health Check CLI
 * Checks validator and signer health
 */

import * as http from 'http';

const METRICS_PORT = parseInt(process.env.METRICS_PORT || '8080');

interface HealthResponse {
  status: string;
  uptime: number;
  validatorAddress: string;
  timestamp: string;
}

async function checkHealth(): Promise<HealthResponse> {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${METRICS_PORT}/health`, (res) => {
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

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     TBURN Validator Health Check                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    console.log(`Checking http://localhost:${METRICS_PORT}/health ...`);
    console.log('');

    const health = await checkHealth();

    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│                    Health Status                           │');
    console.log('├────────────────────────────────────────────────────────────┤');
    console.log(`│  Status:     ${health.status.toUpperCase().padEnd(45)}│`);
    console.log(`│  Validator:  ${health.validatorAddress.slice(0, 20)}...${health.validatorAddress.slice(-8).padEnd(22)}│`);
    console.log(`│  Uptime:     ${formatUptime(health.uptime).padEnd(45)}│`);
    console.log(`│  Timestamp:  ${health.timestamp.padEnd(45)}│`);
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');

    if (health.status === 'healthy') {
      console.log('✓ Validator is healthy and operational');
      process.exit(0);
    } else {
      console.log('✗ Validator is not healthy');
      process.exit(1);
    }

  } catch (error) {
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│                    Health Status                           │');
    console.log('├────────────────────────────────────────────────────────────┤');
    console.log('│  Status:     UNHEALTHY                                     │');
    console.log(`│  Error:      ${String(error).slice(0, 45).padEnd(45)}│`);
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('✗ Failed to connect to validator');
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check if validator is running: systemctl status tburn-validator');
    console.log('2. Check logs: journalctl -u tburn-validator -f');
    console.log(`3. Verify metrics port: ${METRICS_PORT}`);
    process.exit(1);
  }
}

main().catch(console.error);
