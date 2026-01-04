# TBURN Validator Node

Enterprise Production-Grade Standalone Validator for TBURN Mainnet

## Overview

The TBURN Validator Node is a complete standalone validator implementation that can be deployed on distributed servers worldwide to form the TBURN Mainnet network. It includes:

- **P2P Networking**: Gossip protocol, peer discovery, NAT traversal
- **BFT Consensus**: 5-phase Byzantine Fault Tolerant consensus (Propose → Prevote → Precommit → Commit → Finalize)
- **Block Storage**: LevelDB-style persistent storage with indexing
- **REST API**: Validator management and monitoring endpoints
- **CLI Interface**: Easy setup and management

## Requirements

- Node.js 20.0.0 or higher
- 4GB+ RAM recommended
- SSD storage recommended
- Stable network connection

## Quick Start

### 1. Installation

```bash
cd validator-node
npm install
npm run build
```

### 2. Initialize a New Validator

```bash
npx tburn-validator init --name "My Validator" --region asia-northeast1 --datacenter Seoul
```

This generates a `validator.json` configuration file with new keys.

### 3. Start the Validator

```bash
npx tburn-validator start --config validator.json
```

### 4. Check Status

```bash
npx tburn-validator status --url http://localhost:8080
```

## CLI Commands

### `init` - Initialize New Validator

```bash
tburn-validator init [options]

Options:
  -n, --name <name>           Validator name (default: "TBURN Validator")
  -r, --region <region>       Geographic region (default: "asia-northeast1")
  -d, --datacenter <dc>       Datacenter location (default: "Seoul")
  -o, --output <file>         Output config file (default: "validator.json")
  --stake <amount>            Stake amount in TBURN (default: "1000000")
  --commission <percent>      Commission rate 0-100 (default: "10")
```

### `start` - Start Validator Node

```bash
tburn-validator start [options]

Options:
  -c, --config <file>         Configuration file (default: "validator.json")
  -d, --data-dir <dir>        Data directory override
  -p, --port <port>           P2P listen port override
  --api-port <port>           API server port override
  --log-level <level>         Log level: debug, info, warn, error
  --solo                      Start without peer requirements
```

### `keys` - Key Management

```bash
tburn-validator keys generate    # Generate new key pair
tburn-validator keys show        # Show validator address
tburn-validator keys export      # Export public key
```

### `status` - Check Node Status

```bash
tburn-validator status --url http://localhost:8080
```

### `regions` - List Supported Regions

```bash
tburn-validator regions
```

## Configuration

The `validator.json` file contains all node settings:

```json
{
  "nodeId": "unique-node-id",
  "chainId": 6000,
  "networkId": "tburn-mainnet",
  "validator": {
    "address": "tb1...",
    "privateKey": "...",
    "publicKey": "...",
    "stake": "1000000000000000000000000",
    "commission": 0.1,
    "name": "My Validator"
  },
  "network": {
    "listenPort": 26656,
    "rpcPort": 8545,
    "wsPort": 8546,
    "maxPeers": 50
  },
  "api": {
    "enabled": true,
    "port": 8080
  },
  "geo": {
    "region": "asia-northeast1",
    "datacenter": "Seoul"
  }
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Node health check |
| `/api/v1/status` | GET | Full node status |
| `/api/v1/metrics` | GET | Validator metrics |
| `/api/v1/peers` | GET | Connected peers |
| `/api/v1/consensus` | GET | Consensus state |
| `/api/v1/validator` | GET | Validator info |
| `/api/v1/transactions` | POST | Submit transaction |

## Network Architecture

```
                    ┌─────────────────┐
                    │   Bootstrap     │
                    │   Seed Nodes    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Validator 1   │◄──►│ Validator 2   │◄──►│ Validator N   │
│ Seoul         │    │ Tokyo         │    │ Frankfurt     │
│ Port: 26656   │    │ Port: 26656   │    │ Port: 26656   │
└───────────────┘    └───────────────┘    └───────────────┘
        │                    │                    │
        └────────────────────┴────────────────────┘
                    P2P Gossip Network
```

## Consensus Protocol

The TBURN BFT consensus follows a 5-phase protocol:

1. **Propose**: Leader proposes a new block
2. **Prevote**: Validators vote on the proposal
3. **Precommit**: Validators lock on the block with 2/3+ prevotes
4. **Commit**: Validators commit with 2/3+ precommits
5. **Finalize**: Block is finalized and stored

### Quorum Requirements
- **2/3+** of total voting power required for each phase
- 100ms target block time
- Up to 10 rounds per height before timeout

## Deployment Guide

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY validator-node/ .
RUN npm install && npm run build
EXPOSE 26656 8080 8545 8546
CMD ["node", "dist/cli.js", "start", "--config", "/config/validator.json"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: tburn-validator
spec:
  serviceName: tburn-validator
  replicas: 125
  template:
    spec:
      containers:
      - name: validator
        image: tburn/validator-node:latest
        ports:
        - containerPort: 26656
        - containerPort: 8080
        volumeMounts:
        - name: data
          mountPath: /data
        - name: config
          mountPath: /config
```

## Security Considerations

1. **Private Key Security**: Never expose private keys. Use secure key management.
2. **Firewall**: Only expose necessary ports (26656 for P2P, 8080 for API).
3. **API Authentication**: Enable API authentication in production.
4. **Regular Updates**: Keep the validator software updated.
5. **Monitoring**: Set up alerts for node health and slashing events.

## Monitoring

Prometheus metrics are available at port 9090 when enabled:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'tburn-validators'
    static_configs:
      - targets: ['validator1:9090', 'validator2:9090']
```

## Genesis Validator Distribution

| Region | Datacenter | Validators |
|--------|------------|------------|
| asia-northeast1 | Seoul | 25 |
| asia-northeast2 | Tokyo | 20 |
| asia-southeast1 | Singapore | 15 |
| us-east1 | New York | 20 |
| us-west1 | Los Angeles | 15 |
| europe-west1 | Frankfurt | 15 |
| europe-west2 | London | 15 |
| **Total** | | **125** |

## License

MIT License - TBURN Foundation
