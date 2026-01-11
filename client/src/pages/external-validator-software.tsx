import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TBurnLogo } from "@/components/tburn-logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Shield, 
  Server, 
  Cpu, 
  Globe, 
  Activity, 
  Download,
  Code,
  Terminal,
  Settings,
  Monitor,
  Zap,
  Lock,
  RefreshCw,
  CheckCircle2,
  Copy,
  ExternalLink,
  HardDrive,
  Network,
  Clock,
  AlertTriangle,
  FileText,
  MessageCircle,
  BookOpen,
  ChevronRight,
  Play,
  Box
} from "lucide-react";

interface SoftwareRelease {
  version: string;
  platform: string;
  filename: string;
  size: string;
  sha256: string;
  downloadUrl: string;
  features: string[];
}

interface SoftwareReleaseData {
  latestVersion: string;
  releaseDate: string;
  changelog: string;
  releases: SoftwareRelease[];
  systemRequirements: {
    minimum: { cpu: string; ram: string; storage: string; network: string; os: string };
    recommended: { cpu: string; ram: string; storage: string; network: string; os: string };
  };
}

const CODE_SNIPPETS = {
  download: `# Download TBURN Validator Node
curl -LO https://releases.tburn.io/validator/v1.0.0/tburn-validator-node-v1.0.0-linux-x64.tar.gz

# Verify checksum
sha256sum tburn-validator-node-v1.0.0-linux-x64.tar.gz

# Extract
tar -xzf tburn-validator-node-v1.0.0-linux-x64.tar.gz
cd tburn-validator-node`,

  install: `# Run interactive setup wizard
./tburn-validator setup

# Or use CLI flags for automation
./tburn-validator setup \\
  --node-name "my-validator" \\
  --stake-amount 100000 \\
  --region "us-east" \\
  --auto-start`,

  docker: `# Pull official Docker image
docker pull tburn/validator:1.0.0

# Run with Docker Compose
docker-compose up -d

# Or run standalone
docker run -d \\
  --name tburn-validator \\
  -v ~/.tburn:/root/.tburn \\
  -p 8545:8545 -p 8546:8546 -p 30303:30303 \\
  tburn/validator:1.0.0`,

  config: `# ~/.tburn/config.yaml
node:
  name: "my-validator-node"
  region: "us-east"

network:
  mainnet:
    rpc_port: 8545
    ws_port: 8546
    p2p_port: 30303
  bootstrap_peers:
    - "/dns4/boot1.tburn.io/tcp/30303/p2p/QmX..."
    - "/dns4/boot2.tburn.io/tcp/30303/p2p/QmY..."

consensus:
  bft_timeout: 100ms
  vote_threshold: 0.67

security:
  keystore_path: "/root/.tburn/keystore"
  tls_enabled: true
  mtls_enabled: true

monitoring:
  prometheus_port: 9100
  log_level: "info"`,

  systemd: `# /etc/systemd/system/tburn-validator.service
[Unit]
Description=TBURN Validator Node
After=network.target

[Service]
Type=simple
User=tburn
ExecStart=/opt/tburn/tburn-validator start
Restart=always
RestartSec=10
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable tburn-validator
sudo systemctl start tburn-validator
sudo systemctl status tburn-validator`,

  monitoring: `# Check node status
./tburn-validator status

# View metrics in Prometheus format
curl http://localhost:9100/metrics

# View logs
./tburn-validator logs --follow

# Check sync status
./tburn-validator sync-status`
};

const FEATURES = [
  {
    icon: Shield,
    title: "Enterprise BFT Consensus",
    description: "5-phase Byzantine Fault Tolerant consensus with lock-based safety guarantees"
  },
  {
    icon: Lock,
    title: "Quantum-Resistant Security",
    description: "AES-256-GCM encrypted keystore with TLS 1.3 and mTLS support"
  },
  {
    icon: Network,
    title: "P2P Gossip Network",
    description: "Efficient peer discovery and message propagation across 125+ validators"
  },
  {
    icon: Monitor,
    title: "Prometheus Metrics",
    description: "Built-in metrics exporter for Grafana dashboards and alerting"
  },
  {
    icon: RefreshCw,
    title: "Auto-Update Manager",
    description: "Seamless version upgrades with rollback support and zero downtime"
  },
  {
    icon: Terminal,
    title: "Interactive CLI",
    description: "Full-featured command-line interface with setup wizard and diagnostics"
  },
  {
    icon: Zap,
    title: "High Performance",
    description: "Optimized for 210,000+ TPS with 100ms block time and parallel verification"
  },
  {
    icon: HardDrive,
    title: "Crash Recovery",
    description: "Automatic state recovery and crash diagnostics with heap snapshot capture"
  }
];

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "What are the minimum hardware requirements?",
    answer: "Minimum requirements are 4 CPU cores, 8GB RAM, and 100GB SSD storage. For optimal performance in production, we recommend 8+ cores, 32GB RAM, and 500GB NVMe SSD."
  },
  {
    id: "faq-2",
    question: "How do I get my validator API key?",
    answer: "After completing the setup wizard, your validator will be registered with the network and you'll receive a unique API key. This key is stored in your keystore and used for authentication with the TBURN mainnet."
  },
  {
    id: "faq-3",
    question: "Can I run multiple validators on one server?",
    answer: "While technically possible, we recommend running one validator per server for optimal performance and security isolation. Each validator requires dedicated resources and should have its own keystore."
  },
  {
    id: "faq-4",
    question: "How do I stake TBURN tokens for validation?",
    answer: "During the setup process, you'll connect your wallet and stake the required amount of TBURN tokens. Minimum stake varies by tier: Genesis (1M TBURN), Pioneer (500K), Standard (200K), Community (100K)."
  },
  {
    id: "faq-5",
    question: "What happens if my validator goes offline?",
    answer: "If your validator is offline for extended periods, you may face slashing penalties. The auto-recovery system will attempt to restart the node automatically. We recommend setting up monitoring alerts."
  },
  {
    id: "faq-6",
    question: "How do I update my validator software?",
    answer: "Use the auto-update manager: `./tburn-validator update`. This will download, verify, and install the latest version with zero downtime. Rollback is available if issues occur."
  },
  {
    id: "faq-7",
    question: "Where can I view my validator performance?",
    answer: "Access the TBURN Explorer at explorer.tburn.io to view your validator's performance metrics, uptime, rewards earned, and network participation statistics."
  },
  {
    id: "faq-8",
    question: "How do I configure firewall rules?",
    answer: "Open ports 8545 (RPC), 8546 (WebSocket), 30303 (P2P), and 9100 (Prometheus metrics). For security, restrict RPC/WS ports to trusted IPs only and keep P2P port open for network participation."
  }
];

function CopyButton({ text, className = "", testId = "button-copy" }: { text: string; className?: string; testId?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleCopy}
      className={`h-8 w-8 ${className}`}
      data-testid={testId}
    >
      {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function CodeBlock({ code, language = "bash", testId = "code-block" }: { code: string; language?: string; testId?: string }) {
  return (
    <div className="relative group" data-testid={testId}>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} testId={`button-copy-${testId}`} />
      </div>
      <pre className="bg-zinc-950 dark:bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ExternalValidatorSoftwarePage() {
  const { t } = useTranslation();
  const [activeInstallTab, setActiveInstallTab] = useState("linux");

  const { data: releaseResponse, isLoading } = useQuery<{ success: boolean; data: SoftwareReleaseData }>({
    queryKey: ['/api/external-validators/software/releases'],
  });
  const releaseData = releaseResponse?.data;

  const linuxRelease = releaseData?.releases.find(r => r.platform === "linux-x64");
  const dockerRelease = releaseData?.releases.find(r => r.platform === "docker");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" data-testid="link-home">
              <TBurnLogo className="h-8 w-8" />
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground" data-testid="nav-breadcrumb">
              <Link href="/external-validator-program" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-program">
                External Validators
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Software</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/external-validator-program">
              <Button variant="outline" size="sm" data-testid="button-back-program">
                Back to Program
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 border-b bg-gradient-to-b from-zinc-900 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              v{releaseData?.latestVersion || "1.0.0"} - Production Ready
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
              TBURN Validator Node Software
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
              Enterprise-grade validator software for the TBURN Mainnet. 
              Join 125 genesis validators securing a network capable of 210,000+ TPS with 100ms block finality.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="gap-2" asChild data-testid="button-download-hero">
                <a href={linuxRelease?.downloadUrl || "/downloads/tburn-validator-node-v1.0.0-linux-x64.tar.gz"} download>
                  <Download className="h-5 w-5" />
                  Download for Linux
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild data-testid="link-docker-hub">
                <a href="https://hub.docker.com/r/tburn/validator" target="_blank" rel="noopener noreferrer">
                  <Box className="h-5 w-5" />
                  Docker Hub
                </a>
              </Button>
              <Button size="lg" variant="ghost" className="gap-2" asChild data-testid="link-github">
                <a href="https://github.com/tburn-chain/validator-node" target="_blank" rel="noopener noreferrer">
                  <Code className="h-5 w-5" />
                  View Source
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center" data-testid="card-stat-validators">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-validators-count">125</div>
                <div className="text-sm text-muted-foreground">Genesis Validators</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-tps">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-tps-target">210K+</div>
                <div className="text-sm text-muted-foreground">Target TPS</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-blocktime">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-block-time">100ms</div>
                <div className="text-sm text-muted-foreground">Block Time</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-uptime">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-uptime-sla">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-16 border-b" id="requirements">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">System Requirements</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ensure your server meets these requirements for optimal validator performance
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card data-testid="card-requirements-minimum">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Minimum Requirements
                </CardTitle>
                <CardDescription>Required for basic validator operation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">CPU</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-min-cpu">{releaseData?.systemRequirements?.minimum?.cpu || "4 cores"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">RAM</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-min-ram">{releaseData?.systemRequirements?.minimum?.ram || "8 GB"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Storage</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-min-storage">{releaseData?.systemRequirements?.minimum?.storage || "100 GB SSD"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Network</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-min-network">{releaseData?.systemRequirements?.minimum?.network || "100 Mbps"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">OS</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-min-os">{releaseData?.systemRequirements?.minimum?.os || "Ubuntu 20.04+"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/50" data-testid="card-requirements-recommended">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Recommended Specifications
                </CardTitle>
                <CardDescription>Optimal for high-performance validation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">CPU</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-rec-cpu">{releaseData?.systemRequirements?.recommended?.cpu || "8+ cores"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">RAM</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-rec-ram">{releaseData?.systemRequirements?.recommended?.ram || "32 GB"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Storage</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-rec-storage">{releaseData?.systemRequirements?.recommended?.storage || "500 GB NVMe"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Network</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-rec-network">{releaseData?.systemRequirements?.recommended?.network || "1 Gbps"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">OS</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-rec-os">{releaseData?.systemRequirements?.recommended?.os || "Ubuntu 22.04 LTS"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 border-b bg-muted/30" id="download">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Download Validator Node</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose your preferred installation method
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Linux Binary */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-lg">
                Recommended
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Linux Binary
                </CardTitle>
                <CardDescription>Pre-compiled binary for x64 systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-mono">{linuxRelease?.version || "1.0.0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span>{linuxRelease?.size || "97 MB"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span>.tar.gz</span>
                  </div>
                </div>
                <Button className="w-full gap-2" asChild data-testid="button-download-linux">
                  <a href={linuxRelease?.downloadUrl || "/downloads/tburn-validator-node-v1.0.0-linux-x64.tar.gz"} download>
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
                {linuxRelease?.sha256 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">SHA256:</span>
                    <code className="ml-1 font-mono break-all">{linuxRelease.sha256.slice(0, 16)}...</code>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Docker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Docker Image
                </CardTitle>
                <CardDescription>Container-based deployment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Image</span>
                    <span className="font-mono">tburn/validator</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tag</span>
                    <span className="font-mono">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arch</span>
                    <span>amd64, arm64</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2" asChild data-testid="button-docker-pull">
                  <a href="https://hub.docker.com/r/tburn/validator" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Docker Hub
                  </a>
                </Button>
                <div className="text-xs text-muted-foreground">
                  <code className="font-mono">docker pull tburn/validator:1.0.0</code>
                </div>
              </CardContent>
            </Card>

            {/* Source Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Source Code
                </CardTitle>
                <CardDescription>Build from source</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repository</span>
                    <span className="font-mono">GitHub</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License</span>
                    <span>Apache 2.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span>TypeScript</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2" asChild data-testid="button-view-source">
                  <a href="https://github.com/tburn-chain/validator-node" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
                <div className="text-xs text-muted-foreground">
                  <code className="font-mono">git clone github.com/tburn...</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-16 border-b" id="installation">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Installation Guide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these steps to install and configure your TBURN validator node
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeInstallTab} onValueChange={setActiveInstallTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="linux" className="gap-2" data-testid="tab-linux">
                  <Terminal className="h-4 w-4" />
                  Linux
                </TabsTrigger>
                <TabsTrigger value="docker" className="gap-2" data-testid="tab-docker">
                  <Box className="h-4 w-4" />
                  Docker
                </TabsTrigger>
                <TabsTrigger value="systemd" className="gap-2" data-testid="tab-systemd">
                  <Settings className="h-4 w-4" />
                  SystemD
                </TabsTrigger>
              </TabsList>
              <TabsContent value="linux" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                      Download & Extract
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={CODE_SNIPPETS.download} testId="code-download" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                      Run Setup Wizard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={CODE_SNIPPETS.install} testId="code-install" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                      Start Validator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code="./tburn-validator start --daemon" testId="code-start" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="docker" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Docker Installation</CardTitle>
                    <CardDescription>Deploy using Docker or Docker Compose</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={CODE_SNIPPETS.docker} testId="code-docker" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="systemd" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SystemD Service</CardTitle>
                    <CardDescription>Configure as a system service for automatic startup</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={CODE_SNIPPETS.systemd} testId="code-systemd" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="py-16 border-b bg-muted/30" id="configuration">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Configuration</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Customize your validator node settings
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Configuration File
                </CardTitle>
                <CardDescription>~/.tburn/config.yaml</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={CODE_SNIPPETS.config} language="yaml" testId="code-config" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b" id="features">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade features for professional validators
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="pt-6">
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Monitoring */}
      <section className="py-16 border-b bg-muted/30" id="monitoring">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Monitoring & Metrics</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built-in observability for production deployments
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Prometheus Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Block production metrics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Consensus participation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>P2P network statistics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Resource utilization</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Logging & Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Structured JSON logging</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Configurable log levels</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Grafana dashboards</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Alertmanager integration</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={CODE_SNIPPETS.monitoring} testId="code-monitoring" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Network Ports */}
      <section className="py-16 border-b" id="network">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Network Configuration</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Required ports and firewall settings
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Port</th>
                        <th className="text-left py-3 px-4 font-semibold">Protocol</th>
                        <th className="text-left py-3 px-4 font-semibold">Purpose</th>
                        <th className="text-left py-3 px-4 font-semibold">Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-mono">8545</td>
                        <td className="py-3 px-4">TCP</td>
                        <td className="py-3 px-4">JSON-RPC API</td>
                        <td className="py-3 px-4"><Badge variant="secondary">Restricted</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-mono">8546</td>
                        <td className="py-3 px-4">TCP</td>
                        <td className="py-3 px-4">WebSocket API</td>
                        <td className="py-3 px-4"><Badge variant="secondary">Restricted</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-mono">30303</td>
                        <td className="py-3 px-4">TCP/UDP</td>
                        <td className="py-3 px-4">P2P Network</td>
                        <td className="py-3 px-4"><Badge>Public</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono">9100</td>
                        <td className="py-3 px-4">TCP</td>
                        <td className="py-3 px-4">Prometheus Metrics</td>
                        <td className="py-3 px-4"><Badge variant="secondary">Internal</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-b bg-muted/30" id="faq">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Common questions about running a TBURN validator
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible defaultValue="faq-1">
              {FAQ_ITEMS.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left" data-testid={`accordion-${faq.id}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Support Resources */}
      <section className="py-16 border-b" id="support">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Support & Resources</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get help and stay connected with the TBURN community
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground mb-4">Comprehensive guides and API reference</p>
                <Button variant="outline" className="gap-2" asChild data-testid="link-docs">
                  <a href="https://docs.tburn.io/validators" target="_blank" rel="noopener noreferrer">
                    Read Docs
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center">
                <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Discord Community</h3>
                <p className="text-sm text-muted-foreground mb-4">Join validators and developers</p>
                <Button variant="outline" className="gap-2" asChild data-testid="link-discord">
                  <a href="https://discord.gg/tburn" target="_blank" rel="noopener noreferrer">
                    Join Discord
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center">
                <Clock className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Enterprise Support</h3>
                <p className="text-sm text-muted-foreground mb-4">24/7 priority support for Genesis tier</p>
                <Button variant="outline" className="gap-2" asChild data-testid="link-support">
                  <a href="mailto:validators@tburn.io">
                    Contact Support
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Become a Validator?</h2>
            <p className="text-muted-foreground mb-8">
              Download the validator software and join the TBURN network today. 
              Earn rewards while helping secure a high-performance blockchain.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="gap-2" asChild data-testid="button-download-cta">
                <a href={linuxRelease?.downloadUrl || "/downloads/tburn-validator-node-v1.0.0-linux-x64.tar.gz"} download>
                  <Download className="h-5 w-5" />
                  Download Now
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="link-program-cta">
                <Link href="/external-validator-program">
                  <Play className="h-5 w-5 mr-2" />
                  View Program Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TBurnLogo className="h-5 w-5" />
              <span>TBURN Blockchain</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/external-validator-program" className="hover:text-foreground">
                Validator Program
              </Link>
              <Link href="/validator" className="hover:text-foreground">
                Active Validators
              </Link>
              <a href="https://docs.tburn.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Documentation
              </a>
            </div>
            <div>
              Version {releaseData?.latestVersion || "1.0.0"} | Released {releaseData?.releaseDate || "2026-01-11"}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
