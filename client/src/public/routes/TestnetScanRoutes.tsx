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

const TestnetScanHome = lazy(() => import("../pages/testnet-scan/TestnetScanHome"));
const TestnetBlocksList = lazy(() => import("../pages/testnet-scan/TestnetBlocksList"));
const TestnetBlockDetail = lazy(() => import("../pages/testnet-scan/TestnetBlockDetail"));
const TestnetTransactionsList = lazy(() => import("../pages/testnet-scan/TestnetTransactionsList"));
const TestnetTransactionDetail = lazy(() => import("../pages/testnet-scan/TestnetTransactionDetail"));
const TestnetAddressDetail = lazy(() => import("../pages/testnet-scan/TestnetAddressDetail"));
const TestnetValidatorsList = lazy(() => import("../pages/testnet-scan/TestnetValidatorsList"));
const TestnetTokensList = lazy(() => import("../pages/testnet-scan/TestnetTokensList"));
const TestnetNetworkStats = lazy(() => import("../pages/testnet-scan/TestnetNetworkStats"));
const TestnetFaucet = lazy(() => import("../pages/testnet-scan/TestnetFaucet"));

export default function TestnetScanRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/testnet-scan/blocks" component={TestnetBlocksList} />
        <Route path="/testnet-scan/block/:blockNumber">{(params) => <TestnetBlockDetail key={params.blockNumber} />}</Route>
        <Route path="/testnet-scan/txs" component={TestnetTransactionsList} />
        <Route path="/testnet-scan/tx/:hash">{(params) => <TestnetTransactionDetail key={params.hash} />}</Route>
        <Route path="/testnet-scan/address/:address">{(params) => <TestnetAddressDetail key={params.address} />}</Route>
        <Route path="/testnet-scan/validators" component={TestnetValidatorsList} />
        <Route path="/testnet-scan/tokens" component={TestnetTokensList} />
        <Route path="/testnet-scan/stats" component={TestnetNetworkStats} />
        <Route path="/testnet-scan/faucet" component={TestnetFaucet} />
        <Route path="/testnet-scan" component={TestnetScanHome} />
        <Route component={TestnetScanHome} />
      </Switch>
    </Suspense>
  );
}
