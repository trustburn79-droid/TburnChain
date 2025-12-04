import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ShieldCheck,
  ShieldPlus,
  Users,
  Settings,
  Database,
  Activity,
  Globe,
  Lock,
  Edit,
  Trash2,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: Date;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function AdminRoles() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const roles: Role[] = useMemo(() => [
    { id: "1", name: "Super Admin", description: "Full system access with all permissions", permissions: ["all"], userCount: 1, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "2", name: "Admin", description: "Administrative access without critical operations", permissions: ["read", "write", "manage_users", "view_logs"], userCount: 2, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "3", name: "Operator", description: "Network operations and validator management", permissions: ["read", "write", "manage_validators", "manage_nodes", "pause_services"], userCount: 3, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "4", name: "Security", description: "Security monitoring and incident response", permissions: ["read", "security_management", "view_logs", "manage_access"], userCount: 2, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "5", name: "Developer", description: "Contract deployment and development tools", permissions: ["read", "deploy_contracts", "use_testnet", "view_logs"], userCount: 4, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "6", name: "Viewer", description: "Read-only access to dashboards and reports", permissions: ["read"], userCount: 5, isSystem: true, createdAt: new Date("2024-01-01") },
  ], []);

  const permissions: Permission[] = useMemo(() => [
    { id: "read", name: "Read Access", description: "View dashboards, reports, and data", category: "General" },
    { id: "write", name: "Write Access", description: "Modify configurations and settings", category: "General" },
    { id: "manage_users", name: "Manage Users", description: "Create, edit, and delete user accounts", category: "User Management" },
    { id: "manage_roles", name: "Manage Roles", description: "Create and modify roles and permissions", category: "User Management" },
    { id: "manage_validators", name: "Manage Validators", description: "Add, remove, and configure validators", category: "Network" },
    { id: "manage_nodes", name: "Manage Nodes", description: "Configure and manage network nodes", category: "Network" },
    { id: "pause_services", name: "Pause Services", description: "Pause network services and bridges", category: "Operations" },
    { id: "emergency_controls", name: "Emergency Controls", description: "Access emergency shutdown and recovery", category: "Operations" },
    { id: "security_management", name: "Security Management", description: "Manage security settings and incidents", category: "Security" },
    { id: "manage_access", name: "Manage Access Control", description: "Configure IP whitelists and access policies", category: "Security" },
    { id: "view_logs", name: "View Logs", description: "Access audit logs and system logs", category: "Monitoring" },
    { id: "deploy_contracts", name: "Deploy Contracts", description: "Deploy smart contracts to mainnet", category: "Development" },
    { id: "use_testnet", name: "Use Testnet", description: "Access testnet for development", category: "Development" },
    { id: "all", name: "All Permissions", description: "Full access to all system functions", category: "System" },
  ], []);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(perm => {
      if (!groups[perm.category]) groups[perm.category] = [];
      groups[perm.category].push(perm);
    });
    return groups;
  }, [permissions]);

  const getRoleBadge = (name: string) => {
    switch (name) {
      case "Super Admin": return <Badge className="bg-purple-500/10 text-purple-500">{name}</Badge>;
      case "Admin": return <Badge className="bg-blue-500/10 text-blue-500">{name}</Badge>;
      case "Operator": return <Badge className="bg-green-500/10 text-green-500">{name}</Badge>;
      case "Security": return <Badge className="bg-red-500/10 text-red-500">{name}</Badge>;
      case "Developer": return <Badge className="bg-orange-500/10 text-orange-500">{name}</Badge>;
      case "Viewer": return <Badge variant="outline">{name}</Badge>;
      default: return <Badge variant="secondary">{name}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "General": return <Globe className="h-4 w-4" />;
      case "User Management": return <Users className="h-4 w-4" />;
      case "Network": return <Activity className="h-4 w-4" />;
      case "Operations": return <Settings className="h-4 w-4" />;
      case "Security": return <Shield className="h-4 w-4" />;
      case "Monitoring": return <Activity className="h-4 w-4" />;
      case "Development": return <Database className="h-4 w-4" />;
      case "System": return <Lock className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-8 w-8" />
              Role Management
            </h1>
            <p className="text-muted-foreground">Configure roles and permissions for admin accounts</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-role">
            <ShieldPlus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>Click a role to view and edit permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 rounded-lg border cursor-pointer hover-elevate ${selectedRole?.id === role.id ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {getRoleBadge(role.name)}
                        {role.isSystem && (
                          <Badge variant="outline" className="ml-2 text-xs">System</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {role.userCount}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {role.permissions.slice(0, 3).map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Permissions</span>
                {selectedRole && !selectedRole.isSystem && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {selectedRole ? `Permissions for ${selectedRole.name}` : "Select a role to view permissions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRole ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(category)}
                          <h3 className="font-medium">{category}</h3>
                        </div>
                        <div className="space-y-2">
                          {perms.map((perm) => {
                            const hasPermission = selectedRole.permissions.includes("all") || selectedRole.permissions.includes(perm.id);
                            return (
                              <div
                                key={perm.id}
                                className={`flex items-center gap-3 p-2 rounded-lg ${hasPermission ? "bg-green-500/5" : "bg-muted/50"}`}
                              >
                                <Checkbox checked={hasPermission} disabled={selectedRole.isSystem} />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{perm.name}</p>
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <Shield className="h-12 w-12 mb-4 opacity-50" />
                  <p>Select a role to view its permissions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldPlus className="h-5 w-5" />
                Create New Role
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input id="roleName" placeholder="Enter role name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleDesc">Description</Label>
                  <Input id="roleDesc" placeholder="Enter description" />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="mb-3 block">Permissions</Label>
                <ScrollArea className="h-[300px] rounded border p-4">
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).filter(([cat]) => cat !== "System").map(([category, perms]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(category)}
                          <h3 className="font-medium text-sm">{category}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map((perm) => (
                            <div key={perm.id} className="flex items-center gap-2">
                              <Checkbox id={perm.id} />
                              <Label htmlFor={perm.id} className="text-sm font-normal cursor-pointer">
                                {perm.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
