import{r as j,j as e}from"./index-C7twzsev.js";import{c as E,L as s}from"./index-Cm11IRca.js";import{ac as D,n as V}from"./tburn-loader-Bju4kY-X.js";import"./i18nInstance-DCxlOlkw.js";function F(){const[r,m]=j.useState("faq-1"),{isConnected:o,address:l,connect:d,disconnect:u,formatAddress:p}=D(),{data:c,isLoading:f}=E({queryKey:["/api/token-programs/ecosystem-fund/stats"]}),t=c==null?void 0:c.data,h=async()=>{o?u():await d("metamask")},i=a=>{m(r===a?null:a)},g=[{id:"grant",icon:"💻",name:"개발자 그랜트",amount:"2.8억",percent:"40%"},{id:"incubator",icon:"🚀",name:"dApp 인큐베이터",amount:"1.4억",percent:"20%"},{id:"hackathon",icon:"🏆",name:"해커톤 & 대회",amount:"0.7억",percent:"10%"},{id:"partnership",icon:"🤝",name:"파트너십 지원",amount:"1.4억",percent:"20%"},{id:"research",icon:"🔬",name:"연구 & 개발",amount:"0.7억",percent:"10%"}],N=[{id:"builder",icon:"🛠️",title:"Builder Grant",subtitle:"초기 개발자를 위한 지원금",amount:"최대 5만",range:"1,000~50,000 TBURN",featured:!1,features:["MVP 개발 지원","기술 멘토링","테스트넷 접근","커뮤니티 노출"],stats:{approved:"156",pending:"24"}},{id:"growth",icon:"📈",title:"Growth Grant",subtitle:"성장 단계 프로젝트 지원",amount:"최대 20만",range:"50,000~200,000 TBURN",featured:!0,features:["확장 자금 지원","마케팅 협업","VC 소개 연계","전략적 파트너십"],stats:{approved:"42",pending:"18"}},{id:"research",icon:"🔬",title:"Research Grant",subtitle:"연구 및 혁신 프로젝트",amount:"최대 50만",range:"100,000~500,000 TBURN",featured:!1,features:["장기 연구 지원","논문 출판 지원","학술 협력","특허 지원"],stats:{approved:"12",pending:"8"}}],x=[{icon:"📝",title:"신청서 제출",desc:"온라인 신청서 작성",duration:"1-2일"},{icon:"🔍",title:"1차 심사",desc:"팀/기술 검토",duration:"1-2주"},{icon:"💬",title:"인터뷰",desc:"팀 미팅 & Q&A",duration:"1주"},{icon:"📊",title:"최종 심사",desc:"위원회 평가",duration:"1-2주"},{icon:"✅",title:"승인 & 지급",desc:"계약 및 펀딩",duration:"1주"}],b=[{icon:"💰",type:"funding",title:"시드 펀딩",desc:"최대 100,000 TBURN 초기 자금"},{icon:"👨‍🏫",type:"mentoring",title:"전문 멘토링",desc:"업계 전문가 1:1 코칭"},{icon:"🛠️",type:"tech",title:"기술 지원",desc:"개발 도구 및 인프라 제공"},{icon:"🌐",type:"network",title:"네트워크 액세스",desc:"VC/파트너 네트워크 연결"},{icon:"📢",type:"marketing",title:"마케팅 지원",desc:"공동 마케팅 및 PR"}],v=[{name:"배치 #4",status:"recruiting",statusLabel:"모집중",info:"2025.02.01 ~ 2025.05.31 | 10팀 선발"},{name:"배치 #5",status:"upcoming",statusLabel:"예정",info:"2025.06.01 ~ 2025.09.30 | 10팀 선발"},{name:"배치 #3",status:"completed",statusLabel:"완료",info:"2024.10.01 ~ 2025.01.31 | 8팀 졸업"}],y=[{icon:"🎮",name:"GameFi",prize:"$25,000"},{icon:"💱",name:"DeFi",prize:"$25,000"},{icon:"🖼️",name:"NFT",prize:"$15,000"},{icon:"🤖",name:"AI+Blockchain",prize:"$35,000"}],k=[{icon:"🦊",name:"TBurn Swap",category:"DEX",funding:"150,000 TBURN"},{icon:"🏦",name:"TBurn Lend",category:"Lending",funding:"200,000 TBURN"},{icon:"🎮",name:"ChainQuest",category:"GameFi",funding:"100,000 TBURN"},{icon:"🖼️",name:"ArtVerse",category:"NFT Marketplace",funding:"80,000 TBURN"},{icon:"🌉",name:"CrossBridge",category:"Bridge",funding:"250,000 TBURN"},{icon:"📊",name:"DataDAO",category:"Analytics",funding:"75,000 TBURN"},{icon:"🔐",name:"VaultGuard",category:"Security",funding:"120,000 TBURN"},{icon:"💎",name:"StakeMax",category:"Staking",funding:"90,000 TBURN"}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:97:4","data-component-name":"div",className:"ecosystem-fund-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:98:6","data-component-name":"style",children:`
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
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:98,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:916:6","data-component-name":"header",className:"fund-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:917:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:918:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:919:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(V,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:920:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:920,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:919,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:922:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:922:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:922,columnNumber:137},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:922,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:918,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:924:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:925:12","data-component-name":"a",href:"#grants",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:925,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:926:12","data-component-name":"a",href:"#incubator",children:"인큐베이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:926,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:927:12","data-component-name":"a",href:"#hackathon",children:"해커톤"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:927,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:928:12","data-component-name":"a",href:"#portfolio",children:"포트폴리오"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:928,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:929:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:929,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:924,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:931:10","data-component-name":"button",className:"connect-btn",onClick:h,"data-testid":"button-connect-wallet",children:o?p(l):"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:931,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:917,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:916,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:942:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:943:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:943,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:944:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:945:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:946:12","data-component-name":"span",children:"🌱"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:946,columnNumber:13},this)," ECOSYSTEM FUND - 생태계 성장을 위한 투자"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:945,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:948:10","data-component-name":"h1",children:["TBURN 생태계",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:949:21","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:949,columnNumber:22},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:950:12","data-component-name":"span",className:"gradient-text",children:"7억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:950,columnNumber:13},this)," 펀드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:948,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:952:10","data-component-name":"p",className:"hero-subtitle",children:"개발자 그랜트, dApp 인큐베이션, 해커톤, 파트너십 지원으로 TBURN 생태계의 혁신적인 프로젝트를 지원합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:952,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:957:10","data-component-name":"div",className:"fund-stats-banner","data-testid":"fund-stats",children:f?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:959:14","data-component-name":"div",className:"fund-stat","data-testid":"loading-indicator",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:960:16","data-component-name":"div",className:"value",style:{opacity:.5},children:"로딩중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:960,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:959,columnNumber:15},this):e.jsxDEV(e.Fragment,{children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:964:16","data-component-name":"div",className:"fund-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:965:18","data-component-name":"div",className:"value","data-testid":"stat-fund-size",children:(t==null?void 0:t.totalFundSize)||"7억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:965,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:966:18","data-component-name":"div",className:"label",children:"총 펀드 규모"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:966,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:964,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:968:16","data-component-name":"div",className:"fund-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:969:18","data-component-name":"div",className:"value","data-testid":"stat-total-projects",children:(t==null?void 0:t.totalProjects)||124},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:969,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:970:18","data-component-name":"div",className:"label",children:"지원 프로젝트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:970,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:968,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:972:16","data-component-name":"div",className:"fund-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:973:18","data-component-name":"div",className:"value","data-testid":"stat-allocated",children:(t==null?void 0:t.totalAllocated)||"$175M+"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:973,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:974:18","data-component-name":"div",className:"label",children:"총 투자 유치"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:974,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:972,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:976:16","data-component-name":"div",className:"fund-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:977:18","data-component-name":"div",className:"value","data-testid":"stat-active-projects",children:(t==null?void 0:t.activeProjects)||32},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:977,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:978:18","data-component-name":"div",className:"label",children:"활성 dApp"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:978,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:976,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:980:16","data-component-name":"div",className:"fund-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:981:18","data-component-name":"div",className:"value",children:"85%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:981,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:982:18","data-component-name":"div",className:"label",children:"성공률"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:982,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:980,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:963,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:957,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:988:10","data-component-name":"div",className:"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:989:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-fund",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:990:14","data-component-name":"div",className:"stat-value",children:"7억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:990,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:991:14","data-component-name":"div",className:"stat-label",children:"총 에코시스템 펀드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:991,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:989,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:993:12","data-component-name":"div",className:"stat-card","data-testid":"stat-grant",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:994:14","data-component-name":"div",className:"stat-value",children:"2.8억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:994,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:995:14","data-component-name":"div",className:"stat-label",children:"개발자 그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:995,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:993,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:997:12","data-component-name":"div",className:"stat-card","data-testid":"stat-incubator",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:998:14","data-component-name":"div",className:"stat-value",children:"1.4억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:998,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:999:14","data-component-name":"div",className:"stat-label",children:"인큐베이터 펀드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:999,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:997,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1001:12","data-component-name":"div",className:"stat-card","data-testid":"stat-hackathon",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1002:14","data-component-name":"div",className:"stat-value",children:"$100K"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1002,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1003:14","data-component-name":"div",className:"stat-label",children:"해커톤 상금"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1003,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1001,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:988,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1007:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1008:12","data-component-name":"button",className:"btn-primary","data-testid":"button-apply-grant",children:"🚀 그랜트 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1008,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1011:12","data-component-name":"button",className:"btn-secondary",children:"📖 프로그램 안내"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1011,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1007,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:944,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:942,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1019:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1020:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1021:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1021,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1022:10","data-component-name":"h2",className:"section-title",children:"펀드 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1022,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1023:10","data-component-name":"p",className:"section-subtitle",children:"7억 TBURN이 5가지 프로그램으로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1023,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1020,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1026:8","data-component-name":"div",className:"distribution-grid",children:g.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1028:12","data-component-name":"div",className:`dist-card ${a.id}`,"data-testid":`dist-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1029:14","data-component-name":"div",className:"dist-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1029,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1030:14","data-component-name":"div",className:"dist-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1030,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1031:14","data-component-name":"div",className:"dist-amount",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1031,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1032:14","data-component-name":"div",className:"dist-percent",children:a.percent},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1032,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1028,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1026,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1019,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1039:6","data-component-name":"section",className:"section",id:"grants",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1040:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1041:10","data-component-name":"span",className:"section-badge",children:"GRANTS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1041,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1042:10","data-component-name":"h2",className:"section-title",children:"개발자 그랜트 프로그램"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1042,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1043:10","data-component-name":"p",className:"section-subtitle",children:"단계별 맞춤형 지원 프로그램"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1043,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1040,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1046:8","data-component-name":"div",className:"grant-programs-grid",children:N.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1048:12","data-component-name":"div",className:`grant-card ${a.featured?"featured":""}`,"data-testid":`grant-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1049:14","data-component-name":"div",className:`grant-header ${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1050:16","data-component-name":"div",className:"grant-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1050,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1051:16","data-component-name":"h3",className:"grant-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1051,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1052:16","data-component-name":"p",className:"grant-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1052,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1049,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1054:14","data-component-name":"div",className:"grant-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1055:16","data-component-name":"div",className:"grant-amount",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1056:18","data-component-name":"div",className:"grant-amount-label",children:"지원 금액"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1056,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1057:18","data-component-name":"div",className:"grant-amount-value",children:[a.amount," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1057,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1058:18","data-component-name":"div",className:"grant-amount-range",children:a.range},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1058,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1055,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1060:16","data-component-name":"ul",className:"grant-features",children:a.features.map((n,w)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1062:20","data-component-name":"li",children:n},w,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1062,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1060,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1065:16","data-component-name":"div",className:"grant-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1066:18","data-component-name":"div",className:"grant-stat-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1067:20","data-component-name":"div",className:"value",children:a.stats.approved},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1067,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1068:20","data-component-name":"div",className:"label",children:"승인됨"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1068,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1066,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1070:18","data-component-name":"div",className:"grant-stat-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1071:20","data-component-name":"div",className:"value",children:a.stats.pending},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1071,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1072:20","data-component-name":"div",className:"label",children:"심사중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1072,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1070,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1065,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1075:16","data-component-name":"button",className:"grant-btn",children:"신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1075,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1054,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1048,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1046,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1039,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1083:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1084:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1085:10","data-component-name":"span",className:"section-badge",children:"PROCESS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1085,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1086:10","data-component-name":"h2",className:"section-title",children:"그랜트 신청 프로세스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1086,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1087:10","data-component-name":"p",className:"section-subtitle",children:"약 4~6주 소요되는 심사 과정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1087,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1084,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1090:8","data-component-name":"div",className:"process-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1091:10","data-component-name":"div",className:"process-timeline",children:x.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1093:14","data-component-name":"div",className:"process-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1094:16","data-component-name":"div",className:"process-dot",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1094,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1095:16","data-component-name":"div",className:"process-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1095,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1096:16","data-component-name":"div",className:"process-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1096,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1097:16","data-component-name":"div",className:"process-duration",children:a.duration},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1097,columnNumber:17},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1093,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1091,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1090,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1083,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1105:6","data-component-name":"section",className:"section",id:"incubator",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1106:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1107:10","data-component-name":"span",className:"section-badge",children:"INCUBATOR"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1107,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1108:10","data-component-name":"h2",className:"section-title",children:"dApp 인큐베이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1108,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1109:10","data-component-name":"p",className:"section-subtitle",children:"4개월 집중 육성 프로그램"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1109,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1106,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1112:8","data-component-name":"div",className:"incubator-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1113:10","data-component-name":"div",className:"incubator-card",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1114:12","data-component-name":"h3",children:"🎯 인큐베이터 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1114,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1115:12","data-component-name":"div",className:"incubator-benefits",children:b.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1117:16","data-component-name":"div",className:"benefit-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1118:18","data-component-name":"div",className:`benefit-icon ${a.type}`,children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1118,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1119:18","data-component-name":"div",className:"benefit-content",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1120:20","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1120,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1121:20","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1121,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1119,columnNumber:19},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1117,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1115,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1113,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1128:10","data-component-name":"div",className:"incubator-card",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1129:12","data-component-name":"h3",children:"📅 배치 일정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1129,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1130:12","data-component-name":"div",className:"incubator-batch",children:v.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1132:16","data-component-name":"div",className:`batch-item ${a.status==="recruiting"?"active":a.status}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1133:18","data-component-name":"div",className:"batch-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1134:20","data-component-name":"span",className:"batch-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1134,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1135:20","data-component-name":"span",className:`batch-status ${a.status}`,children:a.statusLabel},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1135,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1133,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1137:18","data-component-name":"div",className:"batch-info",children:a.info},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1137,columnNumber:19},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1132,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1130,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1128,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1112,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1105,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1146:6","data-component-name":"section",className:"section",id:"hackathon",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1147:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1148:10","data-component-name":"span",className:"section-badge",children:"HACKATHON"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1148,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1149:10","data-component-name":"h2",className:"section-title",children:"해커톤 & 대회"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1149,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1150:10","data-component-name":"p",className:"section-subtitle",children:"혁신적인 아이디어에 상금을 수여합니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1150,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1147,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1153:8","data-component-name":"div",className:"hackathon-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1154:10","data-component-name":"div",className:"hackathon-banner",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1155:12","data-component-name":"h2",className:"hackathon-title",children:"🏆 TBURN Global Hackathon 2025"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1155,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1156:12","data-component-name":"p",className:"hackathon-subtitle",children:"총 상금 $100,000 | 2025.03.01 ~ 2025.04.30"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1156,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1154,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1158:10","data-component-name":"div",className:"hackathon-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1159:12","data-component-name":"div",className:"hackathon-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1160:14","data-component-name":"div",className:"hackathon-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1161:16","data-component-name":"div",className:"icon",children:"💰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1161,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1162:16","data-component-name":"div",className:"value",children:"$100K"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1162,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1163:16","data-component-name":"div",className:"label",children:"총 상금"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1163,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1160,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1165:14","data-component-name":"div",className:"hackathon-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1166:16","data-component-name":"div",className:"icon",children:"👥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1166,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1167:16","data-component-name":"div",className:"value",children:"500+"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1167,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1168:16","data-component-name":"div",className:"label",children:"참가자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1168,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1165,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1170:14","data-component-name":"div",className:"hackathon-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1171:16","data-component-name":"div",className:"icon",children:"🌍"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1171,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1172:16","data-component-name":"div",className:"value",children:"30+"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1172,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1173:16","data-component-name":"div",className:"label",children:"국가"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1173,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1170,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1175:14","data-component-name":"div",className:"hackathon-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1176:16","data-component-name":"div",className:"icon",children:"🏢"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1176,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1177:16","data-component-name":"div",className:"value",children:"15"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1177,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1178:16","data-component-name":"div",className:"label",children:"스폰서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1178,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1175,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1159,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1181:12","data-component-name":"div",className:"hackathon-tracks",children:y.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1183:16","data-component-name":"div",className:"track-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1184:18","data-component-name":"div",className:"track-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1184,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1185:18","data-component-name":"div",className:"track-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1185,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1186:18","data-component-name":"div",className:"track-prize",children:a.prize},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1186,columnNumber:19},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1183,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1181,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1158,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1153,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1146,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1195:6","data-component-name":"section",className:"section",id:"portfolio",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1196:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1197:10","data-component-name":"span",className:"section-badge",children:"PORTFOLIO"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1197,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1198:10","data-component-name":"h2",className:"section-title",children:"투자 포트폴리오"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1198,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1199:10","data-component-name":"p",className:"section-subtitle",children:"에코시스템 펀드로 지원된 프로젝트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1199,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1196,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1202:8","data-component-name":"div",className:"portfolio-grid",children:k.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1204:12","data-component-name":"div",className:"portfolio-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1205:14","data-component-name":"div",className:"portfolio-logo",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1205,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1206:14","data-component-name":"div",className:"portfolio-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1206,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1207:14","data-component-name":"div",className:"portfolio-category",children:a.category},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1207,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1208:14","data-component-name":"div",className:"portfolio-funding",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1209:16","data-component-name":"span",className:"label",children:"펀딩"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1209,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1210:16","data-component-name":"span",className:"value",children:a.funding},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1210,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1208,columnNumber:15},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1204,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1202,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1195,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1218:6","data-component-name":"section",className:"section",id:"faq",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1219:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1220:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1220,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1221:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1221,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1222:10","data-component-name":"p",className:"section-subtitle",children:"에코시스템 펀드에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1222,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1219,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1225:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1226:10","data-component-name":"div",className:`faq-item ${r==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1227:12","data-component-name":"div",className:"faq-question",onClick:()=>i("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1228:14","data-component-name":"h4",children:"그랜트 신청 자격은 어떻게 되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1228,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1229:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1229,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1227,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1231:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1232:14","data-component-name":"p",children:"TBURN Chain 위에 구축되는 모든 프로젝트가 신청 가능합니다. 개인 개발자, 스타트업, 기존 프로젝트 모두 환영합니다. 단, 프로젝트 계획서와 팀 정보가 필요합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1232,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1231,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1226,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1236:10","data-component-name":"div",className:`faq-item ${r==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1237:12","data-component-name":"div",className:"faq-question",onClick:()=>i("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1238:14","data-component-name":"h4",children:"그랜트 자금은 어떻게 지급되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1238,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1239:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1239,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1237,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1241:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1242:14","data-component-name":"p",children:"마일스톤 기반으로 분할 지급됩니다. 일반적으로 승인 시 30%, 중간 검토 시 40%, 완료 시 30%가 지급됩니다. 진행 상황에 따라 조정될 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1242,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1241,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1236,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1246:10","data-component-name":"div",className:`faq-item ${r==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1247:12","data-component-name":"div",className:"faq-question",onClick:()=>i("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1248:14","data-component-name":"h4",children:"인큐베이터 프로그램에 어떻게 참여하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1248,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1249:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1249,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1247,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1251:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1252:14","data-component-name":"p",children:"각 배치 모집 기간에 온라인으로 신청하시면 됩니다. 서류 심사, 인터뷰를 거쳐 매 배치당 10팀이 선발됩니다. 4개월간 집중 멘토링과 함께 최대 10만 TBURN의 시드 펀딩을 받을 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1252,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1251,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1246,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1256:10","data-component-name":"div",className:`faq-item ${r==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1257:12","data-component-name":"div",className:"faq-question",onClick:()=>i("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1258:14","data-component-name":"h4",children:"해커톤 참가 방법은 무엇인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1258,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1259:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1259,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1257,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1261:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1262:14","data-component-name":"p",children:"해커톤 페이지에서 등록 후 개인 또는 팀(최대 5명)으로 참가할 수 있습니다. 트랙을 선택하고 프로젝트를 제출하면 심사를 통해 수상자가 결정됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1262,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1261,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1256,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1225,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1218,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1269:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1270:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1271:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"지금 시작하세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1271,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1272:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN 생태계의 일원이 되어",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1273:29","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1273,columnNumber:30},this),"7억 TBURN 펀드의 지원을 받으세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1272,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1276:10","data-component-name":"button",className:"connect-btn",style:{background:"var(--white)",color:"var(--teal)",fontSize:"1.25rem",padding:"20px 50px"},children:"🚀 그랜트 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1276,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1270,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1269,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1283:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1284:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1285:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1286:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1286:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1286,columnNumber:114},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1286,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1287:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1287:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1287,columnNumber:124},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1287,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1288:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1289:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1289,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1290:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1290,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1291:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1291,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1292:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1292,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1288,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1285,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1295:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1296:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1296,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1297:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1298:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1298:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1298,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1298,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1299:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1299:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1299,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1299,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1300:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1300:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1300,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1300,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1301:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1301:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1301,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1301,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1297,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1295,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1304:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1305:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1305,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1306:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1307:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1307:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1307,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1307,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1308:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1308:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1308,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1308,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1309:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1309:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1309,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1309,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1310:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1310:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1310,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1310,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1306,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1304,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1313:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1314:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1314,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1315:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1316:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1316:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1316,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1316,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1317:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1317:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1317,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1317,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1318:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1318:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1318,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1318,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1319:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1319:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1319,columnNumber:111},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1319,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1315,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1313,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1284,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1323:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1324:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1324,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1325:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1326:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1326,columnNumber:13},this),e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/ecosystem-fund.tsx:1327:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1327,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1325,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1323,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:1283,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/ecosystem-fund.tsx",lineNumber:97,columnNumber:5},this)}export{F as default};
