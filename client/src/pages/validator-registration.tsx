/**
 * TBURN Genesis Validator BYO Registration Portal
 * Production-grade registration for validators who generate their own keys offline
 * Chain ID: 5800 | TBURN Mainnet
 */

import { useState } from "react";
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
import { LanguageSelector } from "@/components/LanguageSelector";

type RegistrationStep = 1 | 2 | 3;

interface TierConfig {
  name: string;
  stake: number;
  commission: number;
  apy: string;
  slots: number;
  color: string;
  description: string;
}

const TIER_CONFIGS: Record<string, TierConfig> = {
  core: {
    name: "Core",
    stake: 1000000,
    commission: 3,
    apy: "20-25%",
    slots: 10,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    description: "Foundation validators with maximum stake and lowest commission",
  },
  enterprise: {
    name: "Enterprise",
    stake: 500000,
    commission: 8,
    apy: "16-20%",
    slots: 25,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    description: "Enterprise-grade validators for institutional participants",
  },
  partner: {
    name: "Partner",
    stake: 250000,
    commission: 15,
    apy: "14-18%",
    slots: 40,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    description: "Partner validators for strategic ecosystem contributors",
  },
  community: {
    name: "Community",
    stake: 100000,
    commission: 20,
    apy: "12-15%",
    slots: 50,
    color: "text-green-500 bg-green-500/10 border-green-500/30",
    description: "Community validators for decentralized participation",
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
}

interface BackupChecklist {
  coldStorage: boolean;
  multipleBackups: boolean;
  encrypted: boolean;
  recoveryTested: boolean;
}

export default function ValidatorRegistration() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  const [backupChecklist, setBackupChecklist] = useState<BackupChecklist>({
    coldStorage: false,
    multipleBackups: false,
    encrypted: false,
    recoveryTested: false,
  });

  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    publicKey: "",
    tier: "community",
    description: "",
    website: "",
    contactEmail: "",
    nodeEndpoint: "",
  });

  // Get current validator status
  const { data: statusData } = useQuery({
    queryKey: ["/api/genesis-validators/status"],
  });

  // BYO Registration mutation - uses the correct endpoint
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
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      if (result.success) {
        setRegistrationResult(result.data);
        setRegistrationComplete(true);
        toast({
          title: "Registration Successful",
          description: `Validator ${result.data.name} registered successfully!`,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Error",
        description: error.message || "Failed to register validator",
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

  // All backup items must be checked to proceed
  const allBackupsConfirmed = Object.values(backupChecklist).every((v) => v);

  // Validate public key format
  const isValidPublicKey = (key: string): boolean => {
    const clean = key.replace(/^0x/, "");
    return /^[0-9a-fA-F]{66}$/.test(clean) || /^[0-9a-fA-F]{130}$/.test(clean);
  };

  const validateStep = (step: RegistrationStep): boolean => {
    switch (step) {
      case 1:
        return allBackupsConfirmed && isValidPublicKey(formData.publicKey);
      case 2:
        return formData.name.length >= 3 && formData.tier.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3) as RegistrationStep);
    } else {
      if (currentStep === 1) {
        if (!allBackupsConfirmed) {
          toast({
            title: "Backup Confirmation Required",
            description: "Please confirm all backup checklist items before proceeding",
            variant: "destructive",
          });
        } else if (!isValidPublicKey(formData.publicKey)) {
          toast({
            title: "Invalid Public Key",
            description: "Public key must be 33 bytes (compressed) or 65 bytes (uncompressed) hex format",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
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
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const selectedTier = TIER_CONFIGS[formData.tier];

  // Registration complete screen
  if (registrationComplete && registrationResult) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-end">
            <LanguageSelector isDark={false} />
          </div>
          <Card className="border-green-500/30">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Registration Complete</CardTitle>
              <CardDescription>
                Your validator has been successfully registered on TBURN Mainnet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validator Details */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Validator Name</span>
                  <span className="font-medium">{registrationResult.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">TBURN Address</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                      {registrationResult.address}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(registrationResult.address)}
                      data-testid="button-copy-address"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tier</span>
                  <Badge className={TIER_CONFIGS[registrationResult.tier]?.color}>
                    {registrationResult.tier.toUpperCase()}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Initial Stake</span>
                  <span className="font-bold text-primary">
                    {(Number(registrationResult.initialStake) / 1e18).toLocaleString()} TBURN
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Commission Rate</span>
                  <span>{(registrationResult.commission / 100).toFixed(1)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated APY</span>
                  <span className="text-green-500 font-medium">{registrationResult.estimatedAPY}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                    Pending Verification
                  </Badge>
                </div>
              </div>

              {/* Next Steps */}
              <Alert className="border-blue-500/30 bg-blue-500/5">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
                <AlertTitle className="text-blue-600">Next Steps</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                    {registrationResult.nextSteps?.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Important Reminder */}
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
                <AlertOctagon className="h-5 w-5" />
                <AlertTitle>Keep Your Private Key Safe</AlertTitle>
                <AlertDescription className="text-sm">
                  Your private key is the only way to control this validator. We do NOT have access to it.
                  If you lose your private key, you will lose access to your staked TBURN permanently.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = "/validators"}
                data-testid="button-view-validators"
              >
                View All Validators
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setRegistrationComplete(false);
                  setRegistrationResult(null);
                  setCurrentStep(1);
                  setFormData({
                    name: "",
                    publicKey: "",
                    tier: "community",
                    description: "",
                    website: "",
                    contactEmail: "",
                    nodeEndpoint: "",
                  });
                  setBackupChecklist({
                    coldStorage: false,
                    multipleBackups: false,
                    encrypted: false,
                    recoveryTested: false,
                  });
                }}
                data-testid="button-register-another"
              >
                Register Another
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
        {/* Language Selector */}
        <div className="flex justify-end">
          <LanguageSelector isDark={false} />
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">Chain ID: 5800</Badge>
          <h1 className="text-3xl font-bold">TBURN Genesis Validator Registration</h1>
          <p className="text-muted-foreground">
            BYO (Bring Your Own Key) - Register your validator with an offline-generated keypair
          </p>
          {statusData?.data && (
            <div className="flex justify-center gap-4 mt-4">
              <Badge variant="secondary">
                {statusData.data.totalCount} / {statusData.data.targetCount} Validators
              </Badge>
              {statusData.data.isComplete && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                  Genesis Complete
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
              1. Key & Security
            </span>
            <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
              2. Validator Info
            </span>
            <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>
              3. Review & Submit
            </span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Key Generation & Security */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* CRITICAL: Security Warnings */}
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
                  <li>Generate your keys <strong>OFFLINE</strong> on an air-gapped machine</li>
                  <li><strong>NEVER</strong> share your private key with anyone - not even TBURN support</li>
                  <li>Lost private keys <strong>CANNOT</strong> be recovered - your funds will be permanently lost</li>
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
              <CardContent className="space-y-4">
                <Tabs defaultValue="nodejs" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="nodejs" data-testid="tab-nodejs">Node.js</TabsTrigger>
                    <TabsTrigger value="openssl" data-testid="tab-openssl">OpenSSL</TabsTrigger>
                    <TabsTrigger value="hardware" data-testid="tab-hardware">Hardware Wallet</TabsTrigger>
                  </TabsList>
                  <TabsContent value="nodejs" className="mt-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">1</span>
                          <div>
                            <p className="font-medium">Disconnect from network</p>
                            <p className="text-muted-foreground text-xs">Air-gap your machine before generating keys</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">2</span>
                          <div>
                            <p className="font-medium">Install dependencies offline</p>
                            <p className="text-muted-foreground text-xs">npm install ethers crypto</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">3</span>
                          <div>
                            <p className="font-medium">Run key generation script</p>
                            <p className="text-muted-foreground text-xs">node generate-keys.js</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">4</span>
                          <div>
                            <p className="font-medium">Copy public key only</p>
                            <p className="text-muted-foreground text-xs">Paste compressed public key below</p>
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

// Generate secure random private key
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
                            <Copy className="w-3 h-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <pre className="text-foreground whitespace-pre-wrap">
{`const crypto = require('crypto');
const { SigningKey } = require('ethers');

// Generate secure random private key
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
                        For maximum security, use a hardware wallet or HSM to generate and store keys:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><strong>Ledger</strong> - Use Ethereum app, export public key</li>
                        <li><strong>Trezor</strong> - Use secp256k1 curve, export compressed pubkey</li>
                        <li><strong>YubiHSM</strong> - Generate key in HSM, never export private key</li>
                        <li><strong>AWS CloudHSM</strong> - Enterprise-grade key management</li>
                      </ul>
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Hardware wallets provide the best security as private keys never leave the device.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Mandatory Backup Checklist */}
            <Card className="border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-500" />
                  Mandatory Backup Confirmation
                </CardTitle>
                <CardDescription>
                  You must confirm ALL items before proceeding. This ensures you won't lose access to your validator.
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
                        Private key stored in cold storage (offline)
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        USB drive, paper wallet, or hardware security module (HSM)
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
                        Created multiple backup copies in different locations
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        At least 2-3 copies stored in separate physical locations
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
                        Backups are encrypted with strong password
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use AES-256 encryption or equivalent
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
                        Successfully tested recovery from backup
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Verified that you can derive the same public key from backup
                      </p>
                    </div>
                  </div>
                </div>
                {!allBackupsConfirmed && (
                  <Alert className="mt-4 border-amber-500/30 bg-amber-500/5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-600 text-sm">
                      Please confirm all {4 - Object.values(backupChecklist).filter(Boolean).length} remaining items to proceed
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Public Key Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileKey className="w-5 h-5" />
                  Submit Your Public Key
                </CardTitle>
                <CardDescription>
                  Enter the compressed public key generated offline. This is the ONLY information submitted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publicKey" className="flex items-center gap-2">
                    Compressed Public Key (66 hex characters) *
                  </Label>
                  <Input
                    id="publicKey"
                    placeholder="03a1b2c3d4e5f6... (66 hex chars)"
                    value={formData.publicKey}
                    onChange={(e) => updateFormData("publicKey", e.target.value)}
                    className="font-mono"
                    data-testid="input-public-key"
                  />
                  <div className="flex items-center gap-2 text-xs">
                    {formData.publicKey && (
                      isValidPublicKey(formData.publicKey) ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Valid public key format
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Invalid format (must be 66 or 130 hex chars)
                        </span>
                      )
                    )}
                  </div>
                </div>

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Security Note</AlertTitle>
                  <AlertDescription className="text-sm">
                    Never enter your private key. We only need the public key to derive your TBURN validator address (tb1...).
                    Your private key should remain securely stored offline.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(1)}
                  data-testid="button-next-step-1"
                >
                  Continue to Validator Info
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Step 2: Validator Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Validator Information
              </CardTitle>
              <CardDescription>
                Provide details about your validator node
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validator Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Validator Name *
                </Label>
                <Input
                  id="name"
                  placeholder="My TBURN Validator"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  data-testid="input-validator-name"
                />
                <p className="text-xs text-muted-foreground">
                  A unique name for your validator (min 3 characters)
                </p>
              </div>

              {/* Tier Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Select Tier *
                </Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) => updateFormData("tier", value)}
                >
                  <SelectTrigger data-testid="select-tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIER_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={config.color}>
                            {config.name}
                          </Badge>
                          <span className="text-muted-foreground">
                            {config.stake.toLocaleString()} TBURN | {config.commission}% | {config.slots} slots
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tier Info Display */}
              {selectedTier && (
                <Card className={`border ${selectedTier.color.split(' ')[2]}`}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                          <Coins className="w-3 h-3" /> Stake
                        </div>
                        <div className="font-bold text-lg">{selectedTier.stake.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">TBURN</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                          <Percent className="w-3 h-3" /> Commission
                        </div>
                        <div className="font-bold text-lg">{selectedTier.commission}%</div>
                        <div className="text-xs text-muted-foreground">of rewards</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                          <TrendingUp className="w-3 h-3" /> Est. APY
                        </div>
                        <div className="font-bold text-lg text-green-500">{selectedTier.apy}</div>
                        <div className="text-xs text-muted-foreground">annual</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                          <User className="w-3 h-3" /> Slots
                        </div>
                        <div className="font-bold text-lg">{selectedTier.slots}</div>
                        <div className="text-xs text-muted-foreground">available</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      {selectedTier.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Optional Fields */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Optional Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Contact Email
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
                      <Globe className="w-4 h-4" /> Website
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://myvalidator.com"
                      value={formData.website}
                      onChange={(e) => updateFormData("website", e.target.value)}
                      data-testid="input-website"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <Building className="w-4 h-4" /> Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your validator operation..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className="min-h-[80px]"
                    data-testid="input-description"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} data-testid="button-back-step-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={nextStep} disabled={!validateStep(2)} data-testid="button-next-step-2">
                Review & Submit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Review & Submit
              </CardTitle>
              <CardDescription>
                Please review your validator registration details before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium mb-3">Registration Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validator Name</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier</span>
                      <Badge className={selectedTier?.color}>{selectedTier?.name}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial Stake</span>
                      <span className="font-bold text-primary">{selectedTier?.stake.toLocaleString()} TBURN</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission</span>
                      <span>{selectedTier?.commission}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated APY</span>
                      <span className="text-green-500">{selectedTier?.apy}</span>
                    </div>
                    {formData.contactEmail && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contact</span>
                        <span>{formData.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <span className="text-muted-foreground text-sm">Public Key</span>
                  <code className="block text-xs font-mono bg-background p-2 rounded break-all">
                    {formData.publicKey}
                  </code>
                </div>
              </div>

              {/* Final Warning */}
              <Alert variant="destructive" className="border-2">
                <AlertOctagon className="h-5 w-5" />
                <AlertTitle>Final Confirmation</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>By submitting this registration:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>I confirm that I have securely backed up my private key</li>
                    <li>I understand that TBURN cannot recover lost private keys</li>
                    <li>I accept that my initial stake of <strong>{selectedTier?.stake.toLocaleString()} TBURN</strong> will be locked</li>
                    <li>I agree to the TBURN Mainnet validator terms of service</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} data-testid="button-back-step-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={registerMutation.isPending}
                className="min-w-[200px]"
                data-testid="button-submit-registration"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Submit Registration
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
