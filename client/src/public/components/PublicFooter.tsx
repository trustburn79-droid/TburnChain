import { Link } from "wouter";
import { SiX, SiGithub, SiDiscord } from "react-icons/si";
import "../styles/public.css";

const footerLinks = {
  ecosystem: [
    { title: "Validators", href: "/network/validators" },
    { title: "Bridge", href: "/solutions/token-extensions" },
    { title: "Explorer", href: "/app" },
  ],
  resources: [
    { title: "Whitepaper", href: "/learn/whitepaper" },
    { title: "Docs", href: "/developers/docs" },
    { title: "API Status", href: "/network/status" },
  ],
};

const socialLinks = [
  { icon: SiX, href: "https://twitter.com/burnchain", label: "Twitter" },
  { icon: SiGithub, href: "https://github.com/burnchain", label: "GitHub" },
  { icon: SiDiscord, href: "https://discord.gg/burnchain", label: "Discord" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-white">TBurn Chain</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              The world's first trust network that verifies project reliability and ensures transparency through AI analysis.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                  aria-label={social.label}
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Ecosystem</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {footerLinks.ecosystem.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-cyan-400 transition"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-cyan-400 transition"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-12 pt-8 text-center text-sm text-gray-600">
          &copy; 2025 TBurn Chain Foundation. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
