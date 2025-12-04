import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  MoreHorizontal,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Key,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: Date | null;
  createdAt: Date;
  twoFactorEnabled: boolean;
  permissions: string[];
}

export default function AdminAccounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const accounts: AdminAccount[] = useMemo(() => [
    { id: "1", email: "admin@tburn.io", name: "System Admin", role: "Super Admin", status: "active", lastLogin: new Date(Date.now() - 60000), createdAt: new Date("2024-01-01"), twoFactorEnabled: true, permissions: ["all"] },
    { id: "2", email: "ops@tburn.io", name: "Operations Lead", role: "Operator", status: "active", lastLogin: new Date(Date.now() - 300000), createdAt: new Date("2024-02-15"), twoFactorEnabled: true, permissions: ["read", "write", "manage_validators"] },
    { id: "3", email: "security@tburn.io", name: "Security Officer", role: "Security", status: "active", lastLogin: new Date(Date.now() - 900000), createdAt: new Date("2024-03-10"), twoFactorEnabled: true, permissions: ["read", "security_management"] },
    { id: "4", email: "dev@tburn.io", name: "Lead Developer", role: "Developer", status: "active", lastLogin: new Date(Date.now() - 1800000), createdAt: new Date("2024-04-01"), twoFactorEnabled: true, permissions: ["read", "deploy_contracts"] },
    { id: "5", email: "analyst@tburn.io", name: "Data Analyst", role: "Viewer", status: "active", lastLogin: new Date(Date.now() - 7200000), createdAt: new Date("2024-05-20"), twoFactorEnabled: false, permissions: ["read"] },
    { id: "6", email: "backup@tburn.io", name: "Backup Admin", role: "Admin", status: "inactive", lastLogin: new Date(Date.now() - 86400000 * 30), createdAt: new Date("2024-01-15"), twoFactorEnabled: true, permissions: ["read", "write"] },
    { id: "7", email: "suspended@tburn.io", name: "Former Employee", role: "Operator", status: "suspended", lastLogin: null, createdAt: new Date("2024-02-01"), twoFactorEnabled: false, permissions: [] },
  ], []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = searchQuery === "" ||
        account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || account.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [accounts, searchQuery, roleFilter]);

  const stats = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter(a => a.status === "active").length,
    inactive: accounts.filter(a => a.status === "inactive").length,
    suspended: accounts.filter(a => a.status === "suspended").length,
    with2FA: accounts.filter(a => a.twoFactorEnabled).length,
  }), [accounts]);

  const roles = ["Super Admin", "Admin", "Operator", "Security", "Developer", "Viewer"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
      case "inactive": return <Badge className="bg-yellow-500/10 text-yellow-500">Inactive</Badge>;
      case "suspended": return <Badge className="bg-red-500/10 text-red-500">Suspended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Super Admin": return <Badge className="bg-purple-500/10 text-purple-500">{role}</Badge>;
      case "Admin": return <Badge className="bg-blue-500/10 text-blue-500">{role}</Badge>;
      case "Operator": return <Badge className="bg-green-500/10 text-green-500">{role}</Badge>;
      case "Security": return <Badge className="bg-red-500/10 text-red-500">{role}</Badge>;
      case "Developer": return <Badge className="bg-orange-500/10 text-orange-500">{role}</Badge>;
      case "Viewer": return <Badge variant="outline">{role}</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Admin Accounts
            </h1>
            <p className="text-muted-foreground">Manage administrator accounts and access</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-account">
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.inactive}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.suspended}</p>
              <p className="text-xs text-muted-foreground">Suspended</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.with2FA}</p>
              <p className="text-xs text-muted-foreground">2FA Enabled</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Accounts</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                    data-testid="input-account-search"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Account</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">2FA</th>
                    <th className="text-right py-3 px-4 font-medium">Last Login</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-b hover-elevate">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">{account.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {account.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getRoleBadge(account.role)}</td>
                      <td className="py-3 px-4">{getStatusBadge(account.status)}</td>
                      <td className="py-3 px-4 text-center">
                        {account.twoFactorEnabled ? (
                          <ShieldCheck className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <Shield className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(account.lastLogin)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Account</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuItem>View Activity</DropdownMenuItem>
                            {account.status === "active" ? (
                              <DropdownMenuItem className="text-yellow-500">Deactivate</DropdownMenuItem>
                            ) : account.status === "inactive" ? (
                              <DropdownMenuItem className="text-green-500">Activate</DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create Admin Account
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  A temporary password will be sent to the user's email
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button>Create Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
