import { 
  ArrowLeftRight, CreditCard, Wallet, Zap, Shield, Percent,
  ArrowDown, ArrowUp, Landmark, FileText, ArrowRight, CheckCircle, Loader2, AlertCircle
} from "lucide-react";
import { SiVisa, SiMastercard, SiPaypal, SiApplepay } from "react-icons/si";
import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Ramp() {
  const { t } = useTranslation();
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<'buy' | 'sell' | null>(null);
  const { toast } = useToast();
  
  const { isConnected, address, balance, formatAddress, isCorrectNetwork, switchNetwork } = useWeb3();

  const estimatedTburn = buyAmount ? (parseFloat(buyAmount) / 0.50).toFixed(2) : "0.00";
  const estimatedUsd = sellAmount ? (parseFloat(sellAmount) * 0.50).toFixed(2) : "0.00";
  
  const handleBuy = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast({ title: t('publicPages.network.ramp.toast.error'), description: t('publicPages.network.ramp.toast.enterValidAmount'), variant: "destructive" });
      return;
    }
    
    if (!isConnected) {
      setPendingAction('buy');
      setWalletModalOpen(true);
      return;
    }
    
    setShowBuyDialog(true);
  };
  
  const handleSell = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast({ title: t('publicPages.network.ramp.toast.error'), description: t('publicPages.network.ramp.toast.enterValidAmount'), variant: "destructive" });
      return;
    }
    
    if (!isConnected) {
      setPendingAction('sell');
      setWalletModalOpen(true);
      return;
    }
    
    const userBalance = balance ? parseFloat(balance) : 0;
    if (parseFloat(sellAmount) > userBalance) {
      toast({ 
        title: t('wallet.transaction.insufficientBalance'), 
        description: t('wallet.transaction.needAmount', { amount: (parseFloat(sellAmount) - userBalance).toFixed(4), symbol: 'TBURN' }),
        variant: "destructive" 
      });
      return;
    }
    
    setShowSellDialog(true);
  };

  const handleWalletModalChange = (open: boolean) => {
    setWalletModalOpen(open);
    if (!open && isConnected && pendingAction) {
      if (pendingAction === 'buy') {
        setShowBuyDialog(true);
      } else if (pendingAction === 'sell') {
        setShowSellDialog(true);
      }
      setPendingAction(null);
    }
  };

  const handleConfirmBuy = async () => {
    if (!isCorrectNetwork) {
      const success = await switchNetwork(7979);
      if (!success) {
        toast({ title: t('wallet.wrongNetwork'), description: t('wallet.switchToTburn'), variant: "destructive" });
        return;
      }
    }
    
    setIsProcessing(true);
    toast({ 
      title: t('wallet.transaction.confirming'),
      description: t('wallet.transaction.action.transfer')
    });
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowBuyDialog(false);
      setBuyAmount("");
      toast({ 
        title: t('wallet.transaction.success'),
        description: `${estimatedTburn} TBURN ${t('wallet.transaction.action.transfer')} ${t('common.completed')}`
      });
    }, 2000);
  };

  const handleConfirmSell = async () => {
    if (!isCorrectNetwork) {
      const success = await switchNetwork(7979);
      if (!success) {
        toast({ title: t('wallet.wrongNetwork'), description: t('wallet.switchToTburn'), variant: "destructive" });
        return;
      }
    }
    
    setIsProcessing(true);
    toast({ 
      title: t('wallet.transaction.confirming'),
      description: t('wallet.transaction.action.transfer')
    });
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowSellDialog(false);
      setSellAmount("");
      toast({ 
        title: t('wallet.transaction.success'),
        description: `${sellAmount} TBURN → $${estimatedUsd} ${t('common.completed')}`
      });
    }, 2000);
  };

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <ArrowLeftRight className="w-3 h-3" /> {t('publicPages.network.ramp.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('publicPages.network.ramp.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.network.ramp.subtitle')}
          </p>
          
          {isConnected && (
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30">
              <Wallet className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('wallet.connected')}: <span className="text-[#00f0ff] font-mono">{formatAddress(address || "")}</span></span>
              {balance && (
                <span className="text-sm text-gray-900 dark:text-white font-bold">{parseFloat(balance).toFixed(4)} TBURN</span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="spotlight-card rounded-2xl p-8 border border-gray-300 dark:border-white/10 bg-gradient-to-br from-[#7000ff]/5 to-transparent">
              <div className="w-14 h-14 rounded-xl bg-[#7000ff]/10 border border-[#7000ff]/30 flex items-center justify-center mb-6 text-[#7000ff]">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.network.ramp.buy.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                {t('publicPages.network.ramp.buy.desc')}
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder={t('publicPages.network.ramp.buy.amountPlaceholder')}
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
                    data-testid="input-buy-amount"
                  />
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-4 py-3 rounded-lg w-24 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-[#00f0ff] focus:outline-none transition"
                    data-testid="select-currency"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="KRW">KRW</option>
                  </select>
                </div>
                <div className="flex justify-between text-sm text-gray-500 px-1">
                  <span>{t('publicPages.network.ramp.buy.estTburn')}: <span className="text-[#00f0ff]">{estimatedTburn}</span></span>
                  <span>{t('publicPages.network.ramp.fee')}: ~1.5%</span>
                </div>
                <button 
                  className="w-full py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition shadow-[0_0_20px_rgba(112,0,255,0.3)] flex items-center justify-center gap-2"
                  data-testid="button-buy-tburn"
                  onClick={handleBuy}
                >
                  {!isConnected && <Wallet className="w-4 h-4" />}
                  {isConnected ? t('publicPages.network.ramp.buy.button') : t('wallet.connectWallet')}
                </button>
              </div>
            </div>

            <div className="spotlight-card rounded-2xl p-8 border border-gray-300 dark:border-white/10 bg-gradient-to-br from-[#00f0ff]/5 to-transparent">
              <div className="w-14 h-14 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center mb-6 text-[#00f0ff]">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.network.ramp.sell.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                {t('publicPages.network.ramp.sell.desc')}
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder={t('publicPages.network.ramp.sell.amountPlaceholder')}
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
                    data-testid="input-sell-amount"
                  />
                  <div className="flex items-center justify-center px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400">
                    TBURN
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 px-1">
                  <span>{t('publicPages.network.ramp.sell.estUsd')}: <span className="text-[#00f0ff]">{estimatedUsd}</span></span>
                  <span>{t('publicPages.network.ramp.fee')}: ~1.0%</span>
                </div>
                <button 
                  className="w-full py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
                  data-testid="button-sell-tburn"
                  onClick={handleSell}
                >
                  {!isConnected && <Wallet className="w-4 h-4" />}
                  {isConnected ? t('publicPages.network.ramp.sell.button') : t('wallet.connectWallet')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.network.ramp.sections.whyBurnRamp')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="spotlight-card rounded-xl p-8 text-center group">
              <Zap className="w-10 h-10 text-[#ffd700] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.network.ramp.features.instantProcessing.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {t('publicPages.network.ramp.features.instantProcessing.desc')}
              </p>
            </div>

            <div className="spotlight-card rounded-xl p-8 text-center group">
              <Shield className="w-10 h-10 text-[#00ff9d] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.network.ramp.features.bankGradeSecurity.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {t('publicPages.network.ramp.features.bankGradeSecurity.desc')}
              </p>
            </div>

            <div className="spotlight-card rounded-xl p-8 text-center group">
              <Percent className="w-10 h-10 text-[#00f0ff] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.network.ramp.features.lowFees.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {t('publicPages.network.ramp.features.lowFees.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.network.ramp.sections.paymentMethods')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10">
              <h3 className="text-xl font-bold text-[#7000ff] mb-6 flex items-center gap-2">
                <ArrowDown className="w-5 h-5" /> {t('publicPages.network.ramp.payments.onRamp')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <SiVisa className="text-gray-900 dark:text-white text-xl" />
                  <SiMastercard className="text-gray-900 dark:text-white text-xl" />
                  <span>{t('publicPages.network.ramp.payments.creditDebit')}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Landmark className="w-5 h-5 text-gray-900 dark:text-white" />
                  <span>{t('publicPages.network.ramp.payments.bankTransfer')}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <SiPaypal className="text-gray-900 dark:text-white text-xl" />
                  <SiApplepay className="text-gray-900 dark:text-white text-xl" />
                  <span>{t('publicPages.network.ramp.payments.digitalWallets')}</span>
                </li>
              </ul>
            </div>

            <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10">
              <h3 className="text-xl font-bold text-[#00f0ff] mb-6 flex items-center gap-2">
                <ArrowUp className="w-5 h-5" /> {t('publicPages.network.ramp.payments.offRamp')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Landmark className="w-5 h-5 text-gray-900 dark:text-white" />
                  <span>{t('publicPages.network.ramp.payments.bankWithdrawal')}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <SiPaypal className="text-gray-900 dark:text-white text-xl" />
                  <span>{t('publicPages.network.ramp.payments.paypalWithdrawal')}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <FileText className="w-5 h-5 text-gray-900 dark:text-white" />
                  <span>{t('publicPages.network.ramp.payments.physicalCheck')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#7000ff]/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.network.ramp.sections.limitsFees')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="spotlight-card rounded-xl p-0 border border-gray-300 dark:border-white/10 overflow-hidden">
              <div className="p-6 border-b border-gray-300 dark:border-white/10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.ramp.accounts.basic.title')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('publicPages.network.ramp.accounts.basic.desc')}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.dailyLimit')}</span>
                  <span className="text-gray-900 dark:text-white font-bold">$1,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.monthlyLimit')}</span>
                  <span className="text-gray-900 dark:text-white font-bold">$10,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.buyFee')}</span>
                  <span className="text-gray-900 dark:text-white font-bold">2.0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.sellFee')}</span>
                  <span className="text-gray-900 dark:text-white font-bold">1.5%</span>
                </div>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-0 border border-[#00f0ff]/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-[#00f0ff] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">{t('publicPages.network.ramp.accounts.recommended')}</div>
              <div className="p-6 border-b border-gray-300 dark:border-white/10 bg-[#00f0ff]/5">
                <h3 className="text-xl font-bold text-[#00f0ff]">{t('publicPages.network.ramp.accounts.verified.title')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('publicPages.network.ramp.accounts.verified.desc')}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.dailyLimit')}</span>
                  <span className="text-gray-900 dark:text-white font-bold">$50,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.monthlyLimit')}</span>
                  <span className="text-gray-900 dark:text-white font-bold">$500,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.buyFee')}</span>
                  <span className="text-[#00f0ff] font-bold">1.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.sellFee')}</span>
                  <span className="text-[#00f0ff] font-bold">1.0%</span>
                </div>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-0 border border-[#7000ff]/50 overflow-hidden">
              <div className="p-6 border-b border-gray-300 dark:border-white/10 bg-[#7000ff]/5">
                <h3 className="text-xl font-bold text-[#7000ff]">{t('publicPages.network.ramp.accounts.institutional.title')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('publicPages.network.ramp.accounts.institutional.desc')}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.dailyLimit')}</span>
                  <span className="text-gray-900 dark:text-white font-bold">{t('publicPages.network.ramp.accounts.unlimited')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.monthlyLimit')}</span>
                  <span className="text-gray-900 dark:text-white font-bold">{t('publicPages.network.ramp.accounts.unlimited')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.buyFee')}</span>
                  <span className="text-[#7000ff] font-bold">0.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.accounts.sellFee')}</span>
                  <span className="text-[#7000ff] font-bold">0.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.network.ramp.sections.howItWorks')}</h2>
          
          <div className="space-y-4">
            <div className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#7000ff] text-white flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.ramp.steps.step1.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.steps.step1.desc')}</p>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#00f0ff] text-black flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.ramp.steps.step2.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.steps.step2.desc')}</p>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#00ff9d] text-black flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.ramp.steps.step3.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.steps.step3.desc')}</p>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#ffd700] text-black flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.ramp.steps.step4.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.steps.step4.desc')}</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('publicPages.network.ramp.cta.title')}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/developers/quickstart">
                <button 
                  className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  data-testid="button-start-now"
                >
                  {t('publicPages.network.ramp.cta.startNow')}
                </button>
              </Link>
              <Link href="/community/hub">
                <button 
                  className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2"
                  data-testid="button-learn-more"
                >
                  <FileText className="w-4 h-4" /> {t('publicPages.network.ramp.cta.learnMore')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <WalletConnectModal 
        open={walletModalOpen} 
        onOpenChange={handleWalletModalChange}
      />

      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('publicPages.network.ramp.buy.confirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('publicPages.network.ramp.buy.confirmDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.amount')}</span>
                <span className="text-gray-900 dark:text-white font-bold">${buyAmount} {currency}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.receive')}</span>
                <span className="text-[#00f0ff] font-bold">{estimatedTburn} TBURN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.fee')}</span>
                <span className="text-gray-900 dark:text-white">~1.5%</span>
              </div>
            </div>
            
            {!isCorrectNetwork && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('wallet.switchToTburn')}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowBuyDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button className="flex-1 bg-[#7000ff] hover:bg-purple-600" onClick={handleConfirmBuy} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('publicPages.network.ramp.sell.confirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('publicPages.network.ramp.sell.confirmDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.sell.selling')}</span>
                <span className="text-gray-900 dark:text-white font-bold">{sellAmount} TBURN</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.receive')}</span>
                <span className="text-[#00f0ff] font-bold">${estimatedUsd} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.ramp.fee')}</span>
                <span className="text-gray-900 dark:text-white">~1.0%</span>
              </div>
            </div>
            
            {!isCorrectNetwork && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('wallet.switchToTburn')}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSellDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button className="flex-1 bg-[#00f0ff] hover:bg-cyan-400 text-black" onClick={handleConfirmSell} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
