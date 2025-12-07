import { Link } from "wouter";
import { 
  FileText, ArrowLeft, Shield, AlertTriangle, Scale, 
  Users, Key, CheckCircle, Mail, HelpCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TermsOfService() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-16 mb-8 border-b border-gray-200 dark:border-white/10 bg-gradient-to-b from-[#00f0ff]/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#00f0ff] mb-6 transition-colors group"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.legal.common.backToHome')}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">{t('publicPages.legal.terms.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-16">{t('publicPages.legal.terms.subtitle')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-8 md:p-12 text-gray-700 dark:text-gray-300">
          
          {/* Section 1: Acceptance of Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">1.</span> {t('publicPages.legal.terms.sections.acceptance.title')}
            </h2>
            <p className="leading-relaxed">
              {t('publicPages.legal.terms.sections.acceptance.content')}
            </p>
          </div>

          {/* Section 2: Definitions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">2.</span> {t('publicPages.legal.terms.sections.definitions.title')}
            </h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong className="text-gray-900 dark:text-white">{t('publicPages.legal.terms.sections.definitions.items.tburnChain.term')}</strong> {t('publicPages.legal.terms.sections.definitions.items.tburnChain.desc')}</li>
              <li><strong className="text-gray-900 dark:text-white">{t('publicPages.legal.terms.sections.definitions.items.services.term')}</strong> {t('publicPages.legal.terms.sections.definitions.items.services.desc')}</li>
              <li><strong className="text-gray-900 dark:text-white">{t('publicPages.legal.terms.sections.definitions.items.user.term')}</strong> {t('publicPages.legal.terms.sections.definitions.items.user.desc')}</li>
              <li><strong className="text-gray-900 dark:text-white">{t('publicPages.legal.terms.sections.definitions.items.project.term')}</strong> {t('publicPages.legal.terms.sections.definitions.items.project.desc')}</li>
              <li><strong className="text-gray-900 dark:text-white">{t('publicPages.legal.terms.sections.definitions.items.trustScore.term')}</strong> {t('publicPages.legal.terms.sections.definitions.items.trustScore.desc')}</li>
            </ul>
          </div>

          {/* Section 3: Eligibility */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">3.</span> {t('publicPages.legal.terms.sections.eligibility.title')}
            </h2>
            <p className="mb-4">{t('publicPages.legal.terms.sections.eligibility.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('publicPages.legal.terms.sections.eligibility.items.age')}</li>
              <li>{t('publicPages.legal.terms.sections.eligibility.items.capacity')}</li>
              <li>{t('publicPages.legal.terms.sections.eligibility.items.prohibited')}</li>
              <li>{t('publicPages.legal.terms.sections.eligibility.items.comply')}</li>
            </ul>
          </div>

          {/* Section 4: Account Registration & Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">4.</span> {t('publicPages.legal.terms.sections.account.title')}
            </h2>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{t('publicPages.legal.terms.sections.account.creation.title')}</h3>
            <p className="mb-6">{t('publicPages.legal.terms.sections.account.creation.content')}</p>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{t('publicPages.legal.terms.sections.account.wallet.title')}</h3>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-200 text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>{t('publicPages.legal.terms.sections.account.wallet.important')}</strong> {t('publicPages.legal.terms.sections.account.wallet.content')}
                </span>
              </p>
            </div>
          </div>

          {/* Section 5: Trust Verification System */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">5.</span> {t('publicPages.legal.terms.sections.trustVerification.title')}
            </h2>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{t('publicPages.legal.terms.sections.trustVerification.process.title')}</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong className="text-gray-900 dark:text-white">{t('publicPages.legal.terms.sections.trustVerification.process.stage1.label')}</strong> {t('publicPages.legal.terms.sections.trustVerification.process.stage1.value')}</li>
              <li><strong className="text-gray-900 dark:text-white">{t('publicPages.legal.terms.sections.trustVerification.process.stage2.label')}</strong> {t('publicPages.legal.terms.sections.trustVerification.process.stage2.value')}</li>
              <li><strong className="text-gray-900 dark:text-white">{t('publicPages.legal.terms.sections.trustVerification.process.stage3.label')}</strong> {t('publicPages.legal.terms.sections.trustVerification.process.stage3.value')}</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{t('publicPages.legal.terms.sections.trustVerification.implications.title')}</h3>
            <p>{t('publicPages.legal.terms.sections.trustVerification.implications.content')}</p>
          </div>

          {/* Section 6: Burn Mechanism */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">6.</span> {t('publicPages.legal.terms.sections.burn.title')}
            </h2>
            <p>
              {t('publicPages.legal.terms.sections.burn.content')}
            </p>
          </div>

          {/* Section 7: Prohibited Activities */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">7.</span> {t('publicPages.legal.terms.sections.prohibited.title')}
            </h2>
            <p className="mb-4">{t('publicPages.legal.terms.sections.prohibited.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('publicPages.legal.terms.sections.prohibited.items.laundering')}</li>
              <li>{t('publicPages.legal.terms.sections.prohibited.items.falseInfo')}</li>
              <li>{t('publicPages.legal.terms.sections.prohibited.items.manipulate')}</li>
              <li>{t('publicPages.legal.terms.sections.prohibited.items.exploit')}</li>
              <li>{t('publicPages.legal.terms.sections.prohibited.items.washTrading')}</li>
            </ul>
          </div>

          {/* Section 8: Intellectual Property */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">8.</span> {t('publicPages.legal.terms.sections.ip.title')}
            </h2>
            <p>
              {t('publicPages.legal.terms.sections.ip.content')}
            </p>
          </div>

          {/* Section 9: Disclaimers & Limitations */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">9.</span> {t('publicPages.legal.terms.sections.disclaimers.title')}
            </h2>
            <div className="p-6 border border-gray-300 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/20 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.legal.terms.sections.disclaimers.asIs.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('publicPages.legal.terms.sections.disclaimers.asIs.content')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.legal.terms.sections.disclaimers.noAdvice.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('publicPages.legal.terms.sections.disclaimers.noAdvice.content')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.legal.terms.sections.disclaimers.limitation.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase">
                  {t('publicPages.legal.terms.sections.disclaimers.limitation.content')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 10: Governing Law */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">10.</span> {t('publicPages.legal.terms.sections.governing.title')}
            </h2>
            <p>
              {t('publicPages.legal.terms.sections.governing.content')}
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-gray-300 dark:border-white/10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.legal.terms.contact.title')}</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-[#00f0ff]" />
                  <strong className="text-[#00f0ff]">{t('publicPages.legal.terms.contact.legal.label')}</strong>
                </div>
                <p className="text-gray-300">legal@tburn.io</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-[#00f0ff]" />
                  <strong className="text-[#00f0ff]">{t('publicPages.legal.terms.contact.support.label')}</strong>
                </div>
                <p className="text-gray-300">support@tburn.io</p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/10 text-xs text-gray-600 dark:text-gray-400">
              {t('publicPages.legal.terms.contact.note')}
            </div>
          </div>

          {/* Related Legal Pages */}
          <div className="mt-8 pt-8 border-t border-gray-300 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.legal.common.relatedDocs')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/legal/privacy-policy"
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-white/10 transition group"
                data-testid="link-privacy-policy"
              >
                <Shield className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#7000ff] transition">{t('publicPages.legal.common.links.privacy.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.links.privacy.subtitle')}</p>
                </div>
              </Link>
              <Link 
                href="/legal/disclaimer"
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-white/10 transition group"
                data-testid="link-disclaimer"
              >
                <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#f59e0b] transition">{t('publicPages.legal.common.links.disclaimer.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.links.disclaimer.subtitleRisk')}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Related Learn Pages */}
          <div className="mt-8 pt-8 border-t border-gray-300 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.legal.common.learnMore')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/learn/trust-score-system"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                data-testid="link-trust-score"
              >
                <CheckCircle className="w-5 h-5 text-[#00f0ff]" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#00f0ff] transition">{t('publicPages.legal.common.learn.trustScore.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.learn.trustScore.subtitleVerification')}</p>
                </div>
              </Link>
              <Link 
                href="/learn/what-is-wallet"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                data-testid="link-wallets"
              >
                <Key className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#7000ff] transition">{t('publicPages.legal.common.learn.wallet.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.learn.wallet.subtitleSecurity')}</p>
                </div>
              </Link>
              <Link 
                href="/learn/what-is-burn-chain"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition group"
                data-testid="link-burn-chain"
              >
                <Users className="w-5 h-5 text-[#10b981]" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#10b981] transition">{t('publicPages.legal.common.learn.burnChain.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.learn.burnChain.subtitle')}</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
