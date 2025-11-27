import {
  Activity,
  ArrowDownUp,
  ArrowRightLeft,
  BarChart3,
  Blocks,
  Bot,
  Brain,
  ClipboardList,
  Code2,
  Coins,
  Droplets,
  FileCode,
  FileText,
  Flame,
  Gift,
  Grid3x3,
  Home,
  Key,
  Landmark,
  Layers,
  Link2,
  PiggyBank,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sprout,
  TrendingUp,
  UserCog,
  Users,
  Vote,
  Zap,
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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    group: "Explorer",
  },
  {
    title: "Blocks",
    url: "/blocks",
    icon: Blocks,
    group: "Explorer",
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: Activity,
    group: "Explorer",
  },
  {
    title: "Wallets",
    url: "/wallets",
    icon: Layers,
    group: "Explorer",
  },
  {
    title: "Token System",
    url: "/token-system",
    icon: Coins,
    group: "Token v4.0",
  },
  {
    title: "Cross-Chain Bridge",
    url: "/bridge",
    icon: Link2,
    group: "Token v4.0",
  },
  {
    title: "AI Governance",
    url: "/governance",
    icon: Brain,
    group: "Token v4.0",
  },
  {
    title: "Auto-Burn",
    url: "/burn",
    icon: Flame,
    group: "Token v4.0",
  },
  {
    title: "Staking Pools",
    url: "/staking",
    icon: PiggyBank,
    group: "Staking",
  },
  {
    title: "Rewards Center",
    url: "/staking/rewards",
    icon: Gift,
    group: "Staking",
  },
  {
    title: "Wallet SDK",
    url: "/staking/sdk",
    icon: Code2,
    group: "Staking",
  },
  {
    title: "DEX",
    url: "/dex",
    icon: ArrowDownUp,
    group: "DeFi",
  },
  {
    title: "Liquidity Pools",
    url: "/dex#pools",
    icon: Droplets,
    group: "DeFi",
  },
  {
    title: "Lending",
    url: "/lending",
    icon: Landmark,
    group: "DeFi",
  },
  {
    title: "Yield Farming",
    url: "/yield-farming",
    icon: Sprout,
    group: "DeFi",
  },
  {
    title: "Liquid Staking",
    url: "/liquid-staking",
    icon: Droplets,
    group: "DeFi",
  },
  {
    title: "Validators",
    url: "/validators",
    icon: Server,
    group: "Network",
  },
  {
    title: "Members",
    url: "/members",
    icon: Users,
    group: "Network",
  },
  {
    title: "Consensus",
    url: "/consensus",
    icon: Vote,
    group: "Network",
  },
  {
    title: "AI Orchestration",
    url: "/ai",
    icon: Bot,
    group: "Network",
  },
  {
    title: "Sharding",
    url: "/sharding",
    icon: Grid3x3,
    group: "Network",
  },
  {
    title: "Cross-Shard",
    url: "/cross-shard",
    icon: ArrowRightLeft,
    group: "Network",
  },
  {
    title: "Smart Contracts",
    url: "/contracts",
    icon: FileCode,
    group: "Developer",
  },
  {
    title: "TX Simulator",
    url: "/simulator",
    icon: Zap,
    group: "Developer",
  },
  {
    title: "Admin Panel",
    url: "/admin",
    icon: Settings,
    group: "Admin",
  },
  {
    title: "Node Health",
    url: "/health",
    icon: BarChart3,
    group: "Admin",
  },
  {
    title: "Performance",
    url: "/metrics",
    icon: TrendingUp,
    group: "Admin",
  },
  {
    title: "API Keys",
    url: "/api-keys",
    icon: Key,
    group: "Security",
  },
  {
    title: "Operator Portal",
    url: "/operator",
    icon: UserCog,
    group: "Operator",
  },
  {
    title: "Member Mgmt",
    url: "/operator/members",
    icon: Users,
    group: "Operator",
  },
  {
    title: "Validator Ops",
    url: "/operator/validators",
    icon: ShieldCheck,
    group: "Operator",
  },
  {
    title: "Security Audit",
    url: "/operator/security",
    icon: Shield,
    group: "Operator",
  },
  {
    title: "Reports",
    url: "/operator/reports",
    icon: FileText,
    group: "Operator",
  },
];

const groupedItems = menuItems.reduce((acc, item) => {
  if (!acc[item.group]) {
    acc[item.group] = [];
  }
  acc[item.group].push(item);
  return acc;
}, {} as Record<string, typeof menuItems>);

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">TBURN Chain</span>
            <span className="text-xs text-muted-foreground">Mainnet</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(groupedItems).map(([group, items]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
