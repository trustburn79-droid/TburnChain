import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [countdown, setCountdown] = useState({ days: 14, hours: 23, minutes: 59, seconds: 59 });
  
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
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
        title: "등록 완료!",
        description: data.data?.message || "이벤트에 성공적으로 등록되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/token-programs/events/list'] });
      setRegistering(null);
    },
    onError: (error: any) => {
      toast({
        title: "등록 실패",
        description: error.message || "이벤트 등록에 실패했습니다.",
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

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect("metamask");
    }
  };

  const handleParticipate = async (eventId: string) => {
    if (!isConnected) {
      await connect("metamask");
      return;
    }
    if (!address) {
      toast({
        title: "지갑 연결 필요",
        description: "이벤트에 참여하려면 지갑을 연결해주세요.",
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
    { id: "launch", category: "launch live", icon: "🚀", status: "진행중", statusClass: "live", title: "메인넷 런칭 그랜드 이벤트", desc: "TBURN Chain 메인넷 런칭을 기념하는 최대 규모 이벤트! 참여만 해도 보상 획득", reward: "5,000만", date: "~2026.01.31", featured: true },
    { id: "trading", category: "trading live", icon: "📊", status: "진행중", statusClass: "live", title: "트레이딩 대회 시즌 1", desc: "거래량 TOP 100에게 총 2,000만 TBURN 배분! 수익률 경쟁도 진행", reward: "2,000만", date: "~2026.02.28", featured: false },
    { id: "staking", category: "staking live", icon: "💎", status: "진행중", statusClass: "live", title: "스테이킹 부스트 이벤트", desc: "첫 30일 스테이킹 APY 2배! 얼리 스테이커 특별 보너스", reward: "3,000만", date: "~2026.02.15", featured: false },
    { id: "meme", category: "community", icon: "👥", status: "예정", statusClass: "upcoming", title: "밈 콘테스트", desc: "TBURN 관련 최고의 밈을 만들어주세요! 커뮤니티 투표로 수상작 선정", reward: "500만", date: "2026.01.15~", featured: false },
    { id: "quiz", category: "community live", icon: "🧠", status: "진행중", statusClass: "live", title: "TBURN 퀴즈 챌린지", desc: "TBURN Chain에 대한 퀴즈를 풀고 보상을 받으세요! 매일 새로운 문제", reward: "1,000만", date: "상시 진행", featured: false },
    { id: "dex", category: "partner", icon: "🤝", status: "예정", statusClass: "upcoming", title: "DEX 런칭 기념 이벤트", desc: "TBURN DEX 런칭 기념! 유동성 공급자 특별 보상", reward: "2,000만", date: "2026.02.01~", featured: false },
  ];

  const apiActiveEvents = (Array.isArray(apiData?.activeEvents) ? apiData.activeEvents : []).map((e: ApiEvent) => ({
    id: e.id,
    category: e.category || "live",
    icon: e.icon || "🎯",
    status: "진행중",
    statusClass: "live",
    title: e.name,
    desc: e.description,
    reward: Number(e.rewardPool).toLocaleString(),
    date: `~${new Date(e.endDate).toLocaleDateString('ko-KR')}`,
    featured: false,
  })) || [];

  const apiUpcomingEvents = (Array.isArray(apiData?.upcomingEvents) ? apiData.upcomingEvents : []).map((e: ApiEvent) => ({
    id: e.id,
    category: e.category || "upcoming",
    icon: e.icon || "📅",
    status: "예정",
    statusClass: "upcoming",
    title: e.name,
    desc: e.description,
    reward: Number(e.rewardPool).toLocaleString(),
    date: `${new Date(e.startDate).toLocaleDateString('ko-KR')}~`,
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

        .nav-links a:hover { color: var(--orange); }

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
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a 
              href="#live-events"
              onClick={(e) => { e.preventDefault(); document.getElementById('live-events')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-live-events"
            >진행중 이벤트</a>
            <a 
              href="#all-events"
              onClick={(e) => { e.preventDefault(); document.getElementById('all-events')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-all-events"
            >전체 이벤트</a>
            <a 
              href="#leaderboard"
              onClick={(e) => { e.preventDefault(); document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-leaderboard"
            >리더보드</a>
            <a 
              href="#faq"
              onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}
              data-testid="nav-faq"
            >FAQ</a>
          </nav>
          <button 
            className="connect-btn" 
            data-testid="button-connect-wallet"
            onClick={handleWalletClick}
          >
            {isConnected && address ? `🔗 ${formatAddress(address)}` : '🔗 지갑 연결'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            🔥 EVENT CENTER - 다양한 이벤트 진행 중
          </div>
          <h1>
            참여하고 받아가세요!<br />
            <span className="gradient-text">4억 TBURN</span> 이벤트 보상
          </h1>
          <p className="hero-subtitle">
            런칭 이벤트, 트레이딩 대회, 스테이킹 부스트, 커뮤니티 챌린지 등
            다양한 이벤트에 참여하고 푸짐한 보상을 받아가세요!
          </p>

          {/* Live Event Banner */}
          <div className="live-banner" id="live-events">
            <div>
              <div className="live-badge">LIVE</div>
            </div>
            <div className="live-info">
              <h3>🚀 메인넷 런칭 그랜드 이벤트</h3>
              <p>지금 참여하면 최대 10,000 TBURN 획득!</p>
            </div>
            <div className="countdown-container">
              <div className="countdown-item">
                <div className="countdown-value">{countdown.days}</div>
                <div className="countdown-label">일</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{countdown.hours}</div>
                <div className="countdown-label">시간</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{countdown.minutes}</div>
                <div className="countdown-label">분</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{countdown.seconds}</div>
                <div className="countdown-label">초</div>
              </div>
            </div>
            <button 
              className="live-cta" 
              data-testid="button-participate"
              onClick={() => handleParticipate('launch')}
            >
              {isConnected ? '➜ 참여하기' : '➜ 지갑 연결'}
            </button>
          </div>

          <div className="stats-grid" data-testid="stats-grid">
            <div className="stat-card" data-testid="stat-total-events">
              <div className="stat-value">
                {isEventsLoading ? '...' : (apiStats.totalEvents > 0 ? apiStats.totalEvents.toLocaleString() : '12+')}
              </div>
              <div className="stat-label">총 이벤트 수</div>
            </div>
            <div className="stat-card" data-testid="stat-active-events">
              <div className="stat-value">
                {isEventsLoading ? '...' : (apiStats.activeEvents > 0 ? apiStats.activeEvents.toLocaleString() : '6')}
              </div>
              <div className="stat-label">진행중 이벤트</div>
            </div>
            <div className="stat-card" data-testid="stat-total-participants">
              <div className="stat-value">
                {isEventsLoading ? '...' : (apiStats.totalParticipants > 0 ? apiStats.totalParticipants.toLocaleString() : '0')}
              </div>
              <div className="stat-label">총 참여자</div>
            </div>
            <div className="stat-card" data-testid="stat-rewards-distributed">
              <div className="stat-value">
                {isEventsLoading ? '...' : (Number(apiStats.totalRewardsDistributed) > 0 ? Number(apiStats.totalRewardsDistributed).toLocaleString() : '4억')}
              </div>
              <div className="stat-label">총 보상 풀</div>
            </div>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">이벤트 보상 배분</h2>
          <p className="section-subtitle">4억 TBURN이 5가지 이벤트 카테고리로 배분됩니다</p>
        </div>

        <div className="distribution-grid">
          <div className="dist-card launch" data-testid="dist-launch">
            <div className="dist-icon">🚀</div>
            <div className="dist-name">런칭 이벤트</div>
            <div className="dist-amount">1억</div>
            <div className="dist-percent">25%</div>
          </div>
          <div className="dist-card trading" data-testid="dist-trading">
            <div className="dist-icon">📊</div>
            <div className="dist-name">트레이딩 대회</div>
            <div className="dist-amount">1억</div>
            <div className="dist-percent">25%</div>
          </div>
          <div className="dist-card staking" data-testid="dist-staking">
            <div className="dist-icon">💎</div>
            <div className="dist-name">스테이킹 부스트</div>
            <div className="dist-amount">8,000만</div>
            <div className="dist-percent">20%</div>
          </div>
          <div className="dist-card community" data-testid="dist-community">
            <div className="dist-icon">👥</div>
            <div className="dist-name">커뮤니티 챌린지</div>
            <div className="dist-amount">6,000만</div>
            <div className="dist-percent">15%</div>
          </div>
          <div className="dist-card partner" data-testid="dist-partner">
            <div className="dist-icon">🤝</div>
            <div className="dist-name">파트너십 & 시즌</div>
            <div className="dist-amount">6,000만</div>
            <div className="dist-percent">15%</div>
          </div>
        </div>
      </section>

      {/* All Events Section */}
      <section className="section" id="all-events" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">ALL EVENTS</span>
          <h2 className="section-title">이벤트 목록</h2>
          <p className="section-subtitle">현재 진행 중이거나 예정된 이벤트를 확인하세요</p>
        </div>

        <div className="category-tabs">
          <button 
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('all'); toast({ title: "전체 이벤트", description: "모든 이벤트를 표시합니다." }); }}
            data-testid="category-all"
          >
            전체
          </button>
          <button 
            className={`category-tab ${activeCategory === 'live' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('live'); toast({ title: "진행중 이벤트", description: "현재 진행 중인 이벤트를 표시합니다." }); }}
            data-testid="category-live"
          >
            진행중
          </button>
          <button 
            className={`category-tab ${activeCategory === 'launch' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('launch'); toast({ title: "런칭 이벤트", description: "메인넷 런칭 관련 이벤트를 표시합니다." }); }}
            data-testid="category-launch"
          >
            런칭
          </button>
          <button 
            className={`category-tab ${activeCategory === 'trading' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('trading'); toast({ title: "트레이딩 대회", description: "트레이딩 관련 이벤트를 표시합니다." }); }}
            data-testid="category-trading"
          >
            트레이딩
          </button>
          <button 
            className={`category-tab ${activeCategory === 'staking' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('staking'); toast({ title: "스테이킹 이벤트", description: "스테이킹 관련 이벤트를 표시합니다." }); }}
            data-testid="category-staking"
          >
            스테이킹
          </button>
          <button 
            className={`category-tab ${activeCategory === 'community' ? 'active' : ''}`} 
            onClick={() => { setActiveCategory('community'); toast({ title: "커뮤니티 이벤트", description: "커뮤니티 참여 이벤트를 표시합니다." }); }}
            data-testid="category-community"
          >
            커뮤니티
          </button>
        </div>

        <div className="events-grid" data-testid="events-grid">
          {isEventsLoading ? (
            <div className="stat-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }} data-testid="events-loading">
              <div className="stat-value">Loading...</div>
              <div className="stat-label">이벤트 데이터를 불러오는 중...</div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="stat-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }} data-testid="events-empty">
              <div className="stat-value">No Events</div>
              <div className="stat-label">해당 카테고리에 이벤트가 없습니다</div>
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
                    {event.statusClass === 'upcoming' ? '곧 시작' : (isConnected ? '참여하기' : '지갑 연결')}
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
          <span className="section-badge">LEADERBOARD</span>
          <h2 className="section-title">이벤트 리더보드</h2>
          <p className="section-subtitle">상위 참여자들의 실적을 확인하세요</p>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h3>🏆 런칭 이벤트 TOP 10</h3>
            <div className="leaderboard-tabs">
              <button 
                className="lb-tab active" 
                data-testid="lb-tab-all"
                onClick={() => toast({ title: "전체 기간", description: "전체 기간 순위를 표시합니다." })}
              >전체</button>
              <button 
                className="lb-tab" 
                data-testid="lb-tab-today"
                onClick={() => toast({ title: "오늘", description: "오늘 순위를 표시합니다. (Coming Soon)" })}
              >오늘</button>
              <button 
                className="lb-tab" 
                data-testid="lb-tab-week"
                onClick={() => toast({ title: "이번 주", description: "이번 주 순위를 표시합니다. (Coming Soon)" })}
              >이번 주</button>
            </div>
          </div>

          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>참여자</th>
                <th>완료 미션</th>
                <th>점수</th>
                <th>예상 보상</th>
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
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">이벤트 관련 궁금한 점을 확인하세요</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>이벤트 보상 총 물량은 얼마인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>이벤트 보상 총 풀은 <strong>4억 TBURN</strong>입니다. 이는 전체 공급량 100억 TBURN의 4%에 해당합니다. 5개 카테고리로 배분됩니다: 런칭 이벤트(1억, 25%), 트레이딩 대회(1억, 25%), 스테이킹 부스트(8,000만, 20%), 커뮤니티 챌린지(6,000만, 15%), 파트너십(6,000만, 15%).</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>이벤트 참여 자격이 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>지갑을 연결한 모든 사용자가 참여할 수 있습니다. 지원 지갑: MetaMask, Rabby, Trust Wallet, Coinbase Wallet, Ledger. 일부 이벤트는 KYC 인증 또는 특정 조건(예: 최소 스테이킹 수량, TBURN 보유량)이 필요할 수 있습니다. 각 이벤트 카드에서 참여 조건을 확인하세요.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>보상은 언제 지급되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>대부분의 이벤트 보상은 <strong>이벤트 종료 후 7일 이내</strong>에 지급됩니다. 상시 진행 이벤트(퀴즈 챌린지 등)는 매주 월요일 UTC 00:00에 지급됩니다. 트레이딩 대회 보상은 최종 순위 확정 후 3일 이내에 지급됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>여러 이벤트에 동시 참여가 가능한가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>네, 동시에 진행 중인 <strong>모든 이벤트에 참여 가능</strong>합니다. 예를 들어, 런칭 이벤트 미션을 완료하면서 동시에 스테이킹 부스트 이벤트에 참여하고, 퀴즈 챌린지도 풀 수 있습니다. 더 많은 이벤트에 참여할수록 더 많은 보상을 받을 수 있습니다!</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>트레이딩 대회 순위는 어떻게 결정되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>트레이딩 대회는 두 가지 기준으로 순위가 결정됩니다: <strong>1) 거래량 순위</strong> - 대회 기간 동안의 총 거래량(USD) 기준, <strong>2) 수익률 순위</strong> - 기간 동안의 포트폴리오 수익률(%) 기준. 각 순위별로 별도의 보상 풀이 할당되어 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>스테이킹 부스트 이벤트의 APY는 어떻게 계산되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>스테이킹 부스트 이벤트 기간(첫 30일) 동안 <strong>기본 APY의 2배</strong>가 적용됩니다. 예: 기본 APY 15% → 부스트 기간 30%. 추가로 1,000 TBURN 이상 스테이킹 시 +5% 보너스, 10,000 TBURN 이상 시 +10% 보너스가 적용됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>밈 콘테스트 수상작은 어떻게 선정되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>밈 콘테스트는 2단계로 진행됩니다: <strong>1) 커뮤니티 투표</strong> - Discord/Telegram에서 좋아요 및 반응으로 상위 20개 작품 선정, <strong>2) 심사위원 평가</strong> - 창의성, 관련성, 바이럴 잠재력을 기준으로 최종 수상작 선정. 대상 1명, 금상 3명, 은상 5명, 동상 11명 시상.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>이벤트 참여 시 부정행위가 있으면 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>봇 사용, 다중 계정, 워시 트레이딩 등 부정행위가 감지되면 해당 계정의 <strong>모든 이벤트 보상이 몰수</strong>되고 향후 모든 이벤트에서 영구 제외됩니다. AI 기반 사기 탐지 시스템이 24시간 모니터링하며, 의심 활동 시 보상 지급이 보류될 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-testid="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>지금 이벤트에 참여하세요!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            다양한 이벤트에 참여하고 최대 4억 TBURN 보상을 받아가세요.<br />
            빠른 참여 = 더 많은 보상!
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--orange)', fontSize: '1.25rem', padding: '20px 50px' }}
            onClick={handleWalletClick}
            data-testid="button-cta-participate"
          >
            {isConnected ? '🚀 지금 참여하기' : '🔗 지갑 연결하고 시작하기'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>AI의 지능, 블록체인의 투명성<br />THE FUTURE IS NOW</p>
            <div className="social-links">
              <a 
                href="https://twitter.com/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                onClick={() => toast({ title: "Twitter", description: "TBURN Chain Twitter 페이지로 이동합니다." })}
                data-testid="link-twitter"
              >𝕏</a>
              <a 
                href="https://t.me/tburnchain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Telegram"
                onClick={() => toast({ title: "Telegram", description: "TBURN Chain Telegram 채널로 이동합니다." })}
                data-testid="link-telegram"
              >✈</a>
              <a 
                href="https://discord.gg/tburn" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Discord"
                onClick={() => toast({ title: "Discord", description: "TBURN Chain Discord 서버로 이동합니다." })}
                data-testid="link-discord"
              >💬</a>
              <a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                onClick={() => toast({ title: "GitHub", description: "TBURN Chain GitHub으로 이동합니다." })}
                data-testid="link-github"
              >⌘</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li><Link href="/">메인넷</Link></li>
              <li><Link href="/scan">익스플로러</Link></li>
              <li><Link href="/app/bridge">브릿지</Link></li>
              <li><Link href="/app/staking">스테이킹</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><Link href="/learn/whitepaper" data-testid="footer-link-whitepaper">백서</Link></li>
              <li><Link href="/developers/docs" data-testid="footer-link-docs">문서</Link></li>
              <li><a 
                href="https://github.com/tburn-chain" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => toast({ title: "GitHub", description: "TBURN Chain GitHub으로 이동합니다." })}
                data-testid="footer-link-github"
              >GitHub</a></li>
              <li><Link href="/security-audit" data-testid="footer-link-audit">감사 보고서</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><Link href="/community/news" data-testid="footer-link-blog">블로그</Link></li>
              <li><Link href="/ambassador" data-testid="footer-link-ambassador">앰배서더</Link></li>
              <li><Link href="/grants" data-testid="footer-link-grants">그랜트</Link></li>
              <li><Link href="/qna" data-testid="footer-link-support">고객지원</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }}>이용약관</Link>
            <Link href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }}>개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
