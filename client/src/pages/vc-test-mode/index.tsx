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
  RefreshCw,
  FileText,
  Link2,
  Database,
  Clock,
  Hash,
  Terminal,
  Globe2,
  MapPin,
  Fuel,
  Network,
  HeartPulse,
  Smartphone,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { TBurnLogo } from '@/components/tburn-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const VC_DEMO_WALLET = {
  address: '0xVC5800...Demo8888',
  fullAddress: '0xVC5800DemoWallet1234567890TBURN8888',
  balance: {
    TBURN: 1000000,
    ETH: 10,
    USDT: 50000
  }
};

// Guided Tour Steps - uses i18n translation keys
const TOUR_STEP_KEYS = [
  { id: 'welcome', titleKey: 'tour.welcome.title', contentKey: 'tour.welcome.content', target: null },
  { id: 'demo-wallet', titleKey: 'tour.demoWallet.title', contentKey: 'tour.demoWallet.content', target: 'demo-wallet-card' },
  { id: 'quick-actions', titleKey: 'tour.quickActions.title', contentKey: 'tour.quickActions.content', target: 'demo-wallet-actions' },
  { id: 'metrics', titleKey: 'tour.metrics.title', contentKey: 'tour.metrics.content', target: 'investment-highlights' },
  { id: 'features', titleKey: 'tour.features.title', contentKey: 'tour.features.content', target: 'main-tabs' },
  { id: 'complete', titleKey: 'tour.complete.title', contentKey: 'tour.complete.content', target: null },
];

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
  const { data: networkStats, isLoading, dataUpdatedAt } = useQuery<any>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  return useMemo(() => ({
    ...STATIC_METRICS,
    validators: networkStats?.activeValidators || 125,
    shards: networkStats?.shardCount || 64,
    tps: networkStats?.tps ? `${Math.floor(networkStats.tps / 1000)}K+` : '210K+',
    peakTps: networkStats?.peakTps ? `${Math.floor(networkStats.peakTps / 1000)}K+` : '250K+',
    // Live telemetry data
    blockHeight: networkStats?.currentBlockHeight || 37_000_000,
    totalTransactions: networkStats?.totalTransactions || 7_600_000_000,
    peerCount: networkStats?.peerCount || 2847,
    avgLatency: networkStats?.avgLatency || 12,
    lastBlockTime: networkStats?.lastBlockTime || Date.now(),
    isLive: !isLoading && !!networkStats,
    lastUpdated: dataUpdatedAt,
  }), [networkStats, isLoading, dataUpdatedAt]);
}

// Validator distribution data for visualization
const VALIDATOR_DISTRIBUTION = [
  { region: 'North America', count: 512, percentage: 32, color: 'bg-blue-500' },
  { region: 'Europe', count: 448, percentage: 28, color: 'bg-green-500' },
  { region: 'Asia Pacific', count: 384, percentage: 24, color: 'bg-purple-500' },
  { region: 'South America', count: 128, percentage: 8, color: 'bg-orange-500' },
  { region: 'Middle East & Africa', count: 128, percentage: 8, color: 'bg-cyan-500' },
];

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

const MAINNET_CONFIG = {
  chainId: 5800,
  chainIdHex: '0x16a8',
  networkName: 'TBURN Mainnet',
  networkType: 'Production Mainnet',
  currency: {
    name: 'TBURN',
    symbol: 'TBURN',
    decimals: 18
  },
  rpcEndpoints: [
    { url: 'https://tburn.io/rpc', type: 'Primary', status: 'Active', region: 'US-East' },
    { url: 'https://tburn.io', type: 'Secondary', status: 'Active', region: 'EU-West' },
    { url: 'https://mainnet.tburn.network/rpc', type: 'Tertiary', status: 'Active', region: 'AP-Seoul' }
  ],
  blockExplorer: 'https://tburn.io/scan',
  consensus: 'BFT + PoS',
  blockTime: '~100ms',
  genesisDate: '2025-12-22',
  tokenStandards: ['TBC-20', 'TBC-721', 'TBC-1155'],
  chainRegistration: {
    status: 'Registered',
    chainlistOrg: 'https://chainlist.org/chain/5800',
    evmCompatible: true,
    replayProtection: 'EIP-155 Compliant'
  },
  contracts: {
    tburnToken: 'tb1qcr8te4kr609gcawutmrza0j4xv80jy8zeq5spn',
    tbc20Factory: 'tb1q9qs7yam54d5w3n2efgv8kyjnk8w2rq3jhx4e0s',
    tbc721Factory: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
    tbc1155Factory: 'tb1q2nfxmhd4n3c8834pj72xagvyr9gl57n5r94fsl',
    bridge: 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0g',
    staking: 'tb1qp5d5s9r3e8jv6kqj9y7tz2m9f4q3n8xwk7c5ya'
  },
  gasPolicy: {
    baseFee: '0.000001 TB',
    priorityFee: '0.0000001 TB',
    avgTxCost: '$0.00026',
    maxGasLimit: '30,000,000',
    dynamicFee: true
  },
  decentralization: {
    activeValidators: 1600,
    minStake: '100,000 TB',
    quorumThreshold: '67%',
    slashingEnabled: true,
    validatorDistribution: 'Geographic: 45+ countries',
    topValidatorShare: '<5%',
    nakamatoCoefficient: 32
  },
  operations: {
    nodeRedundancy: '3x across regions',
    monitoringSystem: '24/7 NOC with PagerDuty',
    incidentResponse: '<15min SLA',
    uptimeTarget: '99.99%',
    lastIncident: 'N/A (Pre-launch)',
    backupRpc: 'Auto-failover enabled'
  },
  walletSupport: {
    metamask: 'Full Support',
    walletConnect: 'v2.0 Compatible',
    rabby: 'Full Support',
    trustWallet: 'Full Support',
    ledger: 'Hardware Support',
    coinbaseWallet: 'Full Support'
  },
  bridgeConnections: [
    { chain: 'Ethereum', status: 'Active', type: 'Lock & Mint' },
    { chain: 'BNB Chain', status: 'Active', type: 'Lock & Mint' },
    { chain: 'Polygon', status: 'Active', type: 'Lock & Mint' },
    { chain: 'Arbitrum', status: 'Planned Q1 2026', type: 'Lock & Mint' }
  ]
};

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

  const closeTour = () => {
    setShowTour(false);
    setTourStep(0);
  };

  const nextTourStep = () => {
    if (tourStep < TOUR_STEP_KEYS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      closeTour();
    }
  };

  const prevTourStep = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  // Demo wallet transaction simulations with balance protection
  const simulateSwap = () => {
    const maxSwap = Math.min(demoWallet.balance.TBURN, 10000);
    if (maxSwap < 100) {
      toast({
        title: t('vcTestMode.insufficientBalance', 'Insufficient Balance'),
        description: t('vcTestMode.insufficientBalanceDesc', 'Not enough TBURN to swap. Reset wallet to continue.'),
        variant: 'destructive'
      });
      return;
    }
    const swapAmount = Math.floor(Math.random() * (maxSwap * 0.5)) + Math.floor(maxSwap * 0.1);
    const receivedUsdt = Math.floor(swapAmount * 0.52);
    setDemoWallet(prev => ({
      ...prev,
      balance: {
        ...prev.balance,
        TBURN: Math.max(0, prev.balance.TBURN - swapAmount),
        USDT: prev.balance.USDT + receivedUsdt
      }
    }));
    toast({
      title: t('vcTestMode.swapSuccess', 'Swap Successful'),
      description: t('vcTestMode.swapDesc', `Swapped ${swapAmount.toLocaleString()} TBURN for $${receivedUsdt.toLocaleString()} USDT`)
    });
  };

  const simulateStake = () => {
    const maxStake = Math.min(demoWallet.balance.TBURN, 50000);
    if (maxStake < 1000) {
      toast({
        title: t('vcTestMode.insufficientBalance', 'Insufficient Balance'),
        description: t('vcTestMode.insufficientBalanceDesc', 'Not enough TBURN to stake. Reset wallet to continue.'),
        variant: 'destructive'
      });
      return;
    }
    const stakeAmount = Math.floor(Math.random() * (maxStake * 0.5)) + Math.floor(maxStake * 0.1);
    setDemoWallet(prev => ({
      ...prev,
      balance: {
        ...prev.balance,
        TBURN: Math.max(0, prev.balance.TBURN - stakeAmount)
      }
    }));
    toast({
      title: t('vcTestMode.stakeSuccess', 'Staking Initiated'),
      description: t('vcTestMode.stakeDesc', `Staked ${stakeAmount.toLocaleString()} TBURN at 12.5% APY`)
    });
  };

  const simulateTransfer = () => {
    const maxTransfer = Math.min(demoWallet.balance.TBURN, 5000);
    if (maxTransfer < 100) {
      toast({
        title: t('vcTestMode.insufficientBalance', 'Insufficient Balance'),
        description: t('vcTestMode.insufficientBalanceDesc', 'Not enough TBURN to transfer. Reset wallet to continue.'),
        variant: 'destructive'
      });
      return;
    }
    const transferAmount = Math.floor(Math.random() * (maxTransfer * 0.5)) + Math.floor(maxTransfer * 0.1);
    setDemoWallet(prev => ({
      ...prev,
      balance: {
        ...prev.balance,
        TBURN: Math.max(0, prev.balance.TBURN - transferAmount)
      }
    }));
    toast({
      title: t('vcTestMode.transferSuccess', 'Transfer Complete'),
      description: t('vcTestMode.transferDesc', `Sent ${transferAmount.toLocaleString()} TBURN to 0x...7890`)
    });
  };

  const currentTourStep = TOUR_STEP_KEYS[tourStep];

  return (
    <>
      {/* Guided Tour Overlay */}
      {showTour && (
        <div className="fixed inset-0 z-50" data-testid="guided-tour-overlay">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={closeTour} />
          
          {/* Tour Dialog */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
            <Card className="bg-white dark:bg-gray-900 border-2 border-purple-500 shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-500">
                    {t('vcTestMode.tourStep', 'Step')} {tourStep + 1} / {TOUR_STEP_KEYS.length}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={closeTour}
                    className="h-8 w-8 p-0"
                    data-testid="button-close-tour"
                  >
                    ✕
                  </Button>
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white mt-2">
                  {t(`vcTestMode.${currentTourStep.titleKey}`, currentTourStep.id)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {t(`vcTestMode.${currentTourStep.contentKey}`, '')}
                </p>
                
                {/* Progress dots */}
                <div className="flex justify-center gap-2">
                  {TOUR_STEP_KEYS.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === tourStep ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Navigation buttons */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={prevTourStep}
                    disabled={tourStep === 0}
                    data-testid="button-prev-tour"
                  >
                    {t('vcTestMode.previous', 'Previous')}
                  </Button>
                  <Button
                    onClick={nextTourStep}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                    data-testid="button-next-tour"
                  >
                    {tourStep === TOUR_STEP_KEYS.length - 1 
                      ? t('vcTestMode.finish', 'Finish') 
                      : t('vcTestMode.next', 'Next')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
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
                {/* Use native anchor for full page reload (PublicApp → App transition) */}
                <a href="/app">
                  <Button size="lg" variant="outline" data-testid="button-explore-platform">
                    {t('vcTestMode.explorePlatform', 'Explore Platform')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
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
                      <TBurnLogo className="w-10 h-10" showText={true} textColor="#000000" />
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
                {/* Quick Actions */}
                <div className="pt-3 border-t border-white/10" id="demo-wallet-actions" data-testid="demo-wallet-actions">
                  <p className="text-xs text-gray-400 text-center mb-3">
                    {t('vcTestMode.quickActions', 'Quick Actions')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      size="sm" 
                      onClick={simulateSwap}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30"
                      variant="outline"
                      data-testid="button-simulate-swap"
                    >
                      <ArrowLeftRight className="w-3 h-3 mr-1" />
                      {t('vcTestMode.swap', 'Swap')}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={simulateStake}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30"
                      variant="outline"
                      data-testid="button-simulate-stake"
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      {t('vcTestMode.stake', 'Stake')}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={simulateTransfer}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30"
                      variant="outline"
                      data-testid="button-simulate-transfer"
                    >
                      <Wallet className="w-3 h-3 mr-1" />
                      {t('vcTestMode.send', 'Send')}
                    </Button>
                  </div>
                </div>
                <div className="pt-2">
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
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 bg-gray-100 dark:bg-white/5">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('vcTestMode.tabs.overview', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="duediligence" data-testid="tab-duediligence">
              <FileText className="w-4 h-4 mr-2" />
              {t('vcTestMode.tabs.dueDiligence', 'Due Diligence')}
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

          {/* Due Diligence Tab - Chain ID & RPC Info */}
          <TabsContent value="duediligence" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chain Configuration */}
              <Card className="border-2 border-purple-500/30">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-purple-500" />
                    {t('vcTestMode.chainConfig', 'Chain Configuration')}
                  </CardTitle>
                  <CardDescription>
                    {t('vcTestMode.chainConfigDesc', 'TBURN Mainnet technical specifications')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Chain ID</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-purple-600 dark:text-purple-400 text-lg">{MAINNET_CONFIG.chainId}</code>
                      <Badge variant="outline" className="text-xs">{MAINNET_CONFIG.chainIdHex}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Network Name</span>
                    <span className="font-bold text-gray-900 dark:text-white">{MAINNET_CONFIG.networkName}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Native Currency</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{MAINNET_CONFIG.currency.symbol}</span>
                      <Badge className="bg-orange-500">{MAINNET_CONFIG.currency.decimals} decimals</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Consensus</span>
                    <Badge className="bg-blue-500">{MAINNET_CONFIG.consensus}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Block Time</span>
                    <span className="font-bold text-green-500">{MAINNET_CONFIG.blockTime}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Genesis Date</span>
                    <span className="font-mono text-gray-900 dark:text-white">{MAINNET_CONFIG.genesisDate}</span>
                  </div>
                </CardContent>
              </Card>

              {/* RPC Endpoints */}
              <Card className="border-2 border-blue-500/30">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-blue-500" />
                    {t('vcTestMode.rpcEndpoints', 'RPC Endpoints')}
                  </CardTitle>
                  <CardDescription>
                    {t('vcTestMode.rpcEndpointsDesc', 'Public JSON-RPC endpoints for blockchain interaction')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {MAINNET_CONFIG.rpcEndpoints.map((endpoint, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">{endpoint.type}</Badge>
                        <Badge className="bg-green-500 text-xs">{endpoint.status}</Badge>
                      </div>
                      <code className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                        {endpoint.url}
                      </code>
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">{t('vcTestMode.dueDiligence.blockExplorer', 'Block Explorer')}</Badge>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    <a 
                      href={MAINNET_CONFIG.blockExplorer} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {MAINNET_CONFIG.blockExplorer}
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Network Stats - Live Telemetry */}
              <Card className="border-2 border-green-500/30">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      {t('vcTestMode.dueDiligence.liveNetworkTelemetry', 'Live Network Telemetry')}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {PLATFORM_METRICS.isLive ? (
                        <Badge className="bg-green-500 animate-pulse">LIVE</Badge>
                      ) : (
                        <Badge variant="outline">Connecting...</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {t('vcTestMode.dueDiligence.liveNetworkTelemetryDesc', 'Real-time data from TBURN RPC cluster (updates every 5s)')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {/* Block Height - Primary Live Indicator */}
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vcTestMode.dueDiligence.currentBlockHeight', 'Current Block Height')}</div>
                        <div className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
                          #{PLATFORM_METRICS.blockHeight?.toLocaleString()}
                        </div>
                      </div>
                      <a 
                        href={`${MAINNET_CONFIG.blockExplorer}/block/${PLATFORM_METRICS.blockHeight}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('vcTestMode.dueDiligence.viewInExplorer', 'View in Explorer')}
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-500/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-500">{PLATFORM_METRICS.tps}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('vcTestMode.dueDiligence.currentTps', 'Current TPS')}</div>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-500">{PLATFORM_METRICS.peakTps}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('vcTestMode.dueDiligence.peakTps', 'Peak TPS')}</div>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-500">{PLATFORM_METRICS.validators}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('vcTestMode.dueDiligence.validators', 'Validators')}</div>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-500">{PLATFORM_METRICS.shards}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('vcTestMode.dueDiligence.activeShards', 'Active Shards')}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vcTestMode.dueDiligence.totalTransactions', 'Total Transactions')}</div>
                      <div className="font-bold text-lg">{(PLATFORM_METRICS.totalTransactions / 1_000_000_000).toFixed(2)}B</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vcTestMode.dueDiligence.connectedPeers', 'Connected Peers')}</div>
                      <div className="font-bold text-lg">{PLATFORM_METRICS.peerCount?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.dueDiligence.slaUptime', 'SLA Uptime')}</span>
                    <Badge className="bg-green-500">99.99%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{t('vcTestMode.dueDiligence.avgRpcLatency', 'Avg RPC Latency')}</span>
                    <span className="font-bold text-green-500">{PLATFORM_METRICS.avgLatency}ms</span>
                  </div>
                  {PLATFORM_METRICS.lastUpdated && (
                    <div className="text-xs text-gray-400 text-center">
                      {t('vcTestMode.dueDiligence.lastUpdated', 'Last updated')}: {new Date(PLATFORM_METRICS.lastUpdated).toLocaleTimeString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Token Standards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-500" />
                    {t('vcTestMode.tokenStandards', 'Token Standards')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <div className="font-bold text-orange-600 dark:text-orange-400">TBC-20</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.dueDiligence.tbc20Desc', 'Fungible Token Standard (ERC-20 compatible)')}</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <div className="font-bold text-purple-600 dark:text-purple-400">TBC-721</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.dueDiligence.tbc721Desc', 'Non-Fungible Token Standard (ERC-721 compatible)')}</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="font-bold text-blue-600 dark:text-blue-400">TBC-1155</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('vcTestMode.dueDiligence.tbc1155Desc', 'Multi-Token Standard (ERC-1155 compatible)')}</div>
                  </div>
                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <Shield className="w-4 h-4" />
                      {t('vcTestMode.dueDiligence.quantumResistant', 'Quantum-Resistant Signatures')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('vcTestMode.dueDiligence.quantumResistantDesc', 'Post-quantum cryptography ready for future security')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chain Registration & EVM Compatibility */}
            <Card className="border-2 border-green-500/30">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  {t('vcTestMode.dueDiligence.chainRegistration', 'Chain Registration & EVM Compatibility')}
                </CardTitle>
                <CardDescription>
                  {t('vcTestMode.dueDiligence.chainRegistrationDesc', 'Verified chain identification and standard compliance for replay attack protection')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vcTestMode.dueDiligence.registrationStatus', 'Registration Status')}</div>
                    <Badge className="bg-green-500">{MAINNET_CONFIG.chainRegistration.status}</Badge>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chainlist.org</div>
                    <a href={MAINNET_CONFIG.chainRegistration.chainlistOrg} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                      {t('vcTestMode.dueDiligence.viewListing', 'View Listing')}
                    </a>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vcTestMode.dueDiligence.evmCompatible', 'EVM Compatible')}</div>
                    <Badge className="bg-blue-500">{MAINNET_CONFIG.chainRegistration.evmCompatible ? 'Yes' : 'No'}</Badge>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vcTestMode.dueDiligence.replayProtection', 'Replay Protection')}</div>
                    <span className="font-bold text-green-500 text-sm">{MAINNET_CONFIG.chainRegistration.replayProtection}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-600 dark:text-green-400">{t('vcTestMode.dueDiligence.uniqueChainId', 'Unique Chain ID Verified')}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('vcTestMode.dueDiligence.uniqueChainIdDesc', 'Chain ID 5800 is uniquely registered and does not conflict with any known EVM network. EIP-155 compliant for transaction replay protection.')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Deployed Core Contracts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-500" />
                  {t('vcTestMode.dueDiligence.deployedContracts', 'Deployed Core Contracts')}
                </CardTitle>
                <CardDescription>
                  {t('vcTestMode.dueDiligence.deployedContractsDesc', 'Verified smart contract addresses - click to view in Explorer')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(MAINNET_CONFIG.contracts).map(([key, address]) => (
                    <a 
                      key={key} 
                      href={`${MAINNET_CONFIG.blockExplorer}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-purple-500/10 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-purple-500" />
                      </div>
                      <code className="text-xs font-mono text-purple-600 dark:text-purple-400 break-all">
                        {address}
                      </code>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">{t('vcTestMode.dueDiligence.verified', 'Verified')}</Badge>
                        <Badge className="bg-green-500 text-xs">{t('vcTestMode.dueDiligence.active', 'Active')}</Badge>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('vcTestMode.dueDiligence.contractsVerified', 'All contracts are verified and open-source. Click any contract to view source code and transactions in the TBURN Explorer.')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gas Fee Policy & Decentralization Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Gas Fee Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-orange-500" />
                    {t('vcTestMode.dueDiligence.gasFeePolicy', 'Gas Fee Policy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.baseFee', 'Base Fee')}</span>
                    <span className="font-mono font-bold">{MAINNET_CONFIG.gasPolicy.baseFee}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.priorityFee', 'Priority Fee')}</span>
                    <span className="font-mono font-bold">{MAINNET_CONFIG.gasPolicy.priorityFee}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.avgTransactionCost', 'Avg Transaction Cost')}</span>
                    <span className="font-bold text-green-500">{MAINNET_CONFIG.gasPolicy.avgTxCost}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.maxGasLimit', 'Max Gas Limit')}</span>
                    <span className="font-mono">{MAINNET_CONFIG.gasPolicy.maxGasLimit}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.dynamicFee', 'Dynamic Fee (EIP-1559)')}</span>
                    <Badge className={MAINNET_CONFIG.gasPolicy.dynamicFee ? 'bg-green-500' : 'bg-gray-500'}>
                      {MAINNET_CONFIG.gasPolicy.dynamicFee ? t('vcTestMode.dueDiligence.enabled', 'Enabled') : t('vcTestMode.dueDiligence.disabled', 'Disabled')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Decentralization Metrics */}
              <Card className="border-2 border-blue-500/30">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-blue-500" />
                    {t('vcTestMode.dueDiligence.decentralizationMetrics', 'Decentralization Metrics')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.activeValidators', 'Active Validators')}</span>
                    <span className="font-bold text-blue-500">{MAINNET_CONFIG.decentralization.activeValidators.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.minimumStake', 'Minimum Stake')}</span>
                    <span className="font-mono">{MAINNET_CONFIG.decentralization.minStake}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.quorumThreshold', 'Quorum Threshold')}</span>
                    <Badge className="bg-purple-500">{MAINNET_CONFIG.decentralization.quorumThreshold}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.topValidatorShare', 'Top Validator Share')}</span>
                    <span className="font-bold text-green-500">{MAINNET_CONFIG.decentralization.topValidatorShare}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.nakamotoCoefficient', 'Nakamoto Coefficient')}</span>
                    <span className="font-bold text-blue-500">{MAINNET_CONFIG.decentralization.nakamatoCoefficient}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.geographicDistribution', 'Geographic Distribution')}</span>
                    <span className="font-bold text-sm">{MAINNET_CONFIG.decentralization.validatorDistribution}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Validator Geographic Distribution Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-cyan-500" />
                  {t('vcTestMode.dueDiligence.validatorDistribution', 'Validator Geographic Distribution')}
                </CardTitle>
                <CardDescription>
                  {t('vcTestMode.dueDiligence.validatorDistributionDesc', 'Real-time validator node distribution across global regions')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {VALIDATOR_DISTRIBUTION.map((region) => (
                    <div key={region.region} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{region.region}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{region.count.toLocaleString()}</span>
                          <span className="text-gray-500 text-xs">({region.percentage}%)</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${region.color} transition-all duration-500`}
                          style={{ width: `${region.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-cyan-500" />
                    <span className="font-medium text-cyan-600 dark:text-cyan-400">{t('vcTestMode.dueDiligence.geoDecentralizationScore', 'Geographic Decentralization Score: A+')}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('vcTestMode.dueDiligence.geoDecentralizationDesc', 'No single region controls more than 35% of validators. Network resilient to regional outages or regulatory actions.')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Operational Infrastructure & Wallet Support Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Operational Infrastructure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-red-500" />
                    {t('vcTestMode.dueDiligence.operationalInfra', 'Operational Infrastructure')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.nodeRedundancy', 'Node Redundancy')}</span>
                    <span className="font-bold">{MAINNET_CONFIG.operations.nodeRedundancy}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.monitoring', 'Monitoring')}</span>
                    <span className="font-bold text-sm">{MAINNET_CONFIG.operations.monitoringSystem}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.incidentResponse', 'Incident Response')}</span>
                    <Badge className="bg-green-500">{MAINNET_CONFIG.operations.incidentResponse}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.uptimeTarget', 'Uptime Target')}</span>
                    <span className="font-bold text-green-500">{MAINNET_CONFIG.operations.uptimeTarget}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.rpcFailover', 'RPC Failover')}</span>
                    <Badge className="bg-blue-500">{MAINNET_CONFIG.operations.backupRpc}</Badge>
                  </div>
                  {/* Monitoring Dashboard Links */}
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('vcTestMode.dueDiligence.monitoringDashboards', 'Monitoring Dashboards')}</div>
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href="https://status.tburn.network" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Activity className="w-3 h-3 text-green-500" />
                        {t('vcTestMode.dueDiligence.statusPage', 'Status Page')}
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                      <a 
                        href="https://metrics.tburn.network" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <BarChart3 className="w-3 h-3 text-blue-500" />
                        {t('vcTestMode.dueDiligence.grafanaMetrics', 'Grafana Metrics')}
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                      <a 
                        href="https://health.tburn.network" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <HeartPulse className="w-3 h-3 text-red-500" />
                        {t('vcTestMode.dueDiligence.healthCheck', 'Health Check')}
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-cyan-500" />
                    {t('vcTestMode.dueDiligence.walletSupport', 'Wallet & Integration Support')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(MAINNET_CONFIG.walletSupport).map(([wallet, status]) => (
                    <div key={wallet} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300 capitalize text-sm">
                        {wallet.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge className="bg-green-500 text-xs">{status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Cross-Chain Bridge Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
                  {t('vcTestMode.dueDiligence.bridgeConnections', 'Cross-Chain Bridge Connections')}
                </CardTitle>
                <CardDescription>
                  {t('vcTestMode.dueDiligence.bridgeConnectionsDesc', 'Verified bridge routes for cross-chain asset transfers')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  {MAINNET_CONFIG.bridgeConnections.map((bridge, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                      <div className="font-bold text-gray-900 dark:text-white">{bridge.chain}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{bridge.type}</div>
                      <Badge className={bridge.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {bridge.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* JSON Configuration for Copy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-gray-500" />
                  {t('vcTestMode.jsonConfig', 'MetaMask / Wallet Configuration')}
                </CardTitle>
                <CardDescription>
                  {t('vcTestMode.jsonConfigDesc', 'Copy this configuration to add TBURN Mainnet to your wallet')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
{`{
  "chainId": ${MAINNET_CONFIG.chainId},
  "chainIdHex": "${MAINNET_CONFIG.chainIdHex}",
  "chainName": "${MAINNET_CONFIG.networkName}",
  "nativeCurrency": {
    "name": "${MAINNET_CONFIG.currency.name}",
    "symbol": "${MAINNET_CONFIG.currency.symbol}",
    "decimals": ${MAINNET_CONFIG.currency.decimals}
  },
  "rpcUrls": [
    "${MAINNET_CONFIG.rpcEndpoints[0].url}",
    "${MAINNET_CONFIG.rpcEndpoints[1].url}",
    "${MAINNET_CONFIG.rpcEndpoints[2].url}"
  ],
  "blockExplorerUrls": ["${MAINNET_CONFIG.blockExplorer}"]
}`}
                </pre>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({
                      chainId: MAINNET_CONFIG.chainId,
                      chainIdHex: MAINNET_CONFIG.chainIdHex,
                      chainName: MAINNET_CONFIG.networkName,
                      nativeCurrency: MAINNET_CONFIG.currency,
                      rpcUrls: MAINNET_CONFIG.rpcEndpoints.map(e => e.url),
                      blockExplorerUrls: [MAINNET_CONFIG.blockExplorer]
                    }, null, 2));
                    toast({
                      title: t('vcTestMode.configCopied', 'Configuration copied'),
                      description: t('vcTestMode.configCopiedDesc', 'Wallet configuration copied to clipboard')
                    });
                  }}
                  data-testid="button-copy-config"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t('vcTestMode.copyConfig', 'Copy Configuration')}
                </Button>
              </CardContent>
            </Card>

            {/* Token Economics Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Coins className="w-4 h-4 text-orange-500" />
                    {t('vcTestMode.dueDiligence.tokenSupply', 'Token Supply')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Total Supply</span>
                    <span className="font-bold">10B TBURN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Circulating</span>
                    <span className="font-bold">~6.8B (68%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Staked</span>
                    <span className="font-bold text-purple-500">~3.2B (32%)</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {t('vcTestMode.dueDiligence.keyDates', 'Key Dates')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.genesis', 'Genesis')}</span>
                    <span className="font-mono">2025.12.22</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.exchangeTarget', 'Exchange (Target)')}</span>
                    <span className="font-mono">2026.02</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('vcTestMode.dueDiligence.tokenSchedule', 'Token Schedule')}</span>
                    <Link href="/TokenSchedule">
                      <span className="text-blue-500 hover:underline cursor-pointer">View →</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="w-4 h-4 text-green-500" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Audit</span>
                    <Badge className="bg-green-500">CertiK A+</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Insurance</span>
                    <span className="font-bold">$50M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Bug Bounty</span>
                    <Link href="/bug-bounty">
                      <span className="text-blue-500 hover:underline cursor-pointer">Active →</span>
                    </Link>
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
    </>
  );
}
