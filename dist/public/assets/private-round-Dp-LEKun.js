import{r as y,j as e}from"./index-CKV5SgXC.js";import{d as z,L as n}from"./index-CDBApoG5.js";import{ac as q,n as F}from"./tburn-loader-Ca8nqTW3.js";import"./i18nInstance-DCxlOlkw.js";function A(){var m;const[i,p]=y.useState("faq-1"),{isConnected:d,address:u,connect:v,disconnect:g,formatAddress:h}=q(),{data:o,isLoading:x}=z({queryKey:["/api/token-programs/investment-rounds/stats"]}),c=o==null?void 0:o.data,t=(m=c==null?void 0:c.rounds)==null?void 0:m.find(a=>a.name.toLowerCase().includes("private")),b=async()=>{d?g():await v("metamask")},s=a=>{p(i===a?null:a)},N=[{value:"$0.015",label:"토큰당 가격",compare:"시드 대비 +87%"},{value:"50%",label:"시장가 대비 할인",compare:""},{value:"5%",label:"TGE 즉시 해제",compare:""},{value:"15개월",label:"베스팅 기간",compare:""}],f=[{id:"seed",name:"Seed Round",amount:"$0.008",discount:"70%",status:"completed"},{id:"private",name:"Private Round",amount:"$0.015",discount:"50%",status:"current"},{id:"public",name:"Public Round",amount:"$0.025",discount:"20%",status:""}],k=[{id:"institutional",icon:"🏛️",name:"Institutional",subtitle:"기관 투자자",amount:"$5M+",details:[{label:"최소 투자",value:"$5,000,000"},{label:"할인율",value:"55%"},{label:"TGE 해제",value:"7%"}],benefits:["이사회 옵저버 석","월간 경영진 브리핑","독점 공동 투자권","맞춤 베스팅","전담 어카운트"]},{id:"strategic",icon:"🎯",name:"Strategic",subtitle:"전략적 투자자",amount:"$2M+",details:[{label:"최소 투자",value:"$2,000,000"},{label:"할인율",value:"52%"},{label:"TGE 해제",value:"6%"}],benefits:["분기별 전략 세션","파트너십 우선권","기술 협력","마케팅 공동","네트워크 접근"]},{id:"growth",icon:"📈",name:"Growth",subtitle:"성장 투자자",amount:"$500K+",details:[{label:"최소 투자",value:"$500,000"},{label:"할인율",value:"50%"},{label:"TGE 해제",value:"5%"}],benefits:["분기별 업데이트","커뮤니티 액세스","거버넌스 참여","얼리 액세스","전용 지원"]},{id:"standard",icon:"💼",name:"Standard",subtitle:"일반 투자자",amount:"$100K+",details:[{label:"최소 투자",value:"$100,000"},{label:"할인율",value:"48%"},{label:"TGE 해제",value:"5%"}],benefits:["월간 뉴스레터","기본 거버넌스","커뮤니티 채널","일반 배정","이메일 지원"]}],w=[{icon:"🎉",title:"TGE 해제",value:"5%",desc:"즉시 해제"},{icon:"🔒",title:"클리프 기간",value:"3개월",desc:"초기 락업"},{icon:"📈",title:"월간 베스팅",value:"6.3%",desc:"15개월간"},{icon:"✅",title:"완전 언락",value:"100%",desc:"18개월 후"}],E=[{icon:"🏛️",name:"VC & 펀드",amount:"4억",percent:"45%"},{icon:"🏢",name:"패밀리 오피스",amount:"2.5억",percent:"28%"},{icon:"🎯",name:"전략 투자자",amount:"1.5억",percent:"17%"},{icon:"💼",name:"기업 투자자",amount:"1억",percent:"10%"}],D=[{icon:"🏛️",name:"Paradigm Ventures",type:"VC",tier:"institutional"},{icon:"🏢",name:"Kim Family Office",type:"Family Office",tier:"institutional"},{icon:"🎯",name:"Chain Partners",type:"Strategic",tier:"strategic"},{icon:"💼",name:"Tech Holdings",type:"Corporate",tier:"growth"}],j=[{icon:"📋",title:"투자 문의",desc:"투자 의향서 제출",duration:"1-3일"},{icon:"🔍",title:"실사(DD)",desc:"기업 및 투자자 실사",duration:"1-2주"},{icon:"📝",title:"계약 협상",desc:"투자 조건 협의",duration:"1-2주"},{icon:"💸",title:"자금 납입",desc:"투자금 전송",duration:"3-5일"},{icon:"🎉",title:"토큰 배정",desc:"투자 확정 및 배정",duration:"즉시"}],V=[{icon:"💰",title:"우수한 가격",value:"50%+ 할인",desc:"퍼블릭 대비 절반 가격에 투자"},{icon:"🔓",title:"TGE 즉시 유동성",value:"5% 해제",desc:"상장 시점 즉시 유동화 가능"},{icon:"🤝",title:"전략적 파트너십",value:"독점 혜택",desc:"프로젝트와의 긴밀한 협력"}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:109:4","data-component-name":"div",className:"private-round-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/private-round.tsx:110:6","data-component-name":"style",children:`
        .private-round-page {
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
          --private-primary: #8B5CF6;
          --private-secondary: #7C3AED;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-private: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes lockPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); } }
        @keyframes progressFill { 0% { width: 0%; } 100% { width: 72%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .private-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
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
        .nav-links a:hover { color: var(--private-primary); }

        .connect-btn {
          background: var(--gradient-private);
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
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
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
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--private-primary);
          margin-bottom: 2rem;
        }

        .badge .lock-icon { animation: lockPulse 2s ease-in-out infinite; display: inline-block; }

        .round-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(139, 92, 246, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--private-primary);
          margin-left: 10px;
        }

        .round-status .dot {
          width: 8px;
          height: 8px;
          background: var(--private-primary);
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
          background: var(--gradient-private);
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

        .fundraise-progress {
          background: var(--dark-card);
          border: 1px solid rgba(139, 92, 246, 0.3);
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

        .progress-header .raised { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); }
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
          background: var(--gradient-private);
          border-radius: 100px;
          width: 72%;
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

        .progress-stats .percent { color: var(--private-primary); font-weight: 700; }
        .progress-stats .remaining { color: var(--gray); }

        .investment-highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .highlight-card {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .highlight-card .value { font-size: 1.75rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .highlight-card .label { font-size: 0.85rem; color: var(--light-gray); }
        .highlight-card .compare { font-size: 0.75rem; color: var(--success); margin-top: 0.25rem; }

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
          border-color: var(--private-primary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-private);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-private);
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
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
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

        .btn-secondary:hover { border-color: var(--private-primary); color: var(--private-primary); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(139, 92, 246, 0.15);
          color: var(--private-primary);
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
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent);
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
        .comparison-table tr.highlight td { background: rgba(139, 92, 246, 0.1); }

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
        .round-badge.private { background: rgba(139, 92, 246, 0.2); color: var(--private-primary); }
        .round-badge.public { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
        .round-badge.current { animation: glow 2s ease-in-out infinite; }

        .discount-badge {
          background: rgba(139, 92, 246, 0.2);
          color: var(--private-primary);
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

        .tier-card.institutional { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.strategic { border-color: var(--private-primary); }
        .tier-card.growth { border-color: var(--indigo); }
        .tier-card.standard { border-color: var(--cyan); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.institutional .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.strategic .tier-header { background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); }
        .tier-card.growth .tier-header { background: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%); }
        .tier-card.standard .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.institutional .tier-name { color: var(--gold); }
        .tier-card.strategic .tier-name { color: var(--private-primary); }
        .tier-card.growth .tier-name { color: var(--indigo); }
        .tier-card.standard .tier-name { color: var(--cyan); }

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

        .tier-card.institutional .tier-amount .value { color: var(--gold); }
        .tier-card.strategic .tier-amount .value { color: var(--private-primary); }
        .tier-card.growth .tier-amount .value { color: var(--indigo); }
        .tier-card.standard .tier-amount .value { color: var(--cyan); }

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

        .tier-card.institutional .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.strategic .tier-btn { background: var(--gradient-private); color: var(--white); }
        .tier-card.growth .tier-btn { background: linear-gradient(135deg, var(--indigo), var(--blue)); color: var(--white); }
        .tier-card.standard .tier-btn { background: linear-gradient(135deg, var(--cyan), var(--blue)); color: var(--white); }

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
        .vesting-phase .value { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .vesting-phase .desc { font-size: 0.8rem; color: var(--gray); }

        .allocation-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .allocation-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .allocation-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .allocation-card:hover {
          border-color: var(--private-primary);
          transform: translateY(-5px);
        }

        .allocation-card .icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .allocation-card .name { font-weight: 700; margin-bottom: 0.25rem; }
        .allocation-card .amount { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.25rem; }
        .allocation-card .percent { font-size: 0.85rem; color: var(--gray); }

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
          background: rgba(139, 92, 246, 0.05);
          border-color: var(--private-primary);
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
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.2));
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

        .investor-card-tier.institutional { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .investor-card-tier.strategic { background: rgba(139, 92, 246, 0.2); color: var(--private-primary); }
        .investor-card-tier.growth { background: rgba(99, 102, 241, 0.2); color: var(--indigo); }

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
          background: linear-gradient(90deg, var(--private-primary), var(--indigo), var(--blue), var(--cyan), var(--gold));
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

        .process-item:nth-child(1) .process-dot { background: var(--private-primary); }
        .process-item:nth-child(2) .process-dot { background: var(--indigo); }
        .process-item:nth-child(3) .process-dot { background: var(--blue); }
        .process-item:nth-child(4) .process-dot { background: var(--cyan); }
        .process-item:nth-child(5) .process-dot { background: var(--gold); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--private-primary); font-weight: 600; margin-top: 0.5rem; }

        .why-private-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .why-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .why-card:hover {
          border-color: var(--private-primary);
          transform: translateY(-5px);
        }

        .why-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .why-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
        .why-card .value { font-size: 1.5rem; font-weight: 800; color: var(--private-primary); margin-bottom: 0.5rem; }
        .why-card p { font-size: 0.85rem; color: var(--light-gray); }

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

        .faq-chevron { color: var(--private-primary); transition: transform 0.3s; }
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
          background: var(--gradient-private);
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

        .social-links a:hover { background: var(--private-primary); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--private-primary); }

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
          .tiers-grid, .allocation-grid { grid-template-columns: repeat(2, 1fr); }
          .why-private-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid, .investment-highlights { grid-template-columns: repeat(2, 1fr); }
          .vesting-visual { grid-template-columns: repeat(2, 1fr); }
          .vesting-phase::after { display: none; }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .investment-highlights, .tiers-grid, .allocation-grid { grid-template-columns: 1fr; }
          .investors-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:110,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/private-round.tsx:969:6","data-component-name":"header",className:"private-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:970:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:971:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:972:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(F,{"data-replit-metadata":"client/src/pages/private-round.tsx:973:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:973,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:972,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:975:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:975:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:975,columnNumber:136},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:975,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:971,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/private-round.tsx:977:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:978:12","data-component-name":"a",href:"#tiers",children:"투자 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:978,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:979:12","data-component-name":"a",href:"#vesting",children:"베스팅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:979,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:980:12","data-component-name":"a",href:"#allocation",children:"배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:980,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:981:12","data-component-name":"a",href:"#investors",children:"투자자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:981,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:982:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:982,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:977,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/private-round.tsx:984:10","data-component-name":"button",className:"connect-btn",onClick:b,"data-testid":"button-connect-wallet",children:d?h(u):"🔐 기관 투자 문의"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:984,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:970,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:969,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:995:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:996:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:996,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:997:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:998:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:999:12","data-component-name":"span",className:"lock-icon",children:"🔐"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:999,columnNumber:13},this)," PRIVATE ROUND - 기관 투자",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1000:12","data-component-name":"span",className:"round-status",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1000:43","data-component-name":"span",className:"dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1e3,columnNumber:137},this)," 진행중"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1e3,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:998,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/private-round.tsx:1002:10","data-component-name":"h1",children:["프라이빗 라운드 투자로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/private-round.tsx:1003:24","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1003,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1004:12","data-component-name":"span",className:"gradient-text",children:"9억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1004,columnNumber:13},this)," 기회를 잡으세요"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1002,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1006:10","data-component-name":"p",className:"hero-subtitle",children:"기관 투자자, VC, 패밀리 오피스를 위한 50% 할인 기관 전용 투자 기회. TGE 5% 즉시 해제."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1006,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1011:10","data-component-name":"div",className:"fundraise-progress","data-testid":"fundraise-progress",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1012:12","data-component-name":"div",className:"progress-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1013:14","data-component-name":"span",className:"raised",children:"$9,720,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1013,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1014:14","data-component-name":"span",className:"goal",children:"목표 $13,500,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1014,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1012,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1016:12","data-component-name":"div",className:"progress-bar",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1017:14","data-component-name":"div",className:"progress-fill"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1017,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1016,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1019:12","data-component-name":"div",className:"progress-stats",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1020:14","data-component-name":"span",className:"percent",children:"72% 달성"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1020,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1021:14","data-component-name":"span",className:"remaining",children:"$3,780,000 남음"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1021,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1019,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1011,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1025:10","data-component-name":"div",className:"investment-highlights","data-testid":"investment-highlights",children:N.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1027:14","data-component-name":"div",className:"highlight-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1028:16","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1028,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1029:16","data-component-name":"div",className:"label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1029,columnNumber:17},this),a.compare&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1030:33","data-component-name":"div",className:"compare",children:a.compare},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1030,columnNumber:34},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1027,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1025,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1035:10","data-component-name":"div",className:"stats-grid",children:x?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1037:14","data-component-name":"div",className:"stat-card","data-testid":"loading-indicator",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1038:16","data-component-name":"div",className:"stat-value",style:{opacity:.5},children:"로딩중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1038,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1037,columnNumber:15},this):e.jsxDEV(e.Fragment,{children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1042:16","data-component-name":"div",className:"stat-card","data-testid":"stat-total-private",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1043:18","data-component-name":"div",className:"stat-value",children:(t==null?void 0:t.allocation)||"9억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1043,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1044:18","data-component-name":"div",className:"stat-label",children:"프라이빗 배정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1044,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1042,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1046:16","data-component-name":"div",className:"stat-card","data-testid":"stat-price",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1047:18","data-component-name":"div",className:"stat-value",children:(t==null?void 0:t.price)||"$0.015"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1047,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1048:18","data-component-name":"div",className:"stat-label",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1048,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1046,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1050:16","data-component-name":"div",className:"stat-card","data-testid":"stat-hardcap",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1051:18","data-component-name":"div",className:"stat-value",children:(t==null?void 0:t.raised)||"$13.5M"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1051,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1052:18","data-component-name":"div",className:"stat-label",children:"하드캡"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1052,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1050,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1054:16","data-component-name":"div",className:"stat-card","data-testid":"stat-investors",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1055:18","data-component-name":"div",className:"stat-value",children:[(t==null?void 0:t.investors)||28,"+"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1055,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1056:18","data-component-name":"div",className:"stat-label",children:"기관 투자자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1056,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1054,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1041,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1035,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1062:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/private-round.tsx:1063:12","data-component-name":"button",className:"btn-primary","data-testid":"button-apply-private",children:"🔐 프라이빗 투자 신청"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1063,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/private-round.tsx:1066:12","data-component-name":"button",className:"btn-secondary",children:"📖 투자 덱 보기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1066,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1062,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:997,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:995,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1074:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1075:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1076:10","data-component-name":"span",className:"section-badge",children:"COMPARISON"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1076,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1077:10","data-component-name":"h2",className:"section-title",children:"라운드 비교"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1077,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1078:10","data-component-name":"p",className:"section-subtitle",children:"프라이빗 라운드는 시드와 퍼블릭의 중간 조건"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1078,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1075,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1081:8","data-component-name":"div",className:"round-comparison",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1082:10","data-component-name":"div",className:"comparison-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/private-round.tsx:1083:12","data-component-name":"h3",children:"📊 투자 라운드 비교"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1083,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1082,columnNumber:11},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/private-round.tsx:1085:10","data-component-name":"table",className:"comparison-table",children:[e.jsxDEV("thead",{"data-replit-metadata":"client/src/pages/private-round.tsx:1086:12","data-component-name":"thead",children:e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/private-round.tsx:1087:14","data-component-name":"tr",children:[e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/private-round.tsx:1088:16","data-component-name":"th",children:"라운드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1088,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/private-round.tsx:1089:16","data-component-name":"th",children:"토큰 가격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1089,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/private-round.tsx:1090:16","data-component-name":"th",children:"할인율"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1090,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/private-round.tsx:1091:16","data-component-name":"th",children:"상태"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1091,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1087,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1086,columnNumber:13},this),e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/private-round.tsx:1094:12","data-component-name":"tbody",children:f.map(a=>e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/private-round.tsx:1096:16","data-component-name":"tr",className:a.status==="current"?"highlight":"",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/private-round.tsx:1097:18","data-component-name":"td",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1098:20","data-component-name":"span",className:`round-badge ${a.id} ${a.status==="current"?"current":""}`,children:["🔐 ",a.name]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1098,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1097,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/private-round.tsx:1102:18","data-component-name":"td",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1102,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/private-round.tsx:1103:18","data-component-name":"td",children:[a.discount,a.status==="current"&&e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1105:51","data-component-name":"span",className:"discount-badge",children:"진행중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1105,columnNumber:52},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1103,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/private-round.tsx:1107:18","data-component-name":"td",children:a.status==="completed"?"✅ 완료":a.status==="current"?"🔐 진행중":"⏳ 예정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1107,columnNumber:19},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1096,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1094,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1085,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1081,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1074,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1119:6","data-component-name":"section",className:"section",id:"tiers",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1120:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1121:10","data-component-name":"span",className:"section-badge",children:"TIERS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1121,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1122:10","data-component-name":"h2",className:"section-title",children:"투자 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1122,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1123:10","data-component-name":"p",className:"section-subtitle",children:"기관 투자 규모별 차등 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1123,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1120,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1126:8","data-component-name":"div",className:"tiers-grid",children:k.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1128:12","data-component-name":"div",className:`tier-card ${a.id}`,"data-testid":`tier-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1129:14","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1130:16","data-component-name":"div",className:"tier-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1130,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/private-round.tsx:1131:16","data-component-name":"h3",className:"tier-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1131,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1132:16","data-component-name":"p",className:"tier-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1132,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1129,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1134:14","data-component-name":"div",className:"tier-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1135:16","data-component-name":"div",className:"tier-amount",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1136:18","data-component-name":"div",className:"label",children:"최소 투자금"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1136,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1137:18","data-component-name":"div",className:"value",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1137,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1135,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1139:16","data-component-name":"div",className:"tier-details",children:a.details.map((r,l)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1141:20","data-component-name":"div",className:"tier-detail-item",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1142:22","data-component-name":"span",className:"label",children:r.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1142,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1143:22","data-component-name":"span",className:"value",children:r.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1143,columnNumber:23},this)]},l,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1141,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1139,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/private-round.tsx:1147:16","data-component-name":"ul",className:"tier-benefits",children:a.benefits.map((r,l)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1149:20","data-component-name":"li",children:r},l,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1149,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1147,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/private-round.tsx:1152:16","data-component-name":"button",className:"tier-btn",children:"투자 문의"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1152,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1134,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1128,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1126,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1119,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1160:6","data-component-name":"section",className:"section",id:"vesting",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1161:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1162:10","data-component-name":"span",className:"section-badge",children:"VESTING"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1162,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1163:10","data-component-name":"h2",className:"section-title",children:"베스팅 스케줄"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1163,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1164:10","data-component-name":"p",className:"section-subtitle",children:"TGE 5% 즉시 해제, 이후 월간 베스팅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1164,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1161,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1167:8","data-component-name":"div",className:"vesting-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1168:10","data-component-name":"div",className:"vesting-visual",children:w.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1170:14","data-component-name":"div",className:"vesting-phase",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1171:16","data-component-name":"div",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1171,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1172:16","data-component-name":"div",className:"title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1172,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1173:16","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1173,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1174:16","data-component-name":"div",className:"desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1174,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1170,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1168,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1167,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1160,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1182:6","data-component-name":"section",className:"section",id:"allocation",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1183:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1184:10","data-component-name":"span",className:"section-badge",children:"ALLOCATION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1184,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1185:10","data-component-name":"h2",className:"section-title",children:"투자자 유형별 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1185,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1186:10","data-component-name":"p",className:"section-subtitle",children:"9억 TBURN 배분 현황"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1186,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1183,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1189:8","data-component-name":"div",className:"allocation-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1190:10","data-component-name":"div",className:"allocation-grid",children:E.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1192:14","data-component-name":"div",className:"allocation-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1193:16","data-component-name":"div",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1193,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1194:16","data-component-name":"div",className:"name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1194,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1195:16","data-component-name":"div",className:"amount",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1195,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1196:16","data-component-name":"div",className:"percent",children:a.percent},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1196,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1192,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1190,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1189,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1182,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1204:6","data-component-name":"section",className:"section",id:"investors",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1205:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1206:10","data-component-name":"span",className:"section-badge",children:"INVESTORS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1206,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1207:10","data-component-name":"h2",className:"section-title",children:"현재 투자자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1207,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1208:10","data-component-name":"p",className:"section-subtitle",children:"함께하는 기관 파트너"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1208,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1205,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1211:8","data-component-name":"div",className:"investors-showcase",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1212:10","data-component-name":"div",className:"investors-grid",children:D.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1214:14","data-component-name":"div",className:"investor-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1215:16","data-component-name":"div",className:"investor-logo",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1215,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1216:16","data-component-name":"div",className:"investor-card-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1216,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1217:16","data-component-name":"div",className:"investor-card-type",children:a.type},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1217,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1218:16","data-component-name":"span",className:`investor-card-tier ${a.tier}`,children:a.tier.toUpperCase()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1218,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1214,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1212,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1211,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1204,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1228:6","data-component-name":"section",className:"section",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1229:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1230:10","data-component-name":"span",className:"section-badge",children:"PROCESS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1230,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1231:10","data-component-name":"h2",className:"section-title",children:"투자 절차"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1231,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1232:10","data-component-name":"p",className:"section-subtitle",children:"기관 투자 진행 과정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1232,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1229,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1235:8","data-component-name":"div",className:"process-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1236:10","data-component-name":"div",className:"process-timeline",children:j.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1238:14","data-component-name":"div",className:"process-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1239:16","data-component-name":"div",className:"process-dot",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1239,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1240:16","data-component-name":"div",className:"process-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1240,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1241:16","data-component-name":"div",className:"process-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1241,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1242:16","data-component-name":"div",className:"process-duration",children:a.duration},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1242,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1238,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1236,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1235,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1228,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1250:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1251:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1252:10","data-component-name":"span",className:"section-badge",children:"BENEFITS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1252,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1253:10","data-component-name":"h2",className:"section-title",children:"프라이빗 라운드 장점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1253,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1254:10","data-component-name":"p",className:"section-subtitle",children:"기관 투자자 전용 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1254,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1251,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1257:8","data-component-name":"div",className:"why-private-grid",children:V.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1259:12","data-component-name":"div",className:"why-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1260:14","data-component-name":"div",className:"why-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1260,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/private-round.tsx:1261:14","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1261,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1262:14","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1262,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1263:14","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1263,columnNumber:15},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1259,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1257,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1250,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1270:6","data-component-name":"section",className:"section",id:"faq",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1271:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1272:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1272,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1273:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1273,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1274:10","data-component-name":"p",className:"section-subtitle",children:"프라이빗 투자에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1274,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1271,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1277:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1278:10","data-component-name":"div",className:`faq-item ${i==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1279:12","data-component-name":"div",className:"faq-question",onClick:()=>s("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/private-round.tsx:1280:14","data-component-name":"h4",children:"프라이빗 라운드 참여 자격은 무엇인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1280,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1281:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1281,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1279,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1283:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1284:14","data-component-name":"p",children:"프라이빗 라운드는 기관 투자자, VC, 패밀리 오피스, 기업 투자자 등을 대상으로 합니다. 최소 투자 금액은 $100,000이며, 더 높은 티어는 더 큰 할인과 혜택을 제공합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1284,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1283,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1278,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1288:10","data-component-name":"div",className:`faq-item ${i==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1289:12","data-component-name":"div",className:"faq-question",onClick:()=>s("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/private-round.tsx:1290:14","data-component-name":"h4",children:"시드 라운드와 어떤 차이가 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1290,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1291:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1291,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1289,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1293:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1294:14","data-component-name":"p",children:"시드 라운드($0.008, 70% 할인)는 완료되었습니다. 프라이빗 라운드($0.015, 50% 할인)는 시드 대비 높은 가격이지만, TGE 5% 즉시 해제와 더 짧은 클리프 기간(3개월)이 장점입니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1294,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1293,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1288,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1298:10","data-component-name":"div",className:`faq-item ${i==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1299:12","data-component-name":"div",className:"faq-question",onClick:()=>s("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/private-round.tsx:1300:14","data-component-name":"h4",children:"TGE 즉시 해제는 어떻게 되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1300,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1301:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1301,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1299,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1303:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1304:14","data-component-name":"p",children:"Token Generation Event(TGE) 시점에 투자 토큰의 5%가 즉시 해제됩니다. 기관 티어에 따라 최대 7%까지 즉시 해제 가능하며, 나머지는 3개월 클리프 후 월간 베스팅됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1304,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1303,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1298,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1308:10","data-component-name":"div",className:`faq-item ${i==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1309:12","data-component-name":"div",className:"faq-question",onClick:()=>s("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/private-round.tsx:1310:14","data-component-name":"h4",children:"실사(Due Diligence) 과정은 어떻게 되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1310,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1311:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1311,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1309,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1313:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1314:14","data-component-name":"p",children:"프라이빗 투자는 양방향 실사가 필요합니다. 투자자는 프로젝트에 대한 기술, 재무, 법률 실사를 진행하고, 프로젝트는 투자자의 자금 출처와 투자 자격을 확인합니다. 일반적으로 1-2주가 소요됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1314,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1313,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1308,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1277,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1270,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/private-round.tsx:1321:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1322:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/private-round.tsx:1323:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"기관 투자자가 되세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1323,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1324:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN Chain의 프라이빗 투자자로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/private-round.tsx:1325:34","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1325,columnNumber:35},this),"50% 할인과 TGE 즉시 유동성을 확보하세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1324,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/private-round.tsx:1328:10","data-component-name":"button",className:"btn-primary",style:{background:"var(--dark)",fontSize:"1.25rem",padding:"20px 50px"},children:"🔐 지금 투자하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1328,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1322,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1321,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/private-round.tsx:1335:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1336:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1337:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/private-round.tsx:1338:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/private-round.tsx:1338:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1338,columnNumber:113},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1338,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1339:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/private-round.tsx:1339:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1339,columnNumber:123},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1339,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1340:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:1341:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1341,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:1342:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1342,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:1343:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1343,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:1344:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1344,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1340,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1337,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1347:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/private-round.tsx:1348:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1348,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/private-round.tsx:1349:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1350:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1350:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1350,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1350,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1351:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1351:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1351,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1351,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1352:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1352:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1352,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1352,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1353:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1353:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1353,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1353,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1349,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1347,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1356:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/private-round.tsx:1357:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1357,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/private-round.tsx:1358:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1359:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1359:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1359,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1359,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1360:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1360:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1360,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1360,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1361:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:1361:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1361,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1361,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1362:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1362:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1362,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1362,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1358,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1356,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1365:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/private-round.tsx:1366:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1366,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/private-round.tsx:1367:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1368:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1368:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1368,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1368,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1369:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:1369:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1369,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1369,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1370:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/private-round.tsx:1370:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1370,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1370,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/private-round.tsx:1371:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1371:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1371,columnNumber:110},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1371,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1367,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1365,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1336,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1375:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/private-round.tsx:1376:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1376,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/private-round.tsx:1377:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1378:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1378,columnNumber:13},this),e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/private-round.tsx:1379:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1379,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1377,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1375,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:1335,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/private-round.tsx",lineNumber:109,columnNumber:5},this)}export{A as default};
