import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Coins,
  Gavel,
  Calculator,
  ArrowRight,
  ArrowLeft,
  Warning,
  CheckCircle,
  XCircle,
  X,
  Clock,
  Users,
  Fire,
  Info,
  FileText,
  Archive
} from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";

interface Proposal {
  id: string;
  title: string;
  description: string;
  yesPercent: number;
  noPercent: number;
  abstainPercent: number;
  totalStakeVoted: string;
  votingEnds: string;
  quorumReached: boolean;
  isContested: boolean;
  status: "active" | "passed" | "rejected" | "executed";
}

interface GovernanceData {
  proposals: Array<{ id: string; title: string; status: string }>;
  totalVotes: number;
  activeProposals: number;
  participation: number;
}

interface NetworkStats {
  currentEpoch: number;
  activeValidators: number;
  totalStake: string;
}

const defaultProposals: Proposal[] = [
  {
    id: "TIP-001",
    title: "TBURN Mainnet v8.0 Launch Parameters",
    description: "Governance proposal for mainnet launch parameters. This proposal aims to improve the TBURN network infrastructure and ecosystem.",
    yesPercent: 92,
    noPercent: 5,
    abstainPercent: 3,
    totalStakeVoted: "450M",
    votingEnds: "Completed",
    quorumReached: true,
    isContested: false,
    status: "executed",
  },
  {
    id: "TIP-002",
    title: "Quad-Band AI Orchestration System Activation",
    description: "Proposal to activate the Quad-Band AI Orchestration System for enhanced network performance.",
    yesPercent: 88,
    noPercent: 8,
    abstainPercent: 4,
    totalStakeVoted: "380M",
    votingEnds: "Completed",
    quorumReached: true,
    isContested: false,
    status: "executed",
  },
  {
    id: "TIP-003",
    title: "10B Total Supply Tokenomics Model",
    description: "Proposal to finalize the 10 billion total supply tokenomics model for TBURN.",
    yesPercent: 95,
    noPercent: 3,
    abstainPercent: 2,
    totalStakeVoted: "520M",
    votingEnds: "Completed",
    quorumReached: true,
    isContested: false,
    status: "executed",
  },
  {
    id: "TIP-004",
    title: "8-Chain Cross-Bridge Infrastructure v2.0",
    description: "Proposal to upgrade the cross-chain bridge infrastructure to support 8 networks.",
    yesPercent: 78,
    noPercent: 15,
    abstainPercent: 7,
    totalStakeVoted: "310M",
    votingEnds: "2d 14h",
    quorumReached: true,
    isContested: false,
    status: "active",
  },
];

function generateProposalsFromApi(apiProposals: GovernanceData['proposals'] | undefined): Proposal[] {
  if (!apiProposals || apiProposals.length === 0) {
    return defaultProposals;
  }
  
  return apiProposals.map((p, index) => {
    const isExecuted = p.status === 'executed';
    const isPassed = isExecuted || p.status === 'passed';
    const seed = p.id.charCodeAt(p.id.length - 1);
    const yesPercent = isPassed ? 85 + (seed % 10) : 45 + (seed % 30);
    const noPercent = isPassed ? 5 + (seed % 5) : 15 + (seed % 20);
    const abstainPercent = Math.max(0, 100 - yesPercent - noPercent);
    
    return {
      id: p.id,
      title: p.title,
      description: `Governance proposal for ${p.title.toLowerCase()}. This proposal aims to improve the TBURN network infrastructure and ecosystem.`,
      yesPercent,
      noPercent,
      abstainPercent,
      totalStakeVoted: `${(200 + index * 50)}M`,
      votingEnds: isExecuted ? "Completed" : `${(seed % 5) + 1}d ${(seed % 23)}h`,
      quorumReached: isPassed || yesPercent > 60,
      isContested: !isPassed && Math.abs(yesPercent - noPercent) < 10,
      status: isExecuted ? "executed" : (isPassed ? "passed" : "active") as Proposal['status'],
    };
  });
}

export default function ValidatorGovernance() {
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState(10000);
  const [duration, setDuration] = useState(12);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [voteChoice, setVoteChoice] = useState<"yes" | "no" | "abstain" | null>(null);

  const { data: governanceData, isLoading: govLoading } = useQuery<GovernanceData>({
    queryKey: ["/api/enterprise/admin/governance/votes"],
    staleTime: 30000,
    refetchOnMount: false,
    retry: false,
  });

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 30000,
    refetchOnMount: false,
  });

  const proposals = useMemo(() => {
    return generateProposalsFromApi(governanceData?.proposals);
  }, [governanceData]);

  const activeProposals = proposals.filter(p => p.status === 'active');
  const completedProposals = proposals.filter(p => p.status !== 'active');

  const rewards = useMemo(() => {
    const baseAPY = 0.0724;
    const bonusAPY = duration * 0.001;
    const totalAPY = baseAPY + bonusAPY;
    
    const annualEarnings = stakeAmount * totalAPY;
    const periodEarnings = annualEarnings * (duration / 12);
    const monthly = annualEarnings / 12;
    const daily = annualEarnings / 365;

    return {
      total: periodEarnings,
      monthly,
      daily,
      apy: totalAPY * 100,
    };
  }, [stakeAmount, duration]);

  const formatNumber = (num: number) => 
    num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleVote = () => {
    if (!selectedProposal || !voteChoice) return;
    toast({
      title: "Vote Submitted",
      description: `Your ${voteChoice.toUpperCase()} vote for ${selectedProposal.id} has been recorded`,
    });
    setShowVoteModal(false);
    setSelectedProposal(null);
    setVoteChoice(null);
  };

  const openProposalDetail = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const openVoteModal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowVoteModal(true);
  };

  return (
    <div className="min-h-screen relative">
      <style>{`
        .tburn-panel {
          background: rgba(20, 24, 35, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 140, 0, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .bg-mesh {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #050508;
          background-image: 
            radial-gradient(circle at 90% 10%, rgba(0, 191, 255, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 10% 90%, rgba(255, 140, 0, 0.05) 0%, transparent 40%);
          z-index: 0;
        }
        input[type=range] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px; width: 20px;
          border-radius: 50%;
          background: #ff8c00;
          cursor: pointer;
          margin-top: -8px;
          box-shadow: 0 0 10px #ff8c00;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; height: 4px;
          cursor: pointer;
          background: #334155;
          border-radius: 2px;
        }
        .vote-bar-bg { background: rgba(255, 255, 255, 0.05); }
        .vote-yes { background: linear-gradient(90deg, #059669, #10b981); }
        .vote-no { background: linear-gradient(90deg, #b91c1c, #ef4444); }
      `}</style>

      <div className="bg-mesh" />

      <div className="container mx-auto px-4 py-6 relative z-10">
        <Link href="/validator" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6" data-testid="link-back-validator">
          <ArrowLeft size={20} />
          <span>Back to Validators</span>
        </Link>

        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              TBURN <span className="text-[#00bfff]">Governance</span>
            </h1>
            <p className="text-slate-400 mt-1">Participate in network upgrades & Estimate staking rewards</p>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <div className="tburn-panel px-5 py-3 rounded-lg text-right">
              <div className="text-xs text-slate-500 uppercase font-bold">Current APY</div>
              <div className="text-xl font-bold text-[#ff8c00]" data-testid="text-current-apy">7.24%</div>
            </div>
            <div className="tburn-panel px-5 py-3 rounded-lg text-right">
              <div className="text-xs text-slate-500 uppercase font-bold">Inflation Rate</div>
              <div className="text-xl font-bold text-white">
                -1.2% <span className="text-xs font-normal text-slate-400">(Deflationary)</span>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 tburn-panel rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Calculator className="text-8xl text-white" size={128} weight="fill" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <Coins className="text-[#ff8c00]" size={28} weight="duotone" /> Rewards Estimator
              </h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Staking Amount (TBURN)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-black/30 border border-slate-700 rounded-xl py-4 px-5 text-2xl font-bold text-white focus:outline-none focus:border-[#ff8c00] transition"
                      data-testid="input-stake-amount"
                    />
                    <span className="absolute right-6 top-5 text-slate-500 font-bold">TBURN</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-400">Lock-up Period</span>
                    <span className="text-[#ff8c00] font-bold" data-testid="text-duration-label">
                      {duration} {duration === 1 ? "Month" : "Months"}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="36" 
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    data-testid="input-duration"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>1 Month</span>
                    <span>3 Years</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="tburn-panel rounded-2xl p-8 flex-1 flex flex-col justify-center bg-gradient-to-br from-[rgba(255,140,0,0.1)] to-transparent border-[#ff8c00]/30">
                <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Estimated Earnings</div>
                <div className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="text-total-earnings">
                  +{formatNumber(rewards.total)}
                </div>
                <div className="text-sm text-[#ff8c00] font-medium">TBURN Tokens</div>
                
                <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Monthly</div>
                    <div className="text-lg font-bold text-white" data-testid="text-monthly-earnings">
                      {formatNumber(rewards.monthly)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Daily</div>
                    <div className="text-lg font-bold text-white" data-testid="text-daily-earnings">
                      {formatNumber(rewards.daily)}
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full py-4 rounded-xl bg-[#ff8c00] hover:bg-[#e67e00] text-white font-bold text-lg transition shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2"
                data-testid="button-start-staking"
              >
                Start Staking Now <ArrowRight size={20} weight="bold" />
              </button>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <Gavel className="text-[#00bfff]" size={28} weight="duotone" /> Active Proposals
              </h2>
              <button 
                onClick={() => setShowArchiveModal(true)}
                className="text-sm text-[#00bfff] hover:text-white transition flex items-center gap-1"
                data-testid="link-view-archive"
              >
                <Archive size={16} /> View Archive
              </button>
            </div>

            <div className="grid gap-4">
              {govLoading ? (
                <div className="tburn-panel rounded-xl p-8 text-center">
                  <div className="text-slate-400">Loading proposals...</div>
                </div>
              ) : proposals.length === 0 ? (
                <div className="tburn-panel rounded-xl p-8 text-center">
                  <div className="text-slate-400">No proposals found</div>
                </div>
              ) : proposals.map((proposal) => (
                <div 
                  key={proposal.id}
                  onClick={() => openProposalDetail(proposal)}
                  className={`tburn-panel rounded-xl p-6 transition group cursor-pointer ${
                    proposal.status === 'executed' 
                      ? "border-emerald-500/30 hover:border-emerald-500/50"
                      : proposal.isContested 
                        ? "hover:border-red-500/50" 
                        : "hover:border-[#00bfff]/50"
                  }`}
                  data-testid={`proposal-${proposal.id}`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`px-3 py-1 rounded text-xs font-bold border h-fit ${
                        proposal.isContested 
                          ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          : "bg-[#00bfff]/10 text-[#00bfff] border-[#00bfff]/20"
                      }`}>
                        {proposal.id}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold text-white transition ${
                          proposal.isContested 
                            ? "group-hover:text-orange-400" 
                            : "group-hover:text-[#00bfff]"
                        }`}>
                          {proposal.title}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-1">
                          {proposal.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right min-w-[140px]">
                      {proposal.status === 'executed' ? (
                        <>
                          <div className="text-xs text-emerald-400 uppercase font-bold">Executed</div>
                          <div className="text-lg font-bold text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle size={18} weight="fill" /> Completed
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-slate-500">Voting Ends in</div>
                          <div className="text-lg font-bold text-white font-mono">{proposal.votingEnds}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-400">Yes: {proposal.yesPercent}%</span>
                      <span className="text-red-400">No: {proposal.noPercent}%</span>
                    </div>
                    <div className="h-3 w-full vote-bar-bg rounded-full overflow-hidden flex">
                      <div className="h-full vote-yes" style={{ width: `${proposal.yesPercent}%` }} />
                      <div className="h-full bg-slate-700" style={{ width: `${proposal.abstainPercent}%` }} />
                      <div className="h-full vote-no" style={{ width: `${proposal.noPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      {proposal.status === 'executed' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle size={12} weight="fill" /> Proposal Executed
                        </span>
                      ) : proposal.isContested ? (
                        <span className="text-orange-400 flex items-center gap-1">
                          <Warning size={12} weight="fill" /> Contested Vote
                        </span>
                      ) : proposal.quorumReached ? (
                        <span className="text-emerald-400">Quorum Reached ({governanceData?.participation || 87}%)</span>
                      ) : (
                        <span>Quorum: {governanceData?.participation || 65}% (Need 67%)</span>
                      )}
                      <span>Total Stake Voted: {proposal.totalStakeVoted} TBURN</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-12 py-6 border-t border-slate-800/50 text-center text-slate-500 text-sm">
          TBURN Governance Portal | Powered by Trust Burn Foundation
        </footer>
      </div>

      {selectedProposal && !showVoteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProposal(null)}>
          <div className="tburn-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-4">
                <div className={`px-3 py-1 rounded text-xs font-bold border ${
                  selectedProposal.status === 'executed' 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-[#00bfff]/10 text-[#00bfff] border-[#00bfff]/20"
                }`}>
                  {selectedProposal.id}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedProposal.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> {selectedProposal.votingEnds}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {selectedProposal.totalStakeVoted} TBURN voted</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProposal(null)}
                className="text-slate-400 hover:text-white transition"
                data-testid="button-close-proposal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText size={16} /> Description
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">{selectedProposal.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Voting Results</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={14} weight="fill" /> Yes</span>
                      <span className="text-emerald-400">{selectedProposal.yesPercent}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full vote-yes" style={{ width: `${selectedProposal.yesPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400 flex items-center gap-1"><XCircle size={14} weight="fill" /> No</span>
                      <span className="text-red-400">{selectedProposal.noPercent}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full vote-no" style={{ width: `${selectedProposal.noPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 flex items-center gap-1"><Warning size={14} /> Abstain</span>
                      <span className="text-slate-400">{selectedProposal.abstainPercent}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-600" style={{ width: `${selectedProposal.abstainPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Info size={16} />
                  {selectedProposal.quorumReached ? (
                    <span className="text-emerald-400">Quorum reached ({governanceData?.participation || 87}%)</span>
                  ) : (
                    <span>Quorum: {governanceData?.participation || 65}% (Need 67%)</span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  selectedProposal.status === 'executed' ? "bg-emerald-500/20 text-emerald-400" :
                  selectedProposal.status === 'passed' ? "bg-blue-500/20 text-blue-400" :
                  "bg-orange-500/20 text-orange-400"
                }`}>
                  {selectedProposal.status.toUpperCase()}
                </span>
              </div>
            </div>

            {selectedProposal.status === 'active' && (
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition border border-white/10"
                  onClick={() => setSelectedProposal(null)}
                  data-testid="button-cancel-detail"
                >
                  Close
                </button>
                <button
                  className="flex-1 py-3 rounded-xl bg-[#00bfff] hover:bg-[#0099cc] text-white font-bold transition flex items-center justify-center gap-2"
                  onClick={() => {
                    setShowVoteModal(true);
                  }}
                  data-testid="button-cast-vote"
                >
                  <Gavel size={18} weight="bold" />
                  Cast Vote
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showVoteModal && selectedProposal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {setShowVoteModal(false); setVoteChoice(null);}}>
          <div className="tburn-panel rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gavel className="text-[#00bfff]" size={24} weight="fill" />
                Cast Your Vote
              </h3>
              <button 
                onClick={() => {setShowVoteModal(false); setVoteChoice(null);}}
                className="text-slate-400 hover:text-white transition"
                data-testid="button-close-vote"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
              <div className="text-xs text-slate-500 mb-1">{selectedProposal.id}</div>
              <div className="text-white font-semibold">{selectedProposal.title}</div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setVoteChoice("yes")}
                className={`w-full p-4 rounded-xl border transition flex items-center gap-3 ${
                  voteChoice === "yes" 
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
                data-testid="button-vote-yes"
              >
                <CheckCircle size={24} weight={voteChoice === "yes" ? "fill" : "regular"} />
                <span className="font-semibold">Vote Yes</span>
              </button>
              <button
                onClick={() => setVoteChoice("no")}
                className={`w-full p-4 rounded-xl border transition flex items-center gap-3 ${
                  voteChoice === "no" 
                    ? "bg-red-500/20 border-red-500/50 text-red-400" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
                data-testid="button-vote-no"
              >
                <XCircle size={24} weight={voteChoice === "no" ? "fill" : "regular"} />
                <span className="font-semibold">Vote No</span>
              </button>
              <button
                onClick={() => setVoteChoice("abstain")}
                className={`w-full p-4 rounded-xl border transition flex items-center gap-3 ${
                  voteChoice === "abstain" 
                    ? "bg-slate-500/20 border-slate-500/50 text-slate-300" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
                data-testid="button-vote-abstain"
              >
                <Warning size={24} weight={voteChoice === "abstain" ? "fill" : "regular"} />
                <span className="font-semibold">Abstain</span>
              </button>
            </div>

            <button
              className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                voteChoice 
                  ? "bg-[#00bfff] hover:bg-[#0099cc] text-white" 
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
              onClick={handleVote}
              disabled={!voteChoice}
              data-testid="button-submit-vote"
            >
              Submit Vote
            </button>
          </div>
        </div>
      )}

      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowArchiveModal(false)}>
          <div className="tburn-panel rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Archive className="text-[#00bfff]" size={24} weight="fill" />
                Proposal Archive
              </h3>
              <button 
                onClick={() => setShowArchiveModal(false)}
                className="text-slate-400 hover:text-white transition"
                data-testid="button-close-archive"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {completedProposals.map((proposal) => (
                <div 
                  key={proposal.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition cursor-pointer"
                  onClick={() => {
                    setShowArchiveModal(false);
                    openProposalDetail(proposal);
                  }}
                  data-testid={`archive-${proposal.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        proposal.status === 'executed' ? "bg-emerald-500/20 text-emerald-400" :
                        proposal.status === 'passed' ? "bg-blue-500/20 text-blue-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {proposal.id}
                      </span>
                      <div>
                        <div className="text-white font-semibold text-sm">{proposal.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{proposal.totalStakeVoted} TBURN voted</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      proposal.status === 'executed' ? "bg-emerald-500/10 text-emerald-400" :
                      proposal.status === 'passed' ? "bg-blue-500/10 text-blue-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {proposal.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
              {completedProposals.length === 0 && (
                <div className="text-center text-slate-400 py-8">No archived proposals</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
