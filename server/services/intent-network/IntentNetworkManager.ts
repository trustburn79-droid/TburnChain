/**
 * IntentNetworkManager - 인텐트 아키텍처 서비스
 * 
 * 기존 AI 시스템과 인텐트 네트워크 통합
 * 솔버 네트워크, MEV 보호, 최적 경로 탐색 제공
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { BoundedMap, BoundedQueue } from '../utils/BoundedQueue';

/**
 * 인텐트 타입
 */
export enum IntentType {
  SWAP = 'SWAP',
  BRIDGE = 'BRIDGE',
  LIMIT_ORDER = 'LIMIT_ORDER',
  LIQUIDITY = 'LIQUIDITY',
  STAKE = 'STAKE',
  CUSTOM = 'CUSTOM',
}

/**
 * 구조화된 인텐트
 */
export interface StructuredIntent {
  intentId: string;
  type: IntentType;
  user: string;
  inputToken: string;
  inputAmount: bigint;
  outputToken: string;
  minOutputAmount: bigint;
  constraints: IntentConstraint[];
  deadline: number;
  status: 'PENDING' | 'FILLING' | 'FILLED' | 'CANCELLED' | 'EXPIRED';
  createdAt: number;
}

/**
 * 인텐트 제약 조건
 */
export interface IntentConstraint {
  type: 'MAX_SLIPPAGE' | 'MIN_OUTPUT' | 'MAX_GAS' | 'MEV_PROTECTED' | 'BEST_EXECUTION' | 'TIME_LIMIT';
  value: any;
}

/**
 * 솔버 입찰
 */
export interface SolverBid {
  bidId: string;
  solverId: string;
  intentId: string;
  outputAmount: bigint;
  gasEstimate: number;
  executionPath: ExecutionStep[];
  validUntil: number;
  signature: Buffer;
}

/**
 * 실행 단계
 */
export interface ExecutionStep {
  protocol: string;
  action: string;
  params: any;
  expectedOutput: bigint;
}

/**
 * 솔버 정보
 */
export interface SolverInfo {
  solverId: string;
  name: string;
  stake: bigint;
  reputation: number;
  supportedTypes: IntentType[];
  totalFilled: number;
  totalVolume: bigint;
  successRate: number;
  averageFillTime: number;
  isActive: boolean;
}

/**
 * 실행 결과
 */
export interface ExecutionResult {
  intentId: string;
  success: boolean;
  solver: string;
  expectedOutput: bigint;
  actualOutput: bigint;
  gasUsed: number;
  timestamp: number;
  executionPath: ExecutionStep[];
}

/**
 * MEV 보호 상태
 */
export interface MEVProtectionStatus {
  intentId: string;
  isProtected: boolean;
  submittedViaPrivatePool: boolean;
  mevDetected: boolean;
  savedAmount: bigint;
}

/**
 * 인텐트 네트워크 통계
 */
export interface IntentNetworkStats {
  totalIntents: number;
  pendingIntents: number;
  filledIntents: number;
  totalVolume: bigint;
  activeSolvers: number;
  averageFillTime: number;
  mevProtectedPercentage: number;
  totalMEVSaved: bigint;
}

/**
 * 설정
 */
export interface IntentNetworkConfig {
  minSolverStake: bigint;
  auctionDuration: number;
  settlementTimeout: number;
  maxSlippageBps: number;
}

/**
 * IntentNetworkManager - 인텐트 네트워크 관리 서비스
 */
export class IntentNetworkManager extends EventEmitter {
  private config: IntentNetworkConfig;
  private intents: BoundedMap<string, StructuredIntent>;
  private solvers: BoundedMap<string, SolverInfo>;
  private bids: BoundedMap<string, SolverBid[]>;
  private privateMempool: BoundedQueue<StructuredIntent>;
  private executionResults: BoundedMap<string, ExecutionResult>;
  private mevProtectionStatus: BoundedMap<string, MEVProtectionStatus>;

  private settlementLoop: NodeJS.Timer | null = null;
  private isRunning: boolean = false;

  private fillTimes: number[] = [];
  private totalMEVSaved: bigint = BigInt(0);

  private readonly MIN_SOLVER_STAKE = BigInt('100000000000000000000000'); // 100K TBURN
  private readonly AUCTION_DURATION = 2000; // 2초
  private readonly SETTLEMENT_TIMEOUT = 60000; // 1분
  private readonly MAX_INTENTS = 50000;
  private readonly MAX_MEMPOOL = 10000;
  private readonly MAX_RESULTS = 100000;
  private readonly MAX_SOLVERS = 1000;
  private readonly INTENT_TTL = 24 * 60 * 60 * 1000; // 24시간

  constructor(config: Partial<IntentNetworkConfig> = {}) {
    super();

    this.intents = new BoundedMap<string, StructuredIntent>(this.MAX_INTENTS, this.INTENT_TTL, 'Intents');
    this.solvers = new BoundedMap<string, SolverInfo>(this.MAX_SOLVERS, 0, 'Solvers');
    this.bids = new BoundedMap<string, SolverBid[]>(this.MAX_INTENTS, this.INTENT_TTL, 'IntentBids');
    this.privateMempool = new BoundedQueue<StructuredIntent>({ maxSize: this.MAX_MEMPOOL, name: 'PrivateMempool', ttlMs: this.INTENT_TTL });
    this.executionResults = new BoundedMap<string, ExecutionResult>(this.MAX_RESULTS, 7 * 24 * 60 * 60 * 1000, 'ExecutionResults');
    this.mevProtectionStatus = new BoundedMap<string, MEVProtectionStatus>(this.MAX_INTENTS, this.INTENT_TTL, 'MEVProtection');

    this.config = {
      minSolverStake: this.MIN_SOLVER_STAKE,
      auctionDuration: this.AUCTION_DURATION,
      settlementTimeout: this.SETTLEMENT_TIMEOUT,
      maxSlippageBps: 50, // 0.5%
      ...config,
    };

    this.initializeDefaultSolvers();
    console.log('[IntentNetworkManager] Initialized');
  }

  /**
   * 기본 솔버 등록
   */
  private initializeDefaultSolvers(): void {
    const defaultSolvers: SolverInfo[] = [
      {
        solverId: 'dex-agg',
        name: 'DEX Aggregator',
        stake: BigInt('500000000000000000000000'),
        reputation: 8500,
        supportedTypes: [IntentType.SWAP],
        totalFilled: 15420,
        totalVolume: BigInt('125000000000000000000000000'),
        successRate: 99.2,
        averageFillTime: 1200,
        isActive: true,
      },
      {
        solverId: 'mm-solver',
        name: 'Market Maker',
        stake: BigInt('1000000000000000000000000'),
        reputation: 9000,
        supportedTypes: [IntentType.SWAP, IntentType.LIMIT_ORDER],
        totalFilled: 28750,
        totalVolume: BigInt('350000000000000000000000000'),
        successRate: 99.5,
        averageFillTime: 800,
        isActive: true,
      },
      {
        solverId: 'bridge-solver',
        name: 'Cross-Chain Bridge Solver',
        stake: BigInt('750000000000000000000000'),
        reputation: 8800,
        supportedTypes: [IntentType.BRIDGE],
        totalFilled: 5230,
        totalVolume: BigInt('89000000000000000000000000'),
        successRate: 98.8,
        averageFillTime: 5000,
        isActive: true,
      },
      {
        solverId: 'ai-solver',
        name: 'AI-Powered Solver',
        stake: BigInt('300000000000000000000000'),
        reputation: 8000,
        supportedTypes: [IntentType.SWAP, IntentType.BRIDGE, IntentType.LIQUIDITY],
        totalFilled: 8920,
        totalVolume: BigInt('67000000000000000000000000'),
        successRate: 98.5,
        averageFillTime: 1500,
        isActive: true,
      },
      {
        solverId: 'liquidity-solver',
        name: 'Liquidity Provider Solver',
        stake: BigInt('400000000000000000000000'),
        reputation: 8200,
        supportedTypes: [IntentType.LIQUIDITY, IntentType.STAKE],
        totalFilled: 3150,
        totalVolume: BigInt('45000000000000000000000000'),
        successRate: 99.1,
        averageFillTime: 2000,
        isActive: true,
      },
    ];

    for (const solver of defaultSolvers) {
      this.solvers.set(solver.solverId, solver);
    }

    console.log('[IntentNetworkManager] Initialized', this.solvers.size(), 'solvers');
  }

  /**
   * 시작
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startSettlementLoop();

    console.log('[IntentNetworkManager] Started');
    this.emit('started');
  }

  /**
   * 중지
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.settlementLoop) {
      clearInterval(this.settlementLoop);
      this.settlementLoop = null;
    }

    console.log('[IntentNetworkManager] Stopped');
    this.emit('stopped');
  }

  /**
   * 자연어 인텐트 제출 (AI 파싱)
   */
  async submitNaturalLanguageIntent(
    user: string,
    naturalLanguage: string
  ): Promise<string> {
    const parsed = await this.parseNaturalLanguage(naturalLanguage);

    const intent = await this.createStructuredIntent(user, parsed);

    this.privateMempool.push(intent);

    await this.requestQuotes(intent);

    console.log(`[IntentNetworkManager] NL Intent submitted: "${naturalLanguage}" → ${intent.intentId}`);
    this.emit('intentSubmitted', { intentId: intent.intentId, source: 'natural_language' });

    return intent.intentId;
  }

  /**
   * 구조화된 인텐트 직접 제출
   */
  async submitStructuredIntent(
    user: string,
    type: IntentType,
    inputToken: string,
    inputAmount: bigint,
    outputToken: string,
    minOutputAmount: bigint,
    constraints: IntentConstraint[],
    deadline: number
  ): Promise<string> {
    const intent: StructuredIntent = {
      intentId: this.generateIntentId(user, inputToken, inputAmount),
      type,
      user,
      inputToken,
      inputAmount,
      outputToken,
      minOutputAmount,
      constraints,
      deadline,
      status: 'PENDING',
      createdAt: Date.now(),
    };

    const hasMEVProtection = constraints.some(c => c.type === 'MEV_PROTECTED');

    if (hasMEVProtection) {
      this.privateMempool.push(intent);
      this.mevProtectionStatus.set(intent.intentId, {
        intentId: intent.intentId,
        isProtected: true,
        submittedViaPrivatePool: true,
        mevDetected: false,
        savedAmount: BigInt(0),
      });
    } else {
      this.intents.set(intent.intentId, intent);
    }

    await this.requestQuotes(intent);

    console.log(`[IntentNetworkManager] Structured Intent submitted: ${intent.intentId}`);
    this.emit('intentSubmitted', { intentId: intent.intentId, type });

    return intent.intentId;
  }

  /**
   * 솔버 입찰 (Quote 제출)
   */
  async submitSolverBid(
    intentId: string,
    solverId: string,
    outputAmount: bigint,
    gasEstimate: number,
    executionPath: ExecutionStep[],
    signature: Buffer
  ): Promise<string> {
    const solver = this.solvers.get(solverId);
    if (!solver) {
      throw new Error(`Solver not found: ${solverId}`);
    }

    const intent = this.intents.get(intentId) || this.privateMempool.find(i => i.intentId === intentId);
    if (!intent) {
      throw new Error(`Intent not found: ${intentId}`);
    }

    if (!solver.supportedTypes.includes(intent.type)) {
      throw new Error(`Solver does not support intent type: ${intent.type}`);
    }

    if (outputAmount < intent.minOutputAmount) {
      throw new Error(`Output below minimum: ${outputAmount} < ${intent.minOutputAmount}`);
    }

    const bid: SolverBid = {
      bidId: `bid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      solverId,
      intentId,
      outputAmount,
      gasEstimate,
      executionPath,
      validUntil: Date.now() + this.config.auctionDuration,
      signature,
    };

    const existingBids = this.bids.get(intentId) || [];
    existingBids.push(bid);
    this.bids.set(intentId, existingBids);

    console.log(`[IntentNetworkManager] Solver ${solverId} bid ${outputAmount} for intent ${intentId}`);
    this.emit('bidSubmitted', { bidId: bid.bidId, solverId, intentId, outputAmount });

    return bid.bidId;
  }

  /**
   * 인텐트 실행
   */
  async executeIntent(intentId: string): Promise<ExecutionResult> {
    const intent = this.intents.get(intentId) || this.privateMempool.find(i => i.intentId === intentId);
    if (!intent) {
      throw new Error(`Intent not found: ${intentId}`);
    }

    const bids = this.bids.get(intentId) || [];
    if (bids.length === 0) {
      throw new Error('No bids available');
    }

    const validBids = bids.filter(b => b.validUntil >= Date.now());
    if (validBids.length === 0) {
      throw new Error('All bids expired');
    }

    const bestBid = validBids.reduce((best, bid) => 
      bid.outputAmount > best.outputAmount ? bid : best
    );

    intent.status = 'FILLING';

    const startTime = Date.now();
    const result = await this.executeSettlement(intent, bestBid);
    const fillTime = Date.now() - startTime;

    intent.status = 'FILLED';

    this.fillTimes.push(fillTime);
    if (this.fillTimes.length > 100) this.fillTimes.shift();

    const solver = this.solvers.get(bestBid.solverId)!;
    solver.totalFilled++;
    solver.totalVolume += intent.inputAmount;
    this.updateSolverReputation(solver, result.success, result.actualOutput, bestBid.outputAmount);

    this.executionResults.set(intentId, result);

    const mevStatus = this.mevProtectionStatus.get(intentId);
    if (mevStatus) {
      const expectedWithoutProtection = intent.minOutputAmount;
      if (result.actualOutput > expectedWithoutProtection) {
        mevStatus.savedAmount = result.actualOutput - expectedWithoutProtection;
        this.totalMEVSaved += mevStatus.savedAmount;
      }
    }

    console.log(`[IntentNetworkManager] Intent ${intentId} filled by ${bestBid.solverId}`);
    this.emit('intentFilled', result);

    return result;
  }

  /**
   * 최적 경로 탐색
   */
  async findOptimalPath(
    inputToken: string,
    outputToken: string,
    inputAmount: bigint
  ): Promise<ExecutionStep[]> {
    const paths: { steps: ExecutionStep[]; expectedOutput: bigint }[] = [];

    paths.push({
      steps: [{
        protocol: 'tburn-dex',
        action: 'swap',
        params: { inputToken, outputToken, inputAmount },
        expectedOutput: inputAmount * BigInt(98) / BigInt(100),
      }],
      expectedOutput: inputAmount * BigInt(98) / BigInt(100),
    });

    paths.push({
      steps: [
        {
          protocol: 'tburn-dex',
          action: 'swap',
          params: { inputToken, outputToken: 'USDC', inputAmount },
          expectedOutput: inputAmount * BigInt(99) / BigInt(100),
        },
        {
          protocol: 'tburn-dex',
          action: 'swap',
          params: { inputToken: 'USDC', outputToken, inputAmount: inputAmount * BigInt(99) / BigInt(100) },
          expectedOutput: inputAmount * BigInt(985) / BigInt(1000),
        },
      ],
      expectedOutput: inputAmount * BigInt(985) / BigInt(1000),
    });

    const optimalPath = paths.reduce((best, path) => 
      path.expectedOutput > best.expectedOutput ? path : best
    );

    return optimalPath.steps;
  }

  /**
   * 인텐트 조회
   */
  getIntent(intentId: string): StructuredIntent | undefined {
    return this.intents.get(intentId) || this.privateMempool.find(i => i.intentId === intentId);
  }

  /**
   * 사용자의 인텐트 목록
   */
  getIntentsByUser(user: string): StructuredIntent[] {
    const publicIntents = Array.from(this.intents.values()).filter(i => i.user === user);
    const privateIntents = this.privateMempool.filter(i => i.user === user);
    return [...publicIntents, ...privateIntents];
  }

  /**
   * 입찰 조회
   */
  getBidsForIntent(intentId: string): SolverBid[] {
    return this.bids.get(intentId) || [];
  }

  /**
   * 솔버 목록
   */
  getSolvers(): SolverInfo[] {
    return Array.from(this.solvers.values());
  }

  /**
   * 솔버 상세
   */
  getSolver(solverId: string): SolverInfo | undefined {
    return this.solvers.get(solverId);
  }

  /**
   * 실행 결과 조회
   */
  getExecutionResult(intentId: string): ExecutionResult | undefined {
    return this.executionResults.get(intentId);
  }

  /**
   * MEV 보호 상태 조회
   */
  getMEVProtectionStatus(intentId: string): MEVProtectionStatus | undefined {
    return this.mevProtectionStatus.get(intentId);
  }

  /**
   * 통계 조회
   */
  getStats(): IntentNetworkStats {
    const allIntents = [...this.intents.values(), ...this.privateMempool.toArray()];
    const filledIntents = allIntents.filter(i => i.status === 'FILLED').length;
    const pendingIntents = allIntents.filter(i => i.status === 'PENDING').length;
    
    const totalVolume = Array.from(this.executionResults.values())
      .reduce((sum, r) => sum + r.actualOutput, BigInt(0));

    const avgFillTime = this.fillTimes.length > 0
      ? this.fillTimes.reduce((a, b) => a + b, 0) / this.fillTimes.length
      : 0;

    const mevProtectedCount = Array.from(this.mevProtectionStatus.values())
      .filter(s => s.isProtected).length;
    const mevProtectedPercentage = allIntents.length > 0
      ? (mevProtectedCount / allIntents.length) * 100
      : 0;

    return {
      totalIntents: allIntents.length,
      pendingIntents,
      filledIntents,
      totalVolume,
      activeSolvers: Array.from(this.solvers.values()).filter(s => s.isActive).length,
      averageFillTime: avgFillTime,
      mevProtectedPercentage,
      totalMEVSaved: this.totalMEVSaved,
    };
  }

  /**
   * 자연어 파싱 (AI)
   */
  private async parseNaturalLanguage(text: string): Promise<{
    type: IntentType;
    inputToken: string;
    inputAmount: bigint;
    outputToken: string;
    minOutputAmount: bigint;
    constraints: IntentConstraint[];
    deadline: number;
  }> {
    const lowerText = text.toLowerCase();

    let type = IntentType.SWAP;
    if (lowerText.includes('bridge')) type = IntentType.BRIDGE;
    else if (lowerText.includes('stake')) type = IntentType.STAKE;
    else if (lowerText.includes('liquidity') || lowerText.includes('pool')) type = IntentType.LIQUIDITY;
    else if (lowerText.includes('limit')) type = IntentType.LIMIT_ORDER;

    const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 1;
    const inputAmount = BigInt(Math.floor(amount * 1e18));

    const tokens = ['TBURN', 'ETH', 'USDC', 'USDT', 'BTC'];
    let inputToken = 'TBURN';
    let outputToken = 'USDC';
    
    for (const token of tokens) {
      if (lowerText.includes(token.toLowerCase())) {
        if (inputToken === 'TBURN') {
          inputToken = token;
        } else {
          outputToken = token;
        }
      }
    }

    const constraints: IntentConstraint[] = [
      { type: 'MAX_SLIPPAGE', value: 50 }, // 0.5%
    ];

    if (lowerText.includes('mev') || lowerText.includes('protect')) {
      constraints.push({ type: 'MEV_PROTECTED', value: true });
    }

    if (lowerText.includes('best')) {
      constraints.push({ type: 'BEST_EXECUTION', value: true });
    }

    return {
      type,
      inputToken,
      inputAmount,
      outputToken,
      minOutputAmount: inputAmount * BigInt(97) / BigInt(100), // 3% slippage
      constraints,
      deadline: Date.now() + 30 * 60 * 1000, // 30분
    };
  }

  /**
   * 구조화된 인텐트 생성
   */
  private async createStructuredIntent(user: string, parsed: any): Promise<StructuredIntent> {
    return {
      intentId: this.generateIntentId(user, parsed.inputToken, parsed.inputAmount),
      type: parsed.type,
      user,
      inputToken: parsed.inputToken,
      inputAmount: parsed.inputAmount,
      outputToken: parsed.outputToken,
      minOutputAmount: parsed.minOutputAmount,
      constraints: parsed.constraints,
      deadline: parsed.deadline,
      status: 'PENDING',
      createdAt: Date.now(),
    };
  }

  /**
   * 견적 요청 (RFQ)
   */
  private async requestQuotes(intent: StructuredIntent): Promise<void> {
    for (const solver of this.solvers.values()) {
      if (solver.supportedTypes.includes(intent.type) && solver.isActive) {
        this.emit('rfqSent', { solverId: solver.solverId, intentId: intent.intentId });
      }
    }
  }

  /**
   * 정산 실행
   */
  private async executeSettlement(
    intent: StructuredIntent,
    bid: SolverBid
  ): Promise<ExecutionResult> {
    let actualOutput = BigInt(0);

    for (const step of bid.executionPath) {
      await this.delay(50 + Math.random() * 100);
      actualOutput = step.expectedOutput;
    }

    if (actualOutput < intent.minOutputAmount) {
      throw new Error(`Actual output below minimum: ${actualOutput} < ${intent.minOutputAmount}`);
    }

    return {
      intentId: intent.intentId,
      success: true,
      solver: bid.solverId,
      expectedOutput: bid.outputAmount,
      actualOutput,
      gasUsed: bid.gasEstimate,
      timestamp: Date.now(),
      executionPath: bid.executionPath,
    };
  }

  /**
   * 솔버 평판 업데이트
   */
  private updateSolverReputation(
    solver: SolverInfo,
    success: boolean,
    actualOutput: bigint,
    expectedOutput: bigint
  ): void {
    if (success) {
      const slippage = Number(expectedOutput - actualOutput) / Number(expectedOutput);
      if (slippage <= 0.001) { // 0.1% 이하
        solver.reputation = Math.min(solver.reputation + 10, 10000);
      } else if (slippage <= 0.005) { // 0.5% 이하
        solver.reputation = Math.min(solver.reputation + 5, 10000);
      }
    } else {
      solver.reputation = Math.max(solver.reputation - 50, 0);
    }

    solver.successRate = (solver.successRate * 0.99) + (success ? 1 : 0);
  }

  /**
   * 정산 루프 시작
   */
  private startSettlementLoop(): void {
    this.settlementLoop = setInterval(async () => {
      const now = Date.now();

      for (const [intentId, intent] of this.intents.entries()) {
        if (intent.status === 'PENDING' && intent.deadline < now) {
          intent.status = 'EXPIRED';
          this.emit('intentExpired', { intentId });
        }
      }

      const mempoolItems = this.privateMempool.toArray();
      for (const intent of mempoolItems) {
        if (intent.status === 'PENDING' && intent.deadline < now) {
          intent.status = 'EXPIRED';
          this.emit('intentExpired', { intentId: intent.intentId });
        }
      }

      for (const intent of [...this.intents.values(), ...mempoolItems]) {
        if (intent.status === 'PENDING') {
          const bids = this.bids.get(intent.intentId) || [];
          const validBids = bids.filter(b => b.validUntil >= now);
          
          if (validBids.length > 0) {
            try {
              await this.executeIntent(intent.intentId);
            } catch (e) {
              console.error(`[IntentNetworkManager] Auto-execute failed for ${intent.intentId}:`, e);
            }
          }
        }
      }
    }, 5000); // 5초마다 확인
  }

  /**
   * 인텐트 ID 생성
   */
  private generateIntentId(user: string, inputToken: string, inputAmount: bigint): string {
    const hash = crypto.createHash('sha256')
      .update(`${user}${inputToken}${inputAmount}${Date.now()}`)
      .digest('hex');
    return `intent-${hash.slice(0, 16)}`;
  }

  /**
   * 딜레이 유틸
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const intentNetworkManager = new IntentNetworkManager();
