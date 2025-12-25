import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "wouter";
import { 
  Wallet, 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Shield,
  Hexagon,
  Cpu,
  Globe,
  Smartphone,
  Monitor,
  Key,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WalletType = "metamask" | "trust" | "ledger";

interface WalletConfig {
  name: string;
  icon: "metamask" | "shield" | "hardware";
  iconColor: string;
  description: string;
  platforms: string[];
  downloadUrl: string;
  steps: { title: string; description: string }[];
  networkConfig: { label: string; value: string }[];
}

export default function WalletGuide() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ wallet: string }>();
  const walletType = (params.wallet as WalletType) || "metamask";

  const walletConfigs: Record<WalletType, WalletConfig> = {
    metamask: {
      name: "MetaMask",
      icon: "metamask",
      iconColor: "#f6851b",
      description: t('publicPages.learn.walletGuide.metamask.description', 'MetaMask is the most popular Web3 wallet. Connect it to TBurn Chain for full compatibility with all standard token operations.'),
      platforms: [t('publicPages.learn.walletGuide.platforms.browser', 'Browser Extension'), t('publicPages.learn.walletGuide.platforms.mobile', 'Mobile App')],
      downloadUrl: "https://metamask.io/download/",
      steps: [
        { 
          title: t('publicPages.learn.walletGuide.metamask.steps.install.title', 'Install MetaMask'),
          description: t('publicPages.learn.walletGuide.metamask.steps.install.description', 'Download MetaMask from the official website or your browser\'s extension store.')
        },
        { 
          title: t('publicPages.learn.walletGuide.metamask.steps.create.title', 'Create or Import Wallet'),
          description: t('publicPages.learn.walletGuide.metamask.steps.create.description', 'Create a new wallet or import an existing one using your seed phrase.')
        },
        { 
          title: t('publicPages.learn.walletGuide.metamask.steps.network.title', 'Add TBurn Chain Network'),
          description: t('publicPages.learn.walletGuide.metamask.steps.network.description', 'Click "Add Network" in MetaMask settings and enter the TBurn Chain configuration below.')
        },
        { 
          title: t('publicPages.learn.walletGuide.metamask.steps.connect.title', 'Connect to dApps'),
          description: t('publicPages.learn.walletGuide.metamask.steps.connect.description', 'Visit TBurn Chain dApps and click "Connect Wallet" to start using the network.')
        }
      ],
      networkConfig: [
        { label: t('publicPages.learn.walletGuide.network.name', 'Network Name'), value: "TBurn Chain" },
        { label: t('publicPages.learn.walletGuide.network.rpc', 'RPC URL'), value: "https://tburn.io/rpc" },
        { label: t('publicPages.learn.walletGuide.network.chainId', 'Chain ID'), value: "6000" },
        { label: t('publicPages.learn.walletGuide.network.symbol', 'Currency Symbol'), value: "TBURN" },
        { label: t('publicPages.learn.walletGuide.network.explorer', 'Block Explorer'), value: "https://scan.tburn.io" }
      ]
    },
    trust: {
      name: "Trust Wallet",
      icon: "shield",
      iconColor: "#3375bb",
      description: t('publicPages.learn.walletGuide.trust.description', 'Trust Wallet is a secure mobile multi-chain wallet. Perfect for managing TBurn assets on the go with dApp browser support.'),
      platforms: [t('publicPages.learn.walletGuide.platforms.ios', 'iOS'), t('publicPages.learn.walletGuide.platforms.android', 'Android')],
      downloadUrl: "https://trustwallet.com/download",
      steps: [
        { 
          title: t('publicPages.learn.walletGuide.trust.steps.install.title', 'Download Trust Wallet'),
          description: t('publicPages.learn.walletGuide.trust.steps.install.description', 'Install Trust Wallet from App Store (iOS) or Google Play Store (Android).')
        },
        { 
          title: t('publicPages.learn.walletGuide.trust.steps.create.title', 'Create Wallet'),
          description: t('publicPages.learn.walletGuide.trust.steps.create.description', 'Create a new wallet and securely backup your 12-word recovery phrase.')
        },
        { 
          title: t('publicPages.learn.walletGuide.trust.steps.network.title', 'Add Custom Network'),
          description: t('publicPages.learn.walletGuide.trust.steps.network.description', 'Go to Settings > Network > Add Custom Network and enter TBurn Chain details.')
        },
        { 
          title: t('publicPages.learn.walletGuide.trust.steps.browser.title', 'Use dApp Browser'),
          description: t('publicPages.learn.walletGuide.trust.steps.browser.description', 'Open the built-in browser and navigate to TBurn Chain dApps to connect.')
        }
      ],
      networkConfig: [
        { label: t('publicPages.learn.walletGuide.network.name', 'Network Name'), value: "TBurn Chain" },
        { label: t('publicPages.learn.walletGuide.network.rpc', 'RPC URL'), value: "https://tburn.io/rpc" },
        { label: t('publicPages.learn.walletGuide.network.chainId', 'Chain ID'), value: "6000" },
        { label: t('publicPages.learn.walletGuide.network.symbol', 'Currency Symbol'), value: "TBURN" },
        { label: t('publicPages.learn.walletGuide.network.explorer', 'Block Explorer'), value: "https://scan.tburn.io" }
      ]
    },
    ledger: {
      name: "Ledger",
      icon: "hardware",
      iconColor: "#9ca3af",
      description: t('publicPages.learn.walletGuide.ledger.description', 'Ledger hardware wallets provide the highest security for your crypto assets. Use with TBurn Chain dApps while keeping private keys offline.'),
      platforms: [t('publicPages.learn.walletGuide.platforms.nanoS', 'Nano S Plus'), t('publicPages.learn.walletGuide.platforms.nanoX', 'Nano X'), t('publicPages.learn.walletGuide.platforms.stax', 'Stax')],
      downloadUrl: "https://www.ledger.com/ledger-live",
      steps: [
        { 
          title: t('publicPages.learn.walletGuide.ledger.steps.setup.title', 'Set Up Ledger Device'),
          description: t('publicPages.learn.walletGuide.ledger.steps.setup.description', 'Initialize your Ledger device and install Ledger Live on your computer.')
        },
        { 
          title: t('publicPages.learn.walletGuide.ledger.steps.app.title', 'Install Ethereum App'),
          description: t('publicPages.learn.walletGuide.ledger.steps.app.description', 'Install the Ethereum app on your Ledger via Ledger Live (TBurn Chain is EVM-compatible).')
        },
        { 
          title: t('publicPages.learn.walletGuide.ledger.steps.metamask.title', 'Connect to MetaMask'),
          description: t('publicPages.learn.walletGuide.ledger.steps.metamask.description', 'Connect your Ledger to MetaMask by selecting "Connect Hardware Wallet" in MetaMask.')
        },
        { 
          title: t('publicPages.learn.walletGuide.ledger.steps.network.title', 'Add TBurn Network'),
          description: t('publicPages.learn.walletGuide.ledger.steps.network.description', 'Add TBurn Chain network to MetaMask and sign transactions securely with your Ledger.')
        }
      ],
      networkConfig: [
        { label: t('publicPages.learn.walletGuide.network.name', 'Network Name'), value: "TBurn Chain" },
        { label: t('publicPages.learn.walletGuide.network.rpc', 'RPC URL'), value: "https://tburn.io/rpc" },
        { label: t('publicPages.learn.walletGuide.network.chainId', 'Chain ID'), value: "6000" },
        { label: t('publicPages.learn.walletGuide.network.symbol', 'Currency Symbol'), value: "TBURN" },
        { label: t('publicPages.learn.walletGuide.network.explorer', 'Block Explorer'), value: "https://scan.tburn.io" }
      ]
    }
  };

  const config = walletConfigs[walletType] || walletConfigs.metamask;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('publicPages.learn.walletGuide.copied', 'Copied!'),
      description: `${label}: ${text}`,
    });
  };

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

  const renderWalletIcon = () => {
    if (config.icon === "metamask") {
      return (
        <div className="w-20 h-20 rounded-2xl bg-[#f6851b]/10 flex items-center justify-center border border-[#f6851b]/20">
          <Hexagon className="w-10 h-10 text-[#f6851b]" />
        </div>
      );
    }
    if (config.icon === "shield") {
      return (
        <div className="w-20 h-20 rounded-2xl bg-[#3375bb]/10 flex items-center justify-center border border-[#3375bb]/20">
          <Shield className="w-10 h-10 text-[#3375bb]" />
        </div>
      );
    }
    return (
      <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
        <Cpu className="w-10 h-10 text-gray-900 dark:text-white" />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] blur-[120px] rounded-full pointer-events-none" style={{ backgroundColor: `${config.iconColor}20` }} />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <Link href="/solutions/wallets">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              {t('publicPages.learn.walletGuide.backToWallets', 'Back to Wallets')}
            </button>
          </Link>
          
          <div className="flex items-center gap-6 mb-6">
            {renderWalletIcon()}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-wallet-name">
                {config.name} {t('publicPages.learn.walletGuide.setupGuide', 'Setup Guide')}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {config.platforms.map((platform, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-gray-600 dark:text-gray-400">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
            {config.description}
          </p>
          
          <a href={config.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-6">
            <button 
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition"
              style={{ backgroundColor: config.iconColor, color: "#fff" }}
              data-testid="button-download-wallet"
            >
              <ExternalLink className="w-4 h-4" />
              {t('publicPages.learn.walletGuide.downloadWallet', 'Download')} {config.name}
            </button>
          </a>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            {t('publicPages.learn.walletGuide.setupSteps', 'Setup Steps')}
          </h2>
          
          <div className="space-y-6">
            {config.steps.map((step, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 flex gap-6"
                data-testid={`step-${idx}`}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg"
                  style={{ backgroundColor: `${config.iconColor}20`, color: config.iconColor, border: `2px solid ${config.iconColor}40` }}
                >
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {t('publicPages.learn.walletGuide.networkConfig', 'Network Configuration')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('publicPages.learn.walletGuide.networkConfigDesc', 'Use these settings to add TBurn Chain to your wallet. Click any value to copy it.')}
          </p>
          
          <div className="spotlight-card rounded-xl p-6" style={{ borderTop: `4px solid ${config.iconColor}` }}>
            <div className="space-y-4 font-mono text-sm">
              {config.networkConfig.map((item, idx) => (
                <div 
                  key={idx}
                  className={`flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 p-2 rounded transition ${idx < config.networkConfig.length - 1 ? "border-b border-gray-300 dark:border-white/10 pb-4" : ""}`}
                  onClick={() => copyToClipboard(item.value, item.label)}
                  data-testid={`config-${idx}`}
                >
                  <span className="text-gray-500">{item.label}</span>
                  <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                    {item.value}
                    <Copy className="w-4 h-4 text-gray-500 hover:text-gray-900 dark:hover:text-white" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-xl p-8" style={{ borderLeft: `4px solid #ff0055` }}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#ff0055]" />
              {t('publicPages.learn.walletGuide.securityTips.title', 'Security Tips')}
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0 mt-0.5" />
                {t('publicPages.learn.walletGuide.securityTips.tip1', 'Never share your seed phrase or private keys with anyone.')}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0 mt-0.5" />
                {t('publicPages.learn.walletGuide.securityTips.tip2', 'Always verify the website URL before connecting your wallet.')}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0 mt-0.5" />
                {t('publicPages.learn.walletGuide.securityTips.tip3', 'Check project trust scores before interacting with dApps.')}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0 mt-0.5" />
                {t('publicPages.learn.walletGuide.securityTips.tip4', 'Enable two-factor authentication where available.')}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
