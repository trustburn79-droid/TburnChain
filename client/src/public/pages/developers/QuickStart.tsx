import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Rocket, 
  AlertTriangle, 
  Check, 
  Copy,
  Code,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const step1Code = {
  npm: 'npm install @tburn/sdk',
  yarn: 'yarn add @tburn/sdk'
};

const step2Code = `import { TBurnSDK } from '@tburn/sdk';

// Initialize the SDK
const sdk = new TBurnSDK({
  apiKey: process.env.TBURN_API_KEY,
  network: 'testnet', // or 'mainnet'
  options: {
    timeout: 30000,
    retries: 3
  }
});

// Verify connection
const info = await sdk.getNetworkInfo();
console.log('Connected to Chain ID:', info.chainId);`;

const step3Code = `// Connect Wallet (Private Key should be in .env)
const wallet = sdk.connectWallet({
  privateKey: process.env.PRIVATE_KEY
});

// Send TBURN
const tx = await sdk.sendTransaction({
  to: '0x742d35...',
  value: sdk.utils.parseEther('10'), // 10 TBURN
  gasLimit: 21000
});

console.log('Tx Hash:', tx.hash);
const receipt = await tx.wait();
console.log('Confirmed in block:', receipt.blockNumber);`;

const step4Code = `const score = await sdk.getTrustScore('0x1234...');

console.log('Trust Score:', score.total); // 0-100
console.log('Grade:', score.grade); // S, A, B, C, D, F
console.log('AI Summary:', score.aiAnalysis.summary);`;

const vsCodeExtensions = [
  "Solidity (NomicFoundation)",
  "ESLint & Prettier",
  "TBurn Snippets (Official)"
];

const nextSteps = [
  { title: "SDK Guide", desc: "Deep dive into features", color: "#00ff9d", href: "/developers/docs" },
  { title: "API Reference", desc: "Raw endpoints", color: "#00f0ff", href: "/developers/api" },
  { title: "Smart Contracts", desc: "Solidity examples", color: "#7000ff", href: "/developers/examples" }
];

function CodeBlock({ 
  code, 
  className = "",
}: { 
  code: string; 
  className?: string;
}) {
  const { toast } = useToast();
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard!" });
  };

  const highlightCode = (text: string) => {
    return text
      .replace(/(import|from|const|await|new|process\.env)/g, '<span style="color: #c678dd">$1</span>')
      .replace(/(TBurnSDK|connectWallet|sendTransaction|getTrustScore|getNetworkInfo|parseEther|wait|log)/g, '<span style="color: #61afef">$1</span>')
      .replace(/('[@\/\w.-]+'|"[@\/\w.-]+")/g, '<span style="color: #98c379">$1</span>')
      .replace(/(\/\/ .*)/g, '<span style="color: #6b7280">$1</span>')
      .replace(/(\d+)/g, '<span style="color: #c678dd">$1</span>');
  };

  return (
    <div 
      className={`relative font-mono text-sm overflow-x-auto ${className}`}
      style={{ 
        background: "#0d0d12",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "0.5rem",
        padding: "1rem"
      }}
    >
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10 transition"
        data-testid="button-copy-code"
      >
        <Copy className="w-4 h-4" />
      </button>
      <pre>
        <code 
          className="text-gray-300"
          dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
        />
      </pre>
    </div>
  );
}

export default function QuickStart() {
  const [packageManager, setPackageManager] = useState<"npm" | "yarn">("npm");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll(".spotlight-card");
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff9d]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00ff9d] mb-6">
            <Rocket className="w-4 h-4" /> 5_MINUTE_DEPLOY
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Get Started in{" "}
            <span className="bg-gradient-to-r from-[#00ff9d] to-[#00f0ff] bg-clip-text text-transparent">
              5 Minutes
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
            Build your first trust-based dApp on TBurn Chain V4.<br />
            From SDK installation to your first transaction.
          </p>
        </div>
      </section>

      {/* Prerequisites Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-bold mb-2">Prerequisites</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-[#00ff9d]" /> Node.js v18+ or Python 3.9+
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-[#00ff9d]" /> TBurn Developer Account (Free)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-[#00ff9d]" /> Basic JavaScript/TypeScript knowledge
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Install SDK */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xl">
                1
              </div>
              <h2 className="text-2xl font-bold text-white">Install SDK</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Install the TBurn Chain SDK. It provides type-safe methods for all blockchain interactions including Trust Score queries.
            </p>
            
            <div className="flex gap-2 mb-0">
              <button 
                onClick={() => setPackageManager("npm")}
                className={`px-4 py-2 rounded-t-lg text-xs font-mono transition ${
                  packageManager === "npm" 
                    ? "bg-[#0d0d12] border-t border-x border-white/10 text-[#00ff9d]" 
                    : "bg-white/5 border-t border-x border-transparent text-gray-500 hover:text-white"
                }`}
                data-testid="tab-npm"
              >
                npm
              </button>
              <button 
                onClick={() => setPackageManager("yarn")}
                className={`px-4 py-2 rounded-t-lg text-xs font-mono transition ${
                  packageManager === "yarn" 
                    ? "bg-[#0d0d12] border-t border-x border-white/10 text-[#00ff9d]" 
                    : "bg-white/5 border-t border-x border-transparent text-gray-500 hover:text-white"
                }`}
                data-testid="tab-yarn"
              >
                yarn
              </button>
            </div>
            <CodeBlock code={step1Code[packageManager]} className="rounded-tl-none" />
          </div>
        </div>
      </section>

      {/* Step 2: Initialize SDK */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xl">
                2
              </div>
              <h2 className="text-2xl font-bold text-white">Initialize SDK</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Configure the SDK with your API key. We recommend using the Testnet for development.
            </p>
            <CodeBlock code={step2Code} />
          </div>
        </div>
      </section>

      {/* Step 3: First Transaction */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xl">
                3
              </div>
              <h2 className="text-2xl font-bold text-white">First Transaction</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Connect a wallet and send your first transaction. TBurn Chain offers ultra-low gas fees (~$0.0001).
            </p>
            <CodeBlock code={step3Code} />
          </div>
        </div>
      </section>

      {/* Step 4: Query Trust Score */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xl">
                4
              </div>
              <h2 className="text-2xl font-bold text-white">Query Trust Score</h2>
            </div>
            <p className="text-gray-400 mb-6">
              This is the core feature of TBurn. Check the reliability of any project address.
            </p>
            <CodeBlock code={step4Code} />
          </div>
        </div>
      </section>

      {/* Network Configuration */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Network Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mainnet */}
            <div 
              className="spotlight-card rounded-xl p-6"
              style={{ borderTop: "2px solid #00ff9d" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-2 h-2 rounded-full bg-[#00ff9d]"
                  style={{ boxShadow: "0 0 10px #00ff9d" }}
                />
                <h3 className="font-bold text-white">Mainnet</h3>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">Chain ID</span>
                  <span className="text-white bg-white/10 px-2 rounded">7777</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">RPC URL</span>
                  <span className="text-white bg-white/10 px-2 rounded text-xs">https://rpc.tburn.io</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">Explorer</span>
                  <span className="text-white bg-white/10 px-2 rounded text-xs">https://scan.tburn.io</span>
                </div>
              </div>
            </div>

            {/* Testnet */}
            <div 
              className="spotlight-card rounded-xl p-6"
              style={{ borderTop: "2px solid #ffd700" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-2 h-2 rounded-full bg-[#ffd700]"
                  style={{ boxShadow: "0 0 10px #ffd700" }}
                />
                <h3 className="font-bold text-white">Testnet</h3>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">Chain ID</span>
                  <span className="text-white bg-white/10 px-2 rounded">7778</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">RPC URL</span>
                  <span className="text-white bg-white/10 px-2 rounded text-xs">https://testnet-rpc.tburn.io</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">Explorer</span>
                  <span className="text-white bg-white/10 px-2 rounded text-xs">https://testnet-scan.tburn.io</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VS Code Setup */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-[#00f0ff]" />
            <h2 className="text-2xl font-bold text-white">VS Code Setup</h2>
          </div>
          <p className="text-gray-400 mb-6">Recommended extensions for the best development experience.</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {vsCodeExtensions.map((ext, index) => (
              <div 
                key={index}
                className="spotlight-card p-4 rounded-lg flex items-center gap-4"
              >
                <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                <span className="text-white text-sm">{ext}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Next */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-white mb-8">What's Next?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {nextSteps.map((step, index) => (
              <Link 
                key={index}
                href={step.href}
                className="spotlight-card px-6 py-4 rounded-xl border border-white/10 transition group cursor-pointer"
                style={{ "--hover-color": step.color } as React.CSSProperties}
                data-testid={`link-next-${index}`}
              >
                <h4 className="font-bold text-white group-hover:text-[var(--hover-color)] transition">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
