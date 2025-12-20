import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Globe,
  Home,
  HelpCircle,
  ScanLine,
  User,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Shield,
  MessageCircle,
  Send,
  Twitter,
  FileText,
  BookOpen,
  Mail,
  Phone,
  Copy,
  Lock,
} from "lucide-react";
import { SiDiscord, SiTelegram, SiGithub, SiMedium, SiYoutube } from "react-icons/si";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface OfficialChannel {
  id: string;
  name: string;
  url: string;
  icon: any;
  category: "social" | "support" | "documentation" | "community";
  verified: boolean;
  description: string;
  followers?: string;
}

const OFFICIAL_CHANNELS: OfficialChannel[] = [
  {
    id: "website",
    name: "TBURN Official Website",
    url: "https://tburn.io",
    icon: Globe,
    category: "documentation",
    verified: true,
    description: "Official website with documentation and resources",
  },
  {
    id: "twitter",
    name: "TBURN Twitter/X",
    url: "https://twitter.com/TBURNofficial",
    icon: Twitter,
    category: "social",
    verified: true,
    description: "Official announcements and updates",
    followers: "125K+",
  },
  {
    id: "discord",
    name: "TBURN Discord",
    url: "https://discord.gg/tburn",
    icon: SiDiscord,
    category: "community",
    verified: true,
    description: "Community discussions and support",
    followers: "85K+",
  },
  {
    id: "telegram",
    name: "TBURN Telegram",
    url: "https://t.me/TBURNofficial",
    icon: SiTelegram,
    category: "community",
    verified: true,
    description: "Real-time community chat",
    followers: "95K+",
  },
  {
    id: "github",
    name: "TBURN GitHub",
    url: "https://github.com/tburn-blockchain",
    icon: SiGithub,
    category: "documentation",
    verified: true,
    description: "Open source code repositories",
  },
  {
    id: "medium",
    name: "TBURN Blog",
    url: "https://medium.com/tburn",
    icon: SiMedium,
    category: "documentation",
    verified: true,
    description: "Technical articles and updates",
  },
  {
    id: "youtube",
    name: "TBURN YouTube",
    url: "https://youtube.com/@TBURNofficial",
    icon: SiYoutube,
    category: "social",
    verified: true,
    description: "Video tutorials and AMAs",
    followers: "45K+",
  },
  {
    id: "docs",
    name: "TBURN Documentation",
    url: "https://docs.tburn.io",
    icon: BookOpen,
    category: "documentation",
    verified: true,
    description: "Developer documentation and guides",
  },
  {
    id: "support",
    name: "Support Email",
    url: "mailto:support@tburn.io",
    icon: Mail,
    category: "support",
    verified: true,
    description: "Official support channel",
  },
];

export default function OfficialChannelsPage() {
  const { t, i18n } = useTranslation();
  
  const PHISHING_WARNINGS = [
    t('securityPages.officialChannels.neverShareSeed'),
    t('securityPages.officialChannels.neverDmFirst'),
    t('securityPages.officialChannels.verifyUrls'),
    t('securityPages.officialChannels.officialDomainCheck'),
    t('securityPages.officialChannels.enable2fa'),
  ];
  const { theme } = useTheme();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("securityPages.officialChannels.linkCopied"),
      description: t("securityPages.officialChannels.copiedToClipboard"),
    });
  };

  const getCategoryLabel = (category: OfficialChannel["category"]) => {
    switch (category) {
      case "social": return t("securityPages.officialChannels.socialMedia");
      case "support": return t("securityPages.officialChannels.support");
      case "documentation": return t("securityPages.officialChannels.documentation");
      case "community": return t("securityPages.officialChannels.joinCommunity");
    }
  };

  const groupedChannels = OFFICIAL_CHANNELS.reduce((acc, channel) => {
    if (!acc[channel.category]) acc[channel.category] = [];
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<string, OfficialChannel[]>);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`sticky top-0 z-50 border-b ${theme === 'dark' ? 'bg-gray-950/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("securityPages.officialChannels.title")}</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t("securityPages.officialChannels.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="icon"><Home className="w-4 h-4" /></Button></Link>
            <Link href="/qna"><Button variant="ghost" size="icon"><HelpCircle className="w-4 h-4" /></Button></Link>
            <Link href="/scan"><Button variant="ghost" size="icon"><ScanLine className="w-4 h-4" /></Button></Link>
            <Link href="/user"><Button variant="ghost" size="icon"><User className="w-4 h-4" /></Button></Link>
            <LanguageSelector isDark={theme === 'dark'} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Alert className={`border-red-500/50 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-500 font-bold">
            {t("securityPages.officialChannels.phishingWarning")}
          </AlertTitle>
          <AlertDescription className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {PHISHING_WARNINGS.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        <Card className={`${theme === 'dark' ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {t("securityPages.officialChannels.officialDomain")}
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </h2>
                <p className={`text-2xl font-mono mt-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  tburn.io
                </p>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t("securityPages.officialChannels.sslVerified")}
                </p>
              </div>
              <Button variant="outline" onClick={() => copyToClipboard("https://tburn.io")}>
                <Copy className="w-4 h-4 mr-2" />
                {t("securityPages.officialChannels.copy")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {Object.entries(groupedChannels).map(([category, channels]) => (
          <Card key={category} className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardHeader>
              <CardTitle>{getCategoryLabel(category as OfficialChannel["category"])}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((channel) => (
                  <a
                    key={channel.id}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-lg border flex items-center gap-4 transition-colors ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    data-testid={`channel-${channel.id}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <channel.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{channel.name}</h3>
                        {channel.verified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {channel.description}
                      </p>
                      {channel.followers && (
                        <Badge variant="secondary" className="mt-1">{channel.followers}</Badge>
                      )}
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t("securityPages.officialChannels.verificationTips")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">1. {t("securityPages.officialChannels.checkUrl")}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t("securityPages.officialChannels.checkUrlDesc")}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">2. {t("securityPages.officialChannels.verifiedBadge")}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t("securityPages.officialChannels.verifiedBadgeDesc")}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">3. {t("securityPages.officialChannels.crossReference")}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t("securityPages.officialChannels.crossReferenceDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
