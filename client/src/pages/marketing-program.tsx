import { useState } from "react";
import { Link } from "wouter";
import { TBurnLogo } from "@/components/tburn-logo";

export default function MarketingProgramPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const socialStats = [
    { icon: "𝕏", value: "250K+", label: "Twitter 팔로워" },
    { icon: "✈", value: "180K+", label: "Telegram 멤버" },
    { icon: "💬", value: "120K+", label: "Discord 멤버" },
    { icon: "📺", value: "85K+", label: "YouTube 구독자" },
    { icon: "📱", value: "200K+", label: "TikTok 팔로워" },
  ];

  const distributions = [
    { id: "brand", icon: "🎨", name: "브랜드 마케팅", amount: "0.9억", percent: "30%" },
    { id: "influencer", icon: "⭐", name: "인플루언서", amount: "0.75억", percent: "25%" },
    { id: "creator", icon: "🎬", name: "컨텐츠 크리에이터", amount: "0.6억", percent: "20%" },
    { id: "event", icon: "🎉", name: "이벤트 마케팅", amount: "0.45억", percent: "15%" },
    { id: "pr", icon: "📰", name: "PR & 미디어", amount: "0.3억", percent: "10%" },
  ];

  const programs = [
    { id: "ambassador", icon: "👑", title: "앰배서더 프로그램", subtitle: "TBURN의 공식 대사가 되세요", rewards: [{ value: "최대 50만", label: "월간 보상" }, { value: "무제한", label: "레퍼럴 보상" }], features: ["공식 앰배서더 인증", "독점 이벤트 초대", "얼리 액세스 권한", "전용 마케팅 자료"], featured: true, badge: "HOT" },
    { id: "influencer", icon: "🎯", title: "인플루언서 협업", subtitle: "크리에이터와 함께하는 성장", rewards: [{ value: "협업당 $500+", label: "캠페인 보상" }, { value: "10%", label: "매출 수수료" }], features: ["맞춤형 캠페인 설계", "마케팅 자료 제공", "성과 기반 보너스", "장기 파트너십 옵션"], featured: false, badge: "NEW" },
    { id: "creator", icon: "🎬", title: "컨텐츠 크리에이터", subtitle: "영상, 아티클, 교육 컨텐츠", rewards: [{ value: "컨텐츠당 $100+", label: "기본 보상" }, { value: "품질 보너스", label: "추가 보상" }], features: ["다양한 컨텐츠 유형", "크리에이터 펀드 지원", "조회수 보너스", "월간 콘테스트"], featured: false, badge: null },
    { id: "event", icon: "🎉", title: "이벤트 마케팅", subtitle: "온/오프라인 이벤트 참여", rewards: [{ value: "이벤트당 $200+", label: "참여 보상" }, { value: "특별 NFT", label: "이벤트 보상" }], features: ["밋업 주최 지원", "컨퍼런스 참가", "온라인 AMA", "커뮤니티 이벤트"], featured: false, badge: null },
  ];

  const ambassadorTiers = [
    { id: "legend", icon: "🏆", tier: "Legend", requirement: "500+ 레퍼럴", reward: "월 50만", perks: ["전용 멘토 배정", "오프라인 밋업 초대", "NFT 에어드랍", "거버넌스 투표권"] },
    { id: "elite", icon: "💎", tier: "Elite", requirement: "200+ 레퍼럴", reward: "월 20만", perks: ["프리미엄 뱃지", "우선 지원", "베타 테스트 권한", "월간 콜 참여"] },
    { id: "rising", icon: "🚀", tier: "Rising", requirement: "50+ 레퍼럴", reward: "월 5만", perks: ["공식 인증", "Discord 역할", "마케팅 자료", "레퍼럴 링크"] },
    { id: "starter", icon: "⭐", tier: "Starter", requirement: "10+ 레퍼럴", reward: "월 1만", perks: ["스타터 뱃지", "기본 자료", "커뮤니티 접근", "튜토리얼"] },
  ];

  const contentTypes = [
    { icon: "📹", title: "비디오", desc: "유튜브/틱톡 영상", reward: "$100~500" },
    { icon: "📝", title: "아티클", desc: "블로그/미디엄 글", reward: "$50~200" },
    { icon: "🎨", title: "그래픽", desc: "인포그래픽/밈", reward: "$30~100" },
    { icon: "🎓", title: "튜토리얼", desc: "교육 컨텐츠", reward: "$150~400" },
  ];

  const campaigns = [
    { icon: "𝕏", type: "twitter", title: "#TBURNChain 트윗 챌린지", desc: "TBURN을 소개하는 트윗 작성", reward: "5,000", participants: "1,234", status: "active", statusLabel: "진행중" },
    { icon: "📺", type: "youtube", title: "TBURN 리뷰 영상", desc: "TBURN Chain 분석 영상 제작", reward: "50,000", participants: "89", status: "active", statusLabel: "진행중" },
    { icon: "📱", type: "tiktok", title: "TikTok 쇼트폼 챌린지", desc: "15~60초 TBURN 소개 영상", reward: "10,000", participants: "567", status: "ending", statusLabel: "마감임박" },
    { icon: "📰", type: "article", title: "TBURN 딥다이브 아티클", desc: "기술/토크노믹스 분석글 작성", reward: "20,000", participants: "156", status: "upcoming", statusLabel: "예정" },
  ];

  const leaderboard = [
    { rank: 1, name: "CryptoKing", handle: "@crypto_king", tier: "legend", points: "125,340", rewards: "2,450,000" },
    { rank: 2, name: "BlockchainPro", handle: "@bc_pro", tier: "legend", points: "98,720", rewards: "1,890,000" },
    { rank: 3, name: "DeFiMaster", handle: "@defi_master", tier: "elite", points: "76,450", rewards: "1,240,000" },
    { rank: 4, name: "TokenHunter", handle: "@token_hunter", tier: "elite", points: "54,210", rewards: "890,000" },
    { rank: 5, name: "CryptoNinja", handle: "@crypto_ninja", tier: "rising", points: "42,890", rewards: "650,000" },
  ];

  return (
    <div className="marketing-program-page">
      <style>{`
        .marketing-program-page {
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
          --fuchsia: #D946EF;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-marketing: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
          --gradient-ambassador: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes megaphone { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }

        .marketing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(236, 72, 153, 0.2);
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
        .nav-links a:hover { color: var(--pink); }

        .connect-btn {
          background: var(--gradient-marketing);
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
          box-shadow: 0 10px 40px rgba(236, 72, 153, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(244, 63, 94, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
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
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--pink);
          margin-bottom: 2rem;
        }

        .badge .megaphone-icon { animation: megaphone 1s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-marketing);
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

        .social-stats-banner {
          background: linear-gradient(90deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .social-stat {
          text-align: center;
          position: relative;
        }

        .social-stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .social-stat .icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .social-stat .value { font-size: 1.25rem; font-weight: 800; color: var(--pink); }
        .social-stat .label { font-size: 0.75rem; color: var(--gray); margin-top: 0.25rem; }

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
          border-color: var(--pink);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-marketing);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-marketing);
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
          box-shadow: 0 20px 60px rgba(236, 72, 153, 0.4);
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

        .btn-secondary:hover { border-color: var(--pink); color: var(--pink); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(236, 72, 153, 0.15);
          color: var(--pink);
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
          border-color: var(--pink);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.brand::before { background: var(--gradient-marketing); }
        .dist-card.influencer::before { background: linear-gradient(90deg, var(--rose), var(--warning)); }
        .dist-card.creator::before { background: linear-gradient(90deg, var(--cyan), var(--blue)); }
        .dist-card.event::before { background: linear-gradient(90deg, var(--purple), var(--fuchsia)); }
        .dist-card.pr::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--pink); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .programs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .program-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .program-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          border-color: var(--pink);
        }

        .program-card.featured {
          border-color: var(--pink);
          box-shadow: 0 0 40px rgba(236, 72, 153, 0.2);
        }

        .program-header {
          padding: 2rem;
          position: relative;
        }

        .program-card.ambassador .program-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1)); }
        .program-card.influencer .program-header { background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(245, 158, 11, 0.1)); }
        .program-card.creator .program-header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.1)); }
        .program-card.event .program-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1)); }

        .program-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .program-badge.hot { background: var(--gradient-marketing); color: var(--white); }
        .program-badge.new { background: var(--success); color: var(--white); }

        .program-icon { font-size: 3rem; margin-bottom: 1rem; }
        .program-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
        .program-subtitle { color: var(--light-gray); font-size: 0.9rem; }

        .program-content { padding: 0 2rem 2rem; }

        .program-rewards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .reward-box {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          text-align: center;
        }

        .reward-box .value { font-size: 1.25rem; font-weight: 800; color: var(--pink); margin-bottom: 0.25rem; }
        .reward-box .label { font-size: 0.75rem; color: var(--gray); }

        .program-features { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .program-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .program-features li:last-child { border-bottom: none; }
        .program-features li::before { content: '✓'; color: var(--success); }

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
          background: var(--gradient-marketing);
          color: var(--white);
        }

        .program-btn:hover { transform: scale(1.02); }

        .ambassador-tiers {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .ambassador-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .ambassador-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .ambassador-card.legend { border-color: var(--gold); background: linear-gradient(180deg, rgba(212, 175, 55, 0.1), transparent); }
        .ambassador-card.elite { border-color: var(--pink); }
        .ambassador-card.rising { border-color: var(--purple); }
        .ambassador-card.starter { border-color: var(--cyan); }

        .ambassador-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }

        .ambassador-tier { font-size: 1.125rem; font-weight: 800; margin-bottom: 0.25rem; }

        .ambassador-card.legend .ambassador-tier { color: var(--gold); }
        .ambassador-card.elite .ambassador-tier { color: var(--pink); }
        .ambassador-card.rising .ambassador-tier { color: var(--purple); }
        .ambassador-card.starter .ambassador-tier { color: var(--cyan); }

        .ambassador-requirement { font-size: 0.8rem; color: var(--gray); margin-bottom: 1rem; }

        .ambassador-reward {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .ambassador-reward .value { font-size: 1.25rem; font-weight: 800; }

        .ambassador-card.legend .ambassador-reward .value { color: var(--gold); }
        .ambassador-card.elite .ambassador-reward .value { color: var(--pink); }
        .ambassador-card.rising .ambassador-reward .value { color: var(--purple); }
        .ambassador-card.starter .ambassador-reward .value { color: var(--cyan); }

        .ambassador-reward .label { font-size: 0.75rem; color: var(--gray); }

        .ambassador-perks { list-style: none; text-align: left; font-size: 0.8rem; padding: 0; }

        .ambassador-perks li {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
          color: var(--light-gray);
        }

        .ambassador-perks li::before { content: '✓'; color: var(--success); font-size: 10px; }

        .content-types-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .content-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .content-card:hover {
          transform: translateY(-5px);
          border-color: var(--pink);
        }

        .content-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(236, 72, 153, 0.2);
        }

        .content-title { font-weight: 700; margin-bottom: 0.5rem; }
        .content-desc { font-size: 0.85rem; color: var(--gray); margin-bottom: 1rem; }
        .content-reward { font-weight: 800; color: var(--pink); }

        .campaigns-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .campaigns-header {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), transparent);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .campaigns-header h3 { font-size: 1.25rem; font-weight: 700; }

        .campaigns-list { padding: 0 2rem 2rem; }

        .campaign-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          margin-bottom: 1rem;
          transition: all 0.3s;
        }

        .campaign-item:last-child { margin-bottom: 0; }
        .campaign-item:hover { background: rgba(255, 255, 255, 0.05); }

        .campaign-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .campaign-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(236, 72, 153, 0.2);
        }

        .campaign-info h4 { font-weight: 700; margin-bottom: 0.25rem; }
        .campaign-info p { font-size: 0.85rem; color: var(--gray); }

        .campaign-center { display: flex; gap: 2rem; }

        .campaign-stat { text-align: center; }
        .campaign-stat .value { font-weight: 700; color: var(--pink); }
        .campaign-stat .label { font-size: 0.7rem; color: var(--gray); }

        .campaign-right { display: flex; align-items: center; gap: 1rem; }

        .campaign-status {
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .campaign-status.active { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .campaign-status.ending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .campaign-status.upcoming { background: rgba(59, 130, 246, 0.15); color: var(--blue); }

        .campaign-join-btn {
          padding: 10px 20px;
          border-radius: 10px;
          background: var(--gradient-marketing);
          color: var(--white);
          font-weight: 600;
          font-size: 0.85rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .campaign-join-btn:hover { transform: scale(1.05); }

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
          margin-bottom: 1.5rem;
        }

        .leaderboard-header h3 { font-size: 1.25rem; font-weight: 700; }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leaderboard-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--light-gray);
        }

        .leaderboard-table th:first-child { border-radius: 12px 0 0 12px; }
        .leaderboard-table th:last-child { border-radius: 0 12px 12px 0; }

        .leaderboard-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .leaderboard-table tr:hover td { background: rgba(255, 255, 255, 0.02); }

        .rank-cell {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .rank-cell.gold { background: var(--gradient-gold); color: var(--dark); }
        .rank-cell.silver { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank-cell.bronze { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank-cell.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .ambassador-cell { display: flex; align-items: center; gap: 12px; }

        .ambassador-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .ambassador-avatar.legend { background: var(--gradient-gold); color: var(--dark); }
        .ambassador-avatar.elite { background: var(--gradient-marketing); }
        .ambassador-avatar.rising { background: var(--purple); }

        .ambassador-name { font-weight: 600; }
        .ambassador-handle { font-size: 0.75rem; color: var(--gray); }

        .points-cell { font-weight: 700; color: var(--pink); }
        .rewards-cell { font-weight: 700; color: var(--gold); }

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

        .faq-chevron { color: var(--pink); transition: transform 0.3s; }
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
          background: var(--gradient-marketing);
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

        .social-links a:hover { background: var(--pink); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--pink); }

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
          .programs-grid { grid-template-columns: 1fr; }
          .ambassador-tiers, .content-types-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .social-stats-banner { grid-template-columns: repeat(3, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .social-stats-banner { grid-template-columns: repeat(2, 1fr); }
          .ambassador-tiers, .content-types-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="marketing-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#programs">프로그램</a>
            <a href="#ambassador">앰배서더</a>
            <a href="#campaigns">캠페인</a>
            <a href="#leaderboard">리더보드</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button className="connect-btn" data-testid="button-connect-wallet">
            🔗 지갑 연결
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="megaphone-icon">📢</span> MARKETING PROGRAM - 함께 알리는 TBURN
          </div>
          <h1>
            TBURN 마케팅 참여로<br />
            <span className="gradient-text">3억 TBURN</span> 보상을 받으세요
          </h1>
          <p className="hero-subtitle">
            앰배서더, 인플루언서, 컨텐츠 크리에이터, 이벤트 참여로
            TBURN 생태계를 알리고 보상받으세요.
          </p>

          <div className="social-stats-banner" data-testid="social-stats">
            {socialStats.map((stat, idx) => (
              <div key={idx} className="social-stat">
                <div className="icon">{stat.icon}</div>
                <div className="value">{stat.value}</div>
                <div className="label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-marketing">
              <div className="stat-value">3억</div>
              <div className="stat-label">총 마케팅 예산</div>
            </div>
            <div className="stat-card" data-testid="stat-ambassadors">
              <div className="stat-value">2,500+</div>
              <div className="stat-label">활성 앰배서더</div>
            </div>
            <div className="stat-card" data-testid="stat-campaigns">
              <div className="stat-value">50+</div>
              <div className="stat-label">진행중 캠페인</div>
            </div>
            <div className="stat-card" data-testid="stat-monthly-reward">
              <div className="stat-value">월 50만</div>
              <div className="stat-label">최대 보상</div>
            </div>
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-join-ambassador">
              👑 앰배서더 신청하기
            </button>
            <button className="btn-secondary">
              📖 마케팅 가이드
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">마케팅 예산 배분</h2>
          <p className="section-subtitle">3억 TBURN이 5가지 마케팅 프로그램으로 배분됩니다</p>
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

      {/* Programs Section */}
      <section className="section" id="programs" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PROGRAMS</span>
          <h2 className="section-title">마케팅 프로그램</h2>
          <p className="section-subtitle">다양한 방식으로 TBURN을 알리세요</p>
        </div>

        <div className="programs-grid">
          {programs.map(program => (
            <div key={program.id} className={`program-card ${program.id} ${program.featured ? 'featured' : ''}`} data-testid={`program-${program.id}`}>
              <div className="program-header">
                {program.badge && (
                  <span className={`program-badge ${program.badge.toLowerCase()}`}>{program.badge}</span>
                )}
                <div className="program-icon">{program.icon}</div>
                <h3 className="program-title">{program.title}</h3>
                <p className="program-subtitle">{program.subtitle}</p>
              </div>
              <div className="program-content">
                <div className="program-rewards">
                  {program.rewards.map((reward, idx) => (
                    <div key={idx} className="reward-box">
                      <div className="value">{reward.value}</div>
                      <div className="label">{reward.label}</div>
                    </div>
                  ))}
                </div>
                <ul className="program-features">
                  {program.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button className="program-btn">참여하기</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ambassador Tiers Section */}
      <section className="section" id="ambassador">
        <div className="section-header">
          <span className="section-badge">AMBASSADOR</span>
          <h2 className="section-title">앰배서더 티어</h2>
          <p className="section-subtitle">활동량에 따른 등급별 혜택</p>
        </div>

        <div className="ambassador-tiers">
          {ambassadorTiers.map(tier => (
            <div key={tier.id} className={`ambassador-card ${tier.id}`} data-testid={`ambassador-${tier.id}`}>
              <div className="ambassador-icon">{tier.icon}</div>
              <h3 className="ambassador-tier">{tier.tier}</h3>
              <p className="ambassador-requirement">{tier.requirement}</p>
              <div className="ambassador-reward">
                <div className="value">{tier.reward}</div>
                <div className="label">TBURN</div>
              </div>
              <ul className="ambassador-perks">
                {tier.perks.map((perk, idx) => (
                  <li key={idx}>{perk}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Content Types Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">CONTENT</span>
          <h2 className="section-title">컨텐츠 보상</h2>
          <p className="section-subtitle">다양한 컨텐츠 유형별 보상</p>
        </div>

        <div className="content-types-grid">
          {contentTypes.map((content, idx) => (
            <div key={idx} className="content-card">
              <div className="content-icon">{content.icon}</div>
              <h4 className="content-title">{content.title}</h4>
              <p className="content-desc">{content.desc}</p>
              <div className="content-reward">{content.reward}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="section" id="campaigns">
        <div className="section-header">
          <span className="section-badge">CAMPAIGNS</span>
          <h2 className="section-title">진행중 캠페인</h2>
          <p className="section-subtitle">참여하고 보상받으세요</p>
        </div>

        <div className="campaigns-container">
          <div className="campaigns-header">
            <h3>🎯 활성 캠페인</h3>
          </div>
          <div className="campaigns-list">
            {campaigns.map((campaign, idx) => (
              <div key={idx} className="campaign-item">
                <div className="campaign-left">
                  <div className="campaign-icon">{campaign.icon}</div>
                  <div className="campaign-info">
                    <h4>{campaign.title}</h4>
                    <p>{campaign.desc}</p>
                  </div>
                </div>
                <div className="campaign-center">
                  <div className="campaign-stat">
                    <div className="value">{campaign.reward}</div>
                    <div className="label">TBURN</div>
                  </div>
                  <div className="campaign-stat">
                    <div className="value">{campaign.participants}</div>
                    <div className="label">참여자</div>
                  </div>
                </div>
                <div className="campaign-right">
                  <span className={`campaign-status ${campaign.status}`}>{campaign.statusLabel}</span>
                  <button className="campaign-join-btn">참여하기</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="section" id="leaderboard" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">LEADERBOARD</span>
          <h2 className="section-title">앰배서더 리더보드</h2>
          <p className="section-subtitle">이번 달 TOP 앰배서더</p>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h3>🏆 TOP 5 앰배서더</h3>
          </div>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>앰배서더</th>
                <th>포인트</th>
                <th>누적 보상</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`rank-cell ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal'}`}>
                      {user.rank}
                    </span>
                  </td>
                  <td>
                    <div className="ambassador-cell">
                      <div className={`ambassador-avatar ${user.tier}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="ambassador-name">{user.name}</div>
                        <div className="ambassador-handle">{user.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="points-cell">{user.points}</td>
                  <td className="rewards-cell">{user.rewards} TBURN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">마케팅 프로그램에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>앰배서더가 되려면 어떻게 해야 하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>앰배서더 신청 페이지에서 지원서를 제출하시면 됩니다. 소셜 미디어 활동 이력과 크립토 관심도를 기반으로 심사 후 선발됩니다. 처음에는 Starter 등급으로 시작하여 활동량에 따라 등급이 올라갑니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>컨텐츠 보상은 어떻게 지급되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>컨텐츠 제출 후 품질 심사를 거쳐 승인되면 TBURN 토큰으로 지급됩니다. 기본 보상 외에 조회수와 참여도에 따른 보너스가 추가될 수 있습니다. 보상은 매주 월요일에 일괄 지급됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>캠페인 참여 자격은 무엇인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>대부분의 캠페인은 누구나 참여할 수 있습니다. 다만 일부 캠페인은 앰배서더 등급이나 팔로워 수 등의 조건이 있을 수 있습니다. 각 캠페인 상세 페이지에서 참여 자격을 확인해주세요.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>인플루언서 협업은 어떻게 진행되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>10K+ 팔로워를 보유한 인플루언서는 별도의 협업 프로그램에 참여할 수 있습니다. 맞춤형 캠페인 설계와 더 높은 보상을 제공합니다. partnerships@tburn.io로 문의해주세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>지금 시작하세요!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN 마케팅 프로그램에 참여하여<br />
            3억 TBURN 보상을 받아가세요!
          </p>
          <button className="connect-btn" style={{ background: 'var(--white)', color: 'var(--pink)', fontSize: '1.25rem', padding: '20px 50px' }}>
            👑 앰배서더 신청하기
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
