import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

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

export default function SeedRoundPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    investmentAmount: "",
    message: ""
  });
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const { toast } = useToast();

  const { data: response, isLoading } = useQuery<InvestmentRoundsStatsResponse>({
    queryKey: ['/api/token-programs/investment-rounds/stats'],
  });
  const stats = response?.data;

  const seedRound = stats?.rounds?.find(r => r.name.toLowerCase().includes('seed'));

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/investment-inquiry', { ...data, round: 'seed' });
    },
    onSuccess: () => {
      toast({
        title: "투자 문의 접수 완료",
        description: "담당자가 빠른 시일 내에 연락드리겠습니다.",
      });
      setInquiryDialogOpen(false);
      setFormData({ name: "", email: "", company: "", investmentAmount: "", message: "" });
    },
    onError: (error) => {
      console.error('[Investment Inquiry] Error:', error);
      toast({
        title: "문의 접수 실패",
        description: "일시적인 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      setInquiryDialogOpen(true);
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        title: "필수 정보 입력",
        description: "이름과 이메일은 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }
    inquiryMutation.mutate(formData);
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const investmentHighlights = [
    { value: "$0.04", label: "토큰당 가격" },
    { value: "80%", label: "시장가 대비 할인" },
    { value: "12개월", label: "베스팅 기간" },
  ];

  const distributions = [
    { id: "seed", name: "Seed Round", amount: "$0.04", discount: "80%", status: "current" },
    { id: "private", name: "Private Round", amount: "$0.10", discount: "50%", status: "" },
    { id: "public", name: "Public Round", amount: "$0.20", discount: "0%", status: "" },
  ];

  const investorTiers = [
    { id: "lead", icon: "👑", name: "Lead Investor", subtitle: "리드 투자자", amount: "$1M+", details: [{ label: "최소 투자", value: "$1,000,000" }, { label: "할인율", value: "85%" }, { label: "락업 기간", value: "12개월" }], benefits: ["이사회 참관권", "월간 경영진 미팅", "독점 딜 플로우", "우선 투자권", "전담 IR 매니저"] },
    { id: "major", icon: "🌱", name: "Major Investor", subtitle: "주요 투자자", amount: "$500K+", details: [{ label: "최소 투자", value: "$500,000" }, { label: "할인율", value: "82%" }, { label: "락업 기간", value: "12개월" }], benefits: ["분기별 전략 미팅", "얼리 액세스", "거버넌스 참여", "우선 배정", "전용 지원"] },
    { id: "standard", icon: "💎", name: "Standard Investor", subtitle: "일반 투자자", amount: "$100K+", details: [{ label: "최소 투자", value: "$100,000" }, { label: "할인율", value: "80%" }, { label: "락업 기간", value: "12개월" }], benefits: ["월간 뉴스레터", "커뮤니티 접근", "기본 거버넌스", "일반 배정", "이메일 지원"] },
    { id: "angel", icon: "😇", name: "Angel Investor", subtitle: "엔젤 투자자", amount: "$25K+", details: [{ label: "최소 투자", value: "$25,000" }, { label: "할인율", value: "78%" }, { label: "락업 기간", value: "12개월" }], benefits: ["분기별 업데이트", "커뮤니티 채널", "NFT 뱃지", "엔젤 네트워크", "기본 지원"] },
  ];

  const vestingPhases = [
    { icon: "🔒", title: "클리프 기간", value: "12개월", desc: "초기 락업" },
    { icon: "🔓", title: "초기 언락", value: "10%", desc: "TGE 후 12개월" },
    { icon: "📈", title: "월간 베스팅", value: "7.5%", desc: "12개월간" },
    { icon: "✅", title: "완전 언락", value: "100%", desc: "24개월 후" },
  ];

  const currentInvestors = [
    { icon: "🏦", name: "Blockchain Ventures", type: "VC", tier: "lead" },
    { icon: "💰", name: "Crypto Capital", type: "Fund", tier: "lead" },
    { icon: "🌐", name: "Web3 Partners", type: "VC", tier: "major" },
    { icon: "⚡", name: "DeFi Fund", type: "Fund", tier: "major" },
  ];

  const processSteps = [
    { icon: "📋", title: "투자 문의", desc: "투자 의향서 제출", duration: "1-3일" },
    { icon: "🔍", title: "KYC/AML", desc: "투자자 인증 절차", duration: "3-5일" },
    { icon: "📝", title: "SAFT 서명", desc: "투자 계약 체결", duration: "1-2일" },
    { icon: "💸", title: "자금 송금", desc: "투자금 전송", duration: "1-3일" },
    { icon: "🎉", title: "토큰 배정", desc: "투자 확정", duration: "즉시" },
  ];

  const tokenMetrics = [
    { icon: "📊", title: "총 발행량", value: "100억 TBURN", desc: "고정 공급량" },
    { icon: "🌱", title: "시드 배정", value: "5억 TBURN", desc: "총 공급량의 5%" },
    { icon: "💵", title: "시드 목표", value: "$20,000,000", desc: "하드캡" },
  ];

  const riskItems = [
    "암호화폐 투자는 높은 변동성과 리스크가 있습니다.",
    "투자 원금 손실 가능성이 있으며, 손실 감당 가능한 범위 내에서 투자하세요.",
    "규제 환경 변화로 인해 서비스가 제한될 수 있습니다.",
    "과거 수익률이 미래 수익을 보장하지 않습니다.",
  ];

  return (
    <div className="seed-round-page">
      <style>{`
        .seed-round-page {
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
          --seed-primary: #22C55E;
          --seed-secondary: #16A34A;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-seed: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes seedling { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.1) rotate(5deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); } 50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); } }

        .seed-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
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
        .nav-links a:hover { color: var(--seed-primary); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connect-btn {
          background: var(--gradient-seed);
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
          box-shadow: 0 10px 40px rgba(34, 197, 94, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(22, 163, 74, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%);
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
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--seed-primary);
          margin-bottom: 2rem;
        }

        .badge .seed-icon { animation: seedling 2s ease-in-out infinite; display: inline-block; }

        .round-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--seed-primary);
          margin-left: 10px;
        }

        .round-status .dot {
          width: 8px;
          height: 8px;
          background: var(--seed-primary);
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
          background: var(--gradient-seed);
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

        .investment-highlights {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }

        .highlight-card {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .highlight-card .value { font-size: 1.75rem; font-weight: 800; color: var(--seed-primary); margin-bottom: 0.25rem; }
        .highlight-card .label { font-size: 0.85rem; color: var(--light-gray); }

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
          border-color: var(--seed-primary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-seed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-seed);
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
          box-shadow: 0 20px 60px rgba(34, 197, 94, 0.3);
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

        .btn-secondary:hover { border-color: var(--seed-primary); color: var(--seed-primary); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(34, 197, 94, 0.15);
          color: var(--seed-primary);
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
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent);
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

        .round-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .round-badge.seed { background: rgba(34, 197, 94, 0.2); color: var(--seed-primary); }
        .round-badge.private { background: rgba(139, 92, 246, 0.2); color: var(--purple); }
        .round-badge.public { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
        .round-badge.current { animation: glow 2s ease-in-out infinite; }

        .discount-badge {
          background: rgba(34, 197, 94, 0.2);
          color: var(--seed-primary);
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

        .tier-card.lead { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.major { border-color: var(--seed-primary); }
        .tier-card.standard { border-color: var(--purple); }
        .tier-card.angel { border-color: var(--cyan); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.lead .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.major .tier-header { background: linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, transparent 100%); }
        .tier-card.standard .tier-header { background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); }
        .tier-card.angel .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.lead .tier-name { color: var(--gold); }
        .tier-card.major .tier-name { color: var(--seed-primary); }
        .tier-card.standard .tier-name { color: var(--purple); }
        .tier-card.angel .tier-name { color: var(--cyan); }

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

        .tier-card.lead .tier-amount .value { color: var(--gold); }
        .tier-card.major .tier-amount .value { color: var(--seed-primary); }
        .tier-card.standard .tier-amount .value { color: var(--purple); }
        .tier-card.angel .tier-amount .value { color: var(--cyan); }

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

        .tier-card.lead .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.major .tier-btn { background: var(--gradient-seed); color: var(--white); }
        .tier-card.standard .tier-btn { background: linear-gradient(135deg, var(--purple), var(--violet)); color: var(--white); }
        .tier-card.angel .tier-btn { background: linear-gradient(135deg, var(--cyan), var(--blue)); color: var(--white); }

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
        .vesting-phase .value { font-size: 1.5rem; font-weight: 800; color: var(--seed-primary); margin-bottom: 0.25rem; }
        .vesting-phase .desc { font-size: 0.8rem; color: var(--gray); }

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
          background: rgba(34, 197, 94, 0.05);
          border-color: var(--seed-primary);
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
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2));
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

        .investor-card-tier.lead { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .investor-card-tier.major { background: rgba(34, 197, 94, 0.2); color: var(--seed-primary); }

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
          background: linear-gradient(90deg, var(--seed-primary), var(--emerald), var(--cyan), var(--blue), var(--gold));
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

        .process-item:nth-child(1) .process-dot { background: var(--seed-primary); }
        .process-item:nth-child(2) .process-dot { background: var(--emerald); }
        .process-item:nth-child(3) .process-dot { background: var(--cyan); }
        .process-item:nth-child(4) .process-dot { background: var(--blue); }
        .process-item:nth-child(5) .process-dot { background: var(--gold); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--seed-primary); font-weight: 600; margin-top: 0.5rem; }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .metric-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .metric-card:hover {
          border-color: var(--seed-primary);
          transform: translateY(-5px);
        }

        .metric-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .metric-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
        .metric-card .value { font-size: 1.75rem; font-weight: 800; color: var(--seed-primary); margin-bottom: 0.5rem; }
        .metric-card p { font-size: 0.85rem; color: var(--light-gray); }

        .risk-section {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .risk-section h4 {
          color: var(--danger);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .risk-section ul { list-style: none; padding: 0; }

        .risk-section li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .risk-section li::before { content: '⚠️'; margin-top: 3px; }

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

        .faq-chevron { color: var(--seed-primary); transition: transform 0.3s; }
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
          background: var(--gradient-seed);
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

        .social-links a:hover { background: var(--seed-primary); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--seed-primary); }

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
          .metrics-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .investment-highlights { grid-template-columns: 1fr; }
          .vesting-visual { grid-template-columns: repeat(2, 1fr); }
          .vesting-phase::after { display: none; }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .tiers-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="seed-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-12 h-12" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#tiers">투자 티어</a>
            <a href="#vesting">베스팅</a>
            <a href="#investors">투자자</a>
            <a href="#process">절차</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="header-actions">
            <LanguageSelector isDark={true} />
            <button 
              className="connect-btn" 
              onClick={handleWalletClick}
              data-testid="button-connect-wallet"
            >
              {isConnected ? formatAddress(address!) : "🌱 투자 문의"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="seed-icon">🌱</span> SEED ROUND - 초기 투자자
            <span className="round-status"><span className="dot"></span> 진행중</span>
          </div>
          <h1>
            시드 라운드 투자로<br />
            <span className="gradient-text">5억 TBURN</span> 기회를 잡으세요
          </h1>
          <p className="hero-subtitle">
            블록체인 VC, 크립토 펀드, 엔젤 투자자를 위한 
            최대 70% 할인 초기 투자 기회를 제공합니다.
          </p>

          <div className="investment-highlights" data-testid="investment-highlights">
            {investmentHighlights.map((item, idx) => (
              <div key={idx} className="highlight-card">
                <div className="value">{item.value}</div>
                <div className="label">{item.label}</div>
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
                <div className="stat-card" data-testid="stat-total-seed">
                  <div className="stat-value">{seedRound?.allocation || "5억"}</div>
                  <div className="stat-label">시드 배정</div>
                </div>
                <div className="stat-card" data-testid="stat-price">
                  <div className="stat-value">${seedRound?.price || "0.04"}</div>
                  <div className="stat-label">토큰 가격</div>
                </div>
                <div className="stat-card" data-testid="stat-hardcap">
                  <div className="stat-value">${seedRound?.raised || "20M"}</div>
                  <div className="stat-label">하드캡</div>
                </div>
                <div className="stat-card" data-testid="stat-investors">
                  <div className="stat-value">{seedRound?.investors || 15}+</div>
                  <div className="stat-label">투자자</div>
                </div>
              </>
            )}
          </div>

          <div className="cta-group">
            <button 
              className="btn-primary" 
              data-testid="button-apply-seed"
              onClick={() => setInquiryDialogOpen(true)}
            >
              🌱 시드 투자 신청
            </button>
            <button 
              className="btn-secondary"
              data-testid="button-investment-memo"
              onClick={() => setMemoDialogOpen(true)}
            >
              📖 투자 메모
            </button>
          </div>
        </div>
      </section>

      {/* Round Comparison Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">COMPARISON</span>
          <h2 className="section-title">라운드 비교</h2>
          <p className="section-subtitle">시드 라운드가 가장 유리한 조건입니다</p>
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
                <tr key={round.id}>
                  <td>
                    <span className={`round-badge ${round.id} ${round.status === 'current' ? 'current' : ''}`}>
                      🌱 {round.name}
                    </span>
                  </td>
                  <td>{round.amount}</td>
                  <td>
                    {round.discount}
                    {round.status === 'current' && <span className="discount-badge">최대 할인</span>}
                  </td>
                  <td>{round.status === 'current' ? '✅ 진행중' : '⏳ 예정'}</td>
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
          <p className="section-subtitle">투자 규모별 차등 혜택</p>
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
                <button 
                  className="tier-btn" 
                  data-testid={`button-tier-inquiry-${tier.id}`}
                  onClick={() => setInquiryDialogOpen(true)}
                >
                  투자 문의
                </button>
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
          <p className="section-subtitle">투자자 보호를 위한 체계적인 토큰 해제</p>
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

      {/* Current Investors Section */}
      <section className="section" id="investors" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">INVESTORS</span>
          <h2 className="section-title">현재 투자자</h2>
          <p className="section-subtitle">함께하는 파트너들</p>
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
      <section className="section" id="process">
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">투자 절차</h2>
          <p className="section-subtitle">시드 투자 진행 과정</p>
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

      {/* Token Metrics Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">METRICS</span>
          <h2 className="section-title">토큰 지표</h2>
          <p className="section-subtitle">시드 라운드 핵심 지표</p>
        </div>

        <div className="metrics-grid">
          {tokenMetrics.map((metric, idx) => (
            <div key={idx} className="metric-card">
              <div className="metric-icon">{metric.icon}</div>
              <h4>{metric.title}</h4>
              <div className="value">{metric.value}</div>
              <p>{metric.desc}</p>
            </div>
          ))}
        </div>

        <div className="risk-section">
          <h4>⚠️ 투자 위험 고지</h4>
          <ul>
            {riskItems.map((risk, idx) => (
              <li key={idx}>{risk}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">시드 투자에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>TBURN Chain은 무엇이고 왜 투자해야 하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TBURN Chain은 AI 기반 동적 샤딩 기술을 적용한 차세대 Layer-1 블록체인입니다. 64개 샤드, 125개 제네시스 검증자를 통해 초당 21만 TPS와 100ms 블록 타임을 목표로 합니다. 디플레이션 토큰 이코노믹스와 AI 거버넌스를 결합하여 장기적인 가치 성장을 추구합니다. 시드 투자자는 퍼블릭 세일 대비 80% 할인된 $0.04에 참여할 수 있으며, 네트워크 성장에 따른 초기 투자자 혜택을 누릴 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>시드 라운드 투자 조건과 베스팅 일정은 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>시드 라운드는 토큰당 $0.04, 총 5억 TBURN(전체 공급량의 5%)이 배정됩니다. 하드캡은 $2,000만입니다. 베스팅 조건: TGE 후 12개월 클리프(락업) 기간이 있으며, 클리프 종료 후 24개월에 걸쳐 선형 언락됩니다. 첫 언락 시 5%가 지급되고, 이후 매월 약 3.96%씩 자동 분배됩니다. 장기 보유를 통한 네트워크 안정성 확보를 위한 설계입니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>최소/최대 투자 금액과 투자자 티어는 어떻게 구분되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>시드 라운드는 3개 티어로 구성됩니다: (1) 엔젤 티어: $25,000 ~ $99,999, 기본 할당 및 월간 투자자 뉴스레터 제공 (2) 스트래티직 티어: $100,000 ~ $499,999, 10% 추가 보너스 토큰 및 분기별 팀 미팅 참여권 (3) 리드 티어: $500,000 이상, 20% 추가 보너스 토큰, 어드바이저 보드 참여 기회, 월간 프로젝트 업데이트 콜 제공. 모든 티어에서 KYC 인증이 필수입니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>투자 절차와 필요 서류는 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>투자 절차: (1) 투자 문의 접수 → (2) NDA 및 투자 의향서 체결 → (3) KYC/AML 인증(여권/신분증, 주소 증빙, 자금 출처 증명) → (4) SAFT 계약 체결 → (5) 투자금 송금(USDT, USDC, 또는 은행 송금) → (6) 토큰 할당 확인서 발급. 전체 과정은 보통 7-14 영업일 소요되며, 담당 매니저가 배정되어 1:1로 안내해 드립니다. 기관 투자자의 경우 별도 협의가 가능합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>SAFT 계약이란 무엇이며, 투자자 보호는 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>SAFT(Simple Agreement for Future Tokens)는 미국 SEC 가이드라인을 준수하는 표준 투자 계약입니다. 계약에는 토큰 할당량, 베스팅 일정, 투자자 권리, 환불 조건, 분쟁 해결 절차가 명시됩니다. 투자금은 제3자 에스크로 계정에 보관되며, 마일스톤 달성에 따라 프로젝트에 지급됩니다. 법률 자문은 글로벌 로펌 Dentons와 협력하며, 분기별 재무 보고서를 투자자에게 제공합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-6')}>
              <h4>토큰 상장 계획과 예상 일정은 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TGE(Token Generation Event)는 메인넷 런칭과 동시에 진행될 예정입니다. 상장 전략: 먼저 주요 DEX(Uniswap, PancakeSwap)에 유동성을 공급하고, 이후 Tier-1 CEX(Binance, OKX, Bybit 등)와의 상장 협의를 진행합니다. 마케팅 부스팅과 함께 단계적 거래소 확장을 계획하고 있습니다. 런칭 가격은 $0.50(시드 대비 12.5배)으로 예정되어 있으며, 시장 상황에 따라 조정될 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-7')}>
              <h4>투자금 용도와 자금 집행 계획은 어떻게 되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>시드 라운드 모집 자금 사용 계획: 기술 개발 45%(코어 프로토콜, AI 엔진, 보안 인프라), 마케팅 및 파트너십 25%(글로벌 마케팅, 전략적 파트너십, 커뮤니티 빌딩), 운영 및 법률 15%(팀 운영, 법률/컴플라이언스, 오피스), 유동성 공급 10%(DEX/CEX 초기 유동성), 예비비 5%(비상 자금, 시장 기회 대응). 분기별 자금 사용 보고서를 투자자에게 제공합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-8')}>
              <h4>환불 정책과 투자 취소는 가능한가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>SAFT 계약 체결 전까지는 전액 환불이 가능합니다. 계약 체결 후에는 프로젝트 중단, 메인넷 런칭 실패, 법적 문제 발생 시에만 환불 청구가 가능합니다. 환불 시에는 원금의 100%가 지급되며, 처리 기간은 약 30 영업일입니다. 투자자 개인 사정에 의한 중도 해지는 불가하오니, 신중한 투자 결정을 부탁드립니다. 세부 환불 조건은 SAFT 계약서에 명시되어 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>시드 투자자가 되세요</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN Chain의 초기 투자자로<br />
            최대 70% 할인된 가격에 투자하세요!
          </p>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--dark)', fontSize: '1.25rem', padding: '20px 50px' }}
            data-testid="button-invest-now"
            onClick={() => setInquiryDialogOpen(true)}
          >
            🌱 지금 투자하기
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

      {/* Investment Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'white', fontSize: '1.5rem' }}>🌱 시드 라운드 투자 문의</DialogTitle>
            <DialogDescription style={{ color: 'rgba(255,255,255,0.7)' }}>
              투자 문의를 남겨주시면 담당자가 빠른 시일 내에 연락드리겠습니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInquirySubmit} className="space-y-4" style={{ marginTop: '1rem' }}>
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: 'rgba(255,255,255,0.9)' }}>이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="홍길동"
                data-testid="input-inquiry-name"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: 'rgba(255,255,255,0.9)' }}>이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="investor@example.com"
                data-testid="input-inquiry-email"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" style={{ color: 'rgba(255,255,255,0.9)' }}>회사/기관명</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="투자회사명"
                data-testid="input-inquiry-company"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentAmount" style={{ color: 'rgba(255,255,255,0.9)' }}>예상 투자금액</Label>
              <Input
                id="investmentAmount"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                placeholder="$50,000"
                data-testid="input-inquiry-amount"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" style={{ color: 'rgba(255,255,255,0.9)' }}>문의 내용</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="투자에 관한 질문이나 요청사항을 작성해주세요."
                rows={4}
                data-testid="input-inquiry-message"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInquiryDialogOpen(false)}
                data-testid="button-cancel-inquiry"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={inquiryMutation.isPending}
                data-testid="button-submit-inquiry"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
              >
                {inquiryMutation.isPending ? '제출 중...' : '문의 제출'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Investment Memo Dialog */}
      <Dialog open={memoDialogOpen} onOpenChange={setMemoDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: 'white', maxHeight: '80vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'white', fontSize: '1.5rem' }}>📖 TBURN Chain 투자 메모</DialogTitle>
            <DialogDescription style={{ color: 'rgba(255,255,255,0.7)' }}>
              시드 라운드 투자에 대한 주요 정보입니다.
            </DialogDescription>
          </DialogHeader>
          <div style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <h4 style={{ color: '#22c55e', marginBottom: '0.5rem', fontWeight: 600 }}>핵심 투자 정보</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', paddingLeft: '1.25rem' }}>
                <li>토큰 가격: <strong style={{ color: 'white' }}>$0.04</strong> (시장가 대비 80% 할인)</li>
                <li>총 배정량: <strong style={{ color: 'white' }}>5억 TBURN</strong></li>
                <li>하드캡: <strong style={{ color: 'white' }}>$20,000,000</strong></li>
                <li>최소 투자금: <strong style={{ color: 'white' }}>$10,000</strong></li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 600 }}>베스팅 스케줄</h4>
              <ul style={{ color: 'rgba(255,255,255,0.8)', paddingLeft: '1.25rem' }}>
                <li>클리프 기간: <strong style={{ color: 'white' }}>12개월</strong></li>
                <li>초기 언락: <strong style={{ color: 'white' }}>10%</strong> (TGE+12개월)</li>
                <li>월별 베스팅: <strong style={{ color: 'white' }}>7.5%</strong> (12개월)</li>
                <li>전체 언락: <strong style={{ color: 'white' }}>24개월</strong></li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 600 }}>투자 절차</h4>
              <ol style={{ color: 'rgba(255,255,255,0.8)', paddingLeft: '1.25rem' }}>
                <li>투자 문의 제출 (1-3일)</li>
                <li>KYC/AML 인증 절차 (3-5일)</li>
                <li>SAFT 계약 체결 (1-2일)</li>
                <li>투자금 전송 및 확인 (1-2일)</li>
              </ol>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem', fontWeight: 600 }}>문의처</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                이메일: <a href="mailto:invest@tburnchain.io" style={{ color: '#22c55e' }}>invest@tburnchain.io</a><br />
                텔레그램: <a href="https://t.me/tburnchain" style={{ color: '#22c55e' }}>@tburnchain</a>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMemoDialogOpen(false)}
              data-testid="button-close-memo"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              닫기
            </Button>
            <Button
              type="button"
              onClick={() => {
                setMemoDialogOpen(false);
                setInquiryDialogOpen(true);
              }}
              data-testid="button-memo-to-inquiry"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
            >
              투자 문의하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
