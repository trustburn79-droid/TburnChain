import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectionModal, useWalletModal } from "@/components/WalletConnectionModal";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";

interface DAOStatsData {
  totalProposals: number;
  activeProposals: number;
  totalVotes: number;
  totalVotingPower: number;
  quorumThreshold: number;
  recentProposals: Array<{
    id: string;
    title: string;
    status: string;
    forVotes: number;
    againstVotes: number;
  }>;
}

interface DAOStatsResponse {
  success: boolean;
  data: DAOStatsData;
}

export default function DAOGovernancePage() {
  const { t } = useTranslation();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { isConnected, address, disconnect, formatAddress } = useWeb3();
  const { isOpen: walletModalOpen, setIsOpen: setWalletModalOpen, openModal: openWalletModal } = useWalletModal();
  const { toast } = useToast();

  const { data: response, isLoading } = useQuery<DAOStatsResponse>({
    queryKey: ['/api/token-programs/dao/stats'],
  });
  const stats = response?.data;

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
      toast({ title: t('daoGovernance.toast.disconnected'), description: t('daoGovernance.toast.disconnectedDesc') });
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

  const handleVote = (proposalId: string, voteType: 'for' | 'against') => {
    if (!isConnected) {
      openWalletModal();
      return;
    }
    toast({ 
      title: voteType === 'for' ? t('daoGovernance.toast.voteFor') : t('daoGovernance.toast.voteAgainst'),
      description: t('daoGovernance.toast.voteSubmitted', { proposalId, voteType: voteType === 'for' ? t('daoGovernance.voting.for') : t('daoGovernance.voting.against') })
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    toast({ title: platform, description: t('daoGovernance.toast.navigating', { platform }) });
  };

  const proposalsData = t('daoGovernance.proposalsData', { returnObjects: true }) as Array<{title: string, desc: string}>;
  const proposals = [
    { id: "TIP-001", title: proposalsData[0]?.title || "Staking Reward Adjustment", desc: proposalsData[0]?.desc || "Increase annual staking reward rate from 12% to 15%", category: "protocol", status: "active", forVotes: 72, againstVotes: 18, abstainVotes: 10, quorum: 65, author: "CoreTeam", endDate: "2026.01.15" },
    { id: "TIP-002", title: proposalsData[1]?.title || "Ecosystem Fund Allocation", desc: proposalsData[1]?.desc || "Allocate 50M TBURN for DeFi protocol partnerships", category: "treasury", status: "active", forVotes: 58, againstVotes: 32, abstainVotes: 10, quorum: 48, author: "Treasury", endDate: "2026.01.18" },
    { id: "TIP-003", title: proposalsData[2]?.title || "Cross-Chain Bridge Expansion", desc: proposalsData[2]?.desc || "Add Polygon, Arbitrum network bridge support", category: "ecosystem", status: "pending", forVotes: 0, againstVotes: 0, abstainVotes: 0, quorum: 0, author: "DevTeam", endDate: "2026.01.20" },
  ];

  const stepsData = t('daoGovernance.processSteps', { returnObjects: true }) as Array<{title: string, desc: string, duration: string}>;
  const processSteps = [
    { number: 1, title: stepsData[0]?.title || "Submit Proposal", desc: stepsData[0]?.desc || "Anyone can submit proposals", duration: stepsData[0]?.duration || "Min 10,000 vTBURN" },
    { number: 2, title: stepsData[1]?.title || "Discussion Period", desc: stepsData[1]?.desc || "Collect community feedback", duration: stepsData[1]?.duration || "3 Days" },
    { number: 3, title: stepsData[2]?.title || "Voting Period", desc: stepsData[2]?.desc || "Token holder voting", duration: stepsData[2]?.duration || "5 Days" },
    { number: 4, title: stepsData[3]?.title || "Timelock", desc: stepsData[3]?.desc || "Execution waiting period", duration: stepsData[3]?.duration || "2 Days" },
    { number: 5, title: stepsData[4]?.title || "Execution", desc: stepsData[4]?.desc || "Automatic on-chain execution", duration: stepsData[4]?.duration || "Immediate" },
  ];

  const committeesData = t('daoGovernance.committeesData', { returnObjects: true }) as Array<{name: string, desc: string}>;
  const committees = [
    { id: "tech", icon: "⚙️", name: committeesData[0]?.name || "Technical Committee", desc: committeesData[0]?.desc || "Protocol upgrade review", members: 7, proposals: 23 },
    { id: "finance", icon: "💰", name: committeesData[1]?.name || "Finance Committee", desc: committeesData[1]?.desc || "Fund disbursement approval", members: 5, proposals: 45 },
    { id: "ecosystem", icon: "🌱", name: committeesData[2]?.name || "Ecosystem Committee", desc: committeesData[2]?.desc || "Partnerships & Grants", members: 9, proposals: 67 },
    { id: "security", icon: "🛡️", name: committeesData[3]?.name || "Security Committee", desc: committeesData[3]?.desc || "Security audits and response", members: 5, proposals: 12 },
  ];

  const rewardsData = t('daoGovernance.rewardsData', { returnObjects: true }) as Array<{title: string, amount: string, benefits: string[]}>;
  const rewardTypes = [
    { id: "voting", icon: "🗳️", title: rewardsData[0]?.title || "Voting Participation Reward", amount: rewardsData[0]?.amount || "10~50 TBURN per vote", benefits: rewardsData[0]?.benefits || ["Reward for all proposal votes", "Bonus based on participation rate", "Consecutive voting streak bonus", "Governance NFT opportunity"] },
    { id: "proposal", icon: "📝", title: rewardsData[1]?.title || "Proposal Reward", amount: rewardsData[1]?.amount || "Up to 5,000 TBURN per proposal", benefits: rewardsData[1]?.benefits || ["Reward for approved proposals", "Additional bonus upon implementation", "Community contribution recognition", "Proposer Hall of Fame listing"] },
    { id: "committee", icon: "👥", title: rewardsData[2]?.title || "Committee Reward", amount: rewardsData[2]?.amount || "Up to 10,000 TBURN per month", benefits: rewardsData[2]?.benefits || ["Regular rewards for committee activities", "Additional reward per review", "Term completion bonus", "Governance leadership certification"] },
  ];

  const delegatesData = t('daoGovernance.delegatesData', { returnObjects: true }) as Array<{role: string}>;
  const delegates = [
    { name: "CoreValidator", role: delegatesData[0]?.role || "Validator", power: "2.4M", initials: "CV" },
    { name: "DeFiMaster", role: delegatesData[1]?.role || "DeFi Expert", power: "1.8M", initials: "DM" },
    { name: "CommunityLead", role: delegatesData[2]?.role || "Community", power: "1.2M", initials: "CL" },
  ];

  return (
    <div className="dao-page">
      <style>{`
        .dao-page {
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
          --indigo: #6366F1;
          --emerald: #10B981;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-dao: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .dao-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
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

        .nav-links a:hover { color: var(--indigo); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-dao);
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
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
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
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--indigo);
          margin-bottom: 2rem;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-dao);
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
          border-color: var(--indigo);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-dao);
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
          background: var(--gradient-dao);
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
          box-shadow: 0 20px 60px rgba(99, 102, 241, 0.4);
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
          border-color: var(--indigo);
          color: var(--indigo);
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
          background: rgba(99, 102, 241, 0.15);
          color: var(--indigo);
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
          grid-template-columns: repeat(4, 1fr);
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
          border-color: var(--indigo);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.voting::before { background: var(--gradient-dao); }
        .dist-card.proposal::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
        .dist-card.committee::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }
        .dist-card.treasury::before { background: var(--gradient-gold); }

        .dist-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .dist-name {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .dist-amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--indigo);
          margin-bottom: 0.25rem;
        }

        .dist-percent {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          position: relative;
        }

        .process-grid::before {
          content: '';
          position: absolute;
          top: 50px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--indigo), var(--purple), var(--indigo), transparent);
          z-index: 0;
        }

        .process-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          position: relative;
          z-index: 1;
          transition: all 0.3s;
        }

        .process-card:hover {
          transform: translateY(-10px);
          border-color: var(--indigo);
        }

        .process-number {
          width: 50px;
          height: 50px;
          background: var(--gradient-dao);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0 auto 1rem;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }

        .process-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .process-desc {
          font-size: 0.85rem;
          color: var(--light-gray);
        }

        .process-duration {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--indigo);
          font-weight: 600;
        }

        .proposals-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .proposal-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          transition: all 0.3s;
        }

        .proposal-card:hover {
          border-color: var(--indigo);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .proposal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .proposal-info {
          flex: 1;
        }

        .proposal-id {
          font-size: 0.8rem;
          color: var(--indigo);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .proposal-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .proposal-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.875rem;
          color: var(--gray);
        }

        .proposal-status {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .proposal-status.active {
          background: rgba(34, 197, 94, 0.15);
          color: var(--success);
          animation: pulse 2s infinite;
        }

        .proposal-status.pending {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
        }

        .proposal-body {
          margin-bottom: 1.5rem;
        }

        .proposal-desc {
          color: var(--light-gray);
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .proposal-category {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .proposal-category.protocol { background: rgba(99, 102, 241, 0.15); color: var(--indigo); }
        .proposal-category.treasury { background: rgba(212, 175, 55, 0.15); color: var(--gold); }
        .proposal-category.ecosystem { background: rgba(16, 185, 129, 0.15); color: var(--emerald); }

        .proposal-voting {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 2rem;
          align-items: center;
        }

        .vote-progress {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .vote-bar {
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          overflow: hidden;
          display: flex;
        }

        .vote-bar .for {
          background: var(--success);
          transition: width 0.5s ease;
        }

        .vote-bar .against {
          background: var(--danger);
          transition: width 0.5s ease;
        }

        .vote-bar .abstain {
          background: var(--gray);
          transition: width 0.5s ease;
        }

        .vote-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .vote-labels .for { color: var(--success); }
        .vote-labels .against { color: var(--danger); }

        .vote-stats {
          text-align: center;
        }

        .vote-stats .quorum-label {
          font-size: 0.75rem;
          color: var(--gray);
          margin-bottom: 0.25rem;
        }

        .vote-stats .quorum-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--indigo);
        }

        .vote-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .vote-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.875rem;
        }

        .vote-btn.for {
          background: var(--success);
          color: var(--white);
        }

        .vote-btn.against {
          background: var(--danger);
          color: var(--white);
        }

        .vote-btn:hover {
          transform: translateY(-2px);
        }

        .committee-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .committee-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .committee-card:hover {
          transform: translateY(-10px);
          border-color: var(--indigo);
        }

        .committee-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .committee-card.tech .committee-icon { background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)); }
        .committee-card.finance .committee-icon { background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(245, 158, 11, 0.2)); }
        .committee-card.ecosystem .committee-icon { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2)); }
        .committee-card.security .committee-icon { background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2)); }

        .committee-name {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .committee-desc {
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 1rem;
        }

        .committee-stats {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .committee-stat {
          text-align: center;
        }

        .committee-stat .value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--indigo);
        }

        .committee-stat .label {
          font-size: 0.7rem;
          color: var(--gray);
        }

        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .reward-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .reward-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .reward-card.voting::before { background: var(--gradient-dao); }
        .reward-card.proposal::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
        .reward-card.committee::before { background: linear-gradient(90deg, var(--gold), var(--warning)); }

        .reward-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .reward-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .reward-card.voting .reward-icon { background: rgba(99, 102, 241, 0.2); }
        .reward-card.proposal .reward-icon { background: rgba(59, 130, 246, 0.2); }
        .reward-card.committee .reward-icon { background: rgba(212, 175, 55, 0.2); }

        .reward-title {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .reward-amount {
          font-size: 2rem;
          font-weight: 900;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .reward-details {
          list-style: none;
          padding: 0;
        }

        .reward-details li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .reward-details li::before {
          content: '✓';
          color: var(--success);
          font-size: 12px;
        }

        .delegation-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .delegation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .delegation-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .delegate-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .delegate-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .delegate-item:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .delegate-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--gradient-dao);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .delegate-info {
          flex: 1;
        }

        .delegate-info h5 {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .delegate-info p {
          font-size: 0.75rem;
          color: var(--gray);
        }

        .delegate-power {
          text-align: right;
        }

        .delegate-power .value {
          font-weight: 700;
          color: var(--indigo);
        }

        .delegate-power .label {
          font-size: 0.7rem;
          color: var(--gray);
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
          color: var(--indigo);
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
          background: var(--gradient-dao);
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
          background: var(--indigo);
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
        .footer-links a:hover { color: var(--indigo); }

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
          .committee-grid { grid-template-columns: repeat(2, 1fr); }
          .rewards-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .process-grid { grid-template-columns: repeat(3, 1fr); }
          .process-grid::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
          .proposal-voting { grid-template-columns: 1fr; gap: 1rem; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .process-grid { grid-template-columns: repeat(2, 1fr); }
          .committee-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="dao-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a 
              href="#proposals"
              onClick={(e) => { e.preventDefault(); scrollToSection('proposals'); }}
              data-testid="nav-proposals"
            >{t('daoGovernance.nav.proposals')}</a>
            <a 
              href="#process"
              onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}
              data-testid="nav-process"
            >{t('daoGovernance.nav.process')}</a>
            <a 
              href="#committees"
              onClick={(e) => { e.preventDefault(); scrollToSection('committees'); }}
              data-testid="nav-committees"
            >{t('daoGovernance.nav.committees')}</a>
            <a 
              href="#rewards"
              onClick={(e) => { e.preventDefault(); scrollToSection('rewards'); }}
              data-testid="nav-rewards"
            >{t('daoGovernance.nav.rewards')}</a>
            <a 
              href="#faq"
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="nav-faq"
            >{t('daoGovernance.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleWalletClick}
            >
              {isConnected && address ? `🔗 ${formatAddress(address)}` : t('daoGovernance.nav.connectWallet')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            🏛️ {t('daoGovernance.hero.badge')}
          </div>
          <h1>
            {t('daoGovernance.hero.title1')}<br />
            <span className="gradient-text">{t('daoGovernance.hero.title2')}</span> {t('daoGovernance.hero.title3')}
          </h1>
          <p className="hero-subtitle">
            {t('daoGovernance.hero.subtitle')}
          </p>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-proposals">
              <div className="stat-value">{isLoading ? '...' : stats?.totalProposals || 0}</div>
              <div className="stat-label">{t('daoGovernance.stats.totalProposals')}</div>
            </div>
            <div className="stat-card" data-testid="stat-active-proposals">
              <div className="stat-value">{isLoading ? '...' : stats?.activeProposals || 0}</div>
              <div className="stat-label">{t('daoGovernance.stats.activeProposals')}</div>
            </div>
            <div className="stat-card" data-testid="stat-total-votes">
              <div className="stat-value">{isLoading ? '...' : stats?.totalVotes?.toLocaleString() || 0}</div>
              <div className="stat-label">{t('daoGovernance.stats.totalVotes')}</div>
            </div>
            <div className="stat-card" data-testid="stat-voting-power">
              <div className="stat-value">{isLoading ? '...' : Number(stats?.totalVotingPower || 0).toLocaleString()}</div>
              <div className="stat-label">{t('daoGovernance.stats.totalVotingPower')}</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-vote"
              onClick={() => { scrollToSection('proposals'); toast({ title: t('daoGovernance.cta.activeProposals'), description: t('daoGovernance.cta.activeProposalsDesc') }); }}
            >
              {t('daoGovernance.cta.vote')}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-submit-proposal"
              onClick={() => { 
                if (!isConnected) { 
                  connect("metamask"); 
                  toast({ title: t('daoGovernance.toast.walletRequired'), description: t('daoGovernance.toast.proposalWalletRequired') });
                } else {
                  toast({ title: t('daoGovernance.cta.submitProposal'), description: t('daoGovernance.cta.comingSoon') }); 
                }
              }}
            >
              {t('daoGovernance.cta.submitProposal')}
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t('daoGovernance.distribution.badge')}</span>
          <h2 className="section-title">{t('daoGovernance.distribution.title')}</h2>
          <p className="section-subtitle">{t('daoGovernance.distribution.subtitle')}</p>
        </div>

        <div className="distribution-grid">
          <div className="dist-card voting" data-testid="dist-voting">
            <div className="dist-icon">🗳️</div>
            <div className="dist-name">{t('daoGovernance.distribution.voting')}</div>
            <div className="dist-amount">{t('daoGovernance.distribution.votingAmount')}</div>
            <div className="dist-percent">50%</div>
          </div>
          <div className="dist-card proposal" data-testid="dist-proposal">
            <div className="dist-icon">📝</div>
            <div className="dist-name">{t('daoGovernance.distribution.proposal')}</div>
            <div className="dist-amount">{t('daoGovernance.distribution.proposalAmount')}</div>
            <div className="dist-percent">20%</div>
          </div>
          <div className="dist-card committee" data-testid="dist-committee">
            <div className="dist-icon">👥</div>
            <div className="dist-name">{t('daoGovernance.distribution.committee')}</div>
            <div className="dist-amount">{t('daoGovernance.distribution.committeeAmount')}</div>
            <div className="dist-percent">20%</div>
          </div>
          <div className="dist-card treasury" data-testid="dist-treasury">
            <div className="dist-icon">💰</div>
            <div className="dist-name">{t('daoGovernance.distribution.treasury')}</div>
            <div className="dist-amount">{t('daoGovernance.distribution.treasuryAmount')}</div>
            <div className="dist-percent">10%</div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section" id="process" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('daoGovernance.process.badge')}</span>
          <h2 className="section-title">{t('daoGovernance.process.title')}</h2>
          <p className="section-subtitle">{t('daoGovernance.process.subtitle')}</p>
        </div>

        <div className="process-grid">
          {processSteps.map(step => (
            <div key={step.number} className="process-card">
              <div className="process-number">{step.number}</div>
              <h4 className="process-title">{step.title}</h4>
              <p className="process-desc">{step.desc}</p>
              <p className="process-duration">{step.duration}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Proposals Section */}
      <section className="section" id="proposals">
        <div className="section-header">
          <span className="section-badge">{t('daoGovernance.proposals.badge')}</span>
          <h2 className="section-title">{t('daoGovernance.proposals.title')}</h2>
          <p className="section-subtitle">{t('daoGovernance.proposals.subtitle')}</p>
        </div>

        <div className="proposals-container">
          {proposals.map(proposal => (
            <div key={proposal.id} className="proposal-card" data-testid={`proposal-${proposal.id}`}>
              <div className="proposal-header">
                <div className="proposal-info">
                  <div className="proposal-id">{proposal.id}</div>
                  <h3 className="proposal-title">{proposal.title}</h3>
                  <div className="proposal-meta">
                    <span>📅 {t('daoGovernance.proposals.deadline')}: {proposal.endDate}</span>
                    <span>👤 {t('daoGovernance.proposals.proposer')}: {proposal.author}</span>
                  </div>
                </div>
                <span className={`proposal-status ${proposal.status}`}>
                  {proposal.status === 'active' ? t('daoGovernance.proposals.voting') : t('daoGovernance.proposals.pending')}
                </span>
              </div>
              <div className="proposal-body">
                <p className="proposal-desc">{proposal.desc}</p>
                <span className={`proposal-category ${proposal.category}`}>
                  {proposal.category === 'protocol' ? t('daoGovernance.proposals.categories.protocol') : 
                   proposal.category === 'treasury' ? t('daoGovernance.proposals.categories.treasury') : t('daoGovernance.proposals.categories.ecosystem')}
                </span>
              </div>
              {proposal.status === 'active' && (
                <div className="proposal-voting">
                  <div className="vote-progress">
                    <div className="vote-bar">
                      <div className="for" style={{ width: `${proposal.forVotes}%` }}></div>
                      <div className="against" style={{ width: `${proposal.againstVotes}%` }}></div>
                      <div className="abstain" style={{ width: `${proposal.abstainVotes}%` }}></div>
                    </div>
                    <div className="vote-labels">
                      <span className="for">{t('daoGovernance.voting.for')} {proposal.forVotes}%</span>
                      <span className="against">{t('daoGovernance.voting.against')} {proposal.againstVotes}%</span>
                    </div>
                  </div>
                  <div className="vote-stats">
                    <div className="quorum-label">{t('daoGovernance.voting.quorumRate')}</div>
                    <div className="quorum-value">{proposal.quorum}%</div>
                  </div>
                  <div className="vote-buttons">
                    <button 
                      className="vote-btn for"
                      onClick={() => handleVote(proposal.id, 'for')}
                      data-testid={`button-vote-for-${proposal.id}`}
                    >
                      {isConnected ? t('daoGovernance.voting.for') : t('daoGovernance.nav.connectWallet')}
                    </button>
                    <button 
                      className="vote-btn against"
                      onClick={() => handleVote(proposal.id, 'against')}
                      data-testid={`button-vote-against-${proposal.id}`}
                    >
                      {isConnected ? t('daoGovernance.voting.against') : t('daoGovernance.nav.connectWallet')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Committees Section */}
      <section className="section" id="committees" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('daoGovernance.committees.badge')}</span>
          <h2 className="section-title">{t('daoGovernance.committees.title')}</h2>
          <p className="section-subtitle">{t('daoGovernance.committees.subtitle')}</p>
        </div>

        <div className="committee-grid">
          {committees.map(committee => (
            <div key={committee.id} className={`committee-card ${committee.id}`} data-testid={`committee-${committee.id}`}>
              <div className="committee-icon">{committee.icon}</div>
              <h3 className="committee-name">{committee.name}</h3>
              <p className="committee-desc">{committee.desc}</p>
              <div className="committee-stats">
                <div className="committee-stat">
                  <div className="value">{committee.members}</div>
                  <div className="label">{t('daoGovernance.committees.members')}</div>
                </div>
                <div className="committee-stat">
                  <div className="value">{committee.proposals}</div>
                  <div className="label">{t('daoGovernance.committees.processedProposals')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rewards Section */}
      <section className="section" id="rewards">
        <div className="section-header">
          <span className="section-badge">{t('daoGovernance.rewards.badge')}</span>
          <h2 className="section-title">{t('daoGovernance.rewards.title')}</h2>
          <p className="section-subtitle">{t('daoGovernance.rewards.subtitle')}</p>
        </div>

        <div className="rewards-grid">
          {rewardTypes.map(reward => (
            <div key={reward.id} className={`reward-card ${reward.id}`} data-testid={`reward-${reward.id}`}>
              <div className="reward-header">
                <div className="reward-icon">{reward.icon}</div>
                <h3 className="reward-title">{reward.title}</h3>
              </div>
              <div className="reward-amount">{reward.amount}</div>
              <ul className="reward-details">
                {reward.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Delegation Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('daoGovernance.delegation.badge')}</span>
          <h2 className="section-title">{t('daoGovernance.delegation.title')}</h2>
          <p className="section-subtitle">{t('daoGovernance.delegation.subtitle')}</p>
        </div>

        <div className="delegation-section">
          <div className="delegation-header">
            <h3>🏆 {t('daoGovernance.delegation.topDelegates')}</h3>
          </div>

          <div className="delegate-list">
            {delegates.map((delegate, idx) => (
              <div key={idx} className="delegate-item">
                <div className="delegate-avatar">{delegate.initials}</div>
                <div className="delegate-info">
                  <h5>{delegate.name}</h5>
                  <p>{delegate.role}</p>
                </div>
                <div className="delegate-power">
                  <div className="value">{delegate.power} vTBURN</div>
                  <div className="label">{t('daoGovernance.delegation.votingPower')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">{t('daoGovernance.faq.badge')}</span>
          <h2 className="section-title">{t('daoGovernance.faq.title')}</h2>
          <p className="section-subtitle">{t('daoGovernance.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-item-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('daoGovernance.faq.q1')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('daoGovernance.faq.a1')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-item-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('daoGovernance.faq.q2')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('daoGovernance.faq.a2')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-item-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('daoGovernance.faq.q3')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('daoGovernance.faq.a3')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-item-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('daoGovernance.faq.q4')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('daoGovernance.faq.a4')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-item-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('daoGovernance.faq.q5')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('daoGovernance.faq.a5')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-item-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('daoGovernance.faq.q6')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('daoGovernance.faq.a6')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-item-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('daoGovernance.faq.q7')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('daoGovernance.faq.a7')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-item-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('daoGovernance.faq.q8')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('daoGovernance.faq.a8')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('daoGovernance.ctaSection.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('daoGovernance.ctaSection.subtitle1')}<br />
            {t('daoGovernance.ctaSection.subtitle2')}
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--indigo)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-participate"
            onClick={() => { 
              scrollToSection('proposals'); 
              toast({ title: t('daoGovernance.toast.participateTitle'), description: t('daoGovernance.toast.participateDesc') }); 
            }}
          >
            {t('daoGovernance.ctaSection.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('daoGovernance.footer.tagline1')}<br />{t('daoGovernance.footer.tagline2')}</p>
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
            <h4>{t('daoGovernance.footer.product')}</h4>
            <ul>
              <li><a href="/" data-testid="footer-link-mainnet">{t('daoGovernance.footer.mainnet')}</a></li>
              <li><a href="/scan" data-testid="footer-link-explorer">{t('daoGovernance.footer.explorer')}</a></li>
              <li><a href="/app/bridge" data-testid="footer-link-bridge">{t('daoGovernance.footer.bridge')}</a></li>
              <li><a href="/app/staking" data-testid="footer-link-staking">{t('daoGovernance.footer.staking')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('daoGovernance.footer.resources')}</h4>
            <ul>
              <li><a href="/learn/whitepaper" data-testid="footer-link-whitepaper">{t('daoGovernance.footer.whitepaper')}</a></li>
              <li><a href="/developers/docs" data-testid="footer-link-docs">{t('daoGovernance.footer.docs')}</a></li>
              <li><a 
                href="https://github.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('GitHub', 'https://github.com/tburnchain'); }}
                data-testid="footer-link-github-resources"
              >GitHub</a></li>
              <li><a href="/security-audit" data-testid="footer-link-audit">{t('daoGovernance.footer.audit')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('daoGovernance.footer.community')}</h4>
            <ul>
              <li><a href="/community/news" data-testid="footer-link-blog">{t('daoGovernance.footer.blog')}</a></li>
              <li><a href="/community-program" data-testid="footer-link-ambassador">{t('daoGovernance.footer.ambassador')}</a></li>
              <li><a href="/community-program" data-testid="footer-link-grants">{t('daoGovernance.footer.grants')}</a></li>
              <li><a href="/qna" data-testid="footer-link-support">{t('daoGovernance.footer.support')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">{t('daoGovernance.footer.terms')}</a>
            <a href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">{t('daoGovernance.footer.privacy')}</a>
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
