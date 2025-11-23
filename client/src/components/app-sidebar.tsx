import {
  Activity,
  ArrowRightLeft,
  BarChart3,
  Blocks,
  Bot,
  FileCode,
  Grid3x3,
  Home,
  Key,
  Layers,
  Server,
  Settings,
  TrendingUp,
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
    title: "Wallets",
    url: "/wallets",
    icon: Layers,
    group: "Explorer",
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
