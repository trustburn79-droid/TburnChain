import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Settings, Clock, Users, Flame, Vote, History, 
  AlertTriangle, Save, RotateCcw, CheckCircle, Info
} from "lucide-react";

export default function AdminNetworkParams() {
  const { t } = useTranslation();
  const [hasChanges, setHasChanges] = useState(false);

  const blockchainParams = [
    { id: "blockTime", name: "Block Time", value: "500", unit: "ms", min: 100, max: 2000, description: "Target block generation time" },
    { id: "maxBlockSize", name: "Max Block Size", value: "5", unit: "MB", min: 1, max: 50, description: "Maximum size of a single block" },
    { id: "maxTxPerBlock", name: "Max TX per Block", value: "10000", unit: "tx", min: 1000, max: 100000, description: "Maximum transactions per block" },
  ];

  const committeeParams = [
    { id: "defaultSize", name: "Default Committee Size", value: "100", min: 21, max: 200 },
    { id: "minSize", name: "Minimum Size", value: "21", min: 7, max: 50 },
    { id: "maxSize", name: "Maximum Size", value: "200", min: 100, max: 500 },
    { id: "rotationPeriod", name: "Rotation Period", value: "100", unit: "blocks" },
  ];

  const gasParams = [
    { id: "baseGas", name: "Base Gas Price", value: "100", unit: "Ember" },
    { id: "minGas", name: "Minimum Gas", value: "50", unit: "Ember" },
    { id: "maxGas", name: "Maximum Gas", value: "500", unit: "Ember" },
    { id: "congestionMultiplier", name: "Congestion Multiplier", value: "1.5", unit: "x" },
  ];

  const burnParams = [
    { id: "txBurnRate", name: "Transaction Burn Rate", value: "1.0", unit: "%" },
    { id: "timeBurnRate", name: "Time-based Burn Rate", value: "0.1", unit: "% daily" },
    { id: "volumeBurnRate", name: "Volume Burn Rate", value: "0.5", unit: "%" },
    { id: "aiOptimized", name: "AI Optimized Burn", enabled: true },
  ];

  const governanceParams = [
    { id: "minStake", name: "Minimum Proposal Stake", value: "10000", unit: "TBURN" },
    { id: "quorum", name: "Quorum", value: "10", unit: "%" },
    { id: "approvalThreshold", name: "Approval Threshold", value: "66", unit: "%" },
    { id: "votingPeriod", name: "Voting Period", value: "7", unit: "days" },
    { id: "executionDelay", name: "Execution Delay", value: "2", unit: "days" },
  ];

  const changeHistory = [
    { id: 1, param: "Block Time", oldValue: "600ms", newValue: "500ms", changedBy: "Admin", date: "2024-12-03", reason: "Performance optimization" },
    { id: 2, param: "Committee Size", oldValue: "80", newValue: "100", changedBy: "Governance", date: "2024-12-01", reason: "Security enhancement" },
    { id: 3, param: "Gas Price", oldValue: "80 Ember", newValue: "100 Ember", changedBy: "AI System", date: "2024-11-28", reason: "Network congestion" },
    { id: 4, param: "Burn Rate", oldValue: "0.8%", newValue: "1.0%", changedBy: "Governance", date: "2024-11-25", reason: "Deflation target" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Network Parameters</h1>
            <p className="text-muted-foreground">Configure blockchain network parameters and governance settings</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm" data-testid="button-reset">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" disabled={!hasChanges} data-testid="button-save">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="blockchain" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="blockchain" data-testid="tab-blockchain">
              <Settings className="w-4 h-4 mr-2" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="committee" data-testid="tab-committee">
              <Users className="w-4 h-4 mr-2" />
              Committee
            </TabsTrigger>
            <TabsTrigger value="gas" data-testid="tab-gas">
              <Flame className="w-4 h-4 mr-2" />
              Gas
            </TabsTrigger>
            <TabsTrigger value="burn" data-testid="tab-burn">
              <Flame className="w-4 h-4 mr-2" />
              Burn
            </TabsTrigger>
            <TabsTrigger value="governance" data-testid="tab-governance">
              <Vote className="w-4 h-4 mr-2" />
              Governance
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blockchain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Blockchain Parameters
                </CardTitle>
                <CardDescription>Core blockchain timing and size parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {blockchainParams.map((param) => (
                  <div key={param.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={param.id}>{param.name}</Label>
                      <span className="text-sm text-muted-foreground">{param.description}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id={param.id}
                        defaultValue={[parseInt(param.value)]}
                        min={param.min}
                        max={param.max}
                        step={1}
                        className="flex-1"
                        onValueChange={() => setHasChanges(true)}
                      />
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Input
                          type="number"
                          value={param.value}
                          className="w-20"
                          onChange={() => setHasChanges(true)}
                        />
                        <span className="text-sm text-muted-foreground">{param.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="committee" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Committee Configuration
                </CardTitle>
                <CardDescription>Validator committee size and rotation settings</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                {committeeParams.map((param) => (
                  <div key={param.id} className="space-y-2">
                    <Label htmlFor={param.id}>{param.name}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={param.id}
                        type="number"
                        defaultValue={param.value}
                        min={param.min}
                        max={param.max}
                        onChange={() => setHasChanges(true)}
                      />
                      {param.unit && <span className="text-sm text-muted-foreground">{param.unit}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Committee Selection</CardTitle>
                <CardDescription>Enable AI-powered optimal committee selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Selection Algorithm</p>
                    <p className="text-sm text-muted-foreground">Use AI to optimize committee composition</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dynamic Committee Sizing</p>
                    <p className="text-sm text-muted-foreground">Automatically adjust committee size based on network load</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Gas Price Policy (Ember System)
                </CardTitle>
                <CardDescription>Configure gas pricing and fee structure</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                {gasParams.map((param) => (
                  <div key={param.id} className="space-y-2">
                    <Label htmlFor={param.id}>{param.name}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={param.id}
                        type="number"
                        defaultValue={param.value}
                        onChange={() => setHasChanges(true)}
                      />
                      <span className="text-sm text-muted-foreground">{param.unit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dynamic Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">EIP-1559 Style Pricing</p>
                    <p className="text-sm text-muted-foreground">Use base fee + priority fee model</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Gas Optimization</p>
                    <p className="text-sm text-muted-foreground">AI-powered gas price recommendations</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="burn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Burn Rate Configuration
                </CardTitle>
                <CardDescription>Configure token burn rates and mechanisms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {burnParams.filter(p => p.unit).map((param) => (
                  <div key={param.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={param.id}>{param.name}</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id={param.id}
                        defaultValue={[parseFloat(param.value as string) * 10]}
                        min={1}
                        max={100}
                        step={1}
                        className="flex-1"
                        onValueChange={() => setHasChanges(true)}
                      />
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Input
                          type="number"
                          value={param.value}
                          step="0.1"
                          className="w-20"
                          onChange={() => setHasChanges(true)}
                        />
                        <span className="text-sm text-muted-foreground">{param.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-medium">AI Optimized Burn</p>
                    <p className="text-sm text-muted-foreground">Use AI to optimize burn rates based on market conditions</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="w-5 h-5" />
                  Governance Thresholds
                </CardTitle>
                <CardDescription>Configure governance voting and proposal requirements</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                {governanceParams.map((param) => (
                  <div key={param.id} className="space-y-2">
                    <Label htmlFor={param.id}>{param.name}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={param.id}
                        type="number"
                        defaultValue={param.value}
                        onChange={() => setHasChanges(true)}
                      />
                      <span className="text-sm text-muted-foreground">{param.unit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Parameter Change History
                </CardTitle>
                <CardDescription>Track all parameter modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {changeHistory.map((change) => (
                    <div key={change.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="p-2 rounded-full bg-blue-500/10">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{change.param}</p>
                          <span className="text-sm text-muted-foreground">{change.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Changed from <span className="text-red-500">{change.oldValue}</span> to{" "}
                          <span className="text-green-500">{change.newValue}</span>
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>By: {change.changedBy}</span>
                          <span className="text-muted-foreground">{change.reason}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
