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
  ChevronDown,
  Download,
  Code
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
  icon: string;
  minStake: number;
  maxValidators: number;
  currentValidators: number;
  commissionRange: string;
  estimatedApy: string;
  badgeClass: string;
}

const REGIONS = [
  { id: "us-east", flag: "🇺🇸" },
  { id: "us-west", flag: "🇺🇸" },
  { id: "eu-west", flag: "🇪🇺" },
  { id: "eu-central", flag: "🇩🇪" },
  { id: "asia-east", flag: "🇯🇵" },
  { id: "asia-south", flag: "🇸🇬" },
  { id: "asia-southeast", flag: "🇹🇭" },
  { id: "oceania", flag: "🇦🇺" },
  { id: "south-america", flag: "🇧🇷" },
  { id: "africa", flag: "🇿🇦" },
];

const VALIDATOR_TIERS: ValidatorTier[] = [
  {
    id: "genesis",
    icon: "👑",
    minStake: 1000000,
    maxValidators: 50,
    currentValidators: 0,
    commissionRange: "1-5%",
    estimatedApy: "20-25%",
    badgeClass: "bg-yellow-500"
  },
  {
    id: "pioneer",
    icon: "🚀",
    minStake: 500000,
    maxValidators: 100,
    currentValidators: 0,
    commissionRange: "5-15%",
    estimatedApy: "16-20%",
    badgeClass: "bg-purple-500"
  },
  {
    id: "standard",
    icon: "⭐",
    minStake: 200000,
    maxValidators: 150,
    currentValidators: 0,
    commissionRange: "10-20%",
    estimatedApy: "14-18%",
    badgeClass: "bg-blue-500"
  },
  {
    id: "community",
    icon: "🌐",
    minStake: 100000,
    maxValidators: 75,
    currentValidators: 0,
    commissionRange: "15-30%",
    estimatedApy: "12-15%",
    badgeClass: "bg-green-500"
  },
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
        title: t("externalValidator.registration.success"),
        description: `Your validator node "${nodeName}" has been registered. API Key: ${data.apiKey?.substring(0, 8)}...`,
      });
      setIsRegistrationOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/external-validators/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: t("externalValidator.registration.failed"),
        description: error.message || "Failed to register validator node",
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    if (!isConnected || !address) {
      toast({
        title: t("externalValidator.registration.walletRequired"),
        description: t("externalValidator.registration.walletRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    if (!selectedTier || !selectedRegion || !nodeName || !rpcEndpoint) {
      toast({
        title: t("externalValidator.registration.missingInfo"),
        description: t("externalValidator.registration.missingInfoDesc"),
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

  const faqIds = ["1", "2", "3", "4", "5", "6"];

  const systemRequirements = [
    { key: "cpu", icon: Cpu },
    { key: "ram", icon: Server },
    { key: "storage", icon: Server },
    { key: "network", icon: Globe },
    { key: "uptime", icon: Activity },
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
              {t("externalValidator.nav.backToValidators")}
            </Link>
            <button 
              onClick={() => scrollToSection("tiers")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-tiers"
            >
              {t("externalValidator.nav.tiers")}
            </button>
            <button 
              onClick={() => scrollToSection("requirements")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-requirements"
            >
              {t("externalValidator.nav.requirements")}
            </button>
            <button 
              onClick={() => scrollToSection("leaderboard")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-leaderboard"
            >
              {t("externalValidator.nav.leaderboard")}
            </button>
            <button 
              onClick={() => scrollToSection("faq")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-faq"
            >
              {t("externalValidator.nav.faq")}
            </button>
            <button 
              onClick={() => scrollToSection("download")} 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-primary"
              data-testid="nav-download"
            >
              {t("externalValidator.nav.download")}
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
                {t("externalValidator.hero.connectWallet")}
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
              {t("externalValidator.hero.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t("externalValidator.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("externalValidator.hero.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => setIsRegistrationOpen(true)}
                data-testid="button-register-validator"
              >
                {t("externalValidator.hero.registerBtn")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => scrollToSection("tiers")}
                data-testid="button-view-tiers"
              >
                {t("externalValidator.hero.viewTiersBtn")}
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
                <div className="text-sm text-muted-foreground">{t("externalValidator.stats.totalValidators")}</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="stat-active-validators">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-green-500 mb-2">
                  {statsLoading ? "..." : (stats?.activeValidators || 0)}
                </div>
                <div className="text-sm text-muted-foreground">{t("externalValidator.stats.activeValidators")}</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="stat-total-staked">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {statsLoading ? "..." : stats?.totalStaked ? `${(parseInt(stats.totalStaked) / 1e6).toFixed(1)}M` : "0"}
                </div>
                <div className="text-sm text-muted-foreground">{t("externalValidator.stats.tburnStaked")}</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="stat-network-health">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-blue-500 mb-2">
                  {statsLoading ? "..." : `${stats?.networkHealthScore || 100}%`}
                </div>
                <div className="text-sm text-muted-foreground">{t("externalValidator.stats.networkHealth")}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="tiers" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("externalValidator.tiers.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidator.tiers.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALIDATOR_TIERS.map((tier) => {
              const benefits = t(`externalValidator.tiers.${tier.id}.benefits`, { returnObjects: true }) as string[];
              return (
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
                        {t(`externalValidator.tiers.${tier.id}.badge`)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{t(`externalValidator.tiers.${tier.id}.name`)}</CardTitle>
                    <CardDescription>
                      {t("externalValidator.tiers.minStake")}: {tier.minStake.toLocaleString()} TBURN
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("externalValidator.tiers.slots")}</span>
                        <span className="font-medium">
                          {tier.currentValidators}/{tier.maxValidators}
                        </span>
                      </div>
                      <Progress 
                        value={(tier.currentValidators / tier.maxValidators) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("externalValidator.tiers.commission")}</span>
                        <span className="font-medium">{tier.commissionRange}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("externalValidator.tiers.estApy")}</span>
                        <span className="font-medium text-green-500">{tier.estimatedApy}</span>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="text-sm font-medium mb-2">{t("externalValidator.tiers.benefits")}</div>
                        <ul className="space-y-1">
                          {Array.isArray(benefits) && benefits.slice(0, 3).map((benefit, idx) => (
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
                        {t("externalValidator.tiers.selectTier")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="requirements" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("externalValidator.requirements.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidator.requirements.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {systemRequirements.map((req) => (
              <Card key={req.key} className="text-center" data-testid={`requirement-${req.key}`}>
                <CardContent className="pt-6">
                  <req.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <div className="font-semibold mb-2">{t(`externalValidator.requirements.${req.key}`)}</div>
                  <div className="text-sm text-muted-foreground">{t(`externalValidator.requirements.${req.key}Req`)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="leaderboard" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("externalValidator.leaderboard.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidator.leaderboard.subtitle")}
            </p>
          </div>
          <Card data-testid="leaderboard-card">
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">{t("externalValidator.leaderboard.comingSoon")}</p>
                <p className="text-sm">{t("externalValidator.leaderboard.beFirst")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("externalValidator.faq.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidator.faq.subtitle")}
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqIds.map((id) => (
              <Card 
                key={`faq-${id}`}
                className="overflow-hidden cursor-pointer"
                onClick={() => toggleFaq(`faq-${id}`)}
                data-testid={`faq-item-faq-${id}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium pr-4">{t(`externalValidator.faq.q${id}.question`)}</h3>
                    <ChevronDown 
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${
                        activeFaq === `faq-${id}` ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                  {activeFaq === `faq-${id}` && (
                    <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                      {t(`externalValidator.faq.q${id}.answer`)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="download" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">{t("externalValidator.download.title")}</Badge>
            <h2 className="text-3xl font-bold mb-4">{t("externalValidator.download.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidator.download.subtitle")}
            </p>
            <Link href="/external-validator-software">
              <Button variant="outline" className="mt-4" data-testid="link-software-docs">
                <ArrowRight className="w-4 h-4 mr-2" />
                {t("externalValidator.download.viewDocs")}
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Server className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Linux x64</CardTitle>
                    <CardDescription>Ubuntu 20.04+, Debian 11+</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Node.js 20+ runtime included</p>
                  <p>• SystemD service installer</p>
                  <p>• Auto-update support</p>
                </div>
                <a 
                  href="/downloads/tburn-validator-node-v1.0.0-linux-x64.tar.gz"
                  download
                  className="block"
                  data-testid="download-linux"
                >
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    {t("externalValidator.download.downloadBtn")} (97 MB)
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Cpu className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Docker Image</CardTitle>
                    <CardDescription>All platforms</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Docker Compose included</p>
                  <p>• Kubernetes ready</p>
                  <p>• Prometheus metrics</p>
                </div>
                <div className="bg-muted rounded-lg p-2 font-mono text-xs overflow-x-auto">
                  docker pull tburn/validator:1.0.0
                </div>
                <Button className="w-full" variant="outline" data-testid="download-docker">
                  View Docker Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Code className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Source Code</CardTitle>
                    <CardDescription>Build from source</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• TypeScript source</p>
                  <p>• Full test suite</p>
                  <p>• Development docs</p>
                </div>
                <a 
                  href="https://github.com/tburn-foundation/validator-node"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  data-testid="download-source"
                >
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    GitHub Repository
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">{t("externalValidator.hero.title")}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("externalValidator.hero.subtitle")}
              </p>
              <Button 
                size="lg" 
                onClick={() => setIsRegistrationOpen(true)}
                data-testid="button-cta-register"
              >
                {t("externalValidator.hero.registerBtn")}
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
              <span className="font-semibold">{t("externalValidator.hero.badge")}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/validator" className="hover:text-foreground">
                {t("externalValidator.nav.backToValidators")}
              </Link>
              <Link href="/docs" className="hover:text-foreground">
                {t("externalValidator.download.docs")}
              </Link>
              <Link href="/" className="hover:text-foreground">
                TBURN Explorer
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("externalValidator.registration.title")}</DialogTitle>
            <DialogDescription>
              {t("externalValidator.registration.subtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nodeName">{t("externalValidator.registration.nodeName")}</Label>
              <Input 
                id="nodeName"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder={t("externalValidator.registration.nodeNamePlaceholder")}
                data-testid="input-node-name"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("externalValidator.registration.selectTier")}</Label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger data-testid="select-tier">
                  <SelectValue placeholder={t("externalValidator.registration.selectTierPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {VALIDATOR_TIERS.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.icon} {t(`externalValidator.tiers.${tier.id}.name`)} ({tier.minStake.toLocaleString()} TBURN)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("externalValidator.registration.selectRegion")}</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger data-testid="select-region">
                  <SelectValue placeholder={t("externalValidator.registration.selectRegionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.flag} {t(`externalValidator.regions.${region.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpcEndpoint">{t("externalValidator.registration.rpcEndpoint")}</Label>
              <Input 
                id="rpcEndpoint"
                value={rpcEndpoint}
                onChange={(e) => setRpcEndpoint(e.target.value)}
                placeholder={t("externalValidator.registration.rpcPlaceholder")}
                data-testid="input-rpc-endpoint"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegistrationOpen(false)} data-testid="button-cancel">
              {t("externalValidator.registration.cancel")}
            </Button>
            <Button 
              onClick={handleRegister}
              disabled={registerMutation.isPending}
              data-testid="button-submit-register"
            >
              {registerMutation.isPending ? "..." : t("externalValidator.registration.register")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
