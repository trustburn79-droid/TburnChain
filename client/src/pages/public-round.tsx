import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectionModal, useWalletModal } from "@/components/WalletConnectionModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LanguageSelector } from "@/components/LanguageSelector";

interface InvestmentRound {
  name: string;
  status: string;
  allocation: string;
  price: string;
  raised: string;
  investors: number;
  vesting: string;
  unlocked: string;
}

interface InvestmentRoundsStatsData {
  rounds: InvestmentRound[];
  totalRaised: string;
  totalInvestors: number;
  nextUnlock: string;
}

interface InvestmentRoundsStatsResponse {
  success: boolean;
  data: InvestmentRoundsStatsData;
}

export default function PublicRoundPage() {
  const { t } = useTranslation();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [investAmount, setInvestAmount] = useState(1000);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    investmentAmount: "",
    message: ""
  });
  const { isConnected, address, disconnect, formatAddress } = useWeb3();
  const { isOpen: walletModalOpen, setIsOpen: setWalletModalOpen, openModal: openWalletModal } = useWalletModal();
  const { toast } = useToast();

  const { data: response, isLoading } = useQuery<InvestmentRoundsStatsResponse>({
    queryKey: ['/api/token-programs/investment-rounds/stats'],
  });
  const stats = response?.data;

  const publicRound = stats?.rounds?.find(r => r.name.toLowerCase().includes('public'));

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/investment-inquiry", {
        ...data,
        investmentRound: "public"
      });
    },
    onSuccess: () => {
      toast({
        title: t('tokenPrograms.publicRound.dialog.successTitle'),
        description: t('tokenPrograms.publicRound.dialog.successDesc'),
      });
      setInquiryDialogOpen(false);
      setFormData({ name: "", email: "", company: "", investmentAmount: "", message: "" });
    },
    onError: (error: Error) => {
      toast({
        title: t('tokenPrograms.publicRound.dialog.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        title: t('tokenPrograms.publicRound.dialog.requiredTitle'),
        description: t('tokenPrograms.publicRound.dialog.requiredDesc'),
        variant: "destructive",
      });
      return;
    }
    inquiryMutation.mutate(formData);
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      openWalletModal();
    }
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const investmentHighlights = [
    { value: "$0.20", label: t('tokenPrograms.publicRound.highlights.tokenPrice'), compare: "" },
    { value: "60%", label: t('tokenPrograms.publicRound.highlights.discount'), compare: "" },
    { value: "10%", label: t('tokenPrograms.publicRound.highlights.tgeUnlock'), compare: "" },
    { value: "$100", label: t('tokenPrograms.publicRound.highlights.minAmount'), compare: "" },
  ];

  const distributions = [
    { id: "seed", name: t('tokenPrograms.publicRound.comparison.seedRound'), amount: "$0.04", discount: "80%", status: "completed" },
    { id: "private", name: t('tokenPrograms.publicRound.comparison.privateRound'), amount: "$0.10", discount: "50%", status: "completed" },
    { id: "public", name: t('tokenPrograms.publicRound.comparison.publicRound'), amount: "$0.20", discount: "60%", status: "current" },
  ];

  const participationTiers = [
    { id: "whale", icon: "🐋", name: t('tokenPrograms.publicRound.tiers.whale.name'), subtitle: t('tokenPrograms.publicRound.tiers.whale.subtitle'), amount: "$50K+", details: [{ label: (t('tokenPrograms.publicRound.tiers.whale.details', { returnObjects: true }) as string[])[0], value: "$50,000" }, { label: (t('tokenPrograms.publicRound.tiers.whale.details', { returnObjects: true }) as string[])[1], value: "+5%" }, { label: (t('tokenPrograms.publicRound.tiers.whale.details', { returnObjects: true }) as string[])[2], value: "15%" }], benefits: t('tokenPrograms.publicRound.tiers.whale.benefits', { returnObjects: true }) as string[] },
    { id: "dolphin", icon: "🐬", name: t('tokenPrograms.publicRound.tiers.dolphin.name'), subtitle: t('tokenPrograms.publicRound.tiers.dolphin.subtitle'), amount: "$10K+", details: [{ label: (t('tokenPrograms.publicRound.tiers.dolphin.details', { returnObjects: true }) as string[])[0], value: "$10,000" }, { label: (t('tokenPrograms.publicRound.tiers.dolphin.details', { returnObjects: true }) as string[])[1], value: "+3%" }, { label: (t('tokenPrograms.publicRound.tiers.dolphin.details', { returnObjects: true }) as string[])[2], value: "12%" }], benefits: t('tokenPrograms.publicRound.tiers.dolphin.benefits', { returnObjects: true }) as string[] },
    { id: "fish", icon: "🐟", name: t('tokenPrograms.publicRound.tiers.fish.name'), subtitle: t('tokenPrograms.publicRound.tiers.fish.subtitle'), amount: "$1K+", details: [{ label: (t('tokenPrograms.publicRound.tiers.fish.details', { returnObjects: true }) as string[])[0], value: "$1,000" }, { label: (t('tokenPrograms.publicRound.tiers.fish.details', { returnObjects: true }) as string[])[1], value: "+1%" }, { label: (t('tokenPrograms.publicRound.tiers.fish.details', { returnObjects: true }) as string[])[2], value: "10%" }], benefits: t('tokenPrograms.publicRound.tiers.fish.benefits', { returnObjects: true }) as string[] },
    { id: "shrimp", icon: "🦐", name: t('tokenPrograms.publicRound.tiers.shrimp.name'), subtitle: t('tokenPrograms.publicRound.tiers.shrimp.subtitle'), amount: "$100+", details: [{ label: (t('tokenPrograms.publicRound.tiers.shrimp.details', { returnObjects: true }) as string[])[0], value: "$100" }, { label: (t('tokenPrograms.publicRound.tiers.shrimp.details', { returnObjects: true }) as string[])[1], value: "-" }, { label: (t('tokenPrograms.publicRound.tiers.shrimp.details', { returnObjects: true }) as string[])[2], value: "10%" }], benefits: t('tokenPrograms.publicRound.tiers.shrimp.benefits', { returnObjects: true }) as string[] },
  ];

  const vestingPhasesData = t('tokenPrograms.publicRound.vesting.phases', { returnObjects: true }) as Array<{title: string, value: string, desc: string}>;
  const vestingPhases = [
    { icon: "🎉", title: vestingPhasesData[0]?.title || "TGE Unlock", value: vestingPhasesData[0]?.value || "10%", desc: vestingPhasesData[0]?.desc || "Immediate" },
    { icon: "⏳", title: vestingPhasesData[1]?.title || "Cliff", value: vestingPhasesData[1]?.value || "3 Months", desc: vestingPhasesData[1]?.desc || "Lock Period" },
    { icon: "📈", title: vestingPhasesData[2]?.title || "Monthly Vesting", value: vestingPhasesData[2]?.value || "15%", desc: vestingPhasesData[2]?.desc || "Over 6 Months" },
    { icon: "✅", title: vestingPhasesData[3]?.title || "Full Unlock", value: vestingPhasesData[3]?.value || "100%", desc: vestingPhasesData[3]?.desc || "After 9 Months" },
  ];

  const stepsData = t('tokenPrograms.publicRound.howTo.steps', { returnObjects: true }) as Array<{title: string, desc: string}>;
  const participateSteps = [
    { step: 1, icon: "👛", title: stepsData[0]?.title || "Connect Wallet", desc: stepsData[0]?.desc || "MetaMask, Trust, etc." },
    { step: 2, icon: "✅", title: stepsData[1]?.title || "KYC Verification", desc: stepsData[1]?.desc || "Simple identity check" },
    { step: 3, icon: "💳", title: stepsData[2]?.title || "Select Payment", desc: stepsData[2]?.desc || "USDT, USDC, ETH, BTC" },
    { step: 4, icon: "🎉", title: stepsData[3]?.title || "Receive Tokens", desc: stepsData[3]?.desc || "15% at TGE" },
  ];

  const platformsData = t('tokenPrograms.publicRound.platforms.items', { returnObjects: true }) as Array<{name: string, type: string, desc: string, features: string[]}>;
  const platforms = [
    { icon: "🌐", name: platformsData[0]?.name || "TBURN Launchpad", type: platformsData[0]?.type || "Official Launchpad", desc: platformsData[0]?.desc || "TBURN official sale platform", features: platformsData[0]?.features || ["Lowest fees", "Direct participation", "24/7 support", "Multi-payment support"] },
    { icon: "🏛️", name: platformsData[1]?.name || "Partner Exchanges", type: platformsData[1]?.type || "CEX IEO", desc: platformsData[1]?.desc || "Participate via partner exchanges", features: platformsData[1]?.features || ["Easy KYC", "Fiat support", "Exchange guarantee", "Instant listing"] },
    { icon: "🦄", name: platformsData[2]?.name || "DEX Launchpad", type: platformsData[2]?.type || "Decentralized IDO", desc: platformsData[2]?.desc || "Participate on decentralized platforms", features: platformsData[2]?.features || ["Direct wallet connection", "Smart contract", "Transparent distribution", "Community-driven"] },
  ];

  const quickAmounts = [100, 500, 1000, 5000, 10000];
  const tokenPrice = 0.20;
  const tokensReceived = investAmount / tokenPrice;
  const listingPrice = 0.50;
  const potentialValue = tokensReceived * listingPrice;
  const potentialProfit = potentialValue - investAmount;

  return (
    <div className="public-round-page">
      <style>{`
        .public-round-page {
          --navy: #1A365D;
          --gold: #D4AF37;
          --dark: #0F172A;
          --dark-card: #1E293B;
          --gray: #64748B;
          --light-gray: #94A3B8;
          --white: #FFFFFF;
          --success: #22C55E;
          --warning: #F59E0B;
          --danger: #EF4444;
          --purple: #8B5CF6;
          --blue: #3B82F6;
          --cyan: #06B6D4;
          --emerald: #10B981;
          --indigo: #6366F1;
          --violet: #7C3AED;
          --sky: #0EA5E9;
          --public-primary: #3B82F6;
          --public-secondary: #2563EB;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-public: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes rocket { 0%, 100% { transform: translateY(0) rotate(-45deg); } 50% { transform: translateY(-10px) rotate(-45deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); } }
        @keyframes progressFill { 0% { width: 0%; } 100% { width: 45%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes countdown { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

        .public-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text { font-size: 1.5rem; font-weight: 800; color: var(--white); }
        .logo-text span { color: var(--gold); }

        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--light-gray); text-decoration: none; font-weight: 500; transition: color 0.3s; }
        .nav-links a:hover { color: var(--public-primary); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-public);
          color: var(--white);
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
                      var(--gradient-dark);
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .hero-bg::before {
          content: '';
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          top: -300px;
          right: -200px;
          animation: float 10s ease-in-out infinite;
        }

        .hero-content {
          max-width: 1200px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--public-primary);
          margin-bottom: 2rem;
        }

        .badge .rocket-icon { animation: rocket 2s ease-in-out infinite; display: inline-block; }

        .round-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--success);
          margin-left: 10px;
        }

        .round-status .dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-public);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--light-gray);
          max-width: 750px;
          margin: 0 auto 2rem;
        }

        .countdown-container {
          background: var(--dark-card);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .countdown-label {
          font-size: 0.9rem;
          color: var(--public-primary);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .countdown-timer {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }

        .countdown-item { text-align: center; }

        .countdown-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--white);
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          padding: 0.5rem 1rem;
          min-width: 80px;
          animation: countdown 2s ease-in-out infinite;
        }

        .countdown-unit { font-size: 0.75rem; color: var(--gray); margin-top: 0.5rem; }

        .fundraise-progress {
          background: var(--dark-card);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header .raised { font-size: 1.5rem; font-weight: 800; color: var(--public-primary); }
        .progress-header .goal { font-size: 1rem; color: var(--gray); }

        .progress-bar {
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-public);
          border-radius: 100px;
          width: 45%;
          position: relative;
          animation: progressFill 2s ease-out;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .progress-stats .percent { color: var(--public-primary); font-weight: 700; }
        .progress-stats .remaining { color: var(--gray); }

        .investment-highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .highlight-card {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .highlight-card .value { font-size: 1.75rem; font-weight: 800; color: var(--public-primary); margin-bottom: 0.25rem; }
        .highlight-card .label { font-size: 0.85rem; color: var(--light-gray); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.3s, border-color 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--public-primary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-public);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-public);
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          animation: glow 2s ease-in-out infinite;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary {
          background: transparent;
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 600;
          border: 2px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover { border-color: var(--public-primary); color: var(--public-primary); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(59, 130, 246, 0.15);
          color: var(--public-primary);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
        .section-subtitle { color: var(--light-gray); font-size: 1.125rem; max-width: 600px; margin: 0 auto; }

        .round-comparison {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .comparison-header {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-header h3 { font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }

        .comparison-table { width: 100%; border-collapse: collapse; }

        .comparison-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .comparison-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .comparison-table tr:hover td { background: rgba(255, 255, 255, 0.02); }
        .comparison-table tr.highlight td { background: rgba(59, 130, 246, 0.1); }

        .round-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .round-badge.seed { background: rgba(34, 197, 94, 0.2); color: var(--success); }
        .round-badge.private { background: rgba(139, 92, 246, 0.2); color: var(--purple); }
        .round-badge.public { background: rgba(59, 130, 246, 0.2); color: var(--public-primary); }
        .round-badge.current { animation: glow 2s ease-in-out infinite; }

        .best-badge {
          background: rgba(34, 197, 94, 0.2);
          color: var(--success);
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-left: 8px;
        }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .tier-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .tier-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .tier-card.whale { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.dolphin { border-color: var(--public-primary); }
        .tier-card.fish { border-color: var(--cyan); }
        .tier-card.shrimp { border-color: var(--emerald); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.whale .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.dolphin .tier-header { background: linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%); }
        .tier-card.fish .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }
        .tier-card.shrimp .tier-header { background: linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.whale .tier-name { color: var(--gold); }
        .tier-card.dolphin .tier-name { color: var(--public-primary); }
        .tier-card.fish .tier-name { color: var(--cyan); }
        .tier-card.shrimp .tier-name { color: var(--emerald); }

        .tier-subtitle { font-size: 0.8rem; color: var(--gray); }

        .tier-content { padding: 1.5rem; }

        .tier-amount {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .tier-amount .label { font-size: 0.75rem; color: var(--gray); margin-bottom: 0.25rem; }
        .tier-amount .value { font-size: 1.5rem; font-weight: 800; }

        .tier-card.whale .tier-amount .value { color: var(--gold); }
        .tier-card.dolphin .tier-amount .value { color: var(--public-primary); }
        .tier-card.fish .tier-amount .value { color: var(--cyan); }
        .tier-card.shrimp .tier-amount .value { color: var(--emerald); }

        .tier-details { margin-bottom: 1rem; }

        .tier-detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-detail-item:last-child { border-bottom: none; }
        .tier-detail-item .label { color: var(--gray); }
        .tier-detail-item .value { color: var(--white); font-weight: 600; }

        .tier-benefits { list-style: none; margin-bottom: 1rem; padding: 0; }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 0.8rem;
          color: var(--light-gray);
        }

        .tier-benefits li::before { content: '✓'; color: var(--success); font-size: 10px; }

        .tier-btn {
          display: block;
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .tier-card.whale .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.dolphin .tier-btn { background: var(--gradient-public); color: var(--white); }
        .tier-card.fish .tier-btn { background: linear-gradient(135deg, var(--cyan), var(--blue)); color: var(--white); }
        .tier-card.shrimp .tier-btn { background: linear-gradient(135deg, var(--emerald), var(--cyan)); color: var(--white); }

        .tier-btn:hover { transform: scale(1.02); }

        .vesting-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .vesting-visual {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .vesting-phase {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          position: relative;
        }

        .vesting-phase::after {
          content: '→';
          position: absolute;
          right: -1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
          font-size: 1.25rem;
        }

        .vesting-phase:last-child::after { display: none; }

        .vesting-phase .icon { font-size: 2rem; margin-bottom: 0.75rem; }
        .vesting-phase .title { font-weight: 700; margin-bottom: 0.25rem; }
        .vesting-phase .value { font-size: 1.5rem; font-weight: 800; color: var(--public-primary); margin-bottom: 0.25rem; }
        .vesting-phase .desc { font-size: 0.8rem; color: var(--gray); }

        .participate-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .participate-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          position: relative;
          transition: all 0.3s;
        }

        .participate-card:hover {
          border-color: var(--public-primary);
          transform: translateY(-5px);
        }

        .participate-step {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: var(--gradient-public);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.125rem;
        }

        .participate-icon { font-size: 2.5rem; margin: 1rem 0; }

        .participate-card h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; }
        .participate-card p { font-size: 0.85rem; color: var(--light-gray); }

        .platforms-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .platform-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .platform-card:hover {
          border-color: var(--public-primary);
          transform: translateY(-5px);
        }

        .platform-logo {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .platform-card:nth-child(1) .platform-logo { background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2)); }
        .platform-card:nth-child(2) .platform-logo { background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(245, 158, 11, 0.2)); }
        .platform-card:nth-child(3) .platform-logo { background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.2)); }

        .platform-card h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .platform-card .type { font-size: 0.85rem; color: var(--public-primary); margin-bottom: 1rem; }
        .platform-card p { font-size: 0.9rem; color: var(--light-gray); margin-bottom: 1.5rem; }

        .platform-features { list-style: none; text-align: left; margin-bottom: 1.5rem; padding: 0; }

        .platform-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 0.85rem;
          color: var(--light-gray);
        }

        .platform-features li::before { content: '✓'; color: var(--success); }

        .platform-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .platform-card:nth-child(1) .platform-btn { background: var(--gradient-public); color: var(--white); }
        .platform-card:nth-child(2) .platform-btn { background: var(--gradient-gold); color: var(--dark); }
        .platform-card:nth-child(3) .platform-btn { background: linear-gradient(135deg, var(--purple), var(--violet)); color: var(--white); }

        .platform-btn:hover { transform: scale(1.02); }

        .calculator-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .calculator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .calculator-input {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 2rem;
        }

        .calculator-input h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input-group { margin-bottom: 1.5rem; }

        .input-group label {
          display: block;
          font-size: 0.85rem;
          color: var(--gray);
          margin-bottom: 0.5rem;
        }

        .input-group input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .input-group input:focus { outline: none; border-color: var(--public-primary); }

        .quick-amounts { display: flex; gap: 0.5rem; flex-wrap: wrap; }

        .quick-amount {
          padding: 8px 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 100px;
          color: var(--public-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .quick-amount:hover { background: var(--public-primary); color: var(--white); }

        .calculator-result {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 2rem;
        }

        .calculator-result h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .result-item:last-child { margin-bottom: 0; }
        .result-item .label { color: var(--gray); }
        .result-item .value { font-weight: 700; }
        .result-item .value.highlight { color: var(--public-primary); font-size: 1.25rem; }
        .result-item .value.gold { color: var(--gold); }

        .faq-container { max-width: 900px; margin: 0 auto; }

        .faq-item {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .faq-question {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.3s;
        }

        .faq-question:hover { background: rgba(255, 255, 255, 0.03); }
        .faq-question h4 { font-size: 1.1rem; font-weight: 600; }

        .faq-chevron { color: var(--public-primary); transition: transform 0.3s; }
        .faq-item.active .faq-chevron { transform: rotate(180deg); }

        .faq-answer {
          padding: 0 1.5rem;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item.active .faq-answer {
          padding: 0 1.5rem 1.5rem;
          max-height: 500px;
        }

        .faq-answer p { color: var(--light-gray); line-height: 1.8; }

        .cta-section {
          padding: 100px 2rem;
          background: var(--gradient-public);
          text-align: center;
        }

        .footer {
          background: var(--dark);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 60px 2rem 30px;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .footer-brand h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .footer-brand h3 span { color: var(--gold); }
        .footer-brand p { color: var(--light-gray); margin-bottom: 1.5rem; }

        .social-links { display: flex; gap: 1rem; }

        .social-links a {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--light-gray);
          transition: all 0.3s;
        }

        .social-links a:hover { background: var(--public-primary); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--public-primary); }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--gray);
          font-size: 0.875rem;
        }

        @media (max-width: 1200px) {
          .tiers-grid, .participate-grid { grid-template-columns: repeat(2, 1fr); }
          .platforms-grid { grid-template-columns: 1fr; }
          .calculator-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid, .investment-highlights { grid-template-columns: repeat(2, 1fr); }
          .vesting-visual { grid-template-columns: repeat(2, 1fr); }
          .vesting-phase::after { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
          .countdown-timer { flex-wrap: wrap; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .investment-highlights, .tiers-grid, .participate-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="public-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#tiers">{t('tokenPrograms.publicRound.nav.tiers')}</a>
            <a href="#vesting">{t('tokenPrograms.publicRound.nav.vesting')}</a>
            <a href="#how">{t('tokenPrograms.publicRound.nav.howTo')}</a>
            <a href="#calculator">{t('tokenPrograms.publicRound.nav.calculator')}</a>
            <a href="#faq">{t('tokenPrograms.publicRound.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              onClick={handleWalletClick}
              data-testid="button-connect-wallet"
            >
              {isConnected ? formatAddress(address!) : t('tokenPrograms.publicRound.nav.connectWallet')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="rocket-icon">🚀</span> {t('tokenPrograms.publicRound.hero.badge')}
            <span className="round-status"><span className="dot"></span> {t('tokenPrograms.publicRound.hero.status')}</span>
          </div>
          <h1>
            {t('tokenPrograms.publicRound.hero.title1')}<br />
            <span className="gradient-text">{t('tokenPrograms.publicRound.hero.title2')}</span> {t('tokenPrograms.publicRound.hero.title3')}
          </h1>
          <p className="hero-subtitle">
            {t('tokenPrograms.publicRound.hero.subtitle')}
          </p>

          <div className="countdown-container" data-testid="countdown-timer">
            <div className="countdown-label">🔥 {t('tokenPrograms.publicRound.hero.countdownLabel')}</div>
            <div className="countdown-timer">
              <div className="countdown-item">
                <div className="countdown-value">21</div>
                <div className="countdown-unit">{t('tokenPrograms.publicRound.hero.days')}</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">14</div>
                <div className="countdown-unit">{t('tokenPrograms.publicRound.hero.hours')}</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">45</div>
                <div className="countdown-unit">{t('tokenPrograms.publicRound.hero.mins')}</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">30</div>
                <div className="countdown-unit">{t('tokenPrograms.publicRound.hero.secs')}</div>
              </div>
            </div>
          </div>

          <div className="fundraise-progress" data-testid="fundraise-progress">
            <div className="progress-header">
              <span className="raised">$89,750,000</span>
              <span className="goal">{t('tokenPrograms.publicRound.hero.progressGoal')}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-stats">
              <span className="percent">{t('tokenPrograms.publicRound.hero.progressPercent')}</span>
              <span className="remaining">{t('tokenPrograms.publicRound.hero.progressRemaining')}</span>
            </div>
          </div>

          <div className="investment-highlights" data-testid="investment-highlights">
            {investmentHighlights.map((item, idx) => (
              <div key={idx} className="highlight-card">
                <div className="value">{item.value}</div>
                <div className="label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="stats-grid">
            {isLoading ? (
              <div className="stat-card" data-testid="loading-indicator">
                <div className="stat-value" style={{ opacity: 0.5 }}>{t('tokenPrograms.publicRound.stats.loading')}</div>
              </div>
            ) : (
              <>
                <div className="stat-card" data-testid="stat-total-public">
                  <div className="stat-value">{publicRound?.allocation || "1B"}</div>
                  <div className="stat-label">{t('tokenPrograms.publicRound.stats.publicAllocation')}</div>
                </div>
                <div className="stat-card" data-testid="stat-price">
                  <div className="stat-value">{publicRound?.price || "$0.20"}</div>
                  <div className="stat-label">{t('tokenPrograms.publicRound.stats.tokenPrice')}</div>
                </div>
                <div className="stat-card" data-testid="stat-hardcap">
                  <div className="stat-value">{publicRound?.raised || "$200M"}</div>
                  <div className="stat-label">{t('tokenPrograms.publicRound.stats.hardcap')}</div>
                </div>
                <div className="stat-card" data-testid="stat-participants">
                  <div className="stat-value">{publicRound?.investors || 12500}+</div>
                  <div className="stat-label">{t('tokenPrograms.publicRound.stats.participants')}</div>
                </div>
              </>
            )}
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-apply-public" onClick={() => setInquiryDialogOpen(true)}>
              🚀 {t('tokenPrograms.publicRound.cta.joinNow')}
            </button>
            <button className="btn-secondary" onClick={() => window.open('/learn/whitepaper', '_blank')}>
              📖 {t('tokenPrograms.publicRound.cta.viewGuide')}
            </button>
          </div>
        </div>
      </section>

      {/* Round Comparison Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.publicRound.comparison.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.publicRound.comparison.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.publicRound.comparison.subtitle')}</p>
        </div>

        <div className="round-comparison">
          <div className="comparison-header">
            <h3>📊 {t('tokenPrograms.publicRound.comparison.tableTitle')}</h3>
          </div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>{t('tokenPrograms.publicRound.comparison.headers.round')}</th>
                <th>{t('tokenPrograms.publicRound.comparison.headers.tokenPrice')}</th>
                <th>{t('tokenPrograms.publicRound.comparison.headers.discount')}</th>
                <th>{t('tokenPrograms.publicRound.comparison.headers.status')}</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map(round => (
                <tr key={round.id} className={round.status === 'current' ? 'highlight' : ''}>
                  <td>
                    <span className={`round-badge ${round.id} ${round.status === 'current' ? 'current' : ''}`}>
                      {round.id === 'public' ? '🚀' : '🔐'} {round.name}
                    </span>
                  </td>
                  <td>{round.amount}</td>
                  <td>
                    {round.discount}
                    {round.status === 'current' && <span className="best-badge">{t('tokenPrograms.publicRound.comparison.bestBadge')}</span>}
                  </td>
                  <td>
                    {round.status === 'completed' ? `✅ ${t('tokenPrograms.publicRound.comparison.completed')}` : 
                     round.status === 'current' ? `🚀 ${t('tokenPrograms.publicRound.comparison.live')}` : `⏳ ${t('tokenPrograms.publicRound.comparison.upcoming')}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Participation Tiers Section */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.publicRound.tiers.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.publicRound.tiers.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.publicRound.tiers.subtitle')}</p>
        </div>

        <div className="tiers-grid">
          {participationTiers.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.id}`} data-testid={`tier-${tier.id}`}>
              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-subtitle">{tier.subtitle}</p>
              </div>
              <div className="tier-content">
                <div className="tier-amount">
                  <div className="label">{t('tokenPrograms.publicRound.tiers.minAmountLabel')}</div>
                  <div className="value">{tier.amount}</div>
                </div>
                <div className="tier-details">
                  {tier.details.map((detail, idx) => (
                    <div key={idx} className="tier-detail-item">
                      <span className="label">{detail.label}</span>
                      <span className="value">{detail.value}</span>
                    </div>
                  ))}
                </div>
                <ul className="tier-benefits">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <button className="tier-btn" onClick={() => setInquiryDialogOpen(true)}>{t('tokenPrograms.publicRound.tiers.joinBtn')}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vesting Section */}
      <section className="section" id="vesting">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.publicRound.vesting.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.publicRound.vesting.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.publicRound.vesting.subtitle')}</p>
        </div>

        <div className="vesting-container">
          <div className="vesting-visual">
            {vestingPhases.map((phase, idx) => (
              <div key={idx} className="vesting-phase">
                <div className="icon">{phase.icon}</div>
                <div className="title">{phase.title}</div>
                <div className="value">{phase.value}</div>
                <div className="desc">{phase.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Participate Section */}
      <section className="section" id="how" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.publicRound.howTo.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.publicRound.howTo.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.publicRound.howTo.subtitle')}</p>
        </div>

        <div className="participate-grid">
          {participateSteps.map(step => (
            <div key={step.step} className="participate-card">
              <div className="participate-step">{step.step}</div>
              <div className="participate-icon">{step.icon}</div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.publicRound.platforms.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.publicRound.platforms.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.publicRound.platforms.subtitle')}</p>
        </div>

        <div className="platforms-grid">
          {platforms.map((platform, idx) => (
            <div key={idx} className="platform-card">
              <div className="platform-logo">{platform.icon}</div>
              <h4>{platform.name}</h4>
              <div className="type">{platform.type}</div>
              <p>{platform.desc}</p>
              <ul className="platform-features">
                {platform.features.map((feature, fidx) => (
                  <li key={fidx}>{feature}</li>
                ))}
              </ul>
              <button className="platform-btn" onClick={() => setInquiryDialogOpen(true)}>{t('tokenPrograms.publicRound.platforms.joinBtn')}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator Section */}
      <section className="section" id="calculator" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.publicRound.calculator.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.publicRound.calculator.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.publicRound.calculator.subtitle')}</p>
        </div>

        <div className="calculator-container">
          <div className="calculator-grid">
            <div className="calculator-input">
              <h4>💵 {t('tokenPrograms.publicRound.calculator.inputTitle')}</h4>
              <div className="input-group">
                <label>{t('tokenPrograms.publicRound.calculator.inputLabel')}</label>
                <input 
                  type="number" 
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value) || 0)}
                  placeholder={t('tokenPrograms.publicRound.calculator.inputPlaceholder')}
                  data-testid="input-invest-amount"
                />
              </div>
              <div className="quick-amounts">
                {quickAmounts.map(amount => (
                  <span 
                    key={amount} 
                    className="quick-amount"
                    onClick={() => setInvestAmount(amount)}
                  >
                    ${amount.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
            <div className="calculator-result">
              <h4>📊 {t('tokenPrograms.publicRound.calculator.resultTitle')}</h4>
              <div className="result-item">
                <span className="label">{t('tokenPrograms.publicRound.calculator.tokenAmount')}</span>
                <span className="value highlight">{tokensReceived.toLocaleString()} TBURN</span>
              </div>
              <div className="result-item">
                <span className="label">{t('tokenPrograms.publicRound.calculator.tgeUnlock')}</span>
                <span className="value">{(tokensReceived * 0.10).toLocaleString()} TBURN</span>
              </div>
              <div className="result-item">
                <span className="label">{t('tokenPrograms.publicRound.calculator.launchPrice')}</span>
                <span className="value">${potentialValue.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="label">{t('tokenPrograms.publicRound.calculator.profit')}</span>
                <span className="value gold">+${potentialProfit.toLocaleString()} (+{((potentialProfit / investAmount) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.publicRound.faq.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.publicRound.faq.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.publicRound.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('tokenPrograms.publicRound.faq.q1.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.publicRound.faq.q1.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('tokenPrograms.publicRound.faq.q2.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.publicRound.faq.q2.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('tokenPrograms.publicRound.faq.q3.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.publicRound.faq.q3.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('tokenPrograms.publicRound.faq.q4.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.publicRound.faq.q4.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('tokenPrograms.publicRound.faq.q5.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.publicRound.faq.q5.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('tokenPrograms.publicRound.faq.q6.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.publicRound.faq.q6.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('tokenPrograms.publicRound.faq.q7.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.publicRound.faq.q7.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('tokenPrograms.publicRound.faq.q8.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.publicRound.faq.q8.answer')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('tokenPrograms.publicRound.ctaSection.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('tokenPrograms.publicRound.ctaSection.subtitle')}
          </p>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--dark)', fontSize: '1.25rem', padding: '20px 50px' }}
            onClick={() => setInquiryDialogOpen(true)}
            data-testid="button-invest-now"
          >
            🚀 {t('tokenPrograms.publicRound.ctaSection.button')}
          </button>
        </div>
      </section>

      {/* Investment Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-400">{t('tokenPrograms.publicRound.dialog.title')}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {t('tokenPrograms.publicRound.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">{t('tokenPrograms.publicRound.dialog.name')}</Label>
              <Input
                id="name"
                placeholder={t('tokenPrograms.publicRound.dialog.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">{t('tokenPrograms.publicRound.dialog.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentAmount" className="text-slate-300">{t('tokenPrograms.publicRound.dialog.investmentAmount')}</Label>
              <Input
                id="investmentAmount"
                placeholder="$1,000"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-300">{t('tokenPrograms.publicRound.dialog.message')}</Label>
              <Textarea
                id="message"
                placeholder={t('tokenPrograms.publicRound.dialog.messagePlaceholder')}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
                data-testid="input-message"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInquiryDialogOpen(false)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {t('tokenPrograms.publicRound.dialog.cancelBtn')}
              </Button>
              <Button
                type="submit"
                disabled={inquiryMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-submit-inquiry"
              >
                {inquiryMutation.isPending ? t('tokenPrograms.publicRound.dialog.submitting') : t('tokenPrograms.publicRound.dialog.submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('tokenPrograms.publicRound.footer.description')}</p>
            <div className="social-links">
              <a href="#">𝕏</a>
              <a href="#">✈</a>
              <a href="#">💬</a>
              <a href="#">⌘</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>{t('tokenPrograms.publicRound.footer.product')}</h4>
            <ul>
              <li><Link href="/">{t('tokenPrograms.publicRound.footer.mainnet')}</Link></li>
              <li><Link href="/scan">{t('tokenPrograms.publicRound.footer.explorer')}</Link></li>
              <li><Link href="/app/bridge">{t('tokenPrograms.publicRound.footer.bridge')}</Link></li>
              <li><Link href="/app/staking">{t('tokenPrograms.publicRound.footer.staking')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('tokenPrograms.publicRound.footer.resources')}</h4>
            <ul>
              <li><Link href="/learn/whitepaper">{t('tokenPrograms.publicRound.footer.whitepaper')}</Link></li>
              <li><Link href="/developers/docs">{t('tokenPrograms.publicRound.footer.docs')}</Link></li>
              <li><a href="#">{t('tokenPrograms.publicRound.footer.github')}</a></li>
              <li><Link href="/security-audit">{t('tokenPrograms.publicRound.footer.audit')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('tokenPrograms.publicRound.footer.community')}</h4>
            <ul>
              <li><Link href="/community/news">{t('tokenPrograms.publicRound.footer.blog')}</Link></li>
              <li><a href="#">{t('tokenPrograms.publicRound.footer.ambassador')}</a></li>
              <li><a href="#">{t('tokenPrograms.publicRound.footer.grants')}</a></li>
              <li><Link href="/qna">{t('tokenPrograms.publicRound.footer.support')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }}>{t('tokenPrograms.publicRound.footer.terms')}</Link>
            <Link href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }}>{t('tokenPrograms.publicRound.footer.privacy')}</Link>
          </div>
        </div>
      </footer>

      <WalletConnectionModal 
        open={walletModalOpen} 
        onOpenChange={setWalletModalOpen}
      />
    </div>
  );
}
