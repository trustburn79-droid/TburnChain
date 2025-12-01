import { Link } from "wouter";
import { Book, Shield, Wallet, GraduationCap, FileText, Coins, Map } from "lucide-react";

const learnTopics = [
  { title: "What is Burn Chain?", description: "Understand the fundamentals of Burn Chain technology", href: "/learn/what-is-burn-chain", icon: Book },
  { title: "Trust Score System", description: "Learn how our trust verification system works", href: "/learn/trust-score", icon: Shield },
  { title: "What is a Wallet?", description: "Get started with blockchain wallets", href: "/learn/wallet", icon: Wallet },
  { title: "Education Programs", description: "Structured learning paths for all levels", href: "/learn/education", icon: GraduationCap },
  { title: "Technical Whitepaper", description: "Deep dive into our technical architecture", href: "/learn/whitepaper", icon: FileText },
  { title: "Tokenomics", description: "Understand TBURN token economics", href: "/learn/tokenomics", icon: Coins },
  { title: "Roadmap", description: "See our development timeline and goals", href: "/learn/roadmap", icon: Map },
];

export default function LearnHub() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Learn Hub
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get started with Burn Chain. Explore our comprehensive guides, tutorials, and documentation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learnTopics.map((topic, index) => (
          <Link key={topic.href} href={topic.href}>
            <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer h-full" data-testid={`learn-topic-${index}`}>
              <topic.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {topic.title}
              </h3>
              <p className="text-muted-foreground">
                {topic.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
