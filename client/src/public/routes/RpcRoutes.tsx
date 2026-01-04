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

export default function RpcRoutes() {
  return (
    <RpcLayout>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/rpc/status" component={RpcProviders} />
          <Route path="/rpc/docs" component={RpcProviders} />
          <Route path="/rpc/benchmark" component={RpcProviders} />
          <Route path="/rpc" component={RpcProviders} />
          <Route component={RpcProviders} />
        </Switch>
      </Suspense>
    </RpcLayout>
  );
}
