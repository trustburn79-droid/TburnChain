import { Switch, Route, useLocation } from "wouter";
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
import { LanguageSelector } from "@/components/language-selector";
import '@/lib/i18n';

import { PublicRouter } from "./public/PublicRouter";

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
import Signup from "@/pages/signup";

import TokenSystem from "@/pages/token-system";
import Bridge from "@/pages/bridge";
import Governance from "@/pages/governance";
import BurnDashboard from "@/pages/burn";

import StakingDashboard from "@/pages/staking";
import StakingPoolDetail from "@/pages/staking-pool-detail";
import StakingRewards from "@/pages/staking-rewards";
import StakingSDK from "@/pages/staking-sdk";

import DexPage from "@/pages/dex";
import LendingPage from "@/pages/lending";
import YieldFarmingPage from "@/pages/yield-farming";
import LiquidStakingPage from "@/pages/liquid-staking";
import NftMarketplacePage from "@/pages/nft-marketplace";
import NftLaunchpadPage from "@/pages/nft-launchpad";
import GameFiPage from "@/pages/gamefi";
import CommunityPage from "@/pages/community";
import SearchResults from "@/pages/search-results";

import OperatorDashboard from "@/pages/operator/dashboard";
import OperatorMembers from "@/pages/operator/members";
import OperatorValidators from "@/pages/operator/validators";
import OperatorSecurity from "@/pages/operator/security";
import OperatorReports from "@/pages/operator/reports";
import OperatorStaking from "@/pages/operator/staking";

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

function AppRouter() {
  return (
    <Switch>
      <Route path="/app" component={Dashboard} />
      <Route path="/app/blocks" component={Blocks} />
      <Route path="/app/blocks/:blockNumber" component={BlockDetail} />
      <Route path="/app/transactions" component={Transactions} />
      <Route path="/app/transactions/:hash" component={TransactionDetail} />
      <Route path="/app/simulator" component={TransactionSimulator} />
      <Route path="/app/validators" component={Validators} />
      <Route path="/app/validator/:address" component={ValidatorDetail} />
      <Route path="/app/members" component={Members} />
      <Route path="/app/members/:id" component={MemberDetail} />
      <Route path="/app/ai" component={AIOrchestration} />
      <Route path="/app/sharding" component={Sharding} />
      <Route path="/app/cross-shard" component={CrossShard} />
      <Route path="/app/wallets" component={Wallets} />
      <Route path="/app/wallets/:address" component={WalletDetail} />
      <Route path="/app/token-system" component={TokenSystem} />
      <Route path="/app/bridge" component={Bridge} />
      <Route path="/app/governance" component={Governance} />
      <Route path="/app/burn" component={BurnDashboard} />
      <Route path="/app/staking" component={StakingDashboard} />
      <Route path="/app/staking/pool/:id" component={StakingPoolDetail} />
      <Route path="/app/staking/rewards" component={StakingRewards} />
      <Route path="/app/staking/sdk" component={StakingSDK} />
      <Route path="/app/dex" component={DexPage} />
      <Route path="/app/lending" component={LendingPage} />
      <Route path="/app/yield-farming" component={YieldFarmingPage} />
      <Route path="/app/liquid-staking" component={LiquidStakingPage} />
      <Route path="/app/nft-marketplace" component={NftMarketplacePage} />
      <Route path="/app/nft-launchpad" component={NftLaunchpadPage} />
      <Route path="/app/gamefi" component={GameFiPage} />
      <Route path="/app/community" component={CommunityPage} />
      <Route path="/app/search" component={SearchResults} />
      <Route path="/app/address/:address" component={WalletDetail} />
      <Route path="/app/contracts" component={SmartContracts} />
      <Route path="/app/health" component={NodeHealth} />
      <Route path="/app/metrics" component={PerformanceMetrics} />
      <Route path="/app/consensus" component={Consensus} />
      <Route path="/app/api-keys" component={ApiKeys} />
      <Route path="/app/admin" component={AdminPage} />
      <Route path="/app/operator" component={ProtectedOperatorDashboard} />
      <Route path="/app/operator/members" component={ProtectedOperatorMembers} />
      <Route path="/app/operator/validators" component={ProtectedOperatorValidators} />
      <Route path="/app/operator/security" component={ProtectedOperatorSecurity} />
      <Route path="/app/operator/reports" component={ProtectedOperatorReports} />
      <Route path="/app/operator/staking" component={ProtectedOperatorStaking} />
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
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
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
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <AppRouter />
              </main>
            </div>
          </div>
          <MainnetRestartOverlay />
        </SidebarProvider>
      </TooltipProvider>
    </WebSocketProvider>
  );
}

function RootRouter() {
  const [location] = useLocation();
  
  if (location.startsWith("/app")) {
    return <AuthenticatedApp />;
  }
  
  if (location === "/signup") {
    return <Signup />;
  }
  
  return <PublicRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AdminPasswordProvider>
          <RootRouter />
          <Toaster />
        </AdminPasswordProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
