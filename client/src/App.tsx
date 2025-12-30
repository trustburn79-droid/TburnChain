import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { DemoBanner } from "@/components/DemoBanner";
import { WebSocketProvider } from "@/lib/websocket-context";
import { Web3Provider } from "@/lib/web3-context";
import { MainnetRestartOverlay } from "@/components/mainnet-restart-overlay";
import { AdminPasswordProvider } from "@/hooks/use-admin-password";
import { OperatorAuthGuard } from "@/components/operator-auth-guard";
import { AuthGuard } from "@/components/auth-guard";
import { TBurnAlertProvider } from "@/components/tburn-alert-modal";
import { LanguageSelector } from "@/components/language-selector";
import { ProfileBadge } from "@/components/profile-badge";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Home, ScanLine, User, HelpCircle, Bug, Coins, Shield, ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import '@/lib/i18n';
import { lazy, Suspense } from "react";

import { PublicRouter } from "./public/PublicRouter";

const Dashboard = lazy(() => import("@/pages/dashboard"));
const Blocks = lazy(() => import("@/pages/blocks"));
const BlockDetail = lazy(() => import("@/pages/block-detail"));
const Transactions = lazy(() => import("@/pages/transactions"));
const TransactionDetail = lazy(() => import("@/pages/transaction-detail"));
const Validators = lazy(() => import("@/pages/validators"));
const ValidatorDetail = lazy(() => import("@/pages/validator-detail"));
const AIOrchestration = lazy(() => import("@/pages/ai-orchestration"));
const Sharding = lazy(() => import("@/pages/sharding"));
const CrossShard = lazy(() => import("@/pages/cross-shard"));
const Wallets = lazy(() => import("@/pages/wallets"));
const WalletDetail = lazy(() => import("@/pages/wallet-detail"));
const WalletDashboard = lazy(() => import("@/pages/wallet-dashboard"));
const SmartContracts = lazy(() => import("@/pages/smart-contracts"));
const NodeHealth = lazy(() => import("@/pages/node-health"));
const PerformanceMetrics = lazy(() => import("@/pages/performance-metrics"));
const Consensus = lazy(() => import("@/pages/consensus"));
const TransactionSimulator = lazy(() => import("@/pages/transaction-simulator"));
const ApiKeys = lazy(() => import("@/pages/api-keys"));
const AdminPage = lazy(() => import("@/pages/admin"));
const Members = lazy(() => import("@/pages/members"));
const MemberDetail = lazy(() => import("@/pages/member-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import GoogleVerify from "@/pages/google-verify";

const TokenGenerator = lazy(() => import("@/pages/token-generator"));
const TokenSystem = lazy(() => import("@/pages/token-system"));
const Bridge = lazy(() => import("@/pages/bridge"));
const Governance = lazy(() => import("@/pages/governance"));
const BurnDashboard = lazy(() => import("@/pages/burn"));

const StakingDashboard = lazy(() => import("@/pages/staking"));
const StakingPoolDetail = lazy(() => import("@/pages/staking-pool-detail"));
const StakingRewards = lazy(() => import("@/pages/staking-rewards"));
const StakingSDK = lazy(() => import("@/pages/staking-sdk"));

const DexPage = lazy(() => import("@/pages/dex"));
const LendingPage = lazy(() => import("@/pages/lending"));
const YieldFarmingPage = lazy(() => import("@/pages/yield-farming"));
const LiquidStakingPage = lazy(() => import("@/pages/liquid-staking"));
const NftMarketplacePage = lazy(() => import("@/pages/nft-marketplace"));
const NftLaunchpadPage = lazy(() => import("@/pages/nft-launchpad"));
const GameFiPage = lazy(() => import("@/pages/gamefi"));
const CommunityPage = lazy(() => import("@/pages/community"));
const SearchResults = lazy(() => import("@/pages/search-results"));
const TokenomicsSimulation = lazy(() => import("@/pages/tokenomics-simulation"));
const VCTestMode = lazy(() => import("@/pages/vc-test-mode"));
const VCLayout = lazy(() => import("@/public/components/VCLayout"));
const UserPage = lazy(() => import("@/pages/user"));
const QnAPage = lazy(() => import("@/pages/qna"));
const NftMarketplaceStandalone = lazy(() => import("@/pages/nft-marketplace-standalone"));
const SecurityAuditPage = lazy(() => import("@/pages/security-audit"));
const OfficialChannelsPage = lazy(() => import("@/pages/official-channels"));
const BugBountyPage = lazy(() => import("@/pages/bug-bounty"));
const LaunchEventPage = lazy(() => import("@/pages/launch-event"));
const TreePage = lazy(() => import("@/pages/tree"));
const TokenSchedule = lazy(() => import("@/pages/token-schedule"));
const TokenDetails = lazy(() => import("@/pages/token-details"));

const OperatorDashboard = lazy(() => import("@/pages/operator/dashboard"));
const OperatorMembers = lazy(() => import("@/pages/operator/members"));
const OperatorValidators = lazy(() => import("@/pages/operator/validators"));
const OperatorSecurity = lazy(() => import("@/pages/operator/security"));
const OperatorReports = lazy(() => import("@/pages/operator/reports"));
const OperatorStaking = lazy(() => import("@/pages/operator/staking"));

import { AdminPortalLayout } from "@/components/admin-portal-layout";

function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

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
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/app" component={Dashboard} />
        <Route path="/app/blocks" component={Blocks} />
        <Route path="/app/blocks/:blockNumber" component={BlockDetail} />
        <Route path="/app/transactions" component={Transactions} />
        <Route path="/app/transactions/:hash" component={TransactionDetail} />
        <Route path="/app/simulator" component={TransactionSimulator} />
        <Route path="/app/validator/:address" component={ValidatorDetail} />
        <Route path="/app/ai" component={AIOrchestration} />
        <Route path="/app/sharding" component={Sharding} />
        <Route path="/app/cross-shard" component={CrossShard} />
        <Route path="/app/wallets" component={Wallets} />
        <Route path="/app/wallets/:address" component={WalletDetail} />
        <Route path="/app/wallet-dashboard" component={WalletDashboard} />
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
        <Route path="/app/tokenomics" component={TokenomicsSimulation} />
        <Route path="/app/token-system" component={TokenSystem} />
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
    </Suspense>
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
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { data: authData, isLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/auth/check"],
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  
  const { data: dataSourceStatus } = useQuery<DataSourceStatus>({
    queryKey: ["/api/system/data-source"],
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const isAuthenticated = authData?.authenticated ?? false;
  const isLiveMode = dataSourceStatus?.connectionStatus === 'connected';

  return (
    <WebSocketProvider>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  {isLiveMode && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400" data-testid="status-live-mode">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="hidden sm:inline font-medium">
                        <span className="font-bold">{t('common.liveMode', 'LIVE MODE')}</span>
                        <span className="hidden md:inline"> | {t('common.connectedToMainnet', 'Connected to TBURN mainnet node')}</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/">
                        <Button variant="ghost" size="icon" data-testid="link-nav-home">
                          <Home className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('nav.home', 'Home')}</p></TooltipContent>
                  </Tooltip>
                  <div className="hidden sm:flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/scan">
                          <Button variant="ghost" size="icon" data-testid="link-nav-scan">
                            <ScanLine className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('nav.scan', 'Scan')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/user">
                          <Button variant="ghost" size="icon" data-testid="link-nav-user">
                            <User className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('nav.user', 'User')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/bug-bounty">
                          <Button variant="ghost" size="icon" data-testid="link-nav-bug-bounty">
                            <Bug className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('nav.bugBounty', 'Bug Bounty')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/security-audit">
                          <Button variant="ghost" size="icon" data-testid="link-nav-security-audit">
                            <Shield className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('nav.securityAudit', 'Security Audit')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/token-generator">
                          <Button variant="ghost" size="icon" data-testid="link-nav-token-generator">
                            <Coins className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('nav.tokenGenerator', 'Token Generator')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/nft-marketplace">
                          <Button variant="ghost" size="icon" data-testid="link-nav-nft-marketplace">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('nav.nftMarketplace', 'NFT Marketplace')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/qna">
                          <Button variant="ghost" size="icon" data-testid="link-nav-qna">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('nav.qna', 'QnA')}</p></TooltipContent>
                    </Tooltip>
                    <div className="w-px h-6 bg-border mx-1" />
                  </div>
                  <LanguageSelector />
                  <ThemeToggle />
                  <ProfileBadge onLogout={() => {
                    queryClient.setQueryData(["/api/auth/check"], { authenticated: false });
                    queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
                    setLocation("/");
                  }} />
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
  const [location, setLocation] = useLocation();
  
  if (location.startsWith("/admin")) {
    return <AdminPortalLayout />;
  }
  
  if (location.startsWith("/app")) {
    return <AuthenticatedApp />;
  }
  
  if (location === "/user" || location.startsWith("/user")) {
    return (
      <AuthGuard>
        <Suspense fallback={<PageLoading />}>
          <UserPage />
        </Suspense>
      </AuthGuard>
    );
  }
  
  if (location === "/qna" || location.startsWith("/qna")) {
    return (
      <Suspense fallback={<PageLoading />}>
        <QnAPage />
      </Suspense>
    );
  }
  
  if (location === "/nft-marketplace" || location.startsWith("/nft-marketplace")) {
    return (
      <AuthGuard>
        <Suspense fallback={<PageLoading />}>
          <NftMarketplaceStandalone />
        </Suspense>
      </AuthGuard>
    );
  }
  
  if (location === "/security-audit" || location.startsWith("/security-audit")) {
    return (
      <AuthGuard>
        <Suspense fallback={<PageLoading />}>
          <SecurityAuditPage />
        </Suspense>
      </AuthGuard>
    );
  }
  
  if (location === "/official-channels" || location.startsWith("/official-channels")) {
    return (
      <Suspense fallback={<PageLoading />}>
        <OfficialChannelsPage />
      </Suspense>
    );
  }
  
  if (location === "/bug-bounty" || location.startsWith("/bug-bounty")) {
    return (
      <AuthGuard>
        <Suspense fallback={<PageLoading />}>
          <BugBountyPage />
        </Suspense>
      </AuthGuard>
    );
  }
  
  if (location === "/token-generator" || location.startsWith("/token-generator")) {
    return (
      <AuthGuard>
        <Suspense fallback={<PageLoading />}>
          <TokenGenerator />
        </Suspense>
      </AuthGuard>
    );
  }
  
  if (location === "/launch-event" || location.startsWith("/launch-event") || location === "/launch" || location.startsWith("/launch")) {
    return (
      <AuthGuard>
        <Suspense fallback={<PageLoading />}>
          <LaunchEventPage />
        </Suspense>
      </AuthGuard>
    );
  }
  
  if (location === "/tree") {
    // Tree navigation is public - accessible to all users without login
    return (
      <Suspense fallback={<PageLoading />}>
        <TreePage />
      </Suspense>
    );
  }
  
  if (location === "/TokenSchedule" || location.startsWith("/TokenSchedule")) {
    // Token Schedule page is public - accessible to all users without login
    return (
      <Suspense fallback={<PageLoading />}>
        <TokenSchedule />
      </Suspense>
    );
  }
  
  if (location === "/TokenDetails" || location.startsWith("/TokenDetails")) {
    // Token Details page is public - accessible to all users without login
    return (
      <Suspense fallback={<PageLoading />}>
        <TokenDetails />
      </Suspense>
    );
  }
  
  if (location === "/login") {
    return <Login onLoginSuccess={() => {
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/app";
      sessionStorage.removeItem("redirectAfterLogin");
      setLocation(redirectUrl);
    }} />;
  }
  
  if (location === "/signup") {
    return <Signup />;
  }
  
  if (location === "/google-verify" || location.startsWith("/google-verify")) {
    return <GoogleVerify />;
  }
  
  if (location === "/vc" || location.startsWith("/vc-test")) {
    // VC Test Mode page is public - accessible to VCs without login for due diligence
    return (
      <ThemeProvider defaultTheme="dark">
        <Suspense fallback={<PageLoading />}>
          <VCLayout>
            <VCTestMode />
          </VCLayout>
        </Suspense>
      </ThemeProvider>
    );
  }
  
  return <PublicRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <Web3Provider>
            <TBurnAlertProvider>
              <AdminPasswordProvider>
                <RootRouter />
                <Toaster />
              </AdminPasswordProvider>
            </TBurnAlertProvider>
          </Web3Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
