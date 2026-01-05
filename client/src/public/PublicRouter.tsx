import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PublicLayout } from "./components/PublicLayout";
import { ErrorBoundary } from "@/components/error-boundary";

function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("@/pages/login"));
const TokenGenerator = lazy(() => import("@/pages/token-generator"));
const TreePage = lazy(() => import("@/pages/tree"));

const AirdropPage = lazy(() => import("@/pages/airdrop"));
const AirdropClaimPage = lazy(() => import("@/pages/airdrop-claim"));
const ReferralPage = lazy(() => import("@/pages/referral"));
const EventsPage = lazy(() => import("@/pages/events"));
const CommunityProgramPage = lazy(() => import("@/pages/community-program"));
const DAOGovernancePage = lazy(() => import("@/pages/dao-governance"));
const BlockRewardsPage = lazy(() => import("@/pages/block-rewards"));
const ValidatorIncentivesPage = lazy(() => import("@/pages/validator-incentives"));
const EcosystemFundPage = lazy(() => import("@/pages/ecosystem-fund"));
const PartnershipProgramPage = lazy(() => import("@/pages/partnership-program"));
const MarketingProgramPage = lazy(() => import("@/pages/marketing-program"));
const StrategicPartnerPage = lazy(() => import("@/pages/strategic-partner"));
const AdvisorProgramPage = lazy(() => import("@/pages/advisor-program"));
const SeedRoundPage = lazy(() => import("@/pages/seed-round"));
const PrivateRoundPage = lazy(() => import("@/pages/private-round"));
const PublicRoundPage = lazy(() => import("@/pages/public-round"));
const LaunchpadPage = lazy(() => import("@/pages/launchpad"));
const CoinListPage = lazy(() => import("@/pages/coinlist"));
const DAOMakerPage = lazy(() => import("@/pages/dao-maker"));

const LearnRoutes = lazy(() => import("./routes/LearnRoutes"));
const DeveloperRoutes = lazy(() => import("./routes/DeveloperRoutes"));
const SolutionsRoutes = lazy(() => import("./routes/SolutionsRoutes"));
const UseCasesRoutes = lazy(() => import("./routes/UseCasesRoutes"));
const NetworkRoutes = lazy(() => import("./routes/NetworkRoutes"));
const CommunityRoutes = lazy(() => import("./routes/CommunityRoutes"));
const LegalRoutes = lazy(() => import("./routes/LegalRoutes"));
const ScanRoutes = lazy(() => import("./routes/ScanRoutes"));
const TestnetScanRoutes = lazy(() => import("./routes/TestnetScanRoutes"));
const RpcRoutes = lazy(() => import("./routes/RpcRoutes"));
const TestnetRpcRoutes = lazy(() => import("./routes/TestnetRpcRoutes"));
const NftMarketplaceStandalone = lazy(() => import("@/pages/nft-marketplace-standalone"));

const Brand = lazy(() => import("./pages/Brand"));

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
  
  if (location === "/airdrop-claim") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <AirdropClaimPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/referral") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <ReferralPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/events") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <EventsPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/community-program") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <CommunityProgramPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/dao-governance") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <DAOGovernancePage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/block-rewards") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <BlockRewardsPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/validator-incentives") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <ValidatorIncentivesPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/ecosystem-fund") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <EcosystemFundPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/partnership-program") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <PartnershipProgramPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/marketing-program") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <MarketingProgramPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/strategic-partner") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <StrategicPartnerPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/advisor-program") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <AdvisorProgramPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/seed-round") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <SeedRoundPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/private-round") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <PrivateRoundPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/public-round") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <PublicRoundPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/launchpad") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <LaunchpadPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/coinlist") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <CoinListPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/dao-maker") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <DAOMakerPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  if (location === "/nft-marketplace" || location.startsWith("/nft-marketplace")) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <NftMarketplaceStandalone />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  // /vc route requires full App (VCTestMode page) - trigger full page reload
  if (location === "/vc" || location.startsWith("/vc-test")) {
    window.scrollTo(0, 0);
    window.location.href = location;
    return null;
  }
  
  // /app/* routes require full App - trigger full page reload for authenticated DeFi pages
  if (location.startsWith("/app")) {
    window.scrollTo(0, 0);
    window.location.href = location;
    return null;
  }

  if (location.startsWith("/learn")) {
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <LearnRoutes />
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/developers")) {
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <DeveloperRoutes />
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/solutions")) {
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <SolutionsRoutes />
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/use-cases")) {
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <UseCasesRoutes />
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/rpc")) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <RpcRoutes />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/testnet-rpc")) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <TestnetRpcRoutes />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (location === "/validator") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <NetworkRoutes />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (location === "/validator/infrastructure" || location === "/validator-governance") {
    window.scrollTo(0, 0);
    window.location.href = location;
    return null;
  }

  if (location.startsWith("/network") || location.startsWith("/validator")) {
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <NetworkRoutes />
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/community")) {
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <CommunityRoutes />
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/legal")) {
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <LegalRoutes />
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/scan")) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <ScanRoutes />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/testnet-scan")) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <TestnetScanRoutes />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (location === "/brand") {
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <Brand />
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }

  if (location.startsWith("/token-schedule") || location.startsWith("/token-details")) {
    const TokenSchedule = lazy(() => import("@/pages/token-schedule"));
    const TokenDetails = lazy(() => import("@/pages/token-details"));
    return (
      <ErrorBoundary>
        <PublicLayout>
          <Suspense fallback={<PageLoading />}>
            <Switch>
              <Route path="/token-schedule" component={TokenSchedule} />
              <Route path="/token-details" component={TokenDetails} />
            </Switch>
          </Suspense>
        </PublicLayout>
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <PublicLayout>
        <Suspense fallback={<PageLoading />}>
          <Home />
        </Suspense>
      </PublicLayout>
    </ErrorBoundary>
  );
}
