import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18nInstance from "@/lib/i18n";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectionModal, useWalletModal } from "@/components/WalletConnectionModal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";

interface ApiEvent {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  rewardPool: string;
  participantCount: number;
  category?: string;
  icon?: string;
}

interface EventsApiResponse {
  success: boolean;
  data: {
    totalEvents: number;
    activeEventsCount: number;
    totalParticipants: number;
    totalRewardsDistributed: string;
    upcomingEvents: ApiEvent[];
    activeEvents: ApiEvent[];
  };
}

export default function EventsPage() {
  const { t, i18n, ready } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [, forceUpdate] = useState(0);
  
  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log(`[EventsPage] Language changed to: ${i18n.language}`);
      forceUpdate(n => n + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  // Debug: Log current language and compare with direct import
  console.log(`[EventsPage] useTranslation i18n.language: ${i18n.language}, direct import: ${i18nInstance.language}, Ready: ${ready}`);
  console.log(`[EventsPage] Sample translation: "${t('events.hero.title')}"`);
  console.log(`[EventsPage] Same instance: ${i18n === i18nInstance}`);
  
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [countdown, setCountdown] = useState({ days: 14, hours: 23, minutes: 59, seconds: 59 });
  
  const { isConnected, address, disconnect, formatAddress } = useWeb3();
  const { isOpen: walletModalOpen, setIsOpen: setWalletModalOpen, openModal: openWalletModal } = useWalletModal();
  const { toast } = useToast();
  const [registering, setRegistering] = useState<string | null>(null);

  const { data: eventsData, isLoading: isEventsLoading } = useQuery<EventsApiResponse>({
    queryKey: ['/api/token-programs/events/list'],
  });

  const registerMutation = useMutation({
    mutationFn: async ({ eventId, walletAddress }: { eventId: string; walletAddress: string }) => {
      return apiRequest('POST', '/api/events/register', { eventId, walletAddress });
    },
    onSuccess: (data: any) => {
      toast({
        title: t('events.toasts.registerSuccess.title'),
        description: data.data?.message || t('events.toasts.registerSuccess.desc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/token-programs/events/list'] });
      setRegistering(null);
    },
    onError: (error: any) => {
      toast({
        title: t('events.toasts.registerFailed.title'),
        description: error.message || t('events.toasts.registerFailed.desc'),
        variant: "destructive",
      });
      setRegistering(null);
    },
  });

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

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      openWalletModal();
    }
  };

  const handleParticipate = async (eventId: string) => {
    if (!isConnected) {
      openWalletModal();
      return;
    }
    if (!address) {
      toast({
        title: t('events.toasts.walletRequired.title'),
        description: t('events.toasts.walletRequired.desc'),
        variant: "destructive",
      });
      return;
    }
    setRegistering(eventId);
    registerMutation.mutate({ eventId, walletAddress: address });
  };

  const apiData = eventsData?.data;
  const activeEventsCount = apiData?.activeEventsCount ?? (Array.isArray(apiData?.activeEvents) ? apiData.activeEvents.length : 0);
  const apiStats = {
    totalEvents: apiData?.totalEvents ?? 0,
    activeEvents: activeEventsCount,
    totalParticipants: apiData?.totalParticipants ?? 0,
    totalRewardsDistributed: apiData?.totalRewardsDistributed ?? "0",
  };

  const staticEvents = [
    { id: "launch", category: "launch live", icon: "🚀", status: t('events.upcoming.status.live'), statusClass: "live", title: t('events.upcoming.staticEvents.launch.title'), desc: t('events.upcoming.staticEvents.launch.desc'), reward: "50M", date: "~2026.01.31", featured: true },
    { id: "trading", category: "trading live", icon: "📊", status: t('events.upcoming.status.live'), statusClass: "live", title: t('events.upcoming.staticEvents.trading.title'), desc: t('events.upcoming.staticEvents.trading.desc'), reward: "20M", date: "~2026.02.28", featured: false },
    { id: "staking", category: "staking live", icon: "💎", status: t('events.upcoming.status.live'), statusClass: "live", title: t('events.upcoming.staticEvents.staking.title'), desc: t('events.upcoming.staticEvents.staking.desc'), reward: "30M", date: "~2026.02.15", featured: false },
    { id: "meme", category: "community", icon: "👥", status: t('events.upcoming.status.upcoming'), statusClass: "upcoming", title: t('events.upcoming.staticEvents.meme.title'), desc: t('events.upcoming.staticEvents.meme.desc'), reward: "5M", date: "2026.01.15~", featured: false },
    { id: "quiz", category: "community live", icon: "🧠", status: t('events.upcoming.status.live'), statusClass: "live", title: t('events.upcoming.staticEvents.quiz.title'), desc: t('events.upcoming.staticEvents.quiz.desc'), reward: "10M", date: "Always", featured: false },
    { id: "dex", category: "partner", icon: "🤝", status: t('events.upcoming.status.upcoming'), statusClass: "upcoming", title: t('events.upcoming.staticEvents.dex.title'), desc: t('events.upcoming.staticEvents.dex.desc'), reward: "20M", date: "2026.02.01~", featured: false },
  ];

  const apiActiveEvents = (Array.isArray(apiData?.activeEvents) ? apiData.activeEvents : []).map((e: ApiEvent) => ({
    id: e.id,
    category: e.category || "live",
    icon: e.icon || "🎯",
    status: t('events.upcoming.status.live'),
    statusClass: "live",
    title: e.name,
    desc: e.description,
    reward: Number(e.rewardPool).toLocaleString(),
    date: `~${new Date(e.endDate).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}`,
    featured: false,
  })) || [];

  const apiUpcomingEvents = (Array.isArray(apiData?.upcomingEvents) ? apiData.upcomingEvents : []).map((e: ApiEvent) => ({
    id: e.id,
    category: e.category || "upcoming",
    icon: e.icon || "📅",
    status: t('events.upcoming.status.upcoming'),
    statusClass: "upcoming",
    title: e.name,
    desc: e.description,
    reward: Number(e.rewardPool).toLocaleString(),
    date: `${new Date(e.startDate).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}~`,
    featured: false,
  })) || [];

  const events = [...staticEvents, ...apiActiveEvents, ...apiUpcomingEvents];

  const filteredEvents = activeCategory === "all" 
    ? events 
    : events.filter(e => e.category.includes(activeCategory));

  return (
    <div className="events-page">
      <style>{`
        .events-page {
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
          --orange: #F97316;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-fire: linear-gradient(135deg, #F97316 0%, #EF4444 50%, #EC4899 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); } 50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.8); } }

        .events-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
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

        .nav-links a:hover { color: var(--orange); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-fire);
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
          box-shadow: 0 10px 40px rgba(249, 115, 22, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%);
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
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--orange);
          margin-bottom: 2rem;
          animation: pulse 2s infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-fire);
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

        .live-banner {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(236, 72, 153, 0.2), rgba(249, 115, 22, 0.2));
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
          animation: glow 3s infinite;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--danger);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .live-badge::before {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--white);
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .live-info h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .live-info p {
          color: var(--light-gray);
        }

        .countdown-container {
          display: flex;
          gap: 1rem;
        }

        .countdown-item {
          text-align: center;
        }

        .countdown-value {
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 1.75rem;
          font-weight: 800;
          min-width: 60px;
          color: var(--orange);
        }

        .countdown-label {
          font-size: 0.75rem;
          color: var(--gray);
          margin-top: 4px;
        }

        .live-cta {
          background: var(--gradient-fire);
          color: var(--white);
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .live-cta:hover {
          transform: scale(1.05);
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
          border-color: var(--orange);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-fire);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--light-gray);
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
          background: rgba(249, 115, 22, 0.15);
          color: var(--orange);
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
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.launch::before { background: var(--gradient-fire); }
        .dist-card.trading::before { background: linear-gradient(90deg, var(--blue), var(--purple)); }
        .dist-card.staking::before { background: linear-gradient(90deg, var(--success), var(--cyan)); }
        .dist-card.community::before { background: linear-gradient(90deg, var(--pink), var(--purple)); }
        .dist-card.partner::before { background: var(--gradient-gold); }

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
          color: var(--orange);
          margin-bottom: 0.25rem;
        }

        .dist-percent {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .category-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .category-tab {
          padding: 12px 24px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: var(--light-gray);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-tab:hover {
          border-color: var(--orange);
          color: var(--orange);
        }

        .category-tab.active {
          background: var(--gradient-fire);
          border-color: transparent;
          color: var(--white);
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .event-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .event-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .event-card.featured {
          border-color: var(--orange);
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.2);
        }

        .event-card.featured::before {
          content: '🔥 HOT';
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--gradient-fire);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 10;
        }

        .event-image {
          height: 200px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .event-image.launch { background: linear-gradient(135deg, #F97316 0%, #EF4444 100%); }
        .event-image.trading { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); }
        .event-image.staking { background: linear-gradient(135deg, #22C55E 0%, #06B6D4 100%); }
        .event-image.community { background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); }
        .event-image.partner { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); }

        .event-icon {
          font-size: 4rem;
          margin-bottom: 0.5rem;
        }

        .event-status {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .event-status.live { background: var(--danger); }
        .event-status.upcoming { background: var(--warning); color: var(--dark); }

        .event-content {
          padding: 1.5rem;
        }

        .event-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .event-desc {
          color: var(--light-gray);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .event-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .event-reward {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--gold);
        }

        .event-date {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .event-btn {
          display: block;
          width: 100%;
          background: var(--gradient-fire);
          color: var(--white);
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s;
        }

        .event-btn:hover {
          transform: scale(1.02);
        }

        .event-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
        }

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
          margin-bottom: 2rem;
        }

        .leaderboard-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .leaderboard-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .lb-tab {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: var(--light-gray);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .lb-tab.active {
          background: var(--orange);
          border-color: var(--orange);
          color: var(--white);
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leaderboard-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .leaderboard-table th:first-child { border-radius: 12px 0 0 12px; }
        .leaderboard-table th:last-child { border-radius: 0 12px 12px 0; }

        .leaderboard-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .leaderboard-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .rank-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .rank-badge.gold { background: var(--gradient-gold); color: var(--dark); }
        .rank-badge.silver { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank-badge.bronze { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank-badge.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--gradient-fire);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .user-address {
          font-family: monospace;
          font-weight: 500;
        }

        .score-cell {
          font-weight: 700;
          color: var(--orange);
        }

        .reward-cell {
          font-weight: 700;
          color: var(--gold);
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
          color: var(--orange);
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
          background: var(--gradient-fire);
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
          background: var(--orange);
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
        .footer-links a:hover { color: var(--orange); }

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
          .events-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .events-grid { grid-template-columns: 1fr; }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .live-banner { flex-direction: column; text-align: center; }
          .countdown-container { justify-content: center; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="events-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a 
              href="#live-events"
              onClick={(e) => { e.preventDefault(); document.getElementById('live-events')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-live-events"
            >{t('events.nav.liveEvents')}</a>
            <a 
              href="#all-events"
              onClick={(e) => { e.preventDefault(); document.getElementById('all-events')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-all-events"
            >{t('events.nav.allEvents')}</a>
            <a 
              href="#leaderboard"
              onClick={(e) => { e.preventDefault(); document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-leaderboard"
            >{t('events.nav.leaderboard')}</a>
            <a 
              href="#faq"
              onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-faq"
            >{t('events.nav.faq')}</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleWalletClick}
            >
              {isConnected && address ? `🔗 ${formatAddress(address)}` : `🔗 ${t('events.nav.connectWallet')}`}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            🔥 {t('events.hero.badge')}
          </div>
          <h1>
            {t('events.hero.title')}<br />
            <span className="gradient-text">{t('events.hero.titleHighlight')}</span> {t('events.hero.titleSuffix')}
          </h1>
          <p className="hero-subtitle">
            {t('events.hero.subtitle')}
          </p>

          {/* Live Event Banner */}
          <div className="live-banner" id="live-events">
            <div>
              <div className="live-badge">{t('events.hero.liveBadge')}</div>
            </div>
            <div className="live-info">
              <h3>🚀 {t('events.hero.liveTitle')}</h3>
              <p>{t('events.hero.liveSubtitle')}</p>
            </div>
            <div className="countdown-container">
              <div className="countdown-item">
                <div className="countdown-value">{countdown.days}</div>
                <div className="countdown-label">{t('events.hero.countdown.days')}</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{countdown.hours}</div>
                <div className="countdown-label">{t('events.hero.countdown.hours')}</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{countdown.minutes}</div>
                <div className="countdown-label">{t('events.hero.countdown.minutes')}</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{countdown.seconds}</div>
                <div className="countdown-label">{t('events.hero.countdown.seconds')}</div>
              </div>
            </div>
            <button 
              className="live-cta" 
              data-testid="button-participate"
              onClick={() => handleParticipate('launch')}
            >
              {isConnected ? `➜ ${t('events.hero.participate')}` : `➜ ${t('events.hero.connectFirst')}`}
            </button>
          </div>

          <div className="stats-grid" data-testid="stats-grid">
            <div className="stat-card" data-testid="stat-total-events">
              <div className="stat-value">
                {isEventsLoading ? '...' : (apiStats.totalEvents > 0 ? apiStats.totalEvents.toLocaleString() : '12+')}
              </div>
              <div className="stat-label">{t('events.stats.totalEvents')}</div>
            </div>
            <div className="stat-card" data-testid="stat-active-events">
              <div className="stat-value">
                {isEventsLoading ? '...' : (apiStats.activeEvents > 0 ? apiStats.activeEvents.toLocaleString() : '6')}
              </div>
              <div className="stat-label">{t('events.stats.activeEvents')}</div>
            </div>
            <div className="stat-card" data-testid="stat-total-participants">
              <div className="stat-value">
                {isEventsLoading ? '...' : (apiStats.totalParticipants > 0 ? apiStats.totalParticipants.toLocaleString() : '0')}
              </div>
              <div className="stat-label">{t('events.stats.totalParticipants')}</div>
            </div>
            <div className="stat-card" data-testid="stat-rewards-distributed">
              <div className="stat-value">
                {isEventsLoading ? '...' : (Number(apiStats.totalRewardsDistributed) > 0 ? Number(apiStats.totalRewardsDistributed).toLocaleString() : '400M')}
              </div>
              <div className="stat-label">{t('events.stats.totalRewards')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">{t('events.distribution.badge')}</span>
          <h2 className="section-title">{t('events.distribution.title')}</h2>
          <p className="section-subtitle">{t('events.distribution.subtitle')}</p>
        </div>

        <div className="distribution-grid">
          <div className="dist-card launch" data-testid="dist-launch">
            <div className="dist-icon">🚀</div>
            <div className="dist-name">{t('events.distribution.launch.name')}</div>
            <div className="dist-amount">{t('events.distribution.launch.amount')}</div>
            <div className="dist-percent">{t('events.distribution.launch.percent')}</div>
          </div>
          <div className="dist-card trading" data-testid="dist-trading">
            <div className="dist-icon">📊</div>
            <div className="dist-name">{t('events.distribution.trading.name')}</div>
            <div className="dist-amount">{t('events.distribution.trading.amount')}</div>
            <div className="dist-percent">{t('events.distribution.trading.percent')}</div>
          </div>
          <div className="dist-card staking" data-testid="dist-staking">
            <div className="dist-icon">💎</div>
            <div className="dist-name">{t('events.distribution.staking.name')}</div>
            <div className="dist-amount">{t('events.distribution.staking.amount')}</div>
            <div className="dist-percent">{t('events.distribution.staking.percent')}</div>
          </div>
          <div className="dist-card community" data-testid="dist-community">
            <div className="dist-icon">👥</div>
            <div className="dist-name">{t('events.distribution.community.name')}</div>
            <div className="dist-amount">{t('events.distribution.community.amount')}</div>
            <div className="dist-percent">{t('events.distribution.community.percent')}</div>
          </div>
          <div className="dist-card partner" data-testid="dist-partner">
            <div className="dist-icon">🤝</div>
            <div className="dist-name">{t('events.distribution.partner.name')}</div>
            <div className="dist-amount">{t('events.distribution.partner.amount')}</div>
            <div className="dist-percent">{t('events.distribution.partner.percent')}</div>
          </div>
        </div>
      </section>

      {/* All Events Section */}
      <section className="section" id="all-events" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('events.upcoming.badge')}</span>
          <h2 className="section-title">{t('events.upcoming.title')}</h2>
          <p className="section-subtitle">{t('events.upcoming.subtitle')}</p>
        </div>

        <div className="category-tabs">
          <button 
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('all'); toast({ title: t('events.upcoming.categoryToasts.all.title'), description: t('events.upcoming.categoryToasts.all.desc') }); }}
            data-testid="category-all"
          >
            {t('events.upcoming.categories.all')}
          </button>
          <button 
            className={`category-tab ${activeCategory === 'live' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('live'); toast({ title: t('events.upcoming.categoryToasts.live.title'), description: t('events.upcoming.categoryToasts.live.desc') }); }}
            data-testid="category-live"
          >
            {t('events.upcoming.categories.live')}
          </button>
          <button 
            className={`category-tab ${activeCategory === 'launch' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('launch'); toast({ title: t('events.upcoming.categoryToasts.launch.title'), description: t('events.upcoming.categoryToasts.launch.desc') }); }}
            data-testid="category-launch"
          >
            {t('events.upcoming.categories.launch')}
          </button>
          <button 
            className={`category-tab ${activeCategory === 'trading' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('trading'); toast({ title: t('events.upcoming.categoryToasts.trading.title'), description: t('events.upcoming.categoryToasts.trading.desc') }); }}
            data-testid="category-trading"
          >
            {t('events.upcoming.categories.trading')}
          </button>
          <button 
            className={`category-tab ${activeCategory === 'staking' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('staking'); toast({ title: t('events.upcoming.categoryToasts.staking.title'), description: t('events.upcoming.categoryToasts.staking.desc') }); }}
            data-testid="category-staking"
          >
            {t('events.upcoming.categories.staking')}
          </button>
          <button 
            className={`category-tab ${activeCategory === 'community' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('community'); toast({ title: t('events.upcoming.categoryToasts.community.title'), description: t('events.upcoming.categoryToasts.community.desc') }); }}
            data-testid="category-community"
          >
            {t('events.upcoming.categories.community')}
          </button>
        </div>

        <div className="events-grid" data-testid="events-grid">
          {isEventsLoading ? (
            <div className="stat-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }} data-testid="events-loading">
              <div className="stat-value">{t('events.upcoming.loading')}</div>
              <div className="stat-label">{t('events.upcoming.loadingDesc')}</div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="stat-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }} data-testid="events-empty">
              <div className="stat-value">{t('events.upcoming.noEvents')}</div>
              <div className="stat-label">{t('events.upcoming.noEventsDesc')}</div>
            </div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className={`event-card ${event.featured ? 'featured' : ''}`} data-testid={`event-card-${event.id}`}>
                <div className={`event-image ${event.category.split(' ')[0]}`}>
                  <div className="event-icon">{event.icon}</div>
                  <span className={`event-status ${event.statusClass}`} data-testid={`event-status-${event.id}`}>{event.status}</span>
                </div>
                <div className="event-content">
                  <h3 className="event-title" data-testid={`event-title-${event.id}`}>{event.title}</h3>
                  <p className="event-desc" data-testid={`event-desc-${event.id}`}>{event.desc}</p>
                  <div className="event-meta">
                    <div className="event-reward" data-testid={`event-reward-${event.id}`}>
                      🪙 <span>{event.reward} TBURN</span>
                    </div>
                    <span className="event-date" data-testid={`event-date-${event.id}`}>{event.date}</span>
                  </div>
                  <button 
                    className={`event-btn ${event.statusClass === 'upcoming' ? 'secondary' : ''}`}
                    onClick={() => handleParticipate(event.id)}
                    data-testid={`button-event-participate-${event.id}`}
                  >
                    {event.statusClass === 'upcoming' ? t('events.upcoming.buttons.comingSoon') : (isConnected ? t('events.upcoming.buttons.participate') : t('events.upcoming.buttons.connectWallet'))}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="section" id="leaderboard">
        <div className="section-header">
          <span className="section-badge">{t('events.leaderboard.badge')}</span>
          <h2 className="section-title">{t('events.leaderboard.title')}</h2>
          <p className="section-subtitle">{t('events.leaderboard.subtitle')}</p>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h3>🏆 {t('events.leaderboard.topTitle')}</h3>
            <div className="leaderboard-tabs">
              <button 
                className="lb-tab active" 
                data-testid="lb-tab-all"
                onClick={() => toast({ title: t('events.leaderboard.tabToasts.all.title'), description: t('events.leaderboard.tabToasts.all.desc') })}
              >{t('events.leaderboard.tabs.all')}</button>
              <button 
                className="lb-tab" 
                data-testid="lb-tab-today"
                onClick={() => toast({ title: t('events.leaderboard.tabToasts.today.title'), description: t('events.leaderboard.tabToasts.today.desc') })}
              >{t('events.leaderboard.tabs.today')}</button>
              <button 
                className="lb-tab" 
                data-testid="lb-tab-week"
                onClick={() => toast({ title: t('events.leaderboard.tabToasts.week.title'), description: t('events.leaderboard.tabToasts.week.desc') })}
              >{t('events.leaderboard.tabs.week')}</button>
            </div>
          </div>

          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>{t('events.leaderboard.table.rank')}</th>
                <th>{t('events.leaderboard.table.participant')}</th>
                <th>{t('events.leaderboard.table.missions')}</th>
                <th>{t('events.leaderboard.table.score')}</th>
                <th>{t('events.leaderboard.table.reward')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { rank: 1, badge: "gold", initials: "TB", address: "0x1a2B...3c4D", missions: "12/12", score: "98,500", reward: "50,000" },
                { rank: 2, badge: "silver", initials: "CK", address: "0x5e6F...7g8H", missions: "12/12", score: "87,200", reward: "30,000" },
                { rank: 3, badge: "bronze", initials: "MJ", address: "0x9i0J...1k2L", missions: "11/12", score: "76,800", reward: "20,000" },
                { rank: 4, badge: "normal", initials: "AS", address: "0x3m4N...5o6P", missions: "11/12", score: "65,400", reward: "10,000" },
                { rank: 5, badge: "normal", initials: "KL", address: "0x7q8R...9s0T", missions: "10/12", score: "54,200", reward: "10,000" },
              ].map(row => (
                <tr key={row.rank}>
                  <td><div className={`rank-badge ${row.badge}`}>{row.rank}</div></td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{row.initials}</div>
                      <span className="user-address">{row.address}</span>
                    </div>
                  </td>
                  <td>{row.missions}</td>
                  <td className="score-cell">{row.score}</td>
                  <td className="reward-cell">{row.reward} TBURN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">{t('events.faq.badge')}</span>
          <h2 className="section-title">{t('events.faq.title')}</h2>
          <p className="section-subtitle">{t('events.faq.subtitle')}</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>{t('events.faq.items.q1.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('events.faq.items.q1.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>{t('events.faq.items.q2.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('events.faq.items.q2.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>{t('events.faq.items.q3.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('events.faq.items.q3.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>{t('events.faq.items.q4.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('events.faq.items.q4.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>{t('events.faq.items.q5.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('events.faq.items.q5.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>{t('events.faq.items.q6.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('events.faq.items.q6.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>{t('events.faq.items.q7.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('events.faq.items.q7.answer')}</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>{t('events.faq.items.q8.question')}</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>{t('events.faq.items.q8.answer')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-testid="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('events.cta.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t('events.cta.subtitle')}<br />
            {t('events.cta.subtitleHighlight')}
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--orange)', fontSize: '1.25rem', padding: '20px 50px' }}
            onClick={handleWalletClick}
            data-testid="button-cta-participate"
          >
            {isConnected ? `🚀 ${t('events.cta.buttonParticipate')}` : `🔗 ${t('events.cta.buttonConnect')}`}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>{t('events.footer.description')}</p>
            <div className="social-links">
              <a 
                href="https://twitter.com/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                data-testid="link-twitter"
              >𝕏</a>
              <a 
                href="https://t.me/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Telegram"
                data-testid="link-telegram"
              >✈</a>
              <a 
                href="https://discord.gg/tburn" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Discord"
                data-testid="link-discord"
              >💬</a>
              <a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                data-testid="link-github"
              >⌘</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>{t('events.footer.quickLinks')}</h4>
            <ul>
              <li><Link href="/">{t('events.footer.explorer')}</Link></li>
              <li><Link href="/app/wallet">{t('events.footer.wallet')}</Link></li>
              <li><Link href="/app/bridge">{t('events.footer.bridge')}</Link></li>
              <li><Link href="/app/staking">{t('events.footer.staking')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('events.footer.developers')}</h4>
            <ul>
              <li><Link href="/developers/docs" data-testid="footer-link-docs">{t('events.footer.docs')}</Link></li>
              <li><Link href="/developers/api" data-testid="footer-link-api">{t('events.footer.api')}</Link></li>
              <li><a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="footer-link-github"
              >{t('events.footer.github')}</a></li>
              <li><Link href="/developers/sdk" data-testid="footer-link-sdk">{t('events.footer.sdk')}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('events.footer.resources')}</h4>
            <ul>
              <li><Link href="/learn/whitepaper" data-testid="footer-link-whitepaper">{t('events.footer.whitepaper')}</Link></li>
              <li><Link href="/tokenomics" data-testid="footer-link-tokenomics">{t('events.footer.tokenomics')}</Link></li>
              <li><Link href="/roadmap" data-testid="footer-link-roadmap">{t('events.footer.roadmap')}</Link></li>
              <li><Link href="/learn/faq" data-testid="footer-link-faq">{t('events.footer.faqLink')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('events.footer.copyright')}</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }}>{t('events.footer.termsOfService')}</Link>
            <Link href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }}>{t('events.footer.privacyPolicy')}</Link>
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
