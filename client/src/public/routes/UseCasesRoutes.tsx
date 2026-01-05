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

const Tokenization = lazy(() => import("../pages/use-cases/Tokenization"));
const DePIN = lazy(() => import("../pages/use-cases/DePIN"));
const Stablecoins = lazy(() => import("../pages/use-cases/Stablecoins"));
const Institutional = lazy(() => import("../pages/use-cases/Institutional"));
const Enterprise = lazy(() => import("../pages/use-cases/Enterprise"));
const Gaming = lazy(() => import("../pages/use-cases/Gaming"));
const NotFound = lazy(() => import("@/pages/not-found"));

export default function UseCasesRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/use-cases" component={Tokenization} />
        <Route path="/use-cases/tokenization" component={Tokenization} />
        <Route path="/use-cases/depin" component={DePIN} />
        <Route path="/use-cases/stablecoins" component={Stablecoins} />
        <Route path="/use-cases/institutional-payments" component={Institutional} />
        <Route path="/use-cases/enterprise" component={Enterprise} />
        <Route path="/use-cases/gaming" component={Gaming} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
