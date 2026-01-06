import { Switch, Route, useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminPortalSidebar } from "@/components/admin-portal-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { ProfileBadge } from "@/components/profile-badge";
import { Shield, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";

// Lazy load Login component
const Login = lazy(() => import("@/pages/login"));

// Loading fallback component
function AdminPageLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Lazy load all admin pages
const UnifiedDashboard = lazy(() => import("@/pages/admin-portal/unified-dashboard"));
const AdminPerformance = lazy(() => import("@/pages/admin-portal/performance"));
const AdminHealth = lazy(() => import("@/pages/admin-portal/health"));
const AdminAlerts = lazy(() => import("@/pages/admin-portal/alerts"));
const AdminLogs = lazy(() => import("@/pages/admin-portal/logs"));
const AdminNodes = lazy(() => import("@/pages/admin-portal/nodes"));
const AdminValidators = lazy(() => import("@/pages/admin-portal/validators"));
const AdminMembers = lazy(() => import("@/pages/members"));
const AdminConsensus = lazy(() => import("@/pages/admin-portal/consensus"));
const AdminShards = lazy(() => import("@/pages/admin-portal/shards"));
const AdminNetworkParams = lazy(() => import("@/pages/admin-portal/network-params"));
const AdminTokenIssuance = lazy(() => import("@/pages/admin-portal/token-issuance"));
const AdminBurnControl = lazy(() => import("@/pages/admin-portal/burn-control"));
const AdminTreasury = lazy(() => import("@/pages/admin-portal/treasury"));
const AdminEconomics = lazy(() => import("@/pages/admin-portal/economics"));
const AdminCommunity = lazy(() => import("@/pages/admin-portal/community"));
const AdminCommunityContent = lazy(() => import("@/pages/admin/community-content"));
const AdminTokenomics = lazy(() => import("@/pages/admin-portal/tokenomics"));
const AdminAIOrchestration = lazy(() => import("@/pages/admin-portal/ai-orchestration"));
const AdminAITuning = lazy(() => import("@/pages/admin-portal/ai-tuning"));
const AdminAITraining = lazy(() => import("@/pages/admin-portal/ai-training"));
const AdminAIAnalytics = lazy(() => import("@/pages/admin-portal/ai-analytics"));
const AdminBridgeDashboard = lazy(() => import("@/pages/admin-portal/bridge-dashboard"));
const AdminBridgeLiquidity = lazy(() => import("@/pages/admin-portal/bridge-liquidity"));
const AdminBridgeTransfers = lazy(() => import("@/pages/admin-portal/bridge-transfers"));
const AdminBridgeValidators = lazy(() => import("@/pages/admin-portal/bridge-validators"));
const AdminChainConnections = lazy(() => import("@/pages/admin-portal/chain-connections"));
const AdminSecurity = lazy(() => import("@/pages/admin-portal/security"));
const AdminThreatDetection = lazy(() => import("@/pages/admin-portal/threat-detection"));
const AdminAuditLogs = lazy(() => import("@/pages/admin-portal/audit-logs"));
const AdminCompliance = lazy(() => import("@/pages/admin-portal/compliance"));
const AdminAccessControl = lazy(() => import("@/pages/admin-portal/access-control"));
const AdminBugBounty = lazy(() => import("@/pages/admin-portal/bug-bounty"));
const AdminNetworkAnalytics = lazy(() => import("@/pages/admin-portal/network-analytics"));
const AdminTxAnalytics = lazy(() => import("@/pages/admin-portal/tx-analytics"));
const AdminUserAnalytics = lazy(() => import("@/pages/admin-portal/user-analytics"));
const AdminBIDashboard = lazy(() => import("@/pages/admin-portal/bi-dashboard"));
const AdminReportGenerator = lazy(() => import("@/pages/admin-portal/report-generator"));
const AdminMaintenance = lazy(() => import("@/pages/admin-portal/maintenance"));
const AdminBackup = lazy(() => import("@/pages/admin-portal/backup"));
const AdminUpdates = lazy(() => import("@/pages/admin-portal/updates"));
const AdminEmergency = lazy(() => import("@/pages/admin-portal/emergency"));
const AdminExecution = lazy(() => import("@/pages/admin-portal/execution"));
const AdminSettings = lazy(() => import("@/pages/admin-portal/settings"));
const AdminAppearance = lazy(() => import("@/pages/admin-portal/appearance"));
const AdminNotificationSettings = lazy(() => import("@/pages/admin-portal/notification-settings"));
const AdminIntegrations = lazy(() => import("@/pages/admin-portal/integrations"));
const AdminAPIConfig = lazy(() => import("@/pages/admin-portal/api-config"));
const AdminAccounts = lazy(() => import("@/pages/admin-portal/accounts"));
const AdminRoles = lazy(() => import("@/pages/admin-portal/roles"));
const AdminPermissions = lazy(() => import("@/pages/admin-portal/permissions"));
const AdminSessions = lazy(() => import("@/pages/admin-portal/sessions"));
const AdminActivity = lazy(() => import("@/pages/admin-portal/activity"));
const AdminProposals = lazy(() => import("@/pages/admin-portal/proposals"));
const AdminVoting = lazy(() => import("@/pages/admin-portal/voting"));
const AdminGovParams = lazy(() => import("@/pages/admin-portal/gov-params"));
const AdminTestnet = lazy(() => import("@/pages/admin-portal/testnet"));
const AdminDebug = lazy(() => import("@/pages/admin-portal/debug"));
const AdminGenesisLaunch = lazy(() => import("@/pages/admin-portal/genesis-launch"));
const AdminAPIDocs = lazy(() => import("@/pages/admin-portal/api-docs"));
const AdminSDK = lazy(() => import("@/pages/admin-portal/sdk"));
const AdminContractTools = lazy(() => import("@/pages/admin-portal/contract-tools"));
const AdminRealtime = lazy(() => import("@/pages/admin-portal/realtime"));
const AdminMetricsExplorer = lazy(() => import("@/pages/admin-portal/metrics-explorer"));
const AdminAlertRules = lazy(() => import("@/pages/admin-portal/alert-rules"));
const AdminDashboardBuilder = lazy(() => import("@/pages/admin-portal/dashboard-builder"));
const AdminSLA = lazy(() => import("@/pages/admin-portal/sla"));
const AdminFinance = lazy(() => import("@/pages/admin-portal/finance"));
const AdminTxAccounting = lazy(() => import("@/pages/admin-portal/tx-accounting"));
const AdminBudget = lazy(() => import("@/pages/admin-portal/budget"));
const AdminCostAnalysis = lazy(() => import("@/pages/admin-portal/cost-analysis"));
const AdminTax = lazy(() => import("@/pages/admin-portal/tax"));
const AdminHelp = lazy(() => import("@/pages/admin-portal/help"));
const AdminTraining = lazy(() => import("@/pages/admin-portal/training"));
const AdminTickets = lazy(() => import("@/pages/admin-portal/tickets"));
const AdminFeedback = lazy(() => import("@/pages/admin-portal/feedback"));
const AdminAnnouncements = lazy(() => import("@/pages/admin-portal/announcements"));
const AdminNewsletter = lazy(() => import("@/pages/admin-portal/newsletter"));
const AdminDBOptimizer = lazy(() => import("@/pages/admin-portal/db-optimizer"));
const AdminDistribution = lazy(() => import("@/pages/admin-portal/distribution"));
const AdminDistributionPrograms = lazy(() => import("@/pages/admin-portal/distribution-programs"));
const AdminDemoWallets = lazy(() => import("@/pages/admin-portal/demo-wallets"));
const AdminTokenDistribution = lazy(() => import("@/pages/admin-portal/token-distribution"));
const AdminAirdropProgram = lazy(() => import("@/pages/admin-portal/token-distribution/airdrop"));
const AdminReferralProgram = lazy(() => import("@/pages/admin-portal/token-distribution/referral"));
const AdminEventsCenter = lazy(() => import("@/pages/admin-portal/token-distribution/events"));
const AdminCommunityProgram = lazy(() => import("@/pages/admin-portal/token-distribution/community-program"));
const AdminDAOGovernance = lazy(() => import("@/pages/admin-portal/token-distribution/dao-governance"));
const AdminBlockRewards = lazy(() => import("@/pages/admin-portal/token-distribution/block-rewards"));
const AdminValidatorIncentives = lazy(() => import("@/pages/admin-portal/token-distribution/validator-incentives"));
const AdminEcosystemFund = lazy(() => import("@/pages/admin-portal/token-distribution/ecosystem-fund"));
const AdminPartnershipProgram = lazy(() => import("@/pages/admin-portal/token-distribution/partnership-program"));
const AdminMarketingProgram = lazy(() => import("@/pages/admin-portal/token-distribution/marketing-program"));
const AdminStrategicPartner = lazy(() => import("@/pages/admin-portal/token-distribution/strategic-partner"));
const AdminAdvisorProgram = lazy(() => import("@/pages/admin-portal/token-distribution/advisor-program"));
const AdminSeedRound = lazy(() => import("@/pages/admin-portal/token-distribution/seed-round"));
const AdminPrivateRound = lazy(() => import("@/pages/admin-portal/token-distribution/private-round"));
const AdminPublicRound = lazy(() => import("@/pages/admin-portal/token-distribution/public-round"));
const AdminLaunchpad = lazy(() => import("@/pages/admin-portal/token-distribution/launchpad"));
const AdminCoinlist = lazy(() => import("@/pages/admin-portal/token-distribution/coinlist"));
const AdminDAOMaker = lazy(() => import("@/pages/admin-portal/token-distribution/dao-maker"));

function AdminRouter() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <Switch>
        <Route path="/admin" component={UnifiedDashboard} />
        <Route path="/admin/performance" component={AdminPerformance} />
        <Route path="/admin/health" component={AdminHealth} />
        <Route path="/admin/alerts" component={AdminAlerts} />
        <Route path="/admin/logs" component={AdminLogs} />
        <Route path="/admin/nodes" component={AdminNodes} />
        <Route path="/admin/validators" component={AdminValidators} />
        <Route path="/admin/members" component={AdminMembers} />
        <Route path="/admin/consensus" component={AdminConsensus} />
        <Route path="/admin/shards" component={AdminShards} />
        <Route path="/admin/network-params" component={AdminNetworkParams} />
        <Route path="/admin/token-issuance" component={AdminTokenIssuance} />
        <Route path="/admin/burn-control" component={AdminBurnControl} />
        <Route path="/admin/treasury" component={AdminTreasury} />
        <Route path="/admin/economics" component={AdminEconomics} />
        <Route path="/admin/tokenomics" component={AdminTokenomics} />
        <Route path="/admin/token-distribution" component={AdminTokenDistribution} />
        <Route path="/admin/token-distribution/airdrop" component={AdminAirdropProgram} />
        <Route path="/admin/token-distribution/referral" component={AdminReferralProgram} />
        <Route path="/admin/token-distribution/events" component={AdminEventsCenter} />
        <Route path="/admin/token-distribution/community-program" component={AdminCommunityProgram} />
        <Route path="/admin/token-distribution/dao-governance" component={AdminDAOGovernance} />
        <Route path="/admin/token-distribution/block-rewards" component={AdminBlockRewards} />
        <Route path="/admin/token-distribution/validator-incentives" component={AdminValidatorIncentives} />
        <Route path="/admin/token-distribution/ecosystem-fund" component={AdminEcosystemFund} />
        <Route path="/admin/token-distribution/partnership-program" component={AdminPartnershipProgram} />
        <Route path="/admin/token-distribution/marketing-program" component={AdminMarketingProgram} />
        <Route path="/admin/token-distribution/strategic-partner" component={AdminStrategicPartner} />
        <Route path="/admin/token-distribution/advisor-program" component={AdminAdvisorProgram} />
        <Route path="/admin/token-distribution/seed-round" component={AdminSeedRound} />
        <Route path="/admin/token-distribution/private-round" component={AdminPrivateRound} />
        <Route path="/admin/token-distribution/public-round" component={AdminPublicRound} />
        <Route path="/admin/token-distribution/launchpad" component={AdminLaunchpad} />
        <Route path="/admin/token-distribution/coinlist" component={AdminCoinlist} />
        <Route path="/admin/token-distribution/dao-maker" component={AdminDAOMaker} />
        <Route path="/admin/ai" component={AdminAIOrchestration} />
        <Route path="/admin/ai-orchestration" component={AdminAIOrchestration} />
        <Route path="/admin/ai-tuning" component={AdminAITuning} />
        <Route path="/admin/ai-training" component={AdminAITraining} />
        <Route path="/admin/ai-analytics" component={AdminAIAnalytics} />
        <Route path="/admin/bridge" component={AdminBridgeDashboard} />
        <Route path="/admin/bridge-dashboard" component={AdminBridgeDashboard} />
        <Route path="/admin/bridge-liquidity" component={AdminBridgeLiquidity} />
        <Route path="/admin/bridge-transfers" component={AdminBridgeTransfers} />
        <Route path="/admin/bridge-validators" component={AdminBridgeValidators} />
        <Route path="/admin/chains" component={AdminChainConnections} />
        <Route path="/admin/chain-connections" component={AdminChainConnections} />
        <Route path="/admin/security" component={AdminSecurity} />
        <Route path="/admin/threats" component={AdminThreatDetection} />
        <Route path="/admin/threat-detection" component={AdminThreatDetection} />
        <Route path="/admin/audit-logs" component={AdminAuditLogs} />
        <Route path="/admin/compliance" component={AdminCompliance} />
        <Route path="/admin/access-control" component={AdminAccessControl} />
        <Route path="/admin/bug-bounty" component={AdminBugBounty} />
        <Route path="/admin/bi" component={AdminBIDashboard} />
        <Route path="/admin/bi-dashboard" component={AdminBIDashboard} />
        <Route path="/admin/tx-analytics" component={AdminTxAnalytics} />
        <Route path="/admin/user-analytics" component={AdminUserAnalytics} />
        <Route path="/admin/network-analytics" component={AdminNetworkAnalytics} />
        <Route path="/admin/report-generator" component={AdminReportGenerator} />
        <Route path="/admin/emergency" component={AdminEmergency} />
        <Route path="/admin/maintenance" component={AdminMaintenance} />
        <Route path="/admin/backup" component={AdminBackup} />
        <Route path="/admin/updates" component={AdminUpdates} />
        <Route path="/admin/logs" component={AdminLogs} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/api-config" component={AdminAPIConfig} />
        <Route path="/admin/integrations" component={AdminIntegrations} />
        <Route path="/admin/notification-settings" component={AdminNotificationSettings} />
        <Route path="/admin/appearance" component={AdminAppearance} />
        <Route path="/admin/accounts" component={AdminAccounts} />
        <Route path="/admin/roles" component={AdminRoles} />
        <Route path="/admin/permissions" component={AdminPermissions} />
        <Route path="/admin/activity" component={AdminActivity} />
        <Route path="/admin/sessions" component={AdminSessions} />
        <Route path="/admin/proposals" component={AdminProposals} />
        <Route path="/admin/voting-config" component={AdminVoting} />
        <Route path="/admin/voting" component={AdminVoting} />
        <Route path="/admin/execution" component={AdminExecution} />
        <Route path="/admin/gov-params" component={AdminGovParams} />
        <Route path="/admin/community-feedback" component={AdminFeedback} />
        <Route path="/admin/community" component={AdminCommunity} />
        <Route path="/admin/community-content" component={AdminCommunityContent} />
        <Route path="/admin/api-docs" component={AdminAPIDocs} />
        <Route path="/admin/sdk" component={AdminSDK} />
        <Route path="/admin/contract-tools" component={AdminContractTools} />
        <Route path="/admin/testnet" component={AdminTestnet} />
        <Route path="/admin/debug" component={AdminDebug} />
        <Route path="/admin/realtime" component={AdminRealtime} />
        <Route path="/admin/metrics-explorer" component={AdminMetricsExplorer} />
        <Route path="/admin/alert-rules" component={AdminAlertRules} />
        <Route path="/admin/dashboard-builder" component={AdminDashboardBuilder} />
        <Route path="/admin/sla" component={AdminSLA} />
        <Route path="/admin/finance" component={AdminFinance} />
        <Route path="/admin/tx-accounting" component={AdminTxAccounting} />
        <Route path="/admin/budget" component={AdminBudget} />
        <Route path="/admin/cost-analysis" component={AdminCostAnalysis} />
        <Route path="/admin/tax" component={AdminTax} />
        <Route path="/admin/help" component={AdminHelp} />
        <Route path="/admin/training" component={AdminTraining} />
        <Route path="/admin/tickets" component={AdminTickets} />
        <Route path="/admin/feedback" component={AdminFeedback} />
        <Route path="/admin/announcements" component={AdminAnnouncements} />
        <Route path="/admin/genesis" component={AdminGenesisLaunch} />
        <Route path="/admin/db-optimizer" component={AdminDBOptimizer} />
        <Route path="/admin/distribution" component={AdminDistribution} />
        <Route path="/admin/distribution-programs" component={AdminDistributionPrograms} />
        <Route path="/admin/demo-wallets" component={AdminDemoWallets} />
        <Route path="/admin/newsletter" component={AdminNewsletter} />
        <Route component={UnifiedDashboard} />
      </Switch>
    </Suspense>
  );
}

export function AdminPortalLayout() {
  const [, setLocation] = useLocation();
  const { data: authData, isLoading, refetch } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/auth/check"],
    refetchInterval: 60000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auth/check"] });
      setLocation("/");
    },
  });

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Shield className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!authData?.authenticated) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Shield className="h-12 w-12 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading Login...</p>
          </div>
        </div>
      }>
        <Login onLoginSuccess={() => refetch()} isAdminLogin={true} />
      </Suspense>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true} style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminPortalSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <span className="font-semibold text-sm">Admin Portal v4.0</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <ThemeToggle />
                <ProfileBadge onLogout={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/auth/check"] });
                  setLocation("/");
                }} />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <AdminRouter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
