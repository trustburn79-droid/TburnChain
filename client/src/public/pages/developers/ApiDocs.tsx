import { useRef, useEffect } from "react";
import { 
  Server, 
  Shield, 
  Database, 
  LineChart, 
  Zap,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const rateLimitPlans = [
  { 
    name: "Free", 
    price: "0", 
    color: "#6b7280",
    features: ["20 req/min", "1,000 req/day"]
  },
  { 
    name: "Basic", 
    price: "$100", 
    color: "#00f0ff",
    features: ["100 req/min", "10,000 req/day"]
  },
  { 
    name: "Pro", 
    price: "$500", 
    color: "#7000ff",
    features: ["500 req/min", "100,000 req/day"]
  },
  { 
    name: "Enterprise", 
    price: "Custom", 
    color: "#00ff9d",
    features: ["Unlimited Rate", "Dedicated Support"]
  },
];

const coreEndpoints = [
  {
    title: "Trust Score API",
    icon: Shield,
    color: "#00f0ff",
    endpoints: [
      { method: "GET", path: "/score/:address" },
      { method: "GET", path: "/score/:address/history" },
      { method: "POST", path: "/score/batch" },
    ]
  },
  {
    title: "Project Management",
    icon: Database,
    color: "#7000ff",
    endpoints: [
      { method: "GET", path: "/projects" },
      { method: "POST", path: "/projects/register" },
    ]
  },
  {
    title: "Analytics API",
    icon: LineChart,
    color: "#00ff9d",
    endpoints: [
      { method: "GET", path: "/analytics/trends" },
      { method: "GET", path: "/analytics/leaderboard" },
    ]
  },
  {
    title: "Webhooks",
    icon: Zap,
    color: "#ff0055",
    endpoints: [
      { method: "POST", path: "/webhooks/register" },
    ],
    note: "Events: score.updated, score.alert"
  },
];

const errorCodes = [
  { code: "invalid_api_key", http: "401", description: "The API key provided is invalid or expired." },
  { code: "rate_limit_exceeded", http: "429", description: "You have exceeded your plan's rate limit." },
  { code: "project_not_found", http: "404", description: "The requested project address does not exist." },
  { code: "internal_error", http: "500", description: "Something went wrong on our end." },
];

const successResponse = `{
  "success": true,
  "data": {
    "address": "0x123...",
    "score": 85,
    "grade": "S",
    "dimensions": {
      "team": 28,
      "tech": 23
    },
    "lastUpdate": "2025-12-01T10:00:00Z"
  },
  "timestamp": 1704067200
}`;

const errorResponse = `{
  "success": false,
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "details": "Reset in 45s"
  },
  "timestamp": 1704067200
}`;

function MethodBadge({ method }: { method: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    GET: { bg: "rgba(0, 255, 157, 0.1)", color: "#00ff9d", border: "rgba(0, 255, 157, 0.3)" },
    POST: { bg: "rgba(0, 240, 255, 0.1)", color: "#00f0ff", border: "rgba(0, 240, 255, 0.3)" },
    WS: { bg: "rgba(112, 0, 255, 0.1)", color: "#7000ff", border: "rgba(112, 0, 255, 0.3)" },
  };
  const style = styles[method] || styles.GET;
  
  return (
    <span 
      className="font-mono text-[11px] px-1.5 py-0.5 rounded font-bold"
      style={{ 
        backgroundColor: style.bg, 
        color: style.color,
        border: `1px solid ${style.border}`
      }}
    >
      {method}
    </span>
  );
}

export default function ApiDocs() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Server className="w-4 h-4" /> API VERSION 1.0
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            RPC{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              API Reference
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Query trust scores, manage projects, and access validator analytics directly.
            <br />
            Base URL:{" "}
            <span className="font-mono text-white bg-white/10 px-2 rounded">
              https://api.tburn.io/v1
            </span>
          </p>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>
          
          <div className="spotlight-card rounded-xl p-8" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <h3 className="text-xl font-bold text-white mb-4">1. Authentication</h3>
            <p className="text-gray-400 mb-6">All API requests require an API key in the HTTP header.</p>
            
            <div 
              className="font-mono text-sm p-4 rounded-lg mb-6 overflow-x-auto"
              style={{ 
                background: "#0a0a0f",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#a0a0a0"
              }}
              data-testid="code-auth-header"
            >
              <span className="text-gray-500"># Header Format</span><br />
              X-API-Key: <span className="text-[#00ff9d]">bc_live_1234567890abcdef</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">2. Your First Request</h3>
            <div 
              className="font-mono text-sm p-4 rounded-lg overflow-x-auto"
              style={{ 
                background: "#0a0a0f",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#a0a0a0"
              }}
              data-testid="code-first-request"
            >
              <span className="text-[#7000ff]">curl</span> -X POST https://api.tburn.io/v1/auth/register \<br />
              &nbsp;&nbsp;-H <span className="text-[#00ff9d]">"Content-Type: application/json"</span> \<br />
              &nbsp;&nbsp;-d <span className="text-[#00f0ff]">{'\'{ "email": "dev@example.com", "name": "Builder" }\''}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits Section */}
      <section className="py-16 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Rate Limits</h2>
            <p className="text-gray-400">Choose the plan that scales with you.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {rateLimitPlans.map((plan, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-6 text-center"
                style={{ borderTop: `2px solid ${plan.color}` }}
                data-testid={`rate-plan-${index}`}
              >
                <h3 className="font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4" style={{ color: plan.color }}>
                  {plan.price}
                  {plan.price !== "Custom" && <span className="text-sm text-white"> /mo</span>}
                </div>
                <ul className="text-sm space-y-2" style={{ color: plan.name === "Free" ? "#6b7280" : "#9ca3af" }}>
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Endpoints Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-white mb-8">Core Endpoints</h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {coreEndpoints.map((api, index) => (
              <div key={index} className="spotlight-card rounded-xl p-6" data-testid={`endpoint-group-${index}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${api.color}20`, color: api.color }}
                  >
                    <api.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{api.title}</h3>
                </div>
                
                <div className="space-y-3">
                  {api.endpoints.map((endpoint, eIndex) => (
                    <div 
                      key={eIndex}
                      className="flex items-center justify-between p-3 rounded"
                      style={{ 
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.05)"
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <MethodBadge method={endpoint.method} />
                        <span className="text-gray-300 text-sm font-mono">{endpoint.path}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                    </div>
                  ))}
                  {api.note && (
                    <p className="text-xs text-gray-500 px-2">
                      Events: <span className="text-[#00f0ff]">score.updated</span>, <span className="text-[#ff0055]">score.alert</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Response Format Section */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-8">Response Format</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2 text-[#00ff9d]">
                <CheckCircle className="w-4 h-4" /> Success 200
              </h4>
              <pre 
                className="font-mono text-sm p-4 rounded-lg overflow-x-auto"
                style={{ 
                  background: "#0a0a0f",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#a0a0a0"
                }}
                data-testid="code-success-response"
              >
                {successResponse}
              </pre>
            </div>
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2 text-[#ff0055]">
                <AlertCircle className="w-4 h-4" /> Error 4xx/5xx
              </h4>
              <pre 
                className="font-mono text-sm p-4 rounded-lg overflow-x-auto"
                style={{ 
                  background: "#0a0a0f",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#a0a0a0"
                }}
                data-testid="code-error-response"
              >
                {errorResponse}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Error Codes Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-6">Common Error Codes</h2>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <table className="w-full text-left text-sm" data-testid="error-codes-table">
              <thead className="text-gray-300" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                <tr>
                  <th className="p-4 font-mono">Code</th>
                  <th className="p-4">HTTP</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-400 divide-y" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
                {errorCodes.map((error, index) => (
                  <tr key={index} style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
                    <td className="p-4 font-mono text-[#ff0055]">{error.code}</td>
                    <td className="p-4">{error.http}</td>
                    <td className="p-4">{error.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
