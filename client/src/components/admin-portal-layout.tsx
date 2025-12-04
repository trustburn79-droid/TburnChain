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

import UnifiedDashboard from "@/pages/admin-portal/unified-dashboard";
import AdminPerformance from "@/pages/admin-portal/performance";
import AdminHealth from "@/pages/admin-portal/health";
import AdminAlerts from "@/pages/admin-portal/alerts";
import AdminNodes from "@/pages/admin-portal/nodes";
import AdminValidators from "@/pages/admin-portal/validators";
import AdminConsensus from "@/pages/admin-portal/consensus";
import AdminShards from "@/pages/admin-portal/shards";
import AdminSecurity from "@/pages/admin-portal/security";
import AdminAuditLogs from "@/pages/admin-portal/audit-logs";
import AdminSettings from "@/pages/admin-portal/settings";
import AdminAccounts from "@/pages/admin-portal/accounts";
import AdminRoles from "@/pages/admin-portal/roles";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin" component={UnifiedDashboard} />
      <Route path="/admin/performance" component={AdminPerformance} />
      <Route path="/admin/health" component={AdminHealth} />
      <Route path="/admin/alerts" component={AdminAlerts} />
      <Route path="/admin/nodes" component={AdminNodes} />
      <Route path="/admin/validators" component={AdminValidators} />
      <Route path="/admin/consensus" component={AdminConsensus} />
      <Route path="/admin/shards" component={AdminShards} />
      <Route path="/admin/security" component={AdminSecurity} />
      <Route path="/admin/audit-logs" component={AdminAuditLogs} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/accounts" component={AdminAccounts} />
      <Route path="/admin/roles" component={AdminRoles} />
      <Route component={UnifiedDashboard} />
    </Switch>
  );
}

export function AdminPortalLayout() {
  const { data: authData } = useQuery<{ authenticated: boolean }>({
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

  return (
    <TooltipProvider>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
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
            <main className="flex-1 overflow-hidden">
              <AdminRouter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
