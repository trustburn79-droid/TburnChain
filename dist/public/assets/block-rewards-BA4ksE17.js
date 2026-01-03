import{r as g,j as e}from"./index-CKV5SgXC.js";import{d as z,L as t}from"./index-CDBApoG5.js";import{ac as B,n as R}from"./tburn-loader-Ca8nqTW3.js";import"./i18nInstance-DCxlOlkw.js";function U(){var b,h;const[l,x]=g.useState("faq-1"),[i,m]=g.useState(1e6),{isConnected:p,address:u,connect:N,disconnect:k,formatAddress:w}=B(),{data:o,isLoading:n}=z({queryKey:["/api/token-programs/block-rewards/stats"]}),r=o==null?void 0:o.data,c=a=>{x(l===a?null:a)},v=async()=>{p?k():await N("metamask")},f=[{year:"2025",period:"Year 1-4",reward:"100%",amount:"5.8억"},{year:"2029",period:"Year 5-8",reward:"50%",amount:"2.9억"},{year:"2033",period:"Year 9-12",reward:"25%",amount:"1.45억"},{year:"2037",period:"Year 13-16",reward:"12.5%",amount:"7,250만"},{year:"2041",period:"Year 17-20",reward:"6.25%",amount:"3,625만"}],j=[{id:"full",icon:"🖥️",title:"풀 노드 밸리데이터",subtitle:"직접 검증 노드 운영",apy:"15~25%",featured:!0,requirements:["최소 1,000,000 TBURN 스테이킹","24/7 서버 운영 필수","99.5% 이상 업타임 유지","전용 서버 또는 클라우드 인스턴스"]},{id:"light",icon:"⚡",title:"라이트 밸리데이터",subtitle:"경량화된 검증 참여",apy:"10~15%",featured:!1,requirements:["최소 100,000 TBURN 스테이킹","일반 PC에서 운영 가능","95% 이상 업타임 권장","낮은 하드웨어 요구사항"]},{id:"delegate",icon:"🤝",title:"위임 스테이킹",subtitle:"밸리데이터에 위임",apy:"8~12%",featured:!1,requirements:["최소 100 TBURN부터 가능","직접 노드 운영 불필요","언제든 위임 해제 가능","수수료 공제 후 보상 수령"]}],D=[{severity:"minor",icon:"⚠️",title:"경미한 위반",penalty:"-0.1% 슬래싱",desc:"일시적인 오프라인 또는 경미한 규칙 위반",examples:["1시간 이상 오프라인","블록 서명 지연","네트워크 동기화 실패"]},{severity:"major",icon:"🚨",title:"중대한 위반",penalty:"-1% 슬래싱",desc:"반복적인 위반 또는 네트워크 불안정 유발",examples:["24시간 이상 오프라인","잘못된 블록 제안","노드 버전 미업데이트"]},{severity:"critical",icon:"🛑",title:"치명적 위반",penalty:"-10% + 퇴출",desc:"의도적인 악의적 행위 또는 이중 서명",examples:["이중 서명 (Double Signing)","네트워크 공격 시도","사기적 트랜잭션 제안"]}],E=[{name:"TBURN Genesis",address:"tb1q8...x4kf",stake:"25,000,000",commission:"5%",uptime:"99.98%",status:"active"},{name:"CryptoNode Pro",address:"tb1q7...m2nj",stake:"18,500,000",commission:"8%",uptime:"99.95%",status:"active"},{name:"BlockMaster",address:"tb1q6...p3df",stake:"15,200,000",commission:"6%",uptime:"99.92%",status:"active"},{name:"DeFi Validator",address:"tb1q5...k8gh",stake:"12,800,000",commission:"7%",uptime:"99.88%",status:"active"},{name:"Korea Node",address:"tb1q4...j5ty",stake:"10,500,000",commission:"5%",uptime:"99.85%",status:"active"}],V=Math.floor(i*.15/365),y=Math.floor(i*.15/12),q=Math.floor(i*.15);return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:87:4","data-component-name":"div",className:"block-rewards-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:88:6","data-component-name":"style",children:`
        .block-rewards-page {
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
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-block: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes mining { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

        .block-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
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

        .nav-links a:hover { color: var(--emerald); }

        .connect-btn {
          background: var(--gradient-block);
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
          box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
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
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--emerald);
          margin-bottom: 2rem;
        }

        .badge .block-icon {
          animation: mining 1.5s ease-in-out infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-block);
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

        .network-stats-banner {
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2rem;
        }

        .network-stat {
          text-align: center;
          position: relative;
        }

        .network-stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .network-stat .value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--emerald);
        }

        .network-stat .label {
          font-size: 0.8rem;
          color: var(--gray);
          margin-top: 0.25rem;
        }

        .network-stat .live {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .network-stat .live::before {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1s infinite;
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
          border-color: var(--emerald);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-block);
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
          background: var(--gradient-block);
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
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);
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
          border-color: var(--emerald);
          color: var(--emerald);
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
          background: rgba(16, 185, 129, 0.15);
          color: var(--emerald);
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
          border-color: var(--emerald);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.block::before { background: var(--gradient-block); }
        .dist-card.delegate::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
        .dist-card.performance::before { background: linear-gradient(90deg, var(--purple), #EC4899); }
        .dist-card.halving::before { background: var(--gradient-gold); }

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
          color: var(--emerald);
          margin-bottom: 0.25rem;
        }

        .dist-percent {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .halving-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .halving-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .halving-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .halving-header p {
          color: var(--light-gray);
        }

        .halving-timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin-top: 2rem;
        }

        .halving-timeline::before {
          content: '';
          position: absolute;
          top: 30px;
          left: 5%;
          right: 5%;
          height: 4px;
          background: linear-gradient(90deg, var(--emerald), var(--cyan), var(--blue), var(--purple), var(--gold));
          border-radius: 2px;
        }

        .halving-item {
          text-align: center;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .halving-dot {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          border: 4px solid var(--dark);
        }

        .halving-item:nth-child(1) .halving-dot { background: var(--emerald); }
        .halving-item:nth-child(2) .halving-dot { background: var(--cyan); }
        .halving-item:nth-child(3) .halving-dot { background: var(--blue); }
        .halving-item:nth-child(4) .halving-dot { background: var(--purple); }
        .halving-item:nth-child(5) .halving-dot { background: var(--gold); color: var(--dark); }

        .halving-year {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .halving-reward {
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 0.25rem;
        }

        .halving-amount {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--gold);
        }

        .validator-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .validator-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .validator-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .validator-card.featured {
          border-color: var(--emerald);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
        }

        .validator-card.featured::after {
          content: '추천';
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--gradient-block);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 10;
        }

        .validator-header {
          padding: 2rem;
          position: relative;
        }

        .validator-header.full { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.1)); }
        .validator-header.light { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1)); }
        .validator-header.delegate { background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(245, 158, 11, 0.1)); }

        .validator-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .validator-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .validator-subtitle {
          color: var(--light-gray);
          font-size: 0.9rem;
        }

        .validator-content {
          padding: 1.5rem 2rem 2rem;
        }

        .validator-apy {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .validator-apy-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .validator-apy-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--emerald);
        }

        .validator-requirements {
          list-style: none;
          margin-bottom: 1.5rem;
          padding: 0;
        }

        .validator-requirements li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .validator-requirements li:last-child { border-bottom: none; }
        .validator-requirements li::before { content: '✓'; color: var(--emerald); }

        .validator-btn {
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

        .validator-btn.primary {
          background: var(--gradient-block);
          color: var(--white);
        }

        .validator-btn:hover {
          transform: scale(1.02);
        }

        .calculator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .calculator-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .calculator-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .calc-input-group {
          margin-bottom: 1.5rem;
        }

        .calc-input-group label {
          display: block;
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 0.5rem;
        }

        .calc-input-wrapper {
          position: relative;
        }

        .calc-input {
          width: 100%;
          padding: 14px 80px 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--white);
          font-size: 1rem;
          font-weight: 600;
        }

        .calc-input:focus {
          outline: none;
          border-color: var(--emerald);
        }

        .calc-input-suffix {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
          font-weight: 600;
        }

        .calc-slider {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          appearance: none;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .calc-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--emerald);
          border-radius: 50%;
          cursor: pointer;
        }

        .calc-result {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .calc-result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .calc-result-row:last-child {
          border-bottom: none;
          padding-top: 1rem;
          margin-top: 0.5rem;
        }

        .calc-result-label {
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .calc-result-value {
          font-weight: 700;
        }

        .calc-result-value.emerald { color: var(--emerald); }
        .calc-result-value.gold { color: var(--gold); }
        .calc-result-value.large {
          font-size: 1.5rem;
          color: var(--gold);
        }

        .slashing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .slashing-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .slashing-card:hover {
          border-color: var(--danger);
        }

        .slashing-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .slashing-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .slashing-card.minor .slashing-icon { background: rgba(245, 158, 11, 0.2); }
        .slashing-card.major .slashing-icon { background: rgba(249, 115, 22, 0.2); }
        .slashing-card.critical .slashing-icon { background: rgba(239, 68, 68, 0.2); }

        .slashing-title {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .slashing-penalty {
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .slashing-card.minor .slashing-penalty { color: var(--warning); }
        .slashing-card.major .slashing-penalty { color: #F97316; }
        .slashing-card.critical .slashing-penalty { color: var(--danger); }

        .slashing-desc {
          color: var(--light-gray);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .slashing-examples {
          list-style: none;
          padding: 0;
        }

        .slashing-examples li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 0.85rem;
          color: var(--gray);
        }

        .slashing-examples li::before { content: '•'; }
        .slashing-card.minor .slashing-examples li::before { color: var(--warning); }
        .slashing-card.major .slashing-examples li::before { color: #F97316; }
        .slashing-card.critical .slashing-examples li::before { color: var(--danger); }

        .validators-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .validators-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .validators-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .validators-table {
          width: 100%;
          border-collapse: collapse;
        }

        .validators-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .validators-table th:first-child { border-radius: 12px 0 0 12px; }
        .validators-table th:last-child { border-radius: 0 12px 12px 0; }

        .validators-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .validators-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .validator-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .validator-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--gradient-block);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .validator-name {
          font-weight: 600;
        }

        .validator-address {
          font-size: 0.75rem;
          color: var(--gray);
          font-family: monospace;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(34, 197, 94, 0.15);
          color: var(--success);
        }

        .status-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .stake-cell {
          font-weight: 700;
          color: var(--emerald);
        }

        .commission-cell {
          color: var(--gold);
          font-weight: 600;
        }

        .uptime-cell {
          font-weight: 600;
          color: var(--success);
        }

        .delegate-btn-small {
          padding: 8px 16px;
          background: var(--gradient-block);
          color: var(--white);
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .delegate-btn-small:hover {
          transform: scale(1.05);
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
          color: var(--emerald);
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
          background: var(--gradient-block);
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
          background: var(--emerald);
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
        .footer-links a:hover { color: var(--emerald); }

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
          .validator-types-grid { grid-template-columns: 1fr; }
          .calculator-container { grid-template-columns: 1fr; }
          .slashing-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid, .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .network-stats-banner { grid-template-columns: repeat(3, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
          .halving-timeline { flex-wrap: wrap; gap: 2rem; }
          .halving-timeline::before { display: none; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .network-stats-banner { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:88,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1189:6","data-component-name":"header",className:"block-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1190:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1191:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1192:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(R,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1193:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1193,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1192,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1195:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1195:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1195,columnNumber:137},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1195,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1191,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1197:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1198:12","data-component-name":"a",href:"#validators",children:"밸리데이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1198,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1199:12","data-component-name":"a",href:"#halving",children:"반감기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1199,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1200:12","data-component-name":"a",href:"#calculator",children:"계산기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1200,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1201:12","data-component-name":"a",href:"#slashing",children:"슬래싱"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1201,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1202:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1202,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1197,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1204:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:v,children:p&&u?`🔗 ${w(u)}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1204,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1190,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1189,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1215:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1216:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1216,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1217:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1218:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1219:12","data-component-name":"span",className:"block-icon",children:"⛏️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1219,columnNumber:13},this)," BLOCK REWARDS - 밸리데이터 보상"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1218,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1221:10","data-component-name":"h1",children:["블록 생성으로 받는",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1222:22","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1222,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1223:12","data-component-name":"span",className:"gradient-text",children:"14.5억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1223,columnNumber:13},this)," 보상"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1221,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1225:10","data-component-name":"p",className:"hero-subtitle",children:"밸리데이터가 되어 네트워크를 보호하고 블록 보상을 받으세요. 20년간 지속되는 반감기 스케줄로 장기 수익을 확보하세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1225,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1230:10","data-component-name":"div",className:"network-stats-banner","data-testid":"network-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1231:12","data-component-name":"div",className:"network-stat","data-testid":"stat-current-epoch",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1232:14","data-component-name":"div",className:"value live",children:n?"...":(r==null?void 0:r.currentEpoch)||125},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1232,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1233:14","data-component-name":"div",className:"label",children:"활성 밸리데이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1233,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1231,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1235:12","data-component-name":"div",className:"network-stat","data-testid":"stat-blocks-to-halving",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1236:14","data-component-name":"div",className:"value",children:n?"...":r!=null&&r.blocksToHalving?`~${(r.blocksToHalving/1e3).toFixed(0)}K`:"~210K"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1236,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1237:14","data-component-name":"div",className:"label",children:"TPS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1237,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1235,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1239:12","data-component-name":"div",className:"network-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1240:14","data-component-name":"div",className:"value",children:"100ms"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1240,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1241:14","data-component-name":"div",className:"label",children:"블록 타임"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1241,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1239,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1243:12","data-component-name":"div",className:"network-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1244:14","data-component-name":"div",className:"value",children:"64"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1244,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1245:14","data-component-name":"div",className:"label",children:"샤드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1245,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1243,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1247:12","data-component-name":"div",className:"network-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1248:14","data-component-name":"div",className:"value",children:"99.99%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1248,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1249:14","data-component-name":"div",className:"label",children:"네트워크 업타임"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1249,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1247,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1230,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1253:10","data-component-name":"div",className:"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1254:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-rewards-distributed",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1255:14","data-component-name":"div",className:"stat-value",children:n?"...":Number((r==null?void 0:r.totalRewardsDistributed)||0).toLocaleString()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1255,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1256:14","data-component-name":"div",className:"stat-label",children:"배포된 보상 (TBURN)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1256,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1254,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1258:12","data-component-name":"div",className:"stat-card","data-testid":"stat-current-block-reward",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1259:14","data-component-name":"div",className:"stat-value",children:[n?"...":(r==null?void 0:r.currentBlockReward)||"0"," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1259,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1260:14","data-component-name":"div",className:"stat-label",children:"현재 블록 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1260,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1258,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1262:12","data-component-name":"div",className:"stat-card","data-testid":"stat-next-halving",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1263:14","data-component-name":"div",className:"stat-value",children:n?"...":((b=r==null?void 0:r.nextHalvingBlock)==null?void 0:b.toLocaleString())||0},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1263,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1264:14","data-component-name":"div",className:"stat-label",children:"다음 반감기 블록"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1264,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1262,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1266:12","data-component-name":"div",className:"stat-card","data-testid":"stat-distribution-validators",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1267:14","data-component-name":"div",className:"stat-value",children:n?"...":(h=r==null?void 0:r.distribution)!=null&&h.validators?`${r.distribution.validators}%`:"0%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1267,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1268:14","data-component-name":"div",className:"stat-label",children:"밸리데이터 분배율"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1268,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1266,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1253,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1272:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1273:12","data-component-name":"button",className:"btn-primary","data-testid":"button-become-validator",children:"⛏️ 밸리데이터 되기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1273,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1276:12","data-component-name":"button",className:"btn-secondary",children:"📖 문서 보기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1276,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1272,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1217,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1215,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1284:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1285:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1286:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1286,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1287:10","data-component-name":"h2",className:"section-title",children:"블록 보상 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1287,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1288:10","data-component-name":"p",className:"section-subtitle",children:"14.5억 TBURN이 4가지 방식으로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1288,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1285,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1291:8","data-component-name":"div",className:"distribution-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1292:10","data-component-name":"div",className:"dist-card block","data-testid":"dist-block",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1293:12","data-component-name":"div",className:"dist-icon",children:"⛏️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1293,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1294:12","data-component-name":"div",className:"dist-name",children:"블록 생성 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1294,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1295:12","data-component-name":"div",className:"dist-amount",children:"10.15억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1295,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1296:12","data-component-name":"div",className:"dist-percent",children:"70%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1296,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1292,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1298:10","data-component-name":"div",className:"dist-card delegate","data-testid":"dist-delegate",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1299:12","data-component-name":"div",className:"dist-icon",children:"🤝"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1299,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1300:12","data-component-name":"div",className:"dist-name",children:"위임자 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1300,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1301:12","data-component-name":"div",className:"dist-amount",children:"2.9억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1301,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1302:12","data-component-name":"div",className:"dist-percent",children:"20%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1302,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1298,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1304:10","data-component-name":"div",className:"dist-card performance","data-testid":"dist-performance",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1305:12","data-component-name":"div",className:"dist-icon",children:"🏆"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1305,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1306:12","data-component-name":"div",className:"dist-name",children:"성과 보너스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1306,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1307:12","data-component-name":"div",className:"dist-amount",children:"1.015억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1307,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1308:12","data-component-name":"div",className:"dist-percent",children:"7%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1308,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1304,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1310:10","data-component-name":"div",className:"dist-card halving","data-testid":"dist-reserve",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1311:12","data-component-name":"div",className:"dist-icon",children:"🔒"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1311,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1312:12","data-component-name":"div",className:"dist-name",children:"예비 기금"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1312,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1313:12","data-component-name":"div",className:"dist-amount",children:"0.435억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1313,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1314:12","data-component-name":"div",className:"dist-percent",children:"3%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1314,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1310,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1291,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1284,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1320:6","data-component-name":"section",className:"section",id:"halving",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1321:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1322:10","data-component-name":"span",className:"section-badge",children:"HALVING"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1322,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1323:10","data-component-name":"h2",className:"section-title",children:"반감기 스케줄"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1323,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1324:10","data-component-name":"p",className:"section-subtitle",children:"4년마다 보상이 절반으로 감소합니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1324,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1321,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1327:8","data-component-name":"div",className:"halving-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1328:10","data-component-name":"div",className:"halving-header",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1329:12","data-component-name":"h3",children:"🔄 20년 반감기 로드맵"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1329,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1330:12","data-component-name":"p",children:"비트코인과 유사한 반감기 모델로 희소성을 확보합니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1330,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1328,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1333:10","data-component-name":"div",className:"halving-timeline",children:f.map((a,s)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1335:14","data-component-name":"div",className:"halving-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1336:16","data-component-name":"div",className:"halving-dot",children:s+1},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1336,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1337:16","data-component-name":"div",className:"halving-year",children:a.year},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1337,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1338:16","data-component-name":"div",className:"halving-reward",children:a.period},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1338,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1339:16","data-component-name":"div",className:"halving-amount",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1339,columnNumber:17},this)]},s,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1335,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1333,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1327,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1320,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1347:6","data-component-name":"section",className:"section",id:"validators",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1348:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1349:10","data-component-name":"span",className:"section-badge",children:"VALIDATORS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1349,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1350:10","data-component-name":"h2",className:"section-title",children:"밸리데이터 유형"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1350,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1351:10","data-component-name":"p",className:"section-subtitle",children:"자신에게 맞는 참여 방식을 선택하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1351,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1348,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1354:8","data-component-name":"div",className:"validator-types-grid",children:j.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1356:12","data-component-name":"div",className:`validator-card ${a.featured?"featured":""}`,"data-testid":`validator-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1357:14","data-component-name":"div",className:`validator-header ${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1358:16","data-component-name":"div",className:"validator-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1358,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1359:16","data-component-name":"h3",className:"validator-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1359,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1360:16","data-component-name":"p",className:"validator-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1360,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1357,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1362:14","data-component-name":"div",className:"validator-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1363:16","data-component-name":"div",className:"validator-apy",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1364:18","data-component-name":"span",className:"validator-apy-label",children:"예상 APY"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1364,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1365:18","data-component-name":"span",className:"validator-apy-value",children:a.apy},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1365,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1363,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1367:16","data-component-name":"ul",className:"validator-requirements",children:a.requirements.map((s,d)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1369:20","data-component-name":"li",children:s},d,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1369,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1367,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1372:16","data-component-name":"button",className:"validator-btn primary",children:"시작하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1372,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1362,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1356,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1354,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1347,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1380:6","data-component-name":"section",className:"section",id:"calculator",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1381:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1382:10","data-component-name":"span",className:"section-badge",children:"CALCULATOR"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1382,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1383:10","data-component-name":"h2",className:"section-title",children:"보상 계산기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1383,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1384:10","data-component-name":"p",className:"section-subtitle",children:"예상 수익을 미리 계산해보세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1384,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1381,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1387:8","data-component-name":"div",className:"calculator-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1388:10","data-component-name":"div",className:"calculator-card",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1389:12","data-component-name":"h3",children:"📊 스테이킹 입력"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1389,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1390:12","data-component-name":"div",className:"calc-input-group",children:[e.jsxDEV("label",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1391:14","data-component-name":"label",children:"스테이킹 수량"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1391,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1392:14","data-component-name":"div",className:"calc-input-wrapper",children:[e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1393:16","data-component-name":"input",type:"number",className:"calc-input",value:i,onChange:a=>m(Number(a.target.value)),"data-testid":"input-stake-amount"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1393,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1400:16","data-component-name":"span",className:"calc-input-suffix",children:"TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1400,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1392,columnNumber:15},this),e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1402:14","data-component-name":"input",type:"range",className:"calc-slider",min:"100",max:"10000000",value:i,onChange:a=>m(Number(a.target.value))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1402,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1390,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1388,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1413:10","data-component-name":"div",className:"calculator-card",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1414:12","data-component-name":"h3",children:"💰 예상 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1414,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1415:12","data-component-name":"div",className:"calc-result",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1416:14","data-component-name":"div",className:"calc-result-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1417:16","data-component-name":"span",className:"calc-result-label",children:"일일 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1417,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1418:16","data-component-name":"span",className:"calc-result-value emerald",children:[V.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1418,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1416,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1420:14","data-component-name":"div",className:"calc-result-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1421:16","data-component-name":"span",className:"calc-result-label",children:"월간 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1421,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1422:16","data-component-name":"span",className:"calc-result-value emerald",children:[y.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1422,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1420,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1424:14","data-component-name":"div",className:"calc-result-row",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1425:16","data-component-name":"span",className:"calc-result-label",children:"연간 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1425,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1426:16","data-component-name":"span",className:"calc-result-value large",children:[q.toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1426,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1424,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1415,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1413,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1387,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1380,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1434:6","data-component-name":"section",className:"section",id:"slashing",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1435:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1436:10","data-component-name":"span",className:"section-badge",children:"SLASHING"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1436,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1437:10","data-component-name":"h2",className:"section-title",children:"슬래싱 규칙"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1437,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1438:10","data-component-name":"p",className:"section-subtitle",children:"네트워크 안전을 위한 페널티 시스템"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1438,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1435,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1441:8","data-component-name":"div",className:"slashing-grid",children:D.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1443:12","data-component-name":"div",className:`slashing-card ${a.severity}`,"data-testid":`slashing-${a.severity}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1444:14","data-component-name":"div",className:"slashing-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1445:16","data-component-name":"div",className:"slashing-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1445,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1446:16","data-component-name":"div",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1447:18","data-component-name":"h4",className:"slashing-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1447,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1448:18","data-component-name":"p",className:"slashing-penalty",children:a.penalty},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1448,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1446,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1444,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1451:14","data-component-name":"p",className:"slashing-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1451,columnNumber:15},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1452:14","data-component-name":"ul",className:"slashing-examples",children:a.examples.map((s,d)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1454:18","data-component-name":"li",children:s},d,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1454,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1452,columnNumber:15},this)]},a.severity,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1443,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1441,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1434,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1463:6","data-component-name":"section",className:"section",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1464:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1465:10","data-component-name":"span",className:"section-badge",children:"VALIDATORS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1465,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1466:10","data-component-name":"h2",className:"section-title",children:"활성 밸리데이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1466,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1467:10","data-component-name":"p",className:"section-subtitle",children:"현재 네트워크를 보호하는 밸리데이터들"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1467,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1464,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1470:8","data-component-name":"div",className:"validators-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1471:10","data-component-name":"div",className:"validators-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1472:12","data-component-name":"h3",children:"🖥️ Top Validators"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1472,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1471,columnNumber:11},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1475:10","data-component-name":"table",className:"validators-table",children:[e.jsxDEV("thead",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1476:12","data-component-name":"thead",children:e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1477:14","data-component-name":"tr",children:[e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1478:16","data-component-name":"th",children:"밸리데이터"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1478,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1479:16","data-component-name":"th",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1479,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1480:16","data-component-name":"th",children:"수수료"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1480,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1481:16","data-component-name":"th",children:"업타임"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1481,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1482:16","data-component-name":"th",children:"상태"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1482,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1483:16","data-component-name":"th",children:"위임"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1483,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1477,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1476,columnNumber:13},this),e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1486:12","data-component-name":"tbody",children:E.map((a,s)=>e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1488:16","data-component-name":"tr",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1489:18","data-component-name":"td",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1490:20","data-component-name":"div",className:"validator-cell",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1491:22","data-component-name":"div",className:"validator-avatar",children:a.name.charAt(0)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1491,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1492:22","data-component-name":"div",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1493:24","data-component-name":"div",className:"validator-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1493,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1494:24","data-component-name":"div",className:"validator-address",children:a.address},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1494,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1492,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1490,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1489,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1498:18","data-component-name":"td",className:"stake-cell",children:[a.stake," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1498,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1499:18","data-component-name":"td",className:"commission-cell",children:a.commission},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1499,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1500:18","data-component-name":"td",className:"uptime-cell",children:a.uptime},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1500,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1501:18","data-component-name":"td",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1501:22","data-component-name":"span",className:"status-badge",children:"Active"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1501,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1501,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1502:18","data-component-name":"td",children:e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1502:22","data-component-name":"button",className:"delegate-btn-small",children:"위임하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1502,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1502,columnNumber:19},this)]},s,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1488,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1486,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1475,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1470,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1463,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1511:6","data-component-name":"section",className:"section",id:"faq",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1512:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1513:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1513,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1514:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1514,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1515:10","data-component-name":"p",className:"section-subtitle",children:"블록 보상에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1515,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1512,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1518:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1519:10","data-component-name":"div",className:`faq-item ${l==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1520:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1521:14","data-component-name":"h4",children:"밸리데이터가 되려면 얼마가 필요한가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1521,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1522:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1522,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1520,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1524:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1525:14","data-component-name":"p",children:"풀 노드 밸리데이터는 최소 1,000,000 TBURN, 라이트 밸리데이터는 100,000 TBURN이 필요합니다. 위임 스테이킹은 100 TBURN부터 가능합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1525,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1524,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1519,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1529:10","data-component-name":"div",className:`faq-item ${l==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1530:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1531:14","data-component-name":"h4",children:"반감기는 어떻게 작동하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1531,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1532:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1532,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1530,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1534:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1535:14","data-component-name":"p",children:"4년마다 블록 보상이 50%씩 감소합니다. 2025년에는 전체 보상의 100%가 지급되고, 2029년부터는 50%, 2033년부터는 25%로 줄어듭니다. 20년에 걸쳐 총 14.5억 TBURN이 발행됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1535,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1534,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1529,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1539:10","data-component-name":"div",className:`faq-item ${l==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1540:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1541:14","data-component-name":"h4",children:"슬래싱을 피하려면 어떻게 해야 하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1541,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1542:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1542,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1540,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1544:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1545:14","data-component-name":"p",children:"99.5% 이상의 업타임을 유지하고, 최신 노드 버전을 사용하며, 이중 서명을 방지하기 위한 적절한 키 관리가 필요합니다. 정기적인 모니터링과 백업 시스템 구축을 권장합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1545,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1544,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1539,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1549:10","data-component-name":"div",className:`faq-item ${l==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1550:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1551:14","data-component-name":"h4",children:"보상은 언제 받을 수 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1551,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1552:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1552,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1550,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1554:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1555:14","data-component-name":"p",children:"블록 보상은 블록이 확정될 때마다 실시간으로 누적됩니다. 누적된 보상은 언제든 청구할 수 있으며, 청구 즉시 지갑으로 전송됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1555,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1554,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1549,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1518,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1511,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1562:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1563:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1564:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"밸리데이터가 되세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1564,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1565:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN Chain의 네트워크 보안에 기여하고",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1566:38","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1566,columnNumber:39},this),"14.5억 TBURN 블록 보상을 받아가세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1565,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1569:10","data-component-name":"button",className:"connect-btn",style:{background:"var(--white)",color:"var(--emerald)",fontSize:"1.25rem",padding:"20px 50px"},children:"⛏️ 지금 시작하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1569,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1563,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1562,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1576:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1577:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1578:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1579:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1579:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1579,columnNumber:113},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1579,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1580:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1580:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1580,columnNumber:123},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1580,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1581:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1582:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1582,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1583:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1583,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1584:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1584,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1585:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1585,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1581,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1578,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1588:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1589:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1589,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1590:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1591:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1591:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1591,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1591,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1592:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1592:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1592,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1592,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1593:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1593:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1593,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1593,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1594:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1594:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1594,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1594,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1590,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1588,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1597:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1598:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1598,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1599:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1600:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1600:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1600,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1600,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1601:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1601:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1601,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1601,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1602:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1602:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1602,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1602,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1603:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1603:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1603,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1603,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1599,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1597,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1606:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1607:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1607,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1608:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1609:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1609:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1609,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1609,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1610:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1610:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1610,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1610,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1611:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1611:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1611,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1611,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1612:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1612:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1612,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1612,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1608,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1606,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1577,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1616:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1617:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1617,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1618:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1619:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1619,columnNumber:13},this),e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/block-rewards.tsx:1620:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1620,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1618,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1616,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:1576,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/block-rewards.tsx",lineNumber:87,columnNumber:5},this)}export{U as default};
