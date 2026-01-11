import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

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

export default function SeedRoundPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    investmentAmount: "",
    message: ""
  });
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: response, isLoading } = useQuery<InvestmentRoundsStatsResponse>({
    queryKey: ['/api/token-programs/investment-rounds/stats'],
  });
  const stats = response?.data;

  const seedRound = stats?.rounds?.find(r => r.name.toLowerCase().includes('seed'));

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/investment-inquiry', { ...data, round: 'seed' });
    },
    onSuccess: () => {
      toast({
        title: t("tokenPrograms.seedRound.toast.inquirySuccess"),
        description: t("tokenPrograms.seedRound.toast.inquirySuccessDesc"),
      });
      setInquiryDialogOpen(false);
      setFormData({ name: "", email: "", company: "", investmentAmount: "", message: "" });
    },
    onError: (error) => {
      console.error('[Investment Inquiry] Error:', error);
      toast({
        title: t("tokenPrograms.seedRound.toast.inquiryError"),
        description: t("tokenPrograms.seedRound.toast.inquiryErrorDesc"),
        variant: "destructive"
      });
    }
  });

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      setInquiryDialogOpen(true);
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        title: t("tokenPrograms.seedRound.dialog.requiredFields"),
        description: t("tokenPrograms.seedRound.dialog.requiredFieldsDesc"),
        variant: "destructive"
      });
      return;
    }
    inquiryMutation.mutate(formData);
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const investmentHighlights = [
    { value: "$0.04", label: t("tokenPrograms.seedRound.highlights.tokenPrice") },
    { value: "80%", label: t("tokenPrograms.seedRound.highlights.discountRate") },
    { value: "12mo", label: t("tokenPrograms.seedRound.highlights.vestingPeriod") },
  ];

  const distributions = [
    { id: "seed", name: "Seed Round", amount: "$0.04", discount: "80%", status: "current" },
    { id: "private", name: "Private Round", amount: "$0.10", discount: "50%", status: "" },
    { id: "public", name: "Public Round", amount: "$0.20", discount: "0%", status: "" },
  ];

  const investorTiers = [
    { id: "lead", icon: "👑", name: t("tokenPrograms.seedRound.tiers.leadInvestor"), subtitle: t("tokenPrograms.seedRound.tiers.leadSubtitle"), amount: "$1M+", details: [{ label: t("tokenPrograms.seedRound.tiers.minInvestmentLabel"), value: "$1,000,000" }, { label: t("tokenPrograms.seedRound.tiers.discountRate"), value: "85%" }, { label: t("tokenPrograms.seedRound.tiers.lockupPeriod"), value: t("tokenPrograms.seedRound.tiers.lockupPeriodValue") }], benefits: [t("tokenPrograms.seedRound.tiers.benefits.boardObserver"), t("tokenPrograms.seedRound.tiers.benefits.monthlyMeeting"), t("tokenPrograms.seedRound.tiers.benefits.exclusiveDealFlow"), t("tokenPrograms.seedRound.tiers.benefits.priorityInvestment"), t("tokenPrograms.seedRound.tiers.benefits.dedicatedIR")] },
    { id: "major", icon: "🌱", name: t("tokenPrograms.seedRound.tiers.majorInvestor"), subtitle: t("tokenPrograms.seedRound.tiers.majorSubtitle"), amount: "$500K+", details: [{ label: t("tokenPrograms.seedRound.tiers.minInvestmentLabel"), value: "$500,000" }, { label: t("tokenPrograms.seedRound.tiers.discountRate"), value: "82%" }, { label: t("tokenPrograms.seedRound.tiers.lockupPeriod"), value: t("tokenPrograms.seedRound.tiers.lockupPeriodValue") }], benefits: [t("tokenPrograms.seedRound.tiers.benefits.quarterlyStrategy"), t("tokenPrograms.seedRound.tiers.benefits.earlyAccess"), t("tokenPrograms.seedRound.tiers.benefits.governanceParticipation"), t("tokenPrograms.seedRound.tiers.benefits.priorityAllocation"), t("tokenPrograms.seedRound.tiers.benefits.dedicatedSupport")] },
    { id: "standard", icon: "💎", name: t("tokenPrograms.seedRound.tiers.standardInvestor"), subtitle: t("tokenPrograms.seedRound.tiers.standardSubtitle"), amount: "$100K+", details: [{ label: t("tokenPrograms.seedRound.tiers.minInvestmentLabel"), value: "$100,000" }, { label: t("tokenPrograms.seedRound.tiers.discountRate"), value: "80%" }, { label: t("tokenPrograms.seedRound.tiers.lockupPeriod"), value: t("tokenPrograms.seedRound.tiers.lockupPeriodValue") }], benefits: [t("tokenPrograms.seedRound.tiers.benefits.monthlyNewsletter"), t("tokenPrograms.seedRound.tiers.benefits.communityAccess"), t("tokenPrograms.seedRound.tiers.benefits.basicGovernance"), t("tokenPrograms.seedRound.tiers.benefits.generalAllocation"), t("tokenPrograms.seedRound.tiers.benefits.emailSupport")] },
    { id: "angel", icon: "😇", name: t("tokenPrograms.seedRound.tiers.angelInvestor"), subtitle: t("tokenPrograms.seedRound.tiers.angelSubtitle"), amount: "$25K+", details: [{ label: t("tokenPrograms.seedRound.tiers.minInvestmentLabel"), value: "$25,000" }, { label: t("tokenPrograms.seedRound.tiers.discountRate"), value: "78%" }, { label: t("tokenPrograms.seedRound.tiers.lockupPeriod"), value: t("tokenPrograms.seedRound.tiers.lockupPeriodValue") }], benefits: [t("tokenPrograms.seedRound.tiers.benefits.quarterlyUpdates"), t("tokenPrograms.seedRound.tiers.benefits.communityChannel"), t("tokenPrograms.seedRound.tiers.benefits.nftBadge"), t("tokenPrograms.seedRound.tiers.benefits.angelNetwork"), t("tokenPrograms.seedRound.tiers.benefits.basicSupport")] },
  ];

  const vestingPhases = [
    { icon: "🔒", title: t("tokenPrograms.seedRound.vestingSection.cliffPeriod"), value: "12 months", desc: t("tokenPrograms.seedRound.vestingSection.initialLockup") },
    { icon: "🔓", title: t("tokenPrograms.seedRound.vestingSection.initialUnlock"), value: "10%", desc: t("tokenPrograms.seedRound.vestingSection.afterTge") },
    { icon: "📈", title: t("tokenPrograms.seedRound.vestingSection.monthlyVesting"), value: "7.5%", desc: t("tokenPrograms.seedRound.vestingSection.over12Months") },
    { icon: "✅", title: t("tokenPrograms.seedRound.vestingSection.fullUnlock"), value: "100%", desc: t("tokenPrograms.seedRound.vestingSection.after24Months") },
  ];

  const currentInvestors = [
    { icon: "🏦", name: t("tokenPrograms.seedRound.investorsSection.investor1.name"), type: t("tokenPrograms.seedRound.investorsSection.types.vc"), tier: "lead" },
    { icon: "💰", name: t("tokenPrograms.seedRound.investorsSection.investor2.name"), type: t("tokenPrograms.seedRound.investorsSection.types.fund"), tier: "lead" },
    { icon: "🌐", name: t("tokenPrograms.seedRound.investorsSection.investor3.name"), type: t("tokenPrograms.seedRound.investorsSection.types.vc"), tier: "major" },
    { icon: "⚡", name: t("tokenPrograms.seedRound.investorsSection.investor4.name"), type: t("tokenPrograms.seedRound.investorsSection.types.fund"), tier: "major" },
  ];

  const processSteps = [
    { icon: "📋", title: t("tokenPrograms.seedRound.processSection.step1.title"), desc: t("tokenPrograms.seedRound.processSection.step1.desc"), duration: t("tokenPrograms.seedRound.processSection.step1.duration") },
    { icon: "🔍", title: t("tokenPrograms.seedRound.processSection.step2.title"), desc: t("tokenPrograms.seedRound.processSection.step2.desc"), duration: t("tokenPrograms.seedRound.processSection.step2.duration") },
    { icon: "📝", title: t("tokenPrograms.seedRound.processSection.step3.title"), desc: t("tokenPrograms.seedRound.processSection.step3.desc"), duration: t("tokenPrograms.seedRound.processSection.step3.duration") },
    { icon: "💸", title: t("tokenPrograms.seedRound.processSection.step4.title"), desc: t("tokenPrograms.seedRound.processSection.step4.desc"), duration: t("tokenPrograms.seedRound.processSection.step4.duration") },
    { icon: "🎉", title: t("tokenPrograms.seedRound.processSection.step5.title"), desc: t("tokenPrograms.seedRound.processSection.step5.desc"), duration: t("tokenPrograms.seedRound.processSection.step5.duration") },
  ];

  const tokenMetrics = [
    { icon: "📊", title: t("tokenPrograms.seedRound.metrics.totalSupply"), value: t("tokenPrograms.seedRound.metrics.totalSupplyValue"), desc: t("tokenPrograms.seedRound.metrics.totalSupplyDesc") },
    { icon: "🌱", title: t("tokenPrograms.seedRound.metrics.seedAllocation"), value: t("tokenPrograms.seedRound.metrics.seedAllocationValue"), desc: t("tokenPrograms.seedRound.metrics.seedAllocationDesc") },
    { icon: "💵", title: t("tokenPrograms.seedRound.metrics.seedGoal"), value: t("tokenPrograms.seedRound.metrics.seedGoalValue"), desc: t("tokenPrograms.seedRound.metrics.seedGoalDesc") },
  ];

  const riskItems = [
    t("tokenPrograms.seedRound.risks.item1"),
    t("tokenPrograms.seedRound.risks.item2"),
    t("tokenPrograms.seedRound.risks.item3"),
    t("tokenPrograms.seedRound.risks.item4"),
  ];

  return (
    <div className="seed-round-page">
      <style>{`
        .seed-round-page {
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
          --seed-primary: #22C55E;
          --seed-secondary: #16A34A;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-seed: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes seedling { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.1) rotate(5deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); } 50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); } }

        .seed-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
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
        .nav-links a:hover { color: var(--seed-primary); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-seed);
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
          box-shadow: 0 10px 40px rgba(34, 197, 94, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(22, 163, 74, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%);
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
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--seed-primary);
          margin-bottom: 2rem;
        }

        .badge .seed-icon { animation: seedling 2s ease-in-out infinite; display: inline-block; }

        .round-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--seed-primary);
          margin-left: 10px;
        }

        .round-status .dot {
          width: 8px;
          height: 8px;
          background: var(--seed-primary);
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
          background: var(--gradient-seed);
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

        .investment-highlights {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }

        .highlight-card {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .highlight-card .value { font-size: 1.75rem; font-weight: 800; color: var(--seed-primary); margin-bottom: 0.25rem; }
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
          border-color: var(--seed-primary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-seed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-seed);
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
          box-shadow: 0 20px 60px rgba(34, 197, 94, 0.3);
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

        .btn-secondary:hover { border-color: var(--seed-primary); color: var(--seed-primary); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(34, 197, 94, 0.15);
          color: var(--seed-primary);
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
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent);
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

        .round-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .round-badge.seed { background: rgba(34, 197, 94, 0.2); color: var(--seed-primary); }
        .round-badge.private { background: rgba(139, 92, 246, 0.2); color: var(--purple); }
        .round-badge.public { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
        .round-badge.current { animation: glow 2s ease-in-out infinite; }

        .discount-badge {
          background: rgba(34, 197, 94, 0.2);
          color: var(--seed-primary);
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

        .tier-card.lead { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.major { border-color: var(--seed-primary); }
        .tier-card.standard { border-color: var(--purple); }
        .tier-card.angel { border-color: var(--cyan); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.lead .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.major .tier-header { background: linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, transparent 100%); }
        .tier-card.standard .tier-header { background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); }
        .tier-card.angel .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.lead .tier-name { color: var(--gold); }
        .tier-card.major .tier-name { color: var(--seed-primary); }
        .tier-card.standard .tier-name { color: var(--purple); }
        .tier-card.angel .tier-name { color: var(--cyan); }

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

        .tier-card.lead .tier-amount .value { color: var(--gold); }
        .tier-card.major .tier-amount .value { color: var(--seed-primary); }
        .tier-card.standard .tier-amount .value { color: var(--purple); }
        .tier-card.angel .tier-amount .value { color: var(--cyan); }

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

        .tier-card.lead .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.major .tier-btn { background: var(--gradient-seed); color: var(--white); }
        .tier-card.standard .tier-btn { background: linear-gradient(135deg, var(--purple), var(--violet)); color: var(--white); }
        .tier-card.angel .tier-btn { background: linear-gradient(135deg, var(--cyan), var(--blue)); color: var(--white); }

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
        .vesting-phase .value { font-size: 1.5rem; font-weight: 800; color: var(--seed-primary); margin-bottom: 0.25rem; }
        .vesting-phase .desc { font-size: 0.8rem; color: var(--gray); }

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
          background: rgba(34, 197, 94, 0.05);
          border-color: var(--seed-primary);
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
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2));
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

        .investor-card-tier.lead { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .investor-card-tier.major { background: rgba(34, 197, 94, 0.2); color: var(--seed-primary); }

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
          background: linear-gradient(90deg, var(--seed-primary), var(--emerald), var(--cyan), var(--blue), var(--gold));
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

        .process-item:nth-child(1) .process-dot { background: var(--seed-primary); }
        .process-item:nth-child(2) .process-dot { background: var(--emerald); }
        .process-item:nth-child(3) .process-dot { background: var(--cyan); }
        .process-item:nth-child(4) .process-dot { background: var(--blue); }
        .process-item:nth-child(5) .process-dot { background: var(--gold); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--seed-primary); font-weight: 600; margin-top: 0.5rem; }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .metric-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .metric-card:hover {
          border-color: var(--seed-primary);
          transform: translateY(-5px);
        }

        .metric-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .metric-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
        .metric-card .value { font-size: 1.75rem; font-weight: 800; color: var(--seed-primary); margin-bottom: 0.5rem; }
        .metric-card p { font-size: 0.85rem; color: var(--light-gray); }

        .risk-section {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .risk-section h4 {
          color: var(--danger);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .risk-section ul { list-style: none; padding: 0; }

        .risk-section li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .risk-section li::before { content: '⚠️'; margin-top: 3px; }

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

        .faq-chevron { color: var(--seed-primary); transition: transform 0.3s; }
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
          background: var(--gradient-seed);
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

        .social-links a:hover { background: var(--seed-primary); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--seed-primary); }

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
          .tiers-grid { grid-template-columns: repeat(2, 1fr); }
          .metrics-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .investment-highlights { grid-template-columns: 1fr; }
          .vesting-visual { grid-template-columns: repeat(2, 1fr); }
          .vesting-phase::after { display: none; }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .tiers-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="seed-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#tiers">{t("tokenPrograms.seedRound.tiers.title")}</a>
            <a href="#vesting">{t("tokenPrograms.seedRound.nav.vesting")}</a>
            <a href="#investors">{t("tokenPrograms.seedRound.investorsSection.title")}</a>
            <a href="#process">{t("tokenPrograms.seedRound.nav.process")}</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              onClick={handleWalletClick}
              data-testid="button-connect-wallet"
            >
              {isConnected ? formatAddress(address!) : t("tokenPrograms.seedRound.connectWallet")}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="seed-icon">🌱</span> {t("tokenPrograms.seedRound.hero.badge")}
            <span className="round-status"><span className="dot"></span> {t("tokenPrograms.seedRound.comparison.active")}</span>
          </div>
          <h1>
            {t("tokenPrograms.seedRound.hero.title")}<br />
            <span className="gradient-text">{t("tokenPrograms.seedRound.hero.titleHighlight")}</span> {t("tokenPrograms.seedRound.hero.titleEnd")}
          </h1>
          <p className="hero-subtitle">
            {t("tokenPrograms.seedRound.hero.subtitle")}
          </p>

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
                <div className="stat-value" style={{ opacity: 0.5 }}>{t("tokenPrograms.seedRound.hero.loading")}</div>
              </div>
            ) : (
              <>
                <div className="stat-card" data-testid="stat-total-seed">
                  <div className="stat-value">{seedRound?.allocation || "5억"}</div>
                  <div className="stat-label">{t("tokenPrograms.seedRound.hero.seedAllocation")}</div>
                </div>
                <div className="stat-card" data-testid="stat-price">
                  <div className="stat-value">${seedRound?.price || "0.04"}</div>
                  <div className="stat-label">{t("tokenPrograms.seedRound.hero.tokenPriceLabel")}</div>
                </div>
                <div className="stat-card" data-testid="stat-hardcap">
                  <div className="stat-value">${seedRound?.raised || "20M"}</div>
                  <div className="stat-label">{t("tokenPrograms.seedRound.hero.hardcap")}</div>
                </div>
                <div className="stat-card" data-testid="stat-investors">
                  <div className="stat-value">{seedRound?.investors || 15}+</div>
                  <div className="stat-label">{t("tokenPrograms.seedRound.investorsSection.title")}</div>
                </div>
              </>
            )}
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply-seed"
              onClick={() => setInquiryDialogOpen(true)}
            >
              {t("tokenPrograms.seedRound.hero.applySeed")}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-investment-memo"
              onClick={() => setMemoDialogOpen(true)}
            >
              {t("tokenPrograms.seedRound.hero.investmentMemo")}
            </button>
          </div>
        </div>
      </section>

      {/* Round Comparison Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t("tokenPrograms.seedRound.comparison.badge")}</span>
          <h2 className="section-title">{t("tokenPrograms.seedRound.comparison.title")}</h2>
          <p className="section-subtitle">{t("tokenPrograms.seedRound.comparison.subtitle")}</p>
        </div>

        <div className="round-comparison">
          <div className="comparison-header">
            <h3>{t("tokenPrograms.seedRound.comparison.header")}</h3>
          </div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>{t("tokenPrograms.seedRound.comparison.round")}</th>
                <th>{t("tokenPrograms.seedRound.hero.tokenPriceLabel")}</th>
                <th>{t("tokenPrograms.seedRound.comparison.discountCol")}</th>
                <th>{t("tokenPrograms.seedRound.comparison.statusCol")}</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map(round => (
                <tr key={round.id}>
                  <td>
                    <span className={`round-badge ${round.id} ${round.status === 'current' ? 'current' : ''}`}>
                      🌱 {round.name}
                    </span>
                  </td>
                  <td>{round.amount}</td>
                  <td>
                    {round.discount}
                    {round.status === 'current' && <span className="discount-badge">{t("tokenPrograms.seedRound.comparison.maxDiscount")}</span>}
                  </td>
                  <td>{round.status === 'current' ? '✅ ' + t('tokenPrograms.seedRound.comparison.active') : '⏳ ' + t('tokenPrograms.seedRound.comparison.upcoming')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Investment Tiers Section */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t("tokenPrograms.seedRound.tiers.badge")}</span>
          <h2 className="section-title">{t("tokenPrograms.seedRound.tiers.title")}</h2>
          <p className="section-subtitle">{t("tokenPrograms.seedRound.tiers.subtitle")}</p>
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
                  <div className="label">{t("tokenPrograms.seedRound.tiers.minInvestment")}</div>
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
                <button 
                  className="tier-btn" 
                  data-testid={`button-tier-inquiry-${tier.id}`}
                  onClick={() => setInquiryDialogOpen(true)}
                >
                  {t("tokenPrograms.seedRound.tiers.inquireBtn")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vesting Section */}
      <section className="section" id="vesting">
        <div className="section-header">
          <span className="section-badge">{t("tokenPrograms.seedRound.vestingSection.badge")}</span>
          <h2 className="section-title">{t("tokenPrograms.seedRound.vestingSection.title")}</h2>
          <p className="section-subtitle">{t("tokenPrograms.seedRound.vestingSection.subtitle")}</p>
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

      {/* Current Investors Section */}
      <section className="section" id="investors" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t("tokenPrograms.seedRound.investorsSection.badge")}</span>
          <h2 className="section-title">{t("tokenPrograms.seedRound.investorsSection.title")}</h2>
          <p className="section-subtitle">{t("tokenPrograms.seedRound.investorsSection.subtitle")}</p>
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
      <section className="section" id="process">
        <div className="section-header">
          <span className="section-badge">{t("tokenPrograms.seedRound.processSection.badge")}</span>
          <h2 className="section-title">{t("tokenPrograms.seedRound.processSection.title")}</h2>
          <p className="section-subtitle">{t("tokenPrograms.seedRound.processSection.subtitle")}</p>
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

      {/* Token Metrics Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t("tokenPrograms.seedRound.metrics.badge")}</span>
          <h2 className="section-title">{t("tokenPrograms.seedRound.metrics.title")}</h2>
          <p className="section-subtitle">{t("tokenPrograms.seedRound.metrics.subtitle")}</p>
        </div>

        <div className="metrics-grid">
          {tokenMetrics.map((metric, idx) => (
            <div key={idx} className="metric-card">
              <div className="metric-icon">{metric.icon}</div>
              <h4>{metric.title}</h4>
              <div className="value">{metric.value}</div>
              <p>{metric.desc}</p>
            </div>
          ))}
        </div>

        <div className="risk-section">
          <h4>{t("tokenPrograms.seedRound.risks.title")}</h4>
          <ul>
            {riskItems.map((risk, idx) => (
              <li key={idx}>{risk}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">{t("tokenPrograms.seedRound.faqSection.badge")}</span>
          <h2 className="section-title">{t("tokenPrograms.seedRound.faqSection.title")}</h2>
          <p className="section-subtitle">{t("tokenPrograms.seedRound.faqSection.subtitle")}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t("tokenPrograms.seedRound.faqSection.faq1.question")}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t("tokenPrograms.seedRound.faqSection.faq1.answer")}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t("tokenPrograms.seedRound.faqSection.faq2.question")}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t("tokenPrograms.seedRound.faqSection.faq2.answer")}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t("tokenPrograms.seedRound.faqSection.faq3.question")}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t("tokenPrograms.seedRound.faqSection.faq3.answer")}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t("tokenPrograms.seedRound.faqSection.faq4.question")}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t("tokenPrograms.seedRound.faqSection.faq4.answer")}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t("tokenPrograms.seedRound.faqSection.faq5.question")}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t("tokenPrograms.seedRound.faqSection.faq5.answer")}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t("tokenPrograms.seedRound.faqSection.faq6.question")}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t("tokenPrograms.seedRound.faqSection.faq6.answer")}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t("tokenPrograms.seedRound.faqSection.faq7.question")}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t("tokenPrograms.seedRound.faqSection.faq7.answer")}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t("tokenPrograms.seedRound.faqSection.faq8.question")}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t("tokenPrograms.seedRound.faqSection.faq8.answer")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t("tokenPrograms.seedRound.cta.title")}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t("tokenPrograms.seedRound.cta.subtitle")}<br />
            
          </p>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--dark)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-invest-now"
            onClick={() => setInquiryDialogOpen(true)}
          >
            {t("tokenPrograms.seedRound.cta.button")}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t("tokenPrograms.seedRound.footer.tagline")}<br />{t("tokenPrograms.seedRound.footer.slogan")}</p>
            <div className="social-links">
              <a href="#">𝕏</a>
              <a href="#">✈</a>
              <a href="#">💬</a>
              <a href="#">⌘</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>{t("tokenPrograms.seedRound.footer.product")}</h4>
            <ul>
              <li><Link href="/">{t("tokenPrograms.seedRound.footer.mainnet")}</Link></li>
              <li><Link href="/scan">{t("tokenPrograms.seedRound.footer.explorer")}</Link></li>
              <li><Link href="/app/bridge">{t("tokenPrograms.seedRound.footer.bridge")}</Link></li>
              <li><Link href="/app/staking">{t("tokenPrograms.seedRound.footer.staking")}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t("tokenPrograms.seedRound.footer.resources")}</h4>
            <ul>
              <li><Link href="/learn/whitepaper">{t("tokenPrograms.seedRound.footer.whitepaper")}</Link></li>
              <li><Link href="/developers/docs">{t("tokenPrograms.seedRound.footer.docs")}</Link></li>
              <li><a href="#">{t("tokenPrograms.seedRound.footer.github")}</a></li>
              <li><Link href="/security-audit">{t("tokenPrograms.seedRound.footer.auditReport")}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t("tokenPrograms.seedRound.footer.community")}</h4>
            <ul>
              <li><Link href="/community/news">{t("tokenPrograms.seedRound.footer.blog")}</Link></li>
              <li><a href="#">{t("tokenPrograms.seedRound.footer.ambassador")}</a></li>
              <li><a href="#">{t("tokenPrograms.seedRound.footer.grants")}</a></li>
              <li><Link href="/qna">{t("tokenPrograms.seedRound.footer.support")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t("tokenPrograms.seedRound.footer.copyright")}</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }}>{t("tokenPrograms.seedRound.footer.terms")}</Link>
            <Link href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }}>{t("tokenPrograms.seedRound.footer.privacy")}</Link>
          </div>
        </div>
      </footer>

      {/* Investment Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'white', fontSize: '1.5rem' }}>{t("tokenPrograms.seedRound.dialog.title")}</DialogTitle>
            <DialogDescription style={{ color: 'rgba(255,255,255,0.7)' }}>
              {t("tokenPrograms.seedRound.dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInquirySubmit} className="space-y-4" style={{ marginTop: '1rem' }}>
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: 'rgba(255,255,255,0.9)' }}>이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("tokenPrograms.seedRound.dialog.namePlaceholder")}
                data-testid="input-inquiry-name"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: 'rgba(255,255,255,0.9)' }}>이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="investor@example.com"
                data-testid="input-inquiry-email"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" style={{ color: 'rgba(255,255,255,0.9)' }}>회사/기관명</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t("tokenPrograms.seedRound.dialog.companyPlaceholder")}
                data-testid="input-inquiry-company"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentAmount" style={{ color: 'rgba(255,255,255,0.9)' }}>{t("tokenPrograms.seedRound.dialog.amountLabel")}</Label>
              <Input
                id="investmentAmount"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                placeholder="$50,000"
                data-testid="input-inquiry-amount"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" style={{ color: 'rgba(255,255,255,0.9)' }}>{t("tokenPrograms.seedRound.dialog.messageLabel")}</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t("tokenPrograms.seedRound.dialog.messagePlaceholder")}
                rows={4}
                data-testid="input-inquiry-message"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInquiryDialogOpen(false)}
                data-testid="button-cancel-inquiry"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={inquiryMutation.isPending}
                data-testid="button-submit-inquiry"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
              >
                {inquiryMutation.isPending ? t("tokenPrograms.seedRound.dialog.submitting") : t("tokenPrograms.seedRound.dialog.submitBtn")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Investment Memo Dialog */}
      <Dialog open={memoDialogOpen} onOpenChange={setMemoDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: 'white', maxHeight: '80vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'white', fontSize: '1.5rem' }}>{t("tokenPrograms.seedRound.memoDialog.title")}</DialogTitle>
            <DialogDescription style={{ color: 'rgba(255,255,255,0.7)' }}>
              {t("tokenPrograms.seedRound.memoDialog.projectOverview")}
            </DialogDescription>
          </DialogHeader>
          <div style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <h4 style={{ color: '#22c55e', marginBottom: '0.5rem', fontWeight: 600 }}>{t("tokenPrograms.seedRound.memoDialog.investmentHighlights")}</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', paddingLeft: '1.25rem' }}>
                <li>Token Price: <strong style={{ color: 'white' }}>$0.04</strong> (80% discount from market)</li>
                <li>총 배정량: <strong style={{ color: 'white' }}>{t("tokenPrograms.seedRound.hero.titleHighlight")}</strong></li>
                <li>하드캡: <strong style={{ color: 'white' }}>$20,000,000</strong></li>
                <li>Min Investment: <strong style={{ color: 'white' }}>$10,000</strong></li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 600 }}>{t("tokenPrograms.seedRound.vestingSection.title")}</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', paddingLeft: '1.25rem' }}>
                <li>Cliff Period: <strong style={{ color: 'white' }}>12 months</strong></li>
                <li>Initial Unlock: <strong style={{ color: 'white' }}>10%</strong> (TGE+12 months)</li>
                <li>Monthly Vesting: <strong style={{ color: 'white' }}>7.5%</strong> (12 months)</li>
                <li>Full Unlock: <strong style={{ color: 'white' }}>24 months</strong></li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 600 }}>{t("tokenPrograms.seedRound.processSection.title")}</h4>
              <ol style={{ color: 'rgba(255,255,255,0.8)', paddingLeft: '1.25rem' }}>
                <li>Submit Inquiry (1-3 days)</li>
                <li>KYC/AML Verification (3-5 days)</li>
                <li>SAFT 계약 체결 (1-2일)</li>
                <li>Fund Transfer (1-2 days)</li>
              </ol>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem', fontWeight: 600 }}>{t("tokenPrograms.seedRound.memoDialog.contact")}</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                이메일: <a href="mailto:invest@tburnchain.io" style={{ color: '#22c55e' }}>invest@tburnchain.io</a><br />
                텔레그램: <a href="https://t.me/tburnchain" style={{ color: '#22c55e' }}>@tburnchain</a>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMemoDialogOpen(false)}
              data-testid="button-close-memo"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              닫기
            </Button>
            <Button
              type="button"
              onClick={() => {
                setMemoDialogOpen(false);
                setInquiryDialogOpen(true);
              }}
              data-testid="button-memo-to-inquiry"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
            >
              {t("tokenPrograms.seedRound.connectWallet")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
