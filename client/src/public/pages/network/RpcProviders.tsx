import { 
  Server, Shield, Network, LineChart, Zap, Book, HeartPulse, 
  Github, FileText, Copy, Check, Terminal
} from "lucide-react";
import { SiTypescript, SiPython } from "react-icons/si";
import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function RpcProviders() {
  const { t } = useTranslation();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Server className="w-3 h-3" /> {t('publicPages.network.rpc.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('publicPages.network.rpc.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.network.rpc.subtitle')}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                data-testid="button-get-api-key"
              >
                {t('publicPages.network.rpc.buttons.getApiKey')}
              </button>
            </Link>
            <Link href="/developers/api">
              <button 
                className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                data-testid="button-view-docs"
              >
                {t('publicPages.network.rpc.buttons.viewDocs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.network.rpc.sections.apiPlans')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="spotlight-card rounded-xl p-6 text-center border border-gray-300 dark:border-white/10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.network.rpc.plans.free.name')}</h3>
              <div className="text-3xl font-mono text-[#00f0ff] font-bold mb-1">20</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{t('publicPages.network.rpc.plans.requestsMin')}</p>
              <div className="text-2xl font-mono text-gray-900 dark:text-white font-bold mb-1">1,000</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">{t('publicPages.network.rpc.plans.requestsDay')}</p>
              <div className="text-xl font-bold text-gray-900 dark:text-white">$0</div>
            </div>

            <div className="spotlight-card rounded-xl p-6 text-center border border-[#7000ff]/30 bg-[#7000ff]/5">
              <h3 className="text-lg font-bold text-[#7000ff] mb-4">{t('publicPages.network.rpc.plans.basic.name')}</h3>
              <div className="text-3xl font-mono text-gray-900 dark:text-white font-bold mb-1">100</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{t('publicPages.network.rpc.plans.requestsMin')}</p>
              <div className="text-2xl font-mono text-gray-900 dark:text-white font-bold mb-1">10,000</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">{t('publicPages.network.rpc.plans.requestsDay')}</p>
              <div className="text-xl font-bold text-gray-900 dark:text-white">$100<span className="text-sm font-normal text-gray-500">{t('publicPages.network.rpc.plans.perMonth')}</span></div>
            </div>

            <div className="spotlight-card rounded-xl p-6 text-center border border-[#00f0ff]/30 bg-[#00f0ff]/5">
              <h3 className="text-lg font-bold text-[#00f0ff] mb-4">{t('publicPages.network.rpc.plans.pro.name')}</h3>
              <div className="text-3xl font-mono text-gray-900 dark:text-white font-bold mb-1">500</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{t('publicPages.network.rpc.plans.requestsMin')}</p>
              <div className="text-2xl font-mono text-gray-900 dark:text-white font-bold mb-1">100,000</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">{t('publicPages.network.rpc.plans.requestsDay')}</p>
              <div className="text-xl font-bold text-gray-900 dark:text-white">$500<span className="text-sm font-normal text-gray-500">{t('publicPages.network.rpc.plans.perMonth')}</span></div>
            </div>

            <div className="spotlight-card rounded-xl p-6 text-center border border-[#ffd700]/30 bg-[#ffd700]/5">
              <h3 className="text-lg font-bold text-[#ffd700] mb-4">{t('publicPages.network.rpc.plans.enterprise.name')}</h3>
              <div className="text-3xl font-mono text-gray-900 dark:text-white font-bold mb-1">{t('publicPages.network.rpc.plans.unlimited')}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{t('publicPages.network.rpc.plans.requestsMin')}</p>
              <div className="text-2xl font-mono text-gray-900 dark:text-white font-bold mb-1">{t('publicPages.network.rpc.plans.unlimited')}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">{t('publicPages.network.rpc.plans.requestsDay')}</p>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.rpc.plans.contact')}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">{t('publicPages.network.rpc.sections.coreEndpoints')}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded bg-[#7000ff]/20 flex items-center justify-center text-[#7000ff]">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.rpc.endpoints.scoreQuery.title')}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-700 dark:text-gray-300">/score/:address</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-700 dark:text-gray-300">/score/:address/history</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#ffd700]">POST</span>
                  <span className="text-gray-700 dark:text-gray-300">/score/batch</span>
                </div>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff]">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.rpc.endpoints.projectApi.title')}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-700 dark:text-gray-300">/projects</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#ffd700]">POST</span>
                  <span className="text-gray-700 dark:text-gray-300">/projects/register</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-700 dark:text-gray-300">/projects/:id</span>
                </div>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded bg-[#ffd700]/20 flex items-center justify-center text-[#ffd700]">
                  <LineChart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.rpc.endpoints.analyticsApi.title')}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-700 dark:text-gray-300">/analytics/trends</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#00ff9d]">GET</span>
                  <span className="text-gray-700 dark:text-gray-300">/analytics/leaderboard</span>
                </div>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded bg-[#ff0055]/20 flex items-center justify-center text-[#ff0055]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.rpc.endpoints.webhookApi.title')}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-mono text-xs py-1 px-2 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                  <span className="text-[#ffd700]">POST</span>
                  <span className="text-gray-700 dark:text-gray-300">/webhooks</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('publicPages.network.rpc.endpoints.webhookApi.events')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">{t('publicPages.network.rpc.sections.sdkExamples')}</h2>
          
          <div className="space-y-12">
            <div className="spotlight-card rounded-xl p-0 border border-gray-300 dark:border-white/10 overflow-hidden">
              <div className="bg-gray-50 dark:bg-black/40 border-b border-gray-300 dark:border-white/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <SiTypescript className="text-yellow-400 text-xl" />
                  <span className="text-gray-900 dark:text-white font-bold">{t('publicPages.network.rpc.sdk.typescript.title')}</span>
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
      baseUrl: 'https://api.tburn.io/v8',
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

            <div className="spotlight-card rounded-xl p-0 border border-gray-300 dark:border-white/10 overflow-hidden">
              <div className="bg-gray-50 dark:bg-black/40 border-b border-gray-300 dark:border-white/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <SiPython className="text-blue-400 text-xl" />
                  <span className="text-gray-900 dark:text-white font-bold">{t('publicPages.network.rpc.sdk.python.title')}</span>
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

            <div className="spotlight-card rounded-xl p-0 border border-gray-300 dark:border-white/10 overflow-hidden">
              <div className="bg-gray-50 dark:bg-black/40 border-b border-gray-300 dark:border-white/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Terminal className="text-green-400 text-xl" />
                  <span className="text-gray-900 dark:text-white font-bold">{t('publicPages.network.rpc.sdk.curl.title')}</span>
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

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-t border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.network.rpc.sections.support')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/developers/docs" className="spotlight-card rounded-xl p-6 text-center border border-gray-300 dark:border-white/10 group" data-testid="link-support-docs">
              <Book className="w-8 h-8 text-[#7000ff] mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.rpc.support.documentation.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.rpc.support.documentation.desc')}</p>
            </Link>
            <Link href="/network/status" className="spotlight-card rounded-xl p-6 text-center border border-gray-300 dark:border-white/10 group" data-testid="link-support-status">
              <HeartPulse className="w-8 h-8 text-[#00ff9d] mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.rpc.support.apiStatus.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.rpc.support.apiStatus.desc')}</p>
            </Link>
            <Link href="/developers" className="spotlight-card rounded-xl p-6 text-center border border-gray-300 dark:border-white/10 group" data-testid="link-support-devhub">
              <Github className="w-8 h-8 text-gray-900 dark:text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.rpc.support.developerHub.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.rpc.support.developerHub.desc')}</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="spotlight-card rounded-2xl p-12 border border-[#00f0ff]/30">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.network.rpc.cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              {t('publicPages.network.rpc.cta.desc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/developers/quickstart">
                <button 
                  className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  data-testid="button-get-started"
                >
                  {t('publicPages.network.rpc.cta.getStartedFree')}
                </button>
              </Link>
              <Link href="/community/hub">
                <button 
                  className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2"
                  data-testid="button-contact-sales"
                >
                  <FileText className="w-4 h-4" /> {t('publicPages.network.rpc.cta.contactSales')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
