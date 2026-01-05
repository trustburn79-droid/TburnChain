import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Web3Provider } from "@/lib/web3-context";
import { TBurnAlertProvider } from "@/components/tburn-alert-modal";
import { lazy, Suspense, useEffect } from "react";
import { TBurnLoader } from "@/components/tburn-loader";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

const PublicRouter = lazy(() => import("./public/PublicRouter").then(m => ({ default: m.PublicRouter })));

function PublicLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <TBurnLoader size="lg" />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  
  return null;
}

export default function PublicApp() {
  const { i18n } = useTranslation();
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <TBurnAlertProvider>
              <Web3Provider>
                <div key={i18n.language}>
                  <ScrollToTop />
                  <Suspense fallback={<PublicLoading />}>
                    <PublicRouter />
                  </Suspense>
                  <Toaster />
                </div>
              </Web3Provider>
            </TBurnAlertProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
