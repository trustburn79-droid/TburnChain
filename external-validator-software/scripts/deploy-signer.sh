#!/bin/bash
#
# TBURN Signer Service Deployment
# Run this on the Signer VM after infrastructure deployment
#

set -e

SIGNER_DIR="/opt/tburn-signer"
CERT_DIR="/etc/tburn/certs"
LOG_DIR="/var/log/tburn"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

log_info "╔══════════════════════════════════════════════════════════════╗"
log_info "║     TBURN Signer Service Deployment                          ║"
log_info "╚══════════════════════════════════════════════════════════════╝"

# Create directories
log_info "Creating directories..."
sudo mkdir -p $SIGNER_DIR
sudo mkdir -p $CERT_DIR
sudo mkdir -p $LOG_DIR

# Generate mTLS certificates
log_info "Generating mTLS certificates..."
cd $CERT_DIR

# CA Certificate
sudo openssl genrsa -out ca.key 4096
sudo openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
    -subj "/C=KR/ST=Seoul/O=TBURN/CN=TBURN-Signer-CA"

# Signer Server Certificate
sudo openssl genrsa -out server.key 2048
sudo openssl req -new -key server.key -out server.csr \
    -subj "/C=KR/ST=Seoul/O=TBURN/CN=tburn-signer"
sudo openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key \
    -CAcreateserial -out server.crt

# Client Certificate (for validator nodes)
sudo openssl genrsa -out client.key 2048
sudo openssl req -new -key client.key -out client.csr \
    -subj "/C=KR/ST=Seoul/O=TBURN/CN=tburn-validator"
sudo openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key \
    -CAcreateserial -out client.crt

sudo chmod 600 $CERT_DIR/*.key
sudo chmod 644 $CERT_DIR/*.crt

log_success "Certificates generated in $CERT_DIR"

# Create signer service
log_info "Creating signer service configuration..."

sudo tee /etc/systemd/system/tburn-signer.service > /dev/null <<EOF
[Unit]
Description=TBURN Remote Signer Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$SIGNER_DIR
ExecStart=/usr/bin/node $SIGNER_DIR/signer-service.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=SIGNER_PORT=8443
Environment=CERT_DIR=$CERT_DIR
Environment=LOG_DIR=$LOG_DIR

[Install]
WantedBy=multi-user.target
EOF

# Create signer service code
log_info "Creating signer service code..."

sudo tee $SIGNER_DIR/signer-service.js > /dev/null <<'EOF'
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const PORT = process.env.SIGNER_PORT || 8443;
const CERT_DIR = process.env.CERT_DIR || '/etc/tburn/certs';

// Load certificates
const options = {
    key: fs.readFileSync(`${CERT_DIR}/server.key`),
    cert: fs.readFileSync(`${CERT_DIR}/server.crt`),
    ca: fs.readFileSync(`${CERT_DIR}/ca.crt`),
    requestCert: true,
    rejectUnauthorized: true
};

// In-memory rate limiting
const rateLimits = new Map();

function checkRateLimit(validatorAddress) {
    const now = Date.now();
    const limit = rateLimits.get(validatorAddress) || { count: 0, resetAt: now + 1000 };
    
    if (now > limit.resetAt) {
        limit.count = 0;
        limit.resetAt = now + 1000;
    }
    
    limit.count++;
    rateLimits.set(validatorAddress, limit);
    
    return limit.count <= 100;
}

// Audit logging
function auditLog(action, data) {
    const entry = {
        timestamp: new Date().toISOString(),
        action,
        ...data
    };
    console.log(JSON.stringify(entry));
}

// Sign message
function signMessage(message, privateKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    return sign.sign(privateKey, 'hex');
}

const server = https.createServer(options, (req, res) => {
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const request = JSON.parse(body);
            
            if (!checkRateLimit(request.validatorAddress)) {
                res.writeHead(429);
                res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
                return;
            }
            
            // Mock signing (in production, use GCP Secret Manager)
            const signature = '0x' + crypto.randomBytes(65).toString('hex');
            
            auditLog('SIGN_REQUEST', {
                validator: request.validatorAddress,
                operation: request.operation,
                requestId: request.requestId
            });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                requestId: request.requestId,
                success: true,
                signature,
                signatureType: 'ecdsa',
                auditId: crypto.randomUUID()
            }));
            
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: error.message }));
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`TBURN Signer Service listening on port ${PORT}`);
    console.log('mTLS enabled, requiring client certificates');
});
EOF

# Enable and start service
log_info "Starting signer service..."
sudo systemctl daemon-reload
sudo systemctl enable tburn-signer
sudo systemctl start tburn-signer

log_success "Signer service deployed and started!"
log_info "Check status: sudo systemctl status tburn-signer"
log_info "View logs: sudo journalctl -u tburn-signer -f"
