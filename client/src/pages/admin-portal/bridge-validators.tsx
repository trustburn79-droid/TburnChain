import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, Users, CheckCircle, AlertTriangle, Clock, 
  Activity, TrendingUp, Key, RefreshCw
} from "lucide-react";

export default function AdminBridgeValidators() {
  const validatorStats = {
    total: 56,
    active: 48,
    inactive: 5,
    slashed: 3,
    quorum: "8/8",
  };

  const validators = [
    { id: 1, name: "Bridge Validator 1", address: "0x1234...5678", stake: "500,000 TBURN", status: "active", uptime: 99.98, signatures: 12450, chains: ["ETH", "BSC", "MATIC"] },
    { id: 2, name: "Bridge Validator 2", address: "0x2345...6789", stake: "450,000 TBURN", status: "active", uptime: 99.95, signatures: 12380, chains: ["ETH", "AVAX", "ARB"] },
    { id: 3, name: "Bridge Validator 3", address: "0x3456...7890", stake: "420,000 TBURN", status: "active", uptime: 99.92, signatures: 12290, chains: ["BSC", "OP", "BASE"] },
    { id: 4, name: "Bridge Validator 4", address: "0x4567...8901", stake: "400,000 TBURN", status: "inactive", uptime: 85.50, signatures: 10500, chains: ["ETH", "MATIC"] },
    { id: 5, name: "Bridge Validator 5", address: "0x5678...9012", stake: "380,000 TBURN", status: "slashed", uptime: 70.20, signatures: 8900, chains: ["BSC"] },
  ];

  const signatureHistory = [
    { id: 1, transfer: "0xabc...123", validators: 8, required: 8, time: "2 min ago" },
    { id: 2, transfer: "0xdef...456", validators: 8, required: 8, time: "5 min ago" },
    { id: 3, transfer: "0xghi...789", validators: 6, required: 8, time: "8 min ago" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Bridge Validators</h1>
            <p className="text-muted-foreground">Manage bridge validator network and signatures</p>
          </div>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Add Validator
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <div className="text-3xl font-bold">{validatorStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{validatorStats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Inactive</span>
              </div>
              <div className="text-3xl font-bold text-yellow-500">{validatorStats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Slashed</span>
              </div>
              <div className="text-3xl font-bold text-red-500">{validatorStats.slashed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Quorum</span>
              </div>
              <div className="text-3xl font-bold">{validatorStats.quorum}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="validators" className="space-y-4">
          <TabsList>
            <TabsTrigger value="validators" data-testid="tab-validators">
              <Users className="w-4 h-4 mr-2" />
              Validators
            </TabsTrigger>
            <TabsTrigger value="signatures" data-testid="tab-signatures">
              <Key className="w-4 h-4 mr-2" />
              Signatures
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validators">
            <Card>
              <CardHeader>
                <CardTitle>Validator List</CardTitle>
                <CardDescription>All bridge validators and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Validator</TableHead>
                      <TableHead>Stake</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Signatures</TableHead>
                      <TableHead>Chains</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validators.map((validator) => (
                      <TableRow key={validator.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{validator.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{validator.address}</p>
                          </div>
                        </TableCell>
                        <TableCell>{validator.stake}</TableCell>
                        <TableCell>
                          <Badge variant={
                            validator.status === "active" ? "default" :
                            validator.status === "inactive" ? "secondary" : "destructive"
                          } className={validator.status === "active" ? "bg-green-500" : ""}>
                            {validator.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={validator.uptime} className="w-16" />
                            <span className={validator.uptime >= 99 ? "text-green-500" : validator.uptime >= 90 ? "text-yellow-500" : "text-red-500"}>
                              {validator.uptime}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{validator.signatures.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {validator.chains.map((chain, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{chain}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">Manage</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signatures">
            <Card>
              <CardHeader>
                <CardTitle>Recent Signatures</CardTitle>
                <CardDescription>Multi-sig signature activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer</TableHead>
                      <TableHead>Signatures</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signatureHistory.map((sig) => (
                      <TableRow key={sig.id}>
                        <TableCell className="font-mono">{sig.transfer}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(sig.validators / sig.required) * 100} className="w-20" />
                            <span>{sig.validators}/{sig.required}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sig.validators >= sig.required ? (
                            <Badge className="bg-green-500">Complete</Badge>
                          ) : (
                            <Badge variant="secondary">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Collecting
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{sig.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Validator Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Average Uptime</span>
                      <span className="font-medium text-green-500">99.87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Signature Time</span>
                      <span className="font-medium">1.2s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Daily Signatures</span>
                      <span className="font-medium">~2,800</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Network Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Quorum Status</span>
                      <Badge className="bg-green-500">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Consensus Speed</span>
                      <span className="font-medium">~2.5s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Failed Signatures (24h)</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
