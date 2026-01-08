import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Users,
  Wallet,
  Shield,
  Activity,
  BarChart3,
  Lock,
  Clock,
  CheckCircle,
  AlertCircle,
  Coins,
  FileText,
  Building2,
  Globe
} from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function VCTestMode() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: networkStats } = useQuery<any>({
    queryKey: ['/api/network/stats']
  });

  const { data: tokenomicsData } = useQuery<any>({
    queryKey: ['/api/tokenomics']
  });

  const { data: validatorsData } = useQuery<any>({
    queryKey: ['/api/validators']
  });

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num?.toString() || '0';
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const keyMetrics = [
    {
      label: "Total Value Locked",
      value: formatCurrency(487500000),
      change: "+12.5%",
      icon: Lock,
      positive: true
    },
    {
      label: "Active Validators",
      value: validatorsData?.validators?.length || 125,
      change: "+5",
      icon: Shield,
      positive: true
    },
    {
      label: "Network TPS",
      value: formatNumber(networkStats?.tps || 168000),
      change: "+8.2%",
      icon: Activity,
      positive: true
    },
    {
      label: "Total Transactions",
      value: formatNumber(networkStats?.totalTransactions || 23773571173),
      change: "+2.1M",
      icon: BarChart3,
      positive: true
    }
  ];

  const tokenAllocation = [
    { category: "Ecosystem Fund", percentage: 25, amount: "250M TBURN" },
    { category: "Team & Advisors", percentage: 15, amount: "150M TBURN", vesting: "4-year cliff" },
    { category: "Community Rewards", percentage: 20, amount: "200M TBURN" },
    { category: "Validator Incentives", percentage: 15, amount: "150M TBURN" },
    { category: "Treasury", percentage: 10, amount: "100M TBURN" },
    { category: "Private Sale", percentage: 10, amount: "100M TBURN", vesting: "2-year unlock" },
    { category: "Public Sale", percentage: 5, amount: "50M TBURN" }
  ];

  const vestingSchedule = [
    { round: "Seed", price: "$0.04", tokens: "50M", unlockStart: "TGE + 12mo", unlockEnd: "TGE + 36mo" },
    { round: "Private", price: "$0.10", tokens: "100M", unlockStart: "TGE + 6mo", unlockEnd: "TGE + 24mo" },
    { round: "Public", price: "$0.20", tokens: "50M", unlockStart: "TGE", unlockEnd: "TGE + 12mo" }
  ];

  const techSpecs = [
    { label: "Chain ID", value: "6000" },
    { label: "Block Time", value: "100ms" },
    { label: "Target TPS", value: "210,000+" },
    { label: "Genesis Validators", value: "125" },
    { label: "Max Shards", value: "64" },
    { label: "Consensus", value: "AI-Enhanced BFT" },
    { label: "Address Format", value: "Bech32m (tb1...)" },
    { label: "Native Token", value: "TBURN" }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="vc-test-mode">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">TBURN VC Due Diligence Portal</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive overview for institutional investors
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Badge variant="outline" className="text-green-500 border-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Mainnet Live
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {keyMetrics.map((metric, idx) => (
            <Card key={idx} data-testid={`metric-card-${idx}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${metric.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change} from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="team">Team & Governance</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Project Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    TBURN is a high-performance Layer 1 blockchain designed for enterprise-grade DeFi applications.
                    The network features AI-enhanced consensus, dynamic sharding for scalability, and comprehensive
                    tokenomics designed for long-term sustainability.
                  </p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Launch Date</p>
                      <p className="font-semibold">Q1 2026</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Supply</p>
                      <p className="font-semibold">1,000,000,000 TBURN</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Initial Market Cap</p>
                      <p className="font-semibold">$50M (est.)</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">FDV at Launch</p>
                      <p className="font-semibold">$200M</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Smart Contract Audit</span>
                    <Badge className="bg-green-600">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Penetration Testing</span>
                    <Badge className="bg-green-600">Passed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>KYC/AML Integration</span>
                    <Badge className="bg-green-600">Implemented</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bug Bounty Program</span>
                    <Badge className="bg-blue-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Insurance Coverage</span>
                    <Badge variant="outline">In Progress</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tokenomics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Token Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tokenAllocation.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.category}</span>
                          <span className="font-semibold">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{item.amount}</span>
                          {item.vesting && <span>{item.vesting}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Vesting Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vestingSchedule.map((round, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{round.round} Round</span>
                          <Badge variant="outline">{round.price}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>
                            <p className="text-xs">Tokens</p>
                            <p className="font-medium text-foreground">{round.tokens}</p>
                          </div>
                          <div>
                            <p className="text-xs">Unlock Start</p>
                            <p className="font-medium text-foreground">{round.unlockStart}</p>
                          </div>
                          <div>
                            <p className="text-xs">Fully Unlocked</p>
                            <p className="font-medium text-foreground">{round.unlockEnd}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technology" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {techSpecs.map((spec, idx) => (
                    <div key={idx} className="p-4 border rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">{spec.label}</p>
                      <p className="font-bold text-lg">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team & Governance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  TBURN is developed by a team of experienced blockchain engineers and DeFi experts.
                  Governance is managed through a decentralized DAO structure with on-chain voting.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Development Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">Q4 2025</Badge>
                    <span>Testnet Launch & Security Audits</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">Q1 2026</Badge>
                    <span>Mainnet Launch & Token Generation Event</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Q2 2026</Badge>
                    <span>DEX & Lending Protocol Launch</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Q3 2026</Badge>
                    <span>Cross-Chain Bridge & NFT Marketplace</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Q4 2026</Badge>
                    <span>Enterprise Partnerships & Global Expansion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
