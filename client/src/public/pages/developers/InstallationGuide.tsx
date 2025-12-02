import { useState, useRef, useEffect } from "react";
import { 
  Download, 
  Cpu, 
  Star,
  Terminal,
  Copy,
  ChevronDown,
  Info,
  Monitor
} from "lucide-react";
import { SiDocker, SiLinux } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type OsTab = "linux" | "docker" | "windows" | "source";

const systemRequirements = {
  minimum: {
    title: "Minimum",
    subtitle: "For Testnet & Light Nodes",
    specs: [
      { label: "CPU", value: "4 Cores" },
      { label: "RAM", value: "16 GB" },
      { label: "Storage", value: "500 GB SSD" },
      { label: "Network", value: "100 Mbps" }
    ],
    highlighted: false,
    color: "#00f0ff"
  },
  recommended: {
    title: "Recommended",
    subtitle: "For Mainnet Validators",
    specs: [
      { label: "CPU", value: "16 Cores" },
      { label: "RAM", value: "64 GB" },
      { label: "Storage", value: "2 TB NVMe" },
      { label: "Network", value: "1 Gbps" }
    ],
    highlighted: true,
    color: "#7000ff"
  },
  ports: {
    title: "Network Ports",
    subtitle: "Firewall Configuration",
    specs: [
      { label: "P2P (TCP/UDP)", value: "30303" },
      { label: "RPC (TCP)", value: "8545" },
      { label: "WS (TCP)", value: "8546" },
      { label: "Metrics", value: "6060" }
    ],
    highlighted: false,
    color: "#00ff9d"
  }
};

const linuxSteps = [
  {
    title: "Download Binary",
    commands: [
      "curl -L https://github.com/burnchain/core/releases/download/v4.0.0/tburn-linux-amd64.tar.gz -o tburn.tar.gz",
      "tar -xvf tburn.tar.gz",
      "sudo mv tburn /usr/local/bin/",
      "tburn version"
    ],
    comment: "# Output: TBurn Chain Core v4.0.0-stable"
  },
  {
    title: "Initialize Node",
    commands: [
      "# Initialize data directory for Mainnet",
      "tburn init --network mainnet --datadir ./data",
      "",
      "# Create a new validator account (Save your password!)",
      "tburn account new --datadir ./data"
    ]
  },
  {
    title: "Start Node",
    commands: [
      "tburn start \\",
      "  --datadir ./data \\",
      "  --http --http.api \"eth,net,web3,txpool,tburn\" \\",
      "  --syncmode full"
    ]
  }
];

const dockerCommands = [
  "docker pull tburnchain/node:latest",
  "",
  "docker run -d --name tburn-node \\",
  "  -p 8545:8545 -p 30303:30303 \\",
  "  -v $HOME/.tburn:/root/.tburn \\",
  "  tburnchain/node:latest \\",
  "  --http --http.addr 0.0.0.0"
];

const sourceCommands = [
  "# Requirements: Go 1.21+, Make, GCC",
  "git clone https://github.com/burnchain/core.git",
  "cd core",
  "make tburn",
  "./build/bin/tburn version"
];

const commonFlags = [
  { flag: "--http", desc: "Enable HTTP-RPC server" },
  { flag: "--ws", desc: "Enable WebSocket server" },
  { flag: "--syncmode", desc: "fast | full | snap" },
  { flag: "--mine", desc: "Enable mining/validating" }
];

const troubleshooting = [
  "Node not syncing?",
  "Port 30303/8545 errors",
  '"Too many open files" error'
];

function TerminalWindow({ 
  children, 
  onCopy 
}: { 
  children: React.ReactNode;
  onCopy?: () => void;
}) {
  return (
    <div 
      className="relative rounded-lg overflow-hidden"
      style={{ 
        background: "#0d0d12",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}
    >
      <div 
        className="px-4 py-2 flex items-center gap-1.5"
        style={{ 
          background: "#1a1a20",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
      </div>
      {onCopy && (
        <button 
          onClick={onCopy}
          className="absolute top-10 right-4 p-1.5 text-gray-500 hover:text-white transition"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
      <div className="p-6 font-mono text-sm text-gray-300">
        {children}
      </div>
    </div>
  );
}

export default function InstallationGuide() {
  const [activeTab, setActiveTab] = useState<OsTab>("linux");
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll(".spotlight-card");
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const tabs: { id: OsTab; label: string; icon: React.ReactNode }[] = [
    { id: "linux", label: "Linux / macOS", icon: <SiLinux className="w-4 h-4" /> },
    { id: "docker", label: "Docker", icon: <SiDocker className="w-4 h-4" /> },
    { id: "windows", label: "Windows", icon: <Monitor className="w-4 h-4" /> },
    { id: "source", label: "From Source", icon: <Terminal className="w-4 h-4" /> }
  ];

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-[#00f0ff]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Download className="w-4 h-4" /> NODE_INSTALLATION_V4
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Run a{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              Validator Node
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Join the TBurn Chain network. Validate transactions, secure the network, and earn rewards. Setup takes less than 10 minutes.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition flex items-center gap-2"
              style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
              data-testid="button-quick-start"
            >
              <Terminal className="w-5 h-5" /> Quick Start
            </button>
            <button 
              className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition flex items-center gap-2"
              data-testid="button-docker"
            >
              <SiDocker className="w-5 h-5" /> Docker Image
            </button>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-[#7000ff]" /> System Requirements
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(systemRequirements).map(([key, req]) => (
              <div 
                key={key}
                className={`spotlight-card p-6 rounded-xl ${
                  req.highlighted 
                    ? "border border-[#7000ff]/50 bg-[#7000ff]/5" 
                    : "border border-white/10"
                }`}
                data-testid={`card-req-${key}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white mb-1">{req.title}</h3>
                  {req.highlighted && <Star className="w-4 h-4 text-[#7000ff]" />}
                </div>
                <p className="text-xs text-gray-500 mb-4">{req.subtitle}</p>
                <ul className="space-y-3 text-sm">
                  {req.specs.map((spec, idx) => (
                    <li 
                      key={idx}
                      className={`flex justify-between pb-2 ${
                        idx < req.specs.length - 1 
                          ? req.highlighted ? "border-b border-white/10" : "border-b border-white/5" 
                          : ""
                      }`}
                    >
                      <span className={req.highlighted ? "text-white" : "text-gray-300"}>
                        {spec.label}
                      </span>
                      <span 
                        className={`font-mono ${req.highlighted ? "font-bold" : ""}`}
                        style={{ color: req.color }}
                      >
                        {spec.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="py-16 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-8">Installation Steps</h2>

          {/* OS Tabs */}
          <div className="flex mb-0 border-b border-white/10 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#00f0ff] border-[#00f0ff] bg-[#00f0ff]/5"
                    : "text-gray-500 border-transparent hover:text-white"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Linux/macOS Content */}
          {activeTab === "linux" && (
            <div className="pt-6 space-y-8">
              {linuxSteps.map((step, stepIdx) => (
                <div key={stepIdx}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#00f0ff] text-black font-bold flex items-center justify-center text-sm">
                      {stepIdx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  </div>
                  <TerminalWindow 
                    onCopy={() => handleCopy(step.commands.filter(c => !c.startsWith("#")).join("\n"))}
                  >
                    {step.commands.map((cmd, cmdIdx) => (
                      <p key={cmdIdx} className={cmd.startsWith("#") ? "text-gray-500" : ""}>
                        {!cmd.startsWith("#") && cmd && <span className="text-green-400">$ </span>}
                        {cmd}
                      </p>
                    ))}
                    {step.comment && (
                      <p className="text-gray-500 mt-2">{step.comment}</p>
                    )}
                  </TerminalWindow>
                </div>
              ))}
            </div>
          )}

          {/* Docker Content */}
          {activeTab === "docker" && (
            <div className="pt-6 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#7000ff] text-white font-bold flex items-center justify-center text-sm">
                    1
                  </span>
                  <h3 className="text-lg font-bold text-white">Pull & Run</h3>
                </div>
                <TerminalWindow onCopy={() => handleCopy(dockerCommands.join("\n"))}>
                  {dockerCommands.map((cmd, idx) => (
                    <p key={idx} className={cmd.startsWith("  ") ? "pl-4" : ""}>
                      {cmd && !cmd.startsWith("  ") && <span className="text-green-400">$ </span>}
                      {cmd}
                    </p>
                  ))}
                </TerminalWindow>
              </div>
              
              <div className="p-4 bg-[#7000ff]/10 border border-[#7000ff]/30 rounded-lg flex gap-3 items-start">
                <Info className="w-5 h-5 text-[#7000ff] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  We highly recommend using <span className="text-white font-bold">Docker Compose</span> for production setups to manage monitoring (Prometheus/Grafana) alongside the node.
                  <Link href="/developers/docs#docker-compose" className="text-[#00f0ff] hover:underline ml-1">View docker-compose.yml</Link>
                </p>
              </div>
            </div>
          )}

          {/* Windows Content */}
          {activeTab === "windows" && (
            <div className="pt-6">
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <Monitor className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Windows Installation</h3>
                <p className="text-gray-400 mb-6">We recommend using WSL2 (Windows Subsystem for Linux) for the best experience.</p>
                <button className="px-6 py-2 border border-white/20 rounded hover:bg-white/10 text-white transition">
                  Download .exe (Beta)
                </button>
              </div>
            </div>
          )}

          {/* From Source Content */}
          {activeTab === "source" && (
            <div className="pt-6">
              <TerminalWindow onCopy={() => handleCopy(sourceCommands.join("\n"))}>
                {sourceCommands.map((cmd, idx) => (
                  <p key={idx} className={cmd.startsWith("#") ? "text-gray-500" : ""}>
                    {!cmd.startsWith("#") && <span className="text-green-400">$ </span>}
                    {cmd}
                  </p>
                ))}
              </TerminalWindow>
            </div>
          )}
        </div>
      </section>

      {/* Configuration & Troubleshooting */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Configuration */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Configuration</h2>
              <p className="text-gray-400 mb-4 text-sm">
                You can configure the node using `tburn.toml` or command line flags.
              </p>
              <div className="spotlight-card p-6 rounded-xl border border-white/10">
                <h4 className="font-bold text-[#00f0ff] mb-3">Common Flags</h4>
                <ul className="space-y-3 text-sm font-mono text-gray-300">
                  {commonFlags.map((flag, idx) => (
                    <li key={idx}>
                      <span className="text-white">{flag.flag}</span> : {flag.desc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Troubleshooting */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Troubleshooting</h2>
              <div className="space-y-4">
                {troubleshooting.map((item, idx) => (
                  <div key={idx} className="group">
                    <button className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex justify-between items-center transition">
                      <span className="text-sm font-bold text-gray-300">{item}</span>
                      <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help */}
      <section className="py-16 px-6 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-gray-400 mb-8">Join our Discord #validator-support channel for 24/7 assistance.</p>
          <Link 
            href="/community/hub" 
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition"
            data-testid="button-discord"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord
          </Link>
        </div>
      </section>
    </div>
  );
}
