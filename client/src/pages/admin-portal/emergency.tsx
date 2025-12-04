import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle, Shield, Power, Pause, Play, 
  RefreshCw, Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

export default function AdminEmergency() {
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);

  const systemStatus = {
    overall: "operational",
    mainnet: "running",
    bridge: "running",
    consensus: "running",
    ai: "running",
  };

  const emergencyControls = [
    { id: "pause_mainnet", name: "Pause Mainnet", description: "Halt all network operations", status: "ready", severity: "critical" },
    { id: "pause_bridge", name: "Pause Bridge", description: "Stop all cross-chain transfers", status: "ready", severity: "high" },
    { id: "pause_consensus", name: "Pause Consensus", description: "Halt block production", status: "ready", severity: "critical" },
    { id: "disable_ai", name: "Disable AI", description: "Turn off AI decision making", status: "ready", severity: "medium" },
    { id: "maintenance_mode", name: "Maintenance Mode", description: "Enable read-only mode", status: "ready", severity: "medium" },
  ];

  const recentActions = [
    { id: 1, action: "Bridge Pause", by: "Admin", reason: "Security investigation", timestamp: "2024-12-01 14:30", duration: "2h 15m", status: "resolved" },
    { id: 2, action: "AI Disable", by: "System", reason: "High error rate", timestamp: "2024-11-28 09:00", duration: "45m", status: "resolved" },
    { id: 3, action: "Maintenance Mode", by: "Admin", reason: "Planned upgrade", timestamp: "2024-11-25 22:00", duration: "4h", status: "resolved" },
  ];

  const circuitBreakers = [
    { name: "Transaction Rate", threshold: "100k TPS", current: "52k TPS", status: "normal" },
    { name: "Gas Price", threshold: "500 Ember", current: "125 Ember", status: "normal" },
    { name: "Bridge Volume", threshold: "$50M/day", current: "$12.5M", status: "normal" },
    { name: "Error Rate", threshold: "1%", current: "0.13%", status: "normal" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Emergency Controls</h1>
            <p className="text-muted-foreground">Critical system controls and circuit breakers</p>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2 animate-pulse" />
              <div className="text-sm font-medium">Mainnet</div>
              <div className="text-xs text-muted-foreground">Running</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2 animate-pulse" />
              <div className="text-sm font-medium">Bridge</div>
              <div className="text-xs text-muted-foreground">Running</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2 animate-pulse" />
              <div className="text-sm font-medium">Consensus</div>
              <div className="text-xs text-muted-foreground">Running</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2 animate-pulse" />
              <div className="text-sm font-medium">AI System</div>
              <div className="text-xs text-muted-foreground">Running</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2 animate-pulse" />
              <div className="text-sm font-medium">Database</div>
              <div className="text-xs text-muted-foreground">Running</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Emergency Actions
            </CardTitle>
            <CardDescription>Critical controls - Use with caution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {emergencyControls.map((control) => (
                <div key={control.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{control.name}</p>
                      <Badge variant={
                        control.severity === "critical" ? "destructive" :
                        control.severity === "high" ? "default" : "secondary"
                      }>
                        {control.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{control.description}</p>
                  </div>
                  <Dialog open={confirmDialog === control.id} onOpenChange={(open) => setConfirmDialog(open ? control.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Pause className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                          <AlertTriangle className="w-5 h-5" />
                          Confirm {control.name}
                        </DialogTitle>
                        <DialogDescription>
                          This is a critical action. Please confirm you want to {control.name.toLowerCase()}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm">{control.description}</p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
                        <Button variant="destructive">Confirm Action</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="breakers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="breakers">Circuit Breakers</TabsTrigger>
            <TabsTrigger value="history">Action History</TabsTrigger>
          </TabsList>

          <TabsContent value="breakers">
            <Card>
              <CardHeader>
                <CardTitle>Circuit Breakers</CardTitle>
                <CardDescription>Automatic protection mechanisms</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Breaker</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enabled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {circuitBreakers.map((breaker, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{breaker.name}</TableCell>
                        <TableCell>{breaker.threshold}</TableCell>
                        <TableCell>{breaker.current}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {breaker.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch defaultChecked />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Action History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium">{action.action}</TableCell>
                        <TableCell>{action.by}</TableCell>
                        <TableCell>{action.reason}</TableCell>
                        <TableCell className="text-muted-foreground">{action.timestamp}</TableCell>
                        <TableCell>{action.duration}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Resolved</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
