import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Code, Key, AlertTriangle, Copy, ArrowRight, 
  Layers, FileText, Zap, Terminal
} from "lucide-react";
import { SiJavascript, SiPython, SiGo } from "react-icons/si";

function MethodBadge({ method }: { method: string }) {
  const isGet = method === "GET";
  return (
    <span 
      className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
        isGet 
          ? "bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30" 
          : "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30"
      }`}
    >
      {method}
    </span>
  );
}

export default function ApiDocs() {
  const { t } = useTranslation();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const sidebarLinks = [
    { label: t('publicPages.developers.api.sidebar.overview'), active: true },
    { label: t('publicPages.developers.api.sidebar.authentication') },
    { label: t('publicPages.developers.api.sidebar.rateLimits') },
    { section: t('publicPages.developers.api.sidebar.endpoints') },
    { label: t('publicPages.developers.api.sidebar.block') },
    { label: t('publicPages.developers.api.sidebar.transaction') },
    { label: t('publicPages.developers.api.sidebar.account') },
    { label: t('publicPages.developers.api.sidebar.smartContract') },
    { section: t('publicPages.developers.api.sidebar.websocket') },
    { label: t('publicPages.developers.api.sidebar.realtimeEvents') },
  ];

  const coreEndpoints = [
    {
      method: "GET",
      path: "/blocks/{blockNumber}",
      description: t('publicPages.developers.api.endpoints.blocks.description'),
      params: [{ name: "blockNumber", type: "string", desc: t('publicPages.developers.api.endpoints.blocks.paramDesc') }],
      response: `{
  "number": "158429",
  "hash": "0x83b0...",
  "parentHash": "0x1a2b...",
  "timestamp": 1699823400,
  "transactions": [...]
}`,
    },
    {
      method: "GET",
      path: "/transactions/{txHash}",
      description: t('publicPages.developers.api.endpoints.transactions.description'),
      response: `{
  "hash": "0x5d4e...",
  "blockNumber": "158429",
  "from": "0xSender...",
  "to": "0xReceiver...",
  "value": "1000000000000000000",
  "status": "success"
}`,
    },
    {
      method: "POST",
      path: "/transactions/send",
      description: t('publicPages.developers.api.endpoints.sendTransaction.description'),
      response: `{
  "jsonrpc": "2.0",
  "method": "eth_sendRawTransaction",
  "params": ["0xd46e8..."],
  "id": 1
}`,
    },
    {
      method: "GET",
      path: "/accounts/{address}/balance",
      description: t('publicPages.developers.api.endpoints.balance.description'),
      response: `{
  "address": "0x1234...",
  "balance": "5000000000000000000",
  "nonce": 42
}`,
    },
  ];

  const errorCodes = [
    { code: "400", description: t('publicPages.developers.api.errors.badRequest') },
    { code: "401", description: t('publicPages.developers.api.errors.unauthorized') },
    { code: "429", description: t('publicPages.developers.api.errors.tooManyRequests') },
    { code: "500", description: t('publicPages.developers.api.errors.internalError') },
  ];

  const sdks = [
    { name: t('publicPages.developers.api.sdks.javascript'), icon: SiJavascript, color: "#ffd700", install: "npm install @tburn/web3", hoverBorder: "hover:border-yellow-500/50" },
    { name: t('publicPages.developers.api.sdks.python'), icon: SiPython, color: "#3b82f6", install: "pip install tburn-web3", hoverBorder: "hover:border-blue-500/50" },
    { name: t('publicPages.developers.api.sdks.go'), icon: SiGo, color: "#00f0ff", install: "go get github.com/tburn/go-sdk", hoverBorder: "hover:border-cyan-500/50" },
  ];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://api.tburn.io/v4");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Code className="w-3 h-3" /> {t('publicPages.developers.api.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('publicPages.developers.api.title').split(' ')[0]} <span className="text-gradient">{t('publicPages.developers.api.title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.developers.api.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleCopyUrl}
              className="px-4 py-2 rounded bg-white/5 border border-white/10 font-mono text-sm text-gray-300 flex items-center gap-2 hover:bg-white/10 transition"
              data-testid="button-copy-base-url"
            >
              <span className="text-[#7000ff]">{t('publicPages.developers.api.baseUrl')}:</span> https://api.tburn.io/v4
              <Copy className={`w-4 h-4 ${copiedUrl ? "text-[#00ff9d]" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block col-span-1">
              <div className="sticky top-24 space-y-1">
                {sidebarLinks.map((item, index) => (
                  item.section ? (
                    <div key={index} className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {item.section}
                    </div>
                  ) : (
                    <a 
                      key={index}
                      href="#"
                      className={`block px-4 py-2 rounded transition ${
                        item.active 
                          ? "bg-white/5 text-white font-medium border-l-2 border-[#00f0ff]" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </a>
                  )
                ))}

                {/* Related Links */}
                <div className="pt-8 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('publicPages.developers.api.related')}
                </div>
                <Link href="/developers" className="block px-4 py-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition">
                  {t('publicPages.developers.api.relatedLinks.developerHub')}
                </Link>
                <Link href="/developers/docs" className="block px-4 py-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition">
                  {t('publicPages.developers.api.relatedLinks.documentation')}
                </Link>
                <Link href="/developers/examples" className="block px-4 py-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition">
                  {t('publicPages.developers.api.relatedLinks.codeExamples')}
                </Link>
                <Link href="/developers/quickstart" className="block px-4 py-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition">
                  {t('publicPages.developers.api.relatedLinks.quickStart')}
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="col-span-3 space-y-12">
              {/* Authentication */}
              <div className="spotlight-card rounded-xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Key className="w-6 h-6 text-[#ffd700]" /> {t('publicPages.developers.api.authentication.title')}
                </h2>
                <p className="text-gray-400 mb-6">
                  {t('publicPages.developers.api.authentication.description')}{" "}
                  <Link href="/developers" className="text-[#00f0ff] hover:underline">{t('publicPages.developers.api.authentication.dashboardLink')}</Link>.
                </p>
                <div className="bg-[#0d0d12] border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-400 overflow-x-auto">
                  <span className="text-[#7000ff]">curl</span> https://api.tburn.io/v4/blocks/latest \<br />
                  &nbsp;&nbsp;-H <span className="text-[#00ff9d]">"X-API-Key: YOUR_API_KEY"</span>
                </div>
              </div>

              {/* Core Endpoints */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">{t('publicPages.developers.api.coreEndpoints')}</h2>
                
                <div className="space-y-6">
                  {coreEndpoints.map((endpoint, index) => (
                    <div key={index} className="spotlight-card rounded-xl p-6 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <MethodBadge method={endpoint.method} />
                        <code className="text-white font-mono text-lg">{endpoint.path}</code>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{endpoint.description}</p>
                      
                      {endpoint.params && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('publicPages.developers.api.parameters')}</h4>
                          {endpoint.params.map((param, pIndex) => (
                            <div key={pIndex} className="flex items-center gap-4 text-sm border-b border-white/5 pb-2">
                              <code className="text-[#00f0ff]">{param.name}</code>
                              <span className="text-gray-400">{param.type}</span>
                              <span className="text-gray-500">{param.desc}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-[#0d0d12] border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-400 overflow-x-auto whitespace-pre">
                        {endpoint.response}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Handling */}
              <div className="spotlight-card rounded-xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-[#ff0055]" /> {t('publicPages.developers.api.errorHandling.title')}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 border-b border-white/10">
                      <tr>
                        <th className="py-3">{t('publicPages.developers.api.errorHandling.code')}</th>
                        <th className="py-3">{t('publicPages.developers.api.errorHandling.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {errorCodes.map((error, index) => (
                        <tr key={index} className="border-b border-white/5">
                          <td className="py-3 font-mono text-[#ff0055]">{error.code}</td>
                          <td className="py-3">{error.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* WebSocket API */}
              <div className="spotlight-card rounded-xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-[#7000ff]" /> {t('publicPages.developers.api.websocketApi.title')}
                </h2>
                <p className="text-gray-400 mb-6">
                  {t('publicPages.developers.api.websocketApi.description')}
                </p>
                <div className="bg-[#0d0d12] border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-400 overflow-x-auto">
                  <span className="text-gray-500">// {t('publicPages.developers.api.websocketApi.connectComment')}</span><br />
                  <span className="text-[#7000ff]">const</span> ws = <span className="text-[#7000ff]">new</span> WebSocket(<span className="text-[#00ff9d]">'wss://ws.tburn.io/v4'</span>);<br /><br />
                  <span className="text-gray-500">// {t('publicPages.developers.api.websocketApi.subscribeComment')}</span><br />
                  ws.send(JSON.stringify({'{'}<br />
                  &nbsp;&nbsp;method: <span className="text-[#00ff9d]">'subscribe'</span>,<br />
                  &nbsp;&nbsp;channel: <span className="text-[#00ff9d]">'blocks'</span><br />
                  {'}'}));
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official SDKs */}
      <section className="py-20 px-6 bg-white/5 border-t border-white/5">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-white mb-12">{t('publicPages.developers.api.officialSdks')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sdks.map((sdk, index) => (
              <div 
                key={index}
                className={`spotlight-card rounded-xl p-8 border border-white/10 group ${sdk.hoverBorder} transition-colors`}
              >
                <sdk.icon className="w-10 h-10 mx-auto mb-4" style={{ color: sdk.color }} />
                <h3 className="text-xl font-bold text-white mb-2">{sdk.name}</h3>
                <div className="bg-[#0d0d12] border border-white/10 rounded-lg p-3 font-mono text-xs text-gray-400 mb-4">
                  {sdk.install}
                </div>
                <Link href="/developers/docs" className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1">
                  {t('publicPages.developers.api.viewDocumentation')} <ArrowRight className="w-3 h-3" />
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
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00f0ff] transition-colors">{t('publicPages.developers.api.quickLinks.quickStart.title')}</h3>
              <p className="text-sm text-gray-400">{t('publicPages.developers.api.quickLinks.quickStart.description')}</p>
            </Link>
            <Link href="/developers/examples" className="spotlight-card rounded-xl p-6 border border-white/10 group hover:border-[#7000ff]/50 transition-colors">
              <FileText className="w-8 h-8 text-[#7000ff] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#7000ff] transition-colors">{t('publicPages.developers.api.quickLinks.codeExamples.title')}</h3>
              <p className="text-sm text-gray-400">{t('publicPages.developers.api.quickLinks.codeExamples.description')}</p>
            </Link>
            <Link href="/network/rpc" className="spotlight-card rounded-xl p-6 border border-white/10 group hover:border-[#00ff9d]/50 transition-colors">
              <Layers className="w-8 h-8 text-[#00ff9d] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00ff9d] transition-colors">{t('publicPages.developers.api.quickLinks.rpcProviders.title')}</h3>
              <p className="text-sm text-gray-400">{t('publicPages.developers.api.quickLinks.rpcProviders.description')}</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
