import { useState } from "react";
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
    description: "Get all staking pools",
    params: "?type=public|private&tier=bronze|silver|gold|platinum|diamond"
  },
  {
    method: "GET",
    endpoint: "/api/staking/pools/:id",
    description: "Get a specific staking pool by ID",
    params: ""
  },
  {
    method: "GET",
    endpoint: "/api/staking/positions",
    description: "Get staking positions",
    params: "?address=0x...&poolId=..."
  },
  {
    method: "GET",
    endpoint: "/api/staking/delegations",
    description: "Get staking delegations",
    params: "?address=0x...&validatorId=..."
  },
  {
    method: "GET",
    endpoint: "/api/staking/unbonding",
    description: "Get unbonding requests",
    params: "?address=0x..."
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/current",
    description: "Get current reward cycle",
    params: ""
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/cycles",
    description: "Get reward cycle history",
    params: "?limit=50"
  },
  {
    method: "GET",
    endpoint: "/api/staking/rewards/events",
    description: "Get reward events",
    params: "?address=0x...&cycleId=...&limit=100"
  },
  {
    method: "GET",
    endpoint: "/api/staking/slashing",
    description: "Get slashing events",
    params: "?validatorId=...&limit=50"
  },
  {
    method: "GET",
    endpoint: "/api/staking/tiers",
    description: "Get tier configuration",
    params: ""
  },
  {
    method: "GET",
    endpoint: "/api/staking/stats",
    description: "Get staking statistics",
    params: ""
  }
];

export default function StakingSDK() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    toast({
      title: "Copied",
      description: "Code copied to clipboard"
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-sdk-title">Wallet SDK & Development Tools</h1>
          <p className="text-muted-foreground mt-1">
            Integrate TBURN staking into your application with our SDK
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            v2.1.0
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-npm">
            <ExternalLink className="h-4 w-4 mr-1" />
            NPM
          </Button>
          <Button variant="outline" size="sm" data-testid="button-github">
            <GitBranch className="h-4 w-4 mr-1" />
            GitHub
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-quick-start">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Start</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get started in minutes with our step-by-step guide
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-api-docs">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Reference</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete API documentation with examples
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-examples">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Examples</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ready-to-use code snippets for common operations
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-support">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              24/7 developer support and community
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sdk" className="space-y-4">
        <TabsList data-testid="tabs-sdk">
          <TabsTrigger value="sdk" data-testid="tab-sdk">SDK Guide</TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">REST API</TabsTrigger>
          <TabsTrigger value="playground" data-testid="tab-playground">Playground</TabsTrigger>
        </TabsList>

        <TabsContent value="sdk" className="space-y-6">
          <Card data-testid="card-installation">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <CardTitle>Installation</CardTitle>
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
                  <CardTitle>Initialization</CardTitle>
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
                    <CardTitle className="text-base">Get Staking Pools</CardTitle>
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
                    <CardTitle className="text-base">Stake TBURN</CardTitle>
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
                    <CardTitle className="text-base">Unstake & Unbonding</CardTitle>
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
                    <CardTitle className="text-base">Rewards Management</CardTitle>
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
                  <CardTitle>Delegation Management</CardTitle>
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
                    <CardTitle className="text-base">Event Subscriptions</CardTitle>
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
                    <CardTitle className="text-base">Utility Functions</CardTitle>
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
                REST API Endpoints
              </CardTitle>
              <CardDescription>
                Direct API access for staking operations
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
                        <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
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
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Include your API key in the request header for authenticated endpoints:
              </p>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                <code className="text-sm font-mono">{`curl -X GET "https://api.tburn.network/api/staking/pools" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
              </pre>
              <div className="flex gap-2">
                <Button variant="outline" data-testid="button-get-api-key">
                  <Key className="h-4 w-4 mr-2" />
                  Get API Key
                </Button>
                <Button variant="outline" data-testid="button-view-docs">
                  <Book className="h-4 w-4 mr-2" />
                  Full Documentation
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
                Interactive Playground
              </CardTitle>
              <CardDescription>
                Test API calls directly from your browser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Endpoint</label>
                    <select className="w-full mt-2 px-3 py-2 border rounded-md bg-background" data-testid="select-endpoint">
                      {apiEndpoints.map((endpoint, i) => (
                        <option key={i} value={endpoint.endpoint}>
                          {endpoint.method} {endpoint.endpoint}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Parameters (JSON)</label>
                    <textarea 
                      className="w-full mt-2 px-3 py-2 border rounded-md bg-background font-mono text-sm h-32"
                      placeholder='{ "address": "0x..." }'
                      data-testid="textarea-params"
                    />
                  </div>

                  <Button className="w-full" data-testid="button-execute">
                    <Rocket className="h-4 w-4 mr-2" />
                    Execute Request
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Response</label>
                  <div className="p-4 rounded-lg bg-muted h-64 overflow-auto font-mono text-sm" data-testid="response-area">
                    <pre>{`{
  "status": "success",
  "data": {
    "pools": [
      {
        "id": "pool-gold-001",
        "name": "Gold Tier Pool",
        "tier": "gold",
        "apy": 15.5,
        "totalStaked": "1000000000000000000000000",
        "status": "active"
      }
    ]
  }
}`}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
