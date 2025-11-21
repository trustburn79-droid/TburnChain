# TBURN Blockchain Mainnet - Design Guidelines

## Design Approach

**Reference-Based Strategy:** Draw inspiration from leading blockchain explorers (Etherscan, Solscan, Dune Analytics) combined with Material Design for data-intensive enterprise applications. The design prioritizes information density, real-time data clarity, and technical sophistication while maintaining modern aesthetics.

**Core Principle:** Professional blockchain platform with emphasis on data transparency, real-time monitoring, and technical excellence.

## Typography System

**Primary Font:** Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- Data/Numbers: 500 weight, tabular-nums for alignment
- Code/Addresses: 'IBM Plex Mono' for blockchain addresses, hashes

**Scale:**
- Hero/Page Titles: text-4xl to text-5xl
- Section Headers: text-2xl to text-3xl
- Card Titles: text-lg to text-xl
- Body Text: text-sm to text-base
- Metrics/Stats: text-3xl to text-4xl (for large numbers)
- Table Data: text-sm
- Labels: text-xs to text-sm

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component gaps: gap-4, gap-6
- Section padding: p-6, p-8, p-12
- Card spacing: p-4, p-6
- Grid gaps: gap-4, gap-6

**Grid Structure:**
- Main dashboard: 12-column grid
- Stat cards: grid-cols-2 lg:grid-cols-4
- Data tables: full-width with horizontal scroll
- Sidebar navigation: 240px fixed width
- Content area: max-w-7xl mx-auto

## Component Library

### Navigation
**Sidebar Navigation:**
- Fixed left sidebar (240px) with collapsible mobile overlay
- Logo at top with network status indicator
- Menu items with icons (Heroicons)
- Active state with accent border-left
- Grouped sections: Explorer, Network, AI, Validators, Admin

**Top Bar:**
- Search bar (centered, 480px max-width) for addresses/transactions/blocks
- Network selector dropdown (Mainnet/Testnet)
- Wallet connect button (top-right)
- Real-time stats ticker (TPS, Block Height, Active Validators)

### Dashboard Cards
**Stat Cards:**
- Rounded corners (rounded-lg)
- Elevation with shadow-md
- Icon in top-left (32px, accent tone)
- Large metric value (text-3xl, font-semibold)
- Label below (text-sm, muted)
- Trend indicator (↑↓ with percentage)
- Subtle background gradient on hover

**Data Tables:**
- Sticky header row
- Alternating row backgrounds for readability
- Monospace font for addresses (truncated with copy button)
- Status badges (rounded-full, small)
- Pagination controls at bottom
- Sortable columns with indicators
- Row hover state with subtle elevation

### Blockchain Explorer Components
**Block/Transaction Cards:**
- Compact list view with essential data
- Expandable details on click
- Timestamp (relative + absolute on hover)
- Status indicators (Success/Pending/Failed)
- Gas/Fee information
- Link icons for related entities

**Address Pages:**
- Balance displayed prominently at top
- Transaction history table
- Token holdings grid
- QR code for address (collapsible section)

### AI Orchestration Panel
**Model Status Grid:**
- 3-column layout (GPT-5, Claude, Llama)
- Live status indicators (green dot for active)
- Request count meters
- Response time charts (mini sparklines)
- Cost tracking per model
- Load distribution visualization (donut chart)

**Request Router:**
- Real-time request flow diagram
- Model selection logic display
- Cache hit rate metrics
- API usage graphs (Chart.js line charts)

### Validator Dashboard
**Validator List:**
- Table with: Name, Status, Stake, Commission, APY, Uptime
- Filter/sort controls
- Detailed view modal for each validator
- Voting power visualization (horizontal bars)
- Delegation interface

**Network Consensus View:**
- Live block production timeline
- Active validator carousel
- Voting status indicators
- Quorum progress bars

### Data Visualization
**Charts (Chart.js):**
- Line charts: TPS over time, Network activity
- Bar charts: Transaction volume by type
- Donut charts: Transaction status distribution, Shard load
- Area charts: Gas price trends
- Use consistent accent tones, gridlines for readability

### Forms & Interactions
**Transaction Simulator:**
- Step-by-step wizard layout
- Input validation with inline errors
- Preview card before execution
- Loading states with skeleton screens
- Success/Error modals with transaction hash

**Search:**
- Autocomplete suggestions
- Recent searches
- Entity type indicators (Block/TX/Address)

### Real-time Elements
**Live Update Indicators:**
- Pulsing dot for live data
- "Updated X seconds ago" timestamps
- WebSocket connection status in footer
- Auto-refresh toggles on data-heavy pages

### Modals & Overlays
- Centered modals with backdrop blur
- Close button (top-right)
- Max-width: max-w-2xl
- Smooth slide-in animations (duration-200)

## Animations

**Minimal & Purposeful:**
- Page transitions: Fade-in only (duration-150)
- Hover states: Scale 1.02 on cards, no color transitions
- Loading: Subtle pulse on skeleton screens
- Data updates: Brief highlight flash (duration-300)
- **No** scroll-triggered animations
- **No** complex hero animations

## Images

**Iconography Only:**
- Use Heroicons throughout (outline style primarily)
- No decorative images or illustrations
- Network/chain logo in top navigation (40px height)
- Validator avatars (generated from address, 32px)

**No Hero Image:** This is a data-focused application - lead immediately with live network statistics and explorer search.

## Page Structure Examples

**Homepage (Explorer Dashboard):**
1. Top stats ticker (TPS, Latest Block, Validators, Market Cap)
2. Search bar (prominent, centered below ticker)
3. Grid of 4 stat cards (24h Transactions, Active Addresses, Total Value Locked, Avg Block Time)
4. Two-column layout:
   - Left: Latest Blocks (scrolling list, 10 items)
   - Right: Latest Transactions (scrolling list, 10 items)
5. Network Activity Chart (full-width)

**AI Orchestration Page:**
1. Model status cards (3-column grid)
2. Request routing diagram
3. Performance metrics (4-column stat grid)
4. API usage charts (2-column)
5. Cost analysis table

**Validator Page:**
1. Network consensus overview card
2. Validator statistics (total count, stake distribution)
3. Validators table (full-width, paginated)
4. Staking calculator sidebar widget

## Technical Specifications

- Icons: Heroicons (via CDN)
- Charts: Chart.js
- Tables: Custom styled with Tailwind
- Responsive breakpoints: sm, md, lg, xl, 2xl
- All data tables horizontally scrollable on mobile
- Sidebar collapses to hamburger menu on mobile