import { 
  Server, Shield, Network, LineChart, Zap, Book, HeartPulse, 
  Github, FileText, Copy, Check, Terminal
} from "lucide-react";
import { SiTypescript, SiPython } from "react-icons/si";
import { useState } from "react";
import { Link } from "wouter";

export default function RpcProviders() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Server className="w-3 h-3" /> RPC_NODES & API
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            RPC <span className="text-gradient">API</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            With TBurn Chain API, you can query trust scores, manage projects, access validator information, analytics data, webhooks, and more.<br />
            <span className="text-sm font-mono text-[#7000ff] mt-4 block">Version 1.0 | Base URL: https://api.tburn.io/v1</span>
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                data-testid="button-get-api-key"
              >
                Get API Key
              </button>
            </Link>
            <Link href="/developers/api">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-view-docs"
              >
                View Docs
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* API Plans & Limits */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">API Plans & Limits</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Free */}
            <div className="spotlight-card rounded-xl p-6 text-center border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Free</h3>
              <div className="text-3xl font-mono text-[#00f0ff] font-bold mb-1">20</div>
              <p className="text-xs text-gray-400 mb-4">requests/min</p>
              <div className="text-2xl font-mono text-white font-bold mb-1">1,000</div>
              <p className="text-xs text-gray-400 mb-6">requests/day</p>
              <div className="text-xl font-bold text-white">$0</div>
            </div>

            {/* Basic */}
            <div className="spotlight-card rounded-xl p-6 text-center border border-[#7000ff]/30 bg-[#7000ff]/5">
              <h3 className="text-lg font-bold text-[#7000ff] mb-4">Basic</h3>
              <div className="text-3xl font-mono text-white font-bold mb-1">100</div>
              <p className="text-xs text-gray-400 mb-4">requests/min</p>
              <div className="text-2xl font-mono text-white font-bold mb-1">10,000</div>
              <p className="text-xs text-gray-400 mb-6">requests/day</p>
              <div className="text-xl font-bold text-white">$100<span className="text-sm font-normal text-gray-500">/mo</span></div>
            </div>

            {/* Pro */}
            <div className="spotlight-card rounded-xl p-6 text-center border border-[#00f0ff]/30 bg-[#00f0ff]/5">
              <h3 className="text-lg font-bold text-[#00f0ff] mb-4">Pro</h3>
              <div className="text-3xl font-mono text-white font-bold mb-1">500</div>
              <p className="text-xs text-gray-400 mb-4">requests/min</p>
              <div className="text-2xl font-mono text-white font-bold mb-1">100,000</div>
              <p className="text-xs text-gray-400 mb-6">requests/day</p>
              <div className="text-xl font-bold text-white">$500<span className="text-sm font-normal text-gray-500">/mo</span></div>
            </div>

            {/* Enterprise */}
            <div className="spotlight-card rounded-xl p-6 text-center border border-[#ffd700]/30 bg-[#ffd700]/5">
              <h3 className="text-lg font-bold text-[#ffd700] mb-4">Enterprise</h3>
              <div className="text-3xl font-mono text-white font-bold mb-1">Unlim.</div>
              <p className="text-xs text-gray-400 mb-4">requests/min</p>
              <div className="text-2xl font-mono text-white font-bold mb-1">Unlim.</div>
              <p className="text-xs text-gray-400 mb-6">requests/day</p>
              <div className="text-xl font-bold text-white">Contact</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Endpoints */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12">Core Endpoints</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Score Query API */}
            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded bg-[#7000ff]/20 flex items-center justify-center text-[#7000ff]">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Score Query API</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-300">/score/:address</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-300">/score/:address/history</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#ffd700]">POST</span>
                  <span className="text-gray-300">/score/batch</span>
                </div>
              </div>
            </div>

            {/* Project API */}
            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff]">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Project API</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-300">/projects</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#ffd700]">POST</span>
                  <span className="text-gray-300">/projects/register</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-300">/projects/:id</span>
                </div>
              </div>
            </div>

            {/* Analytics API */}
            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded bg-[#ffd700]/20 flex items-center justify-center text-[#ffd700]">
                  <LineChart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Analytics API</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-300">/analytics/trends</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-300">/analytics/leaderboard</span>
                </div>
              </div>
            </div>

            {/* Webhook API */}
            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded bg-[#ff0055]/20 flex items-center justify-center text-[#ff0055]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Webhook API</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-white/5 border border-white/10">
                  <span className="text-[#ffd700]">POST</span>
                  <span className="text-gray-300">/webhooks</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Events: score.updated, score.alert, project.registered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDK & Enterprise Examples */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12">SDK & Enterprise Examples</h2>
          
          <div className="space-y-12">
            {/* TypeScript SDK */}
            <div className="spotlight-card rounded-xl p-0 border border-white/10 overflow-hidden">
              <div className="bg-black/40 border-b border-white/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <SiTypescript className="text-yellow-400 text-xl" />
                  <span className="text-white font-bold">TypeScript Enterprise SDK</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">npm install @tburn/sdk</span>
              </div>
              <div className="bg-[#0d0d12] p-4 overflow-x-auto">
                <pre className="text-gray-300 text-sm font-mono leading-relaxed">{`import { TBurnSDK, TBurnConfig, TrustScore } from '@tburn/sdk';

class TBurnEnterpriseClient {
  private sdk: TBurnSDK;

  constructor(config: EnterpriseConfig) {
    this.sdk = new TBurnSDK({
      apiKey: config.apiKey,
      baseUrl: 'https://api.tburn.io/v1',
      timeout: 30000,
      retries: 3
    });
  }

  // Trust Score with caching and validation
  async getTrustScore(address: string, options?: { useCache?: boolean }): Promise<TrustScore> {
    return this.executeWithCircuitBreaker(async () => {
      const response = await this.sdk.score.get(address, {
        cache: options?.useCache ?? true,
      });
      return response;
    });
  }

  // Real-time WebSocket subscription
  subscribeToScoreUpdates(addresses: string[], callbacks: any): () => void {
    const ws = this.sdk.realtime.subscribe({
      channels: addresses.map(addr => \`score:\${addr}\`),
      events: ['score.updated', 'score.alert']
    });
    
    ws.on('score.updated', callbacks.onUpdate);
    return () => ws.unsubscribe();
  }
}`}</pre>
              </div>
            </div>

            {/* Python SDK */}
            <div className="spotlight-card rounded-xl p-0 border border-white/10 overflow-hidden">
              <div className="bg-black/40 border-b border-white/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <SiPython className="text-blue-400 text-xl" />
                  <span className="text-white font-bold">Python Enterprise SDK</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">pip install tburn-sdk[enterprise]</span>
              </div>
              <div className="bg-[#0d0d12] p-4 overflow-x-auto">
                <pre className="text-gray-300 text-sm font-mono leading-relaxed">{`import asyncio
from tburn import AsyncTBurnClient, TrustScore

class TBurnEnterpriseClient:
    """Enterprise-grade TBurn Chain API client with advanced features."""
    
    def __init__(self, api_key: str):
        self._client = AsyncTBurnClient(
            api_key=api_key,
            base_url="https://api.tburn.io/v1",
            connector_limit=100
        )

    async def get_trust_score(self, address: str) -> TrustScore:
        """Fetch trust score with automatic retry and caching."""
        try:
            result = await self._client.score.get(address)
            return result
        except Exception as e:
            logger.error("api_error", error=str(e), address=address)
            raise

# Usage Example
async def main():
    async with TBurnEnterpriseClient(api_key=os.environ["TBURN_API_KEY"]) as client:
        # Batch processing
        addresses = [f"0x{i:040x}" for i in range(10000)]
        scores = await client.batch_get_scores(addresses, batch_size=100)
        print(f"Processed {len(scores)} addresses")

if __name__ == "__main__":
    asyncio.run(main())`}</pre>
              </div>
            </div>

            {/* cURL Example */}
            <div className="spotlight-card rounded-xl p-0 border border-white/10 overflow-hidden">
              <div className="bg-black/40 border-b border-white/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Terminal className="text-green-400 text-xl" />
                  <span className="text-white font-bold">cURL Production Example</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">bash</span>
              </div>
              <div className="bg-[#0d0d12] p-4 overflow-x-auto">
                <pre className="text-gray-300 text-sm font-mono leading-relaxed">{`#!/bin/bash
# Enterprise-grade TBurn Chain API wrapper with retry logic

TBURN_API_KEY="\${TBURN_API_KEY:?API key required}"
TBURN_BASE_URL="https://api.tburn.io/v1"

# Get trust score with validation
get_trust_score() {
    local address="$1"
    
    if [[ ! "$address" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
        echo "Invalid address format" >&2
        return 1
    fi
    
    curl -s -X GET "\${TBURN_BASE_URL}/score/\${address}" \\
        -H "X-API-Key: \${TBURN_API_KEY}" \\
        -H "Content-Type: application/json"
}

# Example: Webhook Registration
echo "=== Webhook Registration ==="
curl -X POST "\${TBURN_BASE_URL}/webhooks" \\
    -H "X-API-Key: \${TBURN_API_KEY}" \\
    -H "Content-Type: application/json" \\
    -d '{
        "url": "https://api.yourapp.com/tburn/webhook",
        "events": ["score.updated", "score.alert"],
        "filters": {"min_score_change": 5}
    }'`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Contact */}
      <section className="py-20 px-6 bg-white/5 border-t border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Support & Contact</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/developers/docs" className="spotlight-card rounded-xl p-6 text-center border border-white/10 group" data-testid="link-support-docs">
              <Book className="w-8 h-8 text-[#7000ff] mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">Documentation</h3>
              <p className="text-sm text-gray-400">Detailed API references and guides.</p>
            </Link>
            <Link href="/network/status" className="spotlight-card rounded-xl p-6 text-center border border-white/10 group" data-testid="link-support-status">
              <HeartPulse className="w-8 h-8 text-[#00ff9d] mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">API Status</h3>
              <p className="text-sm text-gray-400">Real-time system status and uptime.</p>
            </Link>
            <Link href="/developers" className="spotlight-card rounded-xl p-6 text-center border border-white/10 group" data-testid="link-support-devhub">
              <Github className="w-8 h-8 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">Developer Hub</h3>
              <p className="text-sm text-gray-400">Open source SDKs and examples.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="spotlight-card rounded-2xl p-12 border border-[#00f0ff]/30">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Start building with TBurn Chain API today. Get your free API key and access enterprise-grade blockchain infrastructure.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/developers/quickstart">
                <button 
                  className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  data-testid="button-get-started"
                >
                  Get Started Free
                </button>
              </Link>
              <Link href="/community/hub">
                <button 
                  className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition flex items-center gap-2"
                  data-testid="button-contact-sales"
                >
                  <FileText className="w-4 h-4" /> Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
