interface TBurnLogoProps {
  className?: string;
  symbolColor?: string;
}

export function TBurnLogo({ className, symbolColor }: TBurnLogoProps) {
  const useGradient = !symbolColor;
  const uniqueId = Math.random().toString(36).substr(2, 9);
  
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {useGradient && (
        <defs>
          <linearGradient id={`flameGradient-${uniqueId}`} x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="50%" stopColor="#F7931E" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          <linearGradient id={`outerGlow-${uniqueId}`} x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#FF4500" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      )}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill={useGradient ? `url(#outerGlow-${uniqueId})` : symbolColor} 
        opacity="0.3" 
      />
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        stroke={useGradient ? `url(#flameGradient-${uniqueId})` : symbolColor} 
        strokeWidth="2" 
        fill="none" 
      />
      <path
        d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20"
        fill={useGradient ? `url(#flameGradient-${uniqueId})` : symbolColor}
      />
      <path
        d="M50 35 C42 45, 38 55, 42 65 C45 72, 48 75, 50 75 C52 75, 55 72, 58 65 C62 55, 58 45, 50 35"
        fill={useGradient ? "#FFD700" : symbolColor}
        opacity={useGradient ? 0.8 : 0.6}
      />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill={symbolColor ? (isLightColor(symbolColor) ? "#1a1a2e" : "#ffffff") : "#1a1a2e"}
        fontFamily="sans-serif"
      >
        T
      </text>
    </svg>
  );
}

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
