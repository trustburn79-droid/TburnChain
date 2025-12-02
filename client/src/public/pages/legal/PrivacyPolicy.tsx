import { Link } from "wouter";
import { 
  Shield, ArrowLeft, FileText, AlertTriangle, Database, 
  Lock, Eye, Globe, Users, Cookie, Mail, HelpCircle
} from "lucide-react";

export default function PrivacyPolicy() {
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
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[#7000ff]/10 text-[#7000ff] border border-[#7000ff]/20">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white" data-testid="text-page-title">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 ml-16">Last Updated: October 6, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-8 md:p-12 text-gray-300">
          
          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">1.</span> Introduction
            </h2>
            <p className="leading-relaxed">
              TBurn Chain Foundation ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use TBurn Chain services.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">2.</span> Information We Collect
            </h2>
            
            <h3 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#7000ff]" /> 2.1 On-Chain Data
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Wallet addresses and transaction history</li>
              <li>Smart contract interactions</li>
              <li>Trust scores and verification status</li>
              <li>Voting records for governance</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#7000ff]" /> 2.2 Off-Chain Data
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email addresses (optional registration)</li>
              <li>IP addresses and device information</li>
              <li>Usage analytics and preferences</li>
              <li>Support communications</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">3.</span> How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and verify identity</li>
              <li>Send administrative communications</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
              <li>Conduct research and analytics</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">4.</span> Data Sharing
            </h2>
            <p className="mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Service Providers:</strong> Third parties who assist in operating our platform</li>
              <li><strong className="text-white">Legal Authorities:</strong> When required by law or to protect rights</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with mergers or acquisitions</li>
            </ul>
            <div className="mt-4 p-4 bg-[#7000ff]/10 border border-[#7000ff]/20 rounded-lg">
              <p className="text-sm text-gray-300">
                <Lock className="w-4 h-4 inline mr-2" />
                <strong>Note:</strong> On-chain data is publicly visible by nature. We cannot control access to blockchain data.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">5.</span> Data Security
            </h2>
            <p className="mb-4">We implement appropriate security measures including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication</li>
              <li>Incident response procedures</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">6.</span> Your Rights
            </h2>
            <p className="mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your off-chain data</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
            </ul>
          </div>

          {/* Section 7: Cookies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">7.</span> Cookies & Tracking
            </h2>
            <p className="mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Remember your preferences</li>
              <li>Analyze site usage</li>
              <li>Improve user experience</li>
            </ul>
            <p className="mt-4 text-sm text-gray-400">
              You can manage cookie preferences through your browser settings.
            </p>
          </div>

          {/* Section 8: International Transfers */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">8.</span> International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#7000ff]" />
                  <strong className="text-[#7000ff]">Privacy Inquiries</strong>
                </div>
                <p className="text-gray-300">privacy@tburn.io</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#7000ff]" />
                  <strong className="text-[#7000ff]">Data Protection Officer</strong>
                </div>
                <p className="text-gray-300">dpo@tburn.io</p>
              </div>
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
                href="/legal/disclaimer"
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                data-testid="link-disclaimer"
              >
                <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#f59e0b] transition">Disclaimer</p>
                  <p className="text-xs text-gray-500">Risk disclosures</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
