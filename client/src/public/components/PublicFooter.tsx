import { Link } from "wouter";
import { Github, Twitter, MessageCircle } from "lucide-react";
import { SiDiscord, SiTelegram } from "react-icons/si";

const footerLinks = {
  learn: [
    { title: "Learn Hub", href: "/learn" },
    { title: "What is Burn Chain?", href: "/learn/what-is-burn-chain" },
    { title: "Trust Score System", href: "/learn/trust-score" },
    { title: "Tokenomics", href: "/learn/tokenomics" },
    { title: "Roadmap", href: "/learn/roadmap" },
  ],
  developers: [
    { title: "Developer Hub", href: "/developers" },
    { title: "Documentation", href: "/developers/docs" },
    { title: "API Documentation", href: "/developers/api" },
    { title: "Quick Start", href: "/developers/quickstart" },
  ],
  network: [
    { title: "Validators", href: "/network/validators" },
    { title: "Network Status", href: "/network/status" },
    { title: "RPC Providers", href: "/network/rpc" },
  ],
  community: [
    { title: "News & Blog", href: "/community/news" },
    { title: "Events", href: "/community/events" },
    { title: "Community Hub", href: "/community/hub" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/burnchain", label: "Twitter" },
  { icon: SiDiscord, href: "https://discord.gg/burnchain", label: "Discord" },
  { icon: SiTelegram, href: "https://t.me/burnchain", label: "Telegram" },
  { icon: Github, href: "https://github.com/burnchain", label: "GitHub" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500">
                <span className="text-lg font-bold text-white">B</span>
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Burn Chain
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The world's first trust network that verifies project reliability and ensures transparency.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  aria-label={social.label}
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="h-5 w-5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Learn</h4>
            <ul className="space-y-2">
              {footerLinks.learn.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Developers</h4>
            <ul className="space-y-2">
              {footerLinks.developers.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Network</h4>
            <ul className="space-y-2">
              {footerLinks.network.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Community</h4>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Burn Chain. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
