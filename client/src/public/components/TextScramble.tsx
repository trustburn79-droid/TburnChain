import { useEffect, useRef, useState } from "react";

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

interface CharElement {
  char: string;
  isScramble: boolean;
}

const chars = "!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function TextScramble({ text, className = "", delay = 0, speed = 30 }: TextScrambleProps) {
  const [displayElements, setDisplayElements] = useState<CharElement[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number>();
  const queueRef = useRef<Array<{ from: string; to: string; start: number; end: number; char?: string }>>([]);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const startAnimation = () => {
      queueRef.current = [];
      const oldText = "";
      const newText = text;
      const length = Math.max(oldText.length, newText.length);

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || "";
        const to = newText[i] || "";
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        queueRef.current.push({ from, to, start, end });
      }

      frameCountRef.current = 0;
      setIsComplete(false);
      update();
    };

    const update = () => {
      const output: CharElement[] = [];
      let complete = 0;

      for (let i = 0; i < queueRef.current.length; i++) {
        const item = queueRef.current[i];
        const { from, to, start, end } = item;

        if (frameCountRef.current >= end) {
          complete++;
          output.push({ char: to, isScramble: false });
        } else if (frameCountRef.current >= start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = chars[Math.floor(Math.random() * chars.length)];
          }
          output.push({ char: item.char, isScramble: true });
        } else {
          output.push({ char: from, isScramble: false });
        }
      }

      setDisplayElements(output);

      if (complete === queueRef.current.length) {
        setIsComplete(true);
      } else {
        frameCountRef.current++;
        frameRef.current = requestAnimationFrame(() => {
          setTimeout(update, speed);
        });
      }
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [text, delay, speed]);

  return (
    <span className={className} data-text={text}>
      {displayElements.map((el, i) => (
        el.isScramble ? (
          <span key={i} className="text-cyan-400/70">{el.char}</span>
        ) : (
          <span key={i}>{el.char}</span>
        )
      ))}
    </span>
  );
}

export function ScrambleTitle({ children, className = "" }: { children: string; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!isVisible) {
    return (
      <span ref={ref} className={className} style={{ visibility: "hidden" }}>
        {children}
      </span>
    );
  }

  return <TextScramble text={children} className={className} />;
}
