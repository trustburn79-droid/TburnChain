import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FileCode, CheckCircle, XCircle, Code2, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAddress, formatTimeAgo, formatNumber, formatTokenAmount } from "@/lib/format";
import { SmartContractEditor } from "@/components/SmartContractEditor";
import type { SmartContract } from "@shared/schema";

export default function SmartContracts() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("editor");
  const { data: contracts, isLoading } = useQuery<SmartContract[]>({
    queryKey: ["/api/contracts"],
  });

  const verifiedContracts = contracts?.filter(c => c.verified).length || 0;
  const totalContracts = contracts?.length || 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <FileCode className="h-8 w-8" />
            {t('smartContracts.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('smartContracts.subtitle')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="editor" className="flex items-center gap-2" data-testid="tab-contract-editor">
            <Code2 className="h-4 w-4" />
            {t('smartContracts.contractIde')}
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2" data-testid="tab-contract-list">
            <List className="h-4 w-4" />
            {t('smartContracts.deployedContracts')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <SmartContractEditor />
        </TabsContent>

        <TabsContent value="list" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {isLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : (
              <>
                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('smartContracts.totalContracts')}
                    </CardTitle>
                    <FileCode className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {formatNumber(totalContracts)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('smartContracts.verifiedContracts')}
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {formatNumber(verifiedContracts)}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({totalContracts > 0 ? ((verifiedContracts / totalContracts) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('smartContracts.totalInteractions')}
                    </CardTitle>
                    <XCircle className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {formatNumber(contracts?.reduce((sum, c) => sum + c.transactionCount, 0) || 0)}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('smartContracts.allSmartContracts')}</CardTitle>
            </CardHeader>
            <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : contracts && contracts.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('smartContracts.contract')}</TableHead>
                    <TableHead>{t('common.address')}</TableHead>
                    <TableHead>{t('smartContracts.creator')}</TableHead>
                    <TableHead>{t('common.balance')}</TableHead>
                    <TableHead>{t('common.transactions')}</TableHead>
                    <TableHead>{t('smartContracts.deployed')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow
                      key={contract.id}
                      className="hover-elevate cursor-pointer"
                      data-testid={`row-contract-${contract.address?.slice(0, 10) || 'unknown'}`}
                    >
                      <TableCell className="font-semibold">{contract.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(contract.address)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(contract.creator)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatTokenAmount(contract.balance)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(contract.transactionCount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimeAgo(Math.floor(new Date(contract.deployedAt).getTime() / 1000))}
                      </TableCell>
                      <TableCell>
                        {contract.verified ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('smartContracts.verified')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {t('smartContracts.unverified')}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('smartContracts.noContractsDeployed')}</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => setActiveTab("editor")}
                data-testid="button-deploy-first-contract"
              >
                <Code2 className="h-4 w-4 mr-2" />
                {t('smartContracts.goToContractIde')}
              </Button>
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
