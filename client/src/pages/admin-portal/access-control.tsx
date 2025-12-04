import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Users, Key, Lock, Unlock, Plus, 
  CheckCircle, XCircle, AlertTriangle, Settings
} from "lucide-react";

export default function AdminAccessControl() {
  const policies = [
    { id: 1, name: "Admin Full Access", description: "Full system access for administrators", roles: ["Super Admin"], resources: "All", status: "active" },
    { id: 2, name: "Operator Read-Write", description: "Read-write access for operators", roles: ["Operator"], resources: "Network, Nodes", status: "active" },
    { id: 3, name: "Analyst Read-Only", description: "Read-only access for analysts", roles: ["Analyst"], resources: "Reports, Analytics", status: "active" },
    { id: 4, name: "Bridge Manager", description: "Bridge operations management", roles: ["Bridge Operator"], resources: "Bridge, Transfers", status: "active" },
  ];

  const ipWhitelist = [
    { ip: "192.168.1.0/24", description: "Office Network", addedBy: "Admin", addedAt: "2024-11-15" },
    { ip: "10.0.0.0/8", description: "VPN Network", addedBy: "Admin", addedAt: "2024-11-10" },
    { ip: "203.0.113.50", description: "Remote Admin", addedBy: "Super Admin", addedAt: "2024-12-01" },
  ];

  const recentAccess = [
    { user: "admin@tburn.io", action: "Login", ip: "192.168.1.105", time: "2 min ago", status: "success" },
    { user: "operator@tburn.io", action: "View Dashboard", ip: "10.0.0.25", time: "5 min ago", status: "success" },
    { user: "unknown@test.com", action: "Login Attempt", ip: "45.33.32.156", time: "15 min ago", status: "blocked" },
    { user: "analyst@tburn.io", action: "Export Report", ip: "192.168.1.200", time: "30 min ago", status: "success" },
  ];

  const permissions = [
    { resource: "Dashboard", view: true, create: false, edit: false, delete: false },
    { resource: "Network", view: true, create: true, edit: true, delete: false },
    { resource: "Validators", view: true, create: true, edit: true, delete: true },
    { resource: "Bridge", view: true, create: false, edit: false, delete: false },
    { resource: "Settings", view: true, create: false, edit: true, delete: false },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Access Control</h1>
            <p className="text-muted-foreground">Manage access policies, permissions, and IP restrictions</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Active Policies</span>
              </div>
              <div className="text-3xl font-bold">4</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Active Sessions</span>
              </div>
              <div className="text-3xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">IP Whitelist</span>
              </div>
              <div className="text-3xl font-bold">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Blocked Today</span>
              </div>
              <div className="text-3xl font-bold text-red-500">5</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="policies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="policies" data-testid="tab-policies">
              <Shield className="w-4 h-4 mr-2" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="permissions" data-testid="tab-permissions">
              <Key className="w-4 h-4 mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="ip" data-testid="tab-ip">
              <Lock className="w-4 h-4 mr-2" />
              IP Whitelist
            </TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">
              <Users className="w-4 h-4 mr-2" />
              Access Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Access Policies</CardTitle>
                <CardDescription>Define who can access what resources</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Resources</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.name}</TableCell>
                        <TableCell className="text-muted-foreground">{policy.description}</TableCell>
                        <TableCell>
                          {policy.roles.map((role, i) => (
                            <Badge key={i} variant="outline" className="mr-1">{role}</Badge>
                          ))}
                        </TableCell>
                        <TableCell>{policy.resources}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {policy.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Permission Matrix</CardTitle>
                    <CardDescription>Configure permissions per resource</CardDescription>
                  </div>
                  <Select defaultValue="operator">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Super Admin</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>View</TableHead>
                      <TableHead>Create</TableHead>
                      <TableHead>Edit</TableHead>
                      <TableHead>Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((perm, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{perm.resource}</TableCell>
                        <TableCell><Switch defaultChecked={perm.view} /></TableCell>
                        <TableCell><Switch defaultChecked={perm.create} /></TableCell>
                        <TableCell><Switch defaultChecked={perm.edit} /></TableCell>
                        <TableCell><Switch defaultChecked={perm.delete} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ip">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>IP Whitelist</CardTitle>
                    <CardDescription>Allowed IP addresses and ranges</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add IP
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address/Range</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Added By</TableHead>
                      <TableHead>Added At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipWhitelist.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{entry.ip}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.addedBy}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.addedAt}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="text-red-500">Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enforce IP Whitelist</p>
                    <p className="text-sm text-muted-foreground">Only allow access from whitelisted IPs</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Geo-blocking</p>
                    <p className="text-sm text-muted-foreground">Block access from specific countries</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rate Limiting</p>
                    <p className="text-sm text-muted-foreground">Limit requests per IP address</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Access Activity</CardTitle>
                <CardDescription>Login attempts and access events</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAccess.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.user}</TableCell>
                        <TableCell>{entry.action}</TableCell>
                        <TableCell className="font-mono">{entry.ip}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.time}</TableCell>
                        <TableCell>
                          {entry.status === "success" ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Blocked
                            </Badge>
                          )}
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
