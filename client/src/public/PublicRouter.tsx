import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PublicLayout } from "./components/PublicLayout";
import { ErrorBoundary } from "@/components/error-boundary";

// CRITICAL: Home must be lazy-loaded to reduce initial bundle size
const Home = lazy(() => import("./pages/Home"));

function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const LearnHub = lazy(() => import("./pages/learn/LearnHub"));
const WhatIsBurnChain = lazy(() => import("./pages/learn/WhatIsBurnChain"));
const TrustScoreSystem = lazy(() => import("./pages/learn/TrustScoreSystem"));
const WhatIsWallet = lazy(() => import("./pages/learn/WhatIsWallet"));
const WalletGuide = lazy(() => import("./pages/learn/WalletGuide"));
const EducationPrograms = lazy(() => import("./pages/learn/EducationPrograms"));
const Whitepaper = lazy(() => import("./pages/learn/Whitepaper"));
const TechnicalWhitepaper = lazy(() => import("./pages/learn/TechnicalWhitepaper"));
const Tokenomics = lazy(() => import("./pages/learn/Tokenomics"));
const TokenSchedule = lazy(() => import("@/pages/token-schedule"));
const TokenDetails = lazy(() => import("@/pages/token-details"));
const Roadmap = lazy(() => import("./pages/learn/Roadmap"));
const Universities = lazy(() => import("./pages/learn/Universities"));
const BlockchainBasics = lazy(() => import("./pages/learn/BlockchainBasics"));
const DefiMastery = lazy(() => import("./pages/learn/DefiMastery"));
const DeveloperCourse = lazy(() => import("./pages/learn/DeveloperCourse"));
const IntroToDefi = lazy(() => import("./pages/learn/IntroToDefi"));

const DeveloperHub = lazy(() => import("./pages/developers/DeveloperHub"));
const Documentation = lazy(() => import("./pages/developers/Documentation"));
const ApiDocs = lazy(() => import("./pages/developers/ApiDocs"));
const CliReference = lazy(() => import("./pages/developers/CliReference"));
const SdkGuide = lazy(() => import("./pages/developers/SdkGuide"));
const SmartContracts = lazy(() => import("./pages/developers/SmartContracts"));
const WebSocketApi = lazy(() => import("./pages/developers/WebSocketApi"));
const CodeExamples = lazy(() => import("./pages/developers/CodeExamples"));
const QuickStart = lazy(() => import("./pages/developers/QuickStart"));
const InstallationGuide = lazy(() => import("./pages/developers/InstallationGuide"));
const EvmMigration = lazy(() => import("./pages/developers/EvmMigration"));

const TokenExtensions = lazy(() => import("./pages/solutions/TokenExtensions"));
const ActionsBlinks = lazy(() => import("./pages/solutions/ActionsBlinks"));
const Wallets = lazy(() => import("./pages/solutions/Wallets"));
const Permissioned = lazy(() => import("./pages/solutions/Permissioned"));
const GameTooling = lazy(() => import("./pages/solutions/GameTooling"));
const Payments = lazy(() => import("./pages/solutions/Payments"));
const Commerce = lazy(() => import("./pages/solutions/Commerce"));
const Financial = lazy(() => import("./pages/solutions/Financial"));
const AiFeatures = lazy(() => import("./pages/solutions/AiFeatures"));
const ArtistsCreators = lazy(() => import("./pages/solutions/ArtistsCreators"));
const Btcfi = lazy(() => import("./pages/solutions/Btcfi"));
const CrossChainBridge = lazy(() => import("./pages/solutions/CrossChainBridge"));
const DefiHub = lazy(() => import("./pages/solutions/DefiHub"));

const Tokenization = lazy(() => import("./pages/use-cases/Tokenization"));
const DePIN = lazy(() => import("./pages/use-cases/DePIN"));
const Stablecoins = lazy(() => import("./pages/use-cases/Stablecoins"));
const Institutional = lazy(() => import("./pages/use-cases/Institutional"));
const Enterprise = lazy(() => import("./pages/use-cases/Enterprise"));
const Gaming = lazy(() => import("./pages/use-cases/Gaming"));

const Validators = lazy(() => import("./pages/network/Validators"));
const RpcProviders = lazy(() => import("./pages/network/RpcProviders"));
const TestnetRpcProviders = lazy(() => import("./pages/network/TestnetRpcProviders"));
const NetworkStatus = lazy(() => import("./pages/network/NetworkStatus"));
const Ramp = lazy(() => import("./pages/network/Ramp"));

const NewsBlog = lazy(() => import("./pages/community/NewsBlog"));
const NewsDetail = lazy(() => import("./pages/community/NewsDetail"));
const Events = lazy(() => import("./pages/community/Events"));
const EventDetail = lazy(() => import("./pages/community/EventDetail"));
const CommunityHub = lazy(() => import("./pages/community/CommunityHub"));
const PostDetail = lazy(() => import("./pages/community/PostDetail"));

const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const Disclaimer = lazy(() => import("./pages/legal/Disclaimer"));

const ScanHome = lazy(() => import("./pages/scan/ScanHome"));
const BlocksList = lazy(() => import("./pages/scan/BlocksList"));
const BlockDetail = lazy(() => import("./pages/scan/BlockDetail"));
const TransactionsList = lazy(() => import("./pages/scan/TransactionsList"));
const TransactionDetail = lazy(() => import("./pages/scan/TransactionDetail"));
const AddressDetail = lazy(() => import("./pages/scan/AddressDetail"));
const ValidatorsList = lazy(() => import("./pages/scan/ValidatorsList"));
const ScanSearchResults = lazy(() => import("./pages/scan/SearchResults"));
const NetworkStats = lazy(() => import("./pages/scan/NetworkStats"));
const TokensList = lazy(() => import("./pages/scan/TokensList"));
const TokenDetail = lazy(() => import("./pages/scan/TokenDetail"));

const TestnetScanHome = lazy(() => import("./pages/testnet-scan/TestnetScanHome"));
const TestnetBlocksList = lazy(() => import("./pages/testnet-scan/TestnetBlocksList"));
const TestnetBlockDetail = lazy(() => import("./pages/testnet-scan/TestnetBlockDetail"));
const TestnetTransactionsList = lazy(() => import("./pages/testnet-scan/TestnetTransactionsList"));
const TestnetTransactionDetail = lazy(() => import("./pages/testnet-scan/TestnetTransactionDetail"));
const TestnetAddressDetail = lazy(() => import("./pages/testnet-scan/TestnetAddressDetail"));
const TestnetValidatorsList = lazy(() => import("./pages/testnet-scan/TestnetValidatorsList"));
const TestnetTokensList = lazy(() => import("./pages/testnet-scan/TestnetTokensList"));
const TestnetNetworkStats = lazy(() => import("./pages/testnet-scan/TestnetNetworkStats"));
const TestnetFaucet = lazy(() => import("./pages/testnet-scan/TestnetFaucet"));
const ValidatorCommandCenter = lazy(() => import("@/pages/validator"));
const ValidatorIntelligence = lazy(() => import("@/pages/validator-intelligence"));
const ValidatorGovernance = lazy(() => import("@/pages/validator-governance"));
const ValidatorInfrastructure = lazy(() => import("@/pages/validator-infrastructure"));

const Brand = lazy(() => import("./pages/Brand"));
const Login = lazy(() => import("@/pages/login"));
const TokenGenerator = lazy(() => import("@/pages/token-generator"));
const TreePage = lazy(() => import("@/pages/tree"));
const AirdropPage = lazy(() => import("@/pages/airdrop"));

function LoginPage() {
  const handleLoginSuccess = () => {
    window.location.href = "/app/dashboard";
  };
  return <Login onLoginSuccess={handleLoginSuccess} />;
}

export function PublicRouter() {
  const [location] = useLocation();
  
  if (location === "/login") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <LoginPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/token-generator") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <TokenGenerator />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/tree") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <TreePage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/airdrop") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <AirdropPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/vc") {
    window.location.href = "/validator";
    return null;
  }
  
  return (
    <ErrorBoundary>
      <PublicLayout>
        <Suspense fallback={<PageLoading />}>
          <Switch>
          <Route path="/" component={Home} />
          
          {/* Learn Routes */}
          <Route path="/learn" component={LearnHub} />
          <Route path="/learn/what-is-burn-chain" component={WhatIsBurnChain} />
          <Route path="/learn/trust-score" component={TrustScoreSystem} />
          <Route path="/learn/wallet" component={WhatIsWallet} />
          <Route path="/learn/wallet-guides/:wallet">{(params) => <WalletGuide key={params.wallet} />}</Route>
          <Route path="/learn/education" component={Universities} />
          <Route path="/learn/whitepaper" component={Whitepaper} />
          <Route path="/learn/technical-whitepaper" component={TechnicalWhitepaper} />
          <Route path="/learn/tokenomics" component={Tokenomics} />
          <Route path="/token-schedule" component={TokenSchedule} />
          <Route path="/token-details" component={TokenDetails} />
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
          <Route path="/solutions/ai-features" component={AiFeatures} />
          <Route path="/solutions/artists-creators" component={ArtistsCreators} />
          <Route path="/solutions/btcfi" component={Btcfi} />
          <Route path="/solutions/cross-chain-bridge" component={CrossChainBridge} />
          <Route path="/solutions/defi-hub" component={DefiHub} />
          
          {/* Use Cases Routes */}
          <Route path="/use-cases/tokenization" component={Tokenization} />
          <Route path="/use-cases/depin" component={DePIN} />
          <Route path="/use-cases/stablecoins" component={Stablecoins} />
          <Route path="/use-cases/institutional-payments" component={Institutional} />
          <Route path="/use-cases/enterprise" component={Enterprise} />
          <Route path="/use-cases/gaming" component={Gaming} />
          
          {/* Network Routes */}
          <Route path="/validator" component={ValidatorCommandCenter} />
          <Route path="/validator/infrastructure" component={ValidatorInfrastructure} />
          <Route path="/validator/:id" component={ValidatorIntelligence} />
          <Route path="/validator-governance" component={ValidatorGovernance} />
          <Route path="/network/validators" component={Validators} />
          <Route path="/network/rpc" component={RpcProviders} />
          <Route path="/rpc" component={RpcProviders} />
          <Route path="/network/testnet-rpc" component={TestnetRpcProviders} />
          <Route path="/testnet-rpc" component={TestnetRpcProviders} />
          <Route path="/network/status" component={NetworkStatus} />
          <Route path="/network/ramp" component={Ramp} />
          
          {/* Community Routes */}
          <Route path="/community/news/:slug">{(params) => <NewsDetail key={params.slug} />}</Route>
          <Route path="/community/news" component={NewsBlog} />
          <Route path="/community/events/:id">{(params) => <EventDetail key={params.id} />}</Route>
          <Route path="/community/events" component={Events} />
          <Route path="/community/hub/post/:id">{(params) => <PostDetail key={params.id} />}</Route>
          <Route path="/community/hub" component={CommunityHub} />
          
          {/* Legal Routes */}
          <Route path="/legal/terms-of-service" component={TermsOfService} />
          <Route path="/legal/privacy-policy" component={PrivacyPolicy} />
          <Route path="/legal/disclaimer" component={Disclaimer} />
          
          {/* Brand Assets */}
          <Route path="/brand" component={Brand} />
          
          {/* TBURNScan Explorer Routes - specific paths BEFORE base /scan */}
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
          
          {/* Testnet TBURNScan Explorer Routes */}
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
          
            {/* Fallback - redirect to home */}
            <Route>
              <Home />
            </Route>
          </Switch>
        </Suspense>
      </PublicLayout>
    </ErrorBoundary>
  );
}
