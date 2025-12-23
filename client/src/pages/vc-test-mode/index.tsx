import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  ChartBar,
  Coins,
  Users,
  Server,
  Brain,
  ArrowRight,
  Play,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Target,
  Rocket,
  BarChart3,
  PieChart,
  Activity,
  Lock,
  Cpu,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const VC_DEMO_WALLET = {
  address: '0xVC7979...Demo8888',
  fullAddress: '0xVC7979DemoWallet1234567890TBURN8888',
  balance: {
    TBURN: 1000000,
    ETH: 10,
    USDT: 50000
  }
};

// Static metrics (will be overridden by real-time data where applicable)
const STATIC_METRICS = {
  totalSupply: '10,000,000,000 TBURN',
  circulatingSupply: '6,940,000,000 TBURN',
  totalBurned: '3,060,000,000 TBURN',
  burnRate: '70%',
  blockTime: '0.5s',
  marketCap: '$2.1B',
  tvl: '$890M',
  dailyVolume: '$125M',
  activeWallets: '1.2M+'
};

// Hook to get real-time platform metrics from unified TPS source
function usePlatformMetrics() {
  const { data: networkStats } = useQuery<any>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  return useMemo(() => ({
    ...STATIC_METRICS,
    validators: networkStats?.activeValidators || 125,
    shards: networkStats?.shardCount || 64,
    tps: networkStats?.tps ? `${Math.floor(networkStats.tps / 1000)}K+` : '210K+',
    peakTps: networkStats?.peakTps ? `${Math.floor(networkStats.peakTps / 1000)}K+` : '250K+',
  }), [networkStats]);
}

const FEATURE_CATEGORIES = [
  {
    id: 'defi',
    title: 'DeFi Suite',
    icon: Coins,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    features: [
      { name: 'DEX Trading', path: '/app/dex', desc: 'AMM-based decentralized exchange' },
      { name: 'Lending Protocol', path: '/app/lending', desc: 'Overcollateralized lending' },
      { name: 'Yield Farming', path: '/app/yield', desc: 'Automated yield optimization' },
      { name: 'Liquid Staking', path: '/app/liquid-staking', desc: 'LST derivatives' }
    ]
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    icon: Server,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    features: [
      { name: 'Staking', path: '/app/staking', desc: 'Validator staking rewards' },
      { name: 'Bridge', path: '/app/bridge', desc: 'Cross-chain transfers' },
      { name: 'Token System', path: '/app/token-system', desc: 'TBC-20/721/1155 tokens' },
      { name: 'Sharding', path: '/app/sharding', desc: 'Dynamic AI sharding' }
    ]
  },
  {
    id: 'ecosystem',
    title: 'Ecosystem',
    icon: Globe,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    features: [
      { name: 'NFT Marketplace', path: '/app/nft-marketplace', desc: 'Digital collectibles' },
      { name: 'Launchpad', path: '/app/launchpad', desc: 'IDO platform' },
      { name: 'GameFi Hub', path: '/app/gamefi', desc: 'Play-to-earn games' },
      { name: 'Governance', path: '/app/governance', desc: 'DAO voting' }
    ]
  },
  {
    id: 'network',
    title: 'Network',
    icon: Activity,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    features: [
      { name: 'Block Explorer', path: '/app/explorer', desc: 'Transaction explorer' },
      { name: 'Validators', path: '/network/validators', desc: 'Validator dashboard' },
      { name: 'Consensus', path: '/network/consensus', desc: 'BFT visualization' },
      { name: 'Analytics', path: '/app/analytics', desc: 'Network metrics' }
    ]
  }
];

const INVESTMENT_HIGHLIGHTS = [
  {
    icon: Target,
    title: 'Market Opportunity',
    value: '$500B+',
    desc: 'DeFi market by 2027'
  },
  {
    icon: Rocket,
    title: 'Growth Rate',
    value: '340%',
    desc: 'YoY user growth'
  },
  {
    icon: Shield,
    title: 'Security Score',
    value: 'A+',
    desc: 'CertiK audit rating'
  },
  {
    icon: Brain,
    title: 'AI Innovation',
    value: 'Quad-Band',
    desc: '4 AI models orchestrated'
  }
];

export default function VCTestMode() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [demoWallet, setDemoWallet] = useState(VC_DEMO_WALLET);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  
  // CRITICAL: Get real-time TPS from unified source (same as /admin/shards)
  const PLATFORM_METRICS = usePlatformMetrics();

  const copyAddress = () => {
    navigator.clipboard.writeText(demoWallet.fullAddress);
    setCopied(true);
    toast({
      title: t('vcTestMode.walletCopied', 'Wallet address copied'),
      description: demoWallet.fullAddress
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const resetDemoWallet = () => {
    setDemoWallet(VC_DEMO_WALLET);
    toast({
      title: t('vcTestMode.walletReset', 'Demo wallet reset'),
      description: t('vcTestMode.walletResetDesc', 'Your demo wallet has been reset to initial balance')
    });
  };

  const startTour = () => {
    setShowTour(true);
    setTourStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <Badge className="mb-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('vcTestMode.badge', 'VC Test Mode')}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t('vcTestMode.title', 'TBURN Platform')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  {t('vcTestMode.subtitle', 'Investment Test Environment')}
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-xl">
                {t('vcTestMode.description', 'Experience the full capabilities of TBURN Mainnet with a pre-funded demo wallet. Test all DeFi features, explore our AI orchestration, and evaluate our technology.')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg" 
                  onClick={startTour}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  data-testid="button-start-tour"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t('vcTestMode.startTour', 'Start Guided Tour')}
                </Button>
                <Link href="/app">
                  <Button size="lg" variant="outline" data-testid="button-explore-platform">
                    {t('vcTestMode.explorePlatform', 'Explore Platform')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Demo Wallet Card */}
            <Card className="w-full lg:w-96 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-purple-400" />
                    {t('vcTestMode.demoWallet', 'Demo Wallet')}
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={resetDemoWallet}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                    data-testid="button-reset-wallet"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div 
                  className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/15 transition"
                  onClick={copyAddress}
                  data-testid="button-copy-address"
                >
                  <code className="text-sm text-gray-300 flex-1 truncate">{demoWallet.address}</code>
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">TB</div>
                      <span className="text-gray-300">TBURN</span>
                    </div>
                    <span className="font-mono font-bold">{demoWallet.balance.TBURN.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">ETH</div>
                      <span className="text-gray-300">ETH</span>
                    </div>
                    <span className="font-mono font-bold">{demoWallet.balance.ETH.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold">$</div>
                      <span className="text-gray-300">USDT</span>
                    </div>
                    <span className="font-mono font-bold">${demoWallet.balance.USDT.toLocaleString()}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-gray-400 text-center">
                    {t('vcTestMode.testFunds', 'Test funds for platform evaluation. No real value.')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INVESTMENT_HIGHLIGHTS.map((item, idx) => (
            <Card key={idx} className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10" data-testid={`metric-highlight-${idx}`}>
              <CardContent className="p-4 text-center">
                <item.icon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-gray-100 dark:bg-white/5">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('vcTestMode.tabs.overview', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="features" data-testid="tab-features">
              <Layers className="w-4 h-4 mr-2" />
              {t('vcTestMode.tabs.features', 'Features')}
            </TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">
              <PieChart className="w-4 h-4 mr-2" />
              {t('vcTestMode.tabs.metrics', 'Metrics')}
            </TabsTrigger>
            <TabsTrigger value="tech" data-testid="tab-tech">
              <Cpu className="w-4 h-4 mr-2" />
              {t('vcTestMode.tabs.tech', 'Technology')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar className="w-5 h-5 text-blue-500" />
                    {t('vcTestMode.quickStats', 'Quick Stats')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.marketCap', 'Market Cap')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.marketCap}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.tvl', 'Total Value Locked')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.tvl}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.dailyVolume', 'Daily Volume')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.dailyVolume}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.activeWallets', 'Active Wallets')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.activeWallets}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tokenomics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-orange-500" />
                    {t('vcTestMode.tokenomics', 'Tokenomics')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.totalSupply', 'Total Supply')}</span>
                      <span className="text-gray-900 dark:text-white">10B</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.circulating', 'Circulating')}</span>
                      <span className="text-gray-900 dark:text-white">6.94B (69.4%)</span>
                    </div>
                    <Progress value={69.4} className="h-2 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.burned', 'Burned')}</span>
                      <span className="text-red-500">3.06B (30.6%)</span>
                    </div>
                    <Progress value={30.6} className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-red-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Network Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    {t('vcTestMode.networkStatus', 'Network Status')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.stats.status', 'Status')}</span>
                    <Badge className="bg-green-500">{t('vcTestMode.stats.operational', 'Operational')}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.validators', 'Validators')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.validators}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.shards', 'Active Shards')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.shards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.tps', 'TPS')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.tps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.stats.blockTime', 'Block Time')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.blockTime}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {FEATURE_CATEGORIES.map((category) => (
                <Card key={category.id} data-testid={`feature-card-${category.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${category.bgColor}`}>
                        <category.icon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {category.features.map((feature, idx) => (
                      <Link key={idx} href={feature.path}>
                        <div 
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer group"
                          data-testid={`feature-link-${category.id}-${idx}`}
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{feature.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t('vcTestMode.growthMetrics', 'Growth Metrics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">340%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.metrics.userGrowth', 'YoY User Growth')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">$890M</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.metrics.tvl', 'Total Value Locked')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">1.2M+</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.metrics.activeUsers', 'Monthly Active Users')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">125</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.metrics.validators', 'Active Validators')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('vcTestMode.competitiveEdge', 'Competitive Edge')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.edge.aiOrchestration', 'Quad-Band AI Orchestration')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.edge.dynamicSharding', 'Dynamic AI Sharding')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.edge.quantumResistant', 'Quantum-Resistant Signatures')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.edge.deflationary', 'AI-Driven Deflation (70%)')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.edge.crossChain', 'Cross-Chain Bridge')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technology Tab */}
          <TabsContent value="tech" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    {t('vcTestMode.aiSystem', 'Quad-Band AI System')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <div className="font-medium text-purple-600 dark:text-purple-400">Gemini 3 Pro</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.ai.primary', 'Primary - Network optimization')}</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="font-medium text-blue-600 dark:text-blue-400">Claude Sonnet 4.5</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.ai.analysis', 'Analysis - Smart contract audit')}</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="font-medium text-green-600 dark:text-green-400">GPT-4o</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.ai.prediction', 'Prediction - Market analytics')}</div>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <div className="font-medium text-orange-600 dark:text-orange-400">Grok 3</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.ai.fallback', 'Fallback - Redundancy layer')}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    {t('vcTestMode.security', 'Security Architecture')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.sec.consensus', 'Consensus')}</span>
                    <Badge>BFT + PoS</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.sec.signatures', 'Signatures')}</span>
                    <Badge>Quantum-Resistant</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.sec.audit', 'Audit Status')}</span>
                    <Badge className="bg-green-500">CertiK A+</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{t('vcTestMode.sec.insurance', 'Insurance Fund')}</span>
                    <Badge>$50M</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    {t('vcTestMode.techStack', 'Technology Stack')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                      <div className="font-bold text-gray-900 dark:text-white">Layer 1</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.stack.blockchain', 'Independent Blockchain')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                      <div className="font-bold text-gray-900 dark:text-white">{PLATFORM_METRICS.tps} TPS (Peak {PLATFORM_METRICS.peakTps})</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.stack.throughput', 'Transaction Throughput')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                      <div className="font-bold text-gray-900 dark:text-white">0.5s</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.stack.finality', 'Block Finality')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                      <div className="font-bold text-gray-900 dark:text-white">$0.00026</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.stack.gasFee', 'Average Gas Fee')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Access Links */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {t('vcTestMode.quickAccess', 'Quick Access')}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/app/dex">
              <Button variant="outline" data-testid="quick-link-dex">
                <Coins className="w-4 h-4 mr-2" />
                DEX
              </Button>
            </Link>
            <Link href="/app/staking">
              <Button variant="outline" data-testid="quick-link-staking">
                <Lock className="w-4 h-4 mr-2" />
                Staking
              </Button>
            </Link>
            <Link href="/app/bridge">
              <Button variant="outline" data-testid="quick-link-bridge">
                <Globe className="w-4 h-4 mr-2" />
                Bridge
              </Button>
            </Link>
            <Link href="/app/governance">
              <Button variant="outline" data-testid="quick-link-governance">
                <Users className="w-4 h-4 mr-2" />
                Governance
              </Button>
            </Link>
            <Link href="/network/validators">
              <Button variant="outline" data-testid="quick-link-validators">
                <Server className="w-4 h-4 mr-2" />
                Validators
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" data-testid="quick-link-admin">
                <Shield className="w-4 h-4 mr-2" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
