# TBURN Blockchain Mainnet Explorer

## Overview
The TBURN Blockchain Mainnet Explorer is a production-ready DeFi ecosystem platform that visualizes all 7 core patent technologies of TBURN v7.0. It features extensive public and authenticated application pages, comprehensive 12-language internationalization with full RTL support, offering a robust and scalable solution for the DeFi space.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes to the codebase. Ensure all new features have comprehensive test coverage. Do not make changes to files within the `shared/` directory without explicit approval.

## System Architecture

### UI/UX Decisions
- **Typography**: Space Grotesk for headings/body, JetBrains Mono for terminal/code elements.
- **Color Scheme**: Blue-toned professional aesthetic with full dark mode support.
- **Components**: Shadcn UI with custom hover/active states, consistent spacing, and `rounded-md` border radii.
- **Data Visualization**: Recharts for all charts and graphs.

### Technical Implementations
- The platform supports 56 public pages for marketing and information, and 47 authenticated application pages for the DeFi platform.
- It features comprehensive enterprise-quality 12-language internationalization (en, ko, zh, ja, hi, es, fr, ar, bn, ru, pt, ur) with full RTL support for Arabic and Urdu.
- Key DeFi features include:
    - **DEX/AMM**: Supports 4 curve types (Constant-Product, Stable Swap, Concentrated Liquidity, Weighted Pools) with AI routing and MEV protection.
    - **Lending**: Utilizes a Jump Rate model with Variable/Stable rates, Health Factor monitoring, and liquidation mechanisms.
    - **Staking**: Offers 5 pool tiers with varying APY boosts and lock periods, incorporating AI APY prediction.
    - **Cross-Chain Bridge**: Facilitates multi-chain transfers with liquidity pools, validators, and AI risk assessment.
    - **AI Governance**: Analyzes proposals using Claude 4.5 Sonnet, providing economic and security impact assessments.
    - **Token System**: Supports TBC-20/721/1155 standards with quantum-resistant signatures and AI burn optimization.
- **AI Integration (Triple-Band AI)**: Incorporates GPT-5 for NLP, Claude 4.5 Sonnet for analytical tasks, and Llama 4 for lightweight inference. AI is also used for node health monitoring (Trend Analysis, Anomaly Detection, Pattern Matching, Timeseries Forecasting) and APY prediction.
- **Security Features**: Includes session-based authentication with rate limiting, operator-protected routes, real-time threat monitoring, security audits, and quantum-resistant token signatures.

### Feature Specifications
- **Explorer Group**: Dashboard with real-time stats, tokenomics, DeFi metrics, recent blocks/transactions, and detailed views for blocks, transactions, and wallets.
- **Token V4 Group**: Comprehensive token management, cross-chain bridging with AI risk assessment, AI governance with proposal analysis, and auto-burn mechanics.
- **Staking Group**: Staking dashboard with multiple tiers, APY predictions, rewards center, and a Staking SDK.
- **DeFi Group**: Decentralized exchange, liquidity pools, lending, yield farming, liquid staking, NFT marketplace, NFT launchpad, and a GameFi hub.
- **Network Group**: Validator management with AI-Enhanced Committee BFT, member management, consensus visualization, AI orchestration, sharding, and cross-shard transaction routing.
- **Developer Group**: Smart contract interaction, transaction simulator, and universal search.
- **Admin Group**: API key management and an admin panel for health monitoring and mainnet control.
- **Security Group**: Node health monitoring with AI algorithms and performance metrics.
- **Operator Group**: Protected dashboard for network overview, member management, validator applications, security audits, compliance reports, and staking pool management.

## External Dependencies
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Shadcn UI, Tailwind CSS
- **Data Fetching**: TanStack Query v5
- **Routing**: Wouter
- **Real-time Communication**: `ws` library (WebSocket)
- **AI Services**: Anthropic Claude, OpenAI GPT, Google Gemini
- **Charting**: Recharts
- **Validation**: Zod
- **Authentication**: `express-session`, `bcryptjs`