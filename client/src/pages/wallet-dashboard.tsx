import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  QrCode, 
  ArrowRightLeft, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  CartesianGrid
} from "recharts";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface WalletBalance {
  balance: string;
  balanceUsd: string;
  change24h: number;
  address: string;
}

interface PerformanceDataPoint {
  day: string;
  value: number;
}

interface ActivityItem {
  id: string;
  type: 'sent' | 'received' | 'swap';
  amount: string;
  address: string;
  timestamp: string;
  tokenPair?: string;
}

function useScrambleText(finalValue: string, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState("0.00");
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (!finalValue) return;
    
    setIsAnimating(true);
    const letters = "0123456789";
    let iterations = 0;
    const targetIterations = finalValue.length * 3;
    
    const interval = setInterval(() => {
      setDisplayValue(
        finalValue
          .split("")
          .map((char, index) => {
            if (index < iterations / 3) return finalValue[index];
            if (char === "." || char === ",") return char;
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("")
      );
      
      if (iterations >= targetIterations) {
        clearInterval(interval);
        setDisplayValue(finalValue);
        setIsAnimating(false);
      }
      iterations += 1;
    }, duration / targetIterations);
    
    return () => clearInterval(interval);
  }, [finalValue, duration]);
  
  return { displayValue, isAnimating };
}

function SpotlightCard({ 
  children, 
  className,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }, []);
  
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "spotlight-card relative overflow-hidden rounded-xl p-4 transition-transform duration-300",
        "bg-card/60 border border-border/50 backdrop-blur-sm",
        "hover:-translate-y-1",
        className
      )}
      style={{
        "--mouse-x": "0px",
        "--mouse-y": "0px",
      } as React.CSSProperties}
      {...props}
    >
      <div className="spotlight-border absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-500 hover:opacity-100" />
      {children}
    </div>
  );
}

function QuickActionButton({ 
  icon: Icon, 
  title, 
  subtitle, 
  colorClass,
  onClick,
  testId
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  colorClass: string;
  onClick?: () => void;
  testId: string;
}) {
  return (
    <SpotlightCard className="group">
      <Button
        variant="ghost"
        className="w-full h-auto p-0 justify-start hover:bg-transparent"
        onClick={onClick}
        data-testid={testId}
      >
        <div className="flex items-center gap-4 w-full">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-110",
            colorClass
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </Button>
    </SpotlightCard>
  );
}

function BalanceCard({ balance, isLoading }: { balance?: WalletBalance; isLoading: boolean }) {
  const { t } = useTranslation();
  const { displayValue } = useScrambleText(balance?.balance || "0.00", 1000);
  
  if (isLoading) {
    return (
      <Card className="lg:col-span-2 relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const changePercent = balance?.change24h || 0;
  const isPositive = changePercent >= 0;
  
  return (
    <Card className="lg:col-span-2 relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/50 group">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition duration-700" />
      
      <CardContent className="p-8 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-xs font-mono text-muted-foreground mb-2 border border-border/50 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background/50">
              <Wallet className="h-3 w-3 text-primary" />
              <span>{t("walletDashboard.mainWallet", "MAIN WALLET")}</span>
            </div>
            <h2 className="text-muted-foreground text-sm font-medium">
              {t("walletDashboard.totalBalance", "Total Balance")}
            </h2>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "font-mono text-xs",
              isPositive 
                ? "text-green-500 border-green-500/30 bg-green-500/10" 
                : "text-red-500 border-red-500/30 bg-red-500/10"
            )}
            data-testid="badge-24h-change"
          >
            {isPositive ? "▲" : "▼"} {Math.abs(changePercent).toFixed(1)}% (24h)
          </Badge>
        </div>
        
        <div className="flex items-baseline gap-3 mb-2">
          <h1 
            className="text-5xl md:text-6xl font-bold text-foreground tracking-tighter font-mono"
            data-testid="text-balance-amount"
          >
            {displayValue}
          </h1>
          <span className="text-xl text-primary font-light">BURN</span>
        </div>
        <p className="text-sm text-muted-foreground font-mono" data-testid="text-balance-usd">
          ≈ ${balance?.balanceUsd || "0.00"} USD
        </p>
      </CardContent>
    </Card>
  );
}

function PerformanceChart({ 
  data, 
  isLoading,
  timeRange,
  onTimeRangeChange 
}: { 
  data: PerformanceDataPoint[];
  isLoading: boolean;
  timeRange: '1W' | '1M' | '1Y';
  onTimeRangeChange: (range: '1W' | '1M' | '1Y') => void;
}) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          {t("walletDashboard.performance", "Performance")}
        </CardTitle>
        <div className="flex bg-background/50 rounded-lg p-1 border border-border/50">
          {(['1W', '1M', '1Y'] as const).map((range) => (
            <Button
              key={range}
              variant="ghost"
              size="sm"
              className={cn(
                "px-3 py-1 h-auto text-xs rounded-md",
                timeRange === range 
                  ? "bg-muted text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onTimeRangeChange(range)}
              data-testid={`button-range-${range}`}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [formatNumber(value) + ' BURN', 'Balance']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#chartGradient)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ activities, isLoading }: { activities: ActivityItem[]; isLoading: boolean }) {
  const { t } = useTranslation();
  
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sent':
        return <ArrowUpRight className="h-3 w-3 rotate-45" />;
      case 'received':
        return <ArrowDownLeft className="h-3 w-3 rotate-45" />;
      case 'swap':
        return <ArrowRightLeft className="h-3 w-3" />;
    }
  };
  
  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sent':
        return 'bg-red-500/20 text-red-400';
      case 'received':
        return 'bg-green-500/20 text-green-400';
      case 'swap':
        return 'bg-purple-500/20 text-purple-400';
    }
  };
  
  const getActivityLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sent':
        return t("walletDashboard.sent", "Sent");
      case 'received':
        return t("walletDashboard.received", "Received");
      case 'swap':
        return t("walletDashboard.swap", "Swap");
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {t("walletDashboard.activity", "Activity")}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-primary hover:text-primary/80 font-mono h-auto p-0"
          data-testid="button-view-all"
        >
          {t("walletDashboard.viewAll", "VIEW ALL")}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition cursor-pointer group"
                data-testid={`activity-item-${activity.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    getActivityColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition">
                      {getActivityLabel(activity.type)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {activity.tokenPair || activity.address}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-sm font-bold",
                    activity.type === 'received' ? "text-primary" : "text-foreground"
                  )}>
                    {activity.type === 'received' ? '+' : activity.type === 'sent' ? '-' : ''}{activity.amount}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

const defaultBalance: WalletBalance = {
  balance: "15,847.00",
  balanceUsd: "38,191.27",
  change24h: 4.2,
  address: "0x9a4c...2f5e"
};

const defaultPerformance: PerformanceDataPoint[] = [
  { day: 'Mon', value: 12500 },
  { day: 'Tue', value: 13200 },
  { day: 'Wed', value: 12800 },
  { day: 'Thu', value: 14500 },
  { day: 'Fri', value: 14200 },
  { day: 'Sat', value: 15100 },
  { day: 'Sun', value: 15847 },
];

const defaultActivities: ActivityItem[] = [
  { id: '1', type: 'sent', amount: '500.00', address: '0x7f...9b2d', timestamp: '2 min ago' },
  { id: '2', type: 'received', amount: '1,200.00', address: '0x2d...4c1a', timestamp: '1 hr ago' },
  { id: '3', type: 'swap', amount: '300.00', address: '', tokenPair: 'BURN → USDT', timestamp: '5 hrs ago' },
  { id: '4', type: 'received', amount: '750.00', address: '0x5a...8e3f', timestamp: '8 hrs ago' },
  { id: '5', type: 'sent', amount: '200.00', address: '0x1c...7d9a', timestamp: '1 day ago' },
];

export default function WalletDashboard() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '1Y'>('1W');
  
  const { data: walletBalance, isLoading: balanceLoading } = useQuery<WalletBalance>({
    queryKey: ["/api/wallet/balance"],
    refetchInterval: 30000,
    placeholderData: defaultBalance,
    staleTime: 10000,
  });
  
  const { data: performanceData, isLoading: performanceLoading } = useQuery<PerformanceDataPoint[]>({
    queryKey: ["/api/wallet/performance", timeRange],
    refetchInterval: 60000,
    placeholderData: defaultPerformance,
    staleTime: 30000,
  });
  
  const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/wallet/activities"],
    refetchInterval: 15000,
    placeholderData: defaultActivities,
    staleTime: 5000,
  });
  
  const displayBalance = walletBalance || defaultBalance;
  const displayPerformance = performanceData || defaultPerformance;
  const displayActivities = activities || defaultActivities;
  
  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen relative">
      <style>{`
        .spotlight-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: radial-gradient(
            600px circle at var(--mouse-x) var(--mouse-y),
            hsl(var(--primary) / 0.4),
            transparent 40%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
        }
        .spotlight-card:hover::before {
          opacity: 1;
        }
      `}</style>
      
      <div className="mb-2">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">
          {t("walletDashboard.title", "Wallet Dashboard")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("walletDashboard.subtitle", "Manage your BURN tokens and track performance")}
        </p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6 mb-4">
        <BalanceCard balance={displayBalance} isLoading={balanceLoading} />
        
        <div className="flex flex-col gap-4">
          <QuickActionButton
            icon={Send}
            title={t("walletDashboard.send", "Send")}
            subtitle={t("walletDashboard.transferTokens", "Transfer tokens")}
            colorClass="bg-primary/10 text-primary border-primary/30"
            testId="button-send"
          />
          <QuickActionButton
            icon={QrCode}
            title={t("walletDashboard.receive", "Receive")}
            subtitle={t("walletDashboard.viewAddress", "View address")}
            colorClass="bg-purple-500/10 text-purple-500 border-purple-500/30"
            testId="button-receive"
          />
          <QuickActionButton
            icon={ArrowRightLeft}
            title={t("walletDashboard.swapAction", "Swap")}
            subtitle={t("walletDashboard.tradeTokens", "Trade tokens")}
            colorClass="bg-green-500/10 text-green-500 border-green-500/30"
            testId="button-swap"
          />
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <PerformanceChart 
          data={displayPerformance}
          isLoading={performanceLoading}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        
        <ActivityFeed 
          activities={displayActivities}
          isLoading={activitiesLoading}
        />
      </div>
    </div>
  );
}
