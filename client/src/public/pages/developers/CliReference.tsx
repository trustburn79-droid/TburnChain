import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Terminal, Download, Settings, Key, Play, 
  Book, Server, ArrowRight, HelpCircle, AlertTriangle,
  Coins, TrendingUp, Link2, FileCode, Zap
} from "lucide-react";
import { SiNpm } from "react-icons/si";

export default function CliReference() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("Project");
  const [activeTab, setActiveTab] = useState<"commands" | "scripting" | "errors">("commands");

  const installMethods = [
    { name: "npm", command: "npm install -g @tburn/cli", icon: SiNpm, color: "#cb3837" },
    { name: "yarn", command: "yarn global add @tburn/cli", icon: null, label: "yarn", color: "#2188b6" },
    { name: "pnpm", command: "pnpm add -g @tburn/cli", icon: null, label: "pnpm", color: "#f9ad00" },
  ];

  const globalOptions = [
    { flag: "--network, -n", desc: t('publicPages.developers.cli.globalOptions.network') },
    { flag: "--config, -c", desc: t('publicPages.developers.cli.globalOptions.config') },
    { flag: "--verbose, -v", desc: t('publicPages.developers.cli.globalOptions.verbose') },
    { flag: "--json", desc: t('publicPages.developers.cli.globalOptions.json') },
    { flag: "--help, -h", desc: t('publicPages.developers.cli.globalOptions.help') },
  ];

  const envVars = [
    { name: "TBURN_API_KEY", required: true },
    { name: "TBURN_PRIVATE_KEY", required: false },
    { name: "TBURN_NETWORK", required: false },
  ];

  const commandCategories = [
    { name: t('publicPages.developers.cli.categories.project'), active: true, icon: FileCode },
    { name: t('publicPages.developers.cli.categories.contract'), icon: Terminal },
    { name: t('publicPages.developers.cli.categories.network'), icon: Server },
    { name: t('publicPages.developers.cli.categories.wallet'), icon: Key },
    { name: "Staking", icon: TrendingUp },
    { name: "Bridge", icon: Link2 },
    { name: "Token", icon: Coins },
    { name: "Consensus", icon: Zap },
    { name: "Validators", icon: Server },
    { name: "Sharding", icon: FileCode },
  ];

  const commands = [
    {
      cmd: "tburn init",
      desc: t('publicPages.developers.cli.commands.init.desc'),
      usage: "tburn init [project-name] [options]",
      options: [
        { flag: "--template, -t", desc: t('publicPages.developers.cli.commands.init.options.template'), default: "react" },
        { flag: "--typescript", desc: t('publicPages.developers.cli.commands.init.options.typescript'), default: "true" },
      ],
      examples: `# Create React dApp
tburn init my-dapp --template=react

# Create Hardhat smart contract project
tburn init my-contracts --template=hardhat`,
    },
    {
      cmd: "tburn dev",
      desc: t('publicPages.developers.cli.commands.dev.desc'),
      usage: "tburn dev [options]",
      options: [
        { flag: "--port, -p", desc: t('publicPages.developers.cli.commands.dev.options.port'), default: "3000" },
        { flag: "--open", desc: t('publicPages.developers.cli.commands.dev.options.open'), default: "false" },
      ],
    },
    {
      cmd: "tburn build",
      desc: t('publicPages.developers.cli.commands.build.desc'),
      usage: "tburn build [options]",
      options: [
        { flag: "--outdir, -o", desc: t('publicPages.developers.cli.commands.build.options.outdir'), default: "dist" },
        { flag: "--sourcemap", desc: t('publicPages.developers.cli.commands.build.options.sourcemap'), default: "false" },
      ],
    },
    {
      cmd: "tburn deploy",
      desc: t('publicPages.developers.cli.commands.deploy.desc'),
      usage: "tburn deploy [contract] [options]",
      options: [
        { flag: "--network, -n", desc: t('publicPages.developers.cli.commands.deploy.options.network'), default: "mainnet" },
        { flag: "--verify", desc: t('publicPages.developers.cli.commands.deploy.options.verify'), default: "true" },
        { flag: "--gas-price", desc: t('publicPages.developers.cli.commands.deploy.options.gasPrice'), default: "auto" },
      ],
      examples: `# Deploy to mainnet
tburn deploy MyContract --network=mainnet

# Deploy to testnet with verification
tburn deploy Token --network=testnet --verify`,
    },
    {
      cmd: "tburn wallet",
      desc: t('publicPages.developers.cli.commands.wallet.desc'),
      usage: "tburn wallet [action] [options]",
      options: [
        { flag: "create", desc: t('publicPages.developers.cli.commands.wallet.options.create'), default: "" },
        { flag: "import", desc: t('publicPages.developers.cli.commands.wallet.options.import'), default: "" },
        { flag: "balance", desc: t('publicPages.developers.cli.commands.wallet.options.balance'), default: "" },
      ],
    },
  ];

  const stakingCommands = [
    {
      cmd: "tburn stake delegate",
      desc: "Delegate TBURN tokens to a validator",
      usage: "tburn stake delegate <validator-address> <amount> [options]",
      options: [
        { flag: "--gas-limit", desc: "Maximum gas units to use", default: "200000" },
        { flag: "--memo", desc: "Transaction memo", default: "" },
        { flag: "--auto-compound", desc: "Enable auto-compounding of rewards", default: "false" },
      ],
      examples: `# Delegate 1000 TBURN to validator (Chain ID: 5800)
tburn stake delegate tb1qvalidator7x2e5d4c6b8a7... 1000 --network=mainnet

# Delegate with auto-compounding enabled
tburn stake delegate tb1qvalidator7x2e5d4c6b8a7... 500 --auto-compound=true

# View current delegations
tburn stake delegations --address=tb1qyouraddress7x2e5d4c6b8a7...`,
    },
    {
      cmd: "tburn stake undelegate",
      desc: "Undelegate tokens from a validator",
      usage: "tburn stake undelegate <validator-address> <amount> [options]",
      options: [
        { flag: "--gas-limit", desc: "Maximum gas units to use", default: "250000" },
        { flag: "--force", desc: "Skip confirmation prompt", default: "false" },
      ],
      examples: `# Undelegate 500 TBURN (21-day unbonding period)
tburn stake undelegate tb1qvalidator7x2e5d4c6b8a7... 500

# Force undelegate without confirmation
tburn stake undelegate tb1qvalidator7x2e5d4c6b8a7... 500 --force

# Check unbonding status
tburn stake unbonding --address=tb1qyouraddress7x2e5d4c6b8a7...`,
    },
    {
      cmd: "tburn stake rewards",
      desc: "View and claim staking rewards",
      usage: "tburn stake rewards [action] [options]",
      options: [
        { flag: "view", desc: "Display current rewards", default: "" },
        { flag: "claim", desc: "Claim all pending rewards", default: "" },
        { flag: "--validator", desc: "Filter by specific validator", default: "" },
      ],
      examples: `# View all pending rewards
tburn stake rewards view --address=tb1qyouraddress7x2e5d4c6b8a7...

# Claim rewards from specific validator
tburn stake rewards claim --validator=tb1qvalidator7x2e5d4c6b8a7...

# Auto-claim and restake all rewards
tburn stake rewards claim --restake --all`,
    },
    {
      cmd: "tburn stake validators",
      desc: "List and search validators",
      usage: "tburn stake validators [options]",
      options: [
        { flag: "--status", desc: "Filter by status (active/inactive/jailed)", default: "active" },
        { flag: "--sort", desc: "Sort by (stake/apr/uptime)", default: "stake" },
        { flag: "--limit", desc: "Number of results", default: "20" },
      ],
      examples: `# List top 10 validators by APR
tburn stake validators --sort=apr --limit=10

# Show only active validators with high uptime
tburn stake validators --status=active --sort=uptime`,
    },
  ];

  const bridgeCommands = [
    {
      cmd: "tburn bridge transfer",
      desc: "Bridge assets between chains",
      usage: "tburn bridge transfer <dest-chain> <token> <amount> [options]",
      options: [
        { flag: "--recipient", desc: "Destination address", default: "sender" },
        { flag: "--slippage", desc: "Maximum slippage tolerance (%)", default: "0.5" },
        { flag: "--fast", desc: "Use fast bridge (higher fee)", default: "false" },
      ],
      examples: `# Bridge 100 TBURN from TBURN Chain to Ethereum
tburn bridge transfer ethereum TBURN 100 --from=tb1qyouraddress7x2e5d4c6b8a7...

# Bridge to specific recipient with 1% slippage
tburn bridge transfer polygon USDC 500 --recipient=0x742d35Cc... --slippage=1

# Bridge with fast mode (higher fee, faster confirmation)
tburn bridge transfer arbitrum TBURN 250 --fast --network=mainnet`,
    },
    {
      cmd: "tburn bridge status",
      desc: "Check bridge transfer status",
      usage: "tburn bridge status <tx-hash> [options]",
      options: [
        { flag: "--watch", desc: "Watch for status changes", default: "false" },
        { flag: "--timeout", desc: "Watch timeout in seconds", default: "600" },
      ],
      examples: `# Check bridge transfer status (use tx hash)
tburn bridge status txhash_8a7b6c5d4e3f2a1b...

# Watch transfer until completion with timeout
tburn bridge status txhash_8a7b6c5d4e3f2a1b... --watch --timeout=1800

# Get detailed bridge history
tburn bridge history --address=tb1qyouraddress7x2e5d4c6b8a7... --limit=20`,
    },
    {
      cmd: "tburn bridge chains",
      desc: "List supported bridge destinations",
      usage: "tburn bridge chains [options]",
      options: [
        { flag: "--token", desc: "Filter by supported token", default: "" },
        { flag: "--active", desc: "Show only active bridges", default: "true" },
      ],
    },
    {
      cmd: "tburn bridge estimate",
      desc: "Estimate bridge fees and time",
      usage: "tburn bridge estimate <dest-chain> <token> <amount>",
      options: [
        { flag: "--fast", desc: "Include fast bridge estimate", default: "false" },
      ],
      examples: `# Get bridge fee estimate
tburn bridge estimate ethereum TBURN 1000

# Compare standard vs fast bridge
tburn bridge estimate polygon USDC 500 --fast`,
    },
  ];

  const tokenCommands = [
    {
      cmd: "tburn token deploy",
      desc: "Deploy a new TBC-20 token",
      usage: "tburn token deploy <name> <symbol> <supply> [options]",
      options: [
        { flag: "--decimals", desc: "Token decimals", default: "18" },
        { flag: "--mintable", desc: "Enable minting capability", default: "false" },
        { flag: "--burnable", desc: "Enable burning capability", default: "true" },
        { flag: "--pausable", desc: "Enable pause capability", default: "false" },
      ],
      examples: `# Deploy a standard token
tburn token deploy "My Token" MTK 1000000

# Deploy mintable token with custom decimals
tburn token deploy "Gold Token" GOLD 0 --decimals=8 --mintable=true`,
    },
    {
      cmd: "tburn token info",
      desc: "Get token information",
      usage: "tburn token info <token-address>",
      options: [
        { flag: "--holders", desc: "Include top holders", default: "false" },
        { flag: "--transfers", desc: "Include recent transfers", default: "false" },
      ],
    },
    {
      cmd: "tburn token transfer",
      desc: "Transfer tokens to an address",
      usage: "tburn token transfer <token> <recipient> <amount>",
      options: [
        { flag: "--gas-price", desc: "Gas price in gwei", default: "auto" },
        { flag: "--memo", desc: "Transaction memo", default: "" },
      ],
      examples: `# Transfer 100 tokens (tb1 Bech32m addresses)
tburn token transfer TBURN tb1qrecipient7x2e5d4c6b8a7... 100

# Transfer with custom gas and memo
tburn token transfer stTBURN tb1qrecipient7x2e5d4c6b8a7... 50 --gas-price=25 --memo="Payment"

# Batch transfer to multiple recipients
tburn token transfer TBURN --batch=recipients.csv --network=mainnet`,
    },
    {
      cmd: "tburn token approve",
      desc: "Approve spender allowance",
      usage: "tburn token approve <token> <spender> <amount>",
      options: [
        { flag: "--unlimited", desc: "Approve unlimited amount", default: "false" },
      ],
      examples: `# Approve DEX contract (tb1 address)
tburn token approve TBURN tb1qdexcontract7x2e5d4c6b8a7... 1000

# Approve unlimited for DeFi protocol
tburn token approve USDC tb1qprotocol7x2e5d4c6b8a7... --unlimited

# Revoke approval (set to 0)
tburn token approve TBURN tb1qdexcontract7x2e5d4c6b8a7... 0`,
    },
  ];

  const consensusCommands = [
    {
      cmd: "tburn consensus status",
      desc: "Get current BFT consensus state (Chain ID 5800, 5-phase protocol)",
      usage: "tburn consensus status [options]",
      options: [
        { flag: "--metrics", desc: "Include detailed performance metrics", default: "false" },
        { flag: "--validators", desc: "Include current validator set", default: "false" },
      ],
      examples: `# Get current consensus state
tburn consensus status

# Get detailed metrics with validator info
tburn consensus status --metrics --validators

# Output:
# Chain ID: 5800
# Height: 25,847,392
# Phase: FINALIZE
# TPS: 185,420 / 210,000 (peak)
# Block Time: 98ms (target: 100ms)`,
    },
    {
      cmd: "tburn consensus round",
      desc: "Get detailed information about a specific consensus round",
      usage: "tburn consensus round <height> [options]",
      options: [
        { flag: "--votes", desc: "Include voting details", default: "false" },
        { flag: "--timings", desc: "Include phase timing breakdown", default: "true" },
      ],
      examples: `# Get round info for block 25847392
tburn consensus round 25847392

# Include voting details
tburn consensus round 25847392 --votes

# Output:
# Round 0 @ Height 25847392
# Proposer: TBURN Genesis Validator #1
# Phases: propose(12ms) → prevote(18ms) → precommit(22ms) → commit(25ms) → finalize(18ms)
# Total: 95ms`,
    },
    {
      cmd: "tburn consensus watch",
      desc: "Watch consensus rounds in real-time",
      usage: "tburn consensus watch [options]",
      options: [
        { flag: "--blocks", desc: "Number of blocks to watch", default: "∞" },
        { flag: "--phase", desc: "Filter by specific phase", default: "all" },
      ],
      examples: `# Watch consensus in real-time
tburn consensus watch

# Watch 100 blocks
tburn consensus watch --blocks=100

# Watch only FINALIZE phases
tburn consensus watch --phase=FINALIZE`,
    },
  ];

  const validatorsCommands = [
    {
      cmd: "tburn validators list",
      desc: "List all 125 genesis validators with performance metrics",
      usage: "tburn validators list [options]",
      options: [
        { flag: "--status", desc: "Filter by status (active/inactive/jailed)", default: "all" },
        { flag: "--sort", desc: "Sort by (stake/uptime/performance/apr)", default: "stake" },
        { flag: "--limit", desc: "Number of results", default: "50" },
        { flag: "--tier", desc: "Filter by performance tier", default: "all" },
      ],
      examples: `# List top 10 validators by performance
tburn validators list --sort=performance --limit=10

# List platinum tier validators
tburn validators list --tier=platinum

# List jailed validators
tburn validators list --status=jailed`,
    },
    {
      cmd: "tburn validators info",
      desc: "Get detailed information about a specific validator",
      usage: "tburn validators info <address> [options]",
      options: [
        { flag: "--rewards", desc: "Include reward history", default: "false" },
        { flag: "--delegators", desc: "Include delegator list", default: "false" },
        { flag: "--blocks", desc: "Include proposed blocks", default: "false" },
      ],
      examples: `# Get validator details
tburn validators info 0x742d35Cc6634C0532...

# Include reward breakdown
tburn validators info 0x742d35Cc6634C0532... --rewards

# Output:
# TBURN Genesis Validator #1
# Status: Active | Tier: Platinum
# Uptime: 99.98% | Missed: 3 blocks
# Stake: 1,000,000 TBURN | Delegators: 1,847
# APR: 12.5% | Commission: 5%`,
    },
    {
      cmd: "tburn validators rewards",
      desc: "View validator reward distribution breakdown",
      usage: "tburn validators rewards <address> [options]",
      options: [
        { flag: "--epoch", desc: "Specific epoch to query", default: "current" },
        { flag: "--history", desc: "Number of past epochs", default: "10" },
      ],
      examples: `# View current epoch rewards
tburn validators rewards 0x742d35Cc6634C0532...

# View last 30 epochs
tburn validators rewards 0x742d35Cc6634C0532... --history=30

# Output:
# Epoch 2584 Rewards:
# Proposer: 8,423,196 TBURN
# Verifier: 4,212,098 TBURN
# Gas Fees: 3,212,098 TBURN
# Bonuses: Streak(+150k) Consistency(+75k) Uptime(+50k)`,
    },
  ];

  const shardingCommands = [
    {
      cmd: "tburn shards list",
      desc: "List shards with load and TPS metrics (24 active, max 64)",
      usage: "tburn shards list [options]",
      options: [
        { flag: "--sort", desc: "Sort by (id/load/tps)", default: "id" },
        { flag: "--status", desc: "Filter by status (active/standby/all)", default: "active" },
        { flag: "--threshold", desc: "Show shards above load threshold", default: "" },
      ],
      examples: `# List all active shards (Chain ID: 5800)
tburn shards list --network=mainnet

# List overloaded shards (>80% load)
tburn shards list --threshold=80

# Sort by TPS descending
tburn shards list --sort=tps

# Output:
# Active: 24 shards | Max: 64 | Global TPS: 154,908 / 210,000
# Shard 0: TPS=6,454 Load=72% Validators=25
# Shard 1: TPS=6,512 Load=75% Validators=24`,
    },
    {
      cmd: "tburn shards info",
      desc: "Get detailed information about a specific shard",
      usage: "tburn shards info <shard-id> [options]",
      options: [
        { flag: "--validators", desc: "Include assigned validators", default: "false" },
        { flag: "--messages", desc: "Include cross-shard stats", default: "true" },
      ],
      examples: `# Get shard 12 details
tburn shards info 12

# Include validator assignments
tburn shards info 12 --validators

# Output:
# Shard #12
# Status: Active | Load: 72%
# TPS: 2,897 | Block Time: 98ms
# Cross-shard: IN=847 OUT=923 PENDING=12
# Validators: 8 assigned`,
    },
    {
      cmd: "tburn shards messages",
      desc: "Track cross-shard message routing",
      usage: "tburn shards messages [options]",
      options: [
        { flag: "--source", desc: "Filter by source shard", default: "" },
        { flag: "--dest", desc: "Filter by destination shard", default: "" },
        { flag: "--status", desc: "Filter by status (pending/delivered/failed)", default: "all" },
        { flag: "--limit", desc: "Number of results", default: "50" },
      ],
      examples: `# View cross-shard messages from shard 12 to 45
tburn shards messages --source=12 --dest=45

# View pending messages
tburn shards messages --status=pending

# Track specific message
tburn shards message track csm_8a7b6c5d4e3f2a1b`,
    },
    {
      cmd: "tburn shards rebalance",
      desc: "View shard rebalancing status and history",
      usage: "tburn shards rebalance [options]",
      options: [
        { flag: "--history", desc: "Number of past rebalances", default: "10" },
        { flag: "--watch", desc: "Watch for rebalancing events", default: "false" },
      ],
      examples: `# Check rebalance status
tburn shards rebalance

# Watch rebalancing in real-time
tburn shards rebalance --watch

# Output:
# Rebalancing: Enabled | Threshold: 85%
# Last: 2025-01-05 14:30:00 UTC
# Moved: Shard 23 → 45 (15% load reduction)`,
    },
  ];

  const scriptingExamples = [
    {
      title: "Batch Deploy Contracts",
      description: "Deploy multiple contracts in sequence with error handling",
      code: `#!/bin/bash
# batch-deploy.sh - Deploy multiple contracts

CONTRACTS=("Token" "Staking" "Governance")
NETWORK="testnet"

for contract in "\${CONTRACTS[@]}"; do
  echo "Deploying $contract..."
  
  OUTPUT=$(tburn deploy "$contract" --network=$NETWORK --json 2>&1)
  
  if [ $? -eq 0 ]; then
    ADDRESS=$(echo $OUTPUT | jq -r '.address')
    echo "✓ $contract deployed at: $ADDRESS"
    echo "$contract=$ADDRESS" >> deployed-contracts.env
  else
    echo "✗ Failed to deploy $contract"
    echo $OUTPUT
    exit 1
  fi
done

echo "All contracts deployed successfully!"`,
    },
    {
      title: "Auto-Claim Staking Rewards",
      description: "Scheduled script to claim and re-stake rewards",
      code: `#!/bin/bash
# auto-compound.sh - Claim and restake rewards

VALIDATOR="tburn1validator..."
MIN_REWARD=10  # Minimum TBURN to claim

# Check pending rewards
REWARDS=$(tburn stake rewards view --json | jq -r '.total')

if (( $(echo "$REWARDS > $MIN_REWARD" | bc -l) )); then
  echo "Claiming $REWARDS TBURN..."
  
  # Claim rewards
  tburn stake rewards claim --json
  
  # Re-delegate to validator
  tburn stake delegate $VALIDATOR $REWARDS --json
  
  echo "✓ Compounded $REWARDS TBURN"
else
  echo "Rewards ($REWARDS) below threshold ($MIN_REWARD)"
fi`,
    },
    {
      title: "Bridge Health Monitor",
      description: "Monitor bridge status and send alerts",
      code: `#!/bin/bash
# bridge-monitor.sh - Monitor pending bridge transfers

WEBHOOK_URL="https://hooks.slack.com/..."

# Get all pending transfers
PENDING=$(tburn bridge list --status=pending --json)
COUNT=$(echo $PENDING | jq length)

if [ $COUNT -gt 0 ]; then
  echo "Found $COUNT pending transfers"
  
  for row in $(echo $PENDING | jq -r '.[] | @base64'); do
    _jq() { echo \${row} | base64 -d | jq -r \${1}; }
    
    TX_HASH=$(_jq '.txHash')
    CREATED=$(_jq '.createdAt')
    AGE=$(($(date +%s) - $(date -d "$CREATED" +%s)))
    
    # Alert if transfer pending > 1 hour
    if [ $AGE -gt 3600 ]; then
      curl -X POST $WEBHOOK_URL \\
        -H "Content-Type: application/json" \\
        -d "{\\"text\\": \\"Bridge Alert: Transfer $TX_HASH pending for \${AGE}s\\"}"
    fi
  done
fi`,
    },
    {
      title: "Token Holder Analysis",
      description: "Analyze token distribution and export report",
      code: `#!/bin/bash
# token-analysis.sh - Generate holder distribution report

TOKEN_ADDRESS="0x..."
OUTPUT_FILE="holder-report.csv"

echo "address,balance,percentage" > $OUTPUT_FILE

# Get token info with holders
INFO=$(tburn token info $TOKEN_ADDRESS --holders --json)
TOTAL_SUPPLY=$(echo $INFO | jq -r '.totalSupply')

# Process holders
echo $INFO | jq -r '.holders[] | [.address, .balance] | @csv' | \\
while IFS=, read -r addr balance; do
  PCT=$(echo "scale=4; $balance / $TOTAL_SUPPLY * 100" | bc)
  echo "$addr,$balance,$PCT%" >> $OUTPUT_FILE
done

echo "Report saved to $OUTPUT_FILE"
HOLDER_COUNT=$(wc -l < $OUTPUT_FILE)
echo "Total holders: $((HOLDER_COUNT - 1))"`,
    },
  ];

  const errorCodes = [
    {
      code: "E001",
      name: "INSUFFICIENT_BALANCE",
      description: "Wallet balance is insufficient for the transaction",
      solution: "Ensure your wallet has enough TBURN for gas fees and the transaction amount. Use 'tburn wallet balance' to check.",
    },
    {
      code: "E002",
      name: "INVALID_NETWORK",
      description: "The specified network is not recognized",
      solution: "Use --network=mainnet or --network=testnet. Check available networks with 'tburn network list'.",
    },
    {
      code: "E003",
      name: "CONTRACT_NOT_VERIFIED",
      description: "Contract verification failed",
      solution: "Ensure source code matches deployed bytecode. Try 'tburn verify <contract> --force' to retry verification.",
    },
    {
      code: "E004",
      name: "GAS_ESTIMATION_FAILED",
      description: "Unable to estimate gas for the transaction",
      solution: "The transaction may revert. Check contract logic or use --gas-limit to set manually.",
    },
    {
      code: "E005",
      name: "VALIDATOR_NOT_FOUND",
      description: "The specified validator address is not active",
      solution: "Use 'tburn stake validators' to list active validators and verify the address.",
    },
    {
      code: "E006",
      name: "BRIDGE_UNAVAILABLE",
      description: "Bridge to the destination chain is temporarily unavailable",
      solution: "Check bridge status with 'tburn bridge chains'. The bridge may be under maintenance.",
    },
    {
      code: "E007",
      name: "NONCE_TOO_LOW",
      description: "Transaction nonce is lower than expected",
      solution: "A pending transaction may exist. Use 'tburn tx pending' to view or 'tburn tx cancel <nonce>' to cancel.",
    },
    {
      code: "E008",
      name: "RATE_LIMITED",
      description: "Too many requests to the API",
      solution: "Wait a few minutes and retry. Consider using --batch mode for bulk operations.",
    },
    {
      code: "E009",
      name: "INVALID_SIGNATURE",
      description: "Transaction signature verification failed",
      solution: "Your private key may be corrupted. Re-import your wallet with 'tburn wallet import'.",
    },
    {
      code: "E010",
      name: "UNBONDING_IN_PROGRESS",
      description: "Cannot delegate while tokens are unbonding",
      solution: "Wait for the unbonding period to complete. Check status with 'tburn stake unbonding'.",
    },
    {
      code: "E011",
      name: "SLIPPAGE_EXCEEDED",
      description: "Bridge transfer failed due to price movement",
      solution: "Increase slippage tolerance with --slippage=<percentage> or try a smaller amount.",
    },
    {
      code: "E012",
      name: "TOKEN_NOT_SUPPORTED",
      description: "The token is not supported on the destination chain",
      solution: "Use 'tburn bridge chains --token=<symbol>' to check supported tokens for each chain.",
    },
  ];

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Terminal className="w-3 h-3" /> {t('publicPages.developers.cli.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('publicPages.developers.cli.title').split(' ')[0]} <span className="text-gradient">{t('publicPages.developers.cli.title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-4">
            {t('publicPages.developers.cli.subtitle')}
          </p>
          <span className="text-sm font-mono text-[#7000ff]">{t('publicPages.developers.cli.currentVersion')}: 4.2.1</span>
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-12 px-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Download className="w-6 h-6 text-[#00ff9d]" /> {t('publicPages.developers.cli.installation.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {installMethods.map((method, index) => (
              <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-gray-900 dark:text-white">{method.name}</span>
                  {method.icon ? (
                    <method.icon className="w-6 h-6" style={{ color: method.color }} />
                  ) : (
                    <span className="font-mono font-bold" style={{ color: method.color }}>{method.label}</span>
                  )}
                </div>
                <div className="bg-gray-900 dark:bg-[#0d0d12] border border-gray-300 dark:border-white/10 rounded-lg p-3 font-mono text-xs text-gray-300 dark:text-gray-400">
                  {method.command}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{t('publicPages.developers.cli.installation.verify')}:</span>
            <code className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-900 dark:text-white">tburn --version</code>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Global Options */}
              <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" /> {t('publicPages.developers.cli.globalOptionsTitle')}
                </h3>
                <ul className="space-y-3 text-sm font-mono">
                  {globalOptions.map((opt, index) => (
                    <li key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-white/5 pb-2 last:border-0">
                      <span className="text-[#00f0ff]">{opt.flag}</span>
                      <span className="text-gray-500 text-xs">{opt.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Environment Variables */}
              <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 bg-gradient-to-br from-red-900/10 to-transparent">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#ff0055]" /> {t('publicPages.developers.cli.environmentTitle')}
                </h3>
                <div className="space-y-3 text-xs">
                  {envVars.map((env, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <code className="text-gray-900 dark:text-white">{env.name}</code>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                        env.required 
                          ? "text-[#ff0055] border-[#ff0055]/30 bg-[#ff0055]/10" 
                          : "text-[#00f0ff] border-[#00f0ff]/30 bg-[#00f0ff]/10"
                      }`}>
                        {env.required ? t('publicPages.developers.cli.required') : t('publicPages.developers.cli.optional')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Links */}
              <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.developers.cli.relatedDocs')}</h3>
                <div className="space-y-2">
                  <Link href="/developers" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.developerHub')}
                  </Link>
                  <Link href="/developers/docs" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.documentation')}
                  </Link>
                  <Link href="/developers/api" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.apiReference')}
                  </Link>
                  <Link href="/developers/quickstart" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.quickStart')}
                  </Link>
                  <Link href="/developers/installation" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.installationGuide')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Commands Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Main Tab Navigation */}
              <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-4 mb-6">
                <button
                  onClick={() => setActiveTab("commands")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                    activeTab === "commands"
                      ? "bg-[#7000ff]/10 text-[#7000ff] border border-[#7000ff]/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  data-testid="tab-commands"
                >
                  <Terminal className="w-4 h-4" /> Commands
                </button>
                <button
                  onClick={() => setActiveTab("scripting")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                    activeTab === "scripting"
                      ? "bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  data-testid="tab-scripting"
                >
                  <Zap className="w-4 h-4" /> Scripting Guide
                </button>
                <button
                  onClick={() => setActiveTab("errors")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                    activeTab === "errors"
                      ? "bg-[#ff0055]/10 text-[#ff0055] border border-[#ff0055]/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  data-testid="tab-errors"
                >
                  <AlertTriangle className="w-4 h-4" /> Error Codes
                </button>
              </div>

              {activeTab === "commands" && (
                <>
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {commandCategories.map((cat, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition ${
                          activeCategory === cat.name
                            ? "border-[#7000ff] text-[#7000ff]"
                            : "border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                        }`}
                        data-testid={`button-category-${cat.name.toLowerCase()}`}
                      >
                        <cat.icon className="w-3 h-3" />
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Command Cards - Render based on active category */}
                  {(() => {
                    let commandsToRender = commands;
                    if (activeCategory === "Staking") commandsToRender = stakingCommands;
                    else if (activeCategory === "Bridge") commandsToRender = bridgeCommands;
                    else if (activeCategory === "Token") commandsToRender = tokenCommands;
                    else if (activeCategory === "Consensus") commandsToRender = consensusCommands;
                    else if (activeCategory === "Validators") commandsToRender = validatorsCommands;
                    else if (activeCategory === "Sharding") commandsToRender = shardingCommands;
                    
                    return commandsToRender.map((command, index) => (
                      <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8">
                        <div className="flex items-center gap-4 mb-4">
                          <code className="text-xl font-bold text-[#7000ff] font-mono">{command.cmd}</code>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{command.desc}</span>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('publicPages.developers.cli.usage')}</h4>
                          <div className="bg-gray-900 dark:bg-[#0d0d12] border border-gray-300 dark:border-white/10 rounded-lg p-3 font-mono text-sm text-gray-300 dark:text-gray-400">
                            {command.usage}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('publicPages.developers.cli.options')}</h4>
                          <div className="space-y-2 text-sm">
                            {command.options.map((opt, oIndex) => (
                              <div key={oIndex} className="flex gap-4">
                                <code className="text-[#00f0ff] w-32 flex-shrink-0">{opt.flag}</code>
                                <span className="text-gray-600 dark:text-gray-400 flex-1">{opt.desc}</span>
                                {opt.default && (
                                  <span className="text-xs text-gray-500 dark:text-gray-600">{t('publicPages.developers.cli.default')}: {opt.default}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {command.examples && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('publicPages.developers.cli.examples')}</h4>
                            <pre className="bg-gray-900 dark:bg-[#0d0d12] border border-gray-300 dark:border-white/10 rounded-lg p-4 font-mono text-xs text-gray-300 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
                              {command.examples}
                            </pre>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </>
              )}

              {/* Scripting Guide Tab */}
              {activeTab === "scripting" && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-[#00ff9d]/10 to-transparent border border-[#00ff9d]/20 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#00ff9d]" /> Automate with Shell Scripts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Use the TBURN CLI with shell scripts to automate deployments, monitoring, and DeFi operations. 
                      All commands support --json output for easy parsing.
                    </p>
                  </div>

                  {scriptingExamples.map((example, index) => (
                    <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-gray-200 dark:border-white/10">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{example.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{example.description}</p>
                      </div>
                      <pre className="bg-gray-900 dark:bg-[#0d0d12] p-6 font-mono text-xs text-gray-300 dark:text-gray-400 overflow-x-auto">
                        {example.code}
                      </pre>
                    </div>
                  ))}

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pro Tips</h4>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">1.</span>
                        Use <code className="text-[#00f0ff]">--json</code> flag for machine-readable output
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">2.</span>
                        Store credentials in environment variables, never in scripts
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">3.</span>
                        Use <code className="text-[#00f0ff]">jq</code> for JSON parsing in bash scripts
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">4.</span>
                        Set up cron jobs for automated staking rewards and monitoring
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">5.</span>
                        Use <code className="text-[#00f0ff]">--network=testnet</code> when developing scripts
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Error Codes Tab */}
              {activeTab === "errors" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#ff0055]/10 to-transparent border border-[#ff0055]/20 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#ff0055]" /> Error Code Reference
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Common CLI errors and their solutions. Use <code className="text-[#00f0ff]">--verbose</code> for detailed error messages.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {errorCodes.map((error, index) => (
                      <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <span className="inline-block px-2 py-1 rounded bg-[#ff0055]/10 text-[#ff0055] font-mono text-sm font-bold">
                              {error.code}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{error.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{error.description}</p>
                            <div className="bg-[#00ff9d]/5 border border-[#00ff9d]/20 rounded-lg p-3">
                              <span className="text-xs font-bold text-[#00ff9d] uppercase">Solution</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error.solution}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Debugging Tips</h4>
                    <div className="space-y-4 text-sm">
                      <div className="bg-gray-900 dark:bg-[#0d0d12] rounded-lg p-4">
                        <code className="text-[#00f0ff]"># Enable verbose output</code>
                        <br />
                        <code className="text-gray-300">tburn deploy MyContract --verbose</code>
                      </div>
                      <div className="bg-gray-900 dark:bg-[#0d0d12] rounded-lg p-4">
                        <code className="text-[#00f0ff]"># Check CLI version and config</code>
                        <br />
                        <code className="text-gray-300">tburn doctor</code>
                      </div>
                      <div className="bg-gray-900 dark:bg-[#0d0d12] rounded-lg p-4">
                        <code className="text-[#00f0ff]"># View transaction details</code>
                        <br />
                        <code className="text-gray-300">tburn tx info 0x... --verbose</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#7000ff]/5 to-transparent border-t border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6" /> {t('publicPages.developers.cli.needHelp.title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/developers/docs"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#7000ff] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-sdk-docs"
            >
              <Book className="w-5 h-5 text-[#7000ff]" /> {t('publicPages.developers.cli.needHelp.sdkDocumentation')}
            </Link>
            <Link 
              href="/developers/api"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#00f0ff] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-api-ref"
            >
              <Server className="w-5 h-5 text-[#00f0ff]" /> {t('publicPages.developers.cli.needHelp.apiReference')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
