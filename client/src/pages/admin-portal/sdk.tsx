import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Download,
  Code,
  Copy,
  Terminal,
  GitBranch,
  Book,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { SiTypescript, SiPython, SiRust, SiGo } from "react-icons/si";

interface SdkVersion {
  lang: string;
  version: string;
  downloads: string;
  icon: any;
}

interface SdkData {
  versions: SdkVersion[];
  changelog: Array<{
    version: string;
    sdk: string;
    description: string;
    date: string;
  }>;
}

export default function SdkManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("typescript");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: sdkData, isLoading, error, refetch } = useQuery<SdkData>({
    queryKey: ["/api/admin/developer/sdk"],
  });

  const defaultSdkVersions: SdkVersion[] = [
    { lang: "TypeScript/JavaScript", version: "4.0.2", downloads: "45K", icon: SiTypescript },
    { lang: "Python", version: "4.0.1", downloads: "32K", icon: SiPython },
    { lang: "Rust", version: "4.0.0", downloads: "18K", icon: SiRust },
    { lang: "Go", version: "4.0.0", downloads: "12K", icon: SiGo },
  ];

  const sdkVersions = sdkData?.versions?.map((v, i) => ({
    ...v,
    icon: defaultSdkVersions[i]?.icon || Package,
  })) || defaultSdkVersions;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminSdk.refreshSuccess"),
        description: t("adminSdk.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminSdk.refreshError"),
        description: t("adminSdk.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("adminSdk.copied"),
      description: t("adminSdk.copiedToClipboard"),
    });
  }, [toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="sdk-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminSdk.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminSdk.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminSdk.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="sdk-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <Package className="h-8 w-8" />
              {t("adminSdk.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminSdk.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t("adminSdk.refresh")}
            </Button>
            <Button variant="outline" data-testid="button-docs">
              <Book className="h-4 w-4 mr-2" />
              {t("adminSdk.fullDocumentation")}
            </Button>
            <Button variant="outline" data-testid="button-github">
              <GitBranch className="h-4 w-4 mr-2" />
              {t("adminSdk.github")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} data-testid={`skeleton-sdk-card-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            sdkVersions.map((sdk, index) => (
              <Card key={sdk.lang} data-testid={`card-sdk-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{sdk.lang}</CardTitle>
                  <sdk.icon className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">v{sdk.version}</div>
                  <p className="text-xs text-muted-foreground">{sdk.downloads} {t("adminSdk.downloadsPerMonth")}</p>
                  <Button variant="outline" size="sm" className="w-full mt-4" data-testid={`button-install-${index}`}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("adminSdk.install")}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-sdk">
            <TabsTrigger value="typescript" className="flex items-center gap-2" data-testid="tab-typescript">
              <SiTypescript className="h-4 w-4" />
              TypeScript
            </TabsTrigger>
            <TabsTrigger value="python" className="flex items-center gap-2" data-testid="tab-python">
              <SiPython className="h-4 w-4" />
              Python
            </TabsTrigger>
            <TabsTrigger value="rust" className="flex items-center gap-2" data-testid="tab-rust">
              <SiRust className="h-4 w-4" />
              Rust
            </TabsTrigger>
            <TabsTrigger value="go" className="flex items-center gap-2" data-testid="tab-go">
              <SiGo className="h-4 w-4" />
              Go
            </TabsTrigger>
          </TabsList>

          <TabsContent value="typescript" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  {t("adminSdk.installation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm flex items-center justify-between">
                  <code>npm install @tburn/sdk</code>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy("npm install @tburn/sdk")} data-testid="button-copy-npm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("adminSdk.orUsingYarn")}: <code className="bg-muted px-2 py-1 rounded">yarn add @tburn/sdk</code>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t("adminSdk.quickStart")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`import { TBurnClient } from '@tburn/sdk';

// Initialize client
const client = new TBurnClient({
  network: 'mainnet',
  apiKey: 'your-api-key'
});

// Get latest block
const block = await client.blocks.getLatest();
console.log('Latest block:', block.height);

// Get wallet balance
const balance = await client.wallets.getBalance('0x1234...5678');
console.log('Balance:', balance.tburn);

// Subscribe to real-time events
client.subscribe('blocks', (block) => {
  console.log('New block:', block.height);
});

// Stake tokens
const tx = await client.staking.delegate({
  validator: '0xabcd...efgh',
  amount: '1000000000000000000' // 1 TBURN
});
console.log('Transaction hash:', tx.hash);`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminSdk.availableModules")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Blocks", "Transactions", "Wallets", "Staking", "Bridge", "DeFi", "Contracts", "Utils"].map((module, i) => (
                    <div key={module} className="p-4 border rounded-lg" data-testid={`module-${i}`}>
                      <h4 className="font-medium">{module}</h4>
                      <p className="text-sm text-muted-foreground">{t(`adminSdk.modules.${module.toLowerCase()}`)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="python" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  {t("adminSdk.installation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm flex items-center justify-between">
                  <code>pip install tburn-sdk</code>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy("pip install tburn-sdk")} data-testid="button-copy-pip">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t("adminSdk.quickStart")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`from tburn import TBurnClient

# Initialize client
client = TBurnClient(
    network='mainnet',
    api_key='your-api-key'
)

# Get latest block
block = client.blocks.get_latest()
print(f'Latest block: {block.height}')

# Get wallet balance
balance = client.wallets.get_balance('0x1234...5678')
print(f'Balance: {balance.tburn} TBURN')

# Async support
import asyncio

async def main():
    async with TBurnAsyncClient() as client:
        block = await client.blocks.get_latest()
        print(f'Latest block: {block.height}')

asyncio.run(main())`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rust" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  {t("adminSdk.installation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("adminSdk.addToCargoToml")}:</p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <pre>{`[dependencies]
tburn-sdk = "4.0"`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t("adminSdk.quickStart")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`use tburn_sdk::{TBurnClient, Config};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = TBurnClient::new(Config {
        network: "mainnet".to_string(),
        api_key: "your-api-key".to_string(),
    })?;

    // Get latest block
    let block = client.blocks().get_latest().await?;
    println!("Latest block: {}", block.height);

    // Get wallet balance
    let balance = client.wallets()
        .get_balance("0x1234...5678")
        .await?;
    println!("Balance: {} TBURN", balance.tburn);

    Ok(())
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="go" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  {t("adminSdk.installation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm flex items-center justify-between">
                  <code>go get github.com/tburn/sdk-go</code>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy("go get github.com/tburn/sdk-go")} data-testid="button-copy-go">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t("adminSdk.quickStart")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`package main

import (
    "fmt"
    "github.com/tburn/sdk-go"
)

func main() {
    client, err := tburn.NewClient(tburn.Config{
        Network: "mainnet",
        APIKey:  "your-api-key",
    })
    if err != nil {
        panic(err)
    }

    // Get latest block
    block, err := client.Blocks.GetLatest()
    if err != nil {
        panic(err)
    }
    fmt.Printf("Latest block: %d\\n", block.Height)

    // Get wallet balance
    balance, err := client.Wallets.GetBalance("0x1234...5678")
    if err != nil {
        panic(err)
    }
    fmt.Printf("Balance: %s TBURN\\n", balance.TBURN)
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              {t("adminSdk.changelog")}
            </CardTitle>
            <CardDescription>{t("adminSdk.recentSdkUpdates")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-6 w-16" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start gap-4" data-testid="changelog-item-0">
                  <Badge>v4.0.2</Badge>
                  <div>
                    <p className="font-medium">{t("adminSdk.typescriptSdk")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSdk.changelog.v402")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">December 1, 2024</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4" data-testid="changelog-item-1">
                  <Badge>v4.0.1</Badge>
                  <div>
                    <p className="font-medium">{t("adminSdk.pythonSdk")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSdk.changelog.v401")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">November 28, 2024</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4" data-testid="changelog-item-2">
                  <Badge>v4.0.0</Badge>
                  <div>
                    <p className="font-medium">{t("adminSdk.allSdks")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSdk.changelog.v400")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">November 15, 2024</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
