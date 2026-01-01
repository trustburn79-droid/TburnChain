import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { 
  Fire, 
  GlobeHemisphereWest, 
  ShieldCheck,
  ListDashes, 
  MagnifyingGlass,
  Sliders,
  ChartPieSlice,
  Coins,
  TreeStructure
} from "@phosphor-icons/react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface NetworkStats {
  currentTps: number;
  currentEpoch: number;
  activeValidators: number;
  totalStake: number;
}

const staticValidators = [
  {
    id: 'val-1',
    name: 'TBURN_Genesis_01',
    shortAddr: 'Ap2...9xQ',
    stake: 36468183,
    stakeShare: 8.65,
    trustScore: 98.5,
    version: 'v1.14.17',
    location: 'Chicago, US',
    countryCode: 'us',
    isp: 'AS20326 (TeraSwitch)',
    performance: 'Delinquent: 0%',
    performanceStatus: 'good',
    isGenesis: true,
    initials: 'TB',
  },
  {
    id: 'val-2',
    name: 'AllNodes_Secure',
    shortAddr: 'Hk4...3mL',
    stake: 25043993,
    stakeShare: 5.94,
    trustScore: 100,
    version: 'v1.14.17',
    location: 'Frankfurt, DE',
    countryCode: 'de',
    isp: 'AS20326 (Cherry Servers)',
    performance: 'Delinquent: 0%',
    performanceStatus: 'good',
    isGenesis: false,
    initials: 'AN',
  },
  {
    id: 'val-3',
    name: 'Latitude_Node_V',
    shortAddr: 'Bp2...8xK',
    stake: 15663731,
    stakeShare: 3.71,
    trustScore: 96.2,
    version: 'v1.13.5',
    location: 'Tokyo, JP',
    countryCode: 'jp',
    isp: 'AS20326 (Latitude.sh)',
    performance: 'Warning',
    performanceStatus: 'warning',
    isGenesis: false,
    initials: 'L',
  },
  {
    id: 'val-4',
    name: 'Coinbase_Cloud_NA',
    shortAddr: 'Cd5...7nP',
    stake: 12854621,
    stakeShare: 3.05,
    trustScore: 99.1,
    version: 'v1.14.17',
    location: 'Virginia, US',
    countryCode: 'us',
    isp: 'AS14618 (Amazon)',
    performance: 'Delinquent: 0%',
    performanceStatus: 'good',
    isGenesis: false,
    initials: 'CB',
  },
  {
    id: 'val-5',
    name: 'Figment_Prime',
    shortAddr: 'Fg6...2qR',
    stake: 11247893,
    stakeShare: 2.67,
    trustScore: 97.8,
    version: 'v1.14.17',
    location: 'Toronto, CA',
    countryCode: 'ca',
    isp: 'AS16509 (Amazon)',
    performance: 'Delinquent: 0%',
    performanceStatus: 'good',
    isGenesis: false,
    initials: 'FG',
  },
  {
    id: 'val-6',
    name: 'Chorus_One_EU',
    shortAddr: 'Ch7...4sT',
    stake: 9876543,
    stakeShare: 2.34,
    trustScore: 99.5,
    version: 'v1.14.17',
    location: 'Amsterdam, NL',
    countryCode: 'nl',
    isp: 'AS60781 (LeaseWeb)',
    performance: 'Delinquent: 0%',
    performanceStatus: 'good',
    isGenesis: false,
    initials: 'C1',
  },
  {
    id: 'val-7',
    name: 'Everstake_Global',
    shortAddr: 'Ev8...6uV',
    stake: 8765432,
    stakeShare: 2.08,
    trustScore: 98.9,
    version: 'v1.14.17',
    location: 'Singapore, SG',
    countryCode: 'sg',
    isp: 'AS16509 (Amazon)',
    performance: 'Delinquent: 0%',
    performanceStatus: 'good',
    isGenesis: false,
    initials: 'EV',
  },
  {
    id: 'val-8',
    name: 'Staked_US_West',
    shortAddr: 'St9...8wX',
    stake: 7654321,
    stakeShare: 1.82,
    trustScore: 97.2,
    version: 'v1.13.5',
    location: 'Los Angeles, US',
    countryCode: 'us',
    isp: 'AS20473 (Vultr)',
    performance: 'Warning',
    performanceStatus: 'warning',
    isGenesis: false,
    initials: 'ST',
  },
];

const mapPoints = [
  { top: '30%', left: '25%', delay: '0s' },
  { top: '32%', left: '28%', delay: '0.5s' },
  { top: '25%', left: '48%', delay: '1s' },
  { top: '28%', left: '50%', delay: '1.2s' },
  { top: '35%', left: '80%', delay: '0.2s' },
  { top: '38%', left: '75%', delay: '0.8s' },
  { top: '45%', left: '82%', delay: '1.5s' },
  { top: '55%', left: '30%', delay: '0.3s' },
  { top: '60%', left: '52%', delay: '0.7s' },
];

export default function ValidatorCommandCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const filteredValidators = useMemo(() => {
    if (!searchQuery) return staticValidators;
    const query = searchQuery.toLowerCase();
    return staticValidators.filter(v => 
      v.name.toLowerCase().includes(query) ||
      v.isp.toLowerCase().includes(query) ||
      v.location.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const paginatedValidators = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredValidators.slice(start, start + itemsPerPage);
  }, [filteredValidators, currentPage]);

  const totalPages = Math.ceil(filteredValidators.length / itemsPerPage);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const currentTps = networkStats?.currentTps || 102491;
  const currentEpoch = networkStats?.currentEpoch || 402;

  const stakeChartData = {
    labels: ['Top 1', 'Top 10', 'Top 19', 'Others'],
    datasets: [{
      label: 'Stake Control',
      data: [8, 35, 51, 100],
      backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#64748B'],
      borderRadius: 4,
      barThickness: 20,
    }]
  };

  const stakeChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { display: false },
      y: { 
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
      }
    }
  };

  return (
    <div className="min-h-screen text-slate-300" style={{
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
          height: 8px; width: 8px;
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
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      <div className="bg-mesh" />

      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 relative z-10">
        
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 border-b border-white/5 pb-6 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Fire className="text-amber-500 text-3xl animate-pulse" weight="fill" size={32} />
              <h1 className="text-4xl font-bold text-white tracking-wide" data-testid="page-title">
                TBURN <span className="font-light text-slate-400">Scan</span>
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-mono tracking-wider uppercase pl-1">
              Decentralized Trust Network / Validator Intelligence
            </p>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Link href="/validator/infrastructure" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-cyan-400/50 transition text-sm font-medium" data-testid="link-infrastructure">
              <TreeStructure className="text-cyan-400" weight="duotone" size={18} />
              Infrastructure
            </Link>
            <Link href="/validator-governance" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-amber-500/50 transition text-sm font-medium" data-testid="link-governance">
              <Coins className="text-amber-400" weight="duotone" size={18} />
              Governance & Rewards
            </Link>
            <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">Network TPS</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono" data-testid="network-tps">{formatNumber(currentTps)}</span>
            </div>
            <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">Epoch</span>
              <span className="text-2xl font-bold text-amber-400 font-mono" data-testid="current-epoch">{currentEpoch}</span>
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
                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded">Live Feed</span>
              </div>
            </div>
            
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'invert(1)'
            }} />
            
            {mapPoints.map((point, idx) => (
              <div 
                key={idx}
                className="map-point" 
                style={{ top: point.top, left: point.left, animationDelay: point.delay }}
              />
            ))}

            <div className="absolute bottom-6 left-6 z-10">
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-white">195</div>
                  <div className="text-xs text-slate-400 uppercase">Data Centers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">32</div>
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
              <span className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" data-testid="nakamoto-coefficient">19</span>
              <span className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                ↑ Super Minority Secured
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex-1">
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex justify-between">
                <span>Stake Concentration</span>
                <ChartPieSlice size={16} />
              </h4>
              <div className="h-32">
                <Bar data={stakeChartData} options={stakeChartOptions} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ListDashes className="text-amber-500" weight="fill" size={20} /> Validator Matrix
            </h2>
            
            <div className="flex gap-3">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search Validator / ISP..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="bg-[#0f1016] border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block pl-10 p-2.5 w-64 transition-all focus:w-80"
                  data-testid="input-search"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlass className="text-slate-500" size={16} />
                </div>
              </div>
              <button className="bg-[#1a1b2e] hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 text-sm transition flex items-center gap-2" data-testid="button-filters">
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
                        <Link href={`/validator/${validator.id}`} className="flex items-center gap-3" data-testid={`link-validator-${validator.id}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg ${
                            validator.isGenesis 
                              ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                              : 'bg-slate-800 border border-slate-700 text-slate-400'
                          }`}>
                            {validator.initials}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition">{validator.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{validator.shortAddr}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <img src={`https://flagcdn.com/w20/${validator.countryCode}.png`} className="rounded-sm opacity-80" alt={validator.countryCode} />
                          <span className="text-slate-300">{validator.location}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{validator.isp}</div>
                      </td>
                      <td className="p-5 text-center">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          validator.trustScore >= 98 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {validator.trustScore}%
                        </div>
                      </td>
                      <td className="p-5 text-center text-slate-400 font-mono">
                        {validator.version}
                      </td>
                      <td className="p-5 text-right">
                        <div className="font-bold text-white">{formatNumber(validator.stake)}</div>
                        <div className="text-xs text-amber-500">{validator.stakeShare}% share</div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`status-dot ${
                            validator.performanceStatus === 'good' ? 'text-emerald-500' : 'text-yellow-500'
                          }`} />
                          <span className="text-slate-300">{validator.performance}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-black/20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
              <span>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredValidators.length)} of {filteredValidators.length} Validators</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition disabled:opacity-50"
                  data-testid="button-prev"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded transition ${
                      currentPage === page 
                        ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 5 && <span className="px-2 py-1">...</span>}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition disabled:opacity-50"
                  data-testid="button-next"
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
