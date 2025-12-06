import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Coins, 
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Image,
  Layers,
  Copy,
  ExternalLink
} from "lucide-react";
import { useState, useCallback } from "react";
import { useScanWebSocket } from "../../hooks/useScanWebSocket";
import ScanLayout from "../../components/ScanLayout";
import { useToast } from "@/hooks/use-toast";

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders: number;
  price?: string;
  change24h?: string;
  volume24h?: string;
  type: 'TBC-20' | 'TBC-721' | 'TBC-1155';
}

const mockTokens: Token[] = [
  { address: '0x1234...abcd', name: 'TBURN Token', symbol: 'TBURN', decimals: 18, totalSupply: '10,000,000,000', holders: 1256780, price: '$2.47', change24h: '+5.2%', volume24h: '$452M', type: 'TBC-20' },
  { address: '0x2345...bcde', name: 'Staked TBURN', symbol: 'stTBURN', decimals: 18, totalSupply: '3,200,000,000', holders: 456780, price: '$2.47', change24h: '+5.1%', volume24h: '$125M', type: 'TBC-20' },
  { address: '0x3456...cdef', name: 'TBURN Governance', symbol: 'gTBURN', decimals: 18, totalSupply: '500,000,000', holders: 123450, price: '$8.75', change24h: '+2.3%', volume24h: '$32M', type: 'TBC-20' },
  { address: '0x4567...defg', name: 'TBURN LP Token', symbol: 'TBURN-LP', decimals: 18, totalSupply: '250,000,000', holders: 89450, price: '$15.20', change24h: '-1.2%', volume24h: '$18M', type: 'TBC-20' },
  { address: '0x5678...efgh', name: 'Wrapped Ethereum', symbol: 'WETH', decimals: 18, totalSupply: '50,000', holders: 34567, price: '$2,450', change24h: '+3.5%', volume24h: '$89M', type: 'TBC-20' },
];

const mockNFTs: Token[] = [
  { address: '0xnft1...1234', name: 'TBURN Genesis', symbol: 'TBGEN', decimals: 0, totalSupply: '10,000', holders: 4567, type: 'TBC-721' },
  { address: '0xnft2...2345', name: 'TBURN Validators', symbol: 'TBVAL', decimals: 0, totalSupply: '500', holders: 489, type: 'TBC-721' },
  { address: '0xnft3...3456', name: 'TBURN Rewards', symbol: 'TBRWD', decimals: 0, totalSupply: '50,000', holders: 12345, type: 'TBC-1155' },
];

export default function TokensList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected } = useScanWebSocket();
  const [searchToken, setSearchToken] = useState("");
  const [activeTab, setActiveTab] = useState("tbc20");

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
  }, [toast, t]);

  const formatAddress = (addr: string) => {
    if (!addr) return "-";
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const filteredTokens = mockTokens.filter(t => 
    t.name.toLowerCase().includes(searchToken.toLowerCase()) ||
    t.symbol.toLowerCase().includes(searchToken.toLowerCase())
  );

  const filteredNFTs = mockNFTs.filter(t => 
    t.name.toLowerCase().includes(searchToken.toLowerCase()) ||
    t.symbol.toLowerCase().includes(searchToken.toLowerCase())
  );

  return (
    <ScanLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2" data-testid="text-tokens-title">
              <Coins className="w-6 h-6 text-yellow-400" />
              {t("scan.tokens", "Tokens")}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {t("scan.tokensDesc", "TBC-20, TBC-721, and TBC-1155 tokens on TBURN Mainnet")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder={t("scan.searchToken", "Search token...")}
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="pl-10 w-64 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                data-testid="input-search-token"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border-yellow-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1 font-medium">
                <Coins className="w-3.5 h-3.5" />
                TBC-20 {t("scan.tokens", "Tokens")}
              </div>
              <div className="text-2xl font-bold text-white">
                {mockTokens.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-purple-400 text-xs mb-1 font-medium">
                <Image className="w-3.5 h-3.5" />
                TBC-721 NFTs
              </div>
              <div className="text-2xl font-bold text-white">
                {mockNFTs.filter(n => n.type === 'TBC-721').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs mb-1 font-medium">
                <Layers className="w-3.5 h-3.5" />
                TBC-1155
              </div>
              <div className="text-2xl font-bold text-white">
                {mockNFTs.filter(n => n.type === 'TBC-1155').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400 text-xs mb-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                {t("scan.totalHolders", "Total Holders")}
              </div>
              <div className="text-2xl font-bold text-white">
                {(mockTokens.reduce((sum, t) => sum + t.holders, 0) + mockNFTs.reduce((sum, t) => sum + t.holders, 0)).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <Tabs defaultValue="tbc20" className="w-full" onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <TabsList className="bg-gray-800/50">
                <TabsTrigger value="tbc20" className="data-[state=active]:bg-yellow-600">
                  <Coins className="w-4 h-4 mr-2" />
                  TBC-20
                </TabsTrigger>
                <TabsTrigger value="nft" className="data-[state=active]:bg-purple-600">
                  <Image className="w-4 h-4 mr-2" />
                  NFT (TBC-721/1155)
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-0 pt-4">
              <TabsContent value="tbc20" className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400">#</TableHead>
                        <TableHead className="text-gray-400">{t("scan.token", "Token")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.price", "Price")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.change24h", "24h Change")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.volume24h", "24h Volume")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.totalSupply", "Total Supply")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.holders", "Holders")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTokens.map((token, index) => (
                        <TableRow 
                          key={token.address} 
                          className="border-gray-800 hover:bg-gray-800/30 group"
                          data-testid={`token-row-${index}`}
                        >
                          <TableCell className="text-gray-400 font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Link href={`/scan/token/${token.address}`}>
                              <div className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <Coins className="w-4 h-4 text-yellow-400" />
                                  </div>
                                  <div>
                                    <div className="text-white font-medium hover:text-blue-400">
                                      {token.name}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      {token.symbol}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            {token.price}
                          </TableCell>
                          <TableCell>
                            <span className={`flex items-center gap-1 ${token.change24h?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {token.change24h?.startsWith('+') ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {token.change24h}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {token.volume24h}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {token.totalSupply}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {token.holders.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="nft" className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400">#</TableHead>
                        <TableHead className="text-gray-400">{t("scan.collection", "Collection")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.type", "Type")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.items", "Items")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.holders", "Holders")}</TableHead>
                        <TableHead className="text-gray-400">{t("scan.contract", "Contract")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNFTs.map((nft, index) => (
                        <TableRow 
                          key={nft.address} 
                          className="border-gray-800 hover:bg-gray-800/30 group"
                          data-testid={`nft-row-${index}`}
                        >
                          <TableCell className="text-gray-400 font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Link href={`/scan/token/${nft.address}`}>
                              <div className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    nft.type === 'TBC-721' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                                  }`}>
                                    {nft.type === 'TBC-721' ? (
                                      <Image className="w-4 h-4 text-purple-400" />
                                    ) : (
                                      <Layers className="w-4 h-4 text-blue-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium hover:text-blue-400">
                                      {nft.name}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      {nft.symbol}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              nft.type === 'TBC-721' 
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {nft.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {nft.totalSupply}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {nft.holders.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 font-mono text-sm">
                                {formatAddress(nft.address)}
                              </span>
                              <button 
                                onClick={() => copyToClipboard(nft.address)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Copy className="w-3 h-3 text-gray-500 hover:text-gray-300" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </ScanLayout>
  );
}
