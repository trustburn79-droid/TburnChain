import { useState, useCallback } from "react";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { TransactionDetails, TransactionStatus } from "@/components/transaction-confirm-dialog";

export interface UseTransactionOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  requireBalance?: boolean;
  minimumBalance?: string;
}

export interface UseTransactionReturn {
  isDialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  status: TransactionStatus;
  txHash: string | undefined;
  error: string | undefined;
  confirmTransaction: () => Promise<void>;
  resetTransaction: () => void;
  transaction: TransactionDetails | null;
  setTransaction: (tx: TransactionDetails | null) => void;
  validateBalance: (requiredAmount: string) => boolean;
  checkWalletConnection: () => boolean;
}

export function useTransaction(options: UseTransactionOptions = {}): UseTransactionReturn {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    isConnected, 
    isCorrectNetwork, 
    balance, 
    sendTransaction,
    address 
  } = useWeb3();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);

  const validateBalance = useCallback((requiredAmount: string): boolean => {
    if (!balance) return false;
    const required = parseFloat(requiredAmount);
    const available = parseFloat(balance);
    return available >= required;
  }, [balance]);

  const checkWalletConnection = useCallback((): boolean => {
    if (!isConnected) {
      toast({
        title: t("wallet.walletRequired"),
        description: t("wallet.connectRequiredDesc"),
        variant: "destructive",
      });
      return false;
    }

    if (!isCorrectNetwork) {
      toast({
        title: t("wallet.wrongNetworkTitle"),
        description: t("wallet.wrongNetworkDesc"),
        variant: "destructive",
      });
      return false;
    }

    if (options.requireBalance && options.minimumBalance) {
      if (!validateBalance(options.minimumBalance)) {
        toast({
          title: t("wallet.transaction.insufficientBalance"),
          description: t("wallet.transaction.insufficientBalanceDesc"),
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  }, [isConnected, isCorrectNetwork, options.requireBalance, options.minimumBalance, validateBalance, toast, t]);

  const openDialog = useCallback(() => {
    setStatus("idle");
    setError(undefined);
    setTxHash(undefined);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    if (status !== "pending" && status !== "confirming") {
      setIsDialogOpen(false);
      setStatus("idle");
      setError(undefined);
    }
  }, [status]);

  const resetTransaction = useCallback(() => {
    setStatus("idle");
    setTxHash(undefined);
    setError(undefined);
    setTransaction(null);
    setIsDialogOpen(false);
  }, []);

  const confirmTransaction = useCallback(async () => {
    if (!transaction || !address) {
      setError(t("wallet.transaction.invalidTransaction"));
      return;
    }

    if (!checkWalletConnection()) {
      setError(t("wallet.walletRequired"));
      return;
    }

    setStatus("confirming");
    setError(undefined);

    try {
      const txConfig = {
        to: transaction.toAddress || address,
        value: transaction.amount,
        data: undefined,
      };

      const response = await sendTransaction(txConfig);
      
      if (!response) {
        throw new Error(t("wallet.transaction.rejected"));
      }

      setStatus("pending");
      setTxHash(response.hash);

      const receipt = await response.wait();
      
      if (receipt && receipt.status === 1) {
        setStatus("success");
        options.onSuccess?.(response.hash);
        toast({
          title: t("wallet.transaction.success"),
          description: t("wallet.transaction.successDesc", { hash: response.hash.slice(0, 10) }),
        });
      } else {
        throw new Error(t("wallet.transaction.failed"));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("wallet.transaction.unknownError");
      setStatus("error");
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
      toast({
        title: t("wallet.transaction.failed"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [transaction, address, checkWalletConnection, sendTransaction, options, toast, t]);

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    status,
    txHash,
    error,
    confirmTransaction,
    resetTransaction,
    transaction,
    setTransaction,
    validateBalance,
    checkWalletConnection,
  };
}

export function useBalanceValidation() {
  const { balance, isConnected } = useWeb3();

  const hasMinimumBalance = useCallback((requiredAmount: string): boolean => {
    if (!isConnected || !balance) return false;
    const required = parseFloat(requiredAmount);
    const available = parseFloat(balance);
    return available >= required;
  }, [balance, isConnected]);

  const formatBalance = useCallback((decimals: number = 4): string => {
    if (!balance) return "0";
    return parseFloat(balance).toFixed(decimals);
  }, [balance]);

  const getBalanceStatus = useCallback((requiredAmount: string): "sufficient" | "insufficient" | "unknown" => {
    if (!isConnected || !balance) return "unknown";
    const required = parseFloat(requiredAmount);
    const available = parseFloat(balance);
    return available >= required ? "sufficient" : "insufficient";
  }, [balance, isConnected]);

  return {
    balance,
    hasMinimumBalance,
    formatBalance,
    getBalanceStatus,
    isConnected,
  };
}

export function useWalletValidation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    isConnected, 
    isCorrectNetwork, 
    balance, 
    address,
    getConnectionHealth 
  } = useWeb3();

  const validateForTransaction = useCallback((
    setWalletModalOpen: (open: boolean) => void,
    requiredAmount?: string
  ): boolean => {
    if (!isConnected) {
      toast({
        title: t("wallet.walletRequired"),
        description: t("wallet.connectRequiredDesc"),
        variant: "destructive",
      });
      setWalletModalOpen(true);
      return false;
    }

    if (!isCorrectNetwork) {
      toast({
        title: t("wallet.wrongNetworkTitle"),
        description: t("wallet.wrongNetworkDesc"),
        variant: "destructive",
      });
      return false;
    }

    const health = getConnectionHealth();
    if (!health.isHealthy) {
      toast({
        title: t("wallet.connectionUnstable"),
        description: t("wallet.connectionUnstableDesc"),
        variant: "default",
      });
    }

    if (requiredAmount && balance) {
      const required = parseFloat(requiredAmount);
      const available = parseFloat(balance);
      if (available < required) {
        toast({
          title: t("wallet.transaction.insufficientBalance"),
          description: t("wallet.transaction.insufficientBalanceDesc", {
            required: requiredAmount,
            available: balance,
          }),
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  }, [isConnected, isCorrectNetwork, balance, getConnectionHealth, toast, t]);

  return {
    validateForTransaction,
    isConnected,
    isCorrectNetwork,
    address,
    balance,
  };
}
