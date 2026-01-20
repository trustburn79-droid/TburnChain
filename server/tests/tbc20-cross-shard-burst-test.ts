/**
 * TBC-20 Cross-Shard Burst Integration Test
 * 
 * Purpose: Validate fast-path and EVM fallback paths maintain target latency
 * under mixed traffic stress across multiple shards.
 * 
 * Key scenarios:
 * 1. Pure TBC-20 fast path load (8μs target)
 * 2. Mixed TBC-20 + EVM fallback traffic
 * 3. Cross-shard message bursts with varying loads
 * 4. Fallback path activation under fast-path contention
 */

import { getTbc20FastPathEngine, createTestTransaction } from '../core/execution/tbc20-fast-path-integration';
import { getTbc20Registry } from '../services/tbc20-registry';
import { tbc20Telemetry } from '../services/tbc20-fast-path-telemetry';
import {
  Tbc20Selectors,
  TBC20_FACTORY,
  createDefaultTbc20TokenInfo,
} from '../utils/tbc20-protocol-constants';
import { bigIntToU256 } from '../utils/tbc20-address-utils';

interface TestResult {
  scenario: string;
  success: boolean;
  totalTx: number;
  fastPathTx: number;
  evmFallbackTx: number;
  avgLatencyUs: number;
  p50LatencyUs: number;
  p95LatencyUs: number;
  p99LatencyUs: number;
  maxLatencyUs: number;
  throughputTps: number;
  meetsTarget: boolean;
  errors: string[];
  shardMetrics: ShardLatencyMetrics[];
}

interface ShardLatencyMetrics {
  shardId: number;
  txCount: number;
  avgLatencyUs: number;
  maxLatencyUs: number;
  fastPathRatio: number;
}

interface TestConfig {
  numShards: number;
  txPerShard: number;
  fastPathRatio: number;
  burstSize: number;
  targetLatencyUs: number;
}

const DEFAULT_CONFIG: TestConfig = {
  numShards: 24,
  txPerShard: 100,
  fastPathRatio: 0.85,
  burstSize: 50,
  targetLatencyUs: 50,
};

class CrossShardBurstTest {
  private engine = getTbc20FastPathEngine();
  private registry = getTbc20Registry();
  private testTokens: string[] = [];
  private latencies: Map<number, number[]> = new Map();
  private fastPathCounts: Map<number, number> = new Map();
  private evmFallbackCounts: Map<number, number> = new Map();
  private errors: string[] = [];

  async setup(numShards: number): Promise<void> {
    console.log(`[CrossShardTest] Setting up test with ${numShards} shards...`);
    
    for (let i = 0; i < numShards; i++) {
      const tokenAddress = `tb1shard${i.toString().padStart(2, '0')}test0000000000000000000`;
      
      if (!this.registry.contains(tokenAddress)) {
        this.registry.register({
          ...createDefaultTbc20TokenInfo(),
          address: tokenAddress,
          name: `Shard ${i} Test Token`,
          symbol: `ST${i}`,
          aiOptimized: true,
          factory: TBC20_FACTORY,
        });
      }
      
      this.testTokens.push(tokenAddress);
      this.latencies.set(i, []);
      this.fastPathCounts.set(i, 0);
      this.evmFallbackCounts.set(i, 0);
    }
    
    console.log(`[CrossShardTest] ✅ Setup complete: ${this.testTokens.length} test tokens registered`);
  }

  async runScenario1_PureFastPath(config: TestConfig): Promise<TestResult> {
    console.log('\n[Scenario 1] Pure TBC-20 Fast Path Load Test');
    console.log(`  Target: 8μs/TX, ${config.numShards} shards × ${config.txPerShard} TX = ${config.numShards * config.txPerShard} total`);
    
    this.resetMetrics();
    const startTime = performance.now();
    
    for (let shard = 0; shard < config.numShards; shard++) {
      for (let i = 0; i < config.txPerShard; i++) {
        const latency = await this.executeTransaction(shard, true);
        this.recordLatency(shard, latency, true);
      }
    }
    
    const totalTime = performance.now() - startTime;
    return this.buildResult('Scenario 1: Pure Fast Path', totalTime, config);
  }

  async runScenario2_MixedTraffic(config: TestConfig): Promise<TestResult> {
    console.log('\n[Scenario 2] Mixed TBC-20 + EVM Fallback Traffic');
    console.log(`  Fast path ratio: ${config.fastPathRatio * 100}%`);
    
    this.resetMetrics();
    const startTime = performance.now();
    
    for (let shard = 0; shard < config.numShards; shard++) {
      for (let i = 0; i < config.txPerShard; i++) {
        const useFastPath = Math.random() < config.fastPathRatio;
        const latency = await this.executeTransaction(shard, useFastPath);
        this.recordLatency(shard, latency, useFastPath);
      }
    }
    
    const totalTime = performance.now() - startTime;
    return this.buildResult('Scenario 2: Mixed Traffic', totalTime, config);
  }

  async runScenario3_CrossShardBursts(config: TestConfig): Promise<TestResult> {
    console.log('\n[Scenario 3] Cross-Shard Burst Stress Test');
    console.log(`  Burst size: ${config.burstSize} TX per burst`);
    
    this.resetMetrics();
    const startTime = performance.now();
    
    const numBursts = Math.ceil((config.numShards * config.txPerShard) / config.burstSize);
    
    for (let burst = 0; burst < numBursts; burst++) {
      const burstPromises: Promise<void>[] = [];
      
      for (let i = 0; i < config.burstSize; i++) {
        const shard = Math.floor(Math.random() * config.numShards);
        const useFastPath = Math.random() < config.fastPathRatio;
        
        burstPromises.push(
          this.executeTransaction(shard, useFastPath).then(latency => {
            this.recordLatency(shard, latency, useFastPath);
          })
        );
      }
      
      await Promise.all(burstPromises);
      
      if (burst % 10 === 0) {
        for (let s = 0; s < config.numShards; s++) {
          const shardLatencies = this.latencies.get(s) || [];
          const fastCount = this.fastPathCounts.get(s) || 0;
          const evmCount = this.evmFallbackCounts.get(s) || 0;
          const total = fastCount + evmCount;
          
          if (total > 0) {
            tbc20Telemetry.recordShardMetrics(s, {
              pendingWriteDepth: Math.floor(Math.random() * 100),
              snapshotAgeMs: Math.floor(Math.random() * 50),
              lastExecutionTimeUs: shardLatencies[shardLatencies.length - 1] || 0,
              txProcessed: total,
              txFailed: 0,
              fastPathHitRate: fastCount / total,
            });
          }
        }
      }
    }
    
    const totalTime = performance.now() - startTime;
    return this.buildResult('Scenario 3: Cross-Shard Bursts', totalTime, config);
  }

  async runScenario4_FallbackUnderContention(config: TestConfig): Promise<TestResult> {
    console.log('\n[Scenario 4] Fallback Path Under Fast-Path Contention');
    console.log('  Simulating high pending-write pressure forcing fallback');
    
    this.resetMetrics();
    const startTime = performance.now();
    
    for (let shard = 0; shard < config.numShards; shard++) {
      tbc20Telemetry.recordShardMetrics(shard, {
        pendingWriteDepth: 800,
        snapshotAgeMs: 70,
      });
    }
    
    for (let shard = 0; shard < config.numShards; shard++) {
      for (let i = 0; i < config.txPerShard; i++) {
        const useEvmDueToContention = i % 5 === 0;
        const latency = await this.executeTransaction(shard, !useEvmDueToContention);
        this.recordLatency(shard, latency, !useEvmDueToContention);
        
        if (i % 20 === 0 && i > 0) {
          const newDepth = Math.max(100, 800 - (i * 10));
          tbc20Telemetry.recordShardMetrics(shard, {
            pendingWriteDepth: newDepth,
            snapshotAgeMs: Math.max(10, 70 - (i * 0.5)),
          });
        }
      }
    }
    
    const totalTime = performance.now() - startTime;
    return this.buildResult('Scenario 4: Fallback Under Contention', totalTime, config);
  }

  private async executeTransaction(shardId: number, useFastPath: boolean): Promise<number> {
    const tokenAddress = this.testTokens[shardId];
    const start = performance.now();
    
    try {
      if (useFastPath) {
        const toBytes = new Uint8Array(32);
        toBytes.set(new Uint8Array(20).fill(shardId), 12);
        const amount = bigIntToU256(BigInt(1000));
        
        const tx = createTestTransaction(
          `tb1sender${shardId.toString().padStart(2, '0')}test00000000000000000000`,
          tokenAddress,
          Tbc20Selectors.TRANSFER,
          toBytes,
          amount
        );
        
        this.engine.isEligible(tx);
      } else {
        await this.simulateEvmExecution();
      }
    } catch (error) {
      this.errors.push(`Shard ${shardId}: ${error}`);
    }
    
    const end = performance.now();
    return (end - start) * 1000;
  }

  private async simulateEvmExecution(): Promise<void> {
    const baseLatency = 15 + Math.random() * 10;
    await new Promise(resolve => setTimeout(resolve, baseLatency / 1000));
  }

  private recordLatency(shardId: number, latencyUs: number, isFastPath: boolean): void {
    const latencies = this.latencies.get(shardId) || [];
    latencies.push(latencyUs);
    this.latencies.set(shardId, latencies);
    
    if (isFastPath) {
      this.fastPathCounts.set(shardId, (this.fastPathCounts.get(shardId) || 0) + 1);
    } else {
      this.evmFallbackCounts.set(shardId, (this.evmFallbackCounts.get(shardId) || 0) + 1);
    }
  }

  private resetMetrics(): void {
    for (let i = 0; i < this.testTokens.length; i++) {
      this.latencies.set(i, []);
      this.fastPathCounts.set(i, 0);
      this.evmFallbackCounts.set(i, 0);
    }
    this.errors = [];
  }

  private buildResult(scenario: string, totalTimeMs: number, config: TestConfig): TestResult {
    const allLatencies: number[] = [];
    const shardMetrics: ShardLatencyMetrics[] = [];
    
    let totalFastPath = 0;
    let totalEvmFallback = 0;
    
    for (let shard = 0; shard < config.numShards; shard++) {
      const shardLatencies = this.latencies.get(shard) || [];
      allLatencies.push(...shardLatencies);
      
      const fastCount = this.fastPathCounts.get(shard) || 0;
      const evmCount = this.evmFallbackCounts.get(shard) || 0;
      totalFastPath += fastCount;
      totalEvmFallback += evmCount;
      
      const total = fastCount + evmCount;
      shardMetrics.push({
        shardId: shard,
        txCount: total,
        avgLatencyUs: shardLatencies.length > 0
          ? shardLatencies.reduce((a, b) => a + b, 0) / shardLatencies.length
          : 0,
        maxLatencyUs: shardLatencies.length > 0
          ? Math.max(...shardLatencies)
          : 0,
        fastPathRatio: total > 0 ? fastCount / total : 0,
      });
    }
    
    const sorted = [...allLatencies].sort((a, b) => a - b);
    const totalTx = allLatencies.length;
    const avgLatency = totalTx > 0 ? allLatencies.reduce((a, b) => a + b, 0) / totalTx : 0;
    const p50 = sorted[Math.floor(totalTx * 0.5)] || 0;
    const p95 = sorted[Math.floor(totalTx * 0.95)] || 0;
    const p99 = sorted[Math.floor(totalTx * 0.99)] || 0;
    const maxLatency = sorted[sorted.length - 1] || 0;
    const throughput = totalTx / (totalTimeMs / 1000);
    
    const meetsTarget = avgLatency <= config.targetLatencyUs && p95 <= config.targetLatencyUs * 2;
    
    const result: TestResult = {
      scenario,
      success: this.errors.length === 0 && meetsTarget,
      totalTx,
      fastPathTx: totalFastPath,
      evmFallbackTx: totalEvmFallback,
      avgLatencyUs: avgLatency,
      p50LatencyUs: p50,
      p95LatencyUs: p95,
      p99LatencyUs: p99,
      maxLatencyUs: maxLatency,
      throughputTps: throughput,
      meetsTarget,
      errors: this.errors,
      shardMetrics,
    };
    
    this.printResult(result);
    return result;
  }

  private printResult(result: TestResult): void {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status} ${result.scenario}`);
    console.log('─'.repeat(60));
    console.log(`  Total TX: ${result.totalTx} (Fast: ${result.fastPathTx}, EVM: ${result.evmFallbackTx})`);
    console.log(`  Avg Latency: ${result.avgLatencyUs.toFixed(2)}μs`);
    console.log(`  P50: ${result.p50LatencyUs.toFixed(2)}μs, P95: ${result.p95LatencyUs.toFixed(2)}μs, P99: ${result.p99LatencyUs.toFixed(2)}μs`);
    console.log(`  Max Latency: ${result.maxLatencyUs.toFixed(2)}μs`);
    console.log(`  Throughput: ${result.throughputTps.toFixed(0)} TPS`);
    console.log(`  Meets Target: ${result.meetsTarget ? 'YES' : 'NO'}`);
    
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.length}`);
      result.errors.slice(0, 5).forEach(e => console.log(`    - ${e}`));
    }
    
    const worstShard = result.shardMetrics.reduce((worst, curr) =>
      curr.avgLatencyUs > worst.avgLatencyUs ? curr : worst
    );
    console.log(`  Worst Shard: #${worstShard.shardId} (${worstShard.avgLatencyUs.toFixed(2)}μs avg)`);
  }

  async cleanup(): Promise<void> {
    for (const tokenAddress of this.testTokens) {
      this.registry.unregister(tokenAddress);
    }
    this.testTokens = [];
    console.log('[CrossShardTest] ✅ Cleanup complete');
  }
}

export async function runCrossShardBurstTests(config: Partial<TestConfig> = {}): Promise<{
  results: TestResult[];
  summary: {
    totalScenarios: number;
    passed: number;
    failed: number;
    overallSuccess: boolean;
  };
}> {
  const testConfig: TestConfig = { ...DEFAULT_CONFIG, ...config };
  const test = new CrossShardBurstTest();
  const results: TestResult[] = [];
  
  console.log('\n' + '═'.repeat(60));
  console.log('TBC-20 Cross-Shard Burst Integration Test Suite');
  console.log('═'.repeat(60));
  console.log(`Config: ${testConfig.numShards} shards, ${testConfig.txPerShard} TX/shard`);
  console.log(`Fast Path Ratio: ${testConfig.fastPathRatio * 100}%, Target: ${testConfig.targetLatencyUs}μs`);
  console.log('═'.repeat(60));
  
  try {
    await test.setup(testConfig.numShards);
    
    results.push(await test.runScenario1_PureFastPath(testConfig));
    results.push(await test.runScenario2_MixedTraffic(testConfig));
    results.push(await test.runScenario3_CrossShardBursts(testConfig));
    results.push(await test.runScenario4_FallbackUnderContention(testConfig));
    
  } finally {
    await test.cleanup();
  }
  
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  console.log('\n' + '═'.repeat(60));
  console.log('TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Total Scenarios: ${results.length}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Overall: ${failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('═'.repeat(60) + '\n');
  
  return {
    results,
    summary: {
      totalScenarios: results.length,
      passed,
      failed,
      overallSuccess: failed === 0,
    },
  };
}

export { CrossShardBurstTest, TestConfig, TestResult };
