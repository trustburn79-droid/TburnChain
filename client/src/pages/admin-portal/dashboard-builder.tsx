import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Plus,
  Save,
  Settings,
  Trash2,
  Copy,
  Edit,
  Eye,
  Grid3x3,
  ChartLine,
  ChartBar,
  ChartPie,
  Activity,
  Gauge,
  Table2,
  AlertTriangle,
  Clock,
  Users,
  Move,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Lock,
  Globe,
} from "lucide-react";

interface Widget {
  id: string;
  type: "chart" | "gauge" | "table" | "alert" | "metric" | "map";
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  config: Record<string, unknown>;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isPublic: boolean;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
  owner: string;
}

export default function DashboardBuilder() {
  const [selectedDashboard, setSelectedDashboard] = useState<string>("main");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const dashboards: Dashboard[] = [
    {
      id: "main",
      name: "Main Overview",
      description: "Primary system monitoring dashboard",
      isDefault: true,
      isPublic: true,
      widgets: [],
      createdAt: "2024-11-01",
      updatedAt: "2024-12-03",
      owner: "admin",
    },
    {
      id: "performance",
      name: "Performance Metrics",
      description: "Detailed performance monitoring",
      isDefault: false,
      isPublic: true,
      widgets: [],
      createdAt: "2024-11-15",
      updatedAt: "2024-12-02",
      owner: "admin",
    },
    {
      id: "security",
      name: "Security Dashboard",
      description: "Security events and monitoring",
      isDefault: false,
      isPublic: false,
      widgets: [],
      createdAt: "2024-11-20",
      updatedAt: "2024-12-01",
      owner: "security-team",
    },
    {
      id: "bridge",
      name: "Bridge Operations",
      description: "Cross-chain bridge monitoring",
      isDefault: false,
      isPublic: true,
      widgets: [],
      createdAt: "2024-11-25",
      updatedAt: "2024-12-03",
      owner: "admin",
    },
  ];

  const widgetTypes = [
    { type: "chart", icon: ChartLine, label: "Line Chart", description: "Time series visualization" },
    { type: "bar", icon: ChartBar, label: "Bar Chart", description: "Comparative data" },
    { type: "pie", icon: ChartPie, label: "Pie Chart", description: "Distribution view" },
    { type: "gauge", icon: Gauge, label: "Gauge", description: "Single value metric" },
    { type: "table", icon: Table2, label: "Data Table", description: "Tabular data display" },
    { type: "alert", icon: AlertTriangle, label: "Alert List", description: "Active alerts" },
    { type: "metric", icon: Activity, label: "Metric Card", description: "KPI display" },
    { type: "map", icon: Globe, label: "World Map", description: "Geographic distribution" },
  ];

  const previewWidgets = [
    { id: "1", type: "metric", title: "Current TPS", x: 0, y: 0, width: 3, height: 1 },
    { id: "2", type: "metric", title: "Block Height", x: 3, y: 0, width: 3, height: 1 },
    { id: "3", type: "metric", title: "Active Validators", x: 6, y: 0, width: 3, height: 1 },
    { id: "4", type: "metric", title: "Network Peers", x: 9, y: 0, width: 3, height: 1 },
    { id: "5", type: "chart", title: "TPS Over Time", x: 0, y: 1, width: 6, height: 2 },
    { id: "6", type: "chart", title: "Latency Distribution", x: 6, y: 1, width: 6, height: 2 },
    { id: "7", type: "table", title: "Recent Blocks", x: 0, y: 3, width: 6, height: 2 },
    { id: "8", type: "alert", title: "Active Alerts", x: 6, y: 3, width: 6, height: 2 },
  ];

  const currentDashboard = dashboards.find(d => d.id === selectedDashboard);

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8" />
              Dashboard Builder
            </h1>
            <p className="text-muted-foreground">Create and customize monitoring dashboards</p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsEditing(false)} data-testid="button-save-dashboard">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                  <SelectTrigger className="w-48" data-testid="select-dashboard">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboards.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex items-center gap-2">
                          {d.name}
                          {d.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setIsEditing(true)} data-testid="button-edit-dashboard">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-new-dashboard">
                      <Plus className="h-4 w-4 mr-2" />
                      New Dashboard
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Dashboard</DialogTitle>
                      <DialogDescription>Configure your new dashboard</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-name">Dashboard Name</Label>
                        <Input id="dashboard-name" placeholder="Enter dashboard name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-description">Description</Label>
                        <Input id="dashboard-description" placeholder="Brief description" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <Label>Public Dashboard</Label>
                        </div>
                        <Button variant="outline" size="sm">Yes</Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => setIsCreateDialogOpen(false)}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {currentDashboard && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentDashboard.name}
                    {currentDashboard.isDefault && <Badge variant="secondary">Default</Badge>}
                    {currentDashboard.isPublic ? (
                      <Badge variant="outline" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{currentDashboard.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Updated {new Date(currentDashboard.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {isEditing && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Widget Library</CardTitle>
                <CardDescription>Drag widgets to add</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {widgetTypes.map((widget) => (
                      <div
                        key={widget.type}
                        className="p-3 border rounded-lg cursor-move hover-elevate"
                        draggable
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <widget.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{widget.label}</p>
                            <p className="text-xs text-muted-foreground">{widget.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Card className={isEditing ? "lg:col-span-3" : "lg:col-span-4"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dashboard Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-4 min-h-[600px] p-4 border-2 border-dashed rounded-lg">
                {previewWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`col-span-${widget.width} row-span-${widget.height} p-4 bg-muted rounded-lg border relative group`}
                    style={{
                      gridColumn: `span ${widget.width}`,
                    }}
                  >
                    {isEditing && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Move className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-col h-full">
                      <span className="text-sm font-medium mb-2">{widget.title}</span>
                      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                        {widget.type === "metric" && (
                          <span className="text-2xl font-bold text-foreground">
                            {widget.title === "Current TPS" ? "485,000" :
                             widget.title === "Block Height" ? "12,847,563" :
                             widget.title === "Active Validators" ? "156" : "324"}
                          </span>
                        )}
                        {widget.type === "chart" && (
                          <div className="w-full h-full min-h-[100px] bg-muted-foreground/10 rounded flex items-center justify-center">
                            <ChartLine className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {widget.type === "table" && (
                          <div className="w-full h-full min-h-[100px] bg-muted-foreground/10 rounded flex items-center justify-center">
                            <Table2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {widget.type === "alert" && (
                          <div className="w-full h-full min-h-[100px] bg-muted-foreground/10 rounded flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Dashboards</CardTitle>
            <CardDescription>Manage your monitoring dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDashboard === dashboard.id ? "border-primary bg-primary/5" : "hover-elevate"
                  }`}
                  onClick={() => setSelectedDashboard(dashboard.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">{dashboard.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {dashboard.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                      {dashboard.isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{dashboard.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Owner: {dashboard.owner}</span>
                    <span>{new Date(dashboard.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Copy className="h-3 w-3 mr-1" />
                      Clone
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Dashboard</CardTitle>
              <CardDescription>Import from JSON configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drop JSON file here or click to browse
                </p>
                <Button variant="outline" data-testid="button-import-dashboard">
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Dashboard</CardTitle>
              <CardDescription>Export current dashboard configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export the current dashboard configuration as JSON for backup or sharing.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" data-testid="button-export-json">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button variant="outline" className="flex-1" data-testid="button-export-png">
                  <Download className="h-4 w-4 mr-2" />
                  Export PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
