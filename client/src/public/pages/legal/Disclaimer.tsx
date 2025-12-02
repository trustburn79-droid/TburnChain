import { Link } from "wouter";
import { 
  AlertTriangle, ArrowLeft, FileText, Shield, TrendingDown, 
  Scale, Zap, Globe, AlertCircle, Mail
} from "lucide-react";

export default function Disclaimer() {
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
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white" data-testid="text-page-title">Disclaimer</h1>
          </div>
          <p className="text-gray-400 ml-16">Last Updated: October 6, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-8 md:p-12 text-gray-300">
          
          {/* Important Notice */}
          <div className="mb-12 p-6 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl">
            <h2 className="text-xl font-bold text-[#f59e0b] flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" /> Important Notice
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Please read this disclaimer carefully before using TBurn Chain services. By accessing or using our platform, you acknowledge that you have read, understood, and agree to the following disclaimers.
            </p>
          </div>

          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">1.</span> No Investment Advice
            </h2>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <p className="text-red-200 leading-relaxed">
                <strong>TBurn Chain does not provide investment, financial, tax, or legal advice.</strong> All information provided on our platform, including Trust Scores, is for informational purposes only and should not be construed as advice of any kind.
              </p>
            </div>
            <p>
              You should consult with qualified professionals before making any investment decisions. Past performance is not indicative of future results.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">2.</span> Risk Disclosure
            </h2>
            <p className="mb-4">Cryptocurrency and blockchain investments carry significant risks, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Market Volatility:</strong> Prices can fluctuate dramatically in short periods</li>
              <li><strong className="text-white">Regulatory Risk:</strong> Laws and regulations may change unexpectedly</li>
              <li><strong className="text-white">Technical Risk:</strong> Smart contracts may contain bugs or vulnerabilities</li>
              <li><strong className="text-white">Liquidity Risk:</strong> You may not be able to sell assets when desired</li>
              <li><strong className="text-white">Loss of Funds:</strong> You may lose all or part of your investment</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">3.</span> Trust Score Limitations
            </h2>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="mb-4">Trust Scores are calculated based on available data and our verification process, but:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>They do not guarantee the safety or legitimacy of any project</li>
                <li>They may not reflect all relevant factors</li>
                <li>Historical scores may not predict future performance</li>
                <li>They should be one of many factors in your due diligence</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">4.</span> Third-Party Content
            </h2>
            <p>
              Our platform may contain links to third-party websites, projects, or content. We do not endorse, control, or take responsibility for any third-party content. Access to third-party resources is at your own risk.
            </p>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">5.</span> Service Availability
            </h2>
            <p>
              We strive to maintain continuous service availability, but we do not guarantee uninterrupted access. Services may be temporarily unavailable due to maintenance, upgrades, or unforeseen circumstances.
            </p>
          </div>

          {/* Section 6 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">6.</span> Limitation of Liability
            </h2>
            <div className="p-6 border border-white/10 rounded-xl bg-black/20">
              <p className="text-sm text-gray-400 uppercase leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TBURN CHAIN FOUNDATION AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE OUR SERVICES.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">7.</span> Geographic Restrictions
            </h2>
            <p>
              Our services may not be available in all jurisdictions. It is your responsibility to ensure that your use of TBurn Chain complies with the laws of your jurisdiction. We reserve the right to restrict access to our services from certain geographic locations.
            </p>
          </div>

          {/* Section 8 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#f59e0b]">8.</span> Forward-Looking Statements
            </h2>
            <p>
              Any statements regarding future events, plans, or developments are forward-looking statements subject to risks and uncertainties. Actual results may differ materially from those expressed or implied in such statements.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Questions?</h2>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-[#f59e0b]" />
                <strong className="text-[#f59e0b]">Legal Inquiries</strong>
              </div>
              <p className="text-gray-300">legal@tburn.io</p>
            </div>
          </div>

          {/* Related Legal Pages */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Related Legal Documents</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/legal/terms-of-service"
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                data-testid="link-terms"
              >
                <FileText className="w-5 h-5 text-[#00f0ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#00f0ff] transition">Terms of Service</p>
                  <p className="text-xs text-gray-500">User agreement</p>
                </div>
              </Link>
              <Link 
                href="/legal/privacy-policy"
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                data-testid="link-privacy"
              >
                <Shield className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#7000ff] transition">Privacy Policy</p>
                  <p className="text-xs text-gray-500">Data handling</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Related Learn Pages */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Learn More</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/learn/trust-score-system"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                data-testid="link-trust-score"
              >
                <Scale className="w-5 h-5 text-[#00f0ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#00f0ff] transition">Trust Score System</p>
                  <p className="text-xs text-gray-500">How scores work</p>
                </div>
              </Link>
              <Link 
                href="/learn/intro-to-defi"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition group"
                data-testid="link-defi"
              >
                <TrendingDown className="w-5 h-5 text-[#10b981]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#10b981] transition">Intro to DeFi</p>
                  <p className="text-xs text-gray-500">Understanding risks</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
