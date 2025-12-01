import { useRef, useEffect } from "react";
import { 
  Coins, 
  Flame,
  Layers,
  Gavel,
  Check
} from "lucide-react";

const marketStats = [
  { value: "$2.4B", label: "Market Cap", color: "#ffb800" },
  { value: "67.4M", label: "Circulating Supply", color: "#00f0ff" },
  { value: "12.8M", label: "Burned (Deflationary)", color: "#ff0055" },
  { value: "42.1M", label: "Total Staked", color: "#00ff9d" },
];

const tokenDistribution = [
  { percent: "30%", title: "Validator Rewards", subtitle: "4-year linear vesting", color: "#7000ff" },
  { percent: "25%", title: "Ecosystem Fund", subtitle: "5-year linear vesting for grants", color: "#00f0ff" },
  { percent: "15%", title: "Team & Advisors", subtitle: "1-year cliff + 4-year vesting", color: "#00ff9d" },
  { percent: "12%", title: "Foundation Reserve", subtitle: "Permanent lock (Governance unlock required)", color: "#ffb800" },
];

const burnMechanisms = [
  { percent: "70%", title: "Transaction Fees", description: "Base fees from every transaction are automatically burned." },
  { percent: "100%", title: "Collateral Burn", description: "Trust violation results in immediate burning of staked collateral." },
  { percent: "30%", title: "Revenue Buyback", description: "Protocol revenue used for quarterly buyback and burn." },
  { percent: "50%", title: "Slashing Penalty", description: "Half of validator penalties are burned permanently." },
];

const stakingRewards = [
  { type: "Liquid Staking", apy: "8-10% APY" },
  { type: "90-Day Lock", apy: "15-18% APY" },
  { type: "365-Day Lock", apy: "20-25% APY" },
];

const governanceFeatures = [
  "Vote on protocol parameter changes",
  "Approve treasury spending proposals",
  "Decide on major validator slashing events",
];

export default function Tokenomics() {
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#ffb800]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#ffb800] mb-6">
            <Coins className="w-4 h-4" /> TBURN + EMBER GAS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Token{" "}
            <span className="bg-gradient-to-r from-[#ffb800] to-[#ff5e00] bg-clip-text text-transparent">
              Economics
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            A sustainable economic model powered by the deflationary TBURN token and the efficient Ember Gas system. Designed for long-term value and trust-based growth.
          </p>
        </div>
      </section>

      {/* Market Stats Section */}
      <section className="py-12 px-6 border-b border-white/5 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {marketStats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`market-stat-${index}`}>
                <div className="text-3xl font-bold mb-1 font-mono" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token Cards Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* TBURN Token Card */}
            <div 
              className="spotlight-card rounded-2xl p-8"
              style={{ 
                border: "1px solid rgba(255, 184, 0, 0.3)",
                background: "rgba(255, 184, 0, 0.05)"
              }}
              data-testid="card-tburn"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#ffb800]/20 flex items-center justify-center text-[#ffb800] text-2xl">
                  <Coins className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">TBURN</h3>
                  <p className="text-sm text-[#ffb800] font-mono">Governance & Utility</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2 gap-2">
                  <span className="text-gray-400">Total Supply</span>
                  <span className="text-white font-mono">100,000,000</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2 gap-2">
                  <span className="text-gray-400">Decimals</span>
                  <span className="text-white font-mono">18</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2 gap-2">
                  <span className="text-gray-400">Role</span>
                  <span className="text-white">Staking, Voting, Collateral</span>
                </div>
              </div>
            </div>

            {/* Ember Token Card */}
            <div 
              className="spotlight-card rounded-2xl p-8"
              style={{ 
                border: "1px solid rgba(255, 94, 0, 0.3)",
                background: "rgba(255, 94, 0, 0.05)"
              }}
              data-testid="card-ember"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#ff5e00]/20 flex items-center justify-center text-[#ff5e00] text-2xl">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Ember</h3>
                  <p className="text-sm text-[#ff5e00] font-mono">Network Gas Unit</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2 gap-2">
                  <span className="text-gray-400">Exchange Ratio</span>
                  <span className="text-white font-mono">1 TBURN = 10^9 Ember</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2 gap-2">
                  <span className="text-gray-400">Base Fee</span>
                  <span className="text-[#ff0055] font-bold">100% Burned</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2 gap-2">
                  <span className="text-gray-400">Role</span>
                  <span className="text-white">Transaction Fees, Compute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Distribution Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Token Distribution</h2>
            <p className="text-gray-400">Fair allocation designed for ecosystem longevity.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Donut Chart */}
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#7000ff" 
                  strokeWidth="15" 
                  strokeDasharray="94.2 314" 
                  strokeDashoffset="0"
                />
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#00f0ff" 
                  strokeWidth="15" 
                  strokeDasharray="78.5 314" 
                  strokeDashoffset="-94.2"
                />
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#00ff9d" 
                  strokeWidth="15" 
                  strokeDasharray="47.1 314" 
                  strokeDashoffset="-172.7"
                />
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#ffb800" 
                  strokeWidth="15" 
                  strokeDasharray="37.7 314" 
                  strokeDashoffset="-219.8"
                />
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#ff0055" 
                  strokeWidth="15" 
                  strokeDasharray="31.4 314" 
                  strokeDashoffset="-257.5"
                />
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#ff00ff" 
                  strokeWidth="15" 
                  strokeDasharray="15.7 314" 
                  strokeDashoffset="-288.9"
                />
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#ffffff" 
                  strokeWidth="15" 
                  strokeDasharray="9.4 314" 
                  strokeDashoffset="-304.6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-white font-mono">100M</span>
                <span className="text-sm text-gray-500">Total Supply</span>
              </div>
            </div>

            {/* Distribution List */}
            <div className="space-y-6">
              {tokenDistribution.map((item, index) => (
                <div 
                  key={index}
                  className="spotlight-card rounded-xl p-4 flex gap-4 items-center"
                  data-testid={`distribution-item-${index}`}
                >
                  <div className="w-16 text-right font-bold text-white">{item.percent}</div>
                  <div className="flex-1">
                    <div className="font-bold" style={{ color: item.color }}>{item.title}</div>
                    <div className="text-xs text-gray-400">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Burn Mechanism Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#ff0055]/10 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-[#ff0055]" /> Burn Mechanism
            </h2>
            <p className="text-gray-400">Aggressive deflationary model to increase scarcity.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {burnMechanisms.map((item, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-6 text-center"
                style={{ borderTop: "2px solid #ff0055" }}
                data-testid={`burn-mechanism-${index}`}
              >
                <div className="text-4xl font-bold text-white mb-2">{item.percent}</div>
                <h4 className="text-[#ff0055] font-bold mb-2">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staking & Governance Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Staking Rewards */}
            <div 
              className="spotlight-card rounded-xl p-8"
              style={{ border: "1px solid rgba(0, 255, 157, 0.2)" }}
              data-testid="card-staking"
            >
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-6 h-6 text-[#00ff9d]" />
                <h3 className="text-2xl font-bold text-white">Staking Rewards</h3>
              </div>
              <div className="space-y-4">
                {stakingRewards.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded flex-wrap gap-2">
                    <span className="text-white">{item.type}</span>
                    <span className="text-[#00ff9d] font-bold font-mono">{item.apy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance */}
            <div 
              className="spotlight-card rounded-xl p-8"
              style={{ border: "1px solid rgba(112, 0, 255, 0.2)" }}
              data-testid="card-governance"
            >
              <div className="flex items-center gap-3 mb-6">
                <Gavel className="w-6 h-6 text-[#7000ff]" />
                <h3 className="text-2xl font-bold text-white">Governance</h3>
              </div>
              <ul className="space-y-3 text-gray-400">
                {governanceFeatures.map((feature, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <Check className="w-4 h-4 text-[#7000ff] mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
