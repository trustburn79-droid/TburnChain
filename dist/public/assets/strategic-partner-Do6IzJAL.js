import{r as h,j as e}from"./index-C7twzsev.js";import{c as z,L as n}from"./index-Cm11IRca.js";import{ac as C,n as F}from"./tburn-loader-Bju4kY-X.js";import"./i18nInstance-DCxlOlkw.js";function R(){var u;const{isConnected:g,address:x,connect:b,disconnect:N,formatAddress:f}=C(),[s,v]=h.useState("faq-1"),[i,m]=h.useState("enterprise"),{data:p,isLoading:c}=z({queryKey:["/api/token-programs/partnerships/stats"]}),r=(u=p==null?void 0:p.data)==null?void 0:u.partnerships,l=t=>{v(s===t?null:t)},k=[{icon:"🏛️",name:"엔터프라이즈"},{icon:"🔗",name:"프로토콜"},{icon:"💰",name:"기관투자자"},{icon:"🏢",name:"기업"},{icon:"🎓",name:"연구기관"}],w=[{id:"enterprise",icon:"🏛️",name:"엔터프라이즈",amount:"0.8억",percent:"40%"},{id:"protocol",icon:"🔗",name:"프로토콜 통합",amount:"0.4억",percent:"20%"},{id:"institutional",icon:"💰",name:"기관 투자자",amount:"0.4억",percent:"20%"},{id:"government",icon:"🏢",name:"공공기관",amount:"0.2억",percent:"10%"},{id:"academic",icon:"🎓",name:"학술/연구",amount:"0.2억",percent:"10%"}],E=[{id:"diamond",icon:"💎",name:"Diamond",subtitle:"최상위 전략 파트너",incentive:"최대 5,000만",requirement:"$10M+ 가치 제공",benefits:["전용 기술 팀 배정","맞춤형 솔루션 개발","이사회 참여권","독점 거버넌스 권한","연간 오프라인 서밋"],color:"#B9F2FF"},{id:"platinum",icon:"🏆",name:"Platinum",subtitle:"프리미엄 파트너",incentive:"최대 2,000만",requirement:"$5M+ 가치 제공",benefits:["우선 기술 지원","공동 마케팅","분기별 전략 미팅","거버넌스 투표권","VIP 이벤트"],color:"#E5E4E2"},{id:"gold",icon:"👑",name:"Gold",subtitle:"핵심 파트너",incentive:"최대 500만",requirement:"$1M+ 가치 제공",benefits:["기술 통합 지원","마케팅 협업","월간 리포트","DAO 참여권","파트너 네트워킹"],color:"#D4AF37"},{id:"silver",icon:"🥈",name:"Silver",subtitle:"성장 파트너",incentive:"최대 100만",requirement:"$100K+ 가치 제공",benefits:["기술 문서 접근","기본 지원","분기별 업데이트","커뮤니티 접근","파트너 뱃지"],color:"#C0C0C0"}],j=[{icon:"🏛️",title:"엔터프라이즈 솔루션",desc:"대기업 맞춤형 블록체인 솔루션",features:["프라이빗 체인 구축","API 통합","보안 감사","24/7 지원"]},{icon:"🔗",title:"프로토콜 통합",desc:"DeFi 및 Web3 프로토콜 연동",features:["크로스체인 브릿지","유동성 풀","스마트 컨트랙트","오라클 연동"]},{icon:"💰",title:"기관 투자",desc:"기관 투자자 전용 프로그램",features:["커스터디 서비스","OTC 거래","세금 리포트","규제 컴플라이언스"]},{icon:"🏢",title:"공공 파트너십",desc:"정부 및 공공기관 협력",features:["공공 인프라","디지털 신원","투명성 시스템","시민 서비스"]},{icon:"🎓",title:"학술 연구",desc:"대학 및 연구소 협력",features:["연구 그랜트","인턴십","논문 지원","기술 자문"]},{icon:"🌐",title:"글로벌 확장",desc:"해외 시장 진출 지원",features:["현지화 지원","규제 자문","파트너 연결","마케팅 지원"]}],D=[{icon:"📋",title:"문의 접수",desc:"파트너십 의향서 제출",duration:"1-3일"},{icon:"🔍",title:"실사 & 평가",desc:"비즈니스/기술 검토",duration:"2-4주"},{icon:"💼",title:"조건 협상",desc:"파트너십 조건 협의",duration:"2-4주"},{icon:"📝",title:"계약 체결",desc:"법적 계약 서명",duration:"1-2주"},{icon:"🚀",title:"온보딩",desc:"기술 통합 및 런칭",duration:"4-8주"}],V=[{icon:"🔧",title:"맞춤형 기술 지원",desc:"전담 엔지니어 팀이 기업별 요구사항에 맞는 솔루션을 개발합니다."},{icon:"📈",title:"성장 가속화",desc:"TBURN 생태계의 자원과 네트워크를 활용하여 비즈니스 성장을 지원합니다."},{icon:"🛡️",title:"보안 & 규제 준수",desc:"엔터프라이즈급 보안과 글로벌 규제 컴플라이언스를 보장합니다."},{icon:"🤝",title:"전략적 네트워킹",desc:"업계 리더들과의 네트워킹 기회 및 공동 사업 기회를 제공합니다."},{icon:"💎",title:"독점 혜택",desc:"얼리 액세스, 거버넌스 참여, 특별 인센티브 등 독점 혜택을 누립니다."},{icon:"📊",title:"데이터 인사이트",desc:"온체인 분석 및 맞춤형 리포트를 통한 비즈니스 인텔리전스를 제공합니다."}],y=[{icon:"🏛️",name:"Global Tech Corp",type:"Enterprise",tier:"diamond",investment:"$15M",since:"2024.01"},{icon:"🔗",name:"DeFi Protocol X",type:"Protocol",tier:"platinum",investment:"$8M",since:"2024.03"},{icon:"💰",name:"Crypto Fund Alpha",type:"Institutional",tier:"platinum",investment:"$12M",since:"2024.02"},{icon:"🏢",name:"City of Seoul",type:"Government",tier:"gold",investment:"$2M",since:"2024.04"}],o={enterprise:{title:"엔터프라이즈 블록체인",desc:"대기업을 위한 프라이빗 블록체인 솔루션을 제공합니다. 공급망 관리, 자산 토큰화, 내부 결제 시스템 등 다양한 유스케이스에 적용 가능합니다.",features:["프라이빗 체인 구축","API 통합 지원","엔터프라이즈 보안","24/7 기술 지원"],stats:[{value:"99.99%",label:"가동률"},{value:"< 100ms",label:"응답시간"},{value:"무제한",label:"처리량"},{value:"ISO 27001",label:"보안 인증"}]},protocol:{title:"프로토콜 통합",desc:"DeFi 프로토콜과의 원활한 통합을 지원합니다. 크로스체인 브릿지, 유동성 풀, DEX 연동 등을 제공합니다.",features:["크로스체인 브릿지","유동성 인센티브","스마트 컨트랙트 감사","실시간 오라클"],stats:[{value:"$500M+",label:"TVL"},{value:"15+",label:"프로토콜 연동"},{value:"1M+",label:"일일 트랜잭션"},{value:"5개",label:"체인 지원"}]},institutional:{title:"기관 투자자",desc:"규제 준수 기관 투자자를 위한 전용 서비스를 제공합니다. 커스터디, OTC 거래, 세금 리포트 등을 지원합니다.",features:["규제 준수 커스터디","대량 OTC 거래","세금 리포트","프라이빗 투자 라운드"],stats:[{value:"$100M+",label:"AUM"},{value:"50+",label:"기관 파트너"},{value:"24/7",label:"OTC 데스크"},{value:"글로벌",label:"규제 준수"}]}}[i];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:121:4","data-component-name":"div",className:"strategic-partner-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:122:6","data-component-name":"style",children:`
        .strategic-partner-page {
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
          --diamond: #B9F2FF;
          --platinum: #E5E4E2;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-strategic: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
          --gradient-diamond: linear-gradient(135deg, #B9F2FF 0%, #7DD3FC 50%, #B9F2FF 100%);
          --gradient-platinum: linear-gradient(135deg, #E5E4E2 0%, #A9A9A9 50%, #E5E4E2 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes diamondShine { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.3); } }
        @keyframes building { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        .strategic-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(26, 54, 93, 0.3);
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
        .nav-links a:hover { color: var(--gold); }

        .connect-btn {
          background: var(--gradient-strategic);
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
          box-shadow: 0 10px 40px rgba(26, 54, 93, 0.4);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(26, 54, 93, 0.3) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(26, 54, 93, 0.25) 0%, transparent 70%);
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
          background: rgba(26, 54, 93, 0.3);
          border: 1px solid rgba(26, 54, 93, 0.5);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--gold);
          margin-bottom: 2rem;
        }

        .badge .building-icon { animation: building 2s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-gold);
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

        .enterprise-banner {
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.2), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(26, 54, 93, 0.4);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .enterprise-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .enterprise-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .enterprise-logo-icon {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          transition: all 0.3s;
        }

        .enterprise-logo-icon:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: var(--gold);
          transform: scale(1.1);
        }

        .enterprise-logo-name { font-size: 0.75rem; color: var(--gray); }

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
          border-color: var(--gold);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-gold);
          color: var(--dark);
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
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
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

        .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(26, 54, 93, 0.3);
          color: var(--gold);
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
          border-color: var(--gold);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.enterprise::before { background: var(--gradient-strategic); }
        .dist-card.protocol::before { background: linear-gradient(90deg, var(--purple), var(--indigo)); }
        .dist-card.institutional::before { background: var(--gradient-gold); }
        .dist-card.government::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }
        .dist-card.academic::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--gold); margin-bottom: 0.25rem; }
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

        .tier-card.diamond { border-color: var(--diamond); box-shadow: 0 0 40px rgba(185, 242, 255, 0.2); }
        .tier-card.platinum { border-color: var(--platinum); }
        .tier-card.gold { border-color: var(--gold); }
        .tier-card.silver { border-color: #C0C0C0; }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.diamond .tier-header { background: linear-gradient(180deg, rgba(185, 242, 255, 0.15) 0%, transparent 100%); }
        .tier-card.platinum .tier-header { background: linear-gradient(180deg, rgba(229, 228, 226, 0.1) 0%, transparent 100%); }
        .tier-card.gold .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.silver .tier-header { background: linear-gradient(180deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-card.diamond .tier-icon { animation: diamondShine 2s ease-in-out infinite; }

        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.diamond .tier-name { color: var(--diamond); }
        .tier-card.platinum .tier-name { color: var(--platinum); }
        .tier-card.gold .tier-name { color: var(--gold); }
        .tier-card.silver .tier-name { color: #C0C0C0; }

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

        .tier-card.diamond .tier-incentive-value { color: var(--diamond); }
        .tier-card.platinum .tier-incentive-value { color: var(--platinum); }
        .tier-card.gold .tier-incentive-value { color: var(--gold); }
        .tier-card.silver .tier-incentive-value { color: #C0C0C0; }

        .tier-requirement {
          font-size: 0.8rem;
          color: var(--gray);
          text-align: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

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

        .tier-card.diamond .tier-btn { background: var(--gradient-diamond); color: var(--dark); }
        .tier-card.platinum .tier-btn { background: var(--gradient-platinum); color: var(--dark); }
        .tier-card.gold .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.silver .tier-btn { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }

        .tier-btn:hover { transform: scale(1.02); }

        .partnership-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .partnership-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          transition: all 0.3s;
        }

        .partnership-card:hover {
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .partnership-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.3), rgba(59, 130, 246, 0.2));
        }

        .partnership-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .partnership-card p { font-size: 0.9rem; color: var(--gray); margin-bottom: 1.5rem; }

        .partnership-features { list-style: none; padding: 0; }

        .partnership-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .partnership-features li::before { content: '✓'; color: var(--success); }

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
          background: linear-gradient(90deg, var(--navy), var(--blue), var(--indigo), var(--gold), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--navy); }
        .process-item:nth-child(2) .process-dot { background: var(--blue); }
        .process-item:nth-child(3) .process-dot { background: var(--indigo); }
        .process-item:nth-child(4) .process-dot { background: var(--gold); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--gold); font-weight: 600; margin-top: 0.5rem; }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .benefit-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .benefit-card:hover {
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .benefit-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(245, 158, 11, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .benefit-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; }
        .benefit-card p { font-size: 0.9rem; color: var(--light-gray); }

        .use-cases-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .use-case-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .use-case-tab {
          flex: 1;
          padding: 1.5rem;
          background: transparent;
          border: none;
          color: var(--light-gray);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border-bottom: 2px solid transparent;
        }

        .use-case-tab.active {
          color: var(--gold);
          background: rgba(212, 175, 55, 0.05);
          border-bottom-color: var(--gold);
        }

        .use-case-content { padding: 2rem; }

        .use-case-item {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: center;
        }

        .use-case-info h4 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .use-case-info p { color: var(--light-gray); margin-bottom: 1.5rem; line-height: 1.8; }

        .use-case-features { list-style: none; padding: 0; }

        .use-case-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.95rem;
          color: var(--light-gray);
        }

        .use-case-features li::before { content: '✓'; color: var(--gold); }

        .use-case-image {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 2rem;
        }

        .stats-display {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .use-case-stat {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          text-align: center;
        }

        .use-case-stat .value { font-size: 1.75rem; font-weight: 800; color: var(--gold); margin-bottom: 0.25rem; }
        .use-case-stat .label { font-size: 0.8rem; color: var(--gray); }

        .partners-showcase {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .partner-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .partner-item:hover {
          background: rgba(212, 175, 55, 0.05);
          border-color: var(--gold);
          transform: translateY(-5px);
        }

        .partner-item-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .partner-item-logo {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: linear-gradient(135deg, rgba(26, 54, 93, 0.3), rgba(59, 130, 246, 0.2));
        }

        .partner-item-info h5 { font-size: 1rem; font-weight: 700; }
        .partner-item-info p { font-size: 0.75rem; color: var(--gray); }

        .partner-item-tier {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .partner-item-tier.diamond { background: rgba(185, 242, 255, 0.2); color: var(--diamond); }
        .partner-item-tier.platinum { background: rgba(229, 228, 226, 0.2); color: var(--platinum); }
        .partner-item-tier.gold { background: rgba(212, 175, 55, 0.2); color: var(--gold); }

        .partner-item-stats {
          display: flex;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
        }

        .partner-item-stats .label { color: var(--gray); }
        .partner-item-stats .value { color: var(--gold); font-weight: 600; }

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

        .faq-chevron { color: var(--gold); transition: transform 0.3s; }
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
          background: var(--gradient-strategic);
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

        .social-links a:hover { background: var(--gold); color: var(--dark); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--gold); }

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
          .partnership-types-grid, .benefits-grid { grid-template-columns: repeat(2, 1fr); }
          .partners-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .use-case-item { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .tiers-grid, .partnership-types-grid, .benefits-grid { grid-template-columns: 1fr; }
          .partners-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:122,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:979:6","data-component-name":"header",className:"strategic-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:980:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:981:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:982:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(F,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:983:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:983,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:982,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:985:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:985:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:985,columnNumber:140},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:985,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:981,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:987:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:988:12","data-component-name":"a",href:"#tiers",children:"파트너 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:988,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:989:12","data-component-name":"a",href:"#types",children:"파트너십 유형"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:989,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:990:12","data-component-name":"a",href:"#benefits",children:"혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:990,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:991:12","data-component-name":"a",href:"#use-cases",children:"유스케이스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:991,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:992:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:992,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:987,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:994:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:()=>g?N():b("metamask"),children:g?`🔗 ${f(x||"")}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:994,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:980,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:979,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1005:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1006:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1006,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1007:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1008:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1009:12","data-component-name":"span",className:"building-icon",children:"🏛️"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1009,columnNumber:13},this)," STRATEGIC PARTNERSHIP - 엔터프라이즈 파트너십"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1008,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1011:10","data-component-name":"h1",children:["전략적 파트너십으로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1012:22","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1012,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1013:12","data-component-name":"span",className:"gradient-text",children:"2억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1013,columnNumber:13},this)," 인센티브"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1011,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1015:10","data-component-name":"p",className:"hero-subtitle",children:"엔터프라이즈, 기관 투자자, 대형 프로토콜과의 전략적 파트너십을 통해 TBURN 생태계의 핵심 파트너가 되세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1015,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1020:10","data-component-name":"div",className:"enterprise-banner","data-testid":"enterprise-banner",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1021:12","data-component-name":"div",className:"enterprise-logos",children:k.map((t,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1023:16","data-component-name":"div",className:"enterprise-logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1024:18","data-component-name":"div",className:"enterprise-logo-icon",children:t.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1024,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1025:18","data-component-name":"span",className:"enterprise-logo-name",children:t.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1025,columnNumber:19},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1023,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1021,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1020,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1031:10","data-component-name":"div",className:"stats-grid","data-testid":"strategic-stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1032:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-strategic",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1033:14","data-component-name":"div",className:"stat-value",children:c?"...":r!=null&&r.allocation?`${(parseInt(r.allocation)/1e6).toFixed(0)}M`:"2억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1033,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1036:14","data-component-name":"div",className:"stat-label",children:"총 전략 파트너 예산"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1036,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1032,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1038:12","data-component-name":"div",className:"stat-card","data-testid":"stat-partners",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1039:14","data-component-name":"div",className:"stat-value",children:c?"...":`${(r==null?void 0:r.strategic)||8}+`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1039,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1042:14","data-component-name":"div",className:"stat-label",children:"전략 파트너"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1042,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1038,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1044:12","data-component-name":"div",className:"stat-card","data-testid":"stat-tvl",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1045:14","data-component-name":"div",className:"stat-value",children:c?"...":r!=null&&r.distributed?`$${(parseInt(r.distributed)/1e6).toFixed(0)}M+`:"$500M+"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1045,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1048:14","data-component-name":"div",className:"stat-label",children:"배분 완료"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1048,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1044,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1050:12","data-component-name":"div",className:"stat-card","data-testid":"stat-max-incentive",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1051:14","data-component-name":"div",className:"stat-value",children:c?"...":`${(r==null?void 0:r.total)||45}개`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1051,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1054:14","data-component-name":"div",className:"stat-label",children:"총 파트너십"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1054,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1050,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1031,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1058:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1059:12","data-component-name":"button",className:"btn-primary","data-testid":"button-apply-strategic",children:"🏛️ 파트너십 문의"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1059,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1062:12","data-component-name":"button",className:"btn-secondary",children:"📖 엔터프라이즈 가이드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1062,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1058,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1007,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1005,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1070:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1071:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1072:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1072,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1073:10","data-component-name":"h2",className:"section-title",children:"전략 예산 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1073,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1074:10","data-component-name":"p",className:"section-subtitle",children:"2억 TBURN이 5개 전략 분야로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1074,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1071,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1077:8","data-component-name":"div",className:"distribution-grid",children:w.map(t=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1079:12","data-component-name":"div",className:`dist-card ${t.id}`,"data-testid":`dist-${t.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1080:14","data-component-name":"div",className:"dist-icon",children:t.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1080,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1081:14","data-component-name":"div",className:"dist-name",children:t.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1081,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1082:14","data-component-name":"div",className:"dist-amount",children:t.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1082,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1083:14","data-component-name":"div",className:"dist-percent",children:t.percent},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1083,columnNumber:15},this)]},t.id,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1079,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1077,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1070,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1090:6","data-component-name":"section",className:"section",id:"tiers",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1091:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1092:10","data-component-name":"span",className:"section-badge",children:"TIERS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1092,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1093:10","data-component-name":"h2",className:"section-title",children:"전략 파트너 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1093,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1094:10","data-component-name":"p",className:"section-subtitle",children:"기여도와 투자 규모에 따른 차등 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1094,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1091,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1097:8","data-component-name":"div",className:"tiers-grid",children:E.map(t=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1099:12","data-component-name":"div",className:`tier-card ${t.id}`,"data-testid":`tier-${t.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1100:14","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1101:16","data-component-name":"div",className:"tier-icon",children:t.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1101,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1102:16","data-component-name":"h3",className:"tier-name",children:t.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1102,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1103:16","data-component-name":"p",className:"tier-subtitle",children:t.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1103,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1100,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1105:14","data-component-name":"div",className:"tier-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1106:16","data-component-name":"div",className:"tier-incentive",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1107:18","data-component-name":"div",className:"tier-incentive-label",children:"파트너 인센티브"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1107,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1108:18","data-component-name":"div",className:"tier-incentive-value",children:[t.incentive," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1108,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1106,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1110:16","data-component-name":"div",className:"tier-requirement",children:t.requirement},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1110,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1111:16","data-component-name":"ul",className:"tier-benefits",children:t.benefits.map((a,d)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1113:20","data-component-name":"li",children:a},d,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1113,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1111,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1116:16","data-component-name":"button",className:"tier-btn",children:"문의하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1116,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1105,columnNumber:15},this)]},t.id,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1099,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1097,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1090,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1124:6","data-component-name":"section",className:"section",id:"types",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1125:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1126:10","data-component-name":"span",className:"section-badge",children:"PARTNERSHIP TYPES"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1126,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1127:10","data-component-name":"h2",className:"section-title",children:"파트너십 유형"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1127,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1128:10","data-component-name":"p",className:"section-subtitle",children:"다양한 전략적 협력 방식"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1128,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1125,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1131:8","data-component-name":"div",className:"partnership-types-grid",children:j.map((t,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1133:12","data-component-name":"div",className:"partnership-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1134:14","data-component-name":"div",className:"partnership-icon",children:t.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1134,columnNumber:15},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1135:14","data-component-name":"h3",children:t.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1135,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1136:14","data-component-name":"p",children:t.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1136,columnNumber:15},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1137:14","data-component-name":"ul",className:"partnership-features",children:t.features.map((d,q)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1139:18","data-component-name":"li",children:d},q,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1139,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1137,columnNumber:15},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1133,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1131,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1124,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1148:6","data-component-name":"section",className:"section",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1149:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1150:10","data-component-name":"span",className:"section-badge",children:"PROCESS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1150,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1151:10","data-component-name":"h2",className:"section-title",children:"파트너십 프로세스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1151,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1152:10","data-component-name":"p",className:"section-subtitle",children:"전략 파트너 온보딩 과정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1152,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1149,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1155:8","data-component-name":"div",className:"process-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1156:10","data-component-name":"div",className:"process-timeline",children:D.map((t,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1158:14","data-component-name":"div",className:"process-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1159:16","data-component-name":"div",className:"process-dot",children:t.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1159,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1160:16","data-component-name":"div",className:"process-title",children:t.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1160,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1161:16","data-component-name":"div",className:"process-desc",children:t.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1161,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1162:16","data-component-name":"div",className:"process-duration",children:t.duration},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1162,columnNumber:17},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1158,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1156,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1155,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1148,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1170:6","data-component-name":"section",className:"section",id:"benefits",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1171:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1172:10","data-component-name":"span",className:"section-badge",children:"BENEFITS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1172,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1173:10","data-component-name":"h2",className:"section-title",children:"전략 파트너 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1173,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1174:10","data-component-name":"p",className:"section-subtitle",children:"전략 파트너만을 위한 특별 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1174,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1171,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1177:8","data-component-name":"div",className:"benefits-grid",children:V.map((t,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1179:12","data-component-name":"div",className:"benefit-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1180:14","data-component-name":"div",className:"benefit-icon",children:t.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1180,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1181:14","data-component-name":"h4",children:t.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1181,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1182:14","data-component-name":"p",children:t.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1182,columnNumber:15},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1179,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1177,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1170,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1189:6","data-component-name":"section",className:"section",id:"use-cases",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1190:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1191:10","data-component-name":"span",className:"section-badge",children:"USE CASES"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1191,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1192:10","data-component-name":"h2",className:"section-title",children:"활용 사례"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1192,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1193:10","data-component-name":"p",className:"section-subtitle",children:"전략 파트너십 활용 시나리오"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1193,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1190,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1196:8","data-component-name":"div",className:"use-cases-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1197:10","data-component-name":"div",className:"use-case-tabs",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1198:12","data-component-name":"button",className:`use-case-tab ${i==="enterprise"?"active":""}`,onClick:()=>m("enterprise"),children:"🏛️ 엔터프라이즈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1198,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1201:12","data-component-name":"button",className:`use-case-tab ${i==="protocol"?"active":""}`,onClick:()=>m("protocol"),children:"🔗 프로토콜"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1201,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1204:12","data-component-name":"button",className:`use-case-tab ${i==="institutional"?"active":""}`,onClick:()=>m("institutional"),children:"💰 기관 투자자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1204,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1197,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1208:10","data-component-name":"div",className:"use-case-content",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1209:12","data-component-name":"div",className:"use-case-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1210:14","data-component-name":"div",className:"use-case-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1211:16","data-component-name":"h4",children:o.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1211,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1212:16","data-component-name":"p",children:o.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1212,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1213:16","data-component-name":"ul",className:"use-case-features",children:o.features.map((t,a)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1215:20","data-component-name":"li",children:t},a,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1215,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1213,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1210,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1219:14","data-component-name":"div",className:"use-case-image",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1220:16","data-component-name":"div",className:"stats-display",children:o.stats.map((t,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1222:20","data-component-name":"div",className:"use-case-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1223:22","data-component-name":"div",className:"value",children:t.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1223,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1224:22","data-component-name":"div",className:"label",children:t.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1224,columnNumber:23},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1222,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1220,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1219,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1209,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1208,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1196,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1189,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1235:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1236:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1237:10","data-component-name":"span",className:"section-badge",children:"PARTNERS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1237,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1238:10","data-component-name":"h2",className:"section-title",children:"현재 전략 파트너"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1238,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1239:10","data-component-name":"p",className:"section-subtitle",children:"함께하는 글로벌 파트너"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1239,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1236,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1242:8","data-component-name":"div",className:"partners-showcase",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1243:10","data-component-name":"div",className:"partners-grid",children:y.map((t,a)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1245:14","data-component-name":"div",className:"partner-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1246:16","data-component-name":"div",className:"partner-item-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1247:18","data-component-name":"div",className:"partner-item-logo",children:t.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1247,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1248:18","data-component-name":"div",className:"partner-item-info",children:[e.jsxDEV("h5",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1249:20","data-component-name":"h5",children:t.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1249,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1250:20","data-component-name":"p",children:t.type},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1250,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1248,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1246,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1253:16","data-component-name":"span",className:`partner-item-tier ${t.tier}`,children:t.tier.toUpperCase()},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1253,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1254:16","data-component-name":"div",className:"partner-item-stats",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1255:18","data-component-name":"div",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1256:20","data-component-name":"span",className:"label",children:"투자 규모"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1256,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1257:20","data-component-name":"div",className:"value",children:t.investment},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1257,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1255,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1259:18","data-component-name":"div",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1260:20","data-component-name":"span",className:"label",children:"파트너십"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1260,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1261:20","data-component-name":"div",className:"value",children:t.since},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1261,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1259,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1254,columnNumber:17},this)]},a,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1245,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1243,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1242,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1235,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1271:6","data-component-name":"section",className:"section",id:"faq",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1272:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1273:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1273,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1274:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1274,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1275:10","data-component-name":"p",className:"section-subtitle",children:"전략 파트너십에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1275,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1272,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1278:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1279:10","data-component-name":"div",className:`faq-item ${s==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1280:12","data-component-name":"div",className:"faq-question",onClick:()=>l("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1281:14","data-component-name":"h4",children:"전략 파트너가 되려면 어떤 조건이 필요한가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1281,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1282:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1282,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1280,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1284:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1285:14","data-component-name":"p",children:"전략 파트너십은 최소 $100K 이상의 가치 제공(투자, 기술 통합, 비즈니스 협력 등)이 필요합니다. 티어에 따라 $100K(Silver)부터 $10M+(Diamond)까지 다양한 수준의 파트너십을 운영하고 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1285,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1284,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1279,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1289:10","data-component-name":"div",className:`faq-item ${s==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1290:12","data-component-name":"div",className:"faq-question",onClick:()=>l("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1291:14","data-component-name":"h4",children:"파트너십 인센티브는 어떻게 지급되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1291,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1292:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1292,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1290,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1294:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1295:14","data-component-name":"p",children:"인센티브는 베스팅 스케줄에 따라 지급됩니다. 일반적으로 12-24개월에 걸쳐 분할 지급되며, 초기 언락 후 월/분기별로 지급됩니다. 마일스톤 달성에 따른 성과 기반 보너스도 별도로 지급됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1295,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1294,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1289,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1299:10","data-component-name":"div",className:`faq-item ${s==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1300:12","data-component-name":"div",className:"faq-question",onClick:()=>l("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1301:14","data-component-name":"h4",children:"기관 투자자를 위한 특별 프로그램이 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1301,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1302:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1302,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1300,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1304:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1305:14","data-component-name":"p",children:"네, 기관 투자자를 위한 전용 프로그램을 운영합니다. 규제 준수 커스터디, 대량 OTC 거래, 세금 리포트, 프라이빗 투자 라운드 참여 기회 등을 제공합니다. 별도 문의를 통해 상세 안내를 받으실 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1305,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1304,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1299,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1309:10","data-component-name":"div",className:`faq-item ${s==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1310:12","data-component-name":"div",className:"faq-question",onClick:()=>l("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1311:14","data-component-name":"h4",children:"파트너십 체결까지 얼마나 걸리나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1311,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1312:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1312,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1310,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1314:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1315:14","data-component-name":"p",children:"일반적으로 문의 접수부터 온보딩 완료까지 8-16주가 소요됩니다. 파트너십 규모와 복잡성에 따라 기간이 달라질 수 있으며, 긴급한 경우 패스트트랙 프로세스를 통해 일정을 단축할 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1315,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1314,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1309,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1278,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1271,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1322:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1323:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1324:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"전략적 파트너가 되세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1324,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1325:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN 생태계의 핵심 파트너로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1326:30","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1326,columnNumber:31},this),"2억 TBURN 인센티브를 받으세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1325,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1329:10","data-component-name":"button",className:"btn-primary",style:{fontSize:"1.25rem",padding:"20px 50px"},children:"🏛️ 파트너십 문의하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1329,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1323,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1322,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1336:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1337:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1338:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1339:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1339:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1339,columnNumber:117},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1339,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1340:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1340:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1340,columnNumber:127},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1340,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1341:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1342:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1342,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1343:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1343,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1344:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1344,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1345:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1345,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1341,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1338,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1348:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1349:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1349,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1350:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1351:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1351:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1351,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1351,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1352:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1352:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1352,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1352,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1353:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1353:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1353,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1353,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1354:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1354:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1354,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1354,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1350,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1348,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1357:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1358:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1358,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1359:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1360:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1360:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1360,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1360,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1361:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1361:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1361,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1361,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1362:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1362:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1362,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1362,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1363:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1363:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1363,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1363,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1359,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1357,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1366:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1367:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1367,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1368:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1369:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1369:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1369,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1369,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1370:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1370:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1370,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1370,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1371:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1371:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1371,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1371,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1372:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1372:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1372,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1372,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1368,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1366,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1337,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1376:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1377:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1377,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1378:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1379:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1379,columnNumber:13},this),e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/strategic-partner.tsx:1380:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1380,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1378,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1376,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:1336,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/strategic-partner.tsx",lineNumber:121,columnNumber:5},this)}export{R as default};
