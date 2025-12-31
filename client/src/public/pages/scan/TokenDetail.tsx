import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Users,
  Layers,
  ArrowLeft,
  Activity,
  Wallet,
  BarChart3,
  Clock
} from "lucide-react";
import { useCallback, useMemo } from "react";
import ScanLayout from "../../components/ScanLayout";
import { useToast } from "@/hooks/use-toast";
import { generateTb1Address } from "@/lib/utils";

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders: number;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
  type: 'TBC-20' | 'TBC-721' | 'TBC-1155';
  contractCreator: string;
  createdAt: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

interface Transfer {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
}

interface Holder {
  address: string;
  balance: string;
  percentage: string;
}

const createMockTokens = (): Record<string, TokenInfo> => ({
  'tb1...tburn': {
    address: generateTb1Address('tburn-token-main'),
    name: 'TBURN Token',
    symbol: 'TBURN',
    decimals: 18,
    totalSupply: '10,000,000,000',
    holders: 1256780,
    price: '$2.47',
    change24h: '+5.2%',
    volume24h: '$452M',
    marketCap: '$24.7B',
    type: 'TBC-20',
    contractCreator: generateTb1Address('tburn-token-creator'),
    createdAt: '2024-01-15',
    website: 'https://tburn.io',
    twitter: '@TBURNChain',
    telegram: 't.me/tburnchain'
  },
  'tb1...sttburn': {
    address: generateTb1Address('staked-tburn-token'),
    name: 'Staked TBURN',
    symbol: 'stTBURN',
    decimals: 18,
    totalSupply: '3,200,000,000',
    holders: 456780,
    price: '$2.47',
    change24h: '+5.1%',
    volume24h: '$125M',
    marketCap: '$7.9B',
    type: 'TBC-20',
    contractCreator: generateTb1Address('staked-tburn-creator'),
    createdAt: '2024-02-20'
  },
  'tb1...gtburn': {
    address: generateTb1Address('governance-tburn-token'),
    name: 'TBURN Governance',
    symbol: 'gTBURN',
    decimals: 18,
    totalSupply: '500,000,000',
    holders: 123450,
    price: '$8.75',
    change24h: '+2.3%',
    volume24h: '$32M',
    marketCap: '$4.375B',
    type: 'TBC-20',
    contractCreator: generateTb1Address('governance-tburn-creator'),
    createdAt: '2024-03-10'
  },
  'tb1...lp': {
    address: generateTb1Address('tburn-lp-token'),
    name: 'TBURN LP Token',
    symbol: 'TBURN-LP',
    decimals: 18,
    totalSupply: '250,000,000',
    holders: 89450,
    price: '$15.20',
    change24h: '-1.2%',
    volume24h: '$18M',
    marketCap: '$3.8B',
    type: 'TBC-20',
    contractCreator: generateTb1Address('tburn-lp-creator'),
    createdAt: '2024-04-05'
  },
  'tb1...weth': {
    address: generateTb1Address('wrapped-eth-token'),
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    decimals: 18,
    totalSupply: '50,000',
    holders: 34567,
    price: '$2,450',
    change24h: '+3.5%',
    volume24h: '$89M',
    marketCap: '$122.5M',
    type: 'TBC-20',
    contractCreator: generateTb1Address('wrapped-eth-creator'),
    createdAt: '2024-05-15'
  }
});

const mockTokens = createMockTokens();

function generateTxHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const seedNum = Math.abs(hash);
  let result = '';
  for (let j = 0; j < 64; j++) {
    const val = (seedNum * (j + 1) * 31337) % 16;
    result += val.toString(16);
  }
  return `0x${result}`;
}

const generateMockTransfers = (tokenAddress: string): Transfer[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    txHash: generateTxHash(`${tokenAddress}-transfer-${i}`),
    from: generateTb1Address(`transfer-from-${tokenAddress}-${i}`),
    to: generateTb1Address(`transfer-to-${tokenAddress}-${i}`),
    amount: `${(Math.random() * 10000).toFixed(2)}`,
    timestamp: Date.now() - (i * 60000 * (i + 1))
  }));
};

const generateMockHolders = (tokenAddress: string): Holder[] => {
  const totalSupply = 10000000000;
  let remaining = 100;
  return Array.from({ length: 10 }, (_, i) => {
    const percentage = i === 0 ? 15 + Math.random() * 10 : Math.random() * (remaining / (10 - i));
    remaining -= percentage;
    return {
      address: generateTb1Address(`holder-${tokenAddress}-${i}`),
      balance: ((totalSupply * percentage) / 100).toLocaleString(),
      percentage: `${percentage.toFixed(2)}%`
    };
  }).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
};

export default function TokenDetail() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const params = useParams<{ address: string }>();
  const address = params.address || '';

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
  }, [toast, t]);

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const token = useMemo(() => {
    const shortAddr = formatAddress(address);
    return mockTokens[shortAddr] || Object.values(mockTokens)[0];
  }, [address]);

  const transfers = useMemo(() => generateMockTransfers(address), [address]);
  const holders = useMemo(() => generateMockHolders(address), [address]);

  const isPositiveChange = token?.change24h?.startsWith('+');

  if (!token) {
    return (
      <ScanLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/scan/tokens">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("scan.backToTokens", "Back to Tokens")}
              </Button>
            </Link>
          </div>
          <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
            <p className="text-gray-400">{t("scan.tokenNotFound", "Token not found")}</p>
          </Card>
        </div>
      </ScanLayout>
    );
  }

  return (
    <ScanLayout>
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/scan/tokens">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="button-back-to-tokens">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("scan.backToTokens", "Back to Tokens")}
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-token-name">
                  {token.name}
                </h1>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {token.symbol}
                </Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  {token.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm text-gray-400">{formatAddress(token.address)}</span>
                <button onClick={() => copyToClipboard(token.address)} className="hover:text-white" data-testid="button-copy-address">
                  <Copy className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{token.price}</div>
              <div className={`flex items-center gap-1 justify-end ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                {isPositiveChange ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">{token.change24h}</span>
                <span className="text-gray-500 text-sm">24h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs mb-1 font-medium">
                <BarChart3 className="w-3.5 h-3.5" />
                {t("scan.marketCap", "Market Cap")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{token.marketCap}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400 text-xs mb-1 font-medium">
                <Activity className="w-3.5 h-3.5" />
                {t("scan.volume24h", "Volume 24h")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{token.volume24h}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-purple-400 text-xs mb-1 font-medium">
                <Users className="w-3.5 h-3.5" />
                {t("scan.holders", "Holders")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{token.holders.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border-yellow-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1 font-medium">
                <Layers className="w-3.5 h-3.5" />
                {t("scan.totalSupply", "Total Supply")}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{token.totalSupply}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white text-base">{t("scan.tokenInfo", "Token Information")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("scan.contractAddress", "Contract Address")}</span>
                  <span className="font-mono text-gray-300 flex items-center gap-2">
                    {formatAddress(token.address)}
                    <button onClick={() => copyToClipboard(token.address)}>
                      <Copy className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
                    </button>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("scan.decimals", "Decimals")}</span>
                  <span className="text-gray-300">{token.decimals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("scan.tokenType", "Token Type")}</span>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">{token.type}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("scan.creator", "Creator")}</span>
                  <Link href={`/scan/address/${token.contractCreator}`}>
                    <span className="font-mono text-blue-400 hover:text-blue-300">{formatAddress(token.contractCreator)}</span>
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("scan.createdAt", "Created At")}</span>
                  <span className="text-gray-300">{token.createdAt}</span>
                </div>
                {token.website && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("scan.website", "Website")}</span>
                    <a href={token.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      {token.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="transfers" className="w-full">
          <TabsList className="bg-gray-900/50 border-gray-700">
            <TabsTrigger value="transfers" className="data-[state=active]:bg-gray-800">{t("scan.transfers", "Transfers")}</TabsTrigger>
            <TabsTrigger value="holders" className="data-[state=active]:bg-gray-800">{t("scan.holders", "Holders")}</TabsTrigger>
          </TabsList>

          <TabsContent value="transfers">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-400">{t("scan.txHash", "Tx Hash")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.from", "From")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.to", "To")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.amount", "Amount")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.time", "Time")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer, i) => (
                      <TableRow key={i} className="border-gray-800 hover:bg-gray-800/30">
                        <TableCell>
                          <Link href={`/scan/tx/${transfer.txHash}`}>
                            <span className="font-mono text-blue-400 hover:text-blue-300">{formatAddress(transfer.txHash)}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/scan/address/${transfer.from}`}>
                            <span className="font-mono text-gray-300 hover:text-white">{formatAddress(transfer.from)}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/scan/address/${transfer.to}`}>
                            <span className="font-mono text-gray-300 hover:text-white">{formatAddress(transfer.to)}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-300">{transfer.amount} {token.symbol}</TableCell>
                        <TableCell className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(transfer.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holders">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-400 w-16">#</TableHead>
                      <TableHead className="text-gray-400">{t("scan.address", "Address")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.balance", "Balance")}</TableHead>
                      <TableHead className="text-gray-400">{t("scan.percentage", "Percentage")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holders.map((holder, i) => (
                      <TableRow key={i} className="border-gray-800 hover:bg-gray-800/30">
                        <TableCell className="font-medium text-gray-500">{i + 1}</TableCell>
                        <TableCell>
                          <Link href={`/scan/address/${holder.address}`}>
                            <span className="font-mono text-blue-400 hover:text-blue-300 flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-gray-500" />
                              {formatAddress(holder.address)}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-300">{holder.balance} {token.symbol}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-500" 
                                style={{ width: holder.percentage }}
                              />
                            </div>
                            <span className="text-gray-400 text-sm">{holder.percentage}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScanLayout>
  );
}
