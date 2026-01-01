import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip } from 'chart.js';
import { 
  ArrowLeft, 
  Copy, 
  Heartbeat, 
  GitCommit, 
  WarningOctagon, 
  ArrowsLeftRight,
  Cpu,
  ArrowSquareOut,
  UserFocus,
  CheckCircle
} from "@phosphor-icons/react";
import { useState } from "react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

interface ValidatorDetailData {
  id: string;
  name: string;
  description: string;
  stake: number;
  commission: number;
  version: string;
  location: string;
  identityKey: string;
  voteAccount: string;
  asn: string;
  ipAddress: string;
  software: string;
  createdAt: string;
  totalScore: number;
  reviewCount: number;
}

const staticValidatorDetails: Record<string, ValidatorDetailData> = {
  'val-1': {
    id: 'val-1',
    name: 'TBURN_Genesis_01',
    description: 'Get more TBURN with 3 revenue streams! Staking + Jito MEV + Triton One PTC rev share. Experienced validator located in Boulder, CO.',
    stake: 36468183,
    commission: 5,
    version: 'v1.14.17',
    location: 'Chicago, US',
    identityKey: 'DDnAqxJVFo2GVTujibHt5cjevHMSE9bo8HJaydHoshdp',
    voteAccount: '9GJmEHGom9eWo4np4L5vC6b6ri1Df2xN8KFoWixvD1Bs',
    asn: 'ASN 20326',
    ipAddress: '64.130.43.210',
    software: 'AgaveBam',
    createdAt: '2024-01-15',
    totalScore: 5,
    reviewCount: 13,
  },
  'val-2': {
    id: 'val-2',
    name: 'AllNodes_Secure',
    description: 'Enterprise-grade validator infrastructure with 99.99% uptime guarantee. Multi-region redundancy with automatic failover.',
    stake: 25043993,
    commission: 0,
    version: 'v1.14.17',
    location: 'Frankfurt, DE',
    identityKey: 'HJk42xmL98nVFo2GTujibHt5cjevHMSE9bo8HJaydHp2',
    voteAccount: 'A8FmEHGom9eWo4np4L5vC6b6ri1Df2xN8KFoWixvD2Cs',
    asn: 'ASN 20326',
    ipAddress: '185.177.23.45',
    software: 'TBurnCore',
    createdAt: '2024-02-20',
    totalScore: 5,
    reviewCount: 8,
  },
  'val-3': {
    id: 'val-3',
    name: 'Latitude_Tokyo_Node',
    description: 'High-performance validator optimized for Asian markets. Low latency connections to major exchanges.',
    stake: 15663731,
    commission: 8,
    version: 'v1.13.5',
    location: 'Tokyo, JP',
    identityKey: 'BP28xkVFo2GVTujibHt5cjevHMSE9bo8HJaydHoshdq',
    voteAccount: 'B7GmEHGom9eWo4np4L5vC6b6ri1Df2xN8KFoWixvD3Dt',
    asn: 'ASN 20326',
    ipAddress: '203.104.42.89',
    software: 'TBurnCore',
    createdAt: '2024-03-10',
    totalScore: 4,
    reviewCount: 5,
  },
};

const generateChartData = (points: number, baseValue: number, variance: number) => {
  return Array.from({ length: points }, () => Math.random() * variance + baseValue);
};

const latencyChartData = {
  labels: Array.from({ length: 50 }, (_, i) => i),
  datasets: [{
    data: generateChartData(50, 1.0, 0.4),
    borderColor: '#ff4545',
    backgroundColor: 'rgba(255, 69, 69, 0.1)',
    fill: true,
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 0,
  }]
};

const rootChartData = {
  labels: Array.from({ length: 40 }, (_, i) => i),
  datasets: [{
    data: [0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
    borderColor: '#ff8c00',
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    fill: true,
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 0,
  }]
};

const skippedChartData = {
  labels: Array.from({ length: 20 }, (_, i) => i),
  datasets: [{
    data: [0.2, 0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2, 0.2, 0.3, 0.3, 0.2, 0.2, 0.3, 0.2, 0.2],
    backgroundColor: '#eab308',
    borderRadius: 2,
  }]
};

const voteDistChartData = {
  labels: Array.from({ length: 40 }, (_, i) => i),
  datasets: [{
    data: [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0.5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    borderColor: '#00bfff',
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    fill: true,
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 0,
  }]
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { display: false },
    y: { 
      grid: { color: 'rgba(255,255,255,0.02)' },
      ticks: { color: '#64748b', font: { size: 10 } }
    }
  },
  elements: {
    point: { radius: 0, hitRadius: 10, hoverRadius: 4 },
    line: { tension: 0.3, borderWidth: 2 }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { display: false },
    y: { 
      grid: { color: 'rgba(255,255,255,0.02)' },
      ticks: { color: '#64748b', font: { size: 10 } }
    }
  }
};

const recentProduction = [
  { epoch: 903, time: '14:44:33 UTC', blocks: 108, total: 108, status: 'PERFECT' },
  { epoch: 903, time: '14:40:47 UTC', blocks: 108, total: 108, status: 'PERFECT' },
  { epoch: 903, time: '14:35:12 UTC', blocks: 106, total: 108, status: 'SKIPPED 2' },
];

export default function ValidatorIntelligence() {
  const params = useParams<{ id: string }>();
  const validatorId = params.id || 'val-1';
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const validator = staticValidatorDetails[validatorId] || staticValidatorDetails['val-1'];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20" style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#050508',
      backgroundImage: 'linear-gradient(180deg, rgba(5, 5, 8, 0) 0%, #050508 100%), radial-gradient(circle at 50% 0%, rgba(0, 191, 255, 0.08) 0%, transparent 50%)',
      color: '#cbd5e1'
    }}>
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
      `}</style>

      <nav className="max-w-[1600px] mx-auto mb-8 flex items-center justify-between">
        <Link href="/validator" className="flex items-center gap-2 text-slate-400 hover:text-white transition group" data-testid="link-back-to-validator">
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 border border-white/5">
            <ArrowLeft size={16} weight="bold" />
          </div>
          <span className="text-sm font-medium">Back to Validator Matrix</span>
        </Link>
        <div className="flex gap-3">
          <span className="px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-mono flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> OPERATIONAL
          </span>
          <span className="px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono">
            EPOCH 903
          </span>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-6">
          <div className="tburn-glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 border border-white/10 flex items-center justify-center shadow-2xl text-white text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {validator.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#050508] p-1 rounded-full">
                  <div className="status-beacon" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="validator-name">
                    {validator.name} <span className="text-slate-500 font-light text-xl">+MEV +Triton</span>
                  </h1>
                  <CheckCircle size={20} weight="fill" className="text-cyan-400" />
                </div>
                <p className="text-slate-400 text-sm max-w-2xl mb-4 leading-relaxed">
                  {validator.description}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Total Score</span>
                    <span className="text-lg font-bold text-orange-500">{'★'.repeat(validator.totalScore)} ({validator.reviewCount})</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Commission</span>
                    <span className="text-lg font-bold text-white">{validator.commission}% <span className="text-xs text-slate-500 font-normal">+ 2% Jito</span></span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Active Stake</span>
                    <span className="text-lg font-bold text-white" data-testid="validator-stake">{formatNumber(validator.stake)} <span className="text-xs text-orange-500">TBURN</span></span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Version</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono">{validator.version}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="tburn-glass rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Heartbeat size={16} weight="bold" className="text-red-500" /> Vote Latency
                </h3>
                <span className="text-xs font-mono text-slate-500">Last 6h</span>
              </div>
              <div className="h-40">
                <Line data={latencyChartData} options={lineChartOptions} />
              </div>
            </div>

            <div className="tburn-glass rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <GitCommit size={16} weight="bold" className="text-orange-500" /> Root Distance
                </h3>
                <span className="text-xs font-mono text-slate-500">Block Diff</span>
              </div>
              <div className="h-40">
                <Line data={rootChartData} options={lineChartOptions} />
              </div>
            </div>

            <div className="tburn-glass rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <WarningOctagon size={16} weight="bold" className="text-yellow-400" /> Skipped Slots %
                </h3>
                <span className="text-xs font-mono text-slate-500">Moving Avg</span>
              </div>
              <div className="h-40">
                <Bar data={skippedChartData} options={barChartOptions} />
              </div>
            </div>

            <div className="tburn-glass rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <ArrowsLeftRight size={16} weight="bold" className="text-cyan-400" /> Vote Distance
                </h3>
                <span className="text-xs font-mono text-slate-500">Vote Diff</span>
              </div>
              <div className="h-40">
                <Line data={voteDistChartData} options={lineChartOptions} />
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-6">
          <div className="tburn-glass rounded-2xl overflow-hidden">
            <div className="tburn-card-header p-4 flex items-center justify-between">
              <h3 className="font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Node Specifications</h3>
              <Cpu size={20} weight="duotone" className="text-slate-500" />
            </div>
            <div className="p-5 space-y-6">
              <div>
                <div className="data-label">Identity Key</div>
                <div className="flex items-center justify-between group">
                  <span className="data-value font-mono text-xs text-cyan-400 truncate max-w-[200px]" data-testid="identity-key">{validator.identityKey}</span>
                  <button 
                    onClick={() => copyToClipboard(validator.identityKey, 'identity')}
                    className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-cyan-400"
                    data-testid="button-copy-identity"
                  >
                    <Copy size={14} weight="bold" />
                  </button>
                </div>
                {copiedField === 'identity' && <span className="text-xs text-green-400">Copied!</span>}
              </div>
              <div>
                <div className="data-label">Vote Account</div>
                <div className="flex items-center justify-between group">
                  <span className="data-value font-mono text-xs truncate max-w-[200px]">{validator.voteAccount}</span>
                  <button 
                    onClick={() => copyToClipboard(validator.voteAccount, 'vote')}
                    className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-cyan-400"
                  >
                    <Copy size={14} weight="bold" />
                  </button>
                </div>
                {copiedField === 'vote' && <span className="text-xs text-green-400">Copied!</span>}
              </div>
              
              <div className="h-px bg-white/5" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="data-label">Data Center</div>
                  <div className="data-value text-sm">{validator.location}</div>
                  <div className="text-xs text-slate-500 font-mono mt-1">{validator.asn}</div>
                </div>
                <div>
                  <div className="data-label">IP Address</div>
                  <div className="data-value text-sm font-mono">{validator.ipAddress}</div>
                </div>
                <div>
                  <div className="data-label">Software</div>
                  <div className="data-value text-sm">{validator.software}</div>
                </div>
                <div>
                  <div className="data-label">Creation</div>
                  <div className="data-value text-sm">{validator.createdAt}</div>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group border border-transparent hover:border-white/10">
                  <span className="text-sm text-slate-300">Validator Website</span>
                  <ArrowSquareOut size={16} weight="bold" className="text-slate-500 group-hover:text-white" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group border border-transparent hover:border-white/10">
                  <span className="text-sm text-slate-300">Keybase Profile</span>
                  <UserFocus size={16} weight="bold" className="text-slate-500 group-hover:text-white" />
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
                  {recentProduction.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="p-3 pl-5">
                        <div className="font-mono text-white">{prod.epoch}</div>
                        <div className="text-[10px] text-slate-500">{prod.time}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-mono ${prod.blocks === prod.total ? 'text-slate-300' : 'text-yellow-500'}`}>{prod.blocks}</span>
                        <span className="text-slate-600">/ {prod.total}</span>
                      </td>
                      <td className="p-3 text-right pr-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          prod.status === 'PERFECT' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {prod.status}
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
  );
}
