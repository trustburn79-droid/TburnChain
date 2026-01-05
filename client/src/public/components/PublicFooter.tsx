import { Link } from "wouter";
import { SiX, SiGithub, SiDiscord, SiInstagram, SiTiktok, SiYoutube, SiFacebook } from "react-icons/si";
import { Mail, Globe, Shield, Zap, Loader2 } from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import "../styles/public.css";

const socialLinks = [
  { icon: SiX, href: "https://x.com/tburnio", label: "X" },
  { icon: SiDiscord, href: "https://discord.gg/uaPFkUkfN2", label: "Discord" },
  { icon: SiYoutube, href: "https://www.youtube.com/@tburnio", label: "YouTube" },
  { icon: SiInstagram, href: "https://www.instagram.com/tburnio/", label: "Instagram" },
  { icon: SiTiktok, href: "https://www.tiktok.com/@tburnio", label: "TikTok" },
  { icon: SiFacebook, href: "https://www.facebook.com/profile.php?id=61584329147888", label: "Facebook" },
];

const ecosystemLinks = [
  { titleKey: "validators", href: "/network/validators" },
  { titleKey: "bridge", href: "/solutions/cross-chain-bridge" },
  { titleKey: "explorer", href: "/app" },
  { titleKey: "staking", href: "/app/staking" },
  { titleKey: "dex", href: "/app/dex" },
  { titleKey: "nftMarketplace", href: "/app/nft-marketplace" },
  { titleKey: "lending", href: "/app/lending" },
  { titleKey: "yieldFarming", href: "/app/yield-farming" },
];

const solutionsLinks = [
  { titleKey: "defiHub", href: "/solutions/defi-hub" },
  { titleKey: "enterprise", href: "/use-cases/enterprise" },
  { titleKey: "aiFeatures", href: "/solutions/ai-features" },
  { titleKey: "tokenExtensions", href: "/solutions/token-extensions" },
  { titleKey: "gameTooling", href: "/solutions/game-tooling" },
  { titleKey: "btcfi", href: "/solutions/btcfi" },
  { titleKey: "payments", href: "/solutions/payments" },
  { titleKey: "actionsBlinks", href: "/solutions/actions-blinks" },
];

const developersLinks = [
  { titleKey: "documentation", href: "/developers/docs" },
  { titleKey: "quickstart", href: "/developers/quickstart" },
  { titleKey: "apiReference", href: "/developers/api" },
  { titleKey: "sdkGuide", href: "/developers/sdk" },
  { titleKey: "smartContracts", href: "/developers/contracts" },
  { titleKey: "websocketApi", href: "/developers/websocket" },
  { titleKey: "cliReference", href: "/developers/cli" },
  { titleKey: "github", href: "https://github.com/tburnchain", external: true },
];

const resourcesLinks = [
  { titleKey: "whitepaper", href: "/learn/whitepaper" },
  { titleKey: "tokenomics", href: "/learn/tokenomics" },
  { titleKey: "roadmap", href: "/learn/roadmap" },
  { titleKey: "apiStatus", href: "/network/status" },
  { titleKey: "rpcEndpoints", href: "/network/rpc" },
  { titleKey: "blockchainBasics", href: "/learn/blockchain-basics" },
  { titleKey: "defiMastery", href: "/learn/defi-mastery" },
  { titleKey: "educationPrograms", href: "/learn/education-programs" },
];

const communityLinks = [
  { titleKey: "newsBlog", href: "/community/news" },
  { titleKey: "events", href: "/community/events" },
  { titleKey: "communityHub", href: "/community/hub" },
  { titleKey: "governance", href: "/app/governance" },
  { titleKey: "fiatRamp", href: "/network/ramp" },
];

const legalLinks = [
  { titleKey: "termsOfService", href: "/legal/terms-of-service" },
  { titleKey: "privacyPolicy", href: "/legal/privacy-policy" },
  { titleKey: "disclaimer", href: "/legal/disclaimer" },
];

const quickLinks = [
  { title: "TBurn Scan", href: "/scan" },
  { title: "TBurn Scan Testnet", href: "/testnet-scan", isTestnet: true },
  { title: "VC", href: "/vc" },
  { title: "RPC", href: "/rpc" },
  { title: "Testnet RPC", href: "/testnet-rpc", isTestnet: true },
  { title: "Validator", href: "/validator", isValidator: true },
];

export function PublicFooter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const { data: networkStats } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/public/v1/network/stats'],
    staleTime: 30000, // Match backend cache TTL for consistent display
    refetchOnMount: false, // Use cached value for consistency across pages
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (emailToSubmit: string) => {
      return apiRequest("POST", "/api/newsletter/subscribe", { email: emailToSubmit, source: "footer" });
    },
    onSuccess: () => {
      toast({ title: t('publicPages.footer.subscribeSuccess') || "구독 완료!", description: t('publicPages.footer.subscribeSuccessDesc') || "뉴스레터 구독이 완료되었습니다.", duration: 5000 });
      setEmail("");
    },
    onError: (error: any) => {
      let errorMessage = t('publicPages.footer.subscribeErrorDesc') || "구독 처리 중 오류가 발생했습니다.";
      let errorTitle = t('publicPages.footer.subscribeError') || "오류";
      
      // Parse error message from API response (format: "409: {json}")
      if (error?.message) {
        const match = error.message.match(/^\d+:\s*(.+)$/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            if (parsed.error) {
              // Check if already subscribed (409 status)
              if (error.message.startsWith("409:")) {
                errorTitle = "이미 구독 중";
                errorMessage = parsed.error;
              } else {
                errorMessage = parsed.error;
              }
            }
          } catch {
            errorMessage = match[1];
          }
        }
      }
      
      toast({ title: errorTitle, description: errorMessage, variant: "destructive", duration: 5000 });
    },
  });

  const handleSubscribe = () => {
    if (!email.trim()) {
      toast({ title: t('publicPages.footer.emailRequired') || "이메일 필요", description: t('publicPages.footer.enterValidEmail') || "이메일 주소를 입력해주세요.", variant: "destructive" });
      return;
    }
    subscribeMutation.mutate(email);
  };

  const stats = networkStats?.data ? [
    { 
      value: networkStats.data.tps >= 1000 
        ? Math.floor(networkStats.data.tps / 1000).toLocaleString() + "K" 
        : (networkStats.data.tps || 210000).toLocaleString(), 
      labelKey: "tps" 
    },
    { 
      value: networkStats.data.blockHeight >= 1000000 
        ? (networkStats.data.blockHeight / 1000000).toFixed(1) + "M" 
        : networkStats.data.blockHeight?.toLocaleString() || "1.9M", 
      labelKey: "blocks" 
    },
    { 
      value: networkStats.data.totalTransactions >= 1000000 
        ? (networkStats.data.totalTransactions / 1000000).toFixed(1) + "M" 
        : networkStats.data.totalTransactions >= 1000 
          ? Math.floor(networkStats.data.totalTransactions / 1000).toLocaleString() + "K" 
          : networkStats.data.totalTransactions?.toLocaleString() || "56.3M", 
      labelKey: "dailyTxs" 
    },
    { value: networkStats.data.uptime || "99.99%", labelKey: "uptime" },
  ] : [
    { value: "210K", labelKey: "tps" },
    { value: "1.9M", labelKey: "blocks" },
    { value: "56.3M", labelKey: "dailyTxs" },
    { value: "99.99%", labelKey: "uptime" },
  ];

  return (
    <footer className="border-t border-white/5 bg-black/80 backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#7000ff]/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-12 border-b border-white/5">
          {stats.map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{t(`publicPages.footer.stats.${stat.labelKey}`)}</div>
            </div>
          ))}
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <TBurnLogo className="w-8 h-8" />
              <span className="text-xl font-bold text-white">TBurn Chain</span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {t('publicPages.footer.brandDescription')}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-[#00f0ff]/50 transition"
                  aria-label={social.label}
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <a 
              href="mailto:contact@tburn.io" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00f0ff] transition"
            >
              <Mail className="w-4 h-4" />
              contact@tburn.io
            </a>
          </div>
          
          {/* Ecosystem */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00f0ff]" />
              {t('publicPages.footer.ecosystem')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {ecosystemLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {t(`publicPages.footer.ecosystemLinks.${link.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#7000ff]" />
              {t('publicPages.footer.solutions')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {solutionsLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {t(`publicPages.footer.solutionsLinks.${link.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Developers */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-[#00f0ff] font-mono text-xs">&lt;/&gt;</span>
              {t('publicPages.footer.developers')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {developersLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#00f0ff] transition inline-block"
                    >
                      {t(`publicPages.footer.developersLinks.${link.titleKey}`)}
                    </a>
                  ) : (
                    <Link 
                      href={link.href} 
                      className="hover:text-[#00f0ff] transition inline-block"
                    >
                      {t(`publicPages.footer.developersLinks.${link.titleKey}`)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              {t('publicPages.footer.resources')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {resourcesLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {t(`publicPages.footer.resourcesLinks.${link.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-[#ffd700]">★</span>
              {t('publicPages.footer.community')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {communityLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#00f0ff] transition inline-block"
                  >
                    {t(`publicPages.footer.communityLinks.${link.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-bold mb-1">{t('publicPages.footer.stayUpdated')}</h4>
              <p className="text-sm text-gray-400">{t('publicPages.footer.newsletterDesc')}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                placeholder={t('publicPages.footer.enterEmail')}
                className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
                data-testid="input-footer-email"
                disabled={subscribeMutation.isPending}
              />
              <button 
                onClick={handleSubscribe}
                disabled={subscribeMutation.isPending}
                className="px-5 py-2.5 rounded-lg bg-[#7000ff] text-white font-semibold text-sm hover:bg-purple-600 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                data-testid="button-footer-subscribe"
              >
                {subscribeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('publicPages.footer.subscribe')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              {t('publicPages.footer.copyright')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              {quickLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`${link.isValidator ? 'text-[#00D9A5] hover:text-[#00FFB8]' : link.isTestnet ? 'text-orange-500 hover:text-orange-400' : 'text-[#00f0ff] hover:text-white'} transition font-medium`}
                  data-testid={`link-footer-${link.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            {legalLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="hover:text-gray-300 transition"
              >
                {t(`publicPages.footer.${link.titleKey}`)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
