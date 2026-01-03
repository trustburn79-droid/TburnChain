import{r as k,j as e}from"./index-MawzfEWf.js";import{d as x,L as t}from"./index-DNbWdfiD.js";import{ac as w,n as E}from"./tburn-loader-BM0jq71g.js";import"./i18nInstance-DCxlOlkw.js";function q(){const[n,g]=k.useState("faq-1"),{isConnected:i,address:s,connect:b,formatAddress:p}=w(),c=r=>{g(n===r?null:r)},{data:u,isLoading:d}=x({queryKey:["/api/token-programs/airdrop/stats"],refetchInterval:3e4}),{data:h,isLoading:f}=x({queryKey:["/api/token-programs/airdrop/eligibility",s],enabled:i&&!!s}),a=u==null?void 0:u.data,o=h==null?void 0:h.data,m=r=>{if(!r)return"0";const l=typeof r=="string"?parseFloat(r):r;return l>=1e8?`${(l/1e8).toFixed(1)}억`:l>=1e4?`${(l/1e4).toFixed(1)}만`:l.toLocaleString()},v=r=>r?(typeof r=="string"?parseFloat(r):r).toLocaleString():"0",N=async()=>{await b("metamask")};return e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:91:4","data-component-name":"div",className:"airdrop-page",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/pages/airdrop.tsx:92:6","data-component-name":"style",children:`
        .airdrop-page {
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
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-navy: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .airdrop-header {
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
          font-size: 24px;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--white);
        }

        .logo-text span {
          color: var(--gold);
        }

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

        .nav-links a:hover {
          color: var(--gold);
        }

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

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
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
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          top: -200px;
          right: -200px;
          animation: float 8s ease-in-out infinite;
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
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--gold);
          margin-bottom: 2rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--gold);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gold {
          background: var(--gradient-gold);
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
          border-color: var(--gold);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
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
          background: var(--gradient-gold);
          color: var(--dark);
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
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.4);
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
        }

        .btn-secondary:hover {
          border-color: var(--gold);
          color: var(--gold);
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
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
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

        .airdrop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .airdrop-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .airdrop-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-gold);
        }

        .airdrop-card:hover {
          transform: translateY(-10px);
          border-color: var(--gold);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .airdrop-card.featured {
          border-color: var(--gold);
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, var(--dark-card) 100%);
        }

        .airdrop-icon {
          width: 64px;
          height: 64px;
          background: var(--gradient-gold);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 1.5rem;
        }

        .airdrop-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .airdrop-amount {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .airdrop-desc {
          color: var(--light-gray);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .airdrop-features {
          list-style: none;
          margin-bottom: 1.5rem;
          padding: 0;
        }

        .airdrop-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          color: var(--light-gray);
          font-size: 0.9rem;
        }

        .airdrop-features li .check-icon {
          color: var(--success);
          font-size: 14px;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          height: 8px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-gold);
          border-radius: 100px;
          transition: width 1s ease;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .tasks-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tasks-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .tasks-info p {
          color: var(--light-gray);
        }

        .points-display {
          text-align: right;
        }

        .points-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
        }

        .points-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .task-category {
          margin-bottom: 2rem;
        }

        .task-category-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--light-gray);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s;
        }

        .task-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .task-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .task-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .task-info h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .task-info p {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .task-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .task-points {
          font-weight: 700;
          color: var(--gold);
        }

        .task-btn {
          background: var(--navy);
          color: var(--white);
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .task-btn:hover {
          background: var(--navy-light);
        }

        .timeline {
          position: relative;
          padding-left: 40px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, var(--gold) 0%, var(--navy) 100%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 2.5rem;
          padding-left: 40px;
        }

        .timeline-dot {
          position: absolute;
          left: -40px;
          top: 5px;
          width: 32px;
          height: 32px;
          background: var(--dark);
          border: 3px solid var(--gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timeline-dot.active {
          background: var(--gold);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }

        .timeline-dot.active .dot-icon {
          color: var(--dark);
        }

        .dot-icon {
          font-size: 12px;
          color: var(--gold);
        }

        .timeline-content {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .timeline-date {
          font-size: 0.875rem;
          color: var(--gold);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .timeline-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .timeline-desc {
          color: var(--light-gray);
          font-size: 0.95rem;
        }

        .eligibility-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .eligibility-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
        }

        .eligibility-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .eligibility-list {
          list-style: none;
          padding: 0;
        }

        .eligibility-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .eligibility-list li:last-child {
          border-bottom: none;
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
          color: var(--gold);
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

        .footer-brand h3 span {
          color: var(--gold);
        }

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
          background: var(--gold);
          color: var(--dark);
        }

        .footer-links h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .footer-links ul {
          list-style: none;
          padding: 0;
        }

        .footer-links ul li {
          margin-bottom: 0.75rem;
        }

        .footer-links ul li a {
          color: var(--light-gray);
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-links ul li a:hover {
          color: var(--gold);
        }

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

        @media (max-width: 1024px) {
          .airdrop-grid {
            grid-template-columns: 1fr;
          }
          .eligibility-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 100px 1rem 60px;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .task-item {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          .task-left {
            flex-direction: column;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:92,columnNumber:7},this),e.jsxDEV("header",{"data-replit-metadata":"client/src/pages/airdrop.tsx:947:6","data-component-name":"header",className:"airdrop-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:948:8","data-component-name":"div",className:"header-container",children:[e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:949:10","data-component-name":"Link",href:"/",className:"logo",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:950:12","data-component-name":"div",className:"logo-icon",children:e.jsxDEV(E,{"data-replit-metadata":"client/src/pages/airdrop.tsx:951:14","data-component-name":"TBurnLogo",className:"w-8 h-8"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:951,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:950,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:953:12","data-component-name":"div",className:"logo-text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:953:44","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:953,columnNumber:130},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:953,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:949,columnNumber:11},this),e.jsxDEV("nav",{"data-replit-metadata":"client/src/pages/airdrop.tsx:955:10","data-component-name":"nav",className:"nav-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:956:12","data-component-name":"a",href:"#overview",children:"개요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:956,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:957:12","data-component-name":"a",href:"#airdrops",children:"에어드랍"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:957,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:958:12","data-component-name":"a",href:"#tasks",children:"미션"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:958,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:959:12","data-component-name":"a",href:"#timeline",children:"일정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:959,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:960:12","data-component-name":"a",href:"#faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:960,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:955,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:962:10","data-component-name":"button",className:"connect-btn","data-testid":"button-connect-wallet",onClick:N,children:[e.jsxDEV("i",{"data-replit-metadata":"client/src/pages/airdrop.tsx:967:12","data-component-name":"i",className:"fas fa-wallet"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:967,columnNumber:13},this),i&&s?p(s):"지갑 연결"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:962,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:948,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:947,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/airdrop.tsx:974:6","data-component-name":"section",className:"hero",id:"overview",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:975:8","data-component-name":"div",className:"hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:975,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:976:8","data-component-name":"div",className:"hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:977:10","data-component-name":"div",className:"badge","data-testid":"badge-live-status",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:978:12","data-component-name":"span",className:"badge-dot"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:978,columnNumber:13},this),"LIVE - 메인넷 에어드랍 진행 중",(a==null?void 0:a.networkTps)&&e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:981:14","data-component-name":"span",style:{marginLeft:"12px",color:"var(--light-gray)"},"data-testid":"text-network-tps",children:["| TPS: ",a.networkTps.toLocaleString()]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:981,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:977,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/pages/airdrop.tsx:986:10","data-component-name":"h1",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:987:12","data-component-name":"span",className:"gold",children:"12억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:987,columnNumber:13},this),e.jsxDEV("br",{"data-replit-metadata":"client/src/pages/airdrop.tsx:987:51","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:987,columnNumber:138},this),"에어드랍 프로그램"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:986,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:990:10","data-component-name":"p",className:"hero-subtitle",children:"TBURN Chain 메인넷 런칭을 기념하여 커뮤니티 여러분께 12억 TBURN을 배포합니다. 지금 바로 참여하여 무료 토큰을 받으세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:990,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:995:10","data-component-name":"div",className:"stats-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:996:12","data-component-name":"div",className:"stat-card","data-testid":"stat-total-airdrop",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:997:14","data-component-name":"div",className:"stat-value",children:d?"...":m((a==null?void 0:a.totalAllocation)||"1200000000")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:997,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1000:14","data-component-name":"div",className:"stat-label",children:"총 에어드랍 물량"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1e3,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:996,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1002:12","data-component-name":"div",className:"stat-card","data-testid":"stat-distributed",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1003:14","data-component-name":"div",className:"stat-value",children:d?"...":m((a==null?void 0:a.totalDistributed)||"0")},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1003,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1006:14","data-component-name":"div",className:"stat-label",children:"배분 완료"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1006,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1002,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1008:12","data-component-name":"div",className:"stat-card","data-testid":"stat-eligible",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1009:14","data-component-name":"div",className:"stat-value",children:d?"...":v((a==null?void 0:a.totalEligible)||0)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1009,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1012:14","data-component-name":"div",className:"stat-label",children:"참여자 수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1012,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1008,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1014:12","data-component-name":"div",className:"stat-card","data-testid":"stat-claim-rate",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1015:14","data-component-name":"div",className:"stat-value",children:d?"...":`${parseFloat((a==null?void 0:a.claimRate)||"0").toFixed(1)}%`},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1015,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1018:14","data-component-name":"div",className:"stat-label",children:"청구율"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1018,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1014,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:995,columnNumber:11},this),i&&s&&e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1024:12","data-component-name":"div",className:"eligibility-status",style:{background:"var(--dark-card)",border:"1px solid rgba(212, 175, 55, 0.3)",borderRadius:"16px",padding:"1.5rem",marginBottom:"2rem",textAlign:"left"},"data-testid":"eligibility-status",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1032:14","data-component-name":"div",style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1033:16","data-component-name":"h3",style:{fontSize:"1.25rem",fontWeight:700,color:"var(--gold)"},children:"내 에어드랍 현황"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1033,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1036:16","data-component-name":"span",style:{fontSize:"0.875rem",color:"var(--light-gray)"},children:p(s)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1036,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1032,columnNumber:15},this),f?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1041:16","data-component-name":"div",style:{textAlign:"center",padding:"2rem",color:"var(--light-gray)"},children:"자격 확인 중..."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1041,columnNumber:17},this):o?e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1045:16","data-component-name":"div",style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"1rem"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1046:18","data-component-name":"div","data-testid":"eligibility-allocated",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1047:20","data-component-name":"div",style:{fontSize:"0.875rem",color:"var(--light-gray)",marginBottom:"0.25rem"},children:"배정량"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1047,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1048:20","data-component-name":"div",style:{fontSize:"1.5rem",fontWeight:700,color:"var(--gold)"},children:m(o.allocatedAmount)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1048,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1046,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1052:18","data-component-name":"div","data-testid":"eligibility-claimed",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1053:20","data-component-name":"div",style:{fontSize:"0.875rem",color:"var(--light-gray)",marginBottom:"0.25rem"},children:"청구됨"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1053,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1054:20","data-component-name":"div",style:{fontSize:"1.5rem",fontWeight:700,color:"var(--success)"},children:m(o.claimedAmount)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1054,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1052,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1058:18","data-component-name":"div","data-testid":"eligibility-pending",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1059:20","data-component-name":"div",style:{fontSize:"0.875rem",color:"var(--light-gray)",marginBottom:"0.25rem"},children:"대기 중"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1059,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1060:20","data-component-name":"div",style:{fontSize:"1.5rem",fontWeight:700,color:"var(--white)"},children:m(o.pendingAmount)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1060,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1058,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1064:18","data-component-name":"div","data-testid":"eligibility-tier",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1065:20","data-component-name":"div",style:{fontSize:"0.875rem",color:"var(--light-gray)",marginBottom:"0.25rem"},children:"등급"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1065,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1066:20","data-component-name":"div",style:{fontSize:"1.5rem",fontWeight:700,color:"var(--gold)"},children:[o.tier||"Standard"," (",o.multiplier||1,"x)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1066,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1064,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1045,columnNumber:17},this):e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1072:16","data-component-name":"div",style:{textAlign:"center",padding:"1rem",color:"var(--light-gray)"},"data-testid":"eligibility-not-found",children:"에어드랍 배정 정보가 없습니다. 미션을 완료하여 참여하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1072,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1024,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1079:10","data-component-name":"div",className:"cta-group",children:[e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1080:12","data-component-name":"button",className:"btn-primary","data-testid":"button-participate",onClick:i?void 0:N,children:[e.jsxDEV("i",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1085:14","data-component-name":"i",className:"fas fa-rocket"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1085,columnNumber:15},this),i?"참여 중":"지금 참여하기"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1080,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1088:12","data-component-name":"a",href:"#airdrops",className:"btn-secondary",children:[e.jsxDEV("i",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1089:14","data-component-name":"i",className:"fas fa-info-circle"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1089,columnNumber:15},this)," 자세히 보기"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1088,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1079,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:976,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:974,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1096:6","data-component-name":"section",className:"section",id:"airdrops",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1097:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1098:10","data-component-name":"span",className:"section-badge",children:"AIRDROP TYPES"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1098,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1099:10","data-component-name":"h2",className:"section-title",children:"에어드랍 유형"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1099,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1100:10","data-component-name":"p",className:"section-subtitle",children:"3가지 유형의 에어드랍 프로그램으로 총 12억 TBURN을 배포합니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1100,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1097,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1103:8","data-component-name":"div",className:"airdrop-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1105:10","data-component-name":"div",className:"airdrop-card featured","data-testid":"card-genesis-airdrop",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1106:12","data-component-name":"div",className:"airdrop-icon",children:"🌟"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1106,columnNumber:13},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1107:12","data-component-name":"h3",className:"airdrop-title",children:"제네시스 에어드랍"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1107,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1108:12","data-component-name":"div",className:"airdrop-amount",children:"6억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1108,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1109:12","data-component-name":"p",className:"airdrop-desc",children:"메인넷 런칭 기념 초기 참여자를 위한 대규모 에어드랍"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1109,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1110:12","data-component-name":"ul",className:"airdrop-features",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1111:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1111:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1111,columnNumber:104},this)," 테스트넷 참여자 우선 배분"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1111,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1112:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1112:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1112,columnNumber:104},this)," NFT 홀더 보너스 (2배)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1112,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1113:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1113:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1113,columnNumber:104},this)," 얼리버드 추가 보상"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1113,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1114:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1114:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1114,columnNumber:104},this)," TGE 10% 즉시 해제"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1114,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1110,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1116:12","data-component-name":"div",className:"progress-bar",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1117:14","data-component-name":"div",className:"progress-fill",style:{width:"35%"}},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1117,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1116,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1119:12","data-component-name":"div",className:"progress-text",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1120:14","data-component-name":"span",children:"배분 진행률"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1120,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1121:14","data-component-name":"span",children:"35% (2.1억 / 6억)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1121,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1119,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1105,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1126:10","data-component-name":"div",className:"airdrop-card","data-testid":"card-community-airdrop",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1127:12","data-component-name":"div",className:"airdrop-icon",children:"👥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1127,columnNumber:13},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1128:12","data-component-name":"h3",className:"airdrop-title",children:"커뮤니티 에어드랍"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1128,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1129:12","data-component-name":"div",className:"airdrop-amount",children:"4억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1129,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1130:12","data-component-name":"p",className:"airdrop-desc",children:"소셜 미션 완료 및 커뮤니티 활동 참여 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1130,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1131:12","data-component-name":"ul",className:"airdrop-features",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1132:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1132:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1132,columnNumber:104},this)," 트위터/텔레그램 팔로우"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1132,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1133:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1133:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1133,columnNumber:104},this)," 콘텐츠 생성 보상"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1133,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1134:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1134:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1134,columnNumber:104},this)," 레퍼럴 보너스"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1134,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1135:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1135:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1135,columnNumber:104},this)," 활동량 기반 배분"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1135,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1131,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1137:12","data-component-name":"div",className:"progress-bar",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1138:14","data-component-name":"div",className:"progress-fill",style:{width:"20%"}},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1138,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1137,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1140:12","data-component-name":"div",className:"progress-text",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1141:14","data-component-name":"span",children:"배분 진행률"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1141,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1142:14","data-component-name":"span",children:"20% (0.8억 / 4억)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1142,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1140,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1126,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1147:10","data-component-name":"div",className:"airdrop-card","data-testid":"card-loyalty-airdrop",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1148:12","data-component-name":"div",className:"airdrop-icon",children:"💎"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1148,columnNumber:13},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1149:12","data-component-name":"h3",className:"airdrop-title",children:"로열티 에어드랍"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1149,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1150:12","data-component-name":"div",className:"airdrop-amount",children:"2억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1150,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1151:12","data-component-name":"p",className:"airdrop-desc",children:"장기 홀더 및 스테이킹 참여자를 위한 보상"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1151,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1152:12","data-component-name":"ul",className:"airdrop-features",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1153:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1153:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1153,columnNumber:104},this)," 90일+ 홀딩 보너스"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1153,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1154:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1154:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1154,columnNumber:104},this)," 스테이킹 참여 보상"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1154,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1155:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1155:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1155,columnNumber:104},this)," 거버넌스 참여 보너스"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1155,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1156:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1156:18","data-component-name":"span",className:"check-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1156,columnNumber:104},this)," 분기별 추가 배분"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1156,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1152,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1158:12","data-component-name":"div",className:"progress-bar",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1159:14","data-component-name":"div",className:"progress-fill",style:{width:"0%"}},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1159,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1158,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1161:12","data-component-name":"div",className:"progress-text",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1162:14","data-component-name":"span",children:"배분 진행률"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1162,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1163:14","data-component-name":"span",children:"대기 중 (TGE 이후 시작)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1163,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1161,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1147,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1103,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1096,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1170:6","data-component-name":"section",className:"section",id:"tasks",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1171:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1172:10","data-component-name":"span",className:"section-badge",children:"EARN POINTS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1172,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1173:10","data-component-name":"h2",className:"section-title",children:"미션 수행"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1173,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1174:10","data-component-name":"p",className:"section-subtitle",children:"미션을 완료하고 포인트를 모아 에어드랍 배분량을 높이세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1174,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1171,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1177:8","data-component-name":"div",className:"tasks-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1178:10","data-component-name":"div",className:"tasks-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1179:12","data-component-name":"div",className:"tasks-info",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1180:14","data-component-name":"h3",children:"내 미션 현황"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1180,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1181:14","data-component-name":"p",children:i?`${p(s||"")} 지갑으로 연결됨`:"지갑을 연결하면 미션 진행 상황을 확인할 수 있습니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1181,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1179,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1187:12","data-component-name":"div",className:"points-display",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1188:14","data-component-name":"div",className:"points-value","data-testid":"text-total-points",children:i?"500 P":"0 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1188,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1191:14","data-component-name":"div",className:"points-label",children:"획득 포인트"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1191,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1187,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1178,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1196:10","data-component-name":"div",className:"task-category",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1197:12","data-component-name":"div",className:"task-category-title",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1198:14","data-component-name":"span",children:"⭐"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1198,columnNumber:15},this)," 필수 미션"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1197,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1200:12","data-component-name":"div",className:"task-list",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1201:14","data-component-name":"div",className:"task-item","data-testid":"task-wallet-connect",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1202:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1203:18","data-component-name":"div",className:"task-icon",children:"👛"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1203,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1204:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1205:20","data-component-name":"h4",children:"지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1205,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1206:20","data-component-name":"p",children:"MetaMask 또는 지원 지갑 연결"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1206,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1204,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1202,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1209:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1210:18","data-component-name":"span",className:"task-points",children:"+500 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1210,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1211:18","data-component-name":"button",className:"task-btn",onClick:N,style:i?{background:"var(--success)",color:"white"}:void 0,"data-testid":"button-task-wallet-connect",children:i?"완료":"연결하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1211,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1209,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1201,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1222:14","data-component-name":"div",className:"task-item","data-testid":"task-email-verify",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1223:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1224:18","data-component-name":"div",className:"task-icon",children:"✅"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1224,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1225:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1226:20","data-component-name":"h4",children:"이메일 인증"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1226,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1227:20","data-component-name":"p",children:"이메일 주소 등록 및 인증"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1227,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1225,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1223,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1230:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1231:18","data-component-name":"span",className:"task-points",children:"+300 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1231,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1232:18","data-component-name":"button",className:"task-btn",children:"인증하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1232,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1230,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1222,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1236:14","data-component-name":"div",className:"task-item","data-testid":"task-telegram-join",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1237:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1238:18","data-component-name":"div",className:"task-icon",children:"📱"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1238,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1239:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1240:20","data-component-name":"h4",children:"텔레그램 가입"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1240,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1241:20","data-component-name":"p",children:"공식 텔레그램 그룹 참여"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1241,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1239,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1237,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1244:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1245:18","data-component-name":"span",className:"task-points",children:"+400 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1245,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1246:18","data-component-name":"button",className:"task-btn",children:"가입하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1246,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1244,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1236,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1200,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1196,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1253:10","data-component-name":"div",className:"task-category",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1254:12","data-component-name":"div",className:"task-category-title",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1255:14","data-component-name":"span",children:"🔗"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1255,columnNumber:15},this)," 소셜 미션"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1254,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1257:12","data-component-name":"div",className:"task-list",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1258:14","data-component-name":"div",className:"task-item","data-testid":"task-twitter-follow",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1259:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1260:18","data-component-name":"div",className:"task-icon",style:{color:"#1DA1F2"},children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1260,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1261:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1262:20","data-component-name":"h4",children:"트위터 팔로우"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1262,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1263:20","data-component-name":"p",children:"@TBURNChain 공식 계정 팔로우"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1263,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1261,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1259,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1266:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1267:18","data-component-name":"span",className:"task-points",children:"+200 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1267,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1268:18","data-component-name":"button",className:"task-btn",children:"팔로우"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1268,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1266,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1258,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1272:14","data-component-name":"div",className:"task-item","data-testid":"task-retweet",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1273:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1274:18","data-component-name":"div",className:"task-icon",style:{color:"#1DA1F2"},children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1274,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1275:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1276:20","data-component-name":"h4",children:"런칭 트윗 리트윗"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1276,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1277:20","data-component-name":"p",children:"메인넷 런칭 공지 리트윗"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1277,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1275,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1273,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1280:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1281:18","data-component-name":"span",className:"task-points",children:"+300 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1281,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1282:18","data-component-name":"button",className:"task-btn",children:"리트윗"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1282,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1280,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1272,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1286:14","data-component-name":"div",className:"task-item","data-testid":"task-discord-join",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1287:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1288:18","data-component-name":"div",className:"task-icon",style:{color:"#5865F2"},children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1288,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1289:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1290:20","data-component-name":"h4",children:"디스코드 가입"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1290,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1291:20","data-component-name":"p",children:"공식 디스코드 서버 참여"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1291,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1289,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1287,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1294:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1295:18","data-component-name":"span",className:"task-points",children:"+400 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1295,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1296:18","data-component-name":"button",className:"task-btn",children:"가입하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1296,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1294,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1286,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1257,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1253,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1303:10","data-component-name":"div",className:"task-category",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1304:12","data-component-name":"div",className:"task-category-title",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1305:14","data-component-name":"span",children:"🎁"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1305,columnNumber:15},this)," 보너스 미션"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1304,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1307:12","data-component-name":"div",className:"task-list",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1308:14","data-component-name":"div",className:"task-item","data-testid":"task-nft-holder",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1309:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1310:18","data-component-name":"div",className:"task-icon",children:"🎨"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1310,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1311:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1312:20","data-component-name":"h4",children:"제네시스 NFT 보유"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1312,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1313:20","data-component-name":"p",children:"TBURN 제네시스 NFT 보유 시 2배 보너스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1313,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1311,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1309,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1316:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1317:18","data-component-name":"span",className:"task-points",children:"+2,000 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1317,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1318:18","data-component-name":"button",className:"task-btn",children:"확인하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1318,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1316,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1308,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1322:14","data-component-name":"div",className:"task-item","data-testid":"task-referral",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1323:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1324:18","data-component-name":"div",className:"task-icon",children:"👥"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1324,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1325:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1326:20","data-component-name":"h4",children:"친구 초대 (레퍼럴)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1326,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1327:20","data-component-name":"p",children:"친구 1명당 500P, 최대 10명"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1327,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1325,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1323,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1330:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1331:18","data-component-name":"span",className:"task-points",children:"최대 +5,000 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1331,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1332:18","data-component-name":"button",className:"task-btn",children:"초대하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1332,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1330,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1322,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1336:14","data-component-name":"div",className:"task-item","data-testid":"task-testnet",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1337:16","data-component-name":"div",className:"task-left",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1338:18","data-component-name":"div",className:"task-icon",children:"📊"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1338,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1339:18","data-component-name":"div",className:"task-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1340:20","data-component-name":"h4",children:"테스트넷 참여자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1340,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1341:20","data-component-name":"p",children:"테스트넷 활동 기록 보유 시 자동 적용"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1341,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1339,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1337,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1344:16","data-component-name":"div",className:"task-right",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1345:18","data-component-name":"span",className:"task-points",children:"+3,000 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1345,columnNumber:19},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1346:18","data-component-name":"button",className:"task-btn",children:"확인하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1346,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1344,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1336,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1307,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1303,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1177,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1170,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1355:6","data-component-name":"section",className:"section",id:"timeline",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1356:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1357:10","data-component-name":"span",className:"section-badge",children:"SCHEDULE"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1357,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1358:10","data-component-name":"h2",className:"section-title",children:"배분 일정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1358,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1359:10","data-component-name":"p",className:"section-subtitle",children:"에어드랍 배분은 TGE 이후 12개월간 진행됩니다"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1359,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1356,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1362:8","data-component-name":"div",style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4rem",maxWidth:"1000px",margin:"0 auto"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1363:10","data-component-name":"div",className:"timeline",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1364:12","data-component-name":"div",className:"timeline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1365:14","data-component-name":"div",className:"timeline-dot active",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1365:51","data-component-name":"span",className:"dot-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1365,columnNumber:138},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1365,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1366:14","data-component-name":"div",className:"timeline-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1367:16","data-component-name":"div",className:"timeline-date",children:"2025년 12월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1367,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1368:16","data-component-name":"div",className:"timeline-title",children:"에어드랍 등록 시작"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1368,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1369:16","data-component-name":"div",className:"timeline-desc",children:"지갑 연결 및 미션 수행 시작"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1369,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1366,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1364,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1373:12","data-component-name":"div",className:"timeline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1374:14","data-component-name":"div",className:"timeline-dot active",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1374:51","data-component-name":"span",className:"dot-icon",children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1374,columnNumber:138},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1374,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1375:14","data-component-name":"div",className:"timeline-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1376:16","data-component-name":"div",className:"timeline-date",children:"2026년 1월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1376,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1377:16","data-component-name":"div",className:"timeline-title",children:"스냅샷 진행"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1377,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1378:16","data-component-name":"div",className:"timeline-desc",children:"참여자 포인트 및 자격 확정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1378,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1375,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1373,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1382:12","data-component-name":"div",className:"timeline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1383:14","data-component-name":"div",className:"timeline-dot",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1383:44","data-component-name":"span",className:"dot-icon",children:"⏳"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1383,columnNumber:131},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1383,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1384:14","data-component-name":"div",className:"timeline-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1385:16","data-component-name":"div",className:"timeline-date",children:"2026년 2월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1385,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1386:16","data-component-name":"div",className:"timeline-title",children:"TGE (토큰 생성 이벤트)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1386,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1387:16","data-component-name":"div",className:"timeline-desc",children:"10% (1.2억 TBURN) 즉시 클레임 가능"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1387,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1384,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1382,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1391:12","data-component-name":"div",className:"timeline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1392:14","data-component-name":"div",className:"timeline-dot",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1392:44","data-component-name":"span",className:"dot-icon",children:"⏳"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1392,columnNumber:131},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1392,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1393:14","data-component-name":"div",className:"timeline-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1394:16","data-component-name":"div",className:"timeline-date",children:"2026년 3월 ~ 2027년 2월"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1394,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1395:16","data-component-name":"div",className:"timeline-title",children:"월별 베스팅 해제"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1395,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1396:16","data-component-name":"div",className:"timeline-desc",children:"매월 7.5%씩 12개월간 선형 해제"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1396,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1393,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1391,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1363,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1401:10","data-component-name":"div",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1402:12","data-component-name":"div",style:{background:"var(--dark-card)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px",padding:"2rem"},children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1403:14","data-component-name":"h3",style:{fontSize:"1.25rem",fontWeight:700,marginBottom:"1.5rem"},children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1404:16","data-component-name":"span",style:{color:"var(--gold)",marginRight:"10px"},children:"🧮"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1404,columnNumber:17},this),"배분 계산 예시"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1403,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1407:14","data-component-name":"div",style:{background:"rgba(255,255,255,0.03)",borderRadius:"12px",padding:"1.5rem",marginBottom:"1.5rem"},children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1408:16","data-component-name":"p",style:{color:"var(--light-gray)",marginBottom:"1rem"},children:["내 포인트: ",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1408:87","data-component-name":"span",style:{color:"var(--gold)",fontWeight:700},children:"5,000 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1408,columnNumber:172},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1408,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1409:16","data-component-name":"p",style:{color:"var(--light-gray)",marginBottom:"1rem"},children:["전체 포인트 풀: ",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1409:90","data-component-name":"span",style:{fontWeight:600},children:"100,000,000 P"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1409,columnNumber:175},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1409,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1410:16","data-component-name":"p",style:{color:"var(--light-gray)",marginBottom:"1rem"},children:["배분 물량: ",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1410:87","data-component-name":"span",style:{fontWeight:600},children:"6억 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1410,columnNumber:172},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1410,columnNumber:17},this),e.jsxDEV("hr",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1411:16","data-component-name":"hr",style:{border:"none",borderTop:"1px solid rgba(255,255,255,0.1)",margin:"1rem 0"}},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1411,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1412:16","data-component-name":"p",style:{fontSize:"1.125rem"},children:["예상 수령량: ",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1412:60","data-component-name":"span",style:{color:"var(--gold)",fontWeight:800,fontSize:"1.5rem"},children:"30,000 TBURN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1412,columnNumber:145},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1412,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1413:16","data-component-name":"p",style:{color:"var(--light-gray)",fontSize:"0.875rem",marginTop:"0.5rem"},children:["예상 가치 (@$0.50): ",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1413:117","data-component-name":"span",style:{color:"var(--success)",fontWeight:600},children:"$15,000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1413,columnNumber:202},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1413,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1407,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1415:14","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.875rem"},children:"* 실제 배분량은 최종 스냅샷 시점의 전체 포인트 합계에 따라 달라질 수 있습니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1415,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1402,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1420:12","data-component-name":"div",style:{background:"var(--dark-card)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px",padding:"2rem",marginTop:"1.5rem"},children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1421:14","data-component-name":"h3",style:{fontSize:"1.25rem",fontWeight:700,marginBottom:"1.5rem"},children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1422:16","data-component-name":"span",style:{color:"var(--gold)",marginRight:"10px"},children:"🔓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1422,columnNumber:17},this),"베스팅 스케줄"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1421,columnNumber:15},this),e.jsxDEV("table",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1425:14","data-component-name":"table",style:{width:"100%",borderCollapse:"collapse"},children:e.jsxDEV("tbody",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1426:16","data-component-name":"tbody",children:[e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1427:18","data-component-name":"tr",style:{borderBottom:"1px solid rgba(255,255,255,0.1)"},children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1428:20","data-component-name":"td",style:{padding:"10px 0",color:"var(--light-gray)"},children:"TGE (Day 0)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1428,columnNumber:21},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1429:20","data-component-name":"td",style:{padding:"10px 0",textAlign:"right",fontWeight:600},children:"10%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1429,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1427,columnNumber:19},this),e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1431:18","data-component-name":"tr",style:{borderBottom:"1px solid rgba(255,255,255,0.1)"},children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1432:20","data-component-name":"td",style:{padding:"10px 0",color:"var(--light-gray)"},children:"M1 ~ M12"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1432,columnNumber:21},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1433:20","data-component-name":"td",style:{padding:"10px 0",textAlign:"right",fontWeight:600},children:"매월 7.5%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1433,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1431,columnNumber:19},this),e.jsxDEV("tr",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1435:18","data-component-name":"tr",children:[e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1436:20","data-component-name":"td",style:{padding:"10px 0",color:"var(--gold)",fontWeight:600},children:"12개월 후 (Y1 완료)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1436,columnNumber:21},this),e.jsxDEV("td",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1437:20","data-component-name":"td",style:{padding:"10px 0",textAlign:"right",fontWeight:700,color:"var(--gold)"},children:"100%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1437,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1435,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1426,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1425,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1420,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1401,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1362,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1355,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1447:6","data-component-name":"section",className:"section",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1448:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1449:10","data-component-name":"span",className:"section-badge",children:"ELIGIBILITY"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1449,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1450:10","data-component-name":"h2",className:"section-title",children:"참여 자격"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1450,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1451:10","data-component-name":"p",className:"section-subtitle",children:"에어드랍 참여 자격 요건을 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1451,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1448,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1454:8","data-component-name":"div",className:"eligibility-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1455:10","data-component-name":"div",className:"eligibility-card","data-testid":"card-eligible",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1456:12","data-component-name":"h3",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1456:16","data-component-name":"span",style:{color:"var(--success)"},children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1456,columnNumber:102},this)," 참여 가능 조건"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1456,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1457:12","data-component-name":"ul",className:"eligibility-list",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1458:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1459:16","data-component-name":"span",style:{color:"var(--success)",marginTop:"4px"},children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1459,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1460:16","data-component-name":"div",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1461:18","data-component-name":"strong",children:"지갑 연결 필수"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1461,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1462:18","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.9rem"},children:"MetaMask, Trust Wallet, Coinbase Wallet 등 지원"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1462,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1460,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1458,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1465:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1466:16","data-component-name":"span",style:{color:"var(--success)",marginTop:"4px"},children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1466,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1467:16","data-component-name":"div",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1468:18","data-component-name":"strong",children:"필수 미션 완료"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1468,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1469:18","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.9rem"},children:"지갑 연결 + 이메일 인증 + 텔레그램 가입"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1469,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1467,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1465,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1472:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1473:16","data-component-name":"span",style:{color:"var(--success)",marginTop:"4px"},children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1473,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1474:16","data-component-name":"div",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1475:18","data-component-name":"strong",children:"최소 1,000 포인트 획득"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1475,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1476:18","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.9rem"},children:"포인트 미달 시 배분 대상에서 제외"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1476,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1474,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1472,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1479:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1480:16","data-component-name":"span",style:{color:"var(--success)",marginTop:"4px"},children:"✓"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1480,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1481:16","data-component-name":"div",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1482:18","data-component-name":"strong",children:"스냅샷 시점까지 자격 유지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1482,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1483:18","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.9rem"},children:"2026년 1월 스냅샷 예정"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1483,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1481,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1479,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1457,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1455,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1489:10","data-component-name":"div",className:"eligibility-card","data-testid":"card-excluded",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1490:12","data-component-name":"h3",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1490:16","data-component-name":"span",style:{color:"var(--warning)"},children:"⚠"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1490,columnNumber:102},this)," 제외 대상"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1490,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1491:12","data-component-name":"ul",className:"eligibility-list",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1492:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1493:16","data-component-name":"span",style:{color:"var(--warning)",marginTop:"4px"},children:"✗"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1493,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1494:16","data-component-name":"div",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1495:18","data-component-name":"strong",children:"제한 국가 거주자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1495,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1496:18","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.9rem"},children:"미국, 중국, 북한 등 규제 국가 제외"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1496,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1494,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1492,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1499:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1500:16","data-component-name":"span",style:{color:"var(--warning)",marginTop:"4px"},children:"✗"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1500,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1501:16","data-component-name":"div",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1502:18","data-component-name":"strong",children:"시빌 어택 (Sybil Attack)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1502,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1503:18","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.9rem"},children:"다중 계정 사용 시 모든 계정 제외"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1503,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1501,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1499,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1506:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1507:16","data-component-name":"span",style:{color:"var(--warning)",marginTop:"4px"},children:"✗"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1507,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1508:16","data-component-name":"div",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1509:18","data-component-name":"strong",children:"봇 활동 감지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1509,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1510:18","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.9rem"},children:"자동화 도구 사용 시 제외"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1510,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1508,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1506,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1513:14","data-component-name":"li",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1514:16","data-component-name":"span",style:{color:"var(--warning)",marginTop:"4px"},children:"✗"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1514,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1515:16","data-component-name":"div",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1516:18","data-component-name":"strong",children:"부정 행위"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1516,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1517:18","data-component-name":"p",style:{color:"var(--gray)",fontSize:"0.9rem"},children:"미션 조작, 허위 정보 제출 시 영구 제외"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1517,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1515,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1513,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1491,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1489,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1454,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1447,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1526:6","data-component-name":"section",className:"section",id:"faq",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1527:8","data-component-name":"div",className:"section-header",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1528:10","data-component-name":"span",className:"section-badge",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1528,columnNumber:11},this),e.jsxDEV("h2",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1529:10","data-component-name":"h2",className:"section-title",children:"자주 묻는 질문"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1529,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1530:10","data-component-name":"p",className:"section-subtitle",children:"에어드랍 관련 궁금한 점을 확인하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1530,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1527,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1533:8","data-component-name":"div",className:"faq-container",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1534:10","data-component-name":"div",className:`faq-item ${n==="faq-1"?"active":""}`,"data-testid":"faq-total-amount",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1535:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-1"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1536:14","data-component-name":"h4",children:"에어드랍 총 물량은 얼마인가요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1536,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1537:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1537,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1535,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1539:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1540:14","data-component-name":"p",children:"총 12억 TBURN이 에어드랍으로 배분됩니다. 이는 전체 공급량 100억 TBURN의 12%에 해당합니다. 제네시스 에어드랍 6억, 커뮤니티 에어드랍 4억, 로열티 에어드랍 2억으로 구성됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1540,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1539,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1534,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1544:10","data-component-name":"div",className:`faq-item ${n==="faq-2"?"active":""}`,"data-testid":"faq-tge-amount",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1545:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-2"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1546:14","data-component-name":"h4",children:"TGE 시점에 얼마나 받을 수 있나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1546,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1547:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1547,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1545,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1549:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1550:14","data-component-name":"p",children:"TGE(토큰 생성 이벤트) 시점에 전체 배분량의 10%가 즉시 클레임 가능합니다. 나머지 90%는 12개월에 걸쳐 매월 7.5%씩 선형 베스팅됩니다. 예를 들어 총 10,000 TBURN을 받는다면, TGE에 1,000 TBURN을 즉시 받고 이후 매월 750 TBURN씩 받게 됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1550,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1549,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1544,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1554:10","data-component-name":"div",className:`faq-item ${n==="faq-3"?"active":""}`,"data-testid":"faq-points-conversion",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1555:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-3"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1556:14","data-component-name":"h4",children:"포인트는 어떻게 토큰으로 환산되나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1556,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1557:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1557,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1555,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1559:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1560:14","data-component-name":"p",children:"포인트는 전체 참여자의 포인트 합계 대비 개인 포인트 비율로 토큰이 배분됩니다. 예를 들어, 전체 포인트가 1억이고 내 포인트가 5,000이라면, 6억 TBURN의 0.005%인 30,000 TBURN을 받게 됩니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1560,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1559,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1554,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1564:10","data-component-name":"div",className:`faq-item ${n==="faq-4"?"active":""}`,"data-testid":"faq-wallet",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1565:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-4"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1566:14","data-component-name":"h4",children:"어떤 지갑을 사용해야 하나요?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1566,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1567:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1567,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1565,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1569:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1570:14","data-component-name":"p",children:"MetaMask, Trust Wallet, Coinbase Wallet, Rainbow Wallet 등 대부분의 EVM 호환 지갑을 지원합니다. WalletConnect를 통해 모바일 지갑도 연결 가능합니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1570,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1569,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1564,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1574:10","data-component-name":"div",className:`faq-item ${n==="faq-5"?"active":""}`,"data-testid":"faq-claim",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1575:12","data-component-name":"div",className:"faq-question",onClick:()=>c("faq-5"),children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1576:14","data-component-name":"h4",children:"에어드랍 수령 방법은?"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1576,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1577:14","data-component-name":"span",className:"faq-chevron",children:"▼"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1577,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1575,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1579:12","data-component-name":"div",className:"faq-answer",children:e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1580:14","data-component-name":"p",children:'TGE 이후 이 페이지에서 "클레임" 버튼이 활성화됩니다. 지갑을 연결하고 가스비를 지불하면 TBURN 토큰이 지갑으로 전송됩니다. 베스팅된 토큰은 매월 클레임 가능합니다.'},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1580,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1579,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1574,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1533,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1526,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1587:6","data-component-name":"footer",className:"footer",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1588:8","data-component-name":"div",className:"footer-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1589:10","data-component-name":"div",className:"footer-brand",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1590:12","data-component-name":"h3",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1590:21","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1590,columnNumber:107},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1590,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1591:12","data-component-name":"p",children:"차세대 레이어1 블록체인으로 빠르고 안전한 탈중앙화 금융의 미래를 만들어갑니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1591,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1592:12","data-component-name":"div",className:"social-links",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1593:14","data-component-name":"a",href:"#","aria-label":"Twitter",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1593:47","data-component-name":"span",children:"𝕏"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1593,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1593,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1594:14","data-component-name":"a",href:"#","aria-label":"Telegram",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1594:48","data-component-name":"span",children:"✈"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1594,columnNumber:133},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1594,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1595:14","data-component-name":"a",href:"#","aria-label":"Discord",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1595:47","data-component-name":"span",children:"💬"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1595,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1595,columnNumber:15},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1596:14","data-component-name":"a",href:"#","aria-label":"GitHub",children:e.jsxDEV("span",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1596:46","data-component-name":"span",children:"⌘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1596,columnNumber:131},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1596,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1592,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1589,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1600:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1601:12","data-component-name":"h4",children:"제품"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1601,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1602:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1603:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1603:18","data-component-name":"Link",href:"/scan",children:"TBURNScan"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1603,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1603,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1604:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1604:18","data-component-name":"Link",href:"/app",children:"dApp"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1604,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1604,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1605:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1605:18","data-component-name":"Link",href:"/staking",children:"스테이킹"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1605,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1605,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1606:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1606:18","data-component-name":"Link",href:"/bridge",children:"브릿지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1606,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1606,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1602,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1600,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1610:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1611:12","data-component-name":"h4",children:"개발자"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1611,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1612:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1613:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1613:18","data-component-name":"Link",href:"/developers/docs",children:"문서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1613,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1613,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1614:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1614:18","data-component-name":"Link",href:"/developers/api",children:"API"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1614,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1614,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1615:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1615:18","data-component-name":"Link",href:"/developers/sdk",children:"SDK"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1615,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1615,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1616:14","data-component-name":"li",children:e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1616:18","data-component-name":"a",href:"https://github.com/tburn-chain",target:"_blank",rel:"noopener noreferrer",children:"GitHub"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1616,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1616,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1612,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1610,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1620:10","data-component-name":"div",className:"footer-links",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1621:12","data-component-name":"h4",children:"리소스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1621,columnNumber:13},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1622:12","data-component-name":"ul",children:[e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1623:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1623:18","data-component-name":"Link",href:"/learn/whitepaper",children:"백서"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1623,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1623,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1624:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1624:18","data-component-name":"Link",href:"/learn/tokenomics",children:"토크노믹스"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1624,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1624,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1625:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1625:18","data-component-name":"Link",href:"/learn/roadmap",children:"로드맵"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1625,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1625,columnNumber:15},this),e.jsxDEV("li",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1626:14","data-component-name":"li",children:e.jsxDEV(t,{"data-replit-metadata":"client/src/pages/airdrop.tsx:1626:18","data-component-name":"Link",href:"/faq",children:"FAQ"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1626,columnNumber:104},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1626,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1622,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1620,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1588,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1631:8","data-component-name":"div",className:"footer-bottom",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1632:10","data-component-name":"p",children:"© 2025 TBURN Chain. All rights reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1632,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1633:10","data-component-name":"div",style:{display:"flex",gap:"2rem"},children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1634:12","data-component-name":"a",href:"#",style:{color:"var(--gray)",textDecoration:"none"},children:"개인정보처리방침"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1634,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1635:12","data-component-name":"a",href:"#",style:{color:"var(--gray)",textDecoration:"none"},children:"이용약관"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1635,columnNumber:13},this),e.jsxDEV("a",{"data-replit-metadata":"client/src/pages/airdrop.tsx:1636:12","data-component-name":"a",href:"#",style:{color:"var(--gray)",textDecoration:"none"},children:"문의하기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1636,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1633,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1631,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:1587,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/pages/airdrop.tsx",lineNumber:91,columnNumber:5},this)}export{q as default};
