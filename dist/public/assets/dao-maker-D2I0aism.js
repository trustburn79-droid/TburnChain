import{r as n,j as e}from"./index-MawzfEWf.js";import{d as I,L as N}from"./index-DNbWdfiD.js";import{ac as Q}from"./tburn-loader-BM0jq71g.js";import"./i18nInstance-DCxlOlkw.js";function Z(){var z;const{isConnected:k,address:S,connect:A,disconnect:O,formatAddress:q}=Q(),[i,T]=n.useState("tiers"),[s,v]=n.useState(1e3),[$,u]=n.useState(!1),[o,f]=n.useState("pending"),[l,F]=n.useState({days:14,hours:8,minutes:32,seconds:45}),[w,B]=n.useState(0),{data:g,isLoading:P}=I({queryKey:["/api/token-programs/launchpad/stats"]}),h=g==null?void 0:g.data,x=(z=h==null?void 0:h.platforms)==null?void 0:z.find(a=>a.name==="DAO Maker");n.useEffect(()=>{const a=setInterval(()=>{F(r=>{let{days:m,hours:t,minutes:d,seconds:c}=r;return c--,c<0&&(c=59,d--),d<0&&(d=59,t--),t<0&&(t=23,m--),m<0&&(m=0,t=0,d=0,c=0),{days:m,hours:t,minutes:d,seconds:c}})},1e3);return()=>clearInterval(a)},[]);const C=.02,D="Silver",p=2500,j=s>=2500?3:s>=1e3?1:0,E=s/C,V=E*(j/100),b=E+V,y=b*.15,L=()=>{u(!0),f("pending"),setTimeout(()=>f("success"),2500)},G=[100,500,1e3,2500],H=[{icon:"🥉",name:"Bronze",power:"1,000+",allocation:"$500",features:["SHO 참여 자격","기본 할당량","리펀드 정책 적용"]},{icon:"🥈",name:"Silver",power:"5,000+",allocation:"$2,500",features:["우선 할당","+1% 보너스 토큰","거버넌스 투표권","리펀드 정책 적용"],recommended:!0},{icon:"🥇",name:"Gold",power:"25,000+",allocation:"$10,000",features:["보장 할당","+3% 보너스 토큰","우선 거버넌스 투표","VIP 커뮤니티 접근","리펀드 정책 적용"]}],M=[{title:"TGE (토큰 생성)",desc:"토큰 생성 시점 즉시 해제",percent:"15%",active:!0},{title:"클리프 기간",desc:"1~3개월, 추가 해제 없음",percent:"0%"},{title:"선형 베스팅",desc:"4~15개월, 월 7.08% 해제",percent:"85%"},{title:"완전 해제",desc:"TGE 후 15개월",percent:"100%"}],R=[{label:"TGE",percent:15},{label:"3개월",percent:15},{label:"6개월",percent:36},{label:"9개월",percent:57},{label:"12개월",percent:79},{label:"15개월",percent:100}],U=[{icon:"🗳️",title:"커뮤니티 투표",desc:"DAO Power 보유자는 프로젝트 선정 및 주요 결정에 투표권을 행사할 수 있습니다."},{icon:"📊",title:"투명한 운영",desc:"모든 SHO 진행 과정과 자금 사용 내역은 온체인에서 투명하게 공개됩니다."},{icon:"🛡️",title:"리펀드 정책",desc:"TGE 후 30일 내 토큰 가격이 세일가 이하로 하락 시 100% 환불을 보장합니다."},{icon:"⚡",title:"DAO Power 스테이킹",desc:"DAO 토큰을 스테이킹하여 DAO Power를 획득하고 더 높은 티어로 승급하세요."},{icon:"🎁",title:"보상 프로그램",desc:"활발한 거버넌스 참여자에게 추가 보상과 에어드롭 기회를 제공합니다."},{icon:"🤝",title:"커뮤니티 펀드",desc:"DAO 커뮤니티가 관리하는 펀드를 통해 생태계 발전을 지원합니다."}],Y=[{q:"SHO(Strong Holder Offering)란 무엇인가요?",a:"SHO는 DAO Maker의 독점적인 토큰 세일 방식입니다. DAO Power를 보유한 사용자만 참여할 수 있으며, 보유량에 따라 티어가 결정되고 할당량이 달라집니다."},{q:"DAO Power는 어떻게 얻나요?",a:"DAO Maker 플랫폼에서 DAO 토큰을 스테이킹하여 DAO Power를 획득할 수 있습니다. 스테이킹 기간과 수량에 따라 DAO Power가 결정됩니다."},{q:"리펀드 정책은 어떻게 작동하나요?",a:"TGE 후 30일 내에 토큰 가격이 세일 가격 이하로 하락하면, 참여자는 구매한 토큰을 반환하고 100% 환불받을 수 있습니다."},{q:"최소/최대 참여 금액은 얼마인가요?",a:"최소 $100부터 참여 가능하며, 최대 참여 금액은 DAO Power 티어에 따라 달라집니다 (Bronze: $500, Silver: $2,500, Gold: $10,000)."}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:114:4","data-component-name":"div",className:"dao-maker-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:115:6","data-component-name":"style",children:`
        .dao-maker-page {
          --dao-primary: #00D4AA;
          --dao-secondary: #7B61FF;
          --dao-accent: #00B4D8;
          --dao-pink: #FF6B9D;
          --dao-dark: #0D1117;
          --dao-darker: #010409;
          --dao-card: #161B22;
          --dao-card-hover: #1C2128;
          --dao-border: #30363D;
          --dao-text: #C9D1D9;
          --dao-text-muted: #8B949E;
          --white: #FFFFFF;
          --success: #3FB950;
          --warning: #D29922;
          --danger: #F85149;
          --gradient-dao: linear-gradient(135deg, #00D4AA 0%, #7B61FF 100%);
          --gradient-sho: linear-gradient(135deg, #7B61FF 0%, #FF6B9D 100%);
          --gradient-power: linear-gradient(135deg, #00B4D8 0%, #00D4AA 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dao-darker);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.3); } 50% { box-shadow: 0 0 40px rgba(0, 212, 170, 0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes borderGlow { 0%, 100% { border-color: rgba(0, 212, 170, 0.3); } 50% { border-color: rgba(123, 97, 255, 0.5); } }
        @keyframes diamondSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.1); } 100% { transform: rotate(360deg) scale(1); } }

        .dm-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(13, 17, 23, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--dao-border);
        }

        .dm-header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dm-header-left { display: flex; align-items: center; gap: 2.5rem; }

        .dm-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .dm-logo-icon {
          width: 42px;
          height: 42px;
          background: var(--gradient-dao);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .dm-logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          background: var(--gradient-dao);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dm-nav { display: flex; gap: 0.25rem; }

        .dm-nav-item {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--dao-text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-nav-item:hover { color: var(--white); background: var(--dao-card); }
        .dm-nav-item.active { color: var(--dao-primary); background: rgba(0, 212, 170, 0.1); }

        .dm-header-right { display: flex; align-items: center; gap: 1rem; }

        .dm-power-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(123, 97, 255, 0.15);
          border: 1px solid rgba(123, 97, 255, 0.3);
          border-radius: 10px;
        }

        .dm-power-badge .icon { font-size: 1rem; color: var(--dao-secondary); }
        .dm-power-badge .label { font-size: 0.75rem; color: var(--dao-text-muted); }
        .dm-power-badge .value { font-size: 0.9rem; font-weight: 700; color: var(--dao-secondary); }

        .dm-connect-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--gradient-dao);
          border: none;
          border-radius: 10px;
          color: var(--dao-dark);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-connect-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0, 212, 170, 0.3); }

        .dm-main { padding-top: 80px; }

        .dm-hero {
          position: relative;
          padding: 3rem 2rem;
          background: var(--dao-dark);
          overflow: hidden;
        }

        .dm-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 30% 20%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(123, 97, 255, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .dm-hero-container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }

        .dm-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 2rem; font-size: 0.85rem; }
        .dm-breadcrumb a { color: var(--dao-text-muted); text-decoration: none; transition: color 0.3s; }
        .dm-breadcrumb a:hover { color: var(--dao-primary); }
        .dm-breadcrumb span { color: var(--dao-text-muted); }
        .dm-breadcrumb .current { color: var(--white); }

        .dm-project-hero { display: grid; grid-template-columns: 1fr 420px; gap: 3rem; align-items: start; }

        .dm-project-main { display: flex; flex-direction: column; gap: 2rem; }

        .dm-project-header { display: flex; align-items: flex-start; gap: 1.5rem; }

        .dm-project-logo {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50px;
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
          flex-shrink: 0;
        }

        .dm-project-info { flex: 1; }
        .dm-project-info h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; }
        .dm-project-info .tagline { color: var(--dao-text-muted); font-size: 1rem; margin-bottom: 1rem; }

        .dm-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }

        .dm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .dm-badge.sho { background: var(--gradient-sho); color: var(--white); }
        .dm-badge.live { background: rgba(63, 185, 80, 0.2); color: var(--success); border: 1px solid rgba(63, 185, 80, 0.3); }
        .dm-badge.live .dot { width: 6px; height: 6px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
        .dm-badge.refund { background: rgba(0, 180, 216, 0.15); color: var(--dao-accent); border: 1px solid rgba(0, 180, 216, 0.3); }
        .dm-badge.verified { background: rgba(0, 212, 170, 0.15); color: var(--dao-primary); border: 1px solid rgba(0, 212, 170, 0.3); }

        .dm-description { color: var(--dao-text); font-size: 1rem; line-height: 1.8; }

        .dm-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

        .dm-stat-card {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          transition: all 0.3s;
        }

        .dm-stat-card:hover { border-color: var(--dao-primary); transform: translateY(-3px); }

        .dm-stat-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .dm-stat-value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }
        .dm-stat-value.primary { color: var(--dao-primary); }
        .dm-stat-value.secondary { color: var(--dao-secondary); }
        .dm-stat-value.accent { color: var(--dao-accent); }
        .dm-stat-value.pink { color: var(--dao-pink); }
        .dm-stat-label { font-size: 0.8rem; color: var(--dao-text-muted); }

        .dm-social-row { display: flex; gap: 0.75rem; }

        .dm-social-btn {
          width: 44px;
          height: 44px;
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dao-text-muted);
          text-decoration: none;
          transition: all 0.3s;
          font-size: 1.25rem;
        }

        .dm-social-btn:hover { border-color: var(--dao-primary); color: var(--dao-primary); transform: translateY(-3px); }

        .dm-sho-card {
          background: var(--dao-card);
          border: 2px solid var(--dao-border);
          border-radius: 24px;
          overflow: hidden;
          position: sticky;
          top: 100px;
          animation: borderGlow 3s infinite;
        }

        .dm-sho-header {
          padding: 1.5rem;
          background: var(--gradient-sho);
          position: relative;
          overflow: hidden;
        }

        .dm-sho-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .dm-sho-header-content { position: relative; z-index: 1; }

        .dm-sho-title { display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem; }
        .dm-sho-title h3 { font-size: 1.25rem; font-weight: 800; }
        .dm-sho-title .diamond { font-size: 1.25rem; animation: diamondSpin 4s ease-in-out infinite; }
        .dm-sho-subtitle { font-size: 0.9rem; opacity: 0.9; }

        .dm-sho-body { padding: 1.5rem; }

        .dm-sho-countdown {
          background: var(--dao-darker);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .dm-countdown-label { font-size: 0.8rem; color: var(--dao-text-muted); text-align: center; margin-bottom: 0.75rem; }

        .dm-countdown-timer { display: flex; justify-content: center; gap: 0.75rem; }

        .dm-countdown-item { text-align: center; min-width: 60px; }

        .dm-countdown-value {
          font-size: 1.75rem;
          font-weight: 800;
          background: var(--gradient-dao);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dm-countdown-unit { font-size: 0.7rem; color: var(--dao-text-muted); text-transform: uppercase; }

        .dm-sho-progress { margin-bottom: 1.5rem; }

        .dm-progress-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .dm-progress-raised { font-size: 1.25rem; font-weight: 800; color: var(--dao-primary); }
        .dm-progress-goal { font-size: 0.9rem; color: var(--dao-text-muted); }

        .dm-progress-bar { height: 10px; background: var(--dao-darker); border-radius: 100px; overflow: hidden; margin-bottom: 0.75rem; }

        .dm-progress-fill {
          height: 100%;
          background: var(--gradient-dao);
          border-radius: 100px;
          position: relative;
          width: 45%;
        }

        .dm-progress-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .dm-progress-stats { display: flex; justify-content: space-between; font-size: 0.85rem; }
        .dm-progress-percent { color: var(--dao-primary); font-weight: 700; }
        .dm-progress-participants { color: var(--dao-text-muted); }

        .dm-sale-details { margin-bottom: 1.5rem; }

        .dm-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dm-detail-row:last-child { border-bottom: none; }
        .dm-detail-row .label { color: var(--dao-text-muted); font-size: 0.9rem; }
        .dm-detail-row .value { font-weight: 600; font-size: 0.9rem; }
        .dm-detail-row .value.highlight { color: var(--dao-primary); }

        .dm-dao-power-section {
          background: linear-gradient(135deg, rgba(123, 97, 255, 0.1), rgba(0, 212, 170, 0.05));
          border: 1px solid rgba(123, 97, 255, 0.2);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .dm-power-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .dm-power-header h4 { font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .dm-power-header h4 span { color: var(--dao-secondary); }
        .dm-power-status { font-size: 0.8rem; padding: 4px 10px; background: rgba(63, 185, 80, 0.2); border-radius: 100px; color: var(--success); font-weight: 600; }

        .dm-power-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }

        .dm-power-stat { text-align: center; padding: 0.75rem; background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
        .dm-power-stat .value { font-size: 1.25rem; font-weight: 800; color: var(--dao-secondary); }
        .dm-power-stat .label { font-size: 0.75rem; color: var(--dao-text-muted); }

        .dm-allocation { margin-bottom: 1.5rem; }
        .dm-allocation-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .dm-allocation-header .label { font-size: 0.9rem; font-weight: 600; }
        .dm-allocation-header .max { font-size: 0.8rem; color: var(--dao-primary); }

        .dm-allocation-input-wrapper { position: relative; margin-bottom: 1rem; }

        .dm-allocation-input {
          width: 100%;
          padding: 1rem;
          padding-right: 100px;
          background: var(--dao-darker);
          border: 2px solid var(--dao-border);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.25rem;
          font-weight: 700;
          transition: border-color 0.3s;
        }

        .dm-allocation-input:focus { outline: none; border-color: var(--dao-primary); }

        .dm-allocation-currency {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--dao-card);
          border-radius: 8px;
        }

        .dm-allocation-currency .icon { font-size: 1.25rem; }
        .dm-allocation-currency span { font-weight: 600; font-size: 0.85rem; }

        .dm-quick-amounts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }

        .dm-quick-amount {
          padding: 10px;
          background: var(--dao-darker);
          border: 1px solid var(--dao-border);
          border-radius: 8px;
          color: var(--dao-text);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .dm-quick-amount:hover, .dm-quick-amount.active {
          border-color: var(--dao-primary);
          color: var(--dao-primary);
          background: rgba(0, 212, 170, 0.1);
        }

        .dm-token-output {
          background: var(--dao-darker);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .dm-token-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
        .dm-token-row .label { color: var(--dao-text-muted); font-size: 0.85rem; }
        .dm-token-row .value { font-weight: 600; font-size: 0.85rem; }
        .dm-token-row .value.large { font-size: 1.125rem; color: var(--dao-primary); }
        .dm-token-row .value.bonus { color: var(--success); }

        .dm-refund-policy {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: rgba(0, 180, 216, 0.1);
          border: 1px solid rgba(0, 180, 216, 0.2);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .dm-refund-policy .icon {
          width: 40px;
          height: 40px;
          background: rgba(0, 180, 216, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dao-accent);
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .dm-refund-policy .content h5 { font-size: 0.9rem; font-weight: 700; color: var(--dao-accent); margin-bottom: 0.25rem; }
        .dm-refund-policy .content p { font-size: 0.8rem; color: var(--dao-text-muted); }

        .dm-purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: var(--gradient-dao);
          border: none;
          border-radius: 14px;
          color: var(--dao-dark);
          font-size: 1.125rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          animation: glow 2s infinite;
        }

        .dm-purchase-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0, 212, 170, 0.3); }

        .dm-security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--dao-text-muted);
        }

        .dm-security-note span { color: var(--success); }

        .dm-details-section { max-width: 1400px; margin: 0 auto; padding: 3rem 2rem; }

        .dm-section-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--dao-border);
          overflow-x: auto;
          flex-wrap: wrap;
        }

        .dm-section-tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: var(--dao-text-muted);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .dm-section-tab:hover { color: var(--white); }
        .dm-section-tab.active { background: var(--gradient-dao); color: var(--dao-dark); }

        .dm-tab-content { display: none; animation: slideUp 0.3s ease; }
        .dm-tab-content.active { display: block; }

        .dm-tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

        .dm-tier-card {
          background: var(--dao-card);
          border: 2px solid var(--dao-border);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .dm-tier-card:hover { border-color: var(--dao-primary); transform: translateY(-5px); }
        .dm-tier-card.recommended { border-color: var(--dao-secondary); }

        .dm-tier-card.recommended::before {
          content: '추천';
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          background: var(--gradient-sho);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .dm-tier-header { padding: 1.5rem; text-align: center; border-bottom: 1px solid var(--dao-border); }
        .dm-tier-icon { font-size: 3rem; margin-bottom: 0.75rem; }
        .dm-tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }
        .dm-tier-power { font-size: 0.9rem; color: var(--dao-secondary); font-weight: 600; }

        .dm-tier-body { padding: 1.5rem; }

        .dm-tier-allocation { text-align: center; padding: 1rem; background: var(--dao-darker); border-radius: 12px; margin-bottom: 1rem; }
        .dm-tier-allocation .label { font-size: 0.8rem; color: var(--dao-text-muted); margin-bottom: 0.25rem; }
        .dm-tier-allocation .value { font-size: 1.5rem; font-weight: 800; color: var(--dao-primary); }

        .dm-tier-features { display: flex; flex-direction: column; gap: 0.75rem; }
        .dm-tier-feature { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
        .dm-tier-feature span.check { color: var(--success); font-size: 0.85rem; }

        .dm-vesting-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

        .dm-vesting-card {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 20px;
          padding: 2rem;
        }

        .dm-vesting-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dm-vesting-card h3 span { color: var(--dao-primary); }

        .dm-vesting-timeline { position: relative; }

        .dm-vesting-item {
          display: flex;
          gap: 1rem;
          padding-bottom: 1.5rem;
          position: relative;
        }

        .dm-vesting-item::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 30px;
          bottom: 0;
          width: 2px;
          background: var(--dao-border);
        }

        .dm-vesting-item:last-child::before { display: none; }

        .dm-vesting-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--dao-darker);
          border: 2px solid var(--dao-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          flex-shrink: 0;
          z-index: 1;
        }

        .dm-vesting-item.active .dm-vesting-dot { background: var(--dao-primary); border-color: var(--dao-primary); color: var(--dao-dark); }

        .dm-vesting-content { flex: 1; }
        .dm-vesting-content .title { font-weight: 600; margin-bottom: 0.25rem; }
        .dm-vesting-content .desc { font-size: 0.85rem; color: var(--dao-text-muted); }
        .dm-vesting-percent { font-weight: 800; color: var(--dao-primary); }

        .dm-vesting-chart { display: flex; flex-direction: column; gap: 1rem; }

        .dm-chart-bar { display: flex; align-items: center; gap: 1rem; }
        .dm-chart-label { width: 80px; font-size: 0.85rem; color: var(--dao-text-muted); }
        .dm-chart-track { flex: 1; height: 24px; background: var(--dao-darker); border-radius: 100px; overflow: hidden; }

        .dm-chart-fill {
          height: 100%;
          background: var(--gradient-dao);
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--dao-dark);
        }

        .dm-governance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

        .dm-governance-card {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .dm-governance-card:hover { border-color: var(--dao-primary); transform: translateY(-5px); }

        .dm-governance-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 1.25rem;
          background: var(--gradient-dao);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .dm-governance-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dm-governance-card p { font-size: 0.9rem; color: var(--dao-text-muted); }

        .dm-faq-list { max-width: 900px; }

        .dm-faq-item {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .dm-faq-question {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.3s;
        }

        .dm-faq-question:hover { background: var(--dao-card-hover); }
        .dm-faq-question h4 { font-size: 1rem; font-weight: 600; }
        .dm-faq-question .arrow { color: var(--dao-primary); transition: transform 0.3s; }
        .dm-faq-item.active .dm-faq-question .arrow { transform: rotate(180deg); }

        .dm-faq-answer {
          padding: 0 1.25rem;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s;
        }

        .dm-faq-item.active .dm-faq-answer { padding: 0 1.25rem 1.25rem; max-height: 500px; }
        .dm-faq-answer p { color: var(--dao-text-muted); line-height: 1.8; }

        .dm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .dm-modal {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 24px;
          width: 100%;
          max-width: 450px;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .dm-modal-header {
          padding: 1.5rem;
          background: var(--gradient-dao);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dm-modal-header h3 { font-size: 1.25rem; font-weight: 800; color: var(--dao-dark); }

        .dm-modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.2);
          border: none;
          color: var(--dao-dark);
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-modal-close:hover { background: rgba(0, 0, 0, 0.3); }

        .dm-modal-body { padding: 2rem; text-align: center; }

        .dm-modal-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .dm-modal-icon.pending { background: rgba(0, 212, 170, 0.2); }
        .dm-modal-icon.success { background: rgba(63, 185, 80, 0.2); color: var(--success); }

        .dm-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 212, 170, 0.3);
          border-top-color: var(--dao-primary);
          border-radius: 50%;
          animation: rotate 1s linear infinite;
        }

        .dm-modal-body h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dm-modal-body p { color: var(--dao-text-muted); margin-bottom: 1.5rem; }

        .dm-modal-details {
          background: var(--dao-darker);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .dm-modal-detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; }
        .dm-modal-detail-row .label { color: var(--dao-text-muted); }
        .dm-modal-detail-row .value { font-weight: 600; }

        .dm-modal-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: var(--gradient-dao);
          border: none;
          border-radius: 12px;
          color: var(--dao-dark);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-modal-btn:hover { transform: scale(1.02); }

        .dm-footer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          border-top: 1px solid var(--dao-border);
        }

        .dm-footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .dm-footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .dm-footer-links a { color: var(--dao-text-muted); text-decoration: none; font-size: 0.85rem; transition: color 0.3s; }
        .dm-footer-links a:hover { color: var(--dao-primary); }
        .dm-footer-copyright { color: var(--dao-text-muted); font-size: 0.85rem; }

        @media (max-width: 1200px) {
          .dm-project-hero { grid-template-columns: 1fr; }
          .dm-sho-card { position: static; margin-top: 2rem; }
          .dm-vesting-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .dm-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dm-tiers-grid { grid-template-columns: repeat(2, 1fr); }
          .dm-governance-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .dm-header-container { padding: 0.75rem 1rem; }
          .dm-nav, .dm-power-badge { display: none; }
          .dm-hero { padding: 2rem 1rem; }
          .dm-project-header { flex-direction: column; text-align: center; }
          .dm-badges { justify-content: center; }
          .dm-social-row { justify-content: center; }
          .dm-stats-grid { grid-template-columns: 1fr 1fr; }
          .dm-tiers-grid { grid-template-columns: 1fr; }
          .dm-quick-amounts { grid-template-columns: repeat(2, 1fr); }
          .dm-footer-content { flex-direction: column; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:115,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:971:6","data-component-name":"header",className:"dm-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:972:8","data-component-name":"div",className:"dm-header-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:973:10","data-component-name":"div",className:"dm-header-left",children:[e.jsxDEV(N,{"data-replit-metadata":"client/src/pages/dao-maker.tsx:974:12","data-component-name":"Link",href:"/",className:"dm-logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:975:14","data-component-name":"div",className:"dm-logo-icon",children:"💎"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:975,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:976:14","data-component-name":"div",className:"dm-logo-text",children:"DAO Maker"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:976,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:974,columnNumber:13},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:978:12","data-component-name":"nav",className:"dm-nav",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:979:14","data-component-name":"button",className:"dm-nav-item active",children:"SHO"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:979,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:980:14","data-component-name":"button",className:"dm-nav-item",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:980,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:981:14","data-component-name":"button",className:"dm-nav-item",children:"거버넌스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:981,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:982:14","data-component-name":"button",className:"dm-nav-item",children:"포트폴리오"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:982,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:983:14","data-component-name":"button",className:"dm-nav-item",children:"스왑"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:983,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:978,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:973,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:986:10","data-component-name":"div",className:"dm-header-right",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:987:12","data-component-name":"div",className:"dm-power-badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:988:14","data-component-name":"span",className:"icon",children:"⚡"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:988,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:989:14","data-component-name":"div",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:990:16","data-component-name":"div",className:"label",children:"DAO Power"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:990,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:991:16","data-component-name":"div",className:"value",children:"12,500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:991,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:989,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:987,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:994:12","data-component-name":"button",className:"dm-connect-btn",onClick:()=>k?O():A("metamask"),"data-testid":"button-wallet-connect",children:["💳 ",k?q(S||""):"지갑 연결"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:994,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:986,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:972,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:971,columnNumber:7},this),e.jsxDEV("main",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1006:6","data-component-name":"main",className:"dm-main",children:[e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1008:8","data-component-name":"section",className:"dm-hero",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1009:10","data-component-name":"div",className:"dm-hero-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1010:12","data-component-name":"div",className:"dm-breadcrumb",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1011:14","data-component-name":"a",href:"#",children:"SHO"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1011,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1012:14","data-component-name":"span",children:"/"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1012,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1013:14","data-component-name":"span",className:"current",children:"TBURN Chain"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1013,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1010,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1016:12","data-component-name":"div",className:"dm-project-hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1018:14","data-component-name":"div",className:"dm-project-main",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1019:16","data-component-name":"div",className:"dm-project-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1020:18","data-component-name":"div",className:"dm-project-logo",children:"🔥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1020,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1021:18","data-component-name":"div",className:"dm-project-info",children:[e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1022:20","data-component-name":"h1",children:"TBURN Chain"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1022,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1023:20","data-component-name":"p",className:"tagline",children:"AI-Enhanced Blockchain Platform · Layer 1"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1023,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1024:20","data-component-name":"div",className:"dm-badges",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1025:22","data-component-name":"span",className:"dm-badge sho",children:"💎 SHO Round"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1025,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1026:22","data-component-name":"span",className:"dm-badge live",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1026:54","data-component-name":"span",className:"dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1026,columnNumber:144},this),"진행 중"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1026,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1027:22","data-component-name":"span",className:"dm-badge refund",children:"🛡️ 리펀드 보장"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1027,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1028:22","data-component-name":"span",className:"dm-badge verified",children:"✓ 검증됨"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1028,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1024,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1021,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1019,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1033:16","data-component-name":"p",className:"dm-description",children:"TBURN Chain은 AI와 블록체인 기술을 융합한 차세대 레이어-1 플랫폼입니다. 200,000+ TPS의 초고속 처리, Triple-Band AI Orchestration, 자가 최적화 네트워크를 통해 엔터프라이즈급 성능과 탈중앙화를 동시에 실현합니다. DAO Maker의 Strong Holder Offering을 통해 DAO Power 보유자에게 우선 참여 기회를 제공합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1033,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1040:16","data-component-name":"div",className:"dm-stats-grid","data-testid":"dao-maker-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1041:18","data-component-name":"div",className:"dm-stat-card","data-testid":"stat-token-price",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1042:20","data-component-name":"div",className:"dm-stat-icon",children:"💰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1042,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1043:20","data-component-name":"div",className:"dm-stat-value primary",children:"$0.020"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1043,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1044:20","data-component-name":"div",className:"dm-stat-label",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1044,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1041,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1046:18","data-component-name":"div",className:"dm-stat-card","data-testid":"stat-target",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1047:20","data-component-name":"div",className:"dm-stat-icon",children:"🎯"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1047,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1048:20","data-component-name":"div",className:"dm-stat-value secondary",children:P?"...":(x==null?void 0:x.totalRaised)||"$12M"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1048,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1051:20","data-component-name":"div",className:"dm-stat-label",children:"목표 모집액"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1051,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1046,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1053:18","data-component-name":"div",className:"dm-stat-card","data-testid":"stat-tge",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1054:20","data-component-name":"div",className:"dm-stat-icon",children:"🔓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1054,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1055:20","data-component-name":"div",className:"dm-stat-value accent",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1055,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1056:20","data-component-name":"div",className:"dm-stat-label",children:"TGE 해제"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1056,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1053,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1058:18","data-component-name":"div",className:"dm-stat-card","data-testid":"stat-vesting",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1059:20","data-component-name":"div",className:"dm-stat-icon",children:"⏱️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1059,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1060:20","data-component-name":"div",className:"dm-stat-value pink",children:"15개월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1060,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1061:20","data-component-name":"div",className:"dm-stat-label",children:"총 베스팅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1061,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1058,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1040,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1065:16","data-component-name":"div",className:"dm-social-row",children:["🐦","📱","💬","📝","💻","🌐"].map((a,r)=>e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1067:20","data-component-name":"a",href:"#",className:"dm-social-btn",children:a},r,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1067,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1065,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1018,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1073:14","data-component-name":"div",className:"dm-sho-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1074:16","data-component-name":"div",className:"dm-sho-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1075:18","data-component-name":"div",className:"dm-sho-header-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1076:20","data-component-name":"div",className:"dm-sho-title",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1077:22","data-component-name":"span",className:"diamond",children:"💎"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1077,columnNumber:23},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1078:22","data-component-name":"h3",children:"Strong Holder Offering"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1078,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1076,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1080:20","data-component-name":"p",className:"dm-sho-subtitle",children:"DAO Power 보유자 전용 토큰 세일"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1080,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1075,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1074,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1084:16","data-component-name":"div",className:"dm-sho-body",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1086:18","data-component-name":"div",className:"dm-sho-countdown",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1087:20","data-component-name":"div",className:"dm-countdown-label",children:"세일 종료까지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1087,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1088:20","data-component-name":"div",className:"dm-countdown-timer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1089:22","data-component-name":"div",className:"dm-countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1090:24","data-component-name":"div",className:"dm-countdown-value",children:l.days.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1090,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1091:24","data-component-name":"div",className:"dm-countdown-unit",children:"Days"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1091,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1089,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1093:22","data-component-name":"div",className:"dm-countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1094:24","data-component-name":"div",className:"dm-countdown-value",children:l.hours.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1094,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1095:24","data-component-name":"div",className:"dm-countdown-unit",children:"Hours"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1095,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1093,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1097:22","data-component-name":"div",className:"dm-countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1098:24","data-component-name":"div",className:"dm-countdown-value",children:l.minutes.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1098,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1099:24","data-component-name":"div",className:"dm-countdown-unit",children:"Mins"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1099,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1097,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1101:22","data-component-name":"div",className:"dm-countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1102:24","data-component-name":"div",className:"dm-countdown-value",children:l.seconds.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1102,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1103:24","data-component-name":"div",className:"dm-countdown-unit",children:"Secs"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1103,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1101,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1088,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1086,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1109:18","data-component-name":"div",className:"dm-sho-progress","data-testid":"sho-progress",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1110:20","data-component-name":"div",className:"dm-progress-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1111:22","data-component-name":"div",className:"dm-progress-raised",children:"$5,400,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1111,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1112:22","data-component-name":"div",className:"dm-progress-goal",children:"/ $12,000,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1112,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1110,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1114:20","data-component-name":"div",className:"dm-progress-bar",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1115:22","data-component-name":"div",className:"dm-progress-fill"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1115,columnNumber:23},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1114,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1117:20","data-component-name":"div",className:"dm-progress-stats",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1118:22","data-component-name":"span",className:"dm-progress-percent",children:"45% 완료"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1118,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1119:22","data-component-name":"span",className:"dm-progress-participants",children:"5,847명 참여"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1119,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1117,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1109,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1124:18","data-component-name":"div",className:"dm-sale-details",children:[{label:"토큰 가격",value:"$0.020",highlight:!0},{label:"최소 참여",value:"$100"},{label:"TGE 해제",value:"15%",highlight:!0},{label:"베스팅",value:"3개월 클리프 + 12개월"}].map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1131:22","data-component-name":"div",className:"dm-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1132:24","data-component-name":"span",className:"label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1132,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1133:24","data-component-name":"span",className:`value ${a.highlight?"highlight":""}`,children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1133,columnNumber:25},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1131,columnNumber:23},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1124,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1139:18","data-component-name":"div",className:"dm-dao-power-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1140:20","data-component-name":"div",className:"dm-power-header",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1141:22","data-component-name":"h4",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1141:26","data-component-name":"span",children:"⚡"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1141,columnNumber:114},this)," 내 DAO Power"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1141,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1142:22","data-component-name":"span",className:"dm-power-status",children:[D," Tier"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1142,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1140,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1144:20","data-component-name":"div",className:"dm-power-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1145:22","data-component-name":"div",className:"dm-power-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1146:24","data-component-name":"div",className:"value",children:"12,500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1146,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1147:24","data-component-name":"div",className:"label",children:"DAO Power"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1147,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1145,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1149:22","data-component-name":"div",className:"dm-power-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1150:24","data-component-name":"div",className:"value",children:["$",p.toLocaleString()]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1150,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1151:24","data-component-name":"div",className:"label",children:"최대 할당"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1151,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1149,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1144,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1139,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1157:18","data-component-name":"div",className:"dm-allocation",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1158:20","data-component-name":"div",className:"dm-allocation-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1159:22","data-component-name":"span",className:"label",children:"참여 금액"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1159,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1160:22","data-component-name":"span",className:"max",children:["최대: $",p.toLocaleString()]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1160,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1158,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1162:20","data-component-name":"div",className:"dm-allocation-input-wrapper",children:[e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1163:22","data-component-name":"input",type:"number",className:"dm-allocation-input",value:s,onChange:a=>v(Math.min(Number(a.target.value)||0,p)),"data-testid":"input-allocation"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1163,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1170:22","data-component-name":"div",className:"dm-allocation-currency",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1171:24","data-component-name":"span",className:"icon",children:"💵"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1171,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1172:24","data-component-name":"span",children:"USDT"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1172,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1170,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1162,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1175:20","data-component-name":"div",className:"dm-quick-amounts",children:G.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1177:24","data-component-name":"div",className:`dm-quick-amount ${s===a?"active":""}`,onClick:()=>v(a),children:a===p?"MAX":`$${a.toLocaleString()}`},a,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1177,columnNumber:25},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1175,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1157,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1189:18","data-component-name":"div",className:"dm-token-output",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1190:20","data-component-name":"div",className:"dm-token-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1191:22","data-component-name":"span",className:"label",children:"받을 토큰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1191,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1192:22","data-component-name":"span",className:"value large",children:[b.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1192,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1190,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1194:20","data-component-name":"div",className:"dm-token-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1195:22","data-component-name":"span",className:"label",children:["보너스 (+",j,"%)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1195,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1196:22","data-component-name":"span",className:"value bonus",children:["+",V.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1196,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1194,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1198:20","data-component-name":"div",className:"dm-token-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1199:22","data-component-name":"span",className:"label",children:"TGE 해제 (15%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1199,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1200:22","data-component-name":"span",className:"value",children:[y.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1200,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1198,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1189,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1205:18","data-component-name":"div",className:"dm-refund-policy",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1206:20","data-component-name":"div",className:"icon",children:"🛡️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1206,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1207:20","data-component-name":"div",className:"content",children:[e.jsxDEV("h5",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1208:22","data-component-name":"h5",children:"리펀드 정책 적용"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1208,columnNumber:23},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1209:22","data-component-name":"p",children:"TGE 후 30일 내 토큰 가격이 세일가 이하 시 100% 환불"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1209,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1207,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1205,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1213:18","data-component-name":"button",className:"dm-purchase-btn",onClick:L,"data-testid":"button-purchase",children:"💎 SHO 참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1213,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1217:18","data-component-name":"div",className:"dm-security-note",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1218:20","data-component-name":"span",children:"🔒"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1218,columnNumber:21},this)," DAO Maker 스마트 컨트랙트로 안전하게 처리"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1217,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1084,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1073,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1016,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1009,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1008,columnNumber:9},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1227:8","data-component-name":"section",className:"dm-details-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1228:10","data-component-name":"div",className:"dm-section-tabs",children:[{id:"tiers",label:"SHO 티어"},{id:"vesting",label:"베스팅"},{id:"governance",label:"거버넌스"},{id:"faq",label:"FAQ"}].map(a=>e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1235:14","data-component-name":"button",className:`dm-section-tab ${i===a.id?"active":""}`,onClick:()=>T(a.id),children:a.label},a.id,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1235,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1228,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1246:10","data-component-name":"div",className:`dm-tab-content ${i==="tiers"?"active":""}`,children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1247:12","data-component-name":"div",className:"dm-tiers-grid",children:H.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1249:16","data-component-name":"div",className:`dm-tier-card ${a.recommended?"recommended":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1250:18","data-component-name":"div",className:"dm-tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1251:20","data-component-name":"div",className:"dm-tier-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1251,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1252:20","data-component-name":"div",className:"dm-tier-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1252,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1253:20","data-component-name":"div",className:"dm-tier-power",children:[a.power," DAO Power"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1253,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1250,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1255:18","data-component-name":"div",className:"dm-tier-body",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1256:20","data-component-name":"div",className:"dm-tier-allocation",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1257:22","data-component-name":"div",className:"label",children:"최대 할당"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1257,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1258:22","data-component-name":"div",className:"value",children:a.allocation},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1258,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1256,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1260:20","data-component-name":"div",className:"dm-tier-features",children:a.features.map((m,t)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1262:24","data-component-name":"div",className:"dm-tier-feature",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1263:26","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1263,columnNumber:27},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1264:26","data-component-name":"span",children:m},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1264,columnNumber:27},this)]},t,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1262,columnNumber:25},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1260,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1255,columnNumber:19},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1249,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1247,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1246,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1275:10","data-component-name":"div",className:`dm-tab-content ${i==="vesting"?"active":""}`,children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1276:12","data-component-name":"div",className:"dm-vesting-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1277:14","data-component-name":"div",className:"dm-vesting-card",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1278:16","data-component-name":"h3",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1278:20","data-component-name":"span",children:"📅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1278,columnNumber:108},this)," 베스팅 스케줄"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1278,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1279:16","data-component-name":"div",className:"dm-vesting-timeline",children:M.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1281:20","data-component-name":"div",className:`dm-vesting-item ${a.active?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1282:22","data-component-name":"div",className:"dm-vesting-dot",children:a.active?"✓":r+1},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1282,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1283:22","data-component-name":"div",className:"dm-vesting-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1284:24","data-component-name":"div",className:"title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1284,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1285:24","data-component-name":"div",className:"desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1285,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1283,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1287:22","data-component-name":"div",className:"dm-vesting-percent",children:a.percent},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1287,columnNumber:23},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1281,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1279,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1277,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1293:14","data-component-name":"div",className:"dm-vesting-card",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1294:16","data-component-name":"h3",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1294:20","data-component-name":"span",children:"📊"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1294,columnNumber:108},this)," 해제 현황"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1294,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1295:16","data-component-name":"div",className:"dm-vesting-chart",children:R.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1297:20","data-component-name":"div",className:"dm-chart-bar",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1298:22","data-component-name":"div",className:"dm-chart-label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1298,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1299:22","data-component-name":"div",className:"dm-chart-track",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1300:24","data-component-name":"div",className:"dm-chart-fill",style:{width:`${a.percent}%`},children:[a.percent,"%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1300,columnNumber:25},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1299,columnNumber:23},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1297,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1295,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1293,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1276,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1275,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1310:10","data-component-name":"div",className:`dm-tab-content ${i==="governance"?"active":""}`,children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1311:12","data-component-name":"div",className:"dm-governance-grid",children:U.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1313:16","data-component-name":"div",className:"dm-governance-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1314:18","data-component-name":"div",className:"dm-governance-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1314,columnNumber:19},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1315:18","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1315,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1316:18","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1316,columnNumber:19},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1313,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1311,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1310,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1323:10","data-component-name":"div",className:`dm-tab-content ${i==="faq"?"active":""}`,children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1324:12","data-component-name":"div",className:"dm-faq-list",children:Y.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1326:16","data-component-name":"div",className:`dm-faq-item ${w===r?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1327:18","data-component-name":"div",className:"dm-faq-question",onClick:()=>B(w===r?-1:r),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1328:20","data-component-name":"h4",children:a.q},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1328,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1329:20","data-component-name":"span",className:"arrow",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1329,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1327,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1331:18","data-component-name":"div",className:"dm-faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1332:20","data-component-name":"p",children:a.a},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1332,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1331,columnNumber:19},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1326,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1324,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1323,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1227,columnNumber:9},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1341:8","data-component-name":"footer",className:"dm-footer",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1342:10","data-component-name":"div",className:"dm-footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1343:12","data-component-name":"div",className:"dm-footer-links",children:[e.jsxDEV(N,{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1344:14","data-component-name":"Link",href:"/legal/terms-of-service",children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1344,columnNumber:15},this),e.jsxDEV(N,{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1345:14","data-component-name":"Link",href:"/legal/privacy-policy",children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1345,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1346:14","data-component-name":"a",href:"#",children:"리스크 고지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1346,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1347:14","data-component-name":"a",href:"#",children:"고객 지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1347,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1343,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1349:12","data-component-name":"div",className:"dm-footer-copyright",children:"© 2025 DAO Maker. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1349,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1342,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1341,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1006,columnNumber:7},this),$&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1356:8","data-component-name":"div",className:"dm-modal-overlay",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1357:10","data-component-name":"div",className:"dm-modal",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1358:12","data-component-name":"div",className:"dm-modal-header",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1359:14","data-component-name":"h3",children:o==="success"?"SHO 참여 완료!":"처리 중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1359,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1360:14","data-component-name":"button",className:"dm-modal-close",onClick:()=>u(!1),children:"✕"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1360,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1358,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1362:12","data-component-name":"div",className:"dm-modal-body",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1363:14","data-component-name":"div",className:`dm-modal-icon ${o}`,children:o==="pending"?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1364:45","data-component-name":"div",className:"dm-spinner"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1364,columnNumber:46},this):"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1363,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1366:14","data-component-name":"h4",children:o==="success"?"Strong Holder Offering 참여 완료!":"스마트 컨트랙트 처리 중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1366,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1367:14","data-component-name":"p",children:o==="success"?"TGE 시점에 토큰이 지급됩니다":"잠시만 기다려주세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1367,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1369:14","data-component-name":"div",className:"dm-modal-details",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1370:16","data-component-name":"div",className:"dm-modal-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1371:18","data-component-name":"span",className:"label",children:"참여 금액"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1371,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1372:18","data-component-name":"span",className:"value",children:["$",s.toLocaleString()," USDT"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1372,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1370,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1374:16","data-component-name":"div",className:"dm-modal-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1375:18","data-component-name":"span",className:"label",children:"받을 토큰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1375,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1376:18","data-component-name":"span",className:"value",children:[b.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1376,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1374,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1378:16","data-component-name":"div",className:"dm-modal-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1379:18","data-component-name":"span",className:"label",children:"TGE 해제"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1379,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1380:18","data-component-name":"span",className:"value",children:[y.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1380,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1378,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1382:16","data-component-name":"div",className:"dm-modal-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1383:18","data-component-name":"span",className:"label",children:"DAO Tier"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1383,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1384:18","data-component-name":"span",className:"value",children:D},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1384,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1382,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1369,columnNumber:15},this),o==="success"&&e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/dao-maker.tsx:1389:16","data-component-name":"button",className:"dm-modal-btn",onClick:()=>u(!1),children:"확인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1389,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1362,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1357,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:1356,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/dao-maker.tsx",lineNumber:114,columnNumber:5},this)}export{Z as default};
