import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    value: "",
    gas: "21000",
    gasPrice: "20",
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
      gasPrice: (Math.random() * 50 + 10).toFixed(2),
      shardId: String(Math.floor(Math.random() * 5)),
      data: Math.random() > 0.7 ? `0x${Math.random().toString(16).substr(2, 64)}` : "",
    });
  };

  const createTransaction = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Parse and validate numeric values
      const valueNum = parseFloat(data.value || "0");
      const gasPriceNum = parseFloat(data.gasPrice);
      
      if (isNaN(valueNum) || isNaN(gasPriceNum)) {
        throw new Error("Invalid numeric input");
      }
      
      // Convert to wei for value (18 decimals)
      const valueInWei = (BigInt(Math.floor(valueNum * 1e18))).toString();
      
      // Convert gas price to wei (9 decimals for Gwei)
      const gasPriceInWei = (BigInt(Math.floor(gasPriceNum * 1e9))).toString();
      
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
        title: "Transaction Created",
        description: "Test transaction has been broadcast to the network",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate from address
    if (!formData.from || !isValidAddress(formData.from)) {
      toast({
        title: "Validation Error",
        description: "From address must be a valid 0x-prefixed 40-character hex address",
        variant: "destructive",
      });
      return;
    }

    // Validate to address (if provided)
    if (formData.to && !isValidAddress(formData.to)) {
      toast({
        title: "Validation Error",
        description: "To address must be a valid 0x-prefixed 40-character hex address",
        variant: "destructive",
      });
      return;
    }

    // Validate numeric fields
    const value = parseFloat(formData.value || "0");
    const gas = parseInt(formData.gas);
    const gasPrice = parseFloat(formData.gasPrice);
    const shardId = parseInt(formData.shardId);

    if (isNaN(value) || value < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid value amount",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(gas) || gas < 21000) {
      toast({
        title: "Validation Error",
        description: "Gas limit must be at least 21000",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(gasPrice) || gasPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid gas price (must be > 0)",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(shardId) || shardId < 0 || shardId > 4) {
      toast({
        title: "Validation Error",
        description: "Shard ID must be between 0 and 4",
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
          Transaction Simulator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and broadcast test transactions to the network
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Test Transaction</CardTitle>
            <CardDescription>
              Generate a simulated transaction for testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from">From Address</Label>
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
                <Label htmlFor="to">To Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="to"
                    data-testid="input-to-address"
                    placeholder="0x... (leave empty for contract creation)"
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
                  <Label htmlFor="value">Value (TBURN)</Label>
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
                  <Label htmlFor="gas">Gas Limit</Label>
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
                  <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
                  <Input
                    id="gasPrice"
                    data-testid="input-gas-price"
                    type="number"
                    step="0.1"
                    placeholder="20"
                    value={formData.gasPrice}
                    onChange={(e) => setFormData({ ...formData, gasPrice: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shard">Shard ID</Label>
                  <Select value={formData.shardId} onValueChange={(value) => setFormData({ ...formData, shardId: value })}>
                    <SelectTrigger id="shard" data-testid="select-shard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Shard 0 (Alpha)</SelectItem>
                      <SelectItem value="1">Shard 1 (Beta)</SelectItem>
                      <SelectItem value="2">Shard 2 (Gamma)</SelectItem>
                      <SelectItem value="3">Shard 3 (Delta)</SelectItem>
                      <SelectItem value="4">Shard 4 (Epsilon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Input Data (Optional)</Label>
                <Input
                  id="data"
                  data-testid="input-data"
                  placeholder="0x... (contract call data)"
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
                  {createTransaction.isPending ? "Broadcasting..." : "Send Transaction"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-testid="button-random-tx"
                  onClick={generateRandomTx}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Random
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Preview of transaction before broadcasting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Transaction Type</div>
                <div className="text-sm font-mono">
                  {formData.to ? "Transfer" : "Contract Creation"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Estimated Fee</div>
                <div className="text-sm font-mono">
                  {formData.gas && formData.gasPrice
                    ? `${((parseInt(formData.gas) * parseFloat(formData.gasPrice)) / 1e9).toFixed(6)} TBURN`
                    : "N/A"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Target Shard</div>
                <div className="text-sm">
                  Shard {formData.shardId} ({["Alpha", "Beta", "Gamma", "Delta", "Epsilon"][parseInt(formData.shardId)]})
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Has Input Data</div>
                <div className="text-sm">
                  {formData.data ? "Yes (Contract Interaction)" : "No (Simple Transfer)"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
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
                    gasPrice: "20",
                    shardId: "0",
                    data: "",
                  });
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Simple Transfer (1.5 TBURN)
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
                Contract Creation
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
                Large Transfer (100 TBURN)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
