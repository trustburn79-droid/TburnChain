import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ChevronDown, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const menuStructure = [
  {
    title: "Learn",
    items: [
      { title: "Learn Hub", href: "/learn", description: "Get started with Burn Chain" },
      { title: "What is Burn Chain?", href: "/learn/what-is-burn-chain" },
      { title: "Trust Score System", href: "/learn/trust-score" },
      { title: "What is a Wallet?", href: "/learn/wallet" },
      { title: "Education Programs", href: "/learn/education" },
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
      { title: "API Documentation", href: "/developers/api" },
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
    ],
  },
  {
    title: "Use Cases",
    items: [
      { title: "Tokenization", href: "/use-cases/tokenization" },
      { title: "DePIN", href: "/use-cases/depin" },
      { title: "Stablecoins", href: "/use-cases/stablecoins" },
      { title: "Institutional Payments", href: "/use-cases/institutional" },
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Burn Chain
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {menuStructure.map((menu) => (
              <div
                key={menu.title}
                className="relative"
                onMouseEnter={() => setActiveMenu(menu.title)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${activeMenu === menu.title 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  data-testid={`menu-${menu.title.toLowerCase()}`}
                >
                  {menu.title}
                  <ChevronDown className={`h-4 w-4 transition-transform ${activeMenu === menu.title ? "rotate-180" : ""}`} />
                </button>

                {activeMenu === menu.title && (
                  <div className="absolute left-0 top-full pt-2 z-50">
                    <div className="w-64 rounded-lg border border-border bg-popover p-2 shadow-xl">
                      {menu.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                          data-testid={`link-${item.href.replace(/\//g, '-').slice(1)}`}
                        >
                          <div className="font-medium text-foreground">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" data-testid="button-language">
            <Globe className="h-5 w-5" />
          </Button>

          <Link href="/app">
            <Button variant="outline" size="sm" data-testid="button-login">
              Login
            </Button>
          </Link>

          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container px-4 py-4 mx-auto max-w-7xl">
            {menuStructure.map((menu) => (
              <div key={menu.title} className="mb-4">
                <div className="text-sm font-semibold text-foreground mb-2">{menu.title}</div>
                <div className="space-y-1 pl-4">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
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
    </header>
  );
}
