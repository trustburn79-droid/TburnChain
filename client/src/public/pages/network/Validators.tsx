import { 
  Shield, Users, Database, HeartPulse, Globe, Zap, Clock, 
  CheckCheck, Server, Crown, UserCheck, Cpu, HardDrive, 
  AlertTriangle, Check, FileText
} from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { usePublicValidators, usePublicNetworkStats } from "../../hooks/use-public-data";

// Helper function to format large numbers
const formatLargeNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[,$]/g, '')) : value;
  if (isNaN(num)) return String(value);
  
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toLocaleString()}`;
};

export default function Validators() {
  const { t } = useTranslation();
  const { data: validatorsResponse } = usePublicValidators();
  const { data: statsResponse } = usePublicNetworkStats();
  
  const validators = validatorsResponse?.data;
  const stats = statsResponse?.data;
  
  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Shield className="w-3 h-3" /> {t('publicPages.network.validators.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('publicPages.network.validators.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.network.validators.subtitle')}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                data-testid="button-apply-now"
              >
                {t('publicPages.network.validators.applyNow')}
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                data-testid="button-validator-docs"
              >
                {t('publicPages.network.validators.validatorDocs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="spotlight-card rounded-xl p-6 text-center group" data-testid="stat-active-validators">
              <Users className="w-8 h-8 text-[#7000ff] mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-mono">
                {validators?.summary?.active != null 
                  ? validators.summary.active.toLocaleString() 
                  : stats?.activeValidators != null 
                    ? stats.activeValidators.toLocaleString() 
                    : "156"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.stats.activeValidators')}</div>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center group" data-testid="stat-total-staked">
              <Database className="w-8 h-8 text-[#ffd700] mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-mono">
                {stats?.totalStaked 
                  ? formatLargeNumber(stats.totalStaked)
                  : validators?.summary?.totalStaked 
                    ? formatLargeNumber(validators.summary.totalStaked)
                    : "$1.2B"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.stats.totalStaked')}</div>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center group" data-testid="stat-uptime">
              <HeartPulse className="w-8 h-8 text-[#00ff9d] mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-mono">
                {validators?.summary?.avgUptime != null 
                  ? `${parseFloat(validators.summary.avgUptime).toFixed(2)}%` 
                  : stats?.uptime ?? "99.97%"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.stats.averageUptime')}</div>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center group" data-testid="stat-countries">
              <Globe className="w-8 h-8 text-[#00f0ff] mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-mono">160</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.stats.operatingCountries')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Consensus Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.validators.consensus.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.consensus.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="spotlight-card rounded-xl p-6 text-center border border-gray-300 dark:border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff]">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.validators.consensusSpecs.tps.value')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.consensusSpecs.tps.description')}</p>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center border border-gray-300 dark:border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff]">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.validators.consensusSpecs.blockTime.value')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.consensusSpecs.blockTime.description')}</p>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center border border-gray-300 dark:border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff]">
                <CheckCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.validators.consensusSpecs.finality.value')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.consensusSpecs.finality.description')}</p>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center border border-gray-300 dark:border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff]">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.network.validators.consensusSpecs.uptime.value')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.consensusSpecs.uptime.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Validator Tier System */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#7000ff]/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.network.validators.tierSystem.title')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Super Node - Elite */}
            <div className="spotlight-card rounded-2xl p-0 border border-[#ffd700]/30 overflow-hidden group">
              <div className="p-6 bg-[#ffd700]/10 border-b border-[#ffd700]/20">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#ffd700]/20 flex items-center justify-center text-[#ffd700]">
                    <Crown className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#ffd700]/20 text-[#ffd700] text-xs font-bold border border-[#ffd700]/30">{t('publicPages.network.validators.tierSystem.elite.badge')}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.elite.name')}</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.stake')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.elite.stakeAmount')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.slots')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.elite.slotsAmount')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.apy')}</span>
                  <span className="font-bold text-[#00ff9d]">{t('publicPages.network.validators.tierSystem.elite.apyAmount')}</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mt-6 pt-6 border-t border-gray-300 dark:border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /> {t('publicPages.network.validators.tierSystem.elite.benefits.blockPriority')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /> {t('publicPages.network.validators.tierSystem.elite.benefits.revenueShare')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /> {t('publicPages.network.validators.tierSystem.elite.benefits.aiDecision')}</li>
                </ul>
              </div>
            </div>

            {/* Standard Node */}
            <div className="spotlight-card rounded-2xl p-0 border border-[#00f0ff]/30 overflow-hidden group">
              <div className="p-6 bg-[#00f0ff]/10 border-b border-[#00f0ff]/20">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff]">
                    <Server className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] text-xs font-bold border border-[#00f0ff]/30">{t('publicPages.network.validators.tierSystem.standard.badge')}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.standard.name')}</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.stake')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.standard.stakeAmount')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.slots')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.standard.slotsAmount')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.apy')}</span>
                  <span className="font-bold text-[#00ff9d]">{t('publicPages.network.validators.tierSystem.standard.apyAmount')}</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mt-6 pt-6 border-t border-gray-300 dark:border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00f0ff]" /> {t('publicPages.network.validators.tierSystem.standard.benefits.blockValidation')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00f0ff]" /> {t('publicPages.network.validators.tierSystem.standard.benefits.votingRights')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00f0ff]" /> {t('publicPages.network.validators.tierSystem.standard.benefits.feeDistribution')}</li>
                </ul>
              </div>
            </div>

            {/* Delegator - Starter */}
            <div className="spotlight-card rounded-2xl p-0 border border-[#00ff9d]/30 overflow-hidden group">
              <div className="p-6 bg-[#00ff9d]/10 border-b border-[#00ff9d]/20">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d]">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#00ff9d]/20 text-[#00ff9d] text-xs font-bold border border-[#00ff9d]/30">{t('publicPages.network.validators.tierSystem.starter.badge')}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.starter.name')}</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.stake')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.starter.stakeAmount')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.slots')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{t('publicPages.network.validators.tierSystem.starter.slotsAmount')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.tierSystem.apy')}</span>
                  <span className="font-bold text-[#00ff9d]">{t('publicPages.network.validators.tierSystem.starter.apyAmount')}</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mt-6 pt-6 border-t border-gray-300 dark:border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> {t('publicPages.network.validators.tierSystem.starter.benefits.delegate')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> {t('publicPages.network.validators.tierSystem.starter.benefits.autoRewards')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> {t('publicPages.network.validators.tierSystem.starter.benefits.unstakePeriod')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Requirements */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.network.validators.hardware.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Super Node Requirements */}
            <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10">
              <h3 className="text-xl font-bold text-[#ffd700] mb-6 flex items-center gap-3">
                <Cpu className="w-5 h-5" /> {t('publicPages.network.validators.hardware.superNode.title')}
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.hardware.cpu')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.network.validators.hardware.superNode.cpu')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.hardware.ram')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.network.validators.hardware.superNode.ram')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.hardware.storage')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.network.validators.hardware.superNode.storage')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.hardware.network')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.network.validators.hardware.superNode.network')}</span>
                </div>
              </div>
            </div>

            {/* Standard Node Requirements */}
            <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10">
              <h3 className="text-xl font-bold text-[#00f0ff] mb-6 flex items-center gap-3">
                <HardDrive className="w-5 h-5" /> {t('publicPages.network.validators.hardware.standardNode.title')}
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.hardware.cpu')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.network.validators.hardware.standardNode.cpu')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.hardware.ram')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.network.validators.hardware.standardNode.ram')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.hardware.storage')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.network.validators.hardware.standardNode.storage')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.network.validators.hardware.network')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.network.validators.hardware.standardNode.network')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slashing Policy */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.network.validators.slashing.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff0055]" /> 
              {t('publicPages.network.validators.slashing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-black/40 border border-[#ffd700]/30 p-6 rounded-lg text-center">
              <span className="inline-block px-2 py-1 rounded bg-[#ffd700]/20 text-[#ffd700] text-xs font-bold mb-3">{t('publicPages.network.validators.slashing.minor.badge')}</span>
              <h4 className="text-gray-900 dark:text-white font-bold mb-1">{t('publicPages.network.validators.slashing.minor.title')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('publicPages.network.validators.slashing.minor.description')}</p>
              <p className="text-[#ffd700] font-mono font-bold">{t('publicPages.network.validators.slashing.minor.penalty')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-black/40 border border-orange-500/30 p-6 rounded-lg text-center">
              <span className="inline-block px-2 py-1 rounded bg-orange-500/20 text-orange-500 text-xs font-bold mb-3">{t('publicPages.network.validators.slashing.moderate.badge')}</span>
              <h4 className="text-gray-900 dark:text-white font-bold mb-1">{t('publicPages.network.validators.slashing.moderate.title')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('publicPages.network.validators.slashing.moderate.description')}</p>
              <p className="text-orange-500 font-mono font-bold">{t('publicPages.network.validators.slashing.moderate.penalty')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-black/40 border border-[#ff0055]/30 p-6 rounded-lg text-center">
              <span className="inline-block px-2 py-1 rounded bg-[#ff0055]/20 text-[#ff0055] text-xs font-bold mb-3">{t('publicPages.network.validators.slashing.severe.badge')}</span>
              <h4 className="text-gray-900 dark:text-white font-bold mb-1">{t('publicPages.network.validators.slashing.severe.title')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('publicPages.network.validators.slashing.severe.description')}</p>
              <p className="text-[#ff0055] font-mono font-bold">{t('publicPages.network.validators.slashing.severe.penalty')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-black/40 border border-[#ff0055]/30 p-6 rounded-lg text-center">
              <span className="inline-block px-2 py-1 rounded bg-[#ff0055]/20 text-[#ff0055] text-xs font-bold mb-3">{t('publicPages.network.validators.slashing.critical.badge')}</span>
              <h4 className="text-gray-900 dark:text-white font-bold mb-1">{t('publicPages.network.validators.slashing.critical.title')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('publicPages.network.validators.slashing.critical.description')}</p>
              <p className="text-[#ff0055] font-mono font-bold">{t('publicPages.network.validators.slashing.critical.penalty')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="spotlight-card rounded-2xl p-12 border border-[#7000ff]/30">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.network.validators.cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              {t('publicPages.network.validators.cta.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/developers/quickstart">
                <button 
                  className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  data-testid="button-start-validating"
                >
                  {t('publicPages.network.validators.cta.startValidating')}
                </button>
              </Link>
              <Link href="/developers/docs">
                <button 
                  className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2"
                  data-testid="button-read-docs"
                >
                  <FileText className="w-4 h-4" /> {t('publicPages.network.validators.cta.readDocs')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
