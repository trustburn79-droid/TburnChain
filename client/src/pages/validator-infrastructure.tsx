import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  Fire, 
  Cpu,
  GlobeHemisphereWest, 
  ShieldWarning, 
  LockKey,
  ListDashes, 
  MagnifyingGlass,
  SlidersHorizontal,
  MapTrifold,
  SortDescending,
  ListNumbers,
  Buildings,
  Flag,
  ArrowLeft,
  CircleNotch
} from "@phosphor-icons/react";
import { type ValidatorDisplayData, transformValidator, type ValidatorData, calculateInfrastructureStats } from "@/lib/validator-utils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface NetworkStats {
  activeValidators: number;
  totalStake: number;
}

interface ValidatorApiResponse {
  validators: ValidatorData[];
}

export default function ValidatorInfrastructure() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'stake' | 'score'>('stake');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 30000,
  });

  const { data: validatorResponse, isLoading: validatorsLoading } = useQuery<ValidatorApiResponse>({
    queryKey: ["/api/validators"],
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const validators: ValidatorDisplayData[] = useMemo(() => {
    if (!validatorResponse?.validators) return [];
    const rawValidators = validatorResponse.validators;
    const totalStake = rawValidators.reduce((sum, v) => sum + parseFloat(v.stake || '0'), 0);
    return rawValidators.map(v => transformValidator(v, totalStake));
  }, [validatorResponse]);

  const filteredValidators = useMemo(() => {
    if (!searchQuery) return validators;
    const query = searchQuery.toLowerCase();
    return validators.filter(v => 
      v.name.toLowerCase().includes(query) ||
      v.isp.toLowerCase().includes(query) ||
      v.location.toLowerCase().includes(query) ||
      v.address.toLowerCase().includes(query)
    );
  }, [searchQuery, validators]);

  const paginatedValidators = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredValidators.slice(start, start + itemsPerPage);
  }, [filteredValidators, currentPage]);

  const totalPages = Math.ceil(filteredValidators.length / itemsPerPage);
  const totalActiveValidators = validators.filter(v => v.performanceStatus === 'good').length || networkStats?.activeValidators || 1892;
  const totalStaked = validators.reduce((sum, v) => sum + v.stake, 0) || networkStats?.totalStake || 421700000;

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const { countryDistribution, ispDistribution } = useMemo(() => 
    calculateInfrastructureStats(validators), [validators]);

  const countryLabels = Object.keys(countryDistribution).slice(0, 5);
  const countryValues = countryLabels.map(k => countryDistribution[k]);
  const otherCountries = Object.keys(countryDistribution).slice(5).reduce((sum, k) => sum + countryDistribution[k], 0);

  const countryChartData = {
    labels: countryLabels.length > 0 ? [...countryLabels, 'Other'] : ['Germany', 'United States', 'Netherlands', 'Lithuania', 'UK', 'Other'],
    datasets: [{
      data: countryLabels.length > 0 ? [...countryValues, otherCountries] : [25, 23, 18, 10, 8, 16],
      backgroundColor: ['#ff8c00', '#ff4500', '#00bfff', '#1e90ff', '#6a0dad', '#475569'],
      borderWidth: 2,
      borderColor: '#0a0a0f',
      hoverBorderColor: '#ff8c00',
      hoverBorderWidth: 3,
    }]
  };

  const ispLabels = Object.keys(ispDistribution).slice(0, 5);
  const ispValues = ispLabels.map(k => ispDistribution[k]);
  const otherIsps = Object.keys(ispDistribution).slice(5).reduce((sum, k) => sum + ispDistribution[k], 0);

  const orgChartData = {
    labels: ispLabels.length > 0 ? [...ispLabels, 'Other'] : ['TeraSwitch', 'Cherry Servers', 'Amazon AWS', 'Latitude.sh', 'ALLNODES', 'Other'],
    datasets: [{
      data: ispLabels.length > 0 ? [...ispValues, otherIsps] : [35, 20, 10, 10, 5, 20],
      backgroundColor: ['#ff8c00', '#ff6347', '#00ced1', '#4682b4', '#9370db', '#475569'],
      borderWidth: 2,
      borderColor: '#0a0a0f',
      hoverBorderColor: '#ff8c00',
      hoverBorderWidth: 3,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          font: { size: 11 },
          color: '#94a3b8',
        }
      }
    }
  };

  const dataCenters = useMemo(() => {
    const locations = new Set(validators.map(v => v.location));
    return locations.size || 195;
  }, [validators]);

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12" style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#0a0a0f',
      backgroundImage: 'radial-gradient(circle at 15% 25%, rgba(255, 69, 0, 0.05) 0%, transparent 40%), radial-gradient(circle at 85% 75%, rgba(0, 191, 255, 0.05) 0%, transparent 40%)',
      color: '#e2e8f0'
    }}>
      <style>{`
        .tburn-panel {
          background: rgba(20, 24, 35, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 140, 0, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }
        .tburn-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #ff8c00, transparent);
          opacity: 0.3;
        }
        .tburn-row {
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .tburn-row:hover {
          background: linear-gradient(90deg, rgba(255, 140, 0, 0.05) 0%, transparent 100%);
          transform: translateX(2px);
          border-left: 2px solid #ff8c00;
        }
        .text-accent-burn { color: #ff8c00; }
        .text-accent-trust { color: #00bfff; }
        .tburn-glow { text-shadow: 0 0 12px rgba(255, 140, 0, 0.6); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #ff8c00; }
      `}</style>

      <header className="max-w-[1600px] mx-auto mb-10">
        <Link href="/validator" className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4" data-testid="link-back-to-validator">
          <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5">
            <ArrowLeft size={16} weight="bold" />
          </div>
          <span className="text-sm font-medium">Back to Validator Matrix</span>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="page-title">
              TBURN <span className="text-accent-burn tburn-glow">Mainnet</span>
            </h1>
            <p className="text-xl text-slate-400 mt-2 font-light">Enterprise Validator Intelligence & Network Telemetry</p>
          </div>
          <div className="flex gap-4">
            <div className="tburn-panel rounded-lg p-4 flex items-center gap-3">
              <Cpu className="text-3xl text-accent-trust" weight="fill" size={32} />
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Active Validators</div>
                <div className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="active-validators">
                  {formatNumber(totalActiveValidators)}
                </div>
              </div>
            </div>
            <div className="tburn-panel rounded-lg p-4 flex items-center gap-3">
              <Fire className="text-3xl text-accent-burn" weight="fill" size={32} />
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Total Staked</div>
                <div className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="total-staked">
                  {(totalStaked / 1000000).toFixed(1)}M <span className="text-sm text-slate-400">TBURN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-8">
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <GlobeHemisphereWest className="text-accent-trust" size={24} weight="duotone" />
              Infrastructure Distribution <span className="text-slate-500 text-lg font-normal">({dataCenters} Data Centers)</span>
            </h2>
            <button className="tburn-panel rounded-full px-5 py-2 text-sm font-medium hover:border-accent-burn transition flex items-center gap-2" data-testid="button-global-map">
              <MapTrifold size={16} weight="bold" /> Global Network Map
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="tburn-panel rounded-xl p-6 relative">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Flag size={64} weight="fill" className="text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold mb-6 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Data Centers by Country
              </h3>
              <div className="h-72 relative z-10">
                <Doughnut data={countryChartData} options={chartOptions} />
              </div>
            </div>

            <div className="tburn-panel rounded-xl p-6 relative">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Buildings size={64} weight="fill" className="text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold mb-6 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Data Centers by Organization
              </h3>
              <div className="h-72 relative z-10">
                <Doughnut data={orgChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="mt-6 tburn-panel rounded-full p-2 inline-flex flex-wrap gap-2 bg-black/20">
            <button className="px-4 py-2 rounded-full bg-orange-500/90 text-white text-sm font-medium shadow-lg shadow-orange-900/30">Data Center</button>
            <button className="px-4 py-2 rounded-full hover:bg-slate-800 text-slate-300 text-sm font-medium transition">ASN Filter</button>
            <div className="w-px h-6 bg-slate-700/50 my-auto mx-2" />
            <button className="px-4 py-2 rounded-full hover:bg-slate-800 text-slate-300 text-sm font-medium transition flex items-center gap-1">
              <SortDescending size={14} weight="bold" /> Sort by Stake
            </button>
            <button className="px-4 py-2 rounded-full hover:bg-slate-800 text-slate-300 text-sm font-medium transition flex items-center gap-1">
              <ListNumbers size={14} weight="bold" /> Sort by Count
            </button>
          </div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row justify-between items-end mb-5 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <ListDashes className="text-accent-burn" size={24} weight="duotone" />
              Validator Matrix
              {validatorsLoading && <CircleNotch className="animate-spin text-orange-500 ml-2" size={20} />}
              <span className="text-slate-500 text-lg font-normal ml-2">({validators.length} validators)</span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search Validator, ASN, or Location..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="bg-black/30 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent block pl-10 p-3 w-72 transition-all group-hover:border-slate-600"
                  data-testid="input-search"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlass className="text-slate-500" size={16} weight="bold" />
                </div>
              </div>
              <div className="tburn-panel rounded-lg p-1 flex">
                <button 
                  onClick={() => setViewMode('stake')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition ${viewMode === 'stake' ? 'bg-orange-500/10 text-orange-500' : 'text-slate-400 hover:text-slate-200'}`}
                  data-testid="button-stake-view"
                >
                  Stake View
                </button>
                <button 
                  onClick={() => setViewMode('score')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition ${viewMode === 'score' ? 'bg-orange-500/10 text-orange-500' : 'text-slate-400 hover:text-slate-200'}`}
                  data-testid="button-score-view"
                >
                  Score View
                </button>
              </div>
              <button className="tburn-panel rounded-lg px-4 py-3 text-sm font-medium hover:border-cyan-400/50 transition flex items-center gap-2 text-slate-300" data-testid="button-filters">
                <SlidersHorizontal size={16} weight="bold" /> Filters
              </button>
            </div>
          </div>

          <div className="tburn-panel rounded-xl overflow-hidden">
            {validatorsLoading ? (
              <div className="flex items-center justify-center py-20">
                <CircleNotch className="animate-spin text-orange-500" size={48} />
                <span className="ml-4 text-slate-400">Loading validators...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/20 text-xs uppercase tracking-wider text-slate-500">
                        <th className="p-4 font-semibold">Identity & Version</th>
                        <th className="p-4 font-semibold">Location & Network (ISP)</th>
                        <th className="p-4 font-semibold text-center">Nodes</th>
                        <th className="p-4 font-semibold">Status Indicators</th>
                        <th className="p-4 font-semibold text-right">Active Stake (Share)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-medium text-sm">
                      {paginatedValidators.map((validator) => (
                        <tr 
                          key={validator.id} 
                          className="tburn-row cursor-pointer"
                          data-testid={`validator-row-${validator.id}`}
                        >
                          <td className="p-4">
                            <Link href={`/validator/${validator.address}`} className="flex items-center gap-3" data-testid={`link-validator-${validator.id}`}>
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg ${
                                validator.isGenesis 
                                  ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                                  : 'bg-slate-800 border border-slate-700 text-slate-400'
                              }`}>
                                {validator.initials}
                              </div>
                              <div>
                                <div className="font-bold text-white text-base hover:text-orange-400 transition">{validator.name}</div>
                                <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                  {validator.version} <span className="w-1 h-1 rounded-full bg-slate-500" /> {validator.commission}% Comm.
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-slate-200 font-semibold flex items-center gap-2">
                                <img src={`https://flagcdn.com/w20/${validator.countryCode}.png`} width="20" alt={validator.countryCode} className="rounded-sm shadow-sm" />
                                {validator.location}
                              </span>
                              <span className="text-slate-500 text-xs mt-1 font-mono">{validator.isp}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center text-lg text-slate-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {validator.nodes}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <ShieldWarning className={validator.bad > 0 ? 'text-red-500' : 'text-slate-600'} weight="fill" size={14} /> 
                                Bad: {validator.bad}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-accent-trust">
                                <LockKey weight="fill" size={14} /> 
                                Private: {validator.privateNodes} ({validator.privatePercent}%)
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="font-bold text-white text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              {formatNumber(Math.round(validator.stake))} <span className="text-sm text-slate-400">TBURN</span>
                            </div>
                            <div className="text-sm text-accent-burn font-medium mb-1">{validator.stakeShare.toFixed(2)}% Share</div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500" 
                                style={{ width: `${Math.min(validator.stakeShare * 10, 100)}%` }} 
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 bg-black/20 gap-4">
                  <div>
                    Showing <span className="font-semibold text-white">{filteredValidators.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredValidators.length)}</span> of <span className="font-semibold text-white">{filteredValidators.length}</span> Validators
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
                      data-testid="button-prev"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-md transition ${
                          currentPage === page 
                            ? 'bg-orange-500 text-white font-medium shadow-md shadow-orange-900/20' 
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        data-testid={`button-page-${page}`}
                      >
                        {page}
                      </button>
                    ))}
                    {totalPages > 3 && <span className="px-2">...</span>}
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
                      data-testid="button-next"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      
      <footer className="max-w-[1600px] mx-auto mt-12 py-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
        <p>© 2024 TBURN Foundation. All rights reserved. | Decentralized Intelligence Platform.</p>
      </footer>
    </div>
  );
}
