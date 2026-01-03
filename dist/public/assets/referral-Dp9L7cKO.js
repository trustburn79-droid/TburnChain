import{r as i,j as e}from"./index-C7twzsev.js";import{c as J,e as X,L as Z}from"./index-Cm11IRca.js";import{ac as _,x as ee,n as L,w as ae,q as re}from"./tburn-loader-Bju4kY-X.js";import"./i18nInstance-DCxlOlkw.js";function ie(){var C,F,R,B,A;const[c,$]=i.useState("faq-1"),[f,S]=i.useState(40),[v,U]=i.useState(10),[k,P]=i.useState(500),[h,G]=i.useState(.5),[w,d]=i.useState(!1),{isConnected:l,address:s,connect:I,isConnecting:m}=_(),{toast:O}=ee(),{data:N,isLoading:p}=J({queryKey:["/api/token-programs/referral/stats"]}),o=X({mutationFn:async a=>(await ae("POST","/api/token-programs/referral/generate",{walletAddress:a})).json(),onSuccess:()=>{re.invalidateQueries({queryKey:["/api/token-programs/referral/stats"]})}}),[t,E]=i.useState(null);i.useEffect(()=>{l&&s&&!t&&!o.isPending&&o.mutateAsync(s).then(a=>{a!=null&&a.success&&(a!=null&&a.data)&&E(a.data)}).catch(a=>{console.error("Failed to generate referral code:",a)})},[l,s,t]);const x=async()=>{m||await I("metamask")},Y=async()=>{if(!l||!s){x();return}try{const a=await o.mutateAsync(s);a.success&&E(a.data)}catch(a){console.error("Failed to generate referral code:",a)}},u=a=>{$(c===a?null:a)},D=v*k,j=D*.001,V=j*(f/100),y=V/h,T=y*12,M=T*h,H=async()=>{const a=(t==null?void 0:t.referralLink)||`https://tburn.io/ref/${(s==null?void 0:s.slice(0,8))||"0x0000"}`;try{await navigator.clipboard.writeText(a),d(!0),O({title:"복사 완료",description:"레퍼럴 링크가 클립보드에 복사되었습니다."}),setTimeout(()=>d(!1),2e3)}catch{const n=document.getElementById("refLink");n&&(n.select(),document.execCommand("copy"),d(!0),setTimeout(()=>d(!1),2e3))}},r=N==null?void 0:N.data,q=(r==null?void 0:r.tiers)||[],z=(r==null?void 0:r.leaderboard)||[],g=a=>{switch(a.toLowerCase()){case"bronze":return"🥉";case"silver":return"🥈";case"gold":return"🥇";case"diamond":return"💎";default:return"🏆"}},K=a=>a.toLowerCase(),b=a=>a?`${a.slice(0,6)}...${a.slice(-4)}`:"";return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:163:4","data-component-name":"div",className:"referral-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/referral.tsx:164:6","data-component-name":"style",children:`
        .referral-page {
          --navy: #1A365D;
          --navy-light: #2D4A7C;
          --gold: #D4AF37;
          --gold-light: #E5C76B;
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
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-purple: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          --gradient-navy: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

        .referral-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
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

        .nav-links a:hover { color: var(--gold); }

        .connect-btn {
          background: var(--gradient-gold);
          color: var(--dark);
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(212, 175, 55, 0.3);
        }

        .connect-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .connect-btn.connected {
          background: var(--gradient-purple);
          color: var(--white);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, transparent 50%), var(--gradient-dark);
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
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          top: -300px;
          right: -300px;
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
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--purple);
          margin-bottom: 2rem;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .purple {
          background: var(--gradient-purple);
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
          border-color: var(--purple);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--purple);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .stat-skeleton {
          background: linear-gradient(90deg, var(--dark-card) 25%, rgba(255,255,255,0.1) 50%, var(--dark-card) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          height: 2rem;
          width: 80px;
          margin: 0 auto 0.5rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .cta-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: var(--gradient-purple);
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          text-decoration: none;
        }

        .btn-secondary:hover {
          border-color: var(--purple);
          color: var(--purple);
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
          background: rgba(139, 92, 246, 0.15);
          color: var(--purple);
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

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          position: relative;
        }

        .step-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          position: relative;
          z-index: 1;
          transition: all 0.3s;
        }

        .step-card:hover {
          transform: translateY(-10px);
          border-color: var(--purple);
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: var(--gradient-purple);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 auto 1.5rem;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .step-desc {
          color: var(--light-gray);
          font-size: 0.95rem;
        }

        .tier-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .tier-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .tier-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .tier-card.bronze::before { background: linear-gradient(90deg, #CD7F32, #E8A65D); }
        .tier-card.silver::before { background: linear-gradient(90deg, #C0C0C0, #E8E8E8); }
        .tier-card.gold::before { background: var(--gradient-gold); }
        .tier-card.diamond::before { background: linear-gradient(90deg, #B9F2FF, #E0FFFF, #B9F2FF); }

        .tier-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .tier-card.featured {
          border-color: var(--gold);
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, var(--dark-card) 100%);
        }

        .tier-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .tier-card.bronze .tier-badge { background: rgba(205, 127, 50, 0.2); color: #CD7F32; }
        .tier-card.silver .tier-badge { background: rgba(192, 192, 192, 0.2); color: #C0C0C0; }
        .tier-card.gold .tier-badge { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .tier-card.diamond .tier-badge { background: rgba(185, 242, 255, 0.2); color: #B9F2FF; }

        .tier-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .tier-name {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .tier-commission {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }

        .tier-card.bronze .tier-commission { color: #CD7F32; }
        .tier-card.silver .tier-commission { color: #C0C0C0; }
        .tier-card.gold .tier-commission { color: var(--gold); }
        .tier-card.diamond .tier-commission { color: #B9F2FF; }

        .tier-requirement {
          color: var(--light-gray);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .tier-benefits {
          list-style: none;
          text-align: left;
          padding: 0;
        }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .tier-benefits li .check { color: var(--success); }

        .dashboard-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dashboard-title h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .dashboard-title p {
          color: var(--light-gray);
        }

        .current-tier {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 12px 20px;
          border-radius: 12px;
        }

        .current-tier span {
          color: var(--gold);
          font-weight: 700;
        }

        .referral-link-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .referral-link-label {
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 0.75rem;
        }

        .referral-link-input {
          display: flex;
          gap: 1rem;
        }

        .referral-link-input input {
          flex: 1;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px 20px;
          color: var(--white);
          font-size: 1rem;
          font-family: monospace;
        }

        .copy-btn {
          background: var(--gradient-purple);
          color: var(--white);
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .copy-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .copy-btn.copied {
          background: var(--success);
        }

        .share-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .share-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: var(--white);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .share-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .dash-stat {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .dash-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .dash-stat-value.purple { color: var(--purple); }
        .dash-stat-value.gold { color: var(--gold); }
        .dash-stat-value.success { color: var(--success); }
        .dash-stat-value.blue { color: var(--blue); }

        .dash-stat-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .referral-table {
          width: 100%;
          border-collapse: collapse;
        }

        .referral-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .referral-table th:first-child { border-radius: 12px 0 0 12px; }
        .referral-table th:last-child { border-radius: 0 12px 12px 0; }

        .referral-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.95rem;
        }

        .referral-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }

        .calculator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .calc-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .calc-section.result {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, var(--dark-card) 100%);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .calc-section h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .calc-field {
          margin-bottom: 1.5rem;
        }

        .calc-field label {
          display: block;
          font-size: 0.875rem;
          color: var(--light-gray);
          margin-bottom: 0.5rem;
        }

        .calc-field input, .calc-field select {
          width: 100%;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: var(--white);
          font-size: 1rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-label {
          color: var(--light-gray);
        }

        .result-value {
          font-weight: 700;
          font-size: 1.125rem;
        }

        .result-value.highlight {
          color: var(--gold);
          font-size: 1.5rem;
        }

        .result-total {
          background: var(--gradient-gold);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          margin-top: 1.5rem;
        }

        .result-total-label {
          font-size: 0.875rem;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }

        .result-total-value {
          font-size: 2rem;
          font-weight: 900;
          color: var(--dark);
        }

        .leaderboard-container {
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

        .leaderboard-filter {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: var(--light-gray);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-btn.active {
          background: var(--purple);
          border-color: var(--purple);
          color: var(--white);
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .leaderboard-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .leaderboard-item.top-3 {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .rank {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 800;
        }

        .rank.gold-rank { background: var(--gradient-gold); color: var(--dark); }
        .rank.silver-rank { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank.bronze-rank { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .user-info { flex: 1; }

        .user-address {
          font-family: monospace;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .user-tier {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .referral-count, .earnings {
          text-align: right;
          min-width: 120px;
        }

        .referral-count .value, .earnings .value {
          font-weight: 700;
          font-size: 1.125rem;
        }

        .earnings .value { color: var(--gold); }

        .referral-count .label, .earnings .label {
          font-size: 0.75rem;
          color: var(--light-gray);
        }

        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item:hover {
          border-color: rgba(139, 92, 246, 0.3);
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          cursor: pointer;
        }

        .faq-question h4 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .faq-chevron {
          font-size: 0.75rem;
          color: var(--light-gray);
          transition: transform 0.3s;
        }

        .faq-item.active .faq-chevron {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s, padding 0.3s;
        }

        .faq-item.active .faq-answer {
          max-height: 500px;
          padding: 0 1.5rem 1.5rem;
        }

        .faq-answer p {
          color: var(--light-gray);
          line-height: 1.8;
        }

        .referral-footer {
          background: var(--dark-card);
          padding: 4rem 2rem 2rem;
          margin-top: 4rem;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand .logo {
          margin-bottom: 1rem;
        }

        .footer-brand p {
          color: var(--light-gray);
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--light-gray);
          transition: all 0.3s;
          text-decoration: none;
        }

        .social-links a:hover {
          background: var(--purple);
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
        .footer-links a:hover { color: var(--purple); }

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

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--light-gray);
        }

        .empty-state p {
          margin-bottom: 1rem;
        }

        @media (max-width: 1200px) {
          .tier-grid, .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid, .dashboard-stats { grid-template-columns: repeat(2, 1fr); }
          .calculator-container { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .tier-grid, .steps-grid, .dashboard-stats { grid-template-columns: 1fr; }
          .referral-link-input { flex-direction: column; }
          .share-buttons { flex-wrap: wrap; }
          .share-btn { flex: 1 1 45%; }
          .leaderboard-item { flex-wrap: wrap; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:164,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/referral.tsx:1196:6","data-component-name":"header",className:"referral-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1197:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(Z,{"data-replit-metadata":"client/src/pages/referral.tsx:1198:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1199:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(L,{"data-replit-metadata":"client/src/pages/referral.tsx:1200:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1200,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1199,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1202:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1202:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1202,columnNumber:132},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1202,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1198,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/referral.tsx:1204:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1205:12","data-component-name":"a",href:"#how-it-works",children:"작동 방식"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1205,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1206:12","data-component-name":"a",href:"#tiers",children:"등급 시스템"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1206,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1207:12","data-component-name":"a",href:"#dashboard",children:"대시보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1207,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1208:12","data-component-name":"a",href:"#calculator",children:"보상 계산기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1208,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1209:12","data-component-name":"a",href:"#leaderboard",children:"리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1209,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1204,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1211:10","data-component-name":"button",className:`connect-btn ${l?"connected":""}`,onClick:x,disabled:m,"data-testid":"button-connect-wallet",children:m?"연결 중...":l?`${b(s||"")}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1211,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1197,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1196,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/referral.tsx:1223:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1224:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1224,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1225:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1226:10","data-component-name":"div",className:"badge",children:"REFERRAL PROGRAM - 실시간 정산"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1226,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/referral.tsx:1229:10","data-component-name":"h1",children:["친구를 초대하고",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/referral.tsx:1230:20","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1230,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1231:12","data-component-name":"span",className:"purple",children:"3억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1231,columnNumber:13},this)," 보상을 받으세요"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1229,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1233:10","data-component-name":"p",className:"hero-subtitle",children:"TBURN Chain 레퍼럴 프로그램에 참여하여 최대 50% 커미션을 받으세요. 초대한 친구가 거래할 때마다 실시간으로 보상이 적립됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1233,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1238:10","data-component-name":"div",className:"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1239:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-participants",children:[p?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1241:16","data-component-name":"div",className:"stat-skeleton"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1241,columnNumber:17},this):e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1243:16","data-component-name":"div",className:"stat-value","data-testid":"text-total-participants",children:((C=r==null?void 0:r.totalParticipants)==null?void 0:C.toLocaleString())||"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1243,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1247:14","data-component-name":"div",className:"stat-label",children:"총 참여자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1247,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1239,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1249:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-referrals",children:[p?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1251:16","data-component-name":"div",className:"stat-skeleton"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1251,columnNumber:17},this):e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1253:16","data-component-name":"div",className:"stat-value","data-testid":"text-total-referrals",children:((F=r==null?void 0:r.totalReferrals)==null?void 0:F.toLocaleString())||"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1253,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1257:14","data-component-name":"div",className:"stat-label",children:"총 레퍼럴"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1257,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1249,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1259:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-rewards",children:[p?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1261:16","data-component-name":"div",className:"stat-skeleton"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1261,columnNumber:17},this):e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1263:16","data-component-name":"div",className:"stat-value","data-testid":"text-total-rewards",children:Number((r==null?void 0:r.totalRewardsDistributed)||0).toLocaleString()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1263,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1267:14","data-component-name":"div",className:"stat-label",children:"총 보상 분배 (TBURN)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1267,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1259,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1269:12","data-component-name":"div",className:"stat-card","data-testid":"stat-active-referrers",children:[p?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1271:16","data-component-name":"div",className:"stat-skeleton"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1271,columnNumber:17},this):e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1273:16","data-component-name":"div",className:"stat-value","data-testid":"text-active-referrers",children:((R=r==null?void 0:r.activeReferrers)==null?void 0:R.toLocaleString())||"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1273,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1277:14","data-component-name":"div",className:"stat-label",children:"활성 레퍼러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1277,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1269,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1238,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1281:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1282:12","data-component-name":"button",className:"btn-primary",onClick:Y,disabled:o.isPending,"data-testid":"button-get-link",children:o.isPending?"생성 중...":"🔗 내 초대 링크 받기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1282,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1290:12","data-component-name":"a",href:"#how-it-works",className:"btn-secondary",children:"작동 방식 보기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1290,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1281,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1225,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1223,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/referral.tsx:1298:6","data-component-name":"section",className:"section",id:"how-it-works",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1299:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1300:10","data-component-name":"span",className:"section-badge",children:"HOW IT WORKS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1300,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/referral.tsx:1301:10","data-component-name":"h2",className:"section-title",children:"레퍼럴 프로그램 작동 방식"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1301,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1302:10","data-component-name":"p",className:"section-subtitle",children:"4단계로 간단하게 보상을 받으세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1302,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1299,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1305:8","data-component-name":"div",className:"steps-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1306:10","data-component-name":"div",className:"step-card","data-testid":"step-1",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1307:12","data-component-name":"div",className:"step-number",children:"1"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1307,columnNumber:13},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1308:12","data-component-name":"h3",className:"step-title",children:"지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1308,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1309:12","data-component-name":"p",className:"step-desc",children:"MetaMask 또는 지원 지갑을 연결하여 고유한 초대 링크를 생성하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1309,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1306,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1311:10","data-component-name":"div",className:"step-card","data-testid":"step-2",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1312:12","data-component-name":"div",className:"step-number",children:"2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1312,columnNumber:13},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1313:12","data-component-name":"h3",className:"step-title",children:"링크 공유"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1313,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1314:12","data-component-name":"p",className:"step-desc",children:"SNS, 커뮤니티, 친구에게 초대 링크를 공유하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1314,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1311,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1316:10","data-component-name":"div",className:"step-card","data-testid":"step-3",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1317:12","data-component-name":"div",className:"step-number",children:"3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1317,columnNumber:13},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1318:12","data-component-name":"h3",className:"step-title",children:"친구 활동"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1318,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1319:12","data-component-name":"p",className:"step-desc",children:"초대받은 친구가 TBURN Chain에서 거래, 스테이킹 등 활동을 합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1319,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1316,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1321:10","data-component-name":"div",className:"step-card","data-testid":"step-4",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1322:12","data-component-name":"div",className:"step-number",children:"4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1322,columnNumber:13},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1323:12","data-component-name":"h3",className:"step-title",children:"보상 수령"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1323,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1324:12","data-component-name":"p",className:"step-desc",children:"친구 활동의 수수료에서 커미션을 실시간으로 받습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1324,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1321,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1305,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1298,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/referral.tsx:1330:6","data-component-name":"section",className:"section",id:"tiers",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1331:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1332:10","data-component-name":"span",className:"section-badge",children:"TIER SYSTEM"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1332,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/referral.tsx:1333:10","data-component-name":"h2",className:"section-title",children:"등급별 커미션"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1333,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1334:10","data-component-name":"p",className:"section-subtitle",children:"초대 실적에 따라 등급이 올라가고 커미션율이 증가합니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1334,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1331,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1337:8","data-component-name":"div",className:"tier-grid",children:q.length>0?q.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1340:14","data-component-name":"div",className:`tier-card ${K(a.name)} ${a.name.toLowerCase()==="gold"?"featured":""}`,"data-testid":`tier-${a.name.toLowerCase()}`,children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1345:16","data-component-name":"span",className:"tier-badge",children:a.name.toLowerCase()==="gold"?"POPULAR":a.name.toUpperCase()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1345,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1348:16","data-component-name":"div",className:"tier-icon",children:g(a.name)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1348,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1349:16","data-component-name":"h3",className:"tier-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1349,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1350:16","data-component-name":"div",className:"tier-commission",children:[a.commission,"%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1350,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1351:16","data-component-name":"p",className:"tier-requirement",children:[a.minReferrals," ~ ",a.maxReferrals?`${a.maxReferrals}명`:"무제한"," 초대"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1351,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/referral.tsx:1354:16","data-component-name":"ul",className:"tier-benefits",children:(a.benefits||[`${a.commission}% 커미션`,`${a.bonus||0} TBURN 보너스`]).map((Q,W)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1356:20","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1356:32","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1356,columnNumber:119},this)," ",Q]},W,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1356,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1354,columnNumber:17},this)]},a.name,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1340,columnNumber:15},this)):e.jsxDEV(e.Fragment,{children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1363:14","data-component-name":"div",className:"tier-card bronze","data-testid":"tier-bronze",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1364:16","data-component-name":"span",className:"tier-badge",children:"STARTER"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1364,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1365:16","data-component-name":"div",className:"tier-icon",children:"🥉"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1365,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1366:16","data-component-name":"h3",className:"tier-name",children:"Bronze"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1366,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1367:16","data-component-name":"div",className:"tier-commission",children:"20%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1367,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1368:16","data-component-name":"p",className:"tier-requirement",children:"0 ~ 9명 초대"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1368,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/referral.tsx:1369:16","data-component-name":"ul",className:"tier-benefits",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1370:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1370:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1370,columnNumber:109},this)," 기본 커미션 20%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1370,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1371:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1371:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1371,columnNumber:109},this)," 1단계 레퍼럴"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1371,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1372:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1372:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1372,columnNumber:109},this)," 실시간 정산"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1372,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1373:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1373:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1373,columnNumber:109},this)," 기본 대시보드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1373,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1369,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1363,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1377:14","data-component-name":"div",className:"tier-card silver","data-testid":"tier-silver",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1378:16","data-component-name":"span",className:"tier-badge",children:"INTERMEDIATE"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1378,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1379:16","data-component-name":"div",className:"tier-icon",children:"🥈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1379,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1380:16","data-component-name":"h3",className:"tier-name",children:"Silver"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1380,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1381:16","data-component-name":"div",className:"tier-commission",children:"30%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1381,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1382:16","data-component-name":"p",className:"tier-requirement",children:"10 ~ 49명 초대"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1382,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/referral.tsx:1383:16","data-component-name":"ul",className:"tier-benefits",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1384:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1384:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1384,columnNumber:109},this)," 커미션 30%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1384,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1385:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1385:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1385,columnNumber:109},this)," 2단계 레퍼럴 (5%)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1385,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1386:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1386:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1386,columnNumber:109},this)," 주간 보너스"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1386,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1387:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1387:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1387,columnNumber:109},this)," 프리미엄 대시보드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1387,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1383,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1377,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1391:14","data-component-name":"div",className:"tier-card gold featured","data-testid":"tier-gold",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1392:16","data-component-name":"span",className:"tier-badge",children:"POPULAR"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1392,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1393:16","data-component-name":"div",className:"tier-icon",children:"🥇"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1393,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1394:16","data-component-name":"h3",className:"tier-name",children:"Gold"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1394,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1395:16","data-component-name":"div",className:"tier-commission",children:"40%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1395,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1396:16","data-component-name":"p",className:"tier-requirement",children:"50 ~ 199명 초대"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1396,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/referral.tsx:1397:16","data-component-name":"ul",className:"tier-benefits",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1398:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1398:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1398,columnNumber:109},this)," 커미션 40%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1398,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1399:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1399:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1399,columnNumber:109},this)," 2단계 레퍼럴 (10%)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1399,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1400:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1400:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1400,columnNumber:109},this)," 월간 보너스"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1400,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1401:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1401:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1401,columnNumber:109},this)," 전용 매니저"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1401,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1402:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1402:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1402,columnNumber:109},this)," 얼리 액세스"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1402,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1397,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1391,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1406:14","data-component-name":"div",className:"tier-card diamond","data-testid":"tier-diamond",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1407:16","data-component-name":"span",className:"tier-badge",children:"ELITE"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1407,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1408:16","data-component-name":"div",className:"tier-icon",children:"💎"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1408,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1409:16","data-component-name":"h3",className:"tier-name",children:"Diamond"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1409,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1410:16","data-component-name":"div",className:"tier-commission",children:"50%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1410,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1411:16","data-component-name":"p",className:"tier-requirement",children:"200명+ 초대"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1411,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/referral.tsx:1412:16","data-component-name":"ul",className:"tier-benefits",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1413:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1413:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1413,columnNumber:109},this)," 최대 커미션 50%"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1413,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1414:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1414:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1414,columnNumber:109},this)," 3단계 레퍼럴 (15%)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1414,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1415:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1415:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1415,columnNumber:109},this)," VIP 보너스"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1415,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1416:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1416:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1416,columnNumber:109},this)," 1:1 전담 매니저"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1416,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1417:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1417:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1417,columnNumber:109},this)," 독점 이벤트 초대"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1417,columnNumber:19},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1418:18","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1418:22","data-component-name":"span",className:"check",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1418,columnNumber:109},this)," 거버넌스 보너스"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1418,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1412,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1406,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1362,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1337,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1330,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/referral.tsx:1427:6","data-component-name":"section",className:"section",id:"dashboard",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1428:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1429:10","data-component-name":"span",className:"section-badge",children:"MY DASHBOARD"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1429,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/referral.tsx:1430:10","data-component-name":"h2",className:"section-title",children:"레퍼럴 대시보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1430,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1431:10","data-component-name":"p",className:"section-subtitle",children:"내 초대 현황과 수익을 실시간으로 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1431,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1428,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1434:8","data-component-name":"div",className:"dashboard-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1435:10","data-component-name":"div",className:"dashboard-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1436:12","data-component-name":"div",className:"dashboard-title",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1437:14","data-component-name":"h3",children:"내 레퍼럴 현황"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1437,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1438:14","data-component-name":"p",children:l?`지갑 주소: ${b(s||"")}`:"지갑을 연결하면 상세 정보를 확인할 수 있습니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1438,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1436,columnNumber:13},this),t&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1441:14","data-component-name":"div",className:"current-tier","data-testid":"user-tier",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1442:16","data-component-name":"span",children:g(t.tier)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1442,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1443:16","data-component-name":"span",children:[t.tier," Tier"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1443,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1441,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1435,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1448:10","data-component-name":"div",className:"referral-link-box",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1449:12","data-component-name":"div",className:"referral-link-label",children:"내 초대 링크"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1449,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1450:12","data-component-name":"div",className:"referral-link-input",children:[e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/referral.tsx:1451:14","data-component-name":"input",type:"text",value:(t==null?void 0:t.referralLink)||(l?`https://tburn.io/ref/${s==null?void 0:s.slice(0,8)}`:"지갑을 연결하면 링크가 생성됩니다"),readOnly:!0,id:"refLink","data-testid":"input-referral-link"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1451,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1458:14","data-component-name":"button",className:`copy-btn ${w?"copied":""}`,onClick:H,disabled:!l,"data-testid":"button-copy-link",children:w?"✓ 복사됨":"📋 복사"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1458,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1450,columnNumber:13},this),(t==null?void 0:t.referralCode)&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1468:14","data-component-name":"div",style:{marginTop:"0.75rem",fontSize:"0.875rem",color:"var(--light-gray)"},children:["레퍼럴 코드: ",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1469:24","data-component-name":"span",style:{fontFamily:"monospace",color:"var(--gold)"},"data-testid":"text-referral-code",children:t.referralCode},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1469,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1468,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1472:12","data-component-name":"div",className:"share-buttons",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1473:14","data-component-name":"button",className:"share-btn","data-testid":"button-share-twitter",children:"𝕏 Twitter"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1473,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1474:14","data-component-name":"button",className:"share-btn","data-testid":"button-share-telegram",children:"Telegram"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1474,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1475:14","data-component-name":"button",className:"share-btn","data-testid":"button-share-discord",children:"Discord"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1475,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1476:14","data-component-name":"button",className:"share-btn","data-testid":"button-share-kakaotalk",children:"KakaoTalk"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1476,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1472,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1448,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1480:10","data-component-name":"div",className:"dashboard-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1481:12","data-component-name":"div",className:"dash-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1482:14","data-component-name":"div",className:"dash-stat-value purple","data-testid":"text-user-referral-count",children:((B=t==null?void 0:t.referralCount)==null?void 0:B.toLocaleString())||"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1482,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1485:14","data-component-name":"div",className:"dash-stat-label",children:"총 초대 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1485,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1481,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1487:12","data-component-name":"div",className:"dash-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1488:14","data-component-name":"div",className:"dash-stat-value success",children:((A=r==null?void 0:r.activeReferrers)==null?void 0:A.toLocaleString())||"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1488,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1491:14","data-component-name":"div",className:"dash-stat-label",children:"활성 유저"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1491,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1487,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1493:12","data-component-name":"div",className:"dash-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1494:14","data-component-name":"div",className:"dash-stat-value gold","data-testid":"text-user-total-earnings",children:Number((t==null?void 0:t.totalEarnings)||0).toLocaleString()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1494,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1497:14","data-component-name":"div",className:"dash-stat-label",children:"총 적립 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1497,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1493,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1499:12","data-component-name":"div",className:"dash-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1500:14","data-component-name":"div",className:"dash-stat-value blue",children:Number((r==null?void 0:r.totalRewardsDistributed)||0).toLocaleString()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1500,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1503:14","data-component-name":"div",className:"dash-stat-label",children:"총 분배 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1503,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1499,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1480,columnNumber:11},this),!l&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1508:12","data-component-name":"div",className:"empty-state","data-testid":"empty-dashboard",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1509:14","data-component-name":"p",children:"지갑을 연결하여 레퍼럴 활동을 시작하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1509,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1510:14","data-component-name":"button",className:"btn-primary",onClick:x,disabled:m,"data-testid":"button-dashboard-connect",children:m?"연결 중...":"지갑 연결하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1510,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1508,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1434,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1427,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/referral.tsx:1524:6","data-component-name":"section",className:"section",id:"calculator",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1525:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1526:10","data-component-name":"span",className:"section-badge",children:"CALCULATOR"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1526,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/referral.tsx:1527:10","data-component-name":"h2",className:"section-title",children:"보상 계산기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1527,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1528:10","data-component-name":"p",className:"section-subtitle",children:"예상 수익을 미리 계산해보세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1528,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1525,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1531:8","data-component-name":"div",className:"calculator-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1532:10","data-component-name":"div",className:"calc-section",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1533:12","data-component-name":"h3",children:"조건 입력"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1533,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1534:12","data-component-name":"div",className:"calc-field",children:[e.jsxDEV("label",{"data-replit-metadata":"client/src/pages/referral.tsx:1535:14","data-component-name":"label",children:"내 등급"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1535,columnNumber:15},this),e.jsxDEV("select",{"data-replit-metadata":"client/src/pages/referral.tsx:1536:14","data-component-name":"select",value:f,onChange:a=>S(Number(a.target.value)),"data-testid":"select-calc-tier",children:[e.jsxDEV("option",{"data-replit-metadata":"client/src/pages/referral.tsx:1537:16","data-component-name":"option",value:20,children:"Bronze (20%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1537,columnNumber:17},this),e.jsxDEV("option",{"data-replit-metadata":"client/src/pages/referral.tsx:1538:16","data-component-name":"option",value:30,children:"Silver (30%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1538,columnNumber:17},this),e.jsxDEV("option",{"data-replit-metadata":"client/src/pages/referral.tsx:1539:16","data-component-name":"option",value:40,children:"Gold (40%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1539,columnNumber:17},this),e.jsxDEV("option",{"data-replit-metadata":"client/src/pages/referral.tsx:1540:16","data-component-name":"option",value:50,children:"Diamond (50%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1540,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1536,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1534,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1543:12","data-component-name":"div",className:"calc-field",children:[e.jsxDEV("label",{"data-replit-metadata":"client/src/pages/referral.tsx:1544:14","data-component-name":"label",children:"예상 초대 수 (월)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1544,columnNumber:15},this),e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/referral.tsx:1545:14","data-component-name":"input",type:"number",value:v,onChange:a=>U(Number(a.target.value)),min:1,max:1e3,"data-testid":"input-calc-referrals"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1545,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1543,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1554:12","data-component-name":"div",className:"calc-field",children:[e.jsxDEV("label",{"data-replit-metadata":"client/src/pages/referral.tsx:1555:14","data-component-name":"label",children:"피추천인 평균 월 거래량 ($)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1555,columnNumber:15},this),e.jsxDEV("input",{"data-replit-metadata":"client/src/pages/referral.tsx:1556:14","data-component-name":"input",type:"number",value:k,onChange:a=>P(Number(a.target.value)),min:100,max:1e5,"data-testid":"input-calc-volume"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1556,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1554,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1565:12","data-component-name":"div",className:"calc-field",children:[e.jsxDEV("label",{"data-replit-metadata":"client/src/pages/referral.tsx:1566:14","data-component-name":"label",children:"TBURN 예상 가격 ($)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1566,columnNumber:15},this),e.jsxDEV("select",{"data-replit-metadata":"client/src/pages/referral.tsx:1567:14","data-component-name":"select",value:h,onChange:a=>G(Number(a.target.value)),"data-testid":"select-calc-price",children:[e.jsxDEV("option",{"data-replit-metadata":"client/src/pages/referral.tsx:1568:16","data-component-name":"option",value:.5,children:"$0.50 (TGE)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1568,columnNumber:17},this),e.jsxDEV("option",{"data-replit-metadata":"client/src/pages/referral.tsx:1569:16","data-component-name":"option",value:1,children:"$1.00"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1569,columnNumber:17},this),e.jsxDEV("option",{"data-replit-metadata":"client/src/pages/referral.tsx:1570:16","data-component-name":"option",value:2,children:"$2.00"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1570,columnNumber:17},this),e.jsxDEV("option",{"data-replit-metadata":"client/src/pages/referral.tsx:1571:16","data-component-name":"option",value:5,children:"$5.00"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1571,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1567,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1565,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1532,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1576:10","data-component-name":"div",className:"calc-section result",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1577:12","data-component-name":"h3",children:"예상 수익"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1577,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1578:12","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1579:14","data-component-name":"span",className:"result-label",children:"총 거래량 (월)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1579,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1580:14","data-component-name":"span",className:"result-value","data-testid":"text-calc-total-volume",children:["$",D.toLocaleString()]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1580,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1578,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1582:12","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1583:14","data-component-name":"span",className:"result-label",children:"거래 수수료 (0.1%)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1583,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1584:14","data-component-name":"span",className:"result-value",children:["$",j.toFixed(2)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1584,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1582,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1586:12","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1587:14","data-component-name":"span",className:"result-label",children:["내 커미션 (",f,"%)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1587,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1588:14","data-component-name":"span",className:"result-value",children:["$",V.toFixed(2)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1588,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1586,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1590:12","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1591:14","data-component-name":"span",className:"result-label",children:"월 수익 (TBURN)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1591,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1592:14","data-component-name":"span",className:"result-value highlight","data-testid":"text-calc-monthly",children:[y.toFixed(0)," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1592,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1590,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1594:12","data-component-name":"div",className:"result-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1595:14","data-component-name":"span",className:"result-label",children:"연 수익 (TBURN)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1595,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1596:14","data-component-name":"span",className:"result-value highlight",children:[T.toFixed(0)," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1596,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1594,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1598:12","data-component-name":"div",className:"result-total",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1599:14","data-component-name":"div",className:"result-total-label",children:"연간 예상 수익 (USD)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1599,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1600:14","data-component-name":"div",className:"result-total-value","data-testid":"text-calc-yearly-usd",children:["$",M.toFixed(2)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1600,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1598,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1602:12","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.8rem",marginTop:"1rem",textAlign:"center"},children:"* 실제 수익은 시장 상황에 따라 달라질 수 있습니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1602,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1576,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1531,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1524,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/referral.tsx:1610:6","data-component-name":"section",className:"section",id:"leaderboard",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1611:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1612:10","data-component-name":"span",className:"section-badge",children:"LEADERBOARD"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1612,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/referral.tsx:1613:10","data-component-name":"h2",className:"section-title",children:"레퍼럴 리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1613,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1614:10","data-component-name":"p",className:"section-subtitle",children:"상위 레퍼러들의 실적을 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1614,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1611,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1617:8","data-component-name":"div",className:"leaderboard-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1618:10","data-component-name":"div",className:"leaderboard-header",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/referral.tsx:1619:12","data-component-name":"h3",children:"Top Referrers"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1619,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1620:12","data-component-name":"div",className:"leaderboard-filter",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1621:14","data-component-name":"button",className:"filter-btn active","data-testid":"filter-all",children:"전체"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1621,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1622:14","data-component-name":"button",className:"filter-btn","data-testid":"filter-week",children:"이번 주"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1622,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1623:14","data-component-name":"button",className:"filter-btn","data-testid":"filter-month",children:"이번 달"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1623,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1620,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1618,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1627:10","data-component-name":"div",className:"leaderboard-list","data-testid":"leaderboard-list",children:z.length>0?z.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1630:16","data-component-name":"div",className:`leaderboard-item ${n<3?"top-3":""}`,"data-testid":`leaderboard-item-${n}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1635:18","data-component-name":"div",className:`rank ${n===0?"gold-rank":n===1?"silver-rank":n===2?"bronze-rank":"normal"}`,children:a.rank},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1635,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1638:18","data-component-name":"div",className:"user-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1639:20","data-component-name":"div",className:"user-address","data-testid":`leaderboard-address-${n}`,children:a.walletAddress?b(a.walletAddress):`Referrer #${a.rank}`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1639,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1642:20","data-component-name":"div",className:"user-tier",children:[g(a.tier)," ",a.tier," Tier"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1642,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1638,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1644:18","data-component-name":"div",className:"referral-count",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1645:20","data-component-name":"div",className:"value","data-testid":`leaderboard-count-${n}`,children:(a.referralCount||a.referrals||0).toLocaleString()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1645,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1648:20","data-component-name":"div",className:"label",children:"초대 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1648,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1644,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1650:18","data-component-name":"div",className:"earnings",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1651:20","data-component-name":"div",className:"value","data-testid":`leaderboard-earnings-${n}`,children:[Number(a.totalEarnings||a.earnings||0).toLocaleString()," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1651,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1654:20","data-component-name":"div",className:"label",children:"총 수익"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1654,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1650,columnNumber:19},this)]},a.walletAddress||`rank-${a.rank}`,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1630,columnNumber:17},this)):e.jsxDEV(e.Fragment,{children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1660:16","data-component-name":"div",className:"leaderboard-item top-3","data-testid":"leaderboard-item-0",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1661:18","data-component-name":"div",className:"rank gold-rank",children:"1"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1661,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1662:18","data-component-name":"div",className:"user-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1663:20","data-component-name":"div",className:"user-address",children:"0x1a2B...3c4D"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1663,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1664:20","data-component-name":"div",className:"user-tier",children:"💎 Diamond Tier"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1664,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1662,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1666:18","data-component-name":"div",className:"referral-count",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1667:20","data-component-name":"div",className:"value",children:"1,247"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1667,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1668:20","data-component-name":"div",className:"label",children:"초대 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1668,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1666,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1670:18","data-component-name":"div",className:"earnings",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1671:20","data-component-name":"div",className:"value",children:"125,000 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1671,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1672:20","data-component-name":"div",className:"label",children:"총 수익"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1672,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1670,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1660,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1676:16","data-component-name":"div",className:"leaderboard-item top-3","data-testid":"leaderboard-item-1",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1677:18","data-component-name":"div",className:"rank silver-rank",children:"2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1677,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1678:18","data-component-name":"div",className:"user-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1679:20","data-component-name":"div",className:"user-address",children:"0x5e6F...7g8H"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1679,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1680:20","data-component-name":"div",className:"user-tier",children:"💎 Diamond Tier"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1680,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1678,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1682:18","data-component-name":"div",className:"referral-count",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1683:20","data-component-name":"div",className:"value",children:"892"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1683,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1684:20","data-component-name":"div",className:"label",children:"초대 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1684,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1682,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1686:18","data-component-name":"div",className:"earnings",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1687:20","data-component-name":"div",className:"value",children:"89,200 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1687,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1688:20","data-component-name":"div",className:"label",children:"총 수익"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1688,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1686,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1676,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1692:16","data-component-name":"div",className:"leaderboard-item top-3","data-testid":"leaderboard-item-2",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1693:18","data-component-name":"div",className:"rank bronze-rank",children:"3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1693,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1694:18","data-component-name":"div",className:"user-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1695:20","data-component-name":"div",className:"user-address",children:"0x9i0J...1k2L"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1695,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1696:20","data-component-name":"div",className:"user-tier",children:"💎 Diamond Tier"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1696,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1694,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1698:18","data-component-name":"div",className:"referral-count",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1699:20","data-component-name":"div",className:"value",children:"654"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1699,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1700:20","data-component-name":"div",className:"label",children:"초대 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1700,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1698,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1702:18","data-component-name":"div",className:"earnings",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1703:20","data-component-name":"div",className:"value",children:"65,400 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1703,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1704:20","data-component-name":"div",className:"label",children:"총 수익"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1704,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1702,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1692,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1708:16","data-component-name":"div",className:"leaderboard-item","data-testid":"leaderboard-item-3",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1709:18","data-component-name":"div",className:"rank normal",children:"4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1709,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1710:18","data-component-name":"div",className:"user-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1711:20","data-component-name":"div",className:"user-address",children:"0x3m4N...5o6P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1711,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1712:20","data-component-name":"div",className:"user-tier",children:"🥇 Gold Tier"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1712,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1710,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1714:18","data-component-name":"div",className:"referral-count",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1715:20","data-component-name":"div",className:"value",children:"423"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1715,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1716:20","data-component-name":"div",className:"label",children:"초대 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1716,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1714,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1718:18","data-component-name":"div",className:"earnings",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1719:20","data-component-name":"div",className:"value",children:"42,300 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1719,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1720:20","data-component-name":"div",className:"label",children:"총 수익"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1720,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1718,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1708,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1724:16","data-component-name":"div",className:"leaderboard-item","data-testid":"leaderboard-item-4",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1725:18","data-component-name":"div",className:"rank normal",children:"5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1725,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1726:18","data-component-name":"div",className:"user-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1727:20","data-component-name":"div",className:"user-address",children:"0x7q8R...9s0T"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1727,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1728:20","data-component-name":"div",className:"user-tier",children:"🥇 Gold Tier"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1728,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1726,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1730:18","data-component-name":"div",className:"referral-count",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1731:20","data-component-name":"div",className:"value",children:"318"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1731,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1732:20","data-component-name":"div",className:"label",children:"초대 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1732,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1730,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1734:18","data-component-name":"div",className:"earnings",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1735:20","data-component-name":"div",className:"value",children:"31,800 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1735,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1736:20","data-component-name":"div",className:"label",children:"총 수익"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1736,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1734,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1724,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1659,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1627,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1743:10","data-component-name":"div",style:{textAlign:"center",marginTop:"2rem"},children:e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/referral.tsx:1744:12","data-component-name":"button",className:"btn-secondary",style:{padding:"12px 30px"},"data-testid":"button-view-all-rankings",children:"전체 순위 보기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1744,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1743,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1617,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1610,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/referral.tsx:1752:6","data-component-name":"section",className:"section",id:"faq",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1753:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1754:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1754,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/referral.tsx:1755:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1755,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1756:10","data-component-name":"p",className:"section-subtitle",children:"레퍼럴 프로그램 관련 궁금한 점을 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1756,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1753,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1759:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1760:10","data-component-name":"div",className:`faq-item ${c==="faq-1"?"active":""}`,"data-testid":"faq-1",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1761:12","data-component-name":"div",className:"faq-question",onClick:()=>u("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/referral.tsx:1762:14","data-component-name":"h4",children:"레퍼럴 보상 풀 총 물량은 얼마인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1762,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1763:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1763,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1761,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1765:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1766:14","data-component-name":"p",children:"레퍼럴 프로그램 총 보상 풀은 3억 TBURN입니다. 이는 전체 공급량 100억 TBURN의 3%에 해당합니다. TGE 시점에 5%(1,500만 TBURN)가 해제되고, 나머지는 36개월에 걸쳐 선형 베스팅됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1766,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1765,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1760,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1770:10","data-component-name":"div",className:`faq-item ${c==="faq-2"?"active":""}`,"data-testid":"faq-2",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1771:12","data-component-name":"div",className:"faq-question",onClick:()=>u("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/referral.tsx:1772:14","data-component-name":"h4",children:"커미션은 어떻게 계산되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1772,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1773:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1773,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1771,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1775:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1776:14","data-component-name":"p",children:"피추천인이 TBURN Chain에서 거래, 스테이킹, 브릿지 등의 활동을 할 때 발생하는 수수료의 일정 비율을 커미션으로 받습니다. 기본 수수료율은 0.1%이며, 내 등급에 따라 20~50%의 커미션을 받습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1776,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1775,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1770,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1780:10","data-component-name":"div",className:`faq-item ${c==="faq-3"?"active":""}`,"data-testid":"faq-3",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1781:12","data-component-name":"div",className:"faq-question",onClick:()=>u("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/referral.tsx:1782:14","data-component-name":"h4",children:"등급은 어떻게 올릴 수 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1782,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1783:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1783,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1781,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1785:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1786:14","data-component-name":"p",children:"초대한 친구 수에 따라 등급이 자동으로 올라갑니다. Bronze(0-9명), Silver(10-49명), Gold(50-199명), Diamond(200명+)로 구분되며, 등급이 올라갈수록 더 높은 커미션율을 받습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1786,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1785,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1780,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1790:10","data-component-name":"div",className:`faq-item ${c==="faq-4"?"active":""}`,"data-testid":"faq-4",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1791:12","data-component-name":"div",className:"faq-question",onClick:()=>u("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/referral.tsx:1792:14","data-component-name":"h4",children:"보상은 언제 받을 수 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1792,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1793:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1793,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1791,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1795:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1796:14","data-component-name":"p",children:"레퍼럴 보상은 실시간으로 적립되며, 누적된 보상은 언제든지 출금할 수 있습니다. 다만, 최소 출금 수량은 100 TBURN입니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1796,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1795,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1790,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1759,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1752,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/referral.tsx:1803:6","data-component-name":"footer",className:"referral-footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1804:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1805:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1806:12","data-component-name":"div",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1807:14","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(L,{"data-replit-metadata":"client/src/pages/referral.tsx:1808:16","data-component-name":"TBurnLogo",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1808,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1807,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1810:14","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/referral.tsx:1810:46","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1810,columnNumber:134},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1810,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1806,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1812:12","data-component-name":"p",children:"차세대 블록체인 인프라"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1812,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1813:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1814:14","data-component-name":"a",href:"#","aria-label":"Twitter",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1814,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1815:14","data-component-name":"a",href:"#","aria-label":"Telegram",children:"T"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1815,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1816:14","data-component-name":"a",href:"#","aria-label":"Discord",children:"D"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1816,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1817:14","data-component-name":"a",href:"#","aria-label":"GitHub",children:"G"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1817,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1813,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1805,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1820:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/referral.tsx:1821:12","data-component-name":"h4",children:"프로그램"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1821,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/referral.tsx:1822:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1823:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1823:18","data-component-name":"a",href:"#how-it-works",children:"작동 방식"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1823,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1823,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1824:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1824:18","data-component-name":"a",href:"#tiers",children:"등급 시스템"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1824,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1824,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1825:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1825:18","data-component-name":"a",href:"#calculator",children:"보상 계산기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1825,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1825,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1826:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1826:18","data-component-name":"a",href:"#leaderboard",children:"리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1826,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1826,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1822,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1820,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1829:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/referral.tsx:1830:12","data-component-name":"h4",children:"리소스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1830,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/referral.tsx:1831:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1832:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1832:18","data-component-name":"a",href:"/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1832,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1832,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1833:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1833:18","data-component-name":"a",href:"/faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1833,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1833,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1834:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1834:18","data-component-name":"a",href:"/support",children:"지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1834,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1834,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1835:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1835:18","data-component-name":"a",href:"/blog",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1835,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1835,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1831,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1829,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1838:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/referral.tsx:1839:12","data-component-name":"h4",children:"법적 고지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1839,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/referral.tsx:1840:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1841:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1841:18","data-component-name":"a",href:"/terms",children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1841,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1841,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1842:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1842:18","data-component-name":"a",href:"/privacy",children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1842,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1842,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/referral.tsx:1843:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/referral.tsx:1843:18","data-component-name":"a",href:"/disclaimer",children:"면책조항"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1843,columnNumber:105},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1843,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1840,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1838,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1804,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/referral.tsx:1847:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1848:10","data-component-name":"p",children:"© 2025 TBURN Chain. All rights reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1848,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/referral.tsx:1849:10","data-component-name":"p",children:"Powered by TBURN Technology"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1849,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1847,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:1803,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/referral.tsx",lineNumber:163,columnNumber:5},this)}export{ie as default};
