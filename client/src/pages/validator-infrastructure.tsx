import { useState, useMemo } from "react";
import { Link } from "wouter";
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
  ArrowLeft
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

const countryData = [
  { name: "Germany", value: 25, color: "#ff8c00" },
  { name: "United States", value: 23, color: "#ff4500" },
  { name: "Netherlands", value: 18, color: "#00bfff" },
  { name: "Lithuania", value: 10, color: "#1e90ff" },
  { name: "UK", value: 8, color: "#6a0dad" },
  { name: "Other", value: 16, color: "#475569" },
];

const orgData = [
  { name: "TeraSwitch", value: 35, color: "#ff8c00" },
  { name: "Cherry Servers", value: 20, color: "#ff6347" },
  { name: "Amazon AWS", value: 10, color: "#00ced1" },
  { name: "Latitude.sh", value: 10, color: "#4682b4" },
  { name: "ALLNODES", value: 5, color: "#9370db" },
  { name: "Other", value: 20, color: "#475569" },
];

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

function getLocationData(location?: string) {
  if (!location) {
    const keys = Object.keys(locationMap);
    const key = keys[Math.floor(Math.random() * keys.length)];
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"stake" | "score">("stake");
  const itemsPerPage = 10;

  const { data: validatorsData, isLoading } = useQuery<{ validators: Validator[] }>({
    queryKey: ["/api/validators"],
    staleTime: 30000,
    refetchOnMount: false,
  });

  const validators = validatorsData?.validators || [];
  const totalStake = validators.reduce((sum, v) => sum + parseFloat(v.stake), 0);

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
              <button className="tburn-panel rounded-full px-5 py-2 text-sm font-medium hover:border-accent-burn transition flex items-center gap-2" data-testid="button-global-network-map">
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
              <button className="px-4 py-2 rounded-full bg-accent-burn/90 text-white text-sm font-medium shadow-lg shadow-orange-900/30" data-testid="button-filter-datacenter">
                Data Center
              </button>
              <button className="px-4 py-2 rounded-full hover:bg-slate-800 text-slate-300 text-sm font-medium transition" data-testid="button-filter-asn">
                ASN Filter
              </button>
              <div className="w-px h-6 bg-slate-700/50 my-auto mx-2" />
              <button className="px-4 py-2 rounded-full hover:bg-slate-800 text-slate-300 text-sm font-medium transition flex items-center gap-1" data-testid="button-sort-stake">
                <SortDescending size={16} weight="bold" /> Sort by Stake
              </button>
              <button className="px-4 py-2 rounded-full hover:bg-slate-800 text-slate-300 text-sm font-medium transition flex items-center gap-1" data-testid="button-sort-count">
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
                <button className="tburn-panel rounded-lg px-4 py-3 text-sm font-medium hover:border-blue-400 transition flex items-center gap-2 text-slate-300" data-testid="button-filters">
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
                      paginatedValidators.map((validator, index) => {
                        const locData = getLocationData(validator.location);
                        const stake = parseFloat(validator.stake);
                        const stakeShare = totalStake > 0 ? ((stake / totalStake) * 100).toFixed(2) : "0";
                        const initials = validator.name.slice(0, 2).toUpperCase();
                        const isGenesis = validator.name.includes("Genesis") || index === 0;
                        const badCount = Math.floor(Math.random() * 2);
                        const privateCount = Math.floor(Math.random() * 10);
                        const privatePercent = ((privateCount / 37) * 100).toFixed(1);

                        return (
                          <tr 
                            key={validator.id} 
                            className="tburn-row cursor-pointer"
                            data-testid={`row-validator-${validator.id}`}
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
                              {Math.floor(Math.random() * 40) + 5}
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
    </div>
  );
}
