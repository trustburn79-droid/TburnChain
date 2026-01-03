import{r as x,j as e}from"./index-f5JN47So.js";import{d as A,L as t}from"./index-7GuuK3ey.js";import{ac as B,n as C}from"./tburn-loader-BTRnvHL3.js";import"./i18nInstance-DCxlOlkw.js";function Y(){var g;const[i,N]=x.useState("faq-1"),[l,u]=x.useState(1e3),{isConnected:p,address:f,connect:v,disconnect:k,formatAddress:w}=B(),{data:o,isLoading:E}=A({queryKey:["/api/token-programs/investment-rounds/stats"]}),m=o==null?void 0:o.data,r=(g=m==null?void 0:m.rounds)==null?void 0:g.find(a=>a.name.toLowerCase().includes("public")),D=async()=>{p?k():await v("metamask")},c=a=>{N(i===a?null:a)},j=[{value:"$0.025",label:"토큰당 가격",compare:""},{value:"20%",label:"시장가 대비 할인",compare:""},{value:"15%",label:"TGE 즉시 해제",compare:""},{value:"$100",label:"최소 참여금액",compare:""}],V=[{id:"seed",name:"Seed Round",amount:"$0.008",discount:"70%",status:"completed"},{id:"private",name:"Private Round",amount:"$0.015",discount:"50%",status:"completed"},{id:"public",name:"Public Round",amount:"$0.025",discount:"20%",status:"current"}],y=[{id:"whale",icon:"🐋",name:"Whale",subtitle:"대형 참여자",amount:"$50K+",details:[{label:"최소 참여",value:"$50,000"},{label:"추가 보너스",value:"+5%"},{label:"TGE 해제",value:"20%"}],benefits:["VIP 커뮤니티 접근","에어드랍 우선권","전용 AMA 초대","얼리 알파 정보","전담 지원"]},{id:"dolphin",icon:"🐬",name:"Dolphin",subtitle:"중형 참여자",amount:"$10K+",details:[{label:"최소 참여",value:"$10,000"},{label:"추가 보너스",value:"+3%"},{label:"TGE 해제",value:"17%"}],benefits:["프리미엄 커뮤니티","에어드랍 참여","분기 AMA","뉴스레터","우선 지원"]},{id:"fish",icon:"🐟",name:"Fish",subtitle:"일반 참여자",amount:"$1K+",details:[{label:"최소 참여",value:"$1,000"},{label:"추가 보너스",value:"+1%"},{label:"TGE 해제",value:"15%"}],benefits:["일반 커뮤니티","기본 에어드랍","공개 AMA","월간 업데이트","일반 지원"]},{id:"shrimp",icon:"🦐",name:"Shrimp",subtitle:"소액 참여자",amount:"$100+",details:[{label:"최소 참여",value:"$100"},{label:"추가 보너스",value:"-"},{label:"TGE 해제",value:"15%"}],benefits:["공개 채널 접근","기본 참여","공개 정보","이메일 알림","커뮤니티 지원"]}],z=[{icon:"🎉",title:"TGE 해제",value:"15%",desc:"즉시 해제"},{icon:"⏳",title:"클리프 없음",value:"0개월",desc:"바로 시작"},{icon:"📈",title:"월간 베스팅",value:"14.2%",desc:"6개월간"},{icon:"✅",title:"완전 언락",value:"100%",desc:"6개월 후"}],q=[{step:1,icon:"👛",title:"지갑 연결",desc:"MetaMask, Trust 등 지원"},{step:2,icon:"✅",title:"KYC 인증",desc:"간단한 본인 인증"},{step:3,icon:"💳",title:"결제 선택",desc:"USDT, USDC, ETH, BTC"},{step:4,icon:"🎉",title:"토큰 수령",desc:"TGE 15% 즉시 지급"}],T=[{icon:"🌐",name:"TBURN Launchpad",type:"공식 런치패드",desc:"TBURN 공식 세일 플랫폼",features:["최저 수수료","직접 참여","24/7 지원","다중 결제 지원"]},{icon:"🏛️",name:"파트너 거래소",type:"CEX IEO",desc:"파트너 거래소 통한 참여",features:["간편한 KYC","법정화폐 지원","거래소 보증","즉시 상장"]},{icon:"🦄",name:"DEX 런치패드",type:"탈중앙화 IDO",desc:"탈중앙화 플랫폼 참여",features:["지갑 직접 연결","스마트컨트랙트","투명한 배분","커뮤니티 주도"]}],$=[100,500,1e3,5e3,1e4],d=l/.025,b=d*.031,h=b-l;return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:102:4","data-component-name":"div",className:"public-round-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/public-round.tsx:103:6","data-component-name":"style",children:`
        .public-round-page {
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
          --sky: #0EA5E9;
          --public-primary: #3B82F6;
          --public-secondary: #2563EB;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-public: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes rocket { 0%, 100% { transform: translateY(0) rotate(-45deg); } 50% { transform: translateY(-10px) rotate(-45deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); } }
        @keyframes progressFill { 0% { width: 0%; } 100% { width: 45%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes countdown { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

        .public-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
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
        .nav-links a:hover { color: var(--public-primary); }

        .connect-btn {
          background: var(--gradient-public);
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
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
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
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--public-primary);
          margin-bottom: 2rem;
        }

        .badge .rocket-icon { animation: rocket 2s ease-in-out infinite; display: inline-block; }

        .round-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--success);
          margin-left: 10px;
        }

        .round-status .dot {
          width: 8px;
          height: 8px;
          background: var(--success);
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
          background: var(--gradient-public);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--light-gray);
          max-width: 750px;
          margin: 0 auto 2rem;
        }

        .countdown-container {
          background: var(--dark-card);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .countdown-label {
          font-size: 0.9rem;
          color: var(--public-primary);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .countdown-timer {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }

        .countdown-item { text-align: center; }

        .countdown-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--white);
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          padding: 0.5rem 1rem;
          min-width: 80px;
          animation: countdown 2s ease-in-out infinite;
        }

        .countdown-unit { font-size: 0.75rem; color: var(--gray); margin-top: 0.5rem; }

        .fundraise-progress {
          background: var(--dark-card);
          border: 1px solid rgba(59, 130, 246, 0.3);
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

        .progress-header .raised { font-size: 1.5rem; font-weight: 800; color: var(--public-primary); }
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
          background: var(--gradient-public);
          border-radius: 100px;
          width: 45%;
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

        .progress-stats .percent { color: var(--public-primary); font-weight: 700; }
        .progress-stats .remaining { color: var(--gray); }

        .investment-highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .highlight-card {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .highlight-card .value { font-size: 1.75rem; font-weight: 800; color: var(--public-primary); margin-bottom: 0.25rem; }
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
          border-color: var(--public-primary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-public);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-public);
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          animation: glow 2s ease-in-out infinite;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
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

        .btn-secondary:hover { border-color: var(--public-primary); color: var(--public-primary); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(59, 130, 246, 0.15);
          color: var(--public-primary);
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
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
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
        .comparison-table tr.highlight td { background: rgba(59, 130, 246, 0.1); }

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
        .round-badge.private { background: rgba(139, 92, 246, 0.2); color: var(--purple); }
        .round-badge.public { background: rgba(59, 130, 246, 0.2); color: var(--public-primary); }
        .round-badge.current { animation: glow 2s ease-in-out infinite; }

        .best-badge {
          background: rgba(34, 197, 94, 0.2);
          color: var(--success);
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

        .tier-card.whale { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.dolphin { border-color: var(--public-primary); }
        .tier-card.fish { border-color: var(--cyan); }
        .tier-card.shrimp { border-color: var(--emerald); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.whale .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.dolphin .tier-header { background: linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%); }
        .tier-card.fish .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }
        .tier-card.shrimp .tier-header { background: linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.whale .tier-name { color: var(--gold); }
        .tier-card.dolphin .tier-name { color: var(--public-primary); }
        .tier-card.fish .tier-name { color: var(--cyan); }
        .tier-card.shrimp .tier-name { color: var(--emerald); }

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

        .tier-card.whale .tier-amount .value { color: var(--gold); }
        .tier-card.dolphin .tier-amount .value { color: var(--public-primary); }
        .tier-card.fish .tier-amount .value { color: var(--cyan); }
        .tier-card.shrimp .tier-amount .value { color: var(--emerald); }

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

        .tier-card.whale .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.dolphin .tier-btn { background: var(--gradient-public); color: var(--white); }
        .tier-card.fish .tier-btn { background: linear-gradient(135deg, var(--cyan), var(--blue)); color: var(--white); }
        .tier-card.shrimp .tier-btn { background: linear-gradient(135deg, var(--emerald), var(--cyan)); color: var(--white); }

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
        .vesting-phase .value { font-size: 1.5rem; font-weight: 800; color: var(--public-primary); margin-bottom: 0.25rem; }
        .vesting-phase .desc { font-size: 0.8rem; color: var(--gray); }

        .participate-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .participate-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          position: relative;
          transition: all 0.3s;
        }

        .participate-card:hover {
          border-color: var(--public-primary);
          transform: translateY(-5px);
        }

        .participate-step {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: var(--gradient-public);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.125rem;
        }

        .participate-icon { font-size: 2.5rem; margin: 1rem 0; }

        .participate-card h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; }
        .participate-card p { font-size: 0.85rem; color: var(--light-gray); }

        .platforms-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .platform-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .platform-card:hover {
          border-color: var(--public-primary);
          transform: translateY(-5px);
        }

        .platform-logo {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .platform-card:nth-child(1) .platform-logo { background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2)); }
        .platform-card:nth-child(2) .platform-logo { background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(245, 158, 11, 0.2)); }
        .platform-card:nth-child(3) .platform-logo { background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.2)); }

        .platform-card h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .platform-card .type { font-size: 0.85rem; color: var(--public-primary); margin-bottom: 1rem; }
        .platform-card p { font-size: 0.9rem; color: var(--light-gray); margin-bottom: 1.5rem; }

        .platform-features { list-style: none; text-align: left; margin-bottom: 1.5rem; padding: 0; }

        .platform-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 0.85rem;
          color: var(--light-gray);
        }

        .platform-features li::before { content: '✓'; color: var(--success); }

        .platform-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .platform-card:nth-child(1) .platform-btn { background: var(--gradient-public); color: var(--white); }
        .platform-card:nth-child(2) .platform-btn { background: var(--gradient-gold); color: var(--dark); }
        .platform-card:nth-child(3) .platform-btn { background: linear-gradient(135deg, var(--purple), var(--violet)); color: var(--white); }

        .platform-btn:hover { transform: scale(1.02); }

        .calculator-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .calculator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .calculator-input {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 2rem;
        }

        .calculator-input h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input-group { margin-bottom: 1.5rem; }

        .input-group label {
          display: block;
          font-size: 0.85rem;
          color: var(--gray);
          margin-bottom: 0.5rem;
        }

        .input-group input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .input-group input:focus { outline: none; border-color: var(--public-primary); }

        .quick-amounts { display: flex; gap: 0.5rem; flex-wrap: wrap; }

        .quick-amount {
          padding: 8px 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 100px;
          color: var(--public-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .quick-amount:hover { background: var(--public-primary); color: var(--white); }

        .calculator-result {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 2rem;
        }

        .calculator-result h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .result-item:last-child { margin-bottom: 0; }
        .result-item .label { color: var(--gray); }
        .result-item .value { font-weight: 700; }
        .result-item .value.highlight { color: var(--public-primary); font-size: 1.25rem; }
        .result-item .value.gold { color: var(--gold); }

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

        .faq-chevron { color: var(--public-primary); transition: transform 0.3s; }
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
          background: var(--gradient-public);
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

        .social-links a:hover { background: var(--public-primary); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--public-primary); }

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
          .tiers-grid, .participate-grid { grid-template-columns: repeat(2, 1fr); }
          .platforms-grid { grid-template-columns: 1fr; }
          .calculator-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid, .investment-highlights { grid-template-columns: repeat(2, 1fr); }
          .vesting-visual { grid-template-columns: repeat(2, 1fr); }
          .vesting-phase::after { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
          .countdown-timer { flex-wrap: wrap; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .investment-highlights, .tiers-grid, .participate-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:103,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/public-round.tsx:1029:6","data-component-name":"header",className:"public-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1030:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1031:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1032:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(C,{"data-replit-metadata":"client/src/pages/public-round.tsx:1033:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1033,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1032,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1035:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1035:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1035,columnNumber:136},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1035,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1031,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/public-round.tsx:1037:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1038:12","data-component-name":"a",href:"#tiers",children:"참여 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1038,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1039:12","data-component-name":"a",href:"#vesting",children:"베스팅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1039,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1040:12","data-component-name":"a",href:"#how",children:"참여 방법"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1040,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1041:12","data-component-name":"a",href:"#calculator",children:"계산기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1041,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1042:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1042,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1037,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/public-round.tsx:1044:10","data-component-name":"button",className:"connect-btn",onClick:D,"data-testid":"button-connect-wallet",children:p?w(f):"🚀 지금 참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1044,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1030,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1029,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1055:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1056:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1056,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1057:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1058:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1059:12","data-component-name":"span",className:"rocket-icon",children:"🚀"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1059,columnNumber:13},this)," PUBLIC ROUND - 공개 세일",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1060:12","data-component-name":"span",className:"round-status",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1060:43","data-component-name":"span",className:"dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1060,columnNumber:136},this)," 진행중"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1060,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1058,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/public-round.tsx:1062:10","data-component-name":"h1",children:["퍼블릭 라운드로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/public-round.tsx:1063:20","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1063,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1064:12","data-component-name":"span",className:"gradient-text",children:"6억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1064,columnNumber:13},this)," 기회를 잡으세요"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1062,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1066:10","data-component-name":"p",className:"hero-subtitle",children:"누구나 참여 가능한 공개 세일. 최소 $100부터 시작, TGE 15% 즉시 해제, 클리프 없음!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1066,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1071:10","data-component-name":"div",className:"countdown-container","data-testid":"countdown-timer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1072:12","data-component-name":"div",className:"countdown-label",children:"🔥 세일 종료까지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1072,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1073:12","data-component-name":"div",className:"countdown-timer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1074:14","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1075:16","data-component-name":"div",className:"countdown-value",children:"14"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1075,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1076:16","data-component-name":"div",className:"countdown-unit",children:"DAYS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1076,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1074,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1078:14","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1079:16","data-component-name":"div",className:"countdown-value",children:"08"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1079,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1080:16","data-component-name":"div",className:"countdown-unit",children:"HOURS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1080,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1078,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1082:14","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1083:16","data-component-name":"div",className:"countdown-value",children:"32"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1083,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1084:16","data-component-name":"div",className:"countdown-unit",children:"MINS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1084,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1082,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1086:14","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1087:16","data-component-name":"div",className:"countdown-value",children:"15"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1087,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1088:16","data-component-name":"div",className:"countdown-unit",children:"SECS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1088,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1086,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1073,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1071,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1093:10","data-component-name":"div",className:"fundraise-progress","data-testid":"fundraise-progress",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1094:12","data-component-name":"div",className:"progress-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1095:14","data-component-name":"span",className:"raised",children:"$6,750,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1095,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1096:14","data-component-name":"span",className:"goal",children:"목표 $15,000,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1096,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1094,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1098:12","data-component-name":"div",className:"progress-bar",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1099:14","data-component-name":"div",className:"progress-fill"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1099,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1098,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1101:12","data-component-name":"div",className:"progress-stats",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1102:14","data-component-name":"span",className:"percent",children:"45% 달성"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1102,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1103:14","data-component-name":"span",className:"remaining",children:"$8,250,000 남음"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1103,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1101,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1093,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1107:10","data-component-name":"div",className:"investment-highlights","data-testid":"investment-highlights",children:j.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1109:14","data-component-name":"div",className:"highlight-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1110:16","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1110,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1111:16","data-component-name":"div",className:"label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1111,columnNumber:17},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1109,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1107,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1116:10","data-component-name":"div",className:"stats-grid",children:E?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1118:14","data-component-name":"div",className:"stat-card","data-testid":"loading-indicator",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1119:16","data-component-name":"div",className:"stat-value",style:{opacity:.5},children:"로딩중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1119,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1118,columnNumber:15},this):e.jsxDEV(e.Fragment,{children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1123:16","data-component-name":"div",className:"stat-card","data-testid":"stat-total-public",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1124:18","data-component-name":"div",className:"stat-value",children:(r==null?void 0:r.allocation)||"6억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1124,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1125:18","data-component-name":"div",className:"stat-label",children:"퍼블릭 배정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1125,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1123,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1127:16","data-component-name":"div",className:"stat-card","data-testid":"stat-price",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1128:18","data-component-name":"div",className:"stat-value",children:(r==null?void 0:r.price)||"$0.025"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1128,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1129:18","data-component-name":"div",className:"stat-label",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1129,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1127,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1131:16","data-component-name":"div",className:"stat-card","data-testid":"stat-hardcap",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1132:18","data-component-name":"div",className:"stat-value",children:(r==null?void 0:r.raised)||"$15M"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1132,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1133:18","data-component-name":"div",className:"stat-label",children:"하드캡"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1133,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1131,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1135:16","data-component-name":"div",className:"stat-card","data-testid":"stat-participants",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1136:18","data-component-name":"div",className:"stat-value",children:[(r==null?void 0:r.investors)||5200,"+"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1136,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1137:18","data-component-name":"div",className:"stat-label",children:"참여자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1137,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1135,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1122,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1116,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1143:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/public-round.tsx:1144:12","data-component-name":"button",className:"btn-primary","data-testid":"button-apply-public",children:"🚀 지금 참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1144,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/public-round.tsx:1147:12","data-component-name":"button",className:"btn-secondary",children:"📖 세일 가이드 보기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1147,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1143,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1057,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1055,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1155:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1156:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1157:10","data-component-name":"span",className:"section-badge",children:"COMPARISON"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1157,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/public-round.tsx:1158:10","data-component-name":"h2",className:"section-title",children:"라운드 비교"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1158,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1159:10","data-component-name":"p",className:"section-subtitle",children:"퍼블릭 라운드의 장점을 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1159,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1156,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1162:8","data-component-name":"div",className:"round-comparison",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1163:10","data-component-name":"div",className:"comparison-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/public-round.tsx:1164:12","data-component-name":"h3",children:"📊 투자 라운드 비교"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1164,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1163,columnNumber:11},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/public-round.tsx:1166:10","data-component-name":"table",className:"comparison-table",children:[e.jsxDEV("thead",{"data-replit-metadata":"client/src/pages/public-round.tsx:1167:12","data-component-name":"thead",children:e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/public-round.tsx:1168:14","data-component-name":"tr",children:[e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/public-round.tsx:1169:16","data-component-name":"th",children:"라운드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1169,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/public-round.tsx:1170:16","data-component-name":"th",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1170,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/public-round.tsx:1171:16","data-component-name":"th",children:"할인율"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1171,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/public-round.tsx:1172:16","data-component-name":"th",children:"상태"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1172,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1168,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1167,columnNumber:13},this),e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/public-round.tsx:1175:12","data-component-name":"tbody",children:V.map(a=>e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/public-round.tsx:1177:16","data-component-name":"tr",className:a.status==="current"?"highlight":"",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/public-round.tsx:1178:18","data-component-name":"td",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1179:20","data-component-name":"span",className:`round-badge ${a.id} ${a.status==="current"?"current":""}`,children:[a.id==="public"?"🚀":"🔐"," ",a.name]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1179,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1178,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/public-round.tsx:1183:18","data-component-name":"td",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1183,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/public-round.tsx:1184:18","data-component-name":"td",children:[a.discount,a.status==="current"&&e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1186:51","data-component-name":"span",className:"best-badge",children:"접근성 최고"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1186,columnNumber:52},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1184,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/public-round.tsx:1188:18","data-component-name":"td",children:a.status==="completed"?"✅ 완료":a.status==="current"?"🚀 진행중":"⏳ 예정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1188,columnNumber:19},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1177,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1175,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1166,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1162,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1155,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1200:6","data-component-name":"section",className:"section",id:"tiers",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1201:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1202:10","data-component-name":"span",className:"section-badge",children:"TIERS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1202,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/public-round.tsx:1203:10","data-component-name":"h2",className:"section-title",children:"참여 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1203,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1204:10","data-component-name":"p",className:"section-subtitle",children:"참여 금액별 혜택과 보너스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1204,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1201,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1207:8","data-component-name":"div",className:"tiers-grid",children:y.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1209:12","data-component-name":"div",className:`tier-card ${a.id}`,"data-testid":`tier-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1210:14","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1211:16","data-component-name":"div",className:"tier-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1211,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/public-round.tsx:1212:16","data-component-name":"h3",className:"tier-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1212,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1213:16","data-component-name":"p",className:"tier-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1213,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1210,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1215:14","data-component-name":"div",className:"tier-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1216:16","data-component-name":"div",className:"tier-amount",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1217:18","data-component-name":"div",className:"label",children:"최소 참여금"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1217,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1218:18","data-component-name":"div",className:"value",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1218,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1216,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1220:16","data-component-name":"div",className:"tier-details",children:a.details.map((n,s)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1222:20","data-component-name":"div",className:"tier-detail-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1223:22","data-component-name":"span",className:"label",children:n.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1223,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1224:22","data-component-name":"span",className:"value",children:n.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1224,columnNumber:23},this)]},s,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1222,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1220,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/public-round.tsx:1228:16","data-component-name":"ul",className:"tier-benefits",children:a.benefits.map((n,s)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1230:20","data-component-name":"li",children:n},s,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1230,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1228,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/public-round.tsx:1233:16","data-component-name":"button",className:"tier-btn",children:"참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1233,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1215,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1209,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1207,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1200,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1241:6","data-component-name":"section",className:"section",id:"vesting",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1242:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1243:10","data-component-name":"span",className:"section-badge",children:"VESTING"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1243,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/public-round.tsx:1244:10","data-component-name":"h2",className:"section-title",children:"베스팅 스케줄"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1244,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1245:10","data-component-name":"p",className:"section-subtitle",children:"TGE 15% 즉시 해제, 클리프 없음!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1245,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1242,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1248:8","data-component-name":"div",className:"vesting-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1249:10","data-component-name":"div",className:"vesting-visual",children:z.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1251:14","data-component-name":"div",className:"vesting-phase",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1252:16","data-component-name":"div",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1252,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1253:16","data-component-name":"div",className:"title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1253,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1254:16","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1254,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1255:16","data-component-name":"div",className:"desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1255,columnNumber:17},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1251,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1249,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1248,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1241,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1263:6","data-component-name":"section",className:"section",id:"how",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1264:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1265:10","data-component-name":"span",className:"section-badge",children:"HOW TO"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1265,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/public-round.tsx:1266:10","data-component-name":"h2",className:"section-title",children:"참여 방법"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1266,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1267:10","data-component-name":"p",className:"section-subtitle",children:"간단한 4단계로 참여하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1267,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1264,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1270:8","data-component-name":"div",className:"participate-grid",children:q.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1272:12","data-component-name":"div",className:"participate-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1273:14","data-component-name":"div",className:"participate-step",children:a.step},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1273,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1274:14","data-component-name":"div",className:"participate-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1274,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1275:14","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1275,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1276:14","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1276,columnNumber:15},this)]},a.step,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1272,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1270,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1263,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1283:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1284:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1285:10","data-component-name":"span",className:"section-badge",children:"PLATFORMS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1285,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/public-round.tsx:1286:10","data-component-name":"h2",className:"section-title",children:"참여 플랫폼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1286,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1287:10","data-component-name":"p",className:"section-subtitle",children:"다양한 방법으로 참여할 수 있습니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1287,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1284,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1290:8","data-component-name":"div",className:"platforms-grid",children:T.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1292:12","data-component-name":"div",className:"platform-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1293:14","data-component-name":"div",className:"platform-logo",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1293,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1294:14","data-component-name":"h4",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1294,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1295:14","data-component-name":"div",className:"type",children:a.type},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1295,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1296:14","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1296,columnNumber:15},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/public-round.tsx:1297:14","data-component-name":"ul",className:"platform-features",children:a.features.map((s,F)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1299:18","data-component-name":"li",children:s},F,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1299,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1297,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/public-round.tsx:1302:14","data-component-name":"button",className:"platform-btn",children:"참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1302,columnNumber:15},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1292,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1290,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1283,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1309:6","data-component-name":"section",className:"section",id:"calculator",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1310:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1311:10","data-component-name":"span",className:"section-badge",children:"CALCULATOR"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1311,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/public-round.tsx:1312:10","data-component-name":"h2",className:"section-title",children:"토큰 계산기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1312,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1313:10","data-component-name":"p",className:"section-subtitle",children:"투자 금액에 따른 예상 수익을 계산해보세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1313,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1310,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1316:8","data-component-name":"div",className:"calculator-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1317:10","data-component-name":"div",className:"calculator-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1318:12","data-component-name":"div",className:"calculator-input",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1319:14","data-component-name":"h4",children:"💵 투자 금액 입력"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1319,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1320:14","data-component-name":"div",className:"input-group",children:[e.jsxDEV("label",{"data-replit-metadata":"client/src/pages/public-round.tsx:1321:16","data-component-name":"label",children:"투자 금액 (USD)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1321,columnNumber:17},this),e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/public-round.tsx:1322:16","data-component-name":"input",type:"number",value:l,onChange:a=>u(Number(a.target.value)||0),placeholder:"투자 금액 입력","data-testid":"input-invest-amount"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1322,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1320,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1330:14","data-component-name":"div",className:"quick-amounts",children:$.map(a=>e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1332:18","data-component-name":"span",className:"quick-amount",onClick:()=>u(a),children:["$",a.toLocaleString()]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1332,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1330,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1318,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1342:12","data-component-name":"div",className:"calculator-result",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1343:14","data-component-name":"h4",children:"📊 예상 결과"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1343,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1344:14","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1345:16","data-component-name":"span",className:"label",children:"토큰 수량"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1345,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1346:16","data-component-name":"span",className:"value highlight",children:[d.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1346,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1344,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1348:14","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1349:16","data-component-name":"span",className:"label",children:"TGE 해제 (15%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1349,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1350:16","data-component-name":"span",className:"value",children:[(d*.15).toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1350,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1348,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1352:14","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1353:16","data-component-name":"span",className:"label",children:"예상 상장가 ($0.031)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1353,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1354:16","data-component-name":"span",className:"value",children:["$",b.toLocaleString()]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1354,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1352,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1356:14","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1357:16","data-component-name":"span",className:"label",children:"예상 수익"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1357,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1358:16","data-component-name":"span",className:"value gold",children:["+$",h.toLocaleString()," (+",(h/l*100).toFixed(1),"%)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1358,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1356,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1342,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1317,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1316,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1309,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1366:6","data-component-name":"section",className:"section",id:"faq",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1367:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1368:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1368,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/public-round.tsx:1369:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1369,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1370:10","data-component-name":"p",className:"section-subtitle",children:"퍼블릭 세일에 대한 궁금증"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1370,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1367,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1373:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1374:10","data-component-name":"div",className:`faq-item ${i==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1375:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1376:14","data-component-name":"h4",children:"퍼블릭 라운드 누구나 참여 가능한가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1376,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1377:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1377,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1375,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1379:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1380:14","data-component-name":"p",children:"네, 퍼블릭 라운드는 KYC 인증을 완료한 모든 사용자가 참여할 수 있습니다. 최소 참여 금액은 $100이며, 지갑 연결 후 간단한 본인 인증만 완료하면 됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1380,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1379,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1374,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1384:10","data-component-name":"div",className:`faq-item ${i==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1385:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1386:14","data-component-name":"h4",children:"TGE 즉시 해제가 뭔가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1386,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1387:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1387,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1385,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1389:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1390:14","data-component-name":"p",children:"Token Generation Event(TGE)는 토큰이 처음 생성되어 거래소에 상장되는 시점입니다. 퍼블릭 라운드 참여자는 TGE 시점에 투자 토큰의 15%를 즉시 받을 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1390,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1389,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1384,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1394:10","data-component-name":"div",className:`faq-item ${i==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1395:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1396:14","data-component-name":"h4",children:"시드/프라이빗과 뭐가 다른가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1396,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1397:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1397,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1395,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1399:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1400:14","data-component-name":"p",children:"시드($0.008)와 프라이빗($0.015)은 할인율이 높지만 높은 최소 참여금과 긴 베스팅 기간이 있습니다. 퍼블릭($0.025)은 할인율은 낮지만 $100부터 참여 가능하고 클리프 없이 TGE 15% 즉시 해제됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1400,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1399,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1394,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1404:10","data-component-name":"div",className:`faq-item ${i==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1405:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1406:14","data-component-name":"h4",children:"어떤 결제 방식을 지원하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1406,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1407:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1407,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1405,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1409:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1410:14","data-component-name":"p",children:"USDT, USDC, ETH, BTC 등 주요 암호화폐로 결제할 수 있습니다. 파트너 거래소를 통해 법정화폐(USD, KRW 등)로도 참여 가능합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1410,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1409,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1404,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1373,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1366,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/public-round.tsx:1417:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1418:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/public-round.tsx:1419:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"지금 참여하세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1419,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1420:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN Chain의 퍼블릭 세일에 참여하고",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/public-round.tsx:1421:37","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1421,columnNumber:38},this),"최소 $100부터 시작하는 블록체인 혁신에 동참하세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1420,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/public-round.tsx:1424:10","data-component-name":"button",className:"btn-primary",style:{background:"var(--dark)",fontSize:"1.25rem",padding:"20px 50px"},children:"🚀 지금 참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1424,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1418,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1417,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/public-round.tsx:1431:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1432:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1433:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/public-round.tsx:1434:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/public-round.tsx:1434:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1434,columnNumber:112},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1434,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1435:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/public-round.tsx:1435:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1435,columnNumber:122},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1435,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1436:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1437:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1437,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1438:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1438,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1439:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1439,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1440:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1440,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1436,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1433,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1443:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1444:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1444,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/public-round.tsx:1445:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1446:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1446:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1446,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1446,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1447:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1447:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1447,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1447,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1448:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1448:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1448,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1448,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1449:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1449:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1449,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1449,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1445,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1443,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1452:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1453:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1453,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/public-round.tsx:1454:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1455:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1455:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1455,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1455,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1456:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1456:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1456,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1456,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1457:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1457:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1457,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1457,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1458:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1458:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1458,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1458,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1454,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1452,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1461:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/public-round.tsx:1462:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1462,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/public-round.tsx:1463:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1464:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1464:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1464,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1464,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1465:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1465:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1465,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1465,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1466:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/public-round.tsx:1466:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1466,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1466,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/public-round.tsx:1467:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1467:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1467,columnNumber:109},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1467,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1463,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1461,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1432,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1471:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/public-round.tsx:1472:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1472,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/public-round.tsx:1473:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1474:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1474,columnNumber:13},this),e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/public-round.tsx:1475:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1475,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1473,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1471,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:1431,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/public-round.tsx",lineNumber:102,columnNumber:5},this)}export{Y as default};
