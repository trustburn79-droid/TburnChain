import { useTranslation } from 'react-i18next';
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
  Gamepad2,
  Gift,
  Grid3x3,
  Home,
  Image,
  Key,
  Landmark,
  Layers,
  Link2,
  Wallet,
  PiggyBank,
  Rocket,
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
import { TBurnLogo } from "@/components/tburn-logo";
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

function NavLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: any }) {
  const hasHash = href.includes("#");
  const basePath = hasHash ? href.split("#")[0] : href;
  const hash = hasHash ? href.split("#")[1] : "";
  
  const handleClick = (e: React.MouseEvent) => {
    if (hasHash) {
      e.preventDefault();
      if (window.location.pathname !== basePath) {
        window.location.href = href;
      } else {
        window.location.hash = hash;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    }
  };
  
  if (hasHash) {
    return (
      <a href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  }
  
  return <Link href={href} {...props}>{children}</Link>;
}

const menuItems = [
  { titleKey: "nav.dashboard", url: "/app", icon: Home, groupKey: "nav.explorer" },
  { titleKey: "nav.blocks", url: "/app/blocks", icon: Blocks, groupKey: "nav.explorer" },
  { titleKey: "nav.transactions", url: "/app/transactions", icon: Activity, groupKey: "nav.explorer" },
  { titleKey: "nav.wallets", url: "/app/wallets", icon: Layers, groupKey: "nav.explorer" },
  { titleKey: "nav.walletDashboard", url: "/app/wallet-dashboard", icon: Wallet, groupKey: "nav.explorer" },
  { titleKey: "nav.tokenSystem", url: "/app/token-system", icon: Coins, groupKey: "nav.tokenV4" },
  { titleKey: "nav.crossChainBridge", url: "/app/bridge", icon: Link2, groupKey: "nav.tokenV4" },
  { titleKey: "nav.aiGovernance", url: "/app/governance", icon: Brain, groupKey: "nav.tokenV4" },
  { titleKey: "nav.autoBurn", url: "/app/burn", icon: Flame, groupKey: "nav.tokenV4" },
  { titleKey: "nav.stakingPools", url: "/app/staking", icon: PiggyBank, groupKey: "nav.staking" },
  { titleKey: "nav.rewardsCenter", url: "/app/staking/rewards", icon: Gift, groupKey: "nav.staking" },
  { titleKey: "nav.walletSdk", url: "/app/staking/sdk", icon: Code2, groupKey: "nav.staking" },
  { titleKey: "nav.dex", url: "/app/dex", icon: ArrowDownUp, groupKey: "nav.defi" },
  { titleKey: "nav.liquidityPools", url: "/app/dex#pools", icon: Droplets, groupKey: "nav.defi" },
  { titleKey: "nav.lending", url: "/app/lending", icon: Landmark, groupKey: "nav.defi" },
  { titleKey: "nav.yieldFarming", url: "/app/yield-farming", icon: Sprout, groupKey: "nav.defi" },
  { titleKey: "nav.liquidStaking", url: "/app/liquid-staking", icon: Droplets, groupKey: "nav.defi" },
  { titleKey: "nav.nftMarketplace", url: "/app/nft-marketplace", icon: Image, groupKey: "nav.defi" },
  { titleKey: "nav.nftLaunchpad", url: "/app/nft-launchpad", icon: Rocket, groupKey: "nav.defi" },
  { titleKey: "nav.gamefiHub", url: "/app/gamefi", icon: Gamepad2, groupKey: "nav.defi" },
  { titleKey: "nav.community", url: "/app/community", icon: Users, groupKey: "nav.community" },
  { titleKey: "nav.consensus", url: "/app/consensus", icon: Vote, groupKey: "nav.network" },
  { titleKey: "nav.aiOrchestration", url: "/app/ai", icon: Bot, groupKey: "nav.network" },
  { titleKey: "nav.sharding", url: "/app/sharding", icon: Grid3x3, groupKey: "nav.network" },
  { titleKey: "nav.crossShard", url: "/app/cross-shard", icon: ArrowRightLeft, groupKey: "nav.network" },
  { titleKey: "nav.smartContracts", url: "/app/contracts", icon: FileCode, groupKey: "nav.developer" },
  { titleKey: "nav.txSimulator", url: "/app/simulator", icon: Zap, groupKey: "nav.developer" },
  { titleKey: "nav.adminPanel", url: "/app/admin", icon: Settings, groupKey: "nav.admin" },
  { titleKey: "nav.nodeHealth", url: "/app/health", icon: BarChart3, groupKey: "nav.admin" },
  { titleKey: "nav.performance", url: "/app/metrics", icon: TrendingUp, groupKey: "nav.admin" },
  { titleKey: "nav.apiKeys", url: "/app/api-keys", icon: Key, groupKey: "nav.security" },
  { titleKey: "nav.operatorPortal", url: "/app/operator", icon: UserCog, groupKey: "nav.operator" },
  { titleKey: "nav.memberMgmt", url: "/app/operator/members", icon: Users, groupKey: "nav.operator" },
  { titleKey: "nav.validatorOps", url: "/app/operator/validators", icon: ShieldCheck, groupKey: "nav.operator" },
  { titleKey: "nav.securityAudit", url: "/app/operator/security", icon: Shield, groupKey: "nav.operator" },
  { titleKey: "nav.reports", url: "/app/operator/reports", icon: FileText, groupKey: "nav.operator" },
];

// Public groups visible to all users
const groupOrder = [
  "nav.explorer",
  "nav.tokenV4",
  "nav.staking",
  "nav.defi",
  "nav.community",
  "nav.network",
  "nav.developer",
];

// Admin/Operator groups are intentionally excluded from public sidebar
// Access via: /admin (Admin Portal) or /app/operator (with authentication)
// Excluded groups: nav.admin, nav.security, nav.operator

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  const isItemActive = (itemUrl: string) => {
    const hasHash = itemUrl.includes("#");
    if (hasHash) {
      const basePath = itemUrl.split("#")[0];
      const hash = itemUrl.split("#")[1];
      return location === basePath && window.location.hash === `#${hash}`;
    }
    return location === itemUrl;
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.groupKey]) {
      acc[item.groupKey] = [];
    }
    acc[item.groupKey].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-1.5">
          <TBurnLogo className="h-9 w-9" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{t('nav.brand')}</span>
            <span className="text-xs text-muted-foreground">Mainnet</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groupOrder.map((groupKey) => {
          const items = groupedItems[groupKey];
          if (!items || items.length === 0) return null;
          return (
            <SidebarGroup key={groupKey}>
              <SidebarGroupLabel>{t(groupKey)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive(item.url)}
                        data-testid={`link-${item.titleKey.split('.').pop()?.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <NavLink href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{t(item.titleKey)}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
