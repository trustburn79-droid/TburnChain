import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Users, ShieldAlert, FileCheck, ClipboardList, 
  AlertTriangle, CheckCircle2, Clock, XCircle,
  TrendingUp, Activity
} from "lucide-react";
import { Link } from "wouter";
import { useAdminPassword } from "@/hooks/use-admin-password";

interface DashboardData {
  members: {
    total_members: string;
    pending_members: string;
    active_members: string;
    suspended_members: string;
    no_kyc: string;
    kyc_verified: string;
  };
  validatorApplications: Array<{ status: string; count: string }>;
  securityAlerts: Array<{ severity: string; count: string }>;
  recentActivity: Array<{
    action_type: string;
    action_category: string;
    resource: string;
    created_at: string;
  }>;
}

export default function OperatorDashboard() {
  const { getAuthHeaders } = useAdminPassword();
  
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/operator/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/operator/dashboard", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "You need admin privileges to access this portal."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingApps = data?.validatorApplications?.find(a => a.status === 'pending')?.count || '0';
  const criticalAlerts = data?.securityAlerts?.find(a => a.severity === 'critical')?.count || '0';
  const highAlerts = data?.securityAlerts?.find(a => a.severity === 'high')?.count || '0';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operator Portal</h1>
          <p className="text-muted-foreground">
            Enterprise back-office for TBURN network management
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Activity className="w-3 h-3 mr-1" />
          Admin Access
        </Badge>
      </div>

      {(parseInt(criticalAlerts) > 0 || parseInt(highAlerts) > 0) && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Security Alerts Require Attention</AlertTitle>
          <AlertDescription>
            {parseInt(criticalAlerts) > 0 && `${criticalAlerts} critical`}
            {parseInt(criticalAlerts) > 0 && parseInt(highAlerts) > 0 && ' and '}
            {parseInt(highAlerts) > 0 && `${highAlerts} high priority`} 
            {' '}security events need review.
            <Link href="/operator/security" className="ml-2 underline">View now</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-members">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.members?.total_members || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{data?.members?.active_members || '0'} active</span>
              {' • '}
              <span className="text-yellow-500">{data?.members?.pending_members || '0'} pending</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-kyc-status">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.members?.kyc_verified || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">Verified</span>
              {' • '}
              <span className="text-red-500">{data?.members?.no_kyc || '0'} unverified</span>
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-validator-apps">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validator Apps</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApps}</div>
            <p className="text-xs text-muted-foreground">
              Pending review
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-security-alerts">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseInt(criticalAlerts) + parseInt(highAlerts)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">{criticalAlerts} critical</span>
              {' • '}
              <span className="text-orange-500">{highAlerts} high</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common operator tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/operator/members">
              <Button variant="outline" className="w-full justify-start" data-testid="btn-manage-members">
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </Button>
            </Link>
            <Link href="/operator/validators">
              <Button variant="outline" className="w-full justify-start" data-testid="btn-review-apps">
                <ClipboardList className="w-4 h-4 mr-2" />
                Review Validator Applications
              </Button>
            </Link>
            <Link href="/operator/security">
              <Button variant="outline" className="w-full justify-start" data-testid="btn-security-audit">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Security Audit Log
              </Button>
            </Link>
            <Link href="/operator/reports">
              <Button variant="outline" className="w-full justify-start" data-testid="btn-compliance">
                <FileCheck className="w-4 h-4 mr-2" />
                Generate Compliance Report
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
            <CardDescription>Latest operator actions</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="flex-shrink-0">
                      {activity.action_category === 'security' ? (
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                      ) : activity.action_category === 'member_management' ? (
                        <Users className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{activity.action_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{activity.resource}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card data-testid="card-member-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Member Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-sm">Active</span>
                </div>
                <span className="text-sm font-medium">{data?.members?.active_members || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-medium">{data?.members?.pending_members || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-sm">Suspended</span>
                </div>
                <span className="text-sm font-medium">{data?.members?.suspended_members || '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-validator-apps-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Validator Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.validatorApplications && data.validatorApplications.length > 0 ? (
                data.validatorApplications.map((app, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge variant={
                      app.status === 'pending' ? 'default' :
                      app.status === 'approved' ? 'default' :
                      app.status === 'rejected' ? 'destructive' : 'secondary'
                    } className="capitalize">
                      {app.status}
                    </Badge>
                    <span className="text-sm font-medium">{app.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No applications</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-security-summary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.securityAlerts && data.securityAlerts.length > 0 ? (
                data.securityAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'default' :
                      alert.severity === 'medium' ? 'secondary' : 'outline'
                    } className="capitalize">
                      {alert.severity}
                    </Badge>
                    <span className="text-sm font-medium">{alert.count}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">No open alerts</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
