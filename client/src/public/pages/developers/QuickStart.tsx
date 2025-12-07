import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
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

function CodeBlock({ 
  code, 
  className = "",
}: { 
  code: string; 
  className?: string;
}) {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    toast({ title: t('common.copiedToClipboard') });
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
      className={`relative font-mono text-sm overflow-x-auto ${className} bg-gray-900 dark:bg-[#0d0d12] border border-gray-300 dark:border-white/10 rounded-lg p-4`}
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
  const { t } = useTranslation();
  const [packageManager, setPackageManager] = useState<"npm" | "yarn">("npm");
  const containerRef = useRef<HTMLDivElement>(null);

  const vsCodeExtensions = [
    t('publicPages.developers.quickstart.vsCode.solidity'),
    t('publicPages.developers.quickstart.vsCode.eslint'),
    t('publicPages.developers.quickstart.vsCode.tburnSnippets')
  ];

  const nextSteps = [
    { title: t('publicPages.developers.quickstart.nextSteps.sdkGuide.title'), desc: t('publicPages.developers.quickstart.nextSteps.sdkGuide.desc'), color: "#00ff9d", href: "/developers/docs" },
    { title: t('publicPages.developers.quickstart.nextSteps.apiReference.title'), desc: t('publicPages.developers.quickstart.nextSteps.apiReference.desc'), color: "#00f0ff", href: "/developers/api" },
    { title: t('publicPages.developers.quickstart.nextSteps.smartContracts.title'), desc: t('publicPages.developers.quickstart.nextSteps.smartContracts.desc'), color: "#7000ff", href: "/developers/examples" }
  ];

  const prerequisites = [
    t('publicPages.developers.quickstart.prerequisites.node'),
    t('publicPages.developers.quickstart.prerequisites.account'),
    t('publicPages.developers.quickstart.prerequisites.knowledge')
  ];

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
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff9d]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00ff9d] mb-6">
            <Rocket className="w-4 h-4" /> {t('publicPages.developers.quickstart.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.developers.quickstart.title').split(' ').slice(0, 2).join(' ')}{" "}
            <span className="bg-gradient-to-r from-[#00ff9d] to-[#00f0ff] bg-clip-text text-transparent">
              {t('publicPages.developers.quickstart.title').split(' ').slice(2).join(' ') || 'Quick Start'}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
            {t('publicPages.developers.quickstart.subtitle')}
          </p>
        </div>
      </section>

      {/* Prerequisites Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold mb-2">{t('publicPages.developers.quickstart.prerequisites.title')}</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-[#00ff9d]" /> {prereq}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Install SDK */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xl">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.quickstart.steps.installSdk.title')}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('publicPages.developers.quickstart.steps.installSdk.description')}
            </p>
            
            <div className="flex gap-2 mb-0">
              <button 
                onClick={() => setPackageManager("npm")}
                className={`px-4 py-2 rounded-t-lg text-xs font-mono transition ${
                  packageManager === "npm" 
                    ? "bg-gray-900 dark:bg-[#0d0d12] border-t border-x border-gray-300 dark:border-white/10 text-[#00ff9d]" 
                    : "bg-gray-100 dark:bg-white/5 border-t border-x border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
                data-testid="tab-npm"
              >
                npm
              </button>
              <button 
                onClick={() => setPackageManager("yarn")}
                className={`px-4 py-2 rounded-t-lg text-xs font-mono transition ${
                  packageManager === "yarn" 
                    ? "bg-gray-900 dark:bg-[#0d0d12] border-t border-x border-gray-300 dark:border-white/10 text-[#00ff9d]" 
                    : "bg-gray-100 dark:bg-white/5 border-t border-x border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
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
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xl">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.quickstart.steps.initializeSdk.title')}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('publicPages.developers.quickstart.steps.initializeSdk.description')}
            </p>
            <CodeBlock code={step2Code} />
          </div>
        </div>
      </section>

      {/* Step 3: First Transaction */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xl">
                3
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.quickstart.steps.firstTransaction.title')}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('publicPages.developers.quickstart.steps.firstTransaction.description')}
            </p>
            <CodeBlock code={step3Code} />
          </div>
        </div>
      </section>

      {/* Step 4: Query Trust Score */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xl">
                4
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.quickstart.steps.queryTrustScore.title')}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('publicPages.developers.quickstart.steps.queryTrustScore.description')}
            </p>
            <CodeBlock code={step4Code} />
          </div>
        </div>
      </section>

      {/* Network Configuration */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('publicPages.developers.quickstart.networkConfig.title')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mainnet */}
            <div 
              className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6"
              style={{ borderTop: "2px solid #00ff9d" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-2 h-2 rounded-full bg-[#00ff9d]"
                  style={{ boxShadow: "0 0 10px #00ff9d" }}
                />
                <h3 className="font-bold text-gray-900 dark:text-white">{t('publicPages.developers.quickstart.networkConfig.mainnet.title')}</h3>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">{t('publicPages.developers.quickstart.networkConfig.chainId')}</span>
                  <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 rounded">7777</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">{t('publicPages.developers.quickstart.networkConfig.rpcUrl')}</span>
                  <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 rounded text-xs">https://rpc.tburn.io</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">{t('publicPages.developers.quickstart.networkConfig.explorer')}</span>
                  <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 rounded text-xs">https://scan.tburn.io</span>
                </div>
              </div>
            </div>

            {/* Testnet */}
            <div 
              className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6"
              style={{ borderTop: "2px solid #ffd700" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-2 h-2 rounded-full bg-[#ffd700]"
                  style={{ boxShadow: "0 0 10px #ffd700" }}
                />
                <h3 className="font-bold text-gray-900 dark:text-white">{t('publicPages.developers.quickstart.networkConfig.testnet.title')}</h3>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">{t('publicPages.developers.quickstart.networkConfig.chainId')}</span>
                  <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 rounded">7778</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">{t('publicPages.developers.quickstart.networkConfig.rpcUrl')}</span>
                  <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 rounded text-xs">https://testnet-rpc.tburn.io</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-gray-500">{t('publicPages.developers.quickstart.networkConfig.explorer')}</span>
                  <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 rounded text-xs">https://testnet-scan.tburn.io</span>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.developers.quickstart.vsCode.title')}</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('publicPages.developers.quickstart.vsCode.description')}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {vsCodeExtensions.map((ext, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card p-4 rounded-lg flex items-center gap-4"
              >
                <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                <span className="text-gray-900 dark:text-white text-sm">{ext}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Next */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('publicPages.developers.quickstart.whatsNext')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {nextSteps.map((step, index) => (
              <Link 
                key={index}
                href={step.href}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card px-6 py-4 rounded-xl transition group cursor-pointer"
                style={{ "--hover-color": step.color } as React.CSSProperties}
                data-testid={`link-next-${index}`}
              >
                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[var(--hover-color)] transition">
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
