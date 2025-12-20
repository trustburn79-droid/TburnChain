import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Home,
  HelpCircle,
  ScanLine,
  User,
  ExternalLink,
  Bug,
  Award,
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Target,
  Zap,
  Lock,
  Code,
} from "lucide-react";
import { Link } from "wouter";

interface BountyTier {
  severity: string;
  color: string;
  bgColor: string;
  reward: string;
  description: string;
  examples: string[];
}

const BOUNTY_TIERS: BountyTier[] = [
  {
    severity: "Critical",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    reward: "$100,000 - $500,000",
    description: "Direct loss of funds or complete protocol compromise",
    examples: [
      "Unauthorized token minting",
      "Drain of liquidity pools",
      "Bridge exploit allowing theft",
      "Consensus manipulation",
    ],
  },
  {
    severity: "High",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    reward: "$25,000 - $100,000",
    description: "Significant impact to protocol integrity or user funds at risk",
    examples: [
      "Denial of service on consensus",
      "Validator slashing bypass",
      "Governance manipulation",
      "Oracle price manipulation",
    ],
  },
  {
    severity: "Medium",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    reward: "$5,000 - $25,000",
    description: "Limited impact vulnerabilities or complex exploitation required",
    examples: [
      "Front-running opportunities",
      "Temporary DoS conditions",
      "Information disclosure",
      "Smart contract logic errors",
    ],
  },
  {
    severity: "Low",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    reward: "$1,000 - $5,000",
    description: "Minor issues with minimal impact",
    examples: [
      "Gas optimization issues",
      "Event emission errors",
      "Minor UI vulnerabilities",
      "Non-critical logic bugs",
    ],
  },
];

const IN_SCOPE = [
  "TBURN Core Protocol (Token, Staking, Governance)",
  "Cross-Chain Bridge Contracts",
  "NFT Marketplace Contracts",
  "DeFi Modules (DEX, Lending, Yield)",
  "Consensus Layer Implementation",
  "Validator Node Software",
  "Official Web Applications",
  "API Endpoints",
];

const OUT_OF_SCOPE = [
  "Third-party applications and integrations",
  "Social engineering attacks",
  "Physical attacks on infrastructure",
  "Denial of service (spam/resource exhaustion)",
  "Issues already reported or known",
  "Theoretical vulnerabilities without PoC",
  "Best practice recommendations",
];

const SUBMISSION_STEPS = [
  {
    step: 1,
    title: "Discover",
    description: "Identify a potential vulnerability in scope",
    icon: Target,
  },
  {
    step: 2,
    title: "Document",
    description: "Create detailed report with proof of concept",
    icon: FileText,
  },
  {
    step: 3,
    title: "Submit",
    description: "Send encrypted report to security@tburn.io",
    icon: Send,
  },
  {
    step: 4,
    title: "Review",
    description: "Our team reviews within 48 hours",
    icon: Clock,
  },
  {
    step: 5,
    title: "Reward",
    description: "Receive bounty upon verification and fix",
    icon: Award,
  },
];

export default function BugBountyPage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`sticky top-0 z-50 border-b ${theme === 'dark' ? 'bg-gray-950/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("bounty.title", "Bug Bounty Program")}</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t("bounty.subtitle", "Help Secure TBURN, Earn Rewards")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="icon"><Home className="w-4 h-4" /></Button></Link>
            <Link href="/qna"><Button variant="ghost" size="icon"><HelpCircle className="w-4 h-4" /></Button></Link>
            <Link href="/scan"><Button variant="ghost" size="icon"><ScanLine className="w-4 h-4" /></Button></Link>
            <Link href="/user"><Button variant="ghost" size="icon"><User className="w-4 h-4" /></Button></Link>
            <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
              <SelectTrigger className="w-10 h-10 p-0 rounded-full border-0 justify-center">
                <Globe className="w-5 h-5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className={`p-8 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30' : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">
                {t("bounty.active", "Program Active")}
              </Badge>
              <h2 className="text-3xl font-bold mb-2">
                {t("bounty.earnUp", "Earn up to")} <span className="text-green-400">$500,000</span>
              </h2>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {t("bounty.heroDesc", "Help us secure the TBURN ecosystem and get rewarded for your discoveries")}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                <Send className="w-5 h-5 mr-2" />
                {t("bounty.submitReport", "Submit Report")}
              </Button>
              <Link href="/security-audit">
                <Button variant="outline" className="w-full">
                  <Shield className="w-5 h-5 mr-2" />
                  {t("bounty.viewAudits", "View Audits")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardContent className="pt-6 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-green-400 mb-4" />
              <p className="text-3xl font-bold">$2.5M+</p>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {t("bounty.totalPaid", "Total Paid Out")}
              </p>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardContent className="pt-6 text-center">
              <Bug className="w-12 h-12 mx-auto text-blue-400 mb-4" />
              <p className="text-3xl font-bold">47</p>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {t("bounty.bugsFound", "Bugs Found & Fixed")}
              </p>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardContent className="pt-6 text-center">
              <Clock className="w-12 h-12 mx-auto text-purple-400 mb-4" />
              <p className="text-3xl font-bold">&lt;48h</p>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {t("bounty.responseTime", "Avg Response Time")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {t("bounty.rewardTiers", "Reward Tiers")}
            </CardTitle>
            <CardDescription>
              {t("bounty.rewardTiersDesc", "Rewards based on severity and impact of the vulnerability")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {BOUNTY_TIERS.map((tier) => (
                <div
                  key={tier.severity}
                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${tier.bgColor} flex items-center justify-center`}>
                        <AlertTriangle className={`w-5 h-5 ${tier.color}`} />
                      </div>
                      <div>
                        <h3 className={`font-bold ${tier.color}`}>{tier.severity}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {tier.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${tier.bgColor} ${tier.color} border-0 text-lg px-4 py-1`}>
                      {tier.reward}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tier.examples.map((example, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                {t("bounty.inScope", "In Scope")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {IN_SCOPE.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                {t("bounty.outOfScope", "Out of Scope")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {OUT_OF_SCOPE.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {t("bounty.howToSubmit", "How to Submit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {SUBMISSION_STEPS.map((step, index) => (
                <div key={step.step} className="flex-1 text-center relative">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <step.icon className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-bold mb-1">{step.title}</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                  {index < SUBMISSION_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-green-500/50 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <Lock className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="font-bold">{t("bounty.secureSubmission", "Secure Submission")}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t("bounty.secureSubmissionDesc", "Send encrypted reports to")} <span className="font-mono text-green-400">security@tburn.io</span>
              </p>
            </div>
            <Button className="ml-auto">
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("bounty.pgpKey", "Get PGP Key")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
