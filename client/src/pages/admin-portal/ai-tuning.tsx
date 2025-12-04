import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, Sliders, Brain, Zap, Save, RotateCcw, 
  AlertTriangle, CheckCircle, TestTube
} from "lucide-react";

export default function AdminAITuning() {
  const [hasChanges, setHasChanges] = useState(false);

  const modelConfigs = [
    { 
      name: "GPT-5 Turbo", 
      layer: "Strategic",
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.9,
      frequencyPenalty: 0.3,
      presencePenalty: 0.3
    },
    { 
      name: "Claude Sonnet 4.5", 
      layer: "Tactical",
      temperature: 0.5,
      maxTokens: 8192,
      topP: 0.95,
      frequencyPenalty: 0.2,
      presencePenalty: 0.2
    },
    { 
      name: "Llama 3.3 70B", 
      layer: "Operational",
      temperature: 0.3,
      maxTokens: 2048,
      topP: 0.8,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1
    },
  ];

  const decisionParams = [
    { name: "Consensus Optimization", weight: 0.85, enabled: true },
    { name: "Shard Rebalancing", weight: 0.75, enabled: true },
    { name: "Gas Price Adjustment", weight: 0.90, enabled: true },
    { name: "Validator Selection", weight: 0.80, enabled: true },
    { name: "Bridge Risk Assessment", weight: 0.70, enabled: true },
    { name: "Burn Rate Optimization", weight: 0.65, enabled: false },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">AI Parameter Tuning</h1>
            <p className="text-muted-foreground">Fine-tune AI model parameters and decision weights</p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" onClick={() => setHasChanges(false)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline">
              <TestTube className="w-4 h-4 mr-2" />
              Test
            </Button>
            <Button disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              Apply Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="models" className="space-y-4">
          <TabsList>
            <TabsTrigger value="models" data-testid="tab-models">
              <Brain className="w-4 h-4 mr-2" />
              Model Parameters
            </TabsTrigger>
            <TabsTrigger value="decisions" data-testid="tab-decisions">
              <Sliders className="w-4 h-4 mr-2" />
              Decision Weights
            </TabsTrigger>
            <TabsTrigger value="thresholds" data-testid="tab-thresholds">
              <Zap className="w-4 h-4 mr-2" />
              Thresholds
            </TabsTrigger>
            <TabsTrigger value="advanced" data-testid="tab-advanced">
              <Settings className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            {modelConfigs.map((model, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className={
                        model.layer === "Strategic" ? "text-blue-500" :
                        model.layer === "Tactical" ? "text-purple-500" :
                        "text-green-500"
                      } />
                      {model.name}
                    </CardTitle>
                    <Badge variant="outline">{model.layer} Layer</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Temperature</Label>
                        <span className="text-sm font-medium">{model.temperature}</span>
                      </div>
                      <Slider 
                        defaultValue={[model.temperature * 100]} 
                        min={0} 
                        max={100} 
                        onValueChange={() => setHasChanges(true)}
                      />
                      <span className="text-xs text-muted-foreground">Controls randomness</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Tokens</Label>
                      <Input 
                        type="number" 
                        defaultValue={model.maxTokens} 
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Top P</Label>
                        <span className="text-sm font-medium">{model.topP}</span>
                      </div>
                      <Slider 
                        defaultValue={[model.topP * 100]} 
                        min={0} 
                        max={100}
                        onValueChange={() => setHasChanges(true)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Freq Penalty</Label>
                        <span className="text-sm font-medium">{model.frequencyPenalty}</span>
                      </div>
                      <Slider 
                        defaultValue={[model.frequencyPenalty * 100]} 
                        min={0} 
                        max={100}
                        onValueChange={() => setHasChanges(true)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Pres Penalty</Label>
                        <span className="text-sm font-medium">{model.presencePenalty}</span>
                      </div>
                      <Slider 
                        defaultValue={[model.presencePenalty * 100]} 
                        min={0} 
                        max={100}
                        onValueChange={() => setHasChanges(true)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="decisions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Decision Type Weights</CardTitle>
                <CardDescription>Control the influence of each decision category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {decisionParams.map((param, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-48">
                      <div className="flex items-center gap-2">
                        <Switch 
                          defaultChecked={param.enabled} 
                          onCheckedChange={() => setHasChanges(true)}
                        />
                        <Label>{param.name}</Label>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Slider 
                        defaultValue={[param.weight * 100]} 
                        min={0} 
                        max={100}
                        disabled={!param.enabled}
                        onValueChange={() => setHasChanges(true)}
                      />
                    </div>
                    <div className="w-16 text-right font-medium">
                      {(param.weight * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layer Priority Weights</CardTitle>
                <CardDescription>How much each layer influences final decisions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-48 flex items-center gap-2">
                    <Brain className="text-blue-500" />
                    <Label>Strategic Layer</Label>
                  </div>
                  <Slider defaultValue={[50]} min={0} max={100} onValueChange={() => setHasChanges(true)} className="flex-1" />
                  <div className="w-16 text-right font-medium">50%</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 flex items-center gap-2">
                    <Brain className="text-purple-500" />
                    <Label>Tactical Layer</Label>
                  </div>
                  <Slider defaultValue={[30]} min={0} max={100} onValueChange={() => setHasChanges(true)} className="flex-1" />
                  <div className="w-16 text-right font-medium">30%</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 flex items-center gap-2">
                    <Brain className="text-green-500" />
                    <Label>Operational Layer</Label>
                  </div>
                  <Slider defaultValue={[20]} min={0} max={100} onValueChange={() => setHasChanges(true)} className="flex-1" />
                  <div className="w-16 text-right font-medium">20%</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thresholds" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Confidence Thresholds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Auto-Execute Threshold</Label>
                    <div className="flex items-center gap-2">
                      <Slider defaultValue={[70]} min={50} max={100} onValueChange={() => setHasChanges(true)} className="flex-1" />
                      <Input type="number" defaultValue="70" className="w-20" onChange={() => setHasChanges(true)} />
                      <span className="text-sm">%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Decisions above this are executed automatically</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Human Review Threshold</Label>
                    <div className="flex items-center gap-2">
                      <Slider defaultValue={[50]} min={30} max={80} onValueChange={() => setHasChanges(true)} className="flex-1" />
                      <Input type="number" defaultValue="50" className="w-20" onChange={() => setHasChanges(true)} />
                      <span className="text-sm">%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Decisions below this require manual review</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Rejection Threshold</Label>
                    <div className="flex items-center gap-2">
                      <Slider defaultValue={[30]} min={10} max={50} onValueChange={() => setHasChanges(true)} className="flex-1" />
                      <Input type="number" defaultValue="30" className="w-20" onChange={() => setHasChanges(true)} />
                      <span className="text-sm">%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Decisions below this are automatically rejected</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rate Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Strategic Decisions/Hour</Label>
                    <Input type="number" defaultValue="10" onChange={() => setHasChanges(true)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tactical Decisions/Minute</Label>
                    <Input type="number" defaultValue="100" onChange={() => setHasChanges(true)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Operational Decisions/Second</Label>
                    <Input type="number" defaultValue="1000" onChange={() => setHasChanges(true)} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Overrides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Allow AI Emergency Actions</p>
                    <p className="text-sm text-muted-foreground">AI can take critical actions without approval in emergencies</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => setHasChanges(true)} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Circuit Breaker</p>
                    <p className="text-sm text-muted-foreground">Automatically disable AI if error rate exceeds threshold</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => setHasChanges(true)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>Expert settings for AI system behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Consensus Timeout (ms)</Label>
                    <Input type="number" defaultValue="5000" onChange={() => setHasChanges(true)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Retry Attempts</Label>
                    <Input type="number" defaultValue="3" onChange={() => setHasChanges(true)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Backoff Multiplier</Label>
                    <Input type="number" defaultValue="1.5" step="0.1" onChange={() => setHasChanges(true)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cache TTL (seconds)</Label>
                    <Input type="number" defaultValue="300" onChange={() => setHasChanges(true)} />
                  </div>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Caution</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Modifying these settings may significantly impact AI system behavior. Test thoroughly before applying.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
