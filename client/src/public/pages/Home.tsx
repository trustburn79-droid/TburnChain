import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Clock, Users, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NetworkStats {
  tps: number;
  avgBlockTime: number;
  activeValidators: number;
  totalValidators: number;
}

export default function Home() {
  const { data: stats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 10000,
  });

  const displayStats = [
    {
      value: stats ? `${Math.floor(stats.tps / 1000)}K+` : "100,000+",
      label: "Transactions Per Second",
      icon: Zap,
    },
    {
      value: stats ? `${stats.avgBlockTime}s` : "1s",
      label: "Average Block Time",
      icon: Clock,
    },
    {
      value: stats ? `${stats.activeValidators.toLocaleString()}` : "30,000",
      label: "Validator Nodes",
      icon: Users,
    },
    {
      value: "$0.0001",
      label: "Average Transaction Fee",
      icon: DollarSign,
    },
  ];

  return (
    <div className="relative">
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trust-Based
            </span>
            <br />
            <span className="text-foreground">Blockchain Ecosystem</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Burn Chain is the world's first trust network that verifies project reliability and 
            ensures transparency. Build a secure blockchain ecosystem by tracking and 
            enforcing promise fulfillment in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/developers/quickstart">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600" data-testid="button-get-started">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/learn">
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Build the Future with Burn Chain
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover how Burn Chain's innovative technology enables developers and 
              enterprises to create secure, scalable, and trustworthy applications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Enterprise Ready",
                description: "Production-grade infrastructure with 99.9% uptime SLA and dedicated support.",
                href: "/use-cases/enterprise",
              },
              {
                title: "Developer Friendly",
                description: "Comprehensive SDKs, APIs, and documentation to accelerate your development.",
                href: "/developers",
              },
              {
                title: "Secure by Design",
                description: "Multi-layer security with quantum-resistant cryptography and AI monitoring.",
                href: "/learn/trust-score",
              },
            ].map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer" data-testid={`feature-card-${index}`}>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
