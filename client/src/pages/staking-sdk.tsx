import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Code2, 
  Terminal,
  Book,
  Download,
  Copy,
  CheckCircle,
  ExternalLink,
  Braces,
  FileCode,
  GitBranch,
  Package,
  Rocket,
  Key,
  Shield,
  Coins,
  Wallet,
  Activity,
  Layers,
  Settings,
  Cpu,
  Globe,
  MessageCircle,
  Users,
  HelpCircle,
  Zap,
  ArrowRight,
  Play,
  RefreshCw,
  Search,
  ChevronRight,
  Star,
  Clock,
  Check,
  AlertCircle,
  BookOpen,
  Video,
  FileText,
  Send,
  Github,
  Twitter,
  Slack,
  Mail,
  Headphones,
  Bug,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Lock,
  Unlock,
  Database,
  Server,
  Network,
  Award,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TestBadge } from "@/components/TestBadge";

const codeExamples = {
  install: `# npm
npm install @tburn/staking-sdk

# yarn
yarn add @tburn/staking-sdk

# pnpm
pnpm add @tburn/staking-sdk`,

  initialize: `import { TBurnStakingSDK } from '@tburn/staking-sdk';

// Initialize the SDK with your configuration
const sdk = new TBurnStakingSDK({
  network: 'mainnet',       // or 'testnet'
  apiKey: 'your-api-key',   // Optional for read-only operations
  rpcUrl: 'https://mainnet.tburn.network',
});

// Connect wallet (browser)
await sdk.connect();

// Or use a private key (Node.js)
sdk.setPrivateKey(process.env.PRIVATE_KEY);`,

  getPools: `// Get all available staking pools
const pools = await sdk.staking.getPools();

console.log(pools);
/* Output:
[
  {
    id: 'pool-gold-001',
    name: 'Gold Tier Pool',
    tier: 'gold',
    apy: 15.5,
    totalStaked: '1000000000000000000000000',
    minStake: '50000000000000000000000',
    lockPeriod: 180,
    status: 'active'
  },
  ...
]
*/

// Get pool by ID
const pool = await sdk.staking.getPool('pool-gold-001');

// Get pools by tier
const goldPools = await sdk.staking.getPoolsByTier('gold');`,

  stake: `// Stake TBURN to a pool
const stakeResult = await sdk.staking.stake({
  poolId: 'pool-gold-001',
  amount: '10000000000000000000000', // 10,000 TBURN in Wei
  autoCompound: true,  // Enable auto-compounding
});

console.log(stakeResult);
/* Output:
{
  transactionHash: '0x1234...',
  positionId: 'pos-abc123',
  stakedAmount: '10000000000000000000000',
  effectiveApy: 16.5,
  lockUntil: '2025-05-27T00:00:00Z'
}
*/`,

  unstake: `// Request unstaking (21-day unbonding period)
const unstakeResult = await sdk.staking.unstake({
  positionId: 'pos-abc123',
  amount: '5000000000000000000000', // Partial unstake
});

console.log(unstakeResult);
/* Output:
{
  transactionHash: '0x5678...',
  unbondingId: 'unbond-xyz789',
  amount: '5000000000000000000000',
  completesAt: '2025-06-17T00:00:00Z',
  penaltyApplied: 0
}
*/

// Check unbonding status
const unbonding = await sdk.staking.getUnbondingRequests(walletAddress);`,

  rewards: `// Get pending rewards
const rewards = await sdk.staking.getPendingRewards(walletAddress);
console.log(rewards.totalPending); // '2547830000000000000000'

// Claim all rewards
const claimResult = await sdk.staking.claimRewards({
  positionIds: ['pos-abc123', 'pos-def456'],
});

// Compound rewards
const compoundResult = await sdk.staking.compoundRewards({
  positionId: 'pos-abc123',
});

// Get reward history
const rewardHistory = await sdk.staking.getRewardHistory({
  address: walletAddress,
  limit: 50,
  offset: 0,
});`,

  delegation: `// Delegate to a validator
const delegateResult = await sdk.delegation.delegate({
  validatorAddress: '0xValidator...',
  amount: '100000000000000000000000', // 100,000 TBURN
});

// Redelegate between validators
const redelegateResult = await sdk.delegation.redelegate({
  fromValidator: '0xValidatorA...',
  toValidator: '0xValidatorB...',
  amount: '50000000000000000000000',
});

// Get all delegations for an address
const delegations = await sdk.delegation.getDelegations(walletAddress);`,

  events: `// Subscribe to staking events
sdk.events.on('stake', (event) => {
  console.log('New stake:', event);
});

sdk.events.on('reward', (event) => {
  console.log('Reward received:', event);
});

sdk.events.on('slashing', (event) => {
  console.warn('Slashing event:', event);
});

// Subscribe to specific pool events
sdk.events.subscribePool('pool-gold-001', (event) => {
  console.log('Pool event:', event);
});

// Unsubscribe
sdk.events.unsubscribeAll();`,

  utils: `// Utility functions
import { utils } from '@tburn/staking-sdk';

// Convert TBURN to Wei
const weiAmount = utils.toWei('1000'); // '1000000000000000000000'

// Convert Wei to TBURN
const tburnAmount = utils.fromWei('1000000000000000000000'); // '1000'

// Calculate expected rewards
const expectedRewards = utils.calculateRewards({
  amount: '10000000000000000000000',
  apy: 15.5,
  duration: 365, // days
});

// Format for display
const formatted = utils.formatAmount('10000000000000000000000', {
  decimals: 2,
  symbol: 'TBURN',
}); // '10,000.00 TBURN'`,

  errorHandling: `// Error handling patterns
import { TBurnError, ErrorCodes } from '@tburn/staking-sdk';

try {
  await sdk.staking.stake({
    poolId: 'pool-001',
    amount: '1000000000000000000000'
  });
} catch (error) {
  if (error instanceof TBurnError) {
    switch (error.code) {
      case ErrorCodes.INSUFFICIENT_BALANCE:
        console.log('Not enough TBURN');
        break;
      case ErrorCodes.POOL_FULL:
        console.log('Pool capacity reached');
        break;
      case ErrorCodes.BELOW_MINIMUM:
        console.log('Amount below minimum stake');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}`,

  typescript: `// TypeScript types
import {
  StakingPool,
  StakingPosition,
  Delegation,
  RewardEvent,
  UnbondingRequest,
  TransactionResult
} from '@tburn/staking-sdk';

// Typed pool retrieval
const pools: StakingPool[] = await sdk.staking.getPools();

// Typed position
const position: StakingPosition = await sdk.staking.getPosition('pos-123');

// Transaction result
const result: TransactionResult = await sdk.staking.stake({
  poolId: 'pool-001',
  amount: '10000000000000000000000'
});

// Type-safe event handler
sdk.events.on('reward', (event: RewardEvent) => {
  console.log(event.amount, event.positionId);
});`,

  react: `// React Hook Integration
import { useStaking, useRewards } from '@tburn/staking-sdk/react';

function StakingDashboard() {
  const { pools, positions, isLoading } = useStaking();
  const { pendingRewards, claim } = useRewards();

  const handleClaim = async () => {
    const tx = await claim({ all: true });
    console.log('Claimed:', tx.hash);
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <h2>Your Positions</h2>
      {positions.map(pos => (
        <div key={pos.id}>
          {pos.amount} TBURN @ {pos.apy}% APY
        </div>
      ))}
      <button onClick={handleClaim}>
        Claim {pendingRewards} TBURN
      </button>
    </div>
  );
}`,

  nodejs: `// Node.js Backend Integration
const { TBurnStakingSDK } = require('@tburn/staking-sdk');

const sdk = new TBurnStakingSDK({
  network: 'mainnet',
  apiKey: process.env.TBURN_API_KEY,
  rpcUrl: process.env.TBURN_RPC_URL,
});

// Backend service
async function processStakingRewards() {
  const allPositions = await sdk.staking.getAllPositions();
  
  for (const position of allPositions) {
    const rewards = await sdk.staking.getPendingRewards(position.address);
    
    if (BigInt(rewards.totalPending) > BigInt('1000000000000000000000')) {
      await notifyUser(position.address, rewards);
    }
  }
}

// Express endpoint
app.post('/api/stake', async (req, res) => {
  const { poolId, amount, signature } = req.body;
  
  // Verify signature and process
  const result = await sdk.staking.stake({
    poolId,
    amount,
    signature
  });
  
  res.json(result);
});`
};

const apiEndpoints = [
  {
    method: "GET",
    endpoint: "/api/staking/pools",
    descriptionKey: "apiGetAllPools",
    params: "?type=public|private&tier=bronze|silver|gold|platinum|diamond",
    category: "pools"
  },
  {
    method: "GET",
    endpoint: "/api/staking/pools/:id",
    descriptionKey: "apiGetPoolById",
    params: "",
    category: "pools"
  },
  {
    method: "GET",
    endpoint: "/api/staking/positions",
    descriptionKey: "apiGetPositions",
    params: "?address=0x...&poolId=...",
    category: "positions"
  },
  {
    method: "GET",
    endpoint: "/api/staking/delegations",
    descriptionKey: "apiGetDelegations",
    params: "?address=0x...&validatorId=...",
    category: "delegation"
  },
  {
    method: "GET",
    endpoint: "/api/staking/unbonding",
    descriptionKey: "apiGetUnbonding",
    params: "?address=0x...",
    category: "positions"
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/current",
    descriptionKey: "apiGetRewardsCurrent",
    params: "",
    category: "rewards"
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/cycles",
    descriptionKey: "apiGetRewardsCycles",
    params: "?limit=50",
    category: "rewards"
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/events",
    descriptionKey: "apiGetRewardsEvents",
    params: "?address=0x...&cycleId=...&limit=100",
    category: "rewards"
  },
  {
    method: "GET",
    endpoint: "/api/staking/slashing",
    descriptionKey: "apiGetSlashing",
    params: "?validatorId=...&limit=50",
    category: "validators"
  },
  {
    method: "GET",
    endpoint: "/api/staking/tiers",
    descriptionKey: "apiGetTiers",
    params: "",
    category: "pools"
  },
  {
    method: "GET",
    endpoint: "/api/staking/stats",
    descriptionKey: "apiGetStats",
    params: "",
    category: "stats"
  },
  {
    method: "POST",
    endpoint: "/api/staking/stake",
    descriptionKey: "apiPostStake",
    params: "",
    category: "staking",
    body: '{ "poolId": "string", "amount": "string", "autoCompound": boolean }'
  },
  {
    method: "POST",
    endpoint: "/api/staking/unstake",
    descriptionKey: "apiPostUnstake",
    params: "",
    category: "staking",
    body: '{ "positionId": "string", "amount": "string" }'
  },
  {
    method: "POST",
    endpoint: "/api/staking/claim",
    descriptionKey: "apiPostClaim",
    params: "",
    category: "rewards",
    body: '{ "positionIds": ["string"] }'
  },
  {
    method: "POST",
    endpoint: "/api/delegation/delegate",
    descriptionKey: "apiPostDelegate",
    params: "",
    category: "delegation",
    body: '{ "validatorAddress": "string", "amount": "string" }'
  },
  {
    method: "POST",
    endpoint: "/api/delegation/redelegate",
    descriptionKey: "apiPostRedelegate",
    params: "",
    category: "delegation",
    body: '{ "fromValidator": "string", "toValidator": "string", "amount": "string" }'
  }
];

interface PlaygroundEndpoint {
  value: string;
  label: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  category: string;
  description: string;
  defaultParams: string;
  requiresAuth: boolean;
  sampleResponse?: string;
}

const playgroundEndpoints: PlaygroundEndpoint[] = [
  // Staking Pools
  { 
    value: "/api/staking/pools", 
    label: "GET /api/staking/pools", 
    method: "GET",
    category: "pools",
    description: "Get all available staking pools with tier information",
    defaultParams: '{}',
    requiresAuth: false,
    sampleResponse: '{ "pools": [...], "total": 12 }'
  },
  { 
    value: "/api/staking/pools/:id", 
    label: "GET /api/staking/pools/:id", 
    method: "GET",
    category: "pools",
    description: "Get a specific staking pool by ID",
    defaultParams: '{\n  "id": "pool-gold-001"\n}',
    requiresAuth: false
  },
  { 
    value: "/api/staking/stats", 
    label: "GET /api/staking/stats", 
    method: "GET",
    category: "pools",
    description: "Get overall staking statistics and TVL",
    defaultParams: '{}',
    requiresAuth: false
  },
  { 
    value: "/api/staking/tiers", 
    label: "GET /api/staking/tiers", 
    method: "GET",
    category: "pools",
    description: "Get tier configuration and requirements",
    defaultParams: '{}',
    requiresAuth: false
  },
  // Positions
  { 
    value: "/api/staking/positions", 
    label: "GET /api/staking/positions", 
    method: "GET",
    category: "positions",
    description: "Get staking positions for an address",
    defaultParams: '{\n  "address": "0x1234567890abcdef1234567890abcdef12345678"\n}',
    requiresAuth: false
  },
  { 
    value: "/api/staking/delegations", 
    label: "GET /api/staking/delegations", 
    method: "GET",
    category: "positions",
    description: "Get delegation positions for an address",
    defaultParams: '{\n  "address": "0x1234567890abcdef1234567890abcdef12345678"\n}',
    requiresAuth: false
  },
  { 
    value: "/api/staking/unbonding", 
    label: "GET /api/staking/unbonding", 
    method: "GET",
    category: "positions",
    description: "Get pending unbonding requests",
    defaultParams: '{\n  "address": "0x1234567890abcdef1234567890abcdef12345678"\n}',
    requiresAuth: false
  },
  // Rewards
  { 
    value: "/api/staking/rewards/current", 
    label: "GET /api/staking/rewards/current", 
    method: "GET",
    category: "rewards",
    description: "Get current reward cycle information",
    defaultParams: '{}',
    requiresAuth: false
  },
  { 
    value: "/api/staking/rewards/cycles", 
    label: "GET /api/staking/rewards/cycles", 
    method: "GET",
    category: "rewards",
    description: "Get historical reward cycles",
    defaultParams: '{\n  "limit": 10,\n  "offset": 0\n}',
    requiresAuth: false
  },
  { 
    value: "/api/staking/rewards/events", 
    label: "GET /api/staking/rewards/events", 
    method: "GET",
    category: "rewards",
    description: "Get reward distribution events",
    defaultParams: '{\n  "limit": 20\n}',
    requiresAuth: false
  },
  { 
    value: "/api/staking/slashing", 
    label: "GET /api/staking/slashing", 
    method: "GET",
    category: "rewards",
    description: "Get slashing events history",
    defaultParams: '{\n  "limit": 10\n}',
    requiresAuth: false
  },
  // Validators
  { 
    value: "/api/validators", 
    label: "GET /api/validators", 
    method: "GET",
    category: "validators",
    description: "Get all validators with status and performance",
    defaultParams: '{\n  "status": "active",\n  "limit": 50\n}',
    requiresAuth: false
  },
  { 
    value: "/api/validators/:address", 
    label: "GET /api/validators/:address", 
    method: "GET",
    category: "validators",
    description: "Get specific validator details",
    defaultParams: '{\n  "address": "0xValidator1234567890abcdef"\n}',
    requiresAuth: false
  },
  // Blocks & Transactions
  { 
    value: "/api/blocks", 
    label: "GET /api/blocks", 
    method: "GET",
    category: "blockchain",
    description: "Get recent blocks",
    defaultParams: '{\n  "limit": 10\n}',
    requiresAuth: false
  },
  { 
    value: "/api/blocks/:height", 
    label: "GET /api/blocks/:height", 
    method: "GET",
    category: "blockchain",
    description: "Get block by height",
    defaultParams: '{\n  "height": "11227500"\n}',
    requiresAuth: false
  },
  { 
    value: "/api/transactions", 
    label: "GET /api/transactions", 
    method: "GET",
    category: "blockchain",
    description: "Get recent transactions",
    defaultParams: '{\n  "limit": 20,\n  "type": "all"\n}',
    requiresAuth: false
  },
  { 
    value: "/api/transactions/:hash", 
    label: "GET /api/transactions/:hash", 
    method: "GET",
    category: "blockchain",
    description: "Get transaction by hash",
    defaultParams: '{\n  "hash": "0xabc123..."\n}',
    requiresAuth: false
  },
  // Write Operations (POST)
  { 
    value: "/api/staking/stake", 
    label: "POST /api/staking/stake", 
    method: "POST",
    category: "write",
    description: "Create a new staking position",
    defaultParams: '{\n  "poolId": "pool-gold-001",\n  "amount": "10000000000000000000000",\n  "autoCompound": true\n}',
    requiresAuth: true
  },
  { 
    value: "/api/staking/unstake", 
    label: "POST /api/staking/unstake", 
    method: "POST",
    category: "write",
    description: "Request unstaking from a position",
    defaultParams: '{\n  "positionId": "pos-abc123",\n  "amount": "5000000000000000000000"\n}',
    requiresAuth: true
  },
  { 
    value: "/api/staking/claim", 
    label: "POST /api/staking/claim", 
    method: "POST",
    category: "write",
    description: "Claim pending rewards",
    defaultParams: '{\n  "positionIds": ["pos-abc123", "pos-def456"]\n}',
    requiresAuth: true
  },
  { 
    value: "/api/delegation/delegate", 
    label: "POST /api/delegation/delegate", 
    method: "POST",
    category: "write",
    description: "Delegate tokens to a validator",
    defaultParams: '{\n  "validatorAddress": "0xValidator...",\n  "amount": "100000000000000000000000"\n}',
    requiresAuth: true
  },
  { 
    value: "/api/delegation/redelegate", 
    label: "POST /api/delegation/redelegate", 
    method: "POST",
    category: "write",
    description: "Redelegate between validators",
    defaultParams: '{\n  "fromValidator": "0xValidatorA...",\n  "toValidator": "0xValidatorB...",\n  "amount": "50000000000000000000000"\n}',
    requiresAuth: true
  },
  // DeFi endpoints
  { 
    value: "/api/dex/pools", 
    label: "GET /api/dex/pools", 
    method: "GET",
    category: "defi",
    description: "Get DEX liquidity pools",
    defaultParams: '{\n  "limit": 20\n}',
    requiresAuth: false
  },
  { 
    value: "/api/lending/markets", 
    label: "GET /api/lending/markets", 
    method: "GET",
    category: "defi",
    description: "Get lending markets",
    defaultParams: '{}',
    requiresAuth: false
  },
  { 
    value: "/api/yield/vaults", 
    label: "GET /api/yield/vaults", 
    method: "GET",
    category: "defi",
    description: "Get yield farming vaults",
    defaultParams: '{\n  "status": "active"\n}',
    requiresAuth: false
  },
];

interface RequestHistoryItem {
  id: string;
  endpoint: string;
  method: string;
  params: string;
  headers: string;
  status: number;
  responseTime: number;
  timestamp: number;
  response: string;
}

const endpointCategories = [
  { value: "all", label: "All Endpoints" },
  { value: "pools", label: "Staking Pools" },
  { value: "positions", label: "Positions" },
  { value: "rewards", label: "Rewards" },
  { value: "validators", label: "Validators" },
  { value: "blockchain", label: "Blockchain" },
  { value: "write", label: "Write Operations" },
  { value: "defi", label: "DeFi" },
];

const quickStartSteps = [
  {
    id: 1,
    icon: Download,
    titleKey: "quickStartStep1Title",
    descKey: "quickStartStep1Desc",
    code: "npm install @tburn/staking-sdk"
  },
  {
    id: 2,
    icon: Settings,
    titleKey: "quickStartStep2Title",
    descKey: "quickStartStep2Desc",
    code: `import { TBurnStakingSDK } from '@tburn/staking-sdk';

const sdk = new TBurnStakingSDK({
  network: 'mainnet',
  apiKey: 'YOUR_API_KEY'
});`
  },
  {
    id: 3,
    icon: Wallet,
    titleKey: "quickStartStep3Title",
    descKey: "quickStartStep3Desc",
    code: `// Browser
await sdk.connect();

// Node.js
sdk.setPrivateKey(process.env.PRIVATE_KEY);`
  },
  {
    id: 4,
    icon: Coins,
    titleKey: "quickStartStep4Title",
    descKey: "quickStartStep4Desc",
    code: `const pools = await sdk.staking.getPools();
const result = await sdk.staking.stake({
  poolId: 'pool-gold-001',
  amount: '10000000000000000000000'
});`
  }
];

const codeCategories = [
  { id: "basic", labelKey: "codeBasic", icon: Zap },
  { id: "staking", labelKey: "codeStaking", icon: Coins },
  { id: "rewards", labelKey: "codeRewards", icon: Award },
  { id: "advanced", labelKey: "codeAdvanced", icon: Cpu },
  { id: "integration", labelKey: "codeIntegration", icon: Layers }
];

const codeCategoryExamples: Record<string, { key: string; titleKey: string; descKey: string }[]> = {
  basic: [
    { key: "install", titleKey: "exInstall", descKey: "exInstallDesc" },
    { key: "initialize", titleKey: "exInitialize", descKey: "exInitializeDesc" }
  ],
  staking: [
    { key: "getPools", titleKey: "exGetPools", descKey: "exGetPoolsDesc" },
    { key: "stake", titleKey: "exStake", descKey: "exStakeDesc" },
    { key: "unstake", titleKey: "exUnstake", descKey: "exUnstakeDesc" }
  ],
  rewards: [
    { key: "rewards", titleKey: "exRewards", descKey: "exRewardsDesc" },
    { key: "delegation", titleKey: "exDelegation", descKey: "exDelegationDesc" }
  ],
  advanced: [
    { key: "events", titleKey: "exEvents", descKey: "exEventsDesc" },
    { key: "utils", titleKey: "exUtils", descKey: "exUtilsDesc" },
    { key: "errorHandling", titleKey: "exErrorHandling", descKey: "exErrorHandlingDesc" },
    { key: "typescript", titleKey: "exTypescript", descKey: "exTypescriptDesc" }
  ],
  integration: [
    { key: "react", titleKey: "exReact", descKey: "exReactDesc" },
    { key: "nodejs", titleKey: "exNodejs", descKey: "exNodejsDesc" }
  ]
};

const faqItems = [
  { questionKey: "faq1Question", answerKey: "faq1Answer" },
  { questionKey: "faq2Question", answerKey: "faq2Answer" },
  { questionKey: "faq3Question", answerKey: "faq3Answer" },
  { questionKey: "faq4Question", answerKey: "faq4Answer" },
  { questionKey: "faq5Question", answerKey: "faq5Answer" },
  { questionKey: "faq6Question", answerKey: "faq6Answer" }
];

const supportChannels = [
  { id: "discord", icon: MessageCircle, labelKey: "discord", descKey: "discordDesc", url: "https://discord.gg/tburn" },
  { id: "telegram", icon: Send, labelKey: "telegram", descKey: "telegramDesc", url: "https://t.me/tburnnetwork" },
  { id: "github", icon: Github, labelKey: "githubIssues", descKey: "githubIssuesDesc", url: "https://github.com/tburn-network/staking-sdk/issues" },
  { id: "email", icon: Mail, labelKey: "emailSupport", descKey: "emailSupportDesc", url: "mailto:sdk-support@tburn.network" }
];

function QuickStartDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyCode = (code: string, stepId: number) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(stepId);
    toast({ title: t('stakingSdk.copied'), description: t('stakingSdk.codeCopied') });
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Rocket className="h-5 w-5 text-primary" />
            {t('stakingSdk.quickStartGuide')}
          </DialogTitle>
          <DialogDescription>
            {t('stakingSdk.quickStartGuideDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 mt-4">
          <div className="w-48 space-y-2">
            {quickStartSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeStep === index
                    ? 'bg-primary text-primary-foreground'
                    : 'hover-elevate'
                }`}
                data-testid={`button-step-${step.id}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeStep === index ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}>
                  {index < activeStep ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-sm font-medium truncate">
                  {t(`stakingSdk.${step.titleKey}`)}
                </span>
              </button>
            ))}
          </div>
          
          <Separator orientation="vertical" />
          
          <ScrollArea className="flex-1 h-[50vh]">
            <div className="pr-4 space-y-4">
              {quickStartSteps.map((step, index) => {
                const StepIcon = step.icon;
                if (index !== activeStep) return null;
                
                return (
                  <div key={step.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <StepIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{t(`stakingSdk.${step.titleKey}`)}</h3>
                        <p className="text-sm text-muted-foreground">{t(`stakingSdk.${step.descKey}`)}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                        <code className="text-sm font-mono">{step.code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(step.code, step.id)}
                        data-testid={`button-copy-step-${step.id}`}
                      >
                        {copiedStep === step.id ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        data-testid="button-prev-step"
                      >
                        {t('stakingSdk.previousStep')}
                      </Button>
                      {activeStep < quickStartSteps.length - 1 ? (
                        <Button
                          onClick={() => setActiveStep(activeStep + 1)}
                          data-testid="button-next-step"
                        >
                          {t('stakingSdk.nextStep')}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button onClick={() => onOpenChange(false)} data-testid="button-finish">
                          <Check className="h-4 w-4 mr-2" />
                          {t('stakingSdk.finish')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Progress value={(activeStep + 1) / quickStartSteps.length * 100} className="h-2" />
          <p className="text-sm text-muted-foreground text-center mt-2">
            {t('stakingSdk.stepProgress', { current: activeStep + 1, total: quickStartSteps.length })}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApiReferenceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["all", "pools", "positions", "rewards", "delegation", "validators", "staking", "stats"];

  const filteredEndpoints = apiEndpoints.filter(ep => {
    const matchesCategory = selectedCategory === "all" || ep.category === selectedCategory;
    const matchesSearch = ep.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(`stakingSdk.${ep.descriptionKey}`).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${endpoint}`);
    toast({ title: t('stakingSdk.copied'), description: t('stakingSdk.endpointCopied') });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Book className="h-5 w-5 text-primary" />
            {t('stakingSdk.apiReferenceTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('stakingSdk.apiReferenceDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('stakingSdk.searchEndpoints')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-endpoints"
            />
          </div>
          <select
            className="px-3 py-2 rounded-md border bg-background"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            data-testid="select-api-category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? t('stakingSdk.allEndpoints') : t(`stakingSdk.category${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
              </option>
            ))}
          </select>
        </div>

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-3 pr-4">
            {filteredEndpoints.map((ep, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border hover-elevate cursor-pointer"
                onClick={() => copyEndpoint(ep.endpoint)}
                data-testid={`card-endpoint-${i}`}
              >
                <div className="flex items-start gap-3">
                  <Badge
                    variant={ep.method === "GET" ? "default" : ep.method === "POST" ? "secondary" : "outline"}
                    className="font-mono mt-0.5"
                  >
                    {ep.method}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-semibold">{ep.endpoint}</code>
                      {ep.params && (
                        <code className="text-xs text-muted-foreground">{ep.params}</code>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(`stakingSdk.${ep.descriptionKey}`)}
                    </p>
                    {(ep as any).body && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">Body:</span>
                        <code className="text-xs font-mono ml-2 text-primary">{(ep as any).body}</code>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {t('stakingSdk.endpointsCount', { count: filteredEndpoints.length })}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CodeExamplesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("basic");
  const [selectedExample, setSelectedExample] = useState<string | null>("install");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (key: string) => {
    const code = codeExamples[key as keyof typeof codeExamples];
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(key);
      toast({ title: t('stakingSdk.copied'), description: t('stakingSdk.codeCopied') });
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Code2 className="h-5 w-5 text-primary" />
            {t('stakingSdk.codeExamplesTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('stakingSdk.codeExamplesDialogDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mt-4 flex-1 overflow-hidden">
          <div className="w-64 space-y-4">
            <div className="space-y-1">
              {codeCategories.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedExample(codeCategoryExamples[cat.id]?.[0]?.key || null);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover-elevate'
                    }`}
                    data-testid={`button-category-${cat.id}`}
                  >
                    <CatIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{t(`stakingSdk.${cat.labelKey}`)}</span>
                  </button>
                );
              })}
            </div>

            <Separator />

            <div className="space-y-1">
              {codeCategoryExamples[selectedCategory]?.map((ex) => (
                <button
                  key={ex.key}
                  onClick={() => setSelectedExample(ex.key)}
                  className={`w-full flex items-center gap-2 p-2 rounded-md text-left text-sm ${
                    selectedExample === ex.key
                      ? 'bg-muted font-medium'
                      : 'hover-elevate'
                  }`}
                  data-testid={`button-example-${ex.key}`}
                >
                  <ChevronRight className={`h-3 w-3 transition-transform ${selectedExample === ex.key ? 'rotate-90' : ''}`} />
                  {t(`stakingSdk.${ex.titleKey}`)}
                </button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" />

          <ScrollArea className="flex-1">
            <div className="pr-4 space-y-4">
              {selectedExample && codeCategoryExamples[selectedCategory]?.find(ex => ex.key === selectedExample) && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {t(`stakingSdk.${codeCategoryExamples[selectedCategory].find(ex => ex.key === selectedExample)?.titleKey}`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`stakingSdk.${codeCategoryExamples[selectedCategory].find(ex => ex.key === selectedExample)?.descKey}`)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCode(selectedExample)}
                      data-testid={`button-copy-${selectedExample}`}
                    >
                      {copiedCode === selectedExample ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          {t('stakingSdk.copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          {t('stakingSdk.copyCode')}
                        </>
                      )}
                    </Button>
                  </div>

                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm font-mono">
                      {codeExamples[selectedExample as keyof typeof codeExamples]}
                    </code>
                  </pre>
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("channels");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Headphones className="h-5 w-5 text-primary" />
            {t('stakingSdk.supportCenter')}
          </DialogTitle>
          <DialogDescription>
            {t('stakingSdk.supportCenterDesc')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="channels" data-testid="tab-channels">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('stakingSdk.supportChannels')}
            </TabsTrigger>
            <TabsTrigger value="faq" data-testid="tab-faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              {t('stakingSdk.faq')}
            </TabsTrigger>
            <TabsTrigger value="resources" data-testid="tab-resources">
              <BookOpen className="h-4 w-4 mr-2" />
              {t('stakingSdk.resources')}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="channels" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {supportChannels.map((channel) => {
                  const ChannelIcon = channel.icon;
                  return (
                    <Card
                      key={channel.id}
                      className="hover-elevate cursor-pointer"
                      onClick={() => window.open(channel.url, '_blank')}
                      data-testid={`card-channel-${channel.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ChannelIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{t(`stakingSdk.${channel.labelKey}`)}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t(`stakingSdk.${channel.descKey}`)}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('stakingSdk.responseTime')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-600">
                        <Zap className="h-4 w-4" />
                        <span className="font-medium">{t('stakingSdk.discordResponse')}</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">&lt; 1h</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 text-blue-600">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{t('stakingSdk.emailResponse')}</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">24h</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-purple-600">
                        <Bug className="h-4 w-4" />
                        <span className="font-medium">{t('stakingSdk.githubResponse')}</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">48h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="mt-0">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} data-testid={`accordion-faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {t(`stakingSdk.${item.questionKey}`)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t(`stakingSdk.${item.answerKey}`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="resources" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="hover-elevate cursor-pointer" onClick={() => window.open('https://docs.tburn.network/sdk', '_blank')}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('stakingSdk.documentation')}</h4>
                      <p className="text-sm text-muted-foreground">{t('stakingSdk.documentationDesc')}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate cursor-pointer" onClick={() => window.open('https://youtube.com/tburnnetwork', '_blank')}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Video className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('stakingSdk.videoTutorials')}</h4>
                      <p className="text-sm text-muted-foreground">{t('stakingSdk.videoTutorialsDesc')}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate cursor-pointer" onClick={() => window.open('https://github.com/tburn-network/staking-sdk/tree/main/examples', '_blank')}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center">
                      <Github className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('stakingSdk.sampleProjects')}</h4>
                      <p className="text-sm text-muted-foreground">{t('stakingSdk.sampleProjectsDesc')}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate cursor-pointer" onClick={() => window.open('https://blog.tburn.network/category/sdk', '_blank')}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('stakingSdk.blogArticles')}</h4>
                      <p className="text-sm text-muted-foreground">{t('stakingSdk.blogArticlesDesc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StakingSDK() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(playgroundEndpoints[0].value);
  const [parameters, setParameters] = useState(playgroundEndpoints[0].defaultParams);
  const [response, setResponse] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customHeaders, setCustomHeaders] = useState('{\n  "Authorization": "Bearer YOUR_API_KEY"\n}');
  const [showHeaders, setShowHeaders] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [responseFormat, setResponseFormat] = useState<"formatted" | "raw">("formatted");

  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [apiReferenceOpen, setApiReferenceOpen] = useState(false);
  const [codeExamplesOpen, setCodeExamplesOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const currentEndpoint = playgroundEndpoints.find(ep => ep.value === selectedEndpoint);
  
  const filteredEndpoints = selectedCategory === "all" 
    ? playgroundEndpoints 
    : playgroundEndpoints.filter(ep => ep.category === selectedCategory);

  const validateJson = (json: string): { valid: boolean; error: string | null } => {
    const trimmed = json.trim();
    if (!trimmed || trimmed === '{}') {
      return { valid: true, error: null };
    }
    try {
      JSON.parse(trimmed);
      return { valid: true, error: null };
    } catch (e) {
      if (e instanceof Error) {
        return { valid: false, error: e.message };
      }
      return { valid: false, error: 'Invalid JSON' };
    }
  };

  const handleEndpointChange = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    const ep = playgroundEndpoints.find(e => e.value === endpoint);
    if (ep) {
      setParameters(ep.defaultParams);
      setJsonError(null);
    }
  };

  const handleParametersChange = (value: string) => {
    setParameters(value);
    const validation = validateJson(value);
    setJsonError(validation.error);
  };

  const loadFromHistory = (item: RequestHistoryItem) => {
    setSelectedEndpoint(item.endpoint);
    setParameters(item.params);
    setCustomHeaders(item.headers);
    setShowHistory(false);
    toast({
      title: t('stakingSdk.historyLoaded'),
      description: t('stakingSdk.historyLoadedDesc')
    });
  };

  const clearHistory = () => {
    setRequestHistory([]);
    toast({
      title: t('stakingSdk.historyCleared'),
      description: t('stakingSdk.historyClearedDesc')
    });
  };

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    toast({
      title: t('stakingSdk.copied'),
      description: t('stakingSdk.codeCopied')
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenNpm = () => {
    window.open('https://www.npmjs.com/package/@tburn/staking-sdk', '_blank', 'noopener,noreferrer');
    toast({
      title: t('stakingSdk.npmOpened'),
      description: t('stakingSdk.npmOpenedDesc')
    });
  };

  const handleOpenGithub = () => {
    window.open('https://github.com/tburn-network/staking-sdk', '_blank', 'noopener,noreferrer');
    toast({
      title: t('stakingSdk.githubOpened'),
      description: t('stakingSdk.githubOpenedDesc')
    });
  };

  const handleExecuteRequest = async () => {
    const validation = validateJson(parameters);
    if (!validation.valid) {
      toast({
        title: t('stakingSdk.invalidJson'),
        description: validation.error || 'Invalid JSON',
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setResponse(null);
    setResponseTime(null);
    setResponseStatus(null);

    const startTime = Date.now();
    const endpoint = currentEndpoint;
    const method = endpoint?.method || "GET";

    try {
      let url = selectedEndpoint;
      let parsedParams: Record<string, any> = {};
      
      try {
        const trimmed = parameters.trim();
        parsedParams = trimmed && trimmed !== '{}' ? JSON.parse(trimmed) : {};
      } catch (e) {
        parsedParams = {};
      }

      const pathParamKeys = ['id', 'height', 'hash', 'address'];
      if (url.includes(':id')) {
        url = url.replace(':id', parsedParams.id || 'pool-gold-001');
      }
      if (url.includes(':height')) {
        url = url.replace(':height', parsedParams.height || '11227500');
      }
      if (url.includes(':hash')) {
        url = url.replace(':hash', parsedParams.hash || '0xabc123');
      }
      if (url.includes(':address')) {
        url = url.replace(':address', parsedParams.address || '0x1234');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (showHeaders && customHeaders.trim()) {
        try {
          const parsedHeaders = JSON.parse(customHeaders);
          Object.entries(parsedHeaders).forEach(([key, value]) => {
            if (typeof value === 'string' && value && !value.includes('YOUR_API_KEY')) {
              headers[key] = value;
            }
          });
        } catch (e) {
        }
      }

      let fetchOptions: RequestInit = {
        method,
        headers
      };

      if (method === "GET") {
        const remainingParams = Object.fromEntries(
          Object.entries(parsedParams).filter(([key]) => !pathParamKeys.includes(key))
        );
        if (Object.keys(remainingParams).length > 0) {
          const queryParams = new URLSearchParams();
          Object.entries(remainingParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (typeof value === 'object') {
                queryParams.append(key, JSON.stringify(value));
              } else {
                queryParams.append(key, String(value));
              }
            }
          });
          const queryString = queryParams.toString();
          if (queryString) {
            url = `${url}?${queryString}`;
          }
        }
      } else {
        const bodyParams = Object.fromEntries(
          Object.entries(parsedParams).filter(([key]) => !pathParamKeys.includes(key))
        );
        if (Object.keys(bodyParams).length > 0) {
          fetchOptions.body = JSON.stringify(bodyParams);
        }
      }

      const res = await fetch(url, fetchOptions);

      const endTime = Date.now();
      const elapsed = endTime - startTime;
      setResponseTime(elapsed);
      setResponseStatus(res.status);

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = { message: await res.text() };
      }
      
      const responseString = responseFormat === "formatted" 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      setResponse(responseString);

      const historyItem: RequestHistoryItem = {
        id: `req-${Date.now()}`,
        endpoint: selectedEndpoint,
        method,
        params: parameters,
        headers: customHeaders,
        status: res.status,
        responseTime: elapsed,
        timestamp: Date.now(),
        response: responseString.slice(0, 500)
      };
      setRequestHistory(prev => [historyItem, ...prev].slice(0, 20));

      toast({
        title: t('stakingSdk.requestSuccess'),
        description: t('stakingSdk.requestSuccessDesc', { 
          status: res.status,
          time: elapsed 
        })
      });
    } catch (error) {
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setResponseStatus(500);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResponse(JSON.stringify({ 
        error: true, 
        message: errorMessage,
        timestamp: new Date().toISOString()
      }, null, 2));

      toast({
        title: t('stakingSdk.requestError'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyEndpoint = (endpoint: string, params: string) => {
    const fullUrl = `${window.location.origin}${endpoint}${params}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: t('stakingSdk.copied'),
      description: t('stakingSdk.endpointCopied')
    });
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      toast({
        title: t('stakingSdk.copied'),
        description: t('stakingSdk.responseCopied')
      });
    }
  };

  const handleGetApiKey = () => {
    toast({
      title: t('stakingSdk.apiKeyInfo'),
      description: t('stakingSdk.apiKeyInfoDesc')
    });
  };

  const handleFullDocs = () => {
    window.open('https://docs.tburn.network/sdk', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold" data-testid="text-sdk-title">{t('stakingSdk.title')}</h1>
            <TestBadge />
          </div>
          <p className="text-muted-foreground mt-1">
            {t('stakingSdk.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {t('stakingSdk.version')}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            data-testid="button-npm"
            onClick={handleOpenNpm}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            {t('stakingSdk.npm')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            data-testid="button-github"
            onClick={handleOpenGithub}
          >
            <GitBranch className="h-4 w-4 mr-1" />
            {t('stakingSdk.github')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="hover-elevate cursor-pointer transition-all"
          onClick={() => setQuickStartOpen(true)}
          data-testid="card-quick-start"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingSdk.quickStart')}</CardTitle>
            <Rocket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('stakingSdk.quickStartDesc')}
            </p>
            <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
              {t('stakingSdk.viewDetails')}
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover-elevate cursor-pointer transition-all"
          onClick={() => setApiReferenceOpen(true)}
          data-testid="card-api-docs"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingSdk.apiReference')}</CardTitle>
            <Book className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('stakingSdk.apiReferenceDesc')}
            </p>
            <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
              {t('stakingSdk.viewDetails')}
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover-elevate cursor-pointer transition-all"
          onClick={() => setCodeExamplesOpen(true)}
          data-testid="card-examples"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingSdk.codeExamples')}</CardTitle>
            <Code2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('stakingSdk.codeExamplesDesc')}
            </p>
            <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
              {t('stakingSdk.viewDetails')}
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover-elevate cursor-pointer transition-all"
          onClick={() => setSupportOpen(true)}
          data-testid="card-support"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingSdk.support')}</CardTitle>
            <Headphones className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('stakingSdk.supportDesc')}
            </p>
            <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
              {t('stakingSdk.viewDetails')}
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sdk" className="space-y-4">
        <TabsList data-testid="tabs-sdk">
          <TabsTrigger value="sdk" data-testid="tab-sdk">{t('stakingSdk.sdkGuide')}</TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">{t('stakingSdk.restApi')}</TabsTrigger>
          <TabsTrigger value="playground" data-testid="tab-playground">{t('stakingSdk.playground')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sdk" className="space-y-6">
          <Card data-testid="card-installation">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <CardTitle>{t('stakingSdk.installation')}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyCode(codeExamples.install, "install")}
                  data-testid="button-copy-install"
                >
                  {copiedCode === "install" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                <code className="text-sm font-mono">{codeExamples.install}</code>
              </pre>
            </CardContent>
          </Card>

          <Card data-testid="card-initialization">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>{t('stakingSdk.initialization')}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyCode(codeExamples.initialize, "initialize")}
                  data-testid="button-copy-init"
                >
                  {copiedCode === "initialize" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                <code className="text-sm font-mono">{codeExamples.initialize}</code>
              </pre>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-get-pools">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    <CardTitle className="text-base">{t('stakingSdk.getStakingPools')}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyCode(codeExamples.getPools, "getPools")}
                    data-testid="button-copy-pools"
                  >
                    {copiedCode === "getPools" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm font-mono">{codeExamples.getPools}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card data-testid="card-stake">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    <CardTitle className="text-base">{t('stakingSdk.stakeTburn')}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyCode(codeExamples.stake, "stake")}
                    data-testid="button-copy-stake"
                  >
                    {copiedCode === "stake" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm font-mono">{codeExamples.stake}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card data-testid="card-unstake">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle className="text-base">{t('stakingSdk.unstakeUnbonding')}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyCode(codeExamples.unstake, "unstake")}
                    data-testid="button-copy-unstake"
                  >
                    {copiedCode === "unstake" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm font-mono">{codeExamples.unstake}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card data-testid="card-rewards">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    <CardTitle className="text-base">{t('stakingSdk.rewardsManagement')}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyCode(codeExamples.rewards, "rewards")}
                    data-testid="button-copy-rewards"
                  >
                    {copiedCode === "rewards" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm font-mono">{codeExamples.rewards}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-delegation">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>{t('stakingSdk.delegationManagement')}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyCode(codeExamples.delegation, "delegation")}
                  data-testid="button-copy-delegation"
                >
                  {copiedCode === "delegation" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                <code className="text-sm font-mono">{codeExamples.delegation}</code>
              </pre>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-events">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <CardTitle className="text-base">{t('stakingSdk.eventSubscriptions')}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyCode(codeExamples.events, "events")}
                    data-testid="button-copy-events"
                  >
                    {copiedCode === "events" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm font-mono">{codeExamples.events}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card data-testid="card-utils">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    <CardTitle className="text-base">{t('stakingSdk.utilityFunctions')}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyCode(codeExamples.utils, "utils")}
                    data-testid="button-copy-utils"
                  >
                    {copiedCode === "utils" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm font-mono">{codeExamples.utils}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card data-testid="card-api-reference">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Braces className="h-5 w-5" />
                {t('stakingSdk.restApiEndpoints')}
              </CardTitle>
              <CardDescription>
                {t('stakingSdk.directApiAccess')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {apiEndpoints.slice(0, 11).map((endpoint, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-md border">
                      <Badge 
                        variant={endpoint.method === "GET" ? "default" : "secondary"}
                        className="font-mono mt-0.5"
                      >
                        {endpoint.method}
                      </Badge>
                      <div className="flex-1">
                        <code className="text-sm font-mono">{endpoint.endpoint}</code>
                        {endpoint.params && (
                          <code className="text-xs text-muted-foreground ml-1">{endpoint.params}</code>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">{t(`stakingSdk.${endpoint.descriptionKey}`)}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyEndpoint(endpoint.endpoint, endpoint.params)}
                        data-testid={`button-copy-endpoint-${i}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card data-testid="card-authentication">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('stakingSdk.authentication')}
              </CardTitle>
              <CardDescription>
                {t('stakingSdk.authDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                <code className="text-sm font-mono">{`Authorization: Bearer YOUR_API_KEY`}</code>
              </pre>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Button variant="outline" data-testid="button-get-api-key" onClick={handleGetApiKey}>
                  <Key className="h-4 w-4 mr-2" />
                  {t('stakingSdk.getApiKey')}
                </Button>
                <Button variant="ghost" data-testid="button-full-docs" onClick={handleFullDocs}>
                  <Book className="h-4 w-4 mr-2" />
                  {t('stakingSdk.fullDocumentation')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playground" className="space-y-4">
          <Card data-testid="card-playground">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    {t('stakingSdk.interactivePlayground')}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {t('stakingSdk.playgroundDesc')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    data-testid="button-toggle-history"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {t('stakingSdk.history')} ({requestHistory.length})
                  </Button>
                  <Button
                    variant={showHeaders ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowHeaders(!showHeaders)}
                    data-testid="button-toggle-headers"
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    {t('stakingSdk.headers')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showHistory && requestHistory.length > 0 && (
                <div className="mb-4 p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('stakingSdk.requestHistory')}
                    </h4>
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      {t('stakingSdk.clearHistory')}
                    </Button>
                  </div>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {requestHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded border bg-background hover-elevate cursor-pointer"
                          onClick={() => loadFromHistory(item)}
                          data-testid={`history-item-${item.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={item.method === "GET" ? "default" : "secondary"} className="text-xs">
                              {item.method}
                            </Badge>
                            <code className="text-xs">{item.endpoint}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.status < 400 ? "outline" : "destructive"} className="text-xs">
                              {item.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.responseTime}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium">{t('stakingSdk.category')}</label>
                      <select 
                        className="w-full mt-1 p-2 rounded-md border bg-background"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        data-testid="select-category"
                      >
                        {endpointCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('stakingSdk.endpoint')}</label>
                    <select 
                      className="w-full mt-1 p-2 rounded-md border bg-background font-mono text-sm"
                      value={selectedEndpoint}
                      onChange={(e) => handleEndpointChange(e.target.value)}
                      data-testid="select-endpoint"
                    >
                      {filteredEndpoints.map((ep) => (
                        <option key={ep.value} value={ep.value}>{ep.label}</option>
                      ))}
                    </select>
                    {currentEndpoint && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <Badge variant={currentEndpoint.method === "GET" ? "default" : "secondary"}>
                          {currentEndpoint.method}
                        </Badge>
                        {currentEndpoint.requiresAuth && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            {t('stakingSdk.requiresAuth')}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">{currentEndpoint.description}</p>
                      </div>
                    )}
                  </div>

                  {showHeaders && (
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {t('stakingSdk.customHeaders')}
                      </label>
                      <textarea 
                        className="w-full mt-1 p-3 rounded-md border bg-background font-mono text-sm h-24"
                        value={customHeaders}
                        onChange={(e) => setCustomHeaders(e.target.value)}
                        data-testid="input-headers"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium">
                        {currentEndpoint?.method === "POST" 
                          ? t('stakingSdk.requestBody') 
                          : t('stakingSdk.parametersJson')}
                      </label>
                      {currentEndpoint && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setParameters(currentEndpoint.defaultParams)}
                          data-testid="button-reset-params"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {t('stakingSdk.resetDefault')}
                        </Button>
                      )}
                    </div>
                    <textarea 
                      className={`w-full p-3 rounded-md border bg-background font-mono text-sm h-40 ${
                        jsonError ? 'border-destructive' : ''
                      }`}
                      placeholder='{"address": "0x..."}'
                      value={parameters}
                      onChange={(e) => handleParametersChange(e.target.value)}
                      data-testid="input-parameters"
                    />
                    {jsonError && (
                      <div className="mt-1 flex items-center gap-1 text-destructive text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {t('stakingSdk.jsonSyntaxError')}: {jsonError}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    data-testid="button-execute"
                    onClick={handleExecuteRequest}
                    disabled={isExecuting || !!jsonError}
                  >
                    {isExecuting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {t('stakingSdk.executing')}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        {t('stakingSdk.executeRequest')}
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('stakingSdk.response')}</label>
                    <div className="flex items-center gap-2">
                      {responseStatus && (
                        <Badge variant={responseStatus < 400 ? "default" : "destructive"}>
                          {responseStatus} {responseStatus < 400 ? 'OK' : 'Error'}
                        </Badge>
                      )}
                      {responseTime !== null && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {responseTime}ms
                        </Badge>
                      )}
                      <div className="flex border rounded">
                        <Button 
                          variant={responseFormat === "formatted" ? "default" : "ghost"} 
                          size="sm"
                          className="rounded-r-none h-7 px-2"
                          onClick={() => setResponseFormat("formatted")}
                          data-testid="button-format-formatted"
                        >
                          <FileCode className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant={responseFormat === "raw" ? "default" : "ghost"} 
                          size="sm"
                          className="rounded-l-none h-7 px-2"
                          onClick={() => setResponseFormat("raw")}
                          data-testid="button-format-raw"
                        >
                          <Braces className="h-3 w-3" />
                        </Button>
                      </div>
                      {response && (
                        <Button variant="ghost" size="sm" onClick={handleCopyResponse} data-testid="button-copy-response">
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-[400px] rounded-lg bg-muted border">
                    <pre className="p-4">
                      <code className={`text-sm font-mono whitespace-pre-wrap break-all ${
                        response 
                          ? responseStatus && responseStatus >= 400 
                            ? 'text-destructive' 
                            : 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {response || `// ${t('stakingSdk.responseWillAppear')}`}
                      </code>
                    </pre>
                  </ScrollArea>
                  
                  {response && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Server className="h-3 w-3" />
                      {t('stakingSdk.responseSize')}: {(new Blob([response]).size / 1024).toFixed(2)} KB
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QuickStartDialog open={quickStartOpen} onOpenChange={setQuickStartOpen} />
      <ApiReferenceDialog open={apiReferenceOpen} onOpenChange={setApiReferenceOpen} />
      <CodeExamplesDialog open={codeExamplesOpen} onOpenChange={setCodeExamplesOpen} />
      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
}
