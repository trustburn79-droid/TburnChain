import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LanguageSelector } from "@/components/LanguageSelector";

interface AirdropPhase {
  id: string;
  name: string;
  allocation: string;
  distributed: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

interface AirdropStats {
  totalAllocation: string;
  totalDistributed: string;
  totalClaimed: number;
  totalEligible: number;
  claimRate: string;
  phases: AirdropPhase[];
  networkTps: number;
  blockHeight: number;
}

interface AirdropResponse {
  success: boolean;
  data: AirdropStats;
}

interface EligibilityResponse {
  success: boolean;
  data: {
    isEligible: boolean;
    allocatedAmount: string;
    claimedAmount: string;
    pendingAmount: string;
    tier: string;
    multiplier: number;
  };
}

export default function AirdropPage() {
  const [activeTab, setActiveTab] = useState<string | null>("faq-1");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const { isConnected, address, connect, formatAddress } = useWeb3();
  const { toast } = useToast();

  const toggleFaq = (id: string) => {
    setActiveTab(activeTab === id ? null : id);
  };

  const { data: statsData, isLoading: isLoadingStats } = useQuery<AirdropResponse>({
    queryKey: ['/api/token-programs/airdrop/stats'],
    refetchInterval: 30000,
  });

  const { data: eligibilityData, isLoading: isLoadingEligibility } = useQuery<EligibilityResponse>({
    queryKey: ['/api/token-programs/airdrop/eligibility', address],
    enabled: isConnected && !!address,
  });

  const emailMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/newsletter/subscribe", { email });
    },
    onSuccess: () => {
      toast({
        title: "이메일 인증 완료",
        description: "+300P가 적립되었습니다!",
      });
      setEmailDialogOpen(false);
      setEmailInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      toast({
        title: "올바른 이메일을 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    emailMutation.mutate(emailInput);
  };

  const handleSocialLink = (platform: string, url: string) => {
    window.open(url, "_blank");
    toast({
      title: `${platform} 미션 진행 중`,
      description: "참여 확인 후 포인트가 적립됩니다.",
    });
  };

  const copyReferralLink = () => {
    const referralCode = address ? address.slice(-8) : "TBURN2026";
    const link = `https://tburn.io/airdrop?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "레퍼럴 링크가 복사되었습니다",
      description: link,
    });
  };

  const stats = statsData?.data;
  const eligibility = eligibilityData?.data;

  const formatNumber = (value: string | number | undefined) => {
    if (!value) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1e8) return `${(num / 1e8).toFixed(1)}억`;
    if (num >= 1e4) return `${(num / 1e4).toFixed(1)}만`;
    return num.toLocaleString();
  };

  const formatLargeNumber = (value: string | number | undefined) => {
    if (!value) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString();
  };

  const getPhaseProgress = (distributed: string, allocation: string) => {
    const dist = parseFloat(distributed) || 0;
    const alloc = parseFloat(allocation) || 1;
    return Math.min(100, (dist / alloc) * 100);
  };

  const handleConnectWallet = async () => {
    await connect("metamask");
  };

  return (
    <div className="airdrop-page">
      <style>{`
        .airdrop-page {
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
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-navy: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .airdrop-header {
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

        .logo-text span {
          color: var(--gold);
        }

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

        .nav-links a:hover {
          color: var(--gold);
        }

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

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
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
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          top: -200px;
          right: -200px;
          animation: float 8s ease-in-out infinite;
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
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--gold);
          margin-bottom: 2rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--gold);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gold {
          background: var(--gradient-gold);
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
          border-color: var(--gold);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
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
          background: var(--gradient-gold);
          color: var(--dark);
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
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.4);
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
        }

        .btn-secondary:hover {
          border-color: var(--gold);
          color: var(--gold);
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
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
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

        .airdrop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .airdrop-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .airdrop-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-gold);
        }

        .airdrop-card:hover {
          transform: translateY(-10px);
          border-color: var(--gold);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .airdrop-card.featured {
          border-color: var(--gold);
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, var(--dark-card) 100%);
        }

        .airdrop-icon {
          width: 64px;
          height: 64px;
          background: var(--gradient-gold);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 1.5rem;
        }

        .airdrop-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .airdrop-amount {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .airdrop-desc {
          color: var(--light-gray);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .airdrop-features {
          list-style: none;
          margin-bottom: 1.5rem;
          padding: 0;
        }

        .airdrop-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          color: var(--light-gray);
          font-size: 0.9rem;
        }

        .airdrop-features li .check-icon {
          color: var(--success);
          font-size: 14px;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          height: 8px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-gold);
          border-radius: 100px;
          transition: width 1s ease;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .tasks-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tasks-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .tasks-info p {
          color: var(--light-gray);
        }

        .points-display {
          text-align: right;
        }

        .points-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
        }

        .points-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .task-category {
          margin-bottom: 2rem;
        }

        .task-category-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--light-gray);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s;
        }

        .task-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .task-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .task-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .task-info h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .task-info p {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .task-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .task-points {
          font-weight: 700;
          color: var(--gold);
        }

        .task-btn {
          background: var(--navy);
          color: var(--white);
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .task-btn:hover {
          background: var(--navy-light);
        }

        .timeline {
          position: relative;
          padding-left: 40px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, var(--gold) 0%, var(--navy) 100%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 2.5rem;
          padding-left: 40px;
        }

        .timeline-dot {
          position: absolute;
          left: -40px;
          top: 5px;
          width: 32px;
          height: 32px;
          background: var(--dark);
          border: 3px solid var(--gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timeline-dot.active {
          background: var(--gold);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }

        .timeline-dot.active .dot-icon {
          color: var(--dark);
        }

        .dot-icon {
          font-size: 12px;
          color: var(--gold);
        }

        .timeline-content {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .timeline-date {
          font-size: 0.875rem;
          color: var(--gold);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .timeline-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .timeline-desc {
          color: var(--light-gray);
          font-size: 0.95rem;
        }

        .eligibility-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .eligibility-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
        }

        .eligibility-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .eligibility-list {
          list-style: none;
          padding: 0;
        }

        .eligibility-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .eligibility-list li:last-child {
          border-bottom: none;
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
          color: var(--gold);
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

        .footer-brand h3 span {
          color: var(--gold);
        }

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
          background: var(--gold);
          color: var(--dark);
        }

        .footer-links h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .footer-links ul {
          list-style: none;
          padding: 0;
        }

        .footer-links ul li {
          margin-bottom: 0.75rem;
        }

        .footer-links ul li a {
          color: var(--light-gray);
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-links ul li a:hover {
          color: var(--gold);
        }

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

        @media (max-width: 1024px) {
          .airdrop-grid {
            grid-template-columns: 1fr;
          }
          .eligibility-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 100px 1rem 60px;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .task-item {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          .task-left {
            flex-direction: column;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>

      {/* Header */}
      <header className="airdrop-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#overview">개요</a>
            <a href="#airdrops">에어드랍</a>
            <a href="#tasks">미션</a>
            <a href="#timeline">일정</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleConnectWallet}
            >
              <i className="fas fa-wallet"></i> 
              {isConnected && address ? formatAddress(address) : '지갑 연결'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="overview">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge" data-testid="badge-live-status">
            <span className="badge-dot"></span>
            LIVE - 메인넷 에어드랍 진행 중
            {stats?.networkTps && (
              <span style={{ marginLeft: '12px', color: 'var(--light-gray)' }} data-testid="text-network-tps">
                | TPS: {stats.networkTps.toLocaleString()}
              </span>
            )}
          </div>
          <h1>
            <span className="gold">3억 TBURN</span><br />
            에어드랍 프로그램
          </h1>
          <p className="hero-subtitle">
            TBURN Chain 메인넷 런칭을 기념하여 커뮤니티 여러분께 3억 TBURN(총 공급량 3%)을 배포합니다.
            미션을 완료하고 포인트를 모아 에어드랍 배분량을 높이세요!
          </p>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-airdrop">
              <div className="stat-value">
                {isLoadingStats ? '...' : formatNumber(stats?.totalAllocation || '300000000')}
              </div>
              <div className="stat-label">총 에어드랍 물량</div>
            </div>
            <div className="stat-card" data-testid="stat-distributed">
              <div className="stat-value">
                {isLoadingStats ? '...' : formatNumber(stats?.totalDistributed || '45000000')}
              </div>
              <div className="stat-label">배분 완료</div>
            </div>
            <div className="stat-card" data-testid="stat-eligible">
              <div className="stat-value">
                {isLoadingStats ? '...' : formatLargeNumber(stats?.totalEligible || 28750)}
              </div>
              <div className="stat-label">참여자 수</div>
            </div>
            <div className="stat-card" data-testid="stat-claim-rate">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${parseFloat(stats?.claimRate || '15').toFixed(1)}%`}
              </div>
              <div className="stat-label">청구율</div>
            </div>
          </div>

          {/* Wallet Eligibility Status */}
          {isConnected && address && (
            <div className="eligibility-status" style={{ 
              background: 'var(--dark-card)', 
              border: '1px solid rgba(212, 175, 55, 0.3)', 
              borderRadius: '16px', 
              padding: '1.5rem', 
              marginBottom: '2rem',
              textAlign: 'left'
            }} data-testid="eligibility-status">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)' }}>
                  내 에어드랍 현황
                </h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--light-gray)' }}>
                  {formatAddress(address)}
                </span>
              </div>
              {isLoadingEligibility ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--light-gray)' }}>
                  자격 확인 중...
                </div>
              ) : eligibility ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div data-testid="eligibility-allocated">
                    <div style={{ fontSize: '0.875rem', color: 'var(--light-gray)', marginBottom: '0.25rem' }}>배정량</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>
                      {formatNumber(eligibility.allocatedAmount)}
                    </div>
                  </div>
                  <div data-testid="eligibility-claimed">
                    <div style={{ fontSize: '0.875rem', color: 'var(--light-gray)', marginBottom: '0.25rem' }}>청구됨</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                      {formatNumber(eligibility.claimedAmount)}
                    </div>
                  </div>
                  <div data-testid="eligibility-pending">
                    <div style={{ fontSize: '0.875rem', color: 'var(--light-gray)', marginBottom: '0.25rem' }}>대기 중</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)' }}>
                      {formatNumber(eligibility.pendingAmount)}
                    </div>
                  </div>
                  <div data-testid="eligibility-tier">
                    <div style={{ fontSize: '0.875rem', color: 'var(--light-gray)', marginBottom: '0.25rem' }}>등급</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>
                      {eligibility.tier || 'Standard'} ({eligibility.multiplier || 1}x)
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--light-gray)' }} data-testid="eligibility-not-found">
                  에어드랍 배정 정보가 없습니다. 미션을 완료하여 참여하세요.
                </div>
              )}
            </div>
          )}

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-participate"
              onClick={() => {
                if (!isConnected) {
                  handleConnectWallet();
                } else {
                  toast({
                    title: "에어드랍 참여 중!",
                    description: "미션을 완료하여 더 많은 포인트를 획득하세요.",
                  });
                  document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {isConnected ? '미션 수행하기' : '지금 참여하기'}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-details"
              onClick={() => {
                document.getElementById('airdrops')?.scrollIntoView({ behavior: 'smooth' });
                toast({
                  title: "에어드랍 유형 안내",
                  description: "3가지 유형의 에어드랍 프로그램을 확인하세요.",
                });
              }}
            >
              자세히 보기
            </button>
          </div>
        </div>
      </section>

      {/* Airdrop Types Section */}
      <section className="section" id="airdrops">
        <div className="section-header">
          <span className="section-badge">AIRDROP TYPES</span>
          <h2 className="section-title">에어드랍 유형</h2>
          <p className="section-subtitle">3가지 유형의 에어드랍 프로그램으로 총 3억 TBURN (총 공급량 3%)을 배포합니다</p>
        </div>

        <div className="airdrop-grid">
          {/* Genesis Airdrop */}
          <div className="airdrop-card featured" data-testid="card-genesis-airdrop">
            <div className="airdrop-icon">🌟</div>
            <h3 className="airdrop-title">제네시스 에어드랍</h3>
            <div className="airdrop-amount">1.5억 TBURN</div>
            <p className="airdrop-desc">메인넷 런칭 기념 초기 참여자를 위한 특별 배분</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> 테스트넷 참여자 우선 배분</li>
              <li><span className="check-icon">✓</span> 제네시스 NFT 홀더 보너스 (2배)</li>
              <li><span className="check-icon">✓</span> 얼리버드 추가 보상 (+20%)</li>
              <li><span className="check-icon">✓</span> TGE 15% 즉시 해제</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '42%' }}></div>
            </div>
            <div className="progress-text">
              <span>배분 진행률</span>
              <span>42% (6,300만 / 1.5억)</span>
            </div>
          </div>

          {/* Community Airdrop */}
          <div className="airdrop-card" data-testid="card-community-airdrop">
            <div className="airdrop-icon">👥</div>
            <h3 className="airdrop-title">커뮤니티 에어드랍</h3>
            <div className="airdrop-amount">1억 TBURN</div>
            <p className="airdrop-desc">소셜 미션 완료 및 커뮤니티 활동 참여 보상</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> X(트위터)/텔레그램/디스코드 팔로우</li>
              <li><span className="check-icon">✓</span> 콘텐츠 생성 및 공유 보상</li>
              <li><span className="check-icon">✓</span> 레퍼럴 보너스 (친구당 500P)</li>
              <li><span className="check-icon">✓</span> 포인트 기반 비례 배분</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '28%' }}></div>
            </div>
            <div className="progress-text">
              <span>배분 진행률</span>
              <span>28% (2,800만 / 1억)</span>
            </div>
          </div>

          {/* Loyalty Airdrop */}
          <div className="airdrop-card" data-testid="card-loyalty-airdrop">
            <div className="airdrop-icon">💎</div>
            <h3 className="airdrop-title">로열티 에어드랍</h3>
            <div className="airdrop-amount">0.5억 TBURN</div>
            <p className="airdrop-desc">장기 홀더 및 스테이킹 참여자를 위한 보상</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> 90일+ 홀딩 보너스 (+50%)</li>
              <li><span className="check-icon">✓</span> 스테이킹 참여 보상</li>
              <li><span className="check-icon">✓</span> 거버넌스 투표 참여 보너스</li>
              <li><span className="check-icon">✓</span> 분기별 스냅샷 추가 배분</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <div className="progress-text">
              <span>배분 진행률</span>
              <span>대기 중 (TGE 후 90일 시작)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="section" id="tasks" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">EARN POINTS</span>
          <h2 className="section-title">미션 수행</h2>
          <p className="section-subtitle">미션을 완료하고 포인트를 모아 에어드랍 배분량을 높이세요</p>
        </div>

        <div className="tasks-container">
          <div className="tasks-header">
            <div className="tasks-info">
              <h3>내 미션 현황</h3>
              <p>
                {isConnected 
                  ? `${formatAddress(address || '')} 지갑으로 연결됨` 
                  : '지갑을 연결하면 미션 진행 상황을 확인할 수 있습니다'}
              </p>
            </div>
            <div className="points-display">
              <div className="points-value" data-testid="text-total-points">
                {isConnected ? '500 P' : '0 P'}
              </div>
              <div className="points-label">획득 포인트</div>
            </div>
          </div>

          {/* Required Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>⭐</span> 필수 미션
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-wallet-connect">
                <div className="task-left">
                  <div className="task-icon">👛</div>
                  <div className="task-info">
                    <h4>지갑 연결</h4>
                    <p>MetaMask 또는 지원 지갑 연결</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+500 P</span>
                  <button 
                    className="task-btn" 
                    onClick={handleConnectWallet}
                    style={isConnected ? { background: 'var(--success)', color: 'white' } : undefined}
                    data-testid="button-task-wallet-connect"
                  >
                    {isConnected ? '완료' : '연결하기'}
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-email-verify">
                <div className="task-left">
                  <div className="task-icon">✅</div>
                  <div className="task-info">
                    <h4>이메일 인증</h4>
                    <p>이메일 주소 등록 및 인증</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+300 P</span>
                  <button 
                    className="task-btn" 
                    onClick={() => setEmailDialogOpen(true)}
                    data-testid="button-task-email-verify"
                  >
                    인증하기
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-telegram-join">
                <div className="task-left">
                  <div className="task-icon">📱</div>
                  <div className="task-info">
                    <h4>텔레그램 가입</h4>
                    <p>공식 텔레그램 그룹 참여</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+400 P</span>
                  <button 
                    className="task-btn"
                    onClick={() => handleSocialLink("텔레그램", "https://t.me/tburnchain")}
                    data-testid="button-task-telegram"
                  >
                    가입하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>🔗</span> 소셜 미션
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-twitter-follow">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#1DA1F2' }}>𝕏</div>
                  <div className="task-info">
                    <h4>X (트위터) 팔로우</h4>
                    <p>@TBURNChain 공식 계정 팔로우</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+200 P</span>
                  <button 
                    className="task-btn"
                    onClick={() => handleSocialLink("X (트위터)", "https://x.com/TBURNChain")}
                    data-testid="button-task-twitter"
                  >
                    팔로우
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-retweet">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#1DA1F2' }}>𝕏</div>
                  <div className="task-info">
                    <h4>런칭 트윗 리트윗</h4>
                    <p>메인넷 런칭 공지 리트윗</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+300 P</span>
                  <button 
                    className="task-btn"
                    onClick={() => handleSocialLink("리트윗", "https://x.com/TBURNChain/status/mainnet-launch")}
                    data-testid="button-task-retweet"
                  >
                    리트윗
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-discord-join">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#5865F2' }}>💬</div>
                  <div className="task-info">
                    <h4>디스코드 가입</h4>
                    <p>공식 디스코드 서버 참여</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+400 P</span>
                  <button 
                    className="task-btn"
                    onClick={() => handleSocialLink("디스코드", "https://discord.gg/tburnchain")}
                    data-testid="button-task-discord"
                  >
                    가입하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bonus Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>🎁</span> 보너스 미션
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-nft-holder">
                <div className="task-left">
                  <div className="task-icon">🎨</div>
                  <div className="task-info">
                    <h4>제네시스 NFT 보유</h4>
                    <p>TBURN 제네시스 NFT 보유 시 2배 보너스</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+2,000 P</span>
                  <button 
                    className="task-btn"
                    onClick={() => {
                      if (!isConnected) {
                        toast({ title: "지갑을 먼저 연결해주세요", variant: "destructive" });
                        return;
                      }
                      toast({ title: "NFT 보유 확인 중...", description: "잠시만 기다려주세요" });
                    }}
                    data-testid="button-task-nft"
                  >
                    확인하기
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-referral">
                <div className="task-left">
                  <div className="task-icon">👥</div>
                  <div className="task-info">
                    <h4>친구 초대 (레퍼럴)</h4>
                    <p>친구 1명당 500P, 최대 10명</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">최대 +5,000 P</span>
                  <button 
                    className="task-btn"
                    onClick={() => setReferralDialogOpen(true)}
                    data-testid="button-task-referral"
                  >
                    초대하기
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-testnet">
                <div className="task-left">
                  <div className="task-icon">📊</div>
                  <div className="task-info">
                    <h4>테스트넷 참여자</h4>
                    <p>테스트넷 활동 기록 보유 시 자동 적용</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+3,000 P</span>
                  <button 
                    className="task-btn"
                    onClick={() => {
                      if (!isConnected) {
                        toast({ title: "지갑을 먼저 연결해주세요", variant: "destructive" });
                        return;
                      }
                      toast({ title: "테스트넷 활동 확인 중...", description: "잠시만 기다려주세요" });
                    }}
                    data-testid="button-task-testnet"
                  >
                    확인하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section" id="timeline">
        <div className="section-header">
          <span className="section-badge">SCHEDULE</span>
          <h2 className="section-title">배분 일정</h2>
          <p className="section-subtitle">에어드랍 배분은 TGE 이후 9개월간 진행됩니다</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot active"><span className="dot-icon">✓</span></div>
              <div className="timeline-content">
                <div className="timeline-date">2025년 11월</div>
                <div className="timeline-title">에어드랍 등록 시작</div>
                <div className="timeline-desc">지갑 연결 및 미션 수행 시작</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot active"><span className="dot-icon">✓</span></div>
              <div className="timeline-content">
                <div className="timeline-date">2026년 1월 (현재)</div>
                <div className="timeline-title">스냅샷 진행 중</div>
                <div className="timeline-desc">참여자 포인트 누적 중 (28,750명)</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot"><span className="dot-icon">⏳</span></div>
              <div className="timeline-content">
                <div className="timeline-date">2026년 2월</div>
                <div className="timeline-title">TGE (토큰 생성 이벤트)</div>
                <div className="timeline-desc">15% (4,500만 TBURN) 즉시 클레임 가능</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot"><span className="dot-icon">⏳</span></div>
              <div className="timeline-content">
                <div className="timeline-date">2026년 3월 ~ 11월</div>
                <div className="timeline-title">월별 베스팅 해제</div>
                <div className="timeline-desc">매월 약 9.4%씩 9개월간 선형 해제</div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ background: 'var(--dark-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--gold)', marginRight: '10px' }}>🧮</span>
                배분 계산 예시
              </h3>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>내 포인트: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>5,000 P</span></p>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>전체 포인트 풀: <span style={{ fontWeight: 600 }}>50,000,000 P</span></p>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>배분 물량: <span style={{ fontWeight: 600 }}>3억 TBURN</span></p>
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                <p style={{ fontSize: '1.125rem' }}>예상 수령량: <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '1.5rem' }}>30,000 TBURN</span></p>
                <p style={{ color: 'var(--light-gray)', fontSize: '0.875rem', marginTop: '0.5rem' }}>예상 가치 (@$0.50): <span style={{ color: 'var(--success)', fontWeight: 600 }}>$15,000</span></p>
              </div>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                * 실제 배분량은 최종 스냅샷 시점의 전체 포인트 합계에 따라 달라질 수 있습니다.
              </p>
            </div>

            <div style={{ background: 'var(--dark-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--gold)', marginRight: '10px' }}>🔓</span>
                베스팅 스케줄
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--light-gray)' }}>TGE (Day 0)</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>15%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--light-gray)' }}>M1 ~ M9</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>매월 ~9.4%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', color: 'var(--gold)', fontWeight: 600 }}>9개월 후 완료</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: 'var(--gold)' }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">ELIGIBILITY</span>
          <h2 className="section-title">참여 자격</h2>
          <p className="section-subtitle">에어드랍 참여 자격 요건을 확인하세요</p>
        </div>

        <div className="eligibility-grid">
          <div className="eligibility-card" data-testid="card-eligible">
            <h3><span style={{ color: 'var(--success)' }}>✓</span> 참여 가능 조건</h3>
            <ul className="eligibility-list">
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>지갑 연결 필수</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>MetaMask, Trust Wallet, Coinbase Wallet 등 지원</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>필수 미션 완료</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>지갑 연결 + 이메일 인증 + 텔레그램 가입</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>최소 1,000 포인트 획득</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>포인트 미달 시 배분 대상에서 제외</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>스냅샷 시점까지 자격 유지</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>2026년 1월 스냅샷 예정</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="eligibility-card" data-testid="card-excluded">
            <h3><span style={{ color: 'var(--warning)' }}>⚠</span> 제외 대상</h3>
            <ul className="eligibility-list">
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>제한 국가 거주자</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>미국, 중국, 북한 등 규제 국가 제외</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>시빌 어택 (Sybil Attack)</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>다중 계정 사용 시 모든 계정 제외</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>봇 활동 감지</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>자동화 도구 사용 시 제외</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>부정 행위</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>미션 조작, 허위 정보 제출 시 영구 제외</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">에어드랍 관련 궁금한 점을 확인하세요</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeTab === 'faq-1' ? 'active' : ''}`} data-testid="faq-total-amount">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>에어드랍 총 물량과 배분 구조는 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>총 3억 TBURN이 에어드랍으로 배분됩니다 (전체 공급량 100억 TBURN의 3%). 배분 구조: (1) 제네시스 에어드랍 1.5억 TBURN - 테스트넷 참여자, NFT 홀더, 얼리버드 대상 (2) 커뮤니티 에어드랍 1억 TBURN - 소셜 미션, 레퍼럴 등 포인트 기반 비례 배분 (3) 로열티 에어드랍 0.5억 TBURN - 장기 홀더 및 스테이킹 참여자 대상 (TGE 후 90일 시작). 현재 28,750명 이상이 참여 중이며, 총 4,500만 TBURN이 배분 완료되었습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-2' ? 'active' : ''}`} data-testid="faq-tge-amount">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>TGE 시점에 얼마나 받을 수 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TGE(토큰 생성 이벤트) 시점에 전체 배분량의 15%가 즉시 클레임 가능합니다. 나머지 85%는 9개월에 걸쳐 매월 약 9.4%씩 선형 베스팅됩니다. 예를 들어 총 30,000 TBURN을 받는다면, TGE에 4,500 TBURN을 즉시 받고 이후 매월 약 2,830 TBURN씩 9개월간 받게 됩니다. TGE는 2026년 2월로 예정되어 있으며, 정확한 날짜는 공식 채널을 통해 발표됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-3' ? 'active' : ''}`} data-testid="faq-points-conversion">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>포인트는 어떻게 토큰으로 환산되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>포인트는 전체 참여자의 포인트 합계 대비 개인 포인트 비율로 토큰이 배분됩니다. 계산 공식: 내 배분량 = (내 포인트 / 전체 포인트 풀) × 총 에어드랍 물량. 예시: 내 포인트 5,000P, 전체 풀 5천만P, 배분 물량 3억 TBURN인 경우 → (5,000 / 50,000,000) × 300,000,000 = 30,000 TBURN. 현재 런칭 예정가 $0.50 기준 약 $15,000 가치입니다. 최종 스냅샷 시점의 전체 포인트 합계에 따라 실제 배분량이 달라질 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-4' ? 'active' : ''}`} data-testid="faq-wallet">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>어떤 지갑을 사용해야 하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TBURN Chain은 EVM 호환 블록체인으로 다양한 지갑을 지원합니다. 지원 지갑: MetaMask(권장), Trust Wallet, Coinbase Wallet, Rainbow Wallet, Rabby Wallet, Ledger/Trezor 하드웨어 지갑. WalletConnect를 통해 모바일 지갑도 연결 가능합니다. 지갑 연결 후 TBURN Chain 메인넷(Chain ID: 5800)을 추가해야 합니다. 네트워크 설정은 자동으로 제안되며, 수동 설정 정보는 공식 문서에서 확인할 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-5' ? 'active' : ''}`} data-testid="faq-claim">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>에어드랍 수령(클레임) 방법은?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TGE 이후 이 페이지에서 "클레임" 버튼이 활성화됩니다. 클레임 절차: (1) 지갑 연결 (2) 클레임 버튼 클릭 (3) 트랜잭션 서명 및 가스비 지불 (TBURN으로 지불 가능) (4) 토큰이 지갑으로 자동 전송. 베스팅된 토큰은 매월 언락 시점에 클레임 페이지에서 확인 및 수령 가능합니다. 미클레임 토큰은 별도의 만료 기간 없이 보관되므로 편한 시점에 클레임하면 됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-6' ? 'active' : ''}`} data-testid="faq-tasks">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>미션을 완료하면 포인트가 얼마나 적립되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>미션별 포인트: 필수 미션 - 지갑 연결(500P), 이메일 인증(300P), 텔레그램 가입(400P). 소셜 미션 - X(트위터) 팔로우(200P), 런칭 트윗 리트윗(300P), 디스코드 가입(400P). 보너스 미션 - 제네시스 NFT 보유(2,000P), 친구 초대(친구당 500P, 최대 10명 = 5,000P), 테스트넷 참여자(3,000P 자동 적용). 모든 미션 완료 시 최대 12,100P 획득 가능. 추가 이벤트 및 특별 미션은 공식 채널에서 공지됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-7' ? 'active' : ''}`} data-testid="faq-nft-bonus">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>NFT 홀더 보너스는 어떻게 적용되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TBURN 제네시스 NFT 보유자는 에어드랍 배분량에 2배 승수(multiplier)가 적용됩니다. NFT 보유 확인은 지갑 연결 시 자동으로 이루어지며, 별도의 스테이킹이나 락업 없이 보유만으로도 보너스가 적용됩니다. 제네시스 NFT는 공식 마켓플레이스에서 구매 가능하며, 스냅샷 시점에 지갑에 NFT가 있어야 보너스가 인정됩니다. 여러 개의 NFT를 보유해도 2배 승수는 동일하게 적용됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-8' ? 'active' : ''}`} data-testid="faq-restrictions">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>참여 제한 지역이나 조건이 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>규제 준수를 위해 일부 지역에서는 에어드랍 참여가 제한됩니다. 제한 지역: 미국, 중국, 북한, 이란, 시리아, 쿠바 등 OFAC 제재 국가. 제한 조건: VPN 사용 금지(감지 시 자격 박탈), 1인 1지갑 원칙(다중 계정 생성 시 모든 계정 자격 박탈), 봇/자동화 도구 사용 금지. 자격이 박탈된 경우 적립된 포인트는 소멸되며, 해당 물량은 정상 참여자에게 재배분됩니다. 의심스러운 활동이 감지되면 추가 KYC를 요청할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>차세대 레이어1 블록체인으로 빠르고 안전한 탈중앙화 금융의 미래를 만들어갑니다.</p>
            <div className="social-links">
              <a 
                href="https://twitter.com/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                onClick={() => toast({ title: "Twitter", description: "TBURN Chain Twitter 페이지로 이동합니다." })}
                data-testid="footer-link-twitter"
              ><span>𝕏</span></a>
              <a 
                href="https://t.me/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Telegram"
                onClick={() => toast({ title: "Telegram", description: "TBURN Chain Telegram 채널로 이동합니다." })}
                data-testid="footer-link-telegram"
              ><span>✈</span></a>
              <a 
                href="https://discord.gg/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Discord"
                onClick={() => toast({ title: "Discord", description: "TBURN Chain Discord 서버로 이동합니다." })}
                data-testid="footer-link-discord"
              ><span>💬</span></a>
              <a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                onClick={() => toast({ title: "GitHub", description: "TBURN Chain GitHub으로 이동합니다." })}
                data-testid="footer-link-github"
              ><span>⌘</span></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>제품</h4>
            <ul>
              <li><Link href="/scan">TBURNScan</Link></li>
              <li><Link href="/app">dApp</Link></li>
              <li><Link href="/staking">스테이킹</Link></li>
              <li><Link href="/bridge">브릿지</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>개발자</h4>
            <ul>
              <li><Link href="/developers/docs">문서</Link></li>
              <li><Link href="/developers/api">API</Link></li>
              <li><Link href="/developers/sdk">SDK</Link></li>
              <li><a href="https://github.com/tburn-chain" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>리소스</h4>
            <ul>
              <li><Link href="/learn/whitepaper">백서</Link></li>
              <li><Link href="/learn/tokenomics">토크노믹스</Link></li>
              <li><Link href="/learn/roadmap">로드맵</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link 
              href="/legal/privacy-policy" 
              style={{ color: 'var(--gray)', textDecoration: 'none' }}
              data-testid="footer-link-privacy"
            >개인정보처리방침</Link>
            <Link 
              href="/legal/terms-of-service" 
              style={{ color: 'var(--gray)', textDecoration: 'none' }}
              data-testid="footer-link-terms"
            >이용약관</Link>
            <Link 
              href="/qna" 
              style={{ color: 'var(--gray)', textDecoration: 'none' }}
              data-testid="footer-link-contact"
            >문의하기</Link>
          </div>
        </div>
      </footer>

      {/* Email Verification Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400">이메일 인증</DialogTitle>
            <DialogDescription className="text-slate-400">
              이메일을 등록하고 +300P를 받으세요!
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">이메일 주소 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-email-verify"
              />
            </div>
            <p className="text-sm text-slate-400">
              등록된 이메일로 에어드랍 관련 주요 공지사항을 받아보실 수 있습니다.
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={emailMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="button-submit-email"
              >
                {emailMutation.isPending ? "처리 중..." : "인증하기 (+300P)"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400">친구 초대 (레퍼럴)</DialogTitle>
            <DialogDescription className="text-slate-400">
              친구를 초대하고 포인트를 받으세요! (친구당 500P, 최대 10명)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <Label className="text-slate-300 text-sm">내 레퍼럴 링크</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  readOnly
                  value={`https://tburn.io/airdrop?ref=${address ? address.slice(-8) : "TBURN2026"}`}
                  className="bg-slate-900 border-slate-600 text-white"
                  data-testid="input-referral-link"
                />
                <Button
                  type="button"
                  onClick={copyReferralLink}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4"
                  data-testid="button-copy-referral"
                >
                  복사
                </Button>
              </div>
            </div>
            {/* Social Share Buttons */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">소셜 미디어로 공유하기</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  onClick={() => {
                    const refCode = address ? address.slice(-8) : "TBURN2026";
                    const text = `TBURN Chain 에어드랍에 참여하세요! 3억 TBURN 배포 중 🚀 내 추천 링크로 가입하면 보너스 포인트!`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(`https://tburn.io/airdrop?ref=${refCode}`)}`, "_blank");
                    toast({ title: "Twitter", description: "트위터 공유 창이 열렸습니다." });
                  }}
                  className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                  data-testid="button-share-twitter"
                >
                  𝕏 트위터
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const refCode = address ? address.slice(-8) : "TBURN2026";
                    const text = `TBURN Chain 에어드랍에 참여하세요! 3억 TBURN 배포 중 🚀 https://tburn.io/airdrop?ref=${refCode}`;
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(`https://tburn.io/airdrop?ref=${refCode}`)}&text=${encodeURIComponent(text)}`, "_blank");
                    toast({ title: "Telegram", description: "텔레그램 공유 창이 열렸습니다." });
                  }}
                  className="bg-[#0088cc] hover:bg-[#0077b5] text-white"
                  data-testid="button-share-telegram"
                >
                  텔레그램
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const refCode = address ? address.slice(-8) : "TBURN2026";
                    const url = `https://tburn.io/airdrop?ref=${refCode}`;
                    window.open(`https://open.kakao.com/o/s/share?url=${encodeURIComponent(url)}`, "_blank");
                    toast({ title: "KakaoTalk", description: "카카오톡 공유 창이 열렸습니다." });
                  }}
                  className="bg-[#FEE500] hover:bg-[#fdd835] text-black"
                  data-testid="button-share-kakao"
                >
                  카카오톡
                </Button>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-white">레퍼럴 혜택</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• 친구가 지갑 연결 시: 나에게 +500P, 친구에게 +100P 보너스</li>
                <li>• 최대 10명까지 초대 가능 (최대 +5,000P)</li>
                <li>• 친구의 친구 초대 시에도 +50P 추가 적립</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">내 초대 현황</h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">초대한 친구</span>
                <span className="text-amber-400 font-semibold">{isConnected ? "0명" : "지갑 연결 필요"}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">획득 포인트</span>
                <span className="text-amber-400 font-semibold">{isConnected ? "0P" : "-"}</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setReferralDialogOpen(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
