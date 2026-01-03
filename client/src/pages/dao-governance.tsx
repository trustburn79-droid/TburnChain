import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";

interface DAOStatsData {
  totalProposals: number;
  activeProposals: number;
  totalVotes: number;
  totalVotingPower: number;
  quorumThreshold: number;
  recentProposals: Array<{
    id: string;
    title: string;
    status: string;
    forVotes: number;
    againstVotes: number;
  }>;
}

interface DAOStatsResponse {
  success: boolean;
  data: DAOStatsData;
}

export default function DAOGovernancePage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();

  const { data: response, isLoading } = useQuery<DAOStatsResponse>({
    queryKey: ['/api/token-programs/dao/stats'],
  });
  const stats = response?.data;

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

  const proposals = [
    { id: "TIP-001", title: "스테이킹 보상률 조정", desc: "연간 스테이킹 보상률을 12%에서 15%로 상향 조정", category: "protocol", status: "active", forVotes: 72, againstVotes: 18, abstainVotes: 10, quorum: 65, author: "CoreTeam", endDate: "2026.01.15" },
    { id: "TIP-002", title: "생태계 펀드 집행 제안", desc: "DeFi 프로토콜 파트너십을 위한 5,000만 TBURN 집행", category: "treasury", status: "active", forVotes: 58, againstVotes: 32, abstainVotes: 10, quorum: 48, author: "Treasury", endDate: "2026.01.18" },
    { id: "TIP-003", title: "크로스체인 브릿지 확장", desc: "Polygon, Arbitrum 네트워크 브릿지 추가 지원", category: "ecosystem", status: "pending", forVotes: 0, againstVotes: 0, abstainVotes: 0, quorum: 0, author: "DevTeam", endDate: "2026.01.20" },
  ];

  const processSteps = [
    { number: 1, title: "제안 제출", desc: "누구나 제안 제출 가능", duration: "최소 10,000 vTBURN" },
    { number: 2, title: "토론 기간", desc: "커뮤니티 피드백 수집", duration: "3일" },
    { number: 3, title: "투표 기간", desc: "토큰 보유자 투표", duration: "5일" },
    { number: 4, title: "타임락", desc: "실행 대기 기간", duration: "2일" },
    { number: 5, title: "실행", desc: "자동 온체인 실행", duration: "즉시" },
  ];

  const committees = [
    { id: "tech", icon: "⚙️", name: "기술 위원회", desc: "프로토콜 업그레이드 검토", members: 7, proposals: 23 },
    { id: "finance", icon: "💰", name: "재무 위원회", desc: "자금 집행 승인", members: 5, proposals: 45 },
    { id: "ecosystem", icon: "🌱", name: "생태계 위원회", desc: "파트너십 & 그랜트", members: 9, proposals: 67 },
    { id: "security", icon: "🛡️", name: "보안 위원회", desc: "보안 감사 및 대응", members: 5, proposals: 12 },
  ];

  const rewardTypes = [
    { id: "voting", icon: "🗳️", title: "투표 참여 보상", amount: "투표당 10~50 TBURN", benefits: ["모든 제안 투표 시 보상", "참여율에 따른 보너스", "연속 투표 스트릭 보너스", "거버넌스 NFT 획득 기회"] },
    { id: "proposal", icon: "📝", title: "제안 보상", amount: "제안당 최대 5,000 TBURN", benefits: ["승인된 제안에 대한 보상", "구현 완료 시 추가 보너스", "커뮤니티 기여도 인정", "제안자 명예의 전당 등재"] },
    { id: "committee", icon: "👥", title: "위원회 보상", amount: "월 최대 10,000 TBURN", benefits: ["위원회 활동 정기 보상", "심사 건수당 추가 보상", "임기 완료 보너스", "거버넌스 리더십 인증"] },
  ];

  const delegates = [
    { name: "CoreValidator", role: "검증인", power: "2.4M", initials: "CV" },
    { name: "DeFiMaster", role: "DeFi 전문가", power: "1.8M", initials: "DM" },
    { name: "CommunityLead", role: "커뮤니티", power: "1.2M", initials: "CL" },
  ];

  return (
    <div className="dao-page">
      <style>{`
        .dao-page {
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
          --indigo: #6366F1;
          --emerald: #10B981;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-dao: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .dao-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
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

        .nav-links a:hover { color: var(--indigo); }

        .connect-btn {
          background: var(--gradient-dao);
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
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
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
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--indigo);
          margin-bottom: 2rem;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-dao);
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
          border-color: var(--indigo);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-dao);
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
          background: var(--gradient-dao);
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
          box-shadow: 0 20px 60px rgba(99, 102, 241, 0.4);
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
          border-color: var(--indigo);
          color: var(--indigo);
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
          background: rgba(99, 102, 241, 0.15);
          color: var(--indigo);
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
          grid-template-columns: repeat(4, 1fr);
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
          border-color: var(--indigo);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.voting::before { background: var(--gradient-dao); }
        .dist-card.proposal::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
        .dist-card.committee::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }
        .dist-card.treasury::before { background: var(--gradient-gold); }

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
          color: var(--indigo);
          margin-bottom: 0.25rem;
        }

        .dist-percent {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          position: relative;
        }

        .process-grid::before {
          content: '';
          position: absolute;
          top: 50px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--indigo), var(--purple), var(--indigo), transparent);
          z-index: 0;
        }

        .process-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          position: relative;
          z-index: 1;
          transition: all 0.3s;
        }

        .process-card:hover {
          transform: translateY(-10px);
          border-color: var(--indigo);
        }

        .process-number {
          width: 50px;
          height: 50px;
          background: var(--gradient-dao);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0 auto 1rem;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }

        .process-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .process-desc {
          font-size: 0.85rem;
          color: var(--light-gray);
        }

        .process-duration {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--indigo);
          font-weight: 600;
        }

        .proposals-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .proposal-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          transition: all 0.3s;
        }

        .proposal-card:hover {
          border-color: var(--indigo);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .proposal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .proposal-info {
          flex: 1;
        }

        .proposal-id {
          font-size: 0.8rem;
          color: var(--indigo);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .proposal-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .proposal-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.875rem;
          color: var(--gray);
        }

        .proposal-status {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .proposal-status.active {
          background: rgba(34, 197, 94, 0.15);
          color: var(--success);
          animation: pulse 2s infinite;
        }

        .proposal-status.pending {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
        }

        .proposal-body {
          margin-bottom: 1.5rem;
        }

        .proposal-desc {
          color: var(--light-gray);
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .proposal-category {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .proposal-category.protocol { background: rgba(99, 102, 241, 0.15); color: var(--indigo); }
        .proposal-category.treasury { background: rgba(212, 175, 55, 0.15); color: var(--gold); }
        .proposal-category.ecosystem { background: rgba(16, 185, 129, 0.15); color: var(--emerald); }

        .proposal-voting {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 2rem;
          align-items: center;
        }

        .vote-progress {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .vote-bar {
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          overflow: hidden;
          display: flex;
        }

        .vote-bar .for {
          background: var(--success);
          transition: width 0.5s ease;
        }

        .vote-bar .against {
          background: var(--danger);
          transition: width 0.5s ease;
        }

        .vote-bar .abstain {
          background: var(--gray);
          transition: width 0.5s ease;
        }

        .vote-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .vote-labels .for { color: var(--success); }
        .vote-labels .against { color: var(--danger); }

        .vote-stats {
          text-align: center;
        }

        .vote-stats .quorum-label {
          font-size: 0.75rem;
          color: var(--gray);
          margin-bottom: 0.25rem;
        }

        .vote-stats .quorum-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--indigo);
        }

        .vote-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .vote-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.875rem;
        }

        .vote-btn.for {
          background: var(--success);
          color: var(--white);
        }

        .vote-btn.against {
          background: var(--danger);
          color: var(--white);
        }

        .vote-btn:hover {
          transform: translateY(-2px);
        }

        .committee-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .committee-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .committee-card:hover {
          transform: translateY(-10px);
          border-color: var(--indigo);
        }

        .committee-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .committee-card.tech .committee-icon { background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)); }
        .committee-card.finance .committee-icon { background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(245, 158, 11, 0.2)); }
        .committee-card.ecosystem .committee-icon { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2)); }
        .committee-card.security .committee-icon { background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2)); }

        .committee-name {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .committee-desc {
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 1rem;
        }

        .committee-stats {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .committee-stat {
          text-align: center;
        }

        .committee-stat .value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--indigo);
        }

        .committee-stat .label {
          font-size: 0.7rem;
          color: var(--gray);
        }

        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .reward-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .reward-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .reward-card.voting::before { background: var(--gradient-dao); }
        .reward-card.proposal::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
        .reward-card.committee::before { background: linear-gradient(90deg, var(--gold), var(--warning)); }

        .reward-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .reward-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .reward-card.voting .reward-icon { background: rgba(99, 102, 241, 0.2); }
        .reward-card.proposal .reward-icon { background: rgba(59, 130, 246, 0.2); }
        .reward-card.committee .reward-icon { background: rgba(212, 175, 55, 0.2); }

        .reward-title {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .reward-amount {
          font-size: 2rem;
          font-weight: 900;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .reward-details {
          list-style: none;
          padding: 0;
        }

        .reward-details li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .reward-details li::before {
          content: '✓';
          color: var(--success);
          font-size: 12px;
        }

        .delegation-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .delegation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .delegation-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .delegate-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .delegate-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .delegate-item:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .delegate-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--gradient-dao);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .delegate-info {
          flex: 1;
        }

        .delegate-info h5 {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .delegate-info p {
          font-size: 0.75rem;
          color: var(--gray);
        }

        .delegate-power {
          text-align: right;
        }

        .delegate-power .value {
          font-weight: 700;
          color: var(--indigo);
        }

        .delegate-power .label {
          font-size: 0.7rem;
          color: var(--gray);
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
          color: var(--indigo);
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
          background: var(--gradient-dao);
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
          background: var(--indigo);
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
        .footer-links a:hover { color: var(--indigo); }

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
          .committee-grid { grid-template-columns: repeat(2, 1fr); }
          .rewards-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .process-grid { grid-template-columns: repeat(3, 1fr); }
          .process-grid::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
          .proposal-voting { grid-template-columns: 1fr; gap: 1rem; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .process-grid { grid-template-columns: repeat(2, 1fr); }
          .committee-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="dao-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#proposals">제안</a>
            <a href="#process">프로세스</a>
            <a href="#committees">위원회</a>
            <a href="#rewards">보상</a>
            <a href="#faq">FAQ</a>
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
            🏛️ DAO GOVERNANCE - 탈중앙화 거버넌스
          </div>
          <h1>
            프로토콜의 미래를 결정하는<br />
            <span className="gradient-text">8억 TBURN</span> 거버넌스 보상
          </h1>
          <p className="hero-subtitle">
            투표에 참여하고, 제안을 제출하고, 위원회 활동을 통해
            TBURN Chain의 방향을 결정하며 보상을 받으세요!
          </p>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-proposals">
              <div className="stat-value">{isLoading ? '...' : stats?.totalProposals || 0}</div>
              <div className="stat-label">총 제안 수</div>
            </div>
            <div className="stat-card" data-testid="stat-active-proposals">
              <div className="stat-value">{isLoading ? '...' : stats?.activeProposals || 0}</div>
              <div className="stat-label">진행중인 제안</div>
            </div>
            <div className="stat-card" data-testid="stat-total-votes">
              <div className="stat-value">{isLoading ? '...' : stats?.totalVotes?.toLocaleString() || 0}</div>
              <div className="stat-label">총 투표 수</div>
            </div>
            <div className="stat-card" data-testid="stat-voting-power">
              <div className="stat-value">{isLoading ? '...' : Number(stats?.totalVotingPower || 0).toLocaleString()}</div>
              <div className="stat-label">총 투표력 (TBURN)</div>
            </div>
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-vote">
              🗳️ 투표 참여하기
            </button>
            <button className="btn-secondary">
              📝 제안 제출하기
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">거버넌스 보상 배분</h2>
          <p className="section-subtitle">8억 TBURN이 4가지 카테고리로 배분됩니다</p>
        </div>

        <div className="distribution-grid">
          <div className="dist-card voting" data-testid="dist-voting">
            <div className="dist-icon">🗳️</div>
            <div className="dist-name">투표 참여 보상</div>
            <div className="dist-amount">4억</div>
            <div className="dist-percent">50%</div>
          </div>
          <div className="dist-card proposal" data-testid="dist-proposal">
            <div className="dist-icon">📝</div>
            <div className="dist-name">제안 보상</div>
            <div className="dist-amount">1.6억</div>
            <div className="dist-percent">20%</div>
          </div>
          <div className="dist-card committee" data-testid="dist-committee">
            <div className="dist-icon">👥</div>
            <div className="dist-name">위원회 보상</div>
            <div className="dist-amount">1.6억</div>
            <div className="dist-percent">20%</div>
          </div>
          <div className="dist-card treasury" data-testid="dist-treasury">
            <div className="dist-icon">💰</div>
            <div className="dist-name">DAO 예비금</div>
            <div className="dist-amount">0.8억</div>
            <div className="dist-percent">10%</div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section" id="process" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PROCESS</span>
          <h2 className="section-title">거버넌스 프로세스</h2>
          <p className="section-subtitle">제안부터 실행까지의 5단계 과정</p>
        </div>

        <div className="process-grid">
          {processSteps.map(step => (
            <div key={step.number} className="process-card">
              <div className="process-number">{step.number}</div>
              <h4 className="process-title">{step.title}</h4>
              <p className="process-desc">{step.desc}</p>
              <p className="process-duration">{step.duration}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Proposals Section */}
      <section className="section" id="proposals">
        <div className="section-header">
          <span className="section-badge">PROPOSALS</span>
          <h2 className="section-title">활성 제안</h2>
          <p className="section-subtitle">현재 진행 중인 투표에 참여하세요</p>
        </div>

        <div className="proposals-container">
          {proposals.map(proposal => (
            <div key={proposal.id} className="proposal-card" data-testid={`proposal-${proposal.id}`}>
              <div className="proposal-header">
                <div className="proposal-info">
                  <div className="proposal-id">{proposal.id}</div>
                  <h3 className="proposal-title">{proposal.title}</h3>
                  <div className="proposal-meta">
                    <span>📅 마감: {proposal.endDate}</span>
                    <span>👤 제안자: {proposal.author}</span>
                  </div>
                </div>
                <span className={`proposal-status ${proposal.status}`}>
                  {proposal.status === 'active' ? '투표중' : '대기중'}
                </span>
              </div>
              <div className="proposal-body">
                <p className="proposal-desc">{proposal.desc}</p>
                <span className={`proposal-category ${proposal.category}`}>
                  {proposal.category === 'protocol' ? '프로토콜' : 
                   proposal.category === 'treasury' ? '재무' : '생태계'}
                </span>
              </div>
              {proposal.status === 'active' && (
                <div className="proposal-voting">
                  <div className="vote-progress">
                    <div className="vote-bar">
                      <div className="for" style={{ width: `${proposal.forVotes}%` }}></div>
                      <div className="against" style={{ width: `${proposal.againstVotes}%` }}></div>
                      <div className="abstain" style={{ width: `${proposal.abstainVotes}%` }}></div>
                    </div>
                    <div className="vote-labels">
                      <span className="for">찬성 {proposal.forVotes}%</span>
                      <span className="against">반대 {proposal.againstVotes}%</span>
                    </div>
                  </div>
                  <div className="vote-stats">
                    <div className="quorum-label">정족수 달성률</div>
                    <div className="quorum-value">{proposal.quorum}%</div>
                  </div>
                  <div className="vote-buttons">
                    <button className="vote-btn for">찬성</button>
                    <button className="vote-btn against">반대</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Committees Section */}
      <section className="section" id="committees" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">COMMITTEES</span>
          <h2 className="section-title">거버넌스 위원회</h2>
          <p className="section-subtitle">전문 분야별 위원회에서 심도있는 논의</p>
        </div>

        <div className="committee-grid">
          {committees.map(committee => (
            <div key={committee.id} className={`committee-card ${committee.id}`} data-testid={`committee-${committee.id}`}>
              <div className="committee-icon">{committee.icon}</div>
              <h3 className="committee-name">{committee.name}</h3>
              <p className="committee-desc">{committee.desc}</p>
              <div className="committee-stats">
                <div className="committee-stat">
                  <div className="value">{committee.members}</div>
                  <div className="label">위원</div>
                </div>
                <div className="committee-stat">
                  <div className="value">{committee.proposals}</div>
                  <div className="label">심의</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rewards Section */}
      <section className="section" id="rewards">
        <div className="section-header">
          <span className="section-badge">REWARDS</span>
          <h2 className="section-title">거버넌스 참여 보상</h2>
          <p className="section-subtitle">다양한 방법으로 거버넌스에 참여하고 보상받으세요</p>
        </div>

        <div className="rewards-grid">
          {rewardTypes.map(reward => (
            <div key={reward.id} className={`reward-card ${reward.id}`} data-testid={`reward-${reward.id}`}>
              <div className="reward-header">
                <div className="reward-icon">{reward.icon}</div>
                <h3 className="reward-title">{reward.title}</h3>
              </div>
              <div className="reward-amount">{reward.amount}</div>
              <ul className="reward-details">
                {reward.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Delegation Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">DELEGATION</span>
          <h2 className="section-title">투표권 위임</h2>
          <p className="section-subtitle">신뢰하는 대리인에게 투표권을 위임하세요</p>
        </div>

        <div className="delegation-section">
          <div className="delegation-header">
            <h3>🏆 Top Delegates</h3>
          </div>

          <div className="delegate-list">
            {delegates.map((delegate, idx) => (
              <div key={idx} className="delegate-item">
                <div className="delegate-avatar">{delegate.initials}</div>
                <div className="delegate-info">
                  <h5>{delegate.name}</h5>
                  <p>{delegate.role}</p>
                </div>
                <div className="delegate-power">
                  <div className="value">{delegate.power} vTBURN</div>
                  <div className="label">Voting Power</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">거버넌스에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>투표권(vTBURN)은 어떻게 얻나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TBURN 토큰을 스테이킹하면 투표권(vTBURN)을 받습니다. 스테이킹 기간이 길수록 더 많은 투표권을 받습니다. 4년 락업 시 최대 4배의 투표권을 받을 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>제안을 제출하려면 어떻게 하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>최소 10,000 vTBURN을 보유해야 제안을 제출할 수 있습니다. 제안서를 작성하고 포럼에서 3일간 토론 후 온체인 투표에 부쳐집니다. 승인된 제안은 자동으로 실행됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>위원회에 참여하려면 어떻게 하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>위원회 선거는 분기별로 진행됩니다. 후보 등록 후 커뮤니티 투표를 통해 선출됩니다. 최소 50,000 vTBURN을 보유하고 관련 분야 전문성을 입증해야 합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>투표 보상은 어떻게 지급되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>투표에 참여할 때마다 투표권 수량에 비례하여 보상이 지급됩니다. 보상은 투표 종료 후 24시간 이내에 청구 가능하며, 연속 투표 참여 시 추가 보너스가 제공됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>거버넌스에 참여하세요!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN Chain의 미래를 함께 결정하고<br />
            8억 TBURN 보상을 받아가세요!
          </p>
          <button className="connect-btn" style={{ background: 'var(--white)', color: 'var(--indigo)', fontSize: '1.25rem', padding: '20px 50px' }}>
            🏛️ 지금 참여하기
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
