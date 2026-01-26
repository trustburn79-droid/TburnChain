/**
 * RestakingManager - 리스테이킹 서비스
 * 
 * 기존 TBURN 스테이킹 시스템과 리스테이킹/AVS 통합
 * rsTBURN LRT, AVS 레지스트리, 보안 보장 제공
 */

import { EventEmitter } from 'events';

/**
 * 리스테이킹 상태
 */
export enum RestakingState {
  IDLE = 'IDLE',
  RESTAKING = 'RESTAKING',
  RESTAKED = 'RESTAKED',
  UNBONDING = 'UNBONDING',
  WITHDRAWN = 'WITHDRAWN',
  SLASHED = 'SLASHED',
}

/**
 * AVS 타입
 */
export enum AVSType {
  ORACLE = 'ORACLE',
  BRIDGE = 'BRIDGE',
  DA_LAYER = 'DA_LAYER',
  SEQUENCER = 'SEQUENCER',
  COPROCESSOR = 'COPROCESSOR',
  CUSTOM = 'CUSTOM',
}

/**
 * 리스테이킹 포지션
 */
export interface RestakingPosition {
  positionId: string;
  staker: string;
  amount: bigint;
  rsTBURNBalance: bigint;
  avsAllocations: Map<string, bigint>;
  state: RestakingState;
  restakeTimestamp: number;
  unbondingEndTime: number;
  slashable: boolean;
  rewards: bigint;
}

/**
 * AVS 정보
 */
export interface AVSInfo {
  avsId: string;
  name: string;
  type: AVSType;
  operator: string;
  totalStake: bigint;
  operatorCount: number;
  slashingRate: number;
  rewardRate: number;
  minStake: bigint;
  maxStakePerOperator: bigint;
  isActive: boolean;
  contractAddress: string;
  description: string;
  securityScore: number;
}

/**
 * 운영자 정보
 */
export interface OperatorInfo {
  operatorId: string;
  address: string;
  name: string;
  totalDelegation: bigint;
  avsRegistrations: string[];
  commission: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SLASHED';
  uptime: number;
  performanceScore: number;
  slashEvents: SlashEvent[];
}

/**
 * 슬래싱 이벤트
 */
export interface SlashEvent {
  eventId: string;
  operatorId: string;
  avsId: string;
  amount: bigint;
  reason: string;
  timestamp: number;
  evidence: Buffer;
}

/**
 * rsTBURN 토큰 정보
 */
export interface RsTBURNInfo {
  totalSupply: bigint;
  totalUnderlying: bigint;
  exchangeRate: bigint; // 1e18 기준
  pendingRewards: bigint;
  lastRebaseTime: number;
  apy: number;
}

/**
 * 리스테이킹 설정
 */
export interface RestakingConfig {
  minRestakeAmount: bigint;
  maxRestakeAmount: bigint;
  unbondingPeriod: number;
  slashingRate: number;
  rebaseInterval: number;
  maxAVSPerPosition: number;
}

/**
 * 리스테이킹 통계
 */
export interface RestakingStats {
  totalRestaked: bigint;
  totalRsTBURN: bigint;
  activePositions: number;
  operatorCount: number;
  avsCount: number;
  totalRewardsDistributed: bigint;
  averageAPY: number;
  totalSlashed: bigint;
}

/**
 * RestakingManager - 리스테이킹 관리 서비스
 */
export class RestakingManager extends EventEmitter {
  private config: RestakingConfig;
  private positions: Map<string, RestakingPosition> = new Map();
  private operators: Map<string, OperatorInfo> = new Map();
  private avsList: Map<string, AVSInfo> = new Map();
  private rsTBURNInfo: RsTBURNInfo;
  private stats: RestakingStats;
  
  private rebaseLoop: NodeJS.Timer | null = null;
  private isRunning: boolean = false;

  private readonly EXCHANGE_RATE_PRECISION = BigInt('1000000000000000000'); // 1e18
  private readonly REBASE_INTERVAL = 24 * 60 * 60 * 1000; // 24시간
  private readonly MAX_POSITIONS = 100000;
  private readonly MAX_OPERATORS = 1000;
  private readonly MAX_AVS = 100;

  constructor(config: Partial<RestakingConfig> = {}) {
    super();

    this.config = {
      minRestakeAmount: BigInt('1000000000000000000'), // 1 TBURN
      maxRestakeAmount: BigInt('10000000000000000000000000'), // 10M TBURN
      unbondingPeriod: 7 * 24 * 60 * 60 * 1000, // 7일
      slashingRate: 500, // 5% (basis points)
      rebaseInterval: this.REBASE_INTERVAL,
      maxAVSPerPosition: 10,
      ...config,
    };

    this.rsTBURNInfo = {
      totalSupply: BigInt(0),
      totalUnderlying: BigInt(0),
      exchangeRate: this.EXCHANGE_RATE_PRECISION,
      pendingRewards: BigInt(0),
      lastRebaseTime: Date.now(),
      apy: 12.5, // 초기 APY 12.5%
    };

    this.stats = {
      totalRestaked: BigInt(0),
      totalRsTBURN: BigInt(0),
      activePositions: 0,
      operatorCount: 0,
      avsCount: 0,
      totalRewardsDistributed: BigInt(0),
      averageAPY: 12.5,
      totalSlashed: BigInt(0),
    };

    this.initializeDefaultAVS();
    this.initializeDefaultOperators();
  }

  /**
   * 기본 AVS 초기화
   */
  private initializeDefaultAVS(): void {
    const defaultAVSList: AVSInfo[] = [
      {
        avsId: 'avs-oracle-01',
        name: 'TBURN Price Oracle',
        type: AVSType.ORACLE,
        operator: '0xOperator1',
        totalStake: BigInt('5000000000000000000000000'),
        operatorCount: 15,
        slashingRate: 300,
        rewardRate: 800,
        minStake: BigInt('10000000000000000000000'),
        maxStakePerOperator: BigInt('500000000000000000000000'),
        isActive: true,
        contractAddress: '0xAVS001',
        description: 'Decentralized price oracle for TBURN ecosystem',
        securityScore: 95,
      },
      {
        avsId: 'avs-bridge-01',
        name: 'Cross-Chain Bridge Security',
        type: AVSType.BRIDGE,
        operator: '0xOperator2',
        totalStake: BigInt('8000000000000000000000000'),
        operatorCount: 20,
        slashingRate: 500,
        rewardRate: 1200,
        minStake: BigInt('50000000000000000000000'),
        maxStakePerOperator: BigInt('1000000000000000000000000'),
        isActive: true,
        contractAddress: '0xAVS002',
        description: 'Security layer for cross-chain bridge operations',
        securityScore: 98,
      },
      {
        avsId: 'avs-da-01',
        name: 'Modular DA Validation',
        type: AVSType.DA_LAYER,
        operator: '0xOperator3',
        totalStake: BigInt('3000000000000000000000000'),
        operatorCount: 10,
        slashingRate: 200,
        rewardRate: 600,
        minStake: BigInt('5000000000000000000000'),
        maxStakePerOperator: BigInt('300000000000000000000000'),
        isActive: true,
        contractAddress: '0xAVS003',
        description: 'Data availability layer validation service',
        securityScore: 92,
      },
      {
        avsId: 'avs-sequencer-01',
        name: 'L2 Sequencer Network',
        type: AVSType.SEQUENCER,
        operator: '0xOperator4',
        totalStake: BigInt('6000000000000000000000000'),
        operatorCount: 12,
        slashingRate: 400,
        rewardRate: 1000,
        minStake: BigInt('25000000000000000000000'),
        maxStakePerOperator: BigInt('600000000000000000000000'),
        isActive: true,
        contractAddress: '0xAVS004',
        description: 'Decentralized sequencer for ZK rollup',
        securityScore: 96,
      },
    ];

    for (const avs of defaultAVSList) {
      this.avsList.set(avs.avsId, avs);
    }

    this.stats.avsCount = this.avsList.size;
    console.log('[RestakingManager] Initialized', this.avsList.size, 'AVS services');
  }

  /**
   * 기본 운영자 초기화
   */
  private initializeDefaultOperators(): void {
    const defaultOperators: OperatorInfo[] = [
      {
        operatorId: 'op-01',
        address: '0xOperator1Address',
        name: 'TBURN Foundation',
        totalDelegation: BigInt('2000000000000000000000000'),
        avsRegistrations: ['avs-oracle-01', 'avs-bridge-01'],
        commission: 500, // 5%
        status: 'ACTIVE',
        uptime: 99.95,
        performanceScore: 98,
        slashEvents: [],
      },
      {
        operatorId: 'op-02',
        address: '0xOperator2Address',
        name: 'StakeNode Pro',
        totalDelegation: BigInt('1500000000000000000000000'),
        avsRegistrations: ['avs-bridge-01', 'avs-da-01'],
        commission: 750, // 7.5%
        status: 'ACTIVE',
        uptime: 99.8,
        performanceScore: 95,
        slashEvents: [],
      },
      {
        operatorId: 'op-03',
        address: '0xOperator3Address',
        name: 'ValidatorOne',
        totalDelegation: BigInt('1000000000000000000000000'),
        avsRegistrations: ['avs-sequencer-01'],
        commission: 600, // 6%
        status: 'ACTIVE',
        uptime: 99.9,
        performanceScore: 97,
        slashEvents: [],
      },
    ];

    for (const operator of defaultOperators) {
      this.operators.set(operator.operatorId, operator);
    }

    this.stats.operatorCount = this.operators.size;
    console.log('[RestakingManager] Initialized', this.operators.size, 'operators');
  }

  /**
   * 시작
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startRebaseLoop();

    console.log('[RestakingManager] Started');
    this.emit('started');
  }

  /**
   * 중지
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.rebaseLoop) {
      clearInterval(this.rebaseLoop);
      this.rebaseLoop = null;
    }

    console.log('[RestakingManager] Stopped');
    this.emit('stopped');
  }

  /**
   * TBURN 리스테이킹 (rsTBURN 발행)
   */
  async restake(
    staker: string,
    amount: bigint,
    avsAllocations?: Map<string, bigint>
  ): Promise<RestakingPosition> {
    if (amount < this.config.minRestakeAmount) {
      throw new Error(`Amount below minimum: ${amount} < ${this.config.minRestakeAmount}`);
    }

    if (amount > this.config.maxRestakeAmount) {
      throw new Error(`Amount exceeds maximum: ${amount} > ${this.config.maxRestakeAmount}`);
    }

    const rsTBURNAmount = this.calculateRsTBURNAmount(amount);

    const positionId = this.generatePositionId(staker);
    const position: RestakingPosition = {
      positionId,
      staker,
      amount,
      rsTBURNBalance: rsTBURNAmount,
      avsAllocations: avsAllocations || new Map(),
      state: RestakingState.RESTAKED,
      restakeTimestamp: Date.now(),
      unbondingEndTime: 0,
      slashable: true,
      rewards: BigInt(0),
    };

    if (avsAllocations) {
      this.validateAVSAllocations(avsAllocations, amount);
      await this.registerWithAVS(position);
    }

    this.positions.set(positionId, position);

    this.rsTBURNInfo.totalSupply += rsTBURNAmount;
    this.rsTBURNInfo.totalUnderlying += amount;
    this.updateExchangeRate();

    this.stats.totalRestaked += amount;
    this.stats.totalRsTBURN += rsTBURNAmount;
    this.stats.activePositions++;

    console.log(`[RestakingManager] Restaked ${amount} TBURN → ${rsTBURNAmount} rsTBURN for ${staker}`);
    this.emit('restaked', { positionId, staker, amount, rsTBURNAmount });

    return position;
  }

  /**
   * 언스테이킹 요청
   */
  async requestUnstake(positionId: string): Promise<RestakingPosition> {
    const position = this.positions.get(positionId);
    if (!position) {
      throw new Error(`Position not found: ${positionId}`);
    }

    if (position.state !== RestakingState.RESTAKED) {
      throw new Error(`Invalid state for unstaking: ${position.state}`);
    }

    position.state = RestakingState.UNBONDING;
    position.unbondingEndTime = Date.now() + this.config.unbondingPeriod;

    for (const avsId of position.avsAllocations.keys()) {
      await this.deregisterFromAVS(positionId, avsId);
    }

    console.log(`[RestakingManager] Unstake requested for position ${positionId}`);
    this.emit('unstakeRequested', { positionId, unbondingEndTime: position.unbondingEndTime });

    return position;
  }

  /**
   * 출금 완료
   */
  async withdraw(positionId: string): Promise<{ amount: bigint; rewards: bigint }> {
    const position = this.positions.get(positionId);
    if (!position) {
      throw new Error(`Position not found: ${positionId}`);
    }

    if (position.state !== RestakingState.UNBONDING) {
      throw new Error(`Invalid state for withdrawal: ${position.state}`);
    }

    if (Date.now() < position.unbondingEndTime) {
      throw new Error(`Unbonding period not completed`);
    }

    const tburnAmount = this.calculateTBURNAmount(position.rsTBURNBalance);
    const rewards = position.rewards;

    position.state = RestakingState.WITHDRAWN;

    this.rsTBURNInfo.totalSupply -= position.rsTBURNBalance;
    this.rsTBURNInfo.totalUnderlying -= position.amount;
    this.updateExchangeRate();

    this.stats.totalRestaked -= position.amount;
    this.stats.totalRsTBURN -= position.rsTBURNBalance;
    this.stats.activePositions--;
    this.stats.totalRewardsDistributed += rewards;

    console.log(`[RestakingManager] Withdrawn ${tburnAmount} TBURN + ${rewards} rewards for position ${positionId}`);
    this.emit('withdrawn', { positionId, amount: tburnAmount, rewards });

    return { amount: tburnAmount, rewards };
  }

  /**
   * AVS에 할당 추가
   */
  async allocateToAVS(
    positionId: string,
    avsId: string,
    amount: bigint
  ): Promise<void> {
    const position = this.positions.get(positionId);
    if (!position) {
      throw new Error(`Position not found: ${positionId}`);
    }

    const avs = this.avsList.get(avsId);
    if (!avs) {
      throw new Error(`AVS not found: ${avsId}`);
    }

    if (!avs.isActive) {
      throw new Error(`AVS is not active: ${avsId}`);
    }

    if (amount < avs.minStake) {
      throw new Error(`Amount below AVS minimum: ${amount} < ${avs.minStake}`);
    }

    if (position.avsAllocations.size >= this.config.maxAVSPerPosition) {
      throw new Error(`Maximum AVS allocations reached: ${this.config.maxAVSPerPosition}`);
    }

    const currentAllocation = position.avsAllocations.get(avsId) || BigInt(0);
    position.avsAllocations.set(avsId, currentAllocation + amount);

    avs.totalStake += amount;

    console.log(`[RestakingManager] Allocated ${amount} to AVS ${avsId} for position ${positionId}`);
    this.emit('avsAllocated', { positionId, avsId, amount });
  }

  /**
   * 슬래싱 적용
   */
  async applySlashing(
    operatorId: string,
    avsId: string,
    slashAmount: bigint,
    reason: string,
    evidence: Buffer
  ): Promise<SlashEvent> {
    const operator = this.operators.get(operatorId);
    if (!operator) {
      throw new Error(`Operator not found: ${operatorId}`);
    }

    const avs = this.avsList.get(avsId);
    if (!avs) {
      throw new Error(`AVS not found: ${avsId}`);
    }

    const slashEvent: SlashEvent = {
      eventId: `slash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      operatorId,
      avsId,
      amount: slashAmount,
      reason,
      timestamp: Date.now(),
      evidence,
    };

    operator.slashEvents.push(slashEvent);
    operator.totalDelegation -= slashAmount;
    
    if (operator.totalDelegation <= BigInt(0)) {
      operator.status = 'SLASHED';
    }

    avs.totalStake -= slashAmount;

    for (const position of this.positions.values()) {
      if (position.avsAllocations.has(avsId)) {
        const allocation = position.avsAllocations.get(avsId)!;
        const positionSlash = (allocation * slashAmount) / avs.totalStake;
        position.amount -= positionSlash;
        position.rsTBURNBalance = this.calculateRsTBURNAmount(position.amount);
      }
    }

    this.stats.totalSlashed += slashAmount;

    console.log(`[RestakingManager] Slashed ${slashAmount} from operator ${operatorId} for AVS ${avsId}`);
    this.emit('slashed', slashEvent);

    return slashEvent;
  }

  /**
   * 포지션 조회
   */
  getPosition(positionId: string): RestakingPosition | undefined {
    return this.positions.get(positionId);
  }

  /**
   * 사용자의 모든 포지션 조회
   */
  getPositionsByStaker(staker: string): RestakingPosition[] {
    return Array.from(this.positions.values()).filter(p => p.staker === staker);
  }

  /**
   * AVS 목록 조회
   */
  getAVSList(): AVSInfo[] {
    return Array.from(this.avsList.values());
  }

  /**
   * AVS 상세 조회
   */
  getAVS(avsId: string): AVSInfo | undefined {
    return this.avsList.get(avsId);
  }

  /**
   * 운영자 목록 조회
   */
  getOperators(): OperatorInfo[] {
    return Array.from(this.operators.values());
  }

  /**
   * 운영자 상세 조회
   */
  getOperator(operatorId: string): OperatorInfo | undefined {
    return this.operators.get(operatorId);
  }

  /**
   * rsTBURN 정보 조회
   */
  getRsTBURNInfo(): RsTBURNInfo {
    return { ...this.rsTBURNInfo };
  }

  /**
   * 통계 조회
   */
  getStats(): RestakingStats {
    return { ...this.stats };
  }

  /**
   * rsTBURN 발행량 계산
   */
  private calculateRsTBURNAmount(tburnAmount: bigint): bigint {
    if (this.rsTBURNInfo.totalSupply === BigInt(0)) {
      return tburnAmount;
    }
    return (tburnAmount * this.EXCHANGE_RATE_PRECISION) / this.rsTBURNInfo.exchangeRate;
  }

  /**
   * TBURN 출금량 계산
   */
  private calculateTBURNAmount(rsTBURNAmount: bigint): bigint {
    return (rsTBURNAmount * this.rsTBURNInfo.exchangeRate) / this.EXCHANGE_RATE_PRECISION;
  }

  /**
   * 환율 업데이트
   */
  private updateExchangeRate(): void {
    if (this.rsTBURNInfo.totalSupply === BigInt(0)) {
      this.rsTBURNInfo.exchangeRate = this.EXCHANGE_RATE_PRECISION;
      return;
    }
    
    this.rsTBURNInfo.exchangeRate = 
      (this.rsTBURNInfo.totalUnderlying * this.EXCHANGE_RATE_PRECISION) / 
      this.rsTBURNInfo.totalSupply;
  }

  /**
   * AVS 할당 검증
   */
  private validateAVSAllocations(allocations: Map<string, bigint>, totalAmount: bigint): void {
    let totalAllocated = BigInt(0);
    
    for (const [avsId, amount] of allocations) {
      const avs = this.avsList.get(avsId);
      if (!avs) {
        throw new Error(`AVS not found: ${avsId}`);
      }
      if (!avs.isActive) {
        throw new Error(`AVS is not active: ${avsId}`);
      }
      if (amount < avs.minStake) {
        throw new Error(`Allocation below minimum for AVS ${avsId}`);
      }
      totalAllocated += amount;
    }

    if (totalAllocated > totalAmount) {
      throw new Error(`Total allocations exceed restaked amount`);
    }
  }

  /**
   * AVS 등록
   */
  private async registerWithAVS(position: RestakingPosition): Promise<void> {
    for (const [avsId, amount] of position.avsAllocations) {
      const avs = this.avsList.get(avsId);
      if (avs) {
        avs.totalStake += amount;
      }
    }
  }

  /**
   * AVS 등록 해제
   */
  private async deregisterFromAVS(positionId: string, avsId: string): Promise<void> {
    const position = this.positions.get(positionId);
    const avs = this.avsList.get(avsId);
    
    if (position && avs) {
      const allocation = position.avsAllocations.get(avsId) || BigInt(0);
      avs.totalStake -= allocation;
      position.avsAllocations.delete(avsId);
    }
  }

  /**
   * 리베이스 루프 시작
   */
  private startRebaseLoop(): void {
    this.rebaseLoop = setInterval(async () => {
      await this.performRebase();
    }, this.config.rebaseInterval);
  }

  /**
   * 리베이스 수행 (보상 분배)
   */
  private async performRebase(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRebase = now - this.rsTBURNInfo.lastRebaseTime;
    
    const annualRewardRate = this.rsTBURNInfo.apy / 100;
    const periodRewardRate = annualRewardRate * (timeSinceLastRebase / (365 * 24 * 60 * 60 * 1000));
    
    const rewards = BigInt(Math.floor(Number(this.rsTBURNInfo.totalUnderlying) * periodRewardRate));
    
    this.rsTBURNInfo.totalUnderlying += rewards;
    this.rsTBURNInfo.pendingRewards = BigInt(0);
    this.rsTBURNInfo.lastRebaseTime = now;
    this.updateExchangeRate();

    for (const position of this.positions.values()) {
      if (position.state === RestakingState.RESTAKED) {
        const positionRewards = (rewards * position.rsTBURNBalance) / this.rsTBURNInfo.totalSupply;
        position.rewards += positionRewards;
      }
    }

    console.log(`[RestakingManager] Rebase completed: ${rewards} TBURN rewards distributed`);
    this.emit('rebased', { rewards, newExchangeRate: this.rsTBURNInfo.exchangeRate });
  }

  /**
   * 포지션 ID 생성
   */
  private generatePositionId(staker: string): string {
    return `pos-${staker.slice(2, 10)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export const restakingManager = new RestakingManager();
