import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
        title: "복사 완료",
        description: "레퍼럴 링크가 클립보드에 복사되었습니다.",
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
          background: var(--gradient-gold);
          border-radius: 12px;
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
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#how-it-works">작동 방식</a>
            <a href="#tiers">등급 시스템</a>
            <a href="#dashboard">대시보드</a>
            <a href="#calculator">보상 계산기</a>
            <a href="#leaderboard">리더보드</a>
          </nav>
          <button 
            className={`connect-btn ${isConnected ? 'connected' : ''}`} 
            onClick={handleConnectWallet}
            disabled={isConnecting}
            data-testid="button-connect-wallet"
          >
            {isConnecting ? '연결 중...' : isConnected ? `${formatAddress(address || '')}` : '🔗 지갑 연결'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            REFERRAL PROGRAM - 실시간 정산
          </div>
          <h1>
            친구를 초대하고<br />
            <span className="purple">3억 TBURN</span> 보상을 받으세요
          </h1>
          <p className="hero-subtitle">
            TBURN Chain 레퍼럴 프로그램에 참여하여 최대 50% 커미션을 받으세요.
            초대한 친구가 거래할 때마다 실시간으로 보상이 적립됩니다.
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
              <div className="stat-label">총 참여자</div>
            </div>
            <div className="stat-card" data-testid="stat-total-referrals">
              {isLoadingStats ? (
                <div className="stat-skeleton"></div>
              ) : (
                <div className="stat-value" data-testid="text-total-referrals">
                  {stats?.totalReferrals?.toLocaleString() || '0'}
                </div>
              )}
              <div className="stat-label">총 레퍼럴</div>
            </div>
            <div className="stat-card" data-testid="stat-total-rewards">
              {isLoadingStats ? (
                <div className="stat-skeleton"></div>
              ) : (
                <div className="stat-value" data-testid="text-total-rewards">
                  {Number(stats?.totalRewardsDistributed || 0).toLocaleString()}
                </div>
              )}
              <div className="stat-label">총 보상 분배 (TBURN)</div>
            </div>
            <div className="stat-card" data-testid="stat-active-referrers">
              {isLoadingStats ? (
                <div className="stat-skeleton"></div>
              ) : (
                <div className="stat-value" data-testid="text-active-referrers">
                  {stats?.activeReferrers?.toLocaleString() || '0'}
                </div>
              )}
              <div className="stat-label">활성 레퍼러</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              onClick={handleGetReferralLink}
              disabled={generateReferralMutation.isPending}
              data-testid="button-get-link"
            >
              {generateReferralMutation.isPending ? '생성 중...' : '🔗 내 초대 링크 받기'}
            </button>
            <a href="#how-it-works" className="btn-secondary">
              작동 방식 보기
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div className="section-header">
          <span className="section-badge">HOW IT WORKS</span>
          <h2 className="section-title">레퍼럴 프로그램 작동 방식</h2>
          <p className="section-subtitle">4단계로 간단하게 보상을 받으세요</p>
        </div>

        <div className="steps-grid">
          <div className="step-card" data-testid="step-1">
            <div className="step-number">1</div>
            <h3 className="step-title">지갑 연결</h3>
            <p className="step-desc">MetaMask 또는 지원 지갑을 연결하여 고유한 초대 링크를 생성하세요.</p>
          </div>
          <div className="step-card" data-testid="step-2">
            <div className="step-number">2</div>
            <h3 className="step-title">링크 공유</h3>
            <p className="step-desc">SNS, 커뮤니티, 친구에게 초대 링크를 공유하세요.</p>
          </div>
          <div className="step-card" data-testid="step-3">
            <div className="step-number">3</div>
            <h3 className="step-title">친구 활동</h3>
            <p className="step-desc">초대받은 친구가 TBURN Chain에서 거래, 스테이킹 등 활동을 합니다.</p>
          </div>
          <div className="step-card" data-testid="step-4">
            <div className="step-number">4</div>
            <h3 className="step-title">보상 수령</h3>
            <p className="step-desc">친구 활동의 수수료에서 커미션을 실시간으로 받습니다.</p>
          </div>
        </div>
      </section>

      {/* Tier System */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">TIER SYSTEM</span>
          <h2 className="section-title">등급별 커미션</h2>
          <p className="section-subtitle">초대 실적에 따라 등급이 올라가고 커미션율이 증가합니다</p>
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
                  {tier.minReferrals} ~ {tier.maxReferrals ? `${tier.maxReferrals}명` : '무제한'} 초대
                </p>
                <ul className="tier-benefits">
                  {(tier.benefits || [`${tier.commission}% 커미션`, `${tier.bonus || 0} TBURN 보너스`]).map((benefit, i) => (
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
                <p className="tier-requirement">0 ~ 9명 초대</p>
                <ul className="tier-benefits">
                  <li><span className="check">✓</span> 기본 커미션 20%</li>
                  <li><span className="check">✓</span> 1단계 레퍼럴</li>
                  <li><span className="check">✓</span> 실시간 정산</li>
                  <li><span className="check">✓</span> 기본 대시보드</li>
                </ul>
              </div>

              <div className="tier-card silver" data-testid="tier-silver">
                <span className="tier-badge">INTERMEDIATE</span>
                <div className="tier-icon">🥈</div>
                <h3 className="tier-name">Silver</h3>
                <div className="tier-commission">30%</div>
                <p className="tier-requirement">10 ~ 49명 초대</p>
                <ul className="tier-benefits">
                  <li><span className="check">✓</span> 커미션 30%</li>
                  <li><span className="check">✓</span> 2단계 레퍼럴 (5%)</li>
                  <li><span className="check">✓</span> 주간 보너스</li>
                  <li><span className="check">✓</span> 프리미엄 대시보드</li>
                </ul>
              </div>

              <div className="tier-card gold featured" data-testid="tier-gold">
                <span className="tier-badge">POPULAR</span>
                <div className="tier-icon">🥇</div>
                <h3 className="tier-name">Gold</h3>
                <div className="tier-commission">40%</div>
                <p className="tier-requirement">50 ~ 199명 초대</p>
                <ul className="tier-benefits">
                  <li><span className="check">✓</span> 커미션 40%</li>
                  <li><span className="check">✓</span> 2단계 레퍼럴 (10%)</li>
                  <li><span className="check">✓</span> 월간 보너스</li>
                  <li><span className="check">✓</span> 전용 매니저</li>
                  <li><span className="check">✓</span> 얼리 액세스</li>
                </ul>
              </div>

              <div className="tier-card diamond" data-testid="tier-diamond">
                <span className="tier-badge">ELITE</span>
                <div className="tier-icon">💎</div>
                <h3 className="tier-name">Diamond</h3>
                <div className="tier-commission">50%</div>
                <p className="tier-requirement">200명+ 초대</p>
                <ul className="tier-benefits">
                  <li><span className="check">✓</span> 최대 커미션 50%</li>
                  <li><span className="check">✓</span> 3단계 레퍼럴 (15%)</li>
                  <li><span className="check">✓</span> VIP 보너스</li>
                  <li><span className="check">✓</span> 1:1 전담 매니저</li>
                  <li><span className="check">✓</span> 독점 이벤트 초대</li>
                  <li><span className="check">✓</span> 거버넌스 보너스</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Dashboard */}
      <section className="section" id="dashboard">
        <div className="section-header">
          <span className="section-badge">MY DASHBOARD</span>
          <h2 className="section-title">레퍼럴 대시보드</h2>
          <p className="section-subtitle">내 초대 현황과 수익을 실시간으로 확인하세요</p>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-title">
              <h3>내 레퍼럴 현황</h3>
              <p>{isConnected ? `지갑 주소: ${formatAddress(address || '')}` : '지갑을 연결하면 상세 정보를 확인할 수 있습니다'}</p>
            </div>
            {userReferralData && (
              <div className="current-tier" data-testid="user-tier">
                <span>{getTierIcon(userReferralData.tier)}</span>
                <span>{userReferralData.tier} Tier</span>
              </div>
            )}
          </div>

          <div className="referral-link-box">
            <div className="referral-link-label">내 초대 링크</div>
            <div className="referral-link-input">
              <input 
                type="text" 
                value={userReferralData?.referralLink || (isConnected ? `https://tburn.io/ref/${address?.slice(0, 8)}` : '지갑을 연결하면 링크가 생성됩니다')} 
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
                {copied ? '✓ 복사됨' : '📋 복사'}
              </button>
            </div>
            {userReferralData?.referralCode && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--light-gray)' }}>
                레퍼럴 코드: <span style={{ fontFamily: 'monospace', color: 'var(--gold)' }} data-testid="text-referral-code">{userReferralData.referralCode}</span>
              </div>
            )}
            <div className="share-buttons">
              <button className="share-btn" data-testid="button-share-twitter">𝕏 Twitter</button>
              <button className="share-btn" data-testid="button-share-telegram">Telegram</button>
              <button className="share-btn" data-testid="button-share-discord">Discord</button>
              <button className="share-btn" data-testid="button-share-kakaotalk">KakaoTalk</button>
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="dash-stat">
              <div className="dash-stat-value purple" data-testid="text-user-referral-count">
                {userReferralData?.referralCount?.toLocaleString() || '0'}
              </div>
              <div className="dash-stat-label">총 초대 수</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value success">
                {stats?.activeReferrers?.toLocaleString() || '0'}
              </div>
              <div className="dash-stat-label">활성 유저</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value gold" data-testid="text-user-total-earnings">
                {Number(userReferralData?.totalEarnings || 0).toLocaleString()}
              </div>
              <div className="dash-stat-label">총 적립 TBURN</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value blue">
                {Number(stats?.totalRewardsDistributed || 0).toLocaleString()}
              </div>
              <div className="dash-stat-label">총 분배 TBURN</div>
            </div>
          </div>

          {!isConnected && (
            <div className="empty-state" data-testid="empty-dashboard">
              <p>지갑을 연결하여 레퍼럴 활동을 시작하세요</p>
              <button 
                className="btn-primary" 
                onClick={handleConnectWallet}
                disabled={isConnecting}
                data-testid="button-dashboard-connect"
              >
                {isConnecting ? '연결 중...' : '지갑 연결하기'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Calculator */}
      <section className="section" id="calculator" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">CALCULATOR</span>
          <h2 className="section-title">보상 계산기</h2>
          <p className="section-subtitle">예상 수익을 미리 계산해보세요</p>
        </div>

        <div className="calculator-container">
          <div className="calc-section">
            <h3>조건 입력</h3>
            <div className="calc-field">
              <label>내 등급</label>
              <select value={calcTier} onChange={(e) => setCalcTier(Number(e.target.value))} data-testid="select-calc-tier">
                <option value={20}>Bronze (20%)</option>
                <option value={30}>Silver (30%)</option>
                <option value={40}>Gold (40%)</option>
                <option value={50}>Diamond (50%)</option>
              </select>
            </div>
            <div className="calc-field">
              <label>예상 초대 수 (월)</label>
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
              <label>피추천인 평균 월 거래량 ($)</label>
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
              <label>TBURN 예상 가격 ($)</label>
              <select value={calcPrice} onChange={(e) => setCalcPrice(Number(e.target.value))} data-testid="select-calc-price">
                <option value={0.5}>$0.50 (TGE)</option>
                <option value={1}>$1.00</option>
                <option value={2}>$2.00</option>
                <option value={5}>$5.00</option>
              </select>
            </div>
          </div>

          <div className="calc-section result">
            <h3>예상 수익</h3>
            <div className="result-item">
              <span className="result-label">총 거래량 (월)</span>
              <span className="result-value" data-testid="text-calc-total-volume">${totalVolume.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">거래 수수료 (0.1%)</span>
              <span className="result-value">${fee.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">내 커미션 ({calcTier}%)</span>
              <span className="result-value">${commission.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">월 수익 (TBURN)</span>
              <span className="result-value highlight" data-testid="text-calc-monthly">{monthlyTburn.toFixed(0)} TBURN</span>
            </div>
            <div className="result-item">
              <span className="result-label">연 수익 (TBURN)</span>
              <span className="result-value highlight">{yearlyTburn.toFixed(0)} TBURN</span>
            </div>
            <div className="result-total">
              <div className="result-total-label">연간 예상 수익 (USD)</div>
              <div className="result-total-value" data-testid="text-calc-yearly-usd">${yearlyUsd.toFixed(2)}</div>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
              * 실제 수익은 시장 상황에 따라 달라질 수 있습니다
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="section" id="leaderboard">
        <div className="section-header">
          <span className="section-badge">LEADERBOARD</span>
          <h2 className="section-title">레퍼럴 리더보드</h2>
          <p className="section-subtitle">상위 레퍼러들의 실적을 확인하세요</p>
        </div>

        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <h3>Top Referrers</h3>
            <div className="leaderboard-filter">
              <button className="filter-btn active" data-testid="filter-all">전체</button>
              <button className="filter-btn" data-testid="filter-week">이번 주</button>
              <button className="filter-btn" data-testid="filter-month">이번 달</button>
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
                    <div className="label">초대 수</div>
                  </div>
                  <div className="earnings">
                    <div className="value" data-testid={`leaderboard-earnings-${index}`}>
                      {Number(entry.totalEarnings || entry.earnings || 0).toLocaleString()} TBURN
                    </div>
                    <div className="label">총 수익</div>
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
                    <div className="label">초대 수</div>
                  </div>
                  <div className="earnings">
                    <div className="value">125,000 TBURN</div>
                    <div className="label">총 수익</div>
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
                    <div className="label">초대 수</div>
                  </div>
                  <div className="earnings">
                    <div className="value">89,200 TBURN</div>
                    <div className="label">총 수익</div>
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
                    <div className="label">초대 수</div>
                  </div>
                  <div className="earnings">
                    <div className="value">65,400 TBURN</div>
                    <div className="label">총 수익</div>
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
                    <div className="label">초대 수</div>
                  </div>
                  <div className="earnings">
                    <div className="value">42,300 TBURN</div>
                    <div className="label">총 수익</div>
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
                    <div className="label">초대 수</div>
                  </div>
                  <div className="earnings">
                    <div className="value">31,800 TBURN</div>
                    <div className="label">총 수익</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-secondary" style={{ padding: '12px 30px' }} data-testid="button-view-all-rankings">
              전체 순위 보기
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">레퍼럴 프로그램 관련 궁금한 점을 확인하세요</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeTab === 'faq-1' ? 'active' : ''}`} data-testid="faq-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>레퍼럴 보상 풀 총 물량은 얼마인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>레퍼럴 프로그램 총 보상 풀은 3억 TBURN입니다. 이는 전체 공급량 100억 TBURN의 3%에 해당합니다. TGE 시점에 5%(1,500만 TBURN)가 해제되고, 나머지는 36개월에 걸쳐 선형 베스팅됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-2' ? 'active' : ''}`} data-testid="faq-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>커미션은 어떻게 계산되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>피추천인이 TBURN Chain에서 거래, 스테이킹, 브릿지 등의 활동을 할 때 발생하는 수수료의 일정 비율을 커미션으로 받습니다. 기본 수수료율은 0.1%이며, 내 등급에 따라 20~50%의 커미션을 받습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-3' ? 'active' : ''}`} data-testid="faq-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>등급은 어떻게 올릴 수 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>초대한 친구 수에 따라 등급이 자동으로 올라갑니다. Bronze(0-9명), Silver(10-49명), Gold(50-199명), Diamond(200명+)로 구분되며, 등급이 올라갈수록 더 높은 커미션율을 받습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-4' ? 'active' : ''}`} data-testid="faq-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>보상은 언제 받을 수 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>레퍼럴 보상은 실시간으로 적립되며, 누적된 보상은 언제든지 출금할 수 있습니다. 다만, 최소 출금 수량은 100 TBURN입니다.</p>
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
                <TBurnLogo className="w-6 h-6" />
              </div>
              <div className="logo-text">TBURN<span>CHAIN</span></div>
            </div>
            <p>차세대 블록체인 인프라</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Telegram">T</a>
              <a href="#" aria-label="Discord">D</a>
              <a href="#" aria-label="GitHub">G</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>프로그램</h4>
            <ul>
              <li><a href="#how-it-works">작동 방식</a></li>
              <li><a href="#tiers">등급 시스템</a></li>
              <li><a href="#calculator">보상 계산기</a></li>
              <li><a href="#leaderboard">리더보드</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>리소스</h4>
            <ul>
              <li><a href="/docs">문서</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/support">지원</a></li>
              <li><a href="/blog">블로그</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>법적 고지</h4>
            <ul>
              <li><a href="/terms">이용약관</a></li>
              <li><a href="/privacy">개인정보처리방침</a></li>
              <li><a href="/disclaimer">면책조항</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 TBURN Chain. All rights reserved.</p>
          <p>Powered by TBURN Technology</p>
        </div>
      </footer>
    </div>
  );
}
