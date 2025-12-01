import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  draw: () => void;
  update: () => void;
}

export function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, radius: 150 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.x;
      mouseRef.current.y = event.y;
    };

    function initParticles() {
      particlesRef.current = [];
      const numberOfParticles = (canvas!.height * canvas!.width) / 15000;

      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * (canvas!.width - size * 4) + size * 2;
        const y = Math.random() * (canvas!.height - size * 4) + size * 2;
        const directionX = Math.random() * 0.2 - 0.1;
        const directionY = Math.random() * 0.2 - 0.1;

        const particle: Particle = {
          x,
          y,
          directionX,
          directionY,
          size,
          draw() {
            ctx!.beginPath();
            ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx!.fillStyle = "#00f0ff";
            ctx!.fill();
          },
          update() {
            if (this.x > canvas!.width || this.x < 0)
              this.directionX = -this.directionX;
            if (this.y > canvas!.height || this.y < 0)
              this.directionY = -this.directionY;

            const dx = mouseRef.current.x - this.x;
            const dy = mouseRef.current.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseRef.current.radius + this.size) {
              if (
                mouseRef.current.x < this.x &&
                this.x < canvas!.width - this.size * 10
              )
                this.x += 10;
              if (mouseRef.current.x > this.x && this.x > this.size * 10)
                this.x -= 10;
              if (
                mouseRef.current.y < this.y &&
                this.y < canvas!.height - this.size * 10
              )
                this.y += 10;
              if (mouseRef.current.y > this.y && this.y > this.size * 10)
                this.y -= 10;
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
          },
        };

        particlesRef.current.push(particle);
      }
    }

    function connect() {
      const particles = particlesRef.current;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = 1 - distance / 100;
            ctx!.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.2})`;
            ctx!.lineWidth = 1;
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
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const particle of particlesRef.current) {
        particle.update();
      }
      connect();
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="neural-canvas"
      data-testid="canvas-neural-background"
    />
  );
}
