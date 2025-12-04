import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Download, Calendar, Clock, 
  Play, Pause, Trash2, Settings, Plus
} from "lucide-react";

export default function AdminReportGenerator() {
  const reportTemplates = [
    { id: 1, name: "Network Performance", type: "system", frequency: "Daily", format: "PDF" },
    { id: 2, name: "Transaction Summary", type: "analytics", frequency: "Weekly", format: "Excel" },
    { id: 3, name: "User Activity", type: "analytics", frequency: "Monthly", format: "PDF" },
    { id: 4, name: "Security Audit", type: "security", frequency: "Weekly", format: "PDF" },
    { id: 5, name: "Financial Statement", type: "finance", frequency: "Monthly", format: "Excel" },
  ];

  const scheduledReports = [
    { id: 1, name: "Daily Network Report", nextRun: "2024-12-04 00:00", recipients: 3, status: "active" },
    { id: 2, name: "Weekly Transaction Summary", nextRun: "2024-12-08 06:00", recipients: 5, status: "active" },
    { id: 3, name: "Monthly User Report", nextRun: "2025-01-01 00:00", recipients: 8, status: "paused" },
  ];

  const recentReports = [
    { id: 1, name: "Network Performance - Dec 2", generated: "2024-12-03 00:15", size: "2.4 MB", format: "PDF" },
    { id: 2, name: "Transaction Summary - Week 48", generated: "2024-12-01 06:00", size: "5.2 MB", format: "Excel" },
    { id: 3, name: "Security Audit - Nov", generated: "2024-11-30 00:00", size: "1.8 MB", format: "PDF" },
  ];

  const reportSections = [
    { id: "network", label: "Network Statistics", checked: true },
    { id: "transactions", label: "Transaction Analytics", checked: true },
    { id: "users", label: "User Metrics", checked: false },
    { id: "validators", label: "Validator Performance", checked: true },
    { id: "bridge", label: "Bridge Activity", checked: false },
    { id: "security", label: "Security Events", checked: true },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Report Generator</h1>
            <p className="text-muted-foreground">Create and schedule custom reports</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">
              <FileText className="w-4 h-4 mr-2" />
              Create Report
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <Settings className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="scheduled" data-testid="tab-scheduled">
              <Calendar className="w-4 h-4 mr-2" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <Clock className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Report Configuration</CardTitle>
                  <CardDescription>Configure your custom report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Report Name</Label>
                    <Input placeholder="My Custom Report" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Select defaultValue="7d">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">Last 24 hours</SelectItem>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select defaultValue="pdf">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Sections</CardTitle>
                  <CardDescription>Select what to include</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reportSections.map((section) => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox id={section.id} defaultChecked={section.checked} />
                      <label htmlFor={section.id} className="text-sm font-medium">
                        {section.label}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Pre-configured report templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Default Frequency</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.type}</Badge>
                        </TableCell>
                        <TableCell>{template.frequency}</TableCell>
                        <TableCell>{template.format}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">Use</Button>
                            <Button size="sm" variant="ghost">
                              <Settings className="w-4 h-4" />
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

          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automated report generation</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.nextRun}</TableCell>
                        <TableCell>{report.recipients} recipients</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "active" ? "default" : "secondary"}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost">
                              {report.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-500">
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

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell className="text-muted-foreground">{report.generated}</TableCell>
                        <TableCell>{report.size}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.format}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
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
