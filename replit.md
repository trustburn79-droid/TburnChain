# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform providing comprehensive insights into the TBURN Mainnet. It features extensive public and authenticated application pages, supporting 12 languages with full RTL compatibility. The platform integrates advanced AI for various functionalities, from burn optimization to governance analysis, aiming to be a leading solution in the DeFi space. Key capabilities include a real-time dashboard with tokenomics analysis, block and transaction explorers, and advanced wallet management. The system supports robust token standards (TBC-20/721/1155) with quantum-resistant signatures, a multi-chain bridge with AI risk assessment, and an AI-driven governance system. It also incorporates staking mechanisms, DeFi functionalities (DEX, lending, yield farming, liquid staking, NFT marketplaces), and a GameFi hub. Network operations are managed through detailed validator and member dashboards, BFT consensus visualization, and dynamic AI-driven sharding. Administrative and operator portals provide extensive control, including real-time health monitoring, AI orchestration, security audits, and comprehensive reporting.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture
The platform is built with a modern web stack. The frontend leverages React 18, TypeScript, Vite, Wouter for routing, and TanStack Query v5 for data fetching. UI/UX emphasizes a clean design with Space Grotesk typography for text and JetBrains Mono for code, implemented using Shadcn UI and Tailwind CSS. The backend is an Express.js application providing REST APIs and WebSocket for real-time updates. Data persistence is handled by PostgreSQL (Neon Serverless) with Drizzle ORM.

Key architectural decisions include:
- **Dynamic Shard Management**: Enterprise Shard Management System allows dynamic scaling of shards (5-64) and validators, with transactional updates, rollback capabilities, and comprehensive audit logging.
  - **Integration Architecture**: Admin Portal (`/admin/shards`) configures shards via `/api/admin/shards/config`, while public pages (`/app/sharding`) display data from `/api/shards` (enterprise node proxy).
  - **Real-time Sync**: WebSocket channel `shards_snapshot` broadcasts updates to all connected clients when admin changes configuration.
  - **Unified API**: Single `/api/shards` endpoint proxies to TBurnEnterpriseNode (port 8545) for dynamic shard generation based on current config.
- **Unified AI Model Configuration**: Utilizes a Quad-Band AI System with Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 (fallback), ensuring consistent AI model usage across Admin Portal and public applications. Includes automatic fallback activation logic and health check integration.
- **Comprehensive Bilingual Support**: Full Korean and English translation system covering all Admin Portal pages (17,000+ keys) and public pages.
- **Standardized UI Components**: Utilizes `MetricCard` component, skeleton loading states, error boundaries with retry, and export functionality (CSV/JSON).
- **API Data Handling**: Consistent pattern for rendering icons from API data using `categoryIconMap` and `getIconComponent` helper functions.
- **Enhanced Security**: Access control, audit logging, and threat detection integrated into the Admin Portal.
- **Developer Tools**: Debugging, testnet interaction, and smart contract tools.
- **Governance**: Supports proposal management within the Admin Portal.
- **Reusable Admin Components**: Five production-ready components for Admin Portal CRUD operations:
  - `DetailSheet`: Multi-section detail view with field types (text, badge, progress, code, link, status) and copyable fields
  - `AdminFormDialog`: Form dialog with validation for Add/Edit operations
  - `ConfirmationDialog`: Destructive action confirmations with customizable variants
  - `ActionMenu`: Dropdown action menu supporting separators and variants
  - `StatusBadge`: Status indicator component for node/validator states

## Recent Changes (December 2024)
- **Timezone Standardization (December 6, 2024)**: All date/time displays across the application now use New York timezone (America/New_York) instead of local browser timezone
  - Central formatting utilities updated in `client/src/lib/format.ts` and `client/src/lib/formatters.ts`
  - Added `DEFAULT_TIMEZONE = 'America/New_York'` constant for consistent timezone usage
  - Updated 40+ files with date/time formatting to use the new timezone standard
  - Includes admin portal, public pages, operator pages, and all DeFi components
- **Authentication Fix (December 6, 2024)**: Fixed admin login password (admin7979) and resolved Korean input mode issues
- **AI Pages Enhancement (Phase 5)**: All 4 AI pages fully enhanced with production-level features
  - `ai-orchestration.tsx`: DetailSheet (3 sections: Overview, Performance, Configuration), ConfirmationDialog (sync models), View/Sync buttons
  - `ai-analytics.tsx`: DetailSheet (2 sections: Overview, Analysis), ConfirmationDialog (export report), View buttons for outcomes
  - `ai-training.tsx`: DetailSheet (2 sections: Overview, Progress), ConfirmationDialog (cancel jobs), View button for training jobs
  - `ai-tuning.tsx`: DetailSheet (2 sections: Overview, Parameters), ConfirmationDialog (save/reset parameters), View buttons for models
  - 100+ bilingual translation keys added for detail views and confirmation dialogs
- **Economics/Token Pages Enhancement (Phase 4)**: All 4 pages fully enhanced with production-level features
  - `token-issuance.tsx`: DetailSheet (3 sections), ConfirmationDialog (pause/resume tokens)
  - `burn-control.tsx`: DetailSheet (2 sections), ConfirmationDialog (pause/resume schedules, save settings)
  - `economics.tsx`: DetailSheet for metrics, ConfirmationDialog for parameter updates
  - `treasury.tsx`: DetailSheet (2 sections), ConfirmationDialog (cancel transactions, confirm transfers)
  - 70+ bilingual translation keys added for detail views and confirmation dialogs
- **Validator Management Enhancement**: Added 4-section detail sheet (Basic Info, Performance, Staking, AI Analysis), CRUD operations with confirmation dialogs, Unjail/Slash actions, comprehensive bilingual translations (70+ new keys)
- **Node Management Enhancement**: Production-ready with detail views, Add/Edit dialogs, node control actions (restart/stop/start)

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
- **AI Services**: Anthropic Claude, OpenAI GPT, Google Gemini, xAI Grok
- **Charting**: Recharts
- **Validation**: Zod
- **Authentication**: `express-session`, `bcryptjs`