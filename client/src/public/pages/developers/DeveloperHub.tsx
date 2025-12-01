import { Link } from "wouter";
import { FileText, Code, Rocket, Download, ArrowRight } from "lucide-react";

const developerResources = [
  { title: "Documentation", description: "Comprehensive guides and references", href: "/developers/docs", icon: FileText },
  { title: "API Documentation", description: "RESTful and WebSocket API reference", href: "/developers/api", icon: Code },
  { title: "Code Examples", description: "Sample code and implementation guides", href: "/developers/examples", icon: Code },
  { title: "Quick Start", description: "Get up and running in minutes", href: "/developers/quickstart", icon: Rocket },
  { title: "Installation Guide", description: "Step-by-step setup instructions", href: "/developers/installation", icon: Download },
  { title: "EVM Migration", description: "Migrate from Ethereum ecosystem", href: "/developers/evm-migration", icon: ArrowRight },
];

export default function DeveloperHub() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Developer Hub
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Build on Burn Chain. Everything you need to develop, deploy, and scale your applications.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developerResources.map((resource, index) => (
          <Link key={resource.href} href={resource.href}>
            <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer h-full" data-testid={`dev-resource-${index}`}>
              <resource.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <p className="text-muted-foreground">
                {resource.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
