import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Wrench, Clock, Calendar, AlertTriangle, 
  CheckCircle, Play, Pause, Settings
} from "lucide-react";

export default function AdminMaintenance() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const maintenanceWindows = [
    { id: 1, name: "Scheduled Update v4.1", start: "2024-12-10 02:00 UTC", end: "2024-12-10 04:00 UTC", status: "scheduled", type: "update" },
    { id: 2, name: "Database Optimization", start: "2024-12-15 00:00 UTC", end: "2024-12-15 02:00 UTC", status: "scheduled", type: "maintenance" },
    { id: 3, name: "Security Patch", start: "2024-12-08 03:00 UTC", end: "2024-12-08 03:30 UTC", status: "scheduled", type: "security" },
  ];

  const pastMaintenance = [
    { id: 1, name: "v4.0 Release", date: "2024-12-01", duration: "3h 45m", status: "completed", impact: "minimal" },
    { id: 2, name: "Network Upgrade", date: "2024-11-25", duration: "2h 15m", status: "completed", impact: "none" },
    { id: 3, name: "Bridge Maintenance", date: "2024-11-20", duration: "1h 30m", status: "completed", impact: "bridge only" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Maintenance Mode</h1>
            <p className="text-muted-foreground">Schedule and manage maintenance windows</p>
          </div>
          <Badge variant="outline" className={maintenanceMode ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"}>
            {maintenanceMode ? (
              <><Wrench className="w-3 h-3 mr-1" /> Maintenance Active</>
            ) : (
              <><CheckCircle className="w-3 h-3 mr-1" /> Normal Operation</>
            )}
          </Badge>
        </div>

        <Card className={maintenanceMode ? "border-yellow-500/30 bg-yellow-500/5" : ""}>
          <CardHeader>
            <CardTitle>Quick Maintenance Toggle</CardTitle>
            <CardDescription>Enable or disable maintenance mode immediately</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">
                  {maintenanceMode ? "System is in read-only mode" : "System is fully operational"}
                </p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            {maintenanceMode && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Maintenance Mode Active</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Users cannot perform write operations. Only read operations are allowed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="scheduled" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="create">Schedule New</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceWindows.map((window) => (
                      <TableRow key={window.id}>
                        <TableCell className="font-medium">{window.name}</TableCell>
                        <TableCell>{window.start}</TableCell>
                        <TableCell>{window.end}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{window.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {window.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">Edit</Button>
                            <Button size="sm" variant="ghost" className="text-red-500">Cancel</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Maintenance Window</CardTitle>
                <CardDescription>Plan a new maintenance period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Maintenance window name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input placeholder="update, maintenance, security" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the maintenance activities..." />
                </div>
                <div className="space-y-2">
                  <Label>Notification Message</Label>
                  <Textarea placeholder="Message to display to users..." />
                </div>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Past Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastMaintenance.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>{m.date}</TableCell>
                        <TableCell>{m.duration}</TableCell>
                        <TableCell>{m.impact}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {m.status}
                          </Badge>
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
