import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Network, Shield, Heart, Box, ArrowRightLeft, LineChart, Coins,
  RefreshCw, Download, Server, Book, Copy, ExternalLink
} from "lucide-react";

const authCode = `const ws = new WebSocket('wss://ws.tburn.io/v8');

ws.onopen = () => {
  // Authenticate instantly
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'tb_live_xxxxxxxx'
  }));
};`;

const heartbeatCode = `ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  if (msg.type === 'ping') {
    // Keep connection alive
    ws.send(JSON.stringify({ type: 'pong' }));
  }
};`;

const implementationCode = `class TBurnWebSocket {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.reconnectAttempts = 0;
    this.subscriptions = new Map();
  }

  connect() {
    this.ws = new WebSocket('wss://ws.tburn.io/v8');
    
    this.ws.onopen = () => {
      console.log('Connected to Trust Network');
      this.reconnectAttempts = 0;
      this.authenticate();
    };

    this.ws.onclose = () => {
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
      this.reconnectAttempts++;
    };
  }
  
  // ... handle messages & resubscribe logic
}`;

const highlightCode = (code: string) => {
  return code
    .replace(/(\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>')
    .replace(/\b(const|let|var|new|this|if|else|class|constructor|return|function)\b/g, '<span class="text-[#c678dd]">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#c678dd]">$1</span>')
    .replace(/"([^"]*)"/g, '<span class="text-[#98c379]">"$1"</span>')
    .replace(/'([^']*)'/g, '<span class="text-[#98c379]">\'$1\'</span>')
    .replace(/\b(console|Math|JSON|WebSocket|Map)\b/g, '<span class="text-[#e5c07b]">$1</span>')
    .replace(/\.(onopen|onclose|onmessage|send|stringify|parse|log|min|pow)\b/g, '.<span class="text-[#61afef]">$1</span>');
};

export default function WebSocketApi() {
  const { t } = useTranslation();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const endpoints = [
    { 
      type: t('publicPages.developers.websocket.endpoints.mainnet.type'), 
      desc: t('publicPages.developers.websocket.endpoints.mainnet.desc'), 
      url: "wss://ws.tburn.io/v8",
      color: "#00ff9d",
      bgColor: "bg-[#00ff9d]/10",
      borderColor: "border-[#00ff9d]/20"
    },
    { 
      type: t('publicPages.developers.websocket.endpoints.testnet.type'), 
      desc: t('publicPages.developers.websocket.endpoints.testnet.desc'), 
      url: "wss://ws-testnet.tburn.io/v8",
      color: "#ffd700",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
  ];

  const subscriptionChannels = [
    {
      name: "blocks",
      icon: Box,
      color: "#00f0ff",
      borderColor: "border-l-[#00f0ff]",
      methods: ["block.new", "block.finalized"],
      desc: t('publicPages.developers.websocket.channels.blocks.description'),
      code: `{
  "type": "subscribe",
  "channel": "blocks",
  "params": { "all": true }
}`
    },
    {
      name: "transactions",
      icon: ArrowRightLeft,
      color: "#7000ff",
      borderColor: "border-l-[#7000ff]",
      methods: ["tx.pending", "tx.confirmed"],
      desc: t('publicPages.developers.websocket.channels.transactions.description'),
      code: `{
  "type": "subscribe",
  "channel": "transactions",
  "params": { "address": "0xUser..." }
}`
    },
    {
      name: "trust-score",
      icon: LineChart,
      color: "#00ff9d",
      borderColor: "border-l-[#00ff9d]",
      methods: ["score.updated"],
      desc: t('publicPages.developers.websocket.channels.trustScore.description'),
      code: `{
  "type": "subscribe",
  "channel": "trust-score",
  "params": { "projects": ["0x..."] }
}`
    },
    {
      name: "defi",
      icon: Coins,
      color: "#ff0055",
      borderColor: "border-l-[#ff0055]",
      methods: ["swap", "liquidity"],
      desc: t('publicPages.developers.websocket.channels.defi.description'),
      code: `{
  "type": "subscribe",
  "channel": "defi",
  "params": { "pools": ["TBURN/ETH"] }
}`
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
                <span className="text-[#00f0ff] font-mono text-xs tracking-widest uppercase">{t('publicPages.developers.websocket.tag')}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                {t('publicPages.developers.websocket.title')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                {t('publicPages.developers.websocket.subtitle')}
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/developers/api"
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card px-5 py-3 rounded-lg flex items-center gap-2 text-[#00f0ff] border-[#00f0ff]/30 hover:bg-[#00f0ff]/10 transition"
                data-testid="link-full-reference"
              >
                <Book className="w-4 h-4" /> {t('publicPages.developers.websocket.fullReference')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Connection Endpoints */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <Network className="w-5 h-5 text-[#7000ff]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.websocket.connectionEndpoints')}</h2>
          </div>
          
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-1 overflow-hidden">
            <div className="grid grid-cols-1 gap-1">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 dark:spotlight-card p-4 flex flex-wrap items-center justify-between gap-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span 
                      className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${endpoint.bgColor} ${endpoint.borderColor} border`}
                      style={{ color: endpoint.color }}
                    >
                      {endpoint.type}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{endpoint.desc}</span>
                  </div>
                  <code className="font-mono text-sm" style={{ color: endpoint.color }}>{endpoint.url}</code>
                  <button 
                    onClick={() => handleCopy(endpoint.url, index)}
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                    data-testid={`button-copy-${endpoint.type.toLowerCase()}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Authentication & Heartbeat */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Authentication */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="w-5 h-5 text-[#00f0ff]" /> {t('publicPages.developers.websocket.authentication.title')}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('publicPages.developers.websocket.authentication.description')}</p>
              
              <div className="bg-gray-900 dark:bg-[#08080b] border border-gray-700 dark:border-gray-800 rounded-lg p-4 overflow-x-auto">
                <div className="flex justify-between text-xs text-gray-500 mb-2 pb-2 border-b border-gray-700 dark:border-gray-800">
                  <span>JAVASCRIPT</span>
                  <span>AUTH_REQ</span>
                </div>
                <pre className="font-mono text-sm text-gray-300 leading-relaxed">
                  <code dangerouslySetInnerHTML={{ __html: highlightCode(authCode) }} />
                </pre>
              </div>
            </div>

            {/* Heartbeat */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Heart className="w-5 h-5 text-[#7000ff]" /> {t('publicPages.developers.websocket.heartbeat.title')}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('publicPages.developers.websocket.heartbeat.description')}
              </p>
              
              <div className="bg-gray-900 dark:bg-[#08080b] border border-gray-700 dark:border-gray-800 rounded-lg p-4 overflow-x-auto">
                <div className="flex justify-between text-xs text-gray-500 mb-2 pb-2 border-b border-gray-700 dark:border-gray-800">
                  <span>JAVASCRIPT</span>
                  <span>KEEP_ALIVE</span>
                </div>
                <pre className="font-mono text-sm text-gray-300 leading-relaxed">
                  <code dangerouslySetInnerHTML={{ __html: highlightCode(heartbeatCode) }} />
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Channels */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="text-gray-600 dark:text-gray-400">◈</span> {t('publicPages.developers.websocket.subscriptionChannels')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {subscriptionChannels.map((channel, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl border-l-4 ${channel.borderColor} p-6 relative overflow-hidden group`}
              >
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                  <channel.icon className="w-16 h-16" style={{ color: channel.color }} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{channel.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {channel.methods.map((method, idx) => (
                      <span 
                        key={idx}
                        className="text-xs px-2 py-1 rounded font-mono border"
                        style={{ 
                          color: channel.color, 
                          backgroundColor: `${channel.color}10`,
                          borderColor: `${channel.color}30`
                        }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{channel.desc}</p>
                <div className="bg-gray-900 dark:bg-black/40 border border-gray-700 dark:border-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="font-mono text-sm text-gray-300">
                    <code dangerouslySetInnerHTML={{ __html: highlightCode(channel.code) }} />
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Implementation Strategy */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.websocket.clientImplementation.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.developers.websocket.clientImplementation.subtitle')}</p>
              </div>
            </div>
            
            <div className="bg-gray-900 dark:bg-[#08080b] border border-gray-700 dark:border-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
              <pre className="font-mono text-sm text-gray-300 leading-relaxed">
                <code dangerouslySetInnerHTML={{ __html: highlightCode(implementationCode) }} />
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Integrate */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#7000ff]/10 to-[#00f0ff]/10 border-t border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('publicPages.developers.websocket.readyToIntegrate')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/developers/sdk"
              className="bg-[#00f0ff] text-black px-6 py-3 rounded-lg font-bold hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2"
              data-testid="link-get-sdk"
            >
              <Download className="w-5 h-5" /> {t('publicPages.developers.websocket.getSdk')}
            </Link>
            <Link 
              href="/developers/api"
              className="bg-white dark:bg-transparent shadow-sm border border-gray-300 dark:border-white/20 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-rest-api"
            >
              <Server className="w-5 h-5" /> {t('publicPages.developers.websocket.viewRestApi')}
            </Link>
            <Link 
              href="/developers/examples"
              className="bg-white dark:bg-transparent shadow-sm border border-gray-300 dark:border-white/20 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-code-examples"
            >
              <ExternalLink className="w-5 h-5" /> {t('publicPages.developers.websocket.codeExamples')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
