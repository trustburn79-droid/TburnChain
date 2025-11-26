import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Search, ChevronLeft, ChevronRight,
  Eye, Edit, Shield, FileCheck, AlertTriangle, CheckCircle2,
  Download, MoreHorizontal, UserCheck, UserX, Clock,
  Plus, Pin, Trash2, StickyNote, Calendar, Activity
} from "lucide-react";
import { useAdminPassword } from "@/hooks/use-admin-password";

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

interface MemberNote {
  id: string;
  member_id: string;
  operator_id: string;
  note_type: string;
  title: string;
  content: string;
  priority: string;
  is_private: boolean;
  is_pinned: boolean;
  requires_follow_up: boolean;
  follow_up_date: string | null;
  follow_up_completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function OperatorMembers() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminPassword();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editType, setEditType] = useState<"status" | "tier" | "kyc">("status");
  const [editValue, setEditValue] = useState("");
  const [editReason, setEditReason] = useState("");
  
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<"status" | "tier">("status");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [notePriority, setNotePriority] = useState("normal");
  const [notePinned, setNotePinned] = useState(false);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (tierFilter !== "all") params.set("tier", tierFilter);
    if (kycFilter !== "all") params.set("kycLevel", kycFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params.toString();
  };

  const { data, isLoading, error } = useQuery<MembersResponse>({
    queryKey: ["/api/operator/members", page, search, statusFilter, tierFilter, kycFilter, dateFrom, dateTo],
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

  const { data: memberNotes } = useQuery<MemberNote[]>({
    queryKey: ["/api/operator/members", selectedMember, "notes"],
    queryFn: async () => {
      const response = await fetch(`/api/operator/members/${selectedMember}/notes`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
    enabled: !!selectedMember,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason: string }) => {
      const response = await fetch(`/api/operator/members/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, field, value, reason }: { ids: string[]; field: string; value: string; reason: string }) => {
      const promises = ids.map(id => {
        const endpoint = field === "status" ? `/api/operator/members/${id}/status` : `/api/operator/members/${id}/tier`;
        const body = field === "status" ? { status: value, reason } : { tier: value, reason };
        return fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(body),
        });
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({ title: `Bulk ${bulkAction} update completed`, description: `${selectedMembers.size} members updated` });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/members"] });
      setShowBulkActionDialog(false);
      setSelectedMembers(new Set());
      setBulkReason("");
    },
    onError: () => {
      toast({ title: "Bulk update failed", variant: "destructive" });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: any }) => {
      const response = await fetch(`/api/operator/members/${memberId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create note");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Note created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/members", selectedMember, "notes"] });
      setShowNoteDialog(false);
      setNoteTitle("");
      setNoteContent("");
    },
    onError: () => {
      toast({ title: "Failed to create note", variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await fetch(`/api/operator/notes/${noteId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete note");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Note deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/members", selectedMember, "notes"] });
    },
  });

  const togglePinNoteMutation = useMutation({
    mutationFn: async ({ noteId, isPinned }: { noteId: string; isPinned: boolean }) => {
      const response = await fetch(`/api/operator/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ isPinned }),
      });
      if (!response.ok) throw new Error("Failed to update note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operator/members", selectedMember, "notes"] });
    },
  });

  const exportToCSV = () => {
    if (!data?.members) return;
    
    const headers = ["Address", "Display Name", "Legal Name", "Status", "Tier", "KYC Level", "AML Risk Score", "Created At"];
    const rows = data.members.map(m => [
      m.account_address,
      m.display_name || "",
      m.legal_name || "",
      m.member_status,
      m.member_tier,
      m.kyc_level,
      m.aml_risk_score?.toString() || "",
      new Date(m.created_at).toISOString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Export complete", description: `${data.members.length} members exported` });
  };

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

  const handleBulkAction = () => {
    if (selectedMembers.size === 0) return;
    bulkUpdateMutation.mutate({
      ids: Array.from(selectedMembers),
      field: bulkAction,
      value: bulkValue,
      reason: bulkReason,
    });
  };

  const handleCreateNote = () => {
    if (!selectedMember || !noteTitle || !noteContent) return;
    createNoteMutation.mutate({
      memberId: selectedMember,
      data: {
        title: noteTitle,
        content: noteContent,
        noteType,
        priority: notePriority,
        isPinned: notePinned,
      },
    });
  };

  const toggleSelectMember = (id: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  const toggleSelectAll = () => {
    if (!data?.members) return;
    if (selectedMembers.size === data.members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(data.members.map(m => m.id)));
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

  const getNotePriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return <Badge variant="destructive">Urgent</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-500">High</Badge>;
      case "normal": return <Badge variant="secondary">Normal</Badge>;
      case "low": return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV} data-testid="btn-export-csv">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Badge variant="outline">
            {data?.pagination?.total || 0} Total Members
          </Badge>
        </div>
      </div>

      {selectedMembers.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="font-medium">{selectedMembers.size} members selected</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setBulkAction("status"); setShowBulkActionDialog(true); }}
                  data-testid="btn-bulk-status"
                >
                  Change Status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setBulkAction("tier"); setShowBulkActionDialog(true); }}
                  data-testid="btn-bulk-tier"
                >
                  Change Tier
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedMembers(new Set())}
                  data-testid="btn-clear-selection"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by address, name..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  data-testid="input-search-members"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
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
            <div className="flex gap-2 items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="From"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-40"
                data-testid="input-date-from"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                placeholder="To"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-40"
                data-testid="input-date-to"
              />
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                  Clear dates
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={data?.members && selectedMembers.size === data.members.length}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
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
                  <TableCell>
                    <Checkbox
                      checked={selectedMembers.has(member.id)}
                      onCheckedChange={() => toggleSelectMember(member.id)}
                      data-testid={`checkbox-member-${member.id}`}
                    />
                  </TableCell>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`btn-actions-${member.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(member, "status")}>
                            <Edit className="h-4 w-4 mr-2" /> Change Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(member, "tier")}>
                            <Shield className="h-4 w-4 mr-2" /> Change Tier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setSelectedMember(member.id); setShowNoteDialog(true); }}>
                            <StickyNote className="h-4 w-4 mr-2" /> Add Note
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.members || data.members.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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

      <Dialog open={!!selectedMember && !showEditDialog && !showNoteDialog} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="kyc">KYC/AML</TabsTrigger>
                <TabsTrigger value="staking">Staking</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
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
                  <Button variant="outline" onClick={() => setShowNoteDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Note
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

              <TabsContent value="notes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Member Notes</h4>
                  <Button size="sm" onClick={() => setShowNoteDialog(true)} data-testid="btn-add-note">
                    <Plus className="h-4 w-4 mr-2" /> Add Note
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  {memberNotes && memberNotes.length > 0 ? (
                    <div className="space-y-3">
                      {memberNotes.map((note) => (
                        <Card key={note.id} className={note.is_pinned ? "border-primary/50" : ""}>
                          <CardHeader className="py-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {note.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                                <CardTitle className="text-sm">{note.title}</CardTitle>
                              </div>
                              <div className="flex items-center gap-1">
                                {getNotePriorityBadge(note.priority)}
                                <Badge variant="outline" className="text-xs">{note.note_type}</Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-6 w-6">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => togglePinNoteMutation.mutate({ noteId: note.id, isPinned: !note.is_pinned })}>
                                      <Pin className="h-4 w-4 mr-2" /> {note.is_pinned ? "Unpin" : "Pin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-500" onClick={() => deleteNoteMutation.mutate(note.id)}>
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm text-muted-foreground">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(note.created_at).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <StickyNote className="h-8 w-8 mb-2" />
                      <p className="text-sm">No notes yet</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <ScrollArea className="h-[300px]">
                  {memberDetail.recentAuditLogs && memberDetail.recentAuditLogs.length > 0 ? (
                    <div className="space-y-3">
                      {memberDetail.recentAuditLogs.map((log: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 border rounded">
                          <div className="mt-1">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{log.action_type?.replace(/_/g, " ")}</p>
                            <p className="text-xs text-muted-foreground">{log.action_category}</p>
                            {log.details && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Clock className="h-8 w-8 mb-2" />
                      <p className="text-sm">No activity recorded</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={() => { setShowEditDialog(false); setEditReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editType === "status" ? "Change Member Status" : 
               editType === "tier" ? "Change Member Tier" : "Update KYC Level"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New {editType === "status" ? "Status" : editType === "tier" ? "Tier" : "KYC Level"}</Label>
              <Select value={editValue} onValueChange={setEditValue}>
                <SelectTrigger data-testid="select-edit-value">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {editType === "status" ? (
                    <>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="blacklisted">Blacklisted</SelectItem>
                    </>
                  ) : editType === "tier" ? (
                    <>
                      <SelectItem value="basic_user">Basic User</SelectItem>
                      <SelectItem value="delegated_staker">Delegated Staker</SelectItem>
                      <SelectItem value="active_validator">Active Validator</SelectItem>
                      <SelectItem value="enterprise_validator">Enterprise Validator</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="enhanced">Enhanced</SelectItem>
                      <SelectItem value="institutional">Institutional</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason for change</Label>
              <Textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Enter reason for this change..."
                data-testid="textarea-edit-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editReason} data-testid="btn-save-edit">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkActionDialog} onOpenChange={() => { setShowBulkActionDialog(false); setBulkReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk {bulkAction === "status" ? "Status" : "Tier"} Update</DialogTitle>
            <DialogDescription>
              This will update {selectedMembers.size} selected members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New {bulkAction === "status" ? "Status" : "Tier"}</Label>
              <Select value={bulkValue} onValueChange={setBulkValue}>
                <SelectTrigger data-testid="select-bulk-value">
                  <SelectValue placeholder={`Select ${bulkAction}`} />
                </SelectTrigger>
                <SelectContent>
                  {bulkAction === "status" ? (
                    <>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="basic_user">Basic User</SelectItem>
                      <SelectItem value="delegated_staker">Delegated Staker</SelectItem>
                      <SelectItem value="active_validator">Active Validator</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Enter reason for bulk update..."
                data-testid="textarea-bulk-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActionDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkAction} 
              disabled={!bulkValue || !bulkReason || bulkUpdateMutation.isPending}
              data-testid="btn-confirm-bulk"
            >
              {bulkUpdateMutation.isPending ? "Updating..." : `Update ${selectedMembers.size} Members`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoteDialog} onOpenChange={() => { setShowNoteDialog(false); setNoteTitle(""); setNoteContent(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title..."
                data-testid="input-note-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger data-testid="select-note-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="kyc_review">KYC Review</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={notePriority} onValueChange={setNotePriority}>
                  <SelectTrigger data-testid="select-note-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Note content..."
                rows={4}
                data-testid="textarea-note-content"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="pinNote"
                checked={notePinned}
                onCheckedChange={(checked) => setNotePinned(!!checked)}
              />
              <Label htmlFor="pinNote">Pin this note</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateNote} 
              disabled={!noteTitle || !noteContent || createNoteMutation.isPending}
              data-testid="btn-save-note"
            >
              {createNoteMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
