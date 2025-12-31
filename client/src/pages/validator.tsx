import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { 
  Fire, 
  GlobeHemisphereWest, 
  ShieldCheck, 
  ChartPieSlice, 
  ListDashes, 
  MagnifyingGlass,
  Sliders,
  TrendUp
} from "@phosphor-icons/react";

interface ValidatorData {
  id: string;
  name: string;
  address: string;
  stake: number;
  status: string;
  uptime: number;
  blocksProduced: number;
  lastBlockTime: string;
  version?: string;
  location?: string;
  isp?: string;
  countryCode?: string;
}

interface NetworkStats {
  currentTps: number;
  currentEpoch: number;
  activeValidators: number;
  totalStake: number;
}

interface ValidatorsResponse {
  validators: ValidatorData[];
}

const stakeChartData = [
  { name: 'Top 1', value: 8, fill: '#F59E0B' },
  { name: 'Top 10', value: 35, fill: '#3B82F6' },
  { name: 'Top 19', value: 51, fill: '#10B981' },
  { name: 'Others', value: 100, fill: '#64748B' },
];

const mapPoints = [
  { top: '30%', left: '25%', delay: '0s' },
  { top: '32%', left: '28%', delay: '0.5s' },
  { top: '25%', left: '48%', delay: '1s' },
  { top: '28%', left: '50%', delay: '1.2s' },
  { top: '35%', left: '80%', delay: '0.2s' },
  { top: '38%', left: '75%', delay: '0.8s' },
  { top: '45%', left: '82%', delay: '1.5s' },
  { top: '60%', left: '30%', delay: '0.3s' },
];

const staticValidators = [
  {
    id: 'val-1',
    name: 'TBURN_Genesis_01',
    address: 'tb1ap29xq...',
    shortAddr: 'Ap2...9xQ',
    stake: 36468183,
    stakeShare: 8.65,
    trustScore: 98.5,
    version: 'v1.14.17',
    location: 'Chicago, US',
    countryCode: 'us',
    isp: 'AS20326 (TeraSwitch)',
    delinquent: 0,
    status: 'active',
    initials: 'TB',
    gradient: 'from-purple-600 to-blue-600',
  },
  {
    id: 'val-2',
    name: 'AllNodes_Secure',
    address: 'tb1hk43ml...',
    shortAddr: 'Hk4...3mL',
    stake: 25043993,
    stakeShare: 5.94,
    trustScore: 100,
    version: 'v1.14.17',
    location: 'Frankfurt, DE',
    countryCode: 'de',
    isp: 'AS20326 (Cherry Servers)',
    delinquent: 0,
    status: 'active',
    initials: 'AN',
    gradient: '',
  },
  {
    id: 'val-3',
    name: 'Latitude_Node_V',
    address: 'tb1bp28xk...',
    shortAddr: 'Bp2...8xK',
    stake: 15663731,
    stakeShare: 3.71,
    trustScore: 96.2,
    version: 'v1.13.5',
    location: 'Tokyo, JP',
    countryCode: 'jp',
    isp: 'AS20326 (Latitude.sh)',
    delinquent: 0,
    status: 'warning',
    initials: 'L',
    gradient: '',
  },
];

export default function ValidatorCommandCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: validatorsResponse } = useQuery<ValidatorsResponse>({
    queryKey: ["/api/validators"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const validators = validatorsResponse?.validators || [];
  const displayValidators = Array.isArray(validators) ? validators : [];
  const combinedValidators = [...staticValidators, ...displayValidators.map((v) => ({
    id: v.id,
    name: v.name,
    address: v.address,
    shortAddr: v.address.slice(0, 6) + '...' + v.address.slice(-4),
    stake: v.stake,
    stakeShare: ((v.stake / (networkStats?.totalStake || 1)) * 100),
    trustScore: v.uptime,
    version: v.version || 'v1.14.17',
    location: v.location || 'Unknown',
    countryCode: v.countryCode || 'un',
    isp: v.isp || 'Unknown ISP',
    delinquent: 100 - v.uptime,
    status: v.status === 'active' ? 'active' : 'warning',
    initials: v.name.slice(0, 2).toUpperCase(),
    gradient: '',
  }))];

  const filteredValidators = combinedValidators.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredValidators.length / itemsPerPage);
  const paginatedValidators = filteredValidators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="min-h-screen text-slate-300 relative" style={{
      fontFamily: "'Outfit', 'Noto Sans KR', sans-serif",
      backgroundColor: '#050509',
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(5, 5, 9, 1))',
    }}>
      <style>{`
        .glass-panel {
          background: rgba(20, 20, 35, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }
        .glass-panel:hover {
          border-color: rgba(245, 158, 11, 0.3);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);
        }
        .bg-mesh {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 400px;
          background: radial-gradient(circle at 50% -20%, #1e1b4b 0%, transparent 60%);
          z-index: 0;
          pointer-events: none;
        }
        .status-dot {
          height: 8px;
          width: 8px;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px currentColor;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .map-point {
          position: absolute;
          width: 6px; height: 6px;
          background: #F59E0B;
          border-radius: 50%;
          box-shadow: 0 0 10px #F59E0B;
          animation: blink 3s infinite;
        }
        @keyframes blink { 
          0%, 100% { opacity: 0.4; } 
          50% { opacity: 1; transform: scale(1.2); } 
        }
      `}</style>

      <div className="bg-mesh" />

      <div className="container mx-auto px-4 py-6 relative z-10">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-10 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Fire className="text-amber-500 animate-pulse" size={32} weight="fill" />
              <h1 className="text-4xl font-bold text-white tracking-wide">
                TBURN <span className="font-light text-slate-400">Scan</span>
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-mono tracking-wider uppercase pl-1">
              Decentralized Trust Network / Validator Intelligence
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">Network TPS</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono" data-testid="network-tps">
                {formatNumber(networkStats?.currentTps || 102491)}
              </span>
            </div>
            <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">Epoch</span>
              <span className="text-2xl font-bold text-amber-400 font-mono" data-testid="current-epoch">
                {networkStats?.currentEpoch || 402}
              </span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 relative overflow-hidden min-h-[300px]">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <GlobeHemisphereWest className="text-amber-500" size={20} />
                Global Node Topology
              </h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded">
                  Live Feed
                </span>
              </div>
            </div>
            
            <div 
              className="absolute inset-0 opacity-20" 
              style={{
                backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'invert(1)'
              }}
            />
            
            {mapPoints.map((point, index) => (
              <div 
                key={index}
                className="map-point"
                style={{ 
                  top: point.top, 
                  left: point.left, 
                  animationDelay: point.delay 
                }}
              />
            ))}
            
            <div className="absolute bottom-6 left-6 z-10">
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-white" data-testid="data-centers-count">195</div>
                  <div className="text-xs text-slate-400 uppercase">Data Centers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white" data-testid="countries-count">32</div>
                  <div className="text-xs text-slate-400 uppercase">Countries</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={64} weight="fill" />
              </div>
              <span className="text-sm text-slate-400 uppercase tracking-widest mb-2">Nakamoto Coefficient</span>
              <span className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" data-testid="nakamoto-coefficient">
                19
              </span>
              <span className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <TrendUp size={16} weight="bold" /> Super Minority Secured
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex-1">
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex justify-between">
                <span>Stake Concentration</span>
                <ChartPieSlice size={20} />
              </h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stakeChartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false}
                      width={50}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                      {stakeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ListDashes className="text-amber-500" weight="fill" size={24} /> Validator Matrix
            </h2>
            
            <div className="flex gap-3 flex-wrap">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search Validator / ISP..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-[#0f1016] border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block pl-10 p-2.5 w-64 transition-all focus:w-80"
                  data-testid="input-search-validator"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlass className="text-slate-500" size={16} />
                </div>
              </div>
              <button 
                className="bg-[#1a1b2e] hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 text-sm transition flex items-center gap-2"
                data-testid="button-filters"
              >
                <Sliders size={16} /> Filters
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/30 text-xs uppercase tracking-wider text-slate-500 border-b border-white/5">
                    <th className="p-5 font-semibold">Node Identity</th>
                    <th className="p-5 font-semibold">Location (ISP)</th>
                    <th className="p-5 font-semibold text-center">Trust Score</th>
                    <th className="p-5 font-semibold text-center">Version</th>
                    <th className="p-5 font-semibold text-right">Active Stake (TBURN)</th>
                    <th className="p-5 font-semibold text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {paginatedValidators.map((validator) => (
                    <tr 
                      key={validator.id} 
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      data-testid={`validator-row-${validator.id}`}
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${validator.gradient ? `bg-gradient-to-br ${validator.gradient}` : 'bg-slate-800 border border-slate-700'} flex items-center justify-center text-white font-bold shadow-lg`}>
                            {validator.initials}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition">
                              {validator.name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{validator.shortAddr}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://flagcdn.com/w20/${validator.countryCode}.png`} 
                            alt={validator.countryCode}
                            className="rounded-sm opacity-80 w-5"
                          />
                          <span className="text-slate-300">{validator.location}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{validator.isp}</div>
                      </td>
                      <td className="p-5 text-center">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          validator.trustScore >= 98 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {validator.trustScore.toFixed(1)}%
                        </div>
                      </td>
                      <td className="p-5 text-center text-slate-400 font-mono">
                        {validator.version}
                      </td>
                      <td className="p-5 text-right">
                        <div className="font-bold text-white">{formatNumber(validator.stake)}</div>
                        <div className={`text-xs ${validator.stakeShare > 5 ? 'text-amber-500' : 'text-slate-500'}`}>
                          {validator.stakeShare.toFixed(2)}% share
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`status-dot ${validator.status === 'active' ? 'text-emerald-500' : 'text-yellow-500'}`} />
                          <span className="text-slate-300">
                            {validator.status === 'active' ? `Delinquent: ${validator.delinquent}%` : 'Warning'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-black/20 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredValidators.length)} of {filteredValidators.length} Validators
              </span>
              <div className="flex gap-2 flex-wrap justify-center">
                <button 
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    className={`px-3 py-1 rounded transition ${
                      currentPage === page 
                        ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setCurrentPage(page)}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 3 && <span className="px-2 py-1">...</span>}
                <button 
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  data-testid="button-next-page"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
