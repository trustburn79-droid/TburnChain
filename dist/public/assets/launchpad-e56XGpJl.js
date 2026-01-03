import{r as s,j as e}from"./index-CWUIpzf8.js";import{d as G,L as l}from"./index-CIRYVphb.js";import{ac as H,n as Q}from"./tburn-loader-DzbfkJu3.js";import"./i18nInstance-DCxlOlkw.js";function ee(){const{isConnected:i,address:z,connect:j,disconnect:S,formatAddress:C}=H(),[t,$]=s.useState(!1),[n,b]=s.useState(i?2:1),[E,B]=s.useState("usdt"),[r,D]=s.useState(1e3),[T,v]=s.useState(!1),[c,V]=s.useState("pending"),[h,F]=s.useState({days:14,hours:8,minutes:32,seconds:45}),{data:f,isLoading:L}=G({queryKey:["/api/token-programs/launchpad/stats"]}),w=f==null?void 0:f.data;s.useEffect(()=>{i&&b(2)},[i]),s.useEffect(()=>{const a=setInterval(()=>{F(o=>{let{days:N,hours:m,minutes:p,seconds:u}=o;return u--,u<0&&(u=59,p--),p<0&&(p=59,m--),m<0&&(m=23,N--),N<0&&(N=0,m=0,p=0,u=0),{days:N,hours:m,minutes:p,seconds:u}})},1e3);return()=>clearInterval(a)},[]);const R=.02,A=.08,d=(a=>a>=5e4?{percent:5,tier:"Whale",icon:"🐋"}:a>=1e4?{percent:3,tier:"Dolphin",icon:"🐬"}:a>=1e3?{percent:1,tier:"Fish",icon:"🐟"}:{percent:0,tier:"Shrimp",icon:"🦐"})(r),k=r/R,y=k*(d.percent/100),g=k+y,U=g*.15,I=g*A,x=async()=>{await j("metamask")},Y=()=>{setTimeout(()=>{$(!0),b(3)},1500)},q=()=>{!isWalletConnected||!t||r<100||(v(!0),V("pending"),setTimeout(()=>{V("success"),b(4)},3e3))},K=[{id:"whale",icon:"🐋",name:"Whale",bonus:"+5%",range:"$50,000 이상"},{id:"dolphin",icon:"🐬",name:"Dolphin",bonus:"+3%",range:"$10,000 ~ $49,999"},{id:"fish",icon:"🐟",name:"Fish",bonus:"+1%",range:"$1,000 ~ $9,999"},{id:"shrimp",icon:"🦐",name:"Shrimp",bonus:"-",range:"$100 ~ $999"}],P=[{label:"토큰 가격",value:"$0.020",highlight:!0},{label:"총 세일 물량",value:"6억 TBURN"},{label:"최소 참여",value:"$100"},{label:"TGE 해제",value:"15%",success:!0},{label:"클리프",value:"3개월"},{label:"베스팅",value:"12개월"},{label:"네트워크",value:"Ethereum"}],W=["TBURN Foundation 공식 보장","안전한 스마트 컨트랙트","모든 티어 보너스 적용","24/7 고객 지원","실시간 토큰 클레임"],M=[100,500,1e3,5e3,1e4];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:131:4","data-component-name":"div",className:"launchpad-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/launchpad.tsx:132:6","data-component-name":"style",children:`
        .launchpad-page {
          --gold: #D4AF37;
          --dark: #0F172A;
          --dark-card: #1E293B;
          --dark-lighter: #334155;
          --gray: #64748B;
          --light-gray: #94A3B8;
          --white: #FFFFFF;
          --success: #22C55E;
          --warning: #F59E0B;
          --danger: #EF4444;
          --purple: #8B5CF6;
          --blue: #3B82F6;
          --cyan: #06B6D4;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-blue: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          --gradient-success: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }

        .lp-header {
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
          width: 44px;
          height: 44px;
          background: var(--gradient-gold);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text { font-size: 1.25rem; font-weight: 800; color: var(--white); }
        .logo-text span { color: var(--gold); }

        .header-right { display: flex; align-items: center; gap: 1.5rem; }

        .header-stats { display: flex; gap: 2rem; }

        .header-stat { text-align: right; }
        .header-stat .label { font-size: 0.7rem; color: var(--gray); text-transform: uppercase; }
        .header-stat .value { font-size: 0.9rem; font-weight: 700; color: var(--white); }
        .header-stat .value.live { color: var(--success); }

        .wallet-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: var(--gradient-blue);
          border: none;
          border-radius: 12px;
          color: var(--white);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .wallet-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }

        .wallet-btn.connected {
          background: var(--dark-card);
          border: 1px solid var(--success);
        }

        .main-content {
          padding: 100px 2rem 60px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sale-header { text-align: center; margin-bottom: 3rem; }

        .official-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.85rem;
          color: var(--success);
          margin-bottom: 1.5rem;
        }

        .sale-header h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.75rem; }

        .sale-header h1 .highlight {
          background: var(--gradient-blue);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sale-header p { color: var(--light-gray); font-size: 1.1rem; }

        .countdown-section {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .countdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .countdown-title { display: flex; align-items: center; gap: 10px; }
        .countdown-title h3 { font-size: 1.125rem; font-weight: 700; }

        .live-dot {
          width: 10px;
          height: 10px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .sale-phase {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(34, 197, 94, 0.2);
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--success);
        }

        .countdown-timer {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .countdown-item { text-align: center; }

        .countdown-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--white);
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          min-width: 80px;
        }

        .countdown-unit { font-size: 0.75rem; color: var(--gray); margin-top: 0.5rem; text-transform: uppercase; }

        .progress-section {
          background: var(--dark-card);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header .raised { font-size: 1.5rem; font-weight: 800; color: var(--blue); }
        .progress-header .goal { color: var(--gray); }

        .progress-bar-container {
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--gradient-blue);
          border-radius: 100px;
          width: 45%;
          position: relative;
        }

        .progress-bar-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .progress-stats .percent { color: var(--blue); font-weight: 700; }
        .progress-stats .tokens { color: var(--light-gray); }

        .launchpad-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          margin-top: 2rem;
        }

        .purchase-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .purchase-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .purchase-header h3 { font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }

        .purchase-body { padding: 1.5rem; }

        .steps-indicator {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
        }

        .steps-indicator::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          background: var(--dark);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }

        .step-item.completed .step-number {
          background: var(--success);
          border-color: var(--success);
        }

        .step-item.active .step-number {
          background: var(--blue);
          border-color: var(--blue);
          animation: glow 2s infinite;
        }

        .step-label { font-size: 0.75rem; color: var(--gray); text-align: center; }
        .step-item.completed .step-label, .step-item.active .step-label { color: var(--white); }

        .form-section { margin-bottom: 1.5rem; animation: slideIn 0.3s ease; }

        .form-section-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--light-gray);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .wallet-section.connected {
          border-style: solid;
          border-color: var(--success);
          background: rgba(34, 197, 94, 0.05);
        }

        .wallet-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .wallet-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 1.25rem;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .wallet-option:hover {
          border-color: var(--blue);
          transform: translateY(-3px);
        }

        .wallet-option .icon { font-size: 2rem; }
        .wallet-option span { font-size: 0.85rem; font-weight: 600; }

        .connected-wallet {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .connected-wallet .avatar {
          width: 50px;
          height: 50px;
          background: var(--gradient-blue);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .connected-wallet .info h4 { font-size: 1rem; font-weight: 700; color: var(--success); }
        .connected-wallet .info p { font-size: 0.85rem; color: var(--gray); font-family: monospace; }

        .kyc-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .kyc-status { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }

        .kyc-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .kyc-icon.pending { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
        .kyc-icon.verified { background: rgba(34, 197, 94, 0.2); color: var(--success); }

        .kyc-info h4 { font-size: 1rem; font-weight: 700; }
        .kyc-info p { font-size: 0.85rem; color: var(--gray); }

        .kyc-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background: var(--gradient-blue);
          border: none;
          border-radius: 10px;
          color: var(--white);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .kyc-btn:hover { transform: scale(1.02); }
        .kyc-btn.verified { background: var(--success); cursor: default; }

        .amount-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .amount-input-group { position: relative; margin-bottom: 1rem; }

        .amount-input {
          width: 100%;
          padding: 1.25rem 1rem;
          padding-right: 100px;
          background: var(--dark);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.5rem;
          font-weight: 700;
          transition: border-color 0.3s;
        }

        .amount-input:focus { outline: none; border-color: var(--blue); }

        .amount-currency {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--dark-lighter);
          border-radius: 8px;
        }

        .amount-currency .icon { font-size: 1.25rem; }
        .amount-currency span { font-size: 0.9rem; font-weight: 600; }

        .quick-amounts { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }

        .quick-amount {
          flex: 1;
          min-width: 60px;
          padding: 10px;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--light-gray);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .quick-amount:hover, .quick-amount.active {
          border-color: var(--blue);
          color: var(--blue);
          background: rgba(59, 130, 246, 0.1);
        }

        .token-output {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .token-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .token-row:last-child { border-bottom: none; }
        .token-row .label { color: var(--gray); font-size: 0.9rem; }
        .token-row .value { font-weight: 700; }
        .token-row .value.highlight { color: var(--blue); font-size: 1.25rem; }
        .token-row .value.bonus { color: var(--success); }
        .token-row .value.gold { color: var(--gold); }

        .payment-methods {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .payment-method {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 1rem;
          background: var(--dark);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .payment-method:hover { border-color: rgba(255, 255, 255, 0.3); }
        .payment-method.active { border-color: var(--blue); background: rgba(59, 130, 246, 0.1); }
        .payment-method .icon { font-size: 1.5rem; }
        .payment-method span { font-size: 0.85rem; font-weight: 600; }

        .purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 18px;
          background: var(--gradient-blue);
          border: none;
          border-radius: 14px;
          color: var(--white);
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1.5rem;
        }

        .purchase-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.3);
        }

        .purchase-btn:disabled { background: var(--gray); cursor: not-allowed; }

        .info-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

        .info-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
        }

        .info-card-header {
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-card-header h4 { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }

        .info-card-body { padding: 1.25rem; }

        .token-info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .token-info-item:last-child { border-bottom: none; }
        .token-info-item .label { color: var(--gray); font-size: 0.9rem; }
        .token-info-item .value { font-weight: 600; font-size: 0.9rem; }
        .token-info-item .value.highlight { color: var(--blue); }
        .token-info-item .value.success { color: var(--success); }

        .tier-card {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }

        .tier-card:last-child { margin-bottom: 0; }
        .tier-card.active { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); }

        .tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .tier-name { display: flex; align-items: center; gap: 8px; font-weight: 700; }
        .tier-name .icon { font-size: 1.25rem; }

        .tier-bonus {
          padding: 4px 10px;
          background: rgba(34, 197, 94, 0.2);
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--success);
        }

        .tier-bonus.disabled { background: rgba(100,116,139,0.2); color: var(--gray); }

        .tier-range { font-size: 0.85rem; color: var(--gray); }

        .vesting-visual { display: flex; flex-direction: column; gap: 1rem; }

        .vesting-item { display: flex; align-items: center; gap: 1rem; }

        .vesting-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--blue);
          position: relative;
        }

        .vesting-dot::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 100%;
          width: 2px;
          height: 30px;
          background: rgba(59, 130, 246, 0.3);
          transform: translateX(-50%);
        }

        .vesting-item:last-child .vesting-dot::after { display: none; }
        .vesting-item.tge .vesting-dot { background: var(--success); }
        .vesting-item.cliff .vesting-dot { background: var(--warning); }

        .vesting-info { flex: 1; }
        .vesting-info .title { font-weight: 600; font-size: 0.9rem; }
        .vesting-info .desc { font-size: 0.8rem; color: var(--gray); }
        .vesting-amount { font-weight: 700; color: var(--blue); }

        .features-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }

        .feature-check { color: var(--success); font-size: 0.9rem; }
        .feature-item span { font-size: 0.9rem; }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          animation: slideIn 0.3s ease;
        }

        .modal-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 { font-size: 1.25rem; font-weight: 700; }

        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--gray);
          cursor: pointer;
          transition: all 0.3s;
        }

        .modal-close:hover { background: rgba(255, 255, 255, 0.1); color: var(--white); }

        .modal-body { padding: 2rem; text-align: center; }

        .tx-status-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .tx-status-icon.pending { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
        .tx-status-icon.success { background: rgba(34, 197, 94, 0.2); color: var(--success); }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(59, 130, 246, 0.3);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .modal-body h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .modal-body p { color: var(--gray); margin-bottom: 1.5rem; }

        .tx-details {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .tx-detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; }
        .tx-detail-row .label { color: var(--gray); }
        .tx-detail-row .value { font-weight: 600; }

        .modal-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: var(--gradient-blue);
          border: none;
          border-radius: 12px;
          color: var(--white);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .modal-btn:hover { transform: scale(1.02); }

        .footer {
          margin-top: 4rem;
          padding: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .footer-links { display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem; }
        .footer-links a { color: var(--gray); text-decoration: none; font-size: 0.9rem; transition: color 0.3s; }
        .footer-links a:hover { color: var(--blue); }
        .footer p { color: var(--gray); font-size: 0.85rem; }

        @media (max-width: 1024px) {
          .launchpad-grid { grid-template-columns: 1fr; }
          .header-stats { display: none; }
        }

        @media (max-width: 768px) {
          .main-content { padding: 90px 1rem 40px; }
          .countdown-timer { gap: 0.75rem; flex-wrap: wrap; }
          .countdown-value { font-size: 1.75rem; padding: 0.5rem 0.75rem; min-width: 60px; }
          .wallet-options { grid-template-columns: 1fr; }
          .payment-methods { grid-template-columns: 1fr; }
          .steps-indicator::before { display: none; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:132,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/launchpad.tsx:940:6","data-component-name":"header",className:"lp-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:941:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(l,{"data-replit-metadata":"client/src/pages/launchpad.tsx:942:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:943:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(Q,{"data-replit-metadata":"client/src/pages/launchpad.tsx:944:14","data-component-name":"TBurnLogo",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:944,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:943,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:946:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:946:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:946,columnNumber:132},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:946,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:942,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:949:10","data-component-name":"div",className:"header-right",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:950:12","data-component-name":"div",className:"header-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:951:14","data-component-name":"div",className:"header-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:952:16","data-component-name":"div",className:"label",children:"상태"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:952,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:953:16","data-component-name":"div",className:"value live",children:"● LIVE"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:953,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:951,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:955:14","data-component-name":"div",className:"header-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:956:16","data-component-name":"div",className:"label",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:956,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:957:16","data-component-name":"div",className:"value",children:"$0.020"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:957,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:955,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:959:14","data-component-name":"div",className:"header-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:960:16","data-component-name":"div",className:"label",children:"진행률"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:960,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:961:16","data-component-name":"div",className:"value",children:"45%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:961,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:959,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:950,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/launchpad.tsx:965:12","data-component-name":"button",className:`wallet-btn ${i?"connected":""}`,onClick:()=>i?S():j("metamask"),"data-testid":"button-wallet-connect",children:["👛 ",i?C(z||""):"지갑 연결"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:965,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:949,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:941,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:940,columnNumber:7},this),e.jsxDEV("main",{"data-replit-metadata":"client/src/pages/launchpad.tsx:977:6","data-component-name":"main",className:"main-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:979:8","data-component-name":"div",className:"sale-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:980:10","data-component-name":"div",className:"official-badge",children:"🛡️ TBURN Foundation 공식 런치패드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:980,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/launchpad.tsx:983:10","data-component-name":"h1",children:["TBURN ",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:983:20","data-component-name":"span",className:"highlight",children:"Public Sale"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:983,columnNumber:107},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:983,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/launchpad.tsx:984:10","data-component-name":"p",children:"안전하고 투명한 공식 토큰 세일 플랫폼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:984,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:979,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:988:8","data-component-name":"div",className:"countdown-section","data-testid":"countdown-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:989:10","data-component-name":"div",className:"countdown-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:990:12","data-component-name":"div",className:"countdown-title",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:991:14","data-component-name":"div",className:"live-dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:991,columnNumber:15},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/launchpad.tsx:992:14","data-component-name":"h3",children:"세일 종료까지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:992,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:990,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:994:12","data-component-name":"div",className:"sale-phase",children:"🚀 Phase 2 진행 중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:994,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:989,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:999:10","data-component-name":"div",className:"countdown-timer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1000:12","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1001:14","data-component-name":"div",className:"countdown-value",children:h.days.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1001,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1002:14","data-component-name":"div",className:"countdown-unit",children:"Days"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1002,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1e3,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1004:12","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1005:14","data-component-name":"div",className:"countdown-value",children:h.hours.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1005,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1006:14","data-component-name":"div",className:"countdown-unit",children:"Hours"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1006,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1004,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1008:12","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1009:14","data-component-name":"div",className:"countdown-value",children:h.minutes.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1009,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1010:14","data-component-name":"div",className:"countdown-unit",children:"Minutes"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1010,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1008,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1012:12","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1013:14","data-component-name":"div",className:"countdown-value",children:h.seconds.toString().padStart(2,"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1013,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1014:14","data-component-name":"div",className:"countdown-unit",children:"Seconds"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1014,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1012,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:999,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1018:10","data-component-name":"div",className:"progress-section","data-testid":"fundraise-progress",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1019:12","data-component-name":"div",className:"progress-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1020:14","data-component-name":"div",className:"raised",children:L?"...":(w==null?void 0:w.totalLaunchpadRaised)||"$5,400,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1020,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1023:14","data-component-name":"div",className:"goal",children:"목표: $12,000,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1023,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1019,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1025:12","data-component-name":"div",className:"progress-bar-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1026:14","data-component-name":"div",className:"progress-bar-fill"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1026,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1025,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1028:12","data-component-name":"div",className:"progress-stats",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1029:14","data-component-name":"span",className:"percent",children:"45% 완료"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1029,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1030:14","data-component-name":"span",className:"tokens",children:"2.7억 TBURN 판매 · 잔여 3.3억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1030,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1028,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1018,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:988,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1036:8","data-component-name":"div",className:"launchpad-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1038:10","data-component-name":"div",className:"purchase-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1039:12","data-component-name":"div",className:"purchase-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1040:14","data-component-name":"h3",children:"🛒 토큰 구매"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1040,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1039,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1043:12","data-component-name":"div",className:"purchase-body",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1045:14","data-component-name":"div",className:"steps-indicator",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1046:16","data-component-name":"div",className:`step-item ${n>1?"completed":n===1?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1047:18","data-component-name":"div",className:"step-number",children:n>1?"✓":"1"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1047,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1048:18","data-component-name":"div",className:"step-label",children:"지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1048,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1046,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1050:16","data-component-name":"div",className:`step-item ${n>2?"completed":n===2?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1051:18","data-component-name":"div",className:"step-number",children:n>2?"✓":"2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1051,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1052:18","data-component-name":"div",className:"step-label",children:"KYC 인증"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1052,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1050,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1054:16","data-component-name":"div",className:`step-item ${n>3?"completed":n===3?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1055:18","data-component-name":"div",className:"step-number",children:n>3?"✓":"3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1055,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1056:18","data-component-name":"div",className:"step-label",children:"금액 입력"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1056,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1054,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1058:16","data-component-name":"div",className:`step-item ${n>=4?"completed":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1059:18","data-component-name":"div",className:"step-number",children:n>=4?"✓":"4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1059,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1060:18","data-component-name":"div",className:"step-label",children:"구매 완료"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1060,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1058,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1045,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1065:14","data-component-name":"div",className:"form-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1066:16","data-component-name":"div",className:"form-section-title",children:"👛 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1066,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1067:16","data-component-name":"div",className:`wallet-section ${isWalletConnected?"connected":""}`,children:isWalletConnected?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1069:20","data-component-name":"div",className:"connected-wallet",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1070:22","data-component-name":"div",className:"avatar",children:"🦊"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1070,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1071:22","data-component-name":"div",className:"info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1072:24","data-component-name":"h4",children:"연결됨"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1072,columnNumber:25},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1073:24","data-component-name":"p",children:walletAddress},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1073,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1071,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1069,columnNumber:21},this):e.jsxDEV(e.Fragment,{children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1078:22","data-component-name":"p",style:{marginBottom:"1rem",color:"var(--gray)"},children:"지갑을 연결하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1078,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1079:22","data-component-name":"div",className:"wallet-options",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1080:24","data-component-name":"div",className:"wallet-option",onClick:x,children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1081:26","data-component-name":"span",className:"icon",children:"🦊"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1081,columnNumber:27},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1082:26","data-component-name":"span",children:"MetaMask"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1082,columnNumber:27},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1080,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1084:24","data-component-name":"div",className:"wallet-option",onClick:x,children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1085:26","data-component-name":"span",className:"icon",children:"🐰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1085,columnNumber:27},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1086:26","data-component-name":"span",children:"Rabby"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1086,columnNumber:27},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1084,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1088:24","data-component-name":"div",className:"wallet-option",onClick:x,children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1089:26","data-component-name":"span",className:"icon",children:"💎"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1089,columnNumber:27},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1090:26","data-component-name":"span",children:"Trust"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1090,columnNumber:27},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1088,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1092:24","data-component-name":"div",className:"wallet-option",onClick:x,children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1093:26","data-component-name":"span",className:"icon",children:"🪙"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1093,columnNumber:27},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1094:26","data-component-name":"span",children:"Coinbase"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1094,columnNumber:27},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1092,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1079,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1077,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1067,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1065,columnNumber:15},this),isWalletConnected&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1104:16","data-component-name":"div",className:"form-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1105:18","data-component-name":"div",className:"form-section-title",children:"✅ KYC 인증"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1105,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1106:18","data-component-name":"div",className:"kyc-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1107:20","data-component-name":"div",className:"kyc-status",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1108:22","data-component-name":"div",className:`kyc-icon ${t?"verified":"pending"}`,children:t?"✓":"⏳"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1108,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1111:22","data-component-name":"div",className:"kyc-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1112:24","data-component-name":"h4",children:t?"KYC 인증 완료":"KYC 인증 필요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1112,columnNumber:25},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1113:24","data-component-name":"p",children:t?"모든 인증이 완료되었습니다":"간단한 본인 인증을 진행해주세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1113,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1111,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1107,columnNumber:21},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1116:20","data-component-name":"button",className:`kyc-btn ${t?"verified":""}`,onClick:Y,disabled:t,"data-testid":"button-kyc",children:t?"✓ 인증 완료":"KYC 인증하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1116,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1106,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1104,columnNumber:17},this),t&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1130:16","data-component-name":"div",className:"form-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1131:18","data-component-name":"div",className:"form-section-title",children:"💵 참여 금액"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1131,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1132:18","data-component-name":"div",className:"amount-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1133:20","data-component-name":"div",className:"amount-input-group",children:[e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1134:22","data-component-name":"input",type:"number",className:"amount-input",value:r,onChange:a=>D(Number(a.target.value)||0),placeholder:"금액 입력","data-testid":"input-amount"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1134,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1142:22","data-component-name":"div",className:"amount-currency",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1143:24","data-component-name":"span",className:"icon",children:"💵"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1143,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1144:24","data-component-name":"span",children:"USDT"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1144,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1142,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1133,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1148:20","data-component-name":"div",className:"quick-amounts",children:M.map(a=>e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1150:24","data-component-name":"button",className:`quick-amount ${r===a?"active":""}`,onClick:()=>D(a),children:["$",a.toLocaleString()]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1150,columnNumber:25},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1148,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1160:20","data-component-name":"div",className:"token-output",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1161:22","data-component-name":"div",className:"token-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1162:24","data-component-name":"span",className:"label",children:"토큰 수량"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1162,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1163:24","data-component-name":"span",className:"value highlight",children:[k.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1163,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1161,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1165:22","data-component-name":"div",className:"token-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1166:24","data-component-name":"span",className:"label",children:["티어 보너스 (",d.icon," ",d.tier,")"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1166,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1167:24","data-component-name":"span",className:"value bonus",children:d.percent>0?`+${y.toLocaleString()} TBURN`:"-"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1167,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1165,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1169:22","data-component-name":"div",className:"token-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1170:24","data-component-name":"span",className:"label",children:"총 토큰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1170,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1171:24","data-component-name":"span",className:"value highlight",children:[g.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1171,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1169,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1173:22","data-component-name":"div",className:"token-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1174:24","data-component-name":"span",className:"label",children:"TGE 해제 (15%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1174,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1175:24","data-component-name":"span",className:"value",children:[U.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1175,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1173,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1177:22","data-component-name":"div",className:"token-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1178:24","data-component-name":"span",className:"label",children:"예상 가치 (@$0.08)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1178,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1179:24","data-component-name":"span",className:"value gold",children:["$",I.toLocaleString()]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1179,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1177,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1160,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1183:20","data-component-name":"div",className:"form-section-title",style:{marginTop:"1.5rem"},children:"💳 결제 방법"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1183,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1184:20","data-component-name":"div",className:"payment-methods",children:["usdt","usdc","eth"].map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1186:24","data-component-name":"div",className:`payment-method ${E===a?"active":""}`,onClick:()=>B(a),children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1191:26","data-component-name":"span",className:"icon",children:a==="usdt"?"💵":a==="usdc"?"🔵":"💎"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1191,columnNumber:27},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1192:26","data-component-name":"span",children:a.toUpperCase()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1192,columnNumber:27},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1186,columnNumber:25},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1184,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1132,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1198:18","data-component-name":"button",className:"purchase-btn",onClick:q,disabled:r<100,"data-testid":"button-purchase",children:"🚀 토큰 구매하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1198,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1207:18","data-component-name":"p",style:{textAlign:"center",marginTop:"1rem",fontSize:"0.8rem",color:"var(--gray)"},children:"🔒 안전한 스마트 컨트랙트로 처리됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1207,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1130,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1043,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1038,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1216:10","data-component-name":"div",className:"info-sidebar",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1218:12","data-component-name":"div",className:"info-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1219:14","data-component-name":"div",className:"info-card-header",children:e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1220:16","data-component-name":"h4",children:"ℹ️ 세일 정보"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1220,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1219,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1222:14","data-component-name":"div",className:"info-card-body",children:P.map((a,o)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1224:18","data-component-name":"div",className:"token-info-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1225:20","data-component-name":"span",className:"label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1225,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1226:20","data-component-name":"span",className:`value ${a.highlight?"highlight":""} ${a.success?"success":""}`,children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1226,columnNumber:21},this)]},o,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1224,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1222,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1218,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1235:12","data-component-name":"div",className:"info-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1236:14","data-component-name":"div",className:"info-card-header",children:e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1237:16","data-component-name":"h4",children:"🏅 참여 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1237,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1236,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1239:14","data-component-name":"div",className:"info-card-body",children:K.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1241:18","data-component-name":"div",className:`tier-card ${d.tier===a.name?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1242:20","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1243:22","data-component-name":"div",className:"tier-name",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1244:24","data-component-name":"span",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1244,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1245:24","data-component-name":"span",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1245,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1243,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1247:22","data-component-name":"span",className:`tier-bonus ${a.bonus==="-"?"disabled":""}`,children:a.bonus},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1247,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1242,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1249:20","data-component-name":"div",className:"tier-range",children:a.range},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1249,columnNumber:21},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1241,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1239,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1235,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1256:12","data-component-name":"div",className:"info-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1257:14","data-component-name":"div",className:"info-card-header",children:e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1258:16","data-component-name":"h4",children:"📅 베스팅 스케줄"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1258,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1257,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1260:14","data-component-name":"div",className:"info-card-body",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1261:16","data-component-name":"div",className:"vesting-visual",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1262:18","data-component-name":"div",className:"vesting-item tge",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1263:20","data-component-name":"div",className:"vesting-dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1263,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1264:20","data-component-name":"div",className:"vesting-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1265:22","data-component-name":"div",className:"title",children:"TGE"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1265,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1266:22","data-component-name":"div",className:"desc",children:"토큰 생성 시점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1266,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1264,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1268:20","data-component-name":"div",className:"vesting-amount",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1268,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1262,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1270:18","data-component-name":"div",className:"vesting-item cliff",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1271:20","data-component-name":"div",className:"vesting-dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1271,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1272:20","data-component-name":"div",className:"vesting-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1273:22","data-component-name":"div",className:"title",children:"클리프"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1273,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1274:22","data-component-name":"div",className:"desc",children:"1~3개월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1274,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1272,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1276:20","data-component-name":"div",className:"vesting-amount",children:"0%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1276,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1270,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1278:18","data-component-name":"div",className:"vesting-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1279:20","data-component-name":"div",className:"vesting-dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1279,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1280:20","data-component-name":"div",className:"vesting-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1281:22","data-component-name":"div",className:"title",children:"베스팅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1281,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1282:22","data-component-name":"div",className:"desc",children:"4~15개월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1282,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1280,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1284:20","data-component-name":"div",className:"vesting-amount",children:"85%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1284,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1278,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1261,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1260,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1256,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1291:12","data-component-name":"div",className:"info-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1292:14","data-component-name":"div",className:"info-card-header",children:e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1293:16","data-component-name":"h4",children:"🛡️ 공식 런치패드 특징"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1293,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1292,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1295:14","data-component-name":"div",className:"info-card-body",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1296:16","data-component-name":"div",className:"features-list",children:W.map((a,o)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1298:20","data-component-name":"div",className:"feature-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1299:22","data-component-name":"span",className:"feature-check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1299,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1300:22","data-component-name":"span",children:a},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1300,columnNumber:23},this)]},o,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1298,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1296,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1295,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1291,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1216,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1036,columnNumber:9},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1310:8","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1311:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV(l,{"data-replit-metadata":"client/src/pages/launchpad.tsx:1312:12","data-component-name":"Link",href:"/legal/terms-of-service",children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1312,columnNumber:13},this),e.jsxDEV(l,{"data-replit-metadata":"client/src/pages/launchpad.tsx:1313:12","data-component-name":"Link",href:"/legal/privacy-policy",children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1313,columnNumber:13},this),e.jsxDEV(l,{"data-replit-metadata":"client/src/pages/launchpad.tsx:1314:12","data-component-name":"Link",href:"/risk-disclosure",children:"리스크 고지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1314,columnNumber:13},this),e.jsxDEV(l,{"data-replit-metadata":"client/src/pages/launchpad.tsx:1315:12","data-component-name":"Link",href:"/qna",children:"고객 지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1315,columnNumber:13},this),e.jsxDEV(l,{"data-replit-metadata":"client/src/pages/launchpad.tsx:1316:12","data-component-name":"Link",href:"/faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1316,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1311,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1318:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1318,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1310,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:977,columnNumber:7},this),T&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1324:8","data-component-name":"div",className:"modal-overlay",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1325:10","data-component-name":"div",className:"modal",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1326:12","data-component-name":"div",className:"modal-header",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1327:14","data-component-name":"h3",children:c==="success"?"구매 완료!":"트랜잭션 처리 중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1327,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1328:14","data-component-name":"button",className:"modal-close",onClick:()=>v(!1),children:"✕"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1328,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1326,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1330:12","data-component-name":"div",className:"modal-body",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1331:14","data-component-name":"div",className:`tx-status-icon ${c}`,children:c==="pending"?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1332:45","data-component-name":"div",className:"spinner"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1332,columnNumber:46},this):"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1331,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1334:14","data-component-name":"h4",children:c==="success"?"토큰 구매 완료!":"트랜잭션 확인 중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1334,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1335:14","data-component-name":"p",children:c==="success"?"토큰이 성공적으로 구매되었습니다":"지갑에서 트랜잭션을 확인해주세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1335,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1337:14","data-component-name":"div",className:"tx-details",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1338:16","data-component-name":"div",className:"tx-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1339:18","data-component-name":"span",className:"label",children:"구매 금액"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1339,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1340:18","data-component-name":"span",className:"value",children:["$",r.toLocaleString()," ",E.toUpperCase()]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1340,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1338,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1342:16","data-component-name":"div",className:"tx-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1343:18","data-component-name":"span",className:"label",children:"받을 토큰"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1343,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1344:18","data-component-name":"span",className:"value",children:[g.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1344,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1342,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1346:16","data-component-name":"div",className:"tx-detail-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1347:18","data-component-name":"span",className:"label",children:"예상 가스비"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1347,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1348:18","data-component-name":"span",className:"value",children:"~$5.00"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1348,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1346,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1337,columnNumber:15},this),c==="success"&&e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/launchpad.tsx:1353:16","data-component-name":"button",className:"modal-btn",onClick:()=>v(!1),children:"확인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1353,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1330,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1325,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:1324,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/launchpad.tsx",lineNumber:131,columnNumber:5},this)}export{ee as default};
