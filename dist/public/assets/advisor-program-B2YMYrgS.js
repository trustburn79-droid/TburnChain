import{r as j,j as e}from"./index-C7twzsev.js";import{c as D,L as s}from"./index-Cm11IRca.js";import{ac as V,n as y}from"./tburn-loader-Bju4kY-X.js";import"./i18nInstance-DCxlOlkw.js";function A(){var d;const{isConnected:l,address:p,connect:g,disconnect:u,formatAddress:v}=V(),[i,h]=j.useState("faq-1"),{data:c,isLoading:n}=D({queryKey:["/api/token-programs/partnerships/stats"]}),t=(d=c==null?void 0:c.data)==null?void 0:d.advisors,m=a=>{h(i===a?null:a)},b=[{initial:"JK",name:"Dr. John Kim",role:"기술 자문",type:"tech"},{initial:"SP",name:"Sarah Park",role:"비즈니스 자문",type:"business"},{initial:"ML",name:"Michael Lee",role:"법률 자문",type:"legal"},{initial:"EC",name:"Emma Choi",role:"학술 자문",type:"academic"}],x=[{id:"tech",icon:"💻",name:"기술 자문",amount:"0.6억",percent:"30%"},{id:"business",icon:"📊",name:"비즈니스 자문",amount:"0.4억",percent:"20%"},{id:"legal",icon:"⚖️",name:"법률 자문",amount:"0.4억",percent:"20%"},{id:"academic",icon:"🎓",name:"학술 자문",amount:"0.3억",percent:"15%"},{id:"industry",icon:"🏭",name:"산업 자문",amount:"0.3억",percent:"15%"}],N=[{id:"tech",icon:"💻",title:"기술 자문위원",subtitle:"블록체인, AI, 보안 전문가",rewards:[{value:"최대 1,000만",label:"연간 보상"},{value:"분기별",label:"기술 리뷰"}],responsibilities:["코드 리뷰 및 아키텍처 자문","보안 감사 참여","기술 로드맵 검토","신기술 트렌드 분석"]},{id:"business",icon:"📊",title:"비즈니스 자문위원",subtitle:"경영, 전략, 마케팅 전문가",rewards:[{value:"최대 800만",label:"연간 보상"},{value:"월간",label:"전략 미팅"}],responsibilities:["사업 전략 자문","파트너십 네트워킹","시장 분석 및 인사이트","성장 전략 수립"]},{id:"legal",icon:"⚖️",title:"법률 자문위원",subtitle:"블록체인 규제, 컴플라이언스",rewards:[{value:"최대 800만",label:"연간 보상"},{value:"수시",label:"법률 검토"}],responsibilities:["규제 동향 분석","컴플라이언스 자문","계약 검토","리스크 관리"]},{id:"academic",icon:"🎓",title:"학술 자문위원",subtitle:"대학 교수, 연구원",rewards:[{value:"최대 600만",label:"연간 보상"},{value:"분기별",label:"연구 협력"}],responsibilities:["학술 연구 협력","백서 검토","교육 컨텐츠 개발","학계 네트워킹"]}],f=[{id:"principal",icon:"👑",name:"Principal Advisor",subtitle:"수석 자문위원",incentive:"최대 1,500만",requirement:"10년+ 경력, 업계 리더",benefits:["전용 팀 배정","이사회 참관권","독점 정보 접근","연간 오프라인 서밋","VIP 네트워킹"]},{id:"senior",icon:"⭐",name:"Senior Advisor",subtitle:"시니어 자문위원",incentive:"최대 800만",requirement:"5년+ 경력, 전문가",benefits:["우선 지원","분기별 전략 미팅","얼리 액세스","거버넌스 참여","파트너 네트워킹"]},{id:"advisor",icon:"💡",name:"Advisor",subtitle:"자문위원",incentive:"최대 400만",requirement:"3년+ 경력, 전문 분야",benefits:["월간 미팅","기술 문서 접근","커뮤니티 참여","기본 인센티브","성장 기회"]}],k=[{initial:"JK",name:"Dr. John Kim",title:"CTO, Tech Corp",org:"기술 자문",type:"tech",tier:"principal"},{initial:"SP",name:"Sarah Park",title:"CEO, Growth VC",org:"비즈니스 자문",type:"business",tier:"principal"},{initial:"ML",name:"Michael Lee",title:"Partner, Law Firm",org:"법률 자문",type:"legal",tier:"senior"},{initial:"EC",name:"Prof. Emma Choi",title:"Professor, KAIST",org:"학술 자문",type:"academic",tier:"senior"}],w=[{icon:"📋",title:"지원서 제출",desc:"온라인 지원서 작성",duration:"1-3일"},{icon:"🔍",title:"1차 심사",desc:"서류 검토 및 평가",duration:"1-2주"},{icon:"💬",title:"인터뷰",desc:"심층 면접 진행",duration:"1-2주"},{icon:"📝",title:"계약 체결",desc:"자문 계약 서명",duration:"1주"},{icon:"🚀",title:"온보딩",desc:"자문 활동 시작",duration:"1주"}],E=[{icon:"💰",title:"토큰 인센티브",desc:"분기별 TBURN 토큰 지급",value:"최대 1,500만 TBURN/년"},{icon:"📈",title:"성과 보너스",desc:"목표 달성시 추가 보상",value:"기본 보상의 50%까지"},{icon:"🎁",title:"특별 혜택",desc:"이벤트 초대, NFT 에어드랍",value:"연간 다양한 혜택"}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:105:4","data-component-name":"div",className:"advisor-program-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:106:6","data-component-name":"style",children:`
        .advisor-program-page {
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
          --amber: #F59E0B;
          --teal: #14B8A6;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-advisor: linear-gradient(135deg, #F59E0B 0%, #D4AF37 100%);
          --gradient-tech: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
          --gradient-business: linear-gradient(135deg, #10B981 0%, #14B8A6 100%);
          --gradient-legal: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
          --gradient-academic: linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes lightbulb { 0%, 100% { filter: brightness(1); transform: scale(1); } 50% { filter: brightness(1.3); transform: scale(1.1); } }

        .advisor-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(245, 158, 11, 0.2);
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
        .nav-links a:hover { color: var(--amber); }

        .connect-btn {
          background: var(--gradient-advisor);
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
          box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
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
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--amber);
          margin-bottom: 2rem;
        }

        .badge .lightbulb-icon { animation: lightbulb 2s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-advisor);
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

        .advisor-showcase {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .advisor-preview {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .advisor-preview:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .advisor-preview-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--white);
        }

        .advisor-preview-avatar.tech { background: var(--gradient-tech); }
        .advisor-preview-avatar.business { background: var(--gradient-business); }
        .advisor-preview-avatar.legal { background: var(--gradient-legal); }
        .advisor-preview-avatar.academic { background: var(--gradient-academic); }

        .advisor-preview-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.25rem; }
        .advisor-preview-role { font-size: 0.75rem; color: var(--gray); }

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
          border-color: var(--amber);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-advisor);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-advisor);
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
          box-shadow: 0 20px 60px rgba(245, 158, 11, 0.3);
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

        .btn-secondary:hover { border-color: var(--amber); color: var(--amber); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(245, 158, 11, 0.15);
          color: var(--amber);
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
          border-color: var(--amber);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.tech::before { background: var(--gradient-tech); }
        .dist-card.business::before { background: var(--gradient-business); }
        .dist-card.legal::before { background: var(--gradient-legal); }
        .dist-card.academic::before { background: var(--gradient-academic); }
        .dist-card.industry::before { background: var(--gradient-advisor); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .role-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .role-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          border-color: var(--amber);
        }

        .role-header {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .role-card.tech .role-header { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), transparent); }
        .role-card.business .role-header { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), transparent); }
        .role-card.legal .role-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), transparent); }
        .role-card.academic .role-header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), transparent); }

        .role-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .role-card.tech .role-icon { background: rgba(59, 130, 246, 0.2); }
        .role-card.business .role-icon { background: rgba(16, 185, 129, 0.2); }
        .role-card.legal .role-icon { background: rgba(139, 92, 246, 0.2); }
        .role-card.academic .role-icon { background: rgba(6, 182, 212, 0.2); }

        .role-info h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
        .role-info p { font-size: 0.9rem; color: var(--gray); }

        .role-content { padding: 0 2rem 2rem; }

        .role-rewards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .role-reward-box {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          text-align: center;
        }

        .role-reward-box .value { font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-bottom: 0.25rem; }
        .role-reward-box .label { font-size: 0.75rem; color: var(--gray); }

        .role-responsibilities { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .role-responsibilities li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .role-responsibilities li:last-child { border-bottom: none; }
        .role-responsibilities li::before { content: '✓'; color: var(--success); }

        .role-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          color: var(--white);
        }

        .role-card.tech .role-btn { background: var(--gradient-tech); }
        .role-card.business .role-btn { background: var(--gradient-business); }
        .role-card.legal .role-btn { background: var(--gradient-legal); }
        .role-card.academic .role-btn { background: var(--gradient-academic); }

        .role-btn:hover { transform: scale(1.02); }

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
        }

        .tier-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .tier-card.principal { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.senior { border-color: var(--amber); }
        .tier-card.advisor { border-color: var(--cyan); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.principal .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.senior .tier-header { background: linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%); }
        .tier-card.advisor .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.principal .tier-name { color: var(--gold); }
        .tier-card.senior .tier-name { color: var(--amber); }
        .tier-card.advisor .tier-name { color: var(--cyan); }

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
        .tier-incentive-value { font-size: 1.5rem; font-weight: 800; }

        .tier-card.principal .tier-incentive-value { color: var(--gold); }
        .tier-card.senior .tier-incentive-value { color: var(--amber); }
        .tier-card.advisor .tier-incentive-value { color: var(--cyan); }

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

        .tier-card.principal .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.senior .tier-btn { background: var(--gradient-advisor); color: var(--dark); }
        .tier-card.advisor .tier-btn { background: var(--gradient-academic); color: var(--white); }

        .tier-btn:hover { transform: scale(1.02); }

        .advisors-showcase {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .advisors-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .advisor-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .advisor-card:hover {
          background: rgba(245, 158, 11, 0.05);
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .advisor-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          position: relative;
          color: var(--white);
        }

        .advisor-avatar.tech { background: var(--gradient-tech); }
        .advisor-avatar.business { background: var(--gradient-business); }
        .advisor-avatar.legal { background: var(--gradient-legal); }
        .advisor-avatar.academic { background: var(--gradient-academic); }

        .advisor-tier-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          border: 2px solid var(--dark-card);
        }

        .advisor-tier-badge.principal { background: var(--gold); }
        .advisor-tier-badge.senior { background: var(--amber); }

        .advisor-card-name { font-weight: 700; margin-bottom: 0.25rem; }
        .advisor-card-title { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }
        .advisor-card-org { font-size: 0.75rem; color: var(--amber); }

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
          background: linear-gradient(90deg, var(--blue), var(--purple), var(--amber), var(--gold), var(--success));
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

        .process-item:nth-child(1) .process-dot { background: var(--blue); }
        .process-item:nth-child(2) .process-dot { background: var(--purple); }
        .process-item:nth-child(3) .process-dot { background: var(--amber); }
        .process-item:nth-child(4) .process-dot { background: var(--gold); }
        .process-item:nth-child(5) .process-dot { background: var(--success); }

        .process-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .process-desc { font-size: 0.8rem; color: var(--gray); }
        .process-duration { font-size: 0.75rem; color: var(--amber); font-weight: 600; margin-top: 0.5rem; }

        .compensation-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .compensation-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .compensation-card:hover {
          border-color: var(--amber);
          transform: translateY(-5px);
        }

        .compensation-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(212, 175, 55, 0.1));
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .compensation-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; }
        .compensation-card p { font-size: 0.9rem; color: var(--light-gray); margin-bottom: 1rem; }
        .compensation-value { font-size: 1.25rem; font-weight: 800; color: var(--amber); }

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

        .faq-chevron { color: var(--amber); transition: transform 0.3s; }
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
          background: var(--gradient-advisor);
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

        .social-links a:hover { background: var(--amber); color: var(--dark); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--amber); }

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
          .roles-grid, .tiers-grid, .compensation-grid { grid-template-columns: 1fr; }
          .advisors-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .advisor-showcase { grid-template-columns: repeat(2, 1fr); }
          .process-timeline { flex-wrap: wrap; gap: 1.5rem; }
          .process-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .advisor-showcase { grid-template-columns: 1fr; }
          .advisors-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:106,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:931:6","data-component-name":"header",className:"advisor-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:932:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:933:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:934:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(y,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:935:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:935,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:934,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:937:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:937:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:937,columnNumber:138},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:937,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:933,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:939:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:940:12","data-component-name":"a",href:"#roles",children:"자문 분야"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:940,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:941:12","data-component-name":"a",href:"#tiers",children:"티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:941,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:942:12","data-component-name":"a",href:"#advisors",children:"현재 자문단"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:942,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:943:12","data-component-name":"a",href:"#process",children:"지원 절차"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:943,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:944:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:944,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:939,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:946:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:()=>l?u():g("metamask"),children:l?`🔗 ${v(p||"")}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:946,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:932,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:931,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:957:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:958:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:958,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:959:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:960:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:961:12","data-component-name":"span",className:"lightbulb-icon",children:"💡"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:961,columnNumber:13},this)," ADVISOR PROGRAM - 전문가 자문단"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:960,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:963:10","data-component-name":"h1",children:["TBURN 자문위원으로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:964:24","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:964,columnNumber:25},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:965:12","data-component-name":"span",className:"gradient-text",children:"2억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:965,columnNumber:13},this)," 보상을 받으세요"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:963,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:967:10","data-component-name":"p",className:"hero-subtitle",children:"기술, 비즈니스, 법률, 학술 분야 전문가로 참여하여 TBURN 생태계 발전에 기여하고 보상받으세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:967,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:972:10","data-component-name":"div",className:"advisor-showcase","data-testid":"advisor-showcase",children:b.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:974:14","data-component-name":"div",className:"advisor-preview",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:975:16","data-component-name":"div",className:`advisor-preview-avatar ${a.type}`,children:a.initial},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:975,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:978:16","data-component-name":"div",className:"advisor-preview-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:978,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:979:16","data-component-name":"div",className:"advisor-preview-role",children:a.role},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:979,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:974,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:972,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:984:10","data-component-name":"div",className:"stats-grid","data-testid":"advisor-stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:985:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-advisor",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:986:14","data-component-name":"div",className:"stat-value",children:n?"...":t!=null&&t.allocation?`${(parseInt(t.allocation)/1e6).toFixed(0)}M`:"2억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:986,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:989:14","data-component-name":"div",className:"stat-label",children:"총 자문 예산"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:989,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:985,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:991:12","data-component-name":"div",className:"stat-card","data-testid":"stat-advisors",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:992:14","data-component-name":"div",className:"stat-value",children:n?"...":`${(t==null?void 0:t.total)||12}+`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:992,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:995:14","data-component-name":"div",className:"stat-label",children:"현재 자문위원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:995,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:991,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:997:12","data-component-name":"div",className:"stat-card","data-testid":"stat-fields",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:998:14","data-component-name":"div",className:"stat-value",children:n?"...":`${(t==null?void 0:t.unlocked)||8}명`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:998,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1001:14","data-component-name":"div",className:"stat-label",children:"활성 자문위원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1001,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:997,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1003:12","data-component-name":"div",className:"stat-card","data-testid":"stat-max-reward",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1004:14","data-component-name":"div",className:"stat-value",children:n?"...":(t==null?void 0:t.vesting)||"24개월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1004,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1007:14","data-component-name":"div",className:"stat-label",children:"베스팅 기간"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1007,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1003,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:984,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1011:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1012:12","data-component-name":"button",className:"btn-primary","data-testid":"button-apply",children:"💡 자문단 지원하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1012,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1015:12","data-component-name":"button",className:"btn-secondary",children:"📖 자문단 가이드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1015,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1011,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:959,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:957,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1023:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1024:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1025:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1025,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1026:10","data-component-name":"h2",className:"section-title",children:"자문 예산 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1026,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1027:10","data-component-name":"p",className:"section-subtitle",children:"2억 TBURN이 5개 자문 분야로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1027,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1024,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1030:8","data-component-name":"div",className:"distribution-grid",children:x.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1032:12","data-component-name":"div",className:`dist-card ${a.id}`,"data-testid":`dist-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1033:14","data-component-name":"div",className:"dist-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1033,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1034:14","data-component-name":"div",className:"dist-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1034,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1035:14","data-component-name":"div",className:"dist-amount",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1035,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1036:14","data-component-name":"div",className:"dist-percent",children:a.percent},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1036,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1032,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1030,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1023,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1043:6","data-component-name":"section",className:"section",id:"roles",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1044:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1045:10","data-component-name":"span",className:"section-badge",children:"ROLES"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1045,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1046:10","data-component-name":"h2",className:"section-title",children:"자문 분야"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1046,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1047:10","data-component-name":"p",className:"section-subtitle",children:"전문 분야별 자문위원 역할"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1047,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1044,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1050:8","data-component-name":"div",className:"roles-grid",children:N.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1052:12","data-component-name":"div",className:`role-card ${a.id}`,"data-testid":`role-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1053:14","data-component-name":"div",className:"role-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1054:16","data-component-name":"div",className:"role-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1054,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1055:16","data-component-name":"div",className:"role-info",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1056:18","data-component-name":"h3",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1056,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1057:18","data-component-name":"p",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1057,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1055,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1053,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1060:14","data-component-name":"div",className:"role-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1061:16","data-component-name":"div",className:"role-rewards",children:a.rewards.map((r,o)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1063:20","data-component-name":"div",className:"role-reward-box",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1064:22","data-component-name":"div",className:"value",children:r.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1064,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1065:22","data-component-name":"div",className:"label",children:r.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1065,columnNumber:23},this)]},o,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1063,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1061,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1069:16","data-component-name":"ul",className:"role-responsibilities",children:a.responsibilities.map((r,o)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1071:20","data-component-name":"li",children:r},o,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1071,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1069,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1074:16","data-component-name":"button",className:"role-btn",children:"지원하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1074,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1060,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1052,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1050,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1043,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1082:6","data-component-name":"section",className:"section",id:"tiers",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1083:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1084:10","data-component-name":"span",className:"section-badge",children:"TIERS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1084,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1085:10","data-component-name":"h2",className:"section-title",children:"자문 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1085,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1086:10","data-component-name":"p",className:"section-subtitle",children:"경력과 기여도에 따른 등급별 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1086,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1083,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1089:8","data-component-name":"div",className:"tiers-grid",children:f.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1091:12","data-component-name":"div",className:`tier-card ${a.id}`,"data-testid":`tier-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1092:14","data-component-name":"div",className:"tier-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1093:16","data-component-name":"div",className:"tier-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1093,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1094:16","data-component-name":"h3",className:"tier-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1094,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1095:16","data-component-name":"p",className:"tier-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1095,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1092,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1097:14","data-component-name":"div",className:"tier-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1098:16","data-component-name":"div",className:"tier-incentive",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1099:18","data-component-name":"div",className:"tier-incentive-label",children:"연간 인센티브"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1099,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1100:18","data-component-name":"div",className:"tier-incentive-value",children:[a.incentive," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1100,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1098,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1102:16","data-component-name":"div",className:"tier-requirement",children:a.requirement},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1102,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1103:16","data-component-name":"ul",className:"tier-benefits",children:a.benefits.map((r,o)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1105:20","data-component-name":"li",children:r},o,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1105,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1103,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1108:16","data-component-name":"button",className:"tier-btn",children:"지원하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1108,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1097,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1091,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1089,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1082,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1116:6","data-component-name":"section",className:"section",id:"advisors",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1117:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1118:10","data-component-name":"span",className:"section-badge",children:"ADVISORS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1118,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1119:10","data-component-name":"h2",className:"section-title",children:"현재 자문단"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1119,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1120:10","data-component-name":"p",className:"section-subtitle",children:"함께하는 전문가들"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1120,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1117,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1123:8","data-component-name":"div",className:"advisors-showcase",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1124:10","data-component-name":"div",className:"advisors-grid",children:k.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1126:14","data-component-name":"div",className:"advisor-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1127:16","data-component-name":"div",className:`advisor-avatar ${a.type}`,children:[a.initial,e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1129:18","data-component-name":"span",className:`advisor-tier-badge ${a.tier}`,children:a.tier==="principal"?"👑":"⭐"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1129,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1127,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1133:16","data-component-name":"div",className:"advisor-card-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1133,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1134:16","data-component-name":"div",className:"advisor-card-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1134,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1135:16","data-component-name":"div",className:"advisor-card-org",children:a.org},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1135,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1126,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1124,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1123,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1116,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1143:6","data-component-name":"section",className:"section",id:"process",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1144:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1145:10","data-component-name":"span",className:"section-badge",children:"PROCESS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1145,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1146:10","data-component-name":"h2",className:"section-title",children:"지원 절차"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1146,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1147:10","data-component-name":"p",className:"section-subtitle",children:"자문위원 선발 과정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1147,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1144,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1150:8","data-component-name":"div",className:"process-container",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1151:10","data-component-name":"div",className:"process-timeline",children:w.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1153:14","data-component-name":"div",className:"process-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1154:16","data-component-name":"div",className:"process-dot",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1154,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1155:16","data-component-name":"div",className:"process-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1155,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1156:16","data-component-name":"div",className:"process-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1156,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1157:16","data-component-name":"div",className:"process-duration",children:a.duration},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1157,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1153,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1151,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1150,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1143,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1165:6","data-component-name":"section",className:"section",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1166:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1167:10","data-component-name":"span",className:"section-badge",children:"COMPENSATION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1167,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1168:10","data-component-name":"h2",className:"section-title",children:"보상 체계"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1168,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1169:10","data-component-name":"p",className:"section-subtitle",children:"자문위원 보상 구성"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1169,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1166,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1172:8","data-component-name":"div",className:"compensation-grid",children:E.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1174:12","data-component-name":"div",className:"compensation-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1175:14","data-component-name":"div",className:"compensation-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1175,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1176:14","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1176,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1177:14","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1177,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1178:14","data-component-name":"div",className:"compensation-value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1178,columnNumber:15},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1174,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1172,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1165,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1185:6","data-component-name":"section",className:"section",id:"faq",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1186:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1187:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1187,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1188:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1188,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1189:10","data-component-name":"p",className:"section-subtitle",children:"자문 프로그램에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1189,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1186,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1192:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1193:10","data-component-name":"div",className:`faq-item ${i==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1194:12","data-component-name":"div",className:"faq-question",onClick:()=>m("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1195:14","data-component-name":"h4",children:"자문위원이 되려면 어떤 자격이 필요한가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1195,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1196:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1196,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1194,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1198:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1199:14","data-component-name":"p",children:"분야별로 최소 3년 이상의 경력이 필요하며, 해당 분야의 전문성을 증명할 수 있는 포트폴리오나 이력이 필요합니다. Principal Advisor는 10년 이상, Senior Advisor는 5년 이상의 경력이 권장됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1199,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1198,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1193,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1203:10","data-component-name":"div",className:`faq-item ${i==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1204:12","data-component-name":"div",className:"faq-question",onClick:()=>m("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1205:14","data-component-name":"h4",children:"자문 활동은 어떤 방식으로 진행되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1205,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1206:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1206,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1204,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1208:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1209:14","data-component-name":"p",children:"정기 미팅(월간/분기별), 문서 검토, 전략 자문, 네트워킹 등 다양한 방식으로 참여합니다. 온라인 미팅이 주를 이루며, 필요시 오프라인 워크숍도 진행됩니다. 자문 범위와 시간은 티어에 따라 달라집니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1209,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1208,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1203,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1213:10","data-component-name":"div",className:`faq-item ${i==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1214:12","data-component-name":"div",className:"faq-question",onClick:()=>m("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1215:14","data-component-name":"h4",children:"보상은 어떻게 지급되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1215,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1216:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1216,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1214,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1218:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1219:14","data-component-name":"p",children:"토큰 인센티브는 분기별로 지급되며, 베스팅 스케줄에 따라 순차적으로 언락됩니다. 성과 보너스는 반기별 평가 후 지급되며, 특별 혜택은 수시로 제공됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1219,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1218,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1213,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1223:10","data-component-name":"div",className:`faq-item ${i==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1224:12","data-component-name":"div",className:"faq-question",onClick:()=>m("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1225:14","data-component-name":"h4",children:"자문 계약 기간은 얼마인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1225,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1226:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1226,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1224,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1228:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1229:14","data-component-name":"p",children:"기본 계약 기간은 1년이며, 상호 합의에 따라 연장 가능합니다. 우수한 성과를 보이는 자문위원은 자동 갱신 옵션이 제공됩니다. 계약 종료 30일 전 통보 조항이 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1229,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1228,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1223,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1192,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1185,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1236:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1237:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1238:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem",color:"var(--dark)"},children:"전문가 자문단에 합류하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1238,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1239:10","data-component-name":"p",style:{color:"rgba(0,0,0,0.7)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN 생태계의 전략적 파트너로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1240:31","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1240,columnNumber:32},this),"2억 TBURN 보상을 받으세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1239,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1243:10","data-component-name":"button",className:"btn-primary",style:{background:"var(--dark)",color:"var(--white)",fontSize:"1.25rem",padding:"20px 50px"},children:"💡 지금 지원하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1243,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1237,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1236,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1250:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1251:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1252:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1253:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1253:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1253,columnNumber:115},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1253,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1254:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1254:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1254,columnNumber:125},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1254,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1255:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1256:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1256,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1257:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1257,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1258:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1258,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1259:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1259,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1255,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1252,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1262:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1263:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1263,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1264:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1265:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1265:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1265,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1265,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1266:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1266:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1266,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1266,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1267:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1267:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1267,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1267,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1268:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1268:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1268,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1268,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1264,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1262,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1271:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1272:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1272,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1273:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1274:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1274:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1274,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1274,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1275:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1275:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1275,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1275,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1276:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1276:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1276,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1276,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1277:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1277:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1277,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1277,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1273,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1271,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1280:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1281:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1281,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1282:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1283:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1283:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1283,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1283,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1284:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1284:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1284,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1284,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1285:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1285:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1285,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1285,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1286:14","data-component-name":"li",children:e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1286:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1286,columnNumber:112},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1286,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1282,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1280,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1251,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1290:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1291:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1291,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1292:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1293:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1293,columnNumber:13},this),e.jsxDEV(s,{"data-replit-metadata":"client/src/pages/advisor-program.tsx:1294:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1294,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1292,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1290,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:1250,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/advisor-program.tsx",lineNumber:105,columnNumber:5},this)}export{A as default};
