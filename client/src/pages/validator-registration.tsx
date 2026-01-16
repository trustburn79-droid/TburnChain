/**
 * TBURN Genesis Validator BYO Registration Portal
 * Production-grade registration for validators who generate their own keys offline
 * Chain ID: 5800 | TBURN Mainnet
 * 
 * Features:
 * - React Hook Form + Zod validation
 * - Session storage persistence
 * - Page exit prevention
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ArrowRight,
  ArrowLeft,
  Globe,
  Zap,
  Lock,
  FileKey,
  Building,
  Mail,
  User,
  Loader2,
  AlertOctagon,
  ShieldAlert,
  KeyRound,
  ExternalLink,
  CheckCircle,
  XCircle,
  Terminal,
  Coins,
  Percent,
  TrendingUp,
} from "lucide-react";
import { 
  House,
  ListDashes,
  TreeStructure,
  Coins as CoinsIcon,
  ShieldCheck,
  Users,
  ChartLineUp,
} from "@phosphor-icons/react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TBurnLogo } from "@/components/tburn-logo";

type RegistrationStep = 1 | 2 | 3;

interface TierConfig {
  key: string;
  stake: number;
  commission: number;
  apy: string;
  slots: number;
  color: string;
}

const TIER_CONFIGS: Record<string, TierConfig> = {
  core: {
    key: "core",
    stake: 1000000,
    commission: 3,
    apy: "20-25%",
    slots: 10,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  enterprise: {
    key: "enterprise",
    stake: 500000,
    commission: 8,
    apy: "16-20%",
    slots: 25,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  partner: {
    key: "partner",
    stake: 250000,
    commission: 15,
    apy: "14-18%",
    slots: 40,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  community: {
    key: "community",
    stake: 100000,
    commission: 20,
    apy: "12-15%",
    slots: 50,
    color: "text-green-500 bg-green-500/10 border-green-500/30",
  },
};

interface RegistrationFormData {
  name: string;
  publicKey: string;
  tier: string;
  description: string;
  website: string;
  contactEmail: string;
  nodeEndpoint: string;
  invitationCode: string;
}

interface TierQuota {
  tier: string;
  total: number;
  registered: number;
  remaining: number;
  isFull: boolean;
}

interface QuotasResponse {
  success: boolean;
  data: {
    quotas: TierQuota[];
    summary: {
      totalSlots: number;
      totalRegistered: number;
      totalRemaining: number;
    };
  };
}

interface StatusResponse {
  success: boolean;
  data: {
    totalCount: number;
    targetCount: number;
    isComplete: boolean;
  };
}

interface InvitationValidation {
  valid: boolean;
  tier: string;
  remainingSlots: number;
  expiresAt: string | null;
}

interface BackupChecklist {
  coldStorage: boolean;
  multipleBackups: boolean;
  encrypted: boolean;
  recoveryTested: boolean;
}

// Storage key for session persistence
const STORAGE_KEY = "tburn_validator_registration_draft";

// Zod validation schema for the registration form
const registrationSchema = z.object({
  name: z.string()
    .min(3, "Validator name must be at least 3 characters")
    .max(50, "Validator name must be at most 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Only alphanumeric characters, spaces, hyphens and underscores allowed"),
  publicKey: z.string()
    .refine((key) => {
      const clean = key.replace(/^0x/, "");
      return /^[0-9a-fA-F]{66}$/.test(clean) || /^[0-9a-fA-F]{130}$/.test(clean);
    }, "Invalid public key format. Must be 33-byte compressed or 65-byte uncompressed hex"),
  tier: z.string().min(1, "Please select a tier"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  contactEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  nodeEndpoint: z.string().url("Invalid endpoint URL").optional().or(z.literal("")),
  invitationCode: z.string()
    .min(1, "Invitation code is required")
    .regex(/^TB-[A-Z]{2}-[A-Z0-9]{16}$/, "Invalid invitation code format"),
});

type RegistrationSchemaType = z.infer<typeof registrationSchema>;

// Load saved draft from localStorage
const loadDraft = (): Partial<RegistrationFormData & { currentStep: number; backupChecklist: BackupChecklist }> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load draft:", e);
  }
  return {};
};

// Save draft to localStorage
const saveDraft = (data: {
  formData: RegistrationFormData;
  currentStep: number;
  backupChecklist: BackupChecklist;
}) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data.formData,
      currentStep: data.currentStep,
      backupChecklist: data.backupChecklist,
    }));
  } catch (e) {
    console.warn("Failed to save draft:", e);
  }
};

// Clear draft from localStorage
const clearDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear draft:", e);
  }
};

export default function ValidatorRegistration() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Load saved draft on initial mount
  const savedDraft = loadDraft();
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(
    (savedDraft.currentStep as RegistrationStep) || 1
  );
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [backupChecklist, setBackupChecklist] = useState<BackupChecklist>(
    savedDraft.backupChecklist || {
      coldStorage: false,
      multipleBackups: false,
      encrypted: false,
      recoveryTested: false,
    }
  );

  const [formData, setFormData] = useState<RegistrationFormData>({
    name: savedDraft.name || "",
    publicKey: savedDraft.publicKey || "",
    tier: savedDraft.tier || "",
    description: savedDraft.description || "",
    website: savedDraft.website || "",
    contactEmail: savedDraft.contactEmail || "",
    nodeEndpoint: savedDraft.nodeEndpoint || "",
    invitationCode: savedDraft.invitationCode || "",
  });

  const [invitationValidated, setInvitationValidated] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationValidation | null>(null);

  // Auto-save draft when form data changes
  useEffect(() => {
    const hasContent = formData.name || formData.publicKey || formData.invitationCode;
    if (hasContent) {
      saveDraft({ formData, currentStep, backupChecklist });
      setHasUnsavedChanges(true);
    } else if (hasUnsavedChanges) {
      // If all key fields are empty but we had unsaved changes, clear the draft
      clearDraft();
      setHasUnsavedChanges(false);
    }
  }, [formData, currentStep, backupChecklist, hasUnsavedChanges]);

  // Page exit prevention - warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !registrationComplete) {
        e.preventDefault();
        e.returnValue = t("validatorRegistration.exitWarning", { 
          defaultValue: "You have unsaved changes. Are you sure you want to leave?" 
        });
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, registrationComplete, t]);

  // Show draft restoration toast on mount if draft exists
  useEffect(() => {
    if (savedDraft.name || savedDraft.publicKey) {
      toast({
        title: t("validatorRegistration.toasts.draftRestored", { defaultValue: "Draft Restored" }),
        description: t("validatorRegistration.toasts.draftRestoredDesc", { 
          defaultValue: "Your previous progress has been restored." 
        }),
      });
    }
  }, []); // Only run on mount

  const { data: statusData } = useQuery<StatusResponse>({
    queryKey: ["/api/genesis-validators/status"],
  });

  const { data: quotasData } = useQuery<QuotasResponse>({
    queryKey: ["/api/invitation-codes/quotas"],
    refetchInterval: 30000,
  });

  const { data: networkStats } = useQuery<{
    tps: number;
    currentBlockHeight: number;
    activeValidators: number;
  }>({
    queryKey: ["/api/network/stats"],
    staleTime: 5000,
    refetchInterval: 10000,
  });

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
  const currentTps = networkStats?.tps || 210000;
  const currentEpoch = networkStats?.currentBlockHeight ? Math.floor(networkStats.currentBlockHeight / 100000) : 394;

  const validateInvitationMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/invitation-codes/validate", { code });
      return response.json();
    },
    onSuccess: (result: any) => {
      if (result.success && result.data.valid) {
        setInvitationValidated(true);
        setInvitationData(result.data);
        setFormData(prev => ({ ...prev, tier: result.data.tier }));
        toast({
          title: t("validatorRegistration.toasts.invitationValid"),
          description: t("validatorRegistration.toasts.invitationValidDesc", { tier: result.data.tier }),
        });
      } else {
        setInvitationValidated(false);
        setInvitationData(null);
        toast({
          title: t("validatorRegistration.toasts.invitationInvalid"),
          description: result.error || t("validatorRegistration.toasts.invitationInvalidDesc"),
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setInvitationValidated(false);
      setInvitationData(null);
      toast({
        title: t("validatorRegistration.toasts.invitationError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await apiRequest("POST", "/api/genesis-validators/register", {
        name: data.name,
        publicKey: data.publicKey,
        tier: data.tier,
        description: data.description || undefined,
        website: data.website || undefined,
        contactEmail: data.contactEmail || undefined,
        nodeEndpoint: data.nodeEndpoint || undefined,
        invitationCode: data.invitationCode,
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      if (result.success) {
        setRegistrationResult(result.data);
        setRegistrationComplete(true);
        setHasUnsavedChanges(false);
        clearDraft(); // Clear saved draft on successful registration
        toast({
          title: t("validatorRegistration.toasts.registrationSuccess"),
          description: `${result.data.name}`,
        });
      } else {
        toast({
          title: t("validatorRegistration.toasts.registrationFailed"),
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t("validatorRegistration.toasts.registrationError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFormData = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateBackupChecklist = (field: keyof BackupChecklist, value: boolean) => {
    setBackupChecklist((prev) => ({ ...prev, [field]: value }));
  };

  const allBackupsConfirmed = Object.values(backupChecklist).every((v) => v);

  const isValidPublicKey = (key: string): boolean => {
    const clean = key.replace(/^0x/, "");
    return /^[0-9a-fA-F]{66}$/.test(clean) || /^[0-9a-fA-F]{130}$/.test(clean);
  };

  const validateStep = (step: RegistrationStep): boolean => {
    switch (step) {
      case 1:
        return allBackupsConfirmed && isValidPublicKey(formData.publicKey) && invitationValidated;
      case 2:
        return formData.name.length >= 3 && formData.tier.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleValidateInvitation = () => {
    if (formData.invitationCode.trim().length > 0) {
      validateInvitationMutation.mutate(formData.invitationCode.trim());
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3) as RegistrationStep);
    } else {
      if (currentStep === 1) {
        if (!allBackupsConfirmed) {
          toast({
            title: t("validatorRegistration.toasts.backupRequired"),
            description: t("validatorRegistration.toasts.backupRequiredDesc"),
            variant: "destructive",
          });
        } else if (!isValidPublicKey(formData.publicKey)) {
          toast({
            title: t("validatorRegistration.toasts.invalidPublicKey"),
            description: t("validatorRegistration.toasts.invalidPublicKeyDesc"),
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: t("validatorRegistration.toasts.validationError"),
          description: t("validatorRegistration.toasts.validationErrorDesc"),
          variant: "destructive",
        });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as RegistrationStep);
  };

  const handleSubmit = () => {
    if (validateStep(1) && validateStep(2)) {
      registerMutation.mutate(formData);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ 
      title: t("validatorRegistration.toasts.copied"), 
      description: t("validatorRegistration.toasts.copiedDesc") 
    });
  };

  const selectedTier = TIER_CONFIGS[formData.tier];

  if (registrationComplete && registrationResult) {
    return (
      <div className="min-h-screen text-slate-300" style={{
        fontFamily: "'Outfit', 'Noto Sans KR', sans-serif",
        backgroundColor: '#050509',
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(5, 5, 9, 1))',
      }}>
        <style>{`
          .glass-panel {
            background: rgba(20, 20, 35, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          }
          .glass-panel:hover {
            border-color: rgba(245, 158, 11, 0.3);
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);
          }
          .bg-mesh {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 400px;
            background: radial-gradient(circle at 50% -20%, #1e1b4b 0%, transparent 60%);
            z-index: 0;
            pointer-events: none;
          }
        `}</style>

        <div className="bg-mesh" />

        <div className="max-w-[1600px] mx-auto p-6 lg:p-10 relative z-10">
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 border-b border-white/5 pb-6 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <TBurnLogo className="w-10 h-10" showText={false} />
                <h1 className="text-4xl font-bold text-white tracking-wide" data-testid="page-title">
                  {t('validatorRegistration.header.title', { defaultValue: 'Validator' })} <span className="font-light text-slate-400">{t('validatorRegistration.header.subtitle', { defaultValue: 'Registration' })}</span>
                </h1>
              </div>
              <p className="text-sm text-slate-400 font-mono tracking-wider uppercase pl-1">
                {t('validatorRegistration.header.tagline', { defaultValue: 'BYO Key Registration / TBURN Mainnet' })}
              </p>
            </div>
            
            <div className="flex gap-4 flex-wrap items-center">
              <LanguageSelector isDark={true} />
              <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition" data-testid="link-home">
                <House size={20} weight="duotone" className="text-slate-300" />
              </Link>
              <Link href="/validator" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-orange-400/50 transition text-sm font-medium" data-testid="link-validator">
                <ListDashes className="text-orange-400" weight="duotone" size={18} />
                {t('validatorRegistration.header.validatorList', { defaultValue: 'Validator List' })}
              </Link>
              <Link href="/app/staking" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-purple-500/50 transition text-sm font-medium" data-testid="link-staking">
                <ChartLineUp className="text-purple-400" weight="duotone" size={18} />
                {t('validatorRegistration.header.staking', { defaultValue: 'Staking' })}
              </Link>
              <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
                <span className="text-xs text-slate-500 uppercase font-bold">{t('validatorRegistration.header.networkTps', { defaultValue: 'Network TPS' })}</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono" data-testid="network-tps">{formatNumber(currentTps)}</span>
              </div>
            </div>
          </header>

          <div className="max-w-2xl mx-auto space-y-4">
            <Card className="border-green-500/30 glass-panel">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-white">{t("validatorRegistration.completion.title")}</CardTitle>
                <CardDescription className="text-slate-400">
                  {t("validatorRegistration.completion.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t("validatorRegistration.completion.validatorName")}</span>
                    <span className="font-medium text-white">{registrationResult.name}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t("validatorRegistration.completion.tburnAddress")}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-emerald-400">
                        {registrationResult.address}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(registrationResult.address)}
                        data-testid="button-copy-address"
                        className="text-slate-300 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t("validatorRegistration.completion.tier")}</span>
                    <Badge className={TIER_CONFIGS[registrationResult.tier]?.color}>
                      {t(`validatorRegistration.tiers.${registrationResult.tier}.name`)}
                    </Badge>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t("validatorRegistration.completion.initialStake")}</span>
                    <span className="font-bold text-amber-400">
                      {(Number(registrationResult.initialStake) / 1e18).toLocaleString()} TBURN
                    </span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t("validatorRegistration.completion.commission")}</span>
                    <span className="text-white">{(registrationResult.commission / 100).toFixed(1)}%</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t("validatorRegistration.completion.estimatedApy")}</span>
                    <span className="text-emerald-400 font-medium">{registrationResult.estimatedAPY}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t("validatorRegistration.completion.status")}</span>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                      {t("validatorRegistration.completion.pendingVerification")}
                    </Badge>
                  </div>
                </div>

                <Alert className="border-blue-500/30 bg-blue-500/10">
                  <AlertTriangle className="h-5 w-5 text-blue-400" />
                  <AlertTitle className="text-blue-400">{t("validatorRegistration.completion.nextStepsTitle")}</AlertTitle>
                  <AlertDescription className="text-slate-300">
                    <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                      {registrationResult.nextSteps?.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </AlertDescription>
                </Alert>

                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertOctagon className="h-5 w-5 text-red-400" />
                  <AlertTitle className="text-red-400">{t("validatorRegistration.completion.keepPrivateKeySafe")}</AlertTitle>
                  <AlertDescription className="text-sm text-slate-300">
                    {t("validatorRegistration.completion.keepPrivateKeySafeText")}
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-slate-300 hover:text-white hover:bg-white/10"
                  onClick={() => window.location.href = "/validator"}
                  data-testid="button-view-validators"
                >
                  {t("validatorRegistration.buttons.viewValidators")}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  onClick={() => {
                    clearDraft(); // Clear any saved draft
                    setHasUnsavedChanges(false);
                    setRegistrationComplete(false);
                    setRegistrationResult(null);
                    setCurrentStep(1);
                    setFormData({
                      name: "",
                      publicKey: "",
                      tier: "",
                      description: "",
                      website: "",
                      contactEmail: "",
                      nodeEndpoint: "",
                      invitationCode: "",
                    });
                    setInvitationValidated(false);
                    setInvitationData(null);
                    setBackupChecklist({
                      coldStorage: false,
                      multipleBackups: false,
                      encrypted: false,
                      recoveryTested: false,
                    });
                  }}
                  data-testid="button-register-another"
                >
                  {t("validatorRegistration.buttons.registerAnother")}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-300" style={{
      fontFamily: "'Outfit', 'Noto Sans KR', sans-serif",
      backgroundColor: '#050509',
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(5, 5, 9, 1))',
    }}>
      <style>{`
        .glass-panel {
          background: rgba(20, 20, 35, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        .glass-panel:hover {
          border-color: rgba(245, 158, 11, 0.3);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);
        }
        .bg-mesh {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 400px;
          background: radial-gradient(circle at 50% -20%, #1e1b4b 0%, transparent 60%);
          z-index: 0;
          pointer-events: none;
        }
      `}</style>

      <div className="bg-mesh" />

      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 relative z-10">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 border-b border-white/5 pb-6 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <TBurnLogo className="w-10 h-10" showText={false} />
              <h1 className="text-4xl font-bold text-white tracking-wide" data-testid="page-title">
                {t('validatorRegistration.header.title', { defaultValue: 'Validator' })} <span className="font-light text-slate-400">{t('validatorRegistration.header.subtitle', { defaultValue: 'Registration' })}</span>
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-mono tracking-wider uppercase pl-1">
              {t('validatorRegistration.header.tagline', { defaultValue: 'BYO Key Registration / TBURN Mainnet' })}
            </p>
          </div>
          
          <div className="flex gap-4 flex-wrap items-center">
            <LanguageSelector isDark={true} />
            <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition" data-testid="link-home">
              <House size={20} weight="duotone" className="text-slate-300" />
            </Link>
            <Link href="/validator" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-orange-400/50 transition text-sm font-medium" data-testid="link-validator">
              <ListDashes className="text-orange-400" weight="duotone" size={18} />
              {t('validatorRegistration.header.validatorList', { defaultValue: 'Validator List' })}
            </Link>
            <Link href="/validator/infrastructure" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-cyan-400/50 transition text-sm font-medium" data-testid="link-infrastructure">
              <TreeStructure className="text-cyan-400" weight="duotone" size={18} />
              {t('validatorRegistration.header.infrastructure', { defaultValue: 'Infrastructure' })}
            </Link>
            <Link href="/validator-governance" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-amber-500/50 transition text-sm font-medium" data-testid="link-governance">
              <CoinsIcon className="text-amber-400" weight="duotone" size={18} />
              {t('validatorRegistration.header.governance', { defaultValue: 'Governance & Rewards' })}
            </Link>
            <Link href="/external-validator-program" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-emerald-500/50 transition text-sm font-medium" data-testid="link-external-validators">
              <ShieldCheck className="text-emerald-400" weight="duotone" size={18} />
              {t('validatorRegistration.header.externalProgram', { defaultValue: 'External Program' })}
            </Link>
            <Link href="/app/staking" className="glass-panel px-5 py-3 rounded-lg flex items-center gap-2 hover:border-purple-500/50 transition text-sm font-medium" data-testid="link-staking">
              <ChartLineUp className="text-purple-400" weight="duotone" size={18} />
              {t('validatorRegistration.header.staking', { defaultValue: 'Staking' })}
            </Link>
            <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">{t('validatorRegistration.header.networkTps', { defaultValue: 'Network TPS' })}</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono" data-testid="network-tps">{formatNumber(currentTps)}</span>
            </div>
            <div className="glass-panel px-6 py-3 rounded-lg flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">{t('validatorRegistration.header.epoch', { defaultValue: 'Epoch' })}</span>
              <span className="text-2xl font-bold text-amber-400 font-mono" data-testid="current-epoch">{currentEpoch}</span>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="mb-2 bg-white/5 border-white/20 text-slate-300">{t("validatorRegistration.chainId")}</Badge>
            <h2 className="text-2xl font-bold text-white">{t("validatorRegistration.title")}</h2>
            <p className="text-slate-400">
              {t("validatorRegistration.subtitle")}
            </p>
            {statusData?.data && (
              <div className="flex justify-center gap-4 mt-4">
                <Badge variant="secondary" className="bg-white/10 text-slate-300">
                  {t("validatorRegistration.validatorsCount", { 
                    current: statusData.data.totalCount, 
                    target: statusData.data.targetCount 
                  })}
                </Badge>
                {statusData.data.isComplete && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                    {t("validatorRegistration.genesisComplete")}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
              1. {t("validatorRegistration.progress.step1")}
            </span>
            <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
              2. {t("validatorRegistration.progress.step2")}
            </span>
            <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>
              3. {t("validatorRegistration.progress.step3")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={(currentStep / 3) * 100} className="h-2 flex-1" />
            {hasUnsavedChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearDraft();
                  setHasUnsavedChanges(false);
                  setCurrentStep(1);
                  setFormData({
                    name: "",
                    publicKey: "",
                    tier: "",
                    description: "",
                    website: "",
                    contactEmail: "",
                    nodeEndpoint: "",
                    invitationCode: "",
                  });
                  setInvitationValidated(false);
                  setInvitationData(null);
                  setBackupChecklist({
                    coldStorage: false,
                    multipleBackups: false,
                    encrypted: false,
                    recoveryTested: false,
                  });
                  toast({
                    title: t("validatorRegistration.toasts.draftCleared", { defaultValue: "Draft Cleared" }),
                    description: t("validatorRegistration.toasts.draftClearedDesc", { defaultValue: "Your saved draft has been removed." }),
                  });
                }}
                className="text-muted-foreground hover:text-destructive text-xs"
                data-testid="button-clear-draft"
              >
                <XCircle className="w-3 h-3 mr-1" />
                {t("validatorRegistration.buttons.clearDraft", { defaultValue: "Clear Draft" })}
              </Button>
            )}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <Alert variant="destructive" className="border-2 border-red-500 bg-red-500/10">
              <AlertOctagon className="h-5 w-5" />
              <AlertTitle className="text-lg font-bold">
                {t("validatorRegistration.security.criticalTitle")}
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p className="font-semibold">
                  {t("validatorRegistration.security.criticalDescription")}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t("validatorRegistration.security.warnings.generateOffline")}</li>
                  <li>{t("validatorRegistration.security.warnings.neverShare")}</li>
                  <li>{t("validatorRegistration.security.warnings.cannotRecover")}</li>
                  <li>{t("validatorRegistration.security.warnings.publicKeyOnly")}</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  {t("validatorRegistration.keyGeneration.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="nodejs" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="nodejs" data-testid="tab-nodejs">{t("validatorRegistration.keyGeneration.tabs.nodejs")}</TabsTrigger>
                    <TabsTrigger value="openssl" data-testid="tab-openssl">{t("validatorRegistration.keyGeneration.tabs.openssl")}</TabsTrigger>
                    <TabsTrigger value="hardware" data-testid="tab-hardware">{t("validatorRegistration.keyGeneration.tabs.hardware")}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="nodejs" className="mt-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">1</span>
                          <div>
                            <p className="font-medium">{t("validatorRegistration.keyGeneration.steps.step1Title")}</p>
                            <p className="text-muted-foreground text-xs">{t("validatorRegistration.keyGeneration.steps.step1Desc")}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">2</span>
                          <div>
                            <p className="font-medium">{t("validatorRegistration.keyGeneration.steps.step2Title")}</p>
                            <p className="text-muted-foreground text-xs">{t("validatorRegistration.keyGeneration.steps.step2Desc")}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">3</span>
                          <div>
                            <p className="font-medium">{t("validatorRegistration.keyGeneration.steps.step3Title")}</p>
                            <p className="text-muted-foreground text-xs">{t("validatorRegistration.keyGeneration.steps.step3Desc")}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">4</span>
                          <div>
                            <p className="font-medium">{t("validatorRegistration.keyGeneration.steps.step4Title")}</p>
                            <p className="text-muted-foreground text-xs">{t("validatorRegistration.keyGeneration.steps.step4Desc")}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> generate-keys.js
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(`const crypto = require('crypto');
const { SigningKey } = require('ethers');

const privateKey = crypto.randomBytes(32).toString('hex');
const signingKey = new SigningKey('0x' + privateKey);

console.log('=== TBURN Validator Key Generation ===');
console.log('');
console.log('PRIVATE KEY (KEEP SECRET - NEVER SHARE):');
console.log(privateKey);
console.log('');
console.log('PUBLIC KEY (COMPRESSED - Submit this):');
console.log(signingKey.compressedPublicKey.slice(2));
console.log('');
console.log('Save private key to encrypted cold storage!');`)}
                            data-testid="button-copy-script"
                          >
                            <Copy className="w-3 h-3 mr-1" /> {t("validatorRegistration.buttons.copy")}
                          </Button>
                        </div>
                        <pre className="text-foreground whitespace-pre-wrap">
{`const crypto = require('crypto');
const { SigningKey } = require('ethers');

const privateKey = crypto.randomBytes(32).toString('hex');
const signingKey = new SigningKey('0x' + privateKey);

console.log('=== TBURN Validator Key Generation ===');
console.log('');
console.log('PRIVATE KEY (KEEP SECRET - NEVER SHARE):');
console.log(privateKey);
console.log('');
console.log('PUBLIC KEY (COMPRESSED - Submit this):');
console.log(signingKey.compressedPublicKey.slice(2));`}</pre>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="openssl" className="mt-4">
                    <div className="p-4 bg-muted rounded-lg font-mono text-xs">
                      <pre className="text-foreground whitespace-pre-wrap">
{`# Generate secp256k1 private key
openssl ecparam -name secp256k1 -genkey -noout -out validator_key.pem

# Extract public key (compressed format)
openssl ec -in validator_key.pem -pubout -conv_form compressed -outform DER | tail -c 33 | xxd -p | tr -d '\\n'

# IMPORTANT: Store validator_key.pem in encrypted cold storage!`}</pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="hardware" className="mt-4">
                    <div className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        {t("validatorRegistration.keyGeneration.hardwareDescription")}
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><strong>Ledger</strong> - {t("validatorRegistration.keyGeneration.hardwareOptions.ledger").split(" - ")[1]}</li>
                        <li><strong>Trezor</strong> - {t("validatorRegistration.keyGeneration.hardwareOptions.trezor").split(" - ")[1]}</li>
                        <li><strong>YubiHSM</strong> - {t("validatorRegistration.keyGeneration.hardwareOptions.yubihsm").split(" - ")[1]}</li>
                        <li><strong>AWS CloudHSM</strong> - {t("validatorRegistration.keyGeneration.hardwareOptions.awshsm").split(" - ")[1]}</li>
                      </ul>
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          {t("validatorRegistration.keyGeneration.hardwareNote")}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-500" />
                  {t("validatorRegistration.backupChecklist.title")}
                </CardTitle>
                <CardDescription>
                  {t("validatorRegistration.backupChecklist.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <Checkbox
                      id="coldStorage"
                      checked={backupChecklist.coldStorage}
                      onCheckedChange={(checked) => updateBackupChecklist("coldStorage", checked as boolean)}
                      data-testid="checkbox-cold-storage"
                    />
                    <div className="flex-1">
                      <label htmlFor="coldStorage" className="font-medium cursor-pointer flex items-center gap-2">
                        {backupChecklist.coldStorage ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                        {t("validatorRegistration.backupChecklist.coldStorage")}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("validatorRegistration.backupChecklist.coldStorageHint")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <Checkbox
                      id="multipleBackups"
                      checked={backupChecklist.multipleBackups}
                      onCheckedChange={(checked) => updateBackupChecklist("multipleBackups", checked as boolean)}
                      data-testid="checkbox-multiple-backups"
                    />
                    <div className="flex-1">
                      <label htmlFor="multipleBackups" className="font-medium cursor-pointer flex items-center gap-2">
                        {backupChecklist.multipleBackups ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                        {t("validatorRegistration.backupChecklist.multipleBackups")}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("validatorRegistration.backupChecklist.multipleBackupsHint")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <Checkbox
                      id="encrypted"
                      checked={backupChecklist.encrypted}
                      onCheckedChange={(checked) => updateBackupChecklist("encrypted", checked as boolean)}
                      data-testid="checkbox-encrypted"
                    />
                    <div className="flex-1">
                      <label htmlFor="encrypted" className="font-medium cursor-pointer flex items-center gap-2">
                        {backupChecklist.encrypted ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                        {t("validatorRegistration.backupChecklist.encrypted")}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("validatorRegistration.backupChecklist.encryptedHint")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <Checkbox
                      id="recoveryTested"
                      checked={backupChecklist.recoveryTested}
                      onCheckedChange={(checked) => updateBackupChecklist("recoveryTested", checked as boolean)}
                      data-testid="checkbox-recovery-tested"
                    />
                    <div className="flex-1">
                      <label htmlFor="recoveryTested" className="font-medium cursor-pointer flex items-center gap-2">
                        {backupChecklist.recoveryTested ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                        {t("validatorRegistration.backupChecklist.recoveryTested")}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("validatorRegistration.backupChecklist.recoveryTestedHint")}
                      </p>
                    </div>
                  </div>
                </div>
                {!allBackupsConfirmed && (
                  <Alert className="mt-4 border-amber-500/30 bg-amber-500/5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-600 text-sm">
                      {t("validatorRegistration.backupChecklist.remainingItems", { 
                        count: 4 - Object.values(backupChecklist).filter(Boolean).length 
                      })}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-500" />
                  {t("validatorRegistration.invitationCode.title", { defaultValue: "Invitation Code" })}
                </CardTitle>
                <CardDescription>
                  {t("validatorRegistration.invitationCode.description", { defaultValue: "Enter your invitation code to register as a genesis validator." })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invitationCode" className="flex items-center gap-2">
                    {t("validatorRegistration.invitationCode.label", { defaultValue: "Invitation Code" })} *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="invitationCode"
                      placeholder={t("validatorRegistration.invitationCode.placeholder", { defaultValue: "TB-XX-XXXXXXXXXXXXXXXX" })}
                      value={formData.invitationCode}
                      onChange={(e) => {
                        updateFormData("invitationCode", e.target.value.toUpperCase());
                        setInvitationValidated(false);
                        setInvitationData(null);
                      }}
                      className="font-mono uppercase"
                      data-testid="input-invitation-code"
                    />
                    <Button
                      onClick={handleValidateInvitation}
                      disabled={!formData.invitationCode.trim() || validateInvitationMutation.isPending}
                      data-testid="button-validate-invitation"
                    >
                      {validateInvitationMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t("validatorRegistration.invitationCode.validate", { defaultValue: "Validate" })
                      )}
                    </Button>
                  </div>
                </div>
                {invitationValidated && invitationData && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-400">
                      {t("validatorRegistration.invitationCode.valid", { defaultValue: "Invitation Code Valid" })}
                    </AlertTitle>
                    <AlertDescription className="text-green-300">
                      {t("validatorRegistration.invitationCode.tierAssigned", { 
                        tier: invitationData.tier.charAt(0).toUpperCase() + invitationData.tier.slice(1),
                        remaining: invitationData.remainingSlots,
                        defaultValue: `You are assigned to the ${invitationData.tier} tier. ${invitationData.remainingSlots} slots remaining.`
                      })}
                    </AlertDescription>
                  </Alert>
                )}
                {quotasData?.data && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      {t("validatorRegistration.invitationCode.tierQuotas", { defaultValue: "Tier Quotas" })}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {quotasData.data.quotas.map((quota) => (
                        <div key={quota.tier} className={`p-3 rounded-lg border ${TIER_CONFIGS[quota.tier]?.color || 'border-muted'}`}>
                          <div className="text-xs uppercase font-bold">{quota.tier}</div>
                          <div className="text-lg font-mono">{quota.registered}/{quota.total}</div>
                          <div className="text-xs text-muted-foreground">
                            {quota.isFull 
                              ? t("validatorRegistration.invitationCode.tierFull", { defaultValue: "Full" })
                              : t("validatorRegistration.invitationCode.slotsRemaining", { count: quota.remaining, defaultValue: `${quota.remaining} left` })
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileKey className="w-5 h-5" />
                  {t("validatorRegistration.publicKey.title")}
                </CardTitle>
                <CardDescription>
                  {t("validatorRegistration.publicKey.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publicKey" className="flex items-center gap-2">
                    {t("validatorRegistration.publicKey.label")} *
                  </Label>
                  <Input
                    id="publicKey"
                    placeholder={t("validatorRegistration.publicKey.placeholder")}
                    value={formData.publicKey}
                    onChange={(e) => updateFormData("publicKey", e.target.value)}
                    className="font-mono"
                    data-testid="input-public-key"
                  />
                  <div className="flex items-center gap-2 text-xs">
                    {formData.publicKey && (
                      isValidPublicKey(formData.publicKey) ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {t("validatorRegistration.publicKey.validFormat")}
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> {t("validatorRegistration.publicKey.invalidFormat")}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertTitle>{t("validatorRegistration.publicKey.securityNote")}</AlertTitle>
                  <AlertDescription className="text-sm">
                    {t("validatorRegistration.publicKey.securityNoteText")}
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(1)}
                  data-testid="button-next-step-1"
                >
                  {t("validatorRegistration.buttons.continueToInfo")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("validatorRegistration.validatorInfo.title")}
              </CardTitle>
              <CardDescription>
                {t("validatorRegistration.validatorInfo.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> {t("validatorRegistration.validatorInfo.name")} *
                </Label>
                <Input
                  id="name"
                  placeholder={t("validatorRegistration.validatorInfo.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  data-testid="input-validator-name"
                />
                <p className="text-xs text-muted-foreground">
                  {t("validatorRegistration.validatorInfo.nameHint")}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> {t("validatorRegistration.validatorInfo.tier")} *
                </Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) => updateFormData("tier", value)}
                >
                  <SelectTrigger data-testid="select-tier">
                    <SelectValue placeholder={t("validatorRegistration.validatorInfo.tier")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIER_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={config.color}>
                            {t(`validatorRegistration.tiers.${key}.name`)}
                          </Badge>
                          <span className="text-muted-foreground">
                            {config.stake.toLocaleString()} TBURN | {config.commission}% | {config.slots} {t("validatorRegistration.tierInfo.slots")}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTier && (
                <Card className={`border ${selectedTier.color.split(' ')[2]}`}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                          <Coins className="w-3 h-3" /> {t("validatorRegistration.tierInfo.stake")}
                        </div>
                        <div className="font-bold text-lg">{selectedTier.stake.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">TBURN</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                          <Percent className="w-3 h-3" /> {t("validatorRegistration.tierInfo.commission")}
                        </div>
                        <div className="font-bold text-lg">{selectedTier.commission}%</div>
                        <div className="text-xs text-muted-foreground">{t("validatorRegistration.tierInfo.ofRewards")}</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                          <TrendingUp className="w-3 h-3" /> {t("validatorRegistration.tierInfo.estimatedApy")}
                        </div>
                        <div className="font-bold text-lg text-green-500">{selectedTier.apy}</div>
                        <div className="text-xs text-muted-foreground">{t("validatorRegistration.tierInfo.annual")}</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                          <Globe className="w-3 h-3" /> {t("validatorRegistration.tierInfo.slots")}
                        </div>
                        <div className="font-bold text-lg">{selectedTier.slots}</div>
                        <div className="text-xs text-muted-foreground">{t("validatorRegistration.tierInfo.available")}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      {t(`validatorRegistration.tiers.${formData.tier}.description`)}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Separator />
              <div className="space-y-4">
                <Label className="text-muted-foreground">{t("validatorRegistration.validatorInfo.optionalInfo")}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {t("validatorRegistration.validatorInfo.contactEmail")}
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="validator@example.com"
                      value={formData.contactEmail}
                      onChange={(e) => updateFormData("contactEmail", e.target.value)}
                      data-testid="input-contact-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" /> {t("validatorRegistration.validatorInfo.website")}
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => updateFormData("website", e.target.value)}
                      data-testid="input-website"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    {t("validatorRegistration.validatorInfo.descriptionLabel")}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t("validatorRegistration.validatorInfo.descriptionPlaceholder")}
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    rows={3}
                    data-testid="input-description"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} data-testid="button-back-step-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("validatorRegistration.buttons.back")}
              </Button>
              <Button onClick={nextStep} disabled={!validateStep(2)} data-testid="button-next-step-2">
                {t("validatorRegistration.buttons.reviewSubmit")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {t("validatorRegistration.review.title")}
              </CardTitle>
              <CardDescription>
                {t("validatorRegistration.review.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">{t("validatorRegistration.review.summary")}</h3>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("validatorRegistration.review.validatorName")}</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("validatorRegistration.review.tier")}</span>
                  <Badge className={selectedTier?.color}>
                    {t(`validatorRegistration.tiers.${formData.tier}.name`)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("validatorRegistration.review.initialStake")}</span>
                  <span className="font-bold text-primary">{selectedTier?.stake.toLocaleString()} TBURN</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("validatorRegistration.review.commission")}</span>
                  <span>{selectedTier?.commission}%</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("validatorRegistration.review.estimatedApy")}</span>
                  <span className="text-green-500 font-medium">{selectedTier?.apy}</span>
                </div>
                {formData.contactEmail && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t("validatorRegistration.review.contact")}</span>
                      <span>{formData.contactEmail}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">{t("validatorRegistration.review.publicKeyLabel")}</span>
                  <code className="text-xs font-mono bg-background p-2 rounded break-all">
                    {formData.publicKey}
                  </code>
                </div>
              </div>

              <Alert className="border-amber-500/30 bg-amber-500/5">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <AlertTitle className="text-amber-600">{t("validatorRegistration.review.finalConfirmation")}</AlertTitle>
                <AlertDescription className="text-sm">
                  <p className="mb-2">{t("validatorRegistration.review.confirmationText")}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t("validatorRegistration.review.confirmItems.backupConfirm")}</li>
                    <li>{t("validatorRegistration.review.confirmItems.understandRecovery")}</li>
                    <li>{t("validatorRegistration.review.confirmItems.stakeLocked", { stake: selectedTier?.stake.toLocaleString() })}</li>
                    <li>{t("validatorRegistration.review.confirmItems.agreeTerms")}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} data-testid="button-back-step-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("validatorRegistration.buttons.back")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={registerMutation.isPending}
                data-testid="button-submit-registration"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("validatorRegistration.buttons.registering")}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    {t("validatorRegistration.buttons.submitRegistration")}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
