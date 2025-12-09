import { Switch, Route } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminPortalSidebar } from "@/components/admin-portal-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";

// Group 1: System Dashboard (5 pages)
import UnifiedDashboard from "@/pages/admin-portal/unified-dashboard";
import AdminPerformance from "@/pages/admin-portal/performance";
import AdminHealth from "@/pages/admin-portal/health";
import AdminAlerts from "@/pages/admin-portal/alerts";
import AdminLogs from "@/pages/admin-portal/logs";

// Group 2: Network Operations (6 pages)
import AdminNodes from "@/pages/admin-portal/nodes";
import AdminValidators from "@/pages/admin-portal/validators";
import AdminMembers from "@/pages/members";
import AdminConsensus from "@/pages/admin-portal/consensus";
import AdminShards from "@/pages/admin-portal/shards";
import AdminNetworkParams from "@/pages/admin-portal/network-params";

// Group 3: Token & Economy (6 pages)
import AdminTokenIssuance from "@/pages/admin-portal/token-issuance";
import AdminBurnControl from "@/pages/admin-portal/burn-control";
import AdminTreasury from "@/pages/admin-portal/treasury";
import AdminEconomics from "@/pages/admin-portal/economics";
import AdminCommunity from "@/pages/admin-portal/community";
import AdminCommunityContent from "@/pages/admin/community-content";
import TokenomicsSimulation from "@/pages/tokenomics-simulation";

// Group 4: AI Systems (4 pages)
import AdminAIOrchestration from "@/pages/admin-portal/ai-orchestration";
import AdminAITuning from "@/pages/admin-portal/ai-tuning";
import AdminAITraining from "@/pages/admin-portal/ai-training";
import AdminAIAnalytics from "@/pages/admin-portal/ai-analytics";

// Group 5: Bridge & Cross-Chain (5 pages)
import AdminBridgeDashboard from "@/pages/admin-portal/bridge-dashboard";
import AdminBridgeLiquidity from "@/pages/admin-portal/bridge-liquidity";
import AdminBridgeTransfers from "@/pages/admin-portal/bridge-transfers";
import AdminBridgeValidators from "@/pages/admin-portal/bridge-validators";
import AdminChainConnections from "@/pages/admin-portal/chain-connections";

// Group 6: Security & Audit (5 pages)
import AdminSecurity from "@/pages/admin-portal/security";
import AdminThreatDetection from "@/pages/admin-portal/threat-detection";
import AdminAuditLogs from "@/pages/admin-portal/audit-logs";
import AdminCompliance from "@/pages/admin-portal/compliance";
import AdminAccessControl from "@/pages/admin-portal/access-control";

// Group 7: Data & Analytics (5 pages)
import AdminNetworkAnalytics from "@/pages/admin-portal/network-analytics";
import AdminTxAnalytics from "@/pages/admin-portal/tx-analytics";
import AdminUserAnalytics from "@/pages/admin-portal/user-analytics";
import AdminBIDashboard from "@/pages/admin-portal/bi-dashboard";
import AdminReportGenerator from "@/pages/admin-portal/report-generator";

// Group 8: Operations Tools (5 pages)
import AdminMaintenance from "@/pages/admin-portal/maintenance";
import AdminBackup from "@/pages/admin-portal/backup";
import AdminUpdates from "@/pages/admin-portal/updates";
import AdminEmergency from "@/pages/admin-portal/emergency";
import AdminExecution from "@/pages/admin-portal/execution";

// Group 9: Configuration (5 pages)
import AdminSettings from "@/pages/admin-portal/settings";
import AdminAppearance from "@/pages/admin-portal/appearance";
import AdminNotificationSettings from "@/pages/admin-portal/notification-settings";
import AdminIntegrations from "@/pages/admin-portal/integrations";
import AdminAPIConfig from "@/pages/admin-portal/api-config";

// Group 10: User Management (5 pages)
import AdminAccounts from "@/pages/admin-portal/accounts";
import AdminRoles from "@/pages/admin-portal/roles";
import AdminPermissions from "@/pages/admin-portal/permissions";
import AdminSessions from "@/pages/admin-portal/sessions";
import AdminActivity from "@/pages/admin-portal/activity";

// Group 11: Governance (5 pages)
import AdminProposals from "@/pages/admin-portal/proposals";
import AdminVoting from "@/pages/admin-portal/voting";
import AdminGovParams from "@/pages/admin-portal/gov-params";
import AdminTestnet from "@/pages/admin-portal/testnet";
import AdminDebug from "@/pages/admin-portal/debug";

// Group 12: Developer Tools (5 pages)
import AdminAPIDocs from "@/pages/admin-portal/api-docs";
import AdminSDK from "@/pages/admin-portal/sdk";
import AdminContractTools from "@/pages/admin-portal/contract-tools";

// Group 13: Monitoring & Alerts (5 pages)
import AdminRealtime from "@/pages/admin-portal/realtime";
import AdminMetricsExplorer from "@/pages/admin-portal/metrics-explorer";
import AdminAlertRules from "@/pages/admin-portal/alert-rules";
import AdminDashboardBuilder from "@/pages/admin-portal/dashboard-builder";
import AdminSLA from "@/pages/admin-portal/sla";

// Group 14: Finance & Accounting (5 pages)
import AdminFinance from "@/pages/admin-portal/finance";
import AdminTxAccounting from "@/pages/admin-portal/tx-accounting";
import AdminBudget from "@/pages/admin-portal/budget";
import AdminCostAnalysis from "@/pages/admin-portal/cost-analysis";
import AdminTax from "@/pages/admin-portal/tax";

// Group 15: Education & Support (5 pages)
import AdminHelp from "@/pages/admin-portal/help";
import AdminTraining from "@/pages/admin-portal/training";
import AdminTickets from "@/pages/admin-portal/tickets";
import AdminFeedback from "@/pages/admin-portal/feedback";
import AdminAnnouncements from "@/pages/admin-portal/announcements";

function AdminRouter() {
  return (
    <Switch>
      {/* Group 1: System Dashboard */}
      <Route path="/admin" component={UnifiedDashboard} />
      <Route path="/admin/performance" component={AdminPerformance} />
      <Route path="/admin/health" component={AdminHealth} />
      <Route path="/admin/alerts" component={AdminAlerts} />
      <Route path="/admin/logs" component={AdminLogs} />

      {/* Group 2: Network Operations */}
      <Route path="/admin/nodes" component={AdminNodes} />
      <Route path="/admin/validators" component={AdminValidators} />
      <Route path="/admin/members" component={AdminMembers} />
      <Route path="/admin/consensus" component={AdminConsensus} />
      <Route path="/admin/shards" component={AdminShards} />
      <Route path="/admin/network-params" component={AdminNetworkParams} />

      {/* Group 3: Token & Economy */}
      <Route path="/admin/token-issuance" component={AdminTokenIssuance} />
      <Route path="/admin/burn-control" component={AdminBurnControl} />
      <Route path="/admin/treasury" component={AdminTreasury} />
      <Route path="/admin/economics" component={AdminEconomics} />
      <Route path="/admin/tokenomics" component={TokenomicsSimulation} />

      {/* Group 4: AI Systems */}
      <Route path="/admin/ai" component={AdminAIOrchestration} />
      <Route path="/admin/ai-orchestration" component={AdminAIOrchestration} />
      <Route path="/admin/ai-tuning" component={AdminAITuning} />
      <Route path="/admin/ai-training" component={AdminAITraining} />
      <Route path="/admin/ai-analytics" component={AdminAIAnalytics} />

      {/* Group 5: Bridge & Cross-Chain */}
      <Route path="/admin/bridge" component={AdminBridgeDashboard} />
      <Route path="/admin/bridge-dashboard" component={AdminBridgeDashboard} />
      <Route path="/admin/bridge-liquidity" component={AdminBridgeLiquidity} />
      <Route path="/admin/bridge-transfers" component={AdminBridgeTransfers} />
      <Route path="/admin/bridge-validators" component={AdminBridgeValidators} />
      <Route path="/admin/chains" component={AdminChainConnections} />
      <Route path="/admin/chain-connections" component={AdminChainConnections} />

      {/* Group 6: Security & Audit */}
      <Route path="/admin/security" component={AdminSecurity} />
      <Route path="/admin/threats" component={AdminThreatDetection} />
      <Route path="/admin/threat-detection" component={AdminThreatDetection} />
      <Route path="/admin/audit-logs" component={AdminAuditLogs} />
      <Route path="/admin/compliance" component={AdminCompliance} />
      <Route path="/admin/access-control" component={AdminAccessControl} />

      {/* Group 7: Data & Analytics */}
      <Route path="/admin/bi" component={AdminBIDashboard} />
      <Route path="/admin/bi-dashboard" component={AdminBIDashboard} />
      <Route path="/admin/tx-analytics" component={AdminTxAnalytics} />
      <Route path="/admin/user-analytics" component={AdminUserAnalytics} />
      <Route path="/admin/network-analytics" component={AdminNetworkAnalytics} />
      <Route path="/admin/reports" component={AdminReportGenerator} />
      <Route path="/admin/report-generator" component={AdminReportGenerator} />

      {/* Group 8: Operations Tools */}
      <Route path="/admin/emergency" component={AdminEmergency} />
      <Route path="/admin/maintenance" component={AdminMaintenance} />
      <Route path="/admin/backup" component={AdminBackup} />
      <Route path="/admin/updates" component={AdminUpdates} />
      <Route path="/admin/logs" component={AdminLogs} />

      {/* Group 9: Configuration */}
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/api-config" component={AdminAPIConfig} />
      <Route path="/admin/integrations" component={AdminIntegrations} />
      <Route path="/admin/notification-settings" component={AdminNotificationSettings} />
      <Route path="/admin/appearance" component={AdminAppearance} />

      {/* Group 10: User Management */}
      <Route path="/admin/accounts" component={AdminAccounts} />
      <Route path="/admin/roles" component={AdminRoles} />
      <Route path="/admin/permissions" component={AdminPermissions} />
      <Route path="/admin/activity" component={AdminActivity} />
      <Route path="/admin/sessions" component={AdminSessions} />

      {/* Group 11: Governance */}
      <Route path="/admin/proposals" component={AdminProposals} />
      <Route path="/admin/voting-config" component={AdminVoting} />
      <Route path="/admin/voting" component={AdminVoting} />
      <Route path="/admin/execution" component={AdminExecution} />
      <Route path="/admin/gov-params" component={AdminGovParams} />
      <Route path="/admin/community-feedback" component={AdminFeedback} />
      <Route path="/admin/community" component={AdminCommunity} />
      <Route path="/admin/community-content" component={AdminCommunityContent} />

      {/* Group 12: Developer Tools */}
      <Route path="/admin/api-docs" component={AdminAPIDocs} />
      <Route path="/admin/sdk" component={AdminSDK} />
      <Route path="/admin/contract-tools" component={AdminContractTools} />
      <Route path="/admin/testnet" component={AdminTestnet} />
      <Route path="/admin/debug" component={AdminDebug} />

      {/* Group 13: Monitoring & Alerts */}
      <Route path="/admin/realtime" component={AdminRealtime} />
      <Route path="/admin/metrics-explorer" component={AdminMetricsExplorer} />
      <Route path="/admin/alert-rules" component={AdminAlertRules} />
      <Route path="/admin/dashboard-builder" component={AdminDashboardBuilder} />
      <Route path="/admin/sla" component={AdminSLA} />

      {/* Group 14: Finance & Accounting */}
      <Route path="/admin/finance" component={AdminFinance} />
      <Route path="/admin/tx-accounting" component={AdminTxAccounting} />
      <Route path="/admin/budget" component={AdminBudget} />
      <Route path="/admin/cost-analysis" component={AdminCostAnalysis} />
      <Route path="/admin/tax" component={AdminTax} />

      {/* Group 15: Education & Support */}
      <Route path="/admin/help" component={AdminHelp} />
      <Route path="/admin/training" component={AdminTraining} />
      <Route path="/admin/tickets" component={AdminTickets} />
      <Route path="/admin/feedback" component={AdminFeedback} />
      <Route path="/admin/announcements" component={AdminAnnouncements} />

      {/* Default fallback */}
      <Route component={UnifiedDashboard} />
    </Switch>
  );
}

export function AdminPortalLayout() {
  const { data: authData, isLoading, refetch } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/auth/check"],
    refetchInterval: 60000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
      window.location.href = "/";
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
    return <Login onLoginSuccess={() => refetch()} />;
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      data-testid="button-admin-logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Logout</TooltipContent>
                </Tooltip>
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
