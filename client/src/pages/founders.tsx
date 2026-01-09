import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const founders = [
  {
    initials: "KC",
    name: "Kevin Cho",
    role: "Mainnet Chair & Chief Architect",
    company: "TBURN CHAINS Foundation",
    bio: "블록체인 아키텍처와 AI 통합 분야의 선구자로서, 210,000+ TPS를 목표로 하는 Triple-Band AI Orchestration 시스템과 양자 내성 암호화 기술을 설계했습니다. Metalock에서의 메타버스 플랫폼 개발 경험을 바탕으로 차세대 분산 컴퓨팅 패러다임을 구축하고 있습니다.",
    expertise: ["AI Orchestration", "Blockchain Architecture", "Quantum Cryptography", "DeFi Systems", "Tokenomics"],
    stats: [
      { value: "10+", label: "Years Exp" },
      { value: "50+", label: "Publications" },
      { value: "5", label: "Patents" }
    ],
    featured: true
  },
  {
    initials: "SL",
    name: "Sarah Lee",
    role: "Chief Technology Officer",
    company: "Ex-Google, Stanford PhD",
    bio: "분산 시스템과 합의 알고리즘 분야의 세계적 전문가. Google에서 대규모 분산 데이터베이스 시스템을 설계한 경험을 보유하고 있습니다.",
    expertise: ["Distributed Systems", "Consensus", "Rust"],
    stats: [
      { value: "15+", label: "Years Exp" },
      { value: "30+", label: "Papers" },
      { value: "12", label: "Patents" }
    ]
  },
  {
    initials: "MK",
    name: "Min-Jun Kim",
    role: "Chief AI Officer",
    company: "Ex-OpenAI, MIT PhD",
    bio: "대규모 언어 모델과 분산 AI 시스템 전문가. OpenAI에서 GPT 시리즈 개발에 참여한 경험을 바탕으로 Triple-Band AI Orchestration을 설계했습니다.",
    expertise: ["Large Language Models", "ML Systems", "AI Safety"],
    stats: [
      { value: "12+", label: "Years Exp" },
      { value: "45+", label: "Papers" },
      { value: "8K+", label: "Citations" }
    ]
  },
  {
    initials: "AP",
    name: "Dr. Alex Park",
    role: "Head of Cryptography",
    company: "Ex-NIST, ETH Zürich PhD",
    bio: "포스트-양자 암호화 분야의 선도적 연구자. NIST 양자 내성 암호화 표준화 프로젝트에 참여한 경험을 보유하고 있습니다.",
    expertise: ["Post-Quantum", "ZK-Proofs", "MPC"],
    stats: [
      { value: "18+", label: "Years Exp" },
      { value: "60+", label: "Papers" },
      { value: "15", label: "Patents" }
    ]
  },
  {
    initials: "JW",
    name: "James Wang",
    role: "Head of DeFi & Tokenomics",
    company: "Ex-Uniswap, Yale MBA",
    bio: "DeFi 프로토콜 설계와 토큰 이코노미 전문가. Uniswap V3 개발에 참여했으며, TBURN의 20년 토큰 이코노미 모델을 설계했습니다.",
    expertise: ["DeFi Protocol", "AMM Design", "Tokenomics"],
    stats: [
      { value: "8+", label: "Years Exp" },
      { value: "$2B+", label: "TVL Designed" },
      { value: "5", label: "Protocols" }
    ]
  },
  {
    initials: "EH",
    name: "Emily Han",
    role: "VP of Engineering",
    company: "Ex-Meta, Berkeley MS",
    bio: "대규모 시스템 엔지니어링 및 인프라 전문가. Meta에서 글로벌 인프라 팀을 이끌었으며, 초당 수백만 요청을 처리하는 시스템을 구축했습니다.",
    expertise: ["Infrastructure", "Scalability", "DevOps"],
    stats: [
      { value: "14+", label: "Years Exp" },
      { value: "100+", label: "Team Led" },
      { value: "1M+", label: "RPS Handled" }
    ]
  }
];

const advisors = [
  { initials: "VB", name: "Victoria Brown", role: "Investment Advisor", affiliation: "Partner, Paradigm Ventures" },
  { initials: "DL", name: "Dr. David Liu", role: "Technical Advisor", affiliation: "Professor, KAIST" },
  { initials: "MC", name: "Michael Chen", role: "Strategy Advisor", affiliation: "Ex-CEO, Binance Labs" },
  { initials: "SY", name: "Sophia Yang", role: "Legal Advisor", affiliation: "Partner, Kim & Chang" },
  { initials: "RT", name: "Dr. Robert Tanaka", role: "AI Research Advisor", affiliation: "Fellow, DeepMind" },
  { initials: "JK", name: "Jennifer Kwon", role: "Ecosystem Advisor", affiliation: "Head of BD, a16z crypto" }
];

const partners = ["JP3E Holdings", "Metalock", "Paradigm", "a16z crypto", "Galaxy Digital", "Chainlink"];

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

export default function FoundersPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${x}%`);
    card.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <div className="founders-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Syne:wght@400;500;600;700;800&display=swap');
        
        .founders-page {
          --color-bg-primary: #0a0a0f;
          --color-bg-secondary: #12121a;
          --color-bg-tertiary: #1a1a25;
          --color-bg-card: rgba(26, 26, 37, 0.6);
          --color-accent-gold: #d4a853;
          --color-accent-gold-light: #f0d090;
          --color-accent-gold-dark: #a67c30;
          --color-accent-cyan: #00d4ff;
          --color-accent-purple: #8b5cf6;
          --color-text-primary: #ffffff;
          --color-text-secondary: rgba(255, 255, 255, 0.7);
          --color-text-tertiary: rgba(255, 255, 255, 0.5);
          --color-border: rgba(212, 168, 83, 0.2);
          --color-border-hover: rgba(212, 168, 83, 0.5);
          --gradient-gold: linear-gradient(135deg, #d4a853 0%, #f0d090 50%, #a67c30 100%);
          --gradient-dark: linear-gradient(180deg, #0a0a0f 0%, #12121a 100%);
          --gradient-card: linear-gradient(145deg, rgba(26, 26, 37, 0.8) 0%, rgba(18, 18, 26, 0.6) 100%);
          --shadow-gold: 0 0 60px rgba(212, 168, 83, 0.15);
          --shadow-card: 0 25px 50px rgba(0, 0, 0, 0.4);
          --font-display: 'Syne', sans-serif;
          --font-body: 'Outfit', sans-serif;
          --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
          
          font-family: var(--font-body);
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          line-height: 1.6;
          overflow-x: hidden;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .founders-page::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 1000;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 10px) scale(1.02); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          50.1% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        @keyframes loaderPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px 10px rgba(212, 168, 83, 0.2); }
        }

        .loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--color-bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s, visibility 0.5s;
        }

        .loader.hidden {
          opacity: 0;
          visibility: hidden;
        }

        .loader-logo {
          width: 80px;
          height: 80px;
          background: var(--gradient-gold);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-bg-primary);
          margin: 0 auto 1.5rem;
          animation: loaderPulse 1.5s ease-in-out infinite;
        }

        .loader-text {
          font-family: var(--font-display);
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .bg-effects {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          animation: float 20s ease-in-out infinite;
        }

        .bg-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212, 168, 83, 0.15) 0%, transparent 70%);
          top: -200px;
          right: -200px;
        }

        .bg-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          bottom: -150px;
          left: -150px;
          animation-delay: -7s;
        }

        .bg-orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -14s;
        }

        .grid-lines {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(212, 168, 83, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 168, 83, 0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          z-index: -1;
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1.5rem 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, transparent 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.4s var(--transition-smooth);
        }

        .nav.scrolled {
          padding: 1rem 4rem;
          background: rgba(10, 10, 15, 0.98);
          border-bottom: 1px solid var(--color-border);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
        }

        .nav-logo-icon {
          width: 48px;
          height: 48px;
          background: var(--gradient-gold);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--color-bg-primary);
          box-shadow: var(--shadow-gold);
          position: relative;
          overflow: hidden;
        }

        .nav-logo-icon::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
          animation: shimmer 3s infinite;
        }

        .nav-logo-text {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .nav-links {
          display: flex;
          gap: 2.5rem;
          align-items: center;
        }

        .nav-link {
          color: var(--color-text-secondary);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.3s var(--transition-smooth);
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--gradient-gold);
          transition: width 0.3s var(--transition-smooth);
        }

        .nav-link:hover, .nav-link.active {
          color: var(--color-accent-gold);
        }

        .nav-link:hover::after, .nav-link.active::after {
          width: 100%;
        }

        .nav-cta {
          padding: 0.75rem 1.75rem;
          background: var(--gradient-gold);
          border: none;
          border-radius: 50px;
          color: var(--color-bg-primary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s var(--transition-smooth);
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(212, 168, 83, 0.3);
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212, 168, 83, 0.4);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 8rem 2rem 4rem;
          position: relative;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          background: rgba(212, 168, 83, 0.1);
          border: 1px solid var(--color-border);
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-accent-gold);
          margin-bottom: 2rem;
        }

        .hero-badge-dot {
          width: 8px;
          height: 8px;
          background: var(--color-accent-gold);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
        }

        .hero-title-gradient {
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1.125rem, 2vw, 1.375rem);
          color: var(--color-text-secondary);
          max-width: 700px;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }

        .hero-stats {
          display: flex;
          gap: 4rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-stat {
          text-align: center;
        }

        .hero-stat-value {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .hero-stat-label {
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.25rem;
        }

        .hero-scroll {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: var(--color-text-tertiary);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .hero-scroll-line {
          width: 1px;
          height: 60px;
          background: linear-gradient(180deg, var(--color-accent-gold) 0%, transparent 100%);
          animation: scrollLine 2s infinite;
        }

        .section {
          padding: 8rem 2rem;
          position: relative;
        }

        .section-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .section-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--color-accent-gold);
          margin-bottom: 1rem;
          position: relative;
        }

        .section-label::before, .section-label::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40px;
          height: 1px;
          background: var(--gradient-gold);
        }

        .section-label::before { right: calc(100% + 1rem); }
        .section-label::after { left: calc(100% + 1rem); }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }

        .section-description {
          font-size: 1.125rem;
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .founders-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 2rem;
          padding: 0 2rem;
        }

        .founder-card {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: 24px;
          padding: 2.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.5s var(--transition-smooth);
          cursor: pointer;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .founder-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-gold);
          transform: scaleX(0);
          transition: transform 0.5s var(--transition-smooth);
        }

        .founder-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 168, 83, 0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }

        .founder-card:hover {
          transform: translateY(-8px);
          border-color: var(--color-border-hover);
          box-shadow: var(--shadow-card), var(--shadow-gold);
        }

        .founder-card:hover::before { transform: scaleX(1); }
        .founder-card:hover::after { opacity: 1; }

        .founder-card.featured {
          grid-column: span 2;
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 3rem;
          padding: 3rem;
        }

        .founder-card.featured .founder-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 0;
        }

        .founder-card.featured .founder-avatar {
          width: 140px;
          height: 140px;
          font-size: 3rem;
          border-radius: 28px;
        }

        .founder-card.featured .founder-name {
          font-size: 2rem;
        }

        .founder-card.featured .founder-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .founder-header {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          align-items: flex-start;
        }

        .founder-avatar {
          width: 90px;
          height: 90px;
          border-radius: 20px;
          background: var(--gradient-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-bg-primary);
          position: relative;
          flex-shrink: 0;
          overflow: hidden;
        }

        .founder-avatar-ring {
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border: 2px solid var(--color-accent-gold);
          border-radius: 22px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .founder-card:hover .founder-avatar-ring { opacity: 1; }

        .founder-info { flex: 1; }

        .founder-name {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }

        .founder-role {
          font-size: 0.95rem;
          color: var(--color-accent-gold);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .founder-company {
          font-size: 0.85rem;
          color: var(--color-text-tertiary);
        }

        .founder-bio {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .founder-expertise {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .founder-tag {
          padding: 0.375rem 0.875rem;
          background: rgba(212, 168, 83, 0.1);
          border: 1px solid rgba(212, 168, 83, 0.2);
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--color-accent-gold-light);
          transition: all 0.3s var(--transition-smooth);
        }

        .founder-tag:hover {
          background: rgba(212, 168, 83, 0.2);
          border-color: rgba(212, 168, 83, 0.4);
        }

        .founder-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
        }

        .founder-stat {
          text-align: center;
        }

        .founder-stat-value {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .founder-stat-label {
          font-size: 0.7rem;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.25rem;
        }

        .founder-social {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .founder-social-link {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all 0.3s var(--transition-smooth);
        }

        .founder-social-link:hover {
          background: var(--color-accent-gold);
          border-color: var(--color-accent-gold);
          color: var(--color-bg-primary);
          transform: translateY(-2px);
        }

        .advisory-section {
          background: var(--gradient-dark);
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }

        .advisors-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          padding: 0 2rem;
        }

        .advisor-card {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s var(--transition-smooth);
        }

        .advisor-card:hover {
          border-color: var(--color-border-hover);
          transform: translateX(8px);
        }

        .advisor-avatar {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-cyan) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .advisor-info { flex: 1; }

        .advisor-name {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .advisor-role {
          font-size: 0.85rem;
          color: var(--color-accent-gold);
        }

        .advisor-affiliation {
          font-size: 0.8rem;
          color: var(--color-text-tertiary);
          margin-top: 0.25rem;
        }

        .partners-section {
          background: var(--color-bg-secondary);
        }

        .partners-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 3rem;
          padding: 0 2rem;
        }

        .partner-logo {
          height: 50px;
          opacity: 0.5;
          filter: grayscale(100%);
          transition: all 0.3s var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          padding: 1rem 2rem;
          border: 1px solid var(--color-border);
          border-radius: 12px;
        }

        .partner-logo:hover {
          opacity: 1;
          filter: grayscale(0%);
          color: var(--color-accent-gold);
          border-color: var(--color-border-hover);
        }

        .cta-section {
          padding: 10rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(212, 168, 83, 0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .cta-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .cta-description {
          font-size: 1.25rem;
          color: var(--color-text-secondary);
          margin-bottom: 3rem;
          line-height: 1.7;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          padding: 1rem 2.5rem;
          background: var(--gradient-gold);
          border: none;
          border-radius: 50px;
          color: var(--color-bg-primary);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s var(--transition-smooth);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 20px rgba(212, 168, 83, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(212, 168, 83, 0.5);
        }

        .btn-secondary {
          padding: 1rem 2.5rem;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 50px;
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s var(--transition-smooth);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-secondary:hover {
          border-color: var(--color-accent-gold);
          color: var(--color-accent-gold);
          transform: translateY(-3px);
        }

        .footer {
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
          padding: 4rem 2rem 2rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
        }

        .footer-brand { max-width: 300px; }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-logo-icon {
          width: 40px;
          height: 40px;
          background: var(--gradient-gold);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1rem;
          color: var(--color-bg-primary);
        }

        .footer-logo-text {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-description {
          font-size: 0.9rem;
          color: var(--color-text-tertiary);
          line-height: 1.7;
        }

        .footer-column h4 {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-primary);
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-links a {
          color: var(--color-text-tertiary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
        }

        .footer-links a:hover { color: var(--color-accent-gold); }

        .footer-bottom {
          max-width: 1200px;
          margin: 3rem auto 0;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-copyright {
          font-size: 0.85rem;
          color: var(--color-text-tertiary);
        }

        .footer-social {
          display: flex;
          gap: 1rem;
        }

        .footer-social-link {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
          text-decoration: none;
          transition: all 0.3s var(--transition-smooth);
        }

        .footer-social-link:hover {
          background: var(--color-accent-gold);
          border-color: var(--color-accent-gold);
          color: var(--color-bg-primary);
        }

        @media (max-width: 1200px) {
          .founder-card.featured {
            grid-column: span 1;
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 992px) {
          .nav { padding: 1rem 2rem; }
          .nav-links { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .hero-stats { gap: 2rem; }
          .founders-grid { grid-template-columns: 1fr; }
          .founder-card.featured { padding: 2rem; }
          .footer-content { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }

        @media (max-width: 480px) {
          .hero { padding: 6rem 1rem 3rem; }
          .section { padding: 4rem 1rem; }
          .founder-header { flex-direction: column; text-align: center; }
          .founder-avatar { margin: 0 auto; }
          .founder-expertise { justify-content: center; }
        }
      `}</style>

      <div className={`loader ${!isLoading ? "hidden" : ""}`}>
        <div className="loader-content">
          <div className="loader-logo">TB</div>
          <div className="loader-text">Loading...</div>
        </div>
      </div>

      <div className="bg-effects">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="grid-lines" />

      <nav className={`nav ${isScrolled ? "scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">TB</div>
          <span className="nav-logo-text">TBURN</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <a href="#founders" className="nav-link active">Founders</a>
          <a href="#advisors" className="nav-link">Advisors</a>
          <Link href="/technology" className="nav-link">Technology</Link>
          <Link href="/whitepaper" className="nav-link">Whitepaper</Link>
          <Link href="/membership" className="nav-cta">Join Network</Link>
        </div>
      </nav>

      <motion.header 
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="hero-badge"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="hero-badge-dot" />
          <span>Building the Future of Blockchain</span>
        </motion.div>
        
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="hero-title-line">Meet the</span>
          <span className="hero-title-line hero-title-gradient">Founding Members</span>
        </motion.h1>
        
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          세계적인 블록체인 전문가, AI 연구자, 기업가들이 모여 차세대 고성능 AI-Enhanced 블록체인 플랫폼을 구축합니다.
        </motion.p>
        
        <motion.div 
          className="hero-stats"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="hero-stat">
            <div className="hero-stat-value">210K+</div>
            <div className="hero-stat-label">Target TPS</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">15+</div>
            <div className="hero-stat-label">Core Members</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">50+</div>
            <div className="hero-stat-label">Years Combined Experience</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>Scroll to Explore</span>
          <div className="hero-scroll-line" />
        </motion.div>
      </motion.header>

      <section className="section" id="founders">
        <div className="section-header">
          <span className="section-label">Leadership Team</span>
          <h2 className="section-title">Core Founding Members</h2>
          <p className="section-description">
            TBURN 메인넷의 비전을 실현하기 위해 모인 핵심 창립 멤버들을 소개합니다.
          </p>
        </div>

        <div className="founders-grid">
          {founders.map((founder, index) => (
            <motion.div
              key={founder.name}
              ref={(el) => { cardsRef.current[index] = el; }}
              className={`founder-card ${founder.featured ? "featured" : ""}`}
              onMouseMove={(e) => handleCardMouseMove(e, index)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
              data-testid={`card-founder-${index}`}
            >
              <div className="founder-header">
                <div className="founder-avatar">
                  <div className="founder-avatar-ring" />
                  {founder.initials}
                </div>
                <div className="founder-info">
                  <h3 className="founder-name">{founder.name}</h3>
                  <p className="founder-role">{founder.role}</p>
                  <p className="founder-company">{founder.company}</p>
                </div>
              </div>
              <div className={founder.featured ? "founder-content" : ""}>
                <p className="founder-bio">{founder.bio}</p>
                <div className="founder-expertise">
                  {founder.expertise.map((tag) => (
                    <span key={tag} className="founder-tag">{tag}</span>
                  ))}
                </div>
                <div className="founder-stats-grid">
                  {founder.stats.map((stat) => (
                    <div key={stat.label} className="founder-stat">
                      <div className="founder-stat-value">{stat.value}</div>
                      <div className="founder-stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="founder-social">
                  <a href="#" className="founder-social-link" aria-label="LinkedIn" data-testid={`link-linkedin-${index}`}>
                    <LinkedInIcon />
                  </a>
                  <a href="#" className="founder-social-link" aria-label="Twitter" data-testid={`link-twitter-${index}`}>
                    <TwitterIcon />
                  </a>
                  <a href="#" className="founder-social-link" aria-label="GitHub" data-testid={`link-github-${index}`}>
                    <GitHubIcon />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section advisory-section" id="advisors">
        <div className="section-header">
          <span className="section-label">Strategic Guidance</span>
          <h2 className="section-title">Advisory Board</h2>
          <p className="section-description">
            글로벌 블록체인 생태계의 리더들이 TBURN의 성장을 지원합니다.
          </p>
        </div>

        <div className="advisors-grid">
          {advisors.map((advisor, index) => (
            <motion.div
              key={advisor.name}
              className="advisor-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
              data-testid={`card-advisor-${index}`}
            >
              <div className="advisor-avatar">{advisor.initials}</div>
              <div className="advisor-info">
                <h3 className="advisor-name">{advisor.name}</h3>
                <p className="advisor-role">{advisor.role}</p>
                <p className="advisor-affiliation">{advisor.affiliation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section partners-section">
        <div className="section-header">
          <span className="section-label">Ecosystem</span>
          <h2 className="section-title">Strategic Partners</h2>
          <p className="section-description">
            TBURN 생태계 구축을 위해 협력하는 전략적 파트너들입니다.
          </p>
        </div>

        <div className="partners-grid">
          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              className="partner-logo"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              data-testid={`text-partner-${index}`}
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-title">Join the TBURN Revolution</h2>
          <p className="cta-description">
            차세대 AI-Enhanced 블록체인의 미래를 함께 만들어갈 파운더를 찾고 있습니다. 
            210,000+ TPS의 고성능 블록체인 생태계에 참여하세요.
          </p>
          <div className="cta-buttons">
            <Link href="/membership" className="btn-primary" data-testid="button-apply-founder">
              <span>Apply as Founder</span>
              <ArrowRightIcon />
            </Link>
            <Link href="/whitepaper" className="btn-secondary" data-testid="button-whitepaper">
              <span>Read Whitepaper</span>
              <DocumentIcon />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">TB</div>
              <span className="footer-logo-text">TBURN</span>
            </div>
            <p className="footer-description">
              AI-Enhanced Layer 1 블록체인. 210,000+ TPS의 고성능과 양자 내성 보안을 제공하는 차세대 분산 네트워크.
            </p>
          </div>

          <div className="footer-column">
            <h4>Product</h4>
            <ul className="footer-links">
              <li><Link href="/technology">Technology</Link></li>
              <li><Link href="/whitepaper">Whitepaper</Link></li>
              <li><Link href="/tokenomics">Tokenomics</Link></li>
              <li><Link href="/roadmap">Roadmap</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Developers</h4>
            <ul className="footer-links">
              <li><Link href="/docs">Documentation</Link></li>
              <li><a href="#">SDK</a></li>
              <li><a href="#">GitHub</a></li>
              <li><Link href="/rpc">API Reference</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Community</h4>
            <ul className="footer-links">
              <li><a href="#">Discord</a></li>
              <li><a href="#">Telegram</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; 2025 TBURN CHAINS Foundation. All rights reserved.
          </p>
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="#" className="footer-social-link" aria-label="GitHub">
              <GitHubIcon />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
