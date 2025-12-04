import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Download, CheckCircle, Clock, AlertTriangle, 
  Play, Pause, RefreshCw, History
} from "lucide-react";

export default function AdminUpdates() {
  const currentVersion = {
    version: "4.0.0",
    released: "2024-12-01",
    status: "up-to-date",
  };

  const availableUpdates = [
    { version: "4.0.1", type: "patch", releaseDate: "2024-12-05", status: "available", changes: "Bug fixes and security patches" },
    { version: "4.1.0", type: "minor", releaseDate: "2024-12-15", status: "scheduled", changes: "New features and improvements" },
  ];

  const updateHistory = [
    { version: "4.0.0", date: "2024-12-01", status: "success", duration: "45m", rollback: false },
    { version: "3.9.5", date: "2024-11-15", status: "success", duration: "30m", rollback: false },
    { version: "3.9.4", date: "2024-11-01", status: "success", duration: "25m", rollback: false },
    { version: "3.9.3", date: "2024-10-20", status: "rolled_back", duration: "20m", rollback: true },
    { version: "3.9.2", date: "2024-10-15", status: "success", duration: "35m", rollback: false },
  ];

  const nodes = [
    { name: "Node 1", version: "4.0.0", status: "up-to-date" },
    { name: "Node 2", version: "4.0.0", status: "up-to-date" },
    { name: "Node 3", version: "3.9.5", status: "pending" },
    { name: "Node 4", version: "4.0.0", status: "up-to-date" },
    { name: "Node 5", version: "4.0.0", status: "up-to-date" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">System Updates</h1>
            <p className="text-muted-foreground">Manage software updates and deployments</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Check for Updates
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Current Version</div>
                <div className="text-3xl font-bold">v{currentVersion.version}</div>
                <div className="text-sm text-muted-foreground">Released: {currentVersion.released}</div>
              </div>
              <Badge className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Up to Date
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Available Updates</TabsTrigger>
            <TabsTrigger value="nodes">Node Status</TabsTrigger>
            <TabsTrigger value="history">Update History</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle>Available Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableUpdates.map((update, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">v{update.version}</span>
                          <Badge variant="outline">{update.type}</Badge>
                          <Badge variant={update.status === "available" ? "default" : "secondary"}>
                            {update.status}
                          </Badge>
                        </div>
                        {update.status === "available" && (
                          <Button>
                            <Download className="w-4 h-4 mr-2" />
                            Install Update
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{update.changes}</p>
                      <p className="text-xs text-muted-foreground">Release Date: {update.releaseDate}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nodes">
            <Card>
              <CardHeader>
                <CardTitle>Node Update Status</CardTitle>
                <CardDescription>Version status across all nodes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Node</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nodes.map((node, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{node.name}</TableCell>
                        <TableCell>v{node.version}</TableCell>
                        <TableCell>
                          <Badge variant={node.status === "up-to-date" ? "default" : "secondary"} 
                            className={node.status === "up-to-date" ? "bg-green-500" : ""}>
                            {node.status === "up-to-date" ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Up to date</>
                            ) : (
                              <><Clock className="w-3 h-3 mr-1" /> Pending</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {node.status === "pending" && (
                            <Button size="sm">Update Now</Button>
                          )}
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
                <CardTitle>Update History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rollback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updateHistory.map((update, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">v{update.version}</TableCell>
                        <TableCell>{update.date}</TableCell>
                        <TableCell>{update.duration}</TableCell>
                        <TableCell>
                          <Badge variant={update.status === "success" ? "default" : "destructive"}
                            className={update.status === "success" ? "bg-green-500" : ""}>
                            {update.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {update.rollback ? (
                            <Badge variant="outline" className="text-yellow-500">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
