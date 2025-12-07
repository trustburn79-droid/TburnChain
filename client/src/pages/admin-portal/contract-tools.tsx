import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatAddress } from "@/lib/format";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  FileCode,
  Search,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Code,
  Eye,
  Upload,
  Download,
  Copy,
  Settings,
  Zap,
  Shield,
  AlertCircle,
} from "lucide-react";

interface Contract {
  address: string;
  name: string;
  verified: boolean;
  compiler: string;
  deployedAt: string;
  transactions: number;
}

interface ContractsData {
  contracts: Contract[];
  stats: {
    totalContracts: number;
    verified: number;
    interactions24h: string;
    gasUsed24h: string;
  };
}

export default function ContractTools() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("interact");
  const [contractAddress, setContractAddress] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showContractDetail, setShowContractDetail] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);

  const { data: contractsData, isLoading, error, refetch } = useQuery<ContractsData>({
    queryKey: ["/api/admin/developer/contracts"],
  });

  const deployMutation = useMutation({
    mutationFn: async (data: { sourceCode: string; contractName: string; compiler: string }) => {
      return apiRequest("POST", "/api/admin/developer/contracts/deploy", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developer/contracts"] });
      toast({
        title: t("adminContracts.deploySuccess"),
        description: t("adminContracts.deploySuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminContracts.deployError"),
        description: t("adminContracts.deployErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { address: string; sourceCode: string; compiler: string }) => {
      return apiRequest("POST", "/api/admin/developer/contracts/verify", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developer/contracts"] });
      toast({
        title: t("adminContracts.verifySuccess"),
        description: t("adminContracts.verifySuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminContracts.verifyError"),
        description: t("adminContracts.verifyErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const defaultContracts: Contract[] = [
    { address: "0x1234567890abcdef1234567890abcdef12345678", name: "TBURN Token", verified: true, compiler: "solidity 0.8.20", deployedAt: "2024-01-15", transactions: 1248567 },
    { address: "0xabcdef0123456789abcdef0123456789abcdef01", name: "Staking Pool", verified: true, compiler: "solidity 0.8.20", deployedAt: "2024-01-15", transactions: 456789 },
    { address: "0x9876543210fedcba9876543210fedcba98765432", name: "Bridge Contract", verified: true, compiler: "solidity 0.8.20", deployedAt: "2024-02-20", transactions: 234567 },
    { address: "0xdeadbeef0123456789deadbeef0123456789dead", name: "DEX Router", verified: false, compiler: "unknown", deployedAt: "2024-03-10", transactions: 89012 },
  ];

  const contracts = contractsData?.contracts || defaultContracts;
  const stats = contractsData?.stats || {
    totalContracts: 12847,
    verified: 8234,
    interactions24h: "2.4M",
    gasUsed24h: "847M",
  };

  const abiExample = `[
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
]`;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminContracts.refreshSuccess"),
        description: t("adminContracts.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminContracts.refreshError"),
        description: t("adminContracts.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      contracts,
      stats,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-contracts-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminContracts.exportSuccess"),
      description: t("adminContracts.exportSuccessDesc"),
    });
  }, [contracts, stats, toast, t]);

  const getContractDetailSections = (contract: Contract): DetailSection[] => [
    {
      title: t("adminContracts.detail.contractInfo"),
      fields: [
        { label: t("adminContracts.address"), value: formatAddress(contract.address), type: "code", copyable: true, copyValue: contract.address },
        { label: t("adminContracts.name"), value: contract.name },
        { 
          label: t("adminContracts.verified"), 
          value: contract.verified ? t("adminContracts.verifiedBadge") : t("adminContracts.unverified"), 
          type: "badge",
          badgeVariant: contract.verified ? "default" : "secondary",
          badgeColor: contract.verified ? "bg-green-500" : undefined
        },
        { label: t("adminContracts.compiler"), value: contract.compiler },
      ],
    },
    {
      title: t("adminContracts.detail.statistics"),
      fields: [
        { label: t("adminContracts.deployed"), value: contract.deployedAt, type: "date" },
        { label: t("adminContracts.transactions"), value: contract.transactions.toLocaleString() },
      ],
    },
  ];

  const confirmDeploy = useCallback(() => {
    deployMutation.mutate({ sourceCode: "", contractName: "", compiler: "0.8.20" });
    setShowDeployConfirm(false);
  }, [deployMutation]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="contracts-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminContracts.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminContracts.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminContracts.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="contract-tools-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <FileCode className="h-8 w-8" />
              {t("adminContracts.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminContracts.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t("adminContracts.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminContracts.export")}
            </Button>
            <Button onClick={() => setShowDeployConfirm(true)} data-testid="button-deploy">
              <Upload className="h-4 w-4 mr-2" />
              {t("adminContracts.deployContract")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-contracts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminContracts.totalContracts")}</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.totalContracts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{t("adminContracts.deployedOnMainnet")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-verified">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminContracts.verified")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-green-500">{stats.verified.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{t("adminContracts.sourceVerified")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-interactions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminContracts.interactions24h")}</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.interactions24h}</div>
                  <p className="text-xs text-green-500">{t("adminContracts.fromYesterday", { percent: "+18%" })}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-gas-used">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminContracts.gasUsed24h")}</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.gasUsed24h}</div>
                  <p className="text-xs text-muted-foreground">{t("adminContracts.gasUnits")}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-contracts">
            <TabsTrigger value="interact" data-testid="tab-interact">{t("adminContracts.tabs.interact")}</TabsTrigger>
            <TabsTrigger value="verify" data-testid="tab-verify">{t("adminContracts.tabs.verify")}</TabsTrigger>
            <TabsTrigger value="abi" data-testid="tab-abi">{t("adminContracts.tabs.abiTools")}</TabsTrigger>
            <TabsTrigger value="deployed" data-testid="tab-deployed">{t("adminContracts.tabs.deployedContracts")}</TabsTrigger>
          </TabsList>

          <TabsContent value="interact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminContracts.contractInteraction")}</CardTitle>
                <CardDescription>{t("adminContracts.readWriteToContracts")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adminContracts.contractAddress")}</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="0x..." 
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        data-testid="input-contract-address"
                      />
                      <Button variant="outline" data-testid="button-search-contract">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminContracts.network")}</Label>
                    <Select defaultValue="mainnet">
                      <SelectTrigger data-testid="select-network">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mainnet">{t("adminContracts.mainnet")}</SelectItem>
                        <SelectItem value="testnet">{t("adminContracts.testnet")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("adminContracts.abiJson")}</Label>
                  <Textarea 
                    placeholder={t("adminContracts.pasteAbi")}
                    className="font-mono text-sm h-32"
                    defaultValue={abiExample}
                    data-testid="textarea-abi"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">{t("adminContracts.readFunctions")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">totalSupply()</span>
                        <Badge variant="outline">view</Badge>
                      </div>
                      <Button size="sm" className="w-full" data-testid="button-query-totalsupply">
                        <Play className="h-4 w-4 mr-2" />
                        {t("adminContracts.query")}
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">balanceOf(address)</span>
                        <Badge variant="outline">view</Badge>
                      </div>
                      <Input placeholder={t("adminContracts.address")} className="mb-2" data-testid="input-balance-address" />
                      <Button size="sm" className="w-full" data-testid="button-query-balance">
                        <Play className="h-4 w-4 mr-2" />
                        {t("adminContracts.query")}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">{t("adminContracts.writeFunctions")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">transfer(address, uint256)</span>
                        <Badge variant="secondary">write</Badge>
                      </div>
                      <Input placeholder={t("adminContracts.toAddress")} className="mb-2" data-testid="input-transfer-to" />
                      <Input placeholder={t("adminContracts.amount")} className="mb-2" data-testid="input-transfer-amount" />
                      <Button size="sm" className="w-full" variant="secondary" data-testid="button-execute-transfer">
                        <Zap className="h-4 w-4 mr-2" />
                        {t("adminContracts.execute")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verify" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("adminContracts.verifyContract")}
                </CardTitle>
                <CardDescription>{t("adminContracts.submitSourceCode")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adminContracts.contractAddress")}</Label>
                    <Input placeholder="0x..." data-testid="input-verify-address" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminContracts.compilerVersion")}</Label>
                    <Select defaultValue="0.8.20">
                      <SelectTrigger data-testid="select-compiler">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.8.20">Solidity 0.8.20</SelectItem>
                        <SelectItem value="0.8.19">Solidity 0.8.19</SelectItem>
                        <SelectItem value="0.8.18">Solidity 0.8.18</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminContracts.contractName")}</Label>
                    <Input placeholder="MyToken" data-testid="input-contract-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminContracts.optimization")}</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger data-testid="select-optimization">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">{t("adminContracts.yes200runs")}</SelectItem>
                        <SelectItem value="no">{t("adminContracts.no")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("adminContracts.sourceCode")}</Label>
                  <Textarea 
                    placeholder={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    // Your source code here...
}`}
                    className="font-mono text-sm h-64"
                    data-testid="textarea-source-code"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("adminContracts.constructorArguments")}</Label>
                  <Input placeholder="0x..." data-testid="input-constructor-args" />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => verifyMutation.mutate({ address: "", sourceCode: "", compiler: "0.8.20" })}
                  disabled={verifyMutation.isPending}
                  data-testid="button-verify-contract"
                >
                  {verifyMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {t("adminContracts.verifyContract")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t("adminContracts.abiEncoderDecoder")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">{t("adminContracts.encode")}</h3>
                    <div className="space-y-2">
                      <Label>{t("adminContracts.functionSignature")}</Label>
                      <Input placeholder="transfer(address,uint256)" data-testid="input-encode-signature" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminContracts.parameters")}</Label>
                      <Input placeholder="0x1234...5678, 1000000000000000000" data-testid="input-encode-params" />
                    </div>
                    <Button className="w-full" data-testid="button-encode">{t("adminContracts.encode")}</Button>
                    <div className="space-y-2">
                      <Label>{t("adminContracts.encodedData")}</Label>
                      <Textarea readOnly className="font-mono text-xs" placeholder={t("adminContracts.resultWillAppear")} data-testid="textarea-encoded-result" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">{t("adminContracts.decode")}</h3>
                    <div className="space-y-2">
                      <Label>{t("adminContracts.encodedData")}</Label>
                      <Textarea placeholder="0xa9059cbb..." className="font-mono text-xs h-20" data-testid="textarea-decode-input" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminContracts.abiOptional")}</Label>
                      <Textarea placeholder={t("adminContracts.pasteAbiForBetterDecoding")} className="font-mono text-xs h-20" data-testid="textarea-decode-abi" />
                    </div>
                    <Button className="w-full" data-testid="button-decode">{t("adminContracts.decode")}</Button>
                    <div className="space-y-2">
                      <Label>{t("adminContracts.decodedOutput")}</Label>
                      <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                        <p>Function: transfer(address,uint256)</p>
                        <p>to: 0x1234...5678</p>
                        <p>amount: 1000000000000000000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployed" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("adminContracts.deployedContracts")}</CardTitle>
                    <CardDescription>{t("adminContracts.coreProtocolContracts")}</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t("adminContracts.searchContracts")} className="pl-9 w-64" data-testid="input-search-contracts" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminContracts.name")}</TableHead>
                        <TableHead>{t("adminContracts.address")}</TableHead>
                        <TableHead>{t("adminContracts.verified")}</TableHead>
                        <TableHead>{t("adminContracts.compiler")}</TableHead>
                        <TableHead>{t("adminContracts.deployed")}</TableHead>
                        <TableHead>{t("adminContracts.transactions")}</TableHead>
                        <TableHead>{t("adminContracts.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract, index) => (
                        <TableRow key={contract.address} data-testid={`contract-row-${index}`}>
                          <TableCell className="font-medium">{contract.name}</TableCell>
                          <TableCell className="font-mono text-sm">{contract.address}</TableCell>
                          <TableCell>
                            {contract.verified ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t("adminContracts.verifiedBadge")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="h-3 w-3 mr-1" />
                                {t("adminContracts.unverified")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{contract.compiler}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{contract.deployedAt}</TableCell>
                          <TableCell>{contract.transactions.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setShowContractDetail(true);
                                }}
                                data-testid={`button-view-${index}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" data-testid={`button-code-${index}`}>
                                <Code className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" data-testid={`button-interact-${index}`}>
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedContract && (
          <DetailSheet
            open={showContractDetail}
            onOpenChange={setShowContractDetail}
            title={selectedContract.name}
            subtitle={selectedContract.address}
            icon={<FileCode className="h-5 w-5" />}
            sections={getContractDetailSections(selectedContract)}
          />
        )}

        <ConfirmationDialog
          open={showDeployConfirm}
          onOpenChange={setShowDeployConfirm}
          title={t("adminContracts.confirm.deployTitle")}
          description={t("adminContracts.confirm.deployDesc")}
          onConfirm={confirmDeploy}
          isLoading={deployMutation.isPending}
          destructive={false}
          confirmText={t("adminContracts.deploy")}
          cancelText={t("adminContracts.cancel")}
        />
      </div>
    </div>
  );
}
