import { useState } from "react";
import { Link } from "wouter";
import { TBurnLogo } from "@/components/tburn-logo";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";

interface PartnershipStatsData {
  partnerships: {
    total: number;
    strategic: number;
    technical: number;
    marketing: number;
    allocation: string;
    distributed: string;
  };
  marketing: {
    campaigns: number;
    reach: string;
    allocation: string;
  };
  advisors: {
    count: number;
    expertise: string[];
    allocation: string;
  };
  strategicPartners: Array<{
    name: string;
    type: string;
    status: string;
  }>;
}

interface PartnershipStatsResponse {
  success: boolean;
  data: PartnershipStatsData;
}

export default function PartnershipProgramPage() {
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { toast } = useToast();

  const { data: response, isLoading: isLoadingStats } = useQuery<PartnershipStatsResponse>({
    queryKey: ['/api/token-programs/partnerships/stats'],
  });
  const partnershipStats = response?.data;

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
      toast({ title: "지갑 연결 해제", description: "지갑이 연결 해제되었습니다." });
    } else {
      await connect();
      toast({ title: "지갑 연결", description: "지갑이 연결되었습니다." });
    }
  };

  const handleApplyPartner = () => {
    scrollToSection('tiers');
    toast({ title: "파트너 신청", description: "파트너 티어를 선택하여 신청을 진행하세요!" });
  };

  const handleViewGuide = () => {
    scrollToSection('types');
    toast({ title: "파트너 가이드", description: "파트너 유형별 안내를 확인하세요." });
  };

  const handleApplyTier = (tierName: string, tierColor: string) => {
    if (!isConnected) {
      toast({ 
        title: "지갑 연결 필요", 
        description: "파트너 신청을 위해 먼저 지갑을 연결해주세요.",
        variant: "destructive"
      });
      return;
    }
    toast({ 
      title: `${tierName} 티어 신청`, 
      description: `${tierName} 파트너 신청이 접수되었습니다. 1-2주 내 심사 결과를 안내드립니다.`
    });
  };

  const handleApplyPartnerType = (typeName: string) => {
    if (!isConnected) {
      toast({ 
        title: "지갑 연결 필요", 
        description: "파트너 신청을 위해 먼저 지갑을 연결해주세요.",
        variant: "destructive"
      });
      return;
    }
    toast({ 
      title: `${typeName} 파트너 신청`, 
      description: `${typeName} 파트너십 신청이 접수되었습니다. 담당자가 연락드릴 예정입니다.`
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({ title: `${platform}`, description: `${platform} 페이지로 이동합니다.` });
  };

  const partnerLogos = ["🏛️", "💱", "🔗", "⚡", "🌐", "🔐"];

  const distributions = [
    { id: "strategic", icon: "🏛️", name: "전략적 파트너", amount: "1.2억", percent: "30%" },
    { id: "exchange", icon: "💱", name: "거래소 파트너", amount: "1억", percent: "25%" },
    { id: "tech", icon: "🔧", name: "기술 파트너", amount: "0.8억", percent: "20%" },
    { id: "marketing", icon: "📢", name: "마케팅 파트너", amount: "0.6억", percent: "15%" },
    { id: "ecosystem", icon: "🌱", name: "생태계 파트너", amount: "0.4억", percent: "10%" },
  ];

  const partnerTiers = [
    { id: "platinum", icon: "💎", name: "Platinum", subtitle: "최상위 파트너", incentive: "최대 500만", benefits: ["전용 기술 지원", "공동 마케팅", "우선 통합 지원", "거버넌스 특권", "독점 이벤트"], color: "#E5E4E2" },
    { id: "gold", icon: "👑", name: "Gold", subtitle: "프리미엄 파트너", incentive: "최대 200만", benefits: ["우선 기술 지원", "마케팅 협업", "통합 지원", "DAO 투표권", "파트너 이벤트"], color: "#D4AF37" },
    { id: "silver", icon: "🥈", name: "Silver", subtitle: "성장 파트너", incentive: "최대 50만", benefits: ["기술 문서 접근", "공동 홍보", "API 액세스", "기본 투표권", "네트워킹"], color: "#C0C0C0" },
    { id: "bronze", icon: "🥉", name: "Bronze", subtitle: "신규 파트너", incentive: "최대 10만", benefits: ["문서 접근", "로고 사용권", "기본 API", "커뮤니티 참여", "뉴스레터"], color: "#CD7F32" },
  ];

  const partnerTypes = [
    { id: "strategic", icon: "🏛️", title: "전략적 파트너", desc: "장기적인 비전을 공유하는 핵심 파트너", benefits: [{ value: "500만+", label: "최대 인센티브" }, { value: "24/7", label: "전담 지원" }], features: ["공동 제품 개발", "브랜드 협업", "전략적 투자", "기술 통합"] },
    { id: "exchange", icon: "💱", title: "거래소 파트너", desc: "TBURN 토큰 상장 및 거래 지원", benefits: [{ value: "200만+", label: "리스팅 보너스" }, { value: "50%", label: "수수료 할인" }], features: ["토큰 상장 지원", "유동성 공급", "마케팅 지원", "트레이딩 대회"] },
    { id: "tech", icon: "🔧", title: "기술 파트너", desc: "인프라 및 개발 도구 협력", benefits: [{ value: "100만+", label: "통합 보너스" }, { value: "무제한", label: "API 호출" }], features: ["API/SDK 통합", "인프라 제공", "보안 감사", "기술 자문"] },
    { id: "marketing", icon: "📢", title: "마케팅 파트너", desc: "브랜드 홍보 및 커뮤니티 확장", benefits: [{ value: "50만+", label: "캠페인 예산" }, { value: "100K+", label: "도달 범위" }], features: ["공동 캠페인", "인플루언서 협업", "이벤트 공동개최", "콘텐츠 제작"] },
  ];

  const processSteps = [
    { icon: "📋", title: "신청서 제출", desc: "파트너십 신청서 작성", duration: "1일" },
    { icon: "🔍", title: "심사 & 평가", desc: "팀/비즈니스 검토", duration: "1주" },
    { icon: "💬", title: "미팅 & 협의", desc: "조건 논의 및 합의", duration: "1-2주" },
    { icon: "📝", title: "계약 체결", desc: "파트너십 계약 서명", duration: "1주" },
    { icon: "🚀", title: "통합 & 런칭", desc: "기술 통합 및 공식 발표", duration: "2-4주" },
  ];

  const successStories = [
    { icon: "🔗", name: "ChainLink Pro", type: "기술 파트너", quote: "TBURN Chain과의 통합으로 우리 오라클 서비스의 처리량이 300% 향상되었습니다.", stats: [{ value: "300%", label: "성능 향상" }, { value: "2.5M", label: "거래 처리" }] },
    { icon: "💱", name: "Global Exchange", type: "거래소 파트너", quote: "TBURN 상장 후 거래량이 급증했고, 사용자들의 만족도가 매우 높습니다.", stats: [{ value: "$50M", label: "거래량" }, { value: "150K", label: "신규 사용자" }] },
    { icon: "🌿", name: "DeFi Protocol", type: "전략적 파트너", quote: "파트너십을 통해 새로운 DeFi 상품을 빠르게 출시할 수 있었습니다.", stats: [{ value: "$25M", label: "TVL" }, { value: "10K", label: "일일 사용자" }] },
  ];

  const currentPartners = {
    protocols: [
      { icon: "🔗", name: "ChainLink", type: "Oracle" },
      { icon: "🔄", name: "Uniswap", type: "DEX" },
      { icon: "⚡", name: "Polygon", type: "Layer 2" },
    ],
    exchanges: [
      { icon: "🅱️", name: "Binance", type: "CEX" },
      { icon: "🌊", name: "Kraken", type: "CEX" },
      { icon: "🪙", name: "Coinbase", type: "CEX" },
    ],
    infra: [
      { icon: "☁️", name: "AWS", type: "Cloud" },
      { icon: "🔐", name: "Fireblocks", type: "Custody" },
      { icon: "📊", name: "Dune", type: "Analytics" },
    ],
  };

  return (
    <div className="partnership-program-page">
      <style>{`
        .partnership-program-page {
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
          --rose: #F43F5E;
          --violet: #7C3AED;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-partner: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          --gradient-platinum: linear-gradient(135deg, #E5E4E2 0%, #A9A9A9 50%, #E5E4E2 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes handshake { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes logoFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.05); } }

        .partner-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(124, 58, 237, 0.2);
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

        .logo-text { font-size: 1.5rem; font-weight: 800; color: var(--white); }
        .logo-text span { color: var(--gold); }

        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--light-gray); text-decoration: none; font-weight: 500; transition: color 0.3s; }
        .nav-links a:hover { color: var(--violet); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-partner);
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
          box-shadow: 0 10px 40px rgba(124, 58, 237, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%);
          top: -300px;
          right: -200px;
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
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(124, 58, 237, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--violet);
          margin-bottom: 2rem;
        }

        .badge .handshake-icon { animation: handshake 1s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-partner);
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

        .partner-logos-banner {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .partner-logos-title {
          font-size: 0.8rem;
          color: var(--gray);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1.5rem;
        }

        .partner-logos-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .partner-logo-item {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          transition: all 0.3s;
          animation: logoFloat 3s ease-in-out infinite;
        }

        .partner-logo-item:nth-child(2) { animation-delay: 0.5s; }
        .partner-logo-item:nth-child(3) { animation-delay: 1s; }
        .partner-logo-item:nth-child(4) { animation-delay: 1.5s; }
        .partner-logo-item:nth-child(5) { animation-delay: 2s; }
        .partner-logo-item:nth-child(6) { animation-delay: 2.5s; }

        .partner-logo-item:hover {
          background: rgba(124, 58, 237, 0.2);
          transform: scale(1.1);
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
          border-color: var(--violet);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-partner);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-partner);
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
          box-shadow: 0 20px 60px rgba(124, 58, 237, 0.4);
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

        .btn-secondary:hover { border-color: var(--violet); color: var(--violet); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(124, 58, 237, 0.15);
          color: var(--violet);
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
          border-color: var(--violet);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.strategic::before { background: linear-gradient(90deg, var(--indigo), var(--purple)); }
        .dist-card.exchange::before { background: linear-gradient(90deg, var(--warning), var(--gold)); }
        .dist-card.tech::before { background: linear-gradient(90deg, var(--cyan), var(--blue)); }
        .dist-card.marketing::before { background: linear-gradient(90deg, var(--pink), var(--rose)); }
        .dist-card.ecosystem::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--violet); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .tier-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .tier-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .tier-card.platinum { border-color: #E5E4E2; box-shadow: 0 0 40px rgba(229, 228, 226, 0.2); }
        .tier-card.gold { border-color: var(--gold); }
        .tier-card.silver { border-color: #C0C0C0; }
        .tier-card.bronze { border-color: #CD7F32; }

        .tier-header {
          padding: 2rem 1.5rem;
          text-align: center;
        }

        .tier-card.platinum .tier-header { background: linear-gradient(180deg, rgba(229, 228, 226, 0.15) 0%, transparent 100%); }
        .tier-card.gold .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.silver .tier-header { background: linear-gradient(180deg, rgba(192, 192, 192, 0.15) 0%, transparent 100%); }
        .tier-card.bronze .tier-header { background: linear-gradient(180deg, rgba(205, 127, 50, 0.15) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }

        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.platinum .tier-name { color: #E5E4E2; }
        .tier-card.gold .tier-name { color: var(--gold); }
        .tier-card.silver .tier-name { color: #C0C0C0; }
        .tier-card.bronze .tier-name { color: #CD7F32; }

        .tier-subtitle { font-size: 0.8rem; color: var(--gray); }

        .tier-content { padding: 1.5rem; }

        .tier-incentive {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .tier-incentive-label { font-size: 0.75rem; color: var(--gray); margin-bottom: 0.25rem; }

        .tier-incentive-value { font-size: 1.25rem; font-weight: 800; }

        .tier-card.platinum .tier-incentive-value { color: #E5E4E2; }
        .tier-card.gold .tier-incentive-value { color: var(--gold); }
        .tier-card.silver .tier-incentive-value { color: #C0C0C0; }
        .tier-card.bronze .tier-incentive-value { color: #CD7F32; }

        .tier-benefits { list-style: none; margin-bottom: 1rem; padding: 0; }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 0.85rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-benefits li:last-child { border-bottom: none; }
        .tier-benefits li::before { content: '✓'; color: var(--success); font-size: 10px; }

        .tier-btn {
          display: block;
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .tier-card.platinum .tier-btn { background: var(--gradient-platinum); color: var(--dark); }
        .tier-card.gold .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.silver .tier-btn { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .tier-card.bronze .tier-btn { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }

        .tier-btn:hover { transform: scale(1.02); }

        .partner-types-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .partner-type-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .partner-type-card:hover {
          border-color: var(--violet);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .partner-type-header {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .partner-type-card.strategic .partner-type-header { background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), transparent); }
        .partner-type-card.exchange .partner-type-header { background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), transparent); }
        .partner-type-card.tech .partner-type-header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), transparent); }
        .partner-type-card.marketing .partner-type-header { background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), transparent); }

        .partner-type-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .partner-type-card.strategic .partner-type-icon { background: rgba(99, 102, 241, 0.2); }
        .partner-type-card.exchange .partner-type-icon { background: rgba(245, 158, 11, 0.2); }
        .partner-type-card.tech .partner-type-icon { background: rgba(6, 182, 212, 0.2); }
        .partner-type-card.marketing .partner-type-icon { background: rgba(236, 72, 153, 0.2); }

        .partner-type-info h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
        .partner-type-info p { font-size: 0.9rem; color: var(--gray); }

        .partner-type-content { padding: 0 2rem 2rem; }

        .partner-type-benefits {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .benefit-box {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }

        .benefit-box .value { font-size: 1.25rem; font-weight: 800; color: var(--violet); margin-bottom: 0.25rem; }
        .benefit-box .label { font-size: 0.8rem; color: var(--gray); }

        .partner-type-features { list-style: none; padding: 0; }

        .partner-type-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .partner-type-features li::before { content: '✓'; color: var(--success); }

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
          background: linear-gradient(90deg, var(--violet), var(--purple), var(--indigo), var(--blue), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--violet); }
        .process-item:nth-child(2) .process-dot { background: var(--purple); }
        .process-item:nth-child(3) .process-dot { background: var(--indigo); }
        .process-item:nth-child(4) .process-dot { background: var(--blue); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--violet); font-weight: 600; margin-top: 0.5rem; }

        .success-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .success-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          transition: all 0.3s;
        }

        .success-card:hover {
          border-color: var(--violet);
          transform: translateY(-5px);
        }

        .success-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .success-logo {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.2));
        }

        .success-info h4 { font-size: 1.125rem; font-weight: 700; }
        .success-info p { font-size: 0.85rem; color: var(--gray); }

        .success-quote {
          font-style: italic;
          color: var(--light-gray);
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }

        .success-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .success-stat {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          text-align: center;
        }

        .success-stat .value { font-size: 1.25rem; font-weight: 800; color: var(--violet); }
        .success-stat .label { font-size: 0.75rem; color: var(--gray); }

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

        .faq-chevron { color: var(--violet); transition: transform 0.3s; }
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
          background: var(--gradient-partner);
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

        .social-links a:hover { background: var(--violet); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--violet); }

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
          .tiers-grid { grid-template-columns: repeat(2, 1fr); }
          .partner-types-grid { grid-template-columns: 1fr; }
          .success-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .tiers-grid { grid-template-columns: 1fr; }
          .partner-logos-grid { gap: 1.5rem; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="partner-header">
        <div className="header-container">
          <a href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </a>
          <nav className="nav-links">
            <a 
              href="#tiers" 
              onClick={(e) => { e.preventDefault(); scrollToSection('tiers'); }}
              data-testid="nav-tiers"
            >파트너 티어</a>
            <a 
              href="#types" 
              onClick={(e) => { e.preventDefault(); scrollToSection('types'); }}
              data-testid="nav-types"
            >파트너 유형</a>
            <a 
              href="#process" 
              onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}
              data-testid="nav-process"
            >프로세스</a>
            <a 
              href="#success" 
              onClick={(e) => { e.preventDefault(); scrollToSection('success'); }}
              data-testid="nav-success"
            >성공사례</a>
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
              {isConnected ? `${formatAddress(address || '')}` : '지갑 연결'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="handshake-icon">🤝</span> PARTNERSHIP PROGRAM - 함께 성장하는 파트너십
          </div>
          <h1>
            TBURN 파트너가 되어<br />
            <span className="gradient-text">4억 TBURN</span> 인센티브를 받으세요
          </h1>
          <p className="hero-subtitle">
            전략적 파트너, 거래소, 기술 파트너, 마케팅 파트너로
            TBURN 생태계와 함께 성장하세요.
          </p>

          <div className="partner-logos-banner" data-testid="partner-logos">
            <div className="partner-logos-title">우리의 파트너</div>
            <div className="partner-logos-grid">
              {partnerLogos.map((logo, idx) => (
                <div key={idx} className="partner-logo-item">{logo}</div>
              ))}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-incentive">
              <div className="stat-value">
                {isLoadingStats ? '...' : partnershipStats?.partnerships?.allocation || '4억'}
              </div>
              <div className="stat-label">총 파트너 인센티브</div>
            </div>
            <div className="stat-card" data-testid="stat-partners">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${partnershipStats?.partnerships?.total || 45}+`}
              </div>
              <div className="stat-label">활성 파트너</div>
            </div>
            <div className="stat-card" data-testid="stat-categories">
              <div className="stat-value">5</div>
              <div className="stat-label">파트너 카테고리</div>
            </div>
            <div className="stat-card" data-testid="stat-max-incentive">
              <div className="stat-value">500만</div>
              <div className="stat-label">최대 인센티브</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply-partner"
              onClick={handleApplyPartner}
            >
              파트너 신청하기
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-view-guide"
              onClick={handleViewGuide}
            >
              파트너 가이드
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">인센티브 배분</h2>
          <p className="section-subtitle">4억 TBURN이 5가지 파트너 유형으로 배분됩니다</p>
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

      {/* Partner Tiers Section */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">TIERS</span>
          <h2 className="section-title">파트너 티어</h2>
          <p className="section-subtitle">기여도에 따른 차등 혜택 시스템</p>
        </div>

        <div className="tiers-grid">
          {partnerTiers.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.id}`} data-testid={`tier-${tier.id}`}>
              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-subtitle">{tier.subtitle}</p>
              </div>
              <div className="tier-content">
                <div className="tier-incentive">
                  <div className="tier-incentive-label">파트너 인센티브</div>
                  <div className="tier-incentive-value">{tier.incentive} TBURN</div>
                </div>
                <ul className="tier-benefits">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <button 
                  className="tier-btn"
                  data-testid={`button-apply-${tier.id}`}
                  onClick={() => handleApplyTier(tier.name, tier.color)}
                >
                  신청하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="section" id="types">
        <div className="section-header">
          <span className="section-badge">PARTNER TYPES</span>
          <h2 className="section-title">파트너 유형</h2>
          <p className="section-subtitle">다양한 방식으로 협력할 수 있습니다</p>
        </div>

        <div className="partner-types-grid">
          {partnerTypes.map(type => (
            <div key={type.id} className={`partner-type-card ${type.id}`} data-testid={`type-${type.id}`}>
              <div className="partner-type-header">
                <div className="partner-type-icon">{type.icon}</div>
                <div className="partner-type-info">
                  <h3>{type.title}</h3>
                  <p>{type.desc}</p>
                </div>
              </div>
              <div className="partner-type-content">
                <div className="partner-type-benefits">
                  {type.benefits.map((benefit, idx) => (
                    <div key={idx} className="benefit-box">
                      <div className="value">{benefit.value}</div>
                      <div className="label">{benefit.label}</div>
                    </div>
                  ))}
                </div>
                <ul className="partner-type-features">
                  {type.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  data-testid={`button-apply-type-${type.id}`}
                  onClick={() => handleApplyPartnerType(type.title)}
                >
                  {type.title} 신청하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="section" id="process" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">파트너십 프로세스</h2>
          <p className="section-subtitle">약 4~6주 소요되는 파트너십 체결 과정</p>
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

      {/* Success Stories Section */}
      <section className="section" id="success">
        <div className="section-header">
          <span className="section-badge">SUCCESS STORIES</span>
          <h2 className="section-title">파트너 성공사례</h2>
          <p className="section-subtitle">함께 성장한 파트너들의 이야기</p>
        </div>

        <div className="success-grid">
          {successStories.map((story, idx) => (
            <div key={idx} className="success-card">
              <div className="success-header">
                <div className="success-logo">{story.icon}</div>
                <div className="success-info">
                  <h4>{story.name}</h4>
                  <p>{story.type}</p>
                </div>
              </div>
              <p className="success-quote">"{story.quote}"</p>
              <div className="success-stats">
                {story.stats.map((stat, sidx) => (
                  <div key={sidx} className="success-stat">
                    <div className="value">{stat.value}</div>
                    <div className="label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">파트너십에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-item-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>파트너십 프로그램 총 인센티브 규모는 얼마인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>파트너십 프로그램에는 총 4억 TBURN이 배정되어 있습니다. 전략적 파트너 30%(1.2억), 거래소 파트너 25%(1억), 기술 파트너 20%(0.8억), 마케팅 파트너 15%(0.6억), 생태계 파트너 10%(0.4억)로 배분됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-item-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>파트너 신청 자격은 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>블록체인 관련 사업을 영위하는 기업, 프로젝트, 서비스 제공업체 모두 신청 가능합니다. 규모에 상관없이 TBURN 생태계에 가치를 제공할 수 있는 모든 파트너를 환영합니다. 신청 시 사업자등록증, 프로젝트 소개서, 협력 제안서 등을 제출해야 합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-item-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>파트너 티어는 어떻게 결정되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>파트너의 기여도, 통합 범위, 마케팅 협력 수준, 기술적 역량 등을 종합적으로 평가하여 티어가 결정됩니다. Platinum(최대 500만), Gold(최대 200만), Silver(최대 50만), Bronze(최대 10만) 4개 티어가 있으며, 활동 성과에 따라 상위 티어로 승급할 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-item-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>파트너 인센티브는 어떻게 지급되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>파트너십 계약 체결 시 초기 인센티브 30%가 지급되며, 마일스톤 달성 시 40%, 최종 KPI 달성 시 30%가 추가 지급됩니다. 모든 인센티브는 TBURN 토큰으로 지급되며, 6개월 베스팅 일정이 적용됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-item-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>여러 유형의 파트너십을 동시에 진행할 수 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>네, 가능합니다. 예를 들어 기술 파트너이면서 동시에 마케팅 파트너로 협력할 수 있습니다. 각 유형별 인센티브가 별도로 적용되어 복합 파트너십 시 최대 인센티브를 받을 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-item-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>파트너십 체결까지 얼마나 걸리나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>일반적으로 4~6주가 소요됩니다. 신청서 제출(1일) → 심사 및 평가(1주) → 미팅 및 협의(1-2주) → 계약 체결(1주) → 통합 및 런칭(2-4주) 단계를 거칩니다. 긴급 파트너십의 경우 패스트트랙 심사가 가능합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-item-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>거래소 상장 지원은 어떻게 받나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>거래소 파트너에게는 최대 200만 TBURN의 리스팅 보너스, 50% 수수료 할인, 유동성 공급 지원, 트레이딩 대회 공동 개최 등의 혜택이 제공됩니다. Tier 1 거래소 상장 시 추가 인센티브가 지급됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-item-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>기술 통합 지원은 어떻게 제공되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>기술 파트너에게는 전담 개발팀 지원, API/SDK 통합 문서, 샌드박스 환경, 기술 자문 등이 제공됩니다. Platinum 티어 파트너에게는 24/7 전담 지원이 제공되며, 공동 제품 개발 프로젝트도 진행할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>함께 성장해요!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN 생태계의 파트너가 되어<br />
            4억 TBURN 인센티브를 받으세요!
          </p>
          <button 
            className="connect-btn" 
            style={{ background: 'var(--white)', color: 'var(--violet)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-apply"
            onClick={() => { 
              scrollToSection('tiers'); 
              toast({ title: "파트너 신청", description: "자신에게 맞는 파트너 티어를 선택하세요!" }); 
            }}
          >
            파트너 신청하기
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
