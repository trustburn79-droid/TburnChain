"use strict";
/**
 * TBURN Validator Health Check CLI
 * Checks validator and signer health
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const METRICS_PORT = parseInt(process.env.METRICS_PORT || '8080');
async function checkHealth() {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${METRICS_PORT}/health`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch (e) {
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
function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
async function main() {
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
        }
        else {
            console.log('✗ Validator is not healthy');
            process.exit(1);
        }
    }
    catch (error) {
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
//# sourceMappingURL=health.js.map