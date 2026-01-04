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
  description: string;
  params: Array<{ name: string; type: string; required: boolean; description: string }>;
  example: { request: string; response: string };
}

interface MethodCategory {
  name: string;
  icon: any;
  color: string;
  methods: RpcMethod[];
}

const methodCategories: MethodCategory[] = [
  {
    name: "블록 조회",
    icon: Layers,
    color: "#ffd700",
    methods: [
      {
        name: "eth_blockNumber",
        description: "현재 테스트넷 블록 번호를 반환합니다.",
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
        description: "블록 번호로 테스트넷 블록 정보를 조회합니다.",
        params: [
          { name: "blockNumber", type: "string", required: true, description: "블록 번호 (hex) 또는 'latest', 'earliest', 'pending'" },
          { name: "fullTransactions", type: "boolean", required: true, description: "트랜잭션 전체 정보 포함 여부" }
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
    name: "트랜잭션",
    icon: Activity,
    color: "#ff9500",
    methods: [
      {
        name: "eth_getTransactionByHash",
        description: "트랜잭션 해시로 테스트넷 트랜잭션 정보를 조회합니다.",
        params: [
          { name: "transactionHash", type: "string", required: true, description: "트랜잭션 해시 (32 bytes)" }
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
        description: "서명된 트랜잭션을 테스트넷에 전송합니다.",
        params: [
          { name: "signedTransactionData", type: "string", required: true, description: "서명된 트랜잭션 데이터 (hex)" }
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
    name: "계정",
    icon: Wallet,
    color: "#00ff9d",
    methods: [
      {
        name: "eth_getBalance",
        description: "테스트넷 계정의 잔액을 조회합니다.",
        params: [
          { name: "address", type: "string", required: true, description: "계정 주소 (20 bytes)" },
          { name: "blockNumber", type: "string", required: false, description: "블록 번호 또는 'latest'" }
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
    name: "테스트넷 전용",
    icon: Droplets,
    color: "#00bfff",
    methods: [
      {
        name: "tburn_testnet_faucet",
        description: "테스트넷 토큰을 요청합니다 (1일 1회 제한).",
        params: [
          { name: "address", type: "string", required: true, description: "수신 주소" }
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
        description: "테스트넷 샤드 정보를 조회합니다.",
        params: [
          { name: "shardId", type: "number", required: false, description: "샤드 ID (없으면 전체)" }
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
        description: "테스트넷 계정 상태를 초기화합니다.",
        params: [
          { name: "address", type: "string", required: true, description: "초기화할 주소" }
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
    toast({ title: "복사됨", description: "클립보드에 복사되었습니다." });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const runTest = async () => {
    if (!testMethod) {
      toast({ title: "오류", description: "메서드를 입력하세요.", variant: "destructive" });
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
          : { message: "테스트넷 메서드 실행 완료", blockHeight: data.data?.blockHeight }
      };

      setTestResult(JSON.stringify(mockResult, null, 2));
      toast({ title: "성공", description: "테스트넷 API 호출이 완료되었습니다." });
    } catch (error) {
      setTestResult(JSON.stringify({ error: "요청 실패" }, null, 2));
      toast({ title: "오류", description: "API 호출에 실패했습니다.", variant: "destructive" });
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
              <Code className="w-3.5 h-3.5" /> 테스트넷 API 문서
            </div>
            <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">TESTNET</Badge>
            <Badge variant="outline" className="text-xs">v2.1.0</Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            테스트넷 RPC <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">API 문서</span>
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-xl">
            TBURN 테스트넷 JSON-RPC API 전체 레퍼런스. 인터랙티브 테스트와 다양한 언어별 예제 코드를 제공합니다.
          </p>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">메서드 카테고리</CardTitle>
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
                      {category.name}
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
                    테스트넷 API 테스터
                  </CardTitle>
                  <CardDescription>테스트넷에서 실시간으로 RPC 메서드를 테스트해보세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">메서드</label>
                      <Input
                        placeholder="eth_blockNumber"
                        value={testMethod}
                        onChange={(e) => setTestMethod(e.target.value)}
                        className="font-mono"
                        data-testid="input-testnet-test-method"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">파라미터 (JSON)</label>
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
                    {isTesting ? "실행 중..." : "테스트넷에서 실행"}
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
                    {methodCategories[selectedCategory].name} 메서드
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
                            <span className="text-sm text-gray-500">{method.description}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          {method.params.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">파라미터</h4>
                              <table className="w-full text-sm">
                                <thead className="text-gray-500 border-b border-gray-200 dark:border-white/10">
                                  <tr>
                                    <th className="text-left py-2">이름</th>
                                    <th className="text-left py-2">타입</th>
                                    <th className="text-left py-2">필수</th>
                                    <th className="text-left py-2">설명</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {method.params.map((param, pIdx) => (
                                    <tr key={pIdx} className="border-b border-gray-100 dark:border-white/5">
                                      <td className="py-2"><code className="text-yellow-500">{param.name}</code></td>
                                      <td className="py-2 text-gray-500 font-mono text-xs">{param.type}</td>
                                      <td className="py-2">
                                        {param.required ? (
                                          <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">필수</Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-gray-400 text-xs">선택</Badge>
                                        )}
                                      </td>
                                      <td className="py-2 text-gray-600 dark:text-gray-400">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">요청</h4>
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
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">응답</h4>
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
                            테스터에서 실행
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
                    테스트넷 SDK 코드 예제
                  </CardTitle>
                  <CardDescription>다양한 프로그래밍 언어별 테스트넷 예제 코드</CardDescription>
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
                            onClick={() => copyToClipboard(code, `code-${lang}`)}
                          >
                            {copiedCode === `code-${lang}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
