import{r as j,j as e}from"./index-MawzfEWf.js";import{d as V,L as t}from"./index-DNbWdfiD.js";import{ac as y,n as q}from"./tburn-loader-BM0jq71g.js";import"./i18nInstance-DCxlOlkw.js";function A(){var l,d;const{isConnected:m,address:g,connect:h,disconnect:u,formatAddress:x}=y(),[i,b]=j.useState("faq-1"),{data:o,isLoading:c}=V({queryKey:["/api/token-programs/partnerships/stats"]}),s=o==null?void 0:o.data,p=r=>{b(i===r?null:r)},N=["🏛️","💱","🔗","⚡","🌐","🔐"],f=[{id:"strategic",icon:"🏛️",name:"전략적 파트너",amount:"1.2억",percent:"30%"},{id:"exchange",icon:"💱",name:"거래소 파트너",amount:"1억",percent:"25%"},{id:"tech",icon:"🔧",name:"기술 파트너",amount:"0.8억",percent:"20%"},{id:"marketing",icon:"📢",name:"마케팅 파트너",amount:"0.6억",percent:"15%"},{id:"ecosystem",icon:"🌱",name:"생태계 파트너",amount:"0.4억",percent:"10%"}],v=[{id:"platinum",icon:"💎",name:"Platinum",subtitle:"최상위 파트너",incentive:"최대 500만",benefits:["전용 기술 지원","공동 마케팅","우선 통합 지원","거버넌스 특권","독점 이벤트"],color:"#E5E4E2"},{id:"gold",icon:"👑",name:"Gold",subtitle:"프리미엄 파트너",incentive:"최대 200만",benefits:["우선 기술 지원","마케팅 협업","통합 지원","DAO 투표권","파트너 이벤트"],color:"#D4AF37"},{id:"silver",icon:"🥈",name:"Silver",subtitle:"성장 파트너",incentive:"최대 50만",benefits:["기술 문서 접근","공동 홍보","API 액세스","기본 투표권","네트워킹"],color:"#C0C0C0"},{id:"bronze",icon:"🥉",name:"Bronze",subtitle:"신규 파트너",incentive:"최대 10만",benefits:["문서 접근","로고 사용권","기본 API","커뮤니티 참여","뉴스레터"],color:"#CD7F32"}],k=[{id:"strategic",icon:"🏛️",title:"전략적 파트너",desc:"장기적인 비전을 공유하는 핵심 파트너",benefits:[{value:"500만+",label:"최대 인센티브"},{value:"24/7",label:"전담 지원"}],features:["공동 제품 개발","브랜드 협업","전략적 투자","기술 통합"]},{id:"exchange",icon:"💱",title:"거래소 파트너",desc:"TBURN 토큰 상장 및 거래 지원",benefits:[{value:"200만+",label:"리스팅 보너스"},{value:"50%",label:"수수료 할인"}],features:["토큰 상장 지원","유동성 공급","마케팅 지원","트레이딩 대회"]},{id:"tech",icon:"🔧",title:"기술 파트너",desc:"인프라 및 개발 도구 협력",benefits:[{value:"100만+",label:"통합 보너스"},{value:"무제한",label:"API 호출"}],features:["API/SDK 통합","인프라 제공","보안 감사","기술 자문"]},{id:"marketing",icon:"📢",title:"마케팅 파트너",desc:"브랜드 홍보 및 커뮤니티 확장",benefits:[{value:"50만+",label:"캠페인 예산"},{value:"100K+",label:"도달 범위"}],features:["공동 캠페인","인플루언서 협업","이벤트 공동개최","콘텐츠 제작"]}],w=[{icon:"📋",title:"신청서 제출",desc:"파트너십 신청서 작성",duration:"1일"},{icon:"🔍",title:"심사 & 평가",desc:"팀/비즈니스 검토",duration:"1주"},{icon:"💬",title:"미팅 & 협의",desc:"조건 논의 및 합의",duration:"1-2주"},{icon:"📝",title:"계약 체결",desc:"파트너십 계약 서명",duration:"1주"},{icon:"🚀",title:"통합 & 런칭",desc:"기술 통합 및 공식 발표",duration:"2-4주"}],E=[{icon:"🔗",name:"ChainLink Pro",type:"기술 파트너",quote:"TBURN Chain과의 통합으로 우리 오라클 서비스의 처리량이 300% 향상되었습니다.",stats:[{value:"300%",label:"성능 향상"},{value:"2.5M",label:"거래 처리"}]},{icon:"💱",name:"Global Exchange",type:"거래소 파트너",quote:"TBURN 상장 후 거래량이 급증했고, 사용자들의 만족도가 매우 높습니다.",stats:[{value:"$50M",label:"거래량"},{value:"150K",label:"신규 사용자"}]},{icon:"🌿",name:"DeFi Protocol",type:"전략적 파트너",quote:"파트너십을 통해 새로운 DeFi 상품을 빠르게 출시할 수 있었습니다.",stats:[{value:"$25M",label:"TVL"},{value:"10K",label:"일일 사용자"}]}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:108:4","data-component-name":"div",className:"partnership-program-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:109:6","data-component-name":"style",children:`
        .partnership-program-page {
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
          --indigo: #6366F1;
          --rose: #F43F5E;
          --violet: #7C3AED;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-partner: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          --gradient-platinum: linear-gradient(135deg, #E5E4E2 0%, #A9A9A9 50%, #E5E4E2 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes handshake { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes logoFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.05); } }

        .partner-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(124, 58, 237, 0.2);
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
        .nav-links a:hover { color: var(--violet); }

        .connect-btn {
          background: var(--gradient-partner);
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
          box-shadow: 0 10px 40px rgba(124, 58, 237, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%);
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
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(124, 58, 237, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--violet);
          margin-bottom: 2rem;
        }

        .badge .handshake-icon { animation: handshake 1s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-partner);
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

        .partner-logos-banner {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .partner-logos-title {
          font-size: 0.8rem;
          color: var(--gray);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1.5rem;
        }

        .partner-logos-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .partner-logo-item {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          transition: all 0.3s;
          animation: logoFloat 3s ease-in-out infinite;
        }

        .partner-logo-item:nth-child(2) { animation-delay: 0.5s; }
        .partner-logo-item:nth-child(3) { animation-delay: 1s; }
        .partner-logo-item:nth-child(4) { animation-delay: 1.5s; }
        .partner-logo-item:nth-child(5) { animation-delay: 2s; }
        .partner-logo-item:nth-child(6) { animation-delay: 2.5s; }

        .partner-logo-item:hover {
          background: rgba(124, 58, 237, 0.2);
          transform: scale(1.1);
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
          border-color: var(--violet);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-partner);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-partner);
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
          box-shadow: 0 20px 60px rgba(124, 58, 237, 0.4);
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

        .btn-secondary:hover { border-color: var(--violet); color: var(--violet); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(124, 58, 237, 0.15);
          color: var(--violet);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
        .section-subtitle { color: var(--light-gray); font-size: 1.125rem; max-width: 600px; margin: 0 auto; }

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
          border-color: var(--violet);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.strategic::before { background: linear-gradient(90deg, var(--indigo), var(--purple)); }
        .dist-card.exchange::before { background: linear-gradient(90deg, var(--warning), var(--gold)); }
        .dist-card.tech::before { background: linear-gradient(90deg, var(--cyan), var(--blue)); }
        .dist-card.marketing::before { background: linear-gradient(90deg, var(--pink), var(--rose)); }
        .dist-card.ecosystem::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--violet); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

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

        .tier-card.platinum { border-color: #E5E4E2; box-shadow: 0 0 40px rgba(229, 228, 226, 0.2); }
        .tier-card.gold { border-color: var(--gold); }
        .tier-card.silver { border-color: #C0C0C0; }
        .tier-card.bronze { border-color: #CD7F32; }

        .tier-header {
          padding: 2rem 1.5rem;
          text-align: center;
        }

        .tier-card.platinum .tier-header { background: linear-gradient(180deg, rgba(229, 228, 226, 0.15) 0%, transparent 100%); }
        .tier-card.gold .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.silver .tier-header { background: linear-gradient(180deg, rgba(192, 192, 192, 0.15) 0%, transparent 100%); }
        .tier-card.bronze .tier-header { background: linear-gradient(180deg, rgba(205, 127, 50, 0.15) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }

        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.platinum .tier-name { color: #E5E4E2; }
        .tier-card.gold .tier-name { color: var(--gold); }
        .tier-card.silver .tier-name { color: #C0C0C0; }
        .tier-card.bronze .tier-name { color: #CD7F32; }

        .tier-subtitle { font-size: 0.8rem; color: var(--gray); }

        .tier-content { padding: 1.5rem; }

        .tier-incentive {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .tier-incentive-label { font-size: 0.75rem; color: var(--gray); margin-bottom: 0.25rem; }

        .tier-incentive-value { font-size: 1.25rem; font-weight: 800; }

        .tier-card.platinum .tier-incentive-value { color: #E5E4E2; }
        .tier-card.gold .tier-incentive-value { color: var(--gold); }
        .tier-card.silver .tier-incentive-value { color: #C0C0C0; }
        .tier-card.bronze .tier-incentive-value { color: #CD7F32; }

        .tier-benefits { list-style: none; margin-bottom: 1rem; padding: 0; }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 0.85rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-benefits li:last-child { border-bottom: none; }
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

        .tier-card.platinum .tier-btn { background: var(--gradient-platinum); color: var(--dark); }
        .tier-card.gold .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.silver .tier-btn { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .tier-card.bronze .tier-btn { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }

        .tier-btn:hover { transform: scale(1.02); }

        .partner-types-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .partner-type-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .partner-type-card:hover {
          border-color: var(--violet);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .partner-type-header {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .partner-type-card.strategic .partner-type-header { background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), transparent); }
        .partner-type-card.exchange .partner-type-header { background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), transparent); }
        .partner-type-card.tech .partner-type-header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), transparent); }
        .partner-type-card.marketing .partner-type-header { background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), transparent); }

        .partner-type-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .partner-type-card.strategic .partner-type-icon { background: rgba(99, 102, 241, 0.2); }
        .partner-type-card.exchange .partner-type-icon { background: rgba(245, 158, 11, 0.2); }
        .partner-type-card.tech .partner-type-icon { background: rgba(6, 182, 212, 0.2); }
        .partner-type-card.marketing .partner-type-icon { background: rgba(236, 72, 153, 0.2); }

        .partner-type-info h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
        .partner-type-info p { font-size: 0.9rem; color: var(--gray); }

        .partner-type-content { padding: 0 2rem 2rem; }

        .partner-type-benefits {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .benefit-box {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }

        .benefit-box .value { font-size: 1.25rem; font-weight: 800; color: var(--violet); margin-bottom: 0.25rem; }
        .benefit-box .label { font-size: 0.8rem; color: var(--gray); }

        .partner-type-features { list-style: none; padding: 0; }

        .partner-type-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .partner-type-features li::before { content: '✓'; color: var(--success); }

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
          background: linear-gradient(90deg, var(--violet), var(--purple), var(--indigo), var(--blue), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--violet); }
        .process-item:nth-child(2) .process-dot { background: var(--purple); }
        .process-item:nth-child(3) .process-dot { background: var(--indigo); }
        .process-item:nth-child(4) .process-dot { background: var(--blue); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--violet); font-weight: 600; margin-top: 0.5rem; }

        .success-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .success-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          transition: all 0.3s;
        }

        .success-card:hover {
          border-color: var(--violet);
          transform: translateY(-5px);
        }

        .success-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .success-logo {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.2));
        }

        .success-info h4 { font-size: 1.125rem; font-weight: 700; }
        .success-info p { font-size: 0.85rem; color: var(--gray); }

        .success-quote {
          font-style: italic;
          color: var(--light-gray);
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }

        .success-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .success-stat {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          text-align: center;
        }

        .success-stat .value { font-size: 1.25rem; font-weight: 800; color: var(--violet); }
        .success-stat .label { font-size: 0.75rem; color: var(--gray); }

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

        .faq-chevron { color: var(--violet); transition: transform 0.3s; }
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
          background: var(--gradient-partner);
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

        .social-links a:hover { background: var(--violet); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--violet); }

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
          .partner-types-grid { grid-template-columns: 1fr; }
          .success-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .tiers-grid { grid-template-columns: 1fr; }
          .partner-logos-grid { gap: 1.5rem; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:109,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:872:6","data-component-name":"header",className:"partner-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:873:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:874:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:875:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(q,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:876:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:876,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:875,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:878:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:878:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:878,columnNumber:142},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:878,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:874,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:880:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:881:12","data-component-name":"a",href:"#tiers",children:"파트너 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:881,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:882:12","data-component-name":"a",href:"#types",children:"파트너 유형"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:882,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:883:12","data-component-name":"a",href:"#process",children:"프로세스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:883,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:884:12","data-component-name":"a",href:"#success",children:"성공사례"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:884,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:885:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:885,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:880,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:887:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:()=>m?u():h("metamask"),children:m?`🔗 ${x(g||"")}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:887,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:873,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:872,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:898:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:899:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:899,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:900:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:901:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:902:12","data-component-name":"span",className:"handshake-icon",children:"🤝"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:902,columnNumber:13},this)," PARTNERSHIP PROGRAM - 함께 성장하는 파트너십"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:901,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:904:10","data-component-name":"h1",children:["TBURN 파트너가 되어",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:905:25","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:905,columnNumber:26},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:906:12","data-component-name":"span",className:"gradient-text",children:"4억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:906,columnNumber:13},this)," 인센티브를 받으세요"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:904,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:908:10","data-component-name":"p",className:"hero-subtitle",children:"전략적 파트너, 거래소, 기술 파트너, 마케팅 파트너로 TBURN 생태계와 함께 성장하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:908,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:913:10","data-component-name":"div",className:"partner-logos-banner","data-testid":"partner-logos",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:914:12","data-component-name":"div",className:"partner-logos-title",children:"우리의 파트너"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:914,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:915:12","data-component-name":"div",className:"partner-logos-grid",children:N.map((r,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:917:16","data-component-name":"div",className:"partner-logo-item",children:r},a,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:917,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:915,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:913,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:922:10","data-component-name":"div",className:"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:923:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-incentive",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:924:14","data-component-name":"div",className:"stat-value",children:c?"...":((l=s==null?void 0:s.partnerships)==null?void 0:l.allocation)||"4억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:924,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:927:14","data-component-name":"div",className:"stat-label",children:"총 파트너 인센티브"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:927,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:923,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:929:12","data-component-name":"div",className:"stat-card","data-testid":"stat-partners",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:930:14","data-component-name":"div",className:"stat-value",children:c?"...":`${((d=s==null?void 0:s.partnerships)==null?void 0:d.total)||45}+`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:930,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:933:14","data-component-name":"div",className:"stat-label",children:"활성 파트너"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:933,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:929,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:935:12","data-component-name":"div",className:"stat-card","data-testid":"stat-categories",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:936:14","data-component-name":"div",className:"stat-value",children:"5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:936,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:937:14","data-component-name":"div",className:"stat-label",children:"파트너 카테고리"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:937,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:935,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:939:12","data-component-name":"div",className:"stat-card","data-testid":"stat-max-incentive",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:940:14","data-component-name":"div",className:"stat-value",children:"500만"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:940,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:941:14","data-component-name":"div",className:"stat-label",children:"최대 인센티브"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:941,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:939,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:922,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:945:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:946:12","data-component-name":"button",className:"btn-primary","data-testid":"button-apply-partner",children:"🤝 파트너 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:946,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:949:12","data-component-name":"button",className:"btn-secondary",children:"📖 파트너 가이드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:949,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:945,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:900,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:898,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:957:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:958:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:959:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:959,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:960:10","data-component-name":"h2",className:"section-title",children:"인센티브 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:960,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:961:10","data-component-name":"p",className:"section-subtitle",children:"4억 TBURN이 5가지 파트너 유형으로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:961,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:958,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:964:8","data-component-name":"div",className:"distribution-grid",children:f.map(r=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:966:12","data-component-name":"div",className:`dist-card ${r.id}`,"data-testid":`dist-${r.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:967:14","data-component-name":"div",className:"dist-icon",children:r.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:967,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:968:14","data-component-name":"div",className:"dist-name",children:r.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:968,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:969:14","data-component-name":"div",className:"dist-amount",children:r.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:969,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:970:14","data-component-name":"div",className:"dist-percent",children:r.percent},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:970,columnNumber:15},this)]},r.id,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:966,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:964,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:957,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:977:6","data-component-name":"section",className:"section",id:"tiers",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:978:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:979:10","data-component-name":"span",className:"section-badge",children:"TIERS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:979,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:980:10","data-component-name":"h2",className:"section-title",children:"파트너 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:980,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:981:10","data-component-name":"p",className:"section-subtitle",children:"기여도에 따른 차등 혜택 시스템"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:981,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:978,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:984:8","data-component-name":"div",className:"tiers-grid",children:v.map(r=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:986:12","data-component-name":"div",className:`tier-card ${r.id}`,"data-testid":`tier-${r.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:987:14","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:988:16","data-component-name":"div",className:"tier-icon",children:r.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:988,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:989:16","data-component-name":"h3",className:"tier-name",children:r.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:989,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:990:16","data-component-name":"p",className:"tier-subtitle",children:r.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:990,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:987,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:992:14","data-component-name":"div",className:"tier-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:993:16","data-component-name":"div",className:"tier-incentive",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:994:18","data-component-name":"div",className:"tier-incentive-label",children:"파트너 인센티브"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:994,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:995:18","data-component-name":"div",className:"tier-incentive-value",children:[r.incentive," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:995,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:993,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:997:16","data-component-name":"ul",className:"tier-benefits",children:r.benefits.map((a,n)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:999:20","data-component-name":"li",children:a},n,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:999,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:997,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1002:16","data-component-name":"button",className:"tier-btn",children:"신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1002,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:992,columnNumber:15},this)]},r.id,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:986,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:984,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:977,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1010:6","data-component-name":"section",className:"section",id:"types",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1011:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1012:10","data-component-name":"span",className:"section-badge",children:"PARTNER TYPES"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1012,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1013:10","data-component-name":"h2",className:"section-title",children:"파트너 유형"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1013,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1014:10","data-component-name":"p",className:"section-subtitle",children:"다양한 방식으로 협력할 수 있습니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1014,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1011,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1017:8","data-component-name":"div",className:"partner-types-grid",children:k.map(r=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1019:12","data-component-name":"div",className:`partner-type-card ${r.id}`,"data-testid":`type-${r.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1020:14","data-component-name":"div",className:"partner-type-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1021:16","data-component-name":"div",className:"partner-type-icon",children:r.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1021,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1022:16","data-component-name":"div",className:"partner-type-info",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1023:18","data-component-name":"h3",children:r.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1023,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1024:18","data-component-name":"p",children:r.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1024,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1022,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1020,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1027:14","data-component-name":"div",className:"partner-type-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1028:16","data-component-name":"div",className:"partner-type-benefits",children:r.benefits.map((a,n)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1030:20","data-component-name":"div",className:"benefit-box",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1031:22","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1031,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1032:22","data-component-name":"div",className:"label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1032,columnNumber:23},this)]},n,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1030,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1028,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1036:16","data-component-name":"ul",className:"partner-type-features",children:r.features.map((a,n)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1038:20","data-component-name":"li",children:a},n,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1038,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1036,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1027,columnNumber:15},this)]},r.id,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1019,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1017,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1010,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1048:6","data-component-name":"section",className:"section",id:"process",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1049:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1050:10","data-component-name":"span",className:"section-badge",children:"PROCESS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1050,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1051:10","data-component-name":"h2",className:"section-title",children:"파트너십 프로세스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1051,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1052:10","data-component-name":"p",className:"section-subtitle",children:"약 4~6주 소요되는 파트너십 체결 과정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1052,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1049,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1055:8","data-component-name":"div",className:"process-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1056:10","data-component-name":"div",className:"process-timeline",children:w.map((r,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1058:14","data-component-name":"div",className:"process-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1059:16","data-component-name":"div",className:"process-dot",children:r.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1059,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1060:16","data-component-name":"div",className:"process-title",children:r.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1060,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1061:16","data-component-name":"div",className:"process-desc",children:r.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1061,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1062:16","data-component-name":"div",className:"process-duration",children:r.duration},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1062,columnNumber:17},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1058,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1056,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1055,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1048,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1070:6","data-component-name":"section",className:"section",id:"success",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1071:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1072:10","data-component-name":"span",className:"section-badge",children:"SUCCESS STORIES"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1072,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1073:10","data-component-name":"h2",className:"section-title",children:"파트너 성공사례"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1073,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1074:10","data-component-name":"p",className:"section-subtitle",children:"함께 성장한 파트너들의 이야기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1074,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1071,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1077:8","data-component-name":"div",className:"success-grid",children:E.map((r,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1079:12","data-component-name":"div",className:"success-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1080:14","data-component-name":"div",className:"success-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1081:16","data-component-name":"div",className:"success-logo",children:r.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1081,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1082:16","data-component-name":"div",className:"success-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1083:18","data-component-name":"h4",children:r.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1083,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1084:18","data-component-name":"p",children:r.type},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1084,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1082,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1080,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1087:14","data-component-name":"p",className:"success-quote",children:['"',r.quote,'"']},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1087,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1088:14","data-component-name":"div",className:"success-stats",children:r.stats.map((n,D)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1090:18","data-component-name":"div",className:"success-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1091:20","data-component-name":"div",className:"value",children:n.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1091,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1092:20","data-component-name":"div",className:"label",children:n.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1092,columnNumber:21},this)]},D,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1090,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1088,columnNumber:15},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1079,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1077,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1070,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1102:6","data-component-name":"section",className:"section",id:"faq",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1103:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1104:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1104,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1105:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1105,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1106:10","data-component-name":"p",className:"section-subtitle",children:"파트너십에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1106,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1103,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1109:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1110:10","data-component-name":"div",className:`faq-item ${i==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1111:12","data-component-name":"div",className:"faq-question",onClick:()=>p("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1112:14","data-component-name":"h4",children:"파트너 신청 자격은 어떻게 되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1112,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1113:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1113,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1111,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1115:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1116:14","data-component-name":"p",children:"블록체인 관련 사업을 영위하는 기업, 프로젝트, 서비스 제공업체 모두 신청 가능합니다. 규모에 상관없이 TBURN 생태계에 가치를 제공할 수 있는 모든 파트너를 환영합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1116,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1115,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1110,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1120:10","data-component-name":"div",className:`faq-item ${i==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1121:12","data-component-name":"div",className:"faq-question",onClick:()=>p("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1122:14","data-component-name":"h4",children:"파트너 티어는 어떻게 결정되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1122,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1123:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1123,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1121,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1125:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1126:14","data-component-name":"p",children:"파트너의 기여도, 통합 범위, 마케팅 협력 수준, 기술적 역량 등을 종합적으로 평가하여 티어가 결정됩니다. 시작 티어에서 활동에 따라 상위 티어로 승급할 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1126,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1125,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1120,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1130:10","data-component-name":"div",className:`faq-item ${i==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1131:12","data-component-name":"div",className:"faq-question",onClick:()=>p("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1132:14","data-component-name":"h4",children:"파트너 인센티브는 어떻게 지급되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1132,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1133:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1133,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1131,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1135:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1136:14","data-component-name":"p",children:"파트너십 계약 체결 시 초기 인센티브가 지급되며, 이후 마일스톤 달성 및 KPI 성과에 따라 추가 인센티브가 지급됩니다. 인센티브는 TBURN 토큰으로 지급됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1136,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1135,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1130,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1140:10","data-component-name":"div",className:`faq-item ${i==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1141:12","data-component-name":"div",className:"faq-question",onClick:()=>p("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1142:14","data-component-name":"h4",children:"여러 유형의 파트너십을 동시에 진행할 수 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1142,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1143:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1143,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1141,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1145:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1146:14","data-component-name":"p",children:"네, 가능합니다. 예를 들어 기술 파트너이면서 동시에 마케팅 파트너로 협력할 수 있습니다. 각 유형별 인센티브가 별도로 적용됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1146,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1145,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1140,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1109,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1102,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1153:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1154:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1155:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"함께 성장해요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1155,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1156:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN 생태계의 파트너가 되어",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1157:30","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1157,columnNumber:31},this),"4억 TBURN 인센티브를 받으세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1156,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1160:10","data-component-name":"button",className:"connect-btn",style:{background:"var(--white)",color:"var(--violet)",fontSize:"1.25rem",padding:"20px 50px"},children:"🤝 파트너 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1160,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1154,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1153,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1167:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1168:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1169:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1170:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1170:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1170,columnNumber:119},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1170,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1171:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1171:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1171,columnNumber:129},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1171,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1172:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1173:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1173,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1174:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1174,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1175:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1175,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1176:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1176,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1172,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1169,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1179:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1180:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1180,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1181:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1182:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1182:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1182,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1182,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1183:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1183:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1183,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1183,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1184:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1184:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1184,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1184,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1185:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1185:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1185,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1185,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1181,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1179,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1188:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1189:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1189,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1190:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1191:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1191:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1191,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1191,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1192:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1192:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1192,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1192,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1193:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1193:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1193,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1193,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1194:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1194:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1194,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1194,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1190,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1188,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1197:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1198:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1198,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1199:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1200:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1200:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1200,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1200,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1201:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1201:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1201,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1201,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1202:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1202:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1202,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1202,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1203:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1203:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1203,columnNumber:116},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1203,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1199,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1197,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1168,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1207:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1208:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1208,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1209:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1210:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1210,columnNumber:13},this),e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/partnership-program.tsx:1211:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1211,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1209,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1207,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:1167,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/partnership-program.tsx",lineNumber:108,columnNumber:5},this)}export{A as default};
