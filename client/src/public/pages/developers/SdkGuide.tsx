import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Package, Download, Settings, Code, CheckCircle, RefreshCw, Zap, 
  Server, HelpCircle, Copy, Book, Terminal
} from "lucide-react";
import { SiJavascript, SiPython, SiRust, SiGo, SiDiscord } from "react-icons/si";

const configCode = `import { defineConfig } from '@tburn/sdk';

export default defineConfig({
  // Network: mainnet, testnet, devnet
  network: 'mainnet',
  
  // API Credentials
  apiKey: process.env.TBURN_API_KEY,
  
  // Options
  timeout: 30000,
  retries: 3,
  ws: {
    enabled: true
  }
});`;

const coreExample = `import { TBurnClient } from '@tburn/sdk';

// 1. Initialize Client
const client = new TBurnClient({ apiKey: 'YOUR_KEY' });

// 2. Get Balance
const balance = await client.getBalance('0xYourAddress...');
console.log(\`Balance: \${balance.formatted} TBURN\`);

// 3. Query Trust Score (AI)
const score = await client.ai.getTrustScore('0xProjectAddress...');
console.log(\`Score: \${score.value}/100 (Grade: \${score.grade})\`);

// 4. Send Transaction
const tx = await client.transfer({
  to: '0xRecipient...',
  amount: '100', // TBURN
  gasLimit: 'auto'
});
console.log(\`Transaction Hash: \${tx.hash}\`);`;

const defiExample = `import { TBurnClient, DeFi } from '@tburn/sdk';

const client = new TBurnClient({ apiKey: 'YOUR_KEY' });

// 1. Get Pool Info
const pool = await client.defi.getPool('TBURN-USDT');
console.log(\`TVL: \${pool.tvl}, APY: \${pool.apy}%\`);

// 2. Add Liquidity
const lpTokens = await client.defi.addLiquidity({
  poolId: 'TBURN-USDT',
  amountA: '1000',
  amountB: '500',
  slippage: 0.5
});

// 3. Swap Tokens
const swap = await client.defi.swap({
  from: 'TBURN',
  to: 'USDT',
  amount: '100',
  minReceived: '98'
});`;

const streamingExample = `import { TBurnClient } from '@tburn/sdk';

const client = new TBurnClient({ apiKey: 'YOUR_KEY' });

// 1. Subscribe to New Blocks
client.ws.subscribeBlocks((block) => {
  console.log(\`New block: #\${block.number}\`);
});

// 2. Watch Address Transactions
client.ws.watchAddress('0xYourAddress...', (tx) => {
  console.log(\`New tx: \${tx.hash}\`);
});

// 3. Listen to Trust Score Updates
client.ws.subscribeTrustScores(['0xProject1...'], (update) => {
  console.log(\`Score changed: \${update.oldScore} → \${update.newScore}\`);
});`;

const errorHandlingExample = `import { TBurnClient, TBurnError, RateLimitError, NetworkError } from '@tburn/sdk';

const client = new TBurnClient({ apiKey: 'YOUR_KEY' });

try {
  const balance = await client.getBalance('0xAddress...');
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle rate limiting - wait and retry
    console.log(\`Rate limited. Retry after \${error.retryAfter} seconds\`);
    await sleep(error.retryAfter * 1000);
    // Retry the request
  } else if (error instanceof NetworkError) {
    // Handle network issues
    console.error(\`Network error: \${error.message}\`);
    // Implement fallback or retry logic
  } else if (error instanceof TBurnError) {
    // Handle API errors
    console.error(\`API Error \${error.code}: \${error.message}\`);
    switch (error.code) {
      case 'INVALID_ADDRESS':
        console.log('Please check the address format');
        break;
      case 'INSUFFICIENT_FUNDS':
        console.log('Not enough balance for this operation');
        break;
      default:
        console.log('An unexpected error occurred');
    }
  }
}`;

const pythonExample = `from tburn_sdk import TBurnClient
from tburn_sdk.exceptions import TBurnError, RateLimitError

# Initialize client
client = TBurnClient(api_key="YOUR_API_KEY")

# Get balance
balance = client.get_balance("0xYourAddress...")
print(f"Balance: {balance.formatted} TBURN")

# Send transaction with error handling
try:
    tx = client.transfer(
        to="0xRecipient...",
        amount="100",
        gas_limit="auto"
    )
    print(f"Transaction Hash: {tx.hash}")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after} seconds")
except TBurnError as e:
    print(f"API Error {e.code}: {e.message}")

# DeFi operations
pool = client.defi.get_pool("TBURN-USDT")
print(f"TVL: {pool.tvl}, APY: {pool.apy}%")

# WebSocket streaming
@client.ws.on_block
def handle_block(block):
    print(f"New block: #{block.number}")

client.ws.connect()`;

const goExample = `package main

import (
    "fmt"
    "log"
    tburn "github.com/tburn/go-sdk"
)

func main() {
    // Initialize client
    client, err := tburn.NewClient(tburn.Config{
        APIKey:  "YOUR_API_KEY",
        Network: tburn.Mainnet,
    })
    if err != nil {
        log.Fatalf("Failed to create client: %v", err)
    }

    // Get balance with error handling
    balance, err := client.GetBalance("0xYourAddress...")
    if err != nil {
        switch e := err.(type) {
        case *tburn.RateLimitError:
            fmt.Printf("Rate limited. Retry after %d seconds\\n", e.RetryAfter)
        case *tburn.APIError:
            fmt.Printf("API Error %s: %s\\n", e.Code, e.Message)
        default:
            fmt.Printf("Unknown error: %v\\n", err)
        }
        return
    }
    fmt.Printf("Balance: %s TBURN\\n", balance.Formatted)

    // Send transaction
    tx, err := client.Transfer(tburn.TransferRequest{
        To:       "0xRecipient...",
        Amount:   "100",
        GasLimit: "auto",
    })
    if err == nil {
        fmt.Printf("Transaction Hash: %s\\n", tx.Hash)
    }
}`;

const rustExample = `use tburn_sdk::{TBurnClient, Config, Error};

#[tokio::main]
async fn main() -> Result<(), Error> {
    // Initialize client
    let client = TBurnClient::new(Config {
        api_key: "YOUR_API_KEY".to_string(),
        network: Network::Mainnet,
        ..Default::default()
    })?;

    // Get balance with pattern matching error handling
    match client.get_balance("0xYourAddress...").await {
        Ok(balance) => {
            println!("Balance: {} TBURN", balance.formatted);
        }
        Err(Error::RateLimit { retry_after }) => {
            println!("Rate limited. Retry after {} seconds", retry_after);
        }
        Err(Error::Api { code, message }) => {
            println!("API Error {}: {}", code, message);
        }
        Err(e) => {
            println!("Unknown error: {:?}", e);
        }
    }

    // Send transaction
    let tx = client.transfer(TransferRequest {
        to: "0xRecipient...".to_string(),
        amount: "100".to_string(),
        gas_limit: GasLimit::Auto,
    }).await?;
    
    println!("Transaction Hash: {}", tx.hash);
    Ok(())
}`;

export default function SdkGuide() {
  const { t } = useTranslation();
  const [activeLang, setActiveLang] = useState("JavaScript");
  const [activeTab, setActiveTab] = useState("Core");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const languages = [
    { name: "TypeScript", icon: SiJavascript, color: "#ffd700", version: "v8.0.0", active: true },
    { name: "Python", icon: SiPython, color: "#3b82f6", version: "v8.0.0", active: true },
    { name: "Go", icon: SiGo, color: "#00f0ff", version: "v8.0.0", active: true },
    { name: "Rust", icon: SiRust, color: "#f97316", version: "v8.0.0", active: true },
  ];

  const features = [
    { 
      icon: CheckCircle, 
      title: t('publicPages.developers.sdk.features.typeSafety.title'), 
      desc: t('publicPages.developers.sdk.features.typeSafety.description'),
      color: "#00ff9d",
      bgColor: "bg-[#00ff9d]/10"
    },
    { 
      icon: RefreshCw, 
      title: t('publicPages.developers.sdk.features.autoRetry.title'), 
      desc: t('publicPages.developers.sdk.features.autoRetry.description'),
      color: "#7000ff",
      bgColor: "bg-[#7000ff]/10"
    },
    { 
      icon: Zap, 
      title: t('publicPages.developers.sdk.features.realTimeStreams.title'), 
      desc: t('publicPages.developers.sdk.features.realTimeStreams.description'),
      color: "#00f0ff",
      bgColor: "bg-[#00f0ff]/10"
    },
  ];

  const installCommands = [
    { label: t('publicPages.developers.sdk.install.npm'), command: "npm install @tburn/sdk" },
    { label: t('publicPages.developers.sdk.install.yarn'), command: "yarn add @tburn/sdk" },
  ];

  const exampleTabs = [
    t('publicPages.developers.sdk.examples.core'),
    t('publicPages.developers.sdk.examples.defi'),
    t('publicPages.developers.sdk.examples.streaming'),
    "Error Handling"
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getExampleCode = () => {
    switch (activeTab) {
      case t('publicPages.developers.sdk.examples.defi'): return defiExample;
      case t('publicPages.developers.sdk.examples.streaming'): return streamingExample;
      case "Error Handling": return errorHandlingExample;
      default: return coreExample;
    }
  };

  const getLanguageSpecificCode = () => {
    switch (activeLang) {
      case "Python": return pythonExample;
      case "Go": return goExample;
      case "Rust": return rustExample;
      default: return coreExample;
    }
  };

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#7000ff] to-[#00f0ff] flex items-center justify-center shadow-[0_0_30px_rgba(112,0,255,0.3)]">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.sdk.title')}</h1>
              <p className="text-sm text-[#00f0ff] font-mono mt-1">{t('publicPages.developers.sdk.tag')}</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
            {t('publicPages.developers.sdk.subtitle')}
          </p>
        </div>
      </section>

      {/* Language Selector (Sticky) */}
      <section className="py-4 px-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40 sticky top-20 z-40 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => (
              <button
                key={lang.name}
                onClick={() => setActiveLang(lang.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition border ${
                  activeLang === lang.name
                    ? "bg-[#7000ff]/20 border-[#7000ff] text-gray-900 dark:text-white"
                    : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#7000ff] hover:text-gray-900 dark:hover:text-white"
                }`}
                data-testid={`button-lang-${lang.name.toLowerCase()}`}
              >
                <lang.icon className="w-4 h-4" style={{ color: lang.color }} />
                {lang.name}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10">{lang.version}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`} style={{ color: feature.color }}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation & Configuration */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Installation */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Download className="w-6 h-6 text-[#00f0ff]" /> {t('publicPages.developers.sdk.installation')}
              </h2>
              <div className="space-y-4">
                {installCommands.map((install, index) => (
                  <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 font-mono">{install.label}</span>
                      <button 
                        onClick={() => handleCopy(install.command, index)}
                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                      >
                        <Copy className={`w-4 h-4 ${copiedIndex === index ? "text-[#00ff9d]" : ""}`} />
                      </button>
                    </div>
                    <div className="bg-gray-900 dark:bg-[#0d0d12] border border-gray-300 dark:border-white/10 rounded-lg p-3 font-mono text-sm text-white">
                      {install.command}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#7000ff]" /> {t('publicPages.developers.sdk.configuration')}
              </h2>
              <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-black/40 border-b border-gray-200 dark:border-white/10 p-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-gray-500 font-mono">tburn.config.ts</span>
                </div>
                <pre className="bg-gray-900 dark:bg-[#0d0d12] p-4 font-mono text-sm text-gray-300 dark:text-gray-400 overflow-x-auto">
                  <code dangerouslySetInnerHTML={{ __html: configCode
                    .replace(/import|from|export default/g, '<span class="text-[#7000ff]">$&</span>')
                    .replace(/'[^']*'/g, '<span class="text-[#00ff9d]">$&</span>')
                    .replace(/\/\/.*/g, '<span class="text-gray-500">$&</span>')
                    .replace(/\b(true|false)\b/g, '<span class="text-[#7000ff]">$1</span>')
                    .replace(/\b(\d+)\b/g, '<span class="text-[#ffd700]">$1</span>')
                  }} />
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Examples */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
            <Code className="w-6 h-6 text-[#ffd700]" /> {t('publicPages.developers.sdk.quickExamples')}
          </h2>

          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black/40">
              {exampleTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition ${
                    activeTab === tab
                      ? "text-gray-900 dark:text-white border-b-2 border-[#7000ff] bg-white dark:bg-white/5 font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  data-testid={`button-tab-${tab.toLowerCase()}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <pre className="bg-gray-900 dark:bg-[#0d0d12] p-6 font-mono text-sm text-gray-300 dark:text-gray-400 overflow-x-auto">
              <code dangerouslySetInnerHTML={{ __html: getExampleCode()
                .replace(/import|from|const|await|new/g, '<span class="text-[#7000ff]">$&</span>')
                .replace(/'[^']*'/g, '<span class="text-[#00ff9d]">$&</span>')
                .replace(/`[^`]*`/g, '<span class="text-[#00ff9d]">$&</span>')
                .replace(/\/\/.*/g, '<span class="text-gray-500">$&</span>')
              }} />
            </pre>
          </div>
        </div>
      </section>

      {/* Language-Specific Examples */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[#00ff9d]" /> Language-Specific Examples
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Full SDK examples with error handling for each supported language. Select a language from the top navigation to see the corresponding code.
          </p>

          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-black/40 border-b border-gray-200 dark:border-white/10 p-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-gray-500 font-mono">
                {activeLang === "Python" ? "main.py" : 
                 activeLang === "Go" ? "main.go" : 
                 activeLang === "Rust" ? "main.rs" : "index.ts"}
              </span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded bg-[#7000ff]/20 text-[#7000ff]">{activeLang}</span>
            </div>
            <pre className="bg-gray-900 dark:bg-[#0d0d12] p-6 font-mono text-sm text-gray-300 dark:text-gray-400 overflow-x-auto max-h-[600px]">
              <code dangerouslySetInnerHTML={{ __html: getLanguageSpecificCode()
                .replace(/import|from|const|await|new|package|func|use|async|fn|let|match|Ok|Err/g, '<span class="text-[#7000ff]">$&</span>')
                .replace(/"[^"]*"/g, '<span class="text-[#00ff9d]">$&</span>')
                .replace(/'[^']*'/g, '<span class="text-[#00ff9d]">$&</span>')
                .replace(/`[^`]*`/g, '<span class="text-[#00ff9d]">$&</span>')
                .replace(/\/\/.*/g, '<span class="text-gray-500">$&</span>')
                .replace(/#.*/g, '<span class="text-gray-500">$&</span>')
              }} />
            </pre>
          </div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#7000ff]/5 to-transparent border-t border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6" /> {t('publicPages.developers.sdk.needHelp.title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/developers/api"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#00f0ff] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-api-reference"
            >
              <Server className="w-5 h-5 text-[#00f0ff]" /> {t('publicPages.developers.sdk.needHelp.apiReference')}
            </Link>
            <Link 
              href="/developers/cli"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#00ff9d] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-cli-reference"
            >
              <Terminal className="w-5 h-5 text-[#00ff9d]" /> {t('publicPages.developers.sdk.needHelp.cliReference')}
            </Link>
            <Link 
              href="/developers/examples"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#ffd700] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-code-examples"
            >
              <Book className="w-5 h-5 text-[#ffd700]" /> {t('publicPages.developers.sdk.needHelp.codeExamples')}
            </Link>
            <Link 
              href="/community/hub"
              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#7000ff] transition flex items-center gap-2 text-gray-900 dark:text-white"
              data-testid="link-discord-support"
            >
              <SiDiscord className="w-5 h-5 text-[#7000ff]" /> {t('publicPages.developers.sdk.needHelp.discordSupport')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
