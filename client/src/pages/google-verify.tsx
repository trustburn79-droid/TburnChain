import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Link } from "wouter";

function NeuralCanvasVerify() {
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
      const count = Math.floor((width * height) / 25000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          dx: (Math.random() - 0.5) * 0.4,
          dy: (Math.random() - 0.5) * 0.4,
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
          if (dist < 80) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - dist / 80) * 0.15})`;
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

export default function GoogleVerify() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Get email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email") || "";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "오류",
        description: "6자리 인증 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/google/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "인증 완료!",
          description: "회원가입이 완료되었습니다. 앱으로 이동합니다.",
        });
        setTimeout(() => {
          setLocation("/app");
        }, 1000);
      } else {
        toast({
          title: "인증 실패",
          description: data.error || "인증 코드를 확인해주세요.",
          variant: "destructive",
        });
        setVerificationCode("");
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "인증 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/google/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "코드 재전송 완료",
          description: "새 인증 코드가 이메일로 전송되었습니다.",
        });
        setCountdown(60);
        setVerificationCode("");
      } else {
        toast({
          title: "재전송 실패",
          description: data.error || "잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "코드 재전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">잘못된 접근입니다.</p>
          <Link href="/login">
            <Button variant="outline">로그인으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 antialiased">
      <NeuralCanvasVerify />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="w-9 h-9 group-hover:scale-110 transition-transform">
                <TBurnLogo className="w-9 h-9" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                TBurn <span className="text-cyan-400">Chain</span>
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-600/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl p-8 bg-[rgba(20,20,25,0.8)] backdrop-blur-xl border border-white/10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center">
                <Mail className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2" data-testid="text-verify-title">
                이메일 인증
              </h1>
              <p className="text-sm text-gray-400">
                Google 계정으로 회원가입을 완료하려면
                <br />
                이메일로 전송된 인증 코드를 입력해주세요.
              </p>
            </div>

            {/* Email Display */}
            <div className="bg-black/30 border border-white/10 rounded-lg p-3 mb-6 text-center">
              <span className="text-cyan-400 text-sm font-mono">{email}</span>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={(value) => setVerificationCode(value)}
                data-testid="input-verification-code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-14 text-xl bg-black/30 border-white/20" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-xl bg-black/30 border-white/20" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-xl bg-black/30 border-white/20" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-xl bg-black/30 border-white/20" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-xl bg-black/30 border-white/20" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-xl bg-black/30 border-white/20" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:-translate-y-0.5 transition-all"
              data-testid="button-verify"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  인증 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  인증 완료
                </>
              )}
            </Button>

            {/* Resend */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-2">
                인증 코드를 받지 못하셨나요?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className="text-cyan-400 hover:text-cyan-300"
                data-testid="button-resend"
              >
                {countdown > 0 ? (
                  `${countdown}초 후 재전송 가능`
                ) : isResending ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    인증 코드 재전송
                  </>
                )}
              </Button>
            </div>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  로그인으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
