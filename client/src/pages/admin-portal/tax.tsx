import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Building2,
  Globe,
  Calculator,
  FileCheck,
  FilePlus,
  Printer,
} from "lucide-react";

interface TaxReport {
  id: string;
  type: string;
  period: string;
  jurisdiction: string;
  status: "filed" | "pending" | "draft" | "overdue";
  dueDate: string;
  amount: number;
  filedDate: string | null;
}

interface TaxLiability {
  jurisdiction: string;
  taxType: string;
  liability: number;
  paid: number;
  remaining: number;
  dueDate: string;
}

export default function TaxReporting() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [activeTab, setActiveTab] = useState("overview");

  const taxReports: TaxReport[] = [
    { id: "TAX-001", type: "Corporate Income Tax", period: "Q4 2024", jurisdiction: "United States", status: "pending", dueDate: "2025-01-15", amount: 4500000, filedDate: null },
    { id: "TAX-002", type: "Sales Tax", period: "November 2024", jurisdiction: "United States", status: "filed", dueDate: "2024-12-20", amount: 890000, filedDate: "2024-12-15" },
    { id: "TAX-003", type: "Corporate Tax", period: "Q3 2024", jurisdiction: "European Union", status: "filed", dueDate: "2024-10-31", amount: 2100000, filedDate: "2024-10-28" },
    { id: "TAX-004", type: "VAT", period: "Q4 2024", jurisdiction: "European Union", status: "draft", dueDate: "2025-01-31", amount: 1500000, filedDate: null },
    { id: "TAX-005", type: "Corporate Tax", period: "FY 2024", jurisdiction: "Singapore", status: "pending", dueDate: "2025-03-15", amount: 780000, filedDate: null },
    { id: "TAX-006", type: "Withholding Tax", period: "Q4 2024", jurisdiction: "South Korea", status: "overdue", dueDate: "2024-12-10", amount: 320000, filedDate: null },
  ];

  const taxLiabilities: TaxLiability[] = [
    { jurisdiction: "United States", taxType: "Corporate Income Tax", liability: 12500000, paid: 8000000, remaining: 4500000, dueDate: "2025-04-15" },
    { jurisdiction: "European Union", taxType: "Corporate Tax", liability: 6800000, paid: 4700000, remaining: 2100000, dueDate: "2025-01-31" },
    { jurisdiction: "Singapore", taxType: "Corporate Tax", liability: 780000, paid: 0, remaining: 780000, dueDate: "2025-03-15" },
    { jurisdiction: "South Korea", taxType: "Various", liability: 1200000, paid: 880000, remaining: 320000, dueDate: "2024-12-31" },
    { jurisdiction: "Japan", taxType: "Corporate Tax", liability: 950000, paid: 950000, remaining: 0, dueDate: "2024-11-30" },
  ];

  const taxCalendar = [
    { date: "2024-12-20", event: "US Sales Tax Filing Deadline", status: "completed" },
    { date: "2024-12-31", event: "South Korea Q4 Tax Payment", status: "upcoming" },
    { date: "2025-01-15", event: "US Q4 Estimated Tax Payment", status: "upcoming" },
    { date: "2025-01-31", event: "EU VAT Q4 Filing Deadline", status: "upcoming" },
    { date: "2025-03-15", event: "Singapore Annual Filing", status: "upcoming" },
    { date: "2025-04-15", event: "US Annual Tax Filing", status: "upcoming" },
  ];

  const totalLiability = taxLiabilities.reduce((sum, t) => sum + t.liability, 0);
  const totalPaid = taxLiabilities.reduce((sum, t) => sum + t.paid, 0);
  const totalRemaining = taxLiabilities.reduce((sum, t) => sum + t.remaining, 0);
  const pendingReports = taxReports.filter(r => r.status === "pending" || r.status === "draft").length;
  const overdueReports = taxReports.filter(r => r.status === "overdue").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "filed": return <Badge className="bg-green-500">Filed</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "draft": return <Badge variant="outline">Draft</Badge>;
      case "overdue": return <Badge className="bg-red-500">Overdue</Badge>;
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "upcoming": return <Badge variant="secondary">Upcoming</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Tax Reporting
            </h1>
            <p className="text-muted-foreground">Tax compliance and reporting management</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32" data-testid="select-year">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-new-report">
              <FilePlus className="h-4 w-4 mr-2" />
              New Report
            </Button>
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Liability</p>
                  <p className="text-2xl font-bold">${(totalLiability / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-500">${(totalPaid / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                  <p className="text-2xl font-bold">{pendingReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-500">{overdueReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Tax Reports</TabsTrigger>
            <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
            <TabsTrigger value="calendar">Tax Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Progress</span>
                    <span className="text-sm font-medium">{((totalPaid / totalLiability) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(totalPaid / totalLiability) * 100} />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-green-500">{taxReports.filter(r => r.status === "filed").length}</p>
                      <p className="text-sm text-muted-foreground">Filed</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-yellow-500">{pendingReports}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jurisdictions</CardTitle>
                  <CardDescription>Tax obligations by region</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from(new Set(taxLiabilities.map(t => t.jurisdiction))).map(jurisdiction => {
                    const liability = taxLiabilities.filter(t => t.jurisdiction === jurisdiction);
                    const total = liability.reduce((s, t) => s + t.liability, 0);
                    const paid = liability.reduce((s, t) => s + t.paid, 0);
                    return (
                      <div key={jurisdiction} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{jurisdiction}</span>
                          </div>
                          <span className="text-sm">${(total / 1000000).toFixed(2)}M</span>
                        </div>
                        <Progress value={(paid / total) * 100} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxCalendar.filter(e => e.status === "upcoming").slice(0, 5).map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{event.event}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Jurisdiction</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono">{report.id}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.period}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {report.jurisdiction}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${(report.amount / 1000000).toFixed(2)}M</TableCell>
                        <TableCell>{report.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon">
                              <FileCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
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

          <TabsContent value="liabilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Liabilities by Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jurisdiction</TableHead>
                      <TableHead>Tax Type</TableHead>
                      <TableHead className="text-right">Total Liability</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxLiabilities.map((liability, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {liability.jurisdiction}
                          </div>
                        </TableCell>
                        <TableCell>{liability.taxType}</TableCell>
                        <TableCell className="text-right">${(liability.liability / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className="text-right text-green-500">${(liability.paid / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className={`text-right ${liability.remaining > 0 ? "text-yellow-500" : "text-green-500"}`}>
                          ${(liability.remaining / 1000000).toFixed(2)}M
                        </TableCell>
                        <TableCell>{liability.dueDate}</TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress value={(liability.paid / liability.liability) * 100} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>TOTAL</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">${(totalLiability / 1000000).toFixed(2)}M</TableCell>
                      <TableCell className="text-right text-green-500">${(totalPaid / 1000000).toFixed(2)}M</TableCell>
                      <TableCell className="text-right text-yellow-500">${(totalRemaining / 1000000).toFixed(2)}M</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Calendar</CardTitle>
                <CardDescription>Important dates and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxCalendar.map((event, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                      {getStatusBadge(event.status)}
                      {event.status === "upcoming" && (
                        <Button variant="outline" size="sm">
                          Set Reminder
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
