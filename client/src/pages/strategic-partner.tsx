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

export default function StrategicPartnerPage() {
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [activeTab, setActiveTab] = useState("enterprise");
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<PartnershipStatsResponse>({
    queryKey: ['/api/token-programs/partnerships/stats'],
  });
  const partnershipData = statsResponse?.data?.partnerships;

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
      toast({ title: t('strategicPartner.wallet.disconnect'), description: t('strategicPartner.wallet.disconnectDesc') });
    } else {
      await connect("metamask");
      toast({ title: t('strategicPartner.wallet.connected'), description: t('strategicPartner.wallet.connectedDesc') });
    }
  };

  const handleApplyPartnership = () => {
    scrollToSection('tiers');
    toast({ title: t('strategicPartner.cta.partnershipInquiry'), description: t('strategicPartner.cta.partnershipInquiryDesc') });
  };

  const handleViewGuide = () => {
    scrollToSection('types');
    toast({ title: t('strategicPartner.cta.enterpriseGuide'), description: t('strategicPartner.cta.enterpriseGuideDesc') });
  };

  const handleInquireTier = (tierName: string, incentive: string) => {
    if (!isConnected) {
      toast({ 
        title: t('strategicPartner.wallet.required'), 
        description: t('strategicPartner.wallet.requiredDesc'),
        variant: "destructive"
      });
      return;
    }
    toast({ 
      title: t('strategicPartner.tierInquiry.title'), 
      description: t('strategicPartner.tierInquiry.description', { tier: tierName, incentive })
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({ title: platform, description: `${platform}` });
  };

  const enterpriseLogos = [
    { icon: "🏛️", nameKey: "enterprise" },
    { icon: "🔗", nameKey: "protocol" },
    { icon: "💰", nameKey: "institutional" },
    { icon: "🏢", nameKey: "corporate" },
    { icon: "🎓", nameKey: "research" },
  ];

  const distributions = [
    { id: "enterprise", icon: "🏛️", nameKey: "enterprise", amountKey: "enterpriseAmount", percent: "40%" },
    { id: "protocol", icon: "🔗", nameKey: "protocol", amountKey: "protocolAmount", percent: "20%" },
    { id: "institutional", icon: "💰", nameKey: "institutional", amountKey: "institutionalAmount", percent: "20%" },
    { id: "government", icon: "🏢", nameKey: "government", amountKey: "governmentAmount", percent: "10%" },
    { id: "academic", icon: "🎓", nameKey: "academic", amountKey: "academicAmount", percent: "10%" },
  ];

  const partnerTiers = [
    { id: "diamond", icon: "💎", color: "#B9F2FF" },
    { id: "platinum", icon: "🏆", color: "#E5E4E2" },
    { id: "gold", icon: "👑", color: "#D4AF37" },
    { id: "silver", icon: "🥈", color: "#C0C0C0" },
  ];

  const partnershipTypeKeys = ["enterprise", "protocol", "institutional", "government", "academic", "global"];
  const partnershipTypeIcons: { [key: string]: string } = {
    enterprise: "🏛️",
    protocol: "🔗",
    institutional: "💰",
    government: "🏢",
    academic: "🎓",
    global: "🌐"
  };

  const processStepKeys = ["step1", "step2", "step3", "step4", "step5"];
  const processStepIcons = ["📋", "🔍", "💼", "📝", "🚀"];

  const benefitKeys = ["techSupport", "growth", "security", "networking", "exclusive", "data"];
  const benefitIcons: { [key: string]: string } = {
    techSupport: "🔧",
    growth: "📈",
    security: "🛡️",
    networking: "🤝",
    exclusive: "💎",
    data: "📊"
  };

  const currentPartnerKeys = ["partner1", "partner2", "partner3", "partner4"];
  const currentPartnerIcons: { [key: string]: string } = {
    partner1: "🏛️",
    partner2: "🔗",
    partner3: "💰",
    partner4: "🏢"
  };
  const currentPartnerTiers: { [key: string]: string } = {
    partner1: "diamond",
    partner2: "platinum",
    partner3: "platinum",
    partner4: "gold"
  };
  const currentPartnerInvestments: { [key: string]: string } = {
    partner1: "$15M",
    partner2: "$8M",
    partner3: "$12M",
    partner4: "$2M"
  };
  const currentPartnerSince: { [key: string]: string } = {
    partner1: "2024.01",
    partner2: "2024.03",
    partner3: "2024.02",
    partner4: "2024.04"
  };

  const useCaseKeys = ["enterprise", "protocol", "institutional"] as const;

  return (
    <div className="strategic-partner-page">
      <style>{`
        .strategic-partner-page {
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
          --diamond: #B9F2FF;
          --platinum: #E5E4E2;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-strategic: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
          --gradient-diamond: linear-gradient(135deg, #B9F2FF 0%, #7DD3FC 50%, #B9F2FF 100%);
          --gradient-platinum: linear-gradient(135deg, #E5E4E2 0%, #A9A9A9 50%, #E5E4E2 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes diamondShine { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.3); } }
        @keyframes building { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        .strategic-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(26, 54, 93, 0.3);
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
        .nav-links a:hover { color: var(--gold); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-strategic);
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
          box-shadow: 0 10px 40px rgba(26, 54, 93, 0.4);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(26, 54, 93, 0.3) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(26, 54, 93, 0.25) 0%, transparent 70%);
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
          background: rgba(26, 54, 93, 0.3);
          border: 1px solid rgba(26, 54, 93, 0.5);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--gold);
          margin-bottom: 2rem;
        }

        .badge .building-icon { animation: building 2s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-gold);
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

        .enterprise-banner {
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.2), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(26, 54, 93, 0.4);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .enterprise-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .enterprise-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .enterprise-logo-icon {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          transition: all 0.3s;
        }

        .enterprise-logo-icon:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: var(--gold);
          transform: scale(1.1);
        }

        .enterprise-logo-name { font-size: 0.75rem; color: var(--gray); }

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
          border-color: var(--gold);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-gold);
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
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
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

        .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(26, 54, 93, 0.3);
          color: var(--gold);
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
          border-color: var(--gold);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.enterprise::before { background: var(--gradient-strategic); }
        .dist-card.protocol::before { background: linear-gradient(90deg, var(--purple), var(--indigo)); }
        .dist-card.institutional::before { background: var(--gradient-gold); }
        .dist-card.government::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }
        .dist-card.academic::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--gold); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

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

        .tier-card.diamond { border-color: var(--diamond); box-shadow: 0 0 40px rgba(185, 242, 255, 0.2); }
        .tier-card.platinum { border-color: var(--platinum); }
        .tier-card.gold { border-color: var(--gold); }
        .tier-card.silver { border-color: #C0C0C0; }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.diamond .tier-header { background: linear-gradient(180deg, rgba(185, 242, 255, 0.15) 0%, transparent 100%); }
        .tier-card.platinum .tier-header { background: linear-gradient(180deg, rgba(229, 228, 226, 0.1) 0%, transparent 100%); }
        .tier-card.gold .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.silver .tier-header { background: linear-gradient(180deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-card.diamond .tier-icon { animation: diamondShine 2s ease-in-out infinite; }

        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.diamond .tier-name { color: var(--diamond); }
        .tier-card.platinum .tier-name { color: var(--platinum); }
        .tier-card.gold .tier-name { color: var(--gold); }
        .tier-card.silver .tier-name { color: #C0C0C0; }

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
        .tier-incentive-value { font-size: 1.25rem; font-weight: 800; }

        .tier-card.diamond .tier-incentive-value { color: var(--diamond); }
        .tier-card.platinum .tier-incentive-value { color: var(--platinum); }
        .tier-card.gold .tier-incentive-value { color: var(--gold); }
        .tier-card.silver .tier-incentive-value { color: #C0C0C0; }

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

        .tier-card.diamond .tier-btn { background: var(--gradient-diamond); color: var(--dark); }
        .tier-card.platinum .tier-btn { background: var(--gradient-platinum); color: var(--dark); }
        .tier-card.gold .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.silver .tier-btn { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }

        .tier-btn:hover { transform: scale(1.02); }

        .partnership-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .partnership-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          transition: all 0.3s;
        }

        .partnership-card:hover {
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .partnership-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.3), rgba(59, 130, 246, 0.2));
        }

        .partnership-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .partnership-card p { font-size: 0.9rem; color: var(--gray); margin-bottom: 1.5rem; }

        .partnership-features { list-style: none; padding: 0; }

        .partnership-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .partnership-features li::before { content: '✓'; color: var(--success); }

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
          background: linear-gradient(90deg, var(--navy), var(--blue), var(--indigo), var(--gold), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--navy); }
        .process-item:nth-child(2) .process-dot { background: var(--blue); }
        .process-item:nth-child(3) .process-dot { background: var(--indigo); }
        .process-item:nth-child(4) .process-dot { background: var(--gold); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--gold); font-weight: 600; margin-top: 0.5rem; }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .benefit-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .benefit-card:hover {
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .benefit-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(245, 158, 11, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .benefit-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; }
        .benefit-card p { font-size: 0.9rem; color: var(--light-gray); }

        .use-cases-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .use-case-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .use-case-tab {
          flex: 1;
          padding: 1.5rem;
          background: transparent;
          border: none;
          color: var(--light-gray);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border-bottom: 2px solid transparent;
        }

        .use-case-tab.active {
          color: var(--gold);
          background: rgba(212, 175, 55, 0.05);
          border-bottom-color: var(--gold);
        }

        .use-case-content { padding: 2rem; }

        .use-case-item {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: center;
        }

        .use-case-info h4 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .use-case-info p { color: var(--light-gray); margin-bottom: 1.5rem; line-height: 1.8; }

        .use-case-features { list-style: none; padding: 0; }

        .use-case-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.95rem;
          color: var(--light-gray);
        }

        .use-case-features li::before { content: '✓'; color: var(--gold); }

        .use-case-image {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 2rem;
        }

        .stats-display {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .use-case-stat {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          text-align: center;
        }

        .use-case-stat .value { font-size: 1.75rem; font-weight: 800; color: var(--gold); margin-bottom: 0.25rem; }
        .use-case-stat .label { font-size: 0.8rem; color: var(--gray); }

        .partners-showcase {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .partner-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .partner-item:hover {
          background: rgba(212, 175, 55, 0.05);
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .partner-item-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .partner-item-logo {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.3), rgba(59, 130, 246, 0.2));
        }

        .partner-item-info h5 { font-size: 1rem; font-weight: 700; }
        .partner-item-info p { font-size: 0.75rem; color: var(--gray); }

        .partner-item-tier {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .partner-item-tier.diamond { background: rgba(185, 242, 255, 0.2); color: var(--diamond); }
        .partner-item-tier.platinum { background: rgba(229, 228, 226, 0.2); color: var(--platinum); }
        .partner-item-tier.gold { background: rgba(212, 175, 55, 0.2); color: var(--gold); }

        .partner-item-stats {
          display: flex;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
        }

        .partner-item-stats .label { color: var(--gray); }
        .partner-item-stats .value { color: var(--gold); font-weight: 600; }

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

        .faq-chevron { color: var(--gold); transition: transform 0.3s; }
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
          background: var(--gradient-strategic);
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

        .social-links a:hover { background: var(--gold); color: var(--dark); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--gold); }

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
          .partnership-types-grid, .benefits-grid { grid-template-columns: repeat(2, 1fr); }
          .partners-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .use-case-item { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .tiers-grid, .partnership-types-grid, .benefits-grid { grid-template-columns: 1fr; }
          .partners-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="strategic-header">
        <div className="header-container">
          <a href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </a>
          <nav className="nav-links">
            <a 
              href="#tiers" 
              onClick={(e) => { e.preventDefault(); scrollToSection('tiers'); }}
              data-testid="nav-tiers"
            >{t('strategicPartner.nav.partnerTiers')}</a>
            <a 
              href="#types" 
              onClick={(e) => { e.preventDefault(); scrollToSection('types'); }}
              data-testid="nav-types"
            >{t('strategicPartner.nav.partnershipTypes')}</a>
            <a 
              href="#benefits" 
              onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}
              data-testid="nav-benefits"
            >{t('strategicPartner.nav.benefits')}</a>
            <a 
              href="#use-cases" 
              onClick={(e) => { e.preventDefault(); scrollToSection('use-cases'); }}
              data-testid="nav-use-cases"
            >{t('strategicPartner.nav.useCases')}</a>
            <a 
              href="#faq" 
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="nav-faq"
            >{t('strategicPartner.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleWalletClick}
            >
              {isConnected ? `${formatAddress(address || '')}` : t('strategicPartner.wallet.connect')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="building-icon">🏛️</span> {t('strategicPartner.badge')}
          </div>
          <h1>
            {t('strategicPartner.hero.title1')}<br />
            <span className="gradient-text">{t('strategicPartner.hero.title2')}</span> {t('strategicPartner.hero.title3')}
          </h1>
          <p className="hero-subtitle">
            {t('strategicPartner.hero.subtitle')}
          </p>

          <div className="enterprise-banner" data-testid="enterprise-banner">
            <div className="enterprise-logos">
              {enterpriseLogos.map((logo, idx) => (
                <div key={idx} className="enterprise-logo">
                  <div className="enterprise-logo-icon">{logo.icon}</div>
                  <span className="enterprise-logo-name">{t(`strategicPartner.enterpriseLogos.${logo.nameKey}`)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-grid" data-testid="strategic-stats-grid">
            <div className="stat-card" data-testid="stat-total-strategic">
              <div className="stat-value">
                {isLoadingStats ? '...' : partnershipData?.allocation ? `${(parseInt(partnershipData.allocation) / 1000000).toFixed(0)}M` : '200M'}
              </div>
              <div className="stat-label">{t('strategicPartner.stats.totalBudget')}</div>
            </div>
            <div className="stat-card" data-testid="stat-partners">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${partnershipData?.strategic || 8}+`}
              </div>
              <div className="stat-label">{t('strategicPartner.stats.strategicPartners')}</div>
            </div>
            <div className="stat-card" data-testid="stat-tvl">
              <div className="stat-value">
                {isLoadingStats ? '...' : partnershipData?.distributed ? `$${(parseInt(partnershipData.distributed) / 1000000).toFixed(0)}M+` : '$500M+'}
              </div>
              <div className="stat-label">{t('strategicPartner.stats.distributed')}</div>
            </div>
            <div className="stat-card" data-testid="stat-max-incentive">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${partnershipData?.total || 45}`}
              </div>
              <div className="stat-label">{t('strategicPartner.stats.totalPartnerships')}</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply-strategic"
              onClick={handleApplyPartnership}
            >
              {t('strategicPartner.cta.applyPartnership')}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-view-guide"
              onClick={handleViewGuide}
            >
              {t('strategicPartner.cta.enterpriseGuide')}
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t('strategicPartner.distribution.badge')}</span>
          <h2 className="section-title">{t('strategicPartner.distribution.title')}</h2>
          <p className="section-subtitle">{t('strategicPartner.distribution.subtitle')}</p>
        </div>

        <div className="distribution-grid">
          {distributions.map(dist => (
            <div key={dist.id} className={`dist-card ${dist.id}`} data-testid={`dist-${dist.id}`}>
              <div className="dist-icon">{dist.icon}</div>
              <div className="dist-name">{t(`strategicPartner.distribution.${dist.nameKey}`)}</div>
              <div className="dist-amount">{t(`strategicPartner.distribution.${dist.amountKey}`)}</div>
              <div className="dist-percent">{dist.percent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Partner Tiers Section */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('strategicPartner.tiers.badge')}</span>
          <h2 className="section-title">{t('strategicPartner.tiers.title')}</h2>
          <p className="section-subtitle">{t('strategicPartner.tiers.subtitle')}</p>
        </div>

        <div className="tiers-grid">
          {partnerTiers.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.id}`} data-testid={`tier-${tier.id}`}>
              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <h3 className="tier-name">{t(`strategicPartner.tiers.${tier.id}.name`)}</h3>
                <p className="tier-subtitle">{t(`strategicPartner.tiers.${tier.id}.subtitle`)}</p>
              </div>
              <div className="tier-content">
                <div className="tier-incentive">
                  <div className="tier-incentive-label">{t('strategicPartner.tiers.partnerIncentive')}</div>
                  <div className="tier-incentive-value">{t(`strategicPartner.tiers.${tier.id}.incentive`)} TBURN</div>
                </div>
                <div className="tier-requirement">{t(`strategicPartner.tiers.${tier.id}.requirement`)}</div>
                <ul className="tier-benefits">
                  {(t(`strategicPartner.tiers.${tier.id}.benefits`, { returnObjects: true }) as string[]).map((benefit: string, idx: number) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <button 
                  className="tier-btn"
                  data-testid={`button-inquire-${tier.id}`}
                  onClick={() => handleInquireTier(t(`strategicPartner.tiers.${tier.id}.name`), t(`strategicPartner.tiers.${tier.id}.incentive`))}
                >
                  {t('strategicPartner.tiers.inquire')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership Types Section */}
      <section className="section" id="types">
        <div className="section-header">
          <span className="section-badge">{t('strategicPartner.partnershipTypes.badge')}</span>
          <h2 className="section-title">{t('strategicPartner.partnershipTypes.title')}</h2>
          <p className="section-subtitle">{t('strategicPartner.partnershipTypes.subtitle')}</p>
        </div>

        <div className="partnership-types-grid">
          {partnershipTypeKeys.map((typeKey, idx) => (
            <div key={idx} className="partnership-card">
              <div className="partnership-icon">{partnershipTypeIcons[typeKey]}</div>
              <h3>{t(`strategicPartner.partnershipTypes.${typeKey}.title`)}</h3>
              <p>{t(`strategicPartner.partnershipTypes.${typeKey}.desc`)}</p>
              <ul className="partnership-features">
                {(t(`strategicPartner.partnershipTypes.${typeKey}.features`, { returnObjects: true }) as string[]).map((feature: string, fidx: number) => (
                  <li key={fidx}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('strategicPartner.process.badge')}</span>
          <h2 className="section-title">{t('strategicPartner.process.title')}</h2>
          <p className="section-subtitle">{t('strategicPartner.process.subtitle')}</p>
        </div>

        <div className="process-container">
          <div className="process-timeline">
            {processStepKeys.map((stepKey, idx) => (
              <div key={idx} className="process-item">
                <div className="process-dot">{processStepIcons[idx]}</div>
                <div className="process-title">{t(`strategicPartner.process.${stepKey}.title`)}</div>
                <div className="process-desc">{t(`strategicPartner.process.${stepKey}.desc`)}</div>
                <div className="process-duration">{t(`strategicPartner.process.${stepKey}.duration`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section" id="benefits">
        <div className="section-header">
          <span className="section-badge">{t('strategicPartner.benefits.badge')}</span>
          <h2 className="section-title">{t('strategicPartner.benefits.title')}</h2>
          <p className="section-subtitle">{t('strategicPartner.benefits.subtitle')}</p>
        </div>

        <div className="benefits-grid">
          {benefitKeys.map((key, idx) => (
            <div key={idx} className="benefit-card">
              <div className="benefit-icon">{benefitIcons[key]}</div>
              <h4>{t(`strategicPartner.benefits.${key}.title`)}</h4>
              <p>{t(`strategicPartner.benefits.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section" id="use-cases" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('strategicPartner.useCases.badge')}</span>
          <h2 className="section-title">{t('strategicPartner.useCases.title')}</h2>
          <p className="section-subtitle">{t('strategicPartner.useCases.subtitle')}</p>
        </div>

        <div className="use-cases-container">
          <div className="use-case-tabs">
            <button className={`use-case-tab ${activeTab === 'enterprise' ? 'active' : ''}`} onClick={() => setActiveTab('enterprise')}>
              🏛️ {t('strategicPartner.useCases.tabs.enterprise')}
            </button>
            <button className={`use-case-tab ${activeTab === 'protocol' ? 'active' : ''}`} onClick={() => setActiveTab('protocol')}>
              🔗 {t('strategicPartner.useCases.tabs.protocol')}
            </button>
            <button className={`use-case-tab ${activeTab === 'institutional' ? 'active' : ''}`} onClick={() => setActiveTab('institutional')}>
              💰 {t('strategicPartner.useCases.tabs.institutional')}
            </button>
          </div>
          <div className="use-case-content">
            <div className="use-case-item">
              <div className="use-case-info">
                <h4>{t(`strategicPartner.useCases.${activeTab}.title`)}</h4>
                <p>{t(`strategicPartner.useCases.${activeTab}.desc`)}</p>
                <ul className="use-case-features">
                  {(t(`strategicPartner.useCases.${activeTab}.features`, { returnObjects: true }) as string[]).map((feature: string, idx: number) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="use-case-image">
                <div className="stats-display">
                  {activeTab === 'enterprise' && (
                    <>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.enterprise.stats.uptime')}</div><div className="label">{t('strategicPartner.useCases.enterprise.stats.uptimeLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.enterprise.stats.response')}</div><div className="label">{t('strategicPartner.useCases.enterprise.stats.responseLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.enterprise.stats.throughput')}</div><div className="label">{t('strategicPartner.useCases.enterprise.stats.throughputLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.enterprise.stats.security')}</div><div className="label">{t('strategicPartner.useCases.enterprise.stats.securityLabel')}</div></div>
                    </>
                  )}
                  {activeTab === 'protocol' && (
                    <>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.protocol.stats.tvl')}</div><div className="label">{t('strategicPartner.useCases.protocol.stats.tvlLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.protocol.stats.protocols')}</div><div className="label">{t('strategicPartner.useCases.protocol.stats.protocolsLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.protocol.stats.transactions')}</div><div className="label">{t('strategicPartner.useCases.protocol.stats.transactionsLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.protocol.stats.chains')}</div><div className="label">{t('strategicPartner.useCases.protocol.stats.chainsLabel')}</div></div>
                    </>
                  )}
                  {activeTab === 'institutional' && (
                    <>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.institutional.stats.aum')}</div><div className="label">{t('strategicPartner.useCases.institutional.stats.aumLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.institutional.stats.partners')}</div><div className="label">{t('strategicPartner.useCases.institutional.stats.partnersLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.institutional.stats.otc')}</div><div className="label">{t('strategicPartner.useCases.institutional.stats.otcLabel')}</div></div>
                      <div className="use-case-stat"><div className="value">{t('strategicPartner.useCases.institutional.stats.compliance')}</div><div className="label">{t('strategicPartner.useCases.institutional.stats.complianceLabel')}</div></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Partners Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t('strategicPartner.currentPartners.badge')}</span>
          <h2 className="section-title">{t('strategicPartner.currentPartners.title')}</h2>
          <p className="section-subtitle">{t('strategicPartner.currentPartners.subtitle')}</p>
        </div>

        <div className="partners-showcase">
          <div className="partners-grid">
            {currentPartnerKeys.map((partnerKey, idx) => (
              <div key={idx} className="partner-item">
                <div className="partner-item-header">
                  <div className="partner-item-logo">{currentPartnerIcons[partnerKey]}</div>
                  <div className="partner-item-info">
                    <h5>{t(`strategicPartner.currentPartners.${partnerKey}.name`)}</h5>
                    <p>{t(`strategicPartner.currentPartners.${partnerKey}.type`)}</p>
                  </div>
                </div>
                <span className={`partner-item-tier ${currentPartnerTiers[partnerKey]}`}>{currentPartnerTiers[partnerKey].toUpperCase()}</span>
                <div className="partner-item-stats">
                  <div>
                    <span className="label">{t('strategicPartner.currentPartners.investmentScale')}</span>
                    <div className="value">{currentPartnerInvestments[partnerKey]}</div>
                  </div>
                  <div>
                    <span className="label">{t('strategicPartner.currentPartners.partnership')}</span>
                    <div className="value">{currentPartnerSince[partnerKey]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('strategicPartner.faq.badge')}</span>
          <h2 className="section-title">{t('strategicPartner.faq.title')}</h2>
          <p className="section-subtitle">{t('strategicPartner.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div key={num} className={`faq-item ${activeFaq === `faq-${num}` ? 'active' : ''}`} data-testid={`faq-item-${num}`}>
              <div className="faq-question" onClick={() => toggleFaq(`faq-${num}`)}>
                <h4>{t(`strategicPartner.faq.q${num}.question`)}</h4>
                <span className="faq-chevron">▼</span>
              </div>
              <div className="faq-answer">
                <p>{t(`strategicPartner.faq.q${num}.answer`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('strategicPartner.ctaSection.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('strategicPartner.ctaSection.subtitle1')}<br />
            {t('strategicPartner.ctaSection.subtitle2')}
          </p>
          <button 
            className="btn-primary" 
            style={{ fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-partnership"
            onClick={() => { 
              scrollToSection('tiers'); 
              toast({ title: t('strategicPartner.cta.partnershipInquiry'), description: t('strategicPartner.cta.partnershipInquiryDesc') }); 
            }}
          >
            {t('strategicPartner.ctaSection.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('strategicPartner.footer.tagline1')}<br />{t('strategicPartner.footer.tagline2')}</p>
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
            <h4>{t('strategicPartner.footer.products')}</h4>
            <ul>
              <li><a href="/" data-testid="footer-link-mainnet">{t('strategicPartner.footer.explorer')}</a></li>
              <li><a href="/scan" data-testid="footer-link-explorer">{t('strategicPartner.footer.explorer')}</a></li>
              <li><a href="/app/bridge" data-testid="footer-link-bridge">{t('strategicPartner.footer.bridge')}</a></li>
              <li><a href="/app/staking" data-testid="footer-link-staking">{t('strategicPartner.footer.staking')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('strategicPartner.footer.developers')}</h4>
            <ul>
              <li><a href="/learn/whitepaper" data-testid="footer-link-whitepaper">{t('strategicPartner.footer.documentation')}</a></li>
              <li><a href="/developers/docs" data-testid="footer-link-docs">{t('strategicPartner.footer.api')}</a></li>
              <li><a 
                href="https://github.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('GitHub', 'https://github.com/tburnchain'); }}
                data-testid="footer-link-github-resources"
              >{t('strategicPartner.footer.github')}</a></li>
              <li><a href="/security-audit" data-testid="footer-link-audit">{t('strategicPartner.footer.bugBounty')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('strategicPartner.footer.community')}</h4>
            <ul>
              <li><a href="/community/news" data-testid="footer-link-blog">{t('strategicPartner.footer.forum')}</a></li>
              <li><a href="/marketing-program" data-testid="footer-link-ambassador">{t('strategicPartner.footer.twitter')}</a></li>
              <li><a href="/ecosystem-fund" data-testid="footer-link-grants">{t('strategicPartner.footer.telegram')}</a></li>
              <li><a href="/qna" data-testid="footer-link-support">{t('strategicPartner.footer.discord')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('strategicPartner.footer.copyright')}</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">{t('strategicPartner.footer.termsOfService')}</a>
            <a href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">{t('strategicPartner.footer.privacyPolicy')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
