import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { 
  GlobeHemisphereWest, 
  ShieldCheck,
  ListDashes, 
  MagnifyingGlass,
  Sliders,
  ChartPieSlice,
  Coins,
  TreeStructure,
  CircleNotch,
  House
} from "@phosphor-icons/react";
import { type ValidatorDisplayData, transformValidator, type ValidatorData } from "@/lib/validator-utils";
import { DelegationDialog } from "@/components/DelegationDialog";
import { Button } from "@/components/ui/button";
import { TBurnLogo } from "@/components/tburn-logo";
import { LanguageSelector } from "@/components/LanguageSelector";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface NetworkStats {
  tps: number;
  currentBlockHeight: number;
  activeValidators: number;
  totalValidators: number;
  totalShards: number;
  crossShardMessages: number;
  avgBlockTime: number;
}

interface ValidatorApiResponse {
  validators: ValidatorData[];
}

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
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [delegationDialogOpen, setDelegationDialogOpen] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<ValidatorDisplayData | null>(null);
  
  const mockWalletAddress = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";
  const mockWalletBalance = 50000;

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 5000,
    refetchInterval: 5000, // ★ REALTIME: Match RealtimeMetricsService poll interval
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
  const activeValidatorCount = validators.filter(v => v.performanceStatus === 'good').length;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const currentTps = networkStats?.tps || 210000;
  const currentEpoch = networkStats?.currentBlockHeight ? Math.floor(networkStats.currentBlockHeight / 100000) : 394;

  const topStakes = useMemo(() => {
    if (validators.length === 0) return [8, 35, 51, 100];
    const sorted = [...validators].sort((a, b) => b.stake - a.stake);
    const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
    if (totalStake === 0) return [8, 35, 51, 100];
    const top1Pct = Math.round((sorted[0]?.stake || 0) / totalStake * 100);
    const top10Stake = sorted.slice(0, 10).reduce((sum, v) => sum + v.stake, 0);
    const top10Pct = Math.round(top10Stake / totalStake * 100);
    const top19Stake = sorted.slice(0, 19).reduce((sum, v) => sum + v.stake, 0);
    const top19Pct = Math.round(top19Stake / totalStake * 100);
    return [top1Pct, top10Pct, top19Pct, 100];
  }, [validators]);

  const nakamotoCoefficient = useMemo(() => {
    if (validators.length === 0) return 19;
    const sorted = [...validators].sort((a, b) => b.stake - a.stake);
    const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
    let cumulative = 0;
    let count = 0;
    for (const v of sorted) {
      cumulative += v.stake;
      count++;
      if (cumulative > totalStake / 3) break;
    }
    return count;
  }, [validators]);

  const stakeChartData = {
    labels: ['Top 1', 'Top 10', 'Top 19', 'Others'],
    datasets: [{
      label: 'Stake Control',
      data: topStakes,
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

  const dataCenters = useMemo(() => {
    const locations = new Set(validators.map(v => v.location).filter(l => l && l !== 'Unknown'));
    return locations.size > 0 ? locations.size : networkStats?.totalShards || 64;
  }, [validators, networkStats]);

  const countries = useMemo(() => {
    const codes = new Set(validators.map(v => v.countryCode).filter(c => c && c !== 'unknown'));
    return codes.size > 0 ? codes.size : 32;
  }, [validators]);

  const realActiveValidators = networkStats?.activeValidators || validators.filter(v => v.performanceStatus === 'good').length || 1600;

  // Show loading skeleton on initial page load
  if (validatorsLoading && validators.length === 0) {
    return (
      <div className="min-h-screen text-slate-300" style={{
        fontFamily: "'Outfit', 'Noto Sans KR', sans-serif",
        backgroundColor: '#050509',
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(5, 5, 9, 1))',
      }}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <TBurnLogo className="w-16 h-16" />
          <CircleNotch className="animate-spin text-orange-500" size={48} />
          <div className="text-slate-400 text-lg">{t('validatorPage.loadingValidators', { defaultValue: 'Loading validators...' })}</div>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-orange-500/30 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              <TBurnLogo className="w-10 h-10" showText={false} />
              <h1 className="text-4xl font-bold text-white tracking-wide" data-testid="page-title">
                {t('validatorPage.title', { defaultValue: 'TBURN Network' }).split(' ')[0]} <span className="font-light text-slate-400">{t('validatorPage.title', { defaultValue: 'TBURN Network' }).split(' ').slice(1).join(' ') || 'Network'}</span>
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-mono tracking-wider uppercase pl-1">
              {t('validatorPage.subtitle', { defaultValue: 'Decentralized Trust Network / Validator Intelligence' })}
            </p>
          </div>
          
          <div className="flex gap-4 flex-wrap items-center">
            <LanguageSelector isDark={true} />
            <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition" data-testid="link-home">
              <House size={20} weight="duotone" className="text-slate-300" />
            </Link>
            <Link href="/validator/infrastructure" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-cyan-400/50 transition text-sm font-medium" data-testid="link-infrastructure">
              <TreeStructure className="text-cyan-400" weight="duotone" size={18} />
              {t('validatorPage.infrastructure', { defaultValue: 'Infrastructure' })}
            </Link>
            <Link href="/validator-governance" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-amber-500/50 transition text-sm font-medium" data-testid="link-governance">
              <Coins className="text-amber-400" weight="duotone" size={18} />
              {t('validatorPage.governanceAndRewards', { defaultValue: 'Governance & Rewards' })}
            </Link>
            <Link href="/external-validator-program" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-emerald-500/50 transition text-sm font-medium" data-testid="link-external-validators">
              <ShieldCheck className="text-emerald-400" weight="duotone" size={18} />
              {t('validatorPage.externalValidators', { defaultValue: 'External Program' })}
            </Link>
            <Link href="/validator-registration" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-5 py-3 rounded-lg flex items-center gap-2 transition text-sm font-bold text-white shadow-lg shadow-orange-500/20" data-testid="link-register-validator">
              <ShieldCheck className="text-white" weight="fill" size={18} />
              {t('validatorPage.registerValidator', { defaultValue: 'Register Validator' })}
            </Link>
            <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">{t('validatorPage.networkTps', { defaultValue: 'Network TPS' })}</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono" data-testid="network-tps">{formatNumber(currentTps)}</span>
            </div>
            <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">{t('validatorPage.epoch', { defaultValue: 'Epoch' })}</span>
              <span className="text-2xl font-bold text-amber-400 font-mono" data-testid="current-epoch">{currentEpoch}</span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 relative overflow-hidden min-h-[300px]">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <GlobeHemisphereWest className="text-amber-500" size={20} />
                {t('validatorPage.globalNodeTopology', { defaultValue: 'Global Node Topology' })}
              </h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded">{t('validatorPage.liveFeed', { defaultValue: 'Live Feed' })}</span>
                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded">
                  {formatNumber(realActiveValidators)} {t('validatorPage.active', { defaultValue: 'Active' })}
                </span>
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
                  <div className="text-3xl font-bold text-white" data-testid="data-centers">{dataCenters}</div>
                  <div className="text-xs text-slate-400 uppercase">{t('validatorPage.dataCenters', { defaultValue: 'Data Centers' })}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white" data-testid="countries">{countries}</div>
                  <div className="text-xs text-slate-400 uppercase">{t('validatorPage.countries', { defaultValue: 'Countries' })}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={64} weight="fill" />
              </div>
              <span className="text-sm text-slate-400 uppercase tracking-widest mb-2">{t('validatorPage.nakamotoCoefficient', { defaultValue: 'Nakamoto Coefficient' })}</span>
              <span className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" data-testid="nakamoto-coefficient">{nakamotoCoefficient}</span>
              <span className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                ↑ {t('validatorPage.superMinoritySecured', { defaultValue: 'Super Minority Secured' })}
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex-1">
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex justify-between">
                <span>{t('validatorPage.stakeConcentration', { defaultValue: 'Stake Concentration' })}</span>
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
              <ListDashes className="text-amber-500" weight="fill" size={20} /> {t('validatorPage.validatorMatrix', { defaultValue: 'Validator Matrix' })}
              {validatorsLoading && <CircleNotch className="animate-spin text-amber-500" size={16} />}
              <span className="text-sm font-normal text-slate-500 ml-2">({validators.length} {t('validatorPage.validators', { defaultValue: 'validators' })})</span>
            </h2>
            
            <div className="flex gap-3">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder={t('validatorPage.searchPlaceholder', { defaultValue: 'Search Validator / ISP...' })}
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
                <Sliders size={16} /> {t('validatorPage.filters', { defaultValue: 'Filters' })}
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            {validatorsLoading ? (
              <div className="flex items-center justify-center py-20">
                <CircleNotch className="animate-spin text-amber-500" size={48} />
                <span className="ml-4 text-slate-400">{t('validatorPage.loadingValidators', { defaultValue: 'Loading validators...' })}</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/30 text-xs uppercase tracking-wider text-slate-500 border-b border-white/5">
                        <th className="p-5 font-semibold">{t('validatorPage.nodeIdentity', { defaultValue: 'Node Identity' })}</th>
                        <th className="p-5 font-semibold">{t('validatorPage.locationIsp', { defaultValue: 'Location (ISP)' })}</th>
                        <th className="p-5 font-semibold text-center">{t('validatorPage.trustScore', { defaultValue: 'Trust Score' })}</th>
                        <th className="p-5 font-semibold text-center">{t('validatorPage.version', { defaultValue: 'Version' })}</th>
                        <th className="p-5 font-semibold text-right">{t('validatorPage.activeStake', { defaultValue: 'Active Stake (TBURN)' })}</th>
                        <th className="p-5 font-semibold text-right">{t('validatorPage.performance', { defaultValue: 'Performance' })}</th>
                        <th className="p-5 font-semibold text-center">{t('validatorPage.actions', { defaultValue: 'Actions' })}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                      {paginatedValidators.map((validator) => (
                        <tr 
                          key={validator.id} 
                          className="hover:bg-white/5 transition-colors group cursor-pointer"
                          onClick={() => setLocation(`/validator/${validator.address}`)}
                          data-testid={`validator-row-${validator.id}`}
                        >
                          <td className="p-5">
                            <Link href={`/validator/${validator.address}`} className="flex items-center gap-3" data-testid={`link-validator-${validator.id}`}>
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
                                : validator.trustScore >= 95
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {validator.trustScore.toFixed(1)}%
                            </div>
                          </td>
                          <td className="p-5 text-center text-slate-400 font-mono">
                            {validator.version}
                          </td>
                          <td className="p-5 text-right">
                            <div className="font-bold text-white">{formatNumber(Math.round(validator.stake))}</div>
                            <div className="text-xs text-amber-500">{validator.stakeShare.toFixed(2)}% {t('validatorPage.share', { defaultValue: 'share' })}</div>
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`status-dot ${
                                validator.performanceStatus === 'good' ? 'text-emerald-500' : 
                                validator.performanceStatus === 'warning' ? 'text-yellow-500' : 'text-red-500'
                              }`} />
                              <span className="text-slate-300">{validator.performance}</span>
                            </div>
                          </td>
                          <td className="p-5 text-center">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedValidator(validator);
                                setDelegationDialogOpen(true);
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                              data-testid={`button-delegate-${validator.id}`}
                            >
                              <Coins size={14} className="mr-1" />
                              {t('validatorPage.delegate', { defaultValue: 'Delegate' })}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-black/20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
                  <span>{t('validatorPage.showingValidators', { 
                    defaultValue: 'Showing {{start}}-{{end}} of {{total}} Validators',
                    start: filteredValidators.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0,
                    end: Math.min(currentPage * itemsPerPage, filteredValidators.length),
                    total: filteredValidators.length
                  })}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition disabled:opacity-50"
                      data-testid="button-prev"
                    >
                      {t('validatorPage.prev', { defaultValue: 'Prev' })}
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
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition disabled:opacity-50"
                      data-testid="button-next"
                    >
                      {t('validatorPage.next', { defaultValue: 'Next' })}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </div>

      {selectedValidator && (
        <DelegationDialog
          open={delegationDialogOpen}
          onOpenChange={setDelegationDialogOpen}
          validator={{
            address: selectedValidator.address,
            name: selectedValidator.name,
            commission: selectedValidator.commission * 100,
            apy: 724,
            stake: selectedValidator.stake,
            delegators: selectedValidator.delegators,
            uptime: selectedValidator.uptime
          }}
          walletAddress={mockWalletAddress}
          walletBalance={mockWalletBalance}
          mode="delegate"
        />
      )}
    </div>
  );
}
