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

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TBurn Basic Token
 * @notice ERC20 token with TBurn Chain integration
 */
contract TBurnToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, initialSupply);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
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

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TBurnStaking is ReentrancyGuard {
    IERC20 public stakingToken;
    uint256 public rewardRate = 100; // 1% per epoch
    
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastStakeTime;
    
    constructor(address _token) {
        stakingToken = IERC20(_token);
    }
    
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        lastStakeTime[msg.sender] = block.timestamp;
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - lastStakeTime[user];
        return (stakedBalance[user] * rewardRate * timeStaked) / (365 days * 10000);
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

/**
 * @title TBC-20 Token Standard
 * @notice TBURN Chain native token standard with quantum-resistant signatures
 * @dev Chain ID 5800 optimized with cross-shard transfer support
 */
contract MyTBC20Token is TBC20, TBC20Burnable, QuantumResistant {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Cross-shard transfer optimization for 64 shards
    mapping(uint8 => uint256) public shardBalances;
    
    constructor() TBC20("My TBC20 Token", "MTK") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @notice Cross-shard optimized transfer
     * @param to Recipient address
     * @param amount Transfer amount
     * @param targetShard Destination shard (0-63)
     */
    function crossShardTransfer(
        address to,
        uint256 amount,
        uint8 targetShard
    ) external returns (bytes32 messageId) {
        require(targetShard < 64, "Invalid shard");
        _burn(msg.sender, amount);
        
        // Emit cross-shard message for router
        messageId = keccak256(abi.encodePacked(
            block.chainid, // 5800
            msg.sender,
            to,
            amount,
            targetShard,
            block.timestamp
        ));
        
        emit CrossShardTransfer(msg.sender, to, amount, targetShard, messageId);
        return messageId;
    }
    
    event CrossShardTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint8 targetShard,
        bytes32 messageId
    );
}`;

const tbc721Code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC721/TBC721.sol";
import "@tburn/contracts/token/TBC721/extensions/TBC721URIStorage.sol";
import "@tburn/contracts/security/QuantumResistant.sol";
import "@tburn/contracts/ai/ITrustScore.sol";

/**
 * @title TBC-721 NFT Standard
 * @notice TBURN Chain native NFT with AI trust verification
 * @dev Optimized for 210K TPS with parallel minting support
 */
contract MyTBC721NFT is TBC721, TBC721URIStorage, QuantumResistant {
    ITrustScore public trustOracle;
    uint256 public minMintTrustScore = 50;
    uint256 private _tokenIdCounter;
    
    struct NFTMetadata {
        uint256 mintedAt;
        uint8 originShard;
        uint256 trustScoreAtMint;
        bool crossShardVerified;
    }
    
    mapping(uint256 => NFTMetadata) public tokenMetadata;
    
    constructor(address _trustOracle) TBC721("My TBC721 NFT", "MNFT") {
        trustOracle = ITrustScore(_trustOracle);
    }
    
    /**
     * @notice Mint NFT with trust score verification
     * @param to Recipient address
     * @param uri Token metadata URI
     */
    function safeMint(address to, string memory uri) external returns (uint256) {
        uint256 senderTrust = trustOracle.getScore(msg.sender);
        require(senderTrust >= minMintTrustScore, "Trust score too low");
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        tokenMetadata[tokenId] = NFTMetadata({
            mintedAt: block.timestamp,
            originShard: uint8(block.number % 64),
            trustScoreAtMint: senderTrust,
            crossShardVerified: false
        });
        
        return tokenId;
    }
    
    /**
     * @notice Cross-shard NFT transfer with atomic verification
     */
    function crossShardTransfer(
        address to,
        uint256 tokenId,
        uint8 targetShard
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(targetShard < 64, "Invalid shard");
        
        tokenMetadata[tokenId].crossShardVerified = true;
        _transfer(msg.sender, to, tokenId);
        
        emit CrossShardNFTTransfer(msg.sender, to, tokenId, targetShard);
    }
    
    event CrossShardNFTTransfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        uint8 targetShard
    );
}`;

const tbc1155Code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tburn/contracts/token/TBC1155/TBC1155.sol";
import "@tburn/contracts/token/TBC1155/extensions/TBC1155Supply.sol";
import "@tburn/contracts/security/QuantumResistant.sol";

/**
 * @title TBC-1155 Multi-Token Standard
 * @notice TBURN Chain native multi-token with batch operations
 * @dev Optimized for high-throughput gaming and DeFi applications
 */
contract MyTBC1155Token is TBC1155, TBC1155Supply, QuantumResistant {
    // Token type constants
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant DIAMOND = 2;
    
    // Cross-shard batch optimization
    uint256 public constant MAX_BATCH_SIZE = 1000;
    
    mapping(uint256 => string) private _tokenURIs;
    
    constructor() TBC1155("https://api.tburn.io/metadata/") {}
    
    /**
     * @notice High-throughput batch mint for gaming
     * @param to Recipient address
     * @param ids Token IDs array
     * @param amounts Amounts array
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external {
        require(ids.length <= MAX_BATCH_SIZE, "Batch too large");
        _mintBatch(to, ids, amounts, "");
    }
    
    /**
     * @notice Cross-shard batch transfer with parallel execution
     * @param to Recipient address
     * @param ids Token IDs to transfer
     * @param amounts Amounts to transfer
     * @param targetShard Destination shard
     */
    function crossShardBatchTransfer(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        uint8 targetShard
    ) external returns (bytes32 batchId) {
        require(ids.length == amounts.length, "Length mismatch");
        require(targetShard < 64, "Invalid shard");
        
        _safeBatchTransferFrom(msg.sender, to, ids, amounts, "");
        
        batchId = keccak256(abi.encodePacked(
            block.chainid,
            msg.sender,
            to,
            ids,
            amounts,
            targetShard,
            block.timestamp
        ));
        
        emit CrossShardBatchTransfer(msg.sender, to, ids, amounts, targetShard, batchId);
        return batchId;
    }
    
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        if (bytes(tokenURI).length > 0) return tokenURI;
        return super.uri(tokenId);
    }
    
    event CrossShardBatchTransfer(
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] amounts,
        uint8 targetShard,
        bytes32 batchId
    );
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
