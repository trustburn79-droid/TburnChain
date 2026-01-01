import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from "recharts";
import { 
  TrendingDown, TrendingUp, Flame, Coins, 
  Target, Calendar, DollarSign, PieChart,
  Activity, Zap, Users, Shield, ChevronRight,
  Download, Info, Rocket, Gift, Sparkles,
  Lock, Server, Droplets, FileText, CheckCircle2
} from "lucide-react";
import {
  TOKENOMICS_DATA,
  PRICE_FORECAST_DATA,
  Y1_MILESTONES,
  TOKENOMICS_SUMMARY,
  Phase,
  TokenomicsPeriod,
  formatSupply,
  formatChangeRate,
  formatCurrency,
  formatMarketCap,
  getPhaseColor,
  getSupplyChartData,
  getPriceChartData,
  GENESIS_DISTRIBUTION,
  INVESTOR_ROUNDS,
  INVESTOR_ROI_DATA,
  TOTAL_FUNDRAISING,
  getGenesisDistributionChartData,
  // v4.0.0 Production Ready 데이터
  Y1_ACTIVATION_BUDGET,
  Y1_ACTIVATION_TOTAL,
  LAUNCH_CAMPAIGN_EVENTS,
  LAUNCH_CAMPAIGN_TOTAL,
  SEASONAL_EVENTS,
  Y1_EVENT_CALENDAR,
  TGE_UNLOCKS,
  TGE_TOTAL_UNLOCK,
  TGE_ACTUAL_CIRCULATION,
  GENESIS_VALIDATOR_CONFIG,
  DEX_LIQUIDITY_POOLS,
  DEX_LP_LOCKUP_DAYS,
  DEX_INITIAL_PRICE,
  DEX_TOTAL_TVL,
  BURN_MECHANISMS,
  Y1_TOTAL_BURN,
  HALVING_SCHEDULE,
  PHASE_STRATEGY,
  TOKENOMICS_DOC_INFO
} from "@/lib/tokenomics-engine";

type ScenarioType = 'conservative' | 'neutral' | 'optimistic';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TokenomicsSimulation() {
  const { t, i18n } = useTranslation();
  const [selectedPhase, setSelectedPhase] = useState<Phase | 'all'>('all');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('neutral');
  const locale = i18n.language;

  const handleExportCSV = () => {
    const headers = ['Period', 'Phase', 'Start Supply', 'Block Emission', 'AI Burn', 'Net Change', 'End Supply', 'Change Rate', 'Note'];
    const rows = TOKENOMICS_DATA.map(p => [
      p.id,
      p.phase,
      p.startSupply.toString(),
      p.blockEmission.toString(),
      p.aiBurn.toString(),
      p.netChange.toString(),
      p.endSupply.toString(),
      p.changeRate.toFixed(2) + '%',
      p.note
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `tburn-tokenomics-simulation-${date}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: TOKENOMICS_SUMMARY,
      periods: TOKENOMICS_DATA,
      priceForecast: PRICE_FORECAST_DATA,
      y1Milestones: Y1_MILESTONES
    };
    const jsonContent = JSON.stringify(exportData, null, 2);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(jsonContent, `tburn-tokenomics-simulation-${date}.json`, 'application/json');
  };

  const supplyChartData = getSupplyChartData();
  const priceChartData = getPriceChartData();

  const filteredData = selectedPhase === 'all' 
    ? TOKENOMICS_DATA 
    : TOKENOMICS_DATA.filter(p => p.phase === selectedPhase);

  const getPhaseLabel = (phase: Phase) => {
    switch (phase) {
      case Phase.GROWTH: return t('tokenomics.phases.growth', 'Growth');
      case Phase.DEFLATION: return t('tokenomics.phases.deflation', 'Deflation');
      case Phase.EQUILIBRIUM: return t('tokenomics.phases.equilibrium', 'Equilibrium');
      case Phase.OPTIMIZATION: return t('tokenomics.phases.optimization', 'Optimization');
    }
  };

  const getPhaseBadgeColor = (phase: Phase) => {
    switch (phase) {
      case Phase.GROWTH: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case Phase.DEFLATION: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case Phase.EQUILIBRIUM: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case Phase.OPTIMIZATION: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const getScenarioColor = (scenario: ScenarioType) => {
    switch (scenario) {
      case 'conservative': return '#22c55e';
      case 'neutral': return '#3b82f6';
      case 'optimistic': return '#f59e0b';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-tokenomics-simulation">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t('tokenomics.title', 'TBURN 20년 토큰노믹스 마스터플랜')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('tokenomics.subtitle', 'v4.0.0 Production Ready | 메인넷 제네시스 풀 실행 승인 | 목표 Y20: 69.40억 TBURN')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-export-csv" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.exportCSV', 'Export CSV')}
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export-json" onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.exportJSON', 'Export JSON')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-genesis-supply">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tokenomics.genesisSupply', 'Genesis Supply')}
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="value-genesis-supply">
              {formatSupply(TOKENOMICS_SUMMARY.genesisSupply, locale)}
            </div>
            <p className="text-xs text-muted-foreground">
              Y0 - {t('tokenomics.notes.genesis', 'Genesis')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-final-supply">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tokenomics.finalSupply', 'Final Supply (Y20)')}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="value-final-supply">
              {formatSupply(TOKENOMICS_SUMMARY.finalSupply, locale)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('tokenomics.visionComplete', 'Vision Complete')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-deflation">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tokenomics.totalDeflation', 'Total Deflation')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500" data-testid="value-total-deflation">
              -{formatSupply(TOKENOMICS_SUMMARY.totalDeflation, locale)}
            </div>
            <p className="text-xs text-muted-foreground">
              -{TOKENOMICS_SUMMARY.deflationPercent.toFixed(2)}% {t('tokenomics.overYears', 'over 20 years')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-annual-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tokenomics.avgAnnualRate', 'Avg. Annual Rate')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="value-avg-rate">
              -{TOKENOMICS_SUMMARY.averageAnnualRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t('tokenomics.sustainableDeflation', 'Sustainable deflation')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Emission vs Burn Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card data-testid="card-cumulative-emission">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tokenomics.cumulativeEmission', 'Cumulative Block Emission')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="value-cumulative-emission">
              +{formatSupply(TOKENOMICS_SUMMARY.cumulativeEmission, locale)}
            </div>
            <Progress value={35} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {t('tokenomics.blockRewards', 'Block rewards distributed to validators')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-cumulative-burn">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tokenomics.cumulativeBurn', 'Cumulative AI Burn')}
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500" data-testid="value-cumulative-burn">
              -{formatSupply(TOKENOMICS_SUMMARY.cumulativeBurn, locale)}
            </div>
            <Progress value={65} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {t('tokenomics.aiBurnMechanism', 'AI-driven burn mechanism')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phase Summary */}
      <Card data-testid="card-phase-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            {t('tokenomics.phaseSummary', 'Phase Summary')}
          </CardTitle>
          <CardDescription>
            {t('tokenomics.fourPhaseStrategy', '4-Phase tokenomics strategy over 20 years')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOKENOMICS_SUMMARY.phaseStats.map((stats) => (
              <div 
                key={stats.phase} 
                className="p-4 rounded-lg border"
                style={{ borderColor: getPhaseColor(stats.phase) + '40' }}
                data-testid={`card-phase-${stats.phase.toLowerCase()}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getPhaseBadgeColor(stats.phase)}>
                    {getPhaseLabel(stats.phase)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Y{stats.startYear}-Y{stats.endYear}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tokenomics.start', 'Start')}:</span>
                    <span>{formatSupply(stats.startSupply, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tokenomics.end', 'End')}:</span>
                    <span>{formatSupply(stats.endSupply, locale)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">{t('tokenomics.netChange', 'Net')}:</span>
                    <span className={stats.netChange < 0 ? 'text-red-500' : stats.netChange > 0 ? 'text-green-500' : ''}>
                      {formatChangeRate(stats.changePercent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="simulation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto gap-1">
          <TabsTrigger value="simulation" data-testid="tab-simulation" className="text-xs px-2">
            {t('tokenomics.tabs.simulation', '20년 스케줄')}
          </TabsTrigger>
          <TabsTrigger value="genesis" data-testid="tab-genesis" className="text-xs px-2">
            {t('tokenomics.tabs.genesis', '제네시스 배분')}
          </TabsTrigger>
          <TabsTrigger value="y1activation" data-testid="tab-y1activation" className="text-xs px-2">
            {t('tokenomics.tabs.y1activation', 'Y1 활성화')}
          </TabsTrigger>
          <TabsTrigger value="genesispool" data-testid="tab-genesispool" className="text-xs px-2">
            {t('tokenomics.tabs.genesispool', '제네시스 풀')}
          </TabsTrigger>
          <TabsTrigger value="burn" data-testid="tab-burn" className="text-xs px-2">
            {t('tokenomics.tabs.burn', 'AI 소각')}
          </TabsTrigger>
          <TabsTrigger value="investors" data-testid="tab-investors" className="text-xs px-2">
            {t('tokenomics.tabs.investors', '투자자')}
          </TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts" className="text-xs px-2">
            {t('tokenomics.tabs.charts', '차트')}
          </TabsTrigger>
          <TabsTrigger value="price" data-testid="tab-price" className="text-xs px-2">
            {t('tokenomics.tabs.price', '가격 예측')}
          </TabsTrigger>
          <TabsTrigger value="document" data-testid="tab-document" className="text-xs px-2">
            {t('tokenomics.tabs.document', '문서 정보')}
          </TabsTrigger>
        </TabsList>

        {/* Simulation Table Tab */}
        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{t('tokenomics.completeSimulation', 'Complete Simulation Table')}</CardTitle>
                  <CardDescription>
                    {t('tokenomics.finalAdjustment', 'Final Adjustment - Y20 Target: 69.40B')}
                  </CardDescription>
                </div>
                <Select 
                  value={selectedPhase} 
                  onValueChange={(v) => setSelectedPhase(v as Phase | 'all')}
                >
                  <SelectTrigger className="w-[180px]" data-testid="select-phase-filter">
                    <SelectValue placeholder={t('tokenomics.filterByPhase', 'Filter by Phase')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('tokenomics.allPhases', 'All Phases')}</SelectItem>
                    <SelectItem value={Phase.GROWTH}>{getPhaseLabel(Phase.GROWTH)}</SelectItem>
                    <SelectItem value={Phase.DEFLATION}>{getPhaseLabel(Phase.DEFLATION)}</SelectItem>
                    <SelectItem value={Phase.EQUILIBRIUM}>{getPhaseLabel(Phase.EQUILIBRIUM)}</SelectItem>
                    <SelectItem value={Phase.OPTIMIZATION}>{getPhaseLabel(Phase.OPTIMIZATION)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">{t('tokenomics.table.period', 'Period')}</TableHead>
                      <TableHead>{t('tokenomics.table.phase', 'Phase')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.table.startSupply', 'Start Supply')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.table.blockEmission', 'Block Emission')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.table.aiBurn', 'AI Burn')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.table.netChange', 'Net Change')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.table.endSupply', 'End Supply')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.table.changeRate', 'Rate')}</TableHead>
                      <TableHead>{t('tokenomics.table.note', 'Note')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((period) => (
                      <TableRow key={period.id} data-testid={`row-period-${period.id}`}>
                        <TableCell className="font-medium">{period.id}</TableCell>
                        <TableCell>
                          <Badge className={getPhaseBadgeColor(period.phase)} variant="outline">
                            {getPhaseLabel(period.phase)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatSupply(period.startSupply, locale)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-500">
                          {period.blockEmission > 0 ? `+${formatSupply(period.blockEmission, locale)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-orange-500">
                          {period.aiBurn > 0 ? `-${formatSupply(period.aiBurn, locale)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={period.netChange < 0 ? 'text-red-500' : period.netChange > 0 ? 'text-green-500' : ''}>
                            {period.netChange !== 0 ? formatSupply(period.netChange, locale) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {formatSupply(period.endSupply, locale)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={period.changeRate < 0 ? 'text-red-500' : period.changeRate > 0 ? 'text-green-500' : ''}>
                            {formatChangeRate(period.changeRate)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {t(period.noteKey, period.note)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genesis Distribution Tab */}
        <TabsContent value="genesis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Genesis Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('tokenomics.genesisDistribution', 'Genesis Distribution')}</CardTitle>
                <CardDescription>
                  {t('tokenomics.genesisDistributionDesc', '100억 TBURN Initial Token Allocation')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80" data-testid="chart-genesis-distribution">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getGenesisDistributionChartData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" unit="억" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value) => [`${value}억 TBURN`, t('tokenomics.amount', 'Amount')]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))">
                        {getGenesisDistributionChartData().map((_, index) => {
                          const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
                          return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Genesis Categories Detail */}
            <Card>
              <CardHeader>
                <CardTitle>{t('tokenomics.categoryDetail', 'Category Details')}</CardTitle>
                <CardDescription>
                  {t('tokenomics.categoryDetailDesc', 'Allocation breakdown by category')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {GENESIS_DISTRIBUTION.map((cat, idx) => {
                  const COLORS = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-red-500'];
                  return (
                    <div key={cat.id} className="space-y-2" data-testid={`genesis-category-${cat.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${COLORS[idx % COLORS.length]}`} />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <Badge variant="outline">{cat.percentage}%</Badge>
                      </div>
                      <Progress value={cat.percentage} className="h-2" />
                      <div className="text-sm text-muted-foreground">{cat.amount}억 TBURN</div>
                      {cat.subcategories && (
                        <div className="pl-4 space-y-1 text-xs text-muted-foreground">
                          {cat.subcategories.map(sub => (
                            <div key={sub.id} className="flex justify-between">
                              <span>{sub.name}</span>
                              <span>{sub.amount}억 ({sub.percentage}%)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Y1 Activation Strategy Tab - 체인 활성화 전략 */}
        <TabsContent value="y1activation" className="space-y-4">
          {/* Y1 Budget Overview */}
          <Card data-testid="card-y1-budget">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                {t('tokenomics.y1.budgetTitle', 'Year-1 체인 활성화 이벤트 예산 총괄')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.y1.budgetDesc', 'Aggressive Growth 단계 - 체인 활성화의 핵심 동력')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Y1_ACTIVATION_BUDGET.map((item, idx) => (
                  <Card key={idx} className="border-primary/20">
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">{item.category}</div>
                      <div className="text-2xl font-bold text-primary">{item.amount}억</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </CardContent>
                  </Card>
                ))}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Y1 총 예산</div>
                    <div className="text-3xl font-bold text-primary">{Y1_ACTIVATION_TOTAL}억</div>
                    <div className="text-xs text-muted-foreground">TBURN</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Launch Campaign Section */}
          <Card data-testid="card-launch-campaign">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-500" />
                {t('tokenomics.launch.title', '런칭 캠페인 (TGE +30일)')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.launch.desc', '메인넷 런칭 후 30일간 진행되는 초기 부트스트랩 캠페인')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('tokenomics.eventName', '이벤트명')}</TableHead>
                      <TableHead>{t('tokenomics.details', '상세 내용')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.reward', '보상')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.participants', '참여자')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LAUNCH_CAMPAIGN_EVENTS.map((event, idx) => (
                      <TableRow key={idx} data-testid={`row-launch-${idx}`}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell className="text-muted-foreground">{event.description}</TableCell>
                        <TableCell className="text-right font-mono text-green-500">{event.reward}억</TableCell>
                        <TableCell className="text-right font-mono">{event.participants.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="font-bold">런칭 캠페인 합계</TableCell>
                      <TableCell className="text-right font-mono font-bold text-green-500">{LAUNCH_CAMPAIGN_TOTAL}억</TableCell>
                      <TableCell className="text-right font-mono font-bold">11,100</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Events Section */}
          <Card data-testid="card-seasonal-events">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                {t('tokenomics.seasonal.title', '분기별 시즌 이벤트')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.seasonal.desc', 'Q1~Q4 특별 이벤트 총 2.50억 TBURN')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {SEASONAL_EVENTS.map((event, idx) => {
                  const colors = ['bg-pink-500/10 border-pink-500/30', 'bg-amber-500/10 border-amber-500/30', 'bg-orange-500/10 border-orange-500/30', 'bg-blue-500/10 border-blue-500/30'];
                  return (
                    <Card key={idx} className={`${colors[idx]}`} data-testid={`card-seasonal-${event.quarter}`}>
                      <CardContent className="pt-4">
                        <Badge variant="outline" className="mb-2">{event.quarter}</Badge>
                        <div className="text-lg font-bold mb-1">{event.name}</div>
                        <div className="text-2xl font-bold text-primary mb-2">{event.reward}억</div>
                        <div className="text-xs text-muted-foreground">{event.description}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Event Calendar */}
          <Card data-testid="card-event-calendar">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                {t('tokenomics.calendar.title', 'Year-1 이벤트 캘린더 (월별 상세)')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.calendar.desc', 'TGE부터 1주년까지의 월별 이벤트 일정')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">{t('tokenomics.date', '시기')}</TableHead>
                      <TableHead>{t('tokenomics.eventName', '이벤트명')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.amount', '배분량')}</TableHead>
                      <TableHead>{t('tokenomics.condition', '참여 조건')}</TableHead>
                      <TableHead>{t('tokenomics.distribution', '배분 방식')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Y1_EVENT_CALENDAR.map((event, idx) => (
                      <TableRow key={idx} data-testid={`row-event-${idx}`}>
                        <TableCell className="font-medium">{event.date}</TableCell>
                        <TableCell>{event.name}</TableCell>
                        <TableCell className="text-right font-mono text-green-500">{event.amount}억</TableCell>
                        <TableCell className="text-muted-foreground">{event.condition}</TableCell>
                        <TableCell className="text-muted-foreground">{event.distribution}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genesis Pool Settings Tab - 제네시스 풀 설정 */}
        <TabsContent value="genesispool" className="space-y-4">
          {/* TGE Unlock Section */}
          <Card data-testid="card-tge-unlock">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {t('tokenomics.tge.title', 'TGE 즉시 언락 (Day 0: 2025년 12월 22일)')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.tge.desc', '메인넷 런칭 시점의 토큰 언락 현황')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">TGE 총 언락</div>
                    <div className="text-3xl font-bold text-primary">{TGE_TOTAL_UNLOCK}억</div>
                    <div className="text-xs text-muted-foreground">전체 공급의 9.10%</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">실제 유통량 (TGE)</div>
                    <div className="text-3xl font-bold text-green-500">{TGE_ACTUAL_CIRCULATION}억</div>
                    <div className="text-xs text-muted-foreground">전체 공급의 2.85%</div>
                  </CardContent>
                </Card>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('tokenomics.category', '카테고리')}</TableHead>
                      <TableHead className="text-center">TGE %</TableHead>
                      <TableHead className="text-right">{t('tokenomics.amount', '수량')}</TableHead>
                      <TableHead>{t('tokenomics.purpose', '목적')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TGE_UNLOCKS.map((unlock, idx) => (
                      <TableRow key={idx} data-testid={`row-tge-${idx}`}>
                        <TableCell className="font-medium">{unlock.category}</TableCell>
                        <TableCell className="text-center font-mono">{unlock.tgePercent}%</TableCell>
                        <TableCell className="text-right font-mono text-primary">{unlock.amount}억</TableCell>
                        <TableCell className="text-muted-foreground">{unlock.purpose}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Genesis Validator Settings */}
          <Card data-testid="card-genesis-validators">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-500" />
                {t('tokenomics.validators.title', '제네시스 검증자 설정')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.validators.desc', '메인넷 런칭 시 초기 검증자 구성')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="border-blue-500/30 bg-blue-500/5">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">총 검증자 수</div>
                    <div className="text-3xl font-bold text-blue-500">{GENESIS_VALIDATOR_CONFIG.totalValidators}</div>
                    <div className="text-xs text-muted-foreground">개</div>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">검증자당 스테이킹</div>
                    <div className="text-2xl font-bold text-primary">{(GENESIS_VALIDATOR_CONFIG.stakePerValidator / 1000000).toFixed(0)}M</div>
                    <div className="text-xs text-muted-foreground">TBURN (100만)</div>
                  </CardContent>
                </Card>
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">팀 총 스테이킹</div>
                    <div className="text-2xl font-bold text-green-500">{(GENESIS_VALIDATOR_CONFIG.totalTeamStake / 100000000).toFixed(2)}억</div>
                    <div className="text-xs text-muted-foreground">TBURN</div>
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">언본딩 기간</div>
                    <div className="text-3xl font-bold text-amber-500">{GENESIS_VALIDATOR_CONFIG.unbondingPeriod}</div>
                    <div className="text-xs text-muted-foreground">일</div>
                  </CardContent>
                </Card>
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">수수료율</div>
                    <div className="text-2xl font-bold text-purple-500">{GENESIS_VALIDATOR_CONFIG.commissionRate}%</div>
                    <div className="text-xs text-muted-foreground">{GENESIS_VALIDATOR_CONFIG.commissionRateRange.min}-{GENESIS_VALIDATOR_CONFIG.commissionRateRange.max}% 조정 가능</div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium mb-2">슬래싱 (다운타임)</div>
                  <div className="text-xl font-bold text-red-500">{GENESIS_VALIDATOR_CONFIG.slashingDowntime}%</div>
                  <div className="text-xs text-muted-foreground">사건당</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium mb-2">슬래싱 (이중 서명)</div>
                  <div className="text-xl font-bold text-red-500">{GENESIS_VALIDATOR_CONFIG.slashingDoubleSign}%</div>
                  <div className="text-xs text-muted-foreground">+ 영구 감옥</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium mb-2">최소 자기 위임</div>
                  <div className="text-xl font-bold">{GENESIS_VALIDATOR_CONFIG.minSelfDelegation}%</div>
                  <div className="text-xs text-muted-foreground">{GENESIS_VALIDATOR_CONFIG.source}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DEX Liquidity Pool Settings */}
          <Card data-testid="card-dex-liquidity">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-500" />
                {t('tokenomics.dex.title', 'DEX 유동성 풀 설정')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.dex.desc', '초기 유동성 공급 및 TVL 목표')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">초기 TVL</div>
                    <div className="text-3xl font-bold text-cyan-500">{DEX_TOTAL_TVL}</div>
                    <div className="text-xs text-muted-foreground">Total Value Locked</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">초기 가격</div>
                    <div className="text-3xl font-bold text-green-500">${DEX_INITIAL_PRICE}</div>
                    <div className="text-xs text-muted-foreground">/ TBURN</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">LP 락업</div>
                    <div className="text-3xl font-bold text-amber-500">{DEX_LP_LOCKUP_DAYS}</div>
                    <div className="text-xs text-muted-foreground">일 (2025.12.22 → 2026.12.22)</div>
                  </CardContent>
                </Card>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('tokenomics.pool', '풀')}</TableHead>
                      <TableHead className="text-right">TBURN 수량</TableHead>
                      <TableHead className="text-right">페어 수량</TableHead>
                      <TableHead className="text-right">초기 TVL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEX_LIQUIDITY_POOLS.map((pool, idx) => (
                      <TableRow key={idx} data-testid={`row-dex-${idx}`}>
                        <TableCell className="font-medium">{pool.pool}</TableCell>
                        <TableCell className="text-right font-mono text-primary">{pool.tburnAmount}억</TableCell>
                        <TableCell className="text-right font-mono">{pool.pairAmount}</TableCell>
                        <TableCell className="text-right font-mono text-green-500">{pool.initialTVL}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">합계</TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">5.00억</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-mono font-bold text-green-500">{DEX_TOTAL_TVL}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Burn Mechanism Tab */}
        <TabsContent value="burn" className="space-y-4">
          {/* Burn Sources */}
          <Card data-testid="card-burn-sources">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {t('tokenomics.burn.title', 'AI 기반 소각 메커니즘')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.burn.desc', 'Year-1 총 소각량: 5.60억 TBURN')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/5 md:col-span-2 lg:col-span-1">
                  <CardContent className="pt-4 text-center">
                    <div className="text-sm text-muted-foreground">Y1 총 소각</div>
                    <div className="text-4xl font-bold text-orange-500">{Y1_TOTAL_BURN}억</div>
                    <div className="text-xs text-muted-foreground">TBURN</div>
                  </CardContent>
                </Card>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('tokenomics.burnType', '소각 유형')}</TableHead>
                      <TableHead className="text-right">Y1 소각량</TableHead>
                      <TableHead>{t('tokenomics.description', '설명')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BURN_MECHANISMS.map((mech, idx) => (
                      <TableRow key={idx} data-testid={`row-burn-${idx}`}>
                        <TableCell className="font-medium">{mech.type}</TableCell>
                        <TableCell className="text-right font-mono text-orange-500">{mech.y1Amount}억</TableCell>
                        <TableCell className="text-muted-foreground">{mech.description}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Y1 총 소각</TableCell>
                      <TableCell className="text-right font-mono font-bold text-orange-500">{Y1_TOTAL_BURN}억</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Halving Schedule */}
          <Card data-testid="card-halving-schedule">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                {t('tokenomics.halving.title', '반감기 일정')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.halving.desc', '블록 보상 반감기를 통한 디플레이션 가속')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HALVING_SCHEDULE.map((halving, idx) => (
                  <Card key={idx} className={`border-red-500/30 ${idx === 0 ? 'bg-red-500/5' : 'bg-orange-500/5'}`} data-testid={`card-halving-${idx}`}>
                    <CardContent className="pt-4">
                      <Badge variant="outline" className="mb-2 border-red-500/50">{halving.event}</Badge>
                      <div className="text-2xl font-bold text-red-500 mb-2">{halving.yearLabel}</div>
                      <div className="text-3xl font-bold mb-2">{halving.reductionPercent}%</div>
                      <div className="text-sm text-muted-foreground">{halving.note}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4 Phase Strategy */}
          <Card data-testid="card-phase-strategy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                {t('tokenomics.phase.title', '4단계 Phase 전략')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.phase.desc', '20년에 걸친 토큰노믹스 로드맵')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>기간</TableHead>
                      <TableHead>공급 변화</TableHead>
                      <TableHead className="text-center">변화율</TableHead>
                      <TableHead>핵심 목표</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PHASE_STRATEGY.map((phase, idx) => {
                      const colors = ['text-green-500', 'text-orange-500', 'text-blue-500', 'text-purple-500'];
                      return (
                        <TableRow key={idx} data-testid={`row-phase-${idx}`}>
                          <TableCell className={`font-bold ${colors[idx]}`}>{phase.phase}</TableCell>
                          <TableCell className="font-mono">{phase.period}</TableCell>
                          <TableCell className="font-mono">{phase.supplyChange}</TableCell>
                          <TableCell className="text-center font-mono text-red-500">{phase.changePercent}</TableCell>
                          <TableCell className="text-muted-foreground">{phase.goal}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Info Tab */}
        <TabsContent value="document" className="space-y-4">
          <Card data-testid="card-document-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t('tokenomics.document.title', '문서 관리 및 승인')}
              </CardTitle>
              <CardDescription>
                {t('tokenomics.document.desc', 'TBURN 20년 토큰 이코노미 마스터 플랜 공식 문서')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">문서 제목</div>
                    <div className="text-lg font-bold">{TOKENOMICS_DOC_INFO.title}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">버전</div>
                    <div className="text-lg font-bold text-primary">{TOKENOMICS_DOC_INFO.version}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-green-500/10">
                    <div className="text-sm text-muted-foreground mb-1">상태</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-lg font-bold text-green-500">{TOKENOMICS_DOC_INFO.status}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">작성</div>
                    <div className="text-lg font-bold">{TOKENOMICS_DOC_INFO.author}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">시행일</div>
                    <div className="text-lg font-bold">{TOKENOMICS_DOC_INFO.effectiveDate}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">계획 기간</div>
                    <div className="text-lg font-bold">{TOKENOMICS_DOC_INFO.planPeriod}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-primary/10">
                      <div className="text-sm text-muted-foreground mb-1">제네시스 공급</div>
                      <div className="text-xl font-bold text-primary">{TOKENOMICS_DOC_INFO.genesisSupply}</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-green-500/10">
                      <div className="text-sm text-muted-foreground mb-1">최종 공급 (Y20)</div>
                      <div className="text-xl font-bold text-green-500">{TOKENOMICS_DOC_INFO.finalSupply}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-red-500/10">
                      <div className="text-sm text-muted-foreground mb-1">총 디플레이션</div>
                      <div className="text-xl font-bold text-red-500">{TOKENOMICS_DOC_INFO.totalDeflation}</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-500/10">
                      <div className="text-sm text-muted-foreground mb-1">Y1 활성화 예산</div>
                      <div className="text-xl font-bold text-orange-500">{TOKENOMICS_DOC_INFO.y1ActivationBudget}</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">블록 보상 풀</div>
                    <div className="text-lg font-bold">{TOKENOMICS_DOC_INFO.blockRewardPool}</div>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex items-start gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-green-500 mb-1">메인넷 제네시스 풀 실행 준비 완료</div>
                  <p className="text-sm text-muted-foreground">
                    본 문서는 TBURN 재단 및 Metalock (주식회사 메타록)의 승인을 받아 2025년 12월 22일 TGE와 함께 시행됩니다.
                    모든 토큰 배분, 베스팅 스케줄, 소각 메커니즘은 본 마스터 플랜에 따라 자동화된 스마트 컨트랙트로 실행됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investors Tab */}
        <TabsContent value="investors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1 bg-gradient-to-br from-green-500/10 to-emerald-500/10" data-testid="card-investor-total">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">{t('tokenomics.totalRaised', 'Total Raised')}</span>
                </div>
                <div className="text-3xl font-bold">${TOTAL_FUNDRAISING}M</div>
                <p className="text-xs text-muted-foreground">{t('tokenomics.fromAllRounds', 'from all rounds')}</p>
              </CardContent>
            </Card>
            {INVESTOR_ROUNDS.map((round) => (
              <Card key={round.id} data-testid={`card-investor-round-${round.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">{round.name}</span>
                  </div>
                  <div className="text-2xl font-bold">${round.raised}M</div>
                  <p className="text-xs text-muted-foreground">@ ${round.price.toFixed(2)}/TBURN</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Investor Round Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('tokenomics.roundDetails', 'Round Details')}</CardTitle>
                <CardDescription>{t('tokenomics.roundDetailsDesc', 'Allocation and vesting by round')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table data-testid="table-investor-details">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('tokenomics.round', 'Round')}</TableHead>
                      <TableHead>{t('tokenomics.allocation', 'Allocation')}</TableHead>
                      <TableHead>{t('tokenomics.price', 'Price')}</TableHead>
                      <TableHead>{t('tokenomics.vestingSchedule', 'Vesting')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INVESTOR_ROUNDS.map((round) => (
                      <TableRow key={round.id} data-testid={`row-investor-detail-${round.id}`}>
                        <TableCell>
                          <Badge variant={round.id === 'seed' ? 'default' : round.id === 'private' ? 'secondary' : 'outline'}>
                            {round.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{round.allocation}억</div>
                          <div className="text-xs text-muted-foreground">{round.allocationPercent}%</div>
                        </TableCell>
                        <TableCell>${round.price.toFixed(2)}</TableCell>
                        <TableCell className="text-xs">
                          <div>TGE: {round.tgePercent}%</div>
                          <div>Cliff: {round.cliffMonths}mo</div>
                          <div>Vest: {round.vestingMonths}mo</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Investor ROI Projections */}
            <Card>
              <CardHeader>
                <CardTitle>{t('tokenomics.roiProjections', 'ROI Projections')}</CardTitle>
                <CardDescription>{t('tokenomics.roiProjectionsDesc', 'Neutral scenario returns by round')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table data-testid="table-investor-roi">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('tokenomics.round', 'Round')}</TableHead>
                      <TableHead>{t('tokenomics.entry', 'Entry')}</TableHead>
                      <TableHead>Y1</TableHead>
                      <TableHead>Y5</TableHead>
                      <TableHead>Y10</TableHead>
                      <TableHead>Y20</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INVESTOR_ROI_DATA.map((roi) => (
                      <TableRow key={roi.roundId} data-testid={`row-investor-roi-${roi.roundId}`}>
                        <TableCell className="font-medium">{roi.roundId.toUpperCase()}</TableCell>
                        <TableCell>${roi.entryPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-green-500">{roi.y1.roi.toFixed(1)}x</TableCell>
                        <TableCell className="text-green-500">{roi.y5.roi.toFixed(1)}x</TableCell>
                        <TableCell className="text-green-500">{roi.y10.roi.toFixed(1)}x</TableCell>
                        <TableCell className="text-green-500 font-bold">{roi.y20.roi.toFixed(1)}x</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Supply Over Time */}
            <Card data-testid="card-supply-chart">
              <CardHeader>
                <CardTitle>{t('tokenomics.supplyOverTime', 'Supply Over Time')}</CardTitle>
                <CardDescription>
                  {t('tokenomics.supplyTrend', '20-year supply trajectory')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={supplyChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" className="text-xs" />
                      <YAxis domain={[60, 105]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}억`, t('tokenomics.supply', 'Supply')]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="supply" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Emission vs Burn */}
            <Card data-testid="card-emission-burn-chart">
              <CardHeader>
                <CardTitle>{t('tokenomics.emissionVsBurn', 'Emission vs Burn')}</CardTitle>
                <CardDescription>
                  {t('tokenomics.tokenFlow', 'Token flow per period')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={supplyChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(2)}억`,
                          name === 'emission' ? t('tokenomics.emission', 'Emission') : t('tokenomics.burn', 'Burn')
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="emission" name={t('tokenomics.emission', 'Emission')} fill="#22c55e" />
                      <Bar dataKey="burn" name={t('tokenomics.burn', 'Burn')} fill="#f97316" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deflation Rate Chart */}
          <Card data-testid="card-deflation-chart">
            <CardHeader>
              <CardTitle>{t('tokenomics.deflationRate', 'Deflation Rate by Period')}</CardTitle>
              <CardDescription>
                {t('tokenomics.rateAnalysis', 'Analysis of deflation intensity across phases')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TOKENOMICS_DATA.filter(p => p.id !== 'Y0')}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="id" className="text-xs" />
                    <YAxis domain={[-4, 1]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, t('tokenomics.rate', 'Rate')]}
                    />
                    <Bar 
                      dataKey="changeRate" 
                      name={t('tokenomics.changeRate', 'Change Rate')}
                    >
                      {TOKENOMICS_DATA.filter(p => p.id !== 'Y0').map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.changeRate < -2 ? '#ef4444' :
                            entry.changeRate < 0 ? '#f97316' :
                            entry.changeRate === 0 ? '#3b82f6' :
                            '#22c55e'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Forecast Tab */}
        <TabsContent value="price" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {t('tokenomics.priceForecast', '20-Year Price Forecast')}
                  </CardTitle>
                  <CardDescription>
                    {t('tokenomics.startingPrice', 'Starting price: $0.50')}
                  </CardDescription>
                </div>
                <Select 
                  value={selectedScenario} 
                  onValueChange={(v) => setSelectedScenario(v as ScenarioType)}
                >
                  <SelectTrigger className="w-[180px]" data-testid="select-scenario">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">{t('tokenomics.scenarios.conservative', 'Conservative')}</SelectItem>
                    <SelectItem value="neutral">{t('tokenomics.scenarios.neutral', 'Neutral')}</SelectItem>
                    <SelectItem value="optimistic">{t('tokenomics.scenarios.optimistic', 'Optimistic')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scenario Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${selectedScenario === 'conservative' ? 'ring-2 ring-green-500' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{t('tokenomics.scenarios.conservative', 'Conservative')}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">$0.50 → $3.87</div>
                  <div className="text-sm text-muted-foreground">7.7x | +10.8%/year</div>
                </div>
                <div className={`p-4 rounded-lg border ${selectedScenario === 'neutral' ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{t('tokenomics.scenarios.neutral', 'Neutral')}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">$0.50 → $15.58</div>
                  <div className="text-sm text-muted-foreground">31.2x | +18.9%/year</div>
                </div>
                <div className={`p-4 rounded-lg border ${selectedScenario === 'optimistic' ? 'ring-2 ring-orange-500' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{t('tokenomics.scenarios.optimistic', 'Optimistic')}</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">$0.50 → $105.33</div>
                  <div className="text-sm text-muted-foreground">210.7x | +31.4%/year</div>
                </div>
              </div>

              {/* Price Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="year" 
                      className="text-xs"
                      tickFormatter={(v) => `Y${v}`}
                    />
                    <YAxis 
                      className="text-xs" 
                      scale="log" 
                      domain={[0.1, 150]}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'conservative' ? t('tokenomics.scenarios.conservative', 'Conservative') :
                        name === 'neutral' ? t('tokenomics.scenarios.neutral', 'Neutral') :
                        t('tokenomics.scenarios.optimistic', 'Optimistic')
                      ]}
                      labelFormatter={(v) => `Year ${v}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="conservative" 
                      name={t('tokenomics.scenarios.conservative', 'Conservative')}
                      stroke="#22c55e" 
                      strokeWidth={selectedScenario === 'conservative' ? 3 : 1}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="neutral" 
                      name={t('tokenomics.scenarios.neutral', 'Neutral')}
                      stroke="#3b82f6" 
                      strokeWidth={selectedScenario === 'neutral' ? 3 : 1}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="optimistic" 
                      name={t('tokenomics.scenarios.optimistic', 'Optimistic')}
                      stroke="#f59e0b" 
                      strokeWidth={selectedScenario === 'optimistic' ? 3 : 1}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Price Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('tokenomics.table.year', 'Year')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.table.supply', 'Supply')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.scenarios.conservative', 'Conservative')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.scenarios.neutral', 'Neutral')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.scenarios.optimistic', 'Optimistic')}</TableHead>
                      <TableHead className="text-right">{t('tokenomics.marketCap', 'Market Cap (Neutral)')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PRICE_FORECAST_DATA.map((row) => (
                      <TableRow key={row.year} data-testid={`row-price-y${row.year}`}>
                        <TableCell className="font-medium">Y{row.year}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatSupply(row.supply, locale)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-500">
                          {formatCurrency(row.conservative)}
                          {row.conservativeGrowth > 0 && (
                            <span className="text-xs ml-1">(+{row.conservativeGrowth}%)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-blue-500">
                          {formatCurrency(row.neutral)}
                          {row.neutralGrowth > 0 && (
                            <span className="text-xs ml-1">(+{row.neutralGrowth}%)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-orange-500">
                          {formatCurrency(row.optimistic)}
                          {row.optimisticGrowth > 0 && (
                            <span className="text-xs ml-1">(+{row.optimisticGrowth}%)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMarketCap(row.marketCapNeutral, locale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50">
                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('tokenomics.disclaimer', 'Price forecasts are based on tokenomics model assumptions and do not constitute financial advice. Actual prices may vary significantly based on market conditions, adoption, and other factors.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
