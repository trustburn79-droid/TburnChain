import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck,
  Server,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Award,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function AdminValidators() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: validatorsData, isLoading } = useQuery<{ validators: any[] }>({
    queryKey: ["/api/validators"],
    refetchInterval: 30000,
  });

  const validators = useMemo(() => validatorsData?.validators || [
    { address: "0x1234...5678", name: "TBURN Genesis", status: "active", stake: "15000000", delegators: 1245, commission: 5, uptime: 99.99, blocksProduced: 45678, blocksProposed: 45680, rewards: "125000", aiTrustScore: 9850, jailedUntil: null },
    { address: "0x2345...6789", name: "BlockForge", status: "active", stake: "12500000", delegators: 987, commission: 7, uptime: 99.95, blocksProduced: 38456, blocksProposed: 38460, rewards: "98000", aiTrustScore: 9720, jailedUntil: null },
    { address: "0x3456...789a", name: "CryptoStake", status: "active", stake: "10800000", delegators: 756, commission: 6, uptime: 99.92, blocksProduced: 32145, blocksProposed: 32150, rewards: "85000", aiTrustScore: 9680, jailedUntil: null },
    { address: "0x4567...89ab", name: "NodeMaster", status: "active", stake: "9200000", delegators: 645, commission: 8, uptime: 99.88, blocksProduced: 28765, blocksProposed: 28770, rewards: "72000", aiTrustScore: 9540, jailedUntil: null },
    { address: "0x5678...9abc", name: "ValidateX", status: "active", stake: "8100000", delegators: 534, commission: 5, uptime: 99.85, blocksProduced: 25432, blocksProposed: 25440, rewards: "65000", aiTrustScore: 9480, jailedUntil: null },
    { address: "0x6789...abcd", name: "StakePool Pro", status: "inactive", stake: "7500000", delegators: 423, commission: 6, uptime: 98.5, blocksProduced: 21567, blocksProposed: 21600, rewards: "58000", aiTrustScore: 9120, jailedUntil: null },
    { address: "0x789a...bcde", name: "CryptoValidate", status: "jailed", stake: "6800000", delegators: 312, commission: 10, uptime: 95.2, blocksProduced: 18234, blocksProposed: 18500, rewards: "45000", aiTrustScore: 7850, jailedUntil: new Date(Date.now() + 86400000) },
    { address: "0x89ab...cdef", name: "BlockNode", status: "active", stake: "6200000", delegators: 289, commission: 7, uptime: 99.82, blocksProduced: 15678, blocksProposed: 15680, rewards: "42000", aiTrustScore: 9380, jailedUntil: null },
  ], [validatorsData]);

  const filteredValidators = useMemo(() => {
    return validators.filter((v: any) => {
      const matchesSearch = searchQuery === "" ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [validators, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: validators.length,
    active: validators.filter((v: any) => v.status === "active").length,
    inactive: validators.filter((v: any) => v.status === "inactive").length,
    jailed: validators.filter((v: any) => v.status === "jailed").length,
    totalStake: validators.reduce((acc: number, v: any) => acc + parseFloat(v.stake), 0),
    totalDelegators: validators.reduce((acc: number, v: any) => acc + v.delegators, 0),
  }), [validators]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
      case "inactive": return <Badge className="bg-yellow-500/10 text-yellow-500">Inactive</Badge>;
      case "jailed": return <Badge className="bg-red-500/10 text-red-500">Jailed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTBURN = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toFixed(0);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-8 w-8" />
              Validator Management
            </h1>
            <p className="text-muted-foreground">Monitor and manage network validators</p>
          </div>
          <Button data-testid="button-add-validator">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Add Validator
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Validators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.inactive}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.jailed}</p>
              <p className="text-xs text-muted-foreground">Jailed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatTBURN(stats.totalStake.toString())}</p>
              <p className="text-xs text-muted-foreground">Total Stake</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalDelegators.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Delegators</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Validators</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search validators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                    data-testid="input-validator-search"
                  />
                </div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    <TabsTrigger value="jailed">Jailed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Validator</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Stake</th>
                    <th className="text-right py-3 px-4 font-medium">Delegators</th>
                    <th className="text-right py-3 px-4 font-medium">Commission</th>
                    <th className="text-right py-3 px-4 font-medium">Uptime</th>
                    <th className="text-right py-3 px-4 font-medium">Blocks</th>
                    <th className="text-right py-3 px-4 font-medium">AI Trust</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredValidators.map((validator: any) => (
                    <tr key={validator.address} className="border-b hover-elevate cursor-pointer">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{validator.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{validator.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(validator.status)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatTBURN(validator.stake)} TBURN</td>
                      <td className="py-3 px-4 text-right">{validator.delegators.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{validator.commission}%</td>
                      <td className="py-3 px-4 text-right">
                        <Badge className={validator.uptime >= 99.9 ? "bg-green-500/10 text-green-500" : validator.uptime >= 99 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}>
                          {validator.uptime}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{validator.blocksProduced.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Progress value={validator.aiTrustScore / 100} className="w-16 h-2" />
                          <span className="text-xs font-mono w-12">{(validator.aiTrustScore / 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="sm" variant="ghost">View</Button>
                          {validator.status === "jailed" && (
                            <Button size="sm" variant="outline" className="text-green-500">
                              Unjail
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
