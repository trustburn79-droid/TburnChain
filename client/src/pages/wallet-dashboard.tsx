import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Send, 
  QrCode, 
  ArrowRightLeft, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet,
  Activity,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

function SendDialog({ 
  open, 
  onOpenChange,
  availableBalance 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  availableBalance: string;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const sendMutation = useMutation({
    mutationFn: async (data: { toAddress: string; amount: string; memo?: string }) => {
      const amountWei = (parseFloat(data.amount) * 1e18).toString();
      const response = await apiRequest("POST", "/api/wallet/send", {
        toAddress: data.toAddress,
        amount: amountWei,
        memo: data.memo,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("walletDashboard.transactionSubmitted", "Transaction Submitted"),
        description: t("walletDashboard.sendSuccess", "Your transaction is being processed"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/activities"] });
      onOpenChange(false);
      setToAddress("");
      setAmount("");
      setMemo("");
    },
    onError: (error: Error) => {
      toast({
        title: t("walletDashboard.error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!toAddress || !amount) return;
    sendMutation.mutate({ toAddress, amount, memo });
  };

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(toAddress);
  const isValidAmount = parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            {t("walletDashboard.sendTokens", "Send BURN Tokens")}
          </DialogTitle>
          <DialogDescription>
            {t("walletDashboard.sendDescription", "Transfer BURN tokens to another address")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">{t("walletDashboard.recipientAddress", "Recipient Address")}</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className={cn(
                "font-mono text-sm",
                toAddress && !isValidAddress && "border-red-500"
              )}
              data-testid="input-send-address"
            />
            {toAddress && !isValidAddress && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {t("walletDashboard.invalidAddress", "Invalid address format")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">{t("walletDashboard.amount", "Amount")}</Label>
              <span className="text-xs text-muted-foreground">
                {t("walletDashboard.available", "Available")}: {availableBalance} BURN
              </span>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
                data-testid="input-send-amount"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                BURN
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo">{t("walletDashboard.memo", "Memo")} ({t("walletDashboard.optional", "Optional")})</Label>
            <Input
              id="memo"
              placeholder={t("walletDashboard.memoPlaceholder", "Add a note...")}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              data-testid="input-send-memo"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-send-cancel">
            {t("common.cancel", "Cancel")}
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!isValidAddress || !isValidAmount || sendMutation.isPending}
            data-testid="button-send-confirm"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t("walletDashboard.send", "Send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiveDialog({ 
  open, 
  onOpenChange,
  walletAddress 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast({
        title: t("walletDashboard.copied", "Copied"),
        description: t("walletDashboard.addressCopied", "Address copied to clipboard"),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t("walletDashboard.error", "Error"),
        description: t("walletDashboard.copyFailed", "Failed to copy address"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-purple-500" />
            {t("walletDashboard.receiveTokens", "Receive BURN Tokens")}
          </DialogTitle>
          <DialogDescription>
            {t("walletDashboard.receiveDescription", "Share your address to receive BURN tokens")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-xl">
              <div className="w-48 h-48 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjxnIGZpbGw9IiMwMDAiPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIi8+PHJlY3QgeD0iMTIwIiB5PSIyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIi8+PHJlY3QgeD0iMjAiIHk9IjEyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIi8+PHJlY3QgeD0iOTAiIHk9IjkwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSI5MCIgeT0iMTIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxMjAiIHk9IjkwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxNTAiIHk9IjEyMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIi8+PHJlY3QgeD0iMTIwIiB5PSIxNTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMTMwIiB5PSIzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMzAiIHk9IjEzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxNDAiIHk9IjQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSI0MCIgeT0iMTQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48L2c+PC9zdmc+')] bg-contain" data-testid="qr-code" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("walletDashboard.yourAddress", "Your Address")}</Label>
            <div className="flex gap-2">
              <Input 
                readOnly 
                value={walletAddress} 
                className="font-mono text-sm"
                data-testid="text-receive-address"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleCopy}
                data-testid="button-copy-address"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{t("walletDashboard.instructions", "Instructions")}</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>1. {t("walletDashboard.instruction1", "Scan QR code with your wallet app")}</li>
              <li>2. {t("walletDashboard.instruction2", "Or copy the address to send BURN tokens")}</li>
              <li>3. {t("walletDashboard.instruction3", "Ensure you're on TBURN Mainnet (Chain ID: 7979)")}</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} data-testid="button-receive-close">
            {t("common.close", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SwapDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [tokenIn, setTokenIn] = useState("BURN");
  const [tokenOut, setTokenOut] = useState("USDT");
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const swapMutation = useMutation({
    mutationFn: async (data: { tokenIn: string; tokenOut: string; amountIn: string; slippageBps: number }) => {
      const amountWei = (parseFloat(data.amountIn) * 1e18).toString();
      const response = await apiRequest("POST", "/api/wallet/swap", {
        tokenIn: data.tokenIn,
        tokenOut: data.tokenOut,
        amountIn: amountWei,
        slippageBps: data.slippageBps,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("walletDashboard.swapSubmitted", "Swap Submitted"),
        description: t("walletDashboard.swapSuccess", "Your swap is being processed"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/activities"] });
      onOpenChange(false);
      setAmountIn("");
    },
    onError: (error: Error) => {
      toast({
        title: t("walletDashboard.error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSwap = () => {
    if (!amountIn) return;
    const slippageBps = Math.round(parseFloat(slippage) * 100);
    swapMutation.mutate({ tokenIn, tokenOut, amountIn, slippageBps });
  };

  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  };

  const tokens = ["BURN", "USDT", "ETH", "WBTC"];
  const isValidAmount = parseFloat(amountIn) > 0;
  const estimatedOutput = isValidAmount ? (parseFloat(amountIn) * 0.29).toFixed(4) : "0.00";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-green-500" />
            {t("walletDashboard.swapTokens", "Swap Tokens")}
          </DialogTitle>
          <DialogDescription>
            {t("walletDashboard.swapDescription", "Exchange tokens at the best available rate")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("walletDashboard.youPay", "You Pay")}</Label>
            <div className="flex gap-2">
              <Select value={tokenIn} onValueChange={setTokenIn}>
                <SelectTrigger className="w-28" data-testid="select-token-in">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.filter(t => t !== tokenOut).map(token => (
                    <SelectItem key={token} value={token}>{token}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="flex-1"
                data-testid="input-swap-amount"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={handleFlipTokens}
              data-testid="button-swap-flip"
            >
              <ArrowRightLeft className="h-4 w-4 rotate-90" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t("walletDashboard.youReceive", "You Receive")}</Label>
            <div className="flex gap-2">
              <Select value={tokenOut} onValueChange={setTokenOut}>
                <SelectTrigger className="w-28" data-testid="select-token-out">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.filter(t => t !== tokenIn).map(token => (
                    <SelectItem key={token} value={token}>{token}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                readOnly
                value={estimatedOutput}
                className="flex-1 bg-muted/50"
                data-testid="text-swap-output"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("walletDashboard.slippageTolerance", "Slippage Tolerance")}</Label>
            <div className="flex gap-2">
              {["0.5", "1.0", "2.0"].map(val => (
                <Button
                  key={val}
                  variant={slippage === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSlippage(val)}
                  data-testid={`button-slippage-${val}`}
                >
                  {val}%
                </Button>
              ))}
              <Input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-20"
                data-testid="input-slippage-custom"
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("walletDashboard.rate", "Rate")}</span>
              <span>1 {tokenIn} = {tokenIn === "BURN" ? "0.29" : "3.45"} {tokenOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("walletDashboard.priceImpact", "Price Impact")}</span>
              <span className="text-green-500">&lt;0.1%</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-swap-cancel">
            {t("common.cancel", "Cancel")}
          </Button>
          <Button 
            onClick={handleSwap} 
            disabled={!isValidAmount || swapMutation.isPending}
            data-testid="button-swap-confirm"
          >
            {swapMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRightLeft className="h-4 w-4 mr-2" />
            )}
            {t("walletDashboard.swapAction", "Swap")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const addressParam = urlParams.get('address');
  const walletAddress = addressParam || "0x9a4c8d2f5e3b7a1c6e9d4f8a2b5c7e3f1a4d2f5e";
  const addressQuery = addressParam ? `?address=${addressParam}` : '';
  
  const { data: walletBalance, isLoading: balanceLoading } = useQuery<WalletBalance>({
    queryKey: ["/api/wallet/balance", walletAddress],
    queryFn: () => fetch(`/api/wallet/balance${addressQuery}`).then(res => res.json()),
    refetchInterval: 30000,
    placeholderData: defaultBalance,
    staleTime: 10000,
  });
  
  const { data: performanceResponse, isLoading: performanceLoading } = useQuery<{ dataPoints: PerformanceDataPoint[] }>({
    queryKey: ["/api/wallet/performance", walletAddress, timeRange],
    queryFn: () => fetch(`/api/wallet/performance${addressQuery}${addressQuery ? '&' : '?'}range=${timeRange}`).then(res => res.json()),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const performanceData = performanceResponse?.dataPoints || defaultPerformance;
  
  const { data: activitiesResponse, isLoading: activitiesLoading } = useQuery<{ activities: ActivityItem[] }>({
    queryKey: ["/api/wallet/activities", walletAddress],
    queryFn: () => fetch(`/api/wallet/activities${addressQuery}`).then(res => res.json()),
    refetchInterval: 15000,
    staleTime: 5000,
  });
  const activities = activitiesResponse?.activities || defaultActivities;
  
  const displayBalance = walletBalance || defaultBalance;
  
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
            onClick={() => setSendDialogOpen(true)}
            testId="button-send"
          />
          <QuickActionButton
            icon={QrCode}
            title={t("walletDashboard.receive", "Receive")}
            subtitle={t("walletDashboard.viewAddress", "View address")}
            colorClass="bg-purple-500/10 text-purple-500 border-purple-500/30"
            onClick={() => setReceiveDialogOpen(true)}
            testId="button-receive"
          />
          <QuickActionButton
            icon={ArrowRightLeft}
            title={t("walletDashboard.swapAction", "Swap")}
            subtitle={t("walletDashboard.tradeTokens", "Trade tokens")}
            colorClass="bg-green-500/10 text-green-500 border-green-500/30"
            onClick={() => setSwapDialogOpen(true)}
            testId="button-swap"
          />
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <PerformanceChart 
          data={performanceData}
          isLoading={performanceLoading}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        
        <ActivityFeed 
          activities={activities}
          isLoading={activitiesLoading}
        />
      </div>

      <SendDialog 
        open={sendDialogOpen} 
        onOpenChange={setSendDialogOpen}
        availableBalance={displayBalance.balance}
      />
      <ReceiveDialog 
        open={receiveDialogOpen} 
        onOpenChange={setReceiveDialogOpen}
        walletAddress={walletAddress}
      />
      <SwapDialog 
        open={swapDialogOpen} 
        onOpenChange={setSwapDialogOpen}
      />
    </div>
  );
}
