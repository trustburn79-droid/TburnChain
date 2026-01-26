/**
 * TBC4337Manager - 어카운트 추상화 서비스
 * 
 * 기존 TBC 토큰 시스템과 ERC-4337 통합
 * 스마트 월렛, 세션키, Paymaster 제공
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

/**
 * UserOperation (ERC-4337 표준)
 */
export interface UserOperation {
  sender: string;
  nonce: bigint;
  initCode: Buffer;
  callData: Buffer;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Buffer;
  signature: Buffer;
}

/**
 * 스마트 월렛 설정
 */
export interface SmartWalletConfig {
  owner: string;
  guardians: string[];
  recoveryThreshold: number;
  sessionKeys: SessionKeyConfig[];
  modules: string[];
}

/**
 * 세션키 설정
 */
export interface SessionKeyConfig {
  key: string;
  validUntil: number;
  validAfter: number;
  spendingLimit: bigint;
  allowedSelectors: string[];
  allowedTargets: string[];
}

/**
 * 스마트 월렛 정보
 */
export interface SmartWalletInfo {
  address: string;
  owner: string;
  guardians: string[];
  recoveryThreshold: number;
  sessionKeyCount: number;
  moduleCount: number;
  balance: bigint;
  nonce: bigint;
  isDeployed: boolean;
  createdAt: number;
}

/**
 * Paymaster 타입
 */
export enum PaymasterType {
  TOKEN = 'TOKEN',
  VERIFYING = 'VERIFYING',
  DAPP = 'DAPP',
}

/**
 * Paymaster 정보
 */
export interface PaymasterInfo {
  paymasterId: string;
  type: PaymasterType;
  name: string;
  supportedTokens: string[];
  balance: bigint;
  totalSponsored: bigint;
  transactionCount: number;
  isActive: boolean;
}

/**
 * UserOp 실행 결과
 */
export interface UserOpResult {
  userOpHash: string;
  success: boolean;
  actualGasCost: bigint;
  actualGasUsed: bigint;
  returnData: Buffer;
  logs: string[];
}

/**
 * 리커버리 요청
 */
export interface RecoveryRequest {
  requestId: string;
  walletAddress: string;
  newOwner: string;
  initiatedBy: string;
  approvals: Set<string>;
  executionTime: number;
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'CANCELLED';
}

/**
 * 배치 트랜잭션
 */
export interface BatchTransaction {
  to: string;
  value: bigint;
  data: Buffer;
}

/**
 * 어카운트 추상화 통계
 */
export interface AA4337Stats {
  totalWallets: number;
  totalUserOps: number;
  totalPaymasterSponsored: bigint;
  activeSessionKeys: number;
  pendingRecoveries: number;
  bundlerQueueSize: number;
  averageGasCost: bigint;
}

/**
 * 설정
 */
export interface TBC4337Config {
  entryPointAddress: string;
  bundleSize: number;
  bundleInterval: number;
  defaultPaymaster: string;
}

/**
 * TBC4337Manager - 어카운트 추상화 관리 서비스
 */
export class TBC4337Manager extends EventEmitter {
  private config: TBC4337Config;
  private wallets: Map<string, SmartWallet> = new Map();
  private nonces: Map<string, bigint> = new Map();
  private pendingUserOps: UserOperation[] = [];
  private paymasters: Map<string, Paymaster> = new Map();
  private recoveryRequests: Map<string, RecoveryRequest> = new Map();
  private userOpResults: Map<string, UserOpResult> = new Map();

  private bundlerInterval: NodeJS.Timer | null = null;
  private isRunning: boolean = false;

  private readonly BUNDLE_SIZE = 100;
  private readonly BUNDLE_INTERVAL = 1000; // 1초
  private readonly RECOVERY_DELAY = 2 * 24 * 60 * 60 * 1000; // 2일

  constructor(config: Partial<TBC4337Config> = {}) {
    super();

    this.config = {
      entryPointAddress: '0xEntryPoint001',
      bundleSize: this.BUNDLE_SIZE,
      bundleInterval: this.BUNDLE_INTERVAL,
      defaultPaymaster: 'tburn-paymaster',
      ...config,
    };

    this.initializeDefaultPaymasters();
    console.log('[TBC4337Manager] Initialized with EntryPoint:', this.config.entryPointAddress);
  }

  /**
   * 기본 Paymaster 초기화
   */
  private initializeDefaultPaymasters(): void {
    this.paymasters.set('tburn-paymaster', new TokenPaymaster({
      paymasterId: 'tburn-paymaster',
      name: 'TBURN Token Paymaster',
      supportedTokens: ['TBURN'],
      markup: 0,
    }));

    this.paymasters.set('verifying-paymaster', new VerifyingPaymaster({
      paymasterId: 'verifying-paymaster',
      name: 'Verifying Paymaster',
      signer: '0xPaymasterSigner',
    }));

    this.paymasters.set('dapp-paymaster', new DAppPaymaster({
      paymasterId: 'dapp-paymaster',
      name: 'dApp Sponsor Paymaster',
    }));

    console.log('[TBC4337Manager] Initialized', this.paymasters.size, 'paymasters');
  }

  /**
   * 시작
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startBundler();

    console.log('[TBC4337Manager] Started');
    this.emit('started');
  }

  /**
   * 중지
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.bundlerInterval) {
      clearInterval(this.bundlerInterval);
      this.bundlerInterval = null;
    }

    console.log('[TBC4337Manager] Stopped');
    this.emit('stopped');
  }

  /**
   * 스마트 월렛 생성
   */
  async createSmartWallet(config: SmartWalletConfig): Promise<string> {
    const walletAddress = this.computeWalletAddress(config);

    const wallet = new SmartWallet({
      address: walletAddress,
      owner: config.owner,
      guardians: config.guardians,
      recoveryThreshold: config.recoveryThreshold,
      sessionKeys: new Map(),
      modules: new Set(config.modules),
    });

    for (const sk of config.sessionKeys) {
      wallet.addSessionKey(sk);
    }

    this.wallets.set(walletAddress, wallet);
    this.nonces.set(walletAddress, BigInt(0));

    console.log(`[TBC4337Manager] Smart Wallet created: ${walletAddress}`);
    this.emit('walletCreated', { address: walletAddress, owner: config.owner });

    return walletAddress;
  }

  /**
   * UserOperation 제출
   */
  async submitUserOp(userOp: UserOperation): Promise<string> {
    await this.validateUserOp(userOp);

    this.pendingUserOps.push(userOp);
    const userOpHash = this.computeUserOpHash(userOp);

    console.log(`[TBC4337Manager] UserOp submitted: ${userOpHash}`);
    this.emit('userOpSubmitted', { userOpHash, sender: userOp.sender });

    return userOpHash;
  }

  /**
   * 세션키 추가
   */
  async addSessionKey(
    walletAddress: string,
    sessionKey: SessionKeyConfig,
    signature: Buffer
  ): Promise<void> {
    const wallet = this.wallets.get(walletAddress);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletAddress}`);
    }

    const isValidSig = await wallet.verifyOwnerSignature(
      Buffer.from(JSON.stringify(sessionKey)),
      signature
    );
    if (!isValidSig) {
      throw new Error('Invalid signature');
    }

    wallet.addSessionKey(sessionKey);

    console.log(`[TBC4337Manager] Session key added for wallet: ${walletAddress}`);
    this.emit('sessionKeyAdded', { walletAddress, key: sessionKey.key });
  }

  /**
   * 배치 트랜잭션 실행
   */
  async executeBatchTransactions(
    walletAddress: string,
    transactions: BatchTransaction[],
    signature: Buffer
  ): Promise<string[]> {
    const wallet = this.wallets.get(walletAddress);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletAddress}`);
    }

    const results: string[] = [];

    for (const tx of transactions) {
      const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      await wallet.execute(tx.to, tx.value, tx.data);
      results.push(txHash);
    }

    console.log(`[TBC4337Manager] Batch executed: ${transactions.length} transactions`);
    this.emit('batchExecuted', { walletAddress, count: transactions.length });

    return results;
  }

  /**
   * 리커버리 시작
   */
  async initiateRecovery(
    walletAddress: string,
    newOwner: string,
    signature: Buffer,
    guardian: string
  ): Promise<string> {
    const wallet = this.wallets.get(walletAddress);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletAddress}`);
    }

    if (!wallet.isGuardian(guardian)) {
      throw new Error('Not a guardian');
    }

    const requestId = `recovery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const request: RecoveryRequest = {
      requestId,
      walletAddress,
      newOwner,
      initiatedBy: guardian,
      approvals: new Set([guardian]),
      executionTime: Date.now() + this.RECOVERY_DELAY,
      status: 'PENDING',
    };

    this.recoveryRequests.set(requestId, request);

    console.log(`[TBC4337Manager] Recovery initiated: ${requestId}`);
    this.emit('recoveryInitiated', { requestId, walletAddress, newOwner });

    return requestId;
  }

  /**
   * 리커버리 승인
   */
  async approveRecovery(requestId: string, guardian: string, signature: Buffer): Promise<void> {
    const request = this.recoveryRequests.get(requestId);
    if (!request) {
      throw new Error(`Recovery request not found: ${requestId}`);
    }

    const wallet = this.wallets.get(request.walletAddress);
    if (!wallet) {
      throw new Error(`Wallet not found: ${request.walletAddress}`);
    }

    if (!wallet.isGuardian(guardian)) {
      throw new Error('Not a guardian');
    }

    request.approvals.add(guardian);

    if (request.approvals.size >= wallet.getRecoveryThreshold()) {
      request.status = 'APPROVED';
    }

    console.log(`[TBC4337Manager] Recovery approved by ${guardian}: ${requestId}`);
    this.emit('recoveryApproved', { requestId, guardian, approvalCount: request.approvals.size });
  }

  /**
   * 리커버리 실행
   */
  async executeRecovery(requestId: string): Promise<void> {
    const request = this.recoveryRequests.get(requestId);
    if (!request) {
      throw new Error(`Recovery request not found: ${requestId}`);
    }

    if (request.status !== 'APPROVED') {
      throw new Error('Recovery not approved');
    }

    if (Date.now() < request.executionTime) {
      throw new Error('Recovery delay not passed');
    }

    const wallet = this.wallets.get(request.walletAddress);
    if (!wallet) {
      throw new Error(`Wallet not found: ${request.walletAddress}`);
    }

    wallet.transferOwnership(request.newOwner);
    request.status = 'EXECUTED';

    console.log(`[TBC4337Manager] Recovery executed: ${requestId}`);
    this.emit('recoveryExecuted', { requestId, newOwner: request.newOwner });
  }

  /**
   * 지갑 정보 조회
   */
  getWalletInfo(address: string): SmartWalletInfo | null {
    const wallet = this.wallets.get(address);
    if (!wallet) return null;

    return wallet.getInfo();
  }

  /**
   * UserOp 결과 조회
   */
  getUserOpResult(userOpHash: string): UserOpResult | undefined {
    return this.userOpResults.get(userOpHash);
  }

  /**
   * Paymaster 목록 조회
   */
  getPaymasters(): PaymasterInfo[] {
    return Array.from(this.paymasters.values()).map(p => p.getInfo());
  }

  /**
   * 통계 조회
   */
  getStats(): AA4337Stats {
    let activeSessionKeys = 0;
    for (const wallet of this.wallets.values()) {
      activeSessionKeys += wallet.getActiveSessionKeyCount();
    }

    let totalPaymasterSponsored = BigInt(0);
    for (const paymaster of this.paymasters.values()) {
      totalPaymasterSponsored += paymaster.getTotalSponsored();
    }

    return {
      totalWallets: this.wallets.size,
      totalUserOps: this.userOpResults.size,
      totalPaymasterSponsored,
      activeSessionKeys,
      pendingRecoveries: Array.from(this.recoveryRequests.values())
        .filter(r => r.status === 'PENDING').length,
      bundlerQueueSize: this.pendingUserOps.length,
      averageGasCost: BigInt(50000), // 예상치
    };
  }

  /**
   * UserOperation 검증
   */
  private async validateUserOp(userOp: UserOperation): Promise<void> {
    const wallet = this.wallets.get(userOp.sender);

    if (!wallet && userOp.initCode.length === 0) {
      throw new Error('Wallet not found and no initCode provided');
    }

    const expectedNonce = this.nonces.get(userOp.sender) || BigInt(0);
    if (userOp.nonce !== expectedNonce) {
      throw new Error(`Invalid nonce: expected ${expectedNonce}, got ${userOp.nonce}`);
    }

    if (wallet) {
      const isValid = await wallet.validateSignature(userOp);
      if (!isValid) {
        throw new Error('Invalid signature');
      }
    }

    if (userOp.paymasterAndData.length > 0) {
      await this.validatePaymaster(userOp);
    }
  }

  /**
   * Paymaster 검증
   */
  private async validatePaymaster(userOp: UserOperation): Promise<void> {
    const paymasterAddress = userOp.paymasterAndData.slice(0, 20).toString('hex');
    
    for (const paymaster of this.paymasters.values()) {
      const isValid = await paymaster.validateUserOp(userOp);
      if (isValid) return;
    }

    throw new Error('Paymaster validation failed');
  }

  /**
   * Bundler 시작
   */
  private startBundler(): void {
    this.bundlerInterval = setInterval(async () => {
      if (this.pendingUserOps.length === 0) return;

      try {
        await this.executeBatch();
      } catch (e) {
        console.error('[TBC4337Manager] Bundler error:', e);
      }
    }, this.config.bundleInterval);
  }

  /**
   * 배치 실행
   */
  private async executeBatch(): Promise<void> {
    const batch = this.pendingUserOps.splice(0, this.config.bundleSize);

    for (const userOp of batch) {
      try {
        const result = await this.executeUserOp(userOp);
        const userOpHash = this.computeUserOpHash(userOp);
        this.userOpResults.set(userOpHash, result);
      } catch (e: any) {
        console.error(`[TBC4337Manager] UserOp failed: ${e.message}`);
      }
    }

    console.log(`[TBC4337Manager] Batch executed: ${batch.length} UserOps`);
  }

  /**
   * 단일 UserOp 실행
   */
  private async executeUserOp(userOp: UserOperation): Promise<UserOpResult> {
    if (userOp.initCode.length > 0 && !this.wallets.has(userOp.sender)) {
      await this.deployWallet(userOp);
    }

    const wallet = this.wallets.get(userOp.sender)!;
    const { target, value, data } = this.parseCallData(userOp.callData);

    await wallet.execute(target, value, data);

    if (userOp.paymasterAndData.length > 0) {
      await this.settlePaymaster(userOp);
    }

    const currentNonce = this.nonces.get(userOp.sender) || BigInt(0);
    this.nonces.set(userOp.sender, currentNonce + BigInt(1));

    return {
      userOpHash: this.computeUserOpHash(userOp),
      success: true,
      actualGasCost: userOp.callGasLimit * userOp.maxFeePerGas,
      actualGasUsed: userOp.callGasLimit,
      returnData: Buffer.alloc(0),
      logs: [],
    };
  }

  /**
   * 지갑 배포
   */
  private async deployWallet(userOp: UserOperation): Promise<void> {
    const config: SmartWalletConfig = {
      owner: userOp.sender,
      guardians: [],
      recoveryThreshold: 1,
      sessionKeys: [],
      modules: [],
    };

    await this.createSmartWallet(config);
  }

  /**
   * Paymaster 정산
   */
  private async settlePaymaster(userOp: UserOperation): Promise<void> {
    const gasCost = userOp.callGasLimit * userOp.maxFeePerGas;
    
    for (const paymaster of this.paymasters.values()) {
      try {
        await paymaster.postOp(userOp, gasCost);
        break;
      } catch (e) {
        continue;
      }
    }
  }

  /**
   * callData 파싱
   */
  private parseCallData(callData: Buffer): { target: string; value: bigint; data: Buffer } {
    return {
      target: callData.slice(0, 20).toString('hex'),
      value: BigInt(0),
      data: callData.slice(20),
    };
  }

  /**
   * 지갑 주소 계산 (CREATE2)
   */
  private computeWalletAddress(config: SmartWalletConfig): string {
    const salt = crypto.createHash('sha256')
      .update(`${config.owner}${Date.now()}`)
      .digest('hex');
    return `0x${salt.slice(0, 40)}`;
  }

  /**
   * UserOp 해시 계산
   */
  private computeUserOpHash(userOp: UserOperation): string {
    const packed = `${userOp.sender}${userOp.nonce}${userOp.callData.toString('hex')}`;
    return `0x${crypto.createHash('sha256').update(packed).digest('hex')}`;
  }
}

/**
 * SmartWallet 클래스
 */
class SmartWallet {
  private address: string;
  private owner: string;
  private guardians: string[];
  private recoveryThreshold: number;
  private sessionKeys: Map<string, SessionKeyConfig>;
  private modules: Set<string>;
  private balance: bigint = BigInt(0);
  private createdAt: number;

  constructor(config: any) {
    this.address = config.address;
    this.owner = config.owner;
    this.guardians = config.guardians;
    this.recoveryThreshold = config.recoveryThreshold;
    this.sessionKeys = config.sessionKeys;
    this.modules = config.modules;
    this.createdAt = Date.now();
  }

  async validateSignature(userOp: UserOperation): Promise<boolean> {
    return true;
  }

  async verifyOwnerSignature(hash: Buffer, signature: Buffer): Promise<boolean> {
    return true;
  }

  addSessionKey(sk: SessionKeyConfig): void {
    this.sessionKeys.set(sk.key, sk);
  }

  isGuardian(address: string): boolean {
    return this.guardians.includes(address);
  }

  getRecoveryThreshold(): number {
    return this.recoveryThreshold;
  }

  transferOwnership(newOwner: string): void {
    this.owner = newOwner;
  }

  async execute(to: string, value: bigint, data: Buffer): Promise<void> {
    // 트랜잭션 실행
  }

  getActiveSessionKeyCount(): number {
    const now = Date.now();
    return Array.from(this.sessionKeys.values())
      .filter(sk => sk.validAfter <= now && sk.validUntil >= now)
      .length;
  }

  getInfo(): SmartWalletInfo {
    return {
      address: this.address,
      owner: this.owner,
      guardians: this.guardians,
      recoveryThreshold: this.recoveryThreshold,
      sessionKeyCount: this.sessionKeys.size,
      moduleCount: this.modules.size,
      balance: this.balance,
      nonce: BigInt(0),
      isDeployed: true,
      createdAt: this.createdAt,
    };
  }
}

/**
 * Paymaster 인터페이스
 */
interface Paymaster {
  validateUserOp(userOp: UserOperation): Promise<boolean>;
  postOp(userOp: UserOperation, gasCost: bigint): Promise<void>;
  getInfo(): PaymasterInfo;
  getTotalSponsored(): bigint;
}

/**
 * Token Paymaster (토큰으로 가스 지불)
 */
class TokenPaymaster implements Paymaster {
  private paymasterId: string;
  private name: string;
  private supportedTokens: string[];
  private markup: number;
  private balance: bigint = BigInt('1000000000000000000000000');
  private totalSponsored: bigint = BigInt(0);
  private transactionCount: number = 0;

  constructor(config: any) {
    this.paymasterId = config.paymasterId;
    this.name = config.name;
    this.supportedTokens = config.supportedTokens;
    this.markup = config.markup;
  }

  async validateUserOp(userOp: UserOperation): Promise<boolean> {
    return true;
  }

  async postOp(userOp: UserOperation, gasCost: bigint): Promise<void> {
    this.totalSponsored += gasCost;
    this.transactionCount++;
  }

  getInfo(): PaymasterInfo {
    return {
      paymasterId: this.paymasterId,
      type: PaymasterType.TOKEN,
      name: this.name,
      supportedTokens: this.supportedTokens,
      balance: this.balance,
      totalSponsored: this.totalSponsored,
      transactionCount: this.transactionCount,
      isActive: true,
    };
  }

  getTotalSponsored(): bigint {
    return this.totalSponsored;
  }
}

/**
 * Verifying Paymaster (서명 기반)
 */
class VerifyingPaymaster implements Paymaster {
  private paymasterId: string;
  private name: string;
  private signer: string;
  private balance: bigint = BigInt('500000000000000000000000');
  private totalSponsored: bigint = BigInt(0);
  private transactionCount: number = 0;

  constructor(config: any) {
    this.paymasterId = config.paymasterId;
    this.name = config.name;
    this.signer = config.signer;
  }

  async validateUserOp(userOp: UserOperation): Promise<boolean> {
    return true;
  }

  async postOp(userOp: UserOperation, gasCost: bigint): Promise<void> {
    this.totalSponsored += gasCost;
    this.transactionCount++;
  }

  getInfo(): PaymasterInfo {
    return {
      paymasterId: this.paymasterId,
      type: PaymasterType.VERIFYING,
      name: this.name,
      supportedTokens: [],
      balance: this.balance,
      totalSponsored: this.totalSponsored,
      transactionCount: this.transactionCount,
      isActive: true,
    };
  }

  getTotalSponsored(): bigint {
    return this.totalSponsored;
  }
}

/**
 * dApp Paymaster (dApp이 가스 대납)
 */
class DAppPaymaster implements Paymaster {
  private paymasterId: string;
  private name: string;
  private sponsorRegistry: Map<string, bigint> = new Map();
  private totalSponsored: bigint = BigInt(0);
  private transactionCount: number = 0;

  constructor(config: any) {
    this.paymasterId = config.paymasterId;
    this.name = config.name;
  }

  async validateUserOp(userOp: UserOperation): Promise<boolean> {
    return true;
  }

  async postOp(userOp: UserOperation, gasCost: bigint): Promise<void> {
    this.totalSponsored += gasCost;
    this.transactionCount++;
  }

  getInfo(): PaymasterInfo {
    return {
      paymasterId: this.paymasterId,
      type: PaymasterType.DAPP,
      name: this.name,
      supportedTokens: [],
      balance: BigInt('200000000000000000000000'),
      totalSponsored: this.totalSponsored,
      transactionCount: this.transactionCount,
      isActive: true,
    };
  }

  getTotalSponsored(): bigint {
    return this.totalSponsored;
  }
}

export const tbc4337Manager = new TBC4337Manager();
