import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Settings,
  RefreshCw,
  Save,
  Vote,
  Clock,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Percent,
  Timer,
  Calendar,
  Lock,
} from "lucide-react";

export default function GovParams() {
  const [activeTab, setActiveTab] = useState("voting");
  const [saving, setSaving] = useState(false);
  const [quorumPercentage, setQuorumPercentage] = useState([30]);
  const [approvalThreshold, setApprovalThreshold] = useState([66]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Governance Parameters
            </h1>
            <p className="text-muted-foreground">거버넌스 파라미터 | Configure governance system settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save">
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Current Parameters Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quorum</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30%</div>
              <p className="text-xs text-muted-foreground">10M TBURN minimum</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Threshold</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">66%</div>
              <p className="text-xs text-muted-foreground">Required for passing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voting Period</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-xs text-muted-foreground">Default duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timelock</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48 hours</div>
              <p className="text-xs text-muted-foreground">Before execution</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="voting">Voting</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="voting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Voting Parameters
                </CardTitle>
                <CardDescription>Configure voting rules and thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Quorum Percentage</Label>
                      <span className="text-sm text-muted-foreground">{quorumPercentage[0]}%</span>
                    </div>
                    <Slider
                      value={quorumPercentage}
                      onValueChange={setQuorumPercentage}
                      min={10}
                      max={50}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum percentage of total voting power required for a valid vote
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Approval Threshold</Label>
                      <span className="text-sm text-muted-foreground">{approvalThreshold[0]}%</span>
                    </div>
                    <Slider
                      value={approvalThreshold}
                      onValueChange={setApprovalThreshold}
                      min={50}
                      max={80}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage of "For" votes required to pass a proposal
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Voting Period</Label>
                      <Select defaultValue="7">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Voting Period</Label>
                      <Select defaultValue="3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="2">2 days</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voting Power</CardTitle>
                <CardDescription>Configure voting power calculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Token-weighted Voting</p>
                    <p className="text-sm text-muted-foreground">Voting power based on token holdings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Include Staked Tokens</p>
                    <p className="text-sm text-muted-foreground">Count staked tokens toward voting power</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delegated Voting</p>
                    <p className="text-sm text-muted-foreground">Allow users to delegate voting power</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Proposal Settings
                </CardTitle>
                <CardDescription>Configure proposal creation and management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Proposal Threshold</Label>
                    <Input type="number" defaultValue="100000" />
                    <p className="text-xs text-muted-foreground">
                      Minimum TBURN required to create a proposal
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Proposal Deposit</Label>
                    <Input type="number" defaultValue="10000" />
                    <p className="text-xs text-muted-foreground">
                      Refundable deposit for proposal creation
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Proposal Editing</p>
                    <p className="text-sm text-muted-foreground">Allow editing proposals before voting starts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Proposal Cancellation</p>
                    <p className="text-sm text-muted-foreground">Allow proposers to cancel their proposals</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Proposal Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Network</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Economics</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Bridge</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Staking</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">AI</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Security</span>
                    <Button variant="outline" size="sm">+ Add Category</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Execution Settings
                </CardTitle>
                <CardDescription>Configure proposal execution parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timelock Period</Label>
                    <Select defaultValue="48">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                        <SelectItem value="168">7 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Waiting period after voting ends before execution
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Execution Window</Label>
                    <Select defaultValue="14">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Time window in which execution must occur
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Multi-sig Execution</p>
                    <p className="text-sm text-muted-foreground">Require multiple signatures for critical proposals</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Automatic Execution</p>
                    <p className="text-sm text-muted-foreground">Auto-execute proposals after timelock</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Governance security parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Emergency Pause</p>
                    <p className="text-sm text-muted-foreground">Allow governance guardian to pause voting</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Veto Power</p>
                    <p className="text-sm text-muted-foreground">Enable veto for security council</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Guardian Address</Label>
                  <Input defaultValue="0x1234...5678" placeholder="Governance guardian address" />
                  <p className="text-xs text-muted-foreground">
                    Address with emergency pause capabilities
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Multi-sig protection enabled</p>
                    <p className="text-sm text-muted-foreground">3/5 signatures required for critical operations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Timelock active</p>
                    <p className="text-sm text-muted-foreground">48-hour delay on all proposal executions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
