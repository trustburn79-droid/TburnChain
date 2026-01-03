import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ChevronRight, Folder, FileText } from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";
import { UnifiedHeaderNav } from "@/components/unified-header-nav";

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
    path: "#token-distribution",
    label: "Token Distribution",
    children: [
      { path: "/airdrop", label: "Airdrop Program" },
      { path: "/referral", label: "Referral Program" },
      { path: "/events", label: "Event Center" },
      { path: "/community-program", label: "Community Program" },
      { path: "/dao-governance", label: "DAO Governance" },
      { path: "/block-rewards", label: "Block Rewards" },
      { path: "/validator-incentives", label: "Validator Incentives" },
      { path: "/ecosystem-fund", label: "Ecosystem Fund" },
      { path: "/partnership-program", label: "Partnership Program" },
      { path: "/marketing-program", label: "Marketing Program" },
      { path: "/strategic-partner", label: "Strategic Partner" },
      { path: "/advisor-program", label: "Advisor Program" },
      { path: "/seed-round", label: "Seed Round" },
      { path: "/private-round", label: "Private Round" },
      { path: "/public-round", label: "Public Round" },
      { path: "/launchpad", label: "Launchpad" },
      { path: "/coinlist", label: "CoinList" },
      { path: "/dao-maker", label: "DAO Maker SHO" },
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
  {
    path: "/validator",
    label: "Validator",
    children: [
      { path: "/validator", label: "Command Center" },
      { path: "/validator/infrastructure", label: "Infrastructure" },
      { path: "/validator/:id", label: "Validator Detail" },
      { path: "/validator-governance", label: "Governance & Rewards" },
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
    path: "/admin",
    label: "Admin Portal (17 Groups, 90+ Pages)",
    children: [
      {
        path: "#admin-system-dashboard",
        label: "1. System Dashboard",
        children: [
          { path: "/admin", label: "Unified Dashboard" },
          { path: "/admin/performance", label: "Performance Monitor" },
          { path: "/admin/health", label: "System Health" },
          { path: "/admin/alerts", label: "Alert Center" },
          { path: "/admin/logs", label: "Log Viewer" },
        ]
      },
      {
        path: "#admin-network-ops",
        label: "2. Network Operations",
        children: [
          { path: "/admin/nodes", label: "Node Management" },
          { path: "/admin/validators", label: "Validator Management" },
          { path: "/admin/members", label: "Member Management" },
          { path: "/admin/consensus", label: "Consensus Monitor" },
          { path: "/admin/shards", label: "Shard Management" },
          { path: "/admin/network-params", label: "Network Parameters" },
        ]
      },
      {
        path: "#admin-token-economy",
        label: "3. Token & Economy",
        children: [
          { path: "/admin/token-issuance", label: "Token Issuance" },
          { path: "/admin/burn-control", label: "Burn Control" },
          { path: "/admin/treasury", label: "Treasury Management" },
          { path: "/admin/economics", label: "Economic Models" },
          { path: "/admin/tokenomics", label: "Tokenomics Simulation" },
          { path: "/admin/token-distribution", label: "Token Distribution Hub" },
        ]
      },
      {
        path: "#admin-token-distribution",
        label: "3-1. Token Distribution (18 Sub-Pages)",
        children: [
          { path: "/admin/token-distribution/airdrop", label: "Airdrop Program" },
          { path: "/admin/token-distribution/referral", label: "Referral Program" },
          { path: "/admin/token-distribution/events", label: "Events Center" },
          { path: "/admin/token-distribution/community-program", label: "Community Program" },
          { path: "/admin/token-distribution/dao-governance", label: "DAO Governance" },
          { path: "/admin/token-distribution/block-rewards", label: "Block Rewards" },
          { path: "/admin/token-distribution/validator-incentives", label: "Validator Incentives" },
          { path: "/admin/token-distribution/ecosystem-fund", label: "Ecosystem Fund" },
          { path: "/admin/token-distribution/partnership-program", label: "Partnership Program" },
          { path: "/admin/token-distribution/marketing-program", label: "Marketing Program" },
          { path: "/admin/token-distribution/strategic-partner", label: "Strategic Partner" },
          { path: "/admin/token-distribution/advisor-program", label: "Advisor Program" },
          { path: "/admin/token-distribution/seed-round", label: "Seed Round" },
          { path: "/admin/token-distribution/private-round", label: "Private Round" },
          { path: "/admin/token-distribution/public-round", label: "Public Round" },
          { path: "/admin/token-distribution/launchpad", label: "Launchpad" },
          { path: "/admin/token-distribution/coinlist", label: "CoinList" },
          { path: "/admin/token-distribution/dao-maker", label: "DAO Maker SHO" },
        ]
      },
      {
        path: "#admin-ai-systems",
        label: "4. AI Systems",
        children: [
          { path: "/admin/ai", label: "AI Orchestration" },
          { path: "/admin/ai-training", label: "Model Training" },
          { path: "/admin/ai-analytics", label: "Decision Analytics" },
          { path: "/admin/ai-tuning", label: "Parameter Tuning" },
        ]
      },
      {
        path: "#admin-bridge",
        label: "5. Bridge & Cross-Chain",
        children: [
          { path: "/admin/bridge", label: "Bridge Dashboard" },
          { path: "/admin/bridge-transfers", label: "Transfer Monitor" },
          { path: "/admin/bridge-validators", label: "Bridge Validators" },
          { path: "/admin/chains", label: "Chain Connections" },
          { path: "/admin/bridge-liquidity", label: "Liquidity Management" },
        ]
      },
      {
        path: "#admin-security",
        label: "6. Security & Audit",
        children: [
          { path: "/admin/security", label: "Security Dashboard" },
          { path: "/admin/access-control", label: "Access Control" },
          { path: "/admin/audit-logs", label: "Audit Logs" },
          { path: "/admin/threats", label: "Threat Detection" },
          { path: "/admin/compliance", label: "Compliance" },
          { path: "/admin/bug-bounty", label: "Bug Bounty" },
        ]
      },
      {
        path: "#admin-data-analytics",
        label: "7. Data & Analytics",
        children: [
          { path: "/admin/bi", label: "BI Dashboard" },
          { path: "/admin/tx-analytics", label: "Transaction Analytics" },
          { path: "/admin/user-analytics", label: "User Analytics" },
          { path: "/admin/network-analytics", label: "Network Analytics" },
          { path: "/admin/reports", label: "Custom Reports" },
        ]
      },
      {
        path: "#admin-operations",
        label: "8. Operations Tools",
        children: [
          { path: "/admin/emergency", label: "Emergency Controls" },
          { path: "/admin/maintenance", label: "Maintenance Mode" },
          { path: "/admin/backup", label: "Backup & Restore" },
          { path: "/admin/updates", label: "System Updates" },
        ]
      },
      {
        path: "#admin-configuration",
        label: "9. Configuration",
        children: [
          { path: "/admin/settings", label: "System Settings" },
          { path: "/admin/api-config", label: "API Configuration" },
          { path: "/admin/integrations", label: "Integrations" },
          { path: "/admin/notification-settings", label: "Notifications" },
          { path: "/admin/appearance", label: "Appearance" },
        ]
      },
      {
        path: "#admin-user-management",
        label: "10. User Management",
        children: [
          { path: "/admin/accounts", label: "Admin Accounts" },
          { path: "/admin/roles", label: "Role Management" },
          { path: "/admin/permissions", label: "Permissions" },
          { path: "/admin/activity", label: "Activity History" },
          { path: "/admin/sessions", label: "Session Management" },
        ]
      },
      {
        path: "#admin-governance",
        label: "11. Governance",
        children: [
          { path: "/admin/proposals", label: "Proposal Management" },
          { path: "/admin/voting-config", label: "Voting Configuration" },
          { path: "/admin/execution", label: "Execution Monitor" },
          { path: "/admin/gov-params", label: "Gov Parameters" },
          { path: "/admin/community-feedback", label: "Community Feedback" },
          { path: "/admin/community-content", label: "Community Content" },
        ]
      },
      {
        path: "#admin-developer-tools",
        label: "12. Developer Tools",
        children: [
          { path: "/admin/api-docs", label: "API Documentation" },
          { path: "/admin/sdk", label: "SDK Management" },
          { path: "/admin/contract-tools", label: "Contract Tools" },
          { path: "/admin/testnet", label: "Testnet Control" },
          { path: "/admin/debug", label: "Debug Console" },
        ]
      },
      {
        path: "#admin-monitoring",
        label: "13. Monitoring & Alerts",
        children: [
          { path: "/admin/realtime", label: "Real-Time Monitor" },
          { path: "/admin/metrics-explorer", label: "Metrics Explorer" },
          { path: "/admin/alert-rules", label: "Alert Rules" },
          { path: "/admin/dashboard-builder", label: "Dashboard Builder" },
          { path: "/admin/sla", label: "SLA Monitoring" },
        ]
      },
      {
        path: "#admin-finance",
        label: "14. Finance & Accounting",
        children: [
          { path: "/admin/finance", label: "Finance Overview" },
          { path: "/admin/tx-accounting", label: "TX Accounting" },
          { path: "/admin/budget", label: "Budget Management" },
          { path: "/admin/cost-analysis", label: "Cost Analysis" },
          { path: "/admin/tax", label: "Tax Reporting" },
        ]
      },
      {
        path: "#admin-education",
        label: "15. Education & Support",
        children: [
          { path: "/admin/help", label: "Help Center" },
          { path: "/admin/training", label: "Training Materials" },
          { path: "/admin/tickets", label: "Support Tickets" },
          { path: "/admin/feedback", label: "Feedback System" },
          { path: "/admin/announcements", label: "Announcements" },
        ]
      },
      {
        path: "#admin-genesis",
        label: "16. Genesis Launch",
        children: [
          { path: "/admin/genesis", label: "Genesis Launch Control" },
        ]
      },
      {
        path: "#admin-marketing",
        label: "17. Marketing",
        children: [
          { path: "/admin/newsletter", label: "Newsletter Management" },
        ]
      },
    ]
  },
];

function TreeNode({ item, level = 0 }: { item: RouteItem; level?: number }) {
  const isCategory = item.path.startsWith("#");
  const hasChildren = item.children && item.children.length > 0;
  const isHomeRoot = item.path === "/" && item.label === "Home" && !hasChildren;
  
  if (isHomeRoot) {
    return (
      <div className="select-none">
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg">
          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <Link href={item.path} className="flex items-center gap-2 flex-1 group">
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {item.label}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono">
              {item.path}
            </span>
          </Link>
        </div>
        <Link href="/">
          <div className="flex items-center justify-center pt-2 pb-1 cursor-pointer hover:opacity-80 transition-opacity">
            <TBurnLogo className="w-24 h-24" showText={true} textColor="#000000" />
          </div>
        </Link>
        <div className="flex flex-col gap-1 px-3 pb-4">
          <a href="/whitepaper" className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 group">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">Whitepaper</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono">/whitepaper</span>
          </a>
          <a href="/technical-whitepaper" className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 group">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">Technical Whitepaper</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono">/technical-whitepaper</span>
          </a>
          <Link href="/token-schedule" className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 group">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">TokenSchedule</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono">/token-schedule</span>
          </Link>
          <Link href="/token-details" className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 group">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">TokenDetails</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono">/token-details</span>
          </Link>
        </div>
      </div>
    );
  }
  
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-1.5 cursor-pointer group" data-testid="link-tree-home">
                <div className="w-10 h-10 group-hover:scale-110 transition-transform">
                  <TBurnLogo className="w-10 h-10" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                  TBurn <span className="text-cyan-400 font-light">Chain</span>
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">/</span>
            <span className="hidden sm:inline text-slate-600 dark:text-slate-400">{t('tree.title', 'Site Map')}</span>
          </div>
          <UnifiedHeaderNav variant="light" />
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
          <p>{t('tree.adminNote', 'Admin Portal requires authentication. Access via /admin with valid credentials.')}</p>
        </div>
      </main>
      
      <footer className="border-t border-slate-200 dark:border-gray-800 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          © 2025 TBurn Chain. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
