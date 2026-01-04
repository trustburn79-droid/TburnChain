# TBURN Mainnet Validator Node Setup Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Quick Installation](#quick-installation)
3. [Manual Installation](#manual-installation)
4. [Validator Registration](#validator-registration)
5. [Operation & Monitoring](#operation--monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Security Recommendations](#security-recommendations)

---

## System Requirements

### Minimum Specifications
| Item | Minimum | Recommended |
|------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8GB | 16GB+ |
| Storage | 100GB SSD | 500GB NVMe SSD |
| Network | 100Mbps | 1Gbps |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

### Network Ports
| Port | Purpose | Required |
|------|---------|----------|
| 26656 | P2P Communication | Yes |
| 8080 | REST API | Optional |
| 8545 | JSON-RPC | Optional |
| 8546 | WebSocket | Optional |
| 9090 | Prometheus | Optional |

---

## Quick Installation

### Option 1: Automated Script (Linux)

```bash
# Download and run installation script
curl -fsSL https://tburn.io/validator/install.sh | sudo bash

# Run the setup wizard
sudo /opt/tburn-validator/scripts/setup-validator.sh
```

### Option 2: Docker (Recommended)

```bash
# Download quick start script
curl -fsSL https://tburn.io/validator/quick-start.sh | bash
```

---

## Manual Installation

### Step 1: System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git build-essential

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js version
node -v  # Should be v20.x.x or higher
```

### Step 2: Install Validator Node

```bash
# Create directories
sudo mkdir -p /opt/tburn-validator
sudo mkdir -p /var/lib/tburn/{blocks,state,txpool}
sudo mkdir -p /etc/tburn
sudo mkdir -p /var/log/tburn

# Download validator node
cd /opt/tburn-validator
sudo wget https://github.com/tburn-foundation/validator-node/releases/latest/download/tburn-validator.tar.gz
sudo tar -xzf tburn-validator.tar.gz

# Install dependencies
sudo npm install --production
```

### Step 3: User and Permission Setup

```bash
# Create tburn user
sudo useradd -r -s /bin/false -m -d /home/tburn tburn

# Set permissions
sudo chown -R tburn:tburn /opt/tburn-validator
sudo chown -R tburn:tburn /var/lib/tburn
sudo chown -R tburn:tburn /etc/tburn
sudo chown -R tburn:tburn /var/log/tburn
```

### Step 4: Initialize Validator

```bash
# Generate validator keys and configuration
sudo -u tburn /opt/tburn-validator/bin/tburn-validator init \
    --name "MyValidator" \
    --region us-east1 \
    --datacenter "New York" \
    --stake 1000000 \
    --commission 10 \
    --output /etc/tburn/validator.json

# Secure the configuration file
sudo chmod 600 /etc/tburn/validator.json
```

### Step 5: Configure systemd Service

```bash
# Create service file
sudo tee /etc/systemd/system/tburn-validator.service << EOF
[Unit]
Description=TBURN Mainnet Validator Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=tburn
Group=tburn
WorkingDirectory=/opt/tburn-validator
ExecStart=/usr/bin/node /opt/tburn-validator/dist/cli.js start --config /etc/tburn/validator.json
Restart=always
RestartSec=10
LimitNOFILE=65535

Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable tburn-validator
```

### Step 6: Configure Firewall

```bash
# Using UFW
sudo ufw allow 26656/tcp comment "TBURN P2P"
sudo ufw allow 8080/tcp comment "TBURN API"

# Using firewalld
sudo firewall-cmd --permanent --add-port=26656/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

---

## Validator Registration

### 1. Check Validator Address

```bash
cat /etc/tburn/validator.json | jq '.validator.address'
```

### 2. Staking Transaction

To become an active validator, you must stake a minimum of **1,000,000 TBURN**.

1. Send staking amount to your validator address from your TBURN wallet
2. Verify the transaction at https://explorer.tburn.io
3. Your validator will be activated after staking is confirmed

### 3. Start Validator

```bash
# Start validator
sudo systemctl start tburn-validator

# Check status
sudo systemctl status tburn-validator

# View logs
sudo journalctl -u tburn-validator -f
```

---

## Operation & Monitoring

### Status Commands

```bash
# Service status
sudo systemctl status tburn-validator

# Real-time logs
sudo journalctl -u tburn-validator -f

# Node status via API
curl http://localhost:8080/api/v1/status

# Health check
curl http://localhost:8080/api/v1/health

# Metrics
curl http://localhost:8080/api/v1/metrics
```

### Monitoring Dashboard

Prometheus + Grafana configuration:

```yaml
# Add to prometheus.yml
scrape_configs:
  - job_name: 'tburn-validator'
    static_configs:
      - targets: ['localhost:9090']
```

---

## Troubleshooting

### Common Issues

#### Node Won't Start
```bash
# Check logs
sudo journalctl -u tburn-validator -n 100

# Verify configuration
sudo cat /etc/tburn/validator.json | jq .

# Check for port conflicts
sudo netstat -tlnp | grep -E "26656|8080"
```

#### Peer Connection Failure
```bash
# Check firewall
sudo ufw status

# Test bootstrap peer connection
nc -zv seed1.tburn.io 26656
```

#### Sync Delays
```bash
# Check current block height
curl http://localhost:8080/api/v1/status | jq '.currentHeight'

# Check peer count
curl http://localhost:8080/api/v1/peers | jq '.count'
```

---

## Security Recommendations

### 1. Key Security
- **Never share your private key**
- Config file permissions: `chmod 600 /etc/tburn/validator.json`
- Regular offline backups

### 2. Server Security
```bash
# SSH key-only authentication
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Block unnecessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 26656/tcp
sudo ufw enable
```

### 3. Monitoring
- Set up 24/7 uptime monitoring
- Configure slashing event alerts
- Monitor resource usage

---

## Support

- Documentation: https://docs.tburn.io/validator
- Discord: https://discord.gg/tburn
- Email: validator-support@tburn.io
- GitHub: https://github.com/tburn-foundation/validator-node

---

## Appendix: Bootstrap Nodes by Region

| Region | Bootstrap Node |
|--------|----------------|
| Asia | seed1.asia.tburn.io:26656 |
| North America | seed1.us.tburn.io:26656 |
| Europe | seed1.eu.tburn.io:26656 |

---

*TBURN Foundation - 2026*
