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

// Pages
import Dashboard from "@/pages/dashboard";
import Blocks from "@/pages/blocks";
import Transactions from "@/pages/transactions";
import Validators from "@/pages/validators";
import AIOrchestration from "@/pages/ai-orchestration";
import Sharding from "@/pages/sharding";
import CrossShard from "@/pages/cross-shard";
import Wallets from "@/pages/wallets";
import SmartContracts from "@/pages/smart-contracts";
import NodeHealth from "@/pages/node-health";
import PerformanceMetrics from "@/pages/performance-metrics";
import Consensus from "@/pages/consensus";
import TransactionSimulator from "@/pages/transaction-simulator";
import ApiKeys from "@/pages/api-keys";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/blocks" component={Blocks} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/simulator" component={TransactionSimulator} />
      <Route path="/validators" component={Validators} />
      <Route path="/ai" component={AIOrchestration} />
      <Route path="/sharding" component={Sharding} />
      <Route path="/cross-shard" component={CrossShard} />
      <Route path="/wallets" component={Wallets} />
      <Route path="/contracts" component={SmartContracts} />
      <Route path="/health" component={NodeHealth} />
      <Route path="/metrics" component={PerformanceMetrics} />
      <Route path="/consensus" component={Consensus} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { data: authData, isLoading, refetch } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/auth/check"],
    refetchInterval: 60000, // Check every minute if session is still valid
    refetchOnWindowFocus: true, // Check when window regains focus
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

  return (
    <WebSocketProvider>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <DemoBanner />
              <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </WebSocketProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthenticatedApp />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
