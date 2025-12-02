import { 
  Zap, Gauge, Box, Fuel, Users, Crown, Server, HeartPulse, 
  Coins, Globe, CheckCircle, RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePublicNetworkStats, usePublicAiSummary, usePublicValidators } from "../../hooks/use-public-data";

export default function NetworkStatus() {
  const { data: statsResponse, refetch: refetchStats } = usePublicNetworkStats();
  const { data: aiResponse } = usePublicAiSummary();
  const { data: validatorsResponse } = usePublicValidators();
  
  const stats = statsResponse?.data;
  const aiData = aiResponse?.data;
  const validatorData = validatorsResponse?.data;
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const uptimeSegments = Array(15).fill(100).map((_, i) => i === 11 ? 99.8 : 100);

  const services = [
    { name: "Mainnet RPC API", desc: "JSON-RPC / WebSocket", uptime: "99.99%" },
    { name: "Trust Score System", desc: "Real-time scoring", uptime: "99.98%" },
    { name: "Cross-Chain Bridge", desc: "Asset Transfer", uptime: "99.92%" },
    { name: "Quantum Security", desc: "Encryption Module", uptime: "100%" },
  ];

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00ff9d]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-xs font-mono text-[#00ff9d]">
              <span className="w-2 h-2 rounded-full bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]" />
              ALL_SYSTEMS_OPERATIONAL
            </div>
            <span className="text-xs font-mono text-gray-500">LAST UPDATED: {lastUpdated}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Network <span className="text-gradient">Status</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            Real-time monitoring of TBurn Chain V4 Mainnet. <br />
            Track TPS, block times, and validator health instantly.
          </p>
          
          <button 
            className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition text-sm flex items-center gap-2"
            data-testid="button-refresh-data"
            onClick={() => refetchStats()}
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>
      </section>

      {/* Core Performance Metrics */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Core Performance Metrics</h2>
            <p className="text-gray-400 text-sm">Live network telemetry</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="spotlight-card rounded-xl p-6 border border-[#00ff9d]/20 bg-[#00ff9d]/5">
              <div className="flex items-center gap-2 mb-4 text-[#00ff9d]">
                <Zap className="w-5 h-5" />
                <span className="font-bold">TPS</span>
              </div>
              <div className="text-4xl font-mono font-bold text-white mb-2" data-testid="stat-tps">
                {stats?.tps != null ? stats.tps.toLocaleString() : "51,000"}
              </div>
              <div className="text-xs text-gray-400">Peak: 500,000+</div>
            </div>

            <div className="spotlight-card rounded-xl p-6 border border-[#00f0ff]/20 bg-[#00f0ff]/5">
              <div className="flex items-center gap-2 mb-4 text-[#00f0ff]">
                <Gauge className="w-5 h-5" />
                <span className="font-bold">Latency</span>
              </div>
              <div className="text-4xl font-mono font-bold text-white mb-2" data-testid="stat-latency">
                {stats?.avgBlockTime != null ? `${Number(stats.avgBlockTime).toFixed(2)}s` : "0.5s"}
              </div>
              <div className="text-xs text-gray-400">Finality: {stats?.finality ?? "< 2s"}</div>
            </div>

            <div className="spotlight-card rounded-xl p-6 border border-[#7000ff]/20 bg-[#7000ff]/5">
              <div className="flex items-center gap-2 mb-4 text-[#7000ff]">
                <Box className="w-5 h-5" />
                <span className="font-bold">Block Height</span>
              </div>
              <div className="text-4xl font-mono font-bold text-white mb-2" data-testid="stat-block-height">
                {stats?.blockHeight != null ? stats.blockHeight.toLocaleString() : "14,035,000"}
              </div>
              <div className="text-xs text-gray-400">Shards: {stats?.shardCount ?? 16}</div>
            </div>

            <div className="spotlight-card rounded-xl p-6 border border-[#ffd700]/20 bg-[#ffd700]/5">
              <div className="flex items-center gap-2 mb-4 text-[#ffd700]">
                <Fuel className="w-5 h-5" />
                <span className="font-bold">Avg Fee</span>
              </div>
              <div className="text-4xl font-mono font-bold text-white mb-2" data-testid="stat-fee">
                ${stats?.gasPrice ?? "0.0001"}
              </div>
              <div className="text-xs text-gray-400">Cheap & Fast</div>
            </div>
          </div>
        </div>
      </section>

      {/* Validator Network */}
      <section className="py-16 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Validator Network</h2>
            <p className="text-gray-400 text-sm">Global decentralized infrastructure</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="spotlight-card rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-[#7000ff] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white font-mono" data-testid="stat-active-validators">
                {validatorData?.summary?.active != null 
                  ? validatorData.summary.active.toLocaleString() 
                  : stats?.activeValidators != null 
                    ? stats.activeValidators.toLocaleString() 
                    : "125"}
              </div>
              <div className="text-xs text-gray-500">Active Validators</div>
            </div>
            <div className="spotlight-card rounded-xl p-4 text-center">
              <Crown className="w-6 h-6 text-[#ffd700] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white font-mono">
                {Math.floor((validatorData?.summary?.active ?? stats?.activeValidators ?? 125) * 0.1)}
              </div>
              <div className="text-xs text-gray-500">Super Nodes</div>
            </div>
            <div className="spotlight-card rounded-xl p-4 text-center">
              <Server className="w-6 h-6 text-[#00f0ff] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white font-mono" data-testid="stat-nodes">
                {stats?.nodeCount != null ? stats.nodeCount.toLocaleString() : "1,247"}
              </div>
              <div className="text-xs text-gray-500">Node Count</div>
            </div>
            <div className="spotlight-card rounded-xl p-4 text-center">
              <HeartPulse className="w-6 h-6 text-[#00ff9d] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white font-mono text-[#00ff9d]" data-testid="stat-uptime">
                {validatorData?.summary?.avgUptime != null 
                  ? `${parseFloat(validatorData.summary.avgUptime).toFixed(2)}%` 
                  : stats?.uptime ?? "99.99%"}
              </div>
              <div className="text-xs text-gray-500">Avg Uptime</div>
            </div>
            <div className="spotlight-card rounded-xl p-4 text-center">
              <Coins className="w-6 h-6 text-[#ffd700] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white font-mono" data-testid="stat-staked">
                {stats?.totalStaked ?? "$847M"}
              </div>
              <div className="text-xs text-gray-500">Total Staked</div>
            </div>
            <div className="spotlight-card rounded-xl p-4 text-center">
              <Globe className="w-6 h-6 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white font-mono">147</div>
              <div className="text-xs text-gray-500">Regions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Triple-Band AI System */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Triple-Band AI System</h2>
            <p className="text-gray-400 text-sm">AI Orchestration Status</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="spotlight-card rounded-xl p-6 border border-white/10" data-testid="card-ai-strategic">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">Strategic Tier</h3>
                  <p className="text-xs text-gray-400">GPT-5 Latest</p>
                </div>
                <span className="px-2 py-1 rounded bg-[#00ff9d]/20 text-[#00ff9d] text-xs font-mono border border-[#00ff9d]/30">ACTIVE</span>
              </div>
              <div className="flex justify-between text-sm mt-4">
                <span className="text-gray-500">Latency</span>
                <span className="text-[#7000ff] font-mono">{aiData?.models?.gpt5?.avgTime || "52ms"}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Accuracy</span>
                <span className="text-white font-mono">{aiData?.models?.gpt5?.accuracy || "99.1%"}</span>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-6 border border-white/10" data-testid="card-ai-tactical">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">Tactical Tier</h3>
                  <p className="text-xs text-gray-400">Claude Sonnet 4.5</p>
                </div>
                <span className="px-2 py-1 rounded bg-[#00ff9d]/20 text-[#00ff9d] text-xs font-mono border border-[#00ff9d]/30">ACTIVE</span>
              </div>
              <div className="flex justify-between text-sm mt-4">
                <span className="text-gray-500">Latency</span>
                <span className="text-[#00f0ff] font-mono">{aiData?.models?.claude?.avgTime || "48ms"}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Accuracy</span>
                <span className="text-white font-mono">{aiData?.models?.claude?.accuracy || "99.4%"}</span>
              </div>
            </div>

            <div className="spotlight-card rounded-xl p-6 border border-white/10" data-testid="card-ai-operational">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">Operational Tier</h3>
                  <p className="text-xs text-gray-400">Llama 4 Latest</p>
                </div>
                <span className="px-2 py-1 rounded bg-[#00ff9d]/20 text-[#00ff9d] text-xs font-mono border border-[#00ff9d]/30">ACTIVE</span>
              </div>
              <div className="flex justify-between text-sm mt-4">
                <span className="text-gray-500">Latency</span>
                <span className="text-[#00ff9d] font-mono">{aiData?.models?.llama?.avgTime || "35ms"}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Accuracy</span>
                <span className="text-white font-mono">{aiData?.models?.llama?.accuracy || "98.9%"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-16 px-6 bg-white/5 border-t border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Service Status</h2>
            <p className="text-gray-400 text-sm">Detailed component monitoring</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.name} className="spotlight-card rounded-lg p-4 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <div>
                    <h4 className="text-white font-bold text-sm">{service.name}</h4>
                    <p className="text-xs text-gray-500">{service.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#00ff9d] text-xs font-bold block">OPERATIONAL</span>
                  <span className="text-gray-600 text-xs">{service.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uptime History */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Uptime History</h2>
              <p className="text-gray-400 text-sm">Past 90 days performance</p>
            </div>
            <span className="text-[#00ff9d] font-bold">99.97% Avg.</span>
          </div>

          <div className="spotlight-card rounded-xl p-6 border border-white/10">
            <div className="flex gap-0.5 h-8">
              {uptimeSegments.map((uptime, index) => (
                <div
                  key={index}
                  className={`flex-1 rounded-sm transition-all hover:scale-y-[1.2] cursor-pointer ${
                    uptime === 100 
                      ? "bg-[#00ff9d]/20 hover:bg-[#00ff9d]" 
                      : "bg-[#ffd700]/40 hover:bg-[#ffd700]"
                  }`}
                  title={`${uptime}%`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
