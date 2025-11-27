import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { DemoBanner } from "@/components/DemoBanner";
import { WebSocketProvider } from "@/lib/websocket-context";
import { MainnetRestartOverlay } from "@/components/mainnet-restart-overlay";
import { AdminPasswordProvider } from "@/hooks/use-admin-password";
import { OperatorAuthGuard } from "@/components/operator-auth-guard";

// Pages
import Dashboard from "@/pages/dashboard";
import Blocks from "@/pages/blocks";
import BlockDetail from "@/pages/block-detail";
import Transactions from "@/pages/transactions";
import TransactionDetail from "@/pages/transaction-detail";
import Validators from "@/pages/validators";
import ValidatorDetail from "@/pages/validator-detail";
import AIOrchestration from "@/pages/ai-orchestration";
import Sharding from "@/pages/sharding";
import CrossShard from "@/pages/cross-shard";
import Wallets from "@/pages/wallets";
import WalletDetail from "@/pages/wallet-detail";
import SmartContracts from "@/pages/smart-contracts";
import NodeHealth from "@/pages/node-health";
import PerformanceMetrics from "@/pages/performance-metrics";
import Consensus from "@/pages/consensus";
import TransactionSimulator from "@/pages/transaction-simulator";
import ApiKeys from "@/pages/api-keys";
import AdminPage from "@/pages/admin";
import Members from "@/pages/members";
import MemberDetail from "@/pages/member-detail";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

// Token System v4.0 Pages
import TokenSystem from "@/pages/token-system";
import Bridge from "@/pages/bridge";
import Governance from "@/pages/governance";
import BurnDashboard from "@/pages/burn";

// Staking Infrastructure Pages
import StakingDashboard from "@/pages/staking";
import StakingPoolDetail from "@/pages/staking-pool-detail";
import StakingRewards from "@/pages/staking-rewards";
import StakingSDK from "@/pages/staking-sdk";

// DEX Infrastructure Pages
import DexPage from "@/pages/dex";

// Lending Infrastructure Pages
import LendingPage from "@/pages/lending";

// Yield Farming Pages
import YieldFarmingPage from "@/pages/yield-farming";

// Liquid Staking Pages
import LiquidStakingPage from "@/pages/liquid-staking";

// NFT Marketplace Pages
import NftMarketplacePage from "@/pages/nft-marketplace";

// NFT Launchpad Pages
import NftLaunchpadPage from "@/pages/nft-launchpad";

// Operator Portal Pages
import OperatorDashboard from "@/pages/operator/dashboard";
import OperatorMembers from "@/pages/operator/members";
import OperatorValidators from "@/pages/operator/validators";
import OperatorSecurity from "@/pages/operator/security";
import OperatorReports from "@/pages/operator/reports";
import OperatorStaking from "@/pages/operator/staking";

// Wrapped Operator Portal Components to prevent re-mounting
function ProtectedOperatorDashboard() {
  return <OperatorAuthGuard><OperatorDashboard /></OperatorAuthGuard>;
}
function ProtectedOperatorMembers() {
  return <OperatorAuthGuard><OperatorMembers /></OperatorAuthGuard>;
}
function ProtectedOperatorValidators() {
  return <OperatorAuthGuard><OperatorValidators /></OperatorAuthGuard>;
}
function ProtectedOperatorSecurity() {
  return <OperatorAuthGuard><OperatorSecurity /></OperatorAuthGuard>;
}
function ProtectedOperatorReports() {
  return <OperatorAuthGuard><OperatorReports /></OperatorAuthGuard>;
}
function ProtectedOperatorStaking() {
  return <OperatorAuthGuard><OperatorStaking /></OperatorAuthGuard>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/blocks" component={Blocks} />
      <Route path="/blocks/:blockNumber" component={BlockDetail} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/transactions/:hash" component={TransactionDetail} />
      <Route path="/simulator" component={TransactionSimulator} />
      <Route path="/validators" component={Validators} />
      <Route path="/validator/:address" component={ValidatorDetail} />
      <Route path="/members" component={Members} />
      <Route path="/members/:id" component={MemberDetail} />
      <Route path="/ai" component={AIOrchestration} />
      <Route path="/sharding" component={Sharding} />
      <Route path="/cross-shard" component={CrossShard} />
      <Route path="/wallets" component={Wallets} />
      <Route path="/wallets/:address" component={WalletDetail} />
      {/* Token System v4.0 Routes */}
      <Route path="/token-system" component={TokenSystem} />
      <Route path="/bridge" component={Bridge} />
      <Route path="/governance" component={Governance} />
      <Route path="/burn" component={BurnDashboard} />
      {/* Staking Infrastructure Routes */}
      <Route path="/staking" component={StakingDashboard} />
      <Route path="/staking/pool/:id" component={StakingPoolDetail} />
      <Route path="/staking/rewards" component={StakingRewards} />
      <Route path="/staking/sdk" component={StakingSDK} />
      {/* DEX Infrastructure Routes */}
      <Route path="/dex" component={DexPage} />
      {/* Lending Infrastructure Routes */}
      <Route path="/lending" component={LendingPage} />
      <Route path="/yield-farming" component={YieldFarmingPage} />
      <Route path="/liquid-staking" component={LiquidStakingPage} />
      {/* NFT Marketplace Routes */}
      <Route path="/nft-marketplace" component={NftMarketplacePage} />
      {/* NFT Launchpad Routes */}
      <Route path="/nft-launchpad" component={NftLaunchpadPage} />
      <Route path="/contracts" component={SmartContracts} />
      <Route path="/health" component={NodeHealth} />
      <Route path="/metrics" component={PerformanceMetrics} />
      <Route path="/consensus" component={Consensus} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/admin" component={AdminPage} />
      {/* Operator Portal Routes - Protected with admin auth */}
      <Route path="/operator" component={ProtectedOperatorDashboard} />
      <Route path="/operator/members" component={ProtectedOperatorMembers} />
      <Route path="/operator/validators" component={ProtectedOperatorValidators} />
      <Route path="/operator/security" component={ProtectedOperatorSecurity} />
      <Route path="/operator/reports" component={ProtectedOperatorReports} />
      <Route path="/operator/staking" component={ProtectedOperatorStaking} />
      <Route component={NotFound} />
    </Switch>
  );
}

interface DataSourceStatus {
  dataSourceType: string;
  isSimulated: boolean;
  nodeUrl: string;
  message: string;
  connectionStatus: string;
}

function AuthenticatedApp() {
  const { data: authData, isLoading, refetch } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/auth/check"],
    refetchInterval: 60000, // Check every minute if session is still valid
    refetchOnWindowFocus: true, // Check when window regains focus
  });
  
  const { data: dataSourceStatus } = useQuery<DataSourceStatus>({
    queryKey: ["/api/system/data-source"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Drive authentication state directly from query data
  const isAuthenticated = authData?.authenticated ?? false;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => refetch()} />;
  }
  
  const isLiveMode = dataSourceStatus?.connectionStatus === 'connected';

  return (
    <WebSocketProvider>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <DemoBanner isLiveMode={isLiveMode} />
              <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
          <MainnetRestartOverlay />
        </SidebarProvider>
      </TooltipProvider>
    </WebSocketProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AdminPasswordProvider>
          <AuthenticatedApp />
          <Toaster />
        </AdminPasswordProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
