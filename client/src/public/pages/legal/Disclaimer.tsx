import { Link } from "wouter";
import { 
  AlertTriangle, ArrowLeft, FileText, Shield, TrendingDown, 
  Scale, Zap, Globe, AlertCircle, Mail
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Disclaimer() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 mb-8 border-b border-white/10 bg-gradient-to-b from-[#f59e0b]/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#f59e0b] mb-6 transition-colors group"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.legal.common.backToHome')}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white" data-testid="text-page-title">{t('publicPages.legal.disclaimer.title')}</h1>
          </div>
          <p className="text-gray-400 ml-16">{t('publicPages.legal.disclaimer.subtitle')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-8 md:p-12 text-gray-300">
          
          {/* Important Notice */}
          <div className="mb-12 p-6 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl">
            <h2 className="text-xl font-bold text-[#f59e0b] flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" /> {t('publicPages.legal.disclaimer.importantNotice.title')}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {t('publicPages.legal.disclaimer.importantNotice.content')}
            </p>
          </div>

          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">1.</span> {t('publicPages.legal.disclaimer.sections.noAdvice.title')}
            </h2>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <p className="text-red-200 leading-relaxed">
                <strong>{t('publicPages.legal.disclaimer.sections.noAdvice.warning')}</strong>
              </p>
            </div>
            <p>
              {t('publicPages.legal.disclaimer.sections.noAdvice.content')}
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">2.</span> {t('publicPages.legal.disclaimer.sections.riskDisclosure.title')}
            </h2>
            <p className="mb-4">{t('publicPages.legal.disclaimer.sections.riskDisclosure.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">{t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.volatility.label')}</strong> {t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.volatility.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.regulatory.label')}</strong> {t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.regulatory.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.technical.label')}</strong> {t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.technical.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.liquidity.label')}</strong> {t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.liquidity.value')}</li>
              <li><strong className="text-white">{t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.loss.label')}</strong> {t('publicPages.legal.disclaimer.sections.riskDisclosure.risks.loss.value')}</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">3.</span> {t('publicPages.legal.disclaimer.sections.trustScore.title')}
            </h2>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="mb-4">{t('publicPages.legal.disclaimer.sections.trustScore.intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>{t('publicPages.legal.disclaimer.sections.trustScore.items.noGuarantee')}</li>
                <li>{t('publicPages.legal.disclaimer.sections.trustScore.items.notAllFactors')}</li>
                <li>{t('publicPages.legal.disclaimer.sections.trustScore.items.historical')}</li>
                <li>{t('publicPages.legal.disclaimer.sections.trustScore.items.dueDiligence')}</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">4.</span> {t('publicPages.legal.disclaimer.sections.thirdParty.title')}
            </h2>
            <p>
              {t('publicPages.legal.disclaimer.sections.thirdParty.content')}
            </p>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">5.</span> {t('publicPages.legal.disclaimer.sections.availability.title')}
            </h2>
            <p>
              {t('publicPages.legal.disclaimer.sections.availability.content')}
            </p>
          </div>

          {/* Section 6 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">6.</span> {t('publicPages.legal.disclaimer.sections.limitation.title')}
            </h2>
            <div className="p-6 border border-white/10 rounded-xl bg-black/20">
              <p className="text-sm text-gray-400 uppercase leading-relaxed">
                {t('publicPages.legal.disclaimer.sections.limitation.content')}
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">7.</span> {t('publicPages.legal.disclaimer.sections.geographic.title')}
            </h2>
            <p>
              {t('publicPages.legal.disclaimer.sections.geographic.content')}
            </p>
          </div>

          {/* Section 8 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">8.</span> {t('publicPages.legal.disclaimer.sections.forwardLooking.title')}
            </h2>
            <p>
              {t('publicPages.legal.disclaimer.sections.forwardLooking.content')}
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">{t('publicPages.legal.disclaimer.contact.title')}</h2>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-[#f59e0b]" />
                <strong className="text-[#f59e0b]">{t('publicPages.legal.disclaimer.contact.label')}</strong>
              </div>
              <p className="text-gray-300">legal@tburn.io</p>
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
                href="/legal/privacy-policy"
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                data-testid="link-privacy"
              >
                <Shield className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.legal.common.links.privacy.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.links.privacy.subtitleData')}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Related Learn Pages */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.legal.common.learnMore')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/learn/trust-score-system"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                data-testid="link-trust-score"
              >
                <Scale className="w-5 h-5 text-[#00f0ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.legal.common.learn.trustScore.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.learn.trustScore.subtitleHow')}</p>
                </div>
              </Link>
              <Link 
                href="/learn/intro-to-defi"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition group"
                data-testid="link-defi"
              >
                <TrendingDown className="w-5 h-5 text-[#10b981]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#10b981] transition">{t('publicPages.legal.common.learn.defi.title')}</p>
                  <p className="text-xs text-gray-500">{t('publicPages.legal.common.learn.defi.subtitle')}</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
