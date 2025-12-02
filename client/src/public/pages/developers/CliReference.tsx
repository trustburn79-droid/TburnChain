import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Terminal, Download, Settings, Key, Play, 
  Book, Server, ArrowRight, HelpCircle
} from "lucide-react";
import { SiNpm } from "react-icons/si";

export default function CliReference() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("Project");

  const installMethods = [
    { name: "npm", command: "npm install -g @tburn/cli", icon: SiNpm, color: "#cb3837" },
    { name: "yarn", command: "yarn global add @tburn/cli", icon: null, label: "yarn", color: "#2188b6" },
    { name: "pnpm", command: "pnpm add -g @tburn/cli", icon: null, label: "pnpm", color: "#f9ad00" },
  ];

  const globalOptions = [
    { flag: "--network, -n", desc: t('publicPages.developers.cli.globalOptions.network') },
    { flag: "--config, -c", desc: t('publicPages.developers.cli.globalOptions.config') },
    { flag: "--verbose, -v", desc: t('publicPages.developers.cli.globalOptions.verbose') },
    { flag: "--json", desc: t('publicPages.developers.cli.globalOptions.json') },
    { flag: "--help, -h", desc: t('publicPages.developers.cli.globalOptions.help') },
  ];

  const envVars = [
    { name: "TBURN_API_KEY", required: true },
    { name: "TBURN_PRIVATE_KEY", required: false },
    { name: "TBURN_NETWORK", required: false },
  ];

  const commandCategories = [
    { name: t('publicPages.developers.cli.categories.project'), active: true },
    { name: t('publicPages.developers.cli.categories.contract') },
    { name: t('publicPages.developers.cli.categories.network') },
    { name: t('publicPages.developers.cli.categories.wallet') },
    { name: t('publicPages.developers.cli.categories.ai') },
  ];

  const commands = [
    {
      cmd: "tburn init",
      desc: t('publicPages.developers.cli.commands.init.desc'),
      usage: "tburn init [project-name] [options]",
      options: [
        { flag: "--template, -t", desc: t('publicPages.developers.cli.commands.init.options.template'), default: "react" },
        { flag: "--typescript", desc: t('publicPages.developers.cli.commands.init.options.typescript'), default: "true" },
      ],
      examples: `# Create React dApp
tburn init my-dapp --template=react

# Create Hardhat smart contract project
tburn init my-contracts --template=hardhat`,
    },
    {
      cmd: "tburn dev",
      desc: t('publicPages.developers.cli.commands.dev.desc'),
      usage: "tburn dev [options]",
      options: [
        { flag: "--port, -p", desc: t('publicPages.developers.cli.commands.dev.options.port'), default: "3000" },
        { flag: "--open", desc: t('publicPages.developers.cli.commands.dev.options.open'), default: "false" },
      ],
    },
    {
      cmd: "tburn build",
      desc: t('publicPages.developers.cli.commands.build.desc'),
      usage: "tburn build [options]",
      options: [
        { flag: "--outdir, -o", desc: t('publicPages.developers.cli.commands.build.options.outdir'), default: "dist" },
        { flag: "--sourcemap", desc: t('publicPages.developers.cli.commands.build.options.sourcemap'), default: "false" },
      ],
    },
    {
      cmd: "tburn deploy",
      desc: t('publicPages.developers.cli.commands.deploy.desc'),
      usage: "tburn deploy [contract] [options]",
      options: [
        { flag: "--network, -n", desc: t('publicPages.developers.cli.commands.deploy.options.network'), default: "mainnet" },
        { flag: "--verify", desc: t('publicPages.developers.cli.commands.deploy.options.verify'), default: "true" },
        { flag: "--gas-price", desc: t('publicPages.developers.cli.commands.deploy.options.gasPrice'), default: "auto" },
      ],
      examples: `# Deploy to mainnet
tburn deploy MyContract --network=mainnet

# Deploy to testnet with verification
tburn deploy Token --network=testnet --verify`,
    },
    {
      cmd: "tburn wallet",
      desc: t('publicPages.developers.cli.commands.wallet.desc'),
      usage: "tburn wallet [action] [options]",
      options: [
        { flag: "create", desc: t('publicPages.developers.cli.commands.wallet.options.create'), default: "" },
        { flag: "import", desc: t('publicPages.developers.cli.commands.wallet.options.import'), default: "" },
        { flag: "balance", desc: t('publicPages.developers.cli.commands.wallet.options.balance'), default: "" },
      ],
    },
  ];

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Terminal className="w-3 h-3" /> {t('publicPages.developers.cli.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('publicPages.developers.cli.title').split(' ')[0]} <span className="text-gradient">{t('publicPages.developers.cli.title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-4">
            {t('publicPages.developers.cli.subtitle')}
          </p>
          <span className="text-sm font-mono text-[#7000ff]">{t('publicPages.developers.cli.currentVersion')}: 4.2.1</span>
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-12 px-6 border-b border-white/5 bg-black/40">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Download className="w-6 h-6 text-[#00ff9d]" /> {t('publicPages.developers.cli.installation.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {installMethods.map((method, index) => (
              <div key={index} className="spotlight-card rounded-xl p-6 border border-white/10">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-white">{method.name}</span>
                  {method.icon ? (
                    <method.icon className="w-6 h-6" style={{ color: method.color }} />
                  ) : (
                    <span className="font-mono font-bold" style={{ color: method.color }}>{method.label}</span>
                  )}
                </div>
                <div className="bg-[#0d0d12] border border-white/10 rounded-lg p-3 font-mono text-xs text-gray-400">
                  {method.command}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm text-gray-400">
            <span>{t('publicPages.developers.cli.installation.verify')}:</span>
            <code className="bg-white/10 px-2 py-1 rounded text-white">tburn --version</code>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Global Options */}
              <div className="spotlight-card rounded-xl p-6 border border-white/10 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" /> {t('publicPages.developers.cli.globalOptionsTitle')}
                </h3>
                <ul className="space-y-3 text-sm font-mono">
                  {globalOptions.map((opt, index) => (
                    <li key={index} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                      <span className="text-[#00f0ff]">{opt.flag}</span>
                      <span className="text-gray-500 text-xs">{opt.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Environment Variables */}
              <div className="spotlight-card rounded-xl p-6 border border-white/10 bg-gradient-to-br from-red-900/10 to-transparent">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#ff0055]" /> {t('publicPages.developers.cli.environmentTitle')}
                </h3>
                <div className="space-y-3 text-xs">
                  {envVars.map((env, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <code className="text-white">{env.name}</code>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                        env.required 
                          ? "text-[#ff0055] border-[#ff0055]/30 bg-[#ff0055]/10" 
                          : "text-[#00f0ff] border-[#00f0ff]/30 bg-[#00f0ff]/10"
                      }`}>
                        {env.required ? t('publicPages.developers.cli.required') : t('publicPages.developers.cli.optional')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Links */}
              <div className="spotlight-card rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.developers.cli.relatedDocs')}</h3>
                <div className="space-y-2">
                  <Link href="/developers" className="block text-sm text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.developerHub')}
                  </Link>
                  <Link href="/developers/docs" className="block text-sm text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.documentation')}
                  </Link>
                  <Link href="/developers/api" className="block text-sm text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.apiReference')}
                  </Link>
                  <Link href="/developers/quickstart" className="block text-sm text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.quickStart')}
                  </Link>
                  <Link href="/developers/installation" className="block text-sm text-gray-400 hover:text-[#00f0ff] transition">
                    {t('publicPages.developers.cli.relatedLinks.installationGuide')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Commands Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {commandCategories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-3 py-1 rounded-full border text-xs font-bold transition ${
                      activeCategory === cat.name
                        ? "border-[#7000ff] text-[#7000ff]"
                        : "border-white/20 text-gray-400 hover:border-white hover:text-white"
                    }`}
                    data-testid={`button-category-${cat.name.toLowerCase()}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Command Cards */}
              {commands.map((command, index) => (
                <div key={index} className="spotlight-card rounded-xl p-8 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <code className="text-xl font-bold text-[#7000ff] font-mono">{command.cmd}</code>
                    <span className="text-gray-400 text-sm">{command.desc}</span>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('publicPages.developers.cli.usage')}</h4>
                    <div className="bg-[#0d0d12] border border-white/10 rounded-lg p-3 font-mono text-sm text-gray-400">
                      {command.usage}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('publicPages.developers.cli.options')}</h4>
                    <div className="space-y-2 text-sm">
                      {command.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex gap-4">
                          <code className="text-[#00f0ff] w-32 flex-shrink-0">{opt.flag}</code>
                          <span className="text-gray-400 flex-1">{opt.desc}</span>
                          {opt.default && (
                            <span className="text-xs text-gray-600">{t('publicPages.developers.cli.default')}: {opt.default}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {command.examples && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('publicPages.developers.cli.examples')}</h4>
                      <pre className="bg-[#0d0d12] border border-white/10 rounded-lg p-4 font-mono text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
                        {command.examples}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#7000ff]/5 to-transparent border-t border-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6" /> {t('publicPages.developers.cli.needHelp.title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/developers/docs"
              className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#7000ff] transition flex items-center gap-2 text-white"
              data-testid="link-sdk-docs"
            >
              <Book className="w-5 h-5 text-[#7000ff]" /> {t('publicPages.developers.cli.needHelp.sdkDocumentation')}
            </Link>
            <Link 
              href="/developers/api"
              className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00f0ff] transition flex items-center gap-2 text-white"
              data-testid="link-api-ref"
            >
              <Server className="w-5 h-5 text-[#00f0ff]" /> {t('publicPages.developers.cli.needHelp.apiReference')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
