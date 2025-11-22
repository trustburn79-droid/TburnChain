import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DemoBanner() {
  return (
    <Alert 
      className="rounded-none border-l-0 border-r-0 border-t-0 border-b-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700"
      data-testid="banner-demo-mode"
    >
      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
      <AlertDescription className="ml-2 text-yellow-800 dark:text-yellow-200 font-medium">
        <span className="font-bold">DEMO MODE</span> — This explorer uses simulated data for demonstration purposes. 
        For production deployment, connect to a real TBURN blockchain node.
      </AlertDescription>
    </Alert>
  );
}
