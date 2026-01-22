import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

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

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const founders = [
    {
      initials: "KJ",
      name: "Kevin Jeong",
      role: t("foundersPage.founders.kevinCho.role"),
      company: t("foundersPage.founders.kevinCho.company"),
      bio: t("foundersPage.founders.kevinCho.bio"),
      expertise: [
        t("foundersPage.founders.expertise.aiOrchestration"),
        t("foundersPage.founders.expertise.blockchainArchitecture"),
        t("foundersPage.founders.expertise.quantumCryptography"),
        t("foundersPage.founders.expertise.defiSystems"),
        t("foundersPage.founders.expertise.tokenomics")
      ],
      stats: [
        { value: "10+", label: t("foundersPage.founders.stats.yearsExp") },
        { value: "50+", label: t("foundersPage.founders.stats.publications") },
        { value: "5", label: t("foundersPage.founders.stats.patents") }
      ],
      featured: true
    },
    {
      initials: "OC",
      name: "Olivia Che",
      role: t("foundersPage.founders.oliviaChe.role"),
      company: t("foundersPage.founders.oliviaChe.company"),
      bio: t("foundersPage.founders.oliviaChe.bio"),
      expertise: [
        t("foundersPage.founders.expertise.investment"),
        t("foundersPage.founders.expertise.portfolio"),
        t("foundersPage.founders.expertise.blockchain")
      ],
      stats: [
        { value: "5+", label: t("foundersPage.founders.stats.yearsInvestment") },
        { value: "$50M+", label: t("foundersPage.founders.stats.invested") },
        { value: "20+", label: t("foundersPage.founders.stats.portfolio") }
      ]
    },
    {
      initials: "MK",
      name: "Min-Jun Kim",
      role: t("foundersPage.founders.minJunKim.role"),
      company: t("foundersPage.founders.minJunKim.company"),
      bio: t("foundersPage.founders.minJunKim.bio"),
      expertise: [
        t("foundersPage.founders.expertise.llm"),
        t("foundersPage.founders.expertise.mlSystems"),
        t("foundersPage.founders.expertise.aiSafety")
      ],
      stats: [
        { value: "12+", label: t("foundersPage.founders.stats.yearsExp") },
        { value: "45+", label: t("foundersPage.founders.stats.papers") },
        { value: "8K+", label: t("foundersPage.founders.stats.citations") }
      ]
    },
    {
      initials: "AP",
      name: "Dr. Alex Park",
      role: t("foundersPage.founders.alexPark.role"),
      company: t("foundersPage.founders.alexPark.company"),
      bio: t("foundersPage.founders.alexPark.bio"),
      expertise: [
        t("foundersPage.founders.expertise.postQuantum"),
        t("foundersPage.founders.expertise.zkProofs"),
        t("foundersPage.founders.expertise.mpc")
      ],
      stats: [
        { value: "18+", label: t("foundersPage.founders.stats.yearsExp") },
        { value: "60+", label: t("foundersPage.founders.stats.papers") },
        { value: "15", label: t("foundersPage.founders.stats.patents") }
      ]
    },
    {
      initials: "JW",
      name: "James Wang",
      role: t("foundersPage.founders.jamesWang.role"),
      company: t("foundersPage.founders.jamesWang.company"),
      bio: t("foundersPage.founders.jamesWang.bio"),
      expertise: [
        t("foundersPage.founders.expertise.defiProtocol"),
        t("foundersPage.founders.expertise.ammDesign"),
        t("foundersPage.founders.expertise.tokenomics")
      ],
      stats: [
        { value: "8+", label: t("foundersPage.founders.stats.yearsExp") },
        { value: "$2B+", label: t("foundersPage.founders.stats.tvlDesigned") },
        { value: "5", label: t("foundersPage.founders.stats.protocols") }
      ]
    },
    {
      initials: "EH",
      name: "Emily Han",
      role: t("foundersPage.founders.emilyHan.role"),
      company: t("foundersPage.founders.emilyHan.company"),
      bio: t("foundersPage.founders.emilyHan.bio"),
      expertise: [
        t("foundersPage.founders.expertise.infrastructure"),
        t("foundersPage.founders.expertise.scalability"),
        t("foundersPage.founders.expertise.devops")
      ],
      stats: [
        { value: "14+", label: t("foundersPage.founders.stats.yearsExp") },
        { value: "100+", label: t("foundersPage.founders.stats.teamLed") },
        { value: "1M+", label: t("foundersPage.founders.stats.rpsHandled") }
      ]
    }
  ];

  const advisors = [
    { initials: "VB", name: "Victoria Brown", role: t("foundersPage.advisors.victoriaBrown.role"), affiliation: t("foundersPage.advisors.victoriaBrown.affiliation") },
    { initials: "DL", name: "Dr. David Liu", role: t("foundersPage.advisors.davidLiu.role"), affiliation: t("foundersPage.advisors.davidLiu.affiliation") },
    { initials: "MC", name: "Michael Chen", role: t("foundersPage.advisors.michaelChen.role"), affiliation: t("foundersPage.advisors.michaelChen.affiliation") },
    { initials: "SY", name: "Sophia Yang", role: t("foundersPage.advisors.sophiaYang.role"), affiliation: t("foundersPage.advisors.sophiaYang.affiliation") },
    { initials: "RT", name: "Dr. Robert Tanaka", role: t("foundersPage.advisors.robertTanaka.role"), affiliation: t("foundersPage.advisors.robertTanaka.affiliation") },
    { initials: "JK", name: "Jennifer Kwon", role: t("foundersPage.advisors.jenniferKwon.role"), affiliation: t("foundersPage.advisors.jenniferKwon.affiliation") }
  ];

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

        .contacts-section {
          background: var(--color-bg-secondary);
        }

        .contacts-table-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .contacts-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--color-bg-primary);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .contacts-table th,
        .contacts-table td {
          padding: 1.25rem 2rem;
          text-align: left;
          border-bottom: 1px solid var(--color-border);
        }

        .contacts-table th {
          background: linear-gradient(135deg, rgba(212, 168, 83, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-accent-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .contacts-table td {
          font-size: 1rem;
          color: var(--color-text-primary);
        }

        .contacts-table td:first-child {
          font-weight: 600;
          color: white;
        }

        .contacts-table td:nth-child(2) {
          color: var(--color-text-secondary);
        }

        .contacts-table td a {
          color: var(--color-accent-gold);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .contacts-table td a:hover {
          color: white;
          text-decoration: underline;
        }

        .contacts-table tbody tr {
          transition: background 0.2s ease;
        }

        .contacts-table tbody tr:hover {
          background: rgba(212, 168, 83, 0.05);
        }

        .contacts-table tbody tr:last-child td {
          border-bottom: none;
        }

        @media (max-width: 640px) {
          .contacts-table th,
          .contacts-table td {
            padding: 1rem 1rem;
            font-size: 0.875rem;
          }
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
          <div className="loader-text">{t("foundersPage.loading")}</div>
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
          <Link href="/" className="nav-link">{t("foundersPage.nav.home")}</Link>
          <a href="#founders" className="nav-link active">{t("foundersPage.nav.founders")}</a>
          <a href="#advisors" className="nav-link">{t("foundersPage.nav.advisors")}</a>
          <Link href="/technical-whitepaper" className="nav-link">{t("foundersPage.nav.technology")}</Link>
          <Link href="/whitepaper" className="nav-link">{t("foundersPage.nav.whitepaper")}</Link>
          <LanguageSelector isDark={true} />
          <Link href="/membership" className="nav-cta">{t("foundersPage.nav.joinNetwork")}</Link>
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
          <span>{t("foundersPage.hero.badge")}</span>
        </motion.div>
        
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="hero-title-line">{t("foundersPage.hero.titleLine1")}</span>
          <span className="hero-title-line hero-title-gradient">{t("foundersPage.hero.titleLine2")}</span>
        </motion.h1>
        
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {t("foundersPage.hero.subtitle")}
        </motion.p>
        
        <motion.div 
          className="hero-stats"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="hero-stat">
            <div className="hero-stat-value">210K+</div>
            <div className="hero-stat-label">{t("foundersPage.hero.stats.tps")}</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">15+</div>
            <div className="hero-stat-label">{t("foundersPage.hero.stats.members")}</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">50+</div>
            <div className="hero-stat-label">{t("foundersPage.hero.stats.experience")}</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>{t("foundersPage.hero.scroll")}</span>
          <div className="hero-scroll-line" />
        </motion.div>
      </motion.header>

      <section className="section" id="founders">
        <div className="section-header">
          <span className="section-label">{t("foundersPage.foundersSection.label")}</span>
          <h2 className="section-title">{t("foundersPage.foundersSection.title")}</h2>
          <p className="section-description">
            {t("foundersPage.foundersSection.description")}
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
                  <a href="https://x.com/tburnio" target="_blank" rel="noopener noreferrer" className="founder-social-link" aria-label="X" data-testid={`link-twitter-${index}`}>
                    <TwitterIcon />
                  </a>
                  <a href="https://discord.gg/uaPFkUkfN2" target="_blank" rel="noopener noreferrer" className="founder-social-link" aria-label="Discord" data-testid={`link-discord-${index}`}>
                    <DiscordIcon />
                  </a>
                  <a href="https://www.youtube.com/@tburnio" target="_blank" rel="noopener noreferrer" className="founder-social-link" aria-label="YouTube" data-testid={`link-youtube-${index}`}>
                    <YouTubeIcon />
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61584329147888" target="_blank" rel="noopener noreferrer" className="founder-social-link" aria-label="Facebook" data-testid={`link-facebook-${index}`}>
                    <FacebookIcon />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section advisory-section" id="advisors">
        <div className="section-header">
          <span className="section-label">{t("foundersPage.advisorsSection.label")}</span>
          <h2 className="section-title">{t("foundersPage.advisorsSection.title")}</h2>
          <p className="section-description">
            {t("foundersPage.advisorsSection.description")}
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
          <span className="section-label">{t("foundersPage.partnersSection.label")}</span>
          <h2 className="section-title">{t("foundersPage.partnersSection.title")}</h2>
          <p className="section-description">
            {t("foundersPage.partnersSection.description")}
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

      <section className="section contacts-section" id="contacts">
        <div className="section-header">
          <span className="section-label">{t("foundersPage.contactsSection.label")}</span>
          <h2 className="section-title">{t("foundersPage.contactsSection.title")}</h2>
          <p className="section-description">
            {t("foundersPage.contactsSection.description")}
          </p>
        </div>

        <motion.div
          className="contacts-table-container"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <table className="contacts-table" data-testid="table-contacts">
            <thead>
              <tr>
                <th>{t("foundersPage.contactsSection.headers.area")}</th>
                <th>{t("foundersPage.contactsSection.headers.representative")}</th>
                <th>{t("foundersPage.contactsSection.headers.contact")}</th>
              </tr>
            </thead>
            <tbody>
              <tr data-testid="contact-ir">
                <td>{t("foundersPage.contactsSection.rows.investment.area")}</td>
                <td>{t("foundersPage.contactsSection.rows.investment.rep")}</td>
                <td><a href="mailto:ir@tburn.io">ir@tburn.io</a></td>
              </tr>
              <tr data-testid="contact-tech">
                <td>{t("foundersPage.contactsSection.rows.tech.area")}</td>
                <td>{t("foundersPage.contactsSection.rows.tech.rep")}</td>
                <td><a href="mailto:tech@tburn.io">tech@tburn.io</a></td>
              </tr>
              <tr data-testid="contact-legal">
                <td>{t("foundersPage.contactsSection.rows.legal.area")}</td>
                <td>{t("foundersPage.contactsSection.rows.legal.rep")}</td>
                <td><a href="mailto:legal@tburn.io">legal@tburn.io</a></td>
              </tr>
              <tr data-testid="contact-partnerships">
                <td>{t("foundersPage.contactsSection.rows.partnership.area")}</td>
                <td>{t("foundersPage.contactsSection.rows.partnership.rep")}</td>
                <td><a href="mailto:partnerships@tburn.io">partnerships@tburn.io</a></td>
              </tr>
              <tr data-testid="contact-press">
                <td>{t("foundersPage.contactsSection.rows.media.area")}</td>
                <td>{t("foundersPage.contactsSection.rows.media.rep")}</td>
                <td><a href="mailto:press@tburn.io">press@tburn.io</a></td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </section>

      <section className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-title">{t("foundersPage.cta.title")}</h2>
          <p className="cta-description">
            {t("foundersPage.cta.description")}
          </p>
          <div className="cta-buttons">
            <Link href="/membership" className="btn-primary" data-testid="button-apply-founder">
              <span>{t("foundersPage.cta.applyFounder")}</span>
              <ArrowRightIcon />
            </Link>
            <Link href="/whitepaper" className="btn-secondary" data-testid="button-whitepaper">
              <span>{t("foundersPage.cta.readWhitepaper")}</span>
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
              {t("foundersPage.footer.description")}
            </p>
          </div>

          <div className="footer-column">
            <h4>{t("foundersPage.footer.product")}</h4>
            <ul className="footer-links">
              <li><Link href="/technical-whitepaper">{t("foundersPage.footer.links.technology")}</Link></li>
              <li><Link href="/whitepaper">{t("foundersPage.footer.links.whitepaper")}</Link></li>
              <li><Link href="/tokenomics">{t("foundersPage.footer.links.tokenomics")}</Link></li>
              <li><Link href="/roadmap">{t("foundersPage.footer.links.roadmap")}</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>{t("foundersPage.footer.developers")}</h4>
            <ul className="footer-links">
              <li><Link href="/docs">{t("foundersPage.footer.links.documentation")}</Link></li>
              <li><a href="#">{t("foundersPage.footer.links.sdk")}</a></li>
              <li><a href="#">{t("foundersPage.footer.links.github")}</a></li>
              <li><Link href="/rpc">{t("foundersPage.footer.links.apiReference")}</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>{t("foundersPage.footer.community")}</h4>
            <ul className="footer-links">
              <li><a href="#">{t("foundersPage.footer.links.discord")}</a></li>
              <li><a href="#">{t("foundersPage.footer.links.telegram")}</a></li>
              <li><a href="#">{t("foundersPage.footer.links.twitter")}</a></li>
              <li><a href="#">{t("foundersPage.footer.links.blog")}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            {t("foundersPage.footer.copyright")}
          </p>
          <div className="footer-social">
            <a href="https://x.com/tburnio" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="X">
              <TwitterIcon />
            </a>
            <a href="https://discord.gg/uaPFkUkfN2" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Discord">
              <DiscordIcon />
            </a>
            <a href="https://www.youtube.com/@tburnio" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="YouTube">
              <YouTubeIcon />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61584329147888" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
              <FacebookIcon />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
