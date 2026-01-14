# TBURN External Validator Program

Production-ready validator node implementation for TBURN Mainnet with Remote Signer integration.

## Features

- **Remote Signer Integration**: Secure key management via isolated signer service
- **Block Production**: Propose blocks when selected as proposer
- **Attestations**: Attest to beacon chain state
- **P2P Networking**: Connect to other validators via gossip protocol
- **Prometheus Metrics**: Export validator performance metrics
- **Graceful Shutdown**: Clean shutdown handling

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Validator Node                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Block Producer │    │ Attestation Svc │                    │
│  │                 │    │                 │                    │
│  │  - Slot timer   │    │  - Epoch voting │                    │
│  │  - Proposer     │    │  - Aggregation  │                    │
│  │    selection    │    │                 │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│           ▼                      ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Remote Signer Client                           ││
│  │                                                             ││
│  │  - mTLS authentication                                      ││
│  │  - Request signing                                          ││
│  │  - Retry with backoff                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│           │                                                      │
│  ┌────────┴────────┐    ┌─────────────────┐                    │
│  │   P2P Network   │    │  Metrics Server │                    │
│  │                 │    │                 │                    │
│  │  - Peer disco   │    │  - /health      │                    │
│  │  - Gossip       │    │  - /metrics     │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

```bash
cd external-validator-program
npm install
```

## Configuration

Copy the example configuration:

```bash
cp config/mainnet.env.example .env
```

Edit `.env` with your validator details:

```env
VALIDATOR_ADDRESS=0xYourValidatorAddress
VALIDATOR_PUBLIC_KEY=0xYourPublicKey
VALIDATOR_NAME=MyValidator
VALIDATOR_TIER=standard

SIGNER_ENDPOINT=https://10.0.0.2:8443
SIGNER_CA_CERT_PATH=/etc/tburn/certs/ca.crt
CLIENT_CERT_PATH=/etc/tburn/certs/client.crt
CLIENT_KEY_PATH=/etc/tburn/certs/client.key
```

## Usage

### Development
```bash
npm run dev
```

### Production (Mainnet)
```bash
npm run start:mainnet
```

### Production (Testnet)
```bash
npm run start:testnet
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "uptime": 123456,
  "validatorAddress": "0x...",
  "timestamp": "2026-01-14T12:00:00.000Z"
}
```

### Prometheus Metrics
```bash
curl http://localhost:8080/metrics
```

Metrics:
- `tburn_validator_blocks_proposed_total`
- `tburn_validator_attestations_made_total`
- `tburn_validator_signing_requests_total`
- `tburn_validator_signing_errors_total`
- `tburn_validator_peer_count`
- `tburn_validator_current_slot`
- `tburn_validator_current_epoch`
- `tburn_validator_uptime_seconds`

### Status
```bash
curl http://localhost:8080/status
```

## Project Structure

```
external-validator-program/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── validator-config.ts  # Configuration loader
│   └── core/
│       ├── validator-node.ts    # Main orchestrator
│       ├── remote-signer-client.ts
│       ├── block-producer.ts
│       ├── attestation-service.ts
│       ├── p2p-network.ts
│       └── metrics-server.ts
├── config/
│   └── mainnet.env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Validator Tiers

| Tier | Minimum Stake | Daily Limit | Permissions |
|------|---------------|-------------|-------------|
| Genesis | 1,000,000 TBURN | 200,000 | All operations |
| Pioneer | 500,000 TBURN | 150,000 | Block, Attestation, Governance |
| Standard | 200,000 TBURN | 100,000 | Block, Attestation |
| Community | 100,000 TBURN | 50,000 | Block, Attestation |

## Security

- Private keys are never stored in the validator node
- All signing requests go through mTLS to the Remote Signer Service
- Rate limiting prevents signing abuse
- Audit logs for all operations

## Troubleshooting

### Cannot connect to signer
1. Verify signer endpoint is correct
2. Check certificate paths
3. Ensure signer service is running

### Not proposing blocks
1. Confirm validator is registered
2. Check stake amount meets tier minimum
3. Review proposer selection logs

### High latency
1. Check network connectivity
2. Review signer service performance
3. Monitor peer count

## License

MIT
