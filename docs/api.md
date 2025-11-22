# TBURN Blockchain Explorer API Documentation

## Overview
The TBURN Blockchain Explorer provides a comprehensive REST API and WebSocket interface for accessing blockchain data in real-time.

**Base URL**: `https://explorer.tburn.io/api`  
**WebSocket**: `wss://explorer.tburn.io/ws`  
**Version**: 1.0  
**Authentication**: Session-based (required)

---

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "password": "tburn7979"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful"
}
```

### Check Session
```http
GET /api/auth/check
```

**Response**:
```json
{
  "authenticated": true
}
```

### Logout
```http
POST /api/auth/logout
```

---

## Network Statistics

### Get Network Stats
```http
GET /api/stats
```

**Response**:
```json
{
  "id": 1,
  "tps": 347892,
  "blockHeight": 15678234,
  "activeValidators": 89,
  "totalTransactions": "1567823456",
  "avgBlockTime": 98,
  "networkHashrate": "1250000000000000",
  "lastUpdated": 1704067200
}
```

---

## Blocks

### List Blocks
```http
GET /api/blocks
```

**Response**:
```json
[
  {
    "id": 1,
    "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "number": 15678234,
    "timestamp": 1704067200,
    "validator": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
    "transactionCount": 342,
    "gasUsed": "15678234",
    "gasLimit": "30000000",
    "reward": "2500000000000000000"
  }
]
```

### Get Block by Hash
```http
GET /api/blocks/:hash
```

---

## Transactions

### List Transactions
```http
GET /api/transactions
```

**Response**:
```json
[
  {
    "id": 1,
    "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "from": "0x7a8f...3d2e",
    "to": "0x9b4c...8a1f",
    "value": "1000000000000000000",
    "gasPrice": "800000000",
    "gasUsed": "21000",
    "status": "success",
    "blockNumber": 15678234,
    "timestamp": 1704067200
  }
]
```

### Create Transaction (Simulator)
```http
POST /api/simulator/broadcast
Content-Type: application/json

{
  "from": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
  "to": "0x7ef5a6135f1fd6a02593eedc869c6d41d934aef8",
  "amount": "1.5",
  "gasLimit": "21000"
}
```

---

## Validators

### List Validators
```http
GET /api/validators
```

**Response**:
```json
[
  {
    "id": 1,
    "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
    "name": "TBURN Foundation",
    "stake": "1000000000000000000000000",
    "commission": 0.05,
    "apy": 0.08,
    "uptime": 0.998,
    "blocksProduced": 56789,
    "isActive": true
  }
]
```

---

## AI Models

### List AI Models
```http
GET /api/ai-models
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "GPT-5",
    "role": "Strategic",
    "requestCount": 15678,
    "avgResponseTime": 234,
    "successRate": 0.997,
    "cost": "156.78",
    "cacheHitRate": 0.68,
    "lastUsed": 1704067200
  }
]
```

---

## Shards

### List Shards
```http
GET /api/shards
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Alpha",
    "tps": 69578,
    "blockHeight": 3135647,
    "load": 0.56,
    "validators": 18,
    "isActive": true
  }
]
```

---

## Smart Contracts

### List Smart Contracts
```http
GET /api/contracts
```

**Response**:
```json
[
  {
    "id": 1,
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "name": "TBURN Token",
    "creator": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
    "balance": "50000000000000000000",
    "transactionCount": 12345,
    "verified": true,
    "deployedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## WebSocket API

### Connect
```javascript
const ws = new WebSocket('wss://explorer.tburn.io/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'stats') {
    console.log('Network stats:', data.data);
  } else if (data.type === 'block') {
    console.log('New block:', data.data);
  }
};
```

### Message Types

**Network Stats** (every 3 seconds):
```json
{
  "type": "stats",
  "data": {
    "tps": 347892,
    "blockHeight": 15678234,
    "activeValidators": 89
  }
}
```

**New Block** (every ~98ms):
```json
{
  "type": "block",
  "data": {
    "hash": "0x1234...",
    "number": 15678235,
    "timestamp": 1704067200
  }
}
```

---

## Rate Limiting

- **REST API**: 1000 requests/minute per IP
- **WebSocket**: 10 connections per IP

---

## Error Responses

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": 1704067200
}
```

### Common Error Codes
- `UNAUTHORIZED`: Session expired or invalid
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `SERVER_ERROR`: Internal server error

---

## Best Practices

1. **Use WebSocket for real-time data** instead of polling REST endpoints
2. **Cache responses** when possible to reduce API calls
3. **Handle rate limiting** with exponential backoff
4. **Validate session** before making authenticated requests
5. **Use batch endpoints** when fetching multiple resources

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { TBURNClient } from '@tburn/sdk';

const client = new TBURNClient({
  baseURL: 'https://explorer.tburn.io/api',
  websocket: 'wss://explorer.tburn.io/ws'
});

// Fetch network stats
const stats = await client.getNetworkStats();

// Subscribe to real-time updates
client.onNewBlock((block) => {
  console.log('New block:', block);
});
```

### Python
```python
from tburn import TBURNClient

client = TBURNClient(
    base_url='https://explorer.tburn.io/api',
    websocket='wss://explorer.tburn.io/ws'
)

# Fetch network stats
stats = client.get_network_stats()

# Subscribe to real-time updates
@client.on_new_block
def handle_block(block):
    print(f'New block: {block}')
```

---

## Support

For API support and issues:
- **Email**: api@tburn.io
- **Discord**: https://discord.gg/tburn
- **GitHub**: https://github.com/tburn/explorer
