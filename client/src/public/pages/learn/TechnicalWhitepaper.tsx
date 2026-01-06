import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { TBurnLogo } from "@/components/tburn-logo";
import "../../styles/public.css";

export default function TechnicalWhitepaper() {
  const { t } = useTranslation();

  const tocItems = [
    { id: "abstract", label: t('technicalWhitepaper.toc.abstract') },
    { id: "architecture", label: t('technicalWhitepaper.toc.architecture') },
    { id: "consensus", label: t('technicalWhitepaper.toc.consensus') },
    { id: "sharding", label: t('technicalWhitepaper.toc.sharding') },
    { id: "ai-system", label: t('technicalWhitepaper.toc.aiSystem') },
    { id: "tokenomics", label: t('technicalWhitepaper.toc.tokenomics') },
    { id: "token-standards", label: t('technicalWhitepaper.toc.tokenStandards') },
    { id: "defi", label: t('technicalWhitepaper.toc.defi') },
    { id: "security", label: t('technicalWhitepaper.toc.security') },
    { id: "governance", label: t('technicalWhitepaper.toc.governance') },
    { id: "roadmap", label: t('technicalWhitepaper.toc.roadmap') },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        .tw-container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
        .tw-highlight { color: #00f0ff; font-weight: 500; }
        .tw-section { margin-bottom: 60px; }
        .tw-section h2 { font-size: 28px; font-weight: 600; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #00f0ff; display: inline-block; }
        .tw-section h3 { font-size: 20px; font-weight: 600; margin: 32px 0 16px; color: #00f0ff; }
        .tw-section h4 { font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: #a0a0b0; }
        .tw-section p { color: #a0a0b0; margin-bottom: 16px; line-height: 1.7; }
        .tw-section ul, .tw-section ol { margin: 16px 0 16px 24px; color: #a0a0b0; }
        .tw-section li { margin-bottom: 8px; }
        .tw-section li strong { color: #fff; }
        .tw-spec-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
        @media (max-width: 768px) { .tw-spec-grid { grid-template-columns: repeat(2, 1fr); } }
        .tw-spec-card { background: #1a1a24; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; text-align: center; }
        .tw-spec-card .label { font-size: 12px; color: #6b6b7b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .tw-spec-card .value { font-size: 24px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
        .tw-spec-card .value.cyan { color: #00f0ff; }
        .tw-spec-card .value.green { color: #00ff9d; }
        .tw-spec-card .value.orange { color: #ff6b35; }
        .tw-spec-card .value.purple { color: #7000ff; }
        .tw-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
        .tw-table th, .tw-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .tw-table th { background: #1a1a24; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .tw-table td { color: #a0a0b0; }
        .tw-table code { font-family: 'JetBrains Mono', monospace; background: #1a1a24; padding: 2px 8px; border-radius: 4px; font-size: 13px; color: #00f0ff; }
        .tw-formula { background: linear-gradient(135deg, rgba(0,240,255,0.05), rgba(112,0,255,0.05)); border: 1px solid rgba(0,240,255,0.2); border-radius: 8px; padding: 24px; margin: 24px 0; font-family: 'JetBrains Mono', monospace; text-align: center; }
        .tw-formula .title { font-size: 12px; color: #6b6b7b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .tw-formula .equation { font-size: 18px; color: #fff; }
        .tw-code { background: #1a1a24; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; overflow-x: auto; margin: 20px 0; }
        .tw-code code { font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.6; color: #a0a0b0; }
        .tw-arch-diagram { background: #1a1a24; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center; }
        .tw-arch-diagram .title { font-size: 14px; color: #6b6b7b; margin-bottom: 20px; }
        .tw-layer { display: flex; justify-content: center; gap: 12px; margin: 12px 0; flex-wrap: wrap; }
        .tw-layer-box { background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(112,0,255,0.1)); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 12px 20px; font-size: 13px; font-weight: 500; }
        .tw-layer-box.orange { background: linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,215,0,0.1)); border-color: rgba(255,107,53,0.3); }
        .tw-layer-box.green { background: linear-gradient(135deg, rgba(0,255,157,0.1), rgba(0,240,255,0.1)); border-color: rgba(0,255,157,0.3); }
        .tw-layer-box.purple { background: linear-gradient(135deg, rgba(112,0,255,0.1), rgba(0,240,255,0.1)); border-color: rgba(112,0,255,0.3); }
        .tw-connector { font-size: 20px; color: #6b6b7b; margin: 8px 0; }
        .tw-info-box { background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 16px 20px; margin: 20px 0; color: #00f0ff; font-size: 14px; }
        .tw-info-box a { color: inherit; }
      `}</style>

      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TBurnLogo className="w-10 h-10" />
            <span className="font-bold text-xl">TBurn<span className="text-cyan-400 font-light">Chain</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/learn/whitepaper" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t('technicalWhitepaper.backToWhitepaper')}
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-b from-[#12121a] to-[#0a0a0f] py-16 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(0,240,255,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="tw-container relative z-10">
          <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/30 px-4 py-1.5 rounded-full text-xs font-medium text-cyan-400 mb-5 font-mono">
            <span>{t('technicalWhitepaper.badge')}</span>
            <span>v9.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
            TBURN Chain
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            {t('technicalWhitepaper.subtitle')}
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5"><strong className="text-gray-400">{t('technicalWhitepaper.meta.version')}:</strong> 9.0 (Mainnet)</div>
            <div className="flex items-center gap-1.5"><strong className="text-gray-400">{t('technicalWhitepaper.meta.date')}:</strong> December 26, 2025</div>
            <div className="flex items-center gap-1.5"><strong className="text-gray-400">{t('technicalWhitepaper.meta.chainId')}:</strong> 6000 (0x1770)</div>
            <div className="flex items-center gap-1.5"><strong className="text-gray-400">{t('technicalWhitepaper.meta.status')}:</strong> Production</div>
          </div>
        </div>
      </div>

      <nav className="bg-[#12121a] py-5 border-b border-white/10">
        <div className="tw-container">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('technicalWhitepaper.tableOfContents')}</div>
          <ul className="flex flex-wrap gap-3 gap-y-2">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="tw-container py-16">
        <section id="abstract" className="tw-section">
          <h2>1. {t('technicalWhitepaper.sections.abstract.title')}</h2>
          <p>{t('technicalWhitepaper.sections.abstract.p1')}</p>
          <p>{t('technicalWhitepaper.sections.abstract.p2')}</p>
          <div className="tw-spec-grid">
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.abstract.specs.peakTps')}</div>
              <div className="value cyan">210,000</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.abstract.specs.blockTime')}</div>
              <div className="value green">100ms</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.abstract.specs.finality')}</div>
              <div className="value orange">1 {t('technicalWhitepaper.sections.abstract.specs.second')}</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.abstract.specs.validators')}</div>
              <div className="value purple">1,600</div>
            </div>
          </div>
        </section>

        <section id="architecture" className="tw-section">
          <h2>2. {t('technicalWhitepaper.sections.architecture.title')}</h2>
          <p>{t('technicalWhitepaper.sections.architecture.intro')}</p>
          
          <div className="tw-arch-diagram">
            <div className="title">{t('technicalWhitepaper.sections.architecture.diagramTitle')}</div>
            <div className="tw-layer">
              <div className="tw-layer-box">{t('technicalWhitepaper.sections.architecture.layers.defi')}</div>
              <div className="tw-layer-box">{t('technicalWhitepaper.sections.architecture.layers.nftGamefi')}</div>
              <div className="tw-layer-box">{t('technicalWhitepaper.sections.architecture.layers.bridge')}</div>
              <div className="tw-layer-box">{t('technicalWhitepaper.sections.architecture.layers.governance')}</div>
            </div>
            <div className="tw-connector">↓</div>
            <div className="tw-layer">
              <div className="tw-layer-box orange">{t('technicalWhitepaper.sections.architecture.layers.smartContract')}</div>
            </div>
            <div className="tw-connector">↓</div>
            <div className="tw-layer">
              <div className="tw-layer-box green">{t('technicalWhitepaper.sections.architecture.layers.quadBandAi')}</div>
            </div>
            <div className="tw-connector">↓</div>
            <div className="tw-layer">
              <div className="tw-layer-box purple">{t('technicalWhitepaper.sections.architecture.layers.trustScoreBft')}</div>
              <div className="tw-layer-box purple">{t('technicalWhitepaper.sections.architecture.layers.dynamicSharding')}</div>
            </div>
            <div className="tw-connector">↓</div>
            <div className="tw-layer">
              <div className="tw-layer-box">{t('technicalWhitepaper.sections.architecture.layers.crossShard')}</div>
              <div className="tw-layer-box">{t('technicalWhitepaper.sections.architecture.layers.stateSync')}</div>
              <div className="tw-layer-box">{t('technicalWhitepaper.sections.architecture.layers.p2p')}</div>
            </div>
          </div>

          <h3>2.1 {t('technicalWhitepaper.sections.architecture.coreComponents.title')}</h3>
          <h4>{t('technicalWhitepaper.sections.architecture.coreComponents.execution.title')}</h4>
          <p>{t('technicalWhitepaper.sections.architecture.coreComponents.execution.desc')}</p>
          <h4>{t('technicalWhitepaper.sections.architecture.coreComponents.consensus.title')}</h4>
          <p>{t('technicalWhitepaper.sections.architecture.coreComponents.consensus.desc')}</p>
          <h4>{t('technicalWhitepaper.sections.architecture.coreComponents.dataAvailability.title')}</h4>
          <p>{t('technicalWhitepaper.sections.architecture.coreComponents.dataAvailability.desc')}</p>
          <h4>{t('technicalWhitepaper.sections.architecture.coreComponents.aiOrchestration.title')}</h4>
          <p>{t('technicalWhitepaper.sections.architecture.coreComponents.aiOrchestration.desc')}</p>

          <h3>2.2 {t('technicalWhitepaper.sections.architecture.networkSpecs.title')}</h3>
          <table className="tw-table">
            <thead>
              <tr>
                <th>{t('technicalWhitepaper.sections.architecture.networkSpecs.parameter')}</th>
                <th>Mainnet</th>
                <th>Testnet</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Chain ID</td><td><code>6000 (0x1770)</code></td><td><code>5900 (0x170C)</code></td></tr>
              <tr><td>RPC Endpoint</td><td><code>https://tburn.io/rpc</code></td><td><code>https://tburn.io/testnet-rpc</code></td></tr>
              <tr><td>WebSocket</td><td><code>wss://tburn.io/ws</code></td><td><code>wss://tburn.io/testnet-ws</code></td></tr>
              <tr><td>Explorer</td><td><code>https://tburn.io/scan</code></td><td><code>https://tburn.io/testnet-scan</code></td></tr>
              <tr><td>{t('technicalWhitepaper.sections.architecture.networkSpecs.currencySymbol')}</td><td>TBURN</td><td>tTBURN</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.architecture.networkSpecs.blockTime')}</td><td>100ms</td><td>100ms</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.architecture.networkSpecs.gasUnit')}</td><td>Ember (EMB)</td><td>Ember (EMB)</td></tr>
            </tbody>
          </table>
        </section>

        <section id="consensus" className="tw-section">
          <h2>3. {t('technicalWhitepaper.sections.consensus.title')}</h2>
          <p>{t('technicalWhitepaper.sections.consensus.intro')}</p>

          <h3>3.1 {t('technicalWhitepaper.sections.consensus.trustScore.title')}</h3>
          <p>{t('technicalWhitepaper.sections.consensus.trustScore.desc')}</p>
          <div className="tw-formula">
            <div className="title">{t('technicalWhitepaper.sections.consensus.trustScore.formulaTitle')}</div>
            <div className="equation">TS = α·Uptime + β·BlockProduction + γ·VoteAccuracy + δ·StakeRatio + ε·NetworkContribution</div>
          </div>
          <p>{t('technicalWhitepaper.sections.consensus.trustScore.coefficients')}</p>
          <ul>
            <li><strong>α = 0.25:</strong> {t('technicalWhitepaper.sections.consensus.trustScore.alpha')}</li>
            <li><strong>β = 0.20:</strong> {t('technicalWhitepaper.sections.consensus.trustScore.beta')}</li>
            <li><strong>γ = 0.20:</strong> {t('technicalWhitepaper.sections.consensus.trustScore.gamma')}</li>
            <li><strong>δ = 0.20:</strong> {t('technicalWhitepaper.sections.consensus.trustScore.delta')}</li>
            <li><strong>ε = 0.15:</strong> {t('technicalWhitepaper.sections.consensus.trustScore.epsilon')}</li>
          </ul>

          <h3>3.2 {t('technicalWhitepaper.sections.consensus.validatorTiers.title')}</h3>
          <table className="tw-table">
            <thead>
              <tr>
                <th>{t('technicalWhitepaper.sections.consensus.validatorTiers.tier')}</th>
                <th>{t('technicalWhitepaper.sections.consensus.validatorTiers.maxValidators')}</th>
                <th>{t('technicalWhitepaper.sections.consensus.validatorTiers.minStake')}</th>
                <th>{t('technicalWhitepaper.sections.consensus.validatorTiers.rewardShare')}</th>
                <th>{t('technicalWhitepaper.sections.consensus.validatorTiers.dailyRewards')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><span className="tw-highlight">Tier 1 (Elite)</span></td><td>512</td><td>20,000,000 TBURN</td><td>50%</td><td>250,000 TBURN</td></tr>
              <tr><td><span className="tw-highlight">Tier 2 (Standard)</span></td><td>4,488</td><td>5,000,000 TBURN</td><td>30%</td><td>150,000 TBURN</td></tr>
              <tr><td><span className="tw-highlight">Tier 3 (Delegator)</span></td><td>{t('technicalWhitepaper.sections.consensus.validatorTiers.unlimited')}</td><td>10,000 TBURN</td><td>20%</td><td>100,000 TBURN</td></tr>
            </tbody>
          </table>

          <h3>3.3 {t('technicalWhitepaper.sections.consensus.blockProduction.title')}</h3>
          <p>{t('technicalWhitepaper.sections.consensus.blockProduction.desc')}</p>

          <h3>3.4 {t('technicalWhitepaper.sections.consensus.finality.title')}</h3>
          <p>{t('technicalWhitepaper.sections.consensus.finality.desc')}</p>
          <ol>
            <li><strong>{t('technicalWhitepaper.sections.consensus.finality.proposePhase')}:</strong> {t('technicalWhitepaper.sections.consensus.finality.proposeDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.consensus.finality.commitPhase')}:</strong> {t('technicalWhitepaper.sections.consensus.finality.commitDesc')}</li>
          </ol>
          <p>{t('technicalWhitepaper.sections.consensus.finality.totalTime')}</p>
        </section>

        <section id="sharding" className="tw-section">
          <h2>4. {t('technicalWhitepaper.sections.sharding.title')}</h2>
          <p>{t('technicalWhitepaper.sections.sharding.intro')}</p>

          <h3>4.1 {t('technicalWhitepaper.sections.sharding.config.title')}</h3>
          <div className="tw-spec-grid">
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.sharding.config.activeShards')}</div>
              <div className="value cyan">64</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.sharding.config.validatorsPerShard')}</div>
              <div className="value green">25</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.sharding.config.tpsPerShard')}</div>
              <div className="value orange">3,280</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.sharding.config.crossShardLatency')}</div>
              <div className="value purple">50ms</div>
            </div>
          </div>

          <h3>4.2 {t('technicalWhitepaper.sections.sharding.tpsFormula.title')}</h3>
          <div className="tw-formula">
            <div className="title">{t('technicalWhitepaper.sections.sharding.tpsFormula.formulaTitle')}</div>
            <div className="equation">TPS = Shards × TxPerShard × NetworkLoad × BlocksPerSecond</div>
          </div>
          <p>{t('technicalWhitepaper.sections.sharding.tpsFormula.withConfig')}</p>
          <div className="tw-code">
            <code>TPS = 64 shards × 625 tx/shard × 0.525 load × 10 blocks/sec<br/>TPS ≈ 210,000</code>
          </div>

          <h3>4.3 {t('technicalWhitepaper.sections.sharding.hardware.title')}</h3>
          <table className="tw-table">
            <thead>
              <tr>
                <th>{t('technicalWhitepaper.sections.sharding.hardware.profile')}</th>
                <th>CPU Cores</th>
                <th>RAM</th>
                <th>{t('technicalWhitepaper.sections.sharding.hardware.maxShards')}</th>
                <th>{t('technicalWhitepaper.sections.sharding.hardware.tpsRange')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Development</td><td>&lt;16</td><td>&lt;64GB</td><td>5</td><td>10,000 - 25,000</td></tr>
              <tr><td>Staging</td><td>16+</td><td>64GB+</td><td>32</td><td>50,000 - 100,000</td></tr>
              <tr><td>Production</td><td>32+</td><td>256GB+</td><td>64</td><td>150,000 - 250,000</td></tr>
              <tr><td>Enterprise</td><td>64+</td><td>512GB+</td><td>128</td><td>350,000 - 520,000</td></tr>
            </tbody>
          </table>

          <h3>4.4 {t('technicalWhitepaper.sections.sharding.crossShard.title')}</h3>
          <p>{t('technicalWhitepaper.sections.sharding.crossShard.desc')}</p>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.sharding.crossShard.messageQueue')}:</strong> {t('technicalWhitepaper.sections.sharding.crossShard.messageQueueDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.sharding.crossShard.batchProcessing')}:</strong> {t('technicalWhitepaper.sections.sharding.crossShard.batchProcessingDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.sharding.crossShard.proofGeneration')}:</strong> {t('technicalWhitepaper.sections.sharding.crossShard.proofGenerationDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.sharding.crossShard.caching')}:</strong> {t('technicalWhitepaper.sections.sharding.crossShard.cachingDesc')}</li>
          </ul>

          <h3>4.5 {t('technicalWhitepaper.sections.sharding.autoScaling.title')}</h3>
          <p>{t('technicalWhitepaper.sections.sharding.autoScaling.desc')}</p>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.sharding.autoScaling.scaleUp')}:</strong> {t('technicalWhitepaper.sections.sharding.autoScaling.scaleUpDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.sharding.autoScaling.scaleDown')}:</strong> {t('technicalWhitepaper.sections.sharding.autoScaling.scaleDownDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.sharding.autoScaling.rebalance')}:</strong> {t('technicalWhitepaper.sections.sharding.autoScaling.rebalanceDesc')}</li>
          </ul>
        </section>

        <section id="ai-system" className="tw-section">
          <h2>5. {t('technicalWhitepaper.sections.aiSystem.title')}</h2>
          <p>{t('technicalWhitepaper.sections.aiSystem.intro')}</p>

          <h3>5.1 {t('technicalWhitepaper.sections.aiSystem.modelConfig.title')}</h3>
          <table className="tw-table">
            <thead>
              <tr>
                <th>Band</th>
                <th>{t('technicalWhitepaper.sections.aiSystem.modelConfig.model')}</th>
                <th>{t('technicalWhitepaper.sections.aiSystem.modelConfig.primaryFunction')}</th>
                <th>{t('technicalWhitepaper.sections.aiSystem.modelConfig.latency')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><span className="tw-highlight">Band 1</span></td><td>Gemini</td><td>{t('technicalWhitepaper.sections.aiSystem.modelConfig.band1Func')}</td><td>&lt;100ms</td></tr>
              <tr><td><span className="tw-highlight">Band 2</span></td><td>Claude</td><td>{t('technicalWhitepaper.sections.aiSystem.modelConfig.band2Func')}</td><td>&lt;200ms</td></tr>
              <tr><td><span className="tw-highlight">Band 3</span></td><td>ChatGPT</td><td>{t('technicalWhitepaper.sections.aiSystem.modelConfig.band3Func')}</td><td>&lt;150ms</td></tr>
              <tr><td><span className="tw-highlight">Band 4</span></td><td>Grok</td><td>{t('technicalWhitepaper.sections.aiSystem.modelConfig.band4Func')}</td><td>&lt;100ms</td></tr>
            </tbody>
          </table>

          <h3>5.2 {t('technicalWhitepaper.sections.aiSystem.decisionCategories.title')}</h3>
          <ul>
            <li><strong>ADJUST_SHARDS:</strong> {t('technicalWhitepaper.sections.aiSystem.decisionCategories.adjustShards')}</li>
            <li><strong>OPTIMIZE_BURN:</strong> {t('technicalWhitepaper.sections.aiSystem.decisionCategories.optimizeBurn')}</li>
            <li><strong>RESCHEDULE_VALIDATORS:</strong> {t('technicalWhitepaper.sections.aiSystem.decisionCategories.rescheduleValidators')}</li>
            <li><strong>SECURITY_ALERT:</strong> {t('technicalWhitepaper.sections.aiSystem.decisionCategories.securityAlert')}</li>
            <li><strong>GOVERNANCE_PREVALIDATION:</strong> {t('technicalWhitepaper.sections.aiSystem.decisionCategories.governancePrevalidation')}</li>
            <li><strong>CROSS_SHARD_OPTIMIZATION:</strong> {t('technicalWhitepaper.sections.aiSystem.decisionCategories.crossShardOptimization')}</li>
          </ul>

          <h3>5.3 {t('technicalWhitepaper.sections.aiSystem.failFast.title')}</h3>
          <p>{t('technicalWhitepaper.sections.aiSystem.failFast.desc')}</p>

          <h3>5.4 {t('technicalWhitepaper.sections.aiSystem.burnOptimization.title')}</h3>
          <p>{t('technicalWhitepaper.sections.aiSystem.burnOptimization.desc')}</p>
          <div className="tw-formula">
            <div className="title">{t('technicalWhitepaper.sections.aiSystem.burnOptimization.formulaTitle')}</div>
            <div className="equation">BurnRate = BaseBurn × (1 + NetworkUtilization × ActivityMultiplier)</div>
          </div>
        </section>

        <section id="tokenomics" className="tw-section">
          <h2>6. {t('technicalWhitepaper.sections.tokenomics.title')}</h2>
          <p>{t('technicalWhitepaper.sections.tokenomics.intro')}</p>

          <h3>6.1 {t('technicalWhitepaper.sections.tokenomics.supply.title')}</h3>
          <div className="tw-spec-grid">
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.tokenomics.supply.genesis')}</div>
              <div className="value cyan">10B</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.tokenomics.supply.year20')}</div>
              <div className="value green">6.94B</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.tokenomics.supply.totalReduction')}</div>
              <div className="value orange">30.6%</div>
            </div>
            <div className="tw-spec-card">
              <div className="label">{t('technicalWhitepaper.sections.tokenomics.supply.targetStaking')}</div>
              <div className="value purple">32%</div>
            </div>
          </div>

          <h3>6.2 {t('technicalWhitepaper.sections.tokenomics.emission.title')}</h3>
          <table className="tw-table">
            <thead>
              <tr>
                <th>{t('technicalWhitepaper.sections.tokenomics.emission.parameter')}</th>
                <th>{t('technicalWhitepaper.sections.tokenomics.emission.value')}</th>
                <th>{t('technicalWhitepaper.sections.tokenomics.emission.description')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{t('technicalWhitepaper.sections.tokenomics.emission.baseDailyEmission')}</td><td>500,000 TBURN</td><td>{t('technicalWhitepaper.sections.tokenomics.emission.baseDailyEmissionDesc')}</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.tokenomics.emission.aiBurnRate')}</td><td>70%</td><td>{t('technicalWhitepaper.sections.tokenomics.emission.aiBurnRateDesc')}</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.tokenomics.emission.netDailyEmission')}</td><td>150,000 TBURN</td><td>{t('technicalWhitepaper.sections.tokenomics.emission.netDailyEmissionDesc')}</td></tr>
            </tbody>
          </table>

          <h3>6.3 {t('technicalWhitepaper.sections.tokenomics.priceDiscovery.title')}</h3>
          <p>{t('technicalWhitepaper.sections.tokenomics.priceDiscovery.desc')}</p>
          <div className="tw-formula">
            <div className="title">{t('technicalWhitepaper.sections.tokenomics.priceDiscovery.formulaTitle')}</div>
            <div className="equation">P = P₀ × (1 + α·TPS_Util + β·Activity + γ·Confidence) / (1 + δ·NetEmission + ε·StakeLockup)</div>
          </div>

          <h3>6.4 {t('technicalWhitepaper.sections.tokenomics.gasEconomics.title')}</h3>
          <p>{t('technicalWhitepaper.sections.tokenomics.gasEconomics.desc')}</p>
          <ul>
            <li><strong>1 TBURN = 1,000,000 EMB</strong></li>
            <li><strong>1 EMB = 10¹² wei</strong></li>
            <li><strong>{t('technicalWhitepaper.sections.tokenomics.gasEconomics.standardGasPrice')}:</strong> 10 EMB</li>
          </ul>
        </section>

        <section id="token-standards" className="tw-section">
          <h2>7. {t('technicalWhitepaper.sections.tokenStandards.title')}</h2>
          <p>{t('technicalWhitepaper.sections.tokenStandards.intro')}</p>

          <h3>7.1 TBC-20 ({t('technicalWhitepaper.sections.tokenStandards.tbc20.subtitle')})</h3>
          <p>{t('technicalWhitepaper.sections.tokenStandards.tbc20.desc')}</p>
          <ul>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc20.feature1')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc20.feature2')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc20.feature3')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc20.feature4')}</li>
          </ul>

          <h3>7.2 TBC-721 ({t('technicalWhitepaper.sections.tokenStandards.tbc721.subtitle')})</h3>
          <p>{t('technicalWhitepaper.sections.tokenStandards.tbc721.desc')}</p>
          <ul>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc721.feature1')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc721.feature2')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc721.feature3')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc721.feature4')}</li>
          </ul>

          <h3>7.3 TBC-1155 ({t('technicalWhitepaper.sections.tokenStandards.tbc1155.subtitle')})</h3>
          <p>{t('technicalWhitepaper.sections.tokenStandards.tbc1155.desc')}</p>
          <ul>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc1155.feature1')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc1155.feature2')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc1155.feature3')}</li>
            <li>{t('technicalWhitepaper.sections.tokenStandards.tbc1155.feature4')}</li>
          </ul>

          <h3>7.4 {t('technicalWhitepaper.sections.tokenStandards.quantumResistant.title')}</h3>
          <p>{t('technicalWhitepaper.sections.tokenStandards.quantumResistant.desc')}</p>
          <ul>
            <li><strong>SPHINCS+:</strong> {t('technicalWhitepaper.sections.tokenStandards.quantumResistant.sphincs')}</li>
            <li><strong>CRYSTALS-Dilithium:</strong> {t('technicalWhitepaper.sections.tokenStandards.quantumResistant.crystals')}</li>
            <li><strong>{t('technicalWhitepaper.sections.tokenStandards.quantumResistant.hybridMode')}:</strong> {t('technicalWhitepaper.sections.tokenStandards.quantumResistant.hybridModeDesc')}</li>
          </ul>
        </section>

        <section id="defi" className="tw-section">
          <h2>8. {t('technicalWhitepaper.sections.defi.title')}</h2>
          <p>{t('technicalWhitepaper.sections.defi.intro')}</p>

          <h3>8.1 {t('technicalWhitepaper.sections.defi.dex.title')}</h3>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.defi.dex.amm')}:</strong> {t('technicalWhitepaper.sections.defi.dex.ammDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.dex.orderBook')}:</strong> {t('technicalWhitepaper.sections.defi.dex.orderBookDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.dex.twap')}:</strong> {t('technicalWhitepaper.sections.defi.dex.twapDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.dex.mev')}:</strong> {t('technicalWhitepaper.sections.defi.dex.mevDesc')}</li>
          </ul>

          <h3>8.2 {t('technicalWhitepaper.sections.defi.lending.title')}</h3>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.defi.lending.collateralized')}:</strong> {t('technicalWhitepaper.sections.defi.lending.collateralizedDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.lending.variableRates')}:</strong> {t('technicalWhitepaper.sections.defi.lending.variableRatesDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.lending.liquidation')}:</strong> {t('technicalWhitepaper.sections.defi.lending.liquidationDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.lending.flashLoans')}:</strong> {t('technicalWhitepaper.sections.defi.lending.flashLoansDesc')}</li>
          </ul>

          <h3>8.3 {t('technicalWhitepaper.sections.defi.staking.title')}</h3>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.defi.staking.native')}:</strong> {t('technicalWhitepaper.sections.defi.staking.nativeDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.staking.liquid')}:</strong> {t('technicalWhitepaper.sections.defi.staking.liquidDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.staking.pools')}:</strong> {t('technicalWhitepaper.sections.defi.staking.poolsDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.staking.unbonding')}:</strong> {t('technicalWhitepaper.sections.defi.staking.unbondingDesc')}</li>
          </ul>

          <h3>8.4 {t('technicalWhitepaper.sections.defi.yieldFarming.title')}</h3>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.defi.yieldFarming.liquidityMining')}:</strong> {t('technicalWhitepaper.sections.defi.yieldFarming.liquidityMiningDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.yieldFarming.autoCompounding')}:</strong> {t('technicalWhitepaper.sections.defi.yieldFarming.autoCompoundingDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.defi.yieldFarming.multiAsset')}:</strong> {t('technicalWhitepaper.sections.defi.yieldFarming.multiAssetDesc')}</li>
          </ul>

          <h3>8.5 {t('technicalWhitepaper.sections.defi.bridge.title')}</h3>
          <table className="tw-table">
            <thead>
              <tr>
                <th>{t('technicalWhitepaper.sections.defi.bridge.feature')}</th>
                <th>{t('technicalWhitepaper.sections.defi.bridge.specification')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{t('technicalWhitepaper.sections.defi.bridge.supportedChains')}</td><td>Ethereum, BNB Chain, Polygon, Arbitrum, Solana</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.defi.bridge.securityModel')}</td><td>{t('technicalWhitepaper.sections.defi.bridge.securityModelDesc')}</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.defi.bridge.transferTime')}</td><td>{t('technicalWhitepaper.sections.defi.bridge.transferTimeDesc')}</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.defi.bridge.feeStructure')}</td><td>0.1% + {t('technicalWhitepaper.sections.defi.bridge.gasCosts')}</td></tr>
            </tbody>
          </table>
        </section>

        <section id="security" className="tw-section">
          <h2>9. {t('technicalWhitepaper.sections.security.title')}</h2>
          <p>{t('technicalWhitepaper.sections.security.intro')}</p>

          <h3>9.1 {t('technicalWhitepaper.sections.security.cryptographic.title')}</h3>
          <table className="tw-table">
            <thead>
              <tr>
                <th>{t('technicalWhitepaper.sections.security.cryptographic.function')}</th>
                <th>{t('technicalWhitepaper.sections.security.cryptographic.algorithm')}</th>
                <th>{t('technicalWhitepaper.sections.security.cryptographic.securityLevel')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{t('technicalWhitepaper.sections.security.cryptographic.txSigning')}</td><td>ECDSA secp256k1</td><td>128-bit</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.security.cryptographic.blockHashing')}</td><td>Keccak-256</td><td>256-bit</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.security.cryptographic.stateTree')}</td><td>Merkle Patricia Trie</td><td>256-bit</td></tr>
              <tr><td>{t('technicalWhitepaper.sections.security.cryptographic.quantumResistant')}</td><td>SPHINCS+ / Dilithium</td><td>NIST Level 3</td></tr>
            </tbody>
          </table>

          <h3>9.2 {t('technicalWhitepaper.sections.security.slashing.title')}</h3>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.security.slashing.doubleSigning')}:</strong> {t('technicalWhitepaper.sections.security.slashing.doubleSigningPenalty')}</li>
            <li><strong>{t('technicalWhitepaper.sections.security.slashing.prolongedDowntime')}:</strong> {t('technicalWhitepaper.sections.security.slashing.prolongedDowntimePenalty')}</li>
            <li><strong>{t('technicalWhitepaper.sections.security.slashing.invalidBlock')}:</strong> {t('technicalWhitepaper.sections.security.slashing.invalidBlockPenalty')}</li>
            <li><strong>{t('technicalWhitepaper.sections.security.slashing.censorship')}:</strong> {t('technicalWhitepaper.sections.security.slashing.censorshipPenalty')}</li>
          </ul>

          <h3>9.3 {t('technicalWhitepaper.sections.security.aiDriven.title')}</h3>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.security.aiDriven.anomalyDetection')}:</strong> {t('technicalWhitepaper.sections.security.aiDriven.anomalyDetectionDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.security.aiDriven.attackPrevention')}:</strong> {t('technicalWhitepaper.sections.security.aiDriven.attackPreventionDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.security.aiDriven.vulnerabilityScanning')}:</strong> {t('technicalWhitepaper.sections.security.aiDriven.vulnerabilityScanningDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.security.aiDriven.incidentResponse')}:</strong> {t('technicalWhitepaper.sections.security.aiDriven.incidentResponseDesc')}</li>
          </ul>

          <h3>9.4 {t('technicalWhitepaper.sections.security.bugBounty.title')}</h3>
          <table className="tw-table">
            <thead>
              <tr>
                <th>{t('technicalWhitepaper.sections.security.bugBounty.severity')}</th>
                <th>{t('technicalWhitepaper.sections.security.bugBounty.rewardRange')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Critical</td><td>$50,000 - $250,000</td></tr>
              <tr><td>High</td><td>$10,000 - $50,000</td></tr>
              <tr><td>Medium</td><td>$2,000 - $10,000</td></tr>
              <tr><td>Low</td><td>$500 - $2,000</td></tr>
            </tbody>
          </table>
        </section>

        <section id="governance" className="tw-section">
          <h2>10. {t('technicalWhitepaper.sections.governance.title')}</h2>
          <p>{t('technicalWhitepaper.sections.governance.intro')}</p>

          <h3>10.1 {t('technicalWhitepaper.sections.governance.process.title')}</h3>
          <ol>
            <li><strong>{t('technicalWhitepaper.sections.governance.process.submission')}:</strong> {t('technicalWhitepaper.sections.governance.process.submissionDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.governance.process.aiPrevalidation')}:</strong> {t('technicalWhitepaper.sections.governance.process.aiPrevalidationDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.governance.process.discussion')}:</strong> {t('technicalWhitepaper.sections.governance.process.discussionDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.governance.process.voting')}:</strong> {t('technicalWhitepaper.sections.governance.process.votingDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.governance.process.execution')}:</strong> {t('technicalWhitepaper.sections.governance.process.executionDesc')}</li>
          </ol>

          <h3>10.2 {t('technicalWhitepaper.sections.governance.votingPower.title')}</h3>
          <p>{t('technicalWhitepaper.sections.governance.votingPower.desc')}</p>
          <div className="tw-formula">
            <div className="title">{t('technicalWhitepaper.sections.governance.votingPower.formulaTitle')}</div>
            <div className="equation">VP = StakedAmount × TrustScore × TimeLockMultiplier</div>
          </div>

          <h3>10.3 {t('technicalWhitepaper.sections.governance.proposalTypes.title')}</h3>
          <ul>
            <li><strong>{t('technicalWhitepaper.sections.governance.proposalTypes.parameterChanges')}:</strong> {t('technicalWhitepaper.sections.governance.proposalTypes.parameterChangesDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.governance.proposalTypes.treasurySpending')}:</strong> {t('technicalWhitepaper.sections.governance.proposalTypes.treasurySpendingDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.governance.proposalTypes.protocolUpgrades')}:</strong> {t('technicalWhitepaper.sections.governance.proposalTypes.protocolUpgradesDesc')}</li>
            <li><strong>{t('technicalWhitepaper.sections.governance.proposalTypes.emergencyActions')}:</strong> {t('technicalWhitepaper.sections.governance.proposalTypes.emergencyActionsDesc')}</li>
          </ul>
        </section>

        <section id="roadmap" className="tw-section">
          <h2>11. {t('technicalWhitepaper.sections.roadmap.title')}</h2>

          <h3>{t('technicalWhitepaper.sections.roadmap.phase1.title')}</h3>
          <ul>
            <li>{t('technicalWhitepaper.sections.roadmap.phase1.item1')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase1.item2')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase1.item3')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase1.item4')}</li>
          </ul>

          <h3>{t('technicalWhitepaper.sections.roadmap.phase2.title')}</h3>
          <ul>
            <li>{t('technicalWhitepaper.sections.roadmap.phase2.item1')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase2.item2')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase2.item3')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase2.item4')}</li>
          </ul>

          <h3>{t('technicalWhitepaper.sections.roadmap.phase3.title')}</h3>
          <ul>
            <li>{t('technicalWhitepaper.sections.roadmap.phase3.item1')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase3.item2')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase3.item3')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase3.item4')}</li>
          </ul>

          <h3>{t('technicalWhitepaper.sections.roadmap.phase4.title')}</h3>
          <ul>
            <li>{t('technicalWhitepaper.sections.roadmap.phase4.item1')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase4.item2')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase4.item3')}</li>
            <li>{t('technicalWhitepaper.sections.roadmap.phase4.item4')}</li>
          </ul>
        </section>

        <section id="conclusion" className="tw-section">
          <h2>12. {t('technicalWhitepaper.sections.conclusion.title')}</h2>
          <p>{t('technicalWhitepaper.sections.conclusion.p1')}</p>
          <p>{t('technicalWhitepaper.sections.conclusion.p2')}</p>
          <div className="tw-info-box">
            <strong>{t('technicalWhitepaper.sections.conclusion.officialResources')}:</strong><br/>
            Website: <a href="https://tburn.io">https://tburn.io</a><br/>
            Explorer: <a href="https://tburn.io/scan">https://tburn.io/scan</a><br/>
            Documentation: <a href="https://tburn.io/developers">https://tburn.io/developers</a>
          </div>
        </section>
      </main>

      <footer className="bg-[#12121a] border-t border-white/10 py-10">
        <div className="tw-container text-center">
          <p className="text-gray-500 text-sm">© 2025 TBURN Foundation. {t('technicalWhitepaper.footer.allRightsReserved')}</p>
          <p className="text-gray-600 text-xs mt-2">{t('technicalWhitepaper.footer.disclaimer')}</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="https://tburn.io" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Website</a>
            <a href="/learn/whitepaper" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Whitepaper</a>
            <a href="/developers" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Developers</a>
            <a href="/governance" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Governance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
