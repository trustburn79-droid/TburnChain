import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  Coins, 
  Gavel, 
  Calculator,
  ArrowRight,
  Warning,
  ArrowLeft,
  CircleNotch,
  House
} from "@phosphor-icons/react";
import { type ValidatorDisplayData, transformValidator, type ValidatorData } from "@/lib/validator-utils";
import { TBurnLogo } from "@/components/tburn-logo";
import { LanguageSelector } from "@/components/LanguageSelector";

interface Proposal {
  id: string;
  title: string;
  description: string;
  yesPercent: number;
  noPercent: number;
  abstainPercent: number;
  totalStake: string;
  votingEnds: string;
  status: 'active' | 'contested' | 'passed' | 'rejected';
  quorumReached: boolean;
  currentQuorum: number;
}

interface ValidatorApiResponse {
  validators: ValidatorData[];
}

interface ValidatorStatsResponse {
  totalValidators: number;
  activeValidators: number;
  avgUptime: number;
}

interface NetworkStats {
  tps: number;
  currentBlockHeight: number;
  activeValidators: number;
  totalValidators: number;
  stakedAmount: string;
  stakedPercent: number;
}

export default function ValidatorGovernance() {
  const { t } = useTranslation();

  const proposals: Proposal[] = useMemo(() => [
    {
      id: 'TGP-42',
      title: t('validatorPage.governancePage.proposal1Title', { defaultValue: 'v1.15.0 Mainnet Upgrade (Performance Patch)' }),
      description: t('validatorPage.governancePage.proposal1Description', { defaultValue: 'Proposes to upgrade the network to v1.15.0 to increase TPS limit and fix minor block synchronization issues.' }),
      yesPercent: 82,
      noPercent: 5,
      abstainPercent: 13,
      totalStake: t('validatorPage.governancePage.proposal1TotalStake', { defaultValue: '360M TBURN' }),
      votingEnds: t('validatorPage.governancePage.proposal1VotingEnds', { defaultValue: '14h 32m' }),
      status: 'active' as const,
      quorumReached: true,
      currentQuorum: 87,
    },
    {
      id: 'TGP-43',
      title: t('validatorPage.governancePage.proposal2Title', { defaultValue: 'Adjust Minimum Staking Requirement' }),
      description: t('validatorPage.governancePage.proposal2Description', { defaultValue: 'Proposal to lower the minimum validator self-stake from 50k TBURN to 30k TBURN to encourage decentralization.' }),
      yesPercent: 45,
      noPercent: 48,
      abstainPercent: 7,
      totalStake: t('validatorPage.governancePage.proposal2TotalStake', { defaultValue: '210M TBURN' }),
      votingEnds: t('validatorPage.governancePage.proposal2VotingEnds', { defaultValue: '2d 04h' }),
      status: 'contested' as const,
      quorumReached: false,
      currentQuorum: 62,
    },
  ], [t]);
  const [stakeAmount, setStakeAmount] = useState(10000);
  const [duration, setDuration] = useState(12);
  const [earnings, setEarnings] = useState({ total: 0, monthly: 0, daily: 0 });

  const { data: validatorResponse, isLoading: validatorsLoading } = useQuery<ValidatorApiResponse>({
    queryKey: ["/api/validators"],
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const { data: statsResponse } = useQuery<ValidatorStatsResponse>({
    queryKey: ["/api/validators/stats"],
    staleTime: 30000,
  });

  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const validators: ValidatorDisplayData[] = useMemo(() => {
    if (!validatorResponse?.validators) return [];
    const rawValidators = validatorResponse.validators;
    const totalStake = rawValidators.reduce((sum, v) => sum + parseFloat(v.stake || '0'), 0);
    return rawValidators.map(v => transformValidator(v, totalStake));
  }, [validatorResponse]);

  const totalStaked = useMemo(() => {
    return validators.reduce((sum, v) => sum + v.stake, 0);
  }, [validators]);

  const realTotalValidators = networkStats?.totalValidators || statsResponse?.totalValidators || validators.length || 1600;
  const realActiveValidators = networkStats?.activeValidators || statsResponse?.activeValidators || 1600;
  const realStakedAmount = networkStats?.stakedAmount ? parseFloat(networkStats.stakedAmount) : totalStaked;
  const stakedPercent = networkStats?.stakedPercent || 32;
  const averageAPY = 7.24 + (stakedPercent < 30 ? 1.5 : stakedPercent > 40 ? -0.5 : 0);

  useEffect(() => {
    calculateRewards();
  }, [stakeAmount, duration]);

  const calculateRewards = () => {
    const baseAPY = 0.0724;
    const bonusAPY = duration * 0.001;
    const totalAPY = baseAPY + bonusAPY;
    
    const annualEarnings = stakeAmount * totalAPY;
    const periodEarnings = annualEarnings * (duration / 12);
    
    const monthly = annualEarnings / 12;
    const daily = annualEarnings / 365;

    setEarnings({
      total: periodEarnings,
      monthly,
      daily
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const topValidators = useMemo(() => {
    return [...validators].sort((a, b) => b.stake - a.stake).slice(0, 5);
  }, [validators]);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#050508',
      backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(0, 191, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(255, 140, 0, 0.05) 0%, transparent 40%)',
      color: '#e2e8f0'
    }}>
      <style>{`
        .tburn-panel {
          background: rgba(20, 24, 35, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 140, 0, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
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

      <header className="max-w-[1400px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <Link href="/validator" className="flex items-center gap-2 text-slate-400 hover:text-white transition" data-testid="link-back-to-validator">
              <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5">
                <ArrowLeft size={16} weight="bold" />
              </div>
              <span className="text-sm font-medium">{t('validatorPage.governancePage.backToOverview', { defaultValue: 'Back to Overview' })}</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSelector isDark={true} />
              <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition" data-testid="link-home">
                <House size={20} weight="duotone" className="text-slate-300" />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TBurnLogo className="w-10 h-10" showText={false} />
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="page-title">
              {t('validatorPage.governancePage.title', { defaultValue: 'Validator Governance & Staking Rewards' })}
            </h1>
          </div>
          <p className="text-slate-400 mt-1">{t('validatorPage.subtitle', { defaultValue: 'Decentralized Trust Network / Validator Intelligence' })}</p>
        </div>
        
        <div className="flex gap-4">
          <div className="tburn-panel px-5 py-3 rounded-lg text-right">
            <div className="text-xs text-slate-500 uppercase font-bold">{t('validatorPage.governancePage.averageApy', { defaultValue: 'Average APY' })}</div>
            <div className="text-xl font-bold text-orange-500" data-testid="current-apy">{averageAPY.toFixed(2)}%</div>
          </div>
          <div className="tburn-panel px-5 py-3 rounded-lg text-right">
            <div className="text-xs text-slate-500 uppercase font-bold">{t('validatorPage.governancePage.totalStaked', { defaultValue: 'Total Staked' })}</div>
            <div className="text-xl font-bold text-white" data-testid="total-staked">
              {realStakedAmount > 0 ? `${(realStakedAmount / 1000000).toFixed(1)}${t('common.millions', { defaultValue: 'M' })}` : t('validatorPage.governancePage.defaultStaked', { defaultValue: '421.7M' })} <span className="text-xs font-normal text-slate-400">{t('common.tburn', { defaultValue: 'TBURN' })}</span>
            </div>
          </div>
          <div className="tburn-panel px-5 py-3 rounded-lg text-right">
            <div className="text-xs text-slate-500 uppercase font-bold">{t('validatorPage.governancePage.activeValidators', { defaultValue: 'Active Validators' })}</div>
            <div className="text-xl font-bold text-cyan-400" data-testid="active-validators">
              {realActiveValidators.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 tburn-panel rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Calculator size={96} weight="fill" className="text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <Coins size={24} weight="duotone" className="text-orange-500" /> {t('validatorPage.governancePage.stakingCalculator', { defaultValue: 'Staking Calculator' })}
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-sm text-slate-400 mb-2">{t('validatorPage.governancePage.stakeAmount', { defaultValue: 'Stake Amount (TBURN)' })}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/30 border border-slate-700 rounded-xl py-4 px-5 text-2xl font-bold text-white focus:outline-none focus:border-orange-500 transition"
                    data-testid="input-stake-amount"
                  />
                  <span className="absolute right-6 top-5 text-slate-500 font-bold">{t('common.tburn', { defaultValue: 'TBURN' })}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-400">{t('validatorPage.governancePage.stakingDuration', { defaultValue: 'Staking Duration (months)' })}</span>
                  <span className="text-orange-500 font-bold" data-testid="duration-label">{duration} {duration === 1 ? t('common.month', { defaultValue: 'Month' }) : t('common.months', { defaultValue: 'Months' })}</span>
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
                  <span>{t('validatorPage.governancePage.oneMonth', { defaultValue: '1 Month' })}</span>
                  <span>{t('validatorPage.governancePage.threeYears', { defaultValue: '3 Years' })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="tburn-panel rounded-2xl p-8 flex-1 flex flex-col justify-center bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
              <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">{t('validatorPage.governancePage.estimatedRewards', { defaultValue: 'Estimated Rewards' })}</div>
              <div className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }} data-testid="total-earnings">
                +{formatNumber(earnings.total)}
              </div>
              <div className="text-sm text-orange-500 font-medium">{t('validatorPage.governancePage.tburnTokens', { defaultValue: 'TBURN Tokens' })}</div>
              
              <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500">{t('validatorPage.governancePage.monthlyEarnings', { defaultValue: 'Monthly Earnings' })}</div>
                  <div className="text-lg font-bold text-white" data-testid="monthly-earnings">{formatNumber(earnings.monthly)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">{t('validatorPage.governancePage.dailyEarnings', { defaultValue: 'Daily Earnings' })}</div>
                  <div className="text-lg font-bold text-white" data-testid="daily-earnings">{formatNumber(earnings.daily)}</div>
                </div>
              </div>
            </div>
            
            <button className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2" data-testid="button-start-staking">
              {t('validatorPage.governancePage.startStaking', { defaultValue: 'Start Staking Now' })} <ArrowRight size={20} weight="bold" />
            </button>
          </div>
        </section>

        <section className="tburn-panel rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {t('validatorPage.governancePage.topValidatorsByStake', { defaultValue: 'Top Validators by Stake' })} {validatorsLoading && <CircleNotch className="animate-spin text-orange-500" size={16} />}
          </h2>
          {validatorsLoading ? (
            <div className="flex items-center justify-center py-10">
              <CircleNotch className="animate-spin text-orange-500" size={32} />
              <span className="ml-4 text-slate-400">{t('common.loading', { defaultValue: 'Loading...' })}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topValidators.map((v, idx) => (
                <Link key={v.id} href={`/validator/${v.address}`} className="p-4 rounded-xl bg-black/30 border border-slate-700 hover:border-orange-500/50 transition" data-testid={`top-validator-${idx}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      idx === 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                      idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                      idx === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900' :
                      'bg-slate-800'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-white text-sm truncate">{v.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{v.shortAddr}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-orange-500">{(v.stake / 1000000).toFixed(2)}{t('common.millions', { defaultValue: 'M' })}</div>
                  <div className="text-xs text-slate-500">{v.stakeShare.toFixed(2)}% {t('validatorPage.governancePage.share', { defaultValue: 'share' })}</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <Gavel size={24} weight="duotone" className="text-cyan-400" /> {t('validatorPage.governancePage.activeProposals', { defaultValue: 'Active Proposals' })}
            </h2>
            <a href="#" className="text-sm text-cyan-400 hover:text-white transition">{t('validatorPage.governancePage.viewArchive', { defaultValue: 'View Archive' })}</a>
          </div>

          <div className="grid gap-4">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className={`tburn-panel rounded-xl p-6 transition group ${
                  proposal.status === 'contested' 
                    ? 'hover:border-red-500/50' 
                    : 'hover:border-cyan-400/50'
                }`}
                data-testid={`proposal-${proposal.id}`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`px-3 py-1 rounded text-xs font-bold border h-fit ${
                      proposal.status === 'contested'
                        ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                        : 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
                    }`}>
                      {proposal.id}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold text-white transition ${
                        proposal.status === 'contested' 
                          ? 'group-hover:text-orange-400' 
                          : 'group-hover:text-cyan-400'
                      }`}>
                        {proposal.title}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-1">{proposal.description}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-[140px]">
                    <div className="text-xs text-slate-500">{t('validatorPage.governancePage.votingEndsIn', { defaultValue: 'Voting Ends in' })}</div>
                    <div className="text-lg font-bold text-white font-mono">{proposal.votingEnds}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400">{t('validatorPage.governancePage.yes', { defaultValue: 'Yes' })}: {proposal.yesPercent}%</span>
                    <span className="text-red-400">{t('validatorPage.governancePage.no', { defaultValue: 'No' })}: {proposal.noPercent}%</span>
                  </div>
                  <div className="h-3 w-full vote-bar-bg rounded-full overflow-hidden flex">
                    <div className="h-full vote-yes" style={{ width: `${proposal.yesPercent}%` }} />
                    <div className="h-full bg-slate-700" style={{ width: `${proposal.abstainPercent}%` }} />
                    <div className="h-full vote-no" style={{ width: `${proposal.noPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    {proposal.status === 'contested' ? (
                      <span className="text-orange-400 flex items-center gap-1">
                        <Warning size={12} weight="fill" /> {t('validatorPage.governancePage.contestedVote', { defaultValue: 'Contested Vote' })}
                      </span>
                    ) : (
                      <span>{t('validatorPage.governancePage.quorumReached', { defaultValue: 'Quorum Reached' })} ({t('validatorPage.governancePage.current', { defaultValue: 'Current' })}: {proposal.currentQuorum}%)</span>
                    )}
                    <span>{t('validatorPage.governancePage.totalStakeVoted', { defaultValue: 'Total Stake Voted' })}: {proposal.totalStake}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-[1400px] mx-auto mt-12 py-6 border-t border-slate-800/50 text-center text-slate-500 text-sm">
        {t('validatorPage.governancePage.footer', { defaultValue: 'TBURN Governance Portal | Powered by Trust Burn Foundation' })}
      </footer>
    </div>
  );
}
