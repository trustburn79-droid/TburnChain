import{r as D,j as e}from"./index-CWUIpzf8.js";import{d as V,L as t}from"./index-CIRYVphb.js";import{ac as E,n as j}from"./tburn-loader-DzbfkJu3.js";import"./i18nInstance-DCxlOlkw.js";function B(){var m;const[r,p]=D.useState("faq-1"),{isConnected:d,address:l,connect:g,disconnect:u,formatAddress:v}=E(),{data:i,isLoading:o}=V({queryKey:["/api/token-programs/dao/stats"]}),n=i==null?void 0:i.data,s=a=>{p(r===a?null:a)},h=async()=>{d?u():await g("metamask")},x=[{id:"TIP-001",title:"스테이킹 보상률 조정",desc:"연간 스테이킹 보상률을 12%에서 15%로 상향 조정",category:"protocol",status:"active",forVotes:72,againstVotes:18,abstainVotes:10,quorum:65,author:"CoreTeam",endDate:"2026.01.15"},{id:"TIP-002",title:"생태계 펀드 집행 제안",desc:"DeFi 프로토콜 파트너십을 위한 5,000만 TBURN 집행",category:"treasury",status:"active",forVotes:58,againstVotes:32,abstainVotes:10,quorum:48,author:"Treasury",endDate:"2026.01.18"},{id:"TIP-003",title:"크로스체인 브릿지 확장",desc:"Polygon, Arbitrum 네트워크 브릿지 추가 지원",category:"ecosystem",status:"pending",forVotes:0,againstVotes:0,abstainVotes:0,quorum:0,author:"DevTeam",endDate:"2026.01.20"}],N=[{number:1,title:"제안 제출",desc:"누구나 제안 제출 가능",duration:"최소 10,000 vTBURN"},{number:2,title:"토론 기간",desc:"커뮤니티 피드백 수집",duration:"3일"},{number:3,title:"투표 기간",desc:"토큰 보유자 투표",duration:"5일"},{number:4,title:"타임락",desc:"실행 대기 기간",duration:"2일"},{number:5,title:"실행",desc:"자동 온체인 실행",duration:"즉시"}],b=[{id:"tech",icon:"⚙️",name:"기술 위원회",desc:"프로토콜 업그레이드 검토",members:7,proposals:23},{id:"finance",icon:"💰",name:"재무 위원회",desc:"자금 집행 승인",members:5,proposals:45},{id:"ecosystem",icon:"🌱",name:"생태계 위원회",desc:"파트너십 & 그랜트",members:9,proposals:67},{id:"security",icon:"🛡️",name:"보안 위원회",desc:"보안 감사 및 대응",members:5,proposals:12}],f=[{id:"voting",icon:"🗳️",title:"투표 참여 보상",amount:"투표당 10~50 TBURN",benefits:["모든 제안 투표 시 보상","참여율에 따른 보너스","연속 투표 스트릭 보너스","거버넌스 NFT 획득 기회"]},{id:"proposal",icon:"📝",title:"제안 보상",amount:"제안당 최대 5,000 TBURN",benefits:["승인된 제안에 대한 보상","구현 완료 시 추가 보너스","커뮤니티 기여도 인정","제안자 명예의 전당 등재"]},{id:"committee",icon:"👥",title:"위원회 보상",amount:"월 최대 10,000 TBURN",benefits:["위원회 활동 정기 보상","심사 건수당 추가 보상","임기 완료 보너스","거버넌스 리더십 인증"]}],w=[{name:"CoreValidator",role:"검증인",power:"2.4M",initials:"CV"},{name:"DeFiMaster",role:"DeFi 전문가",power:"1.8M",initials:"DM"},{name:"CommunityLead",role:"커뮤니티",power:"1.2M",initials:"CL"}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:82:4","data-component-name":"div",className:"dao-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:83:6","data-component-name":"style",children:`
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
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:83,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1077:6","data-component-name":"header",className:"dao-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1078:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1079:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1080:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(j,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1081:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1081,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1080,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1083:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1083:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1083,columnNumber:138},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1083,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1079,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1085:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1086:12","data-component-name":"a",href:"#proposals",children:"제안"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1086,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1087:12","data-component-name":"a",href:"#process",children:"프로세스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1087,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1088:12","data-component-name":"a",href:"#committees",children:"위원회"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1088,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1089:12","data-component-name":"a",href:"#rewards",children:"보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1089,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1090:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1090,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1085,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1092:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:h,children:d&&l?`🔗 ${v(l)}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1092,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1078,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1077,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1103:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1104:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1104,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1105:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1106:10","data-component-name":"div",className:"badge",children:"🏛️ DAO GOVERNANCE - 탈중앙화 거버넌스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1106,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1109:10","data-component-name":"h1",children:["프로토콜의 미래를 결정하는",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1110:26","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1110,columnNumber:27},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1111:12","data-component-name":"span",className:"gradient-text",children:"8억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1111,columnNumber:13},this)," 거버넌스 보상"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1109,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1113:10","data-component-name":"p",className:"hero-subtitle",children:"투표에 참여하고, 제안을 제출하고, 위원회 활동을 통해 TBURN Chain의 방향을 결정하며 보상을 받으세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1113,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1118:10","data-component-name":"div",className:"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1119:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-proposals",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1120:14","data-component-name":"div",className:"stat-value",children:o?"...":(n==null?void 0:n.totalProposals)||0},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1120,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1121:14","data-component-name":"div",className:"stat-label",children:"총 제안 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1121,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1119,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1123:12","data-component-name":"div",className:"stat-card","data-testid":"stat-active-proposals",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1124:14","data-component-name":"div",className:"stat-value",children:o?"...":(n==null?void 0:n.activeProposals)||0},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1124,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1125:14","data-component-name":"div",className:"stat-label",children:"진행중인 제안"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1125,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1123,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1127:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-votes",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1128:14","data-component-name":"div",className:"stat-value",children:o?"...":((m=n==null?void 0:n.totalVotes)==null?void 0:m.toLocaleString())||0},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1128,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1129:14","data-component-name":"div",className:"stat-label",children:"총 투표 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1129,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1127,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1131:12","data-component-name":"div",className:"stat-card","data-testid":"stat-voting-power",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1132:14","data-component-name":"div",className:"stat-value",children:o?"...":Number((n==null?void 0:n.totalVotingPower)||0).toLocaleString()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1132,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1133:14","data-component-name":"div",className:"stat-label",children:"총 투표력 (TBURN)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1133,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1131,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1118,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1137:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1138:12","data-component-name":"button",className:"btn-primary","data-testid":"button-vote",children:"🗳️ 투표 참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1138,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1141:12","data-component-name":"button",className:"btn-secondary",children:"📝 제안 제출하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1141,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1137,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1105,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1103,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1149:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1150:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1151:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1151,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1152:10","data-component-name":"h2",className:"section-title",children:"거버넌스 보상 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1152,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1153:10","data-component-name":"p",className:"section-subtitle",children:"8억 TBURN이 4가지 카테고리로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1153,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1150,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1156:8","data-component-name":"div",className:"distribution-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1157:10","data-component-name":"div",className:"dist-card voting","data-testid":"dist-voting",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1158:12","data-component-name":"div",className:"dist-icon",children:"🗳️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1158,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1159:12","data-component-name":"div",className:"dist-name",children:"투표 참여 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1159,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1160:12","data-component-name":"div",className:"dist-amount",children:"4억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1160,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1161:12","data-component-name":"div",className:"dist-percent",children:"50%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1161,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1157,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1163:10","data-component-name":"div",className:"dist-card proposal","data-testid":"dist-proposal",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1164:12","data-component-name":"div",className:"dist-icon",children:"📝"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1164,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1165:12","data-component-name":"div",className:"dist-name",children:"제안 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1165,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1166:12","data-component-name":"div",className:"dist-amount",children:"1.6억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1166,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1167:12","data-component-name":"div",className:"dist-percent",children:"20%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1167,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1163,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1169:10","data-component-name":"div",className:"dist-card committee","data-testid":"dist-committee",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1170:12","data-component-name":"div",className:"dist-icon",children:"👥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1170,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1171:12","data-component-name":"div",className:"dist-name",children:"위원회 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1171,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1172:12","data-component-name":"div",className:"dist-amount",children:"1.6억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1172,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1173:12","data-component-name":"div",className:"dist-percent",children:"20%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1173,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1169,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1175:10","data-component-name":"div",className:"dist-card treasury","data-testid":"dist-treasury",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1176:12","data-component-name":"div",className:"dist-icon",children:"💰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1176,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1177:12","data-component-name":"div",className:"dist-name",children:"DAO 예비금"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1177,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1178:12","data-component-name":"div",className:"dist-amount",children:"0.8억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1178,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1179:12","data-component-name":"div",className:"dist-percent",children:"10%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1179,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1175,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1156,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1149,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1185:6","data-component-name":"section",className:"section",id:"process",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1186:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1187:10","data-component-name":"span",className:"section-badge",children:"PROCESS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1187,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1188:10","data-component-name":"h2",className:"section-title",children:"거버넌스 프로세스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1188,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1189:10","data-component-name":"p",className:"section-subtitle",children:"제안부터 실행까지의 5단계 과정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1189,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1186,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1192:8","data-component-name":"div",className:"process-grid",children:N.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1194:12","data-component-name":"div",className:"process-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1195:14","data-component-name":"div",className:"process-number",children:a.number},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1195,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1196:14","data-component-name":"h4",className:"process-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1196,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1197:14","data-component-name":"p",className:"process-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1197,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1198:14","data-component-name":"p",className:"process-duration",children:a.duration},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1198,columnNumber:15},this)]},a.number,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1194,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1192,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1185,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1205:6","data-component-name":"section",className:"section",id:"proposals",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1206:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1207:10","data-component-name":"span",className:"section-badge",children:"PROPOSALS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1207,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1208:10","data-component-name":"h2",className:"section-title",children:"활성 제안"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1208,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1209:10","data-component-name":"p",className:"section-subtitle",children:"현재 진행 중인 투표에 참여하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1209,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1206,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1212:8","data-component-name":"div",className:"proposals-container",children:x.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1214:12","data-component-name":"div",className:"proposal-card","data-testid":`proposal-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1215:14","data-component-name":"div",className:"proposal-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1216:16","data-component-name":"div",className:"proposal-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1217:18","data-component-name":"div",className:"proposal-id",children:a.id},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1217,columnNumber:19},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1218:18","data-component-name":"h3",className:"proposal-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1218,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1219:18","data-component-name":"div",className:"proposal-meta",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1220:20","data-component-name":"span",children:["📅 마감: ",a.endDate]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1220,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1221:20","data-component-name":"span",children:["👤 제안자: ",a.author]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1221,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1219,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1216,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1224:16","data-component-name":"span",className:`proposal-status ${a.status}`,children:a.status==="active"?"투표중":"대기중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1224,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1215,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1228:14","data-component-name":"div",className:"proposal-body",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1229:16","data-component-name":"p",className:"proposal-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1229,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1230:16","data-component-name":"span",className:`proposal-category ${a.category}`,children:a.category==="protocol"?"프로토콜":a.category==="treasury"?"재무":"생태계"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1230,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1228,columnNumber:15},this),a.status==="active"&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1236:16","data-component-name":"div",className:"proposal-voting",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1237:18","data-component-name":"div",className:"vote-progress",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1238:20","data-component-name":"div",className:"vote-bar",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1239:22","data-component-name":"div",className:"for",style:{width:`${a.forVotes}%`}},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1239,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1240:22","data-component-name":"div",className:"against",style:{width:`${a.againstVotes}%`}},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1240,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1241:22","data-component-name":"div",className:"abstain",style:{width:`${a.abstainVotes}%`}},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1241,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1238,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1243:20","data-component-name":"div",className:"vote-labels",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1244:22","data-component-name":"span",className:"for",children:["찬성 ",a.forVotes,"%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1244,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1245:22","data-component-name":"span",className:"against",children:["반대 ",a.againstVotes,"%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1245,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1243,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1237,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1248:18","data-component-name":"div",className:"vote-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1249:20","data-component-name":"div",className:"quorum-label",children:"정족수 달성률"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1249,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1250:20","data-component-name":"div",className:"quorum-value",children:[a.quorum,"%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1250,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1248,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1252:18","data-component-name":"div",className:"vote-buttons",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1253:20","data-component-name":"button",className:"vote-btn for",children:"찬성"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1253,columnNumber:21},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1254:20","data-component-name":"button",className:"vote-btn against",children:"반대"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1254,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1252,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1236,columnNumber:17},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1214,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1212,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1205,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1264:6","data-component-name":"section",className:"section",id:"committees",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1265:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1266:10","data-component-name":"span",className:"section-badge",children:"COMMITTEES"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1266,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1267:10","data-component-name":"h2",className:"section-title",children:"거버넌스 위원회"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1267,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1268:10","data-component-name":"p",className:"section-subtitle",children:"전문 분야별 위원회에서 심도있는 논의"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1268,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1265,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1271:8","data-component-name":"div",className:"committee-grid",children:b.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1273:12","data-component-name":"div",className:`committee-card ${a.id}`,"data-testid":`committee-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1274:14","data-component-name":"div",className:"committee-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1274,columnNumber:15},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1275:14","data-component-name":"h3",className:"committee-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1275,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1276:14","data-component-name":"p",className:"committee-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1276,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1277:14","data-component-name":"div",className:"committee-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1278:16","data-component-name":"div",className:"committee-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1279:18","data-component-name":"div",className:"value",children:a.members},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1279,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1280:18","data-component-name":"div",className:"label",children:"위원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1280,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1278,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1282:16","data-component-name":"div",className:"committee-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1283:18","data-component-name":"div",className:"value",children:a.proposals},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1283,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1284:18","data-component-name":"div",className:"label",children:"심의"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1284,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1282,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1277,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1273,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1271,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1264,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1293:6","data-component-name":"section",className:"section",id:"rewards",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1294:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1295:10","data-component-name":"span",className:"section-badge",children:"REWARDS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1295,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1296:10","data-component-name":"h2",className:"section-title",children:"거버넌스 참여 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1296,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1297:10","data-component-name":"p",className:"section-subtitle",children:"다양한 방법으로 거버넌스에 참여하고 보상받으세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1297,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1294,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1300:8","data-component-name":"div",className:"rewards-grid",children:f.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1302:12","data-component-name":"div",className:`reward-card ${a.id}`,"data-testid":`reward-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1303:14","data-component-name":"div",className:"reward-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1304:16","data-component-name":"div",className:"reward-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1304,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1305:16","data-component-name":"h3",className:"reward-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1305,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1303,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1307:14","data-component-name":"div",className:"reward-amount",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1307,columnNumber:15},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1308:14","data-component-name":"ul",className:"reward-details",children:a.benefits.map((c,k)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1310:18","data-component-name":"li",children:c},k,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1310,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1308,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1302,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1300,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1293,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1319:6","data-component-name":"section",className:"section",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1320:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1321:10","data-component-name":"span",className:"section-badge",children:"DELEGATION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1321,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1322:10","data-component-name":"h2",className:"section-title",children:"투표권 위임"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1322,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1323:10","data-component-name":"p",className:"section-subtitle",children:"신뢰하는 대리인에게 투표권을 위임하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1323,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1320,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1326:8","data-component-name":"div",className:"delegation-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1327:10","data-component-name":"div",className:"delegation-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1328:12","data-component-name":"h3",children:"🏆 Top Delegates"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1328,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1327,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1331:10","data-component-name":"div",className:"delegate-list",children:w.map((a,c)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1333:14","data-component-name":"div",className:"delegate-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1334:16","data-component-name":"div",className:"delegate-avatar",children:a.initials},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1334,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1335:16","data-component-name":"div",className:"delegate-info",children:[e.jsxDEV("h5",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1336:18","data-component-name":"h5",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1336,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1337:18","data-component-name":"p",children:a.role},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1337,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1335,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1339:16","data-component-name":"div",className:"delegate-power",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1340:18","data-component-name":"div",className:"value",children:[a.power," vTBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1340,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1341:18","data-component-name":"div",className:"label",children:"Voting Power"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1341,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1339,columnNumber:17},this)]},c,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1333,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1331,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1326,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1319,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1350:6","data-component-name":"section",className:"section",id:"faq",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1351:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1352:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1352,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1353:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1353,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1354:10","data-component-name":"p",className:"section-subtitle",children:"거버넌스에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1354,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1351,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1357:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1358:10","data-component-name":"div",className:`faq-item ${r==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1359:12","data-component-name":"div",className:"faq-question",onClick:()=>s("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1360:14","data-component-name":"h4",children:"투표권(vTBURN)은 어떻게 얻나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1360,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1361:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1361,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1359,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1363:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1364:14","data-component-name":"p",children:"TBURN 토큰을 스테이킹하면 투표권(vTBURN)을 받습니다. 스테이킹 기간이 길수록 더 많은 투표권을 받습니다. 4년 락업 시 최대 4배의 투표권을 받을 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1364,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1363,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1358,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1368:10","data-component-name":"div",className:`faq-item ${r==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1369:12","data-component-name":"div",className:"faq-question",onClick:()=>s("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1370:14","data-component-name":"h4",children:"제안을 제출하려면 어떻게 하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1370,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1371:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1371,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1369,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1373:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1374:14","data-component-name":"p",children:"최소 10,000 vTBURN을 보유해야 제안을 제출할 수 있습니다. 제안서를 작성하고 포럼에서 3일간 토론 후 온체인 투표에 부쳐집니다. 승인된 제안은 자동으로 실행됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1374,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1373,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1368,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1378:10","data-component-name":"div",className:`faq-item ${r==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1379:12","data-component-name":"div",className:"faq-question",onClick:()=>s("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1380:14","data-component-name":"h4",children:"위원회에 참여하려면 어떻게 하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1380,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1381:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1381,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1379,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1383:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1384:14","data-component-name":"p",children:"위원회 선거는 분기별로 진행됩니다. 후보 등록 후 커뮤니티 투표를 통해 선출됩니다. 최소 50,000 vTBURN을 보유하고 관련 분야 전문성을 입증해야 합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1384,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1383,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1378,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1388:10","data-component-name":"div",className:`faq-item ${r==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1389:12","data-component-name":"div",className:"faq-question",onClick:()=>s("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1390:14","data-component-name":"h4",children:"투표 보상은 어떻게 지급되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1390,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1391:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1391,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1389,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1393:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1394:14","data-component-name":"p",children:"투표에 참여할 때마다 투표권 수량에 비례하여 보상이 지급됩니다. 보상은 투표 종료 후 24시간 이내에 청구 가능하며, 연속 투표 참여 시 추가 보너스가 제공됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1394,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1393,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1388,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1357,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1350,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1401:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1402:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1403:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"거버넌스에 참여하세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1403,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1404:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN Chain의 미래를 함께 결정하고",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1405:36","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1405,columnNumber:37},this),"8억 TBURN 보상을 받아가세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1404,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1408:10","data-component-name":"button",className:"connect-btn",style:{background:"var(--white)",color:"var(--indigo)",fontSize:"1.25rem",padding:"20px 50px"},children:"🏛️ 지금 참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1408,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1402,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1401,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1415:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1416:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1417:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1418:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1418:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1418,columnNumber:114},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1418,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1419:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1419:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1419,columnNumber:124},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1419,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1420:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1421:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1421,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1422:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1422,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1423:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1423,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1424:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1424,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1420,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1417,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1427:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1428:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1428,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1429:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1430:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1430:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1430,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1430,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1431:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1431:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1431,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1431,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1432:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1432:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1432,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1432,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1433:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1433:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1433,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1433,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1429,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1427,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1436:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1437:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1437,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1438:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1439:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1439:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1439,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1439,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1440:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1440:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1440,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1440,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1441:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1441:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1441,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1441,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1442:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1442:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1442,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1442,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1438,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1436,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1445:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1446:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1446,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1447:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1448:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1448:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1448,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1448,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1449:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1449:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1449,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1449,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1450:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1450:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1450,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1450,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1451:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1451:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1451,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1451,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1447,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1445,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1416,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1455:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1456:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1456,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1457:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1458:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1458,columnNumber:13},this),e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/dao-governance.tsx:1459:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1459,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1457,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1455,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:1415,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-governance.tsx",lineNumber:82,columnNumber:5},this)}export{B as default};
