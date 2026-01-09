import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
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
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const { toast } = useToast();

  const { data: response, isLoading } = useQuery<CommunityStatsResponse>({
    queryKey: ['/api/token-programs/community/stats'],
  });
  const stats = response?.data;

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
      toast({ title: "지갑 연결 해제", description: "지갑 연결이 해제되었습니다." });
    } else {
      await connect("metamask");
      toast({ title: "지갑 연결", description: "MetaMask 지갑이 연결되었습니다." });
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
      connect("metamask");
      toast({ title: "지갑 연결 필요", description: "프로그램에 신청하려면 먼저 지갑을 연결해주세요." });
      return;
    }
    toast({ 
      title: "신청 접수 완료", 
      description: `${programTitle} 프로그램에 신청되었습니다. 검토 후 결과를 안내드리겠습니다.` 
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    toast({ title: platform, description: `${platform} 페이지로 이동합니다.` });
  };

  const programs = [
    { id: "ambassador", icon: "🌟", title: "앰배서더 프로그램", subtitle: "TBURN Chain의 공식 대표", reward: "최대 5,000 TBURN/월", featured: true, benefits: ["공식 앰배서더 뱃지 및 NFT", "월간 보상 + 성과 보너스", "전용 Discord 채널 접근", "오프라인 이벤트 초대"], requirements: "SNS 팔로워 1,000명 이상, 암호화폐 관련 활동 경험" },
    { id: "creator", icon: "🎨", title: "콘텐츠 크리에이터", subtitle: "교육 & 홍보 콘텐츠 제작", reward: "콘텐츠당 100~1,000 TBURN", featured: true, benefits: ["동영상/블로그/인포그래픽 보상", "콘텐츠 제작 도구 지원", "공식 채널 홍보 기회", "창작자 전용 이벤트"], requirements: "포트폴리오 제출 필수" },
    { id: "moderator", icon: "🛡️", title: "커뮤니티 모더레이터", subtitle: "커뮤니티 관리 및 지원", reward: "최대 2,000 TBURN/월", featured: false, benefits: ["Discord/Telegram 모더레이터 권한", "월간 고정 보상", "커뮤니티 성장 보너스", "내부 정보 사전 공유"], requirements: "주 20시간 이상 활동 가능" },
    { id: "educator", icon: "📚", title: "교육 전문가", subtitle: "블록체인 교육 & 튜토리얼", reward: "강의당 500~2,000 TBURN", featured: false, benefits: ["온라인 강의 제작 보상", "교육 자료 제작 지원", "TBURN Academy 강사 인증", "교육 플랫폼 파트너십"], requirements: "블록체인/개발 관련 전문 지식" },
    { id: "translator", icon: "🌍", title: "번역가 프로그램", subtitle: "다국어 지원 및 현지화", reward: "문서당 200~800 TBURN", featured: false, benefits: ["공식 문서 번역 보상", "커뮤니티 현지화 지원", "번역가 인증 배지", "언어별 커뮤니티 리드 기회"], requirements: "영어 + 1개 이상 언어 능통" },
    { id: "bounty", icon: "🏆", title: "버그 바운티 헌터", subtitle: "보안 취약점 발견 & 보고", reward: "건당 최대 50,000 TBURN", featured: false, benefits: ["취약점 심각도별 보상", "명예의 전당 등재", "보안 전문가 네트워크 참여", "화이트햇 인증서"], requirements: "보안 관련 기술 지식 필수" },
  ];

  const tiers = [
    { id: "newcomer", icon: "🌱", name: "뉴커머", points: "0~499 포인트", multiplier: "1x 보상", tierClass: "newcomer" },
    { id: "contributor", icon: "🌿", name: "컨트리뷰터", points: "500~1,999 포인트", multiplier: "1.2x 보상", tierClass: "contributor" },
    { id: "advocate", icon: "💠", name: "애드보킷", points: "2,000~4,999 포인트", multiplier: "1.5x 보상", tierClass: "advocate" },
    { id: "champion", icon: "👑", name: "챔피언", points: "5,000~9,999 포인트", multiplier: "2x 보상", tierClass: "champion" },
    { id: "legend", icon: "⭐", name: "레전드", points: "10,000+ 포인트", multiplier: "3x 보상", tierClass: "legend" },
  ];

  const activities = [
    { icon: "📝", type: "content", name: "블로그 포스팅", category: "콘텐츠", points: "+50~200", reward: "50~200 TBURN", frequency: "weekly" },
    { icon: "🎬", type: "content", name: "유튜브 영상 제작", category: "콘텐츠", points: "+100~500", reward: "100~500 TBURN", frequency: "monthly" },
    { icon: "🐦", type: "social", name: "트윗/리트윗", category: "소셜", points: "+10~50", reward: "10~50 TBURN", frequency: "daily" },
    { icon: "💬", type: "support", name: "커뮤니티 질문 답변", category: "서포트", points: "+20~100", reward: "20~100 TBURN", frequency: "daily" },
    { icon: "📖", type: "education", name: "튜토리얼 제작", category: "교육", points: "+200~500", reward: "200~500 TBURN", frequency: "once" },
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

        .program-card.featured::after {
          content: '⭐ 인기';
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
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a 
              href="#programs"
              onClick={(e) => { e.preventDefault(); scrollToSection('programs'); }}
              data-testid="nav-programs"
            >프로그램</a>
            <a 
              href="#tiers"
              onClick={(e) => { e.preventDefault(); scrollToSection('tiers'); }}
              data-testid="nav-tiers"
            >등급 시스템</a>
            <a 
              href="#activities"
              onClick={(e) => { e.preventDefault(); scrollToSection('activities'); }}
              data-testid="nav-activities"
            >활동 보상</a>
            <a 
              href="#leaderboard"
              onClick={(e) => { e.preventDefault(); scrollToSection('leaderboard'); }}
              data-testid="nav-leaderboard"
            >리더보드</a>
            <a 
              href="#faq"
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="nav-faq"
            >FAQ</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              data-testid="button-connect-wallet"
              onClick={handleWalletClick}
            >
              {isConnected && address ? `🔗 ${formatAddress(address)}` : '🔗 지갑 연결'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            👋 COMMUNITY PROGRAM - 함께 성장하는 TBURN
          </div>
          <h1>
            커뮤니티와 함께 만드는<br />
            <span className="gradient-text">3억 TBURN</span> 보상 프로그램
          </h1>
          <p className="hero-subtitle">
            앰배서더, 콘텐츠 크리에이터, 모더레이터, 번역가로 활동하고
            TBURN 생태계 성장에 기여하며 푸짐한 보상을 받아가세요!
          </p>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-contributors">
              <div className="stat-value">{isLoading ? '...' : stats?.totalContributors?.toLocaleString() || '0'}</div>
              <div className="stat-label">총 참여자 수</div>
            </div>
            <div className="stat-card" data-testid="stat-total-contributions">
              <div className="stat-value">{isLoading ? '...' : stats?.totalContributions?.toLocaleString() || '0'}</div>
              <div className="stat-label">총 기여 횟수</div>
            </div>
            <div className="stat-card" data-testid="stat-total-rewards">
              <div className="stat-value">{isLoading ? '...' : Number(stats?.totalRewardsDistributed || 0).toLocaleString()}</div>
              <div className="stat-label">배포된 보상 (TBURN)</div>
            </div>
            <div className="stat-card" data-testid="stat-active-tasks">
              <div className="stat-value">{isLoading ? '...' : stats?.activeTasks || '0'}</div>
              <div className="stat-label">활성 태스크</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply"
              onClick={() => { scrollToSection('programs'); toast({ title: "프로그램 선택", description: "아래에서 참여할 프로그램을 선택하세요." }); }}
            >
              지금 신청하기
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-guide"
              onClick={() => { scrollToSection('activities'); toast({ title: "가이드", description: "활동별 포인트와 보상 정보를 확인하세요." }); }}
            >
              가이드 보기
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">프로그램별 보상 배분</h2>
          <p className="section-subtitle">3억 TBURN이 6가지 프로그램으로 배분됩니다</p>
        </div>

        <div className="distribution-grid">
          <div className="dist-card ambassador" data-testid="dist-ambassador">
            <div className="dist-icon">🌟</div>
            <div className="dist-name">앰배서더</div>
            <div className="dist-amount">9,000만</div>
            <div className="dist-percent">30%</div>
          </div>
          <div className="dist-card creator" data-testid="dist-creator">
            <div className="dist-icon">🎨</div>
            <div className="dist-name">크리에이터</div>
            <div className="dist-amount">6,000만</div>
            <div className="dist-percent">20%</div>
          </div>
          <div className="dist-card moderator" data-testid="dist-moderator">
            <div className="dist-icon">🛡️</div>
            <div className="dist-name">모더레이터</div>
            <div className="dist-amount">4,500만</div>
            <div className="dist-percent">15%</div>
          </div>
          <div className="dist-card educator" data-testid="dist-educator">
            <div className="dist-icon">📚</div>
            <div className="dist-name">교육 전문가</div>
            <div className="dist-amount">4,500만</div>
            <div className="dist-percent">15%</div>
          </div>
          <div className="dist-card translator" data-testid="dist-translator">
            <div className="dist-icon">🌍</div>
            <div className="dist-name">번역가</div>
            <div className="dist-amount">3,000만</div>
            <div className="dist-percent">10%</div>
          </div>
          <div className="dist-card bounty" data-testid="dist-bounty">
            <div className="dist-icon">🏆</div>
            <div className="dist-name">버그 바운티</div>
            <div className="dist-amount">3,000만</div>
            <div className="dist-percent">10%</div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section" id="programs" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PROGRAMS</span>
          <h2 className="section-title">커뮤니티 프로그램</h2>
          <p className="section-subtitle">나에게 맞는 프로그램을 찾아 참여하세요</p>
        </div>

        <div className="programs-grid">
          {programs.map(program => (
            <div key={program.id} className={`program-card ${program.featured ? 'featured' : ''}`} data-testid={`program-${program.id}`}>
              <div className={`program-header ${program.id}`}>
                <div className="program-icon">{program.icon}</div>
                <h3 className="program-title">{program.title}</h3>
                <p className="program-subtitle">{program.subtitle}</p>
              </div>
              <div className="program-content">
                <div className="program-reward">
                  <span className="program-reward-label">보상</span>
                  <span className="program-reward-value">{program.reward}</span>
                </div>
                <ul className="program-benefits">
                  {program.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <div className="program-requirements">
                  <h5>참여 조건</h5>
                  <p>{program.requirements}</p>
                </div>
                <button 
                  className="program-btn primary"
                  onClick={() => handleApplyProgram(program.id, program.title)}
                  data-testid={`button-apply-${program.id}`}
                >
                  {isConnected ? '신청하기' : '지갑 연결 후 신청'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tier System Section */}
      <section className="section" id="tiers">
        <div className="section-header">
          <span className="section-badge">TIER SYSTEM</span>
          <h2 className="section-title">커뮤니티 등급 시스템</h2>
          <p className="section-subtitle">활동량에 따라 등급이 상승하고 보상 배율이 증가합니다</p>
        </div>

        <div className="tier-section">
          <div className="tier-header">
            <h3>🏅 등급별 혜택</h3>
            <p>포인트를 모아 더 높은 등급으로 승급하세요</p>
          </div>

          <div className="tier-grid">
            {tiers.map(tier => (
              <div key={tier.id} className={`tier-card ${tier.tierClass}`} data-testid={`tier-${tier.id}`}>
                <div className="tier-icon">{tier.icon}</div>
                <div className="tier-name">{tier.name}</div>
                <div className="tier-points">{tier.points}</div>
                <div className="tier-multiplier">{tier.multiplier}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="section" id="activities" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">ACTIVITIES</span>
          <h2 className="section-title">활동별 포인트 & 보상</h2>
          <p className="section-subtitle">다양한 활동으로 포인트와 TBURN을 획득하세요</p>
        </div>

        <div className="activity-section">
          <div className="activity-header">
            <h3>📊 포인트 획득 활동</h3>
          </div>

          <table className="activity-table">
            <thead>
              <tr>
                <th>활동</th>
                <th>카테고리</th>
                <th>포인트</th>
                <th>TBURN 보상</th>
                <th>빈도</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="activity-type">
                      <div className={`activity-type-icon ${activity.type}`}>{activity.icon}</div>
                      <span>{activity.name}</span>
                    </div>
                  </td>
                  <td>{activity.category}</td>
                  <td className="activity-points">{activity.points}</td>
                  <td className="activity-reward">{activity.reward}</td>
                  <td>
                    <span className={`frequency-badge ${activity.frequency}`}>
                      {activity.frequency === 'daily' ? '매일' : 
                       activity.frequency === 'weekly' ? '매주' : 
                       activity.frequency === 'monthly' ? '매월' : '1회'}
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
          <span className="section-badge">LEADERBOARD</span>
          <h2 className="section-title">커뮤니티 리더보드</h2>
          <p className="section-subtitle">가장 활발한 커뮤니티 멤버들</p>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h3>🏆 Top Contributors</h3>
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
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">커뮤니티 프로그램에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>커뮤니티 프로그램 보상 총 물량은 얼마인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>커뮤니티 프로그램 보상 총 풀은 <strong>3억 TBURN</strong>입니다. 이는 전체 공급량 100억 TBURN의 3%에 해당합니다. 6개 프로그램으로 배분됩니다: 앰배서더(30%), 콘텐츠 크리에이터(20%), 모더레이터(15%), 교육 전문가(15%), 번역가(10%), 버그 바운티(10%).</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>커뮤니티 프로그램에 어떻게 참여하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>각 프로그램 카드의 <strong>"신청하기" 버튼</strong>을 클릭하여 지원서를 제출하세요. 지원서 검토 후 승인되면 공식 커뮤니티 멤버로 활동을 시작할 수 있습니다. 앰배서더는 별도의 인터뷰 과정이 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>포인트는 어떻게 TBURN으로 전환되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>포인트는 <strong>매월 말 자동으로 TBURN으로 전환</strong>됩니다. 전환 비율은 등급에 따라 달라지며, Legend 등급은 최대 3배의 보상 배율을 받습니다. 전환된 TBURN은 다음 달 첫째 주에 지급됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>여러 프로그램에 동시 참여가 가능한가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>네, <strong>여러 프로그램에 동시 참여</strong>가 가능합니다. 예를 들어, 앰배서더로 활동하면서 콘텐츠 크리에이터로도 보상을 받을 수 있습니다. 단, 각 프로그램별 참여 조건을 모두 충족해야 합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>등급 시스템은 어떻게 작동하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>5단계 등급 시스템이 있습니다: <strong>뉴커머(1x) → 컨트리뷰터(1.2x) → 애드보킷(1.5x) → 챔피언(2x) → 레전드(3x)</strong>. 활동으로 포인트를 쌓아 상위 등급으로 승급하며, 각 등급마다 보상 배율이 증가합니다. 레전드 등급은 10,000포인트 이상 필요합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>등급 강등 조건은 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p><strong>3개월 연속 최소 활동량</strong>(월 100포인트 이상)을 달성하지 못하면 등급이 강등될 수 있습니다. 강등 시 1단계씩 내려가며, 해당 등급의 보상 배율이 적용됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>버그 바운티 보상은 어떻게 결정되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>버그 바운티 보상은 취약점의 <strong>심각도에 따라</strong> 결정됩니다: Critical(최대 50,000 TBURN), High(10,000~25,000 TBURN), Medium(2,000~10,000 TBURN), Low(500~2,000 TBURN). 보안 전문가 검증 후 7일 이내 지급됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>콘텐츠 품질 기준은 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>콘텐츠는 <strong>정확성, 원본성, 품질, 참여도</strong> 4가지 기준으로 평가됩니다. 표절, 허위 정보, 저품질 콘텐츠는 보상이 거부되며, 반복 시 프로그램 참여가 제한될 수 있습니다. 우수 콘텐츠는 공식 채널에 홍보되며 추가 보너스가 지급됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-testid="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>TBURN 커뮤니티에 합류하세요!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            함께 성장하고, 함께 보상받는 TBURN 생태계<br />
            지금 바로 커뮤니티 프로그램에 참여하세요!
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--cyan)', fontSize: '1.25rem', padding: '20px 50px' }}
            onClick={() => { scrollToSection('programs'); toast({ title: "커뮤니티 프로그램", description: "참여할 프로그램을 선택하세요!" }); }}
            data-testid="button-cta-start"
          >
            지금 시작하기
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
            <h4>Product</h4>
            <ul>
              <li><Link href="/" data-testid="footer-link-mainnet">메인넷</Link></li>
              <li><Link href="/scan" data-testid="footer-link-explorer">익스플로러</Link></li>
              <li><Link href="/app/bridge" data-testid="footer-link-bridge">브릿지</Link></li>
              <li><Link href="/app/staking" data-testid="footer-link-staking">스테이킹</Link></li>
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
            <Link href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">이용약관</Link>
            <Link href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
