import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useMemo } from "react";
import { 
  AreaChart, Area, BarChart, Bar, YAxis, ResponsiveContainer
} from "recharts";
import { 
  ArrowLeft,
  Cpu,
  Heartbeat,
  GitCommit,
  WarningOctagon,
  ArrowsLeftRight,
  Copy,
  ArrowSquareOut,
  UserFocus,
  SealCheck
} from "@phosphor-icons/react";

interface Validator {
  id: string;
  name: string;
  address: string;
  stake: string;
  status: string;
  uptime: number;
  blocksProposed: number;
  commission: number;
  delegators: number;
  lastActive: string;
  location?: string;
  version?: string;
}

interface NetworkStats {
  currentEpoch: number;
}

const generateChartData = (length: number, min: number, max: number) => 
  Array.from({ length }, (_, i) => ({
    x: i,
    value: Math.random() * (max - min) + min
  }));

const generateSpikeData = (length: number) =>
  Array.from({ length }, (_, i) => ({
    x: i,
    value: Math.random() < 0.1 ? Math.floor(Math.random() * 3) + 1 : 0
  }));

export default function ValidatorNodeDetail() {
  const params = useParams<{ id: string }>();
  const validatorId = params.id;

  const { data: validatorsData, isLoading } = useQuery<{ validators: Validator[] }>({
    queryKey: ["/api/validators"],
    staleTime: 30000,
  });

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 30000,
  });

  const validator = useMemo(() => {
    if (!validatorsData?.validators) return null;
    return validatorsData.validators.find(v => v.id === validatorId) || validatorsData.validators[0];
  }, [validatorsData, validatorId]);

  const latencyData = useMemo(() => generateChartData(50, 1.0, 1.4), []);
  const rootData = useMemo(() => generateSpikeData(40), []);
  const skippedData = useMemo(() => generateChartData(20, 0.2, 0.4), []);
  const voteDistData = useMemo(() => generateSpikeData(40), []);

  const recentProduction = useMemo(() => [
    { epoch: networkStats?.currentEpoch || 903, time: "14:44:33 UTC", blocks: 108, total: 108, status: "PERFECT" },
    { epoch: networkStats?.currentEpoch || 903, time: "14:40:47 UTC", blocks: 108, total: 108, status: "PERFECT" },
    { epoch: networkStats?.currentEpoch || 903, time: "14:35:12 UTC", blocks: 106, total: 108, status: "SKIPPED 2" },
  ], [networkStats]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading validator details...</div>
      </div>
    );
  }

  if (!validator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Validator not found</div>
      </div>
    );
  }

  const stake = parseFloat(validator.stake);
  const identityKey = validator.address || "DDnAqxJVFo2GVTujibHt5cjevHMSE9bo8HJaydHoshdp";
  const voteAccount = `9GJmEHGom9eWo4np4L5vC6b6ri1Df2xN8KFoWixvD1Bs`;
  const initials = validator.name.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen relative">
      <style>{`
        .tburn-glass {
          background: rgba(18, 20, 30, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.4);
        }
        .tburn-card-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 100%);
        }
        .status-beacon {
          position: relative;
          width: 10px; height: 10px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
        }
        .status-beacon::after {
          content: '';
          position: absolute;
          top: -4px; left: -4px; right: -4px; bottom: -4px;
          border: 1px solid #10b981;
          border-radius: 50%;
          animation: pulse-ring 2s infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .data-label { color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .data-value { color: #f1f5f9; font-size: 0.95rem; font-weight: 500; word-break: break-all; }
        .bg-mesh {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #050508;
          background-image: 
            linear-gradient(180deg, rgba(5, 5, 8, 0) 0%, #050508 100%),
            radial-gradient(circle at 50% 0%, rgba(0, 191, 255, 0.08) 0%, transparent 50%);
          z-index: 0;
        }
      `}</style>

      <div className="bg-mesh" />

      <div className="container mx-auto px-4 py-6 relative z-10">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link 
            href="/validator" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
            data-testid="link-back-validator-matrix"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 border border-white/5">
              <ArrowLeft size={16} weight="bold" />
            </div>
            <span className="text-sm font-medium">Back to Validator Matrix</span>
          </Link>
          <div className="flex gap-3">
            <span className="px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-mono flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              {validator.status === "active" ? "OPERATIONAL" : "DEGRADED"}
            </span>
            <span className="px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono" data-testid="text-current-epoch">
              EPOCH {networkStats?.currentEpoch || 903}
            </span>
          </div>
        </nav>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 space-y-6">
            <div className="tburn-glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl text-3xl font-bold text-white">
                    {initials}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#050508] p-1 rounded-full">
                    <div className="status-beacon" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="text-validator-name">
                      {validator.name}
                    </h1>
                    <SealCheck className="text-[#00bfff] text-xl" weight="fill" />
                  </div>
                  <p className="text-slate-400 text-sm max-w-2xl mb-4 leading-relaxed">
                    Enterprise-grade validator node with high uptime guarantee. Staking rewards + MEV optimization. 
                    Experienced operator since network genesis.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Uptime</span>
                      <span className="text-lg font-bold text-[#ff8c00]" data-testid="text-uptime">
                        {validator.uptime?.toFixed(1) || "99.9"}%
                      </span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Commission</span>
                      <span className="text-lg font-bold text-white" data-testid="text-commission">
                        {validator.commission}%
                      </span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Active Stake</span>
                      <span className="text-lg font-bold text-white" data-testid="text-stake">
                        {stake.toLocaleString()} <span className="text-xs text-[#ff8c00]">TBURN</span>
                      </span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Version</span>
                      <span className="text-lg font-bold text-[#00bfff] font-mono" data-testid="text-version">
                        v{validator.version || "3.0.11"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="tburn-glass rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Heartbeat className="text-[#ff4545]" size={18} weight="bold" /> Vote Latency
                  </h3>
                  <span className="text-xs font-mono text-slate-500">Last 6h</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={latencyData}>
                      <defs>
                        <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff4545" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff4545" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={[0.8, 1.6]} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ff4545" 
                        strokeWidth={2}
                        fill="url(#latencyGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="tburn-glass rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <GitCommit className="text-[#ff8c00]" size={18} weight="bold" /> Root Distance
                  </h3>
                  <span className="text-xs font-mono text-slate-500">Block Diff</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rootData}>
                      <defs>
                        <linearGradient id="rootGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff8c00" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff8c00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={[0, 4]} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ff8c00" 
                        strokeWidth={2}
                        fill="url(#rootGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="tburn-glass rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <WarningOctagon className="text-yellow-400" size={18} weight="bold" /> Skipped Slots %
                  </h3>
                  <span className="text-xs font-mono text-slate-500">Moving Avg</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skippedData}>
                      <YAxis hide domain={[0, 0.6]} />
                      <Bar dataKey="value" fill="#eab308" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="tburn-glass rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <ArrowsLeftRight className="text-[#00bfff]" size={18} weight="bold" /> Vote Distance
                  </h3>
                  <span className="text-xs font-mono text-slate-500">Vote Diff</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={voteDistData}>
                      <defs>
                        <linearGradient id="voteGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00bfff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00bfff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={[0, 4]} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00bfff" 
                        strokeWidth={2}
                        fill="url(#voteGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="tburn-glass rounded-2xl overflow-hidden">
              <div className="tburn-card-header p-4 flex items-center justify-between">
                <h3 className="font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Node Specifications</h3>
                <Cpu className="text-slate-500 text-xl" weight="duotone" />
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <div className="data-label">Identity Key</div>
                  <div className="flex items-center justify-between group">
                    <span className="data-value font-mono text-xs text-[#00bfff] truncate max-w-[200px]" data-testid="text-identity-key">
                      {identityKey}
                    </span>
                    <button 
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#00bfff] transition"
                      onClick={() => copyToClipboard(identityKey)}
                      data-testid="button-copy-identity"
                    >
                      <Copy size={16} weight="bold" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="data-label">Vote Account</div>
                  <div className="flex items-center justify-between group">
                    <span className="data-value font-mono text-xs truncate max-w-[200px]" data-testid="text-vote-account">
                      {voteAccount}
                    </span>
                    <button 
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#00bfff] transition"
                      onClick={() => copyToClipboard(voteAccount)}
                      data-testid="button-copy-vote"
                    >
                      <Copy size={16} weight="bold" />
                    </button>
                  </div>
                </div>
                
                <div className="h-px bg-white/5" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="data-label">Data Center</div>
                    <div className="data-value text-sm">{validator.location || "Chicago, US"}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">ASN 20326</div>
                  </div>
                  <div>
                    <div className="data-label">IP Address</div>
                    <div className="data-value text-sm font-mono">64.130.43.210</div>
                  </div>
                  <div>
                    <div className="data-label">Software</div>
                    <div className="data-value text-sm">TBURN Core</div>
                  </div>
                  <div>
                    <div className="data-label">Creation</div>
                    <div className="data-value text-sm">2024-12-25</div>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex flex-col gap-3">
                  <a 
                    href="#" 
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group border border-transparent hover:border-white/10"
                    data-testid="link-validator-website"
                  >
                    <span className="text-sm text-slate-300">Validator Website</span>
                    <ArrowSquareOut className="text-slate-500 group-hover:text-white" size={16} weight="bold" />
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group border border-transparent hover:border-white/10"
                    data-testid="link-keybase-profile"
                  >
                    <span className="text-sm text-slate-300">Keybase Profile</span>
                    <UserFocus className="text-slate-500 group-hover:text-white" size={16} weight="bold" />
                  </a>
                </div>
              </div>
            </div>

            <div className="tburn-glass rounded-2xl overflow-hidden">
              <div className="tburn-card-header p-4 flex items-center justify-between">
                <h3 className="font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Recent Production</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-400">Live</span>
                </div>
              </div>
              
              <div className="overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/20 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-3 pl-5">Epoch</th>
                      <th className="p-3 text-center">Blocks</th>
                      <th className="p-3 text-right pr-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentProduction.map((item, index) => (
                      <tr key={index} className="hover:bg-white/5 transition" data-testid={`row-production-${index}`}>
                        <td className="p-3 pl-5">
                          <div className="font-mono text-white">{item.epoch}</div>
                          <div className="text-[10px] text-slate-500">{item.time}</div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-mono ${item.blocks === item.total ? "text-slate-300" : "text-yellow-500"}`}>
                            {item.blocks}
                          </span>
                          <span className="text-slate-600">/ {item.total}</span>
                        </td>
                        <td className="p-3 text-right pr-5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            item.status === "PERFECT" 
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
