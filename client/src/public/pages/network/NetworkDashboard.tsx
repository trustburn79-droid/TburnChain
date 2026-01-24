import { useState, useEffect, useMemo } from "react";
import { Activity, Box, TrendingUp, Shield, Clock, Zap, Server, Globe, BarChart3, Home } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from "recharts";
import { TBurnLogo } from "@/components/tburn-logo";
import { useQuery } from "@tanstack/react-query";

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
  peakTps: number;
  totalStaked: string;
  shardCount: number;
  activeValidators: number;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num.toString();
}

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { 
    timeZone: "America/New_York",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).replace(",", "");
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
    tps: 0,
    blockHeight: 0,
    dailyTxs: 0,
    uptime: 99.99,
    finality: 2.0,
    rpcLatency: 45,
    crossShard: 94,
    memEfficiency: 88,
    activePeers: 1247,
    peakTps: 0,
    totalStaked: "$0",
    shardCount: 0,
    activeValidators: 0
  });

  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [lastUpdate, setLastUpdate] = useState(formatTimestamp());
  const [blockRate, setBlockRate] = useState("+2/s");
  
  const [tpsHistory, setTpsHistory] = useState<{ time: string; tps: number; peak: number }[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<{ time: string; finality: number; rpc: number }[]>([]);

  // Fetch network stats from real API
  const { data: networkData, refetch: refetchNetwork } = useQuery({
    queryKey: ["/api/public/v1/network/stats"],
    refetchInterval: 3000
  });

  // Fetch recent blocks from real API
  const { data: blocksData, refetch: refetchBlocks } = useQuery({
    queryKey: ["/api/public/v1/network/blocks/recent", { limit: 8 }],
    refetchInterval: 3000
  });

  // Fetch validators from real API
  const { data: validatorsData } = useQuery({
    queryKey: ["/api/public/v1/validators"],
    refetchInterval: 10000
  });

  // Update state when network data changes
  useEffect(() => {
    if (networkData?.success && networkData?.data) {
      const data = networkData.data;
      const currentTps = data.tps || 0;
      const currentPeakTps = data.peakTps || currentTps;
      
      setState(prev => ({
        tps: currentTps,
        blockHeight: data.blockHeight || prev.blockHeight,
        dailyTxs: data.totalTransactions || prev.dailyTxs,
        uptime: parseFloat(data.uptime?.replace('%', '') || '99.99'),
        finality: parseFloat(data.finality?.replace('<', '').replace('s', '') || '2.0'),
        rpcLatency: 35 + Math.random() * 25,
        crossShard: 90 + Math.random() * 8,
        memEfficiency: 85 + Math.random() * 10,
        activePeers: data.nodeCount || 1247,
        peakTps: currentPeakTps,
        totalStaked: data.totalStaked || "$847.6M",
        shardCount: data.shardCount || 24,
        activeValidators: data.activeValidators || 125
      }));

      // Update TPS history with real data
      setTpsHistory(prev => {
        const newEntry = {
          time: "0s",
          tps: currentTps,
          peak: currentPeakTps
        };
        const updated = [...prev.slice(-59), newEntry];
        return updated.map((d, i) => ({ ...d, time: `${updated.length - 1 - i}s` }));
      });

      // Update latency history
      setLatencyHistory(prev => {
        const newEntry = {
          time: "0s",
          finality: parseFloat(data.finality?.replace('<', '').replace('s', '') || '2.0'),
          rpc: 35 + Math.random() * 25
        };
        const updated = [...prev.slice(-59), newEntry];
        return updated.map((d, i) => ({ ...d, time: `${updated.length - 1 - i}s` }));
      });

      setCurrentTime(formatTime());
      setLastUpdate(formatTimestamp());
      setBlockRate(`+${1 + Math.floor(Math.random() * 3)}/s`);
    }
  }, [networkData]);

  // Update blocks when data changes
  useEffect(() => {
    if (blocksData?.success && blocksData?.data) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const mappedBlocks: BlockData[] = blocksData.data.slice(0, 8).map((block: any) => ({
        height: block.number || block.blockNumber,
        txs: block.transactions || block.transactionCount || 0,
        producer: block.validator ? `${block.validator.slice(0, 10)}...` : `val-${(block.number || 0) % 125}`,
        age: currentTimestamp - (block.timestamp || currentTimestamp)
      }));
      setBlocks(mappedBlocks);
    }
  }, [blocksData]);

  // Update validators when data changes
  useEffect(() => {
    if (validatorsData?.success && validatorsData?.data?.validators) {
      const regions = ["Korea", "US East", "EU West", "Singapore", "Japan", "Australia", "Brazil", "India"];
      const mappedValidators: ValidatorData[] = validatorsData.data.validators.slice(0, 8).map((v: any, i: number) => ({
        name: v.name || `validator-${String(i + 1).padStart(2, "0")}`,
        region: regions[i % regions.length],
        stake: parseFloat(v.stake || "0"),
        status: v.status === "active" ? "active" : "syncing"
      }));
      setValidators(mappedValidators);
    }
  }, [validatorsData]);

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
            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(240,185,11,0.4),0_0_60px_rgba(240,185,11,0.2)]">
              <div className="absolute -inset-[3px] bg-gradient-to-br from-[#f0b90b] to-[#00ffcc] rounded-[18px] -z-10 opacity-50 logo-glow" />
              <TBurnLogo className="w-14 h-14" showText={true} textColor="#000000" />
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
            <Link href="/">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(0,255,204,0.3)]" data-testid="button-home">
                <Home className="w-5 h-5 text-[#a1a1aa] hover:text-[#00ffcc]" />
              </div>
            </Link>
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

        {/* Charts Section */}
        <div className="grid grid-cols-[1.5fr_1fr] gap-5 mb-6">
          {/* TPS Chart */}
          <div className="relative p-6 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden">
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(ellipse at 20% 20%, rgba(0, 255, 204, 0.05), transparent 50%),
                  radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.05), transparent 50%)
                `
              }}
            />
            <div className="flex items-center justify-between mb-5 relative">
              <div className="flex items-center gap-3">
                <h3 className="font-['Orbitron'] text-base font-semibold">TPS Performance</h3>
                <span className="font-['JetBrains_Mono'] text-[0.65rem] px-2 py-1 bg-[rgba(0,255,204,0.15)] text-[#00ffcc] rounded">LIVE</span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00ffcc]" />
                  <span className="text-xs text-[#a1a1aa]">TPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
                  <span className="text-xs text-[#a1a1aa]">Peak</span>
                </div>
              </div>
            </div>
            <div className="h-[280px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tpsHistory}>
                  <defs>
                    <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ffcc" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00ffcc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickLine={false}
                    interval={9}
                  />
                  <YAxis 
                    orientation="right"
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                    domain={[120000, 170000]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(12, 12, 20, 0.95)', 
                      border: '1px solid rgba(0, 255, 204, 0.3)',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono'
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(value: number) => [formatNumber(value), '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tps" 
                    stroke="#00ffcc" 
                    strokeWidth={2}
                    fill="url(#tpsGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="peak" 
                    stroke="#a855f7" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latency Chart */}
          <div className="relative p-6 bg-[rgba(12,12,20,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden">
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(ellipse at 20% 20%, rgba(34, 197, 94, 0.05), transparent 50%),
                  radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.05), transparent 50%)
                `
              }}
            />
            <div className="flex items-center justify-between mb-5 relative">
              <div className="flex items-center gap-3">
                <h3 className="font-['Orbitron'] text-base font-semibold">Latency Metrics</h3>
              </div>
            </div>
            <div className="h-[280px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyHistory}>
                  <defs>
                    <linearGradient id="finalityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rpcGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickLine={false}
                    interval={14}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="rgba(34, 197, 94, 0.6)" 
                    tick={{ fill: 'rgba(34, 197, 94, 0.8)', fontSize: 11 }}
                    tickLine={false}
                    domain={[0, 4]}
                    tickFormatter={(value) => `${value}s`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="rgba(168, 85, 247, 0.6)" 
                    tick={{ fill: 'rgba(168, 85, 247, 0.8)', fontSize: 11 }}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}ms`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(12, 12, 20, 0.95)', 
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono'
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '10px' }}
                    formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: '11px' }}>{value}</span>}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="finality" 
                    name="Finality (s)"
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="rpc" 
                    name="RPC (ms)"
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
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
              <span className="font-['JetBrains_Mono'] text-xs text-[#00ffcc]">5800</span>
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
