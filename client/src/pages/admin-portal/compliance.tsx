import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileCheck, Shield, AlertTriangle, CheckCircle, Clock, 
  Download, FileText, Calendar, TrendingUp
} from "lucide-react";

export default function AdminCompliance() {
  const complianceScore = {
    overall: 94,
    security: 98,
    dataProtection: 92,
    operationalRisk: 95,
    regulatory: 91,
  };

  const frameworks = [
    { name: "SOC 2 Type II", status: "compliant", lastAudit: "2024-11-15", nextAudit: "2025-05-15", score: 98 },
    { name: "ISO 27001", status: "compliant", lastAudit: "2024-10-01", nextAudit: "2025-04-01", score: 96 },
    { name: "GDPR", status: "compliant", lastAudit: "2024-09-20", nextAudit: "2025-03-20", score: 94 },
    { name: "PCI DSS", status: "in_progress", lastAudit: "2024-08-01", nextAudit: "2025-02-01", score: 88 },
    { name: "CCPA", status: "compliant", lastAudit: "2024-11-01", nextAudit: "2025-05-01", score: 92 },
  ];

  const recentFindings = [
    { id: 1, category: "Security", finding: "Update TLS certificates before expiry", severity: "medium", status: "open", due: "2024-12-15" },
    { id: 2, category: "Data Protection", finding: "Review data retention policies", severity: "low", status: "in_progress", due: "2024-12-20" },
    { id: 3, category: "Access Control", finding: "Implement MFA for all admin accounts", severity: "high", status: "resolved", due: "2024-11-30" },
    { id: 4, category: "Operational", finding: "Document disaster recovery procedures", severity: "medium", status: "open", due: "2024-12-25" },
  ];

  const auditSchedule = [
    { audit: "Quarterly Security Review", date: "2024-12-15", auditor: "Internal", status: "scheduled" },
    { audit: "SOC 2 Annual Audit", date: "2025-01-10", auditor: "External (Deloitte)", status: "scheduled" },
    { audit: "Penetration Test", date: "2024-12-20", auditor: "External (CyberSec)", status: "scheduled" },
    { audit: "ISO 27001 Surveillance", date: "2025-02-15", auditor: "External (BSI)", status: "pending" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Compliance</h1>
            <p className="text-muted-foreground">Regulatory compliance and audit management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <FileCheck className="w-4 h-4 mr-2" />
              Run Assessment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Overall Score</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{complianceScore.overall}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Security</div>
              <div className="text-2xl font-bold">{complianceScore.security}%</div>
              <Progress value={complianceScore.security} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Data Protection</div>
              <div className="text-2xl font-bold">{complianceScore.dataProtection}%</div>
              <Progress value={complianceScore.dataProtection} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Operational Risk</div>
              <div className="text-2xl font-bold">{complianceScore.operationalRisk}%</div>
              <Progress value={complianceScore.operationalRisk} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Regulatory</div>
              <div className="text-2xl font-bold">{complianceScore.regulatory}%</div>
              <Progress value={complianceScore.regulatory} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="frameworks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="frameworks" data-testid="tab-frameworks">
              <FileCheck className="w-4 h-4 mr-2" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="findings" data-testid="tab-findings">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Findings
            </TabsTrigger>
            <TabsTrigger value="audits" data-testid="tab-audits">
              <Calendar className="w-4 h-4 mr-2" />
              Audit Schedule
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="frameworks">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Frameworks</CardTitle>
                <CardDescription>Status of compliance certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Framework</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Audit</TableHead>
                      <TableHead>Next Audit</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frameworks.map((fw, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{fw.name}</TableCell>
                        <TableCell>
                          {fw.status === "compliant" ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Compliant
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{fw.lastAudit}</TableCell>
                        <TableCell>{fw.nextAudit}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={fw.score} className="w-16" />
                            <span className={fw.score >= 95 ? "text-green-500" : fw.score >= 90 ? "text-yellow-500" : "text-red-500"}>
                              {fw.score}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Findings</CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Finding</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentFindings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell>{finding.category}</TableCell>
                        <TableCell>{finding.finding}</TableCell>
                        <TableCell>
                          <Badge variant={
                            finding.severity === "high" ? "destructive" :
                            finding.severity === "medium" ? "default" : "secondary"
                          }>
                            {finding.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {finding.status === "resolved" ? (
                            <Badge className="bg-green-500">Resolved</Badge>
                          ) : finding.status === "in_progress" ? (
                            <Badge variant="secondary">In Progress</Badge>
                          ) : (
                            <Badge variant="outline">Open</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{finding.due}</TableCell>
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

          <TabsContent value="audits">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Audits</CardTitle>
                <CardDescription>Scheduled audit activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Auditor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditSchedule.map((audit, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{audit.audit}</TableCell>
                        <TableCell>{audit.date}</TableCell>
                        <TableCell>{audit.auditor}</TableCell>
                        <TableCell>
                          <Badge variant={audit.status === "scheduled" ? "default" : "secondary"}>
                            {audit.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">Prepare</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>Generate and download reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    SOC 2 Report
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    GDPR Report
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    Security Assessment
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    Risk Assessment
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    Audit Trail
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    Custom Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
