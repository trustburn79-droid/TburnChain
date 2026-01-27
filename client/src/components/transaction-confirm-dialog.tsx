import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/lib/web3-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Shield, 
  Clock,
  Wallet,
  Fuel,
  ExternalLink
} from "lucide-react";

export interface TransactionDetails {
  type: "stake" | "swap" | "transfer" | "mint" | "supply" | "borrow" | "withdraw" | "deposit" | "claim" | "approve";
  title: string;
  description?: string;
  amount: string;
  token: string;
  toAddress?: string;
  estimatedGas?: string;
  estimatedTime?: string;
  warnings?: string[];
  metadata?: Record<string, string>;
}

export type TransactionStatus = "idle" | "confirming" | "pending" | "success" | "error";

interface TransactionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDetails | null;
  status: TransactionStatus;
  txHash?: string;
  error?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const TYPE_ICONS: Record<TransactionDetails["type"], JSX.Element> = {
  stake: <Shield className="h-5 w-5 text-blue-500" />,
  swap: <ArrowRight className="h-5 w-5 text-green-500" />,
  transfer: <ArrowRight className="h-5 w-5 text-purple-500" />,
  mint: <CheckCircle2 className="h-5 w-5 text-orange-500" />,
  supply: <ArrowRight className="h-5 w-5 text-cyan-500" />,
  borrow: <Wallet className="h-5 w-5 text-red-500" />,
  withdraw: <ArrowRight className="h-5 w-5 text-yellow-500" />,
  deposit: <ArrowRight className="h-5 w-5 text-emerald-500" />,
  claim: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  approve: <Shield className="h-5 w-5 text-indigo-500" />,
};

export function TransactionConfirmDialog({
  open,
  onOpenChange,
  transaction,
  status,
  txHash,
  error,
  onConfirm,
  onCancel,
}: TransactionConfirmDialogProps) {
  const { t } = useTranslation();
  const { address, formatAddress, balance, getConnectionHealth } = useWeb3();
  const [isProcessing, setIsProcessing] = useState(false);
  const health = getConnectionHealth();

  useEffect(() => {
    if (status === "success" || status === "error") {
      setIsProcessing(false);
    }
  }, [status]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (status !== "pending" && status !== "confirming") {
      onOpenChange(false);
      onCancel();
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "confirming":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            {t("wallet.transaction.confirming")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            {t("wallet.transaction.pending")}
          </Badge>
        );
      case "success":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("wallet.transaction.success")}
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            {t("wallet.transaction.failed")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!transaction) return null;

  const insufficientBalance = balance && parseFloat(balance) < parseFloat(transaction.amount || "0");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-tx-confirm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {TYPE_ICONS[transaction.type]}
            <DialogTitle data-testid="title-tx-confirm">
              {transaction.title}
            </DialogTitle>
          </div>
          {transaction.description && (
            <DialogDescription>
              {transaction.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {getStatusBadge()}

          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("wallet.transaction.amount")}</span>
              <span className="font-semibold" data-testid="text-tx-amount">
                {transaction.amount} {transaction.token}
              </span>
            </div>

            {transaction.toAddress && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("wallet.transaction.to")}</span>
                <span className="font-mono text-sm" data-testid="text-tx-to">
                  {formatAddress(transaction.toAddress)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("wallet.transaction.from")}</span>
              <span className="font-mono text-sm" data-testid="text-tx-from">
                {address ? formatAddress(address) : "-"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("wallet.transaction.balance")}</span>
              <span className={`text-sm ${insufficientBalance ? "text-red-500" : ""}`} data-testid="text-tx-balance">
                {balance ? `${parseFloat(balance).toFixed(4)} TBURN` : "-"}
              </span>
            </div>

            {transaction.estimatedGas && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Fuel className="h-3 w-3" />
                  {t("wallet.transaction.estimatedGas")}
                </span>
                <span className="text-sm">{transaction.estimatedGas} EMB</span>
              </div>
            )}

            {transaction.estimatedTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t("wallet.transaction.estimatedTime")}
                </span>
                <span className="text-sm">{transaction.estimatedTime}</span>
              </div>
            )}

            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <>
                <Separator />
                {Object.entries(transaction.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{key}</span>
                    <span className="text-sm">{value}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {insufficientBalance && (
            <Alert variant="destructive" data-testid="alert-insufficient-balance">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t("wallet.transaction.insufficientBalance")}
              </AlertDescription>
            </Alert>
          )}

          {transaction.warnings && transaction.warnings.length > 0 && (
            <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                <ul className="list-disc pl-4 space-y-1">
                  {transaction.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {!health.isHealthy && (
            <Alert variant="default" className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700 dark:text-orange-400">
                {t("wallet.connectionUnstable")}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" data-testid="alert-tx-error">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {txHash && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="text-sm text-green-700 dark:text-green-400">
                {t("wallet.transaction.txHash")}
              </span>
              <a
                href={`https://tburn.io/scan/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-green-600 hover:underline flex items-center gap-1"
                data-testid="link-tx-hash"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* OTP Authentication Info */}
          {transaction.type === "transfer" && status === "idle" && (
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 space-y-2" data-testid="otp-auth-info">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-400">
                <Shield className="h-4 w-4" />
                {t("wallet.transaction.otpAuthTitle", "Email OTP Authentication")}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <span className="text-orange-500">•</span>
                  {t("wallet.transaction.otpMaxAttempts", "Max 3 attempts per request")}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  {t("wallet.transaction.otpNoRequired", "$10 or less: No OTP (session key auto-approval)")}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  {t("wallet.transaction.otpStandard", "$10 - $1,000: Standard OTP")}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-purple-500">•</span>
                  {t("wallet.transaction.otpEnhanced", "$1,000+: Enhanced OTP")}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {status === "idle" && (
            <>
              <Button variant="outline" onClick={handleClose} data-testid="button-tx-cancel">
                {t("wallet.transaction.cancel")}
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={insufficientBalance || isProcessing}
                data-testid="button-tx-confirm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("wallet.transaction.processing")}
                  </>
                ) : (
                  t("wallet.transaction.confirm")
                )}
              </Button>
            </>
          )}

          {(status === "confirming" || status === "pending") && (
            <Button disabled className="w-full">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {status === "confirming" 
                ? t("wallet.transaction.waitingConfirmation") 
                : t("wallet.transaction.processing")}
            </Button>
          )}

          {status === "success" && (
            <Button onClick={handleClose} className="w-full" data-testid="button-tx-done">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t("wallet.transaction.done")}
            </Button>
          )}

          {status === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t("wallet.transaction.close")}
              </Button>
              <Button onClick={handleConfirm} data-testid="button-tx-retry">
                {t("wallet.transaction.retry")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
