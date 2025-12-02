import { 
  ArrowLeftRight, CreditCard, Wallet, Zap, Shield, Percent,
  ArrowDown, ArrowUp, Landmark, FileText, ArrowRight
} from "lucide-react";
import { SiVisa, SiMastercard, SiPaypal, SiApplepay } from "react-icons/si";
import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Ramp() {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const { toast } = useToast();

  const estimatedTburn = buyAmount ? (parseFloat(buyAmount) / 2.5).toFixed(2) : "0.00";
  const estimatedUsd = sellAmount ? (parseFloat(sellAmount) * 2.5).toFixed(2) : "0.00";
  
  const handleBuy = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    toast({ title: "Processing", description: `Initiating purchase of ${estimatedTburn} TBURN...` });
  };
  
  const handleSell = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    toast({ title: "Processing", description: `Initiating sale of ${sellAmount} TBURN...` });
  };

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <ArrowLeftRight className="w-3 h-3" /> FIAT_CRYPTO_GATEWAY
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            TBurn Chain <span className="text-gradient">Ramp</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Buy TBURN tokens instantly with a credit card or bank account, or cash out to your bank. <br />
            Fast, secure, and compliant.
          </p>
        </div>
      </section>

      {/* Buy/Sell Cards */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* On-Ramp (Buy) */}
            <div className="spotlight-card rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-[#7000ff]/5 to-transparent">
              <div className="w-14 h-14 rounded-xl bg-[#7000ff]/10 border border-[#7000ff]/30 flex items-center justify-center mb-6 text-[#7000ff]">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Buy Tokens (On-Ramp)</h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                Purchase TBURN tokens instantly with credit card, bank transfer, or PayPal.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Amount (USD)" 
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
                    data-testid="input-buy-amount"
                  />
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-4 py-3 rounded-lg w-24 bg-white/5 border border-white/10 text-white focus:border-[#00f0ff] focus:outline-none transition"
                    data-testid="select-currency"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="KRW">KRW</option>
                  </select>
                </div>
                <div className="flex justify-between text-sm text-gray-500 px-1">
                  <span>Est. TBURN: <span className="text-[#00f0ff]">{estimatedTburn}</span></span>
                  <span>Fee: ~1.5%</span>
                </div>
                <button 
                  className="w-full py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition shadow-[0_0_20px_rgba(112,0,255,0.3)]"
                  data-testid="button-buy-tburn"
                  onClick={handleBuy}
                >
                  Buy TBURN
                </button>
              </div>
            </div>

            {/* Off-Ramp (Sell) */}
            <div className="spotlight-card rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-[#00f0ff]/5 to-transparent">
              <div className="w-14 h-14 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center mb-6 text-[#00f0ff]">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Cash Out (Off-Ramp)</h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                Cash out your TBURN tokens instantly to your bank account or PayPal.
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Amount (TBURN)" 
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
                    data-testid="input-sell-amount"
                  />
                  <div className="flex items-center justify-center px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-400">
                    TBURN
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 px-1">
                  <span>Est. USD: <span className="text-[#00f0ff]">{estimatedUsd}</span></span>
                  <span>Fee: ~1.0%</span>
                </div>
                <button 
                  className="w-full py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  data-testid="button-sell-tburn"
                  onClick={handleSell}
                >
                  Sell TBURN
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BurnRamp? */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why BurnRamp?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="spotlight-card rounded-xl p-8 text-center group">
              <Zap className="w-10 h-10 text-[#ffd700] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Instant Processing</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Buy/sell requests are processed within 2 minutes on average. Trade immediately without waiting.
              </p>
            </div>

            <div className="spotlight-card rounded-xl p-8 text-center group">
              <Shield className="w-10 h-10 text-[#00ff9d] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Bank-Grade Security</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Protect your funds with 2FA, biometric authentication, and SSL encryption. Regulated compliance.
              </p>
            </div>

            <div className="spotlight-card rounded-xl p-8 text-center group">
              <Percent className="w-10 h-10 text-[#00f0ff] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Low Fees</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Buy 1.5%, Sell 1.0% - Get more tokens with industry-leading low fees compared to competitors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Payment Methods */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Supported Payment Methods</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-[#7000ff] mb-6 flex items-center gap-2">
                <ArrowDown className="w-5 h-5" /> On-Ramp (Buy)
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <SiVisa className="text-white text-xl" />
                  <SiMastercard className="text-white text-xl" />
                  <span>Credit/Debit Cards (Visa, Mastercard)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Landmark className="w-5 h-5 text-white" />
                  <span>Bank Transfer (ACH, SEPA, KRW)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <SiPaypal className="text-white text-xl" />
                  <SiApplepay className="text-white text-xl" />
                  <span>PayPal, Apple Pay, Google Pay</span>
                </li>
              </ul>
            </div>

            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-[#00f0ff] mb-6 flex items-center gap-2">
                <ArrowUp className="w-5 h-5" /> Off-Ramp (Sell)
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <Landmark className="w-5 h-5 text-white" />
                  <span>Bank Transfer (USD, EUR, KRW, JPY)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <SiPaypal className="text-white text-xl" />
                  <span>PayPal Withdrawal</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FileText className="w-5 h-5 text-white" />
                  <span>Physical Check (US Only)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Limits & Fees */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#7000ff]/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Limits & Fees</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Account */}
            <div className="spotlight-card rounded-xl p-0 border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Basic Account</h3>
                <p className="text-xs text-gray-500 mt-1">Email verification only</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Daily Limit</span>
                  <span className="text-white font-bold">$1,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Limit</span>
                  <span className="text-white font-bold">$10,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Buy Fee</span>
                  <span className="text-white font-bold">2.0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sell Fee</span>
                  <span className="text-white font-bold">1.5%</span>
                </div>
              </div>
            </div>

            {/* Verified Account */}
            <div className="spotlight-card rounded-xl p-0 border border-[#00f0ff]/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-[#00f0ff] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
              <div className="p-6 border-b border-white/10 bg-[#00f0ff]/5">
                <h3 className="text-xl font-bold text-[#00f0ff]">Verified Account</h3>
                <p className="text-xs text-gray-500 mt-1">KYC identity verification required</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Daily Limit</span>
                  <span className="text-white font-bold">$50,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Limit</span>
                  <span className="text-white font-bold">$500,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Buy Fee</span>
                  <span className="text-[#00f0ff] font-bold">1.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sell Fee</span>
                  <span className="text-[#00f0ff] font-bold">1.0%</span>
                </div>
              </div>
            </div>

            {/* Institutional */}
            <div className="spotlight-card rounded-xl p-0 border border-[#7000ff]/50 overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-[#7000ff]/5">
                <h3 className="text-xl font-bold text-[#7000ff]">Institutional</h3>
                <p className="text-xs text-gray-500 mt-1">Contract required</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Daily Limit</span>
                  <span className="text-white font-bold">Unlimited</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Limit</span>
                  <span className="text-white font-bold">Unlimited</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Buy Fee</span>
                  <span className="text-[#7000ff] font-bold">0.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sell Fee</span>
                  <span className="text-[#7000ff] font-bold">0.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h2>
          
          <div className="space-y-4">
            <div className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#7000ff] text-white flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">1</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Create & Verify Account</h3>
                <p className="text-gray-400">Sign up with email and complete identity verification (KYC) for higher limits. Approved within 5 minutes.</p>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#00f0ff] text-black flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">2</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
                <p className="text-gray-400">Connect a TBurn Chain compatible wallet (MetaMask, Phantom, Ledger, etc).</p>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#00ff9d] text-black flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">3</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Execute Transaction</h3>
                <p className="text-gray-400">Enter the amount of TBURN to buy or cash out, select payment method, and confirm.</p>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#ffd700] text-black flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">4</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Instant Completion</h3>
                <p className="text-gray-400">TBURN tokens sent to wallet or cash deposited to bank account within 2 minutes.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Get Started Now</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <button 
                  className="px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition shadow-[0_0_20px_rgba(112,0,255,0.3)] flex items-center gap-2"
                  data-testid="button-create-account"
                >
                  Create Account <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/community/hub">
                <button 
                  className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                  data-testid="button-contact-support"
                >
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
