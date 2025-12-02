import { Switch, Route } from "wouter";
import { PublicLayout } from "./components/PublicLayout";

import Home from "./pages/Home";

import { LearnHub, WhatIsBurnChain, TrustScoreSystem, WhatIsWallet, EducationPrograms, Whitepaper, Tokenomics, Roadmap, Universities, BlockchainBasics, DefiMastery, DeveloperCourse, IntroToDefi } from "./pages/learn";
import { DeveloperHub, Documentation, ApiDocs, CliReference, SdkGuide, SmartContracts, WebSocketApi, CodeExamples, QuickStart, InstallationGuide, EvmMigration } from "./pages/developers";
import { TokenExtensions, ActionsBlinks, Wallets, Permissioned, GameTooling, Payments, Commerce, Financial } from "./pages/solutions";
import { Tokenization, DePIN, Stablecoins, Institutional, Enterprise, Gaming } from "./pages/use-cases";
import { Validators, RpcProviders, NetworkStatus, Ramp } from "./pages/network";
import { NewsBlog, Events, CommunityHub } from "./pages/community";

export function PublicRouter() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        
        {/* Learn Routes */}
        <Route path="/learn" component={LearnHub} />
        <Route path="/learn/what-is-burn-chain" component={WhatIsBurnChain} />
        <Route path="/learn/trust-score" component={TrustScoreSystem} />
        <Route path="/learn/wallet" component={WhatIsWallet} />
        <Route path="/learn/education" component={Universities} />
        <Route path="/learn/whitepaper" component={Whitepaper} />
        <Route path="/learn/tokenomics" component={Tokenomics} />
        <Route path="/learn/roadmap" component={Roadmap} />
        <Route path="/learn/blockchain-basics" component={BlockchainBasics} />
        <Route path="/learn/defi-mastery" component={DefiMastery} />
        <Route path="/learn/developer-course" component={DeveloperCourse} />
        <Route path="/learn/intro-to-defi" component={IntroToDefi} />
        <Route path="/learn/education-programs" component={EducationPrograms} />
        
        {/* Developer Routes */}
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
        
        {/* Solutions Routes */}
        <Route path="/solutions/token-extensions" component={TokenExtensions} />
        <Route path="/solutions/actions-blinks" component={ActionsBlinks} />
        <Route path="/solutions/wallets" component={Wallets} />
        <Route path="/solutions/permissioned" component={Permissioned} />
        <Route path="/solutions/game-tooling" component={GameTooling} />
        <Route path="/solutions/payments" component={Payments} />
        <Route path="/solutions/commerce" component={Commerce} />
        <Route path="/solutions/financial" component={Financial} />
        
        {/* Use Cases Routes */}
        <Route path="/use-cases/tokenization" component={Tokenization} />
        <Route path="/use-cases/depin" component={DePIN} />
        <Route path="/use-cases/stablecoins" component={Stablecoins} />
        <Route path="/use-cases/institutional-payments" component={Institutional} />
        <Route path="/use-cases/enterprise" component={Enterprise} />
        <Route path="/use-cases/gaming" component={Gaming} />
        
        {/* Network Routes */}
        <Route path="/network/validators" component={Validators} />
        <Route path="/network/rpc" component={RpcProviders} />
        <Route path="/network/status" component={NetworkStatus} />
        <Route path="/network/ramp" component={Ramp} />
        
        {/* Community Routes */}
        <Route path="/community/news" component={NewsBlog} />
        <Route path="/community/events" component={Events} />
        <Route path="/community/hub" component={CommunityHub} />
        
        {/* Fallback - redirect to home */}
        <Route>
          <Home />
        </Route>
      </Switch>
    </PublicLayout>
  );
}
