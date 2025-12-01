import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Rocket, 
  User, 
  Mail, 
  Lock, 
  CheckCircle,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Flame
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function useTextScramble(text: string, delay: number = 0) {
  const [displayText, setDisplayText] = useState("Loading...");

  useEffect(() => {
    let iterations = 0;
    let intervalId: NodeJS.Timeout;

    const startScramble = () => {
      intervalId = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((letter, index) => {
              if (index < iterations) return text[index];
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            })
            .join("")
        );

        if (iterations >= text.length) {
          clearInterval(intervalId);
        }
        iterations += 1 / 3;
      }, 40);
    };

    const timer = setTimeout(startScramble, delay);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, delay]);

  return displayText;
}

function NeuralCanvasSignup() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Array<{
      x: number;
      y: number;
      dx: number;
      dy: number;
      size: number;
    }> = [];
    let animationId: number;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((width * height) / 20000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      ctx.fillStyle = "rgba(5, 5, 5, 0.1)";
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        if (p.x > width || p.x < 0) p.dx = -p.dx;
        if (p.y > height || p.y < 0) p.dy = -p.dy;
        p.x += p.dx;
        p.y += p.dy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#7000ff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#7000ff";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(112, 0, 255, ${(1 - dist / 100) * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        opacity: 0.5,
        pointerEvents: "none",
      }}
    />
  );
}

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const privileges = [
  {
    icon: Zap,
    title: "High-Speed Validator",
    description: "Participate in consensus with 100,000 TPS capability directly from your dashboard.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Token Analytics",
    description: "Real-time portfolio tracking with AI-powered insights and burn metrics.",
    color: "cyan",
  },
  {
    icon: Globe,
    title: "Global Network Access",
    description: "Connect to validators across all shards with latency-optimized routing.",
    color: "purple",
  },
];

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const displayText = useTextScramble("Initialize", 500);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

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

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/signup", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
      
      toast({
        title: "Node Initialized",
        description: "Welcome to TBurn Chain! Your account is now active.",
      });
      
      navigate("/app");
    } catch (error: any) {
      toast({
        title: "Initialization Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 antialiased">
      <NeuralCanvasSignup />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2 group">
                <div className="relative w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Flame className="w-4 h-4 text-black" />
                  <div className="absolute inset-0 bg-white/20 rounded blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">
                  TBurn <span className="text-cyan-400">Chain</span>
                </span>
              </a>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/developers">
                <a className="text-sm font-medium text-gray-400 hover:text-white transition">Developers</a>
              </Link>
              <Link href="/network">
                <a className="text-sm font-medium text-gray-400 hover:text-white transition">Network</a>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        ref={containerRef}
        className="flex-grow flex items-center justify-center p-4 relative z-10"
      >
        {/* Background Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
          
          {/* Signup Card */}
          <div className="spotlight-card rounded-2xl p-8 flex flex-col justify-center bg-[rgba(20,20,25,0.6)] backdrop-blur-xl border border-white/5">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                GATEWAY_REGISTER
              </div>
              <h1 
                className="text-3xl font-bold text-white mb-2"
                data-testid="text-signup-title"
              >
                {displayText}
              </h1>
              <p className="text-sm text-gray-400">Create a new identity on the Neural Layer</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-500 ml-1">NODE ALIAS</label>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                              {...field}
                              placeholder="Enter username"
                              disabled={isLoading}
                              data-testid="input-username"
                              className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-400 focus:ring-purple-400/20 pl-10 h-11"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-500 ml-1">SIGNAL FREQUENCY (EMAIL)</label>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="name@example.com"
                              disabled={isLoading}
                              data-testid="input-email"
                              className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-400 focus:ring-purple-400/20 pl-10 h-11"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-500 ml-1">ENCRYPTION KEY</label>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Password"
                                disabled={isLoading}
                                data-testid="input-password"
                                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-400 focus:ring-purple-400/20 pl-10 h-11"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-500 ml-1">VERIFY KEY</label>
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Confirm"
                                disabled={isLoading}
                                data-testid="input-confirm-password"
                                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-400 focus:ring-purple-400/20 pl-10 h-11"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          data-testid="checkbox-terms"
                          className="mt-1 border-white/20 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
                        />
                      </FormControl>
                      <label className="text-xs text-gray-400 leading-relaxed cursor-pointer" onClick={() => field.onChange(!field.value)}>
                        I accept the{" "}
                        <a href="#" className="text-cyan-400 hover:underline">Genesis Protocols</a>
                        {" "}and acknowledge that my node data will be immutable on the chain.
                      </label>
                    </FormItem>
                  )}
                />
                <FormMessage>{form.formState.errors.terms?.message}</FormMessage>

                <Button
                  type="submit"
                  disabled={isLoading}
                  data-testid="button-signup"
                  className="w-full h-12 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:-translate-y-0.5 transition-all mt-4"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  {isLoading ? "Initializing..." : "Initialize Node"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Already have a node ID?{" "}
                <Link href="/app">
                  <a className="text-purple-400 hover:text-white transition ml-1 font-bold">Access Gateway</a>
                </Link>
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="spotlight-card rounded-2xl p-8 bg-[rgba(20,20,25,0.6)] backdrop-blur-xl border border-cyan-400/30 flex flex-col justify-center relative overflow-hidden group">
            {/* Right Gradient Line */}
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent opacity-50 animate-pulse"></div>

            <div className="mb-8 relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Shield className="w-6 h-6 text-cyan-400" /> System Privileges
              </h2>
              <p className="text-sm text-gray-400">Initializing your account grants immediate access to:</p>
            </div>

            <div className="space-y-6 relative z-10">
              {privileges.map((privilege, index) => {
                const Icon = privilege.icon;
                const colorClass = privilege.color === "purple" 
                  ? "bg-purple-500/10 border-purple-500/30 group-hover/item:border-purple-500 text-purple-500"
                  : "bg-cyan-400/10 border-cyan-400/30 group-hover/item:border-cyan-400 text-cyan-400";
                
                return (
                  <div key={index} className="flex gap-4 group/item">
                    <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 transition-colors ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{privilege.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{privilege.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Background Icon */}
            <Globe className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500">
                © 2025 TBurn Chain Foundation.{" "}
                <span className="text-cyan-400/50">All systems operational.</span>
              </p>
            </div>
            <div className="flex gap-6 text-gray-500 text-sm">
              <a href="#" className="hover:text-cyan-400 transition">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition">Terms</a>
              <a href="#" className="hover:text-cyan-400 transition">Whitepaper</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Spotlight Card Styles */}
      <style>{`
        .spotlight-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        
        .spotlight-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: radial-gradient(
            800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(112, 0, 255, 0.5),
            transparent 40%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          z-index: 1;
        }

        .spotlight-card:hover::before {
          opacity: 1;
        }

        .spotlight-card > * {
          position: relative;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
