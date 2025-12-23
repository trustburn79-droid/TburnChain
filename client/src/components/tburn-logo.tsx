export function TBurnLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="flameGradient" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="50%" stopColor="#F7931E" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
        <linearGradient id="outerGlow" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#FF4500" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#outerGlow)" opacity="0.3" />
      <circle cx="50" cy="50" r="40" stroke="url(#flameGradient)" strokeWidth="2" fill="none" />
      <path
        d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20"
        fill="url(#flameGradient)"
      />
      <path
        d="M50 35 C42 45, 38 55, 42 65 C45 72, 48 75, 50 75 C52 75, 55 72, 58 65 C62 55, 58 45, 50 35"
        fill="#FFD700"
        opacity="0.8"
      />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#1a1a2e"
        fontFamily="sans-serif"
      >
        T
      </text>
    </svg>
  );
}
