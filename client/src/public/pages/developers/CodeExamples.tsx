import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
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

const categories = ["All Recipes", "Smart Contracts", "DeFi", "NFTs", "Wallets"];

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

const commonRecipes = [
  {
    title: "Connect Wallet",
    description: "Standard hook for connecting MetaMask or TBurn Wallet to your React dApp.",
    icon: Wallet,
    color: "#00f0ff",
    category: "Frontend",
    tags: ["#react", "#web3"]
  },
  {
    title: "Create ARC-20 Token",
    description: "Deploy a standard fungible token with built-in Auto-Burn mechanics.",
    icon: Coins,
    color: "#7000ff",
    category: "Solidity",
    tags: ["#token", "#smart-contract"]
  },
  {
    title: "AI Oracle Query",
    description: "Fetch real-time market predictions using the Triple-Band AI API.",
    icon: Bot,
    color: "#00ff9d",
    category: "Backend",
    tags: ["#python", "#api"]
  },
  {
    title: "NFT Minting",
    description: "Gas-optimized ERC-721A implementation for large collections.",
    icon: Images,
    color: "#ffd700",
    category: "Solidity",
    tags: ["#nft", "#mint"]
  },
  {
    title: "Flash Loan",
    description: "Execute arbitrage using uncollateralized flash loans on TBurn DEX.",
    icon: ArrowLeftRight,
    color: "#ff0055",
    category: "DeFi",
    tags: ["#defi", "#arbitrage"]
  },
  {
    title: "Indexer Setup",
    description: "Configure a local indexer to query complex on-chain data.",
    icon: Database,
    color: "#3b82f6",
    category: "Tools",
    tags: ["#graph", "#data"]
  },
];

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
  const [activeCategory, setActiveCategory] = useState("All Recipes");
  const [activeTab, setActiveTab] = useState("SecureVault.sol");
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff9d]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00ff9d] mb-6">
            <Utensils className="w-4 h-4" /> CODE_RECIPES
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Developer{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              Cookbook
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
            Copy-paste ready recipes to accelerate your development. From smart contracts to frontend integration.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button 
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition ${
                  activeCategory === category
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:border-white/30"
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
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Flame className="w-6 h-6 text-[#7000ff]" /> Featured Recipe: Trust Score Integration
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-gray-400">
                  Automatically verify a project's Trust Score before interacting with it. This recipe prevents your users from interacting with low-trust contracts.
                </p>
                <ul className="space-y-3 text-gray-300 text-sm mt-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#00ff9d]" /> Checks Trust Score {">"} 70
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#00ff9d]" /> Reverts transaction if unsafe
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#00ff9d]" /> Gas optimized check
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-white/5 rounded p-3 border border-white/10 text-center flex-1">
                  <div className="text-xs text-gray-500 uppercase">Difficulty</div>
                  <div className="text-[#00ff9d] font-bold">Intermediate</div>
                </div>
                <div className="bg-white/5 rounded p-3 border border-white/10 text-center flex-1">
                  <div className="text-xs text-gray-500 uppercase">Time</div>
                  <div className="text-white font-bold">10 Mins</div>
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
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white mb-8">Common Recipes</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonRecipes.map((recipe, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-6 group cursor-pointer"
                style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
                data-testid={`recipe-card-${index}`}
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div 
                    className="p-2 rounded"
                    style={{ backgroundColor: `${recipe.color}10`, color: recipe.color }}
                  >
                    <recipe.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-gray-300">
                    {recipe.category}
                  </span>
                </div>
                <h3 
                  className="text-lg font-bold text-white mb-2 transition-colors"
                  style={{ "--hover-color": recipe.color } as React.CSSProperties}
                >
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{recipe.description}</p>
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
              <h2 className="text-3xl font-bold text-white mb-4">Got a tasty recipe?</h2>
              <p className="text-gray-400 mb-8">
                Contribute to the cookbook and earn TBURN rewards for helping the developer community.
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
                  <SiGithub className="w-5 h-5" /> Submit PR
                </a>
                <button 
                  className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                  data-testid="button-request-guide"
                >
                  Request a Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
