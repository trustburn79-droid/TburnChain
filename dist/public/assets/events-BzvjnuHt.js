import{r as v,j as e}from"./index-CWUIpzf8.js";import{d as A,f as $,L as n}from"./index-CIRYVphb.js";import{ac as S,x as U,n as P,w as I,q as K}from"./tburn-loader-DzbfkJu3.js";import"./i18nInstance-DCxlOlkw.js";function Q(){const[s,i]=v.useState("all"),[o,y]=v.useState("faq-1"),[g,q]=v.useState({days:14,hours:23,minutes:59,seconds:59}),{isConnected:c,address:h,connect:w,disconnect:C,formatAddress:z}=S(),{toast:b}=U(),[O,f]=v.useState(null),{data:k,isLoading:m}=A({queryKey:["/api/token-programs/events/list"]}),B=$({mutationFn:async({eventId:t,walletAddress:l})=>I("POST","/api/events/register",{eventId:t,walletAddress:l}),onSuccess:t=>{var l;b({title:"등록 완료!",description:((l=t.data)==null?void 0:l.message)||"이벤트에 성공적으로 등록되었습니다."}),K.invalidateQueries({queryKey:["/api/token-programs/events/list"]}),f(null)},onError:t=>{b({title:"등록 실패",description:t.message||"이벤트 등록에 실패했습니다.",variant:"destructive"}),f(null)}});v.useEffect(()=>{const t=setInterval(()=>{q(l=>{let{days:N,hours:d,minutes:p,seconds:u}=l;return u--,u<0&&(u=59,p--),p<0&&(p=59,d--),d<0&&(d=23,N--),N<0&&(N=0,d=0,p=0,u=0),{days:N,hours:d,minutes:p,seconds:u}})},1e3);return()=>clearInterval(t)},[]);const x=t=>{y(o===t?null:t)},E=async()=>{c?C():await w("metamask")},j=async t=>{if(!c){await w("metamask");return}if(!h){b({title:"지갑 연결 필요",description:"이벤트에 참여하려면 지갑을 연결해주세요.",variant:"destructive"});return}f(t),B.mutate({eventId:t,walletAddress:h})},a=k==null?void 0:k.data,F=(a==null?void 0:a.activeEventsCount)??(Array.isArray(a==null?void 0:a.activeEvents)?a.activeEvents.length:0),r={totalEvents:(a==null?void 0:a.totalEvents)??0,activeEvents:F,totalParticipants:(a==null?void 0:a.totalParticipants)??0,totalRewardsDistributed:(a==null?void 0:a.totalRewardsDistributed)??"0"},R=[{id:"launch",category:"launch live",icon:"🚀",status:"진행중",statusClass:"live",title:"메인넷 런칭 그랜드 이벤트",desc:"TBURN Chain 메인넷 런칭을 기념하는 최대 규모 이벤트! 참여만 해도 보상 획득",reward:"5,000만",date:"~2026.01.31",featured:!0},{id:"trading",category:"trading live",icon:"📊",status:"진행중",statusClass:"live",title:"트레이딩 대회 시즌 1",desc:"거래량 TOP 100에게 총 2,000만 TBURN 배분! 수익률 경쟁도 진행",reward:"2,000만",date:"~2026.02.28",featured:!1},{id:"staking",category:"staking live",icon:"💎",status:"진행중",statusClass:"live",title:"스테이킹 부스트 이벤트",desc:"첫 30일 스테이킹 APY 2배! 얼리 스테이커 특별 보너스",reward:"3,000만",date:"~2026.02.15",featured:!1},{id:"meme",category:"community",icon:"👥",status:"예정",statusClass:"upcoming",title:"밈 콘테스트",desc:"TBURN 관련 최고의 밈을 만들어주세요! 커뮤니티 투표로 수상작 선정",reward:"500만",date:"2026.01.15~",featured:!1},{id:"quiz",category:"community live",icon:"🧠",status:"진행중",statusClass:"live",title:"TBURN 퀴즈 챌린지",desc:"TBURN Chain에 대한 퀴즈를 풀고 보상을 받으세요! 매일 새로운 문제",reward:"1,000만",date:"상시 진행",featured:!1},{id:"dex",category:"partner",icon:"🤝",status:"예정",statusClass:"upcoming",title:"DEX 런칭 기념 이벤트",desc:"TBURN DEX 런칭 기념! 유동성 공급자 특별 보상",reward:"2,000만",date:"2026.02.01~",featured:!1}],T=(Array.isArray(a==null?void 0:a.activeEvents)?a.activeEvents:[]).map(t=>({id:t.id,category:t.category||"live",icon:t.icon||"🎯",status:"진행중",statusClass:"live",title:t.name,desc:t.description,reward:Number(t.rewardPool).toLocaleString(),date:`~${new Date(t.endDate).toLocaleDateString("ko-KR")}`,featured:!1}))||[],L=(Array.isArray(a==null?void 0:a.upcomingEvents)?a.upcomingEvents:[]).map(t=>({id:t.id,category:t.category||"upcoming",icon:t.icon||"📅",status:"예정",statusClass:"upcoming",title:t.name,desc:t.description,reward:Number(t.rewardPool).toLocaleString(),date:`${new Date(t.startDate).toLocaleDateString("ko-KR")}~`,featured:!1}))||[],D=[...R,...T,...L],V=s==="all"?D:D.filter(t=>t.category.includes(s));return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:164:4","data-component-name":"div",className:"events-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/events.tsx:165:6","data-component-name":"style",children:`
        .events-page {
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
          --orange: #F97316;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-fire: linear-gradient(135deg, #F97316 0%, #EF4444 50%, #EC4899 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); } 50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.8); } }

        .events-header {
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
          background: var(--gradient-fire);
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
                      radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
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
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--orange);
          margin-bottom: 2rem;
          animation: pulse 2s infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-fire);
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

        .live-banner {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(236, 72, 153, 0.2), rgba(249, 115, 22, 0.2));
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
          animation: glow 3s infinite;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--danger);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .live-badge::before {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--white);
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .live-info h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .live-info p {
          color: var(--light-gray);
        }

        .countdown-container {
          display: flex;
          gap: 1rem;
        }

        .countdown-item {
          text-align: center;
        }

        .countdown-value {
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 1.75rem;
          font-weight: 800;
          min-width: 60px;
          color: var(--orange);
        }

        .countdown-label {
          font-size: 0.75rem;
          color: var(--gray);
          margin-top: 4px;
        }

        .live-cta {
          background: var(--gradient-fire);
          color: var(--white);
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .live-cta:hover {
          transform: scale(1.05);
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
          background: var(--gradient-fire);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--light-gray);
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
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.launch::before { background: var(--gradient-fire); }
        .dist-card.trading::before { background: linear-gradient(90deg, var(--blue), var(--purple)); }
        .dist-card.staking::before { background: linear-gradient(90deg, var(--success), var(--cyan)); }
        .dist-card.community::before { background: linear-gradient(90deg, var(--pink), var(--purple)); }
        .dist-card.partner::before { background: var(--gradient-gold); }

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
          color: var(--orange);
          margin-bottom: 0.25rem;
        }

        .dist-percent {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .category-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .category-tab {
          padding: 12px 24px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: var(--light-gray);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-tab:hover {
          border-color: var(--orange);
          color: var(--orange);
        }

        .category-tab.active {
          background: var(--gradient-fire);
          border-color: transparent;
          color: var(--white);
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .event-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .event-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .event-card.featured {
          border-color: var(--orange);
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.2);
        }

        .event-card.featured::before {
          content: '🔥 HOT';
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--gradient-fire);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 10;
        }

        .event-image {
          height: 200px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .event-image.launch { background: linear-gradient(135deg, #F97316 0%, #EF4444 100%); }
        .event-image.trading { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); }
        .event-image.staking { background: linear-gradient(135deg, #22C55E 0%, #06B6D4 100%); }
        .event-image.community { background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); }
        .event-image.partner { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); }

        .event-icon {
          font-size: 4rem;
          margin-bottom: 0.5rem;
        }

        .event-status {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .event-status.live { background: var(--danger); }
        .event-status.upcoming { background: var(--warning); color: var(--dark); }

        .event-content {
          padding: 1.5rem;
        }

        .event-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .event-desc {
          color: var(--light-gray);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .event-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .event-reward {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--gold);
        }

        .event-date {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .event-btn {
          display: block;
          width: 100%;
          background: var(--gradient-fire);
          color: var(--white);
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s;
        }

        .event-btn:hover {
          transform: scale(1.02);
        }

        .event-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
        }

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

        .leaderboard-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .lb-tab {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: var(--light-gray);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .lb-tab.active {
          background: var(--orange);
          border-color: var(--orange);
          color: var(--white);
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

        .leaderboard-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .rank-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .rank-badge.gold { background: var(--gradient-gold); color: var(--dark); }
        .rank-badge.silver { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank-badge.bronze { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank-badge.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--gradient-fire);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .user-address {
          font-family: monospace;
          font-weight: 500;
        }

        .score-cell {
          font-weight: 700;
          color: var(--orange);
        }

        .reward-cell {
          font-weight: 700;
          color: var(--gold);
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
          color: var(--orange);
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
          background: var(--gradient-fire);
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
          background: var(--orange);
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
          .events-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .events-grid { grid-template-columns: 1fr; }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .live-banner { flex-direction: column; text-align: center; }
          .countdown-container { justify-content: center; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:165,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/events.tsx:996:6","data-component-name":"header",className:"events-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:997:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:998:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:999:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(P,{"data-replit-metadata":"client/src/pages/events.tsx:1000:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1e3,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:999,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1002:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1002:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1002,columnNumber:130},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1002,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:998,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/events.tsx:1004:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1005:12","data-component-name":"a",href:"#live-events",children:"진행중 이벤트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1005,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1006:12","data-component-name":"a",href:"#all-events",children:"전체 이벤트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1006,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1007:12","data-component-name":"a",href:"#leaderboard",children:"리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1007,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1008:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1008,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1004,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1010:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:E,children:c&&h?`🔗 ${z(h)}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1010,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:997,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:996,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/events.tsx:1021:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1022:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1022,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1023:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1024:10","data-component-name":"div",className:"badge",children:"🔥 EVENT CENTER - 다양한 이벤트 진행 중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1024,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/events.tsx:1027:10","data-component-name":"h1",children:["참여하고 받아가세요!",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/events.tsx:1028:23","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1028,columnNumber:24},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1029:12","data-component-name":"span",className:"gradient-text",children:"4억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1029,columnNumber:13},this)," 이벤트 보상"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1027,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1031:10","data-component-name":"p",className:"hero-subtitle",children:"런칭 이벤트, 트레이딩 대회, 스테이킹 부스트, 커뮤니티 챌린지 등 다양한 이벤트에 참여하고 푸짐한 보상을 받아가세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1031,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1037:10","data-component-name":"div",className:"live-banner",id:"live-events",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1038:12","data-component-name":"div",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1039:14","data-component-name":"div",className:"live-badge",children:"LIVE"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1039,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1038,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1041:12","data-component-name":"div",className:"live-info",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/events.tsx:1042:14","data-component-name":"h3",children:"🚀 메인넷 런칭 그랜드 이벤트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1042,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1043:14","data-component-name":"p",children:"지금 참여하면 최대 10,000 TBURN 획득!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1043,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1041,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1045:12","data-component-name":"div",className:"countdown-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1046:14","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1047:16","data-component-name":"div",className:"countdown-value",children:g.days},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1047,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1048:16","data-component-name":"div",className:"countdown-label",children:"일"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1048,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1046,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1050:14","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1051:16","data-component-name":"div",className:"countdown-value",children:g.hours},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1051,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1052:16","data-component-name":"div",className:"countdown-label",children:"시간"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1052,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1050,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1054:14","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1055:16","data-component-name":"div",className:"countdown-value",children:g.minutes},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1055,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1056:16","data-component-name":"div",className:"countdown-label",children:"분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1056,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1054,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1058:14","data-component-name":"div",className:"countdown-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1059:16","data-component-name":"div",className:"countdown-value",children:g.seconds},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1059,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1060:16","data-component-name":"div",className:"countdown-label",children:"초"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1060,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1058,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1045,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1063:12","data-component-name":"button",className:"live-cta","data-testid":"button-participate",onClick:()=>j("launch"),children:c?"➜ 참여하기":"➜ 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1063,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1037,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1072:10","data-component-name":"div",className:"stats-grid","data-testid":"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1073:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-events",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1074:14","data-component-name":"div",className:"stat-value",children:m?"...":r.totalEvents>0?r.totalEvents.toLocaleString():"12+"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1074,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1077:14","data-component-name":"div",className:"stat-label",children:"총 이벤트 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1077,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1073,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1079:12","data-component-name":"div",className:"stat-card","data-testid":"stat-active-events",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1080:14","data-component-name":"div",className:"stat-value",children:m?"...":r.activeEvents>0?r.activeEvents.toLocaleString():"6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1080,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1083:14","data-component-name":"div",className:"stat-label",children:"진행중 이벤트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1083,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1079,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1085:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-participants",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1086:14","data-component-name":"div",className:"stat-value",children:m?"...":r.totalParticipants>0?r.totalParticipants.toLocaleString():"0"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1086,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1089:14","data-component-name":"div",className:"stat-label",children:"총 참여자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1089,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1085,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1091:12","data-component-name":"div",className:"stat-card","data-testid":"stat-rewards-distributed",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1092:14","data-component-name":"div",className:"stat-value",children:m?"...":Number(r.totalRewardsDistributed)>0?Number(r.totalRewardsDistributed).toLocaleString():"4억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1092,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1095:14","data-component-name":"div",className:"stat-label",children:"총 보상 풀"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1095,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1091,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1072,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1023,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1021,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/events.tsx:1102:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1103:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1104:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1104,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/events.tsx:1105:10","data-component-name":"h2",className:"section-title",children:"이벤트 보상 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1105,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1106:10","data-component-name":"p",className:"section-subtitle",children:"4억 TBURN이 5가지 이벤트 카테고리로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1106,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1103,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1109:8","data-component-name":"div",className:"distribution-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1110:10","data-component-name":"div",className:"dist-card launch","data-testid":"dist-launch",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1111:12","data-component-name":"div",className:"dist-icon",children:"🚀"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1111,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1112:12","data-component-name":"div",className:"dist-name",children:"런칭 이벤트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1112,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1113:12","data-component-name":"div",className:"dist-amount",children:"1억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1113,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1114:12","data-component-name":"div",className:"dist-percent",children:"25%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1114,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1110,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1116:10","data-component-name":"div",className:"dist-card trading","data-testid":"dist-trading",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1117:12","data-component-name":"div",className:"dist-icon",children:"📊"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1117,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1118:12","data-component-name":"div",className:"dist-name",children:"트레이딩 대회"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1118,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1119:12","data-component-name":"div",className:"dist-amount",children:"1억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1119,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1120:12","data-component-name":"div",className:"dist-percent",children:"25%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1120,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1116,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1122:10","data-component-name":"div",className:"dist-card staking","data-testid":"dist-staking",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1123:12","data-component-name":"div",className:"dist-icon",children:"💎"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1123,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1124:12","data-component-name":"div",className:"dist-name",children:"스테이킹 부스트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1124,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1125:12","data-component-name":"div",className:"dist-amount",children:"8,000만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1125,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1126:12","data-component-name":"div",className:"dist-percent",children:"20%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1126,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1122,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1128:10","data-component-name":"div",className:"dist-card community","data-testid":"dist-community",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1129:12","data-component-name":"div",className:"dist-icon",children:"👥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1129,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1130:12","data-component-name":"div",className:"dist-name",children:"커뮤니티 챌린지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1130,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1131:12","data-component-name":"div",className:"dist-amount",children:"6,000만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1131,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1132:12","data-component-name":"div",className:"dist-percent",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1132,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1128,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1134:10","data-component-name":"div",className:"dist-card partner","data-testid":"dist-partner",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1135:12","data-component-name":"div",className:"dist-icon",children:"🤝"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1135,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1136:12","data-component-name":"div",className:"dist-name",children:"파트너십 & 시즌"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1136,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1137:12","data-component-name":"div",className:"dist-amount",children:"6,000만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1137,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1138:12","data-component-name":"div",className:"dist-percent",children:"15%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1138,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1134,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1109,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1102,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/events.tsx:1144:6","data-component-name":"section",className:"section",id:"all-events",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1145:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1146:10","data-component-name":"span",className:"section-badge",children:"ALL EVENTS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1146,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/events.tsx:1147:10","data-component-name":"h2",className:"section-title",children:"이벤트 목록"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1147,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1148:10","data-component-name":"p",className:"section-subtitle",children:"현재 진행 중이거나 예정된 이벤트를 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1148,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1145,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1151:8","data-component-name":"div",className:"category-tabs",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1152:10","data-component-name":"button",className:`category-tab ${s==="all"?"active":""}`,onClick:()=>i("all"),children:"📋 전체"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1152,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1155:10","data-component-name":"button",className:`category-tab ${s==="live"?"active":""}`,onClick:()=>i("live"),children:"🔴 진행중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1155,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1158:10","data-component-name":"button",className:`category-tab ${s==="launch"?"active":""}`,onClick:()=>i("launch"),children:"🚀 런칭"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1158,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1161:10","data-component-name":"button",className:`category-tab ${s==="trading"?"active":""}`,onClick:()=>i("trading"),children:"📊 트레이딩"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1161,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1164:10","data-component-name":"button",className:`category-tab ${s==="staking"?"active":""}`,onClick:()=>i("staking"),children:"💎 스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1164,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1167:10","data-component-name":"button",className:`category-tab ${s==="community"?"active":""}`,onClick:()=>i("community"),children:"👥 커뮤니티"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1167,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1151,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1172:8","data-component-name":"div",className:"events-grid","data-testid":"events-grid",children:m?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1174:12","data-component-name":"div",className:"stat-card",style:{gridColumn:"1 / -1",textAlign:"center",padding:"3rem"},"data-testid":"events-loading",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1175:14","data-component-name":"div",className:"stat-value",children:"Loading..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1175,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1176:14","data-component-name":"div",className:"stat-label",children:"이벤트 데이터를 불러오는 중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1176,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1174,columnNumber:13},this):V.length===0?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1179:12","data-component-name":"div",className:"stat-card",style:{gridColumn:"1 / -1",textAlign:"center",padding:"3rem"},"data-testid":"events-empty",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1180:14","data-component-name":"div",className:"stat-value",children:"No Events"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1180,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1181:14","data-component-name":"div",className:"stat-label",children:"해당 카테고리에 이벤트가 없습니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1181,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1179,columnNumber:13},this):V.map(t=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1185:14","data-component-name":"div",className:`event-card ${t.featured?"featured":""}`,"data-testid":`event-card-${t.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1186:16","data-component-name":"div",className:`event-image ${t.category.split(" ")[0]}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1187:18","data-component-name":"div",className:"event-icon",children:t.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1187,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1188:18","data-component-name":"span",className:`event-status ${t.statusClass}`,"data-testid":`event-status-${t.id}`,children:t.status},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1188,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1186,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1190:16","data-component-name":"div",className:"event-content",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/events.tsx:1191:18","data-component-name":"h3",className:"event-title","data-testid":`event-title-${t.id}`,children:t.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1191,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1192:18","data-component-name":"p",className:"event-desc","data-testid":`event-desc-${t.id}`,children:t.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1192,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1193:18","data-component-name":"div",className:"event-meta",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1194:20","data-component-name":"div",className:"event-reward","data-testid":`event-reward-${t.id}`,children:["🪙 ",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1195:25","data-component-name":"span",children:[t.reward," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1195,columnNumber:26},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1194,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1197:20","data-component-name":"span",className:"event-date","data-testid":`event-date-${t.id}`,children:t.date},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1197,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1193,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1199:18","data-component-name":"button",className:`event-btn ${t.statusClass==="upcoming"?"secondary":""}`,onClick:()=>j(t.id),"data-testid":`button-event-participate-${t.id}`,children:t.statusClass==="upcoming"?"곧 시작":c?"참여하기":"지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1199,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1190,columnNumber:17},this)]},t.id,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1185,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1172,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1144,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/events.tsx:1214:6","data-component-name":"section",className:"section",id:"leaderboard",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1215:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1216:10","data-component-name":"span",className:"section-badge",children:"LEADERBOARD"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1216,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/events.tsx:1217:10","data-component-name":"h2",className:"section-title",children:"이벤트 리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1217,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1218:10","data-component-name":"p",className:"section-subtitle",children:"상위 참여자들의 실적을 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1218,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1215,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1221:8","data-component-name":"div",className:"leaderboard-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1222:10","data-component-name":"div",className:"leaderboard-header",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/events.tsx:1223:12","data-component-name":"h3",children:"🏆 런칭 이벤트 TOP 10"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1223,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1224:12","data-component-name":"div",className:"leaderboard-tabs",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1225:14","data-component-name":"button",className:"lb-tab active",children:"전체"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1225,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1226:14","data-component-name":"button",className:"lb-tab",children:"오늘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1226,columnNumber:15},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1227:14","data-component-name":"button",className:"lb-tab",children:"이번 주"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1227,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1224,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1222,columnNumber:11},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/events.tsx:1231:10","data-component-name":"table",className:"leaderboard-table",children:[e.jsxDEV("thead",{"data-replit-metadata":"client/src/pages/events.tsx:1232:12","data-component-name":"thead",children:e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/events.tsx:1233:14","data-component-name":"tr",children:[e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/events.tsx:1234:16","data-component-name":"th",children:"순위"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1234,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/events.tsx:1235:16","data-component-name":"th",children:"참여자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1235,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/events.tsx:1236:16","data-component-name":"th",children:"완료 미션"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1236,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/events.tsx:1237:16","data-component-name":"th",children:"점수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1237,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/events.tsx:1238:16","data-component-name":"th",children:"예상 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1238,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1233,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1232,columnNumber:13},this),e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/events.tsx:1241:12","data-component-name":"tbody",children:[{rank:1,badge:"gold",initials:"TB",address:"0x1a2B...3c4D",missions:"12/12",score:"98,500",reward:"50,000"},{rank:2,badge:"silver",initials:"CK",address:"0x5e6F...7g8H",missions:"12/12",score:"87,200",reward:"30,000"},{rank:3,badge:"bronze",initials:"MJ",address:"0x9i0J...1k2L",missions:"11/12",score:"76,800",reward:"20,000"},{rank:4,badge:"normal",initials:"AS",address:"0x3m4N...5o6P",missions:"11/12",score:"65,400",reward:"10,000"},{rank:5,badge:"normal",initials:"KL",address:"0x7q8R...9s0T",missions:"10/12",score:"54,200",reward:"10,000"}].map(t=>e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/events.tsx:1249:16","data-component-name":"tr",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/events.tsx:1250:18","data-component-name":"td",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1250:22","data-component-name":"div",className:`rank-badge ${t.badge}`,children:t.rank},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1250,columnNumber:107},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1250,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/events.tsx:1251:18","data-component-name":"td",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1252:20","data-component-name":"div",className:"user-cell",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1253:22","data-component-name":"div",className:"user-avatar",children:t.initials},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1253,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1254:22","data-component-name":"span",className:"user-address",children:t.address},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1254,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1252,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1251,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/events.tsx:1257:18","data-component-name":"td",children:t.missions},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1257,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/events.tsx:1258:18","data-component-name":"td",className:"score-cell",children:t.score},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1258,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/events.tsx:1259:18","data-component-name":"td",className:"reward-cell",children:[t.reward," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1259,columnNumber:19},this)]},t.rank,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1249,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1241,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1231,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1221,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1214,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/events.tsx:1268:6","data-component-name":"section",className:"section",id:"faq",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1269:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1270:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1270,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/events.tsx:1271:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1271,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1272:10","data-component-name":"p",className:"section-subtitle",children:"이벤트 관련 궁금한 점을 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1272,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1269,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1275:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1276:10","data-component-name":"div",className:`faq-item ${o==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1277:12","data-component-name":"div",className:"faq-question",onClick:()=>x("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/events.tsx:1278:14","data-component-name":"h4",children:"이벤트 보상 총 물량은 얼마인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1278,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1279:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1279,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1277,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1281:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1282:14","data-component-name":"p",children:"이벤트 보상 총 풀은 4억 TBURN입니다. 이는 전체 공급량 100억 TBURN의 4%에 해당합니다. TGE 시점에 15%(6,000만 TBURN)가 해제되고, 나머지는 24개월에 걸쳐 베스팅됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1282,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1281,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1276,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1286:10","data-component-name":"div",className:`faq-item ${o==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1287:12","data-component-name":"div",className:"faq-question",onClick:()=>x("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/events.tsx:1288:14","data-component-name":"h4",children:"이벤트 참여 자격이 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1288,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1289:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1289,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1287,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1291:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1292:14","data-component-name":"p",children:"지갑을 연결한 모든 사용자가 참여할 수 있습니다. 다만, 일부 이벤트는 KYC 인증 또는 특정 조건(예: 최소 스테이킹 수량)이 필요할 수 있습니다. 각 이벤트의 상세 페이지에서 참여 조건을 확인하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1292,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1291,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1286,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1296:10","data-component-name":"div",className:`faq-item ${o==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1297:12","data-component-name":"div",className:"faq-question",onClick:()=>x("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/events.tsx:1298:14","data-component-name":"h4",children:"보상은 언제 지급되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1298,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1299:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1299,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1297,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1301:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1302:14","data-component-name":"p",children:"대부분의 이벤트 보상은 이벤트 종료 후 7일 이내에 지급됩니다. 일부 상시 진행 이벤트는 매주 월요일에 지급됩니다. 보상 지급 일정은 각 이벤트 상세 페이지에서 확인할 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1302,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1301,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1296,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1306:10","data-component-name":"div",className:`faq-item ${o==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1307:12","data-component-name":"div",className:"faq-question",onClick:()=>x("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/events.tsx:1308:14","data-component-name":"h4",children:"여러 이벤트에 동시 참여가 가능한가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1308,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1309:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1309,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1307,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1311:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1312:14","data-component-name":"p",children:"네, 동시에 진행 중인 모든 이벤트에 참여할 수 있습니다. 예를 들어, 런칭 이벤트와 스테이킹 부스트 이벤트에 동시에 참여하여 더 많은 보상을 받을 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1312,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1311,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1306,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1275,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1268,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/events.tsx:1319:6","data-component-name":"section",className:"cta-section","data-testid":"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1320:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/events.tsx:1321:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"지금 이벤트에 참여하세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1321,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1322:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["다양한 이벤트에 참여하고 최대 4억 TBURN 보상을 받아가세요.",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/events.tsx:1323:48","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1323,columnNumber:49},this),"빠른 참여 = 더 많은 보상!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1322,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/events.tsx:1326:10","data-component-name":"button",className:"connect-btn",style:{background:"var(--white)",color:"var(--orange)",fontSize:"1.25rem",padding:"20px 50px"},onClick:E,"data-testid":"button-cta-participate",children:c?"🚀 지금 참여하기":"🔗 지갑 연결하고 시작하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1326,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1320,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1319,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/events.tsx:1338:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1339:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1340:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/events.tsx:1341:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/events.tsx:1341:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1341,columnNumber:106},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1341,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1342:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/events.tsx:1342:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1342,columnNumber:116},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1342,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1343:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1344:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1344,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1345:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1345,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1346:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1346,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1347:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1347,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1343,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1340,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1350:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/events.tsx:1351:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1351,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/events.tsx:1352:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1353:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1353:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1353,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1353,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1354:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1354:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1354,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1354,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1355:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1355:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1355,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1355,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1356:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1356:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1356,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1356,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1352,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1350,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1359:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/events.tsx:1360:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1360,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/events.tsx:1361:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1362:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1362:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1362,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1362,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1363:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1363:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1363,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1363,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1364:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1364:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1364,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1364,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1365:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1365:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1365,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1365,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1361,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1359,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1368:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/events.tsx:1369:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1369,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/events.tsx:1370:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1371:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1371:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1371,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1371,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1372:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1372:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1372,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1372,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1373:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/events.tsx:1373:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1373,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1373,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/events.tsx:1374:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1374:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1374,columnNumber:103},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1374,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1370,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1368,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1339,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1378:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/events.tsx:1379:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1379,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/events.tsx:1380:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1381:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1381,columnNumber:13},this),e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/events.tsx:1382:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1382,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1380,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1378,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:1338,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/events.tsx",lineNumber:164,columnNumber:5},this)}export{Q as default};
