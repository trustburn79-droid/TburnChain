#!/bin/bash
#
# TBURN Validator Node Deployment
# Run this on the Validator VM after signer deployment
#

set -e

VALIDATOR_DIR="/opt/tburn-validator"
CERT_DIR="/etc/tburn/certs"
LOG_DIR="/var/log/tburn"
DATA_DIR="/var/lib/tburn"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Load configuration
if [ -f "/opt/tburn-validator/.env" ]; then
    source /opt/tburn-validator/.env
fi

SIGNER_IP="${SIGNER_ENDPOINT:-10.0.0.2}"
VALIDATOR_ADDRESS="${VALIDATOR_ADDRESS:-}"
VALIDATOR_NAME="${VALIDATOR_NAME:-TBurnValidator}"

log_info "╔══════════════════════════════════════════════════════════════╗"
log_info "║     TBURN Validator Node Deployment                          ║"
log_info "╚══════════════════════════════════════════════════════════════╝"
log_info "Signer IP: $SIGNER_IP"
log_info "Validator: $VALIDATOR_NAME"

# Create directories
log_info "Creating directories..."
sudo mkdir -p $VALIDATOR_DIR
sudo mkdir -p $CERT_DIR
sudo mkdir -p $LOG_DIR
sudo mkdir -p $DATA_DIR

# Copy certificates from signer (must be done manually or via secure transfer)
if [ ! -f "$CERT_DIR/ca.crt" ]; then
    log_info "Certificates not found. Please copy from signer:"
    log_info "  scp signer:$CERT_DIR/ca.crt $CERT_DIR/"
    log_info "  scp signer:$CERT_DIR/client.crt $CERT_DIR/"
    log_info "  scp signer:$CERT_DIR/client.key $CERT_DIR/"
    log_error "Please copy certificates and run again"
fi

# Install Node.js dependencies
log_info "Installing dependencies..."
cd $VALIDATOR_DIR

cat > package.json <<EOF
{
  "name": "tburn-validator",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "ethers": "^6.9.0",
    "ws": "^8.14.0",
    "dotenv": "^16.3.1"
  }
}
EOF

npm install --production

# Create environment file
log_info "Creating environment configuration..."

cat > .env <<EOF
# TBURN Validator Configuration
TBURN_NETWORK=mainnet
TBURN_CHAIN_ID=5800
VALIDATOR_ADDRESS=$VALIDATOR_ADDRESS
VALIDATOR_NAME=$VALIDATOR_NAME
VALIDATOR_TIER=standard

# Remote Signer
SIGNER_ENDPOINT=https://$SIGNER_IP:8443
SIGNER_CA_CERT_PATH=$CERT_DIR/ca.crt
CLIENT_CERT_PATH=$CERT_DIR/client.crt
CLIENT_KEY_PATH=$CERT_DIR/client.key

# Network
P2P_PORT=30303
METRICS_PORT=8080
HEARTBEAT_INTERVAL_MS=30000

# Performance
BLOCK_TIME_MS=100
MAX_TX_PER_BLOCK=2000

# Logging
LOG_LEVEL=info
ENABLE_METRICS=true
EOF

# Create validator service code
log_info "Creating validator node code..."

cat > validator.js <<'VALIDATOR_CODE'
import https from 'https';
import fs from 'fs';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import http from 'http';

// Load environment
const config = {
    network: process.env.TBURN_NETWORK || 'mainnet',
    chainId: parseInt(process.env.TBURN_CHAIN_ID || '5800'),
    validatorAddress: process.env.VALIDATOR_ADDRESS,
    validatorName: process.env.VALIDATOR_NAME || 'TBurnValidator',
    tier: process.env.VALIDATOR_TIER || 'standard',
    signerEndpoint: process.env.SIGNER_ENDPOINT,
    p2pPort: parseInt(process.env.P2P_PORT || '30303'),
    metricsPort: parseInt(process.env.METRICS_PORT || '8080'),
    blockTimeMs: parseInt(process.env.BLOCK_TIME_MS || '100'),
    maxTxPerBlock: parseInt(process.env.MAX_TX_PER_BLOCK || '2000'),
    heartbeatIntervalMs: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '30000')
};

// Validate configuration
if (!config.validatorAddress) {
    console.error('VALIDATOR_ADDRESS is required');
    process.exit(1);
}

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         TBURN External Validator Node v1.0.0                 ║');
console.log('║         Chain ID: 5800 | TBURN Mainnet                       ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`Network: ${config.network}`);
console.log(`Validator: ${config.validatorAddress}`);
console.log(`Tier: ${config.tier}`);
console.log(`Signer: ${config.signerEndpoint}`);

// Load certificates
const certDir = process.env.SIGNER_CA_CERT_PATH?.replace('/ca.crt', '') || '/etc/tburn/certs';
let tlsOptions;
try {
    tlsOptions = {
        ca: fs.readFileSync(`${certDir}/ca.crt`),
        cert: fs.readFileSync(`${certDir}/client.crt`),
        key: fs.readFileSync(`${certDir}/client.key`)
    };
    console.log('Certificates loaded successfully');
} catch (e) {
    console.error('Failed to load certificates:', e.message);
    process.exit(1);
}

// Metrics
let currentSlot = 0;
let currentEpoch = 0;
let blocksProposed = 0;
let attestationsMade = 0;
let startTime = Date.now();

// Remote Signer Client
async function signRequest(operation, payload) {
    return new Promise((resolve, reject) => {
        const url = new URL(config.signerEndpoint);
        const request = {
            requestId: crypto.randomUUID(),
            validatorAddress: config.validatorAddress,
            operation,
            payload,
            timestamp: Date.now(),
            nonce: crypto.randomBytes(16).toString('hex')
        };
        
        const options = {
            hostname: url.hostname,
            port: url.port || 8443,
            path: '/',
            method: 'POST',
            ...tlsOptions,
            headers: { 'Content-Type': 'application/json' }
        };
        
        const req = https.request(options, (res) => {
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
        req.write(JSON.stringify(request));
        req.end();
    });
}

// Slot timer
setInterval(async () => {
    currentSlot++;
    if (currentSlot % 32 === 0) currentEpoch++;
    
    // Check if we should propose
    const hash = crypto.createHash('sha256').update(`${currentSlot}-${config.chainId}`).digest('hex');
    const proposerIndex = parseInt(hash.slice(0, 8), 16) % 125;
    const validatorIndex = parseInt(config.validatorAddress.slice(2, 10), 16) % 125;
    
    if (proposerIndex === validatorIndex) {
        try {
            const result = await signRequest('SIGN_BLOCK', { slot: currentSlot });
            if (result.success) {
                blocksProposed++;
                console.log(`Block proposed: slot ${currentSlot}`);
            }
        } catch (e) {
            console.error('Block signing failed:', e.message);
        }
    }
    
    // Attestation
    try {
        const result = await signRequest('SIGN_ATTESTATION', { slot: currentSlot, epoch: currentEpoch });
        if (result.success) attestationsMade++;
    } catch (e) {
        console.error('Attestation signing failed:', e.message);
    }
}, config.blockTimeMs);

// Heartbeat
setInterval(() => {
    console.log(`Heartbeat: slot ${currentSlot}, epoch ${currentEpoch}, blocks ${blocksProposed}, attestations ${attestationsMade}`);
}, config.heartbeatIntervalMs);

// Metrics server
const metricsServer = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            uptime: Date.now() - startTime,
            validator: config.validatorAddress
        }));
    } else if (req.url === '/metrics') {
        const metrics = `
tburn_validator_blocks_proposed_total{validator="${config.validatorAddress}"} ${blocksProposed}
tburn_validator_attestations_made_total{validator="${config.validatorAddress}"} ${attestationsMade}
tburn_validator_current_slot{validator="${config.validatorAddress}"} ${currentSlot}
tburn_validator_current_epoch{validator="${config.validatorAddress}"} ${currentEpoch}
tburn_validator_uptime_seconds{validator="${config.validatorAddress}"} ${(Date.now() - startTime) / 1000}
`.trim();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(metrics);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

metricsServer.listen(config.metricsPort, () => {
    console.log(`Metrics server on port ${config.metricsPort}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down...');
    metricsServer.close();
    process.exit(0);
});

console.log('Validator node started');
VALIDATOR_CODE

# Create systemd service
log_info "Creating systemd service..."

sudo tee /etc/systemd/system/tburn-validator.service > /dev/null <<EOF
[Unit]
Description=TBURN Validator Node
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$VALIDATOR_DIR
ExecStart=/usr/bin/node $VALIDATOR_DIR/validator.js
Restart=always
RestartSec=10
EnvironmentFile=$VALIDATOR_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
log_info "Starting validator service..."
sudo systemctl daemon-reload
sudo systemctl enable tburn-validator
sudo systemctl start tburn-validator

log_success "Validator node deployed and started!"
log_info "Check status: sudo systemctl status tburn-validator"
log_info "View logs: sudo journalctl -u tburn-validator -f"
log_info "Metrics: http://localhost:8080/metrics"
log_info "Health: http://localhost:8080/health"
