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

export default function MarketingProgramPage() {
  const { t } = useTranslation();
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { toast } = useToast();

  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<PartnershipStatsResponse>({
    queryKey: ['/api/token-programs/partnerships/stats'],
  });
  const marketingStats = statsResponse?.data?.marketing;

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
      toast({ title: t('tokenPrograms.marketingProgram.wallet.disconnected'), description: t('tokenPrograms.marketingProgram.wallet.disconnectedDesc') });
    } else {
      await connect("metamask");
      toast({ title: t('tokenPrograms.marketingProgram.wallet.connected'), description: t('tokenPrograms.marketingProgram.wallet.connectedDesc') });
    }
  };

  const handleJoinAmbassador = () => {
    scrollToSection('ambassador');
    toast({ title: t('tokenPrograms.marketingProgram.cta.ambassadorProgram'), description: t('tokenPrograms.marketingProgram.cta.ambassadorDesc') });
  };

  const handleViewGuide = () => {
    scrollToSection('programs');
    toast({ title: t('tokenPrograms.marketingProgram.cta.marketingGuide'), description: t('tokenPrograms.marketingProgram.cta.guideDesc') });
  };

  const handleApplyProgram = (programName: string) => {
    if (!isConnected) {
      toast({ 
        title: t('tokenPrograms.marketingProgram.wallet.required'), 
        description: t('tokenPrograms.marketingProgram.wallet.requiredDesc'),
        variant: "destructive"
      });
      return;
    }
    toast({ 
      title: t('tokenPrograms.marketingProgram.cta.programApply', { programName }), 
      description: t('tokenPrograms.marketingProgram.cta.programApplyDesc', { programName })
    });
  };

  const handleJoinCampaign = (campaignTitle: string, status: string) => {
    if (!isConnected) {
      toast({ 
        title: t('tokenPrograms.marketingProgram.wallet.required'), 
        description: t('tokenPrograms.marketingProgram.wallet.campaignRequiredDesc'),
        variant: "destructive"
      });
      return;
    }
    if (status === 'upcoming') {
      toast({ 
        title: t('tokenPrograms.marketingProgram.campaigns.upcoming'), 
        description: t('tokenPrograms.marketingProgram.campaigns.upcomingDesc')
      });
      return;
    }
    toast({ 
      title: t('tokenPrograms.marketingProgram.campaigns.joined'), 
      description: t('tokenPrograms.marketingProgram.campaigns.joinedDesc', { campaignTitle })
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({ title: platform, description: t('tokenPrograms.marketingProgram.social.navigating', { platform }) });
  };

  const socialStats = [
    { icon: "𝕏", value: "250K+", label: t('tokenPrograms.marketingProgram.socialStats.twitter') },
    { icon: "✈", value: "180K+", label: t('tokenPrograms.marketingProgram.socialStats.telegram') },
    { icon: "💬", value: "120K+", label: t('tokenPrograms.marketingProgram.socialStats.discord') },
    { icon: "📺", value: "85K+", label: t('tokenPrograms.marketingProgram.socialStats.youtube') },
    { icon: "📱", value: "200K+", label: t('tokenPrograms.marketingProgram.socialStats.tiktok') },
  ];

  const distributions = [
    { id: "brand", icon: "🎨", name: t('tokenPrograms.marketingProgram.distributions.brand'), amount: "90M", percent: "30%" },
    { id: "influencer", icon: "⭐", name: t('tokenPrograms.marketingProgram.distributions.influencer'), amount: "75M", percent: "25%" },
    { id: "creator", icon: "🎬", name: t('tokenPrograms.marketingProgram.distributions.creator'), amount: "60M", percent: "20%" },
    { id: "event", icon: "🎉", name: t('tokenPrograms.marketingProgram.distributions.event'), amount: "45M", percent: "15%" },
    { id: "pr", icon: "📰", name: t('tokenPrograms.marketingProgram.distributions.pr'), amount: "30M", percent: "10%" },
  ];

  const programs = [
    { id: "ambassador", icon: "👑", title: t('tokenPrograms.marketingProgram.programs.ambassador.title'), subtitle: t('tokenPrograms.marketingProgram.programs.ambassador.subtitle'), rewards: [{ value: t('tokenPrograms.marketingProgram.programs.ambassador.rewardValue1'), label: t('tokenPrograms.marketingProgram.programs.ambassador.rewardLabel1') }, { value: t('tokenPrograms.marketingProgram.programs.ambassador.rewardValue2'), label: t('tokenPrograms.marketingProgram.programs.ambassador.rewardLabel2') }], features: [t('tokenPrograms.marketingProgram.programs.ambassador.feature1'), t('tokenPrograms.marketingProgram.programs.ambassador.feature2'), t('tokenPrograms.marketingProgram.programs.ambassador.feature3'), t('tokenPrograms.marketingProgram.programs.ambassador.feature4')], featured: true, badge: "HOT" },
    { id: "influencer", icon: "🎯", title: t('tokenPrograms.marketingProgram.programs.influencer.title'), subtitle: t('tokenPrograms.marketingProgram.programs.influencer.subtitle'), rewards: [{ value: t('tokenPrograms.marketingProgram.programs.influencer.rewardValue1'), label: t('tokenPrograms.marketingProgram.programs.influencer.rewardLabel1') }, { value: t('tokenPrograms.marketingProgram.programs.influencer.rewardValue2'), label: t('tokenPrograms.marketingProgram.programs.influencer.rewardLabel2') }], features: [t('tokenPrograms.marketingProgram.programs.influencer.feature1'), t('tokenPrograms.marketingProgram.programs.influencer.feature2'), t('tokenPrograms.marketingProgram.programs.influencer.feature3'), t('tokenPrograms.marketingProgram.programs.influencer.feature4')], featured: false, badge: "NEW" },
    { id: "creator", icon: "🎬", title: t('tokenPrograms.marketingProgram.programs.creator.title'), subtitle: t('tokenPrograms.marketingProgram.programs.creator.subtitle'), rewards: [{ value: t('tokenPrograms.marketingProgram.programs.creator.rewardValue1'), label: t('tokenPrograms.marketingProgram.programs.creator.rewardLabel1') }, { value: t('tokenPrograms.marketingProgram.programs.creator.rewardValue2'), label: t('tokenPrograms.marketingProgram.programs.creator.rewardLabel2') }], features: [t('tokenPrograms.marketingProgram.programs.creator.feature1'), t('tokenPrograms.marketingProgram.programs.creator.feature2'), t('tokenPrograms.marketingProgram.programs.creator.feature3'), t('tokenPrograms.marketingProgram.programs.creator.feature4')], featured: false, badge: null },
    { id: "event", icon: "🎉", title: t('tokenPrograms.marketingProgram.programs.event.title'), subtitle: t('tokenPrograms.marketingProgram.programs.event.subtitle'), rewards: [{ value: t('tokenPrograms.marketingProgram.programs.event.rewardValue1'), label: t('tokenPrograms.marketingProgram.programs.event.rewardLabel1') }, { value: t('tokenPrograms.marketingProgram.programs.event.rewardValue2'), label: t('tokenPrograms.marketingProgram.programs.event.rewardLabel2') }], features: [t('tokenPrograms.marketingProgram.programs.event.feature1'), t('tokenPrograms.marketingProgram.programs.event.feature2'), t('tokenPrograms.marketingProgram.programs.event.feature3'), t('tokenPrograms.marketingProgram.programs.event.feature4')], featured: false, badge: null },
  ];

  const ambassadorTiers = [
    { id: "legend", icon: "🏆", tier: "Legend", requirement: t('tokenPrograms.marketingProgram.ambassadorTiers.legend.requirement'), reward: t('tokenPrograms.marketingProgram.ambassadorTiers.legend.reward'), perks: [t('tokenPrograms.marketingProgram.ambassadorTiers.legend.perk1'), t('tokenPrograms.marketingProgram.ambassadorTiers.legend.perk2'), t('tokenPrograms.marketingProgram.ambassadorTiers.legend.perk3'), t('tokenPrograms.marketingProgram.ambassadorTiers.legend.perk4')] },
    { id: "elite", icon: "💎", tier: "Elite", requirement: t('tokenPrograms.marketingProgram.ambassadorTiers.elite.requirement'), reward: t('tokenPrograms.marketingProgram.ambassadorTiers.elite.reward'), perks: [t('tokenPrograms.marketingProgram.ambassadorTiers.elite.perk1'), t('tokenPrograms.marketingProgram.ambassadorTiers.elite.perk2'), t('tokenPrograms.marketingProgram.ambassadorTiers.elite.perk3'), t('tokenPrograms.marketingProgram.ambassadorTiers.elite.perk4')] },
    { id: "rising", icon: "🚀", tier: "Rising", requirement: t('tokenPrograms.marketingProgram.ambassadorTiers.rising.requirement'), reward: t('tokenPrograms.marketingProgram.ambassadorTiers.rising.reward'), perks: [t('tokenPrograms.marketingProgram.ambassadorTiers.rising.perk1'), t('tokenPrograms.marketingProgram.ambassadorTiers.rising.perk2'), t('tokenPrograms.marketingProgram.ambassadorTiers.rising.perk3'), t('tokenPrograms.marketingProgram.ambassadorTiers.rising.perk4')] },
    { id: "starter", icon: "⭐", tier: "Starter", requirement: t('tokenPrograms.marketingProgram.ambassadorTiers.starter.requirement'), reward: t('tokenPrograms.marketingProgram.ambassadorTiers.starter.reward'), perks: [t('tokenPrograms.marketingProgram.ambassadorTiers.starter.perk1'), t('tokenPrograms.marketingProgram.ambassadorTiers.starter.perk2'), t('tokenPrograms.marketingProgram.ambassadorTiers.starter.perk3'), t('tokenPrograms.marketingProgram.ambassadorTiers.starter.perk4')] },
  ];

  const contentTypes = [
    { icon: "📹", title: t('tokenPrograms.marketingProgram.contentTypes.video.title'), desc: t('tokenPrograms.marketingProgram.contentTypes.video.desc'), reward: "$100~500" },
    { icon: "📝", title: t('tokenPrograms.marketingProgram.contentTypes.article.title'), desc: t('tokenPrograms.marketingProgram.contentTypes.article.desc'), reward: "$50~200" },
    { icon: "🎨", title: t('tokenPrograms.marketingProgram.contentTypes.graphic.title'), desc: t('tokenPrograms.marketingProgram.contentTypes.graphic.desc'), reward: "$30~100" },
    { icon: "🎓", title: t('tokenPrograms.marketingProgram.contentTypes.tutorial.title'), desc: t('tokenPrograms.marketingProgram.contentTypes.tutorial.desc'), reward: "$150~400" },
  ];

  const campaigns = [
    { icon: "𝕏", type: "twitter", title: t('tokenPrograms.marketingProgram.campaignList.twitter.title'), desc: t('tokenPrograms.marketingProgram.campaignList.twitter.desc'), reward: "5,000", participants: "1,234", status: "active", statusLabel: t('tokenPrograms.marketingProgram.campaigns.statusActive') },
    { icon: "📺", type: "youtube", title: t('tokenPrograms.marketingProgram.campaignList.youtube.title'), desc: t('tokenPrograms.marketingProgram.campaignList.youtube.desc'), reward: "50,000", participants: "89", status: "active", statusLabel: t('tokenPrograms.marketingProgram.campaigns.statusActive') },
    { icon: "📱", type: "tiktok", title: t('tokenPrograms.marketingProgram.campaignList.tiktok.title'), desc: t('tokenPrograms.marketingProgram.campaignList.tiktok.desc'), reward: "10,000", participants: "567", status: "ending", statusLabel: t('tokenPrograms.marketingProgram.campaigns.statusEnding') },
    { icon: "📰", type: "article", title: t('tokenPrograms.marketingProgram.campaignList.article.title'), desc: t('tokenPrograms.marketingProgram.campaignList.article.desc'), reward: "20,000", participants: "156", status: "upcoming", statusLabel: t('tokenPrograms.marketingProgram.campaigns.statusUpcoming') },
  ];

  const leaderboard = [
    { rank: 1, name: "CryptoKing", handle: "@crypto_king", tier: "legend", points: "125,340", rewards: "2,450,000" },
    { rank: 2, name: "BlockchainPro", handle: "@bc_pro", tier: "legend", points: "98,720", rewards: "1,890,000" },
    { rank: 3, name: "DeFiMaster", handle: "@defi_master", tier: "elite", points: "76,450", rewards: "1,240,000" },
    { rank: 4, name: "TokenHunter", handle: "@token_hunter", tier: "elite", points: "54,210", rewards: "890,000" },
    { rank: 5, name: "CryptoNinja", handle: "@crypto_ninja", tier: "rising", points: "42,890", rewards: "650,000" },
  ];

  return (
    <div className="marketing-program-page">
      <style>{`
        .marketing-program-page {
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
          --rose: #F43F5E;
          --fuchsia: #D946EF;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-marketing: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
          --gradient-ambassador: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes megaphone { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }

        .marketing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(236, 72, 153, 0.2);
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
        .nav-links a:hover { color: var(--pink); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-marketing);
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
          box-shadow: 0 10px 40px rgba(236, 72, 153, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(244, 63, 94, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
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
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--pink);
          margin-bottom: 2rem;
        }

        .badge .megaphone-icon { animation: megaphone 1s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-marketing);
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

        .social-stats-banner {
          background: linear-gradient(90deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .social-stat {
          text-align: center;
          position: relative;
        }

        .social-stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .social-stat .icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .social-stat .value { font-size: 1.25rem; font-weight: 800; color: var(--pink); }
        .social-stat .label { font-size: 0.75rem; color: var(--gray); margin-top: 0.25rem; }

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
          border-color: var(--pink);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-marketing);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-marketing);
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
          box-shadow: 0 20px 60px rgba(236, 72, 153, 0.4);
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

        .btn-secondary:hover { border-color: var(--pink); color: var(--pink); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(236, 72, 153, 0.15);
          color: var(--pink);
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
          border-color: var(--pink);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.brand::before { background: var(--gradient-marketing); }
        .dist-card.influencer::before { background: linear-gradient(90deg, var(--rose), var(--warning)); }
        .dist-card.creator::before { background: linear-gradient(90deg, var(--cyan), var(--blue)); }
        .dist-card.event::before { background: linear-gradient(90deg, var(--purple), var(--fuchsia)); }
        .dist-card.pr::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--pink); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .programs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .program-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .program-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          border-color: var(--pink);
        }

        .program-card.featured {
          border-color: var(--pink);
          box-shadow: 0 0 40px rgba(236, 72, 153, 0.2);
        }

        .program-header {
          padding: 2rem;
          position: relative;
        }

        .program-card.ambassador .program-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1)); }
        .program-card.influencer .program-header { background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(245, 158, 11, 0.1)); }
        .program-card.creator .program-header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.1)); }
        .program-card.event .program-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1)); }

        .program-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .program-badge.hot { background: var(--gradient-marketing); color: var(--white); }
        .program-badge.new { background: var(--success); color: var(--white); }

        .program-icon { font-size: 3rem; margin-bottom: 1rem; }
        .program-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
        .program-subtitle { color: var(--light-gray); font-size: 0.9rem; }

        .program-content { padding: 0 2rem 2rem; }

        .program-rewards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .reward-box {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          text-align: center;
        }

        .reward-box .value { font-size: 1.25rem; font-weight: 800; color: var(--pink); margin-bottom: 0.25rem; }
        .reward-box .label { font-size: 0.75rem; color: var(--gray); }

        .program-features { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .program-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .program-features li:last-child { border-bottom: none; }
        .program-features li::before { content: '✓'; color: var(--success); }

        .program-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          background: var(--gradient-marketing);
          color: var(--white);
        }

        .program-btn:hover { transform: scale(1.02); }

        .ambassador-tiers {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .ambassador-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .ambassador-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .ambassador-card.legend { border-color: var(--gold); background: linear-gradient(180deg, rgba(212, 175, 55, 0.1), transparent); }
        .ambassador-card.elite { border-color: var(--pink); }
        .ambassador-card.rising { border-color: var(--purple); }
        .ambassador-card.starter { border-color: var(--cyan); }

        .ambassador-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }

        .ambassador-tier { font-size: 1.125rem; font-weight: 800; margin-bottom: 0.25rem; }

        .ambassador-card.legend .ambassador-tier { color: var(--gold); }
        .ambassador-card.elite .ambassador-tier { color: var(--pink); }
        .ambassador-card.rising .ambassador-tier { color: var(--purple); }
        .ambassador-card.starter .ambassador-tier { color: var(--cyan); }

        .ambassador-requirement { font-size: 0.8rem; color: var(--gray); margin-bottom: 1rem; }

        .ambassador-reward {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .ambassador-reward .value { font-size: 1.25rem; font-weight: 800; }

        .ambassador-card.legend .ambassador-reward .value { color: var(--gold); }
        .ambassador-card.elite .ambassador-reward .value { color: var(--pink); }
        .ambassador-card.rising .ambassador-reward .value { color: var(--purple); }
        .ambassador-card.starter .ambassador-reward .value { color: var(--cyan); }

        .ambassador-reward .label { font-size: 0.75rem; color: var(--gray); }

        .ambassador-perks { list-style: none; text-align: left; font-size: 0.8rem; padding: 0; }

        .ambassador-perks li {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
          color: var(--light-gray);
        }

        .ambassador-perks li::before { content: '✓'; color: var(--success); font-size: 10px; }

        .content-types-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .content-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .content-card:hover {
          transform: translateY(-5px);
          border-color: var(--pink);
        }

        .content-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(236, 72, 153, 0.2);
        }

        .content-title { font-weight: 700; margin-bottom: 0.5rem; }
        .content-desc { font-size: 0.85rem; color: var(--gray); margin-bottom: 1rem; }
        .content-reward { font-weight: 800; color: var(--pink); }

        .campaigns-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .campaigns-header {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), transparent);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .campaigns-header h3 { font-size: 1.25rem; font-weight: 700; }

        .campaigns-list { padding: 0 2rem 2rem; }

        .campaign-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          margin-bottom: 1rem;
          transition: all 0.3s;
        }

        .campaign-item:last-child { margin-bottom: 0; }
        .campaign-item:hover { background: rgba(255, 255, 255, 0.05); }

        .campaign-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .campaign-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(236, 72, 153, 0.2);
        }

        .campaign-info h4 { font-weight: 700; margin-bottom: 0.25rem; }
        .campaign-info p { font-size: 0.85rem; color: var(--gray); }

        .campaign-center { display: flex; gap: 2rem; }

        .campaign-stat { text-align: center; }
        .campaign-stat .value { font-weight: 700; color: var(--pink); }
        .campaign-stat .label { font-size: 0.7rem; color: var(--gray); }

        .campaign-right { display: flex; align-items: center; gap: 1rem; }

        .campaign-status {
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .campaign-status.active { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .campaign-status.ending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .campaign-status.upcoming { background: rgba(59, 130, 246, 0.15); color: var(--blue); }

        .campaign-join-btn {
          padding: 10px 20px;
          border-radius: 10px;
          background: var(--gradient-marketing);
          color: var(--white);
          font-weight: 600;
          font-size: 0.85rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .campaign-join-btn:hover { transform: scale(1.05); }

        .leaderboard-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .leaderboard-header h3 { font-size: 1.25rem; font-weight: 700; }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leaderboard-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--light-gray);
        }

        .leaderboard-table th:first-child { border-radius: 12px 0 0 12px; }
        .leaderboard-table th:last-child { border-radius: 0 12px 12px 0; }

        .leaderboard-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .leaderboard-table tr:hover td { background: rgba(255, 255, 255, 0.02); }

        .rank-cell {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .rank-cell.gold { background: var(--gradient-gold); color: var(--dark); }
        .rank-cell.silver { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank-cell.bronze { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank-cell.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .ambassador-cell { display: flex; align-items: center; gap: 12px; }

        .ambassador-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .ambassador-avatar.legend { background: var(--gradient-gold); color: var(--dark); }
        .ambassador-avatar.elite { background: var(--gradient-marketing); }
        .ambassador-avatar.rising { background: var(--purple); }

        .ambassador-name { font-weight: 600; }
        .ambassador-handle { font-size: 0.75rem; color: var(--gray); }

        .points-cell { font-weight: 700; color: var(--pink); }
        .rewards-cell { font-weight: 700; color: var(--gold); }

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

        .faq-chevron { color: var(--pink); transition: transform 0.3s; }
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
          background: var(--gradient-marketing);
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

        .social-links a:hover { background: var(--pink); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--pink); }

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
          .programs-grid { grid-template-columns: 1fr; }
          .ambassador-tiers, .content-types-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .social-stats-banner { grid-template-columns: repeat(3, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .social-stats-banner { grid-template-columns: repeat(2, 1fr); }
          .ambassador-tiers, .content-types-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="marketing-header">
        <div className="header-container">
          <a href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </a>
          <nav className="nav-links">
            <a 
              href="#programs" 
              onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}
              data-testid="nav-programs"
            >{t('tokenPrograms.marketingProgram.nav.programs')}</a>
            <a 
              href="#ambassador" 
              onClick={(e) => { e.preventDefault(); scrollToSection('ambassador'); }}
              data-testid="nav-ambassador"
            >{t('tokenPrograms.marketingProgram.nav.ambassador')}</a>
            <a 
              href="#campaigns" 
              onClick={(e) => { e.preventDefault(); scrollToSection('campaigns'); }}
              data-testid="nav-campaigns"
            >{t('tokenPrograms.marketingProgram.nav.campaigns')}</a>
            <a 
              href="#leaderboard" 
              onClick={(e) => { e.preventDefault(); scrollToSection('leaderboard'); }}
              data-testid="nav-leaderboard"
            >{t('tokenPrograms.marketingProgram.nav.leaderboard')}</a>
            <a 
              href="#faq" 
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="nav-faq"
            >FAQ</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleWalletClick}
            >
              {isConnected ? `${formatAddress(address || '')}` : t('tokenPrograms.marketingProgram.wallet.connect')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="megaphone-icon">📢</span> {t('tokenPrograms.marketingProgram.hero.badge')}
          </div>
          <h1>
            {t('tokenPrograms.marketingProgram.hero.title')}<br />
            <span className="gradient-text">{t('tokenPrograms.marketingProgram.hero.fundAmount')}</span> {t('tokenPrograms.marketingProgram.hero.incentive')}
          </h1>
          <p className="hero-subtitle">
            {t('tokenPrograms.marketingProgram.hero.subtitle')}
          </p>

          <div className="social-stats-banner" data-testid="social-stats">
            {socialStats.map((stat, idx) => (
              <div key={idx} className="social-stat">
                <div className="icon">{stat.icon}</div>
                <div className="value">{stat.value}</div>
                <div className="label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="stats-grid" data-testid="marketing-stats-grid">
            <div className="stat-card" data-testid="stat-total-marketing">
              <div className="stat-value">
                {isLoadingStats ? '...' : marketingStats?.totalBudget ? `${(parseInt(marketingStats.totalBudget) / 1000000).toFixed(0)}M` : '300M'}
              </div>
              <div className="stat-label">{t('tokenPrograms.marketingProgram.stats.totalBudget')}</div>
            </div>
            <div className="stat-card" data-testid="stat-ambassadors">
              <div className="stat-value">
                {isLoadingStats ? '...' : marketingStats?.conversions ? `${(marketingStats.conversions / 1000).toFixed(0)}K+` : '2,500+'}
              </div>
              <div className="stat-label">{t('tokenPrograms.marketingProgram.stats.activeAmbassadors')}</div>
            </div>
            <div className="stat-card" data-testid="stat-campaigns">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${marketingStats?.campaigns || 50}+`}
              </div>
              <div className="stat-label">{t('tokenPrograms.marketingProgram.stats.ongoingCampaigns')}</div>
            </div>
            <div className="stat-card" data-testid="stat-monthly-reward">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${marketingStats?.activeCampaigns || 5}`}
              </div>
              <div className="stat-label">{t('tokenPrograms.marketingProgram.stats.activeCampaigns')}</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-join-ambassador"
              onClick={handleJoinAmbassador}
            >
              {t('tokenPrograms.marketingProgram.cta.joinAmbassador')}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-view-guide"
              onClick={handleViewGuide}
            >
              {t('tokenPrograms.marketingProgram.cta.viewGuide')}
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">{t('tokenPrograms.marketingProgram.sections.distribution.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.marketingProgram.sections.distribution.subtitle')}</p>
        </div>

        <div className="distribution-grid">
          {distributions.map(dist => (
            <div key={dist.id} className={`dist-card ${dist.id}`} data-testid={`dist-${dist.id}`}>
              <div className="dist-icon">{dist.icon}</div>
              <div className="dist-name">{dist.name}</div>
              <div className="dist-amount">{dist.amount}</div>
              <div className="dist-percent">{dist.percent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section className="section" id="programs" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PROGRAMS</span>
          <h2 className="section-title">{t('tokenPrograms.marketingProgram.sections.programs.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.marketingProgram.sections.programs.subtitle')}</p>
        </div>

        <div className="programs-grid">
          {programs.map(program => (
            <div key={program.id} className={`program-card ${program.id} ${program.featured ? 'featured' : ''}`} data-testid={`program-${program.id}`}>
              <div className="program-header">
                {program.badge && (
                  <span className={`program-badge ${program.badge.toLowerCase()}`}>{program.badge}</span>
                )}
                <div className="program-icon">{program.icon}</div>
                <h3 className="program-title">{program.title}</h3>
                <p className="program-subtitle">{program.subtitle}</p>
              </div>
              <div className="program-content">
                <div className="program-rewards">
                  {program.rewards.map((reward, idx) => (
                    <div key={idx} className="reward-box">
                      <div className="value">{reward.value}</div>
                      <div className="label">{reward.label}</div>
                    </div>
                  ))}
                </div>
                <ul className="program-features">
                  {program.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button 
                  className="program-btn"
                  data-testid={`button-apply-${program.id}`}
                  onClick={() => handleApplyProgram(program.title)}
                >
                  {t('tokenPrograms.marketingProgram.cta.participate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ambassador Tiers Section */}
      <section className="section" id="ambassador">
        <div className="section-header">
          <span className="section-badge">AMBASSADOR</span>
          <h2 className="section-title">{t('tokenPrograms.marketingProgram.sections.ambassador.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.marketingProgram.sections.ambassador.subtitle')}</p>
        </div>

        <div className="ambassador-tiers">
          {ambassadorTiers.map(tier => (
            <div key={tier.id} className={`ambassador-card ${tier.id}`} data-testid={`ambassador-${tier.id}`}>
              <div className="ambassador-icon">{tier.icon}</div>
              <h3 className="ambassador-tier">{tier.tier}</h3>
              <p className="ambassador-requirement">{tier.requirement}</p>
              <div className="ambassador-reward">
                <div className="value">{tier.reward}</div>
                <div className="label">TBURN</div>
              </div>
              <ul className="ambassador-perks">
                {tier.perks.map((perk, idx) => (
                  <li key={idx}>{perk}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Content Types Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">CONTENT</span>
          <h2 className="section-title">{t('tokenPrograms.marketingProgram.sections.content.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.marketingProgram.sections.content.subtitle')}</p>
        </div>

        <div className="content-types-grid">
          {contentTypes.map((content, idx) => (
            <div key={idx} className="content-card">
              <div className="content-icon">{content.icon}</div>
              <h4 className="content-title">{content.title}</h4>
              <p className="content-desc">{content.desc}</p>
              <div className="content-reward">{content.reward}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="section" id="campaigns">
        <div className="section-header">
          <span className="section-badge">CAMPAIGNS</span>
          <h2 className="section-title">{t('tokenPrograms.marketingProgram.sections.campaigns.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.marketingProgram.sections.campaigns.subtitle')}</p>
        </div>

        <div className="campaigns-container">
          <div className="campaigns-header">
            <h3>🎯 {t('tokenPrograms.marketingProgram.campaigns.activeCampaigns')}</h3>
          </div>
          <div className="campaigns-list">
            {campaigns.map((campaign, idx) => (
              <div key={idx} className="campaign-item">
                <div className="campaign-left">
                  <div className="campaign-icon">{campaign.icon}</div>
                  <div className="campaign-info">
                    <h4>{campaign.title}</h4>
                    <p>{campaign.desc}</p>
                  </div>
                </div>
                <div className="campaign-center">
                  <div className="campaign-stat">
                    <div className="value">{campaign.reward}</div>
                    <div className="label">TBURN</div>
                  </div>
                  <div className="campaign-stat">
                    <div className="value">{campaign.participants}</div>
                    <div className="label">{t('tokenPrograms.marketingProgram.campaigns.participants')}</div>
                  </div>
                </div>
                <div className="campaign-right">
                  <span className={`campaign-status ${campaign.status}`}>{campaign.statusLabel}</span>
                  <button 
                    className="campaign-join-btn"
                    data-testid={`button-join-campaign-${campaign.type}`}
                    onClick={() => handleJoinCampaign(campaign.title, campaign.status)}
                  >
                    {t('tokenPrograms.marketingProgram.cta.participate')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="section" id="leaderboard" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">LEADERBOARD</span>
          <h2 className="section-title">{t('tokenPrograms.marketingProgram.sections.leaderboard.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.marketingProgram.sections.leaderboard.subtitle')}</p>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h3>🏆 {t('tokenPrograms.marketingProgram.leaderboard.top5')}</h3>
          </div>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>{t('tokenPrograms.marketingProgram.leaderboard.rank')}</th>
                <th>{t('tokenPrograms.marketingProgram.leaderboard.ambassador')}</th>
                <th>{t('tokenPrograms.marketingProgram.leaderboard.points')}</th>
                <th>{t('tokenPrograms.marketingProgram.leaderboard.rewards')}</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`rank-cell ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal'}`}>
                      {user.rank}
                    </span>
                  </td>
                  <td>
                    <div className="ambassador-cell">
                      <div className={`ambassador-avatar ${user.tier}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="ambassador-name">{user.name}</div>
                        <div className="ambassador-handle">{user.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="points-cell">{user.points}</td>
                  <td className="rewards-cell">{user.rewards} TBURN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">{t('tokenPrograms.marketingProgram.sections.faq.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.marketingProgram.sections.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-item-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('tokenPrograms.marketingProgram.faq.q1')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.marketingProgram.faq.a1')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-item-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('tokenPrograms.marketingProgram.faq.q2')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.marketingProgram.faq.a2')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-item-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('tokenPrograms.marketingProgram.faq.q3')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.marketingProgram.faq.a3')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-item-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('tokenPrograms.marketingProgram.faq.q4')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.marketingProgram.faq.a4')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-item-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('tokenPrograms.marketingProgram.faq.q5')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.marketingProgram.faq.a5')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-item-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('tokenPrograms.marketingProgram.faq.q6')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.marketingProgram.faq.a6')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-item-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('tokenPrograms.marketingProgram.faq.q7')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.marketingProgram.faq.a7')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-item-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('tokenPrograms.marketingProgram.faq.q8')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.marketingProgram.faq.a8')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('tokenPrograms.marketingProgram.ctaSection.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('tokenPrograms.marketingProgram.ctaSection.description')}
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--pink)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-apply"
            onClick={() => { 
              scrollToSection('ambassador'); 
              toast({ title: t('tokenPrograms.marketingProgram.ctaSection.toastTitle'), description: t('tokenPrograms.marketingProgram.ctaSection.toastDesc') }); 
            }}
          >
            {t('tokenPrograms.marketingProgram.cta.joinAmbassador')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('tokenPrograms.marketingProgram.footer.tagline')}<br />THE FUTURE IS NOW</p>
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
              <li><a href="/" data-testid="footer-link-mainnet">{t('tokenPrograms.marketingProgram.footer.mainnet')}</a></li>
              <li><a href="/scan" data-testid="footer-link-explorer">{t('tokenPrograms.marketingProgram.footer.explorer')}</a></li>
              <li><a href="/app/bridge" data-testid="footer-link-bridge">{t('tokenPrograms.marketingProgram.footer.bridge')}</a></li>
              <li><a href="/app/staking" data-testid="footer-link-staking">{t('tokenPrograms.marketingProgram.footer.staking')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="/learn/whitepaper" data-testid="footer-link-whitepaper">{t('tokenPrograms.marketingProgram.footer.whitepaper')}</a></li>
              <li><a href="/developers/docs" data-testid="footer-link-docs">{t('tokenPrograms.marketingProgram.footer.docs')}</a></li>
              <li><a 
                href="https://github.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('GitHub', 'https://github.com/tburnchain'); }}
                data-testid="footer-link-github-resources"
              >GitHub</a></li>
              <li><a href="/security-audit" data-testid="footer-link-audit">{t('tokenPrograms.marketingProgram.footer.audit')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><a href="/community/news" data-testid="footer-link-blog">{t('tokenPrograms.marketingProgram.footer.blog')}</a></li>
              <li><a href="/marketing-program" data-testid="footer-link-ambassador">{t('tokenPrograms.marketingProgram.footer.ambassador')}</a></li>
              <li><a href="/ecosystem-fund" data-testid="footer-link-grants">{t('tokenPrograms.marketingProgram.footer.grants')}</a></li>
              <li><a href="/qna" data-testid="footer-link-support">{t('tokenPrograms.marketingProgram.footer.support')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">{t('tokenPrograms.marketingProgram.footer.terms')}</a>
            <a href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">{t('tokenPrograms.marketingProgram.footer.privacy')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
