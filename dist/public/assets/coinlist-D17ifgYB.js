import{r as i,j as e}from"./index-enyS6VMP.js";import{d as H,L as v}from"./index-BvmfOamg.js";import{ac as J}from"./tburn-loader-CQr6K5Yg.js";import"./i18nInstance-DCxlOlkw.js";function ee(){var C,S;const{isConnected:p,address:f,connect:F,disconnect:T,formatAddress:w}=J(),[l,L]=i.useState("overview"),[k,A]=i.useState("usd"),[n,j]=i.useState(1e3),[$,h]=i.useState(!1),[s,D]=i.useState("pending"),[u,B]=i.useState({days:14,hours:8,minutes:32,seconds:45}),[E,U]=i.useState(0),{data:x,isLoading:N}=H({queryKey:["/api/token-programs/launchpad/stats"]}),r=x==null?void 0:x.data,c=(C=r==null?void 0:r.platforms)==null?void 0:C.find(a=>a.name==="CoinList");i.useEffect(()=>{const a=setInterval(()=>{B(t=>{let{days:g,hours:o,minutes:m,seconds:d}=t;return d--,d<0&&(d=59,m--),m<0&&(m=59,o--),o<0&&(o=23,g--),g<0&&(g=0,o=0,m=0,d=0),{days:g,hours:o,minutes:m,seconds:d}})},1e3);return()=>clearInterval(a)},[]);const I=.02,V=n>=1e4?3:n>=1e3?1:0,y=n/I,z=y*(V/100),b=y+z,q=b*.15,P=()=>{h(!0),D("pending"),setTimeout(()=>D("success"),2500)},M=[{id:"usd",icon:"💳",name:"USD",type:"신용카드 / 계좌이체"},{id:"usdt",icon:"💵",name:"USDT",type:"스테이블코인"},{id:"usdc",icon:"💲",name:"USDC",type:"스테이블코인"},{id:"btc",icon:"₿",name:"BTC",type:"비트코인"}],R=[{icon:"⚡",title:"초고속 처리",desc:"200,000+ TPS로 실시간 트랜잭션 처리"},{icon:"🧠",title:"AI 통합",desc:"스마트 컨트랙트에 AI 기능 내장"},{icon:"🛡️",title:"강력한 보안",desc:"AI 기반 위협 탐지 및 방어"},{icon:"🌱",title:"친환경",desc:"에너지 효율적인 PoS 합의"}],G=[{icon:"📊",label:"총 공급량",value:"100억 TBURN"},{icon:"💰",label:"초기 시가총액",value:"$80M"},{icon:"🎯",label:"FDV",value:"$2B"},{icon:"🔥",label:"퍼블릭 세일",value:"6%"},{icon:"🌱",label:"생태계",value:"30%"},{icon:"👥",label:"커뮤니티",value:"25%"}],Y=[{initials:"JK",name:"John Kim",role:"CEO & Co-founder"},{initials:"SL",name:"Sarah Lee",role:"CTO & Co-founder"},{initials:"MP",name:"Michael Park",role:"Chief AI Officer"},{initials:"EC",name:"Emily Chen",role:"Head of Product"}],K=[{q:"CoinList에서 어떻게 참여하나요?",a:"CoinList 계정 생성 후 KYC 인증을 완료하고, USD, 신용카드, 또는 암호화폐로 참여할 수 있습니다."},{q:"최소/최대 참여 금액은 얼마인가요?",a:"최소 $100, 최대 $50,000까지 참여 가능합니다. CoinList 레벨에 따라 할당량이 다를 수 있습니다."},{q:"토큰은 언제 받을 수 있나요?",a:"TGE 시점에 15%가 즉시 해제되며, 나머지는 12개월 선형 베스팅 스케줄에 따라 지급됩니다."},{q:"법정화폐로 참여할 수 있나요?",a:"네, CoinList는 신용카드와 계좌이체를 통한 USD 결제를 지원합니다."}],O=[{icon:"📄",name:"백서",size:"PDF · 2.4 MB"},{icon:"📋",name:"기술 문서",size:"PDF · 5.1 MB"},{icon:"📊",name:"토크노믹스",size:"PDF · 1.2 MB"},{icon:"🛡️",name:"감사 보고서",size:"PDF · 890 KB"}],W=[100,500,1e3,5e3];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:119:4","data-component-name":"div",className:"coinlist-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/coinlist.tsx:120:6","data-component-name":"style",children:`
        .coinlist-page {
          --coinlist-primary: #FFD700;
          --coinlist-secondary: #FFC107;
          --coinlist-dark: #1A1A2E;
          --coinlist-darker: #16162A;
          --coinlist-card: #252542;
          --coinlist-border: #3D3D5C;
          --gold: #D4AF37;
          --white: #FFFFFF;
          --gray: #9CA3AF;
          --light-gray: #D1D5DB;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          --blue: #3B82F6;
          --purple: #8B5CF6;
          --gradient-coinlist: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--coinlist-darker);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); } 50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes rocket { 0%, 100% { transform: translateY(0) rotate(-10deg); } 50% { transform: translateY(-5px) rotate(-10deg); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }

        .cl-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(26, 26, 46, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--coinlist-border);
        }

        .cl-header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cl-header-left { display: flex; align-items: center; gap: 2rem; }

        .cl-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .cl-logo-icon {
          width: 40px;
          height: 40px;
          background: var(--gradient-coinlist);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          animation: rocket 3s ease-in-out infinite;
        }

        .cl-logo-text { font-size: 1.25rem; font-weight: 800; color: var(--white); }

        .cl-nav-tabs { display: flex; gap: 0.5rem; }

        .cl-nav-tab {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--gray);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-nav-tab:hover { color: var(--white); }
        .cl-nav-tab.active { background: var(--coinlist-card); color: var(--coinlist-primary); }

        .cl-header-right { display: flex; align-items: center; gap: 1rem; }

        .cl-balance {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--coinlist-card);
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .cl-balance .icon { color: var(--coinlist-primary); }
        .cl-balance .amount { font-weight: 700; }

        .cl-user-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-user-menu:hover { border-color: var(--coinlist-primary); }

        .cl-user-avatar {
          width: 32px;
          height: 32px;
          background: var(--gradient-coinlist);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: var(--coinlist-dark);
        }

        .cl-user-info .name { font-size: 0.85rem; font-weight: 600; }
        .cl-user-info .level { font-size: 0.7rem; color: var(--coinlist-primary); }

        .cl-main { padding-top: 80px; }

        .cl-hero {
          background: linear-gradient(180deg, var(--coinlist-dark) 0%, var(--coinlist-darker) 100%);
          padding: 3rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .cl-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 300px;
          background: radial-gradient(ellipse at top, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .cl-hero-container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }

        .cl-hero-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          align-items: start;
        }

        .cl-project-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }

        .cl-project-logo {
          width: 80px;
          height: 80px;
          background: var(--gradient-coinlist);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
        }

        .cl-project-title h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.25rem; }
        .cl-project-title .tagline { color: var(--gray); font-size: 1rem; }

        .cl-badges { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }

        .cl-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .cl-badge.live { background: rgba(16, 185, 129, 0.2); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
        .cl-badge.live .dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
        .cl-badge.verified { background: rgba(255, 215, 0, 0.15); color: var(--coinlist-primary); border: 1px solid rgba(255, 215, 0, 0.3); }
        .cl-badge.premium { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.3); }

        .cl-description { color: var(--light-gray); font-size: 1rem; line-height: 1.8; margin-bottom: 2rem; }

        .cl-key-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }

        .cl-metric-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
        }

        .cl-metric-value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }
        .cl-metric-value.gold { color: var(--coinlist-primary); }
        .cl-metric-value.green { color: var(--success); }
        .cl-metric-value.blue { color: var(--blue); }
        .cl-metric-value.purple { color: var(--purple); }
        .cl-metric-label { font-size: 0.8rem; color: var(--gray); }

        .cl-social-links { display: flex; gap: 0.75rem; }

        .cl-social-link {
          width: 44px;
          height: 44px;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray);
          text-decoration: none;
          transition: all 0.3s;
          font-size: 1.25rem;
        }

        .cl-social-link:hover { border-color: var(--coinlist-primary); color: var(--coinlist-primary); transform: translateY(-3px); }

        .cl-sale-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 24px;
          overflow: hidden;
          position: sticky;
          top: 100px;
        }

        .cl-sale-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
          border-bottom: 1px solid var(--coinlist-border);
        }

        .cl-sale-status { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

        .cl-live-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 100px;
          font-weight: 700;
          color: var(--success);
        }

        .cl-live-badge .dot { width: 10px; height: 10px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
        .cl-queue-info { font-size: 0.85rem; color: var(--gray); }

        .cl-countdown { display: flex; gap: 1rem; justify-content: center; }

        .cl-countdown-item { text-align: center; }
        .cl-countdown-value { font-size: 1.75rem; font-weight: 800; color: var(--white); }
        .cl-countdown-label { font-size: 0.7rem; color: var(--gray); text-transform: uppercase; }

        .cl-sale-body { padding: 1.5rem; }

        .cl-progress { margin-bottom: 1.5rem; }
        .cl-progress-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .cl-progress-header .raised { font-size: 1.25rem; font-weight: 800; color: var(--coinlist-primary); }
        .cl-progress-header .goal { color: var(--gray); font-size: 0.9rem; }

        .cl-progress-bar { height: 12px; background: var(--coinlist-dark); border-radius: 100px; overflow: hidden; margin-bottom: 0.75rem; }

        .cl-progress-fill {
          height: 100%;
          background: var(--gradient-coinlist);
          border-radius: 100px;
          position: relative;
          width: 45%;
        }

        .cl-progress-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .cl-progress-stats { display: flex; justify-content: space-between; font-size: 0.85rem; }
        .cl-progress-stats .percent { color: var(--coinlist-primary); font-weight: 700; }
        .cl-progress-stats .participants { color: var(--gray); }

        .cl-sale-info { margin-bottom: 1.5rem; }

        .cl-sale-info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cl-sale-info-item:last-child { border-bottom: none; }
        .cl-sale-info-item .label { color: var(--gray); font-size: 0.9rem; }
        .cl-sale-info-item .value { font-weight: 600; font-size: 0.9rem; }
        .cl-sale-info-item .value.highlight { color: var(--coinlist-primary); }

        .cl-queue-system {
          background: var(--coinlist-dark);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .cl-queue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .cl-queue-header h4 { font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .cl-queue-header h4 span { color: var(--coinlist-primary); }
        .cl-queue-position { font-size: 0.85rem; color: var(--success); font-weight: 600; }

        .cl-queue-visual { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
        .cl-queue-bar { flex: 1; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 100px; overflow: hidden; }
        .cl-queue-bar-fill { height: 100%; background: var(--success); border-radius: 100px; width: 15%; }
        .cl-queue-percent { font-size: 0.8rem; font-weight: 700; color: var(--success); }
        .cl-queue-wait { font-size: 0.8rem; color: var(--gray); text-align: center; }

        .cl-allocation { margin-bottom: 1.5rem; }
        .cl-allocation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .cl-allocation-header .label { font-size: 0.9rem; font-weight: 600; }
        .cl-allocation-header .max-alloc { font-size: 0.8rem; color: var(--coinlist-primary); }

        .cl-allocation-input-group { position: relative; margin-bottom: 1rem; }

        .cl-allocation-input {
          width: 100%;
          padding: 1rem;
          padding-right: 100px;
          background: var(--coinlist-dark);
          border: 2px solid var(--coinlist-border);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.25rem;
          font-weight: 700;
          transition: border-color 0.3s;
        }

        .cl-allocation-input:focus { outline: none; border-color: var(--coinlist-primary); }

        .cl-allocation-currency {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--coinlist-card);
          border-radius: 8px;
        }

        .cl-allocation-currency .icon { font-size: 1.25rem; }
        .cl-allocation-currency span { font-weight: 600; font-size: 0.9rem; }

        .cl-quick-amounts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }

        .cl-quick-amount {
          padding: 10px;
          background: var(--coinlist-dark);
          border: 1px solid var(--coinlist-border);
          border-radius: 8px;
          color: var(--light-gray);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .cl-quick-amount:hover, .cl-quick-amount.active {
          border-color: var(--coinlist-primary);
          color: var(--coinlist-primary);
          background: rgba(255, 215, 0, 0.1);
        }

        .cl-token-calc {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05));
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .cl-calc-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
        .cl-calc-row .label { color: var(--gray); font-size: 0.85rem; }
        .cl-calc-row .value { font-weight: 600; font-size: 0.85rem; }
        .cl-calc-row .value.large { font-size: 1.125rem; color: var(--coinlist-primary); }
        .cl-calc-row .value.bonus { color: var(--success); }

        .cl-payment-section { margin-bottom: 1.5rem; }
        .cl-payment-header { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; }

        .cl-payment-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }

        .cl-payment-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: var(--coinlist-dark);
          border: 2px solid var(--coinlist-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-payment-option:hover { border-color: rgba(255, 255, 255, 0.3); }
        .cl-payment-option.active { border-color: var(--coinlist-primary); background: rgba(255, 215, 0, 0.1); }
        .cl-payment-option .icon { font-size: 1.5rem; }
        .cl-payment-option .info { flex: 1; }
        .cl-payment-option .info .name { font-weight: 600; font-size: 0.9rem; }
        .cl-payment-option .info .type { font-size: 0.75rem; color: var(--gray); }

        .cl-payment-option .check {
          width: 20px;
          height: 20px;
          border: 2px solid var(--coinlist-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: transparent;
        }

        .cl-payment-option.active .check { background: var(--coinlist-primary); border-color: var(--coinlist-primary); color: var(--coinlist-dark); }

        .cl-purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: var(--gradient-coinlist);
          border: none;
          border-radius: 14px;
          color: var(--coinlist-dark);
          font-size: 1.125rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          animation: glow 2s infinite;
        }

        .cl-purchase-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3); }

        .cl-security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--gray);
        }

        .cl-security-note span { color: var(--success); }

        .cl-details-section { max-width: 1400px; margin: 0 auto; padding: 3rem 2rem; }

        .cl-details-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--coinlist-border);
          padding-bottom: 1rem;
          flex-wrap: wrap;
        }

        .cl-details-tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: var(--gray);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-details-tab:hover { color: var(--white); }
        .cl-details-tab.active { background: var(--coinlist-card); color: var(--coinlist-primary); }

        .cl-details-content { display: none; animation: slideUp 0.3s ease; }
        .cl-details-content.active { display: block; }

        .cl-overview-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }

        .cl-about-section {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 20px;
          padding: 2rem;
        }

        .cl-about-section h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cl-about-section h3 span { color: var(--coinlist-primary); }
        .cl-about-section p { color: var(--light-gray); line-height: 1.8; margin-bottom: 1.5rem; }

        .cl-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }

        .cl-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 1rem;
          background: var(--coinlist-dark);
          border-radius: 12px;
        }

        .cl-feature-item .icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .cl-feature-item h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem; }
        .cl-feature-item p { font-size: 0.8rem; color: var(--gray); }

        .cl-sidebar-cards { display: flex; flex-direction: column; gap: 1.5rem; }

        .cl-sidebar-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .cl-sidebar-card h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cl-sidebar-card h4 span { color: var(--coinlist-primary); }

        .cl-vesting-timeline { position: relative; }

        .cl-vesting-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding-bottom: 1.25rem;
          position: relative;
        }

        .cl-vesting-item::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 24px;
          bottom: 0;
          width: 2px;
          background: var(--coinlist-border);
        }

        .cl-vesting-item:last-child::before { display: none; }

        .cl-vesting-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--coinlist-dark);
          border: 2px solid var(--coinlist-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          flex-shrink: 0;
          z-index: 1;
        }

        .cl-vesting-item.tge .cl-vesting-dot { background: var(--coinlist-primary); border-color: var(--coinlist-primary); color: var(--coinlist-dark); }

        .cl-vesting-content { flex: 1; }
        .cl-vesting-content .title { font-weight: 600; font-size: 0.9rem; }
        .cl-vesting-content .desc { font-size: 0.8rem; color: var(--gray); }
        .cl-vesting-amount { font-weight: 700; color: var(--coinlist-primary); }

        .cl-documents-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .cl-document-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--coinlist-dark);
          border-radius: 10px;
          text-decoration: none;
          color: var(--white);
          transition: all 0.3s;
        }

        .cl-document-item:hover { background: rgba(255, 215, 0, 0.1); }

        .cl-document-item .icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
        }

        .cl-document-item .info { flex: 1; }
        .cl-document-item .info .name { font-weight: 600; font-size: 0.9rem; }
        .cl-document-item .info .size { font-size: 0.75rem; color: var(--gray); }
        .cl-document-item .arrow { color: var(--gray); }

        .cl-tokenomics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

        .cl-tokenomics-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .cl-tokenomics-card .icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 16px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .cl-tokenomics-card h4 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--gray); }
        .cl-tokenomics-card .value { font-size: 1.5rem; font-weight: 800; color: var(--coinlist-primary); }

        .cl-team-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }

        .cl-team-member { display: flex; align-items: center; gap: 12px; }

        .cl-team-member .avatar {
          width: 44px;
          height: 44px;
          background: var(--gradient-coinlist);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          color: var(--coinlist-dark);
        }

        .cl-team-member .info { flex: 1; }
        .cl-team-member .info .name { font-weight: 600; font-size: 0.9rem; }
        .cl-team-member .info .role { font-size: 0.8rem; color: var(--gray); }

        .cl-partners-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; }
        .cl-partner-badge { padding: 12px 20px; background: var(--coinlist-dark); border-radius: 10px; font-weight: 600; font-size: 0.9rem; }

        .cl-faq-list { max-width: 900px; }

        .cl-faq-item {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .cl-faq-question {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.3s;
        }

        .cl-faq-question:hover { background: rgba(255, 255, 255, 0.02); }
        .cl-faq-question h4 { font-size: 1rem; font-weight: 600; }
        .cl-faq-question .arrow { color: var(--coinlist-primary); transition: transform 0.3s; }
        .cl-faq-item.active .cl-faq-question .arrow { transform: rotate(180deg); }

        .cl-faq-answer {
          padding: 0 1.25rem;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s;
        }

        .cl-faq-item.active .cl-faq-answer { padding: 0 1.25rem 1.25rem; max-height: 500px; }
        .cl-faq-answer p { color: var(--gray); line-height: 1.8; }

        .cl-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .cl-modal {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 24px;
          width: 100%;
          max-width: 450px;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .cl-modal-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
          border-bottom: 1px solid var(--coinlist-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cl-modal-header h3 { font-size: 1.25rem; font-weight: 700; }

        .cl-modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--coinlist-dark);
          border: none;
          color: var(--gray);
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-modal-close:hover { background: var(--coinlist-border); color: var(--white); }

        .cl-modal-body { padding: 2rem; text-align: center; }

        .cl-modal-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .cl-modal-icon.pending { background: rgba(255, 215, 0, 0.2); }
        .cl-modal-icon.success { background: rgba(16, 185, 129, 0.2); color: var(--success); }

        .cl-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-top-color: var(--coinlist-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .cl-modal-body h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .cl-modal-body p { color: var(--gray); margin-bottom: 1.5rem; }

        .cl-modal-details {
          background: var(--coinlist-dark);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .cl-modal-detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; }
        .cl-modal-detail-row .label { color: var(--gray); }
        .cl-modal-detail-row .value { font-weight: 600; }

        .cl-modal-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: var(--gradient-coinlist);
          border: none;
          border-radius: 12px;
          color: var(--coinlist-dark);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-modal-btn:hover { transform: scale(1.02); }

        .cl-footer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          border-top: 1px solid var(--coinlist-border);
        }

        .cl-footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .cl-footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .cl-footer-links a { color: var(--gray); text-decoration: none; font-size: 0.85rem; transition: color 0.3s; }
        .cl-footer-links a:hover { color: var(--coinlist-primary); }
        .cl-footer-copyright { color: var(--gray); font-size: 0.85rem; }

        @media (max-width: 1200px) {
          .cl-hero-grid { grid-template-columns: 1fr; }
          .cl-sale-card { position: static; margin-top: 2rem; }
          .cl-overview-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .cl-key-metrics { grid-template-columns: repeat(2, 1fr); }
          .cl-tokenomics-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .cl-header-container { padding: 0.75rem 1rem; }
          .cl-nav-tabs, .cl-balance { display: none; }
          .cl-hero { padding: 2rem 1rem; }
          .cl-key-metrics { grid-template-columns: 1fr 1fr; }
          .cl-features-grid { grid-template-columns: 1fr; }
          .cl-tokenomics-grid { grid-template-columns: 1fr; }
          .cl-payment-options { grid-template-columns: 1fr; }
          .cl-quick-amounts { grid-template-columns: repeat(2, 1fr); }
          .cl-footer-content { flex-direction: column; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:120,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/coinlist.tsx:993:6","data-component-name":"header",className:"cl-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:994:8","data-component-name":"div",className:"cl-header-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:995:10","data-component-name":"div",className:"cl-header-left",children:[e.jsxDEV(v,{"data-replit-metadata":"client/src/pages/coinlist.tsx:996:12","data-component-name":"Link",href:"/",className:"cl-logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:997:14","data-component-name":"div",className:"cl-logo-icon",children:"🚀"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:997,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:998:14","data-component-name":"div",className:"cl-logo-text",children:"CoinList"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:998,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:996,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1000:12","data-component-name":"div",className:"cl-nav-tabs",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1001:14","data-component-name":"button",className:"cl-nav-tab active",children:"토큰 세일"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1001,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1002:14","data-component-name":"button",className:"cl-nav-tab",children:"트레이딩"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1002,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1003:14","data-component-name":"button",className:"cl-nav-tab",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1003,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1004:14","data-component-name":"button",className:"cl-nav-tab",children:"포트폴리오"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1004,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1e3,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:995,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1007:10","data-component-name":"div",className:"cl-header-right",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1008:12","data-component-name":"div",className:"cl-balance",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1009:14","data-component-name":"span",className:"icon",children:"💰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1009,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1010:14","data-component-name":"span",className:"amount",children:"$5,000.00"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1010,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1008,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1012:12","data-component-name":"button",className:"cl-user-menu",onClick:()=>p?T():F("metamask"),"data-testid":"button-wallet-connect",style:{cursor:"pointer",border:"none",background:"transparent"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1018:14","data-component-name":"div",className:"cl-user-avatar",children:p?w(f||"").slice(0,2).toUpperCase():"CL"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1018,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1019:14","data-component-name":"div",className:"cl-user-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1020:16","data-component-name":"div",className:"name",children:p?w(f||""):"지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1020,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1021:16","data-component-name":"div",className:"level",children:p?"Connected":"Click to connect"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1021,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1019,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1012,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1007,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:994,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:993,columnNumber:7},this),e.jsxDEV("main",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1029:6","data-component-name":"main",className:"cl-main",children:[e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1031:8","data-component-name":"section",className:"cl-hero",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1032:10","data-component-name":"div",className:"cl-hero-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1033:12","data-component-name":"div",className:"cl-hero-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1035:14","data-component-name":"div",className:"cl-project-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1036:16","data-component-name":"div",className:"cl-project-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1037:18","data-component-name":"div",className:"cl-project-logo",children:"🔥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1037,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1038:18","data-component-name":"div",className:"cl-project-title",children:[e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1039:20","data-component-name":"h1",children:"TBURN Chain"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1039,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1040:20","data-component-name":"div",className:"tagline",children:"AI-Enhanced Blockchain Platform"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1040,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1038,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1036,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1044:16","data-component-name":"div",className:"cl-badges",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1045:18","data-component-name":"span",className:"cl-badge live",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1045:50","data-component-name":"span",className:"dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1045,columnNumber:139},this),"세일 진행 중"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1045,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1046:18","data-component-name":"span",className:"cl-badge verified",children:"🛡️ CoinList 검증"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1046,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1047:18","data-component-name":"span",className:"cl-badge premium",children:"💎 프리미엄 런치"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1047,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1044,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1050:16","data-component-name":"p",className:"cl-description",children:"TBURN Chain은 AI와 블록체인 기술을 결합한 차세대 레이어-1 플랫폼입니다. 200,000+ TPS의 고성능, AI 기반 스마트 컨트랙트, 자가 최적화 네트워크를 통해 Web3의 미래를 선도합니다. CoinList를 통해 전 세계 투자자들에게 공개됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1050,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1056:16","data-component-name":"div",className:"cl-key-metrics","data-testid":"coinlist-metrics",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1057:18","data-component-name":"div",className:"cl-metric-card","data-testid":"stat-token-price",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1058:20","data-component-name":"div",className:"cl-metric-value gold",children:"$0.020"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1058,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1059:20","data-component-name":"div",className:"cl-metric-label",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1059,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1057,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1061:18","data-component-name":"div",className:"cl-metric-card","data-testid":"stat-tge",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1062:20","data-component-name":"div",className:"cl-metric-value green",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1062,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1063:20","data-component-name":"div",className:"cl-metric-label",children:"TGE 해제"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1063,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1061,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1065:18","data-component-name":"div",className:"cl-metric-card","data-testid":"stat-total-supply",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1066:20","data-component-name":"div",className:"cl-metric-value blue",children:"6억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1066,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1067:20","data-component-name":"div",className:"cl-metric-label",children:"총 세일 물량"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1067,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1065,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1069:18","data-component-name":"div",className:"cl-metric-card","data-testid":"stat-target",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1070:20","data-component-name":"div",className:"cl-metric-value purple",children:N?"...":(c==null?void 0:c.totalRaised)||"$12M"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1070,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1073:20","data-component-name":"div",className:"cl-metric-label",children:"목표 모집"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1073,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1069,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1056,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1077:16","data-component-name":"div",className:"cl-social-links",children:["🐦","📱","💬","📝","💻","🌐"].map((a,t)=>e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1079:20","data-component-name":"a",href:"#",className:"cl-social-link",children:a},t,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1079,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1077,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1035,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1085:14","data-component-name":"div",className:"cl-sale-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1086:16","data-component-name":"div",className:"cl-sale-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1087:18","data-component-name":"div",className:"cl-sale-status",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1088:20","data-component-name":"div",className:"cl-live-badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1088:51","data-component-name":"span",className:"dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1088,columnNumber:139},this),"LIVE"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1088,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1089:20","data-component-name":"div",className:"cl-queue-info",children:"12,450명 대기 중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1089,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1087,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1091:18","data-component-name":"div",className:"cl-countdown",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1092:20","data-component-name":"div",className:"cl-countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1093:22","data-component-name":"div",className:"cl-countdown-value",children:u.days.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1093,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1094:22","data-component-name":"div",className:"cl-countdown-label",children:"Days"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1094,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1092,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1096:20","data-component-name":"div",className:"cl-countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1097:22","data-component-name":"div",className:"cl-countdown-value",children:u.hours.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1097,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1098:22","data-component-name":"div",className:"cl-countdown-label",children:"Hours"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1098,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1096,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1100:20","data-component-name":"div",className:"cl-countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1101:22","data-component-name":"div",className:"cl-countdown-value",children:u.minutes.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1101,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1102:22","data-component-name":"div",className:"cl-countdown-label",children:"Mins"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1102,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1100,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1104:20","data-component-name":"div",className:"cl-countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1105:22","data-component-name":"div",className:"cl-countdown-value",children:u.seconds.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1105,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1106:22","data-component-name":"div",className:"cl-countdown-label",children:"Secs"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1106,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1104,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1091,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1086,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1111:16","data-component-name":"div",className:"cl-sale-body",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1113:18","data-component-name":"div",className:"cl-progress","data-testid":"coinlist-progress",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1114:20","data-component-name":"div",className:"cl-progress-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1115:22","data-component-name":"div",className:"raised","data-testid":"text-raised-amount",children:N?"...":(r==null?void 0:r.totalLaunchpadRaised)||"$5,400,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1115,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1118:22","data-component-name":"div",className:"goal",children:"/ $12,000,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1118,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1114,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1120:20","data-component-name":"div",className:"cl-progress-bar",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1121:22","data-component-name":"div",className:"cl-progress-fill"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1121,columnNumber:23},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1120,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1123:20","data-component-name":"div",className:"cl-progress-stats",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1124:22","data-component-name":"span",className:"percent",children:"45% 완료"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1124,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1125:22","data-component-name":"span",className:"participants","data-testid":"text-participants",children:N?"...":`${((S=c==null?void 0:c.participants)==null?void 0:S.toLocaleString())||"8,234"}명 참여`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1125,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1123,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1113,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1132:18","data-component-name":"div",className:"cl-sale-info",children:[{label:"토큰 가격",value:"$0.020",highlight:!0},{label:"최소 참여",value:"$100"},{label:"최대 참여",value:"$50,000"},{label:"TGE 해제",value:"15%",highlight:!0}].map((a,t)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1139:22","data-component-name":"div",className:"cl-sale-info-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1140:24","data-component-name":"span",className:"label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1140,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1141:24","data-component-name":"span",className:`value ${a.highlight?"highlight":""}`,children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1141,columnNumber:25},this)]},t,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1139,columnNumber:23},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1132,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1147:18","data-component-name":"div",className:"cl-queue-system",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1148:20","data-component-name":"div",className:"cl-queue-header",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1149:22","data-component-name":"h4",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1149:26","data-component-name":"span",children:"👥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1149,columnNumber:113},this)," 대기열 현황"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1149,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1150:22","data-component-name":"span",className:"cl-queue-position",children:"#1,247"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1150,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1148,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1152:20","data-component-name":"div",className:"cl-queue-visual",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1153:22","data-component-name":"div",className:"cl-queue-bar",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1154:24","data-component-name":"div",className:"cl-queue-bar-fill"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1154,columnNumber:25},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1153,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1156:22","data-component-name":"span",className:"cl-queue-percent",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1156,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1152,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1158:20","data-component-name":"div",className:"cl-queue-wait",children:"예상 대기 시간: 약 5분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1158,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1147,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1162:18","data-component-name":"div",className:"cl-allocation",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1163:20","data-component-name":"div",className:"cl-allocation-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1164:22","data-component-name":"span",className:"label",children:"참여 금액"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1164,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1165:22","data-component-name":"span",className:"max-alloc",children:"최대: $50,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1165,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1163,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1167:20","data-component-name":"div",className:"cl-allocation-input-group",children:[e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1168:22","data-component-name":"input",type:"number",className:"cl-allocation-input",value:n,onChange:a=>j(Number(a.target.value)||0),"data-testid":"input-allocation"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1168,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1175:22","data-component-name":"div",className:"cl-allocation-currency",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1176:24","data-component-name":"span",className:"icon",children:"💵"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1176,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1177:24","data-component-name":"span",children:"USD"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1177,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1175,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1167,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1180:20","data-component-name":"div",className:"cl-quick-amounts",children:W.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1182:24","data-component-name":"div",className:`cl-quick-amount ${n===a?"active":""}`,onClick:()=>j(a),children:["$",a.toLocaleString()]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1182,columnNumber:25},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1180,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1162,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1194:18","data-component-name":"div",className:"cl-token-calc",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1195:20","data-component-name":"div",className:"cl-calc-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1196:22","data-component-name":"span",className:"label",children:"받을 토큰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1196,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1197:22","data-component-name":"span",className:"value large",children:[b.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1197,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1195,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1199:20","data-component-name":"div",className:"cl-calc-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1200:22","data-component-name":"span",className:"label",children:["보너스 (+",V,"%)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1200,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1201:22","data-component-name":"span",className:"value bonus",children:["+",z.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1201,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1199,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1203:20","data-component-name":"div",className:"cl-calc-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1204:22","data-component-name":"span",className:"label",children:"TGE 해제 (15%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1204,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1205:22","data-component-name":"span",className:"value",children:[q.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1205,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1203,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1194,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1210:18","data-component-name":"div",className:"cl-payment-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1211:20","data-component-name":"div",className:"cl-payment-header",children:"결제 수단 선택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1211,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1212:20","data-component-name":"div",className:"cl-payment-options",children:M.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1214:24","data-component-name":"div",className:`cl-payment-option ${k===a.id?"active":""}`,onClick:()=>A(a.id),children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1219:26","data-component-name":"span",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1219,columnNumber:27},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1220:26","data-component-name":"div",className:"info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1221:28","data-component-name":"div",className:"name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1221,columnNumber:29},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1222:28","data-component-name":"div",className:"type",children:a.type},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1222,columnNumber:29},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1220,columnNumber:27},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1224:26","data-component-name":"div",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1224,columnNumber:27},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1214,columnNumber:25},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1212,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1210,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1230:18","data-component-name":"button",className:"cl-purchase-btn",onClick:P,"data-testid":"button-purchase",children:"🚀 지금 참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1230,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1234:18","data-component-name":"div",className:"cl-security-note",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1235:20","data-component-name":"span",children:"🛡️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1235,columnNumber:21},this)," CoinList 보안 결제로 안전하게 처리됩니다"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1234,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1111,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1085,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1033,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1032,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1031,columnNumber:9},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1244:8","data-component-name":"section",className:"cl-details-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1245:10","data-component-name":"div",className:"cl-details-tabs",children:["overview","tokenomics","team","faq"].map(a=>e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1247:14","data-component-name":"button",className:`cl-details-tab ${l===a?"active":""}`,onClick:()=>L(a),children:a==="overview"?"개요":a==="tokenomics"?"토크노믹스":a==="team"?"팀":"FAQ"},a,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1247,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1245,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1258:10","data-component-name":"div",className:`cl-details-content ${l==="overview"?"active":""}`,children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1259:12","data-component-name":"div",className:"cl-overview-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1260:14","data-component-name":"div",className:"cl-about-section",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1261:16","data-component-name":"h3",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1261:20","data-component-name":"span",children:"ℹ️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1261,columnNumber:107},this)," 프로젝트 소개"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1261,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1262:16","data-component-name":"p",children:"TBURN Chain은 AI 기술과 블록체인의 결합을 통해 차세대 탈중앙화 인프라를 구축합니다. Triple-Band AI Orchestration, AI-Enhanced Committee BFT, Dynamic Sharding 등의 혁신적인 기술을 통해 기존 블록체인의 한계를 뛰어넘습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1262,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1267:16","data-component-name":"p",children:"메인넷 런칭 후 DeFi, NFT, GameFi, 엔터프라이즈 솔루션 등 다양한 생태계를 구축하여 Web3 대중화를 선도할 예정입니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1267,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1272:16","data-component-name":"h3",style:{marginTop:"2rem"},children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1272:50","data-component-name":"span",children:"⭐"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1272,columnNumber:137},this)," 주요 특징"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1272,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1273:16","data-component-name":"div",className:"cl-features-grid",children:R.map((a,t)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1275:20","data-component-name":"div",className:"cl-feature-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1276:22","data-component-name":"div",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1276,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1277:22","data-component-name":"div",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1278:24","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1278,columnNumber:25},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1279:24","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1279,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1277,columnNumber:23},this)]},t,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1275,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1273,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1260,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1286:14","data-component-name":"div",className:"cl-sidebar-cards",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1288:16","data-component-name":"div",className:"cl-sidebar-card",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1289:18","data-component-name":"h4",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1289:22","data-component-name":"span",children:"📅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1289,columnNumber:109},this)," 베스팅 스케줄"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1289,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1290:18","data-component-name":"div",className:"cl-vesting-timeline",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1291:20","data-component-name":"div",className:"cl-vesting-item tge",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1292:22","data-component-name":"div",className:"cl-vesting-dot",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1292,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1293:22","data-component-name":"div",className:"cl-vesting-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1294:24","data-component-name":"div",className:"title",children:"TGE"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1294,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1295:24","data-component-name":"div",className:"desc",children:"토큰 생성 시점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1295,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1293,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1297:22","data-component-name":"div",className:"cl-vesting-amount",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1297,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1291,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1299:20","data-component-name":"div",className:"cl-vesting-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1300:22","data-component-name":"div",className:"cl-vesting-dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1300,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1301:22","data-component-name":"div",className:"cl-vesting-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1302:24","data-component-name":"div",className:"title",children:"클리프"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1302,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1303:24","data-component-name":"div",className:"desc",children:"1~3개월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1303,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1301,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1305:22","data-component-name":"div",className:"cl-vesting-amount",children:"0%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1305,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1299,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1307:20","data-component-name":"div",className:"cl-vesting-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1308:22","data-component-name":"div",className:"cl-vesting-dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1308,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1309:22","data-component-name":"div",className:"cl-vesting-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1310:24","data-component-name":"div",className:"title",children:"선형 베스팅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1310,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1311:24","data-component-name":"div",className:"desc",children:"4~15개월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1311,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1309,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1313:22","data-component-name":"div",className:"cl-vesting-amount",children:"85%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1313,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1307,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1290,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1288,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1319:16","data-component-name":"div",className:"cl-sidebar-card",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1320:18","data-component-name":"h4",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1320:22","data-component-name":"span",children:"📄"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1320,columnNumber:109},this)," 문서"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1320,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1321:18","data-component-name":"div",className:"cl-documents-list",children:O.map((a,t)=>e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1323:22","data-component-name":"a",href:"#",className:"cl-document-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1324:24","data-component-name":"div",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1324,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1325:24","data-component-name":"div",className:"info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1326:26","data-component-name":"div",className:"name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1326,columnNumber:27},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1327:26","data-component-name":"div",className:"size",children:a.size},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1327,columnNumber:27},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1325,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1329:24","data-component-name":"span",className:"arrow",children:"→"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1329,columnNumber:25},this)]},t,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1323,columnNumber:23},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1321,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1319,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1286,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1259,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1258,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1339:10","data-component-name":"div",className:`cl-details-content ${l==="tokenomics"?"active":""}`,children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1340:12","data-component-name":"div",className:"cl-tokenomics-grid",children:G.map((a,t)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1342:16","data-component-name":"div",className:"cl-tokenomics-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1343:18","data-component-name":"div",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1343,columnNumber:19},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1344:18","data-component-name":"h4",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1344,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1345:18","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1345,columnNumber:19},this)]},t,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1342,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1340,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1339,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1352:10","data-component-name":"div",className:`cl-details-content ${l==="team"?"active":""}`,children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1353:12","data-component-name":"div",className:"cl-overview-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1354:14","data-component-name":"div",className:"cl-about-section",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1355:16","data-component-name":"h3",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1355:20","data-component-name":"span",children:"👥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1355,columnNumber:107},this)," 핵심 팀"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1355,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1356:16","data-component-name":"div",className:"cl-team-list",children:Y.map((a,t)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1358:20","data-component-name":"div",className:"cl-team-member",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1359:22","data-component-name":"div",className:"avatar",children:a.initials},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1359,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1360:22","data-component-name":"div",className:"info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1361:24","data-component-name":"div",className:"name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1361,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1362:24","data-component-name":"div",className:"role",children:a.role},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1362,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1360,columnNumber:23},this)]},t,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1358,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1356,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1354,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1368:14","data-component-name":"div",className:"cl-sidebar-cards",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1369:16","data-component-name":"div",className:"cl-sidebar-card",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1370:18","data-component-name":"h4",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1370:22","data-component-name":"span",children:"🤝"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1370,columnNumber:109},this)," 주요 파트너"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1370,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1371:18","data-component-name":"div",className:"cl-partners-grid",children:["Chainlink","Circle","AWS","Samsung"].map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1373:22","data-component-name":"div",className:"cl-partner-badge",children:a},a,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1373,columnNumber:23},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1371,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1369,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1377:16","data-component-name":"div",className:"cl-sidebar-card",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1378:18","data-component-name":"h4",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1378:22","data-component-name":"span",children:"🏢"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1378,columnNumber:109},this)," 투자자"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1378,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1379:18","data-component-name":"div",className:"cl-partners-grid",children:["Polychain","Framework","Electric"].map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1381:22","data-component-name":"div",className:"cl-partner-badge",children:a},a,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1381,columnNumber:23},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1379,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1377,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1368,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1353,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1352,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1390:10","data-component-name":"div",className:`cl-details-content ${l==="faq"?"active":""}`,children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1391:12","data-component-name":"div",className:"cl-faq-list",children:K.map((a,t)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1393:16","data-component-name":"div",className:`cl-faq-item ${E===t?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1394:18","data-component-name":"div",className:"cl-faq-question",onClick:()=>U(E===t?-1:t),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1395:20","data-component-name":"h4",children:a.q},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1395,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1396:20","data-component-name":"span",className:"arrow",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1396,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1394,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1398:18","data-component-name":"div",className:"cl-faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1399:20","data-component-name":"p",children:a.a},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1399,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1398,columnNumber:19},this)]},t,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1393,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1391,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1390,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1244,columnNumber:9},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1408:8","data-component-name":"footer",className:"cl-footer",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1409:10","data-component-name":"div",className:"cl-footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1410:12","data-component-name":"div",className:"cl-footer-links",children:[e.jsxDEV(v,{"data-replit-metadata":"client/src/pages/coinlist.tsx:1411:14","data-component-name":"Link",href:"/legal/terms-of-service",children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1411,columnNumber:15},this),e.jsxDEV(v,{"data-replit-metadata":"client/src/pages/coinlist.tsx:1412:14","data-component-name":"Link",href:"/legal/privacy-policy",children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1412,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1413:14","data-component-name":"a",href:"#",children:"리스크 고지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1413,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1414:14","data-component-name":"a",href:"#",children:"고객 지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1414,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1410,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1416:12","data-component-name":"div",className:"cl-footer-copyright",children:"© 2025 CoinList. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1416,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1409,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1408,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1029,columnNumber:7},this),$&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1423:8","data-component-name":"div",className:"cl-modal-overlay",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1424:10","data-component-name":"div",className:"cl-modal",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1425:12","data-component-name":"div",className:"cl-modal-header",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1426:14","data-component-name":"h3",children:s==="success"?"참여 완료!":"처리 중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1426,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1427:14","data-component-name":"button",className:"cl-modal-close",onClick:()=>h(!1),children:"✕"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1427,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1425,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1429:12","data-component-name":"div",className:"cl-modal-body",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1430:14","data-component-name":"div",className:`cl-modal-icon ${s}`,children:s==="pending"?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1431:45","data-component-name":"div",className:"cl-spinner"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1431,columnNumber:46},this):"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1430,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1433:14","data-component-name":"h4",children:s==="success"?"토큰 세일 참여 완료!":"결제 처리 중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1433,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1434:14","data-component-name":"p",children:s==="success"?"TGE 시점에 토큰이 지급됩니다":"잠시만 기다려주세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1434,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1436:14","data-component-name":"div",className:"cl-modal-details",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1437:16","data-component-name":"div",className:"cl-modal-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1438:18","data-component-name":"span",className:"label",children:"참여 금액"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1438,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1439:18","data-component-name":"span",className:"value",children:["$",n.toLocaleString()," ",k.toUpperCase()]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1439,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1437,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1441:16","data-component-name":"div",className:"cl-modal-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1442:18","data-component-name":"span",className:"label",children:"받을 토큰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1442,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1443:18","data-component-name":"span",className:"value",children:[b.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1443,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1441,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1445:16","data-component-name":"div",className:"cl-modal-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1446:18","data-component-name":"span",className:"label",children:"TGE 해제"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1446,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1447:18","data-component-name":"span",className:"value",children:[q.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1447,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1445,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1436,columnNumber:15},this),s==="success"&&e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/coinlist.tsx:1452:16","data-component-name":"button",className:"cl-modal-btn",onClick:()=>h(!1),children:"확인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1452,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1429,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1424,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:1423,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/coinlist.tsx",lineNumber:119,columnNumber:5},this)}export{ee as default};
