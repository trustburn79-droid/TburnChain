import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Search, Download, Filter, 
  RefreshCw, AlertTriangle, Info, XCircle
} from "lucide-react";

export default function AdminLogs() {
  const [logLevel, setLogLevel] = useState("all");

  const logEntries = [
    { timestamp: "2024-12-03 14:30:25.123", level: "error", source: "Consensus", message: "Block validation failed: invalid signature" },
    { timestamp: "2024-12-03 14:30:24.456", level: "warn", source: "Bridge", message: "High latency detected on Ethereum connection" },
    { timestamp: "2024-12-03 14:30:23.789", level: "info", source: "AI", message: "Strategic decision made: increase committee size" },
    { timestamp: "2024-12-03 14:30:22.012", level: "info", source: "Network", message: "New validator connected: 0x1234...5678" },
    { timestamp: "2024-12-03 14:30:21.345", level: "debug", source: "Storage", message: "Block #18750234 stored successfully" },
    { timestamp: "2024-12-03 14:30:20.678", level: "info", source: "Mempool", message: "Transaction pool size: 1,234 pending" },
    { timestamp: "2024-12-03 14:30:19.901", level: "warn", source: "Security", message: "Suspicious activity from IP 45.33.32.156" },
    { timestamp: "2024-12-03 14:30:18.234", level: "error", source: "Database", message: "Connection timeout - retrying..." },
  ];

  const logSources = ["All", "Consensus", "Bridge", "AI", "Network", "Storage", "Security", "Database", "Mempool"];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />ERROR</Badge>;
      case "warn": return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />WARN</Badge>;
      case "info": return <Badge className="bg-blue-500"><Info className="w-3 h-3 mr-1" />INFO</Badge>;
      case "debug": return <Badge variant="secondary">DEBUG</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Log Viewer</h1>
            <p className="text-muted-foreground">View and analyze system logs</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search logs..." className="pl-10" />
          </div>
          <Select defaultValue="all" onValueChange={setLogLevel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="All">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              {logSources.map((source) => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Tabs defaultValue="realtime" className="space-y-4">
          <TabsList>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Log Stream
                  </CardTitle>
                  <Badge variant="outline">Auto-refresh: 1s</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-muted/50 rounded-lg p-4 space-y-2 max-h-[500px] overflow-auto">
                  {logEntries.map((log, index) => (
                    <div key={index} className="flex items-start gap-4 py-1 border-b border-muted last:border-0">
                      <span className="text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                      {getLevelBadge(log.level)}
                      <span className="text-blue-500 whitespace-nowrap">[{log.source}]</span>
                      <span className={log.level === "error" ? "text-red-500" : ""}>{log.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>Error Logs</CardTitle>
                <CardDescription>Filtered to show only errors and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-muted/50 rounded-lg p-4 space-y-2">
                  {logEntries.filter(log => log.level === "error" || log.level === "warn").map((log, index) => (
                    <div key={index} className="flex items-start gap-4 py-1 border-b border-muted last:border-0">
                      <span className="text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                      {getLevelBadge(log.level)}
                      <span className="text-blue-500 whitespace-nowrap">[{log.source}]</span>
                      <span className={log.level === "error" ? "text-red-500" : "text-yellow-500"}>{log.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Logs</CardTitle>
                <CardDescription>Security-related events and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-muted/50 rounded-lg p-4 space-y-2">
                  {logEntries.filter(log => log.source === "Security").map((log, index) => (
                    <div key={index} className="flex items-start gap-4 py-1 border-b border-muted last:border-0">
                      <span className="text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                      {getLevelBadge(log.level)}
                      <span className="text-blue-500 whitespace-nowrap">[{log.source}]</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
