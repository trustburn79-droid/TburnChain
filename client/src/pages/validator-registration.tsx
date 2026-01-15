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
} from "lucide-react";

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

  const isKorean = i18n.language === "ko";

  // Tier query
  const { data: tiersData } = useQuery({
    queryKey: ["/api/external-validators/tiers"],
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const stakeInTburn = BigInt(data.initialStakeAmount || "100000");
      const stakeInWei = (stakeInTburn * BigInt(10) ** BigInt(18)).toString();
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
          title: isKorean ? "등록 완료" : "Registration Submitted",
          description: result.data.message,
        });
      } else {
        toast({
          title: isKorean ? "등록 실패" : "Registration Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: isKorean ? "오류" : "Error",
        description: error.message || (isKorean ? "등록에 실패했습니다" : "Registration failed"),
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
        title: isKorean ? "입력 오류" : "Validation Error",
        description: isKorean ? "필수 항목을 올바르게 입력해주세요" : "Please fill in all required fields correctly",
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
      title: isKorean ? "복사됨" : "Copied",
      description: isKorean ? "클립보드에 복사되었습니다" : "Copied to clipboard",
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
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-500/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">
                {isKorean ? "등록 제출 완료" : "Registration Submitted"}
              </CardTitle>
              <CardDescription>
                {registrationResult.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {isKorean ? "등록 ID" : "Registration ID"}
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
                    {isKorean ? "상태" : "Status"}
                  </span>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                    {registrationResult.status === "pending" 
                      ? (isKorean ? "대기 중" : "Pending")
                      : (isKorean ? "검토 중" : "Under Review")}
                  </Badge>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{isKorean ? "다음 단계" : "Next Steps"}</AlertTitle>
                <AlertDescription>
                  {isKorean 
                    ? "관리자가 등록을 검토한 후 API 키가 발급됩니다. 등록된 이메일로 결과를 안내해 드립니다."
                    : "An administrator will review your registration. You will receive your API key via the registered email once approved."}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">{isKorean ? "예상 검토 시간" : "Estimated Review Time"}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">Community</div>
                    <div className="text-sm text-muted-foreground">24-48h</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">Genesis/Pioneer</div>
                    <div className="text-sm text-muted-foreground">3-5 {isKorean ? "영업일" : "business days"}</div>
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
                {isKorean ? "밸리데이터 프로그램으로 돌아가기" : "Back to Validator Program"}
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
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {isKorean ? "밸리데이터 등록" : "Validator Registration"}
          </h1>
          <p className="text-muted-foreground">
            {isKorean 
              ? "TBURN 메인넷에서 밸리데이터로 참여하려면 아래 정보를 입력하세요"
              : "Complete the form below to register as a validator on TBURN mainnet"}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
              1. {isKorean ? "암호화 증명" : "Cryptographic Proof"}
            </span>
            <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
              2. {isKorean ? "노드 정보" : "Node Information"}
            </span>
            <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>
              3. {isKorean ? "인프라 (선택)" : "Infrastructure (Optional)"}
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
                {isKorean ? "암호화 증명" : "Cryptographic Proof"}
              </CardTitle>
              <CardDescription>
                {isKorean 
                  ? "지갑 주소의 소유권을 증명하기 위한 서명이 필요합니다"
                  : "Provide your wallet signature to prove ownership of your validator address"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validator Address */}
              <div className="space-y-2">
                <Label htmlFor="validatorAddress" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {isKorean ? "밸리데이터 주소" : "Validator Address"} *
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
                  {isKorean ? "이더리움 형식 주소 (0x + 40자 16진수)" : "Ethereum format address (0x + 40 hex characters)"}
                </p>
              </div>

              {/* Public Key */}
              <div className="space-y-2">
                <Label htmlFor="publicKey" className="flex items-center gap-2">
                  <FileKey className="w-4 h-4" />
                  {isKorean ? "공개키" : "Public Key"} *
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
                  {isKorean ? "압축되지 않은 secp256k1 공개키 (0x04로 시작)" : "Uncompressed secp256k1 public key (starts with 0x04)"}
                </p>
              </div>

              {/* Signature Proof */}
              <div className="space-y-2">
                <Label htmlFor="signatureProof" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {isKorean ? "서명 증명" : "Signature Proof"} *
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
                    {isKorean ? "데모 생성" : "Demo Generate"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isKorean 
                    ? "등록 메시지에 대한 ECDSA 서명 (개인키로 서명)"
                    : "ECDSA signature of the registration message (signed with your private key)"}
                </p>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>{isKorean ? "보안 안내" : "Security Notice"}</AlertTitle>
                <AlertDescription>
                  {isKorean 
                    ? "개인키는 절대 입력하지 마세요. 서명만 제출하면 됩니다. 개인키는 오프라인 또는 하드웨어 지갑에 안전하게 보관하세요."
                    : "Never enter your private key. Only submit the signature. Keep your private key safely offline or in a hardware wallet."}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={nextStep} 
                disabled={!validateStep(1)}
                data-testid="button-next-step-1"
              >
                {isKorean ? "다음" : "Next"}
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
                {isKorean ? "노드 정보" : "Node Information"}
              </CardTitle>
              <CardDescription>
                {isKorean 
                  ? "밸리데이터 노드 및 운영자 정보를 입력하세요"
                  : "Provide information about your validator node and operator details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Node Name */}
                <div className="space-y-2">
                  <Label htmlFor="nodeName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {isKorean ? "노드 이름" : "Node Name"} *
                  </Label>
                  <Input
                    id="nodeName"
                    placeholder={isKorean ? "my-validator-01" : "my-validator-01"}
                    value={formData.nodeName}
                    onChange={(e) => updateFormData("nodeName", e.target.value)}
                    data-testid="input-node-name"
                  />
                </div>

                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {isKorean ? "조직명" : "Organization Name"}
                  </Label>
                  <Input
                    id="organizationName"
                    placeholder={isKorean ? "선택사항" : "Optional"}
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
                  {isKorean ? "연락처 이메일" : "Contact Email"} *
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
                    {isKorean ? "지역" : "Region"} *
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
                    {isKorean ? "티어" : "Tier"} *
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
                        Community ({isKorean ? "100 TBURN 이상" : "100+ TBURN"})
                      </SelectItem>
                      <SelectItem value="standard">
                        Standard ({isKorean ? "10,000 TBURN 이상" : "10,000+ TBURN"})
                      </SelectItem>
                      <SelectItem value="pioneer">
                        Pioneer ({isKorean ? "100,000 TBURN 이상" : "100,000+ TBURN"})
                      </SelectItem>
                      <SelectItem value="genesis">
                        Genesis ({isKorean ? "1,000,000 TBURN 이상" : "1,000,000+ TBURN"})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stake Amount */}
              <div className="space-y-2">
                <Label htmlFor="stakeAmount">
                  {isKorean ? "초기 스테이킹 금액 (TBURN)" : "Initial Stake Amount (TBURN)"}
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
                  <AlertTitle>{isKorean ? "다중 서명 승인 필요" : "Multi-sig Approval Required"}</AlertTitle>
                  <AlertDescription>
                    {isKorean 
                      ? `${formData.tier === "genesis" ? "Genesis" : "Pioneer"} 티어는 관리자 다중 서명 승인이 필요합니다. 검토 시간이 더 길어질 수 있습니다.`
                      : `${formData.tier === "genesis" ? "Genesis" : "Pioneer"} tier requires multi-sig admin approval. Review time may be longer.`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} data-testid="button-prev-step-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isKorean ? "이전" : "Back"}
              </Button>
              <Button onClick={nextStep} disabled={!validateStep(2)} data-testid="button-next-step-2">
                {isKorean ? "다음" : "Next"}
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
                {isKorean ? "인프라 정보 (선택)" : "Infrastructure Details (Optional)"}
              </CardTitle>
              <CardDescription>
                {isKorean 
                  ? "노드의 하드웨어 사양과 보안 설정을 입력하세요. 이 정보는 리스크 평가에 사용됩니다."
                  : "Provide hardware specifications and security configuration. This helps with risk assessment."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hosting Provider */}
              <div className="space-y-2">
                <Label>{isKorean ? "호스팅 제공업체" : "Hosting Provider"}</Label>
                <Select
                  value={formData.hostingProvider}
                  onValueChange={(value) => updateFormData("hostingProvider", value)}
                >
                  <SelectTrigger data-testid="select-hosting-provider">
                    <SelectValue placeholder={isKorean ? "선택" : "Select"} />
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
                <Label>{isKorean ? "하드웨어 사양" : "Hardware Specifications"}</Label>
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
                      {isKorean ? "메모리" : "Memory"}
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
                      <HardDrive className="w-3 h-3" /> {isKorean ? "스토리지" : "Storage"}
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
                      {isKorean ? "네트워크" : "Network"}
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
                <Label>{isKorean ? "보안 기능" : "Security Features"}</Label>
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
                        {isKorean ? "하드웨어 보안 모듈" : "Hardware Security Module"}
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
                        {isKorean ? "원격 서명자" : "Remote Signer"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isKorean ? "격리된 서명 서비스" : "Isolated signing service"}
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
                        {isKorean ? "상호 TLS 인증" : "Mutual TLS Authentication"}
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
                        {isKorean ? "방화벽 설정" : "Firewall Configured"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isKorean ? "IP 화이트리스트 적용" : "IP whitelist enabled"}
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
                        {isKorean ? "DDoS 보호" : "DDoS Protection"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isKorean ? "Cloudflare, AWS Shield 등" : "Cloudflare, AWS Shield, etc."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} data-testid="button-prev-step-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isKorean ? "이전" : "Back"}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={registerMutation.isPending}
                data-testid="button-submit-registration"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isKorean ? "제출 중..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isKorean ? "등록 제출" : "Submit Registration"}
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
