import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Key,
  Users,
  Lock,
  Unlock,
  Search,
  Plus,
  RefreshCw,
  Save,
  Eye,
  Edit,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Database,
  Globe,
  Activity,
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: "read" | "write" | "admin" | "super";
}

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

export default function Permissions() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const permissionGroups: PermissionGroup[] = [
    {
      name: "Dashboard & Monitoring",
      permissions: [
        { id: "dash_view", name: "View Dashboard", description: "Access to main dashboard", category: "dashboard", level: "read" },
        { id: "dash_customize", name: "Customize Dashboard", description: "Modify dashboard widgets", category: "dashboard", level: "write" },
        { id: "metrics_view", name: "View Metrics", description: "Access performance metrics", category: "dashboard", level: "read" },
        { id: "alerts_manage", name: "Manage Alerts", description: "Create and manage alerts", category: "dashboard", level: "write" },
      ],
    },
    {
      name: "Network Operations",
      permissions: [
        { id: "nodes_view", name: "View Nodes", description: "View node information", category: "network", level: "read" },
        { id: "nodes_manage", name: "Manage Nodes", description: "Add, remove, restart nodes", category: "network", level: "admin" },
        { id: "validators_view", name: "View Validators", description: "View validator status", category: "network", level: "read" },
        { id: "validators_manage", name: "Manage Validators", description: "Configure validators", category: "network", level: "admin" },
        { id: "consensus_view", name: "View Consensus", description: "View consensus status", category: "network", level: "read" },
        { id: "shards_manage", name: "Manage Shards", description: "Configure sharding", category: "network", level: "super" },
      ],
    },
    {
      name: "Token & Economy",
      permissions: [
        { id: "tokens_view", name: "View Tokens", description: "View token information", category: "token", level: "read" },
        { id: "tokens_create", name: "Create Tokens", description: "Create new tokens", category: "token", level: "admin" },
        { id: "burn_view", name: "View Burn Stats", description: "View burn statistics", category: "token", level: "read" },
        { id: "burn_manage", name: "Manage Burns", description: "Execute and schedule burns", category: "token", level: "super" },
        { id: "treasury_view", name: "View Treasury", description: "View treasury balance", category: "token", level: "read" },
        { id: "treasury_manage", name: "Manage Treasury", description: "Manage treasury funds", category: "token", level: "super" },
      ],
    },
    {
      name: "Security & Audit",
      permissions: [
        { id: "security_view", name: "View Security", description: "View security status", category: "security", level: "read" },
        { id: "security_manage", name: "Manage Security", description: "Configure security settings", category: "security", level: "admin" },
        { id: "audit_view", name: "View Audit Logs", description: "Access audit logs", category: "security", level: "read" },
        { id: "access_manage", name: "Manage Access", description: "Manage access control", category: "security", level: "super" },
      ],
    },
    {
      name: "User Management",
      permissions: [
        { id: "users_view", name: "View Users", description: "View user list", category: "users", level: "read" },
        { id: "users_create", name: "Create Users", description: "Create new users", category: "users", level: "admin" },
        { id: "users_edit", name: "Edit Users", description: "Modify user settings", category: "users", level: "admin" },
        { id: "users_delete", name: "Delete Users", description: "Remove users", category: "users", level: "super" },
        { id: "roles_manage", name: "Manage Roles", description: "Configure roles", category: "users", level: "super" },
        { id: "permissions_manage", name: "Manage Permissions", description: "Configure permissions", category: "users", level: "super" },
      ],
    },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "read":
        return "bg-blue-500/10 text-blue-500";
      case "write":
        return "bg-green-500/10 text-green-500";
      case "admin":
        return "bg-yellow-500/10 text-yellow-500";
      case "super":
        return "bg-red-500/10 text-red-500";
      default:
        return "";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "dashboard":
        return <Activity className="h-4 w-4" />;
      case "network":
        return <Globe className="h-4 w-4" />;
      case "token":
        return <Database className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "users":
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const allPermissions = permissionGroups.flatMap(g => g.permissions);
  const filteredPermissions = searchQuery
    ? allPermissions.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-8 w-8" />
              Permission Management
            </h1>
            <p className="text-muted-foreground">권한 관리 | Configure system permissions and access levels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save">
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allPermissions.length}</div>
              <p className="text-xs text-muted-foreground">Across {permissionGroups.length} categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read Permissions</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {allPermissions.filter(p => p.level === "read").length}
              </div>
              <p className="text-xs text-muted-foreground">View-only access</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Permissions</CardTitle>
              <Shield className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {allPermissions.filter(p => p.level === "admin").length}
              </div>
              <p className="text-xs text-muted-foreground">Administrative access</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Permissions</CardTitle>
              <Lock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {allPermissions.filter(p => p.level === "super").length}
              </div>
              <p className="text-xs text-muted-foreground">Critical operations</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchQuery && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Found {filteredPermissions.length} permissions
                </p>
                {filteredPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(permission.category)}
                      <div>
                        <p className="font-medium">{permission.name}</p>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                    <Badge className={getLevelColor(permission.level)}>{permission.level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Groups */}
        <div className="space-y-6">
          {permissionGroups.map((group) => (
            <Card key={group.name}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>{group.permissions.length} permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Permission</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Checkbox defaultChecked />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(permission.category)}
                            {permission.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {permission.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(permission.level)}>
                            {permission.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permission Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>Overview of permission levels by category</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Read</TableHead>
                  <TableHead className="text-center">Write</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Super</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionGroups.map((group) => (
                  <TableRow key={group.name}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-center">
                      {group.permissions.filter(p => p.level === "read").length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.permissions.filter(p => p.level === "write").length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.permissions.filter(p => p.level === "admin").length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.permissions.filter(p => p.level === "super").length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
