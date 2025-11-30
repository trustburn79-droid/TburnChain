import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}); // '10,000.00 TBURN'`
};

const apiEndpoints = [
  {
    method: "GET",
    endpoint: "/api/staking/pools",
    descriptionKey: "apiGetAllPools",
    params: "?type=public|private&tier=bronze|silver|gold|platinum|diamond"
  },
  {
    method: "GET",
    endpoint: "/api/staking/pools/:id",
    descriptionKey: "apiGetPoolById",
    params: ""
  },
  {
    method: "GET",
    endpoint: "/api/staking/positions",
    descriptionKey: "apiGetPositions",
    params: "?address=0x...&poolId=..."
  },
  {
    method: "GET",
    endpoint: "/api/staking/delegations",
    descriptionKey: "apiGetDelegations",
    params: "?address=0x...&validatorId=..."
  },
  {
    method: "GET",
    endpoint: "/api/staking/unbonding",
    descriptionKey: "apiGetUnbonding",
    params: "?address=0x..."
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/current",
    descriptionKey: "apiGetRewardsCurrent",
    params: ""
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/cycles",
    descriptionKey: "apiGetRewardsCycles",
    params: "?limit=50"
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/events",
    descriptionKey: "apiGetRewardsEvents",
    params: "?address=0x...&cycleId=...&limit=100"
  },
  {
    method: "GET",
    endpoint: "/api/staking/slashing",
    descriptionKey: "apiGetSlashing",
    params: "?validatorId=...&limit=50"
  },
  {
    method: "GET",
    endpoint: "/api/staking/tiers",
    descriptionKey: "apiGetTiers",
    params: ""
  },
  {
    method: "GET",
    endpoint: "/api/staking/stats",
    descriptionKey: "apiGetStats",
    params: ""
  }
];

const playgroundEndpoints = [
  { value: "/api/staking/pools", label: "GET /api/staking/pools", method: "GET" },
  { value: "/api/staking/stats", label: "GET /api/staking/stats", method: "GET" },
  { value: "/api/staking/tiers", label: "GET /api/staking/tiers", method: "GET" },
  { value: "/api/staking/rewards/current", label: "GET /api/staking/rewards/current", method: "GET" },
  { value: "/api/staking/rewards/cycles", label: "GET /api/staking/rewards/cycles", method: "GET" },
  { value: "/api/staking/unbonding", label: "GET /api/staking/unbonding", method: "GET" },
  { value: "/api/staking/slashing", label: "GET /api/staking/slashing", method: "GET" },
  { value: "/api/validators", label: "GET /api/validators", method: "GET" },
  { value: "/api/blocks", label: "GET /api/blocks", method: "GET" },
  { value: "/api/transactions", label: "GET /api/transactions", method: "GET" },
];

export default function StakingSDK() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(playgroundEndpoints[0].value);
  const [parameters, setParameters] = useState('{"address": "0x..."}');
  const [response, setResponse] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

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
    setIsExecuting(true);
    setResponse(null);
    setResponseTime(null);
    setResponseStatus(null);

    const startTime = Date.now();

    try {
      let url = selectedEndpoint;
      
      try {
        const params = JSON.parse(parameters);
        if (Object.keys(params).length > 0 && params.address !== "0x...") {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value && value !== "0x...") {
              queryParams.append(key, String(value));
            }
          });
          const queryString = queryParams.toString();
          if (queryString) {
            url = `${selectedEndpoint}?${queryString}`;
          }
        }
      } catch (e) {
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setResponseStatus(res.status);

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      toast({
        title: t('stakingSdk.requestSuccess'),
        description: t('stakingSdk.requestSuccessDesc', { 
          status: res.status,
          time: endTime - startTime 
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-sdk-title">{t('stakingSdk.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('stakingSdk.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        <Card data-testid="card-quick-start">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingSdk.quickStart')}</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('stakingSdk.quickStartDesc')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-api-docs">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingSdk.apiReference')}</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('stakingSdk.apiReferenceDesc')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-examples">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingSdk.codeExamples')}</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('stakingSdk.codeExamplesDesc')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-support">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stakingSdk.support')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('stakingSdk.supportDesc')}
            </p>
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
                  {apiEndpoints.map((endpoint, i) => (
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
              <div className="mt-4 flex gap-2">
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
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                {t('stakingSdk.interactivePlayground')}
              </CardTitle>
              <CardDescription>
                {t('stakingSdk.playgroundDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('stakingSdk.endpoint')}</label>
                    <select 
                      className="w-full mt-1 p-2 rounded-md border bg-background"
                      value={selectedEndpoint}
                      onChange={(e) => setSelectedEndpoint(e.target.value)}
                      data-testid="select-endpoint"
                    >
                      {playgroundEndpoints.map((ep) => (
                        <option key={ep.value} value={ep.value}>{ep.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('stakingSdk.parametersJson')}</label>
                    <textarea 
                      className="w-full mt-1 p-2 rounded-md border bg-background font-mono text-sm h-32"
                      placeholder='{"address": "0x..."}'
                      value={parameters}
                      onChange={(e) => setParameters(e.target.value)}
                      data-testid="input-parameters"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    data-testid="button-execute"
                    onClick={handleExecuteRequest}
                    disabled={isExecuting}
                  >
                    {isExecuting ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        {t('stakingSdk.executing')}
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
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
                          {responseStatus}
                        </Badge>
                      )}
                      {responseTime !== null && (
                        <Badge variant="outline" className="text-xs">
                          {responseTime}ms
                        </Badge>
                      )}
                      {response && (
                        <Button variant="ghost" size="sm" onClick={handleCopyResponse}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64 rounded-lg bg-muted">
                    <pre className="p-4">
                      <code className={`text-sm font-mono ${response ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {response || `// ${t('stakingSdk.responseWillAppear')}`}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
