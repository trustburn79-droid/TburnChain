import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { 
  Radio, Server, Shield, Zap, Activity, Copy, Check, 
  Play, Pause, Terminal, Globe, Network, ArrowRight, 
  RefreshCw, ExternalLink, Clock, Database, Heart,
  Box, ArrowRightLeft, LineChart, Coins, Code2, Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WS_ENDPOINT = "wss://tburn.io/ws";
const CHAIN_ID = 5800;

const subscriptionChannels = [
  {
    name: "newHeads",
    icon: Box,
    color: "#00f0ff",
    description: "새 블록 헤더 실시간 스트리밍",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_subscribe",
  "params": ["newHeads"]
}`
  },
  {
    name: "logs",
    icon: LineChart,
    color: "#7000ff",
    description: "스마트 컨트랙트 이벤트 로그 구독",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_subscribe",
  "params": ["logs", {
    "address": "0x...",
    "topics": ["0x..."]
  }]
}`
  },
  {
    name: "newPendingTransactions",
    icon: ArrowRightLeft,
    color: "#00ff9d",
    description: "펜딩 트랜잭션 실시간 모니터링",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_subscribe",
  "params": ["newPendingTransactions"]
}`
  },
  {
    name: "syncing",
    icon: RefreshCw,
    color: "#ffd700",
    description: "노드 동기화 상태 변경 알림",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_subscribe",
  "params": ["syncing"]
}`
  },
];

const tburnChannels = [
  {
    name: "consensus",
    icon: Shield,
    color: "#7000ff",
    description: "5-Phase BFT 합의 프로세스 실시간 추적",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tburn_subscribe",
  "params": ["consensus", {
    "phases": ["all"],
    "includeVotes": true
  }]
}`
  },
  {
    name: "validators",
    icon: Server,
    color: "#00ff9d",
    description: "125개 검증자 상태 및 보상 모니터링",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tburn_subscribe",
  "params": ["validators", {
    "events": ["status.change", "reward.distributed"]
  }]
}`
  },
  {
    name: "shards",
    icon: Network,
    color: "#ffd700",
    description: "64개 샤드 간 메시지 라우팅 및 로드밸런싱",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tburn_subscribe",
  "params": ["shards", {
    "shardIds": [1, 2, 3],
    "events": ["message.routed", "load.update"]
  }]
}`
  },
  {
    name: "burn-events",
    icon: Coins,
    color: "#ff6b35",
    description: "토큰 소각 이벤트 실시간 알림",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tburn_subscribe",
  "params": ["burnEvents", {
    "minAmount": "1000000000000000000"
  }]
}`
  },
];

interface LiveMessage {
  id: number;
  type: string;
  data: string;
  timestamp: Date;
}

export default function WebSocketMainnet() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [latency, setLatency] = useState(12);
  const [blockHeight, setBlockHeight] = useState(28394560);
  const messageIdRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(8, Math.min(20, prev + (Math.random() > 0.5 ? 1 : -1))));
      setBlockHeight(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        const types = ["newBlock", "transaction", "consensus", "validator"];
        const type = types[Math.floor(Math.random() * types.length)];
        const newMessage: LiveMessage = {
          id: messageIdRef.current++,
          type,
          data: generateMockData(type),
          timestamp: new Date()
        };
        setLiveMessages(prev => [newMessage, ...prev].slice(0, 50));
        setMessageCount(prev => prev + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const generateMockData = (type: string) => {
    switch (type) {
      case "newBlock":
        return `{"number": ${blockHeight}, "hash": "0x${Math.random().toString(16).slice(2, 10)}...", "transactions": ${Math.floor(Math.random() * 100)}}`;
      case "transaction":
        return `{"hash": "0x${Math.random().toString(16).slice(2, 10)}...", "value": "${(Math.random() * 100).toFixed(4)} TBURN"}`;
      case "consensus":
        const phases = ["PROPOSE", "PREVOTE", "PRECOMMIT", "COMMIT", "FINALIZE"];
        return `{"phase": "${phases[Math.floor(Math.random() * phases.length)]}", "round": ${Math.floor(Math.random() * 3)}}`;
      case "validator":
        return `{"validator": "0x742d35Cc...", "event": "block.proposed", "reward": "${(Math.random() * 10).toFixed(2)} TBURN"}`;
      default:
        return "{}";
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: "복사됨!", description: "클립보드에 복사되었습니다." });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleConnect = () => {
    setIsConnecting(true);
    toast({ title: "WebSocket 연결 중...", description: WS_ENDPOINT });
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setMessageCount(0);
      setLiveMessages([]);
      toast({ title: "연결 성공!", description: "실시간 데이터 스트리밍이 시작되었습니다." });
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({ title: "연결 해제됨", description: "WebSocket 연결이 종료되었습니다." });
  };

  const quickConnectCode = `const ws = new WebSocket('${WS_ENDPOINT}');

ws.onopen = () => {
  console.log('Connected to TBURN Mainnet');
  
  // Subscribe to new blocks
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_subscribe',
    params: ['newHeads']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};`;

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative pt-4 pb-16 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#7000ff]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff]">
                  <Radio className="w-3.5 h-3.5" /> WebSocket API
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-medium text-orange-400">
                  <Globe className="w-3.5 h-3.5" /> MAINNET
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-medium text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Operational
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight" data-testid="text-title">
                TBURN Mainnet<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#7000ff]">
                  WebSocket Endpoint
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Chain ID {CHAIN_ID} 메인넷에 실시간으로 연결하세요. 블록, 트랜잭션, 합의 이벤트를 
                밀리초 단위 지연 시간으로 스트리밍합니다. 210,000+ TPS 처리량을 지원합니다.
              </p>

              <div className="grid grid-cols-4 gap-3 mb-8">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">99.99%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-[#00f0ff]">{latency}ms</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Latency</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-[#00ff9d]">210K</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">TPS</div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                  <div className="text-xl font-mono font-bold text-[#7000ff]">64</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Shards</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!isConnected ? (
                  <Button 
                    size="lg" 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] hover:opacity-90 text-white"
                    data-testid="button-connect"
                  >
                    {isConnecting ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> 연결 중...</>
                    ) : (
                      <><Play className="w-4 h-4 mr-2" /> 실시간 연결</>
                    )}
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={handleDisconnect}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    data-testid="button-disconnect"
                  >
                    <Pause className="w-4 h-4 mr-2" /> 연결 해제
                  </Button>
                )}
                <a href="/rpc" data-testid="link-rpc">
                  <Button size="lg" variant="outline" className="border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/10">
                    <Server className="w-4 h-4 mr-2" /> HTTP RPC
                  </Button>
                </a>
                <a href="/developers/websocket" data-testid="link-docs">
                  <Button size="lg" variant="outline">
                    <Code2 className="w-4 h-4 mr-2" /> API 문서
                  </Button>
                </a>
              </div>
            </div>

            <Card className="w-full lg:w-[420px] bg-gray-900/50 border-[#00f0ff]/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#00f0ff]" />
                    WebSocket Endpoint
                  </CardTitle>
                  <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-500/20 text-green-400" : ""}>
                    {isConnected ? "Connected" : "Ready"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Mainnet WebSocket</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(WS_ENDPOINT, 'ws-url')}
                      data-testid="button-copy-url"
                    >
                      {copiedCode === 'ws-url' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <code className="text-sm font-mono text-[#00f0ff] break-all" data-testid="text-endpoint">
                    {WS_ENDPOINT}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-center">
                    <div className="text-xs text-gray-400 mb-1">Chain ID</div>
                    <div className="text-lg font-mono font-bold text-white">{CHAIN_ID}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-center">
                    <div className="text-xs text-gray-400 mb-1">Block Height</div>
                    <div className="text-lg font-mono font-bold text-[#00ff9d]">{blockHeight.toLocaleString()}</div>
                  </div>
                </div>

                {isConnected && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                      <span className="text-sm font-medium text-green-400">Live Stream Active</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Messages received: <span className="text-white font-mono">{messageCount}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <Tabs defaultValue="quickstart" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="quickstart" data-testid="tab-quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="tburn-channels" data-testid="tab-tburn">TBURN Channels</TabsTrigger>
            <TabsTrigger value="live" data-testid="tab-live">Live Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-6">
            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#00f0ff]" />
                  JavaScript Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-black/70 text-sm font-mono overflow-x-auto">
                    <code className="text-gray-300">{quickConnectCode}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(quickConnectCode, 'quick-connect')}
                    data-testid="button-copy-quickstart"
                  >
                    {copiedCode === 'quick-connect' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gray-900/50 border-white/10">
                <CardContent className="p-6 text-center">
                  <Zap className="w-10 h-10 mx-auto mb-4 text-[#ffd700]" />
                  <h3 className="font-semibold mb-2">Ultra-Low Latency</h3>
                  <p className="text-sm text-gray-400">~12ms average latency for real-time updates</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-white/10">
                <CardContent className="p-6 text-center">
                  <Shield className="w-10 h-10 mx-auto mb-4 text-[#00ff9d]" />
                  <h3 className="font-semibold mb-2">Secure Connection</h3>
                  <p className="text-sm text-gray-400">TLS 1.3 encrypted WebSocket connection</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-white/10">
                <CardContent className="p-6 text-center">
                  <Heart className="w-10 h-10 mx-auto mb-4 text-[#ff0055]" />
                  <h3 className="font-semibold mb-2">Auto-Reconnect</h3>
                  <p className="text-sm text-gray-400">Built-in heartbeat and reconnection logic</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {subscriptionChannels.map((channel) => (
                <Card key={channel.name} className="bg-gray-900/50 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <channel.icon className="w-5 h-5" style={{ color: channel.color }} />
                      {channel.name}
                    </CardTitle>
                    <p className="text-sm text-gray-400">{channel.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="p-3 rounded-lg bg-black/70 text-xs font-mono overflow-x-auto">
                        <code className="text-gray-300">{channel.code}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => copyToClipboard(channel.code, channel.name)}
                      >
                        {copiedCode === channel.name ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tburn-channels" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {tburnChannels.map((channel) => (
                <Card key={channel.name} className="bg-gray-900/50 border-white/10" data-testid={`channel-${channel.name}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${channel.color}20` }}>
                        <channel.icon className="w-5 h-5" style={{ color: channel.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1" style={{ borderColor: channel.color, color: channel.color }}>
                          TBURN Custom
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{channel.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="p-3 rounded-lg bg-black/70 text-xs font-mono overflow-x-auto max-h-40">
                        <code className="text-gray-300">{channel.code}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => copyToClipboard(channel.code, `tburn-${channel.name}`)}
                      >
                        {copiedCode === `tburn-${channel.name}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className={`w-5 h-5 ${isConnected ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
                    Live Message Feed
                  </CardTitle>
                  {!isConnected && (
                    <Button 
                      size="sm" 
                      onClick={handleConnect}
                      className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff]"
                    >
                      <Play className="w-4 h-4 mr-1" /> Start Stream
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Radio className="w-12 h-12 mb-4 opacity-50" />
                    <p>Connect to see live messages</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {liveMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className="p-3 rounded-lg bg-black/50 border border-white/5 flex items-start gap-3"
                      >
                        <Badge 
                          variant="outline" 
                          className={`text-xs shrink-0 ${
                            msg.type === 'newBlock' ? 'border-[#00f0ff] text-[#00f0ff]' :
                            msg.type === 'transaction' ? 'border-[#00ff9d] text-[#00ff9d]' :
                            msg.type === 'consensus' ? 'border-[#7000ff] text-[#7000ff]' :
                            'border-[#ffd700] text-[#ffd700]'
                          }`}
                        >
                          {msg.type}
                        </Badge>
                        <code className="text-xs font-mono text-gray-300 flex-1 break-all">{msg.data}</code>
                        <span className="text-xs text-gray-500 shrink-0">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section className="bg-gray-100 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Need More?</h2>
            <p className="text-gray-600 dark:text-gray-400">Explore other endpoints and documentation</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <a href="/rpc" className="block" data-testid="link-http-rpc">
              <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-white/10 hover:border-[#00f0ff]/50 transition-colors h-full">
                <CardContent className="p-6 text-center">
                  <Server className="w-8 h-8 mx-auto mb-3 text-[#00f0ff]" />
                  <h3 className="font-semibold mb-1">HTTP RPC</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">REST API endpoints</p>
                </CardContent>
              </Card>
            </a>
            <a href="/testnet-websocket" className="block" data-testid="link-testnet-websocket">
              <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-white/10 hover:border-[#ffd700]/50 transition-colors h-full">
                <CardContent className="p-6 text-center">
                  <Radio className="w-8 h-8 mx-auto mb-3 text-[#ffd700]" />
                  <h3 className="font-semibold mb-1">Testnet WS</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Test network WebSocket</p>
                </CardContent>
              </Card>
            </a>
            <a href="/developers/websocket" className="block" data-testid="link-api-docs">
              <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-white/10 hover:border-[#7000ff]/50 transition-colors h-full">
                <CardContent className="p-6 text-center">
                  <Code2 className="w-8 h-8 mx-auto mb-3 text-[#7000ff]" />
                  <h3 className="font-semibold mb-1">API Docs</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full documentation</p>
                </CardContent>
              </Card>
            </a>
            <a href="/rpc/benchmark" className="block" data-testid="link-benchmark">
              <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-white/10 hover:border-[#00ff9d]/50 transition-colors h-full">
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-3 text-[#00ff9d]" />
                  <h3 className="font-semibold mb-1">Benchmark</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Performance testing</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
