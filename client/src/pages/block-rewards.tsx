import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectionModal, useWalletModal } from "@/components/WalletConnectionModal";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";

interface BlockRewardsStatsData {
  currentEpoch: number;
  totalRewardsDistributed: number;
  currentBlockReward: number;
  nextHalvingBlock: number;
  blocksToHalving: number;
  rewardSchedule: Array<{
    year: string;
    period: string;
    reward: string;
    amount: string;
  }>;
  distribution: {
    validators: number;
    delegators: number;
    treasury: number;
  };
}

interface BlockRewardsStatsResponse {
  success: boolean;
  data: BlockRewardsStatsData;
}

export default function BlockRewardsPage() {
  const { t } = useTranslation();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [stakeAmount, setStakeAmount] = useState(1000000);
  const { isConnected, address, disconnect, formatAddress } = useWeb3();
  const { isOpen: walletModalOpen, setIsOpen: setWalletModalOpen, openModal: openWalletModal } = useWalletModal();
  const { toast } = useToast();

  const { data: response, isLoading } = useQuery<BlockRewardsStatsResponse>({
    queryKey: ['/api/token-programs/block-rewards/stats'],
  });
  const stats = response?.data;

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
      toast({ title: t('tokenPrograms.blockRewards.toast.walletDisconnected'), description: t('tokenPrograms.blockRewards.toast.walletDisconnectedDesc') });
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

  const handleBecomeValidator = (validatorType: string) => {
    if (!isConnected) {
      openWalletModal();
      return;
    }
    const typeNames: Record<string, string> = {
      full: t('tokenPrograms.blockRewards.validatorTypes.full.title'),
      light: t('tokenPrograms.blockRewards.validatorTypes.light.title'),
      delegate: t('tokenPrograms.blockRewards.validatorTypes.delegate.title')
    };
    toast({ 
      title: t('tokenPrograms.blockRewards.toast.applicationSubmitted', { type: typeNames[validatorType] || validatorType }),
      description: t('tokenPrograms.blockRewards.toast.applicationSubmittedDesc')
    });
  };

  const handleDelegate = (validatorName: string) => {
    if (!isConnected) {
      connect("metamask");
      toast({ title: t('tokenPrograms.blockRewards.toast.walletRequired'), description: t('tokenPrograms.blockRewards.toast.walletRequiredForDelegate') });
      return;
    }
    toast({ 
      title: t('tokenPrograms.blockRewards.toast.delegationComplete'),
      description: t('tokenPrograms.blockRewards.toast.delegationCompleteDesc', { validator: validatorName })
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    toast({ title: platform, description: t('tokenPrograms.blockRewards.toast.navigatingTo', { platform }) });
  };

  const halvingSchedule = [
    { year: "2025", period: "Year 1-4", reward: "100%", amount: t('tokenPrograms.blockRewards.halving.amounts.year1') },
    { year: "2029", period: "Year 5-8", reward: "50%", amount: t('tokenPrograms.blockRewards.halving.amounts.year5') },
    { year: "2033", period: "Year 9-12", reward: "25%", amount: t('tokenPrograms.blockRewards.halving.amounts.year9') },
    { year: "2037", period: "Year 13-16", reward: "12.5%", amount: t('tokenPrograms.blockRewards.halving.amounts.year13') },
    { year: "2041", period: "Year 17-20", reward: "6.25%", amount: t('tokenPrograms.blockRewards.halving.amounts.year17') },
  ];

  const validatorTypes = [
    { id: "full", icon: "🖥️", title: t('tokenPrograms.blockRewards.validatorTypes.full.title'), subtitle: t('tokenPrograms.blockRewards.validatorTypes.full.subtitle'), apy: "15~25%", featured: true, requirements: [t('tokenPrograms.blockRewards.validatorTypes.full.req1'), t('tokenPrograms.blockRewards.validatorTypes.full.req2'), t('tokenPrograms.blockRewards.validatorTypes.full.req3'), t('tokenPrograms.blockRewards.validatorTypes.full.req4')] },
    { id: "light", icon: "⚡", title: t('tokenPrograms.blockRewards.validatorTypes.light.title'), subtitle: t('tokenPrograms.blockRewards.validatorTypes.light.subtitle'), apy: "10~15%", featured: false, requirements: [t('tokenPrograms.blockRewards.validatorTypes.light.req1'), t('tokenPrograms.blockRewards.validatorTypes.light.req2'), t('tokenPrograms.blockRewards.validatorTypes.light.req3'), t('tokenPrograms.blockRewards.validatorTypes.light.req4')] },
    { id: "delegate", icon: "🤝", title: t('tokenPrograms.blockRewards.validatorTypes.delegate.title'), subtitle: t('tokenPrograms.blockRewards.validatorTypes.delegate.subtitle'), apy: "8~12%", featured: false, requirements: [t('tokenPrograms.blockRewards.validatorTypes.delegate.req1'), t('tokenPrograms.blockRewards.validatorTypes.delegate.req2'), t('tokenPrograms.blockRewards.validatorTypes.delegate.req3'), t('tokenPrograms.blockRewards.validatorTypes.delegate.req4')] },
  ];

  const slashingRules = [
    { severity: "minor", icon: "⚠️", title: t('tokenPrograms.blockRewards.slashing.minor.title'), penalty: t('tokenPrograms.blockRewards.slashing.minor.penalty'), desc: t('tokenPrograms.blockRewards.slashing.minor.desc'), examples: [t('tokenPrograms.blockRewards.slashing.minor.ex1'), t('tokenPrograms.blockRewards.slashing.minor.ex2'), t('tokenPrograms.blockRewards.slashing.minor.ex3')] },
    { severity: "major", icon: "🚨", title: t('tokenPrograms.blockRewards.slashing.major.title'), penalty: t('tokenPrograms.blockRewards.slashing.major.penalty'), desc: t('tokenPrograms.blockRewards.slashing.major.desc'), examples: [t('tokenPrograms.blockRewards.slashing.major.ex1'), t('tokenPrograms.blockRewards.slashing.major.ex2'), t('tokenPrograms.blockRewards.slashing.major.ex3')] },
    { severity: "critical", icon: "🛑", title: t('tokenPrograms.blockRewards.slashing.critical.title'), penalty: t('tokenPrograms.blockRewards.slashing.critical.penalty'), desc: t('tokenPrograms.blockRewards.slashing.critical.desc'), examples: [t('tokenPrograms.blockRewards.slashing.critical.ex1'), t('tokenPrograms.blockRewards.slashing.critical.ex2'), t('tokenPrograms.blockRewards.slashing.critical.ex3')] },
  ];

  const activeValidators = [
    { name: "TBURN Genesis", address: "tb1q8...x4kf", stake: "25,000,000", commission: "5%", uptime: "99.98%", status: "active" },
    { name: "CryptoNode Pro", address: "tb1q7...m2nj", stake: "18,500,000", commission: "8%", uptime: "99.95%", status: "active" },
    { name: "BlockMaster", address: "tb1q6...p3df", stake: "15,200,000", commission: "6%", uptime: "99.92%", status: "active" },
    { name: "DeFi Validator", address: "tb1q5...k8gh", stake: "12,800,000", commission: "7%", uptime: "99.88%", status: "active" },
    { name: "Korea Node", address: "tb1q4...j5ty", stake: "10,500,000", commission: "5%", uptime: "99.85%", status: "active" },
  ];

  // Calculate estimated rewards
  const dailyReward = Math.floor(stakeAmount * 0.15 / 365);
  const monthlyReward = Math.floor(stakeAmount * 0.15 / 12);
  const yearlyReward = Math.floor(stakeAmount * 0.15);

  return (
    <div className="block-rewards-page">
      <style>{`
        .block-rewards-page {
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
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-block: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes mining { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

        .block-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
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

        .nav-links a:hover { color: var(--emerald); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-block);
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
          box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
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
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--emerald);
          margin-bottom: 2rem;
        }

        .badge .block-icon {
          animation: mining 1.5s ease-in-out infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-block);
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

        .network-stats-banner {
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2rem;
        }

        .network-stat {
          text-align: center;
          position: relative;
        }

        .network-stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .network-stat .value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--emerald);
        }

        .network-stat .label {
          font-size: 0.8rem;
          color: var(--gray);
          margin-top: 0.25rem;
        }

        .network-stat .live {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .network-stat .live::before {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1s infinite;
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
          border-color: var(--emerald);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-block);
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
          background: var(--gradient-block);
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
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);
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
          border-color: var(--emerald);
          color: var(--emerald);
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
          background: rgba(16, 185, 129, 0.15);
          color: var(--emerald);
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
          border-color: var(--emerald);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.block::before { background: var(--gradient-block); }
        .dist-card.delegate::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
        .dist-card.performance::before { background: linear-gradient(90deg, var(--purple), #EC4899); }
        .dist-card.halving::before { background: var(--gradient-gold); }

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
          color: var(--emerald);
          margin-bottom: 0.25rem;
        }

        .dist-percent {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .halving-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .halving-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .halving-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .halving-header p {
          color: var(--light-gray);
        }

        .halving-timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin-top: 2rem;
        }

        .halving-timeline::before {
          content: '';
          position: absolute;
          top: 30px;
          left: 5%;
          right: 5%;
          height: 4px;
          background: linear-gradient(90deg, var(--emerald), var(--cyan), var(--blue), var(--purple), var(--gold));
          border-radius: 2px;
        }

        .halving-item {
          text-align: center;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .halving-dot {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          border: 4px solid var(--dark);
        }

        .halving-item:nth-child(1) .halving-dot { background: var(--emerald); }
        .halving-item:nth-child(2) .halving-dot { background: var(--cyan); }
        .halving-item:nth-child(3) .halving-dot { background: var(--blue); }
        .halving-item:nth-child(4) .halving-dot { background: var(--purple); }
        .halving-item:nth-child(5) .halving-dot { background: var(--gold); color: var(--dark); }

        .halving-year {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .halving-reward {
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 0.25rem;
        }

        .halving-amount {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--gold);
        }

        .validator-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .validator-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .validator-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .validator-card.featured {
          border-color: var(--emerald);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
        }

        .featured-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--gradient-block);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 10;
          color: var(--white);
        }

        .validator-header {
          padding: 2rem;
          position: relative;
        }

        .validator-header.full { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.1)); }
        .validator-header.light { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1)); }
        .validator-header.delegate { background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(245, 158, 11, 0.1)); }

        .validator-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .validator-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .validator-subtitle {
          color: var(--light-gray);
          font-size: 0.9rem;
        }

        .validator-content {
          padding: 1.5rem 2rem 2rem;
        }

        .validator-apy {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .validator-apy-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .validator-apy-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--emerald);
        }

        .validator-requirements {
          list-style: none;
          margin-bottom: 1.5rem;
          padding: 0;
        }

        .validator-requirements li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .validator-requirements li:last-child { border-bottom: none; }
        .validator-requirements li::before { content: '✓'; color: var(--emerald); }

        .validator-btn {
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

        .validator-btn.primary {
          background: var(--gradient-block);
          color: var(--white);
        }

        .validator-btn:hover {
          transform: scale(1.02);
        }

        .calculator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .calculator-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .calculator-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .calc-input-group {
          margin-bottom: 1.5rem;
        }

        .calc-input-group label {
          display: block;
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 0.5rem;
        }

        .calc-input-wrapper {
          position: relative;
        }

        .calc-input {
          width: 100%;
          padding: 14px 80px 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--white);
          font-size: 1rem;
          font-weight: 600;
        }

        .calc-input:focus {
          outline: none;
          border-color: var(--emerald);
        }

        .calc-input-suffix {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
          font-weight: 600;
        }

        .calc-slider {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          appearance: none;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .calc-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--emerald);
          border-radius: 50%;
          cursor: pointer;
        }

        .calc-result {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .calc-result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .calc-result-row:last-child {
          border-bottom: none;
          padding-top: 1rem;
          margin-top: 0.5rem;
        }

        .calc-result-label {
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .calc-result-value {
          font-weight: 700;
        }

        .calc-result-value.emerald { color: var(--emerald); }
        .calc-result-value.gold { color: var(--gold); }
        .calc-result-value.large {
          font-size: 1.5rem;
          color: var(--gold);
        }

        .slashing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .slashing-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .slashing-card:hover {
          border-color: var(--danger);
        }

        .slashing-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .slashing-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .slashing-card.minor .slashing-icon { background: rgba(245, 158, 11, 0.2); }
        .slashing-card.major .slashing-icon { background: rgba(249, 115, 22, 0.2); }
        .slashing-card.critical .slashing-icon { background: rgba(239, 68, 68, 0.2); }

        .slashing-title {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .slashing-penalty {
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .slashing-card.minor .slashing-penalty { color: var(--warning); }
        .slashing-card.major .slashing-penalty { color: #F97316; }
        .slashing-card.critical .slashing-penalty { color: var(--danger); }

        .slashing-desc {
          color: var(--light-gray);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .slashing-examples {
          list-style: none;
          padding: 0;
        }

        .slashing-examples li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 0.85rem;
          color: var(--gray);
        }

        .slashing-examples li::before { content: '•'; }
        .slashing-card.minor .slashing-examples li::before { color: var(--warning); }
        .slashing-card.major .slashing-examples li::before { color: #F97316; }
        .slashing-card.critical .slashing-examples li::before { color: var(--danger); }

        .validators-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .validators-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .validators-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .validators-table {
          width: 100%;
          border-collapse: collapse;
        }

        .validators-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .validators-table th:first-child { border-radius: 12px 0 0 12px; }
        .validators-table th:last-child { border-radius: 0 12px 12px 0; }

        .validators-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .validators-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .validator-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .validator-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--gradient-block);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .validator-name {
          font-weight: 600;
        }

        .validator-address {
          font-size: 0.75rem;
          color: var(--gray);
          font-family: monospace;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(34, 197, 94, 0.15);
          color: var(--success);
        }

        .status-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .stake-cell {
          font-weight: 700;
          color: var(--emerald);
        }

        .commission-cell {
          color: var(--gold);
          font-weight: 600;
        }

        .uptime-cell {
          font-weight: 600;
          color: var(--success);
        }

        .delegate-btn-small {
          padding: 8px 16px;
          background: var(--gradient-block);
          color: var(--white);
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .delegate-btn-small:hover {
          transform: scale(1.05);
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
          color: var(--emerald);
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
          background: var(--gradient-block);
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
          background: var(--emerald);
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
        .footer-links a:hover { color: var(--emerald); }

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
          .validator-types-grid { grid-template-columns: 1fr; }
          .calculator-container { grid-template-columns: 1fr; }
          .slashing-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid, .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .network-stats-banner { grid-template-columns: repeat(3, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
          .halving-timeline { flex-wrap: wrap; gap: 2rem; }
          .halving-timeline::before { display: none; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .network-stats-banner { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="block-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a 
              href="#validators"
              onClick={(e) => { e.preventDefault(); scrollToSection('validators'); }}
              data-testid="nav-validators"
            >{t('tokenPrograms.blockRewards.nav.validators')}</a>
            <a 
              href="#halving"
              onClick={(e) => { e.preventDefault(); scrollToSection('halving'); }}
              data-testid="nav-halving"
            >{t('tokenPrograms.blockRewards.nav.halving')}</a>
            <a 
              href="#calculator"
              onClick={(e) => { e.preventDefault(); scrollToSection('calculator'); }}
              data-testid="nav-calculator"
            >{t('tokenPrograms.blockRewards.nav.calculator')}</a>
            <a 
              href="#slashing"
              onClick={(e) => { e.preventDefault(); scrollToSection('slashing'); }}
              data-testid="nav-slashing"
            >{t('tokenPrograms.blockRewards.nav.slashing')}</a>
            <a 
              href="#faq"
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="nav-faq"
            >{t('tokenPrograms.blockRewards.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleWalletClick}
            >
              {isConnected && address ? `🔗 ${formatAddress(address)}` : t('tokenPrograms.blockRewards.nav.connectWallet')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="block-icon">⛏️</span> {t('tokenPrograms.blockRewards.hero.badge')}
          </div>
          <h1>
            {t('tokenPrograms.blockRewards.hero.title1')}<br />
            <span className="gradient-text">{t('tokenPrograms.blockRewards.hero.title2')}</span> {t('tokenPrograms.blockRewards.hero.title3')}
          </h1>
          <p className="hero-subtitle">
            {t('tokenPrograms.blockRewards.hero.subtitle')}
          </p>

          <div className="network-stats-banner" data-testid="network-stats">
            <div className="network-stat" data-testid="stat-current-epoch">
              <div className="value live">{isLoading ? '...' : stats?.currentEpoch || 125}</div>
              <div className="label">{t('tokenPrograms.blockRewards.stats.activeValidators')}</div>
            </div>
            <div className="network-stat" data-testid="stat-blocks-to-halving">
              <div className="value">{isLoading ? '...' : stats?.blocksToHalving ? `~${(stats.blocksToHalving / 1000).toFixed(0)}K` : '~210K'}</div>
              <div className="label">{t('tokenPrograms.blockRewards.stats.tps')}</div>
            </div>
            <div className="network-stat">
              <div className="value">100ms</div>
              <div className="label">{t('tokenPrograms.blockRewards.stats.blockTime')}</div>
            </div>
            <div className="network-stat">
              <div className="value">64</div>
              <div className="label">{t('tokenPrograms.blockRewards.stats.shards')}</div>
            </div>
            <div className="network-stat">
              <div className="value">99.99%</div>
              <div className="label">{t('tokenPrograms.blockRewards.stats.networkUptime')}</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-rewards-distributed">
              <div className="stat-value">{isLoading ? '...' : Number(stats?.totalRewardsDistributed || 0).toLocaleString()}</div>
              <div className="stat-label">{t('tokenPrograms.blockRewards.stats.distributedRewards')}</div>
            </div>
            <div className="stat-card" data-testid="stat-current-block-reward">
              <div className="stat-value">{isLoading ? '...' : stats?.currentBlockReward || '0'} TBURN</div>
              <div className="stat-label">{t('tokenPrograms.blockRewards.stats.currentBlockReward')}</div>
            </div>
            <div className="stat-card" data-testid="stat-next-halving">
              <div className="stat-value">{isLoading ? '...' : stats?.nextHalvingBlock?.toLocaleString() || 0}</div>
              <div className="stat-label">{t('tokenPrograms.blockRewards.stats.nextHalvingBlock')}</div>
            </div>
            <div className="stat-card" data-testid="stat-distribution-validators">
              <div className="stat-value">{isLoading ? '...' : stats?.distribution?.validators ? `${stats.distribution.validators}%` : '0%'}</div>
              <div className="stat-label">{t('tokenPrograms.blockRewards.stats.validatorDistribution')}</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-become-validator"
              onClick={() => { scrollToSection('validators'); toast({ title: t('tokenPrograms.blockRewards.toast.validatorTypes'), description: t('tokenPrograms.blockRewards.toast.validatorTypesDesc') }); }}
            >
              {t('tokenPrograms.blockRewards.cta.becomeValidator')}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-view-docs"
              onClick={() => { scrollToSection('halving'); toast({ title: t('tokenPrograms.blockRewards.toast.halvingSchedule'), description: t('tokenPrograms.blockRewards.toast.halvingScheduleDesc') }); }}
            >
              {t('tokenPrograms.blockRewards.cta.viewHalving')}
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">{t('tokenPrograms.blockRewards.distribution.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.blockRewards.distribution.subtitle')}</p>
        </div>

        <div className="distribution-grid">
          <div className="dist-card block" data-testid="dist-block">
            <div className="dist-icon">⛏️</div>
            <div className="dist-name">{t('tokenPrograms.blockRewards.distribution.blockReward')}</div>
            <div className="dist-amount">{t('tokenPrograms.blockRewards.distribution.blockRewardAmount')}</div>
            <div className="dist-percent">70%</div>
          </div>
          <div className="dist-card delegate" data-testid="dist-delegate">
            <div className="dist-icon">🤝</div>
            <div className="dist-name">{t('tokenPrograms.blockRewards.distribution.delegatorReward')}</div>
            <div className="dist-amount">{t('tokenPrograms.blockRewards.distribution.delegatorRewardAmount')}</div>
            <div className="dist-percent">20%</div>
          </div>
          <div className="dist-card performance" data-testid="dist-performance">
            <div className="dist-icon">🏆</div>
            <div className="dist-name">{t('tokenPrograms.blockRewards.distribution.performanceBonus')}</div>
            <div className="dist-amount">{t('tokenPrograms.blockRewards.distribution.performanceBonusAmount')}</div>
            <div className="dist-percent">7%</div>
          </div>
          <div className="dist-card halving" data-testid="dist-reserve">
            <div className="dist-icon">🔒</div>
            <div className="dist-name">{t('tokenPrograms.blockRewards.distribution.reserveFund')}</div>
            <div className="dist-amount">{t('tokenPrograms.blockRewards.distribution.reserveFundAmount')}</div>
            <div className="dist-percent">3%</div>
          </div>
        </div>
      </section>

      {/* Halving Schedule Section */}
      <section className="section" id="halving" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">HALVING</span>
          <h2 className="section-title">{t('tokenPrograms.blockRewards.halving.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.blockRewards.halving.subtitle')}</p>
        </div>

        <div className="halving-container">
          <div className="halving-header">
            <h3>🔄 {t('tokenPrograms.blockRewards.halving.roadmapTitle')}</h3>
            <p>{t('tokenPrograms.blockRewards.halving.roadmapDesc')}</p>
          </div>

          <div className="halving-timeline">
            {halvingSchedule.map((item, idx) => (
              <div key={idx} className="halving-item">
                <div className="halving-dot">{idx + 1}</div>
                <div className="halving-year">{item.year}</div>
                <div className="halving-reward">{item.period}</div>
                <div className="halving-amount">{item.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Validator Types Section */}
      <section className="section" id="validators">
        <div className="section-header">
          <span className="section-badge">VALIDATORS</span>
          <h2 className="section-title">{t('tokenPrograms.blockRewards.validators.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.blockRewards.validators.subtitle')}</p>
        </div>

        <div className="validator-types-grid">
          {validatorTypes.map(validator => (
            <div key={validator.id} className={`validator-card ${validator.featured ? 'featured' : ''}`} data-testid={`validator-${validator.id}`}>
              {validator.featured && <span className="featured-badge">{t('tokenPrograms.blockRewards.validators.recommended')}</span>}
              <div className={`validator-header ${validator.id}`}>
                <div className="validator-icon">{validator.icon}</div>
                <h3 className="validator-title">{validator.title}</h3>
                <p className="validator-subtitle">{validator.subtitle}</p>
              </div>
              <div className="validator-content">
                <div className="validator-apy">
                  <span className="validator-apy-label">{t('tokenPrograms.blockRewards.validators.expectedApy')}</span>
                  <span className="validator-apy-value">{validator.apy}</span>
                </div>
                <ul className="validator-requirements">
                  {validator.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
                <button 
                  className="validator-btn primary"
                  onClick={() => handleBecomeValidator(validator.id)}
                  data-testid={`button-start-${validator.id}`}
                >
                  {isConnected ? t('tokenPrograms.blockRewards.validators.getStarted') : t('tokenPrograms.blockRewards.validators.connectWallet')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator Section */}
      <section className="section" id="calculator" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">CALCULATOR</span>
          <h2 className="section-title">{t('tokenPrograms.blockRewards.calculator.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.blockRewards.calculator.subtitle')}</p>
        </div>

        <div className="calculator-container">
          <div className="calculator-card">
            <h3>📊 {t('tokenPrograms.blockRewards.calculator.stakingInput')}</h3>
            <div className="calc-input-group">
              <label>{t('tokenPrograms.blockRewards.calculator.stakingAmount')}</label>
              <div className="calc-input-wrapper">
                <input 
                  type="number" 
                  className="calc-input" 
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  data-testid="input-stake-amount"
                />
                <span className="calc-input-suffix">TBURN</span>
              </div>
              <input 
                type="range" 
                className="calc-slider" 
                min="100" 
                max="10000000" 
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="calculator-card">
            <h3>💰 {t('tokenPrograms.blockRewards.calculator.estimatedRewards')}</h3>
            <div className="calc-result">
              <div className="calc-result-row">
                <span className="calc-result-label">{t('tokenPrograms.blockRewards.calculator.dailyReward')}</span>
                <span className="calc-result-value emerald">{dailyReward.toLocaleString()} TBURN</span>
              </div>
              <div className="calc-result-row">
                <span className="calc-result-label">{t('tokenPrograms.blockRewards.calculator.monthlyReward')}</span>
                <span className="calc-result-value emerald">{monthlyReward.toLocaleString()} TBURN</span>
              </div>
              <div className="calc-result-row">
                <span className="calc-result-label">{t('tokenPrograms.blockRewards.calculator.yearlyReward')}</span>
                <span className="calc-result-value large">{yearlyReward.toLocaleString()} TBURN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slashing Rules Section */}
      <section className="section" id="slashing">
        <div className="section-header">
          <span className="section-badge">SLASHING</span>
          <h2 className="section-title">{t('tokenPrograms.blockRewards.slashingSection.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.blockRewards.slashingSection.subtitle')}</p>
        </div>

        <div className="slashing-grid">
          {slashingRules.map(rule => (
            <div key={rule.severity} className={`slashing-card ${rule.severity}`} data-testid={`slashing-${rule.severity}`}>
              <div className="slashing-header">
                <div className="slashing-icon">{rule.icon}</div>
                <div>
                  <h4 className="slashing-title">{rule.title}</h4>
                  <p className="slashing-penalty">{rule.penalty}</p>
                </div>
              </div>
              <p className="slashing-desc">{rule.desc}</p>
              <ul className="slashing-examples">
                {rule.examples.map((example, idx) => (
                  <li key={idx}>{example}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Active Validators Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">VALIDATORS</span>
          <h2 className="section-title">{t('tokenPrograms.blockRewards.activeValidators.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.blockRewards.activeValidators.subtitle')}</p>
        </div>

        <div className="validators-section">
          <div className="validators-header">
            <h3>🖥️ Top Validators</h3>
          </div>

          <table className="validators-table">
            <thead>
              <tr>
                <th>{t('tokenPrograms.blockRewards.activeValidators.validator')}</th>
                <th>{t('tokenPrograms.blockRewards.activeValidators.staking')}</th>
                <th>{t('tokenPrograms.blockRewards.activeValidators.commission')}</th>
                <th>{t('tokenPrograms.blockRewards.activeValidators.uptime')}</th>
                <th>{t('tokenPrograms.blockRewards.activeValidators.status')}</th>
                <th>{t('tokenPrograms.blockRewards.activeValidators.delegate')}</th>
              </tr>
            </thead>
            <tbody>
              {activeValidators.map((validator, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="validator-cell">
                      <div className="validator-avatar">{validator.name.charAt(0)}</div>
                      <div>
                        <div className="validator-name">{validator.name}</div>
                        <div className="validator-address">{validator.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="stake-cell">{validator.stake} TBURN</td>
                  <td className="commission-cell">{validator.commission}</td>
                  <td className="uptime-cell">{validator.uptime}</td>
                  <td><span className="status-badge">Active</span></td>
                  <td>
                    <button 
                      className="delegate-btn-small"
                      onClick={() => handleDelegate(validator.name)}
                      data-testid={`button-delegate-${idx}`}
                    >
                      {isConnected ? t('tokenPrograms.blockRewards.activeValidators.delegateBtn') : t('tokenPrograms.blockRewards.validators.connectWallet')}
                    </button>
                  </td>
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
          <h2 className="section-title">{t('tokenPrograms.blockRewards.faq.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.blockRewards.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-item-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('tokenPrograms.blockRewards.faq.q1')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.blockRewards.faq.a1')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-item-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('tokenPrograms.blockRewards.faq.q2')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.blockRewards.faq.a2')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-item-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('tokenPrograms.blockRewards.faq.q3')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.blockRewards.faq.a3')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-item-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('tokenPrograms.blockRewards.faq.q4')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.blockRewards.faq.a4')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-item-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('tokenPrograms.blockRewards.faq.q5')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.blockRewards.faq.a5')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-item-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('tokenPrograms.blockRewards.faq.q6')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.blockRewards.faq.a6')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-item-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('tokenPrograms.blockRewards.faq.q7')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.blockRewards.faq.a7')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-item-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('tokenPrograms.blockRewards.faq.q8')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.blockRewards.faq.a8')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('tokenPrograms.blockRewards.ctaSection.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('tokenPrograms.blockRewards.ctaSection.description')}
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--emerald)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-start"
            onClick={() => { 
              scrollToSection('validators'); 
              toast({ title: t('tokenPrograms.blockRewards.toast.validatorStart'), description: t('tokenPrograms.blockRewards.toast.validatorStartDesc') }); 
            }}
          >
            {t('tokenPrograms.blockRewards.ctaSection.startNow')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('tokenPrograms.blockRewards.footer.tagline')}</p>
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
              <li><a href="/" data-testid="footer-link-mainnet">{t('tokenPrograms.blockRewards.footer.mainnet')}</a></li>
              <li><a href="/scan" data-testid="footer-link-explorer">{t('tokenPrograms.blockRewards.footer.explorer')}</a></li>
              <li><a href="/app/bridge" data-testid="footer-link-bridge">{t('tokenPrograms.blockRewards.footer.bridge')}</a></li>
              <li><a href="/app/staking" data-testid="footer-link-staking">{t('tokenPrograms.blockRewards.footer.staking')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="/learn/whitepaper" data-testid="footer-link-whitepaper">{t('tokenPrograms.blockRewards.footer.whitepaper')}</a></li>
              <li><a href="/developers/docs" data-testid="footer-link-docs">{t('tokenPrograms.blockRewards.footer.docs')}</a></li>
              <li><a 
                href="https://github.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('GitHub', 'https://github.com/tburnchain'); }}
                data-testid="footer-link-github-resources"
              >GitHub</a></li>
              <li><a href="/security-audit" data-testid="footer-link-audit">{t('tokenPrograms.blockRewards.footer.auditReport')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><a href="/community/news" data-testid="footer-link-blog">{t('tokenPrograms.blockRewards.footer.blog')}</a></li>
              <li><a href="/community-program" data-testid="footer-link-ambassador">{t('tokenPrograms.blockRewards.footer.ambassador')}</a></li>
              <li><a href="/community-program" data-testid="footer-link-grants">{t('tokenPrograms.blockRewards.footer.grants')}</a></li>
              <li><a href="/qna" data-testid="footer-link-support">{t('tokenPrograms.blockRewards.footer.support')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">{t('tokenPrograms.blockRewards.footer.terms')}</a>
            <a href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">{t('tokenPrograms.blockRewards.footer.privacy')}</a>
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
