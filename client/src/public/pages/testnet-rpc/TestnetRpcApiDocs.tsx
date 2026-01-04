import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Code, Terminal, Copy, Check, Play, Loader2, ChevronDown, ChevronRight,
  Server, Layers, Activity, Wallet, FileCode, Coins, TrendingUp, Link2,
  Zap, Globe, Key, Clock, Shield, Database, Box, Hash, Search, Sparkles, Droplets
} from "lucide-react";
import { SiJavascript, SiPython, SiGo, SiRust, SiTypescript } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RpcMethod {
  name: string;
  descriptionKey: string;
  params: Array<{ name: string; type: string; required: boolean; descriptionKey: string }>;
  example: { request: string; response: string };
}

interface MethodCategory {
  nameKey: string;
  icon: any;
  color: string;
  methods: RpcMethod[];
}

const methodCategories: MethodCategory[] = [
  {
    nameKey: "rpc.docs.categoryBlocks",
    icon: Layers,
    color: "#ffd700",
    methods: [
      {
        name: "eth_blockNumber",
        descriptionKey: "rpc.docs.methods.ethBlockNumber.description",
        params: [],
        example: {
          request: `{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}`,
          response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x826a7d"
}`
        }
      },
      {
        name: "eth_getBlockByNumber",
        descriptionKey: "rpc.docs.methods.ethGetBlockByNumber.description",
        params: [
          { name: "blockNumber", type: "string", required: true, descriptionKey: "rpc.docs.methods.ethGetBlockByNumber.paramBlockNumber" },
          { name: "fullTransactions", type: "boolean", required: true, descriptionKey: "rpc.docs.methods.ethGetBlockByNumber.paramFullTransactions" }
        ],
        example: {
          request: `{
  "jsonrpc": "2.0",
  "method": "eth_getBlockByNumber",
  "params": ["latest", true],
  "id": 1
}`,
          response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "number": "0x826a7d",
    "hash": "0x...",
    "parentHash": "0x...",
    "transactions": [...]
  }
}`
        }
      }
    ]
  },
  {
    nameKey: "rpc.docs.categoryTransactions",
    icon: Activity,
    color: "#ff9500",
    methods: [
      {
        name: "eth_getTransactionByHash",
        descriptionKey: "rpc.docs.methods.ethGetTransactionByHash.description",
        params: [
          { name: "transactionHash", type: "string", required: true, descriptionKey: "rpc.docs.methods.ethGetTransactionByHash.paramTransactionHash" }
        ],
        example: {
          request: `{
  "jsonrpc": "2.0",
  "method": "eth_getTransactionByHash",
  "params": ["0x..."],
  "id": 1
}`,
          response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "hash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "value": "0x..."
  }
}`
        }
      },
      {
        name: "eth_sendRawTransaction",
        descriptionKey: "rpc.docs.methods.ethSendRawTransaction.description",
        params: [
          { name: "signedTransactionData", type: "string", required: true, descriptionKey: "rpc.docs.methods.ethSendRawTransaction.paramSignedTransactionData" }
        ],
        example: {
          request: `{
  "jsonrpc": "2.0",
  "method": "eth_sendRawTransaction",
  "params": ["0xf86c..."],
  "id": 1
}`,
          response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x..."
}`
        }
      }
    ]
  },
  {
    nameKey: "rpc.docs.categoryAccounts",
    icon: Wallet,
    color: "#00ff9d",
    methods: [
      {
        name: "eth_getBalance",
        descriptionKey: "rpc.docs.methods.ethGetBalance.description",
        params: [
          { name: "address", type: "string", required: true, descriptionKey: "rpc.docs.methods.ethGetBalance.paramAddress" },
          { name: "blockNumber", type: "string", required: false, descriptionKey: "rpc.docs.methods.ethGetBalance.paramBlockNumber" }
        ],
        example: {
          request: `{
  "jsonrpc": "2.0",
  "method": "eth_getBalance",
  "params": ["0x...", "latest"],
  "id": 1
}`,
          response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x0234c8a3397aab58"
}`
        }
      }
    ]
  },
  {
    nameKey: "rpc.docs.categoryTestnet",
    icon: Droplets,
    color: "#00bfff",
    methods: [
      {
        name: "tburn_testnet_faucet",
        descriptionKey: "rpc.docs.methods.tburnTestnetFaucet.description",
        params: [
          { name: "address", type: "string", required: true, descriptionKey: "rpc.docs.methods.tburnTestnetFaucet.paramAddress" }
        ],
        example: {
          request: `{
  "jsonrpc": "2.0",
  "method": "tburn_testnet_faucet",
  "params": ["0x..."],
  "id": 1
}`,
          response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "txHash": "0x...",
    "amount": "100000000000000000000",
    "nextAvailable": "2026-01-05T22:00:00Z"
  }
}`
        }
      },
      {
        name: "tburn_testnet_getShardInfo",
        descriptionKey: "rpc.docs.methods.tburnGetShardInfo.description",
        params: [
          { name: "shardId", type: "number", required: false, descriptionKey: "rpc.docs.methods.tburnGetShardInfo.paramShardId" }
        ],
        example: {
          request: `{
  "jsonrpc": "2.0",
  "method": "tburn_testnet_getShardInfo",
  "params": [],
  "id": 1
}`,
          response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "totalShards": 8,
    "activeShards": 4,
    "tps": 15000
  }
}`
        }
      },
      {
        name: "tburn_testnet_resetAccount",
        descriptionKey: "rpc.docs.methods.tburnTestnetResetAccount.description",
        params: [
          { name: "address", type: "string", required: true, descriptionKey: "rpc.docs.methods.tburnTestnetResetAccount.paramAddress" }
        ],
        example: {
          request: `{
  "jsonrpc": "2.0",
  "method": "tburn_testnet_resetAccount",
  "params": ["0x..."],
  "id": 1
}`,
          response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "success": true,
    "newBalance": "1000000000000000000000"
  }
}`
        }
      }
    ]
  }
];

const codeExamples = {
  javascript: `const response = await fetch('https://testnet.tburn.io/rpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
  })
});
const data = await response.json();
console.log('Testnet Block:', parseInt(data.result, 16));`,

  typescript: `import { TBurnClient } from '@tburn/sdk';

const client = new TBurnClient({
  network: 'testnet'  // No API key needed for testnet
});

const blockNumber = await client.getBlockNumber();
const block = await client.getBlock(blockNumber);
console.log('Testnet block:', block);`,

  python: `from tburn import TBurnClient

client = TBurnClient(
    network="testnet"  # No API key needed for testnet
)

block_number = client.get_block_number()
block = client.get_block(block_number)
print(f"Testnet block: {block}")`,

  go: `package main

import (
    "github.com/tburn/go-sdk"
)

func main() {
    client := tburn.NewClient(tburn.Config{
        Network: "testnet",  // No API key needed for testnet
    })
    
    blockNumber, _ := client.GetBlockNumber()
    block, _ := client.GetBlock(blockNumber)
    fmt.Printf("Testnet block: %v\\n", block)
}`,

  rust: `use tburn_sdk::TBurnClient;

#[tokio::main]
async fn main() {
    let client = TBurnClient::new(
        tburn_sdk::Network::Testnet  // No API key needed for testnet
    );
    
    let block_number = client.get_block_number().await?;
    let block = client.get_block(block_number).await?;
    println!("Testnet block: {:?}", block);
}`
};

export default function TestnetRpcApiDocs() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testMethod, setTestMethod] = useState("");
  const [testParams, setTestParams] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedLang, setSelectedLang] = useState<keyof typeof codeExamples>("javascript");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast({ title: t('rpc.shared.copied'), description: t('rpc.shared.copiedToClipboard') });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const runTest = async () => {
    if (!testMethod) {
      toast({ title: t('rpc.shared.error'), description: t('rpc.docs.method'), variant: "destructive" });
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);

    try {
      let params: any[] = [];
      if (testParams.trim()) {
        try {
          params = JSON.parse(testParams);
        } catch {
          params = [testParams];
        }
      }

      const response = await fetch('/api/public/v1/testnet/stats');
      const data = await response.json();
      
      const mockResult = {
        jsonrpc: "2.0",
        id: 1,
        result: testMethod === 'eth_blockNumber' 
          ? `0x${(data.data?.blockHeight || 8542109).toString(16)}`
          : testMethod === 'eth_chainId'
          ? "0x177a"
          : testMethod === 'net_version'
          ? "6010"
          : { message: "Testnet method executed", blockHeight: data.data?.blockHeight }
      };

      setTestResult(JSON.stringify(mockResult, null, 2));
      toast({ title: t('rpc.shared.success'), description: t('rpc.shared.testnetApiCallSuccess') });
    } catch (error) {
      setTestResult(JSON.stringify({ error: t('rpc.shared.requestFailed') }, null, 2));
      toast({ title: t('rpc.shared.error'), description: t('rpc.shared.apiCallFailed'), variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

  const langIcons: Record<string, any> = {
    javascript: SiJavascript,
    typescript: SiTypescript,
    python: SiPython,
    go: SiGo,
    rust: SiRust
  };

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative py-8 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-mono text-orange-400">
              <Code className="w-3.5 h-3.5" /> {t('rpc.docs.testnetBadge')}
            </div>
            <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">TESTNET</Badge>
            <Badge variant="outline" className="text-xs">v2.1.0</Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {t('rpc.docs.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{t('rpc.docs.heroHighlight')}</span>
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-xl">
            {t('rpc.docs.testnetHeroDesc')}
          </p>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t('rpc.docs.methodCategories')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {methodCategories.map((category, idx) => (
                    <Button
                      key={idx}
                      variant={selectedCategory === idx ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(idx)}
                      data-testid={`nav-testnet-category-${idx}`}
                    >
                      <category.icon className="w-4 h-4 mr-2" style={{ color: category.color }} />
                      {t(category.nameKey)}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {category.methods.length}
                      </Badge>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 space-y-8">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-yellow-500" />
                    {t('rpc.docs.testnetApiTester')}
                  </CardTitle>
                  <CardDescription>{t('rpc.docs.testnetApiTesterDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('rpc.docs.method')}</label>
                      <Input
                        placeholder="eth_blockNumber"
                        value={testMethod}
                        onChange={(e) => setTestMethod(e.target.value)}
                        className="font-mono"
                        data-testid="input-testnet-test-method"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('rpc.docs.parameters')}</label>
                      <Input
                        placeholder='["latest", true]'
                        value={testParams}
                        onChange={(e) => setTestParams(e.target.value)}
                        className="font-mono"
                        data-testid="input-testnet-test-params"
                      />
                    </div>
                  </div>
                  <Button onClick={runTest} disabled={isTesting} className="bg-yellow-500 hover:bg-yellow-600" data-testid="button-testnet-run-test">
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isTesting ? t('rpc.shared.running') : t('rpc.docs.runOnTestnet')}
                  </Button>
                  {testResult && (
                    <div className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(testResult, 'result')}
                      >
                        {copiedCode === 'result' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm font-mono overflow-x-auto" data-testid="text-testnet-test-result">
                        {testResult}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = methodCategories[selectedCategory].icon;
                      return <Icon className="w-5 h-5" style={{ color: methodCategories[selectedCategory].color }} />;
                    })()}
                    {t(methodCategories[selectedCategory].nameKey)} {t('rpc.docs.methods')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {methodCategories[selectedCategory].methods.map((method, idx) => (
                      <AccordionItem 
                        key={idx} 
                        value={method.name}
                        className="border border-gray-200 dark:border-white/10 rounded-lg px-4"
                        data-testid={`accordion-testnet-${method.name}`}
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3">
                            <code className="text-sm font-mono text-yellow-500">{method.name}</code>
                            <span className="text-sm text-gray-500">{method.descriptionKey}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          {method.params.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('rpc.docs.parameters')}</h4>
                              <table className="w-full text-sm">
                                <thead className="text-gray-500 border-b border-gray-200 dark:border-white/10">
                                  <tr>
                                    <th className="text-left py-2">{t('rpc.docs.paramName')}</th>
                                    <th className="text-left py-2">{t('rpc.docs.paramType')}</th>
                                    <th className="text-left py-2">{t('rpc.docs.paramRequired')}</th>
                                    <th className="text-left py-2">{t('rpc.docs.paramDescription')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {method.params.map((param, pIdx) => (
                                    <tr key={pIdx} className="border-b border-gray-100 dark:border-white/5">
                                      <td className="py-2"><code className="text-yellow-500">{param.name}</code></td>
                                      <td className="py-2 text-gray-500 font-mono text-xs">{param.type}</td>
                                      <td className="py-2">
                                        {param.required ? (
                                          <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">{t('rpc.shared.required')}</Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-gray-400 text-xs">{t('rpc.shared.optional')}</Badge>
                                        )}
                                      </td>
                                      <td className="py-2 text-gray-600 dark:text-gray-400">{param.descriptionKey}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('rpc.docs.request')}</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(method.example.request, `req-${method.name}`)}
                                >
                                  {copiedCode === `req-${method.name}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                              <pre className="bg-gray-900 text-gray-300 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                                {method.example.request}
                              </pre>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('rpc.docs.response')}</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(method.example.response, `res-${method.name}`)}
                                >
                                  {copiedCode === `res-${method.name}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                              <pre className="bg-gray-900 text-gray-300 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                                {method.example.response}
                              </pre>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                              setTestMethod(method.name);
                              setTestParams(method.params.length > 0 ? '[]' : '');
                            }}
                          >
                            <Play className="w-3 h-3 mr-2" />
                            {t('rpc.docs.runInTester')}
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-orange-500" />
                    {t('rpc.docs.testnetSdkExamples')}
                  </CardTitle>
                  <CardDescription>{t('rpc.docs.testnetSdkExamplesDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedLang} onValueChange={(v) => setSelectedLang(v as keyof typeof codeExamples)}>
                    <TabsList className="mb-4">
                      {Object.keys(codeExamples).map((lang) => {
                        const Icon = langIcons[lang];
                        return (
                          <TabsTrigger key={lang} value={lang} className="gap-2" data-testid={`tab-testnet-lang-${lang}`}>
                            <Icon className="w-4 h-4" />
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    {Object.entries(codeExamples).map(([lang, code]) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="relative">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(code, `sdk-${lang}`)}
                          >
                            {copiedCode === `sdk-${lang}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                            {code}
                          </pre>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
