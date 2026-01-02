import { useTranslation } from 'react-i18next';
import { Link, useLocation } from "wouter";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Bug,
  Calculator,
  ChartPie,
  Clock,
  Cog,
  Cpu,
  Database,
  DollarSign,
  FileCode,
  FileSearch,
  FileText,
  FolderCode,
  Gauge,
  Globe,
  GraduationCap,
  Grid3x3,
  HardDrive,
  HeadphonesIcon,
  History,
  Key,
  Layers,
  LayoutDashboard,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  Network,
  Palette,
  PanelLeft,
  Play,
  RefreshCw,
  Scale,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  TestTube,
  Ticket,
  TrendingUp,
  Upload,
  UserCog,
  Users,
  Vote,
  Wallet,
  Wrench,
  Zap,
  Rocket,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const adminMenuItems = [
  // Group 1: System Dashboard
  { titleKey: "adminNav.unifiedDashboard", url: "/admin", icon: LayoutDashboard, groupKey: "adminNav.systemDashboard", badge: null },
  { titleKey: "adminNav.performanceMonitor", url: "/admin/performance", icon: Gauge, groupKey: "adminNav.systemDashboard", badge: null },
  { titleKey: "adminNav.systemHealth", url: "/admin/health", icon: Activity, groupKey: "adminNav.systemDashboard", badge: null },
  { titleKey: "adminNav.alertCenter", url: "/admin/alerts", icon: Bell, groupKey: "adminNav.systemDashboard", badge: "5" },
  
  // Group 2: Network Operations
  { titleKey: "adminNav.nodeManagement", url: "/admin/nodes", icon: Server, groupKey: "adminNav.networkOps", badge: null },
  { titleKey: "adminNav.validatorManagement", url: "/admin/validators", icon: ShieldCheck, groupKey: "adminNav.networkOps", badge: null },
  { titleKey: "adminNav.memberManagement", url: "/admin/members", icon: Users, groupKey: "adminNav.networkOps", badge: null },
  { titleKey: "adminNav.consensusMonitor", url: "/admin/consensus", icon: Vote, groupKey: "adminNav.networkOps", badge: null },
  { titleKey: "adminNav.shardManagement", url: "/admin/shards", icon: Grid3x3, groupKey: "adminNav.networkOps", badge: null },
  { titleKey: "adminNav.networkParams", url: "/admin/network-params", icon: Settings, groupKey: "adminNav.networkOps", badge: null },
  
  // Group 3: Token & Economy
  { titleKey: "adminNav.tokenIssuance", url: "/admin/token-issuance", icon: Wallet, groupKey: "adminNav.tokenEconomy", badge: null },
  { titleKey: "adminNav.burnControl", url: "/admin/burn-control", icon: Zap, groupKey: "adminNav.tokenEconomy", badge: null },
  { titleKey: "adminNav.economicModels", url: "/admin/economics", icon: TrendingUp, groupKey: "adminNav.tokenEconomy", badge: null },
  { titleKey: "adminNav.treasuryManagement", url: "/admin/treasury", icon: Briefcase, groupKey: "adminNav.tokenEconomy", badge: null },
  { titleKey: "adminNav.tokenomicsSimulation", url: "/admin/tokenomics", icon: TrendingUp, groupKey: "adminNav.tokenEconomy", badge: "NEW" },
  { titleKey: "adminNav.tokenDistribution", url: "/admin/token-distribution", icon: Layers, groupKey: "adminNav.tokenEconomy", badge: "8" },
  
  // Group 4: AI Systems
  { titleKey: "adminNav.aiOrchestration", url: "/admin/ai", icon: Brain, groupKey: "adminNav.aiSystems", badge: null },
  { titleKey: "adminNav.modelTraining", url: "/admin/ai-training", icon: Cpu, groupKey: "adminNav.aiSystems", badge: null },
  { titleKey: "adminNav.decisionAnalytics", url: "/admin/ai-analytics", icon: ChartPie, groupKey: "adminNav.aiSystems", badge: null },
  { titleKey: "adminNav.parameterTuning", url: "/admin/ai-tuning", icon: Cog, groupKey: "adminNav.aiSystems", badge: null },
  
  // Group 5: Bridge & Cross-Chain
  { titleKey: "adminNav.bridgeDashboard", url: "/admin/bridge", icon: Link2, groupKey: "adminNav.bridgeCrossChain", badge: null },
  { titleKey: "adminNav.transferMonitor", url: "/admin/bridge-transfers", icon: RefreshCw, groupKey: "adminNav.bridgeCrossChain", badge: null },
  { titleKey: "adminNav.bridgeValidators", url: "/admin/bridge-validators", icon: ShieldCheck, groupKey: "adminNav.bridgeCrossChain", badge: null },
  { titleKey: "adminNav.chainConnections", url: "/admin/chains", icon: Network, groupKey: "adminNav.bridgeCrossChain", badge: null },
  { titleKey: "adminNav.liquidityManagement", url: "/admin/bridge-liquidity", icon: Layers, groupKey: "adminNav.bridgeCrossChain", badge: null },
  
  // Group 6: Security & Audit
  { titleKey: "adminNav.securityDashboard", url: "/admin/security", icon: Shield, groupKey: "adminNav.securityAudit", badge: null },
  { titleKey: "adminNav.accessControl", url: "/admin/access-control", icon: Lock, groupKey: "adminNav.securityAudit", badge: null },
  { titleKey: "adminNav.auditLogs", url: "/admin/audit-logs", icon: FileSearch, groupKey: "adminNav.securityAudit", badge: null },
  { titleKey: "adminNav.threatDetection", url: "/admin/threats", icon: ShieldAlert, groupKey: "adminNav.securityAudit", badge: "2" },
  { titleKey: "adminNav.compliance", url: "/admin/compliance", icon: Scale, groupKey: "adminNav.securityAudit", badge: null },
  { titleKey: "adminNav.bugBounty", url: "/admin/bug-bounty", icon: Bug, groupKey: "adminNav.securityAudit", badge: null },
  
  // Group 7: Data & Analytics
  { titleKey: "adminNav.biDashboard", url: "/admin/bi", icon: BarChart3, groupKey: "adminNav.dataAnalytics", badge: null },
  { titleKey: "adminNav.txAnalytics", url: "/admin/tx-analytics", icon: Activity, groupKey: "adminNav.dataAnalytics", badge: null },
  { titleKey: "adminNav.userAnalytics", url: "/admin/user-analytics", icon: Users, groupKey: "adminNav.dataAnalytics", badge: null },
  { titleKey: "adminNav.networkAnalytics", url: "/admin/network-analytics", icon: Globe, groupKey: "adminNav.dataAnalytics", badge: null },
  { titleKey: "adminNav.customReports", url: "/admin/reports", icon: FileText, groupKey: "adminNav.dataAnalytics", badge: null },
  
  // Group 8: Operations Tools
  { titleKey: "adminNav.emergencyControls", url: "/admin/emergency", icon: AlertTriangle, groupKey: "adminNav.operationsTools", badge: null },
  { titleKey: "adminNav.maintenanceMode", url: "/admin/maintenance", icon: Wrench, groupKey: "adminNav.operationsTools", badge: null },
  { titleKey: "adminNav.backupRestore", url: "/admin/backup", icon: Database, groupKey: "adminNav.operationsTools", badge: null },
  { titleKey: "adminNav.systemUpdates", url: "/admin/updates", icon: Upload, groupKey: "adminNav.operationsTools", badge: null },
  { titleKey: "adminNav.logViewer", url: "/admin/logs", icon: Terminal, groupKey: "adminNav.operationsTools", badge: null },
  
  // Group 9: Configuration
  { titleKey: "adminNav.systemSettings", url: "/admin/settings", icon: Settings, groupKey: "adminNav.configuration", badge: null },
  { titleKey: "adminNav.apiConfig", url: "/admin/api-config", icon: Key, groupKey: "adminNav.configuration", badge: null },
  { titleKey: "adminNav.integrations", url: "/admin/integrations", icon: PanelLeft, groupKey: "adminNav.configuration", badge: null },
  { titleKey: "adminNav.notifications", url: "/admin/notification-settings", icon: Bell, groupKey: "adminNav.configuration", badge: null },
  { titleKey: "adminNav.appearance", url: "/admin/appearance", icon: Palette, groupKey: "adminNav.configuration", badge: null },
  
  // Group 10: User Management
  { titleKey: "adminNav.adminAccounts", url: "/admin/accounts", icon: UserCog, groupKey: "adminNav.userManagement", badge: null },
  { titleKey: "adminNav.roleManagement", url: "/admin/roles", icon: Users, groupKey: "adminNav.userManagement", badge: null },
  { titleKey: "adminNav.permissions", url: "/admin/permissions", icon: Lock, groupKey: "adminNav.userManagement", badge: null },
  { titleKey: "adminNav.activityHistory", url: "/admin/activity", icon: History, groupKey: "adminNav.userManagement", badge: null },
  { titleKey: "adminNav.sessionManagement", url: "/admin/sessions", icon: Clock, groupKey: "adminNav.userManagement", badge: null },
  
  // Group 11: Governance
  { titleKey: "adminNav.proposalManagement", url: "/admin/proposals", icon: Vote, groupKey: "adminNav.governance", badge: null },
  { titleKey: "adminNav.votingConfig", url: "/admin/voting-config", icon: Scale, groupKey: "adminNav.governance", badge: null },
  { titleKey: "adminNav.executionMonitor", url: "/admin/execution", icon: Play, groupKey: "adminNav.governance", badge: null },
  { titleKey: "adminNav.govParams", url: "/admin/gov-params", icon: Settings, groupKey: "adminNav.governance", badge: null },
  { titleKey: "adminNav.communityFeedback", url: "/admin/community-feedback", icon: MessageSquare, groupKey: "adminNav.governance", badge: null },
  { titleKey: "adminNav.communityContent", url: "/admin/community-content", icon: FileText, groupKey: "adminNav.governance", badge: null },
  
  // Group 12: Developer Tools
  { titleKey: "adminNav.apiDocs", url: "/admin/api-docs", icon: FileCode, groupKey: "adminNav.developerTools", badge: null },
  { titleKey: "adminNav.sdkManagement", url: "/admin/sdk", icon: FolderCode, groupKey: "adminNav.developerTools", badge: null },
  { titleKey: "adminNav.contractTools", url: "/admin/contract-tools", icon: Terminal, groupKey: "adminNav.developerTools", badge: null },
  { titleKey: "adminNav.testnetControl", url: "/admin/testnet", icon: TestTube, groupKey: "adminNav.developerTools", badge: null },
  { titleKey: "adminNav.debugConsole", url: "/admin/debug", icon: Monitor, groupKey: "adminNav.developerTools", badge: null },
  
  // Group 13: Monitoring & Alerts
  { titleKey: "adminNav.realTimeMonitor", url: "/admin/realtime", icon: Monitor, groupKey: "adminNav.monitoringAlerts", badge: null },
  { titleKey: "adminNav.metricsExplorer", url: "/admin/metrics-explorer", icon: Gauge, groupKey: "adminNav.monitoringAlerts", badge: null },
  { titleKey: "adminNav.alertRules", url: "/admin/alert-rules", icon: Bell, groupKey: "adminNav.monitoringAlerts", badge: null },
  { titleKey: "adminNav.dashboardBuilder", url: "/admin/dashboard-builder", icon: LayoutDashboard, groupKey: "adminNav.monitoringAlerts", badge: null },
  { titleKey: "adminNav.slaMonitoring", url: "/admin/sla", icon: Clock, groupKey: "adminNav.monitoringAlerts", badge: null },
  
  // Group 14: Finance & Accounting
  { titleKey: "adminNav.financeOverview", url: "/admin/finance", icon: DollarSign, groupKey: "adminNav.financeAccounting", badge: null },
  { titleKey: "adminNav.txAccounting", url: "/admin/tx-accounting", icon: Calculator, groupKey: "adminNav.financeAccounting", badge: null },
  { titleKey: "adminNav.budgetManagement", url: "/admin/budget", icon: Briefcase, groupKey: "adminNav.financeAccounting", badge: null },
  { titleKey: "adminNav.costAnalysis", url: "/admin/cost-analysis", icon: ChartPie, groupKey: "adminNav.financeAccounting", badge: null },
  { titleKey: "adminNav.taxReporting", url: "/admin/tax", icon: FileText, groupKey: "adminNav.financeAccounting", badge: null },
  
  // Group 15: Education & Support
  { titleKey: "adminNav.helpCenter", url: "/admin/help", icon: BookOpen, groupKey: "adminNav.educationSupport", badge: null },
  { titleKey: "adminNav.trainingMaterials", url: "/admin/training", icon: GraduationCap, groupKey: "adminNav.educationSupport", badge: null },
  { titleKey: "adminNav.supportTickets", url: "/admin/tickets", icon: Ticket, groupKey: "adminNav.educationSupport", badge: "12" },
  { titleKey: "adminNav.feedbackSystem", url: "/admin/feedback", icon: MessageSquare, groupKey: "adminNav.educationSupport", badge: null },
  { titleKey: "adminNav.announcements", url: "/admin/announcements", icon: Bell, groupKey: "adminNav.educationSupport", badge: null },
  
  // Group 16: Genesis Launch
  { titleKey: "adminNav.genesisLaunch", url: "/admin/genesis", icon: Rocket, groupKey: "adminNav.genesisLaunch", badge: "NEW" },
  
  // Group 17: Marketing
  { titleKey: "adminNav.newsletterManagement", url: "/admin/newsletter", icon: Mail, groupKey: "adminNav.marketing", badge: null },
];

const groupOrder = [
  "adminNav.systemDashboard",
  "adminNav.networkOps",
  "adminNav.tokenEconomy",
  "adminNav.aiSystems",
  "adminNav.bridgeCrossChain",
  "adminNav.securityAudit",
  "adminNav.dataAnalytics",
  "adminNav.operationsTools",
  "adminNav.configuration",
  "adminNav.userManagement",
  "adminNav.governance",
  "adminNav.developerTools",
  "adminNav.monitoringAlerts",
  "adminNav.financeAccounting",
  "adminNav.educationSupport",
  "adminNav.genesisLaunch",
  "adminNav.marketing",
];

export function AdminPortalSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(itemUrl);
  };

  const groupedItems = adminMenuItems.reduce((acc, item) => {
    if (!acc[item.groupKey]) {
      acc[item.groupKey] = [];
    }
    acc[item.groupKey].push(item);
    return acc;
  }, {} as Record<string, typeof adminMenuItems>);

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4 border-b border-border/40">
        <Link href="/admin">
          <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-lg p-1 -m-1 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight">{t('adminNav.adminPortal')}</span>
              <span className="text-xs text-muted-foreground">{t('adminNav.version')}</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-180px)]">
          {groupOrder.map((groupKey) => {
            const items = groupedItems[groupKey];
            if (!items || items.length === 0) return null;
            
            return (
              <SidebarGroup key={groupKey} className="pb-2">
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                  {t(groupKey)}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.titleKey}>
                        <SidebarMenuButton
                          asChild
                          isActive={isItemActive(item.url)}
                          data-testid={`link-admin-${item.titleKey.split('.').pop()?.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{t(item.titleKey)}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </ScrollArea>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/40 p-4">
        <Link href="/app">
          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Bot className="h-4 w-4" />
            <span>{t('adminNav.backToExplorer')}</span>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
