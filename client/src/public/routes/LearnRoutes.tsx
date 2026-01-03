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

const LearnHub = lazy(() => import("../pages/learn/LearnHub"));
const WhatIsBurnChain = lazy(() => import("../pages/learn/WhatIsBurnChain"));
const TrustScoreSystem = lazy(() => import("../pages/learn/TrustScoreSystem"));
const WhatIsWallet = lazy(() => import("../pages/learn/WhatIsWallet"));
const WalletGuide = lazy(() => import("../pages/learn/WalletGuide"));
const EducationPrograms = lazy(() => import("../pages/learn/EducationPrograms"));
const Whitepaper = lazy(() => import("../pages/learn/Whitepaper"));
const TechnicalWhitepaper = lazy(() => import("../pages/learn/TechnicalWhitepaper"));
const Tokenomics = lazy(() => import("../pages/learn/Tokenomics"));
const Roadmap = lazy(() => import("../pages/learn/Roadmap"));
const Universities = lazy(() => import("../pages/learn/Universities"));
const BlockchainBasics = lazy(() => import("../pages/learn/BlockchainBasics"));
const DefiMastery = lazy(() => import("../pages/learn/DefiMastery"));
const DeveloperCourse = lazy(() => import("../pages/learn/DeveloperCourse"));
const IntroToDefi = lazy(() => import("../pages/learn/IntroToDefi"));

export default function LearnRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/learn" component={LearnHub} />
        <Route path="/learn/what-is-burn-chain" component={WhatIsBurnChain} />
        <Route path="/learn/trust-score" component={TrustScoreSystem} />
        <Route path="/learn/wallet" component={WhatIsWallet} />
        <Route path="/learn/wallet-guides/:wallet">{(params) => <WalletGuide key={params.wallet} />}</Route>
        <Route path="/learn/education" component={Universities} />
        <Route path="/learn/whitepaper" component={Whitepaper} />
        <Route path="/learn/technical-whitepaper" component={TechnicalWhitepaper} />
        <Route path="/learn/tokenomics" component={Tokenomics} />
        <Route path="/learn/roadmap" component={Roadmap} />
        <Route path="/learn/blockchain-basics" component={BlockchainBasics} />
        <Route path="/learn/defi-mastery" component={DefiMastery} />
        <Route path="/learn/developer-course" component={DeveloperCourse} />
        <Route path="/learn/intro-to-defi" component={IntroToDefi} />
        <Route path="/learn/education-programs" component={EducationPrograms} />
        <Route component={LearnHub} />
      </Switch>
    </Suspense>
  );
}
