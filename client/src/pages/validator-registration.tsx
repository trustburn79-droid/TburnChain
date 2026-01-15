/**
 * TBURN Enterprise Validator Registration Portal
 * Production-grade 3-step registration wizard with crypto proof
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Key,
  Server,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Globe,
  Cpu,
  HardDrive,
  Zap,
  Lock,
  FileKey,
  Building,
  Mail,
  User,
  Loader2,
  AlertOctagon,
  ShieldAlert,
  Download,
  HardDriveDownload,
  KeyRound,
} from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

type RegistrationStep = 1 | 2 | 3;

interface SecurityFeatures {
  hsm: boolean;
  remoteSigner: boolean;
  mTLS: boolean;
  firewallConfigured: boolean;
  ddosProtection: boolean;
}

interface HardwareSpecs {
  cpu: string;
  memory: string;
  storage: string;
  network: string;
}

interface RegistrationFormData {
  validatorAddress: string;
  publicKey: string;
  signatureProof: string;
  nodeName: string;
  organizationName: string;
  contactEmail: string;
  region: string;
  tier: string;
  hostingProvider: string;
  hardwareSpecs: HardwareSpecs;
  securityFeatures: SecurityFeatures;
  initialStakeAmount: string;
}

export default function ValidatorRegistration() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  const [formData, setFormData] = useState<RegistrationFormData>({
    validatorAddress: "",
    publicKey: "",
    signatureProof: "",
    nodeName: "",
    organizationName: "",
    contactEmail: "",
    region: "global",
    tier: "community",
    hostingProvider: "",
    hardwareSpecs: {
      cpu: "",
      memory: "",
      storage: "",
      network: "",
    },
    securityFeatures: {
      hsm: false,
      remoteSigner: false,
      mTLS: false,
      firewallConfigured: false,
      ddosProtection: false,
    },
    initialStakeAmount: "0",
  });

  // Tier query
  const { data: tiersData } = useQuery({
    queryKey: ["/api/external-validators/tiers"],
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const stakeInTburn = BigInt(data.initialStakeAmount || "100000");
      const WEI_MULTIPLIER = BigInt("1000000000000000000");
      const stakeInWei = (stakeInTburn * WEI_MULTIPLIER).toString();
      const response = await apiRequest("POST", "/api/external-validators/register", {
        operatorAddress: data.validatorAddress,
        operatorName: data.nodeName,
        region: data.region || "global",
        stakeAmount: stakeInWei,
        signature: data.signatureProof || "",
        publicKey: data.publicKey || "",
        endpoints: {
          rpcUrl: "https://validator.example.com:8545",
          wsUrl: "wss://validator.example.com:8546",
          p2pAddress: "/ip4/0.0.0.0/tcp/30303",
        },
        metadata: {
          organization: data.organizationName,
          email: data.contactEmail,
          hostingProvider: data.hostingProvider,
          hardware: data.hardwareSpecs,
          security: data.securityFeatures,
        },
        capabilities: ["block_production", "attestation"],
        signatureAlgorithm: "secp256k1",
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      if (result.success) {
        setRegistrationResult(result.data);
        setRegistrationComplete(true);
        toast({
          title: t("validatorRegistration.toasts.successTitle"),
          description: result.data.message,
        });
      } else {
        toast({
          title: t("validatorRegistration.toasts.failedTitle"),
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t("validatorRegistration.toasts.errorTitle"),
        description: error.message || t("validatorRegistration.toasts.errorDescription"),
        variant: "destructive",
      });
    },
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateHardwareSpecs = (field: keyof HardwareSpecs, value: string) => {
    setFormData((prev) => ({
      ...prev,
      hardwareSpecs: {
        ...prev.hardwareSpecs,
        [field]: value,
      },
    }));
  };

  const updateSecurityFeatures = (field: keyof SecurityFeatures, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      securityFeatures: {
        ...prev.securityFeatures,
        [field]: value,
      },
    }));
  };

  const validateStep = (step: RegistrationStep): boolean => {
    switch (step) {
      case 1:
        return (
          formData.validatorAddress.match(/^0x[a-fA-F0-9]{40}$/) !== null &&
          formData.publicKey.length >= 66 &&
          formData.signatureProof.length >= 130
        );
      case 2:
        return (
          formData.nodeName.length >= 3 &&
          formData.contactEmail.includes("@") &&
          formData.region.length > 0 &&
          formData.tier.length > 0
        );
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3) as RegistrationStep);
    } else {
      toast({
        title: t("validatorRegistration.toasts.validationErrorTitle"),
        description: t("validatorRegistration.toasts.validationErrorDescription"),
        variant: "destructive",
      });
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
      title: t("validatorRegistration.toasts.copiedTitle"),
      description: t("validatorRegistration.toasts.copiedDescription"),
    });
  };

  // Generate mock signature for demo
  const generateDemoSignature = () => {
    const randomHex = Array.from({ length: 130 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    updateFormData("signatureProof", `0x${randomHex}`);
  };

  if (registrationComplete && registrationResult) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Language Selector - Top Right */}
          <div className="flex justify-end">
            <LanguageSelector isDark={false} />
          </div>
          <Card className="border-green-500/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">
                {t("validatorRegistration.completion.title")}
              </CardTitle>
              <CardDescription>
                {registrationResult.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("validatorRegistration.completion.registrationId")}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">{registrationResult.registrationId}</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(registrationResult.registrationId)}
                      data-testid="button-copy-registration-id"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("validatorRegistration.completion.status")}
                  </span>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                    {registrationResult.status === "pending" 
                      ? t("validatorRegistration.completion.statusPending")
                      : t("validatorRegistration.completion.statusUnderReview")}
                  </Badge>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t("validatorRegistration.completion.nextStepsTitle")}</AlertTitle>
                <AlertDescription>
                  {t("validatorRegistration.completion.nextStepsText")}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">{t("validatorRegistration.completion.estimatedReviewTime")}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">Community</div>
                    <div className="text-sm text-muted-foreground">24-48h</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">Genesis/Pioneer</div>
                    <div className="text-sm text-muted-foreground">3-5 {t("validatorRegistration.completion.businessDays")}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => window.location.href = "/external-validator-program"}
                data-testid="button-back-to-program"
              >
                {t("validatorRegistration.buttons.backToProgram")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Language Selector - Top Right */}
        <div className="flex justify-end">
          <LanguageSelector isDark={false} />
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {t("validatorRegistration.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("validatorRegistration.subtitle")}
          </p>
        </div>

        {/* Progress */}
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
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Cryptographic Proof */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                {t("validatorRegistration.step1.title")}
              </CardTitle>
              <CardDescription>
                {t("validatorRegistration.step1.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CRITICAL: Key Generation Security Warnings */}
              <div className="space-y-4">
                {/* Main Critical Warning */}
                <Alert variant="destructive" className="border-2 border-red-500 bg-red-500/10">
                  <AlertOctagon className="h-5 w-5" />
                  <AlertTitle className="text-lg font-bold">
                    CRITICAL: Private Key Security
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p className="font-semibold">
                      Your private key is the ONLY way to access your validator funds and rewards.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Generate your keys OFFLINE on an air-gapped machine</li>
                      <li>NEVER share your private key with anyone - not even TBURN support</li>
                      <li>Lost private keys CANNOT be recovered - your funds will be permanently lost</li>
                      <li>We only store your public key - we cannot recover your private key</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Key Generation Instructions */}
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-500" />
                      Offline Key Generation Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p className="font-medium">Use an air-gapped computer</p>
                          <p className="text-muted-foreground text-xs">Disconnect from all networks before generating keys</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <p className="font-medium">Generate secp256k1 keypair</p>
                          <p className="text-muted-foreground text-xs">Use ethers.js, OpenSSL, or hardware wallet</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <p className="font-medium">Backup private key securely</p>
                          <p className="text-muted-foreground text-xs">Use HSM, encrypted USB, or cold storage</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          <p className="font-medium">Submit ONLY public key</p>
                          <p className="text-muted-foreground text-xs">Never enter your private key anywhere online</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Code Example */}
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg font-mono text-xs">
                      <p className="text-muted-foreground mb-2"># Example: Generate key using Node.js (run offline)</p>
                      <code className="text-foreground">
                        const &#123; SigningKey &#125; = require('ethers');<br/>
                        const privateKey = crypto.randomBytes(32).toString('hex');<br/>
                        const signingKey = new SigningKey('0x' + privateKey);<br/>
                        console.log('Public Key:', signingKey.compressedPublicKey);
                      </code>
                    </div>
                  </CardContent>
                </Card>

                {/* Backup Checklist */}
                <Alert className="border-blue-500/30 bg-blue-500/5">
                  <ShieldAlert className="h-5 w-5 text-blue-500" />
                  <AlertTitle className="text-blue-600">Before You Continue: Backup Checklist</AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox id="backup1" data-testid="checkbox-backup-offline" />
                        <label htmlFor="backup1" className="cursor-pointer">Private key stored in cold storage</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="backup2" data-testid="checkbox-backup-multiple" />
                        <label htmlFor="backup2" className="cursor-pointer">Multiple backup copies created</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="backup3" data-testid="checkbox-backup-encrypted" />
                        <label htmlFor="backup3" className="cursor-pointer">Backup is encrypted</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="backup4" data-testid="checkbox-backup-tested" />
                        <label htmlFor="backup4" className="cursor-pointer">Recovery tested successfully</label>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              {/* Validator Address */}
              <div className="space-y-2">
                <Label htmlFor="validatorAddress" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {t("validatorRegistration.step1.validatorAddress")} *
                </Label>
                <Input
                  id="validatorAddress"
                  placeholder="0x..."
                  value={formData.validatorAddress}
                  onChange={(e) => updateFormData("validatorAddress", e.target.value)}
                  className="font-mono"
                  data-testid="input-validator-address"
                />
                <p className="text-xs text-muted-foreground">
                  {t("validatorRegistration.step1.validatorAddressHint")}
                </p>
              </div>

              {/* Public Key */}
              <div className="space-y-2">
                <Label htmlFor="publicKey" className="flex items-center gap-2">
                  <FileKey className="w-4 h-4" />
                  {t("validatorRegistration.step1.publicKey")} *
                </Label>
                <Input
                  id="publicKey"
                  placeholder="0x04..."
                  value={formData.publicKey}
                  onChange={(e) => updateFormData("publicKey", e.target.value)}
                  className="font-mono"
                  data-testid="input-public-key"
                />
                <p className="text-xs text-muted-foreground">
                  {t("validatorRegistration.step1.publicKeyHint")}
                </p>
              </div>

              {/* Signature Proof */}
              <div className="space-y-2">
                <Label htmlFor="signatureProof" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t("validatorRegistration.step1.signatureProof")} *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="signatureProof"
                    placeholder="0x..."
                    value={formData.signatureProof}
                    onChange={(e) => updateFormData("signatureProof", e.target.value)}
                    className="font-mono flex-1"
                    data-testid="input-signature-proof"
                  />
                  <Button 
                    variant="outline" 
                    onClick={generateDemoSignature}
                    data-testid="button-generate-demo-signature"
                  >
                    {t("validatorRegistration.step1.demoGenerate")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("validatorRegistration.step1.signatureProofHint")}
                </p>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>{t("validatorRegistration.step1.securityNotice")}</AlertTitle>
                <AlertDescription>
                  {t("validatorRegistration.step1.securityNoticeText")}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={nextStep} 
                disabled={!validateStep(1)}
                data-testid="button-next-step-1"
              >
                {t("validatorRegistration.buttons.next")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Node Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                {t("validatorRegistration.step2.title")}
              </CardTitle>
              <CardDescription>
                {t("validatorRegistration.step2.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Node Name */}
                <div className="space-y-2">
                  <Label htmlFor="nodeName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t("validatorRegistration.step2.nodeName")} *
                  </Label>
                  <Input
                    id="nodeName"
                    placeholder="my-validator-01"
                    value={formData.nodeName}
                    onChange={(e) => updateFormData("nodeName", e.target.value)}
                    data-testid="input-node-name"
                  />
                </div>

                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {t("validatorRegistration.step2.organizationName")}
                  </Label>
                  <Input
                    id="organizationName"
                    placeholder={t("validatorRegistration.step2.optional")}
                    value={formData.organizationName}
                    onChange={(e) => updateFormData("organizationName", e.target.value)}
                    data-testid="input-organization-name"
                  />
                </div>
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("validatorRegistration.step2.contactEmail")} *
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Region */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t("validatorRegistration.step2.region")} *
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => updateFormData("region", value)}
                  >
                    <SelectTrigger data-testid="select-region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="america">America</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tier */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t("validatorRegistration.step2.tier")} *
                  </Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value) => updateFormData("tier", value)}
                  >
                    <SelectTrigger data-testid="select-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">
                        {t("validatorRegistration.step2.tierOptions.community")}
                      </SelectItem>
                      <SelectItem value="standard">
                        {t("validatorRegistration.step2.tierOptions.standard")}
                      </SelectItem>
                      <SelectItem value="pioneer">
                        {t("validatorRegistration.step2.tierOptions.pioneer")}
                      </SelectItem>
                      <SelectItem value="genesis">
                        {t("validatorRegistration.step2.tierOptions.genesis")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stake Amount */}
              <div className="space-y-2">
                <Label htmlFor="stakeAmount">
                  {t("validatorRegistration.step2.stakeAmount")}
                </Label>
                <Input
                  id="stakeAmount"
                  type="text"
                  placeholder="100000"
                  value={formData.initialStakeAmount}
                  onChange={(e) => updateFormData("initialStakeAmount", e.target.value)}
                  data-testid="input-stake-amount"
                />
              </div>

              {(formData.tier === "genesis" || formData.tier === "pioneer") && (
                <Alert className="border-amber-500/20 bg-amber-500/5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle>{t("validatorRegistration.step2.multiSigRequired")}</AlertTitle>
                  <AlertDescription>
                    {t("validatorRegistration.step2.multiSigDescription", { tier: formData.tier === "genesis" ? "Genesis" : "Pioneer" })}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} data-testid="button-prev-step-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("validatorRegistration.buttons.previous")}
              </Button>
              <Button onClick={nextStep} disabled={!validateStep(2)} data-testid="button-next-step-2">
                {t("validatorRegistration.buttons.next")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Infrastructure (Optional) */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                {t("validatorRegistration.step3.title")}
              </CardTitle>
              <CardDescription>
                {t("validatorRegistration.step3.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hosting Provider */}
              <div className="space-y-2">
                <Label>{t("validatorRegistration.step3.hostingProvider")}</Label>
                <Select
                  value={formData.hostingProvider}
                  onValueChange={(value) => updateFormData("hostingProvider", value)}
                >
                  <SelectTrigger data-testid="select-hosting-provider">
                    <SelectValue placeholder={t("validatorRegistration.step2.optional")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                    <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
                    <SelectItem value="azure">Microsoft Azure</SelectItem>
                    <SelectItem value="bare_metal">Bare Metal / Dedicated</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hardware Specs */}
              <div className="space-y-4">
                <Label>{t("validatorRegistration.step3.hardwareSpecs")}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpu" className="text-sm text-muted-foreground flex items-center gap-2">
                      <Cpu className="w-3 h-3" /> CPU
                    </Label>
                    <Input
                      id="cpu"
                      placeholder="e.g., 8 cores @ 3.5GHz"
                      value={formData.hardwareSpecs.cpu}
                      onChange={(e) => updateHardwareSpecs("cpu", e.target.value)}
                      data-testid="input-hardware-cpu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memory" className="text-sm text-muted-foreground">
                      {t("validatorRegistration.step3.memory")}
                    </Label>
                    <Input
                      id="memory"
                      placeholder="e.g., 32 GB DDR4"
                      value={formData.hardwareSpecs.memory}
                      onChange={(e) => updateHardwareSpecs("memory", e.target.value)}
                      data-testid="input-hardware-memory"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage" className="text-sm text-muted-foreground flex items-center gap-2">
                      <HardDrive className="w-3 h-3" /> {t("validatorRegistration.step3.storage")}
                    </Label>
                    <Input
                      id="storage"
                      placeholder="e.g., 2 TB NVMe SSD"
                      value={formData.hardwareSpecs.storage}
                      onChange={(e) => updateHardwareSpecs("storage", e.target.value)}
                      data-testid="input-hardware-storage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="network" className="text-sm text-muted-foreground">
                      {t("validatorRegistration.step3.network")}
                    </Label>
                    <Input
                      id="network"
                      placeholder="e.g., 10 Gbps"
                      value={formData.hardwareSpecs.network}
                      onChange={(e) => updateHardwareSpecs("network", e.target.value)}
                      data-testid="input-hardware-network"
                    />
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-4">
                <Label>{t("validatorRegistration.step3.securityFeatures")}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id="hsm"
                      checked={formData.securityFeatures.hsm}
                      onCheckedChange={(checked) => updateSecurityFeatures("hsm", checked as boolean)}
                      data-testid="checkbox-hsm"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="hsm" className="cursor-pointer">HSM</Label>
                      <p className="text-xs text-muted-foreground">
                        {t("validatorRegistration.step3.hsm")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id="remoteSigner"
                      checked={formData.securityFeatures.remoteSigner}
                      onCheckedChange={(checked) => updateSecurityFeatures("remoteSigner", checked as boolean)}
                      data-testid="checkbox-remote-signer"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="remoteSigner" className="cursor-pointer">
                        {t("validatorRegistration.step3.remoteSigner")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("validatorRegistration.step3.remoteSignerHint")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id="mTLS"
                      checked={formData.securityFeatures.mTLS}
                      onCheckedChange={(checked) => updateSecurityFeatures("mTLS", checked as boolean)}
                      data-testid="checkbox-mtls"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="mTLS" className="cursor-pointer">mTLS</Label>
                      <p className="text-xs text-muted-foreground">
                        {t("validatorRegistration.step3.mTLS")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id="firewall"
                      checked={formData.securityFeatures.firewallConfigured}
                      onCheckedChange={(checked) => updateSecurityFeatures("firewallConfigured", checked as boolean)}
                      data-testid="checkbox-firewall"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="firewall" className="cursor-pointer">
                        {t("validatorRegistration.step3.firewall")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("validatorRegistration.step3.firewallHint")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border md:col-span-2">
                    <Checkbox
                      id="ddos"
                      checked={formData.securityFeatures.ddosProtection}
                      onCheckedChange={(checked) => updateSecurityFeatures("ddosProtection", checked as boolean)}
                      data-testid="checkbox-ddos"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="ddos" className="cursor-pointer">
                        {t("validatorRegistration.step3.ddos")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("validatorRegistration.step3.ddosHint")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} data-testid="button-prev-step-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("validatorRegistration.buttons.previous")}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={registerMutation.isPending}
                data-testid="button-submit-registration"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("validatorRegistration.buttons.submitting")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t("validatorRegistration.buttons.submit")}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
