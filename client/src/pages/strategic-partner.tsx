import { useState } from "react";
import { Link } from "wouter";
import { TBurnLogo } from "@/components/tburn-logo";

export default function StrategicPartnerPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [activeTab, setActiveTab] = useState("enterprise");

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const enterpriseLogos = [
    { icon: "🏛️", name: "엔터프라이즈" },
    { icon: "🔗", name: "프로토콜" },
    { icon: "💰", name: "기관투자자" },
    { icon: "🏢", name: "기업" },
    { icon: "🎓", name: "연구기관" },
  ];

  const distributions = [
    { id: "enterprise", icon: "🏛️", name: "엔터프라이즈", amount: "0.8억", percent: "40%" },
    { id: "protocol", icon: "🔗", name: "프로토콜 통합", amount: "0.4억", percent: "20%" },
    { id: "institutional", icon: "💰", name: "기관 투자자", amount: "0.4억", percent: "20%" },
    { id: "government", icon: "🏢", name: "공공기관", amount: "0.2억", percent: "10%" },
    { id: "academic", icon: "🎓", name: "학술/연구", amount: "0.2억", percent: "10%" },
  ];

  const partnerTiers = [
    { id: "diamond", icon: "💎", name: "Diamond", subtitle: "최상위 전략 파트너", incentive: "최대 5,000만", requirement: "$10M+ 가치 제공", benefits: ["전용 기술 팀 배정", "맞춤형 솔루션 개발", "이사회 참여권", "독점 거버넌스 권한", "연간 오프라인 서밋"], color: "#B9F2FF" },
    { id: "platinum", icon: "🏆", name: "Platinum", subtitle: "프리미엄 파트너", incentive: "최대 2,000만", requirement: "$5M+ 가치 제공", benefits: ["우선 기술 지원", "공동 마케팅", "분기별 전략 미팅", "거버넌스 투표권", "VIP 이벤트"], color: "#E5E4E2" },
    { id: "gold", icon: "👑", name: "Gold", subtitle: "핵심 파트너", incentive: "최대 500만", requirement: "$1M+ 가치 제공", benefits: ["기술 통합 지원", "마케팅 협업", "월간 리포트", "DAO 참여권", "파트너 네트워킹"], color: "#D4AF37" },
    { id: "silver", icon: "🥈", name: "Silver", subtitle: "성장 파트너", incentive: "최대 100만", requirement: "$100K+ 가치 제공", benefits: ["기술 문서 접근", "기본 지원", "분기별 업데이트", "커뮤니티 접근", "파트너 뱃지"], color: "#C0C0C0" },
  ];

  const partnershipTypes = [
    { icon: "🏛️", title: "엔터프라이즈 솔루션", desc: "대기업 맞춤형 블록체인 솔루션", features: ["프라이빗 체인 구축", "API 통합", "보안 감사", "24/7 지원"] },
    { icon: "🔗", title: "프로토콜 통합", desc: "DeFi 및 Web3 프로토콜 연동", features: ["크로스체인 브릿지", "유동성 풀", "스마트 컨트랙트", "오라클 연동"] },
    { icon: "💰", title: "기관 투자", desc: "기관 투자자 전용 프로그램", features: ["커스터디 서비스", "OTC 거래", "세금 리포트", "규제 컴플라이언스"] },
    { icon: "🏢", title: "공공 파트너십", desc: "정부 및 공공기관 협력", features: ["공공 인프라", "디지털 신원", "투명성 시스템", "시민 서비스"] },
    { icon: "🎓", title: "학술 연구", desc: "대학 및 연구소 협력", features: ["연구 그랜트", "인턴십", "논문 지원", "기술 자문"] },
    { icon: "🌐", title: "글로벌 확장", desc: "해외 시장 진출 지원", features: ["현지화 지원", "규제 자문", "파트너 연결", "마케팅 지원"] },
  ];

  const processSteps = [
    { icon: "📋", title: "문의 접수", desc: "파트너십 의향서 제출", duration: "1-3일" },
    { icon: "🔍", title: "실사 & 평가", desc: "비즈니스/기술 검토", duration: "2-4주" },
    { icon: "💼", title: "조건 협상", desc: "파트너십 조건 협의", duration: "2-4주" },
    { icon: "📝", title: "계약 체결", desc: "법적 계약 서명", duration: "1-2주" },
    { icon: "🚀", title: "온보딩", desc: "기술 통합 및 런칭", duration: "4-8주" },
  ];

  const benefits = [
    { icon: "🔧", title: "맞춤형 기술 지원", desc: "전담 엔지니어 팀이 기업별 요구사항에 맞는 솔루션을 개발합니다." },
    { icon: "📈", title: "성장 가속화", desc: "TBURN 생태계의 자원과 네트워크를 활용하여 비즈니스 성장을 지원합니다." },
    { icon: "🛡️", title: "보안 & 규제 준수", desc: "엔터프라이즈급 보안과 글로벌 규제 컴플라이언스를 보장합니다." },
    { icon: "🤝", title: "전략적 네트워킹", desc: "업계 리더들과의 네트워킹 기회 및 공동 사업 기회를 제공합니다." },
    { icon: "💎", title: "독점 혜택", desc: "얼리 액세스, 거버넌스 참여, 특별 인센티브 등 독점 혜택을 누립니다." },
    { icon: "📊", title: "데이터 인사이트", desc: "온체인 분석 및 맞춤형 리포트를 통한 비즈니스 인텔리전스를 제공합니다." },
  ];

  const currentPartners = [
    { icon: "🏛️", name: "Global Tech Corp", type: "Enterprise", tier: "diamond", investment: "$15M", since: "2024.01" },
    { icon: "🔗", name: "DeFi Protocol X", type: "Protocol", tier: "platinum", investment: "$8M", since: "2024.03" },
    { icon: "💰", name: "Crypto Fund Alpha", type: "Institutional", tier: "platinum", investment: "$12M", since: "2024.02" },
    { icon: "🏢", name: "City of Seoul", type: "Government", tier: "gold", investment: "$2M", since: "2024.04" },
  ];

  const useCases = {
    enterprise: { title: "엔터프라이즈 블록체인", desc: "대기업을 위한 프라이빗 블록체인 솔루션을 제공합니다. 공급망 관리, 자산 토큰화, 내부 결제 시스템 등 다양한 유스케이스에 적용 가능합니다.", features: ["프라이빗 체인 구축", "API 통합 지원", "엔터프라이즈 보안", "24/7 기술 지원"], stats: [{ value: "99.99%", label: "가동률" }, { value: "< 100ms", label: "응답시간" }, { value: "무제한", label: "처리량" }, { value: "ISO 27001", label: "보안 인증" }] },
    protocol: { title: "프로토콜 통합", desc: "DeFi 프로토콜과의 원활한 통합을 지원합니다. 크로스체인 브릿지, 유동성 풀, DEX 연동 등을 제공합니다.", features: ["크로스체인 브릿지", "유동성 인센티브", "스마트 컨트랙트 감사", "실시간 오라클"], stats: [{ value: "$500M+", label: "TVL" }, { value: "15+", label: "프로토콜 연동" }, { value: "1M+", label: "일일 트랜잭션" }, { value: "5개", label: "체인 지원" }] },
    institutional: { title: "기관 투자자", desc: "규제 준수 기관 투자자를 위한 전용 서비스를 제공합니다. 커스터디, OTC 거래, 세금 리포트 등을 지원합니다.", features: ["규제 준수 커스터디", "대량 OTC 거래", "세금 리포트", "프라이빗 투자 라운드"], stats: [{ value: "$100M+", label: "AUM" }, { value: "50+", label: "기관 파트너" }, { value: "24/7", label: "OTC 데스크" }, { value: "글로벌", label: "규제 준수" }] },
  };

  const currentUseCase = useCases[activeTab as keyof typeof useCases];

  return (
    <div className="strategic-partner-page">
      <style>{`
        .strategic-partner-page {
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
          --diamond: #B9F2FF;
          --platinum: #E5E4E2;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-strategic: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
          --gradient-diamond: linear-gradient(135deg, #B9F2FF 0%, #7DD3FC 50%, #B9F2FF 100%);
          --gradient-platinum: linear-gradient(135deg, #E5E4E2 0%, #A9A9A9 50%, #E5E4E2 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes diamondShine { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.3); } }
        @keyframes building { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        .strategic-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(26, 54, 93, 0.3);
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
        .nav-links a:hover { color: var(--gold); }

        .connect-btn {
          background: var(--gradient-strategic);
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
          box-shadow: 0 10px 40px rgba(26, 54, 93, 0.4);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(26, 54, 93, 0.3) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(26, 54, 93, 0.25) 0%, transparent 70%);
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
          background: rgba(26, 54, 93, 0.3);
          border: 1px solid rgba(26, 54, 93, 0.5);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--gold);
          margin-bottom: 2rem;
        }

        .badge .building-icon { animation: building 2s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--light-gray);
          max-width: 750px;
          margin: 0 auto 3rem;
        }

        .enterprise-banner {
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.2), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(26, 54, 93, 0.4);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .enterprise-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .enterprise-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .enterprise-logo-icon {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          transition: all 0.3s;
        }

        .enterprise-logo-icon:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: var(--gold);
          transform: scale(1.1);
        }

        .enterprise-logo-name { font-size: 0.75rem; color: var(--gray); }

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
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-gold);
          color: var(--dark);
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
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
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

        .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(26, 54, 93, 0.3);
          color: var(--gold);
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
          border-color: var(--gold);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.enterprise::before { background: var(--gradient-strategic); }
        .dist-card.protocol::before { background: linear-gradient(90deg, var(--purple), var(--indigo)); }
        .dist-card.institutional::before { background: var(--gradient-gold); }
        .dist-card.government::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }
        .dist-card.academic::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--gold); margin-bottom: 0.25rem; }
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

        .tier-card.diamond { border-color: var(--diamond); box-shadow: 0 0 40px rgba(185, 242, 255, 0.2); }
        .tier-card.platinum { border-color: var(--platinum); }
        .tier-card.gold { border-color: var(--gold); }
        .tier-card.silver { border-color: #C0C0C0; }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.diamond .tier-header { background: linear-gradient(180deg, rgba(185, 242, 255, 0.15) 0%, transparent 100%); }
        .tier-card.platinum .tier-header { background: linear-gradient(180deg, rgba(229, 228, 226, 0.1) 0%, transparent 100%); }
        .tier-card.gold .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.silver .tier-header { background: linear-gradient(180deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-card.diamond .tier-icon { animation: diamondShine 2s ease-in-out infinite; }

        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.diamond .tier-name { color: var(--diamond); }
        .tier-card.platinum .tier-name { color: var(--platinum); }
        .tier-card.gold .tier-name { color: var(--gold); }
        .tier-card.silver .tier-name { color: #C0C0C0; }

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

        .tier-card.diamond .tier-incentive-value { color: var(--diamond); }
        .tier-card.platinum .tier-incentive-value { color: var(--platinum); }
        .tier-card.gold .tier-incentive-value { color: var(--gold); }
        .tier-card.silver .tier-incentive-value { color: #C0C0C0; }

        .tier-requirement {
          font-size: 0.8rem;
          color: var(--gray);
          text-align: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

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

        .tier-card.diamond .tier-btn { background: var(--gradient-diamond); color: var(--dark); }
        .tier-card.platinum .tier-btn { background: var(--gradient-platinum); color: var(--dark); }
        .tier-card.gold .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.silver .tier-btn { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }

        .tier-btn:hover { transform: scale(1.02); }

        .partnership-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .partnership-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          transition: all 0.3s;
        }

        .partnership-card:hover {
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .partnership-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.3), rgba(59, 130, 246, 0.2));
        }

        .partnership-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .partnership-card p { font-size: 0.9rem; color: var(--gray); margin-bottom: 1.5rem; }

        .partnership-features { list-style: none; padding: 0; }

        .partnership-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .partnership-features li::before { content: '✓'; color: var(--success); }

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
          background: linear-gradient(90deg, var(--navy), var(--blue), var(--indigo), var(--gold), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--navy); }
        .process-item:nth-child(2) .process-dot { background: var(--blue); }
        .process-item:nth-child(3) .process-dot { background: var(--indigo); }
        .process-item:nth-child(4) .process-dot { background: var(--gold); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--gold); font-weight: 600; margin-top: 0.5rem; }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .benefit-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .benefit-card:hover {
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .benefit-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(245, 158, 11, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .benefit-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; }
        .benefit-card p { font-size: 0.9rem; color: var(--light-gray); }

        .use-cases-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .use-case-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .use-case-tab {
          flex: 1;
          padding: 1.5rem;
          background: transparent;
          border: none;
          color: var(--light-gray);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border-bottom: 2px solid transparent;
        }

        .use-case-tab.active {
          color: var(--gold);
          background: rgba(212, 175, 55, 0.05);
          border-bottom-color: var(--gold);
        }

        .use-case-content { padding: 2rem; }

        .use-case-item {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: center;
        }

        .use-case-info h4 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .use-case-info p { color: var(--light-gray); margin-bottom: 1.5rem; line-height: 1.8; }

        .use-case-features { list-style: none; padding: 0; }

        .use-case-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.95rem;
          color: var(--light-gray);
        }

        .use-case-features li::before { content: '✓'; color: var(--gold); }

        .use-case-image {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 2rem;
        }

        .stats-display {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .use-case-stat {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          text-align: center;
        }

        .use-case-stat .value { font-size: 1.75rem; font-weight: 800; color: var(--gold); margin-bottom: 0.25rem; }
        .use-case-stat .label { font-size: 0.8rem; color: var(--gray); }

        .partners-showcase {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .partner-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .partner-item:hover {
          background: rgba(212, 175, 55, 0.05);
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .partner-item-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .partner-item-logo {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.3), rgba(59, 130, 246, 0.2));
        }

        .partner-item-info h5 { font-size: 1rem; font-weight: 700; }
        .partner-item-info p { font-size: 0.75rem; color: var(--gray); }

        .partner-item-tier {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .partner-item-tier.diamond { background: rgba(185, 242, 255, 0.2); color: var(--diamond); }
        .partner-item-tier.platinum { background: rgba(229, 228, 226, 0.2); color: var(--platinum); }
        .partner-item-tier.gold { background: rgba(212, 175, 55, 0.2); color: var(--gold); }

        .partner-item-stats {
          display: flex;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
        }

        .partner-item-stats .label { color: var(--gray); }
        .partner-item-stats .value { color: var(--gold); font-weight: 600; }

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

        .faq-chevron { color: var(--gold); transition: transform 0.3s; }
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
          background: var(--gradient-strategic);
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

        .social-links a:hover { background: var(--gold); color: var(--dark); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--gold); }

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
          .partnership-types-grid, .benefits-grid { grid-template-columns: repeat(2, 1fr); }
          .partners-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .use-case-item { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .tiers-grid, .partnership-types-grid, .benefits-grid { grid-template-columns: 1fr; }
          .partners-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="strategic-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#tiers">파트너 티어</a>
            <a href="#types">파트너십 유형</a>
            <a href="#benefits">혜택</a>
            <a href="#use-cases">유스케이스</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button className="connect-btn" data-testid="button-connect-wallet">
            🔗 문의하기
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="building-icon">🏛️</span> STRATEGIC PARTNERSHIP - 엔터프라이즈 파트너십
          </div>
          <h1>
            전략적 파트너십으로<br />
            <span className="gradient-text">2억 TBURN</span> 인센티브
          </h1>
          <p className="hero-subtitle">
            엔터프라이즈, 기관 투자자, 대형 프로토콜과의 전략적 파트너십을 통해
            TBURN 생태계의 핵심 파트너가 되세요.
          </p>

          <div className="enterprise-banner" data-testid="enterprise-banner">
            <div className="enterprise-logos">
              {enterpriseLogos.map((logo, idx) => (
                <div key={idx} className="enterprise-logo">
                  <div className="enterprise-logo-icon">{logo.icon}</div>
                  <span className="enterprise-logo-name">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-strategic">
              <div className="stat-value">2억</div>
              <div className="stat-label">총 전략 파트너 예산</div>
            </div>
            <div className="stat-card" data-testid="stat-partners">
              <div className="stat-value">25+</div>
              <div className="stat-label">전략 파트너</div>
            </div>
            <div className="stat-card" data-testid="stat-tvl">
              <div className="stat-value">$500M+</div>
              <div className="stat-label">파트너 TVL</div>
            </div>
            <div className="stat-card" data-testid="stat-max-incentive">
              <div className="stat-value">5,000만</div>
              <div className="stat-label">최대 인센티브</div>
            </div>
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-apply-strategic">
              🏛️ 파트너십 문의
            </button>
            <button className="btn-secondary">
              📖 엔터프라이즈 가이드
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">전략 예산 배분</h2>
          <p className="section-subtitle">2억 TBURN이 5개 전략 분야로 배분됩니다</p>
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
          <h2 className="section-title">전략 파트너 티어</h2>
          <p className="section-subtitle">기여도와 투자 규모에 따른 차등 혜택</p>
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
                <div className="tier-requirement">{tier.requirement}</div>
                <ul className="tier-benefits">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <button className="tier-btn">문의하기</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership Types Section */}
      <section className="section" id="types">
        <div className="section-header">
          <span className="section-badge">PARTNERSHIP TYPES</span>
          <h2 className="section-title">파트너십 유형</h2>
          <p className="section-subtitle">다양한 전략적 협력 방식</p>
        </div>

        <div className="partnership-types-grid">
          {partnershipTypes.map((type, idx) => (
            <div key={idx} className="partnership-card">
              <div className="partnership-icon">{type.icon}</div>
              <h3>{type.title}</h3>
              <p>{type.desc}</p>
              <ul className="partnership-features">
                {type.features.map((feature, fidx) => (
                  <li key={fidx}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">파트너십 프로세스</h2>
          <p className="section-subtitle">전략 파트너 온보딩 과정</p>
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

      {/* Benefits Section */}
      <section className="section" id="benefits">
        <div className="section-header">
          <span className="section-badge">BENEFITS</span>
          <h2 className="section-title">전략 파트너 혜택</h2>
          <p className="section-subtitle">전략 파트너만을 위한 특별 혜택</p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h4>{benefit.title}</h4>
              <p>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section" id="use-cases" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">USE CASES</span>
          <h2 className="section-title">활용 사례</h2>
          <p className="section-subtitle">전략 파트너십 활용 시나리오</p>
        </div>

        <div className="use-cases-container">
          <div className="use-case-tabs">
            <button className={`use-case-tab ${activeTab === 'enterprise' ? 'active' : ''}`} onClick={() => setActiveTab('enterprise')}>
              🏛️ 엔터프라이즈
            </button>
            <button className={`use-case-tab ${activeTab === 'protocol' ? 'active' : ''}`} onClick={() => setActiveTab('protocol')}>
              🔗 프로토콜
            </button>
            <button className={`use-case-tab ${activeTab === 'institutional' ? 'active' : ''}`} onClick={() => setActiveTab('institutional')}>
              💰 기관 투자자
            </button>
          </div>
          <div className="use-case-content">
            <div className="use-case-item">
              <div className="use-case-info">
                <h4>{currentUseCase.title}</h4>
                <p>{currentUseCase.desc}</p>
                <ul className="use-case-features">
                  {currentUseCase.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="use-case-image">
                <div className="stats-display">
                  {currentUseCase.stats.map((stat, idx) => (
                    <div key={idx} className="use-case-stat">
                      <div className="value">{stat.value}</div>
                      <div className="label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Partners Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">PARTNERS</span>
          <h2 className="section-title">현재 전략 파트너</h2>
          <p className="section-subtitle">함께하는 글로벌 파트너</p>
        </div>

        <div className="partners-showcase">
          <div className="partners-grid">
            {currentPartners.map((partner, idx) => (
              <div key={idx} className="partner-item">
                <div className="partner-item-header">
                  <div className="partner-item-logo">{partner.icon}</div>
                  <div className="partner-item-info">
                    <h5>{partner.name}</h5>
                    <p>{partner.type}</p>
                  </div>
                </div>
                <span className={`partner-item-tier ${partner.tier}`}>{partner.tier.toUpperCase()}</span>
                <div className="partner-item-stats">
                  <div>
                    <span className="label">투자 규모</span>
                    <div className="value">{partner.investment}</div>
                  </div>
                  <div>
                    <span className="label">파트너십</span>
                    <div className="value">{partner.since}</div>
                  </div>
                </div>
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
          <p className="section-subtitle">전략 파트너십에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>전략 파트너가 되려면 어떤 조건이 필요한가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>전략 파트너십은 최소 $100K 이상의 가치 제공(투자, 기술 통합, 비즈니스 협력 등)이 필요합니다. 티어에 따라 $100K(Silver)부터 $10M+(Diamond)까지 다양한 수준의 파트너십을 운영하고 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>파트너십 인센티브는 어떻게 지급되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>인센티브는 베스팅 스케줄에 따라 지급됩니다. 일반적으로 12-24개월에 걸쳐 분할 지급되며, 초기 언락 후 월/분기별로 지급됩니다. 마일스톤 달성에 따른 성과 기반 보너스도 별도로 지급됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>기관 투자자를 위한 특별 프로그램이 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>네, 기관 투자자를 위한 전용 프로그램을 운영합니다. 규제 준수 커스터디, 대량 OTC 거래, 세금 리포트, 프라이빗 투자 라운드 참여 기회 등을 제공합니다. 별도 문의를 통해 상세 안내를 받으실 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>파트너십 체결까지 얼마나 걸리나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>일반적으로 문의 접수부터 온보딩 완료까지 8-16주가 소요됩니다. 파트너십 규모와 복잡성에 따라 기간이 달라질 수 있으며, 긴급한 경우 패스트트랙 프로세스를 통해 일정을 단축할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>전략적 파트너가 되세요</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN 생태계의 핵심 파트너로<br />
            2억 TBURN 인센티브를 받으세요!
          </p>
          <button className="btn-primary" style={{ fontSize: '1.25rem', padding: '20px 50px' }}>
            🏛️ 파트너십 문의하기
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
              <a href="#">𝕏</a>
              <a href="#">✈</a>
              <a href="#">💬</a>
              <a href="#">⌘</a>
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
              <li><Link href="/learn/whitepaper">백서</Link></li>
              <li><Link href="/developers/docs">문서</Link></li>
              <li><a href="#">GitHub</a></li>
              <li><Link href="/security-audit">감사 보고서</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><Link href="/community/news">블로그</Link></li>
              <li><a href="#">앰배서더</a></li>
              <li><a href="#">그랜트</a></li>
              <li><Link href="/qna">고객지원</Link></li>
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
