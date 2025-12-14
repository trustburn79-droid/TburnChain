import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Check, 
  GitBranch, 
  BookOpen, 
  Network,
  Flame
} from "lucide-react";
import { SiGoogle, SiGithub } from "react-icons/si";
import { queryClient } from "@/lib/queryClient";
import { LanguageSelector } from "@/components/language-selector";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginProps {
  onLoginSuccess: () => void;
  isAdminLogin?: boolean;
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function useTextScramble(text: string, delay: number = 0) {
  const [displayText, setDisplayText] = useState("Loading...");
  const [isComplete, setIsComplete] = useState(false);

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
          setIsComplete(true);
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

  return { displayText, isComplete };
}

function NeuralCanvasLogin() {
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
        ctx.fillStyle = "#00f0ff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00f0ff";
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
            ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - dist / 100) * 0.2})`;
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

const benefitIcons = [Check, GitBranch, BookOpen, Network];
const benefitLinks = [
  "/learn/roadmap",
  "/solutions/ai-features",
  "/developers/docs",
  "/learn/tokenomics",
];
const benefitKeys = ["testnetAccess", "governance", "resources", "rewards"];

export default function Login({ onLoginSuccess, isAdminLogin = false }: LoginProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { displayText } = useTextScramble(t('login.authenticate'), 500);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const loginEndpoint = isAdminLogin ? "/api/admin/auth/login" : "/api/auth/login";
      const requestBody = isAdminLogin 
        ? { password: data.password } 
        : { email: data.email, password: data.password };
      
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const queryKey = isAdminLogin ? ["/api/admin/auth/check"] : ["/api/auth/check"];
        await queryClient.invalidateQueries({ queryKey });
        
        toast({
          title: t('login.loginSuccessful'),
          description: t('login.welcomeMessage'),
        });
        
        onLoginSuccess();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: t('login.loginFailed'),
          description: errorData.error || t('login.invalidCredentials'),
          variant: "destructive",
        });
        form.setValue("password", "");
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('login.loginError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 antialiased">
      <NeuralCanvasLogin />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4 text-black" />
                <div className="absolute inset-0 bg-white/20 rounded blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                TBurn <span className="text-cyan-400">Chain</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/developers" className="text-sm font-medium text-gray-400 hover:text-white transition">
                {t('login.nav.developers')}
              </Link>
              <Link href="/network" className="text-sm font-medium text-gray-400 hover:text-white transition">
                {t('login.nav.network')}
              </Link>
              <LanguageSelector />
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

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
          
          {/* Login Card */}
          <div className="spotlight-card rounded-2xl p-8 flex flex-col justify-center bg-[rgba(20,20,25,0.6)] backdrop-blur-xl border border-white/5">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-mono mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                {t('login.gatewaySecure')}
              </div>
              <h1 
                className="text-3xl font-bold text-white mb-2"
                data-testid="text-login-title"
              >
                {displayText}
              </h1>
              <p className="text-sm text-gray-400">{t('login.connectToNeural')}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!isAdminLogin && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder={t('signup.enterEmail')}
                            disabled={isLoading}
                            data-testid="input-email"
                            autoFocus
                            className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={isAdminLogin ? t('login.enterAccessKey') : t('login.enterPassword')}
                          disabled={isLoading}
                          data-testid="input-password"
                          autoFocus={isAdminLogin}
                          className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  data-testid="button-login"
                  className="w-full h-12 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:-translate-y-0.5 transition-all"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isLoading ? t('login.authenticating') : t('login.connectNode')}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative py-4 my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#121216] px-2 text-gray-500">{t('login.orViaOAuth')}</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="bg-black/30 border border-white/10 py-2.5 rounded-lg text-sm hover:bg-white/5 transition flex items-center justify-center gap-2 text-gray-300"
                data-testid="button-google-auth"
              >
                <SiGoogle className="w-4 h-4" /> Google
              </button>
              <button 
                className="bg-black/30 border border-white/10 py-2.5 rounded-lg text-sm hover:bg-white/5 transition flex items-center justify-center gap-2 text-gray-300"
                data-testid="button-github-auth"
              >
                <SiGithub className="w-4 h-4" /> GitHub
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center mt-6">
              {t('login.byConnecting')}{" "}
              <Link href="/legal/terms-of-service" className="text-cyan-400 hover:underline" data-testid="link-terms">
                {t('login.termsOfService')}
              </Link>
              {" "}{t('login.and')}{" "}
              <Link href="/legal/privacy-policy" className="text-purple-400 hover:underline" data-testid="link-privacy">
                {t('login.privacyPolicy')}
              </Link>.
            </p>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {t('login.noNodeId')}{" "}
                <Link href="/signup" className="text-cyan-400 hover:text-white transition font-bold" data-testid="link-signup">
                  {t('login.initializeNode')}
                </Link>
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="spotlight-card rounded-2xl p-8 bg-[rgba(20,20,25,0.6)] backdrop-blur-xl border border-cyan-400/30 flex flex-col justify-center relative overflow-hidden group">
            {/* Top Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-50 animate-pulse"></div>

            <div className="mb-6 relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-purple-500">◆</span> {t('login.whyConnect')}
              </h2>
              <p className="text-sm text-gray-400">{t('login.whyConnectSubtitle')}</p>
            </div>

            <ul className="space-y-4 relative z-10">
              {benefitKeys.map((key, index) => {
                const Icon = benefitIcons[index];
                return (
                  <li key={index}>
                    <Link 
                      href={benefitLinks[index]}
                      className="flex items-start gap-3 group/item p-2 -m-2 rounded-lg hover:bg-white/5 transition" 
                      data-testid={`link-benefit-${index}`}
                    >
                      <div className="mt-1 w-5 h-5 rounded-full bg-cyan-400/10 flex items-center justify-center border border-cyan-400/30 group-hover/item:border-cyan-400 transition">
                        <Icon className="w-2.5 h-2.5 text-cyan-400" />
                      </div>
                      <div>
                        <span className="block text-sm text-white font-medium group-hover/item:text-cyan-400 transition">
                          {t(`login.benefits.${key}.title`)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {t(`login.benefits.${key}.description`)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Background Icon */}
            <Network className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500">
                {t('login.footer.copyright')}{" "}
                <span className="text-cyan-400/50">{t('login.footer.allSystemsOperational')}</span>
              </p>
            </div>
            <div className="flex gap-6 text-gray-500 text-sm">
              <Link href="/legal/privacy-policy" className="hover:text-cyan-400 transition" data-testid="footer-link-privacy">
                {t('login.footer.privacy')}
              </Link>
              <Link href="/legal/terms-of-service" className="hover:text-cyan-400 transition" data-testid="footer-link-terms">
                {t('login.footer.terms')}
              </Link>
              <Link href="/learn/whitepaper" className="hover:text-cyan-400 transition" data-testid="footer-link-whitepaper">
                {t('login.footer.whitepaper')}
              </Link>
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
            rgba(0, 240, 255, 0.5),
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
