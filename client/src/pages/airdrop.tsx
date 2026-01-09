import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title: t('tokenPrograms.airdropPage.emailDialog.title'),
        description: "+300P",
      });
      setEmailDialogOpen(false);
      setEmailInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      toast({
        title: "Invalid email",
        variant: "destructive",
      });
      return;
    }
    emailMutation.mutate(emailInput);
  };

  const handleSocialLink = (platform: string, url: string) => {
    window.open(url, "_blank");
    toast({
      title: `${platform} task in progress`,
      description: t('tokenPrograms.airdropPage.toasts.completeTasksForPoints'),
    });
  };

  const copyReferralLink = () => {
    const referralCode = address ? address.slice(-8) : "TBURN2026";
    const link = `https://tburn.io/airdrop?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: t('tokenPrograms.airdropPage.referralDialog.copied'),
      description: t('tokenPrograms.airdropPage.referralDialog.linkCopied'),
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
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#overview">{t('tokenPrograms.airdropPage.nav.overview')}</a>
            <a href="#airdrops">{t('tokenPrograms.airdropPage.nav.airdrops')}</a>
            <a href="#tasks">{t('tokenPrograms.airdropPage.nav.tasks')}</a>
            <a href="#timeline">{t('tokenPrograms.airdropPage.nav.timeline')}</a>
            <a href="#faq">{t('tokenPrograms.airdropPage.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleConnectWallet}
            >
              <i className="fas fa-wallet"></i> 
              {isConnected && address ? formatAddress(address) : t('tokenPrograms.airdropPage.header.connectWallet')}
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
            {t('tokenPrograms.airdropPage.hero.badge')}
            {stats?.networkTps && (
              <span style={{ marginLeft: '12px', color: 'var(--light-gray)' }} data-testid="text-network-tps">
                | {t('tokenPrograms.airdropPage.hero.tps')}: {stats.networkTps.toLocaleString()}
              </span>
            )}
          </div>
          <h1>
            <span className="gold">{t('tokenPrograms.airdropPage.hero.title')}</span><br />
            {t('tokenPrograms.airdropPage.hero.subtitle')}
          </h1>
          <p className="hero-subtitle">
            {t('tokenPrograms.airdropPage.hero.description')}
          </p>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-airdrop">
              <div className="stat-value">
                {isLoadingStats ? '...' : formatNumber(stats?.totalAllocation || '300000000')}
              </div>
              <div className="stat-label">{t('tokenPrograms.airdropPage.hero.totalAirdrop')}</div>
            </div>
            <div className="stat-card" data-testid="stat-distributed">
              <div className="stat-value">
                {isLoadingStats ? '...' : formatNumber(stats?.totalDistributed || '45000000')}
              </div>
              <div className="stat-label">{t('tokenPrograms.airdropPage.hero.distributed')}</div>
            </div>
            <div className="stat-card" data-testid="stat-eligible">
              <div className="stat-value">
                {isLoadingStats ? '...' : formatLargeNumber(stats?.totalEligible || 28750)}
              </div>
              <div className="stat-label">{t('tokenPrograms.airdropPage.hero.participants')}</div>
            </div>
            <div className="stat-card" data-testid="stat-claim-rate">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${parseFloat(stats?.claimRate || '15').toFixed(1)}%`}
              </div>
              <div className="stat-label">{t('tokenPrograms.airdropPage.hero.claimRate')}</div>
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
                  {t('tokenPrograms.airdropPage.eligibility.title')}
                </h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--light-gray)' }}>
                  {formatAddress(address)}
                </span>
              </div>
              {isLoadingEligibility ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--light-gray)' }}>
                  {t('tokenPrograms.airdropPage.eligibility.checking')}
                </div>
              ) : eligibility ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div data-testid="eligibility-allocated">
                    <div style={{ fontSize: '0.875rem', color: 'var(--light-gray)', marginBottom: '0.25rem' }}>{t('tokenPrograms.airdropPage.eligibility.allocated')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>
                      {formatNumber(eligibility.allocatedAmount)}
                    </div>
                  </div>
                  <div data-testid="eligibility-claimed">
                    <div style={{ fontSize: '0.875rem', color: 'var(--light-gray)', marginBottom: '0.25rem' }}>{t('tokenPrograms.airdropPage.eligibility.claimed')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                      {formatNumber(eligibility.claimedAmount)}
                    </div>
                  </div>
                  <div data-testid="eligibility-pending">
                    <div style={{ fontSize: '0.875rem', color: 'var(--light-gray)', marginBottom: '0.25rem' }}>{t('tokenPrograms.airdropPage.eligibility.pending')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)' }}>
                      {formatNumber(eligibility.pendingAmount)}
                    </div>
                  </div>
                  <div data-testid="eligibility-tier">
                    <div style={{ fontSize: '0.875rem', color: 'var(--light-gray)', marginBottom: '0.25rem' }}>{t('tokenPrograms.airdropPage.eligibility.tier')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>
                      {eligibility.tier || 'Standard'} ({eligibility.multiplier || 1}x)
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--light-gray)' }} data-testid="eligibility-not-found">
                  {t('tokenPrograms.airdropPage.eligibility.noAllocation')}
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
                    title: t('tokenPrograms.airdropPage.toasts.participating'),
                    description: t('tokenPrograms.airdropPage.toasts.completeTasksForPoints'),
                  });
                  document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {isConnected ? t('tokenPrograms.airdropPage.buttons.doTasks') : t('tokenPrograms.airdropPage.buttons.participateNow')}
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-details"
              onClick={() => {
                document.getElementById('airdrops')?.scrollIntoView({ behavior: 'smooth' });
                toast({
                  title: t('tokenPrograms.airdropPage.toasts.airdropTypes'),
                  description: t('tokenPrograms.airdropPage.toasts.checkAirdropTypes'),
                });
              }}
            >
              {t('tokenPrograms.airdropPage.buttons.viewDetails')}
            </button>
          </div>
        </div>
      </section>

      {/* Airdrop Types Section */}
      <section className="section" id="airdrops">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.airdropPage.types.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.airdropPage.types.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.airdropPage.types.subtitle')}</p>
        </div>

        <div className="airdrop-grid">
          {/* Genesis Airdrop */}
          <div className="airdrop-card featured" data-testid="card-genesis-airdrop">
            <div className="airdrop-icon">🌟</div>
            <h3 className="airdrop-title">{t('tokenPrograms.airdropPage.types.genesis.title')}</h3>
            <div className="airdrop-amount">{t('tokenPrograms.airdropPage.types.genesis.amount')}</div>
            <p className="airdrop-desc">{t('tokenPrograms.airdropPage.types.genesis.desc')}</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.genesis.feature1')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.genesis.feature2')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.genesis.feature3')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.genesis.feature4')}</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '42%' }}></div>
            </div>
            <div className="progress-text">
              <span>{t('tokenPrograms.airdropPage.types.progress')}</span>
              <span>42%</span>
            </div>
          </div>

          {/* Community Airdrop */}
          <div className="airdrop-card" data-testid="card-community-airdrop">
            <div className="airdrop-icon">👥</div>
            <h3 className="airdrop-title">{t('tokenPrograms.airdropPage.types.community.title')}</h3>
            <div className="airdrop-amount">{t('tokenPrograms.airdropPage.types.community.amount')}</div>
            <p className="airdrop-desc">{t('tokenPrograms.airdropPage.types.community.desc')}</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.community.feature1')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.community.feature2')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.community.feature3')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.community.feature4')}</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '28%' }}></div>
            </div>
            <div className="progress-text">
              <span>{t('tokenPrograms.airdropPage.types.progress')}</span>
              <span>28%</span>
            </div>
          </div>

          {/* Loyalty Airdrop */}
          <div className="airdrop-card" data-testid="card-loyalty-airdrop">
            <div className="airdrop-icon">💎</div>
            <h3 className="airdrop-title">{t('tokenPrograms.airdropPage.types.loyalty.title')}</h3>
            <div className="airdrop-amount">{t('tokenPrograms.airdropPage.types.loyalty.amount')}</div>
            <p className="airdrop-desc">{t('tokenPrograms.airdropPage.types.loyalty.desc')}</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.loyalty.feature1')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.loyalty.feature2')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.loyalty.feature3')}</li>
              <li><span className="check-icon">✓</span> {t('tokenPrograms.airdropPage.types.loyalty.feature4')}</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <div className="progress-text">
              <span>{t('tokenPrograms.airdropPage.types.progress')}</span>
              <span>{t('tokenPrograms.airdropPage.types.waiting')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="section" id="tasks" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.airdropPage.tasks.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.airdropPage.tasks.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.airdropPage.tasks.subtitle')}</p>
        </div>

        <div className="tasks-container">
          <div className="tasks-header">
            <div className="tasks-info">
              <h3>{t('tokenPrograms.airdropPage.tasks.myStatus')}</h3>
              <p>
                {isConnected 
                  ? `${formatAddress(address || '')} ${t('tokenPrograms.airdropPage.tasks.walletConnected')}` 
                  : t('tokenPrograms.airdropPage.tasks.connectToTrack')}
              </p>
            </div>
            <div className="points-display">
              <div className="points-value" data-testid="text-total-points">
                {isConnected ? '500 P' : '0 P'}
              </div>
              <div className="points-label">{t('tokenPrograms.airdropPage.tasks.earnedPoints')}</div>
            </div>
          </div>

          {/* Required Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>⭐</span> {t('tokenPrograms.airdropPage.tasks.required.title')}
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-wallet-connect">
                <div className="task-left">
                  <div className="task-icon">👛</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.required.wallet.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.required.wallet.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.required.wallet.points')}</span>
                  <button 
                    className="task-btn" 
                    onClick={handleConnectWallet}
                    style={isConnected ? { background: 'var(--success)', color: 'white' } : undefined}
                    data-testid="button-task-wallet-connect"
                  >
                    {isConnected ? t('tokenPrograms.airdropPage.tasks.required.wallet.buttonComplete') : t('tokenPrograms.airdropPage.tasks.required.wallet.buttonConnect')}
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-email-verify">
                <div className="task-left">
                  <div className="task-icon">✅</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.required.email.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.required.email.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.required.email.points')}</span>
                  <button 
                    className="task-btn" 
                    onClick={() => setEmailDialogOpen(true)}
                    data-testid="button-task-email-verify"
                  >
                    {t('tokenPrograms.airdropPage.tasks.required.email.button')}
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-telegram-join">
                <div className="task-left">
                  <div className="task-icon">📱</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.required.telegram.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.required.telegram.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.required.telegram.points')}</span>
                  <button 
                    className="task-btn"
                    onClick={() => handleSocialLink("Telegram", "https://t.me/tburnchain")}
                    data-testid="button-task-telegram"
                  >
                    {t('tokenPrograms.airdropPage.tasks.required.telegram.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>🔗</span> {t('tokenPrograms.airdropPage.tasks.social.title')}
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-twitter-follow">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#1DA1F2' }}>𝕏</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.social.twitter.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.social.twitter.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.social.twitter.points')}</span>
                  <button 
                    className="task-btn"
                    onClick={() => handleSocialLink("X (Twitter)", "https://x.com/TBURNChain")}
                    data-testid="button-task-twitter"
                  >
                    {t('tokenPrograms.airdropPage.tasks.social.twitter.button')}
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-retweet">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#1DA1F2' }}>𝕏</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.social.retweet.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.social.retweet.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.social.retweet.points')}</span>
                  <button 
                    className="task-btn"
                    onClick={() => handleSocialLink("Retweet", "https://x.com/TBURNChain/status/mainnet-launch")}
                    data-testid="button-task-retweet"
                  >
                    {t('tokenPrograms.airdropPage.tasks.social.retweet.button')}
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-discord-join">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#5865F2' }}>💬</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.social.discord.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.social.discord.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.social.discord.points')}</span>
                  <button 
                    className="task-btn"
                    onClick={() => handleSocialLink("Discord", "https://discord.gg/tburnchain")}
                    data-testid="button-task-discord"
                  >
                    {t('tokenPrograms.airdropPage.tasks.social.discord.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bonus Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>🎁</span> {t('tokenPrograms.airdropPage.tasks.bonus.title')}
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-nft-holder">
                <div className="task-left">
                  <div className="task-icon">🎨</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.bonus.nft.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.bonus.nft.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.bonus.nft.points')}</span>
                  <button 
                    className="task-btn"
                    onClick={() => {
                      if (!isConnected) {
                        toast({ title: t('tokenPrograms.airdropPage.toasts.connectWalletFirst'), variant: "destructive" });
                        return;
                      }
                      toast({ title: t('tokenPrograms.airdropPage.toasts.checkingNft'), description: t('tokenPrograms.airdropPage.toasts.pleaseWait') });
                    }}
                    data-testid="button-task-nft"
                  >
                    {t('tokenPrograms.airdropPage.tasks.bonus.nft.button')}
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-referral">
                <div className="task-left">
                  <div className="task-icon">👥</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.bonus.referral.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.bonus.referral.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.bonus.referral.points')}</span>
                  <button 
                    className="task-btn"
                    onClick={() => setReferralDialogOpen(true)}
                    data-testid="button-task-referral"
                  >
                    {t('tokenPrograms.airdropPage.tasks.bonus.referral.button')}
                  </button>
                </div>
              </div>

              <div className="task-item" data-testid="task-testnet">
                <div className="task-left">
                  <div className="task-icon">📊</div>
                  <div className="task-info">
                    <h4>{t('tokenPrograms.airdropPage.tasks.bonus.testnet.title')}</h4>
                    <p>{t('tokenPrograms.airdropPage.tasks.bonus.testnet.desc')}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">{t('tokenPrograms.airdropPage.tasks.bonus.testnet.points')}</span>
                  <button 
                    className="task-btn"
                    onClick={() => {
                      if (!isConnected) {
                        toast({ title: t('tokenPrograms.airdropPage.toasts.connectWalletFirst'), variant: "destructive" });
                        return;
                      }
                      toast({ title: t('tokenPrograms.airdropPage.toasts.checkingTestnet'), description: t('tokenPrograms.airdropPage.toasts.pleaseWait') });
                    }}
                    data-testid="button-task-testnet"
                  >
                    {t('tokenPrograms.airdropPage.tasks.bonus.testnet.button')}
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
          <span className="section-badge">{t('tokenPrograms.airdropPage.timeline.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.airdropPage.timeline.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.airdropPage.timeline.subtitle')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot active"><span className="dot-icon">✓</span></div>
              <div className="timeline-content">
                <div className="timeline-date">{t('tokenPrograms.airdropPage.timeline.nov2025')}</div>
                <div className="timeline-title">{t('tokenPrograms.airdropPage.timeline.registrationStart')}</div>
                <div className="timeline-desc">{t('tokenPrograms.airdropPage.timeline.registrationDesc')}</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot active"><span className="dot-icon">✓</span></div>
              <div className="timeline-content">
                <div className="timeline-date">{t('tokenPrograms.airdropPage.timeline.jan2026')}</div>
                <div className="timeline-title">{t('tokenPrograms.airdropPage.timeline.snapshotProgress')}</div>
                <div className="timeline-desc">{t('tokenPrograms.airdropPage.timeline.snapshotDesc')}</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot"><span className="dot-icon">⏳</span></div>
              <div className="timeline-content">
                <div className="timeline-date">{t('tokenPrograms.airdropPage.timeline.feb2026')}</div>
                <div className="timeline-title">{t('tokenPrograms.airdropPage.timeline.tge')}</div>
                <div className="timeline-desc">{t('tokenPrograms.airdropPage.timeline.tgeDesc')}</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot"><span className="dot-icon">⏳</span></div>
              <div className="timeline-content">
                <div className="timeline-date">{t('tokenPrograms.airdropPage.timeline.mar2026')}</div>
                <div className="timeline-title">{t('tokenPrograms.airdropPage.timeline.monthlyVesting')}</div>
                <div className="timeline-desc">{t('tokenPrograms.airdropPage.timeline.vestingDesc')}</div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ background: 'var(--dark-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--gold)', marginRight: '10px' }}>🧮</span>
                {t('tokenPrograms.airdropPage.timeline.calculator.title')}
              </h3>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>{t('tokenPrograms.airdropPage.timeline.calculator.myPoints')}: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>5,000 P</span></p>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>{t('tokenPrograms.airdropPage.timeline.calculator.totalPool')}: <span style={{ fontWeight: 600 }}>50,000,000 P</span></p>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>{t('tokenPrograms.airdropPage.timeline.calculator.distribution')}: <span style={{ fontWeight: 600 }}>300M TBURN</span></p>
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                <p style={{ fontSize: '1.125rem' }}>{t('tokenPrograms.airdropPage.timeline.calculator.estimated')}: <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '1.5rem' }}>30,000 TBURN</span></p>
                <p style={{ color: 'var(--light-gray)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{t('tokenPrograms.airdropPage.timeline.calculator.estimatedValue')}: <span style={{ color: 'var(--success)', fontWeight: 600 }}>$15,000</span></p>
              </div>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                {t('tokenPrograms.airdropPage.timeline.calculator.disclaimer')}
              </p>
            </div>

            <div style={{ background: 'var(--dark-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--gold)', marginRight: '10px' }}>🔓</span>
                {t('tokenPrograms.airdropPage.timeline.vesting.title')}
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--light-gray)' }}>{t('tokenPrograms.airdropPage.timeline.vesting.tgeDay')}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>15%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--light-gray)' }}>{t('tokenPrograms.airdropPage.timeline.vesting.monthly')}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{t('tokenPrograms.airdropPage.timeline.vesting.monthlyPercent')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', color: 'var(--gold)', fontWeight: 600 }}>{t('tokenPrograms.airdropPage.timeline.vesting.complete')}</td>
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
          <span className="section-badge">{t('tokenPrograms.airdropPage.eligibilitySection.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.airdropPage.eligibilitySection.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.airdropPage.eligibilitySection.subtitle')}</p>
        </div>

        <div className="eligibility-grid">
          <div className="eligibility-card" data-testid="card-eligible">
            <h3><span style={{ color: 'var(--success)' }}>✓</span> {t('tokenPrograms.airdropPage.eligibilitySection.eligible.title')}</h3>
            <ul className="eligibility-list">
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>{t('tokenPrograms.airdropPage.eligibilitySection.eligible.wallet.title')}</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{t('tokenPrograms.airdropPage.eligibilitySection.eligible.wallet.desc')}</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>{t('tokenPrograms.airdropPage.eligibilitySection.eligible.tasks.title')}</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{t('tokenPrograms.airdropPage.eligibilitySection.eligible.tasks.desc')}</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>{t('tokenPrograms.airdropPage.eligibilitySection.eligible.minPoints.title')}</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{t('tokenPrograms.airdropPage.eligibilitySection.eligible.minPoints.desc')}</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>{t('tokenPrograms.airdropPage.eligibilitySection.eligible.snapshot.title')}</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{t('tokenPrograms.airdropPage.eligibilitySection.eligible.snapshot.desc')}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="eligibility-card" data-testid="card-excluded">
            <h3><span style={{ color: 'var(--warning)' }}>⚠</span> {t('tokenPrograms.airdropPage.eligibilitySection.excluded.title')}</h3>
            <ul className="eligibility-list">
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>{t('tokenPrograms.airdropPage.eligibilitySection.excluded.restricted.title')}</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{t('tokenPrograms.airdropPage.eligibilitySection.excluded.restricted.desc')}</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>{t('tokenPrograms.airdropPage.eligibilitySection.excluded.sybil.title')}</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{t('tokenPrograms.airdropPage.eligibilitySection.excluded.sybil.desc')}</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>{t('tokenPrograms.airdropPage.eligibilitySection.excluded.bot.title')}</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{t('tokenPrograms.airdropPage.eligibilitySection.excluded.bot.desc')}</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>{t('tokenPrograms.airdropPage.eligibilitySection.excluded.fraud.title')}</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{t('tokenPrograms.airdropPage.eligibilitySection.excluded.fraud.desc')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">{t('tokenPrograms.airdropPage.faq.badge')}</span>
          <h2 className="section-title">{t('tokenPrograms.airdropPage.faq.title')}</h2>
          <p className="section-subtitle">{t('tokenPrograms.airdropPage.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeTab === 'faq-1' ? 'active' : ''}`} data-testid="faq-total-amount">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('tokenPrograms.airdropPage.faq.q1.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.airdropPage.faq.q1.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-2' ? 'active' : ''}`} data-testid="faq-tge-amount">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('tokenPrograms.airdropPage.faq.q2.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.airdropPage.faq.q2.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-3' ? 'active' : ''}`} data-testid="faq-points-conversion">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('tokenPrograms.airdropPage.faq.q3.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.airdropPage.faq.q3.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-4' ? 'active' : ''}`} data-testid="faq-wallet">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('tokenPrograms.airdropPage.faq.q4.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.airdropPage.faq.q4.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-5' ? 'active' : ''}`} data-testid="faq-claim">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('tokenPrograms.airdropPage.faq.q5.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.airdropPage.faq.q5.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-6' ? 'active' : ''}`} data-testid="faq-tasks">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('tokenPrograms.airdropPage.faq.q6.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.airdropPage.faq.q6.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-7' ? 'active' : ''}`} data-testid="faq-nft-bonus">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('tokenPrograms.airdropPage.faq.q7.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.airdropPage.faq.q7.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-8' ? 'active' : ''}`} data-testid="faq-restrictions">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('tokenPrograms.airdropPage.faq.q8.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('tokenPrograms.airdropPage.faq.q8.answer')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('tokenPrograms.airdropPage.footer.brand')}</p>
            <div className="social-links">
              <a 
                href="https://twitter.com/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                data-testid="footer-link-twitter"
              ><span>𝕏</span></a>
              <a 
                href="https://t.me/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Telegram"
                data-testid="footer-link-telegram"
              ><span>✈</span></a>
              <a 
                href="https://discord.gg/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Discord"
                data-testid="footer-link-discord"
              ><span>💬</span></a>
              <a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                data-testid="footer-link-github"
              ><span>⌘</span></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>{t('tokenPrograms.airdropPage.footer.products')}</h4>
            <ul>
              <li><Link href="/scan">{t('tokenPrograms.airdropPage.footer.scan')}</Link></li>
              <li><Link href="/app">{t('tokenPrograms.airdropPage.footer.dapp')}</Link></li>
              <li><Link href="/staking">{t('tokenPrograms.airdropPage.footer.staking')}</Link></li>
              <li><Link href="/bridge">{t('tokenPrograms.airdropPage.footer.bridge')}</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>{t('tokenPrograms.airdropPage.footer.developers')}</h4>
            <ul>
              <li><Link href="/developers/docs">{t('tokenPrograms.airdropPage.footer.docs')}</Link></li>
              <li><Link href="/developers/api">{t('tokenPrograms.airdropPage.footer.api')}</Link></li>
              <li><Link href="/developers/sdk">{t('tokenPrograms.airdropPage.footer.sdk')}</Link></li>
              <li><a href="https://github.com/tburn-chain" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>{t('tokenPrograms.airdropPage.footer.resources')}</h4>
            <ul>
              <li><Link href="/learn/whitepaper">{t('tokenPrograms.airdropPage.footer.whitepaper')}</Link></li>
              <li><Link href="/learn/tokenomics">{t('tokenPrograms.airdropPage.footer.tokenomics')}</Link></li>
              <li><Link href="/learn/roadmap">{t('tokenPrograms.airdropPage.footer.roadmap')}</Link></li>
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
            >{t('tokenPrograms.airdropPage.footer.privacyPolicy')}</Link>
            <Link 
              href="/legal/terms-of-service" 
              style={{ color: 'var(--gray)', textDecoration: 'none' }}
              data-testid="footer-link-terms"
            >{t('tokenPrograms.airdropPage.footer.termsOfService')}</Link>
            <Link 
              href="/qna" 
              style={{ color: 'var(--gray)', textDecoration: 'none' }}
              data-testid="footer-link-contact"
            >{t('tokenPrograms.airdropPage.footer.contact')}</Link>
          </div>
        </div>
      </footer>

      {/* Email Verification Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400">{t('tokenPrograms.airdropPage.emailDialog.title')}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {t('tokenPrograms.airdropPage.emailDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">{t('tokenPrograms.airdropPage.emailDialog.label')}</Label>
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
              {t('tokenPrograms.airdropPage.emailDialog.info')}
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {t('tokenPrograms.airdropPage.emailDialog.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={emailMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="button-submit-email"
              >
                {emailMutation.isPending ? t('tokenPrograms.airdropPage.emailDialog.processing') : t('tokenPrograms.airdropPage.emailDialog.submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400">{t('tokenPrograms.airdropPage.referralDialog.title')}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {t('tokenPrograms.airdropPage.referralDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <Label className="text-slate-300 text-sm">{t('tokenPrograms.airdropPage.referralDialog.linkLabel')}</Label>
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
                  {t('tokenPrograms.airdropPage.referralDialog.copy')}
                </Button>
              </div>
            </div>
            {/* Social Share Buttons */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">{t('tokenPrograms.airdropPage.referralDialog.shareTitle')}</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  onClick={() => {
                    const refCode = address ? address.slice(-8) : "TBURN2026";
                    const text = "Join the TBURN Chain airdrop! 300M TBURN being distributed. Get bonus points with my referral link!";
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(`https://tburn.io/airdrop?ref=${refCode}`)}`, "_blank");
                  }}
                  className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                  data-testid="button-share-twitter"
                >
                  𝕏 {t('tokenPrograms.airdropPage.referralDialog.shareTwitter')}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const refCode = address ? address.slice(-8) : "TBURN2026";
                    const text = "Join the TBURN Chain airdrop! 300M TBURN being distributed.";
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(`https://tburn.io/airdrop?ref=${refCode}`)}&text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="bg-[#0088cc] hover:bg-[#0077b5] text-white"
                  data-testid="button-share-telegram"
                >
                  {t('tokenPrograms.airdropPage.referralDialog.shareTelegram')}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const refCode = address ? address.slice(-8) : "TBURN2026";
                    const url = `https://tburn.io/airdrop?ref=${refCode}`;
                    window.open(`https://open.kakao.com/o/s/share?url=${encodeURIComponent(url)}`, "_blank");
                  }}
                  className="bg-[#FEE500] hover:bg-[#fdd835] text-black"
                  data-testid="button-share-kakao"
                >
                  {t('tokenPrograms.airdropPage.referralDialog.shareKakao')}
                </Button>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-white">{t('tokenPrograms.airdropPage.referralDialog.benefits')}</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {t('tokenPrograms.airdropPage.referralDialog.benefit1')}</li>
                <li>• {t('tokenPrograms.airdropPage.referralDialog.benefit2')}</li>
                <li>• {t('tokenPrograms.airdropPage.referralDialog.benefit3')}</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">{t('tokenPrograms.airdropPage.referralDialog.statusTitle')}</h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t('tokenPrograms.airdropPage.referralDialog.invitedFriends')}</span>
                <span className="text-amber-400 font-semibold">{isConnected ? "0" : t('tokenPrograms.airdropPage.referralDialog.walletRequired')}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">{t('tokenPrograms.airdropPage.referralDialog.earnedPoints')}</span>
                <span className="text-amber-400 font-semibold">{isConnected ? "0P" : "-"}</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setReferralDialogOpen(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              {t('tokenPrograms.airdropPage.referralDialog.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
