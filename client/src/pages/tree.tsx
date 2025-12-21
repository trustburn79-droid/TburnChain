import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChevronRight, Home, Folder, FileText, ScanLine, User, Bug, Shield, Coins, ImageIcon, HelpCircle } from "lucide-react";

interface RouteItem {
  path: string;
  label: string;
  children?: RouteItem[];
}

const routeTree: RouteItem[] = [
  {
    path: "/",
    label: "Home",
    children: []
  },
  {
    path: "/scan",
    label: "TBURNScan (Mainnet)",
    children: [
      { path: "/scan/blocks", label: "Blocks" },
      { path: "/scan/txs", label: "Transactions" },
      { path: "/scan/validators", label: "Validators" },
      { path: "/scan/tokens", label: "Tokens" },
      { path: "/scan/stats", label: "Network Stats" },
    ]
  },
  {
    path: "/testnet-scan",
    label: "TBURNScan (Testnet)",
    children: [
      { path: "/testnet-scan/blocks", label: "Blocks" },
      { path: "/testnet-scan/txs", label: "Transactions" },
      { path: "/testnet-scan/validators", label: "Validators" },
      { path: "/testnet-scan/tokens", label: "Tokens" },
      { path: "/testnet-scan/stats", label: "Network Stats" },
      { path: "/testnet-scan/faucet", label: "Faucet" },
    ]
  },
  {
    path: "/user",
    label: "User Dashboard",
    children: [
      { path: "/user?section=wallet", label: "Wallet & Transfer" },
      { path: "/user?section=stakingDashboard", label: "Staking" },
      { path: "/user?section=governance", label: "Governance" },
      { path: "/user?section=network", label: "Network Status" },
    ]
  },
  {
    path: "/learn",
    label: "Learn",
    children: [
      { path: "/learn/what-is-burn-chain", label: "What is TBURN Chain" },
      { path: "/learn/trust-score", label: "Trust Score System" },
      { path: "/learn/wallet", label: "What is Wallet" },
      { path: "/learn/whitepaper", label: "Whitepaper" },
      { path: "/learn/tokenomics", label: "Tokenomics" },
      { path: "/learn/roadmap", label: "Roadmap" },
      { path: "/learn/blockchain-basics", label: "Blockchain Basics" },
      { path: "/learn/defi-mastery", label: "DeFi Mastery" },
      { path: "/learn/developer-course", label: "Developer Course" },
      { path: "/learn/intro-to-defi", label: "Intro to DeFi" },
      { path: "/learn/education-programs", label: "Education Programs" },
      { path: "/learn/education", label: "Universities" },
    ]
  },
  {
    path: "/developers",
    label: "Developers",
    children: [
      { path: "/developers/docs", label: "Documentation" },
      { path: "/developers/api", label: "API Docs" },
      { path: "/developers/cli", label: "CLI Reference" },
      { path: "/developers/sdk", label: "SDK Guide" },
      { path: "/developers/contracts", label: "Smart Contracts" },
      { path: "/developers/websocket", label: "WebSocket API" },
      { path: "/developers/examples", label: "Code Examples" },
      { path: "/developers/quickstart", label: "Quick Start" },
      { path: "/developers/installation", label: "Installation Guide" },
      { path: "/developers/evm-migration", label: "EVM Migration" },
    ]
  },
  {
    path: "#solutions",
    label: "Solutions",
    children: [
      { path: "/solutions/token-extensions", label: "Token Extensions" },
      { path: "/solutions/actions-blinks", label: "Actions & Blinks" },
      { path: "/solutions/wallets", label: "Wallets" },
      { path: "/solutions/permissioned", label: "Permissioned" },
      { path: "/solutions/game-tooling", label: "Game Tooling" },
      { path: "/solutions/payments", label: "Payments" },
      { path: "/solutions/commerce", label: "Commerce" },
      { path: "/solutions/financial", label: "Financial" },
      { path: "/solutions/ai-features", label: "AI Features" },
      { path: "/solutions/artists-creators", label: "Artists & Creators" },
      { path: "/solutions/btcfi", label: "BTCFi" },
      { path: "/solutions/cross-chain-bridge", label: "Cross-Chain Bridge" },
      { path: "/solutions/defi-hub", label: "DeFi Hub" },
    ]
  },
  {
    path: "#use-cases",
    label: "Use Cases",
    children: [
      { path: "/use-cases/tokenization", label: "Tokenization" },
      { path: "/use-cases/depin", label: "DePIN" },
      { path: "/use-cases/stablecoins", label: "Stablecoins" },
      { path: "/use-cases/institutional-payments", label: "Institutional Payments" },
      { path: "/use-cases/enterprise", label: "Enterprise" },
      { path: "/use-cases/gaming", label: "Gaming" },
    ]
  },
  {
    path: "#network",
    label: "Network",
    children: [
      { path: "/network/validators", label: "Validators" },
      { path: "/network/rpc", label: "RPC Providers" },
      { path: "/network/testnet-rpc", label: "Testnet RPC" },
      { path: "/network/status", label: "Network Status" },
      { path: "/network/ramp", label: "On/Off Ramp" },
    ]
  },
  {
    path: "#community",
    label: "Community",
    children: [
      { path: "/community/news", label: "News & Blog" },
      { path: "/community/events", label: "Events" },
      { path: "/community/hub", label: "Community Hub" },
    ]
  },
  {
    path: "#legal",
    label: "Legal",
    children: [
      { path: "/legal/terms-of-service", label: "Terms of Service" },
      { path: "/legal/privacy-policy", label: "Privacy Policy" },
      { path: "/legal/disclaimer", label: "Disclaimer" },
    ]
  },
  {
    path: "#standalone",
    label: "Standalone Pages",
    children: [
      { path: "/token-generator", label: "Token Generator" },
      { path: "/nft-marketplace", label: "NFT Marketplace" },
      { path: "/security-audit", label: "Security Audit" },
      { path: "/bug-bounty", label: "Bug Bounty" },
      { path: "/official-channels", label: "Official Channels" },
      { path: "/qna", label: "Q&A" },
      { path: "/launch-event", label: "Launch Event" },
      { path: "/vc", label: "VC Test Mode" },
    ]
  },
  {
    path: "/app",
    label: "App (Explorer)",
    children: [
      { path: "/app", label: "Dashboard" },
      { path: "/app/blocks", label: "Blocks" },
      { path: "/app/transactions", label: "Transactions" },
      { path: "/app/simulator", label: "Transaction Simulator" },
      { path: "/app/ai", label: "AI Orchestration" },
      { path: "/app/sharding", label: "Sharding" },
      { path: "/app/cross-shard", label: "Cross-Shard" },
      { path: "/app/wallets", label: "Wallets" },
      { path: "/app/wallet-dashboard", label: "Wallet Dashboard" },
      { path: "/app/bridge", label: "Bridge" },
      { path: "/app/governance", label: "Governance" },
      { path: "/app/burn", label: "Burn Dashboard" },
      { path: "/app/staking", label: "Staking" },
      { path: "/app/staking/rewards", label: "Staking Rewards" },
      { path: "/app/staking/sdk", label: "Staking SDK" },
      { path: "/app/dex", label: "DEX" },
      { path: "/app/lending", label: "Lending" },
      { path: "/app/yield-farming", label: "Yield Farming" },
      { path: "/app/liquid-staking", label: "Liquid Staking" },
      { path: "/app/nft-marketplace", label: "NFT Marketplace" },
      { path: "/app/nft-launchpad", label: "NFT Launchpad" },
      { path: "/app/gamefi", label: "GameFi" },
      { path: "/app/community", label: "Community" },
      { path: "/app/tokenomics", label: "Tokenomics Simulation" },
      { path: "/app/token-system", label: "Token System" },
      { path: "/app/contracts", label: "Smart Contracts" },
      { path: "/app/health", label: "Node Health" },
      { path: "/app/metrics", label: "Performance Metrics" },
      { path: "/app/consensus", label: "Consensus" },
      { path: "/app/api-keys", label: "API Keys" },
    ]
  },
  {
    path: "/app/operator",
    label: "Operator Portal",
    children: [
      { path: "/app/operator", label: "Dashboard" },
      { path: "/app/operator/members", label: "Members" },
      { path: "/app/operator/validators", label: "Validators" },
      { path: "/app/operator/security", label: "Security" },
      { path: "/app/operator/reports", label: "Reports" },
      { path: "/app/operator/staking", label: "Staking" },
    ]
  },
];

function TreeNode({ item, level = 0 }: { item: RouteItem; level?: number }) {
  const isCategory = item.path.startsWith("#");
  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
          isCategory 
            ? "text-slate-700 dark:text-slate-300 font-semibold" 
            : "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {hasChildren ? (
          <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
        
        {isCategory ? (
          <span className="text-sm">{item.label}</span>
        ) : (
          <Link href={item.path} className="flex items-center gap-2 flex-1 group">
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {item.label}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono">
              {item.path}
            </span>
          </Link>
        )}
      </div>
      
      {hasChildren && (
        <div className="border-l border-slate-200 dark:border-slate-700 ml-6">
          {item.children!.map((child, index) => (
            <TreeNode key={`${child.path}-${index}`} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreePage() {
  const { t } = useTranslation();
  
  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-tree-home">
                <Home className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-900 dark:text-white">TBURN</span>
              </div>
            </Link>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">/</span>
            <span className="hidden sm:inline text-slate-600 dark:text-slate-400">{t('tree.title', 'Site Map')}</span>
          </div>
          <div className="flex items-center gap-0 sm:gap-2">
            <div className="flex items-center gap-0 sm:gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9" data-testid="link-nav-home">
                      <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('nav.home', 'Home')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/scan">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9" data-testid="link-nav-scan">
                      <ScanLine className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('nav.scan', 'Scan')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/user">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9" data-testid="link-nav-user">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('nav.user', 'User')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/bug-bounty">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9" data-testid="link-nav-bug-bounty">
                      <Bug className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('nav.bugBounty', 'Bug Bounty')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/security-audit">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9" data-testid="link-nav-security-audit">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('nav.securityAudit', 'Security Audit')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/token-generator">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9" data-testid="link-nav-token-generator">
                      <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('nav.tokenGenerator', 'Token Generator')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/nft-marketplace">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9" data-testid="link-nav-nft-marketplace">
                      <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('nav.nftMarketplace', 'NFT Marketplace')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/qna">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9" data-testid="link-nav-qna">
                      <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('nav.qna', 'QnA')}</p></TooltipContent>
              </Tooltip>
              <div className="hidden sm:block w-px h-6 bg-border mx-1" />
            </div>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2" data-testid="text-tree-title">
            {t('tree.title', 'Site Map')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400" data-testid="text-tree-description">
            {t('tree.description', 'Browse all pages in TBURN ecosystem. Click any item to navigate.')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routeTree.map((item, index) => (
            <div 
              key={`${item.path}-${index}`}
              className="bg-white dark:bg-gray-800/50 rounded-xl border border-slate-200 dark:border-gray-700 p-4 shadow-sm"
            >
              <TreeNode item={item} />
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>{t('tree.excludeNote', 'Note: Admin routes are excluded from this list.')}</p>
        </div>
      </main>
      
      <footer className="border-t border-slate-200 dark:border-gray-800 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          © 2025 TBurn Chain. All rights reserved.
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
}
