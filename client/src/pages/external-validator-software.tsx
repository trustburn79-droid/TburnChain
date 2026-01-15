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
  download: `# Download TBURN Validator Node v1.1.0 (with Security API)
curl -LO https://releases.tburn.io/validator/v1.1.0/tburn-validator-node-v1.1.0-linux-x64.tar.gz

# Verify checksum
sha256sum tburn-validator-node-v1.1.0-linux-x64.tar.gz

# Extract (includes security templates)
tar -xzf tburn-validator-node-v1.1.0-linux-x64.tar.gz
cd tburn-validator-node

# Files included:
# - tburn-validator (main binary)
# - config/config.yaml.template
# - config/security.yaml.template  <- Security API config
# - docker-compose.yml
# - systemd/tburn-validator.service`,

  install: `# Run interactive setup wizard (includes security setup)
./tburn-validator setup

# Or use CLI flags for automation
./tburn-validator setup \\
  --node-name "my-validator" \\
  --stake-amount 100000 \\
  --region "us-east" \\
  --api-key "\${TBURN_API_KEY}" \\
  --enable-security-heartbeat \\
  --auto-start

# Configure security separately (optional)
./tburn-validator security configure \\
  --api-key "\${TBURN_API_KEY}" \\
  --heartbeat-interval 30`,

  docker: `# Pull official Docker image v1.1.0 (with Security API)
docker pull tburn/validator:1.1.0

# Run with Docker Compose (recommended)
docker-compose up -d

# Or run standalone with security config
docker run -d \\
  --name tburn-validator \\
  -v ~/.tburn:/root/.tburn \\
  -e TBURN_API_KEY="\${TBURN_API_KEY}" \\
  -e TBURN_SECURITY_HEARTBEAT=true \\
  -p 8545:8545 -p 8546:8546 -p 30303:30303 \\
  tburn/validator:1.1.0`,

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
  # Security API Integration (v1.1.0+)
  api:
    enabled: true
    heartbeat_enabled: true
    heartbeat_interval: 30  # seconds

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
./tburn-validator sync-status`,

  securityApi: `# Security API Configuration (~/.tburn/security.yaml)
security:
  mainnet_api:
    url: "https://api.tburn.io"
    # API key provided during registration
    api_key: "vk_xxxxxxxx_xxxxxxxxxxxxxxxxx"
    
  # Required request headers (auto-generated)
  headers:
    X-API-Key: "<your-api-key>"
    X-Validator-Address: "<your-validator-address>"
    X-Timestamp: "<epoch-ms>"
    X-Nonce: "<random-32-hex>"
    X-Signature: "<hmac-sha256-signature>"
    
  # Replay protection settings
  replay_protection:
    timestamp_drift_tolerance: 60000  # 60 seconds
    nonce_ttl: 300000  # 5 minutes
    
  # Authentication (bcrypt + pepper)
  auth:
    algorithm: "bcrypt"
    rounds: 12
    pepper_enabled: true`,

  securityHeartbeat: `# Send security heartbeat to mainnet
curl -X POST https://api.tburn.io/api/external-validators/security/heartbeat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: \${API_KEY}" \\
  -H "X-Validator-Address: \${VALIDATOR_ADDRESS}" \\
  -H "X-Timestamp: \$(date +%s)000" \\
  -H "X-Nonce: \$(openssl rand -hex 16)" \\
  -d '{
    "nodeId": "my-validator",
    "uptime": 86400,
    "currentSlot": 12345,
    "securityStats": {
      "signingRequests": 1500,
      "blockedRequests": 0,
      "rateLimitHits": 0
    }
  }'`,

  securityEndpoints: `# Available Security API Endpoints

# 1. Security Heartbeat - Report validator status
POST /api/external-validators/security/heartbeat

# 2. Security Report - Submit security metrics
POST /api/external-validators/security/report

# 3. Get Your Status - Check if blocked/rate-limited
GET /api/external-validators/security/my-status

# 4. Acknowledge Alert - Mark alert as acknowledged
POST /api/external-validators/security/alerts/:alertId/acknowledge`
};

const FEATURE_ICONS = [Shield, Lock, Zap, Clock, Network, Monitor, RefreshCw, HardDrive];
const FEATURE_KEYS = ['bft', 'security', 'tps', 'blockTime', 'sharding', 'monitoring', 'updates', 'recovery'];

const FAQ_KEYS = ['stake', 'hardware', 'updates', 'rewards', 'slashing', 'backup', 'migrate', 'support'];

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
                {t("nav.validators")}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{t("externalValidatorSoftware.nav.download")}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/external-validator-program">
              <Button variant="outline" size="sm" data-testid="button-back-program">
                {t("externalValidatorSoftware.nav.backToProgram")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 border-b bg-gradient-to-b from-zinc-900 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary" data-testid="badge-hero">
              v{releaseData?.latestVersion || "1.1.0"} - {t("externalValidatorSoftware.hero.badge")}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
              {t("externalValidatorSoftware.hero.title")}
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
              {t("externalValidatorSoftware.hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="gap-2" asChild data-testid="button-download-hero">
                <a href={linuxRelease?.downloadUrl || "/downloads/tburn-validator-node-v1.1.0-linux-x64.tar.gz"} download>
                  <Download className="h-5 w-5" />
                  {t("externalValidatorSoftware.download.linux.download")}
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
                <div className="text-sm text-muted-foreground">{t("externalValidatorSoftware.stats.validators")}</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-tps">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-tps-target">210K+</div>
                <div className="text-sm text-muted-foreground">{t("externalValidatorSoftware.stats.tps")}</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-blocktime">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-block-time">100ms</div>
                <div className="text-sm text-muted-foreground">{t("externalValidatorSoftware.stats.blockTime")}</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-uptime">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-uptime-sla">99.9%</div>
                <div className="text-sm text-muted-foreground">{t("externalValidatorSoftware.stats.uptime")}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-16 border-b" id="requirements">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.requirements.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.requirements.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card data-testid="card-requirements-minimum">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  {t("externalValidatorSoftware.requirements.minimum")}
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
                  {t("externalValidatorSoftware.requirements.recommended")}
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
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.download.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.download.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Linux Binary */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-lg">
                {t("externalValidatorSoftware.download.linux.recommended")}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  {t("externalValidatorSoftware.download.linux.title")}
                </CardTitle>
                <CardDescription>{t("externalValidatorSoftware.download.linux.description")}</CardDescription>
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
                  <a href={linuxRelease?.downloadUrl || "/downloads/tburn-validator-node-v1.1.0-linux-x64.tar.gz"} download>
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
                  {t("externalValidatorSoftware.download.docker.title")}
                </CardTitle>
                <CardDescription>{t("externalValidatorSoftware.download.docker.description")}</CardDescription>
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
                  {t("externalValidatorSoftware.download.source.title")}
                </CardTitle>
                <CardDescription>{t("externalValidatorSoftware.download.source.description")}</CardDescription>
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
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.installation.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.installation.subtitle")}
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
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.configuration.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.configuration.subtitle")}
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

      {/* Security API Integration */}
      <section className="py-16 border-b" id="security">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-green-500/50 text-green-600 dark:text-green-400" data-testid="badge-security-api">
              {t("externalValidatorSoftware.securityApi.badge")}
            </Badge>
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.securityApi.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.securityApi.subtitle")}
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            <Card data-testid="card-security-overview">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  {t("externalValidatorSoftware.securityApi.authTitle")}
                </CardTitle>
                <CardDescription>{t("externalValidatorSoftware.securityApi.authDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      {t("externalValidatorSoftware.securityApi.features.auth")}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{t("externalValidatorSoftware.securityApi.features.bcrypt")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{t("externalValidatorSoftware.securityApi.features.pepper")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{t("externalValidatorSoftware.securityApi.features.hmac")}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-primary" />
                      {t("externalValidatorSoftware.securityApi.features.replay")}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{t("externalValidatorSoftware.securityApi.features.timestamp")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{t("externalValidatorSoftware.securityApi.features.nonce")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{t("externalValidatorSoftware.securityApi.features.constant")}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="config" className="flex items-center gap-2" data-testid="tab-security-config">
                  <Settings className="h-4 w-4" />
                  {t("externalValidatorSoftware.securityApi.tabs.config")}
                </TabsTrigger>
                <TabsTrigger value="heartbeat" className="flex items-center gap-2" data-testid="tab-security-heartbeat">
                  <Activity className="h-4 w-4" />
                  {t("externalValidatorSoftware.securityApi.tabs.heartbeat")}
                </TabsTrigger>
                <TabsTrigger value="endpoints" className="flex items-center gap-2" data-testid="tab-security-endpoints">
                  <Network className="h-4 w-4" />
                  {t("externalValidatorSoftware.securityApi.tabs.endpoints")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="config" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("externalValidatorSoftware.securityApi.configTitle")}</CardTitle>
                    <CardDescription>{t("externalValidatorSoftware.securityApi.configDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={CODE_SNIPPETS.securityApi} language="yaml" testId="code-security-config" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="heartbeat" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("externalValidatorSoftware.securityApi.heartbeatTitle")}</CardTitle>
                    <CardDescription>{t("externalValidatorSoftware.securityApi.heartbeatDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={CODE_SNIPPETS.securityHeartbeat} testId="code-security-heartbeat" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="endpoints" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("externalValidatorSoftware.securityApi.endpointsTitle")}</CardTitle>
                    <CardDescription>{t("externalValidatorSoftware.securityApi.endpointsDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={CODE_SNIPPETS.securityEndpoints} testId="code-security-endpoints" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="border-yellow-500/30 bg-yellow-500/5" data-testid="card-security-warning">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">{t("externalValidatorSoftware.securityApi.warningTitle")}</h4>
                    <p className="text-sm text-muted-foreground">{t("externalValidatorSoftware.securityApi.warningText")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b" id="features">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.features.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.features.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_KEYS.map((key, index) => {
              const Icon = FEATURE_ICONS[index];
              return (
                <Card key={key} className="hover-elevate">
                  <CardContent className="pt-6">
                    <Icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{t(`externalValidatorSoftware.features.items.${key}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`externalValidatorSoftware.features.items.${key}.description`)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Monitoring */}
      <section className="py-16 border-b bg-muted/30" id="monitoring">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.monitoring.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.monitoring.subtitle")}
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
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.ports.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.ports.subtitle")}
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
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.faq.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.faq.subtitle")}
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible defaultValue="faq-stake">
              {FAQ_KEYS.map((key) => (
                <AccordionItem key={key} value={`faq-${key}`}>
                  <AccordionTrigger className="text-left" data-testid={`accordion-faq-${key}`}>
                    {t(`externalValidatorSoftware.faq.items.${key}.question`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t(`externalValidatorSoftware.faq.items.${key}.answer`)}
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
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.support.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("externalValidatorSoftware.support.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t("externalValidatorSoftware.support.docs.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("externalValidatorSoftware.support.docs.description")}</p>
                <Button variant="outline" className="gap-2" asChild data-testid="link-docs">
                  <a href="https://docs.tburn.io/validators" target="_blank" rel="noopener noreferrer">
                    {t("common.view")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center">
                <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t("externalValidatorSoftware.support.discord.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("externalValidatorSoftware.support.discord.description")}</p>
                <Button variant="outline" className="gap-2" asChild data-testid="link-discord">
                  <a href="https://discord.gg/tburn" target="_blank" rel="noopener noreferrer">
                    {t("common.connect")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center">
                <Clock className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t("externalValidatorSoftware.support.enterprise.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("externalValidatorSoftware.support.enterprise.description")}</p>
                <Button variant="outline" className="gap-2" asChild data-testid="link-support">
                  <a href="mailto:validators@tburn.io">
                    {t("common.connect")}
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
            <h2 className="text-3xl font-bold mb-4">{t("externalValidatorSoftware.cta.title")}</h2>
            <p className="text-muted-foreground mb-8">
              {t("externalValidatorSoftware.cta.subtitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="gap-2" asChild data-testid="button-download-cta">
                <a href={linuxRelease?.downloadUrl || "/downloads/tburn-validator-node-v1.1.0-linux-x64.tar.gz"} download>
                  <Download className="h-5 w-5" />
                  {t("externalValidatorSoftware.cta.download")}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="link-program-cta">
                <Link href="/external-validator-program">
                  <Play className="h-5 w-5 mr-2" />
                  {t("externalValidatorSoftware.cta.learnMore")}
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
