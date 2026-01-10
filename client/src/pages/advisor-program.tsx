import { useState } from "react";
import { Link } from "wouter";
import { TBurnLogo } from "@/components/tburn-logo";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

interface PartnershipStatsData {
  partnerships: {
    total: number;
    strategic: number;
    technical: number;
    marketing: number;
    allocation: string;
    distributed: string;
  };
  marketing: {
    totalBudget: string;
    spent: string;
    campaigns: number;
    activeCampaigns: number;
    reach: string;
    conversions: number;
  };
  advisors: {
    total: number;
    allocation: string;
    vesting: string;
    unlocked: number;
  };
  strategicPartners: Array<{
    name: string;
    type: string;
    allocation: string;
  }>;
}

interface PartnershipStatsResponse {
  success: boolean;
  data: PartnershipStatsData;
}

export default function AdvisorProgramPage() {
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<PartnershipStatsResponse>({
    queryKey: ['/api/token-programs/partnerships/stats'],
  });
  const advisorData = statsResponse?.data?.advisors;

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
      toast({ title: t('advisorProgram.wallet.disconnect'), description: t('advisorProgram.wallet.disconnectDesc') });
    } else {
      await connect("metamask");
      toast({ title: t('advisorProgram.wallet.connected'), description: t('advisorProgram.wallet.connectedDesc') });
    }
  };

  const handleApplyAdvisor = () => {
    scrollToSection('roles');
    toast({ title: t('advisorProgram.cta.applyAdvisor'), description: t('advisorProgram.cta.applyAdvisorDesc') });
  };

  const handleViewGuide = () => {
    scrollToSection('process');
    toast({ title: t('advisorProgram.cta.advisorGuide'), description: t('advisorProgram.cta.advisorGuideDesc') });
  };

  const handleApplyRole = (roleTitle: string) => {
    if (!isConnected) {
      toast({ 
        title: t('advisorProgram.wallet.required'), 
        description: t('advisorProgram.wallet.requiredDesc'),
        variant: "destructive"
      });
      return;
    }
    toast({ 
      title: t('advisorProgram.roleApply.title', { role: roleTitle }), 
      description: t('advisorProgram.roleApply.description', { role: roleTitle })
    });
  };

  const handleApplyTier = (tierName: string, incentive: string) => {
    if (!isConnected) {
      toast({ 
        title: t('advisorProgram.wallet.required'), 
        description: t('advisorProgram.wallet.requiredDesc'),
        variant: "destructive"
      });
      return;
    }
    toast({ 
      title: t('advisorProgram.tierApply.title', { tier: tierName }), 
      description: t('advisorProgram.tierApply.description', { tier: tierName, incentive })
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({ title: platform, description: platform });
  };

  const advisorPreviewKeys = ["jk", "sp", "ml", "ec"];
  const advisorPreviewTypes = ["tech", "business", "legal", "academic"];

  const distributionKeys = ["tech", "business", "legal", "academic", "industry"];
  const distributionIcons: { [key: string]: string } = {
    tech: "💻",
    business: "📊",
    legal: "⚖️",
    academic: "🎓",
    industry: "🏭"
  };

  const roleKeys = ["tech", "business", "legal", "academic"];
  const roleIcons: { [key: string]: string } = {
    tech: "💻",
    business: "📊",
    legal: "⚖️",
    academic: "🎓"
  };

  const tierKeys = ["principal", "senior", "advisor"];
  const tierIcons: { [key: string]: string } = {
    principal: "👑",
    senior: "⭐",
    advisor: "💡"
  };

  const currentAdvisors = [
    { initial: "JK", name: "Dr. John Kim", title: "CTO, Tech Corp", orgKey: "tech", type: "tech", tier: "principal" },
    { initial: "SP", name: "Sarah Park", title: "CEO, Growth VC", orgKey: "business", type: "business", tier: "principal" },
    { initial: "ML", name: "Michael Lee", title: "Partner, Law Firm", orgKey: "legal", type: "legal", tier: "senior" },
    { initial: "EC", name: "Prof. Emma Choi", title: "Professor, KAIST", orgKey: "academic", type: "academic", tier: "senior" },
  ];

  const processStepKeys = ["step1", "step2", "step3", "step4", "step5"];
  const processStepIcons = ["📋", "🔍", "💬", "📝", "🚀"];

  const compensationKeys = ["token", "bonus", "special"];
  const compensationIcons: { [key: string]: string } = {
    token: "💰",
    bonus: "📈",
    special: "🎁"
  };

  return (
    <div className="advisor-program-page">
      <style>{`
        .advisor-program-page {
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
          --pink: #EC4899;
          --emerald: #10B981;
          --indigo: #6366F1;
          --amber: #F59E0B;
          --teal: #14B8A6;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-advisor: linear-gradient(135deg, #F59E0B 0%, #D4AF37 100%);
          --gradient-tech: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
          --gradient-business: linear-gradient(135deg, #10B981 0%, #14B8A6 100%);
          --gradient-legal: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
          --gradient-academic: linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes lightbulb { 0%, 100% { filter: brightness(1); transform: scale(1); } 50% { filter: brightness(1.3); transform: scale(1.1); } }

        .advisor-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(245, 158, 11, 0.2);
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
        .nav-links a:hover { color: var(--amber); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-advisor);
          color: var(--dark);
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
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
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--amber);
          margin-bottom: 2rem;
        }

        .badge .lightbulb-icon { animation: lightbulb 2s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-advisor);
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

        .advisor-showcase {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .advisor-preview {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .advisor-preview:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .advisor-preview-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--white);
        }

        .advisor-preview-avatar.tech { background: var(--gradient-tech); }
        .advisor-preview-avatar.business { background: var(--gradient-business); }
        .advisor-preview-avatar.legal { background: var(--gradient-legal); }
        .advisor-preview-avatar.academic { background: var(--gradient-academic); }

        .advisor-preview-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.25rem; }
        .advisor-preview-role { font-size: 0.75rem; color: var(--gray); }

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
          border-color: var(--amber);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-advisor);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-advisor);
          color: var(--dark);
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
          box-shadow: 0 20px 60px rgba(245, 158, 11, 0.3);
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

        .btn-secondary:hover { border-color: var(--amber); color: var(--amber); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(245, 158, 11, 0.15);
          color: var(--amber);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
        .section-subtitle { color: var(--light-gray); font-size: 1.125rem; max-width: 600px; margin: 0 auto; }

        .distribution-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .dist-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .dist-card:hover {
          transform: translateY(-5px);
          border-color: var(--amber);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.tech::before { background: var(--gradient-tech); }
        .dist-card.business::before { background: var(--gradient-business); }
        .dist-card.legal::before { background: var(--gradient-legal); }
        .dist-card.academic::before { background: var(--gradient-academic); }
        .dist-card.industry::before { background: var(--gradient-advisor); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .role-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .role-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          border-color: var(--amber);
        }

        .role-header {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .role-card.tech .role-header { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), transparent); }
        .role-card.business .role-header { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), transparent); }
        .role-card.legal .role-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), transparent); }
        .role-card.academic .role-header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), transparent); }

        .role-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .role-card.tech .role-icon { background: rgba(59, 130, 246, 0.2); }
        .role-card.business .role-icon { background: rgba(16, 185, 129, 0.2); }
        .role-card.legal .role-icon { background: rgba(139, 92, 246, 0.2); }
        .role-card.academic .role-icon { background: rgba(6, 182, 212, 0.2); }

        .role-info h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
        .role-info p { font-size: 0.9rem; color: var(--gray); }

        .role-content { padding: 0 2rem 2rem; }

        .role-rewards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .role-reward-box {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          text-align: center;
        }

        .role-reward-box .value { font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-bottom: 0.25rem; }
        .role-reward-box .label { font-size: 0.75rem; color: var(--gray); }

        .role-responsibilities { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .role-responsibilities li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .role-responsibilities li:last-child { border-bottom: none; }
        .role-responsibilities li::before { content: '✓'; color: var(--success); }

        .role-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          color: var(--white);
        }

        .role-card.tech .role-btn { background: var(--gradient-tech); }
        .role-card.business .role-btn { background: var(--gradient-business); }
        .role-card.legal .role-btn { background: var(--gradient-legal); }
        .role-card.academic .role-btn { background: var(--gradient-academic); }

        .role-btn:hover { transform: scale(1.02); }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
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

        .tier-card.principal { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.senior { border-color: var(--amber); }
        .tier-card.advisor { border-color: var(--cyan); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.principal .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.senior .tier-header { background: linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%); }
        .tier-card.advisor .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.principal .tier-name { color: var(--gold); }
        .tier-card.senior .tier-name { color: var(--amber); }
        .tier-card.advisor .tier-name { color: var(--cyan); }

        .tier-subtitle { font-size: 0.8rem; color: var(--gray); }

        .tier-content { padding: 1.5rem; }

        .tier-incentive {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .tier-incentive-label { font-size: 0.75rem; color: var(--gray); margin-bottom: 0.25rem; }
        .tier-incentive-value { font-size: 1.5rem; font-weight: 800; }

        .tier-card.principal .tier-incentive-value { color: var(--gold); }
        .tier-card.senior .tier-incentive-value { color: var(--amber); }
        .tier-card.advisor .tier-incentive-value { color: var(--cyan); }

        .tier-requirement {
          font-size: 0.8rem;
          color: var(--gray);
          text-align: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .tier-benefits { list-style: none; margin-bottom: 1rem; padding: 0; }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 0.85rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-benefits li:last-child { border-bottom: none; }
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

        .tier-card.principal .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.senior .tier-btn { background: var(--gradient-advisor); color: var(--dark); }
        .tier-card.advisor .tier-btn { background: var(--gradient-academic); color: var(--white); }

        .tier-btn:hover { transform: scale(1.02); }

        .advisors-showcase {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .advisors-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .advisor-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .advisor-card:hover {
          background: rgba(245, 158, 11, 0.05);
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .advisor-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          position: relative;
          color: var(--white);
        }

        .advisor-avatar.tech { background: var(--gradient-tech); }
        .advisor-avatar.business { background: var(--gradient-business); }
        .advisor-avatar.legal { background: var(--gradient-legal); }
        .advisor-avatar.academic { background: var(--gradient-academic); }

        .advisor-tier-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          border: 2px solid var(--dark-card);
        }

        .advisor-tier-badge.principal { background: var(--gold); }
        .advisor-tier-badge.senior { background: var(--amber); }

        .advisor-card-name { font-weight: 700; margin-bottom: 0.25rem; }
        .advisor-card-title { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }
        .advisor-card-org { font-size: 0.75rem; color: var(--amber); }

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
          background: linear-gradient(90deg, var(--blue), var(--purple), var(--amber), var(--gold), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--blue); }
        .process-item:nth-child(2) .process-dot { background: var(--purple); }
        .process-item:nth-child(3) .process-dot { background: var(--amber); }
        .process-item:nth-child(4) .process-dot { background: var(--gold); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--amber); font-weight: 600; margin-top: 0.5rem; }

        .compensation-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .compensation-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .compensation-card:hover {
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .compensation-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(212, 175, 55, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .compensation-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; }
        .compensation-card p { font-size: 0.9rem; color: var(--light-gray); margin-bottom: 1rem; }
        .compensation-value { font-size: 1.25rem; font-weight: 800; color: var(--amber); }

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

        .faq-chevron { color: var(--amber); transition: transform 0.3s; }
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
          background: var(--gradient-advisor);
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

        .social-links a:hover { background: var(--amber); color: var(--dark); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--amber); }

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
          .roles-grid, .tiers-grid, .compensation-grid { grid-template-columns: 1fr; }
          .advisors-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .advisor-showcase { grid-template-columns: repeat(2, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .advisor-showcase { grid-template-columns: 1fr; }
          .advisors-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="advisor-header">
        <div className="header-container">
          <a href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </a>
          <nav className="nav-links">
            <a 
              href="#roles" 
              onClick={(e) => { e.preventDefault(); scrollToSection('roles'); }}
              data-testid="nav-roles"
            >{t('advisorProgram.nav.advisorRoles')}</a>
            <a 
              href="#tiers" 
              onClick={(e) => { e.preventDefault(); scrollToSection('tiers'); }}
              data-testid="nav-tiers"
            >{t('advisorProgram.nav.tiers')}</a>
            <a 
              href="#advisors" 
              onClick={(e) => { e.preventDefault(); scrollToSection('advisors'); }}
              data-testid="nav-advisors"
            >{t('advisorProgram.nav.currentAdvisors')}</a>
            <a 
              href="#process" 
              onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}
              data-testid="nav-process"
            >{t('advisorProgram.nav.applicationProcess')}</a>
            <a 
              href="#faq" 
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="nav-faq"
            >{t('advisorProgram.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleWalletClick}
            >
              {isConnected ? `${formatAddress(address || '')}` : t('advisorProgram.wallet.connect')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="lightbulb-icon">💡</span> {t('advisorProgram.badge')}
          </div>
          <h1>
            {t('advisorProgram.hero.title1')}<br />
            <span className="gradient-text">{t('advisorProgram.hero.title2')}</span> {t('advisorProgram.hero.title3')}
          </h1>
          <p className="hero-subtitle">
            {t('advisorProgram.hero.subtitle')}
          </p>

          <div className="advisor-showcase" data-testid="advisor-showcase">
            {advisorPreviewKeys.map((key, idx) => (
              <div key={idx} className="advisor-preview">
                <div className={`advisor-preview-avatar ${advisorPreviewTypes[idx]}`}>
                  {t(`advisorProgram.advisorPreviews.${key}.initial`)}
                </div>
                <div className="advisor-preview-name">{t(`advisorProgram.advisorPreviews.${key}.name`)}</div>
                <div className="advisor-preview-role">{t(`advisorProgram.advisorPreviews.${key}.role`)}</div>
              </div>
            ))}
          </div>

          <div className="stats-grid" data-testid="advisor-stats-grid">
            <div className="stat-card" data-testid="stat-total-advisor">
              <div className="stat-value">
                {isLoadingStats ? '...' : advisorData?.allocation ? `${(parseInt(advisorData.allocation) / 1000000).toFixed(0)}M` : '200M'}
              </div>
              <div className="stat-label">{t('advisorProgram.stats.totalBudget')}</div>
            </div>
            <div className="stat-card" data-testid="stat-advisors">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${advisorData?.total || 12}+`}
              </div>
              <div className="stat-label">{t('advisorProgram.stats.currentAdvisors')}</div>
            </div>
            <div className="stat-card" data-testid="stat-fields">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${advisorData?.unlocked || 8}`}
              </div>
              <div className="stat-label">{t('advisorProgram.stats.activeAdvisors')}</div>
            </div>
            <div className="stat-card" data-testid="stat-max-reward">
              <div className="stat-value">
                {isLoadingStats ? '...' : advisorData?.vesting || '24'}
              </div>
              <div className="stat-label">{t('advisorProgram.stats.vestingPeriod')}</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply"
              onClick={handleApplyAdvisor}
            >
              {t('advisorProgram.cta.applyButton')}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-view-guide"
              onClick={handleViewGuide}
            >
              {t('advisorProgram.cta.guideButton')}
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t('advisorProgram.distribution.badge')}</span>
          <h2 className="section-title">{t('advisorProgram.distribution.title')}</h2>
          <p className="section-subtitle">{t('advisorProgram.distribution.subtitle')}</p>
        </div>

        <div className="distribution-grid">
          {distributionKeys.map(key => (
            <div key={key} className={`dist-card ${key}`} data-testid={`dist-${key}`}>
              <div className="dist-icon">{distributionIcons[key]}</div>
              <div className="dist-name">{t(`advisorProgram.distribution.items.${key}.name`)}</div>
              <div className="dist-amount">{t(`advisorProgram.distribution.items.${key}.amount`)}</div>
              <div className="dist-percent">{t(`advisorProgram.distribution.items.${key}.percent`)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Advisor Roles Section */}
      <section className="section" id="roles" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('advisorProgram.roles.badge')}</span>
          <h2 className="section-title">{t('advisorProgram.roles.title')}</h2>
          <p className="section-subtitle">{t('advisorProgram.roles.subtitle')}</p>
        </div>

        <div className="roles-grid">
          {roleKeys.map(key => (
            <div key={key} className={`role-card ${key}`} data-testid={`role-${key}`}>
              <div className="role-header">
                <div className="role-icon">{roleIcons[key]}</div>
                <div className="role-info">
                  <h3>{t(`advisorProgram.roles.items.${key}.title`)}</h3>
                  <p>{t(`advisorProgram.roles.items.${key}.subtitle`)}</p>
                </div>
              </div>
              <div className="role-content">
                <div className="role-rewards">
                  <div className="role-reward-box">
                    <div className="value">{t(`advisorProgram.roles.items.${key}.reward1Value`)}</div>
                    <div className="label">{t(`advisorProgram.roles.items.${key}.reward1Label`)}</div>
                  </div>
                  <div className="role-reward-box">
                    <div className="value">{t(`advisorProgram.roles.items.${key}.reward2Value`)}</div>
                    <div className="label">{t(`advisorProgram.roles.items.${key}.reward2Label`)}</div>
                  </div>
                </div>
                <ul className="role-responsibilities">
                  <li>{t(`advisorProgram.roles.items.${key}.resp1`)}</li>
                  <li>{t(`advisorProgram.roles.items.${key}.resp2`)}</li>
                  <li>{t(`advisorProgram.roles.items.${key}.resp3`)}</li>
                  <li>{t(`advisorProgram.roles.items.${key}.resp4`)}</li>
                </ul>
                <button 
                  className="role-btn"
                  data-testid={`button-apply-role-${key}`}
                  onClick={() => handleApplyRole(t(`advisorProgram.roles.items.${key}.title`))}
                >
                  {t('advisorProgram.roles.applyButton')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advisor Tiers Section */}
      <section className="section" id="tiers">
        <div className="section-header">
          <span className="section-badge">{t('advisorProgram.tiers.badge')}</span>
          <h2 className="section-title">{t('advisorProgram.tiers.title')}</h2>
          <p className="section-subtitle">{t('advisorProgram.tiers.subtitle')}</p>
        </div>

        <div className="tiers-grid">
          {tierKeys.map(key => (
            <div key={key} className={`tier-card ${key}`} data-testid={`tier-${key}`}>
              <div className="tier-header">
                <div className="tier-icon">{tierIcons[key]}</div>
                <h3 className="tier-name">{t(`advisorProgram.tiers.items.${key}.name`)}</h3>
                <p className="tier-subtitle">{t(`advisorProgram.tiers.items.${key}.subtitle`)}</p>
              </div>
              <div className="tier-content">
                <div className="tier-incentive">
                  <div className="tier-incentive-label">{t('advisorProgram.tiers.incentiveLabel')}</div>
                  <div className="tier-incentive-value">{t(`advisorProgram.tiers.items.${key}.incentive`)} TBURN</div>
                </div>
                <div className="tier-requirement">{t(`advisorProgram.tiers.items.${key}.requirement`)}</div>
                <ul className="tier-benefits">
                  <li>{t(`advisorProgram.tiers.items.${key}.benefit1`)}</li>
                  <li>{t(`advisorProgram.tiers.items.${key}.benefit2`)}</li>
                  <li>{t(`advisorProgram.tiers.items.${key}.benefit3`)}</li>
                  <li>{t(`advisorProgram.tiers.items.${key}.benefit4`)}</li>
                  <li>{t(`advisorProgram.tiers.items.${key}.benefit5`)}</li>
                </ul>
                <button 
                  className="tier-btn"
                  data-testid={`button-apply-tier-${key}`}
                  onClick={() => handleApplyTier(t(`advisorProgram.tiers.items.${key}.name`), t(`advisorProgram.tiers.items.${key}.incentive`))}
                >
                  {t('advisorProgram.tiers.applyButton')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Current Advisors Section */}
      <section className="section" id="advisors" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('advisorProgram.currentAdvisors.badge')}</span>
          <h2 className="section-title">{t('advisorProgram.currentAdvisors.title')}</h2>
          <p className="section-subtitle">{t('advisorProgram.currentAdvisors.subtitle')}</p>
        </div>

        <div className="advisors-showcase">
          <div className="advisors-grid">
            {currentAdvisors.map((advisor, idx) => (
              <div key={idx} className="advisor-card">
                <div className={`advisor-avatar ${advisor.type}`}>
                  {advisor.initial}
                  <span className={`advisor-tier-badge ${advisor.tier}`}>
                    {advisor.tier === 'principal' ? '👑' : '⭐'}
                  </span>
                </div>
                <div className="advisor-card-name">{advisor.name}</div>
                <div className="advisor-card-title">{advisor.title}</div>
                <div className="advisor-card-org">{t(`advisorProgram.distribution.items.${advisor.orgKey}.name`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section" id="process">
        <div className="section-header">
          <span className="section-badge">{t('advisorProgram.process.badge')}</span>
          <h2 className="section-title">{t('advisorProgram.process.title')}</h2>
          <p className="section-subtitle">{t('advisorProgram.process.subtitle')}</p>
        </div>

        <div className="process-container">
          <div className="process-timeline">
            {processStepKeys.map((key, idx) => (
              <div key={idx} className="process-item">
                <div className="process-dot">{processStepIcons[idx]}</div>
                <div className="process-title">{t(`advisorProgram.process.steps.${key}.title`)}</div>
                <div className="process-desc">{t(`advisorProgram.process.steps.${key}.desc`)}</div>
                <div className="process-duration">{t(`advisorProgram.process.steps.${key}.duration`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compensation Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('advisorProgram.compensation.badge')}</span>
          <h2 className="section-title">{t('advisorProgram.compensation.title')}</h2>
          <p className="section-subtitle">{t('advisorProgram.compensation.subtitle')}</p>
        </div>

        <div className="compensation-grid">
          {compensationKeys.map((key) => (
            <div key={key} className="compensation-card">
              <div className="compensation-icon">{compensationIcons[key]}</div>
              <h4>{t(`advisorProgram.compensation.items.${key}.title`)}</h4>
              <p>{t(`advisorProgram.compensation.items.${key}.desc`)}</p>
              <div className="compensation-value">{t(`advisorProgram.compensation.items.${key}.value`)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">{t('advisorProgram.faq.badge')}</span>
          <h2 className="section-title">{t('advisorProgram.faq.title')}</h2>
          <p className="section-subtitle">{t('advisorProgram.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <div key={num} className={`faq-item ${activeFaq === `faq-${num}` ? 'active' : ''}`} data-testid={`faq-item-${num}`}>
              <div className="faq-question" onClick={() => toggleFaq(`faq-${num}`)}>
                <h4>{t(`advisorProgram.faq.items.q${num}.question`)}</h4>
                <span className="faq-chevron">▼</span>
              </div>
              <div className="faq-answer">
                <p>{t(`advisorProgram.faq.items.q${num}.answer`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--dark)' }}>{t('advisorProgram.ctaSection.title')}</h2>
          <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('advisorProgram.ctaSection.subtitle1')}<br />
            {t('advisorProgram.ctaSection.subtitle2')}
          </p>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--dark)', color: 'var(--white)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-apply"
            onClick={() => { 
              scrollToSection('roles'); 
              toast({ title: t('advisorProgram.cta.applyAdvisor'), description: t('advisorProgram.ctaSection.toastDesc') }); 
            }}
          >
            {t('advisorProgram.ctaSection.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('advisorProgram.footer.tagline1')}<br />{t('advisorProgram.footer.tagline2')}</p>
            <div className="social-links">
              <a 
                href="https://x.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('Twitter', 'https://x.com/tburnchain'); }}
                data-testid="footer-link-twitter"
              >𝕏</a>
              <a 
                href="https://t.me/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('Telegram', 'https://t.me/tburnchain'); }}
                data-testid="footer-link-telegram"
              >✈</a>
              <a 
                href="https://discord.gg/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('Discord', 'https://discord.gg/tburnchain'); }}
                data-testid="footer-link-discord"
              >💬</a>
              <a 
                href="https://github.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('GitHub', 'https://github.com/tburnchain'); }}
                data-testid="footer-link-github"
              >⌘</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>{t('advisorProgram.footer.product')}</h4>
            <ul>
              <li><a href="/" data-testid="footer-link-mainnet">{t('advisorProgram.footer.mainnet')}</a></li>
              <li><a href="/scan" data-testid="footer-link-explorer">{t('advisorProgram.footer.explorer')}</a></li>
              <li><a href="/app/bridge" data-testid="footer-link-bridge">{t('advisorProgram.footer.bridge')}</a></li>
              <li><a href="/app/staking" data-testid="footer-link-staking">{t('advisorProgram.footer.staking')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('advisorProgram.footer.resources')}</h4>
            <ul>
              <li><a href="/learn/whitepaper" data-testid="footer-link-whitepaper">{t('advisorProgram.footer.whitepaper')}</a></li>
              <li><a href="/developers/docs" data-testid="footer-link-docs">{t('advisorProgram.footer.docs')}</a></li>
              <li><a 
                href="https://github.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('GitHub', 'https://github.com/tburnchain'); }}
                data-testid="footer-link-github-resources"
              >GitHub</a></li>
              <li><a href="/security-audit" data-testid="footer-link-audit">{t('advisorProgram.footer.auditReport')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('advisorProgram.footer.community')}</h4>
            <ul>
              <li><a href="/community/news" data-testid="footer-link-blog">{t('advisorProgram.footer.blog')}</a></li>
              <li><a href="/marketing-program" data-testid="footer-link-ambassador">{t('advisorProgram.footer.ambassador')}</a></li>
              <li><a href="/ecosystem-fund" data-testid="footer-link-grants">{t('advisorProgram.footer.grants')}</a></li>
              <li><a href="/qna" data-testid="footer-link-support">{t('advisorProgram.footer.support')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('advisorProgram.footer.copyright')}</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">{t('advisorProgram.footer.terms')}</a>
            <a href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">{t('advisorProgram.footer.privacy')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
