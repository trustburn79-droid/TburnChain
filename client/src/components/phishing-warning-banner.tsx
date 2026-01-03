import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, X, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface PhishingWarningBannerProps {
  variant?: "compact" | "full";
}

export function PhishingWarningBanner({ variant = "compact" }: PhishingWarningBannerProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem("tburn_phishing_warning_seen");
    if (!hasSeenWarning) {
      setIsFirstVisit(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("tburn_phishing_warning_seen", "true");
  };

  if (dismissed) return null;

  const currentDomain = typeof window !== "undefined" ? window.location.hostname : "";
  const isOfficialDomain = currentDomain === "tburn.io" || 
                           currentDomain === "localhost" || 
                           currentDomain.endsWith(".replit.dev") ||
                           currentDomain.endsWith(".replit.app");

  if (variant === "compact" && !isFirstVisit) {
    return null;
  }

  return (
    <div className={`w-full ${isOfficialDomain ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30' : 'bg-destructive/10 dark:bg-destructive/20 border-destructive/30'} border-b`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOfficialDomain ? (
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
          )}
          <p className="text-sm">
            {isOfficialDomain ? (
              <span className="text-emerald-700 dark:text-emerald-400">
                {t("security.officialSite", "You are on an official TBURN website")} 
                <span className="font-mono ml-1 text-emerald-600 dark:text-emerald-300">({currentDomain})</span>
              </span>
            ) : (
              <span className="text-destructive">
                {t("security.warningUnofficial", "Warning: This may not be an official TBURN website. Always verify the URL.")}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={() => setLocation("/official-channels")}
          >
            {t("security.verifyChannels", "Verify Channels")}
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            data-testid="button-dismiss-phishing-warning"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PhishingWarningModal() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem("tburn_phishing_warning_modal_seen");
    if (!hasSeenWarning) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("tburn_phishing_warning_modal_seen", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 dark:bg-orange-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t("security.staySecure", "Stay Secure")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("security.securityReminder", "Important Security Reminder")}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {t("security.neverShare", "Never share your seed phrase or private keys with anyone")}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {t("security.teamNeverDM", "TBURN team will never DM you first asking for funds")}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {t("security.verifyUrl", "Always verify URLs before connecting your wallet")}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {t("security.officialDomain", "Official domain:")} <span className="font-mono text-emerald-600 dark:text-emerald-400">tburn.io</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleClose}>
            {t("common.understand", "I Understand")}
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              handleClose();
              setLocation("/official-channels");
            }}
          >
            {t("security.viewChannels", "View Official Channels")}
          </Button>
        </div>
      </div>
    </div>
  );
}
