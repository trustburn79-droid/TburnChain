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
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
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
              <span className="text-[#7000ff]">1.</span> Introduction
            </h2>
            <p className="leading-relaxed">
              Welcome to TBurn Chain ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our blockchain services.
            </p>
          </div>

          {/* Section 2: Information We Collect */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">2.</span> Information We Collect
            </h2>
            
            <h3 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#7000ff]" /> 2.1 Information You Provide
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong className="text-white">Account Information:</strong> Email address, username, wallet addresses.</li>
              <li><strong className="text-white">Project Verification:</strong> Business registration documents, KYC information, financial statements.</li>
              <li><strong className="text-white">Communication Data:</strong> Messages, support tickets, feedback.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#7000ff]" /> 2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Blockchain Data:</strong> Public wallet addresses, transaction hashes, smart contract interactions.</li>
              <li><strong className="text-white">Device Information:</strong> IP address, browser type, operating system.</li>
              <li><strong className="text-white">Usage Data:</strong> Pages viewed, navigation patterns, session duration.</li>
            </ul>
          </div>

          {/* Section 3: How We Use Your Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">3.</span> How We Use Your Information
            </h2>
            <p className="mb-4">We use collected information for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Operating and maintaining the TBurn Chain platform.</li>
              <li>Conducting our 3-stage verification process (AI filtering, expert review, voting).</li>
              <li>Detecting fraud, abuse, and security threats.</li>
              <li>Improving our services through analytics.</li>
              <li>Meeting legal compliance obligations.</li>
            </ul>
          </div>

          {/* Section 4: Information Sharing */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">4.</span> Information Sharing
            </h2>
            <p className="mb-4">We share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Validators:</strong> For decentralized verification processes.</li>
              <li><strong className="text-white">Service Providers:</strong> Infrastructure and support partners.</li>
              <li><strong className="text-white">Legal Authorities:</strong> When required by law.</li>
            </ul>
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-200 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span><strong>We do NOT sell your personal data</strong> to third parties for marketing purposes.</span>
              </p>
            </div>
          </div>

          {/* Section 5: Blockchain-Specific Privacy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">5.</span> Blockchain-Specific Privacy
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#7000ff]" /> Public Data
                </h4>
                <p className="text-sm text-gray-400">
                  Transactions and smart contract interactions on TBurn Chain are publicly visible and immutable. This data cannot be deleted or modified.
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#7000ff]" /> Pseudonymity
                </h4>
                <p className="text-sm text-gray-400">
                  Wallet addresses are pseudonymous. However, if you link your real-world identity to a wallet address, that connection may become public.
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Security & Rights */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#7000ff]">6.</span> Security & Rights
            </h2>
            <p className="mb-4">We implement appropriate security measures including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Encrypted storage for sensitive data</li>
              <li>Multi-factor authentication</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
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
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
            <p className="mb-4 text-gray-400">If you have questions about this Privacy Policy, contact our Privacy Office:</p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#7000ff]" />
                  <strong className="text-[#7000ff]">Email</strong>
                </div>
                <p className="text-gray-300">privacy@tburn.io</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-[#7000ff]" />
                  <strong className="text-[#7000ff]">Response Time</strong>
                </div>
                <p className="text-gray-300">Within 30 days</p>
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

          {/* Related Learn Pages */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Learn More</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/learn/what-is-wallet"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                data-testid="link-wallets"
              >
                <Wallet className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#7000ff] transition">What is a Wallet?</p>
                  <p className="text-xs text-gray-500">Secure your keys</p>
                </div>
              </Link>
              <Link 
                href="/learn/trust-score-system"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                data-testid="link-trust-score"
              >
                <Scale className="w-5 h-5 text-[#00f0ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#00f0ff] transition">Trust Score System</p>
                  <p className="text-xs text-gray-500">Verification process</p>
                </div>
              </Link>
              <Link 
                href="/learn/blockchain-basics"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition group"
                data-testid="link-blockchain"
              >
                <BookOpen className="w-5 h-5 text-[#10b981]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#10b981] transition">Blockchain Basics</p>
                  <p className="text-xs text-gray-500">Data on-chain</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Related Solutions */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Security Solutions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/solutions/wallets"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                data-testid="link-solution-wallets"
              >
                <Wallet className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#7000ff] transition">Wallets</p>
                  <p className="text-xs text-gray-500">Secure wallet solutions</p>
                </div>
              </Link>
              <Link 
                href="/solutions/permissioned"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
                data-testid="link-solution-permissioned"
              >
                <Lock className="w-5 h-5 text-[#ffd700]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#ffd700] transition">Permissioned Environments</p>
                  <p className="text-xs text-gray-500">Enterprise privacy</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
