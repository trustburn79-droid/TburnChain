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
  tps: number;
  currentBlockHeight: number;
  activeValidators: number;
  totalValidators: number;
  totalShards: number;
  crossShardMessages: number;
  avgBlockTime: number;
  stakedAmount: string;
}

interface ValidatorApiResponse {
  validators: ValidatorData[];
}

export default function ValidatorInfrastructure() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'stake' | 'score'>('stake');
  const [currentPage, setCurrentPage] = useState(1);
  const [distributionView, setDistributionView] = useState<'datacenter' | 'asn'>('datacenter');
  const [sortBy, setSortBy] = useState<'stake' | 'count'>('stake');
  const [showFilters, setShowFilters] = useState(false);
  const [showNetworkMap, setShowNetworkMap] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'warning'>('all');
  const [filterMinStake, setFilterMinStake] = useState(0);
  const itemsPerPage = 10;

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
    let result = validators;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.isp.toLowerCase().includes(query) ||
        v.location.toLowerCase().includes(query) ||
        v.address.toLowerCase().includes(query)
      );
    }
    
    if (filterStatus === 'active') {
      result = result.filter(v => v.performanceStatus === 'good');
    } else if (filterStatus === 'warning') {
      result = result.filter(v => v.performanceStatus !== 'good');
    }
    
    if (filterMinStake > 0) {
      result = result.filter(v => v.stake >= filterMinStake);
    }
    
    return result;
  }, [searchQuery, validators, filterStatus, filterMinStake]);

  const sortedValidators = useMemo(() => {
    const sorted = [...filteredValidators];
    if (viewMode === 'stake') {
      sorted.sort((a, b) => b.stake - a.stake);
    } else {
      sorted.sort((a, b) => b.trustScore - a.trustScore);
    }
    return sorted;
  }, [filteredValidators, viewMode]);

  const paginatedValidators = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedValidators.slice(start, start + itemsPerPage);
  }, [sortedValidators, currentPage]);

  const totalPages = Math.ceil(filteredValidators.length / itemsPerPage);
  const totalActiveValidators = networkStats?.activeValidators || validators.filter(v => v.performanceStatus === 'good').length || 1600;
  const totalValidators = networkStats?.totalValidators || validators.length || 1600;
  const totalStaked = networkStats?.stakedAmount ? parseFloat(networkStats.stakedAmount) : validators.reduce((sum, v) => sum + v.stake, 0);
  const currentEpoch = networkStats?.currentBlockHeight ? Math.floor(networkStats.currentBlockHeight / 100000) : 1;
  const totalShards = networkStats?.totalShards || 64;

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const { countryDistribution, ispDistribution, countryStakeDistribution, ispStakeDistribution } = useMemo(() => {
    const stats = calculateInfrastructureStats(validators);
    const countryStake: Record<string, number> = {};
    const ispStake: Record<string, number> = {};
    
    validators.forEach(v => {
      const country = v.location.split(',').pop()?.trim() || 'Unknown';
      countryStake[country] = (countryStake[country] || 0) + v.stake;
      ispStake[v.isp] = (ispStake[v.isp] || 0) + v.stake;
    });
    
    return { ...stats, countryStakeDistribution: countryStake, ispStakeDistribution: ispStake };
  }, [validators]);

  const sortedCountryData = useMemo(() => {
    const data = sortBy === 'stake' ? countryStakeDistribution : countryDistribution;
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const top5 = entries.slice(0, 5);
    const otherValue = entries.slice(5).reduce((sum, [_, v]) => sum + v, 0);
    return { labels: [...top5.map(([k]) => k), 'Other'], values: [...top5.map(([_, v]) => v), otherValue] };
  }, [countryDistribution, countryStakeDistribution, sortBy]);

  const sortedIspData = useMemo(() => {
    const data = sortBy === 'stake' ? ispStakeDistribution : ispDistribution;
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const top5 = entries.slice(0, 5);
    const otherValue = entries.slice(5).reduce((sum, [_, v]) => sum + v, 0);
    return { labels: [...top5.map(([k]) => k), 'Other'], values: [...top5.map(([_, v]) => v), otherValue] };
  }, [ispDistribution, ispStakeDistribution, sortBy]);

  const countryChartData = {
    labels: sortedCountryData.labels,
    datasets: [{
      data: sortedCountryData.values,
      backgroundColor: ['#ff8c00', '#ff4500', '#00bfff', '#1e90ff', '#6a0dad', '#475569'],
      borderWidth: 2,
      borderColor: '#0a0a0f',
      hoverBorderColor: '#ff8c00',
      hoverBorderWidth: 3,
    }]
  };

  const orgChartData = {
    labels: sortedIspData.labels,
    datasets: [{
      data: sortedIspData.values,
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
          <div className="flex flex-wrap gap-4">
            <div className="tburn-panel rounded-lg p-4 flex items-center gap-3">
              <Cpu className="text-3xl text-accent-trust" weight="fill" size={32} />
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Active Validators</div>
                <div className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="active-validators">
                  {formatNumber(totalActiveValidators)} <span className="text-sm text-slate-400">/ {formatNumber(totalValidators)}</span>
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
            <div className="tburn-panel rounded-lg p-4 flex items-center gap-3">
              <GlobeHemisphereWest className="text-3xl text-green-400" weight="fill" size={32} />
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Epoch / Shards</div>
                <div className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="epoch-shards">
                  {currentEpoch} <span className="text-sm text-slate-400">/ {totalShards}</span>
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
            <button 
              onClick={() => setShowNetworkMap(true)}
              className="tburn-panel rounded-full px-5 py-2 text-sm font-medium hover:border-orange-500 hover:bg-orange-500/10 transition flex items-center gap-2" 
              data-testid="button-global-map"
            >
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
            <button 
              onClick={() => setDistributionView('datacenter')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${distributionView === 'datacenter' ? 'bg-orange-500/90 text-white shadow-lg shadow-orange-900/30' : 'hover:bg-slate-800 text-slate-300'}`}
              data-testid="button-datacenter"
            >
              Data Center
            </button>
            <button 
              onClick={() => setDistributionView('asn')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${distributionView === 'asn' ? 'bg-orange-500/90 text-white shadow-lg shadow-orange-900/30' : 'hover:bg-slate-800 text-slate-300'}`}
              data-testid="button-asn"
            >
              ASN Filter
            </button>
            <div className="w-px h-6 bg-slate-700/50 my-auto mx-2" />
            <button 
              onClick={() => setSortBy('stake')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${sortBy === 'stake' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-300'}`}
              data-testid="button-sort-stake"
            >
              <SortDescending size={14} weight="bold" /> Sort by Stake
            </button>
            <button 
              onClick={() => setSortBy('count')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${sortBy === 'count' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-300'}`}
              data-testid="button-sort-count"
            >
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
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`tburn-panel rounded-lg px-4 py-3 text-sm font-medium transition flex items-center gap-2 ${showFilters ? 'border-cyan-400 text-cyan-400' : 'hover:border-cyan-400/50 text-slate-300'}`}
                data-testid="button-filters"
              >
                <SlidersHorizontal size={16} weight="bold" /> Filters
                {(filterStatus !== 'all' || filterMinStake > 0) && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="tburn-panel rounded-xl p-4 mb-4 flex flex-wrap items-center gap-4" data-testid="filter-panel">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Status:</span>
                <div className="flex gap-1">
                  {(['all', 'active', 'warning'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filterStatus === status ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      data-testid={`filter-status-${status}`}
                    >
                      {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Warning'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Min Stake:</span>
                <input
                  type="number"
                  value={filterMinStake}
                  onChange={(e) => { setFilterMinStake(parseFloat(e.target.value) || 0); setCurrentPage(1); }}
                  placeholder="0"
                  className="w-32 bg-black/30 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500"
                  data-testid="filter-min-stake"
                />
                <span className="text-xs text-slate-500">TBURN</span>
              </div>
              <button 
                onClick={() => { setFilterStatus('all'); setFilterMinStake(0); setCurrentPage(1); }}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 transition"
                data-testid="filter-reset"
              >
                Reset Filters
              </button>
              <div className="ml-auto text-xs text-slate-500">
                Showing {filteredValidators.length} of {validators.length} validators
              </div>
            </div>
          )}

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

      {showNetworkMap && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNetworkMap(false)}>
          <div className="tburn-panel rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()} data-testid="network-map-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <MapTrifold className="text-orange-500" size={28} weight="duotone" />
                Global Network Distribution
              </h2>
              <button 
                onClick={() => setShowNetworkMap(false)} 
                className="text-slate-400 hover:text-white transition text-2xl"
                data-testid="button-close-map"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(countryDistribution).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([country, count]) => (
                <div key={country} className="bg-black/30 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <GlobeHemisphereWest className="text-cyan-400" size={20} />
                    <span className="font-semibold text-white">{country}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Validators:</span>
                    <span className="text-orange-400 font-bold">{count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Share:</span>
                    <span className="text-cyan-400">{((count / validators.length) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Network Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-500">{Object.keys(countryDistribution).length}</div>
                  <div className="text-xs text-slate-400 uppercase">Countries</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-cyan-400">{Object.keys(ispDistribution).length}</div>
                  <div className="text-xs text-slate-400 uppercase">ISP Providers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{totalShards}</div>
                  <div className="text-xs text-slate-400 uppercase">Active Shards</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">{currentEpoch}</div>
                  <div className="text-xs text-slate-400 uppercase">Current Epoch</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
