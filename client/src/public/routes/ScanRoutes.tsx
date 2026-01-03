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

const ScanHome = lazy(() => import("../pages/scan/ScanHome"));
const BlocksList = lazy(() => import("../pages/scan/BlocksList"));
const BlockDetail = lazy(() => import("../pages/scan/BlockDetail"));
const TransactionsList = lazy(() => import("../pages/scan/TransactionsList"));
const TransactionDetail = lazy(() => import("../pages/scan/TransactionDetail"));
const AddressDetail = lazy(() => import("../pages/scan/AddressDetail"));
const ValidatorsList = lazy(() => import("../pages/scan/ValidatorsList"));
const ScanSearchResults = lazy(() => import("../pages/scan/SearchResults"));
const NetworkStats = lazy(() => import("../pages/scan/NetworkStats"));
const TokensList = lazy(() => import("../pages/scan/TokensList"));
const TokenDetail = lazy(() => import("../pages/scan/TokenDetail"));

export default function ScanRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/scan/blocks" component={BlocksList} />
        <Route path="/scan/block/:blockNumber">{(params) => <BlockDetail key={params.blockNumber} />}</Route>
        <Route path="/scan/txs" component={TransactionsList} />
        <Route path="/scan/tx/:hash">{(params) => <TransactionDetail key={params.hash} />}</Route>
        <Route path="/scan/address/:address">{(params) => <AddressDetail key={params.address} />}</Route>
        <Route path="/scan/validators" component={ValidatorsList} />
        <Route path="/scan/token/:address">{(params) => <TokenDetail key={params.address} />}</Route>
        <Route path="/scan/tokens" component={TokensList} />
        <Route path="/scan/stats" component={NetworkStats} />
        <Route path="/scan/search" component={ScanSearchResults} />
        <Route path="/scan" component={ScanHome} />
        <Route component={ScanHome} />
      </Switch>
    </Suspense>
  );
}
