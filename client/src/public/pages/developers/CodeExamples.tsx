import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Utensils, 
  Flame, 
  CheckCircle,
  Wallet,
  Coins,
  Bot,
  Images,
  ArrowLeftRight,
  Database
} from "lucide-react";
import { SiGithub } from "react-icons/si";

const featuredCode = `pragma solidity ^0.8.19;

import "@burnchain/contracts/ITrustOracle.sol";

contract SecureVault {
    ITrustOracle public trustOracle;
    uint256 public constant MIN_SCORE = 70;

    constructor(address _oracle) {
        trustOracle = ITrustOracle(_oracle);
    }

    function depositToProject(address project) external payable {
        // 1. Verify Trust Score before deposit
        uint8 score = trustOracle.getScore(project);
        
        require(score >= MIN_SCORE, "Project trust too low");
        
        // 2. Proceed with logic
        (bool success, ) = project.call{value: msg.value}("");
        require(success, "Transfer failed");
    }
}`;

function SyntaxHighlight({ code }: { code: string }) {
  const highlight = (text: string) => {
    return text
      .replace(/(pragma solidity|import|contract|constructor|function|external|payable|public|constant|require)/g, '<span style="color: #ff79c6">$1</span>')
      .replace(/(SecureVault|ITrustOracle|getScore|call)/g, '<span style="color: #50fa7b">$1</span>')
      .replace(/("@burnchain\/contracts\/ITrustOracle\.sol"|"Project trust too low"|"Transfer failed"|"")/g, '<span style="color: #f1fa8c">$1</span>')
      .replace(/(\/\/ .*)/g, '<span style="color: #6272a4">$1</span>')
      .replace(/(uint256|uint8|address|bool)/g, '<span style="color: #8be9fd">$1</span>');
  };

  return (
    <pre 
      className="text-sm overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: highlight(code) }}
    />
  );
}

export default function CodeExamples() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All Recipes");
  const [activeTab, setActiveTab] = useState("SecureVault.sol");
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = [
    t('publicPages.developers.examples.categories.allRecipes'),
    t('publicPages.developers.examples.categories.smartContracts'),
    t('publicPages.developers.examples.categories.defi'),
    t('publicPages.developers.examples.categories.nfts'),
    t('publicPages.developers.examples.categories.wallets')
  ];

  const commonRecipes = [
    {
      title: t('publicPages.developers.examples.recipes.connectWallet.title'),
      description: t('publicPages.developers.examples.recipes.connectWallet.description'),
      icon: Wallet,
      color: "#00f0ff",
      category: t('publicPages.developers.examples.recipes.connectWallet.category'),
      tags: ["#react", "#web3"]
    },
    {
      title: t('publicPages.developers.examples.recipes.createToken.title'),
      description: t('publicPages.developers.examples.recipes.createToken.description'),
      icon: Coins,
      color: "#7000ff",
      category: t('publicPages.developers.examples.recipes.createToken.category'),
      tags: ["#token", "#smart-contract"]
    },
    {
      title: t('publicPages.developers.examples.recipes.aiOracle.title'),
      description: t('publicPages.developers.examples.recipes.aiOracle.description'),
      icon: Bot,
      color: "#00ff9d",
      category: t('publicPages.developers.examples.recipes.aiOracle.category'),
      tags: ["#python", "#api"]
    },
    {
      title: t('publicPages.developers.examples.recipes.nftMinting.title'),
      description: t('publicPages.developers.examples.recipes.nftMinting.description'),
      icon: Images,
      color: "#ffd700",
      category: t('publicPages.developers.examples.recipes.nftMinting.category'),
      tags: ["#nft", "#mint"]
    },
    {
      title: t('publicPages.developers.examples.recipes.flashLoan.title'),
      description: t('publicPages.developers.examples.recipes.flashLoan.description'),
      icon: ArrowLeftRight,
      color: "#ff0055",
      category: t('publicPages.developers.examples.recipes.flashLoan.category'),
      tags: ["#defi", "#arbitrage"]
    },
    {
      title: t('publicPages.developers.examples.recipes.indexerSetup.title'),
      description: t('publicPages.developers.examples.recipes.indexerSetup.description'),
      icon: Database,
      color: "#3b82f6",
      category: t('publicPages.developers.examples.recipes.indexerSetup.category'),
      tags: ["#graph", "#data"]
    },
  ];

  const featuredRecipeChecks = [
    t('publicPages.developers.examples.featured.checks.trustScore'),
    t('publicPages.developers.examples.featured.checks.revert'),
    t('publicPages.developers.examples.featured.checks.gasOptimized'),
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll(".spotlight-card");
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff9d]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00ff9d] mb-6">
            <Utensils className="w-4 h-4" /> {t('publicPages.developers.examples.tag')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.developers.examples.title').split(' ')[0]}{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              {t('publicPages.developers.examples.title').split(' ').slice(1).join(' ') || 'Examples'}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
            {t('publicPages.developers.examples.subtitle')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button 
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition ${
                  activeCategory === category
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30"
                }`}
                data-testid={`filter-${index}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipe Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <Flame className="w-6 h-6 text-[#7000ff]" /> {t('publicPages.developers.examples.featured.title')}
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('publicPages.developers.examples.featured.description')}
                </p>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm mt-4">
                  {featuredRecipeChecks.map((check, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-[#00ff9d]" /> {check}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-gray-100 dark:bg-white/5 rounded p-3 border border-gray-300 dark:border-white/10 text-center flex-1">
                  <div className="text-xs text-gray-500 uppercase">{t('publicPages.developers.examples.featured.difficulty')}</div>
                  <div className="text-[#00ff9d] font-bold">{t('publicPages.developers.examples.featured.intermediate')}</div>
                </div>
                <div className="bg-gray-100 dark:bg-white/5 rounded p-3 border border-gray-300 dark:border-white/10 text-center flex-1">
                  <div className="text-xs text-gray-500 uppercase">{t('publicPages.developers.examples.featured.time')}</div>
                  <div className="text-gray-900 dark:text-white font-bold">{t('publicPages.developers.examples.featured.tenMins')}</div>
                </div>
              </div>
            </div>

            {/* IDE Window */}
            <div 
              className="rounded-lg overflow-hidden shadow-2xl"
              style={{ 
                background: "#0d0d12",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 25px 50px -12px rgba(112, 0, 255, 0.2)"
              }}
              data-testid="ide-window"
            >
              <div 
                className="px-4 py-2 flex items-center justify-between"
                style={{ 
                  background: "#1a1a20",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex gap-4 text-xs font-mono">
                  <button 
                    onClick={() => setActiveTab("SecureVault.sol")}
                    className={activeTab === "SecureVault.sol" 
                      ? "text-[#00f0ff] border-b border-[#00f0ff] pb-1" 
                      : "text-gray-500 hover:text-white transition"
                    }
                  >
                    SecureVault.sol
                  </button>
                  <button 
                    onClick={() => setActiveTab("App.tsx")}
                    className={activeTab === "App.tsx" 
                      ? "text-[#00f0ff] border-b border-[#00f0ff] pb-1" 
                      : "text-gray-500 hover:text-white transition"
                    }
                  >
                    App.tsx
                  </button>
                </div>
              </div>
              <div className="p-6 font-mono text-gray-300 overflow-x-auto">
                <SyntaxHighlight code={featuredCode} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Recipes Section */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('publicPages.developers.examples.commonRecipes')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonRecipes.map((recipe, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group cursor-pointer"
                data-testid={`recipe-card-${index}`}
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div 
                    className="p-2 rounded"
                    style={{ backgroundColor: `${recipe.color}10`, color: recipe.color }}
                  >
                    <recipe.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {recipe.category}
                  </span>
                </div>
                <h3 
                  className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors"
                  style={{ "--hover-color": recipe.color } as React.CSSProperties}
                >
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{recipe.description}</p>
                <div className="flex gap-2 text-xs font-mono text-gray-500">
                  {recipe.tags.map((tag, tagIndex) => (
                    <span key={tagIndex}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div 
            className="rounded-2xl p-1"
            style={{ 
              background: "linear-gradient(to right, rgba(112, 0, 255, 0.2), rgba(0, 240, 255, 0.2))",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <div 
              className="rounded-xl p-10 text-center"
              style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(24px)" }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">{t('publicPages.developers.examples.cta.title')}</h2>
              <p className="text-gray-400 mb-8">
                {t('publicPages.developers.examples.cta.description')}
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all hover:-translate-y-0.5"
                  style={{ 
                    background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                    boxShadow: "0 0 15px rgba(112, 0, 255, 0.3)"
                  }}
                  data-testid="button-submit-pr"
                >
                  <SiGithub className="w-5 h-5" /> {t('publicPages.developers.examples.cta.submitPr')}
                </a>
                <Link href="/community/hub">
                  <button 
                    className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                    data-testid="button-request-guide"
                  >
                    {t('publicPages.developers.examples.cta.requestGuide')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
