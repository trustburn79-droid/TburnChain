import { 
  Shield, Users, Database, HeartPulse, Globe, Zap, Clock, 
  CheckCheck, Server, Crown, UserCheck, Cpu, HardDrive, 
  AlertTriangle, Check, FileText
} from "lucide-react";
import { Link } from "wouter";
import { usePublicValidators, usePublicNetworkStats } from "../../hooks/use-public-data";

export default function Validators() {
  const { data: validatorsResponse } = usePublicValidators();
  const { data: statsResponse } = usePublicNetworkStats();
  
  const validators = validatorsResponse?.data;
  const stats = statsResponse?.data;
  
  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Shield className="w-3 h-3" /> DPoS + BFT HYBRID_CONSENSUS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Validator <span className="text-gradient">Network</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            Join TBurn Chain V4's decentralized global validator infrastructure. <br />
            Experience ultra-fast processing and top-tier security with our hybrid consensus mechanism.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              data-testid="button-apply-now"
            >
              Apply Now
            </button>
            <button 
              className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
              data-testid="button-validator-docs"
            >
              Validator Docs
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white/5 border-b border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="spotlight-card rounded-xl p-6 text-center group" data-testid="stat-active-validators">
              <Users className="w-8 h-8 text-[#7000ff] mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-1 font-mono">
                {validators?.summary?.active != null 
                  ? validators.summary.active.toLocaleString() 
                  : stats?.activeValidators != null 
                    ? stats.activeValidators.toLocaleString() 
                    : "125"}
              </div>
              <div className="text-xs text-gray-400">Active Validators</div>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center group" data-testid="stat-total-staked">
              <Database className="w-8 h-8 text-[#ffd700] mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-1 font-mono">
                {stats?.totalStaked ?? validators?.summary?.totalStaked ?? "$847M"}
              </div>
              <div className="text-xs text-gray-400">Total Staked</div>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center group" data-testid="stat-uptime">
              <HeartPulse className="w-8 h-8 text-[#00ff9d] mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-1 font-mono">
                {validators?.summary?.avgUptime != null 
                  ? `${parseFloat(validators.summary.avgUptime).toFixed(2)}%` 
                  : stats?.uptime ?? "99.99%"}
              </div>
              <div className="text-xs text-gray-400">Average Uptime</div>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center group" data-testid="stat-countries">
              <Globe className="w-8 h-8 text-[#00f0ff] mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-1 font-mono">147</div>
              <div className="text-xs text-gray-400">Operating Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Consensus Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">DPoS + BFT Hybrid Consensus</h2>
            <p className="text-gray-400">Next-generation consensus algorithm for instant finality.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="spotlight-card rounded-xl p-6 text-center border border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff]">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">500,000+ TPS</h3>
              <p className="text-sm text-gray-400">Ultra-fast transaction processing through parallel processing and sharding.</p>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center border border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff]">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1s Block Time</h3>
              <p className="text-sm text-gray-400">Fast block generation for optimal user experience.</p>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center border border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff]">
                <CheckCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">6s Finality</h3>
              <p className="text-sm text-gray-400">BFT-based instant transaction finality guarantee.</p>
            </div>
            <div className="spotlight-card rounded-xl p-6 text-center border border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff]">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">99.97% Uptime</h3>
              <p className="text-sm text-gray-400">Enterprise-grade stability and reliability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Validator Tier System */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#7000ff]/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Validator Tier System</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Super Node - Elite */}
            <div className="spotlight-card rounded-2xl p-0 border border-[#ffd700]/30 overflow-hidden group">
              <div className="p-6 bg-[#ffd700]/10 border-b border-[#ffd700]/20">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#ffd700]/20 flex items-center justify-center text-[#ffd700]">
                    <Crown className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#ffd700]/20 text-[#ffd700] text-xs font-bold border border-[#ffd700]/30">ELITE</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Super Node</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stake</span>
                  <span className="font-bold text-white">1M+ TBURN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Slots</span>
                  <span className="font-bold text-white">Limited 128</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">APY</span>
                  <span className="font-bold text-[#00ff9d]">18-25%</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-400 mt-6 pt-6 border-t border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /> Block production priority</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /> Protocol revenue sharing</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#ffd700]" /> AI decision participation</li>
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
                  <span className="px-3 py-1 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] text-xs font-bold border border-[#00f0ff]/30">STANDARD</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Standard Node</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stake</span>
                  <span className="font-bold text-white">100K+ TBURN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Slots</span>
                  <span className="font-bold text-white">Unlimited</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">APY</span>
                  <span className="font-bold text-[#00ff9d]">12-18%</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-400 mt-6 pt-6 border-t border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00f0ff]" /> Block validation participation</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00f0ff]" /> Governance voting rights</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00f0ff]" /> Transaction fee distribution</li>
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
                  <span className="px-3 py-1 rounded-full bg-[#00ff9d]/20 text-[#00ff9d] text-xs font-bold border border-[#00ff9d]/30">STARTER</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Delegator</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stake</span>
                  <span className="font-bold text-white">100+ TBURN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Slots</span>
                  <span className="font-bold text-white">Unlimited</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">APY</span>
                  <span className="font-bold text-[#00ff9d]">8-12%</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-400 mt-6 pt-6 border-t border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Delegate to validators</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Automatic reward collection</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> 7-day unstaking period</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Requirements */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Hardware Requirements</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Super Node Requirements */}
            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-[#ffd700] mb-6 flex items-center gap-3">
                <Cpu className="w-5 h-5" /> Super Node Requirements
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">CPU</span>
                  <span className="text-white">32+ cores / 64+ threads (EPYC/Xeon)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">RAM</span>
                  <span className="text-white">256GB+ DDR5 ECC</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Storage</span>
                  <span className="text-white">4TB+ NVMe SSD (RAID 10)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">10Gbps dedicated line</span>
                </div>
              </div>
            </div>

            {/* Standard Node Requirements */}
            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-[#00f0ff] mb-6 flex items-center gap-3">
                <HardDrive className="w-5 h-5" /> Standard Node Requirements
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">CPU</span>
                  <span className="text-white">16+ cores / 32+ threads</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">RAM</span>
                  <span className="text-white">128GB+ DDR4/DDR5</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Storage</span>
                  <span className="text-white">2TB+ NVMe SSD</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">1Gbps dedicated line</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slashing Policy */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Slashing Policy</h2>
            <p className="text-gray-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff0055]" /> 
              Violations result in slashing of staked tokens to ensure network security.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-black/40 border border-[#ffd700]/30 p-6 rounded-lg text-center">
              <span className="inline-block px-2 py-1 rounded bg-[#ffd700]/20 text-[#ffd700] text-xs font-bold mb-3">MINOR</span>
              <h4 className="text-white font-bold mb-1">Downtime</h4>
              <p className="text-xs text-gray-400 mb-3">(within 24h)</p>
              <p className="text-[#ffd700] font-mono font-bold">0.1% Slash</p>
            </div>
            <div className="bg-black/40 border border-orange-500/30 p-6 rounded-lg text-center">
              <span className="inline-block px-2 py-1 rounded bg-orange-500/20 text-orange-500 text-xs font-bold mb-3">MODERATE</span>
              <h4 className="text-white font-bold mb-1">Missed Blocks</h4>
              <p className="text-xs text-gray-400 mb-3">(consecutive 100+)</p>
              <p className="text-orange-500 font-mono font-bold">1% Slash</p>
            </div>
            <div className="bg-black/40 border border-[#ff0055]/30 p-6 rounded-lg text-center">
              <span className="inline-block px-2 py-1 rounded bg-[#ff0055]/20 text-[#ff0055] text-xs font-bold mb-3">SEVERE</span>
              <h4 className="text-white font-bold mb-1">Double Sign</h4>
              <p className="text-xs text-gray-400 mb-3">(Byzantine fault)</p>
              <p className="text-[#ff0055] font-mono font-bold">5% Slash</p>
            </div>
            <div className="bg-black/40 border border-[#ff0055]/30 p-6 rounded-lg text-center">
              <span className="inline-block px-2 py-1 rounded bg-[#ff0055]/20 text-[#ff0055] text-xs font-bold mb-3">CRITICAL</span>
              <h4 className="text-white font-bold mb-1">Collusion</h4>
              <p className="text-xs text-gray-400 mb-3">(attack attempt)</p>
              <p className="text-[#ff0055] font-mono font-bold">100% Slash + Ban</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="spotlight-card rounded-2xl p-12 border border-[#7000ff]/30">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Become a Validator?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join the TBurn Chain validator network and earn rewards while securing the network.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                data-testid="button-start-validating"
              >
                Start Validating
              </button>
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition flex items-center gap-2"
                data-testid="button-read-docs"
              >
                <FileText className="w-4 h-4" /> Read Documentation
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
