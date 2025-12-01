import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
}

export function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 150 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

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
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    function initParticles() {
      particlesRef.current = [];
      const numberOfParticles = Math.floor((width * height) / 12000);

      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 0.5;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const directionX = (Math.random() - 0.5) * 0.5;
        const directionY = (Math.random() - 0.5) * 0.5;
        
        const colors = ["#00f0ff", "#7000ff", "#00ff88", "#ff0080"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particlesRef.current.push({
          x,
          y,
          directionX,
          directionY,
          size,
          color,
        });
      }
    }

    function drawParticle(particle: Particle) {
      ctx!.beginPath();
      ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx!.fillStyle = particle.color;
      ctx!.shadowBlur = 15;
      ctx!.shadowColor = particle.color;
      ctx!.fill();
      ctx!.shadowBlur = 0;
    }

    function updateParticle(particle: Particle) {
      if (particle.x > width || particle.x < 0) {
        particle.directionX = -particle.directionX;
      }
      if (particle.y > height || particle.y < 0) {
        particle.directionY = -particle.directionY;
      }

      const dx = mouseRef.current.x - particle.x;
      const dy = mouseRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = mouseRef.current.radius;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        
        particle.x -= forceDirectionX * force * 3;
        particle.y -= forceDirectionY * force * 3;
      }

      particle.x += particle.directionX;
      particle.y += particle.directionY;
    }

    function hexToRgba(hex: string, alpha: number): string {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function connectParticles() {
      const particles = particlesRef.current;
      const maxDistance = 120;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.4;
            
            ctx!.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.3})`;
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(particles[a].x, particles[a].y);
            ctx!.lineTo(particles[b].x, particles[b].y);
            ctx!.stroke();
          }
        }
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        for (const particle of particles) {
          const dx = mx - particle.x;
          const dy = my - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            const opacity = (1 - distance / 200) * 0.8;
            ctx!.strokeStyle = hexToRgba(particle.color, opacity);
            ctx!.lineWidth = 1.5;
            ctx!.beginPath();
            ctx!.moveTo(particle.x, particle.y);
            ctx!.lineTo(mx, my);
            ctx!.stroke();
          }
        }
      }
    }

    function animate() {
      animationRef.current = requestAnimationFrame(animate);
      
      ctx!.fillStyle = "rgba(3, 4, 7, 0.1)";
      ctx!.fillRect(0, 0, width, height);

      for (const particle of particlesRef.current) {
        updateParticle(particle);
        drawParticle(particle);
      }
      connectParticles();
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
        opacity: 0.5,
      }}
    />
  );
}
