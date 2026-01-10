import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TBurnLogo } from "@/components/tburn-logo";

interface LaunchpadPlatform {
  name: string;
  status: string;
  totalProjects: number;
  totalRaised: string;
  avgRoi: string;
  participants: number;
  upcomingIdo: number;
}

interface LaunchpadStatsData {
  platforms: LaunchpadPlatform[];
  totalLaunchpadRaised: string;
  averageRoi: string;
}

interface LaunchpadStatsResponse {
  success: boolean;
  data: LaunchpadStatsData;
}

export default function CoinListPage() {
  const { t } = useTranslation();
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPayment, setSelectedPayment] = useState("usd");
  const [allocationAmount, setAllocationAmount] = useState(1000);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<"pending" | "success">("pending");
  const [countdown, setCountdown] = useState({ days: 14, hours: 8, minutes: 32, seconds: 45 });
  const [expandedFaq, setExpandedFaq] = useState(0);

  const { data: response, isLoading: isLoadingStats } = useQuery<LaunchpadStatsResponse>({
    queryKey: ['/api/token-programs/launchpad/stats'],
  });
  const launchpadStats = response?.data;

  const coinlistPlatform = launchpadStats?.platforms?.find(p => p.name === "CoinList");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
      toast({
        title: t('coinlist.toast.walletDisconnected'),
        description: t('coinlist.toast.walletDisconnectedDesc'),
      });
    } else {
      connect("metamask");
      toast({
        title: t('coinlist.toast.walletConnecting'),
        description: t('coinlist.toast.walletConnectingDesc'),
      });
    }
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({
      title: `${t('coinlist.toast.socialOpen')} ${platform}`,
      description: t('coinlist.toast.socialOpenDesc'),
    });
  };

  const handleNavTab = (tabName: string) => {
    toast({
      title: `${tabName} ${t('coinlist.toast.tabComingSoon')}`,
      description: `${tabName} ${t('coinlist.toast.tabComingSoonDesc')}`,
    });
  };

  const handleDocumentDownload = (docName: string) => {
    toast({
      title: t('coinlist.toast.documentDownload'),
      description: `${docName} ${t('coinlist.toast.documentDownloadDesc')}`,
    });
  };

  const tokenPrice = 0.02;
  const bonusPercent = allocationAmount >= 10000 ? 3 : allocationAmount >= 1000 ? 1 : 0;
  const baseTokens = allocationAmount / tokenPrice;
  const bonusTokens = baseTokens * (bonusPercent / 100);
  const totalTokens = baseTokens + bonusTokens;
  const tgeTokens = totalTokens * 0.15;

  const handlePurchase = () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: t('coinlist.toast.walletRequired'),
        description: t('coinlist.toast.walletRequiredDesc'),
      });
      return;
    }
    if (allocationAmount < 100) {
      toast({
        variant: "destructive",
        title: t('coinlist.toast.minAmount'),
        description: t('coinlist.toast.minAmountDesc'),
      });
      return;
    }
    if (allocationAmount > 50000) {
      toast({
        variant: "destructive",
        title: t('coinlist.toast.maxAmount'),
        description: t('coinlist.toast.maxAmountDesc'),
      });
      return;
    }
    setShowModal(true);
    setModalStatus("pending");
    setTimeout(() => {
      setModalStatus("success");
      toast({
        title: t('coinlist.toast.participationComplete'),
        description: `${totalTokens.toLocaleString()} TBURN ${t('coinlist.toast.participationCompleteDesc')}`,
      });
    }, 2500);
  };

  const paymentMethods = [
    { id: "usd", icon: "💳", name: "USD", typeKey: "coinlist.saleCard.payment.creditCard" },
    { id: "usdt", icon: "💵", name: "USDT", typeKey: "coinlist.saleCard.payment.stablecoin" },
    { id: "usdc", icon: "💲", name: "USDC", typeKey: "coinlist.saleCard.payment.stablecoin" },
    { id: "btc", icon: "₿", name: "BTC", typeKey: "coinlist.saleCard.payment.bitcoin" },
  ];

  const features = [
    { icon: "⚡", titleKey: "coinlist.features.ultraFast", descKey: "coinlist.features.ultraFastDesc" },
    { icon: "🧠", titleKey: "coinlist.features.aiIntegration", descKey: "coinlist.features.aiIntegrationDesc" },
    { icon: "🛡️", titleKey: "coinlist.features.strongSecurity", descKey: "coinlist.features.strongSecurityDesc" },
    { icon: "🌱", titleKey: "coinlist.features.ecoFriendly", descKey: "coinlist.features.ecoFriendlyDesc" },
  ];

  const tokenomicsData = [
    { icon: "📊", labelKey: "coinlist.tokenomics.totalSupply", value: "10B TBURN" },
    { icon: "💰", labelKey: "coinlist.tokenomics.initialMarketCap", value: "$80M" },
    { icon: "🎯", labelKey: "coinlist.tokenomics.fdv", value: "$2B" },
    { icon: "🔥", labelKey: "coinlist.tokenomics.publicSale", value: "6%" },
    { icon: "🌱", labelKey: "coinlist.tokenomics.ecosystem", value: "30%" },
    { icon: "👥", labelKey: "coinlist.tokenomics.community", value: "25%" },
  ];

  const teamMembers = [
    { initials: "JK", name: "John Kim", role: "CEO & Co-founder" },
    { initials: "SL", name: "Sarah Lee", role: "CTO & Co-founder" },
    { initials: "MP", name: "Michael Park", role: "Chief AI Officer" },
    { initials: "EC", name: "Emily Chen", role: "Head of Product" },
  ];

  const faqItems = [
    { qKey: "coinlist.faq.q1.question", aKey: "coinlist.faq.q1.answer" },
    { qKey: "coinlist.faq.q2.question", aKey: "coinlist.faq.q2.answer" },
    { qKey: "coinlist.faq.q3.question", aKey: "coinlist.faq.q3.answer" },
    { qKey: "coinlist.faq.q4.question", aKey: "coinlist.faq.q4.answer" },
    { qKey: "coinlist.faq.q5.question", aKey: "coinlist.faq.q5.answer" },
    { qKey: "coinlist.faq.q6.question", aKey: "coinlist.faq.q6.answer" },
    { qKey: "coinlist.faq.q7.question", aKey: "coinlist.faq.q7.answer" },
    { qKey: "coinlist.faq.q8.question", aKey: "coinlist.faq.q8.answer" },
  ];

  const documents = [
    { icon: "📄", nameKey: "coinlist.overview.documents.whitepaper", size: "PDF · 2.4 MB" },
    { icon: "📋", nameKey: "coinlist.overview.documents.technicalDocs", size: "PDF · 5.1 MB" },
    { icon: "📊", nameKey: "coinlist.overview.documents.tokenomics", size: "PDF · 1.2 MB" },
    { icon: "🛡️", nameKey: "coinlist.overview.documents.auditReport", size: "PDF · 890 KB" },
  ];

  const quickAmounts = [100, 500, 1000, 5000];

  const socialLinks = [
    { icon: "🐦", name: "Twitter", url: "https://x.com/tburnchain" },
    { icon: "📱", name: "Telegram", url: "https://t.me/tburnchain" },
    { icon: "💬", name: "Discord", url: "https://discord.gg/tburnchain" },
    { icon: "📝", name: "Medium", url: "https://medium.com/@tburnchain" },
    { icon: "💻", name: "GitHub", url: "https://github.com/tburnchain" },
    { icon: "🌐", name: "Website", url: "https://tburnchain.io" },
  ];

  return (
    <div className="coinlist-page">
      <style>{`
        .coinlist-page {
          --coinlist-primary: #FFD700;
          --coinlist-secondary: #FFC107;
          --coinlist-dark: #1A1A2E;
          --coinlist-darker: #16162A;
          --coinlist-card: #252542;
          --coinlist-border: #3D3D5C;
          --gold: #D4AF37;
          --white: #FFFFFF;
          --gray: #9CA3AF;
          --light-gray: #D1D5DB;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          --blue: #3B82F6;
          --purple: #8B5CF6;
          --gradient-coinlist: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--coinlist-darker);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); } 50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes rocket { 0%, 100% { transform: translateY(0) rotate(-10deg); } 50% { transform: translateY(-5px) rotate(-10deg); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }

        .cl-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(26, 26, 46, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--coinlist-border);
        }

        .cl-header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cl-header-left { display: flex; align-items: center; gap: 2rem; }

        .cl-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          cursor: pointer;
        }

        .cl-logo-icon {
          width: 40px;
          height: 40px;
          background: var(--gradient-coinlist);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          animation: rocket 3s ease-in-out infinite;
        }

        .cl-logo-text { font-size: 1.25rem; font-weight: 800; color: var(--white); }

        .cl-nav-tabs { display: flex; gap: 0.5rem; }

        .cl-nav-tab {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--gray);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-nav-tab:hover { color: var(--white); }
        .cl-nav-tab.active { background: var(--coinlist-card); color: var(--coinlist-primary); }

        .cl-header-right { display: flex; align-items: center; gap: 1rem; }

        .cl-balance {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--coinlist-card);
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .cl-balance .icon { color: var(--coinlist-primary); }
        .cl-balance .amount { font-weight: 700; }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cl-user-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-user-menu:hover { border-color: var(--coinlist-primary); }

        .cl-user-avatar {
          width: 32px;
          height: 32px;
          background: var(--gradient-coinlist);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: var(--coinlist-dark);
        }

        .cl-user-info .name { font-size: 0.85rem; font-weight: 600; }
        .cl-user-info .level { font-size: 0.7rem; color: var(--coinlist-primary); }

        .cl-main { padding-top: 80px; }

        .cl-hero {
          background: linear-gradient(180deg, var(--coinlist-dark) 0%, var(--coinlist-darker) 100%);
          padding: 3rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .cl-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 300px;
          background: radial-gradient(ellipse at top, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .cl-hero-container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }

        .cl-hero-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          align-items: start;
        }

        .cl-project-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }

        .cl-project-logo {
          width: 80px;
          height: 80px;
          background: var(--gradient-coinlist);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
        }

        .cl-project-title h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.25rem; }
        .cl-project-title .tagline { color: var(--gray); font-size: 1rem; }

        .cl-badges { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }

        .cl-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .cl-badge.live { background: rgba(16, 185, 129, 0.2); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
        .cl-badge.live .dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
        .cl-badge.verified { background: rgba(255, 215, 0, 0.15); color: var(--coinlist-primary); border: 1px solid rgba(255, 215, 0, 0.3); }
        .cl-badge.premium { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.3); }

        .cl-description { color: var(--light-gray); font-size: 1rem; line-height: 1.8; margin-bottom: 2rem; }

        .cl-key-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }

        .cl-metric-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
        }

        .cl-metric-value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }
        .cl-metric-value.gold { color: var(--coinlist-primary); }
        .cl-metric-value.green { color: var(--success); }
        .cl-metric-value.blue { color: var(--blue); }
        .cl-metric-value.purple { color: var(--purple); }
        .cl-metric-label { font-size: 0.8rem; color: var(--gray); }

        .cl-social-links { display: flex; gap: 0.75rem; }

        .cl-social-link {
          width: 44px;
          height: 44px;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray);
          text-decoration: none;
          transition: all 0.3s;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .cl-social-link:hover { border-color: var(--coinlist-primary); color: var(--coinlist-primary); transform: translateY(-3px); }

        .cl-sale-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 24px;
          overflow: hidden;
          position: sticky;
          top: 100px;
        }

        .cl-sale-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
          border-bottom: 1px solid var(--coinlist-border);
        }

        .cl-sale-status { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

        .cl-live-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 100px;
          font-weight: 700;
          color: var(--success);
        }

        .cl-live-badge .dot { width: 10px; height: 10px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
        .cl-queue-info { font-size: 0.85rem; color: var(--gray); }

        .cl-countdown { display: flex; gap: 1rem; justify-content: center; }

        .cl-countdown-item { text-align: center; }
        .cl-countdown-value { font-size: 1.75rem; font-weight: 800; color: var(--white); }
        .cl-countdown-label { font-size: 0.7rem; color: var(--gray); text-transform: uppercase; }

        .cl-sale-body { padding: 1.5rem; }

        .cl-progress { margin-bottom: 1.5rem; }
        .cl-progress-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .cl-progress-header .raised { font-size: 1.25rem; font-weight: 800; color: var(--coinlist-primary); }
        .cl-progress-header .goal { color: var(--gray); font-size: 0.9rem; }

        .cl-progress-bar { height: 12px; background: var(--coinlist-dark); border-radius: 100px; overflow: hidden; margin-bottom: 0.75rem; }

        .cl-progress-fill {
          height: 100%;
          background: var(--gradient-coinlist);
          border-radius: 100px;
          position: relative;
          width: 45%;
        }

        .cl-progress-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .cl-progress-stats { display: flex; justify-content: space-between; font-size: 0.85rem; }
        .cl-progress-stats .percent { color: var(--coinlist-primary); font-weight: 700; }
        .cl-progress-stats .participants { color: var(--gray); }

        .cl-sale-info { margin-bottom: 1.5rem; }

        .cl-sale-info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cl-sale-info-item:last-child { border-bottom: none; }
        .cl-sale-info-item .label { color: var(--gray); font-size: 0.9rem; }
        .cl-sale-info-item .value { font-weight: 600; font-size: 0.9rem; }
        .cl-sale-info-item .value.highlight { color: var(--coinlist-primary); }

        .cl-queue-system {
          background: var(--coinlist-dark);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .cl-queue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .cl-queue-header h4 { font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .cl-queue-header h4 span { color: var(--coinlist-primary); }
        .cl-queue-position { font-size: 0.85rem; color: var(--success); font-weight: 600; }

        .cl-queue-visual { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
        .cl-queue-bar { flex: 1; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 100px; overflow: hidden; }
        .cl-queue-bar-fill { height: 100%; background: var(--success); border-radius: 100px; width: 15%; }
        .cl-queue-percent { font-size: 0.8rem; font-weight: 700; color: var(--success); }
        .cl-queue-wait { font-size: 0.8rem; color: var(--gray); text-align: center; }

        .cl-allocation { margin-bottom: 1.5rem; }
        .cl-allocation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .cl-allocation-header .label { font-size: 0.9rem; font-weight: 600; }
        .cl-allocation-header .max-alloc { font-size: 0.8rem; color: var(--coinlist-primary); }

        .cl-allocation-input-group { position: relative; margin-bottom: 1rem; }

        .cl-allocation-input {
          width: 100%;
          padding: 1rem;
          padding-right: 100px;
          background: var(--coinlist-dark);
          border: 2px solid var(--coinlist-border);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.25rem;
          font-weight: 700;
          transition: border-color 0.3s;
        }

        .cl-allocation-input:focus { outline: none; border-color: var(--coinlist-primary); }

        .cl-allocation-currency {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--coinlist-card);
          border-radius: 8px;
        }

        .cl-allocation-currency .icon { font-size: 1.25rem; }
        .cl-allocation-currency span { font-weight: 600; font-size: 0.9rem; }

        .cl-quick-amounts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }

        .cl-quick-amount {
          padding: 10px;
          background: var(--coinlist-dark);
          border: 1px solid var(--coinlist-border);
          border-radius: 8px;
          color: var(--light-gray);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .cl-quick-amount:hover, .cl-quick-amount.active {
          border-color: var(--coinlist-primary);
          color: var(--coinlist-primary);
          background: rgba(255, 215, 0, 0.1);
        }

        .cl-token-calc {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05));
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .cl-calc-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
        .cl-calc-row .label { color: var(--gray); font-size: 0.85rem; }
        .cl-calc-row .value { font-weight: 600; font-size: 0.85rem; }
        .cl-calc-row .value.large { font-size: 1.125rem; color: var(--coinlist-primary); }
        .cl-calc-row .value.bonus { color: var(--success); }

        .cl-payment-section { margin-bottom: 1.5rem; }
        .cl-payment-header { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; }

        .cl-payment-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }

        .cl-payment-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: var(--coinlist-dark);
          border: 2px solid var(--coinlist-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-payment-option:hover { border-color: rgba(255, 255, 255, 0.3); }
        .cl-payment-option.active { border-color: var(--coinlist-primary); background: rgba(255, 215, 0, 0.1); }
        .cl-payment-option .icon { font-size: 1.5rem; }
        .cl-payment-option .info { flex: 1; }
        .cl-payment-option .info .name { font-weight: 600; font-size: 0.9rem; }
        .cl-payment-option .info .type { font-size: 0.75rem; color: var(--gray); }

        .cl-payment-option .check {
          width: 20px;
          height: 20px;
          border: 2px solid var(--coinlist-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: transparent;
        }

        .cl-payment-option.active .check { background: var(--coinlist-primary); border-color: var(--coinlist-primary); color: var(--coinlist-dark); }

        .cl-purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: var(--gradient-coinlist);
          border: none;
          border-radius: 14px;
          color: var(--coinlist-dark);
          font-size: 1.125rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          animation: glow 2s infinite;
        }

        .cl-purchase-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3); }

        .cl-security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--gray);
        }

        .cl-security-note span { color: var(--success); }

        .cl-details-section { max-width: 1400px; margin: 0 auto; padding: 3rem 2rem; }

        .cl-details-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--coinlist-border);
          padding-bottom: 1rem;
        }

        .cl-details-tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--gray);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-details-tab:hover { color: var(--white); }
        .cl-details-tab.active { background: var(--coinlist-card); color: var(--coinlist-primary); }

        .cl-details-content { display: none; animation: slideUp 0.3s ease-out; }
        .cl-details-content.active { display: block; }

        .cl-overview-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }

        .cl-about-section h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cl-about-section p { color: var(--light-gray); margin-bottom: 1rem; line-height: 1.8; }

        .cl-features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .cl-feature-item {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
        }

        .cl-feature-item .icon { font-size: 2rem; }
        .cl-feature-item h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .cl-feature-item p { font-size: 0.85rem; color: var(--gray); }

        .cl-sidebar-cards { display: flex; flex-direction: column; gap: 1.5rem; }

        .cl-sidebar-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 20px;
          padding: 1.5rem;
        }

        .cl-sidebar-card h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cl-vesting-timeline { display: flex; flex-direction: column; gap: 0.75rem; }

        .cl-vesting-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--coinlist-dark);
          border-radius: 12px;
        }

        .cl-vesting-item.tge { border: 1px solid var(--coinlist-primary); }

        .cl-vesting-dot {
          width: 24px;
          height: 24px;
          background: var(--coinlist-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: transparent;
        }

        .cl-vesting-item.tge .cl-vesting-dot { background: var(--coinlist-primary); color: var(--coinlist-dark); }

        .cl-vesting-content { flex: 1; }
        .cl-vesting-content .title { font-size: 0.85rem; font-weight: 600; }
        .cl-vesting-content .desc { font-size: 0.75rem; color: var(--gray); }
        .cl-vesting-amount { font-size: 0.9rem; font-weight: 700; color: var(--coinlist-primary); }

        .cl-documents-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .cl-document-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--coinlist-dark);
          border-radius: 12px;
          text-decoration: none;
          color: var(--white);
          transition: all 0.3s;
          cursor: pointer;
        }

        .cl-document-item:hover { background: rgba(255, 215, 0, 0.1); }
        .cl-document-item .icon { font-size: 1.5rem; }
        .cl-document-item .info { flex: 1; }
        .cl-document-item .info .name { font-size: 0.9rem; font-weight: 600; }
        .cl-document-item .info .size { font-size: 0.75rem; color: var(--gray); }
        .cl-document-item .arrow { color: var(--coinlist-primary); }

        .cl-tokenomics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .cl-tokenomics-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
        }

        .cl-tokenomics-card .icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .cl-tokenomics-card h4 { font-size: 0.9rem; color: var(--gray); margin-bottom: 0.5rem; }
        .cl-tokenomics-card .value { font-size: 1.5rem; font-weight: 800; color: var(--coinlist-primary); }

        .cl-team-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }

        .cl-team-member {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
        }

        .cl-team-member .avatar {
          width: 50px;
          height: 50px;
          background: var(--gradient-coinlist);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--coinlist-dark);
        }

        .cl-team-member .info .name { font-size: 1rem; font-weight: 700; }
        .cl-team-member .info .role { font-size: 0.8rem; color: var(--gray); }

        .cl-partners-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; }

        .cl-partner-badge {
          padding: 8px 16px;
          background: var(--coinlist-dark);
          border: 1px solid var(--coinlist-border);
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .cl-faq-list { display: flex; flex-direction: column; gap: 1rem; max-width: 800px; }

        .cl-faq-item {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          overflow: hidden;
        }

        .cl-faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          cursor: pointer;
          transition: background 0.3s;
        }

        .cl-faq-question:hover { background: rgba(255, 255, 255, 0.02); }
        .cl-faq-question h4 { font-size: 1rem; font-weight: 600; }
        .cl-faq-question .arrow { color: var(--coinlist-primary); transition: transform 0.3s; }
        .cl-faq-item.active .cl-faq-question .arrow { transform: rotate(180deg); }

        .cl-faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s, padding 0.3s;
        }

        .cl-faq-item.active .cl-faq-answer {
          max-height: 300px;
          padding: 0 1.25rem 1.25rem;
        }

        .cl-faq-answer p { color: var(--light-gray); font-size: 0.95rem; line-height: 1.7; }

        .cl-footer {
          background: var(--coinlist-dark);
          border-top: 1px solid var(--coinlist-border);
          padding: 2rem;
        }

        .cl-footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cl-footer-links { display: flex; gap: 2rem; }
        .cl-footer-links a { color: var(--gray); text-decoration: none; font-size: 0.9rem; transition: color 0.3s; cursor: pointer; }
        .cl-footer-links a:hover { color: var(--coinlist-primary); }

        .cl-footer-social { display: flex; gap: 1rem; }

        .cl-footer-social-link {
          width: 36px;
          height: 36px;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray);
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-footer-social-link:hover { border-color: var(--coinlist-primary); color: var(--coinlist-primary); }

        .cl-footer-copyright { color: var(--gray); font-size: 0.85rem; }

        .cl-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }

        .cl-modal {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 24px;
          width: 90%;
          max-width: 400px;
          overflow: hidden;
          animation: slideUp 0.3s;
        }

        .cl-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-bottom: 1px solid var(--coinlist-border);
        }

        .cl-modal-header h3 { font-size: 1.125rem; font-weight: 700; }

        .cl-modal-close {
          background: none;
          border: none;
          color: var(--gray);
          font-size: 1.25rem;
          cursor: pointer;
          transition: color 0.3s;
        }

        .cl-modal-close:hover { color: var(--white); }

        .cl-modal-body { padding: 2rem; text-align: center; }

        .cl-modal-icon {
          width: 80px;
          height: 80px;
          background: var(--coinlist-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
        }

        .cl-modal-icon.success { background: rgba(16, 185, 129, 0.2); color: var(--success); }
        .cl-modal-icon.pending { background: rgba(255, 215, 0, 0.2); }

        .cl-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--coinlist-border);
          border-top-color: var(--coinlist-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .cl-modal-body h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .cl-modal-body p { color: var(--gray); font-size: 0.95rem; }

        .cl-modal-details {
          background: var(--coinlist-dark);
          border-radius: 12px;
          padding: 1rem;
          margin: 1.5rem 0;
        }

        .cl-modal-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .cl-modal-detail-row .label { color: var(--gray); font-size: 0.9rem; }
        .cl-modal-detail-row .value { font-weight: 600; font-size: 0.9rem; }

        .cl-modal-btn {
          width: 100%;
          padding: 14px;
          background: var(--gradient-coinlist);
          border: none;
          border-radius: 12px;
          color: var(--coinlist-dark);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .cl-modal-btn:hover { transform: scale(1.02); }

        @media (max-width: 1024px) {
          .cl-hero-grid { grid-template-columns: 1fr; }
          .cl-sale-card { position: static; margin-top: 2rem; }
          .cl-overview-grid { grid-template-columns: 1fr; }
          .cl-key-metrics { grid-template-columns: repeat(2, 1fr); }
          .cl-tokenomics-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .cl-header-container { padding: 0.75rem 1rem; }
          .cl-nav-tabs, .cl-balance { display: none; }
          .cl-hero { padding: 2rem 1rem; }
          .cl-key-metrics { grid-template-columns: 1fr 1fr; }
          .cl-features-grid { grid-template-columns: 1fr; }
          .cl-tokenomics-grid { grid-template-columns: 1fr; }
          .cl-payment-options { grid-template-columns: 1fr; }
          .cl-quick-amounts { grid-template-columns: repeat(2, 1fr); }
          .cl-footer-content { flex-direction: column; text-align: center; gap: 1rem; }
          .cl-team-list { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <header className="cl-header">
        <div className="cl-header-container">
          <div className="cl-header-left">
            <a href="/" className="cl-logo" data-testid="link-logo">
              <div className="cl-logo-icon">
                <TBurnLogo className="w-12 h-12" />
              </div>
              <div className="cl-logo-text">CoinList</div>
            </a>
            <div className="cl-nav-tabs">
              <button 
                className="cl-nav-tab active" 
                onClick={() => scrollToSection('hero')}
                data-testid="nav-token-sale"
              >
                {t('coinlist.header.tokenSale')}
              </button>
              <button 
                className="cl-nav-tab" 
                onClick={() => handleNavTab(t('coinlist.header.trading'))}
                data-testid="nav-trading"
              >
                {t('coinlist.header.trading')}
              </button>
              <button 
                className="cl-nav-tab" 
                onClick={() => handleNavTab(t('coinlist.header.staking'))}
                data-testid="nav-staking"
              >
                {t('coinlist.header.staking')}
              </button>
              <button 
                className="cl-nav-tab" 
                onClick={() => handleNavTab(t('coinlist.header.portfolio'))}
                data-testid="nav-portfolio"
              >
                {t('coinlist.header.portfolio')}
              </button>
            </div>
          </div>
          <div className="cl-header-right">
            <div className="cl-balance">
              <span className="icon">💰</span>
              <span className="amount">$5,000.00</span>
            </div>
            <div className="header-actions">
              <LanguageSelector isDark={true} />
              <button 
                className="cl-user-menu"
                onClick={handleWalletClick}
                data-testid="button-wallet-connect"
              >
                <div className="cl-user-avatar">{isConnected ? formatAddress(address || '').slice(0, 2).toUpperCase() : 'CL'}</div>
                <div className="cl-user-info">
                  <div className="name">{isConnected ? formatAddress(address || '') : t('coinlist.header.connectWallet')}</div>
                  <div className="level">{isConnected ? 'Connected' : 'Click to connect'}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="cl-main">
        {/* Hero Section */}
        <section className="cl-hero" id="hero">
          <div className="cl-hero-container">
            <div className="cl-hero-grid">
              {/* Project Info */}
              <div className="cl-project-info">
                <div className="cl-project-header">
                  <div className="cl-project-logo">🔥</div>
                  <div className="cl-project-title">
                    <h1 data-testid="text-title">TBURN Chain</h1>
                    <div className="tagline">AI-Enhanced Blockchain Platform</div>
                  </div>
                </div>

                <div className="cl-badges">
                  <span className="cl-badge live"><span className="dot"></span>{t('coinlist.hero.badges.saleInProgress')}</span>
                  <span className="cl-badge verified">🛡️ {t('coinlist.hero.badges.verified')}</span>
                  <span className="cl-badge premium">💎 {t('coinlist.hero.badges.premium')}</span>
                </div>

                <p className="cl-description">
                  {t('coinlist.hero.description')}
                </p>

                <div className="cl-key-metrics" data-testid="coinlist-metrics">
                  <div className="cl-metric-card" data-testid="stat-token-price">
                    <div className="cl-metric-value gold">$0.020</div>
                    <div className="cl-metric-label">{t('coinlist.hero.metrics.tokenPrice')}</div>
                  </div>
                  <div className="cl-metric-card" data-testid="stat-tge">
                    <div className="cl-metric-value green">15%</div>
                    <div className="cl-metric-label">{t('coinlist.hero.metrics.tgeUnlock')}</div>
                  </div>
                  <div className="cl-metric-card" data-testid="stat-total-supply">
                    <div className="cl-metric-value blue">600M</div>
                    <div className="cl-metric-label">{t('coinlist.hero.metrics.totalSale')}</div>
                  </div>
                  <div className="cl-metric-card" data-testid="stat-target">
                    <div className="cl-metric-value purple">
                      {isLoadingStats ? '...' : coinlistPlatform?.totalRaised || '$12M'}
                    </div>
                    <div className="cl-metric-label">{t('coinlist.hero.metrics.targetRaise')}</div>
                  </div>
                </div>

                <div className="cl-social-links">
                  {socialLinks.map((link, i) => (
                    <button 
                      key={i} 
                      className="cl-social-link"
                      onClick={() => handleShareSocial(link.name, link.url)}
                      data-testid={`social-link-${link.name.toLowerCase()}`}
                    >
                      {link.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sale Card */}
              <div className="cl-sale-card">
                <div className="cl-sale-header">
                  <div className="cl-sale-status">
                    <div className="cl-live-badge"><span className="dot"></span>LIVE</div>
                    <div className="cl-queue-info">12,450 {t('coinlist.saleCard.queueInfo')}</div>
                  </div>
                  <div className="cl-countdown" data-testid="countdown">
                    <div className="cl-countdown-item">
                      <div className="cl-countdown-value">{countdown.days.toString().padStart(2, '0')}</div>
                      <div className="cl-countdown-label">{t('coinlist.saleCard.countdown.days')}</div>
                    </div>
                    <div className="cl-countdown-item">
                      <div className="cl-countdown-value">{countdown.hours.toString().padStart(2, '0')}</div>
                      <div className="cl-countdown-label">{t('coinlist.saleCard.countdown.hours')}</div>
                    </div>
                    <div className="cl-countdown-item">
                      <div className="cl-countdown-value">{countdown.minutes.toString().padStart(2, '0')}</div>
                      <div className="cl-countdown-label">{t('coinlist.saleCard.countdown.mins')}</div>
                    </div>
                    <div className="cl-countdown-item">
                      <div className="cl-countdown-value">{countdown.seconds.toString().padStart(2, '0')}</div>
                      <div className="cl-countdown-label">{t('coinlist.saleCard.countdown.secs')}</div>
                    </div>
                  </div>
                </div>

                <div className="cl-sale-body">
                  {/* Progress */}
                  <div className="cl-progress" data-testid="coinlist-progress">
                    <div className="cl-progress-header">
                      <div className="raised" data-testid="text-raised-amount">
                        {isLoadingStats ? '...' : launchpadStats?.totalLaunchpadRaised || '$5,400,000'}
                      </div>
                      <div className="goal">/ $12,000,000</div>
                    </div>
                    <div className="cl-progress-bar">
                      <div className="cl-progress-fill"></div>
                    </div>
                    <div className="cl-progress-stats">
                      <span className="percent">45% {t('coinlist.saleCard.progress.completed')}</span>
                      <span className="participants" data-testid="text-participants">
                        {isLoadingStats ? '...' : `${coinlistPlatform?.participants?.toLocaleString() || '8,234'} ${t('coinlist.saleCard.progress.participants')}`}
                      </span>
                    </div>
                  </div>

                  {/* Sale Info */}
                  <div className="cl-sale-info">
                    {[
                      { labelKey: "coinlist.saleCard.saleInfo.tokenPrice", value: "$0.020", highlight: true },
                      { labelKey: "coinlist.saleCard.saleInfo.minParticipation", value: "$100" },
                      { labelKey: "coinlist.saleCard.saleInfo.maxParticipation", value: "$50,000" },
                      { labelKey: "coinlist.saleCard.saleInfo.tgeUnlock", value: "15%", highlight: true },
                    ].map((item, i) => (
                      <div key={i} className="cl-sale-info-item">
                        <span className="label">{t(item.labelKey)}</span>
                        <span className={`value ${item.highlight ? 'highlight' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Queue System */}
                  <div className="cl-queue-system">
                    <div className="cl-queue-header">
                      <h4><span>👥</span> {t('coinlist.saleCard.queue.title')}</h4>
                      <span className="cl-queue-position">#1,247</span>
                    </div>
                    <div className="cl-queue-visual">
                      <div className="cl-queue-bar">
                        <div className="cl-queue-bar-fill"></div>
                      </div>
                      <span className="cl-queue-percent">15%</span>
                    </div>
                    <div className="cl-queue-wait">{t('coinlist.saleCard.queue.estimatedWait')}</div>
                  </div>

                  {/* Allocation Input */}
                  <div className="cl-allocation">
                    <div className="cl-allocation-header">
                      <span className="label">{t('coinlist.saleCard.allocation.title')}</span>
                      <span className="max-alloc">{t('coinlist.saleCard.allocation.max')}: $50,000</span>
                    </div>
                    <div className="cl-allocation-input-group">
                      <input 
                        type="number"
                        className="cl-allocation-input"
                        value={allocationAmount}
                        onChange={(e) => setAllocationAmount(Number(e.target.value) || 0)}
                        data-testid="input-allocation"
                      />
                      <div className="cl-allocation-currency">
                        <span className="icon">💵</span>
                        <span>USD</span>
                      </div>
                    </div>
                    <div className="cl-quick-amounts">
                      {quickAmounts.map(amount => (
                        <button 
                          key={amount}
                          className={`cl-quick-amount ${allocationAmount === amount ? 'active' : ''}`}
                          onClick={() => setAllocationAmount(amount)}
                          data-testid={`button-amount-${amount}`}
                        >
                          ${amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Token Calculation */}
                  <div className="cl-token-calc" data-testid="token-calculation">
                    <div className="cl-calc-row">
                      <span className="label">{t('coinlist.saleCard.tokenCalc.receivingTokens')}</span>
                      <span className="value large">{totalTokens.toLocaleString()} TBURN</span>
                    </div>
                    <div className="cl-calc-row">
                      <span className="label">{t('coinlist.saleCard.tokenCalc.bonus')} (+{bonusPercent}%)</span>
                      <span className="value bonus">+{bonusTokens.toLocaleString()} TBURN</span>
                    </div>
                    <div className="cl-calc-row">
                      <span className="label">{t('coinlist.saleCard.tokenCalc.tgeUnlock')}</span>
                      <span className="value">{tgeTokens.toLocaleString()} TBURN</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="cl-payment-section">
                    <div className="cl-payment-header">{t('coinlist.saleCard.payment.title')}</div>
                    <div className="cl-payment-options">
                      {paymentMethods.map(method => (
                        <button 
                          key={method.id}
                          className={`cl-payment-option ${selectedPayment === method.id ? 'active' : ''}`}
                          onClick={() => setSelectedPayment(method.id)}
                          data-testid={`button-payment-${method.id}`}
                        >
                          <span className="icon">{method.icon}</span>
                          <div className="info">
                            <div className="name">{method.name}</div>
                            <div className="type">{t(method.typeKey)}</div>
                          </div>
                          <div className="check">✓</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="cl-purchase-btn" 
                    onClick={handlePurchase} 
                    data-testid="button-purchase"
                  >
                    🚀 {t('coinlist.saleCard.purchaseButton')}
                  </button>

                  <div className="cl-security-note">
                    <span>🛡️</span> {t('coinlist.saleCard.securityNote')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="cl-details-section" id="details">
          <div className="cl-details-tabs">
            {['overview', 'tokenomics', 'team', 'faq'].map(tab => (
              <button 
                key={tab}
                className={`cl-details-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                data-testid={`tab-${tab}`}
              >
                {t(`coinlist.tabs.${tab}`)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          <div className={`cl-details-content ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="cl-overview-grid">
              <div className="cl-about-section">
                <h3><span>ℹ️</span> {t('coinlist.overview.aboutTitle')}</h3>
                <p>
                  {t('coinlist.overview.aboutP1')}
                </p>
                <p>
                  {t('coinlist.overview.aboutP2')}
                </p>

                <h3 style={{ marginTop: '2rem' }}><span>⭐</span> {t('coinlist.overview.featuresTitle')}</h3>
                <div className="cl-features-grid">
                  {features.map((f, i) => (
                    <div key={i} className="cl-feature-item">
                      <div className="icon">{f.icon}</div>
                      <div>
                        <h4>{t(f.titleKey)}</h4>
                        <p>{t(f.descKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cl-sidebar-cards">
                {/* Vesting Schedule */}
                <div className="cl-sidebar-card">
                  <h4><span>📅</span> {t('coinlist.overview.vesting.title')}</h4>
                  <div className="cl-vesting-timeline">
                    <div className="cl-vesting-item tge">
                      <div className="cl-vesting-dot">✓</div>
                      <div className="cl-vesting-content">
                        <div className="title">{t('coinlist.overview.vesting.tge')}</div>
                        <div className="desc">{t('coinlist.overview.vesting.tgeDesc')}</div>
                      </div>
                      <div className="cl-vesting-amount">15%</div>
                    </div>
                    <div className="cl-vesting-item">
                      <div className="cl-vesting-dot"></div>
                      <div className="cl-vesting-content">
                        <div className="title">{t('coinlist.overview.vesting.cliff')}</div>
                        <div className="desc">{t('coinlist.overview.vesting.cliffDesc')}</div>
                      </div>
                      <div className="cl-vesting-amount">0%</div>
                    </div>
                    <div className="cl-vesting-item">
                      <div className="cl-vesting-dot"></div>
                      <div className="cl-vesting-content">
                        <div className="title">{t('coinlist.overview.vesting.linearVesting')}</div>
                        <div className="desc">{t('coinlist.overview.vesting.linearVestingDesc')}</div>
                      </div>
                      <div className="cl-vesting-amount">85%</div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="cl-sidebar-card">
                  <h4><span>📄</span> {t('coinlist.overview.documents.title')}</h4>
                  <div className="cl-documents-list">
                    {documents.map((doc, i) => (
                      <button 
                        key={i} 
                        className="cl-document-item"
                        onClick={() => handleDocumentDownload(t(doc.nameKey))}
                        data-testid={`button-document-${i}`}
                      >
                        <div className="icon">{doc.icon}</div>
                        <div className="info">
                          <div className="name">{t(doc.nameKey)}</div>
                          <div className="size">{doc.size}</div>
                        </div>
                        <span className="arrow">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tokenomics Tab */}
          <div className={`cl-details-content ${activeTab === 'tokenomics' ? 'active' : ''}`}>
            <div className="cl-tokenomics-grid">
              {tokenomicsData.map((item, i) => (
                <div key={i} className="cl-tokenomics-card" data-testid={`tokenomics-card-${i}`}>
                  <div className="icon">{item.icon}</div>
                  <h4>{t(item.labelKey)}</h4>
                  <div className="value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Tab */}
          <div className={`cl-details-content ${activeTab === 'team' ? 'active' : ''}`}>
            <div className="cl-overview-grid">
              <div className="cl-about-section">
                <h3><span>👥</span> {t('coinlist.team.coreTeam')}</h3>
                <div className="cl-team-list">
                  {teamMembers.map((m, i) => (
                    <div key={i} className="cl-team-member" data-testid={`team-member-${i}`}>
                      <div className="avatar">{m.initials}</div>
                      <div className="info">
                        <div className="name">{m.name}</div>
                        <div className="role">{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cl-sidebar-cards">
                <div className="cl-sidebar-card">
                  <h4><span>🤝</span> {t('coinlist.team.keyPartners')}</h4>
                  <div className="cl-partners-grid">
                    {['Chainlink', 'Circle', 'AWS', 'Samsung'].map(p => (
                      <div key={p} className="cl-partner-badge">{p}</div>
                    ))}
                  </div>
                </div>
                <div className="cl-sidebar-card">
                  <h4><span>🏢</span> {t('coinlist.team.investors')}</h4>
                  <div className="cl-partners-grid">
                    {['Polychain', 'Framework', 'Electric'].map(p => (
                      <div key={p} className="cl-partner-badge">{p}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Tab */}
          <div className={`cl-details-content ${activeTab === 'faq' ? 'active' : ''}`} id="faq">
            <div className="cl-faq-list">
              {faqItems.map((faq, i) => (
                <div 
                  key={i} 
                  className={`cl-faq-item ${expandedFaq === i ? 'active' : ''}`}
                  data-testid={`faq-item-${i + 1}`}
                >
                  <div 
                    className="cl-faq-question" 
                    onClick={() => setExpandedFaq(expandedFaq === i ? -1 : i)}
                  >
                    <h4>{t(faq.qKey)}</h4>
                    <span className="arrow">▼</span>
                  </div>
                  <div className="cl-faq-answer">
                    <p>{t(faq.aKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="cl-footer">
          <div className="cl-footer-content">
            <div className="cl-footer-links">
              <a href="/legal/terms-of-service" data-testid="footer-link-terms">{t('coinlist.footer.terms')}</a>
              <a href="/legal/privacy-policy" data-testid="footer-link-privacy">{t('coinlist.footer.privacy')}</a>
              <a 
                onClick={() => toast({ title: t('coinlist.toast.riskDisclosure'), description: t('coinlist.toast.riskDisclosureDesc') })}
                data-testid="footer-link-risk"
              >
                {t('coinlist.footer.riskDisclosure')}
              </a>
              <a 
                onClick={() => toast({ title: t('coinlist.toast.customerSupport'), description: t('coinlist.toast.customerSupportDesc') })}
                data-testid="footer-link-support"
              >
                {t('coinlist.footer.support')}
              </a>
            </div>
            <div className="cl-footer-social">
              <button 
                className="cl-footer-social-link"
                onClick={() => handleShareSocial('Twitter', 'https://x.com/tburnchain')}
                data-testid="footer-link-twitter"
              >
                🐦
              </button>
              <button 
                className="cl-footer-social-link"
                onClick={() => handleShareSocial('Telegram', 'https://t.me/tburnchain')}
                data-testid="footer-link-telegram"
              >
                📱
              </button>
              <button 
                className="cl-footer-social-link"
                onClick={() => handleShareSocial('Discord', 'https://discord.gg/tburnchain')}
                data-testid="footer-link-discord"
              >
                💬
              </button>
              <button 
                className="cl-footer-social-link"
                onClick={() => handleShareSocial('GitHub', 'https://github.com/tburnchain')}
                data-testid="footer-link-github"
              >
                💻
              </button>
            </div>
            <div className="cl-footer-copyright">{t('coinlist.footer.copyright')}</div>
          </div>
        </footer>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="cl-modal-overlay" data-testid="modal-purchase">
          <div className="cl-modal">
            <div className="cl-modal-header">
              <h3>{modalStatus === 'success' ? t('coinlist.modal.participationComplete') : t('coinlist.modal.processing')}</h3>
              <button 
                className="cl-modal-close" 
                onClick={() => setShowModal(false)}
                data-testid="button-modal-close"
              >
                ✕
              </button>
            </div>
            <div className="cl-modal-body">
              <div className={`cl-modal-icon ${modalStatus}`}>
                {modalStatus === 'pending' ? <div className="cl-spinner"></div> : '✓'}
              </div>
              <h4>{modalStatus === 'success' ? t('coinlist.modal.tokenSaleComplete') : t('coinlist.modal.processing')}</h4>
              <p>{modalStatus === 'success' ? t('coinlist.modal.tokenDeliveryNote') : t('coinlist.modal.pleaseWait')}</p>

              <div className="cl-modal-details">
                <div className="cl-modal-detail-row">
                  <span className="label">{t('coinlist.modal.participationAmount')}</span>
                  <span className="value">${allocationAmount.toLocaleString()} {selectedPayment.toUpperCase()}</span>
                </div>
                <div className="cl-modal-detail-row">
                  <span className="label">{t('coinlist.modal.tokensToReceive')}</span>
                  <span className="value">{totalTokens.toLocaleString()} TBURN</span>
                </div>
                <div className="cl-modal-detail-row">
                  <span className="label">{t('coinlist.modal.tgeUnlock')}</span>
                  <span className="value">{tgeTokens.toLocaleString()} TBURN</span>
                </div>
              </div>

              {modalStatus === 'success' && (
                <button 
                  className="cl-modal-btn" 
                  onClick={() => setShowModal(false)}
                  data-testid="button-modal-confirm"
                >
                  {t('coinlist.modal.confirm')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
