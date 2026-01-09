import { useState } from "react";
import { TBurnLogo } from "@/components/tburn-logo";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";

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
    totalBudget: string;
    spent: string;
    campaigns: number;
    activeCampaigns: number;
    reach: string;
    conversions: number;
  };
  advisors: {
    total: number;
    allocation: string;
    vesting: string;
    unlocked: number;
  };
  strategicPartners: Array<{
    name: string;
    type: string;
    allocation: string;
  }>;
}

interface PartnershipStatsResponse {
  success: boolean;
  data: PartnershipStatsData;
}

export default function AdvisorProgramPage() {
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { toast } = useToast();

  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<PartnershipStatsResponse>({
    queryKey: ['/api/token-programs/partnerships/stats'],
  });
  const advisorData = statsResponse?.data?.advisors;

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
      await connect("metamask");
      toast({ title: "지갑 연결", description: "지갑이 연결되었습니다." });
    }
  };

  const handleApplyAdvisor = () => {
    scrollToSection('roles');
    toast({ title: "자문단 지원", description: "자문 분야를 확인하고 지원해주세요!" });
  };

  const handleViewGuide = () => {
    scrollToSection('process');
    toast({ title: "자문단 가이드", description: "지원 절차를 확인하세요." });
  };

  const handleApplyRole = (roleTitle: string) => {
    if (!isConnected) {
      toast({ 
        title: "지갑 연결 필요", 
        description: "자문단 지원을 위해 먼저 지갑을 연결해주세요.",
        variant: "destructive"
      });
      return;
    }
    toast({ 
      title: `${roleTitle} 지원`, 
      description: `${roleTitle} 지원서가 접수되었습니다. 서류 심사 후 연락드리겠습니다.`
    });
  };

  const handleApplyTier = (tierName: string, incentive: string) => {
    if (!isConnected) {
      toast({ 
        title: "지갑 연결 필요", 
        description: "자문단 지원을 위해 먼저 지갑을 연결해주세요.",
        variant: "destructive"
      });
      return;
    }
    toast({ 
      title: `${tierName} 지원`, 
      description: `${tierName}(${incentive} TBURN) 지원이 접수되었습니다. 심사 후 안내드립니다.`
    });
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({ title: `${platform}`, description: `${platform} 페이지로 이동합니다.` });
  };

  const advisorPreviews = [
    { initial: "JK", name: "Dr. John Kim", role: "기술 자문", type: "tech" },
    { initial: "SP", name: "Sarah Park", role: "비즈니스 자문", type: "business" },
    { initial: "ML", name: "Michael Lee", role: "법률 자문", type: "legal" },
    { initial: "EC", name: "Emma Choi", role: "학술 자문", type: "academic" },
  ];

  const distributions = [
    { id: "tech", icon: "💻", name: "기술 자문", amount: "0.6억", percent: "30%" },
    { id: "business", icon: "📊", name: "비즈니스 자문", amount: "0.4억", percent: "20%" },
    { id: "legal", icon: "⚖️", name: "법률 자문", amount: "0.4억", percent: "20%" },
    { id: "academic", icon: "🎓", name: "학술 자문", amount: "0.3억", percent: "15%" },
    { id: "industry", icon: "🏭", name: "산업 자문", amount: "0.3억", percent: "15%" },
  ];

  const advisorRoles = [
    { id: "tech", icon: "💻", title: "기술 자문위원", subtitle: "블록체인, AI, 보안 전문가", rewards: [{ value: "최대 1,000만", label: "연간 보상" }, { value: "분기별", label: "기술 리뷰" }], responsibilities: ["코드 리뷰 및 아키텍처 자문", "보안 감사 참여", "기술 로드맵 검토", "신기술 트렌드 분석"] },
    { id: "business", icon: "📊", title: "비즈니스 자문위원", subtitle: "경영, 전략, 마케팅 전문가", rewards: [{ value: "최대 800만", label: "연간 보상" }, { value: "월간", label: "전략 미팅" }], responsibilities: ["사업 전략 자문", "파트너십 네트워킹", "시장 분석 및 인사이트", "성장 전략 수립"] },
    { id: "legal", icon: "⚖️", title: "법률 자문위원", subtitle: "블록체인 규제, 컴플라이언스", rewards: [{ value: "최대 800만", label: "연간 보상" }, { value: "수시", label: "법률 검토" }], responsibilities: ["규제 동향 분석", "컴플라이언스 자문", "계약 검토", "리스크 관리"] },
    { id: "academic", icon: "🎓", title: "학술 자문위원", subtitle: "대학 교수, 연구원", rewards: [{ value: "최대 600만", label: "연간 보상" }, { value: "분기별", label: "연구 협력" }], responsibilities: ["학술 연구 협력", "백서 검토", "교육 컨텐츠 개발", "학계 네트워킹"] },
  ];

  const advisorTiers = [
    { id: "principal", icon: "👑", name: "Principal Advisor", subtitle: "수석 자문위원", incentive: "최대 1,500만", requirement: "10년+ 경력, 업계 리더", benefits: ["전용 팀 배정", "이사회 참관권", "독점 정보 접근", "연간 오프라인 서밋", "VIP 네트워킹"] },
    { id: "senior", icon: "⭐", name: "Senior Advisor", subtitle: "시니어 자문위원", incentive: "최대 800만", requirement: "5년+ 경력, 전문가", benefits: ["우선 지원", "분기별 전략 미팅", "얼리 액세스", "거버넌스 참여", "파트너 네트워킹"] },
    { id: "advisor", icon: "💡", name: "Advisor", subtitle: "자문위원", incentive: "최대 400만", requirement: "3년+ 경력, 전문 분야", benefits: ["월간 미팅", "기술 문서 접근", "커뮤니티 참여", "기본 인센티브", "성장 기회"] },
  ];

  const currentAdvisors = [
    { initial: "JK", name: "Dr. John Kim", title: "CTO, Tech Corp", org: "기술 자문", type: "tech", tier: "principal" },
    { initial: "SP", name: "Sarah Park", title: "CEO, Growth VC", org: "비즈니스 자문", type: "business", tier: "principal" },
    { initial: "ML", name: "Michael Lee", title: "Partner, Law Firm", org: "법률 자문", type: "legal", tier: "senior" },
    { initial: "EC", name: "Prof. Emma Choi", title: "Professor, KAIST", org: "학술 자문", type: "academic", tier: "senior" },
  ];

  const processSteps = [
    { icon: "📋", title: "지원서 제출", desc: "온라인 지원서 작성", duration: "1-3일" },
    { icon: "🔍", title: "1차 심사", desc: "서류 검토 및 평가", duration: "1-2주" },
    { icon: "💬", title: "인터뷰", desc: "심층 면접 진행", duration: "1-2주" },
    { icon: "📝", title: "계약 체결", desc: "자문 계약 서명", duration: "1주" },
    { icon: "🚀", title: "온보딩", desc: "자문 활동 시작", duration: "1주" },
  ];

  const compensations = [
    { icon: "💰", title: "토큰 인센티브", desc: "분기별 TBURN 토큰 지급", value: "최대 1,500만 TBURN/년" },
    { icon: "📈", title: "성과 보너스", desc: "목표 달성시 추가 보상", value: "기본 보상의 50%까지" },
    { icon: "🎁", title: "특별 혜택", desc: "이벤트 초대, NFT 에어드랍", value: "연간 다양한 혜택" },
  ];

  return (
    <div className="advisor-program-page">
      <style>{`
        .advisor-program-page {
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
          --amber: #F59E0B;
          --teal: #14B8A6;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-advisor: linear-gradient(135deg, #F59E0B 0%, #D4AF37 100%);
          --gradient-tech: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
          --gradient-business: linear-gradient(135deg, #10B981 0%, #14B8A6 100%);
          --gradient-legal: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
          --gradient-academic: linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes lightbulb { 0%, 100% { filter: brightness(1); transform: scale(1); } 50% { filter: brightness(1.3); transform: scale(1.1); } }

        .advisor-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(245, 158, 11, 0.2);
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
        .nav-links a:hover { color: var(--amber); }

        .connect-btn {
          background: var(--gradient-advisor);
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
          box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
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
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--amber);
          margin-bottom: 2rem;
        }

        .badge .lightbulb-icon { animation: lightbulb 2s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-advisor);
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

        .advisor-showcase {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .advisor-preview {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .advisor-preview:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .advisor-preview-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--white);
        }

        .advisor-preview-avatar.tech { background: var(--gradient-tech); }
        .advisor-preview-avatar.business { background: var(--gradient-business); }
        .advisor-preview-avatar.legal { background: var(--gradient-legal); }
        .advisor-preview-avatar.academic { background: var(--gradient-academic); }

        .advisor-preview-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.25rem; }
        .advisor-preview-role { font-size: 0.75rem; color: var(--gray); }

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
          border-color: var(--amber);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-advisor);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-advisor);
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
          box-shadow: 0 20px 60px rgba(245, 158, 11, 0.3);
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

        .btn-secondary:hover { border-color: var(--amber); color: var(--amber); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(245, 158, 11, 0.15);
          color: var(--amber);
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
          border-color: var(--amber);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.tech::before { background: var(--gradient-tech); }
        .dist-card.business::before { background: var(--gradient-business); }
        .dist-card.legal::before { background: var(--gradient-legal); }
        .dist-card.academic::before { background: var(--gradient-academic); }
        .dist-card.industry::before { background: var(--gradient-advisor); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .role-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .role-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          border-color: var(--amber);
        }

        .role-header {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .role-card.tech .role-header { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), transparent); }
        .role-card.business .role-header { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), transparent); }
        .role-card.legal .role-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), transparent); }
        .role-card.academic .role-header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), transparent); }

        .role-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .role-card.tech .role-icon { background: rgba(59, 130, 246, 0.2); }
        .role-card.business .role-icon { background: rgba(16, 185, 129, 0.2); }
        .role-card.legal .role-icon { background: rgba(139, 92, 246, 0.2); }
        .role-card.academic .role-icon { background: rgba(6, 182, 212, 0.2); }

        .role-info h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
        .role-info p { font-size: 0.9rem; color: var(--gray); }

        .role-content { padding: 0 2rem 2rem; }

        .role-rewards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .role-reward-box {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          text-align: center;
        }

        .role-reward-box .value { font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-bottom: 0.25rem; }
        .role-reward-box .label { font-size: 0.75rem; color: var(--gray); }

        .role-responsibilities { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .role-responsibilities li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .role-responsibilities li:last-child { border-bottom: none; }
        .role-responsibilities li::before { content: '✓'; color: var(--success); }

        .role-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          color: var(--white);
        }

        .role-card.tech .role-btn { background: var(--gradient-tech); }
        .role-card.business .role-btn { background: var(--gradient-business); }
        .role-card.legal .role-btn { background: var(--gradient-legal); }
        .role-card.academic .role-btn { background: var(--gradient-academic); }

        .role-btn:hover { transform: scale(1.02); }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
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

        .tier-card.principal { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.senior { border-color: var(--amber); }
        .tier-card.advisor { border-color: var(--cyan); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.principal .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.senior .tier-header { background: linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%); }
        .tier-card.advisor .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.principal .tier-name { color: var(--gold); }
        .tier-card.senior .tier-name { color: var(--amber); }
        .tier-card.advisor .tier-name { color: var(--cyan); }

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
        .tier-incentive-value { font-size: 1.5rem; font-weight: 800; }

        .tier-card.principal .tier-incentive-value { color: var(--gold); }
        .tier-card.senior .tier-incentive-value { color: var(--amber); }
        .tier-card.advisor .tier-incentive-value { color: var(--cyan); }

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

        .tier-card.principal .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.senior .tier-btn { background: var(--gradient-advisor); color: var(--dark); }
        .tier-card.advisor .tier-btn { background: var(--gradient-academic); color: var(--white); }

        .tier-btn:hover { transform: scale(1.02); }

        .advisors-showcase {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .advisors-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .advisor-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .advisor-card:hover {
          background: rgba(245, 158, 11, 0.05);
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .advisor-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          position: relative;
          color: var(--white);
        }

        .advisor-avatar.tech { background: var(--gradient-tech); }
        .advisor-avatar.business { background: var(--gradient-business); }
        .advisor-avatar.legal { background: var(--gradient-legal); }
        .advisor-avatar.academic { background: var(--gradient-academic); }

        .advisor-tier-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          border: 2px solid var(--dark-card);
        }

        .advisor-tier-badge.principal { background: var(--gold); }
        .advisor-tier-badge.senior { background: var(--amber); }

        .advisor-card-name { font-weight: 700; margin-bottom: 0.25rem; }
        .advisor-card-title { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }
        .advisor-card-org { font-size: 0.75rem; color: var(--amber); }

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
          background: linear-gradient(90deg, var(--blue), var(--purple), var(--amber), var(--gold), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--blue); }
        .process-item:nth-child(2) .process-dot { background: var(--purple); }
        .process-item:nth-child(3) .process-dot { background: var(--amber); }
        .process-item:nth-child(4) .process-dot { background: var(--gold); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--amber); font-weight: 600; margin-top: 0.5rem; }

        .compensation-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .compensation-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .compensation-card:hover {
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .compensation-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(212, 175, 55, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .compensation-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; }
        .compensation-card p { font-size: 0.9rem; color: var(--light-gray); margin-bottom: 1rem; }
        .compensation-value { font-size: 1.25rem; font-weight: 800; color: var(--amber); }

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

        .faq-chevron { color: var(--amber); transition: transform 0.3s; }
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
          background: var(--gradient-advisor);
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

        .social-links a:hover { background: var(--amber); color: var(--dark); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--amber); }

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
          .roles-grid, .tiers-grid, .compensation-grid { grid-template-columns: 1fr; }
          .advisors-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .advisor-showcase { grid-template-columns: repeat(2, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .advisor-showcase { grid-template-columns: 1fr; }
          .advisors-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="advisor-header">
        <div className="header-container">
          <a href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </a>
          <nav className="nav-links">
            <a 
              href="#roles" 
              onClick={(e) => { e.preventDefault(); scrollToSection('roles'); }}
              data-testid="nav-roles"
            >자문 분야</a>
            <a 
              href="#tiers" 
              onClick={(e) => { e.preventDefault(); scrollToSection('tiers'); }}
              data-testid="nav-tiers"
            >티어</a>
            <a 
              href="#advisors" 
              onClick={(e) => { e.preventDefault(); scrollToSection('advisors'); }}
              data-testid="nav-advisors"
            >현재 자문단</a>
            <a 
              href="#process" 
              onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}
              data-testid="nav-process"
            >지원 절차</a>
            <a 
              href="#faq" 
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="nav-faq"
            >FAQ</a>
          </nav>
          <button 
            className="connect-btn" 
            data-testid="button-connect-wallet"
            onClick={handleWalletClick}
          >
            {isConnected ? `${formatAddress(address || '')}` : '지갑 연결'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="lightbulb-icon">💡</span> ADVISOR PROGRAM - 전문가 자문단
          </div>
          <h1>
            TBURN 자문위원으로<br />
            <span className="gradient-text">2억 TBURN</span> 보상을 받으세요
          </h1>
          <p className="hero-subtitle">
            기술, 비즈니스, 법률, 학술 분야 전문가로 참여하여
            TBURN 생태계 발전에 기여하고 보상받으세요.
          </p>

          <div className="advisor-showcase" data-testid="advisor-showcase">
            {advisorPreviews.map((advisor, idx) => (
              <div key={idx} className="advisor-preview">
                <div className={`advisor-preview-avatar ${advisor.type}`}>
                  {advisor.initial}
                </div>
                <div className="advisor-preview-name">{advisor.name}</div>
                <div className="advisor-preview-role">{advisor.role}</div>
              </div>
            ))}
          </div>

          <div className="stats-grid" data-testid="advisor-stats-grid">
            <div className="stat-card" data-testid="stat-total-advisor">
              <div className="stat-value">
                {isLoadingStats ? '...' : advisorData?.allocation ? `${(parseInt(advisorData.allocation) / 1000000).toFixed(0)}M` : '2억'}
              </div>
              <div className="stat-label">총 자문 예산</div>
            </div>
            <div className="stat-card" data-testid="stat-advisors">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${advisorData?.total || 12}+`}
              </div>
              <div className="stat-label">현재 자문위원</div>
            </div>
            <div className="stat-card" data-testid="stat-fields">
              <div className="stat-value">
                {isLoadingStats ? '...' : `${advisorData?.unlocked || 8}명`}
              </div>
              <div className="stat-label">활성 자문위원</div>
            </div>
            <div className="stat-card" data-testid="stat-max-reward">
              <div className="stat-value">
                {isLoadingStats ? '...' : advisorData?.vesting || '24개월'}
              </div>
              <div className="stat-label">베스팅 기간</div>
            </div>
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply"
              onClick={handleApplyAdvisor}
            >
              자문단 지원하기
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-view-guide"
              onClick={handleViewGuide}
            >
              자문단 가이드
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">자문 예산 배분</h2>
          <p className="section-subtitle">2억 TBURN이 5개 자문 분야로 배분됩니다</p>
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

      {/* Advisor Roles Section */}
      <section className="section" id="roles" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">ROLES</span>
          <h2 className="section-title">자문 분야</h2>
          <p className="section-subtitle">전문 분야별 자문위원 역할</p>
        </div>

        <div className="roles-grid">
          {advisorRoles.map(role => (
            <div key={role.id} className={`role-card ${role.id}`} data-testid={`role-${role.id}`}>
              <div className="role-header">
                <div className="role-icon">{role.icon}</div>
                <div className="role-info">
                  <h3>{role.title}</h3>
                  <p>{role.subtitle}</p>
                </div>
              </div>
              <div className="role-content">
                <div className="role-rewards">
                  {role.rewards.map((reward, idx) => (
                    <div key={idx} className="role-reward-box">
                      <div className="value">{reward.value}</div>
                      <div className="label">{reward.label}</div>
                    </div>
                  ))}
                </div>
                <ul className="role-responsibilities">
                  {role.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
                <button 
                  className="role-btn"
                  data-testid={`button-apply-role-${role.id}`}
                  onClick={() => handleApplyRole(role.title)}
                >
                  지원하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advisor Tiers Section */}
      <section className="section" id="tiers">
        <div className="section-header">
          <span className="section-badge">TIERS</span>
          <h2 className="section-title">자문 티어</h2>
          <p className="section-subtitle">경력과 기여도에 따른 등급별 혜택</p>
        </div>

        <div className="tiers-grid">
          {advisorTiers.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.id}`} data-testid={`tier-${tier.id}`}>
              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-subtitle">{tier.subtitle}</p>
              </div>
              <div className="tier-content">
                <div className="tier-incentive">
                  <div className="tier-incentive-label">연간 인센티브</div>
                  <div className="tier-incentive-value">{tier.incentive} TBURN</div>
                </div>
                <div className="tier-requirement">{tier.requirement}</div>
                <ul className="tier-benefits">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <button 
                  className="tier-btn"
                  data-testid={`button-apply-tier-${tier.id}`}
                  onClick={() => handleApplyTier(tier.name, tier.incentive)}
                >
                  지원하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Current Advisors Section */}
      <section className="section" id="advisors" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">ADVISORS</span>
          <h2 className="section-title">현재 자문단</h2>
          <p className="section-subtitle">함께하는 전문가들</p>
        </div>

        <div className="advisors-showcase">
          <div className="advisors-grid">
            {currentAdvisors.map((advisor, idx) => (
              <div key={idx} className="advisor-card">
                <div className={`advisor-avatar ${advisor.type}`}>
                  {advisor.initial}
                  <span className={`advisor-tier-badge ${advisor.tier}`}>
                    {advisor.tier === 'principal' ? '👑' : '⭐'}
                  </span>
                </div>
                <div className="advisor-card-name">{advisor.name}</div>
                <div className="advisor-card-title">{advisor.title}</div>
                <div className="advisor-card-org">{advisor.org}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section" id="process">
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">지원 절차</h2>
          <p className="section-subtitle">자문위원 선발 과정</p>
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

      {/* Compensation Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">COMPENSATION</span>
          <h2 className="section-title">보상 체계</h2>
          <p className="section-subtitle">자문위원 보상 구성</p>
        </div>

        <div className="compensation-grid">
          {compensations.map((comp, idx) => (
            <div key={idx} className="compensation-card">
              <div className="compensation-icon">{comp.icon}</div>
              <h4>{comp.title}</h4>
              <p>{comp.desc}</p>
              <div className="compensation-value">{comp.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">자문 프로그램에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} data-testid="faq-item-1">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>자문 프로그램 총 예산 규모는 얼마인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>자문 프로그램에는 총 2억 TBURN이 배정되어 있습니다. 기술 자문 30%(0.6억), 비즈니스 자문 20%(0.4억), 법률 자문 20%(0.4억), 학술 자문 15%(0.3억), 산업 자문 15%(0.3억)로 배분됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} data-testid="faq-item-2">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>자문위원이 되려면 어떤 자격이 필요한가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>분야별로 최소 3년 이상의 경력이 필요하며, 해당 분야의 전문성을 증명할 수 있는 포트폴리오나 이력이 필요합니다. Principal Advisor는 10년 이상(최대 1,500만 TBURN), Senior Advisor는 5년 이상(최대 800만), Advisor는 3년 이상(최대 400만) 경력이 권장됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} data-testid="faq-item-3">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>자문 활동은 어떤 방식으로 진행되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>정기 미팅(월간/분기별), 문서 검토, 전략 자문, 네트워킹 등 다양한 방식으로 참여합니다. 온라인 미팅이 주를 이루며, 필요시 오프라인 워크숍도 진행됩니다. 자문 범위와 시간은 티어에 따라 달라집니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} data-testid="faq-item-4">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>보상은 어떻게 지급되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>토큰 인센티브는 분기별로 지급되며, 24개월 베스팅 스케줄에 따라 순차적으로 언락됩니다. 성과 보너스(기본 보상의 최대 50%)는 반기별 평가 후 지급되며, 이벤트 초대 및 NFT 에어드랍 등 특별 혜택도 수시로 제공됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} data-testid="faq-item-5">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>자문 계약 기간은 얼마인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>기본 계약 기간은 1년이며, 상호 합의에 따라 연장 가능합니다. 우수한 성과를 보이는 자문위원은 자동 갱신 옵션이 제공됩니다. 계약 종료 30일 전 통보 조항이 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} data-testid="faq-item-6">
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>지원 절차는 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>지원서 제출(1-3일) → 1차 서류 심사(1-2주) → 인터뷰(1-2주) → 계약 체결(1주) → 온보딩(1주)으로 총 5-7주가 소요됩니다. 긴급한 경우 패스트트랙 프로세스를 통해 일정 단축이 가능합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} data-testid="faq-item-7">
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>Principal Advisor의 특별 혜택은 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>Principal Advisor는 최대 1,500만 TBURN 연간 인센티브와 함께 전용 팀 배정, 이사회 참관권, 독점 정보 접근, 연간 오프라인 서밋 참여, VIP 네트워킹 등 최상위 혜택을 제공받습니다. 10년 이상의 업계 리더급 경력이 요구됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} data-testid="faq-item-8">
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>자문단 지원은 어떻게 하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>페이지 상단의 '자문단 지원하기' 버튼을 통해 신청하거나 advisor@tburn.io로 직접 연락하실 수 있습니다. 지갑 연결 후 지원하시면 더 빠른 검토가 가능합니다. 전담 팀이 1-2주 내 연락드립니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--dark)' }}>전문가 자문단에 합류하세요</h2>
          <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN 생태계의 전략적 파트너로<br />
            2억 TBURN 보상을 받으세요!
          </p>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--dark)', color: 'var(--white)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-cta-apply"
            onClick={() => { 
              scrollToSection('roles'); 
              toast({ title: "자문단 지원", description: "자문 분야를 확인하고 지금 지원하세요!" }); 
            }}
          >
            지금 지원하기
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
              <li><a href="/marketing-program" data-testid="footer-link-ambassador">앰배서더</a></li>
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
