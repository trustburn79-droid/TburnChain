import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Wallet,
  Code,
  AlertTriangle,
  Package,
  Lock,
  CheckCircle,
  Cpu,
  Shield,
  Hexagon
} from "lucide-react";

export default function Wallets() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const wallets = [
    {
      id: "tburn",
      name: t('publicPages.solutions.wallets.walletList.tburn.name'),
      badge: t('publicPages.solutions.wallets.recommended'),
      platform: t('publicPages.solutions.wallets.walletList.tburn.platform'),
      platformColor: "#00f0ff",
      desc: t('publicPages.solutions.wallets.walletList.tburn.description'),
      iconType: "gradient",
      buttonText: t('publicPages.solutions.wallets.walletList.tburn.button'),
      buttonStyle: "primary",
      borderColor: "border-[#7000ff]/30",
      actionType: "download",
      actionUrl: "https://chrome.google.com/webstore/category/extensions"
    },
    {
      id: "metamask",
      name: t('publicPages.solutions.wallets.walletList.metamask.name'),
      platform: t('publicPages.solutions.wallets.walletList.metamask.platform'),
      platformColor: "#f6851b",
      desc: t('publicPages.solutions.wallets.walletList.metamask.description'),
      iconType: "metamask",
      buttonText: t('publicPages.solutions.wallets.walletList.metamask.button'),
      buttonStyle: "outline",
      borderColor: "border-gray-300 dark:border-white/10",
      actionType: "guide",
      actionUrl: "/learn/wallet-guides/metamask"
    },
    {
      id: "trust",
      name: t('publicPages.solutions.wallets.walletList.trust.name'),
      platform: t('publicPages.solutions.wallets.walletList.trust.platform'),
      platformColor: "#3375bb",
      desc: t('publicPages.solutions.wallets.walletList.trust.description'),
      iconType: "shield",
      buttonText: t('publicPages.solutions.wallets.walletList.trust.button'),
      buttonStyle: "outline",
      borderColor: "border-gray-300 dark:border-white/10",
      actionType: "guide",
      actionUrl: "/learn/wallet-guides/trust"
    },
    {
      id: "ledger",
      name: t('publicPages.solutions.wallets.walletList.ledger.name'),
      platform: t('publicPages.solutions.wallets.walletList.ledger.platform'),
      platformColor: "#9ca3af",
      desc: t('publicPages.solutions.wallets.walletList.ledger.description'),
      iconType: "hardware",
      buttonText: t('publicPages.solutions.wallets.walletList.ledger.button'),
      buttonStyle: "outline",
      borderColor: "border-gray-300 dark:border-white/10",
      actionType: "guide",
      actionUrl: "/learn/wallet-guides/ledger"
    }
  ];

  const devFeatures = [
    {
      icon: Code,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.wallets.forDevelopers.trustScoreApi.title'),
      desc: t('publicPages.solutions.wallets.forDevelopers.trustScoreApi.description'),
      code: "GET /api/v8/trust-score/:address"
    },
    {
      icon: AlertTriangle,
      iconColor: "#ff0055",
      title: t('publicPages.solutions.wallets.forDevelopers.autoWarningSystem.title'),
      desc: t('publicPages.solutions.wallets.forDevelopers.autoWarningSystem.description'),
      warning: t('publicPages.solutions.wallets.forDevelopers.autoWarningSystem.warningExample')
    },
    {
      icon: Package,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.wallets.forDevelopers.walletSdk.title'),
      desc: t('publicPages.solutions.wallets.forDevelopers.walletSdk.description'),
      code: "npm install @tburn/wallet-sdk"
    }
  ];

  const networks = [
    {
      name: t('publicPages.solutions.wallets.addNetwork.mainnet.name'),
      borderColor: "#00ff9d",
      indicatorColor: "#00ff9d",
      config: [
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.networkName'), value: "TBurn Chain" },
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.rpcUrl'), value: "https://tburn.io/rpc" },
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.chainId'), value: "7777" },
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.symbol'), value: "TBURN" },
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.explorer'), value: "https://tburn.io/scan" }
      ]
    },
    {
      name: t('publicPages.solutions.wallets.addNetwork.testnet.name'),
      borderColor: "#ffd700",
      indicatorColor: "#ffd700",
      config: [
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.networkName'), value: "TBurn Testnet" },
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.rpcUrl'), value: "https://tburn.io/testnet-rpc" },
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.chainId'), value: "7778" },
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.symbol'), value: "TBURN" },
        { label: t('publicPages.solutions.wallets.addNetwork.mainnet.explorer'), value: "https://tburn.io/testnet-scan" }
      ]
    }
  ];

  const securityChecklist = [
    { title: t('publicPages.solutions.wallets.securityChecklist.seedPhrase.title'), desc: t('publicPages.solutions.wallets.securityChecklist.seedPhrase.description') },
    { title: t('publicPages.solutions.wallets.securityChecklist.verifyUrls.title'), desc: t('publicPages.solutions.wallets.securityChecklist.verifyUrls.description') },
    { title: t('publicPages.solutions.wallets.securityChecklist.checkTrustScores.title'), desc: t('publicPages.solutions.wallets.securityChecklist.checkTrustScores.description') }
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

  const renderWalletIcon = (wallet: typeof wallets[0]) => {
    if (wallet.iconType === "gradient") {
      return (
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center shadow-lg shadow-[#7000ff]/20 shrink-0">
          <span className="font-bold text-gray-900 dark:text-white text-2xl">B</span>
        </div>
      );
    }
    if (wallet.iconType === "metamask") {
      return (
        <div className="w-16 h-16 rounded-xl bg-[#f6851b]/10 flex items-center justify-center shrink-0 border border-[#f6851b]/20">
          <Hexagon className="w-10 h-10 text-[#f6851b]" />
        </div>
      );
    }
    if (wallet.iconType === "shield") {
      return (
        <div className="w-16 h-16 rounded-xl bg-[#3375bb]/10 flex items-center justify-center shrink-0 border border-[#3375bb]/20">
          <Shield className="w-8 h-8 text-[#3375bb]" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
        <Cpu className="w-8 h-8 text-gray-900 dark:text-white" />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Wallet className="w-4 h-4" /> {t('publicPages.solutions.wallets.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.wallets.title')}{" "}
            <span className="bg-gradient-to-r from-[#7000ff] to-[#00f0ff] bg-clip-text text-transparent">
              {t('publicPages.solutions.wallets.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.solutions.wallets.subtitle')}
          </p>
        </div>
      </section>

      {/* Wallet Cards Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {wallets.map((wallet, idx) => (
              <div 
                key={wallet.id}
                className={`spotlight-card rounded-2xl p-8 ${wallet.borderColor}`}
                data-testid={`card-wallet-${wallet.id}`}
              >
                <div className="flex items-start gap-6 mb-6">
                  {renderWalletIcon(wallet)}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{wallet.name}</h3>
                      {wallet.badge && (
                        <span className="px-2 py-0.5 rounded bg-[#7000ff]/20 text-[#7000ff] text-xs font-bold border border-[#7000ff]/30">
                          {wallet.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-mono" style={{ color: wallet.platformColor }}>
                      {wallet.platform}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{wallet.desc}</p>
                {wallet.actionType === "download" ? (
                  <a 
                    href={wallet.actionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <button 
                      className={`w-full py-3 rounded-lg font-bold transition ${
                        wallet.buttonStyle === "primary"
                          ? "bg-[#7000ff] text-gray-900 dark:text-white hover:bg-purple-600"
                          : "border border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5"
                      }`}
                      style={wallet.buttonStyle === "primary" ? { boxShadow: "0 0 15px rgba(112,0,255,0.3)" } : {}}
                      data-testid={`button-wallet-${wallet.id}`}
                    >
                      {wallet.buttonText}
                    </button>
                  </a>
                ) : (
                  <Link href={wallet.actionUrl}>
                    <button 
                      className={`w-full py-3 rounded-lg font-bold transition ${
                        wallet.buttonStyle === "primary"
                          ? "bg-[#7000ff] text-gray-900 dark:text-white hover:bg-purple-600"
                          : "border border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5"
                      }`}
                      style={wallet.buttonStyle === "primary" ? { boxShadow: "0 0 15px rgba(112,0,255,0.3)" } : {}}
                      data-testid={`button-wallet-${wallet.id}`}
                    >
                      {wallet.buttonText}
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Wallet Developers Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.wallets.forDevelopers.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {devFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 group"
                  data-testid={`card-dev-${idx}`}
                >
                  <Icon 
                    className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" 
                    style={{ color: feature.iconColor }}
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{feature.desc}</p>
                  {feature.code && (
                    <div 
                      className="font-mono text-sm p-3 rounded-lg overflow-x-auto"
                      style={{ 
                        background: "#0d0d12",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#a0a0a0"
                      }}
                    >
                      {feature.code}
                    </div>
                  )}
                  {feature.warning && (
                    <div 
                      className="text-xs font-mono p-2 rounded flex items-center gap-2"
                      style={{ 
                        border: "1px solid rgba(255,0,85,0.3)",
                        background: "rgba(255,0,85,0.05)",
                        color: "#ff0055"
                      }}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {feature.warning}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add Custom Network Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('publicPages.solutions.wallets.addNetwork.title')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {networks.map((network, idx) => (
              <div 
                key={network.name}
                className="spotlight-card p-8 rounded-xl"
                style={{ borderTop: `4px solid ${network.borderColor}` }}
                data-testid={`card-network-${network.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: network.indicatorColor,
                      boxShadow: `0 0 10px ${network.indicatorColor}`
                    }}
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{network.name}</h3>
                </div>
                <div className="space-y-4 text-sm font-mono">
                  {network.config.map((item, i) => (
                    <div 
                      key={item.label}
                      className={`flex justify-between ${i < network.config.length - 1 ? "border-b border-gray-300 dark:border-white/10 pb-2" : ""}`}
                    >
                      <span className="text-gray-500">{item.label}</span>
                      <span className="text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Checklist Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-3xl">
          <div 
            className="spotlight-card p-1 rounded-xl"
            style={{ 
              background: "linear-gradient(to right, rgba(255,0,85,0.2), rgba(255,100,50,0.2))",
              border: "1px solid rgba(255,0,85,0.3)"
            }}
          >
            <div className="bg-black/90 p-10 rounded-lg backdrop-blur-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-[#ff0055]" /> {t('publicPages.solutions.wallets.securityChecklist.title')}
              </h3>
              <ul className="space-y-4">
                {securityChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-[#00ff9d] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
