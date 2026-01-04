import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import RpcLayout from "../components/RpcLayout";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
    </div>
  );
}

const RpcProviders = lazy(() => import("../pages/network/RpcProviders"));
const RpcStatus = lazy(() => import("../pages/rpc/RpcStatus"));
const RpcApiDocs = lazy(() => import("../pages/rpc/RpcApiDocs"));
const RpcBenchmark = lazy(() => import("../pages/rpc/RpcBenchmark"));

export default function RpcRoutes() {
  return (
    <RpcLayout>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/rpc/status" component={RpcStatus} />
          <Route path="/rpc/docs" component={RpcApiDocs} />
          <Route path="/rpc/benchmark" component={RpcBenchmark} />
          <Route path="/rpc" component={RpcProviders} />
          <Route component={RpcProviders} />
        </Switch>
      </Suspense>
    </RpcLayout>
  );
}
