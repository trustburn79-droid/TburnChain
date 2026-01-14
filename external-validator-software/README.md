# TBURN External Validator Deployment

Production-grade deployment scripts for TBURN mainnet validator nodes with Remote Signer architecture.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐      ┌───────────────────────────────┐      │
│  │  Validator Node   │ mTLS │      Signer Service           │      │
│  │  (Compute Engine) │◄────►│  (Isolated Compute Engine)   │      │
│  │                   │      │                               │      │
│  │  - Block proposal │      │  - Private Key (Secret Mgr)  │      │
│  │  - Attestation    │      │  - HSM Integration Ready     │      │
│  │  - P2P networking │      │  - Audit Logging             │      │
│  └───────────────────┘      └───────────────────────────────┘      │
│           │                              │                          │
│           ▼                              ▼                          │
│  ┌───────────────────┐      ┌───────────────────────────────┐      │
│  │    VPC Network    │      │    GCP Secret Manager         │      │
│  │    10.0.0.0/24    │      │    (Private Key Storage)      │      │
│  └───────────────────┘      └───────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

## Security Features

- **Key Isolation**: Private keys never leave the Signer Service
- **mTLS**: Mutual TLS authentication between validator and signer
- **GCP Secret Manager**: Encrypted key storage with access controls
- **VPC Isolation**: Internal-only communication between services
- **Audit Logging**: All signing operations logged for compliance
- **Rate Limiting**: Protection against signing abuse

## Prerequisites

1. Google Cloud SDK installed and authenticated
2. GCP Project with enabled APIs:
   - Compute Engine
   - Secret Manager
   - VPC Network
3. Validator wallet with sufficient TBURN stake:
   - Genesis: 1,000,000+ TBURN
   - Pioneer: 500,000+ TBURN
   - Standard: 200,000+ TBURN
   - Community: 100,000+ TBURN

## Quick Start

### 1. Configure Environment

```bash
cp config/validator.env.example .env
# Edit .env with your validator details
```

### 2. Deploy Infrastructure

```bash
chmod +x deploy/gcp-validator-deploy.sh
./deploy/gcp-validator-deploy.sh mainnet my-validator-001
```

### 3. Deploy Signer Service

```bash
# SSH to signer VM
gcloud compute ssh my-validator-001-signer --zone=asia-northeast3-a

# Run deployment
chmod +x /tmp/deploy-signer.sh
/tmp/deploy-signer.sh
```

### 4. Deploy Validator Node

```bash
# Copy certificates from signer to validator
gcloud compute scp my-validator-001-signer:/etc/tburn/certs/* /tmp/certs/ --zone=asia-northeast3-a
gcloud compute scp /tmp/certs/* my-validator-001-node:/etc/tburn/certs/ --zone=asia-northeast3-a

# SSH to validator VM
gcloud compute ssh my-validator-001-node --zone=asia-northeast3-a

# Run deployment
chmod +x /tmp/deploy-validator.sh
/tmp/deploy-validator.sh
```

### 5. Start Monitoring

```bash
chmod +x scripts/start-monitoring.sh
./scripts/start-monitoring.sh
```

## Directory Structure

```
external-validator-software/
├── deploy/
│   └── gcp-validator-deploy.sh    # Main GCP deployment script
├── scripts/
│   ├── deploy-signer.sh           # Signer service deployment
│   ├── deploy-validator.sh        # Validator node deployment
│   └── start-monitoring.sh        # Health monitoring
├── config/
│   └── validator.env.example      # Configuration template
└── README.md
```

## Validator Tiers

| Tier | Min Stake | Max Slots | APY | Permissions |
|------|-----------|-----------|-----|-------------|
| Genesis | 1M TBURN | 50 | 20-25% | All |
| Pioneer | 500K TBURN | 100 | 16-20% | Block, Attestation, Governance |
| Standard | 200K TBURN | 150 | 14-18% | Block, Attestation |
| Community | 100K TBURN | 75 | 12-15% | Block, Attestation |

## Monitoring

### Health Check
```bash
curl http://localhost:8080/health
```

### Prometheus Metrics
```bash
curl http://localhost:8080/metrics
```

### Service Logs
```bash
# Signer logs
sudo journalctl -u tburn-signer -f

# Validator logs
sudo journalctl -u tburn-validator -f
```

## Troubleshooting

### Connection Errors
1. Verify firewall rules allow internal traffic on port 8443
2. Check certificate paths in .env
3. Verify signer service is running

### Signing Failures
1. Check rate limits in signer logs
2. Verify validator tier permissions
3. Check Secret Manager key access

### Performance Issues
1. Increase VM machine type
2. Check network latency between VMs
3. Review metrics for bottlenecks

## Support

For validator support, contact:
- Discord: #validator-support
- Email: validators@tburn.network
