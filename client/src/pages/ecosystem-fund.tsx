import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";

interface EcosystemFundStatsData {
  totalFundSize: string;
  totalAllocated: string;
  totalProjects: number;
  activeProjects: number;
  categories: Array<{ name: string; allocation: string; percent: string }>;
  recentGrants: Array<{ name: string; amount: string; category: string }>;
}

interface EcosystemFundStatsResponse {
  success: boolean;
  data: EcosystemFundStatsData;
}

export default function EcosystemFundPage() {
  const { t } = useTranslation();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();

  const { data: response, isLoading } = useQuery<EcosystemFundStatsResponse>({
    queryKey: ['/api/token-programs/ecosystem-fund/stats'],
  });
  const stats = response?.data;

  const { toast } = useToast();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
      toast({
        title: t('tokenPrograms.ecosystemFund.wallet.disconnected'),
        description: t('tokenPrograms.ecosystemFund.wallet.disconnectedDesc'),
      });
    } else {
      await connect("metamask");
      toast({
        title: t('tokenPrograms.ecosystemFund.wallet.connected'),
        description: t('tokenPrograms.ecosystemFund.wallet.connectedDesc'),
      });
    }
  };

  const handleApplyGrant = (grantId: string, grantTitle: string) => {
    if (!isConnected) {
      toast({
        title: t('tokenPrograms.ecosystemFund.wallet.required'),
        description: t('tokenPrograms.ecosystemFund.wallet.requiredDesc'),
        variant: "destructive",
      });
      return;
    }
    toast({
      title: t('tokenPrograms.ecosystemFund.grants.applicationComplete', { title: grantTitle }),
      description: t('tokenPrograms.ecosystemFund.grants.applicationSubmitted', { title: grantTitle }),
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({
      title: t('tokenPrograms.ecosystemFund.social.opening', { platform }),
      description: t('tokenPrograms.ecosystemFund.social.openedInNewTab', { platform }),
    });
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const distributions = [
    { id: "grant", icon: "💻", nameKey: "distributions.grant", amount: "280M", percent: "40%" },
    { id: "incubator", icon: "🚀", nameKey: "distributions.incubator", amount: "140M", percent: "20%" },
    { id: "hackathon", icon: "🏆", nameKey: "distributions.hackathon", amount: "70M", percent: "10%" },
    { id: "partnership", icon: "🤝", nameKey: "distributions.partnership", amount: "140M", percent: "20%" },
    { id: "research", icon: "🔬", nameKey: "distributions.research", amount: "70M", percent: "10%" },
  ];

  const grantPrograms = [
    { id: "builder", icon: "🛠️", title: "Builder Grant", subtitleKey: "grants.builder.subtitle", amountKey: "grants.builder.amount", range: "1,000~50,000 TBURN", featured: false, featuresKeys: ["grants.builder.feature1", "grants.builder.feature2", "grants.builder.feature3", "grants.builder.feature4"], stats: { approved: "156", pending: "24" } },
    { id: "growth", icon: "📈", title: "Growth Grant", subtitleKey: "grants.growth.subtitle", amountKey: "grants.growth.amount", range: "50,000~200,000 TBURN", featured: true, featuresKeys: ["grants.growth.feature1", "grants.growth.feature2", "grants.growth.feature3", "grants.growth.feature4"], stats: { approved: "42", pending: "18" } },
    { id: "research", icon: "🔬", title: "Research Grant", subtitleKey: "grants.research.subtitle", amountKey: "grants.research.amount", range: "100,000~500,000 TBURN", featured: false, featuresKeys: ["grants.research.feature1", "grants.research.feature2", "grants.research.feature3", "grants.research.feature4"], stats: { approved: "12", pending: "8" } },
  ];

  const processSteps = [
    { icon: "📝", titleKey: "process.step1.title", descKey: "process.step1.desc", durationKey: "process.step1.duration" },
    { icon: "🔍", titleKey: "process.step2.title", descKey: "process.step2.desc", durationKey: "process.step2.duration" },
    { icon: "💬", titleKey: "process.step3.title", descKey: "process.step3.desc", durationKey: "process.step3.duration" },
    { icon: "📊", titleKey: "process.step4.title", descKey: "process.step4.desc", durationKey: "process.step4.duration" },
    { icon: "✅", titleKey: "process.step5.title", descKey: "process.step5.desc", durationKey: "process.step5.duration" },
  ];

  const incubatorBenefits = [
    { icon: "💰", type: "funding", titleKey: "incubator.benefits.funding.title", descKey: "incubator.benefits.funding.desc" },
    { icon: "👨‍🏫", type: "mentoring", titleKey: "incubator.benefits.mentoring.title", descKey: "incubator.benefits.mentoring.desc" },
    { icon: "🛠️", type: "tech", titleKey: "incubator.benefits.tech.title", descKey: "incubator.benefits.tech.desc" },
    { icon: "🌐", type: "network", titleKey: "incubator.benefits.network.title", descKey: "incubator.benefits.network.desc" },
    { icon: "📢", type: "marketing", titleKey: "incubator.benefits.marketing.title", descKey: "incubator.benefits.marketing.desc" },
  ];

  const incubatorBatches = [
    { name: "Batch #4", status: "recruiting", statusLabelKey: "incubator.status.recruiting", infoKey: "incubator.batch4.info" },
    { name: "Batch #5", status: "upcoming", statusLabelKey: "incubator.status.upcoming", infoKey: "incubator.batch5.info" },
    { name: "Batch #3", status: "completed", statusLabelKey: "incubator.status.completed", infoKey: "incubator.batch3.info" },
  ];

  const hackathonTracks = [
    { icon: "🎮", name: "GameFi", prize: "$25,000" },
    { icon: "💱", name: "DeFi", prize: "$25,000" },
    { icon: "🖼️", name: "NFT", prize: "$15,000" },
    { icon: "🤖", name: "AI+Blockchain", prize: "$35,000" },
  ];

  const portfolioProjects = [
    { icon: "🦊", name: "TBurn Swap", category: "DEX", funding: "150,000 TBURN" },
    { icon: "🏦", name: "TBurn Lend", category: "Lending", funding: "200,000 TBURN" },
    { icon: "🎮", name: "ChainQuest", category: "GameFi", funding: "100,000 TBURN" },
    { icon: "🖼️", name: "ArtVerse", category: "NFT Marketplace", funding: "80,000 TBURN" },
    { icon: "🌉", name: "CrossBridge", category: "Bridge", funding: "250,000 TBURN" },
    { icon: "📊", name: "DataDAO", category: "Analytics", funding: "75,000 TBURN" },
    { icon: "🔐", name: "VaultGuard", category: "Security", funding: "120,000 TBURN" },
    { icon: "💎", name: "StakeMax", category: "Staking", funding: "90,000 TBURN" },
  ];

  return (
    <div className="ecosystem-fund-page">
      <style>{`
        .ecosystem-fund-page {
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
          --teal: #14B8A6;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-fund: linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);
          --gradient-grant: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
          --gradient-incubator: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .fund-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(20, 184, 166, 0.2);
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
        .nav-links a:hover { color: var(--teal); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-fund);
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
          box-shadow: 0 10px 40px rgba(20, 184, 166, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%);
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
          background: rgba(20, 184, 166, 0.15);
          border: 1px solid rgba(20, 184, 166, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--teal);
          margin-bottom: 2rem;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-fund);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--light-gray);
          max-width: 700px;
          margin: 0 auto 3rem;
        }

        .fund-stats-banner {
          background: linear-gradient(90deg, rgba(20, 184, 166, 0.15), rgba(6, 182, 212, 0.15));
          border: 1px solid rgba(20, 184, 166, 0.3);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .fund-stat {
          text-align: center;
          position: relative;
        }

        .fund-stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .fund-stat .value { font-size: 1.5rem; font-weight: 800; color: var(--teal); }
        .fund-stat .label { font-size: 0.8rem; color: var(--gray); margin-top: 0.25rem; }

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
          border-color: var(--teal);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-fund);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-fund);
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
          box-shadow: 0 20px 60px rgba(20, 184, 166, 0.4);
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

        .btn-secondary:hover { border-color: var(--teal); color: var(--teal); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(20, 184, 166, 0.15);
          color: var(--teal);
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
          border-color: var(--teal);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.grant::before { background: var(--gradient-grant); }
        .dist-card.incubator::before { background: var(--gradient-incubator); }
        .dist-card.hackathon::before { background: linear-gradient(90deg, var(--warning), var(--gold)); }
        .dist-card.partnership::before { background: var(--gradient-fund); }
        .dist-card.research::before { background: linear-gradient(90deg, var(--blue), var(--indigo)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--teal); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .grant-programs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .grant-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .grant-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .grant-card.featured {
          border-color: var(--teal);
          box-shadow: 0 0 40px rgba(20, 184, 166, 0.2);
        }

        .grant-card.featured::after {
          content: '인기';
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--gradient-fund);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 10;
        }

        .grant-header {
          padding: 2rem;
          position: relative;
        }

        .grant-header.builder { background: linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, transparent 100%); }
        .grant-header.growth { background: linear-gradient(180deg, rgba(20, 184, 166, 0.2) 0%, transparent 100%); }
        .grant-header.research { background: linear-gradient(180deg, rgba(59, 130, 246, 0.2) 0%, transparent 100%); }

        .grant-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        .grant-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
        .grant-subtitle { color: var(--light-gray); font-size: 0.9rem; }

        .grant-content { padding: 1.5rem 2rem 2rem; }

        .grant-amount {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .grant-amount-label { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }
        .grant-amount-value { font-size: 1.75rem; font-weight: 900; color: var(--teal); }
        .grant-amount-range { font-size: 0.875rem; color: var(--gray); margin-top: 0.25rem; }

        .grant-features { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .grant-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .grant-features li:last-child { border-bottom: none; }
        .grant-features li::before { content: '✓'; color: var(--success); }

        .grant-stats {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .grant-stat-item { text-align: center; }
        .grant-stat-item .value { font-weight: 700; color: var(--teal); }
        .grant-stat-item .label { font-size: 0.7rem; color: var(--gray); }

        .grant-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          background: var(--gradient-fund);
          color: var(--white);
        }

        .grant-btn:hover { transform: scale(1.02); }

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
          background: linear-gradient(90deg, var(--teal), var(--cyan), var(--blue), var(--purple), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--teal); }
        .process-item:nth-child(2) .process-dot { background: var(--cyan); }
        .process-item:nth-child(3) .process-dot { background: var(--blue); }
        .process-item:nth-child(4) .process-dot { background: var(--purple); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--teal); font-weight: 600; margin-top: 0.5rem; }

        .incubator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .incubator-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .incubator-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .incubator-benefits {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }

        .benefit-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .benefit-icon.funding { background: rgba(20, 184, 166, 0.2); }
        .benefit-icon.mentoring { background: rgba(139, 92, 246, 0.2); }
        .benefit-icon.tech { background: rgba(59, 130, 246, 0.2); }
        .benefit-icon.network { background: rgba(236, 72, 153, 0.2); }
        .benefit-icon.marketing { background: rgba(245, 158, 11, 0.2); }

        .benefit-content h4 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
        .benefit-content p { font-size: 0.85rem; color: var(--gray); }

        .incubator-batch {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .batch-item {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border-left: 4px solid var(--teal);
        }

        .batch-item.active { border-left-color: var(--success); background: rgba(34, 197, 94, 0.05); }
        .batch-item.upcoming { border-left-color: var(--warning); }

        .batch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .batch-name { font-weight: 700; }

        .batch-status {
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .batch-status.recruiting { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .batch-status.upcoming { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .batch-status.completed { background: rgba(100, 116, 139, 0.15); color: var(--gray); }

        .batch-info { font-size: 0.85rem; color: var(--gray); }

        .hackathon-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .hackathon-banner {
          padding: 3rem 2rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(212, 175, 55, 0.1));
          text-align: center;
          position: relative;
        }

        .hackathon-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--warning), var(--gold));
        }

        .hackathon-title { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .hackathon-subtitle { color: var(--light-gray); }

        .hackathon-content { padding: 2rem; }

        .hackathon-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .hackathon-stat {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
        }

        .hackathon-stat .icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .hackathon-stat .value { font-size: 1.5rem; font-weight: 800; color: var(--gold); }
        .hackathon-stat .label { font-size: 0.8rem; color: var(--gray); }

        .hackathon-tracks {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .track-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s;
        }

        .track-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-5px);
        }

        .track-icon { font-size: 2rem; margin-bottom: 0.75rem; }
        .track-name { font-weight: 700; margin-bottom: 0.25rem; }
        .track-prize { color: var(--gold); font-weight: 700; }

        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .portfolio-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .portfolio-card:hover {
          border-color: var(--teal);
          transform: translateY(-5px);
        }

        .portfolio-logo {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(6, 182, 212, 0.2));
        }

        .portfolio-name { font-weight: 700; margin-bottom: 0.25rem; }
        .portfolio-category { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.75rem; }

        .portfolio-funding {
          display: flex;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
        }

        .portfolio-funding .label { color: var(--gray); }
        .portfolio-funding .value { color: var(--teal); font-weight: 600; }

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

        .faq-chevron { color: var(--teal); transition: transform 0.3s; }
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
          background: var(--gradient-fund);
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

        .social-links a:hover { background: var(--teal); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--teal); }

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
          .grant-programs-grid { grid-template-columns: 1fr; }
          .incubator-container { grid-template-columns: 1fr; }
          .portfolio-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .fund-stats-banner { grid-template-columns: repeat(3, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .hackathon-stats, .hackathon-tracks { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .portfolio-grid { grid-template-columns: 1fr; }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .fund-stats-banner { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="fund-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#grants" onClick={(e) => { e.preventDefault(); scrollToSection('grants'); }} data-testid="nav-grants">{t('tokenPrograms.ecosystemFund.nav.grants')}</a>
            <a href="#incubator" onClick={(e) => { e.preventDefault(); scrollToSection('incubator'); }} data-testid="nav-incubator">{t('tokenPrograms.ecosystemFund.nav.incubator')}</a>
            <a href="#hackathon" onClick={(e) => { e.preventDefault(); scrollToSection('hackathon'); }} data-testid="nav-hackathon">{t('tokenPrograms.ecosystemFund.nav.hackathon')}</a>
            <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }} data-testid="nav-portfolio">{t('tokenPrograms.ecosystemFund.nav.portfolio')}</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} data-testid="nav-faq">FAQ</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              onClick={handleWalletClick}
              data-testid="button-connect-wallet"
            >
              {isConnected ? formatAddress(address!) : t('tokenPrograms.ecosystemFund.wallet.connect')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span>🌱</span> {t('tokenPrograms.ecosystemFund.hero.badge')}
          </div>
          <h1>
            {t('tokenPrograms.ecosystemFund.hero.title')}<br />
            <span className="gradient-text">{t('tokenPrograms.ecosystemFund.hero.fundAmount')}</span> {t('tokenPrograms.ecosystemFund.hero.fund')}
          </h1>
          <p className="hero-subtitle">
            {t('tokenPrograms.ecosystemFund.hero.subtitle')}
          </p>

          <div className="fund-stats-banner" data-testid="fund-stats">
            {isLoading ? (
              <div className="fund-stat" data-testid="loading-indicator">
                <div className="value" style={{ opacity: 0.5 }}>{t('tokenPrograms.ecosystemFund.loading')}</div>
              </div>
            ) : (
              <>
                <div className="fund-stat">
                  <div className="value" data-testid="stat-fund-size">{stats?.totalFundSize || "700M"}</div>
                  <div className="label">{t('tokenPrograms.ecosystemFund.stats.totalFundSize')}</div>
                </div>
                <div className="fund-stat">
                  <div className="value" data-testid="stat-total-projects">{stats?.totalProjects || 124}</div>
                  <div className="label">{t('tokenPrograms.ecosystemFund.stats.supportedProjects')}</div>
                </div>
                <div className="fund-stat">
                  <div className="value" data-testid="stat-allocated">{stats?.totalAllocated || "$175M+"}</div>
                  <div className="label">{t('tokenPrograms.ecosystemFund.stats.totalInvestment')}</div>
                </div>
                <div className="fund-stat">
                  <div className="value" data-testid="stat-active-projects">{stats?.activeProjects || 32}</div>
                  <div className="label">{t('tokenPrograms.ecosystemFund.stats.activeDApps')}</div>
                </div>
                <div className="fund-stat">
                  <div className="value">85%</div>
                  <div className="label">{t('tokenPrograms.ecosystemFund.stats.successRate')}</div>
                </div>
              </>
            )}
          </div>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-fund">
              <div className="stat-value">700M</div>
              <div className="stat-label">{t('tokenPrograms.ecosystemFund.stats.totalEcosystemFund')}</div>
            </div>
            <div className="stat-card" data-testid="stat-grant">
              <div className="stat-value">280M</div>
              <div className="stat-label">{t('tokenPrograms.ecosystemFund.stats.developerGrant')}</div>
            </div>
            <div className="stat-card" data-testid="stat-incubator">
              <div className="stat-value">140M</div>
              <div className="stat-label">{t('tokenPrograms.ecosystemFund.stats.incubatorFund')}</div>
            </div>
            <div className="stat-card" data-testid="stat-hackathon">
              <div className="stat-value">$100K</div>
              <div className="stat-label">{t('tokenPrograms.ecosystemFund.stats.hackathonPrize')}</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply-grant"
              onClick={() => { scrollToSection('grants'); toast({ title: t('tokenPrograms.ecosystemFund.cta.grantProgram'), description: t('tokenPrograms.ecosystemFund.cta.selectProgram') }); }}
            >
              {t('tokenPrograms.ecosystemFund.cta.applyForGrant')}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-view-programs"
              onClick={() => { scrollToSection('incubator'); toast({ title: t('tokenPrograms.ecosystemFund.cta.incubatorProgram'), description: t('tokenPrograms.ecosystemFund.cta.checkProgram') }); }}
            >
              {t('tokenPrograms.ecosystemFund.cta.viewPrograms')}
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">{t('tokenPrograms.ecosystemFund.sections.distribution.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.ecosystemFund.sections.distribution.subtitle')}</p>
        </div>

        <div className="distribution-grid">
          {distributions.map(dist => (
            <div key={dist.id} className={`dist-card ${dist.id}`} data-testid={`dist-${dist.id}`}>
              <div className="dist-icon">{dist.icon}</div>
              <div className="dist-name">{t(`tokenPrograms.ecosystemFund.${dist.nameKey}`)}</div>
              <div className="dist-amount">{dist.amount}</div>
              <div className="dist-percent">{dist.percent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Grant Programs Section */}
      <section className="section" id="grants" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">GRANTS</span>
          <h2 className="section-title">{t('tokenPrograms.ecosystemFund.sections.grants.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.ecosystemFund.sections.grants.subtitle')}</p>
        </div>

        <div className="grant-programs-grid">
          {grantPrograms.map(grant => (
            <div key={grant.id} className={`grant-card ${grant.featured ? 'featured' : ''}`} data-testid={`grant-${grant.id}`}>
              <div className={`grant-header ${grant.id}`}>
                <div className="grant-icon">{grant.icon}</div>
                <h3 className="grant-title">{grant.title}</h3>
                <p className="grant-subtitle">{t(`tokenPrograms.ecosystemFund.${grant.subtitleKey}`)}</p>
              </div>
              <div className="grant-content">
                <div className="grant-amount">
                  <div className="grant-amount-label">{t('tokenPrograms.ecosystemFund.grants.fundingAmount')}</div>
                  <div className="grant-amount-value">{t(`tokenPrograms.ecosystemFund.${grant.amountKey}`)} TBURN</div>
                  <div className="grant-amount-range">{grant.range}</div>
                </div>
                <ul className="grant-features">
                  {grant.featuresKeys.map((featureKey, idx) => (
                    <li key={idx}>{t(`tokenPrograms.ecosystemFund.${featureKey}`)}</li>
                  ))}
                </ul>
                <div className="grant-stats">
                  <div className="grant-stat-item">
                    <div className="value">{grant.stats.approved}</div>
                    <div className="label">{t('tokenPrograms.ecosystemFund.grants.approved')}</div>
                  </div>
                  <div className="grant-stat-item">
                    <div className="value">{grant.stats.pending}</div>
                    <div className="label">{t('tokenPrograms.ecosystemFund.grants.pending')}</div>
                  </div>
                </div>
                <button 
                  className="grant-btn"
                  onClick={() => handleApplyGrant(grant.id, grant.title)}
                  data-testid={`button-apply-${grant.id}`}
                >
                  {isConnected ? t('tokenPrograms.ecosystemFund.grants.apply') : t('tokenPrograms.ecosystemFund.wallet.connectWallet')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">{t('tokenPrograms.ecosystemFund.sections.process.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.ecosystemFund.sections.process.subtitle')}</p>
        </div>

        <div className="process-container">
          <div className="process-timeline">
            {processSteps.map((step, idx) => (
              <div key={idx} className="process-item">
                <div className="process-dot">{step.icon}</div>
                <div className="process-title">{t(`tokenPrograms.ecosystemFund.${step.titleKey}`)}</div>
                <div className="process-desc">{t(`tokenPrograms.ecosystemFund.${step.descKey}`)}</div>
                <div className="process-duration">{t(`tokenPrograms.ecosystemFund.${step.durationKey}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incubator Section */}
      <section className="section" id="incubator" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">INCUBATOR</span>
          <h2 className="section-title">{t('tokenPrograms.ecosystemFund.sections.incubator.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.ecosystemFund.sections.incubator.subtitle')}</p>
        </div>

        <div className="incubator-container">
          <div className="incubator-card">
            <h3>{t('tokenPrograms.ecosystemFund.incubator.benefitsTitle')}</h3>
            <div className="incubator-benefits">
              {incubatorBenefits.map((benefit, idx) => (
                <div key={idx} className="benefit-item">
                  <div className={`benefit-icon ${benefit.type}`}>{benefit.icon}</div>
                  <div className="benefit-content">
                    <h4>{t(`tokenPrograms.ecosystemFund.${benefit.titleKey}`)}</h4>
                    <p>{t(`tokenPrograms.ecosystemFund.${benefit.descKey}`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="incubator-card">
            <h3>{t('tokenPrograms.ecosystemFund.incubator.batchSchedule')}</h3>
            <div className="incubator-batch">
              {incubatorBatches.map((batch, idx) => (
                <div key={idx} className={`batch-item ${batch.status === 'recruiting' ? 'active' : batch.status}`}>
                  <div className="batch-header">
                    <span className="batch-name">{batch.name}</span>
                    <span className={`batch-status ${batch.status}`}>{t(`tokenPrograms.ecosystemFund.${batch.statusLabelKey}`)}</span>
                  </div>
                  <div className="batch-info">{t(`tokenPrograms.ecosystemFund.${batch.infoKey}`)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon Section */}
      <section className="section" id="hackathon">
        <div className="section-header">
          <span className="section-badge">HACKATHON</span>
          <h2 className="section-title">{t('tokenPrograms.ecosystemFund.sections.hackathon.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.ecosystemFund.sections.hackathon.subtitle')}</p>
        </div>

        <div className="hackathon-card">
          <div className="hackathon-banner">
            <h2 className="hackathon-title">{t('tokenPrograms.ecosystemFund.hackathon.eventTitle')}</h2>
            <p className="hackathon-subtitle">{t('tokenPrograms.ecosystemFund.hackathon.eventSubtitle')}</p>
          </div>
          <div className="hackathon-content">
            <div className="hackathon-stats">
              <div className="hackathon-stat">
                <div className="icon">💰</div>
                <div className="value">$100K</div>
                <div className="label">{t('tokenPrograms.ecosystemFund.hackathon.totalPrize')}</div>
              </div>
              <div className="hackathon-stat">
                <div className="icon">👥</div>
                <div className="value">500+</div>
                <div className="label">{t('tokenPrograms.ecosystemFund.hackathon.participants')}</div>
              </div>
              <div className="hackathon-stat">
                <div className="icon">🌍</div>
                <div className="value">30+</div>
                <div className="label">{t('tokenPrograms.ecosystemFund.hackathon.countries')}</div>
              </div>
              <div className="hackathon-stat">
                <div className="icon">🏢</div>
                <div className="value">15</div>
                <div className="label">{t('tokenPrograms.ecosystemFund.hackathon.sponsors')}</div>
              </div>
            </div>
            <div className="hackathon-tracks">
              {hackathonTracks.map((track, idx) => (
                <div key={idx} className="track-card">
                  <div className="track-icon">{track.icon}</div>
                  <div className="track-name">{track.name}</div>
                  <div className="track-prize">{track.prize}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="section" id="portfolio" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PORTFOLIO</span>
          <h2 className="section-title">{t('tokenPrograms.ecosystemFund.sections.portfolio.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.ecosystemFund.sections.portfolio.subtitle')}</p>
        </div>

        <div className="portfolio-grid">
          {portfolioProjects.map((project, idx) => (
            <div key={idx} className="portfolio-card">
              <div className="portfolio-logo">{project.icon}</div>
              <div className="portfolio-name">{project.name}</div>
              <div className="portfolio-category">{project.category}</div>
              <div className="portfolio-funding">
                <span className="label">{t('tokenPrograms.ecosystemFund.portfolio.funding')}</span>
                <span className="value">{project.funding}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">{t('tokenPrograms.ecosystemFund.sections.faq.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.ecosystemFund.sections.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-item-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('tokenPrograms.ecosystemFund.faq.q1')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.ecosystemFund.faq.a1')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-item-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('tokenPrograms.ecosystemFund.faq.q2')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.ecosystemFund.faq.a2')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-item-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('tokenPrograms.ecosystemFund.faq.q3')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.ecosystemFund.faq.a3')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-item-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('tokenPrograms.ecosystemFund.faq.q4')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.ecosystemFund.faq.a4')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-item-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('tokenPrograms.ecosystemFund.faq.q5')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.ecosystemFund.faq.a5')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-item-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('tokenPrograms.ecosystemFund.faq.q6')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.ecosystemFund.faq.a6')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-item-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('tokenPrograms.ecosystemFund.faq.q7')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.ecosystemFund.faq.a7')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-item-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('tokenPrograms.ecosystemFund.faq.q8')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.ecosystemFund.faq.a8')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('tokenPrograms.ecosystemFund.ctaSection.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('tokenPrograms.ecosystemFund.ctaSection.subtitle')}
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--teal)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-apply"
            onClick={() => { 
              scrollToSection('grants'); 
              toast({ title: t('tokenPrograms.ecosystemFund.cta.grantProgram'), description: t('tokenPrograms.ecosystemFund.cta.selectProgram') }); 
            }}
          >
            {t('tokenPrograms.ecosystemFund.cta.applyForGrant')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('tokenPrograms.ecosystemFund.footer.tagline')}</p>
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
            <h4>Product</h4>
            <ul>
              <li><a href="/" data-testid="footer-link-mainnet">{t('tokenPrograms.ecosystemFund.footer.mainnet')}</a></li>
              <li><a href="/scan" data-testid="footer-link-explorer">{t('tokenPrograms.ecosystemFund.footer.explorer')}</a></li>
              <li><a href="/app/bridge" data-testid="footer-link-bridge">{t('tokenPrograms.ecosystemFund.footer.bridge')}</a></li>
              <li><a href="/app/staking" data-testid="footer-link-staking">{t('tokenPrograms.ecosystemFund.footer.staking')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="/learn/whitepaper" data-testid="footer-link-whitepaper">{t('tokenPrograms.ecosystemFund.footer.whitepaper')}</a></li>
              <li><a href="/developers/docs" data-testid="footer-link-docs">{t('tokenPrograms.ecosystemFund.footer.docs')}</a></li>
              <li><a 
                href="https://github.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('GitHub', 'https://github.com/tburnchain'); }}
                data-testid="footer-link-github-resources"
              >GitHub</a></li>
              <li><a href="/security-audit" data-testid="footer-link-audit">{t('tokenPrograms.ecosystemFund.footer.auditReport')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><a href="/community/news" data-testid="footer-link-blog">{t('tokenPrograms.ecosystemFund.footer.blog')}</a></li>
              <li><a href="/community-program" data-testid="footer-link-ambassador">{t('tokenPrograms.ecosystemFund.footer.ambassador')}</a></li>
              <li><a href="/ecosystem-fund" data-testid="footer-link-grants">{t('tokenPrograms.ecosystemFund.footer.grants')}</a></li>
              <li><a href="/qna" data-testid="footer-link-support">{t('tokenPrograms.ecosystemFund.footer.support')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">{t('tokenPrograms.ecosystemFund.footer.terms')}</a>
            <a href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">{t('tokenPrograms.ecosystemFund.footer.privacy')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
