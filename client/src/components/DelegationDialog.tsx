import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Coins, Wallet, ArrowRight, CheckCircle, CircleNotch, WarningCircle } from "@phosphor-icons/react";

interface DelegationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validator: {
    address: string;
    name: string;
    commission: number;
    apy: number;
    stake: number;
    delegatedStake?: number;
    delegators?: number;
    uptime?: number;
  };
  walletAddress?: string;
  walletBalance?: number;
  mode: 'delegate' | 'undelegate';
}

type TransactionStatus = 'idle' | 'confirming' | 'pending' | 'success' | 'error';

export function DelegationDialog({ 
  open, 
  onOpenChange, 
  validator, 
  walletAddress,
  walletBalance = 0,
  mode 
}: DelegationDialogProps) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const delegateMutation = useMutation({
    mutationFn: async (delegateAmount: string) => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      
      const endpoint = mode === 'delegate' 
        ? `/api/validators/${validator.address}/delegate`
        : `/api/validators/${validator.address}/undelegate`;
      
      const response = await apiRequest('POST', endpoint, { 
        amount: delegateAmount,
        delegatorAddress: walletAddress 
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Transaction failed");
      }
      
      return data;
    },
    onMutate: () => {
      setStatus('pending');
    },
    onSuccess: (data: any) => {
      setStatus('success');
      setTxHash(data.txHash);
      
      queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
      queryClient.invalidateQueries({ queryKey: [`/api/validators/${validator.address}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/network/stats'] });
      
      toast({
        title: mode === 'delegate' ? "Delegation Successful" : "Undelegation Successful",
        description: `Successfully ${mode === 'delegate' ? 'delegated' : 'undelegated'} ${amount} TBURN ${mode === 'delegate' ? 'to' : 'from'} ${validator.name}`,
      });
    },
    onError: (error: any) => {
      setStatus('error');
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to process transaction",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (status !== 'idle') {
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'delegate' && parseFloat(amount) > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough TBURN tokens",
        variant: "destructive",
      });
      return;
    }

    setStatus('confirming');
    
    setTimeout(() => {
      delegateMutation.mutate(amount);
    }, 1500);
  };

  const handleClose = () => {
    if (status === 'pending' || status === 'confirming') {
      return;
    }
    setAmount("");
    setStatus('idle');
    setTxHash(null);
    onOpenChange(false);
  };
  
  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen && (status === 'pending' || status === 'confirming')) {
      return;
    }
    if (!newOpen) {
      handleClose();
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const estimatedApy = validator.apy / 100;
  const estimatedReward = amount ? (parseFloat(amount) * estimatedApy / 365).toFixed(6) : "0";
  const networkFee = "0.001";

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0d0d0d] border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            {mode === 'delegate' ? (
              <>
                <Coins className="w-5 h-5 text-orange-500" />
                Delegate to {validator.name}
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 text-orange-500" />
                Undelegate from {validator.name}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'delegate' 
              ? "Stake your TBURN tokens to earn rewards and support network security."
              : "Withdraw your staked tokens. Unbonding period: 21 days."}
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' || status === 'confirming' ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
              <div>
                <p className="text-xs text-gray-500 mb-1">Commission</p>
                <p className="text-white font-mono">{(validator.commission / 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Est. APY</p>
                <p className="text-green-400 font-mono">{estimatedApy.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Stake</p>
                <p className="text-white font-mono">{formatNumber(validator.stake)} TBURN</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Uptime</p>
                <p className="text-white font-mono">{validator.uptime?.toFixed(2) || '99.99'}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount" className="text-gray-300">Amount (TBURN)</Label>
                <button
                  onClick={() => setAmount(walletBalance.toString())}
                  className="text-xs text-orange-500 hover:text-orange-400"
                  data-testid="button-max-amount"
                >
                  Max: {formatNumber(walletBalance)}
                </button>
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10 text-white text-lg font-mono"
                data-testid="input-delegation-amount"
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Daily Reward (Est.)</span>
                  <span className="text-white font-mono">{estimatedReward} TBURN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network Fee</span>
                  <span className="text-white font-mono">{networkFee} TBURN</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-300">Total</span>
                  <span className="text-orange-400 font-mono">
                    {(parseFloat(amount) + parseFloat(networkFee)).toFixed(6)} TBURN
                  </span>
                </div>
              </div>
            )}

            {!walletAddress && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
                <WarningCircle className="w-5 h-5 text-yellow-500" />
                <p className="text-sm text-yellow-400">Please connect your wallet to delegate</p>
              </div>
            )}
          </div>
        ) : status === 'pending' ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <CircleNotch className="w-16 h-16 text-orange-500 animate-spin" />
            <p className="text-lg text-white">Processing Transaction...</p>
            <p className="text-sm text-gray-400">Please wait while we confirm your transaction</p>
          </div>
        ) : status === 'success' ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-lg text-white font-medium">Transaction Successful!</p>
            <p className="text-sm text-gray-400 text-center">
              {mode === 'delegate' ? 'Delegated' : 'Undelegated'} {amount} TBURN {mode === 'delegate' ? 'to' : 'from'} {validator.name}
            </p>
            {txHash && (
              <div className="p-3 bg-white/5 rounded-lg w-full">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <p className="text-xs text-orange-400 font-mono break-all">{txHash}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <WarningCircle className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-lg text-white font-medium">Transaction Failed</p>
            <p className="text-sm text-gray-400 text-center">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        <DialogFooter>
          {status === 'idle' && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-white/10"
                data-testid="button-cancel-delegation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0 || !walletAddress}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="button-confirm-delegation"
              >
                {mode === 'delegate' ? 'Delegate' : 'Undelegate'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
          {(status === 'confirming' || status === 'pending') && (
            <Button disabled className="bg-orange-500/50 text-white w-full">
              <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
              {status === 'confirming' ? 'Waiting for Wallet Confirmation...' : 'Processing Transaction...'}
            </Button>
          )}
          {(status === 'success' || status === 'error') && (
            <Button
              onClick={handleClose}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full"
              data-testid="button-close-delegation"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}