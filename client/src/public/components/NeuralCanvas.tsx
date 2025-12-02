import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alpha: number;
}

export function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const PARTICLE_COLOR = "#00f0ff";
    const CONNECTION_DISTANCE = 150;
    const MOUSE_RADIUS = 120;
    const PARTICLE_COUNT_FACTOR = 6150;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    function initParticles() {
      particlesRef.current = [];
      const numberOfParticles = Math.min(
        Math.floor((width * height) / PARTICLE_COUNT_FACTOR),
        200
      );

      for (let i = 0; i < numberOfParticles; i++) {
        const baseSize = Math.random() * 1.5 + 0.5;
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: baseSize,
          baseSize: baseSize,
          alpha: Math.random() * 0.5 + 0.3,
        });
      }
    }

    function drawParticle(particle: Particle) {
      ctx!.beginPath();
      ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(0, 240, 255, ${particle.alpha})`;
      ctx!.shadowBlur = 8;
      ctx!.shadowColor = PARTICLE_COLOR;
      ctx!.fill();
      ctx!.shadowBlur = 0;
    }

    function updateParticle(particle: Particle) {
      if (particle.x > width || particle.x < 0) {
        particle.vx = -particle.vx;
      }
      if (particle.y > height || particle.y < 0) {
        particle.vy = -particle.vy;
      }

      const dx = mouseRef.current.x - particle.x;
      const dy = mouseRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MOUSE_RADIUS && distance > 0) {
        const pushDistance = MOUSE_RADIUS - distance;
        const angle = Math.atan2(dy, dx);
        particle.x -= Math.cos(angle) * pushDistance;
        particle.y -= Math.sin(angle) * pushDistance;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));
    }

    function connectParticles() {
      const particles = particlesRef.current;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.075;
            ctx!.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
            ctx!.lineWidth = 0.8;
            ctx!.beginPath();
            ctx!.moveTo(particles[a].x, particles[a].y);
            ctx!.lineTo(particles[b].x, particles[b].y);
            ctx!.stroke();
          }
        }
      }

    }

    function animate() {
      animationRef.current = requestAnimationFrame(animate);

      ctx!.fillStyle = "#030407";
      ctx!.fillRect(0, 0, width, height);

      connectParticles();

      for (const particle of particlesRef.current) {
        updateParticle(particle);
        drawParticle(particle);
      }
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="neural-canvas"
      data-testid="canvas-neural-background"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
