import{r as w,j as e}from"./index-MawzfEWf.js";import{d as E,L as t}from"./index-DNbWdfiD.js";import{ac as D,n as j}from"./tburn-loader-BM0jq71g.js";import"./i18nInstance-DCxlOlkw.js";function T(){var d,p;const[n,u]=w.useState("faq-1"),{isConnected:c,address:l,connect:g,disconnect:h,formatAddress:x}=D(),{data:s,isLoading:i}=E({queryKey:["/api/token-programs/community/stats"]}),r=s==null?void 0:s.data,o=a=>{u(n===a?null:a)},b=async()=>{c?h():await g("metamask")},N=[{id:"ambassador",icon:"🌟",title:"앰배서더 프로그램",subtitle:"TBURN Chain의 공식 대표",reward:"최대 5,000 TBURN/월",featured:!0,benefits:["공식 앰배서더 뱃지 및 NFT","월간 보상 + 성과 보너스","전용 Discord 채널 접근","오프라인 이벤트 초대"],requirements:"SNS 팔로워 1,000명 이상, 암호화폐 관련 활동 경험"},{id:"creator",icon:"🎨",title:"콘텐츠 크리에이터",subtitle:"교육 & 홍보 콘텐츠 제작",reward:"콘텐츠당 100~1,000 TBURN",featured:!0,benefits:["동영상/블로그/인포그래픽 보상","콘텐츠 제작 도구 지원","공식 채널 홍보 기회","창작자 전용 이벤트"],requirements:"포트폴리오 제출 필수"},{id:"moderator",icon:"🛡️",title:"커뮤니티 모더레이터",subtitle:"커뮤니티 관리 및 지원",reward:"최대 2,000 TBURN/월",featured:!1,benefits:["Discord/Telegram 모더레이터 권한","월간 고정 보상","커뮤니티 성장 보너스","내부 정보 사전 공유"],requirements:"주 20시간 이상 활동 가능"},{id:"educator",icon:"📚",title:"교육 전문가",subtitle:"블록체인 교육 & 튜토리얼",reward:"강의당 500~2,000 TBURN",featured:!1,benefits:["온라인 강의 제작 보상","교육 자료 제작 지원","TBURN Academy 강사 인증","교육 플랫폼 파트너십"],requirements:"블록체인/개발 관련 전문 지식"},{id:"translator",icon:"🌍",title:"번역가 프로그램",subtitle:"다국어 지원 및 현지화",reward:"문서당 200~800 TBURN",featured:!1,benefits:["공식 문서 번역 보상","커뮤니티 현지화 지원","번역가 인증 배지","언어별 커뮤니티 리드 기회"],requirements:"영어 + 1개 이상 언어 능통"},{id:"bounty",icon:"🏆",title:"버그 바운티 헌터",subtitle:"보안 취약점 발견 & 보고",reward:"건당 최대 50,000 TBURN",featured:!1,benefits:["취약점 심각도별 보상","명예의 전당 등재","보안 전문가 네트워크 참여","화이트햇 인증서"],requirements:"보안 관련 기술 지식 필수"}],f=[{id:"newcomer",icon:"🌱",name:"뉴커머",points:"0~499 포인트",multiplier:"1x 보상",tierClass:"newcomer"},{id:"contributor",icon:"🌿",name:"컨트리뷰터",points:"500~1,999 포인트",multiplier:"1.2x 보상",tierClass:"contributor"},{id:"advocate",icon:"💠",name:"애드보킷",points:"2,000~4,999 포인트",multiplier:"1.5x 보상",tierClass:"advocate"},{id:"champion",icon:"👑",name:"챔피언",points:"5,000~9,999 포인트",multiplier:"2x 보상",tierClass:"champion"},{id:"legend",icon:"⭐",name:"레전드",points:"10,000+ 포인트",multiplier:"3x 보상",tierClass:"legend"}],y=[{icon:"📝",type:"content",name:"블로그 포스팅",category:"콘텐츠",points:"+50~200",reward:"50~200 TBURN",frequency:"weekly"},{icon:"🎬",type:"content",name:"유튜브 영상 제작",category:"콘텐츠",points:"+100~500",reward:"100~500 TBURN",frequency:"monthly"},{icon:"🐦",type:"social",name:"트윗/리트윗",category:"소셜",points:"+10~50",reward:"10~50 TBURN",frequency:"daily"},{icon:"💬",type:"support",name:"커뮤니티 질문 답변",category:"서포트",points:"+20~100",reward:"20~100 TBURN",frequency:"daily"},{icon:"📖",type:"education",name:"튜토리얼 제작",category:"교육",points:"+200~500",reward:"200~500 TBURN",frequency:"once"}],v=[{rank:1,name:"CryptoKing",tier:"Legend",score:"45,200",badge:"gold"},{rank:2,name:"BlockMaster",tier:"Legend",score:"42,800",badge:"silver"},{rank:3,name:"ChainWizard",tier:"Champion",score:"38,500",badge:"bronze"},{rank:4,name:"DeFiHero",tier:"Champion",score:"35,100",badge:"normal"},{rank:5,name:"TokenSage",tier:"Champion",score:"32,400",badge:"normal"}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:75:4","data-component-name":"div",className:"community-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/community-program.tsx:76:6","data-component-name":"style",children:`
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
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:76,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/community-program.tsx:986:6","data-component-name":"header",className:"community-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:987:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:988:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:989:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(j,{"data-replit-metadata":"client/src/pages/community-program.tsx:990:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:990,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:989,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:992:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:992:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:992,columnNumber:140},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:992,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:988,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/community-program.tsx:994:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:995:12","data-component-name":"a",href:"#programs",children:"프로그램"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:995,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:996:12","data-component-name":"a",href:"#tiers",children:"등급 시스템"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:996,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:997:12","data-component-name":"a",href:"#activities",children:"활동 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:997,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:998:12","data-component-name":"a",href:"#leaderboard",children:"리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:998,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:999:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:999,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:994,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/community-program.tsx:1001:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:b,children:c&&l?`🔗 ${x(l)}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1001,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:987,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:986,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/community-program.tsx:1012:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1013:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1013,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1014:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1015:10","data-component-name":"div",className:"badge",children:"👋 COMMUNITY PROGRAM - 함께 성장하는 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1015,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/community-program.tsx:1018:10","data-component-name":"h1",children:["커뮤니티와 함께 만드는",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/community-program.tsx:1019:24","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1019,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1020:12","data-component-name":"span",className:"gradient-text",children:"3억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1020,columnNumber:13},this)," 보상 프로그램"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1018,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1022:10","data-component-name":"p",className:"hero-subtitle",children:"앰배서더, 콘텐츠 크리에이터, 모더레이터, 번역가로 활동하고 TBURN 생태계 성장에 기여하며 푸짐한 보상을 받아가세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1022,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1027:10","data-component-name":"div",className:"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1028:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-contributors",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1029:14","data-component-name":"div",className:"stat-value",children:i?"...":((d=r==null?void 0:r.totalContributors)==null?void 0:d.toLocaleString())||"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1029,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1030:14","data-component-name":"div",className:"stat-label",children:"총 참여자 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1030,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1028,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1032:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-contributions",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1033:14","data-component-name":"div",className:"stat-value",children:i?"...":((p=r==null?void 0:r.totalContributions)==null?void 0:p.toLocaleString())||"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1033,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1034:14","data-component-name":"div",className:"stat-label",children:"총 기여 횟수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1034,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1032,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1036:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-rewards",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1037:14","data-component-name":"div",className:"stat-value",children:i?"...":Number((r==null?void 0:r.totalRewardsDistributed)||0).toLocaleString()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1037,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1038:14","data-component-name":"div",className:"stat-label",children:"배포된 보상 (TBURN)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1038,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1036,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1040:12","data-component-name":"div",className:"stat-card","data-testid":"stat-active-tasks",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1041:14","data-component-name":"div",className:"stat-value",children:i?"...":(r==null?void 0:r.activeTasks)||"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1041,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1042:14","data-component-name":"div",className:"stat-label",children:"활성 태스크"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1042,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1040,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1027,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1046:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/community-program.tsx:1047:12","data-component-name":"button",className:"btn-primary","data-testid":"button-apply",children:"🚀 지금 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1047,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/community-program.tsx:1050:12","data-component-name":"button",className:"btn-secondary",children:"📖 가이드 보기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1050,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1046,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1014,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1012,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/community-program.tsx:1058:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1059:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1060:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1060,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/community-program.tsx:1061:10","data-component-name":"h2",className:"section-title",children:"프로그램별 보상 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1061,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1062:10","data-component-name":"p",className:"section-subtitle",children:"3억 TBURN이 6가지 프로그램으로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1062,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1059,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1065:8","data-component-name":"div",className:"distribution-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1066:10","data-component-name":"div",className:"dist-card ambassador","data-testid":"dist-ambassador",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1067:12","data-component-name":"div",className:"dist-icon",children:"🌟"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1067,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1068:12","data-component-name":"div",className:"dist-name",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1068,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1069:12","data-component-name":"div",className:"dist-amount",children:"9,000만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1069,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1070:12","data-component-name":"div",className:"dist-percent",children:"30%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1070,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1066,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1072:10","data-component-name":"div",className:"dist-card creator","data-testid":"dist-creator",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1073:12","data-component-name":"div",className:"dist-icon",children:"🎨"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1073,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1074:12","data-component-name":"div",className:"dist-name",children:"크리에이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1074,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1075:12","data-component-name":"div",className:"dist-amount",children:"6,000만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1075,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1076:12","data-component-name":"div",className:"dist-percent",children:"20%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1076,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1072,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1078:10","data-component-name":"div",className:"dist-card moderator","data-testid":"dist-moderator",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1079:12","data-component-name":"div",className:"dist-icon",children:"🛡️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1079,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1080:12","data-component-name":"div",className:"dist-name",children:"모더레이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1080,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1081:12","data-component-name":"div",className:"dist-amount",children:"4,500만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1081,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1082:12","data-component-name":"div",className:"dist-percent",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1082,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1078,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1084:10","data-component-name":"div",className:"dist-card educator","data-testid":"dist-educator",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1085:12","data-component-name":"div",className:"dist-icon",children:"📚"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1085,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1086:12","data-component-name":"div",className:"dist-name",children:"교육 전문가"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1086,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1087:12","data-component-name":"div",className:"dist-amount",children:"4,500만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1087,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1088:12","data-component-name":"div",className:"dist-percent",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1088,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1084,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1090:10","data-component-name":"div",className:"dist-card translator","data-testid":"dist-translator",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1091:12","data-component-name":"div",className:"dist-icon",children:"🌍"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1091,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1092:12","data-component-name":"div",className:"dist-name",children:"번역가"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1092,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1093:12","data-component-name":"div",className:"dist-amount",children:"3,000만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1093,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1094:12","data-component-name":"div",className:"dist-percent",children:"10%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1094,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1090,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1096:10","data-component-name":"div",className:"dist-card bounty","data-testid":"dist-bounty",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1097:12","data-component-name":"div",className:"dist-icon",children:"🏆"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1097,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1098:12","data-component-name":"div",className:"dist-name",children:"버그 바운티"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1098,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1099:12","data-component-name":"div",className:"dist-amount",children:"3,000만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1099,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1100:12","data-component-name":"div",className:"dist-percent",children:"10%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1100,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1096,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1065,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1058,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/community-program.tsx:1106:6","data-component-name":"section",className:"section",id:"programs",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1107:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1108:10","data-component-name":"span",className:"section-badge",children:"PROGRAMS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1108,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/community-program.tsx:1109:10","data-component-name":"h2",className:"section-title",children:"커뮤니티 프로그램"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1109,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1110:10","data-component-name":"p",className:"section-subtitle",children:"나에게 맞는 프로그램을 찾아 참여하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1110,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1107,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1113:8","data-component-name":"div",className:"programs-grid",children:N.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1115:12","data-component-name":"div",className:`program-card ${a.featured?"featured":""}`,"data-testid":`program-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1116:14","data-component-name":"div",className:`program-header ${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1117:16","data-component-name":"div",className:"program-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1117,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/community-program.tsx:1118:16","data-component-name":"h3",className:"program-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1118,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1119:16","data-component-name":"p",className:"program-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1119,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1116,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1121:14","data-component-name":"div",className:"program-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1122:16","data-component-name":"div",className:"program-reward",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1123:18","data-component-name":"span",className:"program-reward-label",children:"보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1123,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1124:18","data-component-name":"span",className:"program-reward-value",children:a.reward},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1124,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1122,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/community-program.tsx:1126:16","data-component-name":"ul",className:"program-benefits",children:a.benefits.map((m,k)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1128:20","data-component-name":"li",children:m},k,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1128,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1126,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1131:16","data-component-name":"div",className:"program-requirements",children:[e.jsxDEV("h5",{"data-replit-metadata":"client/src/pages/community-program.tsx:1132:18","data-component-name":"h5",children:"참여 조건"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1132,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1133:18","data-component-name":"p",children:a.requirements},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1133,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1131,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/community-program.tsx:1135:16","data-component-name":"button",className:"program-btn primary",children:"신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1135,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1121,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1115,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1113,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1106,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/community-program.tsx:1143:6","data-component-name":"section",className:"section",id:"tiers",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1144:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1145:10","data-component-name":"span",className:"section-badge",children:"TIER SYSTEM"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1145,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/community-program.tsx:1146:10","data-component-name":"h2",className:"section-title",children:"커뮤니티 등급 시스템"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1146,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1147:10","data-component-name":"p",className:"section-subtitle",children:"활동량에 따라 등급이 상승하고 보상 배율이 증가합니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1147,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1144,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1150:8","data-component-name":"div",className:"tier-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1151:10","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/community-program.tsx:1152:12","data-component-name":"h3",children:"🏅 등급별 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1152,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1153:12","data-component-name":"p",children:"포인트를 모아 더 높은 등급으로 승급하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1153,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1151,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1156:10","data-component-name":"div",className:"tier-grid",children:f.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1158:14","data-component-name":"div",className:`tier-card ${a.tierClass}`,"data-testid":`tier-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1159:16","data-component-name":"div",className:"tier-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1159,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1160:16","data-component-name":"div",className:"tier-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1160,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1161:16","data-component-name":"div",className:"tier-points",children:a.points},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1161,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1162:16","data-component-name":"div",className:"tier-multiplier",children:a.multiplier},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1162,columnNumber:17},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1158,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1156,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1150,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1143,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/community-program.tsx:1170:6","data-component-name":"section",className:"section",id:"activities",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1171:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1172:10","data-component-name":"span",className:"section-badge",children:"ACTIVITIES"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1172,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/community-program.tsx:1173:10","data-component-name":"h2",className:"section-title",children:"활동별 포인트 & 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1173,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1174:10","data-component-name":"p",className:"section-subtitle",children:"다양한 활동으로 포인트와 TBURN을 획득하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1174,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1171,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1177:8","data-component-name":"div",className:"activity-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1178:10","data-component-name":"div",className:"activity-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/community-program.tsx:1179:12","data-component-name":"h3",children:"📊 포인트 획득 활동"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1179,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1178,columnNumber:11},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/community-program.tsx:1182:10","data-component-name":"table",className:"activity-table",children:[e.jsxDEV("thead",{"data-replit-metadata":"client/src/pages/community-program.tsx:1183:12","data-component-name":"thead",children:e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/community-program.tsx:1184:14","data-component-name":"tr",children:[e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/community-program.tsx:1185:16","data-component-name":"th",children:"활동"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1185,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/community-program.tsx:1186:16","data-component-name":"th",children:"카테고리"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1186,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/community-program.tsx:1187:16","data-component-name":"th",children:"포인트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1187,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/community-program.tsx:1188:16","data-component-name":"th",children:"TBURN 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1188,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/community-program.tsx:1189:16","data-component-name":"th",children:"빈도"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1189,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1184,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1183,columnNumber:13},this),e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/community-program.tsx:1192:12","data-component-name":"tbody",children:y.map((a,m)=>e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/community-program.tsx:1194:16","data-component-name":"tr",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/community-program.tsx:1195:18","data-component-name":"td",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1196:20","data-component-name":"div",className:"activity-type",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1197:22","data-component-name":"div",className:`activity-type-icon ${a.type}`,children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1197,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1198:22","data-component-name":"span",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1198,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1196,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1195,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/community-program.tsx:1201:18","data-component-name":"td",children:a.category},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1201,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/community-program.tsx:1202:18","data-component-name":"td",className:"activity-points",children:a.points},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1202,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/community-program.tsx:1203:18","data-component-name":"td",className:"activity-reward",children:a.reward},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1203,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/community-program.tsx:1204:18","data-component-name":"td",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1205:20","data-component-name":"span",className:`frequency-badge ${a.frequency}`,children:a.frequency==="daily"?"매일":a.frequency==="weekly"?"매주":a.frequency==="monthly"?"매월":"1회"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1205,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1204,columnNumber:19},this)]},m,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1194,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1192,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1182,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1177,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1170,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/community-program.tsx:1219:6","data-component-name":"section",className:"section",id:"leaderboard",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1220:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1221:10","data-component-name":"span",className:"section-badge",children:"LEADERBOARD"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1221,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/community-program.tsx:1222:10","data-component-name":"h2",className:"section-title",children:"커뮤니티 리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1222,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1223:10","data-component-name":"p",className:"section-subtitle",children:"가장 활발한 커뮤니티 멤버들"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1223,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1220,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1226:8","data-component-name":"div",className:"leaderboard-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1227:10","data-component-name":"div",className:"leaderboard-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/community-program.tsx:1228:12","data-component-name":"h3",children:"🏆 Top Contributors"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1228,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1227,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1231:10","data-component-name":"div",className:"leaderboard-list",children:v.map((a,m)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1233:14","data-component-name":"div",className:`leaderboard-item ${m<3?"top-3":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1234:16","data-component-name":"div",className:`leaderboard-rank ${a.badge}`,children:a.rank},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1234,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1235:16","data-component-name":"div",className:"leaderboard-info",children:[e.jsxDEV("h5",{"data-replit-metadata":"client/src/pages/community-program.tsx:1236:18","data-component-name":"h5",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1236,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1237:18","data-component-name":"p",children:a.tier},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1237,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1235,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1239:16","data-component-name":"div",className:"leaderboard-score",children:[a.score," pts"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1239,columnNumber:17},this)]},m,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1233,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1231,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1226,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1219,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/community-program.tsx:1247:6","data-component-name":"section",className:"section",id:"faq",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1248:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1249:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1249,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/community-program.tsx:1250:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1250,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1251:10","data-component-name":"p",className:"section-subtitle",children:"커뮤니티 프로그램에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1251,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1248,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1254:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1255:10","data-component-name":"div",className:`faq-item ${n==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1256:12","data-component-name":"div",className:"faq-question",onClick:()=>o("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/community-program.tsx:1257:14","data-component-name":"h4",children:"커뮤니티 프로그램에 어떻게 참여하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1257,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1258:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1258,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1256,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1260:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1261:14","data-component-name":"p",children:'각 프로그램 카드의 "신청하기" 버튼을 클릭하여 지원서를 제출하세요. 지원서 검토 후 승인되면 공식 커뮤니티 멤버로 활동을 시작할 수 있습니다. 앰배서더는 별도의 인터뷰 과정이 있습니다.'},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1261,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1260,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1255,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1265:10","data-component-name":"div",className:`faq-item ${n==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1266:12","data-component-name":"div",className:"faq-question",onClick:()=>o("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/community-program.tsx:1267:14","data-component-name":"h4",children:"포인트는 어떻게 TBURN으로 전환되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1267,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1268:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1268,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1266,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1270:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1271:14","data-component-name":"p",children:"포인트는 매월 말 자동으로 TBURN으로 전환됩니다. 전환 비율은 등급에 따라 달라지며, Legend 등급은 최대 3배의 보상 배율을 받습니다. 전환된 TBURN은 다음 달 첫째 주에 지급됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1271,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1270,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1265,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1275:10","data-component-name":"div",className:`faq-item ${n==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1276:12","data-component-name":"div",className:"faq-question",onClick:()=>o("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/community-program.tsx:1277:14","data-component-name":"h4",children:"여러 프로그램에 동시 참여가 가능한가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1277,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1278:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1278,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1276,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1280:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1281:14","data-component-name":"p",children:"네, 여러 프로그램에 동시 참여가 가능합니다. 예를 들어, 앰배서더로 활동하면서 콘텐츠 크리에이터로도 보상을 받을 수 있습니다. 단, 각 프로그램별 참여 조건을 모두 충족해야 합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1281,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1280,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1275,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1285:10","data-component-name":"div",className:`faq-item ${n==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1286:12","data-component-name":"div",className:"faq-question",onClick:()=>o("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/community-program.tsx:1287:14","data-component-name":"h4",children:"등급 강등 조건은 무엇인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1287,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1288:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1288,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1286,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1290:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1291:14","data-component-name":"p",children:"3개월 연속 최소 활동량(월 100포인트 이상)을 달성하지 못하면 등급이 강등될 수 있습니다. 강등 시 1단계씩 내려가며, 해당 등급의 보상 배율이 적용됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1291,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1290,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1285,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1254,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1247,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/community-program.tsx:1298:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1299:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/community-program.tsx:1300:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"TBURN 커뮤니티에 합류하세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1300,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1301:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["함께 성장하고, 함께 보상받는 TBURN 생태계",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/community-program.tsx:1302:38","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1302,columnNumber:39},this),"지금 바로 커뮤니티 프로그램에 참여하세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1301,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/community-program.tsx:1305:10","data-component-name":"button",className:"connect-btn",style:{background:"var(--white)",color:"var(--cyan)",fontSize:"1.25rem",padding:"20px 50px"},children:"🚀 지금 시작하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1305,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1299,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1298,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/community-program.tsx:1312:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1313:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1314:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/community-program.tsx:1315:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/community-program.tsx:1315:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1315,columnNumber:117},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1315,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1316:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/community-program.tsx:1316:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1316,columnNumber:127},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1316,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1317:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:1318:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1318,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:1319:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1319,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:1320:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1320,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:1321:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1321,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1317,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1314,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1324:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/community-program.tsx:1325:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1325,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/community-program.tsx:1326:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1327:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1327:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1327,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1327,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1328:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1328:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1328,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1328,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1329:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1329:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1329,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1329,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1330:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1330:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1330,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1330,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1326,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1324,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1333:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/community-program.tsx:1334:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1334,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/community-program.tsx:1335:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1336:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1336:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1336,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1336,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1337:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1337:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1337,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1337,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1338:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:1338:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1338,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1338,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1339:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1339:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1339,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1339,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1335,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1333,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1342:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/community-program.tsx:1343:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1343,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/community-program.tsx:1344:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1345:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1345:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1345,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1345,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1346:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:1346:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1346,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1346,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1347:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/community-program.tsx:1347:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1347,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1347,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/community-program.tsx:1348:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1348:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1348,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1348,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1344,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1342,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1313,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1352:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/community-program.tsx:1353:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1353,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/community-program.tsx:1354:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1355:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1355,columnNumber:13},this),e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/community-program.tsx:1356:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1356,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1354,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1352,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:1312,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/community-program.tsx",lineNumber:75,columnNumber:5},this)}export{T as default};
