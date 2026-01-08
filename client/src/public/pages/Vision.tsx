import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguageWithPreload } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Flame,
  Globe,
  Shield,
  Zap,
  Users,
  Coins,
  TrendingUp,
  Target,
  Rocket,
  Lock,
  BarChart3,
  Cpu,
  Network,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Vision() {
  const { t } = useTranslation();

  useEffect(() => {
    changeLanguageWithPreload('en');
  }, []);

  const coreValues = [
    {
      icon: Shield,
      title: "Security First",
      description: "Quantum-resistant cryptography and AI-enhanced security protocols protect every transaction on the network."
    },
    {
      icon: Zap,
      title: "Blazing Speed",
      description: "210,000+ TPS with 100ms block time enables real-time DeFi applications at unprecedented scale."
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description: "12-language support with RTL compatibility ensures the TBURN ecosystem is accessible worldwide."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Decentralized governance empowers token holders to shape the future of the network."
    }
  ];

  const milestones = [
    { phase: "Phase 1", title: "Network Genesis", status: "completed", description: "Launch mainnet with 125 genesis validators and 64 shards" },
    { phase: "Phase 2", title: "DeFi Expansion", status: "active", description: "DEX, lending, yield farming, and liquid staking protocols" },
    { phase: "Phase 3", title: "Cross-Chain Bridge", status: "upcoming", description: "Multi-chain interoperability with major blockchain networks" },
    { phase: "Phase 4", title: "Enterprise Adoption", status: "upcoming", description: "Enterprise-grade solutions and institutional partnerships" }
  ];

  const keyMetrics = [
    { label: "Target TPS", value: "210,000+", icon: Zap },
    { label: "Block Time", value: "100ms", icon: Cpu },
    { label: "Genesis Validators", value: "125", icon: Shield },
    { label: "Max Shards", value: "64", icon: Network }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="vision-page">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4" variant="outline">
              <Flame className="h-3 w-3 mr-1 text-orange-500" />
              TBURN Vision
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Building the Future of
              <span className="text-primary"> Decentralized Finance</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              TBURN is pioneering a new era of blockchain technology with AI-enhanced consensus, 
              dynamic sharding, and enterprise-grade security for the next generation of DeFi applications.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/learn/whitepaper">
                <Button size="lg" data-testid="button-read-whitepaper">
                  Read Whitepaper
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/dashboard">
                <Button size="lg" variant="outline" data-testid="button-explore-network">
                  Explore Network
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {keyMetrics.map((metric, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <metric.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our foundational principles guide every decision in building the TBURN ecosystem
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`card-value-${idx}`}>
                <CardHeader>
                  <value.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Roadmap</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our strategic journey towards becoming the leading DeFi infrastructure
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {milestones.map((milestone, idx) => (
              <Card key={idx} className={milestone.status === 'active' ? 'border-primary' : ''} data-testid={`card-milestone-${idx}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      milestone.status === 'completed' ? 'default' :
                      milestone.status === 'active' ? 'secondary' : 'outline'
                    }>
                      {milestone.phase}
                    </Badge>
                    <CardTitle className="text-lg">{milestone.title}</CardTitle>
                  </div>
                  {milestone.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {milestone.status === 'active' && (
                    <Badge className="bg-primary">Active</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0">
            <CardContent className="py-12 text-center">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Ready to Join the Revolution?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Be part of the next generation of decentralized finance. 
                Start exploring the TBURN ecosystem today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" data-testid="button-get-started">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button size="lg" variant="outline" data-testid="button-learn-more">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
