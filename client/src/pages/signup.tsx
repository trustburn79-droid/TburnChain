import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useTranslation } from "react-i18next";
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
  Flame,
  ArrowLeft,
  RefreshCw,
  KeyRound
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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

type SignupFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  memberTier: "basic_user" | "delegated_staker";
  terms: boolean;
};

function createSignupSchema(t: (key: string) => string) {
  return z.object({
    username: z.string().min(3, t("publicPages.signup.validation.usernameMin")).max(20, t("publicPages.signup.validation.usernameMax")),
    email: z.string().email(t("publicPages.signup.validation.emailInvalid")),
    password: z.string().min(8, t("publicPages.signup.validation.passwordMin")),
    confirmPassword: z.string(),
    memberTier: z.enum(["basic_user", "delegated_staker"]),
    terms: z.boolean().refine(val => val === true, t("publicPages.signup.validation.termsRequired")),
  }).refine(data => data.password === data.confirmPassword, {
    message: t("publicPages.signup.validation.passwordMismatch"),
    path: ["confirmPassword"],
  });
}

export default function Signup() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const displayText = useTextScramble(t("publicPages.signup.title"), 500);
  const containerRef = useRef<HTMLDivElement>(null);

  const signupSchema = createSignupSchema(t);
  
  const memberTierOptions = [
    { value: "basic_user" as const, label: t("publicPages.signup.memberTiers.basicUser.label"), description: t("publicPages.signup.memberTiers.basicUser.description") },
    { value: "delegated_staker" as const, label: t("publicPages.signup.memberTiers.delegatedStaker.label"), description: t("publicPages.signup.memberTiers.delegatedStaker.description") },
  ];

  const privileges = [
    {
      icon: Zap,
      title: t("publicPages.signup.privileges.validator.title"),
      description: t("publicPages.signup.privileges.validator.description"),
      color: "purple",
    },
    {
      icon: TrendingUp,
      title: t("publicPages.signup.privileges.analytics.title"),
      description: t("publicPages.signup.privileges.analytics.description"),
      color: "cyan",
    },
    {
      icon: Globe,
      title: t("publicPages.signup.privileges.network.title"),
      description: t("publicPages.signup.privileges.network.description"),
      color: "purple",
    },
  ];

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      memberTier: "basic_user",
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

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendVerification = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        title: t("publicPages.signup.toast.errorTitle"),
        description: t("publicPages.signup.validation.emailInvalid"),
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: t("publicPages.signup.toast.errorTitle"),
        description: t("publicPages.signup.validation.emailInvalid"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/send-verification", { email, type: "signup" });
      setVerificationEmail(email);
      setStep(2);
      setResendCooldown(60);
      toast({
        title: t("publicPages.signup.toast.codeSentTitle"),
        description: t("publicPages.signup.toast.codeSentDescription"),
      });
    } catch (error: any) {
      toast({
        title: t("publicPages.signup.toast.errorTitle"),
        description: error.message || t("publicPages.signup.toast.sendCodeError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: t("publicPages.signup.toast.errorTitle"),
        description: t("publicPages.signup.toast.invalidCodeLength"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/verify-code", { 
        email: verificationEmail, 
        code: verificationCode,
        type: "signup"
      });
      setStep(3);
      toast({
        title: t("publicPages.signup.toast.verifiedTitle"),
        description: t("publicPages.signup.toast.verifiedDescription"),
      });
    } catch (error: any) {
      toast({
        title: t("publicPages.signup.toast.errorTitle"),
        description: error.message || t("publicPages.signup.toast.verifyError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/send-verification", { email: verificationEmail, type: "signup" });
      setResendCooldown(60);
      setVerificationCode("");
      toast({
        title: t("publicPages.signup.toast.codeSentTitle"),
        description: t("publicPages.signup.toast.codeResent"),
      });
    } catch (error: any) {
      toast({
        title: t("publicPages.signup.toast.errorTitle"),
        description: error.message || t("publicPages.signup.toast.resendError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/signup", {
        username: data.username,
        email: data.email,
        password: data.password,
        memberTier: data.memberTier,
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
      
      toast({
        title: t("publicPages.signup.toast.successTitle"),
        description: t("publicPages.signup.toast.successDescription"),
      });
      
      navigate("/app");
    } catch (error: any) {
      toast({
        title: t("publicPages.signup.toast.errorTitle"),
        description: error.message || t("publicPages.signup.toast.errorDescription"),
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
                <a className="text-sm font-medium text-gray-400 hover:text-white transition">{t("publicPages.signup.nav.developers")}</a>
              </Link>
              <Link href="/network">
                <a className="text-sm font-medium text-gray-400 hover:text-white transition">{t("publicPages.signup.nav.network")}</a>
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
                {t("publicPages.signup.gatewayRegister")}
              </div>
              <h1 
                className="text-3xl font-bold text-white mb-2"
                data-testid="text-signup-title"
              >
                {displayText}
              </h1>
              <p className="text-sm text-gray-400">{t("publicPages.signup.subtitle")}</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s === step 
                      ? "bg-cyan-400 text-black" 
                      : s < step 
                        ? "bg-green-500 text-black" 
                        : "bg-white/10 text-gray-500"
                  }`}>
                    {s < step ? <CheckCircle className="w-3 h-3" /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-green-500" : "bg-white/10"}`} />}
                </div>
              ))}
              <span className="text-xs text-gray-500 ml-2">
                {t("publicPages.signup.step")} {step}/3
              </span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Step 1: Email Entry */}
                {step === 1 && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-500 ml-1">{t("publicPages.signup.signalFrequency")}</label>
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
                                  placeholder={t("publicPages.signup.emailPlaceholder")}
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
                    <p className="text-xs text-gray-500">{t("publicPages.signup.verificationNote")}</p>
                    <Button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={isLoading}
                      data-testid="button-send-code"
                      className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-bold hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:-translate-y-0.5 transition-all"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {isLoading ? t("publicPages.signup.sending") : t("publicPages.signup.sendCode")}
                    </Button>
                  </>
                )}

                {/* Step 2: Verification Code Entry */}
                {step === 2 && (
                  <>
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-mono mb-3">
                        <KeyRound className="w-3 h-3" />
                        {verificationEmail}
                      </div>
                      <p className="text-sm text-gray-400">{t("publicPages.signup.enterCode")}</p>
                    </div>
                    
                    <div className="flex justify-center">
                      <InputOTP
                        value={verificationCode}
                        onChange={setVerificationCode}
                        maxLength={6}
                        data-testid="input-otp"
                      >
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot 
                              key={index} 
                              index={index}
                              className="bg-black/30 border-white/10 text-white text-lg font-mono"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        disabled={isLoading}
                        data-testid="button-back"
                        className="flex-1 h-11 border-white/10 text-gray-400 hover:text-white"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("publicPages.signup.back")}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={isLoading || verificationCode.length !== 6}
                        data-testid="button-verify-code"
                        className="flex-1 h-11 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isLoading ? t("publicPages.signup.verifying") : t("publicPages.signup.verify")}
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendCode}
                      disabled={isLoading || resendCooldown > 0}
                      data-testid="button-resend-code"
                      className="w-full text-sm text-gray-400 hover:text-cyan-400"
                    >
                      <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      {resendCooldown > 0 
                        ? `${t("publicPages.signup.resendIn")} ${resendCooldown}s`
                        : t("publicPages.signup.resendCode")
                      }
                    </Button>
                  </>
                )}

                {/* Step 3: Complete Registration */}
                {step === 3 && (
                  <>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono mb-2">
                      <CheckCircle className="w-3 h-3" />
                      {verificationEmail} {t("publicPages.signup.verified")}
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-500 ml-1">{t("publicPages.signup.nodeAlias")}</label>
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
                                  placeholder={t("publicPages.signup.usernamePlaceholder")}
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

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-gray-500 ml-1">{t("publicPages.signup.encryptionKey")}</label>
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
                                    placeholder={t("publicPages.signup.passwordPlaceholder")}
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
                        <label className="text-xs font-mono text-gray-500 ml-1">{t("publicPages.signup.verifyKey")}</label>
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
                                    placeholder={t("publicPages.signup.confirmPlaceholder")}
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

                    {/* Member Tier Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-500 ml-1">{t("publicPages.signup.nodeClass")}</label>
                      <FormField
                        control={form.control}
                        name="memberTier"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {memberTierOptions.map((option) => (
                                  <div
                                    key={option.value}
                                    onClick={() => field.onChange(option.value)}
                                    data-testid={`tier-${option.value}`}
                                    className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                      field.value === option.value
                                        ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                                        : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-black/40"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        field.value === option.value
                                          ? "border-cyan-400"
                                          : "border-gray-500"
                                      }`}>
                                        {field.value === option.value && (
                                          <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                        )}
                                      </div>
                                      <div>
                                        <div className={`font-semibold text-sm ${
                                          field.value === option.value ? "text-cyan-400" : "text-white"
                                        }`}>
                                          {option.label}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {option.description}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                            {t("publicPages.signup.terms.prefix")}{" "}
                            <a href="#" className="text-cyan-400 hover:underline">{t("publicPages.signup.terms.genesisProtocols")}</a>
                            {" "}{t("publicPages.signup.terms.suffix")}
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
                      {isLoading ? t("publicPages.signup.initializing") : t("publicPages.signup.initializeNode")}
                    </Button>
                  </>
                )}
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {t("publicPages.signup.alreadyHaveNode")}{" "}
                <Link href="/app">
                  <a className="text-purple-400 hover:text-white transition ml-1 font-bold">{t("publicPages.signup.accessGateway")}</a>
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
                <Shield className="w-6 h-6 text-cyan-400" /> {t("publicPages.signup.systemPrivileges")}
              </h2>
              <p className="text-sm text-gray-400">{t("publicPages.signup.privilegesSubtitle")}</p>
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
