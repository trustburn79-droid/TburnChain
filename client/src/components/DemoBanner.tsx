import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface DemoBannerProps {
  isLiveMode?: boolean;
}

export function DemoBanner({ isLiveMode = true }: DemoBannerProps) {
  const { t } = useTranslation();
  
  if (isLiveMode) {
    return (
      <Alert 
        className="rounded-none border-l-0 border-r-0 border-t-0 border-b-4 border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700"
        data-testid="banner-production-mode"
      >
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
        <AlertDescription className="ml-2 text-green-800 dark:text-green-200 font-medium">
          <span className="font-bold">{t('common.liveMode', 'LIVE MODE')}</span> | {t('common.connectedToMainnet', 'Connected to TBURN mainnet node')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert 
      className="rounded-none border-l-0 border-r-0 border-t-0 border-b-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700"
      data-testid="banner-demo-mode"
    >
      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
      <AlertDescription className="ml-2 text-yellow-800 dark:text-yellow-200 font-medium">
        <span className="font-bold">{t('common.demoMode', 'DEMO MODE')}</span> | {t('common.demoModeDescription', 'This explorer uses simulated data for demonstration purposes')}
      </AlertDescription>
    </Alert>
  );
}
