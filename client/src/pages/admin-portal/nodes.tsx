import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Activity,
  Cpu,
  HardDrive,
  Network,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Globe,
  Clock,
} from "lucide-react";

interface Node {
  id: string;
  name: string;
  type: "validator" | "full" | "archive" | "light";
  status: "online" | "offline" | "syncing";
  ip: string;
  region: string;
  version: string;
  blockHeight: number;
  peers: number;
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  latency: number;
  lastSeen: Date;
}

export default function AdminNodes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const nodes: Node[] = useMemo(() => [
    { id: "node-01", name: "TBURN Genesis Node", type: "validator", status: "online", ip: "10.0.1.1", region: "US-East", version: "v2.1.0", blockHeight: 12847562, peers: 156, uptime: 99.99, cpu: 45, memory: 62, disk: 48, latency: 12, lastSeen: new Date() },
    { id: "node-02", name: "EU Primary", type: "validator", status: "online", ip: "10.0.2.1", region: "EU-West", version: "v2.1.0", blockHeight: 12847562, peers: 142, uptime: 99.95, cpu: 52, memory: 58, disk: 52, latency: 18, lastSeen: new Date() },
    { id: "node-03", name: "APAC Primary", type: "validator", status: "online", ip: "10.0.3.1", region: "AP-East", version: "v2.1.0", blockHeight: 12847560, peers: 128, uptime: 99.92, cpu: 48, memory: 65, disk: 55, latency: 45, lastSeen: new Date() },
    { id: "node-04", name: "Archive Node 1", type: "archive", status: "syncing", ip: "10.0.4.1", region: "US-West", version: "v2.1.0", blockHeight: 12847550, peers: 85, uptime: 98.5, cpu: 78, memory: 82, disk: 85, latency: 25, lastSeen: new Date() },
    { id: "node-05", name: "Full Node EU", type: "full", status: "online", ip: "10.0.5.1", region: "EU-Central", version: "v2.1.0", blockHeight: 12847562, peers: 95, uptime: 99.88, cpu: 35, memory: 48, disk: 42, latency: 22, lastSeen: new Date() },
    { id: "node-06", name: "Light Node 1", type: "light", status: "online", ip: "10.0.6.1", region: "US-Central", version: "v2.1.0", blockHeight: 12847562, peers: 32, uptime: 99.75, cpu: 15, memory: 25, disk: 12, latency: 8, lastSeen: new Date() },
    { id: "node-07", name: "Backup Validator", type: "validator", status: "offline", ip: "10.0.7.1", region: "EU-North", version: "v2.0.9", blockHeight: 12847100, peers: 0, uptime: 95.2, cpu: 0, memory: 0, disk: 65, latency: 0, lastSeen: new Date(Date.now() - 3600000) },
    { id: "node-08", name: "Full Node APAC", type: "full", status: "online", ip: "10.0.8.1", region: "AP-South", version: "v2.1.0", blockHeight: 12847561, peers: 78, uptime: 99.82, cpu: 42, memory: 55, disk: 48, latency: 55, lastSeen: new Date() },
  ], []);

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = searchQuery === "" ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || node.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [nodes, searchQuery, typeFilter]);

  const nodeStats = useMemo(() => ({
    total: nodes.length,
    online: nodes.filter(n => n.status === "online").length,
    offline: nodes.filter(n => n.status === "offline").length,
    syncing: nodes.filter(n => n.status === "syncing").length,
    validators: nodes.filter(n => n.type === "validator").length,
    avgLatency: Math.round(nodes.filter(n => n.status === "online").reduce((acc, n) => acc + n.latency, 0) / nodes.filter(n => n.status === "online").length),
  }), [nodes]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "offline": return <XCircle className="h-4 w-4 text-red-500" />;
      case "syncing": return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online": return <Badge className="bg-green-500/10 text-green-500">Online</Badge>;
      case "offline": return <Badge className="bg-red-500/10 text-red-500">Offline</Badge>;
      case "syncing": return <Badge className="bg-yellow-500/10 text-yellow-500">Syncing</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "validator": return <Badge variant="outline" className="text-purple-500 border-purple-500/30">Validator</Badge>;
      case "full": return <Badge variant="outline" className="text-blue-500 border-blue-500/30">Full</Badge>;
      case "archive": return <Badge variant="outline" className="text-orange-500 border-orange-500/30">Archive</Badge>;
      case "light": return <Badge variant="outline" className="text-green-500 border-green-500/30">Light</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Server className="h-8 w-8" />
              Node Management
            </h1>
            <p className="text-muted-foreground">Monitor and manage network nodes</p>
          </div>
          <Button data-testid="button-add-node">
            <Server className="h-4 w-4 mr-2" />
            Add Node
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{nodeStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Nodes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{nodeStats.online}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{nodeStats.offline}</p>
              <p className="text-xs text-muted-foreground">Offline</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">{nodeStats.syncing}</p>
              <p className="text-xs text-muted-foreground">Syncing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-500">{nodeStats.validators}</p>
              <p className="text-xs text-muted-foreground">Validators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{nodeStats.avgLatency}ms</p>
              <p className="text-xs text-muted-foreground">Avg Latency</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Nodes</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                    data-testid="input-node-search"
                  />
                </div>
                <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="validator">Validators</TabsTrigger>
                    <TabsTrigger value="full">Full</TabsTrigger>
                    <TabsTrigger value="archive">Archive</TabsTrigger>
                    <TabsTrigger value="light">Light</TabsTrigger>
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
                    <th className="text-left py-3 px-4 font-medium">Node</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Region</th>
                    <th className="text-right py-3 px-4 font-medium">Block Height</th>
                    <th className="text-right py-3 px-4 font-medium">Peers</th>
                    <th className="text-center py-3 px-4 font-medium">Resources</th>
                    <th className="text-right py-3 px-4 font-medium">Latency</th>
                    <th className="text-right py-3 px-4 font-medium">Uptime</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNodes.map((node) => (
                    <tr key={node.id} className="border-b hover-elevate cursor-pointer">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(node.status)}
                          <div>
                            <p className="font-medium">{node.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{node.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getTypeBadge(node.type)}</td>
                      <td className="py-3 px-4">{getStatusBadge(node.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>{node.region}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{node.blockHeight.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{node.peers}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="flex items-center gap-1" title="CPU">
                            <Cpu className="h-3 w-3 text-muted-foreground" />
                            <Progress value={node.cpu} className="w-12 h-1" />
                          </div>
                          <div className="flex items-center gap-1" title="Memory">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            <Progress value={node.memory} className="w-12 h-1" />
                          </div>
                          <div className="flex items-center gap-1" title="Disk">
                            <HardDrive className="h-3 w-3 text-muted-foreground" />
                            <Progress value={node.disk} className="w-12 h-1" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{node.latency}ms</td>
                      <td className="py-3 px-4 text-right">
                        <Badge className={node.uptime >= 99.9 ? "bg-green-500/10 text-green-500" : node.uptime >= 99 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}>
                          {node.uptime}%
                        </Badge>
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
