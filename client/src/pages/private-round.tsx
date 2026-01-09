import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LanguageSelector } from "@/components/LanguageSelector";

interface InvestmentRound {
  name: string;
  status: string;
  allocation: string;
  price: string;
  raised: string;
  investors: number;
  vesting: string;
  unlocked: string;
}

interface InvestmentRoundsStatsData {
  rounds: InvestmentRound[];
  totalRaised: string;
  totalInvestors: number;
  nextUnlock: string;
}

interface InvestmentRoundsStatsResponse {
  success: boolean;
  data: InvestmentRoundsStatsData;
}

export default function PrivateRoundPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    investmentAmount: "",
    message: "",
  });
  const { toast } = useToast();
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();

  const { data: response, isLoading } = useQuery<InvestmentRoundsStatsResponse>({
    queryKey: ['/api/token-programs/investment-rounds/stats'],
  });
  const stats = response?.data;

  const privateRound = stats?.rounds?.find(r => r.name.toLowerCase().includes('private'));

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/investment-inquiry', {
        name: data.name,
        email: data.email,
        company: data.company,
        investmentRound: 'private',
        investmentAmount: data.investmentAmount,
        message: data.message,
      });
    },
    onSuccess: () => {
      toast({
        title: "문의가 접수되었습니다",
        description: "담당자가 1-2 영업일 내에 연락드리겠습니다.",
      });
      setInquiryDialogOpen(false);
      setFormData({ name: "", email: "", company: "", investmentAmount: "", message: "" });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "문의 접수에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: "필수 정보 누락",
        description: "이름, 이메일, 회사명은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    inquiryMutation.mutate(formData);
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect("metamask");
    }
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const investmentHighlights = [
    { value: "$0.10", label: "토큰당 가격", compare: "시드 대비 +150%" },
    { value: "50%", label: "런칭가 대비 할인", compare: "" },
    { value: "5%", label: "TGE 즉시 해제", compare: "" },
    { value: "18개월", label: "베스팅 기간", compare: "" },
  ];

  const distributions = [
    { id: "seed", name: "Seed Round", amount: "$0.04", discount: "80%", status: "completed" },
    { id: "private", name: "Private Round", amount: "$0.10", discount: "50%", status: "current" },
    { id: "public", name: "Public Round", amount: "$0.20", discount: "60%", status: "" },
  ];

  const investorTiers = [
    { id: "institutional", icon: "🏛️", name: "Institutional", subtitle: "기관 투자자", amount: "$5M+", details: [{ label: "최소 투자", value: "$5,000,000" }, { label: "토큰 가격", value: "$0.09" }, { label: "TGE 해제", value: "7%" }], benefits: ["이사회 옵저버 석", "월간 경영진 브리핑", "독점 공동 투자권", "맞춤 베스팅 협의", "전담 IR 매니저"] },
    { id: "strategic", icon: "🎯", name: "Strategic", subtitle: "전략적 투자자", amount: "$2M+", details: [{ label: "최소 투자", value: "$2,000,000" }, { label: "토큰 가격", value: "$0.095" }, { label: "TGE 해제", value: "6%" }], benefits: ["분기별 전략 세션", "파트너십 우선권", "기술 협력 기회", "공동 마케팅", "네트워크 접근"] },
    { id: "growth", icon: "📈", name: "Growth", subtitle: "성장 투자자", amount: "$500K+", details: [{ label: "최소 투자", value: "$500,000" }, { label: "토큰 가격", value: "$0.10" }, { label: "TGE 해제", value: "5%" }], benefits: ["분기별 업데이트 콜", "프라이빗 커뮤니티", "거버넌스 참여권", "신규 기능 얼리 액세스", "전용 지원 채널"] },
    { id: "standard", icon: "💼", name: "Standard", subtitle: "일반 투자자", amount: "$100K+", details: [{ label: "최소 투자", value: "$100,000" }, { label: "토큰 가격", value: "$0.10" }, { label: "TGE 해제", value: "5%" }], benefits: ["월간 투자자 뉴스레터", "기본 거버넌스 투표권", "투자자 전용 채널", "일반 배정", "이메일 지원"] },
  ];

  const vestingPhases = [
    { icon: "🎉", title: "TGE 해제", value: "5%", desc: "상장 즉시" },
    { icon: "🔒", title: "클리프 기간", value: "6개월", desc: "초기 락업" },
    { icon: "📈", title: "월간 베스팅", value: "7.9%", desc: "12개월간" },
    { icon: "✅", title: "완전 언락", value: "100%", desc: "18개월 후" },
  ];

  const allocationBreakdown = [
    { icon: "🏛️", name: "VC & 펀드", amount: "5억", percent: "50%" },
    { icon: "🏢", name: "패밀리 오피스", amount: "2억", percent: "20%" },
    { icon: "🎯", name: "전략 투자자", amount: "2억", percent: "20%" },
    { icon: "💼", name: "기업 투자자", amount: "1억", percent: "10%" },
  ];

  const currentInvestors = [
    { icon: "🏛️", name: "Galaxy Digital", type: "VC", tier: "institutional" },
    { icon: "🏢", name: "Asia Capital Partners", type: "Family Office", tier: "institutional" },
    { icon: "🎯", name: "Blockchain Partners Korea", type: "Strategic", tier: "strategic" },
    { icon: "💼", name: "Digital Asset Holdings", type: "Corporate", tier: "growth" },
  ];

  const processSteps = [
    { icon: "📋", title: "투자 문의", desc: "투자 의향서 제출", duration: "1-3일" },
    { icon: "🔍", title: "실사(DD)", desc: "기업 및 투자자 실사", duration: "1-2주" },
    { icon: "📝", title: "계약 협상", desc: "투자 조건 협의", duration: "1-2주" },
    { icon: "💸", title: "자금 납입", desc: "투자금 전송", duration: "3-5일" },
    { icon: "🎉", title: "토큰 배정", desc: "투자 확정 및 배정", duration: "즉시" },
  ];

  const whyPrivate = [
    { icon: "💰", title: "우수한 가격", value: "50%+ 할인", desc: "퍼블릭 대비 절반 가격에 투자" },
    { icon: "🔓", title: "TGE 즉시 유동성", value: "5% 해제", desc: "상장 시점 즉시 유동화 가능" },
    { icon: "🤝", title: "전략적 파트너십", value: "독점 혜택", desc: "프로젝트와의 긴밀한 협력" },
  ];

  return (
    <div className="private-round-page">
      <style>{`
        .private-round-page {
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
          --emerald: #10B981;
          --indigo: #6366F1;
          --violet: #7C3AED;
          --private-primary: #8B5CF6;
          --private-secondary: #7C3AED;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-private: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes lockPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); } }
        @keyframes progressFill { 0% { width: 0%; } 100% { width: 72%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .private-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
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
        .nav-links a:hover { color: var(--private-primary); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-private);
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
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
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
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--private-primary);
          margin-bottom: 2rem;
        }

        .badge .lock-icon { animation: lockPulse 2s ease-in-out infinite; display: inline-block; }

        .round-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(139, 92, 246, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--private-primary);
          margin-left: 10px;
        }

        .round-status .dot {
          width: 8px;
          height: 8px;
          background: var(--private-primary);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-private);
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

        .fundraise-progress {
          background: var(--dark-card);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header .raised { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); }
        .progress-header .goal { font-size: 1rem; color: var(--gray); }

        .progress-bar {
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-private);
          border-radius: 100px;
          width: 72%;
          position: relative;
          animation: progressFill 2s ease-out;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .progress-stats .percent { color: var(--private-primary); font-weight: 700; }
        .progress-stats .remaining { color: var(--gray); }

        .investment-highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .highlight-card {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .highlight-card .value { font-size: 1.75rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .highlight-card .label { font-size: 0.85rem; color: var(--light-gray); }
        .highlight-card .compare { font-size: 0.75rem; color: var(--success); margin-top: 0.25rem; }

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
          border-color: var(--private-primary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-private);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-private);
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
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
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

        .btn-secondary:hover { border-color: var(--private-primary); color: var(--private-primary); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(139, 92, 246, 0.15);
          color: var(--private-primary);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
        .section-subtitle { color: var(--light-gray); font-size: 1.125rem; max-width: 600px; margin: 0 auto; }

        .round-comparison {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .comparison-header {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-header h3 { font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }

        .comparison-table { width: 100%; border-collapse: collapse; }

        .comparison-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .comparison-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .comparison-table tr:hover td { background: rgba(255, 255, 255, 0.02); }
        .comparison-table tr.highlight td { background: rgba(139, 92, 246, 0.1); }

        .round-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .round-badge.seed { background: rgba(34, 197, 94, 0.2); color: var(--success); }
        .round-badge.private { background: rgba(139, 92, 246, 0.2); color: var(--private-primary); }
        .round-badge.public { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
        .round-badge.current { animation: glow 2s ease-in-out infinite; }

        .discount-badge {
          background: rgba(139, 92, 246, 0.2);
          color: var(--private-primary);
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-left: 8px;
        }

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

        .tier-card.institutional { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.strategic { border-color: var(--private-primary); }
        .tier-card.growth { border-color: var(--indigo); }
        .tier-card.standard { border-color: var(--cyan); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.institutional .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.strategic .tier-header { background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); }
        .tier-card.growth .tier-header { background: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%); }
        .tier-card.standard .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.institutional .tier-name { color: var(--gold); }
        .tier-card.strategic .tier-name { color: var(--private-primary); }
        .tier-card.growth .tier-name { color: var(--indigo); }
        .tier-card.standard .tier-name { color: var(--cyan); }

        .tier-subtitle { font-size: 0.8rem; color: var(--gray); }

        .tier-content { padding: 1.5rem; }

        .tier-amount {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .tier-amount .label { font-size: 0.75rem; color: var(--gray); margin-bottom: 0.25rem; }
        .tier-amount .value { font-size: 1.5rem; font-weight: 800; }

        .tier-card.institutional .tier-amount .value { color: var(--gold); }
        .tier-card.strategic .tier-amount .value { color: var(--private-primary); }
        .tier-card.growth .tier-amount .value { color: var(--indigo); }
        .tier-card.standard .tier-amount .value { color: var(--cyan); }

        .tier-details { margin-bottom: 1rem; }

        .tier-detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-detail-item:last-child { border-bottom: none; }
        .tier-detail-item .label { color: var(--gray); }
        .tier-detail-item .value { color: var(--white); font-weight: 600; }

        .tier-benefits { list-style: none; margin-bottom: 1rem; padding: 0; }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 0.8rem;
          color: var(--light-gray);
        }

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

        .tier-card.institutional .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.strategic .tier-btn { background: var(--gradient-private); color: var(--white); }
        .tier-card.growth .tier-btn { background: linear-gradient(135deg, var(--indigo), var(--blue)); color: var(--white); }
        .tier-card.standard .tier-btn { background: linear-gradient(135deg, var(--cyan), var(--blue)); color: var(--white); }

        .tier-btn:hover { transform: scale(1.02); }

        .vesting-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .vesting-visual {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .vesting-phase {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          position: relative;
        }

        .vesting-phase::after {
          content: '→';
          position: absolute;
          right: -1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
          font-size: 1.25rem;
        }

        .vesting-phase:last-child::after { display: none; }

        .vesting-phase .icon { font-size: 2rem; margin-bottom: 0.75rem; }
        .vesting-phase .title { font-weight: 700; margin-bottom: 0.25rem; }
        .vesting-phase .value { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .vesting-phase .desc { font-size: 0.8rem; color: var(--gray); }

        .allocation-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .allocation-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .allocation-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .allocation-card:hover {
          border-color: var(--private-primary);
          transform: translateY(-5px);
        }

        .allocation-card .icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .allocation-card .name { font-weight: 700; margin-bottom: 0.25rem; }
        .allocation-card .amount { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .allocation-card .percent { font-size: 0.85rem; color: var(--gray); }

        .investors-showcase {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .investors-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .investor-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .investor-card:hover {
          background: rgba(139, 92, 246, 0.05);
          border-color: var(--private-primary);
          transform: translateY(-5px);
        }

        .investor-logo {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.2));
        }

        .investor-card-name { font-weight: 700; margin-bottom: 0.25rem; }
        .investor-card-type { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }

        .investor-card-tier {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .investor-card-tier.institutional { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .investor-card-tier.strategic { background: rgba(139, 92, 246, 0.2); color: var(--private-primary); }
        .investor-card-tier.growth { background: rgba(99, 102, 241, 0.2); color: var(--indigo); }

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
          background: linear-gradient(90deg, var(--private-primary), var(--indigo), var(--blue), var(--cyan), var(--gold));
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

        .process-item:nth-child(1) .process-dot { background: var(--private-primary); }
        .process-item:nth-child(2) .process-dot { background: var(--indigo); }
        .process-item:nth-child(3) .process-dot { background: var(--blue); }
        .process-item:nth-child(4) .process-dot { background: var(--cyan); }
        .process-item:nth-child(5) .process-dot { background: var(--gold); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--private-primary); font-weight: 600; margin-top: 0.5rem; }

        .why-private-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .why-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .why-card:hover {
          border-color: var(--private-primary);
          transform: translateY(-5px);
        }

        .why-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .why-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
        .why-card .value { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.5rem; }
        .why-card p { font-size: 0.85rem; color: var(--light-gray); }

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

        .faq-chevron { color: var(--private-primary); transition: transform 0.3s; }
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
          background: var(--gradient-private);
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

        .social-links a:hover { background: var(--private-primary); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--private-primary); }

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
          .tiers-grid, .allocation-grid { grid-template-columns: repeat(2, 1fr); }
          .why-private-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid, .investment-highlights { grid-template-columns: repeat(2, 1fr); }
          .vesting-visual { grid-template-columns: repeat(2, 1fr); }
          .vesting-phase::after { display: none; }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .investment-highlights, .tiers-grid, .allocation-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="private-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#tiers">투자 티어</a>
            <a href="#vesting">베스팅</a>
            <a href="#allocation">배분</a>
            <a href="#investors">투자자</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              onClick={handleWalletClick}
              data-testid="button-connect-wallet"
            >
              {isConnected ? formatAddress(address!) : "🔐 기관 투자 문의"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="lock-icon">🔐</span> PRIVATE ROUND - 기관 투자
            <span className="round-status"><span className="dot"></span> 진행중</span>
          </div>
          <h1>
            프라이빗 라운드 투자로<br />
            <span className="gradient-text">10억 TBURN</span> 기회를 잡으세요
          </h1>
          <p className="hero-subtitle">
            기관 투자자, VC, 패밀리 오피스를 위한 
            런칭가($0.50) 대비 50% 할인된 $0.10 투자 기회. TGE 5% 즉시 해제.
          </p>

          <div className="fundraise-progress" data-testid="fundraise-progress">
            <div className="progress-header">
              <span className="raised">$72,000,000</span>
              <span className="goal">목표 $100,000,000</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-stats">
              <span className="percent">72% 달성</span>
              <span className="remaining">$28,000,000 남음</span>
            </div>
          </div>

          <div className="investment-highlights" data-testid="investment-highlights">
            {investmentHighlights.map((item, idx) => (
              <div key={idx} className="highlight-card">
                <div className="value">{item.value}</div>
                <div className="label">{item.label}</div>
                {item.compare && <div className="compare">{item.compare}</div>}
              </div>
            ))}
          </div>

          <div className="stats-grid">
            {isLoading ? (
              <div className="stat-card" data-testid="loading-indicator">
                <div className="stat-value" style={{ opacity: 0.5 }}>로딩중...</div>
              </div>
            ) : (
              <>
                <div className="stat-card" data-testid="stat-total-private">
                  <div className="stat-value">{privateRound?.allocation || "10억"}</div>
                  <div className="stat-label">프라이빗 배정 (10%)</div>
                </div>
                <div className="stat-card" data-testid="stat-price">
                  <div className="stat-value">{privateRound?.price || "$0.10"}</div>
                  <div className="stat-label">토큰 가격</div>
                </div>
                <div className="stat-card" data-testid="stat-hardcap">
                  <div className="stat-value">{privateRound?.raised || "$100M"}</div>
                  <div className="stat-label">하드캡</div>
                </div>
                <div className="stat-card" data-testid="stat-investors">
                  <div className="stat-value">{privateRound?.investors || 45}+</div>
                  <div className="stat-label">기관 투자자</div>
                </div>
              </>
            )}
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-apply-private" onClick={() => setInquiryDialogOpen(true)}>
              🔐 프라이빗 투자 신청
            </button>
            <button className="btn-secondary" onClick={() => window.open('/learn/whitepaper', '_blank')}>
              📖 투자 덱 보기
            </button>
          </div>
        </div>
      </section>

      {/* Round Comparison Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">COMPARISON</span>
          <h2 className="section-title">라운드 비교</h2>
          <p className="section-subtitle">프라이빗 라운드는 시드와 퍼블릭의 중간 조건</p>
        </div>

        <div className="round-comparison">
          <div className="comparison-header">
            <h3>📊 투자 라운드 비교</h3>
          </div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>라운드</th>
                <th>토큰 가격</th>
                <th>할인율</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map(round => (
                <tr key={round.id} className={round.status === 'current' ? 'highlight' : ''}>
                  <td>
                    <span className={`round-badge ${round.id} ${round.status === 'current' ? 'current' : ''}`}>
                      🔐 {round.name}
                    </span>
                  </td>
                  <td>{round.amount}</td>
                  <td>
                    {round.discount}
                    {round.status === 'current' && <span className="discount-badge">진행중</span>}
                  </td>
                  <td>
                    {round.status === 'completed' ? '✅ 완료' : 
                     round.status === 'current' ? '🔐 진행중' : '⏳ 예정'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Investment Tiers Section */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">TIERS</span>
          <h2 className="section-title">투자 티어</h2>
          <p className="section-subtitle">기관 투자 규모별 차등 혜택</p>
        </div>

        <div className="tiers-grid">
          {investorTiers.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.id}`} data-testid={`tier-${tier.id}`}>
              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-subtitle">{tier.subtitle}</p>
              </div>
              <div className="tier-content">
                <div className="tier-amount">
                  <div className="label">최소 투자금</div>
                  <div className="value">{tier.amount}</div>
                </div>
                <div className="tier-details">
                  {tier.details.map((detail, idx) => (
                    <div key={idx} className="tier-detail-item">
                      <span className="label">{detail.label}</span>
                      <span className="value">{detail.value}</span>
                    </div>
                  ))}
                </div>
                <ul className="tier-benefits">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <button className="tier-btn" onClick={() => setInquiryDialogOpen(true)}>투자 문의</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vesting Section */}
      <section className="section" id="vesting">
        <div className="section-header">
          <span className="section-badge">VESTING</span>
          <h2 className="section-title">베스팅 스케줄</h2>
          <p className="section-subtitle">TGE 5% 즉시 해제, 6개월 클리프 후 12개월 월간 베스팅</p>
        </div>

        <div className="vesting-container">
          <div className="vesting-visual">
            {vestingPhases.map((phase, idx) => (
              <div key={idx} className="vesting-phase">
                <div className="icon">{phase.icon}</div>
                <div className="title">{phase.title}</div>
                <div className="value">{phase.value}</div>
                <div className="desc">{phase.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Allocation Breakdown Section */}
      <section className="section" id="allocation" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">ALLOCATION</span>
          <h2 className="section-title">투자자 유형별 배분</h2>
          <p className="section-subtitle">10억 TBURN 배분 현황</p>
        </div>

        <div className="allocation-container">
          <div className="allocation-grid">
            {allocationBreakdown.map((item, idx) => (
              <div key={idx} className="allocation-card">
                <div className="icon">{item.icon}</div>
                <div className="name">{item.name}</div>
                <div className="amount">{item.amount}</div>
                <div className="percent">{item.percent}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Investors Section */}
      <section className="section" id="investors">
        <div className="section-header">
          <span className="section-badge">INVESTORS</span>
          <h2 className="section-title">현재 투자자</h2>
          <p className="section-subtitle">함께하는 기관 파트너</p>
        </div>

        <div className="investors-showcase">
          <div className="investors-grid">
            {currentInvestors.map((investor, idx) => (
              <div key={idx} className="investor-card">
                <div className="investor-logo">{investor.icon}</div>
                <div className="investor-card-name">{investor.name}</div>
                <div className="investor-card-type">{investor.type}</div>
                <span className={`investor-card-tier ${investor.tier}`}>
                  {investor.tier.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">투자 절차</h2>
          <p className="section-subtitle">기관 투자 진행 과정</p>
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

      {/* Why Private Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">BENEFITS</span>
          <h2 className="section-title">프라이빗 라운드 장점</h2>
          <p className="section-subtitle">기관 투자자 전용 혜택</p>
        </div>

        <div className="why-private-grid">
          {whyPrivate.map((item, idx) => (
            <div key={idx} className="why-card">
              <div className="why-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <div className="value">{item.value}</div>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">프라이빗 투자에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>프라이빗 라운드 참여 자격과 투자 조건은 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>프라이빗 라운드는 적격 기관 투자자(VC, 펀드, 패밀리 오피스), 기업 투자자, 전략적 파트너를 대상으로 합니다. 최소 투자 금액은 $100,000(스탠다드 티어)이며, $500,000 이상(그로스 티어), $2,000,000 이상(스트래티직 티어), $5,000,000 이상(인스티튜셔널 티어)으로 투자 규모에 따라 토큰 가격 할인 및 TGE 해제 비율이 차등 적용됩니다. 모든 투자자는 KYC/AML 인증 및 투자자 적격성 검토를 통과해야 합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>시드 라운드와 프라이빗 라운드의 차이점은 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>시드 라운드($0.04/토큰, 80% 할인)는 완료되었으며, 12개월 클리프 + 24개월 베스팅 조건입니다. 프라이빗 라운드($0.10/토큰, 50% 할인)는 6개월 클리프 + 12개월 베스팅으로 더 짧은 락업 기간이 장점입니다. 또한 프라이빗 투자자는 TGE 시점에 5~7%가 즉시 해제되어 상장 즉시 일부 유동성을 확보할 수 있습니다. 시드 대비 높은 가격이지만, 더 빠른 유동화와 기관급 투자자 혜택이 제공됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>베스팅 스케줄과 TGE 해제는 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TGE(Token Generation Event) 시점에 투자 토큰의 5%가 즉시 해제됩니다. 인스티튜셔널 티어는 최대 7%, 스트래티직 티어는 6%까지 TGE 해제됩니다. 이후 6개월 클리프(락업) 기간이 있으며, 클리프 종료 후 12개월에 걸쳐 매월 약 7.9%씩 선형 베스팅됩니다. 전체 언락까지 총 18개월이 소요됩니다. 인스티튜셔널 티어 투자자는 맞춤 베스팅 일정 협의가 가능합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>투자 절차와 실사(Due Diligence) 과정은 어떻게 진행되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>투자 절차: (1) 투자 문의 및 NDA 체결 → (2) 투자 의향서(LOI) 제출 → (3) 양방향 실사(프로젝트 기술/재무/법률 DD + 투자자 자금출처/적격성 확인) → (4) 투자 조건 협상 및 Term Sheet 합의 → (5) SAFT 계약 체결 → (6) 자금 납입(USDT, USDC, 은행송금) → (7) 토큰 배정 확인. 실사 과정은 일반적으로 1-2주 소요되며, 기관 규모에 따라 3-4주까지 연장될 수 있습니다. 전담 IR 매니저가 전 과정을 안내합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>투자자 보호와 법적 구조는 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>모든 프라이빗 투자는 SAFT(Simple Agreement for Future Tokens) 계약을 통해 법적으로 보호됩니다. 계약서에는 토큰 할당량, 가격, 베스팅 조건, 투자자 권리, 분쟁 해결 조항이 명시됩니다. 투자금은 케이맨 제도 소재 SPV(Special Purpose Vehicle)를 통해 관리되며, 제3자 에스크로 계정에 예치됩니다. 법률 자문은 글로벌 로펌 Morrison & Foerster와 협력하며, 싱가포르 MAS 규정을 준수합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>토큰 상장 계획과 런칭 가격은 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TBURN 토큰의 런칭 예정 가격은 $0.50입니다(프라이빗 대비 5배). 상장 전략: 메인넷 런칭과 동시에 TGE를 진행하며, Uniswap, PancakeSwap 등 주요 DEX에 초기 유동성을 공급합니다. 이후 Tier-1 CEX(Binance, OKX, Bybit, Coinbase 등)와의 상장 협의가 진행 중이며, 런칭 후 3-6개월 내 주요 거래소 상장을 목표로 합니다. 시장 메이킹은 전문 MM 파트너와 협력합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>투자자 티어별 혜택과 거버넌스 권한은 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>티어별 혜택: (1) 인스티튜셔널($5M+): 이사회 옵저버 석, 월간 경영진 브리핑, 독점 공동투자권, 맞춤 베스팅, 전담 IR 매니저 (2) 스트래티직($2M+): 분기별 전략 세션, 파트너십 우선권, 기술 협력, 공동 마케팅 (3) 그로스($500K+): 분기별 업데이트 콜, 프라이빗 커뮤니티, 거버넌스 참여권, 신규 기능 얼리 액세스 (4) 스탠다드($100K+): 월간 뉴스레터, 기본 거버넌스 투표권, 투자자 전용 채널. 모든 프라이빗 투자자는 DAO 거버넌스 투표권을 보유합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>결제 방법과 환불 정책은 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>결제 방법: USDT(ERC-20/TRC-20), USDC(ERC-20), 또는 은행 송금(USD/EUR)이 가능합니다. $1M 이상 투자 시 분할 납입이 가능하며, 납입 일정은 협의 가능합니다. 환불 정책: SAFT 계약 체결 전까지는 전액 환불 가능합니다. 계약 후에는 프로젝트 중단, 메인넷 런칭 실패, 중대한 로드맵 변경 시에만 환불 청구가 가능합니다. 투자자 귀책 사유에 의한 중도 해지는 불가하며, 세부 조건은 SAFT 계약서에 명시됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>기관 투자자가 되세요</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN Chain의 프라이빗 투자자로<br />
            런칭가 대비 50% 할인과 TGE 즉시 유동성을 확보하세요!
          </p>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--dark)', fontSize: '1.25rem', padding: '20px 50px' }}
            onClick={() => setInquiryDialogOpen(true)}
            data-testid="button-invest-now"
          >
            🔐 지금 투자하기
          </button>
        </div>
      </section>

      {/* Investment Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-400">프라이빗 라운드 투자 문의</DialogTitle>
            <DialogDescription className="text-slate-400">
              담당자가 1-2 영업일 내에 연락드립니다. 기관 투자자 전용입니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">담당자명 *</Label>
              <Input
                id="name"
                placeholder="홍길동"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">이메일 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-slate-300">회사/기관명 *</Label>
              <Input
                id="company"
                placeholder="ABC Ventures"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentAmount" className="text-slate-300">투자 예정 금액</Label>
              <Input
                id="investmentAmount"
                placeholder="$500,000"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                data-testid="input-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-300">추가 메시지</Label>
              <Textarea
                id="message"
                placeholder="투자 관련 추가 문의사항을 입력해주세요"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
                data-testid="input-message"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInquiryDialogOpen(false)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={inquiryMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-submit-inquiry"
              >
                {inquiryMutation.isPending ? "제출 중..." : "투자 문의 제출"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
