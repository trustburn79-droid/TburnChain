import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  PieChart,
  Target,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface BudgetItem {
  id: string;
  category: string;
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: "on-track" | "at-risk" | "over-budget";
  forecast: number;
}

interface BudgetRequest {
  id: string;
  title: string;
  department: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  requester: string;
}

export default function BudgetManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("q4-2024");
  const [activeTab, setActiveTab] = useState("overview");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const budgetItems: BudgetItem[] = [
    { id: "BUD-001", category: "Infrastructure", department: "Engineering", allocated: 5000000, spent: 3200000, remaining: 1800000, status: "on-track", forecast: 4500000 },
    { id: "BUD-002", category: "Development", department: "Engineering", allocated: 8000000, spent: 6500000, remaining: 1500000, status: "at-risk", forecast: 8200000 },
    { id: "BUD-003", category: "Marketing", department: "Marketing", allocated: 3000000, spent: 1800000, remaining: 1200000, status: "on-track", forecast: 2700000 },
    { id: "BUD-004", category: "Security", department: "Security", allocated: 4000000, spent: 2100000, remaining: 1900000, status: "on-track", forecast: 3500000 },
    { id: "BUD-005", category: "Operations", department: "Operations", allocated: 2500000, spent: 2800000, remaining: -300000, status: "over-budget", forecast: 3200000 },
    { id: "BUD-006", category: "Research", department: "R&D", allocated: 3500000, spent: 1900000, remaining: 1600000, status: "on-track", forecast: 3200000 },
    { id: "BUD-007", category: "Legal & Compliance", department: "Legal", allocated: 1500000, spent: 1100000, remaining: 400000, status: "at-risk", forecast: 1600000 },
    { id: "BUD-008", category: "Human Resources", department: "HR", allocated: 1000000, spent: 650000, remaining: 350000, status: "on-track", forecast: 900000 },
  ];

  const budgetRequests: BudgetRequest[] = [
    { id: "REQ-001", title: "Additional Cloud Infrastructure", department: "Engineering", amount: 500000, status: "pending", requestDate: "2024-12-02", requester: "John Smith" },
    { id: "REQ-002", title: "Security Audit Tools", department: "Security", amount: 150000, status: "approved", requestDate: "2024-11-28", requester: "Jane Doe" },
    { id: "REQ-003", title: "Marketing Campaign Q1", department: "Marketing", amount: 300000, status: "pending", requestDate: "2024-12-01", requester: "Mike Johnson" },
    { id: "REQ-004", title: "AI Model Training Resources", department: "R&D", amount: 400000, status: "rejected", requestDate: "2024-11-25", requester: "Sarah Williams" },
  ];

  const monthlyBudgetData = [
    { month: "Oct", budget: 28500000, actual: 26000000 },
    { month: "Nov", budget: 28500000, actual: 27500000 },
    { month: "Dec", budget: 28500000, actual: 20050000 },
  ];

  const departmentAllocation = [
    { name: "Engineering", value: 46, color: "hsl(var(--chart-1))" },
    { name: "Security", value: 14, color: "hsl(var(--chart-2))" },
    { name: "Marketing", value: 11, color: "hsl(var(--chart-3))" },
    { name: "R&D", value: 12, color: "hsl(var(--chart-4))" },
    { name: "Operations", value: 9, color: "hsl(var(--chart-5))" },
    { name: "Other", value: 8, color: "hsl(var(--muted))" },
  ];

  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const utilizationRate = ((totalSpent / totalAllocated) * 100).toFixed(1);
  const overBudgetCount = budgetItems.filter(item => item.status === "over-budget").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track": return <Badge className="bg-green-500">On Track</Badge>;
      case "at-risk": return <Badge className="bg-yellow-500">At Risk</Badge>;
      case "over-budget": return <Badge className="bg-red-500">Over Budget</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "approved": return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected": return <Badge className="bg-red-500">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Briefcase className="h-8 w-8" />
              Budget Management
            </h1>
            <p className="text-muted-foreground">Plan, track, and optimize organizational budgets</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36" data-testid="select-period">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q4-2024">Q4 2024</SelectItem>
                <SelectItem value="q3-2024">Q3 2024</SelectItem>
                <SelectItem value="q2-2024">Q2 2024</SelectItem>
                <SelectItem value="2024">FY 2024</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-request">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Budget Request</DialogTitle>
                  <DialogDescription>Submit a new budget allocation request</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Request title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="rd">R&D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Justification</Label>
                    <Input placeholder="Reason for request" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsRequestDialogOpen(false)}>Submit Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">${(totalAllocated / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="text-2xl font-bold">${(totalSpent / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilization</p>
                  <p className="text-2xl font-bold">{utilizationRate}%</p>
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
                  <p className="text-sm text-muted-foreground">Over Budget</p>
                  <p className="text-2xl font-bold">{overBudgetCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                  <CardDescription>Monthly comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyBudgetData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]}
                        />
                        <Legend />
                        <Bar dataKey="budget" fill="hsl(var(--chart-1))" name="Budget" />
                        <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={departmentAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {departmentAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {departmentAllocation.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell className="text-right">${(item.allocated / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className="text-right">${(item.spent / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className={`text-right ${item.remaining < 0 ? "text-red-500" : "text-green-500"}`}>
                          ${(item.remaining / 1000000).toFixed(2)}M
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress 
                              value={Math.min((item.spent / item.allocated) * 100, 100)} 
                              className={item.status === "over-budget" ? "bg-red-200" : ""}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Requests</CardTitle>
                <CardDescription>Pending and processed budget requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono">{request.id}</TableCell>
                        <TableCell>{request.title}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>{request.requester}</TableCell>
                        <TableCell className="text-right">${(request.amount / 1000).toFixed(0)}K</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === "pending" && (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="text-green-500">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Forecast</CardTitle>
                <CardDescription>Projected spending vs allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetItems.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          {item.forecast > item.allocated ? (
                            <ArrowUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-green-500" />
                          )}
                          <span className={item.forecast > item.allocated ? "text-red-500" : "text-green-500"}>
                            ${(item.forecast / 1000000).toFixed(2)}M forecast
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Allocated: ${(item.allocated / 1000000).toFixed(2)}M</span>
                        <span>Spent: ${(item.spent / 1000000).toFixed(2)}M</span>
                        <span>Variance: {((item.forecast / item.allocated - 1) * 100).toFixed(1)}%</span>
                      </div>
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
