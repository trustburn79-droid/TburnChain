import { Link } from "wouter";
import { SiX, SiGithub, SiDiscord, SiTelegram, SiMedium } from "react-icons/si";
import { Mail, Globe, Shield, Zap } from "lucide-react";
import "../styles/public.css";

const footerLinks = {
  ecosystem: [
    { title: "Validators", href: "/network/validators" },
    { title: "Bridge", href: "/solutions/cross-chain-bridge" },
    { title: "Explorer", href: "/app" },
    { title: "Staking", href: "/app/staking" },
    { title: "DEX", href: "/app/dex" },
    { title: "NFT Marketplace", href: "/app/nft-marketplace" },
  ],
  solutions: [
    { title: "DeFi Hub", href: "/solutions/defi-hub" },
    { title: "Enterprise", href: "/solutions/enterprise" },
    { title: "AI Orchestration", href: "/solutions/ai-orchestration" },
    { title: "Token Extensions", href: "/solutions/token-extensions" },
    { title: "GameFi", href: "/solutions/gamefi" },
    { title: "BTCfi", href: "/solutions/btcfi" },
  ],
  developers: [
    { title: "Documentation", href: "/developers/docs" },
    { title: "Quickstart", href: "/developers/quickstart" },
    { title: "API Reference", href: "/developers/api-reference" },
    { title: "SDKs & Tools", href: "/developers/sdks" },
    { title: "Smart Contracts", href: "/developers/smart-contracts" },
    { title: "GitHub", href: "https://github.com/tburnchain", external: true },
  ],
  resources: [
    { title: "Whitepaper", href: "/learn/whitepaper" },
    { title: "Tokenomics", href: "/learn/tokenomics" },
    { title: "Roadmap", href: "/learn/roadmap" },
    { title: "API Status", href: "/network/status" },
    { title: "RPC Endpoints", href: "/network/rpc" },
    { title: "Brand Assets", href: "/learn/brand-assets" },
  ],
  community: [
    { title: "News & Blog", href: "/community/news" },
    { title: "Events", href: "/community/events" },
    { title: "Community Hub", href: "/community/hub" },
    { title: "Ambassador Program", href: "/learn/ambassador" },
    { title: "Bug Bounty", href: "/developers/security" },
    { title: "Governance", href: "/app/governance" },
  ],
  legal: [
    { title: "Terms of Service", href: "/legal/terms" },
    { title: "Privacy Policy", href: "/legal/privacy" },
    { title: "Cookie Policy", href: "/legal/cookies" },
  ],
};

const socialLinks = [
  { icon: SiX, href: "https://twitter.com/tburnchain", label: "Twitter" },
  { icon: SiGithub, href: "https://github.com/tburnchain", label: "GitHub" },
  { icon: SiDiscord, href: "https://discord.gg/tburnchain", label: "Discord" },
  { icon: SiTelegram, href: "https://t.me/tburnchain", label: "Telegram" },
  { icon: SiMedium, href: "https://medium.com/@tburnchain", label: "Medium" },
];

const stats = [
  { value: "14M+", label: "Blocks" },
  { value: "125", label: "Validators" },
  { value: "50K+", label: "Daily TXs" },
  { value: "99.9%", label: "Uptime" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/80 backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#7000ff]/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-12 border-b border-white/5">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-white">TBurn Chain</span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              The world's first trust network powered by AI analysis. Verifying project reliability and ensuring transparency.
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
              href="mailto:contact@tburnchain.io" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00f0ff] transition"
            >
              <Mail className="w-4 h-4" />
              contact@tburnchain.io
            </a>
          </div>
          
          {/* Ecosystem */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00f0ff]" />
              Ecosystem
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {footerLinks.ecosystem.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#7000ff]" />
              Solutions
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {footerLinks.solutions.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Developers */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-[#00f0ff] font-mono text-xs">&lt;/&gt;</span>
              Developers
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {footerLinks.developers.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#00f0ff] transition inline-block"
                    >
                      {link.title}
                    </a>
                  ) : (
                    <Link 
                      href={link.href} 
                      className="hover:text-[#00f0ff] transition inline-block"
                    >
                      {link.title}
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
              Resources
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-[#ffd700]">★</span>
              Community
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {link.title}
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
              <h4 className="text-white font-bold mb-1">Stay Updated</h4>
              <p className="text-sm text-gray-400">Get the latest news and updates from TBurn Chain</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
                data-testid="input-footer-email"
              />
              <button 
                className="px-5 py-2.5 rounded-lg bg-[#7000ff] text-white font-semibold text-sm hover:bg-purple-600 transition whitespace-nowrap"
                data-testid="button-footer-subscribe"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            &copy; 2025 TBurn Chain Foundation. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            {footerLinks.legal.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="hover:text-gray-300 transition"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
