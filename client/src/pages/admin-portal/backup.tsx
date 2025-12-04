import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  HardDrive, Download, Upload, Clock, 
  CheckCircle, AlertTriangle, Play, Trash2
} from "lucide-react";

export default function AdminBackup() {
  const backupStats = {
    lastBackup: "2024-12-03 00:00 UTC",
    totalBackups: 45,
    storageUsed: "1.2 TB",
    nextScheduled: "2024-12-04 00:00 UTC",
  };

  const recentBackups = [
    { id: 1, name: "Full Backup", type: "full", size: "245 GB", created: "2024-12-03 00:00", status: "completed", retention: "30 days" },
    { id: 2, name: "Incremental", type: "incremental", size: "12 GB", created: "2024-12-02 12:00", status: "completed", retention: "7 days" },
    { id: 3, name: "Incremental", type: "incremental", size: "8 GB", created: "2024-12-02 00:00", status: "completed", retention: "7 days" },
    { id: 4, name: "Full Backup", type: "full", size: "240 GB", created: "2024-12-01 00:00", status: "completed", retention: "30 days" },
    { id: 5, name: "Incremental", type: "incremental", size: "15 GB", created: "2024-11-30 12:00", status: "completed", retention: "7 days" },
  ];

  const backupJobs = [
    { name: "Daily Full Backup", schedule: "Daily at 00:00 UTC", lastRun: "Success", nextRun: "2024-12-04 00:00", enabled: true },
    { name: "Hourly Incremental", schedule: "Every 12 hours", lastRun: "Success", nextRun: "2024-12-03 12:00", enabled: true },
    { name: "Weekly Archive", schedule: "Sunday 02:00 UTC", lastRun: "Success", nextRun: "2024-12-08 02:00", enabled: true },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Backup & Recovery</h1>
            <p className="text-muted-foreground">Manage system backups and disaster recovery</p>
          </div>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Run Backup Now
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Last Backup</span>
              </div>
              <div className="text-lg font-bold">{backupStats.lastBackup}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Total Backups</span>
              </div>
              <div className="text-3xl font-bold">{backupStats.totalBackups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Storage Used</span>
              </div>
              <div className="text-3xl font-bold">{backupStats.storageUsed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Next Scheduled</span>
              </div>
              <div className="text-lg font-bold">{backupStats.nextScheduled}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="backups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="restore">Restore</TabsTrigger>
          </TabsList>

          <TabsContent value="backups">
            <Card>
              <CardHeader>
                <CardTitle>Recent Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Retention</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBackups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{backup.type}</Badge>
                        </TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell className="text-muted-foreground">{backup.created}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {backup.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{backup.retention}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Upload className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Backup Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupJobs.map((job, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{job.name}</TableCell>
                        <TableCell>{job.schedule}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">{job.lastRun}</Badge>
                        </TableCell>
                        <TableCell>{job.nextRun}</TableCell>
                        <TableCell>
                          <Badge variant={job.enabled ? "default" : "secondary"}>
                            {job.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restore">
            <Card>
              <CardHeader>
                <CardTitle>Restore from Backup</CardTitle>
                <CardDescription>Select a backup point to restore</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Restoring from a backup will overwrite current data. This action cannot be undone.
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Backup</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBackups.slice(0, 3).map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.name}</TableCell>
                        <TableCell>{backup.created}</TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm">Restore</Button>
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
