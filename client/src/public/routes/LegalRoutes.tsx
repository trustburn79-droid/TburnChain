import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const TermsOfService = lazy(() => import("../pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("../pages/legal/PrivacyPolicy"));
const Disclaimer = lazy(() => import("../pages/legal/Disclaimer"));

export default function LegalRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/legal/terms-of-service" component={TermsOfService} />
        <Route path="/legal/privacy-policy" component={PrivacyPolicy} />
        <Route path="/legal/disclaimer" component={Disclaimer} />
        <Route component={TermsOfService} />
      </Switch>
    </Suspense>
  );
}
