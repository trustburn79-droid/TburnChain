# TBURN Mainnet Operations Runbook

## Overview
This document provides operational procedures for managing the TBURN Mainnet under various conditions including traffic surges, memory pressure, and system failures.

---

## Table of Contents
1. [Emergency Procedures](#1-emergency-procedures)
2. [Memory Management](#2-memory-management)
3. [Shard Scaling](#3-shard-scaling)
4. [Traffic Surge Response](#4-traffic-surge-response)
5. [Database Operations](#5-database-operations)
6. [Monitoring & Alerting](#6-monitoring--alerting)
7. [Load Testing](#7-load-testing)
8. [Recovery Procedures](#8-recovery-procedures)

---

## 1. Emergency Procedures

### 1.1 Emergency Stop (Pipeline)

**When to use:** System overload, memory exhaustion, or cascading failures.

```bash
# API Endpoint
curl -X POST http://localhost:5000/api/pipeline/stop

# Alternative: Direct service call
curl -X POST http://localhost:5000/api/pipeline/parallel/stop
```

**Verification:**
```bash
curl http://localhost:5000/api/pipeline/stats | jq '.isRunning'
# Expected: false
```

### 1.2 Force Memory Cleanup

**When to use:** Heap usage exceeds 85% or memory growth rate is abnormal.

```bash
# Via API
curl -X POST http://localhost:5000/api/memory-guardian/force-cleanup

# Check current memory status
curl http://localhost:5000/api/memory-guardian/status | jq '.heapUsedMB, .heapRatio'
```

**Memory Threshold Levels:**
| Level | Threshold | Action |
|-------|-----------|--------|
| Warning | 70% | Soft cleanup, reduce cache |
| Critical | 85% | Aggressive cleanup, GC trigger |
| Emergency | 92% | Emergency cleanup, shard hibernation |

### 1.3 Circuit Breaker Reset

**When to use:** Service recovered but circuit breaker is still open.

```bash
# Check circuit breaker status
curl http://localhost:5000/api/health/circuit-breakers

# Manual reset (if available)
curl -X POST http://localhost:5000/api/circuit-breaker/reset
```

---

## 2. Memory Management

### 2.1 Memory Governor States

| State | Heap Usage | Behavior |
|-------|------------|----------|
| Normal | < 75% | Full capacity operation |
| Warning | 75-85% | Defer new shard activation |
| Deferred | 85-90% | Queue shard requests |
| Hibernating | 90-95% | Hibernate least-used shards |
| Critical | > 95% | Emergency measures, reject requests |

### 2.2 Manual Shard Hibernation

```bash
# Hibernate specific shard
curl -X POST http://localhost:5000/api/shards/{shardId}/hibernate

# Wake up hibernated shard
curl -X POST http://localhost:5000/api/shards/{shardId}/wake

# List hibernated shards
curl http://localhost:5000/api/memory-governor/status | jq '.hibernatedShards'
```

### 2.3 GC Trigger

```bash
# Request manual garbage collection
curl -X POST http://localhost:5000/api/memory-guardian/gc

# Check last GC time
curl http://localhost:5000/api/memory-guardian/status | jq '.lastGcAt'
```

---

## 3. Shard Scaling

### 3.1 Dynamic Shard Scaling

**Current Limits:** 24-64 shards (configurable)

```bash
# Check current shard count
curl http://localhost:5000/api/shards/count

# Scale up shards (example: 24 -> 32)
curl -X POST http://localhost:5000/api/sharding/scale \
  -H "Content-Type: application/json" \
  -d '{"targetShardCount": 32}'

# Scale down shards
curl -X POST http://localhost:5000/api/sharding/scale \
  -H "Content-Type: application/json" \
  -d '{"targetShardCount": 24}'
```

### 3.2 Shard Rebalancing

```bash
# Trigger manual rebalance
curl -X POST http://localhost:5000/api/sharding/rebalance

# Check rebalance status
curl http://localhost:5000/api/sharding/rebalance/status
```

### 3.3 Cross-Shard Router Management

```bash
# Check router status
curl http://localhost:5000/api/cross-shard-router/status

# Clear message queue (emergency only)
curl -X POST http://localhost:5000/api/cross-shard-router/clear-queue
```

---

## 4. Traffic Surge Response

### 4.1 Request Shedder Configuration

**Default Thresholds:**
- Event Loop Lag: 250ms (adaptive: 100-400ms)
- Backpressure: 150 RPS
- Degraded Mode Duration: 30s

```bash
# Check shedder status
curl http://localhost:5000/api/request-shedder/status

# View current metrics
curl http://localhost:5000/api/request-shedder/metrics | jq '{
  eventLoopLagMs: .eventLoopLagMs,
  isDegradedMode: .isDegradedMode,
  totalSheddedRequests: .totalSheddedRequests
}'
```

### 4.2 Traffic Surge Playbook

**10x Traffic Surge:**
1. Monitor Request Shedder activation
2. Verify Memory Governor stays below 85%
3. Check Circuit Breakers remain closed
4. Expected behavior: Graceful degradation, ~85% success rate

**100x Traffic Surge:**
1. Expect Request Shedder to activate immediately
2. Memory Governor may enter "Deferred" or "Hibernating" state
3. Circuit Breakers may open for non-critical endpoints
4. Expected behavior: System survives, ~70% success rate for critical paths

### 4.3 Endpoint Priority

| Priority | Endpoints | Behavior During Surge |
|----------|-----------|----------------------|
| Critical | /api/auth/, /health, /rpc | Always served |
| High | /api/shards, /api/blocks | Served if capacity |
| Normal | Most API endpoints | Shed when overloaded |
| Deferrable | /api/admin/, /api/analytics/ | First to be shed |

---

## 5. Database Operations

### 5.1 Connection Pool Monitoring

```bash
# Check pool status
curl http://localhost:5000/api/db/pool/status

# Expected healthy metrics:
# - Available connections > 5
# - Waiting requests < 10
# - Total connections < MAX_POOL_SIZE
```

### 5.2 Pool Exhaustion Response

**Symptoms:**
- High request latency (> 1000ms)
- 503 errors from DB-bound endpoints
- Connection timeout errors in logs

**Response:**
1. Check current pool usage
2. Identify long-running queries
3. Consider reducing concurrent requests
4. If persistent, restart application with increased pool size

### 5.3 Database Fallback

The system automatically falls back to cached data when database is unavailable:
- Network stats: 60s cache TTL
- Shard data: 30s cache TTL
- Validator data: 120s cache TTL

---

## 6. Monitoring & Alerting

### 6.1 Health Check Endpoints

```bash
# Basic health
curl http://localhost:5000/health

# Detailed system health
curl http://localhost:5000/api/system-health

# Component-specific health
curl http://localhost:5000/api/memory-guardian/health
curl http://localhost:5000/api/request-shedder/health
curl http://localhost:5000/api/pipeline/health
```

### 6.2 Key Metrics to Monitor

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Heap Usage | > 70% | > 85% | Memory cleanup |
| Event Loop Lag | > 150ms | > 300ms | Reduce load |
| Error Rate | > 5% | > 15% | Investigate |
| P99 Latency | > 500ms | > 1000ms | Scale up |
| DB Pool Wait | > 5 | > 20 | Pool exhaustion |

### 6.3 Log Locations

```bash
# Application logs
tail -f /tmp/logs/Start_application_*.log

# Browser console logs
tail -f /tmp/logs/browser_console_*.log

# Memory Guardian events
grep "MEMORY-GUARDIAN" /tmp/logs/Start_application_*.log
```

---

## 7. Load Testing

### 7.1 Available Test Scenarios

| Scenario | Duration | Description |
|----------|----------|-------------|
| quick_check | 5 min | Fast sanity check |
| traffic_surge_10x | 15 min | 10x traffic simulation |
| traffic_surge_100x | 10 min | Extreme 100x surge |
| db_pool_saturation | 20 min | Database stress test |
| resilience_cascade | 30 min | Combined stress test |
| endurance | 8 hours | Long-term stability |

### 7.2 Running Tests

```bash
# Start a test
curl -X POST http://localhost:5000/api/soak-test/start \
  -H "Content-Type: application/json" \
  -d '{"scenario": "traffic_surge_10x"}'

# Check test status
curl http://localhost:5000/api/soak-test/status

# Stop running test
curl -X POST http://localhost:5000/api/soak-test/stop

# Get test results
curl http://localhost:5000/api/soak-test/history | jq '.[0]'
```

### 7.3 Interpreting Results

**Success Criteria:**
- Success Rate > SLA target
- Memory Growth < threshold
- No critical issues
- Circuit breakers recovered

---

## 8. Recovery Procedures

### 8.1 Full System Recovery

1. **Stop all pipelines**
   ```bash
   curl -X POST http://localhost:5000/api/pipeline/stop
   curl -X POST http://localhost:5000/api/pipeline/parallel/stop
   ```

2. **Force memory cleanup**
   ```bash
   curl -X POST http://localhost:5000/api/memory-guardian/force-cleanup
   ```

3. **Wait for GC completion** (30 seconds)

4. **Restart pipelines**
   ```bash
   curl -X POST http://localhost:5000/api/pipeline/start
   ```

5. **Verify health**
   ```bash
   curl http://localhost:5000/api/pipeline/health
   ```

### 8.2 Database Recovery

1. Check connection pool status
2. Clear stale connections if needed
3. Verify database connectivity
4. Warm up caches

```bash
# Warmup endpoint
curl http://localhost:5000/api/warmup
```

### 8.3 Post-Incident Checklist

- [ ] All health endpoints returning healthy
- [ ] Memory usage below 70%
- [ ] Event loop lag below 100ms
- [ ] Error rate below 1%
- [ ] All circuit breakers closed
- [ ] Shard count at expected level
- [ ] Database connections healthy

---

## Appendix: SLA Targets

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| P99 Latency | < 200ms |
| TPS (sustained) | 55,000-60,000 |
| TPS (peak) | 95,000-100,000 |
| Memory Growth/Hour | < 5% |
| Error Rate | < 0.1% |

---

*Last Updated: 2026-01-13*
*Version: 1.0.0*
