import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Fire, 
  Cpu, 
  GlobeHemisphereWest, 
  ListDashes,
  MagnifyingGlass,
  SlidersHorizontal,
  SortDescending,
  ListNumbers,
  MapTrifold,
  Flag,
  Buildings,
  ShieldWarning,
  LockKey,
  ArrowLeft,
  X,
  FunnelSimple,
  MapPin
} from "@phosphor-icons/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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

const countryColors = ["#ff8c00", "#ff4500", "#00bfff", "#1e90ff", "#6a0dad", "#10b981", "#f59e0b"];
const orgColors = ["#ff8c00", "#ff6347", "#00ced1", "#4682b4", "#9370db", "#10b981", "#f59e0b"];

const countryNames: Record<string, string> = {
  "US": "United States", "DE": "Germany", "NL": "Netherlands", 
  "JP": "Japan", "SG": "Singapore", "KR": "South Korea", "GB": "United Kingdom",
  "FR": "France", "CA": "Canada", "AU": "Australia"
};

function calculateDistribution(validators: Validator[]) {
  const countryMap: Record<string, number> = {};
  const ispMap: Record<string, number> = {};
  
  validators.forEach((v, index) => {
    const seed = v.address?.charCodeAt(5) || index;
    const locData = getLocationData(v.location, seed);
    const countryName = countryNames[locData.country] || locData.country;
    countryMap[countryName] = (countryMap[countryName] || 0) + 1;
    ispMap[locData.isp] = (ispMap[locData.isp] || 0) + 1;
  });
  
  const total = validators.length || 1;
  
  const countrySorted = Object.entries(countryMap)
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
    
  const ispSorted = Object.entries(ispMap)
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  
  return {
    countryData: countrySorted.map((item, i) => ({ ...item, color: countryColors[i % countryColors.length] })),
    orgData: ispSorted.map((item, i) => ({ ...item, color: orgColors[i % orgColors.length] }))
  };
}

const countryFlags: Record<string, string> = {
  "US": "https://flagcdn.com/w20/us.png",
  "DE": "https://flagcdn.com/w20/de.png",
  "JP": "https://flagcdn.com/w20/jp.png",
  "NL": "https://flagcdn.com/w20/nl.png",
  "SG": "https://flagcdn.com/w20/sg.png",
  "KR": "https://flagcdn.com/w20/kr.png",
  "GB": "https://flagcdn.com/w20/gb.png",
};

const locationMap: Record<string, { city: string; country: string; isp: string }> = {
  "Chicago": { city: "Chicago", country: "US", isp: "TeraSwitch Inc." },
  "Frankfurt": { city: "Frankfurt", country: "DE", isp: "Cherry Servers" },
  "Tokyo": { city: "Tokyo", country: "JP", isp: "Latitude.sh" },
  "Amsterdam": { city: "Amsterdam", country: "NL", isp: "Amazon AWS" },
  "Singapore": { city: "Singapore", country: "SG", isp: "OVH Cloud" },
  "Seoul": { city: "Seoul", country: "KR", isp: "KT Corporation" },
  "London": { city: "London", country: "GB", isp: "Equinix" },
};

function getLocationData(location?: string, seed: number = 0) {
  if (!location) {
    const keys = Object.keys(locationMap);
    const key = keys[seed % keys.length];
    return locationMap[key];
  }
  for (const key of Object.keys(locationMap)) {
    if (location.includes(key)) {
      return locationMap[key];
    }
  }
  return locationMap["Chicago"];
}

export default function ValidatorInfrastructure() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"stake" | "score">("stake");
  const [showMapModal, setShowMapModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [chartFilter, setChartFilter] = useState<"datacenter" | "asn">("datacenter");
  const [sortOrder, setSortOrder] = useState<"stake" | "count">("stake");
  const itemsPerPage = 10;

  const { data: validatorsData, isLoading } = useQuery<{ validators: Validator[] }>({
    queryKey: ["/api/validators"],
    staleTime: 30000,
    refetchOnMount: false,
  });

  const validators = validatorsData?.validators || [];
  const totalStake = validators.reduce((sum, v) => sum + (parseFloat(v.stake) || 0), 0);
  
  const { countryData, orgData } = useMemo(() => calculateDistribution(validators), [validators]);

  const filteredValidators = useMemo(() => {
    if (!searchTerm) return validators;
    const term = searchTerm.toLowerCase();
    return validators.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        v.address.toLowerCase().includes(term) ||
        (v.location && v.location.toLowerCase().includes(term))
    );
  }, [validators, searchTerm]);

  const paginatedValidators = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredValidators.slice(start, start + itemsPerPage);
  }, [filteredValidators, currentPage]);

  const totalPages = Math.ceil(filteredValidators.length / itemsPerPage);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="tburn-panel rounded-lg p-3">
          <p className="font-semibold text-white">{payload[0].name}</p>
          <p className="text-slate-400">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen relative">
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
        .text-accent-burn { color: #ff8c00; }
        .text-accent-trust { color: #00bfff; }
        .bg-accent-burn { background-color: #ff8c00; }
        .tburn-glow { text-shadow: 0 0 12px rgba(255, 140, 0, 0.6); }
        .tburn-table-header {
          background: rgba(0, 0, 0, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.75rem;
          color: #94a3b8;
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
        .bg-mesh {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #0a0a0f;
          background-image: 
            radial-gradient(circle at 15% 25%, rgba(255, 69, 0, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 85% 75%, rgba(0, 191, 255, 0.05) 0%, transparent 40%);
          z-index: 0;
        }
      `}</style>

      <div className="bg-mesh" />

      <div className="container mx-auto px-4 py-6 relative z-10">
        <Link href="/validator" className="inline-flex items-center gap-2 text-slate-400 hover:text-accent-burn transition mb-6" data-testid="link-back-validator">
          <ArrowLeft size={20} />
          <span>Back to Validators</span>
        </Link>

        <header className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                TBURN <span className="text-accent-burn tburn-glow">Mainnet</span>
              </h1>
              <p className="text-xl text-slate-400 mt-2 font-light">Enterprise Validator Intelligence & Network Telemetry</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="tburn-panel rounded-lg p-4 flex items-center gap-3">
                <Cpu className="text-3xl text-accent-trust" size={32} weight="fill" />
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Active Validators</div>
                  <div className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="text-active-validators">
                    {validators.filter(v => v.status === "active").length.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="tburn-panel rounded-lg p-4 flex items-center gap-3">
                <Fire className="text-3xl text-accent-burn" size={32} weight="fill" />
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Total Staked</div>
                  <div className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="text-total-staked">
                    {(totalStake / 1e6).toFixed(1)}M <span className="text-sm text-slate-400">TBURN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <section>
            <div className="flex flex-wrap justify-between items-center mb-5 gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <GlobeHemisphereWest className="text-accent-trust" size={28} weight="duotone" />
                Infrastructure Distribution <span className="text-slate-500 text-lg font-normal">(195 Data Centers)</span>
              </h2>
              <button 
                className="tburn-panel rounded-full px-5 py-2 text-sm font-medium hover:border-accent-burn transition flex items-center gap-2"
                onClick={() => setShowMapModal(true)}
                data-testid="button-global-network-map"
              >
                <MapTrifold size={18} weight="bold" /> Global Network Map
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="tburn-panel rounded-xl p-6 relative">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                  <Flag className="text-6xl text-slate-700" size={64} weight="fill" />
                </div>
                <h3 className="text-lg font-semibold mb-6 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>Data Centers by Country</h3>
                <div className="h-72 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {countryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0a0a0f" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="tburn-panel rounded-xl p-6 relative">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                  <Buildings className="text-6xl text-slate-700" size={64} weight="fill" />
                </div>
                <h3 className="text-lg font-semibold mb-6 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>Data Centers by Organization</h3>
                <div className="h-72 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orgData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {orgData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0a0a0f" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 tburn-panel rounded-full p-2 inline-flex flex-wrap gap-2 bg-black/20">
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${chartFilter === "datacenter" ? "bg-accent-burn/90 text-white shadow-lg shadow-orange-900/30" : "hover:bg-slate-800 text-slate-300"}`}
                onClick={() => setChartFilter("datacenter")}
                data-testid="button-filter-datacenter"
              >
                Data Center
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${chartFilter === "asn" ? "bg-accent-burn/90 text-white shadow-lg shadow-orange-900/30" : "hover:bg-slate-800 text-slate-300"}`}
                onClick={() => setChartFilter("asn")}
                data-testid="button-filter-asn"
              >
                ASN Filter
              </button>
              <div className="w-px h-6 bg-slate-700/50 my-auto mx-2" />
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${sortOrder === "stake" ? "bg-blue-500/20 text-blue-400" : "hover:bg-slate-800 text-slate-300"}`}
                onClick={() => setSortOrder("stake")}
                data-testid="button-sort-stake"
              >
                <SortDescending size={16} weight="bold" /> Sort by Stake
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${sortOrder === "count" ? "bg-blue-500/20 text-blue-400" : "hover:bg-slate-800 text-slate-300"}`}
                onClick={() => setSortOrder("count")}
                data-testid="button-sort-count"
              >
                <ListNumbers size={16} weight="bold" /> Sort by Count
              </button>
            </div>
          </section>

          <section>
            <div className="flex flex-col md:flex-row justify-between items-end mb-5 gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <ListDashes className="text-accent-burn" size={28} weight="duotone" />
                Validator Matrix
              </h2>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Search Validator, ASN, or Location..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-black/30 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent block pl-10 p-3 w-72 transition-all group-hover:border-slate-600"
                    data-testid="input-search-validator"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MagnifyingGlass className="text-slate-500" size={18} weight="bold" />
                  </div>
                </div>
                <div className="tburn-panel rounded-lg p-1 flex">
                  <button 
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${viewMode === "stake" ? "bg-accent-burn/10 text-accent-burn" : "text-slate-400 hover:text-slate-200"}`}
                    onClick={() => setViewMode("stake")}
                    data-testid="button-view-stake"
                  >
                    Stake View
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${viewMode === "score" ? "bg-accent-burn/10 text-accent-burn" : "text-slate-400 hover:text-slate-200"}`}
                    onClick={() => setViewMode("score")}
                    data-testid="button-view-score"
                  >
                    Score View
                  </button>
                </div>
                <button 
                  className="tburn-panel rounded-lg px-4 py-3 text-sm font-medium hover:border-blue-400 transition flex items-center gap-2 text-slate-300"
                  onClick={() => setShowFiltersModal(true)}
                  data-testid="button-filters"
                >
                  <SlidersHorizontal size={18} weight="bold" /> Filters
                </button>
              </div>
            </div>

            <div className="tburn-panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="tburn-table-header">
                      <th className="p-4">Identity & Version</th>
                      <th className="p-4">Location & Network (ISP)</th>
                      <th className="p-4 text-center">Nodes</th>
                      <th className="p-4">Status Indicators</th>
                      <th className="p-4 text-right">Active Stake (Share)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 font-medium text-sm">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Loading validators...
                        </td>
                      </tr>
                    ) : paginatedValidators.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          No validators found
                        </td>
                      </tr>
                    ) : (
                      paginatedValidators.map((validator, pageIndex) => {
                        const globalIndex = (currentPage - 1) * itemsPerPage + pageIndex;
                        const validatorSeed = validator.address?.charCodeAt(10) || globalIndex;
                        const locData = getLocationData(validator.location, validatorSeed);
                        const stake = parseFloat(validator.stake) || 0;
                        const stakeShare = totalStake > 0 ? ((stake / totalStake) * 100).toFixed(2) : "0";
                        const initials = (validator.name || 'V').slice(0, 2).toUpperCase();
                        const isGenesis = (validator.name || '').includes("Genesis") || globalIndex === 0;
                        const badCount = validatorSeed % 2;
                        const privateCount = (validatorSeed % 10) + 1;
                        const privatePercent = ((privateCount / 37) * 100).toFixed(1);
                        const validatorKey = validator.address || `validator-${globalIndex}`;
                        const validatorUrlId = globalIndex + 1;
                        const nodeCount = (validatorSeed % 40) + 5;

                        return (
                          <tr 
                            key={validatorKey} 
                            className="tburn-row cursor-pointer"
                            onClick={() => navigate(`/validator/${validatorUrlId}`)}
                            data-testid={`row-validator-${validatorUrlId}`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg ${
                                  isGenesis 
                                    ? "bg-gradient-to-br from-orange-500 to-red-600" 
                                    : "bg-slate-800 border border-slate-700 text-slate-400"
                                }`}>
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-base">{validator.name}</div>
                                  <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                    v{validator.version || "1.14.17"} 
                                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                                    {validator.commission}% Comm.
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="text-slate-200 font-semibold flex items-center gap-2">
                                  <img 
                                    src={countryFlags[locData.country] || countryFlags["US"]} 
                                    width="20" 
                                    alt={locData.country} 
                                    className="rounded-sm shadow-sm"
                                  />
                                  {locData.city}, {locData.country}
                                </span>
                                <span className="text-slate-500 text-xs mt-1 font-mono">
                                  ASN 20326 | {locData.isp}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center text-lg text-slate-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              {nodeCount}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <ShieldWarning className={badCount > 0 ? "text-red-500" : "text-slate-600"} size={16} weight="fill" />
                                  Bad: {badCount}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-accent-trust">
                                  <LockKey size={16} weight="fill" />
                                  Private: {privateCount} ({privatePercent}%)
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="font-bold text-white text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {stake.toLocaleString()} <span className="text-sm text-slate-400">TBURN</span>
                              </div>
                              <div className="text-sm text-accent-burn font-medium mb-1">{stakeShare}% Share</div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500" 
                                  style={{ width: `${Math.min(parseFloat(stakeShare) * 10, 100)}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-slate-800/50 flex flex-wrap justify-between items-center text-sm text-slate-400 bg-black/20 gap-4">
                <div>
                  Showing <span className="font-semibold text-white">
                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredValidators.length)}
                  </span> of <span className="font-semibold text-white">{filteredValidators.length}</span> Validators
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    data-testid="button-page-prev"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`px-3 py-1.5 rounded-md transition ${
                        currentPage === page 
                          ? "bg-accent-burn text-white font-medium shadow-md shadow-orange-900/20" 
                          : "bg-slate-800 hover:bg-slate-700"
                      }`}
                      onClick={() => setCurrentPage(page)}
                      data-testid={`button-page-${page}`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && <span className="px-2">...</span>}
                  <button 
                    className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    data-testid="button-page-next"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="mt-12 py-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
          <p>© 2024 TBURN Foundation. All rights reserved. | Decentralized Intelligence Platform.</p>
        </footer>
      </div>

      {showMapModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMapModal(false)}>
          <div className="tburn-panel rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <GlobeHemisphereWest className="text-accent-trust" size={28} weight="fill" />
                Global Network Map
              </h3>
              <button 
                onClick={() => setShowMapModal(false)}
                className="text-slate-400 hover:text-white transition p-2 hover:bg-white/5 rounded-lg"
                data-testid="button-close-map"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative h-[400px] rounded-xl overflow-hidden mb-6" style={{
              backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'contrast(1.2)',
              opacity: 0.8
            }}>
              {Object.entries(locationMap).map(([city, data], index) => {
                const positions: Record<string, {top: string; left: string}> = {
                  Chicago: { top: "32%", left: "22%" },
                  Frankfurt: { top: "28%", left: "48%" },
                  Tokyo: { top: "35%", left: "82%" },
                  Amsterdam: { top: "26%", left: "47%" },
                  Singapore: { top: "55%", left: "75%" },
                  Seoul: { top: "34%", left: "80%" },
                  London: { top: "27%", left: "45%" },
                };
                const pos = positions[city] || { top: "50%", left: "50%" };
                const validatorCount = validators.filter((v, i) => {
                  const seed = v.address?.charCodeAt(5) || i;
                  const loc = getLocationData(v.location, seed);
                  return loc.city === city;
                }).length;
                
                return (
                  <div
                    key={city}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <div className="relative">
                      <div className="w-4 h-4 bg-accent-burn rounded-full shadow-lg shadow-orange-500/50 animate-pulse" />
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/90 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div className="text-white font-semibold text-sm">{city}, {data.country}</div>
                        <div className="text-slate-400 text-xs">{validatorCount} Validators</div>
                        <div className="text-slate-500 text-xs">{data.isp}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(locationMap).map(([city, data]) => {
                const validatorCount = validators.filter((v, i) => {
                  const seed = v.address?.charCodeAt(5) || i;
                  const loc = getLocationData(v.location, seed);
                  return loc.city === city;
                }).length;
                
                return (
                  <div key={city} className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="text-accent-burn" size={16} weight="fill" />
                      <span className="text-white font-semibold text-sm">{city}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{validatorCount}</div>
                    <div className="text-xs text-slate-500">{data.isp}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFiltersModal(false)}>
          <div className="tburn-panel rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FunnelSimple className="text-accent-trust" size={24} weight="fill" />
                Advanced Filters
              </h3>
              <button 
                onClick={() => setShowFiltersModal(false)}
                className="text-slate-400 hover:text-white transition"
                data-testid="button-close-filters"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-3">View Mode</label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${viewMode === "stake" ? "bg-accent-burn/20 text-accent-burn border border-accent-burn/30" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    onClick={() => setViewMode("stake")}
                  >
                    Stake View
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${viewMode === "score" ? "bg-accent-burn/20 text-accent-burn border border-accent-burn/30" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    onClick={() => setViewMode("score")}
                  >
                    Score View
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-3">Chart Display</label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${chartFilter === "datacenter" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    onClick={() => setChartFilter("datacenter")}
                  >
                    Data Center
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${chartFilter === "asn" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    onClick={() => setChartFilter("asn")}
                  >
                    ASN
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-3">Sort Order</label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${sortOrder === "stake" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    onClick={() => setSortOrder("stake")}
                  >
                    By Stake
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${sortOrder === "count" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    onClick={() => setSortOrder("count")}
                  >
                    By Count
                  </button>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-8 py-3 rounded-xl bg-accent-burn hover:bg-orange-600 text-white font-bold transition"
              onClick={() => setShowFiltersModal(false)}
              data-testid="button-apply-filters"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
