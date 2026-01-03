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

const TokenExtensions = lazy(() => import("../pages/solutions/TokenExtensions"));
const ActionsBlinks = lazy(() => import("../pages/solutions/ActionsBlinks"));
const Wallets = lazy(() => import("../pages/solutions/Wallets"));
const Permissioned = lazy(() => import("../pages/solutions/Permissioned"));
const GameTooling = lazy(() => import("../pages/solutions/GameTooling"));
const Payments = lazy(() => import("../pages/solutions/Payments"));
const Commerce = lazy(() => import("../pages/solutions/Commerce"));
const Financial = lazy(() => import("../pages/solutions/Financial"));
const AiFeatures = lazy(() => import("../pages/solutions/AiFeatures"));
const ArtistsCreators = lazy(() => import("../pages/solutions/ArtistsCreators"));
const Btcfi = lazy(() => import("../pages/solutions/Btcfi"));
const CrossChainBridge = lazy(() => import("../pages/solutions/CrossChainBridge"));
const DefiHub = lazy(() => import("../pages/solutions/DefiHub"));

export default function SolutionsRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/solutions/token-extensions" component={TokenExtensions} />
        <Route path="/solutions/actions-blinks" component={ActionsBlinks} />
        <Route path="/solutions/wallets" component={Wallets} />
        <Route path="/solutions/permissioned" component={Permissioned} />
        <Route path="/solutions/game-tooling" component={GameTooling} />
        <Route path="/solutions/payments" component={Payments} />
        <Route path="/solutions/commerce" component={Commerce} />
        <Route path="/solutions/financial" component={Financial} />
        <Route path="/solutions/ai-features" component={AiFeatures} />
        <Route path="/solutions/artists-creators" component={ArtistsCreators} />
        <Route path="/solutions/btcfi" component={Btcfi} />
        <Route path="/solutions/cross-chain-bridge" component={CrossChainBridge} />
        <Route path="/solutions/defi-hub" component={DefiHub} />
        <Route component={TokenExtensions} />
      </Switch>
    </Suspense>
  );
}
