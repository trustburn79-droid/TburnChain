import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

interface ReferralStats {
  success: boolean;
  data: {
    totalParticipants: number;
    totalReferrals: number;
    totalRewardsDistributed: string;
    activeReferrers: number;
    tiers: Array<{
      name: string;
      commission: number;
      minReferrals: number;
      maxReferrals: number | null;
      benefits?: string[];
      bonus?: string;
    }>;
    leaderboard: Array<{
      rank: number;
      walletAddress?: string;
      tier: string;
      referralCount?: number;
      referrals?: number;
      totalEarnings?: string;
      earnings?: string;
    }>;
  };
}

interface UserReferralData {
  walletAddress: string;
  referralCode: string;
  referralLink: string;
  tier: string;
  referralCount: number;
  totalEarnings: string;
}

export default function ReferralPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>("faq-1");
  const [calcTier, setCalcTier] = useState(40);
  const [calcReferrals, setCalcReferrals] = useState(10);
  const [calcVolume, setCalcVolume] = useState(500);
  const [calcPrice, setCalcPrice] = useState(0.5);
  const [copied, setCopied] = useState(false);

  const { isConnected, address, connect, isConnecting } = useWeb3();
  const { toast } = useToast();

  const { data: statsData, isLoading: isLoadingStats } = useQuery<ReferralStats>({
    queryKey: ['/api/token-programs/referral/stats'],
  });

  const generateReferralMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      const response = await apiRequest('POST', '/api/token-programs/referral/generate', { walletAddress });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/token-programs/referral/stats'] });
    },
  });

  const [userReferralData, setUserReferralData] = useState<UserReferralData | null>(null);

  useEffect(() => {
    if (isConnected && address && !userReferralData && !generateReferralMutation.isPending) {
      generateReferralMutation.mutateAsync(address)
        .then(result => {
          if (result?.success && result?.data) {
            setUserReferralData(result.data);
          }
        })
        .catch(error => {
          console.error("Failed to generate referral code:", error);
        });
    }
  }, [isConnected, address, userReferralData]);

  const handleConnectWallet = async () => {
    if (isConnecting) return;
    await connect("metamask");
  };

  const handleGetReferralLink = async () => {
    if (!isConnected || !address) {
      handleConnectWallet();
      return;
    }
    
    try {
      const result = await generateReferralMutation.mutateAsync(address);
      if (result.success) {
        setUserReferralData(result.data);
      }
    } catch (error) {
      console.error("Failed to generate referral code:", error);
    }
  };

  const toggleFaq = (id: string) => {
    setActiveTab(activeTab === id ? null : id);
  };

  const totalVolume = calcReferrals * calcVolume;
  const fee = totalVolume * 0.001;
  const commission = fee * (calcTier / 100);
  const monthlyTburn = commission / calcPrice;
  const yearlyTburn = monthlyTburn * 12;
  const yearlyUsd = yearlyTburn * calcPrice;

  const copyRefLink = async () => {
    const link = userReferralData?.referralLink || `https://tburn.io/ref/${address?.slice(0, 8) || '0x0000'}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: t('tokenPrograms.referralPage.dashboard.toasts.copied'),
        description: t('tokenPrograms.referralPage.dashboard.toasts.copiedDesc'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.getElementById('refLink') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const stats = statsData?.data;
  const tiers = stats?.tiers || [];
  const leaderboard = stats?.leaderboard || [];

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'diamond': return '💎';
      default: return '🏆';
    }
  };

  const getTierClass = (tierName: string) => {
    return tierName.toLowerCase();
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="referral-page">
      <style>{`
        .referral-page {
          --navy: #1A365D;
          --navy-light: #2D4A7C;
          --gold: #D4AF37;
          --gold-light: #E5C76B;
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
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-purple: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          --gradient-navy: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

        .referral-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
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

        .nav-links a:hover { color: var(--gold); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-gold);
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
          box-shadow: 0 10px 40px rgba(212, 175, 55, 0.3);
        }

        .connect-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .connect-btn.connected {
          background: var(--gradient-purple);
          color: var(--white);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, transparent 50%), var(--gradient-dark);
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
          right: -300px;
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
          color: var(--purple);
          margin-bottom: 2rem;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .purple {
          background: var(--gradient-purple);
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
          border-color: var(--purple);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--purple);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .stat-skeleton {
          background: linear-gradient(90deg, var(--dark-card) 25%, rgba(255,255,255,0.1) 50%, var(--dark-card) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          height: 2rem;
          width: 80px;
          margin: 0 auto 0.5rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .cta-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: var(--gradient-purple);
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          text-decoration: none;
        }

        .btn-secondary:hover {
          border-color: var(--purple);
          color: var(--purple);
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
          background: rgba(139, 92, 246, 0.15);
          color: var(--purple);
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

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          position: relative;
        }

        .step-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          position: relative;
          z-index: 1;
          transition: all 0.3s;
        }

        .step-card:hover {
          transform: translateY(-10px);
          border-color: var(--purple);
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: var(--gradient-purple);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 auto 1.5rem;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .step-desc {
          color: var(--light-gray);
          font-size: 0.95rem;
        }

        .tier-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .tier-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .tier-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .tier-card.bronze::before { background: linear-gradient(90deg, #CD7F32, #E8A65D); }
        .tier-card.silver::before { background: linear-gradient(90deg, #C0C0C0, #E8E8E8); }
        .tier-card.gold::before { background: var(--gradient-gold); }
        .tier-card.diamond::before { background: linear-gradient(90deg, #B9F2FF, #E0FFFF, #B9F2FF); }

        .tier-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .tier-card.featured {
          border-color: var(--gold);
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, var(--dark-card) 100%);
        }

        .tier-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .tier-card.bronze .tier-badge { background: rgba(205, 127, 50, 0.2); color: #CD7F32; }
        .tier-card.silver .tier-badge { background: rgba(192, 192, 192, 0.2); color: #C0C0C0; }
        .tier-card.gold .tier-badge { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .tier-card.diamond .tier-badge { background: rgba(185, 242, 255, 0.2); color: #B9F2FF; }

        .tier-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .tier-name {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .tier-commission {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }

        .tier-card.bronze .tier-commission { color: #CD7F32; }
        .tier-card.silver .tier-commission { color: #C0C0C0; }
        .tier-card.gold .tier-commission { color: var(--gold); }
        .tier-card.diamond .tier-commission { color: #B9F2FF; }

        .tier-requirement {
          color: var(--light-gray);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .tier-benefits {
          list-style: none;
          text-align: left;
          padding: 0;
        }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .tier-benefits li .check { color: var(--success); }

        .dashboard-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dashboard-title h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .dashboard-title p {
          color: var(--light-gray);
        }

        .current-tier {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 12px 20px;
          border-radius: 12px;
        }

        .current-tier span {
          color: var(--gold);
          font-weight: 700;
        }

        .referral-link-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .referral-link-label {
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 0.75rem;
        }

        .referral-link-input {
          display: flex;
          gap: 1rem;
        }

        .referral-link-input input {
          flex: 1;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px 20px;
          color: var(--white);
          font-size: 1rem;
          font-family: monospace;
        }

        .copy-btn {
          background: var(--gradient-purple);
          color: var(--white);
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .copy-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .copy-btn.copied {
          background: var(--success);
        }

        .share-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .share-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: var(--white);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .share-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .dash-stat {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .dash-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .dash-stat-value.purple { color: var(--purple); }
        .dash-stat-value.gold { color: var(--gold); }
        .dash-stat-value.success { color: var(--success); }
        .dash-stat-value.blue { color: var(--blue); }

        .dash-stat-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .referral-table {
          width: 100%;
          border-collapse: collapse;
        }

        .referral-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .referral-table th:first-child { border-radius: 12px 0 0 12px; }
        .referral-table th:last-child { border-radius: 0 12px 12px 0; }

        .referral-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.95rem;
        }

        .referral-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }

        .calculator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .calc-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .calc-section.result {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, var(--dark-card) 100%);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .calc-section h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .calc-field {
          margin-bottom: 1.5rem;
        }

        .calc-field label {
          display: block;
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 0.5rem;
        }

        .calc-field input, .calc-field select {
          width: 100%;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: var(--white);
          font-size: 1rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-label {
          color: var(--light-gray);
        }

        .result-value {
          font-weight: 700;
          font-size: 1.125rem;
        }

        .result-value.highlight {
          color: var(--gold);
          font-size: 1.5rem;
        }

        .result-total {
          background: var(--gradient-gold);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          margin-top: 1.5rem;
        }

        .result-total-label {
          font-size: 0.875rem;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }

        .result-total-value {
          font-size: 2rem;
          font-weight: 900;
          color: var(--dark);
        }

        .leaderboard-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .leaderboard-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .leaderboard-filter {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: var(--light-gray);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-btn.active {
          background: var(--purple);
          border-color: var(--purple);
          color: var(--white);
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .leaderboard-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .leaderboard-item.top-3 {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .rank {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 800;
        }

        .rank.gold-rank { background: var(--gradient-gold); color: var(--dark); }
        .rank.silver-rank { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank.bronze-rank { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .user-info { flex: 1; }

        .user-address {
          font-family: monospace;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .user-tier {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .referral-count, .earnings {
          text-align: right;
          min-width: 120px;
        }

        .referral-count .value, .earnings .value {
          font-weight: 700;
          font-size: 1.125rem;
        }

        .earnings .value { color: var(--gold); }

        .referral-count .label, .earnings .label {
          font-size: 0.75rem;
          color: var(--light-gray);
        }

        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item:hover {
          border-color: rgba(139, 92, 246, 0.3);
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          cursor: pointer;
        }

        .faq-question h4 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .faq-chevron {
          font-size: 0.75rem;
          color: var(--light-gray);
          transition: transform 0.3s;
        }

        .faq-item.active .faq-chevron {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s, padding 0.3s;
        }

        .faq-item.active .faq-answer {
          max-height: 500px;
          padding: 0 1.5rem 1.5rem;
        }

        .faq-answer p {
          color: var(--light-gray);
          line-height: 1.8;
        }

        .referral-footer {
          background: var(--dark-card);
          padding: 4rem 2rem 2rem;
          margin-top: 4rem;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand .logo {
          margin-bottom: 1rem;
        }

        .footer-brand p {
          color: var(--light-gray);
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--light-gray);
          transition: all 0.3s;
          text-decoration: none;
        }

        .social-links a:hover {
          background: var(--purple);
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
        .footer-links a:hover { color: var(--purple); }

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

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--light-gray);
        }

        .empty-state p {
          margin-bottom: 1rem;
        }

        @media (max-width: 1200px) {
          .tier-grid, .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid, .dashboard-stats { grid-template-columns: repeat(2, 1fr); }
          .calculator-container { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .tier-grid, .steps-grid, .dashboard-stats { grid-template-columns: 1fr; }
          .referral-link-input { flex-direction: column; }
          .share-buttons { flex-wrap: wrap; }
          .share-btn { flex: 1 1 45%; }
          .leaderboard-item { flex-wrap: wrap; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="referral-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a 
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-how-it-works"
            >{t('tokenPrograms.referralPage.nav.howItWorks')}</a>
            <a 
              href="#tiers"
              onClick={(e) => { e.preventDefault(); document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-tiers"
            >{t('tokenPrograms.referralPage.nav.tiers')}</a>
            <a 
              href="#dashboard"
              onClick={(e) => { e.preventDefault(); document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-dashboard"
            >{t('tokenPrograms.referralPage.nav.dashboard')}</a>
            <a 
              href="#calculator"
              onClick={(e) => { e.preventDefault(); document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-calculator"
            >{t('tokenPrograms.referralPage.nav.calculator')}</a>
            <a 
              href="#leaderboard"
              onClick={(e) => { e.preventDefault(); document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-leaderboard"
            >{t('tokenPrograms.referralPage.nav.leaderboard')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className={`connect-btn ${isConnected ? 'connected' : ''}`} 
              onClick={handleConnectWallet}
              disabled={isConnecting}
              data-testid="button-connect-wallet"
            >
              {isConnecting ? t('tokenPrograms.referralPage.header.connecting') : isConnected ? `${formatAddress(address || '')}` : `🔗 ${t('tokenPrograms.referralPage.header.connectWallet')}`}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            {t('tokenPrograms.referralPage.hero.badge')}
          </div>
          <h1>
            <span className="purple">{t('tokenPrograms.referralPage.hero.title')}</span><br />
            {t('tokenPrograms.referralPage.hero.subtitle')}
          </h1>
          <p className="hero-subtitle">
            {t('tokenPrograms.referralPage.hero.description')}
          </p>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-participants">
              {isLoadingStats ? (
                <div className="stat-skeleton"></div>
              ) : (
                <div className="stat-value" data-testid="text-total-participants">
                  {stats?.totalParticipants?.toLocaleString() || '0'}
                </div>
              )}
              <div className="stat-label">{t('tokenPrograms.referralPage.hero.stats.totalParticipants')}</div>
            </div>
            <div className="stat-card" data-testid="stat-total-referrals">
              {isLoadingStats ? (
                <div className="stat-skeleton"></div>
              ) : (
                <div className="stat-value" data-testid="text-total-referrals">
                  {stats?.totalReferrals?.toLocaleString() || '0'}
                </div>
              )}
              <div className="stat-label">{t('tokenPrograms.referralPage.hero.stats.totalReferrals')}</div>
            </div>
            <div className="stat-card" data-testid="stat-total-rewards">
              {isLoadingStats ? (
                <div className="stat-skeleton"></div>
              ) : (
                <div className="stat-value" data-testid="text-total-rewards">
                  {Number(stats?.totalRewardsDistributed || 0).toLocaleString()}
                </div>
              )}
              <div className="stat-label">{t('tokenPrograms.referralPage.hero.stats.totalRewards')}</div>
            </div>
            <div className="stat-card" data-testid="stat-active-referrers">
              {isLoadingStats ? (
                <div className="stat-skeleton"></div>
              ) : (
                <div className="stat-value" data-testid="text-active-referrers">
                  {stats?.activeReferrers?.toLocaleString() || '0'}
                </div>
              )}
              <div className="stat-label">{t('tokenPrograms.referralPage.hero.stats.activeReferrers')}</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              onClick={handleGetReferralLink}
              disabled={generateReferralMutation.isPending}
              data-testid="button-get-link"
            >
              {generateReferralMutation.isPending ? t('tokenPrograms.referralPage.header.connecting') : `🔗 ${t('tokenPrograms.referralPage.hero.buttons.getReferralLink')}`}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-how-it-works"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('tokenPrograms.referralPage.hero.buttons.viewDashboard')}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.referralPage.howItWorks.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.referralPage.howItWorks.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.referralPage.howItWorks.subtitle')}</p>
        </div>

        <div className="steps-grid">
          <div className="step-card" data-testid="step-1">
            <div className="step-number">1</div>
            <h3 className="step-title">{t('tokenPrograms.referralPage.howItWorks.steps.connect.title')}</h3>
            <p className="step-desc">{t('tokenPrograms.referralPage.howItWorks.steps.connect.desc')}</p>
          </div>
          <div className="step-card" data-testid="step-2">
            <div className="step-number">2</div>
            <h3 className="step-title">{t('tokenPrograms.referralPage.howItWorks.steps.share.title')}</h3>
            <p className="step-desc">{t('tokenPrograms.referralPage.howItWorks.steps.share.desc')}</p>
          </div>
          <div className="step-card" data-testid="step-3">
            <div className="step-number">3</div>
            <h3 className="step-title">{t('tokenPrograms.referralPage.howItWorks.steps.activity.title')}</h3>
            <p className="step-desc">{t('tokenPrograms.referralPage.howItWorks.steps.activity.desc')}</p>
          </div>
          <div className="step-card" data-testid="step-4">
            <div className="step-number">4</div>
            <h3 className="step-title">{t('tokenPrograms.referralPage.howItWorks.steps.earn.title')}</h3>
            <p className="step-desc">{t('tokenPrograms.referralPage.howItWorks.steps.earn.desc')}</p>
          </div>
        </div>
      </section>

      {/* Tier System */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.referralPage.tiers.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.referralPage.tiers.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.referralPage.tiers.subtitle')}</p>
        </div>

        <div className="tier-grid">
          {tiers.length > 0 ? (
            tiers.map((tier, index) => (
              <div 
                key={tier.name} 
                className={`tier-card ${getTierClass(tier.name)} ${tier.name.toLowerCase() === 'gold' ? 'featured' : ''}`}
                data-testid={`tier-${tier.name.toLowerCase()}`}
              >
                <span className="tier-badge">
                  {tier.name.toLowerCase() === 'gold' ? 'POPULAR' : tier.name.toUpperCase()}
                </span>
                <div className="tier-icon">{getTierIcon(tier.name)}</div>
                <h3 className="tier-name">{tier.name}</h3>
                <div className="tier-commission">{tier.commission}%</div>
                <p className="tier-requirement">
                  {tier.minReferrals} ~ {tier.maxReferrals || '∞'} {t('tokenPrograms.referralPage.tiers.referrals')}
                </p>
                <ul className="tier-benefits">
                  {(tier.benefits || [`${tier.commission}% ${t('tokenPrograms.referralPage.tiers.commission')}`, `${tier.bonus || 0} TBURN`]).map((benefit, i) => (
                    <li key={i}><span className="check">✓</span> {benefit}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              <div className="tier-card bronze" data-testid="tier-bronze">
                <span className="tier-badge">STARTER</span>
                <div className="tier-icon">🥉</div>
                <h3 className="tier-name">Bronze</h3>
                <div className="tier-commission">20%</div>
                <p className="tier-requirement">{t('tokenPrograms.referralPage.tiers.levels.bronze.requirement')}</p>
                <ul className="tier-benefits">
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.bronze.benefit1')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.bronze.benefit2')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.bronze.benefit3')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.bronze.benefit4')}</li>
                </ul>
              </div>

              <div className="tier-card silver" data-testid="tier-silver">
                <span className="tier-badge">INTERMEDIATE</span>
                <div className="tier-icon">🥈</div>
                <h3 className="tier-name">Silver</h3>
                <div className="tier-commission">30%</div>
                <p className="tier-requirement">{t('tokenPrograms.referralPage.tiers.levels.silver.requirement')}</p>
                <ul className="tier-benefits">
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.silver.benefit1')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.silver.benefit2')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.silver.benefit3')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.silver.benefit4')}</li>
                </ul>
              </div>

              <div className="tier-card gold featured" data-testid="tier-gold">
                <span className="tier-badge">POPULAR</span>
                <div className="tier-icon">🥇</div>
                <h3 className="tier-name">Gold</h3>
                <div className="tier-commission">40%</div>
                <p className="tier-requirement">{t('tokenPrograms.referralPage.tiers.levels.gold.requirement')}</p>
                <ul className="tier-benefits">
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.gold.benefit1')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.gold.benefit2')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.gold.benefit3')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.gold.benefit4')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.gold.benefit5')}</li>
                </ul>
              </div>

              <div className="tier-card diamond" data-testid="tier-diamond">
                <span className="tier-badge">ELITE</span>
                <div className="tier-icon">💎</div>
                <h3 className="tier-name">Diamond</h3>
                <div className="tier-commission">50%</div>
                <p className="tier-requirement">{t('tokenPrograms.referralPage.tiers.levels.diamond.requirement')}</p>
                <ul className="tier-benefits">
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.diamond.benefit1')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.diamond.benefit2')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.diamond.benefit3')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.diamond.benefit4')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.diamond.benefit5')}</li>
                  <li><span className="check">✓</span> {t('tokenPrograms.referralPage.tiers.levels.diamond.benefit6')}</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Dashboard */}
      <section className="section" id="dashboard">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.referralPage.dashboard.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.referralPage.dashboard.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.referralPage.dashboard.subtitle')}</p>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-title">
              <h3>{t('tokenPrograms.referralPage.dashboard.currentTier')}</h3>
              <p>{isConnected ? `${formatAddress(address || '')}` : t('tokenPrograms.referralPage.dashboard.emptyState')}</p>
            </div>
            {userReferralData && (
              <div className="current-tier" data-testid="user-tier">
                <span>{getTierIcon(userReferralData.tier)}</span>
                <span>{userReferralData.tier} Tier</span>
              </div>
            )}
          </div>

          <div className="referral-link-box">
            <div className="referral-link-label">{t('tokenPrograms.referralPage.dashboard.myReferralLink')}</div>
            <div className="referral-link-input">
              <input 
                type="text" 
                value={userReferralData?.referralLink || (isConnected ? `https://tburn.io/ref/${address?.slice(0, 8)}` : t('tokenPrograms.referralPage.dashboard.emptyState'))} 
                readOnly 
                id="refLink"
                data-testid="input-referral-link"
              />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`} 
                onClick={copyRefLink} 
                disabled={!isConnected}
                data-testid="button-copy-link"
              >
                {copied ? `✓ ${t('tokenPrograms.referralPage.dashboard.copied')}` : t('tokenPrograms.referralPage.dashboard.copy')}
              </button>
            </div>
            {userReferralData?.referralCode && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--light-gray)' }}>
                {t('tokenPrograms.referralPage.dashboard.referralCode')}: <span style={{ fontFamily: 'monospace', color: 'var(--gold)' }} data-testid="text-referral-code">{userReferralData.referralCode}</span>
              </div>
            )}
            <div className="share-buttons">
              <button 
                className="share-btn" 
                data-testid="button-share-twitter"
                onClick={() => {
                  const refLink = userReferralData?.referralLink || `https://tburn.io/ref/${address?.slice(0, 8) || 'TBURN'}`;
                  const shareText = t('tokenPrograms.referralPage.dashboard.shareText');
                  const text = encodeURIComponent(`${shareText} ${refLink}`);
                  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                }}
              >
                𝕏 {t('tokenPrograms.referralPage.dashboard.share.twitter')}
              </button>
              <button 
                className="share-btn" 
                data-testid="button-share-telegram"
                onClick={() => {
                  const refLink = userReferralData?.referralLink || `https://tburn.io/ref/${address?.slice(0, 8) || 'TBURN'}`;
                  const shareText = t('tokenPrograms.referralPage.dashboard.shareText');
                  const text = encodeURIComponent(shareText);
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`, '_blank');
                }}
              >
                {t('tokenPrograms.referralPage.dashboard.share.telegram')}
              </button>
              <button 
                className="share-btn" 
                data-testid="button-share-discord"
                onClick={() => {
                  window.open('https://discord.gg/tburn', '_blank');
                }}
              >
                {t('tokenPrograms.referralPage.dashboard.share.discord')}
              </button>
              <button 
                className="share-btn" 
                data-testid="button-share-kakaotalk"
                onClick={async () => {
                  const refLink = userReferralData?.referralLink || `https://tburn.io/ref/${address?.slice(0, 8) || 'TBURN'}`;
                  const shareText = t('tokenPrograms.referralPage.dashboard.shareText');
                  try {
                    await navigator.clipboard.writeText(`${shareText} ${refLink}`);
                    toast({ title: t('tokenPrograms.referralPage.dashboard.toasts.copied'), description: t('tokenPrograms.referralPage.dashboard.toasts.copiedKakao') });
                  } catch {
                    toast({ title: t('tokenPrograms.referralPage.dashboard.toasts.copyFailed'), description: t('tokenPrograms.referralPage.dashboard.toasts.copyFailedDesc'), variant: "destructive" });
                  }
                }}
              >
                {t('tokenPrograms.referralPage.dashboard.share.kakao')}
              </button>
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="dash-stat">
              <div className="dash-stat-value purple" data-testid="text-user-referral-count">
                {userReferralData?.referralCount?.toLocaleString() || '0'}
              </div>
              <div className="dash-stat-label">{t('tokenPrograms.referralPage.dashboard.stats.totalInvites')}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value success">
                {stats?.activeReferrers?.toLocaleString() || '0'}
              </div>
              <div className="dash-stat-label">{t('tokenPrograms.referralPage.dashboard.stats.activeUsers')}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value gold" data-testid="text-user-total-earnings">
                {Number(userReferralData?.totalEarnings || 0).toLocaleString()}
              </div>
              <div className="dash-stat-label">{t('tokenPrograms.referralPage.dashboard.stats.totalEarned')}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value blue">
                {Number(stats?.totalRewardsDistributed || 0).toLocaleString()}
              </div>
              <div className="dash-stat-label">{t('tokenPrograms.referralPage.dashboard.stats.totalDistributed')}</div>
            </div>
          </div>

          {!isConnected && (
            <div className="empty-state" data-testid="empty-dashboard">
              <p>{t('tokenPrograms.referralPage.dashboard.emptyState')}</p>
              <button 
                className="btn-primary" 
                onClick={handleConnectWallet}
                disabled={isConnecting}
                data-testid="button-dashboard-connect"
              >
                {isConnecting ? t('tokenPrograms.referralPage.header.connecting') : t('tokenPrograms.referralPage.dashboard.connectButton')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Calculator */}
      <section className="section" id="calculator" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.referralPage.calculator.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.referralPage.calculator.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.referralPage.calculator.subtitle')}</p>
        </div>

        <div className="calculator-container">
          <div className="calc-section">
            <h3>{t('tokenPrograms.referralPage.calculator.input.title')}</h3>
            <div className="calc-field">
              <label>{t('tokenPrograms.referralPage.calculator.input.tier')}</label>
              <select value={calcTier} onChange={(e) => setCalcTier(Number(e.target.value))} data-testid="select-calc-tier">
                <option value={20}>Bronze (20%)</option>
                <option value={30}>Silver (30%)</option>
                <option value={40}>Gold (40%)</option>
                <option value={50}>Diamond (50%)</option>
              </select>
            </div>
            <div className="calc-field">
              <label>{t('tokenPrograms.referralPage.calculator.input.referrals')}</label>
              <input 
                type="number" 
                value={calcReferrals} 
                onChange={(e) => setCalcReferrals(Number(e.target.value))} 
                min={1} 
                max={1000}
                data-testid="input-calc-referrals"
              />
            </div>
            <div className="calc-field">
              <label>{t('tokenPrograms.referralPage.calculator.input.volume')}</label>
              <input 
                type="number" 
                value={calcVolume} 
                onChange={(e) => setCalcVolume(Number(e.target.value))} 
                min={100} 
                max={100000}
                data-testid="input-calc-volume"
              />
            </div>
            <div className="calc-field">
              <label>{t('tokenPrograms.referralPage.calculator.input.price')}</label>
              <select value={calcPrice} onChange={(e) => setCalcPrice(Number(e.target.value))} data-testid="select-calc-price">
                <option value={0.5}>$0.50 (TGE)</option>
                <option value={1}>$1.00</option>
                <option value={2}>$2.00</option>
                <option value={5}>$5.00</option>
              </select>
            </div>
          </div>

          <div className="calc-section result">
            <h3>{t('tokenPrograms.referralPage.calculator.result.title')}</h3>
            <div className="result-item">
              <span className="result-label">{t('tokenPrograms.referralPage.calculator.result.totalVolume')}</span>
              <span className="result-value" data-testid="text-calc-total-volume">${totalVolume.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">{t('tokenPrograms.referralPage.calculator.result.tradingFee')}</span>
              <span className="result-value">${fee.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">{t('tokenPrograms.referralPage.calculator.result.myCommission')} ({calcTier}%)</span>
              <span className="result-value">${commission.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">{t('tokenPrograms.referralPage.calculator.result.monthlyEarnings')}</span>
              <span className="result-value highlight" data-testid="text-calc-monthly">{monthlyTburn.toFixed(0)} TBURN</span>
            </div>
            <div className="result-item">
              <span className="result-label">{t('tokenPrograms.referralPage.calculator.result.yearlyEarnings')}</span>
              <span className="result-value highlight">{yearlyTburn.toFixed(0)} TBURN</span>
            </div>
            <div className="result-total">
              <div className="result-total-label">{t('tokenPrograms.referralPage.calculator.result.yearlyUsd')}</div>
              <div className="result-total-value" data-testid="text-calc-yearly-usd">${yearlyUsd.toFixed(2)}</div>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
              {t('tokenPrograms.referralPage.calculator.disclaimer')}
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="section" id="leaderboard">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.referralPage.leaderboard.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.referralPage.leaderboard.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.referralPage.leaderboard.subtitle')}</p>
        </div>

        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <h3>{t('tokenPrograms.referralPage.leaderboard.topReferrers')}</h3>
            <div className="leaderboard-filter">
              <button 
                className="filter-btn active" 
                data-testid="filter-all"
                onClick={() => toast({ title: t('tokenPrograms.referralPage.leaderboard.toasts.allRank'), description: t('tokenPrograms.referralPage.leaderboard.toasts.allRankDesc') })}
              >{t('tokenPrograms.referralPage.leaderboard.filters.all')}</button>
              <button 
                className="filter-btn" 
                data-testid="filter-week"
                onClick={() => toast({ title: t('tokenPrograms.referralPage.leaderboard.toasts.weekRank'), description: t('tokenPrograms.referralPage.leaderboard.toasts.weekRankDesc') })}
              >{t('tokenPrograms.referralPage.leaderboard.filters.week')}</button>
              <button 
                className="filter-btn" 
                data-testid="filter-month"
                onClick={() => toast({ title: t('tokenPrograms.referralPage.leaderboard.toasts.monthRank'), description: t('tokenPrograms.referralPage.leaderboard.toasts.monthRankDesc') })}
              >{t('tokenPrograms.referralPage.leaderboard.filters.month')}</button>
            </div>
          </div>

          <div className="leaderboard-list" data-testid="leaderboard-list">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <div 
                  key={entry.walletAddress || `rank-${entry.rank}`} 
                  className={`leaderboard-item ${index < 3 ? 'top-3' : ''}`}
                  data-testid={`leaderboard-item-${index}`}
                >
                  <div className={`rank ${index === 0 ? 'gold-rank' : index === 1 ? 'silver-rank' : index === 2 ? 'bronze-rank' : 'normal'}`}>
                    {entry.rank}
                  </div>
                  <div className="user-info">
                    <div className="user-address" data-testid={`leaderboard-address-${index}`}>
                      {entry.walletAddress ? formatAddress(entry.walletAddress) : `Referrer #${entry.rank}`}
                    </div>
                    <div className="user-tier">{getTierIcon(entry.tier)} {entry.tier} Tier</div>
                  </div>
                  <div className="referral-count">
                    <div className="value" data-testid={`leaderboard-count-${index}`}>
                      {(entry.referralCount || entry.referrals || 0).toLocaleString()}
                    </div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.referrals')}</div>
                  </div>
                  <div className="earnings">
                    <div className="value" data-testid={`leaderboard-earnings-${index}`}>
                      {Number(entry.totalEarnings || entry.earnings || 0).toLocaleString()} TBURN
                    </div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.totalEarnings')}</div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="leaderboard-item top-3" data-testid="leaderboard-item-0">
                  <div className="rank gold-rank">1</div>
                  <div className="user-info">
                    <div className="user-address">0x1a2B...3c4D</div>
                    <div className="user-tier">💎 Diamond Tier</div>
                  </div>
                  <div className="referral-count">
                    <div className="value">1,247</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.referrals')}</div>
                  </div>
                  <div className="earnings">
                    <div className="value">125,000 TBURN</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.totalEarnings')}</div>
                  </div>
                </div>

                <div className="leaderboard-item top-3" data-testid="leaderboard-item-1">
                  <div className="rank silver-rank">2</div>
                  <div className="user-info">
                    <div className="user-address">0x5e6F...7g8H</div>
                    <div className="user-tier">💎 Diamond Tier</div>
                  </div>
                  <div className="referral-count">
                    <div className="value">892</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.referrals')}</div>
                  </div>
                  <div className="earnings">
                    <div className="value">89,200 TBURN</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.totalEarnings')}</div>
                  </div>
                </div>

                <div className="leaderboard-item top-3" data-testid="leaderboard-item-2">
                  <div className="rank bronze-rank">3</div>
                  <div className="user-info">
                    <div className="user-address">0x9i0J...1k2L</div>
                    <div className="user-tier">💎 Diamond Tier</div>
                  </div>
                  <div className="referral-count">
                    <div className="value">654</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.referrals')}</div>
                  </div>
                  <div className="earnings">
                    <div className="value">65,400 TBURN</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.totalEarnings')}</div>
                  </div>
                </div>

                <div className="leaderboard-item" data-testid="leaderboard-item-3">
                  <div className="rank normal">4</div>
                  <div className="user-info">
                    <div className="user-address">0x3m4N...5o6P</div>
                    <div className="user-tier">🥇 Gold Tier</div>
                  </div>
                  <div className="referral-count">
                    <div className="value">423</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.referrals')}</div>
                  </div>
                  <div className="earnings">
                    <div className="value">42,300 TBURN</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.totalEarnings')}</div>
                  </div>
                </div>

                <div className="leaderboard-item" data-testid="leaderboard-item-4">
                  <div className="rank normal">5</div>
                  <div className="user-info">
                    <div className="user-address">0x7q8R...9s0T</div>
                    <div className="user-tier">🥇 Gold Tier</div>
                  </div>
                  <div className="referral-count">
                    <div className="value">318</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.referrals')}</div>
                  </div>
                  <div className="earnings">
                    <div className="value">31,800 TBURN</div>
                    <div className="label">{t('tokenPrograms.referralPage.leaderboard.labels.totalEarnings')}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '12px 30px' }} 
              data-testid="button-view-all-rankings"
              onClick={() => {
                if (!isConnected) {
                  toast({ title: t('tokenPrograms.referralPage.leaderboard.toasts.walletRequired'), description: t('tokenPrograms.referralPage.leaderboard.toasts.walletRequiredDesc') });
                  return;
                }
                toast({ title: t('tokenPrograms.referralPage.leaderboard.toasts.allRank'), description: t('tokenPrograms.referralPage.leaderboard.toasts.comingSoon') });
              }}
            >
              {t('tokenPrograms.referralPage.leaderboard.viewAll')}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.referralPage.faq.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.referralPage.faq.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.referralPage.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeTab === 'faq-1' ? 'active' : ''}`} data-testid="faq-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('tokenPrograms.referralPage.faq.q1.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.referralPage.faq.q1.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-2' ? 'active' : ''}`} data-testid="faq-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('tokenPrograms.referralPage.faq.q2.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.referralPage.faq.q2.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-3' ? 'active' : ''}`} data-testid="faq-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('tokenPrograms.referralPage.faq.q3.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.referralPage.faq.q3.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-4' ? 'active' : ''}`} data-testid="faq-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('tokenPrograms.referralPage.faq.q4.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.referralPage.faq.q4.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-5' ? 'active' : ''}`} data-testid="faq-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('tokenPrograms.referralPage.faq.q5.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.referralPage.faq.q5.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-6' ? 'active' : ''}`} data-testid="faq-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('tokenPrograms.referralPage.faq.q6.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.referralPage.faq.q6.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-7' ? 'active' : ''}`} data-testid="faq-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('tokenPrograms.referralPage.faq.q7.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.referralPage.faq.q7.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-8' ? 'active' : ''}`} data-testid="faq-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('tokenPrograms.referralPage.faq.q8.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.referralPage.faq.q8.answer')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="referral-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">
                <TBurnLogo className="w-9 h-9" />
              </div>
              <div className="logo-text">TBURN<span>CHAIN</span></div>
            </div>
            <p>{t('tokenPrograms.referralPage.footer.tagline')}</p>
            <div className="social-links">
              <a 
                href="https://twitter.com/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                data-testid="footer-link-twitter"
              >𝕏</a>
              <a 
                href="https://t.me/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Telegram"
                data-testid="footer-link-telegram"
              >T</a>
              <a 
                href="https://discord.gg/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Discord"
                data-testid="footer-link-discord"
              >D</a>
              <a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                data-testid="footer-link-github"
              >G</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>{t('tokenPrograms.referralPage.footer.program')}</h4>
            <ul>
              <li><a href="#how-it-works" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>{t('tokenPrograms.referralPage.nav.howItWorks')}</a></li>
              <li><a href="#tiers" onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}>{t('tokenPrograms.referralPage.nav.tiers')}</a></li>
              <li><a href="#calculator" onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>{t('tokenPrograms.referralPage.nav.calculator')}</a></li>
              <li><a href="#leaderboard" onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })}>{t('tokenPrograms.referralPage.nav.leaderboard')}</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('tokenPrograms.referralPage.footer.resources')}</h4>
            <ul>
              <li><Link href="/developers/docs" data-testid="footer-link-docs">{t('tokenPrograms.referralPage.footer.docs')}</Link></li>
              <li><a href="#faq" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} data-testid="footer-link-faq">FAQ</a></li>
              <li><Link href="/qna" data-testid="footer-link-support">{t('tokenPrograms.referralPage.footer.support')}</Link></li>
              <li><Link href="/blog" data-testid="footer-link-blog">{t('tokenPrograms.referralPage.footer.blog')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('tokenPrograms.referralPage.footer.legal')}</h4>
            <ul>
              <li><Link href="/legal/terms-of-service" data-testid="footer-link-terms">{t('tokenPrograms.referralPage.footer.terms')}</Link></li>
              <li><Link href="/legal/privacy-policy" data-testid="footer-link-privacy">{t('tokenPrograms.referralPage.footer.privacy')}</Link></li>
              <li><Link href="/legal/disclaimer" data-testid="footer-link-disclaimer">{t('tokenPrograms.referralPage.footer.disclaimer')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('tokenPrograms.referralPage.footer.copyright')}</p>
          <p>{t('tokenPrograms.referralPage.footer.poweredBy')}</p>
        </div>
      </footer>
    </div>
  );
}
