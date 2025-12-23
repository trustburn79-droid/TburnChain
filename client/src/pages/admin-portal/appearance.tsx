import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Layout,
  RefreshCw,
  Save,
  Eye,
  Languages,
  Maximize2,
  Grid,
  List,
  AlertCircle,
  Sparkles,
  Accessibility,
  Gauge,
  RotateCcw,
  Info,
  Flame,
} from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";

interface AppearanceSettings {
  theme: string;
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  codeFontFamily: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  contentWidth: string;
  defaultViewMode: string;
  language: string;
  showBothLanguages: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  chartAnimationSpeed: string;
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  isLoading = false,
  bgColor = "bg-blue-500/10",
  iconColor = "text-blue-500",
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
  testId?: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs ${
                changeType === "positive" ? "text-green-500" : 
                changeType === "negative" ? "text-red-500" : 
                "text-muted-foreground"
              }`}>
                {change}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Appearance() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [theme, setTheme] = useState("system");
  const [accentColor, setAccentColor] = useState("orange");
  const [fontSize, setFontSize] = useState([14]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "en");
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);

  const { data: appearanceSettings, isLoading, error, refetch } = useQuery<AppearanceSettings>({
    queryKey: ["/api/enterprise/admin/appearance"],
    refetchInterval: 60000,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<AppearanceSettings>) => {
      const response = await apiRequest("POST", "/api/enterprise/admin/appearance", settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/appearance"] });
      setShowSaveConfirmDialog(false);
      toast({
        title: t("adminAppearance.saveSuccess"),
        description: t("adminAppearance.saveSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminAppearance.saveError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/enterprise/admin/appearance/reset");
      return response.json();
    },
    onSuccess: () => {
      setTheme("system");
      setAccentColor("orange");
      setFontSize([14]);
      setSidebarCollapsed(false);
      setLanguage("en");
      setShowResetConfirmDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/appearance"] });
      toast({
        title: t("adminAppearance.resetSuccess"),
        description: t("adminAppearance.resetSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminAppearance.resetError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminAppearance.refreshing"),
      description: t("adminAppearance.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const handlePreview = useCallback(() => {
    toast({
      title: t("adminAppearance.previewApplied"),
      description: t("adminAppearance.previewAppliedDesc"),
    });
  }, [toast, t]);

  const accentColors = [
    { name: "Orange", value: "orange", color: "#f97316" },
    { name: "Blue", value: "blue", color: "#3b82f6" },
    { name: "Green", value: "green", color: "#22c55e" },
    { name: "Purple", value: "purple", color: "#a855f7" },
    { name: "Red", value: "red", color: "#ef4444" },
    { name: "Cyan", value: "cyan", color: "#06b6d4" },
  ];

  const getDetailSections = useCallback((): DetailSection[] => [
    {
      title: t("adminAppearance.detail.themeSettings"),
      fields: [
        { label: t("adminAppearance.theme.title"), value: t(`adminAppearance.themes.${theme}`), type: "text" as const },
        { label: t("adminAppearance.accentColor.title"), value: (accentColor || "orange").charAt(0).toUpperCase() + (accentColor || "orange").slice(1), type: "badge" as const },
        { label: t("adminAppearance.typography.baseFontSize"), value: `${fontSize[0]}px`, type: "text" as const },
      ],
    },
    {
      title: t("adminAppearance.detail.layoutSettings"),
      fields: [
        { label: t("adminAppearance.layout.collapsedSidebar"), value: sidebarCollapsed ? t("common.enabled") : t("common.disabled"), type: "badge" as const, badgeVariant: sidebarCollapsed ? "default" : "secondary" },
        { label: t("adminAppearance.layout.contentWidth"), value: t("adminAppearance.layout.widthFull"), type: "text" as const },
        { label: t("adminAppearance.layout.defaultViewMode"), value: t("adminAppearance.layout.viewGrid"), type: "text" as const },
      ],
    },
    {
      title: t("adminAppearance.detail.languageSettings"),
      fields: [
        { label: t("adminAppearance.language.title"), value: language === 'ko' ? '한국어' : 'English', type: "badge" as const },
        { label: t("adminAppearance.language.showBoth"), value: t("common.enabled"), type: "badge" as const, badgeVariant: "default" },
      ],
    },
    {
      title: t("adminAppearance.detail.displaySettings"),
      fields: [
        { label: t("adminAppearance.display.animations"), value: t("common.enabled"), type: "badge" as const, badgeVariant: "default" },
        { label: t("adminAppearance.display.reducedMotion"), value: t("common.disabled"), type: "badge" as const, badgeVariant: "secondary" },
        { label: t("adminAppearance.display.highContrast"), value: t("common.disabled"), type: "badge" as const, badgeVariant: "secondary" },
        { label: t("adminAppearance.display.chartAnimationSpeed"), value: t("adminAppearance.display.animationNormal"), type: "text" as const },
      ],
    },
  ], [t, theme, accentColor, fontSize, sidebarCollapsed, language]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="appearance-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminAppearance.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminAppearance.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminAppearance.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="appearance-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-appearance-title">
              <Palette className="h-8 w-8" />
              {t("adminAppearance.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-appearance-subtitle">
              {t("adminAppearance.subtitle")} | {i18n.language === 'ko' ? 'Customize the look and feel of the admin portal' : '외관 설정'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowDetailSheet(true)} data-testid="button-view-details">
              <Info className="h-4 w-4 mr-2" />
              {t("adminAppearance.viewDetails")}
            </Button>
            <Button variant="outline" onClick={handlePreview} data-testid="button-preview">
              <Eye className="h-4 w-4 mr-2" />
              {t("adminAppearance.previewButton")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminAppearance.refresh")}
            </Button>
            <Button variant="outline" onClick={() => setShowResetConfirmDialog(true)} data-testid="button-reset">
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("adminAppearance.resetDefaults")}
            </Button>
            <Button onClick={() => setShowSaveConfirmDialog(true)} disabled={saveSettingsMutation.isPending} data-testid="button-save">
              {saveSettingsMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t("adminAppearance.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Palette}
            label={t("adminAppearance.metrics.currentTheme")}
            value={t(`adminAppearance.themes.${theme}`)}
            change="Dark/Light auto-detection"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-purple-500/10"
            iconColor="text-purple-500"
            testId="metric-current-theme"
          />
          <MetricCard
            icon={Sparkles}
            label={t("adminAppearance.metrics.accentColor")}
            value={(accentColor || "orange").charAt(0).toUpperCase() + (accentColor || "orange").slice(1)}
            change="TBURN Brand Identity"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-orange-500/10"
            iconColor="text-orange-500"
            testId="metric-accent-color"
          />
          <MetricCard
            icon={Type}
            label={t("adminAppearance.metrics.fontSize")}
            value={`${fontSize[0]}px`}
            change="Space Grotesk / JetBrains Mono"
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-font-size"
          />
          <MetricCard
            icon={Languages}
            label={t("adminAppearance.metrics.language")}
            value={language === 'ko' ? '한국어' : 'English'}
            change="12 languages / RTL support"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-language"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-theme">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                {t("adminAppearance.theme.title")}
              </CardTitle>
              <CardDescription>{t("adminAppearance.theme.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4" data-testid="radio-theme">
                  <div>
                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                    <Label
                      htmlFor="light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      data-testid="option-theme-light"
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">{t("adminAppearance.theme.light")}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                    <Label
                      htmlFor="dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      data-testid="option-theme-dark"
                    >
                      <Moon className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">{t("adminAppearance.theme.dark")}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="system" id="system" className="peer sr-only" />
                    <Label
                      htmlFor="system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      data-testid="option-theme-system"
                    >
                      <Monitor className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">{t("adminAppearance.theme.system")}</span>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-accent-color">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t("adminAppearance.accentColor.title")}
              </CardTitle>
              <CardDescription>{t("adminAppearance.accentColor.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-6 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-6 gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setAccentColor(color.value)}
                        className={`w-full aspect-square rounded-lg border-2 transition-all ${
                          accentColor === color.value
                            ? "border-foreground scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                        data-testid={`button-color-${color.value}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {t("adminAppearance.accentColor.selected")}: <span className="font-medium capitalize">{accentColor}</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-brand-logo">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {t("adminAppearance.brandLogo.title", { defaultValue: "TBurn Logo Symbol" })}
              </CardTitle>
              <CardDescription>{t("adminAppearance.brandLogo.description", { defaultValue: "Preview logo symbol with various background and symbol color combinations" })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Default gradient on dark */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-gray-900 flex items-center justify-center" data-testid="logo-dark-gradient">
                    <TBurnLogo className="w-10 h-10" />
                  </div>
                  <span className="text-xs text-muted-foreground">Dark + Gradient</span>
                </div>
                {/* Default gradient on white */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center" data-testid="logo-light-gradient">
                    <TBurnLogo className="w-10 h-10" />
                  </div>
                  <span className="text-xs text-muted-foreground">Light + Gradient</span>
                </div>
                {/* Orange on black */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center" data-testid="logo-black-orange">
                    <TBurnLogo className="w-10 h-10" symbolColor="#FF6B35" />
                  </div>
                  <span className="text-xs text-muted-foreground">Black + Orange</span>
                </div>
                {/* Yellow on dark blue */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-blue-900 flex items-center justify-center" data-testid="logo-blue-yellow">
                    <TBurnLogo className="w-10 h-10" symbolColor="#FFD700" />
                  </div>
                  <span className="text-xs text-muted-foreground">Navy + Gold</span>
                </div>
                {/* White on orange */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-orange-500 flex items-center justify-center" data-testid="logo-orange-white">
                    <TBurnLogo className="w-10 h-10" symbolColor="#FFFFFF" />
                  </div>
                  <span className="text-xs text-muted-foreground">Orange + White</span>
                </div>
                {/* Black on yellow */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-yellow-400 flex items-center justify-center" data-testid="logo-yellow-black">
                    <TBurnLogo className="w-10 h-10" symbolColor="#000000" />
                  </div>
                  <span className="text-xs text-muted-foreground">Yellow + Black</span>
                </div>
                {/* Gradient on purple */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-purple-900 flex items-center justify-center" data-testid="logo-purple-gradient">
                    <TBurnLogo className="w-10 h-10" />
                  </div>
                  <span className="text-xs text-muted-foreground">Purple + Gradient</span>
                </div>
                {/* Red on dark */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center" data-testid="logo-dark-red">
                    <TBurnLogo className="w-10 h-10" symbolColor="#EF4444" />
                  </div>
                  <span className="text-xs text-muted-foreground">Dark + Red</span>
                </div>
                {/* Cyan on dark */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center" data-testid="logo-slate-cyan">
                    <TBurnLogo className="w-10 h-10" symbolColor="#06B6D4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Slate + Cyan</span>
                </div>
                {/* Green on dark */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center" data-testid="logo-zinc-green">
                    <TBurnLogo className="w-10 h-10" symbolColor="#22C55E" />
                  </div>
                  <span className="text-xs text-muted-foreground">Zinc + Green</span>
                </div>
                {/* White on red */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-red-600 flex items-center justify-center" data-testid="logo-red-white">
                    <TBurnLogo className="w-10 h-10" symbolColor="#FFFFFF" />
                  </div>
                  <span className="text-xs text-muted-foreground">Red + White</span>
                </div>
                {/* Default on transparent pattern */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center" data-testid="logo-brand-white">
                    <TBurnLogo className="w-10 h-10" symbolColor="#FFFFFF" />
                  </div>
                  <span className="text-xs text-muted-foreground">Brand + White</span>
                </div>
                {/* Cyan background + Orange */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl bg-cyan-500 flex items-center justify-center" data-testid="logo-cyan-orange">
                    <TBurnLogo className="w-10 h-10" symbolColor="#FF6B35" textColor="#FFFFFF" />
                  </div>
                  <span className="text-xs text-muted-foreground">Cyan + Orange</span>
                </div>
              </div>
              
              {/* White T variants section */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium mb-4">{t("adminAppearance.brandLogo.whiteT", { defaultValue: "White T Variants" })}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Dark + Orange with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-gray-900 flex items-center justify-center" data-testid="logo-wt-dark-orange">
                      <TBurnLogo className="w-10 h-10" symbolColor="#FF6B35" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Dark + Orange</span>
                  </div>
                  {/* Black + Gold with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center" data-testid="logo-wt-black-gold">
                      <TBurnLogo className="w-10 h-10" symbolColor="#FFD700" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Black + Gold</span>
                  </div>
                  {/* Navy + Cyan with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-blue-950 flex items-center justify-center" data-testid="logo-wt-navy-cyan">
                      <TBurnLogo className="w-10 h-10" symbolColor="#06B6D4" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Navy + Cyan</span>
                  </div>
                  {/* Purple + Pink with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-purple-900 flex items-center justify-center" data-testid="logo-wt-purple-pink">
                      <TBurnLogo className="w-10 h-10" symbolColor="#EC4899" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Purple + Pink</span>
                  </div>
                  {/* Emerald + Lime with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-emerald-900 flex items-center justify-center" data-testid="logo-wt-emerald-lime">
                      <TBurnLogo className="w-10 h-10" symbolColor="#84CC16" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Emerald + Lime</span>
                  </div>
                  {/* Slate + Blue with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center" data-testid="logo-wt-slate-blue">
                      <TBurnLogo className="w-10 h-10" symbolColor="#3B82F6" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Slate + Blue</span>
                  </div>
                  {/* Zinc + Amber with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center" data-testid="logo-wt-zinc-amber">
                      <TBurnLogo className="w-10 h-10" symbolColor="#F59E0B" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Zinc + Amber</span>
                  </div>
                  {/* Stone + Rose with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-stone-800 flex items-center justify-center" data-testid="logo-wt-stone-rose">
                      <TBurnLogo className="w-10 h-10" symbolColor="#F43F5E" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Stone + Rose</span>
                  </div>
                  {/* Indigo + Violet with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-indigo-900 flex items-center justify-center" data-testid="logo-wt-indigo-violet">
                      <TBurnLogo className="w-10 h-10" symbolColor="#8B5CF6" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Indigo + Violet</span>
                  </div>
                  {/* Teal + Sky with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-teal-900 flex items-center justify-center" data-testid="logo-wt-teal-sky">
                      <TBurnLogo className="w-10 h-10" symbolColor="#0EA5E9" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Teal + Sky</span>
                  </div>
                  {/* Red + Orange with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-red-900 flex items-center justify-center" data-testid="logo-wt-red-orange">
                      <TBurnLogo className="w-10 h-10" symbolColor="#FB923C" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Red + Orange</span>
                  </div>
                  {/* Gradient Dark + Gradient with White T */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center" data-testid="logo-wt-gradient-dark">
                      <TBurnLogo className="w-10 h-10" textColor="#FFFFFF" fontSize={17} />
                    </div>
                    <span className="text-xs text-muted-foreground">Gradient + White T</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-typography">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                {t("adminAppearance.typography.title")}
              </CardTitle>
              <CardDescription>{t("adminAppearance.typography.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t("adminAppearance.typography.baseFontSize")}</Label>
                      <span className="text-sm text-muted-foreground">{fontSize[0]}px</span>
                    </div>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={12}
                      max={18}
                      step={1}
                      data-testid="slider-font-size"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label data-testid="label-font-family">{t("adminAppearance.typography.fontFamily")}</Label>
                    <Select defaultValue="space-grotesk">
                      <SelectTrigger data-testid="select-font-family">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="space-grotesk">{t("adminAppearance.typography.fontSpaceGrotesk")}</SelectItem>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="system">{t("adminAppearance.typography.fontSystem")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label data-testid="label-code-font">{t("adminAppearance.typography.codeFont")}</Label>
                    <Select defaultValue="jetbrains-mono">
                      <SelectTrigger data-testid="select-code-font">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jetbrains-mono">{t("adminAppearance.typography.fontJetBrains")}</SelectItem>
                        <SelectItem value="fira-code">Fira Code</SelectItem>
                        <SelectItem value="source-code">Source Code Pro</SelectItem>
                        <SelectItem value="monospace">{t("adminAppearance.typography.fontMonospace")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-layout">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                {t("adminAppearance.layout.title")}
              </CardTitle>
              <CardDescription>{t("adminAppearance.layout.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("adminAppearance.layout.collapsedSidebar")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminAppearance.layout.collapsedSidebarDesc")}</p>
                    </div>
                    <Switch checked={sidebarCollapsed} onCheckedChange={setSidebarCollapsed} data-testid="switch-collapsed-sidebar" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("adminAppearance.layout.compactMode")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminAppearance.layout.compactModeDesc")}</p>
                    </div>
                    <Switch data-testid="switch-compact-mode" />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label data-testid="label-content-width">{t("adminAppearance.layout.contentWidth")}</Label>
                    <Select defaultValue="full">
                      <SelectTrigger data-testid="select-content-width">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="narrow">{t("adminAppearance.layout.widthNarrow")}</SelectItem>
                        <SelectItem value="default">{t("adminAppearance.layout.widthDefault")}</SelectItem>
                        <SelectItem value="wide">{t("adminAppearance.layout.widthWide")}</SelectItem>
                        <SelectItem value="full">{t("adminAppearance.layout.widthFull")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminAppearance.layout.defaultViewMode")}</Label>
                    <RadioGroup defaultValue="grid" className="flex gap-4" data-testid="radio-view-mode">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grid" id="grid" />
                        <Label htmlFor="grid" className="flex items-center gap-1 cursor-pointer">
                          <Grid className="h-4 w-4" />
                          {t("adminAppearance.layout.viewGrid")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="list" id="list" />
                        <Label htmlFor="list" className="flex items-center gap-1 cursor-pointer">
                          <List className="h-4 w-4" />
                          {t("adminAppearance.layout.viewList")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-language">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                {t("adminAppearance.language.title")}
              </CardTitle>
              <CardDescription>{t("adminAppearance.language.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <RadioGroup value={language} onValueChange={setLanguage} className="space-y-2" data-testid="radio-language">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg" data-testid="option-language-en">
                      <RadioGroupItem value="en" id="en" />
                      <Label htmlFor="en" className="flex-1 cursor-pointer">
                        <span className="font-medium">English</span>
                        <p className="text-sm text-muted-foreground">{t("adminAppearance.language.englishDesc")}</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg" data-testid="option-language-ko">
                      <RadioGroupItem value="ko" id="ko" />
                      <Label htmlFor="ko" className="flex-1 cursor-pointer">
                        <span className="font-medium">한국어 (Korean)</span>
                        <p className="text-sm text-muted-foreground">{t("adminAppearance.language.koreanDesc")}</p>
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="option-show-both-languages">
                    <div>
                      <p className="font-medium">{t("adminAppearance.language.showBoth")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminAppearance.language.showBothDesc")}</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-show-both-languages" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-display">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                {t("adminAppearance.display.title")}
              </CardTitle>
              <CardDescription>{t("adminAppearance.display.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("adminAppearance.display.animations")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminAppearance.display.animationsDesc")}</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-animations" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("adminAppearance.display.reducedMotion")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminAppearance.display.reducedMotionDesc")}</p>
                    </div>
                    <Switch data-testid="switch-reduced-motion" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("adminAppearance.display.highContrast")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminAppearance.display.highContrastDesc")}</p>
                    </div>
                    <Switch data-testid="switch-high-contrast" />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label data-testid="label-chart-animation">{t("adminAppearance.display.chartAnimationSpeed")}</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger data-testid="select-chart-animation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">{t("adminAppearance.display.animationOff")}</SelectItem>
                        <SelectItem value="slow">{t("adminAppearance.display.animationSlow")}</SelectItem>
                        <SelectItem value="normal">{t("adminAppearance.display.animationNormal")}</SelectItem>
                        <SelectItem value="fast">{t("adminAppearance.display.animationFast")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-preview">
          <CardHeader>
            <CardTitle>{t("adminAppearance.preview.title")}</CardTitle>
            <CardDescription>{t("adminAppearance.preview.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 border rounded-lg bg-muted/30 space-y-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: accentColors.find(c => c.value === accentColor)?.color }}
                >
                  <Palette className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ fontSize: `${fontSize[0] + 4}px` }}>
                    TBURN Admin Portal
                  </h3>
                  <p className="text-muted-foreground" style={{ fontSize: `${fontSize[0]}px` }}>
                    {t("adminAppearance.preview.tagline")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" style={{ backgroundColor: accentColors.find(c => c.value === accentColor)?.color }} data-testid="preview-button-primary">
                  {t("adminAppearance.preview.primaryButton")}
                </Button>
                <Button size="sm" variant="outline" data-testid="preview-button-secondary">
                  {t("adminAppearance.preview.secondaryButton")}
                </Button>
                <Button size="sm" variant="ghost" data-testid="preview-button-ghost">
                  {t("adminAppearance.preview.ghostButton")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DetailSheet
        open={showDetailSheet}
        onOpenChange={setShowDetailSheet}
        title={t("adminAppearance.detail.title")}
        description={t("adminAppearance.detail.description")}
        sections={getDetailSections()}
      />

      <ConfirmationDialog
        open={showSaveConfirmDialog}
        onOpenChange={setShowSaveConfirmDialog}
        title={t("adminAppearance.confirm.saveTitle")}
        description={t("adminAppearance.confirm.saveDescription")}
        confirmText={t("adminAppearance.confirm.save")}
        cancelText={t("adminAppearance.confirm.cancel")}
        onConfirm={() => saveSettingsMutation.mutate({ theme, accentColor, fontSize: fontSize[0] })}
        isLoading={saveSettingsMutation.isPending}
      />

      <ConfirmationDialog
        open={showResetConfirmDialog}
        onOpenChange={setShowResetConfirmDialog}
        title={t("adminAppearance.confirm.resetTitle")}
        description={t("adminAppearance.confirm.resetDescription")}
        confirmText={t("adminAppearance.confirm.reset")}
        cancelText={t("adminAppearance.confirm.cancel")}
        onConfirm={() => resetSettingsMutation.mutate()}
        isLoading={resetSettingsMutation.isPending}
        destructive
      />
    </div>
  );
}
