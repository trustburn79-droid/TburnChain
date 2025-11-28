import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Send, Zap, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertTransaction } from "@shared/schema";

export default function TransactionSimulator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    value: "",
    gas: "21000",
    gasPrice: "10",
    shardId: "0",
    data: "",
  });

  const generateRandomAddress = () => {
    const hexChars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += hexChars[Math.floor(Math.random() * 16)];
    }
    return address;
  };

  const isValidAddress = (address: string): boolean => {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  };

  const generateRandomTx = () => {
    setFormData({
      from: generateRandomAddress(),
      to: generateRandomAddress(),
      value: (Math.random() * 10).toFixed(4),
      gas: String(Math.floor(Math.random() * 100000) + 21000),
      gasPrice: String(Math.floor(Math.random() * 45) + 5),
      shardId: String(Math.floor(Math.random() * 5)),
      data: Math.random() > 0.7 ? `0x${Math.random().toString(16).substr(2, 64)}` : "",
    });
  };

  const createTransaction = useMutation({
    mutationFn: async (data: typeof formData) => {
      const valueNum = parseFloat(data.value || "0");
      const gasPriceNum = parseFloat(data.gasPrice);
      
      if (isNaN(valueNum) || isNaN(gasPriceNum)) {
        throw new Error("Invalid numeric input");
      }
      
      const valueInWei = (BigInt(Math.floor(valueNum * 1e18))).toString();
      const gasPriceInWei = (BigInt(Math.floor(gasPriceNum * 1e12))).toString();
      
      const tx = {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: 0,
        blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: data.from,
        to: data.to || null,
        value: valueInWei,
        gas: parseInt(data.gas),
        gasPrice: gasPriceInWei,
        gasUsed: undefined,
        nonce: Math.floor(Math.random() * 100),
        timestamp: Math.floor(Date.now() / 1000),
        status: "pending" as const,
        input: data.data || null,
        contractAddress: data.to ? null : generateRandomAddress(),
        shardId: parseInt(data.shardId),
      };

      const response = await apiRequest("POST", "/api/transactions", tx);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('txSimulator.transactionCreated'),
        description: t('txSimulator.transactionBroadcast'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('txSimulator.failedToCreate'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from || !isValidAddress(formData.from)) {
      toast({
        title: t('txSimulator.validationError'),
        description: t('txSimulator.invalidFromAddress'),
        variant: "destructive",
      });
      return;
    }

    if (formData.to && !isValidAddress(formData.to)) {
      toast({
        title: t('txSimulator.validationError'),
        description: t('txSimulator.invalidToAddress'),
        variant: "destructive",
      });
      return;
    }

    const value = parseFloat(formData.value || "0");
    const gas = parseInt(formData.gas);
    const gasPrice = parseFloat(formData.gasPrice);
    const shardId = parseInt(formData.shardId);

    if (isNaN(value) || value < 0) {
      toast({
        title: t('txSimulator.validationError'),
        description: t('txSimulator.invalidValue'),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(gas) || gas < 21000) {
      toast({
        title: t('txSimulator.validationError'),
        description: t('txSimulator.invalidGasLimit'),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(gasPrice) || gasPrice <= 0) {
      toast({
        title: t('txSimulator.validationError'),
        description: t('txSimulator.invalidGasPrice'),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(shardId) || shardId < 0 || shardId > 4) {
      toast({
        title: t('txSimulator.validationError'),
        description: t('txSimulator.invalidShardId'),
        variant: "destructive",
      });
      return;
    }

    createTransaction.mutate(formData);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          {t('txSimulator.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('txSimulator.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('txSimulator.createTestTransaction')}</CardTitle>
            <CardDescription>
              {t('txSimulator.generateSimulated')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from">{t('txSimulator.fromAddress')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="from"
                    data-testid="input-from-address"
                    placeholder="0x..."
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    data-testid="button-generate-from"
                    onClick={() => setFormData({ ...formData, from: generateRandomAddress() })}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">{t('txSimulator.toAddress')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="to"
                    data-testid="input-to-address"
                    placeholder={t('txSimulator.toAddressPlaceholder')}
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    data-testid="button-generate-to"
                    onClick={() => setFormData({ ...formData, to: generateRandomAddress() })}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">{t('txSimulator.valueTburn')}</Label>
                  <Input
                    id="value"
                    data-testid="input-value"
                    type="number"
                    step="0.0001"
                    placeholder="0.0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gas">{t('txSimulator.gasLimit')}</Label>
                  <Input
                    id="gas"
                    data-testid="input-gas"
                    type="number"
                    placeholder="21000"
                    value={formData.gas}
                    onChange={(e) => setFormData({ ...formData, gas: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gasPrice">{t('txSimulator.gasPriceEmb')}</Label>
                  <Input
                    id="gasPrice"
                    data-testid="input-gas-price"
                    type="number"
                    step="1"
                    placeholder="10"
                    value={formData.gasPrice}
                    onChange={(e) => setFormData({ ...formData, gasPrice: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shard">{t('txSimulator.shardId')}</Label>
                  <Select value={formData.shardId} onValueChange={(value) => setFormData({ ...formData, shardId: value })}>
                    <SelectTrigger id="shard" data-testid="select-shard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t('txSimulator.shardAlpha')}</SelectItem>
                      <SelectItem value="1">{t('txSimulator.shardBeta')}</SelectItem>
                      <SelectItem value="2">{t('txSimulator.shardGamma')}</SelectItem>
                      <SelectItem value="3">{t('txSimulator.shardDelta')}</SelectItem>
                      <SelectItem value="4">{t('txSimulator.shardEpsilon')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">{t('txSimulator.inputDataOptional')}</Label>
                <Input
                  id="data"
                  data-testid="input-data"
                  placeholder={t('txSimulator.contractCallDataPlaceholder')}
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  data-testid="button-send-transaction"
                  disabled={createTransaction.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createTransaction.isPending ? t('txSimulator.broadcasting') : t('txSimulator.sendTransaction')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-testid="button-random-tx"
                  onClick={generateRandomTx}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('txSimulator.random')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('txSimulator.transactionDetails')}</CardTitle>
              <CardDescription>
                {t('txSimulator.previewBeforeBroadcast')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('txSimulator.transactionType')}</div>
                <div className="text-sm font-mono">
                  {formData.to ? t('txSimulator.transfer') : t('txSimulator.contractCreation')}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('txSimulator.estimatedFee')}</div>
                <div className="text-sm font-mono">
                  {formData.gas && formData.gasPrice
                    ? (() => {
                        const gasUsed = parseInt(formData.gas);
                        const gasPriceEmb = parseFloat(formData.gasPrice);
                        const feeEmb = gasUsed * gasPriceEmb;
                        const feeTburn = feeEmb / 1e6;
                        if (feeEmb >= 1e6) return `${(feeEmb / 1e6).toFixed(2)}M EMB (${feeTburn.toFixed(4)} TBURN)`;
                        if (feeEmb >= 1e3) return `${(feeEmb / 1e3).toFixed(1)}K EMB`;
                        return `${feeEmb.toLocaleString()} EMB`;
                      })()
                    : t('txSimulator.na')}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('txSimulator.targetShard')}</div>
                <div className="text-sm">
                  {t(`txSimulator.shard${["Alpha", "Beta", "Gamma", "Delta", "Epsilon"][parseInt(formData.shardId)]}`)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('txSimulator.hasInputData')}</div>
                <div className="text-sm">
                  {formData.data ? t('txSimulator.yesContractInteraction') : t('txSimulator.noSimpleTransfer')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('txSimulator.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                data-testid="button-preset-transfer"
                onClick={() => {
                  setFormData({
                    from: generateRandomAddress(),
                    to: generateRandomAddress(),
                    value: "1.5",
                    gas: "21000",
                    gasPrice: "10",
                    shardId: "0",
                    data: "",
                  });
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                {t('txSimulator.simpleTransferPreset')}
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                data-testid="button-preset-contract"
                onClick={() => {
                  setFormData({
                    from: generateRandomAddress(),
                    to: "",
                    value: "0",
                    gas: "500000",
                    gasPrice: "25",
                    shardId: "0",
                    data: `0x${Math.random().toString(16).substr(2, 256)}`,
                  });
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                {t('txSimulator.contractCreationPreset')}
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                data-testid="button-preset-large"
                onClick={() => {
                  setFormData({
                    from: generateRandomAddress(),
                    to: generateRandomAddress(),
                    value: "100",
                    gas: "50000",
                    gasPrice: "50",
                    shardId: String(Math.floor(Math.random() * 5)),
                    data: "",
                  });
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                {t('txSimulator.largeTransferPreset')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
