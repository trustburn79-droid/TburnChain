import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Web3Provider } from "@/lib/web3-context";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const PublicRouter = lazy(() => import("./public/PublicRouter").then(m => ({ default: m.PublicRouter })));

function PublicLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function PublicApp() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <Web3Provider>
              <Suspense fallback={<PublicLoading />}>
                <PublicRouter />
              </Suspense>
              <Toaster />
            </Web3Provider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
