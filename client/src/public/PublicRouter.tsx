import { Switch, Route, useLocation } from "wouter";
import { Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { PublicLayout } from "./components/PublicLayout";
import VCLayout from "./components/VCLayout";
import { ErrorBoundary } from "@/components/error-boundary";
import { lazyWithRetry } from "@/lib/dynamic-import-retry";

function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  return <PageLoading />;
}

const Home = lazyWithRetry(() => import("./pages/Home"));
const Login = lazyWithRetry(() => import("@/pages/login"));
const Signup = lazyWithRetry(() => import("@/pages/signup"));
const TokenGenerator = lazyWithRetry(() => import("@/pages/token-generator"));
const TreePage = lazyWithRetry(() => import("@/pages/tree"));

const AirdropPage = lazyWithRetry(() => import("@/pages/airdrop"));
const AirdropClaimPage = lazyWithRetry(() => import("@/pages/airdrop-claim"));
const ReferralPage = lazyWithRetry(() => import("@/pages/referral"));
const EventsPage = lazyWithRetry(() => import("@/pages/events"));
const FoundersPage = lazyWithRetry(() => import("@/pages/founders"));
const CommunityProgramPage = lazyWithRetry(() => import("@/pages/community-program"));
const DAOGovernancePage = lazyWithRetry(() => import("@/pages/dao-governance"));
const BlockRewardsPage = lazyWithRetry(() => import("@/pages/block-rewards"));
const ValidatorIncentivesPage = lazyWithRetry(() => import("@/pages/validator-incentives"));
const ExternalValidatorProgramPage = lazyWithRetry(() => import("@/pages/external-validator-program"));
const ExternalValidatorSoftwarePage = lazyWithRetry(() => import("@/pages/external-validator-software"));
const ValidatorRegistrationPage = lazyWithRetry(() => import("@/pages/validator-registration"));
const EcosystemFundPage = lazyWithRetry(() => import("@/pages/ecosystem-fund"));
const PartnershipProgramPage = lazyWithRetry(() => import("@/pages/partnership-program"));
const MarketingProgramPage = lazyWithRetry(() => import("@/pages/marketing-program"));
const StrategicPartnerPage = lazyWithRetry(() => import("@/pages/strategic-partner"));
const AdvisorProgramPage = lazyWithRetry(() => import("@/pages/advisor-program"));
const SeedRoundPage = lazyWithRetry(() => import("@/pages/seed-round"));
const PrivateRoundPage = lazyWithRetry(() => import("@/pages/private-round"));
const PublicRoundPage = lazyWithRetry(() => import("@/pages/public-round"));
const LaunchpadPage = lazyWithRetry(() => import("@/pages/launchpad"));
const CoinListPage = lazyWithRetry(() => import("@/pages/coinlist"));
const DAOMakerPage = lazyWithRetry(() => import("@/pages/dao-maker"));
const StakingDashboard = lazyWithRetry(() => import("@/pages/staking"));

const LearnRoutes = lazyWithRetry(() => import("./routes/LearnRoutes"));
const DeveloperRoutes = lazyWithRetry(() => import("./routes/DeveloperRoutes"));
const SolutionsRoutes = lazyWithRetry(() => import("./routes/SolutionsRoutes"));
const UseCasesRoutes = lazyWithRetry(() => import("./routes/UseCasesRoutes"));
const NetworkRoutes = lazyWithRetry(() => import("./routes/NetworkRoutes"));
const CommunityRoutes = lazyWithRetry(() => import("./routes/CommunityRoutes"));
const LegalRoutes = lazyWithRetry(() => import("./routes/LegalRoutes"));
const ScanRoutes = lazyWithRetry(() => import("./routes/ScanRoutes"));
const TestnetScanRoutes = lazyWithRetry(() => import("./routes/TestnetScanRoutes"));
const RpcRoutes = lazyWithRetry(() => import("./routes/RpcRoutes"));
const TestnetRpcRoutes = lazyWithRetry(() => import("./routes/TestnetRpcRoutes"));
const NftMarketplaceStandalone = lazyWithRetry(() => import("@/pages/nft-marketplace-standalone"));

const Brand = lazyWithRetry(() => import("./pages/Brand"));
const VCTestMode = lazyWithRetry(() => import("@/pages/vc-test-mode"));
const UserPage = lazyWithRetry(() => import("@/pages/user"));
const TokenSchedule = lazyWithRetry(() => import("@/pages/token-schedule"));
const TokenDetails = lazyWithRetry(() => import("@/pages/token-details"));
const NotFound = lazyWithRetry(() => import("@/pages/not-found"));

function LoginPage() {
  const handleLoginSuccess = () => {
    const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/app/dashboard";
    sessionStorage.removeItem("redirectAfterLogin");
    window.location.href = redirectUrl;
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
  
  if (location === "/signup") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Signup />
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
  
  // Redirect legacy routes to scan routes
  if (location === "/blocks" || location.startsWith("/blocks/")) {
    return <ExternalRedirect to={location.replace("/blocks", "/scan/blocks")} />;
  }
  
  if (location === "/transactions" || location.startsWith("/transactions/")) {
    const newPath = location.replace("/transactions", "/scan/txs");
    return <ExternalRedirect to={newPath} />;
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
  
  if (location === "/founders") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <FoundersPage />
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
  
  if (location === "/external-validator-program") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <ExternalValidatorProgramPage />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (location === "/external-validator-software") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <ExternalValidatorSoftwarePage />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (location === "/validator-registration") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <ValidatorRegistrationPage />
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
  
  if (location === "/staking") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <StakingDashboard />
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
  
  // /vc route - VC investor page (public, no auth required)
  // CRITICAL: VCLayout is a regular import, VCTestMode is lazy-loaded from top-level
  // This prevents the nested lazy component black screen issue
  if (location === "/vc" || location.startsWith("/vc-test")) {
    return (
      <ErrorBoundary>
        <VCLayout>
          <Suspense fallback={<PageLoading />}>
            <VCTestMode />
          </Suspense>
        </VCLayout>
      </ErrorBoundary>
    );
  }
  
  // /app/* routes are handled by RootRouter in App.tsx
  if (location.startsWith("/app")) {
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

  if (location === "/websocket" || location === "/network/websocket") {
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

  if (location === "/testnet-websocket" || location === "/network/testnet-websocket") {
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

  if (location === "/validator") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <NetworkRoutes />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (location === "/network") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <NetworkRoutes />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // /validator/infrastructure and /validator-governance are handled by RootRouter in App.tsx
  if (location === "/validator/infrastructure" || location === "/validator-governance") {
    return null;
  }

  // Validator detail pages (/validator/0x...) render as standalone without navigation
  const isValidatorDetailPage = location.startsWith("/validator/") && 
    location !== "/validator/infrastructure" && 
    !location.startsWith("/validator/governance");
  
  if (isValidatorDetailPage) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <NetworkRoutes />
        </Suspense>
      </ErrorBoundary>
    );
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

  // Static HTML pages - redirect to full page load
  if (location === "/vision" || location === "/whitepaper" || location === "/technical-whitepaper") {
    return <ExternalRedirect to={location} />;
  }

  // App pages - redirect to full page load (these are handled by authenticated router)
  if (location.startsWith("/app")) {
    return <ExternalRedirect to={location} />;
  }

  // User dashboard page - standalone without PublicLayout header
  if (location === "/user" || location.startsWith("/user?")) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <UserPage />
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
    // Token schedule and details are standalone pages without PublicLayout header/footer
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Switch>
            <Route path="/token-schedule" component={TokenSchedule} />
            <Route path="/token-details" component={TokenDetails} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  // Home page for root path only
  if (location === "/" || location === "") {
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
  
  // 404 for unmatched routes
  return (
    <ErrorBoundary>
      <PublicLayout>
        <Suspense fallback={<PageLoading />}>
          <NotFound />
        </Suspense>
      </PublicLayout>
    </ErrorBoundary>
  );
}
