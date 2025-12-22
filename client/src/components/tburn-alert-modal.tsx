import { useState, createContext, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, XCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "info" | "success" | "warning" | "error" | "wallet";

interface AlertModalState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  description: string;
}

interface TBurnAlertContextType {
  showAlert: (type: AlertType, title: string, description: string) => void;
  hideAlert: () => void;
}

const TBurnAlertContext = createContext<TBurnAlertContextType | null>(null);

export function useTBurnAlert() {
  const context = useContext(TBurnAlertContext);
  if (!context) {
    throw new Error("useTBurnAlert must be used within TBurnAlertProvider");
  }
  return context;
}

function TBurnLogo({ className }: { className?: string }) {
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

function AlertIcon({ type, className }: { type: AlertType; className?: string }) {
  const iconProps = { className: cn("h-6 w-6", className) };
  
  switch (type) {
    case "success":
      return <CheckCircle {...iconProps} className={cn(iconProps.className, "text-green-500")} />;
    case "warning":
      return <AlertTriangle {...iconProps} className={cn(iconProps.className, "text-yellow-500")} />;
    case "error":
      return <XCircle {...iconProps} className={cn(iconProps.className, "text-red-500")} />;
    case "wallet":
      return <Wallet {...iconProps} className={cn(iconProps.className, "text-orange-500")} />;
    default:
      return <Info {...iconProps} className={cn(iconProps.className, "text-blue-500")} />;
  }
}

export function TBurnAlertProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [alertState, setAlertState] = useState<AlertModalState>({
    isOpen: false,
    type: "info",
    title: "",
    description: "",
  });

  const showAlert = useCallback((type: AlertType, title: string, description: string) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      description,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <TBurnAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Dialog open={alertState.isOpen} onOpenChange={(open) => !open && hideAlert()}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-card via-card to-card/95 border border-border/50 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 rounded-lg pointer-events-none" />
          
          <DialogHeader className="relative z-10 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
                <TBurnLogo className="h-16 w-16 relative z-10" />
              </div>
              
              <div className="flex items-center gap-2">
                <AlertIcon type={alertState.type} />
                <DialogTitle className="text-xl font-bold text-foreground">
                  {alertState.title}
                </DialogTitle>
              </div>
            </div>
            
            <DialogDescription className="text-center text-muted-foreground text-sm leading-relaxed">
              {alertState.description}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="relative z-10 mt-4 flex justify-center sm:justify-center">
            <Button
              onClick={hideAlert}
              className="min-w-[120px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg"
              data-testid="button-alert-confirm"
            >
              {t("common.confirm", "확인")}
            </Button>
          </DialogFooter>
          
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-b-lg opacity-60" />
        </DialogContent>
      </Dialog>
    </TBurnAlertContext.Provider>
  );
}
