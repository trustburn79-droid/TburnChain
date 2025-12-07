import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Code, Key, AlertTriangle, Copy, ArrowRight, Check,
  Layers, FileText, Zap, Terminal, Shield, Clock,
  Database, Wallet, FileCode, Activity, Globe, Lock,
  Server, Cpu, RefreshCw, Box, Hash, Search, Filter
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
        className="absolute top-3 right-3 p-1.5 rounded bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transition"
        data-testid="button-copy-code"
      >
        {copied ? <Check className="w-3 h-3 text-[#00ff9d]" /> : <Copy className="w-3 h-3 text-gray-400" />}
      </button>
      <div className="bg-[#0d0d12] border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-400 overflow-x-auto whitespace-pre">
        {code}
      </div>
    </div>
  );
}

function ParamTable({ params }: { params: Array<{ name: string; type: string; required?: boolean; desc: string }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b border-white/10">
          <tr>
            <th className="py-2 text-left">Parameter</th>
            <th className="py-2 text-left">Type</th>
            <th className="py-2 text-left">Required</th>
            <th className="py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {params.map((param, index) => (
            <tr key={index} className="border-b border-white/5">
              <td className="py-2"><code className="text-[#00f0ff]">{param.name}</code></td>
              <td className="py-2 text-gray-400 font-mono text-xs">{param.type}</td>
              <td className="py-2">
                {param.required ? (
                  <span className="text-[#00ff9d] text-xs">Required</span>
                ) : (
                  <span className="text-gray-500 text-xs">Optional</span>
                )}
              </td>
              <td className="py-2 text-gray-400">{param.desc}</td>
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
    { id: "overview", label: "Overview", icon: Globe },
    { id: "authentication", label: "Authentication", icon: Key },
    { id: "rate-limits", label: "Rate Limits", icon: Clock },
    { section: "ENDPOINTS" },
    { id: "block", label: "Block", icon: Box },
    { id: "transaction", label: "Transaction", icon: Activity },
    { id: "account", label: "Account", icon: Wallet },
    { id: "smart-contract", label: "Smart Contract", icon: FileCode },
    { section: "WEBSOCKET" },
    { id: "realtime-events", label: "Real-time Events", icon: Zap },
  ];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://api.tburn.io/v8");
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
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Code className="w-3 h-3" /> API Reference v8.0
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            TBURN Chain <span className="text-gradient">API Documentation</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mb-8">
            Enterprise-grade REST API and WebSocket endpoints for building on TBURN Chain. 
            Complete access to blockchain data, smart contracts, and real-time events.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <button 
              onClick={handleCopyUrl}
              className="px-4 py-2 rounded bg-white/5 border border-white/10 font-mono text-sm text-gray-300 flex items-center gap-2 hover:bg-white/10 transition"
              data-testid="button-copy-base-url"
            >
              <span className="text-[#7000ff]">Base URL:</span> https://api.tburn.io/v8
              {copiedUrl ? <Check className="w-4 h-4 text-[#00ff9d]" /> : <Copy className="w-4 h-4" />}
            </button>
            <span className="text-gray-500">|</span>
            <span className="text-sm text-gray-400">WebSocket: <code className="text-[#00f0ff]">wss://ws.tburn.io/v8</code></span>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-8 px-6">
        <div className="container mx-auto max-w-7xl">
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
                          ? "bg-white/5 text-white font-medium border-l-2 border-[#00f0ff]" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                      data-testid={`nav-${item.id}`}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                    </button>
                  )
                ))}

                <div className="pt-8 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  RELATED
                </div>
                <Link href="/developers" className="block px-4 py-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Developer Hub
                </Link>
                <Link href="/developers/docs" className="block px-4 py-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Full Documentation
                </Link>
                <Link href="/developers/examples" className="block px-4 py-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition flex items-center gap-2">
                  <Code className="w-4 h-4" /> Code Examples
                </Link>
                <Link href="/developers/quickstart" className="block px-4 py-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Quick Start Guide
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="col-span-4 space-y-16">
              {/* Overview Section */}
              <section id="overview" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Globe className="w-8 h-8 text-[#00f0ff]" /> API Overview
                </h2>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <Server className="w-8 h-8 text-[#00ff9d] mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">RESTful API</h3>
                    <p className="text-sm text-gray-400">JSON-based REST endpoints with comprehensive query parameters and filtering.</p>
                  </div>
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <Zap className="w-8 h-8 text-[#7000ff] mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">WebSocket</h3>
                    <p className="text-sm text-gray-400">Real-time streaming for blocks, transactions, and smart contract events.</p>
                  </div>
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <Shield className="w-8 h-8 text-[#ffd700] mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">Enterprise Ready</h3>
                    <p className="text-sm text-gray-400">99.99% uptime SLA, dedicated support, and custom rate limits.</p>
                  </div>
                </div>

                <div className="spotlight-card rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Quick Start</h3>
                  <CodeBlock code={`# Get the latest block
curl https://api.tburn.io/v8/blocks/latest \\
  -H "X-API-Key: YOUR_API_KEY"

# Response
{
  "success": true,
  "data": {
    "number": 20750000,
    "hash": "0x83b0a4f...",
    "timestamp": 1733493600,
    "transactions": 147,
    "gasUsed": "15000000",
    "validator": "0x1234..."
  }
}`} />
                </div>
              </section>

              {/* Authentication Section */}
              <section id="authentication" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Key className="w-8 h-8 text-[#ffd700]" /> Authentication
                </h2>
                
                <div className="space-y-6">
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">API Key Authentication</h3>
                    <p className="text-gray-400 mb-4">
                      All API requests require authentication using an API key. Include your key in the request header:
                    </p>
                    <CodeBlock code={`curl https://api.tburn.io/v8/blocks/latest \\
  -H "X-API-Key: YOUR_API_KEY"`} />
                    
                    <div className="mt-6 p-4 rounded-lg bg-[#ffd700]/10 border border-[#ffd700]/30">
                      <p className="text-sm text-[#ffd700] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Never expose your API key in client-side code. Use server-side requests or environment variables.
                      </p>
                    </div>
                  </div>

                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Getting an API Key</h3>
                    <ol className="space-y-3 text-gray-400">
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

                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">API Key Tiers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-500 border-b border-white/10">
                          <tr>
                            <th className="py-3 text-left">Tier</th>
                            <th className="py-3 text-left">Rate Limit</th>
                            <th className="py-3 text-left">WebSocket</th>
                            <th className="py-3 text-left">Support</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-300">
                          <tr className="border-b border-white/5">
                            <td className="py-3"><span className="text-gray-400">Free</span></td>
                            <td className="py-3">100 req/min</td>
                            <td className="py-3">5 connections</td>
                            <td className="py-3">Community</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3"><span className="text-[#00f0ff]">Pro</span></td>
                            <td className="py-3">1,000 req/min</td>
                            <td className="py-3">50 connections</td>
                            <td className="py-3">Email (24h)</td>
                          </tr>
                          <tr className="border-b border-white/5">
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
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-[#ff6b35]" /> Rate Limits
                </h2>
                
                <div className="space-y-6">
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Rate Limit Headers</h3>
                    <p className="text-gray-400 mb-4">
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

                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Endpoint-Specific Limits</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-500 border-b border-white/10">
                          <tr>
                            <th className="py-3 text-left">Endpoint Category</th>
                            <th className="py-3 text-left">Free Tier</th>
                            <th className="py-3 text-left">Pro Tier</th>
                            <th className="py-3 text-left">Enterprise</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-300">
                          <tr className="border-b border-white/5">
                            <td className="py-3">Block / Transaction</td>
                            <td className="py-3">100/min</td>
                            <td className="py-3">1,000/min</td>
                            <td className="py-3">Unlimited</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">Account Balance</td>
                            <td className="py-3">50/min</td>
                            <td className="py-3">500/min</td>
                            <td className="py-3">Unlimited</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">Smart Contract Calls</td>
                            <td className="py-3">30/min</td>
                            <td className="py-3">300/min</td>
                            <td className="py-3">Unlimited</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">Historical Data</td>
                            <td className="py-3">20/min</td>
                            <td className="py-3">200/min</td>
                            <td className="py-3">Unlimited</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">429 Too Many Requests</h3>
                    <p className="text-gray-400 mb-4">
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
                </div>
              </section>

              {/* Block Endpoints Section */}
              <section id="block" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Box className="w-8 h-8 text-[#00ff9d]" /> Block Endpoints
                </h2>
                
                <div className="space-y-6">
                  {/* Get Block by Number */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/blocks/{'{blockNumber}'}</code>
                    </div>
                    <p className="text-gray-400 mb-4">Retrieve detailed information about a specific block by its number or use 'latest' for the most recent block.</p>
                    
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
    "hash": "0x83b0a4f2c9d8e7b6a5f4c3d2e1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2",
    "parentHash": "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    "timestamp": 1733493600,
    "validator": "0x1234567890abcdef1234567890abcdef12345678",
    "validatorName": "TBURN Enterprise Node #1",
    "size": 45678,
    "gasUsed": "15000000",
    "gasLimit": "30000000",
    "baseFeePerGas": "1000000000",
    "transactionCount": 147,
    "stateRoot": "0xabc123...",
    "receiptsRoot": "0xdef456...",
    "shardId": 0,
    "consensusType": "TBFT",
    "finalized": true,
    "transactions": [...] // if includeTxs=true
  }
}`} />
                  </div>

                  {/* Get Latest Blocks */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/blocks</code>
                    </div>
                    <p className="text-gray-400 mb-4">Retrieve a paginated list of recent blocks with optional filtering.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page, max 100 (default: 20)" },
                      { name: "fromBlock", type: "integer", desc: "Start from block number" },
                      { name: "toBlock", type: "integer", desc: "End at block number" },
                      { name: "validator", type: "address", desc: "Filter by validator address" },
                      { name: "shardId", type: "integer", desc: "Filter by shard ID (0-15)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "blocks": [
      {
        "number": 20750000,
        "hash": "0x83b0a4f...",
        "timestamp": 1733493600,
        "transactionCount": 147,
        "validator": "0x1234...",
        "gasUsed": "15000000"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 20750000,
      "hasMore": true
    }
  }
}`} />
                  </div>

                  {/* Get Block Transactions */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/blocks/{'{blockNumber}'}/transactions</code>
                    </div>
                    <p className="text-gray-400 mb-4">Get all transactions in a specific block with pagination support.</p>
                    
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
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Activity className="w-8 h-8 text-[#00f0ff]" /> Transaction Endpoints
                </h2>
                
                <div className="space-y-6">
                  {/* Get Transaction */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/transactions/{'{txHash}'}</code>
                    </div>
                    <p className="text-gray-400 mb-4">Retrieve detailed information about a transaction by its hash.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Path Parameters</h4>
                    <ParamTable params={[
                      { name: "txHash", type: "string", required: true, desc: "Transaction hash (0x prefixed)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "hash": "0x5d4e3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3",
    "blockNumber": 20750000,
    "blockHash": "0x83b0a4f...",
    "transactionIndex": 42,
    "from": "0xSender1234567890abcdef1234567890abcdef1234",
    "to": "0xReceiver1234567890abcdef1234567890abcdef12",
    "value": "1000000000000000000",
    "gasPrice": "1000000000",
    "gasUsed": "21000",
    "gasLimit": "21000",
    "nonce": 156,
    "input": "0x",
    "type": "transfer",
    "status": "success",
    "timestamp": 1733493600,
    "confirmations": 125,
    "fee": "21000000000000",
    "logs": [],
    "decodedInput": null
  }
}`} />
                  </div>

                  {/* Send Transaction */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-white font-mono text-lg">/transactions/send</code>
                    </div>
                    <p className="text-gray-400 mb-4">Broadcast a signed transaction to the network.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Request Body</h4>
                    <ParamTable params={[
                      { name: "signedTx", type: "string", required: true, desc: "Signed transaction hex string" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Request Example</h4>
                    <CodeBlock code={`curl -X POST https://api.tburn.io/v8/transactions/send \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "signedTx": "0xf86c808504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83"
  }'`} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "hash": "0x5d4e3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3",
    "status": "pending",
    "estimatedConfirmation": 2
  }
}`} />
                  </div>

                  {/* Get Transaction Receipt */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/transactions/{'{txHash}'}/receipt</code>
                    </div>
                    <p className="text-gray-400 mb-4">Get the receipt of a mined transaction including logs and status.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "transactionHash": "0x5d4e3c2b...",
    "blockNumber": 20750000,
    "blockHash": "0x83b0a4f...",
    "status": 1,
    "gasUsed": "21000",
    "cumulativeGasUsed": "5250000",
    "effectiveGasPrice": "1000000000",
    "logs": [
      {
        "address": "0xContract...",
        "topics": ["0xddf252ad...", "0x000...sender", "0x000...receiver"],
        "data": "0x0000...amount",
        "logIndex": 0
      }
    ],
    "logsBloom": "0x00000..."
  }
}`} />
                  </div>

                  {/* Search Transactions */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/transactions</code>
                    </div>
                    <p className="text-gray-400 mb-4">Search and filter transactions with advanced query options.</p>
                    
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
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-[#7000ff]" /> Account Endpoints
                </h2>
                
                <div className="space-y-6">
                  {/* Get Account Balance */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/accounts/{'{address}'}/balance</code>
                    </div>
                    <p className="text-gray-400 mb-4">Get the native token balance and nonce for an address.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "balance": "5000000000000000000",
    "balanceFormatted": "5.0 TBURN",
    "nonce": 42,
    "isContract": false
  }
}`} />
                  </div>

                  {/* Get Account Info */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/accounts/{'{address}'}</code>
                    </div>
                    <p className="text-gray-400 mb-4">Get comprehensive account information including balances, tokens, and activity.</p>
                    
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
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "balance": "5000000000000000000",
    "nonce": 42,
    "isContract": false,
    "label": "TBURN Whale",
    "firstSeen": 1699000000,
    "lastSeen": 1733493600,
    "txCount": 1547,
    "tokens": [
      {
        "contract": "0xToken...",
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
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/accounts/{'{address}'}/transactions</code>
                    </div>
                    <p className="text-gray-400 mb-4">Get paginated transaction history for an address.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                    <ParamTable params={[
                      { name: "page", type: "integer", desc: "Page number (default: 1)" },
                      { name: "limit", type: "integer", desc: "Results per page, max 100 (default: 20)" },
                      { name: "direction", type: "string", desc: "Filter: 'in', 'out', or 'both' (default)" },
                      { name: "type", type: "string", desc: "Transaction type filter" },
                    ]} />
                  </div>

                  {/* Get Token Balances */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/accounts/{'{address}'}/tokens</code>
                    </div>
                    <p className="text-gray-400 mb-4">Get all TBC-20 token balances for an address.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "tokens": [
      {
        "contract": "0xUSDT...",
        "name": "Tether USD",
        "symbol": "USDT",
        "decimals": 6,
        "balance": "10000000000",
        "balanceFormatted": "10,000 USDT",
        "valueUSD": "10000.00"
      },
      {
        "contract": "0xWBTC...",
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
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <FileCode className="w-8 h-8 text-[#ffd700]" /> Smart Contract Endpoints
                </h2>
                
                <div className="space-y-6">
                  {/* Get Contract Info */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/contracts/{'{address}'}</code>
                    </div>
                    <p className="text-gray-400 mb-4">Get detailed information about a deployed smart contract.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Response</h4>
                    <CodeBlock code={`{
  "success": true,
  "data": {
    "address": "0xContract...",
    "name": "TBURN Token",
    "symbol": "TBURN",
    "type": "TBC-20",
    "verified": true,
    "compiler": "solc 0.8.19",
    "optimization": true,
    "runs": 200,
    "creator": "0xCreator...",
    "creationTx": "0xCreateTx...",
    "creationBlock": 1000000,
    "balance": "0",
    "txCount": 50000,
    "abi": [...],
    "sourceCode": "// SPDX-License-Identifier..."
  }
}`} />
                  </div>

                  {/* Call Contract Method (Read) */}
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-white font-mono text-lg">/contracts/{'{address}'}/call</code>
                    </div>
                    <p className="text-gray-400 mb-4">Call a read-only contract method without creating a transaction.</p>
                    
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Request Body</h4>
                    <ParamTable params={[
                      { name: "method", type: "string", required: true, desc: "Method name to call" },
                      { name: "params", type: "array", desc: "Method parameters" },
                      { name: "abi", type: "array", desc: "Contract ABI (optional if verified)" },
                    ]} />

                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Request Example</h4>
                    <CodeBlock code={`curl -X POST https://api.tburn.io/v8/contracts/0xToken.../call \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "balanceOf",
    "params": ["0x1234567890abcdef1234567890abcdef12345678"]
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
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="GET" />
                      <code className="text-white font-mono text-lg">/contracts/{'{address}'}/events</code>
                    </div>
                    <p className="text-gray-400 mb-4">Get decoded event logs emitted by a contract.</p>
                    
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
        "transactionHash": "0x5d4e...",
        "blockNumber": 20750000,
        "logIndex": 0,
        "event": "Transfer",
        "args": {
          "from": "0xSender...",
          "to": "0xReceiver...",
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
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method="POST" />
                      <code className="text-white font-mono text-lg">/contracts/{'{address}'}/verify</code>
                    </div>
                    <p className="text-gray-400 mb-4">Submit source code for contract verification.</p>
                    
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

              {/* WebSocket Real-time Events Section */}
              <section id="realtime-events" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-purple-400" /> Real-time Events (WebSocket)
                </h2>
                
                <div className="space-y-6">
                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Connection</h3>
                    <p className="text-gray-400 mb-4">
                      Connect to the WebSocket endpoint with your API key for real-time blockchain events.
                    </p>
                    <CodeBlock code={`const ws = new WebSocket('wss://ws.tburn.io/v8?apiKey=YOUR_API_KEY');

ws.onopen = () => {
  console.log('Connected to TBURN WebSocket');
  
  // Subscribe to new blocks
  ws.send(JSON.stringify({
    method: 'subscribe',
    channel: 'blocks'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};`} />
                  </div>

                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Available Channels</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-500 border-b border-white/10">
                          <tr>
                            <th className="py-3 text-left">Channel</th>
                            <th className="py-3 text-left">Description</th>
                            <th className="py-3 text-left">Parameters</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-300">
                          <tr className="border-b border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">blocks</code></td>
                            <td className="py-3">New block notifications</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">transactions</code></td>
                            <td className="py-3">All pending and confirmed transactions</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">address</code></td>
                            <td className="py-3">Transactions for specific address</td>
                            <td className="py-3"><code className="text-gray-400">address: "0x..."</code></td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">contract</code></td>
                            <td className="py-3">Contract events</td>
                            <td className="py-3"><code className="text-gray-400">address: "0x...", event: "Transfer"</code></td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">pendingTx</code></td>
                            <td className="py-3">Pending transactions in mempool</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">validators</code></td>
                            <td className="py-3">Validator status updates</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3"><code className="text-[#00f0ff]">consensus</code></td>
                            <td className="py-3">BFT consensus round updates</td>
                            <td className="py-3 text-gray-500">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Subscribe to Address</h3>
                    <CodeBlock code={`// Subscribe to transactions for a specific address
ws.send(JSON.stringify({
  method: 'subscribe',
  channel: 'address',
  params: {
    address: '0x1234567890abcdef1234567890abcdef12345678'
  }
}));

// Incoming message format
{
  "channel": "address",
  "type": "transaction",
  "data": {
    "hash": "0x5d4e...",
    "from": "0xSender...",
    "to": "0x1234...",
    "value": "1000000000000000000",
    "status": "confirmed",
    "blockNumber": 20750000
  }
}`} />
                  </div>

                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Subscribe to Contract Events</h3>
                    <CodeBlock code={`// Subscribe to Transfer events for a token contract
ws.send(JSON.stringify({
  method: 'subscribe',
  channel: 'contract',
  params: {
    address: '0xTokenContract...',
    event: 'Transfer',
    filter: {
      to: '0xMyWallet...'  // Optional: filter by indexed parameter
    }
  }
}));

// Incoming message format
{
  "channel": "contract",
  "type": "event",
  "data": {
    "transactionHash": "0x5d4e...",
    "blockNumber": 20750000,
    "event": "Transfer",
    "args": {
      "from": "0xSender...",
      "to": "0xMyWallet...",
      "value": "1000000000000000000"
    }
  }
}`} />
                  </div>

                  <div className="spotlight-card rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Unsubscribe</h3>
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
    address: '0x1234...'
  }
}));`} />
                  </div>
                </div>
              </section>

              {/* Error Handling */}
              <section className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-[#ff0055]" /> Error Handling
                </h2>
                
                <div className="spotlight-card rounded-xl p-6 border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-500 border-b border-white/10">
                        <tr>
                          <th className="py-3 text-left">Code</th>
                          <th className="py-3 text-left">Error</th>
                          <th className="py-3 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        <tr className="border-b border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">400</td>
                          <td className="py-3">Bad Request</td>
                          <td className="py-3 text-gray-400">Invalid request parameters or malformed JSON</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">401</td>
                          <td className="py-3">Unauthorized</td>
                          <td className="py-3 text-gray-400">Missing or invalid API key</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">403</td>
                          <td className="py-3">Forbidden</td>
                          <td className="py-3 text-gray-400">API key doesn't have permission for this endpoint</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">404</td>
                          <td className="py-3">Not Found</td>
                          <td className="py-3 text-gray-400">Resource not found (block, transaction, address)</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">429</td>
                          <td className="py-3">Too Many Requests</td>
                          <td className="py-3 text-gray-400">Rate limit exceeded</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">500</td>
                          <td className="py-3">Internal Error</td>
                          <td className="py-3 text-gray-400">Server error - contact support if persistent</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">503</td>
                          <td className="py-3">Service Unavailable</td>
                          <td className="py-3 text-gray-400">API temporarily unavailable for maintenance</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 mt-6">Error Response Format</h4>
                  <CodeBlock code={`{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "The provided address is not a valid TBURN address",
    "details": {
      "field": "address",
      "value": "invalid-address",
      "expected": "0x-prefixed 40 character hex string"
    }
  }
}`} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Official SDKs */}
      <section className="py-20 px-6 bg-white/5 border-t border-white/5">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Official SDKs</h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            Use our official SDKs for a better developer experience with type safety, error handling, and automatic retries.
          </p>
          <div className="grid md:grid-cols-5 gap-4">
            {sdks.map((sdk, index) => (
              <div 
                key={index}
                className={`spotlight-card rounded-xl p-6 border border-white/10 group ${sdk.hoverBorder} transition-colors`}
              >
                <sdk.icon className="w-8 h-8 mx-auto mb-3" style={{ color: sdk.color }} />
                <h3 className="text-lg font-bold text-white mb-2">{sdk.name}</h3>
                <div className="bg-[#0d0d12] border border-white/10 rounded-lg p-2 font-mono text-xs text-gray-400 mb-3">
                  {sdk.install}
                </div>
                <Link href="/developers/docs" className="text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1">
                  View Docs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/developers/quickstart" className="spotlight-card rounded-xl p-6 border border-white/10 group hover:border-[#00f0ff]/50 transition-colors">
              <Terminal className="w-8 h-8 text-[#00f0ff] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00f0ff] transition-colors">Quick Start Guide</h3>
              <p className="text-sm text-gray-400">Get up and running in 5 minutes with our step-by-step tutorial.</p>
            </Link>
            <Link href="/developers/examples" className="spotlight-card rounded-xl p-6 border border-white/10 group hover:border-[#7000ff]/50 transition-colors">
              <FileText className="w-8 h-8 text-[#7000ff] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#7000ff] transition-colors">Code Examples</h3>
              <p className="text-sm text-gray-400">Real-world examples for common integration patterns.</p>
            </Link>
            <Link href="/network/rpc" className="spotlight-card rounded-xl p-6 border border-white/10 group hover:border-[#00ff9d]/50 transition-colors">
              <Layers className="w-8 h-8 text-[#00ff9d] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00ff9d] transition-colors">RPC Providers</h3>
              <p className="text-sm text-gray-400">Direct RPC access for Web3 library integration.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
