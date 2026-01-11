import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Shield, 
  Server, 
  Cpu, 
  Globe, 
  Coins, 
  Activity, 
  Users, 
  Award,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  Copy,
  RefreshCw,
  ChevronDown
} from "lucide-react";

interface ExternalValidatorStats {
  totalValidators: number;
  activeValidators: number;
  pendingValidators: number;
  totalStaked: string;
  totalRewardsDistributed: string;
  averageUptime: number;
  networkHealthScore: number;
  tierBreakdown: {
    genesis: number;
    pioneer: number;
    standard: number;
    community: number;
  };
  regionDistribution: Record<string, number>;
}

interface ValidatorTier {
  id: string;
  name: string;
  icon: string;
  minStake: number;
  maxValidators: number;
  currentValidators: number;
  commissionRange: string;
  estimatedApy: string;
  benefits: string[];
  badge: string;
  badgeClass: string;
}

const REGIONS = [
  { id: "us-east", name: "US East", flag: "🇺🇸" },
  { id: "us-west", name: "US West", flag: "🇺🇸" },
  { id: "eu-west", name: "Europe West", flag: "🇪🇺" },
  { id: "eu-central", name: "Europe Central", flag: "🇩🇪" },
  { id: "asia-east", name: "Asia East", flag: "🇯🇵" },
  { id: "asia-south", name: "Asia South", flag: "🇸🇬" },
  { id: "asia-southeast", name: "Asia Southeast", flag: "🇹🇭" },
  { id: "oceania", name: "Oceania", flag: "🇦🇺" },
  { id: "south-america", name: "South America", flag: "🇧🇷" },
  { id: "africa", name: "Africa", flag: "🇿🇦" },
];

const VALIDATOR_TIERS: ValidatorTier[] = [
  {
    id: "genesis",
    name: "Genesis Validator",
    icon: "👑",
    minStake: 1000000,
    maxValidators: 50,
    currentValidators: 0,
    commissionRange: "1-5%",
    estimatedApy: "20-25%",
    benefits: [
      "Highest reward priority",
      "Core network governance rights",
      "Exclusive genesis NFT badge",
      "Direct protocol team support",
      "Early access to protocol upgrades"
    ],
    badge: "Genesis",
    badgeClass: "bg-yellow-500"
  },
  {
    id: "pioneer",
    name: "Pioneer Validator",
    icon: "🚀",
    minStake: 500000,
    maxValidators: 100,
    currentValidators: 0,
    commissionRange: "5-15%",
    estimatedApy: "16-20%",
    benefits: [
      "High reward priority",
      "Network governance participation",
      "Pioneer NFT badge",
      "Priority technical support",
      "Beta feature access"
    ],
    badge: "Pioneer",
    badgeClass: "bg-purple-500"
  },
  {
    id: "standard",
    name: "Standard Validator",
    icon: "⭐",
    minStake: 200000,
    maxValidators: 150,
    currentValidators: 0,
    commissionRange: "10-20%",
    estimatedApy: "14-18%",
    benefits: [
      "Standard reward allocation",
      "Voting rights on proposals",
      "Standard NFT badge",
      "Community support access",
      "Monthly performance reports"
    ],
    badge: "Standard",
    badgeClass: "bg-blue-500"
  },
  {
    id: "community",
    name: "Community Validator",
    icon: "🌐",
    minStake: 100000,
    maxValidators: 75,
    currentValidators: 0,
    commissionRange: "15-30%",
    estimatedApy: "12-15%",
    benefits: [
      "Community reward pool",
      "Basic governance rights",
      "Community NFT badge",
      "Forum support access",
      "Quarterly performance reviews"
    ],
    badge: "Community",
    badgeClass: "bg-green-500"
  },
];

const SYSTEM_REQUIREMENTS = [
  { label: "CPU", requirement: "8+ cores (16+ recommended)", icon: Cpu },
  { label: "RAM", requirement: "32GB minimum (64GB recommended)", icon: Server },
  { label: "Storage", requirement: "1TB NVMe SSD (2TB recommended)", icon: Server },
  { label: "Network", requirement: "1Gbps connection", icon: Globe },
  { label: "Uptime", requirement: "99.9% SLA required", icon: Activity },
];

export default function ExternalValidatorProgramPage() {
  const { t } = useTranslation();
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const { toast } = useToast();

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [nodeName, setNodeName] = useState("");
  const [rpcEndpoint, setRpcEndpoint] = useState("");
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");

  const { data: statsResponse, isLoading: statsLoading } = useQuery<{ success: boolean; data: ExternalValidatorStats }>({
    queryKey: ['/api/external-validators/stats'],
  });
  const stats = statsResponse?.data;

  const registerMutation = useMutation({
    mutationFn: async (data: { 
      operatorAddress: string;
      operatorName: string;
      tier: string;
      region: string;
      endpoints: {
        rpcUrl: string;
        wsUrl: string;
        p2pAddress: string;
      };
      stakeAmount: string;
      commission: number;
    }) => {
      return apiRequest('POST', '/api/external-validators/register', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Registration Successful",
        description: `Your validator node "${nodeName}" has been registered. API Key: ${data.apiKey?.substring(0, 8)}...`,
      });
      setIsRegistrationOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/external-validators/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register validator node",
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to register as a validator",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTier || !selectedRegion || !nodeName || !rpcEndpoint) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const tier = VALIDATOR_TIERS.find(t => t.id === selectedTier);
    if (!tier) return;

    registerMutation.mutate({
      operatorAddress: address,
      operatorName: nodeName,
      tier: selectedTier,
      region: selectedRegion,
      endpoints: {
        rpcUrl: rpcEndpoint || `https://${nodeName}.tburn.io:8545`,
        wsUrl: `wss://${nodeName}.tburn.io:8546`,
        p2pAddress: `/ip4/0.0.0.0/tcp/30303/p2p/${address.slice(2, 18)}`,
      },
      stakeAmount: tier.minStake.toString(),
      commission: tier.id === 'genesis' ? 0.03 : tier.id === 'pioneer' ? 0.10 : tier.id === 'standard' ? 0.15 : 0.20,
    });
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      id: "faq-1",
      question: "What are the hardware requirements for running an external validator?",
      answer: "External validators require a minimum of 8 CPU cores, 32GB RAM, 1TB NVMe SSD storage, and a 1Gbps network connection. For optimal performance, we recommend 16+ cores, 64GB RAM, and 2TB storage."
    },
    {
      id: "faq-2",
      question: "How much TBURN do I need to stake?",
      answer: "Staking requirements vary by tier: Community (100,000 TBURN), Standard (200,000 TBURN), Pioneer (500,000 TBURN), and Genesis (1,000,000 TBURN). Higher tiers receive better rewards and priority in the validator selection process."
    },
    {
      id: "faq-3",
      question: "What is the expected APY for external validators?",
      answer: "APY varies by tier and performance. Community validators can expect 12-15% APY, Standard 14-18%, Pioneer 16-20%, and Genesis validators 20-25%. Actual returns depend on uptime, performance metrics, and network conditions."
    },
    {
      id: "faq-4",
      question: "How does the heartbeat monitoring work?",
      answer: "Validators must send heartbeat signals every 10 seconds to maintain active status. The system uses EWMA (Exponentially Weighted Moving Average) to calculate health scores. Validators with low health scores may face reduced rewards or temporary suspension."
    },
    {
      id: "faq-5",
      question: "What happens if my validator goes offline?",
      answer: "If a validator misses heartbeats, it will transition to 'degraded' status after 3 missed signals, then to 'offline' after 30 seconds. Consistent poor performance may result in slashing of staked tokens according to the network's slashing policy."
    },
    {
      id: "faq-6",
      question: "Can I upgrade my validator tier?",
      answer: "Yes, you can upgrade your tier by staking additional TBURN tokens to meet the higher tier requirements. Tier changes take effect after a 24-hour cooldown period to ensure network stability."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <TBurnLogo className="w-8 h-8" />
              <span className="font-bold text-xl">TBURN</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/validator" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-back-validators">
              ← Validator Hub
            </Link>
            <button 
              onClick={() => scrollToSection("tiers")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-tiers"
            >
              Validator Tiers
            </button>
            <button 
              onClick={() => scrollToSection("requirements")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-requirements"
            >
              Requirements
            </button>
            <button 
              onClick={() => scrollToSection("leaderboard")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-leaderboard"
            >
              Leaderboard
            </button>
            <button 
              onClick={() => scrollToSection("faq")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-faq"
            >
              FAQ
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {isConnected ? (
              <Button 
                variant="outline" 
                onClick={disconnect}
                data-testid="button-disconnect-wallet"
              >
                {formatAddress(address || "")}
              </Button>
            ) : (
              <Button 
                onClick={() => connect("metamask")}
                data-testid="button-connect-wallet"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30" data-testid="badge-program-status">
              <Activity className="w-4 h-4 mr-2" />
              External Validator Program
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Join the TBURN Network
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Become an external validator and help secure the TBURN blockchain while earning rewards. 
              Run your own node and participate in network consensus.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => setIsRegistrationOpen(true)}
                data-testid="button-register-validator"
              >
                Register as Validator
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => scrollToSection("tiers")}
                data-testid="button-view-tiers"
              >
                View Validator Tiers
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center" data-testid="stat-total-validators">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {statsLoading ? "..." : (stats?.totalValidators || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Validators</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="stat-active-validators">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-green-500 mb-2">
                  {statsLoading ? "..." : (stats?.activeValidators || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Active Validators</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="stat-total-staked">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {statsLoading ? "..." : stats?.totalStaked ? `${(parseInt(stats.totalStaked) / 1e6).toFixed(1)}M` : "0"}
                </div>
                <div className="text-sm text-muted-foreground">TBURN Staked</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="stat-network-health">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-blue-500 mb-2">
                  {statsLoading ? "..." : `${stats?.networkHealthScore || 100}%`}
                </div>
                <div className="text-sm text-muted-foreground">Network Health</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="tiers" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Validator Tiers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the tier that matches your commitment level and staking capacity. 
              Higher tiers offer better rewards and additional benefits.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALIDATOR_TIERS.map((tier) => (
              <Card 
                key={tier.id} 
                className="relative overflow-hidden hover-elevate transition-all duration-300"
                data-testid={`tier-card-${tier.id}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${tier.badgeClass}`} />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">{tier.icon}</span>
                    <Badge className={tier.badgeClass} data-testid={`tier-badge-${tier.id}`}>
                      {tier.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>
                    Min. Stake: {tier.minStake.toLocaleString()} TBURN
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slots</span>
                      <span className="font-medium">
                        {tier.currentValidators}/{tier.maxValidators}
                      </span>
                    </div>
                    <Progress 
                      value={(tier.currentValidators / tier.maxValidators) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="font-medium">{tier.commissionRange}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. APY</span>
                      <span className="font-medium text-green-500">{tier.estimatedApy}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium mb-2">Benefits</div>
                      <ul className="space-y-1">
                        {tier.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => {
                        setSelectedTier(tier.id);
                        setIsRegistrationOpen(true);
                      }}
                      data-testid={`button-select-tier-${tier.id}`}
                    >
                      Select Tier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="requirements" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">System Requirements</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ensure your infrastructure meets these minimum requirements for optimal validator performance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {SYSTEM_REQUIREMENTS.map((req, idx) => (
              <Card key={idx} className="text-center" data-testid={`requirement-${req.label.toLowerCase()}`}>
                <CardContent className="pt-6">
                  <req.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <div className="font-semibold mb-2">{req.label}</div>
                  <div className="text-sm text-muted-foreground">{req.requirement}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="leaderboard" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Validator Leaderboard</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Top performing external validators ranked by uptime, performance, and total rewards.
            </p>
          </div>
          <Card data-testid="leaderboard-card">
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Leaderboard Coming Soon</p>
                <p className="text-sm">Be among the first to register and claim your spot!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about becoming an external validator.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <Card 
                key={faq.id} 
                className="overflow-hidden cursor-pointer"
                onClick={() => toggleFaq(faq.id)}
                data-testid={`faq-item-${faq.id}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium pr-4">{faq.question}</h3>
                    <ChevronDown 
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${
                        activeFaq === faq.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                  {activeFaq === faq.id && (
                    <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start your journey as a TBURN validator today. Secure the network, 
                earn rewards, and be part of the decentralized future.
              </p>
              <Button 
                size="lg" 
                onClick={() => setIsRegistrationOpen(true)}
                data-testid="button-cta-register"
              >
                Register Your Validator Node
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TBurnLogo className="w-6 h-6" />
              <span className="font-semibold">TBURN External Validator Program</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/validator-incentives">
                <span className="hover:text-foreground cursor-pointer" data-testid="link-validator-incentives">
                  Validator Incentives
                </span>
              </Link>
              <Link href="/docs">
                <span className="hover:text-foreground cursor-pointer" data-testid="link-docs">
                  Documentation
                </span>
              </Link>
              <a 
                href="https://discord.gg/tburn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground flex items-center gap-1"
                data-testid="link-discord"
              >
                Discord
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-registration">
          <DialogHeader>
            <DialogTitle>Register External Validator</DialogTitle>
            <DialogDescription>
              Fill in your node details to register as an external validator on the TBURN network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!isConnected && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">
                  Please connect your wallet to continue with registration.
                </p>
                <Button 
                  className="mt-3"
                  onClick={() => connect("metamask")}
                  data-testid="button-connect-in-dialog"
                >
                  Connect Wallet
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier">Validator Tier</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger id="tier" data-testid="select-tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALIDATOR_TIERS.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.icon} {tier.name} ({tier.minStake.toLocaleString()} TBURN)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger id="region" data-testid="select-region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.flag} {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeName">Node Name</Label>
              <Input 
                id="nodeName"
                placeholder="e.g., tburn-validator-01"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                data-testid="input-node-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rpcEndpoint">RPC Endpoint (Optional)</Label>
              <Input 
                id="rpcEndpoint"
                placeholder="e.g., https://your-node.example.com:8545"
                value={rpcEndpoint}
                onChange={(e) => setRpcEndpoint(e.target.value)}
                data-testid="input-rpc-endpoint"
              />
              <p className="text-xs text-muted-foreground">
                Your node's RPC endpoint for network connectivity verification.
              </p>
            </div>

            {selectedTier && (
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Registration Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Required Stake:</div>
                  <div className="font-medium">
                    {VALIDATOR_TIERS.find(t => t.id === selectedTier)?.minStake.toLocaleString()} TBURN
                  </div>
                  <div className="text-muted-foreground">Est. APY:</div>
                  <div className="font-medium text-green-500">
                    {VALIDATOR_TIERS.find(t => t.id === selectedTier)?.estimatedApy}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegistrationOpen(false)} data-testid="button-cancel-registration">
              Cancel
            </Button>
            <Button 
              onClick={handleRegister}
              disabled={!isConnected || !selectedTier || !selectedRegion || !nodeName || registerMutation.isPending}
              data-testid="button-submit-registration"
            >
              {registerMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Validator"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
