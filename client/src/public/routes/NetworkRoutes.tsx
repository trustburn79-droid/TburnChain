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

const NetworkDashboard = lazy(() => import("../pages/network/NetworkDashboard"));
const Validators = lazy(() => import("../pages/network/Validators"));
const RpcProviders = lazy(() => import("../pages/network/RpcProviders"));
const TestnetRpcProviders = lazy(() => import("../pages/network/TestnetRpcProviders"));
const WebSocketMainnet = lazy(() => import("../pages/network/WebSocketMainnet"));
const WebSocketTestnet = lazy(() => import("../pages/network/WebSocketTestnet"));
const NetworkStatus = lazy(() => import("../pages/network/NetworkStatus"));
const Ramp = lazy(() => import("../pages/network/Ramp"));
const ValidatorCommandCenter = lazy(() => import("@/pages/validator"));
const ValidatorIntelligence = lazy(() => import("@/pages/validator-intelligence"));
const ValidatorGovernance = lazy(() => import("@/pages/validator-governance"));
const ValidatorInfrastructure = lazy(() => import("@/pages/validator-infrastructure"));
const NotFound = lazy(() => import("@/pages/not-found"));

export default function NetworkRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/validator" component={ValidatorCommandCenter} />
        <Route path="/validator/infrastructure" component={ValidatorInfrastructure} />
        <Route path="/validator/:id" component={ValidatorIntelligence} />
        <Route path="/validator-governance" component={ValidatorGovernance} />
        <Route path="/network" component={NetworkDashboard} />
        <Route path="/network/validators" component={Validators} />
        <Route path="/network/rpc" component={RpcProviders} />
        <Route path="/rpc" component={RpcProviders} />
        <Route path="/network/testnet-rpc" component={TestnetRpcProviders} />
        <Route path="/testnet-rpc" component={TestnetRpcProviders} />
        <Route path="/websocket" component={WebSocketMainnet} />
        <Route path="/network/websocket" component={WebSocketMainnet} />
        <Route path="/testnet-websocket" component={WebSocketTestnet} />
        <Route path="/network/testnet-websocket" component={WebSocketTestnet} />
        <Route path="/network/status" component={NetworkStatus} />
        <Route path="/network/ramp" component={Ramp} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
