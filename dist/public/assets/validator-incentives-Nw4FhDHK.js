import{r as u,j as e}from"./index-MawzfEWf.js";import{d as z,L as n}from"./index-DNbWdfiD.js";import{ac as q,n as B}from"./tburn-loader-BM0jq71g.js";import"./i18nInstance-DCxlOlkw.js";function R(){const[s,x]=u.useState("faq-1"),[m,b]=u.useState({days:12,hours:8,mins:45,secs:30}),{isConnected:g,address:h,connect:N,disconnect:f,formatAddress:k}=q(),{data:v,isLoading:l}=z({queryKey:["/api/token-programs/validator-incentives/stats"]}),t=v==null?void 0:v.data;u.useEffect(()=>{const a=setInterval(()=>{b(i=>{let{days:r,hours:o,mins:c,secs:d}=i;return d--,d<0&&(d=59,c--),c<0&&(c=59,o--),o<0&&(o=23,r--),r<0&&(r=0,o=0,c=0,d=0),{days:r,hours:o,mins:c,secs:d}})},1e3);return()=>clearInterval(a)},[]);const p=a=>{x(s===a?null:a)},w=async()=>{g?f():await N("metamask")},y=[{id:"early",icon:"🏆",name:"얼리버드 보너스",amount:"2.25억",percent:"30%"},{id:"loyalty",icon:"💎",name:"장기 충성 보상",amount:"1.875억",percent:"25%"},{id:"performance",icon:"⚡",name:"성능 인센티브",amount:"1.5억",percent:"20%"},{id:"growth",icon:"📈",name:"네트워크 성장",amount:"1.125억",percent:"15%"},{id:"governance",icon:"🏛️",name:"거버넌스 보너스",amount:"0.75억",percent:"10%"}],E=[{id:"genesis",icon:"👑",name:"Genesis Validator",range:"1~25번째",reward:"100,000",benefits:["100% 얼리버드 보너스","독점 Genesis NFT 뱃지","평생 0% 수수료 우대","거버넌스 2x 투표권","VIP 전용 채널 접근"],slots:"2/25",slotsClass:"limited",badge:"프리미엄"},{id:"pioneer",icon:"🚀",name:"Pioneer Validator",range:"26~75번째",reward:"50,000",benefits:["75% 얼리버드 보너스","Pioneer NFT 뱃지","0.5% 수수료 우대","거버넌스 1.5x 투표권","얼리 액세스 권한"],slots:"18/50",slotsClass:"available",badge:"추천"},{id:"early",icon:"🌟",name:"Early Validator",range:"76~125번째",reward:"25,000",benefits:["50% 얼리버드 보너스","Early NFT 뱃지","1% 수수료 우대","거버넌스 1.25x 투표권","커뮤니티 리더 인정"],slots:"32/50",slotsClass:"available",badge:"오픈"}],j=[{year:"1년",multiplier:"1.5x",desc:"기본 충성 보너스"},{year:"2년",multiplier:"2.0x",desc:"실버 멤버십"},{year:"3년",multiplier:"2.5x",desc:"골드 멤버십"},{year:"4년+",multiplier:"3.0x",desc:"다이아몬드 멤버십"}],D=[{id:"uptime",icon:"📊",title:"업타임 보너스",subtitle:"안정적인 네트워크 운영",tiers:[{badge:"gold",condition:"99.9%+",reward:"+15%"},{badge:"silver",condition:"99.5%+",reward:"+10%"},{badge:"bronze",condition:"99.0%+",reward:"+5%"}]},{id:"blocks",icon:"⛏️",title:"블록 생산 보너스",subtitle:"효율적인 블록 생성",tiers:[{badge:"gold",condition:"상위 10%",reward:"+20%"},{badge:"silver",condition:"상위 30%",reward:"+12%"},{badge:"bronze",condition:"상위 50%",reward:"+5%"}]},{id:"clean",icon:"🛡️",title:"무위반 보너스",subtitle:"슬래싱 0회 유지",tiers:[{badge:"gold",condition:"1년 무위반",reward:"+25%"},{badge:"silver",condition:"6개월 무위반",reward:"+15%"},{badge:"bronze",condition:"3개월 무위반",reward:"+8%"}]}],V=[{rank:1,name:"TBURN Genesis",tier:"Genesis",points:"2,450,000",rewards:"125,000"},{rank:2,name:"CryptoNode Pro",tier:"Genesis",points:"2,180,000",rewards:"98,000"},{rank:3,name:"BlockMaster",tier:"Pioneer",points:"1,950,000",rewards:"72,000"},{rank:4,name:"Korea Node",tier:"Pioneer",points:"1,720,000",rewards:"58,000"},{rank:5,name:"DeFi Validator",tier:"Early",points:"1,580,000",rewards:"45,000"}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:104:4","data-component-name":"div",className:"validator-incentives-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:105:6","data-component-name":"style",children:`
        .validator-incentives-page {
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
          --orange: #F97316;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-validator: linear-gradient(135deg, #F97316 0%, #F59E0B 100%);
          --gradient-loyalty: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          --gradient-performance: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); } 50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.6); } }
        @keyframes shine { 0% { left: -100%; } 100% { left: 100%; } }
        @keyframes trophy { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }

        .incentive-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
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

        .nav-links a:hover { color: var(--orange); }

        .connect-btn {
          background: var(--gradient-validator);
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
          box-shadow: 0 10px 40px rgba(249, 115, 22, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%);
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
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--orange);
          margin-bottom: 2rem;
        }

        .badge .trophy-icon { animation: trophy 1s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-validator);
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

        .early-bird-banner {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(245, 158, 11, 0.2), rgba(249, 115, 22, 0.2));
          border: 2px solid rgba(249, 115, 22, 0.4);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
          animation: glow 3s infinite;
        }

        .early-bird-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: shine 3s infinite;
        }

        .early-bird-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .early-bird-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .early-bird-icon {
          font-size: 2.5rem;
          animation: trophy 1s ease-in-out infinite;
        }

        .early-bird-text h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--orange);
          margin-bottom: 0.25rem;
        }

        .early-bird-text p {
          color: var(--light-gray);
          font-size: 0.9rem;
        }

        .early-bird-countdown {
          text-align: center;
        }

        .early-bird-countdown .label {
          font-size: 0.75rem;
          color: var(--gray);
          margin-bottom: 0.5rem;
        }

        .countdown-timer {
          display: flex;
          gap: 0.75rem;
        }

        .countdown-item {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          text-align: center;
          min-width: 50px;
        }

        .countdown-item .value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--orange);
        }

        .countdown-item .unit {
          font-size: 0.6rem;
          color: var(--gray);
          text-transform: uppercase;
        }

        .early-bird-slots {
          text-align: right;
        }

        .early-bird-slots .available {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--success);
        }

        .early-bird-slots .total {
          font-size: 0.875rem;
          color: var(--gray);
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
          border-color: var(--orange);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-validator);
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
          background: var(--gradient-validator);
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
          box-shadow: 0 20px 60px rgba(249, 115, 22, 0.4);
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
          border-color: var(--orange);
          color: var(--orange);
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
          background: rgba(249, 115, 22, 0.15);
          color: var(--orange);
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
          border-color: var(--orange);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.early::before { background: var(--gradient-validator); }
        .dist-card.loyalty::before { background: var(--gradient-loyalty); }
        .dist-card.performance::before { background: var(--gradient-performance); }
        .dist-card.growth::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
        .dist-card.governance::before { background: var(--gradient-gold); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--orange); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .tier-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .tier-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .tier-card.genesis { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.pioneer { border-color: var(--purple); }
        .tier-card.early { border-color: var(--cyan); }

        .tier-header {
          padding: 2rem;
          text-align: center;
          position: relative;
        }

        .tier-card.genesis .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.2) 0%, transparent 100%); }
        .tier-card.pioneer .tier-header { background: linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, transparent 100%); }
        .tier-card.early .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.2) 0%, transparent 100%); }

        .tier-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .tier-card.genesis .tier-badge { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.pioneer .tier-badge { background: var(--purple); color: var(--white); }
        .tier-card.early .tier-badge { background: var(--cyan); color: var(--dark); }

        .tier-icon { font-size: 4rem; margin-bottom: 1rem; }

        .tier-name {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .tier-card.genesis .tier-name { color: var(--gold); }
        .tier-card.pioneer .tier-name { color: var(--purple); }
        .tier-card.early .tier-name { color: var(--cyan); }

        .tier-range { font-size: 0.9rem; color: var(--gray); }

        .tier-content { padding: 1.5rem 2rem 2rem; }

        .tier-reward {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .tier-reward-label { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }

        .tier-reward-value { font-size: 2rem; font-weight: 900; }

        .tier-card.genesis .tier-reward-value { color: var(--gold); }
        .tier-card.pioneer .tier-reward-value { color: var(--purple); }
        .tier-card.early .tier-reward-value { color: var(--cyan); }

        .tier-benefits { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-benefits li:last-child { border-bottom: none; }
        .tier-benefits li::before { content: '✓'; color: var(--success); }

        .tier-slots {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .tier-slots-label { font-size: 0.875rem; color: var(--gray); }

        .tier-slots-value { font-weight: 700; }
        .tier-slots-value.available { color: var(--success); }
        .tier-slots-value.limited { color: var(--warning); }

        .tier-btn {
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

        .tier-card.genesis .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.pioneer .tier-btn { background: var(--purple); color: var(--white); }
        .tier-card.early .tier-btn { background: var(--cyan); color: var(--dark); }

        .tier-btn:hover { transform: scale(1.02); }

        .loyalty-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .loyalty-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .loyalty-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .loyalty-timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 3rem 0;
        }

        .loyalty-timeline::before {
          content: '';
          position: absolute;
          top: 40px;
          left: 10%;
          right: 10%;
          height: 4px;
          background: linear-gradient(90deg, var(--purple), var(--pink), var(--orange), var(--gold));
          border-radius: 2px;
        }

        .loyalty-item {
          text-align: center;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .loyalty-dot {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.5rem;
          border: 4px solid var(--dark);
        }

        .loyalty-item:nth-child(1) .loyalty-dot { background: var(--purple); }
        .loyalty-item:nth-child(2) .loyalty-dot { background: var(--pink); }
        .loyalty-item:nth-child(3) .loyalty-dot { background: var(--orange); }
        .loyalty-item:nth-child(4) .loyalty-dot { background: var(--gold); color: var(--dark); }

        .loyalty-year { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.25rem; }

        .loyalty-multiplier { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }

        .loyalty-item:nth-child(1) .loyalty-multiplier { color: var(--purple); }
        .loyalty-item:nth-child(2) .loyalty-multiplier { color: var(--pink); }
        .loyalty-item:nth-child(3) .loyalty-multiplier { color: var(--orange); }
        .loyalty-item:nth-child(4) .loyalty-multiplier { color: var(--gold); }

        .loyalty-desc { font-size: 0.8rem; color: var(--gray); }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .performance-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .performance-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .performance-card.uptime::before { background: var(--gradient-performance); }
        .performance-card.blocks::before { background: var(--gradient-validator); }
        .performance-card.clean::before { background: var(--gradient-gold); }

        .performance-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .performance-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .performance-card.uptime .performance-icon { background: rgba(16, 185, 129, 0.2); }
        .performance-card.blocks .performance-icon { background: rgba(249, 115, 22, 0.2); }
        .performance-card.clean .performance-icon { background: rgba(212, 175, 55, 0.2); }

        .performance-title { font-size: 1.25rem; font-weight: 700; }
        .performance-subtitle { font-size: 0.875rem; color: var(--gray); }

        .performance-tiers {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .perf-tier {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .perf-tier-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .perf-tier-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .perf-tier-badge.gold { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .perf-tier-badge.silver { background: rgba(148, 163, 184, 0.2); color: var(--light-gray); }
        .perf-tier-badge.bronze { background: rgba(205, 127, 50, 0.2); color: #CD7F32; }

        .perf-tier-condition { font-size: 0.875rem; color: var(--light-gray); }
        .perf-tier-reward { font-weight: 700; color: var(--gold); }

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
          margin-bottom: 2rem;
        }

        .leaderboard-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leaderboard-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.875rem;
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
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-weight: 800;
        }

        .rank-cell.gold { background: var(--gradient-gold); color: var(--dark); }
        .rank-cell.silver { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank-cell.bronze { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank-cell.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .validator-cell { display: flex; align-items: center; gap: 12px; }

        .validator-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .validator-avatar.genesis { background: var(--gradient-gold); color: var(--dark); }
        .validator-avatar.pioneer { background: var(--purple); }
        .validator-avatar.early { background: var(--cyan); color: var(--dark); }

        .validator-name { font-weight: 600; }
        .validator-tier { font-size: 0.75rem; color: var(--gray); }

        .points-cell { font-weight: 700; color: var(--orange); }
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

        .faq-chevron {
          color: var(--orange);
          transition: transform 0.3s;
        }

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
          background: var(--gradient-validator);
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

        .social-links a:hover { background: var(--orange); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--orange); }

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
          .tiers-grid, .performance-grid { grid-template-columns: 1fr; }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .loyalty-timeline { flex-wrap: wrap; gap: 2rem; }
          .loyalty-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .early-bird-content { flex-direction: column; text-align: center; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:105,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1044:6","data-component-name":"header",className:"incentive-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1045:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1046:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1047:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(B,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1048:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1048,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1047,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1050:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1050:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1050,columnNumber:144},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1050,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1046,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1052:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1053:12","data-component-name":"a",href:"#tiers",children:"티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1053,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1054:12","data-component-name":"a",href:"#loyalty",children:"충성 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1054,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1055:12","data-component-name":"a",href:"#performance",children:"성능 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1055,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1056:12","data-component-name":"a",href:"#leaderboard",children:"리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1056,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1057:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1057,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1052,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1059:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:w,children:g&&h?`🔗 ${k(h)}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1059,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1045,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1044,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1070:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1071:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1071,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1072:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1073:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1074:12","data-component-name":"span",className:"trophy-icon",children:"🏆"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1074,columnNumber:13},this)," VALIDATOR INCENTIVES - 검증자 인센티브"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1073,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1076:10","data-component-name":"h1",children:["밸리데이터를 위한",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1077:21","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1077,columnNumber:22},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1078:12","data-component-name":"span",className:"gradient-text",children:"7.5억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1078,columnNumber:13},this)," 인센티브"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1076,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1080:10","data-component-name":"p",className:"hero-subtitle",children:"얼리버드 보너스, 장기 충성 보상, 성능 인센티브까지! TBURN Chain 밸리데이터가 되어 최대 300% 추가 보상을 받으세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1080,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1085:10","data-component-name":"div",className:"early-bird-banner","data-testid":"early-bird-banner",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1086:12","data-component-name":"div",className:"early-bird-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1087:14","data-component-name":"div",className:"early-bird-left",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1088:16","data-component-name":"span",className:"early-bird-icon",children:"🦅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1088,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1089:16","data-component-name":"div",className:"early-bird-text",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1090:18","data-component-name":"h3",children:"얼리버드 프로그램 진행중!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1090,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1091:18","data-component-name":"p",children:"지금 참여하면 최대 100,000 TBURN 보너스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1091,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1089,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1087,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1094:14","data-component-name":"div",className:"early-bird-countdown",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1095:16","data-component-name":"div",className:"label",children:"마감까지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1095,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1096:16","data-component-name":"div",className:"countdown-timer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1097:18","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1098:20","data-component-name":"div",className:"value","data-testid":"countdown-days",children:m.days},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1098,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1099:20","data-component-name":"div",className:"unit",children:"일"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1099,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1097,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1101:18","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1102:20","data-component-name":"div",className:"value","data-testid":"countdown-hours",children:m.hours},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1102,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1103:20","data-component-name":"div",className:"unit",children:"시간"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1103,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1101,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1105:18","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1106:20","data-component-name":"div",className:"value","data-testid":"countdown-mins",children:m.mins},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1106,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1107:20","data-component-name":"div",className:"unit",children:"분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1107,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1105,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1109:18","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1110:20","data-component-name":"div",className:"value","data-testid":"countdown-secs",children:m.secs},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1110,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1111:20","data-component-name":"div",className:"unit",children:"초"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1111,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1109,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1096,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1094,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1115:14","data-component-name":"div",className:"early-bird-slots",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1116:16","data-component-name":"div",className:"available","data-testid":"slots-available",children:l?"...":t!=null&&t.activeValidators?`${t.activeValidators}/${t.totalValidators}`:"52/125"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1116,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1117:16","data-component-name":"div",className:"total",children:"잔여 슬롯"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1117,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1115,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1086,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1085,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1122:10","data-component-name":"div",className:"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1123:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-validators",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1124:14","data-component-name":"div",className:"stat-value",children:l?"...":(t==null?void 0:t.totalValidators)||0},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1124,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1125:14","data-component-name":"div",className:"stat-label",children:"총 밸리데이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1125,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1123,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1127:12","data-component-name":"div",className:"stat-card","data-testid":"stat-active-validators",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1128:14","data-component-name":"div",className:"stat-value",children:l?"...":(t==null?void 0:t.activeValidators)||0},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1128,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1129:14","data-component-name":"div",className:"stat-label",children:"활성 밸리데이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1129,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1127,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1131:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-staked",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1132:14","data-component-name":"div",className:"stat-value",children:l?"...":Number((t==null?void 0:t.totalStaked)||0).toLocaleString()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1132,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1133:14","data-component-name":"div",className:"stat-label",children:"총 스테이킹 (TBURN)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1133,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1131,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1135:12","data-component-name":"div",className:"stat-card","data-testid":"stat-average-apy",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1136:14","data-component-name":"div",className:"stat-value",children:l?"...":t!=null&&t.averageApy?`~${t.averageApy}%`:"~0%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1136,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1137:14","data-component-name":"div",className:"stat-label",children:"평균 APY"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1137,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1135,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1122,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1141:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1142:12","data-component-name":"button",className:"btn-primary","data-testid":"button-join-validator",children:"🏆 지금 참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1142,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1145:12","data-component-name":"button",className:"btn-secondary",children:"📖 자세히 알아보기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1145,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1141,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1072,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1070,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1153:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1154:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1155:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1155,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1156:10","data-component-name":"h2",className:"section-title",children:"인센티브 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1156,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1157:10","data-component-name":"p",className:"section-subtitle",children:"7.5억 TBURN이 5가지 카테고리로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1157,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1154,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1160:8","data-component-name":"div",className:"distribution-grid",children:y.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1162:12","data-component-name":"div",className:`dist-card ${a.id}`,"data-testid":`dist-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1163:14","data-component-name":"div",className:"dist-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1163,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1164:14","data-component-name":"div",className:"dist-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1164,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1165:14","data-component-name":"div",className:"dist-amount",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1165,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1166:14","data-component-name":"div",className:"dist-percent",children:a.percent},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1166,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1162,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1160,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1153,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1173:6","data-component-name":"section",className:"section",id:"tiers",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1174:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1175:10","data-component-name":"span",className:"section-badge",children:"EARLY BIRD"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1175,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1176:10","data-component-name":"h2",className:"section-title",children:"얼리 밸리데이터 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1176,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1177:10","data-component-name":"p",className:"section-subtitle",children:"참여 순서에 따른 차등 보상 시스템"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1177,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1174,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1180:8","data-component-name":"div",className:"tiers-grid",children:E.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1182:12","data-component-name":"div",className:`tier-card ${a.id}`,"data-testid":`tier-${a.id}`,children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1183:14","data-component-name":"span",className:"tier-badge",children:a.badge},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1183,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1184:14","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1185:16","data-component-name":"div",className:"tier-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1185,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1186:16","data-component-name":"h3",className:"tier-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1186,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1187:16","data-component-name":"p",className:"tier-range",children:[a.range," 참여자"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1187,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1184,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1189:14","data-component-name":"div",className:"tier-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1190:16","data-component-name":"div",className:"tier-reward",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1191:18","data-component-name":"div",className:"tier-reward-label",children:"얼리버드 보너스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1191,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1192:18","data-component-name":"div",className:"tier-reward-value",children:[a.reward," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1192,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1190,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1194:16","data-component-name":"ul",className:"tier-benefits",children:a.benefits.map((i,r)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1196:20","data-component-name":"li",children:i},r,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1196,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1194,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1199:16","data-component-name":"div",className:"tier-slots",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1200:18","data-component-name":"span",className:"tier-slots-label",children:"잔여 슬롯"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1200,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1201:18","data-component-name":"span",className:`tier-slots-value ${a.slotsClass}`,children:a.slots},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1201,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1199,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1203:16","data-component-name":"button",className:"tier-btn",children:"지금 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1203,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1189,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1182,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1180,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1173,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1211:6","data-component-name":"section",className:"section",id:"loyalty",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1212:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1213:10","data-component-name":"span",className:"section-badge",children:"LOYALTY"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1213,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1214:10","data-component-name":"h2",className:"section-title",children:"장기 충성 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1214,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1215:10","data-component-name":"p",className:"section-subtitle",children:"오래 함께할수록 더 많은 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1215,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1212,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1218:8","data-component-name":"div",className:"loyalty-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1219:10","data-component-name":"div",className:"loyalty-header",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1220:12","data-component-name":"h3",children:"💎 충성도 멀티플라이어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1220,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1221:12","data-component-name":"p",style:{color:"var(--light-gray)"},children:"스테이킹 기간에 따라 보상이 증가합니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1221,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1219,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1224:10","data-component-name":"div",className:"loyalty-timeline",children:j.map((a,i)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1226:14","data-component-name":"div",className:"loyalty-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1227:16","data-component-name":"div",className:"loyalty-dot",children:i+1},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1227,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1228:16","data-component-name":"div",className:"loyalty-year",children:a.year},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1228,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1229:16","data-component-name":"div",className:"loyalty-multiplier",children:a.multiplier},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1229,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1230:16","data-component-name":"div",className:"loyalty-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1230,columnNumber:17},this)]},i,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1226,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1224,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1218,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1211,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1238:6","data-component-name":"section",className:"section",id:"performance",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1239:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1240:10","data-component-name":"span",className:"section-badge",children:"PERFORMANCE"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1240,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1241:10","data-component-name":"h2",className:"section-title",children:"성능 인센티브"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1241,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1242:10","data-component-name":"p",className:"section-subtitle",children:"우수한 성능에 대한 추가 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1242,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1239,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1245:8","data-component-name":"div",className:"performance-grid",children:D.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1247:12","data-component-name":"div",className:`performance-card ${a.id}`,"data-testid":`perf-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1248:14","data-component-name":"div",className:"performance-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1249:16","data-component-name":"div",className:"performance-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1249,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1250:16","data-component-name":"div",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1251:18","data-component-name":"h4",className:"performance-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1251,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1252:18","data-component-name":"p",className:"performance-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1252,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1250,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1248,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1255:14","data-component-name":"div",className:"performance-tiers",children:a.tiers.map((i,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1257:18","data-component-name":"div",className:"perf-tier",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1258:20","data-component-name":"div",className:"perf-tier-left",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1259:22","data-component-name":"span",className:`perf-tier-badge ${i.badge}`,children:i.badge==="gold"?"Gold":i.badge==="silver"?"Silver":"Bronze"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1259,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1262:22","data-component-name":"span",className:"perf-tier-condition",children:i.condition},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1262,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1258,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1264:20","data-component-name":"span",className:"perf-tier-reward",children:i.reward},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1264,columnNumber:21},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1257,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1255,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1247,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1245,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1238,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1274:6","data-component-name":"section",className:"section",id:"leaderboard",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1275:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1276:10","data-component-name":"span",className:"section-badge",children:"LEADERBOARD"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1276,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1277:10","data-component-name":"h2",className:"section-title",children:"인센티브 리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1277,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1278:10","data-component-name":"p",className:"section-subtitle",children:"가장 많은 보상을 받은 밸리데이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1278,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1275,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1281:8","data-component-name":"div",className:"leaderboard-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1282:10","data-component-name":"div",className:"leaderboard-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1283:12","data-component-name":"h3",children:"🏆 Top Validators"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1283,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1282,columnNumber:11},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1286:10","data-component-name":"table",className:"leaderboard-table",children:[e.jsxDEV("thead",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1287:12","data-component-name":"thead",children:e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1288:14","data-component-name":"tr",children:[e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1289:16","data-component-name":"th",children:"순위"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1289,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1290:16","data-component-name":"th",children:"밸리데이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1290,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1291:16","data-component-name":"th",children:"포인트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1291,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1292:16","data-component-name":"th",children:"누적 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1292,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1288,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1287,columnNumber:13},this),e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1295:12","data-component-name":"tbody",children:V.map((a,i)=>e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1297:16","data-component-name":"tr",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1298:18","data-component-name":"td",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1299:20","data-component-name":"div",className:`rank-cell ${i===0?"gold":i===1?"silver":i===2?"bronze":"normal"}`,children:a.rank},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1299,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1298,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1303:18","data-component-name":"td",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1304:20","data-component-name":"div",className:"validator-cell",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1305:22","data-component-name":"div",className:`validator-avatar ${a.tier.toLowerCase()}`,children:a.name.charAt(0)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1305,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1308:22","data-component-name":"div",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1309:24","data-component-name":"div",className:"validator-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1309,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1310:24","data-component-name":"div",className:"validator-tier",children:[a.tier," Tier"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1310,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1308,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1304,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1303,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1314:18","data-component-name":"td",className:"points-cell",children:[a.points," pts"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1314,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1315:18","data-component-name":"td",className:"rewards-cell",children:[a.rewards," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1315,columnNumber:19},this)]},i,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1297,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1295,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1286,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1281,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1274,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1324:6","data-component-name":"section",className:"section",id:"faq",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1325:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1326:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1326,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1327:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1327,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1328:10","data-component-name":"p",className:"section-subtitle",children:"인센티브 프로그램에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1328,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1325,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1331:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1332:10","data-component-name":"div",className:`faq-item ${s==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1333:12","data-component-name":"div",className:"faq-question",onClick:()=>p("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1334:14","data-component-name":"h4",children:"얼리버드 보너스는 어떻게 받나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1334,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1335:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1335,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1333,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1337:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1338:14","data-component-name":"p",children:"Genesis(1~25번째), Pioneer(26~75번째), Early(76~125번째) 티어로 구분되며, 참여 순서에 따라 자동으로 티어가 결정됩니다. 보너스는 첫 스테이킹 시점에 즉시 지급됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1338,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1337,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1332,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1342:10","data-component-name":"div",className:`faq-item ${s==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1343:12","data-component-name":"div",className:"faq-question",onClick:()=>p("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1344:14","data-component-name":"h4",children:"충성 보상 멀티플라이어는 어떻게 적용되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1344,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1345:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1345,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1343,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1347:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1348:14","data-component-name":"p",children:"스테이킹을 유지한 기간에 따라 자동으로 멀티플라이어가 적용됩니다. 1년 후 1.5x, 2년 후 2.0x, 3년 후 2.5x, 4년 이상 3.0x가 적용되어 기본 보상에 곱해집니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1348,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1347,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1342,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1352:10","data-component-name":"div",className:`faq-item ${s==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1353:12","data-component-name":"div",className:"faq-question",onClick:()=>p("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1354:14","data-component-name":"h4",children:"성능 보너스는 어떻게 계산되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1354,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1355:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1355,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1353,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1357:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1358:14","data-component-name":"p",children:"업타임, 블록 생산량, 무위반 기록을 기준으로 매월 정산됩니다. 각 항목별로 Gold/Silver/Bronze 등급이 부여되며, 해당 등급에 따른 보너스가 기본 보상에 추가됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1358,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1357,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1352,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1362:10","data-component-name":"div",className:`faq-item ${s==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1363:12","data-component-name":"div",className:"faq-question",onClick:()=>p("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1364:14","data-component-name":"h4",children:"보너스를 최대로 받으려면 어떻게 해야 하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1364,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1365:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1365,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1363,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1367:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1368:14","data-component-name":"p",children:"Genesis 티어로 참여(+100%), 4년 이상 스테이킹(3.0x), 모든 성능 지표 Gold 등급(+60%) 달성 시 최대 300%의 추가 보상을 받을 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1368,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1367,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1362,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1331,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1324,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1375:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1376:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1377:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"지금 밸리데이터가 되세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1377,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1378:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["얼리버드 슬롯이 빠르게 마감되고 있습니다!",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1379:35","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1379,columnNumber:36},this),"지금 참여하고 최대 7.5억 TBURN 인센티브를 받으세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1378,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1382:10","data-component-name":"button",className:"connect-btn",style:{background:"var(--white)",color:"var(--orange)",fontSize:"1.25rem",padding:"20px 50px"},children:"🏆 지금 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1382,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1376,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1375,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1389:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1390:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1391:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1392:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1392:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1392,columnNumber:120},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1392,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1393:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1393:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1393,columnNumber:130},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1393,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1394:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1395:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1395,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1396:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1396,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1397:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1397,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1398:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1398,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1394,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1391,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1401:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1402:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1402,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1403:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1404:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1404:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1404,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1404,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1405:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1405:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1405,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1405,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1406:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1406:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1406,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1406,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1407:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1407:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1407,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1407,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1403,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1401,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1410:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1411:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1411,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1412:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1413:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1413:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1413,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1413,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1414:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1414:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1414,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1414,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1415:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1415:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1415,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1415,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1416:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1416:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1416,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1416,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1412,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1410,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1419:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1420:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1420,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1421:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1422:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1422:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1422,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1422,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1423:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1423:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1423,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1423,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1424:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1424:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1424,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1424,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1425:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1425:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1425,columnNumber:117},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1425,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1421,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1419,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1390,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1429:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1430:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1430,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1431:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1432:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1432,columnNumber:13},this),e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/validator-incentives.tsx:1433:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1433,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1431,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1429,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:1389,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/validator-incentives.tsx",lineNumber:104,columnNumber:5},this)}export{R as default};
