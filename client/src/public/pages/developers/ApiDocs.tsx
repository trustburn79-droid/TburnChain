import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Code, Key, AlertTriangle, Copy, ArrowRight, Check,
  Layers, FileText, Zap, Terminal, Shield, Clock,
  Database, Wallet, FileCode, Activity, Globe, Lock,
  Server, Cpu, RefreshCw, Box, Hash, Search, Filter,
  Coins, Link2, TrendingUp, Flame
} from "lucide-react";
import { SiJavascript, SiPython, SiGo, SiRust, SiTypescript } from "react-icons/si";

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30",
    POST: "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30",
    PUT: "bg-[#ffd700]/10 text-[#ffd700] border-[#ffd700]/30",
    DELETE: "bg-[#ff0055]/10 text-[#ff0055] border-[#ff0055]/30",
    PATCH: "bg-[#7000ff]/10 text-[#7000ff] border-[#7000ff]/30",
    WS: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };
  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded font-bold border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
}

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 opacity-0 group-hover:opacity-100 transition"
        data-testid="button-copy-code"
      >
        {copied ? <Check className="w-3 h-3 text-[#00ff9d]" /> : <Copy className="w-3 h-3 text-gray-400" />}
      </button>
      <div className="bg-gray-900 dark:bg-[#0d0d12] border border-gray-300 dark:border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 dark:text-gray-400 overflow-x-auto whitespace-pre">
        {code}
      </div>
    </div>
  );
}

function ParamTable({ params }: { params: Array<{ name: string; type: string; required?: boolean; desc: string }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b border-gray-300 dark:border-white/10">
          <tr>
            <th className="py-2 text-left">Parameter</th>
            <th className="py-2 text-left">Type</th>
            <th className="py-2 text-left">Required</th>
            <th className="py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 dark:text-gray-300">
          {params.map((param, index) => (
            <tr key={index} className="border-b border-gray-200 dark:border-white/5">
              <td className="py-2"><code className="text-[#00f0ff]">{param.name}</code></td>
              <td className="py-2 text-gray-600 dark:text-gray-400 font-mono text-xs">{param.type}</td>
              <td className="py-2">
                {param.required ? (
                  <span className="text-[#00ff9d] text-xs">Required</span>
                ) : (
                  <span className="text-gray-500 text-xs">Optional</span>
                )}
              </td>
              <td className="py-2 text-gray-600 dark:text-gray-400">{param.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ApiDocs() {
  const { t } = useTranslation();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const sidebarLinks = [
    { id: "overview", label: t("apiDocs.sidebar.overview", "Overview"), icon: Globe },
    { id: "authentication", label: t("apiDocs.sidebar.authentication", "Authentication"), icon: Key },
    { id: "rate-limits", label: t("apiDocs.sidebar.rateLimits", "Rate Limits"), icon: Clock },
    { id: "pagination", label: "Pagination", icon: Filter },
    { id: "error-codes", label: "Error Codes", icon: AlertTriangle },
    { section: "PUBLIC API" },
    { id: "public-tps", label: "TPS (Public)", icon: Zap },
    { section: "ADVANCED TECH (5 Core)" },
    { id: "advanced-overview", label: "Overview & TPS", icon: Zap },
    { id: "modular-da", label: "Modular DA", icon: Layers },
    { id: "restaking", label: "Restaking", icon: RefreshCw },
    { id: "zk-rollup", label: "ZK Rollup", icon: Shield },
    { id: "account-abstraction", label: "Account Abstraction", icon: Wallet },
    { id: "intent-network", label: "Intent Network", icon: Flame },
    { section: t("apiDocs.sidebar.endpoints", "ENDPOINTS") },
    { id: "block", label: t("apiDocs.sidebar.block", "Block"), icon: Box },
    { id: "transaction", label: t("apiDocs.sidebar.transaction", "Transaction"), icon: Activity },
    { id: "account", label: t("apiDocs.sidebar.account", "Account"), icon: Wallet },
    { id: "smart-contract", label: t("apiDocs.sidebar.smartContract", "Smart Contract"), icon: FileCode },
    { id: "token", label: t("apiDocs.sidebar.token", "Token"), icon: Coins },
    { id: "staking", label: t("apiDocs.sidebar.staking", "Staking"), icon: TrendingUp },
    { id: "bridge", label: t("apiDocs.sidebar.bridge", "Bridge"), icon: Link2 },
    { section: "ENTERPRISE" },
    { id: "consensus", label: "Consensus", icon: Shield },
    { id: "validators", label: "Validators", icon: Server },
    { id: "sharding", label: "Sharding", icon: Layers },
    { id: "ai-decisions", label: "AI Decisions", icon: Cpu },
    { section: t("apiDocs.sidebar.websocket", "WEBSOCKET") },
    { id: "realtime-events", label: t("apiDocs.sidebar.realtimeEvents", "Real-time Events"), icon: Zap },
  ];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://mainnet.tburn.io/api/v8");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const sdks = [
    { name: "JavaScript", icon: SiJavascript, color: "#ffd700", install: "npm install @tburn/sdk", hoverBorder: "hover:border-yellow-500/50" },
    { name: "TypeScript", icon: SiTypescript, color: "#3178c6", install: "npm install @tburn/sdk", hoverBorder: "hover:border-blue-500/50" },
    { name: "Python", icon: SiPython, color: "#3b82f6", install: "pip install tburn-sdk", hoverBorder: "hover:border-blue-400/50" },
    { name: "Go", icon: SiGo, color: "#00f0ff", install: "go get github.com/tburn/go-sdk", hoverBorder: "hover:border-cyan-500/50" },
    { name: "Rust", icon: SiRust, color: "#ff6b35", install: "cargo add tburn-sdk", hoverBorder: "hover:border-orange-500/50" },
  ];

  return (
    <main className="flex-grow relative z-10 pt-4 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Code className="w-3 h-3" /> {t("apiDocs.apiReference", "API Reference v8.0")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            TBURN Chain <span className="text-gradient">{t("apiDocs.title", "API Documentation")}</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-8">
            {t("apiDocs.subtitle", "Enterprise-grade REST API and WebSocket endpoints for building on TBURN Chain. Complete access to blockchain data, smart contracts, and real-time events.")}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <button 
              onClick={handleCopyUrl}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 font-mono text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10 transition"
              data-testid="button-copy-base-url"
            >
              <span className="text-[#7000ff]">{t("apiDocs.baseUrl", "Base URL")}:</span> https://mainnet.tburn.io/api/v8
              {copiedUrl ? <Check className="w-4 h-4 text-[#00ff9d]" /> : <Copy className="w-4 h-4" />}
            </button>
            <span className="text-gray-500">|</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">WebSocket: <code className="text-[#00f0ff]">wss://mainnet.tburn.io/ws</code></span>
            <span className="text-gray-500">|</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Chain ID: <code className="text-[#00ff9d]">5800</code></span>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block col-span-1">
              <div className="sticky top-24 space-y-1">
                {sidebarLinks.map((item, index) => (
                  "section" in item ? (
                    <div key={index} className="pt-6 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {item.section}
                    </div>
                  ) : (
                    <button 
                      key={index}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${
                        activeSection === item.id 
                          ? "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-medium border-l-2 border-[#00f0ff]" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      data-testid={`nav-${item.id}`}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                    </button>
                  )
                ))}

                <div className="pt-8 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t("apiDocs.sidebar.related", "RELATED")}
                </div>
                <Link href="/developers" className="block px-4 py-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition flex items-center gap-2">
                  <Layers className="w-4 h-4" /> {t("apiDocs.sidebar.developerHub", "Developer Hub")}
                </Link>
                <Link href="/developers/docs" className="block px-4 py-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {t("apiDocs.sidebar.fullDocumentation", "Full Documentation")}
                </Link>
                <Link href="/developers/examples" className="block px-4 py-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition flex items-center gap-2">
                  <Code className="w-4 h-4" /> {t("apiDocs.sidebar.codeExamples", "Code Examples")}
                </Link>
                <Link href="/developers/quickstart" className="block px-4 py-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> {t("apiDocs.sidebar.quickStartGuide", "Quick Start Guide")}
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="col-span-4 space-y-16">
              {/* Overview Section */}
              <section id="overview" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Globe className="w-8 h-8 text-[#00f0ff]" /> {t("apiDocs.overview.title", "API Overview")}
                </h2>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <Server className="w-8 h-8 text-[#00ff9d] mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t("apiDocs.overview.restfulApi", "RESTful API")}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("apiDocs.overview.restfulApiDesc", "JSON-based REST endpoints with comprehensive query parameters and filtering.")}</p>
                  </div>
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <Zap className="w-8 h-8 text-[#7000ff] mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t("apiDocs.overview.websocket", "WebSocket")}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("apiDocs.overview.websocketDesc", "Real-time streaming for blocks, transactions, and smart contract events.")}</p>
                  </div>
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <Shield className="w-8 h-8 text-[#ffd700] mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t("apiDocs.overview.enterpriseReady", "Enterprise Ready")}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("apiDocs.overview.enterpriseReadyDesc", "99.99% uptime SLA, dedicated support, and custom rate limits.")}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Network Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Chain ID</span><span className="text-[#00f0ff] font-mono">5800</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Active Shards</span><span className="text-[#00ff9d] font-mono">24 (scalable to 64)</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Validators</span><span className="text-[#ffd700] font-mono">587</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">TPS Capacity</span><span className="text-[#7000ff] font-mono">100,000</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Block Time</span><span className="text-gray-900 dark:text-white font-mono">100ms</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Address Format</span><span className="text-[#00f0ff] font-mono">tb1 (Bech32m)</span></div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">API Endpoints</h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div><span className="text-gray-600 dark:text-gray-400">REST:</span> <span className="text-[#00f0ff]">https://mainnet.tburn.io/api/v8</span></div>
                      <div><span className="text-gray-600 dark:text-gray-400">WebSocket:</span> <span className="text-[#00f0ff]">wss://mainnet.tburn.io/ws</span></div>
                      <div><span className="text-gray-600 dark:text-gray-400">RPC:</span> <span className="text-[#00f0ff]">https://mainnet.tburn.io/rpc</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t("apiDocs.overview.quickStart", "Quick Start")}</h3>
                  <CodeBlock code={`# Get the latest block
curl https://mainnet.tburn.io/api/v8/blocks/latest \\
  -H "X-API-Key: YOUR_API_KEY"

# Response
{
  "success": true,
  "data": {
    "number": 20750000,
    "hash": "tb1hash83b0a4f2c9d8e7b6a5f4c3d2e1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5",
    "timestamp": 1733493600,
    "transactions": 147,
    "gasUsed": "15000000",
    "validator": "tb1vqw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
    "shardId": 12
  }
}`} />
                </div>
              </section>

              {/* Authentication Section */}
              <section id="authentication" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Key className="w-8 h-8 text-[#ffd700]" /> {t("apiDocs.authentication.title", "Authentication")}
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">API Key Authentication</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      All API requests require authentication using an API key. Include your key in the request header:
                    </p>
                    <CodeBlock code={`curl https://mainnet.tburn.io/api/v8/blocks/latest \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`} />
                    
                    <div className="mt-6 p-4 rounded-lg bg-[#ffd700]/10 border border-[#ffd700]/30">
                      <p className="text-sm text-[#ffd700] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Never expose your API key in client-side code. Use server-side requests or environment variables.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Authentication Best Practices</h3>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-[#00ff9d] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Use Environment Variables</h4>
                          <p className="text-sm">Store API keys in environment variables, never hardcode them in source files.</p>
                          <CodeBlock code={`# .env file
TBURN_API_KEY=your_api_key_here

# Usage in Node.js
const apiKey = process.env.TBURN_API_KEY;`} />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-[#00f0ff] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Server-Side Only</h4>
                          <p className="text-sm">Never expose API keys in client-side JavaScript. Use a backend proxy for frontend apps.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RefreshCw className="w-5 h-5 text-[#7000ff] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Rotate Keys Regularly</h4>
                          <p className="text-sm">Rotate API keys every 90 days. Revoke compromised keys immediately via the Developer Portal.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Filter className="w-5 h-5 text-[#ffd700] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Use IP Allowlists</h4>
                          <p className="text-sm">Restrict API key usage to specific IP addresses for production environments.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Getting an API Key</h3>
                    <ol className="space-y-3 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] text-sm flex items-center justify-center flex-shrink-0">1</span>
                        <span>Create an account at <Link href="/developers" className="text-[#00f0ff] hover:underline">Developer Portal</Link></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] text-sm flex items-center justify-center flex-shrink-0">2</span>
                        <span>Navigate to API Keys section in your dashboard</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] text-sm flex items-center justify-center flex-shrink-0">3</span>
                        <span>Generate a new API key and securely store it</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">API Key Tiers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-500 border-b border-gray-300 dark:border-white/10">
                          <tr>
                            <th className="py-3 text-left">Tier</th>
                            <th className="py-3 text-left">Rate Limit</th>
                            <th className="py-3 text-left">WebSocket</th>
                            <th className="py-3 text-left">Support</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><span className="text-gray-600 dark:text-gray-400">Free</span></td>
                            <td className="py-3">100 req/min</td>
                            <td className="py-3">5 connections</td>
                            <td className="py-3">Community</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><span className="text-[#00f0ff]">Pro</span></td>
                            <td className="py-3">1,000 req/min</td>
                            <td className="py-3">50 connections</td>
                            <td className="py-3">Email (24h)</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><span className="text-[#ffd700]">Enterprise</span></td>
                            <td className="py-3">Unlimited</td>
                            <td className="py-3">Unlimited</td>
                            <td className="py-3">Dedicated (1h)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* Rate Limits Section */}
              <section id="rate-limits" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-[#ff6b35]" /> {t("apiDocs.rateLimits.title", "Rate Limits")}
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rate Limit Headers</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Every API response includes rate limit information in the headers:
                    </p>
                    <CodeBlock code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1733493660
X-RateLimit-Window: 60`} />
                    
                    <ParamTable params={[
                      { name: "X-RateLimit-Limit", type: "integer", desc: "Maximum requests allowed per window" },
                      { name: "X-RateLimit-Remaining", type: "integer", desc: "Requests remaining in current window" },
                      { name: "X-RateLimit-Reset", type: "timestamp", desc: "Unix timestamp when the window resets" },
                      { name: "X-RateLimit-Window", type: "integer", desc: "Window duration in seconds" },
                    ]} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Endpoint-Specific Limits</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-500 border-b border-gray-300 dark:border-white/10">
                          <tr>
                            <th className="py-3 text-left">Endpoint Category</th>
                            <th className="py-3 text-left">Free Tier</th>
                            <th className="py-3 text-left">Pro Tier</th>
                            <th className="py-3 text-left">Enterprise</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3">Block / Transaction</td>
                            <td className="py-3">100/min</td>
                            <td className="py-3">1,000/min</td>
                            <td className="py-3">Unlimited</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3">Account Balance</td>
                            <td className="py-3">50/min</td>
                            <td className="py-3">500/min</td>
                            <td className="py-3">Unlimited</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3">Smart Contract Calls</td>
                            <td className="py-3">30/min</td>
                            <td className="py-3">300/min</td>
                            <td className="py-3">Unlimited</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3">Historical Data</td>
                            <td className="py-3">20/min</td>
                            <td className="py-3">200/min</td>
                            <td className="py-3">Unlimited</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">429 Too Many Requests</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      When rate limited, the API returns a 429 status with retry information:
                    </p>
                    <CodeBlock code={`{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please retry after 45 seconds.",
    "retryAfter": 45
  }
}`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Idempotency Keys</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      For mutating operations (POST, PUT, DELETE), use idempotency keys to safely retry requests without duplicating actions:
                    </p>
                    <CodeBlock code={`# Include X-Idempotency-Key header for safe retries
curl -X POST https://mainnet.tburn.io/api/v8/transactions/send \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "X-Idempotency-Key: unique-request-id-12345" \\
  -H "Content-Type: application/json" \\
  -d '{
    "signedTx": "tb1signedtx..."
  }'

# Response includes idempotency status
{
  "success": true,
  "data": {
    "hash": "tb1txhash5d4e3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0",
    "status": "pending"
  },
  "idempotencyKey": "unique-request-id-12345",
  "cached": false
}`} />
                    <div className="mt-4 p-4 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                      <p className="text-sm text-[#00f0ff]">
                        Idempotency keys are stored for 24 hours. Reusing a key within this period returns the cached response.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rate Limit Best Practices</h3>
                    <div className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">1.</span>
                        <span><strong>Implement exponential backoff</strong> - Start with 1 second delay, double on each retry up to 32 seconds max.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">2.</span>
                        <span><strong>Cache responses</strong> - Cache block and transaction data locally to reduce API calls.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">3.</span>
                        <span><strong>Use WebSocket</strong> - For real-time data, use WebSocket subscriptions instead of polling.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">4.</span>
                        <span><strong>Batch requests</strong> - Use batch endpoints when fetching multiple resources.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#00ff9d]">5.</span>
                        <span><strong>Monitor headers</strong> - Check X-RateLimit-Remaining and throttle before hitting limits.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Public TPS API Section */}
              <section id="public-tps" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-[#ffd700]" /> Public TPS API
                </h2>
                
                <div className="bg-gradient-to-r from-[#ffd700]/10 to-[#00ff9d]/10 border border-[#ffd700]/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-[#ffd700]" />
                    <span className="text-[#ffd700] font-semibold">Open Access API</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    This public API requires <strong>no authentication</strong> and is designed for external websites to display TBURN network statistics. 
                    CORS is enabled for all domains to support ecosystem development.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* GET /api/public/v1/tps */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/api/public/v1/tps</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Returns real-time TPS (Transactions Per Second) and network statistics. Optimized for external website integration.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-1">Rate Limit</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">60 req/min</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-1">Cache TTL</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">30 seconds</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-1">Auth Required</div>
                        <div className="text-lg font-bold text-[#00ff9d]">No</div>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "tps": 155324,
    "blocks": 45929351,
    "dailyTxs": 6428339717,
    "uptime": "99.99%",
    "timestamp": "2026-01-25T00:15:00.000Z",
    "network": "mainnet"
  }
}`} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-3">Response Headers</h4>
                    <ParamTable params={[
                      { name: "X-RateLimit-Limit", type: "number", desc: "Maximum requests per minute (60)" },
                      { name: "X-RateLimit-Remaining", type: "number", desc: "Remaining requests in current window" },
                      { name: "X-RateLimit-Reset", type: "number", desc: "Seconds until rate limit resets" },
                      { name: "X-Cache", type: "string", desc: "HIT or MISS - indicates cache status" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-3">Usage Example</h4>
                    <CodeBlock language="javascript" code={`// Fetch TPS data from external website
async function getTBurnTPS() {
  const response = await fetch('https://tburn-blockchain-mainnet-explorer.replit.app/api/public/v1/tps');
  const json = await response.json();
  
  if (json.success) {
    console.log('Current TPS:', json.data.tps);
    console.log('Block Height:', json.data.blocks);
  }
}

// Update every 30 seconds
getTBurnTPS();
setInterval(getTBurnTPS, 30000);`} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-3">Rate Limit Error (429)</h4>
                    <CodeBlock code={`{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45
}`} />
                  </div>
                </div>
              </section>

              {/* Advanced Tech API Section - 5 Core Technologies */}
              <section id="advanced-overview" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-[#7000ff]" /> Advanced Tech API (5 Core Technologies)
                </h2>
                
                <div className="bg-gradient-to-r from-[#7000ff]/10 to-[#00f0ff]/10 border border-[#7000ff]/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-[#7000ff]" />
                    <span className="text-[#7000ff] font-semibold">2026 Next-Gen Technology Stack</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Enterprise-grade APIs for TBURN's 5 core technologies: <strong>Modular DA</strong>, <strong>Restaking</strong>, 
                    <strong>ZK Rollup</strong>, <strong>Account Abstraction</strong>, and <strong>Intent Architecture</strong>.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-[#00ff9d]">1,900%</div>
                      <div className="text-xs text-gray-500">TPS Increase</div>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-[#00f0ff]">95%</div>
                      <div className="text-xs text-gray-500">Cost Reduction</div>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-[#7000ff]">Web2</div>
                      <div className="text-xs text-gray-500">Level UX</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* GET /api/advanced-tech/overview */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/api/advanced-tech/overview</code>
                      <span className="px-2 py-0.5 text-xs rounded bg-green-500/10 text-green-500 border border-green-500/20">Public</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Returns comprehensive overview of all 5 advanced technologies including TPS breakdown, metrics, and performance data.
                    </p>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "tpsBreakdown": {
      "l1FastPathTPS": 97000,
      "l1AATPS": 1200,
      "l2TPS": 15000,
      "totalCombinedTPS": 113200
    },
    "modularDA": { "totalBlobs": 45000, "averageLatency": 12 },
    "restaking": { "totalRestaked": "2500000000", "avsCount": 4, "averageAPY": 12.5 },
    "zkRollup": { "currentBatch": 8500, "gasSavingsPercent": 95 },
    "accountAbstraction": { "totalWallets": 125000, "totalUserOps": 890000 },
    "intentNetwork": { "totalIntents": 45000, "activeSolvers": 5 }
  }
}`} />
                  </div>

                  {/* GET /api/advanced-tech/tps-breakdown */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/api/advanced-tech/tps-breakdown</code>
                      <span className="px-2 py-0.5 text-xs rounded bg-green-500/10 text-green-500 border border-green-500/20">Public</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Detailed TPS breakdown by layer: L1 FastPath (24 shards), L1 Account Abstraction, and L2 ZK Rollup.
                    </p>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "l1FastPath": {
      "currentTPS": 97000,
      "activeShards": 24,
      "description": "L1 기본 트랜잭션 처리 (8μs/TX 목표)"
    },
    "l1AccountAbstraction": {
      "currentTPS": 1200,
      "totalWallets": 125000,
      "description": "ERC-4337 UserOps 처리"
    },
    "l2ZKRollup": {
      "currentTPS": 15000,
      "gasSavingsPercent": 95,
      "description": "L2 ZK Rollup 트랜잭션"
    }
  }
}`} />
                  </div>

                  {/* GET /api/advanced-tech/feature-flags */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/api/advanced-tech/feature-flags</code>
                      <span className="px-2 py-0.5 text-xs rounded bg-green-500/10 text-green-500 border border-green-500/20">Public</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Check which advanced technologies are currently enabled on the network.
                    </p>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "featureFlags": {
      "ENABLE_MODULAR_DA": true,
      "ENABLE_RESTAKING": true,
      "ENABLE_ZK_ROLLUP": true,
      "ENABLE_ACCOUNT_ABSTRACTION": true,
      "ENABLE_INTENT_ARCHITECTURE": true
    }
  }
}`} />
                  </div>

                  {/* GET /api/advanced-tech/adapters */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/api/advanced-tech/adapters</code>
                      <span className="px-2 py-0.5 text-xs rounded bg-green-500/10 text-green-500 border border-green-500/20">Public</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Detailed status and metrics for all 5 technology adapters including queue depths, circuit breaker states, and performance metrics.
                    </p>
                    <ParamTable params={[
                      { name: "shardDA", type: "object", desc: "Modular DA adapter metrics (compression, blob submissions)" },
                      { name: "enhancedStaking", type: "object", desc: "Restaking adapter metrics (AVS, APY)" },
                      { name: "zkBridge", type: "object", desc: "ZK Rollup bridge adapter (fast withdrawals)" },
                      { name: "smartWallet", type: "object", desc: "Account Abstraction adapter (gasless TX, session keys)" },
                      { name: "intentDex", type: "object", desc: "Intent network adapter (MEV protection, solvers)" },
                    ]} />
                  </div>
                </div>
              </section>

              {/* Block Endpoints Section */}
              <section id="block" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Box className="w-8 h-8 text-[#00ff9d]" /> {t("apiDocs.block.title", "Block Endpoints")}
                </h2>
                
                <div className="space-y-6">
                  {/* Get Block by Number */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/blocks/{'{blockNumber}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Retrieve detailed information about a specific block by its number or use 'latest' for the most recent block.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "blockNumber", type: "string | integer", required: true, desc: "Block number or 'latest'" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "includeTxs", type: "boolean", desc: "Include full transaction objects (default: false)" },
                      { name: "includeReceipts", type: "boolean", desc: "Include transaction receipts (default: false)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "number": 20750000,
    "hash": "tb1hash83b0a4f2c9d8e7b6a5f4c3d2e1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6",
    "parentHash": "tb1hash1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
    "timestamp": 1733493600,
    "validator": "tb1vqw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
    "validatorName": "TBURN Enterprise Node #1",
    "size": 45678,
    "gasUsed": "15000000",
    "gasLimit": "30000000",
    "baseFeePerGas": "1000000000",
    "transactionCount": 147,
    "stateRoot": "tb1stateabc123def456789abc123def456789abc123def456789abc123",
    "receiptsRoot": "tb1rcptdef456789abc123def456789abc123def456789abc123def456",
    "shardId": 12,
    "consensusType": "TBFT",
    "finalized": true,
    "transactions": [...] // if includeTxs=true
  }
}`} />
                  </div>

                  {/* Get Latest Blocks */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/blocks</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Retrieve a paginated list of recent blocks with optional filtering.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page, max 100 (default: 20)" },
                      { name: "fromBlock", type: "integer", desc: "Start from block number" },
                      { name: "toBlock", type: "integer", desc: "End at block number" },
                      { name: "validator", type: "address", desc: "Filter by validator address (tb1v...)" },
                      { name: "shardId", type: "integer", desc: "Filter by shard ID (0-23)" },
                      { name: "cursor", type: "string", desc: "Cursor for pagination (alternative to page)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "blocks": [
      {
        "number": 20750000,
        "hash": "tb1hash83b0a4f2c9d8e7b6...",
        "timestamp": 1733493600,
        "transactionCount": 147,
        "validator": "tb1vqw9d5cf8xkplm4gt7...",
        "shardId": 12,
        "gasUsed": "15000000"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 20750000,
      "hasMore": true,
      "nextCursor": "tb1cursor_20749980"
    }
  }
}`} />
                  </div>

                  {/* Get Block Transactions */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/blocks/{'{blockNumber}'}/transactions</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get all transactions in a specific block with pagination support.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page, max 100 (default: 50)" },
                      { name: "type", type: "string", desc: "Filter by tx type: transfer, contract, stake, burn" },
                    ]} />
                  </div>
                </div>
              </section>

              {/* Transaction Endpoints Section */}
              <section id="transaction" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Activity className="w-8 h-8 text-[#00f0ff]" /> {t("apiDocs.transaction.title", "Transaction Endpoints")}
                </h2>
                
                <div className="space-y-6">
                  {/* Get Transaction */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/transactions/{'{txHash}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Retrieve detailed information about a transaction by its hash.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "txHash", type: "string", required: true, desc: "Transaction hash (tb1tx prefixed)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "hash": "tb1tx5d4e3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b",
    "blockNumber": 20750000,
    "blockHash": "tb1hash83b0a4f2c9d8e7b6...",
    "transactionIndex": 42,
    "shardId": 12,
    "from": "tb1qx8e6dg9ylqnm5ht8wt46s6j0mkqq8pyr9arqdf",
    "to": "tb1qy9f7eh0zmron6ju9xu57t7k1nlrr9qzsa2bseg",
    "value": "1000000000000000000",
    "gasPrice": "10000000000000",
    "gasUsed": "72",
    "gasLimit": "100",
    "nonce": 156,
    "input": "tb1data",
    "type": "transfer",
    "status": "success",
    "timestamp": 1733493600,
    "confirmations": 125,
    "fee": "720000000000000",
    "logs": [],
    "decodedInput": null
  }
}`} />
                  </div>

                  {/* Send Transaction */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/transactions/send</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Broadcast a signed transaction to the network.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Request Body</h4>
                    <ParamTable params={[
                      { name: "signedTx", type: "string", required: true, desc: "Signed transaction hex string" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Request Example</h4>
                    <CodeBlock code={`curl -X POST https://mainnet.tburn.io/api/v8/transactions/send \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "X-Idempotency-Key: tx-unique-12345" \\
  -H "Content-Type: application/json" \\
  -d '{
    "signedTx": "tb1signedtx28ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83"
  }'`} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "hash": "tb1tx5d4e3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b",
    "status": "pending",
    "shardId": 12,
    "estimatedConfirmation": 2
  }
}`} />
                  </div>

                  {/* Get Transaction Receipt */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/transactions/{'{txHash}'}/receipt</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the receipt of a mined transaction including logs and status.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "transactionHash": "tb1tx5d4e3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d...",
    "blockNumber": 20750000,
    "blockHash": "tb1hash83b0a4f2c9d8e7b6a5f4c3d2e1b0a9f8e7d6...",
    "shardId": 12,
    "status": 1,
    "gasUsed": "72",
    "cumulativeGasUsed": "5250000",
    "effectiveGasPrice": "10000000000000",
    "logs": [
      {
        "address": "tb1cz0g8fj1xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
        "topics": ["tb1topicTransfer...", "tb1topic_sender...", "tb1topic_receiver..."],
        "data": "tb1data_amount...",
        "logIndex": 0
      }
    ],
    "logsBloom": "tb1bloom00000..."
  }
}`} />
                  </div>

                  {/* Search Transactions */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/transactions</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Search and filter transactions with advanced query options.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page, max 100 (default: 20)" },
                      { name: "from", type: "address", desc: "Filter by sender address" },
                      { name: "to", type: "address", desc: "Filter by recipient address" },
                      { name: "type", type: "string", desc: "Transaction type: transfer, contract, stake, burn" },
                      { name: "status", type: "string", desc: "Filter by status: success, failed, pending" },
                      { name: "minValue", type: "string", desc: "Minimum value in wei" },
                      { name: "maxValue", type: "string", desc: "Maximum value in wei" },
                      { name: "startTime", type: "timestamp", desc: "Start timestamp (Unix)" },
                      { name: "endTime", type: "timestamp", desc: "End timestamp (Unix)" },
                    ]} />
                  </div>
                </div>
              </section>

              {/* Account Endpoints Section */}
              <section id="account" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-[#7000ff]" /> {t("apiDocs.account.title", "Account Endpoints")}
                </h2>
                
                <div className="space-y-6">
                  {/* Get Account Balance */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/accounts/{'{address}'}/balance</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the native token balance and nonce for an address.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "address": "tb1qw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
    "balance": "5000000000000000000",
    "balanceFormatted": "5.0 TBURN",
    "nonce": 42,
    "isContract": false
  }
}`} />
                  </div>

                  {/* Get Account Info */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/accounts/{'{address}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get comprehensive account information including balances, tokens, and activity.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "includeTokens", type: "boolean", desc: "Include TBC-20 token balances (default: false)" },
                      { name: "includeNFTs", type: "boolean", desc: "Include TBC-721/1155 NFTs (default: false)" },
                      { name: "includeStaking", type: "boolean", desc: "Include staking information (default: false)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "address": "tb1qw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
    "balance": "5000000000000000000",
    "nonce": 42,
    "isContract": false,
    "label": "TBURN Whale",
    "firstSeen": 1699000000,
    "lastSeen": 1733493600,
    "txCount": 1547,
    "tokens": [
      {
        "contract": "tb1qkwghdmv3...",
        "symbol": "USDT",
        "decimals": 6,
        "balance": "10000000000"
      }
    ],
    "staking": {
      "stakedAmount": "1000000000000000000000",
      "rewards": "50000000000000000000",
      "delegations": [...]
    }
  }
}`} />
                  </div>

                  {/* Get Account Transactions */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/accounts/{'{address}'}/transactions</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get paginated transaction history for an address.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page, max 100 (default: 20)" },
                      { name: "direction", type: "string", desc: "Filter: 'in', 'out', or 'both' (default)" },
                      { name: "type", type: "string", desc: "Transaction type filter" },
                    ]} />
                  </div>

                  {/* Get Token Balances */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/accounts/{'{address}'}/tokens</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get all TBC-20 token balances for an address.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "tokens": [
      {
        "contract": "tb1qkwghdmv3...",
        "name": "Tether USD",
        "symbol": "USDT",
        "decimals": 6,
        "balance": "10000000000",
        "balanceFormatted": "10,000 USDT",
        "valueUSD": "10000.00"
      },
      {
        "contract": "tb1qz0g8fj1...",
        "name": "Wrapped Bitcoin",
        "symbol": "WBTC",
        "decimals": 8,
        "balance": "50000000",
        "balanceFormatted": "0.5 WBTC",
        "valueUSD": "21500.00"
      }
    ],
    "totalValueUSD": "31500.00"
  }
}`} />
                  </div>
                </div>
              </section>

              {/* Smart Contract Endpoints Section */}
              <section id="smart-contract" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <FileCode className="w-8 h-8 text-[#ffd700]" /> {t("apiDocs.smartContract.title", "Smart Contract Endpoints")}
                </h2>
                
                <div className="space-y-6">
                  {/* Get Contract Info */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/contracts/{'{address}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get detailed information about a deployed smart contract.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "address": "tb1qz0g8fj1...",
    "name": "TBURN Token",
    "symbol": "TBURN",
    "type": "TBC-20",
    "verified": true,
    "compiler": "solc 0.8.19",
    "optimization": true,
    "runs": 200,
    "creator": "tb1qx8e6dg9...",
    "creationTx": "tb1txCreateTx...",
    "creationBlock": 1000000,
    "balance": "0",
    "txCount": 50000,
    "abi": [...],
    "sourceCode": "// SPDX-License-Identifier..."
  }
}`} />
                  </div>

                  {/* Call Contract Method (Read) */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/contracts/{'{address}'}/call</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Call a read-only contract method without creating a transaction.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Request Body</h4>
                    <ParamTable params={[
                      { name: "method", type: "string", required: true, desc: "Method name to call" },
                      { name: "params", type: "array", desc: "Method parameters" },
                      { name: "abi", type: "array", desc: "Contract ABI (optional if verified)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Request Example</h4>
                    <CodeBlock code={`curl -X POST https://mainnet.tburn.io/api/v8/contracts/tb1cqkwghdmv3.../call \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "balanceOf",
    "params": ["tb1qw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce"]
  }'`} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "result": "1000000000000000000000",
    "decodedResult": {
      "type": "uint256",
      "value": "1000000000000000000000",
      "formatted": "1000 TBURN"
    }
  }
}`} />
                  </div>

                  {/* Get Contract Events */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/contracts/{'{address}'}/events</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get decoded event logs emitted by a contract.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page, max 100 (default: 20)" },
                      { name: "event", type: "string", desc: "Filter by event name (e.g., 'Transfer')" },
                      { name: "fromBlock", type: "integer", desc: "Start block number" },
                      { name: "toBlock", type: "integer", desc: "End block number" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "events": [
      {
        "transactionHash": "tb1tx5d4e3c2b1a0f9e8d7c6b5a4f...",
        "blockNumber": 20750000,
        "logIndex": 0,
        "shardId": 12,
        "event": "Transfer",
        "args": {
          "from": "tb1qx8e6dg9ylqnm5ht8wt46s6j0mkqq...",
          "to": "tb1qy9f7eh0zmron6ju9xu57t7k1nlrr...",
          "value": "1000000000000000000"
        },
        "timestamp": 1733493600
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5000
    }
  }
}`} />
                  </div>

                  {/* Verify Contract */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/contracts/{'{address}'}/verify</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Submit source code for contract verification.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Request Body</h4>
                    <ParamTable params={[
                      { name: "sourceCode", type: "string", required: true, desc: "Solidity source code" },
                      { name: "compiler", type: "string", required: true, desc: "Compiler version (e.g., 'v0.8.19')" },
                      { name: "optimization", type: "boolean", desc: "Optimization enabled (default: false)" },
                      { name: "runs", type: "integer", desc: "Optimization runs (default: 200)" },
                      { name: "constructorArgs", type: "string", desc: "ABI-encoded constructor arguments" },
                    ]} />
                  </div>
                </div>
              </section>

              {/* Token Endpoints Section */}
              <section id="token" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Coins className="w-8 h-8 text-[#ffd700]" /> {t("apiDocs.token.title", "Token Endpoints")}
                </h2>
                
                <div className="space-y-6">
                  {/* Get Token List */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/tokens</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Retrieve a list of all tokens on the TBURN Chain.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page (default: 20, max: 100)" },
                      { name: "type", type: "string", desc: "Token type filter: 'TBC-20', 'TBC-721', 'TBC-1155'" },
                      { name: "verified", type: "boolean", desc: "Filter verified tokens only" },
                      { name: "sortBy", type: "string", desc: "Sort field: 'holders', 'transfers', 'marketCap'" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "tokens": [
      {
        "address": "tb1qw9d5cf8...",
        "name": "TBURN Token",
        "symbol": "TBURN",
        "decimals": 18,
        "type": "TBC-20",
        "totalSupply": "1000000000000000000000000000",
        "holders": 150000,
        "transfers": 2500000,
        "verified": true,
        "logo": "https://tburn.io/assets/tburn-logo.png"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5000
    }
  }
}`} />
                  </div>

                  {/* Get Token Details */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/tokens/{'{address}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get detailed information about a specific token.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "address", type: "string", required: true, desc: "Token contract address" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "address": "tb1qw9d5cf8...",
    "name": "TBURN Token",
    "symbol": "TBURN",
    "decimals": 18,
    "type": "TBC-20",
    "totalSupply": "1000000000000000000000000000",
    "circulatingSupply": "750000000000000000000000000",
    "burnedAmount": "250000000000000000000000000",
    "holders": 150000,
    "transfers": 2500000,
    "verified": true,
    "contractCreator": "tb1qw9d5...",
    "createdAt": 1700000000,
    "website": "https://tburn.io",
    "social": {
      "twitter": "@tburnchain",
      "discord": "https://discord.gg/uaPFkUkfN2"
    }
  }
}`} />
                  </div>

                  {/* Get Token Holders */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/tokens/{'{address}'}/holders</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get a list of token holders sorted by balance.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page (default: 50, max: 200)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "holders": [
      {
        "address": "tb1qw9d5cf8...",
        "balance": "500000000000000000000000",
        "percentage": "50.00",
        "rank": 1
      },
      {
        "address": "tb1qx8e6dg9...",
        "balance": "100000000000000000000000",
        "percentage": "10.00",
        "rank": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150000
    }
  }
}`} />
                  </div>

                  {/* Get Token Transfers */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/tokens/{'{address}'}/transfers</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get token transfer history.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page (default: 20, max: 100)" },
                      { name: "from", type: "string", desc: "Filter by sender address" },
                      { name: "to", type: "string", desc: "Filter by recipient address" },
                      { name: "fromBlock", type: "integer", desc: "Start block number" },
                      { name: "toBlock", type: "integer", desc: "End block number" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "transfers": [
      {
        "transactionHash": "tb1tx5d4e3c2b1a0f9e8d...",
        "blockNumber": 20750000,
        "shardId": 12,
        "from": "tb1qx8e6dg9ylqnm5ht8wt46...",
        "to": "tb1qy9f7eh0zmron6ju9xu57...",
        "value": "1000000000000000000",
        "timestamp": 1733493600
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2500000
    }
  }
}`} />
                  </div>
                </div>
              </section>

              {/* Staking Endpoints Section */}
              <section id="staking" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-[#00ff9d]" /> {t("apiDocs.staking.title", "Staking Endpoints")}
                </h2>
                
                <div className="space-y-6">
                  {/* Get Validators */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/staking/validators</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get a list of all validators on the network.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "status", type: "string", desc: "Filter by status: 'active', 'inactive', 'jailed'" },
                      { name: "sortBy", type: "string", desc: "Sort field: 'stake', 'delegators', 'uptime', 'commission'" },
                      { name: "order", type: "string", desc: "Sort order: 'asc' or 'desc' (default: 'desc')" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "validators": [
      {
        "address": "tb1vqw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
        "name": "TBURN Foundation",
        "status": "active",
        "stake": "10000000000000000000000000",
        "delegators": 5000,
        "commission": "5.00",
        "uptime": "99.98",
        "blocksProposed": 150000,
        "shardAssignment": [0, 3, 7, 15],
        "rewards": "50000000000000000000000"
      }
    ],
    "totalValidators": 587,
    "activeValidators": 585,
    "totalStake": "587000000000000000000000000"
  }
}`} />
                  </div>

                  {/* Get Delegations */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/staking/delegations/{'{address}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get all delegations for a specific address.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "address", type: "string", required: true, desc: "Delegator wallet address" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "delegations": [
      {
        "validator": "tb1vqw9d5cf8xkplm4gt7vs35...",
        "validatorName": "TBURN Foundation",
        "amount": "1000000000000000000000",
        "rewards": "50000000000000000000",
        "shardAssignment": [0, 5, 12],
        "delegatedAt": 1730000000
      }
    ],
    "totalDelegated": "2500000000000000000000",
    "totalRewards": "125000000000000000000"
  }
}`} />
                  </div>

                  {/* Delegate Stake */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/staking/delegate</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Delegate TBURN tokens to a validator.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Request Body</h4>
                    <ParamTable params={[
                      { name: "validator", type: "string", required: true, desc: "Validator address to delegate to" },
                      { name: "amount", type: "string", required: true, desc: "Amount to delegate in wei" },
                      { name: "signature", type: "string", required: true, desc: "Signed transaction data" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "transactionHash": "tb1txabc123def456789...",
    "validator": "tb1vqw9d5cf8xkplm4gt7...",
    "amount": "1000000000000000000000",
    "shardId": 5,
    "status": "pending"
  }
}`} />
                  </div>

                  {/* Undelegate Stake */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/staking/undelegate</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Undelegate TBURN tokens from a validator. Subject to 21-day unbonding period.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Request Body</h4>
                    <ParamTable params={[
                      { name: "validator", type: "string", required: true, desc: "Validator address to undelegate from" },
                      { name: "amount", type: "string", required: true, desc: "Amount to undelegate in wei" },
                      { name: "signature", type: "string", required: true, desc: "Signed transaction data" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "transactionHash": "tb1txdef456789abc123...",
    "validator": "tb1vqw9d5cf8xkplm4gt7...",
    "amount": "500000000000000000000",
    "unbondingCompletesAt": 1735000000,
    "shardId": 5,
    "status": "unbonding"
  }
}`} />
                  </div>

                  {/* Get Rewards */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/staking/rewards/{'{address}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get pending staking rewards for an address.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "address", type: "string", required: true, desc: "Delegator wallet address" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "totalRewards": "125000000000000000000",
    "rewards": [
      {
        "validator": "tb1vqw9d5cf8xkplm4gt7vs35...",
        "validatorName": "TBURN Foundation",
        "pending": "75000000000000000000",
        "claimed": "500000000000000000000"
      }
    ],
    "lastClaimedAt": 1733400000
  }
}`} />
                  </div>
                </div>
              </section>

              {/* Bridge Endpoints Section */}
              <section id="bridge" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Link2 className="w-8 h-8 text-[#7000ff]" /> {t("apiDocs.bridge.title", "Bridge Endpoints")}
                </h2>
                
                <div className="space-y-6">
                  {/* Get Supported Chains */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/bridge/chains</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get a list of supported chains for cross-chain transfers.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "chains": [
      {
        "chainId": 1,
        "name": "Ethereum",
        "symbol": "ETH",
        "bridgeContract": "tb1qw9d5cf8...",
        "status": "active",
        "minTransfer": "10000000000000000",
        "maxTransfer": "1000000000000000000000",
        "fee": "0.1",
        "estimatedTime": 600
      },
      {
        "chainId": 56,
        "name": "BNB Chain",
        "symbol": "BNB",
        "bridgeContract": "tb1qx8e6dg9...",
        "status": "active",
        "minTransfer": "10000000000000000",
        "maxTransfer": "500000000000000000000",
        "fee": "0.05",
        "estimatedTime": 300
      },
      {
        "chainId": 137,
        "name": "Polygon",
        "symbol": "MATIC",
        "bridgeContract": "tb1qy9f7eh0...",
        "status": "active",
        "minTransfer": "1000000000000000",
        "maxTransfer": "100000000000000000000",
        "fee": "0.02",
        "estimatedTime": 180
      }
    ]
  }
}`} />
                  </div>

                  {/* Get Bridge Transfers */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/bridge/transfers</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get cross-chain transfer history.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "address", type: "string", desc: "Filter by sender or recipient address" },
                      { name: "sourceChain", type: "integer", desc: "Filter by source chain ID" },
                      { name: "destChain", type: "integer", desc: "Filter by destination chain ID" },
                      { name: "status", type: "string", desc: "Filter by status: 'pending', 'completed', 'failed'" },
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page (default: 20, max: 100)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "transfers": [
      {
        "id": "bridge_12345",
        "sourceTxHash": "tb1txsource123abc...",
        "destTxHash": "tb1txdest456def...",
        "sourceChain": 1,
        "destChain": 5800,
        "from": "tb1qx8e6dg9...",
        "to": "tb1qy9f7eh0...",
        "amount": "1000000000000000000",
        "fee": "1000000000000000",
        "status": "completed",
        "initiatedAt": 1733490000,
        "completedAt": 1733490600
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50000
    }
  }
}`} />
                  </div>

                  {/* Initiate Bridge Transfer */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/bridge/transfer</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Initiate a cross-chain token transfer.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Request Body</h4>
                    <ParamTable params={[
                      { name: "destChain", type: "integer", required: true, desc: "Destination chain ID" },
                      { name: "to", type: "string", required: true, desc: "Recipient address on destination chain" },
                      { name: "amount", type: "string", required: true, desc: "Amount to transfer in wei" },
                      { name: "token", type: "string", desc: "Token address (default: native TBURN)" },
                      { name: "signature", type: "string", required: true, desc: "Signed transaction data" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "bridgeId": "bridge_12346",
    "sourceTxHash": "tb1txabc123def...",
    "destChain": 1,
    "to": "tb1qy9f7eh0...",
    "amount": "1000000000000000000",
    "fee": "1000000000000000",
    "estimatedArrival": 1733494200,
    "status": "pending"
  }
}`} />
                  </div>

                  {/* Get Bridge Transfer Status */}
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/bridge/status/{'{txHash}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the status of a specific bridge transfer.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "txHash", type: "string", required: true, desc: "Source chain transaction hash" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "bridgeId": "bridge_12346",
    "sourceTxHash": "tb1txabc123def456...",
    "destTxHash": null,
    "sourceChain": 5800,
    "destChain": 1,
    "from": "tb1qx8e6dg9...",
    "to": "tb1qy9f7eh0...",
    "amount": "1000000000000000000",
    "fee": "1000000000000000",
    "status": "validating",
    "confirmations": 15,
    "requiredConfirmations": 20,
    "validators": [
      { "address": "tb1vqw9d5cf8xkplm4gt7...", "signed": true },
      { "address": "tb1vx8e6dg9ylqnm5ht8w...", "signed": true },
      { "address": "tb1vy9f7eh0zmron6ju9x...", "signed": false }
    ],
    "initiatedAt": 1733493600,
    "estimatedArrival": 1733494200
  }
}`} />
                  </div>
                </div>
              </section>

              {/* Consensus API Section */}
              <section id="consensus" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-[#7000ff]" /> Consensus API
                </h2>
                
                <div className="mb-6 p-4 rounded-lg bg-[#7000ff]/10 border border-[#7000ff]/30">
                  <p className="text-sm text-[#7000ff]">
                    TBURN uses a 5-phase Enterprise BFT Consensus: Propose → Prevote → Precommit → Commit → Finalize. Chain ID: 5800, 587 validators, 100ms block time, 100,000 TPS capacity.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/consensus/state</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the current consensus state including phase, round, and proposer information.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "chainId": 5800,
    "currentHeight": 25847392,
    "currentRound": 0,
    "phase": "FINALIZE",
    "state": "running",
    "proposer": "tb1vqw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
    "proposerName": "TBURN Genesis Validator #1",
    "lockedRound": -1,
    "lockedBlockHash": null,
    "validRound": 0,
    "validBlockHash": "tb1hash8a3b4c5d6e7f...",
    "lastBlockTime": 1735689600000,
    "avgRoundTimeMs": 95.4,
    "quorumThreshold": "66.67%",
    "totalVotingPower": "125000000000000000000000",
    "metrics": {
      "totalRounds": 25847392,
      "successfulRounds": 25847389,
      "failedRounds": 3,
      "viewChanges": 7,
      "votingParticipationRate": 99.97,
      "quorumAchievementRate": 99.99,
      "currentTPS": 185420,
      "peakTPS": 210542,
      "p50LatencyMs": 48,
      "p95LatencyMs": 85,
      "p99LatencyMs": 98
    }
  }
}`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/consensus/rounds/{'{height}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get detailed consensus round information for a specific block height.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "height", type: "integer", required: true, desc: "Block height to query" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "height": 25847392,
    "round": 0,
    "proposer": "tb1vqw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
    "blockHash": "tb1hash8a3b4c5d6e7f...",
    "phaseTimings": {
      "propose": 12,
      "prevote": 18,
      "precommit": 22,
      "commit": 25,
      "finalize": 18
    },
    "totalTimeMs": 95,
    "votes": {
      "prevote": { "count": 125, "power": "125000000000000000000000" },
      "precommit": { "count": 124, "power": "124800000000000000000000" },
      "commit": { "count": 125, "power": "125000000000000000000000" }
    },
    "quorumReached": true,
    "finalized": true,
    "timestamp": 1735689600000
  }
}`} />
                  </div>
                </div>
              </section>

              {/* Validators API Section */}
              <section id="validators" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Server className="w-8 h-8 text-[#00ff9d]" /> Validators API
                </h2>

                <div className="mb-6 p-4 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/30">
                  <p className="text-sm text-[#00ff9d]">
                    TBURN Mainnet operates with 587 active validators. Enterprise-grade validator management with performance scoring, reward distribution, and slashing protection.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/validators</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the list of all validators with their current status and performance metrics.</p>

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "status", type: "string", desc: "Filter by status: active, inactive, jailed (default: all)" },
                      { name: "sortBy", type: "string", desc: "Sort by: stake, uptime, apr, performance (default: stake)" },
                      { name: "limit", type: "integer", desc: "Results per page (default: 50, max: 100)" },
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "validators": [
      {
        "address": "tb1vqw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
        "moniker": "TBURN Genesis Validator #1",
        "status": "active",
        "votingPower": "1000000000000000000000",
        "votingPowerPercentage": 0.17,
        "commission": 5.0,
        "selfStake": "500000000000000000000",
        "totalStake": "1000000000000000000000",
        "delegators": 1847,
        "uptime": 99.98,
        "missedBlocks": 3,
        "proposedBlocks": 206779,
        "performanceScore": 98.5,
        "performanceTier": "platinum",
        "apr": 12.5,
        "shardAssignment": [0, 5, 12],
        "lastActive": 1735689600000
      }
    ],
    "summary": {
      "totalValidators": 587,
      "activeValidators": 585,
      "inactiveValidators": 1,
      "jailedValidators": 1,
      "totalStake": "587000000000000000000000000",
      "averageUptime": 99.87
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 587,
      "totalPages": 12
    }
  }
}`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/validators/{'{address}'}/rewards</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the reward distribution history for a specific validator.</p>

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "address", type: "string", required: true, desc: "Validator address" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "validator": "tb1vqw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
    "totalRewards": "15847392000000000000000",
    "pendingRewards": "284700000000000000",
    "claimedRewards": "15847107300000000000000",
    "rewardBreakdown": {
      "proposerRewards": "8423196000000000000000",
      "verifierRewards": "4212098000000000000000",
      "gasFeeRewards": "3212098000000000000000"
    },
    "performanceBonuses": {
      "streakBonus": "150000000000000000000",
      "consistencyBonus": "75000000000000000000",
      "uptimeBonus": "50000000000000000000"
    },
    "lastDistribution": 1735689600000,
    "currentEpoch": 2584
  }
}`} />
                  </div>
                </div>
              </section>

              {/* Sharding API Section */}
              <section id="sharding" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Layers className="w-8 h-8 text-[#00f0ff]" /> Sharding API
                </h2>

                <div className="mb-6 p-4 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                  <p className="text-sm text-[#00f0ff]">
                    TBURN supports dynamic sharding with scalable architecture. Current mainnet: 24 active shards (scalable to 64), 100,000 TPS capacity. Cross-shard messaging with priority queue routing.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/shards</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the status of all shards including load metrics and cross-shard communication stats.</p>

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "totalShards": 24,
    "activeShards": 24,
    "maxShards": 64,
    "globalTPS": 87420,
    "targetTPS": 100000,
    "shards": [
      {
        "id": 0,
        "status": "active",
        "validators": 24,
        "currentTPS": 3642,
        "avgBlockTime": 100,
        "pendingTransactions": 1247,
        "crossShardMessages": {
          "incoming": 847,
          "outgoing": 923,
          "pending": 12
        },
        "load": 0.72,
        "lastBlockHeight": 25847392
      }
    ],
    "rebalanceStatus": {
      "enabled": true,
      "lastRebalance": 1735689000000,
      "nextScheduled": null,
      "threshold": 0.85,
      "scalingToShards": null
    }
  }
}`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/shards/cross-shard/messages</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get recent cross-shard messages with routing and delivery status.</p>

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "sourceShard", type: "integer", desc: "Filter by source shard ID (0-23)" },
                      { name: "destShard", type: "integer", desc: "Filter by destination shard ID (0-23)" },
                      { name: "status", type: "string", desc: "pending, delivered, failed (default: all)" },
                      { name: "limit", type: "integer", desc: "Results per page (default: 50)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "csm_8a7b6c5d4e3f2a1b",
        "sourceShard": 12,
        "destShard": 45,
        "type": "token_transfer",
        "priority": "high",
        "payload": "0x...",
        "status": "delivered",
        "createdAt": 1735689590000,
        "deliveredAt": 1735689595000,
        "latencyMs": 5,
        "retries": 0
      }
    ],
    "stats": {
      "totalMessages24h": 2847392,
      "avgLatencyMs": 4.2,
      "successRate": 99.99,
      "pendingCount": 127
    }
  }
}`} />
                  </div>
                </div>
              </section>

              {/* AI Decisions API Section */}
              <section id="ai-decisions" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Cpu className="w-8 h-8 text-[#ffd700]" /> AI Decisions API
                </h2>

                <div className="mb-6 p-4 rounded-lg bg-[#ffd700]/10 border border-[#ffd700]/30">
                  <p className="text-sm text-[#ffd700]">
                    TBURN integrates AI for burn optimization, governance analysis, bridge risk assessment, and trust scoring. Powered by Proprietary Multi-Band AI Infrastructure.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/ai/decisions</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get recent AI decisions and recommendations for burn rate, governance, and risk assessment.</p>

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "type", type: "string", desc: "burn_optimization, governance, bridge_risk, trust_score" },
                      { name: "model", type: "string", desc: "gemini, claude, gpt4o, grok (default: all)" },
                      { name: "limit", type: "integer", desc: "Results per page (default: 20)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "decisions": [
      {
        "id": "ai_dec_8a7b6c5d",
        "type": "burn_optimization",
        "model": "gemini",
        "confidence": 0.94,
        "recommendation": {
          "action": "increase_burn_rate",
          "currentRate": 2.5,
          "suggestedRate": 2.8,
          "rationale": "High network activity and positive market sentiment support increased deflationary pressure",
          "expectedImpact": {
            "burnedTokens24h": "+15%",
            "priceImpact": "+0.3%",
            "supplyReduction": "2.8M TBURN"
          }
        },
        "dataPoints": {
          "networkActivity": "high",
          "marketSentiment": 0.72,
          "volumeChange24h": "+18.5%"
        },
        "createdAt": 1735689600000,
        "executedAt": 1735689605000,
        "status": "executed"
      }
    ],
    "summary": {
      "totalDecisions24h": 847,
      "avgConfidence": 0.91,
      "executionRate": 98.7,
      "modelUsage": {
        "gemini": 35,
        "claude": 30,
        "gpt4o": 25,
        "grok": 10
      }
    }
  }
}`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-gray-900 dark:text-white font-mono text-lg">/ai/trust-score/{'{address}'}</code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get the AI-computed trust score for a contract or address.</p>

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "address", type: "string", required: true, desc: "Contract or wallet address" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "address": "tb1vqw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce",
    "type": "contract",
    "trustScore": 87,
    "grade": "A",
    "factors": {
      "codeQuality": { "score": 92, "weight": 0.25 },
      "auditStatus": { "score": 95, "weight": 0.20 },
      "ownershipTransparency": { "score": 88, "weight": 0.15 },
      "liquidityHealth": { "score": 79, "weight": 0.15 },
      "communityTrust": { "score": 82, "weight": 0.15 },
      "historicalBehavior": { "score": 85, "weight": 0.10 }
    },
    "riskFlags": [],
    "recommendations": [
      "Consider time-lock on admin functions",
      "Add multi-sig for treasury operations"
    ],
    "lastUpdated": 1735689600000,
    "nextUpdate": 1735776000000
  }
}`} />
                  </div>
                </div>
              </section>

              {/* WebSocket Real-time Events Section */}
              <section id="realtime-events" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-purple-400" /> {t("apiDocs.websocketEvents.title", "Real-time Events")} (WebSocket)
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Connection</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Connect to the WebSocket endpoint with your API key for real-time blockchain events.
                    </p>
                    <CodeBlock code={`const ws = new WebSocket('wss://mainnet.tburn.io/ws?apiKey=YOUR_API_KEY');

ws.onopen = () => {
  console.log('Connected to TBURN Mainnet WebSocket');
  
  // Subscribe to new blocks
  ws.send(JSON.stringify({
    method: 'subscribe',
    channel: 'blocks'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Heartbeat to keep connection alive
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ method: 'ping' }));
  }
}, 30000);`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Available Channels</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-500 border-b border-gray-300 dark:border-white/10">
                          <tr>
                            <th className="py-3 text-left">Channel</th>
                            <th className="py-3 text-left">Description</th>
                            <th className="py-3 text-left">Parameters</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">blocks</code></td>
                            <td className="py-3">New block notifications</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">transactions</code></td>
                            <td className="py-3">All pending and confirmed transactions</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">address</code></td>
                            <td className="py-3">Transactions for specific address</td>
                            <td className="py-3"><code className="text-gray-400">address: "tb1q..."</code></td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">contract</code></td>
                            <td className="py-3">Contract events</td>
                            <td className="py-3"><code className="text-gray-400">address: "tb1c...", event: "Transfer"</code></td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">pendingTx</code></td>
                            <td className="py-3">Pending transactions in mempool</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">validators</code></td>
                            <td className="py-3">Validator status updates</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">consensus</code></td>
                            <td className="py-3">BFT consensus round updates</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Subscribe to Address</h3>
                    <CodeBlock code={`// Subscribe to transactions for a specific address
ws.send(JSON.stringify({
  method: 'subscribe',
  channel: 'address',
  params: {
    address: 'tb1qw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce'
  }
}));

// Incoming message format
{
  "channel": "address",
  "type": "transaction",
  "data": {
    "hash": "tb1tx5d4e3c2b1a0f9e8d...",
    "from": "tb1qx8e6dg9ylqnm5ht8w...",
    "to": "tb1qw9d5cf8xkplm4gt7v...",
    "value": "1000000000000000000",
    "status": "confirmed",
    "shardId": 12,
    "blockNumber": 20750000
  }
}`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Subscribe to Contract Events</h3>
                    <CodeBlock code={`// Subscribe to Transfer events for a token contract
ws.send(JSON.stringify({
  method: 'subscribe',
  channel: 'contract',
  params: {
    address: 'tb1qkwghdmv3...',
    event: 'Transfer',
    filter: {
      to: 'tb1qz0g8fj1...'  // Optional: filter by indexed parameter
    }
  }
}));

// Incoming message format
{
  "channel": "contract",
  "type": "event",
  "data": {
    "transactionHash": "tb1tx5d4e3c2b1a0f9e8d...",
    "blockNumber": 20750000,
    "shardId": 12,
    "event": "Transfer",
    "args": {
      "from": "tb1qx8e6dg9ylqnm5ht8w...",
      "to": "tb1qz0g8fj1xkplm4gt7v...",
      "value": "1000000000000000000"
    }
  }
}`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Unsubscribe</h3>
                    <CodeBlock code={`// Unsubscribe from a channel
ws.send(JSON.stringify({
  method: 'unsubscribe',
  channel: 'blocks'
}));

// Unsubscribe from specific subscription
ws.send(JSON.stringify({
  method: 'unsubscribe',
  channel: 'address',
  params: {
    address: 'tb1qw9d5cf8xkplm4gt7vs35r5h9ljkp7nxr8zqpce'
  }
}));`} />
                  </div>
                </div>
              </section>

              {/* Pagination Section */}
              <section id="pagination" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Filter className="w-8 h-8 text-[#00f0ff]" /> Pagination
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Offset-Based Pagination</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Use <code className="text-[#00f0ff]">page</code> and <code className="text-[#00f0ff]">limit</code> parameters for simple pagination:
                    </p>
                    <CodeBlock code={`# Get page 2 of transactions with 50 results per page
curl "https://mainnet.tburn.io/api/v8/transactions?page=2&limit=50" \\
  -H "X-API-Key: YOUR_API_KEY"

# Response includes pagination metadata
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "page": 2,
      "limit": 50,
      "total": 2847392,
      "totalPages": 56948,
      "hasMore": true
    }
  }
}`} />
                  </div>

                  <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cursor-Based Pagination</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      For large datasets, use cursor-based pagination for better performance:
                    </p>
                    <CodeBlock code={`# Initial request
curl "https://mainnet.tburn.io/api/v8/blocks?limit=100" \\
  -H "X-API-Key: YOUR_API_KEY"

# Response with cursor
{
  "success": true,
  "data": {
    "blocks": [...],
    "pagination": {
      "limit": 100,
      "hasMore": true,
      "nextCursor": "tb1cursor_block_20749900"
    }
  }
}

# Next page using cursor
curl "https://mainnet.tburn.io/api/v8/blocks?limit=100&cursor=tb1cursor_block_20749900" \\
  -H "X-API-Key: YOUR_API_KEY"`} />
                    <div className="mt-4 p-4 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/30">
                      <p className="text-sm text-[#00ff9d]">
                        Cursor-based pagination is recommended for real-time data and large result sets as it handles data changes gracefully.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Error Handling */}
              <section id="error-codes" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-[#ff0055]" /> Error Handling
                </h2>
                
                <div className="space-y-6">
                <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">HTTP Status Codes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-500 border-b border-gray-300 dark:border-white/10">
                        <tr>
                          <th className="py-3 text-left">Code</th>
                          <th className="py-3 text-left">Error</th>
                          <th className="py-3 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 dark:text-gray-300">
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#00ff9d]">200</td>
                          <td className="py-3">OK</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Request successful</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#00ff9d]">201</td>
                          <td className="py-3">Created</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Resource created successfully</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">400</td>
                          <td className="py-3">Bad Request</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Invalid request parameters or malformed JSON</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">401</td>
                          <td className="py-3">Unauthorized</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Missing or invalid API key</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">403</td>
                          <td className="py-3">Forbidden</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">API key doesn't have permission for this endpoint</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">404</td>
                          <td className="py-3">Not Found</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Resource not found (block, transaction, address)</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">409</td>
                          <td className="py-3">Conflict</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Duplicate request (check idempotency key)</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ffd700]">429</td>
                          <td className="py-3">Too Many Requests</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Rate limit exceeded</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">500</td>
                          <td className="py-3">Internal Server Error</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Server-side error, please retry</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">503</td>
                          <td className="py-3">Service Unavailable</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Service temporarily unavailable</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Error Codes Reference</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-500 border-b border-gray-300 dark:border-white/10">
                        <tr>
                          <th className="py-3 text-left">Error Code</th>
                          <th className="py-3 text-left">HTTP</th>
                          <th className="py-3 text-left">Description</th>
                          <th className="py-3 text-left">Resolution</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 dark:text-gray-300 text-xs">
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">INVALID_API_KEY</td>
                          <td className="py-3">401</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">API key is invalid or expired</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Check your API key or generate a new one</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">MISSING_API_KEY</td>
                          <td className="py-3">401</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">X-API-Key header is missing</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Include X-API-Key header in request</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">RATE_LIMIT_EXCEEDED</td>
                          <td className="py-3">429</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Too many requests</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Wait and retry with exponential backoff</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">INVALID_ADDRESS</td>
                          <td className="py-3">400</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Address format is invalid</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Use tb1 Bech32m format addresses</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">INVALID_TX_HASH</td>
                          <td className="py-3">400</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Transaction hash format is invalid</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Use valid tb1tx prefixed hash</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">BLOCK_NOT_FOUND</td>
                          <td className="py-3">404</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Block does not exist</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Verify block number exists on chain</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">TX_NOT_FOUND</td>
                          <td className="py-3">404</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Transaction not found</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Transaction may be pending or hash is incorrect</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">INSUFFICIENT_FUNDS</td>
                          <td className="py-3">400</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Insufficient balance for transaction</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Ensure account has enough TBURN</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">NONCE_TOO_LOW</td>
                          <td className="py-3">400</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Transaction nonce already used</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Get latest nonce from account endpoint</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">GAS_LIMIT_EXCEEDED</td>
                          <td className="py-3">400</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Gas limit too high or low</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Use gas estimation endpoint</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">CONTRACT_EXECUTION_FAILED</td>
                          <td className="py-3">400</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Smart contract call reverted</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Check contract state and parameters</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">SHARD_UNAVAILABLE</td>
                          <td className="py-3">503</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Target shard is temporarily unavailable</td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Retry after a short delay</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Error Response Format</h3>
                  <CodeBlock code={`{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "Invalid address format. Expected tb1 Bech32m address.",
    "details": {
      "field": "to",
      "provided": "0x1234...",
      "expected": "tb1q... or tb1v... format"
    },
    "requestId": "req_8a7b6c5d4e3f2a1b",
    "timestamp": 1735689600000
  }
}`} />
                </div>
              </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Official SDKs */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-t border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t("apiDocs.sdks.title", "Official SDKs")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            {t("apiDocs.sdks.description", "Use our official SDKs for seamless integration:")}
          </p>
          <div className="grid md:grid-cols-5 gap-4">
            {sdks.map((sdk, index) => (
              <div 
                key={index}
                className={`bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group ${sdk.hoverBorder} transition-colors`}
              >
                <sdk.icon className="w-8 h-8 mx-auto mb-3" style={{ color: sdk.color }} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{sdk.name}</h3>
                <div className="bg-gray-900 dark:bg-[#0d0d12] border border-gray-300 dark:border-white/10 rounded-lg p-2 font-mono text-xs text-gray-400 mb-3">
                  {sdk.install}
                </div>
                <Link href="/developers/docs" className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1">
                  View Docs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links CTA */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/developers/quickstart" className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group hover:border-[#00f0ff]/50 transition-colors">
              <Terminal className="w-8 h-8 text-[#00f0ff] mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#00f0ff] transition-colors">Quick Start Guide</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get up and running in 5 minutes with our step-by-step tutorial.</p>
            </Link>
            <Link href="/developers/examples" className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group hover:border-[#7000ff]/50 transition-colors">
              <FileText className="w-8 h-8 text-[#7000ff] mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#7000ff] transition-colors">Code Examples</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-world examples for common integration patterns.</p>
            </Link>
            <Link href="/network/rpc" className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group hover:border-[#00ff9d]/50 transition-colors">
              <Layers className="w-8 h-8 text-[#00ff9d] mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#00ff9d] transition-colors">RPC Providers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Direct RPC access for Web3 library integration.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
