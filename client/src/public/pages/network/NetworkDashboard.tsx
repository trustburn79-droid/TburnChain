import { useState, useEffect, useRef, useMemo } from "react";
import { Flame, Activity, Box, TrendingUp, Shield, Clock, Zap, Server, Globe } from "lucide-react";

interface BlockData {
  height: number;
  txs: number;
  producer: string;
  age: number;
}

interface ValidatorData {
  name: string;
  region: string;
  stake: number;
  status: "active" | "syncing";
}

interface NetworkState {
  tps: number;
  blockHeight: number;
  dailyTxs: number;
  uptime: number;
  finality: number;
  rpcLatency: number;
  crossShard: number;
  memEfficiency: number;
  activePeers: number;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num.toString();
}

function formatTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace("T", " ").slice(0, 19);
}

function HealthRing({ value, max, color, label, status, statusType }: {
  value: string;
  max: number;
  color: string;
  label: string;
  status: string;
  statusType: "good" | "warning" | "critical";
}) {
  const circumference = 2 * Math.PI * 34;
  const percent = Math.min(parseFloat(value) / max, 1);
  const dashArray = `${percent * circumference} ${circumference}`;

  const statusColors = {
    good: "bg-[rgba(34,197,94,0.15)] text-[#22c55e]",
    warning: "bg-[rgba(240,185,11,0.15)] text-[#f0b90b]",
    critical: "bg-[rgba(239,68,68,0.15)] text-[#ef4444]"
  };

  return (
    <div className="relative p-5 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-2xl text-center overflow-hidden transition-all duration-300 hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-1">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-['Orbitron'] text-lg font-bold text-white">
          {value}
        </div>
      </div>
      <div className="text-sm text-[#a1a1aa]">{label}</div>
      <div className={`text-xs mt-2 px-2 py-1 rounded inline-block ${statusColors[statusType]}`}>
        {status}
      </div>
    </div>
  );
}

export default function NetworkDashboard() {
  const [state, setState] = useState<NetworkState>({
    tps: 155324,
    blockHeight: 44823591,
    dailyTxs: 29049000000,
    uptime: 99.99,
    finality: 2.1,
    rpcLatency: 45,
    crossShard: 94,
    memEfficiency: 88,
    activePeers: 2847
  });

  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [lastUpdate, setLastUpdate] = useState(formatTimestamp());
  const [blockRate, setBlockRate] = useState("+2/s");

  const producers = useMemo(() => ["val-kr-seoul-01", "val-us-east-03", "val-eu-frank-02", "val-ap-tokyo-05", "val-sg-west-04"], []);
  const regions = useMemo(() => ["Korea", "US East", "EU West", "Singapore", "Japan", "Australia"], []);

  useEffect(() => {
    const generateBlocks = () => {
      const newBlocks: BlockData[] = [];
      for (let i = 0; i < 8; i++) {
        newBlocks.push({
          height: state.blockHeight - i,
          txs: Math.floor(2000 + Math.random() * 5000),
          producer: producers[i % producers.length],
          age: i * 3 + Math.floor(Math.random() * 2)
        });
      }
      setBlocks(newBlocks);
    };

    const generateValidators = () => {
      const newValidators: ValidatorData[] = [];
      for (let i = 0; i < 8; i++) {
        newValidators.push({
          name: `validator-${String(i + 1).padStart(2, "0")}`,
          region: regions[i % regions.length],
          stake: Math.floor(500000 + Math.random() * 2000000),
          status: Math.random() > 0.1 ? "active" : "syncing"
        });
      }
      setValidators(newValidators);
    };

    generateBlocks();
    generateValidators();

    const interval = setInterval(() => {
      const tpsBase = 150000 + Math.sin(Date.now() / 5000) * 10000;
      setState(prev => ({
        tps: Math.floor(tpsBase + (Math.random() * 10000 - 5000)),
        blockHeight: prev.blockHeight + Math.floor(1 + Math.random() * 3),
        dailyTxs: prev.dailyTxs + Math.floor(prev.tps * (0.3 + Math.random() * 0.5)),
        uptime: 99.99,
        finality: 1.8 + Math.random() * 0.5,
        rpcLatency: 35 + Math.random() * 25,
        crossShard: 90 + Math.random() * 8,
        memEfficiency: 85 + Math.random() * 10,
        activePeers: 2800 + Math.floor(Math.random() * 100)
      }));
      generateBlocks();
      setCurrentTime(formatTime());
      setLastUpdate(formatTimestamp());
      setBlockRate(`+${1 + Math.floor(Math.random() * 3)}/s`);
    }, 3000);

    return () => clearInterval(interval);
  }, [state.blockHeight, producers, regions]);

  const activeValidatorCount = validators.filter(v => v.status === "active").length;

  return (
    <div className="min-h-screen font-['Rajdhani'] text-white overflow-x-hidden" style={{ background: "#030308" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        @keyframes float-particle {
          0%, 100% { opacity: 0; transform: translateY(100vh) scale(0); }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-100px) scale(1); }
        }
        
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -30px) scale(1.1); }
          50% { transform: translate(-30px, 50px) scale(0.95); }
          75% { transform: translate(30px, 30px) scale(1.05); }
        }
        
        @keyframes logo-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes status-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          opacity: 0;
          animation: float-particle 8s infinite ease-in-out;
        }
        
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: orb-float 20s infinite ease-in-out;
        }
        
        .status-dot-pulse {
          animation: status-pulse 2s infinite;
        }
        
        .live-blink {
          animation: blink 1s infinite;
        }
        
        .logo-glow {
          animation: logo-pulse 3s infinite ease-in-out;
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 20%, rgba(0, 255, 204, 0.08), transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 30%, rgba(168, 85, 247, 0.08), transparent 50%),
              radial-gradient(ellipse 70% 50% at 50% 80%, rgba(240, 185, 11, 0.06), transparent 50%)
            `
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)"
          }}
        />
        
        {/* Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
                background: ["#00ffcc", "#a855f7", "#f0b90b"][Math.floor(Math.random() * 3)]
              }}
            />
          ))}
        </div>
        
        {/* Orbs */}
        <div className="orb w-[400px] h-[400px] bg-[rgba(0,255,204,0.1)] top-[10%] left-[10%]" />
        <div className="orb w-[350px] h-[350px] bg-[rgba(168,85,247,0.1)] top-[50%] right-[10%]" style={{ animationDelay: "-7s" }} />
        <div className="orb w-[300px] h-[300px] bg-[rgba(240,185,11,0.08)] bottom-[10%] left-[30%]" style={{ animationDelay: "-14s" }} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1600px] mx-auto p-6">
        {/* Header */}
        <header className="flex justify-between items-center p-5 bg-[rgba(12,12,20,0.6)] backdrop-blur-[20px] border border-[rgba(0,255,204,0.1)] rounded-[20px] mb-6">
          <div className="flex items-center gap-5">
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#f0b90b] to-[#ff8c00] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(240,185,11,0.4),0_0_60px_rgba(240,185,11,0.2)]">
              <div className="absolute -inset-[3px] bg-gradient-to-br from-[#f0b90b] to-[#00ffcc] rounded-[18px] -z-10 opacity-50 logo-glow" />
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-['Orbitron'] text-xl font-bold bg-gradient-to-r from-[#f0b90b] to-[#00ffcc] bg-clip-text text-transparent">
                TBURN Chain
              </h1>
              <p className="text-sm text-[#6b7280]">Network Status Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-full">
              <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full shadow-[0_0_10px_#22c55e,0_0_20px_#22c55e] status-dot-pulse" />
              <span className="font-['Orbitron'] text-xs font-semibold text-[#22c55e]">MAINNET LIVE</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(0,255,204,0.1)] border border-[rgba(0,255,204,0.2)] rounded-full">
              <div className="w-2 h-2 bg-[#00ffcc] rounded-full live-blink" />
              <span className="font-['JetBrains_Mono'] text-xs text-[#00ffcc]">REAL-TIME</span>
            </div>
            <div className="font-['JetBrains_Mono'] text-sm text-[#a1a1aa] px-4 py-2.5 bg-[rgba(255,255,255,0.05)] rounded-xl">
              {currentTime}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          {/* TPS Card */}
          <div className="relative p-6 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] group">
            <div className="absolute w-[150px] h-[150px] rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity bg-[#00ffcc] -top-12 -right-12" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00ffcc] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4 relative">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(0,255,204,0.15)] transition-transform group-hover:scale-110 group-hover:-rotate-[5deg]">
                <Zap className="w-5 h-5 text-[#00ffcc]" />
              </div>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] px-2.5 py-1 bg-[rgba(255,255,255,0.08)] rounded-md text-[#6b7280]">24H</span>
            </div>
            <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-2 relative">TPS</div>
            <div className="font-['Orbitron'] text-4xl font-bold text-[#00ffcc] mb-3 relative" style={{ textShadow: "0 0 30px rgba(0,255,204,0.5)" }}>
              {formatNumber(state.tps)}
            </div>
            <div className="flex items-center gap-2 text-sm relative text-[#22c55e]">
              <TrendingUp className="w-4 h-4" />
              <span>+3.2%</span>
              <span className="text-[#6b7280]">vs yesterday</span>
            </div>
          </div>

          {/* Blocks Card */}
          <div className="relative p-6 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] group">
            <div className="absolute w-[150px] h-[150px] rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity bg-[#a855f7] -top-12 -right-12" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#a855f7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4 relative">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(168,85,247,0.15)] transition-transform group-hover:scale-110 group-hover:-rotate-[5deg]">
                <Box className="w-5 h-5 text-[#a855f7]" />
              </div>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] px-2.5 py-1 bg-[rgba(255,255,255,0.08)] rounded-md text-[#6b7280]">{blockRate}</span>
            </div>
            <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-2 relative">Block Height</div>
            <div className="font-['Orbitron'] text-4xl font-bold text-[#a855f7] mb-3 relative" style={{ textShadow: "0 0 30px rgba(168,85,247,0.5)" }}>
              {formatNumber(state.blockHeight)}
            </div>
            <div className="flex items-center gap-2 text-sm relative text-[#22c55e]">
              <TrendingUp className="w-4 h-4" />
              <span>100ms</span>
              <span className="text-[#6b7280]">block time</span>
            </div>
          </div>

          {/* Transactions Card */}
          <div className="relative p-6 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] group">
            <div className="absolute w-[150px] h-[150px] rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity bg-[#f0b90b] -top-12 -right-12" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#f0b90b] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4 relative">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(240,185,11,0.15)] transition-transform group-hover:scale-110 group-hover:-rotate-[5deg]">
                <Activity className="w-5 h-5 text-[#f0b90b]" />
              </div>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] px-2.5 py-1 bg-[rgba(255,255,255,0.08)] rounded-md text-[#6b7280]">TODAY</span>
            </div>
            <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-2 relative">Daily Transactions</div>
            <div className="font-['Orbitron'] text-4xl font-bold text-[#f0b90b] mb-3 relative" style={{ textShadow: "0 0 30px rgba(240,185,11,0.5)" }}>
              {formatNumber(state.dailyTxs)}
            </div>
            <div className="flex items-center gap-2 text-sm relative text-[#22c55e]">
              <TrendingUp className="w-4 h-4" />
              <span>+5.8%</span>
              <span className="text-[#6b7280]">vs yesterday</span>
            </div>
          </div>

          {/* Uptime Card */}
          <div className="relative p-6 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] group">
            <div className="absolute w-[150px] h-[150px] rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity bg-[#22c55e] -top-12 -right-12" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#22c55e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4 relative">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(34,197,94,0.15)] transition-transform group-hover:scale-110 group-hover:-rotate-[5deg]">
                <Shield className="w-5 h-5 text-[#22c55e]" />
              </div>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] px-2.5 py-1 bg-[rgba(255,255,255,0.08)] rounded-md text-[#6b7280]">30D</span>
            </div>
            <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-2 relative">Network Uptime</div>
            <div className="font-['Orbitron'] text-4xl font-bold text-[#22c55e] mb-3 relative" style={{ textShadow: "0 0 30px rgba(34,197,94,0.5)" }}>
              {state.uptime.toFixed(2)}%
            </div>
            <div className="flex items-center gap-2 text-sm relative text-[#22c55e]">
              <Clock className="w-4 h-4" />
              <span>No downtime</span>
              <span className="text-[#6b7280]">this month</span>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <HealthRing
            value={`${state.finality.toFixed(1)}s`}
            max={3}
            color="#00ffcc"
            label="Finality Time"
            status="Excellent"
            statusType="good"
          />
          <HealthRing
            value={`${Math.floor(state.rpcLatency)}ms`}
            max={100}
            color="#a855f7"
            label="RPC Latency"
            status="Optimal"
            statusType="good"
          />
          <HealthRing
            value={`${Math.floor(state.crossShard)}%`}
            max={100}
            color="#f0b90b"
            label="Cross-Shard"
            status="Efficient"
            statusType="good"
          />
          <HealthRing
            value={`${Math.floor(state.memEfficiency)}%`}
            max={100}
            color="#22c55e"
            label="Memory Efficiency"
            status="Healthy"
            statusType="good"
          />
          <HealthRing
            value={formatNumber(state.activePeers)}
            max={3000}
            color="#ec4899"
            label="Active Peers"
            status="Connected"
            statusType="good"
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-5">
          {/* Recent Blocks */}
          <div className="relative p-6 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[rgba(0,255,204,0.15)] rounded-xl flex items-center justify-center">
                  <Box className="w-4 h-4 text-[#00ffcc]" />
                </div>
                <h3 className="font-['Orbitron'] text-base font-semibold">Recent Blocks</h3>
              </div>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] px-2.5 py-1 bg-[rgba(255,255,255,0.08)] rounded-md text-[#6b7280]">Latest 8</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#6b7280] uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)]">
                  <th className="pb-3">Height</th>
                  <th className="pb-3">Transactions</th>
                  <th className="pb-3">Producer</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block, i) => (
                  <tr key={i} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="py-3 font-['JetBrains_Mono'] text-sm text-[#00ffcc]">#{formatNumber(block.height)}</td>
                    <td className="py-3 font-['JetBrains_Mono'] text-sm text-[#f0b90b]">{formatNumber(block.txs)}</td>
                    <td className="py-3 font-['JetBrains_Mono'] text-sm text-[#a1a1aa]">{block.producer}</td>
                    <td className="py-3 font-['JetBrains_Mono'] text-sm text-[#6b7280]">{block.age}s ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Active Validators */}
          <div className="relative p-6 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[rgba(0,255,204,0.15)] rounded-xl flex items-center justify-center">
                  <Server className="w-4 h-4 text-[#00ffcc]" />
                </div>
                <h3 className="font-['Orbitron'] text-base font-semibold">Active Validators</h3>
              </div>
              <span className="font-['JetBrains_Mono'] text-[0.65rem] px-2.5 py-1 bg-[rgba(255,255,255,0.08)] rounded-md text-[#6b7280]">{activeValidatorCount} Active</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {validators.map((validator, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${validator.status === "active" ? "bg-[#22c55e] shadow-[0_0_8px_#22c55e]" : "bg-[#f0b90b] shadow-[0_0_8px_#f0b90b]"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-['JetBrains_Mono'] text-sm text-white truncate">{validator.name}</div>
                    <div className="text-xs text-[#6b7280]">{validator.region}</div>
                  </div>
                  <div className="font-['JetBrains_Mono'] text-xs text-[#a855f7]">{formatNumber(validator.stake)} TBURN</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 p-5 bg-[rgba(12,12,20,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280]">Chain ID:</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#00ffcc]">tburn-mainnet-1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280]">Node Version:</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#a855f7]">v7.2.1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280]">Last Update:</span>
              <span className="font-['JetBrains_Mono'] text-xs text-white">{lastUpdate}</span>
            </div>
          </div>
          <div className="text-xs text-[#6b7280]">
            © 2025 TBurn Chain Foundation. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
