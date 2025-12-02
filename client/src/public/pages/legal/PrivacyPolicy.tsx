import { Link } from "wouter";
import { 
  Shield, ArrowLeft, FileText, AlertTriangle, Database, 
  Lock, Eye, Globe, Users, Cookie, Mail, HelpCircle, CheckCircle,
  Key, Wallet, UserCheck, Scale, BookOpen
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 mb-8 border-b border-white/10 bg-gradient-to-b from-[#7000ff]/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#7000ff] mb-6 transition-colors group"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.legal.common.backToHome')}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[#7000ff]/10 text-[#7000ff] border border-[#7000ff]/20">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white" data-testid="text-page-title">{t('publicPages.legal.privacy.title')}</h1>
          </div>
          <p className="text-gray-400 ml-16">{t('publicPages.legal.privacy.subtitle')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-8 md:p-12 text-gray-300">
          
          {/* Section 1: Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">1.</span> {t('publicPages.legal.privacy.sections.introduction.title')}
            </h2>
            <p className="leading-relaxed">
              {t('publicPages.legal.privacy.sections.introduction.content')}
            </p>
          </div>

          {/* Section 2: Information We Collect */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">2.</span> {t('publicPages.legal.privacy.sections.informationCollect.title')}
            </h2>
            
            <h3 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#7000ff]" /> {t('publicPages.legal.privacy.sections.informationCollect.provided.title')}
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.informationCollect.provided.account.label')}</strong> {t('publicPages.legal.privacy.sections.informationCollect.provided.account.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.informationCollect.provided.project.label')}</strong> {t('publicPages.legal.privacy.sections.informationCollect.provided.project.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.informationCollect.provided.communication.label')}</strong> {t('publicPages.legal.privacy.sections.informationCollect.provided.communication.value')}</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#7000ff]" /> {t('publicPages.legal.privacy.sections.informationCollect.automatic.title')}
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.informationCollect.automatic.blockchain.label')}</strong> {t('publicPages.legal.privacy.sections.informationCollect.automatic.blockchain.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.informationCollect.automatic.device.label')}</strong> {t('publicPages.legal.privacy.sections.informationCollect.automatic.device.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.informationCollect.automatic.usage.label')}</strong> {t('publicPages.legal.privacy.sections.informationCollect.automatic.usage.value')}</li>
            </ul>
          </div>

          {/* Section 3: How We Use Your Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">3.</span> {t('publicPages.legal.privacy.sections.howWeUse.title')}
            </h2>
            <p className="mb-4">{t('publicPages.legal.privacy.sections.howWeUse.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('publicPages.legal.privacy.sections.howWeUse.items.operating')}</li>
              <li>{t('publicPages.legal.privacy.sections.howWeUse.items.verification')}</li>
              <li>{t('publicPages.legal.privacy.sections.howWeUse.items.fraud')}</li>
              <li>{t('publicPages.legal.privacy.sections.howWeUse.items.improving')}</li>
              <li>{t('publicPages.legal.privacy.sections.howWeUse.items.compliance')}</li>
            </ul>
          </div>

          {/* Section 4: Information Sharing */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">4.</span> {t('publicPages.legal.privacy.sections.sharing.title')}
            </h2>
            <p className="mb-4">{t('publicPages.legal.privacy.sections.sharing.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.sharing.validators.label')}</strong> {t('publicPages.legal.privacy.sections.sharing.validators.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.sharing.providers.label')}</strong> {t('publicPages.legal.privacy.sections.sharing.providers.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.privacy.sections.sharing.legal.label')}</strong> {t('publicPages.legal.privacy.sections.sharing.legal.value')}</li>
            </ul>
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-200 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span><strong>{t('publicPages.legal.privacy.sections.sharing.noSell')}</strong></span>
              </p>
            </div>
          </div>

          {/* Section 5: Blockchain-Specific Privacy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">5.</span> {t('publicPages.legal.privacy.sections.blockchain.title')}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#7000ff]" /> {t('publicPages.legal.privacy.sections.blockchain.publicData.title')}
                </h4>
                <p className="text-sm text-gray-400">
                  {t('publicPages.legal.privacy.sections.blockchain.publicData.content')}
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#7000ff]" /> {t('publicPages.legal.privacy.sections.blockchain.pseudonymity.title')}
                </h4>
                <p className="text-sm text-gray-400">
                  {t('publicPages.legal.privacy.sections.blockchain.pseudonymity.content')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Security & Rights */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">6.</span> {t('publicPages.legal.privacy.sections.security.title')}
            </h2>
            <p className="mb-4">{t('publicPages.legal.privacy.sections.security.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>{t('publicPages.legal.privacy.sections.security.measures.ssl')}</li>
              <li>{t('publicPages.legal.privacy.sections.security.measures.encrypted')}</li>
              <li>{t('publicPages.legal.privacy.sections.security.measures.mfa')}</li>
              <li>{t('publicPages.legal.privacy.sections.security.measures.audits')}</li>
            </ul>
            <p className="mb-4">{t('publicPages.legal.privacy.sections.security.rightsIntro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('publicPages.legal.privacy.sections.security.rights.access')}</li>
              <li>{t('publicPages.legal.privacy.sections.security.rights.correct')}</li>
              <li>{t('publicPages.legal.privacy.sections.security.rights.delete')}</li>
              <li>{t('publicPages.legal.privacy.sections.security.rights.object')}</li>
              <li>{t('publicPages.legal.privacy.sections.security.rights.portability')}</li>
            </ul>
          </div>

          {/* Section 7: Cookies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">7.</span> {t('publicPages.legal.privacy.sections.cookies.title')}
            </h2>
            <p className="mb-4">{t('publicPages.legal.privacy.sections.cookies.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('publicPages.legal.privacy.sections.cookies.items.preferences')}</li>
              <li>{t('publicPages.legal.privacy.sections.cookies.items.analytics')}</li>
              <li>{t('publicPages.legal.privacy.sections.cookies.items.experience')}</li>
            </ul>
            <p className="mt-4 text-sm text-gray-400">
              {t('publicPages.legal.privacy.sections.cookies.manage')}
            </p>
          </div>

          {/* Section 8: International Transfers */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">8.</span> {t('publicPages.legal.privacy.sections.international.title')}
            </h2>
            <p>
              {t('publicPages.legal.privacy.sections.international.content')}
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">{t('publicPages.legal.privacy.contact.title')}</h2>
            <p className="mb-4 text-gray-400">{t('publicPages.legal.privacy.contact.description')}</p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#7000ff]" />
                  <strong className="text-[#7000ff]">{t('publicPages.legal.privacy.contact.email.label')}</strong>
                </div>
                <p className="text-gray-300">privacy@tburn.io</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-[#7000ff]" />
                  <strong className="text-[#7000ff]">{t('publicPages.legal.privacy.contact.response.label')}</strong>
                </div>
                <p className="text-gray-300">{t('publicPages.legal.privacy.contact.response.value')}</p>
              </div>
            </div>
          </div>

          {/* Related Legal Pages */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.legal.common.relatedDocs')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/legal/terms-of-service"
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                data-testid="link-terms"
              >
                <FileText className="w-5 h-5 text-[#00f0ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.legal.common.links.terms.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.links.terms.subtitle')}</p>
                </div>
              </Link>
              <Link 
                href="/legal/disclaimer"
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                data-testid="link-disclaimer"
              >
                <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#f59e0b] transition">{t('publicPages.legal.common.links.disclaimer.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.links.disclaimer.subtitle')}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Related Learn Pages */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.legal.common.learnMore')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/learn/what-is-wallet"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                data-testid="link-wallets"
              >
                <Wallet className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.legal.common.learn.wallet.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.learn.wallet.subtitle')}</p>
                </div>
              </Link>
              <Link 
                href="/learn/trust-score-system"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                data-testid="link-trust-score"
              >
                <Scale className="w-5 h-5 text-[#00f0ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.legal.common.learn.trustScore.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.learn.trustScore.subtitle')}</p>
                </div>
              </Link>
              <Link 
                href="/learn/blockchain-basics"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition group"
                data-testid="link-blockchain"
              >
                <BookOpen className="w-5 h-5 text-[#10b981]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#10b981] transition">{t('publicPages.legal.common.learn.blockchain.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.learn.blockchain.subtitle')}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Related Solutions */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.legal.common.securitySolutions')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/solutions/wallets"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                data-testid="link-solution-wallets"
              >
                <Wallet className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.legal.common.solutions.wallets.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.solutions.wallets.subtitle')}</p>
                </div>
              </Link>
              <Link 
                href="/solutions/permissioned"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
                data-testid="link-solution-permissioned"
              >
                <Lock className="w-5 h-5 text-[#ffd700]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#ffd700] transition">{t('publicPages.legal.common.solutions.permissioned.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.solutions.permissioned.subtitle')}</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
