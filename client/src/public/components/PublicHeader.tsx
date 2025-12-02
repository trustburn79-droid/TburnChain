import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ChevronDown, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import "../styles/public.css";

interface MenuItem {
  title: string;
  href: string;
  description?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  highlight?: boolean;
}

const menuStructure: MenuSection[] = [
  {
    title: "Learn",
    items: [
      { title: "Learn Hub", href: "/learn", description: "Get started with Burn Chain" },
      { title: "What is Burn Chain?", href: "/learn/what-is-burn-chain" },
      { title: "Trust Score System", href: "/learn/trust-score" },
      { title: "What is a Wallet?", href: "/learn/wallet" },
      { title: "Blockchain Basics", href: "/learn/blockchain-basics" },
      { title: "DeFi Mastery", href: "/learn/defi-mastery" },
      { title: "Developer Course", href: "/learn/developer-course" },
      { title: "Intro to DeFi", href: "/learn/intro-to-defi" },
      { title: "Education Programs", href: "/learn/education-programs" },
      { title: "Technical Whitepaper", href: "/learn/whitepaper" },
      { title: "Tokenomics", href: "/learn/tokenomics" },
      { title: "Roadmap", href: "/learn/roadmap" },
    ],
  },
  {
    title: "Developers",
    items: [
      { title: "Developer Hub", href: "/developers", description: "Build on Burn Chain" },
      { title: "Documentation", href: "/developers/docs" },
      { title: "API Reference", href: "/developers/api" },
      { title: "CLI Reference", href: "/developers/cli" },
      { title: "SDK Guide", href: "/developers/sdk" },
      { title: "Smart Contracts", href: "/developers/contracts" },
      { title: "WebSocket API", href: "/developers/websocket" },
      { title: "Code Examples", href: "/developers/examples" },
      { title: "Quick Start", href: "/developers/quickstart" },
      { title: "Installation Guide", href: "/developers/installation" },
      { title: "EVM Migration", href: "/developers/evm-migration" },
    ],
  },
  {
    title: "Solutions",
    items: [
      { title: "Token Extensions", href: "/solutions/token-extensions" },
      { title: "Actions & Blinks", href: "/solutions/actions-blinks" },
      { title: "Wallets", href: "/solutions/wallets" },
      { title: "Permissioned Environments", href: "/solutions/permissioned" },
      { title: "Game Tooling", href: "/solutions/game-tooling" },
      { title: "Payments", href: "/solutions/payments" },
      { title: "Commerce", href: "/solutions/commerce" },
      { title: "Financial Infrastructure", href: "/solutions/financial" },
      { title: "AI Features", href: "/solutions/ai-features" },
    ],
  },
  {
    title: "Use Cases",
    items: [
      { title: "Tokenization", href: "/use-cases/tokenization" },
      { title: "DePIN", href: "/use-cases/depin" },
      { title: "Stablecoins", href: "/use-cases/stablecoins" },
      { title: "Institutional Payments", href: "/use-cases/institutional-payments" },
      { title: "Enterprise", href: "/use-cases/enterprise" },
      { title: "Gaming & Entertainment", href: "/use-cases/gaming" },
    ],
  },
  {
    title: "Network",
    items: [
      { title: "Validators", href: "/network/validators" },
      { title: "RPC Providers", href: "/network/rpc" },
      { title: "Network Status", href: "/network/status" },
      { title: "Burn Chain Ramp", href: "/network/ramp" },
    ],
  },
  {
    title: "Community",
    highlight: true,
    items: [
      { title: "News & Blog", href: "/community/news" },
      { title: "Events", href: "/community/events" },
      { title: "Community", href: "/community/hub" },
    ],
  },
];

export function PublicHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(112,0,255,0.4)] group-hover:rotate-12 transition-transform">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              TBurn <span className="text-cyan-400 font-light">Chain</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {menuStructure.map((menu) => (
              <div
                key={menu.title}
                className="relative"
                onMouseEnter={() => setActiveMenu(menu.title)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors
                    ${menu.highlight 
                      ? "px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white"
                      : activeMenu === menu.title 
                        ? "text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  data-testid={`menu-${menu.title.toLowerCase()}`}
                >
                  {menu.title}
                  <ChevronDown className={`h-4 w-4 transition-transform ${activeMenu === menu.title ? "rotate-180" : ""}`} />
                </button>

                {activeMenu === menu.title && (
                  <div className="absolute left-0 top-full pt-2 z-50">
                    <div className="w-64 rounded-lg glass-panel p-2 shadow-xl border border-white/10">
                      {menu.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                          data-testid={`link-${item.href.replace(/\//g, '-').slice(1)}`}
                        >
                          <div className="font-medium text-white">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-gray-400 hover:text-white transition"
              data-testid="button-language"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-white transition"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/app">
              <button 
                className="glass-panel border border-cyan-400/30 text-cyan-400 px-6 py-2 rounded-lg text-sm font-bold hover:bg-cyan-400/10 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                data-testid="button-login"
              >
                Login Interface
              </button>
            </Link>

            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-white/5">
          <nav className="max-w-7xl mx-auto px-6 py-4">
            {menuStructure.map((menu) => (
              <div key={menu.title} className="mb-4">
                <div className="text-sm font-semibold text-white mb-2">{menu.title}</div>
                <div className="space-y-1 pl-4">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </nav>
  );
}
