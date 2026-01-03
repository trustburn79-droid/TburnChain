import{r as y,j as e}from"./index-enyS6VMP.js";import{d as z,L as n}from"./index-BvmfOamg.js";import{ac as q,n as F}from"./tburn-loader-CQr6K5Yg.js";import"./i18nInstance-DCxlOlkw.js";function S(){var m;const[s,u]=y.useState("faq-1"),{isConnected:c,address:p,connect:g,disconnect:h,formatAddress:x}=q(),{data:d,isLoading:b}=z({queryKey:["/api/token-programs/investment-rounds/stats"]}),o=d==null?void 0:d.data,t=(m=o==null?void 0:o.rounds)==null?void 0:m.find(a=>a.name.toLowerCase().includes("seed")),N=async()=>{c?h():await g("metamask")},i=a=>{u(s===a?null:a)},f=[{value:"$0.008",label:"토큰당 가격"},{value:"70%",label:"시장가 대비 할인"},{value:"12개월",label:"베스팅 기간"}],v=[{id:"seed",name:"Seed Round",amount:"$0.008",discount:"70%",status:"current"},{id:"private",name:"Private Round",amount:"$0.015",discount:"50%",status:""},{id:"public",name:"Public Round",amount:"$0.025",discount:"20%",status:""}],k=[{id:"lead",icon:"👑",name:"Lead Investor",subtitle:"리드 투자자",amount:"$1M+",details:[{label:"최소 투자",value:"$1,000,000"},{label:"할인율",value:"75%"},{label:"락업 기간",value:"6개월"}],benefits:["이사회 참관권","월간 경영진 미팅","독점 딜 플로우","우선 투자권","전담 IR 매니저"]},{id:"major",icon:"🌱",name:"Major Investor",subtitle:"주요 투자자",amount:"$500K+",details:[{label:"최소 투자",value:"$500,000"},{label:"할인율",value:"72%"},{label:"락업 기간",value:"6개월"}],benefits:["분기별 전략 미팅","얼리 액세스","거버넌스 참여","우선 배정","전용 지원"]},{id:"standard",icon:"💎",name:"Standard Investor",subtitle:"일반 투자자",amount:"$100K+",details:[{label:"최소 투자",value:"$100,000"},{label:"할인율",value:"70%"},{label:"락업 기간",value:"6개월"}],benefits:["월간 뉴스레터","커뮤니티 접근","기본 거버넌스","일반 배정","이메일 지원"]},{id:"angel",icon:"😇",name:"Angel Investor",subtitle:"엔젤 투자자",amount:"$25K+",details:[{label:"최소 투자",value:"$25,000"},{label:"할인율",value:"68%"},{label:"락업 기간",value:"6개월"}],benefits:["분기별 업데이트","커뮤니티 채널","NFT 뱃지","엔젤 네트워크","기본 지원"]}],w=[{icon:"🔒",title:"클리프 기간",value:"6개월",desc:"초기 락업"},{icon:"🔓",title:"초기 언락",value:"10%",desc:"TGE 후 6개월"},{icon:"📈",title:"월간 베스팅",value:"7.5%",desc:"12개월간"},{icon:"✅",title:"완전 언락",value:"100%",desc:"18개월 후"}],j=[{icon:"🏦",name:"Blockchain Ventures",type:"VC",tier:"lead"},{icon:"💰",name:"Crypto Capital",type:"Fund",tier:"lead"},{icon:"🌐",name:"Web3 Partners",type:"VC",tier:"major"},{icon:"⚡",name:"DeFi Fund",type:"Fund",tier:"major"}],E=[{icon:"📋",title:"투자 문의",desc:"투자 의향서 제출",duration:"1-3일"},{icon:"🔍",title:"KYC/AML",desc:"투자자 인증 절차",duration:"3-5일"},{icon:"📝",title:"SAFT 서명",desc:"투자 계약 체결",duration:"1-2일"},{icon:"💸",title:"자금 송금",desc:"투자금 전송",duration:"1-3일"},{icon:"🎉",title:"토큰 배정",desc:"투자 확정",duration:"즉시"}],D=[{icon:"📊",title:"총 발행량",value:"100억 TBURN",desc:"고정 공급량"},{icon:"🌱",title:"시드 배정",value:"5억 TBURN",desc:"총 공급량의 5%"},{icon:"💵",title:"시드 목표",value:"$4,000,000",desc:"하드캡"}],V=["암호화폐 투자는 높은 변동성과 리스크가 있습니다.","투자 원금 손실 가능성이 있으며, 손실 감당 가능한 범위 내에서 투자하세요.","규제 환경 변화로 인해 서비스가 제한될 수 있습니다.","과거 수익률이 미래 수익을 보장하지 않습니다."];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:108:4","data-component-name":"div",className:"seed-round-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/seed-round.tsx:109:6","data-component-name":"style",children:`
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
        .nav-links a:hover { color: var(--seed-primary); }

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
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:109,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/seed-round.tsx:907:6","data-component-name":"header",className:"seed-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:908:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:909:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:910:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(F,{"data-replit-metadata":"client/src/pages/seed-round.tsx:911:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:911,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:910,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:913:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:913:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:913,columnNumber:133},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:913,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:909,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/seed-round.tsx:915:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:916:12","data-component-name":"a",href:"#tiers",children:"투자 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:916,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:917:12","data-component-name":"a",href:"#vesting",children:"베스팅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:917,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:918:12","data-component-name":"a",href:"#investors",children:"투자자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:918,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:919:12","data-component-name":"a",href:"#process",children:"절차"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:919,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:920:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:920,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:915,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/seed-round.tsx:922:10","data-component-name":"button",className:"connect-btn",onClick:N,"data-testid":"button-connect-wallet",children:c?x(p):"🌱 투자 문의"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:922,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:908,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:907,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:933:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:934:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:934,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:935:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:936:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:937:12","data-component-name":"span",className:"seed-icon",children:"🌱"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:937,columnNumber:13},this)," SEED ROUND - 초기 투자자",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:938:12","data-component-name":"span",className:"round-status",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:938:43","data-component-name":"span",className:"dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:938,columnNumber:133},this)," 진행중"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:938,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:936,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/seed-round.tsx:940:10","data-component-name":"h1",children:["시드 라운드 투자로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/seed-round.tsx:941:22","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:941,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:942:12","data-component-name":"span",className:"gradient-text",children:"5억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:942,columnNumber:13},this)," 기회를 잡으세요"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:940,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:944:10","data-component-name":"p",className:"hero-subtitle",children:"블록체인 VC, 크립토 펀드, 엔젤 투자자를 위한 최대 70% 할인 초기 투자 기회를 제공합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:944,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:949:10","data-component-name":"div",className:"investment-highlights","data-testid":"investment-highlights",children:f.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:951:14","data-component-name":"div",className:"highlight-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:952:16","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:952,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:953:16","data-component-name":"div",className:"label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:953,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:951,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:949,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:958:10","data-component-name":"div",className:"stats-grid",children:b?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:960:14","data-component-name":"div",className:"stat-card","data-testid":"loading-indicator",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:961:16","data-component-name":"div",className:"stat-value",style:{opacity:.5},children:"로딩중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:961,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:960,columnNumber:15},this):e.jsxDEV(e.Fragment,{children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:965:16","data-component-name":"div",className:"stat-card","data-testid":"stat-total-seed",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:966:18","data-component-name":"div",className:"stat-value",children:(t==null?void 0:t.allocation)||"5억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:966,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:967:18","data-component-name":"div",className:"stat-label",children:"시드 배정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:967,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:965,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:969:16","data-component-name":"div",className:"stat-card","data-testid":"stat-price",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:970:18","data-component-name":"div",className:"stat-value",children:(t==null?void 0:t.price)||"$0.008"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:970,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:971:18","data-component-name":"div",className:"stat-label",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:971,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:969,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:973:16","data-component-name":"div",className:"stat-card","data-testid":"stat-hardcap",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:974:18","data-component-name":"div",className:"stat-value",children:(t==null?void 0:t.raised)||"$4M"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:974,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:975:18","data-component-name":"div",className:"stat-label",children:"하드캡"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:975,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:973,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:977:16","data-component-name":"div",className:"stat-card","data-testid":"stat-investors",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:978:18","data-component-name":"div",className:"stat-value",children:[(t==null?void 0:t.investors)||15,"+"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:978,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:979:18","data-component-name":"div",className:"stat-label",children:"투자자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:979,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:977,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:964,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:958,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:985:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/seed-round.tsx:986:12","data-component-name":"button",className:"btn-primary","data-testid":"button-apply-seed",children:"🌱 시드 투자 신청"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:986,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/seed-round.tsx:989:12","data-component-name":"button",className:"btn-secondary",children:"📖 투자 메모"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:989,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:985,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:935,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:933,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:997:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:998:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:999:10","data-component-name":"span",className:"section-badge",children:"COMPARISON"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:999,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1000:10","data-component-name":"h2",className:"section-title",children:"라운드 비교"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1e3,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1001:10","data-component-name":"p",className:"section-subtitle",children:"시드 라운드가 가장 유리한 조건입니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1001,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:998,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1004:8","data-component-name":"div",className:"round-comparison",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1005:10","data-component-name":"div",className:"comparison-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1006:12","data-component-name":"h3",children:"📊 투자 라운드 비교"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1006,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1005,columnNumber:11},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1008:10","data-component-name":"table",className:"comparison-table",children:[e.jsxDEV("thead",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1009:12","data-component-name":"thead",children:e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1010:14","data-component-name":"tr",children:[e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1011:16","data-component-name":"th",children:"라운드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1011,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1012:16","data-component-name":"th",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1012,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1013:16","data-component-name":"th",children:"할인율"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1013,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1014:16","data-component-name":"th",children:"상태"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1014,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1010,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1009,columnNumber:13},this),e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1017:12","data-component-name":"tbody",children:v.map(a=>e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1019:16","data-component-name":"tr",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1020:18","data-component-name":"td",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1021:20","data-component-name":"span",className:`round-badge ${a.id} ${a.status==="current"?"current":""}`,children:["🌱 ",a.name]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1021,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1020,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1025:18","data-component-name":"td",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1025,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1026:18","data-component-name":"td",children:[a.discount,a.status==="current"&&e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1028:51","data-component-name":"span",className:"discount-badge",children:"최대 할인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1028,columnNumber:52},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1026,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1030:18","data-component-name":"td",children:a.status==="current"?"✅ 진행중":"⏳ 예정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1030,columnNumber:19},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1019,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1017,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1008,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1004,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:997,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1039:6","data-component-name":"section",className:"section",id:"tiers",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1040:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1041:10","data-component-name":"span",className:"section-badge",children:"TIERS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1041,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1042:10","data-component-name":"h2",className:"section-title",children:"투자 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1042,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1043:10","data-component-name":"p",className:"section-subtitle",children:"투자 규모별 차등 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1043,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1040,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1046:8","data-component-name":"div",className:"tiers-grid",children:k.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1048:12","data-component-name":"div",className:`tier-card ${a.id}`,"data-testid":`tier-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1049:14","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1050:16","data-component-name":"div",className:"tier-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1050,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1051:16","data-component-name":"h3",className:"tier-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1051,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1052:16","data-component-name":"p",className:"tier-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1052,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1049,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1054:14","data-component-name":"div",className:"tier-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1055:16","data-component-name":"div",className:"tier-amount",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1056:18","data-component-name":"div",className:"label",children:"최소 투자금"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1056,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1057:18","data-component-name":"div",className:"value",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1057,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1055,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1059:16","data-component-name":"div",className:"tier-details",children:a.details.map((r,l)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1061:20","data-component-name":"div",className:"tier-detail-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1062:22","data-component-name":"span",className:"label",children:r.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1062,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1063:22","data-component-name":"span",className:"value",children:r.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1063,columnNumber:23},this)]},l,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1061,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1059,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1067:16","data-component-name":"ul",className:"tier-benefits",children:a.benefits.map((r,l)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1069:20","data-component-name":"li",children:r},l,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1069,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1067,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1072:16","data-component-name":"button",className:"tier-btn",children:"투자 문의"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1072,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1054,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1048,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1046,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1039,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1080:6","data-component-name":"section",className:"section",id:"vesting",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1081:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1082:10","data-component-name":"span",className:"section-badge",children:"VESTING"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1082,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1083:10","data-component-name":"h2",className:"section-title",children:"베스팅 스케줄"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1083,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1084:10","data-component-name":"p",className:"section-subtitle",children:"투자자 보호를 위한 체계적인 토큰 해제"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1084,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1081,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1087:8","data-component-name":"div",className:"vesting-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1088:10","data-component-name":"div",className:"vesting-visual",children:w.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1090:14","data-component-name":"div",className:"vesting-phase",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1091:16","data-component-name":"div",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1091,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1092:16","data-component-name":"div",className:"title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1092,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1093:16","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1093,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1094:16","data-component-name":"div",className:"desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1094,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1090,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1088,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1087,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1080,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1102:6","data-component-name":"section",className:"section",id:"investors",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1103:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1104:10","data-component-name":"span",className:"section-badge",children:"INVESTORS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1104,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1105:10","data-component-name":"h2",className:"section-title",children:"현재 투자자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1105,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1106:10","data-component-name":"p",className:"section-subtitle",children:"함께하는 파트너들"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1106,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1103,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1109:8","data-component-name":"div",className:"investors-showcase",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1110:10","data-component-name":"div",className:"investors-grid",children:j.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1112:14","data-component-name":"div",className:"investor-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1113:16","data-component-name":"div",className:"investor-logo",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1113,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1114:16","data-component-name":"div",className:"investor-card-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1114,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1115:16","data-component-name":"div",className:"investor-card-type",children:a.type},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1115,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1116:16","data-component-name":"span",className:`investor-card-tier ${a.tier}`,children:a.tier.toUpperCase()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1116,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1112,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1110,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1109,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1102,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1126:6","data-component-name":"section",className:"section",id:"process",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1127:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1128:10","data-component-name":"span",className:"section-badge",children:"PROCESS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1128,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1129:10","data-component-name":"h2",className:"section-title",children:"투자 절차"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1129,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1130:10","data-component-name":"p",className:"section-subtitle",children:"시드 투자 진행 과정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1130,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1127,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1133:8","data-component-name":"div",className:"process-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1134:10","data-component-name":"div",className:"process-timeline",children:E.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1136:14","data-component-name":"div",className:"process-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1137:16","data-component-name":"div",className:"process-dot",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1137,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1138:16","data-component-name":"div",className:"process-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1138,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1139:16","data-component-name":"div",className:"process-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1139,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1140:16","data-component-name":"div",className:"process-duration",children:a.duration},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1140,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1136,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1134,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1133,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1126,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1148:6","data-component-name":"section",className:"section",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1149:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1150:10","data-component-name":"span",className:"section-badge",children:"METRICS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1150,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1151:10","data-component-name":"h2",className:"section-title",children:"토큰 지표"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1151,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1152:10","data-component-name":"p",className:"section-subtitle",children:"시드 라운드 핵심 지표"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1152,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1149,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1155:8","data-component-name":"div",className:"metrics-grid",children:D.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1157:12","data-component-name":"div",className:"metric-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1158:14","data-component-name":"div",className:"metric-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1158,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1159:14","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1159,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1160:14","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1160,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1161:14","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1161,columnNumber:15},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1157,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1155,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1166:8","data-component-name":"div",className:"risk-section",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1167:10","data-component-name":"h4",children:"⚠️ 투자 위험 고지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1167,columnNumber:11},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1168:10","data-component-name":"ul",children:V.map((a,r)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1170:14","data-component-name":"li",children:a},r,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1170,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1168,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1166,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1148,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1177:6","data-component-name":"section",className:"section",id:"faq",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1178:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1179:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1179,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1180:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1180,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1181:10","data-component-name":"p",className:"section-subtitle",children:"시드 투자에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1181,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1178,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1184:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1185:10","data-component-name":"div",className:`faq-item ${s==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1186:12","data-component-name":"div",className:"faq-question",onClick:()=>i("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1187:14","data-component-name":"h4",children:"최소 투자 금액은 얼마인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1187,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1188:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1188,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1186,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1190:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1191:14","data-component-name":"p",children:"엔젤 투자자 티어의 경우 최소 $25,000부터 참여 가능합니다. 리드 투자자는 $1,000,000 이상의 투자가 필요하며, 투자 규모에 따라 추가 혜택이 제공됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1191,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1190,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1185,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1195:10","data-component-name":"div",className:`faq-item ${s==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1196:12","data-component-name":"div",className:"faq-question",onClick:()=>i("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1197:14","data-component-name":"h4",children:"토큰은 언제 받을 수 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1197,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1198:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1198,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1196,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1200:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1201:14","data-component-name":"p",children:"TGE(Token Generation Event) 이후 6개월의 클리프 기간이 있으며, 이후 10%가 초기 언락되고 나머지는 12개월에 걸쳐 월 7.5%씩 베스팅됩니다. 전체 언락까지 약 18개월이 소요됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1201,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1200,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1195,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1205:10","data-component-name":"div",className:`faq-item ${s==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1206:12","data-component-name":"div",className:"faq-question",onClick:()=>i("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1207:14","data-component-name":"h4",children:"KYC/AML 절차는 어떻게 되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1207,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1208:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1208,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1206,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1210:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1211:14","data-component-name":"p",children:"투자자 보호 및 규제 준수를 위해 KYC/AML 인증이 필요합니다. 신원 확인, 자금 출처 확인, 투자 적격성 검토 등이 포함되며 일반적으로 3-5일 정도 소요됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1211,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1210,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1205,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1215:10","data-component-name":"div",className:`faq-item ${s==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1216:12","data-component-name":"div",className:"faq-question",onClick:()=>i("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1217:14","data-component-name":"h4",children:"SAFT 계약은 무엇인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1217,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1218:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1218,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1216,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1220:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1221:14","data-component-name":"p",children:"SAFT(Simple Agreement for Future Tokens)는 미래 토큰에 대한 투자 계약서입니다. 투자금 전송 전 법적 구속력이 있는 SAFT 계약을 체결하며, 투자자의 권리와 의무가 명시되어 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1221,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1220,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1215,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1184,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1177,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1228:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1229:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1230:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"시드 투자자가 되세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1230,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1231:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN Chain의 초기 투자자로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1232:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1232,columnNumber:33},this),"최대 70% 할인된 가격에 투자하세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1231,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1235:10","data-component-name":"button",className:"btn-primary",style:{background:"var(--dark)",fontSize:"1.25rem",padding:"20px 50px"},children:"🌱 지금 투자하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1235,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1229,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1228,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1242:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1243:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1244:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1245:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1245:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1245,columnNumber:110},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1245,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1246:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1246:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1246,columnNumber:120},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1246,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1247:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1248:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1248,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1249:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1249,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1250:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1250,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1251:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1251,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1247,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1244,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1254:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1255:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1255,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1256:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1257:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1257:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1257,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1257,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1258:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1258:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1258,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1258,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1259:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1259:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1259,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1259,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1260:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1260:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1260,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1260,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1256,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1254,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1263:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1264:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1264,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1265:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1266:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1266:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1266,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1266,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1267:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1267:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1267,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1267,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1268:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1268:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1268,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1268,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1269:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1269:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1269,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1269,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1265,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1263,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1272:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1273:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1273,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1274:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1275:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1275:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1275,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1275,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1276:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1276:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1276,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1276,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1277:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1277:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1277,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1277,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1278:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1278:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1278,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1278,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1274,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1272,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1243,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1282:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1283:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1283,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/seed-round.tsx:1284:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1285:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1285,columnNumber:13},this),e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/seed-round.tsx:1286:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1286,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1284,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1282,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:1242,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/seed-round.tsx",lineNumber:108,columnNumber:5},this)}export{S as default};
