import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Wallet, CheckCircle2, AlertCircle, Loader2, Copy, ExternalLink, Coins, Clock } from "lucide-react";
import TestnetScanLayout from "../../components/TestnetScanLayout";
import { useToast } from "@/hooks/use-toast";

export default function TestnetFaucet() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; txHash?: string; message?: string } | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      toast({
        title: t("scan.invalidAddress", "Invalid Address"),
        description: t("scan.enterValidAddress", "Please enter a valid wallet address (0x...)"),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/public/v1/testnet/faucet/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          txHash: data.data.txHash,
          message: t("scan.faucetSuccess", "1,000 tTBURN has been sent to your wallet!")
        });
      } else {
        setResult({
          success: false,
          message: data.error || t("scan.faucetError", "Failed to request tokens. Please try again later.")
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: t("scan.faucetError", "Failed to request tokens. Please try again later.")
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("scan.copied", "Copied!"), description: t("scan.copiedToClipboard", "Copied to clipboard") });
  };

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Droplets className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
            {t("scan.testnetFaucet", "Testnet Faucet")}
          </h1>
          <p className="text-gray-400">
            {t("scan.faucetDescription", "Get free tTBURN tokens to test on TBurn Testnet")}
          </p>
        </div>

        <Card className="bg-yellow-900/10 border-yellow-800/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="w-5 h-5 text-yellow-400" />
              {t("scan.requestTokens", "Request Tokens")}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {t("scan.faucetLimit", "You can request up to 1,000 tTBURN every 24 hours")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t("scan.walletAddress", "Wallet Address")}
                </label>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-gray-950/50 border-yellow-800/30 text-white placeholder:text-gray-500 focus:border-yellow-500/50"
                  data-testid="input-faucet-address"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
                <div className="flex items-center gap-3">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-lg font-bold text-white">1,000 tTBURN</div>
                    <div className="text-xs text-gray-400">{t("scan.perRequest", "Per request")}</div>
                  </div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">FREE</Badge>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !address}
                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-lg font-medium"
                data-testid="button-request-tokens"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("scan.processing", "Processing...")}
                  </>
                ) : (
                  <>
                    <Droplets className="w-5 h-5 mr-2" />
                    {t("scan.requestTokens", "Request Tokens")}
                  </>
                )}
              </Button>
            </form>

            {result && (
              <div className={`mt-6 p-4 rounded-lg border ${result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? t("scan.success", "Success!") : t("scan.error", "Error")}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">{result.message}</div>
                    {result.txHash && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-gray-500 text-xs">TX:</span>
                        <span className="text-yellow-400 font-mono text-xs">
                          {result.txHash.slice(0, 20)}...{result.txHash.slice(-10)}
                        </span>
                        <button onClick={() => copyToClipboard(result.txHash!)}>
                          <Copy className="w-3 h-3 text-gray-400 hover:text-yellow-400" />
                        </button>
                        <a href={`/testnet-scan/tx/${result.txHash}`} className="text-yellow-400 hover:text-yellow-300">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-yellow-900/10 border-yellow-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Clock className="w-4 h-4 text-amber-400" />
              {t("scan.faucetRules", "Faucet Rules")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                {t("scan.rule1", "Maximum 100 tTBURN per request")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                {t("scan.rule2", "24-hour cooldown between requests per address")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                {t("scan.rule3", "Testnet tokens have no real value")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                {t("scan.rule4", "Use responsibly for development and testing only")}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </TestnetScanLayout>
  );
}
