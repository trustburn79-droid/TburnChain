import { Link } from "wouter";
import { SiX, SiGithub, SiDiscord, SiTelegram, SiMedium } from "react-icons/si";
import { Mail, Globe, Shield, Zap, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import "../styles/public.css";

const socialLinks = [
  { icon: SiX, href: "https://twitter.com/tburnchain", label: "Twitter" },
  { icon: SiGithub, href: "https://github.com/tburnchain", label: "GitHub" },
  { icon: SiDiscord, href: "https://discord.gg/tburnchain", label: "Discord" },
  { icon: SiTelegram, href: "https://t.me/tburnchain", label: "Telegram" },
  { icon: SiMedium, href: "https://medium.com/@tburnchain", label: "Medium" },
];

const ecosystemLinks = [
  { titleKey: "validators", href: "/network/validators" },
  { titleKey: "bridge", href: "/solutions/cross-chain-bridge" },
  { titleKey: "explorer", href: "/app" },
  { titleKey: "staking", href: "/app/staking" },
  { titleKey: "dex", href: "/app/dex" },
  { titleKey: "nftMarketplace", href: "/app/nft-marketplace" },
  { titleKey: "lending", href: "/app/lending" },
  { titleKey: "yieldFarming", href: "/app/yield-farming" },
];

const solutionsLinks = [
  { titleKey: "defiHub", href: "/solutions/defi-hub" },
  { titleKey: "enterprise", href: "/use-cases/enterprise" },
  { titleKey: "aiFeatures", href: "/solutions/ai-features" },
  { titleKey: "tokenExtensions", href: "/solutions/token-extensions" },
  { titleKey: "gameTooling", href: "/solutions/game-tooling" },
  { titleKey: "btcfi", href: "/solutions/btcfi" },
  { titleKey: "payments", href: "/solutions/payments" },
  { titleKey: "actionsBlinks", href: "/solutions/actions-blinks" },
];

const developersLinks = [
  { titleKey: "documentation", href: "/developers/docs" },
  { titleKey: "quickstart", href: "/developers/quickstart" },
  { titleKey: "apiReference", href: "/developers/api" },
  { titleKey: "sdkGuide", href: "/developers/sdk" },
  { titleKey: "smartContracts", href: "/developers/contracts" },
  { titleKey: "websocketApi", href: "/developers/websocket" },
  { titleKey: "cliReference", href: "/developers/cli" },
  { titleKey: "github", href: "https://github.com/tburnchain", external: true },
];

const resourcesLinks = [
  { titleKey: "whitepaper", href: "/learn/whitepaper" },
  { titleKey: "tokenomics", href: "/learn/tokenomics" },
  { titleKey: "roadmap", href: "/learn/roadmap" },
  { titleKey: "apiStatus", href: "/network/status" },
  { titleKey: "rpcEndpoints", href: "/network/rpc" },
  { titleKey: "blockchainBasics", href: "/learn/blockchain-basics" },
  { titleKey: "defiMastery", href: "/learn/defi-mastery" },
  { titleKey: "educationPrograms", href: "/learn/education-programs" },
];

const communityLinks = [
  { titleKey: "newsBlog", href: "/community/news" },
  { titleKey: "events", href: "/community/events" },
  { titleKey: "communityHub", href: "/community/hub" },
  { titleKey: "governance", href: "/app/governance" },
  { titleKey: "fiatRamp", href: "/network/ramp" },
];

const legalLinks = [
  { titleKey: "termsOfService", href: "/legal/terms-of-service" },
  { titleKey: "privacyPolicy", href: "/legal/privacy-policy" },
  { titleKey: "disclaimer", href: "/legal/disclaimer" },
];

const quickLinks = [
  { title: "TBurn Scan", href: "/scan" },
  { title: "VC", href: "/vc" },
];

export function PublicFooter() {
  const { t } = useTranslation();

  const { data: networkStats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/public/v1/network/stats'],
    refetchInterval: 30000,
  });

  const stats = networkStats?.data ? [
    { 
      value: networkStats.data.blockHeight >= 1000000 
        ? Math.floor(networkStats.data.blockHeight / 1000000) + "M+" 
        : networkStats.data.blockHeight?.toLocaleString() || "20M+", 
      labelKey: "blocks" 
    },
    { value: String(networkStats.data.activeValidators || 125), labelKey: "validators" },
    { 
      value: networkStats.data.totalTransactions >= 1000 
        ? Math.floor(networkStats.data.totalTransactions / 1000) + "K+" 
        : networkStats.data.totalTransactions?.toLocaleString() || "50K+", 
      labelKey: "dailyTxs" 
    },
    { value: networkStats.data.uptime || "99.99%", labelKey: "uptime" },
  ] : [
    { value: "20M+", labelKey: "blocks" },
    { value: "125", labelKey: "validators" },
    { value: "67K+", labelKey: "dailyTxs" },
    { value: "99.99%", labelKey: "uptime" },
  ];

  return (
    <footer className="border-t border-white/5 bg-black/80 backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#7000ff]/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-12 border-b border-white/5">
          {stats.map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{t(`publicPages.footer.stats.${stat.labelKey}`)}</div>
            </div>
          ))}
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Flame className="w-7 h-7 text-orange-500" />
              <span className="text-xl font-bold text-white">TBurn Lab</span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {t('publicPages.footer.brandDescription')}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-[#00f0ff]/50 transition"
                  aria-label={social.label}
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <a 
              href="mailto:contact@tburn.io" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00f0ff] transition"
            >
              <Mail className="w-4 h-4" />
              contact@tburn.io
            </a>
          </div>
          
          {/* Ecosystem */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00f0ff]" />
              {t('publicPages.footer.ecosystem')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {ecosystemLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {t(`publicPages.footer.ecosystemLinks.${link.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#7000ff]" />
              {t('publicPages.footer.solutions')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {solutionsLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {t(`publicPages.footer.solutionsLinks.${link.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Developers */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-[#00f0ff] font-mono text-xs">&lt;/&gt;</span>
              {t('publicPages.footer.developers')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {developersLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#00f0ff] transition inline-block"
                    >
                      {t(`publicPages.footer.developersLinks.${link.titleKey}`)}
                    </a>
                  ) : (
                    <Link 
                      href={link.href} 
                      className="hover:text-[#00f0ff] transition inline-block"
                    >
                      {t(`publicPages.footer.developersLinks.${link.titleKey}`)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              {t('publicPages.footer.resources')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {resourcesLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {t(`publicPages.footer.resourcesLinks.${link.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-[#ffd700]">★</span>
              {t('publicPages.footer.community')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {communityLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {t(`publicPages.footer.communityLinks.${link.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-bold mb-1">{t('publicPages.footer.stayUpdated')}</h4>
              <p className="text-sm text-gray-400">{t('publicPages.footer.newsletterDesc')}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="email" 
                placeholder={t('publicPages.footer.enterEmail')}
                className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
                data-testid="input-footer-email"
              />
              <button 
                className="px-5 py-2.5 rounded-lg bg-[#7000ff] text-white font-semibold text-sm hover:bg-purple-600 transition whitespace-nowrap"
                data-testid="button-footer-subscribe"
              >
                {t('publicPages.footer.subscribe')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              {t('publicPages.footer.copyright')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              {quickLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-[#00f0ff] hover:text-white transition font-medium"
                  data-testid={`link-footer-${link.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            {legalLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="hover:text-gray-300 transition"
              >
                {t(`publicPages.footer.${link.titleKey}`)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
