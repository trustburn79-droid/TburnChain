import { Link } from "wouter";
import { 
  FileText, ArrowLeft, Shield, AlertTriangle, Scale, 
  Users, Key, CheckCircle, Mail, HelpCircle
} from "lucide-react";

const sections = [
  {
    number: "1",
    title: "Acceptance of Terms",
    content: `By accessing or using TBurn Chain services, you agree to be bound by these Terms of Service ('Terms'). 
    If you do not agree to these Terms, do not use our services. These Terms constitute a legally binding agreement between you and TBurn Chain Foundation.`
  },
  {
    number: "2",
    title: "Definitions",
    items: [
      { term: "'TBurn Chain'", desc: "refers to the Layer 1 blockchain network and associated services." },
      { term: "'Services'", desc: "includes the blockchain network, trust verification system, APIs, and platform features." },
      { term: "'User' or 'you'", desc: "refers to any individual or entity using TBurn Chain." },
      { term: "'Project'", desc: "refers to blockchain projects seeking verification on TBurn Chain." },
      { term: "'Trust Score'", desc: "refers to the reliability rating assigned through our 3-stage verification system." }
    ]
  },
  {
    number: "3",
    title: "Eligibility",
    intro: "To use TBurn Chain, you must:",
    items: [
      "Be at least 18 years old (or legal age in your jurisdiction).",
      "Have the legal capacity to enter into binding contracts.",
      "Not be prohibited from using our services under applicable laws.",
      "Comply with all local laws regarding online conduct and blockchain technology."
    ]
  }
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 mb-8 border-b border-white/10 bg-gradient-to-b from-[#00f0ff]/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00f0ff] mb-6 transition-colors group"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white" data-testid="text-page-title">Terms of Service</h1>
          </div>
          <p className="text-gray-400 ml-16">Last Updated: October 6, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-8 md:p-12 text-gray-300">
          
          {/* Section 1: Acceptance of Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">1.</span> Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing or using TBurn Chain services, you agree to be bound by these Terms of Service ('Terms'). 
              If you do not agree to these Terms, do not use our services. These Terms constitute a legally binding agreement between you and TBurn Chain Foundation.
            </p>
          </div>

          {/* Section 2: Definitions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">2.</span> Definitions
            </h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong className="text-white">'TBurn Chain'</strong> refers to the Layer 1 blockchain network and associated services.</li>
              <li><strong className="text-white">'Services'</strong> includes the blockchain network, trust verification system, APIs, and platform features.</li>
              <li><strong className="text-white">'User'</strong> or <strong className="text-white">'you'</strong> refers to any individual or entity using TBurn Chain.</li>
              <li><strong className="text-white">'Project'</strong> refers to blockchain projects seeking verification on TBurn Chain.</li>
              <li><strong className="text-white">'Trust Score'</strong> refers to the reliability rating assigned through our 3-stage verification system.</li>
            </ul>
          </div>

          {/* Section 3: Eligibility */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">3.</span> Eligibility
            </h2>
            <p className="mb-4">To use TBurn Chain, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years old (or legal age in your jurisdiction).</li>
              <li>Have the legal capacity to enter into binding contracts.</li>
              <li>Not be prohibited from using our services under applicable laws.</li>
              <li>Comply with all local laws regarding online conduct and blockchain technology.</li>
            </ul>
          </div>

          {/* Section 4: Account Registration & Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">4.</span> Account Registration & Security
            </h2>
            
            <h3 className="text-xl font-bold text-white mt-6 mb-3">4.1 Account Creation</h3>
            <p className="mb-6">You agree to provide accurate information, maintain its confidentiality, and notify us immediately of any unauthorized access.</p>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">4.2 Wallet Security</h3>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-200 text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> You are solely responsible for securing your private keys. Lost private keys cannot be recovered. We do not have access to your private keys and cannot help recover lost funds.
                </span>
              </p>
            </div>
          </div>

          {/* Section 5: Trust Verification System */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">5.</span> Trust Verification System
            </h2>
            
            <h3 className="text-xl font-bold text-white mt-6 mb-3">5.1 3-Stage Process</h3>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong className="text-white">Stage 1:</strong> AI-powered automatic filtering (24 hours)</li>
              <li><strong className="text-white">Stage 2:</strong> Expert validation by blockchain developers and auditors (7-14 days)</li>
              <li><strong className="text-white">Stage 3:</strong> Community voting by TBURN token holders (3-5 days)</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">5.2 Trust Score Implications</h3>
            <p>Trust scores range from 0-100. Scores below 40 result in automatic token trading suspension. Scores are updated in real-time on-chain.</p>
          </div>

          {/* Section 6: Burn Mechanism */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">6.</span> Burn Mechanism
            </h2>
            <p>
              Projects must deposit collateral equal to their burn commitment. Failure to execute scheduled burns triggers automatic penalties and collateral burns through smart contracts.
            </p>
          </div>

          {/* Section 7: Prohibited Activities */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">7.</span> Prohibited Activities
            </h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the platform for money laundering or terrorist financing</li>
              <li>Submit false or misleading project information</li>
              <li>Manipulate Trust Scores through coordinated voting</li>
              <li>Attempt to exploit smart contract vulnerabilities</li>
              <li>Engage in market manipulation or wash trading</li>
            </ul>
          </div>

          {/* Section 8: Intellectual Property */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">8.</span> Intellectual Property
            </h2>
            <p>
              All intellectual property rights in TBurn Chain, including the platform, protocols, and branding, are owned by TBurn Chain Foundation. You are granted a limited, non-exclusive license to use our services.
            </p>
          </div>

          {/* Section 9: Disclaimers & Limitations */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">9.</span> Disclaimers & Limitations
            </h2>
            <div className="p-6 border border-white/10 rounded-xl bg-black/20 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">'As-Is' Basis</h3>
                <p className="text-sm text-gray-400">
                  Services are provided 'AS IS' and 'AS AVAILABLE' without warranties of any kind, either express or implied.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-2">No Investment Advice</h3>
                <p className="text-sm text-gray-400">
                  TBurn Chain does not provide investment, financial, or legal advice. Trust scores are informational only.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Limitation of Liability</h3>
                <p className="text-sm text-gray-400 uppercase">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, TBURN CHAIN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                </p>
              </div>
            </div>
          </div>

          {/* Section 10: Governing Law */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="text-[#00f0ff]">10.</span> Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where TBurn Chain Foundation is incorporated, without regard to conflict of law principles.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-[#00f0ff]" />
                  <strong className="text-[#00f0ff]">Legal Inquiries</strong>
                </div>
                <p className="text-gray-300">legal@tburn.io</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-[#00f0ff]" />
                  <strong className="text-[#00f0ff]">General Support</strong>
                </div>
                <p className="text-gray-300">support@tburn.io</p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/10 text-xs text-gray-400">
              Note: These Terms of Service are provided in English. Translations may be available for convenience, but the English version governs in case of conflicts.
            </div>
          </div>

          {/* Related Legal Pages */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Related Legal Documents</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/legal/privacy-policy"
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                data-testid="link-privacy-policy"
              >
                <Shield className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#7000ff] transition">Privacy Policy</p>
                  <p className="text-xs text-gray-500">How we handle your data</p>
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
                  <p className="text-xs text-gray-500">Risk disclosures & notices</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Related Learn Pages */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Learn More</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/learn/trust-score-system"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                data-testid="link-trust-score"
              >
                <CheckCircle className="w-5 h-5 text-[#00f0ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#00f0ff] transition">Trust Score System</p>
                  <p className="text-xs text-gray-500">3-stage verification</p>
                </div>
              </Link>
              <Link 
                href="/learn/what-is-wallet"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                data-testid="link-wallets"
              >
                <Key className="w-5 h-5 text-[#7000ff]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#7000ff] transition">What is a Wallet?</p>
                  <p className="text-xs text-gray-500">Wallet security basics</p>
                </div>
              </Link>
              <Link 
                href="/learn/what-is-burn-chain"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition group"
                data-testid="link-burn-chain"
              >
                <Users className="w-5 h-5 text-[#10b981]" />
                <div>
                  <p className="font-medium text-white group-hover:text-[#10b981] transition">What is TBurn Chain?</p>
                  <p className="text-xs text-gray-500">Platform overview</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
