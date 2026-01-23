import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Utensils, 
  Flame, 
  CheckCircle,
  Wallet,
  Coins,
  Bot,
  Images,
  ArrowLeftRight,
  Database,
  Shield,
  Server,
  Network
} from "lucide-react";
import { SiGithub } from "react-icons/si";

const codeExamples = {
  "SecureVault.sol": `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/ITrustOracle.sol";
import "@tburn/contracts/security/ReentrancyGuard.sol";
import "@tburn/contracts/access/AccessControl.sol";

/**
 * @title SecureVault - Production-Ready Vault Contract
 * @notice Trust-verified vault for TBURN Chain (Chain ID: 5800)
 * @dev RPC: https://mainnet.tburn.io/rpc | 587 validators | 24 shards
 * @custom:addressformat tb1 (Bech32m) - NOT 0x format
 */
contract SecureVault is ReentrancyGuard, AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    ITrustOracle public immutable trustOracle;
    uint256 public constant MIN_SCORE = 70;
    
    // tb1 address format: tb1qvault7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3s2
    
    mapping(address => uint256) public deposits;
    uint256 public totalDeposits;
    
    event Deposited(address indexed user, address indexed project, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    error TrustScoreTooLow(uint256 provided, uint256 required);
    error TransferFailed();
    error InsufficientBalance(uint256 requested, uint256 available);
    error ZeroAmount();
    
    constructor(address _oracle) {
        require(_oracle != address(0), "Invalid oracle");
        trustOracle = ITrustOracle(_oracle);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    function depositToProject(address project) external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        
        // 1. Verify Trust Score before deposit (CEI pattern)
        uint8 score = trustOracle.getScore(project);
        if (score < MIN_SCORE) {
            revert TrustScoreTooLow(score, MIN_SCORE);
        }
        
        // 2. Update state before external call
        deposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        // 3. External call last (reentrancy protection)
        (bool success, ) = project.call{value: msg.value}("");
        if (!success) revert TransferFailed();
        
        emit Deposited(msg.sender, project, msg.value);
    }
    
    function estimateGas() external pure returns (uint256) {
        return 45000; // Base gas for deposit operation
    }
}`,
  "App.tsx": `import { TBurnSDK } from '@tburn/sdk';
import { useState, useEffect, useCallback } from 'react';

/**
 * TBURN Wallet Connection Component
 * Chain ID: 5800 | RPC: https://mainnet.tburn.io/rpc
 * Address Format: tb1 (Bech32m) - NOT 0x format
 * Network: 587 validators | 24 shards | 100,000 TPS
 */
export function WalletConnect() {
  const [sdk, setSDK] = useState<TBurnSDK | null>(null);
  const [address, setAddress] = useState(''); // tb1 format address
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        const instance = new TBurnSDK({
          apiKey: import.meta.env.VITE_TBURN_API_KEY,
          network: 'mainnet',
          rpcUrl: 'https://mainnet.tburn.io/rpc',
          chainId: 5800,
          addressFormat: 'tb1' // Bech32m format
        });
        setSDK(instance);
      } catch (err) {
        setError('Failed to initialize SDK');
        console.error('SDK init error:', err);
      }
    };
    initSDK();
  }, []);

  const connectWallet = useCallback(async () => {
    if (!sdk || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const wallet = await sdk.connectWallet();
      // Address will be in tb1 format: tb1q...
      setAddress(wallet.address);
      
      const bal = await sdk.getBalance(wallet.address);
      setBalance(sdk.utils.formatEther(bal));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [sdk, isConnecting]);

  // Display tb1 format address
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    // tb1qxyz...abc format
    return \`\${addr.slice(0, 8)}...\${addr.slice(-6)}\`;
  };

  return (
    <div className="wallet-container">
      {error && <div className="error">{error}</div>}
      {address ? (
        <div>
          <p>Connected: {formatAddress(address)}</p>
          <p>Balance: {balance} TBURN</p>
          <p className="network-info">Chain ID: 5800 | 24 Shards</p>
        </div>
      ) : (
        <button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}`,
  "DEXSwap.sol": `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC20/ITBC20.sol";
import "@tburn/contracts/ITrustOracle.sol";
import "@tburn/contracts/security/ReentrancyGuard.sol";
import "@tburn/contracts/sharding/CrossShardAware.sol";

/**
 * @title TBurnDEX - Production-Ready DEX Contract
 * @notice Trust-verified AMM for TBURN Chain (Chain ID: 5800)
 * @dev RPC: https://mainnet.tburn.io/rpc | 587 validators | 24 shards
 */
contract TBurnDEX is ReentrancyGuard, CrossShardAware {
    ITrustOracle public immutable trustOracle;
    uint256 public constant FEE_BPS = 30; // 0.3% fee
    uint256 public constant MIN_LIQUIDITY = 1000;
    
    // tb1 address format: tb1qdex7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3s2
    
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        uint8 primaryShard; // Cross-shard optimization
    }
    
    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => mapping(address => uint256)) public liquidity;
    
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed provider, bytes32 poolId, uint256 amountA, uint256 amountB);
    
    error TrustScoreTooLow(address token, uint256 score, uint256 required);
    error SlippageExceeded(uint256 expected, uint256 actual);
    error InsufficientLiquidity();
    error ZeroAmount();
    
    constructor(address _trustOracle) {
        require(_trustOracle != address(0), "Invalid oracle");
        trustOracle = ITrustOracle(_trustOracle);
    }
    
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        
        if (pool.totalLiquidity == 0) revert InsufficientLiquidity();
        
        // Verify trust scores for tokens
        uint256 trustIn = trustOracle.getScore(tokenIn);
        uint256 trustOut = trustOracle.getScore(tokenOut);
        if (trustIn < 60) revert TrustScoreTooLow(tokenIn, trustIn, 60);
        if (trustOut < 60) revert TrustScoreTooLow(tokenOut, trustOut, 60);
        
        // Calculate output using x*y=k formula (CEI pattern)
        uint256 amountInWithFee = amountIn * (10000 - FEE_BPS);
        amountOut = (amountInWithFee * pool.reserveB) / (pool.reserveA * 10000 + amountInWithFee);
        
        if (amountOut < minAmountOut) {
            revert SlippageExceeded(minAmountOut, amountOut);
        }
        
        // Update reserves before transfers (CEI pattern)
        pool.reserveA += amountIn;
        pool.reserveB -= amountOut;
        
        // Transfer tokens (external calls last)
        bool successIn = ITBC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        bool successOut = ITBC20(tokenOut).transfer(msg.sender, amountOut);
        require(successIn && successOut, "Transfer failed");
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    function estimateSwapGas(uint256 amountIn) external pure returns (uint256) {
        return 85000 + (amountIn / 10**18) * 100;
    }
    
    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            tokenA < tokenB ? tokenA : tokenB,
            tokenA < tokenB ? tokenB : tokenA
        ));
    }
}`,
  "NFTMint.sol": `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC721/TBC721.sol";
import "@tburn/contracts/ITrustOracle.sol";
import "@tburn/contracts/security/ReentrancyGuard.sol";
import "@tburn/contracts/access/AccessControl.sol";

/**
 * @title TBurnNFT - Production-Ready NFT Contract
 * @notice Trust-verified NFT minting for TBURN Chain (Chain ID: 5800)
 * @dev RPC: https://mainnet.tburn.io/rpc | 587 validators | 24 shards
 * @custom:addressformat tb1 (Bech32m) - NOT 0x format
 */
contract TBurnNFT is TBC721, ReentrancyGuard, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    ITrustOracle public immutable trustOracle;
    uint256 public nextTokenId;
    uint256 public mintPrice = 0.1 ether;
    uint256 public maxSupply = 10000;
    
    // tb1 address format: tb1qnft7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3s2
    
    string private _baseTokenURI;
    
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256) public mintCount;
    mapping(bytes32 => bool) public usedContentHashes;
    
    event NFTMinted(address indexed minter, uint256 tokenId, string tokenURI, uint8 shard);
    
    error MaxSupplyReached();
    error InsufficientPayment(uint256 sent, uint256 required);
    error TrustScoreTooLow(uint256 provided, uint256 required);
    error MintLimitReached(uint256 current, uint256 max);
    error ContentAlreadyMinted(bytes32 contentHash);
    
    constructor(
        address _oracle,
        string memory baseURI
    ) TBC721("TBURN Collection", "TBNFT") {
        require(_oracle != address(0), "Invalid oracle");
        trustOracle = ITrustOracle(_oracle);
        _baseTokenURI = baseURI;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function mint(
        string memory tokenURI,
        bytes32 contentHash
    ) external payable nonReentrant returns (uint256) {
        if (nextTokenId >= maxSupply) revert MaxSupplyReached();
        if (msg.value < mintPrice) {
            revert InsufficientPayment(msg.value, mintPrice);
        }
        if (usedContentHashes[contentHash]) {
            revert ContentAlreadyMinted(contentHash);
        }
        
        // Check minter trust score for anti-bot protection
        uint8 score = trustOracle.getScore(msg.sender);
        if (score < 50) revert TrustScoreTooLow(score, 50);
        
        // Limit mints per wallet based on trust
        uint256 maxMints = score >= 80 ? 10 : 3;
        if (mintCount[msg.sender] >= maxMints) {
            revert MintLimitReached(mintCount[msg.sender], maxMints);
        }
        
        // Mark content as used (CEI pattern)
        usedContentHashes[contentHash] = true;
        
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = tokenURI;
        mintCount[msg.sender]++;
        
        uint8 currentShard = uint8(block.number % 24); // 24 active shards
        emit NFTMinted(msg.sender, tokenId, tokenURI, currentShard);
        return tokenId;
    }
    
    function estimateMintGas() external pure returns (uint256) {
        return 120000; // Base gas for mint operation
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(_baseTokenURI, _tokenURIs[tokenId]));
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public view override(TBC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`,
  "ConsensusMonitor.ts": `import { TBurnClient } from '@tburn/sdk';

/**
 * Enterprise Consensus Monitoring for TBURN Chain
 * Chain ID: 5800 | RPC: https://mainnet.tburn.io/rpc
 * Validators: 587 | Shards: 24 (scalable to 64) | TPS: 100,000
 * Block Time: 100ms | Address Format: tb1 (Bech32m)
 * Track 5-phase BFT: Propose → Prevote → Precommit → Commit → Finalize
 */

const client = new TBurnClient({ 
  apiKey: process.env.TBURN_API_KEY || 'YOUR_API_KEY',
  network: 'mainnet',
  rpcUrl: 'https://mainnet.tburn.io/rpc',
  chainId: 5800
});

// 1. Get current consensus state with error handling
async function getConsensusState() {
  try {
    const state = await client.consensus.getState();
    console.log(\`Chain ID: \${state.chainId}\`);           // 5800
    console.log(\`Height: #\${state.currentHeight}\`);
    console.log(\`Phase: \${state.phase}\`);                 // FINALIZE
    console.log(\`Block Time: \${state.avgRoundTimeMs}ms\`); // ~100ms target
    console.log(\`TPS: \${state.metrics.currentTPS}\`);      // up to 100,000
    console.log(\`Active Validators: 587\`);
    console.log(\`Active Shards: 24 (scalable to 64)\`);
    
    return state;
  } catch (error) {
    console.error('Failed to get consensus state:', error);
    throw error;
  }
}

// 2. Real-time consensus monitoring
function subscribeToConsensus() {
  client.ws.subscribeConsensus((round) => {
    console.log(\`Height \${round.height} | Phase: \${round.phase}\`);
    // tb1 format proposer address
    console.log(\`Proposer: \${round.proposer}\`); // tb1qval...
    console.log(\`Votes: \${round.votes.count}/587 validators (\${round.votes.power}%)\`);
    
    if (round.phase === 'FINALIZE') {
      console.log(\`Block finalized in \${round.totalTimeMs}ms\`);
    }
  });
}

// 3. Analyze consensus performance
async function analyzeConsensusPerformance() {
  const state = await client.consensus.getState();
  const { metrics } = state;
  
  return {
    chainId: 5800,
    validators: 587,
    activeShards: 24,
    successRate: (metrics.successfulRounds / metrics.totalRounds * 100).toFixed(2) + '%',
    avgBlockTime: metrics.avgRoundTimeMs + 'ms', // target: 100ms
    quorumRate: metrics.quorumAchievementRate + '%',
    maxTPS: 100000,
    latency: {
      p50: metrics.p50LatencyMs + 'ms',
      p95: metrics.p95LatencyMs + 'ms',
      p99: metrics.p99LatencyMs + 'ms'
    }
  };
}`,
  "ValidatorDashboard.ts": `import { TBurnClient } from '@tburn/sdk';

/**
 * Enterprise Validator Management for TBURN Chain
 * Validators: 587 active | Chain ID: 5800
 * RPC: https://mainnet.tburn.io/rpc
 * Address Format: tb1 (Bech32m) - NOT 0x format
 * Performance scoring, rewards, and real-time monitoring
 */

const client = new TBurnClient({ 
  apiKey: process.env.TBURN_API_KEY || 'YOUR_API_KEY',
  network: 'mainnet',
  rpcUrl: 'https://mainnet.tburn.io/rpc',
  chainId: 5800
});

// 1. List all validators with performance metrics
async function getValidatorList() {
  try {
    const { validators, summary } = await client.validators.list({
      status: 'active',
      sortBy: 'performance',
      limit: 587 // All active validators
    });
    
    console.log(\`Total Validators: \${summary.totalValidators}\`); // 587
    console.log(\`Active: \${summary.activeValidators}\`);
    console.log(\`Avg Uptime: \${summary.averageUptime}%\`);
    console.log(\`Active Shards: 24 (scalable to 64)\`);
    
    // Top 5 performers (tb1 format addresses)
    for (const v of validators.slice(0, 5)) {
      // Address format: tb1qval7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3s2
      console.log(\`\${v.moniker}: score=\${v.performanceScore}, tier=\${v.performanceTier}\`);
    }
    
    return validators;
  } catch (error) {
    console.error('Failed to fetch validators:', error);
    throw error;
  }
}

// 2. Get detailed validator rewards (tb1 address format)
async function getValidatorRewards(address: string) {
  // address format: tb1qval7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3s2
  const rewards = await client.validators.getRewards(address);
  
  console.log(\`Validator: \${address}\`); // tb1q...
  console.log(\`Total Rewards: \${rewards.totalRewards} TBURN\`);
  console.log(\`Breakdown:\`);
  console.log(\`  Proposer: \${rewards.rewardBreakdown.proposerRewards}\`);
  console.log(\`  Verifier: \${rewards.rewardBreakdown.verifierRewards}\`);
  console.log(\`  Gas Fees: \${rewards.rewardBreakdown.gasFeeRewards}\`);
  console.log(\`Bonuses:\`);
  console.log(\`  Streak: \${rewards.performanceBonuses.streakBonus}\`);
  console.log(\`  Consistency: \${rewards.performanceBonuses.consistencyBonus}\`);
  
  return rewards;
}

// 3. Monitor validator status changes
function subscribeToValidatorEvents() {
  client.ws.subscribeValidators((event) => {
    if (event.type === 'status.change') {
      // tb1 format address
      console.log(\`Validator \${event.address}: \${event.oldStatus} → \${event.newStatus}\`);
    } else if (event.type === 'reward.distributed') {
      console.log(\`Epoch \${event.epoch} reward: \${event.total} TBURN\`);
    } else if (event.type === 'slashing') {
      console.log(\`WARNING: Validator slashed for \${event.reason}\`);
    }
  });
}

// 4. Get network stats
async function getNetworkStats() {
  return {
    chainId: 5800,
    validators: 587,
    activeShards: 24,
    maxShards: 64,
    tps: 100000,
    blockTime: '100ms',
    addressFormat: 'tb1 (Bech32m)',
    rpc: 'https://mainnet.tburn.io/rpc'
  };
}`,
  "CrossShardBridge.ts": `import { TBurnClient } from '@tburn/sdk';

/**
 * Enterprise Cross-Shard Operations for TBURN Chain
 * Active Shards: 24 (scalable to 64) | Chain ID: 5800
 * RPC: https://mainnet.tburn.io/rpc
 * TPS: 100,000 capacity | Validators: 587
 * Address Format: tb1 (Bech32m) - NOT 0x format
 */

const client = new TBurnClient({ 
  apiKey: process.env.TBURN_API_KEY || 'YOUR_API_KEY',
  network: 'mainnet',
  rpcUrl: 'https://mainnet.tburn.io/rpc',
  chainId: 5800
});

// 1. Get shard overview
async function getShardStatus() {
  try {
    const shards = await client.shards.list();
    
    console.log(\`Active Shards: \${shards.totalShards}\`);     // 24
    console.log(\`Max Shards (scalable): 64\`);
    console.log(\`Global TPS: \${shards.globalTPS}\`);
    console.log(\`Max TPS Capacity: 100,000\`);
    console.log(\`Validators: 587\`);
    
    // Find high-load shards
    const highLoad = shards.shards.filter(s => s.load > 0.8);
    console.log(\`High-load shards: \${highLoad.length}\`);
    
    return shards;
  } catch (error) {
    console.error('Failed to get shard status:', error);
    throw error;
  }
}

// 2. Cross-shard token transfer (tb1 address format)
async function crossShardTransfer(
  to: string, // tb1q... format
  amount: string,
  targetShard: number // 0-23 for active shards
) {
  if (targetShard >= 24) {
    throw new Error(\`Invalid shard: \${targetShard}. Active shards: 0-23\`);
  }
  
  // Calculate optimal routing
  const route = await client.shards.getOptimalRoute(targetShard);
  console.log(\`Routing through: \${route.path.join(' → ')}\`);
  
  // Estimate gas before transfer
  const gasEstimate = await client.shards.estimateGas({
    to,
    amount,
    targetShard
  });
  console.log(\`Estimated gas: \${gasEstimate} EMB (Ember)\`);
  
  // Execute cross-shard transfer
  const tx = await client.shards.transfer({
    to, // tb1q... format recipient
    amount,
    targetShard,
    priority: 'high'
  });
  
  console.log(\`Message ID: \${tx.messageId}\`);
  console.log(\`Estimated latency: \${tx.estimatedLatencyMs}ms\`);
  
  return tx;
}

// 3. Track cross-shard message
async function trackMessage(messageId: string) {
  const message = await client.shards.trackMessage(messageId);
  
  console.log(\`Status: \${message.status}\`);
  console.log(\`Source: Shard \${message.sourceShard}\`); // 0-23
  console.log(\`Dest: Shard \${message.destShard}\`);     // 0-23
  console.log(\`Latency: \${message.latencyMs}ms\`);
  console.log(\`Retries: \${message.retries}\`);
  
  return message;
}

// 4. Monitor shard rebalancing
function subscribeToShardEvents() {
  client.ws.subscribeShards((event) => {
    if (event.type === 'load.update') {
      // Shard 0-23
      console.log(\`Shard \${event.shardId} load: \${event.load}%\`);
    } else if (event.type === 'rebalance.started') {
      console.log(\`Rebalancing: \${event.sourceShard} → \${event.destShard}\`);
    } else if (event.type === 'message.routed') {
      console.log(\`Message \${event.messageId} delivered in \${event.latencyMs}ms\`);
    }
  });
}

// 5. Get cross-shard transfer gas estimate
function estimateCrossShardGas(amount: number): number {
  // Base: 21000 + cross-shard overhead: 15000 + data
  return 21000 + 15000 + Math.ceil(amount / 1e18) * 68;
}`
};

function SyntaxHighlight({ code }: { code: string }) {
  const highlight = (text: string) => {
    return text
      .replace(/(pragma solidity|import|contract|constructor|function|external|payable|public|constant|require)/g, '<span style="color: #ff79c6">$1</span>')
      .replace(/(SecureVault|ITrustOracle|getScore|call)/g, '<span style="color: #50fa7b">$1</span>')
      .replace(/("@burnchain\/contracts\/ITrustOracle\.sol"|"Project trust too low"|"Transfer failed"|"")/g, '<span style="color: #f1fa8c">$1</span>')
      .replace(/(\/\/ .*)/g, '<span style="color: #6272a4">$1</span>')
      .replace(/(uint256|uint8|address|bool)/g, '<span style="color: #8be9fd">$1</span>');
  };

  return (
    <pre 
      className="text-sm overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: highlight(code) }}
    />
  );
}

export default function CodeExamples() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All Recipes");
  const [activeTab, setActiveTab] = useState("SecureVault.sol");
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = [
    t('publicPages.developers.examples.categories.allRecipes'),
    t('publicPages.developers.examples.categories.smartContracts'),
    t('publicPages.developers.examples.categories.defi'),
    t('publicPages.developers.examples.categories.nfts'),
    t('publicPages.developers.examples.categories.wallets'),
    "Enterprise"
  ];

  const commonRecipes = [
    {
      title: t('publicPages.developers.examples.recipes.connectWallet.title'),
      description: t('publicPages.developers.examples.recipes.connectWallet.description'),
      icon: Wallet,
      color: "#00f0ff",
      category: t('publicPages.developers.examples.recipes.connectWallet.category'),
      tags: ["#react", "#web3"]
    },
    {
      title: t('publicPages.developers.examples.recipes.createToken.title'),
      description: t('publicPages.developers.examples.recipes.createToken.description'),
      icon: Coins,
      color: "#7000ff",
      category: t('publicPages.developers.examples.recipes.createToken.category'),
      tags: ["#token", "#smart-contract"]
    },
    {
      title: t('publicPages.developers.examples.recipes.aiOracle.title'),
      description: t('publicPages.developers.examples.recipes.aiOracle.description'),
      icon: Bot,
      color: "#00ff9d",
      category: t('publicPages.developers.examples.recipes.aiOracle.category'),
      tags: ["#python", "#api"]
    },
    {
      title: t('publicPages.developers.examples.recipes.nftMinting.title'),
      description: t('publicPages.developers.examples.recipes.nftMinting.description'),
      icon: Images,
      color: "#ffd700",
      category: t('publicPages.developers.examples.recipes.nftMinting.category'),
      tags: ["#nft", "#mint"]
    },
    {
      title: t('publicPages.developers.examples.recipes.flashLoan.title'),
      description: t('publicPages.developers.examples.recipes.flashLoan.description'),
      icon: ArrowLeftRight,
      color: "#ff0055",
      category: t('publicPages.developers.examples.recipes.flashLoan.category'),
      tags: ["#defi", "#arbitrage"]
    },
    {
      title: t('publicPages.developers.examples.recipes.indexerSetup.title'),
      description: t('publicPages.developers.examples.recipes.indexerSetup.description'),
      icon: Database,
      color: "#3b82f6",
      category: t('publicPages.developers.examples.recipes.indexerSetup.category'),
      tags: ["#graph", "#data"]
    },
    {
      title: "Consensus Monitor",
      description: "Real-time 5-phase BFT consensus monitoring with Chain ID 5800, 587 validators, 100ms block time",
      icon: Shield,
      color: "#7000ff",
      category: "Enterprise",
      tags: ["#consensus", "#bft", "#monitoring"]
    },
    {
      title: "Validator Dashboard",
      description: "Monitor 587 validators with performance scoring, rewards tracking, and slashing alerts",
      icon: Server,
      color: "#00ff9d",
      category: "Enterprise",
      tags: ["#validator", "#rewards", "#performance"]
    },
    {
      title: "Cross-Shard Bridge",
      description: "24 active shards (scalable to 64) with 100K TPS, priority queue routing, and message tracking",
      icon: Network,
      color: "#ffd700",
      category: "Enterprise",
      tags: ["#sharding", "#crossshard", "#100ktps"]
    },
  ];

  const featuredRecipeChecks = [
    t('publicPages.developers.examples.featured.checks.trustScore'),
    t('publicPages.developers.examples.featured.checks.revert'),
    t('publicPages.developers.examples.featured.checks.gasOptimized'),
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll(".spotlight-card");
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff9d]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00ff9d] mb-6">
            <Utensils className="w-4 h-4" /> {t('publicPages.developers.examples.tag')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.developers.examples.title').split(' ')[0]}{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              {t('publicPages.developers.examples.title').split(' ').slice(1).join(' ') || 'Examples'}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
            {t('publicPages.developers.examples.subtitle')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button 
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition ${
                  activeCategory === category
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30"
                }`}
                data-testid={`filter-${index}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipe Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <Flame className="w-6 h-6 text-[#7000ff]" /> {t('publicPages.developers.examples.featured.title')}
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('publicPages.developers.examples.featured.description')}
                </p>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm mt-4">
                  {featuredRecipeChecks.map((check, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-[#00ff9d]" /> {check}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-gray-100 dark:bg-white/5 rounded p-3 border border-gray-300 dark:border-white/10 text-center flex-1">
                  <div className="text-xs text-gray-500 uppercase">{t('publicPages.developers.examples.featured.difficulty')}</div>
                  <div className="text-[#00ff9d] font-bold">{t('publicPages.developers.examples.featured.intermediate')}</div>
                </div>
                <div className="bg-gray-100 dark:bg-white/5 rounded p-3 border border-gray-300 dark:border-white/10 text-center flex-1">
                  <div className="text-xs text-gray-500 uppercase">{t('publicPages.developers.examples.featured.time')}</div>
                  <div className="text-gray-900 dark:text-white font-bold">{t('publicPages.developers.examples.featured.tenMins')}</div>
                </div>
              </div>
            </div>

            {/* IDE Window */}
            <div 
              className="rounded-lg overflow-hidden shadow-2xl"
              style={{ 
                background: "#0d0d12",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 25px 50px -12px rgba(112, 0, 255, 0.2)"
              }}
              data-testid="ide-window"
            >
              <div 
                className="px-4 py-2 flex items-center justify-between flex-wrap gap-2"
                style={{ 
                  background: "#1a1a20",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex gap-3 text-xs font-mono overflow-x-auto">
                  {Object.keys(codeExamples).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={activeTab === tab 
                        ? "text-[#00f0ff] border-b border-[#00f0ff] pb-1 whitespace-nowrap" 
                        : "text-gray-500 hover:text-white transition whitespace-nowrap"
                      }
                      data-testid={`tab-${tab.replace('.', '-')}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 font-mono text-gray-300 overflow-x-auto max-h-96">
                <SyntaxHighlight code={codeExamples[activeTab as keyof typeof codeExamples] || codeExamples["SecureVault.sol"]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Recipes Section */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('publicPages.developers.examples.commonRecipes')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonRecipes.map((recipe, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group cursor-pointer"
                data-testid={`recipe-card-${index}`}
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div 
                    className="p-2 rounded"
                    style={{ backgroundColor: `${recipe.color}10`, color: recipe.color }}
                  >
                    <recipe.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {recipe.category}
                  </span>
                </div>
                <h3 
                  className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors"
                  style={{ "--hover-color": recipe.color } as React.CSSProperties}
                >
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{recipe.description}</p>
                <div className="flex gap-2 text-xs font-mono text-gray-500">
                  {recipe.tags.map((tag, tagIndex) => (
                    <span key={tagIndex}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div 
            className="rounded-2xl p-1"
            style={{ 
              background: "linear-gradient(to right, rgba(112, 0, 255, 0.2), rgba(0, 240, 255, 0.2))",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <div 
              className="rounded-xl p-10 text-center"
              style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(24px)" }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">{t('publicPages.developers.examples.cta.title')}</h2>
              <p className="text-gray-400 mb-8">
                {t('publicPages.developers.examples.cta.description')}
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all hover:-translate-y-0.5"
                  style={{ 
                    background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                    boxShadow: "0 0 15px rgba(112, 0, 255, 0.3)"
                  }}
                  data-testid="button-submit-pr"
                >
                  <SiGithub className="w-5 h-5" /> {t('publicPages.developers.examples.cta.submitPr')}
                </a>
                <Link href="/community/hub">
                  <button 
                    className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                    data-testid="button-request-guide"
                  >
                    {t('publicPages.developers.examples.cta.requestGuide')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
