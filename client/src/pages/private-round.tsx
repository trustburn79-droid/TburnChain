import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

export default function PrivateRoundPage() {
  const { t } = useTranslation();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    investmentAmount: "",
    message: "",
  });
  const { toast } = useToast();
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();

  const { data: response, isLoading } = useQuery<InvestmentRoundsStatsResponse>({
    queryKey: ['/api/token-programs/investment-rounds/stats'],
  });
  const stats = response?.data;

  const privateRound = stats?.rounds?.find(r => r.name.toLowerCase().includes('private'));

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/investment-inquiry', {
        name: data.name,
        email: data.email,
        company: data.company,
        investmentRound: 'private',
        investmentAmount: data.investmentAmount,
        message: data.message,
      });
    },
    onSuccess: () => {
      toast({
        title: t('tokenPrograms.privateRound.dialog.success'),
        description: t('tokenPrograms.privateRound.dialog.successDesc'),
      });
      setInquiryDialogOpen(false);
      setFormData({ name: "", email: "", company: "", investmentAmount: "", message: "" });
    },
    onError: () => {
      toast({
        title: t('tokenPrograms.privateRound.dialog.error'),
        description: t('tokenPrograms.privateRound.dialog.errorDesc'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: t('tokenPrograms.privateRound.dialog.required'),
        description: t('tokenPrograms.privateRound.dialog.requiredDesc'),
        variant: "destructive",
      });
      return;
    }
    inquiryMutation.mutate(formData);
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect("metamask");
    }
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const investmentHighlights = [
    { value: "$0.10", label: t('tokenPrograms.privateRound.highlights.pricePerToken'), compare: t('tokenPrograms.privateRound.highlights.priceCompare') },
    { value: "50%", label: t('tokenPrograms.privateRound.highlights.discountLaunch'), compare: "" },
    { value: "5%", label: t('tokenPrograms.privateRound.highlights.tgeUnlock'), compare: "" },
    { value: "18M", label: t('tokenPrograms.privateRound.highlights.vestingPeriod'), compare: "" },
  ];

  const distributions = [
    { id: "seed", name: "Seed Round", amount: "$0.04", discount: "80%", status: "completed" },
    { id: "private", name: "Private Round", amount: "$0.10", discount: "50%", status: "current" },
    { id: "public", name: "Public Round", amount: "$0.20", discount: "60%", status: "" },
  ];

  const investorTiers = [
    { id: "institutional", icon: "🏛️", name: t('tokenPrograms.privateRound.tiers.institutional.name'), subtitle: t('tokenPrograms.privateRound.tiers.institutional.subtitle'), amount: "$5M+", details: [{ label: t('tokenPrograms.privateRound.tiers.minInvestmentLabel'), value: "$5,000,000" }, { label: t('tokenPrograms.privateRound.tiers.tokenPriceLabel'), value: "$0.09" }, { label: t('tokenPrograms.privateRound.tiers.tgeUnlockLabel'), value: "7%" }], benefits: t('tokenPrograms.privateRound.tiers.institutional.benefits', { returnObjects: true }) as string[] },
    { id: "strategic", icon: "🎯", name: t('tokenPrograms.privateRound.tiers.strategic.name'), subtitle: t('tokenPrograms.privateRound.tiers.strategic.subtitle'), amount: "$2M+", details: [{ label: t('tokenPrograms.privateRound.tiers.minInvestmentLabel'), value: "$2,000,000" }, { label: t('tokenPrograms.privateRound.tiers.tokenPriceLabel'), value: "$0.095" }, { label: t('tokenPrograms.privateRound.tiers.tgeUnlockLabel'), value: "6%" }], benefits: t('tokenPrograms.privateRound.tiers.strategic.benefits', { returnObjects: true }) as string[] },
    { id: "growth", icon: "📈", name: t('tokenPrograms.privateRound.tiers.growth.name'), subtitle: t('tokenPrograms.privateRound.tiers.growth.subtitle'), amount: "$500K+", details: [{ label: t('tokenPrograms.privateRound.tiers.minInvestmentLabel'), value: "$500,000" }, { label: t('tokenPrograms.privateRound.tiers.tokenPriceLabel'), value: "$0.10" }, { label: t('tokenPrograms.privateRound.tiers.tgeUnlockLabel'), value: "5%" }], benefits: t('tokenPrograms.privateRound.tiers.growth.benefits', { returnObjects: true }) as string[] },
    { id: "standard", icon: "💼", name: t('tokenPrograms.privateRound.tiers.standard.name'), subtitle: t('tokenPrograms.privateRound.tiers.standard.subtitle'), amount: "$100K+", details: [{ label: t('tokenPrograms.privateRound.tiers.minInvestmentLabel'), value: "$100,000" }, { label: t('tokenPrograms.privateRound.tiers.tokenPriceLabel'), value: "$0.10" }, { label: t('tokenPrograms.privateRound.tiers.tgeUnlockLabel'), value: "5%" }], benefits: t('tokenPrograms.privateRound.tiers.standard.benefits', { returnObjects: true }) as string[] },
  ];

  const vestingPhases = [
    { icon: "🎉", title: t('tokenPrograms.privateRound.vesting.tgeUnlock'), value: "5%", desc: t('tokenPrograms.privateRound.vesting.tgeDesc') },
    { icon: "🔒", title: t('tokenPrograms.privateRound.vesting.cliffPeriod'), value: "6M", desc: t('tokenPrograms.privateRound.vesting.cliffDesc') },
    { icon: "📈", title: t('tokenPrograms.privateRound.vesting.monthlyVesting'), value: "7.9%", desc: t('tokenPrograms.privateRound.vesting.monthlyDesc') },
    { icon: "✅", title: t('tokenPrograms.privateRound.vesting.fullUnlock'), value: "100%", desc: t('tokenPrograms.privateRound.vesting.fullUnlockDesc') },
  ];

  const allocationBreakdown = [
    { icon: "🏛️", name: t('tokenPrograms.privateRound.allocation.vcFunds'), amount: "500M", percent: "50%" },
    { icon: "🏢", name: t('tokenPrograms.privateRound.allocation.familyOffice'), amount: "200M", percent: "20%" },
    { icon: "🎯", name: t('tokenPrograms.privateRound.allocation.strategicInvestors'), amount: "200M", percent: "20%" },
    { icon: "💼", name: t('tokenPrograms.privateRound.allocation.corporateInvestors'), amount: "100M", percent: "10%" },
  ];

  const currentInvestors = [
    { icon: "🏛️", name: "Galaxy Digital", type: "VC", tier: "institutional" },
    { icon: "🏢", name: "Asia Capital Partners", type: "Family Office", tier: "institutional" },
    { icon: "🎯", name: "Blockchain Partners Korea", type: "Strategic", tier: "strategic" },
    { icon: "💼", name: "Digital Asset Holdings", type: "Corporate", tier: "growth" },
  ];

  const processSteps = [
    { icon: "📋", title: t('tokenPrograms.privateRound.process.inquiry'), desc: t('tokenPrograms.privateRound.process.inquiryDesc'), duration: t('tokenPrograms.privateRound.process.inquiryDuration') },
    { icon: "🔍", title: t('tokenPrograms.privateRound.process.dueDiligence'), desc: t('tokenPrograms.privateRound.process.dueDiligenceDesc'), duration: t('tokenPrograms.privateRound.process.dueDiligenceDuration') },
    { icon: "📝", title: t('tokenPrograms.privateRound.process.negotiation'), desc: t('tokenPrograms.privateRound.process.negotiationDesc'), duration: t('tokenPrograms.privateRound.process.negotiationDuration') },
    { icon: "💸", title: t('tokenPrograms.privateRound.process.funding'), desc: t('tokenPrograms.privateRound.process.fundingDesc'), duration: t('tokenPrograms.privateRound.process.fundingDuration') },
    { icon: "🎉", title: t('tokenPrograms.privateRound.process.tokenAllocation'), desc: t('tokenPrograms.privateRound.process.tokenAllocationDesc'), duration: t('tokenPrograms.privateRound.process.tokenAllocationDuration') },
  ];

  const whyPrivate = [
    { icon: "💰", title: t('tokenPrograms.privateRound.benefits.excellentPrice'), value: t('tokenPrograms.privateRound.benefits.excellentPriceValue'), desc: t('tokenPrograms.privateRound.benefits.excellentPriceDesc') },
    { icon: "🔓", title: t('tokenPrograms.privateRound.benefits.tgeLiquidity'), value: t('tokenPrograms.privateRound.benefits.tgeLiquidityValue'), desc: t('tokenPrograms.privateRound.benefits.tgeLiquidityDesc') },
    { icon: "🤝", title: t('tokenPrograms.privateRound.benefits.strategicPartnership'), value: t('tokenPrograms.privateRound.benefits.strategicPartnershipValue'), desc: t('tokenPrograms.privateRound.benefits.strategicPartnershipDesc') },
  ];

  return (
    <div className="private-round-page">
      <style>{`
        .private-round-page {
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
          --private-primary: #8B5CF6;
          --private-secondary: #7C3AED;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-private: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes lockPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); } }
        @keyframes progressFill { 0% { width: 0%; } 100% { width: 72%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .private-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
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
        .nav-links a:hover { color: var(--private-primary); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-private);
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
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          top: -300px;
          left: -200px;
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
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--private-primary);
          margin-bottom: 2rem;
        }

        .badge .lock-icon { animation: lockPulse 2s ease-in-out infinite; display: inline-block; }

        .round-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(139, 92, 246, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--private-primary);
          margin-left: 10px;
        }

        .round-status .dot {
          width: 8px;
          height: 8px;
          background: var(--private-primary);
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
          background: var(--gradient-private);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--light-gray);
          max-width: 750px;
          margin: 0 auto 3rem;
        }

        .fundraise-progress {
          background: var(--dark-card);
          border: 1px solid rgba(139, 92, 246, 0.3);
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

        .progress-header .raised { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); }
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
          background: var(--gradient-private);
          border-radius: 100px;
          width: 72%;
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

        .progress-stats .percent { color: var(--private-primary); font-weight: 700; }
        .progress-stats .remaining { color: var(--gray); }

        .investment-highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .highlight-card {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .highlight-card .value { font-size: 1.75rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .highlight-card .label { font-size: 0.85rem; color: var(--light-gray); }
        .highlight-card .compare { font-size: 0.75rem; color: var(--success); margin-top: 0.25rem; }

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
          border-color: var(--private-primary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-private);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-private);
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
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

        .btn-secondary:hover { border-color: var(--private-primary); color: var(--private-primary); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(139, 92, 246, 0.15);
          color: var(--private-primary);
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
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent);
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
        .comparison-table tr.highlight td { background: rgba(139, 92, 246, 0.1); }

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
        .round-badge.private { background: rgba(139, 92, 246, 0.2); color: var(--private-primary); }
        .round-badge.public { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
        .round-badge.current { animation: glow 2s ease-in-out infinite; }

        .discount-badge {
          background: rgba(139, 92, 246, 0.2);
          color: var(--private-primary);
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

        .tier-card.institutional { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.strategic { border-color: var(--private-primary); }
        .tier-card.growth { border-color: var(--indigo); }
        .tier-card.standard { border-color: var(--cyan); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.institutional .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.strategic .tier-header { background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); }
        .tier-card.growth .tier-header { background: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%); }
        .tier-card.standard .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.institutional .tier-name { color: var(--gold); }
        .tier-card.strategic .tier-name { color: var(--private-primary); }
        .tier-card.growth .tier-name { color: var(--indigo); }
        .tier-card.standard .tier-name { color: var(--cyan); }

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

        .tier-card.institutional .tier-amount .value { color: var(--gold); }
        .tier-card.strategic .tier-amount .value { color: var(--private-primary); }
        .tier-card.growth .tier-amount .value { color: var(--indigo); }
        .tier-card.standard .tier-amount .value { color: var(--cyan); }

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

        .tier-card.institutional .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.strategic .tier-btn { background: var(--gradient-private); color: var(--white); }
        .tier-card.growth .tier-btn { background: linear-gradient(135deg, var(--indigo), var(--blue)); color: var(--white); }
        .tier-card.standard .tier-btn { background: linear-gradient(135deg, var(--cyan), var(--blue)); color: var(--white); }

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
        .vesting-phase .value { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .vesting-phase .desc { font-size: 0.8rem; color: var(--gray); }

        .allocation-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .allocation-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .allocation-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .allocation-card:hover {
          border-color: var(--private-primary);
          transform: translateY(-5px);
        }

        .allocation-card .icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .allocation-card .name { font-weight: 700; margin-bottom: 0.25rem; }
        .allocation-card .amount { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .allocation-card .percent { font-size: 0.85rem; color: var(--gray); }

        .investors-showcase {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .investors-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .investor-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .investor-card:hover {
          background: rgba(139, 92, 246, 0.05);
          border-color: var(--private-primary);
          transform: translateY(-5px);
        }

        .investor-logo {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.2));
        }

        .investor-card-name { font-weight: 700; margin-bottom: 0.25rem; }
        .investor-card-type { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }

        .investor-card-tier {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .investor-card-tier.institutional { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .investor-card-tier.strategic { background: rgba(139, 92, 246, 0.2); color: var(--private-primary); }
        .investor-card-tier.growth { background: rgba(99, 102, 241, 0.2); color: var(--indigo); }

        .process-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .process-timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 2rem 0;
        }

        .process-timeline::before {
          content: '';
          position: absolute;
          top: 40px;
          left: 10%;
          right: 10%;
          height: 4px;
          background: linear-gradient(90deg, var(--private-primary), var(--indigo), var(--blue), var(--cyan), var(--gold));
          border-radius: 2px;
        }

        .process-item {
          text-align: center;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .process-dot {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          border: 4px solid var(--dark);
        }

        .process-item:nth-child(1) .process-dot { background: var(--private-primary); }
        .process-item:nth-child(2) .process-dot { background: var(--indigo); }
        .process-item:nth-child(3) .process-dot { background: var(--blue); }
        .process-item:nth-child(4) .process-dot { background: var(--cyan); }
        .process-item:nth-child(5) .process-dot { background: var(--gold); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--private-primary); font-weight: 600; margin-top: 0.5rem; }

        .why-private-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .why-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .why-card:hover {
          border-color: var(--private-primary);
          transform: translateY(-5px);
        }

        .why-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .why-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
        .why-card .value { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.5rem; }
        .why-card p { font-size: 0.85rem; color: var(--light-gray); }

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

        .faq-chevron { color: var(--private-primary); transition: transform 0.3s; }
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
          background: var(--gradient-private);
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

        .social-links a:hover { background: var(--private-primary); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--private-primary); }

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
          .tiers-grid, .allocation-grid { grid-template-columns: repeat(2, 1fr); }
          .why-private-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid, .investment-highlights { grid-template-columns: repeat(2, 1fr); }
          .vesting-visual { grid-template-columns: repeat(2, 1fr); }
          .vesting-phase::after { display: none; }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .investment-highlights, .tiers-grid, .allocation-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="private-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#tiers">{t('tokenPrograms.privateRound.nav.tiers')}</a>
            <a href="#vesting">{t('tokenPrograms.privateRound.nav.vesting')}</a>
            <a href="#allocation">{t('tokenPrograms.privateRound.nav.allocation')}</a>
            <a href="#investors">{t('tokenPrograms.privateRound.nav.investors')}</a>
            <a href="#faq">{t('tokenPrograms.privateRound.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              onClick={handleWalletClick}
              data-testid="button-connect-wallet"
            >
              {isConnected ? formatAddress(address!) : t('tokenPrograms.privateRound.nav.connectWallet')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="lock-icon">🔐</span> {t('tokenPrograms.privateRound.hero.badge')}
            <span className="round-status"><span className="dot"></span> {t('tokenPrograms.privateRound.hero.status')}</span>
          </div>
          <h1>
            {t('tokenPrograms.privateRound.hero.title')}<br />
            <span className="gradient-text">{t('tokenPrograms.privateRound.hero.titleHighlight')}</span>
          </h1>
          <p className="hero-subtitle">
            {t('tokenPrograms.privateRound.hero.subtitle')}
          </p>

          <div className="fundraise-progress" data-testid="fundraise-progress">
            <div className="progress-header">
              <span className="raised">$72,000,000</span>
              <span className="goal">{t('tokenPrograms.privateRound.hero.progressGoal')}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-stats">
              <span className="percent">{t('tokenPrograms.privateRound.hero.progressPercent')}</span>
              <span className="remaining">{t('tokenPrograms.privateRound.hero.progressRemaining')}</span>
            </div>
          </div>

          <div className="investment-highlights" data-testid="investment-highlights">
            {investmentHighlights.map((item, idx) => (
              <div key={idx} className="highlight-card">
                <div className="value">{item.value}</div>
                <div className="label">{item.label}</div>
                {item.compare && <div className="compare">{item.compare}</div>}
              </div>
            ))}
          </div>

          <div className="stats-grid">
            {isLoading ? (
              <div className="stat-card" data-testid="loading-indicator">
                <div className="stat-value" style={{ opacity: 0.5 }}>{t('tokenPrograms.privateRound.stats.loading')}</div>
              </div>
            ) : (
              <>
                <div className="stat-card" data-testid="stat-total-private">
                  <div className="stat-value">{privateRound?.allocation || "1B"}</div>
                  <div className="stat-label">{t('tokenPrograms.privateRound.stats.privateAllocation')}</div>
                </div>
                <div className="stat-card" data-testid="stat-price">
                  <div className="stat-value">{privateRound?.price || "$0.10"}</div>
                  <div className="stat-label">{t('tokenPrograms.privateRound.stats.tokenPrice')}</div>
                </div>
                <div className="stat-card" data-testid="stat-hardcap">
                  <div className="stat-value">{privateRound?.raised || "$100M"}</div>
                  <div className="stat-label">{t('tokenPrograms.privateRound.stats.hardcap')}</div>
                </div>
                <div className="stat-card" data-testid="stat-investors">
                  <div className="stat-value">{privateRound?.investors || 45}+</div>
                  <div className="stat-label">{t('tokenPrograms.privateRound.stats.institutionalInvestors')}</div>
                </div>
              </>
            )}
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-apply-private" onClick={() => setInquiryDialogOpen(true)}>
              🔐 {t('tokenPrograms.privateRound.cta.applyPrivate')}
            </button>
            <button className="btn-secondary" onClick={() => window.open('/learn/whitepaper', '_blank')}>
              📖 {t('tokenPrograms.privateRound.cta.viewDeck')}
            </button>
          </div>
        </div>
      </section>

      {/* Round Comparison Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">COMPARISON</span>
          <h2 className="section-title">{t('tokenPrograms.privateRound.comparison.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.privateRound.comparison.subtitle')}</p>
        </div>

        <div className="round-comparison">
          <div className="comparison-header">
            <h3>📊 {t('tokenPrograms.privateRound.comparison.tableTitle')}</h3>
          </div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>{t('tokenPrograms.privateRound.comparison.round')}</th>
                <th>{t('tokenPrograms.privateRound.comparison.tokenPrice')}</th>
                <th>{t('tokenPrograms.privateRound.comparison.discount')}</th>
                <th>{t('tokenPrograms.privateRound.comparison.status')}</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map(round => (
                <tr key={round.id} className={round.status === 'current' ? 'highlight' : ''}>
                  <td>
                    <span className={`round-badge ${round.id} ${round.status === 'current' ? 'current' : ''}`}>
                      🔐 {round.name}
                    </span>
                  </td>
                  <td>{round.amount}</td>
                  <td>
                    {round.discount}
                    {round.status === 'current' && <span className="discount-badge">{t('tokenPrograms.privateRound.comparison.inProgress')}</span>}
                  </td>
                  <td>
                    {round.status === 'completed' ? `✅ ${t('tokenPrograms.privateRound.comparison.completed')}` : 
                     round.status === 'current' ? `🔐 ${t('tokenPrograms.privateRound.comparison.inProgress')}` : `⏳ ${t('tokenPrograms.privateRound.comparison.upcoming')}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Investment Tiers Section */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">TIERS</span>
          <h2 className="section-title">{t('tokenPrograms.privateRound.tiers.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.privateRound.tiers.subtitle')}</p>
        </div>

        <div className="tiers-grid">
          {investorTiers.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.id}`} data-testid={`tier-${tier.id}`}>
              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-subtitle">{tier.subtitle}</p>
              </div>
              <div className="tier-content">
                <div className="tier-amount">
                  <div className="label">{t('tokenPrograms.privateRound.tiers.minInvestmentLabel')}</div>
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
                <button className="tier-btn" onClick={() => setInquiryDialogOpen(true)}>{t('tokenPrograms.privateRound.tiers.inquireBtn')}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vesting Section */}
      <section className="section" id="vesting">
        <div className="section-header">
          <span className="section-badge">VESTING</span>
          <h2 className="section-title">{t('tokenPrograms.privateRound.vesting.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.privateRound.vesting.subtitle')}</p>
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

      {/* Allocation Breakdown Section */}
      <section className="section" id="allocation" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">ALLOCATION</span>
          <h2 className="section-title">{t('tokenPrograms.privateRound.allocation.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.privateRound.allocation.subtitle')}</p>
        </div>

        <div className="allocation-container">
          <div className="allocation-grid">
            {allocationBreakdown.map((item, idx) => (
              <div key={idx} className="allocation-card">
                <div className="icon">{item.icon}</div>
                <div className="name">{item.name}</div>
                <div className="amount">{item.amount}</div>
                <div className="percent">{item.percent}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Investors Section */}
      <section className="section" id="investors">
        <div className="section-header">
          <span className="section-badge">INVESTORS</span>
          <h2 className="section-title">{t('tokenPrograms.privateRound.investors.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.privateRound.investors.subtitle')}</p>
        </div>

        <div className="investors-showcase">
          <div className="investors-grid">
            {currentInvestors.map((investor, idx) => (
              <div key={idx} className="investor-card">
                <div className="investor-logo">{investor.icon}</div>
                <div className="investor-card-name">{investor.name}</div>
                <div className="investor-card-type">{investor.type}</div>
                <span className={`investor-card-tier ${investor.tier}`}>
                  {investor.tier.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">{t('tokenPrograms.privateRound.process.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.privateRound.process.subtitle')}</p>
        </div>

        <div className="process-container">
          <div className="process-timeline">
            {processSteps.map((step, idx) => (
              <div key={idx} className="process-item">
                <div className="process-dot">{step.icon}</div>
                <div className="process-title">{step.title}</div>
                <div className="process-desc">{step.desc}</div>
                <div className="process-duration">{step.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Private Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">BENEFITS</span>
          <h2 className="section-title">{t('tokenPrograms.privateRound.benefits.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.privateRound.benefits.subtitle')}</p>
        </div>

        <div className="why-private-grid">
          {whyPrivate.map((item, idx) => (
            <div key={idx} className="why-card">
              <div className="why-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <div className="value">{item.value}</div>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">{t('tokenPrograms.privateRound.faq.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.privateRound.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('tokenPrograms.privateRound.faq.q1.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.privateRound.faq.q1.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('tokenPrograms.privateRound.faq.q2.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.privateRound.faq.q2.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('tokenPrograms.privateRound.faq.q3.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.privateRound.faq.q3.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('tokenPrograms.privateRound.faq.q4.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.privateRound.faq.q4.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('tokenPrograms.privateRound.faq.q5.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.privateRound.faq.q5.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('tokenPrograms.privateRound.faq.q6.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.privateRound.faq.q6.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('tokenPrograms.privateRound.faq.q7.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.privateRound.faq.q7.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('tokenPrograms.privateRound.faq.q8.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.privateRound.faq.q8.answer')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('tokenPrograms.privateRound.ctaSection.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('tokenPrograms.privateRound.ctaSection.subtitle')}
          </p>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--dark)', fontSize: '1.25rem', padding: '20px 50px' }}
            onClick={() => setInquiryDialogOpen(true)}
            data-testid="button-invest-now"
          >
            🔐 {t('tokenPrograms.privateRound.ctaSection.button')}
          </button>
        </div>
      </section>

      {/* Investment Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-400">{t('tokenPrograms.privateRound.dialog.title')}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {t('tokenPrograms.privateRound.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">{t('tokenPrograms.privateRound.dialog.name')}</Label>
              <Input
                id="name"
                placeholder={t('tokenPrograms.privateRound.dialog.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">{t('tokenPrograms.privateRound.dialog.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-slate-300">{t('tokenPrograms.privateRound.dialog.company')}</Label>
              <Input
                id="company"
                placeholder="ABC Ventures"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentAmount" className="text-slate-300">{t('tokenPrograms.privateRound.dialog.investmentAmount')}</Label>
              <Input
                id="investmentAmount"
                placeholder="$500,000"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-300">{t('tokenPrograms.privateRound.dialog.message')}</Label>
              <Textarea
                id="message"
                placeholder={t('tokenPrograms.privateRound.dialog.messagePlaceholder')}
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
                {t('tokenPrograms.privateRound.dialog.cancelBtn')}
              </Button>
              <Button
                type="submit"
                disabled={inquiryMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-submit-inquiry"
              >
                {inquiryMutation.isPending ? t('tokenPrograms.privateRound.dialog.submitting') : t('tokenPrograms.privateRound.dialog.submit')}
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
            <p>{t('tokenPrograms.privateRound.footer.description')}</p>
            <div className="social-links">
              <a href="#">𝕏</a>
              <a href="#">✈</a>
              <a href="#">💬</a>
              <a href="#">⌘</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li><Link href="/">{t('tokenPrograms.privateRound.footer.mainnet')}</Link></li>
              <li><Link href="/scan">{t('tokenPrograms.privateRound.footer.explorer')}</Link></li>
              <li><Link href="/app/bridge">{t('tokenPrograms.privateRound.footer.bridge')}</Link></li>
              <li><Link href="/app/staking">{t('tokenPrograms.privateRound.footer.staking')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><Link href="/learn/whitepaper">{t('tokenPrograms.privateRound.footer.whitepaper')}</Link></li>
              <li><Link href="/developers/docs">{t('tokenPrograms.privateRound.footer.docs')}</Link></li>
              <li><a href="#">GitHub</a></li>
              <li><Link href="/security-audit">{t('tokenPrograms.privateRound.footer.audit')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><Link href="/community/news">{t('tokenPrograms.privateRound.footer.blog')}</Link></li>
              <li><a href="#">{t('tokenPrograms.privateRound.footer.ambassador')}</a></li>
              <li><a href="#">{t('tokenPrograms.privateRound.footer.grants')}</a></li>
              <li><Link href="/qna">{t('tokenPrograms.privateRound.footer.support')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }}>{t('tokenPrograms.privateRound.footer.terms')}</Link>
            <Link href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }}>{t('tokenPrograms.privateRound.footer.privacy')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
