import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import TestnetRpcLayout from "../components/TestnetRpcLayout";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
    </div>
  );
}

const TestnetRpcProviders = lazy(() => import("../pages/network/TestnetRpcProviders"));
const TestnetRpcStatus = lazy(() => import("../pages/testnet-rpc/TestnetRpcStatus"));
const TestnetRpcApiDocs = lazy(() => import("../pages/testnet-rpc/TestnetRpcApiDocs"));
const TestnetRpcBenchmark = lazy(() => import("../pages/testnet-rpc/TestnetRpcBenchmark"));

export default function TestnetRpcRoutes() {
  return (
    <TestnetRpcLayout>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/testnet-rpc/status" component={TestnetRpcStatus} />
          <Route path="/testnet-rpc/docs" component={TestnetRpcApiDocs} />
          <Route path="/testnet-rpc/benchmark" component={TestnetRpcBenchmark} />
          <Route path="/testnet-rpc/faucet" component={TestnetRpcProviders} />
          <Route path="/testnet-rpc" component={TestnetRpcProviders} />
          <Route component={TestnetRpcProviders} />
        </Switch>
      </Suspense>
    </TestnetRpcLayout>
  );
}
