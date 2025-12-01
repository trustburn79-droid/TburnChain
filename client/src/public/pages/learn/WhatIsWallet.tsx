import { useRef, useEffect } from "react";
import { 
  Wallet, 
  Key, 
  Eye, 
  UserRound, 
  Smartphone, 
  ShieldCheck, 
  AlertTriangle,
  X,
  Check,
  Download
} from "lucide-react";

const walletTypes = [
  {
    icon: Smartphone,
    title: "Software Wallets (Hot)",
    description: "Apps or browser extensions connected to the internet. Convenient for daily transactions and connecting to dApps.",
    color: "#00f0ff",
    examples: ["MetaMask", "Trust Wallet", "Coinbase Wallet"],
  },
  {
    icon: ShieldCheck,
    title: "Hardware Wallets (Cold)",
    description: "Physical devices that keep your private keys offline. Essential for storing large amounts of assets securely.",
    color: "#7000ff",
    examples: ["Ledger Nano", "Trezor Model T", "SafePal"],
  },
];

const securityProtocols = [
  {
    type: "danger",
    title: "Never Share Your Seed Phrase",
    description: "TBurn support will NEVER ask for your private keys or seed phrase.",
  },
  {
    type: "safe",
    title: "Offline Storage",
    description: "Write your seed phrase on paper and store it in a fireproof safe. Do not save it in a cloud note or screenshot.",
  },
  {
    type: "safe",
    title: "Verify Transactions",
    description: "Always check the destination address and gas fees before signing any transaction.",
  },
];

export default function WhatIsWallet() {
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Wallet className="w-4 h-4" /> ESSENTIALS_MODULE_01
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            What is a{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              Crypto Wallet?
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Your gateway to the TBurn Chain. Securely store, send, and receive digital assets through advanced cryptographic keys.
          </p>
        </div>
      </section>

      {/* Understanding Wallets Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">Understanding Wallets</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8 text-center">
              Unlike physical wallets, crypto wallets don't store coins inside them. Instead, they store{" "}
              <span className="text-white font-bold">Keys</span> that prove your ownership on the blockchain ledger.
            </p>

            <div 
              className="spotlight-card rounded-xl p-8"
              style={{ border: "1px solid rgba(112, 0, 255, 0.3)", backgroundColor: "rgba(112, 0, 255, 0.05)" }}
              data-testid="keys-explanation-card"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7000ff] to-[#00f0ff] flex items-center justify-center text-black text-3xl shadow-lg shrink-0">
                  <Key className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Public & Private Keys</h3>
                  <p className="text-gray-400 mb-4">
                    Your wallet consists of a pair of cryptographic keys:
                  </p>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 rounded bg-black/40 border border-white/10">
                      <Eye className="w-5 h-5 text-[#00f0ff] shrink-0" />
                      <div className="text-sm">
                        <span className="text-white font-bold block">Public Key (Address)</span>
                        <span className="text-gray-500 text-xs">Like your email address. Share this to receive funds.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded bg-black/40 border border-[#ff0055]/30">
                      <UserRound className="w-5 h-5 text-[#ff0055] shrink-0" />
                      <div className="text-sm">
                        <span className="text-white font-bold block">Private Key (Seed Phrase)</span>
                        <span className="text-gray-500 text-xs">
                          Like your password. <span className="text-[#ff0055]">NEVER SHARE THIS.</span> Grants total control.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet Types Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Wallet Types</h2>
            <p className="text-gray-400">Choose the right tool for your needs.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {walletTypes.map((wallet, index) => (
              <div 
                key={index} 
                className="spotlight-card rounded-xl p-8 group h-full"
                data-testid={`wallet-type-card-${index}`}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: `${wallet.color}10`,
                    border: `1px solid ${wallet.color}30`
                  }}
                >
                  <wallet.icon className="w-7 h-7" style={{ color: wallet.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{wallet.title}</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">{wallet.description}</p>
                <ul className="text-sm text-gray-500 space-y-2 mb-6">
                  {wallet.examples.map((example, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3" style={{ color: wallet.color }} />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Protocol Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-xl p-1" data-testid="security-protocol-card">
            <div className="bg-black/60 backdrop-blur-xl rounded-lg p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8 flex-wrap">
                <div className="w-12 h-12 rounded-full bg-[#ff0055]/20 flex items-center justify-center text-[#ff0055] animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Security Protocol</h2>
              </div>
              
              <div className="space-y-4">
                {securityProtocols.map((protocol, index) => (
                  <div key={index} className="flex gap-4 items-start group">
                    <div 
                      className="mt-1 w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors"
                      style={{ 
                        backgroundColor: protocol.type === "danger" ? "rgba(255, 0, 85, 0.1)" : "rgba(0, 255, 157, 0.1)",
                        border: `1px solid ${protocol.type === "danger" ? "rgba(255, 0, 85, 0.3)" : "rgba(0, 255, 157, 0.3)"}`
                      }}
                    >
                      {protocol.type === "danger" ? (
                        <X className="w-3 h-3 text-[#ff0055]" />
                      ) : (
                        <Check className="w-3 h-3 text-[#00ff9d]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{protocol.title}</h4>
                      <p className="text-sm text-gray-400">{protocol.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
          <p className="text-gray-400 mb-8">
            To start using TBurn Chain, we recommend setting up a software wallet like MetaMask first. It's the easiest way to interact with our ecosystem.
          </p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition"
            data-testid="button-install-wallet"
          >
            <Download className="w-4 h-4" /> Install Wallet
          </a>
        </div>
      </section>
    </div>
  );
}
