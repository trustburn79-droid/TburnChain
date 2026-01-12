import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectionModal, useWalletModal } from "@/components/WalletConnectionModal";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";

interface CommunityStatsData {
  totalContributors: number;
  totalContributions: number;
  totalRewardsDistributed: string;
  activeTasks: number;
  categories: Array<{ name: string; tasks: number; rewards: string; participants: number }>;
}

interface CommunityStatsResponse {
  success: boolean;
  data: CommunityStatsData;
}

export default function CommunityProgramPage() {
  const { t } = useTranslation();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { isConnected, address, disconnect, formatAddress } = useWeb3();
  const { isOpen: walletModalOpen, setIsOpen: setWalletModalOpen, openModal: openWalletModal } = useWalletModal();
  const { toast } = useToast();

  const { data: response, isLoading } = useQuery<CommunityStatsResponse>({
    queryKey: ['/api/token-programs/community/stats'],
  });
  const stats = response?.data;

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
      toast({ title: t('communityProgram.toast.walletDisconnected'), description: t('communityProgram.toast.walletDisconnectedDesc') });
    } else {
      openWalletModal();
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyProgram = (programId: string, programTitle: string) => {
    if (!isConnected) {
      openWalletModal();
      return;
    }
    toast({ 
      title: t('communityProgram.toast.applicationSubmitted'), 
      description: t('communityProgram.toast.applicationSubmittedDesc')
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const programs = [
    { 
      id: "ambassador", 
      icon: "🌟", 
      featured: true,
      titleKey: "communityProgram.programs.ambassador.title",
      subtitleKey: "communityProgram.programs.ambassador.subtitle",
      rewardKey: "communityProgram.programs.ambassador.reward",
      benefitKeys: ["communityProgram.programs.ambassador.benefit1", "communityProgram.programs.ambassador.benefit2", "communityProgram.programs.ambassador.benefit3", "communityProgram.programs.ambassador.benefit4"],
      requirementsKey: "communityProgram.programs.ambassador.requirements"
    },
    { 
      id: "creator", 
      icon: "🎨", 
      featured: true,
      titleKey: "communityProgram.programs.creator.title",
      subtitleKey: "communityProgram.programs.creator.subtitle",
      rewardKey: "communityProgram.programs.creator.reward",
      benefitKeys: ["communityProgram.programs.creator.benefit1", "communityProgram.programs.creator.benefit2", "communityProgram.programs.creator.benefit3", "communityProgram.programs.creator.benefit4"],
      requirementsKey: "communityProgram.programs.creator.requirements"
    },
    { 
      id: "moderator", 
      icon: "🛡️", 
      featured: false,
      titleKey: "communityProgram.programs.moderator.title",
      subtitleKey: "communityProgram.programs.moderator.subtitle",
      rewardKey: "communityProgram.programs.moderator.reward",
      benefitKeys: ["communityProgram.programs.moderator.benefit1", "communityProgram.programs.moderator.benefit2", "communityProgram.programs.moderator.benefit3", "communityProgram.programs.moderator.benefit4"],
      requirementsKey: "communityProgram.programs.moderator.requirements"
    },
    { 
      id: "educator", 
      icon: "📚", 
      featured: false,
      titleKey: "communityProgram.programs.educator.title",
      subtitleKey: "communityProgram.programs.educator.subtitle",
      rewardKey: "communityProgram.programs.educator.reward",
      benefitKeys: ["communityProgram.programs.educator.benefit1", "communityProgram.programs.educator.benefit2", "communityProgram.programs.educator.benefit3", "communityProgram.programs.educator.benefit4"],
      requirementsKey: "communityProgram.programs.educator.requirements"
    },
    { 
      id: "translator", 
      icon: "🌍", 
      featured: false,
      titleKey: "communityProgram.programs.translator.title",
      subtitleKey: "communityProgram.programs.translator.subtitle",
      rewardKey: "communityProgram.programs.translator.reward",
      benefitKeys: ["communityProgram.programs.translator.benefit1", "communityProgram.programs.translator.benefit2", "communityProgram.programs.translator.benefit3", "communityProgram.programs.translator.benefit4"],
      requirementsKey: "communityProgram.programs.translator.requirements"
    },
    { 
      id: "bounty", 
      icon: "🏆", 
      featured: false,
      titleKey: "communityProgram.programs.bounty.title",
      subtitleKey: "communityProgram.programs.bounty.subtitle",
      rewardKey: "communityProgram.programs.bounty.reward",
      benefitKeys: ["communityProgram.programs.bounty.benefit1", "communityProgram.programs.bounty.benefit2"],
      requirementsKey: "communityProgram.programs.bounty.requirements"
    },
  ];

  const tiers = [
    { id: "newcomer", icon: "🌱", nameKey: "communityProgram.tiers.newcomer.name", pointsKey: "communityProgram.tiers.newcomer.points", multiplier: "x1.0", tierClass: "newcomer" },
    { id: "contributor", icon: "🌿", nameKey: "communityProgram.tiers.contributor.name", pointsKey: "communityProgram.tiers.contributor.points", multiplier: "x1.2", tierClass: "contributor" },
    { id: "advocate", icon: "💠", nameKey: "communityProgram.tiers.advocate.name", pointsKey: "communityProgram.tiers.advocate.points", multiplier: "x1.5", tierClass: "advocate" },
    { id: "champion", icon: "👑", nameKey: "communityProgram.tiers.champion.name", pointsKey: "communityProgram.tiers.champion.points", multiplier: "x2.0", tierClass: "champion" },
    { id: "legend", icon: "⭐", nameKey: "communityProgram.tiers.legend.name", pointsKey: "communityProgram.tiers.legend.points", multiplier: "x3.0", tierClass: "legend" },
  ];

  const activities = [
    { icon: "📝", type: "content", nameKey: "communityProgram.activities.items.blog", categoryKey: "communityProgram.activities.categories.content", points: "+50~200", reward: "50~200 TBURN", frequency: "weekly" },
    { icon: "🎬", type: "content", nameKey: "communityProgram.activities.items.youtube", categoryKey: "communityProgram.activities.categories.content", points: "+100~500", reward: "100~500 TBURN", frequency: "monthly" },
    { icon: "🐦", type: "social", nameKey: "communityProgram.activities.items.tweet", categoryKey: "communityProgram.activities.categories.social", points: "+10~50", reward: "10~50 TBURN", frequency: "daily" },
    { icon: "💬", type: "support", nameKey: "communityProgram.activities.items.qa", categoryKey: "communityProgram.activities.categories.support", points: "+20~100", reward: "20~100 TBURN", frequency: "daily" },
    { icon: "📖", type: "education", nameKey: "communityProgram.activities.items.tutorial", categoryKey: "communityProgram.activities.categories.education", points: "+200~500", reward: "200~500 TBURN", frequency: "once" },
  ];

  const leaderboard = [
    { rank: 1, name: "CryptoKing", tier: "Legend", score: "45,200", badge: "gold" },
    { rank: 2, name: "BlockMaster", tier: "Legend", score: "42,800", badge: "silver" },
    { rank: 3, name: "ChainWizard", tier: "Champion", score: "38,500", badge: "bronze" },
    { rank: 4, name: "DeFiHero", tier: "Champion", score: "35,100", badge: "normal" },
    { rank: 5, name: "TokenSage", tier: "Champion", score: "32,400", badge: "normal" },
  ];

  return (
    <div className="community-page">
      <style>{`
        .community-page {
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
          --teal: #14B8A6;
          --indigo: #6366F1;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-community: linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes wave { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }

        .community-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
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

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--white);
        }

        .logo-text span { color: var(--gold); }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-links a {
          color: var(--light-gray);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-links a:hover { color: var(--cyan); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-community);
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
          box-shadow: 0 10px 40px rgba(6, 182, 212, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%);
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
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--cyan);
          margin-bottom: 2rem;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-community);
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
          border-color: var(--cyan);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-community);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .cta-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: var(--gradient-community);
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
          box-shadow: 0 20px 60px rgba(6, 182, 212, 0.4);
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

        .btn-secondary:hover {
          border-color: var(--cyan);
          color: var(--cyan);
        }

        .section {
          padding: 100px 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-badge {
          display: inline-block;
          background: rgba(6, 182, 212, 0.15);
          color: var(--cyan);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          color: var(--light-gray);
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .distribution-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
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
          border-color: var(--cyan);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.ambassador::before { background: linear-gradient(90deg, var(--cyan), var(--blue)); }
        .dist-card.creator::before { background: linear-gradient(90deg, var(--purple), var(--pink)); }
        .dist-card.moderator::before { background: linear-gradient(90deg, var(--success), var(--teal)); }
        .dist-card.educator::before { background: linear-gradient(90deg, var(--blue), var(--indigo)); }
        .dist-card.translator::before { background: linear-gradient(90deg, var(--warning), var(--gold)); }
        .dist-card.bounty::before { background: linear-gradient(90deg, var(--danger), var(--warning)); }

        .dist-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .dist-name {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .dist-amount {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--cyan);
          margin-bottom: 0.25rem;
        }

        .dist-percent {
          font-size: 0.8rem;
          color: var(--gray);
        }

        .programs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .program-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .program-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .program-card.featured {
          border-color: var(--cyan);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.2);
        }

        .featured-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--gradient-community);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 10;
        }

        .program-header {
          padding: 2rem;
          position: relative;
        }

        .program-header.ambassador { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.1)); }
        .program-header.creator { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1)); }
        .program-header.moderator { background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(20, 184, 166, 0.1)); }
        .program-header.educator { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.1)); }
        .program-header.translator { background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(212, 175, 55, 0.1)); }
        .program-header.bounty { background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.1)); }

        .program-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .program-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .program-subtitle {
          color: var(--light-gray);
          font-size: 0.9rem;
        }

        .program-content {
          padding: 1.5rem 2rem 2rem;
        }

        .program-reward {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .program-reward-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .program-reward-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--gold);
        }

        .program-benefits {
          list-style: none;
          margin-bottom: 1.5rem;
          padding: 0;
        }

        .program-benefits li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .program-benefits li::before {
          content: '✓';
          color: var(--success);
          font-size: 12px;
        }

        .program-requirements {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .program-requirements h5 {
          font-size: 0.8rem;
          color: var(--gray);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .program-requirements p {
          font-size: 0.9rem;
          color: var(--light-gray);
        }

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
        }

        .program-btn.primary {
          background: var(--gradient-community);
          color: var(--white);
        }

        .program-btn:hover {
          transform: scale(1.02);
        }

        .tier-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .tier-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .tier-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .tier-header p {
          color: var(--light-gray);
        }

        .tier-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .tier-card {
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .tier-card:hover {
          transform: translateY(-5px);
        }

        .tier-card.newcomer { border-color: rgba(148, 163, 184, 0.3); }
        .tier-card.contributor { border-color: rgba(34, 197, 94, 0.3); }
        .tier-card.advocate { border-color: rgba(59, 130, 246, 0.3); }
        .tier-card.champion { border-color: rgba(139, 92, 246, 0.3); }
        .tier-card.legend { border-color: rgba(212, 175, 55, 0.5); background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%); }

        .tier-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .tier-name {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .tier-card.newcomer .tier-name { color: var(--light-gray); }
        .tier-card.contributor .tier-name { color: var(--success); }
        .tier-card.advocate .tier-name { color: var(--blue); }
        .tier-card.champion .tier-name { color: var(--purple); }
        .tier-card.legend .tier-name { color: var(--gold); }

        .tier-points {
          font-size: 0.875rem;
          color: var(--gray);
          margin-bottom: 1rem;
        }

        .tier-multiplier {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .tier-card.newcomer .tier-multiplier { background: rgba(148, 163, 184, 0.2); color: var(--light-gray); }
        .tier-card.contributor .tier-multiplier { background: rgba(34, 197, 94, 0.2); color: var(--success); }
        .tier-card.advocate .tier-multiplier { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
        .tier-card.champion .tier-multiplier { background: rgba(139, 92, 246, 0.2); color: var(--purple); }
        .tier-card.legend .tier-multiplier { background: rgba(212, 175, 55, 0.2); color: var(--gold); }

        .activity-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .activity-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .activity-table {
          width: 100%;
          border-collapse: collapse;
        }

        .activity-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .activity-table th:first-child { border-radius: 12px 0 0 12px; }
        .activity-table th:last-child { border-radius: 0 12px 12px 0; }

        .activity-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .activity-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .activity-type {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .activity-type-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .activity-type-icon.content { background: rgba(139, 92, 246, 0.2); }
        .activity-type-icon.social { background: rgba(6, 182, 212, 0.2); }
        .activity-type-icon.support { background: rgba(34, 197, 94, 0.2); }
        .activity-type-icon.education { background: rgba(59, 130, 246, 0.2); }

        .activity-points {
          font-weight: 700;
          color: var(--cyan);
        }

        .activity-reward {
          font-weight: 700;
          color: var(--gold);
        }

        .frequency-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .frequency-badge.daily { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .frequency-badge.weekly { background: rgba(59, 130, 246, 0.15); color: var(--blue); }
        .frequency-badge.monthly { background: rgba(139, 92, 246, 0.15); color: var(--purple); }
        .frequency-badge.once { background: rgba(245, 158, 11, 0.15); color: var(--warning); }

        .leaderboard-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .leaderboard-header {
          margin-bottom: 2rem;
        }

        .leaderboard-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .leaderboard-item.top-3 {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
        }

        .leaderboard-rank {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .leaderboard-rank.gold { background: var(--gradient-gold); color: var(--dark); }
        .leaderboard-rank.silver { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .leaderboard-rank.bronze { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .leaderboard-rank.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .leaderboard-info {
          flex: 1;
        }

        .leaderboard-info h5 {
          font-size: 1rem;
          font-weight: 600;
        }

        .leaderboard-info p {
          font-size: 0.8rem;
          color: var(--gray);
        }

        .leaderboard-score {
          font-weight: 700;
          color: var(--cyan);
        }

        .faq-container {
          max-width: 900px;
          margin: 0 auto;
        }

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

        .faq-question:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .faq-question h4 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .faq-chevron {
          color: var(--cyan);
          transition: transform 0.3s;
        }

        .faq-item.active .faq-chevron {
          transform: rotate(180deg);
        }

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

        .faq-answer p {
          color: var(--light-gray);
          line-height: 1.8;
        }

        .cta-section {
          padding: 100px 2rem;
          background: var(--gradient-community);
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

        .footer-brand h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .footer-brand h3 span { color: var(--gold); }

        .footer-brand p {
          color: var(--light-gray);
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

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

        .social-links a:hover {
          background: var(--cyan);
          color: var(--white);
        }

        .footer-links h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a {
          color: var(--light-gray);
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-links a:hover { color: var(--cyan); }

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
          .programs-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .tier-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .programs-grid { grid-template-columns: 1fr; }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .tier-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="community-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a 
              href="#programs"
              onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}
              data-testid="nav-programs"
            >{t('communityProgram.nav.programs')}</a>
            <a 
              href="#tiers"
              onClick={(e) => { e.preventDefault(); scrollToSection('tiers'); }}
              data-testid="nav-tiers"
            >{t('communityProgram.nav.tiers')}</a>
            <a 
              href="#activities"
              onClick={(e) => { e.preventDefault(); scrollToSection('activities'); }}
              data-testid="nav-activities"
            >{t('communityProgram.nav.activities')}</a>
            <a 
              href="#leaderboard"
              onClick={(e) => { e.preventDefault(); scrollToSection('leaderboard'); }}
              data-testid="nav-leaderboard"
            >{t('communityProgram.nav.leaderboard')}</a>
            <a 
              href="#faq"
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="nav-faq"
            >{t('communityProgram.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleWalletClick}
            >
              {isConnected && address ? `🔗 ${formatAddress(address)}` : `🔗 ${t('common.connectWallet')}`}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            👋 {t('communityProgram.hero.badge')}
          </div>
          <h1>
            {t('communityProgram.hero.title')}<br />
            <span className="gradient-text">{t('communityProgram.hero.titleHighlight')}</span> {t('communityProgram.hero.titleSuffix')}
          </h1>
          <p className="hero-subtitle">
            {t('communityProgram.hero.subtitle')}
          </p>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-contributors">
              <div className="stat-value">{isLoading ? '...' : stats?.totalContributors?.toLocaleString() || '0'}</div>
              <div className="stat-label">{t('communityProgram.stats.totalContributors')}</div>
            </div>
            <div className="stat-card" data-testid="stat-total-contributions">
              <div className="stat-value">{isLoading ? '...' : stats?.totalContributions?.toLocaleString() || '0'}</div>
              <div className="stat-label">{t('communityProgram.stats.totalContributions')}</div>
            </div>
            <div className="stat-card" data-testid="stat-total-rewards">
              <div className="stat-value">{isLoading ? '...' : Number(stats?.totalRewardsDistributed || 0).toLocaleString()}</div>
              <div className="stat-label">{t('communityProgram.stats.rewardsDistributed')}</div>
            </div>
            <div className="stat-card" data-testid="stat-active-tasks">
              <div className="stat-value">{isLoading ? '...' : stats?.activeTasks || '0'}</div>
              <div className="stat-label">{t('communityProgram.stats.activeTasks')}</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply"
              onClick={() => { scrollToSection('programs'); toast({ title: t('communityProgram.toast.selectProgram'), description: t('communityProgram.toast.selectProgramDesc') }); }}
            >
              {t('communityProgram.hero.applyNow')}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-guide"
              onClick={() => { scrollToSection('activities'); toast({ title: t('communityProgram.toast.guide'), description: t('communityProgram.toast.guideDesc') }); }}
            >
              {t('communityProgram.hero.viewGuide')}
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t('communityProgram.distribution.badge')}</span>
          <h2 className="section-title">{t('communityProgram.distribution.title')}</h2>
          <p className="section-subtitle">{t('communityProgram.distribution.subtitle')}</p>
        </div>

        <div className="distribution-grid">
          <div className="dist-card ambassador" data-testid="dist-ambassador">
            <div className="dist-icon">🌟</div>
            <div className="dist-name">{t('communityProgram.distribution.ambassador')}</div>
            <div className="dist-amount">{t('communityProgram.distribution.amount90m')}</div>
            <div className="dist-percent">30%</div>
          </div>
          <div className="dist-card creator" data-testid="dist-creator">
            <div className="dist-icon">🎨</div>
            <div className="dist-name">{t('communityProgram.distribution.creator')}</div>
            <div className="dist-amount">{t('communityProgram.distribution.amount60m')}</div>
            <div className="dist-percent">20%</div>
          </div>
          <div className="dist-card moderator" data-testid="dist-moderator">
            <div className="dist-icon">🛡️</div>
            <div className="dist-name">{t('communityProgram.distribution.moderator')}</div>
            <div className="dist-amount">{t('communityProgram.distribution.amount45m')}</div>
            <div className="dist-percent">15%</div>
          </div>
          <div className="dist-card educator" data-testid="dist-educator">
            <div className="dist-icon">📚</div>
            <div className="dist-name">{t('communityProgram.distribution.educator')}</div>
            <div className="dist-amount">{t('communityProgram.distribution.amount45m')}</div>
            <div className="dist-percent">15%</div>
          </div>
          <div className="dist-card translator" data-testid="dist-translator">
            <div className="dist-icon">🌍</div>
            <div className="dist-name">{t('communityProgram.distribution.translator')}</div>
            <div className="dist-amount">{t('communityProgram.distribution.amount30m')}</div>
            <div className="dist-percent">10%</div>
          </div>
          <div className="dist-card bounty" data-testid="dist-bounty">
            <div className="dist-icon">🏆</div>
            <div className="dist-name">{t('communityProgram.distribution.bounty')}</div>
            <div className="dist-amount">{t('communityProgram.distribution.amount30m')}</div>
            <div className="dist-percent">10%</div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section" id="programs" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('communityProgram.programs.badge')}</span>
          <h2 className="section-title">{t('communityProgram.programs.title')}</h2>
          <p className="section-subtitle">{t('communityProgram.programs.subtitle')}</p>
        </div>

        <div className="programs-grid">
          {programs.map(program => (
            <div key={program.id} className={`program-card ${program.featured ? 'featured' : ''}`} data-testid={`program-${program.id}`}>
              {program.featured && <span className="featured-badge">{t('communityProgram.programs.featuredBadge')}</span>}
              <div className={`program-header ${program.id}`}>
                <div className="program-icon">{program.icon}</div>
                <h3 className="program-title">{t(program.titleKey)}</h3>
                <p className="program-subtitle">{t(program.subtitleKey)}</p>
              </div>
              <div className="program-content">
                <div className="program-reward">
                  <span className="program-reward-label">{t('communityProgram.programs.reward')}</span>
                  <span className="program-reward-value">{t(program.rewardKey)}</span>
                </div>
                <ul className="program-benefits">
                  {program.benefitKeys.map((benefitKey, idx) => (
                    <li key={idx}>{t(benefitKey)}</li>
                  ))}
                </ul>
                <div className="program-requirements">
                  <h5>{t('communityProgram.programs.requirements')}</h5>
                  <p>{t(program.requirementsKey)}</p>
                </div>
                <button 
                  className="program-btn primary"
                  onClick={() => handleApplyProgram(program.id, t(program.titleKey))}
                  data-testid={`button-apply-${program.id}`}
                >
                  {isConnected ? t('communityProgram.programs.applyBtn') : t('communityProgram.programs.connectFirst')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tier System Section */}
      <section className="section" id="tiers">
        <div className="section-header">
          <span className="section-badge">{t('communityProgram.tiers.badge')}</span>
          <h2 className="section-title">{t('communityProgram.tiers.title')}</h2>
          <p className="section-subtitle">{t('communityProgram.tiers.subtitle')}</p>
        </div>

        <div className="tier-section">
          <div className="tier-header">
            <h3>🏅 {t('communityProgram.tiers.benefitsTitle')}</h3>
            <p>{t('communityProgram.tiers.benefitsSubtitle')}</p>
          </div>

          <div className="tier-grid">
            {tiers.map(tier => (
              <div key={tier.id} className={`tier-card ${tier.tierClass}`} data-testid={`tier-${tier.id}`}>
                <div className="tier-icon">{tier.icon}</div>
                <div className="tier-name">{t(tier.nameKey)}</div>
                <div className="tier-points">{t(tier.pointsKey)}</div>
                <div className="tier-multiplier">{tier.multiplier}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="section" id="activities" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('communityProgram.activities.badge')}</span>
          <h2 className="section-title">{t('communityProgram.activities.title')}</h2>
          <p className="section-subtitle">{t('communityProgram.activities.subtitle')}</p>
        </div>

        <div className="activity-section">
          <div className="activity-header">
            <h3>📊 {t('communityProgram.activities.tableTitle')}</h3>
          </div>

          <table className="activity-table">
            <thead>
              <tr>
                <th>{t('communityProgram.activities.columnActivity')}</th>
                <th>{t('communityProgram.activities.columnCategory')}</th>
                <th>{t('communityProgram.activities.columnPoints')}</th>
                <th>{t('communityProgram.activities.columnReward')}</th>
                <th>{t('communityProgram.activities.columnFrequency')}</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="activity-type">
                      <div className={`activity-type-icon ${activity.type}`}>{activity.icon}</div>
                      <span>{t(activity.nameKey)}</span>
                    </div>
                  </td>
                  <td>{t(activity.categoryKey)}</td>
                  <td className="activity-points">{activity.points}</td>
                  <td className="activity-reward">{activity.reward}</td>
                  <td>
                    <span className={`frequency-badge ${activity.frequency}`}>
                      {t(`communityProgram.activities.frequency.${activity.frequency}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="section" id="leaderboard">
        <div className="section-header">
          <span className="section-badge">{t('communityProgram.leaderboard.badge')}</span>
          <h2 className="section-title">{t('communityProgram.leaderboard.title')}</h2>
          <p className="section-subtitle">{t('communityProgram.leaderboard.subtitle')}</p>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h3>🏆 {t('communityProgram.leaderboard.topContributors')}</h3>
          </div>

          <div className="leaderboard-list">
            {leaderboard.map((item, idx) => (
              <div key={idx} className={`leaderboard-item ${idx < 3 ? 'top-3' : ''}`}>
                <div className={`leaderboard-rank ${item.badge}`}>{item.rank}</div>
                <div className="leaderboard-info">
                  <h5>{item.name}</h5>
                  <p>{item.tier}</p>
                </div>
                <div className="leaderboard-score">{item.score} pts</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('communityProgram.faq.badge')}</span>
          <h2 className="section-title">{t('communityProgram.faq.title')}</h2>
          <p className="section-subtitle">{t('communityProgram.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('communityProgram.faq.q1.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('communityProgram.faq.q1.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('communityProgram.faq.q2.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('communityProgram.faq.q2.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('communityProgram.faq.q3.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('communityProgram.faq.q3.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('communityProgram.faq.q4.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('communityProgram.faq.q4.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('communityProgram.faq.q5.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('communityProgram.faq.q5.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('communityProgram.faq.q6.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('communityProgram.faq.q6.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('communityProgram.faq.q7.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('communityProgram.faq.q7.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('communityProgram.faq.q8.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('communityProgram.faq.q8.answer')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-testid="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('communityProgram.cta.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('communityProgram.cta.subtitle')}<br />
            {t('communityProgram.cta.subtitleLine2')}
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--cyan)', fontSize: '1.25rem', padding: '20px 50px' }}
            onClick={() => { scrollToSection('programs'); toast({ title: t('communityProgram.toast.selectProgram'), description: t('communityProgram.toast.selectProgramDesc') }); }}
            data-testid="button-cta-start"
          >
            {t('communityProgram.cta.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('communityProgram.footer.brand.tagline')}<br />{t('communityProgram.footer.brand.slogan')}</p>
            <div className="social-links">
              <a 
                href="https://twitter.com/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleShareSocial('Twitter', 'https://twitter.com/tburnchain')}
                aria-label="Twitter"
                data-testid="link-twitter"
              >𝕏</a>
              <a 
                href="https://t.me/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleShareSocial('Telegram', 'https://t.me/tburnchain')}
                aria-label="Telegram"
                data-testid="link-telegram"
              >✈</a>
              <a 
                href="https://discord.gg/tburn" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleShareSocial('Discord', 'https://discord.gg/tburn')}
                aria-label="Discord"
                data-testid="link-discord"
              >💬</a>
              <a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleShareSocial('GitHub', 'https://github.com/tburn-chain')}
                aria-label="GitHub"
                data-testid="link-github"
              >⌘</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>{t('communityProgram.footer.product.title')}</h4>
            <ul>
              <li><Link href="/" data-testid="footer-link-mainnet">{t('communityProgram.footer.product.mainnet')}</Link></li>
              <li><Link href="/scan" data-testid="footer-link-explorer">{t('communityProgram.footer.product.explorer')}</Link></li>
              <li><Link href="/app/bridge" data-testid="footer-link-bridge">{t('communityProgram.footer.product.bridge')}</Link></li>
              <li><Link href="/app/staking" data-testid="footer-link-staking">{t('communityProgram.footer.product.staking')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('communityProgram.footer.resources.title')}</h4>
            <ul>
              <li><Link href="/learn/whitepaper" data-testid="footer-link-whitepaper">{t('communityProgram.footer.resources.whitepaper')}</Link></li>
              <li><Link href="/developers/docs" data-testid="footer-link-docs">{t('communityProgram.footer.resources.docs')}</Link></li>
              <li><a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => toast({ title: "GitHub", description: t('communityProgram.toast.githubRedirect') })}
                data-testid="footer-link-github"
              >{t('communityProgram.footer.resources.github')}</a></li>
              <li><Link href="/security-audit" data-testid="footer-link-audit">{t('communityProgram.footer.resources.blog')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('communityProgram.footer.community.title')}</h4>
            <ul>
              <li><Link href="/community/news" data-testid="footer-link-blog">{t('communityProgram.footer.community.blog')}</Link></li>
              <li><Link href="/ambassador" data-testid="footer-link-ambassador">{t('communityProgram.footer.community.ambassador')}</Link></li>
              <li><Link href="/grants" data-testid="footer-link-grants">{t('communityProgram.footer.community.grants')}</Link></li>
              <li><Link href="/qna" data-testid="footer-link-support">{t('communityProgram.footer.community.support')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('communityProgram.footer.copyright')}</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">{t('communityProgram.footer.legal.terms')}</Link>
            <Link href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">{t('communityProgram.footer.legal.privacy')}</Link>
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
