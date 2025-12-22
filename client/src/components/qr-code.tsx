import { useState, useEffect } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  "data-testid"?: string;
}

export function QRCodeDisplay({ 
  value, 
  size = 160, 
  className = "",
  "data-testid": testId
}: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!value) {
      setError(true);
      return;
    }

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setDataUrl(url);
        setError(false);
      })
      .catch(() => {
        setError(true);
      });
  }, [value, size]);

  if (error || !dataUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded ${className}`}
        style={{ width: size, height: size }}
        data-testid={testId}
      >
        <span className="text-xs text-muted-foreground">QR</span>
      </div>
    );
  }

  return (
    <img 
      src={dataUrl} 
      alt="QR Code" 
      width={size} 
      height={size}
      className={className}
      data-testid={testId}
    />
  );
}
