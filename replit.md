# TBURN Blockchain Mainnet Explorer

## Recent Changes (December 4, 2024)

### Admin Portal Authentication & Dashboard Fixes
- Fixed UnifiedDashboard crash caused by null `aiStatus.models` and `validatorSummary.topValidators`
  - Added proper null checks and fallback empty arrays in useMemo hooks
- Fixed `/api/admin/ai/status` endpoint to return correct data structure matching frontend expectations
  - Response now includes: `models[]`, `totalDecisionsToday`, `avgConfidence`
- Added authentication check to admin portal layout
  - Unauthenticated users now see login page instead of blank screen
  - Login uses password-only authentication against ADMIN_PASSWORD secret
- Fixed import placement in admin-portal-layout.tsx (moved Login import to file top)

### Translation System Fixes
- Fixed critical translation issue where raw translation keys (e.g., "adminDashboard.title") were displaying instead of translated text
- Added comprehensive Korean translations for all 72 Admin Portal pages
- Added missing translation sections to ko.json:
  - adminAI (AI Orchestration system)
  - adminBridge (Bridge Dashboard)
  - adminTransfers (Bridge Transfers)
  - adminTraining (AI Training Management)
  - adminAnnouncements (System Announcements)
  - adminSecurity (Security Center)
  - adminCompliance (Compliance Monitoring)
  - adminLiquidity (Liquidity Management)
  - adminFeedback (User Feedback)
  - adminAudit (Audit Logs)
  - adminChains (Chain Management)
  - adminBridgeValidators (Bridge Validators)
  - adminAIAnalytics (AI Analytics)
  - adminAITuning (AI Tuning)
  - adminThreats (Threat Detection)
- Added missing nested keys to adminDashboard section (networkPerformance, viewDetails, validators, deflationaryRate, emergencyControls, maintenanceMode, backupRestore, governance, etc.)
- Added complete adminFinance section for Finance Overview page

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform designed to provide comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with full RTL compatibility. The platform integrates advanced AI for various functionalities, from burn optimization to governance analysis, aiming to be a leading solution in the DeFi space.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform is built with a modern web stack. The frontend leverages React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching. UI/UX emphasizes a clean design with Space Grotesk typography for text and JetBrains Mono for code, implemented using Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSocket for real-time updates. Data persistence is handled by PostgreSQL (Neon Serverless) with Drizzle ORM. Key features include a real-time dashboard with 토크노믹스 (tokenomics) analysis, comprehensive block and transaction explorers, and advanced wallet management. The system also incorporates robust token standards (TBC-20/721/1155) with quantum-resistant signatures, a multi-chain bridge with AI risk assessment, and an AI-driven governance system. Staking mechanisms include tiered APY structures and AI predictions. DeFi functionalities span a DEX with multiple AMM curves, lending protocols with dynamic interest rates, yield farming, liquid staking, and NFT marketplaces/launchpads. A GameFi hub integrates various gaming projects. Network operations are managed through detailed validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Developer tools include smart contract interaction and a transaction simulator. Administrative and operator portals provide extensive control over the network, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting.

## External Dependencies
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM
- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn UI
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query v5
- **Routing**: Wouter
- **Real-time Communication**: `ws` (WebSocket library)
- **AI Services**: Anthropic Claude, OpenAI GPT, Google Gemini
- **Charting**: Recharts
- **Validation**: Zod
- **Authentication**: `express-session`, `bcryptjs`