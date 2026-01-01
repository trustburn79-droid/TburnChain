import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PublicLayout } from "./components/PublicLayout";
import { ErrorBoundary } from "@/components/error-boundary";

import Home from "./pages/Home";

function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// 동적 임포트 재시도 래퍼 - 청크 로딩 실패 시 자동 새로고침
function lazyWithRetry<T extends { default: React.ComponentType<unknown> }>(
  importFn: () => Promise<T>,
  retries = 2
): React.LazyExoticComponent<T["default"]> {
  return lazy(async () => {
    for (let i = 0; i <= retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        const isLastAttempt = i === retries;
        const isChunkError = error instanceof Error && (
          error.message.includes('dynamically imported module') ||
          error.message.includes('Loading chunk') ||
          error.message.includes('Failed to fetch')
        );
        
        if (isChunkError && !isLastAttempt) {
          // 잠시 대기 후 재시도
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        if (isChunkError && isLastAttempt) {
          // 최종 실패 시 캐시 버스팅으로 새로고침
          console.error('[LazyLoad] Chunk load failed after retries, reloading...', error);
          window.location.href = window.location.pathname + '?_cb=' + Date.now();
          // 새로고침 완료까지 대기
          await new Promise(() => {});
        }
        
        throw error;
      }
    }
    throw new Error('Import failed');
  });
}

const LearnHub = lazyWithRetry(() => import("./pages/learn/LearnHub"));
const WhatIsBurnChain = lazyWithRetry(() => import("./pages/learn/WhatIsBurnChain"));
const TrustScoreSystem = lazyWithRetry(() => import("./pages/learn/TrustScoreSystem"));
const WhatIsWallet = lazyWithRetry(() => import("./pages/learn/WhatIsWallet"));
const WalletGuide = lazyWithRetry(() => import("./pages/learn/WalletGuide"));
const EducationPrograms = lazyWithRetry(() => import("./pages/learn/EducationPrograms"));
const Whitepaper = lazyWithRetry(() => import("./pages/learn/Whitepaper"));
const TechnicalWhitepaper = lazyWithRetry(() => import("./pages/learn/TechnicalWhitepaper"));
const Tokenomics = lazyWithRetry(() => import("./pages/learn/Tokenomics"));
const TokenSchedule = lazyWithRetry(() => import("@/pages/token-schedule"));
const TokenDetails = lazyWithRetry(() => import("@/pages/token-details"));
const Roadmap = lazyWithRetry(() => import("./pages/learn/Roadmap"));
const Universities = lazyWithRetry(() => import("./pages/learn/Universities"));
const BlockchainBasics = lazyWithRetry(() => import("./pages/learn/BlockchainBasics"));
const DefiMastery = lazyWithRetry(() => import("./pages/learn/DefiMastery"));
const DeveloperCourse = lazyWithRetry(() => import("./pages/learn/DeveloperCourse"));
const IntroToDefi = lazyWithRetry(() => import("./pages/learn/IntroToDefi"));

const DeveloperHub = lazyWithRetry(() => import("./pages/developers/DeveloperHub"));
const Documentation = lazyWithRetry(() => import("./pages/developers/Documentation"));
const ApiDocs = lazyWithRetry(() => import("./pages/developers/ApiDocs"));
const CliReference = lazyWithRetry(() => import("./pages/developers/CliReference"));
const SdkGuide = lazyWithRetry(() => import("./pages/developers/SdkGuide"));
const SmartContracts = lazyWithRetry(() => import("./pages/developers/SmartContracts"));
const WebSocketApi = lazyWithRetry(() => import("./pages/developers/WebSocketApi"));
const CodeExamples = lazyWithRetry(() => import("./pages/developers/CodeExamples"));
const QuickStart = lazyWithRetry(() => import("./pages/developers/QuickStart"));
const InstallationGuide = lazyWithRetry(() => import("./pages/developers/InstallationGuide"));
const EvmMigration = lazyWithRetry(() => import("./pages/developers/EvmMigration"));

const TokenExtensions = lazyWithRetry(() => import("./pages/solutions/TokenExtensions"));
const ActionsBlinks = lazyWithRetry(() => import("./pages/solutions/ActionsBlinks"));
const Wallets = lazyWithRetry(() => import("./pages/solutions/Wallets"));
const Permissioned = lazyWithRetry(() => import("./pages/solutions/Permissioned"));
const GameTooling = lazyWithRetry(() => import("./pages/solutions/GameTooling"));
const Payments = lazyWithRetry(() => import("./pages/solutions/Payments"));
const Commerce = lazyWithRetry(() => import("./pages/solutions/Commerce"));
const Financial = lazyWithRetry(() => import("./pages/solutions/Financial"));
const AiFeatures = lazyWithRetry(() => import("./pages/solutions/AiFeatures"));
const ArtistsCreators = lazyWithRetry(() => import("./pages/solutions/ArtistsCreators"));
const Btcfi = lazyWithRetry(() => import("./pages/solutions/Btcfi"));
const CrossChainBridge = lazyWithRetry(() => import("./pages/solutions/CrossChainBridge"));
const DefiHub = lazyWithRetry(() => import("./pages/solutions/DefiHub"));

const Tokenization = lazyWithRetry(() => import("./pages/use-cases/Tokenization"));
const DePIN = lazyWithRetry(() => import("./pages/use-cases/DePIN"));
const Stablecoins = lazyWithRetry(() => import("./pages/use-cases/Stablecoins"));
const Institutional = lazyWithRetry(() => import("./pages/use-cases/Institutional"));
const Enterprise = lazyWithRetry(() => import("./pages/use-cases/Enterprise"));
const Gaming = lazyWithRetry(() => import("./pages/use-cases/Gaming"));

const Validators = lazyWithRetry(() => import("./pages/network/Validators"));
const RpcProviders = lazyWithRetry(() => import("./pages/network/RpcProviders"));
const TestnetRpcProviders = lazyWithRetry(() => import("./pages/network/TestnetRpcProviders"));
const NetworkStatus = lazyWithRetry(() => import("./pages/network/NetworkStatus"));
const Ramp = lazyWithRetry(() => import("./pages/network/Ramp"));

const NewsBlog = lazyWithRetry(() => import("./pages/community/NewsBlog"));
const NewsDetail = lazyWithRetry(() => import("./pages/community/NewsDetail"));
const Events = lazyWithRetry(() => import("./pages/community/Events"));
const EventDetail = lazyWithRetry(() => import("./pages/community/EventDetail"));
const CommunityHub = lazyWithRetry(() => import("./pages/community/CommunityHub"));
const PostDetail = lazyWithRetry(() => import("./pages/community/PostDetail"));

const TermsOfService = lazyWithRetry(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/legal/PrivacyPolicy"));
const Disclaimer = lazyWithRetry(() => import("./pages/legal/Disclaimer"));

const ScanHome = lazyWithRetry(() => import("./pages/scan/ScanHome"));
const BlocksList = lazyWithRetry(() => import("./pages/scan/BlocksList"));
const BlockDetail = lazyWithRetry(() => import("./pages/scan/BlockDetail"));
const TransactionsList = lazyWithRetry(() => import("./pages/scan/TransactionsList"));
const TransactionDetail = lazyWithRetry(() => import("./pages/scan/TransactionDetail"));
const AddressDetail = lazyWithRetry(() => import("./pages/scan/AddressDetail"));
const ValidatorsList = lazyWithRetry(() => import("./pages/scan/ValidatorsList"));
const ScanSearchResults = lazyWithRetry(() => import("./pages/scan/SearchResults"));
const NetworkStats = lazyWithRetry(() => import("./pages/scan/NetworkStats"));
const TokensList = lazyWithRetry(() => import("./pages/scan/TokensList"));
const TokenDetail = lazyWithRetry(() => import("./pages/scan/TokenDetail"));

const TestnetScanHome = lazyWithRetry(() => import("./pages/testnet-scan/TestnetScanHome"));
const TestnetBlocksList = lazyWithRetry(() => import("./pages/testnet-scan/TestnetBlocksList"));
const TestnetBlockDetail = lazyWithRetry(() => import("./pages/testnet-scan/TestnetBlockDetail"));
const TestnetTransactionsList = lazyWithRetry(() => import("./pages/testnet-scan/TestnetTransactionsList"));
const TestnetTransactionDetail = lazyWithRetry(() => import("./pages/testnet-scan/TestnetTransactionDetail"));
const TestnetAddressDetail = lazyWithRetry(() => import("./pages/testnet-scan/TestnetAddressDetail"));
const TestnetValidatorsList = lazyWithRetry(() => import("./pages/testnet-scan/TestnetValidatorsList"));
const TestnetTokensList = lazyWithRetry(() => import("./pages/testnet-scan/TestnetTokensList"));
const TestnetNetworkStats = lazyWithRetry(() => import("./pages/testnet-scan/TestnetNetworkStats"));
const TestnetFaucet = lazyWithRetry(() => import("./pages/testnet-scan/TestnetFaucet"));
const ValidatorCommandCenter = lazyWithRetry(() => import("@/pages/validator"));
const ValidatorInfrastructure = lazyWithRetry(() => import("@/pages/validator-infrastructure"));
const ValidatorNodeDetail = lazyWithRetry(() => import("@/pages/validator-node-detail"));
const ValidatorGovernance = lazyWithRetry(() => import("@/pages/validator-governance"));

export function PublicRouter() {
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
          <Route path="/validator/governance" component={ValidatorGovernance} />
          <Route path="/validator/:id">{(params) => <ValidatorNodeDetail key={params.id} />}</Route>
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
