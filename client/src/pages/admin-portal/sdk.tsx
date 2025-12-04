import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Download,
  Code,
  Copy,
  ExternalLink,
  CheckCircle,
  Terminal,
  FileCode,
  GitBranch,
  Book,
  Zap,
} from "lucide-react";
import { SiTypescript, SiJavascript, SiPython, SiRust, SiGo } from "react-icons/si";

export default function SdkManagement() {
  const [activeTab, setActiveTab] = useState("typescript");

  const sdkVersions = [
    { lang: "TypeScript/JavaScript", version: "4.0.2", downloads: "45K", icon: SiTypescript },
    { lang: "Python", version: "4.0.1", downloads: "32K", icon: SiPython },
    { lang: "Rust", version: "4.0.0", downloads: "18K", icon: SiRust },
    { lang: "Go", version: "4.0.0", downloads: "12K", icon: SiGo },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8" />
              SDK Management
            </h1>
            <p className="text-muted-foreground">SDK 관리 | Developer SDKs and client libraries</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-docs">
              <Book className="h-4 w-4 mr-2" />
              Full Documentation
            </Button>
            <Button variant="outline" data-testid="button-github">
              <GitBranch className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>

        {/* SDK Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sdkVersions.map((sdk) => (
            <Card key={sdk.lang}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{sdk.lang}</CardTitle>
                <sdk.icon className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v{sdk.version}</div>
                <p className="text-xs text-muted-foreground">{sdk.downloads} downloads/month</p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="typescript" className="flex items-center gap-2">
              <SiTypescript className="h-4 w-4" />
              TypeScript
            </TabsTrigger>
            <TabsTrigger value="python" className="flex items-center gap-2">
              <SiPython className="h-4 w-4" />
              Python
            </TabsTrigger>
            <TabsTrigger value="rust" className="flex items-center gap-2">
              <SiRust className="h-4 w-4" />
              Rust
            </TabsTrigger>
            <TabsTrigger value="go" className="flex items-center gap-2">
              <SiGo className="h-4 w-4" />
              Go
            </TabsTrigger>
          </TabsList>

          <TabsContent value="typescript" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm flex items-center justify-between">
                  <code>npm install @tburn/sdk</code>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Or using yarn: <code className="bg-muted px-2 py-1 rounded">yarn add @tburn/sdk</code>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Quick Start
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
                <CardTitle>Available Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Blocks</h4>
                    <p className="text-sm text-muted-foreground">Block queries</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Transactions</h4>
                    <p className="text-sm text-muted-foreground">TX handling</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Wallets</h4>
                    <p className="text-sm text-muted-foreground">Wallet ops</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Staking</h4>
                    <p className="text-sm text-muted-foreground">Stake management</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Bridge</h4>
                    <p className="text-sm text-muted-foreground">Cross-chain</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">DeFi</h4>
                    <p className="text-sm text-muted-foreground">DEX & Lending</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Contracts</h4>
                    <p className="text-sm text-muted-foreground">Smart contracts</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Utils</h4>
                    <p className="text-sm text-muted-foreground">Helper functions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="python" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm flex items-center justify-between">
                  <code>pip install tburn-sdk</code>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Quick Start
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
                  Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Add to your Cargo.toml:</p>
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
                  Quick Start
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
                  Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm flex items-center justify-between">
                  <code>go get github.com/tburn/sdk-go</code>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Quick Start
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

        {/* Changelog */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Changelog
            </CardTitle>
            <CardDescription>Recent SDK updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Badge>v4.0.2</Badge>
              <div>
                <p className="font-medium">TypeScript SDK</p>
                <p className="text-sm text-muted-foreground">
                  Fixed WebSocket reconnection issue, improved type definitions
                </p>
                <p className="text-xs text-muted-foreground mt-1">December 1, 2024</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-4">
              <Badge>v4.0.1</Badge>
              <div>
                <p className="font-medium">Python SDK</p>
                <p className="text-sm text-muted-foreground">
                  Added async support, fixed balance formatting
                </p>
                <p className="text-xs text-muted-foreground mt-1">November 28, 2024</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-4">
              <Badge>v4.0.0</Badge>
              <div>
                <p className="font-medium">All SDKs</p>
                <p className="text-sm text-muted-foreground">
                  Major release with support for v4.0 API, new staking module, bridge integration
                </p>
                <p className="text-xs text-muted-foreground mt-1">November 15, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
