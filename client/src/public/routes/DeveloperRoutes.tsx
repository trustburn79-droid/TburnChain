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

const DeveloperHub = lazy(() => import("../pages/developers/DeveloperHub"));
const Documentation = lazy(() => import("../pages/developers/Documentation"));
const ApiDocs = lazy(() => import("../pages/developers/ApiDocs"));
const CliReference = lazy(() => import("../pages/developers/CliReference"));
const SdkGuide = lazy(() => import("../pages/developers/SdkGuide"));
const SmartContracts = lazy(() => import("../pages/developers/SmartContracts"));
const WebSocketApi = lazy(() => import("../pages/developers/WebSocketApi"));
const CodeExamples = lazy(() => import("../pages/developers/CodeExamples"));
const QuickStart = lazy(() => import("../pages/developers/QuickStart"));
const InstallationGuide = lazy(() => import("../pages/developers/InstallationGuide"));
const EvmMigration = lazy(() => import("../pages/developers/EvmMigration"));

export default function DeveloperRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/developers" component={DeveloperHub} />
        <Route path="/developers/docs" component={Documentation} />
        <Route path="/developers/api" component={ApiDocs} />
        <Route path="/developers/cli" component={CliReference} />
        <Route path="/developers/sdk" component={SdkGuide} />
        <Route path="/developers/contracts" component={SmartContracts} />
        <Route path="/developers/websocket" component={WebSocketApi} />
        <Route path="/developers/examples" component={CodeExamples} />
        <Route path="/developers/quickstart" component={QuickStart} />
        <Route path="/developers/installation" component={InstallationGuide} />
        <Route path="/developers/evm-migration" component={EvmMigration} />
        <Route component={DeveloperHub} />
      </Switch>
    </Suspense>
  );
}
