import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Search, Filter, ChevronLeft, ChevronRight,
  Eye, Edit, Shield, FileCheck, AlertTriangle, CheckCircle2
} from "lucide-react";
import { useAdminPassword } from "@/hooks/use-admin-password";
import { queryClient } from "@/lib/queryClient";

interface Member {
  id: string;
  account_address: string;
  display_name: string | null;
  legal_name: string | null;
  member_tier: string;
  member_status: string;
  kyc_level: string;
  aml_risk_score: number | null;
  sanctions_check_passed: boolean | null;
  pep_status: boolean | null;
  created_at: string;
  updated_at: string;
}

interface MembersResponse {
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface MemberDetail {
  member: Member;
  profile: any;
  governance: any;
  financial: any;
  security: any;
  stakingPositions: any[];
  recentAuditLogs: any[];
  documents: any[];
}

export default function OperatorMembers() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminPassword();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editType, setEditType] = useState<"status" | "tier" | "kyc">("status");
  const [editValue, setEditValue] = useState("");
  const [editReason, setEditReason] = useState("");

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (tierFilter !== "all") params.set("tier", tierFilter);
    if (kycFilter !== "all") params.set("kycLevel", kycFilter);
    return params.toString();
  };

  const { data, isLoading, error } = useQuery<MembersResponse>({
    queryKey: ["/api/operator/members", page, search, statusFilter, tierFilter, kycFilter],
    queryFn: async () => {
      const response = await fetch(`/api/operator/members?${buildQueryString()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch members");
      return response.json();
    },
  });

  const { data: memberDetail, isLoading: detailLoading } = useQuery<MemberDetail>({
    queryKey: ["/api/operator/members", selectedMember],
    queryFn: async () => {
      const response = await fetch(`/api/operator/members/${selectedMember}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch member details");
      return response.json();
    },
    enabled: !!selectedMember,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason: string }) => {
      const response = await fetch(`/api/operator/members/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status, reason }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/members"] });
      setShowEditDialog(false);
      setEditReason("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ id, tier, reason }: { id: string; tier: string; reason: string }) => {
      const response = await fetch(`/api/operator/members/${id}/tier`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ tier, reason }),
      });
      if (!response.ok) throw new Error("Failed to update tier");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Tier updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/members"] });
      setShowEditDialog(false);
      setEditReason("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update tier", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (member: Member, type: "status" | "tier" | "kyc") => {
    setSelectedMember(member.id);
    setEditType(type);
    setEditValue(type === "status" ? member.member_status : type === "tier" ? member.member_tier : member.kyc_level);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedMember) return;
    if (editType === "status") {
      updateStatusMutation.mutate({ id: selectedMember, status: editValue, reason: editReason });
    } else if (editType === "tier") {
      updateTierMutation.mutate({ id: selectedMember, tier: editValue, reason: editReason });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case "suspended": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>;
      case "blacklisted": return <Badge variant="destructive">Blacklisted</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier.includes("validator")) {
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{tier.replace(/_/g, " ")}</Badge>;
    }
    return <Badge variant="outline">{tier.replace(/_/g, " ")}</Badge>;
  };

  const getKycBadge = (level: string) => {
    switch (level) {
      case "institutional": return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Institutional</Badge>;
      case "enhanced": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Enhanced</Badge>;
      case "basic": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Basic</Badge>;
      case "none": return <Badge variant="outline">None</Badge>;
      default: return <Badge variant="secondary">{level}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member Management</h1>
          <p className="text-muted-foreground">
            Manage network members, KYC/AML status, and tier assignments
          </p>
        </div>
        <Badge variant="outline">
          {data?.pagination?.total || 0} Total Members
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address, name..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                data-testid="input-search-members"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40" data-testid="select-tier-filter">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="basic_user">Basic User</SelectItem>
                  <SelectItem value="delegated_staker">Delegated Staker</SelectItem>
                  <SelectItem value="active_validator">Active Validator</SelectItem>
                  <SelectItem value="enterprise_validator">Enterprise Validator</SelectItem>
                </SelectContent>
              </Select>
              <Select value={kycFilter} onValueChange={(v) => { setKycFilter(v); setPage(1); }}>
                <SelectTrigger className="w-32" data-testid="select-kyc-filter">
                  <SelectValue placeholder="KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC</SelectItem>
                  <SelectItem value="none">No KYC</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                  <SelectItem value="institutional">Institutional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.members?.map((member) => (
                <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                  <TableCell className="font-mono text-sm">
                    {member.account_address.slice(0, 8)}...{member.account_address.slice(-6)}
                  </TableCell>
                  <TableCell>
                    {member.display_name || member.legal_name || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(member.member_status)}</TableCell>
                  <TableCell>{getTierBadge(member.member_tier)}</TableCell>
                  <TableCell>{getKycBadge(member.kyc_level)}</TableCell>
                  <TableCell>
                    {member.aml_risk_score !== null ? (
                      <Badge variant={
                        member.aml_risk_score >= 70 ? "destructive" :
                        member.aml_risk_score >= 40 ? "default" : "secondary"
                      }>
                        {member.aml_risk_score}
                      </Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedMember(member.id)}
                        data-testid={`btn-view-${member.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(member, "status")}
                        data-testid={`btn-edit-status-${member.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.members || data.members.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  data-testid="btn-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                  data-testid="btn-next-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember && !showEditDialog} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              {memberDetail?.member?.account_address}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-40" />
            </div>
          ) : memberDetail ? (
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="kyc">KYC/AML</TabsTrigger>
                <TabsTrigger value="staking">Staking</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Display Name</p>
                    <p className="font-medium">{memberDetail.member.display_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Legal Name</p>
                    <p className="font-medium">{memberDetail.member.legal_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(memberDetail.member.member_status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tier</p>
                    {getTierBadge(memberDetail.member.member_tier)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(memberDetail.member.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(memberDetail.member.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => handleEdit(memberDetail.member, "status")}>
                    <Edit className="h-4 w-4 mr-2" /> Change Status
                  </Button>
                  <Button variant="outline" onClick={() => handleEdit(memberDetail.member, "tier")}>
                    <Shield className="h-4 w-4 mr-2" /> Change Tier
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="kyc" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">KYC Level</p>
                    {getKycBadge(memberDetail.member.kyc_level)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AML Risk Score</p>
                    <Badge variant={
                      (memberDetail.member.aml_risk_score || 0) >= 70 ? "destructive" :
                      (memberDetail.member.aml_risk_score || 0) >= 40 ? "default" : "secondary"
                    }>
                      {memberDetail.member.aml_risk_score ?? "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sanctions Check</p>
                    {memberDetail.member.sanctions_check_passed === true ? (
                      <Badge className="bg-green-500/10 text-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Passed
                      </Badge>
                    ) : memberDetail.member.sanctions_check_passed === false ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Failed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Checked</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PEP Status</p>
                    {memberDetail.member.pep_status ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" /> PEP Identified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not PEP</Badge>
                    )}
                  </div>
                </div>

                {memberDetail.documents && memberDetail.documents.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Documents</h4>
                    <div className="space-y-2">
                      {memberDetail.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            <span>{doc.document_name}</span>
                          </div>
                          <Badge variant={
                            doc.verification_status === "verified" ? "default" :
                            doc.verification_status === "rejected" ? "destructive" : "secondary"
                          }>
                            {doc.verification_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="staking" className="space-y-4">
                {memberDetail.financial && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Staked Balance</p>
                      <p className="font-medium font-mono">{memberDetail.financial.staked_balance || "0"} TBURN</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Validator Rewards</p>
                      <p className="font-medium font-mono">{memberDetail.financial.validator_rewards || "0"} TBURN</p>
                    </div>
                  </div>
                )}
                {memberDetail.stakingPositions && memberDetail.stakingPositions.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">Staking Positions</h4>
                    {memberDetail.stakingPositions.map((pos: any, i: number) => (
                      <div key={i} className="p-3 border rounded">
                        <div className="flex justify-between">
                          <span className="font-mono text-sm">{pos.amount} TBURN</span>
                          <Badge variant="outline">{pos.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No staking positions</p>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {memberDetail.recentAuditLogs && memberDetail.recentAuditLogs.length > 0 ? (
                  <div className="space-y-2">
                    {memberDetail.recentAuditLogs.map((log: any, i: number) => (
                      <div key={i} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{log.action_type?.replace(/_/g, " ")}</p>
                            <p className="text-sm text-muted-foreground">{log.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent activity</p>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editType === "status" ? "Change Member Status" :
               editType === "tier" ? "Change Member Tier" : "Update KYC"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editType === "status" && (
              <Select value={editValue} onValueChange={setEditValue}>
                <SelectTrigger data-testid="select-new-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            )}

            {editType === "tier" && (
              <Select value={editValue} onValueChange={setEditValue}>
                <SelectTrigger data-testid="select-new-tier">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic_user">Basic User</SelectItem>
                  <SelectItem value="delegated_staker">Delegated Staker</SelectItem>
                  <SelectItem value="candidate_validator">Candidate Validator</SelectItem>
                  <SelectItem value="active_validator">Active Validator</SelectItem>
                  <SelectItem value="inactive_validator">Inactive Validator</SelectItem>
                  <SelectItem value="enterprise_validator">Enterprise Validator</SelectItem>
                  <SelectItem value="genesis_validator">Genesis Validator</SelectItem>
                  <SelectItem value="probation_validator">Probation Validator</SelectItem>
                  <SelectItem value="suspended_validator">Suspended Validator</SelectItem>
                  <SelectItem value="slashed_validator">Slashed Validator</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div>
              <label className="text-sm font-medium">Reason for change</label>
              <Textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Provide a reason for this change (required for audit)"
                className="mt-1"
                data-testid="input-edit-reason"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateStatusMutation.isPending || updateTierMutation.isPending}
              data-testid="btn-save-edit"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
