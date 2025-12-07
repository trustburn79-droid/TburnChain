import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Newspaper,
  Calendar,
  Users,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  TrendingUp,
  Star,
  Globe,
  MapPin,
  Video,
  Megaphone,
  FileText,
  Loader2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  titleKo?: string;
  content: string;
  contentKo?: string;
  announcementType: string;
  isImportant: boolean;
  isPinned: boolean;
  expiresAt: string | null;
  authorId: number | null;
  views: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface EventItem {
  id: string;
  title: string;
  titleKo?: string;
  description: string;
  descriptionKo?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string | null;
  isOnline: boolean;
  meetingUrl: string | null;
  participants: number;
  maxParticipants: number | null;
  rewards: string | null;
  status: string;
  organizerId: number | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HubPost {
  id: string;
  authorId: number;
  authorAddress: string;
  authorUsername: string | null;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  isPinned: boolean;
  isHot: boolean;
  isLocked: boolean;
  likes: number;
  views: number;
  commentCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

interface CommunityContentData {
  news: NewsItem[];
  events: EventItem[];
  hubPosts: HubPost[];
  stats: {
    totalNews: number;
    activeNews: number;
    totalEvents: number;
    upcomingEvents: number;
    totalPosts: number;
    activePosts: number;
    pinnedItems: number;
    flaggedItems: number;
  };
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  isLoading,
  bgColor = "bg-primary/10",
  iconColor = "text-primary",
  testId
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId: string;
}) {
  const changeColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-muted-foreground"
  };

  if (isLoading) {
    return (
      <Card data-testid={testId}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeColors[changeType]}`}>{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

function NewsForm({
  item,
  onSave,
  onCancel,
  isLoading,
}: {
  item?: NewsItem | null;
  onSave: (data: Partial<NewsItem>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: item?.title || "",
    titleKo: item?.titleKo || "",
    content: item?.content || "",
    contentKo: item?.contentKo || "",
    announcementType: item?.announcementType || "news",
    isImportant: item?.isImportant || false,
    isPinned: item?.isPinned || false,
    status: item?.status || "active",
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.titleEn")}</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t("adminCommunityContent.enterTitleEn")}
            data-testid="input-news-title-en"
          />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.titleKo")}</Label>
          <Input
            value={formData.titleKo}
            onChange={(e) => setFormData({ ...formData, titleKo: e.target.value })}
            placeholder={t("adminCommunityContent.enterTitleKo")}
            data-testid="input-news-title-ko"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.contentEn")}</Label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder={t("adminCommunityContent.enterContentEn")}
            rows={6}
            data-testid="input-news-content-en"
          />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.contentKo")}</Label>
          <Textarea
            value={formData.contentKo}
            onChange={(e) => setFormData({ ...formData, contentKo: e.target.value })}
            placeholder={t("adminCommunityContent.enterContentKo")}
            rows={6}
            data-testid="input-news-content-ko"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.type")}</Label>
          <Select value={formData.announcementType} onValueChange={(v) => setFormData({ ...formData, announcementType: v })}>
            <SelectTrigger data-testid="select-news-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="news">{t("adminCommunityContent.typeNews")}</SelectItem>
              <SelectItem value="update">{t("adminCommunityContent.typeUpdate")}</SelectItem>
              <SelectItem value="alert">{t("adminCommunityContent.typeAlert")}</SelectItem>
              <SelectItem value="feature">{t("adminCommunityContent.typeFeature")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.status")}</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger data-testid="select-news-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("adminCommunityContent.statusActive")}</SelectItem>
              <SelectItem value="draft">{t("adminCommunityContent.statusDraft")}</SelectItem>
              <SelectItem value="archived">{t("adminCommunityContent.statusArchived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <Switch checked={formData.isImportant} onCheckedChange={(v) => setFormData({ ...formData, isImportant: v })} data-testid="switch-news-important" />
            <Label>{t("adminCommunityContent.important")}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formData.isPinned} onCheckedChange={(v) => setFormData({ ...formData, isPinned: v })} data-testid="switch-news-pinned" />
            <Label>{t("adminCommunityContent.pinned")}</Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-news">
          {t("common.cancel")}
        </Button>
        <Button onClick={() => onSave(formData)} disabled={isLoading || !formData.title || !formData.content} data-testid="button-save-news">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {item ? t("common.update") : t("common.create")}
        </Button>
      </DialogFooter>
    </div>
  );
}

function EventForm({
  item,
  onSave,
  onCancel,
  isLoading,
}: {
  item?: EventItem | null;
  onSave: (data: Partial<EventItem>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: item?.title || "",
    titleKo: item?.titleKo || "",
    description: item?.description || "",
    descriptionKo: item?.descriptionKo || "",
    eventType: item?.eventType || "meetup",
    startDate: item?.startDate ? item.startDate.slice(0, 16) : "",
    endDate: item?.endDate ? item.endDate.slice(0, 16) : "",
    location: item?.location || "",
    isOnline: item?.isOnline ?? true,
    meetingUrl: item?.meetingUrl || "",
    maxParticipants: item?.maxParticipants || null,
    rewards: item?.rewards || "",
    status: item?.status || "upcoming",
    coverImage: item?.coverImage || "",
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.titleEn")}</Label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} data-testid="input-event-title-en" />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.titleKo")}</Label>
          <Input value={formData.titleKo} onChange={(e) => setFormData({ ...formData, titleKo: e.target.value })} data-testid="input-event-title-ko" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.descriptionEn")}</Label>
          <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} data-testid="input-event-desc-en" />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.descriptionKo")}</Label>
          <Textarea value={formData.descriptionKo} onChange={(e) => setFormData({ ...formData, descriptionKo: e.target.value })} rows={4} data-testid="input-event-desc-ko" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.eventType")}</Label>
          <Select value={formData.eventType} onValueChange={(v) => setFormData({ ...formData, eventType: v })}>
            <SelectTrigger data-testid="select-event-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ama">AMA</SelectItem>
              <SelectItem value="workshop">{t("adminCommunityContent.workshop")}</SelectItem>
              <SelectItem value="hackathon">{t("adminCommunityContent.hackathon")}</SelectItem>
              <SelectItem value="meetup">{t("adminCommunityContent.meetup")}</SelectItem>
              <SelectItem value="airdrop">{t("adminCommunityContent.airdrop")}</SelectItem>
              <SelectItem value="competition">{t("adminCommunityContent.competition")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.startDate")}</Label>
          <Input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} data-testid="input-event-start" />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.endDate")}</Label>
          <Input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} data-testid="input-event-end" />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.status")}</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger data-testid="select-event-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">{t("adminCommunityContent.statusUpcoming")}</SelectItem>
              <SelectItem value="live">{t("adminCommunityContent.statusLive")}</SelectItem>
              <SelectItem value="ended">{t("adminCommunityContent.statusEnded")}</SelectItem>
              <SelectItem value="cancelled">{t("adminCommunityContent.statusCancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.location")}</Label>
          <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} data-testid="input-event-location" />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.meetingUrl")}</Label>
          <Input value={formData.meetingUrl} onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })} data-testid="input-event-url" />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.maxParticipants")}</Label>
          <Input type="number" value={formData.maxParticipants || ""} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : null })} data-testid="input-event-max" />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.rewards")}</Label>
          <Input value={formData.rewards} onChange={(e) => setFormData({ ...formData, rewards: e.target.value })} placeholder="10,000 TBURN" data-testid="input-event-rewards" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={formData.isOnline} onCheckedChange={(v) => setFormData({ ...formData, isOnline: v })} data-testid="switch-event-online" />
          <Label>{t("adminCommunityContent.isOnline")}</Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-event">
          {t("common.cancel")}
        </Button>
        <Button onClick={() => onSave(formData)} disabled={isLoading || !formData.title || !formData.description} data-testid="button-save-event">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {item ? t("common.update") : t("common.create")}
        </Button>
      </DialogFooter>
    </div>
  );
}

function HubPostForm({
  item,
  onSave,
  onCancel,
  isLoading,
}: {
  item?: HubPost | null;
  onSave: (data: Partial<HubPost>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: item?.title || "",
    content: item?.content || "",
    category: item?.category || "general",
    tags: item?.tags?.join(", ") || "",
    status: item?.status || "active",
    isPinned: item?.isPinned || false,
    isHot: item?.isHot || false,
    isLocked: item?.isLocked || false,
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("adminCommunityContent.title")}</Label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} data-testid="input-hub-title" />
      </div>
      <div className="space-y-2">
        <Label>{t("adminCommunityContent.content")}</Label>
        <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} data-testid="input-hub-content" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.category")}</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger data-testid="select-hub-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">{t("adminCommunityContent.categoryGeneral")}</SelectItem>
              <SelectItem value="technical">{t("adminCommunityContent.categoryTechnical")}</SelectItem>
              <SelectItem value="governance">{t("adminCommunityContent.categoryGovernance")}</SelectItem>
              <SelectItem value="trading">{t("adminCommunityContent.categoryTrading")}</SelectItem>
              <SelectItem value="support">{t("adminCommunityContent.categorySupport")}</SelectItem>
              <SelectItem value="announcements">{t("adminCommunityContent.categoryAnnouncements")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.tags")}</Label>
          <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="tag1, tag2, tag3" data-testid="input-hub-tags" />
        </div>
        <div className="space-y-2">
          <Label>{t("adminCommunityContent.status")}</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger data-testid="select-hub-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("adminCommunityContent.statusActive")}</SelectItem>
              <SelectItem value="flagged">{t("adminCommunityContent.statusFlagged")}</SelectItem>
              <SelectItem value="removed">{t("adminCommunityContent.statusRemoved")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={formData.isPinned} onCheckedChange={(v) => setFormData({ ...formData, isPinned: v })} data-testid="switch-hub-pinned" />
          <Label>{t("adminCommunityContent.pinned")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={formData.isHot} onCheckedChange={(v) => setFormData({ ...formData, isHot: v })} data-testid="switch-hub-hot" />
          <Label>{t("adminCommunityContent.hot")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={formData.isLocked} onCheckedChange={(v) => setFormData({ ...formData, isLocked: v })} data-testid="switch-hub-locked" />
          <Label>{t("adminCommunityContent.locked")}</Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-hub">
          {t("common.cancel")}
        </Button>
        <Button onClick={() => onSave({ ...formData, tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean) })} disabled={isLoading || !formData.title || !formData.content} data-testid="button-save-hub">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {item ? t("common.update") : t("common.create")}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function CommunityContentManagement() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("news");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showHubForm, setShowHubForm] = useState(false);
  
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editingHub, setEditingHub] = useState<HubPost | null>(null);
  
  const [showNewsDetail, setShowNewsDetail] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showHubDetail, setShowHubDetail] = useState(false);
  
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedHub, setSelectedHub] = useState<HubPost | null>(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; title: string } | null>(null);

  const { data, isLoading, error, refetch } = useQuery<CommunityContentData>({
    queryKey: ['/api/admin/community/content'],
    refetchInterval: 30000,
  });

  const createNewsMutation = useMutation({
    mutationFn: async (newsData: Partial<NewsItem>) => {
      const response = await apiRequest("POST", "/api/admin/community/news", newsData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      setShowNewsForm(false);
      setEditingNews(null);
      toast({ title: t("adminCommunityContent.newsSaved"), description: t("adminCommunityContent.newsSavedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.saveError"), variant: "destructive" });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewsItem> }) => {
      const response = await apiRequest("PATCH", `/api/admin/community/news/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      setShowNewsForm(false);
      setEditingNews(null);
      toast({ title: t("adminCommunityContent.newsUpdated"), description: t("adminCommunityContent.newsUpdatedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.updateError"), variant: "destructive" });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/community/news/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      toast({ title: t("adminCommunityContent.newsDeleted"), description: t("adminCommunityContent.newsDeletedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.deleteError"), variant: "destructive" });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<EventItem>) => {
      const response = await apiRequest("POST", "/api/admin/community/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      setShowEventForm(false);
      setEditingEvent(null);
      toast({ title: t("adminCommunityContent.eventSaved"), description: t("adminCommunityContent.eventSavedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.saveError"), variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventItem> }) => {
      const response = await apiRequest("PATCH", `/api/admin/community/events/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      setShowEventForm(false);
      setEditingEvent(null);
      toast({ title: t("adminCommunityContent.eventUpdated"), description: t("adminCommunityContent.eventUpdatedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.updateError"), variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/community/events/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      toast({ title: t("adminCommunityContent.eventDeleted"), description: t("adminCommunityContent.eventDeletedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.deleteError"), variant: "destructive" });
    },
  });

  const createHubMutation = useMutation({
    mutationFn: async (hubData: Partial<HubPost>) => {
      const response = await apiRequest("POST", "/api/admin/community/hub", hubData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      setShowHubForm(false);
      setEditingHub(null);
      toast({ title: t("adminCommunityContent.hubSaved"), description: t("adminCommunityContent.hubSavedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.saveError"), variant: "destructive" });
    },
  });

  const updateHubMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HubPost> }) => {
      const response = await apiRequest("PATCH", `/api/admin/community/hub/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      setShowHubForm(false);
      setEditingHub(null);
      toast({ title: t("adminCommunityContent.hubUpdated"), description: t("adminCommunityContent.hubUpdatedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.updateError"), variant: "destructive" });
    },
  });

  const deleteHubMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/community/hub/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/content'] });
      toast({ title: t("adminCommunityContent.hubDeleted"), description: t("adminCommunityContent.hubDeletedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("adminCommunityContent.deleteError"), variant: "destructive" });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({ title: t("common.refreshed"), description: t("common.dataRefreshed") });
  }, [refetch, toast, t]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    
    switch (deleteTarget.type) {
      case "news":
        deleteNewsMutation.mutate(deleteTarget.id);
        break;
      case "event":
        deleteEventMutation.mutate(deleteTarget.id);
        break;
      case "hub":
        deleteHubMutation.mutate(deleteTarget.id);
        break;
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const getStatusBadge = (status: string | undefined | null) => {
    const safeStatus = status || "unknown";
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
      active: { variant: "default", color: "bg-green-500/20 text-green-400" },
      upcoming: { variant: "default", color: "bg-blue-500/20 text-blue-400" },
      live: { variant: "default", color: "bg-purple-500/20 text-purple-400" },
      draft: { variant: "secondary", color: "" },
      ended: { variant: "outline", color: "" },
      archived: { variant: "outline", color: "" },
      flagged: { variant: "destructive", color: "" },
      removed: { variant: "destructive", color: "" },
      cancelled: { variant: "destructive", color: "" },
      unknown: { variant: "outline", color: "" },
    };
    const config = statusConfig[safeStatus] || { variant: "outline", color: "" };
    return <Badge variant={config.variant} className={config.color}>{t(`adminCommunityContent.status${safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}`)}</Badge>;
  };

  const getTypeBadge = (type: string | undefined | null) => {
    const safeType = type || "unknown";
    const typeColors: Record<string, string> = {
      news: "bg-blue-500/20 text-blue-400",
      update: "bg-green-500/20 text-green-400",
      alert: "bg-red-500/20 text-red-400",
      feature: "bg-purple-500/20 text-purple-400",
      ama: "bg-purple-500/20 text-purple-400",
      workshop: "bg-blue-500/20 text-blue-400",
      hackathon: "bg-green-500/20 text-green-400",
      meetup: "bg-yellow-500/20 text-yellow-400",
      airdrop: "bg-pink-500/20 text-pink-400",
      competition: "bg-orange-500/20 text-orange-400",
    };
    return <Badge className={typeColors[safeType] || ""}>{safeType.toUpperCase()}</Badge>;
  };

  const filteredNews = data?.news?.filter((n) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredEvents = data?.events?.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredHub = data?.hubPosts?.filter((h) =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const newsDetailSections: DetailSection[] = selectedNews ? [
    {
      title: t("adminCommunityContent.overview"),
      fields: [
        { label: t("adminCommunityContent.id"), value: selectedNews.id, type: "code", copyable: true },
        { label: t("adminCommunityContent.title"), value: selectedNews.title },
        { label: t("adminCommunityContent.type"), value: selectedNews.announcementType, type: "badge" },
        { label: t("adminCommunityContent.status"), value: selectedNews.status, type: "badge" },
        { label: t("adminCommunityContent.views"), value: selectedNews.views },
        { label: t("adminCommunityContent.important"), value: selectedNews.isImportant ? t("common.yes") : t("common.no") },
        { label: t("adminCommunityContent.pinned"), value: selectedNews.isPinned ? t("common.yes") : t("common.no") },
      ],
    },
    {
      title: t("adminCommunityContent.content"),
      fields: [
        { label: t("adminCommunityContent.contentEn"), value: selectedNews.content },
        { label: t("adminCommunityContent.contentKo"), value: selectedNews.contentKo || "-" },
      ],
    },
    {
      title: t("adminCommunityContent.metadata"),
      fields: [
        { label: t("adminCommunityContent.createdAt"), value: selectedNews.createdAt, type: "date" },
        { label: t("adminCommunityContent.updatedAt"), value: selectedNews.updatedAt, type: "date" },
        { label: t("adminCommunityContent.expiresAt"), value: selectedNews.expiresAt || "-" },
      ],
    },
  ] : [];

  const eventDetailSections: DetailSection[] = selectedEvent ? [
    {
      title: t("adminCommunityContent.overview"),
      fields: [
        { label: t("adminCommunityContent.id"), value: selectedEvent.id, type: "code", copyable: true },
        { label: t("adminCommunityContent.title"), value: selectedEvent.title },
        { label: t("adminCommunityContent.eventType"), value: selectedEvent.eventType, type: "badge" },
        { label: t("adminCommunityContent.status"), value: selectedEvent.status, type: "badge" },
        { label: t("adminCommunityContent.participants"), value: `${selectedEvent.participants}${selectedEvent.maxParticipants ? ` / ${selectedEvent.maxParticipants}` : ""}` },
        { label: t("adminCommunityContent.rewards"), value: selectedEvent.rewards || "-" },
      ],
    },
    {
      title: t("adminCommunityContent.schedule"),
      fields: [
        { label: t("adminCommunityContent.startDate"), value: selectedEvent.startDate, type: "date" },
        { label: t("adminCommunityContent.endDate"), value: selectedEvent.endDate, type: "date" },
        { label: t("adminCommunityContent.isOnline"), value: selectedEvent.isOnline ? t("common.yes") : t("common.no") },
        { label: t("adminCommunityContent.location"), value: selectedEvent.location || "-" },
        { label: t("adminCommunityContent.meetingUrl"), value: selectedEvent.meetingUrl || "-", type: selectedEvent.meetingUrl ? "link" : "text" },
      ],
    },
  ] : [];

  const hubDetailSections: DetailSection[] = selectedHub ? [
    {
      title: t("adminCommunityContent.overview"),
      fields: [
        { label: t("adminCommunityContent.id"), value: selectedHub.id, type: "code", copyable: true },
        { label: t("adminCommunityContent.title"), value: selectedHub.title },
        { label: t("adminCommunityContent.category"), value: selectedHub.category, type: "badge" },
        { label: t("adminCommunityContent.status"), value: selectedHub.status, type: "badge" },
        { label: t("adminCommunityContent.author"), value: selectedHub.authorUsername || selectedHub.authorAddress },
      ],
    },
    {
      title: t("adminCommunityContent.engagement"),
      fields: [
        { label: t("adminCommunityContent.likes"), value: selectedHub.likes },
        { label: t("adminCommunityContent.views"), value: selectedHub.views },
        { label: t("adminCommunityContent.comments"), value: selectedHub.commentCount },
        { label: t("adminCommunityContent.pinned"), value: selectedHub.isPinned ? t("common.yes") : t("common.no") },
        { label: t("adminCommunityContent.hot"), value: selectedHub.isHot ? t("common.yes") : t("common.no") },
        { label: t("adminCommunityContent.locked"), value: selectedHub.isLocked ? t("common.yes") : t("common.no") },
      ],
    },
  ] : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{t("adminCommunityContent.title")}</h1>
          <p className="text-muted-foreground">{t("adminCommunityContent.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            {t("common.export")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={Newspaper} label={t("adminCommunityContent.totalNews")} value={data?.stats?.totalNews || 0} change={`${data?.stats?.activeNews || 0} ${t("adminCommunityContent.active")}`} changeType="positive" isLoading={isLoading} bgColor="bg-blue-500/10" iconColor="text-blue-500" testId="metric-news" />
        <MetricCard icon={Calendar} label={t("adminCommunityContent.totalEvents")} value={data?.stats?.totalEvents || 0} change={`${data?.stats?.upcomingEvents || 0} ${t("adminCommunityContent.upcoming")}`} changeType="positive" isLoading={isLoading} bgColor="bg-purple-500/10" iconColor="text-purple-500" testId="metric-events" />
        <MetricCard icon={Users} label={t("adminCommunityContent.totalPosts")} value={data?.stats?.totalPosts || 0} change={`${data?.stats?.activePosts || 0} ${t("adminCommunityContent.active")}`} changeType="positive" isLoading={isLoading} bgColor="bg-green-500/10" iconColor="text-green-500" testId="metric-posts" />
        <MetricCard icon={Star} label={t("adminCommunityContent.pinnedItems")} value={data?.stats?.pinnedItems || 0} change={data?.stats?.flaggedItems ? `${data.stats.flaggedItems} ${t("adminCommunityContent.flagged")}` : undefined} changeType="negative" isLoading={isLoading} bgColor="bg-yellow-500/10" iconColor="text-yellow-500" testId="metric-pinned" />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("adminCommunityContent.searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="news" data-testid="tab-news">
            <Newspaper className="h-4 w-4 mr-2" />
            {t("adminCommunityContent.news")} ({filteredNews.length})
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">
            <Calendar className="h-4 w-4 mr-2" />
            {t("adminCommunityContent.events")} ({filteredEvents.length})
          </TabsTrigger>
          <TabsTrigger value="hub" data-testid="tab-hub">
            <Users className="h-4 w-4 mr-2" />
            {t("adminCommunityContent.hub")} ({filteredHub.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingNews(null); setShowNewsForm(true); }} data-testid="button-add-news">
              <Plus className="h-4 w-4 mr-2" />
              {t("adminCommunityContent.addNews")}
            </Button>
          </div>
          <Card>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminCommunityContent.title")}</TableHead>
                    <TableHead>{t("adminCommunityContent.type")}</TableHead>
                    <TableHead>{t("adminCommunityContent.status")}</TableHead>
                    <TableHead>{t("adminCommunityContent.views")}</TableHead>
                    <TableHead>{t("adminCommunityContent.createdAt")}</TableHead>
                    <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredNews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {t("adminCommunityContent.noNewsFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNews.map((item) => (
                      <TableRow key={item.id} data-testid={`row-news-${item.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.isPinned && <Star className="h-3 w-3 text-yellow-500" />}
                            {item.isImportant && <AlertTriangle className="h-3 w-3 text-red-500" />}
                            <span className="truncate max-w-[200px]">{item.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(item.announcementType)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.views.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(item.createdAt), "yyyy-MM-dd")}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-news-${item.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedNews(item); setShowNewsDetail(true); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("common.view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditingNews(item); setShowNewsForm(true); }}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTarget({ type: "news", id: item.id, title: item.title }); setShowDeleteConfirm(true); }}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingEvent(null); setShowEventForm(true); }} data-testid="button-add-event">
              <Plus className="h-4 w-4 mr-2" />
              {t("adminCommunityContent.addEvent")}
            </Button>
          </div>
          <Card>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminCommunityContent.title")}</TableHead>
                    <TableHead>{t("adminCommunityContent.eventType")}</TableHead>
                    <TableHead>{t("adminCommunityContent.status")}</TableHead>
                    <TableHead>{t("adminCommunityContent.startDate")}</TableHead>
                    <TableHead>{t("adminCommunityContent.participants")}</TableHead>
                    <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {t("adminCommunityContent.noEventsFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((item) => (
                      <TableRow key={item.id} data-testid={`row-event-${item.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.isOnline ? <Video className="h-3 w-3 text-blue-500" /> : <MapPin className="h-3 w-3 text-green-500" />}
                            <span className="truncate max-w-[200px]">{item.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(item.eventType)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{format(new Date(item.startDate), "yyyy-MM-dd HH:mm")}</TableCell>
                        <TableCell>{item.participants.toLocaleString()}{item.maxParticipants ? ` / ${item.maxParticipants.toLocaleString()}` : ""}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-event-${item.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedEvent(item); setShowEventDetail(true); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("common.view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditingEvent(item); setShowEventForm(true); }}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTarget({ type: "event", id: item.id, title: item.title }); setShowDeleteConfirm(true); }}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="hub" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingHub(null); setShowHubForm(true); }} data-testid="button-add-hub">
              <Plus className="h-4 w-4 mr-2" />
              {t("adminCommunityContent.addPost")}
            </Button>
          </div>
          <Card>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminCommunityContent.title")}</TableHead>
                    <TableHead>{t("adminCommunityContent.category")}</TableHead>
                    <TableHead>{t("adminCommunityContent.status")}</TableHead>
                    <TableHead>{t("adminCommunityContent.engagement")}</TableHead>
                    <TableHead>{t("adminCommunityContent.createdAt")}</TableHead>
                    <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredHub.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {t("adminCommunityContent.noPostsFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHub.map((item) => (
                      <TableRow key={item.id} data-testid={`row-hub-${item.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.isPinned && <Star className="h-3 w-3 text-yellow-500" />}
                            {item.isHot && <TrendingUp className="h-3 w-3 text-orange-500" />}
                            <span className="truncate max-w-[200px]">{item.title}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>👍 {item.likes}</span>
                            <span>👁 {item.views}</span>
                            <span>💬 {item.commentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(item.createdAt), "yyyy-MM-dd")}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-hub-${item.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedHub(item); setShowHubDetail(true); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("common.view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditingHub(item); setShowHubForm(true); }}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTarget({ type: "hub", id: item.id, title: item.title }); setShowDeleteConfirm(true); }}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewsForm} onOpenChange={setShowNewsForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingNews ? t("adminCommunityContent.editNews") : t("adminCommunityContent.addNews")}</DialogTitle>
            <DialogDescription>{t("adminCommunityContent.newsFormDesc")}</DialogDescription>
          </DialogHeader>
          <NewsForm
            item={editingNews}
            onSave={(data) => {
              if (editingNews) {
                updateNewsMutation.mutate({ id: editingNews.id, data });
              } else {
                createNewsMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowNewsForm(false); setEditingNews(null); }}
            isLoading={createNewsMutation.isPending || updateNewsMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? t("adminCommunityContent.editEvent") : t("adminCommunityContent.addEvent")}</DialogTitle>
            <DialogDescription>{t("adminCommunityContent.eventFormDesc")}</DialogDescription>
          </DialogHeader>
          <EventForm
            item={editingEvent}
            onSave={(data) => {
              if (editingEvent) {
                updateEventMutation.mutate({ id: editingEvent.id, data });
              } else {
                createEventMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
            isLoading={createEventMutation.isPending || updateEventMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showHubForm} onOpenChange={setShowHubForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingHub ? t("adminCommunityContent.editPost") : t("adminCommunityContent.addPost")}</DialogTitle>
            <DialogDescription>{t("adminCommunityContent.hubFormDesc")}</DialogDescription>
          </DialogHeader>
          <HubPostForm
            item={editingHub}
            onSave={(data) => {
              if (editingHub) {
                updateHubMutation.mutate({ id: editingHub.id, data });
              } else {
                createHubMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowHubForm(false); setEditingHub(null); }}
            isLoading={createHubMutation.isPending || updateHubMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DetailSheet
        open={showNewsDetail}
        onOpenChange={setShowNewsDetail}
        title={selectedNews?.title || ""}
        subtitle={selectedNews?.announcementType?.toUpperCase()}
        icon={<Newspaper className="h-5 w-5" />}
        sections={newsDetailSections}
        actions={[
          { label: t("common.edit"), onClick: () => { setShowNewsDetail(false); setEditingNews(selectedNews); setShowNewsForm(true); } },
          { label: t("common.delete"), variant: "destructive", onClick: () => { setShowNewsDetail(false); if (selectedNews) { setDeleteTarget({ type: "news", id: selectedNews.id, title: selectedNews.title }); setShowDeleteConfirm(true); } } },
        ]}
      />

      <DetailSheet
        open={showEventDetail}
        onOpenChange={setShowEventDetail}
        title={selectedEvent?.title || ""}
        subtitle={selectedEvent?.eventType?.toUpperCase()}
        icon={<Calendar className="h-5 w-5" />}
        sections={eventDetailSections}
        actions={[
          { label: t("common.edit"), onClick: () => { setShowEventDetail(false); setEditingEvent(selectedEvent); setShowEventForm(true); } },
          { label: t("common.delete"), variant: "destructive", onClick: () => { setShowEventDetail(false); if (selectedEvent) { setDeleteTarget({ type: "event", id: selectedEvent.id, title: selectedEvent.title }); setShowDeleteConfirm(true); } } },
        ]}
      />

      <DetailSheet
        open={showHubDetail}
        onOpenChange={setShowHubDetail}
        title={selectedHub?.title || ""}
        subtitle={selectedHub?.category?.toUpperCase()}
        icon={<FileText className="h-5 w-5" />}
        sections={hubDetailSections}
        actions={[
          { label: t("common.edit"), onClick: () => { setShowHubDetail(false); setEditingHub(selectedHub); setShowHubForm(true); } },
          { label: t("common.delete"), variant: "destructive", onClick: () => { setShowHubDetail(false); if (selectedHub) { setDeleteTarget({ type: "hub", id: selectedHub.id, title: selectedHub.title }); setShowDeleteConfirm(true); } } },
        ]}
      />

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("adminCommunityContent.confirmDelete")}
        description={t("adminCommunityContent.confirmDeleteDesc", { title: deleteTarget?.title })}
        actionType="delete"
        onConfirm={handleDelete}
        isLoading={deleteNewsMutation.isPending || deleteEventMutation.isPending || deleteHubMutation.isPending}
      />
    </div>
  );
}
