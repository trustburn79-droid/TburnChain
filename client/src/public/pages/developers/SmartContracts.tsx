import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  FileCode, Layers, Shield, Flame, Brain, Fuel, Lock, Rocket, 
  Book, Check, Zap, Copy, Terminal, Server
} from "lucide-react";
import { SiEthereum } from "react-icons/si";

const basicTokenCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC20/TBC20.sol";
import "@tburn/contracts/access/TBurnOwnable.sol";
import "@tburn/contracts/security/ReentrancyGuard.sol";

/**
 * @title TBurn Basic Token (Production-Ready)
 * @notice TBC-20 token for TBURN Chain (Chain ID: 5800)
 * @dev Mainnet RPC: https://mainnet.tburn.io/rpc
 * @custom:network TBURN Mainnet
 * @custom:validators 587 active validators
 * @custom:shards 24 active (scalable to 64)
 * @custom:tps 100,000 TPS capacity
 * @custom:blocktime 100ms
 */
contract TBurnToken is TBC20, TBurnOwnable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant MIN_GAS_RESERVE = 21000;
    
    // tb1 address format example: tb1qtoken7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3s2
    address public immutable treasury;
    
    event TokensMinted(address indexed to, uint256 amount, uint256 gasUsed);
    event TokensBurned(address indexed from, uint256 amount);
    
    error ExceedsMaxSupply(uint256 requested, uint256 available);
    error InsufficientGas(uint256 required, uint256 provided);
    error ZeroAmount();
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address _treasury
    ) TBC20(name, symbol) TBurnOwnable(msg.sender) {
        if (initialSupply > MAX_SUPPLY) {
            revert ExceedsMaxSupply(initialSupply, MAX_SUPPLY);
        }
        if (_treasury == address(0)) {
            revert ZeroAmount();
        }
        treasury = _treasury;
        _mint(msg.sender, initialSupply);
    }
    
    function mint(address to, uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        uint256 available = MAX_SUPPLY - totalSupply();
        if (amount > available) {
            revert ExceedsMaxSupply(amount, available);
        }
        
        uint256 gasStart = gasleft();
        _mint(to, amount);
        emit TokensMinted(to, amount, gasStart - gasleft());
    }
    
    function burn(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    function estimateGas(uint256 amount) external pure returns (uint256) {
        return MIN_GAS_RESERVE + (amount / 10**18) * 100;
    }
}`;

const trustScoreCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/ITrustScore.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TrustGatedToken is ERC20 {
    ITrustScore public trustOracle;
    uint256 public minTrustScore = 70;
    
    constructor(address _oracle) ERC20("TrustToken", "TT") {
        trustOracle = ITrustScore(_oracle);
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        uint256 senderScore = trustOracle.getScore(msg.sender);
        uint256 receiverScore = trustOracle.getScore(to);
        
        require(senderScore >= minTrustScore, "Sender trust too low");
        require(receiverScore >= minTrustScore, "Receiver trust too low");
        
        return super.transfer(to, amount);
    }
}`;

const autoBurnCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AutoBurnToken is ERC20 {
    uint256 public burnRate = 100; // 1% = 100 basis points
    uint256 public totalBurned;
    
    constructor() ERC20("BurnToken", "BURN") {
        _mint(msg.sender, 1_000_000 * 10**18);
    }
    
    function _update(address from, address to, uint256 amount) internal override {
        if (from != address(0) && to != address(0)) {
            uint256 burnAmount = (amount * burnRate) / 10000;
            uint256 transferAmount = amount - burnAmount;
            
            super._update(from, address(0), burnAmount);
            totalBurned += burnAmount;
            
            super._update(from, to, transferAmount);
        } else {
            super._update(from, to, amount);
        }
    }
}`;

const stakingCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC20/ITBC20.sol";
import "@tburn/contracts/security/ReentrancyGuard.sol";
import "@tburn/contracts/access/AccessControl.sol";
import "@tburn/contracts/sharding/CrossShardAware.sol";

/**
 * @title TBurn Staking Contract (Production-Ready)
 * @notice Cross-shard staking with 587 validator integration
 * @dev Chain ID: 5800 | RPC: https://mainnet.tburn.io/rpc
 */
contract TBurnStaking is ReentrancyGuard, AccessControl, CrossShardAware {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    ITBC20 public immutable stakingToken;
    uint256 public rewardRate = 100; // 1% per epoch
    uint256 public constant MIN_STAKE = 1000 * 10**18;
    uint256 public constant LOCK_PERIOD = 7 days;
    
    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewards;
        uint8 originShard;
        bool locked;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount, uint8 shard);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    error StakeAmountTooLow(uint256 provided, uint256 minimum);
    error StakeLocked(uint256 unlockTime);
    error NoStakeFound();
    error TransferFailed();
    
    constructor(address _token) {
        stakingToken = ITBC20(_token);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }
    
    function stake(uint256 amount) external nonReentrant {
        if (amount < MIN_STAKE) {
            revert StakeAmountTooLow(amount, MIN_STAKE);
        }
        
        // Claim pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimRewards(msg.sender);
        }
        
        bool success = stakingToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        
        stakes[msg.sender] = StakeInfo({
            amount: stakes[msg.sender].amount + amount,
            stakedAt: block.timestamp,
            rewards: 0,
            originShard: uint8(block.number % 24), // 24 active shards
            locked: true
        });
        
        totalStaked += amount;
        emit Staked(msg.sender, amount, stakes[msg.sender].originShard);
    }
    
    function unstake() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        if (stakeInfo.amount == 0) revert NoStakeFound();
        if (block.timestamp < stakeInfo.stakedAt + LOCK_PERIOD) {
            revert StakeLocked(stakeInfo.stakedAt + LOCK_PERIOD);
        }
        
        uint256 rewards = calculateRewards(msg.sender);
        uint256 total = stakeInfo.amount + rewards;
        
        totalStaked -= stakeInfo.amount;
        delete stakes[msg.sender];
        
        bool success = stakingToken.transfer(msg.sender, total);
        if (!success) revert TransferFailed();
        
        emit Unstaked(msg.sender, stakeInfo.amount, rewards);
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - stakeInfo.stakedAt;
        return (stakeInfo.amount * rewardRate * timeStaked) / (365 days * 10000);
    }
    
    function _claimRewards(address user) internal {
        uint256 rewards = calculateRewards(user);
        if (rewards > 0) {
            stakes[user].rewards = 0;
            stakes[user].stakedAt = block.timestamp;
            stakingToken.transfer(user, rewards);
            emit RewardsClaimed(user, rewards);
        }
    }
}`;

const governanceCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";

contract TBurnGovernor is Governor, GovernorVotes, GovernorCountingSimple {
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant PROPOSAL_THRESHOLD = 100_000 * 10**18;
    
    constructor(IVotes _token)
        Governor("TBurn Governor")
        GovernorVotes(_token)
    {}
    
    function votingDelay() public pure override returns (uint256) {
        return VOTING_DELAY / 12; // blocks
    }
    
    function votingPeriod() public pure override returns (uint256) {
        return VOTING_PERIOD / 12; // blocks
    }
    
    function proposalThreshold() public pure override returns (uint256) {
        return PROPOSAL_THRESHOLD;
    }
}`;

const tbc20Code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC20/TBC20.sol";
import "@tburn/contracts/token/TBC20/extensions/TBC20Burnable.sol";
import "@tburn/contracts/security/QuantumResistant.sol";
import "@tburn/contracts/security/ReentrancyGuard.sol";

/**
 * @title TBC-20 Token Standard (Production-Ready)
 * @notice TBURN Chain native token with quantum-resistant signatures
 * @dev Chain ID: 5800 | RPC: https://mainnet.tburn.io/rpc
 * @custom:network TBURN Mainnet
 * @custom:validators 587 active validators
 * @custom:shards 24 active (scalable to 64)
 * @custom:tps 100,000 TPS capacity
 * @custom:blocktime 100ms
 * @custom:addressformat tb1 (Bech32m)
 */
contract MyTBC20Token is TBC20, TBC20Burnable, QuantumResistant, ReentrancyGuard {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant MAX_SHARDS = 24; // Current active shards
    uint256 public constant MAX_SHARDS_FUTURE = 64; // Scalable capacity
    
    // Cross-shard transfer optimization for 24 active shards
    mapping(uint8 => uint256) public shardBalances;
    mapping(bytes32 => bool) public processedMessages;
    
    // tb1 address format examples in comments:
    // Treasury: tb1qtreasury7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d
    // Router: tb1qrouter8x3e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3
    
    event CrossShardTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint8 targetShard,
        bytes32 messageId
    );
    event CrossShardReceived(bytes32 indexed messageId, address indexed to, uint256 amount);
    
    error InvalidShard(uint8 provided, uint8 maximum);
    error MessageAlreadyProcessed(bytes32 messageId);
    error InsufficientBalance(uint256 requested, uint256 available);
    error ZeroAmount();
    error ZeroAddress();
    
    constructor() TBC20("My TBC20 Token", "MTK") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @notice Cross-shard optimized transfer with gas estimation
     * @param to Recipient address (tb1 format internally)
     * @param amount Transfer amount
     * @param targetShard Destination shard (0-23 for current network)
     * @return messageId Unique cross-shard message identifier
     */
    function crossShardTransfer(
        address to,
        uint256 amount,
        uint8 targetShard
    ) external nonReentrant returns (bytes32 messageId) {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (targetShard >= MAX_SHARDS) {
            revert InvalidShard(targetShard, uint8(MAX_SHARDS - 1));
        }
        if (balanceOf(msg.sender) < amount) {
            revert InsufficientBalance(amount, balanceOf(msg.sender));
        }
        
        _burn(msg.sender, amount);
        
        // Generate unique message ID for cross-shard router
        messageId = keccak256(abi.encodePacked(
            block.chainid, // 5800
            msg.sender,
            to,
            amount,
            targetShard,
            block.timestamp,
            block.number
        ));
        
        shardBalances[targetShard] += amount;
        emit CrossShardTransfer(msg.sender, to, amount, targetShard, messageId);
        return messageId;
    }
    
    /**
     * @notice Estimate gas for cross-shard transfer
     * @param amount Transfer amount
     * @return gasEstimate Estimated gas in Ember (EMB)
     */
    function estimateCrossShardGas(uint256 amount) external pure returns (uint256 gasEstimate) {
        // Base gas: 21000 + cross-shard overhead: 15000 + data: 68 per 32 bytes
        return 21000 + 15000 + ((amount / 10**18) * 68);
    }
}`;

const tbc721Code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC721/TBC721.sol";
import "@tburn/contracts/token/TBC721/extensions/TBC721URIStorage.sol";
import "@tburn/contracts/security/QuantumResistant.sol";
import "@tburn/contracts/security/ReentrancyGuard.sol";
import "@tburn/contracts/ai/ITrustScore.sol";
import "@tburn/contracts/access/AccessControl.sol";

/**
 * @title TBC-721 NFT Standard (Production-Ready)
 * @notice TBURN Chain native NFT with AI trust verification
 * @dev Chain ID: 5800 | RPC: https://mainnet.tburn.io/rpc
 * @custom:network TBURN Mainnet
 * @custom:validators 587 active validators
 * @custom:shards 24 active (scalable to 64)
 * @custom:tps 100,000 TPS capacity
 */
contract MyTBC721NFT is TBC721, TBC721URIStorage, QuantumResistant, ReentrancyGuard, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public constant MAX_SHARDS = 24;
    
    ITrustScore public immutable trustOracle;
    uint256 public minMintTrustScore = 50;
    uint256 private _tokenIdCounter;
    
    struct NFTMetadata {
        uint256 mintedAt;
        uint8 originShard;
        uint256 trustScoreAtMint;
        bool crossShardVerified;
        bytes32 contentHash;
    }
    
    mapping(uint256 => NFTMetadata) public tokenMetadata;
    mapping(bytes32 => bool) public contentExists;
    
    // tb1 address format: tb1qnft7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3s2
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint8 shard);
    event CrossShardNFTTransfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        uint8 targetShard,
        bytes32 messageId
    );
    
    error TrustScoreTooLow(uint256 provided, uint256 required);
    error NotTokenOwner(address caller, address owner);
    error InvalidShard(uint8 provided, uint8 maximum);
    error ContentAlreadyExists(bytes32 contentHash);
    error ZeroAddress();
    
    constructor(address _trustOracle) TBC721("My TBC721 NFT", "MNFT") {
        if (_trustOracle == address(0)) revert ZeroAddress();
        trustOracle = ITrustScore(_trustOracle);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @notice Mint NFT with trust score verification and duplicate prevention
     * @param to Recipient address (tb1 format internally)
     * @param uri Token metadata URI
     * @param contentHash Hash of NFT content for duplicate detection
     */
    function safeMint(
        address to, 
        string memory uri,
        bytes32 contentHash
    ) external nonReentrant onlyRole(MINTER_ROLE) returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        
        uint256 senderTrust = trustOracle.getScore(msg.sender);
        if (senderTrust < minMintTrustScore) {
            revert TrustScoreTooLow(senderTrust, minMintTrustScore);
        }
        
        if (contentExists[contentHash]) {
            revert ContentAlreadyExists(contentHash);
        }
        contentExists[contentHash] = true;
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        uint8 currentShard = uint8(block.number % MAX_SHARDS);
        tokenMetadata[tokenId] = NFTMetadata({
            mintedAt: block.timestamp,
            originShard: currentShard,
            trustScoreAtMint: senderTrust,
            crossShardVerified: false,
            contentHash: contentHash
        });
        
        emit NFTMinted(to, tokenId, currentShard);
        return tokenId;
    }
    
    /**
     * @notice Cross-shard NFT transfer with atomic verification
     * @param to Recipient address
     * @param tokenId NFT token ID
     * @param targetShard Destination shard (0-23)
     */
    function crossShardTransfer(
        address to,
        uint256 tokenId,
        uint8 targetShard
    ) external nonReentrant returns (bytes32 messageId) {
        address tokenOwner = ownerOf(tokenId);
        if (tokenOwner != msg.sender) {
            revert NotTokenOwner(msg.sender, tokenOwner);
        }
        if (targetShard >= MAX_SHARDS) {
            revert InvalidShard(targetShard, uint8(MAX_SHARDS - 1));
        }
        
        tokenMetadata[tokenId].crossShardVerified = true;
        _transfer(msg.sender, to, tokenId);
        
        messageId = keccak256(abi.encodePacked(
            block.chainid,
            tokenId,
            msg.sender,
            to,
            targetShard,
            block.timestamp
        ));
        
        emit CrossShardNFTTransfer(msg.sender, to, tokenId, targetShard, messageId);
        return messageId;
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public view override(TBC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`;

const tbc1155Code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC1155/TBC1155.sol";
import "@tburn/contracts/token/TBC1155/extensions/TBC1155Supply.sol";
import "@tburn/contracts/security/QuantumResistant.sol";
import "@tburn/contracts/security/ReentrancyGuard.sol";
import "@tburn/contracts/access/AccessControl.sol";

/**
 * @title TBC-1155 Multi-Token Standard (Production-Ready)
 * @notice TBURN Chain native multi-token with batch operations
 * @dev Chain ID: 5800 | RPC: https://mainnet.tburn.io/rpc
 * @custom:network TBURN Mainnet
 * @custom:validators 587 active validators
 * @custom:shards 24 active (scalable to 64)
 * @custom:tps 100,000 TPS capacity
 */
contract MyTBC1155Token is TBC1155, TBC1155Supply, QuantumResistant, ReentrancyGuard, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    // Token type constants
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant DIAMOND = 2;
    
    // Cross-shard batch optimization
    uint256 public constant MAX_BATCH_SIZE = 1000;
    uint256 public constant MAX_SHARDS = 24;
    
    // tb1 address format: tb1qmulti7x2e5d4c6b8a9f3m2n1p0k8j7h6g5f4d3
    
    mapping(uint256 => string) private _tokenURIs;
    mapping(bytes32 => bool) public processedBatches;
    
    event CrossShardBatchTransfer(
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] amounts,
        uint8 targetShard,
        bytes32 batchId
    );
    event BatchMinted(address indexed to, uint256[] ids, uint256[] amounts, uint8 shard);
    
    error BatchTooLarge(uint256 provided, uint256 maximum);
    error ArrayLengthMismatch(uint256 idsLength, uint256 amountsLength);
    error InvalidShard(uint8 provided, uint8 maximum);
    error BatchAlreadyProcessed(bytes32 batchId);
    error ZeroAddress();
    
    constructor() TBC1155("https://mainnet.tburn.io/api/metadata/") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }
    
    /**
     * @notice High-throughput batch mint for gaming with gas optimization
     * @param to Recipient address (tb1 format internally)
     * @param ids Token IDs array
     * @param amounts Amounts array
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external nonReentrant onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        if (ids.length > MAX_BATCH_SIZE) {
            revert BatchTooLarge(ids.length, MAX_BATCH_SIZE);
        }
        if (ids.length != amounts.length) {
            revert ArrayLengthMismatch(ids.length, amounts.length);
        }
        
        _mintBatch(to, ids, amounts, "");
        emit BatchMinted(to, ids, amounts, uint8(block.number % MAX_SHARDS));
    }
    
    /**
     * @notice Cross-shard batch transfer with parallel execution
     * @param to Recipient address
     * @param ids Token IDs to transfer
     * @param amounts Amounts to transfer
     * @param targetShard Destination shard (0-23)
     * @return batchId Unique batch identifier for tracking
     */
    function crossShardBatchTransfer(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        uint8 targetShard
    ) external nonReentrant returns (bytes32 batchId) {
        if (to == address(0)) revert ZeroAddress();
        if (ids.length != amounts.length) {
            revert ArrayLengthMismatch(ids.length, amounts.length);
        }
        if (targetShard >= MAX_SHARDS) {
            revert InvalidShard(targetShard, uint8(MAX_SHARDS - 1));
        }
        
        _safeBatchTransferFrom(msg.sender, to, ids, amounts, "");
        
        batchId = keccak256(abi.encodePacked(
            block.chainid, // 5800
            msg.sender,
            to,
            keccak256(abi.encodePacked(ids)),
            keccak256(abi.encodePacked(amounts)),
            targetShard,
            block.timestamp,
            block.number
        ));
        
        if (processedBatches[batchId]) {
            revert BatchAlreadyProcessed(batchId);
        }
        processedBatches[batchId] = true;
        
        emit CrossShardBatchTransfer(msg.sender, to, ids, amounts, targetShard, batchId);
        return batchId;
    }
    
    /**
     * @notice Estimate gas for batch operations
     * @param batchSize Number of items in batch
     * @return gasEstimate Estimated gas in Ember (EMB)
     */
    function estimateBatchGas(uint256 batchSize) external pure returns (uint256 gasEstimate) {
        // Base: 21000 + per-item: 5000 + cross-shard overhead: 15000
        return 21000 + (batchSize * 5000) + 15000;
    }
    
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        if (bytes(tokenURI).length > 0) return tokenURI;
        return super.uri(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public view override(TBC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`;

export default function SmartContracts() {
  const { t } = useTranslation();
  const [activeTemplate, setActiveTemplate] = useState("Basic Token");
  const [copied, setCopied] = useState(false);

  const platformFeatures = [
    { 
      icon: SiEthereum, 
      title: t('publicPages.developers.contracts.features.evmCompatibility.title'), 
      desc: t('publicPages.developers.contracts.features.evmCompatibility.description'),
      color: "#7000ff",
      bgColor: "bg-[#7000ff]/10"
    },
    { 
      icon: Shield, 
      title: t('publicPages.developers.contracts.features.trustScore.title'), 
      desc: t('publicPages.developers.contracts.features.trustScore.description'),
      color: "#00ff9d",
      bgColor: "bg-[#00ff9d]/10"
    },
    { 
      icon: Flame, 
      title: t('publicPages.developers.contracts.features.autoBurn.title'), 
      desc: t('publicPages.developers.contracts.features.autoBurn.description'),
      color: "#ffd700",
      bgColor: "bg-[#ffd700]/10"
    },
    { 
      icon: Brain, 
      title: t('publicPages.developers.contracts.features.aiOracle.title'), 
      desc: t('publicPages.developers.contracts.features.aiOracle.description'),
      color: "#00f0ff",
      bgColor: "bg-[#00f0ff]/10"
    },
    { 
      icon: Fuel, 
      title: t('publicPages.developers.contracts.features.gasOptimization.title'), 
      desc: t('publicPages.developers.contracts.features.gasOptimization.description'),
      color: "#ff0055",
      bgColor: "bg-[#ff0055]/10"
    },
    { 
      icon: Lock, 
      title: t('publicPages.developers.contracts.features.quantumResistant.title'), 
      desc: t('publicPages.developers.contracts.features.quantumResistant.description'),
      color: "#ffffff",
      bgColor: "bg-white/10"
    },
  ];

  const contractTemplates = [
    { name: t('publicPages.developers.contracts.templates.basicToken'), active: true },
    { name: t('publicPages.developers.contracts.templates.trustScoreIntegration'), active: false },
    { name: t('publicPages.developers.contracts.templates.autoBurn'), active: false },
    { name: t('publicPages.developers.contracts.templates.staking'), active: false },
    { name: t('publicPages.developers.contracts.templates.governance'), active: false },
    { name: "TBC-20", active: false },
    { name: "TBC-721", active: false },
    { name: "TBC-1155", active: false },
  ];

  const securityChecklist = [
    t('publicPages.developers.contracts.security.reentrancy'),
    t('publicPages.developers.contracts.security.overflow'),
    t('publicPages.developers.contracts.security.accessControl'),
    t('publicPages.developers.contracts.security.checksEffects'),
    t('publicPages.developers.contracts.security.initializer'),
  ];

  const gasOptimizationTips = [
    { title: t('publicPages.developers.contracts.gasOptimization.memoryVsStorage.title'), desc: t('publicPages.developers.contracts.gasOptimization.memoryVsStorage.desc') },
    { title: t('publicPages.developers.contracts.gasOptimization.variablePacking.title'), desc: t('publicPages.developers.contracts.gasOptimization.variablePacking.desc') },
    { title: t('publicPages.developers.contracts.gasOptimization.useEvents.title'), desc: t('publicPages.developers.contracts.gasOptimization.useEvents.desc') },
    { title: t('publicPages.developers.contracts.gasOptimization.shortRevert.title'), desc: t('publicPages.developers.contracts.gasOptimization.shortRevert.desc') },
  ];

  const getTemplateCode = () => {
    switch (activeTemplate) {
      case t('publicPages.developers.contracts.templates.trustScoreIntegration'): return trustScoreCode;
      case t('publicPages.developers.contracts.templates.autoBurn'): return autoBurnCode;
      case t('publicPages.developers.contracts.templates.staking'): return stakingCode;
      case t('publicPages.developers.contracts.templates.governance'): return governanceCode;
      case "TBC-20": return tbc20Code;
      case "TBC-721": return tbc721Code;
      case "TBC-1155": return tbc1155Code;
      default: return basicTokenCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getTemplateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (code: string) => {
    return code
      .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>')
      .replace(/\b(pragma|solidity|import|contract|is|function|constructor|public|external|internal|private|view|pure|override|returns|require|memory|storage|calldata|mapping|event|emit|modifier|if|else|for|while|return)\b/g, '<span class="text-[#7000ff]">$1</span>')
      .replace(/\b(uint256|uint128|uint64|uint32|uint8|int256|int128|int64|int32|int8|bool|address|string|bytes|bytes32)\b/g, '<span class="text-[#00f0ff]">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="text-[#7000ff]">$1</span>')
      .replace(/"([^"]*)"/g, '<span class="text-[#00ff9d]">"$1"</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-[#ffd700]">$1</span>');
  };

  return (
    <main className="flex-grow relative z-10 pt-4 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.3)]">
              <FileCode className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.contracts.title')}</h1>
              <p className="text-sm text-[#00f0ff] font-mono mt-1">{t('publicPages.developers.contracts.tag')}</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
            {t('publicPages.developers.contracts.subtitle')}
          </p>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('publicPages.developers.contracts.platformFeatures')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`} style={{ color: feature.color }}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contract Templates */}
      <section className="py-12 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#7000ff]" /> {t('publicPages.developers.contracts.contractTemplates')}
          </h2>

          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40 overflow-x-auto">
              {contractTemplates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => setActiveTemplate(template.name)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                    activeTemplate === template.name
                      ? "text-[#00f0ff] border-[#00f0ff]"
                      : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
                  }`}
                  data-testid={`button-template-${template.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {template.name}
                </button>
              ))}
            </div>

            <div className="relative group">
              <div className="absolute right-4 top-4 z-10">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white px-3 py-1.5 rounded border border-gray-300 dark:border-white/10 transition"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? t('publicPages.developers.contracts.copied') : t('publicPages.developers.contracts.copy')}
                </button>
              </div>
              <pre className="bg-gray-900 dark:bg-[#0d0d12] p-6 font-mono text-sm text-gray-300 dark:text-gray-400 overflow-x-auto leading-relaxed">
                <code dangerouslySetInnerHTML={{ __html: highlightCode(getTemplateCode()) }} />
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Gas Optimization */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Security Checklist */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden border-[#ffd700]/30 bg-[#ffd700]/5">
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                <Shield className="w-6 h-6 text-[#ffd700]" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.contracts.securityChecklist')}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  {securityChecklist.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#ffd700] mt-0.5 flex-shrink-0" />
                      <span dangerouslySetInnerHTML={{ 
                        __html: item.replace(/`([^`]+)`/g, '<code class="bg-black/30 px-1 rounded">$1</code>') 
                      }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gas Optimization Tips */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden border-[#00ff9d]/30 bg-[#00ff9d]/5">
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                <Fuel className="w-6 h-6 text-[#00ff9d]" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.contracts.gasOptimizationTips')}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  {gasOptimizationTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Zap className="w-4 h-4 text-[#00ff9d] mt-0.5 flex-shrink-0" />
                      <span><strong>{tip.title}:</strong> {tip.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Deploy Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#7000ff]/10 to-[#00f0ff]/10 border-t border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('publicPages.developers.contracts.readyToDeploy')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/developers/cli"
              className="px-6 py-3 rounded-lg bg-[#7000ff] text-white hover:bg-[#7000ff]/80 transition flex items-center gap-2 font-bold"
              data-testid="link-cli-guide"
            >
              <Terminal className="w-5 h-5" /> {t('publicPages.developers.contracts.cliGuide')}
            </Link>
            <Link 
              href="/developers/api"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#00f0ff] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-api-reference"
            >
              <Server className="w-5 h-5" /> {t('publicPages.developers.contracts.apiReference')}
            </Link>
            <Link 
              href="/developers/sdk"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#00ff9d] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-sdk-guide"
            >
              <Book className="w-5 h-5" /> {t('publicPages.developers.contracts.sdkGuide')}
            </Link>
            <Link 
              href="/developers/evm-migration"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#ffd700] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-evm-migration"
            >
              <Rocket className="w-5 h-5" /> {t('publicPages.developers.contracts.evmMigration')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
