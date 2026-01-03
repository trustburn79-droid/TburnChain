import{r as j,j as e}from"./index-MawzfEWf.js";import{d as D,L as n}from"./index-DNbWdfiD.js";import{ac as V,n as y}from"./tburn-loader-BM0jq71g.js";import"./i18nInstance-DCxlOlkw.js";function F(){var p;const{isConnected:c,address:d,connect:g,disconnect:u,formatAddress:h}=V(),[i,b]=j.useState("faq-1"),{data:l,isLoading:s}=D({queryKey:["/api/token-programs/partnerships/stats"]}),t=(p=l==null?void 0:l.data)==null?void 0:p.marketing,o=a=>{b(i===a?null:a)},x=[{icon:"𝕏",value:"250K+",label:"Twitter 팔로워"},{icon:"✈",value:"180K+",label:"Telegram 멤버"},{icon:"💬",value:"120K+",label:"Discord 멤버"},{icon:"📺",value:"85K+",label:"YouTube 구독자"},{icon:"📱",value:"200K+",label:"TikTok 팔로워"}],k=[{id:"brand",icon:"🎨",name:"브랜드 마케팅",amount:"0.9억",percent:"30%"},{id:"influencer",icon:"⭐",name:"인플루언서",amount:"0.75억",percent:"25%"},{id:"creator",icon:"🎬",name:"컨텐츠 크리에이터",amount:"0.6억",percent:"20%"},{id:"event",icon:"🎉",name:"이벤트 마케팅",amount:"0.45억",percent:"15%"},{id:"pr",icon:"📰",name:"PR & 미디어",amount:"0.3억",percent:"10%"}],N=[{id:"ambassador",icon:"👑",title:"앰배서더 프로그램",subtitle:"TBURN의 공식 대사가 되세요",rewards:[{value:"최대 50만",label:"월간 보상"},{value:"무제한",label:"레퍼럴 보상"}],features:["공식 앰배서더 인증","독점 이벤트 초대","얼리 액세스 권한","전용 마케팅 자료"],featured:!0,badge:"HOT"},{id:"influencer",icon:"🎯",title:"인플루언서 협업",subtitle:"크리에이터와 함께하는 성장",rewards:[{value:"협업당 $500+",label:"캠페인 보상"},{value:"10%",label:"매출 수수료"}],features:["맞춤형 캠페인 설계","마케팅 자료 제공","성과 기반 보너스","장기 파트너십 옵션"],featured:!1,badge:"NEW"},{id:"creator",icon:"🎬",title:"컨텐츠 크리에이터",subtitle:"영상, 아티클, 교육 컨텐츠",rewards:[{value:"컨텐츠당 $100+",label:"기본 보상"},{value:"품질 보너스",label:"추가 보상"}],features:["다양한 컨텐츠 유형","크리에이터 펀드 지원","조회수 보너스","월간 콘테스트"],featured:!1,badge:null},{id:"event",icon:"🎉",title:"이벤트 마케팅",subtitle:"온/오프라인 이벤트 참여",rewards:[{value:"이벤트당 $200+",label:"참여 보상"},{value:"특별 NFT",label:"이벤트 보상"}],features:["밋업 주최 지원","컨퍼런스 참가","온라인 AMA","커뮤니티 이벤트"],featured:!1,badge:null}],f=[{id:"legend",icon:"🏆",tier:"Legend",requirement:"500+ 레퍼럴",reward:"월 50만",perks:["전용 멘토 배정","오프라인 밋업 초대","NFT 에어드랍","거버넌스 투표권"]},{id:"elite",icon:"💎",tier:"Elite",requirement:"200+ 레퍼럴",reward:"월 20만",perks:["프리미엄 뱃지","우선 지원","베타 테스트 권한","월간 콜 참여"]},{id:"rising",icon:"🚀",tier:"Rising",requirement:"50+ 레퍼럴",reward:"월 5만",perks:["공식 인증","Discord 역할","마케팅 자료","레퍼럴 링크"]},{id:"starter",icon:"⭐",tier:"Starter",requirement:"10+ 레퍼럴",reward:"월 1만",perks:["스타터 뱃지","기본 자료","커뮤니티 접근","튜토리얼"]}],v=[{icon:"📹",title:"비디오",desc:"유튜브/틱톡 영상",reward:"$100~500"},{icon:"📝",title:"아티클",desc:"블로그/미디엄 글",reward:"$50~200"},{icon:"🎨",title:"그래픽",desc:"인포그래픽/밈",reward:"$30~100"},{icon:"🎓",title:"튜토리얼",desc:"교육 컨텐츠",reward:"$150~400"}],w=[{icon:"𝕏",type:"twitter",title:"#TBURNChain 트윗 챌린지",desc:"TBURN을 소개하는 트윗 작성",reward:"5,000",participants:"1,234",status:"active",statusLabel:"진행중"},{icon:"📺",type:"youtube",title:"TBURN 리뷰 영상",desc:"TBURN Chain 분석 영상 제작",reward:"50,000",participants:"89",status:"active",statusLabel:"진행중"},{icon:"📱",type:"tiktok",title:"TikTok 쇼트폼 챌린지",desc:"15~60초 TBURN 소개 영상",reward:"10,000",participants:"567",status:"ending",statusLabel:"마감임박"},{icon:"📰",type:"article",title:"TBURN 딥다이브 아티클",desc:"기술/토크노믹스 분석글 작성",reward:"20,000",participants:"156",status:"upcoming",statusLabel:"예정"}],E=[{rank:1,name:"CryptoKing",handle:"@crypto_king",tier:"legend",points:"125,340",rewards:"2,450,000"},{rank:2,name:"BlockchainPro",handle:"@bc_pro",tier:"legend",points:"98,720",rewards:"1,890,000"},{rank:3,name:"DeFiMaster",handle:"@defi_master",tier:"elite",points:"76,450",rewards:"1,240,000"},{rank:4,name:"TokenHunter",handle:"@token_hunter",tier:"elite",points:"54,210",rewards:"890,000"},{rank:5,name:"CryptoNinja",handle:"@crypto_ninja",tier:"rising",points:"42,890",rewards:"650,000"}];return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:108:4","data-component-name":"div",className:"marketing-program-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:109:6","data-component-name":"style",children:`
        .marketing-program-page {
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
          --fuchsia: #D946EF;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-marketing: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
          --gradient-ambassador: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes megaphone { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }

        .marketing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(236, 72, 153, 0.2);
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
        .nav-links a:hover { color: var(--pink); }

        .connect-btn {
          background: var(--gradient-marketing);
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
          box-shadow: 0 10px 40px rgba(236, 72, 153, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(244, 63, 94, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
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
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--pink);
          margin-bottom: 2rem;
        }

        .badge .megaphone-icon { animation: megaphone 1s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-marketing);
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

        .social-stats-banner {
          background: linear-gradient(90deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .social-stat {
          text-align: center;
          position: relative;
        }

        .social-stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .social-stat .icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .social-stat .value { font-size: 1.25rem; font-weight: 800; color: var(--pink); }
        .social-stat .label { font-size: 0.75rem; color: var(--gray); margin-top: 0.25rem; }

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
          border-color: var(--pink);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-marketing);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-marketing);
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
          box-shadow: 0 20px 60px rgba(236, 72, 153, 0.4);
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

        .btn-secondary:hover { border-color: var(--pink); color: var(--pink); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(236, 72, 153, 0.15);
          color: var(--pink);
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
          border-color: var(--pink);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.brand::before { background: var(--gradient-marketing); }
        .dist-card.influencer::before { background: linear-gradient(90deg, var(--rose), var(--warning)); }
        .dist-card.creator::before { background: linear-gradient(90deg, var(--cyan), var(--blue)); }
        .dist-card.event::before { background: linear-gradient(90deg, var(--purple), var(--fuchsia)); }
        .dist-card.pr::before { background: linear-gradient(90deg, var(--emerald), var(--cyan)); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--pink); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .programs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .program-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .program-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          border-color: var(--pink);
        }

        .program-card.featured {
          border-color: var(--pink);
          box-shadow: 0 0 40px rgba(236, 72, 153, 0.2);
        }

        .program-header {
          padding: 2rem;
          position: relative;
        }

        .program-card.ambassador .program-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1)); }
        .program-card.influencer .program-header { background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(245, 158, 11, 0.1)); }
        .program-card.creator .program-header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.1)); }
        .program-card.event .program-header { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1)); }

        .program-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .program-badge.hot { background: var(--gradient-marketing); color: var(--white); }
        .program-badge.new { background: var(--success); color: var(--white); }

        .program-icon { font-size: 3rem; margin-bottom: 1rem; }
        .program-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
        .program-subtitle { color: var(--light-gray); font-size: 0.9rem; }

        .program-content { padding: 0 2rem 2rem; }

        .program-rewards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .reward-box {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          text-align: center;
        }

        .reward-box .value { font-size: 1.25rem; font-weight: 800; color: var(--pink); margin-bottom: 0.25rem; }
        .reward-box .label { font-size: 0.75rem; color: var(--gray); }

        .program-features { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .program-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .program-features li:last-child { border-bottom: none; }
        .program-features li::before { content: '✓'; color: var(--success); }

        .program-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          background: var(--gradient-marketing);
          color: var(--white);
        }

        .program-btn:hover { transform: scale(1.02); }

        .ambassador-tiers {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .ambassador-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .ambassador-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .ambassador-card.legend { border-color: var(--gold); background: linear-gradient(180deg, rgba(212, 175, 55, 0.1), transparent); }
        .ambassador-card.elite { border-color: var(--pink); }
        .ambassador-card.rising { border-color: var(--purple); }
        .ambassador-card.starter { border-color: var(--cyan); }

        .ambassador-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }

        .ambassador-tier { font-size: 1.125rem; font-weight: 800; margin-bottom: 0.25rem; }

        .ambassador-card.legend .ambassador-tier { color: var(--gold); }
        .ambassador-card.elite .ambassador-tier { color: var(--pink); }
        .ambassador-card.rising .ambassador-tier { color: var(--purple); }
        .ambassador-card.starter .ambassador-tier { color: var(--cyan); }

        .ambassador-requirement { font-size: 0.8rem; color: var(--gray); margin-bottom: 1rem; }

        .ambassador-reward {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .ambassador-reward .value { font-size: 1.25rem; font-weight: 800; }

        .ambassador-card.legend .ambassador-reward .value { color: var(--gold); }
        .ambassador-card.elite .ambassador-reward .value { color: var(--pink); }
        .ambassador-card.rising .ambassador-reward .value { color: var(--purple); }
        .ambassador-card.starter .ambassador-reward .value { color: var(--cyan); }

        .ambassador-reward .label { font-size: 0.75rem; color: var(--gray); }

        .ambassador-perks { list-style: none; text-align: left; font-size: 0.8rem; padding: 0; }

        .ambassador-perks li {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
          color: var(--light-gray);
        }

        .ambassador-perks li::before { content: '✓'; color: var(--success); font-size: 10px; }

        .content-types-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .content-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
        }

        .content-card:hover {
          transform: translateY(-5px);
          border-color: var(--pink);
        }

        .content-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(236, 72, 153, 0.2);
        }

        .content-title { font-weight: 700; margin-bottom: 0.5rem; }
        .content-desc { font-size: 0.85rem; color: var(--gray); margin-bottom: 1rem; }
        .content-reward { font-weight: 800; color: var(--pink); }

        .campaigns-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .campaigns-header {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), transparent);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .campaigns-header h3 { font-size: 1.25rem; font-weight: 700; }

        .campaigns-list { padding: 0 2rem 2rem; }

        .campaign-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          margin-bottom: 1rem;
          transition: all 0.3s;
        }

        .campaign-item:last-child { margin-bottom: 0; }
        .campaign-item:hover { background: rgba(255, 255, 255, 0.05); }

        .campaign-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .campaign-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(236, 72, 153, 0.2);
        }

        .campaign-info h4 { font-weight: 700; margin-bottom: 0.25rem; }
        .campaign-info p { font-size: 0.85rem; color: var(--gray); }

        .campaign-center { display: flex; gap: 2rem; }

        .campaign-stat { text-align: center; }
        .campaign-stat .value { font-weight: 700; color: var(--pink); }
        .campaign-stat .label { font-size: 0.7rem; color: var(--gray); }

        .campaign-right { display: flex; align-items: center; gap: 1rem; }

        .campaign-status {
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .campaign-status.active { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .campaign-status.ending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .campaign-status.upcoming { background: rgba(59, 130, 246, 0.15); color: var(--blue); }

        .campaign-join-btn {
          padding: 10px 20px;
          border-radius: 10px;
          background: var(--gradient-marketing);
          color: var(--white);
          font-weight: 600;
          font-size: 0.85rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .campaign-join-btn:hover { transform: scale(1.05); }

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
          margin-bottom: 1.5rem;
        }

        .leaderboard-header h3 { font-size: 1.25rem; font-weight: 700; }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leaderboard-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.85rem;
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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .rank-cell.gold { background: var(--gradient-gold); color: var(--dark); }
        .rank-cell.silver { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank-cell.bronze { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank-cell.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .ambassador-cell { display: flex; align-items: center; gap: 12px; }

        .ambassador-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .ambassador-avatar.legend { background: var(--gradient-gold); color: var(--dark); }
        .ambassador-avatar.elite { background: var(--gradient-marketing); }
        .ambassador-avatar.rising { background: var(--purple); }

        .ambassador-name { font-weight: 600; }
        .ambassador-handle { font-size: 0.75rem; color: var(--gray); }

        .points-cell { font-weight: 700; color: var(--pink); }
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

        .faq-chevron { color: var(--pink); transition: transform 0.3s; }
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
          background: var(--gradient-marketing);
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

        .social-links a:hover { background: var(--pink); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--pink); }

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
          .programs-grid { grid-template-columns: 1fr; }
          .ambassador-tiers, .content-types-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
          .social-stats-banner { grid-template-columns: repeat(3, 1fr); }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .social-stats-banner { grid-template-columns: repeat(2, 1fr); }
          .ambassador-tiers, .content-types-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:109,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:923:6","data-component-name":"header",className:"marketing-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:924:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:925:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:926:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(y,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:927:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:927,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:926,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:929:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:929:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:929,columnNumber:140},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:929,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:925,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:931:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:932:12","data-component-name":"a",href:"#programs",children:"프로그램"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:932,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:933:12","data-component-name":"a",href:"#ambassador",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:933,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:934:12","data-component-name":"a",href:"#campaigns",children:"캠페인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:934,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:935:12","data-component-name":"a",href:"#leaderboard",children:"리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:935,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:936:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:936,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:931,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:938:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:()=>c?u():g("metamask"),children:c?`🔗 ${h(d||"")}`:"🔗 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:938,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:924,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:923,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:949:6","data-component-name":"section",className:"hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:950:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:950,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:951:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:952:10","data-component-name":"div",className:"badge",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:953:12","data-component-name":"span",className:"megaphone-icon",children:"📢"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:953,columnNumber:13},this)," MARKETING PROGRAM - 함께 알리는 TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:952,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:955:10","data-component-name":"h1",children:["TBURN 마케팅 참여로",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:956:25","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:956,columnNumber:26},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:957:12","data-component-name":"span",className:"gradient-text",children:"3억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:957,columnNumber:13},this)," 보상을 받으세요"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:955,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:959:10","data-component-name":"p",className:"hero-subtitle",children:"앰배서더, 인플루언서, 컨텐츠 크리에이터, 이벤트 참여로 TBURN 생태계를 알리고 보상받으세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:959,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:964:10","data-component-name":"div",className:"social-stats-banner","data-testid":"social-stats",children:x.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:966:14","data-component-name":"div",className:"social-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:967:16","data-component-name":"div",className:"icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:967,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:968:16","data-component-name":"div",className:"value",children:a.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:968,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:969:16","data-component-name":"div",className:"label",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:969,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:966,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:964,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:974:10","data-component-name":"div",className:"stats-grid","data-testid":"marketing-stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:975:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-marketing",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:976:14","data-component-name":"div",className:"stat-value",children:s?"...":t!=null&&t.totalBudget?`${(parseInt(t.totalBudget)/1e6).toFixed(0)}M`:"3억"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:976,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:979:14","data-component-name":"div",className:"stat-label",children:"총 마케팅 예산"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:979,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:975,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:981:12","data-component-name":"div",className:"stat-card","data-testid":"stat-ambassadors",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:982:14","data-component-name":"div",className:"stat-value",children:s?"...":t!=null&&t.conversions?`${(t.conversions/1e3).toFixed(0)}K+`:"2,500+"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:982,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:985:14","data-component-name":"div",className:"stat-label",children:"활성 앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:985,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:981,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:987:12","data-component-name":"div",className:"stat-card","data-testid":"stat-campaigns",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:988:14","data-component-name":"div",className:"stat-value",children:s?"...":`${(t==null?void 0:t.campaigns)||50}+`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:988,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:991:14","data-component-name":"div",className:"stat-label",children:"진행중 캠페인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:991,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:987,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:993:12","data-component-name":"div",className:"stat-card","data-testid":"stat-monthly-reward",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:994:14","data-component-name":"div",className:"stat-value",children:s?"...":`${(t==null?void 0:t.activeCampaigns)||5}개`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:994,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:997:14","data-component-name":"div",className:"stat-label",children:"활성 캠페인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:997,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:993,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:974,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1001:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1002:12","data-component-name":"button",className:"btn-primary","data-testid":"button-join-ambassador",children:"👑 앰배서더 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1002,columnNumber:13},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1005:12","data-component-name":"button",className:"btn-secondary",children:"📖 마케팅 가이드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1005,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1001,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:951,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:949,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1013:6","data-component-name":"section",className:"section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1014:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1015:10","data-component-name":"span",className:"section-badge",children:"DISTRIBUTION"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1015,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1016:10","data-component-name":"h2",className:"section-title",children:"마케팅 예산 배분"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1016,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1017:10","data-component-name":"p",className:"section-subtitle",children:"3억 TBURN이 5가지 마케팅 프로그램으로 배분됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1017,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1014,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1020:8","data-component-name":"div",className:"distribution-grid",children:k.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1022:12","data-component-name":"div",className:`dist-card ${a.id}`,"data-testid":`dist-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1023:14","data-component-name":"div",className:"dist-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1023,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1024:14","data-component-name":"div",className:"dist-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1024,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1025:14","data-component-name":"div",className:"dist-amount",children:a.amount},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1025,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1026:14","data-component-name":"div",className:"dist-percent",children:a.percent},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1026,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1022,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1020,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1013,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1033:6","data-component-name":"section",className:"section",id:"programs",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1034:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1035:10","data-component-name":"span",className:"section-badge",children:"PROGRAMS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1035,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1036:10","data-component-name":"h2",className:"section-title",children:"마케팅 프로그램"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1036,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1037:10","data-component-name":"p",className:"section-subtitle",children:"다양한 방식으로 TBURN을 알리세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1037,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1034,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1040:8","data-component-name":"div",className:"programs-grid",children:N.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1042:12","data-component-name":"div",className:`program-card ${a.id} ${a.featured?"featured":""}`,"data-testid":`program-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1043:14","data-component-name":"div",className:"program-header",children:[a.badge&&e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1045:18","data-component-name":"span",className:`program-badge ${a.badge.toLowerCase()}`,children:a.badge},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1045,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1047:16","data-component-name":"div",className:"program-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1047,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1048:16","data-component-name":"h3",className:"program-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1048,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1049:16","data-component-name":"p",className:"program-subtitle",children:a.subtitle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1049,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1043,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1051:14","data-component-name":"div",className:"program-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1052:16","data-component-name":"div",className:"program-rewards",children:a.rewards.map((r,m)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1054:20","data-component-name":"div",className:"reward-box",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1055:22","data-component-name":"div",className:"value",children:r.value},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1055,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1056:22","data-component-name":"div",className:"label",children:r.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1056,columnNumber:23},this)]},m,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1054,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1052,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1060:16","data-component-name":"ul",className:"program-features",children:a.features.map((r,m)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1062:20","data-component-name":"li",children:r},m,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1062,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1060,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1065:16","data-component-name":"button",className:"program-btn",children:"참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1065,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1051,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1042,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1040,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1033,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1073:6","data-component-name":"section",className:"section",id:"ambassador",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1074:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1075:10","data-component-name":"span",className:"section-badge",children:"AMBASSADOR"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1075,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1076:10","data-component-name":"h2",className:"section-title",children:"앰배서더 티어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1076,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1077:10","data-component-name":"p",className:"section-subtitle",children:"활동량에 따른 등급별 혜택"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1077,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1074,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1080:8","data-component-name":"div",className:"ambassador-tiers",children:f.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1082:12","data-component-name":"div",className:`ambassador-card ${a.id}`,"data-testid":`ambassador-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1083:14","data-component-name":"div",className:"ambassador-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1083,columnNumber:15},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1084:14","data-component-name":"h3",className:"ambassador-tier",children:a.tier},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1084,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1085:14","data-component-name":"p",className:"ambassador-requirement",children:a.requirement},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1085,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1086:14","data-component-name":"div",className:"ambassador-reward",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1087:16","data-component-name":"div",className:"value",children:a.reward},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1087,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1088:16","data-component-name":"div",className:"label",children:"TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1088,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1086,columnNumber:15},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1090:14","data-component-name":"ul",className:"ambassador-perks",children:a.perks.map((r,m)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1092:18","data-component-name":"li",children:r},m,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1092,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1090,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1082,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1080,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1073,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1101:6","data-component-name":"section",className:"section",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1102:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1103:10","data-component-name":"span",className:"section-badge",children:"CONTENT"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1103,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1104:10","data-component-name":"h2",className:"section-title",children:"컨텐츠 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1104,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1105:10","data-component-name":"p",className:"section-subtitle",children:"다양한 컨텐츠 유형별 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1105,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1102,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1108:8","data-component-name":"div",className:"content-types-grid",children:v.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1110:12","data-component-name":"div",className:"content-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1111:14","data-component-name":"div",className:"content-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1111,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1112:14","data-component-name":"h4",className:"content-title",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1112,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1113:14","data-component-name":"p",className:"content-desc",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1113,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1114:14","data-component-name":"div",className:"content-reward",children:a.reward},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1114,columnNumber:15},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1110,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1108,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1101,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1121:6","data-component-name":"section",className:"section",id:"campaigns",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1122:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1123:10","data-component-name":"span",className:"section-badge",children:"CAMPAIGNS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1123,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1124:10","data-component-name":"h2",className:"section-title",children:"진행중 캠페인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1124,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1125:10","data-component-name":"p",className:"section-subtitle",children:"참여하고 보상받으세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1125,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1122,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1128:8","data-component-name":"div",className:"campaigns-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1129:10","data-component-name":"div",className:"campaigns-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1130:12","data-component-name":"h3",children:"🎯 활성 캠페인"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1130,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1129,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1132:10","data-component-name":"div",className:"campaigns-list",children:w.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1134:14","data-component-name":"div",className:"campaign-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1135:16","data-component-name":"div",className:"campaign-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1136:18","data-component-name":"div",className:"campaign-icon",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1136,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1137:18","data-component-name":"div",className:"campaign-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1138:20","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1138,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1139:20","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1139,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1137,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1135,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1142:16","data-component-name":"div",className:"campaign-center",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1143:18","data-component-name":"div",className:"campaign-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1144:20","data-component-name":"div",className:"value",children:a.reward},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1144,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1145:20","data-component-name":"div",className:"label",children:"TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1145,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1143,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1147:18","data-component-name":"div",className:"campaign-stat",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1148:20","data-component-name":"div",className:"value",children:a.participants},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1148,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1149:20","data-component-name":"div",className:"label",children:"참여자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1149,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1147,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1142,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1152:16","data-component-name":"div",className:"campaign-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1153:18","data-component-name":"span",className:`campaign-status ${a.status}`,children:a.statusLabel},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1153,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1154:18","data-component-name":"button",className:"campaign-join-btn",children:"참여하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1154,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1152,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1134,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1132,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1128,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1121,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1163:6","data-component-name":"section",className:"section",id:"leaderboard",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1164:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1165:10","data-component-name":"span",className:"section-badge",children:"LEADERBOARD"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1165,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1166:10","data-component-name":"h2",className:"section-title",children:"앰배서더 리더보드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1166,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1167:10","data-component-name":"p",className:"section-subtitle",children:"이번 달 TOP 앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1167,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1164,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1170:8","data-component-name":"div",className:"leaderboard-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1171:10","data-component-name":"div",className:"leaderboard-header",children:e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1172:12","data-component-name":"h3",children:"🏆 TOP 5 앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1172,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1171,columnNumber:11},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1174:10","data-component-name":"table",className:"leaderboard-table",children:[e.jsxDEV("thead",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1175:12","data-component-name":"thead",children:e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1176:14","data-component-name":"tr",children:[e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1177:16","data-component-name":"th",children:"순위"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1177,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1178:16","data-component-name":"th",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1178,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1179:16","data-component-name":"th",children:"포인트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1179,columnNumber:17},this),e.jsxDEV("th",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1180:16","data-component-name":"th",children:"누적 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1180,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1176,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1175,columnNumber:13},this),e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1183:12","data-component-name":"tbody",children:E.map((a,r)=>e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1185:16","data-component-name":"tr",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1186:18","data-component-name":"td",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1187:20","data-component-name":"span",className:`rank-cell ${r===0?"gold":r===1?"silver":r===2?"bronze":"normal"}`,children:a.rank},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1187,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1186,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1191:18","data-component-name":"td",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1192:20","data-component-name":"div",className:"ambassador-cell",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1193:22","data-component-name":"div",className:`ambassador-avatar ${a.tier}`,children:a.name.charAt(0)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1193,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1196:22","data-component-name":"div",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1197:24","data-component-name":"div",className:"ambassador-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1197,columnNumber:25},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1198:24","data-component-name":"div",className:"ambassador-handle",children:a.handle},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1198,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1196,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1192,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1191,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1202:18","data-component-name":"td",className:"points-cell",children:a.points},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1202,columnNumber:19},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1203:18","data-component-name":"td",className:"rewards-cell",children:[a.rewards," TBURN"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1203,columnNumber:19},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1185,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1183,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1174,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1170,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1163,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1212:6","data-component-name":"section",className:"section",id:"faq",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1213:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1214:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1214,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1215:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1215,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1216:10","data-component-name":"p",className:"section-subtitle",children:"마케팅 프로그램에 대해 궁금한 점"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1216,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1213,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1219:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1220:10","data-component-name":"div",className:`faq-item ${i==="faq-1"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1221:12","data-component-name":"div",className:"faq-question",onClick:()=>o("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1222:14","data-component-name":"h4",children:"앰배서더가 되려면 어떻게 해야 하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1222,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1223:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1223,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1221,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1225:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1226:14","data-component-name":"p",children:"앰배서더 신청 페이지에서 지원서를 제출하시면 됩니다. 소셜 미디어 활동 이력과 크립토 관심도를 기반으로 심사 후 선발됩니다. 처음에는 Starter 등급으로 시작하여 활동량에 따라 등급이 올라갑니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1226,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1225,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1220,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1230:10","data-component-name":"div",className:`faq-item ${i==="faq-2"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1231:12","data-component-name":"div",className:"faq-question",onClick:()=>o("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1232:14","data-component-name":"h4",children:"컨텐츠 보상은 어떻게 지급되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1232,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1233:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1233,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1231,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1235:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1236:14","data-component-name":"p",children:"컨텐츠 제출 후 품질 심사를 거쳐 승인되면 TBURN 토큰으로 지급됩니다. 기본 보상 외에 조회수와 참여도에 따른 보너스가 추가될 수 있습니다. 보상은 매주 월요일에 일괄 지급됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1236,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1235,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1230,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1240:10","data-component-name":"div",className:`faq-item ${i==="faq-3"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1241:12","data-component-name":"div",className:"faq-question",onClick:()=>o("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1242:14","data-component-name":"h4",children:"캠페인 참여 자격은 무엇인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1242,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1243:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1243,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1241,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1245:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1246:14","data-component-name":"p",children:"대부분의 캠페인은 누구나 참여할 수 있습니다. 다만 일부 캠페인은 앰배서더 등급이나 팔로워 수 등의 조건이 있을 수 있습니다. 각 캠페인 상세 페이지에서 참여 자격을 확인해주세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1246,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1245,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1240,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1250:10","data-component-name":"div",className:`faq-item ${i==="faq-4"?"active":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1251:12","data-component-name":"div",className:"faq-question",onClick:()=>o("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1252:14","data-component-name":"h4",children:"인플루언서 협업은 어떻게 진행되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1252,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1253:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1253,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1251,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1255:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1256:14","data-component-name":"p",children:"10K+ 팔로워를 보유한 인플루언서는 별도의 협업 프로그램에 참여할 수 있습니다. 맞춤형 캠페인 설계와 더 높은 보상을 제공합니다. partnerships@tburn.io로 문의해주세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1256,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1255,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1250,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1219,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1212,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1263:6","data-component-name":"section",className:"cta-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1264:8","data-component-name":"div",style:{maxWidth:"800px",margin:"0 auto"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1265:10","data-component-name":"h2",style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem"},children:"지금 시작하세요!"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1265,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1266:10","data-component-name":"p",style:{color:"rgba(255,255,255,0.8)",fontSize:"1.125rem",marginBottom:"2rem"},children:["TBURN 마케팅 프로그램에 참여하여",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1267:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1267,columnNumber:33},this),"3억 TBURN 보상을 받아가세요!"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1266,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1270:10","data-component-name":"button",className:"connect-btn",style:{background:"var(--white)",color:"var(--pink)",fontSize:"1.25rem",padding:"20px 50px"},children:"👑 앰배서더 신청하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1270,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1264,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1263,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1277:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1278:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1279:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1280:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1280:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1280,columnNumber:117},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1280,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1281:12","data-component-name":"p",children:["AI의 지능, 블록체인의 투명성",e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1281:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1281,columnNumber:127},this),"THE FUTURE IS NOW"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1281,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1282:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1283:14","data-component-name":"a",href:"#",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1283,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1284:14","data-component-name":"a",href:"#",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1284,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1285:14","data-component-name":"a",href:"#",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1285,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1286:14","data-component-name":"a",href:"#",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1286,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1282,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1279,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1289:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1290:12","data-component-name":"h4",children:"Product"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1290,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1291:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1292:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1292:18","data-component-name":"Link",href:"/",children:"메인넷"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1292,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1292,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1293:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1293:18","data-component-name":"Link",href:"/scan",children:"익스플로러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1293,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1293,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1294:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1294:18","data-component-name":"Link",href:"/app/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1294,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1294,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1295:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1295:18","data-component-name":"Link",href:"/app/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1295,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1295,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1291,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1289,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1298:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1299:12","data-component-name":"h4",children:"Resources"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1299,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1300:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1301:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1301:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1301,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1301,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1302:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1302:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1302,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1302,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1303:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1303:18","data-component-name":"a",href:"#",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1303,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1303,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1304:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1304:18","data-component-name":"Link",href:"/security-audit",children:"감사 보고서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1304,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1304,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1300,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1298,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1307:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1308:12","data-component-name":"h4",children:"Community"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1308,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1309:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1310:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1310:18","data-component-name":"Link",href:"/community/news",children:"블로그"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1310,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1310,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1311:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1311:18","data-component-name":"a",href:"#",children:"앰배서더"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1311,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1311,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1312:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1312:18","data-component-name":"a",href:"#",children:"그랜트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1312,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1312,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1313:14","data-component-name":"li",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1313:18","data-component-name":"Link",href:"/qna",children:"고객지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1313,columnNumber:114},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1313,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1309,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1307,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1278,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1317:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1318:10","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1318,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1319:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1320:12","data-component-name":"Link",href:"/legal/terms-of-service",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1320,columnNumber:13},this),e.jsxDEV(n,{"data-replit-metadata":"client/src/pages/marketing-program.tsx:1321:12","data-component-name":"Link",href:"/legal/privacy-policy",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1321,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1319,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1317,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:1277,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/marketing-program.tsx",lineNumber:108,columnNumber:5},this)}export{F as default};
