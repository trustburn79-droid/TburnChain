import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";

interface EcosystemFundStatsData {
  totalFundSize: string;
  totalAllocated: string;
  totalProjects: number;
  activeProjects: number;
  categories: Array<{ name: string; allocation: string; percent: string }>;
  recentGrants: Array<{ name: string; amount: string; category: string }>;
}

interface EcosystemFundStatsResponse {
  success: boolean;
  data: EcosystemFundStatsData;
}

export default function EcosystemFundPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();

  const { data: response, isLoading } = useQuery<EcosystemFundStatsResponse>({
    queryKey: ['/api/token-programs/ecosystem-fund/stats'],
  });
  const stats = response?.data;

  const { toast } = useToast();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
      toast({
        title: "지갑 연결 해제",
        description: "지갑 연결이 해제되었습니다.",
      });
    } else {
      await connect("metamask");
      toast({
        title: "지갑 연결됨",
        description: "MetaMask 지갑이 연결되었습니다.",
      });
    }
  };

  const handleApplyGrant = (grantId: string, grantTitle: string) => {
    if (!isConnected) {
      toast({
        title: "지갑 연결 필요",
        description: "그랜트 신청을 위해 먼저 지갑을 연결해주세요.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `${grantTitle} 신청 완료`,
      description: `${grantTitle} 그랜트 신청이 접수되었습니다. 심사 결과를 이메일로 알려드립니다.`,
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({
      title: `${platform} 열기`,
      description: `${platform} 페이지가 새 창에서 열렸습니다.`,
    });
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const distributions = [
    { id: "grant", icon: "💻", name: "개발자 그랜트", amount: "2.8억", percent: "40%" },
    { id: "incubator", icon: "🚀", name: "dApp 인큐베이터", amount: "1.4억", percent: "20%" },
    { id: "hackathon", icon: "🏆", name: "해커톤 & 대회", amount: "0.7억", percent: "10%" },
    { id: "partnership", icon: "🤝", name: "파트너십 지원", amount: "1.4억", percent: "20%" },
    { id: "research", icon: "🔬", name: "연구 & 개발", amount: "0.7억", percent: "10%" },
  ];

  const grantPrograms = [
    { id: "builder", icon: "🛠️", title: "Builder Grant", subtitle: "초기 개발자를 위한 지원금", amount: "최대 5만", range: "1,000~50,000 TBURN", featured: false, features: ["MVP 개발 지원", "기술 멘토링", "테스트넷 접근", "커뮤니티 노출"], stats: { approved: "156", pending: "24" } },
    { id: "growth", icon: "📈", title: "Growth Grant", subtitle: "성장 단계 프로젝트 지원", amount: "최대 20만", range: "50,000~200,000 TBURN", featured: true, features: ["확장 자금 지원", "마케팅 협업", "VC 소개 연계", "전략적 파트너십"], stats: { approved: "42", pending: "18" } },
    { id: "research", icon: "🔬", title: "Research Grant", subtitle: "연구 및 혁신 프로젝트", amount: "최대 50만", range: "100,000~500,000 TBURN", featured: false, features: ["장기 연구 지원", "논문 출판 지원", "학술 협력", "특허 지원"], stats: { approved: "12", pending: "8" } },
  ];

  const processSteps = [
    { icon: "📝", title: "신청서 제출", desc: "온라인 신청서 작성", duration: "1-2일" },
    { icon: "🔍", title: "1차 심사", desc: "팀/기술 검토", duration: "1-2주" },
    { icon: "💬", title: "인터뷰", desc: "팀 미팅 & Q&A", duration: "1주" },
    { icon: "📊", title: "최종 심사", desc: "위원회 평가", duration: "1-2주" },
    { icon: "✅", title: "승인 & 지급", desc: "계약 및 펀딩", duration: "1주" },
  ];

  const incubatorBenefits = [
    { icon: "💰", type: "funding", title: "시드 펀딩", desc: "최대 100,000 TBURN 초기 자금" },
    { icon: "👨‍🏫", type: "mentoring", title: "전문 멘토링", desc: "업계 전문가 1:1 코칭" },
    { icon: "🛠️", type: "tech", title: "기술 지원", desc: "개발 도구 및 인프라 제공" },
    { icon: "🌐", type: "network", title: "네트워크 액세스", desc: "VC/파트너 네트워크 연결" },
    { icon: "📢", type: "marketing", title: "마케팅 지원", desc: "공동 마케팅 및 PR" },
  ];

  const incubatorBatches = [
    { name: "배치 #4", status: "recruiting", statusLabel: "모집중", info: "2025.02.01 ~ 2025.05.31 | 10팀 선발" },
    { name: "배치 #5", status: "upcoming", statusLabel: "예정", info: "2025.06.01 ~ 2025.09.30 | 10팀 선발" },
    { name: "배치 #3", status: "completed", statusLabel: "완료", info: "2024.10.01 ~ 2025.01.31 | 8팀 졸업" },
  ];

  const hackathonTracks = [
    { icon: "🎮", name: "GameFi", prize: "$25,000" },
    { icon: "💱", name: "DeFi", prize: "$25,000" },
    { icon: "🖼️", name: "NFT", prize: "$15,000" },
    { icon: "🤖", name: "AI+Blockchain", prize: "$35,000" },
  ];

  const portfolioProjects = [
    { icon: "🦊", name: "TBurn Swap", category: "DEX", funding: "150,000 TBURN" },
    { icon: "🏦", name: "TBurn Lend", category: "Lending", funding: "200,000 TBURN" },
    { icon: "🎮", name: "ChainQuest", category: "GameFi", funding: "100,000 TBURN" },
    { icon: "🖼️", name: "ArtVerse", category: "NFT Marketplace", funding: "80,000 TBURN" },
    { icon: "🌉", name: "CrossBridge", category: "Bridge", funding: "250,000 TBURN" },
    { icon: "📊", name: "DataDAO", category: "Analytics", funding: "75,000 TBURN" },
    { icon: "🔐", name: "VaultGuard", category: "Security", funding: "120,000 TBURN" },
    { icon: "💎", name: "StakeMax", category: "Staking", funding: "90,000 TBURN" },
  ];

  return (
    <div className="ecosystem-fund-page">
      <style>{`
        .ecosystem-fund-page {
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
          --emerald: #10B981;
          --indigo: #6366F1;
          --teal: #14B8A6;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-fund: linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);
          --gradient-grant: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
          --gradient-incubator: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .fund-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(20, 184, 166, 0.2);
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

        .logo-text { font-size: 1.5rem; font-weight: 800; color: var(--white); }
        .logo-text span { color: var(--gold); }

        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--light-gray); text-decoration: none; font-weight: 500; transition: color 0.3s; }
        .nav-links a:hover { color: var(--teal); }

        .connect-btn {
          background: var(--gradient-fund);
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
          box-shadow: 0 10px 40px rgba(20, 184, 166, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%);
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
          background: rgba(20, 184, 166, 0.15);
          border: 1px solid rgba(20, 184, 166, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--teal);
          margin-bottom: 2rem;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-fund);
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

        .fund-stats-banner {
          background: linear-gradient(90deg, rgba(20, 184, 166, 0.15), rgba(6, 182, 212, 0.15));
          border: 1px solid rgba(20, 184, 166, 0.3);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .fund-stat {
          text-align: center;
          position: relative;
        }

        .fund-stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .fund-stat .value { font-size: 1.5rem; font-weight: 800; color: var(--teal); }
        .fund-stat .label { font-size: 0.8rem; color: var(--gray); margin-top: 0.25rem; }

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
          border-color: var(--teal);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-fund);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-fund);
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
          box-shadow: 0 20px 60px rgba(20, 184, 166, 0.4);
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

        .btn-secondary:hover { border-color: var(--teal); color: var(--teal); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(20, 184, 166, 0.15);
          color: var(--teal);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
        .section-subtitle { color: var(--light-gray); font-size: 1.125rem; max-width: 600px; margin: 0 auto; }

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
          transition: all 0.3s;
        }

        .dist-card:hover {
          transform: translateY(-5px);
          border-color: var(--teal);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.grant::before { background: var(--gradient-grant); }
        .dist-card.incubator::before { background: var(--gradient-incubator); }
        .dist-card.hackathon::before { background: linear-gradient(90deg, var(--warning), var(--gold)); }
        .dist-card.partnership::before { background: var(--gradient-fund); }
        .dist-card.research::before { background: linear-gradient(90deg, var(--blue), var(--indigo)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--teal); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .grant-programs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .grant-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .grant-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .grant-card.featured {
          border-color: var(--teal);
          box-shadow: 0 0 40px rgba(20, 184, 166, 0.2);
        }

        .grant-card.featured::after {
          content: '인기';
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--gradient-fund);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 10;
        }

        .grant-header {
          padding: 2rem;
          position: relative;
        }

        .grant-header.builder { background: linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, transparent 100%); }
        .grant-header.growth { background: linear-gradient(180deg, rgba(20, 184, 166, 0.2) 0%, transparent 100%); }
        .grant-header.research { background: linear-gradient(180deg, rgba(59, 130, 246, 0.2) 0%, transparent 100%); }

        .grant-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        .grant-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
        .grant-subtitle { color: var(--light-gray); font-size: 0.9rem; }

        .grant-content { padding: 1.5rem 2rem 2rem; }

        .grant-amount {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .grant-amount-label { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }
        .grant-amount-value { font-size: 1.75rem; font-weight: 900; color: var(--teal); }
        .grant-amount-range { font-size: 0.875rem; color: var(--gray); margin-top: 0.25rem; }

        .grant-features { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .grant-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .grant-features li:last-child { border-bottom: none; }
        .grant-features li::before { content: '✓'; color: var(--success); }

        .grant-stats {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .grant-stat-item { text-align: center; }
        .grant-stat-item .value { font-weight: 700; color: var(--teal); }
        .grant-stat-item .label { font-size: 0.7rem; color: var(--gray); }

        .grant-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          background: var(--gradient-fund);
          color: var(--white);
        }

        .grant-btn:hover { transform: scale(1.02); }

        .process-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .process-timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 2rem 0;
        }

        .process-timeline::before {
          content: '';
          position: absolute;
          top: 40px;
          left: 10%;
          right: 10%;
          height: 4px;
          background: linear-gradient(90deg, var(--teal), var(--cyan), var(--blue), var(--purple), var(--success));
          border-radius: 2px;
        }

        .process-item {
          text-align: center;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .process-dot {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          border: 4px solid var(--dark);
        }

        .process-item:nth-child(1) .process-dot { background: var(--teal); }
        .process-item:nth-child(2) .process-dot { background: var(--cyan); }
        .process-item:nth-child(3) .process-dot { background: var(--blue); }
        .process-item:nth-child(4) .process-dot { background: var(--purple); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--teal); font-weight: 600; margin-top: 0.5rem; }

        .incubator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .incubator-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .incubator-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .incubator-benefits {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }

        .benefit-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .benefit-icon.funding { background: rgba(20, 184, 166, 0.2); }
        .benefit-icon.mentoring { background: rgba(139, 92, 246, 0.2); }
        .benefit-icon.tech { background: rgba(59, 130, 246, 0.2); }
        .benefit-icon.network { background: rgba(236, 72, 153, 0.2); }
        .benefit-icon.marketing { background: rgba(245, 158, 11, 0.2); }

        .benefit-content h4 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
        .benefit-content p { font-size: 0.85rem; color: var(--gray); }

        .incubator-batch {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .batch-item {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border-left: 4px solid var(--teal);
        }

        .batch-item.active { border-left-color: var(--success); background: rgba(34, 197, 94, 0.05); }
        .batch-item.upcoming { border-left-color: var(--warning); }

        .batch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .batch-name { font-weight: 700; }

        .batch-status {
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .batch-status.recruiting { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .batch-status.upcoming { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .batch-status.completed { background: rgba(100, 116, 139, 0.15); color: var(--gray); }

        .batch-info { font-size: 0.85rem; color: var(--gray); }

        .hackathon-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .hackathon-banner {
          padding: 3rem 2rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(212, 175, 55, 0.1));
          text-align: center;
          position: relative;
        }

        .hackathon-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--warning), var(--gold));
        }

        .hackathon-title { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .hackathon-subtitle { color: var(--light-gray); }

        .hackathon-content { padding: 2rem; }

        .hackathon-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .hackathon-stat {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
        }

        .hackathon-stat .icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .hackathon-stat .value { font-size: 1.5rem; font-weight: 800; color: var(--gold); }
        .hackathon-stat .label { font-size: 0.8rem; color: var(--gray); }

        .hackathon-tracks {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .track-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s;
        }

        .track-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-5px);
        }

        .track-icon { font-size: 2rem; margin-bottom: 0.75rem; }
        .track-name { font-weight: 700; margin-bottom: 0.25rem; }
        .track-prize { color: var(--gold); font-weight: 700; }

        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .portfolio-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .portfolio-card:hover {
          border-color: var(--teal);
          transform: translateY(-5px);
        }

        .portfolio-logo {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(6, 182, 212, 0.2));
        }

        .portfolio-name { font-weight: 700; margin-bottom: 0.25rem; }
        .portfolio-category { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.75rem; }

        .portfolio-funding {
          display: flex;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
        }

        .portfolio-funding .label { color: var(--gray); }
        .portfolio-funding .value { color: var(--teal); font-weight: 600; }

        .faq-container { max-width: 900px; margin: 0 auto; }

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

        .faq-question:hover { background: rgba(255, 255, 255, 0.03); }
        .faq-question h4 { font-size: 1.1rem; font-weight: 600; }

        .faq-chevron { color: var(--teal); transition: transform 0.3s; }
        .faq-item.active .faq-chevron { transform: rotate(180deg); }

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

        .faq-answer p { color: var(--light-gray); line-height: 1.8; }

        .cta-section {
          padding: 100px 2rem;
          background: var(--gradient-fund);
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

        .footer-brand h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .footer-brand h3 span { color: var(--gold); }
        .footer-brand p { color: var(--light-gray); margin-bottom: 1.5rem; }

        .social-links { display: flex; gap: 1rem; }

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

        .social-links a:hover { background: var(--teal); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--teal); }

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
          .grant-programs-grid { grid-template-columns: 1fr; }
          .incubator-container { grid-template-columns: 1fr; }
          .portfolio-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .fund-stats-banner { grid-template-columns: repeat(3, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .hackathon-stats, .hackathon-tracks { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .portfolio-grid { grid-template-columns: 1fr; }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .fund-stats-banner { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="fund-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#grants" onClick={(e) => { e.preventDefault(); scrollToSection('grants'); }} data-testid="nav-grants">그랜트</a>
            <a href="#incubator" onClick={(e) => { e.preventDefault(); scrollToSection('incubator'); }} data-testid="nav-incubator">인큐베이터</a>
            <a href="#hackathon" onClick={(e) => { e.preventDefault(); scrollToSection('hackathon'); }} data-testid="nav-hackathon">해커톤</a>
            <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }} data-testid="nav-portfolio">포트폴리오</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} data-testid="nav-faq">FAQ</a>
          </nav>
          <button 
            className="connect-btn" 
            onClick={handleWalletClick}
            data-testid="button-connect-wallet"
          >
            {isConnected ? formatAddress(address!) : "🔗 지갑 연결"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span>🌱</span> ECOSYSTEM FUND - 생태계 성장을 위한 투자
          </div>
          <h1>
            TBURN 생태계<br />
            <span className="gradient-text">7억 TBURN</span> 펀드
          </h1>
          <p className="hero-subtitle">
            개발자 그랜트, dApp 인큐베이션, 해커톤, 파트너십 지원으로
            TBURN 생태계의 혁신적인 프로젝트를 지원합니다.
          </p>

          <div className="fund-stats-banner" data-testid="fund-stats">
            {isLoading ? (
              <div className="fund-stat" data-testid="loading-indicator">
                <div className="value" style={{ opacity: 0.5 }}>로딩중...</div>
              </div>
            ) : (
              <>
                <div className="fund-stat">
                  <div className="value" data-testid="stat-fund-size">{stats?.totalFundSize || "7억"}</div>
                  <div className="label">총 펀드 규모</div>
                </div>
                <div className="fund-stat">
                  <div className="value" data-testid="stat-total-projects">{stats?.totalProjects || 124}</div>
                  <div className="label">지원 프로젝트</div>
                </div>
                <div className="fund-stat">
                  <div className="value" data-testid="stat-allocated">{stats?.totalAllocated || "$175M+"}</div>
                  <div className="label">총 투자 유치</div>
                </div>
                <div className="fund-stat">
                  <div className="value" data-testid="stat-active-projects">{stats?.activeProjects || 32}</div>
                  <div className="label">활성 dApp</div>
                </div>
                <div className="fund-stat">
                  <div className="value">85%</div>
                  <div className="label">성공률</div>
                </div>
              </>
            )}
          </div>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-fund">
              <div className="stat-value">7억</div>
              <div className="stat-label">총 에코시스템 펀드</div>
            </div>
            <div className="stat-card" data-testid="stat-grant">
              <div className="stat-value">2.8억</div>
              <div className="stat-label">개발자 그랜트</div>
            </div>
            <div className="stat-card" data-testid="stat-incubator">
              <div className="stat-value">1.4억</div>
              <div className="stat-label">인큐베이터 펀드</div>
            </div>
            <div className="stat-card" data-testid="stat-hackathon">
              <div className="stat-value">$100K</div>
              <div className="stat-label">해커톤 상금</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply-grant"
              onClick={() => { scrollToSection('grants'); toast({ title: "그랜트 프로그램", description: "자신에게 맞는 그랜트 프로그램을 선택하세요." }); }}
            >
              그랜트 신청하기
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-view-programs"
              onClick={() => { scrollToSection('incubator'); toast({ title: "인큐베이터 프로그램", description: "4개월 집중 육성 프로그램을 확인하세요." }); }}
            >
              프로그램 안내
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">펀드 배분</h2>
          <p className="section-subtitle">7억 TBURN이 5가지 프로그램으로 배분됩니다</p>
        </div>

        <div className="distribution-grid">
          {distributions.map(dist => (
            <div key={dist.id} className={`dist-card ${dist.id}`} data-testid={`dist-${dist.id}`}>
              <div className="dist-icon">{dist.icon}</div>
              <div className="dist-name">{dist.name}</div>
              <div className="dist-amount">{dist.amount}</div>
              <div className="dist-percent">{dist.percent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Grant Programs Section */}
      <section className="section" id="grants" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">GRANTS</span>
          <h2 className="section-title">개발자 그랜트 프로그램</h2>
          <p className="section-subtitle">단계별 맞춤형 지원 프로그램</p>
        </div>

        <div className="grant-programs-grid">
          {grantPrograms.map(grant => (
            <div key={grant.id} className={`grant-card ${grant.featured ? 'featured' : ''}`} data-testid={`grant-${grant.id}`}>
              <div className={`grant-header ${grant.id}`}>
                <div className="grant-icon">{grant.icon}</div>
                <h3 className="grant-title">{grant.title}</h3>
                <p className="grant-subtitle">{grant.subtitle}</p>
              </div>
              <div className="grant-content">
                <div className="grant-amount">
                  <div className="grant-amount-label">지원 금액</div>
                  <div className="grant-amount-value">{grant.amount} TBURN</div>
                  <div className="grant-amount-range">{grant.range}</div>
                </div>
                <ul className="grant-features">
                  {grant.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <div className="grant-stats">
                  <div className="grant-stat-item">
                    <div className="value">{grant.stats.approved}</div>
                    <div className="label">승인됨</div>
                  </div>
                  <div className="grant-stat-item">
                    <div className="value">{grant.stats.pending}</div>
                    <div className="label">심사중</div>
                  </div>
                </div>
                <button 
                  className="grant-btn"
                  onClick={() => handleApplyGrant(grant.id, grant.title)}
                  data-testid={`button-apply-${grant.id}`}
                >
                  {isConnected ? '신청하기' : '지갑 연결'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">그랜트 신청 프로세스</h2>
          <p className="section-subtitle">약 4~6주 소요되는 심사 과정</p>
        </div>

        <div className="process-container">
          <div className="process-timeline">
            {processSteps.map((step, idx) => (
              <div key={idx} className="process-item">
                <div className="process-dot">{step.icon}</div>
                <div className="process-title">{step.title}</div>
                <div className="process-desc">{step.desc}</div>
                <div className="process-duration">{step.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incubator Section */}
      <section className="section" id="incubator" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">INCUBATOR</span>
          <h2 className="section-title">dApp 인큐베이터</h2>
          <p className="section-subtitle">4개월 집중 육성 프로그램</p>
        </div>

        <div className="incubator-container">
          <div className="incubator-card">
            <h3>🎯 인큐베이터 혜택</h3>
            <div className="incubator-benefits">
              {incubatorBenefits.map((benefit, idx) => (
                <div key={idx} className="benefit-item">
                  <div className={`benefit-icon ${benefit.type}`}>{benefit.icon}</div>
                  <div className="benefit-content">
                    <h4>{benefit.title}</h4>
                    <p>{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="incubator-card">
            <h3>📅 배치 일정</h3>
            <div className="incubator-batch">
              {incubatorBatches.map((batch, idx) => (
                <div key={idx} className={`batch-item ${batch.status === 'recruiting' ? 'active' : batch.status}`}>
                  <div className="batch-header">
                    <span className="batch-name">{batch.name}</span>
                    <span className={`batch-status ${batch.status}`}>{batch.statusLabel}</span>
                  </div>
                  <div className="batch-info">{batch.info}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon Section */}
      <section className="section" id="hackathon">
        <div className="section-header">
          <span className="section-badge">HACKATHON</span>
          <h2 className="section-title">해커톤 & 대회</h2>
          <p className="section-subtitle">혁신적인 아이디어에 상금을 수여합니다</p>
        </div>

        <div className="hackathon-card">
          <div className="hackathon-banner">
            <h2 className="hackathon-title">🏆 TBURN Global Hackathon 2025</h2>
            <p className="hackathon-subtitle">총 상금 $100,000 | 2025.03.01 ~ 2025.04.30</p>
          </div>
          <div className="hackathon-content">
            <div className="hackathon-stats">
              <div className="hackathon-stat">
                <div className="icon">💰</div>
                <div className="value">$100K</div>
                <div className="label">총 상금</div>
              </div>
              <div className="hackathon-stat">
                <div className="icon">👥</div>
                <div className="value">500+</div>
                <div className="label">참가자</div>
              </div>
              <div className="hackathon-stat">
                <div className="icon">🌍</div>
                <div className="value">30+</div>
                <div className="label">국가</div>
              </div>
              <div className="hackathon-stat">
                <div className="icon">🏢</div>
                <div className="value">15</div>
                <div className="label">스폰서</div>
              </div>
            </div>
            <div className="hackathon-tracks">
              {hackathonTracks.map((track, idx) => (
                <div key={idx} className="track-card">
                  <div className="track-icon">{track.icon}</div>
                  <div className="track-name">{track.name}</div>
                  <div className="track-prize">{track.prize}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="section" id="portfolio" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PORTFOLIO</span>
          <h2 className="section-title">투자 포트폴리오</h2>
          <p className="section-subtitle">에코시스템 펀드로 지원된 프로젝트</p>
        </div>

        <div className="portfolio-grid">
          {portfolioProjects.map((project, idx) => (
            <div key={idx} className="portfolio-card">
              <div className="portfolio-logo">{project.icon}</div>
              <div className="portfolio-name">{project.name}</div>
              <div className="portfolio-category">{project.category}</div>
              <div className="portfolio-funding">
                <span className="label">펀딩</span>
                <span className="value">{project.funding}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">에코시스템 펀드에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-item-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>에코시스템 펀드 총 규모는 얼마인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>에코시스템 펀드에 총 7억 TBURN(전체 공급량의 7%)이 배정되어 있습니다. 개발자 그랜트 40%(2.8억), dApp 인큐베이터 20%(1.4억), 해커톤 & 대회 10%(0.7억), 파트너십 지원 20%(1.4억), 연구 & 개발 10%(0.7억)으로 배분됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-item-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>그랜트 신청 자격은 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TBURN Chain 위에 구축되는 모든 프로젝트가 신청 가능합니다. 개인 개발자, 스타트업, 기존 프로젝트 모두 환영합니다. Builder Grant(최대 5만 TBURN), Growth Grant(최대 20만 TBURN), Research Grant(최대 50만 TBURN) 중 선택 가능합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-item-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>그랜트 자금은 어떻게 지급되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>마일스톤 기반으로 분할 지급됩니다. 일반적으로 승인 시 30%, 중간 검토 시 40%, 완료 시 30%가 지급됩니다. 심사 과정은 약 4~6주 소요되며, 신청서 제출 → 1차 심사 → 인터뷰 → 최종 심사 → 승인 & 지급 순서로 진행됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-item-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>인큐베이터 프로그램에 어떻게 참여하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>각 배치 모집 기간에 온라인으로 신청하시면 됩니다. 서류 심사, 인터뷰를 거쳐 매 배치당 10팀이 선발됩니다. 4개월간 집중 멘토링과 함께 최대 10만 TBURN의 시드 펀딩, 전문 멘토링, 기술 지원, VC 네트워크 연결 등의 혜택을 받을 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-item-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>해커톤 참가 방법은 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>해커톤 페이지에서 등록 후 개인 또는 팀(최대 5명)으로 참가할 수 있습니다. GameFi($25,000), DeFi($25,000), NFT($15,000), AI+Blockchain($35,000) 트랙 중 선택하고 프로젝트를 제출하면 심사를 통해 수상자가 결정됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-item-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>포트폴리오 프로젝트의 성공률은 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>에코시스템 펀드로 지원된 프로젝트의 성공률은 85%입니다. 현재 32개의 활성 dApp이 운영 중이며, TBurn Swap(DEX), TBurn Lend(Lending), ChainQuest(GameFi), CrossBridge(Bridge) 등 다양한 카테고리의 프로젝트가 성공적으로 운영되고 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-item-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>파트너십 지원은 어떻게 받을 수 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>파트너십 지원 프로그램(1.4억 TBURN, 20%)은 전략적 파트너와의 협력을 위한 펀드입니다. 거래소 상장 지원, 크로스체인 통합, 기업 파트너십 등에 활용됩니다. 별도의 파트너십 신청 양식을 통해 문의하시면 됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-item-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>연구 그랜트는 어떤 프로젝트에 적합한가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>Research Grant(최대 50만 TBURN)는 장기 연구 프로젝트에 적합합니다. 블록체인 확장성 연구, 보안 프로토콜 개발, 학술 논문 출판, 특허 지원 등이 포함됩니다. 대학교, 연구소, 전문 연구 팀의 신청을 환영합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>지금 시작하세요!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN 생태계의 일원이 되어<br />
            7억 TBURN 펀드의 지원을 받으세요!
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--teal)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-apply"
            onClick={() => { 
              scrollToSection('grants'); 
              toast({ title: "그랜트 신청", description: "자신에게 맞는 그랜트 프로그램을 선택하세요!" }); 
            }}
          >
            그랜트 신청하기
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
              <li><a href="/" data-testid="footer-link-mainnet">메인넷</a></li>
              <li><a href="/scan" data-testid="footer-link-explorer">익스플로러</a></li>
              <li><a href="/app/bridge" data-testid="footer-link-bridge">브릿지</a></li>
              <li><a href="/app/staking" data-testid="footer-link-staking">스테이킹</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="/learn/whitepaper" data-testid="footer-link-whitepaper">백서</a></li>
              <li><a href="/developers/docs" data-testid="footer-link-docs">문서</a></li>
              <li><a 
                href="https://github.com/tburnchain" 
                onClick={(e) => { e.preventDefault(); handleShareSocial('GitHub', 'https://github.com/tburnchain'); }}
                data-testid="footer-link-github-resources"
              >GitHub</a></li>
              <li><a href="/security-audit" data-testid="footer-link-audit">감사 보고서</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><a href="/community/news" data-testid="footer-link-blog">블로그</a></li>
              <li><a href="/community-program" data-testid="footer-link-ambassador">앰배서더</a></li>
              <li><a href="/ecosystem-fund" data-testid="footer-link-grants">그랜트</a></li>
              <li><a href="/qna" data-testid="footer-link-support">고객지원</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-terms">이용약관</a>
            <a href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }} data-testid="footer-link-privacy">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
