"use strict";
/**
 * TBURN Validator Status CLI
 * Shows detailed validator status and metrics
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
async function getStatus() {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${METRICS_PORT}/status`, (res) => {
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
function formatNumber(num) {
    return num.toLocaleString();
}
async function main() {
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
    }
    catch (error) {
        console.error('Failed to get status:', error);
        console.log('');
        console.log('Make sure the validator is running:');
        console.log('  npm run start:mainnet');
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=status.js.map